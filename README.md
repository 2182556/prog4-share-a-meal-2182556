# prog4-share-a-meal-2182556

[![Deploy to Heroku](https://github.com/2182556/prog4-share-a-meal-2182556/actions/workflows/main.yml/badge.svg)](https://github.com/2182556/prog4-share-a-meal-2182556/actions/workflows/main.yml)

## Getting started

To make it easy for you to get started with GitLab, here's a list of recommended next steps.

Already a pro? Just edit this README.md and make it your own. Want to make it easy? [Use the template at the bottom](#editing-this-readme)!

## Add your files

- [ ] [Create](https://docs.gitlab.com/ee/user/project/repository/web_editor.html#create-a-file) or [upload](https://docs.gitlab.com/ee/user/project/repository/web_editor.html#upload-a-file) files
- [ ] [Add files using the command line](https://docs.gitlab.com/ee/gitlab-basics/add-file.html#add-a-file-using-the-command-line) or push an existing Git repository with the following command:

```
cd existing_repo
git remote add origin https://gitlab.com/2182556/prog4-share-a-meal-2182556.git
git branch -M main
git push -uf origin main
```

***

# Editing this README

When you're ready to make this README your own, just edit this file and use the handy template below (or feel free to structure it however you want - this is just a starting point!).  Thank you to [makeareadme.com](https://www.makeareadme.com/) for this template.

## Suggestions for a good README
Every project is different, so consider which of these sections apply to yours. The sections used in the template are suggestions for most open source projects. Also keep in mind that while a README can be too long and detailed, too long is better than too short. If you think your README is too long, consider utilizing another form of documentation rather than cutting out information.

## Description
'Share a meal' API based on documentation from [Share-a-Meal Backend API (SWAGGER)](https://shareameal-api.herokuapp.com/docs/). It can be used to create an application where users can create an account, login, create meals, find meals and participate. It is made with the purpose of encouraging people to connect with others near them by either sharing or participating in a meal. 
It is currently deployed at Heroku, [https://share-a-meal-2182556.herokuapp.com/].

## Database 
The database has 3 tables, 'user', 'meal' and 'meal_participants_user' with two entities, user and meal;
User has the following columns, with the expected type when making a request: 
- <i>id | int</i>
- firstName | string
- lastName | string
- emailAdress | string 
- password (encrypted) | string
- street | string
- city | string
- phoneNumber | string 
- isActive | boolean
- roles | array with possible values ('admin', 'editor', 'guest', '')

Meal has the following columns: 
- <i>id | int</i>
- name | string
- description | string
- isActive | boolean
- isToTakeHome | boolean
- isVegan | boolean
- isVega | boolean
- dateTime | datetime
- maxAmountOfParticipants | int
- price | decimal
- imageUrl | string
- allegenes | array with possible values ('gluten', 'lactose', 'noten', '')
- <i>cookId | int</i>
- <i>createDate | datetime</i>
- <i>updateDate | datetime</i>

The columns in italics cannot be given in a request body. id can however be given in a route. 


## Routes
| REQUEST    | Route          | Required header  | Required keys in body |
| ----------|:---------------:| ----------------:|----------------------:|
| POST      | /api/auth/login |                  | emailAdress; password |
| POST      | /api/user       |                  | firstName; lastName; emailAdress; password; street; city; phoneNumber |
| POSt      | are neat        |    $1            | |

## Badges
On some READMEs, you may see small images that convey metadata, such as whether or not all the tests are passing for the project. You can use Shields to add some to your README. Many services also have instructions for adding a badge.

## Visuals
Depending on what you are making, it can be a good idea to include screenshots or even a video (you'll frequently see GIFs rather than actual videos). Tools like ttygif can help, but check out Asciinema for a more sophisticated method.

## Installation
Within a particular ecosystem, there may be a common way of installing things, such as using Yarn, NuGet, or Homebrew. However, consider the possibility that whoever is reading your README is a novice and would like more guidance. Listing specific steps helps remove ambiguity and gets people to using your project as quickly as possible. If it only runs in a specific context like a particular programming language version or operating system or has dependencies that have to be installed manually, also add a Requirements subsection.

## Usage
Use examples liberally, and show the expected output if you can. It's helpful to have inline the smallest example of usage that you can demonstrate, while providing links to more sophisticated examples if they are too long to reasonably include in the README.

## Support
Tell people where they can go to for help. It can be any combination of an issue tracker, a chat room, an email address, etc.

## Roadmap
If you have ideas for releases in the future, it is a good idea to list them in the README.

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
