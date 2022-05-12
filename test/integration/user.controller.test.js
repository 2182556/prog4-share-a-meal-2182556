process.env.DB_DATABASE = process.env.DB_DATABASE || 'share-a-meal-testdb'

const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../../index')

require('dotenv').config()
const dbconnection = require('../../database/dbconnection')

chai.should()
chai.use(chaiHttp)

/**
 * Db queries to clear and fill the test database before each test.
 */
const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM meal;'
const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM meal_participants_user;'
const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM user;'
const CLEAR_DB = CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE

/**
 * Voeg een user toe aan de database. Deze user heeft id 1.
 * Deze id kun je als foreign key gebruiken in de andere queries, bv insert studenthomes.
 */
const INSERT_USER =
  'INSERT INTO user (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
  '(1, "first", "last", "email@adress.com", "secret", "street", "city"),' +
  '(2, "Davide", "Ambesi", "d.ambesi@avans.nl", "secret", "street", "city");'

/**
 * Query om twee meals toe te voegen. Let op de UserId, die moet matchen
 * met de user die je ook toevoegt.
 */
const INSERT_MEALS =
  'INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES' +
  "(1, 'Meal A', 'description', 'image url', NOW(), 5, 6.50, 1)," +
  "(2, 'Meal B', 'description', 'image url', NOW(), 5, 6.50, 1);"

