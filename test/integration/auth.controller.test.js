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
  "(2, 'Meal B', 'description', 'image url', '2022-07-22 18:00:00', 5, 6.50, 2, '');"

const FULL_QUERY =
  CLEAR_MEALS_TABLE +
  CLEAR_PARTICIPANTS_TABLE +
  CLEAR_USERS_TABLE +
  INSERT_USERS +
  INSERT_MEALS

describe('Login', () => {
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
  describe('UC-101 Login /api/auth/login', () => {
    it('TC-101-1 When a required input is missing, a validation error should be returned', (done) => {
      chai
        .request(server)
        .post('/api/auth/login')
        .send({
          //email is missing
          password: 'Secret11',
        })
        .end((err, res) => {
          res.should.be.an('object')
          let { status, message } = res.body
          status.should.equal(400)
          message.should.be.a('string').that.equals('"emailAdress" is required')
        })
      chai
        .request(server)
        .post('/api/auth/login')
        .send({
          //password is missing
          emailAdress: '2182556@avans.nl',
        })
        .end((err, res) => {
          res.should.be.an('object')
          let { status, message } = res.body
          status.should.equal(400)
          message.should.be.a('string').that.equals('"password" is required')
          done()
        })
    })

    it('TC-101-2 When an invalid email address is submitted, a validation error should be returned', (done) => {
      chai
        .request(server)
        .post('/api/auth/login')
        .send({
          emailAdress: 'email@adress',
          password: 'Secret11',
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
        .post('/api/auth/login')
        .send({
          emailAdress: 'emailadress.com',
          password: 'Secret11',
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

    it('TC-101-3 When an invalid password is submitted, a validation error should be returned', (done) => {
      chai
        .request(server)
        .post('/api/auth/login')
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
          roles: 'editor,guest',
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
        .post('/api/auth/login')
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
          roles: 'editor,guest',
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
        .post('/api/auth/login')
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
          roles: 'editor,guest',
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
        .post('/api/auth/login')
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
          roles: 'editor,guest',
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
        .post('/api/auth/login')
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
          roles: 'editor,guest',
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
      done()
    })

    it('TC-101-4 User does not exist', (done) => {
      chai
        .request(server)
        .post('/api/auth/login')
        .send({
          emailAdress: 'random@adress.com',
          password: 'Secret11',
        })
        .end((err, res) => {
          res.should.be.an('object')
          let { status, message } = res.body
          status.should.equal(404)
          message.should.be
            .a('string')
            .that.equals('There was no user found with this emailAdress')
          done()
        })
    })

    it('TC-101-5 User succesfully logged in', (done) => {
      chai
        .request(server)
        .post('/api/auth/login')
        .send({
          emailAdress: 'email@adress.com',
          password: 'Secret11',
        })
        .end((err, res) => {
          res.should.be.an('object')
          let { status, result } = res.body
          status.should.equal(200)
          result.should.be.an('object').that.includes.key('token')
          result.should.include({ id: 1 })
          done()
        })
    })
  })
})
