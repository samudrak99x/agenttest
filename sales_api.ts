import express from "express";
import mysql from "mysql";
import { body, validationResult, query, param } from "express-validator";
import dotenv from "dotenv";
import winston from "winston";

dotenv.config();

const app = express();
app.use(express.json());

// Configure logging
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'app.log' })
    ]
});

// Database connection
const databaseConnection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

databaseConnection.connect(error => {
    if (error) {
        logger.error("Database connection failed", { error });
    } else {
        logger.info("Connected to database");
    }
});

// Validation rules for adding a sale
const saleValidationRules = [
    body('customer').isString().withMessage('Customer name must be a string').notEmpty().withMessage('Customer name cannot be empty'),
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number')
];

// Endpoint to add a new sale
app.post("/sale", saleValidationRules, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { customer, amount } = req.body;
    const insertSaleQuery = "INSERT INTO sales (customer, amount) VALUES (?, ?)";

    databaseConnection.query(insertSaleQuery, [customer, amount], (error) => {
        if (error) {
            logger.error("Error inserting sale", { error });
            return res.status(500).send("Error inserting sale");
        }
        res.status(201).send("Sale added");
    });
});

// Endpoint to fetch sales with pagination
app.get("/sales", [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('pageSize').optional().isInt({ min: 1 }).withMessage('Page size must be a positive integer')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const offset = (page - 1) * pageSize;

    const fetchSalesQuery = "SELECT * FROM sales LIMIT ? OFFSET ?";
    databaseConnection.query(fetchSalesQuery, [pageSize, offset], (error, results) => {
        if (error) {
            logger.error("Error fetching sales", { error });
            return res.status(500).send("Error fetching sales");
        }
        res.json(results);
    });
});

// Endpoint to delete a sale
app.delete("/sale/:id", [
    param('id').isInt({ gt: 0 }).withMessage('Sale ID must be a positive integer')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const saleId = parseInt(req.params.id);
    const deleteSaleQuery = "DELETE FROM sales WHERE id = ?";

    databaseConnection.query(deleteSaleQuery, [saleId], (error) => {
        if (error) {
            logger.error("Error deleting sale", { error });
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