import express from "express";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { body, validationResult } from "express-validator";
import winston from "winston";
import morgan from "morgan";

dotenv.config();

const app = express();
app.use(express.json());

// Set up Winston logger for logging application events
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

// Use Morgan for HTTP request logging, integrated with Winston
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Create a MySQL connection pool
const dbPool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Endpoint to add a new sale
app.post("/sale", 
    [
        body('customer').isString().withMessage('Customer must be a string'),
        body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { customer, amount } = req.body;
        const sql = "INSERT INTO sales (customer, amount) VALUES (?, ?)";

        try {
            const [result] = await dbPool.execute(sql, [customer, amount]);
            res.status(201).send("Sale added successfully");
        } catch (err) {
            logger.error("Error inserting sale:", err);
            res.status(500).send("Error inserting sale");
        }
    }
);

// Endpoint to retrieve all sales
app.get("/sales", async (req, res) => {
    const sql = "SELECT * FROM sales";

    try {
        const [results] = await dbPool.execute(sql);
        res.json(results);
    } catch (err) {
        logger.error("Error fetching sales:", err);
        res.status(500).send("Error fetching sales");
    }
});

// Start the server on the specified port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});