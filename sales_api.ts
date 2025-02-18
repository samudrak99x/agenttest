import express from "express";
import mysql from "mysql";

const app = express();
app.use(express.json());

// Database connection (🚨 Hardcoded credentials)
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "salesdb"
});

db.connect(err => {
    if (err) {
        console.error("Database connection failed", err);
    } else {
        console.log("Connected to database");
    }
});

// 🚨 Refactored to use parameterized queries to prevent SQL injection
app.post("/sale", (req, res) => {
    const { customer, amount } = req.body;
    const sql = "INSERT INTO sales (customer, amount) VALUES (?, ?)";

    db.query(sql, [customer, amount], (err, result) => {
        if (err) {
            res.status(500).send("Error inserting sale");
        } else {
            res.status(201).send("Sale added");
        }
    });
});

// 🚨 Added error handling and pagination
app.get("/sales", (req, res) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;

    db.query("SELECT * FROM sales LIMIT ? OFFSET ?", [limit, offset], (err, results) => {
        if (err) {
            res.status(500).send("Error fetching sales");
        } else {
            res.json(results);
        }
    });
});

// 🚨 Refactored to use parameterized queries and added error handling
app.delete("/sale/:id", (req, res) => {
    const saleId = parseInt(req.params.id);
    const sql = "DELETE FROM sales WHERE id = ?";

    db.query(sql, [saleId], (err, result) => {
        if (err) {
            res.status(500).send("Error deleting sale");
        } else {
            res.send("Sale deleted");
        }
    });
});

// Start server
app.listen(3000, () => {
    console.log("Server running on port 3000");
});