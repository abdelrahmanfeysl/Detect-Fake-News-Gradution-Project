/***********************************(every thing about Express)****************************/

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('express-async-errors');
const morgan = require('morgan');
const userRouter=require('./roots/userRoutes')
const newsRouter = require('./roots/newsRoutes');
const reviewRouter = require('./roots/reviewRoutes');
const cookieParser=require('cookie-parser');
const errorHandlerMiddleware = require('./controllers/errorHandler');
const apiError = require('./utils/apiError');

//create app
const app = express();

app.enable('trust proxy');//to trust proxy for heroku
app.use(cors());
//Set security http headers
app.use(helmet()) //we should put it in the first of middlewares

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use(express.json({limit:'10kb'}))

app.use(cookieParser());

//Routes of middlewares
app.use('/api/v1/users',userRouter);
app.use('/api/v1/news',newsRouter);
app.use('/api/v1/reviews',reviewRouter);

app.all('*',((req, res, next) => {
    throw new apiError(`can't find ${req.originalUrl} on this server` ,404);
}))

app.use(errorHandlerMiddleware);


module.exports =app;