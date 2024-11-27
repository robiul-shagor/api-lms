const axios = require('axios');
const PropertyIDX = require('../models/PropertyIDX'); // For IDX properties
const PropertyVow = require('../models/PropertyVow'); // For Vow properties
const PropertySold = require('../models/PropertySold'); // For Sold properties

const syncData = async () => {
    try {
        const headersIDX = {
            Authorization: `Bearer ${process.env.IDX_BEARER_TOKEN}`,
        };
        const headersVow = {
            Authorization: `Bearer ${process.env.VOW_BEARER_TOKEN}`,
        };

        // Pagination settings
        const pageSize = 100; // Number of records to fetch per page

        // Function to fetch and sync paginated data for a specific API token
        const fetchAndSyncPaginatedData = async (headers, propertyModel, tokenType, filter = '') => {
            let skipValue = 0; // Start with the first page
            let hasMoreData = true;

            while (hasMoreData) {
                console.log(`Fetching properties with skip=${skipValue} for ${tokenType}...`);

                // Construct the URL with optional filter for 'Sold' properties
                const url = filter
                    ? `https://query.ampre.ca/odata/Property?$skip=${skipValue}&$top=${pageSize}&$filter=${filter}`
                    : `https://query.ampre.ca/odata/Property?$skip=${skipValue}&$top=${pageSize}`;

                // Fetch properties with pagination and optional filter
                const propertyResponse = await axios.get(url, { headers });
                const properties = propertyResponse.data.value;

                if (properties.length === 0) {
                    hasMoreData = false; // Stop if no more data is returned
                    console.log(`No more properties to fetch for ${tokenType}.`);
                    break;
                }

                console.log(`Fetched ${properties.length} properties from ${tokenType}.`);

                // Process each property and fetch media
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
                    ).allowDiskUse(true);
                }

                // Increment skipValue to fetch the next set of data
                skipValue += pageSize;
            }

            console.log(`Data synced successfully for ${tokenType}.`);
        };

        // Sync data for IDX and Vow
        await fetchAndSyncPaginatedData(headersIDX, PropertyIDX, 'IDX');
        await fetchAndSyncPaginatedData(headersVow, PropertyVow, 'Vow');
        
        // Sync data for Sold properties (with filter for MlsStatus eq 'Sold')
        const soldFilter = "MlsStatus eq 'Sold'";
        await fetchAndSyncPaginatedData(headersVow, PropertySold, 'Vow', soldFilter);
        
    } catch (error) {
        console.error('Error syncing data:', error);
    }
};

module.exports = { syncData };