css = open('base.css').read()
defs = open('defs.svg').read()
N = 9
DB = '<svg width="54" height="54" viewBox="0 0 24 24" fill="#f5f6f7"><rect x="1" y="9" width="3" height="6" rx="1"/><rect x="4.5" y="7" width="3" height="10" rx="1"/><rect x="7.5" y="11" width="9" height="2"/><rect x="16.5" y="7" width="3" height="10" rx="1"/><rect x="20" y="9" width="3" height="6" rx="1"/></svg>'

extra = '''
.f{height:1350px;margin-bottom:40px}
.sc{visibility:visible}
.top{top:64px}
.foot{position:absolute;left:64px;right:64px;bottom:56px;height:76px;display:flex;align-items:center;justify-content:space-between;z-index:6}
.dots{display:flex;gap:12px;padding:0 6px}
.dots i{width:14px;height:14px;border-radius:50%;background:rgba(255,255,255,.2)}
.dots i.on{width:44px;border-radius:7px;background:linear-gradient(90deg,#fff,#cfd2d6);box-shadow:0 0 14px rgba(255,255,255,.5)}
.swipe{position:absolute;right:0;top:0;display:flex;align-items:center;gap:16px;padding:12px 14px 12px 30px;font-family:'JetBrains Mono';font-weight:700;font-size:26px;white-space:nowrap}
.swipe .bead{width:52px;height:52px;font-size:26px}
.big3{font-size:44px;font-weight:600;color:rgba(255,255,255,.75)}
.big3 b{color:#fff;font-weight:800}
.qa{font-size:40px;font-weight:700;line-height:1.3;color:rgba(255,255,255,.88)}
'''

def bg(i):
    rot = [-16, 14, -12, 16, -14, 12, -16, 14, -12][i]
    o1 = [(-260, 640), (600, 520), (-200, 760), (560, 380), (-240, 600), (620, 700), (-220, 520), (580, 620), (90, 600)][i]
    o2 = [(660, 980), (-240, 940), (640, 1000), (-260, 920), (660, 960), (-220, 900), (640, 980), (-240, 960), (700, 1000)][i]
    return f'''<div class="bg">
    <div class="orb" style="width:760px;height:760px;left:{o1[0]}px;top:{o1[1]}px;background:radial-gradient(circle,rgba(255,255,255,.5),rgba(255,255,255,0) 65%)"></div>
    <div class="orb" style="width:620px;height:620px;left:{o2[0]}px;top:{o2[1]}px;background:radial-gradient(circle,rgba(200,205,212,.42),rgba(255,255,255,0) 65%)"></div>
    <div class="ribbon" style="width:1600px;height:120px;left:-260px;top:{760 + (i % 3) * 60}px;transform:rotate({rot}deg)"></div>
    <div class="ribbon" style="width:1400px;height:46px;left:-120px;top:{1060 - (i % 2) * 80}px;transform:rotate({rot}deg);opacity:.6"></div>
    <div class="vig"></div></div>'''

def chrome(i, label):
    dots = ''.join(f'<i class="{"on" if k == i else ""}"></i>' for k in range(N))
    sw = '<div class="swipe glass pill">swipe<div class="bead">→</div></div>' if i < N - 1 else '<div class="swipe glass pill">save it<div class="bead">↓</div></div>'
    return f'''<div class="top"><div class="brand glass pill"><div class="bead">&gt;_</div>git.mate</div><div class="tag glass pill"><b>{i + 1:02d}</b> / {N:02d} · {label}</div></div>
    <div class="foot"><div class="dots">{dots}</div>{sw}</div><div class="grain"></div>'''

def h(lines, size, top=270):
    out = []
    for ln in lines:
        soft = ln.startswith('~'); ln = ln.lstrip('~')
        ws = ''.join(f'<span class="w">{w}</span>' for w in ln.split(' '))
        out.append(f'<span class="ln{" soft" if soft else ""}">{ws}</span>')
    return f'<div class="L h" style="top:{top}px;font-size:{size}px">{"".join(out)}</div>'

def kick(t, top=214):
    return f'<div class="L kick" style="top:{top}px">{t}</div>'

def bead(x, on=True):
    return f'<div class="bead{"" if on else " off"}">{x}</div>'

slides = []

