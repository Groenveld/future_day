# Draws the background tiles full of tiny Verity'ies: src/dots.svg and src/dots-scary.svg
# Run it again after adding a new Verity'ie:  python3 make-dots.py
# Each tiny ball is the same size as the old yellow dots (7px), on a 40px grid.

# (color, face, horns) for the normal and the scary form, in the same order as in App.jsx
NORMAL = [
    ('#ffd23f', 'happy'),       # Verity
    ('#3a86ff', 'sly'),         # Falsity
    ('#e63946', 'angry'),       # Cruelty
    ('#00b4d8', 'cool'),        # Moggity
    ('#ff8fab', 'love'),        # Lovity
    ('#ffd23f', 'happy'),       # Obesity
    ('#52b788', 'laugh'),       # Hapity
    ('#ffffff', 'angel'),       # Angelity
    ('#39ff14', 'curious'),     # Curiosity
]
SCARY = [
    ('#a07c00', 'monster'),
    ('#1d1b6b', 'monster', True),
    ('#7a0010', 'monster', True),
    ('#035a6b', 'evilcool'),
    ('#6b1d3a', 'heartbreak'),
    ('#7a5c00', 'monster'),
    ('#1b4332', 'monster'),
    ('#3a3a46', 'fallen'),
    ('#0b2e06', 'manyeyes'),
]


def mini(cx, cy, color, face, horns=False):
    o = []
    if horns:
        o.append(f'<path d="M{cx-2.6} {cy-2} L{cx-3.2} {cy-4.6} L{cx-1} {cy-3.2} Z M{cx+2.6} {cy-2} L{cx+3.2} {cy-4.6} L{cx+1} {cy-3.2} Z" fill="#2b0000"/>')
    o.append(f'<circle cx="{cx}" cy="{cy}" r="3.5" fill="{color}" stroke="#222" stroke-width="0.6"/>')
    ln = 'fill="none" stroke="#222" stroke-width="0.45" stroke-linecap="round"'

    def eyes(c, r):
        return f'<circle cx="{cx-1.2}" cy="{cy-0.6}" r="{r}" fill="{c}"/><circle cx="{cx+1.2}" cy="{cy-0.6}" r="{r}" fill="{c}"/>'

    smile = f'<path d="M{cx-1.4} {cy+0.9} Q{cx} {cy+2.2} {cx+1.4} {cy+0.9}" {ln}/>'
    scary_mouth = f'<path d="M{cx-1.6} {cy+0.8} Q{cx} {cy+2.6} {cx+1.6} {cy+0.8} Z" fill="#000"/>'

    if face == 'happy':
        o += [eyes('#222', 0.45), smile]
    elif face == 'sly':
        o += [eyes('#222', 0.45), f'<path d="M{cx+0.5} {cy-1.6} L{cx+1.9} {cy-1.6}" {ln}/>', smile]
    elif face == 'angry':
        o += [eyes('#222', 0.45), f'<path d="M{cx-1.4} {cy+1.7} Q{cx} {cy+0.7} {cx+1.4} {cy+1.7}" {ln}/>']
    elif face == 'cool':
        o += [f'<rect x="{cx-2.5}" y="{cy-1.3}" width="5" height="1.3" rx="0.4" fill="#111"/>',
              f'<path d="M{cx-2.4} {cy-2.6} Q{cx} {cy-4.4} {cx+2.4} {cy-2.6}" fill="none" stroke="#3b2a1a" stroke-width="1"/>', smile]
    elif face == 'love':
        o += [eyes('#d00000', 0.6), smile]
    elif face == 'laugh':
        o += [f'<path d="M{cx-1.8} {cy-0.4} Q{cx-1.2} {cy-1.4} {cx-0.6} {cy-0.4} M{cx+0.6} {cy-0.4} Q{cx+1.2} {cy-1.4} {cx+1.8} {cy-0.4}" {ln}/>',
              f'<path d="M{cx-1.6} {cy+0.6} Q{cx} {cy+2.8} {cx+1.6} {cy+0.6} Z" fill="#7a1f2b"/>']
    elif face == 'angel':
        o.insert(0, f'<ellipse cx="{cx}" cy="{cy-4.2}" rx="2.2" ry="0.7" fill="none" stroke="#ffc300" stroke-width="0.6"/>')
        o += [eyes('#222', 0.4), smile]
    elif face == 'curious':
        o += [eyes('#fff', 0.95), f'<circle cx="{cx-1}" cy="{cy-0.9}" r="0.45" fill="#222"/><circle cx="{cx+1.4}" cy="{cy-0.9}" r="0.45" fill="#222"/>',
              f'<circle cx="{cx}" cy="{cy+1.5}" r="0.5" fill="#222"/>']
    elif face in ('monster', 'heartbreak'):
        o += [eyes('#ff1a1a', 0.6), scary_mouth]
    elif face == 'fallen':
        o.insert(0, f'<path d="M{cx-2.2} {cy-4.2} Q{cx-1} {cy-4.9} {cx-0.2} {cy-4.8} M{cx+0.6} {cy-4.8} Q{cx+1.6} {cy-4.8} {cx+2.2} {cy-4.1}" fill="none" stroke="#c00000" stroke-width="0.6"/>')
        o += [eyes('#ff1a1a', 0.6), scary_mouth]
    elif face == 'evilcool':
        o += [f'<rect x="{cx-2.5}" y="{cy-1.3}" width="5" height="1.3" rx="0.4" fill="#111"/>', eyes('#ff1a1a', 0.35), scary_mouth]
    elif face == 'manyeyes':
        for ex, ey in [(-1.3, -0.4), (1.3, -0.4), (0, -2), (-2, 1), (2, 1)]:
            o.append(f'<circle cx="{cx+ex}" cy="{cy+ey}" r="0.55" fill="#39ff14"/>')
        o.append(f'<path d="M{cx-1} {cy+1.6} Q{cx} {cy+2.6} {cx+1} {cy+1.6} Z" fill="#000"/>')
    return ''.join(o)


def tile(balls):
    n = len(balls)
    rows = [list(range(n)), [(i + n // 2) % n for i in range(n)]]  # second row shifted
    parts = [mini(20 + col * 40, 20 + row * 40, *balls[i])
             for row, cols in enumerate(rows) for col, i in enumerate(cols)]
    w = n * 40
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="80" viewBox="0 0 {w} 80">{"".join(parts)}</svg>\n'


for name, balls in [('src/dots.svg', NORMAL), ('src/dots-scary.svg', SCARY)]:
    with open(name, 'w') as f:
        f.write(tile(balls))
print(f'Done! Tile width {len(NORMAL) * 40}px - use that in background-size in src/index.css')
