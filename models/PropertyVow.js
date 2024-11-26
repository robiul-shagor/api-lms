// PropertyVow model (in models/PropertyVow.js)
const mongoose = require('mongoose');
const { Schema } = mongoose;

const propertyVowSchema = new Schema({
    ListingKey: { type: String, required: true, unique: true },
    propertyDetails: { type: Object, required: true },
    media: [{ type: Object }],
});

const PropertyVow = mongoose.model('PropertyVow', propertyVowSchema);
module.exports = PropertyVow;