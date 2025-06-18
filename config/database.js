require('dotenv').config();
const { Client } = require("pg");
console.log("DB URL from env from database js:", process.env.DATABASE_URL);
 
const client = new Client({
	/*
	 *   host: "etvwin-userdb.cwswgtycunqq.ap-south-1.rds.amazonaws.com",
	 *     port: 4615,
	 *       user: "postgres",
	 *         password: "be562d3796379b9801db508947d67388",
	 *           database: "ott_services_db",
	 *           */
	connectionString: process.env.DATABASE_URL,
	 /* ssl: {
		      rejectUnauthorized: false, // Optional: Useful if you're using SSL without a verified certificate
		    },*/
});
client
  .connect()
  .then(() => console.log("Connected to local PostgreSQL"))
  .catch((err) => console.error("Connection error", err.stack));


module.exports = client

