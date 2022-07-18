import * as fs from 'fs';

export default class JsonToGabcConverter {
    private _data: any = "";
    dataOut: string;
    hasHeader = false;
    positionInAlphabet;
    existsZeileContainer;
    currentClef = 2;

    constructor() {
        this.positionInAlphabet = (position_input_alphabet: number, octave: number,
                                   input_alphabet: string, clef_position: number) =>
            position_input_alphabet + ((octave - 4) * input_alphabet.length) - ((clef_position - 1) * 2) + 2
        this.existsZeileContainer = (d: any) => d
            .map((e: any) => e['kind'] === "ZeileContainer")
            .filter((e: boolean) => e).length !== 0;

    }

    /**
    * Creates Header (not used yet)
     */
    create_header(name: string, gabcCopyright: string = "",
                  scoreCopyright: string = "",
                  officePart: string = "",
                  occasion: string = "",
                  meter: string = "",
                  commentary: string = "",
                  arranger: string = "",
                  author: string = "",
                  date: string = "",
                  manuscript: string = "",
                  manuscriptReference: string = "",
                  manuscriptStoragePlace: string = "",
                  book: string = "",
                  language: string = "",
                  transcriber: string = "",
                  transcriptionDate: string = "",
                  mode: string = "",
                  userNotes: string = "",
                  annotation: string = ""
    ) {
        if (this.hasHeader) {
            console.warn("Warning: Doc already has a header.")
            return false;
        }
        const header = [
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
    }


    /**
    * finds best clef position (not used yet)
     */
    find_other_clef(clef_position: number, position_of_ps: number,
                    octave: number, monodi_alphabet: string, gregorio_alphabet: string) {
        const other_clefs = [1, 2, 3, 4].filter((d) => d !== clef_position);
        const other_positions = other_clefs.map((d) => {
            return this.positionInAlphabet(position_of_ps, octave, monodi_alphabet, d);
        });

        const position_ratings = other_positions.map(d => Math.abs(d - (gregorio_alphabet.length / 2)));
        const best_clef = other_clefs[position_ratings.indexOf(Math.min(...position_ratings))];
        ////console.log("Best clef: ", best_clef)
        const position_in_greg_bc = this.positionInAlphabet(position_of_ps, octave, monodi_alphabet, best_clef);
        ////console.log("Position in greg: ", position_in_greg_bc);
        return {clef_change: true, clef: best_clef, char: gregorio_alphabet[position_in_greg_bc]};
    }

    /**
    * Gets gabc symbol from pitch/octave combination + clef offset.
     * clef position from top line 1 - 4
     */
    transform_note(pitch_symbol: string, octave: number, clef_position: number = this.currentClef) {
        const gregorio_alphabet = "abcdefghijklm";
        const monodi_alphabet = "cdefgab";


        const position_of_ps = monodi_alphabet.indexOf(pitch_symbol);
        const position_in_greg = this.positionInAlphabet(position_of_ps, octave, monodi_alphabet, clef_position);
        /*if (position_in_greg < 0 || position_in_greg >= gregorio_alphabet.length) {
            return this.find_other_clef(clef_position, position_of_ps, octave, monodi_alphabet, gregorio_alphabet);
        } else {*/
        return {clef_change: false, clef: clef_position, char: gregorio_alphabet[position_in_greg]};
        /*}*/
    }

    /**
    * Transforms Syllable Object into gabc string.
     */
    transform_syllable(syllable: any) {
        let text, wordWhitespace;
        if (Object.keys(syllable).indexOf('text') === -1 || syllable.kind === "FolioChange") {
            text = "";
            wordWhitespace = "";
            return "";
        } else {
            text = syllable['text'].replace("-", "").replace(" ", "");
            wordWhitespace = syllable['text'].match("-") ? "" : " ";
        }

        const notation = syllable?.notes?.spaced.map((spaced: any) => {
            return ["/", ...spaced?.nonSpaced?.map((nonspaced: any) => {
                return ["!", ...nonspaced?.grouped?.map((grouped: any) => {
                    return this.transform_note(grouped?.base.toLowerCase(), grouped?.octave)
                })]
            })]
        });
        const notes = notation?.flat(3)?.map((d: any) => d.char || "/" || "!");
        const clef = notation?.flat(3)?.map((d: any) => d.clef || "/" || "!");


        //console.log(text, clef, notes);
        const noteSequence = notes?.join("").replace(/^\/\//, "")
        return `${text}(${noteSequence})${wordWhitespace}`;
    }


    // @ts-ignore
    get data() {
        return this._data
    }

    /**
    * Flattening structure to staff object recursively
     */
    flatStaffRecur(d: any): any {
        if (!d) return []
        if (this.existsZeileContainer(d)) {
            return d;
        } else {
            return d.reduce((p: any, c: any) => {
                p.push(...this.flatStaffRecur(c['children']));
                return p;
            }, [])
        }
    }

    /**
    * Gets staff object without structure
     */
    getFlatStaffs() {
        return this.flatStaffRecur(this._data['children']);
    }

    /**
    * Imports data into class
     */
    importData(data: string) {
        this._data = JSON.parse(data);
    }

    /**
    * Transforms the whole document.
     */
    transform(data: string): string {
        this.importData(data)
        console.log("Data length: ", JSON.stringify(this._data).length)
        const lines = this.getFlatStaffs();
        const l = lines.reduce((out: any, lineContent: any) => {
            if (lineContent['kind'] === "ParatextContainer") return "";
            return [...out, lineContent['children'].reduce((out2: any, syl: any) => {
                return [...out2, this.transform_syllable(syl)]
            }, [])];
        }, [])
        const clefPref = `(c3)\n`;
        try {
            return [clefPref, l?.flat()?.join("")].join("");
        } catch (e) {
            console.log(e);
        }
    }

    /**
    * Open file, transform content, write file.
     */
    transform_file(inputFilePath: string, outputFolder: string) {
        fs.readFile(inputFilePath, "utf-8", (error, text) => {
            //console.log(text)
            if (!error) {
                this.dataOut = this.transform(text);
                if (!this.dataOut) {
                    console.log("Error: data undefined")
                    return false;
                }
                const outputFile = inputFilePath.replace(/.*\/(.*?)\.json/, "$1.gabc")
                fs.writeFile(outputFolder + "/" + outputFile, this.dataOut, (error) => {
                    if (error) {
                        console.error("Error: Couldn't write file", error);
                        return false;
                    }
                })
            } else {
                console.error("Node FS Error. Couldn't read file.")
                return false;
            }
        })
    }


}