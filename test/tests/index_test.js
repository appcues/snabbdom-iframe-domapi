import * as api from '../../src';

describe("snabbdom-iframe-domapi", () => {
    it("should fulfill the required snabbdom interface", () => {
        expect(api.createElement).to.be.a('function');
        expect(api.createElementNS).to.be.a('function');
        expect(api.createTextNode).to.be.a('function');
        expect(api.appendChild).to.be.a('function');
        expect(api.removeChild).to.be.a('function');
        expect(api.insertBefore).to.be.a('function');
        expect(api.parentNode).to.be.a('function');
        expect(api.nextSibling).to.be.a('function');
        expect(api.tagName).to.be.a('function');
        expect(api.setTextContent).to.be.a('function');
    });
});
