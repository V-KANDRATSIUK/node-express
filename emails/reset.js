const keys = require("../keys");
module.exports = function (email, token) {
    return {
        to: email,
        from: keys.EMAIL_FROM,
        subject: 'Account was created',
        html: `
             <h1>Forgot the password</h1>
             <p>If not, please ingnore the email</p>
             <hr/>
             <p>Otherwise click <a href="${keys.BASE_URL}/auth/password/${token}">link</a></p>
        `
    }
}