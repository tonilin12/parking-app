const express = require("express");

const controller =
    require("../controllers/reservationController");

const router = express.Router();


router.post(
    "/",
    controller.createReservation
);


router.get(
    "/",
    controller.getReservations
);


router.patch(
    "/:id/cancel",
    controller.cancelReservation
);


module.exports = router;