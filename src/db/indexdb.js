import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";



const connectDB = async () => {
    try {

        const connectioninstance=await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`, {
           
           
        });
        console.log("MongoDB Connected Successfully!");
        console.log(connectioninstance.connection.host);
        
    } catch (error) {
        console.error("MongoDB Connection Failed:", error);
        process.exit(1); // Exit process with failure
    }
};
export default connectDB;
