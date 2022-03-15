import GabcDocument from './jsonToGabc.class';
const { promisify } = require('util');
const { resolve } = require('path');
const fs = require('fs');
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);






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
    getFiles(inputFolder)
        .then(files => {
            files.map((filePath: string) => {

                convertFile(filePath, outputFolder)
            })
        })
        .catch(e => console.error(e));
}

const convertFile = (filePath: string, outputFolder: string) => {
    const doc = new GabcDocument();
    doc.transform_file(filePath, outputFolder);

}


async function getFiles(dir: string) {
    const subdirs = await readdir(dir);
    const files = await Promise.all(subdirs.map(async (subdir: string) => {
        const res = resolve(dir, subdir);
        return (await stat(res)).isDirectory() ? getFiles(res) : res;
    }));
    return files.reduce((a, f) => a.concat(f), []);
}


const args = getArguments();
if(Object.keys(args).indexOf("inputFolder") !== -1) {
    if(Object.keys(args).indexOf("outputFolder") !== -1) {
        convertFolder(args['inputFolder'], args['outputFolder'])
    }
}