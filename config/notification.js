let transporter = require('./transporter');

let sendNotification =  async function (userToNotify){
    let message = `<div style="background-color: #F4F6F9; padding: 60px 20px; font-family: 'Open Sans', sans-serif; font-size: 12px;">
    <div class="___email-content" style="height: auto; width: 600px; max-width: 100%; margin: auto; line-height: 1.8rem; color: #49575F; background-color: #fff;">
        <div class="___header" style="padding: 60px 0px 12px 0px; line-height: 50px; height: 50px; margin: 0;">
            <div class="___logo" style="text-align: center; font-size: 18px; color: #0097D7; line-height: 50px; height: 50px; margin: 0;"><h2 style="text-align: center; font-size: 18px; color: #0097D7; line-height: 50px; height: 50px; margin: 0;">[[company_name]]</h2></div>
        </div>

        <div class="___body" style="padding: 32px 0px 20px 0px; width: 80%; margin: auto;">
            <h2 class="___email-subject" style="font-size: 20px; margin-bottom: 24px;">Reset Password</h2>
            <p class="___email-body">
                Hi ${userToNotify.email} Welcome to facebook
            </p>
            <a class="___action-button" target="_blank" href="www.airform.co" style="display: inline-block; color: #ffffff; background-color: #0097D7; margin-top: 36px; padding: 11px 60px 15px 60px; width: auto; border-radius: 2px; border: none; font-size: 14px; height: auto;">Visit Us</a>
        </div>  `

        let mailOptions = {
            from: `"${process.env.COMPANY_EMAIL}"`, // sender address
            to: userToNotify.email, // list of receivers
            subject: 'Welcome to facebook', // Subject line
            text: message, // plaintext body
            html: message // html body
        };
        console.log("MAILING!");
        console.log(mailOptions)
        // send mail with defined transport object
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: ' + info.response);
        });
}
module.exports = async function notification(userToNotify) {

    let notificationSent = await sendNotification(userToNotify); 

}