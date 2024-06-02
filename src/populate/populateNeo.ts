import mongoose from "mongoose";
import BookMetadata from "../models/bookmetdata.model";
import { mssqlConfig } from "../utils/mssqlConnection";
import { cypher } from "../utils/neo4jConnection";
import sql from "mssql";

export const populateNeo = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/bookstore");
    // Clear all data - Delete all nodes and relationships
    await cypher(`match (a) -[r] -> () delete a, r`);
    await cypher(`match (a) delete a`);

    const con = await sql.connect(mssqlConfig);

    const result = await con.query(`
        SELECT u.UserID, u.FirstName, u.LastName, u.DateOfBirth, u.Email, u.DateOfBirth, u.Gender, b.ISBN, b.Title, r.ReviewID, r.Rating, r.Comment, r.CreatedAt
        FROM Reviews r
        JOIN Users u ON r.UserID = u.UserID
        JOIN Books b ON r.ISBN = b.ISBN
    `);

    console.log(result.recordset.length);

    await con.close();

    for (const record of result.recordset) {
      const { UserID, FirstName, LastName, Email, Gender, DateOfBirth, ISBN, Title, ReviewID, Rating, Comment } =
        record;

      // get genre from bookmetadata mongo
      const data: any = await BookMetadata.findOne({ isbn: ISBN });
      const genre: string = data?.genres[0] || "";

      // Create User node
      await cypher(
        `
        MERGE (u:User {UserID: $UserID})
        ON CREATE SET u.FirstName = $FirstName, u.LastName = $LastName, u.Email = $Email, u.DateOfBirth = $DateOfBirth, u.Gender = $Gender
      `,
        {
          UserID: UserID,
          FirstName: FirstName || "",
          LastName: LastName || "",
          Email: Email || "",
          DateOfBirth: new Date(DateOfBirth[0]).toLocaleDateString(),
          Gender: Gender,
        }
      );

      // Create Book node
      await cypher(
        `
           MERGE (b:Book {ISBN: $ISBN})
           ON CREATE SET b.Title = $Title, b.Genre = $Genre
         `,
        {
          ISBN,
          Title,
          Genre: genre,
        }
      );

      // Create Reviewed relationship
      await cypher(
        `
            MATCH (u:User {UserID: $UserID})
            MATCH (b:Book {ISBN: $ISBN})
            MERGE (u)-[r:REVIEWED {ReviewID: $ReviewID}]->(b)
            ON CREATE SET r.Rating = $Rating, r.Comment = $Comment
            `,
        {
          UserID,
          ISBN,
          ReviewID,
          Rating,
          Comment,
        }
      );
    }

    console.log("Data populated successfully!");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

populateNeo();
