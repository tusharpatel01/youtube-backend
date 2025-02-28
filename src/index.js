import mongoose from "mongoose";
import { DB_NAME } from "./constant.js";
// import express from "express"
// const app=express();
import dotenv from "dotenv";
import connectDB from "./db/indexdb.js";
import { app } from "./app.js";


dotenv.config({
    path:"./env"
});
// console.log(process.env.CLOUDINARY_API_KEY);
// console.log(process.env.CLOUDINARY_API_SECRET);




connectDB()
.then(()=>{
    app.listen(process.env.PORT || 5000, () => {
        console.log(`Server started at http://localhost:${process.env.PORT}`);
        
    })
    
})
.catch((err)=>{
    console.log(err);
    // process.exit(1);
    
})
app.get("/",(req,res)=>{
    res.send("Hello World");
})




















/*(async()=>{

    try {
        await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`, )
        app.on("error",(error)=>{
            console.log(error);
            throw error;
            
        })

        } catch (error) {
            console.log(error);
            throw error;
            
        }

        try {
            app.listen(process.env.PORT,()=>{
                console.log(`Server started at http://localhost:${process.env.PORT}`);
                
            })
        
    } catch (error) {
        console.log(error);
        throw error;
        
    }

})()
    */