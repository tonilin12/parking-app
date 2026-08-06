require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const {
    PrismaBetterSqlite3
} = require("@prisma/adapter-better-sqlite3");

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


    console.log("Creating parking spots...");

    const parkingSpots = [];

    for (let i = 1; i <= 30; i++) {

        const parkingSpot =
            await prisma.parkingSpot.create({
                data: createParkingSpotData(i)
            });

        parkingSpots.push(parkingSpot);
    }

    console.log(
        `Created ${parkingSpots.length} parking spots`
    );


    console.log("Creating reservations...");

    let createdReservations = 0;
    let attempts = 0;

    const maxAttempts = 1000;


    while (
        createdReservations < 50 &&
        attempts < maxAttempts
    ) {
        attempts++;

        const data =
            createReservationData(parkingSpots);


        if (data.status === "CONFIRMED") {

            const conflict =
                await prisma.reservation.findFirst({
                    where: {
                        parkingSpotId:
                            data.parkingSpotId,

                        status:
                            "CONFIRMED",

                        startTime: {
                            lt: data.endTime
                        },

                        endTime: {
                            gt: data.startTime
                        }
                    }
                });


            if (conflict) {
                continue;
            }
        }


        await prisma.reservation.create({
            data
        });

        createdReservations++;
    }


    if (createdReservations < 50) {
        throw new Error(
            "Could not generate 50 valid reservations"
        );
    }


    console.log(
        `Created ${createdReservations} reservations`
    );

    console.log(
        "Database seeding completed."
    );
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