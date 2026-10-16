/*
 * Counts this page view on our traffic dashboard (enderphone-api lib/traffic.mjs). No cookies and
 * nothing stored on this device: it sends the page address and where you came from, once per page.
 * The same file is in each of our sites - keep the copies identical.
 */
(function () {
  var END = 'https://api.enderphone.cloud/v1/t';
  if (navigator.webdriver || location.protocol === 'file:' || /^(localhost|127\.|\[::1\]|.*\.(localhost|test)$)/.test(location.hostname)) return;
  var last = '';
  function send(ref) {
    var url = location.href.split('#')[0];
    if (url === last) return;
    var body = JSON.stringify({ u: url, r: ref });
    last = url;
    try {
      if (navigator.sendBeacon && navigator.sendBeacon(END, new Blob([body], { type: 'text/plain' }))) return;
    } catch (e) { /* fall through */ }
    try { fetch(END, { method: 'POST', body: body, keepalive: true, mode: 'no-cors', credentials: 'omit' }); } catch (e) { /* not counted */ }
  }
  send(document.referrer);
  // Pages that change address without loading (history.pushState) count each address once; the
  // page they came from is the referrer, so they read as a visit from the same site.
  var push = history.pushState;
  history.pushState = function () { var from = location.href; var out = push.apply(this, arguments); send(from); return out; };
  addEventListener('popstate', function () { send(last); });
})();
