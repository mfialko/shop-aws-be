const AWS = require('aws-sdk');

// Set the region 
AWS.config.update({region: 'eu-west-1'}); // e.g., us-west-2

// Create the DynamoDB service object
const ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

const productsData = [
    {
        id: '7567ec4b-b10c-48c5-9345-fc73c48a80aa',
        title: 'ProductOne',
        description: 'Short Product Description1 from DB',
        price: 24
    },
    {
        id: '7567ec4b-b10c-48c5-9345-fc73c48a80a1',
        title: 'ProductTitle',
        description: 'Short Product Description7 from DB',
        price: 15
    },
    {
        id: '7567ec4b-b10c-48c5-9345-fc73c48a80a3',
        title: 'Product',
        description: 'Short Product Description2 from DB',
        price: 23
    }
];

const stocksData = [
    {
        product_id: '7567ec4b-b10c-48c5-9345-fc73c48a80aa',
        count: 5
    },
    {
        product_id: '7567ec4b-b10c-48c5-9345-fc73c48a80a1',
        count: 10
    },
    {
        product_id: '7567ec4b-b10c-48c5-9345-fc73c48a80a3',
        count: 3
    }
];

// Add products to DynamoDB
const populateProducts = async () => {
    for (let product of productsData) {
        const params = {
            TableName: 'products',
            Item: {
                'id': {S: product.id},
                'title': {S: product.title},
                'description': {S: product.description},
                'price': {N: product.price.toString()}
            }
        };

        await ddb.putItem(params).promise();
    }
};

// Add stocks to DynamoDB
const populateStocks = async () => {
    for (let stock of stocksData) {
        const params = {
            TableName: 'stocks',
            Item: {
                'product_id': {S: stock.product_id},
                'count': {N: stock.count.toString()}
            }
        };

        await ddb.putItem(params).promise();
    }
};

// Execute the functions
const run = async () => {
    try {
        await populateProducts();
        await populateStocks();
        console.log('Data populated successfully.');
    } catch (error) {
        console.error('Error populating data:', error);
    }
};

run();
