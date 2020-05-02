/**
 * *************************************
 * VERSION TYPES
 * *************************************
 */

/** available action types */
export type VersionAction = 'upload' | 'overwrite' | 'delete';

/** version file format */
export interface IVersionFile {
  /** version */
  version: string;
  /** files in the version (relative paths) */
  files: string[];
  /** date of version */
  date: string;
}

/** version history object */
export interface IVersionHistoryEntry {
  /** version */
  version: string;
  /** date of action */
  date: string;
  /** action taken */
  action: VersionAction;
}

/** version history file formate */
export interface IVersionHistoryFile {
  /** versions available (ie. deployed to S3) */
  availableVersions: string[];
  /** version actions/events */
  versionsHistory: IVersionHistoryEntry[];
  /** how many version actions/events to keep in history */
  keepHistoryCount: number;
}