# 1 HOOK
slides.append(('hook', kick('// trending on github · today') + h(['Stop paying', 'for your', '~gym app'], 140) + f'''
<div class="L glass paid" style="top:740px;height:400px;padding:38px 44px">
  <div class="prow"><div class="av">{DB}</div><div><div class="pname">FitPro Premium</div><div class="lbl" style="margin-top:6px">subscription · auto-renews</div></div></div>
  <div class="price" style="margin-top:26px;font-size:130px">$12.99<small> / month</small><div class="strike" style="transform:scaleX(1) rotate(-4deg)"></div></div>
  <div class="stamp" style="top:170px">CANCEL IT</div>
</div>
<div class="L qa" style="top:1166px;font-size:36px">This free app does it all. <b style="color:#fff">Swipe →</b></div>
<div class="drop" style="width:60px;height:60px;left:930px;top:640px"></div><div class="drop" style="width:28px;height:28px;left:880px;top:600px"></div>'''))

# 2 REPO
slides.append(('meet it', kick('// github.com / openGym') + h(['Meet', '~openGym.'], 150) + f'''
<div class="L glass" style="top:574px;height:636px">
  <div class="chrome"><i></i><i></i><i></i><div class="url">github.com / openGym</div></div>
  <div class="repo" style="padding-top:14px">
    <div class="prow"><div class="av">{DB}</div><div><div class="rname">openGym</div><div class="rsub">public · open-source</div></div></div>
    <div class="rdesc" style="margin-top:24px">A free, self-hosted workout &amp; body-weight tracker you actually own.</div>
    <div class="chips" style="margin-top:26px"><span class="chip solid">self-hosted</span><span class="chip solid">AGPL-3.0</span><span class="chip">docker</span><span class="chip">pwa</span></div>
    <div class="stats" style="margin-top:28px"><div class="stat well"><div class="k">price</div><div class="v">$0</div></div><div class="stat well"><div class="k">setup</div><div class="v">1 cmd</div></div><div class="stat well"><div class="k">owner</div><div class="v">you</div></div></div>
  </div>
</div>'''))

# 3 NO SUB NO ADS
def srow(t, s):
    return f'<div class="srow well" style="padding:24px 28px;margin-top:14px"><div class="grow"><div class="tt">{t}<div class="ln2" style="transform:scaleX(1)"></div></div><div class="ss">{s}</div></div><div class="tg"><div class="fill" style="opacity:0"></div><div class="knob" style="left:6px"></div></div></div>'
slides.append(('free', kick("// what you don't get") + h(['No subscription.', '~No ads.'], 100) + f'''
<div class="L glass set" style="top:500px;height:520px;padding:34px 40px 26px">
  <div class="sh" style="margin-bottom:10px"><div class="t">Settings</div><div class="lbl">opengym · local</div></div>
  {srow('Subscription', '$0 · forever')}{srow('Ads', 'banners · pop-ups · trackers')}{srow('Cloud account', "someone else's server")}
</div>
<div class="L glass cost" style="top:1044px;height:166px;padding:22px 44px">
  <div><div class="lbl">you pay</div><div style="font-size:34px;font-weight:800;margin-top:8px">every month</div></div><div class="big" style="font-size:104px">$0.00</div>
</div>'''))

# 4 PLAN TRAIN
days = ''.join(f'<div class="day">{bead(d, k not in (2, 5))}<div class="wk">{w}</div></div>' for k, (d, w) in enumerate(zip('MTWTFSS', ['push', 'pull', 'rest', 'legs', 'push', 'rest', 'cardio'])))
sets = ''.join(f'<div class="sr well" style="padding:16px 26px"><div class="n">set {k + 1}</div><div class="wt">{w}</div>{bead("✓", k < 2)}</div>' for k, w in enumerate(['60 kg × 10', '65 kg × 8', '70 kg × 6']))
slides.append(('train', kick('// plan · train · track') + h(['Plan.', 'Train.', '~Track.'], 98) + f'''
<div class="L glass week" style="top:566px;height:226px;padding:26px 40px">
  <div class="sh" style="margin:0"><div style="font-size:32px;font-weight:800">This week</div><div class="lbl">4 sessions planned</div></div>
  <div class="days" style="margin-top:18px">{days}</div>
</div>
<div class="L glass sess" style="top:810px;height:400px;padding:26px 40px">
  <div class="hd"><div><div class="lbl">guided session · rest timer on</div><div class="nm" style="margin-top:6px;font-size:38px">Bench Press</div></div>
  <div class="lbl" style="font-size:26px;color:#fff;font-weight:800">1:30 ⏱</div></div>
  <div class="srs" style="margin-top:14px;gap:10px">{sets}</div>
</div>'''))

