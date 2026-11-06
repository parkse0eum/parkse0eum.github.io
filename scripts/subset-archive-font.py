"""Keep the existing typeface, downloading only archive UI glyphs initially."""
from pathlib import Path
from fontTools import subset

root = Path(__file__).resolve().parent.parent
text = ''.join((root / file).read_text() for file in ['src/works/WorksArchive.tsx', 'src/works/data.ts'])
text += ''.join(chr(i) for i in range(32, 127)) + '이야기를 펼치는 중…↗'
options = subset.Options()
options.flavor = 'woff2'
font = subset.load_font(str(root / 'public/fonts/Pretendard-Medium.woff2'), options)
subsetter = subset.Subsetter(options=options)
subsetter.populate(text=text)
subsetter.subset(font)
subset.save_font(font, str(root / 'public/fonts/Archive-Pretendard.woff2'), options)
