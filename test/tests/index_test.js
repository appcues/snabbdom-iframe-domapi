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

    describe("createElement", () => {
        it("should create a DOM Element", () => {
            const el = api.createElement('iframe');
            expect(el).to.have.property('nodeName', 'IFRAME');
            expect(el).to.be.an.instanceOf(Element);
        });
    });

    describe("createElementNS", () => {
        it("should create a DOM Element with the specified namespace", () => {
            const el = api.createElementNS('http://www.w3.org/2000/svg', 'svg');
            expect(el).to.have.property('nodeName', 'svg');
            expect(el).to.have.property('namespaceURI', 'http://www.w3.org/2000/svg');
            expect(el).to.be.an.instanceOf(Element);
        });
    });

    describe("createTextNode", () => {
        it("should create a DOM Text node", () => {
            const node = api.createTextNode('snabbdom!');
            expect(node).to.have.property('textContent', 'snabbdom!');
            expect(node).to.have.property('nodeType', Node.TEXT_NODE);
            expect(node).to.be.an.instanceOf(Node);
        });
    });


});
