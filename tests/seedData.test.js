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

describe("Seed data validation tests", () => {

    afterAll(async () => {
        await prisma.$disconnect();
    });


    test("Seeder creates exactly 20 users", async () => {
        const count = await prisma.user.count();

        expect(count).toBe(20);
    });


    test("Seeder creates exactly 30 parking spots", async () => {
        const count = await prisma.parkingSpot.count();

        expect(count).toBe(30);
    });


    test("Seeder creates exactly 50 reservations", async () => {
        const count = await prisma.reservation.count();

        expect(count).toBe(50);
    });


    test("Every user has a non-empty name", async () => {
        const users = await prisma.user.findMany();

        for (const user of users) {
            expect(typeof user.name).toBe("string");
            expect(user.name.trim().length).toBeGreaterThan(0);
        }
    });


    test("Every user has a valid-looking email", async () => {
        const users = await prisma.user.findMany();

        for (const user of users) {
            expect(typeof user.email).toBe("string");
            expect(user.email).toContain("@");
            expect(user.email.trim().length).toBeGreaterThan(3);
        }
    });


    test("Every user email is unique", async () => {
        const users = await prisma.user.findMany();

        const emails = users.map(user => user.email);
        const uniqueEmails = new Set(emails);

        expect(uniqueEmails.size).toBe(emails.length);
    });


    test("Every user has an automatically generated id", async () => {
        const users = await prisma.user.findMany();

        for (const user of users) {
            expect(typeof user.id).toBe("number");
            expect(user.id).toBeGreaterThan(0);
        }
    });


    test("Every parking spot has a non-empty name", async () => {
        const parkingSpots =
            await prisma.parkingSpot.findMany();

        for (const parkingSpot of parkingSpots) {
            expect(typeof parkingSpot.name).toBe("string");

            expect(
                parkingSpot.name.trim().length
            ).toBeGreaterThan(0);
        }
    });


    test("Every parking spot has a valid id", async () => {
        const parkingSpots =
            await prisma.parkingSpot.findMany();

        for (const parkingSpot of parkingSpots) {
            expect(typeof parkingSpot.id).toBe("number");
            expect(parkingSpot.id).toBeGreaterThan(0);
        }
    });


    test("Every parking spot has a boolean isActive value", async () => {
        const parkingSpots =
            await prisma.parkingSpot.findMany();

        for (const parkingSpot of parkingSpots) {
            expect(typeof parkingSpot.isActive)
                .toBe("boolean");
        }
    });


    test("Parking spot location is either string or null", async () => {
        const parkingSpots =
            await prisma.parkingSpot.findMany();

        for (const parkingSpot of parkingSpots) {

            if (parkingSpot.location === null) {
                expect(parkingSpot.location).toBeNull();
            }
            else {
                expect(typeof parkingSpot.location)
                    .toBe("string");
            }
        }
    });


    test("Every reservation has a valid id", async () => {
        const reservations =
            await prisma.reservation.findMany();

        for (const reservation of reservations) {
            expect(typeof reservation.id).toBe("number");

            expect(reservation.id)
                .toBeGreaterThan(0);
        }
    });


    test("Every reservation references an existing user", async () => {
        const reservations =
            await prisma.reservation.findMany({
                include: {
                    user: true
                }
            });

        for (const reservation of reservations) {

            expect(reservation.user)
                .not.toBeNull();

            expect(reservation.user.id)
                .toBe(reservation.userId);
        }
    });


    test("Every reservation references an existing parking spot", async () => {
        const reservations =
            await prisma.reservation.findMany({
                include: {
                    parkingSpot: true
                }
            });

        for (const reservation of reservations) {

            expect(reservation.parkingSpot)
                .not.toBeNull();

            expect(reservation.parkingSpot.id)
                .toBe(reservation.parkingSpotId);
        }
    });


    test("Every reservation startTime is a valid Date", async () => {
        const reservations =
            await prisma.reservation.findMany();

        for (const reservation of reservations) {

            expect(reservation.startTime)
                .toBeInstanceOf(Date);

            expect(
                Number.isNaN(
                    reservation.startTime.getTime()
                )
            ).toBe(false);
        }
    });


    test("Every reservation endTime is a valid Date", async () => {
        const reservations =
            await prisma.reservation.findMany();

        for (const reservation of reservations) {

            expect(reservation.endTime)
                .toBeInstanceOf(Date);

            expect(
                Number.isNaN(
                    reservation.endTime.getTime()
                )
            ).toBe(false);
        }
    });


    test("Every reservation starts before it ends", async () => {
        const reservations =
            await prisma.reservation.findMany();

        for (const reservation of reservations) {

            expect(
                reservation.startTime.getTime()
            ).toBeLessThan(
                reservation.endTime.getTime()
            );
        }
    });


    test("Every reservation has a valid status", async () => {
        const reservations =
            await prisma.reservation.findMany();

        const allowedStatuses = [
            "CONFIRMED",
            "CANCELLED"
        ];

        for (const reservation of reservations) {

            expect(allowedStatuses)
                .toContain(reservation.status);
        }
    });


    test("Every reservation has a valid createdAt value", async () => {
        const reservations =
            await prisma.reservation.findMany();

        for (const reservation of reservations) {

            expect(reservation.createdAt)
                .toBeInstanceOf(Date);

            expect(
                Number.isNaN(
                    reservation.createdAt.getTime()
                )
            ).toBe(false);
        }
    });


    test("User to Reservation relation works correctly", async () => {
        const users =
            await prisma.user.findMany({
                include: {
                    reservations: true
                }
            });

        for (const user of users) {

            for (const reservation of user.reservations) {

                expect(reservation.userId)
                    .toBe(user.id);
            }
        }
    });


    test("ParkingSpot to Reservation relation works correctly", async () => {
        const parkingSpots =
            await prisma.parkingSpot.findMany({
                include: {
                    reservations: true
                }
            });

        for (const parkingSpot of parkingSpots) {

            for (
                const reservation
                of parkingSpot.reservations
            ) {

                expect(reservation.parkingSpotId)
                    .toBe(parkingSpot.id);
            }
        }
    });


    test("Reservation can load both its User and ParkingSpot", async () => {
        const reservations =
            await prisma.reservation.findMany({
                include: {
                    user: true,
                    parkingSpot: true
                }
            });

        for (const reservation of reservations) {

            expect(reservation.user)
                .not.toBeNull();

            expect(reservation.parkingSpot)
                .not.toBeNull();

            expect(reservation.user.id)
                .toBe(reservation.userId);

            expect(reservation.parkingSpot.id)
                .toBe(reservation.parkingSpotId);
        }
    });


    test("Confirmed reservations on the same parking spot do not overlap", async () => {

        const parkingSpots =
            await prisma.parkingSpot.findMany();

        for (const parkingSpot of parkingSpots) {

            const reservations =
                await prisma.reservation.findMany({
                    where: {
                        parkingSpotId: parkingSpot.id,
                        status: "CONFIRMED"
                    },

                    orderBy: {
                        startTime: "asc"
                    }
                });

            for (
                let i = 0;
                i < reservations.length - 1;
                i++
            ) {

                const current =
                    reservations[i];

                const next =
                    reservations[i + 1];

                expect(
                    current.endTime.getTime()
                ).toBeLessThanOrEqual(
                    next.startTime.getTime()
                );
            }
        }
    });


    test("All reservations use ids belonging to seeded users", async () => {

        const users =
            await prisma.user.findMany();

        const reservations =
            await prisma.reservation.findMany();

        const userIds =
            new Set(
                users.map(user => user.id)
            );

        for (const reservation of reservations) {

            expect(
                userIds.has(reservation.userId)
            ).toBe(true);
        }
    });


    test("All reservations use ids belonging to seeded parking spots", async () => {

        const parkingSpots =
            await prisma.parkingSpot.findMany();

        const reservations =
            await prisma.reservation.findMany();

        const parkingSpotIds =
            new Set(
                parkingSpots.map(
                    parkingSpot => parkingSpot.id
                )
            );

        for (const reservation of reservations) {

            expect(
                parkingSpotIds.has(
                    reservation.parkingSpotId
                )
            ).toBe(true);
        }
    });

});