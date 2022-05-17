/**************************every thing about server like database configuration***************************************/
const mongoose=require('mongoose')
const dotenv = require('dotenv');//that for environment variables

dotenv.config({path:`${__dirname}/config.env`});
//we make that here before require app because read config.env before require app to avoid err


const app=require('./app');

const DB=process.env.DATABASE_LOCAL

mongoose.connect(DB).then(con=>console.log('connection to DB is success') );

const port=process.env.PORT || 6000;
app.listen(port, () => {
    console.log('welcome from the server');
});