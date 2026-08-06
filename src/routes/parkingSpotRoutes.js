const express = require("express");

const controller =
    require("../controllers/parkingSpotController");

const router = express.Router();


router.post(
    "/",
    controller.createParkingSpot
);


router.get(
    "/",
    controller.getParkingSpots
);


router.get(
    "/:id/reservations",
    controller.getParkingSpotReservations
);


module.exports = router;