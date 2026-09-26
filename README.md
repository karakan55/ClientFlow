# ClientFlow

ClientFlow is a web-based appointment booking and management system designed for beauty salons, service businesses and small businesses.

## Features

- Online appointment booking
- Customer information management
- Service selection
- Staff selection
- Date and time selection
- Automatic available time slots
- Service duration management
- Appointment conflict prevention
- Appointment list
- Appointment cancellation
- Cancelled time slots becoming available again
- Appointment data stored in JSON
- Admin dashboard
- Admin login
- Appointment management
- WhatsApp integration
- Responsive web interface

## Technologies

- HTML5
- CSS3
- JavaScript
- Node.js
- HTTP Server
- JSON
- Git
- GitHub

## Project Structure

ClientFlow/
├── admin.html
├── index.html
├── server.js
├── appointments.json
├── .env
├── .gitignore
└── README.md

## How It Works

Customers can select a service, staff member, date and available time slot through the appointment page.

The system checks existing appointments and prevents conflicting bookings.

Appointment information is stored in JSON format and can be managed through the admin panel.

## Admin Panel

The admin panel provides appointment management features including:

- Viewing appointments
- Cancelling appointments
- Managing booking information
- Reviewing customer and appointment details

## WhatsApp Integration

ClientFlow includes WhatsApp integration to make it easier for businesses to communicate with customers regarding appointments.

## API Endpoints

GET /api/appointments

POST /api/appointments

DELETE /api/appointments/:id

GET /api/availability

## Installation

Clone the repository:

git clone https://github.com/karakan55/ClientFlow.git

Open the project folder:

cd ClientFlow

Install the required dependencies:

npm install

Start the server:

node server.js

Open the application:

http://localhost:3000

Open the admin panel:

http://localhost:3000/admin

## Environment Variables

Sensitive configuration values should be stored in the .env file.

The .env file is excluded from the Git repository through .gitignore.

## Security Note

This project is a portfolio/demo application. Authentication, authorization and additional security measures should be strengthened before deploying it to a public production environment.

## Author

Furkan Bedir

GitHub: https://github.com/karakan55

## Project

ClientFlow demonstrates a complete appointment booking workflow using a Node.js backend and a responsive web interface.