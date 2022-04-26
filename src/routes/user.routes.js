const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

router.post("/api/user", userController.addUser);

router.get("/api/user", userController.getAllUsers);

router.get("/api/user/profile", userController.getUserProfile);

router.get("/api/user/:userId", userController.getUserById);

router.put("/api/user/:id", userController.addUser);

router.delete("/api/user/:userId", userController.deleteUser);

module.exports = router;
