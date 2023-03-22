const { Router } = require('express');
const router     = Router();
const User       = require('./../models/user');
const bcrypt     = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendGrid   = require('nodemailer-sendgrid-transport');
const keys       = require('../keys');
const regEmail   = require('../emails/registration');
const crypto     = require('crypto');
const resetEmail = require('../emails/reset');
const { validationResult }   = require('express-validator/check')
const { registerValidators } = require('../utils/validators')
const transporter = nodemailer.createTransport(sendGrid({
    auth: {
        api_key: keys.SENDGRID_API_KEY
    }
}))

router.get('/login', async (req, res) => {
    res.render('auth/login', {
        title: 'Log In',
        isLogin: true,
        loginError: req.flash('loginError'),
        registerError: req.flash('registerError')
    })
})

router.get('/logout', async (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login#login')
    })

})

router.get('/password/:token', async (req, res) => {
    if (!req.params.token) return res.redirect('/auth/login');
    const user = await User.findOne({
        resetToken: req.params.token,
        resetTokenExp: {$gt: Date.now()}
    });

    if (!user) return res.redirect('/auth/login');

    res.render('/auth/password', {
        title: 'Restore access',
        error: req.flash('error'),
        userId: user._id.toString(),
        token: req.params.token
    })

    res.render(

    );
})

router.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body;
        const candidate = await User.findOne({email});
        if (candidate) {
            const isSame = await bcrypt.compare(password,  candidate.password);

            if (isSame) {
                req.session.user = candidate;
                req.session.isAuthenticated = true;
                req.session.save((error) => {
                    if (error) throw error;

                    res.redirect('/')
                })
            } else {
                req.flash('loginError', 'Wrong Password')
                res.redirect('/auth/login#login');
            }
        } else {
            req.flash('loginError', 'User doesn\'t exist');
            res.redirect('/auth/login#login');
        }
    } catch (e) {
        
    }
})

router.post('/register', registerValidators, async (req, res) => {
    try {
        const { email, password,  name } = req.body;
        const errors = validationResult(req);
        console.log(errors.array())
        if (!errors.isEmpty()) {
            req.flash('registerError', errors.array()[0].msg);
            return res.status(422).redirect('/auth/login#register')
        }

        const hashPassword = await bcrypt.hash(password, 10)
        const user = new User(
            {email, name, password: hashPassword, cart: {items: []}
            });
        await user.save();

        await transporter.sendMail(regEmail(email));
        res.redirect('/auth/login#login');
    } catch (e) {

    }
})

router.get('/reset', (req, res) => {
    res.render('auth/reset', {
        title: 'Forgot the Password?',
        error: req.flash('error')
    })
})

router.post('/reset',(req, res) => {
    try {
        crypto.randomBytes(32,async (err, buffer) => {
            if (err) {
                req.flash('error', 'Smth went wrong, repeat later')
                return res.redirect('/auth/reset')
            }
            const token = buffer.toString('hex');
            const candidate = await User.findOne({email: req.body.email});

            if (candidate) {
                candidate.resetToken = token;
                candidate.resetTokenExp = Date.now() + 360_000;
                await candidate.save();
                await transporter.sendMail(resetEmail(candidate.email, token));
                res.redirect('/auth/login')
            } else {
                req.flash('error', 'No such email');
                res.redirect('/auth/reset');
            }

        })
    } catch (e) {
        console.error(e)
    }
})

router.post('/password', async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.body.userId,
            resetToken: req.body.token,
            resetTokenExp: {$gt: Date.now()}
        });

        if (user) {
            user.password = await bcrypt.hash(req.body.password, 10);
            user.resetToken = undefined;
            user.resetTokenExp = undefined;
            await user.save();
            res.redirect('/auth/login');
        } else {
            req.flash('loginError', 'Token expired')
            res.redirect('/auth/login');
        }
    } catch (e) {
        console.log(e)
    }
} )

module.exports = router;