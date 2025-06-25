const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Users = require('../model/Users');
const { OAuth2Client } = require('google-auth-library');
const { request, response } = require('express');

const secret = "c09f74a3-a1ef-40b2-a5a7-91279b21391a";

const authController = {
    login: async (request, response) => {
        try {
            const { email, password } = request.body;

            const data = await Users.findOne({ email });
            if (!data) {
                return response.status(401).json({ message: 'User not found' });
            }

            const isMatch = await bcrypt.compare(password, data.password);
            if (!isMatch) {
                return response.status(401).json({ message: 'Incorrect password' });
            }

            const user = {
                id: data._id,
                name: data.name,
                email: data.email
            };

            const token = jwt.sign({ id: data._id }, secret, { expiresIn: '1h' });

            response.cookie('jwtToken', token, {
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
                path: '/',
            });

            response.json({ user, message: "User authenticated" });
        } catch (error) {
            console.log(error);
            response.status(500).json({ error: 'Internal server error' });
        }
    },

    logout: (request, response) => {
        response.clearCookie('jwtToken');
        response.json({ message: "Logout successful" });
    },

    isUserLoggedIn: (request, response) => {
        const token = request.cookies.jwtToken;

        if (!token) {
            return response.status(401).json({ message: 'Unauthorized access' });
        }

        jwt.verify(token, secret, (error, user) => {
            if (error) {
                return response.status(401).json({ message: 'Unauthorized access' });
            }
            response.json({ message: "User is logged in", user });
        });
    },

    register: async (request, response) => {
        try {
            //extract attributes from request body
            const {username, password, name} = request.body;
            const data = await Users.findOne({ email: username });
            if (data) {
                return response.status(401).json({ message: 'Account already exists with given email'});
            }

            // encrypt the password before saving the record ot the database
            const encryptedPassword = await bcrypt.hash(password, 10);
            const user = new Users({
                email: username,
                password: encryptedPassword,
                name: name
            });
            await user.save();
            response.status(201).json({ message: 'User registered'});
        }catch (error) {
            console.log(error);
            response.status(500).json({ error: 'Internal server error' });
        }
    },

    googleAuth: async (request,response) =>{
        try{
            const{ idToken} =request.body;
            if(!idToken){
                return response.status(401).json({ message: 'Invalid request '});
            }
            const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
            const googleResponse= await googleClient.verifyIdToken({
                idToken: idToken,
                audience: process.env.GOOGLE_CLIENT_ID
            });
            const payload=googleResponse.getPayload();
            const{ sub: googleId, name, email} = payload;
            let data= await Users.findOne({email: email});
            if(!data){
                data = new Users({
                    email: email,
                    name :name,
                    isGoogleUser: true,
                    googleId: googleId
                });
                await data.save();
            }
            const user={
                id: data._id? data._id: googleId,
                username: email,
                name: name 
            };
            const token = jwt.sign(user,secret,{expiresIn: '1h'});
            response.cookie('jwtToken',token,{
                httpOnly: true,
                secure: true,
                domain: 'localhost',
                path:'/'
            }

            );
            response.json({user: user,message: 'User authenticated'});
        }catch(error){
            console.log(error );
            return response.status(500).json({message: 'Internal server error'});
        }
    },
};

module.exports = authController;
