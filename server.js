const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const passport = require('passport');
const {Strategy} = require('passport-google-oauth20')
const cookieSession = require('cookie-session');

require("dotenv").config()

const app = express();

const config = {
  CLIENT_ID : process.env.CLIENT_ID ,
  CLIENT_SECRET : process.env.CLIENT_SECRET,
  COOKIE_KEY_1 : process.env.COOKIE_KEY_1,
  COOKIE_KEY_2 : process.env.COOKIE_KEY_2
}

const AUTH_OPTION = 
  {
    callbackURL: '/auth/google/callback' ,
    clientID: config.CLIENT_ID, 
    clientSecret : config.CLIENT_SECRET
  }

function verifyCallback(access_token, refresh_token, profile,done) {
  console.log("Google Profile : ",profile);
  done(null, profile )
}

function checkLogin(req, res, next)
{
  console.log("Our current profile is : " , req.user)
  // if the id of profile is null thats mean you have not log in
  const isLog = req.isAuthenticated() && req.user
  if (!isLog)
  {
   return res.status(401).send({
     error : 'You Must log in'
   })
  }
 next()
}

// defining our strategy used iin authentication ...we will use Oauth2
passport.use(new Strategy(AUTH_OPTION,verifyCallback))

 // save the user data (session) and set it in the cookie to be saved in browser
passport.serializeUser((user,done)=>{
 // save on the id instead of the whole session to minimize the cookie size.. not the whole profile of user
 done(null, user.id)
})
// Read the session form the cookie so we have access on it.. cookie receiced in param : obj so it wil be accessed by req.user later on
passport.deserializeUser((obj,done)=>{
  done(null,obj)
})




app.use(helmet());
app.use(cookieSession({
  name : 'session',
  maxAge : 1000 * 60 * 60 * 24 ,
  keys :[config.COOKIE_KEY_1,config.COOKIE_KEY_2] 
}));

// call the serialized
app.use(passport.initialize())
// calling the deserialized
app.use(passport.session())




app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
});

/*
password authenticate here done the first 2 steps of oauth flow :
1) go to the auth/google
2) go the sign one page of google 
// redirect from the /auth/google to v2/oauth2/google.com (google sign in )
// if you are signed before then a redirect will go /auth/google/callback and will validate
// if success will go the secret /api

*/
app.get('/auth/google', passport.authenticate("google",{
   scope : ['email']
}))



/*
Password.authenticate in this api handles : 3 steps all in one
1) the sending of the auth code from the authorization server step 4 in flow
2) the sending of the authorization code + the client secret from the app to /token of the server step 5 in flow
3) the sending of the JWT token and profile from the server to the app step 6 in flow

*/

/*
.... ofc first you must pass the options in passport.use.. 
 to mention the callbackurl , secret of the app,and the verify function 
 if you want to store the profile of user in db 
 or check on the received credentials

 if any failure happens during this 3 steps go to /failure 
 if success go to /api our main page
*/

app.get('/auth/google/callback', passport.authenticate("google",{
  failureRedirect : "/failure" ,
  successRedirect : "/api" ,
}),(req, res) => {
 
  });
  


app.get('/auth/logout', (req, res) => {
      req.logout();
      return res.redirect('/');
})

app.get('/failure',(req,res)=>{
  res.send("Failed to Login")
})


app.get('/api', checkLogin,(req, res) => {
  res.send("Your Secret Value is 11!");
});

const options = {
  key: fs.readFileSync('cert/private_key.pem'),
  cert: fs.readFileSync('cert/cert.pem')
};





https.createServer(options, app).listen(3000, (err) => {
    console.log('Server listening on port 3000...');
  
});
