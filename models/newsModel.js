const mongoose = require('mongoose');
require('mongoose-double')(mongoose);
const SchemaTypes = mongoose.Schema.Types;

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
            trim: true  // to remove white spaces from both ends of string
        },
        status: {
            type: Boolean,
            default: false
        },
        status_Percent: {
            type: SchemaTypes.Double,
            default: 0.5
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
