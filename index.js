//Module requirements

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const ejs = require('ejs');
require('dotenv').config();

//Connecting with MongoDB Database

mongoose.connect("mongodb+srv://satwikroopa:Roopa70263@fruitdb.8sxipgz.mongodb.net/?retryWrites=true&w=majority", { useNewUrlParser: true });

// Schedule template creation

const scheduleSchema = new mongoose.Schema({
    doctorName: String,
    date: String,
    slot1: String,
    slot2: String,
    slot3: String,
})

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
    schedule: [scheduleSchema],
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

//Appointment Template Creation

const appointmentSchema = new mongoose.Schema({
    doctorName: String,
    userName: String,
    status: String,
    date: String,
    slot: String,
    type: String,
    address: String
})

const Doctor = mongoose.model("doctor", docSchema);
const User = mongoose.model("user", userSchema);
const Appointment = mongoose.model("appointment", appointmentSchema);
const Schedule = mongoose.model("schedule", scheduleSchema);
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set("view engine", "ejs");

let citizenName

// Main Page (home route)

app.get("/", function (req, res) {
    res.render("main")
})

//citizen login through first page

app.get("/citizenLogin", function (req, res) {
    res.render("userLogin", { text: false, passwordFail: false, notFound: false });
})

// citizen Sign Up through first page

app.get("/citizenSignup", function (req, res) {
    res.render("userSignup", { error: false });
})

//doctor login through first page

app.get("/doctor", function (req, res) {
    res.render("docLogin", { text: false });
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
                res.render("userLogin", { text: "Account already exists with this Email", passwordFail: false, notFound: false });     // if an account already exists while signing up
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
                res.render("userLogin", { text: "Your account was succesfully created", passwordFail: false, notFound: false });
            }
        })
    }
})

//User Login

app.post("/userLogin", function (req, res) {
    const email = req.body.email;
    const pswd = req.body.password;
    User.findOne({ email: email }).then(function (user) {
        if (user) {
            citizenName = user.name;
            if (pswd === user.password) {
                res.render("userMainPage", { doctorName: false, userName: user.name });  // if password matched
            }
            else {
                res.render("userLogin", { passwordFail: true, text: false, notFound: false });  // if password not matched
            }
        }
        else {
            res.render("userLogin", { passwordFail: false, text: false, notFound: true });  // if password not matched
        }
    }).catch(function(err){
        res.send(err);
    })
})

//Doctor Login

app.post("/docLogin", function (req, res) {
    const email = req.body.email;
    const pswd = req.body.password;
    Doctor.findOne({ email: email }).then(function (user) {
        if (user) {
            doctorName = user.name;

            if (pswd === user.password) {
                // if password matched

                res.render("doctorMainPage", { userName: doctorName, text: false });

            }
            else {
                res.render("docLogin", { text: "Wrong Password" });  // if password not matched
            }
        }
        else {
            res.render("docLogin", { text: "No account exists with this email" });  // if no account found
        }
    })
})

app.get("/doctorAppointments", function (req, res) {
    Appointment.find({ doctorName: doctorName }).then(function (data) {
        res.render("doctorAppointments", { userName: doctorName, patients: data });
    });

})

app.get("/doctorHome", function (req, res) {
    res.render("doctorMainPage", { userName: doctorName, text: false });
})
app.get("/userHome", function (req, res) {
    res.render("userMainPage", { userName: citizenName });
})
app.get("/doctorOnDemand", function (req, res) {
    res.render("doctorOnDemand", { homeDoctorData: false, docSchedule: false, userName: citizenName, repeat: false });
})


app.get("/clinicAppointment", function (req, res) {
    res.render("clinicAppointment", { clinicDoctorData: false, docSchedule: false, userName: citizenName });
})
//Home doctor search
let homeAppointMentAddress;
let clinicAppointMentAddress;
app.post("/homeDoctorSearch", function (req, res) {
    const receivedArea = req.body.area;
    const receivedSpecialization = req.body.specialization;
    homeAppointMentAddress = req.body.address;

    let today = new Date();
    let year = today.getFullYear();
    let month = today.getMonth() + 1;
    let date = today.getDate();
    let completeDate

    if (month < 10 && date < 10)
        completeDate = year + "-0" + month + "-0" + date;
    else if (month < 10 && date >= 10)
        completeDate = year + "-0" + month + "-" + date;
    else if (month >= 10 && date < 10)
        completeDate = year + "-" + month + "-0" + date;
    else if (month < 10 && date < 10)
        completeDate = year + "-" + month + "-" + date;

    Doctor.find({ area: receivedArea, specialization: receivedSpecialization }).then(function (doctors) {

        doctors.forEach(element => {

            element.schedule.forEach(ele => {

                if (ele.date < completeDate) {
                    ele.date = " ";
                    ele.slot1 = " ";
                    ele.slot2 = " ";
                    ele.slot3 = " ";
                }

            });
            element.save();

        });
        setTimeout(() => {
            res.render("doctorOnDemand", { homeDoctorData: doctors, userName: citizenName, repeat: false });
        }, 1000);
    });
});

