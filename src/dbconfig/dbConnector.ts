// import { Client } from 'ts-postgres';
// import createLogMsg from '../utils/createLogMsg';
 
// const connectToDb = async () => {
//     const client = new Client();
//     await client.connect();
//     createLogMsg(`Connected to db`, "info");
 
//     try {
//         // Querying the client returns a query result promise
//         // which is also an asynchronous result iterator.
//         const resultIterator = client.query(
//             `SELECT 'Hello ' || $1 || '!' AS message`,
//             ['world']
//         );
 
//         for await (const row of resultIterator) {
//             // 'Hello world!'
//             console.log(row.get('message'));
//         }
//     } finally {
//         await client.end();
//     }
// }

// export default connectToDb;