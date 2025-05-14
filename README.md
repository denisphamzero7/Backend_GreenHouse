# Node.js backend_geenhouse

## About
Viết backend cho dự án quản lí nhà kính

## Table of Contents
- [Source Structure](#source-structure)
- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)

## Source Structure
```
project-root/
├── api/                    # Source code
│   ├── controllers/        # Request handlers and business logic
│   │   ├── bedController.js
│   │   ├── categoryController.js
│   │   ├── greenhouseCageController.js
│   │   ├── greenhouseController.js
│   │   ├── productController.js
│   │   ├── uploadImage.js
│   │   ├── usersController.js
│   │   └── vegetableController.js
│   ├── models/             # Data models and schemas
│   ├── routers/            # API route definitions
│   ├── middleware/         # Custom middleware functions
│   ├── config/             # Configuration files (e.g., database, environment)
│   ├── services/           # Business logic services
│   ├── utils/              # Utility functions
│   ├── validators/         # Input validation functions
│   └── index.js            # Main application entry point
├── contracts/              # Contract/interface definitions (if applicable)
├── migrations/             # Database migration scripts (if using ORM)
├── test/                  # Test suite files
├── .env                   # Environment variables configuration file
├── .gitignore             # Git ignore rules (e.g., node_modules, .env)
├── package-lock.json      # Dependency version lock file
├── package.json           # Project metadata and dependencies
├── products_with_index.json  # JSON data file (could be sample or cached data)
├── scrape.js              # Data scraping script
└── truffle-config.js      # Truffle configuration 


## Requirements
- Node.js: Version 16.x or higher
- npm: Version 8.x or higher
- MongoDB: Version 4.x or higher (if using MongoDB)
- Git: For version control
- Operating System: Windows, macOS, or Linux
- Optional: Docker for containerized deployment
```
## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/denisphamzero7/Backend_GreenHouse.git
   cd your-repo
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Edit `.env` with your configuration (e.g., database URI, port).
4. Start the application:
   ```bash
   npm start
   ```
   The app runs on `http://localhost:8080`

## Usage
- Access the API at `http://localhost:8080/api` 
