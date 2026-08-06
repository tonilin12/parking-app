# User Manual

## 1. Overview

The parking reservation system allows users to:

- view parking spots;
- create parking spots;
- create reservations;
- view reservations;
- view reservations belonging to a specific parking spot;
- cancel existing reservations.

The application is accessed through its HTTP API.


## 2. Requirements

The following software is required:

- Node.js
- npm

The application uses SQLite, so no separate database server is required.


## 3. Installation

Open the project folder in a terminal and install the dependencies:

npm install


## 4. Environment Configuration

The `.env` file must contain:

DATABASE_URL="file:./dev.db"


## 5. Database Setup

Create or update the database with:

npx prisma migrate dev

Generate the Prisma client with:

npx prisma generate


## 6. Seed Development Data

Example parking spots and reservations can be generated with:

node prisma/seed.js

The seed script clears the existing reservation and parking spot data before
creating new development data.


## 7. Starting the Application

Start the application in development mode with:

npm run dev

Or start it normally with:

npm start

The server runs at:

http://localhost:3000


## 8. Checking the Application

To verify that the server is running, access:

GET /

A successful response is:

{
  "message": "Parking reservation API is running"
}


## 9. Creating a Parking Spot

Send a POST request to:

POST /api/parking-spots

Example request body:

{
  "name": "P-001",
  "location": "Ground Floor"
}

The `name` field is required.

The `location` field is optional.

A newly created parking spot is active by default.


## 10. Viewing Parking Spots

Send:

GET /api/parking-spots

The response contains all registered parking spots.


## 11. Creating a Reservation

Send a POST request to:

POST /api/reservations

Example request:

{
  "parkingSpotId": 1,
  "startTime": "2035-01-01T08:00:00Z",
  "endTime": "2035-01-01T10:00:00Z"
}

The system checks the request before creating the reservation.

The reservation is accepted only if:

- the parking spot exists;
- the parking spot is active;
- the dates are valid;
- the start time is earlier than the end time;
- the reservation does not start in the past;
- there is no overlapping confirmed reservation.


## 12. Reservation Time Rules

Two confirmed reservations cannot overlap.

Example of an invalid reservation:

Existing reservation:

08:00 - 10:00

Requested reservation:

09:00 - 11:00

The request is rejected because the time intervals overlap.

Back-to-back reservations are allowed.

Example:

08:00 - 10:00

10:00 - 12:00

This is valid because the second reservation starts exactly when the first
reservation ends.


## 13. Viewing All Reservations

Send:

GET /api/reservations

The response contains all reservations together with their associated
parking spots.


## 14. Viewing Reservations of a Parking Spot

Send:

GET /api/parking-spots/:id/reservations

Example:

GET /api/parking-spots/1/reservations

This returns the reservations associated with parking spot ID 1.


## 15. Cancelling a Reservation

Send:

PATCH /api/reservations/:id/cancel

Example:

PATCH /api/reservations/10/cancel

The reservation is not removed from the database.

Its status changes from:

CONFIRMED

to:

CANCELLED

A cancelled reservation no longer blocks its time interval.


## 16. Common Errors

### Invalid parking spot ID

{
  "error": "Invalid parking spot id"
}


### Parking spot does not exist

{
  "error": "Parking spot does not exist"
}


### Invalid date

{
  "error": "Invalid date"
}


### Invalid time interval

{
  "error": "Start time must be before end time"
}


### Reservation in the past

{
  "error": "Cannot create a reservation in the past"
}


### Parking spot is inactive

{
  "error": "Parking spot is not active"
}


### Reservation conflict

{
  "error": "Parking spot is already reserved during this period"
}


### Reservation not found

{
  "error": "Reservation not found"
}


### Reservation already cancelled

{
  "error": "Reservation is already cancelled"
}


## 17. Running Tests

Run all automated tests with:

npm test

Run only the API tests with:

npx jest tests/api.test.js --runInBand

The tests verify:

- parking spot operations;
- reservation creation;
- input validation;
- overlap detection;
- inactive parking spots;
- reservation queries;
- cancellation;
- complete reservation workflows.


## 18. Inspecting the Database

The database can be viewed using Prisma Studio:

npx prisma studio

Prisma Studio provides a graphical interface for viewing the `ParkingSpot`
and `Reservation` records.


## 19. Typical Usage Workflow

1. Start the application.
2. List the available parking spots.
3. Select a parking spot.
4. Submit a reservation with a start and end time.
5. The system checks whether the reservation can be accepted.
6. If the request is valid, the reservation is created with `CONFIRMED` status.
7. The reservation can later be queried.
8. If necessary, the reservation can be cancelled.
9. A cancelled reservation no longer blocks the parking spot.