(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = global || self, global.monitorjs = factory());
}(this, (function () { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __rest(s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }

    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    }

    var configs = {
        namespace: 'main-site',
        timeoutCheck: 600,
        reportUrl: 'http://www.baidu.com',
        percent: 1,
        //@ts-ignore
        global: typeof wx != 'undefined' ? wx : typeof my != 'undefined' ? my : null,
        fs: {
            enable: false,
            root: 'root',
            startParam: 'fs_start',
            maxSpace: 50,
        }
    };
    var configs$1 = {
        get: function () { return configs; },
        set: function (cfgs) {
            configs = __assign(__assign(__assign({}, configs), cfgs), { fs: __assign(__assign({}, configs.fs), (cfgs['fs'] || {})) });
        }
    };

    var now = Date.now.bind(Date);
    var on = function (element, event, callback) {
        event.split(' ').forEach(function (e) {
            element.addEventListener(e, callback);
        });
    };
    var observer = function (target, callback, subtree) {
        if (subtree === void 0) { subtree = false; }
        //@ts-ignore
        var observer = new (window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver)(callback);
        observer.observe(target, {
            childList: true,
            subtree: subtree
        });
        return observer;
    };
    var $ = function (selector) {
        return document.querySelector(selector);
    };

    var report = function (type, data) {
        if (Math.random() > configs$1.get().percent)
            return;
        var url = configs$1.get().reportUrl + '?' + JSON.stringify(__assign(__assign({ type: type }, data), { namespace: configs$1.get().namespace }));
        if (configs$1.get().global) {
            configs$1.get().global.request({
                url: url
            });
        }
        else {
            var image_1 = new Image();
            image_1.src = url;
            on(image_1, 'load error complete', function () {
                document.body.removeChild(image_1);
                image_1 = null;
            });
            document.body.appendChild(image_1);
        }
    };
    var ifTimeoutReport = function (time, type, data) {
        var duration = now() - time;
        duration > configs$1.get().timeoutCheck && report(type, __assign(__assign({}, data), { duration: duration }));
    };

    var ReportTypes;
    (function (ReportTypes) {
        ReportTypes["RUNTIME_ERROR"] = "RUNTIME_ERROR";
        ReportTypes["LOAD_TIMEOUT"] = "LOAD_TIMEOUT";
        ReportTypes["FS"] = "FS";
    })(ReportTypes || (ReportTypes = {}));
    var types = ReportTypes;

    if (typeof window != 'undefined') {
        on(window, 'error', function (err) {
            report(types.RUNTIME_ERROR, {
                error: err.message,
                lcno: err.lineno + ':' + err.colno,
                file: err.filename
            });
        });
        if ('fetch' in window) {
            var old_1 = window.fetch;
            window.fetch = function (url, options) {
                var start = now();
                var request = old_1(url, options);
                if (options.body instanceof FormData)
                    return request;
                request.finally(function () { return ifTimeoutReport(start, types.LOAD_TIMEOUT, {
                    url: url,
                    options: options
                }); });
                return request;
            };
        }
        var oldOpen_1 = XMLHttpRequest.prototype.open;
        var send_1 = XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.open = function (method, url) {
            var _this = this;
            var args = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args[_i - 2] = arguments[_i];
            }
            var start = now();
            on(this, 'loadend', function () { return !_this.__$isUploadType && ifTimeoutReport(start, types.LOAD_TIMEOUT, {
                url: url,
                options: {
                    method: method
                }
            }); });
            return oldOpen_1.call.apply(oldOpen_1, __spreadArrays([this, method, url], args));
        };
        XMLHttpRequest.prototype.send = function (body) {
            if (body instanceof FormData) {
                this.__$isUploadType = true;
            }
            return send_1.call(this, body);
        };
        // let createElement = document.createElement;
        // document.createElement = function (type: string) {
        //   let node = createElement.call(this, type);
        //   let start = now();
        //   type == 'script' && on(node, 'load', () => ifTimeoutReport(start, types.LOAD_TIMEOUT, {
        //     url: node.src
        //   }));
        //   return node;
        // };
    }
    else {
        //mini
        var global = configs$1.get().global;
        global.onError(function (err) {
            report(types.RUNTIME_ERROR, {
                error: err,
                lcno: '0:0',
                file: ''
            });
        });
        var request_1 = global.request;
        var x_1 = function (_a) {
            var complete = _a.complete, url = _a.url, params = __rest(_a, ["complete", "url"]);
            var start = now();
            return request_1(__assign(__assign({ url: url }, params), { complete: function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    ifTimeoutReport(start, types.LOAD_TIMEOUT, {
                        url: url,
                        options: {
                            data: params.data,
                            method: params.method
                        }
                    });
                    complete && complete.apply(void 0, args);
                } }));
        };
        Object.defineProperty(global, 'request', __assign(__assign({}, Object.getOwnPropertyDescriptor(global, 'request')), { get: function () { return x_1; } }));
    }

    var fs = (function () {
        var query = location.href.match(new RegExp(configs$1.get().fs.startParam + "=(\\d+)"));
        var navigationStart = query ? Number(query[1]) : performance.timing.navigationStart;
        var _navigationStart;
        var replaceState = history.replaceState, pushState = history.pushState;
        history.replaceState = function () {
            replaceState.apply(this, arguments);
            _navigationStart = now();
        };
        history.pushState = function () {
            pushState.apply(this, arguments);
            _navigationStart = now();
        };
        window.addEventListener('popstate', function (e) {
            _navigationStart = now();
        });
        var FS_MARKER = '__$monitor';
        var FSING_MARKER = '__$monitoring';
        var _inited = false;
        var _fs;
        function compute(time) {
            return Math.round(time / 50) * 50;
        }
        function try2monitor() {
            if (_fs) {
                _fs.stop();
            }
            var element = $('[data-monitorjs-fs]');
            if (element && element[FS_MARKER] || !element)
                return;
            var start = navigationStart;
            var ready = now();
            if (_inited) {
                start = _navigationStart;
            }
            _inited = true;
            _fs = new Fs(element, function (time, spaces) {
                report(types.FS, {
                    name: element.getAttribute('data-monitorjs-fs'),
                    spaces: spaces,
                    ready: compute(ready - start),
                    duration: compute(time - start)
                });
                _fs.stop();
                _fs = null;
            });
        }
        document.addEventListener('DOMContentLoaded', function () {
            if (!configs$1.get().fs.enable)
                return;
            observer($("#" + configs$1.get().fs.root), try2monitor);
            try2monitor();
        });
        var Fs = /** @class */ (function () {
            function Fs(element, callback) {
                var _this = this;
                this.infos = [];
                this.element = element;
                this.callback = callback;
                this.$ = element[FS_MARKER] = observer(this.element, this.try2collect.bind(this), true);
                this.collectImage(element);
                setTimeout(function () { return _this.analyse(); }, 2500);
            }
            Fs.prototype.stop = function () {
                if (!this.$)
                    return;
                this.$.disconnect();
                this.$ = null;
                this.infos = null;
                this.element = null;
            };
            Fs.prototype.try2collect = function (records) {
                var _this = this;
                records.forEach(function (record) {
                    [].forEach.call(record.addedNodes, function (node) {
                        node.nodeType == 1 && _this.cache(node);
                    });
                    _this.try2collectImage(record.target);
                });
            };
            Fs.prototype.try2collectImage = function (node) {
                var _this = this;
                if (node[FSING_MARKER])
                    return false;
                node[FSING_MARKER] = true;
                setTimeout(function () {
                    _this.collectImage(node);
                    node[FSING_MARKER] = false;
                }, 50);
            };
            Fs.prototype.collectImage = function (node) {
                var _this = this;
                [].forEach.call(node.getElementsByTagName('img'), function (image) {
                    if (image[FSING_MARKER])
                        return;
                    image[FSING_MARKER] = true;
                    var info = _this.cache(image);
                    info.image = true;
                    if (image.complete)
                        return;
                    info.wait = new Promise(function (resolve) {
                        on(image, 'load complete error', function () {
                            info.time = now();
                            resolve();
                        });
                    });
                });
            };
            Fs.prototype.cache = function (node) {
                var info = {
                    el: node,
                    time: now()
                };
                this.infos.push(info);
                return info;
            };
            Fs.prototype.analyse = function () {
                var _this = this;
                if (!this.$)
                    return;
                Promise.all(this.filter()).then(function (res) {
                    var _a;
                    var spaces = [], last = ((_a = res[0]) === null || _a === void 0 ? void 0 : _a.time) || 0;
                    if (last == 0) {
                        _this.stop();
                        return;
                    }
                    res.sort(function (a, b) {
                        return a.top - b.top;
                    }).reduceRight(function (a, b) {
                        var aBottom = a.top + a.height;
                        if (b.top > window.innerHeight || a.top < 0)
                            return b;
                        if (b.top - aBottom > configs$1.get().fs.maxSpace) {
                            spaces.push([aBottom, b.top]);
                        }
                        last = Math.max(last, a.time, b.time);
                        return b.top + b.height > aBottom ? b : a;
                    });
                    _this.callback(last, spaces);
                });
            };
            Fs.prototype.filter = function () {
                var R_TOP = this.element.getBoundingClientRect().top;
                var HALF_MAX_WIDTH = window.innerWidth;
                var all = [];
                this.infos.forEach(function (info) {
                    var _a = info.el.getBoundingClientRect(), height = _a.height, top = _a.top, width = _a.width, left = _a.left;
                    info.height = height;
                    info.top = top - R_TOP;
                    if (info.image) {
                        if (width > HALF_MAX_WIDTH && left > HALF_MAX_WIDTH) {
                            return;
                        }
                        else if (info.wait) {
                            all.push(info.wait.then(function () {
                                info.height = info.el.height;
                                return info;
                            }));
                            return;
                        }
                    }
                    all.push(info);
                });
                return all;
            };
            return Fs;
        }());
    });

    !configs$1.get().global && fs();
    var index = {
        init: configs$1.set
    };

    return index;

})));
