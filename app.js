const express = require('express');
const mysql = require('mysql');
const secrets = require('./secrets');

const app = express();

const con = mysql.createConnection({
    host: secrets.sql_host,
    user: secrets.sql_user,
    password: secrets.sql_password,
    database: 'notes_app'
});

function create_tables(con) {
    var user_table_sql =
    `CREATE TABLE IF NOT EXISTS user 
    ( user_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, 
        username VARCHAR(255), 
        password VARCHAR(255));`;
    con.query(user_table_sql, function (err, result) {
        if (err) throw err;
        console.log("User Table created");
    });

    var notes_table_sql =
    `CREATE TABLE IF NOT EXISTS notes 
    ( notes_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, 
        user_id INT, 
        note TEXT);`;
    con.query(notes_table_sql, function (err, result) {
        if (err) throw err;
        console.log("Notes Table created");
    });
}

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected to MySQL!");
      con.query(`CREATE DATABASE IF NOT EXISTS notes_app`, function (err, result) {
        if (err) throw err;
        console.log("Database created");
      });
     create_tables(con);
});

app.set("view engine", "ejs");
app.use(express.urlencoded({
    extended: true
}));

app.post("/app/user", (req, res) => {
    const { username, password } = req.body;
    var sql = `INSERT INTO user 
                    (
                        username, password
                    ) 
                    VALUES 
                    (
                        ?, ?
                    )`;
    con.query(sql, [username, password], function (err, result) {
        if (err) {
            console.log(err.sqlMessage);
            res.status(404).send("Authentication Error")
        }
        else {
            res.status(200).send("Account Created")
        }
    });
});

app.post("/app/user/auth", (req, res) => {
    const { username, password } = req.body;
    var sql = `SELECT user_id from user where username=${username} and password=${password}`;
    con.query(sql, function (err, user) {
        if (err) {
            console.log(err.sqlMessage);
            res.status(404).send("User Not Found")
        }
        else {
            let o = {
                "message" : "success",
                "userId" : user.user_id
            }
            res.status(200).json("Account Created")
        }
    });
});

app.get('/app/sites/list/:userId', function(req, res) {
    con.query(`SELECT note from notes where user_id=${req.params.userId}`, function(err, notes) {
        if(err) {
            onsole.log(err.sqlMessage);
            res.status(404).send("Notes Not Found")
        } else {
            res.status(200).json(notes)
        }
    });
});

app.post('/app/sites/:userId', function(req, res) {
    const { note } = req.body;
    var sql = `INSERT INTO notes 
                    (
                        user_id, note
                    ) 
                    VALUES 
                    (
                        ?, ?
                    )`;
    con.query(sql, [req.params.userId, note], function (err, result) {
        if (err) {
            console.log(err.sqlMessage);
            res.status(404).send("Authentication Error")
        }
        else {
            res.status(200).send("SUCCESS")
        }
    });
});

app.listen(process.env.PORT || 3000);