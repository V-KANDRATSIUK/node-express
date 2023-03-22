const {Router} = require('express');
const Course   = require('../models/course');
const router   = Router();
const auth     = require('../middleware/auth');
const { validationResult } = require('express-validator/check')
const { courseValidators } = require('../utils/validators')

function isOwner(course, req) {
    return course.userId.toString() === req.user._id.toString();
}

router.get('/', async (req, res) => {
    const courses = await Course.find();

    res.render('courses', {
        title: 'Courses',
        isCourses: true,
        courses,
        csrf: req.csrfToken(),
        userId: req.user ? req.user._id.toString() : null
    });
})

router.get('/:id/edit', auth, async (req, res) => {
    if (!req.query.allow) return res.redirect('/');

    const course = await Course.findById(req.params.id);
    if (!isOwner(course, req)) {
        return res.redirect('/courses')
    }

    res.render('course-edit', {
        title: course.title,
        course
    })
})

router.post('/edit', auth, courseValidators, async (req, res) => {
    const errors = validationResult(req);
    const { id } = req.body;
    if (!errors.isEmpty()) {
        return res.status(422).redirect(`/courses/${id}/edit?allow=true`)
    }

    delete req.body.id;
    const course = await Course.findById(id);
    if (!isOwner(course, req)) {
        return res.redirect('/courses')
    }
    Object.assign(course, req.body);
    await course.save();
    res.redirect('/courses')
})

router.post('/remove', auth, async (req, res) => {
    try {
        await Course.deleteOne({
            _id: req.body.id,
            userId: req.user._id
        });
        res.redirect('/courses')
    } catch (e) {
        console.log('ERROr');
        console.log(e)
    }
})

router.get(`/:id`, async (req, res) => {
    const course = await Course.findById(req.params.id);
    res.render('course', {
        layout: 'empty',
        title: `Course ${course.title}`,
        course
    })
})

module.exports = router