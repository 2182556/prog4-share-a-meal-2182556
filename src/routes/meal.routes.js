const express = require('express')
const router = express.Router()
const mealController = require('../controllers/meal.controller')
const authController = require('../controllers/auth.controller')

router.post(
  '/meal',
  authController.validateToken,
  mealController.validateMeal,
  mealController.addMeal
)

router.get('/meal', mealController.getAllMeals)

router.get('/meal/:id', mealController.getMealById)

router.put('/meal/:id', authController.validateToken, mealController.updateMeal)

router.delete(
  '/meal/:id',
  authController.validateToken,
  mealController.deleteMeal
)

module.exports = router
