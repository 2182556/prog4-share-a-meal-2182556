const express = require('express')
const router = express.Router()
const userController = require('../controllers/user.controller')
const authController = require('../controllers/auth.controller')

router.post('/maxCon', userController.setMaxConnections)

router.post(
  '/user',
  userController.validateUser,
  userController.checkUniqueEmail,
  userController.addUser
)

router.get('/user', userController.getAllUsers)

router.get(
  '/user/profile',
  authController.validateToken,
  userController.getUserProfile
)

router.get(
  '/user/:id',
  authController.validateToken,
  userController.getUserById
)

router.put(
  '/user/:id',
  authController.validateToken,
  userController.checkIfUserExists,
  userController.checkUniqueEmail,
  userController.updateUser
)

router.delete(
  '/user/:id',
  authController.validateToken,
  userController.checkIfUserExists,
  userController.deleteUser
)

module.exports = router
