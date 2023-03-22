const {body} =require('express-validator/check');
const User = require('../models/user')

exports.registerValidators = [
    body('email')
        .isEmail().withMessage('Enter valid email')
        .custom(async (value, {req}) => {
            try {
                const user = await User.findOne({ email: value });
                if (user) {
                    return Promise.reject('There is a user with email')
                }
            } catch (e) {

            }
        })
        .normalizeEmail(),
    body('password', 'Min length is 6 symbols')
        .isLength({min: 6, max: 56})
        .isAlphanumeric()
        .trim(),
    body('confirm').custom((value, {req}) => {
        if (value !== req.body.password) {
            throw new Error('Passwords shold be the same')
        }
        return true;
    }).trim(),
    body('name').isLength({min: 3}).withMessage('Min length is 3 symbols').trim()
]

exports.loginValidators = [
    body('email')
        .isEmail().withMessage('Enter email')
        .custom(async (value, {req}) => {
            try {
                const user = await User.findOne({ email: value });
                if (!user) {
                    return Promise.reject(`Can\'t find a user with email: ${value}`)
                }
            } catch (e) {

            }
        })
        .normalizeEmail(),
    body('password', 'Enter email')
]

exports.courseValidators = [
    body('title').isLength({min: 3}).withMessage('Min title is 3 symbols').trim(),
    body('price').isNumeric().withMessage('Enter correct Price'),
    body('img', 'Enter valid URL').isURL()
]