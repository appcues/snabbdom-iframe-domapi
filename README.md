# snabbdom-iframe-domapi [![Build Status](https://travis-ci.org/appcues/snabbdom-iframe-domapi.svg?branch=master)](https://travis-ci.org/appcues/snabbdom-iframe-domapi)

 [Snabbdom](https://github.com/paldepind/snabbdom) allows you to provide alternative DOM implementations. This project provides a standard HTML DOM API along with iframe support, so that you can simply patch content inside of `<iframe>` elements. This allows one to do something like:

```javascript
var vnode0 = document.createElement('iframe');
document.body.appendChild(vnode0);
var vnode1 = h('iframe', [
    h('ul', [
        h('li', 'Thing 1'),
        h('li', 'Thing 2')
    ]),
    h('span', 'Another thing.')
]);
patch(vnode0, vnode1);
patch(vnode1, h('iframe', [
    h('ul', [
        h('li', 'Thing 0'),
        h('li', 'Thing 1'),
        h('li', 'Thing 2')
    ])
]));
```

And the childNodes will be added/removed from the `contentDocument.body` of the iframe when the iframe is fully ready/loaded.

## Usage

### Default

The default implementation simply uses the current window's `document` to create elements. This implementation is accessible as the default export.

```javascript
import domApi from 'snabbdom-iframe-domapi';
import snabbdom from 'snabbdom';
import snabbdomClass from 'snabbdom/modules/class';
import snabbdomProps from 'snabbdom/modules/props';
import snabbdomEventListeners from 'snabbdom/modules/eventlisteners';

let patch = snabbdom.init([
    snabbdomClass,
    snabbdomProps,
    snabbdomEventListeners
], domApi);
```

### Options

- `clean`
  
  You can specify a `clean` option to the `createApi` function. This will cause the implementation to create a new, clean Document (untouched by any changes to window globals), and it will use this "clean" document to create elements.
  
- `trustedTypesPolicy`
  
  You can pass a [`TrustedTypePolicy`](https://developer.mozilla.org/en-US/docs/Web/API/TrustedTypePolicy) to the `createApi` function via the `trustedTypesPolicy` option. When the `clean` option is true, this will cause the "clean" document to use that passed policy as the default policy when setting any "injection sinks." See the Trusted Types documentation for more details.

To set options simply pass a hash of option values to the `createApi` function:

```javascript
import { createApi } from 'snabbdom-iframe-domapi';
import snabbdom from 'snabbdom';
import snabbdomClass from 'snabbdom/modules/class';
import snabbdomProps from 'snabbdom/modules/props';
import snabbdomEventListeners from 'snabbdom/modules/eventlisteners';

const policy = window.trustedTypes.defaultPolicy;
const domApi = createApi({ clean: true, trustedTypesPolicy: policy });

const patch = snabbdom.init([
    snabbdomClass,
    snabbdomProps,
    snabbdomEventListeners
], domApi);
```
