// Leonida Field Guide — tracker: checklist saved in localStorage, kind and grade
// filters, a spoiler mode that hides story trophies until earned, export and
// import of progress, and a detail pane with each trophy's cited guide.
const EARNED_KEY = 'leonida-field-guide-earned-v1';
const SPOILER_KEY = 'leonida-field-guide-spoiler-v1';
const cardsEl = document.getElementById('cards');
const detailBody = document.getElementById('detailBody');
const progressText = document.getElementById('progressText');
const progressPct = document.getElementById('progressPct');
const progressFill = document.getElementById('progressFill');
const gradeCounts = document.getElementById('gradeCounts');
const showingLine = document.getElementById('showingLine');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('grade');
const spoilerEl = document.getElementById('spoiler');
const hideEarnedEl = document.getElementById('hideEarned');

let trophies = [];
let earned = new Set(readStored(EARNED_KEY));
let kindFilter = 'all';
let selectedName = null;

// Spoiler mode is ON by default: a first-time reader sees no story names at all.
let spoilerOn = localStorage.getItem(SPOILER_KEY);
spoilerOn = spoilerOn === null ? true : spoilerOn === 'true';
spoilerEl.checked = spoilerOn;

function readStored(key) {
  try { return JSON.parse(localStorage.getItem(key) ?? '[]'); } catch { return []; }
}

function saveEarned() {
  localStorage.setItem(EARNED_KEY, JSON.stringify([...earned].sort()));
}

function medalLetter(grade) {
  return grade === 'platinum' ? 'P' : grade === 'gold' ? 'G' : grade === 'silver' ? 'S' : 'B';
}

function isSpoilerHidden(t) {
  return spoilerOn && t.kind === 'story' && !earned.has(t.name);
}

function matchesFilters(t) {
  if (kindFilter === 'story' && t.kind !== 'story') return false;
  if (kindFilter === 'missable' && !t.missable) return false;
  if (kindFilter === 'collectibles' && !t.collectible) return false;
  if (kindFilter === 'activities' && t.kind !== 'activities') return false;
  if (kindFilter === 'heists' && t.kind !== 'heists') return false;
  if (kindFilter === 'cars' && t.kind !== 'cars') return false;
  if (kindFilter === 'hidden' && !t.hidden) return false;
  if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
  if (hideEarnedEl.checked && earned.has(t.name)) return false;
  const q = searchEl.value.trim().toLowerCase();
  if (q && !(t.name + ' ' + t.description + ' ' + t.guide + ' ' + t.earliest).toLowerCase().includes(q)) return false;
  return true;
}

function badgeHtml(t) {
  const parts = [`<span class="badge grade-${t.grade}">${t.grade}</span>`];
  if (t.kind !== 'platinum') parts.push(`<span class="badge">${t.kind}</span>`);
  if (t.hidden) parts.push('<span class="badge hidden-flag">Hidden on PS5</span>');
  if (t.missable) parts.push('<span class="badge miss">Missable</span>');
  if (t.unconfirmed) parts.push('<span class="badge unconfirmed">Method unconfirmed</span>');
  if (t.count) parts.push(`<span class="badge">Count: ${t.count.toLocaleString('en-US')}</span>`);
  return parts.join('');
}

