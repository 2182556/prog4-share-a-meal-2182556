# prog4-share-a-meal-2182556

[![Deploy to Heroku](https://github.com/2182556/prog4-share-a-meal-2182556/actions/workflows/main.yml/badge.svg)](https://github.com/2182556/prog4-share-a-meal-2182556/actions/workflows/main.yml)

## Description
This project is an implementation of the 'Share a meal' API based on documentation from [Share-a-Meal Backend API (SWAGGER)](https://shareameal-api.herokuapp.com/docs/). It can be used to create an application where users can create an account, login, create meals, find meals and participate. It is made with the purpose of encouraging people to connect with others near them by either sharing or participating in a meal. 
It is currently deployed at Heroku, https://share-a-meal-2182556.herokuapp.com/.

***

## Table of Contents
- [Installation](#Installation)
  - [Npm packages](#Npm-packages)
  - [MariaDB (mysql)](#MariaDB-(mysql))
  - [Editor and extensions](#Editor-and-extensions)
  - [Running the application](#Running-the-application)
- [API Usage](#API-Usage)
  - [Database](#Database)
  - [Routes](#Routes)
- [Author](#Author)
- [Try it out](#Try-it-out)


***
# Installation
To be able to use this code you need to install [Nodejs](https://nodejs.org/en/). This allows you to run the code on your localhost or, when deployed, on a cloud platform like [Heroku](https://devcenter.heroku.com/).
To use the API on localhost, you also need to install [XAMPP](https://www.apachefriends.org/index.html) and start MySQL from the XAMPP Control Panel. You can then use a platform like [Postman](https://www.postman.com/) to send requests.


## Npm packages
When Nodejs is installed, you can install the following required packages using 
```
npm install -D package-name
```
The ```-D``` makes it a devDependency, a package only used in development.
- [nodemon](https://www.npmjs.com/package/nodemon)
- [chai](https://www.npmjs.com/package/chai)
- [chai-http](https://www.npmjs.com/package/chai-http)
- [mocha](https://www.npmjs.com/package/mocha)

And the following packages using 
```
npm install package-name
```
- [mysql2](https://www.npmjs.com/package/mysql2)
- [body-parser](https://www.npmjs.com/package/body-parser)
- [express](https://www.npmjs.com/package/mysql2)
- [tracer](https://www.npmjs.com/package/tracer)
- [joi](https://www.npmjs.com/package/joi)
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)
- [dotenv](https://www.npmjs.com/package/dotenv)
- [bcrypt](https://www.npmjs.com/package/bcrypt)

For more information about these packages and their usage, follow the link to their corresponding npmjs.com page.

## MariaDB (mysql)
When MySQL is running on XAMPP, you can use mysql as a command in the command prompt (be sure to add the path to your path environment variables). Here you can create and edit local databases that are used when running the tests or sending requests to your localhost. To use the sql scripts in this repository, navigate to the location of this repository and add the database as follows:

To open the MariaDB connection: 
```
mysql -u root 
```

To add the database:
```
CREATE DATABASE database-name;
USE database-name;
SOURCE script-name.sql
```
Database **share-a-meal** is used when running the application and **share-a-meal-testdb** is used for the integration tests. 


## Editor and extensions
The code is written in Visual Studio Code, using the extension [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode), but this is not required. 

## Running the application
To be able to use the API on localhost, use ```npm run start``` (equivalent to ```node index.js```) or ```npm run dev``` (equivalent to ```nodemon index.js```) to start the application. The tests can be run using `npm run test`, which will prompt mocha to run files ending with `.test.js`. 

If you want to deploy the application to Heroku, you need to have a Heroku account. Create a new application and change heroku_app_name in main.yml. You can add the secret variables to a Github environment.  

***

# API Usage 

## Database 
The database has 3 tables, 'user', 'meal' and 'meal_participants_user' with two entities, user and meal;
User has the following columns, with the expected type when making a request: 
Column                  | Request type |
|:----------------------| :------------|
*id*                    | int
firstName               | string
lastName                | string
emailAdress             | string 
password (encrypted)    | string
street                  | string
city                    | string
phoneNumber             | string 
isActive                | boolean
roles                   | array (allows 'admin', 'editor', 'guest' and '')

Meal has the following columns: 
Column                  | Request type |
|:----------------------|:-------------|
*id*                    | int
name                    | string
description             | string
isActive                | boolean
isToTakeHome            | boolean
isVegan                 | boolean
isVega                  | boolean
dateTime                | datetime
maxAmountOfParticipants | int
price                   | decimal
imageUrl                | string
allegenes               | array (allows 'gluten', 'lactose', 'noten' and '')
*cookId*                | int
*createDate*            | datetime
*updateDate*            | datetime

meal_participants_user has the columns mealId and cookId, to keep track of participation.
The columns in italics cannot be given in a request body, id can however be given in a route as you can see in the next section. 


## Routes
| Request   | Route                      | Required header              |
| :---------| :--------------------------| :----------------------------|
| POST      | /api/auth/login            |                              | 
| POST      | /api/user                  |                              |
| GET       | /api/user                  |                              | 
| GET       | /api/user/profile          | Authorization: Bearer token  | 
| GET       | /api/user/{id}             | Authorization: Bearer token  | 
| PUT       | /api/user/{id}             | Authorization: Bearer token  | 
| DELETE    | /api/user/{id}             | Authorization: Bearer token  | 
| POST      | /api/meal                  |                              |
| GET       | /api/meal                  |                              |
| GET       | /api/meal/{id}             |                              |
| PUT       | /api/meal/{id}             | Authorization: Bearer token  |
| DELETE    | /api/meal/{id}             | Authorization: Bearer token  |
| GET       | /api/meal/{id}/participate | Authorization: Bearer token  |

For more in-depth information about the request body and responses of each route, please refer to the [SWAGGER documentation](https://shareameal-api.herokuapp.com/docs/).

***

# Author
If you need me for anything, you can send an email to je.boellaard@student.avans.nl. I am the author of this project, however a lot of the code is based on code from the course Programming 4 from the bachelor Computer Science at Avans Breda. The example code for this project can be found [here](https://github.com/avansinformatica/programmeren-4-shareameal).

***

# Try it out
As mentioned before, the server is deployed at https://share-a-meal-2182556.herokuapp.com/, feel free to try it out!

***

[To top ^](#prog4-share-a-meal-2182556)
