/**
 * Zod validation middleware factory
 * @param {import('zod').ZodSchema} schema 
 * @param {'body' | 'query' | 'params'} property 
 */
function validate(schema, property = 'body') {
  return (req, res, next) => {
    try {
      const parsed = schema.safeParse(req[property]);
      if (!parsed.success) {
        const errorMessages = parsed.error.issues.map(
          (issue) => `${issue.path.join('.') || 'field'}: ${issue.message}`
        );
        return res.status(400).json({
          success: false,
          message: errorMessages[0] || 'Validation failed',
          errors: errorMessages
        });
      }
      req[property] = parsed.data;
      next();
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input format',
        error: err.message
      });
    }
  };
}

module.exports = validate;

