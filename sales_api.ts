import express from "express";
import mysql from "mysql";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// Database connection using environment variables
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect(err => {
    if (err) {
        console.error("Database connection failed", err);
    } else {
        console.log("Connected to database");
    }
});

// Input validation and SQL injection prevention
app.post("/sale", (req, res) => {
    const { customer, amount } = req.body;
    if (!customer || !amount) {
        return res.status(400).send("Invalid input");
    }

    const sql = "INSERT INTO sales (customer, amount) VALUES (?, ?)";
    db.query(sql, [customer, amount], (err, result) => {
        if (err) {
            return res.status(500).send("Error inserting sale");
        }
        res.status(201).send("Sale added");
    });
});

// Error handling and pagination for fetching sales
app.get("/sales", (req, res) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;

    const sql = "SELECT * FROM sales LIMIT ? OFFSET ?";
    db.query(sql, [limit, offset], (err, results) => {
        if (err) {
            return res.status(500).send("Error fetching sales");
        }
        res.json(results);
    });
});

// Error handling on delete operation
app.delete("/sale/:id", (req, res) => {
    const saleId = parseInt(req.params.id);
    if (isNaN(saleId)) {
        return res.status(400).send("Invalid sale ID");
    }

    const sql = "DELETE FROM sales WHERE id = ?";
    db.query(sql, [saleId], (err, result) => {
        if (err) {
            return res.status(500).send("Error deleting sale");
        }
        res.send("Sale deleted");
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});