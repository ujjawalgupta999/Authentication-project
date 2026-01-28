## 🖥️ Backend (Node.js + Express)

The backend is built using **Node.js** and **Express.js**, providing secure authentication APIs with **JWT**, **email verification**, and **password reset** using **Mailtrap** for email testing.

---

## 📦 Backend Dependencies

The backend uses the following dependencies:

- **express** – Web framework
- **mongoose** – MongoDB ODM
- **bcrypt** – Password hashing
- **jsonwebtoken** – JWT authentication
- **cookie-parser** – Cookie handling
- **cors** – Cross-Origin Resource Sharing
- **dotenv** – Environment variables
- **nodemailer** – Sending emails
- **mailgen** – Email templates
- **express-validator** – Request validation
- **nodemon** (dev) – Auto-restart server

---



## ⚙️ Backend Environment Variables

Create a `.env` file inside the **Auth-backend** directory and add the following variables:

```env
PORT=8000
MONGODB_URL=your_mongodb_connection_string

CORS_ORIGIN=*
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=expiry_time

REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=expiry_time

MAILTRAP_HOST=sandbox.smtp.mailtrap.io
MAILTRAP_USERNAME=your_mailtrap_username
MAILTRAP_PASSWORD=your_mailtrap_password
SENDER_EMAIL=your_email_address
```
