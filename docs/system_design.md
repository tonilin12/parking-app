# System Design

## 1. Overview

The application is a parking reservation system that allows parking spaces
to be managed and reserved through an HTTP API.

The system is divided into the following main layers:

Client
  ↓
Express Routes
  ↓
Controllers
  ↓
Service Layer
  ↓
Prisma ORM
  ↓
SQLite Database


## 2. Main Components

### Express Application

Express provides the HTTP API for the application.

The system uses two main route groups:

- `/api/parking-spots`
- `/api/reservations`

The main application files are:

- `src/app.js`
- `src/server.js`

`app.js` creates and configures the Express application.

`server.js` starts the HTTP server.


### Route Layer

The route files define which controller function is called for each HTTP endpoint.

Files:

- `src/routes/parkingSpotRoutes.js`
- `src/routes/reservationRoutes.js`

The route layer is responsible for connecting incoming HTTP requests
to the appropriate controller functions.


### Controller Layer

Controllers process HTTP requests and return HTTP responses.

Files:

- `src/controllers/parkingSpotController.js`
- `src/controllers/reservationController.js`

Their responsibilities include:

- reading request parameters and request bodies;
- validating basic input;
- calling service functions;
- returning appropriate HTTP status codes;
- handling errors.


### Service Layer

The main reservation business logic is implemented in:

`src/services/reservationService.js`

This layer decides whether a reservation request can be accepted.

Before creating a reservation, the system checks that:

- the provided dates are valid;
- the start time is earlier than the end time;
- the reservation does not start in the past;
- the parking spot exists;
- the parking spot is active;
- the requested time interval does not overlap with another confirmed reservation.

Two reservations overlap when:

existing.startTime < requested.endTime

and

existing.endTime > requested.startTime

Only reservations with status `CONFIRMED` are considered during conflict checking.


## 3. Database

The application uses an SQLite database.

Prisma ORM is used for database access.

The Prisma client is initialized in:

`src/db.js`


### ParkingSpot

The `ParkingSpot` model stores information about parking spaces.

Fields:

- `id`
- `name`
- `location`
- `isActive`


### Reservation

The `Reservation` model stores reservation information.

Fields:

- `id`
- `parkingSpotId`
- `startTime`
- `endTime`
- `status`
- `createdAt`


The relationship between the models is:

ParkingSpot 1 ---- N Reservation

One parking spot can have multiple reservations.

Each reservation belongs to exactly one parking spot.


## 4. Reservation Status

A reservation can have one of two states:

- `CONFIRMED`
- `CANCELLED`

When a reservation is cancelled, the database record is not deleted.

Instead, its status is changed to `CANCELLED`.

Cancelled reservations are ignored when checking whether a new reservation
conflicts with an existing reservation.


## 5. Seed Data

Development data is generated using Faker.js.

Factory files:

- `prisma/factories/parkingSpotFactory.js`
- `prisma/factories/reservationFactory.js`

The seed process is implemented in:

`prisma/seed.js`

Factories are used only for generating fake development and test data.
They are not used for normal HTTP reservation requests.


## 6. Testing

The application uses automated tests.

Technologies:

- Jest
- Supertest

The tests verify functionality such as:

- parking spot creation;
- reservation creation;
- invalid date handling;
- reservation overlap detection;
- inactive parking spots;
- reservation cancellation;
- API endpoints;
- complete reservation workflows.


## 7. Reservation Creation Flow

The flow of a reservation request is:

1. The client sends a POST request to `/api/reservations`.
2. The Express route forwards the request to the reservation controller.
3. The controller calls the reservation service.
4. The service performs the business-rule checks.
5. If the request is valid, Prisma creates the reservation.
6. SQLite stores the reservation record.
7. The controller returns an HTTP 201 response to the client.


## 8. Project Structure

The main project structure is:

parking-app
│
├── prisma
│   ├── factories
│   │   ├── parkingSpotFactory.js
│   │   └── reservationFactory.js
│   ├── migrations
│   ├── schema.prisma
│   └── seed.js
│
├── src
│   ├── app.js
│   ├── server.js
│   ├── db.js
│   │
│   ├── controllers
│   │   ├── parkingSpotController.js
│   │   └── reservationController.js
│   │
│   ├── routes
│   │   ├── parkingSpotRoutes.js
│   │   └── reservationRoutes.js
│   │
│   └── services
│       └── reservationService.js
│
└── tests
    ├── database.test.js
    ├── factories.test.js
    ├── reservationService.test.js
    └── api.test.js# API Documentation

## 1. Overview

The application provides a REST API for managing parking spots and parking reservations.

The base URL is:

http://localhost:3000

The API communicates using JSON.

Main resource groups:

- parking spots;
- reservations.


## 2. API Status

### GET /

Returns a simple status message to confirm that the API is running.

#### Response

Status:

200 OK

Example:

{
  "message": "Parking reservation API is running"
}


## 3. Parking Spot Operations

### 3.1 Create Parking Spot

### POST /api/parking-spots

Creates a new parking spot.

#### Request Body

{
  "name": "P-001",
  "location": "Ground Floor"
}

Fields:

- `name` — required string;
- `location` — optional string.

#### Successful Response

Status:

201 Created

Example:

{
  "id": 1,
  "name": "P-001",
  "location": "Ground Floor",
  "isActive": true
}

#### Possible Errors

Missing or empty name:

400 Bad Request

{
  "error": "Parking spot name is required"
}


### 3.2 List Parking Spots

