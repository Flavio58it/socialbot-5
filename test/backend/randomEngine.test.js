import randomEngine from "../../src/shared/randEngine";

describe("#RandomEngine()", function () {
    it("Check without params, should throw error", function () {
        chai.expect(() => randomEngine()).to.throw("Random array engine cannot work out this.")
    });

    it("Check with all to 0, should return empty array", function () {
        chai.expect(randomEngine(0,0,0)).to.have.lengthOf(0)
    });

    it("Check with min and max to 0", function () {
        chai.expect(randomEngine(2,0,0)).to.have.members([0])
    });

    it("If one is requested from and to, 1 should be returned", function () {
        var result = randomEngine(1,1,1);
        chai.expect(result).to.have.members([1])
    });

    it("Check with from value that is greater to to value", function () {
        chai.expect(() => randomEngine(5, 5, 2)).to.throw("Random array engine cannot work out this.")
    });

    it("If too low max and min for size number fallback to maximum available size", function () {
        chai.expect(randomEngine(4, 1, 2)).to.have.lengthOf(2);
    });

    it("Check that the random value is correctly created", function () {
        var random = randomEngine(200, 3, 300)

        chai.expect(random).to.be.a("array")
        chai.expect(random).to.have.lengthOf(200);

        random.forEach((value) => {
            chai.expect(value).to.be.most(300)
            chai.expect(value).to.be.at.least(3)
        })
    });
})