// validators/employee.validator.js
const { validate } = require('../middleware/validate');

const createEmployeeSchema = {
  body: {
    name:     { required: true, type: 'string', minLength: 2 },
    email:    { required: true, type: 'string', isEmail: true },
    department: { required: true, type: 'string' },
    role:     { required: true, type: 'string' },
    joiningDate: { required: true, type: 'string' },
    status:   { required: true, type: 'string' },
    performanceScore: { required: false, type: 'number', min: 0 }
  }
};

const updateEmployeeSchema = {
  body: {
    name:     { required: false, type: 'string', minLength: 2 },
    email:    { required: false, type: 'string', isEmail: true },
    department: { required: false, type: 'string' },
    role:     { required: false, type: 'string' },
    joiningDate: { required: false, type: 'string' },
    status:   { required: false, type: 'string' },
    performanceScore: { required: false, type: 'number', min: 0 }
  }
};

// Export the middleware directly
module.exports = {
  create: validate(createEmployeeSchema),
  update: validate(updateEmployeeSchema)
};