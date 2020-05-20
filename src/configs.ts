let configs = {
  namespace: 'main-site',
  timeoutCheck: 600,
  reportUrl: '/',
  percent: 1,
  fs: {
    enable: false,
    root: 'root',
    startParam: 'fs_start',
    maxSpace: 50,
  }
};

export default {
  get: () => configs,
  set: (cfgs: object) => {
    configs = {
      ...configs,
      ...cfgs,
      fs: {
        ...configs.fs,
        ...(cfgs['fs'] || {})
      },
    };
  }
};