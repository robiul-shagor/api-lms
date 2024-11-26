// PropertyIDX model (in models/PropertyIDX.js)
const mongoose = require('mongoose');
const { Schema } = mongoose;

const propertyIDXSchema = new Schema({
    ListingKey: { type: String, required: true, unique: true },
    propertyDetails: { type: Object, required: true },
    media: [{ type: Object }],
});

const PropertyIDX = mongoose.model('PropertyIDX', propertyIDXSchema);
module.exports = PropertyIDX;