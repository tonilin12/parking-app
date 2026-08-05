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

    let user1;
    let user2;

    let parkingSpot1;
    let parkingSpot2;

    const unique = Date.now();

    beforeAll(async () => {

        user1 = await prisma.user.create({
            data: {
                name: "Schema Test User 1",
                email: `schema-user1-${unique}@test.com`
            }
        });

        user2 = await prisma.user.create({
            data: {
                name: "Schema Test User 2",
                email: `schema-user2-${unique}@test.com`
            }
        });

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
                OR: [
                    { userId: user1.id },
                    { userId: user2.id }
                ]
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

        await prisma.user.deleteMany({
            where: {
                id: {
                    in: [
                        user1.id,
                        user2.id
                    ]
                }
            }
        });

        await prisma.$disconnect();
    });


    test("User gets an automatically generated primary key", async () => {

        expect(user1.id).toBeDefined();
        expect(typeof user1.id).toBe("number");
        expect(user1.id).toBeGreaterThan(0);
    });


    test("User email must be unique", async () => {

        await expect(
            prisma.user.create({
                data: {
                    name: "Duplicate Email",
                    email: user1.email
                }
            })
        ).rejects.toThrow();
    });


    test("ParkingSpot is active by default", async () => {

        expect(parkingSpot1.isActive).toBe(true);
    });


    test("ParkingSpot location can be null", async () => {

        expect(parkingSpot2.location).toBeNull();
    });


    test("Reservation receives default CONFIRMED status", async () => {

        const reservation = await prisma.reservation.create({
            data: {
                userId: user1.id,
                parkingSpotId: parkingSpot1.id,

                startTime:
                    new Date("2030-01-01T08:00:00Z"),

                endTime:
                    new Date("2030-01-01T10:00:00Z")
            }
        });

        expect(reservation.status).toBe("CONFIRMED");
    });


    test("Reservation automatically receives createdAt", async () => {

        const reservation = await prisma.reservation.create({
            data: {
                userId: user1.id,
                parkingSpotId: parkingSpot2.id,

                startTime:
                    new Date("2030-01-02T08:00:00Z"),

                endTime:
                    new Date("2030-01-02T10:00:00Z")
            }
        });

        expect(reservation.createdAt).toBeInstanceOf(Date);
    });


    test("Reservation can have CANCELLED status", async () => {

        const reservation = await prisma.reservation.create({
            data: {
                userId: user2.id,
                parkingSpotId: parkingSpot2.id,

                startTime:
                    new Date("2030-01-03T08:00:00Z"),

                endTime:
                    new Date("2030-01-03T10:00:00Z"),

                status: "CANCELLED"
            }
        });

        expect(reservation.status).toBe("CANCELLED");
    });


    test("one User can have many Reservations", async () => {

        await prisma.reservation.create({
            data: {
                userId: user1.id,
                parkingSpotId: parkingSpot1.id,

                startTime:
                    new Date("2030-02-01T08:00:00Z"),

                endTime:
                    new Date("2030-02-01T09:00:00Z")
            }
        });

        await prisma.reservation.create({
            data: {
                userId: user1.id,
                parkingSpotId: parkingSpot2.id,

                startTime:
                    new Date("2030-02-02T08:00:00Z"),

                endTime:
                    new Date("2030-02-02T09:00:00Z")
            }
        });

        const user = await prisma.user.findUnique({
            where: {
                id: user1.id
            },

            include: {
                reservations: true
            }
        });

        expect(user.reservations.length)
            .toBeGreaterThanOrEqual(2);

        for (const reservation of user.reservations) {

            expect(reservation.userId)
                .toBe(user1.id);
        }
    });


    test("one ParkingSpot can have many Reservations", async () => {

        await prisma.reservation.create({
            data: {
                userId: user1.id,
                parkingSpotId: parkingSpot1.id,

                startTime:
                    new Date("2030-03-01T08:00:00Z"),

                endTime:
                    new Date("2030-03-01T09:00:00Z")
            }
        });

        await prisma.reservation.create({
            data: {
                userId: user2.id,
                parkingSpotId: parkingSpot1.id,

                startTime:
                    new Date("2030-03-02T08:00:00Z"),

                endTime:
                    new Date("2030-03-02T09:00:00Z")
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


    test("Reservation is linked to the correct User and ParkingSpot", async () => {

        const reservation = await prisma.reservation.create({
            data: {
                userId: user2.id,
                parkingSpotId: parkingSpot1.id,
                startTime: new Date("2030-04-01T08:00:00Z"),
                endTime: new Date("2030-04-01T10:00:00Z")
            },
            include: {
                user: true,
                parkingSpot: true
            }
        });

        expect(reservation.userId).toBe(user2.id);
        expect(reservation.parkingSpotId).toBe(parkingSpot1.id);

        expect(reservation.user.id).toBe(user2.id);
        expect(reservation.parkingSpot.id).toBe(parkingSpot1.id);
    });

    test("User can reserve different ParkingSpots", async () => {

        const reservations =
            await prisma.reservation.findMany({

                where: {
                    userId: user1.id
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

        expect(parkingSpotIds.size)
            .toBeGreaterThanOrEqual(2);
    });


    test("ParkingSpot can be reserved by different Users", async () => {

        const reservations =
            await prisma.reservation.findMany({

                where: {
                    parkingSpotId: parkingSpot1.id
                },

                include: {
                    user: true
                }
            });

        const userIds =
            new Set(
                reservations.map(
                    reservation =>
                        reservation.user.id
                )
            );

        expect(userIds.size)
            .toBeGreaterThanOrEqual(2);
    });


    test("Reservation cannot reference a non-existing User", async () => {

        await expect(
            prisma.reservation.create({
                data: {
                    userId: 999999999,
                    parkingSpotId: parkingSpot1.id,

                    startTime:
                        new Date("2030-05-01T08:00:00Z"),

                    endTime:
                        new Date("2030-05-01T10:00:00Z")
                }
            })
        ).rejects.toThrow();
    });


    test("Reservation cannot reference a non-existing ParkingSpot", async () => {

        await expect(
            prisma.reservation.create({
                data: {
                    userId: user1.id,
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