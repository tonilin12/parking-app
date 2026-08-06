# Parking Reservation System

A small backend application for managing parking spots and reservations.

The system allows users to:

- create and list parking spots;
- create reservations for a selected time interval;
- reject overlapping reservations;
- query reservations;
- cancel existing reservations.

Cancelled reservations remain stored in the database with `CANCELLED` status and no longer block the parking spot.

## Technologies

- Node.js
- Express.js
- Prisma ORM
- SQLite
- Jest
- Supertest
- Faker.js

## Setup

Install dependencies:

```bash
npm install
