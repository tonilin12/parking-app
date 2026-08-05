const { faker } = require("@faker-js/faker");

function createParkingSpotData(index) {
    return {
        name: `P-${String(index).padStart(3, "0")}`,

        location: faker.helpers.arrayElement([
            "Ground Floor",
            "First Floor",
            "Second Floor",
            "Outdoor"
        ]),

        isActive: faker.datatype.boolean({
            probability: 0.9
        })
    };
}

module.exports = {
    createParkingSpotData
};