import api, { createApi } from '../../src';
import { Promise } from 'es6-promise';

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

    describe("should respect the clean option", () => {
        const cleanApi = createApi({ clean: true});
        const cleanEl = cleanApi.createElement("div");
        expect(cleanEl.ownerDocument).to.not.equal(document);

        const dirtyEl = api.createElement("div");
        expect(dirtyEl.ownerDocument).to.equal(document);
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

    describe("appendChild", () => {
        it("should append one element as the child of another when the parent isn't an iframe", () => {
            const par = api.createElement('div');
            const el = api.createElement('h1');
            api.appendChild(par, el);
            expect(par.firstChild).to.deep.equal(el);
            expect(el.parentNode).to.deep.equal(par);
        });

        it("should append a child element to the body of the contentDocument of an unloaded iframe", () => {
            const par = api.createElement('iframe');
            const el = api.createElement('h1');
            api.appendChild(par, el);
            document.body.appendChild(par);
            return waitReady(par).then((iframe) => {
                expect(iframe.contentDocument.body.firstChild).to.deep.equal(el);
                expect(el.parentNode).to.deep.equal(iframe.contentDocument.body);
                document.body.removeChild(par);
            });
        });

        it("should append a child element to the body of the contentDocument of a loaded iframe", () => {
            const par = api.createElement('iframe');
            document.body.appendChild(par);
            return waitReady(par).then((iframe) => {
                const el = api.createElement('h1');
                api.appendChild(iframe, el);
                expect(iframe.contentDocument.body.firstChild).to.deep.equal(el);
                expect(el.parentNode).to.deep.equal(iframe.contentDocument.body);
                document.body.removeChild(par);
            });
        });
    });

    describe("removeChild", () => {
        it("should remove a child element from it's parent", () => {
            const par = api.createElement('div');
            const el = api.createElement('h1');
            api.appendChild(par, el);
            expect(par.firstChild).to.deep.equal(el);
            expect(el.parentNode).to.deep.equal(par);
            api.removeChild(par, el);
            expect(par.firstChild).to.be.null;
            expect(el.parentNode).to.be.null;
        });

        it("should remove a child element from the body of the contentDocument of an unloaded iframe", () => {
            const par = api.createElement('iframe');
            const el = api.createElement('h1');
            api.appendChild(par, el);
            api.removeChild(par, el);
            document.body.appendChild(par);
            return waitReady(par).then((iframe) => {
                expect(iframe.contentDocument.body.firstChild).to.be.null;
                expect(el.parentNode).to.be.null;
                document.body.removeChild(par);
            });
        });

        it("should remove a child element from the body of the contentDocument of a loaded iframe", () => {
            const par = api.createElement('iframe');
            document.body.appendChild(par);
            return waitReady(par).then((iframe) => {
                const el = api.createElement('h1');
                api.appendChild(iframe, el);
                expect(iframe.contentDocument.body.firstChild).to.deep.equal(el);
                expect(el.parentNode).to.deep.equal(iframe.contentDocument.body);
                api.removeChild(iframe, el);
                expect(iframe.contentDocument.body.firstChild).to.be.null;
                expect(el.parentNode).to.be.null;
                document.body.removeChild(par);
            });
        });
    });

    describe("insertBefore", () => {
        it("should insert a node before the specified node as a child of the parent node", () => {
            const par = api.createElement('div');
            const el = api.createElement('h1');
            api.appendChild(par, el);
            expect(par.firstChild).to.deep.equal(el);
            expect(el.parentNode).to.deep.equal(par);
            const el2 = api.createElement('h2');
            api.insertBefore(par, el2, el);
            expect(par.firstChild).to.deep.equal(el2);
            expect(par.lastChild).to.deep.equal(el);
            expect(el2.parentNode).to.deep.equal(par);
            // If the "before node" is null, insert at the end.
            const el3 = api.createElement('h3');
            api.insertBefore(par, el3, null);
            expect(par.lastChild).to.deep.equal(el3);
        });

        it("should insert a node before the specified node as a child of the contentDocument of an unloaded iframe", () => {
            const par = api.createElement('iframe');
            const el = api.createElement('h1');
            api.appendChild(par, el);
            const el2 = api.createElement('h2');
            api.insertBefore(par, el2, el);
            document.body.appendChild(par);
            return waitReady(par).then((iframe) => {
                expect(iframe.contentDocument.body.firstChild).to.deep.equal(el2);
                expect(iframe.contentDocument.body.lastChild).to.deep.equal(el);
                expect(el2.parentNode).to.deep.equal(iframe.contentDocument.body);
                document.body.removeChild(par);
            });
        });

        it("should insert a node before the specified node as a child of the contentDocument of a loaded iframe", () => {
            const par = api.createElement('iframe');
            document.body.appendChild(par);
            return waitReady(par).then((iframe) => {
                const el = api.createElement('h1');
                api.appendChild(iframe.contentDocument.body, el);
                expect(iframe.contentDocument.body.firstChild).to.deep.equal(el);
                expect(el.parentNode).to.deep.equal(iframe.contentDocument.body);
                const el2 = api.createElement('h2');
                api.insertBefore(iframe.contentDocument.body, el2, el);
                expect(iframe.contentDocument.body.firstChild).to.deep.equal(el2);
                expect(iframe.contentDocument.body.lastChild).to.deep.equal(el);
                expect(el2.parentNode).to.deep.equal(iframe.contentDocument.body);
                // If the "before node" is null, insert at the end.
                const el3 = api.createElement('h3');
                api.insertBefore(iframe.contentDocument.body, el3, null);
                expect(iframe.contentDocument.body.lastChild).to.deep.equal(el3);
                document.body.removeChild(par);
            });
        });
    });

    describe("parentNode", () => {
        it("should get the correct parent node", () => {
            const par = api.createElement('div');
            const el = api.createElement('h1');
            api.appendChild(par, el);
            expect(api.parentNode(el)).to.deep.equal(par);
        });

        it("should get the correct parent node for an element within an iframe", () => {
            const par = api.createElement('iframe');
            const el = api.createElement('h1');
            api.appendChild(par, el);
            document.body.appendChild(par);
            return waitReady(par).then((iframe) => {
                expect(api.parentNode(el)).to.deep.equal(iframe.contentDocument.body);
                document.body.removeChild(par);
            });
        });
    });

    describe("nextSibling", () => {
        it("should get the correct sibling node", () => {
            const par = api.createElement('div');
            const el = api.createElement('h1');
            const el2 = api.createElement('h2');
            api.appendChild(par, el);
            api.insertBefore(par, el2, el);
            expect(api.nextSibling(el2)).to.deep.equal(el);
        });

        it("should get the correct sibling node for an element within an iframe", () => {
            const par = api.createElement('iframe');
            const el = api.createElement('h1');
            const el2 = api.createElement('h2');
            api.appendChild(par, el);
            api.insertBefore(par, el2, el);
            document.body.appendChild(par);
            return waitReady(par).then((iframe) => {
                expect(api.nextSibling(el2)).to.deep.equal(el);
                document.body.removeChild(par);
            });
        });
    });

    describe("tagName", () => {
        it("should get the tag name", () => {
            expect(api.tagName(api.createElement('iframe'))).to.deep.equal('IFRAME');
        });
    });

    describe("setTextContent", () => {
        it("should set text content on an element", () => {
            const el = api.createElement('div');
            api.setTextContent(el, 'snabbdom!');
            expect(el.textContent).to.equal('snabbdom!');
        });

        it("should text content on an unloaded iframe's contentDocument body", () => {
            const el = api.createElement('iframe');
            api.setTextContent(el, 'snabbdom!');
            document.body.appendChild(el);
            return waitReady(el).then((iframe) => {
                expect(iframe.contentDocument.body.textContent).to.equal('snabbdom!');
                document.body.removeChild(el);
            });
        });

        it("should text content on a loaded iframe's contentDocument body", () => {
            const el = api.createElement('iframe');
            document.body.appendChild(el);
            return waitReady(el).then((iframe) => {
                api.setTextContent(el, 'snabbdom!');
                expect(iframe.contentDocument.body.textContent).to.equal('snabbdom!');
                document.body.removeChild(el);
            });
        });
    });
});

// Resolves its promise when an iframe is loaded.
function waitReady(iframe) {
    if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
        return Promise.resolve(iframe);
    }
    else {
        const loadPromise = new Promise((resolve) => {
            iframe.addEventListener('load', () => {
                resolve(iframe);
            });
        });
        const timeoutPromise = new Promise((resolve, reject) => {
            window.setTimeout(() => {
                reject(new Error('iframe did not load.'));
            }, 1000);
        });
        // Race the iframe load event vs a timeout, to allow us to catch when
        // the iframe doens't load for some reason.
        return Promise.race([loadPromise, timeoutPromise]);
    }
}
