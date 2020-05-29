import {
  now,
  on,
  mini
} from './helper';
import configs from './configs';
import types from './types';

export const report = (type: types, data: object) => {
  if (Math.random() > configs.get().percent) return;

  if (type == types.LOAD_TIMEOUT && (data['url'] || '').indexOf(configs.get().reportUrl) > -1) {
    return false;
  }

  let url = configs.get().reportUrl + '?data=' + JSON.stringify({
    type,
    ...data,
    namespace: configs.get().namespace
  });

  if (mini) {
    configs.get().global.request({
      url
    });
  } else {
    let image = new Image();
    image.src = url;
    on(image, 'load error complete', () => {
      document.body.removeChild(image);
      image = null;
    });
    document.body.appendChild(image);
  }
};

export const ifTimeoutReport = (time: number, type: types, data: object) => {
  let duration = now() - time;

  duration > configs.get().timeoutCheck && report(type, {
    ...data,
    duration
  });
};