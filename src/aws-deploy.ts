#!/usr/bin/env node

import { config } from './utils/config';
import { helpMessage } from './utils/help';
import * as upload from './upload';
import { log } from './utils/logger';


/**
 * Order: 
 *  - help (this will terminate process)
 *  - upload w/ list or history (this will terminate process)
 *  - delete (must have a version)
 *  - upload
 *  - deploy
 */
async function run () {
  /* if help is set, return */
  if (config.help) {
    return console.log(helpMessage);
  }

  /* if we are listing versions or history */
  if (config.list || config.history) {
    return upload.list().then(() => {
      log('error', 'list deployed version or history')
    });
  }

  /* if we are deleting version */
  if (config.delete) {
    if (!config.history) {
      return log('error', '`--delete` called without specifying a version using `--version`');
    }
    log('error', 'delete version IF IT IS NOT DEPLOYED TO PROD');
  }

  /* if upload is set, call to it */
  if (config.upload) {
    /* if we are listing, then return */
    if (config.list || config.history) {
      return upload.list();
    }
    /* otherwise, we will upload */
    await upload.upload();
  }

}


run();