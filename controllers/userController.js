const User=require('./../models/userModel');



//GET INFORMATION ABOUT THE USER
exports.getMe=async (req,res,next)=>{

    const user= await User.findOne({_id:req.user.id});

    res.status(200).json({
        status: 'success',
        data:user
    })
}



//DEACTIVATE USER
exports.deleteMe=async (req,res)=>{
    await User.findByIdAndUpdate(req.user.id,{active :false});

    res.status(204).json({
        data:null
    })
}

