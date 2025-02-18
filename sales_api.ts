import express from "express";
import mysql from "mysql";
import { body, validationResult, query, param } from "express-validator";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// Database connection
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

// Validation rules
const saleValidationRules = [
    body('customer').isString().withMessage('Customer name must be a string').isLength({ min: 1 }).withMessage('Customer name cannot be empty'),
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number')
];

// Add a new sale
app.post("/sale", saleValidationRules, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

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

// Fetch sales with pagination
app.get("/sales", [
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
    query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be a non-negative integer')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

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

// Delete a sale
app.delete("/sale/:id", [
    param('id').isInt({ gt: 0 }).withMessage('Sale ID must be a positive integer')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

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
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=salesdb