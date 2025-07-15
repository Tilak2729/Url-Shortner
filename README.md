# URL Shortener Application

A modern URL shortener application with QR code generation and automatic URL expiry features. Built with Node.js, Express, MongoDB for the backend and HTML/CSS/JavaScript for the frontend.

## Features

- **URL Shortening**: Convert long URLs into short, shareable links
- **QR Code Generation**: Generate QR codes for shortened URLs
- **URL Expiry**: URLs automatically expire after a set period (default: 7 days)
- **Click Tracking**: Track the number of clicks on each shortened URL
- **Responsive Design**: Works on desktop and mobile devices
- **Animations**: Smooth animations using Anime.js

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- nanoid (for generating unique URL codes)
- QRCode (for generating QR codes)

### Frontend
- HTML5
- CSS3
- JavaScript (Vanilla)
- Anime.js (for animations)
- Font Awesome (for icons)

## Project Structure

```
url-shortener/
├── backend/
│   ├── server.js         # Main server file
│   ├── models/Url.js     # MongoDB URL model
│   └── routes/
│       ├── shorten.js    # API routes for shortening URLs
│       └── redirect.js   # Route for handling redirects
├── frontend/
│   ├── index.html        # Main HTML file
│   ├── styles.css        # CSS styles
│   └── script.js         # Frontend JavaScript
├── .env                  # Environment variables
├── package.json          # Project dependencies
└── README.md             # Project documentation
```

## Setup and Installation

### Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with the following variables:
   ```
   MONGO_URI=your_mongodb_connection_string
   BASE_URL=http://localhost:5001
   PORT=5001
   FRONTEND_URL=http://localhost:3000
   ```
4. Start the development server: `npm run dev`
5. Access the application at http://localhost:5001

## Deployment Instructions

### Frontend Deployment (Vercel)

1. Create a Vercel account at https://vercel.com if you don't have one
2. Install Vercel CLI: `npm i -g vercel`
3. Navigate to the frontend directory: `cd frontend`
4. Deploy to Vercel: `vercel`
5. Follow the prompts to link your project to your Vercel account
6. After deployment, note the URL provided by Vercel (e.g., `https://url-shortener-frontend-vercel.vercel.app`)

### Backend Deployment (Render)

1. Create a Render account at https://render.com if you don't have one
2. Create a new Web Service on Render
3. Connect your GitHub repository
4. Configure the service:
   - Name: `url-shortener-backend`
   - Root Directory: `backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `node server.js`
5. Add the following environment variables in Render:
   - `MONGO_URI`: Your MongoDB connection string
   - `PORT`: 10000 (Render will override this with its own PORT)
   - `BASE_URL`: Your Render app URL (e.g., `https://url-shortener-backend.onrender.com`)
   - `FRONTEND_URL`: Your Vercel frontend URL (e.g., `https://url-shortener-frontend-vercel.vercel.app`)
6. Deploy the service

### Update Frontend Configuration

After deploying the backend to Render, update the frontend's API_URL:

1. In the frontend's `script.js`, replace `https://your-render-app-name.onrender.com/api` with your actual Render backend URL
2. Redeploy the frontend: `vercel --prod`

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/url-shortener.git
   cd url-shortener
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   MONGO_URI=mongodb://localhost:27017/url-shortener
   BASE_URL=http://localhost:5000
   PORT=5000
   FRONTEND_URL=http://localhost:3000
   ```

   **Note for cross-device access:** To make shortened URLs accessible from other devices on your local network, replace `localhost` in the `BASE_URL` with your computer's local IP address:
   ```
   BASE_URL=http://YOUR_LOCAL_IP:5000
   ```
   You can find your local IP address by running `ipconfig` (Windows) or `ifconfig` (Mac/Linux).

4. Start the server:
   ```
   npm start
   ```

5. For development with auto-restart:
   ```
   backend:
   npm run dev
   ```

6. Access the application:
   - Backend API: http://localhost:5000
   - Frontend: Open `frontend/index.html` in your browser - npx serve -s -l 3000

## API Endpoints

- `POST /api/shorten`: Create a shortened URL
  - Request body: `{ "longUrl": "https://example.com", "expiryDays": 7 }`
  - Response: URL object with short URL and QR code

- `GET /api/urls`: Get all URLs
  - Response: Array of URL objects

- `GET /:code`: Redirect to the original URL

## License

MIT