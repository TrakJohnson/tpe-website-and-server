const {cleanText} = require('./App.js');
const assert = require('assert');


describe("cleanText", () => {
    it("should remove spaces at the start of text", () => {
        assert.equal(
            cleanText(" 呵呵."),
            "呵呵."
        );
    });
    it("should remove spaces at the end of text", () => {
        assert.equal(
            cleanText("呵呵. "),
            "呵呵."
        );
    });
    it("should remove the whitespace before periods, question marks, and exclamation marks", () => {
        assert.equal(
            cleanText(["0", "."].join(" ")),
            "0."
        );
        assert.equal(
            cleanText(["1", "?"].join(" ")),
            "1?"
        );
        assert.equal(
            cleanText(["2", "!"].join(" ")),
            "2!"
        );
    });
    it("should ensure a whitespace after periods, question marks, and exclamation marks", () => {
        assert.equal(
            cleanText(["Ook", ".", "Ook", "?", "Ook", "!", "ok"].join(" ")),
            "Ook. Ook? Ook! ok"
        );
    });
    it("should remove the whitespace before commas, colons, semicolons, and closing parentheses", () => {
        assert.equal(
            cleanText(["0", ","].join(" ")),
            "0,"
        );
        assert.equal(
            cleanText(["1", ":"].join(" ")),
            "1:"
        );
        assert.equal(
            cleanText(["2", ";"].join(" ")),
            "2;"
        );
        assert.equal(
            cleanText(["3", ")"].join(" ")),
            "3)"
        );
    });
    it("should ensure a whitespace after commas, colons, semicolons, and closing parentheses", () => {
        assert.equal(
            cleanText(["1)", "ok", ",", "ok", ":", "not", "ok", ";", "ok"].join(" ")),
            "1) ok, ok: not ok; ok"
        );
    });
    it("should remove the whitespace after opening parentheses", () => {
        assert.equal(
            cleanText(["foo", "(", "bar）"].join(" ")),
            "foo (bar）"  // note: a chinese 全角 parenthesis '）' to isolate the test case
        )
    });
    it("should ensure a whitespace before opening parentheses", () => {
        assert.equal(
            cleanText(["goods", "(", "service）"].join(" ")),
            "goods (service）"
        )
    });
    it("should use normal single quotation marks", () => {
        assert.equal(
            cleanText("’"),
            "'"
        )
    });
    it("should remove the whitespaces directly before and after single quotation marks", () => {
        assert.equal(
            cleanText(["It", "does", "n", "'", "t", "work"].join(" ")),
            "It does n't work"
        )
    })
});
