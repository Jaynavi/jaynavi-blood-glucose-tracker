# Sweety – Blood Glucose Tracker

A full-stack blood glucose tracking application built using React.js, Node.js, Express.js, and PostgreSQL.

## About the Project

Sweety helps users record, manage, and monitor their daily blood glucose readings. Users can create an account, log in securely, add readings, edit or delete records, view reading history, and check daily and monthly statistics.

## Features

- User registration and login
- Password hashing using bcryptjs
- JWT-based authentication
- Add, view, edit, and delete glucose readings
- Four daily time slots:
  - Morning (fasting)
  - After breakfast
  - After lunch
  - After dinner
- Reading history
- Daily and monthly dashboard statistics
- Input and date validation
- User-specific reading records

## Technologies Used

### Frontend
- React.js
- Vite
- JavaScript
- HTML and CSS

### Backend
- Node.js
- Express.js
- REST APIs
- JWT
- bcryptjs

### Database
- PostgreSQL

### Tools
- Git and GitHub
- VS Code
- pgAdmin
- Postman

## Project Structure

```text
blood-project/
├── backend/
│   ├── middleware/
│   ├── routes/
│   │   ├── auth.js
│   │   └── readings.js
│   ├── db.js
│   ├── server.js
│   ├── seed.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
└── README.md
```

## Database Setup

1. Install PostgreSQL.
2. Open pgAdmin.
3. Create a database named `sweety_db`.
4. Create the `users` and `glucose_readings` tables with the columns used by the application.

### Users Table

- id
- name
- email
- password
- created_at

### Glucose Readings Table

- id
- user_id
- reading_date
- time_slot
- glucose_value
- created_at

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Jaynavi/jaynavi-blood-glucose-tracker.git
cd jaynavi-blood-glucose-tracker
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder using `.env.example` as a reference.

Configure your local database credentials and JWT secret.

### 3. Start the Backend

```bash
npm start
```

Backend URL:

http://localhost:5000

### 4. Seed Demo Data

Open another terminal inside the backend folder and run:

```bash
npm run seed
```

This creates a demo account and sample glucose readings.

Demo account:

- Email: demo@sweety.com
- Password: SweetyDemo123

### 5. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite.

## Environment Variables

The backend requires the following environment variables:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sweety_db
DB_USER=postgres
DB_PASSWORD=your_database_password
JWT_SECRET=your_jwt_secret
```

See `backend/.env.example` for the example configuration.

Never upload actual passwords, database credentials, or JWT secrets to GitHub.

## Validation

The application includes validation for:

- Required glucose values
- Whole-number glucose values between 40 and 600 mg/dL
- Future dates
- Valid reading time slots
- Authenticated user access

## Testing

The application can be tested manually by:

1. Registering a new user.
2. Logging in with valid credentials.
3. Adding a glucose reading.
4. Viewing reading history.
5. Editing an existing reading.
6. Deleting a reading.
7. Checking dashboard statistics.

No automated test command is currently configured.

## Notes

- PostgreSQL is used for persistent data storage.
- Passwords are hashed before being stored.
- JWT authentication protects reading routes.
- Users can access only their own reading records.
- Automated tests and additional validation improvements can be added in future iterations.

## Author

**Jaynavi Shreya**

B.Tech – Electrical Engineering  
NIT Jamshedpur

---

Built as a full-stack Blood Glucose Tracking application.