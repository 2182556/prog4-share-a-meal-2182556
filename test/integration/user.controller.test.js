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
const CLEAR_DB =
  CLEAR_MEALS_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE

const INSERT_USERS =
  'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `isActive` , `street`, `city` ) VALUES' +
  '(1, "first", "last", "email@adress.com", "$2b$10$9HWpL3XxxAlu/JZ3.AsO7.kuJvVvoLQg84GIpYQ8kM03G6h6WLXfS", 1, "street", "city"),' +
  '(2, "Davide", "Ambesi", "d.ambesi@avans.nl", "$2b$10$9HWpL3XxxAlu/JZ3.AsO7.kuJvVvoLQg84GIpYQ8kM03G6h6WLXfS", 0, "street", "city");'

const INSERT_MEALS =
  'INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`, `allergenes` ) VALUES' +
  "(1, 'Meal A', 'description', 'image url', '2022-06-22 17:35:00', 5, 6.50, 1, 'lactose,gluten')," +
  "(2, 'Meal B', 'description', 'image url', '2022-07-22 18:00:00', 5, 6.50, 2, '');"

const FULL_QUERY =
  CLEAR_MEALS_TABLE +
  CLEAR_PARTICIPANTS_TABLE +
  CLEAR_USERS_TABLE +
  INSERT_USERS +
  INSERT_MEALS

