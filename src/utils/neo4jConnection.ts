import neo4j from "neo4j-driver";
require("dotenv").config();

const credentials = {
  host: "neo4j://localhost:7687",
  user: "neo4j",
  password: "12345678",
};

const _driver = neo4j.driver(credentials.host, neo4j.auth.basic(credentials.user, credentials.password));

export const cypher = async (query: string, params: any = {}) => {
  let session = null;
  let result = null;
  try {
    session = _driver.session();
    result = await session.run(query, params);
    if (!result.records.length) {
      return [];
    }
  } catch (error) {
    console.error(error);
  } finally {
    if (session) {
      await session.close();
    }
    return result!.records || [];
  }
};
