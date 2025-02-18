import express from "express";
import mysql from "mysql";
import dotenv from "dotenv";
import { body, validationResult } from "express-validator";

dotenv.config();

const app = express();
app.use(express.json());

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect(err => {
    if (err) {
        console.error("Database connection failed:", err);
        process.exit(1);
    }
    console.log("Connected to the database");
});

app.post("/sale", 
    [
        body('customer').isString().withMessage('Customer must be a string'),
        body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number')
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { customer, amount } = req.body;
        const sql = "INSERT INTO sales (customer, amount) VALUES (?, ?)";

        db.query(sql, [customer, amount], (err, result) => {
            if (err) {
                console.error("Error inserting sale:", err);
                return res.status(500).send("Error inserting sale");
            }
            res.status(201).send("Sale added successfully");
        });
    }
);

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});