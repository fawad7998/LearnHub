import { z } from "zod";
import Message from "../models/Message.js";
import { AppError } from "../middleware/errors.js";

export async function createMessage(req, res) {
  const input = z
    .object({
      name: z.string().trim().min(2).max(80),
      email: z.email().trim().toLowerCase().max(254),
      subject: z.string().trim().min(3).max(120),
      message: z
        .string()
        .trim()
        .min(10, "Tell us a little more (at least 10 characters).")
        .max(4000),
    })
    .strict()
    .parse(req.body);
  await Message.create(input);
  res
    .status(201)
    .json({
      message: "Your message has been saved for the LearnHub administrator.",
    });
}

export async function listMessages(req, res) {
  res.json({
    messages: await Message.find().sort({ createdAt: -1 }).limit(200),
  });
}

export async function updateMessage(req, res) {
  const input = z
    .object({ status: z.enum(["new", "resolved"]) })
    .strict()
    .parse(req.body);
  const message = await Message.findByIdAndUpdate(req.params.id, input, {
    new: true,
    runValidators: true,
  });
  if (!message) throw new AppError(404, "Message not found.");
  res.json({ message });
}
