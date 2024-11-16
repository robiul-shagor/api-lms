const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    ListingKey: { type: String, required: true, unique: true },
    propertyDetails: { type: Object, required: true },
    media: { type: Array, required: false },
});

// Index for ListingKey for faster lookup
propertySchema.index({ ListingKey: 1 });

// If you plan to query frequently based on a certain field (e.g., createdAt or _id), index those as well.
// For example, assuming you may use _id for pagination (or createdAt if applicable):
propertySchema.index({ createdAt: -1 }); // Optional: if you use createdAt for pagination

module.exports = mongoose.model('Property', propertySchema);