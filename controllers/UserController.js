const User = require('./../models/userModel')
const catchAsync = require('../handlers/CatchAsync')

exports.getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find()

    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users
        }
    })
})

exports.createUser = catchAsync(async (req, res, next) => {
    const newUser = await User.create(req.body)

    return res.status(200).json({
        status: 'success',
        message: 'User created successfully',
        data: {
            newUser
        }
    })
})

exports.getUser = catchAsync(async (req, res, next) => {
    const user = await User.find(req.params.id)

    return res.status(200).json({
        status: 'success',
        data: {
            user
        }
    })
})

exports.deleteUser = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndDelete(req.params.id)

    return res.status(200).json({
        status: 'success',
        message: 'User deleted successfully'
    })
})

exports.updateUser = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.params.id)

    return res.status(200).json({
        status: 'success',
        message: 'User updated successfully',
        data: {
            user
        }
    })
})