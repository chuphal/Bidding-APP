
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
path -- backend/db/queries.sql
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
#### a. socket test: -
* Create two users and get their id's.
* Create an item by one user.
* Go to the: -
```text
path -- backend/socket/socket.js 
```
* Uncomment the testing one and comment the above one.
* Now, go to postman and create two client.
* setup the message section.: Provide id present in the db.
![Screenshot (114)](https://github.com/chuphal/Bidding-App/assets/91324501/e9719f67-d9b3-4920-8ce2-5c50d1cb5a55)

* setup the events : listening to "notification" event
![Screenshot (115)](https://github.com/chuphal/Bidding-App/assets/91324501/e7fe2122-3b30-49c6-bb36-c68662b4509e)

* Pass the cookie, jwt in the headers: - copy while login or register from cookie.
![Screenshot (116)](https://github.com/chuphal/Bidding-App/assets/91324501/3dd18564-be3d-4f25-9e39-cecf0995edd7)

* Now, connect both the client to the server.
* Send "userId" as the listener to the server.
* Now, go to events and turn on the "notification" listener.
* Now, place the bid on the item (use the client who is not the owner of the item).
* You can see real-time notification.

#### b. Mocha test: -
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
