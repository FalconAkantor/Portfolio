/* AUTOMARIZA promo — tiny helpers shared by the scenes (loaded once by the root composition). */
(function () {
  const AMZ = {
    tall() {
      return document.documentElement.classList.contains('tall');
    },

    /** Calls fn(t) on every seek, evented or not, through a tweened accessor. */
    drive(tl, duration, fn) {
      const d = {
        _t: 0,
        get t() {
          return this._t;
        },
        set t(v) {
          this._t = v;
          fn(v);
        },
      };
      tl.fromTo(d, { t: 0 }, { t: duration, duration, ease: 'none', immediateRender: false }, 0);
    },

    /** Returns a painter that types `text` into `el` from `start`, `step` s per char. */
    typer(el, text, start, step, caret = '|') {
      return (t) => {
        const n = Math.max(0, Math.min(text.length, Math.floor((t - start) / step) + 1));
        const typing = t >= start && n < text.length;
        const blink = t >= start && Math.floor(t * 2.2) % 2 === 0;
        el.textContent = t < start ? '' : text.slice(0, n) + (typing || blink ? caret : '');
      };
    },

    /** Standard choreography of a system scene: header, title, stage, steps, exit. */
    sysFrame(tl, p, { steps = [1.0, 2.0, 3.0], exit = 5.6 } = {}) {
      tl.fromTo(`#${p}-head`, { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.5, ease: 'expo.out' }, 0.05);
      tl.fromTo(`#${p}-title`, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out' }, 0.15);
      tl.fromTo(`#${p}-stage`, { opacity: 0, y: 40, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'expo.out' }, 0.2);
      const items = document.querySelectorAll(`#${p}-steps li`);
      items.forEach((li, i) => {
        tl.fromTo(li, { opacity: 0, x: -24 }, { opacity: 1, x: 0, duration: 0.5, ease: 'expo.out' }, steps[i]);
        const n = li.querySelector('.n');
        tl.fromTo(n, { backgroundColor: 'rgba(242,169,59,0)', color: '#f2a93b' }, { backgroundColor: 'rgba(242,169,59,1)', color: '#05070a', duration: 0.3 }, steps[i] + 0.35);
      });
      tl.to(`#${p}`, { y: -50, opacity: 0, filter: 'blur(10px)', duration: 0.4, ease: 'power2.in' }, exit);
    },
  };
  window.AMZ = AMZ;
})();
