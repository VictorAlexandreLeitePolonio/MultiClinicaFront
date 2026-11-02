"""Gera símbolo, corte pequeno e lockups finais do Q-bot (Cliniq Care)."""
import re, os
os.chdir(os.path.join(os.path.dirname(__file__), "..", "logo"))
TEAL_D, TEAL, AMBER, INK, WHITE = "#00776E", "#00C2AC", "#F7B83D", "#0B1A22", "#FFFFFF"

def parts(small=False):
    stroke = 28 if small else 22
    r_out, cy = 90, 140
    r_in = r_out - stroke
    ring = (f"M128 {cy-r_out}a{r_out} {r_out} 0 1 1 0 {2*r_out}a{r_out} {r_out} 0 1 1 0 {-2*r_out}z"
            f"m0 {stroke}a{r_in} {r_in} 0 1 0 0 {2*r_in}a{r_in} {r_in} 0 1 0 0 {-2*r_in}z")
    tail = (f'<rect x="{-stroke/2}" y="-38" width="{stroke}" height="76" rx="{stroke/2}" '
            f'transform="translate(166 206) rotate(-60)"/>')
    if small:  # corte para 16–32 px: olhos e + maiores, sem sorriso, antena curta
        face = ('<rect x="88" y="104" width="24" height="40" rx="12"/>'
                '<rect x="136" y="117" width="42" height="16" rx="5"/><rect x="149" y="104" width="16" height="42" rx="5"/>')
        stem, ball = '<rect x="120" y="36" width="16" height="20" rx="8"/>', (128, 30, 15)
    else:
        face = ('<rect x="92" y="108" width="18" height="34" rx="9"/>'
                '<rect x="138" y="119" width="34" height="12" rx="4"/><rect x="149" y="108" width="12" height="34" rx="4"/>'
                '<path d="M100.3 164A32 32 0 0 0 155.7 164L146.2 158.5A21 21 0 0 1 109.8 158.5Z"/>')
        stem, ball = '<rect x="122" y="32" width="12" height="24" rx="6"/>', (128, 28, 12)
    return ring, tail, face, stem, ball

def symbol(fill, ball_fill, small=False, inner=False):
    ring, tail, face, stem, (bx, by, br) = parts(small)
    g = (f'<g transform="translate(0 4)"><g fill="{fill}"><path fill-rule="evenodd" d="{ring}"/>{tail}{stem}{face}</g>'
         f'<circle fill="{ball_fill}" cx="{bx}" cy="{by}" r="{br}"/></g>')
    return g if inner else f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><title>Cliniq Care</title>{g}</svg>'

def wm(path):
    return re.search(r' d="([^"]+)"', open(path).read()).group(1)

CL, CA = wm("wm-cliniq.svg"), wm("wm-care.svg")
W_CL, W_CA, CAP_U = 2883, 2448, 729

def lockup_h(sym, ball, c1, c2):
    cap = 92; s = cap / CAP_U; top = 144 - cap / 2
    x1 = 258; x2 = x1 + W_CL * s + 34; w = x2 + W_CA * s + 30
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="4 0 {w-4:.0f} 256"><title>Cliniq Care</title>'
            f'{symbol(sym, ball, inner=True)}'
            f'<path fill="{c1}" transform="translate({x1} {top}) scale({s:.5f})" d="{CL}"/>'
            f'<path fill="{c2}" transform="translate({x2:.1f} {top}) scale({s:.5f})" d="{CA}"/></svg>')

def lockup_v(sym, ball, c1, c2):
    cap = 54; s = cap / CAP_U; wcl, wca, gap = W_CL * s, W_CA * s, 20
    ww = wcl + gap + wca; W = max(ww, 256) + 48; top = 286; x1 = (W - ww) / 2
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W:.0f} {top+cap+28}"><title>Cliniq Care</title>'
            f'<g transform="translate({(W-256)/2:.1f} 0)">{symbol(sym, ball, inner=True)}</g>'
            f'<path fill="{c1}" transform="translate({x1:.1f} {top}) scale({s:.5f})" d="{CL}"/>'
            f'<path fill="{c2}" transform="translate({x1+wcl+gap:.1f} {top}) scale({s:.5f})" d="{CA}"/></svg>')

os.makedirs("kit", exist_ok=True)
files = {
    "cliniq-symbol.svg": symbol(TEAL_D, AMBER),
    "cliniq-symbol-on-dark.svg": symbol(TEAL, AMBER),
    "cliniq-symbol-black.svg": symbol("#000", "#000"),
    "cliniq-symbol-small.svg": symbol(TEAL_D, AMBER, small=True),
    "cliniq-symbol-small-on-dark.svg": symbol(TEAL, AMBER, small=True),
    "cliniq-symbol-small-black.svg": symbol("#000", "#000", small=True),
    "cliniq-lockup-horizontal.svg": lockup_h(TEAL_D, AMBER, INK, TEAL_D),
    "cliniq-lockup-horizontal-on-dark.svg": lockup_h(TEAL, AMBER, WHITE, TEAL),
    "cliniq-lockup-stacked.svg": lockup_v(TEAL_D, AMBER, INK, TEAL_D),
    "cliniq-lockup-stacked-on-dark.svg": lockup_v(TEAL, AMBER, WHITE, TEAL),
}
for name, svg in files.items():
    open(os.path.join("kit", name), "w").write(svg)
print("ok", len(files))
