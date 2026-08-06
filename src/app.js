const express = require("express");

const parkingSpotRoutes =
    require("./routes/parkingSpotRoutes");

const reservationRoutes =
    require("./routes/reservationRoutes");

const app = express();

app.use(express.json());

app.use(
    "/api/parking-spots",
    parkingSpotRoutes
);

app.use(
    "/api/reservations",
    reservationRoutes
);

app.get("/", (req, res) => {
    res.json({
        message: "Parking reservation API is running"
    });
});

module.exports = app;