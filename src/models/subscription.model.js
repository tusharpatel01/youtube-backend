// import mongoose ,{Schema} from "mongoose";
import mongoose from "mongoose";
const {Schema}=mongoose;

const subscriptionSchema=new Schema({
    subscriber:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    channel:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})

export default mongoose.model("Subscription",subscriptionSchema)
