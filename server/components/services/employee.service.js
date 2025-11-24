const Employee = require('../models/employee.model');
const mongoose = require('mongoose');

async function createEmployee(data) {
  return Employee.create(data);
}

async function listEmployees({ search, department, status, dateFrom, dateTo, showArchived=false, page=1, limit=10, sortField, sortOrder }) {
  const filter = {};
  if (!showArchived) filter.isArchived = false;
  if (department) filter.department = department;
  if (status) filter.status = status;
  if (dateFrom || dateTo) {
    filter.joiningDate = {};
    if (dateFrom) filter.joiningDate.$gte = new Date(dateFrom);
    if (dateTo) filter.joiningDate.$lte = new Date(dateTo);
  }
  if (search) filter.$text = { $search: search };

  const skip = (page - 1) * limit;
  const sort = {};
  if (sortField) sort[sortField] = sortOrder === 'desc' ? -1 : 1;
  else sort.createdAt = -1;

  const [items, total] = await Promise.all([
    Employee.find(filter).sort(sort).skip(skip).limit(limit).exec(),
    Employee.countDocuments(filter)
  ]);
  return { items, total, page, limit };
}

async function getEmployeeById(id) {
  if (!mongoose.isValidObjectId(id)) return null;
  return Employee.findById(id);
}

async function updateEmployee(id, patch) {
  return Employee.findByIdAndUpdate(id, patch, { new: true, runValidators: true });
}

async function archiveEmployee(id) {
  return Employee.findByIdAndUpdate(id, { isArchived: true }, { new: true });
}

async function restoreEmployee(id) {
  return Employee.findByIdAndUpdate(id, { isArchived: false }, { new: true });
}

module.exports = { createEmployee, listEmployees, getEmployeeById, updateEmployee, archiveEmployee, restoreEmployee };
