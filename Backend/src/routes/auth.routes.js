const express = require('express')
const {registerUserController,loginUserController,logoutUserController, getMeController} = require('../controllers/auth.controller')
const authMiddleware = require('../middlewares/auth.middleware')

const authRouter = express.Router()

/**
 * @route POST /api/auth/register
 * @description Register a new user
 * @access public
 */
authRouter.post('/register',registerUserController)

/**
 * @route POST /api/auth/login
 * @description Login a user with email and password
 * @access public
 */
authRouter.post('/login',loginUserController)

/**
 * @route GET /api/auth/logout
 * @description clear token from cookie and blacklist it
 * @access public
 */
authRouter.get('/logout',logoutUserController)

/**
 * @route GET /api/auth/get-me
 * @description get the current logged in user details
 * @access private
 */
authRouter.get('/get-me',authMiddleware.authUser,getMeController)

module.exports = authRouter