#!/usr/bin/env node

/**
 * 1. upload versions
 *  determine if a version already exists (need an overright flag to remove files first)
 *  create a `version.json` with all the needed files and version number 
 *    (maybe have a parameter to accept a `version.json` file)
 *  upload to the private S3 bucket
 */
import { config, VERSION } from './utils/config';
import { getVersionHistoryFileFromS3, updateVersionHistory } from './utils/version';
import { log } from './utils/logger';
import { uploadVersionDirectory, uploadFileFromString } from './utils/bucket';
import { IVersionHistoryEntry, IVersionHistoryFile } from './utils/types';

/**
 * Upload a version to S3
 */
async function upload () {
  const overwrite = config.overwrite;
  const versionHistory = await getVersionHistoryFileFromS3();
  const existingVersion = versionHistory.availableVersions.includes(VERSION);

  /* the version already exists and there is no `--overwrie` flag */
  if (existingVersion && !overwrite) {
    log('warn',
      `version "${VERSION}" already exists. not uploading`,
    );
    log('info',
      'call with `--overwrite` to overwrite the existing version with the new version'
    );
    return;
  }

  // const versionFile = await uploadVersionDirectory(config.DIR_TO_UPLOAD);
  log('info', 'finished uploading version files');

  const action = existingVersion ? 'overwrite' : 'upload';
  const newVersionHistory: IVersionHistoryFile = updateVersionHistory(
    versionHistory,
    VERSION,
    action
  );

  await uploadFileFromString('versions.json', JSON.stringify(newVersionHistory, null, 2));

  /* by this point, we are overwriting if we have an existing version */
  if (existingVersion) {
    log('warn',
      `version "${VERSION}" already existed - removing old version files`
    );
    log('error', '**************************************');
    log('error', 'write functionality to compare and remove old files that did not match');
    log('error', '**************************************');
  }

}

/**
 * List available versions in S3
 */
async function list () {
  log('info',
    '***************************'
  );
  log('info',
    'fetching versions history'
  );

  const versions = await getVersionHistoryFileFromS3();

  const msg = config.list ? 'available versions' : 'versions history';
  const output = config.list ? versions.availableVersions : versions.versionsHistory;

  log('info', msg);
  log('info', output);

  /* done */
  log('info',
    'finished listing versions'
  );
  log('info',
    '***************************'
  );
}

async function run () {
  /* if we are listing available versions */
  if (config.list || config.history) {
    return list();
  }

  /* upload the version */
  return upload();
}

run();