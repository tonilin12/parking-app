# Decision Log and Short Reflection

## 1. Decision Log

| # | Decision Point | What I Chose | Why | Alternatives Considered |
|---|---|---|---|---|
| 1 | Programming platform | Node.js | I chose Node.js because it has a mature ecosystem, many available libraries and tools, and it is widely used in production systems. It was also suitable for implementing a small HTTP-based backend quickly. | Other backend technologies such as Python or C# |
| 2 | Database and data modelling | Prisma ORM with SQLite | Prisma was used for defining and accessing the data model because it provided a convenient abstraction over the database. SQLite was selected because the project is relatively small and does not require the overhead of running a separate database server. | PostgreSQL or another full database server; direct SQL access without an ORM |
| 3 | API framework | Express.js | Express was chosen because it is lightweight, well established in the Node.js ecosystem, and provides a simple way to define HTTP routes and middleware. | Other Node.js web frameworks or implementing HTTP handling directly |
| 4 | User management | No explicit User model or authentication mechanism | I initially considered implementing a separate user mechanism, but it would have required additional time for user management, validation, and possibly authentication. Since the main focus of the task is the reservation mechanism, I decided to concentrate on that functionality instead. | Separate User entity with user-related routes and authentication |
| 5 | Reservation cancellation | Store cancelled reservations with `CANCELLED` status | Instead of deleting a cancelled reservation, its state is changed to `CANCELLED`. This preserves reservation history while ensuring that cancelled reservations no longer block the parking spot. | Permanently delete cancelled reservations |
| 6 | Project structure | Routes, controllers, service layer, Prisma database layer | I separated HTTP routing, request handling, business logic, and database access. This made the code easier to understand and allowed the reservation logic to be tested separately from the HTTP interface. | Put most of the logic directly into route handlers |
| 7 | Test data and testing | Factories, seed data, Jest and Supertest tests | Factories and seeders were added to generate development data and verify that the database model behaves correctly. I also added integration and API tests to check the main reservation workflow and important edge cases. | Manual testing only |
| 8 | Frontend | Backend/API only | I originally planned to add a frontend web page, but because of the limited development time I prioritized the functionality explicitly required by the task. | Implement an additional HTML/JavaScript frontend |

## 2. Short Reflection

During development, one of the main challenges was deciding how much functionality should be included beyond the core reservation requirements. I initially considered implementing explicit user management and a frontend, but both would have required significant additional development time, so I decided to focus on the reservation logic and API instead.

Another important problem was defining the reservation rules correctly, especially detecting overlapping reservations and deciding how cancellation should behave. I chose to keep cancelled reservations in the database with a `CANCELLED` status rather than deleting them, which preserves history while allowing the time interval to become available again.

I also paid particular attention to testing whenever a meaningful part of the system was completed. Database behaviour, generated seed data, reservation logic, and the main HTTP workflows were tested using Jest and Supertest.

Some fields in the `ParkingSpot` model may be more general than what is strictly required by the current implementation. These were originally introduced while exploring possible extensions, and I kept them because they did not interfere with the main functionality.

The largest challenge was balancing implementation quality with the limited amount of development time while still covering the core functionality required by the assignment.

## 3. AI Tool Usage

I used ChatGPT as an AI assistant during the development process.

My workflow was generally to ask AI for possible approaches, project structure, libraries, or implementation guidelines. I then reviewed the suggestions and decided whether they were appropriate for the project. When a suggestion did not fit the requirements or seemed unnecessarily complex, I modified it or replaced it with my own approach.

AI assistance was used for:

- exploring possible backend technologies and project structure;
- selecting and configuring Prisma and SQLite;
- discussing the use of Express for the HTTP API;
- reviewing the database model;
- designing the reservation conflict logic;
- discussing cancellation behaviour;
- generating initial testing ideas and test structure;
- debugging implementation problems;
- improving project documentation.

For example, a separate User model was initially considered based on an earlier design suggestion. After reviewing the actual task requirements and the additional development effort it would require, I decided that explicit user management was unnecessary for the main reservation functionality and removed it.

Similarly, some general-purpose fields were added to the parking spot model during the design process. Later I realized that not all of them were essential for the current implementation, but I kept them because they did not negatively affect the application and could support future extensions.

I treated AI output mainly as guidance rather than as a final solution. Suggested code and design choices were reviewed, tested, and adjusted during implementation.

The exported AI conversation history is attached separately as part of the development documentation.


AI chat history
https://chatgpt.com/share/6a7493e3-0ccc-83ed-8e99-764a34a41213