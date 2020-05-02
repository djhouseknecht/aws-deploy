[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/) 
[![dependabot-status](https://flat.badgen.net/dependabot/djhouseknecht/aws-deploy/?icon=dependabot)](https://dependabot.com/)
[![npm version](https://badge.fury.io/js/aws-deploy.svg)](https://badge.fury.io/js/@djhouseknecht%2Faws-deploy)

# AWS Deploy

## Overview

This will **upload** all your static files using semantic versioning. It will then be able to quickly **deploy** avialable versions quickly. You will also have the option to **delete** old versions. 

For this example, there will be a website (or web-app) hosted via a S3 bucket. We will call it **mywebsite.com**. In S3, there needs to be two buckets: 
1. The first, for hosting avaiable versions of the website 
2. The second, will hold the currently deploy version of the website. 

Example S3 buckets: 
```
S3
├── mywebsite-static-files
│   └── ...this will have all the versions of the website
└── mywebsite.com
    └── ...this will have the current version of the website and a Route53 record (optional, but highly recommended)
```

# Required Variables
There are several variables that are **required** for `aws-deploy` to work. These can be set using `process.env` or an `.env` file at the root directory. Veriables are parsed and loaded using [Unified-Env](https://github.com/djhouseknecht/unified-env) (which I think is a cool library - shameless plug).

Here is an example `.env`:
``` sh
# AWS configuration (all required)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-acces-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key

# S3 upload bucket (see "Uploading Versions")
AWS_VERSIONS_BUCKET=your-versions-bucket # required
AWS_VERSIONS_FOLDER=main-site/versions # optional
DIR_TO_UPLOAD=dist/ # required

# S3 deploy bucket (see "Deploying a Version")
AWS_DEPLOY_BUCKET=my-deployed-site # required
AWS_CLOUDFRONT_ID=your-cloudfront-dist-id # optional

# aws-deploy config
LOG_LEVEL=debug, info, warn, or error # optional
```

# Uploading Versions

Variables (`process.env` or `.env`): 
``` sh 
# this is the bucket name where the versions  
#   should be uploaded 
AWS_VERSIONS_BUCKET=your-versions-bucket # required

# this is an optional subfolder of the versions bucket
AWS_VERSIONS_FOLDER=main-site/versions # optional
```

`aws-deploy` will use the indicated bucket and optional folder to keep all versions. For the example of _mywebsite.com_, and the following config: 

``` sh
AWS_VERSIONS_BUCKET=mywebsite-static-files
AWS_VERSIONS_FOLDER=mywebsite.com/versions
```

`aws-deploy` will structure the uploads as follows: 

```
S3
└── mywebsite-static-files
    └── mywebsite.com
        └── versions
            ├── 1.0.0
            │   └── ...1.0.0's static files
            ├── 1.0.1
            │   └── ...1.0.1's static files
            ├── 2.0.0
            │   └── ...2.0.0's static files
            └── versions.json (file to track upload information)
```

## Basic Upload Usage

All commands called from the root of the project.

``` sh
# upload a new version to s3
npx s3-upload --overwrite # optional, flag

# list available versions
npx s3-upload --list
```

#### Uploading

`aws-deploy` will pull the current version from `./package.json`. It will check the configured static uploads bucket to see if that version exists. 

**If the version exists** - if the `--overwrite` flag is not set, it log an error and not upload the version. If the `--overwrite` flag is present, it will **delete** the previous version and upload the new version (updating the `versions.json`).

> If the version in `package.json` is the currently deployed version, it will error and not overwrite the version even if `--overwrite` is set

Once a version is uploaded, the `versions.json` file will be updated in the bucket. 

#### Listing Versions

``` sh 
# This command will list all available versions. 
npx s3-upload --list 
```


# Deploying a Version







AWS deployment utilities to deploy and manager code in AWS services like S3 and Cloudfront

## Coming soon... 

Main functions: 
1. upload versions
  * determine if a version already exists (need an overright flag to remove files first)
  * create a `version.json` with all the needed files and version number (maybe have a parameter to accept a `version.json` file)
  * upload to the private S3 bucket

2. deloy a version
  * if the version is already deloyed do nothing (unless there is a --force or --override flag)
  * copy all assets from the versions bucket to the website bucket (don't copy the same file twice? s3 may do this already)
  * update a `deployments.json` file in the website bucket
  * bust the cloudfront cache 
  * if a --cleanup flag is set, create a list of all the files from the previous version and delete them
