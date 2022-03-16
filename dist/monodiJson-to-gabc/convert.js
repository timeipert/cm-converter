"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var jsonToGabc_class_1 = require("./jsonToGabc.class");
var promisify = require('util').promisify;
var resolve = require('path').resolve;
var fs = require('fs');
var readdir = promisify(fs.readdir);
var stat = promisify(fs.stat);
var path = require('path');
var getArguments = function () {
    var args = process.argv.slice(2);
    return args.reduce(function (obj, d) {
        var splitted = d.split("=");
        var returnObj = __assign({}, obj);
        returnObj[splitted[0]] = splitted[1];
        return returnObj;
    }, {});
};
var convertFolder = function (inputFolder, outputFolder) {
    var files = getFiles(inputFolder).filter(function (f) {
        return f.match(/data\.json$/);
    }).map(function (f) {
        var folders = f.split("/");
        var file = folders.pop();
        return { folders: folders.join("/"), file: file };
    });
    console.log(files);
    files.forEach(function (file) {
        var folders = file.folders;
        var outPath = path.join(outputFolder, folders);
        var inFile = path.join(inputFolder, file.folders, file.file);
        console.log(outPath, inFile);
        if (!fs.existsSync(outPath)) {
            fs.mkdirSync(outPath, { recursive: true });
        }
        convertFile(inFile, outPath);
    });
};
var convertFile = function (filePath, outputFolder) {
    var doc = new jsonToGabc_class_1["default"]();
    doc.transform_file(filePath, outputFolder);
};
function getFiles(root, files, prefix) {
    if (files === void 0) { files = []; }
    if (prefix === void 0) { prefix = ''; }
    prefix = prefix || '';
    files = files || [];
    var dir = path.join(root, prefix);
    if (!fs.existsSync(dir))
        return files;
    if (fs.statSync(dir).isDirectory())
        fs.readdirSync(dir)
            .forEach(function (name) {
            getFiles(root, files, path.join(prefix, name));
        });
    else
        files.push(prefix);
    return files;
}
var args = getArguments();
if (Object.keys(args).indexOf("inputFolder") !== -1) {
    if (Object.keys(args).indexOf("outputFolder") !== -1) {
        convertFolder(args['inputFolder'], args['outputFolder']);
    }
}
//# sourceMappingURL=convert.js.map