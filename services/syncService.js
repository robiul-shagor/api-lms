const axios = require('axios');
const PropertyIDX = require('../models/PropertyIDX'); // For IDX properties
const PropertyVow = require('../models/PropertyVow'); // For Vow properties

const syncData = async () => {
    try {
        const headersIDX = {
            Authorization: `Bearer ${process.env.IDX_BEARER_TOKEN}`,
        };
        const headersVow = {
            Authorization: `Bearer ${process.env.VOW_BEARER_TOKEN}`,
        };

        // Function to fetch and sync data for a specific API token
        const fetchAndSyncData = async (headers, propertyModel, tokenType) => {
            // Fetch all properties
            const propertyResponse = await axios.get('https://query.ampre.ca/odata/Property', { headers });
            const properties = propertyResponse.data.value;
            console.log(`Fetched ${properties.length} properties from ${tokenType}`);

            // Process each property and fetch its media based on ListingKey
            for (const property of properties) {
                const listingKey = property.ListingKey;

                // Fetch media for each property using ListingKey
                const mediaResponse = await axios.get(
                    `https://query.ampre.ca/odata/Media?$filter=ResourceRecordKey eq '${listingKey}'`,
                    { headers }
                );
                const mediaItems = mediaResponse.data.value;
                console.log(`Fetched ${mediaItems.length} media items for property with ListingKey: ${listingKey} from ${tokenType}`);

                // Save or update the property in the respective collection
                await propertyModel.findOneAndUpdate(
                    { ListingKey: listingKey },
                    { propertyDetails: property, media: mediaItems },
                    { upsert: true }
                );
            }

            console.log(`Data synced successfully for ${tokenType}.`);
        };

        // Sync data for IDX and Vow
        await fetchAndSyncData(headersIDX, PropertyIDX, 'IDX');
        await fetchAndSyncData(headersVow, PropertyVow, 'Vow');
        
    } catch (error) {
        console.error('Error syncing data:', error);
    }
};

module.exports = { syncData };