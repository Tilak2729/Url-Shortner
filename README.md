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

## Running the Application Locally

### Backend Setup

1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Make sure MongoDB is running locally
4. Start the backend server: `npm start` or `node server.js`
5. The backend will be available at http://localhost:5000

### Frontend Setup

1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the frontend server: `npm start`
4. The frontend will be available at http://localhost:3000 or the port specified by your local server

### Testing the Application

1. Open your browser and navigate to the frontend URL
2. Enter a long URL in the input field
3. Select an expiry period
4. Click the "Shorten" button
5. You should see the shortened URL and QR code

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