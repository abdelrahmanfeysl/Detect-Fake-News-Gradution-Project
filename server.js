/**************************every thing about server like database configuration***************************************/
const mongoose=require('mongoose')
const dotenv = require('dotenv');//that for environment variables

dotenv.config({path:`${__dirname}/config.env`});
//we make that here before require app because read config.env before require app to avoid err


const app=require('./app');

DATABASE="mongodb+srv://gp:<password>@cluster0.x78mq.mongodb.net/FakeNewsDetector"
const DB=DATABASE.replace('<password>',process.env.DATABASE_PASSWORD);
mongoose.connect(DB).then(con=> console.log('connection is success'))

const port=process.env.PORT || 6000;
app.listen(port, () => {
    console.log('welcome from the server');
});