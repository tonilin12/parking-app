# API Documentation

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