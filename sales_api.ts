import express from "express";
import mysql from "mysql";
import dotenv from "dotenv";
import { body, query, param, validationResult } from "express-validator";
import winston from "winston";

dotenv.config();

const app = express();
app.use(express.json());

// Configure Winston logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'error.log', level: 'error' })
    ]
});

// Database connection using environment variables
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect(err => {
    if (err) {
        logger.error("Database connection failed", { error: err });
    } else {
        logger.info("Connected to database");
    }
});

// Middleware for input validation
const validateSaleInput = [
    body('customer').notEmpty().withMessage('Customer is required'),
    body('amount').isNumeric().withMessage('Amount must be a number'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// Input validation and SQL injection prevention
app.post("/sale", validateSaleInput, (req, res) => {
    const { customer, amount } = req.body;

    const sql = "INSERT INTO sales (customer, amount) VALUES (?, ?)";
    db.query(sql, [customer, amount], (err, result) => {
        if (err) {
            logger.error("Error inserting sale", { error: err });
            return res.status(500).send("Error inserting sale");
        }
        res.status(201).send("Sale added");
    });
});

// Error handling and pagination for fetching sales
app.get("/sales", [
    query('limit').optional().isInt({ min: 1 }).toInt(),
    query('offset').optional().isInt({ min: 0 }).toInt(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
], (req, res) => {
    const limit = req.query.limit || 10;
    const offset = req.query.offset || 0;

    const sql = "SELECT * FROM sales LIMIT ? OFFSET ?";
    db.query(sql, [limit, offset], (err, results) => {
        if (err) {
            logger.error("Error fetching sales", { error: err });
            return res.status(500).send("Error fetching sales");
        }
        res.json(results);
    });
});

// Error handling on delete operation
app.delete("/sale/:id", [
    param('id').isInt().withMessage('Invalid sale ID').toInt(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
], (req, res) => {
    const saleId = req.params.id;

    const sql = "DELETE FROM sales WHERE id = ?";
    db.query(sql, [saleId], (err, result) => {
        if (err) {
            logger.error("Error deleting sale", { error: err });
            return res.status(500).send("Error deleting sale");
        }
        res.send("Sale deleted");
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});