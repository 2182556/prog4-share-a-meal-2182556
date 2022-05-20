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
  '(1, "first", "last", "email@adress.com", "Secret11", "1", "street", "city"),' +
  '(2, "Davide", "Ambesi", "d.ambesi@avans.nl", "Secret11", "0", "street", "city");'

const INSERT_MEALS =
  'INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES' +
  "(1, 'Meal A', 'description', 'image url', NOW(), 5, 6.50, 1)," +
  "(2, 'Meal B', 'description', 'image url', NOW(), 5, 6.50, 1);"

describe('Manage meals', () => {
  before((done) => {
    token = jwt.sign({ id: 1 }, jwtPrivateKey)
    done()
  })
  beforeEach((done) => {
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err

      connection.query(CLEAR_MEALS_TABLE, function (error, results, fields) {
        if (error) throw error
      })
      connection.query(
        CLEAR_PARTICIPANTS_TABLE,
        function (error, results, fields) {
          if (error) throw error
        }
      )
      connection.query(CLEAR_USERS_TABLE, function (error, results, fields) {
        if (error) throw error
      })
      connection.query(INSERT_USERS, function (error, results, fields) {
        if (error) throw error
        connection.release()
      })
      connection.query(INSERT_MEALS, function (error, results, fields) {
        if (error) throw error
        connection.release()
      })
    })
    done()
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
          dateTime: '2022-05-20T06:30:53.193Z',
          imageUrl:
            'https://betterchickencommitment.com/static/c4c65646cd882eb3b25feba0144c9113/ee604/white-chicken-cutout-2.png',
          allergenes: '[]',
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
          dateTime: '2022-05-20T06:30:53.193Z',
          imageUrl:
            'https://betterchickencommitment.com/static/c4c65646cd882eb3b25feba0144c9113/ee604/white-chicken-cutout-2.png',
          allergenes: '[]',
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
          allergenes: '[]',
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
          allergenes: '[]',
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
          allergenes: '[]',
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
          dateTime: '2022-05-20T06:30:53.193Z',
          imageUrl:
            'https://betterchickencommitment.com/static/c4c65646cd882eb3b25feba0144c9113/ee604/white-chicken-cutout-2.png',
          allergenes: '[]',
          maxAmountOfParticipants: 6,
          price: 6.5,
        })
        .end((err, res) => {
          res.should.be.an('object')
          let { status, result } = res.body
          status.should.equal(201)
          done()
        })
    })

    // it('TC-201-2 When an invalid email address is submitted, a validation error should be returned', (done) => {
    //   chai
    //     .request(server)
    //     .post('/api/meal')
    //     .set('authorization', 'Bearer ' + token)
    //     .send({
    //       emailAdress: 'email@adress',
    //       firstName: 'firstName',
    //       lastName: 'lastName',
    //       street: 'Lovensdijkstraat 61',
    //       city: 'Breda',
    //       isActive: true,
    //       password: 'Secret11',
    //       phoneNumber: '0612345678',
    //       roles: 'editor,guest',
    //     })
    //     .end((err, res) => {
    //       res.should.be.an('object')
    //       let { status, message } = res.body
    //       status.should.equal(400)
    //       message.should.be
    //         .a('string')
    //         .that.equals('"emailAdress" must be a valid email')
    //     })
    //   chai
    //     .request(server)
    //     .post('/api/meal')
    //     .set('authorization', 'Bearer ' + token)
    //     .send({
    //       emailAdress: 'emailadress.com',
    //       firstName: 'firstName',
    //       lastName: 'lastName',
    //       street: 'Lovensdijkstraat 61',
    //       city: 'Breda',
    //       isActive: true,
    //       password: 'Secret11',
    //       phoneNumber: '0612345678',
    //       roles: 'editor,guest',
    //     })
    //     .end((err, res) => {
    //       res.should.be.an('object')
    //       let { status, message } = res.body
    //       status.should.equal(400)
    //       message.should.be
    //         .a('string')
    //         .that.equals('"emailAdress" must be a valid email')
    //       done()
    //     })
    // })

    // it('TC-201-3 When an invalid password is submitted, a validation error should be returned', (done) => {
    //   chai
    //     .request(server)
    //     .post('/api/user')
    //     .send({
    //       //password too short
    //       password: 'Secret1',
    //       emailAdress: 'email@adress.com',
    //       firstName: 'firstName',
    //       lastName: 'lastName',
    //       street: 'Lovensdijkstraat 61',
    //       city: 'Breda',
    //       isActive: true,
    //       phoneNumber: '0612345678',
    //       roles: 'editor,guest',
    //     })
    //     .end((err, res) => {
    //       res.should.be.an('object')
    //       let { status, message } = res.body
    //       status.should.equal(400)
    //       message.should.be
    //         .a('string')
    //         .that.equals(
    //           'Password should be at least 8 characters, contain one capital letter and one number'
    //         )
    //     })
    //   chai
    //     .request(server)
    //     .post('/api/user')
    //     .send({
    //       //password does not contain capital letter
    //       password: 'secret11',
    //       emailAdress: 'email@adress.com',
    //       firstName: 'firstName',
    //       lastName: 'lastName',
    //       street: 'Lovensdijkstraat 61',
    //       city: 'Breda',
    //       isActive: true,
    //       phoneNumber: '0612345678',
    //       roles: 'editor,guest',
    //     })
    //     .end((err, res) => {
    //       res.should.be.an('object')
    //       let { status, message } = res.body
    //       status.should.equal(400)
    //       message.should.be
    //         .a('string')
    //         .that.equals(
    //           'Password should be at least 8 characters, contain one capital letter and one number'
    //         )
    //     })
    //   chai
    //     .request(server)
    //     .post('/api/user')
    //     .send({
    //       //password does not contain numerical value
    //       password: 'Secretone',
    //       emailAdress: 'email@adress.com',
    //       firstName: 'firstName',
    //       lastName: 'lastName',
    //       street: 'Lovensdijkstraat 61',
    //       city: 'Breda',
    //       isActive: true,
    //       phoneNumber: '0612345678',
    //       roles: 'editor,guest',
    //     })
    //     .end((err, res) => {
    //       res.should.be.an('object')
    //       let { status, message } = res.body
    //       status.should.equal(400)
    //       message.should.be
    //         .a('string')
    //         .that.equals(
    //           'Password should be at least 8 characters, contain one capital letter and one number'
    //         )
    //     })
    //   chai
    //     .request(server)
    //     .post('/api/user')
    //     .send({
    //       //password does not contain lowercase letter
    //       password: 'SECRET11',
    //       emailAdress: 'email@adress.com',
    //       firstName: 'firstName',
    //       lastName: 'lastName',
    //       street: 'Lovensdijkstraat 61',
    //       city: 'Breda',
    //       isActive: true,
    //       phoneNumber: '0612345678',
    //       roles: 'editor,guest',
    //     })
    //     .end((err, res) => {
    //       res.should.be.an('object')
    //       let { status, message } = res.body
    //       status.should.equal(400)
    //       message.should.be
    //         .a('string')
    //         .that.equals(
    //           'Password should be at least 8 characters, contain one capital letter and one number'
    //         )
    //     })
    //   chai
    //     .request(server)
    //     .post('/api/user')
    //     .send({
    //       //password contains line break
    //       password: 'Secret1\n1',
    //       emailAdress: 'email@adress.com',
    //       firstName: 'firstName',
    //       lastName: 'lastName',
    //       street: 'Lovensdijkstraat 61',
    //       city: 'Breda',
    //       isActive: true,
    //       phoneNumber: '0612345678',
    //       roles: 'editor,guest',
    //     })
    //     .end((err, res) => {
    //       res.should.be.an('object')
    //       let { status, message } = res.body
    //       status.should.equal(400)
    //       message.should.be
    //         .a('string')
    //         .that.equals(
    //           'Password should be at least 8 characters, contain one capital letter and one number'
    //         )
    //       done()
    //     })
    // })

    // it('TC-201-4 When an emailadress is already in use, an error should be returned', (done) => {
    //   chai
    //     .request(server)
    //     .post('/api/user')
    //     .send({
    //       emailAdress: 'email@adress.com',
    //       firstName: 'firstName',
    //       lastName: 'lastName',
    //       street: 'Lovensdijkstraat 61',
    //       city: 'Breda',
    //       isActive: true,
    //       password: 'Secret11',
    //       phoneNumber: '0612345678',
    //       roles: 'editor,guest',
    //     })
    //     .end((err, res) => {
    //       res.should.be.an('object')
    //       let { status, message } = res.body
    //       status.should.equal(409)
    //       message.should.be
    //         .a('string')
    //         .that.equals(
    //           'The email address email@adress.com is already in use, please use a different emailaddress.'
    //         )
    //       done()
    //     })
    // })

    // it('TC-201-5 If none of the above apply, a user should be succesfully added.', (done) => {
    //   chai
    //     .request(server)
    //     .post('/api/user')
    //     .send({
    //       emailAdress: 'anewemail@adress.com',
    //       firstName: 'firstName',
    //       lastName: 'lastName',
    //       street: 'Lovensdijkstraat 61',
    //       city: 'Breda',
    //       isActive: true,
    //       password: 'Secret11',
    //       phoneNumber: '0612345678',
    //       roles: 'editor,guest',
    //     })
    //     .end((err, res) => {
    //       res.should.be.an('object')
    //       let { status, result } = res.body
    //       console.log(status, result)
    //       status.should.equal(201)
    //       result.should.be
    //         .an('object')
    //         .that.includes.keys('id', 'firstName', 'lastName', 'emailAdress')
    //       done()
    //     })
    // })
  })
})
