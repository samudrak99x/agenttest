import express from "express";
import mysql from "mysql";
import dotenv from "dotenv";

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

app.post("/sale", async (req, res) => {
    const { customer, amount } = req.body;
    const sql = "INSERT INTO sales (customer, amount) VALUES (?, ?)";

    try {
        db.query(sql, [customer, amount], (err, result) => {
            if (err) {
                console.error("Error inserting sale:", err);
                return res.status(500).send("Error inserting sale");
            }
            res.status(201).send("Sale added successfully");
        });
    } catch (error) {
        console.error("Unexpected error:", error);
        res.status(500).send("Unexpected error occurred");
    }
});

app.get("/sales", async (req, res) => {
    const sql = "SELECT * FROM sales";

    try {
        db.query(sql, (err, results) => {
            if (err) {
                console.error("Error fetching sales:", err);
                return res.status(500).send("Error fetching sales");
            }
            res.json(results);
        });
    } catch (error) {
        console.error("Unexpected error:", error);
        res.status(500).send("Unexpected error occurred");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});