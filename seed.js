// Run this file to add 100 fake users to your database.
// To use, type 'node seed.js' in your terminal.

// Load environment variables from the .env file
require("dotenv").config();

// Import required packages
const { faker } = require("@faker-js/faker");
const mysql = require("mysql2");

// Create a connection to the database using credentials from the .env file
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
});

// Test the connection to be sure it's working
connection.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err.stack);
    return;
  }
  console.log("Successfully connected to the database.");
});

/**
 * Generates a single random user record.
 * @returns {Array} An array containing [id, username, email, password]
 */
let getRandomUser = () => {
  return [
    faker.string.uuid(),
    faker.internet.username(),
    faker.internet.email(),
    faker.internet.password(),
  ];
};

// SQL query for bulk insertion.
let q = "INSERT INTO user (id, username, email, password) VALUES ?";

// Generate an array of 100 fake user records.
let data = [];
for (let i = 1; i <= 100; i++) {
  data.push(getRandomUser());
}

// Execute the bulk insert query.
try {
  connection.query(q, [data], (err, result) => {
    if (err) throw err;
    console.log(result);
  });
} catch (err) {
  console.log(err);
}

connection.end();
