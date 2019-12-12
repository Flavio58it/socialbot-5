import matcher from "../../src/shared/matcher";

describe("#matcher", function () {
    it ("Empty params", function () {
        var result = matcher();

        chai.expect(result).to.equal(false)
    });

    it ("Empty strings", function () {
        var result = matcher("", "");

        chai.expect(result).to.equal(true)
    });

    it ("Normal string", function () {
        var result = matcher("test|testing", "This is a testing test");

        chai.expect(result).to.equal(true)
    });

    it ("Uppercase string", function () {
        var result = matcher("test|testing", "This is a TESTING TEST");

        chai.expect(result).to.equal(true)
    });

    it ("Hash at end", function () {
        var result = matcher("#test", "This is a testing #test");

        chai.expect(result).to.equal(true)
    });

    it ("Hash in middle", function () {
        var result = matcher("#test", "This is a testing #test with test");

        chai.expect(result).to.equal(true)
    });

    it ("No hash", function () {
        var result = matcher("#test", "This is a testing test with test");

        chai.expect(result).to.equal(false)
    });

    it ("User", function () {
        var result = matcher("@test", "This is a testing test @test");

        chai.expect(result).to.equal(true)
    });

    it ("No user", function () {
        var result = matcher("@test", "This is a testing test test tester");

        chai.expect(result).to.equal(false)
    });
})