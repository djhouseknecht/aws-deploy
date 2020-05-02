import AWS from 'aws-sdk';
import { resolve } from 'path';

import { UnifiedEnv } from 'unified-env';

export const LOG_LEVELS = ['debug', 'info', 'warn', 'error'];
export const LIB_NAME = 'aws-deploy';
export const VERSIONS_FILE = 'versions.json';
export const VERSION_FILE = 'version.json';

export const config = new UnifiedEnv({
  /* aws config */
  AWS_REGION: true,
  AWS_ACCESS_KEY_ID: true,
  AWS_SECRET_ACCESS_KEY: true,
  /* s3 upload */
  AWS_VERSIONS_BUCKET: true,
  AWS_VERSIONS_FOLDER: { required: false, defaultValue: '' },
  DIR_TO_UPLOAD: true,
  /* s3/cloudfront deploy */
  AWS_DEPLOY_BUCKET: true,
  AWS_CLOUDFRONT_ID: true,
  LOG_LEVEL: { required: true, defaultValue: 'info', acceptableValues: LOG_LEVELS },

  /* *************** */
  /* argv parameters */
  /* *************** */

  /* ALL */
  help: { required: false, type: Boolean },
  version: { required: false },

  /* DELETE */
  delete: { required: false, type: Boolean },

  /* UPLOAD */
  upload: { required: false, type: Boolean },
  overwrite: { required: false, type: Boolean },
  list: { required: false, type: Boolean },
  history: { required: false, type: Boolean },

  /* DEPLOY */
  // clean: { required: false, type: Boolean },
  // force: { required: false, type: Boolean },
})
  .env()
  .file()
  .argv()
  .generate();

export const VERSION = config.version || require(resolve('./package.json')).version;

AWS.config.update({
  region: config.AWS_REGION,
  secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
  accessKeyId: config.AWS_ACCESS_KEY_ID
});

export const s3 = new AWS.S3({ apiVersion: 'latest' });
export const cloudfront = new AWS.CloudFront({ apiVersion: 'latest' });