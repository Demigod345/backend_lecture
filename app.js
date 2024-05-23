const express = require('express');
const dbConn = require('./config/database.js');
const mysql = require("mysql2");
const bcrypt = require('bcrypt');
var bodyParser = require('body-parser');
var path = require('path');

const app =express();

// Setup EJS view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static('./public'));

// use body parser to parse request body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const runDBCommand = (query) => {
    return new Promise((resolve, reject) => {
        dbConn.query(query, (err, result) => {
            if(err) return reject(err);
            return resolve(result);
        })
    })
}

async function hashPassword(password) {
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    return hash;
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

// Login
app.post("/login", async (request, response) => {
    try {
        const { username, password } = request.body;
        // Check if username and password are valid
        // If valid, generate and return a JWT token
        // If not valid, send 401 Unauthorized response
        var query = `select * from credentials where username = ${mysql.escape(username)}`;

        const user = await runDBCommand(`select * from credentials where username = ${mysql.escape(username)}`); 
        if(user.length == 0) {
            response.status(409).send("Username doesn't exist");
            return;
        }

        bcrypt.compare(password, user[0].hash).then((result) => {
            if(!result) {
                response.status(401).send("Invalid username or password");
                return;
            }
            response.status(200).send("Logged in successfully");
        }).catch((err) => {
            console.log(err);
            response.status(401).send("Invalid username or password");
        });
        
    } catch (err) {
        console.log(err);
        response.status(500).send("Error logging in");
    }
});

// Signup
app.post("/signup", async (request, response) => {
    try {
        const { username, password, confirmPassword } = request.body;

        if(password !== confirmPassword) {
            response.status(400).send("Passwords do not match");
            return;
        }
        if (password.length < 8) {
            response.status(400).send("Password should be atleast 8 characters long");
            return;
        }
        // Check if username is available
        var query = `select * from credentials where username = ${mysql.escape(username)}`;
        console.log(username + " : " + query);
        const user = await runDBCommand(query); 
        if(user.length > 0) {
            response.status(409).send("Username already exists");
            return;
        }else{
            console.log(user);
        }
        // Create user
        var hash = await hashPassword(password);
        console.log(hash);

        query = `insert into credentials (username, hash) values (${mysql.escape(username)}, ${mysql.escape(hash)})`;
        const result = await runDBCommand(query);
        response.status(201).send(`User Signed up successfully with id ${result.insertId}`)
        // if (isUsernameAvailable(username)) {
        //     createUser(username, password);
        //     response.status(201).send("User created successfully");
        // } else {
        //     response.status(409).send("Username already exists");
        // }
    } catch (err) {
        console.log(err);
        response.status(500).redirect("/");
    }
});





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