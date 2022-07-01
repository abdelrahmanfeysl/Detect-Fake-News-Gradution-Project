const mongoose = require('mongoose');
const validator=require('validator');
const bcrypt=require('bcryptjs');
const crypto = require("crypto");


const userSchema=new mongoose.Schema({
    name:{
        type: 'string',
        required: [true,'user must have a name']
    },
    email:{
        type: 'string',
        required: [true,'user must have a email'],
        unique: true,
        lowercase: true,
        validate:[validator.isEmail ,'Please provide a valid email']
    },
    role: {
        type: 'string',
        default: 'user'
    },
    password:{
        type:String,
        required:[true,'Please provide a password'],
        minLength:8,
        select :false //means not to show password at any output to be secure
    },
    active:{
        type:Boolean,
        default:true,
        select :false
    },
    confirmPassword:{
        type:String,
        required:[true,'Please provide a confirm password'],
        minLength:8,
        validate:{
            validator:function (vl) {
                return vl===this.password;
            },
            message:'passwords are not the same'
        }
    },
    passwordChangedAt:{ //to save time of change password
        type: Date
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
})



//ENCRYPTED PASSWORD BEFORE SAVE IN DB
userSchema.pre('save',async function(next){
    if(!this.isModified('password')) return next();

    this.password=await bcrypt.hash(this.password,12);
    this.confirmPassword=undefined;
    next();
})

//TO SAVE THE TIME OF CHANGE PASSWORD
userSchema.pre('save',function(next) {
    if(!this.isModified('password') || this.isNew) return next();

    this.changedPasswordAt=Date.now() - 1000;

    next();
})

userSchema.pre(/^find/, function(next) {
    // this points to the current query
    this.find({ active: { $ne: false } });
    next();
})

//TO CHECK PASSWORD IS CORRECT OR NOT
userSchema.methods.correctPassword=async (candidatePassword,userPassword)=>{
    return await bcrypt.compare(candidatePassword,userPassword);
}



//TO CHECK IF PASSWORD CHANGED AFTER CREATED TOKEN OR NOT
userSchema.methods.changedPasswordAfter=function(JWTTimeStamp){
    if(this.passwordChangedAt)
    {
        const changedTimeStamp=parseInt(this.passwordChangedAt.getTime() / 1000 , 10)

        return JWTTimeStamp < changedTimeStamp;

    }
    return false;
}


userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    console.log({ resetToken }, this.passwordResetToken);

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};


const User=mongoose.model('User',userSchema);

module.exports =User;