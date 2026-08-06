const prisma = require("../db");

const reservationService =
    require("../services/reservationService");


async function createReservation(req, res) {
    try {
        const {
            parkingSpotId,
            startTime,
            endTime
        } = req.body;

        const id = Number(parkingSpotId);

        if (!Number.isInteger(id)) {
            return res.status(400).json({
                error: "Invalid parking spot id"
            });
        }

        const reservation =
            await reservationService.createReservation(
                id,
                startTime,
                endTime
            );

        return res.status(201).json(reservation);

    } catch (error) {
        return res.status(400).json({
            error: error.message
        });
    }
}


async function getReservations(req, res) {
    try {
        const reservations =
            await prisma.reservation.findMany({
                include: {
                    parkingSpot: true
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


async function cancelReservation(req, res) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id)) {
            return res.status(400).json({
                error: "Invalid reservation id"
            });
        }

        const reservation =
            await prisma.reservation.findUnique({
                where: {
                    id
                }
            });

        if (!reservation) {
            return res.status(404).json({
                error: "Reservation not found"
            });
        }

        if (reservation.status === "CANCELLED") {
            return res.status(400).json({
                error: "Reservation is already cancelled"
            });
        }

        const cancelledReservation =
            await prisma.reservation.update({
                where: {
                    id
                },

                data: {
                    status: "CANCELLED"
                }
            });

        return res.status(200).json(
            cancelledReservation
        );

    } catch (error) {
        return res.status(400).json({
            error: error.message
        });
    }
}


module.exports = {
    createReservation,
    getReservations,
    cancelReservation
};