const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');
const csurf          = require('csurf');
const express        = require('express');
const exphbs         = require('express-handlebars');
const Handlebars     = require('handlebars');
const homeRoutes     = require('./routes/home');
const addRoutes      = require('./routes/add');
const coursesRoutes  = require('./routes/courses');
const cardroutes     = require('./routes/card');
const ordersRoutes   = require('./routes/orders');
const authRoutes     = require('./routes/auth');
const profileRoutes  = require('./routes/profile');
const path           = require('path');
const mongoose       = require('mongoose');
const helmet         = require('helmet');
const compression    = require('compression');
const session        = require('express-session');
const MongoStore     = require('connect-mongodb-session')(session);
let varMiddleware    = require('./middleware/variables')
const keys           = require('./keys')
const userMiddleware = require('./middleware/user');
const flash          = require('connect-flash')
const url            = keys.MONGO_URI
const errorHandler   = require('./middleware/error')
const fileMiddleware = require('./middleware/file')

const app = express();
const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs',
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    helpers: require('./utils/hbs-helpers')
})

const store = new MongoStore({
    collection: 'sessions',
    uri : url
})

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');

app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(express.urlencoded({extended: true}));
app.use(session({
    secret: keys.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store
}));
app.use(fileMiddleware.single('avatar'))
app.use(csurf());
app.use(flash());
app.use(helmet());
app.use(compression());
app.use(varMiddleware);
app.use(userMiddleware);

app.use('/', homeRoutes);
app.use('/add', addRoutes);
app.use('/courses', coursesRoutes);
app.use('/card', cardroutes);
app.use('/orders', ordersRoutes);
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes)
app.use(errorHandler)

app.get('/', (req, res) => {
    res.render('index', {
        title: 'Main Page',
        isHome: true
    });
});

app.get('/add', (req, res) => {
    res.render('add', {
        title: 'Add Course',
        isAdd: true
    });
});

app.get('/courses', (req, res) => {
    res.render('courses', {
        title: 'Courses',
        isCourses: true
    });
});

const PORT = process.env.PORT || 3000;

async function start() {
    try {
        await mongoose.connect(url, {
            useNewUrlParser: true
        });


        app.listen(PORT, () => {
            console.log('Server is running on port ' + PORT);
        });
    } catch (e) {
        console.error('ERROR occurred');
        console.error(e)
    }
}
start();
