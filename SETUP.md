# 🎬 CINERUSH-DEPLOY

CINERUSH is a full-stack online movie ticket booking system.

This repository contains the deployment-ready version of CINERUSH, including:

* Frontend
* Node.js + Express backend
* MySQL database
* REST APIs
* User authentication
* Movie listings
* Showtime selection
* Seat selection
* Booking system
* Ticket generation
* Deployment configuration

---

# 1. Technology Stack

## Frontend

* HTML
* CSS
* JavaScript

## Backend

* Node.js
* Express.js
* REST API
* JWT Authentication
* bcrypt

## Database

* MySQL
* MySQL Workbench for local development
* Aiven MySQL for cloud deployment

## Deployment

* Frontend → GitHub Pages
* Backend → Cloud hosting
* Database → Aiven MySQL

---

# 2. Prerequisites

Before setting up CINERUSH-DEPLOY, install the following:

### Required

* Node.js
* npm
* MySQL Server
* MySQL Workbench
* Git
* VS Code
* Modern web browser

### Verify Node.js

Open PowerShell / Command Prompt:

```bash
node -v
```

Then:

```bash
npm -v
```

If both commands return version numbers, Node.js is installed correctly.

> **Important:** JavaScript does not need to be installed separately. JavaScript is the programming language used by the frontend, while Node.js allows JavaScript to run on the backend.

---

# 3. Download the Project

Clone the repository:

```bash
git clone https://github.com/BGARMY/CINERUSH.git
```

Move into the project:

```bash
cd CINERUSH
```

If you are using the deployment-specific folder:

```text
CINERUSH-DEPLOY/
```

open that folder in VS Code.

---

# 4. Project Structure

The deployment project should contain a structure similar to:

```text
CINERUSH-DEPLOY/
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   ├── .env
│   ├── package.json
│   ├── server.js
│   └── ...
│
├── frontend/
│   ├── pages/
│   ├── css/
│   ├── js/
│   ├── images/
│   └── ...
│
├── database/
│   └── cinerush.sql
│
├── .gitignore
└── README.md
```

---

# 5. Local MySQL Setup

For local development, you can use MySQL Server installed on your computer.

Open MySQL Workbench.

Create the database:

```sql
CREATE DATABASE cinerush;
```

Select it:

```sql
USE cinerush;
```

Verify:

```sql
SHOW TABLES;
```

---

# 6. Import the Database

If the project contains a SQL file such as:

```text
database/cinerush.sql
```

open the SQL file in MySQL Workbench.

Execute the complete script.

After importing, verify:

```sql
USE cinerush;

SHOW TABLES;
```

You should see the tables required by CINERUSH, such as:

```text
users
movies
showtimes
seats
bookings
```

You can check movie data:

```sql
SELECT * FROM movies;
```

---

# 7. Backend Setup

Open a terminal in the backend folder:

```bash
cd backend
```

Install all required packages:

```bash
npm install
```

This installs the dependencies listed in:

```text
backend/package.json
```

---

# 8. Configure Environment Variables

Inside:

```text
backend/
```

create:

```text
.env
```

Example:

```env
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_NAME=cinerush
DB_PORT=3306

JWT_SECRET=YOUR_SECRET_KEY
```

Replace:

```text
YOUR_MYSQL_PASSWORD
```

with your local MySQL password.

Replace:

```text
YOUR_SECRET_KEY
```

with a secure secret.

---

# 9. Start the Backend Locally

Inside the `backend` folder:

```bash
npm start
```

If the project uses:

```bash
node server.js
```

you can also start it directly with:

```bash
node server.js
```

A successful server should show something similar to:

```text
Server running on port 5000
Database connected successfully
```

Keep this terminal open.

---

# 10. Run CINERUSH Locally

After starting the backend, open the browser.

Use:

```text
http://localhost:5000/cinerush/pages/splash.html
```

If your backend is specifically configured for HTTPS, use:

```text
https://localhost:5000/cinerush/pages/splash.html
```

The CINERUSH application should now load.

---

# 11. Important: Frontend API Configuration

The frontend communicates with the backend through API requests.

For example:

```javascript
fetch("http://localhost:5000/api/bookings/create")
```

This works only when the backend is running locally.

For deployment, this URL must be changed to the **deployed backend URL**.

Example:

```javascript
fetch("https://your-backend-domain.com/api/bookings/create")
```

Do not leave:

```text
localhost:5000
```

inside production frontend code.

---

# 12. Deploying the Database to Aiven

