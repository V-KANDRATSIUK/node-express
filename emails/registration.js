const keys = require('../keys/index');

module.exports = function (to) {
    return {
        to,
        from: keys.EMAIL_FROM,
        subject: 'Account was created',
        html: `
             <h1>Welcome our Shop</h1>
             <p>You have successfully created the account - ${to}</p>
             <hr/>
             <a href="${keys.BASE_URL}">Courses Shop</a>
            <p>This is a test email sent using SendGrid!</p>
        `
    }
}