// Clinic Doctor Search

app.post("/clinicDoctorSearch", function (req, res) {
    const receivedArea = req.body.area;
    const receivedSpecialization = req.body.specialization;
    clinicAppointMentAddress = req.body.address;

    let today = new Date();
    let year = today.getFullYear();
    let month = today.getMonth() + 1;
    let date = today.getDate();
    let completeDate

    if (month < 10 && date < 10)
        completeDate = year + "-0" + month + "-0" + date;
    else if (month < 10 && date >= 10)
        completeDate = year + "-0" + month + "-" + date;
    else if (month >= 10 && date < 10)
        completeDate = year + "-" + month + "-0" + date;
    else if (month < 10 && date < 10)
        completeDate = year + "-" + month + "-" + date;

    Doctor.find({ area: receivedArea, specialization: receivedSpecialization }).then(function (doctors) {

        doctors.forEach(element => {

            element.schedule.forEach(ele => {

                if (ele.date < completeDate) {
                    ele.date = " ";
                    ele.slot1 = " ";
                    ele.slot2 = " ";
                    ele.slot3 = " ";
                }

            });
            element.save();
        });
        setTimeout(() => {
            res.render("clinicAppointment", { clinicDoctorData: doctors, userName: citizenName });
        }, 1000);
    });
});

// Scheduling Home Appointment

app.post("/scheduleHomeAppointment", function (req, res) {
    const receivedSlot = req.body.slot;
    const receivedDocName = req.body.doctorName;


    const date = receivedSlot.slice(0, 10);
    const slot = receivedSlot.slice(10, 15);
    const id = receivedSlot.slice(15,);

    let Slot;
    if (slot === "slot1")
        Slot = "Slot 1";
    else
        if (slot === "slot2")
            Slot = "Slot 2";
        else
            if (slot === "slot3")
                Slot = "Slot 3";
    const appointments = new Appointment({
        doctorName: receivedDocName,
        userName: citizenName,
        status: "Pending",
        date: date,
        slot: Slot,
        type: "Home",
        address: homeAppointMentAddress
    });



    // updating the slots
    Doctor.findOne({ name: receivedDocName }).then(function (datas) {
        console.log(datas);
        let c = -1;
        let index;
        let x = 0;
        datas.schedule.forEach(element => {
            c++;
            if (element.date === date)
                index = c;

            if (slot === "slot1") {
                if (element.date === date && (element.slot1 === "Busy")) {
                    res.render("doctorOnDemand", { homeDoctorData: false, userName: citizenName, repeat: true })
                }
                else {
                    console.log("this is slot 1");
                    x = 1;
                }
            }

            else
                if (slot === "slot2") {
                    if (element.date === date && (element.slot2 === "Busy")) {
                        res.render("doctorOnDemand", { homeDoctorData: false, userName: citizenName, repeat: true })

                    }
                    else {
                        x = 1;
                        console.log("this is slot 2");
                    }
                }

                else
                    if (slot === "slot3") {
                        if (element.date === date && (element.slot3 === "Busy")) {
                            res.render("doctorOnDemand", { homeDoctorData: false, userName: citizenName, repeat: true })
                        }
                        else {
                            x = 1;
                            console.log("this is slot 3");
                        }
                    }
       });

        if (x === 1) {
            appointments.save();
        }
        if (slot === "slot1") {
            Slot = "Slot 1";
            datas.schedule[index]["slot1"] = "Busy";
            datas.save();
        }
        else
            if (slot === "slot2") {
                Slot = "Slot 2";
                datas.schedule[index]["slot2"] = "Busy";
                datas.save();
            }
            else
                if (slot === "slot3") {
                    Slot = "Slot 3";
                    datas.schedule[index]["slot3"] = "Busy";
                    datas.save();
                }
    })

    setTimeout(() => {

        Appointment.find({ userName: citizenName }).then(function (data) {
            res.render("userAppointments", { doctors: data, userName: citizenName });
        });
    }, 1000);
});

// Scheduling clinic appointment

