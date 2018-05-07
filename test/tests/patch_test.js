import api, { createApi } from '../../src';
import snabbdom from 'snabbdom';
import snabbdomClass from 'snabbdom/modules/class';
import snabbdomProps from 'snabbdom/modules/props';
import snabbdomEventListeners from 'snabbdom/modules/eventlisteners';
import h from 'snabbdom/h';
import { knuthShuffle as shuffle } from 'knuth-shuffle';

function whenIframeReady(frame, func) {
  var doc;
  if ((doc = frame.contentDocument) && doc.readyState === 'complete') {
    func(doc.body);
  }
  else {
    frame.addEventListener('load', function() {
      func(frame.contentDocument.body);
    });
  }
}

// Borrowing a bunch from the snabbdom tests :)
function map(fn, list) {
  var ret = [];
  for (var i = 0; i < list.length; ++i) {
    ret[i] = fn(list[i]);
  }
  return ret;
}

function prop(name) {
  return function(obj) {
    return obj[name];
  };
}

var inner = prop('innerHTML');

[ api, createApi({ clean: true })].forEach((impl) => {
    describe("patching iframes with snabbdom-iframe-domapi", () => {
        let patch, elm, vnode0, vnode1;

        before(() => {
            // Initialize snabbdom with our API, as opposed to the default.
            patch = snabbdom.init([
                snabbdomClass,
                snabbdomProps,
                snabbdomEventListeners
            ], impl);
        });

        beforeEach(function() {
            elm = document.createElement('div');
            vnode1 = null;
            vnode0 = document.createElement('iframe');
            document.body.appendChild(vnode0);
        });

        afterEach(function() {
            if (vnode1 && vnode1.elm) {
                vnode1.elm.parentElement.removeChild(vnode1.elm);
            }
            if (vnode0.parentElement) {
                vnode0.parentElement.removeChild(vnode0);
            }
        });

        describe('updating children with keys', function() {
            function spanNum(n) {
                if (typeof n === 'string') {
                    return h('span', {}, n);
                } else {
                    return h('span', {
                        key: n
                    }, n.toString());
                }
            }
            describe('addition of elements', function() {
                it('appends elements', function(done) {
                    vnode1 = h('iframe', [1].map(spanNum));
                    var vnode2 = h('iframe', [1, 2, 3].map(spanNum));
                    patch(vnode0, vnode1);
                    whenIframeReady(vnode1.elm, function(b) {
                        assert.equal(b.children.length, 1);
                        patch(vnode1, vnode2);
                        whenIframeReady(vnode2.elm, function(b2) {
                            assert.equal(b2.children.length, 3);
                            assert.equal(b2.children[1].innerHTML, '2');
                            assert.equal(b2.children[2].innerHTML, '3');
                            done();
                        });
                    });
                });
                it('prepends elements', function(done) {
                    vnode1 = h('iframe', [4, 5].map(spanNum));
                    var vnode2 = h('iframe', [1, 2, 3, 4, 5].map(spanNum));
                    patch(vnode0, vnode1);
                    whenIframeReady(vnode1.elm, function(b) {
                        assert.equal(b.children.length, 2);
                        patch(vnode1, vnode2);
                        whenIframeReady(vnode2.elm, function(b2) {
                            assert.deepEqual(map(inner, b2.children), ['1', '2', '3', '4', '5']);
                            done();
                        });
                    });
                });
                it('add elements in the middle', function(done) {
                    vnode1 = h('iframe', [1, 2, 4, 5].map(spanNum));
                    var vnode2 = h('iframe', [1, 2, 3, 4, 5].map(spanNum));
                    patch(vnode0, vnode1);
                    whenIframeReady(vnode1.elm, function(b) {
                        assert.equal(b.children.length, 4);
                        patch(vnode1, vnode2);
                        whenIframeReady(vnode2.elm, function(b2) {
                            assert.deepEqual(map(inner, b2.children), ['1', '2', '3', '4', '5']);
                            done();
                        });
                    });
                });
                it('add elements at begin and end', function(done) {
                    vnode1 = h('iframe', [2, 3, 4].map(spanNum));
                    var vnode2 = h('iframe', [1, 2, 3, 4, 5].map(spanNum));
                    patch(vnode0, vnode1);
                    whenIframeReady(vnode1.elm, function(b) {
                        assert.equal(b.children.length, 3);
                        patch(vnode1, vnode2);
                        whenIframeReady(vnode2.elm, function(b2) {
                            assert.deepEqual(map(inner, b2.children), ['1', '2', '3', '4', '5']);
                            done();
                        });
                    });
                });
                it('adds children to parent with no children', function(done) {
                    vnode1 = h('iframe', {
                        key: 'iframe'
                    });
                    var vnode2 = h('iframe', {
                        key: 'iframe'
                    }, [1, 2, 3].map(spanNum));
                    patch(vnode0, vnode1);
                    whenIframeReady(vnode1.elm, function(b) {
                        assert.equal(b.children.length, 0);
                        patch(vnode1, vnode2);
                        whenIframeReady(vnode2.elm, function(b2) {
                            assert.deepEqual(map(inner, b2.children), ['1', '2', '3']);
                            done();
                        });
                    });
                });
                it('removes all children from parent', function(done) {
                    vnode1 = h('iframe', {
                        key: 'iframe'
                    }, [1, 2, 3].map(spanNum));
                    var vnode2 = h('iframe', {
                        key: 'iframe'
                    });
                    patch(vnode0, vnode1);
                    whenIframeReady(vnode1.elm, function(b) {
                        assert.deepEqual(map(inner, b.children), ['1', '2', '3']);
                        patch(vnode1, vnode2);
                        whenIframeReady(vnode2.elm, function(b2) {
                            assert.equal(b2.children.length, 0);
                            done();
                        });
                    });
                });
            });
            describe('removal of elements', function() {
                it('removes elements from the beginning', function(done) {
                    vnode1 = h('iframe', [1, 2, 3, 4, 5].map(spanNum));
                    var vnode2 = h('iframe', [3, 4, 5].map(spanNum));
                    patch(vnode0, vnode1);
                    whenIframeReady(vnode1.elm, function(b) {
                        assert.equal(b.children.length, 5);
                        patch(vnode1, vnode2);
                        whenIframeReady(vnode2.elm, function(b2) {
                            assert.deepEqual(map(inner, b2.children), ['3', '4', '5']);
                            done();
                        });
                    });
                });
                it('removes elements from the end', function(done) {
                    vnode1 = h('iframe', [1, 2, 3, 4, 5].map(spanNum));
                    var vnode2 = h('iframe', [1, 2, 3].map(spanNum));
                    patch(vnode0, vnode1);
                    whenIframeReady(vnode1.elm, function(b) {
                        assert.equal(b.children.length, 5);
                        patch(vnode1, vnode2);
                        whenIframeReady(vnode2.elm, function(b2) {
                            assert.equal(b2.children.length, 3);
                            assert.equal(b2.children[0].innerHTML, '1');
                            assert.equal(b2.children[1].innerHTML, '2');
                            assert.equal(b2.children[2].innerHTML, '3');
                            done();
                        });
                    });
                });
                it('removes elements from the middle', function(done) {
                    vnode1 = h('iframe', [1, 2, 3, 4, 5].map(spanNum));
                    var vnode2 = h('iframe', [1, 2, 4, 5].map(spanNum));
                    patch(vnode0, vnode1);
                    whenIframeReady(vnode1.elm, function(b) {
                        assert.equal(b.children.length, 5);
                        patch(vnode1, vnode2);
                        whenIframeReady(vnode2.elm, function(b2) {
                            assert.equal(b2.children.length, 4);
                            assert.deepEqual(b2.children[0].innerHTML, '1');
                            assert.equal(b2.children[0].innerHTML, '1');
                            assert.equal(b2.children[1].innerHTML, '2');
                            assert.equal(b2.children[2].innerHTML, '4');
                            assert.equal(b2.children[3].innerHTML, '5');
                            done();
                        });
                    });
                });
            });
            describe('element reordering', function() {
                it('moves element forward', function(done) {
                    vnode1 = h('iframe', [1, 2, 3, 4].map(spanNum));
                    var vnode2 = h('iframe', [2, 3, 1, 4].map(spanNum));
                    patch(vnode0, vnode1);
                    whenIframeReady(vnode1.elm, function(b) {
                        assert.equal(b.children.length, 4);
                        patch(vnode1, vnode2);
                        whenIframeReady(vnode2.elm, function(b2) {
                            assert.equal(b2.children.length, 4);
                            assert.equal(b2.children[0].innerHTML, '2');
                            assert.equal(b2.children[1].innerHTML, '3');
                            assert.equal(b2.children[2].innerHTML, '1');
                            assert.equal(b2.children[3].innerHTML, '4');
                            done();
                        });
                    });
                });
                it('moves element to end', function(done) {
                    vnode1 = h('iframe', [1, 2, 3].map(spanNum));
                    var vnode2 = h('iframe', [2, 3, 1].map(spanNum));
                    patch(vnode0, vnode1);
                    whenIframeReady(vnode1.elm, function(b) {
                        assert.equal(b.children.length, 3);
                        patch(vnode1, vnode2);
                        whenIframeReady(vnode2.elm, function(b2) {
                            assert.equal(b2.children.length, 3);
                            assert.equal(b2.children[0].innerHTML, '2');
                            assert.equal(b2.children[1].innerHTML, '3');
                            assert.equal(b2.children[2].innerHTML, '1');
                            done();
                        });
                    });
                });
                it('moves element backwards', function(done) {
                    vnode1 = h('iframe', [1, 2, 3, 4].map(spanNum));
                    var vnode2 = h('iframe', [1, 4, 2, 3].map(spanNum));
                    patch(vnode0, vnode1);
                    whenIframeReady(vnode1.elm, function(b) {
                        assert.equal(b.children.length, 4);
                        patch(vnode1, vnode2);
                        whenIframeReady(vnode2.elm, function(b2) {
                            assert.equal(b2.children.length, 4);
                            assert.equal(b2.children[0].innerHTML, '1');
                            assert.equal(b2.children[1].innerHTML, '4');
                            assert.equal(b2.children[2].innerHTML, '2');
                            assert.equal(b2.children[3].innerHTML, '3');
                            done();
                        });
                    });
                });
                it('swaps first and last', function(done) {
                    vnode1 = h('iframe', [1, 2, 3, 4].map(spanNum));
                    var vnode2 = h('iframe', [4, 2, 3, 1].map(spanNum));
                    patch(vnode0, vnode1);
                    whenIframeReady(vnode1.elm, function(b) {
                        assert.equal(b.children.length, 4);
                        patch(vnode1, vnode2);
                        whenIframeReady(vnode2.elm, function(b2) {
                            assert.equal(b2.children.length, 4);
                            assert.equal(b2.children[0].innerHTML, '4');
                            assert.equal(b2.children[1].innerHTML, '2');
                            assert.equal(b2.children[2].innerHTML, '3');
                            assert.equal(b2.children[3].innerHTML, '1');
                            done();
                        });
                    });
                });
            });
            describe('combinations of additions, removals and reorderings', function() {
                it('move to left and replace', function(done) {
                    vnode1 = h('iframe', [1, 2, 3, 4, 5].map(spanNum));
                    var vnode2 = h('iframe', [4, 1, 2, 3, 6].map(spanNum));
                    patch(vnode0, vnode1);
                    whenIframeReady(vnode1.elm, function(b) {
                        assert.equal(b.children.length, 5);
                        patch(vnode1, vnode2);
                        whenIframeReady(vnode2.elm, function(b2) {
                            assert.equal(b2.children.length, 5);
                            assert.equal(b2.children[0].innerHTML, '4');
                            assert.equal(b2.children[1].innerHTML, '1');
                            assert.equal(b2.children[2].innerHTML, '2');
                            assert.equal(b2.children[3].innerHTML, '3');
                            assert.equal(b2.children[4].innerHTML, '6');
                            done();
                        });
                    });
                });
                it('moves to left and leaves hole', function(done) {
                    vnode1 = h('iframe', [1, 4, 5].map(spanNum));
                    var vnode2 = h('iframe', [4, 6].map(spanNum));
                    patch(vnode0, vnode1);
                    whenIframeReady(vnode1.elm, function(b) {
                        assert.equal(b.children.length, 3);
                        patch(vnode1, vnode2);
                        whenIframeReady(vnode2.elm, function(b2) {
                            assert.deepEqual(map(inner, b2.children), ['4', '6']);
                            done();
                        });
                    });
                });
                it('handles moved and set to undefined element ending at the end', function(done) {
                    vnode1 = h('iframe', [2, 4, 5].map(spanNum));
                    var vnode2 = h('iframe', [4, 5, 3].map(spanNum));
                    patch(vnode0, vnode1);
                    whenIframeReady(vnode1.elm, function(b) {
                        assert.equal(b.children.length, 3);
                        patch(vnode1, vnode2);
                        whenIframeReady(vnode2.elm, function(b2) {
                            assert.equal(b2.children.length, 3);
                            assert.equal(b2.children[0].innerHTML, '4');
                            assert.equal(b2.children[1].innerHTML, '5');
                            assert.equal(b2.children[2].innerHTML, '3');
                            done();
                        });
                    });
                });
                it('moves a key in non-keyed nodes with a size up', function(done) {
                    vnode1 = h('iframe', [1, 'a', 'b', 'c'].map(spanNum));
                    var vnode2 = h('iframe', ['d', 'a', 'b', 'c', 1, 'e'].map(spanNum));
                    patch(vnode0, vnode1);
                    whenIframeReady(vnode1.elm, function(b) {
                        assert.equal(b.childNodes.length, 4);
                        assert.equal(b.textContent, '1abc');
                        patch(vnode1, vnode2);
                        whenIframeReady(vnode2.elm, function(b2) {
                            assert.equal(b2.childNodes.length, 6);
                            assert.equal(b2.textContent, 'dabc1e');
                            done();
                        });
                    });
                });
            });
            it('reverses elements', function(done) {
                vnode1 = h('iframe', [1, 2, 3, 4, 5, 6, 7, 8].map(spanNum));
                var vnode2 = h('iframe', [8, 7, 6, 5, 4, 3, 2, 1].map(spanNum));
                patch(vnode0, vnode1);
                whenIframeReady(vnode1.elm, function(b) {
                    assert.equal(b.children.length, 8);
                    patch(vnode1, vnode2);
                    whenIframeReady(vnode2.elm, function(b2) {
                        assert.deepEqual(map(inner, b2.children), ['8', '7', '6', '5', '4', '3', '2', '1']);
                        done();
                    });
                });
            });
            it('something', function(done) {
                vnode1 = h('iframe', [0, 1, 2, 3, 4, 5].map(spanNum));
                var vnode2 = h('iframe', [4, 3, 2, 1, 5, 0].map(spanNum));
                patch(vnode0, vnode1);
                whenIframeReady(vnode1.elm, function(b) {
                    assert.equal(b.children.length, 6);
                    patch(vnode1, vnode2);
                    whenIframeReady(vnode2.elm, function(b2) {
                        assert.deepEqual(map(inner, b2.children), ['4', '3', '2', '1', '5', '0']);
                        done();
                    });
                });
            });
            it('handles random shuffles', function(done) {
                var n, i, arr = [],
                    opacities = [],
                    elms = 14,
                    samples = 5;

                function spanNumWithOpacity(n, o) {
                    return h('span', {
                        key: n,
                        style: {
                            opacity: o
                        }
                    }, n.toString());
                }
                var vnodes0 = [],
                    vnodes1 = [],
                    vnodes2 = [];
                for (n = 0; n < elms; ++n) {
                    arr[n] = n;
                }
                for (n = 0; n < samples; ++n) {
                    vnodes1[n] = h('iframe', arr.map(function(n) {
                        return spanNumWithOpacity(n, '1');
                    }));
                    var shufArr = shuffle(arr.slice(0));
                    vnodes0[n] = document.createElement('iframe');
                    document.body.appendChild(vnodes0[n]);
                    patch(vnodes0[n], vnodes1[n]);
                    whenIframeReady(vnodes1[n].elm, (function(idx) {
                        return function(b) {
                            for (i = 0; i < elms; ++i) {
                                assert.equal(b.children[i].innerHTML, i.toString());
                                opacities[i] = Math.random().toFixed(5).toString();
                            }
                            vnodes2[idx] = h('iframe', {
                                props: {
                                    testFrameId: idx
                                }
                            }, arr.map(function(n) {
                                return spanNumWithOpacity(shufArr[n], opacities[n]);
                            }));
                            patch(vnodes1[idx], vnodes2[idx]);
                            whenIframeReady(vnodes2[idx].elm, function(b2) {
                                for (i = 0; i < elms; ++i) {
                                    assert.equal(b2.children[i].innerHTML, shufArr[i].toString());
                                    assert.equal(opacities[i].indexOf(b2.children[i].style.opacity), 0);
                                }
                                // Clean up the iframe.
                                vnodes2[idx].elm.parentElement.removeChild(vnodes2[idx].elm);
                                if (idx + 1 === samples) {
                                    done();
                                }
                            });
                        };
                    })(n));
                }
            });
        });
        describe('updating children without keys', function() {
            it('appends elements', function(done) {
                vnode1 = h('iframe', [h('span', 'Hello')]);
                var vnode2 = h('iframe', [h('span', 'Hello'), h('span', 'World')]);
                patch(vnode0, vnode1);
                whenIframeReady(vnode1.elm, function(b) {
                    assert.deepEqual(map(inner, b.children), ['Hello']);
                    patch(vnode1, vnode2);
                    whenIframeReady(vnode2.elm, function(b2) {
                        assert.deepEqual(map(inner, b2.children), ['Hello', 'World']);
                        done();
                    });
                });
            });
            it('handles unmoved text nodes', function(done) {
                vnode1 = h('iframe', ['Text', h('span', 'Span')]);
                var vnode2 = h('iframe', ['Text', h('span', 'Span')]);
                patch(vnode0, vnode1);
                whenIframeReady(vnode1.elm, function(b) {
                    assert.equal(b.childNodes[0].textContent, 'Text');
                    patch(vnode1, vnode2);
                    whenIframeReady(vnode2.elm, function(b2) {
                        assert.equal(b2.childNodes[0].textContent, 'Text');
                        done();
                    });
                });
            });
            it('handles changing text children', function(done) {
                vnode1 = h('iframe', ['Text', h('span', 'Span')]);
                var vnode2 = h('iframe', ['Text2', h('span', 'Span')]);
                patch(vnode0, vnode1);
                whenIframeReady(vnode1.elm, function(b) {
                    assert.equal(b.childNodes[0].textContent, 'Text');
                    patch(vnode1, vnode2);
                    whenIframeReady(vnode2.elm, function(b2) {
                        assert.equal(b2.childNodes[0].textContent, 'Text2');
                        done();
                    });
                });
            });
            it('prepends element', function(done) {
                vnode1 = h('iframe', [h('span', 'World')]);
                var vnode2 = h('iframe', [h('span', 'Hello'), h('span', 'World')]);
                patch(vnode0, vnode1);
                whenIframeReady(vnode1.elm, function(b) {
                    assert.deepEqual(map(inner, b.children), ['World']);
                    patch(vnode1, vnode2);
                    whenIframeReady(vnode2.elm, function(b2) {
                        assert.deepEqual(map(inner, b2.children), ['Hello', 'World']);
                        done();
                    });
                });
            });
            it('prepends element of different tag type', function(done) {
                vnode1 = h('iframe', [h('span', 'World')]);
                var vnode2 = h('iframe', [h('div', 'Hello'), h('span', 'World')]);
                patch(vnode0, vnode1);
                whenIframeReady(vnode1.elm, function(b) {
                    assert.deepEqual(map(inner, b.children), ['World']);
                    patch(vnode1, vnode2);
                    whenIframeReady(vnode2.elm, function(b2) {
                        assert.deepEqual(map(prop('tagName'), b2.children), ['DIV', 'SPAN']);
                        assert.deepEqual(map(inner, b2.children), ['Hello', 'World']);
                        done();
                    });
                });
            });
            it('removes elements', function(done) {
                vnode1 = h('iframe', [h('span', 'One'), h('span', 'Two'), h('span', 'Three')]);
                var vnode2 = h('iframe', [h('span', 'One'), h('span', 'Three')]);
                patch(vnode0, vnode1);
                whenIframeReady(vnode1.elm, function(b) {
                    assert.deepEqual(map(inner, b.children), ['One', 'Two', 'Three']);
                    patch(vnode1, vnode2);
                    whenIframeReady(vnode2.elm, function(b2) {
                        assert.deepEqual(map(inner, b2.children), ['One', 'Three']);
                        done();
                    });
                });
            });
            it('removes a single text node', function(done) {
                vnode1 = h('iframe', 'One');
                var vnode2 = h('iframe');
                patch(vnode0, vnode1);
                whenIframeReady(vnode1.elm, function(b) {
                    assert.equal(b.textContent, 'One');
                    patch(vnode1, vnode2);
                    whenIframeReady(vnode2.elm, function(b2) {
                        assert.equal(b2.textContent, '');
                        done();
                    });
                });
            });
            it('removes a single text node when children are updated', function(done) {
                vnode1 = h('iframe', 'One');
                var vnode2 = h('iframe', [h('div', 'Two'), h('span', 'Three')]);
                patch(vnode0, vnode1);
                whenIframeReady(vnode1.elm, function(b) {
                    assert.equal(b.textContent, 'One');
                    patch(vnode1, vnode2);
                    whenIframeReady(vnode2.elm, function(b2) {
                        assert.deepEqual(map(prop('textContent'), b2.childNodes), ['Two', 'Three']);
                        done();
                    });
                });
            });
            it('removes a text node among other elements', function(done) {
                vnode1 = h('iframe', ['One', h('span', 'Two')]);
                var vnode2 = h('iframe', [h('div', 'Three')]);
                patch(vnode0, vnode1);
                whenIframeReady(vnode1.elm, function(b) {
                    assert.deepEqual(map(prop('textContent'), b.childNodes), ['One', 'Two']);
                    patch(vnode1, vnode2);
                    whenIframeReady(vnode2.elm, function(b2) {
                        assert.equal(b2.childNodes.length, 1);
                        assert.equal(b2.childNodes[0].tagName, 'DIV');
                        assert.equal(b2.childNodes[0].textContent, 'Three');
                        done();
                    });
                });
            });
            it('reorders elements', function(done) {
                vnode1 = h('iframe', [h('span', 'One'), h('div', 'Two'), h('b', 'Three')]);
                var vnode2 = h('iframe', [h('b', 'Three'), h('span', 'One'), h('div', 'Two')]);
                patch(vnode0, vnode1);
                whenIframeReady(vnode1.elm, function(b) {
                    assert.deepEqual(map(inner, b.children), ['One', 'Two', 'Three']);
                    patch(vnode1, vnode2);
                    whenIframeReady(vnode2.elm, function(b2) {
                        assert.deepEqual(map(prop('tagName'), b2.children), ['B', 'SPAN', 'DIV']);
                        assert.deepEqual(map(inner, b2.children), ['Three', 'One', 'Two']);
                        done();
                    });
                });
            });
        });
    });
});
