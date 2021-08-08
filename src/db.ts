import { Pool } from "pg";
import { DB_NAME } from "./db/constants";

const pool = new Pool({
    user: "postgres",
    password: process.env.DATABASE_PASS,
    host: "localhost",
    port: 5432,
    database: DB_NAME,
});

export default pool;