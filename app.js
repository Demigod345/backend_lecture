const express = require('express');
const dbConn = require('./config/database.js');

const app =express();

app.use(express.json());

app.get('/',(req,res)=>{
    res.send("Hello World");
})

app.listen(5000,()=>{
console.log("Server listening in http://localhost:5000")
})