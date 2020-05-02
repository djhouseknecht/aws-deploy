export const helpMessage = `
------------------------------------------------
GENERAL
------------------------------------------------
--help              : show help
--version=[version] : version (default: version from \`./package.json\`)
--list              : list available and deployed versions 
--history           : list of the history of upload and deployed versions

------------------------------------------------
UPLOAD
------------------------------------------------
--upload            : upload version to S3 static bucket
--overwrite=[bool]  : overwrite existing version in S3 static bucket (if exists)
                        (default: \`false\`)

------------------------------------------------
DEPLOY
------------------------------------------------
--deploy=[version]  : deploy specified version to hosted S3 bucket
                        (default: : version from \`./package.json\` 
                          or specified \`--version\`)

------------------------------------------------
DELETE
------------------------------------------------
--delete            : delete a version. must be called with --version
                        (does not default to \`package.json\` version)

------------------------------------------------
Order of Processing
------------------------------------------------
    --help (this will terminate process)
    --list or
      --history (this will terminate process)
    --delete (must be called with \`--version\`)
    --upload
    --deploy
`;