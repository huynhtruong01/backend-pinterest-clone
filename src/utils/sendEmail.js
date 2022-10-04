const nodemailer = require('nodemailer')

const sendEmail = async (data) => {
    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: false,
        auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD,
        },
    })

    const optionsMail = {
        from: 'Pinterest HT <htpinterest@gmail.com>',
        to: data.email,
        subject: data.subject,
        text: data.text,
    }

    await transporter.sendMail(optionsMail)
}

module.exports = sendEmail