# 5 EXERCISES (static figures)
tiles = [('Squat', 'quads · glutes'), ('Bench', 'chest · triceps'), ('Deadlift', 'back · hams'), ('Pull-up', 'lats · biceps'), ('Curl', 'biceps'), ('OHP', 'shoulders')]
fig = {
 'Squat': ('M106 98 L76 136 L120 142 L100 186', 'M106 98 L88 112 L98 98', (110, 82), (104, 96)),
 'Bench': ('M136 128 L82 128 L52 118 L44 172', 'M136 128 L136 100 L134 72', (150, 126), (134, 70)),
 'Deadlift': ('M100 52 L100 108 L100 146 L100 186', 'M100 52 L102 80 L102 108', (100, 34), (102, 112)),
 'Pull-up': ('M100 58 L100 108 L100 136 L97 160', 'M100 58 L80 50 L100 30', (100, 40), None),
 'Curl': ('M100 52 L100 108 L100 146 L100 186', 'M100 52 L102 80 L124 64', (100, 34), (124, 62)),
 'OHP': ('M100 52 L100 108 L100 146 L100 186', 'M100 52 L106 26 L104 8', (100, 34), (104, 6)),
}
tl = ''
for n, m in tiles:
    b, a, hd, pl = fig[n]
    extra_svg = ''
    if n == 'Bench': extra_svg = '<rect x="40" y="134" width="120" height="10" rx="5" fill="rgba(255,255,255,.3)"/>'
    if n == 'Pull-up': extra_svg = '<line x1="40" y1="28" x2="160" y2="28" stroke="rgba(255,255,255,.55)" stroke-width="6" stroke-linecap="round"/>'
    else: extra_svg += '<line x1="30" y1="190" x2="170" y2="190" stroke="rgba(255,255,255,.15)" stroke-width="3"/>'
    st = 'stroke="#f5f6f7" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" fill="none"'
    plate = f'<circle cx="{pl[0]}" cy="{pl[1]}" r="15" fill="url(#plg)" stroke="rgba(255,255,255,.9)" stroke-width="3"/>' if pl else ''
    tl += f'<div class="tile glass" style="height:290px;padding:16px 14px"><svg viewBox="0 0 200 200" style="width:170px;height:170px;margin-top:0">{extra_svg}<path d="{b}" {st}/><path d="{a}" {st}/><circle cx="{hd[0]}" cy="{hd[1]}" r="13" fill="#f5f6f7"/>{plate}</svg><div class="tn" style="margin-top:6px;font-size:28px">{n}</div><div class="tm">{m}</div></div>'
slides.append(('library', kick('// exercise library') + '<div class="L h" style="top:256px"><span class="ln" style="font-size:180px;letter-spacing:-8px"><span class="w">1,300+</span></span><span class="ln soft" style="font-size:96px"><span class="w">exercises.</span></span></div>' + f'''
<div class="L grid" style="top:570px;gap:18px">{tl}</div>
<div class="L lbl" style="top:1178px;font-size:24px;text-align:center">every one with an animated demo ▶</div>'''))

