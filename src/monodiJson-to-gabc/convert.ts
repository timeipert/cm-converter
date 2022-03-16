import GabcDocument from './jsonToGabc.class';

const fs = require('fs');
const path = require('path');

/**
 * Get command line arguments and pack into object so that:
 * node *.js name=value
 * =>
 * {name: value}
 */
const getArguments = () => {
    const args = process.argv.slice(2);
    return args.reduce((obj: any, d: string) => {
        const splitted = d.split("=");
        const returnObj = {...obj}
        returnObj[splitted[0]] = splitted[1];
        return returnObj;
    }, {});
}

/**
 * Converts the whole content of a folder recursively and writes it to outputFolder. Folder structure remains.
 */
const convertFolder = (inputFolder: string, outputFolder: string, filenameRegex: RegExp = /data\.json$/) => {
    const files = getFiles(inputFolder).filter((f: string) =>
        f.match(filenameRegex)).map((f: string) => {
        const folders = f.split("/");
        const file = folders.pop();
        return {folders: folders.join("/"), file};
    })
    console.log(files)
    files.forEach((file: any) => {
        const folders = file.folders;
        const outPath = path.join(outputFolder, folders);
        const inFile = path.join(inputFolder, file.folders, file.file);
        console.log(outPath, inFile)
        if (!fs.existsSync(outPath)) {
            fs.mkdirSync(outPath, {recursive: true});
        }
        convertFile(inFile, outPath)
    });
}

/**
 * Converts one file and writes it to outputFolder
 */
const convertFile = (filePath: string, outputFolder: string) => {
    const doc = new GabcDocument();
    doc.transform_file(filePath, outputFolder);
}

/**
 * Get list of files recursively
 */
function getFiles(root: any, files: any = [], prefix: any = '') {
    prefix = prefix || ''
    files = files || []

    var dir = path.join(root, prefix)
    if (!fs.existsSync(dir)) return files
    if (fs.statSync(dir).isDirectory())
        fs.readdirSync(dir)
            .forEach(function (name: string) {
                getFiles(root, files, path.join(prefix, name))
            })
    else
        files.push(prefix)
    return files
}

/**
 * main entry point
 */
const args = getArguments();
if (Object.keys(args).indexOf("inputFolder") !== -1) {
    if (Object.keys(args).indexOf("outputFolder") !== -1) {
        convertFolder(args['inputFolder'], args['outputFolder'])
    }
}