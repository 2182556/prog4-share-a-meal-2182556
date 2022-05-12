const express = require('express')
const router = express.Router()
const userController = require('../controllers/user.controller')

router.post(
  '/user',
  userController.validateUser,
  userController.checkUniqueEmail,
  userController.addUser
)

router.get('/user', userController.getAllUsers)

router.get('/user/profile', userController.getUserProfile)

router.get('/user/:id', userController.getUserById)

router.put(
  '/user/:id',
  userController.checkUniqueEmail,
  userController.updateUser
)

router.delete('/user/:id', userController.deleteUser)

module.exports = router