describe('Manage users', () => {
  before((done) => {
    token = jwt.sign({ id: 1 }, jwtPrivateKey)
    done()
  })
  beforeEach((done) => {
    dbconnection.getConnection((err, connection) => {
      if (err) throw err

      connection.query(FULL_QUERY, (error, results, fields) => {
        connection.release()
        if (error) throw error
        done()
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
          firstName: 'firstName',
          lastName: 'lastName',
          street: 'Lovensdijkstraat 61',
          city: 'Breda',
          isActive: true,
          password: 'Secret11',
          phoneNumber: '0612345678',
        })
        .end((err, res) => {
          res.should.be.an('object')
          let { status, message } = res.body
          status.should.equal(400)
          message.should.be.a('string').that.equals('"emailAdress" is required')
        })
      chai
        .request(server)
        .post('/api/user')
        .send({
          //first name is missing
          lastName: 'lastName',
          street: 'Lovensdijkstraat 61',
          city: 'Breda',
          isActive: true,
          password: 'Secret11',
          emailAdress: '2182556@avans.nl',
          phoneNumber: '0612345678',
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
          firstName: 'firstName',
          street: 'Lovensdijkstraat 61',
          city: 'Breda',
          isActive: true,
          password: 'Secret11',
          emailAdress: '2182556@avans.nl',
          phoneNumber: '0612345678',
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
          firstName: 'firstName',
          lastName: 'lastName',
          street: 'Lovensdijkstraat 61',
          city: 'Breda',
          isActive: true,
          emailAdress: '2182556@avans.nl',
          phoneNumber: '0612345678',
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
          emailAdress: 'email@adress',
          firstName: 'firstName',
          lastName: 'lastName',
          street: 'Lovensdijkstraat 61',
          city: 'Breda',
          isActive: true,
          password: 'Secret11',
          phoneNumber: '0612345678',
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
          emailAdress: 'emailadress.com',
          firstName: 'firstName',
          lastName: 'lastName',
          street: 'Lovensdijkstraat 61',
          city: 'Breda',
          isActive: true,
          password: 'Secret11',
          phoneNumber: '0612345678',
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

    it('TC-201-3 When an invalid password is submitted, a validation error should be returned', (done) => {
      chai
        .request(server)
        .post('/api/user')
        .send({
          //password too short
          password: 'Secret1',
          emailAdress: 'email@adress.com',
          firstName: 'firstName',
          lastName: 'lastName',
          street: 'Lovensdijkstraat 61',
          city: 'Breda',
          isActive: true,
          phoneNumber: '0612345678',
        })
        .end((err, res) => {
          res.should.be.an('object')
          let { status, message } = res.body
          status.should.equal(400)
          message.should.be
            .a('string')
            .that.equals(
              'Password should be at least 8 characters, contain one capital letter and one number'
            )
        })
      chai
        .request(server)
        .post('/api/user')
        .send({
          //password does not contain capital letter
          password: 'secret11',
          emailAdress: 'email@adress.com',
          firstName: 'firstName',
          lastName: 'lastName',
          street: 'Lovensdijkstraat 61',
          city: 'Breda',
          isActive: true,
          phoneNumber: '0612345678',
        })
        .end((err, res) => {
          res.should.be.an('object')
          let { status, message } = res.body
          status.should.equal(400)
          message.should.be
            .a('string')
            .that.equals(
              'Password should be at least 8 characters, contain one capital letter and one number'
            )
        })
      chai
        .request(server)
        .post('/api/user')
        .send({
          //password does not contain numerical value
          password: 'Secretone',
          emailAdress: 'email@adress.com',
          firstName: 'firstName',
          lastName: 'lastName',
          street: 'Lovensdijkstraat 61',
          city: 'Breda',
          isActive: true,
          phoneNumber: '0612345678',
        })
        .end((err, res) => {
          res.should.be.an('object')
          let { status, message } = res.body
          status.should.equal(400)
          message.should.be
            .a('string')
            .that.equals(
              'Password should be at least 8 characters, contain one capital letter and one number'
            )
        })
      chai
        .request(server)
        .post('/api/user')
        .send({
          //password does not contain lowercase letter
          password: 'SECRET11',
          emailAdress: 'email@adress.com',
          firstName: 'firstName',
          lastName: 'lastName',
          street: 'Lovensdijkstraat 61',
          city: 'Breda',
          isActive: true,
          phoneNumber: '0612345678',
        })
        .end((err, res) => {
          res.should.be.an('object')
          let { status, message } = res.body
          status.should.equal(400)
          message.should.be
            .a('string')
            .that.equals(
              'Password should be at least 8 characters, contain one capital letter and one number'
            )
        })
      chai
        .request(server)
        .post('/api/user')
        .send({
          //password contains line break
          password: 'Secret1\n1',
          emailAdress: 'email@adress.com',
          firstName: 'firstName',
          lastName: 'lastName',
          street: 'Lovensdijkstraat 61',
          city: 'Breda',
          isActive: true,
          phoneNumber: '0612345678',
        })
        .end((err, res) => {
          res.should.be.an('object')
          let { status, message } = res.body
          status.should.equal(400)
          message.should.be
            .a('string')
            .that.equals(
              'Password should be at least 8 characters, contain one capital letter and one number'
            )
          done()
        })
    })

    it('TC-201-4 When an emailadress is already in use, an error should be returned', (done) => {
      chai
        .request(server)
        .post('/api/user')
        .send({
          emailAdress: 'email@adress.com',
          firstName: 'firstName',
          lastName: 'lastName',
          street: 'Lovensdijkstraat 61',
          city: 'Breda',
          isActive: true,
          password: 'Secret11',
          phoneNumber: '0612345678',
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
          emailAdress: 'anewemail@adress.com',
          firstName: 'firstName',
          lastName: 'lastName',
          street: 'Lovensdijkstraat 61',
          city: 'Breda',
          isActive: true,
          password: 'Secret11',
          phoneNumber: '0612345678',
          roles: ['editor', 'admin'],
        })
        .end((err, res) => {
          res.should.be.an('object')
          let { status, result } = res.body
          status.should.equal(201)
          result.should.be
            .an('object')
            .that.includes.keys('id', 'firstName', 'lastName', 'emailAdress')
          result.should.include({ emailAdress: 'anewemail@adress.com' })
          done()
        })
    })
  })
  //Use case 202
  describe('UC-202 Overview of all users /api/user', () => {
    it('TC-202-1 When all users are requested an empty database should return 0 users', (done) => {
      dbconnection.getConnection((err, connection) => {
        if (err) throw err
        connection.query(CLEAR_DB, (error, results, fields) => {
          if (error) throw error
          connection.release()
        })
      })
      chai
        .request(server)
        .get('/api/user')
        .set('authorization', 'Bearer ' + token)
        .end((err, res) => {
          let { status, result } = res.body
          status.should.equal(200)
          result.should.be.an('array').that.is.empty
          done()
        })
    })

    it('TC-202-2 When all users are requested a database with 2 users should return 2 users', (done) => {
      chai
        .request(server)
        .get('/api/user')
        .set('authorization', 'Bearer ' + token)
        .end((err, res) => {
          let { status, result } = res.body
          status.should.equal(200)
          result.should.be.an('array').that.has.a.lengthOf(2)
          done()
        })
    })

    it('TC-202-3 When requesting a user by a non-existing name, an empty list should be returned', (done) => {
      chai
        .request(server)
        .get('/api/user?firstName=nonexistent')
        .set('authorization', 'Bearer ' + token)
        .end((err, res) => {
          let { status, result } = res.body
          status.should.equal(200)
          result.should.be.an('array').that.is.empty
          done()
        })
    })

    it('TC-202-4 When requesting users by isActive=false, a list should be returned with users that are not active', (done) => {
      chai
        .request(server)
        .get('/api/user?isActive=false')
        .set('authorization', 'Bearer ' + token)
        .end((err, res) => {
          let { status, result } = res.body
          status.should.equal(200)
          result.should.be.an('array')
          result.every((i) => i.should.include({ isActive: false }))
          done()
        })
    })

    it('TC-202-5 When requesting users by isActive=true, a list should be returned with users that are active', (done) => {
      chai
        .request(server)
        .get('/api/user?isActive=true')
        .set('authorization', 'Bearer ' + token)
        .end((err, res) => {
          let { status, result } = res.body
          status.should.equal(200)
          result.should.be.an('array')
          result.every((i) => i.should.include({ isActive: true }))
          done()
        })
    })

    it('TC-202-6 When requesting a user by an existing name, one or more users should be returned', (done) => {
      chai
        .request(server)
        .get('/api/user?firstName=Davide')
        .set('authorization', 'Bearer ' + token)
        .end((err, res) => {
          let { status, result } = res.body
          status.should.equal(200)
          result.should.be.an('array').that.is.not.empty
          result.every((i) => i.should.include({ firstName: 'Davide' }))
          done()
        })
    })
  })

  describe('UC-203 Get user profile /api/user/profile', () => {
    it('TC-203-1 When a token is invalid, an authentication error should be returned', (done) => {
      chai
        .request(server)
        .get('/api/user/profile')
        .set('authorization', 'Bearer ' + ' ')
        .end((err, res) => {
          res.should.be.an('object')
          let { status, message } = res.body
          status.should.equal(401)
          message.should.be.a('string').that.equals('Not authorized')
          done()
        })
    })

    it('TC-203-2 When a token is valid, the profile of the logged in user should be returned', (done) => {
      chai
        .request(server)
        .get('/api/user/profile')
        .set('authorization', 'Bearer ' + token)
        .end((err, res) => {
          res.should.be.an('object')
          let { status, result } = res.body
          status.should.equal(200)
          result.should.include({ id: 1 })
          done()
        })
    })
  })

  describe('UC-204 Details of a user /api/user/:id', () => {
    it('TC-204-1 When a token is invalid, an authentication error should be returned', (done) => {
      chai
        .request(server)
        .get('/api/user/1')
        .set('authorization', 'Bearer ' + ' ')
        .end((err, res) => {
          res.should.be.an('object')
          let { status, message } = res.body
          status.should.equal(401)
          message.should.be.a('string').that.equals('Not authorized')
          done()
        })
    })

    it('TC-204-2 When an id does not exist, an error should be returned', (done) => {
      chai
        .request(server)
        .get('/api/user/1111')
        .set('authorization', 'Bearer ' + token)
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
        .set('authorization', 'Bearer ' + token)
        .end((err, res) => {
          res.should.be.an('object')
          let { status, result } = res.body
          status.should.equal(200)
          result.should.be
            .an('object')
            .that.includes.keys('id', 'firstName', 'lastName', 'emailAdress')
          result.should.include({ id: 1 })
          done()
        })
    })
  })

  describe('UC-205 Update user /api/user', () => {
    it('TC-205-1 When a required input (emailAdress) is missing, a validation error should be returned', (done) => {
      chai
        .request(server)
        .put('/api/user/1')
        .set('authorization', 'Bearer ' + token)
        .send({
          //email is missing
          firstName: 'firstName',
          lastName: 'lastName',
          street: 'Lovensdijkstraat 61',
          city: 'Breda',
          isActive: true,
          password: 'Secret11',
          phoneNumber: '0612345678',
        })
        .end((err, res) => {
          res.should.be.an('object')
          let { status, message } = res.body
          status.should.equal(400)
          message.should.be.a('string').that.equals('"emailAdress" is required')
          done()
        })
    })

    //TC-205-2 Invalid zipcode, but zipcode has not been added to the database yet

    it('TC-205-3 When a phone number is not valid, a validation error should be returned', (done) => {
      chai
        .request(server)
        .put('/api/user/1')
        .set('authorization', 'Bearer ' + token)
        .send({
          emailAdress: 'email@adress.com',
          firstName: 'firstName',
          lastName: 'lastName',
          street: 'Lovensdijkstraat 61',
          city: 'Breda',
          isActive: true,
          password: 'Secret11',
          phoneNumber: '0612345678b',
        })
        .end((err, res) => {
          res.should.be.an('object')
          let { status, message } = res.body
          status.should.equal(400)
          message.should.be
            .a('string')
            .that.equals(
              "phoneNumber should have at least 9 digits and can start with '+', and contain one '-' or ' '"
            )
        })
      chai
        .request(server)
        .put('/api/user/1')
        .set('authorization', 'Bearer ' + token)
        .send({
          emailAdress: 'email@adress.com',
          firstName: 'firstName',
          lastName: 'lastName',
          street: 'Lovensdijkstraat 61',
          city: 'Breda',
          isActive: true,
          password: 'Secret11',
          phoneNumber: '-0612345678',
        })
        .end((err, res) => {
          res.should.be.an('object')
          let { status, message } = res.body
          status.should.equal(400)
          message.should.be
            .a('string')
            .that.equals(
              "phoneNumber should have at least 9 digits and can start with '+', and contain one '-' or ' '"
            )
        })
      chai
        .request(server)
        .put('/api/user/1')
        .set('authorization', 'Bearer ' + token)
        .send({
          emailAdress: 'email@adress.com',
          firstName: 'firstName',
          lastName: 'lastName',
          street: 'Lovensdijkstraat 61',
          city: 'Breda',
          isActive: true,
          password: 'Secret11',
          phoneNumber: '06+12345678',
        })
        .end((err, res) => {
          res.should.be.an('object')
          let { status, message } = res.body
          status.should.equal(400)
          message.should.be
            .a('string')
            .that.equals(
              "phoneNumber should have at least 9 digits and can start with '+', and contain one '-' or ' '"
            )
        })
      chai
        .request(server)
        .put('/api/user/1')
        .set('authorization', 'Bearer ' + token)
        .send({
          emailAdress: 'email@adress.com',
          firstName: 'firstName',
          lastName: 'lastName',
          street: 'Lovensdijkstraat 61',
          city: 'Breda',
          isActive: true,
          password: 'Secret11',
          phoneNumber: '+31- 612345678',
        })
        .end((err, res) => {
          res.should.be.an('object')
          let { status, message } = res.body
          status.should.equal(400)
          message.should.be
            .a('string')
            .that.equals(
              "phoneNumber should have at least 9 digits and can start with '+', and contain one '-' or ' '"
            )
        })
      chai
        .request(server)
        .put('/api/user/1')
        .set('authorization', 'Bearer ' + token)
        .send({
          emailAdress: 'email@adress.com',
          firstName: 'firstName',
          lastName: 'lastName',
          street: 'Lovensdijkstraat 61',
          city: 'Breda',
          isActive: true,
          password: 'Secret11',
          phoneNumber: '12345678',
        })
        .end((err, res) => {
          res.should.be.an('object')
          let { status, message } = res.body
          status.should.equal(400)
          message.should.be
            .a('string')
            .that.equals(
              "phoneNumber should have at least 9 digits and can start with '+', and contain one '-' or ' '"
            )
          done()
        })
    })

    it('TC-205-4 When a user does not exist, an error should be returned', (done) => {
      chai
        .request(server)
        .put('/api/user/1111')
        .set('authorization', 'Bearer ' + token)
        .end((err, res) => {
          res.should.be.an('object')
          let { status, message } = res.body
          status.should.equal(400)
          message.should.be.a('string').that.equals('User does not exist')
          done()
        })
    })

    it('TC-205-5 When a user is not logged in, an authorization error should be returned', (done) => {
      chai
        .request(server)
        .put('/api/user/1')
        //no token
        .set('authorization', 'Bearer ' + ' ')
        .end((err, res) => {
          res.should.be.an('object')
          let { status, message } = res.body
          status.should.equal(401)
          message.should.be.a('string').that.equals('Not authorized')
        })
      chai
        .request(server)
        //wrong user
        .put('/api/user/2')
        .set('authorization', 'Bearer ' + token)
        .end((err, res) => {
          res.should.be.an('object')
          let { status, message } = res.body
          status.should.equal(403)
          message.should.be
            .a('string')
            .that.equals('You are not authorized to update this user')
          done()
        })
    })

    it('TC-205-6 User succesfully updated', (done) => {
      chai
        .request(server)
        .put('/api/user/1')
        .set('authorization', 'Bearer ' + token)
        .send({
          emailAdress: 'anyemail@gmail.com',
          firstName: 'firstName',
          lastName: 'lastName',
          street: 'Lovensdijkstraat 61',
          city: 'Breda',
          isActive: true,
          password: 'Secret11',
          phoneNumber: '0612345678',
        })
        .end((err, res) => {
          res.should.be.an('object')
          let { status, result } = res.body
          status.should.equal(200)
          result.should.be
            .an('object')
            .that.includes.keys('id', 'firstName', 'lastName', 'emailAdress')
          result.should.include({ id: 1 })
          result.should.include({ emailAdress: 'anyemail@gmail.com' })
          done()
        })
    })
  })

  describe('UC-206 Delete user /api/user/:id', () => {
    beforeEach((done) => {
      dbconnection.getConnection((err, connection) => {
        if (err) throw err

        connection.query(
          CLEAR_MEALS_TABLE + CLEAR_PARTICIPANTS_TABLE,
          (error, results, fields) => {
            connection.release()
            if (error) throw error
            done()
          }
        )
      })
    })
    it('TC-206-1 When a user does not exist an error should be returned', (done) => {
      chai
        .request(server)
        .delete('/api/user/1111')
        .set('authorization', 'Bearer ' + token)
        .end((err, res) => {
          res.should.be.an('object')
          let { status, message } = res.body
          status.should.equal(400)
          message.should.be.a('string').that.equals('User does not exist')
          done()
        })
    })

    it('TC-206-2 When a user is not logged in, an authorization error should be returned', (done) => {
      chai
        .request(server)
        .delete('/api/user/1')
        //no token
        .set('authorization', 'Bearer ' + ' ')
        .end((err, res) => {
          res.should.be.an('object')
          let { status, message } = res.body
          status.should.equal(401)
          message.should.be.a('string').that.equals('Not authorized')
          done()
        })
    })

    it('TC-206-3 When a user is not the owner, an authorization error should be returned', (done) => {
      chai
        .request(server)
        //wrong user
        .delete('/api/user/2')
        .set('authorization', 'Bearer ' + token)
        .end((err, res) => {
          res.should.be.an('object')
          let { status, message } = res.body
          status.should.equal(403)
          message.should.be
            .a('string')
            .that.equals('You are not authorized to delete this user')
          done()
        })
    })

    it('TC-206-4 User succesfully deleted', (done) => {
      chai
        .request(server)
        .delete('/api/user/1')
        .set('authorization', 'Bearer ' + token)
        .end((err, res) => {
          res.should.be.an('object')
          let { status, message } = res.body
          status.should.equal(200)
          message.should.be
            .a('string')
            .that.equals('User with id 1 was deleted.')
          done()
        })
    })
  })
})
