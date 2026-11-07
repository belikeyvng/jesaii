(function () {
  var c = document.getElementById('wave');
  var now = document.getElementById('now');
  var ctx = c.getContext('2d');
  var cs = getComputedStyle(document.documentElement);
  var ACCENT = cs.getPropertyValue('--accent').trim() || '#f2b84b';
  var PLAYED = cs.getPropertyValue('--bar-played').trim() || '#8c6b2d';
  var DIM = cs.getPropertyValue('--bar-dim').trim() || '#292660';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var w = 0, h = 0;

  function size() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var r = c.getBoundingClientRect();
    w = r.width; h = r.height;
    c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function bar(x, y, bw, bh) {
    if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(x, y, bw, bh, 1.5); ctx.fill(); }
    else { ctx.fillRect(x, y, bw, bh); }
  }

  function draw(t, ph) {
    ctx.clearRect(0, 0, w, h);
    var step = 6, bw = 3;
    var n = Math.max(10, Math.floor((w + step - bw) / step));
    var x0 = (w - (n * step - (step - bw))) / 2;
    var mid = h / 2;
    for (var i = 0; i < n; i++) {
      var p = i / (n - 1);
      var env = Math.pow(Math.sin(p * Math.PI), 0.7) * 0.85 + 0.15;
      var a = Math.sin(i * 0.37 + t * 1.5) * 0.5 + Math.sin(i * 0.13 - t * 0.9) * 0.35 + Math.sin(i * 0.83 + t * 2.4) * 0.15;
      var amp = (0.16 + 0.84 * Math.abs(a)) * env;
      var bh = Math.max(3, amp * h * 0.92);
      var d = Math.abs(p - ph);
      ctx.fillStyle = d < 0.012 ? ACCENT : (p < ph ? PLAYED : DIM);
      bar(x0 + i * step, mid - bh / 2, bw, bh);
    }
    var px = x0 + ph * (n * step);
    ctx.fillStyle = ACCENT;
    ctx.fillRect(px, 0, 1.5, h);
  }

  function clock(ph) {
    var s = Math.floor(ph * 180);
    now.innerHTML = '<b>' + Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0') + '</b>';
  }

  size();
  window.addEventListener('resize', function () { size(); if (reduce) draw(1.2, 0.38); });

  if (reduce) { draw(1.2, 0.38); clock(0.38); return; }

  var start = performance.now();
  function frame(now) {
    var t = (now - start) / 1000;
    var ph = (t / 36) % 1;
    draw(t, ph);
    clock(ph);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();


(function () {
  var btns = document.querySelectorAll('.copy');
  Array.prototype.forEach.call(btns, function (b) {
    b.addEventListener('click', function () {
      var text = b.getAttribute('data-copy');
      var done = function (msg) {
        b.textContent = msg;
        setTimeout(function () { b.textContent = 'Copy'; }, 1600);
      };
      var fallback = function () {
        var link = b.previousElementSibling;
        try {
          var node = b.parentElement.querySelector('.cval');
          var range = document.createRange();
          range.selectNodeContents(node);
          var sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
          done('Selected');
        } catch (e) { done('Copy'); }
      };
      try {
        navigator.clipboard.writeText(text).then(function () { done('Copied'); }, fallback);
      } catch (e) { fallback(); }
    });
  });
})();
