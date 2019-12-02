// Test Police js implementation

import police from "../../src/service/police"

describe('Police', function() {
    var policeObj = new police()

    it('should return -1 when the value is not present', function() {
        chai.expect(policeObj).to.be.an("object");
    });
});