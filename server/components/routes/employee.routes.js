// employee.routes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/employee.controllers');
const { protect, authorize } = require('../middleware/auth');
const { create, update } = require('../validators/employee.validator');



router.use(protect);
router.use(authorize('ADMIN', 'HR'));

router.post('/', create, ctrl.create);
router.get('/', ctrl.list);


router.patch('/:id/archive', ctrl.archive);
router.patch('/:id/restore', ctrl.restore);


router.get('/:id', ctrl.getOne);
router.put('/:id', update, ctrl.update);


module.exports = router;