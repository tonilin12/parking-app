const prisma = require("../db");

async function createReservation(
    parkingSpotId,
    startTime,
    endTime
) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    if (
        Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime())
    ) {
        throw new Error("Invalid date");
    }

    if (start >= end) {
        throw new Error(
            "Start time must be before end time"
        );
    }

    if (start < now) {
        throw new Error(
            "Cannot create a reservation in the past"
        );
    }

    const parkingSpot =
        await prisma.parkingSpot.findUnique({
            where: {
                id: parkingSpotId,
            },
        });

    if (!parkingSpot) {
        throw new Error(
            "Parking spot does not exist"
        );
    }

    if (!parkingSpot.isActive) {
        throw new Error(
            "Parking spot is not active"
        );
    }

    const conflict =
        await prisma.reservation.findFirst({
            where: {
                parkingSpotId,
                status: "CONFIRMED",
                startTime: {
                    lt: end,
                },
                endTime: {
                    gt: start,
                },
            },
        });

    if (conflict) {
        throw new Error(
            "Parking spot is already reserved during this period"
        );
    }

    return prisma.reservation.create({
        data: {
            parkingSpotId,
            startTime: start,
            endTime: end,
        },
    });
}

module.exports = {
    createReservation,
};