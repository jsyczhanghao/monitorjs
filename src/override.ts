import {
  now,
  on
} from './helper';
import {
  report,
  ifTimeoutReport
} from './report';
import types from './types';

on(window, 'error', (err: ErrorEvent) => {
  report(types.RUNTIME_ERROR, {
    error: err.message,
    lcno: err.lineno + ':' + err.colno,
    file: err.filename
  });
});

if ('fetch' in window) {
  let old = window.fetch;
  window.fetch = function (url, options) {
    let start = now();
    let request: any = old(url, options);

    if (options.body instanceof FormData) return request;

    request.finally(() => ifTimeoutReport(start, types.LOAD_TIMEOUT, {
      url,
      options
    }));
    return request;
  };
}

let oldOpen = XMLHttpRequest.prototype.open;
let send = XMLHttpRequest.prototype.send;

XMLHttpRequest.prototype.open = function (method: string, url: string, ...args: any[]) {
  let start = now();
  on(this, 'loadend', () => !this.__$isUploadType && ifTimeoutReport(start, types.LOAD_TIMEOUT, {
    url,
    options: {
      method
    }
  }));
  return oldOpen.call(this, method, url, ...args);
};

XMLHttpRequest.prototype.send = function (body: any) {
  if (body instanceof FormData) {
    this.__$isUploadType = true;
  }

  return send.call(this, body);
};

let createElement = document.createElement;
document.createElement = function (type: string) {
  let node = createElement.call(this, type);
  let start = now();

  type == 'script' && on(node, 'load', () => ifTimeoutReport(start, types.LOAD_TIMEOUT, {
    url: node.src
  }));

  return node;
};