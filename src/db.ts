/* 
    On server and db init, first run one pool and create 
    the needed data base and table, if don't exist.
    Then close the connection and expose the pool configures 
    with existing db and table.
*/
import { Pool } from "pg";
import { DB_NAME, NEWS_TABLE } from "./db/constants";

const config = {
  user: "postgres",
  password: process.env.DATABASE_PASS,
  host: process.env.DATABASE_HOST || "localhost",
  port: 5432,
};

const qCreateDb = `CREATE DATABASE ${DB_NAME};`;

const qCreateTb = `CREATE TABLE ${NEWS_TABLE}(
    id SERIAL PRIMARY KEY,
    category VARCHAR(20),
    lang VARCHAR(7),
    headline VARCHAR(150),
    provider VARCHAR(40),
    url VARCHAR(255),
    timestamp TIMESTAMP
);`;

const initializeDb = (): Promise<Pool> =>
  new Promise(async (resolve, reject) => {
    // Connect to new pool
    let pool = new Pool(config);

    pool.connect();

    // Create DB if doesn't exist; then end pool and re-connect again on the right db to create table
    await pool.query(qCreateDb, (dbErr) => {
      if (!dbErr || dbErr.message.indexOf("already exists") != -1) {
        console.log(
          `Data base ${DB_NAME} ${!dbErr ? "created" : "already exists"}.`
        );
        
        pool.end();

        // Connect to the right database and create table if doesn't exist
        pool = new Pool({ ...config, database: DB_NAME});

        pool.query(
          qCreateTb,
          (tbErr) => {
            if (!tbErr || tbErr.message.indexOf("already exists") != -1) {
              console.log(
                `Table base ${NEWS_TABLE} ${
                  !tbErr ? "created" : "already exists"
                }.`
              );

              // Resolve by returning the pool; no need to end
              resolve(pool);
            } else {
              reject(tbErr);
              pool.end();
            }
          }
        );
      } else {
        reject(dbErr);
        pool.end();
      }
    });
  });

export { initializeDb };
