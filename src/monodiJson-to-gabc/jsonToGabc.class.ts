export default class JsonToGabcConverter {
    private _data: any = "";
    hasHeader = false;
    positionInAlphabet;
    existsZeileContainer;

    constructor() {
        this.positionInAlphabet = (position_input_alphabet: number, octave: number,
                                   input_alphabet: string, clef_position: number) =>
            position_input_alphabet + (octave * input_alphabet.length) - ((clef_position - 1) * 2)
        this.existsZeileContainer = (d: any) => d
            .map((e: any) => e['kind'] === "ZeileContainer")
            .filter((e: boolean) => e).length !== 0;

    }


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

    find_other_clef(clef_position: number, position_of_ps: number,
                    octave: number, monodi_alphabet: string, gregorio_alphabet: string) {
        const other_clefs = [1, 2, 3, 4].filter((d) => d !== clef_position);
        const other_positions = other_clefs.map((d) => {
            return this.positionInAlphabet(position_of_ps, octave, monodi_alphabet, d);
        });

        const position_ratings = other_positions.map(d => Math.abs(d - (gregorio_alphabet.length / 2)));
        const best_clef = other_clefs[position_ratings.indexOf(Math.min(...position_ratings))];
        console.log(best_clef)
        const position_in_greg_bc = this.positionInAlphabet(position_of_ps, octave, monodi_alphabet, best_clef);
        console.log(position_in_greg_bc);
        return {clef_change: true, clef: best_clef, char: gregorio_alphabet[position_in_greg_bc]};
    }

    // clef position from top line 1 - 4
    to_gregorio_char(pitch_symbol: string, octave: number, clef_position: number = 1) {
        const gregorio_alphabet = "abcdefghijklm";
        const monodi_alphabet = "abcdefg";


        const position_of_ps = monodi_alphabet.indexOf(pitch_symbol);
        const position_in_greg = this.positionInAlphabet(position_of_ps, octave, monodi_alphabet, clef_position);
        if (position_in_greg < 0 || position_in_greg >= gregorio_alphabet.length) {
            return this.find_other_clef(clef_position, position_of_ps, octave, monodi_alphabet, gregorio_alphabet);
        } else {
            return {clef_change: false, char: gregorio_alphabet[position_in_greg]};
        }
    }

    create_syllable() {

    }

    create_note() {

    }

    // @ts-ignore
    get data() {
        return this._data
    }

    flatStaffRecur(d: any): any {
        if (this.existsZeileContainer(d)) {
            return d;
        } else {
            return d.reduce((p: any, c: any) => {
                p.push(...this.flatStaffRecur(c['children']));
                return p;
            }, [])
        }
    }

    getFlatStaffs() {
        return this.flatStaffRecur(this._data['children']);
    }

    transform(data: string) {
        this._data = JSON.parse(data);
    }


}