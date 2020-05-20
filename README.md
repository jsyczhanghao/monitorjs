# monitorjs

一个全自动的页面监控工具，收集页面报错，异步请求和jsonp加载超时，首屏加载性能，支持SPA

```html
<script src="monitor.js"></script>
<script>
window.monitorjs.init({
  namespace: 'main-site', //指定一个唯一命名空间，用于区分项目
  timeoutCheck: 600,  //异步请求的超时上报
  reportUrl: '/', //上报地址
  percent: 1, //收集比例，默认100%， 可指定只收集1%， percent: 0.01
  fs: {
    enable: false,  //默认关闭首屏性能收集
    root: 'root', //根节点id
    startParam: 'fs_start', //url中的参数名，用于指定页面加载开始时间戳，如需统计从上个页面用户开始点击开始算作请求起始时间，不指定则使用performance.timing.navigationStart
    maxSpace: 50, //最大元素间距，用于判定首屏是否加载成功的一个重要标识。
  }
});
</script>
```

开启首屏性能收集时需要指定每个页面的首屏监控元素
```html
<div>
  <!--指定该元素为首屏监控元素，当这个元素内节点加载高度超过1个屏幕时，则判定首屏加载成功， 包括异步请求-->
  <div data-monitorjs-fs="main-page/*指定一个页面唯一标识*/">
  balabala....
  </div>

  .....
</div>
```