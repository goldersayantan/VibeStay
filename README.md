# VibeStay

VibeStay is a full-stack accommodation booking platform built with Node.js, Express, MongoDB, and EJS. It supports property discovery, host-managed listings, room availability checks, booking approvals, user profiles, reviews, wishlists, image uploads, OAuth authentication, and transactional email notifications.

The project is structured as a server-rendered MVC application and is designed to demonstrate production-style backend workflows: authentication, file upload pipelines, session persistence, geocoding, booking state management, and role-aware user journeys.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Routes](#available-routes)
- [Development Notes](#development-notes)
- [Testing](#testing)
- [Contributing](#contributing)
- [Author](#author)
- [License](#license)

## Features

- User authentication with local credentials and Google OAuth.
- Session-based login persistence backed by MongoDB.
- User signup, signin, logout, profile editing, and password reset flows.
- OTP-based verification and password recovery email support.
- Property listing CRUD for authenticated hosts.
- Multi-image listing uploads with Cloudinary storage.
- Address geocoding through OpenStreetMap Nominatim.
- Search and filtering by location, property type, amenities, and price range.
- Room-type configuration with pricing and availability checks.
- Booking requests with pending, approved, rejected, and cancelled states.
- Host approval and rejection workflows.
- Automatic email notifications for booking lifecycle events.
- Wishlist support for saved listings.
- Listing reviews with create, update, and delete actions.
- Static informational pages for trust, safety, hosting, policies, FAQs, and support.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Runtime | Node.js |
| Server | Express.js |
| Views | EJS, EJS Mate |
| Database | MongoDB, Mongoose |
| Authentication | Passport.js, Passport Local, Google OAuth 2.0 |
| Sessions | express-session, connect-mongo |
| File Uploads | Multer, Cloudinary |
| Email | Brevo SMTP API |
| HTTP Client | Axios |
| Styling | CSS |

## Project Structure

```text
VibeStay/
|-- app.js                  # Express application entry point
|-- config/                 # Database, auth, email, upload, and cloud config
|-- controllers/            # Route handlers and business logic
|-- emails/                 # Transactional email templates
|-- includes/               # Shared EJS partials
|-- layouts/                # EJS layout templates
|-- middleware/             # Authentication middleware
|-- models/                 # Mongoose schemas
|-- public/                 # Client-side scripts and stylesheets
|-- routes/                 # Express route modules
|-- utils/                  # Shared utility functions
|-- views/                  # EJS page templates
|-- package.json
`-- README.md
```

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js 18 or newer
- npm
- MongoDB database, local or hosted
- Cloudinary account
- Brevo account and API key
- Google OAuth credentials

### Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd VibeStay
npm install
```

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

If `.env.example` is not available, create `.env` manually using the variables listed below.

Start the application:

```bash
node app.js
```

For development with automatic restarts:

```bash
npx nodemon app.js
```

By default, the app runs at:

```text
http://localhost:8080
```

You can override the port with the `PORT` environment variable.

## Environment Variables

Create a `.env` file in the root directory and provide the following values:

```env
PORT=8080
MONGODB_URL=your_mongodb_connection_string
SESSION_SECRET=your_session_secret

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=your_verified_sender_email

GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
GOOGLE_CALLBACK_URL=http://localhost:8080/auth/google/callback
```

Never commit real credentials. The repository already ignores `.env` files.

## Available Routes

### Public Pages

| Method | Route | Description |
| --- | --- | --- |
| GET | `/` | Landing page |
| GET | `/listings` | Browse and filter listings |
| GET | `/listings/:id` | View listing details |
| GET | `/help-center` | Help center page |
| GET | `/contact` | Contact page |
| GET | `/faqs` | Frequently asked questions |
| GET | `/about-us` | About page |
| GET | `/trust-and-safety` | Trust and safety page |
| GET | `/privacy-policy` | Privacy policy |
| GET | `/terms-conditions` | Terms and conditions |

### Authentication

| Method | Route | Description |
| --- | --- | --- |
| GET | `/signup` | Render signup page |
| POST | `/signup` | Create account |
| GET | `/signin` | Render signin page |
| POST | `/signin` | Authenticate user |
| GET | `/logout` | End session |
| GET | `/auth/google` | Start Google OAuth |
| GET | `/auth/google/callback` | Google OAuth callback |
| GET | `/forgot-password` | Render password recovery page |
| POST | `/forgot-password` | Send recovery OTP |
| GET | `/verify-otp` | Render OTP verification page |
| POST | `/verify-otp` | Verify OTP |
| POST | `/reset-password` | Reset user password |

### Authenticated User Flows

| Method | Route | Description |
| --- | --- | --- |
| GET | `/profile` | User profile dashboard |
| GET | `/profile/edit` | Edit profile page |
| PUT | `/profile/edit` | Update profile |
| POST | `/wishlist/:id` | Toggle listing in wishlist |
| GET | `/bookings/new` | Create booking form |
| POST | `/bookings` | Submit booking request |
| POST | `/bookings/:id/cancel` | Cancel booking |

### Host and Listing Management

| Method | Route | Description |
| --- | --- | --- |
| GET | `/listings/new` | New listing form |
| POST | `/listings` | Create listing |
| GET | `/listings/:id/edit` | Edit listing form |
| PUT | `/listings/:id` | Update listing |
| DELETE | `/listings/:id` | Delete listing |
| GET | `/listings/:id/check-availability` | Check room availability |
| POST | `/bookings/:id/approve` | Approve booking request |
| POST | `/bookings/:id/reject` | Reject booking request |

### Reviews

| Method | Route | Description |
| --- | --- | --- |
| POST | `/listings/:id/reviews` | Create review |
| PUT | `/listings/:id/reviews/:reviewId` | Update review |
| DELETE | `/listings/:id/reviews/:reviewId` | Delete review |

## Development Notes

- The app uses server-rendered EJS views with shared layouts and partials.
- MongoDB stores users, listings, bookings, reviews, OTP records, and session data.
- Listing images are uploaded through Multer memory storage and persisted in Cloudinary.
- Listing locations are geocoded with OpenStreetMap Nominatim and stored as GeoJSON points.
- Booking availability is calculated against approved bookings for overlapping date ranges.
- Brevo powers transactional emails for OTPs and booking status updates.
- Authentication is handled through Passport local strategy and Google OAuth 2.0.

## Contributing

Contributions are welcome. To work on the project:

1. Fork the repository.
2. Create a feature branch.
3. Install dependencies with `npm install`.
4. Configure your local `.env` file.
5. Make your changes with focused commits.
6. Open a pull request with a clear description of the change.

Before opening a pull request, verify that the app starts locally and that the affected user flows work end to end.

## Author

Built by **Sayantan Golder**.

## License

This project is licensed under the ISC License.
