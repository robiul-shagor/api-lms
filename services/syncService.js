const axios = require('axios');
const Property = require('../models/Property');

const syncData = async () => {
    try {
        const headers = {
            Authorization: `Bearer ${process.env.BEARER_TOKEN}`,
        };

        // Fetch all properties
        const propertyResponse = await axios.get('https://query.ampre.ca/odata/Property', { headers });
        const properties = propertyResponse.data.value;
        
        console.log(`Fetched ${properties.length} properties`);

        // Process each property and fetch its media based on ListingKey
        for (const property of properties) {
            const listingKey = property.ListingKey;

            // Fetch media for each property using ListingKey
            const mediaResponse = await axios.get(
                `https://query.ampre.ca/odata/Media?$filter=ResourceRecordKey eq '${listingKey}'`,
                { headers }
            );
            const mediaItems = mediaResponse.data.value;
            
            console.log(`Fetched ${mediaItems.length} media items for property with ListingKey: ${listingKey}`);

            // Save or update the property in MongoDB, including media items
            await Property.findOneAndUpdate(
                { ListingKey: listingKey },
                { propertyDetails: property, media: mediaItems },
                { upsert: true }
            );
        }

        console.log('Data synced successfully.');
    } catch (error) {
        console.error('Error syncing data:', error);
    }
};

module.exports = { syncData };