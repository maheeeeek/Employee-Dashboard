const service = require('../services/employee.service');
const { query } = require('express'); // not needed actually

// Helper: safe integer parser
const toInt = (value, defaultValue) => {
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

// Optional: simple query schema (replace with Joi/Zod in real app)
const validateListQuery = (q) => {
  return {
    search: typeof q.search === 'string' ? q.search.trim() : undefined,
    department: typeof q.department === 'string' ? q.department : undefined,
    status: typeof q.status === 'string' ? q.status : undefined,
    dateFrom: q.dateFrom || undefined,
    dateTo: q.dateTo || undefined,
    showArchived: q.showArchived === 'true',
    page: Math.max(1, toInt(q.page, 1)),
    limit: Math.min(100, Math.max(1, toInt(q.limit, 10))), // prevent huge limits
    sortField: typeof q.sortField === 'string' && q.sortField.match(/^[a-zA-Z_]+$/) 
               ? q.sortField : 'createdAt',
    sortOrder: q.sortOrder === 'desc' ? -1 : 1
  };
};

async function create(req, res) {
  try {
    const emp = await service.createEmployee(req.body);
    return res.status(201).json(emp);
  } catch (err) {
    // Let centralized error handler deal with it
    throw err;
  }
}

async function list(req, res) {
  const q = validateListQuery(req.query);
  const data = await service.listEmployees(q);
  return res.json(data);
}

async function getOne(req, res) {
  const { id } = req.params;
  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  const emp = await service.getEmployeeById(id);
  if (!emp) return res.status(404).json({ message: 'Employee not found' });

  return res.json(emp);
}

async function update(req, res) {
  const { id } = req.params;
  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  const emp = await service.updateEmployee(id, req.body);
  if (!emp) return res.status(404).json({ message: 'Employee not found' });

  return res.json(emp);
}

async function archive(req, res) {
  const { id } = req.params;
  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  const emp = await service.archiveEmployee(id);
  if (!emp) return res.status(404).json({ message: 'Employee not found' });

  return res.json({ message: 'Employee archived', emp });
}

async function restore(req, res) {
  const { id } = req.params;
  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  const emp = await service.restoreEmployee(id);
  if (!emp) return res.status(404).json({ message: 'Employee not found or not archived' });

  return res.json({ message: 'Employee restored', emp });
}

module.exports = {
  create,
  list,
  getOne,
  update,
  archive,
  restore
};