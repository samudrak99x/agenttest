import express from "express";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { body, validationResult } from "express-validator";

dotenv.config();

const app = express();
app.use(express.json());

const dbPool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

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
            console.error("Error inserting sale:", err);
            res.status(500).send("Error inserting sale");
        }
    }
);

app.get("/sales", async (req, res) => {
    const sql = "SELECT * FROM sales";

    try {
        const [results] = await dbPool.execute(sql);
        res.json(results);
    } catch (err) {
        console.error("Error fetching sales:", err);
        res.status(500).send("Error fetching sales");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});