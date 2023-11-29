import AWS from 'aws-sdk';
import csvParser from 'csv-parser';

const s3 = new AWS.S3();

export const handler = async (event) => {
  const records = [];

  await Promise.all(
    event.Records.map(async (record) => {
      const bucket = record.s3.bucket.name;
      const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

      const params = {
        Bucket: bucket,
        Key: key,
      };

      try {
        const data = await s3.getObject(params).promise();
        const s3Stream = Buffer.from(data.Body.toString('utf-8')); // Convert the buffer to string

        csvParser()
          .on('data', (rowData) => {
            console.log('Record:', rowData);
            records.push(rowData);
          })
          .on('end', () => {
            console.log('CSV parsing completed.');
            console.log('All Records:', records);
          })
          .on('error', (error) => {
            console.error('Error parsing CSV:', error);
          })
          .write(s3Stream); // Write the buffer to the parser
      } catch (error) {
        console.error('Error getting S3 object:', error);
      }
    })
  );
};
