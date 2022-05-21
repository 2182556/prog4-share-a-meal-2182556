process.env.DB_DATABASE = process.env.DB_DATABASE || 'share-a-meal-testdb'

const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../../index')
const jwt = require('jsonwebtoken')
const { jwtPrivateKey, logger } = require('../../src/config/config')

require('dotenv').config()
const dbconnection = require('../../database/dbconnection')

chai.should()
chai.use(chaiHttp)

let token = 0

const CLEAR_MEALS_TABLE = 'DELETE IGNORE FROM `meal`;'
const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`;'
const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;'

const INSERT_USERS =
  'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `isActive` , `street`, `city` ) VALUES' +
  '(1, "first", "last", "email@adress.com", "$2b$10$9HWpL3XxxAlu/JZ3.AsO7.kuJvVvoLQg84GIpYQ8kM03G6h6WLXfS", "1", "street", "city"),' +
  '(2, "Davide", "Ambesi", "d.ambesi@avans.nl", "$2b$10$9HWpL3XxxAlu/JZ3.AsO7.kuJvVvoLQg84GIpYQ8kM03G6h6WLXfS", "0", "street", "city");'

const INSERT_MEALS =
  'INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`, `allergenes` ) VALUES' +
  "(1, 'Meal A', 'description', 'image url', '2022-06-22 17:35:00', 5, 6.50, 1, 'lactose,gluten')," +
  "(2, 'Meal B', 'description', 'image url', '2022-06-22 17:35:00', 5, 6.50, 2, 'noten')," +
  "(3, 'Meal C', 'description', 'image url', '2022-07-22 18:00:00', 5, 6.50, 2, '');"

const INSERT_PARTICIPATION =
  'INSERT INTO `meal_participants_user` VALUES (1,1), (2,2), (3,2), (3,1); '

