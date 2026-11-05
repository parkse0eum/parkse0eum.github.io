"""Regenerate small home-only fonts without changing the original typefaces.
Run with: python -m pip install 'fonttools[woff]'; python scripts/subset-home-fonts.py
"""
from pathlib import Path
from fontTools import subset

root = Path(__file__).resolve().parent.parent
text = ''.join((root / file).read_text() for file in ['src/App.tsx', 'src/book/content.ts', 'src/book/layout.ts', 'src/book/animation.ts'])
text += ''.join(chr(i) for i in range(32, 127)) + '“”·書吟펼치는 중…'
for source, target in [('Neujoh-Regular', 'Home-Neujoh'), ('Neujoh-Bold', 'Home-Neujoh-Bold'), ('Pretendard-Regular', 'Home-Pretendard')]:
    options = subset.Options()
    options.flavor = 'woff2'
    font = subset.load_font(str(root / f'public/fonts/{source}.woff2'), options)
    subsetter = subset.Subsetter(options=options)
    subsetter.populate(text=text)
    subsetter.subset(font)
    subset.save_font(font, str(root / f'public/fonts/{target}.woff2'), options)
