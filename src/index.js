const TEXT_CONTENT = 'textContent';

export function createApi(opts) {
    let creationDoc = document;

    if (opts && opts.clean) {
        const creationFrame = document.createElement("iframe");
        document.head.appendChild(creationFrame);
        creationDoc = creationFrame.contentDocument;
        if (opts.trustedTypesPolicy) {
            creationFrame.contentWindow.trustedTypes.createPolicy('default', {
              createHTML: (string) =>
                opts.trustedTypesPolicy.createHTML(string).toString(),
              createScript: (string) => opts.trustedTypesPolicy.createScript(string).toString(),
              createScriptURL: (string) => opts.trustedTypesPolicy.createScriptURL(string).toString(),
            });
        }
    }

    return {
        createElement: function(tagName) {
            return creationDoc.createElement(tagName);
        },

        createElementNS: function(namespaceURI, tagName) {
            return creationDoc.createElementNS(namespaceURI, tagName);
        },

        createTextNode: function(text) {
            return creationDoc.createTextNode(text);
        },

        appendChild: function(parent, child) {
            dom('appendChild', parent, child);
        },

        removeChild: function(parent, child) {
            dom('removeChild', parent, child);
        },

        insertBefore: function(parent, child, before) {
            dom('insertBefore', parent, child, before);
        },

        parentNode: function(node) {
            return node.parentNode;
        },

        nextSibling: function(node) {
            return node.nextSibling;
        },

        tagName: function(node) {
            return node.tagName;
        },

        setTextContent: function(node, text) {
            dom(TEXT_CONTENT, node, text);
        }
    };
}

export default createApi()

// Perform DOM operations differently for iframes.
function dom(op, elm, first, second) {
    if (elm.tagName !== 'IFRAME') {
        if (op === TEXT_CONTENT) {
            elm[TEXT_CONTENT] = first;
        }
        else {
            elm[op](first, second);
        }
    }
    else {
        // Make sure the iframe is loaded (i.e. we have contentDocument) before
        // performing operations on the body.
        var f = function() { dom(op, elm.contentDocument.body, first, second); }
        if (elm.contentDocument && elm.contentDocument.readyState === 'complete') {
            f();
        }
        else {
            elm.addEventListener('load', f);
        }
    }
}
