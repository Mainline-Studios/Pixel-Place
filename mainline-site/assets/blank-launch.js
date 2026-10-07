/* Opens HTML games in an about:blank tab with a full-viewport iframe.
   Usage: <a href="GAME_URL" data-blank-launch data-game-title="Name">. Falls back to the normal href if popups are blocked. */
(function () {
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-blank-launch]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var url = new URL(a.getAttribute('href'), location.href).href;
    var title = a.getAttribute('data-game-title') || 'game';
    var w = window.open('about:blank', '_blank');
    if (!w) return; // popup blocked: let the normal link work
    e.preventDefault();
    var src = a.getAttribute('data-blank-src');
    if (src) {
      // Raw mode: fetch the game's HTML (CORS-enabled CDN) and write it straight into about:blank.
      src = new URL(src, location.href).href;
      var base = src.replace(/[^\/]*$/, '');
      try { w.opener = null; w.document.title = 'loading ' + title + '…'; } catch (err) {}
      fetch(src).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.text();
      }).then(function (html) {
        var tag = '<base href="' + esc(base) + '">';
        html = /<head[^>]*>/i.test(html) ? html.replace(/<head[^>]*>/i, function (m) { return m + tag; }) : tag + html;
        w.document.open();
        w.document.write(html);
        w.document.close();
        if (!w.document.title) w.document.title = title + ' · mainline';
      }).catch(function () {
        try { w.location.href = url; } catch (err) { location.href = url; }
      });
      return;
    }
    try {
      w.opener = null;
      w.document.open();
      w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>' + esc(title) + ' · mainline</title>' +
        '<style>html,body{margin:0;padding:0;height:100%;overflow:hidden;background:#000}iframe{display:block;border:0;width:100vw;height:100vh}</style></head>' +
        '<body><iframe src="' + esc(url) + '" allow="fullscreen; autoplay; gamepad; clipboard-write" allowfullscreen></iframe></body></html>');
      w.document.close();
    } catch (err) {
      w.location.href = url;
    }
  });
})();