function renderCards() {
  const shown = trophies.filter(matchesFilters);
  cardsEl.replaceChildren();
  for (const t of shown) {
    const li = document.createElement('li');
    li.className = 'card' + (earned.has(t.name) ? ' earned' : '') + (selectedName === t.name ? ' selected' : '');
    li.dataset.name = t.name;
    const hidden = isSpoilerHidden(t);
    const title = hidden
      ? '<span class="spoilered">Hidden story trophy — earn it to reveal its name</span>'
      : `${earned.has(t.name) ? '<span class="tick">&#10003; </span>' : ''}${escapeHtml(t.name)}`;
    const desc = hidden
      ? '<p class="desc spoilered">Hidden until earned (spoiler mode is on).</p>'
      : `<p class="desc">${escapeHtml(t.description)}</p>`;
    const guide = hidden
      ? '<p class="guide-line spoilered">Guide hidden until earned.</p>'
      : `<p class="guide-line">${escapeHtml(t.guide)}</p><p class="src-line">Sources: ${escapeHtml(t.sources.join('; '))}</p>`;
    li.innerHTML = `<div class="card-top"><span class="medal ${t.grade}" aria-hidden="true">${medalLetter(t.grade)}</span>`
      + `<div><h3>${title}</h3>${desc}<div class="badges">${badgeHtml(t)}</div>`
      + `<p class="earliest">Earliest: ${escapeHtml(t.earliest)}</p>${guide}</div>`
      + `<label class="earn-box" title="Mark this trophy earned"><input type="checkbox" ${earned.has(t.name) ? 'checked' : ''} aria-label="Earned: ${escapeHtml(t.name)}"> Earned</label></div>`;
    li.querySelector('.earn-box input').addEventListener('click', (event) => {
      // The tick must not also open the guide: stop the click reaching the card.
      event.stopPropagation();
    });
    li.querySelector('.earn-box input').addEventListener('change', (event) => {
      event.stopPropagation();
      // Let the browser finish the tick before the list re-renders.
      setTimeout(() => toggleEarned(t.name), 0);
    });
    li.addEventListener('click', () => {
      selectedName = t.name;
      renderDetail(t);
      renderCards();
      document.getElementById('detailPanel').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
    cardsEl.append(li);
  }
  showingLine.textContent = `Showing ${shown.length} of ${trophies.length} trophies`
    + (spoilerOn ? ' · spoiler mode on: story trophies stay hidden until earned' : ' · spoiler mode off');
}

function renderDetail(t) {
  if (!t) { detailBody.innerHTML = '<p class="detail-empty">Click a trophy in the checklist to read its guide, where and how, when it can be missed, and its sources.</p>'; return; }
  const hidden = isSpoilerHidden(t);
  const isEarned = earned.has(t.name);
  detailBody.innerHTML = hidden
    ? `<span class="medal ${t.grade}" aria-hidden="true">${medalLetter(t.grade)}</span>`
      + '<h3>Hidden story trophy</h3><p class="desc spoilered">Spoiler mode is on. Earn this trophy to reveal its name, description and guide.</p>'
      + `<p class="src-line">Grade: ${escapeHtml(t.grade)} · Earliest: ${escapeHtml(t.earliest)}</p>`
    : `<span class="medal ${t.grade}" aria-hidden="true">${medalLetter(t.grade)}</span>`
      + `<h3>${escapeHtml(t.name)}</h3><p class="desc">${escapeHtml(t.description)}</p>`
      + `<div class="badges">${badgeHtml(t)}</div>`
      + `<p class="earliest">Earliest: ${escapeHtml(t.earliest)}</p>`
      + `<p class="guide-full">${escapeHtml(t.guide)}</p>`
      + `<p class="src-line">Sources: ${escapeHtml(t.sources.join('; '))}</p>`
      + `<button type="button" class="earn-btn" id="detailToggle">${isEarned ? 'Mark as not earned' : 'Mark as earned'}</button>`;
  const btn = document.getElementById('detailToggle');
  if (btn) btn.addEventListener('click', () => { toggleEarned(t.name); });
}

function toggleEarned(name) {
  if (earned.has(name)) earned.delete(name);
  else earned.add(name);
  saveEarned();
  renderProgress();
  renderCards();
  const t = trophies.find((x) => x.name === name);
  if (t) renderDetail(t);
}

function renderProgress() {
  const n = earned.size;
  const total = trophies.length || 55;
  progressText.textContent = `${n} of ${total} earned`;
  progressPct.textContent = `${Math.round((n / total) * 100)}%`;
  progressFill.style.width = `${(n / total) * 100}%`;
  const byGrade = {};
  for (const g of ['platinum', 'gold', 'silver', 'bronze']) {
    byGrade[g] = trophies.filter((t) => t.grade === g && earned.has(t.name)).length;
    byGrade[g + 'Total'] = trophies.filter((t) => t.grade === g).length;
  }
  gradeCounts.textContent = `Platinum ${byGrade.platinum}/${byGrade.platinumTotal} · Gold ${byGrade.gold}/${byGrade.goldTotal} · Silver ${byGrade.silver}/${byGrade.silverTotal} · Bronze ${byGrade.bronze}/${byGrade.bronzeTotal}`;
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function download(filename, text) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

document.getElementById('exportBtn').addEventListener('click', () => {
  download('leonida-field-guide-progress.json', JSON.stringify({ game: 'Grand Theft Auto VI', earned: [...earned].sort() }, null, 2));
});

document.getElementById('importFile').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const names = Array.isArray(data) ? data : data.earned;
    if (!Array.isArray(names)) throw new Error('bad file');
    earned = new Set(names.filter((n) => trophies.some((t) => t.name === n)));
    saveEarned();
    renderProgress();
    renderCards();
    renderDetail(selectedName ? trophies.find((t) => t.name === selectedName) : null);
  } catch {
    alert('That file is not a Leonida Field Guide progress export.');
  }
  event.target.value = '';
});

document.getElementById('resetBtn').addEventListener('click', () => {
  if (!confirm('Clear all earned trophies?')) return;
  earned = new Set();
  saveEarned();
  renderProgress();
  renderCards();
  renderDetail(null);
});

document.getElementById('jumpMissable').addEventListener('click', () => {
  kindFilter = 'all';
  document.querySelectorAll('#kindChips .chip').forEach((c) => c.classList.toggle('active', c.dataset.kind === 'all'));
  const t = trophies.find((x) => x.name === 'Positive Mental Attitude');
  selectedName = t.name;
  renderCards();
  renderDetail(t);
  document.querySelector(`[data-name="${CSS.escape(t.name)}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

document.getElementById('kindChips').addEventListener('click', (event) => {
  const btn = event.target.closest('.chip');
  if (!btn) return;
  kindFilter = btn.dataset.kind;
  document.querySelectorAll('#kindChips .chip').forEach((c) => c.classList.toggle('active', c === btn));
  renderCards();
});

searchEl.addEventListener('input', renderCards);
gradeEl.addEventListener('change', renderCards);
hideEarnedEl.addEventListener('change', renderCards);
spoilerEl.addEventListener('change', () => {
  spoilerOn = spoilerEl.checked;
  localStorage.setItem(SPOILER_KEY, String(spoilerOn));
  renderCards();
  renderDetail(selectedName ? trophies.find((t) => t.name === selectedName) : null);
});

// Clicking a card's medal area toggles earned too: the whole card opens the
// guide, and the detail pane's button flips earned state.
cardsEl.addEventListener('dblclick', (event) => {
  const card = event.target.closest('.card');
  if (card) toggleEarned(card.dataset.name);
});

const doc = await (await fetch('data/trophies.json')).json();
trophies = doc.trophies;
renderProgress();
renderCards();
renderDetail(null);
