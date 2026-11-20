const userModel = require("../models/user.model")
const tokenBlacklistModel = require('../models/blacklist.model')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

/**
 * @name registerUserController
 * @description Registers a new user. Expects username, email and password in user body
 * @access public 
 */
async function registerUserController (req,res){
    const {username,email,password} = req.body
    if (!username || !password || !email){
        return res.status(400).json({
            message: "Please provide the credentials"
        })
    }
    const userExists = await userModel.findOne({
        $or: [{username},{email}]
    })
    if (userExists){
        return res.status(400).json({
            message:'Account already exists with username or email'
        })
    }
    const hash = await bcrypt.hash(password,10)
    const newUser = await userModel.create({
        username,
        email,
        password:hash
    })
    const token = jwt.sign(
        {id:newUser._id, username: newUser.username},
        process.env.JWT_SECRET,
        {expiresIn:'1d'}
    )
    res.cookie('token',token)
    res.status(201).json({
        message:'User registered successfully',
        user: {
            id: newUser._id,
            username: newUser.username,
            email: newUser.email
        }
    })
    
}

/**
 * @name loginUserController
 * @description login a user, expects email and password in request body
 * @access public
 */
async function loginUserController(req,res){
    const {email,password} = req.body
    const user = await userModel.findOne({email})
    if(!user){
        return res.status(400).json({
            message: 'Invalid Email or Password'
        })
    }
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword){
        return res.status(400).json({
            message: 'Invalid Email or Password'
        })
    }
    const token = jwt.sign(
        {id:user._id, username: user.username},
        process.env.JWT_SECRET,
        {expiresIn:'1d'}
    )
    res.cookie('token',token)
    res.status(200).json({
        message:'User loggedIn Successfully!',
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}

/**
 * @name logoutUserController
 * @description safely logout a user by blacklisting tokens as well
 * @access public
 */
async function logoutUserController(req,res){
    const token  = req.cookies.token
    if (token){
        await tokenBlacklistModel.create({token})
    }
    res.clearCookie('token')
    res.status(200).json({
        message: "User logged out Successfully"
    })

}

/**
 * @name getMeController
 * @description get the current logged in user details
 * @access private
 */
async function getMeController(req,res){
    const user = await userModel.findById(req.user.id)
    res.status(200).json({
        message: "User details fetched successfully",
        user:{
            id: user._id,
            username: user.username,
            email: user.email

        }
    })
}

module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
}