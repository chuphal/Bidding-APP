
# Bidding App API Setup Guide

This guide provides step-by-step instructions on how to set up and run the Bidding App API. This API allows users to create, manage, and participate in auctions, placing bids on various items


## Pre-requisites
Before you begin, ensure you have the following installed on your machine:
* Node.js (v18 or higher)
* Docker
* PostgreSQL (local instance or access to a remote server provided by vercel etc.)

## Getting Started

### 1. Clone the Repository
Clone the repository from GitHub to your local machine using the following command:

```shell
https://github.com/chuphal/Bidding-App.git
```

Navigate into the project directory:
```shell
cd Bidding-App
```
### 2. Install Dependencies
Install the required dependencies using npm:

```shell
npm install
```
### 3. Configure Environment Variables
Create a .env file in the root directory of the project and configure the necessary environment variables. Use the provided .env.example file as a template:

```text
# Server port
PORT=5000

# JWT secret key for authentication
JWT_SECRET=your_jwt_secret_key

# Provide the pg service url..
POSTGRES_URL= your_POSTGRES_UR

or

# if using local pg Server
DB_USER= your_user
DB_PASSWORD= your_password
DB_HOST= your_host
DB_PORT=5432
DB_DATABASE= your_database

NODE_ENV =development
EXPIRES_IN=30d
SERVICE_EMAIL= your_email
CLIENT_ID= your_Client_id
CLIENT_SECRET= your_client_secret
REDIRECT_URI=https://developers.google.com/oauthplayground
REFRESH_TOKEN= your_refresh_token
ACCESS_TOKEN=your_access_token

```
#### a- Generating CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN,  ACCESS_TOKEN:
[https://www.youtube.com/watch?v=i4HZg2TufcM&ab_channel=BackCoding]

### 4. After setting up the pg server:
Run the queries:
```text
./backend/db/queries.sql
```

#### 5. Start the Server
Start the server using the following command:
```shell
npm run server
#or 
npm start
```

#### or 
#### Using Docker: -
Before this, provide the environment variables to the docker-compose.yaml file.

##### a. build image
```shell
docker compose up --build
```

##### b. verify the images and copy the imageID of bidding-app
```shell
docker image ls
```

##### c. start the container
```shell
docker run -p {PORT}:{Port} <imageId of bidding-app>
```

#### 6. Verify the Setup
Open your browser and navigate to http://localhost:3000/api-docs to access the API documentation (if Swagger is set up). You can also use Postman or another API client to test the endpoints.

## API Documentation
The API documentation provides detailed information about the available endpoints, request/response formats, and authentication mechanisms. Access it at http://localhost:3000/api-docs.

## Development
### Code Structure

* "backend/" - Contains the source code
    * "controllers/" - Route handlers
    * "db/" - sql queries and db config
    * "errors/" - error handlers
    * "logger/" - winston logger config
    * "routes/" - API routes
    * "middlewares/" - Middleware functions
    * "nodemailer/" - mailer config and oauth2 config
    * "upload/" - images store
    * "socket/" - sockets
    * "utils/" - Utility functions
    
### Scripts

* "npm start" - Start the server
* "npm run server" - start the server with nodemon
* "npm test" - run mocha tests

### Testing
Run the test suite using:
```shell
npm test

```
### Deployed link
You can test the API's without setup.
* Go to the link:  [https://bidding-app-h0xs.onrender.com]
* Click on documentation

You can also use the postman to test the endpoints.

## Contact
Email: - [cchuphal4@gmail.com]


# Thank you !!