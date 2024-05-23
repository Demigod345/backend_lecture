const express = require('express');
const dbConn = require('./config/database.js');
const mysql = require("mysql2");
var path = require('path');

const app =express();

// Setup EJS view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static('./public'));

app.use(express.json());

const runDBCommand = (query) => {
    return new Promise((resolve, reject) => {
        dbConn.query(query, (err, result) => {
            if(err) return reject(err);
            return resolve(result);
        })
    })
}

app.get('/',(req,res)=>{
    res.render('home');
})

// middleware to log all requests
app.use((req, res, next) => {
    console.log(req.method + " request_ for " + req.originalUrl);
    next();
});

// middleware to log all requests to /users
app.use("/users", (req,res,next)=>{
    console.log(req.method + " request for " + req.originalUrl);
    next();
})

// middleware to authenticate user
const authenticateUser = (req, res, next) => {
    // Check if user is authenticated
    // If authenticated, call next()
    // If not authenticated, send 401 Unauthorized response
    if (req.headers.authorization === "Bearer <token>") {
        next();
    } else {
        res.status(401).send("Unauthorized");
    }
};

// middleware to validate request body
const validateRequestBody = (req, res, next) => {
    // Check if request body is valid
    // If valid, call next()
    // If not valid, send 400 Bad Request response
    if (req.body && req.body.name && req.body.address && req.body.country) {
        next();
    } else {
        res.status(400).send("Bad Request. Request body is invalid!");
    }
};

// Render all users
app.get('/users',async (req,res)=>{
    console.log("Fetching all users")
    query = "select * from users";
    const result = await runDBCommand(query);
    res.render('users', {users: result});
})

// Create
// create a new user
app.post("/users/add", validateRequestBody, authenticateUser, async  (request, response)=>{
    try{
        const data = request.body;
        console.log(data)

        const query =   `insert into users (name, address, country) values 
                        ("${mysql.escape(data.name)}", "${mysql.escape(data.address)}", 
                        "${mysql.escape(data.country)}")`
        
        const addToDatabase = await runDBCommand(query);
        console.log(addToDatabase)

        response.status(201).send(`User added to database with id ${addToDatabase.insertId} `)
    }catch(err){
        console.log(err)
        response.status(500).send("Error adding user")
    }
})

// Read
// Check if a particular user exists
// If yes then return the user
app.get("/users/:id", async (request, response) => {
    try{
        const query = `select * from users where id = ${mysql.escape(request.params.id)}`;
        const data = await runDBCommand(query);
        if (data.length !== 0) {
            response.status(200).json({"user": data[0]})
        } else {
            response.status(404).send("notfound")
        }
    } catch(err) {
        console.log(err)
        response.status(500).send("User not found")
    } 
})

// Update
// Update a user
app.put("/users/update/:id", validateRequestBody, authenticateUser, async (request, response) => {
    try{
        const data  =   request.body;
        const query =   `update users set name = "${mysql.escape(data.name)}", address = "${mysql.escape(data.address)}", 
                        country = "${mysql.escape(data.country)}" where id = ${mysql.escape(request.params.id)}`;
        const updateDatabase = await runDBCommand(query);
        response.status(200).send(`User with id ${request.params.id} updated successfully`)
    }catch(err){
        console.log(err)
        response.status(500).send("Error updating user")
    }
})

// Delete
// Delete a user
app.delete("/users/delete/:id", authenticateUser, async (request, response) => {
    try{
        const query = `delete from users where id = ${mysql.escape(request.params.id)}`;
        const deleteFromDatabase = await runDBCommand(query);
        response.status(200).send(`User with id ${request.params.id} deleted successfully`)
    }catch(err){
        console.log(err)
        response.status(500).send("Error deleting user")
    }
})

app.listen(5000,()=>{
console.log("Server listening in http://localhost:5000")
})