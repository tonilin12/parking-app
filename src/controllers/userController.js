const prisma = require("../db");

async function createUser(req, res) {
    try {
        const { name, email } = req.body;

        const user = await prisma.user.create({
            data: {
                name,
                email
            }
        });

        res.status(201).json(user);

    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
}

async function getUsers(req, res) {
    const users = await prisma.user.findMany();

    res.json(users);
}

module.exports = {
    createUser,
    getUsers
};const express = require("express");

const controller =
    require("../controllers/userController");

const router = express.Router();

router.post("/", controller.createUser);

router.get("/", controller.getUsers);

module.exports = router;