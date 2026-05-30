# Shambhoo Dayal and Sons

A production-oriented MERN application for a kirana/grocery store where customers upload a grocery slip, admins generate invoices, and customers track, pay, and chat around each order.

## Stack

- React, Vite, React Router, Redux Toolkit, Tailwind CSS, Axios, Socket.io client
- Node.js, Express, MongoDB, Mongoose, JWT, bcrypt, Socket.io
- Cloudinary for slip and invoice uploads
- Razorpay for online payments
- Nodemailer for email notifications

## Quick Start

```bash
npm install
cp server/.env.example server/.env
cp client/.env.example client/.env
npm run dev
```

Frontend runs on `http://localhost:5173` and API on `http://localhost:5000` by default.

## Deployment

- Client: deploy `client` to Vercel or Netlify. Set `VITE_API_URL` and `VITE_SOCKET_URL`.
- Server: deploy `server` to Render or Railway. Set all variables in `server/.env.example`.
- Database: use MongoDB Atlas and set `MONGO_URI`.

## Admin User

Create a normal user through registration, then update `role` to `admin` in MongoDB:

```js
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } })
```
