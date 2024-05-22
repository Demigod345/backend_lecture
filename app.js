const express = require('express');
const dbConn = require('./config/database.js');
const mysql = require("mysql2");

const app =express();

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
    res.send("Hello World");
})

// Create
// create a new user
app.post("/users/add", async  (request, response)=>{
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
app.put("/users/update/:id", async (request, response) => {
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
app.delete("/users/delete/:id", async (request, response) => {
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