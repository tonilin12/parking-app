const request = require("supertest");

const app = require("../src/app");
const prisma = require("../src/db");


describe("Parking Reservation API", () => {

    let parkingSpot;

    // Create a fresh parking spot before each test
    beforeEach(async () => {
        parkingSpot = await prisma.parkingSpot.create({
            data: {
                name: `TEST-SPOT-${Date.now()}-${Math.random()}`,
                location: "Test Floor",
                isActive: true
            }
        });
    });


    // Remove data created during each test
    afterEach(async () => {

        if (parkingSpot) {

            await prisma.reservation.deleteMany({
                where: {
                    parkingSpotId: parkingSpot.id
                }
            });

            await prisma.parkingSpot.deleteMany({
                where: {
                    id: parkingSpot.id
                }
            });
        }

        parkingSpot = null;
    });


    // Close database connection after all tests
    afterAll(async () => {
        await prisma.$disconnect();
    });


    // Test basic API availability
    describe("GET /", () => {

        test("returns API status", async () => {

            const response =
                await request(app)
                    .get("/");

            expect(response.status)
                .toBe(200);

            expect(response.body.message)
                .toBe(
                    "Parking reservation API is running"
                );
        });

    });


    // Parking spot creation and listing
    describe("Parking spot endpoints", () => {

        test("POST /api/parking-spots creates a parking spot", async () => {

            const response =
                await request(app)
                    .post("/api/parking-spots")
                    .send({
                        name: `P-${Date.now()}`,
                        location: "First Floor"
                    });

            expect(response.status)
                .toBe(201);

            expect(response.body.id)
                .toBeDefined();

            expect(response.body.name)
                .toBeDefined();

            expect(response.body.location)
                .toBe("First Floor");

            expect(response.body.isActive)
                .toBe(true);


            await prisma.parkingSpot.delete({
                where: {
                    id: response.body.id
                }
            });
        });


        test("POST /api/parking-spots allows null location", async () => {

            const response =
                await request(app)
                    .post("/api/parking-spots")
                    .send({
                        name: `P-${Date.now()}`
                    });

            expect(response.status)
                .toBe(201);

            expect(response.body.location)
                .toBeNull();


            await prisma.parkingSpot.delete({
                where: {
                    id: response.body.id
                }
            });
        });


        test("POST /api/parking-spots rejects missing name", async () => {

            const response =
                await request(app)
                    .post("/api/parking-spots")
                    .send({
                        location: "Ground Floor"
                    });

            expect(response.status)
                .toBe(400);

            expect(response.body.error)
                .toBe(
                    "Parking spot name is required"
                );
        });


        test("POST /api/parking-spots rejects empty name", async () => {

            const response =
                await request(app)
                    .post("/api/parking-spots")
                    .send({
                        name: "   ",
                        location: "Ground Floor"
                    });

            expect(response.status)
                .toBe(400);

            expect(response.body.error)
                .toBe(
                    "Parking spot name is required"
                );
        });


        test("GET /api/parking-spots returns parking spots", async () => {

            const response =
                await request(app)
                    .get("/api/parking-spots");

            expect(response.status)
                .toBe(200);

            expect(
                Array.isArray(response.body)
            ).toBe(true);

            const found =
                response.body.some(
                    spot =>
                        spot.id === parkingSpot.id
                );

            expect(found)
                .toBe(true);
        });

    });


    // Reservation creation and input validation
    describe("POST /api/reservations", () => {

        test("creates a valid reservation", async () => {

            const response =
                await request(app)
                    .post("/api/reservations")
                    .send({
                        parkingSpotId: parkingSpot.id,
                        startTime: "2035-01-01T08:00:00Z",
                        endTime: "2035-01-01T10:00:00Z"
                    });

            expect(response.status)
                .toBe(201);

            expect(response.body.id)
                .toBeDefined();

            expect(response.body.parkingSpotId)
                .toBe(parkingSpot.id);

            expect(response.body.status)
                .toBe("CONFIRMED");

            expect(response.body.createdAt)
                .toBeDefined();
        });


        test("rejects invalid parking spot id", async () => {

            const response =
                await request(app)
                    .post("/api/reservations")
                    .send({
                        parkingSpotId: "abc",
                        startTime: "2035-01-01T08:00:00Z",
                        endTime: "2035-01-01T10:00:00Z"
                    });

            expect(response.status)
                .toBe(400);

            expect(response.body.error)
                .toBe(
                    "Invalid parking spot id"
                );
        });


        test("rejects non-existing parking spot", async () => {

            const response =
                await request(app)
                    .post("/api/reservations")
                    .send({
                        parkingSpotId: 999999999,
                        startTime: "2035-01-01T08:00:00Z",
                        endTime: "2035-01-01T10:00:00Z"
                    });

            expect(response.status)
                .toBe(400);

            expect(response.body.error)
                .toBe(
                    "Parking spot does not exist"
                );
        });


        test("rejects invalid start date", async () => {

            const response =
                await request(app)
                    .post("/api/reservations")
                    .send({
                        parkingSpotId: parkingSpot.id,
                        startTime: "invalid-date",
                        endTime: "2035-01-01T10:00:00Z"
                    });

            expect(response.status)
                .toBe(400);

            expect(response.body.error)
                .toBe("Invalid date");
        });


        test("rejects invalid end date", async () => {

            const response =
                await request(app)
                    .post("/api/reservations")
                    .send({
                        parkingSpotId: parkingSpot.id,
                        startTime: "2035-01-01T08:00:00Z",
                        endTime: "invalid-date"
                    });

            expect(response.status)
                .toBe(400);

            expect(response.body.error)
                .toBe("Invalid date");
        });


        test("rejects when startTime equals endTime", async () => {

            const response =
                await request(app)
                    .post("/api/reservations")
                    .send({
                        parkingSpotId: parkingSpot.id,
                        startTime: "2035-01-01T08:00:00Z",
                        endTime: "2035-01-01T08:00:00Z"
                    });

            expect(response.status)
                .toBe(400);

            expect(response.body.error)
                .toBe(
                    "Start time must be before end time"
                );
        });


        test("rejects when startTime is after endTime", async () => {

            const response =
                await request(app)
                    .post("/api/reservations")
                    .send({
                        parkingSpotId: parkingSpot.id,
                        startTime: "2035-01-01T12:00:00Z",
                        endTime: "2035-01-01T10:00:00Z"
                    });

            expect(response.status)
                .toBe(400);

            expect(response.body.error)
                .toBe(
                    "Start time must be before end time"
                );
        });


        test("rejects reservation in the past", async () => {

            const response =
                await request(app)
                    .post("/api/reservations")
                    .send({
                        parkingSpotId: parkingSpot.id,
                        startTime: "2020-01-01T08:00:00Z",
                        endTime: "2020-01-01T10:00:00Z"
                    });

            expect(response.status)
                .toBe(400);

            expect(response.body.error)
                .toBe(
                    "Cannot create a reservation in the past"
                );
        });


        test("rejects reservation for inactive parking spot", async () => {

            // Make the parking spot unavailable
            await prisma.parkingSpot.update({
                where: {
                    id: parkingSpot.id
                },
                data: {
                    isActive: false
                }
            });

            const response =
                await request(app)
                    .post("/api/reservations")
                    .send({
                        parkingSpotId: parkingSpot.id,
                        startTime: "2035-02-01T08:00:00Z",
                        endTime: "2035-02-01T10:00:00Z"
                    });

            expect(response.status)
                .toBe(400);

            expect(response.body.error)
                .toBe(
                    "Parking spot is not active"
                );
        });

    });


    // Check reservation time conflicts
    describe("Reservation overlap rules", () => {

        test("rejects overlapping reservation", async () => {

            // Create an existing reservation
            const first =
                await request(app)
                    .post("/api/reservations")
                    .send({
                        parkingSpotId: parkingSpot.id,
                        startTime: "2035-03-01T08:00:00Z",
                        endTime: "2035-03-01T10:00:00Z"
                    });

            expect(first.status)
                .toBe(201);


            // Try to reserve an overlapping interval
            const second =
                await request(app)
                    .post("/api/reservations")
                    .send({
                        parkingSpotId: parkingSpot.id,
                        startTime: "2035-03-01T09:00:00Z",
                        endTime: "2035-03-01T11:00:00Z"
                    });

            expect(second.status)
                .toBe(400);

            expect(second.body.error)
                .toBe(
                    "Parking spot is already reserved during this period"
                );
        });


        test("rejects reservation completely inside existing reservation", async () => {

            await request(app)
                .post("/api/reservations")
                .send({
                    parkingSpotId: parkingSpot.id,
                    startTime: "2035-04-01T08:00:00Z",
                    endTime: "2035-04-01T12:00:00Z"
                });

            const response =
                await request(app)
                    .post("/api/reservations")
                    .send({
                        parkingSpotId: parkingSpot.id,
                        startTime: "2035-04-01T09:00:00Z",
                        endTime: "2035-04-01T10:00:00Z"
                    });

            expect(response.status)
                .toBe(400);
        });


        test("rejects reservation containing existing reservation", async () => {

            await request(app)
                .post("/api/reservations")
                .send({
                    parkingSpotId: parkingSpot.id,
                    startTime: "2035-05-01T09:00:00Z",
                    endTime: "2035-05-01T10:00:00Z"
                });

            const response =
                await request(app)
                    .post("/api/reservations")
                    .send({
                        parkingSpotId: parkingSpot.id,
                        startTime: "2035-05-01T08:00:00Z",
                        endTime: "2035-05-01T11:00:00Z"
                    });

            expect(response.status)
                .toBe(400);
        });


        test("allows reservation immediately after another reservation", async () => {

            await request(app)
                .post("/api/reservations")
                .send({
                    parkingSpotId: parkingSpot.id,
                    startTime: "2035-06-01T08:00:00Z",
                    endTime: "2035-06-01T10:00:00Z"
                });

            const response =
                await request(app)
                    .post("/api/reservations")
                    .send({
                        parkingSpotId: parkingSpot.id,
                        startTime: "2035-06-01T10:00:00Z",
                        endTime: "2035-06-01T12:00:00Z"
                    });

            expect(response.status)
                .toBe(201);
        });


        test("allows reservation immediately before another reservation", async () => {

            await request(app)
                .post("/api/reservations")
                .send({
                    parkingSpotId: parkingSpot.id,
                    startTime: "2035-07-01T10:00:00Z",
                    endTime: "2035-07-01T12:00:00Z"
                });

            const response =
                await request(app)
                    .post("/api/reservations")
                    .send({
                        parkingSpotId: parkingSpot.id,
                        startTime: "2035-07-01T08:00:00Z",
                        endTime: "2035-07-01T10:00:00Z"
                    });

            expect(response.status)
                .toBe(201);
        });

    });


    // Query reservations through the API
    describe("Reservation queries", () => {

        test("GET /api/reservations returns reservations", async () => {

            await prisma.reservation.create({
                data: {
                    parkingSpotId: parkingSpot.id,
                    startTime:
                        new Date("2035-08-01T08:00:00Z"),
                    endTime:
                        new Date("2035-08-01T10:00:00Z")
                }
            });

            const response =
                await request(app)
                    .get("/api/reservations");

            expect(response.status)
                .toBe(200);

            expect(
                Array.isArray(response.body)
            ).toBe(true);

            const reservation =
                response.body.find(
                    item =>
                        item.parkingSpotId ===
                        parkingSpot.id
                );

            expect(reservation)
                .toBeDefined();

            expect(reservation.parkingSpot)
                .toBeDefined();

            expect(reservation.parkingSpot.id)
                .toBe(parkingSpot.id);
        });


        test("GET /api/parking-spots/:id/reservations returns reservations for one parking spot", async () => {

            await prisma.reservation.create({
                data: {
                    parkingSpotId: parkingSpot.id,
                    startTime:
                        new Date("2035-09-01T08:00:00Z"),
                    endTime:
                        new Date("2035-09-01T10:00:00Z")
                }
            });

            const response =
                await request(app)
                    .get(
                        `/api/parking-spots/${parkingSpot.id}/reservations`
                    );

            expect(response.status)
                .toBe(200);

            expect(
                Array.isArray(response.body)
            ).toBe(true);

            expect(response.body.length)
                .toBe(1);

            expect(
                response.body[0].parkingSpotId
            ).toBe(parkingSpot.id);
        });


        test("GET parking spot reservations rejects invalid id", async () => {

            const response =
                await request(app)
                    .get(
                        "/api/parking-spots/abc/reservations"
                    );

            expect(response.status)
                .toBe(400);

            expect(response.body.error)
                .toBe(
                    "Invalid parking spot id"
                );
        });


        test("GET parking spot reservations returns 404 for unknown parking spot", async () => {

            const response =
                await request(app)
                    .get(
                        "/api/parking-spots/999999999/reservations"
                    );

            expect(response.status)
                .toBe(404);

            expect(response.body.error)
                .toBe(
                    "Parking spot not found"
                );
        });

    });


    // Reservation cancellation behavior
    describe("Reservation cancellation", () => {

        test("PATCH /api/reservations/:id/cancel cancels reservation", async () => {

            const reservation =
                await prisma.reservation.create({
                    data: {
                        parkingSpotId: parkingSpot.id,
                        startTime:
                            new Date("2035-10-01T08:00:00Z"),
                        endTime:
                            new Date("2035-10-01T10:00:00Z")
                    }
                });

            const response =
                await request(app)
                    .patch(
                        `/api/reservations/${reservation.id}/cancel`
                    );

            expect(response.status)
                .toBe(200);

            expect(response.body.status)
                .toBe("CANCELLED");
        });


        test("cancelled reservation remains in database", async () => {

            const reservation =
                await prisma.reservation.create({
                    data: {
                        parkingSpotId: parkingSpot.id,
                        startTime:
                            new Date("2035-11-01T08:00:00Z"),
                        endTime:
                            new Date("2035-11-01T10:00:00Z")
                    }
                });

            await request(app)
                .patch(
                    `/api/reservations/${reservation.id}/cancel`
                );

            const storedReservation =
                await prisma.reservation.findUnique({
                    where: {
                        id: reservation.id
                    }
                });

            expect(storedReservation)
                .not.toBeNull();

            expect(storedReservation.status)
                .toBe("CANCELLED");
        });


        test("cannot cancel the same reservation twice", async () => {

            const reservation =
                await prisma.reservation.create({
                    data: {
                        parkingSpotId: parkingSpot.id,
                        startTime:
                            new Date("2035-12-01T08:00:00Z"),
                        endTime:
                            new Date("2035-12-01T10:00:00Z")
                    }
                });

            await request(app)
                .patch(
                    `/api/reservations/${reservation.id}/cancel`
                );

            const response =
                await request(app)
                    .patch(
                        `/api/reservations/${reservation.id}/cancel`
                    );

            expect(response.status)
                .toBe(400);

            expect(response.body.error)
                .toBe(
                    "Reservation is already cancelled"
                );
        });


        test("returns 404 when cancelling unknown reservation", async () => {

            const response =
                await request(app)
                    .patch(
                        "/api/reservations/999999999/cancel"
                    );

            expect(response.status)
                .toBe(404);

            expect(response.body.error)
                .toBe(
                    "Reservation not found"
                );
        });


        test("rejects invalid reservation id", async () => {

            const response =
                await request(app)
                    .patch(
                        "/api/reservations/abc/cancel"
                    );

            expect(response.status)
                .toBe(400);

            expect(response.body.error)
                .toBe(
                    "Invalid reservation id"
                );
        });

    });


    // Test the complete reservation lifecycle
    describe("Complete reservation workflow", () => {

        test("cancelled reservation frees the time interval", async () => {

            // Create the original reservation
            const firstReservation =
                await request(app)
                    .post("/api/reservations")
                    .send({
                        parkingSpotId: parkingSpot.id,
                        startTime: "2036-01-01T08:00:00Z",
                        endTime: "2036-01-01T10:00:00Z"
                    });

            expect(firstReservation.status)
                .toBe(201);


            // The overlapping reservation must be rejected
            const conflict =
                await request(app)
                    .post("/api/reservations")
                    .send({
                        parkingSpotId: parkingSpot.id,
                        startTime: "2036-01-01T09:00:00Z",
                        endTime: "2036-01-01T11:00:00Z"
                    });

            expect(conflict.status)
                .toBe(400);


            // Cancel the original reservation
            const cancellation =
                await request(app)
                    .patch(
                        `/api/reservations/${firstReservation.body.id}/cancel`
                    );

            expect(cancellation.status)
                .toBe(200);

            expect(cancellation.body.status)
                .toBe("CANCELLED");


            // The previously blocked interval should now be available
            const newReservation =
                await request(app)
                    .post("/api/reservations")
                    .send({
                        parkingSpotId: parkingSpot.id,
                        startTime: "2036-01-01T09:00:00Z",
                        endTime: "2036-01-01T11:00:00Z"
                    });

            expect(newReservation.status)
                .toBe(201);

            expect(newReservation.body.status)
                .toBe("CONFIRMED");
        });

    });

});