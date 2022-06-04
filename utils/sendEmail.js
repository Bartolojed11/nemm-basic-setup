const nodemailer = require('nodemailer')

const catchAsync = require('../handlers/CatchAsync')

const sendEmail = catchAsync(async (options)=> {
    // Transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    })

    // Email Options
    const mailOptions = {
        from: `${process.env.EMAIL_FROM} <${process.env.EMAIL_FROM_NAME}>`,
        to: options.email,
        subject: options.subject,
        text: options.message
    }

    // Send email
    await transporter.sendMail(mailOptions)
})

module.exports = sendEmail