# 6 STATS
slides.append(('stats', kick('// smart stats, built in') + h(['Est. 1RM.', '~Muscle map.'], 110) + f'''
<div class="glass half" style="left:64px;width:466px;top:520px;height:680px;padding:30px 30px">
  <div class="lbl">estimated one-rep max</div><div class="t" style="margin-top:6px">Bench press</div>
  <svg width="406" height="220" viewBox="0 0 398 230" style="margin-top:26px;overflow:visible">
    <path d="M24 210 A175 175 0 0 1 374 210" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="26" stroke-linecap="round"/>
    <path d="M24 210 A175 175 0 0 1 374 210" fill="none" stroke="#fff" stroke-width="26" stroke-linecap="round" pathLength="100" stroke-dasharray="100" stroke-dashoffset="22" filter="url(#glow)"/>
    <g style="transform-origin:199px 210px;transform:rotate(50deg)"><line x1="199" y1="210" x2="199" y2="70" stroke="#fff" stroke-width="6" stroke-linecap="round"/><circle cx="199" cy="210" r="16" fill="#e8eaed"/></g>
  </svg>
  <div class="big2" style="margin-top:20px;text-align:center">84<small> kg</small></div>
  <div class="lbl" style="text-align:center;margin-top:6px">from 70 kg × 6 reps</div>
  <div class="bars" style="height:110px;margin-top:30px"><i style="height:52%"></i><i style="height:60%"></i><i style="height:64%"></i><i style="height:74%"></i><i style="height:82%"></i><i style="height:96%"></i></div>
</div>
<div class="glass half" style="left:550px;width:466px;top:520px;height:680px;padding:30px 30px">
  <div class="lbl">trained this week</div><div class="t" style="margin-top:6px">Muscle map</div>
  <svg width="406" height="440" viewBox="0 0 200 330" style="margin-top:10px;filter:drop-shadow(0 0 18px rgba(255,255,255,.35))">
    <g fill="rgba(255,255,255,.07)" stroke="rgba(255,255,255,.25)" stroke-width="1.5">
      <circle cx="100" cy="26" r="18"/><rect x="92" y="44" width="16" height="12" rx="4"/>
      <g fill="rgba(255,255,255,.92)" stroke="#fff"><ellipse cx="66" cy="70" rx="16" ry="13"/><ellipse cx="134" cy="70" rx="16" ry="13"/><rect x="73" y="62" width="26" height="36" rx="10"/><rect x="101" y="62" width="26" height="36" rx="10"/><ellipse cx="52" cy="102" rx="11" ry="25"/><ellipse cx="148" cy="102" rx="11" ry="25"/><ellipse cx="85" cy="222" rx="15" ry="38"/><ellipse cx="115" cy="222" rx="15" ry="38"/></g>
      <rect x="80" y="102" width="40" height="58" rx="10"/>
      <ellipse cx="44" cy="152" rx="9" ry="24"/><ellipse cx="156" cy="152" rx="9" ry="24"/>
      <path d="M78 162 L122 162 L126 182 L74 182Z"/>
      <ellipse cx="84" cy="292" rx="10" ry="26"/><ellipse cx="116" cy="292" rx="10" ry="26"/>
    </g>
  </svg>
  <div class="legend" style="margin-top:14px"><span class="chip solid">chest</span><span class="chip solid">shoulders</span><span class="chip solid">arms</span><span class="chip solid">legs</span></div>
</div>'''))

# 7 DATA + ONE COMMAND
slides.append(('setup', kick('// local-first · self-host in seconds') + h(['Your data.', '~One command.'], 116) + '''
<div class="L glass" style="top:540px;height:330px">
  <div class="chrome"><i></i><i></i><i></i><div class="url">~/opengym — zsh</div></div>
  <div class="term" style="padding-top:6px;line-height:1.75"><div><span class="p">$ </span>git clone github.com/…/openGym</div><div><span class="p">$ </span>docker compose up -d</div><div class="ok">✓ running → localhost:3000</div></div>
</div>
<div class="L glass lock" style="top:900px;height:150px;padding:24px 36px">
  <div class="bead" style="width:76px;height:76px"><svg width="34" height="38" viewBox="0 0 38 42"><rect x="3" y="18" width="32" height="22" rx="6" fill="#111"/><path d="M10 18v-6a9 9 0 0 1 18 0v6" fill="none" stroke="#111" stroke-width="5"/></svg></div>
  <div><div class="t" style="font-size:34px">Stays in a folder you control</div><div class="s">~/opengym/data · your server, no one's cloud</div></div>
</div>
<div class="L glass lock" style="top:1074px;height:130px;padding:20px 36px">
  <div class="bead" style="width:76px;height:76px;font-size:30px">⇄</div>
  <div><div class="t" style="font-size:34px">Synced on phone &amp; laptop</div><div class="s">installable PWA · works offline</div></div>
</div>'''))

