import AWS from 'aws-sdk';
import csvParser from 'csv-parser';
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";


const s3 = new AWS.S3();

const sqsClient = new SQSClient();

const sendRecords = (records) => {
  console.log('send records is started', records);
  console.log('SQS_URL is processed: ', process.env.SQS_URL);
  return Promise.allSettled(records.map(record => {
    return sqsClient.send(new SendMessageCommand({
      QueueUrl: process.env.SQS_URL,
      MessageBody: JSON.stringify(record), // Assuming record is an object
    })).then((response) => {
      console.log('Send message to SQS:', response);
      return record;
    }).catch((error) => {
      console.error('Error sending message to SQS:', error);
      throw error;
    });
  }));
};

export const handler = async (event) => {
  console.log('Lambda function started');

  await Promise.all(
    event.Records.map(async (record) => {
      const bucket = record.s3.bucket.name;
      const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

      console.log('Processing record:', {
        bucket,
        key,
        eventName: record.eventName,
        eventTime: record.eventTime,
      });

      const params = {
        Bucket: bucket,
        Key: key,
      };

      try {
        const data = await s3.getObject(params).promise();
        const s3Stream = Buffer.from(data.Body.toString('utf-8'));

        console.log('Fetched S3 object. Content length:', s3Stream?.length);

        // Parse CSV and handle the records
        const records = await parseCsv(s3Stream);
        await sendRecords(records);
        
        console.log('All Records:', records);
        console.log('Record processing completed');
      } catch (error) {
        console.error('Error getting S3 object:', error);
      }
    })
  );

  console.log('Lambda function completed');
};

const parseCsv = (s3Stream) => {
  return new Promise((resolve, reject) => {
    const records = [];

    const parser = csvParser({ separator: ';' });

    parser.on('data', (rowData) => {
      // Check if the row has valid data before processing
      if (rowData.id !== undefined && rowData.title !== undefined && rowData.description !== undefined && !isNaN(rowData.price) && !isNaN(rowData.count)) {
        const product = {
          id: rowData.id,
          title: rowData.title,
          description: rowData.description,
          price: Number(rowData.price),
          count: Number(rowData.count),
        };
        records.push(product);
      }
    });

    parser.on('end', () => {
      console.log('CSV parsing completed.');
      resolve(records); // Resolve the Promise when parsing is completed
    });

    parser.on('error', (error) => {
      console.error('Error parsing CSV:', error);
      reject(error); // Reject the Promise in case of an error
    });

    parser.write(s3Stream);
    parser.end();
  });
};
