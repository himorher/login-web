const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const path = require('path');
const dotenv = require('dotenv')

const connection = mysql.createConnection({
	host     : 'database-1.c3c0ig0kijf7.eu-west-3.rds.amazonaws.com',
	user     : 'admin',
	password : `${process.env.password_db}`,
    //password: "46377930",
	database : 'project1'
});

const app = express();
const morgan = require('morgan');
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));
app.use(morgan('combined'));

app.get('/', function(request, response) {
    console.log('GET / - Render login page');
    response.sendFile(path.join(__dirname + '/login.html'));
});

app.post('/auth', function(request, response) {
    let username = request.body.username;
    let password = request.body.password;

    console.log('POST /auth - Username:', username);

    if (username && password) {
        connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
            if (error) {
                console.error('Database query error:', error);
                throw error;
            }

            if (results.length > 0) {
                console.log('Authentication successful for user:', username);
                request.session.loggedin = true;
                request.session.username = username;
                response.redirect('/home');
            } else {
                console.log('Incorrect Username and/or Password');
                response.send('Incorrect Username and/or Password!');
            }            
            response.end();
        });
    } else {
        console.log('Username or Password not provided');
        response.send('Please enter Username and Password!');
        response.end();
    }
});

app.get('/home', function(request, response) {
    if (request.session.loggedin) {
        console.log('GET /home - User is logged in:', request.session.username);
        response.send('Welcome back, ' + request.session.username + '!');
    } else {
        console.log('GET /home - User not logged in');
        response.send('Please login to view this page!');
    }
    response.end();
});

app.get('/register', function(request, response) {
    console.log('GET /register - Render registration page');
    response.sendFile(path.join(__dirname + '/register.html'));
});

app.post('/register', function(request, response) {
    let username = request.body.username;
    let password = request.body.password;
    let email = request.body.email;

    console.log('POST /register - Username:', username, 'Email:', email);

    if (username && password && email) {
        connection.query('SELECT * FROM accounts WHERE username = ? OR email = ?', [username, email], function(error, results, fields) {
            if (error) {
                console.error('Database query error:', error);
                throw error;
            }


            if (results.length > 0) {
                console.log('Username or Email already exists:', username, email);
                response.send(`
                    <html>
                    <head><title>Registration Error</title></head>
                    <body>
                        <p>Username or Email already exists. Please try again.</p>
                        <a href="/register">Go back to registration</a>
                    </body>
                    </html>
                `);
            } else {
                connection.query('INSERT INTO accounts (username, password, email) VALUES (?, ?, ?)', 
                [username, password, email], function(error, results, fields) {
                    if (error) {
                        console.error('Database insert error:', error);
                        throw error;
                    }

                    console.log('Registration successful for user:', username);
                    response.send(`
                        <html>
                        <head><title>Registration Successful</title></head>
                        <body>
                            <p>Registration successful! Click OK to go to the login page.</p>
                            <script>
                                if (confirm('Registration successful! Click OK to go to the login page.')) {
                                    window.location.href = '/';
                                }
                            </script>
                        </body>
                        </html>
                    `);
                });
            }
        });
    } else {
        console.log('Missing fields: Username:', username, 'Password:', password, 'Email:', email);
        response.send('Please fill all the fields!');
        response.end();
    }
});

app.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
});