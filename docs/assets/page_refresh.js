// because of how gitbook uses history, we need to remove and re-add any scripts
// on the page to make sure the examples reload

function rerunScripts() {
  console.log(document.body.getElementsByTagName('script'));
  Array.from(document.body.getElementsByTagName('script')).forEach((el) => {
    if (el.src.includes('gitbook')) return;
    let parent = el.parentNode;
    el.remove();
    setTimeout(() => parent.appendChild(el));
  });
}

window.history.pushState = new Proxy(window.history.pushState, {
  apply: (target, thisArg, argArray) => {
    setTimeout(rerunScripts, 100);
    return target.apply(thisArg, argArray);
  },
});

window.addEventListener('popstate', () => {
  setTimeout(rerunScripts, 100);
});
