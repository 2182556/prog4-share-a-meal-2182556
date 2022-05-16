const express = require('express')
// const database = require('./database/inmemdb')
const app = express()
require('dotenv').config()
const port = process.env.PORT
const bodyParser = require('body-parser')
const userRoutes = require('./src/routes/user.routes')
const authRoutes = require('./src/routes/auth.routes')

app.use(bodyParser.json())

app.all('*', (req, res, next) => {
  const method = req.method
  console.log(`Method ${method} called`)
  next()
})

app.get('/', (req, res) => {
  res.status(200).json({
    status: 200,
    result: 'Share a meal application',
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
  console.log('Error: ' + err.message)
  res.status(err.status).json(err)
})

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})

module.exports = app
