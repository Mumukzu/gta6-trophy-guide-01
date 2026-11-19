// Leonida Trophy Atlas — guide + tracker for the 55 GTA VI trophies.
// Progress saves in localStorage; export writes a file, import reads one back.
// Spoiler mode hides the 28 hidden trophies' names, descriptions and guides
// until they are earned. No network: the only file it loads is data/trophies.json.
const KEY = 'gta6-trophy-guide-earned';
const SPOILER_KEY = 'gta6-trophy-guide-spoiler';

const STAGES = [
  { n: 1, title: 'Stage 1 — Play the story', text: 'Chapters 1–5, every story mission and every character\u2019s final mission. The 17 story trophies pop as you play; nothing here can be missed. Do meditate at Lucia\u2019s balcony in Chapter 1 — it counts toward the one missable trophy.' },
  { n: 2, title: 'Stage 2 — Grab it while you play', text: 'The one-offs and the cryptic ones: the missable meditation spots, the partner trophies, the airport, the tanks and the odd encounters. Do these as they come up, before the story moves on.' },
  { n: 3, title: 'Stage 3 — Activities & challenges', text: 'Stunts, shooting range, drone races, races, fishing, arcade, stranger strands, challenges and Combat Focus. Grind these once the map is open.' },
  { n: 4, title: 'Stage 4 — Collectibles & money', text: 'Cards, WAiNK spots, vehicles, every area of Leonida, garages, registrations, laundering and spending. Mop these up with the map as your checklist.' },
  { n: 5, title: 'Stage 5 — Robberies & the platinum', text: 'Bank vaults, armored trucks, one illegal operation per gang — then 100% completion, then the platinum.' },
];

const KIND_LABELS = { story: 'Story', missable: 'Missable', collectibles: 'Collectibles', activities: 'Activities', meta: 'Meta' };

const cardsEl = document.getElementById('cards');
const emptyEl = document.getElementById('empty');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('grade');
const kindEl = document.getElementById('kind');
const spoilerEl = document.getElementById('spoiler');
const filterLineEl = document.getElementById('filter-line');

let earned = new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]'));
let trophies = [];
let spoilerOn = localStorage.getItem(SPOILER_KEY) === '1';
spoilerEl.checked = spoilerOn;

function save() {
  localStorage.setItem(KEY, JSON.stringify([...earned]));
  localStorage.setItem(SPOILER_KEY, spoilerOn ? '1' : '0');
}

function gradeCounts() {
  const c = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of trophies) if (earned.has(t.name)) c[t.grade]++;
  return c;
}

function renderProgress() {
  const total = trophies.length;
  const n = earned.size;
  document.getElementById('earned-count').textContent = n;
  document.getElementById('progress-line').textContent = `${n} of ${total} earned`;
  document.getElementById('bar-fill').style.width = total ? `${Math.round((n / total) * 100)}%` : '0%';
  const g = gradeCounts();
  document.getElementById('grades-line').textContent =
    `Platinum ${g.platinum}/1 · Gold ${g.gold}/2 · Silver ${g.silver}/6 · Bronze ${g.bronze}/46`;
}

function renderRoadmap() {
  const ol = document.getElementById('stages');
  ol.replaceChildren();
  for (const s of STAGES) {
    const inStage = trophies.filter((t) => t.stage === s.n);
    const got = inStage.filter((t) => earned.has(t.name)).length;
    const li = document.createElement('li');
    const h = document.createElement('h3');
    h.textContent = s.title;
    const p = document.createElement('p');
    p.textContent = s.text;
    const c = document.createElement('span');
    c.className = 'stage-count';
    c.textContent = `${got} of ${inStage.length} earned in this stage`;
    li.append(h, p, c);
    ol.append(li);
  }
}

