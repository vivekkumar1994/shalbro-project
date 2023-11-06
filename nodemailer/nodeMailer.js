const nodemailer = require('nodemailer');

// Create a Nodemailer transporter with your email service provider's settings
const transporter = nodemailer.createTransport({
    // this service for Gmail
    // service: 'Gmail', 
    // auth: {
    //     user: `${process.env.USERNAME}`, 
    //     pass: `${process.env.PASSWORD}` // Your email password (consider using environment variables for security)
    // }

    // this service for smtp

    host: 'smtp.example.com',
port: 587, 
secure: false, 
auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
}
});



module.exports = transporter;
