const { faker } = require("@faker-js/faker");

function createUserData() {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    return {
        name: `${firstName} ${lastName}`,
        email: faker.internet.email({
            firstName,
            lastName
        }).toLowerCase()
    };
}

module.exports = {
    createUserData
};