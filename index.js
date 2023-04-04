const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const ejs = require('ejs');
require('dotenv').config();


mongoose.connect(process.env.MONGODB_DATABASE_LINK, { useNewUrlParser: true });

const docSchema = new mongoose.Schema({
    name: String,
    email: String,
    phoneNumber: Number,
    password: String,
    address: String,
    age: Number,
    gender: String,
    experience: Number,
    specialization: String,
    area: String,
});

const Doctor = mongoose.model("doctor",docSchema);
const app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine","ejs");


// Main Page
app.get("/",function(req,res){
    res.render("userMainPage",{doctorData:[]});
})

//citizen login
app.get("/citizen",function(req,res){
    res.render("userLogin");
})

//doctor login
app.get("/doctor",function(req,res){
    res.render("docLogin");
})

// doctor search
app.post("/doctorSearch",function(req,res){
    const receivedArea = req.body.area;
    const receivedSpecialization = req.body.specialization;
    Doctor.find({area: receivedArea, specialization:receivedSpecialization}).then(function(doctors){
        // console.log(doctors);
        res.render("userMainPage",{doctorData:doctors});
        // res.redirect("/");
    });
})


app.listen(3000,function(){
    console.log("Server running on port 3000");
})
