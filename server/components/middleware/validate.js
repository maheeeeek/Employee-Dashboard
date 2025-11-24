// middleware/validate.js
const validate = (schema) => (req, res, next) => {
  const errors = [];

  // Validate body
  if (schema.body) {
    for (const [field, rules] of Object.entries(schema.body)) {
      const value = req.body[field];

      if (rules.required && (value === undefined || value === '')) {
        errors.push(`${field} is required`);
        continue;
      }

      if (value === undefined) continue; // skip optional fields

      if (rules.type && typeof value !== rules.type) {
        errors.push(`${field} must be a ${rules.type}`);
      }

      if (rules.minLength && value.length < rules.minLength) {
        errors.push(`${field} must be at least ${rules.minLength} characters`);
      }

      if (rules.isEmail && !/^\S+@\S+\.\S+$/.test(value)) {
        errors.push(`${field} must be a valid email`);
      }

      if (rules.min && value < rules.min) {
        errors.push(`${field} must be >= ${rules.min}`);
      }
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  next();
};

module.exports = { validate };