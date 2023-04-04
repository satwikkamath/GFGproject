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

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    phoneNumber: Number,
    age:Number,
    gender:String,
})

const Doctor = mongoose.model("doctor",docSchema);
const User = mongoose.model("user",userSchema);
const app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine","ejs");


// Main Page
app.get("/",function(req,res){
    // res.render("userMainPage",{doctorData:[]});
    res.render("userSignup",{error:false})
})

//citizen login
app.get("/citizen",function(req,res){
    res.render("userLogin");
})

//doctor login
app.get("/doctor",function(req,res){
    res.render("docLogin");
})

//User Sign Up

app.post("/userSignUp",function(req,res){
    const receivedName = req.body.name;
    const receivedAge = req.body.age;
    const receivedEmail = req.body.email;
    const receivedGender = req.body.gender;
    const receivedPhno = req.body.phno;
    const receivedPswd = req.body.password;
    const cpswd = req.body.cpassword;
    if(receivedPswd != cpswd)
    {
        res.render("userSignup",{error:true});
        
    }
    else
    {
        const user = new User({
            name: receivedName,
            email: receivedEmail,
            password: receivedPswd,
            phoneNumber: receivedPhno,
            age:receivedAge,
            gender:receivedGender,
        })
        user.save();
        res.render("userLogin",{text: "Your account was succesfully created",passwordFail:false});
    }
})


//User Login

app.post("/userLogin",function(req,res){
    const email = req.body.email;
    const pswd = req.body.password;
    User.findOne({email:email}).then(function(user){
        if(pswd===user.password){
            res.render("userMainPage",{doctorData:false,userName:user.name});
        }
        else{
            res.render("userLogin",{passwordFail:true,text:false});
        }

    })
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
