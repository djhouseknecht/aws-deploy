import { stat as _stat, readdir as _readdir } from 'fs';
import path from 'path';
import { promisify } from 'util';

const stat = promisify(_stat);
const readdir = promisify(_readdir);

/**
 * Walk a given directory for files
 * @param dir directory to walk
 */
export async function walkDir (dir: string): Promise<string[]> {
  let files = await readdir(dir);
  files = await Promise.all(files.map(async (file: string) => {
    const filePath = path.join(dir, file);
    const stats = await stat(filePath);
    if (stats.isDirectory()) return walkDir(filePath);
    else if (stats.isFile()) return filePath;
  })) as string[];

  return files.reduce((all: string[], folderContents: string) => all.concat(folderContents), []);
}