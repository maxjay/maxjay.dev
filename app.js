// The only JavaScript on the site: the filter, the arrow keys and the scramble.
// Every page is complete without it.

const q = document.getElementById('q');
const rows = [...document.querySelectorAll('#rows a')];
let shown = rows, sel = 0;

const SYMBOLS = '!#$%&*+/<=>?@\\^~';
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

// A censored word reshuffles for half a second. It never repeats a symbol twice in a row.
function scramble(el) {
  if (!el || still || el.dataset.busy) return;
  el.dataset.busy = 1;
  let n = 0;
  const timer = setInterval(() => {
    let last = '';
    el.textContent = [...el.textContent].map(() => {
      let s;
      do s = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]; while (s === last);
      return (last = s);
    }).join('');
    if (++n === 9) { clearInterval(timer); delete el.dataset.busy; }
  }, 55);
}

// The page takes the selected row's colour, and its mark is drawn large under the list.
function select(i) {
  sel = Math.max(0, Math.min(i, shown.length - 1));
  const row = shown[sel];
  rows.forEach((a) => a.classList.toggle('on', a === row));
  document.getElementById('big').replaceChildren(...(row ? [row.querySelector('svg').cloneNode(true)] : []));
  if (!row) return;
  document.documentElement.style.setProperty('--h', row.dataset.h);
  scramble(row.querySelector('.cz'));
}

function filter() {
  const text = q.value.trim().toLowerCase();
  shown = rows.filter((a) => !(a.parentElement.hidden = !a.dataset.name.includes(text)));
  document.getElementById('none').hidden = shown.length > 0;
  select(0);
}

addEventListener('mouseover', (ev) => scramble(ev.target.closest?.('.cz')));
document.querySelectorAll('.cz').forEach(scramble); // the build's symbols are fixed, so reshuffle on load

if (q) {
  q.addEventListener('input', filter);
  document.getElementById('rows').addEventListener('mousemove', (ev) => {
    const i = shown.indexOf(ev.target.closest('a'));
    if (i >= 0 && i !== sel) select(i);
  });
  // On a touch screen, focusing the box would open the keyboard over the list.
  if (!matchMedia('(pointer: coarse)').matches) q.focus();
  select(0);
}

addEventListener('keydown', (ev) => {
  if (!q) { if (ev.key === 'Escape') location.href = '/'; return; }
  if (ev.key === 'Escape') { q.value = ''; filter(); }
  else if (ev.key === 'ArrowDown') { select(sel + 1); ev.preventDefault(); }
  else if (ev.key === 'ArrowUp') { select(sel - 1); ev.preventDefault(); }
  else if (ev.key === 'Enter' && shown[sel]) location.href = shown[sel].href;
  else if (ev.key.length === 1 && !ev.ctrlKey && !ev.metaKey) q.focus();
});
