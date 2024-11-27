const express = require('express');
const PropertyIDX = require('../models/PropertyIDX'); // For IDX properties
const PropertyVow = require('../models/PropertyVow'); // For Vow properties
const PropertySold = require('../models/PropertySold'); // For Vow properties
const router = express.Router();

// GET /api/idx-properties - Fetch IDX properties with filtering
router.get('/idx-properties', async (req, res) => {
    try {
        // Get page, limit, and filter parameters
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 20));
        const startIndex = (page - 1) * limit;

        // Initialize filter object
        let filter = {};

        // Apply filters if provided in the query
        if (req.query.MlsStatus) {
            filter["propertyDetails.MlsStatus"] = req.query.MlsStatus;
        }
        if (req.query.PropertyType) {
            filter["propertyDetails.PropertyType"] = { $regex: req.query.PropertyType, $options: 'i' };
        }
        if (req.query.City) {
            filter["propertyDetails.City"] = { $regex: '^' + req.query.City, $options: 'i' };
        }

        // Fetch filtered IDX properties
        const properties = await PropertyIDX.find(filter).skip(startIndex).limit(limit).sort({ "propertyDetails.ModificationTimestamp": -1 }).lean();

        // Get total count for pagination
        const totalProperties = await PropertyIDX.countDocuments(filter);

        // Calculate total pages
        const totalPages = Math.ceil(totalProperties / limit);

        // Send response with filtered IDX properties
        res.json({
            page,
            limit,
            totalPages,
            totalProperties,
            properties
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching IDX properties', error });
    }
});


// GET /api/vow-properties - Fetch Vow properties with pagination
router.get('/vow-properties', async (req, res) => {
    try {
        // Get page, limit, and filter parameters
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 20));
        const startIndex = (page - 1) * limit;

        // Initialize filter object
        let filter = {};

        // Apply filters if provided in the query
        if (req.query.MlsStatus) {
            filter["propertyDetails.MlsStatus"] = req.query.MlsStatus;
        }
        if (req.query.PropertyType) {
            filter["propertyDetails.PropertyType"] = { $regex: req.query.PropertyType, $options: 'i' };
        }
        if (req.query.City) {
            filter["propertyDetails.City"] = { $regex: '^' + req.query.City, $options: 'i' };
        }    
        
        if (req.query.City) {
            filter["propertyDetails.City"] = { $regex: '^' + req.query.City, $options: 'i' };
        }

        if (req.query.BedroomsTotal) {
            const bedroomsTotal = parseInt(req.query.BedroomsTotal);
            if (!isNaN(bedroomsTotal)) {
                filter["propertyDetails.BedroomsTotal"] = { $gt: bedroomsTotal };  // Apply filter for greater than
            }
        }

        // Fetch filtered Vow properties
        const properties = await PropertyVow.find(filter).skip(startIndex).limit(limit).sort({ "propertyDetails.ModificationTimestamp": -1 }).lean();

        // Get total count for pagination
        const totalProperties = await PropertyVow.countDocuments(filter);

        // Calculate total pages
        const totalPages = Math.ceil(totalProperties / limit);

        // Send response with filtered Vow properties
        res.json({
            page,
            limit,
            totalPages,
            totalProperties,
            properties
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching Vow properties', error });
    }
});

router.get('/sold-properties', async (req, res) => {
    try {
        // Get page, limit, and filter parameters
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 20));
        const startIndex = (page - 1) * limit;

        // Initialize filter object
        let filter = {};

        // Apply filters if provided in the query
        if (req.query.MlsStatus) {
            filter["propertyDetails.MlsStatus"] = req.query.MlsStatus;
        }
        if (req.query.PropertyType) {
            filter["propertyDetails.PropertyType"] = { $regex: req.query.PropertyType, $options: 'i' };
        }
        if (req.query.City) {
            filter["propertyDetails.City"] = { $regex: '^' + req.query.City, $options: 'i' };
        }    
        
        if (req.query.City) {
            filter["propertyDetails.City"] = { $regex: '^' + req.query.City, $options: 'i' };
        }

        if (req.query.BedroomsTotal) {
            const bedroomsTotal = parseInt(req.query.BedroomsTotal);
            if (!isNaN(bedroomsTotal)) {
                filter["propertyDetails.BedroomsTotal"] = { $gt: bedroomsTotal };  // Apply filter for greater than
            }
        }

        // Fetch filtered Vow properties
        const properties = await PropertySold.find(filter).skip(startIndex).limit(limit).sort({ "propertyDetails.ModificationTimestamp": -1 }).lean();

        // Get total count for pagination
        const totalProperties = await PropertySold.countDocuments(filter);

        // Calculate total pages
        const totalPages = Math.ceil(totalProperties / limit);

        // Send response with filtered Vow properties
        res.json({
            page,
            limit,
            totalPages,
            totalProperties,
            properties
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching Vow properties', error });
    }
});

