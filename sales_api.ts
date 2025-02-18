import express from "express";
import mysql from "mysql";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// Create a MySQL database connection using environment variables
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Connect to the database and handle connection errors
db.connect(err => {
    if (err) {
        console.error("Database connection failed:", err);
        process.exit(1); // Exit process with failure
    }
    console.log("Connected to the database");
});

// Add a new sale with parameterized query to prevent SQL Injection
app.post("/sale", (req, res) => {
    const { customer, amount } = req.body;
    const sql = "INSERT INTO sales (customer, amount) VALUES (?, ?)";

    db.query(sql, [customer, amount], (err, result) => {
        if (err) {
            console.error("Error inserting sale:", err);
            return res.status(500).send("Error inserting sale");
        }
        res.status(201).send("Sale added successfully");
    });
});

// Get all sales with error handling
app.get("/sales", (req, res) => {
    const sql = "SELECT * FROM sales";

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching sales:", err);
            return res.status(500).send("Error fetching sales");
        }
        res.json(results);
    });
});

// Start the server and listen on port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=salesdb
PORT=3000