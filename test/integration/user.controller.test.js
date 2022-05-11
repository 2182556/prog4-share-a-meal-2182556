const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../index');
let database = [];

chai.should();
chai.use(chaiHttp);

describe('Manage users', () => {
  //Use case 201
  describe('UC-201 Register /api/user', () => {
    beforeEach((done) => {
      database = [];
      done();
    });
    //add it.only if you only want to test one several times (or it.skip)
    it('TC-201-1 When a required input is missing, a validation error should be returned', (done) => {
      chai
        .request(server)
        .post('/api/user')
        .send({
          //email is missing
          firstName: 'first name',
          lastName: 'last name',
          password: 'password',
        })
        .end((err, res) => {
          res.should.be.an('object');
          let { status, result } = res.body;
          status.should.equal(400);
          result.should.be.a('string').that.equals('"emailAdress" is required');
        });
      chai
        .request(server)
        .post('/api/user')
        .send({
          //first name is missing
          emailAdress: 'email@adress.com',
          lastName: 'last name',
          password: 'password',
        })
        .end((err, res) => {
          res.should.be.an('object');
          let { status, result } = res.body;
          status.should.equal(400);
          result.should.be.a('string').that.equals('"firstName" is required');
        });
      chai
        .request(server)
        .post('/api/user')
        .send({
          //last name is missing
          emailAdress: 'email@adress.com',
          firstName: 'first name',
          password: 'password',
        })
        .end((err, res) => {
          res.should.be.an('object');
          let { status, result } = res.body;
          status.should.equal(400);
          result.should.be.a('string').that.equals('"lastName" is required');
        });
      chai
        .request(server)
        .post('/api/user')
        .send({
          //password is missing
          emailAdress: 'email@adress.com',
          firstName: 'first name',
          lastName: 'last name',
        })
        .end((err, res) => {
          res.should.be.an('object');
          let { status, result } = res.body;
          status.should.equal(400);
          result.should.be.a('string').that.equals('"password" is required');
          done();
        });
    });

    it('TC-201-2 When an invalid email address is submitted, a validation error should be returned', (done) => {
      chai
        .request(server)
        .post('/api/user')
        .send({
          //
          emailAdress: 'email@adress',
          firstName: 'first name',
          lastName: 'last name',
          password: 'password',
        })
        .end((err, res) => {
          res.should.be.an('object');
          let { status, result } = res.body;
          status.should.equal(400);
          result.should.be
            .a('string')
            .that.equals('"emailAdress" must be a valid email');
        });
      chai
        .request(server)
        .post('/api/user')
        .send({
          //
          emailAdress: 'emailadress.com',
          firstName: 'first name',
          lastName: 'last name',
          password: 'password',
        })
        .end((err, res) => {
          res.should.be.an('object');
          let { status, result } = res.body;
          status.should.equal(400);
          result.should.be
            .a('string')
            .that.equals('"emailAdress" must be a valid email');
          done();
        });
    });
    it.skip('TC-201-3 When an invalid password is submitted, a validation error should be returned', (done) => {});
    it('TC-201-4 When an emailadress is already in use, an error should be returned', (done) => {
      chai
        .request(server)
        .post('/api/user')
        .send({
          //sending first request to check that an error is returned with the second request with the same emailaddress
          emailAdress: 'email@adress.com',
          firstName: 'first name',
          lastName: 'last name',
          password: 'password',
        })
        .end((err, res) => {});
      chai
        .request(server)
        .post('/api/user')
        .send({
          //
          emailAdress: 'email@adress.com',
          firstName: 'first name',
          lastName: 'last name',
          password: 'password',
        })
        .end((err, res) => {
          res.should.be.an('object');
          let { status, result } = res.body;
          status.should.equal(401);
          result.should.be
            .a('string')
            .that.equals(
              'The email address email@adress.com is already in use, please use a different emailaddress.'
            );
          done();
        });
    });
    it('TC-201-5 If none of the above apply, a user should be succesfully added.', (done) => {
      chai
        .request(server)
        .post('/api/user')
        .send({
          //
          emailAdress: 'anotheremail@adress.nl',
          firstName: 'first name',
          lastName: 'last name',
          password: 'password',
        })
        .end((err, res) => {
          res.should.be.an('object');
          let { status, result } = res.body;
          console.log(status, result);
          status.should.equal(201);
          result.should.be
            .a('string')
            .that.equals(
              'User with email address anotheremail@adress.nl was added.'
            );
          done();
        });
    });
  });
  //Use case 202
  describe('UC-202 Overview of all users /api/user', () => {
    beforeEach((done) => {
      database = [];
      done();
    });
    //add it.only if you only want to test one several times (or it.skip)
    it.skip('TC-202-1 When all users are requested an empty database should return 0 users', (done) => {
      chai
        .request(server)
        .get('/api/user')
        .end((err, res) => {
          // res.should.be.an('');
          let { statusCode, results } = res.body;
          console.log(statusCode, results);
          statusCode.should.equal(200);
          // result.should.be.a('string').that.equals('');
          done();
        });
    });
  });
  describe('UC-206 Delete user /api/user/:id', () => {
    beforeEach((done) => {
      database = [];
      done();
    });
    //add it.only if you only want to test one several times (or it.skip)
    it('TC-206-4 When a user is removed ', (done) => {
      chai
        .request(server)
        .delete('/api/user/47')
        .end((err, res) => {
          // res.should.be.an('');
          let { status, result } = res.body;
          console.log(status, result);
          status.should.equal(201);
          // result.should.be.a('string').that.equals('');
          done();
        });
    });
  });
});
