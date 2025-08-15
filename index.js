// 1. Load the dotenv package to read variables from .env file
require("dotenv").config();

const express = require("express");
const path = require("path");
const methodOverride = require("method-override");
const mysql = require("mysql2");
const app = express();

// 2. Use the PORT from the .env file, with a fallback to 8080
const port = process.env.PORT || 8080;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));

// 3. Use the environment variables for the database connection
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

//Home Route
app.get("/", (req, res) => {
  let q = "SELECT COUNT(*) FROM user";
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let count = result[0]["COUNT(*)"];
      res.render("home.ejs", { count });
    });
  } catch (err) {
    console.log(err);
    res.send("Some error in DB.");
  }
});

//Show Route
app.get("/user", (req, res) => {
  let q = "SELECT * FROM user";
  try {
    connection.query(q, (err, users) => {
      if (err) throw err;
      res.render("showusers.ejs", { users });
    });
  } catch (err) {
    console.log(err);
    res.send("Some error in DB.");
  }
});

//Add User Route
app.get("/user/new", (req, res) => {
  res.render("new.ejs");
});

app.post("/user", (req, res) => {
  let { username, email, password } = req.body;
  let id = faker.string.uuid();
  let q =
    "INSERT INTO user (id, username, email, password) VALUES (?, ?, ?, ?)";
  let data = [id, username, email, password];
  try {
    connection.query(q, data, (err, result) => {
      if (err) throw err;
      res.redirect("/user");
    });
  } catch (err) {
    console.log(err);
    res.send("Some error in DB.");
  }
});

//View Route
app.get("/user/:id/view", (req, res) => {
  let { id } = req.params;
  let q = "SELECT * FROM user WHERE id=?";
  try {
    connection.query(q, [id], (err, result) => {
      if (err) throw err;
      let user = result[0];
      res.render("view.ejs", { user });
    });
  } catch (err) {
    console.log(err);
    res.send("Some error in DB.");
  }
});

//Edit Route
app.get("/user/:id/edit", (req, res) => {
  let { id } = req.params;
  let q = "SELECT * FROM user WHERE id=?";
  try {
    connection.query(q, [id], (err, result) => {
      if (err) throw err;
      let user = result[0];
      res.render("edit.ejs", { user });
    });
  } catch (err) {
    console.log(err);
    res.send("Some error in DB.");
  }
});

//Update Route
app.patch("/user/:id/update", (req, res) => {
  let { id } = req.params;
  let q = "SELECT * FROM user WHERE id=?";
  let { username: newUsername, email: newEmail, password: formPass } = req.body;
  try {
    connection.query(q, [id], (err, result) => {
      if (err) throw err;
      let user = result[0];
      if (formPass !== user.password) {
        res.send("Password not matched!");
      } else {
        let q2 = "UPDATE user SET username = ?, email = ? WHERE id = ?";
        connection.query(q2, [newUsername, newEmail, id], (err, result) => {
          if (err) throw err;
          res.redirect("/user");
        });
      }
    });
  } catch (err) {
    console.log(err);
    res.send("Some error in DB.");
  }
});

//Delete Route
app.get("/user/:id/delete", (req, res) => {
  let { id } = req.params;
  let q = "SELECT * FROM user WHERE id=?";
  try {
    connection.query(q, [id], (err, result) => {
      if (err) throw err;
      let user = result[0];
      res.render("delete.ejs", { user });
    });
  } catch (err) {
    console.log(err);
    res.send("Some error in DB.");
  }
});

app.delete("/user/:id/delete", (req, res) => {
  let { id } = req.params;
  let q = "SELECT * FROM user WHERE id=?";
  let { password: formPass } = req.body;

  try {
    connection.query(q, [id], (err, result) => {
      if (err) throw err;
      let user = result[0];
      if (formPass !== user.password) {
        res.send("Password not matched!");
      } else {
        let q2 = "DELETE FROM user WHERE id=?";
        connection.query(q2, [id], (err, result) => {
          if (err) throw err;
          res.redirect("/user");
        });
      }
    });
  } catch (err) {
    console.log(err);
    res.send("Some error in DB.");
  }
});

app.listen(port, () => {
  console.log(`Listening to port ${port}`);
});
