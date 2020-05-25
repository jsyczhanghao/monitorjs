import {
  now,
  on,
  observer,
  $
} from './helper';
import configs from './configs';
import { report } from './report';
import types from './types';

let query = location.href.match(new RegExp(`${configs.get().fs.startParam}=(\\d+)`));
let navigationStart: number = query ? Number(query[1]) : performance.timing.navigationStart;
let _navigationStart: number;

let replaceState = history.replaceState,
  pushState = history.pushState;

history.replaceState = function () {
  replaceState.apply(this, arguments);
  _navigationStart = now();
};

history.pushState = function () {
  pushState.apply(this, arguments);
  _navigationStart = now();
};

window.addEventListener('popstate', (e) => {
  _navigationStart = now();
});

const FS_MARKER = '__$monitor';
const FSING_MARKER = '__$monitoring';
let _inited = false;
let _fs: Fs;

function compute(time: number) {
  return Math.round(time / 50) * 50;
}

function try2monitor() {
  if (_fs) {
    _fs.stop();
  }

  let element = $('[data-monitorjs-fs]');

  if (element && element[FS_MARKER] || !element) return;

  let start = navigationStart;
  const ready = now();

  if (_inited) {
    start = _navigationStart;
  }

  _inited = true;

  _fs = new Fs(element, (time: number, spaces: []) => {
    report(types.FS, {
      name: element.getAttribute('data-monitorjs-fs'),
      spaces,
      ready: compute(ready - start),
      duration: compute(time - start)
    });

    _fs.stop();
    _fs = null;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (!configs.get().fs.enable) return ;

  observer($(`#${configs.get().fs.root}`), try2monitor);
  try2monitor();
});

interface FsInfo {
  el: HTMLElement,
  time: number,
  image?: boolean;
  wait?: Promise<undefined>;
  height?: number;
  top?: number;
}

class Fs {
  element: HTMLElement;
  callback: Function;
  private $: MutationObserver;
  private infos: FsInfo[] = [];

  constructor(element: HTMLElement, callback: Function) {
    this.element = element;
    this.callback = callback;
    this.$ = element[FS_MARKER] = observer(this.element, this.try2collect.bind(this), true);
    this.collectImage(element);
    setTimeout(() => this.analyse(), 2500);
  }

  stop() {
    if (!this.$) return ;
    this.$.disconnect();
    this.$ = null;
    this.infos = null;
    this.element = null;
  }

  private try2collect(records: MutationRecord[]) {
    records.forEach((record) => {
      [].forEach.call(record.addedNodes, (node: HTMLElement) => {
        node.nodeType == 1 && this.cache(node);
      });

      this.try2collectImage(<HTMLElement>record.target);
    });
  }

  private try2collectImage(node: HTMLElement) {
    if (node[FSING_MARKER]) return false;

    node[FSING_MARKER] = true;
    setTimeout(() => {
      this.collectImage(node);
      node[FSING_MARKER] = false;
    }, 50);
  }

  private collectImage(node: HTMLElement) {
    [].forEach.call(node.getElementsByTagName('img'), (image: HTMLImageElement) => {
      if (image[FSING_MARKER]) return;

      image[FSING_MARKER] = true;

      let info = this.cache(image);
      info.image = true;

      if (image.complete) return;

      info.wait = new Promise<undefined>((resolve) => {
        on(image, 'load complete error', () => {
          info.time = now();
          resolve();
        });
      });
    });
  }

  private cache(node: HTMLElement): FsInfo {
    let info: FsInfo = {
      el: node,
      time: now()
    };
    this.infos.push(info);
    return info;
  }

  analyse() {
    if (!this.$) return ;

    Promise.all(this.filter()).then((res: FsInfo[]) => {
      let spaces = [], last = res[0]?.time || 0;

      if (last == 0) {
        this.stop();
        return ;
      }

      res.sort((a, b) => {
        return a.top - b.top;
      }).reduceRight((a, b) => {
        const aBottom = a.top + a.height;

        if (b.top > window.innerHeight || a.top < 0) return b;

        if (b.top - aBottom > configs.get().fs.maxSpace) {
          spaces.push([aBottom, b.top]);
        }

        last = Math.max(last, a.time, b.time);
        return b.top + b.height > aBottom ? b : a;
      });
      
      this.callback(last, spaces);
    });
  }

  private filter() : Array<Promise<FsInfo> | FsInfo>{
    const R_TOP = this.element.getBoundingClientRect().top;
    const HALF_MAX_WIDTH = window.innerWidth;
    let all = [];

    this.infos.forEach((info) => {
      let {
        height,
        top,
        width,
        left
      } = info.el.getBoundingClientRect();

      info.height = height;
      info.top = top - R_TOP;

      if (info.image) {
        if (width > HALF_MAX_WIDTH && left > HALF_MAX_WIDTH) {
          return;
        } else if (info.wait) {
          all.push(info.wait.then(() => {
            info.height = (<HTMLImageElement>info.el).height;
            return info;
          }));
          return;
        }
      }

      all.push(info);
    });

    return all;
  }
}