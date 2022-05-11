const database = require('../../database/inmemdb');
const dbconnection = require('../../database/dbconnection');
const assert = require('assert');
const Joi = require('joi');
let userDatabase = [];
let id = 0;

const userSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  emailAdress: Joi.string().required().email({
    minDomainSegments: 2,
  }),
  street: Joi.string().default(''),
  city: Joi.string().default(1),
  isActive: Joi.boolean().default(true),
  password: Joi.string().required(),
  phoneNumber: Joi.string().default(''),
  roles: Joi.string().default('editor,guest'),
});

module.exports = {
  validateUser: (req, res, next) => {
    console.log('Validating input');
    let user = req.body;

    const { error, value } = userSchema.validate(req.body);
    console.log(value);
    if (error == undefined) {
      next();
    } else {
      console.log(error.message);
      const err = {
        status: 400,
        result: error.message,
      };
      next(err);
    }
  },
  checkUniqueEmail: (req, res, next) => {
    console.log('Checking if email is unique');
    if (req.body.emailAdress != undefined) {
      dbconnection.getConnection(function (err, connection) {
        if (err) throw err;

        connection.query(
          `SELECT * FROM user WHERE emailAdress='${req.body.emailAdress}';`,
          function (error, results, fields) {
            connection.release();

            if (error) throw error;

            var user = Object.assign({}, results[0]);
            if (results.length > 0 && user.id != req.params.id) {
              const error = {
                status: 401,
                result: `The email address ${req.body.emailAdress} is already in use, please use a different emailaddress.`,
              };
              next(error);
            } else {
              next();
            }
          }
        );
      });
    } else {
      next();
    }
  },
  addUser: (req, res) => {
    const { error, value } = userSchema.validate(req.body);
    console.log('addUser called');
    console.log(value);
    let user = value;
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;

      connection.query(
        `INSERT INTO user (firstName,lastName,isActive,emailAdress,password,phoneNumber,roles,street,city) 
        VALUES(
          '${user.firstName}',
          '${user.lastName}',
          '${user.isActive}',
          '${user.emailAdress}',
          '${user.password}', 
          '${user.phoneNumber}',
          '${user.roles}',
          '${user.street}',
          '${user.city}'
          );`,
        function (error, results, fields) {
          connection.release();

          if (error) {
            console.log(error.sqlMessage);
            throw error;
          }

          res.status(201).json({
            status: 201,
            result: `User with email address ${user.emailAdress} was added.`,
          });
        }
      );

      // dbconnection.end((err) => {
      //   console.log("Pool was closed.");
      // });
    });
  },
  getAllUsers: (req, res, next) => {
    console.log('getAllUsers called');
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;

      connection.query(
        'SELECT * FROM user;',
        function (error, results, fields) {
          connection.release();

          if (error) throw error;

          console.log('results = ', results.length);
          res.status(200).json({
            statusCode: 200,
            results: results,
          });

          // dbconnection.end((err) => {
          //   console.log("Pool was closed.");
          // });
        }
      );
    });
  },
  getUserProfile: (req, res) => {
    res.status(503).json({
      status: 503,
      result: 'This feature has not been implemented yet.',
    });
  },
  getUserById: (req, res, next) => {
    console.log('getUserById called');
    const id = req.params.id;
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;

      connection.query(
        `SELECT * FROM user WHERE id=${id};`,
        function (error, results, fields) {
          connection.release();

          if (error) throw error;

          console.log('results = ', results.length);
          if (results.length > 0) {
            console.log(results);
            res.status(200).json({
              status: 200,
              result: results,
            });
          } else {
            const error = {
              status: 404,
              result: `User with id ${userId} not found`,
            };
            next(error);
          }

          // dbconnection.end((err) => {
          //   console.log("Pool was closed.");
          // });
        }
      );
    });
  },
  updateUser: (req, res) => {
    const id = req.params.id;
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;

      connection.query(
        `SELECT * FROM user WHERE id=${id};`,
        function (error, results, fields) {
          if (error) throw error;

          console.log('results = ', results.length);
          if (results.length > 0) {
            console.log(results[0]);
            var user = Object.assign({}, results[0]);
            console.log(user);
            const updateUserSchema = Joi.object({
              id: Joi.number().integer().default(`${user.id}`),
              firstName: Joi.string().default(`${user.firstName}`),
              lastName: Joi.string().default(`${user.lastName}`),
              emailAdress: Joi.string()
                .email({
                  minDomainSegments: 2,
                })
                .default(`${user.emailAdress}`),
              street: Joi.string().default(`${user.street}`),
              city: Joi.string().default(`${user.city}`),
              isActive: Joi.boolean().default(`${user.isActive}`),
              password: Joi.string().default(`${user.password}`),
              phoneNumber: Joi.string().default(`${user.phoneNumber}`),
              roles: Joi.string().default(`${user.phoneNumber}`),
            });
            const { error, value } = updateUserSchema.validate(req.body);
            console.log(value);
            connection.query(
              `UPDATE user SET firstName='${value.firstName}',lastName='${value.lastName}',isActive='${value.isActive}',emailAdress='${value.emailAdress}',password='${value.password}',phoneNumber='${value.phoneNumber}',roles='${value.roles}',street='${value.street}',city='${value.city}' WHERE id=${id};`,
              function (error, results, fields) {
                connection.release();

                if (error) {
                  const err = {
                    status: 400,
                    result: error.sqlMessage,
                  };
                  next(err);
                } else {
                  res.status(200).json({
                    status: 200,
                    result: `User with id ${id} has been updated.`,
                  });
                }
              }
            );
          } else {
            const error = {
              status: 404,
              result: `User with id ${id} not found`,
            };
            next(error);
          }

          // dbconnection.end((err) => {
          //   console.log("Pool was closed.");
          // });
        }
      );
    });
  },
  deleteUser: (req, res, next) => {
    const id = req.params.id;
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;

      connection.query(
        `SELECT * FROM user WHERE id=${id};`,
        function (error, results, fields) {
          if (error) throw error;

          console.log('results = ', results.length);
          if (results.length > 0) {
            connection.query(
              `DELETE FROM user WHERE id=${id};`,
              function (error, results, fields) {
                // console.log(error);
                // console.log(error.sqlMessage);
                if (error) {
                  console.log(error.sqlMessage);
                  const err = {
                    status: 400,
                    result: error.sqlMessage,
                  };
                  next(err);
                } else {
                  console.log('deleted');
                  res.status(201).json({
                    status: 201,
                    result: `User with id ${id} was deleted.`,
                  });
                }
              }
            );

            // dbconnection.end((err) => {
            //   console.log("Pool was closed.");
            // });
          } else {
            const err = {
              status: 404,
              result: `User with id ${id} not found`,
            };
            next(err);
          }
        }
      );
    });
  },
};
