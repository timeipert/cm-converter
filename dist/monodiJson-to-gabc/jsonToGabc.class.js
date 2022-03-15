"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
var fs = require("fs");
var JsonToGabcConverter = (function () {
    function JsonToGabcConverter() {
        this._data = "";
        this.hasHeader = false;
        this.currentClef = 2;
        this.positionInAlphabet = function (position_input_alphabet, octave, input_alphabet, clef_position) {
            return position_input_alphabet + ((octave - 4) * input_alphabet.length) - ((clef_position - 1) * 2) + 2;
        };
        this.existsZeileContainer = function (d) { return d
            .map(function (e) { return e['kind'] === "ZeileContainer"; })
            .filter(function (e) { return e; }).length !== 0; };
    }
    JsonToGabcConverter.prototype.mode = function (array) {
        if (array.length == 0)
            return null;
        var modeMap = {};
        var maxEl = array[0], maxCount = 1;
        for (var i = 0; i < array.length; i++) {
            var el = array[i];
            if (modeMap[el] === null)
                modeMap[el] = 1;
            else
                modeMap[el] += 1;
            if (modeMap[el] > maxCount) {
                maxEl = el;
                maxCount = modeMap[el];
            }
        }
        return maxEl;
    };
    JsonToGabcConverter.prototype.create_header = function (name, gabcCopyright, scoreCopyright, officePart, occasion, meter, commentary, arranger, author, date, manuscript, manuscriptReference, manuscriptStoragePlace, book, language, transcriber, transcriptionDate, mode, userNotes, annotation) {
        if (gabcCopyright === void 0) { gabcCopyright = ""; }
        if (scoreCopyright === void 0) { scoreCopyright = ""; }
        if (officePart === void 0) { officePart = ""; }
        if (occasion === void 0) { occasion = ""; }
        if (meter === void 0) { meter = ""; }
        if (commentary === void 0) { commentary = ""; }
        if (arranger === void 0) { arranger = ""; }
        if (author === void 0) { author = ""; }
        if (date === void 0) { date = ""; }
        if (manuscript === void 0) { manuscript = ""; }
        if (manuscriptReference === void 0) { manuscriptReference = ""; }
        if (manuscriptStoragePlace === void 0) { manuscriptStoragePlace = ""; }
        if (book === void 0) { book = ""; }
        if (language === void 0) { language = ""; }
        if (transcriber === void 0) { transcriber = ""; }
        if (transcriptionDate === void 0) { transcriptionDate = ""; }
        if (mode === void 0) { mode = ""; }
        if (userNotes === void 0) { userNotes = ""; }
        if (annotation === void 0) { annotation = ""; }
        if (this.hasHeader) {
            console.warn("Warning: Doc already has a header.");
            return false;
        }
        var header = [
            "name: ", name, "\n",
            "gabc-copyright: ", gabcCopyright, "\n",
            "score-copyright: ", scoreCopyright, "\n",
            "office-part: ", officePart, "\n",
            "occasion: ", occasion, "\n",
            "meter: ", meter, "\n",
            "commentary: ", commentary, "\n",
            "arranger: ", arranger, "\n",
            "author: ", author, "\n",
            "date: ", date, "\n",
            "manuscript: ", manuscript, "\n",
            "manuscript-reference: ", manuscriptReference, "\n",
            "manuscript-storage-place: ", manuscriptStoragePlace, "\n",
            "book: ", book, "\n",
            "language: ", language, "\n",
            "transcriber: ", transcriber, "\n",
            "transcription-date: ", transcriptionDate, "\n",
            "mode: ", mode, "\n",
            "user-notes: ", userNotes, "\n",
            "annotation: ", annotation, "\n",
            "\n"
        ].join("");
        this._data = [header, this._data].join("");
        return true;
    };
    JsonToGabcConverter.prototype.find_other_clef = function (clef_position, position_of_ps, octave, monodi_alphabet, gregorio_alphabet) {
        var _this = this;
        var other_clefs = [1, 2, 3, 4].filter(function (d) { return d !== clef_position; });
        var other_positions = other_clefs.map(function (d) {
            return _this.positionInAlphabet(position_of_ps, octave, monodi_alphabet, d);
        });
        var position_ratings = other_positions.map(function (d) { return Math.abs(d - (gregorio_alphabet.length / 2)); });
        var best_clef = other_clefs[position_ratings.indexOf(Math.min.apply(Math, position_ratings))];
        var position_in_greg_bc = this.positionInAlphabet(position_of_ps, octave, monodi_alphabet, best_clef);
        return { clef_change: true, clef: best_clef, char: gregorio_alphabet[position_in_greg_bc] };
    };
    JsonToGabcConverter.prototype.transform_note = function (pitch_symbol, octave, clef_position) {
        if (clef_position === void 0) { clef_position = this.currentClef; }
        var gregorio_alphabet = "abcdefghijklm";
        var monodi_alphabet = "cdefgab";
        var position_of_ps = monodi_alphabet.indexOf(pitch_symbol);
        var position_in_greg = this.positionInAlphabet(position_of_ps, octave, monodi_alphabet, clef_position);
        return { clef_change: false, clef: clef_position, char: gregorio_alphabet[position_in_greg] };
    };
    JsonToGabcConverter.prototype.transform_syllable = function (syllable) {
        var _this = this;
        var _a, _b, _c;
        var text, wordWhitespace;
        if (Object.keys(syllable).indexOf('text') === -1 || syllable.kind === "FolioChange") {
            text = "";
            wordWhitespace = "";
            return "";
        }
        else {
            text = syllable['text'].replace("-", "").replace(" ", "");
            wordWhitespace = syllable['text'].match("-") ? "" : " ";
        }
        var notation = (_a = syllable === null || syllable === void 0 ? void 0 : syllable.notes) === null || _a === void 0 ? void 0 : _a.spaced.map(function (spaced) {
            var _a;
            return __spreadArray(["/"], (_a = spaced === null || spaced === void 0 ? void 0 : spaced.nonSpaced) === null || _a === void 0 ? void 0 : _a.map(function (nonspaced) {
                var _a;
                return __spreadArray(["!"], (_a = nonspaced === null || nonspaced === void 0 ? void 0 : nonspaced.grouped) === null || _a === void 0 ? void 0 : _a.map(function (grouped) {
                    return _this.transform_note(grouped === null || grouped === void 0 ? void 0 : grouped.base.toLowerCase(), grouped === null || grouped === void 0 ? void 0 : grouped.octave);
                }), true);
            }), true);
        });
        var notes = (_b = notation === null || notation === void 0 ? void 0 : notation.flat(3)) === null || _b === void 0 ? void 0 : _b.map(function (d) { return d.char || "/" || "!"; });
        var clef = (_c = notation === null || notation === void 0 ? void 0 : notation.flat(3)) === null || _c === void 0 ? void 0 : _c.map(function (d) { return d.clef || "/" || "!"; });
        var noteSequence = notes === null || notes === void 0 ? void 0 : notes.join("").replace(/^\/\//, "");
        return "".concat(text, "(").concat(noteSequence, ")").concat(wordWhitespace);
    };
    Object.defineProperty(JsonToGabcConverter.prototype, "data", {
        get: function () {
            return this._data;
        },
        enumerable: false,
        configurable: true
    });
    JsonToGabcConverter.prototype.flatStaffRecur = function (d) {
        var _this = this;
        if (!d)
            return [];
        if (this.existsZeileContainer(d)) {
            return d;
        }
        else {
            return d.reduce(function (p, c) {
                p.push.apply(p, _this.flatStaffRecur(c['children']));
                return p;
            }, []);
        }
    };
    JsonToGabcConverter.prototype.getFlatStaffs = function () {
        return this.flatStaffRecur(this._data['children']);
    };
    JsonToGabcConverter.prototype.importData = function (data) {
        this._data = JSON.parse(data);
    };
    JsonToGabcConverter.prototype.transform = function (data) {
        var _this = this;
        this.importData(data);
        var lines = this.getFlatStaffs();
        var l = lines.reduce(function (out, lineContent) {
            if (lineContent['kind'] === "ParatextContainer")
                return "";
            return __spreadArray(__spreadArray([], out, true), [lineContent['children'].reduce(function (out2, syl) {
                    return __spreadArray(__spreadArray([], out2, true), [_this.transform_syllable(syl)], false);
                }, [])], false);
        }, []);
        return l.flat().join("");
    };
    JsonToGabcConverter.prototype.transform_file = function (inputFilePath, outputFolder) {
        var _this = this;
        fs.readFile(inputFilePath, "utf-8", function (error, text) {
            if (!error) {
                _this.dataOut = _this.transform(text);
                var outputFile = inputFilePath.replace(/.*\/(.*?)\.json/, "$1.gabc");
                fs.writeFile(outputFolder + outputFile, _this.dataOut, function (error) {
                    if (error) {
                        console.error("Error: Couldn't write file", error);
                        return false;
                    }
                });
            }
            else {
                console.error("Node FS Error. Couldn't read file.");
                return false;
            }
        });
    };
    return JsonToGabcConverter;
}());
exports["default"] = JsonToGabcConverter;
//# sourceMappingURL=jsonToGabc.class.js.map