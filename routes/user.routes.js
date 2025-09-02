const express = require('express');
const router = express.Router();
const users = require('../controllers/user.controller.js');
// Create a new User
router.post('/users', users.create);

// Retrieve all Users
router.get('/users', users.findAll);

// Retrieve a single User with userId
router.get('/users/:userId', users.findOne);

// Update a User with userId
router.put('/users/:userId', users.update);

// Delete a User with userId
router.delete('/users/:userId', users.delete);

// Delete all Users
router.delete('/users', users.deleteAll);

// Find all unchecked Users
router.get('/users/unchecked', users.findAllUnchecked);

// Find all checked Users
router.get('/users/checked', users.findAllChecked);

// Update the checked status of a User identified by the userId in the request
router.put('/users/:userId/checked', users.updateCheckedStatus);

module.exports = router;