describe('Manage meals', () => {
  before((done) => {
    token = jwt.sign({ id: 1 }, jwtPrivateKey)
    done()
  })
  beforeEach((done) => {
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err

      connection.query(CLEAR_MEALS_TABLE, function (error, results, fields) {
        connection.release()
        if (error) throw error
      })
      connection.query(
        CLEAR_PARTICIPANTS_TABLE,
        function (error, results, fields) {
          connection.release()
          if (error) throw error
        }
      )
      connection.query(CLEAR_USERS_TABLE, function (error, results, fields) {
        connection.release()
        if (error) throw error
      })
      connection.query(INSERT_USERS, function (error, results, fields) {
        connection.release()
        if (error) throw error
      })
      connection.query(INSERT_MEALS, function (error, results, fields) {
        connection.release()
        if (error) throw error
      })
      connection.query(INSERT_PARTICIPATION, function (error, results, fields) {
        connection.release()
        if (error) throw error
        done()
      })
    })
  })
  //Use case 201
  describe('UC-301 Post meal /api/meal', () => {
    it('TC-301-1 When a required input is missing, a validation error should be returned', (done) => {
      chai
        .request(server)
        .post('/api/meal')
        .set('authorization', 'Bearer ' + token)
        .send({
          //name is missing
          description: 'A meal description',
          isActive: true,
          isVega: true,
          isVegan: false,
          isToTakeHome: false,
          dateTime: '2022-06-20T06:30:53.193Z',
          imageUrl:
            'https://betterchickencommitment.com/static/c4c65646cd882eb3b25feba0144c9113/ee604/white-chicken-cutout-2.png',
          allergenes: [],
          maxAmountOfParticipants: 6,
          price: 6.5,
        })
        .end((err, res) => {
          res.should.be.an('object')
          let { status, message } = res.body
          status.should.equal(400)
          message.should.be.a('string').that.equals('"name" is required')
        })
      chai
        .request(server)
        .post('/api/meal')
        .set('authorization', 'Bearer ' + token)
        .send({
          //isActive is missing
          name: 'A meal name',
          description: 'A meal description',
          isVega: true,
          isVegan: false,
          isToTakeHome: false,
          dateTime: '2022-06-20T06:30',
          imageUrl:
            'https://betterchickencommitment.com/static/c4c65646cd882eb3b25feba0144c9113/ee604/white-chicken-cutout-2.png',
          allergenes: [],
          maxAmountOfParticipants: 6,
          price: 6.5,
        })
        .end((err, res) => {
          res.should.be.an('object')
          let { status, message } = res.body
          status.should.equal(400)
          message.should.be.a('string').that.equals('"isActive" is required')
        })
      chai
        .request(server)
        .post('/api/meal')
        .set('authorization', 'Bearer ' + token)
        .send({
          //maxAmountOfParticipants is missing
          name: 'A meal name',
          description: 'A meal description',
          isActive: true,
          isVega: true,
          isVegan: false,
          isToTakeHome: false,
          dateTime: '2022-05-20T06:30:53.193Z',
          imageUrl:
            'https://betterchickencommitment.com/static/c4c65646cd882eb3b25feba0144c9113/ee604/white-chicken-cutout-2.png',
          allergenes: [],
          price: 6.5,
        })
        .end((err, res) => {
          res.should.be.an('object')
          let { status, message } = res.body
          status.should.equal(400)
          message.should.be
            .a('string')
            .that.equals('"maxAmountOfParticipants" is required')
        })
      chai
        .request(server)
        .post('/api/meal')
        .set('authorization', 'Bearer ' + token)
        .send({
          //dateTime is missing
          name: 'A meal name',
          description: 'A meal description',
          isActive: true,
          isVega: true,
          isVegan: false,
          isToTakeHome: false,
          imageUrl:
            'https://betterchickencommitment.com/static/c4c65646cd882eb3b25feba0144c9113/ee604/white-chicken-cutout-2.png',
          allergenes: [],
          maxAmountOfParticipants: 6,
          price: 6.5,
        })
        .end((err, res) => {
          res.should.be.an('object')
          let { status, message } = res.body
          status.should.equal(400)
          message.should.be.a('string').that.equals('"dateTime" is required')
          done()
        })
    })

    it('TC-301-2 When a token is invalid, an authentication error should be returned', (done) => {
      chai
        .request(server)
        .post('/api/meal')
        .set('authorization', 'Bearer ' + ' ')
        .send({
          name: 'A meal name',
          description: 'A meal description',
          isActive: true,
          isVega: true,
          isVegan: false,
          isToTakeHome: false,
          dateTime: '2022-05-20T06:30:53.193Z',
          imageUrl:
            'https://betterchickencommitment.com/static/c4c65646cd882eb3b25feba0144c9113/ee604/white-chicken-cutout-2.png',
          allergenes: [],
          maxAmountOfParticipants: 6,
          price: 6.5,
        })
        .end((err, res) => {
          res.should.be.an('object')
          let { status, message } = res.body
          status.should.equal(401)
          message.should.be.a('string').that.equals('Not authorized')
          done()
        })
    })

    it('TC-301-3 When a token is valid, a meal should be added and returned as result', (done) => {
      chai
        .request(server)
        .post('/api/meal')
        .set('authorization', 'Bearer ' + token)
        .send({
          name: 'A meal name',
          description: 'A meal description',
          isActive: true,
          isVega: true,
          isVegan: false,
          isToTakeHome: false,
          dateTime: '2022-06-20T06:30',
          imageUrl:
            'https://betterchickencommitment.com/static/c4c65646cd882eb3b25feba0144c9113/ee604/white-chicken-cutout-2.png',
          allergenes: [],
          maxAmountOfParticipants: 6,
          price: 6.5,
        })
        .end((err, res) => {
          res.should.be.an('object')
          let { status, result } = res.body
          status.should.equal(201)
          result.should.be
            .an('object')
            .that.includes.keys('id', 'cookId', 'name', 'dateTime')
          result.should.include({ cookId: 1 })
          result.should.include({ name: 'A meal name' })
          done()
        })
    })
  })

  describe('UC-302 Update meal /api/meal', () => {
    it('TC-302-1 When a required input (name, price or maxAmountOfParticipants) is missing, a validation error should be returned', (done) => {
      chai
        .request(server)
        .put('/api/meal/1')
        .set('authorization', 'Bearer ' + token)
        .send({
          //name is missing
          description: 'A meal description',
          isActive: true,
          isVega: true,
          isVegan: false,
          isToTakeHome: false,
          dateTime: '2022-05-20T06:30:53.193Z',
          imageUrl:
            'https://betterchickencommitment.com/static/c4c65646cd882eb3b25feba0144c9113/ee604/white-chicken-cutout-2.png',
          allergenes: [],
          maxAmountOfParticipants: 6,
          price: 6.5,
        })
        .end((err, res) => {
          res.should.be.an('object')
          let { status, message } = res.body
          console.log(status, message)
          status.should.equal(400)
          message.should.be.a('string').that.equals('"name" is required')
        })
      chai
        .request(server)
        .put('/api/meal/1')
        .set('authorization', 'Bearer ' + token)
        .send({
          //price is missing
          name: 'A meal name',
          description: 'A meal description',
          isActive: true,
          isVega: true,
          isVegan: false,
          isToTakeHome: false,
          dateTime: '2022-05-20T06:30:53.193Z',
          imageUrl:
            'https://betterchickencommitment.com/static/c4c65646cd882eb3b25feba0144c9113/ee604/white-chicken-cutout-2.png',
          allergenes: [],
          maxAmountOfParticipants: 6,
        })
        .end((err, res) => {
          res.should.be.an('object')
          let { status, message } = res.body
          console.log(status, message)
          status.should.equal(400)
          message.should.be.a('string').that.equals('"price" is required')
        })
      chai
        .request(server)
        .put('/api/meal/1')
        .set('authorization', 'Bearer ' + token)
        .send({
          //maxAmountOfParticipants is missing
          name: 'A meal name',
          description: 'A meal description',
          isActive: true,
          isVega: true,
          isVegan: false,
          isToTakeHome: false,
          dateTime: '2022-05-20T06:30:53.193Z',
          imageUrl:
            'https://betterchickencommitment.com/static/c4c65646cd882eb3b25feba0144c9113/ee604/white-chicken-cutout-2.png',
          allergenes: [],
          price: 6.5,
        })
        .end((err, res) => {
          res.should.be.an('object')
          let { status, message } = res.body
          console.log(status, message)
          status.should.equal(400)
          message.should.be
            .a('string')
            .that.equals('"maxAmountOfParticipants" is required')
          done()
        })
    })

    it('TC-302-2 When a user is not logged in, an authorization error should be returned', (done) => {
      chai
        .request(server)
        .put('/api/meal/1')
        //no token
        .set('authorization', 'Bearer ' + ' ')
        .send({
          name: 'A new meal name',
          description: 'A new meal description',
          maxAmountOfParticipants: 6,
          price: 6.5,
        })
        .end((err, res) => {
          res.should.be.an('object')
          let { status, message } = res.body
          status.should.equal(401)
          message.should.be.a('string').that.equals('Not authorized')
          done()
        })
    })

    it('TC-302-3 When a user does not own the meal, an authorization error should be returned', (done) => {
      chai
        .request(server)
        .put('/api/meal/2')
        .set('authorization', 'Bearer ' + token)
        .send({
          name: 'A new meal name',
          description: 'A new meal description',
          maxAmountOfParticipants: 6,
          price: 6.5,
        })
        .end((err, res) => {
          res.should.be.an('object')
          let { status, message } = res.body
          status.should.equal(403)
          message.should.be
            .a('string')
            .that.equals('You are not authorized to alter this meal')
          done()
        })
    })

    it('TC-302-4 When a meal does not exist, an error should be returned', (done) => {
      chai
        .request(server)
        .put('/api/meal/0')
        .set('authorization', 'Bearer ' + token)
        .send({
          name: 'A new meal name',
          description: 'A new meal description',
          maxAmountOfParticipants: 6,
          price: 6.5,
        })
        .end((err, res) => {
          res.should.be.an('object')
          let { status, message } = res.body
          status.should.equal(404)
          message.should.be.a('string').that.equals('Meal does not exist')
          done()
        })
    })

    it('TC-302-5 Meal succesfully updated', (done) => {
      chai
        .request(server)
        .put('/api/meal/1')
        .set('authorization', 'Bearer ' + token)
        .send({
          name: 'A new meal name',
          description: 'A new meal description',
          maxAmountOfParticipants: 6,
          price: 6.5,
        })
        .end((err, res) => {
          res.should.be.an('object')
          let { status, result } = res.body
          status.should.equal(200)
          result.should.be
            .an('object')
            .that.includes.keys('id', 'cookId', 'name', 'dateTime')
          result.should.include({ cookId: 1 })
          result.should.include({ name: 'A new meal name' })
          done()
        })
    })
  })

  describe('UC-303 Get all meals /api/meal', () => {
    it('TC-303 Get meals', (done) => {
      chai
        .request(server)
        .get('/api/meal')
        .end((err, res) => {
          res.should.be.an('object')
          let { status, result } = res.body
          status.should.equal(200)
          result.should.be.an('array')
          result.every((i) =>
            i.should.include.keys('id', 'name', 'isActive', 'cookId')
          )
          done()
        })
    })
  })

  describe('UC-304 Details of a meal /api/meal/:id', () => {
    it('TC-304-1 When an id does not exist, an error should be returned', (done) => {
      chai
        .request(server)
        .get('/api/meal/0')
        .end((err, res) => {
          res.should.be.an('object')
          let { status, message } = res.body
          status.should.equal(404)
          message.should.be.a('string').that.equals('Meal could not be found')
          done()
        })
    })

    it('TC-304-2 When an id does exist, a meal should be returned.', (done) => {
      chai
        .request(server)
        .get('/api/meal/1')
        .end((err, res) => {
          res.should.be.an('object')
          let { status, result } = res.body
          console.log(status, result)
          status.should.equal(200)
          result.should.be
            .an('object')
            .that.includes.keys('id', 'name', 'cookId', 'isActive')
          result.should.include({ id: 1 })
          done()
        })
    })
  })

  describe('UC-305 Delete meal /api/meal/:id', () => {
    it('TC-305-2 When a user is not logged in, an authorization error should be returned', (done) => {
      chai
        .request(server)
        .delete('/api/meal/1')
        //no header
        .end((err, res) => {
          res.should.be.an('object')
          let { status, message } = res.body
          status.should.equal(401)
          message.should.be
            .a('string')
            .that.equals('Authorization header missing')
        })
      chai
        .request(server)
        .delete('/api/meal/1')
        // no token
        .set('authorization', 'Bearer ' + ' ')
        .end((err, res) => {
          res.should.be.an('object')
          let { status, message } = res.body
          status.should.equal(401)
          message.should.be.a('string').that.equals('Not authorized')
          done()
        })
    })

    it('TC-305-3 When a user is not the owner, an authorization error should be returned', (done) => {
      chai
        .request(server)
        .delete('/api/meal/2')
        .set('authorization', 'Bearer ' + token)
        .end((err, res) => {
          res.should.be.an('object')
          let { status, message } = res.body
          status.should.equal(403)
          message.should.be
            .a('string')
            .that.equals('You are not authorized to delete this meal')
          done()
        })
    })

    it('TC-305-4 When a meal does not exist an error should be returned', (done) => {
      chai
        .request(server)
        .delete('/api/meal/0')
        .set('authorization', 'Bearer ' + token)
        .end((err, res) => {
          res.should.be.an('object')
          let { status, message } = res.body
          status.should.equal(404)
          message.should.be.a('string').that.equals('Meal does not exist')
          done()
        })
    })

    it('TC-305-5 Meal succesfully deleted', (done) => {
      chai
        .request(server)
        .delete('/api/meal/1')
        .set('authorization', 'Bearer ' + token)
        .end((err, res) => {
          res.should.be.an('object')
          let { status, message } = res.body
          console.log(status, message)
          status.should.equal(200)
          message.should.be
            .a('string')
            .that.equals('Meal with id 1 was deleted.')
          done()
        })
    })
  })

  describe('UC-401 Add participation for meal /api/meal/:id/participate', () => {
    it('TC-401-1 When a user is not logged in, an authorization error should be returned', (done) => {
      chai
        .request(server)
        .get('/api/meal/2/participate')
        //no header
        .end((err, res) => {
          res.should.be.an('object')
          let { status, message } = res.body
          status.should.equal(401)
          message.should.be
            .a('string')
            .that.equals('Authorization header missing')
        })
      chai
        .request(server)
        .get('/api/meal/2/participate')
        // no token
        .set('authorization', 'Bearer ' + ' ')
        .end((err, res) => {
          res.should.be.an('object')
          let { status, message } = res.body
          status.should.equal(401)
          message.should.be.a('string').that.equals('Not authorized')
          done()
        })
    })

    it('TC-401-2 When a meal does not exist an error should be returned', (done) => {
      chai
        .request(server)
        .get('/api/meal/0/participate')
        .set('authorization', 'Bearer ' + token)
        .end((err, res) => {
          res.should.be.an('object')
          let { status, message } = res.body
          status.should.equal(404)
          message.should.be.a('string').that.equals('Meal does not exist')
          done()
        })
    })

    it('TC-401-3 Participation succesfully added', (done) => {
      chai
        .request(server)
        .get('/api/meal/2/participate')
        .set('authorization', 'Bearer ' + token)
        .end((err, res) => {
          res.should.be.an('object')
          let { status, result } = res.body
          status.should.equal(200)
          result.should.be
            .an('object')
            .that.includes.keys(
              'currentlyParticipating',
              'currentAmountOfParticipants'
            )
          result.should.include({ currentlyParticipating: true })
          done()
        })
    })
  })

  describe('UC-402 Remove participation from meal /api/meal/:id/participate', () => {
    it('TC-402-1 When a user is not logged in, an authorization error should be returned', (done) => {
      chai
        .request(server)
        .get('/api/meal/2/participate')
        //no header
        .end((err, res) => {
          res.should.be.an('object')
          let { status, message } = res.body
          status.should.equal(401)
          message.should.be
            .a('string')
            .that.equals('Authorization header missing')
        })
      chai
        .request(server)
        .get('/api/meal/2/participate')
        // no token
        .set('authorization', 'Bearer ' + ' ')
        .end((err, res) => {
          res.should.be.an('object')
          let { status, message } = res.body
          status.should.equal(401)
          message.should.be.a('string').that.equals('Not authorized')
          done()
        })
    })

    it('TC-402-2 When a meal does not exist an error should be returned', (done) => {
      chai
        .request(server)
        .get('/api/meal/0/participate')
        .set('authorization', 'Bearer ' + token)
        .end((err, res) => {
          res.should.be.an('object')
          let { status, message } = res.body
          status.should.equal(404)
          message.should.be.a('string').that.equals('Meal does not exist')
          done()
        })
    })

    it('TC-402-3 Participation succesfully removed', (done) => {
      chai
        .request(server)
        .get('/api/meal/3/participate')
        .set('authorization', 'Bearer ' + token)
        .end((err, res) => {
          res.should.be.an('object')
          let { status, result } = res.body
          status.should.equal(200)
          result.should.be
            .an('object')
            .that.includes.keys(
              'currentlyParticipating',
              'currentAmountOfParticipants'
            )
          result.should.include({ currentlyParticipating: false })
          done()
        })
    })
  })
})
