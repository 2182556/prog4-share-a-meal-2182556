const express = require('express')
const app = express()
require('dotenv').config()
const port = process.env.PORT
const bodyParser = require('body-parser')
const userRoutes = require('./src/routes/user.routes')
const authRoutes = require('./src/routes/auth.routes')
const logger = require('./src/config/config').logger

app.use(bodyParser.json())

app.all('*', (req, res, next) => {
  const method = req.method
  logger.info(`Method ${method} called`)
  next()
})

app.get('/', (req, res) => {
  res.status(200).json({
    status: 200,
    result: 'Share a meal api',
  })
})

app.use('/api', userRoutes)
app.use('/api', authRoutes)

app.all('*', (req, res) => {
  res.status(404).json({
    status: 404,
    result: 'End-point not found',
  })
})

app.use((err, req, res, next) => {
  res.status(err.status).json(err)
  //change to 500?
})

app.listen(port, () => {
  logger.info(`App listening on port ${port}`)
})

module.exports = app
