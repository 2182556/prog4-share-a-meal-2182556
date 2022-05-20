const dbconnection = require('../../database/dbconnection')
const Joi = require('joi')
const { logger } = require('../config/config')

const mealSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  isActive: Joi.boolean().required(),
  isVega: Joi.boolean().default('true'),
  isVegan: Joi.boolean().default('true'),
  isToTakeHome: Joi.boolean().required(),
  dateTime: Joi.string().required(),
  imageUrl: Joi.string().required(),
  allergenes: Joi.string()
    .required()
    .pattern(
      new RegExp(
        '^\\[(|"(gluten|noten|lactose)"(,("(gluten|noten|lactose)")){0,2})\\]$'
      )
    ),
  maxAmountOfParticipants: Joi.number().required(),
  price: Joi.number().required(),
})

module.exports = {
  validateMeal: (req, res, next) => {
    logger.info('validateMeal called')

    const { error, value } = mealSchema.validate(req.body)
    if (error == undefined) {
      req.validatedMeal = value
      next()
    } else {
      logger.error(error.message)
      res.status(400).json({
        status: 400,
        message: error.message,
      })
    }
  },
  addMeal: (req, res, next) => {
    console.log('addMeal called')
    let meal = req.validatedMeal
    logger.info(meal)

    dbconnection.getConnection(function (err, connection) {
      if (err) {
        logger.error('connection error')
        const conError = {
          status: 500,
          message: err.sqlMessage,
        }
        next(conError)
      }
      logger.info('logged in user', req.userId)

      connection.query(
        'INSERT INTO meal (name,description,isActive,isVega,isVegan,isToTakeHome,dateTime,imageUrl,allergenes,maxAmountOfParticipants,price,cookId) VALUES(?,?,?,?,?,?,?,?,?,?,?,?);',
        [
          meal.name,
          meal.description,
          meal.isActive,
          meal.isVega,
          meal.isVegan,
          meal.isToTakeHome,
          meal.dateTime,
          meal.imageUrl,
          meal.allergenes,
          meal.maxAmountOfParticipants,
          meal.price,
          req.userId,
        ],
        function (error, results, fields) {
          logger.info(results)

          if (error) {
            logger.error(error.sqlMessage)
            const conError = {
              status: 500,
              message: error.sqlMessage,
            }
            next(conError)
          } else {
            connection.query(
              'SELECT LAST_INSERT_ID() as mealId;',
              function (error, results, fields) {
                connection.release()
                if (error) {
                  logger.error(error.sqlMessage)
                  const conError = {
                    status: 500,
                    message: error.sqlMessage,
                  }
                  next(conError)
                }
                meal = {
                  id: results[0].mealId,
                  ...meal,
                }

                res.status(201).json({
                  status: 201,
                  result: meal,
                })
              }
            )
          }
        }
      )

      // dbconnection.end((err) => {
      //   console.log("Pool was closed.");
      // });
    })
  },
  getAllMeals: (req, res, next) => {
    console.log('getAllUsers called')

    console.log(req.query)
    let allowedParams = [
      'firstName',
      'lastName',
      'isActive',
      'emailAdress',
      'phoneNumber',
      'roles',
      'street',
      'city',
    ]
    let queryString =
      'SELECT id, firstName, lastName, IF(isActive, "true", "false") isActive, emailAdress, phoneNumber, roles, street, city FROM user'
    let queryParams = []
    if (Object.keys(req.query).length > 0) {
      queryString += ' WHERE '
      let i = 0
      for (p in req.query) {
        if (allowedParams.includes(p)) {
          if (i > 0) queryString += ' AND '
          if (p == 'isActive') {
            queryString += `isActive IS ${req.query[p]}`
          } else {
            queryString += `${p}=?`
            queryParams.push(req.query[p])
          }

          i++
        }
      }
    }
    queryString += ';'
    console.log(queryString)
    console.log(queryParams)

    dbconnection.getConnection(function (err, connection) {
      if (err) next(err)

      connection.query(
        queryString,
        queryParams,
        function (error, results, fields) {
          connection.release()

          if (error) {
            const err = {
              status: 500,
              message: error.sqlMessage,
            }
            next(err)
          } else {
            console.log('results = ', results.length)
            res.status(200).json({
              statusCode: 200,
              result: results,
            })
          }

          // dbconnection.end((err) => {
          //   console.log("Pool was closed.");
          // });
        }
      )
    })
  },
  getMealById: (req, res, next) => {
    console.log('getUserById called')
    const id = req.params.id
    console.log(id)
    dbconnection.getConnection(function (err, connection) {
      if (err) {
        const conError = {
          status: 500,
          message: err.sqlMessage,
        }
        next(conError)
      }

      connection.query(
        `SELECT * FROM user WHERE id=${id};`,
        function (error, results, fields) {
          connection.release()

          if (error) {
            const err = {
              status: 500,
              message: error.sqlMessage,
            }
            next(err)
          } else {
            console.log('results = ', results.length)
            if (results.length > 0) {
              console.log(results)
              res.status(200).json({
                status: 200,
                result: results[0],
              })
            } else {
              const err = {
                status: 404,
                message: `User with id ${id} not found`,
              }
              next(err)
            }
          }

          // dbconnection.end((err) => {
          //   console.log("Pool was closed.");
          // });
        }
      )
    })
  },
  updateMeal: (req, res, next) => {
    logger.info('updateUser called')
    const id = req.params.id
    if (id == req.userId) {
      logger.info('id matches')
      dbconnection.getConnection(function (err, connection) {
        if (err) {
          const conError = {
            status: 500,
            message: err.sqlMessage,
          }
          next(conError)
        }

        connection.query(
          `SELECT * FROM user WHERE id=?;`,
          [id],
          function (error, results, fields) {
            connection.release()
            if (error) {
              const err = {
                status: 500,
                message: error.sqlMessage,
              }
              next(err)
            } else {
              console.log('results = ', results.length)
              if (results.length > 0) {
                console.log(results[0])
                var user = Object.assign({}, results[0])
                console.log(user)
                const updateUserSchema = Joi.object({
                  id: Joi.number().integer().default(`${user.id}`),
                  firstName: Joi.string().default(`${user.firstName}`),
                  lastName: Joi.string().default(`${user.lastName}`),
                  emailAdress: Joi.string()
                    .email({
                      minDomainSegments: 2,
                    })
                    .default(`${user.emailAdress}`),
                  street: Joi.string().default(`${user.street}`),
                  city: Joi.string().default(`${user.city}`),
                  isActive: Joi.boolean().default(`${user.isActive}`),
                  password: Joi.string().default(`${user.password}`),
                  phoneNumber: Joi.string().default(`${user.phoneNumber}`),
                  roles: Joi.string().default(`${user.phoneNumber}`),
                })
                const { error, value } = userSchema.validate(req.body)
                if (error) {
                  const err = {
                    status: 400,
                    message: error.message,
                  }
                  next(err)
                } else {
                  console.log(value)
                  connection.query(
                    `UPDATE user SET firstName=?,lastName=?,isActive=?,emailAdress=?,password=?,phoneNumber=?,roles=?,street=?,city=? WHERE id=?`,
                    [
                      value.firstName,
                      value.lastName,
                      value.isActive,
                      value.emailAdress,
                      value.password,
                      value.phoneNumber,
                      value.roles,
                      value.street,
                      value.city,
                      id,
                    ],
                    function (error, results, fields) {
                      connection.release()

                      if (error) {
                        const err = {
                          status: 500,
                          message: error.sqlMessage,
                        }
                        next(err)
                      } else {
                        let user = {
                          id: id,
                          ...value,
                        }
                        console.log(user)
                        res.status(200).json({
                          status: 200,
                          result: user,
                        })
                      }
                    }
                  )
                }
              } else {
                const error = {
                  status: 400,
                  message: `User does not exist`,
                }
                next(error)
              }
            }

            // dbconnection.end((err) => {
            //   console.log("Pool was closed.");
            // });
          }
        )
      })
    } else {
      logger.info('id does not match')
      res.status(401).json({
        status: 401,
        message: 'You are not authorized to update this user',
      })
    }
  },
  deleteMeal: (req, res, next) => {
    const id = req.params.id
    dbconnection.getConnection(function (err, connection) {
      if (err) {
        const conError = {
          status: 500,
          message: err.sqlMessage,
        }
        next(conError)
      }

      connection.query(
        `SELECT * FROM user WHERE id=${id};`,
        function (error, results, fields) {
          connection.release()
          if (error) {
            const err = {
              status: 500,
              message: error.sqlMessage,
            }
            next(err)
          } else {
            console.log('results = ', results.length)
            if (results.length > 0) {
              if (id == req.userId) {
                connection.query(
                  `DELETE FROM user WHERE id=${id};`,
                  function (error, results, fields) {
                    // console.log(error);
                    // console.log(error.sqlMessage);
                    if (error) {
                      console.log(error.sqlMessage)
                      const err = {
                        status: 500,
                        message: error.sqlMessage,
                      }
                      next(err)
                    } else {
                      console.log('deleted')
                      res.status(200).json({
                        status: 200,
                        message: `User with id ${id} was deleted.`,
                      })
                    }
                  }
                )
              } else {
                res.status(403).json({
                  status: 403,
                  message: `You are not authorized to delete this user`,
                })
              }

              // dbconnection.end((err) => {
              //   console.log("Pool was closed.");
              // });
            } else {
              res.status(400).json({
                status: 400,
                message: `User does not exist`,
              })
            }
          }
        }
      )
    })
  },
}
