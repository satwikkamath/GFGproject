
//Module requirements

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const ejs = require('ejs');
require('dotenv').config();

//Connecting with MongoDB Database

mongoose.connect(process.env.MONGODB_DATABASE_LINK, { useNewUrlParser: true });


// Doctor data template creation

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

//User Data Template Creation

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    phoneNumber: Number,
    age: Number,
    gender: String,
})

const appointmentSchema = new mongoose.Schema({
    doctorName: String,
    userName: String,
    status:String,
    // prescription: String
})

const Doctor = mongoose.model("doctor", docSchema);
const User = mongoose.model("user", userSchema);
const Appointment = mongoose.model("appointment", appointmentSchema);
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set("view engine", "ejs");


let citizenName

// Main Page (home route)
app.get("/", function (req, res) {

    res.render("mainPage")
})

//citizen login through first page
app.get("/citizenLogin", function (req, res) {
    res.render("userLogin", { text: false, passwordFail: false, notFound:false });
})

// citizen Sign Up through first page
app.get("/citizenSignup", function (req, res) {
    res.render("userSignup", { error: false });
})

//doctor login through first page
app.get("/doctor", function (req, res) {
    res.render("docLogin", { passwordFail: false });
})


//User Sign Up

app.post("/userSignUp", function (req, res) {
    const receivedName = req.body.name;
    const receivedAge = req.body.age;
    const receivedEmail = req.body.email;
    const receivedGender = req.body.gender;
    const receivedPhno = req.body.phno;
    const receivedPswd = req.body.password;
    const cpswd = req.body.cpassword;
    if (receivedPswd != cpswd) {
        res.render("userSignup", { error: true });  // if password and confirm password wont match

    }
    else {
        User.findOne({ email: receivedEmail }).then(function (data) {
            if (data) {
                res.render("userLogin", { text: "Account already exists with this Email", passwordFail: false, notFound:false });     // if an account already exists while signing up

            }
            else {
                const user = new User({
                    name: receivedName,
                    email: receivedEmail,                // if no account exists, new account is created 
                    password: receivedPswd,
                    phoneNumber: receivedPhno,
                    age: receivedAge,
                    gender: receivedGender,
                })
                user.save();
                res.render("userLogin", { text: "Your account was succesfully created", passwordFail: false, notFound:false });

            }

        })
    }
})


//User Login

app.post("/userLogin", function (req, res) {
    const email = req.body.email;
    const pswd = req.body.password;
    User.findOne({ email: email }).then(function (user) {
        if(user)
        {
        citizenName = user.name;
        if (pswd === user.password) {
            res.render("userMainPage", { doctorName: false, doctorData: false, userName: user.name });  // if password matched
        }
        else {
            res.render("userLogin", { passwordFail: true, text: false, notFound:false });  // if password not matched
        }
    }
    else{
        res.render("userLogin", { passwordFail: false, text: false, notFound:true });  // if password not matched
        
    }
    })
})

//Doctor Login

app.post("/docLogin", function (req, res) {
    const email = req.body.email;
    const pswd = req.body.password;
    Doctor.findOne({ email: email }).then(function (user) {
        doctorName = user.name;
        if (pswd === user.password) {
              // if password matched
            Appointment.find({ doctorName: doctorName }).then(function (data) {
                
                res.render("doctorMainPage", { userName: doctorName, patients:data });

            });
        }
        else {
            res.render("docLogin", { passwordFail: true });  // if password not matched
        }
    })

})

// doctor search
app.post("/doctorSearch", function (req, res) {
    const receivedArea = req.body.area;
    const receivedSpecialization = req.body.specialization;
    Doctor.find({ area: receivedArea, specialization: receivedSpecialization }).then(function (doctors) {
        // console.log(doctors);
        res.render("userMainPage", {doctorName: false, doctorData: doctors, userName: citizenName });
        // res.redirect("/");
    });
})


// Scheduling Appointment

app.post("/scheduleAppointment",function (req, res) {

    const receivedDocName = req.body.doctorName;

    const appointments = new Appointment({
        doctorName: receivedDocName,
        userName: citizenName,
        status:"Pending"
    });

    appointments.save();
    setTimeout(() => {
        
        Appointment.find({userName:citizenName }).then(function (data) {
            res.render("userAppointments", { doctors: data, userName: citizenName });
        });
    }, 1000);
    
});

// User Appointments


app.get("/myAppointments", function(req,res){
    Appointment.find({userName:citizenName }).then(function (data) {
        res.render("userAppointments", { doctors: data, userName: citizenName });
    });
})


// Approving appointment by doctor

app.post("/approveAppointment",function(req,res){
    const doctorName = req.body.doctorName;
    const userName = req.body.userName;

    Appointment.replaceOne({doctorName:doctorName, userName:userName},{doctorName:doctorName, userName:userName,status:"Approved"}).then(function(data){
        console.log(data);
    });

    setTimeout(() => {
        
        Appointment.find({ doctorName: doctorName }).then(function (data) {
            // console.log(data);
            res.render("doctorMainPage", { doctorName: doctorName, patients:data });
        });    
    }, 1000);  // 1 sec delay because data, which was recently saved was not readable 
})

app.listen(3000, function () {
    console.log("Server running on port 3000");
})
