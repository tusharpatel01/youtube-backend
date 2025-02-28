import mongoose , {Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const userSchema=new mongoose.Schema({

    userName:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        minlength:3,
        // lowercase:true,
        // index:true
    },
    email:{
        type:String,
        required:[true,"Email is required"],
        unique:true,
        trim:true,
        minlength:3,
        lowercase:true,
    },
    fullName:{
        type:String,
        required:true,
        trim:true,
        minlength:3
    },
    password:{
        type:String,
        required:[true,"Password is required"],
        trim:true,
        minlength:3
    },
    coverImage:{
        type:String,
        default:"",
        
    },
    avatar:{
        type:String,
        default:"",
        required:true
    },
    watchHistory:{
        type:[{
            type:Schema.Types.ObjectId,
            ref:"Video"
        }],
    },
    
        refreshTokens:{
            type:[String],
            
        }
    
}, {timestamps: true});  

userSchema.pre("save", async function(next){
    if(this.isModified("password")){
        this.password= await bcrypt.hash(this.password,10);
    }
    next();
})
userSchema.methods.isPasswordCorrect= async function(password){
    return bcrypt.compare(password,this.password); 
}

userSchema.methods.generateAccessTokens=function(){
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            userName:this.userName,
            fullName:this.fullName,
        },
        process.env.ACCESS_TOKENS_SECRET,
        {expiresIn: process.env.ACCESS_TOKENS_EXPIRY}
    )
}
userSchema.methods.generateRefreshTokens=function(){
    return jwt.sign(
        {
            _id:this._id,
            
        },
        process.env.REFRESH_TOKENS_SECRET,
        {expiresIn: process.env.REFRESH_TOKENS_EXPIRY}
    )
}


export const User=mongoose.model("User",userSchema);
// export default User;