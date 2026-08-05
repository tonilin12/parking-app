const { faker } = require("@faker-js/faker");

function createReservationData(parkingSpots) {
    const parkingSpot = faker.helpers.arrayElement(parkingSpots);

    const startTime = faker.date.soon({
        days: 30
    });

    const durationHours = faker.number.int({
        min: 1,
        max: 4
    });

    const endTime = new Date(
        startTime.getTime() +
        durationHours * 60 * 60 * 1000
    );

    return {
        parkingSpotId: parkingSpot.id,
        startTime,
        endTime,
        status: faker.helpers.arrayElement([
            "CONFIRMED",
            "CONFIRMED",
            "CONFIRMED",
            "CANCELLED"
        ])
    };
}

module.exports = {
    createReservationData
};