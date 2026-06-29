import { z } from "zod";

const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      params: req.params,
      query: req.query,
    });
    req.body = parsed.body ?? req.body;
    next();
  } catch (err) {
    if (err instanceof z.ZodError) {
      const issues = err.issues || err.errors || [];
      const messages = issues.map((e) => `${e.path.join(".")}: ${e.message}`);
      return res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: messages.join("; "),
      });
    }
    next(err);
  }
};

export default validate;
