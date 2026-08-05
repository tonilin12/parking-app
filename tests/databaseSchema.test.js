require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const {
    PrismaBetterSqlite3
} = require("@prisma/adapter-better-sqlite3");

const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL
});

const prisma = new PrismaClient({
    adapter
});

describe("Database schema tests", () => {

    let parkingSpot1;
    let parkingSpot2;

    const unique = Date.now();

    beforeAll(async () => {

        parkingSpot1 = await prisma.parkingSpot.create({
            data: {
                name: `TEST-P1-${unique}`,
                location: "Test Floor"
            }
        });

        parkingSpot2 = await prisma.parkingSpot.create({
            data: {
                name: `TEST-P2-${unique}`
            }
        });
    });


    afterAll(async () => {

        await prisma.reservation.deleteMany({
            where: {
                parkingSpotId: {
                    in: [
                        parkingSpot1.id,
                        parkingSpot2.id
                    ]
                }
            }
        });

        await prisma.parkingSpot.deleteMany({
            where: {
                id: {
                    in: [
                        parkingSpot1.id,
                        parkingSpot2.id
                    ]
                }
            }
        });

        await prisma.$disconnect();
    });


    test("ParkingSpot gets an automatically generated primary key", async () => {

        expect(parkingSpot1.id).toBeDefined();
        expect(typeof parkingSpot1.id).toBe("number");
        expect(parkingSpot1.id).toBeGreaterThan(0);
    });


    test("ParkingSpot is active by default", async () => {

        expect(parkingSpot1.isActive).toBe(true);
    });


    test("ParkingSpot location can be null", async () => {

        expect(parkingSpot2.location).toBeNull();
    });


    test("Reservation gets an automatically generated primary key", async () => {

        const reservation = await prisma.reservation.create({
            data: {
                parkingSpotId: parkingSpot1.id,
                startTime: new Date("2030-01-01T08:00:00Z"),
                endTime: new Date("2030-01-01T10:00:00Z")
            }
        });

        expect(reservation.id).toBeDefined();
        expect(typeof reservation.id).toBe("number");
        expect(reservation.id).toBeGreaterThan(0);
    });


    test("Reservation receives default CONFIRMED status", async () => {

        const reservation = await prisma.reservation.create({
            data: {
                parkingSpotId: parkingSpot1.id,
                startTime: new Date("2030-01-02T08:00:00Z"),
                endTime: new Date("2030-01-02T10:00:00Z")
            }
        });

        expect(reservation.status).toBe("CONFIRMED");
    });


    test("Reservation automatically receives createdAt", async () => {

        const reservation = await prisma.reservation.create({
            data: {
                parkingSpotId: parkingSpot2.id,
                startTime: new Date("2030-01-03T08:00:00Z"),
                endTime: new Date("2030-01-03T10:00:00Z")
            }
        });

        expect(reservation.createdAt).toBeInstanceOf(Date);
    });


    test("Reservation can have CANCELLED status", async () => {

        const reservation = await prisma.reservation.create({
            data: {
                parkingSpotId: parkingSpot2.id,
                startTime: new Date("2030-01-04T08:00:00Z"),
                endTime: new Date("2030-01-04T10:00:00Z"),
                status: "CANCELLED"
            }
        });

        expect(reservation.status).toBe("CANCELLED");
    });


    test("one ParkingSpot can have many Reservations", async () => {

        await prisma.reservation.create({
            data: {
                parkingSpotId: parkingSpot1.id,
                startTime: new Date("2030-03-01T08:00:00Z"),
                endTime: new Date("2030-03-01T09:00:00Z")
            }
        });

        await prisma.reservation.create({
            data: {
                parkingSpotId: parkingSpot1.id,
                startTime: new Date("2030-03-02T08:00:00Z"),
                endTime: new Date("2030-03-02T09:00:00Z")
            }
        });

        const parkingSpot =
            await prisma.parkingSpot.findUnique({
                where: {
                    id: parkingSpot1.id
                },

                include: {
                    reservations: true
                }
            });

        expect(parkingSpot.reservations.length)
            .toBeGreaterThanOrEqual(2);

        for (const reservation of parkingSpot.reservations) {

            expect(reservation.parkingSpotId)
                .toBe(parkingSpot1.id);
        }
    });


    test("Reservation is linked to the correct ParkingSpot", async () => {

        const reservation = await prisma.reservation.create({
            data: {
                parkingSpotId: parkingSpot1.id,
                startTime: new Date("2030-04-01T08:00:00Z"),
                endTime: new Date("2030-04-01T10:00:00Z")
            },

            include: {
                parkingSpot: true
            }
        });

        expect(reservation.parkingSpotId)
            .toBe(parkingSpot1.id);

        expect(reservation.parkingSpot.id)
            .toBe(parkingSpot1.id);
    });


    test("different ParkingSpots can have Reservations", async () => {

        await prisma.reservation.create({
            data: {
                parkingSpotId: parkingSpot1.id,
                startTime: new Date("2030-04-02T08:00:00Z"),
                endTime: new Date("2030-04-02T09:00:00Z")
            }
        });

        await prisma.reservation.create({
            data: {
                parkingSpotId: parkingSpot2.id,
                startTime: new Date("2030-04-03T08:00:00Z"),
                endTime: new Date("2030-04-03T09:00:00Z")
            }
        });

        const reservations =
            await prisma.reservation.findMany({
                where: {
                    parkingSpotId: {
                        in: [
                            parkingSpot1.id,
                            parkingSpot2.id
                        ]
                    }
                },

                include: {
                    parkingSpot: true
                }
            });

        const parkingSpotIds =
            new Set(
                reservations.map(
                    reservation =>
                        reservation.parkingSpot.id
                )
            );

        expect(parkingSpotIds.has(parkingSpot1.id))
            .toBe(true);

        expect(parkingSpotIds.has(parkingSpot2.id))
            .toBe(true);
    });


    test("Reservation cannot reference a non-existing ParkingSpot", async () => {

        await expect(
            prisma.reservation.create({
                data: {
                    parkingSpotId: 999999999,

                    startTime:
                        new Date("2030-05-02T08:00:00Z"),

                    endTime:
                        new Date("2030-05-02T10:00:00Z")
                }
            })
        ).rejects.toThrow();
    });

});