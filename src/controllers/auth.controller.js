const dbconnection = require('../../database/dbconnection')
const Joi = require('joi')
const jwt = require('jsonwebtoken')
const logger = require('../config/config').logger
const jwtPrivateKey = require('../config/config').jwtPrivateKey

const loginSchema = Joi.object({
  emailAdress: Joi.string().required().email(),
  password: Joi.string()
    .required()
    .pattern(
      new RegExp('(?=^.{8,}$)(?=.*[0-9])(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$')
    ),
})

module.exports = {
  login: (req, res, next) => {
    logger.info('login called')

    const { error, value } = loginSchema.validate(req.body)
    logger.debug(value.emailAdress)

    if (error) {
      res.status(400).json({
        statusCode: 400,
        message: error.message,
      })
    } else {
      const queryString =
        'SELECT id, firstName, lastName, password, IF(isActive, "true", "false") isActive FROM user WHERE emailAdress=?'

      dbconnection.getConnection(function (err, connection) {
        if (err) {
          const error = {
            status: 500,
            message: err.sqlMessage,
          }
          next(error)
        }

        connection.query(
          queryString,
          [value.emailAdress],
          function (error, results, fields) {
            connection.release()

            if (error) next(error)

            logger.debug(results)

            if (results && results.length == 1) {
              logger.debug('one result')
              if (value.password == results[0].password) {
                const { password, ...userinfo } = results[0]
                const payload = { id: userinfo.id }
                jwt.sign(
                  payload,
                  jwtPrivateKey,
                  { expiresIn: '25d' },
                  function (err, token) {
                    if (err) logger.error(err)
                    if (token) {
                      logger.info('User logged in, sending ', userinfo)
                      res.status(200).json({
                        status: 200,
                        result: { ...userinfo, token },
                      })
                      return
                    }
                  }
                )
              } else {
                logger.debug('Password does not match')
                res.status(400).json({
                  status: 400,
                  message: 'The password does not match the emailAdress',
                })
                return
              }
            } else {
              logger.debug('User does not exist')
              res.status(404).json({
                status: 404,
                message: 'There was no user found with this emailAdress',
              })
              return
            }
          }
        )
      })
    }
  },
  validateToken(req, res, next) {
    logger.info('validateToken called')
    // logger.trace(req.headers)
    // The headers should contain the authorization-field with value 'Bearer [token]'
    const authHeader = req.headers.authorization
    if (!authHeader) {
      logger.warn('Authorization header missing')
      res.status(401).json({
        status: 401,
        message: 'Authorization header missing',
      })
    } else {
      // Strip the word 'Bearer ' from the headervalue
      const token = authHeader.substring(7, authHeader.length)

      jwt.verify(token, jwtPrivateKey, (err, payload) => {
        if (err) {
          logger.warn('Not authorized')
          res.status(401).json({
            status: 401,
            message: 'Not authorized',
          })
        }
        if (payload) {
          logger.debug('token is valid', payload)
          // User heeft toegang. Voeg UserId uit payload toe aan
          // request, voor ieder volgend endpoint.
          req.userId = payload.id
          next()
        }
      })
    }
  },
}
