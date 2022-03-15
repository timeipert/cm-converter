import GabcDocument from './jsonToGabc.class';
import ErrnoException = NodeJS.ErrnoException;

const {promisify} = require('util');
const {resolve} = require('path');
const fs = require('fs');
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const path = require('path');


const getArguments = () => {
    const args = process.argv.slice(2);
    return args.reduce((obj: any, d: string) => {
        const splitted = d.split("=");
        const returnObj = {...obj}
        returnObj[splitted[0]] = splitted[1];
        return returnObj;
    }, {});
}
const convertFolder = (inputFolder: string, outputFolder: string) => {
    const files = getFiles(inputFolder).filter((f: string) =>
        f.match(/\.json$/)).map((f: string) => {
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

const convertFile = (filePath: string, outputFolder: string) => {
    const doc = new GabcDocument();
    doc.transform_file(filePath, outputFolder);
}


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


const args = getArguments();
if (Object.keys(args).indexOf("inputFolder") !== -1) {
    if (Object.keys(args).indexOf("outputFolder") !== -1) {
        convertFolder(args['inputFolder'], args['outputFolder'])
    }
}