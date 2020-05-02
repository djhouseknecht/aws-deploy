import { writeFileSync } from 'fs';
import { VERSION_FILE, config, VERSIONS_FILE } from './config';
import { getObjectFromBucket } from './bucket';
import { log } from './logger';
import { IVersionHistoryFile, IVersionFile, VersionAction, IVersionHistoryEntry } from './types';

const bucket = config.AWS_VERSIONS_BUCKET;
const versionsFolder = config.AWS_VERSIONS_FOLDER || '';
const bucketFullPath = bucket + '/' + versionsFolder;

export async function getVersionHistoryFileFromS3 (): Promise<IVersionHistoryFile> {
  log('debug', `fetching versions from bucket: ${bucketFullPath}`);

  let versionsFile: IVersionHistoryFile = await getObjectFromBucket(bucket, `${versionsFolder}/${VERSIONS_FILE}`);

  log('debug', `received ${VERSIONS_FILE} from S3`, versionsFile);

  if (!versionsFile) {
    log('debug', `${VERSIONS_FILE} not found - creating one`);
    versionsFile = {
      availableVersions: [],
      versionsHistory: [],
      keepHistoryCount: 20
    };
  }

  return versionsFile;
}

export async function getSingleVersionFileFromS3 (version: string): Promise<IVersionFile> {
  const versionPath = `${bucketFullPath}/${version}/${VERSION_FILE}`;
  log('debug', `fetching version "${version}" from bucket: ${versionPath}`);
  const file: IVersionFile = await getObjectFromBucket(bucket, versionPath);
  log('debug', 'got version file from s3', file);
  return file;
}

export function createVersionFile (params: {
  version: string,
  files: string[],
  path: string
}): IVersionFile {
  const versionFile = {
    version: params.version,
    files: params.files,
    date: new Date().toISOString()
  };

  writeFileSync(params.path, JSON.stringify(versionFile, null, 2));

  log('debug', `created version.json file at: ${params.path}`);

  return versionFile;
}

export function updateVersionHistory (existingHistory: IVersionHistoryFile, version: string, action: VersionAction): IVersionHistoryFile {
  const copyHistory = { ...existingHistory };
  const newEntry = {
    version,
    action,
    date: new Date().toISOString()
  };

  /* push the new entry and sort */
  copyHistory.availableVersions.push(version);
  copyHistory.versionsHistory.push(newEntry);
  copyHistory.versionsHistory.sort(compareDates);

  /* slice if over the history count */
  if (copyHistory.versionsHistory.length > copyHistory.keepHistoryCount) {
    copyHistory.versionsHistory = copyHistory.versionsHistory.slice(-copyHistory.keepHistoryCount);
    log('debug', 'remove old version history entries');
  }

  return copyHistory;
}

export function sortVersions (v1: string, v2: string): number {
  const [va1, va2] = [v1.split('.'), v2.split('.')];
  let sem1: string;
  let sem2: string;
  let res: number;
  for (let i = 0; i < va1.length; i++) {
    sem1 = va1[i];
    sem2 = va2[i];
    res = compareSemver(sem1, sem2);
    if (res !== 0) {
      return res;
    }
  }
  return 0;
}

function compareSemver (a: string, b: string) {
  let aa: number | string;
  let bb: number | string;
  try {
    aa = parseInt(a);
    bb = parseInt(b);
  } catch (e) {
    log('warn', 'error parsing semver for sorting', { semver1: a, semver: b });
    aa = a;
    bb = b;
  }
  if (aa > bb) return 1;
  if (bb > aa) return -1;
  return 0;
}

function compareDates (a: { date: string }, b: { date: string }): number {
  if (a.date > b.date) return 1;
  if (b.date > a.date) return -1;
  return 0;
}

function generateFakeHistory () {
  const count = 7;
  const history = [];
  const versions = [];
  const gDate = (i: number): string => {
    let d = new Date();
    d.setDate(d.getDate() + i - count);
    return d.toISOString();
  }
  for (let i = 0; i < count; i++) {
    const version = i + '.0.0'
    history.push({ version, date: gDate(i) } as any);
    versions.push(version);
  }

  return {
    availableVersions: versions,
    versionsHistory: history,
    keepHistoryCount: count - 2
  };
}