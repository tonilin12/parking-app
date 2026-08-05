const express = require("express");

const controller =
    require("../controllers/userController");

const router = express.Router();

router.post("/", controller.createUser);

router.get("/", controller.getUsers);

module.exports = router;