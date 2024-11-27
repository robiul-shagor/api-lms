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
        //MlsStatus=New&PropertySubType=Lower Level&ListPriceUnit=For Sale&MajorChangeTimestamp=2024-11-20T16:35:42.253Z

        const dateRangeDays = parseInt(req.query.MajorChangeTimestamp) || 30; // Default to 30 days if not provided
        const currentDate = new Date();
        const dateRangeStart = new Date();
        dateRangeStart.setDate(currentDate.getDate() - dateRangeDays); 

        if (req.query.MlsStatus) {
            filter["propertyDetails.MlsStatus"] = req.query.MlsStatus;

            // Apply a date range filter for "Sold" status
            if (req.query.MlsStatus === 'Sold') {
                filter["propertyDetails.MajorChangeTimestamp"] = {
                    $gte: dateRangeStart.toISOString(),
                    $lte: currentDate.toISOString()
                };
            }
        }
        if (req.query.PropertyType) {
            filter["propertyDetails.PropertyType"] = { $regex: req.query.PropertyType, $options: 'i' };
        }           
        
        if (req.query.PropertySubType) {
            const propertySubType = req.query.PropertySubType.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
            filter["propertyDetails.PropertySubType"] = { 
                $regex: propertySubType, 
                $options: 'i' 
            };
        } 
        
        if (req.query.ListPriceUnit) {
            const for_sales = req.query.ListPriceUnit.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
            filter["propertyDetails.ListPriceUnit"] = { $regex: for_sales, $options: 'i' };
            filter["propertyDetails.MajorChangeTimestamp"] = {
                $gte: dateRangeStart.toISOString(),
                $lte: currentDate.toISOString()
            };
        }   
        
        // Apply date range for MajorChangeTimestamp when PropertySubType or MlsStatus is provided
        if (req.query.PropertySubType || req.query.MlsStatus === 'Sold') {
            const currentDate = new Date(); // Current date
            const dateRangeStart = new Date();
            dateRangeStart.setDate(currentDate.getDate() - 30); // 30 days ago
            filter["propertyDetails.MajorChangeTimestamp"] = {
                $gte: dateRangeStart.toISOString(),
                $lte: currentDate.toISOString()
            };
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
        
        if (req.query.BathroomsTotalInteger) {
            const bathRoomsTotal = parseInt(req.query.BathroomsTotalInteger);
            if (!isNaN(bathRoomsTotal)) {
                filter["propertyDetails.BathroomsTotalInteger"] = { $gt: bathRoomsTotal };  // Apply filter for greater than
            }
        }

        // Price range filter
        if (req.query.minPrice || req.query.maxPrice) {
            filter["propertyDetails.ListPrice"] = {};
            if (req.query.minPrice) {
                const minPrice = parseFloat(req.query.minPrice);
                if (!isNaN(minPrice)) {
                    filter["propertyDetails.ListPrice"]["$gte"] = minPrice; // Greater than or equal to minPrice
                }
            }
            if (req.query.maxPrice) {
                const maxPrice = parseFloat(req.query.maxPrice);
                if (!isNaN(maxPrice)) {
                    filter["propertyDetails.ListPrice"]["$lte"] = maxPrice; // Less than or equal to maxPrice
                }
            }
        }

        // Determine sort order
        const sortBy = req.query.sortBy || "Newest"; // Default to "Newest"
        let sort = {};
        switch (sortBy) {
            case "HighToLow":
                sort["propertyDetails.ListPrice"] = -1; // Price high to low
                break;
            case "LowToHigh":
                sort["propertyDetails.ListPrice"] = 1; // Price low to high
                break;
            case "Newest":
                sort["propertyDetails.MajorChangeTimestamp"] = -1; // Newest first
                break;
            case "Oldest":
                sort["propertyDetails.MajorChangeTimestamp"] = 1; // Oldest first
                break;
        }

        // Fetch filtered IDX properties
        const idxProperties = await PropertyIDX.find(filter).skip(startIndex).limit(limit).sort(sort).lean();

        // Fetch filtered Vow properties
        const vowProperties = await PropertyVow.find(filter).skip(startIndex).limit(limit).sort(sort).lean();

        // Fetch filtered Sold properties
        const soldProperties = await PropertySold.find(filter).skip(startIndex).limit(limit).sort(sort).lean();

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

        // short
        // Slice the results to enforce pagination limits
        const paginatedProperties = uniqueProperties.slice(startIndex, startIndex + limit);

        // Calculate total count for pagination
        const totalPropertiesItems = uniqueProperties.length;
        const totalPages = Math.ceil(totalPropertiesItems / limit);

        // Send response with filtered, combined, and deduplicated properties
        res.json({
            page,
            limit,
            totalPages,
            totalProperties,
            properties: paginatedProperties
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