const apiError=require('./../utils/apiError');


const handleDuplicatedFieldsDB=err=>{
    const value =err.errmsg.match(/(["'])(\\?.)*\1/);
    const message=`Duplicate field value= ${value}. please use another value!`
    return new apiError(message,400)
}

const handleValidationErrorsDB=err=>{
    const errors =Object.values(err.errors).map(el =>el.message);
    const message=`invalid input data : ${errors.join('. ')} `;
    return new apiError(message,400);
}

const handleJwtError=()=>{
    return  new apiError('Invalid token,please log in again',401);
}

const handleJwtExpiredError=()=>{
    return  new apiError('your token has expired!,please log in again',401);
}

const sendDev=(err,req,res)=> {
    return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });

}

const sendProd=(err,req,res)=> {
        // A) Operational, trusted error: send message to client
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            });
        }
        // B) Programming or other unknown error: don't leak error details
        // 1) Log error
        console.error('ERROR 💥', err);
        // 2) Send generic message
        return res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!'
        });

}

module.exports =(err,req,res,next)=>{
    err.status = err.status||'error';
    err.statusCode=err.statusCode||500;

    if(process.env.NODE_ENV==='development')
        sendDev(err,req,res);
    else if(process.env.NODE_ENV==='production'){
        let error={...err};
        error.message=err.message;
        if(err.code===11000) error=handleDuplicatedFieldsDB(err);
        if(err.name==="ValidationError") error=handleValidationErrorsDB(err);
        if(err.name==="JsonWebTokenError") error=handleJwtError();
        if(err.name==="TokenExpiredError") error=handleJwtExpiredError();
        sendProd(error, req,res);
    }
}