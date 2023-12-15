const crypto = require('crypto');

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const session = require('express-session')
const flash = require('connect-flash')
const config = require('./config');
const parseToken = require('./middleware/parseToken');
const auth = require('./middleware/auth');
const authorize = require('./middleware/authorize');

const render = require('./utils/render');

const storage = multer.diskStorage({

	// cái này là config đường dẫn đến folder lưu trữ và đọc ảnh ra
	// muốn thêm ảnh thì phải để vào đây
	destination: function (req, file, cb) {
		cb(null, './public/img')
	},
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
		cb(null, file.fieldname + '-' + uniqueSuffix)
	}
})

const upload = multer({ storage: storage })

const TODO = require('./model/todo');
const USER = require('./model/user');
const BOOK = require('./model/book');

const app = express();
app.use(session({
	secret: 'flashblog',
	saveUninitialized: true,
	resave: true
}))
app.use(flash());

mongoose.connection.on('connected', () => {
	console.log('Mongodb connected successful!');
})

mongoose.connection.on('error', (err) => {
	console.log(err);
})

mongoose.connect(config.dbURI);

app.set('views', './views');
app.set('view engine', 'pug');

app.use(cookieParser());
app.use(parseToken);

app.use(express.static('./public'));
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', async (req, res) => {
	const todos = await TODO.find({});
	console.log('todos', todos);
	console.log(req.role);
	// res.render('home', { todos, username: req.username });
	render(req, res, 'home', { todos });
})

app.get('/create-todo', auth, (req, res) => {
	res.render('create-todo');
})

app.post('/create-todo', async (req, res) => {
	//validate data
	console.log('body', req.body);
	await TODO.create(req.body);
	console.log("Successfully")
	res.redirect("/");
})

app.post('/delete-todo/:id', async (req, res) => {
	await TODO.findByIdAndDelete(req.params.id);
	res.redirect("/");
})

app.get('/update-todo/:id', async (req, res) => {
	const todo = await TODO.findById(req.params.id);
	res.render('update-todo', { todo });
})

app.post('/update-todo/:id', async (req, res) => {
	await TODO.findByIdAndUpdate(req.params.id, req.body);

	res.redirect("/");
})

app.get('/users', authorize('admin'), async (req, res) => {
	const users = await USER.find({});

	res.render('users', { users });
})

app.get('/create-user', (req, res) => {
	res.render('create-user');
})

app.post('/create-user', async (req, res) => {
	const salt = crypto.randomBytes(16).toString('hex');
	const hmac = crypto.createHmac('sha256', salt);
	const hpass = hmac.update(req.body.password).digest('hex');

	await USER.create({ ...req.body, salt, hpass });

	res.redirect('/users');
})

app.get('/delete-user/:id', async (req, res) => {
	await USER.findByIdAndDelete(req.params.id);
	res.redirect("/users");
})

app.get('/update-user/:id', async (req, res) => {
	const user = await USER.findById(req.params.id);
	res.render('update-user', { user });
})

app.post('/update-user/:id', async (req, res) => {
	await USER.findByIdAndUpdate(req.params.id, req.body);

	res.redirect("/users");
})

app.get('/books', async (req, res) => {
	const books = await BOOK.find({});

	res.render('books', { books });
})

app.get('/create-book', (req, res) => {
	res.render('create-book');
})

app.post('/create-book', upload.single('cover'), async (req, res) => {
	req.body.cover = req.file.filename;

	await BOOK.create(req.body);

	res.redirect("/books");
})

app.get('/login', (req, res) => {
	res.render('login');
})

app.post('/login', async (req, res) => {
	if (req.body && req.body.username && req.body.password) {
		const dbUser = await USER.findOne({ username: req.body.username });
		if (dbUser) {
			const hmac = crypto.createHmac('sha256', dbUser.salt);
			const hpass = hmac.update(req.body.password).digest('hex');
			if (hpass === dbUser.hpass) { //login thanh cong
				const token = jwt.sign({ username: dbUser.username, role: dbUser.role }, config.secretkey);
				res.cookie('token', token);
				res.redirect('/');
			} else { //password sai
				// res.end('Wrong password');
				res.render('login', { errMessage: 'Wrong password' })
			}
		} else { //Username khong ton tai
			//res.end(`${req.body.username} not existed}`);
			res.render('login', { errMessage: `${req.body.username} not existed}` })
		}

	} else {
		//res.end('Bad Form Data');
		res.render('login', { errMessage: 'Bad Form Data' });
	}
})

app.listen(3000, () => {
	console.log('App is listening on port 3000');
});
