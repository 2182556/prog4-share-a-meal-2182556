const database = require("../../database/inmemdb");
const dbconnection = require("../../database/dbconnection");
const assert = require("assert");
let userDatabase = [];
let id = 0;

module.exports = {
  //npm joi api for better error handling
  validateUser: (req, res, next) => {
    let user = req.body;
    let { firstName, lastName, emailAdress, password } = user;
    try {
      assert(typeof emailAdress === "string", "Email must be a string"); //=== checkt value and type, == only value
      assert(typeof firstName === "string", "First name must be a string");
      assert(typeof lastName === "string", "Last name must be a string");
      next();
    } catch (err) {
      const error = {
        status: 400,
        result: err.message,
      };
      next(error);
    }
  },
  addUser: (req, res) => {
    let user = req.body;
    console.log(user);
    let email = user.emailAdress;
    if (email == undefined) {
      res.status(400).json({
        status: 400,
        result: "Please enter a value for 'emailAdress'.",
      });
    } else {
      let userArray = userDatabase.filter((item) => item.emailAdress == email);
      if (userArray.length > 0) {
        res.status(401).json({
          status: 401,
          result: `The email address ${email} is already in use, please use a different emailaddress or log in.`,
        });
      } else {
        id++;
        user = {
          id,
          ...user,
        };
        userDatabase.push(user);
        console.log(userDatabase);
        res.status(201).json({
          status: 201,
          result: `User with email address ${email} was added.`,
        });
      }
    }
  },
  getAllUsers: (req, res, next) => {
    dbconnection.getConnection(function (err, connection) {
      if (err) throw err;

      connection.query("SELECT * FROM user", function (error, results, fields) {
        connection.release();

        if (error) throw error;

        console.log("results = ", results.length);
        res.status(200).json({
          statusCode: 200,
          results: results,
        });

        // dbconnection.end((err) => {
        //   console.log("Pool was closed.");
        // });
      });
    });
  },
  getUserProfile: (req, res) => {
    res.status(503).json({
      status: 503,
      result: "This feature has not been implemented yet.",
    });
  },
  getUserById: (req, res, next) => {
    const userId = req.params.userId;
    let userArray = userDatabase.filter((item) => item.id == userId);
    if (userArray.length > 0) {
      console.log(userArray);
      res.status(200).json({
        status: 200,
        result: userArray,
      });
    } else {
      const error = {
        status: 404,
        result: `User with id ${userId} not found`,
      };
      next(error);
    }
  },
  updateUser: (req, res) => {
    const id = req.params.id;
    let userArray = userDatabase.filter((item) => item.id == id);
    if (userArray.length > 0) {
      console.log(userArray);
      let user = req.body;
      user = {
        id,
        ...user,
      };
      let email = user.emailAdress;
      if (email == undefined) {
        res.status(400).json({
          status: 400,
          result: "Please enter a value for 'emailAdress'.",
        });
      } else {
        let userArray = userDatabase.filter(
          (item) => item.emailAdress == email
        );
        if (userArray.length > 0 && id != userArray[0].id) {
          res.status(401).json({
            status: 401,
            result: `The email address ${email} is already in use, please use a different emailaddress.`,
          });
        } else {
          userDatabase[userDatabase.indexOf(userArray[0])] = user;
          res.status(201).json({
            status: 201,
            result: `User with id ${id} was updated.`,
          });
        }
      }
    } else {
      res.status(404).json({
        status: 404,
        result: `User with id ${id} not found`,
      });
    }
  },
  deleteUser: (req, res) => {
    const userId = req.params.userId;
    let userArray = userDatabase.filter((item) => item.id == userId);
    if (userArray.length > 0) {
      console.log(userArray);
      userDatabase.splice(userDatabase.indexOf(userArray[0]), 1);
      res.status(201).json({
        status: 201,
        result: `User with id ${userId} was deleted.`,
      });
    } else {
      res.status(404).json({
        status: 404,
        result: `User with id ${userId} not found`,
      });
    }
  },
};
