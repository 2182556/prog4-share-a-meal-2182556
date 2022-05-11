const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

router.post(
  '/api/user',
  userController.validateUser,
  userController.checkUniqueEmail,
  userController.addUser
);

router.get('/api/user', userController.getAllUsers);

router.get('/api/user/profile', userController.getUserProfile);

router.get('/api/user/:id', userController.getUserById);

router.put(
  '/api/user/:id',
  userController.checkUniqueEmail,
  userController.updateUser
);

router.delete('/api/user/:id', userController.deleteUser);

module.exports = router;
