/* 
    On server and db init, first run one pool and create 
    the needed data base and table, if don't exist.
    Then close the connection and expose the pool configures 
    with existing db and table.
*/
import { Pool } from "pg";
import { qCreateDb, qCreateTb } from "./db/queries";
import createLogMsg from "./utils/createLogMsg";

const config = {
  user: process.env.DATABASE_USER || "postgres",
  password: process.env.DATABASE_PASS,
  host: process.env.DATABASE_HOST || "localhost",
  port: Number(process.env.DATABASE_PORT || 5432),
  database: process.env.DEFAULT_DATABASE_NAME || "postgres",
  ssl:
    process.env.NODE_ENV === "production"
      ? {
          rejectUnauthorized: false,
        //   ca: process.env.CA_CERT,
        }
      : undefined,
};

type TableType = keyof ReturnType<typeof qCreateTb>;

// Returns database name
const initializeDb = (dbName: string): Promise<string> =>
  new Promise(async (resolve, reject) => {
    // Connect to new pool
    let pool = new Pool(config);

    pool.connect();

    // Create DB if doesn't exist; then end pool and re-connect again on the right db to create table
    await pool.query(qCreateDb(dbName), (dbErr) => {
      if (!dbErr || dbErr.message.indexOf("already exists") != -1) {
        createLogMsg(
          `Data base '${dbName}' ${!dbErr ? "created" : "already exists"}.`,
          "info"
        );

        pool.end();
        resolve(dbName);
      } else {
        pool.end();
        reject(dbErr);
      }
    });
  });

// Returns database name
export const initializeTb = (
  dbName: string,
  tbType: TableType,
  tbName: string
): Promise<string> =>
  new Promise(async (resolve, reject) => {
    // Connect to the right database and create table if doesn't exist
    let pool = new Pool({ ...config, database: dbName });
    pool.connect();

    await pool.query(qCreateTb(tbName).news, (tbErr) => {
      if (!tbErr || tbErr.message.indexOf("already exists") != -1) {
        createLogMsg(
          `Table structure of type '${tbType}' ${
            !tbErr ? "created" : "already exists"
          }.`,
          "info"
        );

        // End pool and resolve by returning the database name
        pool.end();
        resolve(dbName);
      } else {
        pool.end();
        reject(tbErr);
      }
    });
  });

export const getPool = (dbName: string): Pool => {
  let pool = new Pool({ ...config, database: dbName });
  pool.connect().catch((err) => createLogMsg(err, "error"));

  return pool;
};

export { initializeDb };
