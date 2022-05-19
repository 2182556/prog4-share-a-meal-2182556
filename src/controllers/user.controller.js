const dbconnection = require('../../database/dbconnection')
// const assert = require('assert')
const Joi = require('joi')
const { logger } = require('../config/config')

const userSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  emailAdress: Joi.string()
    .required()
    .email()
    .pattern(new RegExp('[^@ \t\r\n]+@[^@ \t\r\n]+.[^@ \t\r\n]+')),
  street: Joi.string().required().default(''),
  city: Joi.string().required().default(''),
  isActive: Joi.boolean().required().default('true'),
  password: Joi.string()
    .required()
    .pattern(
      new RegExp('(?=^.{8,}$)(?=.*[0-9])(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$')
    ),
  phoneNumber: Joi.string()
    .pattern(new RegExp('^(?=^.{8,}$)[+]?[0-9]+[ ]?[-]?[0-9]+$'))
    .required()
    .default('+31 612345678'),
  roles: Joi.string().default('editor,guest'),
})

module.exports = {
  validateUser: (req, res, next) => {
    logger.info('validateUser called')
    let user = req.body

    const { error, value } = userSchema.validate(req.body)
    if (error == undefined) {
      next()
    } else {
      logger.error(error.message)
      res.status(400).json({
        status: 400,
        message: error.message,
      })
      // const err = {
      //   status: 400,
      //   message: error.message,
      // }
      // next(err)
    }
  },
  checkUniqueEmail: (req, res, next) => {
    console.log('Checking if email is unique')
    if (req.body.emailAdress != undefined) {
      dbconnection.getConnection(function (err, connection) {
        if (err) {
          const conError = {
            status: 500,
            message: err.sqlMessage,
          }
          next(conError)
        }

        connection.query(
          `SELECT * FROM user WHERE emailAdress='${req.body.emailAdress}';`,
          function (error, results, fields) {
            connection.release()

            if (error) {
              const err = {
                status: 500,
                message: error.sqlMessage,
              }
              next(err)
            } else {
              var user = Object.assign({}, results[0])
              if (results.length > 0 && user.id != req.params.id) {
                console.log(user.id)
                res.status(409).json({
                  status: 409,
                  message: `The email address ${req.body.emailAdress} is already in use, please use a different emailaddress.`,
                })
              } else {
                next()
              }
            }
          }
        )
      })
    } else {
      next()
    }
  },
  addUser: (req, res, next) => {
    const { error, value } = userSchema.validate(req.body)
    console.log('addUser called')
    console.log(value)
    let user = value

    dbconnection.getConnection(function (err, connection) {
      if (err) {
        logger.error('connection error')
        const conError = {
          status: 500,
          message: err.sqlMessage,
        }
        next(conError)
      }

      connection.query(
        'INSERT INTO user (firstName,lastName,isActive,emailAdress,password,phoneNumber,roles,street,city) VALUES(?,?,?,?,?,?,?,?,?);',
        [
          user.firstName,
          user.lastName,
          user.isActive,
          user.emailAdress,
          user.password,
          user.phoneNumber,
          user.roles,
          user.street,
          user.city,
        ],
        function (error, results, fields) {
          connection.release()

          logger.info('queried')

          if (error) {
            logger.error('error after query', error.sqlMessage)
            const conError = {
              status: 500,
              message: error.sqlMessage,
            }
            next(conError)
          } else {
            console.log('email ', user.emailAdress)
            connection.query(
              `SELECT * FROM user WHERE emailAdress=?`,
              [user.emailAdress],
              function (error, results, fields) {
                connection.release()
                if (error) {
                  console.log(err.sqlMessage)
                  const conError = {
                    status: 500,
                    message: error.sqlMessage,
                  }
                  next(conError)
                } else {
                  console.log(results)
                  let id = 0
                  if (results.length > 0) id = results[0].id
                  user = {
                    id: id,
                    ...user,
                  }
                  res.status(201).json({
                    status: 201,
                    result: user,
                  })
                }
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
  getAllUsers: (req, res, next) => {
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
    let queryString = 'SELECT id, firstName, lastName FROM user'
    let queryParams = []
    if (Object.keys(req.query).length > 0) {
      queryString += ' WHERE '
      let i = 0
      for (p in req.query) {
        if (allowedParams.includes(p)) {
          if (i > 0) queryString += ' AND '
          queryString += `${p}=?`
          queryParams.push(req.query[p])
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
  getUserProfile: (req, res, next) => {
    res.status(503).json({
      status: 503,
      message: 'This feature has not been implemented yet.',
    })
  },
  getUserById: (req, res, next) => {
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
  updateUser: (req, res, next) => {
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
  },
  deleteUser: (req, res, next) => {
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
                  message: `You are not authorized to remove this user`,
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
              // const err = {
              //   status: 400,
              //   message: `User does not exist`,
              // }
              // next(err)
            }
          }
        }
      )
    })
  },
  //for debugging only
  deleteAll: (req, res, next) => {
    dbconnection.getConnection(function (err, connection) {
      if (err) {
        const conError = {
          status: 500,
          message: err.sqlMessage,
        }
        next(conError)
      }

      connection.query(
        'DELETE IGNORE FROM user;',
        function (error, results, fields) {
          connection.release()
          if (error) {
            const err = {
              status: 500,
              message: error.sqlMessage,
            }
            next(err)
          } else {
            res.status(200).json({
              status: 200,
              message: `OK`,
            })
          }
        }
      )
    })
  },
  addAll: (req, res, next) => {
    dbconnection.getConnection(function (err, connection) {
      if (err) {
        const conError = {
          status: 500,
          message: err.sqlMessage,
        }
        next(conError)
      }

      connection.query(
        'INSERT INTO `user` ( `firstName`, `lastName`,`isActive`, `emailAdress`, `password`, `phoneNumber`, `roles`, `street`, `city` ) VALUES' +
          "('Marieke','Van Dam',false,'m.vandam@server.nl','Secret11','06-12345678','editor,guest','','')," +
          "('Henk','Tank',true,'h.tank@server.com','Secret11','06 12425495','editor,guest','','')," +
          "('Davide','Ambesi',true,'d.ambesi@avans.nl','Secret11','','editor,guest','','');",
        function (error, results, fields) {
          connection.release()
          if (error) {
            const err = {
              status: 500,
              message: error.sqlMessage,
            }
            next(err)
          } else {
            res.status(200).json({
              status: 200,
              message: 'OK',
            })
          }
        }
      )
    })
  },
}