For production deployment, CINERUSH can use **Aiven MySQL** instead of the local MySQL server.

Create an Aiven MySQL service.

After creating the service, obtain the MySQL connection information:

```text
Host
Port
Username
Password
Database
SSL Certificate
```

Your production backend environment variables should contain the Aiven database details.

Example:

```env
PORT=5000

DB_HOST=YOUR_AIVEN_HOST
DB_USER=YOUR_AIVEN_USER
DB_PASSWORD=YOUR_AIVEN_PASSWORD
DB_NAME=cinerush
DB_PORT=YOUR_AIVEN_PORT

JWT_SECRET=YOUR_SECRET_KEY
```

Use the exact values provided by Aiven.

---

# 13. Important Aiven Database Note

Aiven may initially show a database such as:

```text
defaultdb
```

This does not automatically mean your application is using a database named:

```text
cinerush
```

The backend database configuration determines which database is being used.

Check:

```env
DB_NAME=cinerush
```

If your Aiven service only provides `defaultdb`, you may need to create/import your CINERUSH tables into that database and configure the backend accordingly.

Always verify the database actually being used by the backend.

---

# 14. Import CINERUSH Database into Aiven

Export your local CINERUSH database from MySQL Workbench.

Then import the SQL structure/data into your Aiven MySQL service.

After importing, verify:

```sql
SHOW TABLES;
```

Then:

```sql
SELECT * FROM movies;
```

Make sure the required movie records are available.

---

# 15. Aiven SSL Configuration

Aiven MySQL commonly requires SSL/TLS connections.

If your Aiven service provides a CA certificate, download the CA certificate.

Place it somewhere accessible to the backend, for example:

```text
backend/
├── certificates/
│   └── ca.pem
```

Configure your MySQL connection according to the SSL requirements of your Aiven service.

Example concept:

```javascript
ssl: {
    ca: process.env.DB_CA
}
```

Do not expose private credentials or certificates publicly.

---

# 16. Deploy the Backend

Deploy the Node.js backend to your selected backend hosting provider.

Before deploying, make sure:

```text
npm install
```

works correctly.

The backend hosting service should run:

```bash
npm start
```

The deployed backend should provide a URL similar to:

```text
https://your-backend-domain.com
```

Test the backend before connecting the frontend.

---

# 17. Update Frontend API URLs

After deploying the backend, update frontend API requests.

### Local

```javascript
fetch("http://localhost:5000/api/...")
```

### Production

```javascript
fetch("https://your-backend-domain.com/api/...")
```

Search the entire frontend project for:

```text
localhost:5000
```

and replace production API references with the deployed backend URL.

Check all API files, including:

```text
login
registration
movies
showtimes
seats
bookings
tickets
profile
```

---

# 18. GitHub Pages Frontend Deployment

The frontend can be deployed using GitHub Pages.

Make sure the frontend contains the correct production API URLs.

Push the project to GitHub:

```bash
git add .
```

Then:

```bash
git commit -m "Prepare CINERUSH for deployment"
```

Then:

```bash
git push origin main
```

Open the repository on GitHub.

Go to:

```text
Settings
→ Pages
```

Under:

```text
Build and deployment
```

select the appropriate branch and frontend directory.

For example:

```text
Branch: main
Folder: /frontend
```

Save the settings.

GitHub Pages will generate a public frontend URL.

---

# 19. GitHub Pages Important Note

GitHub Pages hosts **static frontend files**.

It does NOT run:

```text
Node.js
Express
MySQL
```

Therefore the architecture should be:

```text
                 ┌──────────────────────┐
                 │     GitHub Pages     │
                 │      Frontend        │
                 └──────────┬───────────┘
                            │
                            │ HTTPS API
                            ▼
                 ┌──────────────────────┐
                 │    Node.js Backend   │
                 │      Express API     │
                 └──────────┬───────────┘
                            │
                            │ MySQL
                            ▼
                 ┌──────────────────────┐
                 │     Aiven MySQL      │
                 │      Database        │
                 └──────────────────────┘
```

---

# 20. CORS Configuration

Because the frontend and backend may be hosted on different domains, the backend must allow requests from the frontend.

Example:

```javascript
const cors = require("cors");

app.use(cors());
```

For production, it is better to restrict the allowed frontend origin:

```javascript
app.use(cors({
    origin: "https://YOUR-GITHUB-USERNAME.github.io"
}));
```

Use the actual GitHub Pages URL of the project.

---

# 21. Production API Testing

