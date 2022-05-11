const dbconnection = require('../../database/dbconnection')
// const assert = require('assert')
const Joi = require('joi')

const userSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  emailAdress: Joi.string().required().email({
    minDomainSegments: 2,
  }),
  street: Joi.string().required().default(''),
  city: Joi.string().required().default(1),
  isActive: Joi.boolean().required().default(1),
  password: Joi.string().required(),
  phoneNumber: Joi.string().required().default(''),
  roles: Joi.string().default('editor,guest'),
})

module.exports = {
  validateUser: (req, res, next) => {
    console.log('Validating input')
    let user = req.body

    const { error, value } = userSchema.validate(req.body)
    console.log(value)
    if (error == undefined) {
      next()
    } else {
      console.log(error.message)
      const err = {
        status: 400,
        message: error.message,
      }
      next(err)
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
                const err = {
                  status: 409,
                  message: `The email address ${req.body.emailAdress} is already in use, please use a different emailaddress.`,
                }
                next(err)
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
        const conError = {
          status: 500,
          message: err.sqlMessage,
        }
        next(conError)
      }

      connection.query(
        `INSERT INTO user (firstName,lastName,isActive,emailAdress,password,phoneNumber,roles,street,city) 
        VALUES(
          '${user.firstName}',
          '${user.lastName}',
          '${user.isActive}',
          '${user.emailAdress}',
          '${user.password}', 
          '${user.phoneNumber}',
          '${user.roles}',
          '${user.street}',
          '${user.city}'
          );`,
        function (error, results, fields) {
          connection.release()

          if (err) {
            const conError = {
              status: 500,
              message: err.sqlMessage,
            }
            next(conError)
          } else {
            res.status(201).json({
              status: 201,
              result: `User with email address ${user.emailAdress} was added.`,
            })
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
    dbconnection.getConnection(function (err, connection) {
      if (err) {
        const conError = {
          status: 500,
          message: err.sqlMessage,
        }
        next(conError)
      }

      connection.query(
        'SELECT * FROM user;',
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
                result: results,
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
    if (id == undefined) {
      const err = {
        status: 500,
        message: 'Please enter a valid id.',
      }
      next(err)
    }
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
              console.log(value)
              connection.query(
                `UPDATE user SET 
              firstName='${value.firstName}',
              lastName='${value.lastName}',
              isActive='${value.isActive}',
              emailAdress='${value.emailAdress}',
              password='${value.password}',
              phoneNumber='${value.phoneNumber}',
              roles='${value.roles}',
              street='${value.street}',
              city='${value.city}' 
              WHERE id=${id};`,
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
                      result: `User with id ${id} has been updated.`,
                    })
                  }
                }
              )
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
          if (error) {
            const err = {
              status: 500,
              message: error.sqlMessage,
            }
            next(err)
          } else {
            console.log('results = ', results.length)
            if (results.length > 0) {
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
                      result: `User with id ${id} was deleted.`,
                    })
                  }
                }
              )

              // dbconnection.end((err) => {
              //   console.log("Pool was closed.");
              // });
            } else {
              const err = {
                status: 400,
                message: `User does not exist`,
              }
              next(err)
            }
          }
        }
      )
    })
  },
}
