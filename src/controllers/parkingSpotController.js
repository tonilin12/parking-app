const prisma = require("../db");


async function createParkingSpot(req, res) {
    try {
        const {
            name,
            location
        } = req.body;

        if (!name || name.trim() === "") {
            return res.status(400).json({
                error: "Parking spot name is required"
            });
        }

        const parkingSpot =
            await prisma.parkingSpot.create({
                data: {
                    name: name.trim(),
                    location: location || null
                }
            });

        return res.status(201).json(parkingSpot);

    } catch (error) {
        return res.status(400).json({
            error: error.message
        });
    }
}


async function getParkingSpots(req, res) {
    try {
        const parkingSpots =
            await prisma.parkingSpot.findMany({
                orderBy: {
                    id: "asc"
                }
            });

        return res.status(200).json(parkingSpots);

    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
}


async function getParkingSpotReservations(req, res) {
    try {
        const parkingSpotId = Number(req.params.id);

        if (!Number.isInteger(parkingSpotId)) {
            return res.status(400).json({
                error: "Invalid parking spot id"
            });
        }

        const parkingSpot =
            await prisma.parkingSpot.findUnique({
                where: {
                    id: parkingSpotId
                }
            });

        if (!parkingSpot) {
            return res.status(404).json({
                error: "Parking spot not found"
            });
        }

        const reservations =
            await prisma.reservation.findMany({
                where: {
                    parkingSpotId
                },

                orderBy: {
                    startTime: "asc"
                }
            });

        return res.status(200).json(reservations);

    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
}


module.exports = {
    createParkingSpot,
    getParkingSpots,
    getParkingSpotReservations
};