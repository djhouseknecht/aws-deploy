import { createReadStream } from 'fs';
import { basename, resolve } from 'path';
import mimeTypes from 'mime-types'
import S3 from 'aws-sdk/clients/s3';

import { log } from './logger';
import { walkDir } from './utils';
import { config, VERSION, VERSION_FILE, s3 } from './config';
import { IVersionFile } from './types';
import { createVersionFile } from './version';

/**
 * Fetch a single item from a S3 bucket. 
 * @param bucket name of the S3 bucket
 * @param item folder/item path to retrieve
 */
export function getObjectFromBucket (bucket: string, item: string): Promise<any> {
  log('debug', `checking for bucket item: ${bucket}/${item}`);
  const params: AWS.S3.Types.GetObjectRequest = {
    Bucket: bucket,
    Key: item
  };

  return new Promise((res, rej) => {
    s3.getObject(params, (err, data) => {
      if (err) {
        if (err.name === 'NoSuchKey') res(null);
        rej(err);
      }
      res(data);
    });
  });
}

export async function uploadVersionDirectory (relPath: string): Promise<IVersionFile> {
  const files = await walkDir(relPath);
  const versionPath = `${relPath}${VERSION_FILE}`;
  /* create versions file */
  const versionFile = createVersionFile({
    version: VERSION,
    files: files.map(file => file.replace(config.DIR_TO_UPLOAD, '')),
    path: versionPath
  });

  await Promise.all(
    files.map(f => uploadFileFromPath(f))
  );

  return versionFile;
}

export async function uploadFileFromString (fileNameWithExt: string, fileContents: string): Promise<any> {
  const uploadPath = config.AWS_VERSIONS_FOLDER + '/' + fileNameWithExt;
  console.log(
    `Uploading: "${fileNameWithExt}"`, '\n',
    `  to bucket: "${config.AWS_VERSIONS_BUCKET}"`, '\n',
    `  s3 folder: "${config.AWS_VERSIONS_FOLDER}"`, '\n',
    `  to path: "${uploadPath}"`, '\n'
  );
  const params = {
    Bucket: config.AWS_VERSIONS_BUCKET,
    Key: uploadPath,
    Body: fileContents,
    ContentType: mimeTypes.lookup(fileNameWithExt) || undefined
  };

  return uploadToS3(params);
}

/**
 * Upload a file to the aws s3 bucket
 * @param folder sub folder in bucket
 * @param file file to upload
 */
async function uploadFileFromPath (file: string): Promise<any> {
  const localFilePath = resolve(file);

  const BUCKET_VERSION_FOLDER = config.AWS_VERSIONS_FOLDER
    + (config.AWS_VERSIONS_FOLDER ? '/' : '')
    + VERSION;
  const uploadPath = BUCKET_VERSION_FOLDER + '/'
    + file.replace(config.DIR_TO_UPLOAD, '');

  const fileName = basename(localFilePath);
  // console.log('uploading file', { from: file, to: uploadPath })
  // return;

  console.log(
    `Uploading: "${localFilePath}"`, '\n',
    `  file: "${file}"`, '\n',
    `  to bucket: "${config.AWS_VERSIONS_BUCKET}"`, '\n',
    `  s3 folder: "${config.AWS_VERSIONS_FOLDER}"`, '\n',
    `  to path: "${uploadPath}"`, '\n',
    `  filename: "${fileName}"`
  );
  const body = createReadStream(localFilePath);

  body.on("error", function (err) {
    console.log("File Error", err);
  });
  const params = {
    Bucket: config.AWS_VERSIONS_BUCKET,
    Key: uploadPath,
    Body: body,
    ContentType: mimeTypes.lookup(fileName) || undefined
  };

  return uploadToS3(params);
}

function uploadToS3<T = any> (params: S3.Types.PutObjectRequest): Promise<T> {
  log('info', 'uploadToS3 called with', params);
  log('error', 'upload is turned off');
  return Promise.resolve({} as T);

  return s3
    .upload(params)
    .promise()
    .then(e => {
      console.info(`Uploaded file "${e.Key}" to ${e.Location}`);
      return e;
    })
    .catch(item => {
      console.error(`Error uploading file: ${item.Key}`)
      return item;
    });
}