// GET /api/all-properties - Fetch all properties from IDX, Vow, and Sold with filtering
router.get('/all-properties', async (req, res) => {
    try {
        // Get page, limit, and filter parameters
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 20));
        const startIndex = (page - 1) * limit;

        // Initialize filter object
        let filter = {};

        // Apply filters if provided in the query
        if (req.query.MlsStatus) {
            filter["propertyDetails.MlsStatus"] = req.query.MlsStatus;
        }
        if (req.query.PropertyType) {
            filter["propertyDetails.PropertyType"] = { $regex: req.query.PropertyType, $options: 'i' };
        }
        if (req.query.City) {
            filter["propertyDetails.City"] = { $regex: '^' + req.query.City, $options: 'i' };
        }
        if (req.query.BedroomsTotal) {
            const bedroomsTotal = parseInt(req.query.BedroomsTotal);
            if (!isNaN(bedroomsTotal)) {
                filter["propertyDetails.BedroomsTotal"] = { $gt: bedroomsTotal };  // Apply filter for greater than
            }
        }

        // Fetch filtered IDX properties
        const idxProperties = await PropertyIDX.find(filter).skip(startIndex).limit(limit).lean();

        // Fetch filtered Vow properties
        const vowProperties = await PropertyVow.find(filter).skip(startIndex).limit(limit).lean();

        // Fetch filtered Sold properties
        const soldProperties = await PropertySold.find(filter).skip(startIndex).limit(limit).lean();

        // Combine all arrays of filtered properties
        const allProperties = [...idxProperties, ...vowProperties, ...soldProperties];

        // Deduplicate the properties based on ListingKey
        const uniqueProperties = Array.from(
            new Map(allProperties.map(property => [property.ListingKey, property])).values()
        );

        // Calculate total count for pagination (counting all properties in each collection)
        const totalProperties = await PropertyIDX.countDocuments(filter) 
                               + await PropertyVow.countDocuments(filter)
                               + await PropertySold.countDocuments(filter);

        // Calculate total pages
        const totalPages = Math.ceil(totalProperties / limit);

        // Send response with filtered, combined, and deduplicated properties
        res.json({
            page,
            limit,
            totalPages,
            totalProperties,
            properties: uniqueProperties
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching properties', error });
    }
});

// GET /api/idx-properties/:id - Fetch single IDX property by ListingKey
router.get('/idx-properties/:id', async (req, res) => {
    try {
        // Find IDX property by ListingKey
        const property = await PropertyIDX.findOne({ ListingKey: req.params.id });
        if (!property) return res.status(404).json({ message: 'IDX Property not found' });

        res.json(property);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching IDX property', error });
    }
});

// GET /api/vow-properties/:id - Fetch single Vow property by ListingKey
router.get('/vow-properties/:id', async (req, res) => {
    try {
        // Find Vow property by ListingKey
        const property = await PropertyVow.findOne({ ListingKey: req.params.id });
        if (!property) return res.status(404).json({ message: 'Vow Property not found' });

        res.json(property);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching Vow property', error });
    }
});

// GET /api/properties/:id - Fetch a single property by ListingKey from both IDX and Vow collections
router.get('/properties/:id', async (req, res) => {
    try {
        // Try to find the property in both IDX and Vow collections
        const propertyIDX = await PropertyIDX.findOne({ ListingKey: req.params.id });
        const propertyVow = await PropertyVow.findOne({ ListingKey: req.params.id });

        if (!propertyIDX && !propertyVow) {
            return res.status(404).json({ message: 'Property not found in either IDX or Vow' });
        }

        // If the property exists in either collection, return it
        const property = propertyIDX || propertyVow;

        res.json(property);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching property', error });
    }
});


module.exports = router;