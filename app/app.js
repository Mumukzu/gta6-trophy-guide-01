// Leonida Trophy Atlas — guide + tracker for the 55 GTA VI trophies.
// Progress lives in localStorage; export writes a file, import reads one back.
// Spoiler mode masks the 28 hidden trophies until they are earned.
// Offline: the only file it loads is data/trophies.json. No network requests.
const DATA_URL = 'data/trophies.json';
const LS_EARNED = 'leonida-atlas-earned-v1';
const LS_SPOILER = 'leonida-atlas-spoiler-v1';

const ROADMAP = [
  { stage: 1, heading: 'Stage 1 — Play the story', body: 'Chapters 1 to 5, every story mission and each character\u2019s final mission. The 17 story trophies pop as you play; nothing here can be missed. Do meditate at Lucia\u2019s balcony in Chapter 1 — it counts toward the one missable trophy.' },
  { stage: 2, heading: 'Stage 2 — Grab it while you play', body: 'The one-offs and the cryptic ones: the missable meditation spots, the partner trophies, the airport, the tanks and the odd encounters. Do these as they come up, before the story moves on.' },
  { stage: 3, heading: 'Stage 3 — Activities and challenges', body: 'Stunts, shooting range, drone races, races, fishing, arcade, stranger strands, challenges and Combat Focus. Grind these once the map is open.' },
  { stage: 4, heading: 'Stage 4 — Collectibles and money', body: 'Cards, WAiNK spots, vehicles, every area of Leonida, garages, registrations, laundering and spending. Mop these up with the map as your checklist.' },
  { stage: 5, heading: 'Stage 5 — Robberies and the platinum', body: 'Bank vaults, armored trucks, one illegal operation per gang — then 100% completion, then the platinum.' },
];

const KIND_NAMES = { story: 'Story', missable: 'Missable', collectibles: 'Collectibles', activities: 'Activities', meta: 'Meta' };

const state = {
  trophies: [],
  earned: new Set(readEarned()),
  spoiler: localStorage.getItem(LS_SPOILER) === '1',
};

