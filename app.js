const Sequelize = require('sequelize');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');

const sequelize = new Sequelize('blogapp', 'Joris', null, {
	host: 'localhost',
	dialect: 'postgres'
});

const User = sequelize.define('users', {
	firstname: Sequelize.STRING,
	lastname: Sequelize.STRING,
	email: Sequelize.STRING,
	password: Sequelize.STRING
});

const Post = sequelize.define('posts', { 
	title: Sequelize.STRING, 
	body: Sequelize.STRING
});

Post.belongsTo(User);

const Comment = sequelize.define('comments', {
	comment: Sequelize.STRING
})

const app = express();

app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static('public'));

app.use(session({
	secret: 'dancing kitties on the table',
	resave: false,
	saveUninitialized: false
}))

app.set('view engine', 'ejs');
app.set('views', './views');

//GET HOME PAGE
app.get('/', function(req, res) {
  res.render('index')
})

//GET SIGN UP PAGE
app.get('/signup', function(req, res) {
  res.render('signup')
})

//CREATE NEW USER
app.post('/signup', function(req, res) {
	User.create({
		firstname: req.body.firstname,
		lastname: req.body.lastname,
		email: req.body.email,
		password: req.body.password
	})
	.then((user) => {
		req.session.user = user; //creates a session when the user is logged in and remembers it
		res.redirect('/profile');
	})
})

//GET PROFILE PAGE
app.get('/profile', function(req, res) {
	let user = req.session.user
	if(user === null || user === undefined) {
		res.redirect('login')
	} else {
		res.render('profile', {user: user})
	}
	// User.findOne({where: {id: req.session.user.id}}).then(users => {
		
	})
// })

//GET SIGN IN PAGE
app.get('/login', function(req, res) {
  let user = req.session.user
  res.render('login')
});

app.post('/login', function(req, res) {
	
	var email = req.body.email;
	var password = req.body.password;

	if(email.length === 0) {
		res.redirect('/?message=' + encodeURIComponent("Please fill out your email address."));
		return;
	}

	if(password.length === 0) {
		res.redirect('/?message=' + encodeURIComponent("Please fill out your password."));
		return;
	}
	

	User.findOne({
		where: {
			email: email
		}
	})
	.then(function (user) {
		if (user !== null && password === user.password) {
			req.session.user = user;
			res.redirect('/profile');
		} else {
			res.redirect('/login?message=' + encodeURIComponent("Invalid email or password."));
		}
	})
})

//GET CREATE POST
app.get('/createpost', function(req, res) {

	const user = req.session.user;

	if( user === undefined) {
		res.redirect('/?message=' + encodeURIComponent("Please log in as an user to add new post."));
	} else {
		res.render('createpost')
	}
})

app.post('/createpost', function(req, res) {
	Post.create({
		title: req.body.title,
		body: req.body.body,
		userId: req.session.user.id
	})
	res.redirect('/posts')
})

//GET OWN POSTS
app.get('/posts', function(req, res) {

	const user = req.session.user;

	if( user === undefined) {
		res.redirect('/?message=' + encodeURIComponent("Please log in as an user to add new post."));
	} else {
	
	Post.findAll({
		where: {
			userId: req.session.user.id
	}
})
	.then(posts => {
		res.render('posts', {posts: posts})
	})
	}
})

//GET ALL POSTS
app.get('/allposts', function(req, res) {

	const user = req.session.user;

	if( user === undefined) {
		res.redirect('/?message=' + encodeURIComponent("Please log in as an user to add new post."));
	} else {

	Post.findAll().then(posts => {
		res.render('allposts', {posts: posts})
	})
	}
})

//LOG OUT FROM SESSION
app.get('/logout', function (request, response) {
	request.session.destroy(function(error) {
		if(error) {
			throw error;
		}
		response.redirect('/?message=' + encodeURIComponent("Successfully logged out."));
	})
});

sequelize.sync()

app.listen(3000, function(req, res){
	console.log('Port is listening on 3000')
})
