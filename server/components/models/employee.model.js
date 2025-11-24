const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  department: { type: String, required: true },
  role: { type: String, required: true },
  joiningDate: { type: Date, required: true },
  status: { type: String, enum: ['Active', 'Inactive', 'On Leave'], required: true },
  isArchived: { type: Boolean, default: false },
  performanceScore: { type: Number, min: 0, max: 100, default: 0 }
}, { timestamps: true });

EmployeeSchema.index({ name: 'text', email: 'text', department: 'text', role: 'text' });

module.exports = mongoose.model('Employee', EmployeeSchema);
