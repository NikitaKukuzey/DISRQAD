"""Prepare web figures and exact table data from the supplied article project.

Usage: python scripts/prepare_assets.py SOURCE_LATEX_DIR PAPER_PDF PDFTOPPM
Requires Pillow and pypdf. The website itself has no build dependencies.
"""
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw

source, paper, renderer = map(Path, sys.argv[1:])
out = Path('assets/figures')
out.mkdir(parents=True, exist_ok=True)
Path('tmp').mkdir(exist_ok=True)
figures = []
for path in sorted(source.iterdir()):
    if path.suffix.lower() not in ['.pdf', '.png', '.jpg'] or 'submission' in path.name or path.stem == 'figure2':
        continue
    if path.suffix == '.pdf':
        target = Path('tmp') / path.stem
        subprocess.run([str(renderer), '-f', '1', '-singlefile', '-scale-to', '2400', '-png', str(path), str(target)], check=True, capture_output=True)
        im = Image.open(target.with_suffix('.png')).convert('RGB')
    else:
        im = Image.open(path).convert('RGB')
    im.thumbnail((2400, 2400))
    im.save(out / (path.stem + '.webp'), 'WEBP', quality=92)
    if path.suffix == '.pdf':
        shutil.copy2(path, out / path.name)
    figures.append({'id': path.stem, 'file': path.stem + '.webp', 'original': path.name if path.suffix == '.pdf' else path.stem + '.webp', 'width': im.width, 'height': im.height})
shutil.copy2(paper, 'assets/paper/DISRQAD.pdf')
subprocess.run([str(renderer), '-f', '1', '-singlefile', '-scale-to', '1000', '-png', str(paper), 'tmp/paper-preview'], check=True, capture_output=True)
Image.open('tmp/paper-preview.png').convert('RGB').save('assets/paper/preview.webp', quality=88)

def clean(s):
    s = re.sub(r'\\citep?\{[^}]*\}', '', s)
    s = re.sub(r'\\(?:phantom|tabmark)\{[^}]*\}', '', s)
    s = re.sub(r'\\(?:textbf|mathbf|underline|textit)\{([^{}]*)\}', r'\1', s)
    return s.replace('$', '').replace('~', '').strip()

tables = {}
for key, filename in [('standard', 'tab_metric_leaderboard.tex'), ('adapted', 'tab_finetuned_metrics.tex')]:
    rows = []
    for line in (source / filename).read_text(encoding='utf-8').splitlines():
        parts = line.split('&')
        if len(parts) == 6 and clean(parts[1]) in ['FR', 'NR']:
            vals = [float(re.search(r'-?\d+\.\d+', clean(p)).group()) for p in parts[2:]]
            rows.append({'name': clean(parts[0]), 'type': clean(parts[1]), 'classicSRCC': vals[0], 'classicPLCC': vals[1], 'diffusionSRCC': vals[2], 'diffusionPLCC': vals[3], 'adapted': key == 'adapted'})
    tables[key] = rows
conditions = []
family, factor = '', ''
for line in (source / 'tab_metrics_on_content_types.tex').read_text(encoding='utf-8').splitlines():
    if 'textit{Diffusion SR}' in line: family = 'Diffusion'
    if 'textit{Non-diffusion SR}' in line: family = 'Non-diffusion'
    parts = line.split('&')
    if len(parts) != 6 or not family or not re.search(r'\d+\.\d+', line): continue
    if clean(parts[0]): factor = clean(parts[0])
    conditions.append({'family': family, 'factor': factor, 'subset': clean(parts[1]).replace('\\times ', '×'), 'values': [float(re.search(r'-?\d+\.\d+', clean(p)).group()) for p in parts[2:]]})
Path('assets/data.js').write_text('window.RESEARCH_DATA = ' + json.dumps({'metrics': tables['standard'] + tables['adapted'], 'conditions': conditions, 'figures': figures}, ensure_ascii=False) + ';\n', encoding='utf-8')

# A contact sheet is for visual QA only.
sheet = Image.new('RGB', (1000, ((len(figures)+2)//3)*230), '#eef0f5')
draw = ImageDraw.Draw(sheet)
for i, f in enumerate(figures):
    im = Image.open(out/f['file'])
    im.thumbnail((310, 190))
    x, y = (i%3)*333, (i//3)*230
    sheet.paste(im, (x+(320-im.width)//2, y+20))
    draw.text((x+8,y+210),f['id'],fill='black')
sheet.save('tmp/figures-contact-sheet.jpg')
print(f'Prepared {len(figures)} figures, {len(tables["standard"])} standard and {len(tables["adapted"])} adapted metrics, {len(conditions)} condition rows.')
