import AWS from 'aws-sdk';
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";



const dynamoDb = new AWS.DynamoDB.DocumentClient();

const sns = new AWS.SNS();

export const handler = async (event) => {
  console.log('Lambda triggered', event);
  try {
    const products = [];

    for (const record of event.Records) {
      console.log('record: ', record);
      const product = JSON.parse(record.body);

      console.log('parsed product: ', product);
      // Save the product to DynamoDB
      await saveProductToDynamoDB(product);
      products.push(product);
    }

    // Send event to SNS topic
    await publishToSNS(products);


  } catch (error) {
    console.error('Error processing SQS messages:', error);
  }
};

async function saveProductToDynamoDB(product) {
  const params = {
    TableName: process.env.PRODUCTS_TABLE, 
    Item: product,
  };

  await dynamoDb.put(params).promise();
}

async function publishToSNS(products) {
  console.log('publish to sns init');
  const sns = new SNSClient({ region: 'eu-west-1' });
  console.log('sns clien init', sns);
  
  const response = await sns.send(
    new PublishCommand({
      Message: JSON.stringify({ products }),
      TopicArn: process.env.SNS_ARN,
    })
  );
    
  console.log('Published to sns: ', response);
  }
  
