const dbconnection = require('../../database/dbconnection')
const joi = require('joi')
const { logger } = require('../config/config')

const mealSchema = joi.object({
  name: joi.string().required(),
  description: joi.string().required(),
  isActive: joi.boolean().required(),
  isVega: joi.boolean().default(true),
  isVegan: joi.boolean().default(true),
  isToTakeHome: joi.boolean().required(),
  dateTime: joi.string().required(),
  imageUrl: joi.string().required(),
  allergenes: joi
    .array()
    .required()
    .items(joi.string().valid('gluten', 'lactose', 'noten', '')),
  maxAmountOfParticipants: joi.number().required(),
  price: joi.number().required(),
})

module.exports = {
  validateMeal: (req, res, next) => {
    logger.info('validateMeal called')

    const { error, value } = mealSchema.validate(req.body)
    if (error) return next({ status: 400, message: error.message })

    req.validatedMeal = value
    return next()
  },
  addMeal: (req, res, next) => {
    console.log('addMeal called')
    let meal = req.validatedMeal

    dbconnection.getConnection((err, connection) => {
      if (err) {
        return next({ status: 500, message: err.message })
      }
      let formattedDateTime = new Date(meal.dateTime)
        .toISOString()
        .slice(0, 19)
        .replace('T', ' ')

      connection.query(
        'INSERT INTO meal (name,description,isActive,isVega,isVegan,isToTakeHome,dateTime,imageUrl,allergenes,maxAmountOfParticipants,price,cookId) VALUES(?,?,?,?,?,?,?,?,?,?,?,?);',
        [
          meal.name,
          meal.description,
          meal.isActive,
          meal.isVega,
          meal.isVegan,
          meal.isToTakeHome,
          formattedDateTime,
          meal.imageUrl,
          meal.allergenes.toString(),
          meal.maxAmountOfParticipants,
          meal.price,
          req.userId,
        ],
        (error, results, fields) => {
          connection.release()

          if (error) {
            return next({ status: 500, message: error.sqlMessage })
          }

          connection.query(
            'SELECT LAST_INSERT_ID() as mealId;',
            (error, results, fields) => {
              connection.release()
              if (error) {
                return next({ status: 500, message: error.sqlMessage })
              }

              connection.query(
                'INSERT INTO meal_participants_user VALUES (?,?)',
                [results[0].mealId, req.userId],
                (error, results, fields) => {
                  connection.release()
                  if (error)
                    return next({ status: 500, message: error.sqlMessage })
                }
              )

              meal = {
                id: results[0].mealId,
                cookId: req.userId,
                ...meal,
              }
              return res.status(201).json({
                status: 201,
                result: meal,
              })
            }
          )
        }
      )
    })
  },
  getAllMeals: (req, res, next) => {
    console.log('getAllMeals called')

    dbconnection.getConnection((err, connection) => {
      if (err) return next({ status: 500, message: err.message })

      connection.query('SELECT * FROM meal', (error, results, fields) => {
        connection.release()

        if (error) {
          return next({ status: 500, message: error.sqlMessage })
        }
        results.forEach((i) => {
          i.isActive = i.isActive ? true : false
          i.isToTakeHome = i.isToTakeHome ? true : false
          i.isVega = i.isVega ? true : false
          i.isVegan = i.isVegan ? true : false
        })
        return res.status(200).json({
          status: 200,
          result: results,
        })
      })
    })
  },
  getMealById: (req, res, next) => {
    console.log('getMealById called')
    const id = req.params.id

    dbconnection.getConnection((err, connection) => {
      if (err) {
        return next({ status: 500, message: err.message })
      }

      connection.query(
        `SELECT * FROM meal WHERE id=${id};`,
        (error, results, fields) => {
          connection.release()

          if (error) {
            return next({ status: 500, message: error.sqlMessage })
          }
          if (results.length > 0) {
            results[0].isActive = results[0].isActive ? true : false
            results[0].isToTakeHome = results[0].isToTakeHome ? true : false
            results[0].isVega = results[0].isVega ? true : false
            results[0].isVegan = results[0].isVegan ? true : false
            return res.status(200).json({
              status: 200,
              result: results[0],
            })
          } else {
            return next({ status: 404, message: `Meal could not be found` })
          }
        }
      )
    })
  },
  updateMeal: (req, res, next) => {
    logger.info('updateMeal called')

    const requiredFields = joi.object({
      name: joi.string().required(),
      maxAmountOfParticipants: joi.number().required(),
      price: joi.number().required(),
      description: joi.string(),
      isActive: joi.boolean(),
      isVega: joi.boolean(),
      isVegan: joi.boolean(),
      isToTakeHome: joi.boolean(),
      dateTime: joi.date(),
      imageUrl: joi.string(),
      allergenes: joi.array(),
    })

    const { error, value } = requiredFields.validate(req.body)
    if (error) {
      return next({ status: 400, message: error.message })
    }

    const id = req.params.id
    dbconnection.getConnection((err, connection) => {
      if (err) {
        return next({ status: 500, message: err.message })
      }

      connection.query(
        `SELECT * FROM meal WHERE id=?;`,
        [id],
        (error, results, fields) => {
          connection.release()
          if (error) {
            return next({ status: 500, message: error.sqlMessage })
          }
          if (results.length > 0) {
            if (req.userId == results[0].cookId) {
              var meal = Object.assign({}, results[0])
              const updateMealSchema = joi.object({
                name: joi.string().required(),
                description: joi.string().default(`${meal.description}`),
                isActive: joi.boolean().default(`${meal.isActive}`),
                isVega: joi.boolean().default(`${meal.isVega}`),
                isVegan: joi.boolean().default(`${meal.isVegan}`),
                isToTakeHome: joi.boolean().default(`${meal.isToTakeHome}`),
                dateTime: joi.date().default(`${meal.dateTime}`),
                imageUrl: joi.string().default(`${meal.imageUrl}`),
                allergenes: joi
                  .array()
                  .items(joi.string().valid('gluten', 'lactose', 'noten', ''))
                  .default(`${meal.allergenes}`),
                maxAmountOfParticipants: joi.number().required(),
                price: joi.number().required(),
              })

              const { error, value } = updateMealSchema.validate(req.body)
              const newDateTime = new Date(value.dateTime)
              if (error) {
                return next({ status: 400, message: error.message })
              }
              connection.query(
                `UPDATE meal SET name=?,description=?,isActive=?,isVega=?,isVegan=?,isToTakeHome=?,dateTime=?,imageUrl=?,allergenes=?,maxAmountOfParticipants=?,price=? WHERE id=?`,
                [
                  value.name,
                  value.description,
                  value.isActive,
                  value.isVega,
                  value.isVegan,
                  value.isToTakeHome,
                  newDateTime,
                  value.imageUrl,
                  value.allergenes.toString(),
                  value.maxAmountOfParticipants,
                  value.price,
                  id,
                ],
                (error, results, fields) => {
                  connection.release()

                  if (error) {
                    return next({ status: 500, message: error.sqlMessage })
                  }
                  value.isActive = value.isActive ? true : false
                  value.isToTakeHome = value.isToTakeHome ? true : false
                  value.isVega = value.isVega ? true : false
                  value.isVegan = value.isVegan ? true : false
                  let meal = {
                    id: id,
                    cookId: req.userId,
                    ...value,
                  }
                  return res.status(200).json({
                    status: 200,
                    result: meal,
                  })
                }
              )
            } else {
              return next({
                status: 403,
                message: `You are not authorized to alter this meal`,
              })
            }
          } else {
            return next({ status: 404, message: `Meal does not exist` })
          }
        }
      )
    })
  },
  deleteMeal: (req, res, next) => {
    const id = req.params.id
    dbconnection.getConnection((err, connection) => {
      if (err) {
        return next({ status: 500, message: err.message })
      }

      connection.query(
        `SELECT * FROM meal WHERE id=${id};`,
        (error, results, fields) => {
          connection.release()
          if (error) {
            return next({ status: 500, message: error.sqlMessage })
          } else {
            if (results.length > 0) {
              if (results[0].cookId == req.userId) {
                connection.query(
                  `DELETE FROM meal WHERE id=${id};`,
                  (error, results, fields) => {
                    connection.release()
                    if (error) {
                      return next({ status: 500, message: error.sqlMessage })
                    }
                    logger.info('User succesfully deleted')
                    return res.status(200).json({
                      status: 200,
                      message: `Meal with id ${id} was deleted.`,
                    })
                  }
                )
              } else {
                return next({
                  status: 403,
                  message: `You are not authorized to delete this meal`,
                })
              }
            } else {
              return next({ status: 404, message: `Meal does not exist` })
            }
          }
        }
      )
    })
  },
  participate: (req, res, next) => {
    dbconnection.getConnection((err, connection) => {
      if (err) {
        return next({ status: 500, message: err.message })
      }

      connection.query(
        'SELECT * FROM meal WHERE id=?',
        [req.params.id],
        (error, results, fields) => {
          connection.release()
          if (error) return next({ status: 500, message: error.sqlMessage })
          if (results.length > 0) {
            connection.query(
              'SELECT * FROM meal_participants_user WHERE mealId=?',
              [req.params.id],
              (error, results, fields) => {
                connection.release()
                if (error)
                  return next({ status: 500, message: error.sqlMessage })
                let numberOfParticipants = results.length
                participating = false
                results.forEach((i) => {
                  if (i.userId == req.userId) participating = true
                })
                if (results && participating) {
                  connection.query(
                    'DELETE FROM meal_participants_user WHERE mealId=? AND userId=?',
                    [req.params.id, req.userId],
                    (error, results, fields) => {
                      connection.release()
                      if (error)
                        return next({ status: 500, message: error.sqlMessage })
                      if (results.affectedRows > 0) {
                        return res.status(200).json({
                          status: 200,
                          result: {
                            currentlyParticipating: false,
                            currentAmountOfParticipants:
                              numberOfParticipants - 1,
                          },
                        })
                      }
                    }
                  )
                } else if (results && !participating) {
                  connection.query(
                    'INSERT INTO meal_participants_user VALUES (?,?)',
                    [req.params.id, req.userId],
                    (error, results, fields) => {
                      connection.release()
                      if (error)
                        return next({ status: 500, message: error.sqlMessage })
                      if (results.affectedRows > 0) {
                        return res.status(200).json({
                          status: 200,
                          result: {
                            currentlyParticipating: true,
                            currentAmountOfParticipants:
                              numberOfParticipants + 1,
                          },
                        })
                      }
                    }
                  )
                }
              }
            )
          } else {
            return next({ status: 404, message: 'Meal does not exist' })
          }
        }
      )
    })
  },
}
