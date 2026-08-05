const { faker } = require("@faker-js/faker");

function createUserData() {
    return {
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase()
    };
}

module.exports = {
    createUserData
};