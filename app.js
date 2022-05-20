/***********************************(every thing about Express)****************************/

const express = require('express');
require('express-async-errors');
const morgan = require('morgan');
const userRouter=require('./roots/userRoutes')
const newsRouter = require('./roots/newsRoutes');
const cookieParser=require('cookie-parser');
const errorHandlerMiddleware = require('./controllers/errorHandler');

//create app
const app = express();



if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use(express.json({limit:'10kb'}))

app.use(cookieParser());

//Routes of middlewares
app.use('/api/v1/users',userRouter);
app.use('/api/v1/news',newsRouter);
app.use(errorHandlerMiddleware);



module.exports =app;