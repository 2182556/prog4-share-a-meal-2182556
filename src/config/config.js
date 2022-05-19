require('dotenv').config()

const loglevel = (module.exports = {
  jwtPrivateKey: process.env.JWT_PRIVATE_KEY,

  logger: require('tracer').console({
    format: ['{{timestamp}} [{{title}}] {{file}}:{{line}} : {{message}}'],
    preprocess: function (data) {
      data.title = data.title.toUpperCase()
    },
    dateformat: 'isoUtcDateTime',
    level: process.env.LOGLEVEL,
  }),
})
