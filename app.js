'use strict';
const data = window.RESEARCH_DATA;
const $ = (id) => document.getElementById(id);
const escapeHTML = (text) => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const figureInfo = {
  figure1: ['Perceived quality of diffusion SR', 'Examples spanning artifacts, comparable appearance and higher perceived quality.', 'paper'],
  DiffSR_scheme: ['DISRQAD construction pipeline', 'Source selection, LR conditions, generation and subjective subset selection.', 'paper'],
  DiffSR_metric_scheme: ['Student pruning & training', 'The architecture and two-stage training pipeline.', 'paper'],
  'Q-Align': ['Source quality distribution', 'Q-Align scores in medoid images before source selection.', 'paper'],
  SI: ['Spatial Information distribution', 'Structural detail in medoid source images.', 'paper'],
  filtered_inlab: ['High-variance pilot examples', 'Excluded when preparing assessor training and control sets.', 'paper'],
  fit_1_nr: ['NR MOS & pairwise preferences', 'LM-fitted relationship for one reference image.', 'paper'],
  fit_1_fr: ['FR MOS & pairwise preferences', 'LM-fitted relationship for one reference image.', 'paper'],
  lm_fitting_error_fr_v2: ['Full-reference fitting errors', 'Pilot fitting error across references and rating counts.', 'paper'],
  lm_fitting_error_nr_v2: ['No-reference fitting errors', 'Pilot fitting error; color scale differs from the FR panel.', 'paper'],
  comparison_classic: ['Classic SR visual comparisons', 'Additional comparison panel supplied in the article project.', 'extra'],
  comparison_diffusion: ['Diffusion SR visual comparisons', 'Additional comparison panel supplied in the article project.', 'extra'],
  DiffSR_scheme_2: ['Construction pipeline · alternate', 'Alternative layout from the source project, not a separate experiment.', 'extra'],
  figure2: ['Additional project illustration', 'Additional figure supplied in the LaTeX project; not used by the final manuscript.', 'extra'],
  Fig1: ['Visual examples · project variant', 'Alternative raster illustration from the project.', 'extra'],
  figure_1: ['Visual examples · alternate layout', 'Additional raster illustration from the project.', 'extra'],
  Q_Align_distribution: ['Q-Align distribution · raster', 'Additional distribution plot from the source project.', 'extra'],
  SI_distribution: ['SI distribution · raster', 'Additional distribution plot from the source project.', 'extra'],
  fr_vs_bt: ['FR ratings vs. Bradley–Terry', 'Additional pilot visualization from the source project.', 'extra'],
  nr_vs_bt: ['NR ratings vs. Bradley–Terry', 'Additional pilot visualization from the source project.', 'extra'],
  lm_fitting_error_fr: ['FR fitting errors · earlier plot', 'Earlier plot retained in the source project; final paper uses v2.', 'extra'],
  lm_fitting_error_nr: ['NR fitting errors · earlier plot', 'Earlier plot retained in the source project; final paper uses v2.', 'extra']
};

function renderMetrics() {
  const search = $('metric-search').value.trim().toLowerCase();
  const type = $('metric-type').value;
  const variant = $('metric-variant').value;
  const sort = $('metric-sort').value;
  const rows = data.metrics.filter(m => m.name.toLowerCase().includes(search) && (type === 'all' || m.type === type) && (variant === 'all' || m.adapted === (variant === 'adapted'))).sort((a,b) => sort === 'name' ? a.name.localeCompare(b.name) : b[sort]-a[sort]);
  $('metric-count').textContent = `${rows.length} of 62 configurations · signed correlations with MOS`;
  $('metrics-body').innerHTML = rows.length ? rows.map(m => `<tr class="${m.name.includes('distilled') ? 'highlight' : ''}"><td>${escapeHTML(m.name)}${m.adapted ? '<span class="metric-tag">ADAPTED</span>' : ''}</td><td>${m.type}</td>${['classicSRCC','classicPLCC','diffusionSRCC','diffusionPLCC'].map(k=>`<td>${m[k].toFixed(3)}</td>`).join('')}</tr>`).join('') : '<tr><td colspan="6">No metrics match these filters.</td></tr>';
}
['metric-search','metric-type','metric-variant','metric-sort'].forEach(id=>$(id).addEventListener('input',renderMetrics));
renderMetrics();

function renderConditions() {
  const rows = data.conditions.filter(c => c.family === $('condition-family').value && c.factor === $('condition-factor').value);
  $('conditions-body').innerHTML = rows.map(r => `<tr><td>${escapeHTML(r.subset)}</td>${r.values.map(v=>`<td class="heat-cell" style="background:rgba(7,92,86,${Math.max(0,v)*.19})">${v.toFixed(3)}</td>`).join('')}</tr>`).join('');
}
['condition-family','condition-factor'].forEach(id=>$(id).addEventListener('change',renderConditions));
renderConditions();

