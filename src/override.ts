import {
  now,
  on,
  mini
} from './helper';
import {
  report,
  ifTimeoutReport
} from './report';
import types from './types';
import configs from './configs';

if (!mini) {
  on(window, 'error', (err: ErrorEvent) => {
    report(types.RUNTIME_ERROR, {
      error: err.message,
      lcno: err.lineno + ':' + err.colno,
      file: err.filename
    });
  });
  
  if ('fetch' in window) {
    let old = window.fetch;
    window.fetch = function (url, options={}) {
      let start = now();
      let request: any = old(url, options);
  
      if (options.body instanceof FormData) return request;

      let f = () => ifTimeoutReport(start, types.LOAD_TIMEOUT, {
        url,
        options
      });

      request.then(f, f);
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
  
  // let createElement = document.createElement;
  // document.createElement = function (type: string) {
  //   let node = createElement.call(this, type);
  //   let start = now();
  
  //   type == 'script' && on(node, 'load', () => ifTimeoutReport(start, types.LOAD_TIMEOUT, {
  //     url: node.src
  //   }));
  
  //   return node;
  // };
} else {
  //mini
  let global = configs.get().global;

  global.onError(function (err: string) {
    report(types.RUNTIME_ERROR, {
      error: err,
      lcno: '0:0',
      file: ''
    });
  });

  let request = global.request;
  let x = function ({complete, url, ...params}) {
    let start = now();

    return request({
      url,
      ...params,
      complete: function (...args: any) {
        ifTimeoutReport(start, types.LOAD_TIMEOUT, {
          url,
          options: {
            data: params.data,
            method: params.method
          }
        });
        complete && complete(...args);
      }
    })
  };
  let descriptor=Object.getOwnPropertyDescriptor(global, 'request');
  if(descriptor.get){
    descriptor.get=()=>x;
  }
  if(descriptor.value){
    descriptor.value=(params)=>{
      return  x(params);
    };
  }
  Object.defineProperty(global, 'request',descriptor);
}