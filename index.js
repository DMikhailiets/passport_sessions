const express = require('express')
const dotenv = require('dotenv')
const app = express()
const {hash} = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOvverride = require('method-override')



const initializePassport = require('./passport-config')
initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
)

const users = []

app.use(express.urlencoded({extended: false}))
app.set('view-engine', 'ejs')
app.use(flash())
app.use(session({
    secret: 'aa',
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOvverride('_method'))
dotenv.config()
const PORT = process.env.PORT

app.get('/', checkAuth,  (req, res) => {
    res.render('index.ejs', {name: 'Denis'})
})

app.get('/login', checkNotAuth, (req, res) => {
    res.render('login.ejs')
})


app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.get('/register', checkNotAuth, (req, res) => {
    res.render('register.ejs')
})

app.delete('/logout', (req,res) => {
    req.logOut()
    res.redirect('/login')
})

app.post('/register', async (req,res) => {
    try {
        const hashedPassword = await hash(req.body.password, 12)
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        res.redirect('/login')
    } catch (err) {
        res.status(400).json({
            message: err.message
        })
    }
    console.log(users)
})

app.listen(PORT, () => {
    console.log(`Server listening at ${PORT}`)
})

function checkAuth (req, res, next){
    if (req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
}

function checkNotAuth (req, res, next){
    if (!req.isAuthenticated()){
        return next()
    }
    res.redirect('/')
}

