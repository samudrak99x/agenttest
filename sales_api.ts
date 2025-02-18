import express from "express";
import mysql from "mysql";

const app = express();
app.use(express.json());

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "salesdb"
});

db.connect(err => {
    if (err) {
        console.error("DB not connected", err);
    }
});

// Add a new sale with parameterized query to prevent SQL Injection
app.post("/sale", (req, res) => {
    const { customer, amount } = req.body;
    const sql = "INSERT INTO sales (customer, amount) VALUES (?, ?)";

    db.query(sql, [customer, amount], (err, result) => {
        if (err) {
            console.error("Error inserting sale", err);
            return res.status(500).send("Error inserting sale");
        }
        res.send("Sale added");
    });
});

// Get all sales with error handling
app.get("/sales", (req, res) => {
    db.query("SELECT * FROM sales", (err, results) => {
        if (err) {
            console.error("Error fetching sales", err);
            return res.status(500).send("Error fetching sales");
        }
        res.json(results);
    });
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});