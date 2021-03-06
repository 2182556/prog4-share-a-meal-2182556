const dbconnection = require('../../database/dbconnection')
const { logger } = require('../config/config')
const joi = require('joi')
const bcrypt = require('bcrypt')
const saltRounds = 10

const emailRegExp = new RegExp('[^@ \t\r\n]+@[^@ \t\r\n]+.[^@ \t\r\n]+')
const passwordRegExp = new RegExp(
  '(?=^.{8,}$)(?=.*[0-9])(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$'
)
const passwordInvalidMessage =
  'Password should be at least 8 characters, contain one capital letter and one number'
const phoneNumberRegExp = new RegExp('^(?=^.{10,}$)(\\+|0)[0-9]+[ -]?[0-9]+$')
const phoneNumberInvalidMessage =
  "phoneNumber should have at least 9 digits and can start with '+', and contain one '-' or ' '"

const userSchema = joi.object({
  firstName: joi.string().required(),
  lastName: joi.string().required(),
  emailAdress: joi.string().required().email().pattern(emailRegExp),
  street: joi.string().required(),
  city: joi.string().required(),
  isActive: joi.boolean().required(),
  password: joi.string().required().pattern(passwordRegExp).messages({
    'string.pattern.base': passwordInvalidMessage,
  }),
  phoneNumber: joi.string().pattern(phoneNumberRegExp).required().messages({
    'string.pattern.base': phoneNumberInvalidMessage,
  }),
  roles: joi
    .array()
    .items(joi.string().valid('editor', 'guest', 'admin', ''))
    .default(['editor', 'guest']),
})

