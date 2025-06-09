# Pet Finder Backend

Pet Finder is a backend REST API designed to support a web application for managing lost, found, and adoptable pets. The project is part of a Final Degree Project (TFG) and aims to provide a robust, secure, and scalable backend for pet management, user authentication, and community interaction through comments.

---

## Table of Contents

- [Project Objectives](#project-objectives)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Folder Structure](#folder-structure)
- [Key Files](#key-files)
- [API Documentation](#api-documentation)
- [Environment Variables](#environment-variables)
- [Running the Project](#running-the-project)
- [Testing](#testing)
- [Docker Support](#docker-support)
- [License](#license)

---

## Project Objectives

- **Pet Management:** Allow users to create, update, and delete pet profiles, including lost, found, and adoptable pets.
- **User Authentication:** Secure registration, login, email verification, password reset, and JWT-based authentication.
- **Community Interaction:** Enable users to comment on pets and interact with other users.
- **Admin Panel:** (Planned) Admin-only endpoints for user and pet management.
- **Documentation:** Provide clear API documentation using Swagger and Postman collections.
- **Security:** Implement robust authentication, authorization, and error handling.

---

## Features

- **User Registration & Login:** With email verification and JWT authentication.
- **Password Recovery:** Secure password reset via email.
- **Pet CRUD:** Create, read, update, and delete pets, including image upload via Cloudinary.
- **Lost & Found:** Mark pets as lost or found, with geolocation support.
- **Comments:** Users can comment on pets.
- **Role-based Access:** Admin and user roles, with owner checks for sensitive actions.
- **API Documentation:** Swagger UI and Postman collections.
- **Logging:** Centralized logging with Winston.
- **Testing:** Unit tests with Jest and Supertest.
- **Dockerized:** Ready for deployment with Docker and Docker Compose.

---

## Technology Stack

- **Node.js** (v22)
- **Express.js** (REST API)
- **MongoDB** (via Mongoose ODM)
- **JWT** (Authentication)
- **Bcrypt.js** (Password hashing)
- **Nodemailer** (Email sending)
- **Cloudinary** (Image storage)
- **Swagger** (API documentation)
- **Winston** (Logging)
- **Jest & Supertest** (Testing)
- **Docker & Docker Compose** (Deployment)
- **SonarQube** (Code quality)

---

## Folder Structure
```
petFinder-BackEnd/
│
├── src/
│   ├── app.js                # Express app setup
│   ├── index.js              # Entry point
│   ├── config.js             # Main configuration
│   ├── config/               # Additional config (e.g., winston)
│   ├── controllers/          # Route controllers (user, pet, comment, auth)
│   ├── documentation/        # Swagger setup
│   ├── helpers/              # Utilities (cloudinary, logger)
│   ├── loaders/              # Express & DB loaders
│   ├── middlewares/          # Custom middlewares (auth, logger, error handler)
│   ├── models/               # Mongoose models (User, Pet, Comment, LostFound)
│   ├── routes/
│   │   └── v1/               # API v1 routes (users, pets, comments, auth)
│   ├── services/             # Business logic (mailer, etc.)
│   ├── test/
│   │   └── unit/             # Unit tests (Jest)
│   ├── documentation/
│   │   └── postman/          # Postman collections and environments
│   └── logs/                 # Log files (created at runtime)
│
├── .github/                  # GitHub Actions workflows
├── .env.template             # Example environment variables
├── Dockerfile                # Docker build instructions
├── docker-compose.yml        # Docker Compose setup
├── package.json              # NPM dependencies and scripts
├── README.md                 # Project documentation
└── LICENSE                   # License information
```

---

## Key Files

- [`src/app.js`](src/app.js): Express application setup and middleware loading.
- [`src/index.js`](src/index.js): Main entry point, starts the server.
- [`src/config.js`](src/config.js): Loads environment variables and configuration.
- [`src/controllers/`](src/controllers/): Contains business logic for users, pets, comments, and authentication.
- [`src/models/`](src/models/): Mongoose schemas for User, Pet, Comment, and LostFound.
- [`src/routes/v1/`](src/routes/v1/): API route definitions for users, pets, comments, and auth.
- [`src/services/mailer.js`](src/services/mailer.js): Email sending logic (verification, confirmation, password reset).
- [`src/helpers/cloudinary.js`](src/helpers/cloudinary.js): Cloudinary image upload configuration.
- [`src/documentation/swagger.js`](src/documentation/swagger.js): Swagger API documentation setup.
- [`test/unit/`](test/unit/): Unit tests using Jest and Supertest.
- [`documentation/postman/`](documentation/postman/): Postman collections and environments for API testing.

---

## API Documentation

- **Swagger UI:** Available at `/api-docs` when the server is running.
- **Postman Collection:** Located in [`documentation/postman/Pet Finder API.postman_collection.json`](documentation/postman/Pet%20Finder%20API.postman_collection.json).

---

## Environment Variables

Copy `.env.template` to `.env` and fill in the required values:
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/petfinder APIBASE=/api/v1 JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name CLOUDINARY_API_KEY=your_cloudinary_key CLOUDINARY_API_SECRET=your_cloudinary_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password

---

## Running the Project

### Local Development

```sh
npm install
npm run dev
```

The API will be available at [http://localhost:3333/api/v1](http://localhost:3333/api/v1).

### Production

Set up your environment variables and run:

```sh
npm run start
```

### Testing

Run all tests:

```sh
npm test
```

Coverage reports are generated automatically.

---
## Docker Support

Build and run with Docker Compose:

```sh
docker-compose up --build
```

Includes services for MongoDB, MailHog (for email testing), and SonarQube (for code quality).

---
## License

See [LICENSE](LICENSE) for usage restrictions.

> **Note:** This project is for personal and academic use only. Commercial use, modification, or distribution is prohibited without explicit permission.

---
## Author

Javier Moreno Picon
Contact: [javier.moreno.picon@gmail.com](mailto:javier.moreno.picon@gmail.com)
