# Social Sign-In with Node.js and Express

## Overview
This small task implements google social sign-in functionality using Node.js and Express, incorporating OAuth2 flow with Passport.js for authentication. The project also adheres to security best practices by integrating Helmet.js for enhanced security measures.

## Features
* OAuth2 Flow: Implemented OAuth2 flow using Passport.js, facilitating secure and standardized authentication with popular social platforms.

* Security Best Practices: Followed security best practices using Helmet.js to enhance the overall security posture of the application by setting HTTP headers and protecting against common web vulnerabilities.

* Cookie-Based Authentication: Utilized the cookie-session module to directly sign in using the session info in the browser and secure it by signing it using private keys preventing the tampering 
