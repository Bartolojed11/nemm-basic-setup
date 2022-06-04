const { promisify } = require('util')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const User = require('./../models/userModel')
const catchAsync = require('../handlers/CatchAsync')
const AppError = require('./../handlers/AppError')
const sendEmail = require('./../utils/sendEmail')

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRATES_IN
    })
}

const createSendToken = (user, status, res) => {
    const token = signToken(user._id)
    let cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true // This cant be accessed or modified by browsers. All browsers will receive cookie, send it along w/ every request
    }

    // .secure will only send to https
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true
    res.cookie('jwt', token, cookieOptions)

    res.status(status).json({
        status: 'success',
        token
    })
}

// This way, we can pass a parameter on our middleware
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // req.user.role came from authController.protect
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403))
        }

        next()
    }
}

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    })

    const token = signToken(newUser._id)

    res.status(201).json({
        status: 'success',
        token: token,
        data: {
            user: newUser
        }
    })
})

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body

    if (!email || !password) {
        return next(new AppError('Please provide a valid email and password', 400))
    }

    // +password to include the field that is hidden on model using select: false
    const user = await User.findOne({ email }).select('+password')

    if (!user || ! await user.correctPassword(password, user.password)) {
        return next(new AppError('Incorrect user or password', 401))
    }

    createSendToken(user, 200, res)

})

exports.protect = catchAsync(async (req, res, next) => {
    const { authorization } = req.headers
    let token

    if (authorization && authorization.startsWith('Bearer')) {
        token = authorization.split(' ')[1]
    }

    if (token === undefined) {
        return next(new AppError('You are not logged in. Please login to have access', 401))
    }

    // verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

    // Check if user still exists
    const user = await User.findById(decoded.id)
    if (!user) {
        return next(new AppError('The user belonging to this token no longer exists', 401))
    }

    // Check if user changed password after the token is issued
    // iat : issued at
    if (!user.changePasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed password. Please log in again', 401))
    }

    // Grant access to the user
    req.user = user
    next()
})

exports.forgotPassword = catchAsync(async (req, res, next) => {
    const { email } = req.body

    const user = await User.findOne({ email })

    if (!user) {
        return next(new AppError('Email does not exist', 404))
    }

    const resetToken = await user.createPasswordResetToken()
    await user.save()

    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`
    const message = `forgot password . ${resetURL}`

    try {
        await sendEmail({
            email: user.email,
            subject: 'Forgot password.',
            message
        })

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email'
        })
    } catch (err) {
        user.passwordResetToken = undefined
        user.passwordResetExpires = undefined
        await user.save()

        return next(new AppError('There was an error sending the email. Please try again later', 500))
    }
})

exports.resetPassword = catchAsync(async (req, res, next) => {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

    const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } })

    if (!user) {
        return next(new AppError('Token is invalid or expired', 401))
    }

    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    user.passwordResetToken = undefined
    user.passwordExpiresIn = undefined
    await user.save()

    createSendToken(user, 200, res)
})

exports.updatePassword = catchAsync(async (req, res, next) => {
    const { email, currentPassword, password } = req.body

    if (!email || !currentPassword) {
        return next(new AppError('Please provide a valid email and password', 400))
    }

    // +password to include the field that is hidden on model using select: false
    const user = await User.findOne({ email }).select('+password')

    if (!user || ! await user.correctPassword(currentPassword, user.password)) {
        return next(new AppError('Incorrect user or password', 401))
    }

    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    await user.save()

    createSendToken(user, 200, res)
})