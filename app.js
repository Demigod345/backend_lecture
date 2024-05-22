const express = require('express');
const dbConn = require('./config/database.js');

const app =express();

var test = 0;

app.use(express.json());

app.get('/',(req,res)=>{
    res.send("Hello World");
})

app.get('/users',(req,res)=>{
    res.send("You are getting /users");
})

app.post('/xyz', (req,res)=>{
    console.log(req.body);
    res.send("You are posting /xyz")
})

app.get('/test', (req,res)=>{
    res.send("The test variable is: " + test);
})

app.post('/test', (req,res)=>{
    test++;
    res.send("You have incremented the test variable")
})

app.delete('/test', (req,res)=>{
    test--;
    res.send("You have decremented the test variable")
})

app.listen(5000,()=>{
console.log("Server listening in http://localhost:5000")
})