const e = Object.create;
const t = Object.defineProperty;
const n = Object.getOwnPropertyDescriptor;
const r = Object.getOwnPropertyNames;
const i = Object.getPrototypeOf;
const a = Object.prototype.hasOwnProperty;
const o = (e, t) => () => (e && (t = e((e = 0))), t);
const s = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), (e = null)), t.exports);
const c = (e, n) => {
    const r = {};
    for (const i in e) t(r, i, { get: e[i], enumerable: !0 });
    return (n || t(r, Symbol.toStringTag, { value: `Module` }), r);
};
const l = (e, i, o, s) => {
    if ((i && typeof i === `object`) || typeof i === `function`) {
        for (var c = r(i), l = 0, u = c.length, d; l < u; l++) {
            ((d = c[l]),
                !a.call(e, d) &&
                    d !== o &&
                    t(e, d, { get: ((e) => i[e]).bind(null, d), enumerable: !(s = n(i, d)) || s.enumerable }));
        }
    }
    return e;
};
const u = (n, r, a) => (
    (a = n == null ? {} : e(i(n))),
    l(r || !n || !n.__esModule ? t(a, `default`, { value: n, enumerable: !0 }) : a, n)
);
const d = (e) => (a.call(e, `module.exports`) ? e[`module.exports`] : l(t({}, `__esModule`, { value: !0 }), e));
(function () {
    const e = document.createElement(`link`).relList;
    if (e && e.supports && e.supports(`modulepreload`)) return;
    for (const e of document.querySelectorAll(`link[rel="modulepreload"]`)) n(e);
    new MutationObserver((e) => {
        for (const t of e) {
            if (t.type === `childList`) {
                for (const e of t.addedNodes) e.tagName === `LINK` && e.rel === `modulepreload` && n(e);
            }
        }
    }).observe(document, { childList: !0, subtree: !0 });
    function t(e) {
        const t = {};
        return (
            e.integrity && (t.integrity = e.integrity),
            e.referrerPolicy && (t.referrerPolicy = e.referrerPolicy),
            e.crossOrigin === `use-credentials`
                ? (t.credentials = `include`)
                : e.crossOrigin === `anonymous`
                  ? (t.credentials = `omit`)
                  : (t.credentials = `same-origin`),
            t
        );
    }
    function n(e) {
        if (e.ep) return;
        e.ep = !0;
        const n = t(e);
        fetch(e.href, n);
    }
})();
const f = s((e) => {
    const t = Symbol.for(`react.transitional.element`);
    const n = Symbol.for(`react.portal`);
    const r = Symbol.for(`react.fragment`);
    const i = Symbol.for(`react.strict_mode`);
    const a = Symbol.for(`react.profiler`);
    const o = Symbol.for(`react.consumer`);
    const s = Symbol.for(`react.context`);
    const c = Symbol.for(`react.forward_ref`);
    const l = Symbol.for(`react.suspense`);
    const u = Symbol.for(`react.memo`);
    const d = Symbol.for(`react.lazy`);
    const f = Symbol.for(`react.activity`);
    const p = Symbol.iterator;
    function m(e) {
        return typeof e !== `object` || !e
            ? null
            : ((e = (p && e[p]) || e[`@@iterator`]), typeof e === `function` ? e : null);
    }
    const h = {
        isMounted: function () {
            return !1;
        },
        enqueueForceUpdate: function () {},
        enqueueReplaceState: function () {},
        enqueueSetState: function () {}
    };
    const g = Object.assign;
    const _ = {};
    function v(e, t, n) {
        ((this.props = e), (this.context = t), (this.refs = _), (this.updater = n || h));
    }
    ((v.prototype.isReactComponent = {}),
        (v.prototype.setState = function (e, t) {
            if (typeof e !== `object` && typeof e !== `function` && e != null) {
                throw Error(
                    `takes an object of state variables to update or a function which returns an object of state variables.`
                );
            }
            this.updater.enqueueSetState(this, e, t, `setState`);
        }),
        (v.prototype.forceUpdate = function (e) {
            this.updater.enqueueForceUpdate(this, e, `forceUpdate`);
        }));
    function y() {}
    y.prototype = v.prototype;
    function b(e, t, n) {
        ((this.props = e), (this.context = t), (this.refs = _), (this.updater = n || h));
    }
    const x = (b.prototype = new y());
    ((x.constructor = b), g(x, v.prototype), (x.isPureReactComponent = !0));
    const S = Array.isArray;
    function C() {}
    const w = { H: null, A: null, T: null, S: null };
    const ee = Object.prototype.hasOwnProperty;
    function te(e, n, r) {
        const i = r.ref;
        return { $$typeof: t, type: e, key: n, ref: i === void 0 ? null : i, props: r };
    }
    function ne(e, t) {
        return te(e.type, t, e.props);
    }
    function re(e) {
        return typeof e === `object` && !!e && e.$$typeof === t;
    }
    function ie(e) {
        const t = { '=': `=0`, ':': `=2` };
        return (
            `$` +
            e.replace(/[=:]/g, function (e) {
                return t[e];
            })
        );
    }
    const ae = /\/+/g;
    function oe(e, t) {
        return typeof e === `object` && e && e.key != null ? ie(`` + e.key) : t.toString(36);
    }
    function se(e) {
        switch (e.status) {
            case `fulfilled`:
                return e.value;
            case `rejected`:
                throw e.reason;
            default:
                switch (
                    (typeof e.status === `string`
                        ? e.then(C, C)
                        : ((e.status = `pending`),
                          e.then(
                              function (t) {
                                  e.status === `pending` && ((e.status = `fulfilled`), (e.value = t));
                              },
                              function (t) {
                                  e.status === `pending` && ((e.status = `rejected`), (e.reason = t));
                              }
                          )),
                    e.status)
                ) {
                    case `fulfilled`:
                        return e.value;
                    case `rejected`:
                        throw e.reason;
                }
        }
        throw e;
    }
    function ce(e, r, i, a, o) {
        let s = typeof e;
        (s === `undefined` || s === `boolean`) && (e = null);
        let c = !1;
        if (e === null) c = !0;
        else {
            switch (s) {
                case `bigint`:
                case `string`:
                case `number`:
                    c = !0;
                    break;
                case `object`:
                    switch (e.$$typeof) {
                        case t:
                        case n:
                            c = !0;
                            break;
                        case d:
                            return ((c = e._init), ce(c(e._payload), r, i, a, o));
                    }
            }
        }
        if (c) {
            return (
                (o = o(e)),
                (c = a === `` ? `.` + oe(e, 0) : a),
                S(o)
                    ? ((i = ``),
                      c != null && (i = c.replace(ae, `$&/`) + `/`),
                      ce(o, r, i, ``, function (e) {
                          return e;
                      }))
                    : o != null &&
                      (re(o) &&
                          (o = ne(
                              o,
                              i +
                                  (o.key == null || (e && e.key === o.key)
                                      ? ``
                                      : (`` + o.key).replace(ae, `$&/`) + `/`) +
                                  c
                          )),
                      r.push(o)),
                1
            );
        }
        c = 0;
        const l = a === `` ? `.` : a + `:`;
        if (S(e)) for (var u = 0; u < e.length; u++) ((a = e[u]), (s = l + oe(a, u)), (c += ce(a, r, i, s, o)));
        else if (((u = m(e)), typeof u === `function`)) {
            for (e = u.call(e), u = 0; !(a = e.next()).done;) {
                ((a = a.value), (s = l + oe(a, u++)), (c += ce(a, r, i, s, o)));
            }
        } else if (s === `object`) {
            if (typeof e.then === `function`) return ce(se(e), r, i, a, o);
            throw (
                (r = String(e)),
                Error(
                    `Objects are not valid as a React child (found: ` +
                        (r === `[object Object]` ? `object with keys {` + Object.keys(e).join(`, `) + `}` : r) +
                        `). If you meant to render a collection of children, use an array instead.`
                )
            );
        }
        return c;
    }
    function le(e, t, n) {
        if (e == null) return e;
        const r = [];
        let i = 0;
        return (
            ce(e, r, ``, ``, function (e) {
                return t.call(n, e, i++);
            }),
            r
        );
    }
    function ue(e) {
        if (e._status === -1) {
            let t = e._result;
            ((t = t()),
                t.then(
                    function (t) {
                        (e._status === 0 || e._status === -1) && ((e._status = 1), (e._result = t));
                    },
                    function (t) {
                        (e._status === 0 || e._status === -1) && ((e._status = 2), (e._result = t));
                    }
                ),
                e._status === -1 && ((e._status = 0), (e._result = t)));
        }
        if (e._status === 1) return e._result.default;
        throw e._result;
    }
    const T =
        typeof reportError === `function`
            ? reportError
            : function (e) {
                  if (typeof window === `object` && typeof window.ErrorEvent === `function`) {
                      const t = new window.ErrorEvent(`error`, {
                          bubbles: !0,
                          cancelable: !0,
                          message:
                              typeof e === `object` && e && typeof e.message === `string`
                                  ? String(e.message)
                                  : String(e),
                          error: e
                      });
                      if (!window.dispatchEvent(t)) return;
                  } else if (typeof process === `object` && typeof process.emit === `function`) {
                      process.emit(`uncaughtException`, e);
                      return;
                  }
                  console.error(e);
              };
    const E = {
        map: le,
        forEach: function (e, t, n) {
            le(
                e,
                function () {
                    t.apply(this, arguments);
                },
                n
            );
        },
        count: function (e) {
            let t = 0;
            return (
                le(e, function () {
                    t++;
                }),
                t
            );
        },
        toArray: function (e) {
            return (
                le(e, function (e) {
                    return e;
                }) || []
            );
        },
        only: function (e) {
            if (!re(e)) throw Error(`React.Children.only expected to receive a single React element child.`);
            return e;
        }
    };
    ((e.Activity = f),
        (e.Children = E),
        (e.Component = v),
        (e.Fragment = r),
        (e.Profiler = a),
        (e.PureComponent = b),
        (e.StrictMode = i),
        (e.Suspense = l),
        (e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = w),
        (e.__COMPILER_RUNTIME = {
            __proto__: null,
            c: function (e) {
                return w.H.useMemoCache(e);
            }
        }),
        (e.cache = function (e) {
            return function () {
                return e.apply(null, arguments);
            };
        }),
        (e.cacheSignal = function () {
            return null;
        }),
        (e.cloneElement = function (e, t, n) {
            if (e == null) throw Error(`The argument must be a React element, but you passed ` + e + `.`);
            const r = g({}, e.props);
            let i = e.key;
            if (t != null) {
                for (a in (t.key !== void 0 && (i = `` + t.key), t)) {
                    !ee.call(t, a) ||
                        a === `key` ||
                        a === `__self` ||
                        a === `__source` ||
                        (a === `ref` && t.ref === void 0) ||
                        (r[a] = t[a]);
                }
            }
            var a = arguments.length - 2;
            if (a === 1) r.children = n;
            else if (a > 1) {
                for (var o = Array(a), s = 0; s < a; s++) o[s] = arguments[s + 2];
                r.children = o;
            }
            return te(e.type, i, r);
        }),
        (e.createContext = function (e) {
            return (
                (e = {
                    $$typeof: s,
                    _currentValue: e,
                    _currentValue2: e,
                    _threadCount: 0,
                    Provider: null,
                    Consumer: null
                }),
                (e.Provider = e),
                (e.Consumer = { $$typeof: o, _context: e }),
                e
            );
        }),
        (e.createElement = function (e, t, n) {
            let r;
            const i = {};
            let a = null;
            if (t != null) {
                for (r in (t.key !== void 0 && (a = `` + t.key), t)) {
                    ee.call(t, r) && r !== `key` && r !== `__self` && r !== `__source` && (i[r] = t[r]);
                }
            }
            let o = arguments.length - 2;
            if (o === 1) i.children = n;
            else if (o > 1) {
                for (var s = Array(o), c = 0; c < o; c++) s[c] = arguments[c + 2];
                i.children = s;
            }
            if (e && e.defaultProps) for (r in ((o = e.defaultProps), o)) i[r] === void 0 && (i[r] = o[r]);
            return te(e, a, i);
        }),
        (e.createRef = function () {
            return { current: null };
        }),
        (e.forwardRef = function (e) {
            return { $$typeof: c, render: e };
        }),
        (e.isValidElement = re),
        (e.lazy = function (e) {
            return { $$typeof: d, _payload: { _status: -1, _result: e }, _init: ue };
        }),
        (e.memo = function (e, t) {
            return { $$typeof: u, type: e, compare: t === void 0 ? null : t };
        }),
        (e.startTransition = function (e) {
            const t = w.T;
            const n = {};
            w.T = n;
            try {
                const r = e();
                const i = w.S;
                (i !== null && i(n, r), typeof r === `object` && r && typeof r.then === `function` && r.then(C, T));
            } catch (e) {
                T(e);
            } finally {
                (t !== null && n.types !== null && (t.types = n.types), (w.T = t));
            }
        }),
        (e.unstable_useCacheRefresh = function () {
            return w.H.useCacheRefresh();
        }),
        (e.use = function (e) {
            return w.H.use(e);
        }),
        (e.useActionState = function (e, t, n) {
            return w.H.useActionState(e, t, n);
        }),
        (e.useCallback = function (e, t) {
            return w.H.useCallback(e, t);
        }),
        (e.useContext = function (e) {
            return w.H.useContext(e);
        }),
        (e.useDebugValue = function () {}),
        (e.useDeferredValue = function (e, t) {
            return w.H.useDeferredValue(e, t);
        }),
        (e.useEffect = function (e, t) {
            return w.H.useEffect(e, t);
        }),
        (e.useEffectEvent = function (e) {
            return w.H.useEffectEvent(e);
        }),
        (e.useId = function () {
            return w.H.useId();
        }),
        (e.useImperativeHandle = function (e, t, n) {
            return w.H.useImperativeHandle(e, t, n);
        }),
        (e.useInsertionEffect = function (e, t) {
            return w.H.useInsertionEffect(e, t);
        }),
        (e.useLayoutEffect = function (e, t) {
            return w.H.useLayoutEffect(e, t);
        }),
        (e.useMemo = function (e, t) {
            return w.H.useMemo(e, t);
        }),
        (e.useOptimistic = function (e, t) {
            return w.H.useOptimistic(e, t);
        }),
        (e.useReducer = function (e, t, n) {
            return w.H.useReducer(e, t, n);
        }),
        (e.useRef = function (e) {
            return w.H.useRef(e);
        }),
        (e.useState = function (e) {
            return w.H.useState(e);
        }),
        (e.useSyncExternalStore = function (e, t, n) {
            return w.H.useSyncExternalStore(e, t, n);
        }),
        (e.useTransition = function () {
            return w.H.useTransition();
        }),
        (e.version = `19.2.6`));
});
const p = s((e, t) => {
    t.exports = f();
});
const m = s((e) => {
    function t(e, t) {
        let n = e.length;
        e.push(t);
        a: for (; n > 0;) {
            const r = (n - 1) >>> 1;
            const a = e[r];
            if (i(a, t) > 0) ((e[r] = t), (e[n] = a), (n = r));
            else break a;
        }
    }
    function n(e) {
        return e.length === 0 ? null : e[0];
    }
    function r(e) {
        if (e.length === 0) return null;
        const t = e[0];
        const n = e.pop();
        if (n !== t) {
            e[0] = n;
            a: for (let r = 0, a = e.length, o = a >>> 1; r < o;) {
                const s = 2 * (r + 1) - 1;
                const c = e[s];
                const l = s + 1;
                const u = e[l];
                if (i(c, n) < 0) {
                    l < a && i(u, c) < 0 ? ((e[r] = u), (e[l] = n), (r = l)) : ((e[r] = c), (e[s] = n), (r = s));
                } else if (l < a && i(u, n) < 0) ((e[r] = u), (e[l] = n), (r = l));
                else break a;
            }
        }
        return t;
    }
    function i(e, t) {
        const n = e.sortIndex - t.sortIndex;
        return n === 0 ? e.id - t.id : n;
    }
    if (((e.unstable_now = void 0), typeof performance === `object` && typeof performance.now === `function`)) {
        const a = performance;
        e.unstable_now = function () {
            return a.now();
        };
    } else {
        const o = Date;
        const s = o.now();
        e.unstable_now = function () {
            return o.now() - s;
        };
    }
    const c = [];
    const l = [];
    let u = 1;
    let d = null;
    let f = 3;
    let p = !1;
    let m = !1;
    let h = !1;
    let g = !1;
    const _ = typeof setTimeout === `function` ? setTimeout : null;
    const v = typeof clearTimeout === `function` ? clearTimeout : null;
    const y = typeof setImmediate < `u` ? setImmediate : null;
    function b(e) {
        for (let i = n(l); i !== null;) {
            if (i.callback === null) r(l);
            else if (i.startTime <= e) (r(l), (i.sortIndex = i.expirationTime), t(c, i));
            else break;
            i = n(l);
        }
    }
    function x(e) {
        if (((h = !1), b(e), !m)) {
            if (n(c) !== null) ((m = !0), S || ((S = !0), re()));
            else {
                const t = n(l);
                t !== null && oe(x, t.startTime - e);
            }
        }
    }
    var S = !1;
    let C = -1;
    let w = 5;
    let ee = -1;
    function te() {
        return g ? !0 : !(e.unstable_now() - ee < w);
    }
    function ne() {
        if (((g = !1), S)) {
            let t = e.unstable_now();
            ee = t;
            let i = !0;
            try {
                a: {
                    ((m = !1), h && ((h = !1), v(C), (C = -1)), (p = !0));
                    const a = f;
                    try {
                        b: {
                            for (b(t), d = n(c); d !== null && !(d.expirationTime > t && te());) {
                                const o = d.callback;
                                if (typeof o === `function`) {
                                    ((d.callback = null), (f = d.priorityLevel));
                                    const s = o(d.expirationTime <= t);
                                    if (((t = e.unstable_now()), typeof s === `function`)) {
                                        ((d.callback = s), b(t), (i = !0));
                                        break b;
                                    }
                                    (d === n(c) && r(c), b(t));
                                } else r(c);
                                d = n(c);
                            }
                            if (d !== null) i = !0;
                            else {
                                const u = n(l);
                                (u !== null && oe(x, u.startTime - t), (i = !1));
                            }
                        }
                        break a;
                    } finally {
                        ((d = null), (f = a), (p = !1));
                    }
                    i = void 0;
                }
            } finally {
                i ? re() : (S = !1);
            }
        }
    }
    let re;
    if (typeof y === `function`) {
        re = function () {
            y(ne);
        };
    } else if (typeof MessageChannel < `u`) {
        const ie = new MessageChannel();
        const ae = ie.port2;
        ((ie.port1.onmessage = ne),
            (re = function () {
                ae.postMessage(null);
            }));
    } else {
        re = function () {
            _(ne, 0);
        };
    }
    function oe(t, n) {
        C = _(function () {
            t(e.unstable_now());
        }, n);
    }
    ((e.unstable_IdlePriority = 5),
        (e.unstable_ImmediatePriority = 1),
        (e.unstable_LowPriority = 4),
        (e.unstable_NormalPriority = 3),
        (e.unstable_Profiling = null),
        (e.unstable_UserBlockingPriority = 2),
        (e.unstable_cancelCallback = function (e) {
            e.callback = null;
        }),
        (e.unstable_forceFrameRate = function (e) {
            e < 0 || e > 125
                ? console.error(
                      `forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported`
                  )
                : (w = e > 0 ? Math.floor(1e3 / e) : 5);
        }),
        (e.unstable_getCurrentPriorityLevel = function () {
            return f;
        }),
        (e.unstable_next = function (e) {
            switch (f) {
                case 1:
                case 2:
                case 3:
                    var t = 3;
                    break;
                default:
                    t = f;
            }
            const n = f;
            f = t;
            try {
                return e();
            } finally {
                f = n;
            }
        }),
        (e.unstable_requestPaint = function () {
            g = !0;
        }),
        (e.unstable_runWithPriority = function (e, t) {
            switch (e) {
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                    break;
                default:
                    e = 3;
            }
            const n = f;
            f = e;
            try {
                return t();
            } finally {
                f = n;
            }
        }),
        (e.unstable_scheduleCallback = function (r, i, a) {
            const o = e.unstable_now();
            switch (
                (typeof a === `object` && a
                    ? ((a = a.delay), (a = typeof a === `number` && a > 0 ? o + a : o))
                    : (a = o),
                r)
            ) {
                case 1:
                    var s = -1;
                    break;
                case 2:
                    s = 250;
                    break;
                case 5:
                    s = 1073741823;
                    break;
                case 4:
                    s = 1e4;
                    break;
                default:
                    s = 5e3;
            }
            return (
                (s = a + s),
                (r = { id: u++, callback: i, priorityLevel: r, startTime: a, expirationTime: s, sortIndex: -1 }),
                a > o
                    ? ((r.sortIndex = a),
                      t(l, r),
                      n(c) === null && r === n(l) && (h ? (v(C), (C = -1)) : (h = !0), oe(x, a - o)))
                    : ((r.sortIndex = s), t(c, r), m || p || ((m = !0), S || ((S = !0), re()))),
                r
            );
        }),
        (e.unstable_shouldYield = te),
        (e.unstable_wrapCallback = function (e) {
            const t = f;
            return function () {
                const n = f;
                f = t;
                try {
                    return e.apply(this, arguments);
                } finally {
                    f = n;
                }
            };
        }));
});
const h = s((e, t) => {
    t.exports = m();
});
const g = s((e) => {
    const t = p();
    function n(e) {
        let t = `https://react.dev/errors/` + e;
        if (arguments.length > 1) {
            t += `?args[]=` + encodeURIComponent(arguments[1]);
            for (let n = 2; n < arguments.length; n++) t += `&args[]=` + encodeURIComponent(arguments[n]);
        }
        return (
            `Minified React error #` +
            e +
            `; visit ` +
            t +
            ` for the full message or use the non-minified dev environment for full errors and additional helpful warnings.`
        );
    }
    function r() {}
    const i = {
        d: {
            f: r,
            r: function () {
                throw Error(n(522));
            },
            D: r,
            C: r,
            L: r,
            m: r,
            X: r,
            S: r,
            M: r
        },
        p: 0,
        findDOMNode: null
    };
    const a = Symbol.for(`react.portal`);
    function o(e, t, n) {
        const r = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : null;
        return { $$typeof: a, key: r == null ? null : `` + r, children: e, containerInfo: t, implementation: n };
    }
    const s = t.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
    function c(e, t) {
        if (e === `font`) return ``;
        if (typeof t === `string`) return t === `use-credentials` ? t : ``;
    }
    ((e.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = i),
        (e.createPortal = function (e, t) {
            const r = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : null;
            if (!t || (t.nodeType !== 1 && t.nodeType !== 9 && t.nodeType !== 11)) throw Error(n(299));
            return o(e, t, null, r);
        }),
        (e.flushSync = function (e) {
            const t = s.T;
            const n = i.p;
            try {
                if (((s.T = null), (i.p = 2), e)) return e();
            } finally {
                ((s.T = t), (i.p = n), i.d.f());
            }
        }),
        (e.preconnect = function (e, t) {
            typeof e === `string` &&
                (t
                    ? ((t = t.crossOrigin), (t = typeof t === `string` ? (t === `use-credentials` ? t : ``) : void 0))
                    : (t = null),
                i.d.C(e, t));
        }),
        (e.prefetchDNS = function (e) {
            typeof e === `string` && i.d.D(e);
        }),
        (e.preinit = function (e, t) {
            if (typeof e === `string` && t && typeof t.as === `string`) {
                const n = t.as;
                const r = c(n, t.crossOrigin);
                const a = typeof t.integrity === `string` ? t.integrity : void 0;
                const o = typeof t.fetchPriority === `string` ? t.fetchPriority : void 0;
                n === `style`
                    ? i.d.S(e, typeof t.precedence === `string` ? t.precedence : void 0, {
                          crossOrigin: r,
                          integrity: a,
                          fetchPriority: o
                      })
                    : n === `script` &&
                      i.d.X(e, {
                          crossOrigin: r,
                          integrity: a,
                          fetchPriority: o,
                          nonce: typeof t.nonce === `string` ? t.nonce : void 0
                      });
            }
        }),
        (e.preinitModule = function (e, t) {
            if (typeof e === `string`) {
                if (typeof t === `object` && t) {
                    if (t.as == null || t.as === `script`) {
                        const n = c(t.as, t.crossOrigin);
                        i.d.M(e, {
                            crossOrigin: n,
                            integrity: typeof t.integrity === `string` ? t.integrity : void 0,
                            nonce: typeof t.nonce === `string` ? t.nonce : void 0
                        });
                    }
                } else t ?? i.d.M(e);
            }
        }),
        (e.preload = function (e, t) {
            if (typeof e === `string` && typeof t === `object` && t && typeof t.as === `string`) {
                const n = t.as;
                const r = c(n, t.crossOrigin);
                i.d.L(e, n, {
                    crossOrigin: r,
                    integrity: typeof t.integrity === `string` ? t.integrity : void 0,
                    nonce: typeof t.nonce === `string` ? t.nonce : void 0,
                    type: typeof t.type === `string` ? t.type : void 0,
                    fetchPriority: typeof t.fetchPriority === `string` ? t.fetchPriority : void 0,
                    referrerPolicy: typeof t.referrerPolicy === `string` ? t.referrerPolicy : void 0,
                    imageSrcSet: typeof t.imageSrcSet === `string` ? t.imageSrcSet : void 0,
                    imageSizes: typeof t.imageSizes === `string` ? t.imageSizes : void 0,
                    media: typeof t.media === `string` ? t.media : void 0
                });
            }
        }),
        (e.preloadModule = function (e, t) {
            if (typeof e === `string`) {
                if (t) {
                    const n = c(t.as, t.crossOrigin);
                    i.d.m(e, {
                        as: typeof t.as === `string` && t.as !== `script` ? t.as : void 0,
                        crossOrigin: n,
                        integrity: typeof t.integrity === `string` ? t.integrity : void 0
                    });
                } else i.d.m(e);
            }
        }),
        (e.requestFormReset = function (e) {
            i.d.r(e);
        }),
        (e.unstable_batchedUpdates = function (e, t) {
            return e(t);
        }),
        (e.useFormState = function (e, t, n) {
            return s.H.useFormState(e, t, n);
        }),
        (e.useFormStatus = function () {
            return s.H.useHostTransitionStatus();
        }),
        (e.version = `19.2.6`));
});
const _ = s((e, t) => {
    function n() {
        if (!(
            typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > `u` || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE !== `function`
        )) {
            try {
                __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n);
            } catch (e) {
                console.error(e);
            }
        }
    }
    (n(), (t.exports = g()));
});
const v = s((e) => {
    const t = h();
    const n = p();
    const r = _();
    function i(e) {
        let t = `https://react.dev/errors/` + e;
        if (arguments.length > 1) {
            t += `?args[]=` + encodeURIComponent(arguments[1]);
            for (let n = 2; n < arguments.length; n++) t += `&args[]=` + encodeURIComponent(arguments[n]);
        }
        return (
            `Minified React error #` +
            e +
            `; visit ` +
            t +
            ` for the full message or use the non-minified dev environment for full errors and additional helpful warnings.`
        );
    }
    function a(e) {
        return !(!e || (e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11));
    }
    function o(e) {
        let t = e;
        let n = e;
        if (e.alternate) for (; t.return;) t = t.return;
        else {
            e = t;
            do ((t = e), t.flags & 4098 && (n = t.return), (e = t.return));
            while (e);
        }
        return t.tag === 3 ? n : null;
    }
    function s(e) {
        if (e.tag === 13) {
            let t = e.memoizedState;
            if ((t === null && ((e = e.alternate), e !== null && (t = e.memoizedState)), t !== null)) {
                return t.dehydrated;
            }
        }
        return null;
    }
    function c(e) {
        if (e.tag === 31) {
            let t = e.memoizedState;
            if ((t === null && ((e = e.alternate), e !== null && (t = e.memoizedState)), t !== null)) {
                return t.dehydrated;
            }
        }
        return null;
    }
    function l(e) {
        if (o(e) !== e) throw Error(i(188));
    }
    function u(e) {
        let t = e.alternate;
        if (!t) {
            if (((t = o(e)), t === null)) throw Error(i(188));
            return t === e ? e : null;
        }
        for (var n = e, r = t; ;) {
            const a = n.return;
            if (a === null) break;
            let s = a.alternate;
            if (s === null) {
                if (((r = a.return), r !== null)) {
                    n = r;
                    continue;
                }
                break;
            }
            if (a.child === s.child) {
                for (s = a.child; s;) {
                    if (s === n) return (l(a), e);
                    if (s === r) return (l(a), t);
                    s = s.sibling;
                }
                throw Error(i(188));
            }
            if (n.return !== r.return) ((n = a), (r = s));
            else {
                for (var c = !1, u = a.child; u;) {
                    if (u === n) {
                        ((c = !0), (n = a), (r = s));
                        break;
                    }
                    if (u === r) {
                        ((c = !0), (r = a), (n = s));
                        break;
                    }
                    u = u.sibling;
                }
                if (!c) {
                    for (u = s.child; u;) {
                        if (u === n) {
                            ((c = !0), (n = s), (r = a));
                            break;
                        }
                        if (u === r) {
                            ((c = !0), (r = s), (n = a));
                            break;
                        }
                        u = u.sibling;
                    }
                    if (!c) throw Error(i(189));
                }
            }
            if (n.alternate !== r) throw Error(i(190));
        }
        if (n.tag !== 3) throw Error(i(188));
        return n.stateNode.current === n ? e : t;
    }
    function d(e) {
        let t = e.tag;
        if (t === 5 || t === 26 || t === 27 || t === 6) return e;
        for (e = e.child; e !== null;) {
            if (((t = d(e)), t !== null)) return t;
            e = e.sibling;
        }
        return null;
    }
    const f = Object.assign;
    const m = Symbol.for(`react.element`);
    const g = Symbol.for(`react.transitional.element`);
    const v = Symbol.for(`react.portal`);
    const y = Symbol.for(`react.fragment`);
    const b = Symbol.for(`react.strict_mode`);
    const x = Symbol.for(`react.profiler`);
    const S = Symbol.for(`react.consumer`);
    const C = Symbol.for(`react.context`);
    const w = Symbol.for(`react.forward_ref`);
    const ee = Symbol.for(`react.suspense`);
    const te = Symbol.for(`react.suspense_list`);
    const ne = Symbol.for(`react.memo`);
    const re = Symbol.for(`react.lazy`);
    const ie = Symbol.for(`react.activity`);
    const ae = Symbol.for(`react.memo_cache_sentinel`);
    const oe = Symbol.iterator;
    function se(e) {
        return typeof e !== `object` || !e
            ? null
            : ((e = (oe && e[oe]) || e[`@@iterator`]), typeof e === `function` ? e : null);
    }
    const ce = Symbol.for(`react.client.reference`);
    function le(e) {
        if (e == null) return null;
        if (typeof e === `function`) return e.$$typeof === ce ? null : e.displayName || e.name || null;
        if (typeof e === `string`) return e;
        switch (e) {
            case y:
                return `Fragment`;
            case x:
                return `Profiler`;
            case b:
                return `StrictMode`;
            case ee:
                return `Suspense`;
            case te:
                return `SuspenseList`;
            case ie:
                return `Activity`;
        }
        if (typeof e === `object`) {
            switch (e.$$typeof) {
                case v:
                    return `Portal`;
                case C:
                    return e.displayName || `Context`;
                case S:
                    return (e._context.displayName || `Context`) + `.Consumer`;
                case w:
                    var t = e.render;
                    return (
                        (e = e.displayName),
                        (e ||=
                            ((e = t.displayName || t.name || ``), e === `` ? `ForwardRef` : `ForwardRef(` + e + `)`)),
                        e
                    );
                case ne:
                    return ((t = e.displayName || null), t === null ? le(e.type) || `Memo` : t);
                case re:
                    ((t = e._payload), (e = e._init));
                    try {
                        return le(e(t));
                    } catch {}
            }
        }
        return null;
    }
    const ue = Array.isArray;
    const T = n.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
    const E = r.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
    const de = { pending: !1, data: null, method: null, action: null };
    const fe = [];
    let pe = -1;
    function me(e) {
        return { current: e };
    }
    function D(e) {
        pe < 0 || ((e.current = fe[pe]), (fe[pe] = null), pe--);
    }
    function O(e, t) {
        (pe++, (fe[pe] = e.current), (e.current = t));
    }
    const he = me(null);
    const ge = me(null);
    const _e = me(null);
    const ve = me(null);
    function ye(e, t) {
        switch ((O(_e, t), O(ge, e), O(he, null), t.nodeType)) {
            case 9:
            case 11:
                e = (e = t.documentElement) && (e = e.namespaceURI) ? Vd(e) : 0;
                break;
            default:
                if (((e = t.tagName), (t = t.namespaceURI))) ((t = Vd(t)), (e = Hd(t, e)));
                else {
                    switch (e) {
                        case `svg`:
                            e = 1;
                            break;
                        case `math`:
                            e = 2;
                            break;
                        default:
                            e = 0;
                    }
                }
        }
        (D(he), O(he, e));
    }
    function be() {
        (D(he), D(ge), D(_e));
    }
    function xe(e) {
        e.memoizedState !== null && O(ve, e);
        const t = he.current;
        const n = Hd(t, e.type);
        t !== n && (O(ge, e), O(he, n));
    }
    function Se(e) {
        (ge.current === e && (D(he), D(ge)), ve.current === e && (D(ve), (Qf._currentValue = de)));
    }
    let Ce, we;
    function Te(e) {
        if (Ce === void 0) {
            try {
                throw Error();
            } catch (e) {
                const t = e.stack.trim().match(/\n( *(at )?)/);
                ((Ce = (t && t[1]) || ``),
                    (we =
                        e.stack.indexOf(`
    at`) > -1
                            ? ` (<anonymous>)`
                            : e.stack.indexOf(`@`) > -1
                              ? `@unknown:0:0`
                              : ``));
            }
        }
        return (
            `
` +
            Ce +
            e +
            we
        );
    }
    let Ee = !1;
    function De(e, t) {
        if (!e || Ee) return ``;
        Ee = !0;
        let n = Error.prepareStackTrace;
        Error.prepareStackTrace = void 0;
        try {
            let r = {
                DetermineComponentFrameRoot: function () {
                    try {
                        if (t) {
                            var n = function () {
                                throw Error();
                            };
                            if (
                                (Object.defineProperty(n.prototype, `props`, {
                                    set: function () {
                                        throw Error();
                                    }
                                }),
                                typeof Reflect === `object` && Reflect.construct)
                            ) {
                                try {
                                    Reflect.construct(n, []);
                                } catch (e) {
                                    var r = e;
                                }
                                Reflect.construct(e, [], n);
                            } else {
                                try {
                                    n.call();
                                } catch (e) {
                                    r = e;
                                }
                                e.call(n.prototype);
                            }
                        } else {
                            try {
                                throw Error();
                            } catch (e) {
                                r = e;
                            }
                            (n = e()) && typeof n.catch === `function` && n.catch(function () {});
                        }
                    } catch (e) {
                        if (e && r && typeof e.stack === `string`) return [e.stack, r.stack];
                    }
                    return [null, null];
                }
            };
            r.DetermineComponentFrameRoot.displayName = `DetermineComponentFrameRoot`;
            let i = Object.getOwnPropertyDescriptor(r.DetermineComponentFrameRoot, `name`);
            i &&
                i.configurable &&
                Object.defineProperty(r.DetermineComponentFrameRoot, `name`, {
                    value: `DetermineComponentFrameRoot`
                });
            const a = r.DetermineComponentFrameRoot();
            const o = a[0];
            const s = a[1];
            if (o && s) {
                const c = o.split(`
`);
                const l = s.split(`
`);
                for (i = r = 0; r < c.length && !c[r].includes(`DetermineComponentFrameRoot`);) r++;
                for (; i < l.length && !l[i].includes(`DetermineComponentFrameRoot`);) i++;
                if (r === c.length || i === l.length) {
                    for (r = c.length - 1, i = l.length - 1; r >= 1 && i >= 0 && c[r] !== l[i];) i--;
                }
                for (; r >= 1 && i >= 0; r--, i--) {
                    if (c[r] !== l[i]) {
                        if (r !== 1 || i !== 1) {
                            do {
                                if ((r--, i--, i < 0 || c[r] !== l[i])) {
                                    var u =
                                        `
` + c[r].replace(` at new `, ` at `);
                                    return (
                                        e.displayName &&
                                            u.includes(`<anonymous>`) &&
                                            (u = u.replace(`<anonymous>`, e.displayName)),
                                        u
                                    );
                                }
                            } while (r >= 1 && i >= 0);
                        }
                        break;
                    }
                }
            }
        } finally {
            ((Ee = !1), (Error.prepareStackTrace = n));
        }
        return (n = e ? e.displayName || e.name : ``) ? Te(n) : ``;
    }
    function Oe(e, t) {
        switch (e.tag) {
            case 26:
            case 27:
            case 5:
                return Te(e.type);
            case 16:
                return Te(`Lazy`);
            case 13:
                return e.child !== t && t !== null ? Te(`Suspense Fallback`) : Te(`Suspense`);
            case 19:
                return Te(`SuspenseList`);
            case 0:
            case 15:
                return De(e.type, !1);
            case 11:
                return De(e.type.render, !1);
            case 1:
                return De(e.type, !0);
            case 31:
                return Te(`Activity`);
            default:
                return ``;
        }
    }
    function ke(e) {
        try {
            let t = ``;
            let n = null;
            do ((t += Oe(e, n)), (n = e), (e = e.return));
            while (e);
            return t;
        } catch (e) {
            return (
                `
Error generating stack: ` +
                e.message +
                `
` +
                e.stack
            );
        }
    }
    const Ae = Object.prototype.hasOwnProperty;
    const je = t.unstable_scheduleCallback;
    const Me = t.unstable_cancelCallback;
    const Ne = t.unstable_shouldYield;
    const Pe = t.unstable_requestPaint;
    const Fe = t.unstable_now;
    const Ie = t.unstable_getCurrentPriorityLevel;
    const Le = t.unstable_ImmediatePriority;
    const Re = t.unstable_UserBlockingPriority;
    const ze = t.unstable_NormalPriority;
    const Be = t.unstable_LowPriority;
    const Ve = t.unstable_IdlePriority;
    const k = t.log;
    const He = t.unstable_setDisableYieldValue;
    let Ue = null;
    let We = null;
    function Ge(e) {
        if ((typeof k === `function` && He(e), We && typeof We.setStrictMode === `function`)) {
            try {
                We.setStrictMode(Ue, e);
            } catch {}
        }
    }
    const Ke = Math.clz32 ? Math.clz32 : Ye;
    const qe = Math.log;
    const Je = Math.LN2;
    function Ye(e) {
        return ((e >>>= 0), e === 0 ? 32 : (31 - ((qe(e) / Je) | 0)) | 0);
    }
    let Xe = 256;
    let Ze = 262144;
    let Qe = 4194304;
    function $e(e) {
        const t = e & 42;
        if (t !== 0) return t;
        switch (e & -e) {
            case 1:
                return 1;
            case 2:
                return 2;
            case 4:
                return 4;
            case 8:
                return 8;
            case 16:
                return 16;
            case 32:
                return 32;
            case 64:
                return 64;
            case 128:
                return 128;
            case 256:
            case 512:
            case 1024:
            case 2048:
            case 4096:
            case 8192:
            case 16384:
            case 32768:
            case 65536:
            case 131072:
                return e & 261888;
            case 262144:
            case 524288:
            case 1048576:
            case 2097152:
                return e & 3932160;
            case 4194304:
            case 8388608:
            case 16777216:
            case 33554432:
                return e & 62914560;
            case 67108864:
                return 67108864;
            case 134217728:
                return 134217728;
            case 268435456:
                return 268435456;
            case 536870912:
                return 536870912;
            case 1073741824:
                return 0;
            default:
                return e;
        }
    }
    function et(e, t, n) {
        let r = e.pendingLanes;
        if (r === 0) return 0;
        let i = 0;
        let a = e.suspendedLanes;
        let o = e.pingedLanes;
        e = e.warmLanes;
        let s = r & 134217727;
        return (
            s === 0
                ? ((s = r & ~a),
                  s === 0 ? (o === 0 ? n || ((n = r & ~e), n !== 0 && (i = $e(n))) : (i = $e(o))) : (i = $e(s)))
                : ((r = s & ~a),
                  r === 0
                      ? ((o &= s), o === 0 ? n || ((n = s & ~e), n !== 0 && (i = $e(n))) : (i = $e(o)))
                      : (i = $e(r))),
            i === 0
                ? 0
                : t !== 0 &&
                    t !== i &&
                    (t & a) === 0 &&
                    ((a = i & -i), (n = t & -t), a >= n || (a === 32 && n & 4194048))
                  ? t
                  : i
        );
    }
    function tt(e, t) {
        return (e.pendingLanes & ~(e.suspendedLanes & ~e.pingedLanes) & t) === 0;
    }
    function nt(e, t) {
        switch (e) {
            case 1:
            case 2:
            case 4:
            case 8:
            case 64:
                return t + 250;
            case 16:
            case 32:
            case 128:
            case 256:
            case 512:
            case 1024:
            case 2048:
            case 4096:
            case 8192:
            case 16384:
            case 32768:
            case 65536:
            case 131072:
            case 262144:
            case 524288:
            case 1048576:
            case 2097152:
                return t + 5e3;
            case 4194304:
            case 8388608:
            case 16777216:
            case 33554432:
                return -1;
            case 67108864:
            case 134217728:
            case 268435456:
            case 536870912:
            case 1073741824:
                return -1;
            default:
                return -1;
        }
    }
    function rt() {
        const e = Qe;
        return ((Qe <<= 1), !(Qe & 62914560) && (Qe = 4194304), e);
    }
    function it(e) {
        for (var t = [], n = 0; n < 31; n++) t.push(e);
        return t;
    }
    function at(e, t) {
        ((e.pendingLanes |= t), t !== 268435456 && ((e.suspendedLanes = 0), (e.pingedLanes = 0), (e.warmLanes = 0)));
    }
    function ot(e, t, n, r, i, a) {
        const o = e.pendingLanes;
        ((e.pendingLanes = n),
            (e.suspendedLanes = 0),
            (e.pingedLanes = 0),
            (e.warmLanes = 0),
            (e.expiredLanes &= n),
            (e.entangledLanes &= n),
            (e.errorRecoveryDisabledLanes &= n),
            (e.shellSuspendCounter = 0));
        const s = e.entanglements;
        const c = e.expirationTimes;
        const l = e.hiddenUpdates;
        for (n = o & ~n; n > 0;) {
            let u = 31 - Ke(n);
            const d = 1 << u;
            ((s[u] = 0), (c[u] = -1));
            const f = l[u];
            if (f !== null) {
                for (l[u] = null, u = 0; u < f.length; u++) {
                    const p = f[u];
                    p !== null && (p.lane &= -536870913);
                }
            }
            n &= ~d;
        }
        (r !== 0 && st(e, r, 0), a !== 0 && i === 0 && e.tag !== 0 && (e.suspendedLanes |= a & ~(o & ~t)));
    }
    function st(e, t, n) {
        ((e.pendingLanes |= t), (e.suspendedLanes &= ~t));
        const r = 31 - Ke(t);
        ((e.entangledLanes |= t), (e.entanglements[r] = e.entanglements[r] | 1073741824 | (n & 261930)));
    }
    function ct(e, t) {
        let n = (e.entangledLanes |= t);
        for (e = e.entanglements; n;) {
            const r = 31 - Ke(n);
            const i = 1 << r;
            ((i & t) | (e[r] & t) && (e[r] |= t), (n &= ~i));
        }
    }
    function lt(e, t) {
        let n = t & -t;
        return ((n = n & 42 ? 1 : ut(n)), (n & (e.suspendedLanes | t)) === 0 ? n : 0);
    }
    function ut(e) {
        switch (e) {
            case 2:
                e = 1;
                break;
            case 8:
                e = 4;
                break;
            case 32:
                e = 16;
                break;
            case 256:
            case 512:
            case 1024:
            case 2048:
            case 4096:
            case 8192:
            case 16384:
            case 32768:
            case 65536:
            case 131072:
            case 262144:
            case 524288:
            case 1048576:
            case 2097152:
            case 4194304:
            case 8388608:
            case 16777216:
            case 33554432:
                e = 128;
                break;
            case 268435456:
                e = 134217728;
                break;
            default:
                e = 0;
        }
        return e;
    }
    function dt(e) {
        return ((e &= -e), e > 2 ? (e > 8 ? (e & 134217727 ? 32 : 268435456) : 8) : 2);
    }
    function ft() {
        let e = E.p;
        return e === 0 ? ((e = window.event), e === void 0 ? 32 : mp(e.type)) : e;
    }
    function pt(e, t) {
        const n = E.p;
        try {
            return ((E.p = e), t());
        } finally {
            E.p = n;
        }
    }
    const mt = Math.random().toString(36).slice(2);
    const A = `__reactFiber$` + mt;
    const j = `__reactProps$` + mt;
    const M = `__reactContainer$` + mt;
    const ht = `__reactEvents$` + mt;
    const gt = `__reactListeners$` + mt;
    const _t = `__reactHandles$` + mt;
    const vt = `__reactResources$` + mt;
    const N = `__reactMarker$` + mt;
    function yt(e) {
        (delete e[A], delete e[j], delete e[ht], delete e[gt], delete e[_t]);
    }
    function bt(e) {
        let t = e[A];
        if (t) return t;
        for (let n = e.parentNode; n;) {
            if ((t = n[M] || n[A])) {
                if (((n = t.alternate), t.child !== null || (n !== null && n.child !== null))) {
                    for (e = df(e); e !== null;) {
                        if ((n = e[A])) return n;
                        e = df(e);
                    }
                }
                return t;
            }
            ((e = n), (n = e.parentNode));
        }
        return null;
    }
    function xt(e) {
        if ((e = e[A] || e[M])) {
            const t = e.tag;
            if (t === 5 || t === 6 || t === 13 || t === 31 || t === 26 || t === 27 || t === 3) return e;
        }
        return null;
    }
    function St(e) {
        const t = e.tag;
        if (t === 5 || t === 26 || t === 27 || t === 6) return e.stateNode;
        throw Error(i(33));
    }
    function Ct(e) {
        let t = e[vt];
        return ((t ||= e[vt] = { hoistableStyles: new Map(), hoistableScripts: new Map() }), t);
    }
    function wt(e) {
        e[N] = !0;
    }
    const Tt = new Set();
    const Et = {};
    function Dt(e, t) {
        (Ot(e, t), Ot(e + `Capture`, t));
    }
    function Ot(e, t) {
        for (Et[e] = t, e = 0; e < t.length; e++) Tt.add(t[e]);
    }
    const kt = RegExp(
        `^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$`
    );
    const At = {};
    const jt = {};
    function Mt(e) {
        return Ae.call(jt, e) ? !0 : Ae.call(At, e) ? !1 : kt.test(e) ? (jt[e] = !0) : ((At[e] = !0), !1);
    }
    function Nt(e, t, n) {
        if (Mt(t)) {
            if (n === null) e.removeAttribute(t);
            else {
                switch (typeof n) {
                    case `undefined`:
                    case `function`:
                    case `symbol`:
                        e.removeAttribute(t);
                        return;
                    case `boolean`:
                        var r = t.toLowerCase().slice(0, 5);
                        if (r !== `data-` && r !== `aria-`) {
                            e.removeAttribute(t);
                            return;
                        }
                }
                e.setAttribute(t, `` + n);
            }
        }
    }
    function Pt(e, t, n) {
        if (n === null) e.removeAttribute(t);
        else {
            switch (typeof n) {
                case `undefined`:
                case `function`:
                case `symbol`:
                case `boolean`:
                    e.removeAttribute(t);
                    return;
            }
            e.setAttribute(t, `` + n);
        }
    }
    function Ft(e, t, n, r) {
        if (r === null) e.removeAttribute(n);
        else {
            switch (typeof r) {
                case `undefined`:
                case `function`:
                case `symbol`:
                case `boolean`:
                    e.removeAttribute(n);
                    return;
            }
            e.setAttributeNS(t, n, `` + r);
        }
    }
    function P(e) {
        switch (typeof e) {
            case `bigint`:
            case `boolean`:
            case `number`:
            case `string`:
            case `undefined`:
                return e;
            case `object`:
                return e;
            default:
                return ``;
        }
    }
    function It(e) {
        const t = e.type;
        return (e = e.nodeName) && e.toLowerCase() === `input` && (t === `checkbox` || t === `radio`);
    }
    function Lt(e, t, n) {
        const r = Object.getOwnPropertyDescriptor(e.constructor.prototype, t);
        if (!e.hasOwnProperty(t) && r !== void 0 && typeof r.get === `function` && typeof r.set === `function`) {
            const i = r.get;
            const a = r.set;
            return (
                Object.defineProperty(e, t, {
                    configurable: !0,
                    get: function () {
                        return i.call(this);
                    },
                    set: function (e) {
                        ((n = `` + e), a.call(this, e));
                    }
                }),
                Object.defineProperty(e, t, { enumerable: r.enumerable }),
                {
                    getValue: function () {
                        return n;
                    },
                    setValue: function (e) {
                        n = `` + e;
                    },
                    stopTracking: function () {
                        ((e._valueTracker = null), delete e[t]);
                    }
                }
            );
        }
    }
    function Rt(e) {
        if (!e._valueTracker) {
            const t = It(e) ? `checked` : `value`;
            e._valueTracker = Lt(e, t, `` + e[t]);
        }
    }
    function zt(e) {
        if (!e) return !1;
        const t = e._valueTracker;
        if (!t) return !0;
        const n = t.getValue();
        let r = ``;
        return (
            e && (r = It(e) ? (e.checked ? `true` : `false`) : e.value),
            (e = r),
            e === n ? !1 : (t.setValue(e), !0)
        );
    }
    function Bt(e) {
        if (((e ||= typeof document < `u` ? document : void 0), e === void 0)) return null;
        try {
            return e.activeElement || e.body;
        } catch {
            return e.body;
        }
    }
    const Vt = /[\n"\\]/g;
    function Ht(e) {
        return e.replace(Vt, function (e) {
            return `\\` + e.charCodeAt(0).toString(16) + ` `;
        });
    }
    function Ut(e, t, n, r, i, a, o, s) {
        ((e.name = ``),
            o != null && typeof o !== `function` && typeof o !== `symbol` && typeof o !== `boolean`
                ? (e.type = o)
                : e.removeAttribute(`type`),
            t == null
                ? (o !== `submit` && o !== `reset`) || e.removeAttribute(`value`)
                : o === `number`
                  ? ((t === 0 && e.value === ``) || e.value != t) && (e.value = `` + P(t))
                  : e.value !== `` + P(t) && (e.value = `` + P(t)),
            t == null ? (n == null ? r != null && e.removeAttribute(`value`) : Gt(e, o, P(n))) : Gt(e, o, P(t)),
            i == null && a != null && (e.defaultChecked = !!a),
            i != null && (e.checked = i && typeof i !== `function` && typeof i !== `symbol`),
            s != null && typeof s !== `function` && typeof s !== `symbol` && typeof s !== `boolean`
                ? (e.name = `` + P(s))
                : e.removeAttribute(`name`));
    }
    function Wt(e, t, n, r, i, a, o, s) {
        if (
            (a != null && typeof a !== `function` && typeof a !== `symbol` && typeof a !== `boolean` && (e.type = a),
            t != null || n != null)
        ) {
            if (!((a !== `submit` && a !== `reset`) || t != null)) {
                Rt(e);
                return;
            }
            ((n = n == null ? `` : `` + P(n)),
                (t = t == null ? n : `` + P(t)),
                s || t === e.value || (e.value = t),
                (e.defaultValue = t));
        }
        ((r ??= i),
            (r = typeof r !== `function` && typeof r !== `symbol` && !!r),
            (e.checked = s ? e.checked : !!r),
            (e.defaultChecked = !!r),
            o != null && typeof o !== `function` && typeof o !== `symbol` && typeof o !== `boolean` && (e.name = o),
            Rt(e));
    }
    function Gt(e, t, n) {
        (t === `number` && Bt(e.ownerDocument) === e) || e.defaultValue === `` + n || (e.defaultValue = `` + n);
    }
    function Kt(e, t, n, r) {
        if (((e = e.options), t)) {
            t = {};
            for (var i = 0; i < n.length; i++) t[`$` + n[i]] = !0;
            for (n = 0; n < e.length; n++) {
                ((i = t.hasOwnProperty(`$` + e[n].value)),
                    e[n].selected !== i && (e[n].selected = i),
                    i && r && (e[n].defaultSelected = !0));
            }
        } else {
            for (n = `` + P(n), t = null, i = 0; i < e.length; i++) {
                if (e[i].value === n) {
                    ((e[i].selected = !0), r && (e[i].defaultSelected = !0));
                    return;
                }
                t !== null || e[i].disabled || (t = e[i]);
            }
            t !== null && (t.selected = !0);
        }
    }
    function qt(e, t, n) {
        if (t != null && ((t = `` + P(t)), t !== e.value && (e.value = t), n == null)) {
            e.defaultValue !== t && (e.defaultValue = t);
            return;
        }
        e.defaultValue = n == null ? `` : `` + P(n);
    }
    function Jt(e, t, n, r) {
        if (t == null) {
            if (r != null) {
                if (n != null) throw Error(i(92));
                if (ue(r)) {
                    if (r.length > 1) throw Error(i(93));
                    r = r[0];
                }
                n = r;
            }
            ((n ??= ``), (t = n));
        }
        ((n = P(t)),
            (e.defaultValue = n),
            (r = e.textContent),
            r === n && r !== `` && r !== null && (e.value = r),
            Rt(e));
    }
    function Yt(e, t) {
        if (t) {
            const n = e.firstChild;
            if (n && n === e.lastChild && n.nodeType === 3) {
                n.nodeValue = t;
                return;
            }
        }
        e.textContent = t;
    }
    const Xt = new Set(
        `animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp`.split(
            ` `
        )
    );
    function Zt(e, t, n) {
        const r = t.indexOf(`--`) === 0;
        n == null || typeof n === `boolean` || n === ``
            ? r
                ? e.setProperty(t, ``)
                : t === `float`
                  ? (e.cssFloat = ``)
                  : (e[t] = ``)
            : r
              ? e.setProperty(t, n)
              : typeof n !== `number` || n === 0 || Xt.has(t)
                ? t === `float`
                    ? (e.cssFloat = n)
                    : (e[t] = (`` + n).trim())
                : (e[t] = n + `px`);
    }
    function Qt(e, t, n) {
        if (t != null && typeof t !== `object`) throw Error(i(62));
        if (((e = e.style), n != null)) {
            for (var r in n) {
                !n.hasOwnProperty(r) ||
                    (t != null && t.hasOwnProperty(r)) ||
                    (r.indexOf(`--`) === 0 ? e.setProperty(r, ``) : r === `float` ? (e.cssFloat = ``) : (e[r] = ``));
            }
            for (const a in t) ((r = t[a]), t.hasOwnProperty(a) && n[a] !== r && Zt(e, a, r));
        } else for (const o in t) t.hasOwnProperty(o) && Zt(e, o, t[o]);
    }
    function $t(e) {
        if (e.indexOf(`-`) === -1) return !1;
        switch (e) {
            case `annotation-xml`:
            case `color-profile`:
            case `font-face`:
            case `font-face-src`:
            case `font-face-uri`:
            case `font-face-format`:
            case `font-face-name`:
            case `missing-glyph`:
                return !1;
            default:
                return !0;
        }
    }
    const en = new Map([
        [`acceptCharset`, `accept-charset`],
        [`htmlFor`, `for`],
        [`httpEquiv`, `http-equiv`],
        [`crossOrigin`, `crossorigin`],
        [`accentHeight`, `accent-height`],
        [`alignmentBaseline`, `alignment-baseline`],
        [`arabicForm`, `arabic-form`],
        [`baselineShift`, `baseline-shift`],
        [`capHeight`, `cap-height`],
        [`clipPath`, `clip-path`],
        [`clipRule`, `clip-rule`],
        [`colorInterpolation`, `color-interpolation`],
        [`colorInterpolationFilters`, `color-interpolation-filters`],
        [`colorProfile`, `color-profile`],
        [`colorRendering`, `color-rendering`],
        [`dominantBaseline`, `dominant-baseline`],
        [`enableBackground`, `enable-background`],
        [`fillOpacity`, `fill-opacity`],
        [`fillRule`, `fill-rule`],
        [`floodColor`, `flood-color`],
        [`floodOpacity`, `flood-opacity`],
        [`fontFamily`, `font-family`],
        [`fontSize`, `font-size`],
        [`fontSizeAdjust`, `font-size-adjust`],
        [`fontStretch`, `font-stretch`],
        [`fontStyle`, `font-style`],
        [`fontVariant`, `font-variant`],
        [`fontWeight`, `font-weight`],
        [`glyphName`, `glyph-name`],
        [`glyphOrientationHorizontal`, `glyph-orientation-horizontal`],
        [`glyphOrientationVertical`, `glyph-orientation-vertical`],
        [`horizAdvX`, `horiz-adv-x`],
        [`horizOriginX`, `horiz-origin-x`],
        [`imageRendering`, `image-rendering`],
        [`letterSpacing`, `letter-spacing`],
        [`lightingColor`, `lighting-color`],
        [`markerEnd`, `marker-end`],
        [`markerMid`, `marker-mid`],
        [`markerStart`, `marker-start`],
        [`overlinePosition`, `overline-position`],
        [`overlineThickness`, `overline-thickness`],
        [`paintOrder`, `paint-order`],
        [`panose-1`, `panose-1`],
        [`pointerEvents`, `pointer-events`],
        [`renderingIntent`, `rendering-intent`],
        [`shapeRendering`, `shape-rendering`],
        [`stopColor`, `stop-color`],
        [`stopOpacity`, `stop-opacity`],
        [`strikethroughPosition`, `strikethrough-position`],
        [`strikethroughThickness`, `strikethrough-thickness`],
        [`strokeDasharray`, `stroke-dasharray`],
        [`strokeDashoffset`, `stroke-dashoffset`],
        [`strokeLinecap`, `stroke-linecap`],
        [`strokeLinejoin`, `stroke-linejoin`],
        [`strokeMiterlimit`, `stroke-miterlimit`],
        [`strokeOpacity`, `stroke-opacity`],
        [`strokeWidth`, `stroke-width`],
        [`textAnchor`, `text-anchor`],
        [`textDecoration`, `text-decoration`],
        [`textRendering`, `text-rendering`],
        [`transformOrigin`, `transform-origin`],
        [`underlinePosition`, `underline-position`],
        [`underlineThickness`, `underline-thickness`],
        [`unicodeBidi`, `unicode-bidi`],
        [`unicodeRange`, `unicode-range`],
        [`unitsPerEm`, `units-per-em`],
        [`vAlphabetic`, `v-alphabetic`],
        [`vHanging`, `v-hanging`],
        [`vIdeographic`, `v-ideographic`],
        [`vMathematical`, `v-mathematical`],
        [`vectorEffect`, `vector-effect`],
        [`vertAdvY`, `vert-adv-y`],
        [`vertOriginX`, `vert-origin-x`],
        [`vertOriginY`, `vert-origin-y`],
        [`wordSpacing`, `word-spacing`],
        [`writingMode`, `writing-mode`],
        [`xmlnsXlink`, `xmlns:xlink`],
        [`xHeight`, `x-height`]
    ]);
    const tn =
        /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
    function nn(e) {
        return tn.test(`` + e)
            ? `javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')`
            : e;
    }
    function F() {}
    let rn = null;
    function an(e) {
        return (
            (e = e.target || e.srcElement || window),
            e.correspondingUseElement && (e = e.correspondingUseElement),
            e.nodeType === 3 ? e.parentNode : e
        );
    }
    let on = null;
    let sn = null;
    function cn(e) {
        let t = xt(e);
        if (t && (e = t.stateNode)) {
            let n = e[j] || null;
            a: switch (((e = t.stateNode), t.type)) {
                case `input`:
                    if (
                        (Ut(e, n.value, n.defaultValue, n.defaultValue, n.checked, n.defaultChecked, n.type, n.name),
                        (t = n.name),
                        n.type === `radio` && t != null)
                    ) {
                        for (n = e; n.parentNode;) n = n.parentNode;
                        for (
                            n = n.querySelectorAll(`input[name="` + Ht(`` + t) + `"][type="radio"]`), t = 0;
                            t < n.length;
                            t++
                        ) {
                            var r = n[t];
                            if (r !== e && r.form === e.form) {
                                const a = r[j] || null;
                                if (!a) throw Error(i(90));
                                Ut(
                                    r,
                                    a.value,
                                    a.defaultValue,
                                    a.defaultValue,
                                    a.checked,
                                    a.defaultChecked,
                                    a.type,
                                    a.name
                                );
                            }
                        }
                        for (t = 0; t < n.length; t++) ((r = n[t]), r.form === e.form && zt(r));
                    }
                    break a;
                case `textarea`:
                    qt(e, n.value, n.defaultValue);
                    break a;
                case `select`:
                    ((t = n.value), t != null && Kt(e, !!n.multiple, t, !1));
            }
        }
    }
    let ln = !1;
    function un(e, t, n) {
        if (ln) return e(t, n);
        ln = !0;
        try {
            return e(t);
        } finally {
            if (
                ((ln = !1),
                (on !== null || sn !== null) && (bu(), on && ((t = on), (e = sn), (sn = on = null), cn(t), e)))
            ) {
                for (t = 0; t < e.length; t++) cn(e[t]);
            }
        }
    }
    function dn(e, t) {
        let n = e.stateNode;
        if (n === null) return null;
        let r = n[j] || null;
        if (r === null) return null;
        n = r[t];
        a: switch (t) {
            case `onClick`:
            case `onClickCapture`:
            case `onDoubleClick`:
            case `onDoubleClickCapture`:
            case `onMouseDown`:
            case `onMouseDownCapture`:
            case `onMouseMove`:
            case `onMouseMoveCapture`:
            case `onMouseUp`:
            case `onMouseUpCapture`:
            case `onMouseEnter`:
                ((r = !r.disabled) ||
                    ((e = e.type), (r = !(e === `button` || e === `input` || e === `select` || e === `textarea`))),
                    (e = !r));
                break a;
            default:
                e = !1;
        }
        if (e) return null;
        if (n && typeof n !== `function`) throw Error(i(231, t, typeof n));
        return n;
    }
    const fn = !(typeof window > `u` || window.document === void 0 || window.document.createElement === void 0);
    let pn = !1;
    if (fn) {
        try {
            const mn = {};
            (Object.defineProperty(mn, `passive`, {
                get: function () {
                    pn = !0;
                }
            }),
                window.addEventListener(`test`, mn, mn),
                window.removeEventListener(`test`, mn, mn));
        } catch {
            pn = !1;
        }
    }
    let hn = null;
    let gn = null;
    let _n = null;
    function vn() {
        if (_n) return _n;
        let e;
        const t = gn;
        const n = t.length;
        let r;
        const i = `value` in hn ? hn.value : hn.textContent;
        const a = i.length;
        for (e = 0; e < n && t[e] === i[e]; e++);
        const o = n - e;
        for (r = 1; r <= o && t[n - r] === i[a - r]; r++);
        return (_n = i.slice(e, r > 1 ? 1 - r : void 0));
    }
    function yn(e) {
        const t = e.keyCode;
        return (
            `charCode` in e ? ((e = e.charCode), e === 0 && t === 13 && (e = 13)) : (e = t),
            e === 10 && (e = 13),
            e >= 32 || e === 13 ? e : 0
        );
    }
    function bn() {
        return !0;
    }
    function xn() {
        return !1;
    }
    function Sn(e) {
        function t(t, n, r, i, a) {
            for (const o in ((this._reactName = t),
            (this._targetInst = r),
            (this.type = n),
            (this.nativeEvent = i),
            (this.target = a),
            (this.currentTarget = null),
            e)) {
                e.hasOwnProperty(o) && ((t = e[o]), (this[o] = t ? t(i) : i[o]));
            }
            return (
                (this.isDefaultPrevented = (i.defaultPrevented == null ? !1 === i.returnValue : i.defaultPrevented)
                    ? bn
                    : xn),
                (this.isPropagationStopped = xn),
                this
            );
        }
        return (
            f(t.prototype, {
                preventDefault: function () {
                    this.defaultPrevented = !0;
                    const e = this.nativeEvent;
                    e &&
                        (e.preventDefault
                            ? e.preventDefault()
                            : typeof e.returnValue !== `unknown` && (e.returnValue = !1),
                        (this.isDefaultPrevented = bn));
                },
                stopPropagation: function () {
                    const e = this.nativeEvent;
                    e &&
                        (e.stopPropagation
                            ? e.stopPropagation()
                            : typeof e.cancelBubble !== `unknown` && (e.cancelBubble = !0),
                        (this.isPropagationStopped = bn));
                },
                persist: function () {},
                isPersistent: bn
            }),
            t
        );
    }
    const Cn = {
        eventPhase: 0,
        bubbles: 0,
        cancelable: 0,
        timeStamp: function (e) {
            return e.timeStamp || Date.now();
        },
        defaultPrevented: 0,
        isTrusted: 0
    };
    const wn = Sn(Cn);
    const Tn = f({}, Cn, { view: 0, detail: 0 });
    const En = Sn(Tn);
    let Dn;
    let On;
    let kn;
    const An = f({}, Tn, {
        screenX: 0,
        screenY: 0,
        clientX: 0,
        clientY: 0,
        pageX: 0,
        pageY: 0,
        ctrlKey: 0,
        shiftKey: 0,
        altKey: 0,
        metaKey: 0,
        getModifierState: Vn,
        button: 0,
        buttons: 0,
        relatedTarget: function (e) {
            return e.relatedTarget === void 0
                ? e.fromElement === e.srcElement
                    ? e.toElement
                    : e.fromElement
                : e.relatedTarget;
        },
        movementX: function (e) {
            return `movementX` in e
                ? e.movementX
                : (e !== kn &&
                      (kn && e.type === `mousemove`
                          ? ((Dn = e.screenX - kn.screenX), (On = e.screenY - kn.screenY))
                          : (On = Dn = 0),
                      (kn = e)),
                  Dn);
        },
        movementY: function (e) {
            return `movementY` in e ? e.movementY : On;
        }
    });
    const jn = Sn(An);
    const Mn = Sn(f({}, An, { dataTransfer: 0 }));
    const Nn = Sn(f({}, Tn, { relatedTarget: 0 }));
    const Pn = Sn(f({}, Cn, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }));
    const Fn = Sn(
        f({}, Cn, {
            clipboardData: function (e) {
                return `clipboardData` in e ? e.clipboardData : window.clipboardData;
            }
        })
    );
    const In = Sn(f({}, Cn, { data: 0 }));
    const Ln = {
        Esc: `Escape`,
        Spacebar: ` `,
        Left: `ArrowLeft`,
        Up: `ArrowUp`,
        Right: `ArrowRight`,
        Down: `ArrowDown`,
        Del: `Delete`,
        Win: `OS`,
        Menu: `ContextMenu`,
        Apps: `ContextMenu`,
        Scroll: `ScrollLock`,
        MozPrintableKey: `Unidentified`
    };
    const Rn = {
        8: `Backspace`,
        9: `Tab`,
        12: `Clear`,
        13: `Enter`,
        16: `Shift`,
        17: `Control`,
        18: `Alt`,
        19: `Pause`,
        20: `CapsLock`,
        27: `Escape`,
        32: ` `,
        33: `PageUp`,
        34: `PageDown`,
        35: `End`,
        36: `Home`,
        37: `ArrowLeft`,
        38: `ArrowUp`,
        39: `ArrowRight`,
        40: `ArrowDown`,
        45: `Insert`,
        46: `Delete`,
        112: `F1`,
        113: `F2`,
        114: `F3`,
        115: `F4`,
        116: `F5`,
        117: `F6`,
        118: `F7`,
        119: `F8`,
        120: `F9`,
        121: `F10`,
        122: `F11`,
        123: `F12`,
        144: `NumLock`,
        145: `ScrollLock`,
        224: `Meta`
    };
    const zn = { Alt: `altKey`, Control: `ctrlKey`, Meta: `metaKey`, Shift: `shiftKey` };
    function Bn(e) {
        const t = this.nativeEvent;
        return t.getModifierState ? t.getModifierState(e) : (e = zn[e]) ? !!t[e] : !1;
    }
    function Vn() {
        return Bn;
    }
    const Hn = Sn(
        f({}, Tn, {
            key: function (e) {
                if (e.key) {
                    const t = Ln[e.key] || e.key;
                    if (t !== `Unidentified`) return t;
                }
                return e.type === `keypress`
                    ? ((e = yn(e)), e === 13 ? `Enter` : String.fromCharCode(e))
                    : e.type === `keydown` || e.type === `keyup`
                      ? Rn[e.keyCode] || `Unidentified`
                      : ``;
            },
            code: 0,
            location: 0,
            ctrlKey: 0,
            shiftKey: 0,
            altKey: 0,
            metaKey: 0,
            repeat: 0,
            locale: 0,
            getModifierState: Vn,
            charCode: function (e) {
                return e.type === `keypress` ? yn(e) : 0;
            },
            keyCode: function (e) {
                return e.type === `keydown` || e.type === `keyup` ? e.keyCode : 0;
            },
            which: function (e) {
                return e.type === `keypress` ? yn(e) : e.type === `keydown` || e.type === `keyup` ? e.keyCode : 0;
            }
        })
    );
    const Un = Sn(
        f({}, An, {
            pointerId: 0,
            width: 0,
            height: 0,
            pressure: 0,
            tangentialPressure: 0,
            tiltX: 0,
            tiltY: 0,
            twist: 0,
            pointerType: 0,
            isPrimary: 0
        })
    );
    const Wn = Sn(
        f({}, Tn, {
            touches: 0,
            targetTouches: 0,
            changedTouches: 0,
            altKey: 0,
            metaKey: 0,
            ctrlKey: 0,
            shiftKey: 0,
            getModifierState: Vn
        })
    );
    const Gn = Sn(f({}, Cn, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }));
    const Kn = Sn(
        f({}, An, {
            deltaX: function (e) {
                return `deltaX` in e ? e.deltaX : `wheelDeltaX` in e ? -e.wheelDeltaX : 0;
            },
            deltaY: function (e) {
                return `deltaY` in e
                    ? e.deltaY
                    : `wheelDeltaY` in e
                      ? -e.wheelDeltaY
                      : `wheelDelta` in e
                        ? -e.wheelDelta
                        : 0;
            },
            deltaZ: 0,
            deltaMode: 0
        })
    );
    const qn = Sn(f({}, Cn, { newState: 0, oldState: 0 }));
    const Jn = [9, 13, 27, 32];
    const Yn = fn && `CompositionEvent` in window;
    let Xn = null;
    fn && `documentMode` in document && (Xn = document.documentMode);
    const Zn = fn && `TextEvent` in window && !Xn;
    const Qn = fn && (!Yn || (Xn && Xn > 8 && Xn <= 11));
    const $n = ` `;
    let er = !1;
    function tr(e, t) {
        switch (e) {
            case `keyup`:
                return Jn.indexOf(t.keyCode) !== -1;
            case `keydown`:
                return t.keyCode !== 229;
            case `keypress`:
            case `mousedown`:
            case `focusout`:
                return !0;
            default:
                return !1;
        }
    }
    function nr(e) {
        return ((e = e.detail), typeof e === `object` && `data` in e ? e.data : null);
    }
    let rr = !1;
    function ir(e, t) {
        switch (e) {
            case `compositionend`:
                return nr(t);
            case `keypress`:
                return t.which === 32 ? ((er = !0), $n) : null;
            case `textInput`:
                return ((e = t.data), e === $n && er ? null : e);
            default:
                return null;
        }
    }
    function ar(e, t) {
        if (rr) {
            return e === `compositionend` || (!Yn && tr(e, t))
                ? ((e = vn()), (_n = gn = hn = null), (rr = !1), e)
                : null;
        }
        switch (e) {
            case `paste`:
                return null;
            case `keypress`:
                if (!(t.ctrlKey || t.altKey || t.metaKey) || (t.ctrlKey && t.altKey)) {
                    if (t.char && t.char.length > 1) return t.char;
                    if (t.which) return String.fromCharCode(t.which);
                }
                return null;
            case `compositionend`:
                return Qn && t.locale !== `ko` ? null : t.data;
            default:
                return null;
        }
    }
    const or = {
        color: !0,
        date: !0,
        datetime: !0,
        'datetime-local': !0,
        email: !0,
        month: !0,
        number: !0,
        password: !0,
        range: !0,
        search: !0,
        tel: !0,
        text: !0,
        time: !0,
        url: !0,
        week: !0
    };
    function sr(e) {
        const t = e && e.nodeName && e.nodeName.toLowerCase();
        return t === `input` ? !!or[e.type] : t === `textarea`;
    }
    function cr(e, t, n, r) {
        (on ? (sn ? sn.push(r) : (sn = [r])) : (on = r),
            (t = Ed(t, `onChange`)),
            t.length > 0 && ((n = new wn(`onChange`, `change`, null, n, r)), e.push({ event: n, listeners: t })));
    }
    let lr = null;
    let ur = null;
    function dr(e) {
        yd(e, 0);
    }
    function fr(e) {
        if (zt(St(e))) return e;
    }
    function pr(e, t) {
        if (e === `change`) return t;
    }
    let mr = !1;
    if (fn) {
        let hr;
        if (fn) {
            let gr = `oninput` in document;
            if (!gr) {
                const _r = document.createElement(`div`);
                (_r.setAttribute(`oninput`, `return;`), (gr = typeof _r.oninput === `function`));
            }
            hr = gr;
        } else hr = !1;
        mr = hr && (!document.documentMode || document.documentMode > 9);
    }
    function vr() {
        lr && (lr.detachEvent(`onpropertychange`, yr), (ur = lr = null));
    }
    function yr(e) {
        if (e.propertyName === `value` && fr(ur)) {
            const t = [];
            (cr(t, ur, e, an(e)), un(dr, t));
        }
    }
    function br(e, t, n) {
        e === `focusin` ? (vr(), (lr = t), (ur = n), lr.attachEvent(`onpropertychange`, yr)) : e === `focusout` && vr();
    }
    function xr(e) {
        if (e === `selectionchange` || e === `keyup` || e === `keydown`) return fr(ur);
    }
    function Sr(e, t) {
        if (e === `click`) return fr(t);
    }
    function Cr(e, t) {
        if (e === `input` || e === `change`) return fr(t);
    }
    function wr(e, t) {
        return (e === t && (e !== 0 || 1 / e == 1 / t)) || (e !== e && t !== t);
    }
    const Tr = typeof Object.is === `function` ? Object.is : wr;
    function Er(e, t) {
        if (Tr(e, t)) return !0;
        if (typeof e !== `object` || !e || typeof t !== `object` || !t) return !1;
        const n = Object.keys(e);
        let r = Object.keys(t);
        if (n.length !== r.length) return !1;
        for (r = 0; r < n.length; r++) {
            const i = n[r];
            if (!Ae.call(t, i) || !Tr(e[i], t[i])) return !1;
        }
        return !0;
    }
    function Dr(e) {
        for (; e && e.firstChild;) e = e.firstChild;
        return e;
    }
    function Or(e, t) {
        let n = Dr(e);
        e = 0;
        for (var r; n;) {
            if (n.nodeType === 3) {
                if (((r = e + n.textContent.length), e <= t && r >= t)) return { node: n, offset: t - e };
                e = r;
            }
            a: {
                for (; n;) {
                    if (n.nextSibling) {
                        n = n.nextSibling;
                        break a;
                    }
                    n = n.parentNode;
                }
                n = void 0;
            }
            n = Dr(n);
        }
    }
    function kr(e, t) {
        return e && t
            ? e === t
                ? !0
                : e && e.nodeType === 3
                  ? !1
                  : t && t.nodeType === 3
                    ? kr(e, t.parentNode)
                    : `contains` in e
                      ? e.contains(t)
                      : e.compareDocumentPosition
                        ? !!(e.compareDocumentPosition(t) & 16)
                        : !1
            : !1;
    }
    function Ar(e) {
        e =
            e != null && e.ownerDocument != null && e.ownerDocument.defaultView != null
                ? e.ownerDocument.defaultView
                : window;
        for (var t = Bt(e.document); t instanceof e.HTMLIFrameElement;) {
            try {
                var n = typeof t.contentWindow.location.href === `string`;
            } catch {
                n = !1;
            }
            if (n) e = t.contentWindow;
            else break;
            t = Bt(e.document);
        }
        return t;
    }
    function jr(e) {
        const t = e && e.nodeName && e.nodeName.toLowerCase();
        return (
            t &&
            ((t === `input` &&
                (e.type === `text` ||
                    e.type === `search` ||
                    e.type === `tel` ||
                    e.type === `url` ||
                    e.type === `password`)) ||
                t === `textarea` ||
                e.contentEditable === `true`)
        );
    }
    const Mr = fn && `documentMode` in document && document.documentMode <= 11;
    let Nr = null;
    let Pr = null;
    let Fr = null;
    let Ir = !1;
    function Lr(e, t, n) {
        let r = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
        Ir ||
            Nr == null ||
            Nr !== Bt(r) ||
            ((r = Nr),
            `selectionStart` in r && jr(r)
                ? (r = { start: r.selectionStart, end: r.selectionEnd })
                : ((r = ((r.ownerDocument && r.ownerDocument.defaultView) || window).getSelection()),
                  (r = {
                      anchorNode: r.anchorNode,
                      anchorOffset: r.anchorOffset,
                      focusNode: r.focusNode,
                      focusOffset: r.focusOffset
                  })),
            (Fr && Er(Fr, r)) ||
                ((Fr = r),
                (r = Ed(Pr, `onSelect`)),
                r.length > 0 &&
                    ((t = new wn(`onSelect`, `select`, null, t, n)),
                    e.push({ event: t, listeners: r }),
                    (t.target = Nr))));
    }
    function Rr(e, t) {
        const n = {};
        return (
            (n[e.toLowerCase()] = t.toLowerCase()),
            (n[`Webkit` + e] = `webkit` + t),
            (n[`Moz` + e] = `moz` + t),
            n
        );
    }
    const zr = {
        animationend: Rr(`Animation`, `AnimationEnd`),
        animationiteration: Rr(`Animation`, `AnimationIteration`),
        animationstart: Rr(`Animation`, `AnimationStart`),
        transitionrun: Rr(`Transition`, `TransitionRun`),
        transitionstart: Rr(`Transition`, `TransitionStart`),
        transitioncancel: Rr(`Transition`, `TransitionCancel`),
        transitionend: Rr(`Transition`, `TransitionEnd`)
    };
    const Br = {};
    let Vr = {};
    fn &&
        ((Vr = document.createElement(`div`).style),
        `AnimationEvent` in window ||
            (delete zr.animationend.animation,
            delete zr.animationiteration.animation,
            delete zr.animationstart.animation),
        `TransitionEvent` in window || delete zr.transitionend.transition);
    function Hr(e) {
        if (Br[e]) return Br[e];
        if (!zr[e]) return e;
        const t = zr[e];
        let n;
        for (n in t) if (t.hasOwnProperty(n) && n in Vr) return (Br[e] = t[n]);
        return e;
    }
    const Ur = Hr(`animationend`);
    const Wr = Hr(`animationiteration`);
    const Gr = Hr(`animationstart`);
    const Kr = Hr(`transitionrun`);
    const qr = Hr(`transitionstart`);
    const Jr = Hr(`transitioncancel`);
    const Yr = Hr(`transitionend`);
    const Xr = new Map();
    const Zr =
        `abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel`.split(
            ` `
        );
    Zr.push(`scrollEnd`);
    function Qr(e, t) {
        (Xr.set(e, t), Dt(t, [e]));
    }
    const $r =
        typeof reportError === `function`
            ? reportError
            : function (e) {
                  if (typeof window === `object` && typeof window.ErrorEvent === `function`) {
                      const t = new window.ErrorEvent(`error`, {
                          bubbles: !0,
                          cancelable: !0,
                          message:
                              typeof e === `object` && e && typeof e.message === `string`
                                  ? String(e.message)
                                  : String(e),
                          error: e
                      });
                      if (!window.dispatchEvent(t)) return;
                  } else if (typeof process === `object` && typeof process.emit === `function`) {
                      process.emit(`uncaughtException`, e);
                      return;
                  }
                  console.error(e);
              };
    const ei = [];
    let ti = 0;
    let ni = 0;
    function ri() {
        for (let e = ti, t = (ni = ti = 0); t < e;) {
            const n = ei[t];
            ei[t++] = null;
            const r = ei[t];
            ei[t++] = null;
            const i = ei[t];
            ei[t++] = null;
            const a = ei[t];
            if (((ei[t++] = null), r !== null && i !== null)) {
                const o = r.pending;
                (o === null ? (i.next = i) : ((i.next = o.next), (o.next = i)), (r.pending = i));
            }
            a !== 0 && si(n, i, a);
        }
    }
    function ii(e, t, n, r) {
        ((ei[ti++] = e),
            (ei[ti++] = t),
            (ei[ti++] = n),
            (ei[ti++] = r),
            (ni |= r),
            (e.lanes |= r),
            (e = e.alternate),
            e !== null && (e.lanes |= r));
    }
    function ai(e, t, n, r) {
        return (ii(e, t, n, r), ci(e));
    }
    function oi(e, t) {
        return (ii(e, null, null, t), ci(e));
    }
    function si(e, t, n) {
        e.lanes |= n;
        let r = e.alternate;
        r !== null && (r.lanes |= n);
        for (var i = !1, a = e.return; a !== null;) {
            ((a.childLanes |= n),
                (r = a.alternate),
                r !== null && (r.childLanes |= n),
                a.tag === 22 && ((e = a.stateNode), e === null || e._visibility & 1 || (i = !0)),
                (e = a),
                (a = a.return));
        }
        return e.tag === 3
            ? ((a = e.stateNode),
              i &&
                  t !== null &&
                  ((i = 31 - Ke(n)),
                  (e = a.hiddenUpdates),
                  (r = e[i]),
                  r === null ? (e[i] = [t]) : r.push(t),
                  (t.lane = n | 536870912)),
              a)
            : null;
    }
    function ci(e) {
        if (du > 50) throw ((du = 0), (fu = null), Error(i(185)));
        for (let t = e.return; t !== null;) ((e = t), (t = e.return));
        return e.tag === 3 ? e.stateNode : null;
    }
    const li = {};
    function ui(e, t, n, r) {
        ((this.tag = e),
            (this.key = n),
            (this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null),
            (this.index = 0),
            (this.refCleanup = this.ref = null),
            (this.pendingProps = t),
            (this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null),
            (this.mode = r),
            (this.subtreeFlags = this.flags = 0),
            (this.deletions = null),
            (this.childLanes = this.lanes = 0),
            (this.alternate = null));
    }
    function di(e, t, n, r) {
        return new ui(e, t, n, r);
    }
    function fi(e) {
        return ((e = e.prototype), !(!e || !e.isReactComponent));
    }
    function pi(e, t) {
        let n = e.alternate;
        return (
            n === null
                ? ((n = di(e.tag, t, e.key, e.mode)),
                  (n.elementType = e.elementType),
                  (n.type = e.type),
                  (n.stateNode = e.stateNode),
                  (n.alternate = e),
                  (e.alternate = n))
                : ((n.pendingProps = t), (n.type = e.type), (n.flags = 0), (n.subtreeFlags = 0), (n.deletions = null)),
            (n.flags = e.flags & 65011712),
            (n.childLanes = e.childLanes),
            (n.lanes = e.lanes),
            (n.child = e.child),
            (n.memoizedProps = e.memoizedProps),
            (n.memoizedState = e.memoizedState),
            (n.updateQueue = e.updateQueue),
            (t = e.dependencies),
            (n.dependencies = t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }),
            (n.sibling = e.sibling),
            (n.index = e.index),
            (n.ref = e.ref),
            (n.refCleanup = e.refCleanup),
            n
        );
    }
    function mi(e, t) {
        e.flags &= 65011714;
        const n = e.alternate;
        return (
            n === null
                ? ((e.childLanes = 0),
                  (e.lanes = t),
                  (e.child = null),
                  (e.subtreeFlags = 0),
                  (e.memoizedProps = null),
                  (e.memoizedState = null),
                  (e.updateQueue = null),
                  (e.dependencies = null),
                  (e.stateNode = null))
                : ((e.childLanes = n.childLanes),
                  (e.lanes = n.lanes),
                  (e.child = n.child),
                  (e.subtreeFlags = 0),
                  (e.deletions = null),
                  (e.memoizedProps = n.memoizedProps),
                  (e.memoizedState = n.memoizedState),
                  (e.updateQueue = n.updateQueue),
                  (e.type = n.type),
                  (t = n.dependencies),
                  (e.dependencies = t === null ? null : { lanes: t.lanes, firstContext: t.firstContext })),
            e
        );
    }
    function hi(e, t, n, r, a, o) {
        let s = 0;
        if (((r = e), typeof e === `function`)) fi(e) && (s = 1);
        else if (typeof e === `string`) {
            s = Uf(e, n, he.current) ? 26 : e === `html` || e === `head` || e === `body` ? 27 : 5;
        } else {
            a: switch (e) {
                case ie:
                    return ((e = di(31, n, t, a)), (e.elementType = ie), (e.lanes = o), e);
                case y:
                    return gi(n.children, a, o, t);
                case b:
                    ((s = 8), (a |= 24));
                    break;
                case x:
                    return ((e = di(12, n, t, a | 2)), (e.elementType = x), (e.lanes = o), e);
                case ee:
                    return ((e = di(13, n, t, a)), (e.elementType = ee), (e.lanes = o), e);
                case te:
                    return ((e = di(19, n, t, a)), (e.elementType = te), (e.lanes = o), e);
                default:
                    if (typeof e === `object` && e) {
                        switch (e.$$typeof) {
                            case C:
                                s = 10;
                                break a;
                            case S:
                                s = 9;
                                break a;
                            case w:
                                s = 11;
                                break a;
                            case ne:
                                s = 14;
                                break a;
                            case re:
                                ((s = 16), (r = null));
                                break a;
                        }
                    }
                    ((s = 29), (n = Error(i(130, e === null ? `null` : typeof e, ``))), (r = null));
            }
        }
        return ((t = di(s, n, t, a)), (t.elementType = e), (t.type = r), (t.lanes = o), t);
    }
    function gi(e, t, n, r) {
        return ((e = di(7, e, r, t)), (e.lanes = n), e);
    }
    function _i(e, t, n) {
        return ((e = di(6, e, null, t)), (e.lanes = n), e);
    }
    function vi(e) {
        const t = di(18, null, null, 0);
        return ((t.stateNode = e), t);
    }
    function yi(e, t, n) {
        return (
            (t = di(4, e.children === null ? [] : e.children, e.key, t)),
            (t.lanes = n),
            (t.stateNode = {
                containerInfo: e.containerInfo,
                pendingChildren: null,
                implementation: e.implementation
            }),
            t
        );
    }
    const bi = new WeakMap();
    function xi(e, t) {
        if (typeof e === `object` && e) {
            const n = bi.get(e);
            return n === void 0 ? ((t = { value: e, source: t, stack: ke(t) }), bi.set(e, t), t) : n;
        }
        return { value: e, source: t, stack: ke(t) };
    }
    const Si = [];
    let Ci = 0;
    let wi = null;
    let Ti = 0;
    const Ei = [];
    let Di = 0;
    let Oi = null;
    let ki = 1;
    let Ai = ``;
    function ji(e, t) {
        ((Si[Ci++] = Ti), (Si[Ci++] = wi), (wi = e), (Ti = t));
    }
    function Mi(e, t, n) {
        ((Ei[Di++] = ki), (Ei[Di++] = Ai), (Ei[Di++] = Oi), (Oi = e));
        let r = ki;
        e = Ai;
        let i = 32 - Ke(r) - 1;
        ((r &= ~(1 << i)), (n += 1));
        let a = 32 - Ke(t) + i;
        if (a > 30) {
            const o = i - (i % 5);
            ((a = (r & ((1 << o) - 1)).toString(32)),
                (r >>= o),
                (i -= o),
                (ki = (1 << (32 - Ke(t) + i)) | (n << i) | r),
                (Ai = a + e));
        } else ((ki = (1 << a) | (n << i) | r), (Ai = e));
    }
    function Ni(e) {
        e.return !== null && (ji(e, 1), Mi(e, 1, 0));
    }
    function Pi(e) {
        for (; e === wi;) ((wi = Si[--Ci]), (Si[Ci] = null), (Ti = Si[--Ci]), (Si[Ci] = null));
        for (; e === Oi;) {
            ((Oi = Ei[--Di]), (Ei[Di] = null), (Ai = Ei[--Di]), (Ei[Di] = null), (ki = Ei[--Di]), (Ei[Di] = null));
        }
    }
    function Fi(e, t) {
        ((Ei[Di++] = ki), (Ei[Di++] = Ai), (Ei[Di++] = Oi), (ki = t.id), (Ai = t.overflow), (Oi = e));
    }
    let Ii = null;
    let I = null;
    let L = !1;
    let Li = null;
    let Ri = !1;
    const zi = Error(i(519));
    function R(e) {
        throw (
            Gi(
                xi(
                    Error(
                        i(418, arguments.length > 1 && arguments[1] !== void 0 && arguments[1] ? `text` : `HTML`, ``)
                    ),
                    e
                )
            ),
            zi
        );
    }
    function Bi(e) {
        let t = e.stateNode;
        let n = e.type;
        const r = e.memoizedProps;
        switch (((t[A] = e), (t[j] = r), n)) {
            case `dialog`:
                (Q(`cancel`, t), Q(`close`, t));
                break;
            case `iframe`:
            case `object`:
            case `embed`:
                Q(`load`, t);
                break;
            case `video`:
            case `audio`:
                for (n = 0; n < _d.length; n++) Q(_d[n], t);
                break;
            case `source`:
                Q(`error`, t);
                break;
            case `img`:
            case `image`:
            case `link`:
                (Q(`error`, t), Q(`load`, t));
                break;
            case `details`:
                Q(`toggle`, t);
                break;
            case `input`:
                (Q(`invalid`, t), Wt(t, r.value, r.defaultValue, r.checked, r.defaultChecked, r.type, r.name, !0));
                break;
            case `select`:
                Q(`invalid`, t);
                break;
            case `textarea`:
                (Q(`invalid`, t), Jt(t, r.value, r.defaultValue, r.children));
        }
        ((n = r.children),
            (typeof n !== `string` && typeof n !== `number` && typeof n !== `bigint`) ||
            t.textContent === `` + n ||
            !0 === r.suppressHydrationWarning ||
            Md(t.textContent, n)
                ? (r.popover != null && (Q(`beforetoggle`, t), Q(`toggle`, t)),
                  r.onScroll != null && Q(`scroll`, t),
                  r.onScrollEnd != null && Q(`scrollend`, t),
                  r.onClick != null && (t.onclick = F),
                  (t = !0))
                : (t = !1),
            t || R(e, !0));
    }
    function Vi(e) {
        for (Ii = e.return; Ii;) {
            switch (Ii.tag) {
                case 5:
                case 31:
                case 13:
                    Ri = !1;
                    return;
                case 27:
                case 3:
                    Ri = !0;
                    return;
                default:
                    Ii = Ii.return;
            }
        }
    }
    function Hi(e) {
        if (e !== Ii) return !1;
        if (!L) return (Vi(e), (L = !0), !1);
        let t = e.tag;
        let n;
        if (
            ((n = t !== 3 && t !== 27) &&
                ((n = t === 5) &&
                    ((n = e.type), (n = !(n !== `form` && n !== `button`) || Ud(e.type, e.memoizedProps))),
                (n = !n)),
            n && I && R(e),
            Vi(e),
            t === 13)
        ) {
            if (((e = e.memoizedState), (e = e === null ? null : e.dehydrated), !e)) throw Error(i(317));
            I = uf(e);
        } else if (t === 31) {
            if (((e = e.memoizedState), (e = e === null ? null : e.dehydrated), !e)) throw Error(i(317));
            I = uf(e);
        } else {
            t === 27
                ? ((t = I), Zd(e.type) ? ((e = lf), (lf = null), (I = e)) : (I = t))
                : (I = Ii ? cf(e.stateNode.nextSibling) : null);
        }
        return !0;
    }
    function Ui() {
        ((I = Ii = null), (L = !1));
    }
    function Wi() {
        const e = Li;
        return (e !== null && (Ql === null ? (Ql = e) : Ql.push.apply(Ql, e), (Li = null)), e);
    }
    function Gi(e) {
        Li === null ? (Li = [e]) : Li.push(e);
    }
    const Ki = me(null);
    let qi = null;
    let Ji = null;
    function z(e, t, n) {
        (O(Ki, t._currentValue), (t._currentValue = n));
    }
    function Yi(e) {
        ((e._currentValue = Ki.current), D(Ki));
    }
    function Xi(e, t, n) {
        for (; e !== null;) {
            const r = e.alternate;
            if (
                ((e.childLanes & t) === t
                    ? r !== null && (r.childLanes & t) !== t && (r.childLanes |= t)
                    : ((e.childLanes |= t), r !== null && (r.childLanes |= t)),
                e === n)
            ) {
                break;
            }
            e = e.return;
        }
    }
    function Zi(e, t, n, r) {
        let a = e.child;
        for (a !== null && (a.return = e); a !== null;) {
            let o = a.dependencies;
            if (o !== null) {
                var s = a.child;
                o = o.firstContext;
                a: for (; o !== null;) {
                    let c = o;
                    o = a;
                    for (let l = 0; l < t.length; l++) {
                        if (c.context === t[l]) {
                            ((o.lanes |= n),
                                (c = o.alternate),
                                c !== null && (c.lanes |= n),
                                Xi(o.return, n, e),
                                r || (s = null));
                            break a;
                        }
                    }
                    o = c.next;
                }
            } else if (a.tag === 18) {
                if (((s = a.return), s === null)) throw Error(i(341));
                ((s.lanes |= n), (o = s.alternate), o !== null && (o.lanes |= n), Xi(s, n, e), (s = null));
            } else s = a.child;
            if (s !== null) s.return = a;
            else {
                for (s = a; s !== null;) {
                    if (s === e) {
                        s = null;
                        break;
                    }
                    if (((a = s.sibling), a !== null)) {
                        ((a.return = s.return), (s = a));
                        break;
                    }
                    s = s.return;
                }
            }
            a = s;
        }
    }
    function Qi(e, t, n, r) {
        e = null;
        for (let a = t, o = !1; a !== null;) {
            if (!o) {
                if (a.flags & 524288) o = !0;
                else if (a.flags & 262144) break;
            }
            if (a.tag === 10) {
                var s = a.alternate;
                if (s === null) throw Error(i(387));
                if (((s = s.memoizedProps), s !== null)) {
                    const c = a.type;
                    Tr(a.pendingProps.value, s.value) || (e === null ? (e = [c]) : e.push(c));
                }
            } else if (a === ve.current) {
                if (((s = a.alternate), s === null)) throw Error(i(387));
                s.memoizedState.memoizedState !== a.memoizedState.memoizedState &&
                    (e === null ? (e = [Qf]) : e.push(Qf));
            }
            a = a.return;
        }
        (e !== null && Zi(t, e, n, r), (t.flags |= 262144));
    }
    function $i(e) {
        for (e = e.firstContext; e !== null;) {
            if (!Tr(e.context._currentValue, e.memoizedValue)) return !0;
            e = e.next;
        }
        return !1;
    }
    function ea(e) {
        ((qi = e), (Ji = null), (e = e.dependencies), e !== null && (e.firstContext = null));
    }
    function ta(e) {
        return ra(qi, e);
    }
    function na(e, t) {
        return (qi === null && ea(e), ra(e, t));
    }
    function ra(e, t) {
        const n = t._currentValue;
        if (((t = { context: t, memoizedValue: n, next: null }), Ji === null)) {
            if (e === null) throw Error(i(308));
            ((Ji = t), (e.dependencies = { lanes: 0, firstContext: t }), (e.flags |= 524288));
        } else Ji = Ji.next = t;
        return n;
    }
    const ia =
        typeof AbortController < `u`
            ? AbortController
            : function () {
                  const e = [];
                  const t = (this.signal = {
                      aborted: !1,
                      addEventListener: function (t, n) {
                          e.push(n);
                      }
                  });
                  this.abort = function () {
                      ((t.aborted = !0),
                          e.forEach(function (e) {
                              return e();
                          }));
                  };
              };
    const aa = t.unstable_scheduleCallback;
    const oa = t.unstable_NormalPriority;
    const sa = {
        $$typeof: C,
        Consumer: null,
        Provider: null,
        _currentValue: null,
        _currentValue2: null,
        _threadCount: 0
    };
    function ca() {
        return { controller: new ia(), data: new Map(), refCount: 0 };
    }
    function la(e) {
        (e.refCount--,
            e.refCount === 0 &&
                aa(oa, function () {
                    e.controller.abort();
                }));
    }
    let ua = null;
    let da = 0;
    let fa = 0;
    let pa = null;
    function ma(e, t) {
        if (ua === null) {
            const n = (ua = []);
            ((da = 0),
                (fa = dd()),
                (pa = {
                    status: `pending`,
                    value: void 0,
                    then: function (e) {
                        n.push(e);
                    }
                }));
        }
        return (da++, t.then(ha, ha), t);
    }
    function ha() {
        if (--da === 0 && ua !== null) {
            pa !== null && (pa.status = `fulfilled`);
            const e = ua;
            ((ua = null), (fa = 0), (pa = null));
            for (let t = 0; t < e.length; t++) (0, e[t])();
        }
    }
    function ga(e, t) {
        const n = [];
        const r = {
            status: `pending`,
            value: null,
            reason: null,
            then: function (e) {
                n.push(e);
            }
        };
        return (
            e.then(
                function () {
                    ((r.status = `fulfilled`), (r.value = t));
                    for (let e = 0; e < n.length; e++) (0, n[e])(t);
                },
                function (e) {
                    for (r.status = `rejected`, r.reason = e, e = 0; e < n.length; e++) (0, n[e])(void 0);
                }
            ),
            r
        );
    }
    const _a = T.S;
    T.S = function (e, t) {
        ((tu = Fe()), typeof t === `object` && t && typeof t.then === `function` && ma(e, t), _a !== null && _a(e, t));
    };
    const va = me(null);
    function ya() {
        const e = va.current;
        return e === null ? K.pooledCache : e;
    }
    function ba(e, t) {
        t === null ? O(va, va.current) : O(va, t.pool);
    }
    function xa() {
        const e = ya();
        return e === null ? null : { parent: sa._currentValue, pool: e };
    }
    const Sa = Error(i(460));
    const Ca = Error(i(474));
    const wa = Error(i(542));
    const Ta = { then: function () {} };
    function Ea(e) {
        return ((e = e.status), e === `fulfilled` || e === `rejected`);
    }
    function Da(e, t, n) {
        switch (((n = e[n]), n === void 0 ? e.push(t) : n !== t && (t.then(F, F), (t = n)), t.status)) {
            case `fulfilled`:
                return t.value;
            case `rejected`:
                throw ((e = t.reason), ja(e), e);
            default:
                if (typeof t.status === `string`) t.then(F, F);
                else {
                    if (((e = K), e !== null && e.shellSuspendCounter > 100)) throw Error(i(482));
                    ((e = t),
                        (e.status = `pending`),
                        e.then(
                            function (e) {
                                if (t.status === `pending`) {
                                    const n = t;
                                    ((n.status = `fulfilled`), (n.value = e));
                                }
                            },
                            function (e) {
                                if (t.status === `pending`) {
                                    const n = t;
                                    ((n.status = `rejected`), (n.reason = e));
                                }
                            }
                        ));
                }
                switch (t.status) {
                    case `fulfilled`:
                        return t.value;
                    case `rejected`:
                        throw ((e = t.reason), ja(e), e);
                }
                throw ((ka = t), Sa);
        }
    }
    function Oa(e) {
        try {
            const t = e._init;
            return t(e._payload);
        } catch (e) {
            throw typeof e === `object` && e && typeof e.then === `function` ? ((ka = e), Sa) : e;
        }
    }
    var ka = null;
    function Aa() {
        if (ka === null) throw Error(i(459));
        const e = ka;
        return ((ka = null), e);
    }
    function ja(e) {
        if (e === Sa || e === wa) throw Error(i(483));
    }
    let Ma = null;
    let Na = 0;
    function Pa(e) {
        const t = Na;
        return ((Na += 1), Ma === null && (Ma = []), Da(Ma, e, t));
    }
    function Fa(e, t) {
        ((t = t.props.ref), (e.ref = t === void 0 ? null : t));
    }
    function Ia(e, t) {
        throw t.$$typeof === m
            ? Error(i(525))
            : ((e = Object.prototype.toString.call(t)),
              Error(i(31, e === `[object Object]` ? `object with keys {` + Object.keys(t).join(`, `) + `}` : e)));
    }
    function La(e) {
        function t(t, n) {
            if (e) {
                const r = t.deletions;
                r === null ? ((t.deletions = [n]), (t.flags |= 16)) : r.push(n);
            }
        }
        function n(n, r) {
            if (!e) return null;
            for (; r !== null;) (t(n, r), (r = r.sibling));
            return null;
        }
        function r(e) {
            for (var t = new Map(); e !== null;) {
                (e.key === null ? t.set(e.index, e) : t.set(e.key, e), (e = e.sibling));
            }
            return t;
        }
        function a(e, t) {
            return ((e = pi(e, t)), (e.index = 0), (e.sibling = null), e);
        }
        function o(t, n, r) {
            return (
                (t.index = r),
                e
                    ? ((r = t.alternate),
                      r === null ? ((t.flags |= 67108866), n) : ((r = r.index), r < n ? ((t.flags |= 67108866), n) : r))
                    : ((t.flags |= 1048576), n)
            );
        }
        function s(t) {
            return (e && t.alternate === null && (t.flags |= 67108866), t);
        }
        function c(e, t, n, r) {
            return t === null || t.tag !== 6
                ? ((t = _i(n, e.mode, r)), (t.return = e), t)
                : ((t = a(t, n)), (t.return = e), t);
        }
        function l(e, t, n, r) {
            const i = n.type;
            return i === y
                ? d(e, t, n.props.children, r, n.key)
                : t !== null &&
                    (t.elementType === i || (typeof i === `object` && i && i.$$typeof === re && Oa(i) === t.type))
                  ? ((t = a(t, n.props)), Fa(t, n), (t.return = e), t)
                  : ((t = hi(n.type, n.key, n.props, null, e.mode, r)), Fa(t, n), (t.return = e), t);
        }
        function u(e, t, n, r) {
            return t === null ||
                t.tag !== 4 ||
                t.stateNode.containerInfo !== n.containerInfo ||
                t.stateNode.implementation !== n.implementation
                ? ((t = yi(n, e.mode, r)), (t.return = e), t)
                : ((t = a(t, n.children || [])), (t.return = e), t);
        }
        function d(e, t, n, r, i) {
            return t === null || t.tag !== 7
                ? ((t = gi(n, e.mode, r, i)), (t.return = e), t)
                : ((t = a(t, n)), (t.return = e), t);
        }
        function f(e, t, n) {
            if ((typeof t === `string` && t !== ``) || typeof t === `number` || typeof t === `bigint`) {
                return ((t = _i(`` + t, e.mode, n)), (t.return = e), t);
            }
            if (typeof t === `object` && t) {
                switch (t.$$typeof) {
                    case g:
                        return ((n = hi(t.type, t.key, t.props, null, e.mode, n)), Fa(n, t), (n.return = e), n);
                    case v:
                        return ((t = yi(t, e.mode, n)), (t.return = e), t);
                    case re:
                        return ((t = Oa(t)), f(e, t, n));
                }
                if (ue(t) || se(t)) return ((t = gi(t, e.mode, n, null)), (t.return = e), t);
                if (typeof t.then === `function`) return f(e, Pa(t), n);
                if (t.$$typeof === C) return f(e, na(e, t), n);
                Ia(e, t);
            }
            return null;
        }
        function p(e, t, n, r) {
            const i = t === null ? null : t.key;
            if ((typeof n === `string` && n !== ``) || typeof n === `number` || typeof n === `bigint`) {
                return i === null ? c(e, t, `` + n, r) : null;
            }
            if (typeof n === `object` && n) {
                switch (n.$$typeof) {
                    case g:
                        return n.key === i ? l(e, t, n, r) : null;
                    case v:
                        return n.key === i ? u(e, t, n, r) : null;
                    case re:
                        return ((n = Oa(n)), p(e, t, n, r));
                }
                if (ue(n) || se(n)) return i === null ? d(e, t, n, r, null) : null;
                if (typeof n.then === `function`) return p(e, t, Pa(n), r);
                if (n.$$typeof === C) return p(e, t, na(e, n), r);
                Ia(e, n);
            }
            return null;
        }
        function m(e, t, n, r, i) {
            if ((typeof r === `string` && r !== ``) || typeof r === `number` || typeof r === `bigint`) {
                return ((e = e.get(n) || null), c(t, e, `` + r, i));
            }
            if (typeof r === `object` && r) {
                switch (r.$$typeof) {
                    case g:
                        return ((e = e.get(r.key === null ? n : r.key) || null), l(t, e, r, i));
                    case v:
                        return ((e = e.get(r.key === null ? n : r.key) || null), u(t, e, r, i));
                    case re:
                        return ((r = Oa(r)), m(e, t, n, r, i));
                }
                if (ue(r) || se(r)) return ((e = e.get(n) || null), d(t, e, r, i, null));
                if (typeof r.then === `function`) return m(e, t, n, Pa(r), i);
                if (r.$$typeof === C) return m(e, t, n, na(t, r), i);
                Ia(t, r);
            }
            return null;
        }
        function h(i, a, s, c) {
            for (var l = null, u = null, d = a, h = (a = 0), g = null; d !== null && h < s.length; h++) {
                d.index > h ? ((g = d), (d = null)) : (g = d.sibling);
                const _ = p(i, d, s[h], c);
                if (_ === null) {
                    d === null && (d = g);
                    break;
                }
                (e && d && _.alternate === null && t(i, d),
                    (a = o(_, a, h)),
                    u === null ? (l = _) : (u.sibling = _),
                    (u = _),
                    (d = g));
            }
            if (h === s.length) return (n(i, d), L && ji(i, h), l);
            if (d === null) {
                for (; h < s.length; h++) {
                    ((d = f(i, s[h], c)),
                        d !== null && ((a = o(d, a, h)), u === null ? (l = d) : (u.sibling = d), (u = d)));
                }
                return (L && ji(i, h), l);
            }
            for (d = r(d); h < s.length; h++) {
                ((g = m(d, i, h, s[h], c)),
                    g !== null &&
                        (e && g.alternate !== null && d.delete(g.key === null ? h : g.key),
                        (a = o(g, a, h)),
                        u === null ? (l = g) : (u.sibling = g),
                        (u = g)));
            }
            return (
                e &&
                    d.forEach(function (e) {
                        return t(i, e);
                    }),
                L && ji(i, h),
                l
            );
        }
        function _(a, s, c, l) {
            if (c == null) throw Error(i(151));
            for (
                var u = null, d = null, h = s, g = (s = 0), _ = null, v = c.next();
                h !== null && !v.done;
                g++, v = c.next()
            ) {
                h.index > g ? ((_ = h), (h = null)) : (_ = h.sibling);
                const y = p(a, h, v.value, l);
                if (y === null) {
                    h === null && (h = _);
                    break;
                }
                (e && h && y.alternate === null && t(a, h),
                    (s = o(y, s, g)),
                    d === null ? (u = y) : (d.sibling = y),
                    (d = y),
                    (h = _));
            }
            if (v.done) return (n(a, h), L && ji(a, g), u);
            if (h === null) {
                for (; !v.done; g++, v = c.next()) {
                    ((v = f(a, v.value, l)),
                        v !== null && ((s = o(v, s, g)), d === null ? (u = v) : (d.sibling = v), (d = v)));
                }
                return (L && ji(a, g), u);
            }
            for (h = r(h); !v.done; g++, v = c.next()) {
                ((v = m(h, a, g, v.value, l)),
                    v !== null &&
                        (e && v.alternate !== null && h.delete(v.key === null ? g : v.key),
                        (s = o(v, s, g)),
                        d === null ? (u = v) : (d.sibling = v),
                        (d = v)));
            }
            return (
                e &&
                    h.forEach(function (e) {
                        return t(a, e);
                    }),
                L && ji(a, g),
                u
            );
        }
        function b(e, r, o, c) {
            if (
                (typeof o === `object` && o && o.type === y && o.key === null && (o = o.props.children),
                typeof o === `object` && o)
            ) {
                switch (o.$$typeof) {
                    case g:
                        a: {
                            for (var l = o.key; r !== null;) {
                                if (r.key === l) {
                                    if (((l = o.type), l === y)) {
                                        if (r.tag === 7) {
                                            (n(e, r.sibling), (c = a(r, o.props.children)), (c.return = e), (e = c));
                                            break a;
                                        }
                                    } else if (
                                        r.elementType === l ||
                                        (typeof l === `object` && l && l.$$typeof === re && Oa(l) === r.type)
                                    ) {
                                        (n(e, r.sibling), (c = a(r, o.props)), Fa(c, o), (c.return = e), (e = c));
                                        break a;
                                    }
                                    n(e, r);
                                    break;
                                } else t(e, r);
                                r = r.sibling;
                            }
                            o.type === y
                                ? ((c = gi(o.props.children, e.mode, c, o.key)), (c.return = e), (e = c))
                                : ((c = hi(o.type, o.key, o.props, null, e.mode, c)),
                                  Fa(c, o),
                                  (c.return = e),
                                  (e = c));
                        }
                        return s(e);
                    case v:
                        a: {
                            for (l = o.key; r !== null;) {
                                if (r.key === l) {
                                    if (
                                        r.tag === 4 &&
                                        r.stateNode.containerInfo === o.containerInfo &&
                                        r.stateNode.implementation === o.implementation
                                    ) {
                                        (n(e, r.sibling), (c = a(r, o.children || [])), (c.return = e), (e = c));
                                        break a;
                                    } else {
                                        n(e, r);
                                        break;
                                    }
                                } else t(e, r);
                                r = r.sibling;
                            }
                            ((c = yi(o, e.mode, c)), (c.return = e), (e = c));
                        }
                        return s(e);
                    case re:
                        return ((o = Oa(o)), b(e, r, o, c));
                }
                if (ue(o)) return h(e, r, o, c);
                if (se(o)) {
                    if (((l = se(o)), typeof l !== `function`)) throw Error(i(150));
                    return ((o = l.call(o)), _(e, r, o, c));
                }
                if (typeof o.then === `function`) return b(e, r, Pa(o), c);
                if (o.$$typeof === C) return b(e, r, na(e, o), c);
                Ia(e, o);
            }
            return (typeof o === `string` && o !== ``) || typeof o === `number` || typeof o === `bigint`
                ? ((o = `` + o),
                  r !== null && r.tag === 6
                      ? (n(e, r.sibling), (c = a(r, o)), (c.return = e), (e = c))
                      : (n(e, r), (c = _i(o, e.mode, c)), (c.return = e), (e = c)),
                  s(e))
                : n(e, r);
        }
        return function (e, t, n, r) {
            try {
                Na = 0;
                const i = b(e, t, n, r);
                return ((Ma = null), i);
            } catch (t) {
                if (t === Sa || t === wa) throw t;
                const a = di(29, t, null, e.mode);
                return ((a.lanes = r), (a.return = e), a);
            }
        };
    }
    const Ra = La(!0);
    const za = La(!1);
    let Ba = !1;
    function Va(e) {
        e.updateQueue = {
            baseState: e.memoizedState,
            firstBaseUpdate: null,
            lastBaseUpdate: null,
            shared: { pending: null, lanes: 0, hiddenCallbacks: null },
            callbacks: null
        };
    }
    function Ha(e, t) {
        ((e = e.updateQueue),
            t.updateQueue === e &&
                (t.updateQueue = {
                    baseState: e.baseState,
                    firstBaseUpdate: e.firstBaseUpdate,
                    lastBaseUpdate: e.lastBaseUpdate,
                    shared: e.shared,
                    callbacks: null
                }));
    }
    function Ua(e) {
        return { lane: e, tag: 0, payload: null, callback: null, next: null };
    }
    function Wa(e, t, n) {
        let r = e.updateQueue;
        if (r === null) return null;
        if (((r = r.shared), G & 2)) {
            const i = r.pending;
            return (
                i === null ? (t.next = t) : ((t.next = i.next), (i.next = t)),
                (r.pending = t),
                (t = ci(e)),
                si(e, null, n),
                t
            );
        }
        return (ii(e, r, t, n), ci(e));
    }
    function Ga(e, t, n) {
        if (((t = t.updateQueue), t !== null && ((t = t.shared), n & 4194048))) {
            let r = t.lanes;
            ((r &= e.pendingLanes), (n |= r), (t.lanes = n), ct(e, n));
        }
    }
    function Ka(e, t) {
        let n = e.updateQueue;
        let r = e.alternate;
        if (r !== null && ((r = r.updateQueue), n === r)) {
            let i = null;
            let a = null;
            if (((n = n.firstBaseUpdate), n !== null)) {
                do {
                    const o = { lane: n.lane, tag: n.tag, payload: n.payload, callback: null, next: null };
                    (a === null ? (i = a = o) : (a = a.next = o), (n = n.next));
                } while (n !== null);
                a === null ? (i = a = t) : (a = a.next = t);
            } else i = a = t;
            ((n = {
                baseState: r.baseState,
                firstBaseUpdate: i,
                lastBaseUpdate: a,
                shared: r.shared,
                callbacks: r.callbacks
            }),
                (e.updateQueue = n));
            return;
        }
        ((e = n.lastBaseUpdate), e === null ? (n.firstBaseUpdate = t) : (e.next = t), (n.lastBaseUpdate = t));
    }
    let qa = !1;
    function Ja() {
        if (qa) {
            const e = pa;
            if (e !== null) throw e;
        }
    }
    function Ya(e, t, n, r) {
        qa = !1;
        const i = e.updateQueue;
        Ba = !1;
        let a = i.firstBaseUpdate;
        let o = i.lastBaseUpdate;
        let s = i.shared.pending;
        if (s !== null) {
            i.shared.pending = null;
            var c = s;
            var l = c.next;
            ((c.next = null), o === null ? (a = l) : (o.next = l), (o = c));
            var u = e.alternate;
            u !== null &&
                ((u = u.updateQueue),
                (s = u.lastBaseUpdate),
                s !== o && (s === null ? (u.firstBaseUpdate = l) : (s.next = l), (u.lastBaseUpdate = c)));
        }
        if (a !== null) {
            let d = i.baseState;
            ((o = 0), (u = l = c = null), (s = a));
            do {
                let p = s.lane & -536870913;
                let m = p !== s.lane;
                if (m ? (J & p) === p : (r & p) === p) {
                    (p !== 0 && p === fa && (qa = !0),
                        u !== null &&
                            (u = u.next = { lane: 0, tag: s.tag, payload: s.payload, callback: null, next: null }));
                    a: {
                        let h = e;
                        const g = s;
                        p = t;
                        const _ = n;
                        switch (g.tag) {
                            case 1:
                                if (((h = g.payload), typeof h === `function`)) {
                                    d = h.call(_, d, p);
                                    break a;
                                }
                                d = h;
                                break a;
                            case 3:
                                h.flags = (h.flags & -65537) | 128;
                            case 0:
                                if (((h = g.payload), (p = typeof h === `function` ? h.call(_, d, p) : h), p == null)) {
                                    break a;
                                }
                                d = f({}, d, p);
                                break a;
                            case 2:
                                Ba = !0;
                        }
                    }
                    ((p = s.callback),
                        p !== null &&
                            ((e.flags |= 64),
                            m && (e.flags |= 8192),
                            (m = i.callbacks),
                            m === null ? (i.callbacks = [p]) : m.push(p)));
                } else {
                    ((m = { lane: p, tag: s.tag, payload: s.payload, callback: s.callback, next: null }),
                        u === null ? ((l = u = m), (c = d)) : (u = u.next = m),
                        (o |= p));
                }
                if (((s = s.next), s === null)) {
                    if (((s = i.shared.pending), s === null)) break;
                    ((m = s), (s = m.next), (m.next = null), (i.lastBaseUpdate = m), (i.shared.pending = null));
                }
            } while (1);
            (u === null && (c = d),
                (i.baseState = c),
                (i.firstBaseUpdate = l),
                (i.lastBaseUpdate = u),
                a === null && (i.shared.lanes = 0),
                (Kl |= o),
                (e.lanes = o),
                (e.memoizedState = d));
        }
    }
    function Xa(e, t) {
        if (typeof e !== `function`) throw Error(i(191, e));
        e.call(t);
    }
    function Za(e, t) {
        const n = e.callbacks;
        if (n !== null) for (e.callbacks = null, e = 0; e < n.length; e++) Xa(n[e], t);
    }
    const Qa = me(null);
    const $a = me(0);
    function eo(e, t) {
        ((e = Wl), O($a, e), O(Qa, t), (Wl = e | t.baseLanes));
    }
    function to() {
        (O($a, Wl), O(Qa, Qa.current));
    }
    function no() {
        ((Wl = $a.current), D(Qa), D($a));
    }
    const ro = me(null);
    let io = null;
    function ao(e) {
        const t = e.alternate;
        (O(uo, uo.current & 1),
            O(ro, e),
            io === null && (t === null || Qa.current !== null || t.memoizedState !== null) && (io = e));
    }
    function oo(e) {
        (O(uo, uo.current), O(ro, e), io === null && (io = e));
    }
    function so(e) {
        e.tag === 22 ? (O(uo, uo.current), O(ro, e), io === null && (io = e)) : co(e);
    }
    function co() {
        (O(uo, uo.current), O(ro, ro.current));
    }
    function lo(e) {
        (D(ro), io === e && (io = null), D(uo));
    }
    var uo = me(0);
    function fo(e) {
        for (let t = e; t !== null;) {
            if (t.tag === 13) {
                let n = t.memoizedState;
                if (n !== null && ((n = n.dehydrated), n === null || af(n) || of(n))) return t;
            } else if (
                t.tag === 19 &&
                (t.memoizedProps.revealOrder === `forwards` ||
                    t.memoizedProps.revealOrder === `backwards` ||
                    t.memoizedProps.revealOrder === `unstable_legacy-backwards` ||
                    t.memoizedProps.revealOrder === `together`)
            ) {
                if (t.flags & 128) return t;
            } else if (t.child !== null) {
                ((t.child.return = t), (t = t.child));
                continue;
            }
            if (t === e) break;
            for (; t.sibling === null;) {
                if (t.return === null || t.return === e) return null;
                t = t.return;
            }
            ((t.sibling.return = t.return), (t = t.sibling));
        }
        return null;
    }
    let po = 0;
    let B = null;
    let V = null;
    let mo = null;
    let ho = !1;
    let go = !1;
    let _o = !1;
    let vo = 0;
    let yo = 0;
    let bo = null;
    let xo = 0;
    function H() {
        throw Error(i(321));
    }
    function So(e, t) {
        if (t === null) return !1;
        for (let n = 0; n < t.length && n < e.length; n++) if (!Tr(e[n], t[n])) return !1;
        return !0;
    }
    function Co(e, t, n, r, i, a) {
        return (
            (po = a),
            (B = t),
            (t.memoizedState = null),
            (t.updateQueue = null),
            (t.lanes = 0),
            (T.H = e === null || e.memoizedState === null ? Bs : Vs),
            (_o = !1),
            (a = n(r, i)),
            (_o = !1),
            go && (a = To(t, n, r, i)),
            wo(e),
            a
        );
    }
    function wo(e) {
        T.H = zs;
        const t = V !== null && V.next !== null;
        if (((po = 0), (mo = V = B = null), (ho = !1), (yo = 0), (bo = null), t)) throw Error(i(300));
        e === null || ic || ((e = e.dependencies), e !== null && $i(e) && (ic = !0));
    }
    function To(e, t, n, r) {
        B = e;
        let a = 0;
        do {
            if ((go && (bo = null), (yo = 0), (go = !1), a >= 25)) throw Error(i(301));
            if (((a += 1), (mo = V = null), e.updateQueue != null)) {
                var o = e.updateQueue;
                ((o.lastEffect = null),
                    (o.events = null),
                    (o.stores = null),
                    o.memoCache != null && (o.memoCache.index = 0));
            }
            ((T.H = Hs), (o = t(n, r)));
        } while (go);
        return o;
    }
    function Eo() {
        let e = T.H;
        let t = e.useState()[0];
        return (
            (t = typeof t.then === `function` ? No(t) : t),
            (e = e.useState()[0]),
            (V === null ? null : V.memoizedState) !== e && (B.flags |= 1024),
            t
        );
    }
    function Do() {
        const e = vo !== 0;
        return ((vo = 0), e);
    }
    function Oo(e, t, n) {
        ((t.updateQueue = e.updateQueue), (t.flags &= -2053), (e.lanes &= ~n));
    }
    function ko(e) {
        if (ho) {
            for (e = e.memoizedState; e !== null;) {
                const t = e.queue;
                (t !== null && (t.pending = null), (e = e.next));
            }
            ho = !1;
        }
        ((po = 0), (mo = V = B = null), (go = !1), (yo = vo = 0), (bo = null));
    }
    function Ao() {
        const e = { memoizedState: null, baseState: null, baseQueue: null, queue: null, next: null };
        return (mo === null ? (B.memoizedState = mo = e) : (mo = mo.next = e), mo);
    }
    function jo() {
        if (V === null) {
            var e = B.alternate;
            e = e === null ? null : e.memoizedState;
        } else e = V.next;
        const t = mo === null ? B.memoizedState : mo.next;
        if (t !== null) ((mo = t), (V = e));
        else {
            if (e === null) throw B.alternate === null ? Error(i(467)) : Error(i(310));
            ((V = e),
                (e = {
                    memoizedState: V.memoizedState,
                    baseState: V.baseState,
                    baseQueue: V.baseQueue,
                    queue: V.queue,
                    next: null
                }),
                mo === null ? (B.memoizedState = mo = e) : (mo = mo.next = e));
        }
        return mo;
    }
    function Mo() {
        return { lastEffect: null, events: null, stores: null, memoCache: null };
    }
    function No(e) {
        let t = yo;
        return (
            (yo += 1),
            bo === null && (bo = []),
            (e = Da(bo, e, t)),
            (t = B),
            (mo === null ? t.memoizedState : mo.next) === null &&
                ((t = t.alternate), (T.H = t === null || t.memoizedState === null ? Bs : Vs)),
            e
        );
    }
    function Po(e) {
        if (typeof e === `object` && e) {
            if (typeof e.then === `function`) return No(e);
            if (e.$$typeof === C) return ta(e);
        }
        throw Error(i(438, String(e)));
    }
    function Fo(e) {
        let t = null;
        let n = B.updateQueue;
        if ((n !== null && (t = n.memoCache), t == null)) {
            var r = B.alternate;
            r !== null &&
                ((r = r.updateQueue),
                r !== null &&
                    ((r = r.memoCache),
                    r != null &&
                        (t = {
                            data: r.data.map(function (e) {
                                return e.slice();
                            }),
                            index: 0
                        })));
        }
        if (
            ((t ??= { data: [], index: 0 }),
            n === null && ((n = Mo()), (B.updateQueue = n)),
            (n.memoCache = t),
            (n = t.data[t.index]),
            n === void 0)
        ) {
            for (n = t.data[t.index] = Array(e), r = 0; r < e; r++) n[r] = ae;
        }
        return (t.index++, n);
    }
    function Io(e, t) {
        return typeof t === `function` ? t(e) : t;
    }
    function Lo(e) {
        return Ro(jo(), V, e);
    }
    function Ro(e, t, n) {
        const r = e.queue;
        if (r === null) throw Error(i(311));
        r.lastRenderedReducer = n;
        let a = e.baseQueue;
        let o = r.pending;
        if (o !== null) {
            if (a !== null) {
                var s = a.next;
                ((a.next = o.next), (o.next = s));
            }
            ((t.baseQueue = a = o), (r.pending = null));
        }
        if (((o = e.baseState), a === null)) e.memoizedState = o;
        else {
            t = a.next;
            let c = (s = null);
            let l = null;
            let u = t;
            let d = !1;
            do {
                let f = u.lane & -536870913;
                if (f === u.lane ? (po & f) === f : (J & f) === f) {
                    var p = u.revertLane;
                    if (p === 0) {
                        (l !== null &&
                            (l = l.next =
                                {
                                    lane: 0,
                                    revertLane: 0,
                                    gesture: null,
                                    action: u.action,
                                    hasEagerState: u.hasEagerState,
                                    eagerState: u.eagerState,
                                    next: null
                                }),
                            f === fa && (d = !0));
                    } else if ((po & p) === p) {
                        ((u = u.next), p === fa && (d = !0));
                        continue;
                    } else {
                        ((f = {
                            lane: 0,
                            revertLane: u.revertLane,
                            gesture: null,
                            action: u.action,
                            hasEagerState: u.hasEagerState,
                            eagerState: u.eagerState,
                            next: null
                        }),
                            l === null ? ((c = l = f), (s = o)) : (l = l.next = f),
                            (B.lanes |= p),
                            (Kl |= p));
                    }
                    ((f = u.action), _o && n(o, f), (o = u.hasEagerState ? u.eagerState : n(o, f)));
                } else {
                    ((p = {
                        lane: f,
                        revertLane: u.revertLane,
                        gesture: u.gesture,
                        action: u.action,
                        hasEagerState: u.hasEagerState,
                        eagerState: u.eagerState,
                        next: null
                    }),
                        l === null ? ((c = l = p), (s = o)) : (l = l.next = p),
                        (B.lanes |= f),
                        (Kl |= f));
                }
                u = u.next;
            } while (u !== null && u !== t);
            if (
                (l === null ? (s = o) : (l.next = c),
                !Tr(o, e.memoizedState) && ((ic = !0), d && ((n = pa), n !== null)))
            ) {
                throw n;
            }
            ((e.memoizedState = o), (e.baseState = s), (e.baseQueue = l), (r.lastRenderedState = o));
        }
        return (a === null && (r.lanes = 0), [e.memoizedState, r.dispatch]);
    }
    function zo(e) {
        const t = jo();
        const n = t.queue;
        if (n === null) throw Error(i(311));
        n.lastRenderedReducer = e;
        const r = n.dispatch;
        let a = n.pending;
        let o = t.memoizedState;
        if (a !== null) {
            n.pending = null;
            let s = (a = a.next);
            do ((o = e(o, s.action)), (s = s.next));
            while (s !== a);
            (Tr(o, t.memoizedState) || (ic = !0),
                (t.memoizedState = o),
                t.baseQueue === null && (t.baseState = o),
                (n.lastRenderedState = o));
        }
        return [o, r];
    }
    function Bo(e, t, n) {
        const r = B;
        let a = jo();
        const o = L;
        if (o) {
            if (n === void 0) throw Error(i(407));
            n = n();
        } else n = t();
        const s = !Tr((V || a).memoizedState, n);
        if (
            (s && ((a.memoizedState = n), (ic = !0)),
            (a = a.queue),
            ds(Uo.bind(null, r, a, e), [e]),
            a.getSnapshot !== t || s || (mo !== null && mo.memoizedState.tag & 1))
        ) {
            if (((r.flags |= 2048), os(9, { destroy: void 0 }, Ho.bind(null, r, a, n, t), null), K === null)) {
                throw Error(i(349));
            }
            o || po & 127 || Vo(r, t, n);
        }
        return n;
    }
    function Vo(e, t, n) {
        ((e.flags |= 16384),
            (e = { getSnapshot: t, value: n }),
            (t = B.updateQueue),
            t === null
                ? ((t = Mo()), (B.updateQueue = t), (t.stores = [e]))
                : ((n = t.stores), n === null ? (t.stores = [e]) : n.push(e)));
    }
    function Ho(e, t, n, r) {
        ((t.value = n), (t.getSnapshot = r), Wo(t) && Go(e));
    }
    function Uo(e, t, n) {
        return n(function () {
            Wo(t) && Go(e);
        });
    }
    function Wo(e) {
        const t = e.getSnapshot;
        e = e.value;
        try {
            const n = t();
            return !Tr(e, n);
        } catch {
            return !0;
        }
    }
    function Go(e) {
        const t = oi(e, 2);
        t !== null && hu(t, e, 2);
    }
    function Ko(e) {
        const t = Ao();
        if (typeof e === `function`) {
            const n = e;
            if (((e = n()), _o)) {
                Ge(!0);
                try {
                    n();
                } finally {
                    Ge(!1);
                }
            }
        }
        return (
            (t.memoizedState = t.baseState = e),
            (t.queue = { pending: null, lanes: 0, dispatch: null, lastRenderedReducer: Io, lastRenderedState: e }),
            t
        );
    }
    function qo(e, t, n, r) {
        return ((e.baseState = n), Ro(e, V, typeof r === `function` ? r : Io));
    }
    function Jo(e, t, n, r, a) {
        if (Is(e)) throw Error(i(485));
        if (((e = t.action), e !== null)) {
            var o = {
                payload: a,
                action: e,
                next: null,
                isTransition: !0,
                status: `pending`,
                value: null,
                reason: null,
                listeners: [],
                then: function (e) {
                    o.listeners.push(e);
                }
            };
            (T.T === null ? (o.isTransition = !1) : n(!0),
                r(o),
                (n = t.pending),
                n === null ? ((o.next = t.pending = o), Yo(t, o)) : ((o.next = n.next), (t.pending = n.next = o)));
        }
    }
    function Yo(e, t) {
        const n = t.action;
        const r = t.payload;
        const i = e.state;
        if (t.isTransition) {
            var a = T.T;
            const o = {};
            T.T = o;
            try {
                const s = n(i, r);
                const c = T.S;
                (c !== null && c(o, s), Xo(e, t, s));
            } catch (n) {
                Qo(e, t, n);
            } finally {
                (a !== null && o.types !== null && (a.types = o.types), (T.T = a));
            }
        } else {
            try {
                ((a = n(i, r)), Xo(e, t, a));
            } catch (n) {
                Qo(e, t, n);
            }
        }
    }
    function Xo(e, t, n) {
        typeof n === `object` && n && typeof n.then === `function`
            ? n.then(
                  function (n) {
                      Zo(e, t, n);
                  },
                  function (n) {
                      return Qo(e, t, n);
                  }
              )
            : Zo(e, t, n);
    }
    function Zo(e, t, n) {
        ((t.status = `fulfilled`),
            (t.value = n),
            $o(t),
            (e.state = n),
            (t = e.pending),
            t !== null && ((n = t.next), n === t ? (e.pending = null) : ((n = n.next), (t.next = n), Yo(e, n))));
    }
    function Qo(e, t, n) {
        let r = e.pending;
        if (((e.pending = null), r !== null)) {
            r = r.next;
            do ((t.status = `rejected`), (t.reason = n), $o(t), (t = t.next));
            while (t !== r);
        }
        e.action = null;
    }
    function $o(e) {
        e = e.listeners;
        for (let t = 0; t < e.length; t++) (0, e[t])();
    }
    function es(e, t) {
        return t;
    }
    function ts(e, t) {
        if (L) {
            var n = K.formState;
            if (n !== null) {
                a: {
                    var r = B;
                    if (L) {
                        if (I) {
                            b: {
                                for (var i = I, a = Ri; i.nodeType !== 8;) {
                                    if (!a) {
                                        i = null;
                                        break b;
                                    }
                                    if (((i = cf(i.nextSibling)), i === null)) {
                                        i = null;
                                        break b;
                                    }
                                }
                                ((a = i.data), (i = a === `F!` || a === `F` ? i : null));
                            }
                            if (i) {
                                ((I = cf(i.nextSibling)), (r = i.data === `F!`));
                                break a;
                            }
                        }
                        R(r);
                    }
                    r = !1;
                }
                r && (t = n[0]);
            }
        }
        return (
            (n = Ao()),
            (n.memoizedState = n.baseState = t),
            (r = { pending: null, lanes: 0, dispatch: null, lastRenderedReducer: es, lastRenderedState: t }),
            (n.queue = r),
            (n = Ns.bind(null, B, r)),
            (r.dispatch = n),
            (r = Ko(!1)),
            (a = Fs.bind(null, B, !1, r.queue)),
            (r = Ao()),
            (i = { state: t, dispatch: null, action: e, pending: null }),
            (r.queue = i),
            (n = Jo.bind(null, B, i, a, n)),
            (i.dispatch = n),
            (r.memoizedState = e),
            [t, n, !1]
        );
    }
    function ns(e) {
        return rs(jo(), V, e);
    }
    function rs(e, t, n) {
        if (((t = Ro(e, t, es)[0]), (e = Lo(Io)[0]), typeof t === `object` && t && typeof t.then === `function`)) {
            try {
                var r = No(t);
            } catch (e) {
                throw e === Sa ? wa : e;
            }
        } else r = t;
        t = jo();
        const i = t.queue;
        const a = i.dispatch;
        return (
            n !== t.memoizedState && ((B.flags |= 2048), os(9, { destroy: void 0 }, is.bind(null, i, n), null)),
            [r, a, e]
        );
    }
    function is(e, t) {
        e.action = t;
    }
    function as(e) {
        let t = jo();
        let n = V;
        if (n !== null) return rs(t, n, e);
        (jo(), (t = t.memoizedState), (n = jo()));
        const r = n.queue.dispatch;
        return ((n.memoizedState = e), [t, r, !1]);
    }
    function os(e, t, n, r) {
        return (
            (e = { tag: e, create: n, deps: r, inst: t, next: null }),
            (t = B.updateQueue),
            t === null && ((t = Mo()), (B.updateQueue = t)),
            (n = t.lastEffect),
            n === null ? (t.lastEffect = e.next = e) : ((r = n.next), (n.next = e), (e.next = r), (t.lastEffect = e)),
            e
        );
    }
    function ss() {
        return jo().memoizedState;
    }
    function cs(e, t, n, r) {
        const i = Ao();
        ((B.flags |= e), (i.memoizedState = os(1 | t, { destroy: void 0 }, n, r === void 0 ? null : r)));
    }
    function ls(e, t, n, r) {
        const i = jo();
        r = r === void 0 ? null : r;
        const a = i.memoizedState.inst;
        V !== null && r !== null && So(r, V.memoizedState.deps)
            ? (i.memoizedState = os(t, a, n, r))
            : ((B.flags |= e), (i.memoizedState = os(1 | t, a, n, r)));
    }
    function us(e, t) {
        cs(8390656, 8, e, t);
    }
    function ds(e, t) {
        ls(2048, 8, e, t);
    }
    function fs(e) {
        B.flags |= 4;
        let t = B.updateQueue;
        if (t === null) ((t = Mo()), (B.updateQueue = t), (t.events = [e]));
        else {
            const n = t.events;
            n === null ? (t.events = [e]) : n.push(e);
        }
    }
    function ps(e) {
        const t = jo().memoizedState;
        return (
            fs({ ref: t, nextImpl: e }),
            function () {
                if (G & 2) throw Error(i(440));
                return t.impl.apply(void 0, arguments);
            }
        );
    }
    function ms(e, t) {
        return ls(4, 2, e, t);
    }
    function hs(e, t) {
        return ls(4, 4, e, t);
    }
    function gs(e, t) {
        if (typeof t === `function`) {
            e = e();
            const n = t(e);
            return function () {
                typeof n === `function` ? n() : t(null);
            };
        }
        if (t != null) {
            return (
                (e = e()),
                (t.current = e),
                function () {
                    t.current = null;
                }
            );
        }
    }
    function _s(e, t, n) {
        ((n = n == null ? null : n.concat([e])), ls(4, 4, gs.bind(null, t, e), n));
    }
    function vs() {}
    function ys(e, t) {
        const n = jo();
        t = t === void 0 ? null : t;
        const r = n.memoizedState;
        return t !== null && So(t, r[1]) ? r[0] : ((n.memoizedState = [e, t]), e);
    }
    function bs(e, t) {
        const n = jo();
        t = t === void 0 ? null : t;
        let r = n.memoizedState;
        if (t !== null && So(t, r[1])) return r[0];
        if (((r = e()), _o)) {
            Ge(!0);
            try {
                e();
            } finally {
                Ge(!1);
            }
        }
        return ((n.memoizedState = [r, t]), r);
    }
    function xs(e, t, n) {
        return n === void 0 || (po & 1073741824 && !(J & 261930))
            ? (e.memoizedState = t)
            : ((e.memoizedState = n), (e = mu()), (B.lanes |= e), (Kl |= e), n);
    }
    function Ss(e, t, n, r) {
        return Tr(n, t)
            ? n
            : Qa.current === null
              ? !(po & 42) || (po & 1073741824 && !(J & 261930))
                  ? ((ic = !0), (e.memoizedState = n))
                  : ((e = mu()), (B.lanes |= e), (Kl |= e), t)
              : ((e = xs(e, n, r)), Tr(e, t) || (ic = !0), e);
    }
    function Cs(e, t, n, r, i) {
        const a = E.p;
        E.p = a !== 0 && a < 8 ? a : 8;
        const o = T.T;
        const s = {};
        ((T.T = s), Fs(e, !1, t, n));
        try {
            const c = i();
            const l = T.S;
            (l !== null && l(s, c),
                typeof c === `object` && c && typeof c.then === `function`
                    ? Ps(e, t, ga(c, r), pu(e))
                    : Ps(e, t, r, pu(e)));
        } catch (n) {
            Ps(e, t, { then: function () {}, status: `rejected`, reason: n }, pu());
        } finally {
            ((E.p = a), o !== null && s.types !== null && (o.types = s.types), (T.T = o));
        }
    }
    function ws() {}
    function Ts(e, t, n, r) {
        if (e.tag !== 5) throw Error(i(476));
        const a = Es(e).queue;
        Cs(
            e,
            a,
            t,
            de,
            n === null
                ? ws
                : function () {
                      return (Ds(e), n(r));
                  }
        );
    }
    function Es(e) {
        let t = e.memoizedState;
        if (t !== null) return t;
        t = {
            memoizedState: de,
            baseState: de,
            baseQueue: null,
            queue: { pending: null, lanes: 0, dispatch: null, lastRenderedReducer: Io, lastRenderedState: de },
            next: null
        };
        const n = {};
        return (
            (t.next = {
                memoizedState: n,
                baseState: n,
                baseQueue: null,
                queue: { pending: null, lanes: 0, dispatch: null, lastRenderedReducer: Io, lastRenderedState: n },
                next: null
            }),
            (e.memoizedState = t),
            (e = e.alternate),
            e !== null && (e.memoizedState = t),
            t
        );
    }
    function Ds(e) {
        let t = Es(e);
        (t.next === null && (t = e.alternate.memoizedState), Ps(e, t.next.queue, {}, pu()));
    }
    function Os() {
        return ta(Qf);
    }
    function ks() {
        return jo().memoizedState;
    }
    function As() {
        return jo().memoizedState;
    }
    function js(e) {
        for (let t = e.return; t !== null;) {
            switch (t.tag) {
                case 24:
                case 3:
                    var n = pu();
                    e = Ua(n);
                    var r = Wa(t, e, n);
                    (r !== null && (hu(r, t, n), Ga(r, t, n)), (t = { cache: ca() }), (e.payload = t));
                    return;
            }
            t = t.return;
        }
    }
    function Ms(e, t, n) {
        const r = pu();
        ((n = {
            lane: r,
            revertLane: 0,
            gesture: null,
            action: n,
            hasEagerState: !1,
            eagerState: null,
            next: null
        }),
            Is(e) ? Ls(t, n) : ((n = ai(e, t, n, r)), n !== null && (hu(n, e, r), Rs(n, t, r))));
    }
    function Ns(e, t, n) {
        Ps(e, t, n, pu());
    }
    function Ps(e, t, n, r) {
        const i = {
            lane: r,
            revertLane: 0,
            gesture: null,
            action: n,
            hasEagerState: !1,
            eagerState: null,
            next: null
        };
        if (Is(e)) Ls(t, i);
        else {
            let a = e.alternate;
            if (e.lanes === 0 && (a === null || a.lanes === 0) && ((a = t.lastRenderedReducer), a !== null)) {
                try {
                    const o = t.lastRenderedState;
                    const s = a(o, n);
                    if (((i.hasEagerState = !0), (i.eagerState = s), Tr(s, o))) {
                        return (ii(e, t, i, 0), K === null && ri(), !1);
                    }
                } catch {}
            }
            if (((n = ai(e, t, i, r)), n !== null)) return (hu(n, e, r), Rs(n, t, r), !0);
        }
        return !1;
    }
    function Fs(e, t, n, r) {
        if (
            ((r = {
                lane: 2,
                revertLane: dd(),
                gesture: null,
                action: r,
                hasEagerState: !1,
                eagerState: null,
                next: null
            }),
            Is(e))
        ) {
            if (t) throw Error(i(479));
        } else ((t = ai(e, n, r, 2)), t !== null && hu(t, e, 2));
    }
    function Is(e) {
        const t = e.alternate;
        return e === B || (t !== null && t === B);
    }
    function Ls(e, t) {
        go = ho = !0;
        const n = e.pending;
        (n === null ? (t.next = t) : ((t.next = n.next), (n.next = t)), (e.pending = t));
    }
    function Rs(e, t, n) {
        if (n & 4194048) {
            let r = t.lanes;
            ((r &= e.pendingLanes), (n |= r), (t.lanes = n), ct(e, n));
        }
    }
    var zs = {
        readContext: ta,
        use: Po,
        useCallback: H,
        useContext: H,
        useEffect: H,
        useImperativeHandle: H,
        useLayoutEffect: H,
        useInsertionEffect: H,
        useMemo: H,
        useReducer: H,
        useRef: H,
        useState: H,
        useDebugValue: H,
        useDeferredValue: H,
        useTransition: H,
        useSyncExternalStore: H,
        useId: H,
        useHostTransitionStatus: H,
        useFormState: H,
        useActionState: H,
        useOptimistic: H,
        useMemoCache: H,
        useCacheRefresh: H
    };
    zs.useEffectEvent = H;
    var Bs = {
        readContext: ta,
        use: Po,
        useCallback: function (e, t) {
            return ((Ao().memoizedState = [e, t === void 0 ? null : t]), e);
        },
        useContext: ta,
        useEffect: us,
        useImperativeHandle: function (e, t, n) {
            ((n = n == null ? null : n.concat([e])), cs(4194308, 4, gs.bind(null, t, e), n));
        },
        useLayoutEffect: function (e, t) {
            return cs(4194308, 4, e, t);
        },
        useInsertionEffect: function (e, t) {
            cs(4, 2, e, t);
        },
        useMemo: function (e, t) {
            const n = Ao();
            t = t === void 0 ? null : t;
            const r = e();
            if (_o) {
                Ge(!0);
                try {
                    e();
                } finally {
                    Ge(!1);
                }
            }
            return ((n.memoizedState = [r, t]), r);
        },
        useReducer: function (e, t, n) {
            const r = Ao();
            if (n !== void 0) {
                var i = n(t);
                if (_o) {
                    Ge(!0);
                    try {
                        n(t);
                    } finally {
                        Ge(!1);
                    }
                }
            } else i = t;
            return (
                (r.memoizedState = r.baseState = i),
                (e = { pending: null, lanes: 0, dispatch: null, lastRenderedReducer: e, lastRenderedState: i }),
                (r.queue = e),
                (e = e.dispatch = Ms.bind(null, B, e)),
                [r.memoizedState, e]
            );
        },
        useRef: function (e) {
            const t = Ao();
            return ((e = { current: e }), (t.memoizedState = e));
        },
        useState: function (e) {
            e = Ko(e);
            const t = e.queue;
            const n = Ns.bind(null, B, t);
            return ((t.dispatch = n), [e.memoizedState, n]);
        },
        useDebugValue: vs,
        useDeferredValue: function (e, t) {
            return xs(Ao(), e, t);
        },
        useTransition: function () {
            let e = Ko(!1);
            return ((e = Cs.bind(null, B, e.queue, !0, !1)), (Ao().memoizedState = e), [!1, e]);
        },
        useSyncExternalStore: function (e, t, n) {
            const r = B;
            const a = Ao();
            if (L) {
                if (n === void 0) throw Error(i(407));
                n = n();
            } else {
                if (((n = t()), K === null)) throw Error(i(349));
                J & 127 || Vo(r, t, n);
            }
            a.memoizedState = n;
            const o = { value: n, getSnapshot: t };
            return (
                (a.queue = o),
                us(Uo.bind(null, r, o, e), [e]),
                (r.flags |= 2048),
                os(9, { destroy: void 0 }, Ho.bind(null, r, o, n, t), null),
                n
            );
        },
        useId: function () {
            const e = Ao();
            let t = K.identifierPrefix;
            if (L) {
                var n = Ai;
                const r = ki;
                ((n = (r & ~(1 << (32 - Ke(r) - 1))).toString(32) + n),
                    (t = `_` + t + `R_` + n),
                    (n = vo++),
                    n > 0 && (t += `H` + n.toString(32)),
                    (t += `_`));
            } else ((n = xo++), (t = `_` + t + `r_` + n.toString(32) + `_`));
            return (e.memoizedState = t);
        },
        useHostTransitionStatus: Os,
        useFormState: ts,
        useActionState: ts,
        useOptimistic: function (e) {
            let t = Ao();
            t.memoizedState = t.baseState = e;
            const n = {
                pending: null,
                lanes: 0,
                dispatch: null,
                lastRenderedReducer: null,
                lastRenderedState: null
            };
            return ((t.queue = n), (t = Fs.bind(null, B, !0, n)), (n.dispatch = t), [e, t]);
        },
        useMemoCache: Fo,
        useCacheRefresh: function () {
            return (Ao().memoizedState = js.bind(null, B));
        },
        useEffectEvent: function (e) {
            const t = Ao();
            const n = { impl: e };
            return (
                (t.memoizedState = n),
                function () {
                    if (G & 2) throw Error(i(440));
                    return n.impl.apply(void 0, arguments);
                }
            );
        }
    };
    var Vs = {
        readContext: ta,
        use: Po,
        useCallback: ys,
        useContext: ta,
        useEffect: ds,
        useImperativeHandle: _s,
        useInsertionEffect: ms,
        useLayoutEffect: hs,
        useMemo: bs,
        useReducer: Lo,
        useRef: ss,
        useState: function () {
            return Lo(Io);
        },
        useDebugValue: vs,
        useDeferredValue: function (e, t) {
            return Ss(jo(), V.memoizedState, e, t);
        },
        useTransition: function () {
            const e = Lo(Io)[0];
            const t = jo().memoizedState;
            return [typeof e === `boolean` ? e : No(e), t];
        },
        useSyncExternalStore: Bo,
        useId: ks,
        useHostTransitionStatus: Os,
        useFormState: ns,
        useActionState: ns,
        useOptimistic: function (e, t) {
            return qo(jo(), V, e, t);
        },
        useMemoCache: Fo,
        useCacheRefresh: As
    };
    Vs.useEffectEvent = ps;
    var Hs = {
        readContext: ta,
        use: Po,
        useCallback: ys,
        useContext: ta,
        useEffect: ds,
        useImperativeHandle: _s,
        useInsertionEffect: ms,
        useLayoutEffect: hs,
        useMemo: bs,
        useReducer: zo,
        useRef: ss,
        useState: function () {
            return zo(Io);
        },
        useDebugValue: vs,
        useDeferredValue: function (e, t) {
            const n = jo();
            return V === null ? xs(n, e, t) : Ss(n, V.memoizedState, e, t);
        },
        useTransition: function () {
            const e = zo(Io)[0];
            const t = jo().memoizedState;
            return [typeof e === `boolean` ? e : No(e), t];
        },
        useSyncExternalStore: Bo,
        useId: ks,
        useHostTransitionStatus: Os,
        useFormState: as,
        useActionState: as,
        useOptimistic: function (e, t) {
            const n = jo();
            return V === null ? ((n.baseState = e), [e, n.queue.dispatch]) : qo(n, V, e, t);
        },
        useMemoCache: Fo,
        useCacheRefresh: As
    };
    Hs.useEffectEvent = ps;
    function Us(e, t, n, r) {
        ((t = e.memoizedState),
            (n = n(r, t)),
            (n = n == null ? t : f({}, t, n)),
            (e.memoizedState = n),
            e.lanes === 0 && (e.updateQueue.baseState = n));
    }
    const Ws = {
        enqueueSetState: function (e, t, n) {
            e = e._reactInternals;
            const r = pu();
            const i = Ua(r);
            ((i.payload = t),
                n != null && (i.callback = n),
                (t = Wa(e, i, r)),
                t !== null && (hu(t, e, r), Ga(t, e, r)));
        },
        enqueueReplaceState: function (e, t, n) {
            e = e._reactInternals;
            const r = pu();
            const i = Ua(r);
            ((i.tag = 1),
                (i.payload = t),
                n != null && (i.callback = n),
                (t = Wa(e, i, r)),
                t !== null && (hu(t, e, r), Ga(t, e, r)));
        },
        enqueueForceUpdate: function (e, t) {
            e = e._reactInternals;
            const n = pu();
            const r = Ua(n);
            ((r.tag = 2), t != null && (r.callback = t), (t = Wa(e, r, n)), t !== null && (hu(t, e, n), Ga(t, e, n)));
        }
    };
    function Gs(e, t, n, r, i, a, o) {
        return (
            (e = e.stateNode),
            typeof e.shouldComponentUpdate === `function`
                ? e.shouldComponentUpdate(r, a, o)
                : t.prototype && t.prototype.isPureReactComponent
                  ? !Er(n, r) || !Er(i, a)
                  : !0
        );
    }
    function Ks(e, t, n, r) {
        ((e = t.state),
            typeof t.componentWillReceiveProps === `function` && t.componentWillReceiveProps(n, r),
            typeof t.UNSAFE_componentWillReceiveProps === `function` && t.UNSAFE_componentWillReceiveProps(n, r),
            t.state !== e && Ws.enqueueReplaceState(t, t.state, null));
    }
    function qs(e, t) {
        let n = t;
        if (`ref` in t) for (const r in ((n = {}), t)) r !== `ref` && (n[r] = t[r]);
        if ((e = e.defaultProps)) for (const i in (n === t && (n = f({}, n)), e)) n[i] === void 0 && (n[i] = e[i]);
        return n;
    }
    function Js(e) {
        $r(e);
    }
    function Ys(e) {
        console.error(e);
    }
    function Xs(e) {
        $r(e);
    }
    function Zs(e, t) {
        try {
            const n = e.onUncaughtError;
            n(t.value, { componentStack: t.stack });
        } catch (e) {
            setTimeout(function () {
                throw e;
            });
        }
    }
    function Qs(e, t, n) {
        try {
            const r = e.onCaughtError;
            r(n.value, { componentStack: n.stack, errorBoundary: t.tag === 1 ? t.stateNode : null });
        } catch (e) {
            setTimeout(function () {
                throw e;
            });
        }
    }
    function $s(e, t, n) {
        return (
            (n = Ua(n)),
            (n.tag = 3),
            (n.payload = { element: null }),
            (n.callback = function () {
                Zs(e, t);
            }),
            n
        );
    }
    function ec(e) {
        return ((e = Ua(e)), (e.tag = 3), e);
    }
    function tc(e, t, n, r) {
        const i = n.type.getDerivedStateFromError;
        if (typeof i === `function`) {
            const a = r.value;
            ((e.payload = function () {
                return i(a);
            }),
                (e.callback = function () {
                    Qs(t, n, r);
                }));
        }
        const o = n.stateNode;
        o !== null &&
            typeof o.componentDidCatch === `function` &&
            (e.callback = function () {
                (Qs(t, n, r), typeof i !== `function` && (iu === null ? (iu = new Set([this])) : iu.add(this)));
                const e = r.stack;
                this.componentDidCatch(r.value, { componentStack: e === null ? `` : e });
            });
    }
    function nc(e, t, n, r, a) {
        if (((n.flags |= 32768), typeof r === `object` && r && typeof r.then === `function`)) {
            if (((t = n.alternate), t !== null && Qi(t, n, a, !0), (n = ro.current), n !== null)) {
                switch (n.tag) {
                    case 31:
                    case 13:
                        return (
                            io === null ? Du() : n.alternate === null && Gl === 0 && (Gl = 3),
                            (n.flags &= -257),
                            (n.flags |= 65536),
                            (n.lanes = a),
                            r === Ta
                                ? (n.flags |= 16384)
                                : ((t = n.updateQueue),
                                  t === null ? (n.updateQueue = new Set([r])) : t.add(r),
                                  Gu(e, r, a)),
                            !1
                        );
                    case 22:
                        return (
                            (n.flags |= 65536),
                            r === Ta
                                ? (n.flags |= 16384)
                                : ((t = n.updateQueue),
                                  t === null
                                      ? ((t = {
                                            transitions: null,
                                            markerInstances: null,
                                            retryQueue: new Set([r])
                                        }),
                                        (n.updateQueue = t))
                                      : ((n = t.retryQueue), n === null ? (t.retryQueue = new Set([r])) : n.add(r)),
                                  Gu(e, r, a)),
                            !1
                        );
                }
                throw Error(i(435, n.tag));
            }
            return (Gu(e, r, a), Du(), !1);
        }
        if (L) {
            return (
                (t = ro.current),
                t === null
                    ? (r !== zi && ((t = Error(i(423), { cause: r })), Gi(xi(t, n))),
                      (e = e.current.alternate),
                      (e.flags |= 65536),
                      (a &= -a),
                      (e.lanes |= a),
                      (r = xi(r, n)),
                      (a = $s(e.stateNode, r, a)),
                      Ka(e, a),
                      Gl !== 4 && (Gl = 2))
                    : (!(t.flags & 65536) && (t.flags |= 256),
                      (t.flags |= 65536),
                      (t.lanes = a),
                      r !== zi && ((e = Error(i(422), { cause: r })), Gi(xi(e, n)))),
                !1
            );
        }
        let o = Error(i(520), { cause: r });
        if (((o = xi(o, n)), Zl === null ? (Zl = [o]) : Zl.push(o), Gl !== 4 && (Gl = 2), t === null)) return !0;
        ((r = xi(r, n)), (n = t));
        do {
            switch (n.tag) {
                case 3:
                    return (
                        (n.flags |= 65536),
                        (e = a & -a),
                        (n.lanes |= e),
                        (e = $s(n.stateNode, r, e)),
                        Ka(n, e),
                        !1
                    );
                case 1:
                    if (
                        ((t = n.type),
                        (o = n.stateNode),
                        !(n.flags & 128) &&
                            (typeof t.getDerivedStateFromError === `function` ||
                                (o !== null &&
                                    typeof o.componentDidCatch === `function` &&
                                    (iu === null || !iu.has(o)))))
                    ) {
                        return (
                            (n.flags |= 65536),
                            (a &= -a),
                            (n.lanes |= a),
                            (a = ec(a)),
                            tc(a, e, n, r),
                            Ka(n, a),
                            !1
                        );
                    }
            }
            n = n.return;
        } while (n !== null);
        return !1;
    }
    const rc = Error(i(461));
    var ic = !1;
    function ac(e, t, n, r) {
        t.child = e === null ? za(t, null, n, r) : Ra(t, e.child, n, r);
    }
    function oc(e, t, n, r, i) {
        n = n.render;
        const a = t.ref;
        if (`ref` in r) {
            var o = {};
            for (var s in r) s !== `ref` && (o[s] = r[s]);
        } else o = r;
        return (
            ea(t),
            (r = Co(e, t, n, o, a, i)),
            (s = Do()),
            e !== null && !ic ? (Oo(e, t, i), Ac(e, t, i)) : (L && s && Ni(t), (t.flags |= 1), ac(e, t, r, i), t.child)
        );
    }
    function sc(e, t, n, r, i) {
        if (e === null) {
            var a = n.type;
            return typeof a === `function` && !fi(a) && a.defaultProps === void 0 && n.compare === null
                ? ((t.tag = 15), (t.type = a), cc(e, t, a, r, i))
                : ((e = hi(n.type, null, r, t, t.mode, i)), (e.ref = t.ref), (e.return = t), (t.child = e));
        }
        if (((a = e.child), !jc(e, i))) {
            const o = a.memoizedProps;
            if (((n = n.compare), (n = n === null ? Er : n), n(o, r) && e.ref === t.ref)) return Ac(e, t, i);
        }
        return ((t.flags |= 1), (e = pi(a, r)), (e.ref = t.ref), (e.return = t), (t.child = e));
    }
    function cc(e, t, n, r, i) {
        if (e !== null) {
            const a = e.memoizedProps;
            if (Er(a, r) && e.ref === t.ref) {
                if (((ic = !1), (t.pendingProps = r = a), jc(e, i))) e.flags & 131072 && (ic = !0);
                else return ((t.lanes = e.lanes), Ac(e, t, i));
            }
        }
        return gc(e, t, n, r, i);
    }
    function lc(e, t, n, r) {
        let i = r.children;
        let a = e === null ? null : e.memoizedState;
        if (
            (e === null &&
                t.stateNode === null &&
                (t.stateNode = { _visibility: 1, _pendingMarkers: null, _retryCache: null, _transitions: null }),
            r.mode === `hidden`)
        ) {
            if (t.flags & 128) {
                if (((a = a === null ? n : a.baseLanes | n), e !== null)) {
                    for (r = t.child = e.child, i = 0; r !== null;) {
                        ((i = i | r.lanes | r.childLanes), (r = r.sibling));
                    }
                    r = i & ~a;
                } else ((r = 0), (t.child = null));
                return dc(e, t, a, n, r);
            }
            if (n & 536870912) {
                ((t.memoizedState = { baseLanes: 0, cachePool: null }),
                    e !== null && ba(t, a === null ? null : a.cachePool),
                    a === null ? to() : eo(t, a),
                    so(t));
            } else return ((r = t.lanes = 536870912), dc(e, t, a === null ? n : a.baseLanes | n, n, r));
        } else {
            a === null
                ? (e !== null && ba(t, null), to(), co(t))
                : (ba(t, a.cachePool), eo(t, a), co(t), (t.memoizedState = null));
        }
        return (ac(e, t, i, n), t.child);
    }
    function uc(e, t) {
        return (
            (e !== null && e.tag === 22) ||
                t.stateNode !== null ||
                (t.stateNode = { _visibility: 1, _pendingMarkers: null, _retryCache: null, _transitions: null }),
            t.sibling
        );
    }
    function dc(e, t, n, r, i) {
        let a = ya();
        return (
            (a = a === null ? null : { parent: sa._currentValue, pool: a }),
            (t.memoizedState = { baseLanes: n, cachePool: a }),
            e !== null && ba(t, null),
            to(),
            so(t),
            e !== null && Qi(e, t, r, !0),
            (t.childLanes = i),
            null
        );
    }
    function fc(e, t) {
        return (
            (t = Tc({ mode: t.mode, children: t.children }, e.mode)),
            (t.ref = e.ref),
            (e.child = t),
            (t.return = e),
            t
        );
    }
    function pc(e, t, n) {
        return (
            Ra(t, e.child, null, n),
            (e = fc(t, t.pendingProps)),
            (e.flags |= 2),
            lo(t),
            (t.memoizedState = null),
            e
        );
    }
    function mc(e, t, n) {
        let r = t.pendingProps;
        let a = (t.flags & 128) != 0;
        if (((t.flags &= -129), e === null)) {
            if (L) {
                if (r.mode === `hidden`) return ((e = fc(t, r)), (t.lanes = 536870912), uc(null, e));
                if (
                    (oo(t),
                    (e = I)
                        ? ((e = rf(e, Ri)),
                          (e = e !== null && e.data === `&` ? e : null),
                          e !== null &&
                              ((t.memoizedState = {
                                  dehydrated: e,
                                  treeContext: Oi === null ? null : { id: ki, overflow: Ai },
                                  retryLane: 536870912,
                                  hydrationErrors: null
                              }),
                              (n = vi(e)),
                              (n.return = t),
                              (t.child = n),
                              (Ii = t),
                              (I = null)))
                        : (e = null),
                    e === null)
                ) {
                    throw R(t);
                }
                return ((t.lanes = 536870912), null);
            }
            return fc(t, r);
        }
        const o = e.memoizedState;
        if (o !== null) {
            let s = o.dehydrated;
            if ((oo(t), a)) {
                if (t.flags & 256) ((t.flags &= -257), (t = pc(e, t, n)));
                else if (t.memoizedState !== null) ((t.child = e.child), (t.flags |= 128), (t = null));
                else throw Error(i(558));
            } else if ((ic || Qi(e, t, n, !1), (a = (n & e.childLanes) !== 0), ic || a)) {
                if (((r = K), r !== null && ((s = lt(r, n)), s !== 0 && s !== o.retryLane))) {
                    throw ((o.retryLane = s), oi(e, s), hu(r, e, s), rc);
                }
                (Du(), (t = pc(e, t, n)));
            } else {
                ((e = o.treeContext),
                    (I = cf(s.nextSibling)),
                    (Ii = t),
                    (L = !0),
                    (Li = null),
                    (Ri = !1),
                    e !== null && Fi(t, e),
                    (t = fc(t, r)),
                    (t.flags |= 4096));
            }
            return t;
        }
        return (
            (e = pi(e.child, { mode: r.mode, children: r.children })),
            (e.ref = t.ref),
            (t.child = e),
            (e.return = t),
            e
        );
    }
    function hc(e, t) {
        const n = t.ref;
        if (n === null) e !== null && e.ref !== null && (t.flags |= 4194816);
        else {
            if (typeof n !== `function` && typeof n !== `object`) throw Error(i(284));
            (e === null || e.ref !== n) && (t.flags |= 4194816);
        }
    }
    function gc(e, t, n, r, i) {
        return (
            ea(t),
            (n = Co(e, t, n, r, void 0, i)),
            (r = Do()),
            e !== null && !ic ? (Oo(e, t, i), Ac(e, t, i)) : (L && r && Ni(t), (t.flags |= 1), ac(e, t, n, i), t.child)
        );
    }
    function _c(e, t, n, r, i, a) {
        return (
            ea(t),
            (t.updateQueue = null),
            (n = To(t, r, n, i)),
            wo(e),
            (r = Do()),
            e !== null && !ic ? (Oo(e, t, a), Ac(e, t, a)) : (L && r && Ni(t), (t.flags |= 1), ac(e, t, n, a), t.child)
        );
    }
    function vc(e, t, n, r, i) {
        if ((ea(t), t.stateNode === null)) {
            var a = li;
            var o = n.contextType;
            (typeof o === `object` && o && (a = ta(o)),
                (a = new n(r, a)),
                (t.memoizedState = a.state !== null && a.state !== void 0 ? a.state : null),
                (a.updater = Ws),
                (t.stateNode = a),
                (a._reactInternals = t),
                (a = t.stateNode),
                (a.props = r),
                (a.state = t.memoizedState),
                (a.refs = {}),
                Va(t),
                (o = n.contextType),
                (a.context = typeof o === `object` && o ? ta(o) : li),
                (a.state = t.memoizedState),
                (o = n.getDerivedStateFromProps),
                typeof o === `function` && (Us(t, n, o, r), (a.state = t.memoizedState)),
                typeof n.getDerivedStateFromProps === `function` ||
                    typeof a.getSnapshotBeforeUpdate === `function` ||
                    (typeof a.UNSAFE_componentWillMount !== `function` && typeof a.componentWillMount !== `function`) ||
                    ((o = a.state),
                    typeof a.componentWillMount === `function` && a.componentWillMount(),
                    typeof a.UNSAFE_componentWillMount === `function` && a.UNSAFE_componentWillMount(),
                    o !== a.state && Ws.enqueueReplaceState(a, a.state, null),
                    Ya(t, r, a, i),
                    Ja(),
                    (a.state = t.memoizedState)),
                typeof a.componentDidMount === `function` && (t.flags |= 4194308),
                (r = !0));
        } else if (e === null) {
            a = t.stateNode;
            var s = t.memoizedProps;
            var c = qs(n, s);
            a.props = c;
            var l = a.context;
            var u = n.contextType;
            ((o = li), typeof u === `object` && u && (o = ta(u)));
            var d = n.getDerivedStateFromProps;
            ((u = typeof d === `function` || typeof a.getSnapshotBeforeUpdate === `function`),
                (s = t.pendingProps !== s),
                u ||
                    (typeof a.UNSAFE_componentWillReceiveProps !== `function` &&
                        typeof a.componentWillReceiveProps !== `function`) ||
                    ((s || l !== o) && Ks(t, a, r, o)),
                (Ba = !1));
            var f = t.memoizedState;
            ((a.state = f),
                Ya(t, r, a, i),
                Ja(),
                (l = t.memoizedState),
                s || f !== l || Ba
                    ? (typeof d === `function` && (Us(t, n, d, r), (l = t.memoizedState)),
                      (c = Ba || Gs(t, n, c, r, f, l, o))
                          ? (u ||
                                (typeof a.UNSAFE_componentWillMount !== `function` &&
                                    typeof a.componentWillMount !== `function`) ||
                                (typeof a.componentWillMount === `function` && a.componentWillMount(),
                                typeof a.UNSAFE_componentWillMount === `function` && a.UNSAFE_componentWillMount()),
                            typeof a.componentDidMount === `function` && (t.flags |= 4194308))
                          : (typeof a.componentDidMount === `function` && (t.flags |= 4194308),
                            (t.memoizedProps = r),
                            (t.memoizedState = l)),
                      (a.props = r),
                      (a.state = l),
                      (a.context = o),
                      (r = c))
                    : (typeof a.componentDidMount === `function` && (t.flags |= 4194308), (r = !1)));
        } else {
            ((a = t.stateNode),
                Ha(e, t),
                (o = t.memoizedProps),
                (u = qs(n, o)),
                (a.props = u),
                (d = t.pendingProps),
                (f = a.context),
                (l = n.contextType),
                (c = li),
                typeof l === `object` && l && (c = ta(l)),
                (s = n.getDerivedStateFromProps),
                (l = typeof s === `function` || typeof a.getSnapshotBeforeUpdate === `function`) ||
                    (typeof a.UNSAFE_componentWillReceiveProps !== `function` &&
                        typeof a.componentWillReceiveProps !== `function`) ||
                    ((o !== d || f !== c) && Ks(t, a, r, c)),
                (Ba = !1),
                (f = t.memoizedState),
                (a.state = f),
                Ya(t, r, a, i),
                Ja());
            let p = t.memoizedState;
            o !== d || f !== p || Ba || (e !== null && e.dependencies !== null && $i(e.dependencies))
                ? (typeof s === `function` && (Us(t, n, s, r), (p = t.memoizedState)),
                  (u = Ba || Gs(t, n, u, r, f, p, c) || (e !== null && e.dependencies !== null && $i(e.dependencies)))
                      ? (l ||
                            (typeof a.UNSAFE_componentWillUpdate !== `function` &&
                                typeof a.componentWillUpdate !== `function`) ||
                            (typeof a.componentWillUpdate === `function` && a.componentWillUpdate(r, p, c),
                            typeof a.UNSAFE_componentWillUpdate === `function` &&
                                a.UNSAFE_componentWillUpdate(r, p, c)),
                        typeof a.componentDidUpdate === `function` && (t.flags |= 4),
                        typeof a.getSnapshotBeforeUpdate === `function` && (t.flags |= 1024))
                      : (typeof a.componentDidUpdate !== `function` ||
                            (o === e.memoizedProps && f === e.memoizedState) ||
                            (t.flags |= 4),
                        typeof a.getSnapshotBeforeUpdate !== `function` ||
                            (o === e.memoizedProps && f === e.memoizedState) ||
                            (t.flags |= 1024),
                        (t.memoizedProps = r),
                        (t.memoizedState = p)),
                  (a.props = r),
                  (a.state = p),
                  (a.context = c),
                  (r = u))
                : (typeof a.componentDidUpdate !== `function` ||
                      (o === e.memoizedProps && f === e.memoizedState) ||
                      (t.flags |= 4),
                  typeof a.getSnapshotBeforeUpdate !== `function` ||
                      (o === e.memoizedProps && f === e.memoizedState) ||
                      (t.flags |= 1024),
                  (r = !1));
        }
        return (
            (a = r),
            hc(e, t),
            (r = (t.flags & 128) != 0),
            a || r
                ? ((a = t.stateNode),
                  (n = r && typeof n.getDerivedStateFromError !== `function` ? null : a.render()),
                  (t.flags |= 1),
                  e !== null && r
                      ? ((t.child = Ra(t, e.child, null, i)), (t.child = Ra(t, null, n, i)))
                      : ac(e, t, n, i),
                  (t.memoizedState = a.state),
                  (e = t.child))
                : (e = Ac(e, t, i)),
            e
        );
    }
    function yc(e, t, n, r) {
        return (Ui(), (t.flags |= 256), ac(e, t, n, r), t.child);
    }
    const bc = { dehydrated: null, treeContext: null, retryLane: 0, hydrationErrors: null };
    function xc(e) {
        return { baseLanes: e, cachePool: xa() };
    }
    function Sc(e, t, n) {
        return ((e = e === null ? 0 : e.childLanes & ~n), t && (e |= Yl), e);
    }
    function Cc(e, t, n) {
        let r = t.pendingProps;
        let a = !1;
        const o = (t.flags & 128) != 0;
        let s;
        if (
            ((s = o) || (s = e !== null && e.memoizedState === null ? !1 : (uo.current & 2) != 0),
            s && ((a = !0), (t.flags &= -129)),
            (s = (t.flags & 32) != 0),
            (t.flags &= -33),
            e === null)
        ) {
            if (L) {
                if (
                    (a ? ao(t) : co(t),
                    (e = I)
                        ? ((e = rf(e, Ri)),
                          (e = e !== null && e.data !== `&` ? e : null),
                          e !== null &&
                              ((t.memoizedState = {
                                  dehydrated: e,
                                  treeContext: Oi === null ? null : { id: ki, overflow: Ai },
                                  retryLane: 536870912,
                                  hydrationErrors: null
                              }),
                              (n = vi(e)),
                              (n.return = t),
                              (t.child = n),
                              (Ii = t),
                              (I = null)))
                        : (e = null),
                    e === null)
                ) {
                    throw R(t);
                }
                return (of(e) ? (t.lanes = 32) : (t.lanes = 536870912), null);
            }
            var c = r.children;
            return (
                (r = r.fallback),
                a
                    ? (co(t),
                      (a = t.mode),
                      (c = Tc({ mode: `hidden`, children: c }, a)),
                      (r = gi(r, a, n, null)),
                      (c.return = t),
                      (r.return = t),
                      (c.sibling = r),
                      (t.child = c),
                      (r = t.child),
                      (r.memoizedState = xc(n)),
                      (r.childLanes = Sc(e, s, n)),
                      (t.memoizedState = bc),
                      uc(null, r))
                    : (ao(t), wc(t, c))
            );
        }
        let l = e.memoizedState;
        if (l !== null && ((c = l.dehydrated), c !== null)) {
            if (o) {
                t.flags & 256
                    ? (ao(t), (t.flags &= -257), (t = Ec(e, t, n)))
                    : t.memoizedState === null
                      ? (co(t),
                        (c = r.fallback),
                        (a = t.mode),
                        (r = Tc({ mode: `visible`, children: r.children }, a)),
                        (c = gi(c, a, n, null)),
                        (c.flags |= 2),
                        (r.return = t),
                        (c.return = t),
                        (r.sibling = c),
                        (t.child = r),
                        Ra(t, e.child, null, n),
                        (r = t.child),
                        (r.memoizedState = xc(n)),
                        (r.childLanes = Sc(e, s, n)),
                        (t.memoizedState = bc),
                        (t = uc(null, r)))
                      : (co(t), (t.child = e.child), (t.flags |= 128), (t = null));
            } else if ((ao(t), of(c))) {
                if (((s = c.nextSibling && c.nextSibling.dataset), s)) var u = s.dgst;
                ((s = u),
                    (r = Error(i(419))),
                    (r.stack = ``),
                    (r.digest = s),
                    Gi({ value: r, source: null, stack: null }),
                    (t = Ec(e, t, n)));
            } else if ((ic || Qi(e, t, n, !1), (s = (n & e.childLanes) !== 0), ic || s)) {
                if (((s = K), s !== null && ((r = lt(s, n)), r !== 0 && r !== l.retryLane))) {
                    throw ((l.retryLane = r), oi(e, r), hu(s, e, r), rc);
                }
                (af(c) || Du(), (t = Ec(e, t, n)));
            } else {
                af(c)
                    ? ((t.flags |= 192), (t.child = e.child), (t = null))
                    : ((e = l.treeContext),
                      (I = cf(c.nextSibling)),
                      (Ii = t),
                      (L = !0),
                      (Li = null),
                      (Ri = !1),
                      e !== null && Fi(t, e),
                      (t = wc(t, r.children)),
                      (t.flags |= 4096));
            }
            return t;
        }
        return a
            ? (co(t),
              (c = r.fallback),
              (a = t.mode),
              (l = e.child),
              (u = l.sibling),
              (r = pi(l, { mode: `hidden`, children: r.children })),
              (r.subtreeFlags = l.subtreeFlags & 65011712),
              u === null ? ((c = gi(c, a, n, null)), (c.flags |= 2)) : (c = pi(u, c)),
              (c.return = t),
              (r.return = t),
              (r.sibling = c),
              (t.child = r),
              uc(null, r),
              (r = t.child),
              (c = e.child.memoizedState),
              c === null
                  ? (c = xc(n))
                  : ((a = c.cachePool),
                    a === null
                        ? (a = xa())
                        : ((l = sa._currentValue), (a = a.parent === l ? a : { parent: l, pool: l })),
                    (c = { baseLanes: c.baseLanes | n, cachePool: a })),
              (r.memoizedState = c),
              (r.childLanes = Sc(e, s, n)),
              (t.memoizedState = bc),
              uc(e.child, r))
            : (ao(t),
              (n = e.child),
              (e = n.sibling),
              (n = pi(n, { mode: `visible`, children: r.children })),
              (n.return = t),
              (n.sibling = null),
              e !== null && ((s = t.deletions), s === null ? ((t.deletions = [e]), (t.flags |= 16)) : s.push(e)),
              (t.child = n),
              (t.memoizedState = null),
              n);
    }
    function wc(e, t) {
        return ((t = Tc({ mode: `visible`, children: t }, e.mode)), (t.return = e), (e.child = t));
    }
    function Tc(e, t) {
        return ((e = di(22, e, null, t)), (e.lanes = 0), e);
    }
    function Ec(e, t, n) {
        return (
            Ra(t, e.child, null, n),
            (e = wc(t, t.pendingProps.children)),
            (e.flags |= 2),
            (t.memoizedState = null),
            e
        );
    }
    function Dc(e, t, n) {
        e.lanes |= t;
        const r = e.alternate;
        (r !== null && (r.lanes |= t), Xi(e.return, t, n));
    }
    function Oc(e, t, n, r, i, a) {
        const o = e.memoizedState;
        o === null
            ? (e.memoizedState = {
                  isBackwards: t,
                  rendering: null,
                  renderingStartTime: 0,
                  last: r,
                  tail: n,
                  tailMode: i,
                  treeForkCount: a
              })
            : ((o.isBackwards = t),
              (o.rendering = null),
              (o.renderingStartTime = 0),
              (o.last = r),
              (o.tail = n),
              (o.tailMode = i),
              (o.treeForkCount = a));
    }
    function kc(e, t, n) {
        let r = t.pendingProps;
        let i = r.revealOrder;
        const a = r.tail;
        r = r.children;
        let o = uo.current;
        const s = (o & 2) != 0;
        if (
            (s ? ((o = (o & 1) | 2), (t.flags |= 128)) : (o &= 1),
            O(uo, o),
            ac(e, t, r, n),
            (r = L ? Ti : 0),
            !s && e !== null && e.flags & 128)
        ) {
            a: for (e = t.child; e !== null;) {
                if (e.tag === 13) e.memoizedState !== null && Dc(e, n, t);
                else if (e.tag === 19) Dc(e, n, t);
                else if (e.child !== null) {
                    ((e.child.return = e), (e = e.child));
                    continue;
                }
                if (e === t) break a;
                for (; e.sibling === null;) {
                    if (e.return === null || e.return === t) break a;
                    e = e.return;
                }
                ((e.sibling.return = e.return), (e = e.sibling));
            }
        }
        switch (i) {
            case `forwards`:
                for (n = t.child, i = null; n !== null;) {
                    ((e = n.alternate), e !== null && fo(e) === null && (i = n), (n = n.sibling));
                }
                ((n = i),
                    n === null ? ((i = t.child), (t.child = null)) : ((i = n.sibling), (n.sibling = null)),
                    Oc(t, !1, i, n, a, r));
                break;
            case `backwards`:
            case `unstable_legacy-backwards`:
                for (n = null, i = t.child, t.child = null; i !== null;) {
                    if (((e = i.alternate), e !== null && fo(e) === null)) {
                        t.child = i;
                        break;
                    }
                    ((e = i.sibling), (i.sibling = n), (n = i), (i = e));
                }
                Oc(t, !0, n, null, a, r);
                break;
            case `together`:
                Oc(t, !1, null, null, void 0, r);
                break;
            default:
                t.memoizedState = null;
        }
        return t.child;
    }
    function Ac(e, t, n) {
        if ((e !== null && (t.dependencies = e.dependencies), (Kl |= t.lanes), (n & t.childLanes) === 0)) {
            if (e !== null) {
                if ((Qi(e, t, n, !1), (n & t.childLanes) === 0)) return null;
            } else return null;
        }
        if (e !== null && t.child !== e.child) throw Error(i(153));
        if (t.child !== null) {
            for (e = t.child, n = pi(e, e.pendingProps), t.child = n, n.return = t; e.sibling !== null;) {
                ((e = e.sibling), (n = n.sibling = pi(e, e.pendingProps)), (n.return = t));
            }
            n.sibling = null;
        }
        return t.child;
    }
    function jc(e, t) {
        return (e.lanes & t) === 0 ? ((e = e.dependencies), !!(e !== null && $i(e))) : !0;
    }
    function Mc(e, t, n) {
        switch (t.tag) {
            case 3:
                (ye(t, t.stateNode.containerInfo), z(t, sa, e.memoizedState.cache), Ui());
                break;
            case 27:
            case 5:
                xe(t);
                break;
            case 4:
                ye(t, t.stateNode.containerInfo);
                break;
            case 10:
                z(t, t.type, t.memoizedProps.value);
                break;
            case 31:
                if (t.memoizedState !== null) return ((t.flags |= 128), oo(t), null);
                break;
            case 13:
                var r = t.memoizedState;
                if (r !== null) {
                    return r.dehydrated === null
                        ? (n & t.child.childLanes) === 0
                            ? (ao(t), (e = Ac(e, t, n)), e === null ? null : e.sibling)
                            : Cc(e, t, n)
                        : (ao(t), (t.flags |= 128), null);
                }
                ao(t);
                break;
            case 19:
                var i = (e.flags & 128) != 0;
                if (((r = (n & t.childLanes) !== 0), (r ||= (Qi(e, t, n, !1), (n & t.childLanes) !== 0)), i)) {
                    if (r) return kc(e, t, n);
                    t.flags |= 128;
                }
                if (
                    ((i = t.memoizedState),
                    i !== null && ((i.rendering = null), (i.tail = null), (i.lastEffect = null)),
                    O(uo, uo.current),
                    r)
                ) {
                    break;
                }
                return null;
            case 22:
                return ((t.lanes = 0), lc(e, t, n, t.pendingProps));
            case 24:
                z(t, sa, e.memoizedState.cache);
        }
        return Ac(e, t, n);
    }
    function Nc(e, t, n) {
        if (e !== null) {
            if (e.memoizedProps !== t.pendingProps) ic = !0;
            else {
                if (!jc(e, n) && !(t.flags & 128)) return ((ic = !1), Mc(e, t, n));
                ic = !!(e.flags & 131072);
            }
        } else ((ic = !1), L && t.flags & 1048576 && Mi(t, Ti, t.index));
        switch (((t.lanes = 0), t.tag)) {
            case 16:
                a: {
                    var r = t.pendingProps;
                    if (((e = Oa(t.elementType)), (t.type = e), typeof e === `function`)) {
                        fi(e)
                            ? ((r = qs(e, r)), (t.tag = 1), (t = vc(null, t, e, r, n)))
                            : ((t.tag = 0), (t = gc(null, t, e, r, n)));
                    } else {
                        if (e != null) {
                            var a = e.$$typeof;
                            if (a === w) {
                                ((t.tag = 11), (t = oc(null, t, e, r, n)));
                                break a;
                            } else if (a === ne) {
                                ((t.tag = 14), (t = sc(null, t, e, r, n)));
                                break a;
                            }
                        }
                        throw ((t = le(e) || e), Error(i(306, t, ``)));
                    }
                }
                return t;
            case 0:
                return gc(e, t, t.type, t.pendingProps, n);
            case 1:
                return ((r = t.type), (a = qs(r, t.pendingProps)), vc(e, t, r, a, n));
            case 3:
                a: {
                    if ((ye(t, t.stateNode.containerInfo), e === null)) throw Error(i(387));
                    r = t.pendingProps;
                    var o = t.memoizedState;
                    ((a = o.element), Ha(e, t), Ya(t, r, null, n));
                    var s = t.memoizedState;
                    if (
                        ((r = s.cache),
                        z(t, sa, r),
                        r !== o.cache && Zi(t, [sa], n, !0),
                        Ja(),
                        (r = s.element),
                        o.isDehydrated)
                    ) {
                        if (
                            ((o = { element: r, isDehydrated: !1, cache: s.cache }),
                            (t.updateQueue.baseState = o),
                            (t.memoizedState = o),
                            t.flags & 256)
                        ) {
                            t = yc(e, t, r, n);
                            break a;
                        } else if (r !== a) {
                            ((a = xi(Error(i(424)), t)), Gi(a), (t = yc(e, t, r, n)));
                            break a;
                        } else {
                            switch (((e = t.stateNode.containerInfo), e.nodeType)) {
                                case 9:
                                    e = e.body;
                                    break;
                                default:
                                    e = e.nodeName === `HTML` ? e.ownerDocument.body : e;
                            }
                            for (
                                I = cf(e.firstChild),
                                    Ii = t,
                                    L = !0,
                                    Li = null,
                                    Ri = !0,
                                    n = za(t, null, r, n),
                                    t.child = n;
                                n;
                            ) {
                                ((n.flags = (n.flags & -3) | 4096), (n = n.sibling));
                            }
                        }
                    } else {
                        if ((Ui(), r === a)) {
                            t = Ac(e, t, n);
                            break a;
                        }
                        ac(e, t, r, n);
                    }
                    t = t.child;
                }
                return t;
            case 26:
                return (
                    hc(e, t),
                    e === null
                        ? (n = kf(t.type, null, t.pendingProps, null))
                            ? (t.memoizedState = n)
                            : L ||
                              ((n = t.type),
                              (e = t.pendingProps),
                              (r = Bd(_e.current).createElement(n)),
                              (r[A] = t),
                              (r[j] = e),
                              Pd(r, n, e),
                              wt(r),
                              (t.stateNode = r))
                        : (t.memoizedState = kf(t.type, e.memoizedProps, t.pendingProps, e.memoizedState)),
                    null
                );
            case 27:
                return (
                    xe(t),
                    e === null &&
                        L &&
                        ((r = t.stateNode = ff(t.type, t.pendingProps, _e.current)),
                        (Ii = t),
                        (Ri = !0),
                        (a = I),
                        Zd(t.type) ? ((lf = a), (I = cf(r.firstChild))) : (I = a)),
                    ac(e, t, t.pendingProps.children, n),
                    hc(e, t),
                    e === null && (t.flags |= 4194304),
                    t.child
                );
            case 5:
                return (
                    e === null &&
                        L &&
                        ((a = r = I) &&
                            ((r = tf(r, t.type, t.pendingProps, Ri)),
                            r === null
                                ? (a = !1)
                                : ((t.stateNode = r), (Ii = t), (I = cf(r.firstChild)), (Ri = !1), (a = !0))),
                        a || R(t)),
                    xe(t),
                    (a = t.type),
                    (o = t.pendingProps),
                    (s = e === null ? null : e.memoizedProps),
                    (r = o.children),
                    Ud(a, o) ? (r = null) : s !== null && Ud(a, s) && (t.flags |= 32),
                    t.memoizedState !== null && ((a = Co(e, t, Eo, null, null, n)), (Qf._currentValue = a)),
                    hc(e, t),
                    ac(e, t, r, n),
                    t.child
                );
            case 6:
                return (
                    e === null &&
                        L &&
                        ((e = n = I) &&
                            ((n = nf(n, t.pendingProps, Ri)),
                            n === null ? (e = !1) : ((t.stateNode = n), (Ii = t), (I = null), (e = !0))),
                        e || R(t)),
                    null
                );
            case 13:
                return Cc(e, t, n);
            case 4:
                return (
                    ye(t, t.stateNode.containerInfo),
                    (r = t.pendingProps),
                    e === null ? (t.child = Ra(t, null, r, n)) : ac(e, t, r, n),
                    t.child
                );
            case 11:
                return oc(e, t, t.type, t.pendingProps, n);
            case 7:
                return (ac(e, t, t.pendingProps, n), t.child);
            case 8:
                return (ac(e, t, t.pendingProps.children, n), t.child);
            case 12:
                return (ac(e, t, t.pendingProps.children, n), t.child);
            case 10:
                return ((r = t.pendingProps), z(t, t.type, r.value), ac(e, t, r.children, n), t.child);
            case 9:
                return (
                    (a = t.type._context),
                    (r = t.pendingProps.children),
                    ea(t),
                    (a = ta(a)),
                    (r = r(a)),
                    (t.flags |= 1),
                    ac(e, t, r, n),
                    t.child
                );
            case 14:
                return sc(e, t, t.type, t.pendingProps, n);
            case 15:
                return cc(e, t, t.type, t.pendingProps, n);
            case 19:
                return kc(e, t, n);
            case 31:
                return mc(e, t, n);
            case 22:
                return lc(e, t, n, t.pendingProps);
            case 24:
                return (
                    ea(t),
                    (r = ta(sa)),
                    e === null
                        ? ((a = ya()),
                          a === null &&
                              ((a = K),
                              (o = ca()),
                              (a.pooledCache = o),
                              o.refCount++,
                              o !== null && (a.pooledCacheLanes |= n),
                              (a = o)),
                          (t.memoizedState = { parent: r, cache: a }),
                          Va(t),
                          z(t, sa, a))
                        : ((e.lanes & n) !== 0 && (Ha(e, t), Ya(t, null, null, n), Ja()),
                          (a = e.memoizedState),
                          (o = t.memoizedState),
                          a.parent === r
                              ? ((r = o.cache), z(t, sa, r), r !== a.cache && Zi(t, [sa], n, !0))
                              : ((a = { parent: r, cache: r }),
                                (t.memoizedState = a),
                                t.lanes === 0 && (t.memoizedState = t.updateQueue.baseState = a),
                                z(t, sa, r))),
                    ac(e, t, t.pendingProps.children, n),
                    t.child
                );
            case 29:
                throw t.pendingProps;
        }
        throw Error(i(156, t.tag));
    }
    function Pc(e) {
        e.flags |= 4;
    }
    function Fc(e, t, n, r, i) {
        if (((t = (e.mode & 32) != 0) && (t = !1), t)) {
            if (((e.flags |= 16777216), (i & 335544128) === i)) {
                if (e.stateNode.complete) e.flags |= 8192;
                else if (wu()) e.flags |= 8192;
                else throw ((ka = Ta), Ca);
            }
        } else e.flags &= -16777217;
    }
    function Ic(e, t) {
        if (t.type !== `stylesheet` || t.state.loading & 4) e.flags &= -16777217;
        else if (((e.flags |= 16777216), !Wf(t))) {
            if (wu()) e.flags |= 8192;
            else throw ((ka = Ta), Ca);
        }
    }
    function Lc(e, t) {
        (t !== null && (e.flags |= 4),
            e.flags & 16384 && ((t = e.tag === 22 ? 536870912 : rt()), (e.lanes |= t), (Xl |= t)));
    }
    function Rc(e, t) {
        if (!L) {
            switch (e.tailMode) {
                case `hidden`:
                    t = e.tail;
                    for (var n = null; t !== null;) (t.alternate !== null && (n = t), (t = t.sibling));
                    n === null ? (e.tail = null) : (n.sibling = null);
                    break;
                case `collapsed`:
                    n = e.tail;
                    for (var r = null; n !== null;) (n.alternate !== null && (r = n), (n = n.sibling));
                    r === null
                        ? t || e.tail === null
                            ? (e.tail = null)
                            : (e.tail.sibling = null)
                        : (r.sibling = null);
            }
        }
    }
    function U(e) {
        const t = e.alternate !== null && e.alternate.child === e.child;
        let n = 0;
        let r = 0;
        if (t) {
            for (var i = e.child; i !== null;) {
                ((n |= i.lanes | i.childLanes),
                    (r |= i.subtreeFlags & 65011712),
                    (r |= i.flags & 65011712),
                    (i.return = e),
                    (i = i.sibling));
            }
        } else {
            for (i = e.child; i !== null;) {
                ((n |= i.lanes | i.childLanes), (r |= i.subtreeFlags), (r |= i.flags), (i.return = e), (i = i.sibling));
            }
        }
        return ((e.subtreeFlags |= r), (e.childLanes = n), t);
    }
    function zc(e, t, n) {
        let r = t.pendingProps;
        switch ((Pi(t), t.tag)) {
            case 16:
            case 15:
            case 0:
            case 11:
            case 7:
            case 8:
            case 12:
            case 9:
            case 14:
                return (U(t), null);
            case 1:
                return (U(t), null);
            case 3:
                return (
                    (n = t.stateNode),
                    (r = null),
                    e !== null && (r = e.memoizedState.cache),
                    t.memoizedState.cache !== r && (t.flags |= 2048),
                    Yi(sa),
                    be(),
                    n.pendingContext && ((n.context = n.pendingContext), (n.pendingContext = null)),
                    (e === null || e.child === null) &&
                        (Hi(t)
                            ? Pc(t)
                            : e === null ||
                              (e.memoizedState.isDehydrated && !(t.flags & 256)) ||
                              ((t.flags |= 1024), Wi())),
                    U(t),
                    null
                );
            case 26:
                var a = t.type;
                var o = t.memoizedState;
                return (
                    e === null
                        ? (Pc(t), o === null ? (U(t), Fc(t, a, null, r, n)) : (U(t), Ic(t, o)))
                        : o
                          ? o === e.memoizedState
                              ? (U(t), (t.flags &= -16777217))
                              : (Pc(t), U(t), Ic(t, o))
                          : ((e = e.memoizedProps), e !== r && Pc(t), U(t), Fc(t, a, e, r, n)),
                    null
                );
            case 27:
                if ((Se(t), (n = _e.current), (a = t.type), e !== null && t.stateNode != null)) {
                    e.memoizedProps !== r && Pc(t);
                } else {
                    if (!r) {
                        if (t.stateNode === null) throw Error(i(166));
                        return (U(t), null);
                    }
                    ((e = he.current), Hi(t) ? Bi(t, e) : ((e = ff(a, r, n)), (t.stateNode = e), Pc(t)));
                }
                return (U(t), null);
            case 5:
                if ((Se(t), (a = t.type), e !== null && t.stateNode != null)) e.memoizedProps !== r && Pc(t);
                else {
                    if (!r) {
                        if (t.stateNode === null) throw Error(i(166));
                        return (U(t), null);
                    }
                    if (((o = he.current), Hi(t))) Bi(t, o);
                    else {
                        let s = Bd(_e.current);
                        switch (o) {
                            case 1:
                                o = s.createElementNS(`http://www.w3.org/2000/svg`, a);
                                break;
                            case 2:
                                o = s.createElementNS(`http://www.w3.org/1998/Math/MathML`, a);
                                break;
                            default:
                                switch (a) {
                                    case `svg`:
                                        o = s.createElementNS(`http://www.w3.org/2000/svg`, a);
                                        break;
                                    case `math`:
                                        o = s.createElementNS(`http://www.w3.org/1998/Math/MathML`, a);
                                        break;
                                    case `script`:
                                        ((o = s.createElement(`div`)),
                                            (o.innerHTML = `<script><\/script>`),
                                            (o = o.removeChild(o.firstChild)));
                                        break;
                                    case `select`:
                                        ((o =
                                            typeof r.is === `string`
                                                ? s.createElement(`select`, { is: r.is })
                                                : s.createElement(`select`)),
                                            r.multiple ? (o.multiple = !0) : r.size && (o.size = r.size));
                                        break;
                                    default:
                                        o =
                                            typeof r.is === `string`
                                                ? s.createElement(a, { is: r.is })
                                                : s.createElement(a);
                                }
                        }
                        ((o[A] = t), (o[j] = r));
                        a: for (s = t.child; s !== null;) {
                            if (s.tag === 5 || s.tag === 6) o.appendChild(s.stateNode);
                            else if (s.tag !== 4 && s.tag !== 27 && s.child !== null) {
                                ((s.child.return = s), (s = s.child));
                                continue;
                            }
                            if (s === t) break a;
                            for (; s.sibling === null;) {
                                if (s.return === null || s.return === t) break a;
                                s = s.return;
                            }
                            ((s.sibling.return = s.return), (s = s.sibling));
                        }
                        t.stateNode = o;
                        a: switch ((Pd(o, a, r), a)) {
                            case `button`:
                            case `input`:
                            case `select`:
                            case `textarea`:
                                r = !!r.autoFocus;
                                break a;
                            case `img`:
                                r = !0;
                                break a;
                            default:
                                r = !1;
                        }
                        r && Pc(t);
                    }
                }
                return (U(t), Fc(t, t.type, e === null ? null : e.memoizedProps, t.pendingProps, n), null);
            case 6:
                if (e && t.stateNode != null) e.memoizedProps !== r && Pc(t);
                else {
                    if (typeof r !== `string` && t.stateNode === null) throw Error(i(166));
                    if (((e = _e.current), Hi(t))) {
                        if (((e = t.stateNode), (n = t.memoizedProps), (r = null), (a = Ii), a !== null)) {
                            switch (a.tag) {
                                case 27:
                                case 5:
                                    r = a.memoizedProps;
                            }
                        }
                        ((e[A] = t),
                            (e = !!(
                                e.nodeValue === n ||
                                (r !== null && !0 === r.suppressHydrationWarning) ||
                                Md(e.nodeValue, n)
                            )),
                            e || R(t, !0));
                    } else ((e = Bd(e).createTextNode(r)), (e[A] = t), (t.stateNode = e));
                }
                return (U(t), null);
            case 31:
                if (((n = t.memoizedState), e === null || e.memoizedState !== null)) {
                    if (((r = Hi(t)), n !== null)) {
                        if (e === null) {
                            if (!r) throw Error(i(318));
                            if (((e = t.memoizedState), (e = e === null ? null : e.dehydrated), !e)) {
                                throw Error(i(557));
                            }
                            e[A] = t;
                        } else (Ui(), !(t.flags & 128) && (t.memoizedState = null), (t.flags |= 4));
                        (U(t), (e = !1));
                    } else {
                        ((n = Wi()),
                            e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = n),
                            (e = !0));
                    }
                    if (!e) return t.flags & 256 ? (lo(t), t) : (lo(t), null);
                    if (t.flags & 128) throw Error(i(558));
                }
                return (U(t), null);
            case 13:
                if (
                    ((r = t.memoizedState),
                    e === null || (e.memoizedState !== null && e.memoizedState.dehydrated !== null))
                ) {
                    if (((a = Hi(t)), r !== null && r.dehydrated !== null)) {
                        if (e === null) {
                            if (!a) throw Error(i(318));
                            if (((a = t.memoizedState), (a = a === null ? null : a.dehydrated), !a)) {
                                throw Error(i(317));
                            }
                            a[A] = t;
                        } else (Ui(), !(t.flags & 128) && (t.memoizedState = null), (t.flags |= 4));
                        (U(t), (a = !1));
                    } else {
                        ((a = Wi()),
                            e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = a),
                            (a = !0));
                    }
                    if (!a) return t.flags & 256 ? (lo(t), t) : (lo(t), null);
                }
                return (
                    lo(t),
                    t.flags & 128
                        ? ((t.lanes = n), t)
                        : ((n = r !== null),
                          (e = e !== null && e.memoizedState !== null),
                          n &&
                              ((r = t.child),
                              (a = null),
                              r.alternate !== null &&
                                  r.alternate.memoizedState !== null &&
                                  r.alternate.memoizedState.cachePool !== null &&
                                  (a = r.alternate.memoizedState.cachePool.pool),
                              (o = null),
                              r.memoizedState !== null &&
                                  r.memoizedState.cachePool !== null &&
                                  (o = r.memoizedState.cachePool.pool),
                              o !== a && (r.flags |= 2048)),
                          n !== e && n && (t.child.flags |= 8192),
                          Lc(t, t.updateQueue),
                          U(t),
                          null)
                );
            case 4:
                return (be(), e === null && Sd(t.stateNode.containerInfo), U(t), null);
            case 10:
                return (Yi(t.type), U(t), null);
            case 19:
                if ((D(uo), (r = t.memoizedState), r === null)) return (U(t), null);
                if (((a = (t.flags & 128) != 0), (o = r.rendering), o === null)) {
                    if (a) Rc(r, !1);
                    else {
                        if (Gl !== 0 || (e !== null && e.flags & 128)) {
                            for (e = t.child; e !== null;) {
                                if (((o = fo(e)), o !== null)) {
                                    for (
                                        t.flags |= 128,
                                            Rc(r, !1),
                                            e = o.updateQueue,
                                            t.updateQueue = e,
                                            Lc(t, e),
                                            t.subtreeFlags = 0,
                                            e = n,
                                            n = t.child;
                                        n !== null;
                                    ) {
                                        (mi(n, e), (n = n.sibling));
                                    }
                                    return (O(uo, (uo.current & 1) | 2), L && ji(t, r.treeForkCount), t.child);
                                }
                                e = e.sibling;
                            }
                        }
                        r.tail !== null && Fe() > nu && ((t.flags |= 128), (a = !0), Rc(r, !1), (t.lanes = 4194304));
                    }
                } else {
                    if (!a) {
                        if (((e = fo(o)), e !== null)) {
                            if (
                                ((t.flags |= 128),
                                (a = !0),
                                (e = e.updateQueue),
                                (t.updateQueue = e),
                                Lc(t, e),
                                Rc(r, !0),
                                r.tail === null && r.tailMode === `hidden` && !o.alternate && !L)
                            ) {
                                return (U(t), null);
                            }
                        } else {
                            2 * Fe() - r.renderingStartTime > nu &&
                                n !== 536870912 &&
                                ((t.flags |= 128), (a = !0), Rc(r, !1), (t.lanes = 4194304));
                        }
                    }
                    r.isBackwards
                        ? ((o.sibling = t.child), (t.child = o))
                        : ((e = r.last), e === null ? (t.child = o) : (e.sibling = o), (r.last = o));
                }
                return r.tail === null
                    ? (U(t), null)
                    : ((e = r.tail),
                      (r.rendering = e),
                      (r.tail = e.sibling),
                      (r.renderingStartTime = Fe()),
                      (e.sibling = null),
                      (n = uo.current),
                      O(uo, a ? (n & 1) | 2 : n & 1),
                      L && ji(t, r.treeForkCount),
                      e);
            case 22:
            case 23:
                return (
                    lo(t),
                    no(),
                    (r = t.memoizedState !== null),
                    e === null ? r && (t.flags |= 8192) : (e.memoizedState !== null) !== r && (t.flags |= 8192),
                    r ? n & 536870912 && !(t.flags & 128) && (U(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : U(t),
                    (n = t.updateQueue),
                    n !== null && Lc(t, n.retryQueue),
                    (n = null),
                    e !== null &&
                        e.memoizedState !== null &&
                        e.memoizedState.cachePool !== null &&
                        (n = e.memoizedState.cachePool.pool),
                    (r = null),
                    t.memoizedState !== null &&
                        t.memoizedState.cachePool !== null &&
                        (r = t.memoizedState.cachePool.pool),
                    r !== n && (t.flags |= 2048),
                    e !== null && D(va),
                    null
                );
            case 24:
                return (
                    (n = null),
                    e !== null && (n = e.memoizedState.cache),
                    t.memoizedState.cache !== n && (t.flags |= 2048),
                    Yi(sa),
                    U(t),
                    null
                );
            case 25:
                return null;
            case 30:
                return null;
        }
        throw Error(i(156, t.tag));
    }
    function Bc(e, t) {
        switch ((Pi(t), t.tag)) {
            case 1:
                return ((e = t.flags), e & 65536 ? ((t.flags = (e & -65537) | 128), t) : null);
            case 3:
                return (
                    Yi(sa),
                    be(),
                    (e = t.flags),
                    e & 65536 && !(e & 128) ? ((t.flags = (e & -65537) | 128), t) : null
                );
            case 26:
            case 27:
            case 5:
                return (Se(t), null);
            case 31:
                if (t.memoizedState !== null) {
                    if ((lo(t), t.alternate === null)) throw Error(i(340));
                    Ui();
                }
                return ((e = t.flags), e & 65536 ? ((t.flags = (e & -65537) | 128), t) : null);
            case 13:
                if ((lo(t), (e = t.memoizedState), e !== null && e.dehydrated !== null)) {
                    if (t.alternate === null) throw Error(i(340));
                    Ui();
                }
                return ((e = t.flags), e & 65536 ? ((t.flags = (e & -65537) | 128), t) : null);
            case 19:
                return (D(uo), null);
            case 4:
                return (be(), null);
            case 10:
                return (Yi(t.type), null);
            case 22:
            case 23:
                return (
                    lo(t),
                    no(),
                    e !== null && D(va),
                    (e = t.flags),
                    e & 65536 ? ((t.flags = (e & -65537) | 128), t) : null
                );
            case 24:
                return (Yi(sa), null);
            case 25:
                return null;
            default:
                return null;
        }
    }
    function Vc(e, t) {
        switch ((Pi(t), t.tag)) {
            case 3:
                (Yi(sa), be());
                break;
            case 26:
            case 27:
            case 5:
                Se(t);
                break;
            case 4:
                be();
                break;
            case 31:
                t.memoizedState !== null && lo(t);
                break;
            case 13:
                lo(t);
                break;
            case 19:
                D(uo);
                break;
            case 10:
                Yi(t.type);
                break;
            case 22:
            case 23:
                (lo(t), no(), e !== null && D(va));
                break;
            case 24:
                Yi(sa);
        }
    }
    function Hc(e, t) {
        try {
            let n = t.updateQueue;
            let r = n === null ? null : n.lastEffect;
            if (r !== null) {
                const i = r.next;
                n = i;
                do {
                    if ((n.tag & e) === e) {
                        r = void 0;
                        const a = n.create;
                        const o = n.inst;
                        ((r = a()), (o.destroy = r));
                    }
                    n = n.next;
                } while (n !== i);
            }
        } catch (e) {
            Z(t, t.return, e);
        }
    }
    function Uc(e, t, n) {
        try {
            let r = t.updateQueue;
            let i = r === null ? null : r.lastEffect;
            if (i !== null) {
                const a = i.next;
                r = a;
                do {
                    if ((r.tag & e) === e) {
                        const o = r.inst;
                        const s = o.destroy;
                        if (s !== void 0) {
                            ((o.destroy = void 0), (i = t));
                            const c = n;
                            const l = s;
                            try {
                                l();
                            } catch (e) {
                                Z(i, c, e);
                            }
                        }
                    }
                    r = r.next;
                } while (r !== a);
            }
        } catch (e) {
            Z(t, t.return, e);
        }
    }
    function Wc(e) {
        const t = e.updateQueue;
        if (t !== null) {
            const n = e.stateNode;
            try {
                Za(t, n);
            } catch (t) {
                Z(e, e.return, t);
            }
        }
    }
    function Gc(e, t, n) {
        ((n.props = qs(e.type, e.memoizedProps)), (n.state = e.memoizedState));
        try {
            n.componentWillUnmount();
        } catch (n) {
            Z(e, t, n);
        }
    }
    function Kc(e, t) {
        try {
            const n = e.ref;
            if (n !== null) {
                switch (e.tag) {
                    case 26:
                    case 27:
                    case 5:
                        var r = e.stateNode;
                        break;
                    case 30:
                        r = e.stateNode;
                        break;
                    default:
                        r = e.stateNode;
                }
                typeof n === `function` ? (e.refCleanup = n(r)) : (n.current = r);
            }
        } catch (n) {
            Z(e, t, n);
        }
    }
    function qc(e, t) {
        const n = e.ref;
        const r = e.refCleanup;
        if (n !== null) {
            if (typeof r === `function`) {
                try {
                    r();
                } catch (n) {
                    Z(e, t, n);
                } finally {
                    ((e.refCleanup = null), (e = e.alternate), e != null && (e.refCleanup = null));
                }
            } else if (typeof n === `function`) {
                try {
                    n(null);
                } catch (n) {
                    Z(e, t, n);
                }
            } else n.current = null;
        }
    }
    function Jc(e) {
        const t = e.type;
        const n = e.memoizedProps;
        const r = e.stateNode;
        try {
            a: switch (t) {
                case `button`:
                case `input`:
                case `select`:
                case `textarea`:
                    n.autoFocus && r.focus();
                    break a;
                case `img`:
                    n.src ? (r.src = n.src) : n.srcSet && (r.srcset = n.srcSet);
            }
        } catch (t) {
            Z(e, e.return, t);
        }
    }
    function Yc(e, t, n) {
        try {
            const r = e.stateNode;
            (Fd(r, e.type, n, t), (r[j] = t));
        } catch (t) {
            Z(e, e.return, t);
        }
    }
    function Xc(e) {
        return e.tag === 5 || e.tag === 3 || e.tag === 26 || (e.tag === 27 && Zd(e.type)) || e.tag === 4;
    }
    function Zc(e) {
        a: for (;;) {
            for (; e.sibling === null;) {
                if (e.return === null || Xc(e.return)) return null;
                e = e.return;
            }
            for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18;) {
                if ((e.tag === 27 && Zd(e.type)) || e.flags & 2 || e.child === null || e.tag === 4) continue a;
                ((e.child.return = e), (e = e.child));
            }
            if (!(e.flags & 2)) return e.stateNode;
        }
    }
    function Qc(e, t, n) {
        const r = e.tag;
        if (r === 5 || r === 6) {
            ((e = e.stateNode),
                t
                    ? (n.nodeType === 9 ? n.body : n.nodeName === `HTML` ? n.ownerDocument.body : n).insertBefore(e, t)
                    : ((t = n.nodeType === 9 ? n.body : n.nodeName === `HTML` ? n.ownerDocument.body : n),
                      t.appendChild(e),
                      (n = n._reactRootContainer),
                      n != null || t.onclick !== null || (t.onclick = F)));
        } else if (r !== 4 && (r === 27 && Zd(e.type) && ((n = e.stateNode), (t = null)), (e = e.child), e !== null)) {
            for (Qc(e, t, n), e = e.sibling; e !== null;) (Qc(e, t, n), (e = e.sibling));
        }
    }
    function $c(e, t, n) {
        const r = e.tag;
        if (r === 5 || r === 6) ((e = e.stateNode), t ? n.insertBefore(e, t) : n.appendChild(e));
        else if (r !== 4 && (r === 27 && Zd(e.type) && (n = e.stateNode), (e = e.child), e !== null)) {
            for ($c(e, t, n), e = e.sibling; e !== null;) ($c(e, t, n), (e = e.sibling));
        }
    }
    function el(e) {
        const t = e.stateNode;
        const n = e.memoizedProps;
        try {
            for (var r = e.type, i = t.attributes; i.length;) t.removeAttributeNode(i[0]);
            (Pd(t, r, n), (t[A] = e), (t[j] = n));
        } catch (t) {
            Z(e, e.return, t);
        }
    }
    let tl = !1;
    let nl = !1;
    let rl = !1;
    const il = typeof WeakSet === `function` ? WeakSet : Set;
    let al = null;
    function ol(e, t) {
        if (((e = e.containerInfo), (Rd = sp), (e = Ar(e)), jr(e))) {
            if (`selectionStart` in e) var n = { start: e.selectionStart, end: e.selectionEnd };
            else {
                a: {
                    n = ((n = e.ownerDocument) && n.defaultView) || window;
                    var r = n.getSelection && n.getSelection();
                    if (r && r.rangeCount !== 0) {
                        n = r.anchorNode;
                        var a = r.anchorOffset;
                        var o = r.focusNode;
                        r = r.focusOffset;
                        try {
                            (n.nodeType, o.nodeType);
                        } catch {
                            n = null;
                            break a;
                        }
                        let s = 0;
                        let c = -1;
                        let l = -1;
                        let u = 0;
                        let d = 0;
                        let f = e;
                        let p = null;
                        b: for (;;) {
                            for (
                                var m;
                                f !== n || (a !== 0 && f.nodeType !== 3) || (c = s + a),
                                    f !== o || (r !== 0 && f.nodeType !== 3) || (l = s + r),
                                    f.nodeType === 3 && (s += f.nodeValue.length),
                                    (m = f.firstChild) !== null;
                            ) {
                                ((p = f), (f = m));
                            }
                            for (;;) {
                                if (f === e) break b;
                                if (
                                    (p === n && ++u === a && (c = s),
                                    p === o && ++d === r && (l = s),
                                    (m = f.nextSibling) !== null)
                                ) {
                                    break;
                                }
                                ((f = p), (p = f.parentNode));
                            }
                            f = m;
                        }
                        n = c === -1 || l === -1 ? null : { start: c, end: l };
                    } else n = null;
                }
            }
            n ||= { start: 0, end: 0 };
        } else n = null;
        for (zd = { focusedElem: e, selectionRange: n }, sp = !1, al = t; al !== null;) {
            if (((t = al), (e = t.child), t.subtreeFlags & 1028 && e !== null)) ((e.return = t), (al = e));
            else {
                for (; al !== null;) {
                    switch (((t = al), (o = t.alternate), (e = t.flags), t.tag)) {
                        case 0:
                            if (e & 4 && ((e = t.updateQueue), (e = e === null ? null : e.events), e !== null)) {
                                for (n = 0; n < e.length; n++) ((a = e[n]), (a.ref.impl = a.nextImpl));
                            }
                            break;
                        case 11:
                        case 15:
                            break;
                        case 1:
                            if (e & 1024 && o !== null) {
                                ((e = void 0),
                                    (n = t),
                                    (a = o.memoizedProps),
                                    (o = o.memoizedState),
                                    (r = n.stateNode));
                                try {
                                    const h = qs(n.type, a);
                                    ((e = r.getSnapshotBeforeUpdate(h, o)),
                                        (r.__reactInternalSnapshotBeforeUpdate = e));
                                } catch (e) {
                                    Z(n, n.return, e);
                                }
                            }
                            break;
                        case 3:
                            if (e & 1024) {
                                if (((e = t.stateNode.containerInfo), (n = e.nodeType), n === 9)) ef(e);
                                else if (n === 1) {
                                    switch (e.nodeName) {
                                        case `HEAD`:
                                        case `HTML`:
                                        case `BODY`:
                                            ef(e);
                                            break;
                                        default:
                                            e.textContent = ``;
                                    }
                                }
                            }
                            break;
                        case 5:
                        case 26:
                        case 27:
                        case 6:
                        case 4:
                        case 17:
                            break;
                        default:
                            if (e & 1024) throw Error(i(163));
                    }
                    if (((e = t.sibling), e !== null)) {
                        ((e.return = t.return), (al = e));
                        break;
                    }
                    al = t.return;
                }
            }
        }
    }
    function sl(e, t, n) {
        let r = n.flags;
        switch (n.tag) {
            case 0:
            case 11:
            case 15:
                (xl(e, n), r & 4 && Hc(5, n));
                break;
            case 1:
                if ((xl(e, n), r & 4)) {
                    if (((e = n.stateNode), t === null)) {
                        try {
                            e.componentDidMount();
                        } catch (e) {
                            Z(n, n.return, e);
                        }
                    } else {
                        var i = qs(n.type, t.memoizedProps);
                        t = t.memoizedState;
                        try {
                            e.componentDidUpdate(i, t, e.__reactInternalSnapshotBeforeUpdate);
                        } catch (e) {
                            Z(n, n.return, e);
                        }
                    }
                }
                (r & 64 && Wc(n), r & 512 && Kc(n, n.return));
                break;
            case 3:
                if ((xl(e, n), r & 64 && ((e = n.updateQueue), e !== null))) {
                    if (((t = null), n.child !== null)) {
                        switch (n.child.tag) {
                            case 27:
                            case 5:
                                t = n.child.stateNode;
                                break;
                            case 1:
                                t = n.child.stateNode;
                        }
                    }
                    try {
                        Za(e, t);
                    } catch (e) {
                        Z(n, n.return, e);
                    }
                }
                break;
            case 27:
                t === null && r & 4 && el(n);
            case 26:
            case 5:
                (xl(e, n), t === null && r & 4 && Jc(n), r & 512 && Kc(n, n.return));
                break;
            case 12:
                xl(e, n);
                break;
            case 31:
                (xl(e, n), r & 4 && fl(e, n));
                break;
            case 13:
                (xl(e, n),
                    r & 4 && pl(e, n),
                    r & 64 &&
                        ((e = n.memoizedState),
                        e !== null && ((e = e.dehydrated), e !== null && ((n = Ju.bind(null, n)), sf(e, n)))));
                break;
            case 22:
                if (((r = n.memoizedState !== null || tl), !r)) {
                    ((t = (t !== null && t.memoizedState !== null) || nl), (i = tl));
                    const a = nl;
                    ((tl = r), (nl = t) && !a ? Cl(e, n, (n.subtreeFlags & 8772) != 0) : xl(e, n), (tl = i), (nl = a));
                }
                break;
            case 30:
                break;
            default:
                xl(e, n);
        }
    }
    function cl(e) {
        let t = e.alternate;
        (t !== null && ((e.alternate = null), cl(t)),
            (e.child = null),
            (e.deletions = null),
            (e.sibling = null),
            e.tag === 5 && ((t = e.stateNode), t !== null && yt(t)),
            (e.stateNode = null),
            (e.return = null),
            (e.dependencies = null),
            (e.memoizedProps = null),
            (e.memoizedState = null),
            (e.pendingProps = null),
            (e.stateNode = null),
            (e.updateQueue = null));
    }
    let W = null;
    let ll = !1;
    function ul(e, t, n) {
        for (n = n.child; n !== null;) (dl(e, t, n), (n = n.sibling));
    }
    function dl(e, t, n) {
        if (We && typeof We.onCommitFiberUnmount === `function`) {
            try {
                We.onCommitFiberUnmount(Ue, n);
            } catch {}
        }
        switch (n.tag) {
            case 26:
                (nl || qc(n, t),
                    ul(e, t, n),
                    n.memoizedState
                        ? n.memoizedState.count--
                        : n.stateNode && ((n = n.stateNode), n.parentNode.removeChild(n)));
                break;
            case 27:
                nl || qc(n, t);
                var r = W;
                var i = ll;
                (Zd(n.type) && ((W = n.stateNode), (ll = !1)), ul(e, t, n), pf(n.stateNode), (W = r), (ll = i));
                break;
            case 5:
                nl || qc(n, t);
            case 6:
                if (((r = W), (i = ll), (W = null), ul(e, t, n), (W = r), (ll = i), W !== null)) {
                    if (ll) {
                        try {
                            (W.nodeType === 9 ? W.body : W.nodeName === `HTML` ? W.ownerDocument.body : W).removeChild(
                                n.stateNode
                            );
                        } catch (e) {
                            Z(n, t, e);
                        }
                    } else {
                        try {
                            W.removeChild(n.stateNode);
                        } catch (e) {
                            Z(n, t, e);
                        }
                    }
                }
                break;
            case 18:
                W !== null &&
                    (ll
                        ? ((e = W),
                          Qd(e.nodeType === 9 ? e.body : e.nodeName === `HTML` ? e.ownerDocument.body : e, n.stateNode),
                          Np(e))
                        : Qd(W, n.stateNode));
                break;
            case 4:
                ((r = W), (i = ll), (W = n.stateNode.containerInfo), (ll = !0), ul(e, t, n), (W = r), (ll = i));
                break;
            case 0:
            case 11:
            case 14:
            case 15:
                (Uc(2, n, t), nl || Uc(4, n, t), ul(e, t, n));
                break;
            case 1:
                (nl || (qc(n, t), (r = n.stateNode), typeof r.componentWillUnmount === `function` && Gc(n, t, r)),
                    ul(e, t, n));
                break;
            case 21:
                ul(e, t, n);
                break;
            case 22:
                ((nl = (r = nl) || n.memoizedState !== null), ul(e, t, n), (nl = r));
                break;
            default:
                ul(e, t, n);
        }
    }
    function fl(e, t) {
        if (t.memoizedState === null && ((e = t.alternate), e !== null && ((e = e.memoizedState), e !== null))) {
            e = e.dehydrated;
            try {
                Np(e);
            } catch (e) {
                Z(t, t.return, e);
            }
        }
    }
    function pl(e, t) {
        if (
            t.memoizedState === null &&
            ((e = t.alternate), e !== null && ((e = e.memoizedState), e !== null && ((e = e.dehydrated), e !== null)))
        ) {
            try {
                Np(e);
            } catch (e) {
                Z(t, t.return, e);
            }
        }
    }
    function ml(e) {
        switch (e.tag) {
            case 31:
            case 13:
            case 19:
                var t = e.stateNode;
                return (t === null && (t = e.stateNode = new il()), t);
            case 22:
                return ((e = e.stateNode), (t = e._retryCache), t === null && (t = e._retryCache = new il()), t);
            default:
                throw Error(i(435, e.tag));
        }
    }
    function hl(e, t) {
        const n = ml(e);
        t.forEach(function (t) {
            if (!n.has(t)) {
                n.add(t);
                const r = Yu.bind(null, e, t);
                t.then(r, r);
            }
        });
    }
    function gl(e, t) {
        const n = t.deletions;
        if (n !== null) {
            for (let r = 0; r < n.length; r++) {
                const a = n[r];
                let o = e;
                const s = t;
                let c = s;
                a: for (; c !== null;) {
                    switch (c.tag) {
                        case 27:
                            if (Zd(c.type)) {
                                ((W = c.stateNode), (ll = !1));
                                break a;
                            }
                            break;
                        case 5:
                            ((W = c.stateNode), (ll = !1));
                            break a;
                        case 3:
                        case 4:
                            ((W = c.stateNode.containerInfo), (ll = !0));
                            break a;
                    }
                    c = c.return;
                }
                if (W === null) throw Error(i(160));
                (dl(o, s, a),
                    (W = null),
                    (ll = !1),
                    (o = a.alternate),
                    o !== null && (o.return = null),
                    (a.return = null));
            }
        }
        if (t.subtreeFlags & 13886) for (t = t.child; t !== null;) (vl(t, e), (t = t.sibling));
    }
    let _l = null;
    function vl(e, t) {
        let n = e.alternate;
        let r = e.flags;
        switch (e.tag) {
            case 0:
            case 11:
            case 14:
            case 15:
                (gl(t, e), yl(e), r & 4 && (Uc(3, e, e.return), Hc(3, e), Uc(5, e, e.return)));
                break;
            case 1:
                (gl(t, e),
                    yl(e),
                    r & 512 && (nl || n === null || qc(n, n.return)),
                    r & 64 &&
                        tl &&
                        ((e = e.updateQueue),
                        e !== null &&
                            ((r = e.callbacks),
                            r !== null &&
                                ((n = e.shared.hiddenCallbacks),
                                (e.shared.hiddenCallbacks = n === null ? r : n.concat(r))))));
                break;
            case 26:
                var a = _l;
                if ((gl(t, e), yl(e), r & 512 && (nl || n === null || qc(n, n.return)), r & 4)) {
                    var o = n === null ? null : n.memoizedState;
                    if (((r = e.memoizedState), n === null)) {
                        if (r === null) {
                            if (e.stateNode === null) {
                                a: {
                                    ((r = e.type), (n = e.memoizedProps), (a = a.ownerDocument || a));
                                    b: switch (r) {
                                        case `title`:
                                            ((o = a.getElementsByTagName(`title`)[0]),
                                                (!o ||
                                                    o[N] ||
                                                    o[A] ||
                                                    o.namespaceURI === `http://www.w3.org/2000/svg` ||
                                                    o.hasAttribute(`itemprop`)) &&
                                                    ((o = a.createElement(r)),
                                                    a.head.insertBefore(o, a.querySelector(`head > title`))),
                                                Pd(o, r, n),
                                                (o[A] = e),
                                                wt(o),
                                                (r = o));
                                            break a;
                                        case `link`:
                                            var s = Vf(`link`, `href`, a).get(r + (n.href || ``));
                                            if (s) {
                                                for (var c = 0; c < s.length; c++) {
                                                    if (
                                                        ((o = s[c]),
                                                        o.getAttribute(`href`) ===
                                                            (n.href == null || n.href === `` ? null : n.href) &&
                                                            o.getAttribute(`rel`) === (n.rel == null ? null : n.rel) &&
                                                            o.getAttribute(`title`) ===
                                                                (n.title == null ? null : n.title) &&
                                                            o.getAttribute(`crossorigin`) ===
                                                                (n.crossOrigin == null ? null : n.crossOrigin))
                                                    ) {
                                                        s.splice(c, 1);
                                                        break b;
                                                    }
                                                }
                                            }
                                            ((o = a.createElement(r)), Pd(o, r, n), a.head.appendChild(o));
                                            break;
                                        case `meta`:
                                            if ((s = Vf(`meta`, `content`, a).get(r + (n.content || ``)))) {
                                                for (c = 0; c < s.length; c++) {
                                                    if (
                                                        ((o = s[c]),
                                                        o.getAttribute(`content`) ===
                                                            (n.content == null ? null : `` + n.content) &&
                                                            o.getAttribute(`name`) ===
                                                                (n.name == null ? null : n.name) &&
                                                            o.getAttribute(`property`) ===
                                                                (n.property == null ? null : n.property) &&
                                                            o.getAttribute(`http-equiv`) ===
                                                                (n.httpEquiv == null ? null : n.httpEquiv) &&
                                                            o.getAttribute(`charset`) ===
                                                                (n.charSet == null ? null : n.charSet))
                                                    ) {
                                                        s.splice(c, 1);
                                                        break b;
                                                    }
                                                }
                                            }
                                            ((o = a.createElement(r)), Pd(o, r, n), a.head.appendChild(o));
                                            break;
                                        default:
                                            throw Error(i(468, r));
                                    }
                                    ((o[A] = e), wt(o), (r = o));
                                }
                                e.stateNode = r;
                            } else Hf(a, e.type, e.stateNode);
                        } else e.stateNode = If(a, r, e.memoizedProps);
                    } else {
                        o === r
                            ? r === null && e.stateNode !== null && Yc(e, e.memoizedProps, n.memoizedProps)
                            : (o === null
                                  ? n.stateNode !== null && ((n = n.stateNode), n.parentNode.removeChild(n))
                                  : o.count--,
                              r === null ? Hf(a, e.type, e.stateNode) : If(a, r, e.memoizedProps));
                    }
                }
                break;
            case 27:
                (gl(t, e),
                    yl(e),
                    r & 512 && (nl || n === null || qc(n, n.return)),
                    n !== null && r & 4 && Yc(e, e.memoizedProps, n.memoizedProps));
                break;
            case 5:
                if ((gl(t, e), yl(e), r & 512 && (nl || n === null || qc(n, n.return)), e.flags & 32)) {
                    a = e.stateNode;
                    try {
                        Yt(a, ``);
                    } catch (t) {
                        Z(e, e.return, t);
                    }
                }
                (r & 4 && e.stateNode != null && ((a = e.memoizedProps), Yc(e, a, n === null ? a : n.memoizedProps)),
                    r & 1024 && (rl = !0));
                break;
            case 6:
                if ((gl(t, e), yl(e), r & 4)) {
                    if (e.stateNode === null) throw Error(i(162));
                    ((r = e.memoizedProps), (n = e.stateNode));
                    try {
                        n.nodeValue = r;
                    } catch (t) {
                        Z(e, e.return, t);
                    }
                }
                break;
            case 3:
                if (
                    ((Bf = null),
                    (a = _l),
                    (_l = gf(t.containerInfo)),
                    gl(t, e),
                    (_l = a),
                    yl(e),
                    r & 4 && n !== null && n.memoizedState.isDehydrated)
                ) {
                    try {
                        Np(t.containerInfo);
                    } catch (t) {
                        Z(e, e.return, t);
                    }
                }
                rl && ((rl = !1), bl(e));
                break;
            case 4:
                ((r = _l), (_l = gf(e.stateNode.containerInfo)), gl(t, e), yl(e), (_l = r));
                break;
            case 12:
                (gl(t, e), yl(e));
                break;
            case 31:
                (gl(t, e), yl(e), r & 4 && ((r = e.updateQueue), r !== null && ((e.updateQueue = null), hl(e, r))));
                break;
            case 13:
                (gl(t, e),
                    yl(e),
                    e.child.flags & 8192 &&
                        (e.memoizedState !== null) != (n !== null && n.memoizedState !== null) &&
                        (eu = Fe()),
                    r & 4 && ((r = e.updateQueue), r !== null && ((e.updateQueue = null), hl(e, r))));
                break;
            case 22:
                a = e.memoizedState !== null;
                var l = n !== null && n.memoizedState !== null;
                var u = tl;
                var d = nl;
                if (((tl = u || a), (nl = d || l), gl(t, e), (nl = d), (tl = u), yl(e), r & 8192)) {
                    a: for (
                        t = e.stateNode,
                            t._visibility = a ? t._visibility & -2 : t._visibility | 1,
                            a && (n === null || l || tl || nl || Sl(e)),
                            n = null,
                            t = e;
                        ;
                    ) {
                        if (t.tag === 5 || t.tag === 26) {
                            if (n === null) {
                                l = n = t;
                                try {
                                    if (((o = l.stateNode), a)) {
                                        ((s = o.style),
                                            typeof s.setProperty === `function`
                                                ? s.setProperty(`display`, `none`, `important`)
                                                : (s.display = `none`));
                                    } else {
                                        c = l.stateNode;
                                        const f = l.memoizedProps.style;
                                        const p = f != null && f.hasOwnProperty(`display`) ? f.display : null;
                                        c.style.display = p == null || typeof p === `boolean` ? `` : (`` + p).trim();
                                    }
                                } catch (e) {
                                    Z(l, l.return, e);
                                }
                            }
                        } else if (t.tag === 6) {
                            if (n === null) {
                                l = t;
                                try {
                                    l.stateNode.nodeValue = a ? `` : l.memoizedProps;
                                } catch (e) {
                                    Z(l, l.return, e);
                                }
                            }
                        } else if (t.tag === 18) {
                            if (n === null) {
                                l = t;
                                try {
                                    const m = l.stateNode;
                                    a ? $d(m, !0) : $d(l.stateNode, !1);
                                } catch (e) {
                                    Z(l, l.return, e);
                                }
                            }
                        } else if (
                            ((t.tag !== 22 && t.tag !== 23) || t.memoizedState === null || t === e) &&
                            t.child !== null
                        ) {
                            ((t.child.return = t), (t = t.child));
                            continue;
                        }
                        if (t === e) break a;
                        for (; t.sibling === null;) {
                            if (t.return === null || t.return === e) break a;
                            (n === t && (n = null), (t = t.return));
                        }
                        (n === t && (n = null), (t.sibling.return = t.return), (t = t.sibling));
                    }
                }
                r & 4 &&
                    ((r = e.updateQueue),
                    r !== null && ((n = r.retryQueue), n !== null && ((r.retryQueue = null), hl(e, n))));
                break;
            case 19:
                (gl(t, e), yl(e), r & 4 && ((r = e.updateQueue), r !== null && ((e.updateQueue = null), hl(e, r))));
                break;
            case 30:
                break;
            case 21:
                break;
            default:
                (gl(t, e), yl(e));
        }
    }
    function yl(e) {
        const t = e.flags;
        if (t & 2) {
            try {
                for (var n, r = e.return; r !== null;) {
                    if (Xc(r)) {
                        n = r;
                        break;
                    }
                    r = r.return;
                }
                if (n == null) throw Error(i(160));
                switch (n.tag) {
                    case 27:
                        var a = n.stateNode;
                        $c(e, Zc(e), a);
                        break;
                    case 5:
                        var o = n.stateNode;
                        (n.flags & 32 && (Yt(o, ``), (n.flags &= -33)), $c(e, Zc(e), o));
                        break;
                    case 3:
                    case 4:
                        var s = n.stateNode.containerInfo;
                        Qc(e, Zc(e), s);
                        break;
                    default:
                        throw Error(i(161));
                }
            } catch (t) {
                Z(e, e.return, t);
            }
            e.flags &= -3;
        }
        t & 4096 && (e.flags &= -4097);
    }
    function bl(e) {
        if (e.subtreeFlags & 1024) {
            for (e = e.child; e !== null;) {
                const t = e;
                (bl(t), t.tag === 5 && t.flags & 1024 && t.stateNode.reset(), (e = e.sibling));
            }
        }
    }
    function xl(e, t) {
        if (t.subtreeFlags & 8772) for (t = t.child; t !== null;) (sl(e, t.alternate, t), (t = t.sibling));
    }
    function Sl(e) {
        for (e = e.child; e !== null;) {
            const t = e;
            switch (t.tag) {
                case 0:
                case 11:
                case 14:
                case 15:
                    (Uc(4, t, t.return), Sl(t));
                    break;
                case 1:
                    qc(t, t.return);
                    var n = t.stateNode;
                    (typeof n.componentWillUnmount === `function` && Gc(t, t.return, n), Sl(t));
                    break;
                case 27:
                    pf(t.stateNode);
                case 26:
                case 5:
                    (qc(t, t.return), Sl(t));
                    break;
                case 22:
                    t.memoizedState === null && Sl(t);
                    break;
                case 30:
                    Sl(t);
                    break;
                default:
                    Sl(t);
            }
            e = e.sibling;
        }
    }
    function Cl(e, t, n) {
        for (n &&= (t.subtreeFlags & 8772) != 0, t = t.child; t !== null;) {
            let r = t.alternate;
            let i = e;
            const a = t;
            const o = a.flags;
            switch (a.tag) {
                case 0:
                case 11:
                case 15:
                    (Cl(i, a, n), Hc(4, a));
                    break;
                case 1:
                    if ((Cl(i, a, n), (r = a), (i = r.stateNode), typeof i.componentDidMount === `function`)) {
                        try {
                            i.componentDidMount();
                        } catch (e) {
                            Z(r, r.return, e);
                        }
                    }
                    if (((r = a), (i = r.updateQueue), i !== null)) {
                        const s = r.stateNode;
                        try {
                            const c = i.shared.hiddenCallbacks;
                            if (c !== null) {
                                for (i.shared.hiddenCallbacks = null, i = 0; i < c.length; i++) Xa(c[i], s);
                            }
                        } catch (e) {
                            Z(r, r.return, e);
                        }
                    }
                    (n && o & 64 && Wc(a), Kc(a, a.return));
                    break;
                case 27:
                    el(a);
                case 26:
                case 5:
                    (Cl(i, a, n), n && r === null && o & 4 && Jc(a), Kc(a, a.return));
                    break;
                case 12:
                    Cl(i, a, n);
                    break;
                case 31:
                    (Cl(i, a, n), n && o & 4 && fl(i, a));
                    break;
                case 13:
                    (Cl(i, a, n), n && o & 4 && pl(i, a));
                    break;
                case 22:
                    (a.memoizedState === null && Cl(i, a, n), Kc(a, a.return));
                    break;
                case 30:
                    break;
                default:
                    Cl(i, a, n);
            }
            t = t.sibling;
        }
    }
    function wl(e, t) {
        let n = null;
        (e !== null &&
            e.memoizedState !== null &&
            e.memoizedState.cachePool !== null &&
            (n = e.memoizedState.cachePool.pool),
            (e = null),
            t.memoizedState !== null && t.memoizedState.cachePool !== null && (e = t.memoizedState.cachePool.pool),
            e !== n && (e != null && e.refCount++, n != null && la(n)));
    }
    function Tl(e, t) {
        ((e = null),
            t.alternate !== null && (e = t.alternate.memoizedState.cache),
            (t = t.memoizedState.cache),
            t !== e && (t.refCount++, e != null && la(e)));
    }
    function El(e, t, n, r) {
        if (t.subtreeFlags & 10256) for (t = t.child; t !== null;) (Dl(e, t, n, r), (t = t.sibling));
    }
    function Dl(e, t, n, r) {
        const i = t.flags;
        switch (t.tag) {
            case 0:
            case 11:
            case 15:
                (El(e, t, n, r), i & 2048 && Hc(9, t));
                break;
            case 1:
                El(e, t, n, r);
                break;
            case 3:
                (El(e, t, n, r),
                    i & 2048 &&
                        ((e = null),
                        t.alternate !== null && (e = t.alternate.memoizedState.cache),
                        (t = t.memoizedState.cache),
                        t !== e && (t.refCount++, e != null && la(e))));
                break;
            case 12:
                if (i & 2048) {
                    (El(e, t, n, r), (e = t.stateNode));
                    try {
                        var a = t.memoizedProps;
                        var o = a.id;
                        const s = a.onPostCommit;
                        typeof s === `function` &&
                            s(o, t.alternate === null ? `mount` : `update`, e.passiveEffectDuration, -0);
                    } catch (e) {
                        Z(t, t.return, e);
                    }
                } else El(e, t, n, r);
                break;
            case 31:
                El(e, t, n, r);
                break;
            case 13:
                El(e, t, n, r);
                break;
            case 23:
                break;
            case 22:
                ((a = t.stateNode),
                    (o = t.alternate),
                    t.memoizedState === null
                        ? a._visibility & 2
                            ? El(e, t, n, r)
                            : ((a._visibility |= 2), Ol(e, t, n, r, (t.subtreeFlags & 10256) != 0 || !1))
                        : a._visibility & 2
                          ? El(e, t, n, r)
                          : kl(e, t),
                    i & 2048 && wl(o, t));
                break;
            case 24:
                (El(e, t, n, r), i & 2048 && Tl(t.alternate, t));
                break;
            default:
                El(e, t, n, r);
        }
    }
    function Ol(e, t, n, r, i) {
        for (i &&= (t.subtreeFlags & 10256) != 0 || !1, t = t.child; t !== null;) {
            const a = e;
            const o = t;
            const s = n;
            const c = r;
            const l = o.flags;
            switch (o.tag) {
                case 0:
                case 11:
                case 15:
                    (Ol(a, o, s, c, i), Hc(8, o));
                    break;
                case 23:
                    break;
                case 22:
                    var u = o.stateNode;
                    (o.memoizedState === null
                        ? ((u._visibility |= 2), Ol(a, o, s, c, i))
                        : u._visibility & 2
                          ? Ol(a, o, s, c, i)
                          : kl(a, o),
                        i && l & 2048 && wl(o.alternate, o));
                    break;
                case 24:
                    (Ol(a, o, s, c, i), i && l & 2048 && Tl(o.alternate, o));
                    break;
                default:
                    Ol(a, o, s, c, i);
            }
            t = t.sibling;
        }
    }
    function kl(e, t) {
        if (t.subtreeFlags & 10256) {
            for (t = t.child; t !== null;) {
                const n = e;
                const r = t;
                const i = r.flags;
                switch (r.tag) {
                    case 22:
                        (kl(n, r), i & 2048 && wl(r.alternate, r));
                        break;
                    case 24:
                        (kl(n, r), i & 2048 && Tl(r.alternate, r));
                        break;
                    default:
                        kl(n, r);
                }
                t = t.sibling;
            }
        }
    }
    let Al = 8192;
    function jl(e, t, n) {
        if (e.subtreeFlags & Al) for (e = e.child; e !== null;) (Ml(e, t, n), (e = e.sibling));
    }
    function Ml(e, t, n) {
        switch (e.tag) {
            case 26:
                (jl(e, t, n), e.flags & Al && e.memoizedState !== null && Gf(n, _l, e.memoizedState, e.memoizedProps));
                break;
            case 5:
                jl(e, t, n);
                break;
            case 3:
            case 4:
                var r = _l;
                ((_l = gf(e.stateNode.containerInfo)), jl(e, t, n), (_l = r));
                break;
            case 22:
                e.memoizedState === null &&
                    ((r = e.alternate),
                    r !== null && r.memoizedState !== null
                        ? ((r = Al), (Al = 16777216), jl(e, t, n), (Al = r))
                        : jl(e, t, n));
                break;
            default:
                jl(e, t, n);
        }
    }
    function Nl(e) {
        let t = e.alternate;
        if (t !== null && ((e = t.child), e !== null)) {
            t.child = null;
            do ((t = e.sibling), (e.sibling = null), (e = t));
            while (e !== null);
        }
    }
    function Pl(e) {
        const t = e.deletions;
        if (e.flags & 16) {
            if (t !== null) {
                for (let n = 0; n < t.length; n++) {
                    const r = t[n];
                    ((al = r), Ll(r, e));
                }
            }
            Nl(e);
        }
        if (e.subtreeFlags & 10256) for (e = e.child; e !== null;) (Fl(e), (e = e.sibling));
    }
    function Fl(e) {
        switch (e.tag) {
            case 0:
            case 11:
            case 15:
                (Pl(e), e.flags & 2048 && Uc(9, e, e.return));
                break;
            case 3:
                Pl(e);
                break;
            case 12:
                Pl(e);
                break;
            case 22:
                var t = e.stateNode;
                e.memoizedState !== null && t._visibility & 2 && (e.return === null || e.return.tag !== 13)
                    ? ((t._visibility &= -3), Il(e))
                    : Pl(e);
                break;
            default:
                Pl(e);
        }
    }
    function Il(e) {
        let t = e.deletions;
        if (e.flags & 16) {
            if (t !== null) {
                for (var n = 0; n < t.length; n++) {
                    const r = t[n];
                    ((al = r), Ll(r, e));
                }
            }
            Nl(e);
        }
        for (e = e.child; e !== null;) {
            switch (((t = e), t.tag)) {
                case 0:
                case 11:
                case 15:
                    (Uc(8, t, t.return), Il(t));
                    break;
                case 22:
                    ((n = t.stateNode), n._visibility & 2 && ((n._visibility &= -3), Il(t)));
                    break;
                default:
                    Il(t);
            }
            e = e.sibling;
        }
    }
    function Ll(e, t) {
        for (; al !== null;) {
            let n = al;
            switch (n.tag) {
                case 0:
                case 11:
                case 15:
                    Uc(8, n, t);
                    break;
                case 23:
                case 22:
                    if (n.memoizedState !== null && n.memoizedState.cachePool !== null) {
                        var r = n.memoizedState.cachePool.pool;
                        r != null && r.refCount++;
                    }
                    break;
                case 24:
                    la(n.memoizedState.cache);
            }
            if (((r = n.child), r !== null)) ((r.return = n), (al = r));
            else {
                a: for (n = e; al !== null;) {
                    r = al;
                    const i = r.sibling;
                    const a = r.return;
                    if ((cl(r), r === n)) {
                        al = null;
                        break a;
                    }
                    if (i !== null) {
                        ((i.return = a), (al = i));
                        break a;
                    }
                    al = a;
                }
            }
        }
    }
    const Rl = {
        getCacheForType: function (e) {
            const t = ta(sa);
            let n = t.data.get(e);
            return (n === void 0 && ((n = e()), t.data.set(e, n)), n);
        },
        cacheSignal: function () {
            return ta(sa).controller.signal;
        }
    };
    const zl = typeof WeakMap === `function` ? WeakMap : Map;
    var G = 0;
    var K = null;
    let q = null;
    var J = 0;
    let Y = 0;
    let Bl = null;
    let Vl = !1;
    let Hl = !1;
    let Ul = !1;
    var Wl = 0;
    var Gl = 0;
    var Kl = 0;
    let ql = 0;
    let Jl = 0;
    var Yl = 0;
    var Xl = 0;
    var Zl = null;
    var Ql = null;
    let $l = !1;
    var eu = 0;
    var tu = 0;
    var nu = 1 / 0;
    let ru = null;
    var iu = null;
    let au = 0;
    let X = null;
    let ou = null;
    let su = 0;
    let cu = 0;
    let lu = null;
    let uu = null;
    var du = 0;
    var fu = null;
    function pu() {
        return G & 2 && J !== 0 ? J & -J : T.T === null ? ft() : dd();
    }
    function mu() {
        if (Yl === 0) {
            if (!(J & 536870912) || L) {
                var e = Ze;
                ((Ze <<= 1), !(Ze & 3932160) && (Ze = 262144), (Yl = e));
            } else Yl = 536870912;
        }
        return ((e = ro.current), e !== null && (e.flags |= 32), Yl);
    }
    function hu(e, t, n) {
        (((e === K && (Y === 2 || Y === 9)) || e.cancelPendingCommit !== null) && (Su(e, 0), yu(e, J, Yl, !1)),
            at(e, n),
            (!(G & 2) || e !== K) && (e === K && (!(G & 2) && (ql |= n), Gl === 4 && yu(e, J, Yl, !1)), rd(e)));
    }
    function gu(e, t, n) {
        if (G & 6) throw Error(i(327));
        let r = (!n && (t & 127) == 0 && (t & e.expiredLanes) === 0) || tt(e, t);
        let a = r ? Au(e, t) : Ou(e, t, !0);
        let o = r;
        do {
            if (a === 0) {
                Hl && !r && yu(e, t, 0, !1);
                break;
            } else {
                if (((n = e.current.alternate), o && !vu(n))) {
                    ((a = Ou(e, t, !1)), (o = !1));
                    continue;
                }
                if (a === 2) {
                    if (((o = t), e.errorRecoveryDisabledLanes & o)) var s = 0;
                    else ((s = e.pendingLanes & -536870913), (s = s === 0 ? (s & 536870912 ? 536870912 : 0) : s));
                    if (s !== 0) {
                        t = s;
                        a: {
                            const c = e;
                            a = Zl;
                            const l = c.current.memoizedState.isDehydrated;
                            if ((l && (Su(c, s).flags |= 256), (s = Ou(c, s, !1)), s !== 2)) {
                                if (Ul && !l) {
                                    ((c.errorRecoveryDisabledLanes |= o), (ql |= o), (a = 4));
                                    break a;
                                }
                                ((o = Ql), (Ql = a), o !== null && (Ql === null ? (Ql = o) : Ql.push.apply(Ql, o)));
                            }
                            a = s;
                        }
                        if (((o = !1), a !== 2)) continue;
                    }
                }
                if (a === 1) {
                    (Su(e, 0), yu(e, t, 0, !0));
                    break;
                }
                a: {
                    switch (((r = e), (o = a), o)) {
                        case 0:
                        case 1:
                            throw Error(i(345));
                        case 4:
                            if ((t & 4194048) !== t) break;
                        case 6:
                            yu(r, t, Yl, !Vl);
                            break a;
                        case 2:
                            Ql = null;
                            break;
                        case 3:
                        case 5:
                            break;
                        default:
                            throw Error(i(329));
                    }
                    if ((t & 62914560) === t && ((a = eu + 300 - Fe()), a > 10)) {
                        if ((yu(r, t, Yl, !Vl), et(r, 0, !0) !== 0)) break a;
                        ((su = t),
                            (r.timeoutHandle = Kd(
                                _u.bind(null, r, n, Ql, ru, $l, t, Yl, ql, Xl, Vl, o, `Throttled`, -0, 0),
                                a
                            )));
                        break a;
                    }
                    _u(r, n, Ql, ru, $l, t, Yl, ql, Xl, Vl, o, null, -0, 0);
                }
            }
            break;
        } while (1);
        rd(e);
    }
    function _u(e, t, n, r, i, a, o, s, c, l, u, d, f, p) {
        if (((e.timeoutHandle = -1), (d = t.subtreeFlags), d & 8192 || (d & 16785408) == 16785408)) {
            ((d = {
                stylesheets: null,
                count: 0,
                imgCount: 0,
                imgBytes: 0,
                suspenseyImages: [],
                waitingForImages: !0,
                waitingForViewTransition: !1,
                unsuspend: F
            }),
                Ml(t, a, d));
            let m = (a & 62914560) === a ? eu - Fe() : (a & 4194048) === a ? tu - Fe() : 0;
            if (((m = qf(d, m)), m !== null)) {
                ((su = a),
                    (e.cancelPendingCommit = m(Lu.bind(null, e, t, a, n, r, i, o, s, c, u, d, null, f, p))),
                    yu(e, a, o, !l));
                return;
            }
        }
        Lu(e, t, a, n, r, i, o, s, c);
    }
    function vu(e) {
        for (let t = e; ;) {
            let n = t.tag;
            if (
                (n === 0 || n === 11 || n === 15) &&
                t.flags & 16384 &&
                ((n = t.updateQueue), n !== null && ((n = n.stores), n !== null))
            ) {
                for (let r = 0; r < n.length; r++) {
                    let i = n[r];
                    const a = i.getSnapshot;
                    i = i.value;
                    try {
                        if (!Tr(a(), i)) return !1;
                    } catch {
                        return !1;
                    }
                }
            }
            if (((n = t.child), t.subtreeFlags & 16384 && n !== null)) ((n.return = t), (t = n));
            else {
                if (t === e) break;
                for (; t.sibling === null;) {
                    if (t.return === null || t.return === e) return !0;
                    t = t.return;
                }
                ((t.sibling.return = t.return), (t = t.sibling));
            }
        }
        return !0;
    }
    function yu(e, t, n, r) {
        ((t &= ~Jl),
            (t &= ~ql),
            (e.suspendedLanes |= t),
            (e.pingedLanes &= ~t),
            r && (e.warmLanes |= t),
            (r = e.expirationTimes));
        for (let i = t; i > 0;) {
            const a = 31 - Ke(i);
            const o = 1 << a;
            ((r[a] = -1), (i &= ~o));
        }
        n !== 0 && st(e, n, t);
    }
    function bu() {
        return G & 6 ? !0 : (id(0, !1), !1);
    }
    function xu() {
        if (q !== null) {
            if (Y === 0) var e = q.return;
            else ((e = q), (Ji = qi = null), ko(e), (Ma = null), (Na = 0), (e = q));
            for (; e !== null;) (Vc(e.alternate, e), (e = e.return));
            q = null;
        }
    }
    function Su(e, t) {
        let n = e.timeoutHandle;
        (n !== -1 && ((e.timeoutHandle = -1), qd(n)),
            (n = e.cancelPendingCommit),
            n !== null && ((e.cancelPendingCommit = null), n()),
            (su = 0),
            xu(),
            (K = e),
            (q = n = pi(e.current, null)),
            (J = t),
            (Y = 0),
            (Bl = null),
            (Vl = !1),
            (Hl = tt(e, t)),
            (Ul = !1),
            (Xl = Yl = Jl = ql = Kl = Gl = 0),
            (Ql = Zl = null),
            ($l = !1),
            t & 8 && (t |= t & 32));
        let r = e.entangledLanes;
        if (r !== 0) {
            for (e = e.entanglements, r &= t; r > 0;) {
                const i = 31 - Ke(r);
                const a = 1 << i;
                ((t |= e[i]), (r &= ~a));
            }
        }
        return ((Wl = t), ri(), n);
    }
    function Cu(e, t) {
        ((B = null),
            (T.H = zs),
            t === Sa || t === wa
                ? ((t = Aa()), (Y = 3))
                : t === Ca
                  ? ((t = Aa()), (Y = 4))
                  : (Y = t === rc ? 8 : typeof t === `object` && t && typeof t.then === `function` ? 6 : 1),
            (Bl = t),
            q === null && ((Gl = 1), Zs(e, xi(t, e.current))));
    }
    function wu() {
        const e = ro.current;
        return e === null
            ? !0
            : (J & 4194048) === J
              ? io === null
              : (J & 62914560) === J || J & 536870912
                ? e === io
                : !1;
    }
    function Tu() {
        const e = T.H;
        return ((T.H = zs), e === null ? zs : e);
    }
    function Eu() {
        const e = T.A;
        return ((T.A = Rl), e);
    }
    function Du() {
        ((Gl = 4),
            Vl || ((J & 4194048) !== J && ro.current !== null) || (Hl = !0),
            (!(Kl & 134217727) && !(ql & 134217727)) || K === null || yu(K, J, Yl, !1));
    }
    function Ou(e, t, n) {
        const r = G;
        G |= 2;
        const i = Tu();
        const a = Eu();
        ((K !== e || J !== t) && ((ru = null), Su(e, t)), (t = !1));
        let o = Gl;
        a: do {
            try {
                if (Y !== 0 && q !== null) {
                    const s = q;
                    const c = Bl;
                    switch (Y) {
                        case 8:
                            (xu(), (o = 6));
                            break a;
                        case 3:
                        case 2:
                        case 9:
                        case 6:
                            ro.current === null && (t = !0);
                            var l = Y;
                            if (((Y = 0), (Bl = null), Pu(e, s, c, l), n && Hl)) {
                                o = 0;
                                break a;
                            }
                            break;
                        default:
                            ((l = Y), (Y = 0), (Bl = null), Pu(e, s, c, l));
                    }
                }
                (ku(), (o = Gl));
                break;
            } catch (t) {
                Cu(e, t);
            }
        } while (1);
        return (
            t && e.shellSuspendCounter++,
            (Ji = qi = null),
            (G = r),
            (T.H = i),
            (T.A = a),
            q === null && ((K = null), (J = 0), ri()),
            o
        );
    }
    function ku() {
        for (; q !== null;) Mu(q);
    }
    function Au(e, t) {
        const n = G;
        G |= 2;
        const r = Tu();
        const a = Eu();
        K !== e || J !== t ? ((ru = null), (nu = Fe() + 500), Su(e, t)) : (Hl = tt(e, t));
        a: do {
            try {
                if (Y !== 0 && q !== null) {
                    t = q;
                    const o = Bl;
                    b: switch (Y) {
                        case 1:
                            ((Y = 0), (Bl = null), Pu(e, t, o, 1));
                            break;
                        case 2:
                        case 9:
                            if (Ea(o)) {
                                ((Y = 0), (Bl = null), Nu(t));
                                break;
                            }
                            ((t = function () {
                                ((Y !== 2 && Y !== 9) || K !== e || (Y = 7), rd(e));
                            }),
                                o.then(t, t));
                            break a;
                        case 3:
                            Y = 7;
                            break a;
                        case 4:
                            Y = 5;
                            break a;
                        case 7:
                            Ea(o) ? ((Y = 0), (Bl = null), Nu(t)) : ((Y = 0), (Bl = null), Pu(e, t, o, 7));
                            break;
                        case 5:
                            var s = null;
                            switch (q.tag) {
                                case 26:
                                    s = q.memoizedState;
                                case 5:
                                case 27:
                                    var c = q;
                                    if (s ? Wf(s) : c.stateNode.complete) {
                                        ((Y = 0), (Bl = null));
                                        const l = c.sibling;
                                        if (l !== null) q = l;
                                        else {
                                            const u = c.return;
                                            u === null ? (q = null) : ((q = u), Fu(u));
                                        }
                                        break b;
                                    }
                            }
                            ((Y = 0), (Bl = null), Pu(e, t, o, 5));
                            break;
                        case 6:
                            ((Y = 0), (Bl = null), Pu(e, t, o, 6));
                            break;
                        case 8:
                            (xu(), (Gl = 6));
                            break a;
                        default:
                            throw Error(i(462));
                    }
                }
                ju();
                break;
            } catch (t) {
                Cu(e, t);
            }
        } while (1);
        return ((Ji = qi = null), (T.H = r), (T.A = a), (G = n), q === null ? ((K = null), (J = 0), ri(), Gl) : 0);
    }
    function ju() {
        for (; q !== null && !Ne();) Mu(q);
    }
    function Mu(e) {
        const t = Nc(e.alternate, e, Wl);
        ((e.memoizedProps = e.pendingProps), t === null ? Fu(e) : (q = t));
    }
    function Nu(e) {
        let t = e;
        const n = t.alternate;
        switch (t.tag) {
            case 15:
            case 0:
                t = _c(n, t, t.pendingProps, t.type, void 0, J);
                break;
            case 11:
                t = _c(n, t, t.pendingProps, t.type.render, t.ref, J);
                break;
            case 5:
                ko(t);
            default:
                (Vc(n, t), (t = q = mi(t, Wl)), (t = Nc(n, t, Wl)));
        }
        ((e.memoizedProps = e.pendingProps), t === null ? Fu(e) : (q = t));
    }
    function Pu(e, t, n, r) {
        ((Ji = qi = null), ko(t), (Ma = null), (Na = 0));
        const i = t.return;
        try {
            if (nc(e, i, t, n, J)) {
                ((Gl = 1), Zs(e, xi(n, e.current)), (q = null));
                return;
            }
        } catch (t) {
            if (i !== null) throw ((q = i), t);
            ((Gl = 1), Zs(e, xi(n, e.current)), (q = null));
            return;
        }
        t.flags & 32768
            ? (L || r === 1
                  ? (e = !0)
                  : Hl || J & 536870912
                    ? (e = !1)
                    : ((Vl = e = !0),
                      (r === 2 || r === 9 || r === 3 || r === 6) &&
                          ((r = ro.current), r !== null && r.tag === 13 && (r.flags |= 16384))),
              Iu(t, e))
            : Fu(t);
    }
    function Fu(e) {
        let t = e;
        do {
            if (t.flags & 32768) {
                Iu(t, Vl);
                return;
            }
            e = t.return;
            const n = zc(t.alternate, t, Wl);
            if (n !== null) {
                q = n;
                return;
            }
            if (((t = t.sibling), t !== null)) {
                q = t;
                return;
            }
            q = t = e;
        } while (t !== null);
        Gl === 0 && (Gl = 5);
    }
    function Iu(e, t) {
        do {
            let n = Bc(e.alternate, e);
            if (n !== null) {
                ((n.flags &= 32767), (q = n));
                return;
            }
            if (
                ((n = e.return),
                n !== null && ((n.flags |= 32768), (n.subtreeFlags = 0), (n.deletions = null)),
                !t && ((e = e.sibling), e !== null))
            ) {
                q = e;
                return;
            }
            q = e = n;
        } while (e !== null);
        ((Gl = 6), (q = null));
    }
    function Lu(e, t, n, r, a, o, s, c, l) {
        e.cancelPendingCommit = null;
        do Hu();
        while (au !== 0);
        if (G & 6) throw Error(i(327));
        if (t !== null) {
            if (t === e.current) throw Error(i(177));
            if (
                ((o = t.lanes | t.childLanes),
                (o |= ni),
                ot(e, n, o, s, c, l),
                e === K && ((q = K = null), (J = 0)),
                (ou = t),
                (X = e),
                (su = n),
                (cu = o),
                (lu = a),
                (uu = r),
                t.subtreeFlags & 10256 || t.flags & 10256
                    ? ((e.callbackNode = null),
                      (e.callbackPriority = 0),
                      Xu(ze, function () {
                          return (Uu(), null);
                      }))
                    : ((e.callbackNode = null), (e.callbackPriority = 0)),
                (r = (t.flags & 13878) != 0),
                t.subtreeFlags & 13878 || r)
            ) {
                ((r = T.T), (T.T = null), (a = E.p), (E.p = 2), (s = G), (G |= 4));
                try {
                    ol(e, t, n);
                } finally {
                    ((G = s), (E.p = a), (T.T = r));
                }
            }
            ((au = 1), Ru(), zu(), Bu());
        }
    }
    function Ru() {
        if (au === 1) {
            au = 0;
            const e = X;
            const t = ou;
            let n = (t.flags & 13878) != 0;
            if (t.subtreeFlags & 13878 || n) {
                ((n = T.T), (T.T = null));
                const r = E.p;
                E.p = 2;
                const i = G;
                G |= 4;
                try {
                    vl(t, e);
                    const a = zd;
                    let o = Ar(e.containerInfo);
                    let s = a.focusedElem;
                    const c = a.selectionRange;
                    if (o !== s && s && s.ownerDocument && kr(s.ownerDocument.documentElement, s)) {
                        if (c !== null && jr(s)) {
                            const l = c.start;
                            let u = c.end;
                            if ((u === void 0 && (u = l), `selectionStart` in s)) {
                                ((s.selectionStart = l), (s.selectionEnd = Math.min(u, s.value.length)));
                            } else {
                                var d = s.ownerDocument || document;
                                const f = (d && d.defaultView) || window;
                                if (f.getSelection) {
                                    var p = f.getSelection();
                                    const m = s.textContent.length;
                                    let h = Math.min(c.start, m);
                                    let g = c.end === void 0 ? h : Math.min(c.end, m);
                                    !p.extend && h > g && ((o = g), (g = h), (h = o));
                                    const _ = Or(s, h);
                                    const v = Or(s, g);
                                    if (
                                        _ &&
                                        v &&
                                        (p.rangeCount !== 1 ||
                                            p.anchorNode !== _.node ||
                                            p.anchorOffset !== _.offset ||
                                            p.focusNode !== v.node ||
                                            p.focusOffset !== v.offset)
                                    ) {
                                        const y = d.createRange();
                                        (y.setStart(_.node, _.offset),
                                            p.removeAllRanges(),
                                            h > g
                                                ? (p.addRange(y), p.extend(v.node, v.offset))
                                                : (y.setEnd(v.node, v.offset), p.addRange(y)));
                                    }
                                }
                            }
                        }
                        for (d = [], p = s; (p = p.parentNode);) {
                            p.nodeType === 1 && d.push({ element: p, left: p.scrollLeft, top: p.scrollTop });
                        }
                        for (typeof s.focus === `function` && s.focus(), s = 0; s < d.length; s++) {
                            const b = d[s];
                            ((b.element.scrollLeft = b.left), (b.element.scrollTop = b.top));
                        }
                    }
                    ((sp = !!Rd), (zd = Rd = null));
                } finally {
                    ((G = i), (E.p = r), (T.T = n));
                }
            }
            ((e.current = t), (au = 2));
        }
    }
    function zu() {
        if (au === 2) {
            au = 0;
            const e = X;
            const t = ou;
            let n = (t.flags & 8772) != 0;
            if (t.subtreeFlags & 8772 || n) {
                ((n = T.T), (T.T = null));
                const r = E.p;
                E.p = 2;
                const i = G;
                G |= 4;
                try {
                    sl(e, t.alternate, t);
                } finally {
                    ((G = i), (E.p = r), (T.T = n));
                }
            }
            au = 3;
        }
    }
    function Bu() {
        if (au === 4 || au === 3) {
            ((au = 0), Pe());
            const e = X;
            let t = ou;
            const n = su;
            const r = uu;
            t.subtreeFlags & 10256 || t.flags & 10256 ? (au = 5) : ((au = 0), (ou = X = null), Vu(e, e.pendingLanes));
            let i = e.pendingLanes;
            if ((i === 0 && (iu = null), dt(n), (t = t.stateNode), We && typeof We.onCommitFiberRoot === `function`)) {
                try {
                    We.onCommitFiberRoot(Ue, t, void 0, (t.current.flags & 128) == 128);
                } catch {}
            }
            if (r !== null) {
                ((t = T.T), (i = E.p), (E.p = 2), (T.T = null));
                try {
                    for (let a = e.onRecoverableError, o = 0; o < r.length; o++) {
                        const s = r[o];
                        a(s.value, { componentStack: s.stack });
                    }
                } finally {
                    ((T.T = t), (E.p = i));
                }
            }
            (su & 3 && Hu(),
                rd(e),
                (i = e.pendingLanes),
                n & 261930 && i & 42 ? (e === fu ? du++ : ((du = 0), (fu = e))) : (du = 0),
                id(0, !1));
        }
    }
    function Vu(e, t) {
        (e.pooledCacheLanes &= t) === 0 && ((t = e.pooledCache), t != null && ((e.pooledCache = null), la(t)));
    }
    function Hu() {
        return (Ru(), zu(), Bu(), Uu());
    }
    function Uu() {
        if (au !== 5) return !1;
        const e = X;
        const t = cu;
        cu = 0;
        let n = dt(su);
        const r = T.T;
        const a = E.p;
        try {
            ((E.p = n < 32 ? 32 : n), (T.T = null), (n = lu), (lu = null));
            const o = X;
            const s = su;
            if (((au = 0), (ou = X = null), (su = 0), G & 6)) throw Error(i(331));
            const c = G;
            if (
                ((G |= 4),
                Fl(o.current),
                Dl(o, o.current, s, n),
                (G = c),
                id(0, !1),
                We && typeof We.onPostCommitFiberRoot === `function`)
            ) {
                try {
                    We.onPostCommitFiberRoot(Ue, o);
                } catch {}
            }
            return !0;
        } finally {
            ((E.p = a), (T.T = r), Vu(e, t));
        }
    }
    function Wu(e, t, n) {
        ((t = xi(n, t)), (t = $s(e.stateNode, t, 2)), (e = Wa(e, t, 2)), e !== null && (at(e, 2), rd(e)));
    }
    function Z(e, t, n) {
        if (e.tag === 3) Wu(e, e, n);
        else {
            for (; t !== null;) {
                if (t.tag === 3) {
                    Wu(t, e, n);
                    break;
                } else if (t.tag === 1) {
                    let r = t.stateNode;
                    if (
                        typeof t.type.getDerivedStateFromError === `function` ||
                        (typeof r.componentDidCatch === `function` && (iu === null || !iu.has(r)))
                    ) {
                        ((e = xi(n, e)),
                            (n = ec(2)),
                            (r = Wa(t, n, 2)),
                            r !== null && (tc(n, r, t, e), at(r, 2), rd(r)));
                        break;
                    }
                }
                t = t.return;
            }
        }
    }
    function Gu(e, t, n) {
        let r = e.pingCache;
        if (r === null) {
            r = e.pingCache = new zl();
            var i = new Set();
            r.set(t, i);
        } else ((i = r.get(t)), i === void 0 && ((i = new Set()), r.set(t, i)));
        i.has(n) || ((Ul = !0), i.add(n), (e = Ku.bind(null, e, t, n)), t.then(e, e));
    }
    function Ku(e, t, n) {
        const r = e.pingCache;
        (r !== null && r.delete(t),
            (e.pingedLanes |= e.suspendedLanes & n),
            (e.warmLanes &= ~n),
            K === e &&
                (J & n) === n &&
                (Gl === 4 || (Gl === 3 && (J & 62914560) === J && Fe() - eu < 300) ? !(G & 2) && Su(e, 0) : (Jl |= n),
                Xl === J && (Xl = 0)),
            rd(e));
    }
    function qu(e, t) {
        (t === 0 && (t = rt()), (e = oi(e, t)), e !== null && (at(e, t), rd(e)));
    }
    function Ju(e) {
        const t = e.memoizedState;
        let n = 0;
        (t !== null && (n = t.retryLane), qu(e, n));
    }
    function Yu(e, t) {
        let n = 0;
        switch (e.tag) {
            case 31:
            case 13:
                var r = e.stateNode;
                var a = e.memoizedState;
                a !== null && (n = a.retryLane);
                break;
            case 19:
                r = e.stateNode;
                break;
            case 22:
                r = e.stateNode._retryCache;
                break;
            default:
                throw Error(i(314));
        }
        (r !== null && r.delete(t), qu(e, n));
    }
    function Xu(e, t) {
        return je(e, t);
    }
    let Zu = null;
    let Qu = null;
    let $u = !1;
    let ed = !1;
    let td = !1;
    let nd = 0;
    function rd(e) {
        (e !== Qu && e.next === null && (Qu === null ? (Zu = Qu = e) : (Qu = Qu.next = e)),
            (ed = !0),
            $u || (($u = !0), ud()));
    }
    function id(e, t) {
        if (!td && ed) {
            td = !0;
            do {
                for (var n = !1, r = Zu; r !== null;) {
                    if (!t) {
                        if (e !== 0) {
                            const i = r.pendingLanes;
                            if (i === 0) var a = 0;
                            else {
                                const o = r.suspendedLanes;
                                const s = r.pingedLanes;
                                ((a = (1 << (31 - Ke(42 | e) + 1)) - 1),
                                    (a &= i & ~(o & ~s)),
                                    (a = a & 201326741 ? (a & 201326741) | 1 : a ? a | 2 : 0));
                            }
                            a !== 0 && ((n = !0), ld(r, a));
                        } else {
                            ((a = J),
                                (a = et(r, r === K ? a : 0, r.cancelPendingCommit !== null || r.timeoutHandle !== -1)),
                                !(a & 3) || tt(r, a) || ((n = !0), ld(r, a)));
                        }
                    }
                    r = r.next;
                }
            } while (n);
            td = !1;
        }
    }
    function ad() {
        od();
    }
    function od() {
        ed = $u = !1;
        let e = 0;
        nd !== 0 && Gd() && (e = nd);
        for (let t = Fe(), n = null, r = Zu; r !== null;) {
            const i = r.next;
            const a = sd(r, t);
            (a === 0
                ? ((r.next = null), n === null ? (Zu = i) : (n.next = i), i === null && (Qu = n))
                : ((n = r), (e !== 0 || a & 3) && (ed = !0)),
                (r = i));
        }
        ((au !== 0 && au !== 5) || id(e, !1), nd !== 0 && (nd = 0));
    }
    function sd(e, t) {
        for (
            var n = e.suspendedLanes, r = e.pingedLanes, i = e.expirationTimes, a = e.pendingLanes & -62914561;
            a > 0;
        ) {
            const o = 31 - Ke(a);
            const s = 1 << o;
            const c = i[o];
            (c === -1 ? ((s & n) === 0 || (s & r) !== 0) && (i[o] = nt(s, t)) : c <= t && (e.expiredLanes |= s),
                (a &= ~s));
        }
        if (
            ((t = K),
            (n = J),
            (n = et(e, e === t ? n : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1)),
            (r = e.callbackNode),
            n === 0 || (e === t && (Y === 2 || Y === 9)) || e.cancelPendingCommit !== null)
        ) {
            return (r !== null && r !== null && Me(r), (e.callbackNode = null), (e.callbackPriority = 0));
        }
        if (!(n & 3) || tt(e, n)) {
            if (((t = n & -n), t === e.callbackPriority)) return t;
            switch ((r !== null && Me(r), dt(n))) {
                case 2:
                case 8:
                    n = Re;
                    break;
                case 32:
                    n = ze;
                    break;
                case 268435456:
                    n = Ve;
                    break;
                default:
                    n = ze;
            }
            return ((r = cd.bind(null, e)), (n = je(n, r)), (e.callbackPriority = t), (e.callbackNode = n), t);
        }
        return (r !== null && r !== null && Me(r), (e.callbackPriority = 2), (e.callbackNode = null), 2);
    }
    function cd(e, t) {
        if (au !== 0 && au !== 5) return ((e.callbackNode = null), (e.callbackPriority = 0), null);
        const n = e.callbackNode;
        if (Hu() && e.callbackNode !== n) return null;
        let r = J;
        return (
            (r = et(e, e === K ? r : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1)),
            r === 0
                ? null
                : (gu(e, r, t), sd(e, Fe()), e.callbackNode != null && e.callbackNode === n ? cd.bind(null, e) : null)
        );
    }
    function ld(e, t) {
        if (Hu()) return null;
        gu(e, t, !0);
    }
    function ud() {
        Yd(function () {
            G & 6 ? je(Le, ad) : od();
        });
    }
    function dd() {
        if (nd === 0) {
            let e = fa;
            (e === 0 && ((e = Xe), (Xe <<= 1), !(Xe & 261888) && (Xe = 256)), (nd = e));
        }
        return nd;
    }
    function fd(e) {
        return e == null || typeof e === `symbol` || typeof e === `boolean`
            ? null
            : typeof e === `function`
              ? e
              : nn(`` + e);
    }
    function pd(e, t) {
        const n = t.ownerDocument.createElement(`input`);
        return (
            (n.name = t.name),
            (n.value = t.value),
            e.id && n.setAttribute(`form`, e.id),
            t.parentNode.insertBefore(n, t),
            (e = new FormData(e)),
            n.parentNode.removeChild(n),
            e
        );
    }
    function md(e, t, n, r, i) {
        if (t === `submit` && n && n.stateNode === i) {
            let a = fd((i[j] || null).action);
            let o = r.submitter;
            o &&
                ((t = (t = o[j] || null) ? fd(t.formAction) : o.getAttribute(`formAction`)),
                t !== null && ((a = t), (o = null)));
            const s = new wn(`action`, `action`, null, r, i);
            e.push({
                event: s,
                listeners: [
                    {
                        instance: null,
                        listener: function () {
                            if (r.defaultPrevented) {
                                if (nd !== 0) {
                                    var e = o ? pd(i, o) : new FormData(i);
                                    Ts(n, { pending: !0, data: e, method: i.method, action: a }, null, e);
                                }
                            } else {
                                typeof a === `function` &&
                                    (s.preventDefault(),
                                    (e = o ? pd(i, o) : new FormData(i)),
                                    Ts(n, { pending: !0, data: e, method: i.method, action: a }, a, e));
                            }
                        },
                        currentTarget: i
                    }
                ]
            });
        }
    }
    for (let hd = 0; hd < Zr.length; hd++) {
        const gd = Zr[hd];
        Qr(gd.toLowerCase(), `on` + (gd[0].toUpperCase() + gd.slice(1)));
    }
    (Qr(Ur, `onAnimationEnd`),
        Qr(Wr, `onAnimationIteration`),
        Qr(Gr, `onAnimationStart`),
        Qr(`dblclick`, `onDoubleClick`),
        Qr(`focusin`, `onFocus`),
        Qr(`focusout`, `onBlur`),
        Qr(Kr, `onTransitionRun`),
        Qr(qr, `onTransitionStart`),
        Qr(Jr, `onTransitionCancel`),
        Qr(Yr, `onTransitionEnd`),
        Ot(`onMouseEnter`, [`mouseout`, `mouseover`]),
        Ot(`onMouseLeave`, [`mouseout`, `mouseover`]),
        Ot(`onPointerEnter`, [`pointerout`, `pointerover`]),
        Ot(`onPointerLeave`, [`pointerout`, `pointerover`]),
        Dt(`onChange`, `change click focusin focusout input keydown keyup selectionchange`.split(` `)),
        Dt(
            `onSelect`,
            `focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange`.split(` `)
        ),
        Dt(`onBeforeInput`, [`compositionend`, `keypress`, `textInput`, `paste`]),
        Dt(`onCompositionEnd`, `compositionend focusout keydown keypress keyup mousedown`.split(` `)),
        Dt(`onCompositionStart`, `compositionstart focusout keydown keypress keyup mousedown`.split(` `)),
        Dt(`onCompositionUpdate`, `compositionupdate focusout keydown keypress keyup mousedown`.split(` `)));
    var _d =
        `abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting`.split(
            ` `
        );
    const vd = new Set(`beforetoggle cancel close invalid load scroll scrollend toggle`.split(` `).concat(_d));
    function yd(e, t) {
        t = (t & 4) != 0;
        for (let n = 0; n < e.length; n++) {
            let r = e[n];
            const i = r.event;
            r = r.listeners;
            a: {
                let a = void 0;
                if (t) {
                    for (var o = r.length - 1; o >= 0; o--) {
                        var s = r[o];
                        var c = s.instance;
                        var l = s.currentTarget;
                        if (((s = s.listener), c !== a && i.isPropagationStopped())) break a;
                        ((a = s), (i.currentTarget = l));
                        try {
                            a(i);
                        } catch (e) {
                            $r(e);
                        }
                        ((i.currentTarget = null), (a = c));
                    }
                } else {
                    for (o = 0; o < r.length; o++) {
                        if (
                            ((s = r[o]),
                            (c = s.instance),
                            (l = s.currentTarget),
                            (s = s.listener),
                            c !== a && i.isPropagationStopped())
                        ) {
                            break a;
                        }
                        ((a = s), (i.currentTarget = l));
                        try {
                            a(i);
                        } catch (e) {
                            $r(e);
                        }
                        ((i.currentTarget = null), (a = c));
                    }
                }
            }
        }
    }
    function Q(e, t) {
        let n = t[ht];
        n === void 0 && (n = t[ht] = new Set());
        const r = e + `__bubble`;
        n.has(r) || (Cd(t, e, 2, !1), n.add(r));
    }
    function bd(e, t, n) {
        let r = 0;
        (t && (r |= 4), Cd(n, e, r, t));
    }
    const xd = `_reactListening` + Math.random().toString(36).slice(2);
    function Sd(e) {
        if (!e[xd]) {
            ((e[xd] = !0),
                Tt.forEach(function (t) {
                    t !== `selectionchange` && (vd.has(t) || bd(t, !1, e), bd(t, !0, e));
                }));
            const t = e.nodeType === 9 ? e : e.ownerDocument;
            t === null || t[xd] || ((t[xd] = !0), bd(`selectionchange`, !1, t));
        }
    }
    function Cd(e, t, n, r) {
        switch (mp(t)) {
            case 2:
                var i = cp;
                break;
            case 8:
                i = lp;
                break;
            default:
                i = up;
        }
        ((n = i.bind(null, t, n, e)),
            (i = void 0),
            !pn || (t !== `touchstart` && t !== `touchmove` && t !== `wheel`) || (i = !0),
            r
                ? i === void 0
                    ? e.addEventListener(t, n, !0)
                    : e.addEventListener(t, n, { capture: !0, passive: i })
                : i === void 0
                  ? e.addEventListener(t, n, !1)
                  : e.addEventListener(t, n, { passive: i }));
    }
    function wd(e, t, n, r, i) {
        let a = r;
        if (!(t & 1) && !(t & 2) && r !== null) {
            a: for (;;) {
                if (r === null) return;
                let s = r.tag;
                if (s === 3 || s === 4) {
                    let c = r.stateNode.containerInfo;
                    if (c === i) break;
                    if (s === 4) {
                        for (s = r.return; s !== null;) {
                            var l = s.tag;
                            if ((l === 3 || l === 4) && s.stateNode.containerInfo === i) return;
                            s = s.return;
                        }
                    }
                    for (; c !== null;) {
                        if (((s = bt(c)), s === null)) return;
                        if (((l = s.tag), l === 5 || l === 6 || l === 26 || l === 27)) {
                            r = a = s;
                            continue a;
                        }
                        c = c.parentNode;
                    }
                }
                r = r.return;
            }
        }
        un(function () {
            const r = a;
            const i = an(n);
            const s = [];
            a: {
                var c = Xr.get(e);
                if (c !== void 0) {
                    var l = wn;
                    var u = e;
                    switch (e) {
                        case `keypress`:
                            if (yn(n) === 0) break a;
                        case `keydown`:
                        case `keyup`:
                            l = Hn;
                            break;
                        case `focusin`:
                            ((u = `focus`), (l = Nn));
                            break;
                        case `focusout`:
                            ((u = `blur`), (l = Nn));
                            break;
                        case `beforeblur`:
                        case `afterblur`:
                            l = Nn;
                            break;
                        case `click`:
                            if (n.button === 2) break a;
                        case `auxclick`:
                        case `dblclick`:
                        case `mousedown`:
                        case `mousemove`:
                        case `mouseup`:
                        case `mouseout`:
                        case `mouseover`:
                        case `contextmenu`:
                            l = jn;
                            break;
                        case `drag`:
                        case `dragend`:
                        case `dragenter`:
                        case `dragexit`:
                        case `dragleave`:
                        case `dragover`:
                        case `dragstart`:
                        case `drop`:
                            l = Mn;
                            break;
                        case `touchcancel`:
                        case `touchend`:
                        case `touchmove`:
                        case `touchstart`:
                            l = Wn;
                            break;
                        case Ur:
                        case Wr:
                        case Gr:
                            l = Pn;
                            break;
                        case Yr:
                            l = Gn;
                            break;
                        case `scroll`:
                        case `scrollend`:
                            l = En;
                            break;
                        case `wheel`:
                            l = Kn;
                            break;
                        case `copy`:
                        case `cut`:
                        case `paste`:
                            l = Fn;
                            break;
                        case `gotpointercapture`:
                        case `lostpointercapture`:
                        case `pointercancel`:
                        case `pointerdown`:
                        case `pointermove`:
                        case `pointerout`:
                        case `pointerover`:
                        case `pointerup`:
                            l = Un;
                            break;
                        case `toggle`:
                        case `beforetoggle`:
                            l = qn;
                    }
                    var d = (t & 4) != 0;
                    var f = !d && (e === `scroll` || e === `scrollend`);
                    var p = d ? (c === null ? null : c + `Capture`) : c;
                    d = [];
                    for (var m = r, h; m !== null;) {
                        var g = m;
                        if (
                            ((h = g.stateNode),
                            (g = g.tag),
                            (g !== 5 && g !== 26 && g !== 27) ||
                                h === null ||
                                p === null ||
                                ((g = dn(m, p)), g != null && d.push(Td(m, g, h))),
                            f)
                        ) {
                            break;
                        }
                        m = m.return;
                    }
                    d.length > 0 && ((c = new l(c, u, null, n, i)), s.push({ event: c, listeners: d }));
                }
            }
            if (!(t & 7)) {
                a: {
                    if (
                        ((c = e === `mouseover` || e === `pointerover`),
                        (l = e === `mouseout` || e === `pointerout`),
                        c && n !== rn && (u = n.relatedTarget || n.fromElement) && (bt(u) || u[M]))
                    ) {
                        break a;
                    }
                    if (
                        (l || c) &&
                        ((c = i.window === i ? i : (c = i.ownerDocument) ? c.defaultView || c.parentWindow : window),
                        l
                            ? ((u = n.relatedTarget || n.toElement),
                              (l = r),
                              (u = u ? bt(u) : null),
                              u !== null &&
                                  ((f = o(u)), (d = u.tag), u !== f || (d !== 5 && d !== 27 && d !== 6)) &&
                                  (u = null))
                            : ((l = null), (u = r)),
                        l !== u)
                    ) {
                        if (
                            ((d = jn),
                            (g = `onMouseLeave`),
                            (p = `onMouseEnter`),
                            (m = `mouse`),
                            (e === `pointerout` || e === `pointerover`) &&
                                ((d = Un), (g = `onPointerLeave`), (p = `onPointerEnter`), (m = `pointer`)),
                            (f = l == null ? c : St(l)),
                            (h = u == null ? c : St(u)),
                            (c = new d(g, m + `leave`, l, n, i)),
                            (c.target = f),
                            (c.relatedTarget = h),
                            (g = null),
                            bt(i) === r &&
                                ((d = new d(p, m + `enter`, u, n, i)), (d.target = h), (d.relatedTarget = f), (g = d)),
                            (f = g),
                            l && u)
                        ) {
                            b: {
                                for (d = Dd, p = l, m = u, h = 0, g = p; g; g = d(g)) h++;
                                g = 0;
                                for (let _ = m; _; _ = d(_)) g++;
                                for (; h - g > 0;) ((p = d(p)), h--);
                                for (; g - h > 0;) ((m = d(m)), g--);
                                for (; h--;) {
                                    if (p === m || (m !== null && p === m.alternate)) {
                                        d = p;
                                        break b;
                                    }
                                    ((p = d(p)), (m = d(m)));
                                }
                                d = null;
                            }
                        } else d = null;
                        (l !== null && Od(s, c, l, d, !1), u !== null && f !== null && Od(s, f, u, d, !0));
                    }
                }
                a: {
                    if (
                        ((c = r ? St(r) : window),
                        (l = c.nodeName && c.nodeName.toLowerCase()),
                        l === `select` || (l === `input` && c.type === `file`))
                    ) {
                        var v = pr;
                    } else if (sr(c)) {
                        if (mr) v = Cr;
                        else {
                            v = xr;
                            var y = br;
                        }
                    } else {
                        ((l = c.nodeName),
                            !l || l.toLowerCase() !== `input` || (c.type !== `checkbox` && c.type !== `radio`)
                                ? r && $t(r.elementType) && (v = pr)
                                : (v = Sr));
                    }
                    if ((v &&= v(e, r))) {
                        cr(s, v, n, i);
                        break a;
                    }
                    (y && y(e, c, r),
                        e === `focusout` &&
                            r &&
                            c.type === `number` &&
                            r.memoizedProps.value != null &&
                            Gt(c, `number`, c.value));
                }
                switch (((y = r ? St(r) : window), e)) {
                    case `focusin`:
                        (sr(y) || y.contentEditable === `true`) && ((Nr = y), (Pr = r), (Fr = null));
                        break;
                    case `focusout`:
                        Fr = Pr = Nr = null;
                        break;
                    case `mousedown`:
                        Ir = !0;
                        break;
                    case `contextmenu`:
                    case `mouseup`:
                    case `dragend`:
                        ((Ir = !1), Lr(s, n, i));
                        break;
                    case `selectionchange`:
                        if (Mr) break;
                    case `keydown`:
                    case `keyup`:
                        Lr(s, n, i);
                }
                let b;
                if (Yn) {
                    b: {
                        switch (e) {
                            case `compositionstart`:
                                var x = `onCompositionStart`;
                                break b;
                            case `compositionend`:
                                x = `onCompositionEnd`;
                                break b;
                            case `compositionupdate`:
                                x = `onCompositionUpdate`;
                                break b;
                        }
                        x = void 0;
                    }
                } else {
                    rr
                        ? tr(e, n) && (x = `onCompositionEnd`)
                        : e === `keydown` && n.keyCode === 229 && (x = `onCompositionStart`);
                }
                (x &&
                    (Qn &&
                        n.locale !== `ko` &&
                        (rr || x !== `onCompositionStart`
                            ? x === `onCompositionEnd` && rr && (b = vn())
                            : ((hn = i), (gn = `value` in hn ? hn.value : hn.textContent), (rr = !0))),
                    (y = Ed(r, x)),
                    y.length > 0 &&
                        ((x = new In(x, e, null, n, i)),
                        s.push({ event: x, listeners: y }),
                        b ? (x.data = b) : ((b = nr(n)), b !== null && (x.data = b)))),
                    (b = Zn ? ir(e, n) : ar(e, n)) &&
                        ((x = Ed(r, `onBeforeInput`)),
                        x.length > 0 &&
                            ((y = new In(`onBeforeInput`, `beforeinput`, null, n, i)),
                            s.push({ event: y, listeners: x }),
                            (y.data = b))),
                    md(s, e, r, n, i));
            }
            yd(s, t);
        });
    }
    function Td(e, t, n) {
        return { instance: e, listener: t, currentTarget: n };
    }
    function Ed(e, t) {
        for (let n = t + `Capture`, r = []; e !== null;) {
            let i = e;
            const a = i.stateNode;
            if (
                ((i = i.tag),
                (i !== 5 && i !== 26 && i !== 27) ||
                    a === null ||
                    ((i = dn(e, n)),
                    i != null && r.unshift(Td(e, i, a)),
                    (i = dn(e, t)),
                    i != null && r.push(Td(e, i, a))),
                e.tag === 3)
            ) {
                return r;
            }
            e = e.return;
        }
        return [];
    }
    function Dd(e) {
        if (e === null) return null;
        do e = e.return;
        while (e && e.tag !== 5 && e.tag !== 27);
        return e || null;
    }
    function Od(e, t, n, r, i) {
        for (var a = t._reactName, o = []; n !== null && n !== r;) {
            let s = n;
            let c = s.alternate;
            let l = s.stateNode;
            if (((s = s.tag), c !== null && c === r)) break;
            ((s !== 5 && s !== 26 && s !== 27) ||
                l === null ||
                ((c = l),
                i
                    ? ((l = dn(n, a)), l != null && o.unshift(Td(n, l, c)))
                    : i || ((l = dn(n, a)), l != null && o.push(Td(n, l, c)))),
                (n = n.return));
        }
        o.length !== 0 && e.push({ event: t, listeners: o });
    }
    const kd = /\r\n?/g;
    const Ad = /\u0000|\uFFFD/g;
    function jd(e) {
        return (typeof e === `string` ? e : `` + e)
            .replace(
                kd,
                `
`
            )
            .replace(Ad, ``);
    }
    function Md(e, t) {
        return ((t = jd(t)), jd(e) === t);
    }
    function $(e, t, n, r, a, o) {
        switch (n) {
            case `children`:
                typeof r === `string`
                    ? t === `body` || (t === `textarea` && r === ``) || Yt(e, r)
                    : (typeof r === `number` || typeof r === `bigint`) && t !== `body` && Yt(e, `` + r);
                break;
            case `className`:
                Pt(e, `class`, r);
                break;
            case `tabIndex`:
                Pt(e, `tabindex`, r);
                break;
            case `dir`:
            case `role`:
            case `viewBox`:
            case `width`:
            case `height`:
                Pt(e, n, r);
                break;
            case `style`:
                Qt(e, r, o);
                break;
            case `data`:
                if (t !== `object`) {
                    Pt(e, `data`, r);
                    break;
                }
            case `src`:
            case `href`:
                if (r === `` && (t !== `a` || n !== `href`)) {
                    e.removeAttribute(n);
                    break;
                }
                if (r == null || typeof r === `function` || typeof r === `symbol` || typeof r === `boolean`) {
                    e.removeAttribute(n);
                    break;
                }
                ((r = nn(`` + r)), e.setAttribute(n, r));
                break;
            case `action`:
            case `formAction`:
                if (typeof r === `function`) {
                    e.setAttribute(
                        n,
                        `javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')`
                    );
                    break;
                } else {
                    typeof o === `function` &&
                        (n === `formAction`
                            ? (t !== `input` && $(e, t, `name`, a.name, a, null),
                              $(e, t, `formEncType`, a.formEncType, a, null),
                              $(e, t, `formMethod`, a.formMethod, a, null),
                              $(e, t, `formTarget`, a.formTarget, a, null))
                            : ($(e, t, `encType`, a.encType, a, null),
                              $(e, t, `method`, a.method, a, null),
                              $(e, t, `target`, a.target, a, null)));
                }
                if (r == null || typeof r === `symbol` || typeof r === `boolean`) {
                    e.removeAttribute(n);
                    break;
                }
                ((r = nn(`` + r)), e.setAttribute(n, r));
                break;
            case `onClick`:
                r != null && (e.onclick = F);
                break;
            case `onScroll`:
                r != null && Q(`scroll`, e);
                break;
            case `onScrollEnd`:
                r != null && Q(`scrollend`, e);
                break;
            case `dangerouslySetInnerHTML`:
                if (r != null) {
                    if (typeof r !== `object` || !(`__html` in r)) throw Error(i(61));
                    if (((n = r.__html), n != null)) {
                        if (a.children != null) throw Error(i(60));
                        e.innerHTML = n;
                    }
                }
                break;
            case `multiple`:
                e.multiple = r && typeof r !== `function` && typeof r !== `symbol`;
                break;
            case `muted`:
                e.muted = r && typeof r !== `function` && typeof r !== `symbol`;
                break;
            case `suppressContentEditableWarning`:
            case `suppressHydrationWarning`:
            case `defaultValue`:
            case `defaultChecked`:
            case `innerHTML`:
            case `ref`:
                break;
            case `autoFocus`:
                break;
            case `xlinkHref`:
                if (r == null || typeof r === `function` || typeof r === `boolean` || typeof r === `symbol`) {
                    e.removeAttribute(`xlink:href`);
                    break;
                }
                ((n = nn(`` + r)), e.setAttributeNS(`http://www.w3.org/1999/xlink`, `xlink:href`, n));
                break;
            case `contentEditable`:
            case `spellCheck`:
            case `draggable`:
            case `value`:
            case `autoReverse`:
            case `externalResourcesRequired`:
            case `focusable`:
            case `preserveAlpha`:
                r != null && typeof r !== `function` && typeof r !== `symbol`
                    ? e.setAttribute(n, `` + r)
                    : e.removeAttribute(n);
                break;
            case `inert`:
            case `allowFullScreen`:
            case `async`:
            case `autoPlay`:
            case `controls`:
            case `default`:
            case `defer`:
            case `disabled`:
            case `disablePictureInPicture`:
            case `disableRemotePlayback`:
            case `formNoValidate`:
            case `hidden`:
            case `loop`:
            case `noModule`:
            case `noValidate`:
            case `open`:
            case `playsInline`:
            case `readOnly`:
            case `required`:
            case `reversed`:
            case `scoped`:
            case `seamless`:
            case `itemScope`:
                r && typeof r !== `function` && typeof r !== `symbol` ? e.setAttribute(n, ``) : e.removeAttribute(n);
                break;
            case `capture`:
            case `download`:
                !0 === r
                    ? e.setAttribute(n, ``)
                    : !1 !== r && r != null && typeof r !== `function` && typeof r !== `symbol`
                      ? e.setAttribute(n, r)
                      : e.removeAttribute(n);
                break;
            case `cols`:
            case `rows`:
            case `size`:
            case `span`:
                r != null && typeof r !== `function` && typeof r !== `symbol` && !isNaN(r) && r >= 1
                    ? e.setAttribute(n, r)
                    : e.removeAttribute(n);
                break;
            case `rowSpan`:
            case `start`:
                r == null || typeof r === `function` || typeof r === `symbol` || isNaN(r)
                    ? e.removeAttribute(n)
                    : e.setAttribute(n, r);
                break;
            case `popover`:
                (Q(`beforetoggle`, e), Q(`toggle`, e), Nt(e, `popover`, r));
                break;
            case `xlinkActuate`:
                Ft(e, `http://www.w3.org/1999/xlink`, `xlink:actuate`, r);
                break;
            case `xlinkArcrole`:
                Ft(e, `http://www.w3.org/1999/xlink`, `xlink:arcrole`, r);
                break;
            case `xlinkRole`:
                Ft(e, `http://www.w3.org/1999/xlink`, `xlink:role`, r);
                break;
            case `xlinkShow`:
                Ft(e, `http://www.w3.org/1999/xlink`, `xlink:show`, r);
                break;
            case `xlinkTitle`:
                Ft(e, `http://www.w3.org/1999/xlink`, `xlink:title`, r);
                break;
            case `xlinkType`:
                Ft(e, `http://www.w3.org/1999/xlink`, `xlink:type`, r);
                break;
            case `xmlBase`:
                Ft(e, `http://www.w3.org/XML/1998/namespace`, `xml:base`, r);
                break;
            case `xmlLang`:
                Ft(e, `http://www.w3.org/XML/1998/namespace`, `xml:lang`, r);
                break;
            case `xmlSpace`:
                Ft(e, `http://www.w3.org/XML/1998/namespace`, `xml:space`, r);
                break;
            case `is`:
                Nt(e, `is`, r);
                break;
            case `innerText`:
            case `textContent`:
                break;
            default:
                (!(n.length > 2) || (n[0] !== `o` && n[0] !== `O`) || (n[1] !== `n` && n[1] !== `N`)) &&
                    ((n = en.get(n) || n), Nt(e, n, r));
        }
    }
    function Nd(e, t, n, r, a, o) {
        switch (n) {
            case `style`:
                Qt(e, r, o);
                break;
            case `dangerouslySetInnerHTML`:
                if (r != null) {
                    if (typeof r !== `object` || !(`__html` in r)) throw Error(i(61));
                    if (((n = r.__html), n != null)) {
                        if (a.children != null) throw Error(i(60));
                        e.innerHTML = n;
                    }
                }
                break;
            case `children`:
                typeof r === `string` ? Yt(e, r) : (typeof r === `number` || typeof r === `bigint`) && Yt(e, `` + r);
                break;
            case `onScroll`:
                r != null && Q(`scroll`, e);
                break;
            case `onScrollEnd`:
                r != null && Q(`scrollend`, e);
                break;
            case `onClick`:
                r != null && (e.onclick = F);
                break;
            case `suppressContentEditableWarning`:
            case `suppressHydrationWarning`:
            case `innerHTML`:
            case `ref`:
                break;
            case `innerText`:
            case `textContent`:
                break;
            default:
                if (!Et.hasOwnProperty(n)) {
                    a: {
                        if (
                            n[0] === `o` &&
                            n[1] === `n` &&
                            ((a = n.endsWith(`Capture`)),
                            (t = n.slice(2, a ? n.length - 7 : void 0)),
                            (o = e[j] || null),
                            (o = o == null ? null : o[n]),
                            typeof o === `function` && e.removeEventListener(t, o, a),
                            typeof r === `function`)
                        ) {
                            (typeof o !== `function` &&
                                o !== null &&
                                (n in e ? (e[n] = null) : e.hasAttribute(n) && e.removeAttribute(n)),
                                e.addEventListener(t, r, a));
                            break a;
                        }
                        n in e ? (e[n] = r) : !0 === r ? e.setAttribute(n, ``) : Nt(e, n, r);
                    }
                }
        }
    }
    function Pd(e, t, n) {
        switch (t) {
            case `div`:
            case `span`:
            case `svg`:
            case `path`:
            case `a`:
            case `g`:
            case `p`:
            case `li`:
                break;
            case `img`:
                (Q(`error`, e), Q(`load`, e));
                var r = !1;
                var a = !1;
                var o;
                for (o in n) {
                    if (n.hasOwnProperty(o)) {
                        var s = n[o];
                        if (s != null) {
                            switch (o) {
                                case `src`:
                                    r = !0;
                                    break;
                                case `srcSet`:
                                    a = !0;
                                    break;
                                case `children`:
                                case `dangerouslySetInnerHTML`:
                                    throw Error(i(137, t));
                                default:
                                    $(e, t, o, s, n, null);
                            }
                        }
                    }
                }
                (a && $(e, t, `srcSet`, n.srcSet, n, null), r && $(e, t, `src`, n.src, n, null));
                return;
            case `input`:
                Q(`invalid`, e);
                var c = (o = s = a = null);
                var l = null;
                var u = null;
                for (r in n) {
                    if (n.hasOwnProperty(r)) {
                        var d = n[r];
                        if (d != null) {
                            switch (r) {
                                case `name`:
                                    a = d;
                                    break;
                                case `type`:
                                    s = d;
                                    break;
                                case `checked`:
                                    l = d;
                                    break;
                                case `defaultChecked`:
                                    u = d;
                                    break;
                                case `value`:
                                    o = d;
                                    break;
                                case `defaultValue`:
                                    c = d;
                                    break;
                                case `children`:
                                case `dangerouslySetInnerHTML`:
                                    if (d != null) throw Error(i(137, t));
                                    break;
                                default:
                                    $(e, t, r, d, n, null);
                            }
                        }
                    }
                }
                Wt(e, o, c, l, u, s, a, !1);
                return;
            case `select`:
                for (a in (Q(`invalid`, e), (r = s = o = null), n)) {
                    if (n.hasOwnProperty(a) && ((c = n[a]), c != null)) {
                        switch (a) {
                            case `value`:
                                o = c;
                                break;
                            case `defaultValue`:
                                s = c;
                                break;
                            case `multiple`:
                                r = c;
                            default:
                                $(e, t, a, c, n, null);
                        }
                    }
                }
                ((t = o), (n = s), (e.multiple = !!r), t == null ? n != null && Kt(e, !!r, n, !0) : Kt(e, !!r, t, !1));
                return;
            case `textarea`:
                for (s in (Q(`invalid`, e), (o = a = r = null), n)) {
                    if (n.hasOwnProperty(s) && ((c = n[s]), c != null)) {
                        switch (s) {
                            case `value`:
                                r = c;
                                break;
                            case `defaultValue`:
                                a = c;
                                break;
                            case `children`:
                                o = c;
                                break;
                            case `dangerouslySetInnerHTML`:
                                if (c != null) throw Error(i(91));
                                break;
                            default:
                                $(e, t, s, c, n, null);
                        }
                    }
                }
                Jt(e, r, a, o);
                return;
            case `option`:
                for (l in n) {
                    if (n.hasOwnProperty(l) && ((r = n[l]), r != null)) {
                        switch (l) {
                            case `selected`:
                                e.selected = r && typeof r !== `function` && typeof r !== `symbol`;
                                break;
                            default:
                                $(e, t, l, r, n, null);
                        }
                    }
                }
                return;
            case `dialog`:
                (Q(`beforetoggle`, e), Q(`toggle`, e), Q(`cancel`, e), Q(`close`, e));
                break;
            case `iframe`:
            case `object`:
                Q(`load`, e);
                break;
            case `video`:
            case `audio`:
                for (r = 0; r < _d.length; r++) Q(_d[r], e);
                break;
            case `image`:
                (Q(`error`, e), Q(`load`, e));
                break;
            case `details`:
                Q(`toggle`, e);
                break;
            case `embed`:
            case `source`:
            case `link`:
                (Q(`error`, e), Q(`load`, e));
            case `area`:
            case `base`:
            case `br`:
            case `col`:
            case `hr`:
            case `keygen`:
            case `meta`:
            case `param`:
            case `track`:
            case `wbr`:
            case `menuitem`:
                for (u in n) {
                    if (n.hasOwnProperty(u) && ((r = n[u]), r != null)) {
                        switch (u) {
                            case `children`:
                            case `dangerouslySetInnerHTML`:
                                throw Error(i(137, t));
                            default:
                                $(e, t, u, r, n, null);
                        }
                    }
                }
                return;
            default:
                if ($t(t)) {
                    for (d in n) n.hasOwnProperty(d) && ((r = n[d]), r !== void 0 && Nd(e, t, d, r, n, void 0));
                    return;
                }
        }
        for (c in n) n.hasOwnProperty(c) && ((r = n[c]), r != null && $(e, t, c, r, n, null));
    }
    function Fd(e, t, n, r) {
        switch (t) {
            case `div`:
            case `span`:
            case `svg`:
            case `path`:
            case `a`:
            case `g`:
            case `p`:
            case `li`:
                break;
            case `input`:
                var a = null;
                var o = null;
                var s = null;
                var c = null;
                var l = null;
                var u = null;
                var d = null;
                for (m in n) {
                    var f = n[m];
                    if (n.hasOwnProperty(m) && f != null) {
                        switch (m) {
                            case `checked`:
                                break;
                            case `value`:
                                break;
                            case `defaultValue`:
                                l = f;
                            default:
                                r.hasOwnProperty(m) || $(e, t, m, null, r, f);
                        }
                    }
                }
                for (var p in r) {
                    var m = r[p];
                    if (((f = n[p]), r.hasOwnProperty(p) && (m != null || f != null))) {
                        switch (p) {
                            case `type`:
                                o = m;
                                break;
                            case `name`:
                                a = m;
                                break;
                            case `checked`:
                                u = m;
                                break;
                            case `defaultChecked`:
                                d = m;
                                break;
                            case `value`:
                                s = m;
                                break;
                            case `defaultValue`:
                                c = m;
                                break;
                            case `children`:
                            case `dangerouslySetInnerHTML`:
                                if (m != null) throw Error(i(137, t));
                                break;
                            default:
                                m !== f && $(e, t, p, m, r, f);
                        }
                    }
                }
                Ut(e, s, c, l, u, d, o, a);
                return;
            case `select`:
                for (o in ((m = s = c = p = null), n)) {
                    if (((l = n[o]), n.hasOwnProperty(o) && l != null)) {
                        switch (o) {
                            case `value`:
                                break;
                            case `multiple`:
                                m = l;
                            default:
                                r.hasOwnProperty(o) || $(e, t, o, null, r, l);
                        }
                    }
                }
                for (a in r) {
                    if (((o = r[a]), (l = n[a]), r.hasOwnProperty(a) && (o != null || l != null))) {
                        switch (a) {
                            case `value`:
                                p = o;
                                break;
                            case `defaultValue`:
                                c = o;
                                break;
                            case `multiple`:
                                s = o;
                            default:
                                o !== l && $(e, t, a, o, r, l);
                        }
                    }
                }
                ((t = c),
                    (n = s),
                    (r = m),
                    p == null
                        ? !!r != !!n && (t == null ? Kt(e, !!n, n ? [] : ``, !1) : Kt(e, !!n, t, !0))
                        : Kt(e, !!n, p, !1));
                return;
            case `textarea`:
                for (c in ((m = p = null), n)) {
                    if (((a = n[c]), n.hasOwnProperty(c) && a != null && !r.hasOwnProperty(c))) {
                        switch (c) {
                            case `value`:
                                break;
                            case `children`:
                                break;
                            default:
                                $(e, t, c, null, r, a);
                        }
                    }
                }
                for (s in r) {
                    if (((a = r[s]), (o = n[s]), r.hasOwnProperty(s) && (a != null || o != null))) {
                        switch (s) {
                            case `value`:
                                p = a;
                                break;
                            case `defaultValue`:
                                m = a;
                                break;
                            case `children`:
                                break;
                            case `dangerouslySetInnerHTML`:
                                if (a != null) throw Error(i(91));
                                break;
                            default:
                                a !== o && $(e, t, s, a, r, o);
                        }
                    }
                }
                qt(e, p, m);
                return;
            case `option`:
                for (const h in n) {
                    if (((p = n[h]), n.hasOwnProperty(h) && p != null && !r.hasOwnProperty(h))) {
                        switch (h) {
                            case `selected`:
                                e.selected = !1;
                                break;
                            default:
                                $(e, t, h, null, r, p);
                        }
                    }
                }
                for (l in r) {
                    if (((p = r[l]), (m = n[l]), r.hasOwnProperty(l) && p !== m && (p != null || m != null))) {
                        switch (l) {
                            case `selected`:
                                e.selected = p && typeof p !== `function` && typeof p !== `symbol`;
                                break;
                            default:
                                $(e, t, l, p, r, m);
                        }
                    }
                }
                return;
            case `img`:
            case `link`:
            case `area`:
            case `base`:
            case `br`:
            case `col`:
            case `embed`:
            case `hr`:
            case `keygen`:
            case `meta`:
            case `param`:
            case `source`:
            case `track`:
            case `wbr`:
            case `menuitem`:
                for (const g in n) {
                    ((p = n[g]), n.hasOwnProperty(g) && p != null && !r.hasOwnProperty(g) && $(e, t, g, null, r, p));
                }
                for (u in r) {
                    if (((p = r[u]), (m = n[u]), r.hasOwnProperty(u) && p !== m && (p != null || m != null))) {
                        switch (u) {
                            case `children`:
                            case `dangerouslySetInnerHTML`:
                                if (p != null) throw Error(i(137, t));
                                break;
                            default:
                                $(e, t, u, p, r, m);
                        }
                    }
                }
                return;
            default:
                if ($t(t)) {
                    for (const _ in n) {
                        ((p = n[_]),
                            n.hasOwnProperty(_) && p !== void 0 && !r.hasOwnProperty(_) && Nd(e, t, _, void 0, r, p));
                    }
                    for (d in r) {
                        ((p = r[d]),
                            (m = n[d]),
                            !r.hasOwnProperty(d) || p === m || (p === void 0 && m === void 0) || Nd(e, t, d, p, r, m));
                    }
                    return;
                }
        }
        for (const v in n) {
            ((p = n[v]), n.hasOwnProperty(v) && p != null && !r.hasOwnProperty(v) && $(e, t, v, null, r, p));
        }
        for (f in r) {
            ((p = r[f]),
                (m = n[f]),
                !r.hasOwnProperty(f) || p === m || (p == null && m == null) || $(e, t, f, p, r, m));
        }
    }
    function Id(e) {
        switch (e) {
            case `css`:
            case `script`:
            case `font`:
            case `img`:
            case `image`:
            case `input`:
            case `link`:
                return !0;
            default:
                return !1;
        }
    }
    function Ld() {
        if (typeof performance.getEntriesByType === `function`) {
            for (var e = 0, t = 0, n = performance.getEntriesByType(`resource`), r = 0; r < n.length; r++) {
                const i = n[r];
                const a = i.transferSize;
                let o = i.initiatorType;
                let s = i.duration;
                if (a && s && Id(o)) {
                    for (o = 0, s = i.responseEnd, r += 1; r < n.length; r++) {
                        let c = n[r];
                        const l = c.startTime;
                        if (l > s) break;
                        const u = c.transferSize;
                        const d = c.initiatorType;
                        u && Id(d) && ((c = c.responseEnd), (o += u * (c < s ? 1 : (s - l) / (c - l))));
                    }
                    if ((--r, (t += (8 * (a + o)) / (i.duration / 1e3)), e++, e > 10)) break;
                }
            }
            if (e > 0) return t / e / 1e6;
        }
        return navigator.connection && ((e = navigator.connection.downlink), typeof e === `number`) ? e : 5;
    }
    var Rd = null;
    var zd = null;
    function Bd(e) {
        return e.nodeType === 9 ? e : e.ownerDocument;
    }
    function Vd(e) {
        switch (e) {
            case `http://www.w3.org/2000/svg`:
                return 1;
            case `http://www.w3.org/1998/Math/MathML`:
                return 2;
            default:
                return 0;
        }
    }
    function Hd(e, t) {
        if (e === 0) {
            switch (t) {
                case `svg`:
                    return 1;
                case `math`:
                    return 2;
                default:
                    return 0;
            }
        }
        return e === 1 && t === `foreignObject` ? 0 : e;
    }
    function Ud(e, t) {
        return (
            e === `textarea` ||
            e === `noscript` ||
            typeof t.children === `string` ||
            typeof t.children === `number` ||
            typeof t.children === `bigint` ||
            (typeof t.dangerouslySetInnerHTML === `object` &&
                t.dangerouslySetInnerHTML !== null &&
                t.dangerouslySetInnerHTML.__html != null)
        );
    }
    let Wd = null;
    function Gd() {
        const e = window.event;
        return e && e.type === `popstate` ? (e === Wd ? !1 : ((Wd = e), !0)) : ((Wd = null), !1);
    }
    var Kd = typeof setTimeout === `function` ? setTimeout : void 0;
    var qd = typeof clearTimeout === `function` ? clearTimeout : void 0;
    const Jd = typeof Promise === `function` ? Promise : void 0;
    var Yd =
        typeof queueMicrotask === `function`
            ? queueMicrotask
            : Jd === void 0
              ? Kd
              : function (e) {
                    return Jd.resolve(null).then(e).catch(Xd);
                };
    function Xd(e) {
        setTimeout(function () {
            throw e;
        });
    }
    function Zd(e) {
        return e === `head`;
    }
    function Qd(e, t) {
        let n = t;
        let r = 0;
        do {
            const i = n.nextSibling;
            if ((e.removeChild(n), i && i.nodeType === 8)) {
                if (((n = i.data), n === `/$` || n === `/&`)) {
                    if (r === 0) {
                        (e.removeChild(i), Np(t));
                        return;
                    }
                    r--;
                } else if (n === `$` || n === `$?` || n === `$~` || n === `$!` || n === `&`) r++;
                else if (n === `html`) pf(e.ownerDocument.documentElement);
                else if (n === `head`) {
                    ((n = e.ownerDocument.head), pf(n));
                    for (let a = n.firstChild; a;) {
                        const o = a.nextSibling;
                        const s = a.nodeName;
                        (a[N] ||
                            s === `SCRIPT` ||
                            s === `STYLE` ||
                            (s === `LINK` && a.rel.toLowerCase() === `stylesheet`) ||
                            n.removeChild(a),
                            (a = o));
                    }
                } else n === `body` && pf(e.ownerDocument.body);
            }
            n = i;
        } while (n);
        Np(t);
    }
    function $d(e, t) {
        let n = e;
        e = 0;
        do {
            const r = n.nextSibling;
            if (
                (n.nodeType === 1
                    ? t
                        ? ((n._stashedDisplay = n.style.display), (n.style.display = `none`))
                        : ((n.style.display = n._stashedDisplay || ``),
                          n.getAttribute(`style`) === `` && n.removeAttribute(`style`))
                    : n.nodeType === 3 &&
                      (t ? ((n._stashedText = n.nodeValue), (n.nodeValue = ``)) : (n.nodeValue = n._stashedText || ``)),
                r && r.nodeType === 8)
            ) {
                if (((n = r.data), n === `/$`)) {
                    if (e === 0) break;
                    e--;
                } else (n !== `$` && n !== `$?` && n !== `$~` && n !== `$!`) || e++;
            }
            n = r;
        } while (n);
    }
    function ef(e) {
        let t = e.firstChild;
        for (t && t.nodeType === 10 && (t = t.nextSibling); t;) {
            const n = t;
            switch (((t = t.nextSibling), n.nodeName)) {
                case `HTML`:
                case `HEAD`:
                case `BODY`:
                    (ef(n), yt(n));
                    continue;
                case `SCRIPT`:
                case `STYLE`:
                    continue;
                case `LINK`:
                    if (n.rel.toLowerCase() === `stylesheet`) continue;
            }
            e.removeChild(n);
        }
    }
    function tf(e, t, n, r) {
        for (; e.nodeType === 1;) {
            const i = n;
            if (e.nodeName.toLowerCase() !== t.toLowerCase()) {
                if (!r && (e.nodeName !== `INPUT` || e.type !== `hidden`)) break;
            } else if (!r) {
                if (t === `input` && e.type === `hidden`) {
                    var a = i.name == null ? null : `` + i.name;
                    if (i.type === `hidden` && e.getAttribute(`name`) === a) return e;
                } else return e;
            } else if (!e[N]) {
                switch (t) {
                    case `meta`:
                        if (!e.hasAttribute(`itemprop`)) break;
                        return e;
                    case `link`:
                        if (
                            ((a = e.getAttribute(`rel`)),
                            (a === `stylesheet` && e.hasAttribute(`data-precedence`)) ||
                                a !== i.rel ||
                                e.getAttribute(`href`) !== (i.href == null || i.href === `` ? null : i.href) ||
                                e.getAttribute(`crossorigin`) !== (i.crossOrigin == null ? null : i.crossOrigin) ||
                                e.getAttribute(`title`) !== (i.title == null ? null : i.title))
                        ) {
                            break;
                        }
                        return e;
                    case `style`:
                        if (e.hasAttribute(`data-precedence`)) break;
                        return e;
                    case `script`:
                        if (
                            ((a = e.getAttribute(`src`)),
                            (a !== (i.src == null ? null : i.src) ||
                                e.getAttribute(`type`) !== (i.type == null ? null : i.type) ||
                                e.getAttribute(`crossorigin`) !== (i.crossOrigin == null ? null : i.crossOrigin)) &&
                                a &&
                                e.hasAttribute(`async`) &&
                                !e.hasAttribute(`itemprop`))
                        ) {
                            break;
                        }
                        return e;
                    default:
                        return e;
                }
            }
            if (((e = cf(e.nextSibling)), e === null)) break;
        }
        return null;
    }
    function nf(e, t, n) {
        if (t === ``) return null;
        for (; e.nodeType !== 3;) {
            if (
                ((e.nodeType !== 1 || e.nodeName !== `INPUT` || e.type !== `hidden`) && !n) ||
                ((e = cf(e.nextSibling)), e === null)
            ) {
                return null;
            }
        }
        return e;
    }
    function rf(e, t) {
        for (; e.nodeType !== 8;) {
            if (
                ((e.nodeType !== 1 || e.nodeName !== `INPUT` || e.type !== `hidden`) && !t) ||
                ((e = cf(e.nextSibling)), e === null)
            ) {
                return null;
            }
        }
        return e;
    }
    function af(e) {
        return e.data === `$?` || e.data === `$~`;
    }
    function of(e) {
        return e.data === `$!` || (e.data === `$?` && e.ownerDocument.readyState !== `loading`);
    }
    function sf(e, t) {
        const n = e.ownerDocument;
        if (e.data === `$~`) e._reactRetry = t;
        else if (e.data !== `$?` || n.readyState !== `loading`) t();
        else {
            const r = function () {
                (t(), n.removeEventListener(`DOMContentLoaded`, r));
            };
            (n.addEventListener(`DOMContentLoaded`, r), (e._reactRetry = r));
        }
    }
    function cf(e) {
        for (; e != null; e = e.nextSibling) {
            let t = e.nodeType;
            if (t === 1 || t === 3) break;
            if (t === 8) {
                if (
                    ((t = e.data),
                    t === `$` || t === `$!` || t === `$?` || t === `$~` || t === `&` || t === `F!` || t === `F`)
                ) {
                    break;
                }
                if (t === `/$` || t === `/&`) return null;
            }
        }
        return e;
    }
    var lf = null;
    function uf(e) {
        e = e.nextSibling;
        for (let t = 0; e;) {
            if (e.nodeType === 8) {
                const n = e.data;
                if (n === `/$` || n === `/&`) {
                    if (t === 0) return cf(e.nextSibling);
                    t--;
                } else (n !== `$` && n !== `$!` && n !== `$?` && n !== `$~` && n !== `&`) || t++;
            }
            e = e.nextSibling;
        }
        return null;
    }
    function df(e) {
        e = e.previousSibling;
        for (let t = 0; e;) {
            if (e.nodeType === 8) {
                const n = e.data;
                if (n === `$` || n === `$!` || n === `$?` || n === `$~` || n === `&`) {
                    if (t === 0) return e;
                    t--;
                } else (n !== `/$` && n !== `/&`) || t++;
            }
            e = e.previousSibling;
        }
        return null;
    }
    function ff(e, t, n) {
        switch (((t = Bd(n)), e)) {
            case `html`:
                if (((e = t.documentElement), !e)) throw Error(i(452));
                return e;
            case `head`:
                if (((e = t.head), !e)) throw Error(i(453));
                return e;
            case `body`:
                if (((e = t.body), !e)) throw Error(i(454));
                return e;
            default:
                throw Error(i(451));
        }
    }
    function pf(e) {
        for (let t = e.attributes; t.length;) e.removeAttributeNode(t[0]);
        yt(e);
    }
    const mf = new Map();
    const hf = new Set();
    function gf(e) {
        return typeof e.getRootNode === `function` ? e.getRootNode() : e.nodeType === 9 ? e : e.ownerDocument;
    }
    const _f = E.d;
    E.d = { f: vf, r: yf, D: Sf, C: Cf, L: wf, m: Tf, X: Df, S: Ef, M: Of };
    function vf() {
        const e = _f.f();
        const t = bu();
        return e || t;
    }
    function yf(e) {
        const t = xt(e);
        t !== null && t.tag === 5 && t.type === `form` ? Ds(t) : _f.r(e);
    }
    const bf = typeof document > `u` ? null : document;
    function xf(e, t, n) {
        const r = bf;
        if (r && typeof t === `string` && t) {
            let i = Ht(t);
            ((i = `link[rel="` + e + `"][href="` + i + `"]`),
                typeof n === `string` && (i += `[crossorigin="` + n + `"]`),
                hf.has(i) ||
                    (hf.add(i),
                    (e = { rel: e, crossOrigin: n, href: t }),
                    r.querySelector(i) === null &&
                        ((t = r.createElement(`link`)), Pd(t, `link`, e), wt(t), r.head.appendChild(t))));
        }
    }
    function Sf(e) {
        (_f.D(e), xf(`dns-prefetch`, e, null));
    }
    function Cf(e, t) {
        (_f.C(e, t), xf(`preconnect`, e, t));
    }
    function wf(e, t, n) {
        _f.L(e, t, n);
        const r = bf;
        if (r && e && t) {
            let i = `link[rel="preload"][as="` + Ht(t) + `"]`;
            t === `image` && n && n.imageSrcSet
                ? ((i += `[imagesrcset="` + Ht(n.imageSrcSet) + `"]`),
                  typeof n.imageSizes === `string` && (i += `[imagesizes="` + Ht(n.imageSizes) + `"]`))
                : (i += `[href="` + Ht(e) + `"]`);
            let a = i;
            switch (t) {
                case `style`:
                    a = Af(e);
                    break;
                case `script`:
                    a = Pf(e);
            }
            mf.has(a) ||
                ((e = f({ rel: `preload`, href: t === `image` && n && n.imageSrcSet ? void 0 : e, as: t }, n)),
                mf.set(a, e),
                r.querySelector(i) !== null ||
                    (t === `style` && r.querySelector(jf(a))) ||
                    (t === `script` && r.querySelector(Ff(a))) ||
                    ((t = r.createElement(`link`)), Pd(t, `link`, e), wt(t), r.head.appendChild(t)));
        }
    }
    function Tf(e, t) {
        _f.m(e, t);
        const n = bf;
        if (n && e) {
            let r = t && typeof t.as === `string` ? t.as : `script`;
            const i = `link[rel="modulepreload"][as="` + Ht(r) + `"][href="` + Ht(e) + `"]`;
            let a = i;
            switch (r) {
                case `audioworklet`:
                case `paintworklet`:
                case `serviceworker`:
                case `sharedworker`:
                case `worker`:
                case `script`:
                    a = Pf(e);
            }
            if (
                !mf.has(a) &&
                ((e = f({ rel: `modulepreload`, href: e }, t)), mf.set(a, e), n.querySelector(i) === null)
            ) {
                switch (r) {
                    case `audioworklet`:
                    case `paintworklet`:
                    case `serviceworker`:
                    case `sharedworker`:
                    case `worker`:
                    case `script`:
                        if (n.querySelector(Ff(a))) return;
                }
                ((r = n.createElement(`link`)), Pd(r, `link`, e), wt(r), n.head.appendChild(r));
            }
        }
    }
    function Ef(e, t, n) {
        _f.S(e, t, n);
        const r = bf;
        if (r && e) {
            const i = Ct(r).hoistableStyles;
            const a = Af(e);
            t ||= `default`;
            let o = i.get(a);
            if (!o) {
                const s = { loading: 0, preload: null };
                if ((o = r.querySelector(jf(a)))) s.loading = 5;
                else {
                    ((e = f({ rel: `stylesheet`, href: e, 'data-precedence': t }, n)), (n = mf.get(a)) && Rf(e, n));
                    const c = (o = r.createElement(`link`));
                    (wt(c),
                        Pd(c, `link`, e),
                        (c._p = new Promise(function (e, t) {
                            ((c.onload = e), (c.onerror = t));
                        })),
                        c.addEventListener(`load`, function () {
                            s.loading |= 1;
                        }),
                        c.addEventListener(`error`, function () {
                            s.loading |= 2;
                        }),
                        (s.loading |= 4),
                        Lf(o, t, r));
                }
                ((o = { type: `stylesheet`, instance: o, count: 1, state: s }), i.set(a, o));
            }
        }
    }
    function Df(e, t) {
        _f.X(e, t);
        const n = bf;
        if (n && e) {
            const r = Ct(n).hoistableScripts;
            const i = Pf(e);
            let a = r.get(i);
            a ||
                ((a = n.querySelector(Ff(i))),
                a ||
                    ((e = f({ src: e, async: !0 }, t)),
                    (t = mf.get(i)) && zf(e, t),
                    (a = n.createElement(`script`)),
                    wt(a),
                    Pd(a, `link`, e),
                    n.head.appendChild(a)),
                (a = { type: `script`, instance: a, count: 1, state: null }),
                r.set(i, a));
        }
    }
    function Of(e, t) {
        _f.M(e, t);
        const n = bf;
        if (n && e) {
            const r = Ct(n).hoistableScripts;
            const i = Pf(e);
            let a = r.get(i);
            a ||
                ((a = n.querySelector(Ff(i))),
                a ||
                    ((e = f({ src: e, async: !0, type: `module` }, t)),
                    (t = mf.get(i)) && zf(e, t),
                    (a = n.createElement(`script`)),
                    wt(a),
                    Pd(a, `link`, e),
                    n.head.appendChild(a)),
                (a = { type: `script`, instance: a, count: 1, state: null }),
                r.set(i, a));
        }
    }
    function kf(e, t, n, r) {
        var a = (a = _e.current) ? gf(a) : null;
        if (!a) throw Error(i(446));
        switch (e) {
            case `meta`:
            case `title`:
                return null;
            case `style`:
                return typeof n.precedence === `string` && typeof n.href === `string`
                    ? ((t = Af(n.href)),
                      (n = Ct(a).hoistableStyles),
                      (r = n.get(t)),
                      r || ((r = { type: `style`, instance: null, count: 0, state: null }), n.set(t, r)),
                      r)
                    : { type: `void`, instance: null, count: 0, state: null };
            case `link`:
                if (n.rel === `stylesheet` && typeof n.href === `string` && typeof n.precedence === `string`) {
                    e = Af(n.href);
                    let o = Ct(a).hoistableStyles;
                    let s = o.get(e);
                    if (
                        (s ||
                            ((a = a.ownerDocument || a),
                            (s = {
                                type: `stylesheet`,
                                instance: null,
                                count: 0,
                                state: { loading: 0, preload: null }
                            }),
                            o.set(e, s),
                            (o = a.querySelector(jf(e))) && !o._p && ((s.instance = o), (s.state.loading = 5)),
                            mf.has(e) ||
                                ((n = {
                                    rel: `preload`,
                                    as: `style`,
                                    href: n.href,
                                    crossOrigin: n.crossOrigin,
                                    integrity: n.integrity,
                                    media: n.media,
                                    hrefLang: n.hrefLang,
                                    referrerPolicy: n.referrerPolicy
                                }),
                                mf.set(e, n),
                                o || Nf(a, e, n, s.state))),
                        t && r === null)
                    ) {
                        throw Error(i(528, ``));
                    }
                    return s;
                }
                if (t && r !== null) throw Error(i(529, ``));
                return null;
            case `script`:
                return (
                    (t = n.async),
                    (n = n.src),
                    typeof n === `string` && t && typeof t !== `function` && typeof t !== `symbol`
                        ? ((t = Pf(n)),
                          (n = Ct(a).hoistableScripts),
                          (r = n.get(t)),
                          r || ((r = { type: `script`, instance: null, count: 0, state: null }), n.set(t, r)),
                          r)
                        : { type: `void`, instance: null, count: 0, state: null }
                );
            default:
                throw Error(i(444, e));
        }
    }
    function Af(e) {
        return `href="` + Ht(e) + `"`;
    }
    function jf(e) {
        return `link[rel="stylesheet"][` + e + `]`;
    }
    function Mf(e) {
        return f({}, e, { 'data-precedence': e.precedence, precedence: null });
    }
    function Nf(e, t, n, r) {
        e.querySelector(`link[rel="preload"][as="style"][` + t + `]`)
            ? (r.loading = 1)
            : ((t = e.createElement(`link`)),
              (r.preload = t),
              t.addEventListener(`load`, function () {
                  return (r.loading |= 1);
              }),
              t.addEventListener(`error`, function () {
                  return (r.loading |= 2);
              }),
              Pd(t, `link`, n),
              wt(t),
              e.head.appendChild(t));
    }
    function Pf(e) {
        return `[src="` + Ht(e) + `"]`;
    }
    function Ff(e) {
        return `script[async]` + e;
    }
    function If(e, t, n) {
        if ((t.count++, t.instance === null)) {
            switch (t.type) {
                case `style`:
                    var r = e.querySelector(`style[data-href~="` + Ht(n.href) + `"]`);
                    if (r) return ((t.instance = r), wt(r), r);
                    var a = f({}, n, {
                        'data-href': n.href,
                        'data-precedence': n.precedence,
                        href: null,
                        precedence: null
                    });
                    return (
                        (r = (e.ownerDocument || e).createElement(`style`)),
                        wt(r),
                        Pd(r, `style`, a),
                        Lf(r, n.precedence, e),
                        (t.instance = r)
                    );
                case `stylesheet`:
                    a = Af(n.href);
                    var o = e.querySelector(jf(a));
                    if (o) return ((t.state.loading |= 4), (t.instance = o), wt(o), o);
                    ((r = Mf(n)),
                        (a = mf.get(a)) && Rf(r, a),
                        (o = (e.ownerDocument || e).createElement(`link`)),
                        wt(o));
                    var s = o;
                    return (
                        (s._p = new Promise(function (e, t) {
                            ((s.onload = e), (s.onerror = t));
                        })),
                        Pd(o, `link`, r),
                        (t.state.loading |= 4),
                        Lf(o, n.precedence, e),
                        (t.instance = o)
                    );
                case `script`:
                    return (
                        (o = Pf(n.src)),
                        (a = e.querySelector(Ff(o)))
                            ? ((t.instance = a), wt(a), a)
                            : ((r = n),
                              (a = mf.get(o)) && ((r = f({}, n)), zf(r, a)),
                              (e = e.ownerDocument || e),
                              (a = e.createElement(`script`)),
                              wt(a),
                              Pd(a, `link`, r),
                              e.head.appendChild(a),
                              (t.instance = a))
                    );
                case `void`:
                    return null;
                default:
                    throw Error(i(443, t.type));
            }
        } else {
            t.type === `stylesheet` &&
                !(t.state.loading & 4) &&
                ((r = t.instance), (t.state.loading |= 4), Lf(r, n.precedence, e));
        }
        return t.instance;
    }
    function Lf(e, t, n) {
        for (
            var r = n.querySelectorAll(`link[rel="stylesheet"][data-precedence],style[data-precedence]`),
                i = r.length ? r[r.length - 1] : null,
                a = i,
                o = 0;
            o < r.length;
            o++
        ) {
            const s = r[o];
            if (s.dataset.precedence === t) a = s;
            else if (a !== i) break;
        }
        a
            ? a.parentNode.insertBefore(e, a.nextSibling)
            : ((t = n.nodeType === 9 ? n.head : n), t.insertBefore(e, t.firstChild));
    }
    function Rf(e, t) {
        ((e.crossOrigin ??= t.crossOrigin), (e.referrerPolicy ??= t.referrerPolicy), (e.title ??= t.title));
    }
    function zf(e, t) {
        ((e.crossOrigin ??= t.crossOrigin), (e.referrerPolicy ??= t.referrerPolicy), (e.integrity ??= t.integrity));
    }
    var Bf = null;
    function Vf(e, t, n) {
        if (Bf === null) {
            var r = new Map();
            var i = (Bf = new Map());
            i.set(n, r);
        } else ((i = Bf), (r = i.get(n)), r || ((r = new Map()), i.set(n, r)));
        if (r.has(e)) return r;
        for (r.set(e, null), n = n.getElementsByTagName(e), i = 0; i < n.length; i++) {
            const a = n[i];
            if (
                !(a[N] || a[A] || (e === `link` && a.getAttribute(`rel`) === `stylesheet`)) &&
                a.namespaceURI !== `http://www.w3.org/2000/svg`
            ) {
                let o = a.getAttribute(t) || ``;
                o = e + o;
                const s = r.get(o);
                s ? s.push(a) : r.set(o, [a]);
            }
        }
        return r;
    }
    function Hf(e, t, n) {
        ((e = e.ownerDocument || e), e.head.insertBefore(n, t === `title` ? e.querySelector(`head > title`) : null));
    }
    function Uf(e, t, n) {
        if (n === 1 || t.itemProp != null) return !1;
        switch (e) {
            case `meta`:
            case `title`:
                return !0;
            case `style`:
                if (typeof t.precedence !== `string` || typeof t.href !== `string` || t.href === ``) break;
                return !0;
            case `link`:
                if (typeof t.rel !== `string` || typeof t.href !== `string` || t.href === `` || t.onLoad || t.onError) {
                    break;
                }
                switch (t.rel) {
                    case `stylesheet`:
                        return ((e = t.disabled), typeof t.precedence === `string` && e == null);
                    default:
                        return !0;
                }
            case `script`:
                if (
                    t.async &&
                    typeof t.async !== `function` &&
                    typeof t.async !== `symbol` &&
                    !t.onLoad &&
                    !t.onError &&
                    t.src &&
                    typeof t.src === `string`
                ) {
                    return !0;
                }
        }
        return !1;
    }
    function Wf(e) {
        return !(e.type === `stylesheet` && !(e.state.loading & 3));
    }
    function Gf(e, t, n, r) {
        if (
            n.type === `stylesheet` &&
            (typeof r.media !== `string` || !1 !== matchMedia(r.media).matches) &&
            !(n.state.loading & 4)
        ) {
            if (n.instance === null) {
                let i = Af(r.href);
                let a = t.querySelector(jf(i));
                if (a) {
                    ((t = a._p),
                        typeof t === `object` &&
                            t &&
                            typeof t.then === `function` &&
                            (e.count++, (e = Jf.bind(e)), t.then(e, e)),
                        (n.state.loading |= 4),
                        (n.instance = a),
                        wt(a));
                    return;
                }
                ((a = t.ownerDocument || t),
                    (r = Mf(r)),
                    (i = mf.get(i)) && Rf(r, i),
                    (a = a.createElement(`link`)),
                    wt(a));
                const o = a;
                ((o._p = new Promise(function (e, t) {
                    ((o.onload = e), (o.onerror = t));
                })),
                    Pd(a, `link`, r),
                    (n.instance = a));
            }
            (e.stylesheets === null && (e.stylesheets = new Map()),
                e.stylesheets.set(n, t),
                (t = n.state.preload) &&
                    !(n.state.loading & 3) &&
                    (e.count++, (n = Jf.bind(e)), t.addEventListener(`load`, n), t.addEventListener(`error`, n)));
        }
    }
    let Kf = 0;
    function qf(e, t) {
        return (
            e.stylesheets && e.count === 0 && Xf(e, e.stylesheets),
            e.count > 0 || e.imgCount > 0
                ? function (n) {
                      const r = setTimeout(function () {
                          if ((e.stylesheets && Xf(e, e.stylesheets), e.unsuspend)) {
                              const t = e.unsuspend;
                              ((e.unsuspend = null), t());
                          }
                      }, 6e4 + t);
                      e.imgBytes > 0 && Kf === 0 && (Kf = 62500 * Ld());
                      const i = setTimeout(
                          function () {
                              if (
                                  ((e.waitingForImages = !1),
                                  e.count === 0 && (e.stylesheets && Xf(e, e.stylesheets), e.unsuspend))
                              ) {
                                  const t = e.unsuspend;
                                  ((e.unsuspend = null), t());
                              }
                          },
                          (e.imgBytes > Kf ? 50 : 800) + t
                      );
                      return (
                          (e.unsuspend = n),
                          function () {
                              ((e.unsuspend = null), clearTimeout(r), clearTimeout(i));
                          }
                      );
                  }
                : null
        );
    }
    function Jf() {
        if ((this.count--, this.count === 0 && (this.imgCount === 0 || !this.waitingForImages))) {
            if (this.stylesheets) Xf(this, this.stylesheets);
            else if (this.unsuspend) {
                const e = this.unsuspend;
                ((this.unsuspend = null), e());
            }
        }
    }
    let Yf = null;
    function Xf(e, t) {
        ((e.stylesheets = null),
            e.unsuspend !== null && (e.count++, (Yf = new Map()), t.forEach(Zf, e), (Yf = null), Jf.call(e)));
    }
    function Zf(e, t) {
        if (!(t.state.loading & 4)) {
            let n = Yf.get(e);
            if (n) var r = n.get(null);
            else {
                ((n = new Map()), Yf.set(e, n));
                for (
                    var i = e.querySelectorAll(`link[data-precedence],style[data-precedence]`), a = 0;
                    a < i.length;
                    a++
                ) {
                    var o = i[a];
                    (o.nodeName === `LINK` || o.getAttribute(`media`) !== `not all`) &&
                        (n.set(o.dataset.precedence, o), (r = o));
                }
                r && n.set(null, r);
            }
            ((i = t.instance),
                (o = i.getAttribute(`data-precedence`)),
                (a = n.get(o) || r),
                a === r && n.set(null, i),
                n.set(o, i),
                this.count++,
                (r = Jf.bind(this)),
                i.addEventListener(`load`, r),
                i.addEventListener(`error`, r),
                a
                    ? a.parentNode.insertBefore(i, a.nextSibling)
                    : ((e = e.nodeType === 9 ? e.head : e), e.insertBefore(i, e.firstChild)),
                (t.state.loading |= 4));
        }
    }
    var Qf = {
        $$typeof: C,
        Provider: null,
        Consumer: null,
        _currentValue: de,
        _currentValue2: de,
        _threadCount: 0
    };
    function $f(e, t, n, r, i, a, o, s, c) {
        ((this.tag = 1),
            (this.containerInfo = e),
            (this.pingCache = this.current = this.pendingChildren = null),
            (this.timeoutHandle = -1),
            (this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null),
            (this.callbackPriority = 0),
            (this.expirationTimes = it(-1)),
            (this.entangledLanes =
                this.shellSuspendCounter =
                this.errorRecoveryDisabledLanes =
                this.expiredLanes =
                this.warmLanes =
                this.pingedLanes =
                this.suspendedLanes =
                this.pendingLanes =
                    0),
            (this.entanglements = it(0)),
            (this.hiddenUpdates = it(null)),
            (this.identifierPrefix = r),
            (this.onUncaughtError = i),
            (this.onCaughtError = a),
            (this.onRecoverableError = o),
            (this.pooledCache = null),
            (this.pooledCacheLanes = 0),
            (this.formState = c),
            (this.incompleteTransitions = new Map()));
    }
    function ep(e, t, n, r, i, a, o, s, c, l, u, d) {
        return (
            (e = new $f(e, t, n, o, c, l, u, d, s)),
            (t = 1),
            !0 === a && (t |= 24),
            (a = di(3, null, null, t)),
            (e.current = a),
            (a.stateNode = e),
            (t = ca()),
            t.refCount++,
            (e.pooledCache = t),
            t.refCount++,
            (a.memoizedState = { element: r, isDehydrated: n, cache: t }),
            Va(a),
            e
        );
    }
    function tp(e) {
        return e ? ((e = li), e) : li;
    }
    function np(e, t, n, r, i, a) {
        ((i = tp(i)),
            r.context === null ? (r.context = i) : (r.pendingContext = i),
            (r = Ua(t)),
            (r.payload = { element: n }),
            (a = a === void 0 ? null : a),
            a !== null && (r.callback = a),
            (n = Wa(e, r, t)),
            n !== null && (hu(n, e, t), Ga(n, e, t)));
    }
    function rp(e, t) {
        if (((e = e.memoizedState), e !== null && e.dehydrated !== null)) {
            const n = e.retryLane;
            e.retryLane = n !== 0 && n < t ? n : t;
        }
    }
    function ip(e, t) {
        (rp(e, t), (e = e.alternate) && rp(e, t));
    }
    function ap(e) {
        if (e.tag === 13 || e.tag === 31) {
            const t = oi(e, 67108864);
            (t !== null && hu(t, e, 67108864), ip(e, 67108864));
        }
    }
    function op(e) {
        if (e.tag === 13 || e.tag === 31) {
            let t = pu();
            t = ut(t);
            const n = oi(e, t);
            (n !== null && hu(n, e, t), ip(e, t));
        }
    }
    var sp = !0;
    function cp(e, t, n, r) {
        const i = T.T;
        T.T = null;
        const a = E.p;
        try {
            ((E.p = 2), up(e, t, n, r));
        } finally {
            ((E.p = a), (T.T = i));
        }
    }
    function lp(e, t, n, r) {
        const i = T.T;
        T.T = null;
        const a = E.p;
        try {
            ((E.p = 8), up(e, t, n, r));
        } finally {
            ((E.p = a), (T.T = i));
        }
    }
    function up(e, t, n, r) {
        if (sp) {
            let i = dp(r);
            if (i === null) (wd(e, t, r, fp, n), Cp(e, r));
            else if (Tp(i, e, t, n, r)) r.stopPropagation();
            else if ((Cp(e, r), t & 4 && Sp.indexOf(e) > -1)) {
                for (; i !== null;) {
                    let a = xt(i);
                    if (a !== null) {
                        switch (a.tag) {
                            case 3:
                                if (((a = a.stateNode), a.current.memoizedState.isDehydrated)) {
                                    let o = $e(a.pendingLanes);
                                    if (o !== 0) {
                                        var s = a;
                                        for (s.pendingLanes |= 2, s.entangledLanes |= 2; o;) {
                                            const c = 1 << (31 - Ke(o));
                                            ((s.entanglements[1] |= c), (o &= ~c));
                                        }
                                        (rd(a), !(G & 6) && ((nu = Fe() + 500), id(0, !1)));
                                    }
                                }
                                break;
                            case 31:
                            case 13:
                                ((s = oi(a, 2)), s !== null && hu(s, a, 2), bu(), ip(a, 2));
                        }
                    }
                    if (((a = dp(r)), a === null && wd(e, t, r, fp, n), a === i)) break;
                    i = a;
                }
                i !== null && r.stopPropagation();
            } else wd(e, t, r, null, n);
        }
    }
    function dp(e) {
        return ((e = an(e)), pp(e));
    }
    var fp = null;
    function pp(e) {
        if (((fp = null), (e = bt(e)), e !== null)) {
            const t = o(e);
            if (t === null) e = null;
            else {
                const n = t.tag;
                if (n === 13) {
                    if (((e = s(t)), e !== null)) return e;
                    e = null;
                } else if (n === 31) {
                    if (((e = c(t)), e !== null)) return e;
                    e = null;
                } else if (n === 3) {
                    if (t.stateNode.current.memoizedState.isDehydrated) {
                        return t.tag === 3 ? t.stateNode.containerInfo : null;
                    }
                    e = null;
                } else t !== e && (e = null);
            }
        }
        return ((fp = e), null);
    }
    function mp(e) {
        switch (e) {
            case `beforetoggle`:
            case `cancel`:
            case `click`:
            case `close`:
            case `contextmenu`:
            case `copy`:
            case `cut`:
            case `auxclick`:
            case `dblclick`:
            case `dragend`:
            case `dragstart`:
            case `drop`:
            case `focusin`:
            case `focusout`:
            case `input`:
            case `invalid`:
            case `keydown`:
            case `keypress`:
            case `keyup`:
            case `mousedown`:
            case `mouseup`:
            case `paste`:
            case `pause`:
            case `play`:
            case `pointercancel`:
            case `pointerdown`:
            case `pointerup`:
            case `ratechange`:
            case `reset`:
            case `resize`:
            case `seeked`:
            case `submit`:
            case `toggle`:
            case `touchcancel`:
            case `touchend`:
            case `touchstart`:
            case `volumechange`:
            case `change`:
            case `selectionchange`:
            case `textInput`:
            case `compositionstart`:
            case `compositionend`:
            case `compositionupdate`:
            case `beforeblur`:
            case `afterblur`:
            case `beforeinput`:
            case `blur`:
            case `fullscreenchange`:
            case `focus`:
            case `hashchange`:
            case `popstate`:
            case `select`:
            case `selectstart`:
                return 2;
            case `drag`:
            case `dragenter`:
            case `dragexit`:
            case `dragleave`:
            case `dragover`:
            case `mousemove`:
            case `mouseout`:
            case `mouseover`:
            case `pointermove`:
            case `pointerout`:
            case `pointerover`:
            case `scroll`:
            case `touchmove`:
            case `wheel`:
            case `mouseenter`:
            case `mouseleave`:
            case `pointerenter`:
            case `pointerleave`:
                return 8;
            case `message`:
                switch (Ie()) {
                    case Le:
                        return 2;
                    case Re:
                        return 8;
                    case ze:
                    case Be:
                        return 32;
                    case Ve:
                        return 268435456;
                    default:
                        return 32;
                }
            default:
                return 32;
        }
    }
    let hp = !1;
    let gp = null;
    let _p = null;
    let vp = null;
    const yp = new Map();
    const bp = new Map();
    const xp = [];
    var Sp =
        `mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset`.split(
            ` `
        );
    function Cp(e, t) {
        switch (e) {
            case `focusin`:
            case `focusout`:
                gp = null;
                break;
            case `dragenter`:
            case `dragleave`:
                _p = null;
                break;
            case `mouseover`:
            case `mouseout`:
                vp = null;
                break;
            case `pointerover`:
            case `pointerout`:
                yp.delete(t.pointerId);
                break;
            case `gotpointercapture`:
            case `lostpointercapture`:
                bp.delete(t.pointerId);
        }
    }
    function wp(e, t, n, r, i, a) {
        return e === null || e.nativeEvent !== a
            ? ((e = { blockedOn: t, domEventName: n, eventSystemFlags: r, nativeEvent: a, targetContainers: [i] }),
              t !== null && ((t = xt(t)), t !== null && ap(t)),
              e)
            : ((e.eventSystemFlags |= r), (t = e.targetContainers), i !== null && t.indexOf(i) === -1 && t.push(i), e);
    }
    function Tp(e, t, n, r, i) {
        switch (t) {
            case `focusin`:
                return ((gp = wp(gp, e, t, n, r, i)), !0);
            case `dragenter`:
                return ((_p = wp(_p, e, t, n, r, i)), !0);
            case `mouseover`:
                return ((vp = wp(vp, e, t, n, r, i)), !0);
            case `pointerover`:
                var a = i.pointerId;
                return (yp.set(a, wp(yp.get(a) || null, e, t, n, r, i)), !0);
            case `gotpointercapture`:
                return ((a = i.pointerId), bp.set(a, wp(bp.get(a) || null, e, t, n, r, i)), !0);
        }
        return !1;
    }
    function Ep(e) {
        let t = bt(e.target);
        if (t !== null) {
            const n = o(t);
            if (n !== null) {
                if (((t = n.tag), t === 13)) {
                    if (((t = s(n)), t !== null)) {
                        ((e.blockedOn = t),
                            pt(e.priority, function () {
                                op(n);
                            }));
                        return;
                    }
                } else if (t === 31) {
                    if (((t = c(n)), t !== null)) {
                        ((e.blockedOn = t),
                            pt(e.priority, function () {
                                op(n);
                            }));
                        return;
                    }
                } else if (t === 3 && n.stateNode.current.memoizedState.isDehydrated) {
                    e.blockedOn = n.tag === 3 ? n.stateNode.containerInfo : null;
                    return;
                }
            }
        }
        e.blockedOn = null;
    }
    function Dp(e) {
        if (e.blockedOn !== null) return !1;
        for (let t = e.targetContainers; t.length > 0;) {
            let n = dp(e.nativeEvent);
            if (n === null) {
                n = e.nativeEvent;
                const r = new n.constructor(n.type, n);
                ((rn = r), n.target.dispatchEvent(r), (rn = null));
            } else return ((t = xt(n)), t !== null && ap(t), (e.blockedOn = n), !1);
            t.shift();
        }
        return !0;
    }
    function Op(e, t, n) {
        Dp(e) && n.delete(t);
    }
    function kp() {
        ((hp = !1),
            gp !== null && Dp(gp) && (gp = null),
            _p !== null && Dp(_p) && (_p = null),
            vp !== null && Dp(vp) && (vp = null),
            yp.forEach(Op),
            bp.forEach(Op));
    }
    function Ap(e, n) {
        e.blockedOn === n &&
            ((e.blockedOn = null), hp || ((hp = !0), t.unstable_scheduleCallback(t.unstable_NormalPriority, kp)));
    }
    let jp = null;
    function Mp(e) {
        jp !== e &&
            ((jp = e),
            t.unstable_scheduleCallback(t.unstable_NormalPriority, function () {
                jp === e && (jp = null);
                for (let t = 0; t < e.length; t += 3) {
                    const n = e[t];
                    const r = e[t + 1];
                    const i = e[t + 2];
                    if (typeof r !== `function`) {
                        if (pp(r || n) === null) continue;
                        break;
                    }
                    const a = xt(n);
                    a !== null &&
                        (e.splice(t, 3), (t -= 3), Ts(a, { pending: !0, data: i, method: n.method, action: r }, r, i));
                }
            }));
    }
    function Np(e) {
        function t(t) {
            return Ap(t, e);
        }
        (gp !== null && Ap(gp, e), _p !== null && Ap(_p, e), vp !== null && Ap(vp, e), yp.forEach(t), bp.forEach(t));
        for (var n = 0; n < xp.length; n++) {
            var r = xp[n];
            r.blockedOn === e && (r.blockedOn = null);
        }
        for (; xp.length > 0 && ((n = xp[0]), n.blockedOn === null);) (Ep(n), n.blockedOn === null && xp.shift());
        if (((n = (e.ownerDocument || e).$$reactFormReplay), n != null)) {
            for (r = 0; r < n.length; r += 3) {
                let i = n[r];
                const a = n[r + 1];
                let o = i[j] || null;
                if (typeof a === `function`) o || Mp(n);
                else if (o) {
                    let s = null;
                    if (a && a.hasAttribute(`formAction`)) {
                        if (((i = a), (o = a[j] || null))) s = o.formAction;
                        else if (pp(i) !== null) continue;
                    } else s = o.action;
                    (typeof s === `function` ? (n[r + 1] = s) : (n.splice(r, 3), (r -= 3)), Mp(n));
                }
            }
        }
    }
    function Pp() {
        function e(e) {
            e.canIntercept &&
                e.info === `react-transition` &&
                e.intercept({
                    handler: function () {
                        return new Promise(function (e) {
                            return (i = e);
                        });
                    },
                    focusReset: `manual`,
                    scroll: `manual`
                });
        }
        function t() {
            (i !== null && (i(), (i = null)), r || setTimeout(n, 20));
        }
        function n() {
            if (!r && !navigation.transition) {
                const e = navigation.currentEntry;
                e &&
                    e.url != null &&
                    navigation.navigate(e.url, {
                        state: e.getState(),
                        info: `react-transition`,
                        history: `replace`
                    });
            }
        }
        if (typeof navigation === `object`) {
            var r = !1;
            var i = null;
            return (
                navigation.addEventListener(`navigate`, e),
                navigation.addEventListener(`navigatesuccess`, t),
                navigation.addEventListener(`navigateerror`, t),
                setTimeout(n, 100),
                function () {
                    ((r = !0),
                        navigation.removeEventListener(`navigate`, e),
                        navigation.removeEventListener(`navigatesuccess`, t),
                        navigation.removeEventListener(`navigateerror`, t),
                        i !== null && (i(), (i = null)));
                }
            );
        }
    }
    function Fp(e) {
        this._internalRoot = e;
    }
    ((Ip.prototype.render = Fp.prototype.render =
        function (e) {
            const t = this._internalRoot;
            if (t === null) throw Error(i(409));
            const n = t.current;
            np(n, pu(), e, t, null, null);
        }),
        (Ip.prototype.unmount = Fp.prototype.unmount =
            function () {
                const e = this._internalRoot;
                if (e !== null) {
                    this._internalRoot = null;
                    const t = e.containerInfo;
                    (np(e.current, 2, null, e, null, null), bu(), (t[M] = null));
                }
            }));
    function Ip(e) {
        this._internalRoot = e;
    }
    Ip.prototype.unstable_scheduleHydration = function (e) {
        if (e) {
            const t = ft();
            e = { blockedOn: null, target: e, priority: t };
            for (var n = 0; n < xp.length && t !== 0 && t < xp[n].priority; n++);
            (xp.splice(n, 0, e), n === 0 && Ep(e));
        }
    };
    const Lp = n.version;
    if (Lp !== `19.2.6`) throw Error(i(527, Lp, `19.2.6`));
    E.findDOMNode = function (e) {
        const t = e._reactInternals;
        if (t === void 0) {
            throw typeof e.render === `function` ? Error(i(188)) : ((e = Object.keys(e).join(`,`)), Error(i(268, e)));
        }
        return ((e = u(t)), (e = e === null ? null : d(e)), (e = e === null ? null : e.stateNode), e);
    };
    const Rp = {
        bundleType: 0,
        version: `19.2.6`,
        rendererPackageName: `react-dom`,
        currentDispatcherRef: T,
        reconcilerVersion: `19.2.6`
    };
    if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < `u`) {
        const zp = __REACT_DEVTOOLS_GLOBAL_HOOK__;
        if (!zp.isDisabled && zp.supportsFiber) {
            try {
                ((Ue = zp.inject(Rp)), (We = zp));
            } catch {}
        }
    }
    e.createRoot = function (e, t) {
        if (!a(e)) throw Error(i(299));
        let n = !1;
        let r = ``;
        let o = Js;
        let s = Ys;
        let c = Xs;
        return (
            t != null &&
                (!0 === t.unstable_strictMode && (n = !0),
                t.identifierPrefix !== void 0 && (r = t.identifierPrefix),
                t.onUncaughtError !== void 0 && (o = t.onUncaughtError),
                t.onCaughtError !== void 0 && (s = t.onCaughtError),
                t.onRecoverableError !== void 0 && (c = t.onRecoverableError)),
            (t = ep(e, 1, !1, null, null, n, r, null, o, s, c, Pp)),
            (e[M] = t.current),
            Sd(e),
            new Fp(t)
        );
    };
});
const y = s((e, t) => {
    function n() {
        if (!(
            typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > `u` || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE !== `function`
        )) {
            try {
                __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n);
            } catch (e) {
                console.error(e);
            }
        }
    }
    (n(), (t.exports = v()));
});
const b = s((e) => {
    const t = Symbol.for(`react.transitional.element`);
    const n = Symbol.for(`react.fragment`);
    function r(e, n, r) {
        let i = null;
        if ((r !== void 0 && (i = `` + r), n.key !== void 0 && (i = `` + n.key), `key` in n)) {
            for (const a in ((r = {}), n)) a !== `key` && (r[a] = n[a]);
        } else r = n;
        return ((n = r.ref), { $$typeof: t, type: e, key: i, ref: n === void 0 ? null : n, props: r });
    }
    ((e.Fragment = n), (e.jsx = r), (e.jsxs = r));
});
const x = s((e, t) => {
    t.exports = b();
});
const S = u(p(), 1);
const C = (0, S.createContext)({});
function w(e) {
    const t = (0, S.useRef)(null);
    return (t.current === null && (t.current = e()), t.current);
}
const ee = typeof window < `u`;
const te = ee ? S.useLayoutEffect : S.useEffect;
const ne = (0, S.createContext)(null);
function re(e, t) {
    e.indexOf(t) === -1 && e.push(t);
}
function ie(e, t) {
    const n = e.indexOf(t);
    n > -1 && e.splice(n, 1);
}
const ae = (e, t, n) => (n > t ? t : n < e ? e : n);
const oe = {};
const se = (e) => /^-?(?:\d+(?:\.\d+)?|\.\d+)$/u.test(e);
function ce(e) {
    return typeof e === `object` && !!e;
}
const le = (e) => /^0[^.\s]+$/u.test(e);
function ue(e) {
    let t;
    return () => (t === void 0 && (t = e()), t);
}
const T = (e) => e;
const E = (e, t) => (n) => t(e(n));
const de = (...e) => e.reduce(E);
const fe = (e, t, n) => {
    const r = t - e;
    return r === 0 ? 1 : (n - e) / r;
};
const pe = class {
    constructor() {
        this.subscriptions = [];
    }

    add(e) {
        return (re(this.subscriptions, e), () => ie(this.subscriptions, e));
    }

    notify(e, t, n) {
        const r = this.subscriptions.length;
        if (r) {
            if (r === 1) this.subscriptions[0](e, t, n);
            else {
                for (let i = 0; i < r; i++) {
                    const r = this.subscriptions[i];
                    r && r(e, t, n);
                }
            }
        }
    }

    getSize() {
        return this.subscriptions.length;
    }

    clear() {
        this.subscriptions.length = 0;
    }
};
const me = (e) => e * 1e3;
const D = (e) => e / 1e3;
function O(e, t) {
    return t ? (1e3 / t) * e : 0;
}
const he = (e, t, n) => (((1 - 3 * n + 3 * t) * e + (3 * n - 6 * t)) * e + 3 * t) * e;
const ge = 1e-7;
const _e = 12;
function ve(e, t, n, r, i) {
    let a;
    let o;
    let s = 0;
    do ((o = t + (n - t) / 2), (a = he(o, r, i) - e), a > 0 ? (n = o) : (t = o));
    while (Math.abs(a) > ge && ++s < _e);
    return o;
}
function ye(e, t, n, r) {
    if (e === t && n === r) return T;
    const i = (t) => ve(t, 0, 1, e, n);
    return (e) => (e === 0 || e === 1 ? e : he(i(e), t, r));
}
const be = (e) => (t) => (t <= 0.5 ? e(2 * t) / 2 : (2 - e(2 * (1 - t))) / 2);
const xe = (e) => (t) => 1 - e(1 - t);
const Se = ye(0.33, 1.53, 0.69, 0.99);
const Ce = xe(Se);
const we = be(Ce);
const Te = (e) => ((e *= 2) < 1 ? 0.5 * Ce(e) : 0.5 * (2 - 2 ** (-10 * (e - 1))));
const Ee = (e) => 1 - Math.sin(Math.acos(e));
const De = xe(Ee);
const Oe = be(Ee);
const ke = ye(0.42, 0, 1, 1);
const Ae = ye(0, 0, 0.58, 1);
const je = ye(0.42, 0, 0.58, 1);
const Me = (e) => Array.isArray(e) && typeof e[0] !== `number`;
const Ne = (e) => Array.isArray(e) && typeof e[0] === `number`;
const Pe = {
    linear: T,
    easeIn: ke,
    easeInOut: je,
    easeOut: Ae,
    circIn: Ee,
    circInOut: Oe,
    circOut: De,
    backIn: Ce,
    backInOut: we,
    backOut: Se,
    anticipate: Te
};
const Fe = (e) => typeof e === `string`;
const Ie = (e) => {
    if (Ne(e)) {
        e.length;
        const [t, n, r, i] = e;
        return ye(t, n, r, i);
    } else if (Fe(e)) return (Pe[e], `${e}`, Pe[e]);
    return e;
};
const Le = [`setup`, `read`, `resolveKeyframes`, `preUpdate`, `update`, `preRender`, `render`, `postRender`];
const Re = { value: null, addProjectionMetrics: null };
function ze(e, t) {
    let n = new Set();
    let r = new Set();
    let i = !1;
    let a = !1;
    const o = new WeakSet();
    let s = { delta: 0, timestamp: 0, isProcessing: !1 };
    let c = 0;
    function l(t) {
        (o.has(t) && (u.schedule(t), e()), c++, t(s));
    }
    const u = {
        schedule: (e, t = !1, a = !1) => {
            const s = a && i ? n : r;
            return (t && o.add(e), s.has(e) || s.add(e), e);
        },
        cancel: (e) => {
            (r.delete(e), o.delete(e));
        },
        process: (e) => {
            if (((s = e), i)) {
                a = !0;
                return;
            }
            ((i = !0),
                ([n, r] = [r, n]),
                n.forEach(l),
                t && Re.value && Re.value.frameloop[t].push(c),
                (c = 0),
                n.clear(),
                (i = !1),
                a && ((a = !1), u.process(e)));
        }
    };
    return u;
}
const Be = 40;
function Ve(e, t) {
    let n = !1;
    let r = !0;
    const i = { delta: 0, timestamp: 0, isProcessing: !1 };
    const a = () => (n = !0);
    const o = Le.reduce((e, n) => ((e[n] = ze(a, t ? n : void 0)), e), {});
    const {
        setup: s,
        read: c,
        resolveKeyframes: l,
        preUpdate: u,
        update: d,
        preRender: f,
        render: p,
        postRender: m
    } = o;
    const h = () => {
        const a = oe.useManualTiming ? i.timestamp : performance.now();
        ((n = !1),
            oe.useManualTiming || (i.delta = r ? 1e3 / 60 : Math.max(Math.min(a - i.timestamp, Be), 1)),
            (i.timestamp = a),
            (i.isProcessing = !0),
            s.process(i),
            c.process(i),
            l.process(i),
            u.process(i),
            d.process(i),
            f.process(i),
            p.process(i),
            m.process(i),
            (i.isProcessing = !1),
            n && t && ((r = !1), e(h)));
    };
    const g = () => {
        ((n = !0), (r = !0), i.isProcessing || e(h));
    };
    return {
        schedule: Le.reduce((e, t) => {
            const r = o[t];
            return ((e[t] = (e, t = !1, i = !1) => (n || g(), r.schedule(e, t, i))), e);
        }, {}),
        cancel: (e) => {
            for (let t = 0; t < Le.length; t++) o[Le[t]].cancel(e);
        },
        state: i,
        steps: o
    };
}
const {
    schedule: k,
    cancel: He,
    state: Ue,
    steps: We
} = Ve(typeof requestAnimationFrame < `u` ? requestAnimationFrame : T, !0);
let Ge;
function Ke() {
    Ge = void 0;
}
var qe = {
    now: () => (Ge === void 0 && qe.set(Ue.isProcessing || oe.useManualTiming ? Ue.timestamp : performance.now()), Ge),
    set: (e) => {
        ((Ge = e), queueMicrotask(Ke));
    }
};
const Je = { layout: 0, mainThread: 0, waapi: 0 };
const Ye = (e) => (t) => typeof t === `string` && t.startsWith(e);
const Xe = Ye(`--`);
const Ze = Ye(`var(--`);
const Qe = (e) => (Ze(e) ? $e.test(e.split(`/*`)[0].trim()) : !1);
var $e = /var\(--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)$/iu;
const et = { test: (e) => typeof e === `number`, parse: parseFloat, transform: (e) => e };
const tt = { ...et, transform: (e) => ae(0, 1, e) };
const nt = { ...et, default: 1 };
const rt = (e) => Math.round(e * 1e5) / 1e5;
const it = /-?(?:\d+(?:\.\d+)?|\.\d+)/gu;
function at(e) {
    return e == null;
}
const ot =
    /^(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))$/iu;
const st = (e, t) => (n) =>
    !!(
        (typeof n === `string` && ot.test(n) && n.startsWith(e)) ||
        (t && !at(n) && Object.prototype.hasOwnProperty.call(n, t))
    );
const ct = (e, t, n) => (r) => {
    if (typeof r !== `string`) return r;
    const [i, a, o, s] = r.match(it);
    return { [e]: parseFloat(i), [t]: parseFloat(a), [n]: parseFloat(o), alpha: s === void 0 ? 1 : parseFloat(s) };
};
const lt = (e) => ae(0, 255, e);
const ut = { ...et, transform: (e) => Math.round(lt(e)) };
const dt = {
    test: st(`rgb`, `red`),
    parse: ct(`red`, `green`, `blue`),
    transform: ({ red: e, green: t, blue: n, alpha: r = 1 }) =>
        `rgba(` + ut.transform(e) + `, ` + ut.transform(t) + `, ` + ut.transform(n) + `, ` + rt(tt.transform(r)) + `)`
};
function ft(e) {
    let t = ``;
    let n = ``;
    let r = ``;
    let i = ``;
    return (
        e.length > 5
            ? ((t = e.substring(1, 3)), (n = e.substring(3, 5)), (r = e.substring(5, 7)), (i = e.substring(7, 9)))
            : ((t = e.substring(1, 2)),
              (n = e.substring(2, 3)),
              (r = e.substring(3, 4)),
              (i = e.substring(4, 5)),
              (t += t),
              (n += n),
              (r += r),
              (i += i)),
        { red: parseInt(t, 16), green: parseInt(n, 16), blue: parseInt(r, 16), alpha: i ? parseInt(i, 16) / 255 : 1 }
    );
}
const pt = { test: st(`#`), parse: ft, transform: dt.transform };
const mt = (e) => ({
    test: (t) => typeof t === `string` && t.endsWith(e) && t.split(` `).length === 1,
    parse: parseFloat,
    transform: (t) => `${t}${e}`
});
const A = mt(`deg`);
const j = mt(`%`);
const M = mt(`px`);
const ht = mt(`vh`);
const gt = mt(`vw`);
const _t = { ...j, parse: (e) => j.parse(e) / 100, transform: (e) => j.transform(e * 100) };
const vt = {
    test: st(`hsl`, `hue`),
    parse: ct(`hue`, `saturation`, `lightness`),
    transform: ({ hue: e, saturation: t, lightness: n, alpha: r = 1 }) =>
        `hsla(` +
        Math.round(e) +
        `, ` +
        j.transform(rt(t)) +
        `, ` +
        j.transform(rt(n)) +
        `, ` +
        rt(tt.transform(r)) +
        `)`
};
var N = {
    test: (e) => dt.test(e) || pt.test(e) || vt.test(e),
    parse: (e) => (dt.test(e) ? dt.parse(e) : vt.test(e) ? vt.parse(e) : pt.parse(e)),
    transform: (e) => (typeof e === `string` ? e : e.hasOwnProperty(`red`) ? dt.transform(e) : vt.transform(e)),
    getAnimatableNone: (e) => {
        const t = N.parse(e);
        return ((t.alpha = 0), N.transform(t));
    }
};
const yt =
    /(?:#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\))/giu;
function bt(e) {
    return isNaN(e) && typeof e === `string` && (e.match(it)?.length || 0) + (e.match(yt)?.length || 0) > 0;
}
const xt = `number`;
const St = `color`;
const Ct = `var`;
const wt = `var(`;
const Tt = '${}';
const Et =
    /var\s*\(\s*--(?:[\w-]+\s*|[\w-]+\s*,(?:\s*[^)(\s]|\s*\((?:[^)(]|\([^)(]*\))*\))+\s*)\)|#[\da-f]{3,8}|(?:rgb|hsl)a?\((?:-?[\d.]+%?[,\s]+){2}-?[\d.]+%?\s*(?:[,/]\s*)?(?:\b\d+(?:\.\d+)?|\.\d+)?%?\)|-?(?:\d+(?:\.\d+)?|\.\d+)/giu;
function Dt(e) {
    const t = e.toString();
    const n = [];
    const r = { color: [], number: [], var: [] };
    const i = [];
    let a = 0;
    return {
        values: n,
        split: t
            .replace(
                Et,
                (e) => (
                    N.test(e)
                        ? (r.color.push(a), i.push(St), n.push(N.parse(e)))
                        : e.startsWith(wt)
                          ? (r.var.push(a), i.push(Ct), n.push(e))
                          : (r.number.push(a), i.push(xt), n.push(parseFloat(e))),
                    ++a,
                    Tt
                )
            )
            .split(Tt),
        indexes: r,
        types: i
    };
}
function Ot(e) {
    return Dt(e).values;
}
function kt(e) {
    const { split: t, types: n } = Dt(e);
    const r = t.length;
    return (e) => {
        let i = ``;
        for (let a = 0; a < r; a++) {
            if (((i += t[a]), e[a] !== void 0)) {
                const t = n[a];
                t === xt ? (i += rt(e[a])) : t === St ? (i += N.transform(e[a])) : (i += e[a]);
            }
        }
        return i;
    };
}
const At = (e) => (typeof e === `number` ? 0 : N.test(e) ? N.getAnimatableNone(e) : e);
function jt(e) {
    const t = Ot(e);
    return kt(e)(t.map(At));
}
const Mt = { test: bt, parse: Ot, createTransformer: kt, getAnimatableNone: jt };
function Nt(e, t, n) {
    return (
        n < 0 && (n += 1),
        n > 1 && --n,
        n < 1 / 6 ? e + (t - e) * 6 * n : n < 1 / 2 ? t : n < 2 / 3 ? e + (t - e) * (2 / 3 - n) * 6 : e
    );
}
function Pt({ hue: e, saturation: t, lightness: n, alpha: r }) {
    ((e /= 360), (t /= 100), (n /= 100));
    let i = 0;
    let a = 0;
    let o = 0;
    if (!t) i = a = o = n;
    else {
        const r = n < 0.5 ? n * (1 + t) : n + t - n * t;
        const s = 2 * n - r;
        ((i = Nt(s, r, e + 1 / 3)), (a = Nt(s, r, e)), (o = Nt(s, r, e - 1 / 3)));
    }
    return { red: Math.round(i * 255), green: Math.round(a * 255), blue: Math.round(o * 255), alpha: r };
}
function Ft(e, t) {
    return (n) => (n > 0 ? t : e);
}
const P = (e, t, n) => e + (t - e) * n;
const It = (e, t, n) => {
    const r = e * e;
    const i = n * (t * t - r) + r;
    return i < 0 ? 0 : Math.sqrt(i);
};
const Lt = [pt, dt, vt];
const Rt = (e) => Lt.find((t) => t.test(e));
function zt(e) {
    const t = Rt(e);
    if ((`${e}`, !t)) return !1;
    let n = t.parse(e);
    return (t === vt && (n = Pt(n)), n);
}
const Bt = (e, t) => {
    const n = zt(e);
    const r = zt(t);
    if (!n || !r) return Ft(e, t);
    const i = { ...n };
    return (e) => (
        (i.red = It(n.red, r.red, e)),
        (i.green = It(n.green, r.green, e)),
        (i.blue = It(n.blue, r.blue, e)),
        (i.alpha = P(n.alpha, r.alpha, e)),
        dt.transform(i)
    );
};
const Vt = new Set([`none`, `hidden`]);
function Ht(e, t) {
    return Vt.has(e) ? (n) => (n <= 0 ? e : t) : (n) => (n >= 1 ? t : e);
}
function Ut(e, t) {
    return (n) => P(e, t, n);
}
function Wt(e) {
    return typeof e === `number`
        ? Ut
        : typeof e === `string`
          ? Qe(e)
              ? Ft
              : N.test(e)
                ? Bt
                : Jt
          : Array.isArray(e)
            ? Gt
            : typeof e === `object`
              ? N.test(e)
                  ? Bt
                  : Kt
              : Ft;
}
function Gt(e, t) {
    const n = [...e];
    const r = n.length;
    const i = e.map((e, n) => Wt(e)(e, t[n]));
    return (e) => {
        for (let t = 0; t < r; t++) n[t] = i[t](e);
        return n;
    };
}
function Kt(e, t) {
    const n = { ...e, ...t };
    const r = {};
    for (const i in n) e[i] !== void 0 && t[i] !== void 0 && (r[i] = Wt(e[i])(e[i], t[i]));
    return (e) => {
        for (const t in r) n[t] = r[t](e);
        return n;
    };
}
function qt(e, t) {
    const n = [];
    const r = { color: 0, var: 0, number: 0 };
    for (let i = 0; i < t.values.length; i++) {
        const a = t.types[i];
        const o = e.indexes[a][r[a]];
        ((n[i] = e.values[o] ?? 0), r[a]++);
    }
    return n;
}
var Jt = (e, t) => {
    const n = Mt.createTransformer(t);
    const r = Dt(e);
    const i = Dt(t);
    return r.indexes.var.length === i.indexes.var.length &&
        r.indexes.color.length === i.indexes.color.length &&
        r.indexes.number.length >= i.indexes.number.length
        ? (Vt.has(e) && !i.values.length) || (Vt.has(t) && !r.values.length)
            ? Ht(e, t)
            : de(Gt(qt(r, i), i.values), n)
        : (`${e}${t}`, Ft(e, t));
};
function Yt(e, t, n) {
    return typeof e === `number` && typeof t === `number` && typeof n === `number` ? P(e, t, n) : Wt(e)(e, t);
}
const Xt = (e) => {
    const t = ({ timestamp: t }) => e(t);
    return {
        start: (e = !0) => k.update(t, e),
        stop: () => He(t),
        now: () => (Ue.isProcessing ? Ue.timestamp : qe.now())
    };
};
const Zt = (e, t, n = 10) => {
    let r = ``;
    const i = Math.max(Math.round(t / n), 2);
    for (let t = 0; t < i; t++) r += Math.round(e(t / (i - 1)) * 1e4) / 1e4 + `, `;
    return `linear(${r.substring(0, r.length - 2)})`;
};
const Qt = 2e4;
function $t(e) {
    let t = 0;
    let n = e.next(t);
    for (; !n.done && t < 2e4;) ((t += 50), (n = e.next(t)));
    return t >= 2e4 ? 1 / 0 : t;
}
function en(e, t = 100, n) {
    const r = n({ ...e, keyframes: [0, t] });
    const i = Math.min($t(r), Qt);
    return { type: `keyframes`, ease: (e) => r.next(i * e).value / t, duration: D(i) };
}
const tn = 5;
function nn(e, t, n) {
    const r = Math.max(t - tn, 0);
    return O(n - e(r), t - r);
}
const F = {
    stiffness: 100,
    damping: 10,
    mass: 1,
    velocity: 0,
    duration: 800,
    bounce: 0.3,
    visualDuration: 0.3,
    restSpeed: { granular: 0.01, default: 2 },
    restDelta: { granular: 0.005, default: 0.5 },
    minDuration: 0.01,
    maxDuration: 10,
    minDamping: 0.05,
    maxDamping: 1
};
const rn = 0.001;
function an({ duration: e = F.duration, bounce: t = F.bounce, velocity: n = F.velocity, mass: r = F.mass }) {
    let i, a;
    F.maxDuration;
    let o = 1 - t;
    ((o = ae(F.minDamping, F.maxDamping, o)),
        (e = ae(F.minDuration, F.maxDuration, D(e))),
        o < 1
            ? ((i = (t) => {
                  const r = t * o;
                  const i = r * e;
                  const a = r - n;
                  const s = cn(t, o);
                  const c = Math.exp(-i);
                  return rn - (a / s) * c;
              }),
              (a = (t) => {
                  const r = t * o * e;
                  const a = r * n + n;
                  const s = o ** 2 * t ** 2 * e;
                  const c = Math.exp(-r);
                  const l = cn(t ** 2, o);
                  return ((-i(t) + rn > 0 ? -1 : 1) * ((a - s) * c)) / l;
              }))
            : ((i = (t) => {
                  const r = Math.exp(-t * e);
                  const i = (t - n) * e + 1;
                  return -rn + r * i;
              }),
              (a = (t) => Math.exp(-t * e) * ((n - t) * (e * e)))));
    const s = 5 / e;
    const c = sn(i, a, s);
    if (((e = me(e)), isNaN(c))) return { stiffness: F.stiffness, damping: F.damping, duration: e };
    {
        const t = c ** 2 * r;
        return { stiffness: t, damping: o * 2 * Math.sqrt(r * t), duration: e };
    }
}
const on = 12;
function sn(e, t, n) {
    let r = n;
    for (let n = 1; n < on; n++) r -= e(r) / t(r);
    return r;
}
function cn(e, t) {
    return e * Math.sqrt(1 - t * t);
}
const ln = [`duration`, `bounce`];
const un = [`stiffness`, `damping`, `mass`];
function dn(e, t) {
    return t.some((t) => e[t] !== void 0);
}
function fn(e) {
    let t = {
        velocity: F.velocity,
        stiffness: F.stiffness,
        damping: F.damping,
        mass: F.mass,
        isResolvedFromDuration: !1,
        ...e
    };
    if (!dn(e, un) && dn(e, ln)) {
        if (e.visualDuration) {
            const n = e.visualDuration;
            const r = (2 * Math.PI) / (n * 1.2);
            const i = r * r;
            const a = 2 * ae(0.05, 1, 1 - (e.bounce || 0)) * Math.sqrt(i);
            t = { ...t, mass: F.mass, stiffness: i, damping: a };
        } else {
            const n = an(e);
            ((t = { ...t, ...n, mass: F.mass }), (t.isResolvedFromDuration = !0));
        }
    }
    return t;
}
function pn(e = F.visualDuration, t = F.bounce) {
    const n = typeof e === `object` ? e : { visualDuration: e, keyframes: [0, 1], bounce: t };
    let { restSpeed: r, restDelta: i } = n;
    const a = n.keyframes[0];
    const o = n.keyframes[n.keyframes.length - 1];
    const s = { done: !1, value: a };
    const {
        stiffness: c,
        damping: l,
        mass: u,
        duration: d,
        velocity: f,
        isResolvedFromDuration: p
    } = fn({ ...n, velocity: -D(n.velocity || 0) });
    const m = f || 0;
    const h = l / (2 * Math.sqrt(c * u));
    const g = o - a;
    const _ = D(Math.sqrt(c / u));
    const v = Math.abs(g) < 5;
    ((r ||= v ? F.restSpeed.granular : F.restSpeed.default), (i ||= v ? F.restDelta.granular : F.restDelta.default));
    let y;
    if (h < 1) {
        const e = cn(_, h);
        y = (t) => o - Math.exp(-h * _ * t) * (((m + h * _ * g) / e) * Math.sin(e * t) + g * Math.cos(e * t));
    } else if (h === 1) y = (e) => o - Math.exp(-_ * e) * (g + (m + _ * g) * e);
    else {
        const e = _ * Math.sqrt(h * h - 1);
        y = (t) => {
            const n = Math.exp(-h * _ * t);
            const r = Math.min(e * t, 300);
            return o - (n * ((m + h * _ * g) * Math.sinh(r) + e * g * Math.cosh(r))) / e;
        };
    }
    const b = {
        calculatedDuration: (p && d) || null,
        next: (e) => {
            const t = y(e);
            if (p) s.done = e >= d;
            else {
                let n = e === 0 ? m : 0;
                h < 1 && (n = e === 0 ? me(m) : nn(y, e, t));
                const a = Math.abs(n) <= r;
                const c = Math.abs(o - t) <= i;
                s.done = a && c;
            }
            return ((s.value = s.done ? o : t), s);
        },
        toString: () => {
            const e = Math.min($t(b), Qt);
            const t = Zt((t) => b.next(e * t).value, e, 30);
            return e + `ms ` + t;
        },
        toTransition: () => {}
    };
    return b;
}
pn.applyToOptions = (e) => {
    const t = en(e, 100, pn);
    return ((e.ease = t.ease), (e.duration = me(t.duration)), (e.type = `keyframes`), e);
};
function mn({
    keyframes: e,
    velocity: t = 0,
    power: n = 0.8,
    timeConstant: r = 325,
    bounceDamping: i = 10,
    bounceStiffness: a = 500,
    modifyTarget: o,
    min: s,
    max: c,
    restDelta: l = 0.5,
    restSpeed: u
}) {
    const d = e[0];
    const f = { done: !1, value: d };
    const p = (e) => (s !== void 0 && e < s) || (c !== void 0 && e > c);
    const m = (e) => (s === void 0 ? c : c === void 0 || Math.abs(s - e) < Math.abs(c - e) ? s : c);
    let h = n * t;
    const g = d + h;
    const _ = o === void 0 ? g : o(g);
    _ !== g && (h = _ - d);
    const v = (e) => -h * Math.exp(-e / r);
    const y = (e) => _ + v(e);
    const b = (e) => {
        const t = v(e);
        const n = y(e);
        ((f.done = Math.abs(t) <= l), (f.value = f.done ? _ : n));
    };
    let x;
    let S;
    const C = (e) => {
        p(f.value) &&
            ((x = e),
            (S = pn({
                keyframes: [f.value, m(f.value)],
                velocity: nn(y, e, f.value),
                damping: i,
                stiffness: a,
                restDelta: l,
                restSpeed: u
            })));
    };
    return (
        C(0),
        {
            calculatedDuration: null,
            next: (e) => {
                let t = !1;
                return (
                    !S && x === void 0 && ((t = !0), b(e), C(e)),
                    x !== void 0 && e >= x ? S.next(e - x) : (!t && b(e), f)
                );
            }
        }
    );
}
function hn(e, t, n) {
    const r = [];
    const i = n || oe.mix || Yt;
    const a = e.length - 1;
    for (let n = 0; n < a; n++) {
        let a = i(e[n], e[n + 1]);
        (t && (a = de(Array.isArray(t) ? t[n] || T : t, a)), r.push(a));
    }
    return r;
}
function gn(e, t, { clamp: n = !0, ease: r, mixer: i } = {}) {
    const a = e.length;
    if ((t.length, a === 1)) return () => t[0];
    if (a === 2 && t[0] === t[1]) return () => t[1];
    const o = e[0] === e[1];
    e[0] > e[a - 1] && ((e = [...e].reverse()), (t = [...t].reverse()));
    const s = hn(t, r, i);
    const c = s.length;
    const l = (n) => {
        if (o && n < e[0]) return t[0];
        let r = 0;
        if (c > 1) for (; r < e.length - 2 && !(n < e[r + 1]); r++);
        const i = fe(e[r], e[r + 1], n);
        return s[r](i);
    };
    return n ? (t) => l(ae(e[0], e[a - 1], t)) : l;
}
function _n(e, t) {
    const n = e[e.length - 1];
    for (let r = 1; r <= t; r++) {
        const i = fe(0, t, r);
        e.push(P(n, 1, i));
    }
}
function vn(e) {
    const t = [0];
    return (_n(t, e.length - 1), t);
}
function yn(e, t) {
    return e.map((e) => e * t);
}
function bn(e, t) {
    return e.map(() => t || je).splice(0, e.length - 1);
}
function xn({ duration: e = 300, keyframes: t, times: n, ease: r = `easeInOut` }) {
    const i = Me(r) ? r.map(Ie) : Ie(r);
    const a = { done: !1, value: t[0] };
    const o = gn(yn(n && n.length === t.length ? n : vn(t), e), t, { ease: Array.isArray(i) ? i : bn(t, i) });
    return { calculatedDuration: e, next: (t) => ((a.value = o(t)), (a.done = t >= e), a) };
}
const Sn = (e) => e !== null;
function Cn(e, { repeat: t, repeatType: n = `loop` }, r, i = 1) {
    const a = e.filter(Sn);
    const o = i < 0 || (t && n !== `loop` && t % 2 == 1) ? 0 : a.length - 1;
    return !o || r === void 0 ? a[o] : r;
}
const wn = { decay: mn, inertia: mn, tween: xn, keyframes: xn, spring: pn };
function Tn(e) {
    typeof e.type === `string` && (e.type = wn[e.type]);
}
const En = class {
    constructor() {
        this.updateFinished();
    }

    get finished() {
        return this._finished;
    }

    updateFinished() {
        this._finished = new Promise((e) => {
            this.resolve = e;
        });
    }

    notifyFinished() {
        this.resolve();
    }

    then(e, t) {
        return this.finished.then(e, t);
    }
};
const Dn = (e) => e / 100;
const On = class extends En {
    constructor(e) {
        (super(),
            (this.state = `idle`),
            (this.startTime = null),
            (this.isStopped = !1),
            (this.currentTime = 0),
            (this.holdTime = null),
            (this.playbackSpeed = 1),
            (this.stop = () => {
                const { motionValue: e } = this.options;
                (e && e.updatedAt !== qe.now() && this.tick(qe.now()),
                    (this.isStopped = !0),
                    this.state !== `idle` && (this.teardown(), this.options.onStop?.()));
            }),
            Je.mainThread++,
            (this.options = e),
            this.initAnimation(),
            this.play(),
            e.autoplay === !1 && this.pause());
    }

    initAnimation() {
        const { options: e } = this;
        Tn(e);
        const { type: t = xn, repeat: n = 0, repeatDelay: r = 0, repeatType: i, velocity: a = 0 } = e;
        let { keyframes: o } = e;
        const s = t || xn;
        s !== xn && typeof o[0] !== `number` && ((this.mixKeyframes = de(Dn, Yt(o[0], o[1]))), (o = [0, 100]));
        const c = s({ ...e, keyframes: o });
        (i === `mirror` && (this.mirroredGenerator = s({ ...e, keyframes: [...o].reverse(), velocity: -a })),
            c.calculatedDuration === null && (c.calculatedDuration = $t(c)));
        const { calculatedDuration: l } = c;
        ((this.calculatedDuration = l),
            (this.resolvedDuration = l + r),
            (this.totalDuration = this.resolvedDuration * (n + 1) - r),
            (this.generator = c));
    }

    updateTime(e) {
        const t = Math.round(e - this.startTime) * this.playbackSpeed;
        this.holdTime === null ? (this.currentTime = t) : (this.currentTime = this.holdTime);
    }

    tick(e, t = !1) {
        const {
            generator: n,
            totalDuration: r,
            mixKeyframes: i,
            mirroredGenerator: a,
            resolvedDuration: o,
            calculatedDuration: s
        } = this;
        if (this.startTime === null) return n.next(0);
        const {
            delay: c = 0,
            keyframes: l,
            repeat: u,
            repeatType: d,
            repeatDelay: f,
            type: p,
            onUpdate: m,
            finalKeyframe: h
        } = this.options;
        (this.speed > 0
            ? (this.startTime = Math.min(this.startTime, e))
            : this.speed < 0 && (this.startTime = Math.min(e - r / this.speed, this.startTime)),
            t ? (this.currentTime = e) : this.updateTime(e));
        const g = this.currentTime - c * (this.playbackSpeed >= 0 ? 1 : -1);
        const _ = this.playbackSpeed >= 0 ? g < 0 : g > r;
        ((this.currentTime = Math.max(g, 0)),
            this.state === `finished` && this.holdTime === null && (this.currentTime = r));
        let v = this.currentTime;
        let y = n;
        if (u) {
            const e = Math.min(this.currentTime, r) / o;
            let t = Math.floor(e);
            let n = e % 1;
            (!n && e >= 1 && (n = 1),
                n === 1 && t--,
                (t = Math.min(t, u + 1)),
                t % 2 && (d === `reverse` ? ((n = 1 - n), f && (n -= f / o)) : d === `mirror` && (y = a)),
                (v = ae(0, 1, n) * o));
        }
        const b = _ ? { done: !1, value: l[0] } : y.next(v);
        i && (b.value = i(b.value));
        let { done: x } = b;
        !_ && s !== null && (x = this.playbackSpeed >= 0 ? this.currentTime >= r : this.currentTime <= 0);
        const S = this.holdTime === null && (this.state === `finished` || (this.state === `running` && x));
        return (
            S && p !== mn && (b.value = Cn(l, this.options, h, this.speed)),
            m && m(b.value),
            S && this.finish(),
            b
        );
    }

    then(e, t) {
        return this.finished.then(e, t);
    }

    get duration() {
        return D(this.calculatedDuration);
    }

    get iterationDuration() {
        const { delay: e = 0 } = this.options || {};
        return this.duration + D(e);
    }

    get time() {
        return D(this.currentTime);
    }

    set time(e) {
        ((e = me(e)),
            (this.currentTime = e),
            this.startTime === null || this.holdTime !== null || this.playbackSpeed === 0
                ? (this.holdTime = e)
                : this.driver && (this.startTime = this.driver.now() - e / this.playbackSpeed),
            this.driver?.start(!1));
    }

    get speed() {
        return this.playbackSpeed;
    }

    set speed(e) {
        this.updateTime(qe.now());
        const t = this.playbackSpeed !== e;
        ((this.playbackSpeed = e), t && (this.time = D(this.currentTime)));
    }

    play() {
        if (this.isStopped) return;
        const { driver: e = Xt, startTime: t } = this.options;
        ((this.driver ||= e((e) => this.tick(e))), this.options.onPlay?.());
        const n = this.driver.now();
        (this.state === `finished`
            ? (this.updateFinished(), (this.startTime = n))
            : this.holdTime === null
              ? (this.startTime ||= t ?? n)
              : (this.startTime = n - this.holdTime),
            this.state === `finished` && this.speed < 0 && (this.startTime += this.calculatedDuration),
            (this.holdTime = null),
            (this.state = `running`),
            this.driver.start());
    }

    pause() {
        ((this.state = `paused`), this.updateTime(qe.now()), (this.holdTime = this.currentTime));
    }

    complete() {
        (this.state !== `running` && this.play(), (this.state = `finished`), (this.holdTime = null));
    }

    finish() {
        (this.notifyFinished(), this.teardown(), (this.state = `finished`), this.options.onComplete?.());
    }

    cancel() {
        ((this.holdTime = null), (this.startTime = 0), this.tick(0), this.teardown(), this.options.onCancel?.());
    }

    teardown() {
        ((this.state = `idle`), this.stopDriver(), (this.startTime = this.holdTime = null), Je.mainThread--);
    }

    stopDriver() {
        this.driver &&= (this.driver.stop(), void 0);
    }

    sample(e) {
        return ((this.startTime = 0), this.tick(e, !0));
    }

    attachTimeline(e) {
        return (
            this.options.allowFlatten &&
                ((this.options.type = `keyframes`), (this.options.ease = `linear`), this.initAnimation()),
            this.driver?.stop(),
            e.observe(this)
        );
    }
};
function kn(e) {
    for (let t = 1; t < e.length; t++) e[t] ?? (e[t] = e[t - 1]);
}
const An = (e) => (e * 180) / Math.PI;
const jn = (e) => Nn(An(Math.atan2(e[1], e[0])));
const Mn = {
    x: 4,
    y: 5,
    translateX: 4,
    translateY: 5,
    scaleX: 0,
    scaleY: 3,
    scale: (e) => (Math.abs(e[0]) + Math.abs(e[3])) / 2,
    rotate: jn,
    rotateZ: jn,
    skewX: (e) => An(Math.atan(e[1])),
    skewY: (e) => An(Math.atan(e[2])),
    skew: (e) => (Math.abs(e[1]) + Math.abs(e[2])) / 2
};
var Nn = (e) => ((e %= 360), e < 0 && (e += 360), e);
const Pn = jn;
const Fn = (e) => Math.sqrt(e[0] * e[0] + e[1] * e[1]);
const In = (e) => Math.sqrt(e[4] * e[4] + e[5] * e[5]);
const Ln = {
    x: 12,
    y: 13,
    z: 14,
    translateX: 12,
    translateY: 13,
    translateZ: 14,
    scaleX: Fn,
    scaleY: In,
    scale: (e) => (Fn(e) + In(e)) / 2,
    rotateX: (e) => Nn(An(Math.atan2(e[6], e[5]))),
    rotateY: (e) => Nn(An(Math.atan2(-e[2], e[0]))),
    rotateZ: Pn,
    rotate: Pn,
    skewX: (e) => An(Math.atan(e[4])),
    skewY: (e) => An(Math.atan(e[1])),
    skew: (e) => (Math.abs(e[1]) + Math.abs(e[4])) / 2
};
function Rn(e) {
    return +!!e.includes(`scale`);
}
function zn(e, t) {
    if (!e || e === `none`) return Rn(t);
    const n = e.match(/^matrix3d\(([-\d.e\s,]+)\)$/u);
    let r;
    let i;
    if (n) ((r = Ln), (i = n));
    else {
        const t = e.match(/^matrix\(([-\d.e\s,]+)\)$/u);
        ((r = Mn), (i = t));
    }
    if (!i) return Rn(t);
    const a = r[t];
    const o = i[1].split(`,`).map(Vn);
    return typeof a === `function` ? a(o) : o[a];
}
const Bn = (e, t) => {
    const { transform: n = `none` } = getComputedStyle(e);
    return zn(n, t);
};
function Vn(e) {
    return parseFloat(e.trim());
}
const Hn = [
    `transformPerspective`,
    `x`,
    `y`,
    `z`,
    `translateX`,
    `translateY`,
    `translateZ`,
    `scale`,
    `scaleX`,
    `scaleY`,
    `rotate`,
    `rotateX`,
    `rotateY`,
    `rotateZ`,
    `skew`,
    `skewX`,
    `skewY`
];
const Un = new Set(Hn);
const Wn = (e) => e === et || e === M;
const Gn = new Set([`x`, `y`, `z`]);
const Kn = Hn.filter((e) => !Gn.has(e));
function qn(e) {
    const t = [];
    return (
        Kn.forEach((n) => {
            const r = e.getValue(n);
            r !== void 0 && (t.push([n, r.get()]), r.set(+!!n.startsWith(`scale`)));
        }),
        t
    );
}
const Jn = {
    width: ({ x: e }, { paddingLeft: t = `0`, paddingRight: n = `0` }) => e.max - e.min - parseFloat(t) - parseFloat(n),
    height: ({ y: e }, { paddingTop: t = `0`, paddingBottom: n = `0` }) =>
        e.max - e.min - parseFloat(t) - parseFloat(n),
    top: (e, { top: t }) => parseFloat(t),
    left: (e, { left: t }) => parseFloat(t),
    bottom: ({ y: e }, { top: t }) => parseFloat(t) + (e.max - e.min),
    right: ({ x: e }, { left: t }) => parseFloat(t) + (e.max - e.min),
    x: (e, { transform: t }) => zn(t, `x`),
    y: (e, { transform: t }) => zn(t, `y`)
};
((Jn.translateX = Jn.x), (Jn.translateY = Jn.y));
const Yn = new Set();
let Xn = !1;
let Zn = !1;
let Qn = !1;
function $n() {
    if (Zn) {
        const e = Array.from(Yn).filter((e) => e.needsMeasurement);
        const t = new Set(e.map((e) => e.element));
        const n = new Map();
        (t.forEach((e) => {
            const t = qn(e);
            t.length && (n.set(e, t), e.render());
        }),
            e.forEach((e) => e.measureInitialState()),
            t.forEach((e) => {
                e.render();
                const t = n.get(e);
                t &&
                    t.forEach(([t, n]) => {
                        e.getValue(t)?.set(n);
                    });
            }),
            e.forEach((e) => e.measureEndState()),
            e.forEach((e) => {
                e.suspendedScrollY !== void 0 && window.scrollTo(0, e.suspendedScrollY);
            }));
    }
    ((Zn = !1), (Xn = !1), Yn.forEach((e) => e.complete(Qn)), Yn.clear());
}
function er() {
    Yn.forEach((e) => {
        (e.readKeyframes(), e.needsMeasurement && (Zn = !0));
    });
}
function tr() {
    ((Qn = !0), er(), $n(), (Qn = !1));
}
const nr = class {
    constructor(e, t, n, r, i, a = !1) {
        ((this.state = `pending`),
            (this.isAsync = !1),
            (this.needsMeasurement = !1),
            (this.unresolvedKeyframes = [...e]),
            (this.onComplete = t),
            (this.name = n),
            (this.motionValue = r),
            (this.element = i),
            (this.isAsync = a));
    }

    scheduleResolve() {
        ((this.state = `scheduled`),
            this.isAsync
                ? (Yn.add(this), Xn || ((Xn = !0), k.read(er), k.resolveKeyframes($n)))
                : (this.readKeyframes(), this.complete()));
    }

    readKeyframes() {
        const { unresolvedKeyframes: e, name: t, element: n, motionValue: r } = this;
        if (e[0] === null) {
            const i = r?.get();
            const a = e[e.length - 1];
            if (i !== void 0) e[0] = i;
            else if (n && t) {
                const r = n.readValue(t, a);
                r != null && (e[0] = r);
            }
            (e[0] === void 0 && (e[0] = a), r && i === void 0 && r.set(e[0]));
        }
        kn(e);
    }

    setFinalKeyframe() {}
    measureInitialState() {}
    renderEndStyles() {}
    measureEndState() {}
    complete(e = !1) {
        ((this.state = `complete`), this.onComplete(this.unresolvedKeyframes, this.finalKeyframe, e), Yn.delete(this));
    }

    cancel() {
        this.state === `scheduled` && (Yn.delete(this), (this.state = `pending`));
    }

    resume() {
        this.state === `pending` && this.scheduleResolve();
    }
};
const rr = (e) => e.startsWith(`--`);
function ir(e, t, n) {
    rr(t) ? e.style.setProperty(t, n) : (e.style[t] = n);
}
const ar = ue(() => window.ScrollTimeline !== void 0);
const or = {};
function sr(e, t) {
    const n = ue(e);
    return () => or[t] ?? n();
}
const cr = sr(() => {
    try {
        document.createElement(`div`).animate({ opacity: 0 }, { easing: `linear(0, 1)` });
    } catch {
        return !1;
    }
    return !0;
}, `linearEasing`);
const lr = ([e, t, n, r]) => `cubic-bezier(${e}, ${t}, ${n}, ${r})`;
const ur = {
    linear: `linear`,
    ease: `ease`,
    easeIn: `ease-in`,
    easeOut: `ease-out`,
    easeInOut: `ease-in-out`,
    circIn: lr([0, 0.65, 0.55, 1]),
    circOut: lr([0.55, 0, 1, 0.45]),
    backIn: lr([0.31, 0.01, 0.66, -0.59]),
    backOut: lr([0.33, 1.53, 0.69, 0.99])
};
function dr(e, t) {
    if (e) {
        return typeof e === `function`
            ? cr()
                ? Zt(e, t)
                : `ease-out`
            : Ne(e)
              ? lr(e)
              : Array.isArray(e)
                ? e.map((e) => dr(e, t) || ur.easeOut)
                : ur[e];
    }
}
function fr(
    e,
    t,
    n,
    { delay: r = 0, duration: i = 300, repeat: a = 0, repeatType: o = `loop`, ease: s = `easeOut`, times: c } = {},
    l = void 0
) {
    const u = { [t]: n };
    c && (u.offset = c);
    const d = dr(s, i);
    (Array.isArray(d) && (u.easing = d), Re.value && Je.waapi++);
    const f = {
        delay: r,
        duration: i,
        easing: Array.isArray(d) ? `linear` : d,
        fill: `both`,
        iterations: a + 1,
        direction: o === `reverse` ? `alternate` : `normal`
    };
    l && (f.pseudoElement = l);
    const p = e.animate(u, f);
    return (
        Re.value &&
            p.finished.finally(() => {
                Je.waapi--;
            }),
        p
    );
}
function pr(e) {
    return typeof e === `function` && `applyToOptions` in e;
}
function mr({ type: e, ...t }) {
    return pr(e) && cr() ? e.applyToOptions(t) : ((t.duration ??= 300), (t.ease ??= `easeOut`), t);
}
const hr = class extends En {
    constructor(e) {
        if ((super(), (this.finishedTime = null), (this.isStopped = !1), !e)) return;
        const {
            element: t,
            name: n,
            keyframes: r,
            pseudoElement: i,
            allowFlatten: a = !1,
            finalKeyframe: o,
            onComplete: s
        } = e;
        ((this.isPseudoElement = !!i), (this.allowFlatten = a), (this.options = e), e.type);
        const c = mr(e);
        ((this.animation = fr(t, n, r, c, i)),
            c.autoplay === !1 && this.animation.pause(),
            (this.animation.onfinish = () => {
                if (((this.finishedTime = this.time), !i)) {
                    const e = Cn(r, this.options, o, this.speed);
                    (this.updateMotionValue ? this.updateMotionValue(e) : ir(t, n, e), this.animation.cancel());
                }
                (s?.(), this.notifyFinished());
            }));
    }

    play() {
        this.isStopped || (this.animation.play(), this.state === `finished` && this.updateFinished());
    }

    pause() {
        this.animation.pause();
    }

    complete() {
        this.animation.finish?.();
    }

    cancel() {
        try {
            this.animation.cancel();
        } catch {}
    }

    stop() {
        if (this.isStopped) return;
        this.isStopped = !0;
        const { state: e } = this;
        e === `idle` ||
            e === `finished` ||
            (this.updateMotionValue ? this.updateMotionValue() : this.commitStyles(),
            this.isPseudoElement || this.cancel());
    }

    commitStyles() {
        this.isPseudoElement || this.animation.commitStyles?.();
    }

    get duration() {
        const e = this.animation.effect?.getComputedTiming?.().duration || 0;
        return D(Number(e));
    }

    get iterationDuration() {
        const { delay: e = 0 } = this.options || {};
        return this.duration + D(e);
    }

    get time() {
        return D(Number(this.animation.currentTime) || 0);
    }

    set time(e) {
        ((this.finishedTime = null), (this.animation.currentTime = me(e)));
    }

    get speed() {
        return this.animation.playbackRate;
    }

    set speed(e) {
        (e < 0 && (this.finishedTime = null), (this.animation.playbackRate = e));
    }

    get state() {
        return this.finishedTime === null ? this.animation.playState : `finished`;
    }

    get startTime() {
        return Number(this.animation.startTime);
    }

    set startTime(e) {
        this.animation.startTime = e;
    }

    attachTimeline({ timeline: e, observe: t }) {
        return (
            this.allowFlatten && this.animation.effect?.updateTiming({ easing: `linear` }),
            (this.animation.onfinish = null),
            e && ar() ? ((this.animation.timeline = e), T) : t(this)
        );
    }
};
const gr = { anticipate: Te, backInOut: we, circInOut: Oe };
function _r(e) {
    return e in gr;
}
function vr(e) {
    typeof e.ease === `string` && _r(e.ease) && (e.ease = gr[e.ease]);
}
const yr = 10;
const br = class extends hr {
    constructor(e) {
        (vr(e), Tn(e), super(e), e.startTime && (this.startTime = e.startTime), (this.options = e));
    }

    updateMotionValue(e) {
        const { motionValue: t, onUpdate: n, onComplete: r, element: i, ...a } = this.options;
        if (!t) return;
        if (e !== void 0) {
            t.set(e);
            return;
        }
        const o = new On({ ...a, autoplay: !1 });
        const s = me(this.finishedTime ?? this.time);
        (t.setWithVelocity(o.sample(s - yr).value, o.sample(s).value, yr), o.stop());
    }
};
const xr = (e, t) =>
    t === `zIndex`
        ? !1
        : !!(
              typeof e === `number` ||
              Array.isArray(e) ||
              (typeof e === `string` && (Mt.test(e) || e === `0`) && !e.startsWith(`url(`))
          );
function Sr(e) {
    const t = e[0];
    if (e.length === 1) return !0;
    for (let n = 0; n < e.length; n++) if (e[n] !== t) return !0;
}
function Cr(e, t, n, r) {
    const i = e[0];
    if (i === null) return !1;
    if (t === `display` || t === `visibility`) return !0;
    const a = e[e.length - 1];
    const o = xr(i, t);
    const s = xr(a, t);
    return (`${t}${i}${a}${o ? a : i}`, !o || !s ? !1 : Sr(e) || ((n === `spring` || pr(n)) && r));
}
function wr(e) {
    ((e.duration = 0), (e.type = `keyframes`));
}
const Tr = new Set([`opacity`, `clipPath`, `filter`, `transform`]);
const Er = ue(() => Object.hasOwnProperty.call(Element.prototype, `animate`));
function Dr(e) {
    const { motionValue: t, name: n, repeatDelay: r, repeatType: i, damping: a, type: o } = e;
    if (!(t?.owner?.current instanceof HTMLElement)) return !1;
    const { onUpdate: s, transformTemplate: c } = t.owner.getProps();
    return (
        Er() && n && Tr.has(n) && (n !== `transform` || !c) && !s && !r && i !== `mirror` && a !== 0 && o !== `inertia`
    );
}
const Or = 40;
const kr = class extends En {
    constructor({
        autoplay: e = !0,
        delay: t = 0,
        type: n = `keyframes`,
        repeat: r = 0,
        repeatDelay: i = 0,
        repeatType: a = `loop`,
        keyframes: o,
        name: s,
        motionValue: c,
        element: l,
        ...u
    }) {
        (super(),
            (this.stop = () => {
                (this._animation && (this._animation.stop(), this.stopTimeline?.()), this.keyframeResolver?.cancel());
            }),
            (this.createdAt = qe.now()));
        const d = {
            autoplay: e,
            delay: t,
            type: n,
            repeat: r,
            repeatDelay: i,
            repeatType: a,
            name: s,
            motionValue: c,
            element: l,
            ...u
        };
        const f = l?.KeyframeResolver || nr;
        ((this.keyframeResolver = new f(o, (e, t, n) => this.onKeyframesResolved(e, t, d, !n), s, c, l)),
            this.keyframeResolver?.scheduleResolve());
    }

    onKeyframesResolved(e, t, n, r) {
        this.keyframeResolver = void 0;
        const { name: i, type: a, velocity: o, delay: s, isHandoff: c, onUpdate: l } = n;
        ((this.resolvedAt = qe.now()),
            Cr(e, i, a, o) ||
                ((oe.instantAnimations || !s) && l?.(Cn(e, n, t)), (e[0] = e[e.length - 1]), wr(n), (n.repeat = 0)));
        const u = {
            startTime: r
                ? this.resolvedAt && this.resolvedAt - this.createdAt > Or
                    ? this.resolvedAt
                    : this.createdAt
                : void 0,
            finalKeyframe: t,
            ...n,
            keyframes: e
        };
        const d = !c && Dr(u) ? new br({ ...u, element: u.motionValue.owner.current }) : new On(u);
        (d.finished.then(() => this.notifyFinished()).catch(T),
            (this.pendingTimeline &&= ((this.stopTimeline = d.attachTimeline(this.pendingTimeline)), void 0)),
            (this._animation = d));
    }

    get finished() {
        return this._animation ? this.animation.finished : this._finished;
    }

    then(e, t) {
        return this.finished.finally(e).then(() => {});
    }

    get animation() {
        return (this._animation || (this.keyframeResolver?.resume(), tr()), this._animation);
    }

    get duration() {
        return this.animation.duration;
    }

    get iterationDuration() {
        return this.animation.iterationDuration;
    }

    get time() {
        return this.animation.time;
    }

    set time(e) {
        this.animation.time = e;
    }

    get speed() {
        return this.animation.speed;
    }

    get state() {
        return this.animation.state;
    }

    set speed(e) {
        this.animation.speed = e;
    }

    get startTime() {
        return this.animation.startTime;
    }

    attachTimeline(e) {
        return (
            this._animation ? (this.stopTimeline = this.animation.attachTimeline(e)) : (this.pendingTimeline = e),
            () => this.stop()
        );
    }

    play() {
        this.animation.play();
    }

    pause() {
        this.animation.pause();
    }

    complete() {
        this.animation.complete();
    }

    cancel() {
        (this._animation && this.animation.cancel(), this.keyframeResolver?.cancel());
    }
};
const Ar = /^var\(--(?:([\w-]+)|([\w-]+), ?([a-zA-Z\d ()%#.,-]+))\)/u;
function jr(e) {
    const t = Ar.exec(e);
    if (!t) return [,];
    const [, n, r, i] = t;
    return [`--${n ?? r}`, i];
}
function Mr(e, t, n = 1) {
    `${e}`;
    const [r, i] = jr(e);
    if (!r) return;
    const a = window.getComputedStyle(t).getPropertyValue(r);
    if (a) {
        const e = a.trim();
        return se(e) ? parseFloat(e) : e;
    }
    return Qe(i) ? Mr(i, t, n + 1) : i;
}
function Nr(e, t) {
    return e?.[t] ?? e?.default ?? e;
}
const Pr = new Set([`width`, `height`, `top`, `left`, `right`, `bottom`, ...Hn]);
const Fr = { test: (e) => e === `auto`, parse: (e) => e };
const Ir = (e) => (t) => t.test(e);
const Lr = [et, M, j, A, gt, ht, Fr];
const Rr = (e) => Lr.find(Ir(e));
function zr(e) {
    return typeof e === `number` ? e === 0 : e === null ? !0 : e === `none` || e === `0` || le(e);
}
const Br = new Set([`brightness`, `contrast`, `saturate`, `opacity`]);
function Vr(e) {
    const [t, n] = e.slice(0, -1).split(`(`);
    if (t === `drop-shadow`) return e;
    const [r] = n.match(it) || [];
    if (!r) return e;
    const i = n.replace(r, ``);
    let a = +!!Br.has(t);
    return (r !== n && (a *= 100), t + `(` + a + i + `)`);
}
const Hr = /\b([a-z-]*)\(.*?\)/gu;
const Ur = {
    ...Mt,
    getAnimatableNone: (e) => {
        const t = e.match(Hr);
        return t ? t.map(Vr).join(` `) : e;
    }
};
const Wr = { ...et, transform: Math.round };
const Gr = {
    borderWidth: M,
    borderTopWidth: M,
    borderRightWidth: M,
    borderBottomWidth: M,
    borderLeftWidth: M,
    borderRadius: M,
    radius: M,
    borderTopLeftRadius: M,
    borderTopRightRadius: M,
    borderBottomRightRadius: M,
    borderBottomLeftRadius: M,
    width: M,
    maxWidth: M,
    height: M,
    maxHeight: M,
    top: M,
    right: M,
    bottom: M,
    left: M,
    padding: M,
    paddingTop: M,
    paddingRight: M,
    paddingBottom: M,
    paddingLeft: M,
    margin: M,
    marginTop: M,
    marginRight: M,
    marginBottom: M,
    marginLeft: M,
    backgroundPositionX: M,
    backgroundPositionY: M,
    rotate: A,
    rotateX: A,
    rotateY: A,
    rotateZ: A,
    scale: nt,
    scaleX: nt,
    scaleY: nt,
    scaleZ: nt,
    skew: A,
    skewX: A,
    skewY: A,
    distance: M,
    translateX: M,
    translateY: M,
    translateZ: M,
    x: M,
    y: M,
    z: M,
    perspective: M,
    transformPerspective: M,
    opacity: tt,
    originX: _t,
    originY: _t,
    originZ: M,
    zIndex: Wr,
    fillOpacity: tt,
    strokeOpacity: tt,
    numOctaves: Wr
};
const Kr = {
    ...Gr,
    color: N,
    backgroundColor: N,
    outlineColor: N,
    fill: N,
    stroke: N,
    borderColor: N,
    borderTopColor: N,
    borderRightColor: N,
    borderBottomColor: N,
    borderLeftColor: N,
    filter: Ur,
    WebkitFilter: Ur
};
const qr = (e) => Kr[e];
function Jr(e, t) {
    let n = qr(e);
    return (n !== Ur && (n = Mt), n.getAnimatableNone ? n.getAnimatableNone(t) : void 0);
}
const Yr = new Set([`auto`, `none`, `0`]);
function Xr(e, t, n) {
    let r = 0;
    let i;
    for (; r < e.length && !i;) {
        const t = e[r];
        (typeof t === `string` && !Yr.has(t) && Dt(t).values.length && (i = e[r]), r++);
    }
    if (i && n) for (const r of t) e[r] = Jr(n, i);
}
const Zr = class extends nr {
    constructor(e, t, n, r, i) {
        super(e, t, n, r, i, !0);
    }

    readKeyframes() {
        const { unresolvedKeyframes: e, element: t, name: n } = this;
        if (!t || !t.current) return;
        super.readKeyframes();
        for (let n = 0; n < e.length; n++) {
            let r = e[n];
            if (typeof r === `string` && ((r = r.trim()), Qe(r))) {
                const i = Mr(r, t.current);
                (i !== void 0 && (e[n] = i), n === e.length - 1 && (this.finalKeyframe = r));
            }
        }
        if ((this.resolveNoneKeyframes(), !Pr.has(n) || e.length !== 2)) return;
        const [r, i] = e;
        const a = Rr(r);
        const o = Rr(i);
        if (a !== o) {
            if (Wn(a) && Wn(o)) {
                for (let t = 0; t < e.length; t++) {
                    const n = e[t];
                    typeof n === `string` && (e[t] = parseFloat(n));
                }
            } else Jn[n] && (this.needsMeasurement = !0);
        }
    }

    resolveNoneKeyframes() {
        const { unresolvedKeyframes: e, name: t } = this;
        const n = [];
        for (let t = 0; t < e.length; t++) (e[t] === null || zr(e[t])) && n.push(t);
        n.length && Xr(e, n, t);
    }

    measureInitialState() {
        const { element: e, unresolvedKeyframes: t, name: n } = this;
        if (!e || !e.current) return;
        (n === `height` && (this.suspendedScrollY = window.pageYOffset),
            (this.measuredOrigin = Jn[n](e.measureViewportBox(), window.getComputedStyle(e.current))),
            (t[0] = this.measuredOrigin));
        const r = t[t.length - 1];
        r !== void 0 && e.getValue(n, r).jump(r, !1);
    }

    measureEndState() {
        const { element: e, name: t, unresolvedKeyframes: n } = this;
        if (!e || !e.current) return;
        const r = e.getValue(t);
        r && r.jump(this.measuredOrigin, !1);
        const i = n.length - 1;
        const a = n[i];
        ((n[i] = Jn[t](e.measureViewportBox(), window.getComputedStyle(e.current))),
            a !== null && this.finalKeyframe === void 0 && (this.finalKeyframe = a),
            this.removedTransforms?.length &&
                this.removedTransforms.forEach(([t, n]) => {
                    e.getValue(t).set(n);
                }),
            this.resolveNoneKeyframes());
    }
};
function Qr(e, t, n) {
    if (e instanceof EventTarget) return [e];
    if (typeof e === `string`) {
        let r = document;
        t && (r = t.current);
        const i = n?.[e] ?? r.querySelectorAll(e);
        return i ? Array.from(i) : [];
    }
    return Array.from(e);
}
const $r = (e, t) => (t && typeof e === `number` ? t.transform(e) : e);
function ei(e) {
    return ce(e) && `offsetHeight` in e;
}
const ti = 30;
const ni = (e) => !isNaN(parseFloat(e));
const ri = { current: void 0 };
const ii = class {
    constructor(e, t = {}) {
        ((this.canTrackVelocity = null),
            (this.events = {}),
            (this.updateAndNotify = (e) => {
                const t = qe.now();
                if (
                    (this.updatedAt !== t && this.setPrevFrameValue(),
                    (this.prev = this.current),
                    this.setCurrent(e),
                    this.current !== this.prev && (this.events.change?.notify(this.current), this.dependents))
                ) {
                    for (const e of this.dependents) e.dirty();
                }
            }),
            (this.hasAnimated = !1),
            this.setCurrent(e),
            (this.owner = t.owner));
    }

    setCurrent(e) {
        ((this.current = e),
            (this.updatedAt = qe.now()),
            this.canTrackVelocity === null && e !== void 0 && (this.canTrackVelocity = ni(this.current)));
    }

    setPrevFrameValue(e = this.current) {
        ((this.prevFrameValue = e), (this.prevUpdatedAt = this.updatedAt));
    }

    onChange(e) {
        return this.on(`change`, e);
    }

    on(e, t) {
        this.events[e] || (this.events[e] = new pe());
        const n = this.events[e].add(t);
        return e === `change`
            ? () => {
                  (n(),
                      k.read(() => {
                          this.events.change.getSize() || this.stop();
                      }));
              }
            : n;
    }

    clearListeners() {
        for (const e in this.events) this.events[e].clear();
    }

    attach(e, t) {
        ((this.passiveEffect = e), (this.stopPassiveEffect = t));
    }

    set(e) {
        this.passiveEffect ? this.passiveEffect(e, this.updateAndNotify) : this.updateAndNotify(e);
    }

    setWithVelocity(e, t, n) {
        (this.set(t), (this.prev = void 0), (this.prevFrameValue = e), (this.prevUpdatedAt = this.updatedAt - n));
    }

    jump(e, t = !0) {
        (this.updateAndNotify(e),
            (this.prev = e),
            (this.prevUpdatedAt = this.prevFrameValue = void 0),
            t && this.stop(),
            this.stopPassiveEffect && this.stopPassiveEffect());
    }

    dirty() {
        this.events.change?.notify(this.current);
    }

    addDependent(e) {
        ((this.dependents ||= new Set()), this.dependents.add(e));
    }

    removeDependent(e) {
        this.dependents && this.dependents.delete(e);
    }

    get() {
        return (ri.current && ri.current.push(this), this.current);
    }

    getPrevious() {
        return this.prev;
    }

    getVelocity() {
        const e = qe.now();
        if (!this.canTrackVelocity || this.prevFrameValue === void 0 || e - this.updatedAt > ti) return 0;
        const t = Math.min(this.updatedAt - this.prevUpdatedAt, ti);
        return O(parseFloat(this.current) - parseFloat(this.prevFrameValue), t);
    }

    start(e) {
        return (
            this.stop(),
            new Promise((t) => {
                ((this.hasAnimated = !0),
                    (this.animation = e(t)),
                    this.events.animationStart && this.events.animationStart.notify());
            }).then(() => {
                (this.events.animationComplete && this.events.animationComplete.notify(), this.clearAnimation());
            })
        );
    }

    stop() {
        (this.animation && (this.animation.stop(), this.events.animationCancel && this.events.animationCancel.notify()),
            this.clearAnimation());
    }

    isAnimating() {
        return !!this.animation;
    }

    clearAnimation() {
        delete this.animation;
    }

    destroy() {
        (this.dependents?.clear(),
            this.events.destroy?.notify(),
            this.clearListeners(),
            this.stop(),
            this.stopPassiveEffect && this.stopPassiveEffect());
    }
};
function ai(e, t) {
    return new ii(e, t);
}
const { schedule: oi, cancel: si } = Ve(queueMicrotask, !1);
const ci = { x: !1, y: !1 };
function li() {
    return ci.x || ci.y;
}
function ui(e) {
    return e === `x` || e === `y`
        ? ci[e]
            ? null
            : ((ci[e] = !0),
              () => {
                  ci[e] = !1;
              })
        : ci.x || ci.y
          ? null
          : ((ci.x = ci.y = !0),
            () => {
                ci.x = ci.y = !1;
            });
}
function di(e, t) {
    const n = Qr(e);
    const r = new AbortController();
    return [n, { passive: !0, ...t, signal: r.signal }, () => r.abort()];
}
function fi(e) {
    return !(e.pointerType === `touch` || li());
}
function pi(e, t, n = {}) {
    const [r, i, a] = di(e, n);
    const o = (e) => {
        if (!fi(e)) return;
        const { target: n } = e;
        const r = t(n, e);
        if (typeof r !== `function` || !n) return;
        const a = (e) => {
            fi(e) && (r(e), n.removeEventListener(`pointerleave`, a));
        };
        n.addEventListener(`pointerleave`, a, i);
    };
    return (
        r.forEach((e) => {
            e.addEventListener(`pointerenter`, o, i);
        }),
        a
    );
}
const mi = (e, t) => (t ? (e === t ? !0 : mi(e, t.parentElement)) : !1);
const hi = (e) => (e.pointerType === `mouse` ? typeof e.button !== `number` || e.button <= 0 : e.isPrimary !== !1);
const gi = new Set([`BUTTON`, `INPUT`, `SELECT`, `TEXTAREA`, `A`]);
function _i(e) {
    return gi.has(e.tagName) || e.tabIndex !== -1;
}
const vi = new WeakSet();
function yi(e) {
    return (t) => {
        t.key === `Enter` && e(t);
    };
}
function bi(e, t) {
    e.dispatchEvent(new PointerEvent(`pointer` + t, { isPrimary: !0, bubbles: !0 }));
}
const xi = (e, t) => {
    const n = e.currentTarget;
    if (!n) return;
    const r = yi(() => {
        if (vi.has(n)) return;
        bi(n, `down`);
        const e = yi(() => {
            bi(n, `up`);
        });
        (n.addEventListener(`keyup`, e, t), n.addEventListener(`blur`, () => bi(n, `cancel`), t));
    });
    (n.addEventListener(`keydown`, r, t), n.addEventListener(`blur`, () => n.removeEventListener(`keydown`, r), t));
};
function Si(e) {
    return hi(e) && !li();
}
function Ci(e, t, n = {}) {
    const [r, i, a] = di(e, n);
    const o = (e) => {
        const r = e.currentTarget;
        if (!Si(e)) return;
        vi.add(r);
        const a = t(r, e);
        const o = (e, t) => {
            (window.removeEventListener(`pointerup`, s),
                window.removeEventListener(`pointercancel`, c),
                vi.has(r) && vi.delete(r),
                Si(e) && typeof a === `function` && a(e, { success: t }));
        };
        const s = (e) => {
            o(e, r === window || r === document || n.useGlobalTarget || mi(r, e.target));
        };
        const c = (e) => {
            o(e, !1);
        };
        (window.addEventListener(`pointerup`, s, i), window.addEventListener(`pointercancel`, c, i));
    };
    return (
        r.forEach((e) => {
            ((n.useGlobalTarget ? window : e).addEventListener(`pointerdown`, o, i),
                ei(e) &&
                    (e.addEventListener(`focus`, (e) => xi(e, i)),
                    !_i(e) && !e.hasAttribute(`tabindex`) && (e.tabIndex = 0)));
        }),
        a
    );
}
function wi(e) {
    return ce(e) && `ownerSVGElement` in e;
}
const Ti = new WeakMap();
let Ei;
const Di = (e, t, n) => (r, i) => (i && i[0] ? i[0][e + `Size`] : wi(r) && `getBBox` in r ? r.getBBox()[t] : r[n]);
const Oi = Di(`inline`, `width`, `offsetWidth`);
const ki = Di(`block`, `height`, `offsetHeight`);
function Ai({ target: e, borderBoxSize: t }) {
    Ti.get(e)?.forEach((n) => {
        n(e, {
            get width() {
                return Oi(e, t);
            },
            get height() {
                return ki(e, t);
            }
        });
    });
}
function ji(e) {
    e.forEach(Ai);
}
function Mi() {
    typeof ResizeObserver > `u` || (Ei = new ResizeObserver(ji));
}
function Ni(e, t) {
    Ei || Mi();
    const n = Qr(e);
    return (
        n.forEach((e) => {
            let n = Ti.get(e);
            (n || ((n = new Set()), Ti.set(e, n)), n.add(t), Ei?.observe(e));
        }),
        () => {
            n.forEach((e) => {
                const n = Ti.get(e);
                (n?.delete(t), n?.size || Ei?.unobserve(e));
            });
        }
    );
}
const Pi = new Set();
let Fi;
function Ii() {
    ((Fi = () => {
        const e = {
            get width() {
                return window.innerWidth;
            },
            get height() {
                return window.innerHeight;
            }
        };
        Pi.forEach((t) => t(e));
    }),
        window.addEventListener(`resize`, Fi));
}
function I(e) {
    return (
        Pi.add(e),
        Fi || Ii(),
        () => {
            (Pi.delete(e),
                !Pi.size && typeof Fi === `function` && (window.removeEventListener(`resize`, Fi), (Fi = void 0)));
        }
    );
}
function L(e, t) {
    return typeof e === `function` ? I(e) : Ni(e, t);
}
function Li(e, t) {
    let n;
    const r = () => {
        const { currentTime: r } = t;
        const i = (r === null ? 0 : r.value) / 100;
        (n !== i && e(i), (n = i));
    };
    return (k.preUpdate(r, !0), () => He(r));
}
function Ri(e) {
    return wi(e) && e.tagName === `svg`;
}
function zi(...e) {
    const t = !Array.isArray(e[0]);
    const n = t ? 0 : -1;
    const r = e[0 + n];
    const i = e[1 + n];
    const a = e[2 + n];
    const o = e[3 + n];
    const s = gn(i, a, o);
    return t ? s(r) : s;
}
const R = (e) => !!(e && e.getVelocity);
function Bi(e, t, n) {
    const r = e.get();
    let i = null;
    let a = r;
    let o;
    const s = typeof r === `string` ? r.replace(/[\d.-]/g, ``) : void 0;
    const c = () => {
        i &&= (i.stop(), null);
    };
    const l = () => {
        (c(),
            (i = new On({
                keyframes: [Hi(e.get()), Hi(a)],
                velocity: e.getVelocity(),
                type: `spring`,
                restDelta: 0.001,
                restSpeed: 0.01,
                ...n,
                onUpdate: o
            })));
    };
    if (
        (e.attach((e, t) => {
            ((a = e), (o = (e) => t(Vi(e, s))), k.postRender(l));
        }, c),
        R(t))
    ) {
        const n = t.on(`change`, (t) => e.set(Vi(t, s)));
        const r = e.on(`destroy`, n);
        return () => {
            (n(), r());
        };
    }
    return c;
}
function Vi(e, t) {
    return t ? e + t : e;
}
function Hi(e) {
    return typeof e === `number` ? e : parseFloat(e);
}
const Ui = [...Lr, N, Mt];
const Wi = (e) => Ui.find(Ir(e));
const Gi = (0, S.createContext)({ transformPagePoint: (e) => e, isStatic: !1, reducedMotion: `never` });
function Ki(e, t) {
    if (typeof e === `function`) return e(t);
    e != null && (e.current = t);
}
function qi(...e) {
    return (t) => {
        let n = !1;
        const r = e.map((e) => {
            const r = Ki(e, t);
            return (!n && typeof r === `function` && (n = !0), r);
        });
        if (n) {
            return () => {
                for (let t = 0; t < r.length; t++) {
                    const n = r[t];
                    typeof n === `function` ? n() : Ki(e[t], null);
                }
            };
        }
    };
}
function Ji(...e) {
    return S.useCallback(qi(...e), e);
}
const z = x();
const Yi = class extends S.Component {
    getSnapshotBeforeUpdate(e) {
        const t = this.props.childRef.current;
        if (t && e.isPresent && !this.props.isPresent) {
            const e = t.offsetParent;
            const n = (ei(e) && e.offsetWidth) || 0;
            const r = this.props.sizeRef.current;
            ((r.height = t.offsetHeight || 0),
                (r.width = t.offsetWidth || 0),
                (r.top = t.offsetTop),
                (r.left = t.offsetLeft),
                (r.right = n - r.width - r.left));
        }
        return null;
    }

    componentDidUpdate() {}
    render() {
        return this.props.children;
    }
};
function Xi({ children: e, isPresent: t, anchorX: n, root: r }) {
    const i = (0, S.useId)();
    const a = (0, S.useRef)(null);
    const o = (0, S.useRef)({ width: 0, height: 0, top: 0, left: 0, right: 0 });
    const { nonce: s } = (0, S.useContext)(Gi);
    const c = Ji(a, e?.ref);
    return (
        (0, S.useInsertionEffect)(() => {
            const { width: e, height: c, top: l, left: u, right: d } = o.current;
            if (t || !a.current || !e || !c) return;
            const f = n === `left` ? `left: ${u}` : `right: ${d}`;
            a.current.dataset.motionPopId = i;
            const p = document.createElement(`style`);
            s && (p.nonce = s);
            const m = r ?? document.head;
            return (
                m.appendChild(p),
                p.sheet &&
                    p.sheet.insertRule(`
          [data-motion-pop-id="${i}"] {
            position: absolute !important;
            width: ${e}px !important;
            height: ${c}px !important;
            ${f}px !important;
            top: ${l}px !important;
          }
        `),
                () => {
                    m.contains(p) && m.removeChild(p);
                }
            );
        }, [t]),
        (0, z.jsx)(Yi, { isPresent: t, childRef: a, sizeRef: o, children: S.cloneElement(e, { ref: c }) })
    );
}
const Zi = ({
    children: e,
    initial: t,
    isPresent: n,
    onExitComplete: r,
    custom: i,
    presenceAffectsLayout: a,
    mode: o,
    anchorX: s,
    root: c
}) => {
    const l = w(Qi);
    const u = (0, S.useId)();
    let d = !0;
    let f = (0, S.useMemo)(
        () => (
            (d = !1),
            {
                id: u,
                initial: t,
                isPresent: n,
                custom: i,
                onExitComplete: (e) => {
                    l.set(e, !0);
                    for (const e of l.values()) if (!e) return;
                    r && r();
                },
                register: (e) => (l.set(e, !1), () => l.delete(e))
            }
        ),
        [n, l, r]
    );
    return (
        a && d && (f = { ...f }),
        (0, S.useMemo)(() => {
            l.forEach((e, t) => l.set(t, !1));
        }, [n]),
        S.useEffect(() => {
            !n && !l.size && r && r();
        }, [n]),
        o === `popLayout` && (e = (0, z.jsx)(Xi, { isPresent: n, anchorX: s, root: c, children: e })),
        (0, z.jsx)(ne.Provider, { value: f, children: e })
    );
};
function Qi() {
    return new Map();
}
function $i(e = !0) {
    const t = (0, S.useContext)(ne);
    if (t === null) return [!0, null];
    const { isPresent: n, onExitComplete: r, register: i } = t;
    const a = (0, S.useId)();
    (0, S.useEffect)(() => {
        if (e) return i(a);
    }, [e]);
    const o = (0, S.useCallback)(() => e && r && r(a), [a, r, e]);
    return !n && r ? [!1, o] : [!0];
}
const ea = (e) => e.key || ``;
function ta(e) {
    const t = [];
    return (
        S.Children.forEach(e, (e) => {
            (0, S.isValidElement)(e) && t.push(e);
        }),
        t
    );
}
const na = ({
    children: e,
    custom: t,
    initial: n = !0,
    onExitComplete: r,
    presenceAffectsLayout: i = !0,
    mode: a = `sync`,
    propagate: o = !1,
    anchorX: s = `left`,
    root: c
}) => {
    const [l, u] = $i(o);
    const d = (0, S.useMemo)(() => ta(e), [e]);
    const f = o && !l ? [] : d.map(ea);
    const p = (0, S.useRef)(!0);
    const m = (0, S.useRef)(d);
    const h = w(() => new Map());
    const [g, _] = (0, S.useState)(d);
    const [v, y] = (0, S.useState)(d);
    te(() => {
        ((p.current = !1), (m.current = d));
        for (let e = 0; e < v.length; e++) {
            const t = ea(v[e]);
            f.includes(t) ? h.delete(t) : h.get(t) !== !0 && h.set(t, !1);
        }
    }, [v, f.length, f.join(`-`)]);
    const b = [];
    if (d !== g) {
        let e = [...d];
        for (let t = 0; t < v.length; t++) {
            const n = v[t];
            const r = ea(n);
            f.includes(r) || (e.splice(t, 0, n), b.push(n));
        }
        return (a === `wait` && b.length && (e = b), y(ta(e)), _(d), null);
    }
    const { forceRender: x } = (0, S.useContext)(C);
    return (0, z.jsx)(z.Fragment, {
        children: v.map((e) => {
            const g = ea(e);
            const _ = o && !l ? !1 : d === v || f.includes(g);
            return (0, z.jsx)(
                Zi,
                {
                    isPresent: _,
                    initial: !p.current || n ? void 0 : !1,
                    custom: t,
                    presenceAffectsLayout: i,
                    mode: a,
                    root: c,
                    onExitComplete: _
                        ? void 0
                        : () => {
                              if (h.has(g)) h.set(g, !0);
                              else return;
                              let e = !0;
                              (h.forEach((t) => {
                                  t || (e = !1);
                              }),
                                  e && (x?.(), y(m.current), o && u?.(), r && r()));
                          },
                    anchorX: s,
                    children: e
                },
                g
            );
        })
    });
};
const ra = (0, S.createContext)({ strict: !1 });
const ia = {
    animation: [`animate`, `variants`, `whileHover`, `whileTap`, `exit`, `whileInView`, `whileFocus`, `whileDrag`],
    exit: [`exit`],
    drag: [`drag`, `dragControls`],
    focus: [`whileFocus`],
    hover: [`whileHover`, `onHoverStart`, `onHoverEnd`],
    tap: [`whileTap`, `onTap`, `onTapStart`, `onTapCancel`],
    pan: [`onPan`, `onPanStart`, `onPanSessionStart`, `onPanEnd`],
    inView: [`whileInView`, `onViewportEnter`, `onViewportLeave`],
    layout: [`layout`, `layoutId`]
};
const aa = {};
for (const e in ia) aa[e] = { isEnabled: (t) => ia[e].some((e) => !!t[e]) };
function oa(e) {
    for (const t in e) aa[t] = { ...aa[t], ...e[t] };
}
const sa = new Set(
    `animate.exit.variants.initial.style.values.variants.transition.transformTemplate.custom.inherit.onBeforeLayoutMeasure.onAnimationStart.onAnimationComplete.onUpdate.onDragStart.onDrag.onDragEnd.onMeasureDragConstraints.onDirectionLock.onDragTransitionEnd._dragX._dragY.onHoverStart.onHoverEnd.onViewportEnter.onViewportLeave.globalTapTarget.ignoreStrict.viewport`.split(
        `.`
    )
);
function ca(e) {
    return (
        e.startsWith(`while`) ||
        (e.startsWith(`drag`) && e !== `draggable`) ||
        e.startsWith(`layout`) ||
        e.startsWith(`onTap`) ||
        e.startsWith(`onPan`) ||
        e.startsWith(`onLayout`) ||
        sa.has(e)
    );
}
const la = c({ default: () => ua });
let ua;
const da = o(() => {
    throw (
        (ua = {}),
        Error(`Could not resolve "@emotion/is-prop-valid" imported by "framer-motion". Is it installed?`)
    );
});
let fa = (e) => !ca(e);
function pa(e) {
    typeof e === `function` && (fa = (t) => (t.startsWith(`on`) ? !ca(t) : e(t)));
}
try {
    pa((da(), d(la)).default);
} catch {}
function ma(e, t, n) {
    const r = {};
    for (const i in e) {
        (i === `values` && typeof e.values === `object`) ||
            ((fa(i) || (n === !0 && ca(i)) || (!t && !ca(i)) || (e.draggable && i.startsWith(`onDrag`))) &&
                (r[i] = e[i]));
    }
    return r;
}
const ha = (0, S.createContext)({});
function ga(e) {
    return typeof e === `object` && !!e && typeof e.start === `function`;
}
function _a(e) {
    return typeof e === `string` || Array.isArray(e);
}
const va = [`animate`, `whileInView`, `whileFocus`, `whileHover`, `whileTap`, `whileDrag`, `exit`];
const ya = [`initial`, ...va];
function ba(e) {
    return ga(e.animate) || ya.some((t) => _a(e[t]));
}
function xa(e) {
    return !!(ba(e) || e.variants);
}
function Sa(e, t) {
    if (ba(e)) {
        const { initial: t, animate: n } = e;
        return { initial: t === !1 || _a(t) ? t : void 0, animate: _a(n) ? n : void 0 };
    }
    return e.inherit === !1 ? {} : t;
}
function Ca(e) {
    const { initial: t, animate: n } = Sa(e, (0, S.useContext)(ha));
    return (0, S.useMemo)(() => ({ initial: t, animate: n }), [wa(t), wa(n)]);
}
function wa(e) {
    return Array.isArray(e) ? e.join(` `) : e;
}
const Ta = {};
function Ea(e) {
    for (const t in e) ((Ta[t] = e[t]), Xe(t) && (Ta[t].isCSSVariable = !0));
}
function Da(e, { layout: t, layoutId: n }) {
    return Un.has(e) || e.startsWith(`origin`) || ((t || n !== void 0) && (!!Ta[e] || e === `opacity`));
}
const Oa = { x: `translateX`, y: `translateY`, z: `translateZ`, transformPerspective: `perspective` };
const ka = Hn.length;
function Aa(e, t, n) {
    let r = ``;
    let i = !0;
    for (let a = 0; a < ka; a++) {
        const o = Hn[a];
        const s = e[o];
        if (s === void 0) continue;
        let c = !0;
        if (((c = typeof s === `number` ? s === +!!o.startsWith(`scale`) : parseFloat(s) === 0), !c || n)) {
            const e = $r(s, Gr[o]);
            if (!c) {
                i = !1;
                const t = Oa[o] || o;
                r += `${t}(${e}) `;
            }
            n && (t[o] = e);
        }
    }
    return ((r = r.trim()), n ? (r = n(t, i ? `` : r)) : i && (r = `none`), r);
}
function ja(e, t, n) {
    const { style: r, vars: i, transformOrigin: a } = e;
    let o = !1;
    let s = !1;
    for (const e in t) {
        const n = t[e];
        if (Un.has(e)) {
            o = !0;
            continue;
        } else if (Xe(e)) {
            i[e] = n;
            continue;
        } else {
            const t = $r(n, Gr[e]);
            e.startsWith(`origin`) ? ((s = !0), (a[e] = t)) : (r[e] = t);
        }
    }
    if ((t.transform || (o || n ? (r.transform = Aa(t, e.transform, n)) : (r.transform &&= `none`)), s)) {
        const { originX: e = `50%`, originY: t = `50%`, originZ: n = 0 } = a;
        r.transformOrigin = `${e} ${t} ${n}`;
    }
}
const Ma = () => ({ style: {}, transform: {}, transformOrigin: {}, vars: {} });
function Na(e, t, n) {
    for (const r in t) !R(t[r]) && !Da(r, n) && (e[r] = t[r]);
}
function Pa({ transformTemplate: e }, t) {
    return (0, S.useMemo)(() => {
        const n = Ma();
        return (ja(n, t, e), Object.assign({}, n.vars, n.style));
    }, [t]);
}
function Fa(e, t) {
    const n = e.style || {};
    const r = {};
    return (Na(r, n, e), Object.assign(r, Pa(e, t)), r);
}
function Ia(e, t) {
    const n = {};
    const r = Fa(e, t);
    return (
        e.drag &&
            e.dragListener !== !1 &&
            ((n.draggable = !1),
            (r.userSelect = r.WebkitUserSelect = r.WebkitTouchCallout = `none`),
            (r.touchAction = e.drag === !0 ? `none` : `pan-${e.drag === `x` ? `y` : `x`}`)),
        e.tabIndex === void 0 && (e.onTap || e.onTapStart || e.whileTap) && (n.tabIndex = 0),
        (n.style = r),
        n
    );
}
const La = { offset: `stroke-dashoffset`, array: `stroke-dasharray` };
const Ra = { offset: `strokeDashoffset`, array: `strokeDasharray` };
function za(e, t, n = 1, r = 0, i = !0) {
    e.pathLength = 1;
    const a = i ? La : Ra;
    e[a.offset] = M.transform(-r);
    const o = M.transform(t);
    const s = M.transform(n);
    e[a.array] = `${o} ${s}`;
}
function Ba(
    e,
    { attrX: t, attrY: n, attrScale: r, pathLength: i, pathSpacing: a = 1, pathOffset: o = 0, ...s },
    c,
    l,
    u
) {
    if ((ja(e, s, l), c)) {
        e.style.viewBox && (e.attrs.viewBox = e.style.viewBox);
        return;
    }
    ((e.attrs = e.style), (e.style = {}));
    const { attrs: d, style: f } = e;
    (d.transform && ((f.transform = d.transform), delete d.transform),
        (f.transform || d.transformOrigin) &&
            ((f.transformOrigin = d.transformOrigin ?? `50% 50%`), delete d.transformOrigin),
        f.transform && ((f.transformBox = u?.transformBox ?? `fill-box`), delete d.transformBox),
        t !== void 0 && (d.x = t),
        n !== void 0 && (d.y = n),
        r !== void 0 && (d.scale = r),
        i !== void 0 && za(d, i, a, o, !1));
}
const Va = () => ({ ...Ma(), attrs: {} });
const Ha = (e) => typeof e === `string` && e.toLowerCase() === `svg`;
function Ua(e, t, n, r) {
    const i = (0, S.useMemo)(() => {
        const n = Va();
        return (Ba(n, t, Ha(r), e.transformTemplate, e.style), { ...n.attrs, style: { ...n.style } });
    }, [t]);
    if (e.style) {
        const t = {};
        (Na(t, e.style, e), (i.style = { ...t, ...i.style }));
    }
    return i;
}
const Wa = [
    `animate`,
    `circle`,
    `defs`,
    `desc`,
    `ellipse`,
    `g`,
    `image`,
    `line`,
    `filter`,
    `marker`,
    `mask`,
    `metadata`,
    `path`,
    `pattern`,
    `polygon`,
    `polyline`,
    `rect`,
    `stop`,
    `switch`,
    `symbol`,
    `svg`,
    `text`,
    `tspan`,
    `use`,
    `view`
];
function Ga(e) {
    return typeof e !== `string` || e.includes(`-`) ? !1 : !!(Wa.indexOf(e) > -1 || /[A-Z]/u.test(e));
}
function Ka(e, t, n, { latestValues: r }, i, a = !1) {
    const o = (Ga(e) ? Ua : Ia)(t, r, i, e);
    const s = ma(t, typeof e === `string`, a);
    const c = e === S.Fragment ? {} : { ...s, ...o, ref: n };
    const { children: l } = t;
    const u = (0, S.useMemo)(() => (R(l) ? l.get() : l), [l]);
    return (0, S.createElement)(e, { ...c, children: u });
}
function qa(e) {
    const t = [{}, {}];
    return (
        e?.values.forEach((e, n) => {
            ((t[0][n] = e.get()), (t[1][n] = e.getVelocity()));
        }),
        t
    );
}
function Ja(e, t, n, r) {
    if (typeof t === `function`) {
        const [i, a] = qa(r);
        t = t(n === void 0 ? e.custom : n, i, a);
    }
    if ((typeof t === `string` && (t = e.variants && e.variants[t]), typeof t === `function`)) {
        const [i, a] = qa(r);
        t = t(n === void 0 ? e.custom : n, i, a);
    }
    return t;
}
function Ya(e) {
    return R(e) ? e.get() : e;
}
function Xa({ scrapeMotionValuesFromProps: e, createRenderState: t }, n, r, i) {
    return { latestValues: Za(n, r, i, e), renderState: t() };
}
function Za(e, t, n, r) {
    const i = {};
    const a = r(e, {});
    for (const e in a) i[e] = Ya(a[e]);
    let { initial: o, animate: s } = e;
    const c = ba(e);
    const l = xa(e);
    t && l && !c && e.inherit !== !1 && (o === void 0 && (o = t.initial), s === void 0 && (s = t.animate));
    let u = n ? n.initial === !1 : !1;
    u ||= o === !1;
    const d = u ? s : o;
    if (d && typeof d !== `boolean` && !ga(d)) {
        const t = Array.isArray(d) ? d : [d];
        for (let n = 0; n < t.length; n++) {
            const r = Ja(e, t[n]);
            if (r) {
                const { transitionEnd: e, transition: t, ...n } = r;
                for (const e in n) {
                    let t = n[e];
                    if (Array.isArray(t)) {
                        const e = u ? t.length - 1 : 0;
                        t = t[e];
                    }
                    t !== null && (i[e] = t);
                }
                for (const t in e) i[t] = e[t];
            }
        }
    }
    return i;
}
const Qa = (e) => (t, n) => {
    const r = (0, S.useContext)(ha);
    const i = (0, S.useContext)(ne);
    const a = () => Xa(e, t, r, i);
    return n ? a() : w(a);
};
function $a(e, t, n) {
    const { style: r } = e;
    const i = {};
    for (const a in r) {
        (R(r[a]) || (t.style && R(t.style[a])) || Da(a, e) || n?.getValue(a)?.liveStyle !== void 0) && (i[a] = r[a]);
    }
    return i;
}
const eo = Qa({ scrapeMotionValuesFromProps: $a, createRenderState: Ma });
function to(e, t, n) {
    const r = $a(e, t, n);
    for (const n in e) {
        if (R(e[n]) || R(t[n])) {
            const t = Hn.indexOf(n) === -1 ? n : `attr` + n.charAt(0).toUpperCase() + n.substring(1);
            r[t] = e[n];
        }
    }
    return r;
}
const no = Qa({ scrapeMotionValuesFromProps: to, createRenderState: Va });
const ro = Symbol.for(`motionComponentSymbol`);
function io(e) {
    return e && typeof e === `object` && Object.prototype.hasOwnProperty.call(e, `current`);
}
function ao(e, t, n) {
    return (0, S.useCallback)(
        (r) => {
            (r && e.onMount && e.onMount(r),
                t && (r ? t.mount(r) : t.unmount()),
                n && (typeof n === `function` ? n(r) : io(n) && (n.current = r)));
        },
        [t]
    );
}
const oo = (e) => e.replace(/([a-z])([A-Z])/gu, `$1-$2`).toLowerCase();
const so = `data-` + oo(`framerAppearId`);
const co = (0, S.createContext)({});
function lo(e, t, n, r, i) {
    const { visualElement: a } = (0, S.useContext)(ha);
    const o = (0, S.useContext)(ra);
    const s = (0, S.useContext)(ne);
    const c = (0, S.useContext)(Gi).reducedMotion;
    const l = (0, S.useRef)(null);
    ((r ||= o.renderer),
        !l.current &&
            r &&
            (l.current = r(e, {
                visualState: t,
                parent: a,
                props: n,
                presenceContext: s,
                blockInitialAnimation: s ? s.initial === !1 : !1,
                reducedMotionConfig: c
            })));
    const u = l.current;
    const d = (0, S.useContext)(co);
    u && !u.projection && i && (u.type === `html` || u.type === `svg`) && uo(l.current, n, i, d);
    const f = (0, S.useRef)(!1);
    (0, S.useInsertionEffect)(() => {
        u && f.current && u.update(n, s);
    });
    const p = n[so];
    const m = (0, S.useRef)(!!p && !window.MotionHandoffIsComplete?.(p) && window.MotionHasOptimisedAnimation?.(p));
    return (
        te(() => {
            u &&
                ((f.current = !0),
                (window.MotionIsMounted = !0),
                u.updateFeatures(),
                u.scheduleRenderMicrotask(),
                m.current && u.animationState && u.animationState.animateChanges());
        }),
        (0, S.useEffect)(() => {
            u &&
                (!m.current && u.animationState && u.animationState.animateChanges(),
                (m.current &&=
                    (queueMicrotask(() => {
                        window.MotionHandoffMarkAsComplete?.(p);
                    }),
                    !1)),
                (u.enteringChildren = void 0));
        }),
        u
    );
}
function uo(e, t, n, r) {
    const {
        layoutId: i,
        layout: a,
        drag: o,
        dragConstraints: s,
        layoutScroll: c,
        layoutRoot: l,
        layoutCrossfade: u
    } = t;
    ((e.projection = new n(e.latestValues, t[`data-framer-portal-id`] ? void 0 : fo(e.parent))),
        e.projection.setOptions({
            layoutId: i,
            layout: a,
            alwaysMeasureLayout: !!o || (s && io(s)),
            visualElement: e,
            animationType: typeof a === `string` ? a : `both`,
            initialPromotionConfig: r,
            crossfade: u,
            layoutScroll: c,
            layoutRoot: l
        }));
}
function fo(e) {
    if (e) return e.options.allowProjection === !1 ? fo(e.parent) : e.projection;
}
function po(e, { forwardMotionProps: t = !1 } = {}, n, r) {
    n && oa(n);
    const i = Ga(e) ? no : eo;
    function a(a, o) {
        let s;
        const c = { ...(0, S.useContext)(Gi), ...a, layoutId: B(a) };
        const { isStatic: l } = c;
        const u = Ca(a);
        const d = i(a, l);
        if (!l && ee) {
            V(c, n);
            const t = mo(c);
            ((s = t.MeasureLayout), (u.visualElement = lo(e, d, c, r, t.ProjectionNode)));
        }
        return (0, z.jsxs)(ha.Provider, {
            value: u,
            children: [
                s && u.visualElement ? (0, z.jsx)(s, { visualElement: u.visualElement, ...c }) : null,
                Ka(e, a, ao(d, u.visualElement, o), d, l, t)
            ]
        });
    }
    a.displayName = `motion.${typeof e === `string` ? e : `create(${e.displayName ?? e.name ?? ``})`}`;
    const o = (0, S.forwardRef)(a);
    return ((o[ro] = e), o);
}
function B({ layoutId: e }) {
    const t = (0, S.useContext)(C).id;
    return t && e !== void 0 ? t + `-` + e : e;
}
function V(e, t) {
    (0, S.useContext)(ra).strict;
}
function mo(e) {
    const { drag: t, layout: n } = aa;
    if (!t && !n) return {};
    const r = { ...t, ...n };
    return {
        MeasureLayout: t?.isEnabled(e) || n?.isEnabled(e) ? r.MeasureLayout : void 0,
        ProjectionNode: r.ProjectionNode
    };
}
function ho(e, t) {
    if (typeof Proxy > `u`) return po;
    const n = new Map();
    const r = (n, r) => po(n, r, e, t);
    return new Proxy((e, t) => r(e, t), {
        get: (i, a) => (a === `create` ? r : (n.has(a) || n.set(a, po(a, void 0, e, t)), n.get(a)))
    });
}
function go({ top: e, left: t, right: n, bottom: r }) {
    return { x: { min: t, max: n }, y: { min: e, max: r } };
}
function _o({ x: e, y: t }) {
    return { top: t.min, right: e.max, bottom: t.max, left: e.min };
}
function vo(e, t) {
    if (!t) return e;
    const n = t({ x: e.left, y: e.top });
    const r = t({ x: e.right, y: e.bottom });
    return { top: n.y, left: n.x, bottom: r.y, right: r.x };
}
function yo(e) {
    return e === void 0 || e === 1;
}
function bo({ scale: e, scaleX: t, scaleY: n }) {
    return !yo(e) || !yo(t) || !yo(n);
}
function xo(e) {
    return bo(e) || H(e) || e.z || e.rotate || e.rotateX || e.rotateY || e.skewX || e.skewY;
}
function H(e) {
    return So(e.x) || So(e.y);
}
function So(e) {
    return e && e !== `0%`;
}
function Co(e, t, n) {
    return n + t * (e - n);
}
function wo(e, t, n, r, i) {
    return (i !== void 0 && (e = Co(e, i, r)), Co(e, n, r) + t);
}
function To(e, t = 0, n = 1, r, i) {
    ((e.min = wo(e.min, t, n, r, i)), (e.max = wo(e.max, t, n, r, i)));
}
function Eo(e, { x: t, y: n }) {
    (To(e.x, t.translate, t.scale, t.originPoint), To(e.y, n.translate, n.scale, n.originPoint));
}
const Do = 0.999999999999;
const Oo = 1.0000000000001;
function ko(e, t, n, r = !1) {
    const i = n.length;
    if (!i) return;
    t.x = t.y = 1;
    let a, o;
    for (let s = 0; s < i; s++) {
        ((a = n[s]), (o = a.projectionDelta));
        const { visualElement: i } = a.options;
        (i && i.props.style && i.props.style.display === `contents`) ||
            (r &&
                a.options.layoutScroll &&
                a.scroll &&
                a !== a.root &&
                Mo(e, { x: -a.scroll.offset.x, y: -a.scroll.offset.y }),
            o && ((t.x *= o.x.scale), (t.y *= o.y.scale), Eo(e, o)),
            r && xo(a.latestValues) && Mo(e, a.latestValues));
    }
    (t.x < Oo && t.x > Do && (t.x = 1), t.y < Oo && t.y > Do && (t.y = 1));
}
function Ao(e, t) {
    ((e.min += t), (e.max += t));
}
function jo(e, t, n, r, i = 0.5) {
    To(e, t, n, P(e.min, e.max, i), r);
}
function Mo(e, t) {
    (jo(e.x, t.x, t.scaleX, t.scale, t.originX), jo(e.y, t.y, t.scaleY, t.scale, t.originY));
}
function No(e, t) {
    return go(vo(e.getBoundingClientRect(), t));
}
function Po(e, t, n) {
    const r = No(e, n);
    const { scroll: i } = t;
    return (i && (Ao(r.x, i.offset.x), Ao(r.y, i.offset.y)), r);
}
const Fo = () => ({ translate: 0, scale: 1, origin: 0, originPoint: 0 });
const Io = () => ({ x: Fo(), y: Fo() });
const Lo = () => ({ min: 0, max: 0 });
const Ro = () => ({ x: Lo(), y: Lo() });
const zo = { current: null };
const Bo = { current: !1 };
function Vo() {
    if (((Bo.current = !0), ee)) {
        if (window.matchMedia) {
            const e = window.matchMedia(`(prefers-reduced-motion)`);
            const t = () => (zo.current = e.matches);
            (e.addEventListener(`change`, t), t());
        } else zo.current = !1;
    }
}
const Ho = new WeakMap();
function Uo(e, t, n) {
    for (const r in t) {
        const i = t[r];
        const a = n[r];
        if (R(i)) e.addValue(r, i);
        else if (R(a)) e.addValue(r, ai(i, { owner: e }));
        else if (a !== i) {
            if (e.hasValue(r)) {
                const t = e.getValue(r);
                t.liveStyle === !0 ? t.jump(i) : t.hasAnimated || t.set(i);
            } else {
                const t = e.getStaticValue(r);
                e.addValue(r, ai(t === void 0 ? i : t, { owner: e }));
            }
        }
    }
    for (const r in n) t[r] === void 0 && e.removeValue(r);
    return t;
}
const Wo = [
    `AnimationStart`,
    `AnimationComplete`,
    `Update`,
    `BeforeLayoutMeasure`,
    `LayoutMeasure`,
    `LayoutAnimationStart`,
    `LayoutAnimationComplete`
];
const Go = class {
    scrapeMotionValuesFromProps(e, t, n) {
        return {};
    }

    constructor(
        { parent: e, props: t, presenceContext: n, reducedMotionConfig: r, blockInitialAnimation: i, visualState: a },
        o = {}
    ) {
        ((this.current = null),
            (this.children = new Set()),
            (this.isVariantNode = !1),
            (this.isControllingVariants = !1),
            (this.shouldReduceMotion = null),
            (this.values = new Map()),
            (this.KeyframeResolver = nr),
            (this.features = {}),
            (this.valueSubscriptions = new Map()),
            (this.prevMotionValues = {}),
            (this.events = {}),
            (this.propEventSubscriptions = {}),
            (this.notifyUpdate = () => this.notify(`Update`, this.latestValues)),
            (this.render = () => {
                this.current &&
                    (this.triggerBuild(),
                    this.renderInstance(this.current, this.renderState, this.props.style, this.projection));
            }),
            (this.renderScheduledAt = 0),
            (this.scheduleRender = () => {
                const e = qe.now();
                this.renderScheduledAt < e && ((this.renderScheduledAt = e), k.render(this.render, !1, !0));
            }));
        const { latestValues: s, renderState: c } = a;
        ((this.latestValues = s),
            (this.baseTarget = { ...s }),
            (this.initialValues = t.initial ? { ...s } : {}),
            (this.renderState = c),
            (this.parent = e),
            (this.props = t),
            (this.presenceContext = n),
            (this.depth = e ? e.depth + 1 : 0),
            (this.reducedMotionConfig = r),
            (this.options = o),
            (this.blockInitialAnimation = !!i),
            (this.isControllingVariants = ba(t)),
            (this.isVariantNode = xa(t)),
            this.isVariantNode && (this.variantChildren = new Set()),
            (this.manuallyAnimateOnMount = !!(e && e.current)));
        const { willChange: l, ...u } = this.scrapeMotionValuesFromProps(t, {}, this);
        for (const e in u) {
            const t = u[e];
            s[e] !== void 0 && R(t) && t.set(s[e]);
        }
    }

    mount(e) {
        ((this.current = e),
            Ho.set(e, this),
            this.projection && !this.projection.instance && this.projection.mount(e),
            this.parent &&
                this.isVariantNode &&
                !this.isControllingVariants &&
                (this.removeFromVariantTree = this.parent.addVariantChild(this)),
            this.values.forEach((e, t) => this.bindToMotionValue(t, e)),
            Bo.current || Vo(),
            (this.shouldReduceMotion =
                this.reducedMotionConfig === `never` ? !1 : this.reducedMotionConfig === `always` ? !0 : zo.current),
            this.parent?.addChild(this),
            this.update(this.props, this.presenceContext));
    }

    unmount() {
        (this.projection && this.projection.unmount(),
            He(this.notifyUpdate),
            He(this.render),
            this.valueSubscriptions.forEach((e) => e()),
            this.valueSubscriptions.clear(),
            this.removeFromVariantTree && this.removeFromVariantTree(),
            this.parent?.removeChild(this));
        for (const e in this.events) this.events[e].clear();
        for (const e in this.features) {
            const t = this.features[e];
            t && (t.unmount(), (t.isMounted = !1));
        }
        this.current = null;
    }

    addChild(e) {
        (this.children.add(e), (this.enteringChildren ??= new Set()), this.enteringChildren.add(e));
    }

    removeChild(e) {
        (this.children.delete(e), this.enteringChildren && this.enteringChildren.delete(e));
    }

    bindToMotionValue(e, t) {
        this.valueSubscriptions.has(e) && this.valueSubscriptions.get(e)();
        const n = Un.has(e);
        n && this.onBindTransform && this.onBindTransform();
        const r = t.on(`change`, (t) => {
            ((this.latestValues[e] = t),
                this.props.onUpdate && k.preRender(this.notifyUpdate),
                n && this.projection && (this.projection.isTransformDirty = !0),
                this.scheduleRender());
        });
        let i;
        (window.MotionCheckAppearSync && (i = window.MotionCheckAppearSync(this, e, t)),
            this.valueSubscriptions.set(e, () => {
                (r(), i && i(), t.owner && t.stop());
            }));
    }

    sortNodePosition(e) {
        return !this.current || !this.sortInstanceNodePosition || this.type !== e.type
            ? 0
            : this.sortInstanceNodePosition(this.current, e.current);
    }

    updateFeatures() {
        let e = `animation`;
        for (e in aa) {
            const t = aa[e];
            if (!t) continue;
            const { isEnabled: n, Feature: r } = t;
            if ((!this.features[e] && r && n(this.props) && (this.features[e] = new r(this)), this.features[e])) {
                const t = this.features[e];
                t.isMounted ? t.update() : (t.mount(), (t.isMounted = !0));
            }
        }
    }

    triggerBuild() {
        this.build(this.renderState, this.latestValues, this.props);
    }

    measureViewportBox() {
        return this.current ? this.measureInstanceViewportBox(this.current, this.props) : Ro();
    }

    getStaticValue(e) {
        return this.latestValues[e];
    }

    setStaticValue(e, t) {
        this.latestValues[e] = t;
    }

    update(e, t) {
        ((e.transformTemplate || this.props.transformTemplate) && this.scheduleRender(),
            (this.prevProps = this.props),
            (this.props = e),
            (this.prevPresenceContext = this.presenceContext),
            (this.presenceContext = t));
        for (let t = 0; t < Wo.length; t++) {
            const n = Wo[t];
            this.propEventSubscriptions[n] && (this.propEventSubscriptions[n](), delete this.propEventSubscriptions[n]);
            const r = e[`on` + n];
            r && (this.propEventSubscriptions[n] = this.on(n, r));
        }
        ((this.prevMotionValues = Uo(
            this,
            this.scrapeMotionValuesFromProps(e, this.prevProps, this),
            this.prevMotionValues
        )),
            this.handleChildMotionValue && this.handleChildMotionValue());
    }

    getProps() {
        return this.props;
    }

    getVariant(e) {
        return this.props.variants ? this.props.variants[e] : void 0;
    }

    getDefaultTransition() {
        return this.props.transition;
    }

    getTransformPagePoint() {
        return this.props.transformPagePoint;
    }

    getClosestVariantNode() {
        return this.isVariantNode ? this : this.parent ? this.parent.getClosestVariantNode() : void 0;
    }

    addVariantChild(e) {
        const t = this.getClosestVariantNode();
        if (t) return (t.variantChildren && t.variantChildren.add(e), () => t.variantChildren.delete(e));
    }

    addValue(e, t) {
        const n = this.values.get(e);
        t !== n &&
            (n && this.removeValue(e),
            this.bindToMotionValue(e, t),
            this.values.set(e, t),
            (this.latestValues[e] = t.get()));
    }

    removeValue(e) {
        this.values.delete(e);
        const t = this.valueSubscriptions.get(e);
        (t && (t(), this.valueSubscriptions.delete(e)),
            delete this.latestValues[e],
            this.removeValueFromRenderState(e, this.renderState));
    }

    hasValue(e) {
        return this.values.has(e);
    }

    getValue(e, t) {
        if (this.props.values && this.props.values[e]) return this.props.values[e];
        let n = this.values.get(e);
        return (
            n === void 0 && t !== void 0 && ((n = ai(t === null ? void 0 : t, { owner: this })), this.addValue(e, n)),
            n
        );
    }

    readValue(e, t) {
        let n =
            this.latestValues[e] !== void 0 || !this.current
                ? this.latestValues[e]
                : (this.getBaseTargetFromProps(this.props, e) ??
                  this.readValueFromInstance(this.current, e, this.options));
        return (
            n != null &&
                (typeof n === `string` && (se(n) || le(n))
                    ? (n = parseFloat(n))
                    : !Wi(n) && Mt.test(t) && (n = Jr(e, t)),
                this.setBaseTarget(e, R(n) ? n.get() : n)),
            R(n) ? n.get() : n
        );
    }

    setBaseTarget(e, t) {
        this.baseTarget[e] = t;
    }

    getBaseTarget(e) {
        const { initial: t } = this.props;
        let n;
        if (typeof t === `string` || typeof t === `object`) {
            const r = Ja(this.props, t, this.presenceContext?.custom);
            r && (n = r[e]);
        }
        if (t && n !== void 0) return n;
        const r = this.getBaseTargetFromProps(this.props, e);
        return r !== void 0 && !R(r)
            ? r
            : this.initialValues[e] !== void 0 && n === void 0
              ? void 0
              : this.baseTarget[e];
    }

    on(e, t) {
        return (this.events[e] || (this.events[e] = new pe()), this.events[e].add(t));
    }

    notify(e, ...t) {
        this.events[e] && this.events[e].notify(...t);
    }

    scheduleRenderMicrotask() {
        oi.render(this.render);
    }
};
const Ko = class extends Go {
    constructor() {
        (super(...arguments), (this.KeyframeResolver = Zr));
    }

    sortInstanceNodePosition(e, t) {
        return e.compareDocumentPosition(t) & 2 ? 1 : -1;
    }

    getBaseTargetFromProps(e, t) {
        return e.style ? e.style[t] : void 0;
    }

    removeValueFromRenderState(e, { vars: t, style: n }) {
        (delete t[e], delete n[e]);
    }

    handleChildMotionValue() {
        this.childSubscription && (this.childSubscription(), delete this.childSubscription);
        const { children: e } = this.props;
        R(e) &&
            (this.childSubscription = e.on(`change`, (e) => {
                this.current && (this.current.textContent = `${e}`);
            }));
    }
};
function qo(e, { style: t, vars: n }, r, i) {
    const a = e.style;
    let o;
    for (o in t) a[o] = t[o];
    for (o in (i?.applyProjectionStyles(a, r), n)) a.setProperty(o, n[o]);
}
function Jo(e) {
    return window.getComputedStyle(e);
}
const Yo = class extends Ko {
    constructor() {
        (super(...arguments), (this.type = `html`), (this.renderInstance = qo));
    }

    readValueFromInstance(e, t) {
        if (Un.has(t)) return this.projection?.isProjecting ? Rn(t) : Bn(e, t);
        {
            const n = Jo(e);
            const r = (Xe(t) ? n.getPropertyValue(t) : n[t]) || 0;
            return typeof r === `string` ? r.trim() : r;
        }
    }

    measureInstanceViewportBox(e, { transformPagePoint: t }) {
        return No(e, t);
    }

    build(e, t, n) {
        ja(e, t, n.transformTemplate);
    }

    scrapeMotionValuesFromProps(e, t, n) {
        return $a(e, t, n);
    }
};
const Xo = new Set([
    `baseFrequency`,
    `diffuseConstant`,
    `kernelMatrix`,
    `kernelUnitLength`,
    `keySplines`,
    `keyTimes`,
    `limitingConeAngle`,
    `markerHeight`,
    `markerWidth`,
    `numOctaves`,
    `targetX`,
    `targetY`,
    `surfaceScale`,
    `specularConstant`,
    `specularExponent`,
    `stdDeviation`,
    `tableValues`,
    `viewBox`,
    `gradientTransform`,
    `pathLength`,
    `startOffset`,
    `textLength`,
    `lengthAdjust`
]);
function Zo(e, t, n, r) {
    qo(e, t, void 0, r);
    for (const n in t.attrs) e.setAttribute(Xo.has(n) ? n : oo(n), t.attrs[n]);
}
const Qo = class extends Ko {
    constructor() {
        (super(...arguments), (this.type = `svg`), (this.isSVGTag = !1), (this.measureInstanceViewportBox = Ro));
    }

    getBaseTargetFromProps(e, t) {
        return e[t];
    }

    readValueFromInstance(e, t) {
        if (Un.has(t)) {
            const e = qr(t);
            return (e && e.default) || 0;
        }
        return ((t = Xo.has(t) ? t : oo(t)), e.getAttribute(t));
    }

    scrapeMotionValuesFromProps(e, t, n) {
        return to(e, t, n);
    }

    build(e, t, n) {
        Ba(e, t, this.isSVGTag, n.transformTemplate, n.style);
    }

    renderInstance(e, t, n, r) {
        Zo(e, t, n, r);
    }

    mount(e) {
        ((this.isSVGTag = Ha(e.tagName)), super.mount(e));
    }
};
const $o = (e, t) => (Ga(e) ? new Qo(t) : new Yo(t, { allowProjection: e !== S.Fragment }));
function es(e, t, n) {
    const r = e.getProps();
    return Ja(r, t, n === void 0 ? r.custom : n, e);
}
const ts = (e) => Array.isArray(e);
function ns(e, t, n) {
    e.hasValue(t) ? e.getValue(t).set(n) : e.addValue(t, ai(n));
}
function rs(e) {
    return ts(e) ? e[e.length - 1] || 0 : e;
}
function is(e, t) {
    let { transitionEnd: n = {}, transition: r = {}, ...i } = es(e, t) || {};
    i = { ...i, ...n };
    for (const t in i) ns(e, t, rs(i[t]));
}
function as(e) {
    return !!(R(e) && e.add);
}
function os(e, t) {
    const n = e.getValue(`willChange`);
    if (as(n)) return n.add(t);
    if (!n && oe.WillChange) {
        const n = new oe.WillChange(`auto`);
        (e.addValue(`willChange`, n), n.add(t));
    }
}
function ss(e) {
    return e.props[so];
}
const cs = (e) => e !== null;
function ls(e, { repeat: t, repeatType: n = `loop` }, r) {
    const i = e.filter(cs);
    const a = t && n !== `loop` && t % 2 == 1 ? 0 : i.length - 1;
    return !a || r === void 0 ? i[a] : r;
}
const us = { type: `spring`, stiffness: 500, damping: 25, restSpeed: 10 };
const ds = (e) => ({ type: `spring`, stiffness: 550, damping: e === 0 ? 2 * Math.sqrt(550) : 30, restSpeed: 10 });
const fs = { type: `keyframes`, duration: 0.8 };
const ps = { type: `keyframes`, ease: [0.25, 0.1, 0.35, 1], duration: 0.3 };
const ms = (e, { keyframes: t }) => (t.length > 2 ? fs : Un.has(e) ? (e.startsWith(`scale`) ? ds(t[1]) : us) : ps);
function hs({
    when: e,
    delay: t,
    delayChildren: n,
    staggerChildren: r,
    staggerDirection: i,
    repeat: a,
    repeatType: o,
    repeatDelay: s,
    from: c,
    elapsed: l,
    ...u
}) {
    return !!Object.keys(u).length;
}
const gs =
    (e, t, n, r = {}, i, a) =>
    (o) => {
        const s = Nr(r, e) || {};
        const c = s.delay || r.delay || 0;
        let { elapsed: l = 0 } = r;
        l -= me(c);
        const u = {
            keyframes: Array.isArray(n) ? n : [null, n],
            ease: `easeOut`,
            velocity: t.getVelocity(),
            ...s,
            delay: -l,
            onUpdate: (e) => {
                (t.set(e), s.onUpdate && s.onUpdate(e));
            },
            onComplete: () => {
                (o(), s.onComplete && s.onComplete());
            },
            name: e,
            motionValue: t,
            element: a ? void 0 : i
        };
        (hs(s) || Object.assign(u, ms(e, u)),
            (u.duration &&= me(u.duration)),
            (u.repeatDelay &&= me(u.repeatDelay)),
            u.from !== void 0 && (u.keyframes[0] = u.from));
        let d = !1;
        if (
            ((u.type === !1 || (u.duration === 0 && !u.repeatDelay)) && (wr(u), u.delay === 0 && (d = !0)),
            (oe.instantAnimations || oe.skipAnimations) && ((d = !0), wr(u), (u.delay = 0)),
            (u.allowFlatten = !s.type && !s.ease),
            d && !a && t.get() !== void 0)
        ) {
            const e = ls(u.keyframes, s);
            if (e !== void 0) {
                k.update(() => {
                    (u.onUpdate(e), u.onComplete());
                });
                return;
            }
        }
        return s.isSync ? new On(u) : new kr(u);
    };
function _s({ protectedKeys: e, needsAnimating: t }, n) {
    const r = e.hasOwnProperty(n) && t[n] !== !0;
    return ((t[n] = !1), r);
}
function vs(e, t, { delay: n = 0, transitionOverride: r, type: i } = {}) {
    let { transition: a = e.getDefaultTransition(), transitionEnd: o, ...s } = t;
    r && (a = r);
    const c = [];
    const l = i && e.animationState && e.animationState.getState()[i];
    for (const t in s) {
        const r = e.getValue(t, e.latestValues[t] ?? null);
        const i = s[t];
        if (i === void 0 || (l && _s(l, t))) continue;
        const o = { delay: n, ...Nr(a || {}, t) };
        const u = r.get();
        if (u !== void 0 && !r.isAnimating && !Array.isArray(i) && i === u && !o.velocity) continue;
        let d = !1;
        if (window.MotionHandoffAnimation) {
            const n = ss(e);
            if (n) {
                const e = window.MotionHandoffAnimation(n, t, k);
                e !== null && ((o.startTime = e), (d = !0));
            }
        }
        (os(e, t), r.start(gs(t, r, i, e.shouldReduceMotion && Pr.has(t) ? { type: !1 } : o, e, d)));
        const f = r.animation;
        f && c.push(f);
    }
    return (
        o &&
            Promise.all(c).then(() => {
                k.update(() => {
                    o && is(e, o);
                });
            }),
        c
    );
}
function ys(e, t, n, r = 0, i = 1) {
    const a = Array.from(e)
        .sort((e, t) => e.sortNodePosition(t))
        .indexOf(t);
    const o = e.size;
    const s = (o - 1) * r;
    return typeof n === `function` ? n(a, o) : i === 1 ? a * r : s - a * r;
}
function bs(e, t, n = {}) {
    const r = es(e, t, n.type === `exit` ? e.presenceContext?.custom : void 0);
    let { transition: i = e.getDefaultTransition() || {} } = r || {};
    n.transitionOverride && (i = n.transitionOverride);
    const a = r ? () => Promise.all(vs(e, r, n)) : () => Promise.resolve();
    const o =
        e.variantChildren && e.variantChildren.size
            ? (r = 0) => {
                  const { delayChildren: a = 0, staggerChildren: o, staggerDirection: s } = i;
                  return xs(e, t, r, a, o, s, n);
              }
            : () => Promise.resolve();
    const { when: s } = i;
    if (s) {
        const [e, t] = s === `beforeChildren` ? [a, o] : [o, a];
        return e().then(() => t());
    } else return Promise.all([a(), o(n.delay)]);
}
function xs(e, t, n = 0, r = 0, i = 0, a = 1, o) {
    const s = [];
    for (const c of e.variantChildren) {
        (c.notify(`AnimationStart`, t),
            s.push(
                bs(c, t, {
                    ...o,
                    delay: n + (typeof r === `function` ? 0 : r) + ys(e.variantChildren, c, r, i, a)
                }).then(() => c.notify(`AnimationComplete`, t))
            ));
    }
    return Promise.all(s);
}
function Ss(e, t, n = {}) {
    e.notify(`AnimationStart`, t);
    let r;
    if (Array.isArray(t)) {
        const i = t.map((t) => bs(e, t, n));
        r = Promise.all(i);
    } else if (typeof t === `string`) r = bs(e, t, n);
    else {
        const i = typeof t === `function` ? es(e, t, n.custom) : t;
        r = Promise.all(vs(e, i, n));
    }
    return r.then(() => {
        e.notify(`AnimationComplete`, t);
    });
}
function Cs(e, t) {
    if (!Array.isArray(t)) return !1;
    const n = t.length;
    if (n !== e.length) return !1;
    for (let r = 0; r < n; r++) if (t[r] !== e[r]) return !1;
    return !0;
}
const ws = ya.length;
function Ts(e) {
    if (!e) return;
    if (!e.isControllingVariants) {
        const t = (e.parent && Ts(e.parent)) || {};
        return (e.props.initial !== void 0 && (t.initial = e.props.initial), t);
    }
    const t = {};
    for (let n = 0; n < ws; n++) {
        const r = ya[n];
        const i = e.props[r];
        (_a(i) || i === !1) && (t[r] = i);
    }
    return t;
}
const Es = [...va].reverse();
const Ds = va.length;
function Os(e) {
    return (t) => Promise.all(t.map(({ animation: t, options: n }) => Ss(e, t, n)));
}
function ks(e) {
    let t = Os(e);
    let n = Ms();
    let r = !0;
    const i = (t) => (n, r) => {
        const i = es(e, r, t === `exit` ? e.presenceContext?.custom : void 0);
        if (i) {
            const { transition: e, transitionEnd: t, ...r } = i;
            n = { ...n, ...r, ...t };
        }
        return n;
    };
    function a(n) {
        t = n(e);
    }
    function o(a) {
        const { props: o } = e;
        const s = Ts(e.parent) || {};
        const c = [];
        const l = new Set();
        let u = {};
        let d = 1 / 0;
        for (let t = 0; t < Ds; t++) {
            const f = Es[t];
            const p = n[f];
            const m = o[f] === void 0 ? s[f] : o[f];
            const h = _a(m);
            const g = f === a ? p.isActive : null;
            g === !1 && (d = t);
            let _ = m === s[f] && m !== o[f] && h;
            if (
                (_ && r && e.manuallyAnimateOnMount && (_ = !1),
                (p.protectedKeys = { ...u }),
                (!p.isActive && g === null) || (!m && !p.prevProp) || ga(m) || typeof m === `boolean`)
            ) {
                continue;
            }
            const v = As(p.prevProp, m);
            let y = v || (f === a && p.isActive && !_ && h) || (t > d && h);
            let b = !1;
            const x = Array.isArray(m) ? m : [m];
            let S = x.reduce(i(f), {});
            g === !1 && (S = {});
            const { prevResolvedValues: C = {} } = p;
            const w = { ...C, ...S };
            const ee = (t) => {
                ((y = !0), l.has(t) && ((b = !0), l.delete(t)), (p.needsAnimating[t] = !0));
                const n = e.getValue(t);
                n && (n.liveStyle = !1);
            };
            for (const e in w) {
                const t = S[e];
                const n = C[e];
                if (u.hasOwnProperty(e)) continue;
                let r = !1;
                ((r = ts(t) && ts(n) ? !Cs(t, n) : t !== n),
                    r ? (t == null ? l.add(e) : ee(e)) : t !== void 0 && l.has(e) ? ee(e) : (p.protectedKeys[e] = !0));
            }
            ((p.prevProp = m),
                (p.prevResolvedValues = S),
                p.isActive && (u = { ...u, ...S }),
                r && e.blockInitialAnimation && (y = !1));
            const te = _ && v;
            y &&
                (!te || b) &&
                c.push(
                    ...x.map((t) => {
                        const n = { type: f };
                        if (typeof t === `string` && r && !te && e.manuallyAnimateOnMount && e.parent) {
                            const { parent: r } = e;
                            const i = es(r, t);
                            if (r.enteringChildren && i) {
                                const { delayChildren: t } = i.transition || {};
                                n.delay = ys(r.enteringChildren, e, t);
                            }
                        }
                        return { animation: t, options: n };
                    })
                );
        }
        if (l.size) {
            const t = {};
            if (typeof o.initial !== `boolean`) {
                const n = es(e, Array.isArray(o.initial) ? o.initial[0] : o.initial);
                n && n.transition && (t.transition = n.transition);
            }
            (l.forEach((n) => {
                const r = e.getBaseTarget(n);
                const i = e.getValue(n);
                (i && (i.liveStyle = !0), (t[n] = r ?? null));
            }),
                c.push({ animation: t }));
        }
        let f = !!c.length;
        return (
            r && (o.initial === !1 || o.initial === o.animate) && !e.manuallyAnimateOnMount && (f = !1),
            (r = !1),
            f ? t(c) : Promise.resolve()
        );
    }
    function s(t, r) {
        if (n[t].isActive === r) return Promise.resolve();
        (e.variantChildren?.forEach((e) => e.animationState?.setActive(t, r)), (n[t].isActive = r));
        const i = o(t);
        for (const e in n) n[e].protectedKeys = {};
        return i;
    }
    return {
        animateChanges: o,
        setActive: s,
        setAnimateFunction: a,
        getState: () => n,
        reset: () => {
            n = Ms();
        }
    };
}
function As(e, t) {
    return typeof t === `string` ? t !== e : Array.isArray(t) ? !Cs(t, e) : !1;
}
function js(e = !1) {
    return { isActive: e, protectedKeys: {}, needsAnimating: {}, prevResolvedValues: {} };
}
function Ms() {
    return {
        animate: js(!0),
        whileInView: js(),
        whileHover: js(),
        whileTap: js(),
        whileDrag: js(),
        whileFocus: js(),
        exit: js()
    };
}
const Ns = class {
    constructor(e) {
        ((this.isMounted = !1), (this.node = e));
    }

    update() {}
};
const Ps = class extends Ns {
    constructor(e) {
        (super(e), (e.animationState ||= ks(e)));
    }

    updateAnimationControlsSubscription() {
        const { animate: e } = this.node.getProps();
        ga(e) && (this.unmountControls = e.subscribe(this.node));
    }

    mount() {
        this.updateAnimationControlsSubscription();
    }

    update() {
        const { animate: e } = this.node.getProps();
        const { animate: t } = this.node.prevProps || {};
        e !== t && this.updateAnimationControlsSubscription();
    }

    unmount() {
        (this.node.animationState.reset(), this.unmountControls?.());
    }
};
let Fs = 0;
const Is = {
    animation: { Feature: Ps },
    exit: {
        Feature: class extends Ns {
            constructor() {
                (super(...arguments), (this.id = Fs++));
            }

            update() {
                if (!this.node.presenceContext) return;
                const { isPresent: e, onExitComplete: t } = this.node.presenceContext;
                const { isPresent: n } = this.node.prevPresenceContext || {};
                if (!this.node.animationState || e === n) return;
                const r = this.node.animationState.setActive(`exit`, !e);
                t &&
                    !e &&
                    r.then(() => {
                        t(this.id);
                    });
            }

            mount() {
                const { register: e, onExitComplete: t } = this.node.presenceContext || {};
                (t && t(this.id), e && (this.unmount = e(this.id)));
            }

            unmount() {}
        }
    }
};
function Ls(e, t, n, r = { passive: !0 }) {
    return (e.addEventListener(t, n, r), () => e.removeEventListener(t, n));
}
function Rs(e) {
    return { point: { x: e.pageX, y: e.pageY } };
}
const zs = (e) => (t) => hi(t) && e(t, Rs(t));
function Bs(e, t, n, r) {
    return Ls(e, t, zs(n), r);
}
const Vs = 1e-4;
const Hs = 1 - Vs;
const Us = 1 + Vs;
const Ws = 0.01;
const Gs = 0 - Ws;
const Ks = 0 + Ws;
function qs(e) {
    return e.max - e.min;
}
function Js(e, t, n) {
    return Math.abs(e - t) <= n;
}
function Ys(e, t, n, r = 0.5) {
    ((e.origin = r),
        (e.originPoint = P(t.min, t.max, e.origin)),
        (e.scale = qs(n) / qs(t)),
        (e.translate = P(n.min, n.max, e.origin) - e.originPoint),
        ((e.scale >= Hs && e.scale <= Us) || isNaN(e.scale)) && (e.scale = 1),
        ((e.translate >= Gs && e.translate <= Ks) || isNaN(e.translate)) && (e.translate = 0));
}
function Xs(e, t, n, r) {
    (Ys(e.x, t.x, n.x, r ? r.originX : void 0), Ys(e.y, t.y, n.y, r ? r.originY : void 0));
}
function Zs(e, t, n) {
    ((e.min = n.min + t.min), (e.max = e.min + qs(t)));
}
function Qs(e, t, n) {
    (Zs(e.x, t.x, n.x), Zs(e.y, t.y, n.y));
}
function $s(e, t, n) {
    ((e.min = t.min - n.min), (e.max = e.min + qs(t)));
}
function ec(e, t, n) {
    ($s(e.x, t.x, n.x), $s(e.y, t.y, n.y));
}
function tc(e) {
    return [e(`x`), e(`y`)];
}
const nc = ({ current: e }) => (e ? e.ownerDocument.defaultView : null);
const rc = (e, t) => Math.abs(e - t);
function ic(e, t) {
    const n = rc(e.x, t.x);
    const r = rc(e.y, t.y);
    return Math.sqrt(n ** 2 + r ** 2);
}
const ac = class {
    constructor(
        e,
        t,
        { transformPagePoint: n, contextWindow: r = window, dragSnapToOrigin: i = !1, distanceThreshold: a = 3 } = {}
    ) {
        if (
            ((this.startEvent = null),
            (this.lastMoveEvent = null),
            (this.lastMoveEventInfo = null),
            (this.handlers = {}),
            (this.contextWindow = window),
            (this.updatePoint = () => {
                if (!(this.lastMoveEvent && this.lastMoveEventInfo)) return;
                const e = cc(this.lastMoveEventInfo, this.history);
                const t = this.startEvent !== null;
                const n = ic(e.offset, { x: 0, y: 0 }) >= this.distanceThreshold;
                if (!t && !n) return;
                const { point: r } = e;
                const { timestamp: i } = Ue;
                this.history.push({ ...r, timestamp: i });
                const { onStart: a, onMove: o } = this.handlers;
                (t || (a && a(this.lastMoveEvent, e), (this.startEvent = this.lastMoveEvent)),
                    o && o(this.lastMoveEvent, e));
            }),
            (this.handlePointerMove = (e, t) => {
                ((this.lastMoveEvent = e),
                    (this.lastMoveEventInfo = oc(t, this.transformPagePoint)),
                    k.update(this.updatePoint, !0));
            }),
            (this.handlePointerUp = (e, t) => {
                this.end();
                const { onEnd: n, onSessionEnd: r, resumeAnimation: i } = this.handlers;
                if ((this.dragSnapToOrigin && i && i(), !(this.lastMoveEvent && this.lastMoveEventInfo))) return;
                const a = cc(
                    e.type === `pointercancel` ? this.lastMoveEventInfo : oc(t, this.transformPagePoint),
                    this.history
                );
                (this.startEvent && n && n(e, a), r && r(e, a));
            }),
            !hi(e))
        ) {
            return;
        }
        ((this.dragSnapToOrigin = i),
            (this.handlers = t),
            (this.transformPagePoint = n),
            (this.distanceThreshold = a),
            (this.contextWindow = r || window));
        const o = oc(Rs(e), this.transformPagePoint);
        const { point: s } = o;
        const { timestamp: c } = Ue;
        this.history = [{ ...s, timestamp: c }];
        const { onSessionStart: l } = t;
        (l && l(e, cc(o, this.history)),
            (this.removeListeners = de(
                Bs(this.contextWindow, `pointermove`, this.handlePointerMove),
                Bs(this.contextWindow, `pointerup`, this.handlePointerUp),
                Bs(this.contextWindow, `pointercancel`, this.handlePointerUp)
            )));
    }

    updateHandlers(e) {
        this.handlers = e;
    }

    end() {
        (this.removeListeners && this.removeListeners(), He(this.updatePoint));
    }
};
function oc(e, t) {
    return t ? { point: t(e.point) } : e;
}
function sc(e, t) {
    return { x: e.x - t.x, y: e.y - t.y };
}
function cc({ point: e }, t) {
    return { point: e, delta: sc(e, uc(t)), offset: sc(e, lc(t)), velocity: dc(t, 0.1) };
}
function lc(e) {
    return e[0];
}
function uc(e) {
    return e[e.length - 1];
}
function dc(e, t) {
    if (e.length < 2) return { x: 0, y: 0 };
    let n = e.length - 1;
    let r = null;
    const i = uc(e);
    for (; n >= 0 && ((r = e[n]), !(i.timestamp - r.timestamp > me(t)));) n--;
    if (!r) return { x: 0, y: 0 };
    const a = D(i.timestamp - r.timestamp);
    if (a === 0) return { x: 0, y: 0 };
    const o = { x: (i.x - r.x) / a, y: (i.y - r.y) / a };
    return (o.x === 1 / 0 && (o.x = 0), o.y === 1 / 0 && (o.y = 0), o);
}
function fc(e, { min: t, max: n }, r) {
    return (
        t !== void 0 && e < t
            ? (e = r ? P(t, e, r.min) : Math.max(e, t))
            : n !== void 0 && e > n && (e = r ? P(n, e, r.max) : Math.min(e, n)),
        e
    );
}
function pc(e, t, n) {
    return { min: t === void 0 ? void 0 : e.min + t, max: n === void 0 ? void 0 : e.max + n - (e.max - e.min) };
}
function mc(e, { top: t, left: n, bottom: r, right: i }) {
    return { x: pc(e.x, n, i), y: pc(e.y, t, r) };
}
function hc(e, t) {
    let n = t.min - e.min;
    let r = t.max - e.max;
    return (t.max - t.min < e.max - e.min && ([n, r] = [r, n]), { min: n, max: r });
}
function gc(e, t) {
    return { x: hc(e.x, t.x), y: hc(e.y, t.y) };
}
function _c(e, t) {
    let n = 0.5;
    const r = qs(e);
    const i = qs(t);
    return (i > r ? (n = fe(t.min, t.max - r, e.min)) : r > i && (n = fe(e.min, e.max - i, t.min)), ae(0, 1, n));
}
function vc(e, t) {
    const n = {};
    return (t.min !== void 0 && (n.min = t.min - e.min), t.max !== void 0 && (n.max = t.max - e.min), n);
}
const yc = 0.35;
function bc(e = yc) {
    return (e === !1 ? (e = 0) : e === !0 && (e = yc), { x: xc(e, `left`, `right`), y: xc(e, `top`, `bottom`) });
}
function xc(e, t, n) {
    return { min: Sc(e, t), max: Sc(e, n) };
}
function Sc(e, t) {
    return typeof e === `number` ? e : e[t] || 0;
}
const Cc = new WeakMap();
const wc = class {
    constructor(e) {
        ((this.openDragLock = null),
            (this.isDragging = !1),
            (this.currentDirection = null),
            (this.originPoint = { x: 0, y: 0 }),
            (this.constraints = !1),
            (this.hasMutatedConstraints = !1),
            (this.elastic = Ro()),
            (this.latestPointerEvent = null),
            (this.latestPanInfo = null),
            (this.visualElement = e));
    }

    start(e, { snapToCursor: t = !1, distanceThreshold: n } = {}) {
        const { presenceContext: r } = this.visualElement;
        if (r && r.isPresent === !1) return;
        const i = (e) => {
            const { dragSnapToOrigin: n } = this.getProps();
            (n ? this.pauseAnimation() : this.stopAnimation(), t && this.snapToCursor(Rs(e).point));
        };
        const a = (e, t) => {
            const { drag: n, dragPropagation: r, onDragStart: i } = this.getProps();
            if (
                n &&
                !r &&
                (this.openDragLock && this.openDragLock(), (this.openDragLock = ui(n)), !this.openDragLock)
            ) {
                return;
            }
            ((this.latestPointerEvent = e),
                (this.latestPanInfo = t),
                (this.isDragging = !0),
                (this.currentDirection = null),
                this.resolveConstraints(),
                this.visualElement.projection &&
                    ((this.visualElement.projection.isAnimationBlocked = !0),
                    (this.visualElement.projection.target = void 0)),
                tc((e) => {
                    let t = this.getAxisMotionValue(e).get() || 0;
                    if (j.test(t)) {
                        const { projection: n } = this.visualElement;
                        if (n && n.layout) {
                            const r = n.layout.layoutBox[e];
                            r && (t = qs(r) * (parseFloat(t) / 100));
                        }
                    }
                    this.originPoint[e] = t;
                }),
                i && k.postRender(() => i(e, t)),
                os(this.visualElement, `transform`));
            const { animationState: a } = this.visualElement;
            a && a.setActive(`whileDrag`, !0);
        };
        const o = (e, t) => {
            ((this.latestPointerEvent = e), (this.latestPanInfo = t));
            const { dragPropagation: n, dragDirectionLock: r, onDirectionLock: i, onDrag: a } = this.getProps();
            if (!n && !this.openDragLock) return;
            const { offset: o } = t;
            if (r && this.currentDirection === null) {
                ((this.currentDirection = Ec(o)), this.currentDirection !== null && i && i(this.currentDirection));
                return;
            }
            (this.updateAxis(`x`, t.point, o),
                this.updateAxis(`y`, t.point, o),
                this.visualElement.render(),
                a && a(e, t));
        };
        const s = (e, t) => {
            ((this.latestPointerEvent = e),
                (this.latestPanInfo = t),
                this.stop(e, t),
                (this.latestPointerEvent = null),
                (this.latestPanInfo = null));
        };
        const c = () =>
            tc((e) => this.getAnimationState(e) === `paused` && this.getAxisMotionValue(e).animation?.play());
        const { dragSnapToOrigin: l } = this.getProps();
        this.panSession = new ac(
            e,
            { onSessionStart: i, onStart: a, onMove: o, onSessionEnd: s, resumeAnimation: c },
            {
                transformPagePoint: this.visualElement.getTransformPagePoint(),
                dragSnapToOrigin: l,
                distanceThreshold: n,
                contextWindow: nc(this.visualElement)
            }
        );
    }

    stop(e, t) {
        const n = e || this.latestPointerEvent;
        const r = t || this.latestPanInfo;
        const i = this.isDragging;
        if ((this.cancel(), !i || !r || !n)) return;
        const { velocity: a } = r;
        this.startAnimation(a);
        const { onDragEnd: o } = this.getProps();
        o && k.postRender(() => o(n, r));
    }

    cancel() {
        this.isDragging = !1;
        const { projection: e, animationState: t } = this.visualElement;
        (e && (e.isAnimationBlocked = !1), this.panSession && this.panSession.end(), (this.panSession = void 0));
        const { dragPropagation: n } = this.getProps();
        (!n && this.openDragLock && (this.openDragLock(), (this.openDragLock = null)),
            t && t.setActive(`whileDrag`, !1));
    }

    updateAxis(e, t, n) {
        const { drag: r } = this.getProps();
        if (!n || !Tc(e, r, this.currentDirection)) return;
        const i = this.getAxisMotionValue(e);
        let a = this.originPoint[e] + n[e];
        (this.constraints && this.constraints[e] && (a = fc(a, this.constraints[e], this.elastic[e])), i.set(a));
    }

    resolveConstraints() {
        const { dragConstraints: e, dragElastic: t } = this.getProps();
        const n =
            this.visualElement.projection && !this.visualElement.projection.layout
                ? this.visualElement.projection.measure(!1)
                : this.visualElement.projection?.layout;
        const r = this.constraints;
        (e && io(e)
            ? (this.constraints ||= this.resolveRefConstraints())
            : e && n
              ? (this.constraints = mc(n.layoutBox, e))
              : (this.constraints = !1),
            (this.elastic = bc(t)),
            r !== this.constraints &&
                n &&
                this.constraints &&
                !this.hasMutatedConstraints &&
                tc((e) => {
                    this.constraints !== !1 &&
                        this.getAxisMotionValue(e) &&
                        (this.constraints[e] = vc(n.layoutBox[e], this.constraints[e]));
                }));
    }

    resolveRefConstraints() {
        const { dragConstraints: e, onMeasureDragConstraints: t } = this.getProps();
        if (!e || !io(e)) return !1;
        const n = e.current;
        const { projection: r } = this.visualElement;
        if (!r || !r.layout) return !1;
        const i = Po(n, r.root, this.visualElement.getTransformPagePoint());
        let a = gc(r.layout.layoutBox, i);
        if (t) {
            const e = t(_o(a));
            ((this.hasMutatedConstraints = !!e), e && (a = go(e)));
        }
        return a;
    }

    startAnimation(e) {
        const {
            drag: t,
            dragMomentum: n,
            dragElastic: r,
            dragTransition: i,
            dragSnapToOrigin: a,
            onDragTransitionEnd: o
        } = this.getProps();
        const s = this.constraints || {};
        const c = tc((o) => {
            if (!Tc(o, t, this.currentDirection)) return;
            let c = (s && s[o]) || {};
            a && (c = { min: 0, max: 0 });
            const l = r ? 200 : 1e6;
            const u = r ? 40 : 1e7;
            const d = {
                type: `inertia`,
                velocity: n ? e[o] : 0,
                bounceStiffness: l,
                bounceDamping: u,
                timeConstant: 750,
                restDelta: 1,
                restSpeed: 10,
                ...i,
                ...c
            };
            return this.startAxisValueAnimation(o, d);
        });
        return Promise.all(c).then(o);
    }

    startAxisValueAnimation(e, t) {
        const n = this.getAxisMotionValue(e);
        return (os(this.visualElement, e), n.start(gs(e, n, 0, t, this.visualElement, !1)));
    }

    stopAnimation() {
        tc((e) => this.getAxisMotionValue(e).stop());
    }

    pauseAnimation() {
        tc((e) => this.getAxisMotionValue(e).animation?.pause());
    }

    getAnimationState(e) {
        return this.getAxisMotionValue(e).animation?.state;
    }

    getAxisMotionValue(e) {
        const t = `_drag${e.toUpperCase()}`;
        const n = this.visualElement.getProps();
        return n[t] || this.visualElement.getValue(e, (n.initial ? n.initial[e] : void 0) || 0);
    }

    snapToCursor(e) {
        tc((t) => {
            const { drag: n } = this.getProps();
            if (!Tc(t, n, this.currentDirection)) return;
            const { projection: r } = this.visualElement;
            const i = this.getAxisMotionValue(t);
            if (r && r.layout) {
                const { min: n, max: a } = r.layout.layoutBox[t];
                i.set(e[t] - P(n, a, 0.5));
            }
        });
    }

    scalePositionWithinConstraints() {
        if (!this.visualElement.current) return;
        const { drag: e, dragConstraints: t } = this.getProps();
        const { projection: n } = this.visualElement;
        if (!io(t) || !n || !this.constraints) return;
        this.stopAnimation();
        const r = { x: 0, y: 0 };
        tc((e) => {
            const t = this.getAxisMotionValue(e);
            if (t && this.constraints !== !1) {
                const n = t.get();
                r[e] = _c({ min: n, max: n }, this.constraints[e]);
            }
        });
        const { transformTemplate: i } = this.visualElement.getProps();
        ((this.visualElement.current.style.transform = i ? i({}, ``) : `none`),
            n.root && n.root.updateScroll(),
            n.updateLayout(),
            this.resolveConstraints(),
            tc((t) => {
                if (!Tc(t, e, null)) return;
                const n = this.getAxisMotionValue(t);
                const { min: i, max: a } = this.constraints[t];
                n.set(P(i, a, r[t]));
            }));
    }

    addListeners() {
        if (!this.visualElement.current) return;
        Cc.set(this.visualElement, this);
        const e = this.visualElement.current;
        const t = Bs(e, `pointerdown`, (e) => {
            const { drag: t, dragListener: n = !0 } = this.getProps();
            t && n && this.start(e);
        });
        const n = () => {
            const { dragConstraints: e } = this.getProps();
            io(e) && e.current && (this.constraints = this.resolveRefConstraints());
        };
        const { projection: r } = this.visualElement;
        const i = r.addEventListener(`measure`, n);
        (r && !r.layout && (r.root && r.root.updateScroll(), r.updateLayout()), k.read(n));
        const a = Ls(window, `resize`, () => this.scalePositionWithinConstraints());
        const o = r.addEventListener(`didUpdate`, ({ delta: e, hasLayoutChanged: t }) => {
            this.isDragging &&
                t &&
                (tc((t) => {
                    const n = this.getAxisMotionValue(t);
                    n && ((this.originPoint[t] += e[t].translate), n.set(n.get() + e[t].translate));
                }),
                this.visualElement.render());
        });
        return () => {
            (a(), t(), i(), o && o());
        };
    }

    getProps() {
        const e = this.visualElement.getProps();
        const {
            drag: t = !1,
            dragDirectionLock: n = !1,
            dragPropagation: r = !1,
            dragConstraints: i = !1,
            dragElastic: a = yc,
            dragMomentum: o = !0
        } = e;
        return {
            ...e,
            drag: t,
            dragDirectionLock: n,
            dragPropagation: r,
            dragConstraints: i,
            dragElastic: a,
            dragMomentum: o
        };
    }
};
function Tc(e, t, n) {
    return (t === !0 || t === e) && (n === null || n === e);
}
function Ec(e, t = 10) {
    let n = null;
    return (Math.abs(e.y) > t ? (n = `y`) : Math.abs(e.x) > t && (n = `x`), n);
}
const Dc = class extends Ns {
    constructor(e) {
        (super(e), (this.removeGroupControls = T), (this.removeListeners = T), (this.controls = new wc(e)));
    }

    mount() {
        const { dragControls: e } = this.node.getProps();
        (e && (this.removeGroupControls = e.subscribe(this.controls)),
            (this.removeListeners = this.controls.addListeners() || T));
    }

    unmount() {
        (this.removeGroupControls(), this.removeListeners());
    }
};
const Oc = (e) => (t, n) => {
    e && k.postRender(() => e(t, n));
};
const kc = class extends Ns {
    constructor() {
        (super(...arguments), (this.removePointerDownListener = T));
    }

    onPointerDown(e) {
        this.session = new ac(e, this.createPanHandlers(), {
            transformPagePoint: this.node.getTransformPagePoint(),
            contextWindow: nc(this.node)
        });
    }

    createPanHandlers() {
        const { onPanSessionStart: e, onPanStart: t, onPan: n, onPanEnd: r } = this.node.getProps();
        return {
            onSessionStart: Oc(e),
            onStart: Oc(t),
            onMove: n,
            onEnd: (e, t) => {
                (delete this.session, r && k.postRender(() => r(e, t)));
            }
        };
    }

    mount() {
        this.removePointerDownListener = Bs(this.node.current, `pointerdown`, (e) => this.onPointerDown(e));
    }

    update() {
        this.session && this.session.updateHandlers(this.createPanHandlers());
    }

    unmount() {
        (this.removePointerDownListener(), this.session && this.session.end());
    }
};
const Ac = { hasAnimatedSinceResize: !0, hasEverUpdated: !1 };
function jc(e, t) {
    return t.max === t.min ? 0 : (e / (t.max - t.min)) * 100;
}
const Mc = {
    correct: (e, t) => {
        if (!t.target) return e;
        if (typeof e === `string`) {
            if (M.test(e)) e = parseFloat(e);
            else return e;
        }
        return `${jc(e, t.target.x)}% ${jc(e, t.target.y)}%`;
    }
};
const Nc = {
    correct: (e, { treeScale: t, projectionDelta: n }) => {
        const r = e;
        const i = Mt.parse(e);
        if (i.length > 5) return r;
        const a = Mt.createTransformer(e);
        const o = typeof i[0] === `number` ? 0 : 1;
        const s = n.x.scale * t.x;
        const c = n.y.scale * t.y;
        ((i[0 + o] /= s), (i[1 + o] /= c));
        const l = P(s, c, 0.5);
        return (typeof i[2 + o] === `number` && (i[2 + o] /= l), typeof i[3 + o] === `number` && (i[3 + o] /= l), a(i));
    }
};
let Pc = !1;
const Fc = class extends S.Component {
    componentDidMount() {
        const { visualElement: e, layoutGroup: t, switchLayoutGroup: n, layoutId: r } = this.props;
        const { projection: i } = e;
        (Ea(Lc),
            i &&
                (t.group && t.group.add(i),
                n && n.register && r && n.register(i),
                Pc && i.root.didUpdate(),
                i.addEventListener(`animationComplete`, () => {
                    this.safeToRemove();
                }),
                i.setOptions({ ...i.options, onExitComplete: () => this.safeToRemove() })),
            (Ac.hasEverUpdated = !0));
    }

    getSnapshotBeforeUpdate(e) {
        const { layoutDependency: t, visualElement: n, drag: r, isPresent: i } = this.props;
        const { projection: a } = n;
        return a
            ? ((a.isPresent = i),
              (Pc = !0),
              r || e.layoutDependency !== t || t === void 0 || e.isPresent !== i ? a.willUpdate() : this.safeToRemove(),
              e.isPresent !== i &&
                  (i
                      ? a.promote()
                      : a.relegate() ||
                        k.postRender(() => {
                            const e = a.getStack();
                            (!e || !e.members.length) && this.safeToRemove();
                        })),
              null)
            : null;
    }

    componentDidUpdate() {
        const { projection: e } = this.props.visualElement;
        e &&
            (e.root.didUpdate(),
            oi.postRender(() => {
                !e.currentAnimation && e.isLead() && this.safeToRemove();
            }));
    }

    componentWillUnmount() {
        const { visualElement: e, layoutGroup: t, switchLayoutGroup: n } = this.props;
        const { projection: r } = e;
        ((Pc = !0),
            r &&
                (r.scheduleCheckAfterUnmount(),
                t && t.group && t.group.remove(r),
                n && n.deregister && n.deregister(r)));
    }

    safeToRemove() {
        const { safeToRemove: e } = this.props;
        e && e();
    }

    render() {
        return null;
    }
};
function Ic(e) {
    const [t, n] = $i();
    const r = (0, S.useContext)(C);
    return (0, z.jsx)(Fc, {
        ...e,
        layoutGroup: r,
        switchLayoutGroup: (0, S.useContext)(co),
        isPresent: t,
        safeToRemove: n
    });
}
var Lc = {
    borderRadius: {
        ...Mc,
        applyTo: [`borderTopLeftRadius`, `borderTopRightRadius`, `borderBottomLeftRadius`, `borderBottomRightRadius`]
    },
    borderTopLeftRadius: Mc,
    borderTopRightRadius: Mc,
    borderBottomLeftRadius: Mc,
    borderBottomRightRadius: Mc,
    boxShadow: Nc
};
function Rc(e, t, n) {
    const r = R(e) ? e : ai(e);
    return (r.start(gs(``, r, t, n)), r.animation);
}
const U = (e, t) => e.depth - t.depth;
const zc = class {
    constructor() {
        ((this.children = []), (this.isDirty = !1));
    }

    add(e) {
        (re(this.children, e), (this.isDirty = !0));
    }

    remove(e) {
        (ie(this.children, e), (this.isDirty = !0));
    }

    forEach(e) {
        (this.isDirty && this.children.sort(U), (this.isDirty = !1), this.children.forEach(e));
    }
};
function Bc(e, t) {
    const n = qe.now();
    const r = ({ timestamp: i }) => {
        const a = i - n;
        a >= t && (He(r), e(a - t));
    };
    return (k.setup(r, !0), () => He(r));
}
const Vc = [`TopLeft`, `TopRight`, `BottomLeft`, `BottomRight`];
const Hc = Vc.length;
const Uc = (e) => (typeof e === `string` ? parseFloat(e) : e);
const Wc = (e) => typeof e === `number` || M.test(e);
function Gc(e, t, n, r, i, a) {
    i
        ? ((e.opacity = P(0, n.opacity ?? 1, qc(r))), (e.opacityExit = P(t.opacity ?? 1, 0, Jc(r))))
        : a && (e.opacity = P(t.opacity ?? 1, n.opacity ?? 1, r));
    for (let i = 0; i < Hc; i++) {
        const a = `border${Vc[i]}Radius`;
        let o = Kc(t, a);
        let s = Kc(n, a);
        (o === void 0 && s === void 0) ||
            ((o ||= 0),
            (s ||= 0),
            o === 0 || s === 0 || Wc(o) === Wc(s)
                ? ((e[a] = Math.max(P(Uc(o), Uc(s), r), 0)), (j.test(s) || j.test(o)) && (e[a] += `%`))
                : (e[a] = s));
    }
    (t.rotate || n.rotate) && (e.rotate = P(t.rotate || 0, n.rotate || 0, r));
}
function Kc(e, t) {
    return e[t] === void 0 ? e.borderRadius : e[t];
}
var qc = Yc(0, 0.5, De);
var Jc = Yc(0.5, 0.95, T);
function Yc(e, t, n) {
    return (r) => (r < e ? 0 : r > t ? 1 : n(fe(e, t, r)));
}
function Xc(e, t) {
    ((e.min = t.min), (e.max = t.max));
}
function Zc(e, t) {
    (Xc(e.x, t.x), Xc(e.y, t.y));
}
function Qc(e, t) {
    ((e.translate = t.translate), (e.scale = t.scale), (e.originPoint = t.originPoint), (e.origin = t.origin));
}
function $c(e, t, n, r, i) {
    return ((e -= t), (e = Co(e, 1 / n, r)), i !== void 0 && (e = Co(e, 1 / i, r)), e);
}
function el(e, t = 0, n = 1, r = 0.5, i, a = e, o = e) {
    if ((j.test(t) && ((t = parseFloat(t)), (t = P(o.min, o.max, t / 100) - o.min)), typeof t !== `number`)) return;
    let s = P(a.min, a.max, r);
    (e === a && (s -= t), (e.min = $c(e.min, t, n, s, i)), (e.max = $c(e.max, t, n, s, i)));
}
function tl(e, t, [n, r, i], a, o) {
    el(e, t[n], t[r], t[i], t.scale, a, o);
}
const nl = [`x`, `scaleX`, `originX`];
const rl = [`y`, `scaleY`, `originY`];
function il(e, t, n, r) {
    (tl(e.x, t, nl, n ? n.x : void 0, r ? r.x : void 0), tl(e.y, t, rl, n ? n.y : void 0, r ? r.y : void 0));
}
function al(e) {
    return e.translate === 0 && e.scale === 1;
}
function ol(e) {
    return al(e.x) && al(e.y);
}
function sl(e, t) {
    return e.min === t.min && e.max === t.max;
}
function cl(e, t) {
    return sl(e.x, t.x) && sl(e.y, t.y);
}
function W(e, t) {
    return Math.round(e.min) === Math.round(t.min) && Math.round(e.max) === Math.round(t.max);
}
function ll(e, t) {
    return W(e.x, t.x) && W(e.y, t.y);
}
function ul(e) {
    return qs(e.x) / qs(e.y);
}
function dl(e, t) {
    return e.translate === t.translate && e.scale === t.scale && e.originPoint === t.originPoint;
}
const fl = class {
    constructor() {
        this.members = [];
    }

    add(e) {
        (re(this.members, e), e.scheduleRender());
    }

    remove(e) {
        if ((ie(this.members, e), e === this.prevLead && (this.prevLead = void 0), e === this.lead)) {
            const e = this.members[this.members.length - 1];
            e && this.promote(e);
        }
    }

    relegate(e) {
        const t = this.members.findIndex((t) => e === t);
        if (t === 0) return !1;
        let n;
        for (let e = t; e >= 0; e--) {
            const t = this.members[e];
            if (t.isPresent !== !1) {
                n = t;
                break;
            }
        }
        return n ? (this.promote(n), !0) : !1;
    }

    promote(e, t) {
        const n = this.lead;
        if (e !== n && ((this.prevLead = n), (this.lead = e), e.show(), n)) {
            (n.instance && n.scheduleRender(),
                e.scheduleRender(),
                (e.resumeFrom = n),
                t && (e.resumeFrom.preserveOpacity = !0),
                n.snapshot &&
                    ((e.snapshot = n.snapshot), (e.snapshot.latestValues = n.animationValues || n.latestValues)),
                e.root && e.root.isUpdating && (e.isLayoutDirty = !0));
            const { crossfade: r } = e.options;
            r === !1 && n.hide();
        }
    }

    exitAnimationComplete() {
        this.members.forEach((e) => {
            const { options: t, resumingFrom: n } = e;
            (t.onExitComplete && t.onExitComplete(), n && n.options.onExitComplete && n.options.onExitComplete());
        });
    }

    scheduleRender() {
        this.members.forEach((e) => {
            e.instance && e.scheduleRender(!1);
        });
    }

    removeLeadSnapshot() {
        this.lead && this.lead.snapshot && (this.lead.snapshot = void 0);
    }
};
function pl(e, t, n) {
    let r = ``;
    const i = e.x.translate / t.x;
    const a = e.y.translate / t.y;
    const o = n?.z || 0;
    if (
        ((i || a || o) && (r = `translate3d(${i}px, ${a}px, ${o}px) `),
        (t.x !== 1 || t.y !== 1) && (r += `scale(${1 / t.x}, ${1 / t.y}) `),
        n)
    ) {
        const { transformPerspective: e, rotate: t, rotateX: i, rotateY: a, skewX: o, skewY: s } = n;
        (e && (r = `perspective(${e}px) ${r}`),
            t && (r += `rotate(${t}deg) `),
            i && (r += `rotateX(${i}deg) `),
            a && (r += `rotateY(${a}deg) `),
            o && (r += `skewX(${o}deg) `),
            s && (r += `skewY(${s}deg) `));
    }
    const s = e.x.scale * t.x;
    const c = e.y.scale * t.y;
    return ((s !== 1 || c !== 1) && (r += `scale(${s}, ${c})`), r || `none`);
}
const ml = { nodes: 0, calculatedTargetDeltas: 0, calculatedProjections: 0 };
const hl = [``, `X`, `Y`, `Z`];
const gl = 1e3;
let _l = 0;
function vl(e, t, n, r) {
    const { latestValues: i } = t;
    i[e] && ((n[e] = i[e]), t.setStaticValue(e, 0), r && (r[e] = 0));
}
function yl(e) {
    if (((e.hasCheckedOptimisedAppear = !0), e.root === e)) return;
    const { visualElement: t } = e.options;
    if (!t) return;
    const n = ss(t);
    if (window.MotionHasOptimisedAnimation(n, `transform`)) {
        const { layout: t, layoutId: r } = e.options;
        window.MotionCancelOptimisedAnimation(n, `transform`, k, !(t || r));
    }
    const { parent: r } = e;
    r && !r.hasCheckedOptimisedAppear && yl(r);
}
function bl({ attachResizeListener: e, defaultParent: t, measureScroll: n, checkIsScrollRoot: r, resetTransform: i }) {
    return class {
        constructor(e = {}, n = t?.()) {
            ((this.id = _l++),
                (this.animationId = 0),
                (this.animationCommitId = 0),
                (this.children = new Set()),
                (this.options = {}),
                (this.isTreeAnimating = !1),
                (this.isAnimationBlocked = !1),
                (this.isLayoutDirty = !1),
                (this.isProjectionDirty = !1),
                (this.isSharedProjectionDirty = !1),
                (this.isTransformDirty = !1),
                (this.updateManuallyBlocked = !1),
                (this.updateBlockedByResize = !1),
                (this.isUpdating = !1),
                (this.isSVG = !1),
                (this.needsReset = !1),
                (this.shouldResetTransform = !1),
                (this.hasCheckedOptimisedAppear = !1),
                (this.treeScale = { x: 1, y: 1 }),
                (this.eventHandlers = new Map()),
                (this.hasTreeAnimated = !1),
                (this.updateScheduled = !1),
                (this.scheduleUpdate = () => this.update()),
                (this.projectionUpdateScheduled = !1),
                (this.checkUpdateFailed = () => {
                    this.isUpdating && ((this.isUpdating = !1), this.clearAllSnapshots());
                }),
                (this.updateProjection = () => {
                    ((this.projectionUpdateScheduled = !1),
                        Re.value && (ml.nodes = ml.calculatedTargetDeltas = ml.calculatedProjections = 0),
                        this.nodes.forEach(Cl),
                        this.nodes.forEach(Al),
                        this.nodes.forEach(jl),
                        this.nodes.forEach(wl),
                        Re.addProjectionMetrics && Re.addProjectionMetrics(ml));
                }),
                (this.resolvedRelativeTargetAt = 0),
                (this.hasProjected = !1),
                (this.isVisible = !0),
                (this.animationProgress = 0),
                (this.sharedNodes = new Map()),
                (this.latestValues = e),
                (this.root = n ? n.root || n : this),
                (this.path = n ? [...n.path, n] : []),
                (this.parent = n),
                (this.depth = n ? n.depth + 1 : 0));
            for (let e = 0; e < this.path.length; e++) this.path[e].shouldResetTransform = !0;
            this.root === this && (this.nodes = new zc());
        }

        addEventListener(e, t) {
            return (this.eventHandlers.has(e) || this.eventHandlers.set(e, new pe()), this.eventHandlers.get(e).add(t));
        }

        notifyListeners(e, ...t) {
            const n = this.eventHandlers.get(e);
            n && n.notify(...t);
        }

        hasListeners(e) {
            return this.eventHandlers.has(e);
        }

        mount(t) {
            if (this.instance) return;
            ((this.isSVG = wi(t) && !Ri(t)), (this.instance = t));
            const { layoutId: n, layout: r, visualElement: i } = this.options;
            if (
                (i && !i.current && i.mount(t),
                this.root.nodes.add(this),
                this.parent && this.parent.children.add(this),
                this.root.hasTreeAnimated && (r || n) && (this.isLayoutDirty = !0),
                e)
            ) {
                let n;
                let r = 0;
                const i = () => (this.root.updateBlockedByResize = !1);
                (k.read(() => {
                    r = window.innerWidth;
                }),
                    e(t, () => {
                        const e = window.innerWidth;
                        e !== r &&
                            ((r = e),
                            (this.root.updateBlockedByResize = !0),
                            n && n(),
                            (n = Bc(i, 250)),
                            Ac.hasAnimatedSinceResize && ((Ac.hasAnimatedSinceResize = !1), this.nodes.forEach(kl)));
                    }));
            }
            (n && this.root.registerSharedNode(n, this),
                this.options.animate !== !1 &&
                    i &&
                    (n || r) &&
                    this.addEventListener(
                        `didUpdate`,
                        ({ delta: e, hasLayoutChanged: t, hasRelativeLayoutChanged: n, layout: r }) => {
                            if (this.isTreeAnimationBlocked()) {
                                ((this.target = void 0), (this.relativeTarget = void 0));
                                return;
                            }
                            const a = this.options.transition || i.getDefaultTransition() || Rl;
                            const { onLayoutAnimationStart: o, onLayoutAnimationComplete: s } = i.getProps();
                            const c = !this.targetLayout || !ll(this.targetLayout, r);
                            const l = !t && n;
                            if (
                                this.options.layoutRoot ||
                                this.resumeFrom ||
                                l ||
                                (t && (c || !this.currentAnimation))
                            ) {
                                this.resumeFrom &&
                                    ((this.resumingFrom = this.resumeFrom), (this.resumingFrom.resumingFrom = void 0));
                                const t = { ...Nr(a, `layout`), onPlay: o, onComplete: s };
                                ((i.shouldReduceMotion || this.options.layoutRoot) && ((t.delay = 0), (t.type = !1)),
                                    this.startAnimation(t),
                                    this.setAnimationOrigin(e, l));
                            } else {
                                (t || kl(this),
                                    this.isLead() && this.options.onExitComplete && this.options.onExitComplete());
                            }
                            this.targetLayout = r;
                        }
                    ));
        }

        unmount() {
            (this.options.layoutId && this.willUpdate(), this.root.nodes.remove(this));
            const e = this.getStack();
            (e && e.remove(this),
                this.parent && this.parent.children.delete(this),
                (this.instance = void 0),
                this.eventHandlers.clear(),
                He(this.updateProjection));
        }

        blockUpdate() {
            this.updateManuallyBlocked = !0;
        }

        unblockUpdate() {
            this.updateManuallyBlocked = !1;
        }

        isUpdateBlocked() {
            return this.updateManuallyBlocked || this.updateBlockedByResize;
        }

        isTreeAnimationBlocked() {
            return this.isAnimationBlocked || (this.parent && this.parent.isTreeAnimationBlocked()) || !1;
        }

        startUpdate() {
            this.isUpdateBlocked() ||
                ((this.isUpdating = !0), this.nodes && this.nodes.forEach(Ml), this.animationId++);
        }

        getTransformTemplate() {
            const { visualElement: e } = this.options;
            return e && e.getProps().transformTemplate;
        }

        willUpdate(e = !0) {
            if (((this.root.hasTreeAnimated = !0), this.root.isUpdateBlocked())) {
                this.options.onExitComplete && this.options.onExitComplete();
                return;
            }
            if (
                (window.MotionCancelOptimisedAnimation && !this.hasCheckedOptimisedAppear && yl(this),
                !this.root.isUpdating && this.root.startUpdate(),
                this.isLayoutDirty)
            ) {
                return;
            }
            this.isLayoutDirty = !0;
            for (let e = 0; e < this.path.length; e++) {
                const t = this.path[e];
                ((t.shouldResetTransform = !0), t.updateScroll(`snapshot`), t.options.layoutRoot && t.willUpdate(!1));
            }
            const { layoutId: t, layout: n } = this.options;
            if (t === void 0 && !n) return;
            const r = this.getTransformTemplate();
            ((this.prevTransformTemplateValue = r ? r(this.latestValues, ``) : void 0),
                this.updateSnapshot(),
                e && this.notifyListeners(`willUpdate`));
        }

        update() {
            if (((this.updateScheduled = !1), this.isUpdateBlocked())) {
                (this.unblockUpdate(), this.clearAllSnapshots(), this.nodes.forEach(El));
                return;
            }
            if (this.animationId <= this.animationCommitId) {
                this.nodes.forEach(Dl);
                return;
            }
            ((this.animationCommitId = this.animationId),
                this.isUpdating
                    ? ((this.isUpdating = !1), this.nodes.forEach(Ol), this.nodes.forEach(xl), this.nodes.forEach(Sl))
                    : this.nodes.forEach(Dl),
                this.clearAllSnapshots());
            const e = qe.now();
            ((Ue.delta = ae(0, 1e3 / 60, e - Ue.timestamp)),
                (Ue.timestamp = e),
                (Ue.isProcessing = !0),
                We.update.process(Ue),
                We.preRender.process(Ue),
                We.render.process(Ue),
                (Ue.isProcessing = !1));
        }

        didUpdate() {
            this.updateScheduled || ((this.updateScheduled = !0), oi.read(this.scheduleUpdate));
        }

        clearAllSnapshots() {
            (this.nodes.forEach(Tl), this.sharedNodes.forEach(Nl));
        }

        scheduleUpdateProjection() {
            this.projectionUpdateScheduled ||
                ((this.projectionUpdateScheduled = !0), k.preRender(this.updateProjection, !1, !0));
        }

        scheduleCheckAfterUnmount() {
            k.postRender(() => {
                this.isLayoutDirty ? this.root.didUpdate() : this.root.checkUpdateFailed();
            });
        }

        updateSnapshot() {
            this.snapshot ||
                !this.instance ||
                ((this.snapshot = this.measure()),
                this.snapshot &&
                    !qs(this.snapshot.measuredBox.x) &&
                    !qs(this.snapshot.measuredBox.y) &&
                    (this.snapshot = void 0));
        }

        updateLayout() {
            if (
                !this.instance ||
                (this.updateScroll(), !(this.options.alwaysMeasureLayout && this.isLead()) && !this.isLayoutDirty)
            ) {
                return;
            }
            if (this.resumeFrom && !this.resumeFrom.instance) {
                for (let e = 0; e < this.path.length; e++) this.path[e].updateScroll();
            }
            const e = this.layout;
            ((this.layout = this.measure(!1)),
                (this.layoutCorrected = Ro()),
                (this.isLayoutDirty = !1),
                (this.projectionDelta = void 0),
                this.notifyListeners(`measure`, this.layout.layoutBox));
            const { visualElement: t } = this.options;
            t && t.notify(`LayoutMeasure`, this.layout.layoutBox, e ? e.layoutBox : void 0);
        }

        updateScroll(e = `measure`) {
            let t = !!(this.options.layoutScroll && this.instance);
            if (
                (this.scroll &&
                    this.scroll.animationId === this.root.animationId &&
                    this.scroll.phase === e &&
                    (t = !1),
                t && this.instance)
            ) {
                const t = r(this.instance);
                this.scroll = {
                    animationId: this.root.animationId,
                    phase: e,
                    isRoot: t,
                    offset: n(this.instance),
                    wasRoot: this.scroll ? this.scroll.isRoot : t
                };
            }
        }

        resetTransform() {
            if (!i) return;
            const e = this.isLayoutDirty || this.shouldResetTransform || this.options.alwaysMeasureLayout;
            const t = this.projectionDelta && !ol(this.projectionDelta);
            const n = this.getTransformTemplate();
            const r = n ? n(this.latestValues, ``) : void 0;
            const a = r !== this.prevTransformTemplateValue;
            e &&
                this.instance &&
                (t || xo(this.latestValues) || a) &&
                (i(this.instance, r), (this.shouldResetTransform = !1), this.scheduleRender());
        }

        measure(e = !0) {
            const t = this.measurePageBox();
            let n = this.removeElementScroll(t);
            return (
                e && (n = this.removeTransform(n)),
                q(n),
                { animationId: this.root.animationId, measuredBox: t, layoutBox: n, latestValues: {}, source: this.id }
            );
        }

        measurePageBox() {
            const { visualElement: e } = this.options;
            if (!e) return Ro();
            const t = e.measureViewportBox();
            if (!(this.scroll?.wasRoot || this.path.some(Y))) {
                const { scroll: e } = this.root;
                e && (Ao(t.x, e.offset.x), Ao(t.y, e.offset.y));
            }
            return t;
        }

        removeElementScroll(e) {
            const t = Ro();
            if ((Zc(t, e), this.scroll?.wasRoot)) return t;
            for (let n = 0; n < this.path.length; n++) {
                const r = this.path[n];
                const { scroll: i, options: a } = r;
                r !== this.root &&
                    i &&
                    a.layoutScroll &&
                    (i.wasRoot && Zc(t, e), Ao(t.x, i.offset.x), Ao(t.y, i.offset.y));
            }
            return t;
        }

        applyTransform(e, t = !1) {
            const n = Ro();
            Zc(n, e);
            for (let e = 0; e < this.path.length; e++) {
                const r = this.path[e];
                (!t &&
                    r.options.layoutScroll &&
                    r.scroll &&
                    r !== r.root &&
                    Mo(n, { x: -r.scroll.offset.x, y: -r.scroll.offset.y }),
                    xo(r.latestValues) && Mo(n, r.latestValues));
            }
            return (xo(this.latestValues) && Mo(n, this.latestValues), n);
        }

        removeTransform(e) {
            const t = Ro();
            Zc(t, e);
            for (let e = 0; e < this.path.length; e++) {
                const n = this.path[e];
                if (!n.instance || !xo(n.latestValues)) continue;
                bo(n.latestValues) && n.updateSnapshot();
                const r = Ro();
                (Zc(r, n.measurePageBox()), il(t, n.latestValues, n.snapshot ? n.snapshot.layoutBox : void 0, r));
            }
            return (xo(this.latestValues) && il(t, this.latestValues), t);
        }

        setTargetDelta(e) {
            ((this.targetDelta = e), this.root.scheduleUpdateProjection(), (this.isProjectionDirty = !0));
        }

        setOptions(e) {
            this.options = { ...this.options, ...e, crossfade: e.crossfade === void 0 ? !0 : e.crossfade };
        }

        clearMeasurements() {
            ((this.scroll = void 0),
                (this.layout = void 0),
                (this.snapshot = void 0),
                (this.prevTransformTemplateValue = void 0),
                (this.targetDelta = void 0),
                (this.target = void 0),
                (this.isLayoutDirty = !1));
        }

        forceRelativeParentToResolveTarget() {
            this.relativeParent &&
                this.relativeParent.resolvedRelativeTargetAt !== Ue.timestamp &&
                this.relativeParent.resolveTargetDelta(!0);
        }

        resolveTargetDelta(e = !1) {
            const t = this.getLead();
            ((this.isProjectionDirty ||= t.isProjectionDirty),
                (this.isTransformDirty ||= t.isTransformDirty),
                (this.isSharedProjectionDirty ||= t.isSharedProjectionDirty));
            const n = !!this.resumingFrom || this !== t;
            if (!(
                e ||
                (n && this.isSharedProjectionDirty) ||
                this.isProjectionDirty ||
                this.parent?.isProjectionDirty ||
                this.attemptToResolveRelativeTarget ||
                this.root.updateBlockedByResize
            )) {
                return;
            }
            const { layout: r, layoutId: i } = this.options;
            if (!(!this.layout || !(r || i))) {
                if (((this.resolvedRelativeTargetAt = Ue.timestamp), !this.targetDelta && !this.relativeTarget)) {
                    const e = this.getClosestProjectingParent();
                    e && e.layout && this.animationProgress !== 1
                        ? ((this.relativeParent = e),
                          this.forceRelativeParentToResolveTarget(),
                          (this.relativeTarget = Ro()),
                          (this.relativeTargetOrigin = Ro()),
                          ec(this.relativeTargetOrigin, this.layout.layoutBox, e.layout.layoutBox),
                          Zc(this.relativeTarget, this.relativeTargetOrigin))
                        : (this.relativeParent = this.relativeTarget = void 0);
                }
                if (!(!this.relativeTarget && !this.targetDelta)) {
                    if (
                        (this.target || ((this.target = Ro()), (this.targetWithTransforms = Ro())),
                        this.relativeTarget &&
                        this.relativeTargetOrigin &&
                        this.relativeParent &&
                        this.relativeParent.target
                            ? (this.forceRelativeParentToResolveTarget(),
                              Qs(this.target, this.relativeTarget, this.relativeParent.target))
                            : this.targetDelta
                              ? (this.resumingFrom
                                    ? (this.target = this.applyTransform(this.layout.layoutBox))
                                    : Zc(this.target, this.layout.layoutBox),
                                Eo(this.target, this.targetDelta))
                              : Zc(this.target, this.layout.layoutBox),
                        this.attemptToResolveRelativeTarget)
                    ) {
                        this.attemptToResolveRelativeTarget = !1;
                        const e = this.getClosestProjectingParent();
                        e &&
                        !!e.resumingFrom == !!this.resumingFrom &&
                        !e.options.layoutScroll &&
                        e.target &&
                        this.animationProgress !== 1
                            ? ((this.relativeParent = e),
                              this.forceRelativeParentToResolveTarget(),
                              (this.relativeTarget = Ro()),
                              (this.relativeTargetOrigin = Ro()),
                              ec(this.relativeTargetOrigin, this.target, e.target),
                              Zc(this.relativeTarget, this.relativeTargetOrigin))
                            : (this.relativeParent = this.relativeTarget = void 0);
                    }
                    Re.value && ml.calculatedTargetDeltas++;
                }
            }
        }

        getClosestProjectingParent() {
            if (!(!this.parent || bo(this.parent.latestValues) || H(this.parent.latestValues))) {
                return this.parent.isProjecting() ? this.parent : this.parent.getClosestProjectingParent();
            }
        }

        isProjecting() {
            return !!((this.relativeTarget || this.targetDelta || this.options.layoutRoot) && this.layout);
        }

        calcProjection() {
            const e = this.getLead();
            const t = !!this.resumingFrom || this !== e;
            let n = !0;
            if (
                ((this.isProjectionDirty || this.parent?.isProjectionDirty) && (n = !1),
                t && (this.isSharedProjectionDirty || this.isTransformDirty) && (n = !1),
                this.resolvedRelativeTargetAt === Ue.timestamp && (n = !1),
                n)
            ) {
                return;
            }
            const { layout: r, layoutId: i } = this.options;
            if (
                ((this.isTreeAnimating = !!(
                    (this.parent && this.parent.isTreeAnimating) ||
                    this.currentAnimation ||
                    this.pendingAnimation
                )),
                this.isTreeAnimating || (this.targetDelta = this.relativeTarget = void 0),
                !this.layout || !(r || i))
            ) {
                return;
            }
            Zc(this.layoutCorrected, this.layout.layoutBox);
            const a = this.treeScale.x;
            const o = this.treeScale.y;
            (ko(this.layoutCorrected, this.treeScale, this.path, t),
                e.layout &&
                    !e.target &&
                    (this.treeScale.x !== 1 || this.treeScale.y !== 1) &&
                    ((e.target = e.layout.layoutBox), (e.targetWithTransforms = Ro())));
            const { target: s } = e;
            if (!s) {
                this.prevProjectionDelta && (this.createProjectionDeltas(), this.scheduleRender());
                return;
            }
            (!this.projectionDelta || !this.prevProjectionDelta
                ? this.createProjectionDeltas()
                : (Qc(this.prevProjectionDelta.x, this.projectionDelta.x),
                  Qc(this.prevProjectionDelta.y, this.projectionDelta.y)),
                Xs(this.projectionDelta, this.layoutCorrected, s, this.latestValues),
                (this.treeScale.x !== a ||
                    this.treeScale.y !== o ||
                    !dl(this.projectionDelta.x, this.prevProjectionDelta.x) ||
                    !dl(this.projectionDelta.y, this.prevProjectionDelta.y)) &&
                    ((this.hasProjected = !0), this.scheduleRender(), this.notifyListeners(`projectionUpdate`, s)),
                Re.value && ml.calculatedProjections++);
        }

        hide() {
            this.isVisible = !1;
        }

        show() {
            this.isVisible = !0;
        }

        scheduleRender(e = !0) {
            if ((this.options.visualElement?.scheduleRender(), e)) {
                const e = this.getStack();
                e && e.scheduleRender();
            }
            this.resumingFrom && !this.resumingFrom.instance && (this.resumingFrom = void 0);
        }

        createProjectionDeltas() {
            ((this.prevProjectionDelta = Io()),
                (this.projectionDelta = Io()),
                (this.projectionDeltaWithTransform = Io()));
        }

        setAnimationOrigin(e, t = !1) {
            const n = this.snapshot;
            const r = n ? n.latestValues : {};
            const i = { ...this.latestValues };
            const a = Io();
            ((!this.relativeParent || !this.relativeParent.options.layoutRoot) &&
                (this.relativeTarget = this.relativeTargetOrigin = void 0),
                (this.attemptToResolveRelativeTarget = !t));
            const o = Ro();
            const s = (n ? n.source : void 0) !== (this.layout ? this.layout.source : void 0);
            const c = this.getStack();
            const l = !c || c.members.length <= 1;
            const u = !!(s && !l && this.options.crossfade === !0 && !this.path.some(Ll));
            this.animationProgress = 0;
            let d;
            ((this.mixTargetDelta = (t) => {
                const n = t / 1e3;
                (Pl(a.x, e.x, n),
                    Pl(a.y, e.y, n),
                    this.setTargetDelta(a),
                    this.relativeTarget &&
                        this.relativeTargetOrigin &&
                        this.layout &&
                        this.relativeParent &&
                        this.relativeParent.layout &&
                        (ec(o, this.layout.layoutBox, this.relativeParent.layout.layoutBox),
                        Il(this.relativeTarget, this.relativeTargetOrigin, o, n),
                        d && cl(this.relativeTarget, d) && (this.isProjectionDirty = !1),
                        (d ||= Ro()),
                        Zc(d, this.relativeTarget)),
                    s && ((this.animationValues = i), Gc(i, r, this.latestValues, n, u, l)),
                    this.root.scheduleUpdateProjection(),
                    this.scheduleRender(),
                    (this.animationProgress = n));
            }),
                this.mixTargetDelta(this.options.layoutRoot ? 1e3 : 0));
        }

        startAnimation(e) {
            (this.notifyListeners(`animationStart`),
                this.currentAnimation?.stop(),
                this.resumingFrom?.currentAnimation?.stop(),
                (this.pendingAnimation &&= (He(this.pendingAnimation), void 0)),
                (this.pendingAnimation = k.update(() => {
                    ((Ac.hasAnimatedSinceResize = !0),
                        Je.layout++,
                        (this.motionValue ||= ai(0)),
                        (this.currentAnimation = Rc(this.motionValue, [0, 1e3], {
                            ...e,
                            velocity: 0,
                            isSync: !0,
                            onUpdate: (t) => {
                                (this.mixTargetDelta(t), e.onUpdate && e.onUpdate(t));
                            },
                            onStop: () => {
                                Je.layout--;
                            },
                            onComplete: () => {
                                (Je.layout--, e.onComplete && e.onComplete(), this.completeAnimation());
                            }
                        })),
                        this.resumingFrom && (this.resumingFrom.currentAnimation = this.currentAnimation),
                        (this.pendingAnimation = void 0));
                })));
        }

        completeAnimation() {
            this.resumingFrom &&
                ((this.resumingFrom.currentAnimation = void 0), (this.resumingFrom.preserveOpacity = void 0));
            const e = this.getStack();
            (e && e.exitAnimationComplete(),
                (this.resumingFrom = this.currentAnimation = this.animationValues = void 0),
                this.notifyListeners(`animationComplete`));
        }

        finishAnimation() {
            (this.currentAnimation && (this.mixTargetDelta && this.mixTargetDelta(gl), this.currentAnimation.stop()),
                this.completeAnimation());
        }

        applyTransformsToTarget() {
            const e = this.getLead();
            let { targetWithTransforms: t, target: n, layout: r, latestValues: i } = e;
            if (!(!t || !n || !r)) {
                if (
                    this !== e &&
                    this.layout &&
                    r &&
                    J(this.options.animationType, this.layout.layoutBox, r.layoutBox)
                ) {
                    n = this.target || Ro();
                    const t = qs(this.layout.layoutBox.x);
                    ((n.x.min = e.target.x.min), (n.x.max = n.x.min + t));
                    const r = qs(this.layout.layoutBox.y);
                    ((n.y.min = e.target.y.min), (n.y.max = n.y.min + r));
                }
                (Zc(t, n), Mo(t, i), Xs(this.projectionDeltaWithTransform, this.layoutCorrected, t, i));
            }
        }

        registerSharedNode(e, t) {
            (this.sharedNodes.has(e) || this.sharedNodes.set(e, new fl()), this.sharedNodes.get(e).add(t));
            const n = t.options.initialPromotionConfig;
            t.promote({
                transition: n ? n.transition : void 0,
                preserveFollowOpacity: n && n.shouldPreserveFollowOpacity ? n.shouldPreserveFollowOpacity(t) : void 0
            });
        }

        isLead() {
            const e = this.getStack();
            return e ? e.lead === this : !0;
        }

        getLead() {
            const { layoutId: e } = this.options;
            return (e && this.getStack()?.lead) || this;
        }

        getPrevLead() {
            const { layoutId: e } = this.options;
            return e ? this.getStack()?.prevLead : void 0;
        }

        getStack() {
            const { layoutId: e } = this.options;
            if (e) return this.root.sharedNodes.get(e);
        }

        promote({ needsReset: e, transition: t, preserveFollowOpacity: n } = {}) {
            const r = this.getStack();
            (r && r.promote(this, n),
                e && ((this.projectionDelta = void 0), (this.needsReset = !0)),
                t && this.setOptions({ transition: t }));
        }

        relegate() {
            const e = this.getStack();
            return e ? e.relegate(this) : !1;
        }

        resetSkewAndRotation() {
            const { visualElement: e } = this.options;
            if (!e) return;
            let t = !1;
            const { latestValues: n } = e;
            if (((n.z || n.rotate || n.rotateX || n.rotateY || n.rotateZ || n.skewX || n.skewY) && (t = !0), !t)) {
                return;
            }
            const r = {};
            n.z && vl(`z`, e, r, this.animationValues);
            for (let t = 0; t < hl.length; t++) {
                (vl(`rotate${hl[t]}`, e, r, this.animationValues), vl(`skew${hl[t]}`, e, r, this.animationValues));
            }
            e.render();
            for (const t in r) (e.setStaticValue(t, r[t]), this.animationValues && (this.animationValues[t] = r[t]));
            e.scheduleRender();
        }

        applyProjectionStyles(e, t) {
            if (!this.instance || this.isSVG) return;
            if (!this.isVisible) {
                e.visibility = `hidden`;
                return;
            }
            const n = this.getTransformTemplate();
            if (this.needsReset) {
                ((this.needsReset = !1),
                    (e.visibility = ``),
                    (e.opacity = ``),
                    (e.pointerEvents = Ya(t?.pointerEvents) || ``),
                    (e.transform = n ? n(this.latestValues, ``) : `none`));
                return;
            }
            const r = this.getLead();
            if (!this.projectionDelta || !this.layout || !r.target) {
                (this.options.layoutId &&
                    ((e.opacity = this.latestValues.opacity === void 0 ? 1 : this.latestValues.opacity),
                    (e.pointerEvents = Ya(t?.pointerEvents) || ``)),
                    this.hasProjected &&
                        !xo(this.latestValues) &&
                        ((e.transform = n ? n({}, ``) : `none`), (this.hasProjected = !1)));
                return;
            }
            e.visibility = ``;
            const i = r.animationValues || r.latestValues;
            this.applyTransformsToTarget();
            let a = pl(this.projectionDeltaWithTransform, this.treeScale, i);
            (n && (a = n(i, a)), (e.transform = a));
            const { x: o, y: s } = this.projectionDelta;
            ((e.transformOrigin = `${o.origin * 100}% ${s.origin * 100}% 0`),
                r.animationValues
                    ? (e.opacity =
                          r === this
                              ? (i.opacity ?? this.latestValues.opacity ?? 1)
                              : this.preserveOpacity
                                ? this.latestValues.opacity
                                : i.opacityExit)
                    : (e.opacity =
                          r === this
                              ? i.opacity === void 0
                                  ? ``
                                  : i.opacity
                              : i.opacityExit === void 0
                                ? 0
                                : i.opacityExit));
            for (const t in Ta) {
                if (i[t] === void 0) continue;
                const { correct: n, applyTo: o, isCSSVariable: s } = Ta[t];
                const c = a === `none` ? i[t] : n(i[t], r);
                if (o) {
                    const t = o.length;
                    for (let n = 0; n < t; n++) e[o[n]] = c;
                } else s ? (this.options.visualElement.renderState.vars[t] = c) : (e[t] = c);
            }
            this.options.layoutId && (e.pointerEvents = r === this ? Ya(t?.pointerEvents) || `` : `none`);
        }

        clearSnapshot() {
            this.resumeFrom = this.snapshot = void 0;
        }

        resetTree() {
            (this.root.nodes.forEach((e) => e.currentAnimation?.stop()),
                this.root.nodes.forEach(El),
                this.root.sharedNodes.clear());
        }
    };
}
function xl(e) {
    e.updateLayout();
}
function Sl(e) {
    const t = e.resumeFrom?.snapshot || e.snapshot;
    if (e.isLead() && e.layout && t && e.hasListeners(`didUpdate`)) {
        const { layoutBox: n, measuredBox: r } = e.layout;
        const { animationType: i } = e.options;
        const a = t.source !== e.layout.source;
        i === `size`
            ? tc((e) => {
                  const r = a ? t.measuredBox[e] : t.layoutBox[e];
                  const i = qs(r);
                  ((r.min = n[e].min), (r.max = r.min + i));
              })
            : J(i, t.layoutBox, n) &&
              tc((r) => {
                  const i = a ? t.measuredBox[r] : t.layoutBox[r];
                  const o = qs(n[r]);
                  ((i.max = i.min + o),
                      e.relativeTarget &&
                          !e.currentAnimation &&
                          ((e.isProjectionDirty = !0), (e.relativeTarget[r].max = e.relativeTarget[r].min + o)));
              });
        const o = Io();
        Xs(o, n, t.layoutBox);
        const s = Io();
        a ? Xs(s, e.applyTransform(r, !0), t.measuredBox) : Xs(s, n, t.layoutBox);
        const c = !ol(o);
        let l = !1;
        if (!e.resumeFrom) {
            const r = e.getClosestProjectingParent();
            if (r && !r.resumeFrom) {
                const { snapshot: i, layout: a } = r;
                if (i && a) {
                    const o = Ro();
                    ec(o, t.layoutBox, i.layoutBox);
                    const s = Ro();
                    (ec(s, n, a.layoutBox),
                        ll(o, s) || (l = !0),
                        r.options.layoutRoot &&
                            ((e.relativeTarget = s), (e.relativeTargetOrigin = o), (e.relativeParent = r)));
                }
            }
        }
        e.notifyListeners(`didUpdate`, {
            layout: n,
            snapshot: t,
            delta: s,
            layoutDelta: o,
            hasLayoutChanged: c,
            hasRelativeLayoutChanged: l
        });
    } else if (e.isLead()) {
        const { onExitComplete: t } = e.options;
        t && t();
    }
    e.options.transition = void 0;
}
function Cl(e) {
    (Re.value && ml.nodes++,
        e.parent &&
            (e.isProjecting() || (e.isProjectionDirty = e.parent.isProjectionDirty),
            (e.isSharedProjectionDirty ||= !!(
                e.isProjectionDirty ||
                e.parent.isProjectionDirty ||
                e.parent.isSharedProjectionDirty
            )),
            (e.isTransformDirty ||= e.parent.isTransformDirty)));
}
function wl(e) {
    e.isProjectionDirty = e.isSharedProjectionDirty = e.isTransformDirty = !1;
}
function Tl(e) {
    e.clearSnapshot();
}
function El(e) {
    e.clearMeasurements();
}
function Dl(e) {
    e.isLayoutDirty = !1;
}
function Ol(e) {
    const { visualElement: t } = e.options;
    (t && t.getProps().onBeforeLayoutMeasure && t.notify(`BeforeLayoutMeasure`), e.resetTransform());
}
function kl(e) {
    (e.finishAnimation(), (e.targetDelta = e.relativeTarget = e.target = void 0), (e.isProjectionDirty = !0));
}
function Al(e) {
    e.resolveTargetDelta();
}
function jl(e) {
    e.calcProjection();
}
function Ml(e) {
    e.resetSkewAndRotation();
}
function Nl(e) {
    e.removeLeadSnapshot();
}
function Pl(e, t, n) {
    ((e.translate = P(t.translate, 0, n)),
        (e.scale = P(t.scale, 1, n)),
        (e.origin = t.origin),
        (e.originPoint = t.originPoint));
}
function Fl(e, t, n, r) {
    ((e.min = P(t.min, n.min, r)), (e.max = P(t.max, n.max, r)));
}
function Il(e, t, n, r) {
    (Fl(e.x, t.x, n.x, r), Fl(e.y, t.y, n.y, r));
}
function Ll(e) {
    return e.animationValues && e.animationValues.opacityExit !== void 0;
}
var Rl = { duration: 0.45, ease: [0.4, 0, 0.1, 1] };
const zl = (e) => typeof navigator < `u` && navigator.userAgent && navigator.userAgent.toLowerCase().includes(e);
const G = zl(`applewebkit/`) && !zl(`chrome/`) ? Math.round : T;
function K(e) {
    ((e.min = G(e.min)), (e.max = G(e.max)));
}
function q(e) {
    (K(e.x), K(e.y));
}
function J(e, t, n) {
    return e === `position` || (e === `preserve-aspect` && !Js(ul(t), ul(n), 0.2));
}
function Y(e) {
    return e !== e.root && e.scroll?.wasRoot;
}
const Bl = bl({
    attachResizeListener: (e, t) => Ls(e, `resize`, t),
    measureScroll: () => ({
        x: document.documentElement.scrollLeft || document.body.scrollLeft,
        y: document.documentElement.scrollTop || document.body.scrollTop
    }),
    checkIsScrollRoot: () => !0
});
const Vl = { current: void 0 };
const Hl = bl({
    measureScroll: (e) => ({ x: e.scrollLeft, y: e.scrollTop }),
    defaultParent: () => {
        if (!Vl.current) {
            const e = new Bl({});
            (e.mount(window), e.setOptions({ layoutScroll: !0 }), (Vl.current = e));
        }
        return Vl.current;
    },
    resetTransform: (e, t) => {
        e.style.transform = t === void 0 ? `none` : t;
    },
    checkIsScrollRoot: (e) => window.getComputedStyle(e).position === `fixed`
});
const Ul = { pan: { Feature: kc }, drag: { Feature: Dc, ProjectionNode: Hl, MeasureLayout: Ic } };
function Wl(e, t, n) {
    const { props: r } = e;
    e.animationState && r.whileHover && e.animationState.setActive(`whileHover`, n === `Start`);
    const i = r[`onHover` + n];
    i && k.postRender(() => i(t, Rs(t)));
}
const Gl = class extends Ns {
    mount() {
        const { current: e } = this.node;
        e && (this.unmount = pi(e, (e, t) => (Wl(this.node, t, `Start`), (e) => Wl(this.node, e, `End`))));
    }

    unmount() {}
};
const Kl = class extends Ns {
    constructor() {
        (super(...arguments), (this.isActive = !1));
    }

    onFocus() {
        let e = !1;
        try {
            e = this.node.current.matches(`:focus-visible`);
        } catch {
            e = !0;
        }
        !e || !this.node.animationState || (this.node.animationState.setActive(`whileFocus`, !0), (this.isActive = !0));
    }

    onBlur() {
        !this.isActive ||
            !this.node.animationState ||
            (this.node.animationState.setActive(`whileFocus`, !1), (this.isActive = !1));
    }

    mount() {
        this.unmount = de(
            Ls(this.node.current, `focus`, () => this.onFocus()),
            Ls(this.node.current, `blur`, () => this.onBlur())
        );
    }

    unmount() {}
};
function ql(e, t, n) {
    const { props: r } = e;
    if (e.current instanceof HTMLButtonElement && e.current.disabled) return;
    e.animationState && r.whileTap && e.animationState.setActive(`whileTap`, n === `Start`);
    const i = r[`onTap` + (n === `End` ? `` : n)];
    i && k.postRender(() => i(t, Rs(t)));
}
const Jl = class extends Ns {
    mount() {
        const { current: e } = this.node;
        e &&
            (this.unmount = Ci(
                e,
                (e, t) => (ql(this.node, t, `Start`), (e, { success: t }) => ql(this.node, e, t ? `End` : `Cancel`)),
                { useGlobalTarget: this.node.props.globalTapTarget }
            ));
    }

    unmount() {}
};
const Yl = new WeakMap();
const Xl = new WeakMap();
const Zl = (e) => {
    const t = Yl.get(e.target);
    t && t(e);
};
const Ql = (e) => {
    e.forEach(Zl);
};
function $l({ root: e, ...t }) {
    const n = e || document;
    Xl.has(n) || Xl.set(n, {});
    const r = Xl.get(n);
    const i = JSON.stringify(t);
    return (r[i] || (r[i] = new IntersectionObserver(Ql, { root: e, ...t })), r[i]);
}
function eu(e, t, n) {
    const r = $l(t);
    return (
        Yl.set(e, n),
        r.observe(e),
        () => {
            (Yl.delete(e), r.unobserve(e));
        }
    );
}
const tu = { some: 0, all: 1 };
const nu = class extends Ns {
    constructor() {
        (super(...arguments), (this.hasEnteredView = !1), (this.isInView = !1));
    }

    startObserver() {
        this.unmount();
        const { viewport: e = {} } = this.node.getProps();
        const { root: t, margin: n, amount: r = `some`, once: i } = e;
        const a = { root: t ? t.current : void 0, rootMargin: n, threshold: typeof r === `number` ? r : tu[r] };
        return eu(this.node.current, a, (e) => {
            const { isIntersecting: t } = e;
            if (this.isInView === t || ((this.isInView = t), i && !t && this.hasEnteredView)) return;
            (t && (this.hasEnteredView = !0),
                this.node.animationState && this.node.animationState.setActive(`whileInView`, t));
            const { onViewportEnter: n, onViewportLeave: r } = this.node.getProps();
            const a = t ? n : r;
            a && a(e);
        });
    }

    mount() {
        this.startObserver();
    }

    update() {
        if (typeof IntersectionObserver > `u`) return;
        const { props: e, prevProps: t } = this.node;
        [`amount`, `margin`, `root`].some(ru(e, t)) && this.startObserver();
    }

    unmount() {}
};
function ru({ viewport: e = {} }, { viewport: t = {} } = {}) {
    return (n) => e[n] !== t[n];
}
const iu = { inView: { Feature: nu }, tap: { Feature: Jl }, focus: { Feature: Kl }, hover: { Feature: Gl } };
const au = { layout: { ProjectionNode: Hl, MeasureLayout: Ic } };
const X = ho({ ...Is, ...iu, ...Ul, ...au }, $o);
const ou = 50;
const su = () => ({
    current: 0,
    offset: [],
    progress: 0,
    scrollLength: 0,
    targetOffset: 0,
    targetLength: 0,
    containerLength: 0,
    velocity: 0
});
const cu = () => ({ time: 0, x: su(), y: su() });
const lu = { x: { length: `Width`, position: `Left` }, y: { length: `Height`, position: `Top` } };
function uu(e, t, n, r) {
    const i = n[t];
    const { length: a, position: o } = lu[t];
    const s = i.current;
    const c = n.time;
    ((i.current = e[`scroll${o}`]),
        (i.scrollLength = e[`scroll${a}`] - e[`client${a}`]),
        (i.offset.length = 0),
        (i.offset[0] = 0),
        (i.offset[1] = i.scrollLength),
        (i.progress = fe(0, i.scrollLength, i.current)));
    const l = r - c;
    i.velocity = l > ou ? 0 : O(i.current - s, l);
}
function du(e, t, n) {
    (uu(e, `x`, t, n), uu(e, `y`, t, n), (t.time = n));
}
function fu(e, t) {
    const n = { x: 0, y: 0 };
    let r = e;
    for (; r && r !== t;) {
        if (ei(r)) ((n.x += r.offsetLeft), (n.y += r.offsetTop), (r = r.offsetParent));
        else if (r.tagName === `svg`) {
            const e = r.getBoundingClientRect();
            r = r.parentElement;
            const t = r.getBoundingClientRect();
            ((n.x += e.left - t.left), (n.y += e.top - t.top));
        } else if (r instanceof SVGGraphicsElement) {
            const { x: e, y: t } = r.getBBox();
            ((n.x += e), (n.y += t));
            let i = null;
            let a = r.parentNode;
            for (; !i;) (a.tagName === `svg` && (i = a), (a = r.parentNode));
            r = i;
        } else break;
    }
    return n;
}
const pu = { start: 0, center: 0.5, end: 1 };
function mu(e, t, n = 0) {
    let r = 0;
    if ((e in pu && (e = pu[e]), typeof e === `string`)) {
        const t = parseFloat(e);
        e.endsWith(`px`)
            ? (r = t)
            : e.endsWith(`%`)
              ? (e = t / 100)
              : e.endsWith(`vw`)
                ? (r = (t / 100) * document.documentElement.clientWidth)
                : e.endsWith(`vh`)
                  ? (r = (t / 100) * document.documentElement.clientHeight)
                  : (e = t);
    }
    return (typeof e === `number` && (r = t * e), n + r);
}
const hu = [0, 0];
function gu(e, t, n, r) {
    let i = Array.isArray(e) ? e : hu;
    let a = 0;
    let o = 0;
    return (
        typeof e === `number`
            ? (i = [e, e])
            : typeof e === `string` && ((e = e.trim()), (i = e.includes(` `) ? e.split(` `) : [e, pu[e] ? e : `0`])),
        (a = mu(i[0], n, r)),
        (o = mu(i[1], t)),
        a - o
    );
}
const _u = {
    Enter: [
        [0, 1],
        [1, 1]
    ],
    Exit: [
        [0, 0],
        [1, 0]
    ],
    Any: [
        [1, 0],
        [0, 1]
    ],
    All: [
        [0, 0],
        [1, 1]
    ]
};
const vu = { x: 0, y: 0 };
function yu(e) {
    return `getBBox` in e && e.tagName !== `svg` ? e.getBBox() : { width: e.clientWidth, height: e.clientHeight };
}
function bu(e, t, n) {
    const { offset: r = _u.All } = n;
    const { target: i = e, axis: a = `y` } = n;
    const o = a === `y` ? `height` : `width`;
    const s = i === e ? vu : fu(i, e);
    const c = i === e ? { width: e.scrollWidth, height: e.scrollHeight } : yu(i);
    const l = { width: e.clientWidth, height: e.clientHeight };
    t[a].offset.length = 0;
    let u = !t[a].interpolate;
    const d = r.length;
    for (let e = 0; e < d; e++) {
        const n = gu(r[e], l[o], c[o], s[a]);
        (!u && n !== t[a].interpolatorOffsets[e] && (u = !0), (t[a].offset[e] = n));
    }
    (u && ((t[a].interpolate = gn(t[a].offset, vn(r), { clamp: !1 })), (t[a].interpolatorOffsets = [...t[a].offset])),
        (t[a].progress = ae(0, 1, t[a].interpolate(t[a].current))));
}
function xu(e, t = e, n) {
    if (((n.x.targetOffset = 0), (n.y.targetOffset = 0), t !== e)) {
        let r = t;
        for (; r && r !== e;) {
            ((n.x.targetOffset += r.offsetLeft), (n.y.targetOffset += r.offsetTop), (r = r.offsetParent));
        }
    }
    ((n.x.targetLength = t === e ? t.scrollWidth : t.clientWidth),
        (n.y.targetLength = t === e ? t.scrollHeight : t.clientHeight),
        (n.x.containerLength = e.clientWidth),
        (n.y.containerLength = e.clientHeight));
}
function Su(e, t, n, r = {}) {
    return {
        measure: (t) => {
            (xu(e, r.target, n), du(e, n, t), (r.offset || r.target) && bu(e, n, r));
        },
        notify: () => t(n)
    };
}
const Cu = new WeakMap();
const wu = new WeakMap();
const Tu = new WeakMap();
const Eu = (e) => (e === document.scrollingElement ? window : e);
function Du(e, { container: t = document.scrollingElement, ...n } = {}) {
    if (!t) return T;
    let r = Tu.get(t);
    r || ((r = new Set()), Tu.set(t, r));
    const i = Su(t, e, cu(), n);
    if ((r.add(i), !Cu.has(t))) {
        const e = () => {
            for (const e of r) e.measure(Ue.timestamp);
            k.preUpdate(n);
        };
        const n = () => {
            for (const e of r) e.notify();
        };
        const i = () => k.read(e);
        Cu.set(t, i);
        const a = Eu(t);
        (window.addEventListener(`resize`, i, { passive: !0 }),
            t !== document.documentElement && wu.set(t, L(t, i)),
            a.addEventListener(`scroll`, i, { passive: !0 }),
            i());
    }
    const a = Cu.get(t);
    return (
        k.read(a, !1, !0),
        () => {
            He(a);
            const e = Tu.get(t);
            if (!e || (e.delete(i), e.size)) return;
            const n = Cu.get(t);
            (Cu.delete(t),
                n && (Eu(t).removeEventListener(`scroll`, n), wu.get(t)?.(), window.removeEventListener(`resize`, n)));
        }
    );
}
const Ou = new Map();
function ku(e) {
    const t = { value: 0 };
    return {
        currentTime: t,
        cancel: Du((n) => {
            t.value = n[e.axis].progress * 100;
        }, e)
    };
}
function Au({ source: e, container: t, ...n }) {
    const { axis: r } = n;
    e && (t = e);
    const i = Ou.get(t) ?? new Map();
    Ou.set(t, i);
    const a = n.target ?? `self`;
    const o = i.get(a) ?? {};
    const s = r + (n.offset ?? []).join(`,`);
    return (
        o[s] || (o[s] = !n.target && ar() ? new ScrollTimeline({ source: t, axis: r }) : ku({ container: t, ...n })),
        o[s]
    );
}
function ju(e, t) {
    const n = Au(t);
    return e.attachTimeline({
        timeline: t.target ? void 0 : n,
        observe: (e) => (
            e.pause(),
            Li((t) => {
                e.time = e.iterationDuration * t;
            }, n)
        )
    });
}
function Mu(e) {
    return e.length === 2;
}
function Nu(e, t) {
    return Mu(e)
        ? Du((n) => {
              e(n[t.axis].progress, n);
          }, t)
        : Li(e, Au(t));
}
function Pu(e, { axis: t = `y`, container: n = document.scrollingElement, ...r } = {}) {
    if (!n) return T;
    const i = { axis: t, container: n, ...r };
    return typeof e === `function` ? Nu(e, i) : ju(e, i);
}
const Fu = () => ({ scrollX: ai(0), scrollY: ai(0), scrollXProgress: ai(0), scrollYProgress: ai(0) });
const Iu = (e) => (e ? !e.current : !1);
function Lu({ container: e, target: t, ...n } = {}) {
    const r = w(Fu);
    const i = (0, S.useRef)(null);
    const a = (0, S.useRef)(!1);
    const o = (0, S.useCallback)(
        () => (
            (i.current = Pu(
                (e, { x: t, y: n }) => {
                    (r.scrollX.set(t.current),
                        r.scrollXProgress.set(t.progress),
                        r.scrollY.set(n.current),
                        r.scrollYProgress.set(n.progress));
                },
                { ...n, container: e?.current || void 0, target: t?.current || void 0 }
            )),
            () => {
                i.current?.();
            }
        ),
        [e, t, JSON.stringify(n.offset)]
    );
    return (
        te(() => {
            if (((a.current = !1), Iu(e) || Iu(t))) {
                a.current = !0;
            } else return o();
        }, [o]),
        (0, S.useEffect)(() => {
            if (a.current) return (Iu(e), Iu(t), o());
        }, [o]),
        r
    );
}
function Ru(e) {
    const t = w(() => ai(e));
    const { isStatic: n } = (0, S.useContext)(Gi);
    if (n) {
        const [, n] = (0, S.useState)(e);
        (0, S.useEffect)(() => t.on(`change`, n), []);
    }
    return t;
}
function zu(e, t) {
    const n = Ru(t());
    const r = () => n.set(t());
    return (
        r(),
        te(() => {
            const t = () => k.preRender(r, !1, !0);
            const n = e.map((e) => e.on(`change`, t));
            return () => {
                (n.forEach((e) => e()), He(r));
            };
        }),
        n
    );
}
function Bu(e) {
    ((ri.current = []), e());
    const t = zu(ri.current, e);
    return ((ri.current = void 0), t);
}
function Vu(e, t, n, r) {
    if (typeof e === `function`) return Bu(e);
    const i = typeof t === `function` ? t : zi(t, n, r);
    return Array.isArray(e) ? Hu(e, i) : Hu([e], ([e]) => i(e));
}
function Hu(e, t) {
    const n = w(() => []);
    return zu(e, () => {
        n.length = 0;
        const r = e.length;
        for (let t = 0; t < r; t++) n[t] = e[t].get();
        return t(n);
    });
}
function Uu(e, t = {}) {
    const { isStatic: n } = (0, S.useContext)(Gi);
    const r = () => (R(e) ? e.get() : e);
    if (n) return Vu(r);
    const i = Ru(r());
    return ((0, S.useInsertionEffect)(() => Bi(i, e, t), [i, JSON.stringify(t)]), i);
}
const Wu = y();
const Z = [0.22, 1, 0.36, 1];
const Gu = [
    {
        index: `02`,
        title: `Portfolio 2026`,
        type: `Personal Brand / Creative Development`,
        year: `2026`,
        tone: `blue`,
        eyebrow: `A cinematic digital identity built to make a memorable first impression.`
    },
    {
        index: `03`,
        title: `Motion Lab`,
        type: `Interaction Design / Experiments`,
        year: `2026`,
        tone: `violet`,
        eyebrow: `An evolving collection of expressive interactions and visual experiments.`
    }
];
const Ku = [
    [`CURRENT`, `Independent Practice`, `Frontend & Creative Development`, `Amravati, MH`],
    [`FEATURED`, `RC Dine`, `Design, Development & Motion`, `Case Study`],
    [`ONGOING`, `Continuous Learning`, `Modern Web Engineering`, `Open to work`]
];
function qu({ children: e, href: t, variant: n = `solid`, label: r }) {
    const i = Ru(0);
    const a = Ru(0);
    const o = Uu(i, { stiffness: 180, damping: 14, mass: 0.15 });
    const s = Uu(a, { stiffness: 180, damping: 14, mass: 0.15 });
    return (0, z.jsxs)(X.a, {
        href: t,
        'aria-label': r,
        'data-cursor': `grow`,
        className: `magnetic-button ${n}`,
        onMouseMove: (e) => {
            const t = e.currentTarget.getBoundingClientRect();
            (i.set((e.clientX - t.left - t.width / 2) * 0.22), a.set((e.clientY - t.top - t.height / 2) * 0.22));
        },
        onMouseLeave: () => {
            (i.set(0), a.set(0));
        },
        style: { x: o, y: s },
        whileTap: { scale: 0.96 },
        children: [
            (0, z.jsx)(`span`, { children: e }),
            (0, z.jsx)(`span`, { className: `button-arrow`, 'aria-hidden': `true`, children: `↗` })
        ]
    });
}
function Ju({ children: e, className: t = ``, delay: n = 0 }) {
    return (0, z.jsx)(X.div, {
        className: t,
        initial: { opacity: 0, y: 54 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: !0, margin: `-10%` },
        transition: { duration: 0.9, delay: n, ease: Z },
        children: e
    });
}
function Yu({ number: e, label: t }) {
    return (0, z.jsxs)(`div`, {
        className: `section-kicker`,
        children: [
            (0, z.jsx)(`span`, { children: e }),
            (0, z.jsx)(`span`, { className: `kicker-line` }),
            (0, z.jsx)(`span`, { children: t })
        ]
    });
}
function Xu({ children: e, className: t = `` }) {
    const n = Ru(0);
    const r = Ru(0);
    const i = Uu(n, { stiffness: 140, damping: 18 });
    const a = Uu(r, { stiffness: 140, damping: 18 });
    return (0, z.jsx)(X.div, {
        className: t,
        'data-cursor': `project`,
        onMouseMove: (e) => {
            const t = e.currentTarget.getBoundingClientRect();
            const i = (e.clientX - t.left) / t.width;
            const a = (e.clientY - t.top) / t.height;
            (n.set((0.5 - a) * 7), r.set((i - 0.5) * 7));
        },
        onMouseLeave: () => {
            (n.set(0), r.set(0));
        },
        style: { rotateX: i, rotateY: a, transformPerspective: 1200 },
        children: e
    });
}
function Zu() {
    const e = Ru(-100);
    const t = Ru(-100);
    const n = Uu(e, { stiffness: 650, damping: 42 });
    const r = Uu(t, { stiffness: 650, damping: 42 });
    const [i, a] = (0, S.useState)(`default`);
    return (
        (0, S.useEffect)(() => {
            const n = (n) => {
                (e.set(n.clientX - 10), t.set(n.clientY - 10));
            };
            const r = (e) => {
                a(e.target.closest(`[data-cursor]`)?.dataset.cursor ?? `default`);
            };
            return (
                window.addEventListener(`mousemove`, n),
                window.addEventListener(`mouseover`, r),
                () => {
                    (window.removeEventListener(`mousemove`, n), window.removeEventListener(`mouseover`, r));
                }
            );
        }, [e, t]),
        (0, z.jsx)(X.div, {
            className: `custom-cursor ${i}`,
            style: { x: n, y: r },
            animate: { scale: i === `default` ? 1 : i === `project` ? 4.6 : 2.4 },
            transition: { duration: 0.2 },
            children: (0, z.jsx)(`span`, { children: i === `project` ? `VIEW` : `` })
        })
    );
}
function Qu({ onDone: e }) {
    const [t, n] = (0, S.useState)(0);
    return (
        (0, S.useEffect)(() => {
            const t = performance.now();
            let r = 0;
            const i = (a) => {
                const o = Math.min(100, Math.round(((a - t) / 1450) * 100));
                (n(o), o < 100 ? (r = requestAnimationFrame(i)) : window.setTimeout(e, 220));
            };
            return ((r = requestAnimationFrame(i)), () => cancelAnimationFrame(r));
        }, [e]),
        (0, z.jsxs)(X.div, {
            className: `loader`,
            exit: { y: `-100%` },
            transition: { duration: 0.85, ease: Z },
            children: [
                (0, z.jsx)(`div`, { className: `loader-mark`, children: `C/K` }),
                (0, z.jsx)(`div`, {
                    className: `loader-track`,
                    children: (0, z.jsx)(X.span, { animate: { width: `${t}%` } })
                }),
                (0, z.jsx)(`div`, { className: `loader-count`, children: t.toString().padStart(3, `0`) }),
                (0, z.jsx)(`div`, { className: `loader-copy`, children: `Crafting the experience` })
            ]
        })
    );
}
function $u() {
    const [e, t] = (0, S.useState)(!1);
    const n = [
        { label: `About`, href: `#about` },
        { label: `Skills`, href: `#skills` },
        { label: `Experience`, href: `#experience` }
    ];
    const r = [...n, { label: `My Portfolio`, href: `#projects` }, { label: `Contact`, href: `#contact` }];
    return (0, z.jsxs)(z.Fragment, {
        children: [
            (0, z.jsxs)(X.header, {
                className: `nav`,
                initial: { y: -100 },
                animate: { y: 0 },
                transition: { duration: 0.9, delay: 1.9, ease: Z },
                children: [
                    (0, z.jsxs)(`a`, {
                        href: `#top`,
                        className: `logo`,
                        'data-cursor': `grow`,
                        'aria-label': `Back to top`,
                        children: [`C`, (0, z.jsx)(`span`, { children: `/` }), `K`]
                    }),
                    (0, z.jsx)(`nav`, {
                        className: `desktop-nav`,
                        'aria-label': `Primary navigation`,
                        children: n.map((e) =>
                            (0, z.jsx)(`a`, { 'data-cursor': `grow`, href: e.href, children: e.label }, e.label)
                        )
                    }),
                    (0, z.jsxs)(`div`, {
                        className: `nav-actions`,
                        children: [
                            (0, z.jsx)(`a`, {
                                href: `#projects`,
                                className: `nav-portfolio`,
                                'data-cursor': `grow`,
                                children: `My Portfolio`
                            }),
                            (0, z.jsxs)(`a`, {
                                href: `#contact`,
                                className: `nav-cta`,
                                'data-cursor': `grow`,
                                children: [(0, z.jsx)(`span`, {}), `Contact`]
                            })
                        ]
                    }),
                    (0, z.jsxs)(`button`, {
                        className: `menu-button`,
                        onClick: () => t(!e),
                        'aria-expanded': e,
                        'aria-label': `Toggle menu`,
                        children: [
                            (0, z.jsx)(`span`, { className: e ? `open` : `` }),
                            (0, z.jsx)(`span`, { className: e ? `open` : `` })
                        ]
                    })
                ]
            }),
            (0, z.jsx)(na, {
                children:
                    e &&
                    (0, z.jsxs)(X.div, {
                        className: `mobile-menu`,
                        initial: { clipPath: `inset(0 0 100% 0)` },
                        animate: { clipPath: `inset(0 0 0% 0)` },
                        exit: { clipPath: `inset(0 0 100% 0)` },
                        transition: { duration: 0.65, ease: Z },
                        children: [
                            (0, z.jsx)(`span`, { className: `menu-label`, children: `Navigation` }),
                            r.map((e, n) =>
                                (0, z.jsxs)(
                                    X.a,
                                    {
                                        href: e.href,
                                        onClick: () => t(!1),
                                        initial: { opacity: 0, y: 30 },
                                        animate: { opacity: 1, y: 0 },
                                        transition: { delay: 0.15 + n * 0.07 },
                                        children: [e.label, (0, z.jsxs)(`span`, { children: [`0`, n + 1] })]
                                    },
                                    e.label
                                )
                            )
                        ]
                    })
            })
        ]
    });
}
function ed() {
    return (0, z.jsxs)(`div`, {
        className: `rc-stage`,
        children: [
            (0, z.jsx)(`div`, { className: `grain` }),
            (0, z.jsx)(X.div, {
                className: `orange-orbit`,
                animate: { rotate: 360 },
                transition: { duration: 24, repeat: 1 / 0, ease: `linear` }
            }),
            (0, z.jsxs)(X.div, {
                className: `rc-window`,
                whileHover: { y: -8 },
                transition: { duration: 0.35 },
                children: [
                    (0, z.jsxs)(`div`, {
                        className: `rc-topbar`,
                        children: [
                            (0, z.jsx)(`span`, { children: `RC DINE` }),
                            (0, z.jsx)(`span`, { children: `MENU\xA0\xA0 RESERVE` })
                        ]
                    }),
                    (0, z.jsxs)(`div`, {
                        className: `rc-body`,
                        children: [
                            (0, z.jsxs)(`p`, { children: [`CRAFTED IN`, (0, z.jsx)(`br`, {}), `EVERY BITE.`] }),
                            (0, z.jsx)(`div`, {
                                className: `plate`,
                                children: (0, z.jsxs)(`div`, {
                                    className: `plate-ring`,
                                    children: [
                                        (0, z.jsx)(`span`, { className: `food food-one` }),
                                        (0, z.jsx)(`span`, { className: `food food-two` }),
                                        (0, z.jsx)(`span`, { className: `food food-three` }),
                                        (0, z.jsx)(`span`, { className: `food food-four` })
                                    ]
                                })
                            }),
                            (0, z.jsx)(`span`, {
                                className: `rc-caption`,
                                children: `Seasonal plates · Honest ingredients`
                            })
                        ]
                    })
                ]
            }),
            (0, z.jsxs)(`div`, {
                className: `rc-sticker`,
                children: [`01`, (0, z.jsx)(`br`, {}), (0, z.jsx)(`small`, { children: `FEATURED` })]
            })
        ]
    });
}
function td() {
    const [e, t] = (0, S.useState)(!0);
    const { scrollYProgress: n } = Lu();
    const r = Uu(n, { stiffness: 120, damping: 28, restDelta: 0.001 });
    const i = Vu(n, [0, 0.2], [0, 140]);
    return (0, z.jsxs)(z.Fragment, {
        children: [
            (0, z.jsx)(na, { children: e && (0, z.jsx)(Qu, { onDone: () => t(!1) }) }),
            (0, z.jsx)(Zu, {}),
            (0, z.jsx)(X.div, { className: `progress`, style: { scaleX: r } }),
            (0, z.jsx)($u, {}),
            (0, z.jsxs)(`main`, {
                id: `top`,
                children: [
                    (0, z.jsxs)(`section`, {
                        className: `hero`,
                        children: [
                            (0, z.jsx)(`div`, { className: `hero-grid`, 'aria-hidden': `true` }),
                            (0, z.jsxs)(X.div, {
                                className: `hero-orb`,
                                style: { y: i },
                                'aria-hidden': `true`,
                                children: [
                                    (0, z.jsx)(`span`, { className: `orb-core` }),
                                    (0, z.jsx)(`span`, { className: `orb-ring one` }),
                                    (0, z.jsx)(`span`, { className: `orb-ring two` })
                                ]
                            }),
                            (0, z.jsxs)(X.div, {
                                className: `availability`,
                                initial: { opacity: 0 },
                                animate: { opacity: 1 },
                                transition: { delay: 2.05 },
                                children: [(0, z.jsx)(`span`, {}), ` Available for selected projects · Amravati, India`]
                            }),
                            (0, z.jsx)(`div`, {
                                className: `hero-title`,
                                'aria-label': `Chetan C. Khade, creative frontend developer`,
                                children: [`CHETAN`, `CREATIVE`, `DEVELOPER.`].map((e, t) =>
                                    (0, z.jsx)(
                                        `div`,
                                        {
                                            className: t === 1 ? `title-row orange` : `title-row`,
                                            children: (0, z.jsx)(X.span, {
                                                initial: { y: `110%` },
                                                animate: { y: 0 },
                                                transition: { duration: 1.05, delay: 1.7 + t * 0.1, ease: Z },
                                                children: e
                                            })
                                        },
                                        e
                                    )
                                )
                            }),
                            (0, z.jsxs)(X.div, {
                                className: `hero-bottom`,
                                initial: { opacity: 0, y: 25 },
                                animate: { opacity: 1, y: 0 },
                                transition: { delay: 2.3, duration: 0.8 },
                                children: [
                                    (0, z.jsxs)(`p`, {
                                        children: [
                                            (0, z.jsx)(`strong`, { children: `Chetan C. Khade` }),
                                            ` is a frontend developer crafting responsive, expressive digital experiences from Amravati, Maharashtra.`
                                        ]
                                    }),
                                    (0, z.jsx)(qu, { href: `#projects`, children: `My Portfolio` })
                                ]
                            }),
                            (0, z.jsxs)(`div`, {
                                className: `scroll-note`,
                                children: [(0, z.jsx)(`span`, { children: `SCROLL TO DISCOVER` }), (0, z.jsx)(`i`, {})]
                            })
                        ]
                    }),
                    (0, z.jsxs)(`section`, {
                        className: `about section`,
                        id: `about`,
                        children: [
                            (0, z.jsx)(Yu, { number: `01`, label: `About` }),
                            (0, z.jsxs)(Ju, {
                                className: `about-statement`,
                                children: [
                                    `I turn ideas into `,
                                    (0, z.jsx)(`em`, { children: `clear, magnetic` }),
                                    ` digital experiences—pairing strong visual thinking with responsive, thoughtful code.`
                                ]
                            }),
                            (0, z.jsxs)(`div`, {
                                className: `about-lower`,
                                children: [
                                    (0, z.jsxs)(Ju, {
                                        className: `portrait-block`,
                                        children: [
                                            (0, z.jsx)(`img`, {
                                                src: `/portfolio/chetan-khade-portrait.jpg`,
                                                alt: `Chetan C. Khade`
                                            }),
                                            (0, z.jsx)(`div`, { className: `portrait-noise` }),
                                            (0, z.jsx)(`div`, { className: `portrait-monogram`, children: `CK` }),
                                            (0, z.jsxs)(`span`, {
                                                children: [
                                                    `AMRAVATI, MAHARASHTRA`,
                                                    (0, z.jsx)(`br`, {}),
                                                    `OPEN TO OPPORTUNITIES`
                                                ]
                                            })
                                        ]
                                    }),
                                    (0, z.jsxs)(Ju, {
                                        className: `about-copy`,
                                        delay: 0.12,
                                        children: [
                                            (0, z.jsx)(`p`, {
                                                children: `I'm Chetan C. Khade, a frontend developer from Amravati focused on modern interfaces, creative motion, and digital experiences with personality.`
                                            }),
                                            (0, z.jsx)(`p`, {
                                                children: `I build with React, TypeScript, Vite, Tailwind CSS, and Framer Motion—balancing visual polish with clarity, performance, and responsive behavior.`
                                            }),
                                            (0, z.jsx)(qu, {
                                                href: `mailto:chetankhade10@gmail.com`,
                                                variant: `outline`,
                                                children: `Contact me`
                                            })
                                        ]
                                    }),
                                    (0, z.jsxs)(`div`, {
                                        className: `stats`,
                                        children: [
                                            (0, z.jsxs)(Ju, {
                                                children: [
                                                    (0, z.jsx)(`strong`, { children: `01` }),
                                                    (0, z.jsx)(`small`, { children: `Featured project` })
                                                ]
                                            }),
                                            (0, z.jsxs)(Ju, {
                                                delay: 0.08,
                                                children: [
                                                    (0, z.jsx)(`strong`, { children: `06` }),
                                                    (0, z.jsx)(`small`, { children: `Core tools` })
                                                ]
                                            }),
                                            (0, z.jsxs)(Ju, {
                                                delay: 0.16,
                                                children: [
                                                    (0, z.jsxs)(`strong`, {
                                                        children: [`100`, (0, z.jsx)(`span`, { children: `%` })]
                                                    }),
                                                    (0, z.jsx)(`small`, { children: `Responsive focus` })
                                                ]
                                            })
                                        ]
                                    })
                                ]
                            })
                        ]
                    }),
                    (0, z.jsxs)(`section`, {
                        className: `skills section`,
                        id: `skills`,
                        children: [
                            (0, z.jsx)(Yu, { number: `02`, label: `Capabilities` }),
                            (0, z.jsx)(`div`, {
                                className: `marquee`,
                                'aria-label': `Design, development, and direction`,
                                children: (0, z.jsxs)(X.div, {
                                    animate: { x: [`0%`, `-50%`] },
                                    transition: { duration: 18, repeat: 1 / 0, ease: `linear` },
                                    children: [
                                        (0, z.jsx)(`span`, { children: `DESIGN` }),
                                        (0, z.jsx)(`i`, { children: `✦` }),
                                        (0, z.jsx)(`span`, { children: `DEVELOPMENT` }),
                                        (0, z.jsx)(`i`, { children: `✦` }),
                                        (0, z.jsx)(`span`, { children: `DIRECTION` }),
                                        (0, z.jsx)(`i`, { children: `✦` }),
                                        (0, z.jsx)(`span`, { children: `DESIGN` }),
                                        (0, z.jsx)(`i`, { children: `✦` }),
                                        (0, z.jsx)(`span`, { children: `DEVELOPMENT` }),
                                        (0, z.jsx)(`i`, { children: `✦` }),
                                        (0, z.jsx)(`span`, { children: `DIRECTION` }),
                                        (0, z.jsx)(`i`, { children: `✦` })
                                    ]
                                })
                            }),
                            (0, z.jsx)(`div`, {
                                className: `skill-list`,
                                children: [
                                    [`01`, `Interface Strategy`, `Structure, User Flows, Visual Direction`],
                                    [`02`, `Responsive Design`, `UI Systems, Prototyping, Mobile-first Layouts`],
                                    [`03`, `Creative Development`, `React, TypeScript, Tailwind, Motion`]
                                ].map(([e, t, n], r) =>
                                    (0, z.jsxs)(
                                        Ju,
                                        {
                                            className: `skill-row`,
                                            delay: r * 0.07,
                                            children: [
                                                (0, z.jsx)(`span`, { className: `skill-num`, children: e }),
                                                (0, z.jsx)(`h3`, { children: t }),
                                                (0, z.jsx)(`p`, { children: n }),
                                                (0, z.jsx)(`span`, { className: `skill-plus`, children: `+` })
                                            ]
                                        },
                                        e
                                    )
                                )
                            })
                        ]
                    }),
                    (0, z.jsxs)(`section`, {
                        className: `projects section`,
                        id: `projects`,
                        children: [
                            (0, z.jsx)(Yu, { number: `03`, label: `My Portfolio` }),
                            (0, z.jsxs)(Ju, {
                                className: `projects-heading`,
                                children: [
                                    (0, z.jsxs)(`h2`, {
                                        children: [
                                            `PROJECTS THAT`,
                                            (0, z.jsx)(`br`, {}),
                                            (0, z.jsx)(`span`, { children: `MOVE PEOPLE.` })
                                        ]
                                    }),
                                    (0, z.jsx)(`p`, {
                                        children: `A small selection of product, identity, and interactive work built for ambitious teams.`
                                    })
                                ]
                            }),
                            (0, z.jsx)(Xu, {
                                className: `featured-card`,
                                children: (0, z.jsxs)(`a`, {
                                    href: `#contact`,
                                    'aria-label': `Start a project like RC Dine`,
                                    className: `project-link`,
                                    children: [
                                        (0, z.jsx)(ed, {}),
                                        (0, z.jsxs)(`div`, {
                                            className: `featured-meta`,
                                            children: [
                                                (0, z.jsxs)(`div`, {
                                                    children: [
                                                        (0, z.jsx)(`span`, { children: `01 / FEATURED CASE` }),
                                                        (0, z.jsx)(`h3`, { children: `RC Dine` })
                                                    ]
                                                }),
                                                (0, z.jsx)(`p`, {
                                                    children: `A vibrant digital home for a modern dining concept—designed to turn curiosity into reservations.`
                                                }),
                                                (0, z.jsxs)(`div`, {
                                                    className: `project-tags`,
                                                    children: [
                                                        (0, z.jsx)(`span`, { children: `Strategy` }),
                                                        (0, z.jsx)(`span`, { children: `Identity` }),
                                                        (0, z.jsx)(`span`, { children: `Web Design` })
                                                    ]
                                                }),
                                                (0, z.jsx)(`span`, { className: `round-arrow`, children: `↗` })
                                            ]
                                        })
                                    ]
                                })
                            }),
                            (0, z.jsx)(`div`, {
                                className: `project-grid`,
                                children: Gu.map((e, t) =>
                                    (0, z.jsx)(
                                        Xu,
                                        {
                                            className: `project-card ${e.tone}`,
                                            children: (0, z.jsxs)(`a`, {
                                                href: `#contact`,
                                                'aria-label': `Start a project inspired by ${e.title}`,
                                                children: [
                                                    (0, z.jsxs)(`div`, {
                                                        className: `project-art`,
                                                        children: [
                                                            (0, z.jsx)(`span`, {
                                                                className: `project-index`,
                                                                children: e.index
                                                            }),
                                                            (0, z.jsx)(X.div, {
                                                                className: `art-card`,
                                                                whileHover: { rotate: t ? -6 : 6, scale: 1.04 },
                                                                children:
                                                                    t === 0
                                                                        ? (0, z.jsxs)(z.Fragment, {
                                                                              children: [
                                                                                  (0, z.jsx)(`span`, {
                                                                                      className: `aether-logo`,
                                                                                      children: `CK.`
                                                                                  }),
                                                                                  (0, z.jsxs)(`div`, {
                                                                                      className: `chart-bars`,
                                                                                      children: [
                                                                                          (0, z.jsx)(`i`, {}),
                                                                                          (0, z.jsx)(`i`, {}),
                                                                                          (0, z.jsx)(`i`, {}),
                                                                                          (0, z.jsx)(`i`, {}),
                                                                                          (0, z.jsx)(`i`, {})
                                                                                      ]
                                                                                  }),
                                                                                  (0, z.jsx)(`b`, {
                                                                                      children: `PORTFOLIO`
                                                                                  })
                                                                              ]
                                                                          })
                                                                        : (0, z.jsxs)(z.Fragment, {
                                                                              children: [
                                                                                  (0, z.jsxs)(`span`, {
                                                                                      className: `noir-copy`,
                                                                                      children: [
                                                                                          `IDEAS`,
                                                                                          (0, z.jsx)(`br`, {}),
                                                                                          (0, z.jsx)(`i`, {
                                                                                              children: `in`
                                                                                          }),
                                                                                          ` MOTION`
                                                                                      ]
                                                                                  }),
                                                                                  (0, z.jsx)(`span`, {
                                                                                      className: `noir-dot`
                                                                                  })
                                                                              ]
                                                                          })
                                                            })
                                                        ]
                                                    }),
                                                    (0, z.jsxs)(`div`, {
                                                        className: `card-meta`,
                                                        children: [
                                                            (0, z.jsx)(`p`, { children: e.eyebrow }),
                                                            (0, z.jsx)(`h3`, { children: e.title }),
                                                            (0, z.jsxs)(`div`, {
                                                                children: [
                                                                    (0, z.jsx)(`span`, { children: e.type }),
                                                                    (0, z.jsx)(`span`, { children: e.year })
                                                                ]
                                                            })
                                                        ]
                                                    })
                                                ]
                                            })
                                        },
                                        e.title
                                    )
                                )
                            })
                        ]
                    }),
                    (0, z.jsxs)(`section`, {
                        className: `experience section`,
                        id: `experience`,
                        children: [
                            (0, z.jsx)(Yu, { number: `04`, label: `Experience` }),
                            (0, z.jsx)(Ju, {
                                className: `experience-heading`,
                                children: (0, z.jsxs)(`h2`, {
                                    children: [
                                        `BUILDING WITH`,
                                        (0, z.jsx)(`br`, {}),
                                        (0, z.jsx)(`em`, { children: `INTENT & CURIOSITY.` })
                                    ]
                                })
                            }),
                            (0, z.jsx)(`div`, {
                                className: `experience-list`,
                                children: Ku.map(([e, t, n, r], i) =>
                                    (0, z.jsxs)(
                                        Ju,
                                        {
                                            className: `experience-row`,
                                            delay: i * 0.07,
                                            children: [
                                                (0, z.jsx)(`span`, { children: e }),
                                                (0, z.jsx)(`h3`, { children: t }),
                                                (0, z.jsx)(`p`, { children: n }),
                                                (0, z.jsx)(`small`, { children: r })
                                            ]
                                        },
                                        t
                                    )
                                )
                            }),
                            (0, z.jsxs)(Ju, {
                                className: `toolbox`,
                                children: [
                                    (0, z.jsx)(`span`, { children: `SELECTED TOOLBOX` }),
                                    (0, z.jsx)(`div`, {
                                        children: [
                                            `Figma`,
                                            `React`,
                                            `TypeScript`,
                                            `Tailwind CSS`,
                                            `Framer Motion`,
                                            `Vite`
                                        ].map((e) => (0, z.jsx)(`i`, { children: e }, e))
                                    })
                                ]
                            })
                        ]
                    }),
                    (0, z.jsxs)(`section`, {
                        className: `contact`,
                        id: `contact`,
                        children: [
                            (0, z.jsx)(`div`, { className: `contact-glow`, 'aria-hidden': `true` }),
                            (0, z.jsxs)(`div`, {
                                className: `contact-top`,
                                children: [
                                    (0, z.jsx)(Yu, { number: `05`, label: `Contact` }),
                                    (0, z.jsx)(`span`, { children: `Have a project in mind?` })
                                ]
                            }),
                            (0, z.jsx)(Ju, {
                                className: `contact-title`,
                                children: (0, z.jsxs)(`h2`, {
                                    children: [
                                        `LET'S MAKE`,
                                        (0, z.jsx)(`br`, {}),
                                        (0, z.jsx)(`span`, { children: `SOMETHING` }),
                                        (0, z.jsx)(`br`, {}),
                                        `UNFORGETTABLE.`
                                    ]
                                })
                            }),
                            (0, z.jsxs)(Ju, {
                                className: `contact-action`,
                                children: [
                                    (0, z.jsx)(qu, {
                                        href: `mailto:chetankhade10@gmail.com?subject=Project%20enquiry`,
                                        children: `Start a project`
                                    }),
                                    (0, z.jsx)(`p`, {
                                        children: `Have an opportunity, collaboration, or idea in mind? Let's turn it into a memorable digital experience.`
                                    })
                                ]
                            }),
                            (0, z.jsxs)(`footer`, {
                                children: [
                                    (0, z.jsx)(`a`, {
                                        href: `mailto:chetankhade10@gmail.com`,
                                        'data-cursor': `grow`,
                                        children: `chetankhade10@gmail.com`
                                    }),
                                    (0, z.jsx)(`div`, {
                                        children: (0, z.jsx)(`a`, {
                                            href: `https://www.instagram.com/__mr.chetan_/`,
                                            target: `_blank`,
                                            rel: `noreferrer`,
                                            'data-cursor': `grow`,
                                            children: `Instagram · @__MR.CHETAN_`
                                        })
                                    }),
                                    (0, z.jsx)(`span`, { children: `© 2026 Chetan C. Khade · Amravati` })
                                ]
                            })
                        ]
                    })
                ]
            })
        ]
    });
}
(0, Wu.createRoot)(document.getElementById(`root`)).render((0, z.jsx)(S.StrictMode, { children: (0, z.jsx)(td, {}) }));
