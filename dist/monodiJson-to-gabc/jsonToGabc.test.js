"use strict";
exports.__esModule = true;
var jsonToGabc_class_1 = require("./jsonToGabc.class");
var chai_1 = require("chai");
require("mocha");
describe('Gatbc Model', function () {
    var doc = new jsonToGabc_class_1["default"]();
    describe('create_header', function () {
        it('should return a valid header', function () {
            var hasNoHeader = doc.create_header("1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20");
            (0, chai_1.expect)(hasNoHeader).be["true"];
            (0, chai_1.expect)(doc.data).to.equal("name: 1\ngabc-copyright: 2\nscore-copyright: 3\noffice-part: 4\noccasion: 5\nmeter: 6\ncommentary: 7\narranger: 8\nauthor: 9\ndate: 10\nmanuscript: 11\nmanuscript-reference: 12\nmanuscript-storage-place: 13\nbook: 14\nlanguage: 15\ntranscriber: 16\ntranscription-date: 17\nmode: 18\nuser-notes: 19\nannotation: 20\n\n");
        });
    });
    describe('transform_note', function () {
        it('should return the right character when clef change is not needed', function () {
            var char1 = doc.transform_note("a", 3, 1);
            (0, chai_1.expect)(char1['char']).to.equal("a");
            (0, chai_1.expect)(char1['clef_change']).to.be["false"];
            var char2 = doc.transform_note("d", 4, 1);
            (0, chai_1.expect)(char2['char']).to.equal("d");
            (0, chai_1.expect)(char2['clef_change']).to.be["false"];
        });
    });
    describe('getFlatStaffs', function () {
        it('should flat with 1 level', function () {
            var ex = "{\n                \"kind\": \"RootContainer\",\n                \"uuid\": \"b9c3268a-e987-472e-9f96-aee2f696b31c\",\n                \"children\": [\n                    {\n                        \"uuid\": \"5c4fd9b3-3299-4e9f-846d-26945e54a9bf\",\n                        \"kind\": \"FormteilContainer\",\n                        \"children\": [{\n                            \"uuid\": \"112eef3a-f25a-44ec-a116-00cd75020c22\",\n                            \"kind\": \"ZeileContainer\",\n                            \"children\": [\n                                {}\n                            ]\n                        }]\n                    },\n                    {\n                        \"uuid\": \"5c4fd9b3-3299-4e9f-846d-26945e54a9bf\",\n                        \"kind\": \"FormteilContainer\",\n                        \"children\": [{\n                            \"uuid\": \"112eef3a-f25a-44ec-a116-00cd75020c22\",\n                            \"kind\": \"ZeileContainer\",\n                            \"children\": [\n                                {}\n                            ]\n                        }]\n                    }\n                    ]\n            }";
            doc.importData(ex);
            var out = JSON.stringify(doc.getFlatStaffs());
            (0, chai_1.expect)(out).to.equal(JSON.stringify([{
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
                }]));
        });
    });
});
//# sourceMappingURL=jsonToGabc.test.js.map