describe('Manage users', () => {
  before((done) => {
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err

      connection.query(CLEAR_USERS_TABLE, function (error, results, fields) {
        if (error) throw error
        connection.query(INSERT_USER, function (error, results, fields) {
          if (error) throw error
          connection.release()
          done()
        })
      })
    })
  })
  //Use case 201
  describe('UC-201 Register /api/user', () => {
    it('TC-201-1 When a required input is missing, a validation error should be returned', (done) => {
      chai
        .request(server)
        .post('/api/user')
        .send({
          //email is missing
          firstName: 'Assertion',
          lastName: 'Server',
          street: 'Lovensdijkstraat 61',
          city: 'Breda',
          isActive: true,
          password: 'secret',
          phoneNumber: '0612345678',
          roles: 'editor,guest',
        })
        .end((err, res) => {
          res.should.be.an('object')
          let { status, message } = res.body
          console.log(status, message)
          status.should.equal(400)
          message.should.be.a('string').that.equals('"emailAdress" is required')
        })
      chai
        .request(server)
        .post('/api/user')
        .send({
          //first name is missing
          lastName: 'Server',
          street: 'Lovensdijkstraat 61',
          city: 'Breda',
          isActive: true,
          password: 'secret',
          emailAdress: '2182556@avans.nl',
          phoneNumber: '0612345678',
          roles: 'editor,guest',
        })
        .end((err, res) => {
          res.should.be.an('object')
          let { status, message } = res.body
          status.should.equal(400)
          message.should.be.a('string').that.equals('"firstName" is required')
        })
      chai
        .request(server)
        .post('/api/user')
        .send({
          //last name is missing
          firstName: 'Assertion',
          street: 'Lovensdijkstraat 61',
          city: 'Breda',
          isActive: true,
          password: 'secret',
          emailAdress: '2182556@avans.nl',
          phoneNumber: '0612345678',
          roles: 'editor,guest',
        })
        .end((err, res) => {
          res.should.be.an('object')
          let { status, message } = res.body
          status.should.equal(400)
          message.should.be.a('string').that.equals('"lastName" is required')
        })
      chai
        .request(server)
        .post('/api/user')
        .send({
          //password is missing
          firstName: 'Assertion',
          lastName: 'Server',
          street: 'Lovensdijkstraat 61',
          city: 'Breda',
          isActive: true,
          emailAdress: '2182556@avans.nl',
          phoneNumber: '0612345678',
          roles: 'editor,guest',
        })
        .end((err, res) => {
          res.should.be.an('object')
          let { status, message } = res.body
          status.should.equal(400)
          message.should.be.a('string').that.equals('"password" is required')
          done()
        })
    })

    it('TC-201-2 When an invalid email address is submitted, a validation error should be returned', (done) => {
      chai
        .request(server)
        .post('/api/user')
        .send({
          //
          emailAdress: 'email@adress',
          firstName: 'Assertion',
          lastName: 'Server',
          street: 'Lovensdijkstraat 61',
          city: 'Breda',
          isActive: true,
          password: 'secret',
          phoneNumber: '0612345678',
          roles: 'editor,guest',
        })
        .end((err, res) => {
          res.should.be.an('object')
          let { status, message } = res.body
          status.should.equal(400)
          message.should.be
            .a('string')
            .that.equals('"emailAdress" must be a valid email')
        })
      chai
        .request(server)
        .post('/api/user')
        .send({
          //
          emailAdress: 'emailadress.com',
          firstName: 'Assertion',
          lastName: 'Server',
          street: 'Lovensdijkstraat 61',
          city: 'Breda',
          isActive: true,
          password: 'secret',
          phoneNumber: '0612345678',
          roles: 'editor,guest',
        })
        .end((err, res) => {
          res.should.be.an('object')
          let { status, message } = res.body
          status.should.equal(400)
          message.should.be
            .a('string')
            .that.equals('"emailAdress" must be a valid email')
          done()
        })
    })

    it.skip('TC-201-3 When an invalid password is submitted, a validation error should be returned', (done) => {})

    it('TC-201-4 When an emailadress is already in use, an error should be returned', (done) => {
      chai
        .request(server)
        .post('/api/user')
        .send({
          emailAdress: 'email@adress.com',
          firstName: 'Assertion',
          lastName: 'Server',
          street: 'Lovensdijkstraat 61',
          city: 'Breda',
          isActive: true,
          password: 'secret',
          phoneNumber: '0612345678',
          roles: 'editor,guest',
        })
        .end((err, res) => {
          res.should.be.an('object')
          let { status, message } = res.body
          status.should.equal(409)
          message.should.be
            .a('string')
            .that.equals(
              'The email address email@adress.com is already in use, please use a different emailaddress.'
            )
          done()
        })
    })

    it('TC-201-5 If none of the above apply, a user should be succesfully added.', (done) => {
      chai
        .request(server)
        .post('/api/user')
        .send({
          //
          emailAdress: 'anewemail@adress.com',
          firstName: 'Assertion',
          lastName: 'Server',
          street: 'Lovensdijkstraat 61',
          city: 'Breda',
          isActive: true,
          password: 'secret',
          phoneNumber: '0612345678',
          roles: 'editor,guest',
        })
        .end((err, res) => {
          res.should.be.an('object')
          let { status, result } = res.body
          console.log(status, result)
          status.should.equal(201)
          // result.should.be
          //   .a('string')
          //   .that.equals(
          //     'User with email address anewemail@adress.com was added.'
          //   )
          done()
        })
    })
  })
  //Use case 202
  describe('UC-202 Overview of all users /api/user', () => {
    it('TC-202-1 When all users are requested an empty database should return 0 users', (done) => {
      dbconnection.getConnection(function (err, connection) {
        if (err) throw err

        connection.query(CLEAR_USERS_TABLE, function (error, results, fields) {
          if (error) throw error
          connection.release()
        })
      })
      chai
        .request(server)
        .get('/api/user')
        .end((err, res) => {
          let { statusCode, result } = res.body
          statusCode.should.equal(200)
          result.should.be.an('array').that.is.empty
          done()
        })
    })

    it('TC-202-1 When all users are requested a database with 2 users should return 2 users', (done) => {
      dbconnection.getConnection(function (err, connection) {
        if (err) throw err

        connection.query(CLEAR_USERS_TABLE, function (error, results, fields) {
          if (error) throw error
          connection.query(INSERT_USER, function (error, results, fields) {
            if (error) throw error
            connection.release()
          })
        })
      })
      chai
        .request(server)
        .get('/api/user')
        .end((err, res) => {
          let { statusCode, result } = res.body
          statusCode.should.equal(200)
          result.should.be.an('array').that.has.a.lengthOf(2)
          done()
        })
    })

    //test cases for the search function to come, as it has not been implemented yet
  })

  describe('UC-203 Token /api/user/profile', () => {
    //test cases for the token to come, as it has not been implemented yet
  })

  describe('UC-204 Details of a user /api/user/:id', () => {
    //test cases for the token to come, as it has not been implemented yet
    it('TC-204-2 When an id does not exist, an error should be returned', (done) => {
      chai
        .request(server)
        .get('/api/user/1111')
        .end((err, res) => {
          res.should.be.an('object')
          let { status, message } = res.body
          status.should.equal(404)
          message.should.be
            .a('string')
            .that.equals('User with id 1111 not found')
          done()
        })
    })

    it('TC-204-3 When an id does exist, a user should be returned.', (done) => {
      chai
        .request(server)
        .get('/api/user/1')
        .end((err, res) => {
          res.should.be.an('object')
          let { status, result } = res.body
          console.log(status, result)
          status.should.equal(200)
          done()
        })
    })
  })

  describe('UC-205 Update user /api/user', () => {
    it('TC-205-1 When a required input is missing, a validation error should be returned', (done) => {
      chai
        .request(server)
        .put('/api/user/1')
        .send({
          //email is missing
          firstName: 'Assertion',
          lastName: 'Server',
          street: 'Lovensdijkstraat 61',
          city: 'Breda',
          isActive: true,
          password: 'secret',
          phoneNumber: '0612345678',
          roles: 'editor,guest',
        })
        .end((err, res) => {
          res.should.be.an('object')
          let { status, message } = res.body
          console.log(status, message)
          status.should.equal(400)
          message.should.be.a('string').that.equals('"emailAdress" is required')
          done()
        })
    })
    //phoneNumber validation not yet implemented
    it('TC-205-3 When a user does not exist, an error should be returned', (done) => {
      chai
        .request(server)
        .put('/api/user/1111')
        .end((err, res) => {
          res.should.be.an('object')
          let { status, message } = res.body
          status.should.equal(400)
          message.should.be.a('string').that.equals('User does not exist')
          done()
        })
    })
    it('TC-205-6 User succesfully updated', (done) => {
      chai
        .request(server)
        .put('/api/user/1')
        .send({
          emailAdress: 'anyemail@gmail.com',
          firstName: 'Assertion',
          lastName: 'Server',
          street: 'Lovensdijkstraat 61',
          city: 'Breda',
          isActive: true,
          password: 'secret',
          phoneNumber: '0612345678',
          roles: 'editor,guest',
        })
        .end((err, res) => {
          res.should.be.an('object')
          let { status, message } = res.body
          status.should.equal(200)
          done()
        })
    })
  })

  describe('UC-206 Delete user /api/user/:id', () => {
    it('TC-206-1 When a user does not exist ', (done) => {
      chai
        .request(server)
        .delete('/api/user/1111')
        .end((err, res) => {
          // res.should.be.an('');
          let { status, message } = res.body
          console.log(status)
          status.should.equal(400)
          // result.should.be.a('string').that.equals('');
          done()
        })
    })
    it('TC-206-4 When a user is removed ', (done) => {
      chai
        .request(server)
        .delete('/api/user/1')
        .end((err, res) => {
          // res.should.be.an('');
          let { status, result } = res.body
          console.log(status, result)
          status.should.equal(200)
          // result.should.be.a('string').that.equals('');
          done()
        })
    })
  })
})
