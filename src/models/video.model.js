import mongoose ,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoschema=new mongoose.Schema({

    videofile:{
        type:String,
        required:true,
        trim:true,
        minlength:3
    },
    thumbnail:{
        type:String,
        required:true,
        trim:true,
        minlength:3
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    title:{
        type:String,
        required:true,
        trim:true,
        minlength:3
    },
    description:{
        type:String,
        required:true,
        trim:true,
        minlength:3
    },
    duration:{
        type:Number,
        required:true,
        trim:true,
        minlength:3
    },
    views:{
        type:Number,
        default:0
    },
    ispublished:{
        type:Boolean,
        default:false
    },

},{timestamps:true});
videoschema.plugin(mongooseAggregatePaginate);

const video=mongoose.model("video",videoschema);
export default video;