After deployment, test the following:

### Authentication

* Register
* Login
* Logout

### Movies

* Movie list
* Movie details
* Now Playing
* Coming Soon

### Shows

* Date selection
* Showtime selection

### Seats

* Seat layout
* Seat selection
* Occupied seats
* Seat validation

### Booking

* Booking creation
* Payment simulation
* Booking confirmation

### Tickets

* Ticket generation
* Ticket history
* My Tickets

---

# 22. Common Deployment Problems

## Frontend Loads but Movies Don't Appear

Check whether the frontend is still calling:

```text
localhost:5000
```

It must call the deployed backend.

---

## Backend Works Locally but Not Online

Check:

* Environment variables
* Database credentials
* Aiven SSL configuration
* Backend port
* CORS
* Deployment logs

---

## Movies Exist in Aiven but CINERUSH Shows No Movies

Check the database selected by the backend.

Run:

```sql
SELECT DATABASE();
```

Then:

```sql
SELECT * FROM movies;
```

Make sure the backend is not connected to:

```text
defaultdb
```

when your movie data is stored somewhere else.

---

## CORS Error

If the browser displays a CORS error, configure the backend to allow the GitHub Pages frontend domain.

Example:

```javascript
app.use(cors({
    origin: "https://YOUR-GITHUB-USERNAME.github.io"
}));
```

---

## Booking API Error

If you see an error such as:

```javascript
fetch("http://localhost:5000/api/bookings/create")
```

the frontend is still using the local backend.

Change it to:

```javascript
fetch("https://YOUR-BACKEND-DOMAIN/api/bookings/create")
```

---

# 23. Security Rules

Never commit these files or values to GitHub:

```text
.env
MySQL passwords
Aiven passwords
JWT secrets
Private API keys
Private certificates
```

Use:

```text
.gitignore
```

Example:

```gitignore
node_modules/
.env
*.log
certificates/
*.pem
```

Use your hosting provider's environment-variable system for production secrets.

---

# 24. Quick Local Setup

For a developer who wants to run CINERUSH locally:

```bash
git clone https://github.com/BGARMY/CINERUSH.git
```

Then:

```bash
cd CINERUSH/backend
```

Install dependencies:

```bash
npm install
```

Configure:

```text
backend/.env
```

Create/import the:

```text
cinerush
```

database.

Start the backend:

```bash
npm start
```

Open:

```text
http://localhost:5000/cinerush/pages/splash.html
```

---

# 25. Quick Production Architecture

```text
Frontend
    │
    │ GitHub Pages
    ▼
CINERUSH Web Application
    │
    │ HTTPS REST API
    ▼
Node.js + Express Backend
    │
    │ Secure MySQL Connection
    ▼
Aiven MySQL
```

---

# 26. Developer Checklist

* [ ] Install Node.js
* [ ] Install npm
* [ ] Install MySQL Server
* [ ] Install MySQL Workbench
* [ ] Install Git
* [ ] Clone CINERUSH
* [ ] Open `CINERUSH-DEPLOY`
* [ ] Configure backend `.env`
* [ ] Create/import the database
* [ ] Run `npm install`
* [ ] Start the backend
* [ ] Test CINERUSH locally
* [ ] Verify database connection
* [ ] Verify movies are loading
* [ ] Verify booking APIs
* [ ] Configure Aiven MySQL for production
* [ ] Configure SSL if required
* [ ] Deploy the backend
* [ ] Update frontend API URLs
* [ ] Configure CORS
* [ ] Push frontend to GitHub
* [ ] Enable GitHub Pages
* [ ] Test the production website
* [ ] Verify login
* [ ] Verify movies
* [ ] Verify shows
* [ ] Verify seats
* [ ] Verify booking
* [ ] Verify tickets

---

# 27. Important Developer Note

CINERUSH-DEPLOY has two different environments:

### Local Development

```text
Frontend
   ↓
localhost:5000
   ↓
Local MySQL
```

### Production

```text
GitHub Pages
   ↓
Deployed Node.js Backend
   ↓
Aiven MySQL
```

Do not mix local and production configuration.

In particular:

```text
localhost:5000
```

should only be used for local development.

For the deployed application, all frontend API requests must point to the deployed backend URL.

---

# 🎬 CINERUSH

**Online Movie Ticket Booking System**

Built using:

**HTML • CSS • JavaScript • Node.js • Express.js • MySQL**

Deployment:

**GitHub Pages • Node.js Hosting • Aiven MySQL**
