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
app.post("/sale", saleValidationRules, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { customer, amount } = req.body;
        const sql = "INSERT INTO sales (customer, amount) VALUES (?, ?)";

        db.query(sql, [customer, amount], (err, result) => {
            if (err) {
                console.error("Error inserting sale", err);
                return res.status(500).send("Error inserting sale");
            }
            res.status(201).send("Sale added");
        });
    } catch (error) {
        console.error("Unexpected error", error);
        res.status(500).send("Unexpected error occurred");
    }
});

// Fetch sales with pagination
app.get("/sales", [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('pageSize').optional().isInt({ min: 1 }).withMessage('Page size must be a positive integer')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 10;
        const offset = (page - 1) * pageSize;

        db.query("SELECT * FROM sales LIMIT ? OFFSET ?", [pageSize, offset], (err, results) => {
            if (err) {
                console.error("Error fetching sales", err);
                return res.status(500).send("Error fetching sales");
            }
            res.json(results);
        });
    } catch (error) {
        console.error("Unexpected error", error);
        res.status(500).send("Unexpected error occurred");
    }
});

// Delete a sale
app.delete("/sale/:id", [
    param('id').isInt({ gt: 0 }).withMessage('Sale ID must be a positive integer')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const saleId = parseInt(req.params.id);
        const sql = "DELETE FROM sales WHERE id = ?";

        db.query(sql, [saleId], (err, result) => {
            if (err) {
                console.error("Error deleting sale", err);
                return res.status(500).send("Error deleting sale");
            }
            res.send("Sale deleted");
        });
    } catch (error) {
        console.error("Unexpected error", error);
        res.status(500).send("Unexpected error occurred");
    }
});

// Start server
app.listen(3000, () => {
    console.log("Server running on port 3000");
});