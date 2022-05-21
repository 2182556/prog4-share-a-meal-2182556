const dbconnection = require('../../database/dbconnection')
const joi = require('joi')
const jwt = require('jsonwebtoken')
const jwtPrivateKey = require('../config/config').jwtPrivateKey
const { logger } = require('../config/config')
const bcrypt = require('bcrypt')

const loginSchema = joi.object({
  emailAdress: joi
    .string()
    .required()
    .email()
    .pattern(new RegExp('[^@ \t\r\n]+@[^@ \t\r\n]+.[^@ \t\r\n]+')),
  password: joi
    .string()
    .required()
    .pattern(
      new RegExp('(?=^.{8,}$)(?=.*[0-9])(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$')
    )
    .messages({
      'string.pattern.base':
        'Password should be at least 8 characters, contain one capital letter and one number',
    }),
})

module.exports = {
  login: (req, res, next) => {
    logger.info('login called')
    const { error, value } = loginSchema.validate(req.body)

    if (error) {
      return next({
        status: 400,
        message: error.message,
      })
    }
    const queryString = 'SELECT * FROM `user` WHERE `emailAdress`=?'
    dbconnection.getConnection((err, connection) => {
      if (err) {
        return next({
          status: 500,
          message: err.sqlMessage,
        })
      }

      connection.query(
        queryString,
        [value.emailAdress],
        (error, results, fields) => {
          logger.debug('query made')
          connection.release()

          if (error) {
            return next({
              status: 500,
              message: error.sqlMessage,
            })
          }

          if (results && results.length == 1) {
            bcrypt
              .compare(value.password, results[0].password)
              .then((match) => {
                if (match) {
                  logger.info('Password matches encrypted password in database')
                  const { password, ...userinfo } = results[0]
                  const payload = { id: userinfo.id }
                  jwt.sign(
                    payload,
                    jwtPrivateKey,
                    { expiresIn: '25d' },
                    (err, token) => {
                      if (err) return next(err)
                      if (token) {
                        userinfo.isActive = userinfo.isActive ? true : false
                        logger.info('User logged in, sending ', userinfo)
                        return res.status(200).json({
                          status: 200,
                          result: { ...userinfo, token },
                        })
                      }
                    }
                  )
                } else {
                  logger.debug('Password does not match')
                  return next({
                    status: 400,
                    message: 'The password does not match the emailAdress',
                  })
                }
              })
          } else {
            logger.debug('User does not exist')
            return next({
              status: 404,
              message: 'There was no user found with this emailAdress',
            })
          }
        }
      )
    })
  },
  validateToken: (req, res, next) => {
    logger.info('validateToken called')
    // logger.trace(req.headers)
    const authHeader = req.headers.authorization
    if (!authHeader) {
      logger.warn('Authorization header missing')
      return next({
        status: 401,
        message: 'Authorization header missing',
      })
    } else {
      const token = authHeader.substring(7, authHeader.length) //stripping 'Bearer' from token

      jwt.verify(token, jwtPrivateKey, (err, payload) => {
        if (err) {
          logger.warn('not authorized')
          return next({ status: 401, message: 'Not authorized' })
        }
        if (payload) {
          logger.debug('token is valid', payload)
          req.userId = payload.id
          return next()
        }
      })
    }
  },
}
