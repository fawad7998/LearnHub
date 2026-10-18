export class AppError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error.type === "entity.parse.failed")
    return res
      .status(400)
      .json({ message: "The request body must contain valid JSON." });
  if (error.code === 11000)
    return res
      .status(409)
      .json({ message: "This email or enrollment already exists." });
  if (error.name === "ZodError")
    return res.status(400).json({
      message: error.issues[0]?.message || "Check your input.",
      errors: error.issues.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
  if (error.name === "ValidationError" || error.name === "CastError")
    return res
      .status(400)
      .json({ message: "Please check the supplied values." });
  if (error.code === "LIMIT_FILE_SIZE")
    return res.status(400).json({ message: "Choose a PDF smaller than 2 MB." });
  if (error.name === "MulterError")
    return res
      .status(400)
      .json({ message: "Upload one PDF using the resource field." });
  const status = error.status || 500;
  if (status >= 500)
    console.error(
      "[request failed]",
      error.name,
      error.code || "",
      error.status ? error.message : "Unexpected server error",
    );
  res.status(status).json({
    message:
      status >= 500 && !error.status
        ? "The server could not complete this request. Please try again."
        : error.message,
  });
}
