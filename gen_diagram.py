import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch
import matplotlib.pyplot as plt

fig, ax = plt.subplots(figsize=(14, 9))
fig.patch.set_facecolor('#0d1117')
ax.set_facecolor('#0d1117')
ax.set_xlim(0, 14)
ax.set_ylim(0, 9)
ax.axis('off')

def rbox(x, y, w, h, fc, ec, label, sublabel=None, lsize=11):
    p = FancyBboxPatch((x-w/2, y-h/2), w, h,
        boxstyle='round,pad=0.08,rounding_size=0.25',
        facecolor=fc, edgecolor=ec, linewidth=2, zorder=3)
    ax.add_patch(p)
    dy = 0.13 if sublabel else 0
    ax.text(x, y+dy, label, ha='center', va='center',
        fontsize=lsize, fontweight='bold', color='white', zorder=4)
    if sublabel:
        ax.text(x, y-0.22, sublabel, ha='center', va='center',
            fontsize=8, color='#8b949e', zorder=4)

def arr(x1, y1, x2, y2, col='#4a90d9', style='->'):
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
        arrowprops=dict(arrowstyle=style, color=col, lw=2), zorder=2)

def diamond(x, y, label):
    d = plt.Polygon([[x, y+0.32],[x+0.44,y],[x,y-0.32],[x-0.44,y]],
        closed=True, facecolor='#2a1d00', edgecolor='#e3b341',
        linewidth=1.8, zorder=3)
    ax.add_patch(d)
    ax.text(x, y, label, ha='center', va='center',
        fontsize=7.5, fontweight='bold', color='#e3b341', zorder=4)

# ── Title ──────────────────────────────────────────────────────────────
ax.text(7, 8.55, 'The Proposer – Critic – Verifier Loop',
    ha='center', fontsize=17, fontweight='bold', color='white')
ax.text(7, 8.1, 'cs-scientist-plugin  ·  for Claude Code & opencode',
    ha='center', fontsize=10, color='#8b949e')

# ── Orchestrator ────────────────────────────────────────────────────────
rbox(7, 7.15, 3.6, 0.75, '#1c2d4a', '#1f6feb',
     'cs-scientist', 'Orchestrator · routes to mode · inits session')

# ── Arrows orchestrator → modes ─────────────────────────────────────────
for xm in [3.2, 7, 10.8]:
    arr(xm, 6.77, xm, 6.22, '#4a90d9')

# ── Modes ────────────────────────────────────────────────────────────────
rbox(3.2,  5.85, 2.7, 0.72, '#0d2137', '#1f6feb', 'RESEARCH', '10 phases')
rbox(7,    5.85, 2.7, 0.72, '#0d2a14', '#2ea043', 'DEV',      '7 phases')
rbox(10.8, 5.85, 2.7, 0.72, '#2a1d00', '#e3b341', 'TEACH',    '7 phases')

# ── Gates ────────────────────────────────────────────────────────────────
ax.text(0.85, 4.95, 'GATES', ha='center', va='center',
    fontsize=8, fontweight='bold', color='#e3b341')

gates = [
    (2.3,  4.95, 'G1'), (3.2,  4.95, 'G2'), (4.1,  4.95, 'G3'),
    (6.3,  4.95, 'G1'), (7.7,  4.95, 'G2'),
    (10.0, 4.95, 'G1'), (10.9, 4.95, 'G2'), (11.8, 4.95, 'G3'),
]
for xg, yg, lg in gates:
    arr(xg, 6.49, xg, yg+0.33, '#e3b34188')
    diamond(xg, yg, lg)

# ── Horizontal connector to critic ──────────────────────────────────────
for xm in [3.2, 7, 10.8]:
    arr(xm, 4.62, xm, 4.22, '#e3b341')

ax.plot([3.2, 10.8], [4.0, 4.0], color='#e3b341', lw=1.8, ls='--', zorder=2)
arr(7, 4.0, 7, 3.55, '#e3b341')

# ── Critic ───────────────────────────────────────────────────────────────
critic = FancyBboxPatch((4.4, 2.62), 5.2, 0.88,
    boxstyle='round,pad=0.1,rounding_size=0.3',
    facecolor='#2d0f0f', edgecolor='#f85149', linewidth=2.8, zorder=3)
ax.add_patch(critic)
ax.text(7, 3.15, 'cs-scientist-critic', ha='center', va='center',
    fontsize=13, fontweight='bold', color='#f85149', zorder=4)
ax.text(7, 2.83, 'zero session context  ·  zero disk access  ·  cannot be persuaded',
    ha='center', va='center', fontsize=8.5, color='#8b949e', zorder=4)

# ── Verdicts ─────────────────────────────────────────────────────────────
arr(5.5,  2.62, 4.2,  2.15, '#2ea043')
arr(7.0,  2.62, 7.0,  2.15, '#f85149')
arr(8.5,  2.62, 9.8,  2.15, '#e3b341')

rbox(4.0,  1.82, 1.6, 0.58, '#0d2a14', '#2ea043', 'PASS',           lsize=10)
rbox(7.0,  1.82, 1.6, 0.58, '#2d0f0f', '#f85149', 'FAIL',           lsize=10)
rbox(10.1, 1.82, 2.4, 0.58, '#1c1c00', '#e3b341', 'HUMAN_REQUIRED', lsize=9)

# ── FAIL retry loop ──────────────────────────────────────────────────────
ax.annotate('', xy=(2.75, 5.49), xytext=(2.75, 1.82),
    arrowprops=dict(arrowstyle='->', color='#f8514988',
    lw=1.8, connectionstyle='arc3,rad=-0.4'), zorder=2)
ax.text(1.35, 3.65, 'retry\n(max 2)', ha='center', va='center',
    fontsize=8, color='#f85149', style='italic')

# ── Quote ────────────────────────────────────────────────────────────────
ax.text(7, 1.1, '"The model proposes.  An external verifier decides."',
    ha='center', va='center', fontsize=11.5, color='#8b949e', style='italic')
ax.text(7, 0.62, 'Inspired by AlphaFold  ·  AlphaProof  ·  FunSearch',
    ha='center', va='center', fontsize=9, color='#484f58')

plt.tight_layout(pad=0.4)
plt.savefig('cs_scientist_diagram.png', dpi=180, bbox_inches='tight',
    facecolor='#0d1117')
print('saved')
