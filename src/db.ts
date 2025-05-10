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

/**
 * @returns database name
 */
const initializeDb = async (dbName: string): Promise<string> => {
    const pool = new Pool(config);
    await pool.connect();

    return new Promise((resolve, reject) => {
        pool.query(qCreateDb(dbName), (dbErr) => {
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
}

/**
 * @returns database name
 */
export const initializeTb = (
    dbName: string,
    tbType: TableType,
    tbName: string
): Promise<string> =>{
    return new Promise((resolve, reject) => {
        const pool = new Pool({ ...config, database: dbName });
        pool.connect();

        pool.query(qCreateTb(tbName).news, (tbErr) => {
            if (!tbErr || tbErr.message.indexOf("already exists") != -1) {
                createLogMsg(
                    `Table structure of type '${tbType}' ${!tbErr ? "created" : "already exists"
                    }.`,
                    "info"
                );

                pool.end();
                resolve(dbName);
            } else {
                pool.end();
                reject(tbErr);
            }
        });
    });
};

export const getPool = async (dbName: string): Promise<Pool | undefined> => {
    try {
        const pool = new Pool({ ...config, database: dbName });
        await pool.connect();

        return pool;
    } catch (err) {
        createLogMsg((err as Error).message ?? 'Could not get pool', "error")
    }
};

export { initializeDb };
