const {Router} = require('express');
const Course   = require('../models/course')
const router   = Router();
const auth     = require('../middleware/auth');


function mapCartItems(cart) {
    return cart.items.map(item => ({
        ...item.courseId._doc,
        count: item.count,
        id: item.courseId.id
    }))
}

function computePrice(courses) {
    return courses.reduce((summ, course) => summ + course.price * course.count, 0)
}

router.post('/add', auth, async (req, res) => {
    const course = await Course.findById(req.body.id);
    await req.user.addToCart(course);
    res.redirect('/card')
})

router.get('/', auth, async (req, res) => {
    let user = await req.user.populate('cart.items.courseId');
    const courses = mapCartItems(user.cart);

    res.render('card', {
        title: 'Shopping cart',
        courses: courses,
        price: computePrice(courses),
        isCard: true
    })
})

router.delete('/remove/:id', auth, async (req, res) => {
    await req.user.removeFromCart(req.params.id);
    const user = await req.user.populate('cart.items.courseId');
    const courses = mapCartItems(user.cart);
    const cart = {
        courses,
        price: computePrice(courses)
    }
    res.status(200).json(cart);
})

module.exports = router;