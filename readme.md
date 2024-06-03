# DB_Exam

## Description

This repository contains the code for the DB_Exam project, which sets up a polyglot persistence environment using MSSQL, MongoDB, Neo4j, and Redis. **The** project includes scripts to add tables, procedures and populate these databases, and a server to interact with them via predefined endpoints.

## Installation

1. Clone the repository:

```sh
git clone https://github.com/SoftDev2425/DB_exam.git
cd DB_exam
```

## Usage

1. In the root directory run

```sh
   docker-compose up -d
```

This starts instances for MSSQL, MongoDB, Neo4j, and Redis. Edit the _docker-compose.yaml_ file to change database configurations if necessary.

2. Create a `.env`-file in the root directory and add the following:

```ts
REDIS_URL = "redis://:example@localhost:6379";
```

Ensure the URL matches your configurations.

3. Navigate to `./src/utils` and create a copy of `mssqlConnection.template.ts` in the same folder.

   - Rename it to `mssqlConnection.ts` and add your own configurations. Check the dockerfile for the config details if you haven't configured it already.

4. Run the following to create necessary tables, procedures, and populate the databases:

```sh
npm run seed
```

Be patient, this might take a few seconds.

5. Add Data to Neo4j:

```sh
npm run neo
```

6. Start the server by running

```sh
npm run dev
```

The server should now be running on `http://localhost:3000`

7. API Documentation
   - Check all endpoints via postman: [Link to postman collection](https://red-comet-2078.postman.co/workspace/New-Team-Workspace~c846f6ad-58fa-4d8e-95f5-4668ec5fa5ff/collection/23276106-3d43f5c1-4dd3-41d9-a392-c36f70cd96f2?action=share&creator=23276106) (Requires login, but is very useful!)
![Postman collections](https://github.com/SoftDev2425/DB_exam/blob/master/images/others/PostmanCollection.png)


### Early access client

To use the endpoints via the client:

1. Run `npm run dev` to start the server
2. Open another terminal and navigate to the client directory by running `cd client`
3. Install the dependencies by running `npm i`
4. Now run `npm run dev` to start the client
5. Open ` http://localhost:5173/` in your browser.