# 8 LOGIN
fp = '<svg width="110" height="110" viewBox="0 0 100 100" fill="none" stroke="rgba(255,255,255,.9)" stroke-width="4" stroke-linecap="round"><path d="M22 58 Q22 20 50 20 Q78 20 78 52"/><path d="M30 72 Q29 30 50 30 Q70 30 70 58"/><path d="M39 80 Q37 40 50 40 Q61 40 61 64"/><path d="M48 84 Q46 52 50 50 Q54 50 53 74"/><path d="M78 64 Q77 74 72 82"/></svg>'
fid = '<svg width="110" height="110" viewBox="0 0 100 100" fill="none" stroke="rgba(255,255,255,.9)" stroke-width="4" stroke-linecap="round"><path d="M14 30V20a6 6 0 0 1 6-6h10M70 14h10a6 6 0 0 1 6 6v10M86 70v10a6 6 0 0 1-6 6H70M30 86H20a6 6 0 0 1-6-6V70"/><path d="M36 38v6M64 38v6M50 40v16h-5M38 66q12 9 24 0"/></svg>'
slides.append(('login', kick('// no passwords') + h(['Fingerprint.', 'Face ID.', '~Any device.'], 104) + f'''
<div class="L glass login" style="top:620px;height:400px;padding:32px 40px">
  <div class="sh" style="margin:0"><div class="t" style="font-size:38px">Sign in</div><div class="lbl">passkeys</div></div>
  <div class="bios" style="margin-top:24px">
    <div class="bio well" style="padding:24px 20px"><div class="orbz" style="width:170px;height:170px">{fp}<div class="bead ok" style="width:50px;height:50px;font-size:22px">✓</div></div><div class="bn">Fingerprint</div></div>
    <div class="bio well" style="padding:24px 20px"><div class="orbz" style="width:170px;height:170px">{fid}<div class="bead ok" style="width:50px;height:50px;font-size:22px">✓</div></div><div class="bn">Face ID</div></div>
  </div>
</div>
<div class="L glass devs" style="top:1046px;height:156px;padding:22px 40px;align-items:center">
  <div class="dv" style="flex-direction:row"><div class="ic" style="width:46px;height:80px;border-radius:12px;border-color:#fff;background:rgba(255,255,255,.12)"></div><div class="ln3">phone</div></div>
  <div class="dv" style="flex-direction:row"><div class="ic" style="width:80px;height:100px;border-color:#fff;background:rgba(255,255,255,.12)"></div><div class="ln3">tablet</div></div>
  <div class="dv" style="flex-direction:row"><div class="ic" style="width:130px;height:86px;border-radius:10px 10px 4px 4px;border-color:#fff;background:rgba(255,255,255,.12)"></div><div class="ln3">laptop</div></div>
</div>'''))

# 9 CTA
def step(n, t, s, top):
    return f'<div class="L glass st2" style="top:{top}px;height:134px;padding:26px 34px">{bead(n)}<div><div class="t" style="font-size:38px">{t}</div><div class="s">{s}</div></div></div>'
slides.append(('save it', kick("// don't lose this repo") + h(['Save', '~this.'], 190) + step(1, 'Save this post', 'repo link in caption', 640) + step(2, 'Star it on GitHub', 'search: openGym', 794) + step(3, 'Follow @git.mate', '1 new open-source repo, every day', 948) + '''
<div class="L" style="top:1106px;height:100px;text-align:left"><div class="handle glass pill" style="font-size:38px;padding:14px 38px 14px 14px"><div class="bead" style="width:56px;height:56px">&gt;_</div>@git.mate</div></div>
<div class="drop" style="width:64px;height:64px;left:900px;top:330px"></div><div class="drop" style="width:30px;height:30px;left:980px;top:420px"></div>'''))

body = ''
for i, (lab, content) in enumerate(slides):
    body += f'<section class="f" id="c{i + 1}">{bg(i)}<div class="sc">{content}</div>{chrome(i, lab)}</section>\n'
plg = '<svg width="0" height="0" style="position:absolute"><defs><radialGradient id="plg" cx=".35" cy=".3"><stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="#bfc3c9"/><stop offset="1" stop-color="#55595f"/></radialGradient></defs></svg>'
html = f'''<!doctype html><html><head><meta charset="utf-8"><title>git.mate openGym carousel</title>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700;800&family=Inter+Tight:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>{css}{extra}</style></head><body>{defs}{plg}{body}</body></html>'''
open('carousel.html', 'w').write(html)
print('slides', len(slides))