### GET /api/parking-spots

Returns all parking spots ordered by ID.

#### Successful Response

Status:

200 OK

Example:

[
  {
    "id": 1,
    "name": "P-001",
    "location": "Ground Floor",
    "isActive": true
  },
  {
    "id": 2,
    "name": "P-002",
    "location": "First Floor",
    "isActive": true
  }
]


### 3.3 List Reservations of a Parking Spot

### GET /api/parking-spots/:id/reservations

Returns all reservations belonging to a selected parking spot.

Example:

GET /api/parking-spots/1/reservations

#### Successful Response

Status:

200 OK

Example:

[
  {
    "id": 5,
    "startTime": "2035-01-01T08:00:00.000Z",
    "endTime": "2035-01-01T10:00:00.000Z",
    "status": "CONFIRMED",
    "createdAt": "2026-08-06T10:00:00.000Z",
    "parkingSpotId": 1
  }
]

#### Possible Errors

Invalid parking spot ID:

400 Bad Request

{
  "error": "Invalid parking spot id"
}

Parking spot not found:

404 Not Found

{
  "error": "Parking spot not found"
}


## 4. Reservation Operations

### 4.1 Create Reservation

### POST /api/reservations

Creates a reservation if the requested time interval is available.

#### Request Body

{
  "parkingSpotId": 1,
  "startTime": "2035-01-01T08:00:00Z",
  "endTime": "2035-01-01T10:00:00Z"
}

Fields:

- `parkingSpotId` — ID of the parking spot;
- `startTime` — reservation starting time;
- `endTime` — reservation ending time.

The date values must be valid date strings.

#### Successful Response

Status:

201 Created

Example:

{
  "id": 10,
  "startTime": "2035-01-01T08:00:00.000Z",
  "endTime": "2035-01-01T10:00:00.000Z",
  "status": "CONFIRMED",
  "createdAt": "2026-08-06T10:00:00.000Z",
  "parkingSpotId": 1
}


## 5. Reservation Validation

Before creating a reservation, the system performs several checks.

The request is accepted only if:

- the parking spot ID is valid;
- the parking spot exists;
- the parking spot is active;
- both dates are valid;
- the start time is earlier than the end time;
- the reservation does not start in the past;
- the requested interval does not overlap with an existing confirmed reservation.


### Invalid Parking Spot ID

Status:

400 Bad Request

{
  "error": "Invalid parking spot id"
}


### Parking Spot Does Not Exist

Status:

400 Bad Request

{
  "error": "Parking spot does not exist"
}


### Invalid Date

Status:

400 Bad Request

{
  "error": "Invalid date"
}


### Invalid Time Interval

Status:

400 Bad Request

{
  "error": "Start time must be before end time"
}


### Reservation in the Past

Status:

400 Bad Request

{
  "error": "Cannot create a reservation in the past"
}


### Inactive Parking Spot

Status:

400 Bad Request

{
  "error": "Parking spot is not active"
}


### Reservation Conflict

Status:

400 Bad Request

{
  "error": "Parking spot is already reserved during this period"
}


## 6. Reservation Conflict Rule

A new reservation conflicts with an existing confirmed reservation when:

existing.startTime < requested.endTime

and

existing.endTime > requested.startTime

For example:

Existing reservation:

08:00 - 10:00

Requested reservation:

09:00 - 11:00

Result:

Rejected because the intervals overlap.

Back-to-back reservations are allowed.

Example:

08:00 - 10:00

10:00 - 12:00

Result:

Accepted.


## 7. List All Reservations

### GET /api/reservations

Returns all reservations.

The related parking spot is also included.

#### Successful Response

Status:

200 OK

Example:

[
  {
    "id": 10,
    "startTime": "2035-01-01T08:00:00.000Z",
    "endTime": "2035-01-01T10:00:00.000Z",
    "status": "CONFIRMED",
    "createdAt": "...",
    "parkingSpotId": 1,
    "parkingSpot": {
      "id": 1,
      "name": "P-001",
      "location": "Ground Floor",
      "isActive": true
    }
  }
]


## 8. Cancel Reservation

### PATCH /api/reservations/:id/cancel

Cancels an existing reservation.

Example:

PATCH /api/reservations/10/cancel

The reservation is not deleted from the database.

Its status changes from:

CONFIRMED

to:

CANCELLED


#### Successful Response

Status:

200 OK

Example:

{
  "id": 10,
  "startTime": "2035-01-01T08:00:00.000Z",
  "endTime": "2035-01-01T10:00:00.000Z",
  "status": "CANCELLED",
  "createdAt": "...",
  "parkingSpotId": 1
}


#### Possible Errors

Invalid reservation ID:

400 Bad Request

{
  "error": "Invalid reservation id"
}

Reservation not found:

404 Not Found

{
  "error": "Reservation not found"
}

Reservation already cancelled:

400 Bad Request

{
  "error": "Reservation is already cancelled"
}


## 9. Reservation Cancellation Behavior

Cancelled reservations remain stored in the database for historical purposes.

However, only reservations with status `CONFIRMED` are considered during overlap checks.

Therefore, after a reservation is cancelled, its previously occupied time interval becomes available for a new reservation.


## 10. HTTP Status Codes

The API mainly uses the following status codes:

- `200 OK` — successful request;
- `201 Created` — resource successfully created;
- `400 Bad Request` — invalid request or business-rule violation;
- `404 Not Found` — requested resource does not exist;
- `500 Internal Server Error` — unexpected server-side error.