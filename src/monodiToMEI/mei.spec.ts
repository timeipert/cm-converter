interface mei {
    name: string;
    header: meiHead;
    body: Body;
}

interface meiHead {

}

interface Body {
    children: Section[];
}

interface Section {
    children: (Syllable|Paratext)[]|Section[];
}

interface Syllable {
    syl: string;
    neumes: Neume[];
}

interface Neume {
    children: NoteComponent[];
}

interface NoteComponent {
    pname: string|undefined;
    oct: number|undefined;
    con: string|undefined;
    children: SpecialSign[] | undefined
}
interface Paratext {

}

type SpecialSign = "quilisma" | "oriscus" | "liquescent" | "strophicus";