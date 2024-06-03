# DB_Exam

## Description

This repository contains the code for the DB_Exam project.

## Installation

1. Clone the repository: `git clone https://github.com/SoftDev2425/DB_exam.git`

## Usage

1. In the root directory run `docker-compose up -d` to start all necessary databases.
   - This includes instances for the following databases: MSSQL, MongoDB, Neo4j and Redis.
   - Edit the `docker-compose.yaml` file if you'd like to change database configurations
2. Create a `.env`-file in the root.

   - Add the following to the `.env`

     ```ts
     REDIS_URL = "redis://:example@localhost:6379";
     ```

     Make sure the URL matches your configs.

3. Navigate to `./src/utils` and create a copy of `mssqlConnection.template.ts`

   - Rename it to `mssqlConnection.ts` and add your own configurations. Check the dockerfile for the config details if you haven't configured it already.

4. Run `npm run seed`. This will create the necessary tables, procedures and populate the database (Might take couple of seconds - be patient 😁)
5. Now run `npm run neo`. This will add data to the neo4j database.
6. Start the server by running `npm run dev`
   - Server should now be running on `http://localhost:3000`
   - Check all endpoints via postman here: [Link to postman collection](https://red-comet-2078.postman.co/workspace/New-Team-Workspace~c846f6ad-58fa-4d8e-95f5-4668ec5fa5ff/collection/23276106-3d43f5c1-4dd3-41d9-a392-c36f70cd96f2?action=share&creator=23276106)

### Early access client

To use the endpoints via the client:

1. Run `npm run dev` to start the server
2. Open another terminal and run `cd client`
3. Run `npm i`
4. Now run `npm run dev` to start the client
5. Open ` http://localhost:5173/` in your browser.
