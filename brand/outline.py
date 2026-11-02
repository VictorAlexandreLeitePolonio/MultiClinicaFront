"""Converte texto em curvas SVG com a Mona Sans variável (largura/peso fixos)."""
import sys
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

font_path, text, wdth, wght, tracking, out = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4]), float(sys.argv[5]), sys.argv[6]
font = instantiateVariableFont(TTFont(font_path), {"wdth": wdth, "wght": wght})
upm = font["head"].unitsPerEm
cmap = font.getBestCmap(); gs = font.getGlyphSet(); hmtx = font["hmtx"]
cap = font["OS/2"].sCapHeight
x = 0; parts = []
for ch in text:
    name = cmap[ord(ch)]
    if ch != " ":
        pen = SVGPathPen(gs)
        # y para baixo no SVG; baseline em y=cap
        gs[name].draw(TransformPen(pen, (1, 0, 0, -1, x, cap)))
        parts.append(pen.getCommands())
    x += hmtx[name][0] + tracking * upm
width = x - tracking * upm
desc = -font["OS/2"].sTypoDescender
svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 {-10} {round(width)} {cap + desc + 20}"><path fill="#000" d="{" ".join(parts)}"/></svg>'
open(out, "w").write(svg)
print(out, "largura", round(width), "cap", cap, "upm", upm)
