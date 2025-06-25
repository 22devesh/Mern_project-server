require('dotenv').config();
const mongoose= require('mongoose')
const express=require('express');//include the express module
const cookieParser=require('cookie-parser');
const authRoutes=require('./src/routes/authRoutes');
const cors=require('cors');
console.log(process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch((error)=> console.log(error));
const app=express(); //instantiate an express application

app.use(express.json()); //middleware to parse JSON request bodies or convert json to javascript object
app.use(cookieParser());
const corsOption={

    origin:process.env.CLIENT_ENDPOINT,
    credentials: true,
};
app.use(cors(corsOption));
app.use('/auth',authRoutes); // mounts auth routes at /auth prefix
 
const PORt=5001;

app.listen(PORt,(error)=>{
    if(error){
        console.log(`Error in server setup`,error);
    }
    else{
        console.log(`server is running at http://localhost:${PORt}`);
    }
});