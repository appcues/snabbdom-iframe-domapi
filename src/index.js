const TEXT_CONTENT = 'textContent';

export function createElement(tagName) {
    return document.createElement(tagName);
}

export function createElementNS(namespaceURI, tagName) {
    return document.createElementNS(namespaceURI, tagName);
}

export function createTextNode(text) {
    return document.createTextNode(text);
}

export function appendChild(parent, child) {
    dom('appendChild', parent, child);
}

export function removeChild(parent, child) {
    dom('removeChild', parent, child);
}

export function insertBefore(parent, child, before) {
    dom('insertBefore', parent, child, before);
}

export function parentNode(node) {
    return node.parentNode;
}

export function nextSibling(node) {
    return node.nextSibling;
}

export function tagName(node) {
    return node.tagName;
}

export function setTextContent(node, text) {
    dom(TEXT_CONTENT, node, text);
}

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
