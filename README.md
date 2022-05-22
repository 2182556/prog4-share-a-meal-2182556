# prog4-share-a-meal-2182556

[![Deploy to Heroku](https://github.com/2182556/prog4-share-a-meal-2182556/actions/workflows/main.yml/badge.svg)](https://github.com/2182556/prog4-share-a-meal-2182556/actions/workflows/main.yml)

```
cd existing_repo
git remote add origin https://gitlab.com/2182556/prog4-share-a-meal-2182556.git
git branch -M main
git push -uf origin main
```

# Table of Contents

- [Description](#Description)
- [About the code](#About-the-code)
  - [Installation](#Installation) 

***

## Description
'Share a meal' API based on documentation from [Share-a-Meal Backend API (SWAGGER)](https://shareameal-api.herokuapp.com/docs/). It can be used to create an application where users can create an account, login, create meals, find meals and participate. It is made with the purpose of encouraging people to connect with others near them by either sharing or participating in a meal. 
It is currently deployed at Heroku, https://share-a-meal-2182556.herokuapp.com/.

## About the code


### Installation
Within a particular ecosystem, there may be a common way of installing things, such as using Yarn, NuGet, or Homebrew. However, consider the possibility that whoever is reading your README is a novice and would like more guidance. Listing specific steps helps remove ambiguity and gets people to using your project as quickly as possible. If it only runs in a specific context like a particular programming language version or operating system or has dependencies that have to be installed manually, also add a Requirements subsection.

## Usage 

### Database 
The database has 3 tables, 'user', 'meal' and 'meal_participants_user' with two entities, user and meal;
User has the following columns, with the expected type when making a request: 
Column                  | Request type
|:----------------------| :----------------------------------------------------------|
<i>id                   | int</i>
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
Column                  | Request type
|:----------------------|:-----------------------------------------------------------|
<i>id                   | int</i>
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
<i>cookId               | int</i>
<i>createDate           | datetime</i>
<i>updateDate           | datetime</i>

meal_participants_user has the columns mealId and cookId, to keep track of participation.
The columns in italics cannot be given in a request body, id can however be given in a route as you can see in the next section. 


### Routes
| Request   | Route                      | Required header       |
| :---------| :--------------------------| :---------------------|
| POST      | /api/auth/login            |                       | 
| POST      | /api/user                  |                       |
| GET       | /api/user                  |                       | 
| GET       | /api/user/profile          | Authorization: token  | 
| GET       | /api/user/{id}             | Authorization: token  | 
| PUT       | /api/user/{id}             | Authorization: token  | 
| DELETE    | /api/user/{id}             | Authorization: token  | 
| POST      | /api/meal                  |                       |
| GET       | /api/meal                  |                       |
| GET       | /api/meal/{id}             |                       |
| PUT       | /api/meal/{id}             | Authorization: token  |
| DELETE    | /api/meal/{id}             | Authorization: token  |
| GET       | /api/meal/{id}/participate | Authorization: token  |






## Support
Tell people where they can go to for help. It can be any combination of an issue tracker, a chat room, an email address, etc.

## Contributing
State if you are open to contributions and what your requirements are for accepting them.

For people who want to make changes to your project, it's helpful to have some documentation on how to get started. Perhaps there is a script that they should run or some environment variables that they need to set. Make these steps explicit. These instructions could also be useful to your future self.

You can also document commands to lint the code or run tests. These steps help to ensure high code quality and reduce the likelihood that the changes inadvertently break something. Having instructions for running tests is especially helpful if it requires external setup, such as starting a Selenium server for testing in a browser.

## Authors and acknowledgment
Show your appreciation to those who have contributed to the project.

## License
For open source projects, say how it is licensed.

## Project status
If you have run out of energy or time for your project, put a note at the top of the README saying that development has slowed down or stopped completely. Someone may choose to fork your project or volunteer to step in as a maintainer or owner, allowing your project to keep going. You can also make an explicit request for maintainers.
