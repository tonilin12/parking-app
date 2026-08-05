    const express = require("express");

    // Routes are not configured yet
    // const userRoutes = require("./routes/userRoutes");
    // const parkingSpotRoutes = require("./routes/parkingSpotRoutes");
    // const reservationRoutes = require("./routes/reservationRoutes");

    const app = express();

    app.use(express.json());

    // Route modules are not configured yet
    // app.use("/users", userRoutes);
    // app.use("/parking-spots", parkingSpotRoutes);
    // app.use("/reservations", reservationRoutes);

    app.get("/", (req, res) => {
        res.json({
            message: "Parking reservation API is running"
        });
    });

    const PORT = 3000;

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });