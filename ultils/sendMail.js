const nodemailer = require('nodemailer');
const asyncHandler = require('express-async-handler');
const sendMail = asyncHandler(async(email, token) => {
   
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
              // TODO: replace `user` and `pass` values from <https://forwardemail.net>
              user: "process.env.EMAIL_NAME",
              pass: "process.env.EMAIL_APP_PASSWORD",
            },
          });
          
          // async..await is not allowed in global scope, must use a wrapper
          async function main() {
            // send mail with defined transport object
            const info = await transporter.sendMail({
              from: '"Lynn" <no-relply@Lynn.com>', // sender address
              to: email ,// list of receivers
              subject: "Forgot password", // Subject line
             
              html: html, // html body
            });
            return info
          
            
         
          }
          
          main().catch(console.error);
    }
)
module.exports = sendMail