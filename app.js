const MODELS = {
  XGBoost: {
    confusion: { tn: 1894, fp: 132, fn: 30, tp: 344 },
    features: [
      ['Sales lag (7d)', 0.24], ['Sales lag (14d)', 0.19], ['Anomaly z-score', 0.17],
      ['Lead time', 0.14], ['Promo flag', 0.11], ['Store cluster', 0.09], ['Day of week', 0.06]
    ]
  },
  'Random Forest': {
    confusion: { tn: 1971, fp: 70, fn: 79, tp: 280 },
    features: [
      ['Lead time', 0.22], ['Sales lag (7d)', 0.18], ['Store cluster', 0.16],
      ['Sales lag (14d)', 0.15], ['Anomaly z-score', 0.13], ['Promo flag', 0.10], ['Day of week', 0.06]
    ]
  }
};

const RISKS = [
  { sku: 'SKU-88213', market: 'Midwest', cover: 1.2, prob: 0.94 },
  { sku: 'SKU-40217', market: 'Northeast', cover: 1.8, prob: 0.89 },
  { sku: 'SKU-19042', market: 'South', cover: 2.1, prob: 0.81 },
  { sku: 'SKU-77310', market: 'West', cover: 2.6, prob: 0.74 },
  { sku: 'SKU-55621', market: 'Midwest', cover: 3.0, prob: 0.63 },
  { sku: 'SKU-30044', market: 'South', cover: 3.4, prob: 0.52 },
  { sku: 'SKU-12987', market: 'Northeast', cover: 4.1, prob: 0.38 },
];
const MARKETS = ['All', ...Array.from(new Set(RISKS.map(r => r.market)))];

function metrics(cm){
  const recall = cm.tp / (cm.tp + cm.fn);
  const precision = cm.tp / (cm.tp + cm.fp);
  const f1 = 2 * precision * recall / (precision + recall);
  const total = cm.tp + cm.fp + cm.fn + cm.tn;
  return { recall, precision, f1, total };
}

const state = { model: 'XGBoost', market: 'All', threshold: 0.5, sort: { col: 'prob', dir: -1 } };

const els = {
  modelToggle: document.getElementById('modelToggle'),
  marketToggle: document.getElementById('marketToggle'),
  kpiRow: document.getElementById('kpiRow'),
  featChart: document.getElementById('featChart'),
  confGrid: document.getElementById('confGrid'),
  threshold: document.getElementById('threshold'),
  thresholdVal: document.getElementById('thresholdVal'),
  flaggedCount: document.getElementById('flaggedCount'),
  tableBody: document.getElementById('tableBody'),
  finding: document.getElementById('finding'),
};

function makeToggle(el, options, currentVal, onSelect){
  el.innerHTML = '';
  options.forEach(val => {
    const btn = document.createElement('button');
    btn.textContent = val;
    btn.setAttribute('aria-pressed', val === currentVal ? 'true' : 'false');
    btn.addEventListener('click', () => onSelect(val));
    el.appendChild(btn);
  });
}

function renderModelToggle(){
  makeToggle(els.modelToggle, Object.keys(MODELS), state.model, v => { state.model = v; renderModelToggle(); renderModelViews(); renderFinding(); });
}
function renderMarketToggle(){
  makeToggle(els.marketToggle, MARKETS, state.market, v => { state.market = v; renderMarketToggle(); renderTable(); });
}

function riskLabel(p){
  if (p >= 0.8) return ['High', 'high'];
  if (p >= 0.5) return ['Medium', 'med'];
  return ['Low', 'low'];
}

function renderKpis(){
  const m = metrics(MODELS[state.model].confusion);
  els.kpiRow.innerHTML = `
    <div class="stat"><div class="num">${(m.recall*100).toFixed(1)}%</div><div class="desc">Recall, ${state.model}</div></div>
    <div class="stat"><div class="num">${m.f1.toFixed(2)}</div><div class="desc">F1 score, ${state.model}</div></div>
    <div class="stat"><div class="num">+9%</div><div class="desc">On shelf availability, post deployment</div></div>
    <div class="stat"><div class="num">-12%</div><div class="desc">Manual restock errors, post deployment</div></div>
  `;
}

function renderFeatChart(){
  const feats = MODELS[state.model].features;
  const width = 480, barH = 26, gap = 10, padL = 130, padR = 50, padT = 6;
  const height = padT + feats.length * (barH + gap);
  const max = Math.max(...feats.map(f => f[1]));
  const rows = feats.map(([name, val], i) => {
    const y = padT + i * (barH + gap);
    const w = (val / max) * (width - padL - padR);
    return `
      <text x="${padL-10}" y="${y+barH/2+4}" text-anchor="end" class="axis-label">${name}</text>
      <rect x="${padL}" y="${y}" width="${width-padL-padR}" height="${barH}" rx="6" fill="rgba(255,255,255,.05)"></rect>
      <rect x="${padL}" y="${y}" width="${Math.max(2,w)}" height="${barH}" rx="6" fill="#4DA3FF"></rect>
      <text x="${padL+w+8}" y="${y+barH/2+4}" class="axis-label">${val.toFixed(2)}</text>
    `;
  }).join('');
  els.featChart.innerHTML = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Feature importance for ${state.model}">${rows}</svg>`;
}

