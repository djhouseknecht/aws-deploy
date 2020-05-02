import AWS from 'aws-sdk';
import { config } from './config';

AWS.config.update({
  region: config.AWS_REGION,
  secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
  accessKeyId: config.AWS_ACCESS_KEY_ID
});

const s3 = new AWS.S3({ apiVersion: 'latest' });
const cloudfront = new AWS.CloudFront({ apiVersion: 'latest' });

export { s3, cloudfront };