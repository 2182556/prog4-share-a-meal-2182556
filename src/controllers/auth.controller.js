const dbconnection = require('../../database/dbconnection')
// const assert = require('assert')
const Joi = require('joi')
const jwt = require('jsonwebtoken')

const userSchema = Joi.object({
  emailAdress: Joi.string().required().email({
    minDomainSegments: 2,
  }),
  password: Joi.string().required(),
})

module.exports = {
  login: (req, res, next) => {
    console.log('login called')

    const { emailAdress, password } = userSchema.validate(req.body)
    console.log(value)
    if (error) {
      console.log(error.message)
      const err = {
        status: 400,
        message: error.message,
      }
      next(err)
    }

    const queryString =
      'SELECT id, firstName, lastName, password FROM user WHERE emailAdress=?'

    dbconnection.getConnection(function (err, connection) {
      if (err) next(err)

      connection.query(
        queryString,
        [emailAdress],
        function (error, results, fields) {
          connection.release()

          if (error) next(error)

          if (results && results.length == 1) {
            if (password == results[0].password) {
              //get token :)
              console.log('results = ', results)
              const { password, ...userinfo } = results[0]
              const payload = { id: userinfo.id }
              jwt.sign(
                payload,
                process.env.JWT_SECRET_PRIVATE_KEY,
                { expiresIn: '25d' },
                function (err, token) {
                  if (err) console.log(err)
                  if (token) {
                    console.log(token)
                    res.status(200).json({
                      statusCode: 200,
                      result: { ...userinfo, token },
                    })
                  }
                }
              )
            } else {
              res.status(400).json({
                statusCode: 400,
                message: 'The password does not match the emailAdress',
              })
            }
          } else {
            res.status(404).json({
              statusCode: 404,
              message: 'There was no user found with this emailAdress',
            })
          }
        }
      )
    })
  },
  validateToken(req, res, next) {
    console.log('validateToken called')
    // logger.trace(req.headers)
    // The headers should contain the authorization-field with value 'Bearer [token]'
    const authHeader = req.headers.authorization
    if (!authHeader) {
      logger.warn('Authorization header missing!')
      res.status(401).json({
        error: 'Authorization header missing!',
        datetime: new Date().toISOString(),
      })
    } else {
      // Strip the word 'Bearer ' from the headervalue
      const token = authHeader.substring(7, authHeader.length)

      jwt.verify(token, process.env.JWT_SECRET_PRIVATE_KEY, (err, payload) => {
        if (err) {
          logger.warn('Not authorized')
          res.status(401).json({
            error: 'Not authorized',
            datetime: new Date().toISOString(),
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