function renderConfusion(){
  const cm = MODELS[state.model].confusion;
  const max = Math.max(cm.tn, cm.fp, cm.fn, cm.tp);
  const cellStyle = v => `background:rgba(77,163,255,${(0.12 + (v/max)*0.65).toFixed(2)});`;
  els.confGrid.innerHTML = `
    <div></div>
    <div class="cm-axis-label">Predicted no risk</div>
    <div class="cm-axis-label">Predicted risk</div>

    <div class="cm-row-label">Actual no risk</div>
    <div class="cm-cell" style="${cellStyle(cm.tn)}"><div class="cm-num">${cm.tn.toLocaleString()}</div><div class="cm-label">True negative</div></div>
    <div class="cm-cell" style="${cellStyle(cm.fp)}"><div class="cm-num">${cm.fp.toLocaleString()}</div><div class="cm-label">False positive</div></div>

    <div class="cm-row-label">Actual risk</div>
    <div class="cm-cell" style="${cellStyle(cm.fn)}"><div class="cm-num">${cm.fn.toLocaleString()}</div><div class="cm-label">False negative</div></div>
    <div class="cm-cell" style="${cellStyle(cm.tp)}"><div class="cm-num">${cm.tp.toLocaleString()}</div><div class="cm-label">True positive</div></div>
  `;
}

function sortRows(rows){
  const { col, dir } = state.sort;
  return [...rows].sort((a,b) => {
    if (col === 'sku' || col === 'market') return a[col].localeCompare(b[col]) * dir;
    return (a[col] - b[col]) * dir;
  });
}

function renderTable(){
  const filtered = state.market === 'All' ? RISKS : RISKS.filter(r => r.market === state.market);
  const sorted = sortRows(filtered);
  const flagged = filtered.filter(r => r.prob >= state.threshold).length;
  els.flaggedCount.textContent = `${flagged} of ${filtered.length} SKUs at or above threshold`;

  els.tableBody.innerHTML = sorted.map(r => {
    const [label, cls] = riskLabel(r.prob);
    const below = r.prob < state.threshold;
    return `<tr class="${below ? 'below-threshold' : ''}">
      <td>${r.sku}</td><td>${r.market}</td>
      <td class="num">${r.cover.toFixed(1)}d</td>
      <td class="num">${(r.prob*100).toFixed(0)}%</td>
      <td><span class="risk-tag ${cls}">${label}</span></td>
    </tr>`;
  }).join('');

  document.querySelectorAll('th[data-col]').forEach(th => {
    const col = th.dataset.col;
    th.classList.toggle('sorted', state.sort.col === col);
    const arrow = th.querySelector('.sort-arrow');
    if (arrow) arrow.textContent = state.sort.col === col ? (state.sort.dir === 1 ? ' ↑' : ' ↓') : '';
  });
}

function setupSort(){
  document.querySelectorAll('th[data-col]').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.dataset.col;
      if (state.sort.col === col) state.sort.dir *= -1;
      else state.sort = { col, dir: col === 'sku' || col === 'market' ? 1 : -1 };
      renderTable();
    });
  });
}

function renderFinding(){
  const xgb = metrics(MODELS.XGBoost.confusion);
  const rf = metrics(MODELS['Random Forest'].confusion);
  const recallGap = ((xgb.recall - rf.recall) * 100).toFixed(1);
  const precisionCost = ((rf.precision - xgb.precision) * 100).toFixed(1);
  const active = state.model === 'XGBoost' ? xgb : rf;
  const other = state.model === 'XGBoost' ? rf : xgb;
  const otherName = state.model === 'XGBoost' ? 'Random Forest' : 'XGBoost';

  els.finding.innerHTML = `<strong>Why recall drives the model choice</strong>XGBoost reaches ${(xgb.recall*100).toFixed(1)}% recall against ${(rf.recall*100).toFixed(1)}% for Random Forest, a ${recallGap} point gap, at a precision cost of about ${precisionCost} points (${(rf.precision*100).toFixed(1)}% versus ${(xgb.precision*100).toFixed(1)}%). In this task a missed stockout, a false negative, is more expensive than an unnecessary restock check, a false positive, so the model that catches more real risks is preferred even though it flags more false alarms along the way. Currently viewing ${state.model}, F1 ${active.f1.toFixed(2)} versus ${other.f1.toFixed(2)} for ${otherName}.`;
}

function renderModelViews(){
  renderKpis();
  renderFeatChart();
  renderConfusion();
}

els.threshold.addEventListener('input', () => {
  state.threshold = parseFloat(els.threshold.value);
  els.thresholdVal.textContent = state.threshold.toFixed(2);
  renderTable();
});

renderModelToggle();
renderMarketToggle();
setupSort();
renderModelViews();
renderTable();
renderFinding();
