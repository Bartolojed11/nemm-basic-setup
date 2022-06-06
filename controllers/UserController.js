const User = require('./../models/userModel')
const catchAsync = require('../handlers/CatchAsync')

const multer = require('multer')
const sharp = require('sharp')

/**
 * multer or file uploading should only be put on specific file or routes
 * to avoid malicous user to upload everywhere.
 * SAVING OF SINGLE IMAGE
 */

/**
 * This is not efficient when there is a resizing of image that will happen
 * Since it will save this image and after the resize, it will save again to the disk
 * 
const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/img/users')
    },
    filename: (req, file, cb) => {
        // console.log("🚀 ~ file: UserController.js ~ line 16 ~ req", req)
        const ext = file.mimetype.split('/')[1]
        cb(null, `user-${req.user._id}-${Date.now()}.${ext}`)
    }
})
 */

// Use to save image on the memory to avoid saving multiple times after resizing image
const multerStorage = multer.memoryStorage()

const multerFilter = (req, file, cb) => {
    // No matther what image type it is, mimetype of images always starts with image
    if (file.mimetype.startsWith('image')) {
        cb(null, true)
    } else {
        cb(new AppError('Not an image! Please upload only an image', 401), false)
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
})

// photo is the name that holds the photo uploaded
exports.uploadUserPhoto = upload.single('photo')

exports.resizeUserPhotos = (req, res, next) => {
    if (!req.file) return next()

    // Filename should be set here since it will be accessed by another controller later for saving the filename to database
    req.file.filename = `user-${req.user._id}-${Date.now()}.jpeg`

    sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${req.file.filename}`)

    next()
}

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

exports.updateMe = catchAsync(async (req, res, next) => {
    const { email, name } = req.body
    const user = await User.findOne({ email })
    let file

    if (req.file) {
        file = req.file.filename
    }

    user.photo = file
    user.name = name
    await user.save()

    res.status(200).json({
        status: 'success',
        data: {
            user
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