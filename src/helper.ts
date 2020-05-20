//@ts-ignore
const MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

export const now = Date.now.bind(Date);
export const on = (element: any, event: string, callback: Function) => {
  event.split(' ').forEach((e) => {
    element.addEventListener(e, callback);
  });
};

export const observer = (target: HTMLElement, callback: MutationCallback, subtree: boolean = false) => {
  const observer = new MutationObserver(callback);
  observer.observe(target, {
    childList: true,
    subtree
  });
  return observer;
}

export const $ = (selector: string) : HTMLElement => {
  return document.querySelector(selector);
}