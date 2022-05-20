const mongoose = require('mongoose');
const validator = require('validator');

// create (Schema) & (Model) of News Database
//******************************************        Schema         **************************************** */
const newsSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.ObjectId,
            reference: "User",
            required: [true, "User reference can't be empty"]
        },
        description: {
            type: String,
            required: [true, 'The News must have a description.'],
            trim: true
        },
        status: {
            type: Boolean,
            default: false
        },
        date: {
            type: Date,
            default: Date.now()
        }
    }
);

//******************************************        Model         **************************************** */

const News = mongoose.model('News', newsSchema);

module.exports = News;
