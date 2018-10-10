const Sequelize = require('sequelize');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
let bcrypt = require('bcrypt');

const saltRounds = 10;

const sequelize = new Sequelize('blogapp', 'Joris', null, {
	host: 'localhost',
	dialect: 'postgres'
});

const User = sequelize.define('users', {
	firstname: Sequelize.STRING,
	lastname: Sequelize.STRING,
	email: Sequelize.STRING,
	password: Sequelize.STRING,
	passwordconfirm: Sequelize.STRING
});

const Post = sequelize.define('posts', { 
	title: Sequelize.STRING, 
	body: Sequelize.TEXT
});

const Comment = sequelize.define('comments', {
	comment: Sequelize.TEXT
})

Post.belongsTo(User);

Post.hasMany(Comment);
Comment.belongsTo(Post);

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

app.use(session({
	secret: 'dancing kitties on the table',
	resave: false,
	saveUninitialized: true
}))

app.set('view engine', 'ejs');
app.set('views', './views');

//GET HOME PAGE
app.get('/', function(req, res) {
  res.render('signup')
})

//GET SIGN UP PAGE
app.get('/signup', function(req, res) {
  res.render('signup')
})

//CREATE NEW USER
app.post('/signup', function(req, res) {
	
	let firstname = req.body.firstname
	let lastname = req.body.lastname
	let email = req.body.email.toLowerCase()
	let password = req.body.password
	let passwordconfirm = req.body.passwordconfirm

	if(firstname.length === 0) {
		res.redirect('/?message=' + encodeURIComponent("Please fill out your firstname."));
		return;
	}

	if(lastname.length === 0) {
		res.redirect('/?message=' + encodeURIComponent("Please fill out your lastname."));
		return;
	}

	if(email.length === 0) {
		res.redirect('/?message=' + encodeURIComponent("Please fill out your email."));
		return;
	}

	if(password.length < 8 || passwordconfirm < 8) {
		res.redirect('/?message=' + encodeURIComponent("Please fill out your password."));
		return;
	}

	if(password !== passwordconfirm) {
		res.redirect('/?message=' + encodeURIComponent("Your password does not match"));
		return;
	}

	User.findOne({
		where:
			{email: email}
	})
	.then((result) => {
		if(result === null) {
			bcrypt.hash(password, saltRounds).then((hash) => {
		    	User.create({
					firstname: firstname,
					lastname: lastname,
					email: email,
					password: hash,
					passwordconfirm: hash
				})
		    	.then((user) => {
					req.session.user = user; //creates a session when the user is logged in and remembers it
					res.redirect('/profile');
				})
			})
		} else {
			res.redirect('/signup?message=' + encodeURIComponent("Email already exists"));
		}
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

app.get('/settings', function(req, res) {
	let user = req.session.user

	res.render('settings', {user: user})
});

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
		bcrypt.compare(password, user.password).then((result) => {
		if (user !== null && result) {
			req.session.user = user;
			res.redirect('/profile');
		} else {
			res.redirect('/login?message=' + encodeURIComponent("Invalid email or password."));
		}
		})
		.catch(error => {
			console.log(error)
		})
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
	.then(() => {
		res.redirect('/posts')
	})
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

//SHOW A SPECIFIC POST + SHOW ALL COMMENTS
app.get('/allposts/:id', function (req, res) {
	Post.findById(req.params.id)
	.then((foundPost) => {
		Comment.findAll({
			where: {
				postId: req.params.id
			}
		})
		.then((findComment) => {
			res.render('show', {foundPost: foundPost, findComment: findComment})
		})
	})
})

//ADD A COMMENT TO A SPECIFIC POST
app.post('/allposts/:id', function (req, res) {
		Comment.create({
			comment: req.body.comment,
			postId: req.params.id,
		})
		.then(() => {
			res.redirect(`/allposts/${req.params.id}`)
	})
		.catch(error => {
			console.log(error)
  })
});		

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