app.post("/scheduleClinicAppointment", function (req, res) {
    const receivedSlot = req.body.slot;
    const receivedDocName = req.body.doctorName;


    const date = receivedSlot.slice(0, 10);
    const slot = receivedSlot.slice(10, 15);
    const id = receivedSlot.slice(15,);

    let Slot;
    if (slot === "slot1")
        Slot = "Slot 1";
    else
        if (slot === "slot2")
            Slot = "Slot 2";
        else
            if (slot === "slot3")
                Slot = "Slot 3";

    // updating the slots
    Doctor.findOne({ name: receivedDocName }).then(function (datas) {
        console.log(datas);
        let c = -1;
        let index;
        datas.schedule.forEach(element => {
            c++;
            if (element.date === date)
                index = c;

        });
        if (slot === "slot1") {
            Slot = "Slot 1";
            datas.schedule[index]["slot1"] = "Busy";
            datas.save();
        }
        else
            if (slot === "slot2") {
                Slot = "Slot 2";
                datas.schedule[index]["slot2"] = "Busy";
                datas.save();
            }
            else
                if (slot === "slot3") {
                    Slot = "Slot 3";
                    datas.schedule[index]["slot3"] = "Busy";
                    datas.save();
                }
    })

    const appointments = new Appointment({
        doctorName: receivedDocName,
        userName: citizenName,
        status: "Pending",
        date: date,
        slot: Slot,
        type: "Clinic",
        address: clinicAppointMentAddress
    });

    appointments.save();
    setTimeout(() => {

        Appointment.find({ userName: citizenName }).then(function (data) {
            res.render("userAppointments", { doctors: data, userName: citizenName });
        });
    }, 1000);
});

// User Appointments

app.get("/myAppointments", function (req, res) {
    Appointment.find({ userName: citizenName }).then(function (data) {
        res.render("userAppointments", { doctors: data, userName: citizenName });
    });
});

// Approving appointment by doctor

app.post("/approveAppointment", function (req, res) {
    const doctorName = req.body.doctorName;
    const userName = req.body.userName;
    const date = req.body.date;
    const slot = req.body.slot;

    Appointment.updateOne({ doctorName: doctorName, userName: userName, status: "Pending", date: date, slot: slot }, { status: "Approved" }).then(function (data) {
        console.log(data);
    });

    setTimeout(() => {

        Appointment.find({ doctorName: doctorName }).then(function (data) {

            res.render("doctorAppointments", { doctorName: doctorName, patients: data, text: false });
        });
    }, 1000);  // 1 sec delay because data, which was recently saved was not readable 
})

// Completing appointment by doctor

app.post("/completedAppointment", function (req, res) {
    const doctorName = req.body.doctorName;
    const userName = req.body.userName;
    const date = req.body.date;
    const slot = req.body.slot;

    Appointment.updateOne({ doctorName: doctorName, userName: userName, status: "Approved", date: date, slot: slot }, { status: "Complete" }).then(function (data) {
        console.log(data);
        // updating status approve to complete 
    });

    Doctor.findOne({ name: doctorName }).then(function (datas) {
        console.log(datas);
        let c = -1;
        let index;
        datas.schedule.forEach(element => {
            c++;
            if (element.date === date)
                index = c;
        });
        if (slot === "Slot 1") {
            datas.schedule[index]["slot1"] = "Free";
            datas.save();
        }
        else
            if (slot === "Slot 2") {
                datas.schedule[index]["slot2"] = "Free";
                datas.save();
            }
            else
                if (slot === "Slot 3") {
                    datas.schedule[index]["slot3"] = "Free";
                    datas.save();
                }
    })

    setTimeout(() => {
        Appointment.find({ doctorName: doctorName }).then(function (data) {
            res.render("doctorAppointments", { doctorName: doctorName, patients: data });
        });
    }, 1000);  // 1 sec delay because data, which was recently saved was not readable 
})



// patient history

app.post("/userHistory", function (req, res) {
    const userName = req.body.userName;
    const doctorName = req.body.doctorName;
    Appointment.find({ userName: userName, doctorName: doctorName }).then(function (data) {
        res.render("patientHistory", { doctors: data, doctorName: doctorName });
    });
});

// update schedule by doctor

app.post("/updateSchedule", function (req, res) {
    const receivedDate = req.body.date;
    const slot1 = req.body.slot1;
    const slot2 = req.body.slot2;
    const slot3 = req.body.slot3;

    const doctorName = req.body.doctorName;

    const schedule1 = new Schedule({
        doctorName: doctorName,
        date: receivedDate,
        slot1: slot1,
        slot3: slot2,
        slot2: slot3,
    });

    schedule1.save();

    Doctor.findOne({ name: doctorName }).then(function (data) {
        data.schedule.push(schedule1);
        data.save();
    });
    res.render("doctorMainPage", { userName: doctorName, text: true })
})



app.listen(3000, function () {
    console.log("Server running on port 3000");
})
