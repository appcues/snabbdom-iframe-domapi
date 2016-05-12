# snabbdom-iframe-domapi

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
