import AWS from 'aws-sdk';

const dynamoDb = new AWS.DynamoDB.DocumentClient();


export const handler = async (event) => {
  const productId = event.pathParameters.id;
  
  const productParams = {
    TableName: process.env.PRODUCTS_TABLE,
    Key: {
      id: productId,
    },
  };
  
  const stockParams = {
    TableName: process.env.STOCKS_TABLE,
    Key: {
      product_id: productId,
    },
  };
  
  try {
    const productResult = await dynamoDb.get(productParams).promise();
    const stockResult = await dynamoDb.get(stockParams).promise();

    if (!productResult.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Product not found" }),
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": "true",
        },
      };
    }
  
    const mergedProduct = {
      ...productResult.Item,
      count: stockResult.Item?.count || 0, // Add stock count or default to 0 if not found
    };
  
    return {
      statusCode: 200,
      body: JSON.stringify(mergedProduct),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": "true",
      },
    };
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": "true",
      },
    };
  }
};
