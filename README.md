# Advanced JavaScript E-Commerce Project

A modern e-commerce web application built with vanilla JavaScript, featuring clean architecture and modern browser features.

## Features

- **Modern UI**: Clean and responsive design
- **Product Management**: Browse, view, and purchase products
- **User Authentication**: Login, signup, and profile management
- **Cart Functionality**: Add, remove, and checkout items
- **Admin Dashboard**: Manage products and view orders
- **Routing**: Client-side routing with history API

## Technologies Used

- Vanilla JavaScript (ES6+)
- CSS3 with modern features
- HTML5
- Express.js (for the API server)

## Project Structure

```
├── js/
│   ├── api/           # API service modules
│   ├── components/    # UI components
│   ├── pages/         # Page renderers
│   └── utils/         # Utility functions
├── index.html         # Main HTML file
├── styles.css         # Global styles
├── backend-server.js  # API server
├── dev-server.js      # Development server for SPA routing
└── netlify.toml       # Netlify deployment configuration
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/tienquocbui/advanced-javascript-class.git
   cd advanced-javascript-class
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. The application will be available at http://localhost:8080

## API Server

To run the backend API server:

```bash
npm start
```

The API server will be available at http://localhost:3001

## Author
Tien Quoc (Kelvin) Bui