module.exports = {
  // setMaxConnections: (req, res, next) => {
  //   dbconnection.getConnection((error, connection) => {
  //     if (error) {
  //       logger.error(error.message)
  //       return next({
  //         status: 500,
  //         message: error.message,
  //       })
  //     } else {
  //       connection.query(
  //         `SET GLOBAL max_connections = 1024;`,
  //         [req.params.id],
  //         (error, results, fields) => {
  //           connection.release()
  //           if (error) {
  //             logger.error(error.sqlMessage)
  //             return next({
  //               status: 500,
  //               message: error.sqlMessage,
  //             })
  //           }
  //         }
  //       )
  //     }
  //   })
  // },
  validateUser: (req, res, next) => {
    logger.info('validateUser called')

    const { error, value } = userSchema.validate(req.body)
    if (error) {
      logger.warn(error.message)
      return next({
        status: 400,
        message: error.message,
      })
    } else {
      req.validatedUser = value
      return next()
    }
  },
  checkIfUserExists: (req, res, next) => {
    logger.info('checkIfUserExists called')
    dbconnection.getConnection((error, connection) => {
      if (error) {
        logger.error(error.message)
        return next({
          status: 500,
          message: error.message,
        })
      } else {
        connection.query(
          `SELECT * FROM user WHERE id=?;`,
          [req.params.id],
          (error, results, fields) => {
            connection.release()
            if (error) {
              logger.error(error.sqlMessage)
              return next({
                status: 500,
                message: error.sqlMessage,
              })
            } else {
              if (results.length > 0) {
                logger.info('User found, adding user to request')
                req.existingUser = Object.assign({}, results[0])
                return next()
              } else {
                logger.warn('Could not find user')
                return next({
                  status: 400,
                  message: 'User does not exist',
                })
              }
            }
          }
        )
      }
    })
  },
  checkUniqueEmail: (req, res, next) => {
    logger.info('checkUniqueEmail called')
    if (req.body.emailAdress != undefined) {
      dbconnection.getConnection((error, connection) => {
        if (error) {
          logger.error(error.message)
          return next({
            status: 500,
            message: error.message,
          })
        } else {
          connection.query(
            'SELECT * FROM user WHERE emailAdress=?;',
            [req.body.emailAdress],
            (error, results, fields) => {
              connection.release()

              if (error) {
                logger.error(error.sqlMessage)
                return next({
                  status: 500,
                  message: error.sqlMessage,
                })
              } else {
                logger.debug(results[0])
                var user = Object.assign({}, results[0])
                if (results.length > 0 && user.id != req.params.id) {
                  logger.warn('Email already in use')
                  return next({
                    status: 409,
                    message: `The email address ${req.body.emailAdress} is already in use, please use a different emailaddress.`,
                  })
                } else {
                  return next()
                }
              }
            }
          )
        }
      })
    } else {
      return next()
    }
  },
  addUser: (req, res, next) => {
    logger.info('addUser called')
    let user = req.validatedUser
    bcrypt.hash(user.password, saltRounds, (error, hash) => {
      if (error) {
        logger.error('Could not encrypt password')
        return next({ status: 500, message: 'Could not encrypt password' })
      }
      user.password = hash

      dbconnection.getConnection((error, connection) => {
        if (error) {
          logger.error(error.message)
          return next({ status: 500, message: error.message })
        }

        connection.query(
          'INSERT INTO user (firstName,lastName,isActive,emailAdress,password,phoneNumber,roles,street,city) VALUES(?,?,?,?,?,?,?,?,?); ' +
            'SELECT LAST_INSERT_ID() as userId;',
          [
            user.firstName,
            user.lastName,
            user.isActive,
            user.emailAdress,
            user.password,
            user.phoneNumber,
            user.roles.toString(),
            user.street,
            user.city,
          ],
          (error, results, fields) => {
            connection.release()

            if (error) {
              logger.error(error.sqlMessage)
              return next({ status: 500, message: error.sqlMessage })
            }
            logger.info(results)
            user = {
              id: results[1][0].userId,
              ...user,
            }
            logger.info('Succesfully added user, returning ', user)
            return res.status(201).json({
              status: 201,
              result: user,
            })
          }
        )
      })
    })
  },
  getAllUsers: (req, res, next) => {
    logger.info('getAllUsers called')

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
      'SELECT id, firstName, lastName, isActive, emailAdress, phoneNumber, roles, street, city FROM user'
    let queryParams = []
    if (Object.keys(req.query).length > 0) {
      queryString += ' WHERE '
      let i = 0
      for (p in req.query) {
        if (allowedParams.includes(p)) {
          if (i > 0) queryString += ' AND '
          queryString += `${p}=?`
          if (p == 'isActive') queryParams.push(req.query[p] === 'true')
          else if (p == 'roles') queryParams.push(req.query[p].toString())
          else queryParams.push(req.query[p])
          i++
        }
      }
    }
    queryString += ';'
    logger.info(queryString)
    logger.info(queryParams)

    dbconnection.getConnection((error, connection) => {
      if (error) {
        logger.error(error.message)
        return next({ status: 500, message: error.message })
      }

      connection.query(queryString, queryParams, (error, results, fields) => {
        connection.release()

        if (error) {
          logger.error(error.sqlMessage)
          return next({ status: 500, message: error.sqlMessage })
        } else {
          results.forEach((i) => {
            i.isActive = i.isActive ? true : false
          })
          logger.info('Succesfully retrieved all users')
          return res.status(200).json({
            status: 200,
            result: results,
          })
        }
      })
    })
  },
  getUserProfile: (req, res, next) => {
    const id = req.userId
    dbconnection.getConnection((error, connection) => {
      if (error) {
        logger.error(error.message)
        return next({ status: 500, message: error.message })
      }

      connection.query(
        `SELECT * FROM user WHERE id=${id};`,
        (error, results, fields) => {
          connection.release()
          if (error) {
            logger.error(error.sqlMessage)
            return next({ status: 500, message: error.sqlMessage })
          }
          if (results && results.length == 1) {
            results[0].isActive = results[0].isActive ? true : false
            logger.info('Succesfully retrieved user profile')
            return res.status(200).json({
              status: 200,
              result: results[0],
            })
          } else {
            logger.error('Result is empty even though user is logged in')
            return next({
              status: 500,
              message: `Something went wrong, could not find logged in user`,
            })
          }
        }
      )
    })
  },
  getUserById: (req, res, next) => {
    logger.info('getUserById called')
    const id = req.params.id
    dbconnection.getConnection((error, connection) => {
      if (error) {
        logger.error(error.message)
        return next({ status: 500, message: error.message })
      }

      connection.query(
        `SELECT * FROM user WHERE id=${id};`,
        (error, results, fields) => {
          connection.release()

          if (error) {
            logger.error(error.sqlMessage)
            return next({ status: 500, message: error.sqlMessage })
          }
          if (results.length > 0) {
            const { password, ...userinfo } = results[0]
            userinfo.isActive = userinfo.isActive ? true : false
            logger.info('Succesfully retrieved user by id')
            return res.status(200).json({
              status: 200,
              result: userinfo,
            })
          } else {
            logger.warn('Could not find user')
            return next({
              status: 404,
              message: `User with id ${id} not found`,
            })
          }
        }
      )
    })
  },
  updateUser: (req, res, next) => {
    logger.info('updateUser called')
    const id = req.params.id

    dbconnection.getConnection((error, connection) => {
      if (error) {
        logger.error(error.message)
        return next({ status: 500, message: error.message })
      }

      if (id == req.userId) {
        var user = req.existingUser

        /* updateUserSchema only used if some values are no longer required
         * const updateUserSchema = joi.object({
         *   id: joi.number().integer().default(`${user.id}`),
         *   firstName: joi.string().default(`${user.firstName}`),
         *   lastName: joi.string().default(`${user.lastName}`),
         *   emailAdress: joi.string()
         *     .email()
         *     .default(`${user.emailAdress}`)
         *     .pattern(emailRegExp),
         *   street: joi.string().default(`${user.street}`),
         *   city: joi.string().default(`${user.city}`),
         *   isActive: joi.boolean().default(`${user.isActive}`),
         *   password: joi.string()
         *     .default(`${user.password}`)
         *     .pattern(passwordRegExp)
         *     .messages({
         *       'string.pattern.base':
         *         'Password should be at least 8 characters, contain one capital letter and one number',
         *     }),
         *   phoneNumber: joi.string()
         *     .default(`${user.phoneNumber}`)
         *     .pattern(phoneNumberRegExp)
         *     .messages({
         *       'string.pattern.base':
         *         "phoneNumber should have at least 9 digits and can start with '+', and contain one '-' or ' '",
         *     }),
         *   roles: joi.array()
         *     .items(joi.string().valid('editor', 'guest', 'admin', ''))
         *     .default(['editor', 'guest']),
         * })
         */

        const { error, value } = userSchema.validate(req.body)
        if (error) {
          logger.warn(error.message)
          return next({ status: 400, message: error.message })
        }
        bcrypt.hash(value.password, saltRounds, (error, hash) => {
          if (error) {
            logger.error('Could not encrypt password')
            return next({ status: 500, message: 'Could not encrypt password' })
          }
          value.password = hash

          connection.query(
            `UPDATE user SET firstName=?,lastName=?,isActive=?,emailAdress=?,password=?,phoneNumber=?,roles=?,street=?,city=? WHERE id=?`,
            [
              value.firstName,
              value.lastName,
              value.isActive,
              value.emailAdress,
              value.password,
              value.phoneNumber,
              value.roles.toString(),
              value.street,
              value.city,
              id,
            ],
            (error, results, fields) => {
              connection.release()

              if (error) {
                logger.error(error.sqlMessage)
                return next({ status: 500, message: error.sqlMessage })
              }
              const { password, ...userinfo } = value
              let updatedUser = {
                id: user.id,
                isActive: userinfo.isActive ? true : false,
                ...userinfo,
              }
              logger.info('User succesfully updated, returning', updatedUser)
              return res.status(200).json({
                status: 200,
                result: updatedUser,
              })
            }
          )
        })
      } else {
        logger.warn('Not authorized')
        return next({
          status: 403,
          message: 'You are not authorized to update this user',
        })
      }
    })
  },
  deleteUser: (req, res, next) => {
    const id = req.params.id
    dbconnection.getConnection((error, connection) => {
      if (error) {
        logger.error(error.message)
        return next({ status: 500, message: error.message })
      }

      if (id == req.userId) {
        connection.query(
          `DELETE FROM user WHERE id=${id};`,
          (error, results, fields) => {
            connection.release()
            if (error) {
              logger.error(error.sqlMessage)
              return next({ status: 500, message: error.sqlMessage })
            }
            logger.info('User succesfully deleted')
            return res.status(200).json({
              status: 200,
              message: `User with id ${id} was deleted.`,
            })
          }
        )
      } else {
        logger.warn('Not authorized')
        return next({
          status: 403,
          message: 'You are not authorized to delete this user',
        })
      }
    })
  },
}
