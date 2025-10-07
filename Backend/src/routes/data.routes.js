const express = require('express');
const router = express.Router();
const dataController = require('../controllers/data.controller');

// When a POST request is made to the root of this router ('/'),
// it will be handled by the 'saveData' function in the controller.
router.post('/', dataController.saveData);

module.exports = router;