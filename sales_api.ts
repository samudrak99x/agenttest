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

// 🚨 Missing input validation & SQL injection vulnerability
app.post("/sale", (req, res) => {
    const { customer, amount } = req.body;
    const sql = `INSERT INTO sales (customer, amount) VALUES ('${customer}', '${amount}')`;

    db.query(sql, (err, result) => {
        if (err) {
            res.status(500).send("Error inserting sale");
        } else {
            res.status(201).send("Sale added");
        }
    });
});

// 🚨 No error handling, No pagination, Potential performance issue
app.get("/sales", (req, res) => {
    db.query("SELECT * FROM sales", (err, results) => {
        if (err) {
            res.status(500).send("Error fetching sales");
        } else {
            res.json(results);
        }
    });
});

// 🚨 No error handling on delete operation
app.delete("/sale/:id", (req, res) => {
    const saleId = req.params.id;
    const sql = `DELETE FROM sales WHERE id = ${saleId}`;

    db.query(sql, (err, result) => {
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
