const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User =require('./../models/userModel');
const apiError = require('./../utils/apiError');
const {promisify} = require('util');
const sendEmail = require("../utils/email");

//SEND ACCESS TOKEN TO USER
const createSendToken=(user,statusCode,req,res)=>{
    const token=tokenSign(user._id);

    //PUT TOKEN IN COOKIE
    const cookiesOption = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRS_IN * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure:req.secure

    };

    res.cookie('jwt', token, cookiesOption);

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
}


//CREATE ACCESS TOKEN
const tokenSign=(id)=>{
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRS_IN
    });
};


//SIGNUP MIDDLEWARE
exports.signUp= async (req,res)=>{
    const user=await User.create({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password,
        confirmPassword:req.body.confirmPassword
    })

    createSendToken(user,201,req,res);
}


//LOGIN MIDDLEWARE
exports.logIn=async(req,res)=>{

    const {email,password} = req.body;

    if(!password||!email){
       throw new apiError('you must enter the password and the email',400);
    }

    const user =await User.findOne({email}).select('+password');

    if(!user ||!(await user.correctPassword(password,user.password))){
        throw new apiError('Incorrect email or password', 401);
    }

    createSendToken(user,200,req,res);
}


//PROTECT ROUTES MIDDLEWARE
exports.protect=async (req,res,next)=>{
    let token;

    //1)Getting token and check if its there exist
    if(req.headers.authorization&&req.headers.authorization.startsWith('Bearer')){
        if(req.headers.authorization.split(' ')[1]!=='{{jwt}}')
            token=req.headers.authorization.split(' ')[1];
    }else if (req.cookies.jwt){
        token = req.cookies.jwt;
    }
    if (!token) {
        throw new apiError('You are not log in', 401);
    }


    //2) Verification token to check if it is correct token or not
    const decodePayload = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
         //if the token is not valid or token was expires it return error , we handled errors in errorhandlerMiddleware


    //3)Check if user still exists ,if not deleted
    const freshUser= await User.findOne({_id:decodePayload.id});
    if (!freshUser) {
        throw new apiError('this user belonging to this token is not exist', 401);
    }

    //4)Check if the user changed password after the token was issued
    if (freshUser.changedPasswordAfter(decodePayload.iat)) {
        throw new apiError('User recently changed password! Please log in again', 401);
    }


    res.locals.user = freshUser;
    req.user = freshUser;

    next();
}


exports.forgotPassword = async (req, res, next) => {
    // 1) Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new apiError('There is no user with this email address.', 404));
    }

    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) Send it to user's email
    const resetURL = `${req.protocol}://${req.get(
        'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 min)',
            message
        });

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!'
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(
            new apiError('There was an error sending the email. Try again later!'),
            500
        );
    }
}

//RESTRICT AUTHORIZATION MIDDLEWARE
exports.restrict=(...roles)=>{
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)){
            throw new apiError('You don`t have permission to perform this action',403);
        }
        next();
    }
}


//UPDATE USER PASSWORD
exports.updatePassword = async (req, res)=>{
    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
        throw new apiError('Incorrect email or password', 401);
    }

    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    await user.save();

    createSendToken(user,200,req,res);
}


//LOGOUT MIDDLEWARE
exports.logout = (req, res) => {
    res.clearCookie('jwt',undefined,{
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({
        status: 'success'
    });
};

exports.resetPassword = async(req,res, next)=>{
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: {$gt: Date.now()}
    });

    if(!user){
        return next(new apiError('Token is invalid or has expired',400))
    }
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    const token = tokenSign(user._id);

    res.status(200).json({
        status: 'success',
        token
    });
}

//TEST MIDDLEWARE
exports.print=async (req,res)=>{
    res.status(200).json({
        data:'protected worked'
    });
}