import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client();

export const handler = async (event) => {
  const { name } = event.queryStringParameters;

  if (!name) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing file name parameter' }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
      },
    };
  }

  const s3Params = {
    Bucket: process.env.IMPORT_BUCKET,
    Key: `uploaded/${name}`,
    ContentType: 'text/csv',  // Adjust the content type based on your file type
  };

  try {
    const command = new PutObjectCommand(s3Params);
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });

    return {
      statusCode: 200,
      body: JSON.stringify({ signedUrl }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
      },
    };
  } catch (error) {
    console.error('Error generating Signed URL:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
      },
    };
  }
};
