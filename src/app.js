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

const PORT = 3000;

app.listen(PORT, () => {
    console.log(
        `Server running on http://localhost:${PORT}`
    );
});