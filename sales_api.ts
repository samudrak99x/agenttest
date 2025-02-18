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
        console.log("DB not connected");
    }
});

// Add a new sale (Vulnerable to SQL Injection)
app.post("/sale", (req, res) => {
    const { customer, amount } = req.body;
    const sql = `INSERT INTO sales (customer, amount) VALUES ('${customer}', '${amount}')`;

    db.query(sql, (err, result) => {
        if (err) {
            res.send("Error inserting sale");
        }
        res.send("Sale added");
    });
});

// Get all sales (No error handling)
app.get("/sales", (req, res) => {
    db.query("SELECT * FROM sales", (err, results) => {
        if (err) {
            res.send("Error fetching sales");
        }
        res.send(results);
    });
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
