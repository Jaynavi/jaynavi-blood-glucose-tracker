# Jaynavi – Blood Glucose Tracker

A full-stack web application that helps users record, manage, and track their daily blood glucose readings.

## About the Project

Jaynavi – Blood Glucose Tracker is a personal glucose monitoring application where users can create an account, log in, add their glucose readings, update or delete records, view reading history, and check reports.

The application provides a simple and user-friendly interface for managing blood glucose records.

## Features

- User Registration and Login
- Secure Password Hashing
- JWT-Based Authentication
- Add Blood Glucose Readings
- Edit Existing Readings
- Delete Readings
- View Reading History
- Dashboard with Daily and Monthly Statistics
- Daily, Monthly, and Previous Month Reports
- Date and Time Slot Selection
- Input Validation
- User-Specific Reading Records

## Technologies Used

### Frontend
- React.js
- Vite
- JavaScript
- HTML
- CSS

### Backend
- Node.js
- Express.js
- REST APIs
- JSON Web Token (JWT)
- bcryptjs

### Database
- PostgreSQL

### Tools
- Visual Studio Code
- Postman
- pgAdmin
- Git and GitHub

## Project Structure

```text
blood-project/
│
├── backend/
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── readings.js
│   ├── db.js
│   ├── server.js
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

## Database

The project uses PostgreSQL with two main tables:

**1. users**
- id
- name
- email
- password
- created_at

**2. glucose_readings**
- id
- user_id
- reading_date
- time_slot
- glucose_value
- created_at

## How to Run the Project

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### 2. Start the Backend

```bash
cd backend
npm install
node server.js
```

The backend runs on:

```text
http://localhost:5000
```

### 3. Start the Frontend

Open a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed in the terminal.

## Environment Variables

Create a `.env` file inside the backend folder and configure:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sweety_db
DB_USER=postgres
DB_PASSWORD=your_database_password
JWT_SECRET=your_jwt_secret
```

Replace the example values with your own local configuration. Never upload your actual `.env` file to GitHub.

## Validation

- Glucose readings must be whole numbers between 40 and 600 mg/dL.
- Future dates are not allowed.
- Users can access only their own glucose records.

## Author

**Jaynavi Shreya**

B.Tech – Electrical Engineering

NIT Jamshedpur

---

*Built as a full-stack Blood Glucose Tracking application.*