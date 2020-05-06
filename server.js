if(process.env.NODE_ENV!== 'production'){
    require('dotenv').config()
}
const express = require('express');
const app = express()
const bcrypt = require('bcrypt');
const passport = require('passport')
const initialisePassport = require('./passport-config')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
initialisePassport(passport,email=>users.find(user=>user.email === email),
    id => users.find(user=> user.id === id)
)
const users = []

app.set('view-engine','ejs');

app.use(express.urlencoded({extended:false}))
// use of urlencoded is to allow use of req,res object 
// to take or make some changes in the login and reg page
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET, 
    resave: false, // Unsave unchanged session
    saveUninitialized: false //Used for not allowing to store empty value
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
app.get('/',(req,res) => {
    res.render('index.ejs',{name : req.user.name})
});

app.get('/login',(req,res)=>{
    res.render('login.ejs')
})
app.post('/login',passport.authenticate('local',{
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.get('/register',(req,res)=>{
    res.render('register.ejs')
})

app.post("/register",async (req,res)=>{
    try{
        const hashedPassword = await bcrypt.hash(req.body.password,10)
        users.push({
            id:Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        res.redirect('/login')   
    }catch{
        res.redirect('/register')
    }
    console.log(users)
    //req.body.name  Importance of name field here is that 
    // while referring req object name attribute of input is used
})

app.delete('/logout',checkNotAuthenticated,(req,res)=>{
    req.logOut()
    res.redirect('/login')
})

function checkAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
}

function checkNotAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return res.redirect('/login')
    }
    next()
}
app.listen(3030)

