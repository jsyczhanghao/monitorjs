import {
  now,
  on
} from './helper';
import configs from './configs';
import types from './types';

export const report = (type: types, data: object) => {
  if (Math.random() > configs.get().percent) return ;

  let image = new Image();
  image.src = configs.get().reportUrl + '?type=' + type + '&data=' + JSON.stringify({
    ...data,
    namespace: configs.get().namespace
  }) + '&timestamp=' + now();
  on(image, 'load error complete', () => {
    document.body.removeChild(image);
    image = null;
  });
  document.body.appendChild(image);
};

export const ifTimeoutReport = (time: number, type: types, data: object) => {
  let duration = now() - time;

  duration > configs.get().timeoutCheck && report(type, {
    ...data,
    duration
  });
};