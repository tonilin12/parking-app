require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");

const {
    createUserData
} = require("./factories/userFactory");

const {
    createParkingSpotData
} = require("./factories/parkingSpotFactory");

const {
    createReservationData
} = require("./factories/reservationFactory");

const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL
});

const prisma = new PrismaClient({
    adapter
});

async function main() {
    console.log("Clearing database...");

    await prisma.reservation.deleteMany();
    await prisma.parkingSpot.deleteMany();
    await prisma.user.deleteMany();

    console.log("Creating users...");

    const users = [];

    for (let i = 0; i < 20; i++) {
        const user = await prisma.user.create({
            data: createUserData()
        });

        users.push(user);
    }

    console.log(`Created ${users.length} users`);

    console.log("Creating parking spots...");

    const parkingSpots = [];

    for (let i = 1; i <= 30; i++) {
        const parkingSpot = await prisma.parkingSpot.create({
            data: createParkingSpotData(i)
        });

        parkingSpots.push(parkingSpot);
    }

    console.log(`Created ${parkingSpots.length} parking spots`);

    console.log("Creating reservations...");

    const reservations = [];

    for (let i = 0; i < 50; i++) {
        const reservationData = createReservationData(
            users,
            parkingSpots
        );

        const reservation = await prisma.reservation.create({
            data: reservationData
        });

        reservations.push(reservation);
    }

    console.log(`Created ${reservations.length} reservations`);

    console.log("Database seeding completed.");
}

main()
    .catch((error) => {
        console.error("Seeding failed:");
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });