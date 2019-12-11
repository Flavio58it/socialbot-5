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

    it ("Hash", function () {
        var result = matcher("#test", "This is a testing test");

        chai.expect(result).to.equal(true)
    });

    it ("User", function () {
        var result = matcher("@test", "This is a testing test @test");

        chai.expect(result).to.equal(true)
    });
})