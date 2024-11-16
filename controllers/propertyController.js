const express = require('express');
const Property = require('../models/Property');
const router = express.Router();

// GET /api/properties - Fetch properties with pagination
router.get('/', async (req, res) => {
    try {
        // Get page and limit from query parameters, with defaults if not provided
        const page = Math.max(1, parseInt(req.query.page) || 1);  // Ensure page >= 1
        const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 10));  // Limit between 1 and 100

        // Calculate the starting index of items for the current page
        const startIndex = (page - 1) * limit;

        // Define filtering conditions for properties where MlsStatus is 'New' and PropertyType includes 'Residential'
        // Initialize filter object
        let filter = {};

        // Check if MlsStatus is provided and add to filter
        if (req.query.MlsStatus) {
            filter["propertyDetails.MlsStatus"] = req.query.MlsStatus;
        }

        // Check if PropertyType is provided and add to filter using case-insensitive partial matching
        if (req.query.PropertyType) {
            filter["propertyDetails.PropertyType"] = { $regex: req.query.PropertyType, $options: 'i' };
        }

        if (req.query.TransactionType && req.query.TransactionType.includes("Lease")) {
            filter["propertyDetails.TransactionType"] = { $regex: "Lease", $options: "i" };
        }

       // Check if PublicRemarksExtras includes "Luxury" and City matches user-provided city
        if (req.query.PublicRemarks && req.query.PublicRemarks.includes("Luxury")) {
            filter["propertyDetails.PublicRemarks"] = { $regex: "Luxury", $options: "i" };
        }
        
        if (req.query.City) {
            filter["propertyDetails.City"] = { $regex: '^' + req.query.City, $options: 'i' };
        }        
            
        // Fetch paginated properties with sorting and lean() for performance
        const properties = await Property.find(filter)
            .skip(startIndex)
            .limit(limit)
            .sort({ "propertyDetails.ModificationTimestamp": -1 })  // or _id for natural ordering
            .lean();

        // Get total count of properties for pagination metadata
        const totalProperties = await Property.countDocuments();  // Or use estimatedDocumentCount()

        // Calculate total pages
        const totalPages = Math.ceil(totalProperties / limit);

        // Send response with properties and pagination metadata
        res.json({
            page,
            limit,
            totalPages,
            totalProperties,
            properties
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching properties', error });
    }
});

// GET /api/properties/:id - Fetch single property by OriginatingSystemID with merged media data
router.get('/:id', async (req, res) => {
    try {
        // Find property by ListingKey
        const property = await Property.findOne({ ListingKey: req.params.id });
        if (!property) return res.status(404).json({ message: 'Property not found' });

        res.json(property);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching property' });
    }
});

router.patch('/:id', async (req, res) => {
    try {
        // Update local database
        const updatedProperty = await Property.findOneAndUpdate(
            { ListingKey: req.params.id },
            req.body,
            { new: true }
        );

        if (!updatedProperty) {
            return res.status(404).json({ message: 'Property not found' });
        }

        // Prepare data for PATCH request
        const data = JSON.stringify(req.body);
        const options = {
            hostname: 'syndication.ampre.ca',
            path: `/webapi/odata/Property('${req.params.id}')`,
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.BEARER_TOKEN}`,
                'Content-Length': data.length
            }
        };

        // Send PATCH request to external API
        const apiRequest = https.request(options, apiResponse => {
            console.log(`STATUS: ${apiResponse.statusCode}`);
            apiResponse.setEncoding('utf8');
            apiResponse.on('data', (chunk) => {
                console.log('Body: ' + chunk);
            });
            apiResponse.on('end', () => {
                console.log('No more data in response.');
            });
        });

        apiRequest.on('error', (e) => {
            console.error(`problem with request: ${e.message}`);
        });

        // Write data to request body
        apiRequest.write(data);
        apiRequest.end();

        // Respond with the updated property from the local database
        res.json(updatedProperty);
    } catch (error) {
        console.error('Error updating property:', error.message);
        res.status(500).json({ message: 'Error updating property' });
    }
});

module.exports = router;