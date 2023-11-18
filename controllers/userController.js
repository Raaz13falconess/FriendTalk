const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const chatModel = require("../models/chatModel");

const register = async(req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const image = 'images/' + req.file.filename;
    try {
        const passwordHash = await bcrypt.hash(password, 10);

        const user = new userModel({
            name : name,
            email : email,
            password : passwordHash, 
            image : image
        })
        const userData = await user.save();
        res.render('register', {message : `${name} is registered succesfully`});
    } catch (error) {
        console.log(error.message);
    }
}

const registerLoad = async(req, res) => {
    try {
        res.render('register');
    } catch (error) {
        console.log(error.message);
    }
}

const loadLogin = async(req, res) => {
    try {
        res.render('login');
    } catch (error) {
        console.log(error.message);
    }
}

const loadDashboard = async(req, res) => {
    try {
        var otherUsers = await userModel.find({_id : {$nin : [req.session.user]}});
        res.render('dashboard', {user : req.session.user, otherUsers : otherUsers});
    } catch (error) {
        console.log(error.message);
    }
}

const login = async(req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    try {
        const userData = await userModel.findOne({email : email});
        if(userData) {
            const passMatch = await bcrypt.compare(password, userData.password);
            if(passMatch) {
                req.session.user = userData;
                res.redirect('/dashboard');
            }
            else {
                res.render('login', {message : "Email and Password are incorrect"});
            }
        }
        else {
            res.render('login', {message : "Email and Password are incorrect"});
        }
    } catch (error) {
        console.log(error.message);
    }
}

const logout = async(req, res) => {
    try {
        req.session.destroy();
        res.redirect('/login');
    } catch (error) {
        console.log(error.message);
    }
}

const saveChat = async(req, res) => {
    const receiver_id = req.body.receiver_id;
    const sender_id = req.body.sender_id;
    const message = req.body.message;
    try {
        const chat = new chatModel({
            receiver_id : receiver_id,
            sender_id : sender_id, 
            message : message
        })
       const newChat = await chat.save();
       if(newChat) {
        res.status(200).send({success : true, msg : "Chat saved succesfully", data: newChat});
       }

    } catch (error) {
        console.log(error.message);
        res.status(400).send({sucess : false, msg : error.message});
    }
}

const deleteChat = async (req, res) => {
    try {
        await chatModel.deleteOne({_id : req.body.id});
        res.status(200).send({success : true});
    } catch (error) {
        res.status(400).send({success: false, msg : error.message});
    }
}

module.exports = { registerLoad, register, logout, loadDashboard, loadLogin, login, saveChat, deleteChat};