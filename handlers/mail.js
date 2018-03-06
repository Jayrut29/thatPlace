const nodemailer = require('nodemailer');
const pug = require('pug');
const juice = require('juice');
const htmltotext = require('html-to-text');
const promisify = require('es6-promisify');



const transport = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
        user: process.env.MAIL_USER, // generated ethereal user
        pass: process.env.MAIL_PASS  // generated ethereal password
    }
});

const generateHTML = (filename, options = {}) => {
    const html = pug.renderFile(`${__dirname}/../views/email/${filename}.pug`, options);
    console.log('options-----HEREEEEE----->>>>>: ', options);
    const inlined = juice(html);
    return inlined;
}

exports.send = async(options) => {

    const html = generateHTML(options.filename,options);
    console.log('html---------->>>>>: ', html);
    const text = htmltotext.fromString(html);
    const mailOptions = {
        from: 'Jayrut Patel <jayrut@gmail.com>',
        to: options.user.email,
        subject: options.subject,
        html,
        text
    }

    const sendMail = promisify(transport.sendMail, transport);
    return sendMail(mailOptions);
}