const selected = ['PSNR','TOPIQ(FR)','Q-Align','Q-ReAlign-pro','Q-ReAlign-mini(distilled)'];
$('gap-chart').innerHTML = selected.map(name=>{
  const m = data.metrics.find(m=>m.name===name);
  const label = name.includes('distilled') ? 'Distilled student' : name;
  return `<div class="bar-row"><span class="bar-name">${label}</span><div class="bar-tracks">${[['classicSRCC','classic'],['diffusionSRCC','diffusion']].map(([k,cls])=>`<div class="bar-track"><div class="bar-fill ${cls}" style="width:${m[k]*100}%"></div><span class="bar-value">${m[k].toFixed(3)}</span></div>`).join('')}</div></div>`;
}).join('');

const pilot = [[10,.982547,.969290,.990110],[11,.978173,.961658,.987619],[12,.973870,.954175,.985165],[13,.983084,.970229,.990415],[14,.983596,.971124,.990706],[15,.988575,.979851,.993534],[16,.991869,.985641,.995402],[17,.993483,.988485,.996316],[18,.997356,.997356,.998507],[19,.998654,.997617,.999240]];
$('pilot-body').innerHTML = pilot.map(r=>`<tr class="${r[0]===13?'highlight':''}"><td>${r[0]}</td>${r.slice(1).map(n=>`<td>${n.toFixed(6)}</td>`).join('')}</tr>`).join('');

function renderGallery(filter='all') {
  $('gallery-grid').innerHTML = data.figures.filter(f=>f.id!=='figure2' && (filter==='all'||figureInfo[f.id][2]===filter)).map(f=>{
    const [title,caption,kind]=figureInfo[f.id];
    return `<article class="gallery-card gallery-${kind}"><button data-zoom="${escapeHTML(f.id)}" aria-label="Enlarge ${escapeHTML(title)}"><img src="assets/figures/${f.file}" alt="${escapeHTML(title)}" loading="lazy" width="${f.width}" height="${f.height}"></button><div class="gallery-info"><p class="eyebrow">${kind==='paper'?'PAPER FIGURE':'PROJECT EXTRA'} · ${escapeHTML(f.id)}</p><h3>${escapeHTML(title)}</h3><p>${escapeHTML(caption)}</p></div></article>`;
  }).join('');
}
renderGallery();
document.querySelectorAll('[data-gallery]').forEach(button=>button.addEventListener('click',()=>{
  document.querySelectorAll('[data-gallery]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});
  renderGallery(button.dataset.gallery);
}));

const dialog=$('figure-dialog');
document.addEventListener('click',e=>{
  const button=e.target.closest('[data-zoom]');
  if(!button)return;
  const f=data.figures.find(f=>f.id===button.dataset.zoom);
  const [title,caption,kind]=figureInfo[f.id];
  $('dialog-title').textContent=title;
  $('dialog-kind').textContent=kind==='paper'?'PAPER FIGURE':'PROJECT EXTRA';
  $('dialog-caption').textContent=caption;
  $('dialog-image').src=`assets/figures/${f.file}`;
  $('dialog-image').alt=title+'. '+caption;
  $('dialog-original').href=`assets/figures/${f.original}`;
  dialog.showModal();
  document.body.classList.add('dialog-open');
});
dialog.querySelector('.close-dialog').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
dialog.addEventListener('close',()=>document.body.classList.remove('dialog-open'));

$('show-adapted').addEventListener('click',()=>{$('metric-variant').value='adapted';$('metric-type').value='all';$('metric-search').value='';renderMetrics();});
$('arxiv-placeholder').addEventListener('click',()=>{$('arxiv-status').textContent='The arXiv preprint is not public yet. You can read the supplied PDF below.';});
$('toggle-pdf').addEventListener('click',()=>{
  const panel=$('pdf-embed');
  panel.hidden=!panel.hidden;
  $('toggle-pdf').setAttribute('aria-expanded',String(!panel.hidden));
  $('toggle-pdf').textContent=panel.hidden?'Open embedded PDF viewer ↓':'Close embedded PDF viewer ↑';
  const frame=panel.querySelector('iframe');
  if(!panel.hidden&&!frame.src)frame.src=frame.dataset.src;
});
$('copy-citation').addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText($('bibtex').textContent);$('copy-status').textContent='BibTeX copied to clipboard.';}catch{const selection=window.getSelection();const range=document.createRange();range.selectNodeContents($('bibtex'));selection.removeAllRanges();selection.addRange(range);$('copy-status').textContent='Citation selected. Press Ctrl+C (or ⌘C) to copy.';}
});
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){document.querySelectorAll('.site-header nav a').forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+entry.target.id));}});},{rootMargin:'-15% 0px -65% 0px'});document.querySelectorAll('main section[id]').forEach(s=>observer.observe(s));}
