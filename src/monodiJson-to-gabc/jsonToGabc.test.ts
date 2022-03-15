import GabcDocument from './jsonToGabc.class';
import {expect, assert} from 'chai';
import 'mocha';

describe('Gatbc Model', () => {
    const doc = new GabcDocument();
    describe('create_header', () => {
        it('should return a valid header', () => {
            const hasNoHeader = doc.create_header("1", "2", "3",
                "4", "5", "6", "7", "8",
                "9", "10", "11", "12",
                "13", "14", "15", "16", "17", "18",
                "19", "20");
            expect(hasNoHeader).be.true
            expect(doc.data).to.equal(`name: 1
gabc-copyright: 2
score-copyright: 3
office-part: 4
occasion: 5
meter: 6
commentary: 7
arranger: 8
author: 9
date: 10
manuscript: 11
manuscript-reference: 12
manuscript-storage-place: 13
book: 14
language: 15
transcriber: 16
transcription-date: 17
mode: 18
user-notes: 19
annotation: 20

`);
        });
    })
    describe('transform_note', () => {
        it('should return the right character when clef change is not needed', () => {
            const char1 = doc.transform_note("a", 3, 1);
            expect(char1['char']).to.equal("a");
            expect(char1['clef_change']).to.be.false;
            const char2 = doc.transform_note("d", 4, 1);
            expect(char2['char']).to.equal("d");
            expect(char2['clef_change']).to.be.false;
        });
        it('should return the right character when clef change is needed', () => {
            const char3 = doc.transform_note("g", 5, 1);
            expect(char3['char']).to.equal("h");
            expect(char3['clef_change']).to.be.true;
            const char4 = doc.transform_note("e", 5, 3);
            expect(char4['char']).to.equal("h");
            expect(char4['clef_change']).to.be.false;
        })
    });
    describe('getFlatStaffs', () => {
        it('should flat with 1 level', () => {
            const ex = `{
                "kind": "RootContainer",
                "uuid": "b9c3268a-e987-472e-9f96-aee2f696b31c",
                "children": [
                    {
                        "uuid": "5c4fd9b3-3299-4e9f-846d-26945e54a9bf",
                        "kind": "FormteilContainer",
                        "children": [{
                            "uuid": "112eef3a-f25a-44ec-a116-00cd75020c22",
                            "kind": "ZeileContainer",
                            "children": [
                                {}
                            ]
                        }]
                    },
                    {
                        "uuid": "5c4fd9b3-3299-4e9f-846d-26945e54a9bf",
                        "kind": "FormteilContainer",
                        "children": [{
                            "uuid": "112eef3a-f25a-44ec-a116-00cd75020c22",
                            "kind": "ZeileContainer",
                            "children": [
                                {}
                            ]
                        }]
                    }
                    ]
            }`;
            doc.importData(ex);
            const out = JSON.stringify(doc.getFlatStaffs());
            expect(out).to.equal(JSON.stringify([{
                "uuid": "112eef3a-f25a-44ec-a116-00cd75020c22",
                "kind": "ZeileContainer",
                "children": [
                    {}
                ]
            },
                {
                    "uuid": "112eef3a-f25a-44ec-a116-00cd75020c22",
                    "kind": "ZeileContainer",
                    "children": [
                        {}
                    ]
                }]))
        })
    })
});