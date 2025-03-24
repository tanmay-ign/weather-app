# Weather App

A beautiful full-stack weather application built with React, Node.js, Express, MongoDB, and Vite.

## Features

- Real-time weather information
- Air Quality Index
- Humidity levels
- Rain probability for the next 3 hours
- Sunset time
- Beautiful 3D animations and blur effects
- Dark/light mode toggle
- Recent search history
- Responsive design for all devices

## Tech Stack

- **Frontend**: React.js, Vite, Framer Motion, Three.js, React Three Fiber
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **API**: OpenWeatherMap API

## Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- OpenWeatherMap API key

### Setup

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd weather-app
   ```

2. Install dependencies for both client and server
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. Set up environment variables
   
   Create a `.env` file in the server directory with the following variables:
   ```
   PORT=5000
   MONGO_URI=mongodb+srv://tanmayupadhyay2005:tanmay@joker.emna4.mongodb.net/?retryWrites=true&w=majority&appName=Joker
   WEATHER_API_KEY=58ecc0b7a51d7c11b50dfa23239484e7
   ```

### Running the Application

1. Start the server
   ```bash
   cd server
   npm run dev
   ```

2. Start the client in a new terminal
   ```bash
   cd client
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

## API Endpoints

- `GET /api/weather/:city` - Get weather data for a specific city
- `GET /api/weather` - Get recent searches

## Screenshots

*[Add screenshots of your application here once it's running]*

## Future Improvements

- Add user authentication
- Save favorite locations
- Weekly forecast
- Weather alerts
- More detailed historical data
- Additional 3D animations for various weather conditions

## License

This project is licensed under the MIT License 