const express = require('express')
const router = express.Router()
const userController = require('../controllers/user.controller')
const authController = require('../controllers/auth.controller')

router.post(
  '/user',
  userController.validateUser,
  userController.checkUniqueEmail,
  userController.addUser
)

router.get('/user', authController.validateToken, userController.getAllUsers)

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
  userController.checkUniqueEmail,
  userController.updateUser
)

// router.delete('/user/all', userController.deleteAll)

// router.post('/user/all', userController.addAll)

router.delete(
  '/user/:id',
  authController.validateToken,
  userController.deleteUser
)

module.exports = router
