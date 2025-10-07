const express = require('express');
const router = express.Router();
const dataController = require('../controllers/data.controller');

// When a POST request is made to the root of this router ('/'),
// it will be handled by the 'saveData' function in the controller.
router.post('/', dataController.saveData);

// Fetch the most recent analysis document
router.get('/latest', dataController.getLatest);

// List all analysis documents (newest first)
router.get('/', dataController.getAll);

// Fetch a specific analysis by id
router.get('/:id', dataController.getById);

module.exports = router;