function readEarned() {
  try {
    const raw = JSON.parse(localStorage.getItem(LS_EARNED) ?? '[]');
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function persist() {
  localStorage.setItem(LS_EARNED, JSON.stringify([...state.earned]));
  localStorage.setItem(LS_SPOILER, state.spoiler ? '1' : '0');
}

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function countByGrade() {
  const out = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const trophy of state.trophies) {
    if (state.earned.has(trophy.name)) out[trophy.grade] += 1;
  }
  return out;
}

function renderScore() {
  const total = state.trophies.length;
  const got = state.earned.size;
  document.getElementById('earned-total').textContent = got;
  document.getElementById('earned-caption').textContent = `${got} of ${total} earned`;
  document.getElementById('score-fill').style.width = total ? `${Math.round((got / total) * 100)}%` : '0%';
  const byGrade = countByGrade();
  document.getElementById('score-grades').textContent =
    `Platinum ${byGrade.platinum}/1 · Gold ${byGrade.gold}/2 · Silver ${byGrade.silver}/6 · Bronze ${byGrade.bronze}/46`;
}

function renderStages() {
  const list = document.getElementById('stage-list');
  list.replaceChildren();
  for (const step of ROADMAP) {
    const inStep = state.trophies.filter((t) => t.stage === step.stage);
    const done = inStep.filter((t) => state.earned.has(t.name)).length;
    const item = document.createElement('li');
    const title = document.createElement('h3');
    title.textContent = step.heading;
    const text = document.createElement('p');
    text.textContent = step.body;
    const progress = document.createElement('span');
    progress.className = 'stage-progress';
    progress.textContent = `${done} of ${inStep.length} earned in this stage`;
    item.append(title, text, progress);
    list.append(item);
  }
}

function tagHtml(trophy) {
  const tags = [`<span class="tag">${escapeHtml(KIND_NAMES[trophy.kind] ?? trophy.kind)}</span>`];
  if (trophy.hidden) tags.push('<span class="tag is-hidden">Hidden on PSN</span>');
  if (trophy.missable) tags.push('<span class="tag is-missable">Possibly missable</span>');
  if (trophy.count != null) {
    const label = typeof trophy.count === 'number' && trophy.count >= 1000
      ? `Target: $${trophy.count.toLocaleString('en-US')}`
      : `Target: ${trophy.count}`;
    tags.push(`<span class="tag is-count">${escapeHtml(label)}</span>`);
  }
  tags.push(`<span class="tag">Roadmap stage ${trophy.stage}</span>`);
  return tags.join('');
}

function cardHtml(trophy) {
  const earned = state.earned.has(trophy.name);
  const masked = state.spoiler && trophy.hidden && !earned;
  const name = masked
    ? 'Hidden trophy — earn it to reveal'
    : `${escapeHtml(trophy.name)}<span class="grade-chip">${escapeHtml(trophy.grade)}</span>`;
  const desc = masked ? '' : `<p class="trophy-desc">${escapeHtml(trophy.description)}</p>`;
  const body = masked
    ? `<p class="spoiler-note">Its name, description and guide stay hidden until you earn it — turn off “Hide spoilers” to see it, or tick the box once you have it.</p>`
    : `<p class="trophy-guide"><strong>How to get it:</strong> ${escapeHtml(trophy.guide)}</p>
       <p class="trophy-source">Source: <a href="${escapeHtml(trophy.sourceUrl)}" target="_blank" rel="noopener">${escapeHtml(trophy.source)}</a></p>`;
  return `<article class="trophy-card grade-${escapeHtml(trophy.grade)}${earned ? ' is-earned' : ''}">
    <div class="trophy-head">
      <input type="checkbox" data-name="${escapeHtml(trophy.name)}" ${earned ? 'checked' : ''} aria-label="Mark ${escapeHtml(trophy.name)} as earned">
      <div class="trophy-name">${name}</div>
    </div>
    ${desc}
    <div class="tag-row">${tagHtml(trophy)}</div>
    ${body}
  </article>`;
}

function passesFilters(trophy) {
  const query = document.getElementById('query').value.trim().toLowerCase();
  if (query) {
    const haystack = `${trophy.name} ${trophy.description} ${trophy.guide} ${trophy.kind}`.toLowerCase();
    if (!haystack.includes(query)) return false;
  }
  const grade = document.getElementById('grade-filter').value;
  if (grade !== 'all' && trophy.grade !== grade) return false;
  const kind = document.getElementById('kind-filter').value;
  if (kind !== 'all' && trophy.kind !== kind) return false;
  return true;
}

function renderGrid() {
  const grid = document.getElementById('trophy-grid');
  const visible = state.trophies.filter(passesFilters);
  grid.innerHTML = visible.map(cardHtml).join('');
  document.getElementById('no-results').hidden = visible.length !== 0;
  document.getElementById('status-line').textContent =
    `Showing ${visible.length} of ${state.trophies.length} trophies` +
    (state.spoiler ? ' · spoiler mode on (28 hidden trophies masked until earned)' : '');
  grid.querySelectorAll('input[type="checkbox"]').forEach((box) => {
    box.addEventListener('change', () => {
      const name = box.getAttribute('data-name');
      if (box.checked) state.earned.add(name);
      else state.earned.delete(name);
      persist();
      renderScore();
      renderStages();
      renderGrid();
    });
  });
}

function renderAll() {
  renderScore();
  renderStages();
  renderGrid();
}

document.getElementById('export-btn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify([...state.earned], null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'leonida-trophy-progress.json';
  link.click();
  URL.revokeObjectURL(link.href);
});

document.getElementById('import-file').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const known = new Set(state.trophies.map((t) => t.name));
    state.earned = new Set((Array.isArray(data) ? data : []).filter((n) => known.has(n)));
    persist();
    renderAll();
  } catch {
    alert('That file is not a valid progress export.');
  }
  event.target.value = '';
});

document.getElementById('query').addEventListener('input', renderGrid);
document.getElementById('grade-filter').addEventListener('change', renderGrid);
document.getElementById('kind-filter').addEventListener('change', renderGrid);
const spoilerToggle = document.getElementById('spoiler-toggle');
spoilerToggle.checked = state.spoiler;
spoilerToggle.addEventListener('change', () => {
  state.spoiler = spoilerToggle.checked;
  persist();
  renderGrid();
});

const payload = await (await fetch(DATA_URL)).json();
state.trophies = payload.trophies;
renderAll();
