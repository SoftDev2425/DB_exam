import fs from "fs";
import sql from "mssql";
import { mssqlConfig } from "../utils/mssqlConnection";

const sp_setup = async () => {
  var sp = fs.readFileSync("./sql/populateReviews.sql").toString();

  const con = await sql.connect(mssqlConfig);

  console.log("Adding stored procedures...");

  await Promise.all([con.query(sp)]);

  console.log("Stored procedures added successfully!");

  await con.close();
};

sp_setup();
