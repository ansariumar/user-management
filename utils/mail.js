const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     host: "smtp.gmail.com",
//     port: 587,
//     secure: false, // true for port 465, false for other ports
//     auth: {
//       user: process.env.MAIL,
//       pass: process.env.MAIL_PASSWORD,
//     },
//   });

// const mailOptions = {
//     from: {
//         name: "HR Esparse Matrix",
//         address: process.env.EMAIL,
//     },
//     to: "ansarinaimuddin1948@gmail.com",
//     subject: "Shift Updated bro test 😭😭😭",
//     text: "The shift has been updated",
//     html: "<b>A pdf of the new shifts has been attached to the email 🙂‍↕️</b>",
//     attachments: [{
//             filename: "1733393308988-MohamadUmar_Ansari.pdf",
//             path: "./uploads/1733393308988-MohamadUmar_Ansari.pdf",
//         }]
// }

// const sendMail = async (transporter, options) => {
//     try {
//         const info = await transporter.sendMail(options);
//         console.log("Message sent: %s", info.messageId);
//         return;
//     } catch (error) {
//         console.error(error);
//         return;
//     }
// }

// sendMail(transporter, mailOptions);

async function sendEmail(email, password, empname) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for port 465, false for other ports
        auth: {
            user: process.env.MAIL,
            pass: process.env.MAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: {
            name: "HR Esparse Matrix",
            address: process.env.EMAIL,
        },
        to: email,
        subject: `Congratulations ${empname}! You have been added to the Esparse Matrix family, Below are your email and password to login`,
        text: `Email: ${email} Password: ${password}`,
        html: "<b>Happy to have you😁😁</b>",
        // attachments: [{
        //     filename: "1733393308988-MohamadUmar_Ansari.pdf",
        //     path: "./uploads/1733393308988-MohamadUmar_Ansari.pdf",
        // }]
    }

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Message sent: %s", info.messageId);
        return info.messageId;
    } catch (error) {
        console.error(error);
        return error;
    }

}

module.exports = { sendEmail } ;