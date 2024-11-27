// PropertyVow model (in models/PropertyVow.js)
const mongoose = require('mongoose');
const { Schema } = mongoose;

const propertySoldSchema = new Schema({
    ListingKey: { type: String, required: true, unique: true },
    propertyDetails: { type: Object, required: true },
    media: [{ type: Object }],
});

const PropertyVow = mongoose.model('PropertySolds', propertySoldSchema);
module.exports = PropertyVow;