import {
  createHash,
  createHmac,
  randomBytes,
  randomInt,
  timingSafeEqual,
} from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import { AppError } from "../middleware/errors.js";
import {
  forgotPasswordSchema,
  verifyPasswordCodeSchema,
  resetPasswordSchema,
} from "../middleware/validation.js";
import { isDemoAccount, isDemoEmail } from "../services/accountService.js";
import {
  requireMailConfiguration,
  sendPasswordCode,
} from "../services/mailService.js";

const TEN_MINUTES = 10 * 60 * 1000;
const HOUR = 60 * 60 * 1000;
const genericMessage =
  "If this is an eligible account, check your inbox and spam folder for a verification code.";
const invalidCode = () =>
  new AppError(
    400,
    "The code is invalid or expired. Check it or request a new code.",
  );
const tokenHash = (token) => createHash("sha256").update(token).digest("hex");
const codeHash = (id, nonce, code) =>
  createHmac("sha256", process.env.JWT_SECRET)
    .update(`password-reset:${id}:${nonce}:${code}`)
    .digest("hex");

function rejectDemoEmail(email) {
  if (isDemoEmail(email)) {
    throw new AppError(
      400,
      "Demo accounts keep their original passwords. Password recovery is only available for real email accounts.",
    );
  }
}

export async function forgotPassword(req, res) {
  const started = Date.now();
  const { email } = forgotPasswordSchema.parse(req.body);
  rejectDemoEmail(email);
  requireMailConfiguration();
  const user = await User.findOne({ email, isActive: true }).select(
    "+passwordReset",
  );
  if (user && !isDemoAccount(user)) {
    const now = new Date();
    const previous = user.passwordReset;
    const inWindow =
      previous?.windowStartedAt && now - previous.windowStartedAt < HOUR;
    const coolingDown =
      previous?.requestedAt && now - previous.requestedAt < 60000;
    if (!coolingDown && (!inWindow || previous.requestCount < 5)) {
      const code = String(randomInt(0, 1000000)).padStart(6, "0");
      const nonce = randomBytes(16).toString("hex");
      const reset = {
        nonce,
        codeHash: codeHash(user._id, nonce, code),
        expiresAt: new Date(now.getTime() + TEN_MINUTES),
        requestedAt: now,
        attempts: 0,
        windowStartedAt: inWindow ? previous.windowStartedAt : now,
        requestCount: inWindow ? previous.requestCount + 1 : 1,
      };
      const saved = await User.updateOne(
        {
          _id: user._id,
          isActive: true,
          isDemoAccount: { $ne: true },
          "passwordReset.requestedAt": previous?.requestedAt || {
            $exists: false,
          },
        },
        { $set: { passwordReset: reset } },
      );
      if (saved.modifiedCount === 1) {
        try {
          await sendPasswordCode(email, code);
        } catch (error) {
          await User.updateOne(
            { _id: user._id, "passwordReset.nonce": nonce },
            {
              $unset: {
                "passwordReset.codeHash": 1,
                "passwordReset.expiresAt": 1,
              },
            },
          );
          console.error(
            "[password recovery] Email delivery failed.",
            error.code || "SMTP_ERROR",
          );
        }
      }
    }
  }
  await delay(Math.max(0, 1000 - (Date.now() - started)));
  res.json({ message: genericMessage, resendAfter: 60 });
}

export async function verifyPasswordCode(req, res) {
  const { email, code } = verifyPasswordCodeSchema.parse(req.body);
  rejectDemoEmail(email);
  const now = new Date();
  const user = await User.findOneAndUpdate(
    {
      email,
      isActive: true,
      isDemoAccount: { $ne: true },
      "passwordReset.codeHash": { $exists: true },
      "passwordReset.expiresAt": { $gt: now },
      "passwordReset.attempts": { $lt: 5 },
    },
    { $inc: { "passwordReset.attempts": 1 } },
    { new: true },
  ).select("+passwordReset");
  if (!user || isDemoAccount(user)) throw invalidCode();
  const reset = user.passwordReset;
  const expected = Buffer.from(reset.codeHash, "hex");
  const supplied = Buffer.from(codeHash(user._id, reset.nonce, code), "hex");
  if (
    expected.length !== supplied.length ||
    !timingSafeEqual(expected, supplied)
  )
    throw invalidCode();

  const token = randomBytes(32).toString("hex");
  const verified = await User.updateOne(
    {
      _id: user._id,
      isActive: true,
      "passwordReset.nonce": reset.nonce,
      "passwordReset.codeHash": reset.codeHash,
      "passwordReset.attempts": { $lte: 5 },
      "passwordReset.expiresAt": { $gt: new Date() },
    },
    {
      $set: {
        "passwordReset.tokenHash": tokenHash(token),
        "passwordReset.expiresAt": new Date(Date.now() + TEN_MINUTES),
      },
      $unset: { "passwordReset.codeHash": 1 },
    },
  );
  if (verified.modifiedCount !== 1) throw invalidCode();
  res.json({
    resetToken: token,
    message: "Email verified. Choose your new password.",
  });
}

export async function resetPassword(req, res) {
  const { email, token, password } = resetPasswordSchema.parse(req.body);
  rejectDemoEmail(email);
  const filter = {
    email,
    isActive: true,
    isDemoAccount: { $ne: true },
    "passwordReset.tokenHash": tokenHash(token),
    "passwordReset.expiresAt": { $gt: new Date() },
  };
  if (!(await User.exists(filter))) {
    throw new AppError(
      400,
      "Your verification has expired. Request a new code.",
    );
  }
  const hashedPassword = await bcrypt.hash(password, 12);
  filter["passwordReset.expiresAt"] = { $gt: new Date() };
  // Consume the token and update the password in the same database operation.
  const changed = await User.updateOne(
    filter,
    {
      $set: { password: hashedPassword },
      $inc: { authVersion: 1 },
      $unset: {
        "passwordReset.codeHash": 1,
        "passwordReset.tokenHash": 1,
        "passwordReset.expiresAt": 1,
        "passwordReset.nonce": 1,
        "passwordReset.attempts": 1,
      },
    },
    { runValidators: true },
  );
  if (changed.modifiedCount !== 1) {
    throw new AppError(
      400,
      "This verification has already been used. Request a new code.",
    );
  }
  res.json({ message: "Password changed. Sign in with your new password." });
}
