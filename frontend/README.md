# PC Parts Hub Frontend

This is the frontend application for the PC Parts Hub e-commerce site, built with React, TypeScript, and Tailwind CSS.

## Features

- Browse PC components by categories
- Product listing with filtering options
- Product detail pages
- User authentication (register, login)
- Shopping cart functionality
- Wishlist management
- Checkout process with Razorpay integration
- Admin dashboard for product and order management

## Tech Stack

- React
- TypeScript
- React Router for navigation
- Tailwind CSS for styling
- Axios for API requests
- JWT for authentication

## Getting Started

### Prerequisites

- Node.js (v14 or above)
- npm or yarn

### Installation

1. Clone the repository:
```
git clone <repository-url>
```

2. Navigate to the frontend directory:
```
cd frontend
```

3. Install dependencies:
```
npm install
```

4. Start the development server:
```
npm start
```

The application will be available at http://localhost:3000.

### Backend Setup

This frontend application requires the backend API to be running. Make sure to start the backend server before using the frontend.

To run the backend:

1. Navigate to the backend directory:
```
cd ../
```

2. Install dependencies:
```
npm install
```

3. Start the backend server:
```
node index.js
```

The backend API will be available at http://localhost:3000.

## Project Structure

```
src/
├── api/             # API service functions
├── components/      # Reusable UI components
├── context/         # React context for state management
├── pages/           # Main application pages
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
├── App.tsx          # Main application component
└── index.tsx        # Application entry point
```

## Available Scripts

- `npm start`: Runs the app in development mode
- `npm test`: Launches the test runner
- `npm run build`: Builds the app for production
- `npm run eject`: Ejects the create-react-app configuration

## Environment Variables

Create a `.env` file in the frontend directory to configure environment variables:

```
REACT_APP_API_URL=http://localhost:3000
```

## Deployment

To build the application for production:

```
npm run build
```

This creates a `build` directory with a production build of the app.

## Acknowledgements

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Headless UI](https://headlessui.dev/)
- [Heroicons](https://heroicons.com/)
- [React Router](https://reactrouter.com/)
- [Axios](https://axios-http.com/)
- [JWT Decode](https://github.com/auth0/jwt-decode)