function matches(t) {
  const q = searchEl.value.trim().toLowerCase();
  if (q) {
    const hay = `${t.name} ${t.description} ${t.guide} ${t.kind}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
  if (kindEl.value !== 'all' && t.kind !== kindEl.value) return false;
  return true;
}

function renderCards() {
  cardsEl.replaceChildren();
  let shown = 0;
  for (const t of trophies) {
    if (!matches(t)) continue;
    shown++;
    const isEarned = earned.has(t.name);
    const hiddenNow = spoilerOn && t.hidden && !isEarned;
    const card = document.createElement('article');
    card.className = 'card' + (isEarned ? ' earned' : '');
    const head = document.createElement('div');
    head.className = 'card-head';
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = isEarned;
    box.setAttribute('aria-label', `Mark ${t.name} as earned`);
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.name);
      else earned.delete(t.name);
      save();
      renderProgress();
      renderRoadmap();
      renderCards();
    });
    const title = document.createElement('div');
    title.className = 'card-title';
    if (hiddenNow) {
      title.textContent = 'Hidden trophy — earn it to reveal';
    } else {
      title.textContent = t.name;
      const badge = document.createElement('span');
      badge.className = `grade grade-${t.grade}`;
      badge.textContent = t.grade;
      title.append(badge);
    }
    head.append(box, title);
    card.append(head);
    if (!hiddenNow) {
      const desc = document.createElement('p');
      desc.className = 'desc';
      desc.textContent = t.description;
      card.append(desc);
    }
    const tags = document.createElement('div');
    tags.className = 'tags';
    const kindTag = document.createElement('span');
    kindTag.className = 'tag';
    kindTag.textContent = KIND_LABELS[t.kind] ?? t.kind;
    tags.append(kindTag);
    if (t.hidden) {
      const h = document.createElement('span');
      h.className = 'tag tag-hidden';
      h.textContent = 'Hidden on PSN';
      tags.append(h);
    }
    if (t.missable) {
      const m = document.createElement('span');
      m.className = 'tag tag-missable';
      m.textContent = 'Possibly missable';
      tags.append(m);
    }
    if (t.count != null) {
      const c = document.createElement('span');
      c.className = 'tag tag-count';
      c.textContent = typeof t.count === 'number' && t.count >= 1000
        ? `Target: $${t.count.toLocaleString('en-US')}`
        : `Target: ${t.count}`;
      tags.append(c);
    }
    const stageTag = document.createElement('span');
    stageTag.className = 'tag';
    stageTag.textContent = `Roadmap stage ${t.stage}`;
    tags.append(stageTag);
    card.append(tags);
    if (hiddenNow) {
      const mask = document.createElement('p');
      mask.className = 'spoiler-mask';
      mask.textContent = 'Its name, description and guide stay hidden until you earn it — turn off “Hide spoilers” to see it, or tick the box once you have it.';
      card.append(mask);
    } else {
      const guide = document.createElement('p');
      guide.className = 'guide';
      const strong = document.createElement('strong');
      strong.textContent = 'How to get it: ';
      guide.append(strong, document.createTextNode(t.guide));
      card.append(guide);
      const src = document.createElement('p');
      src.className = 'source';
      src.textContent = 'Source: ';
      const a = document.createElement('a');
      a.href = t.sourceUrl;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = t.source;
      src.append(a);
      card.append(src);
    }
    cardsEl.append(card);
  }
  emptyEl.hidden = shown !== 0;
  filterLineEl.textContent = `Showing ${shown} of ${trophies.length} trophies` +
    (spoilerOn ? ' · spoiler mode on (28 hidden trophies masked until earned)' : '');
}

document.getElementById('export').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify([...earned], null, 2)], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
document.getElementById('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const names = new Set(trophies.map((t) => t.name));
    earned = new Set((Array.isArray(data) ? data : []).filter((n) => names.has(n)));
    save();
    renderProgress();
    renderRoadmap();
    renderCards();
  } catch {
    alert('That file is not a valid progress export.');
  }
  e.target.value = '';
});
searchEl.addEventListener('input', renderCards);
gradeEl.addEventListener('change', renderCards);
kindEl.addEventListener('change', renderCards);
spoilerEl.addEventListener('change', () => {
  spoilerOn = spoilerEl.checked;
  save();
  renderCards();
});

const doc = await (await fetch('data/trophies.json')).json();
trophies = doc.trophies;
renderProgress();
renderRoadmap();
renderCards();
