import numpy as np, wave
SR=48000; TOTAL=36.5; L=int(TOTAL*SR); rng=np.random.default_rng(3)
sfx=np.zeros((L,2),np.float32); mus=np.zeros((L,2),np.float32)
def add(buf,t,sig,g=1.0,pan=0.0):
    i=int(t*SR); s=sig[:max(0,min(len(sig),L-i))]
    if i<0 or len(s)==0: return
    buf[i:i+len(s),0]+=s*g*(1-pan); buf[i:i+len(s),1]+=s*g*(1+pan)
def env(n,a,d): t=np.arange(n)/SR; return np.minimum(t/a,1)*np.exp(-t/d)
def bp(x,lo,hi):
    X=np.fft.rfft(x); f=np.fft.rfftfreq(len(x),1/SR); X[(f<lo)|(f>hi)]=0; return np.fft.irfft(X,len(x))
def whoosh(d=.45):
    n=int(d*SR); x=rng.standard_normal(n); t=np.arange(n)/SR; k=t/d
    y=bp(x,300,1500)*(1-k)+bp(x,1500,7000)*k; e=np.sin(np.pi*np.clip(k,0,1))**2; y=y*e; return y/np.max(np.abs(y))
def pop(f0=900,d=.09):
    n=int(d*SR); t=np.arange(n)/SR; f=f0*np.exp(-t*18); return np.sin(2*np.pi*np.cumsum(f)/SR)*env(n,.002,.03)
def click(): n=int(.025*SR); return bp(rng.standard_normal(n),2000,9000)*env(n,.0005,.004)*1.6
def glass(f=1760,d=.9):
    n=int(d*SR); t=np.arange(n)/SR; y=(np.sin(2*np.pi*f*t)+.5*np.sin(2*np.pi*f*2.76*t)*np.exp(-t/.08))*np.exp(-t/.25); return y*np.minimum(t/.002,1)*.6
def thud():
    n=int(.35*SR); t=np.arange(n)/SR; y=np.sin(2*np.pi*70*np.exp(-t*6)*t)+.3*bp(rng.standard_normal(n),100,1200); return y*env(n,.002,.09)
def typing(a,b,nc):
    for k in range(nc): add(sfx,a+(b-a)*k/nc+rng.uniform(-.01,.01),click(),.3,rng.uniform(-.2,.2))
K=1/1.07
S=[x*K for x in [0,4.85,10.85,16.3,19.7,23.3,28.55,32.9,35.1]]
for x in S[1:]: add(sfx,x-.6,whoosh(.9),.24)
for x in S[1:]: typing(x+.05,x+.45,7)
# S1 keys pop off, mic rises, words typed
for k in range(14): add(sfx,(0.64+k*.03)*K,click(),.35,rng.uniform(-.4,.4))
add(sfx,1.3*K,thud(),.3); add(sfx,1.6*K,whoosh(.6),.12); add(sfx,2.0*K,glass(1318,1.0),.06)
typing(2.95*K,4.4*K,22)
# S2 tile, tags, stars meter
add(sfx,5.25*K,thud(),.3); add(sfx,6.0*K,pop(700),.2)
for x in [6.24,6.7]: add(sfx,x*K,pop(1000),.18)
for k in range(16): add(sfx,(8.62+k*.1)*K,click(),.18,(k%5-2)*.1)
add(sfx,10.2*K,glass(1760,.8),.08)
# S3 chord press, release, paste
add(sfx,11.08*K,thud(),.35); add(sfx,11.1*K,click(),.7)
add(sfx,12.94*K,click(),.7); add(sfx,12.97*K,pop(800),.25)
add(sfx,14.5*K,pop(1200),.25); add(sfx,14.55*K,glass(2093,.5),.05)
# S4 turntable stops + typing in each window
for x in [16.45,17.2,18.0]: add(sfx,(x+.15)*K,thud(),.18); add(sfx,(x+.2)*K,pop(900),.12)
typing(16.6*K,17.1*K,9); typing(17.35*K,17.9*K,9); typing(18.15*K,18.75*K,10)
# S5 cable snap + switch
add(sfx,22.6*K,click(),.9); add(sfx,22.62*K,thud(),.35); add(sfx,22.65*K,glass(1568,.7),.06)
# S6 cartridges + lid + insert
add(sfx,23.5*K,whoosh(.5),.1); add(sfx,23.9*K,thud(),.25); add(sfx,24.5*K,thud(),.25)
for x in [25.55,25.65]: add(sfx,x*K,click(),.8); add(sfx,(x+.02)*K,pop(500),.2)
add(sfx,26.8*K,pop(900),.18)
# S7 pillars, stamp, strike
for x in [28.82,29.32,29.92]: add(sfx,(x+.2)*K,thud(),.3); add(sfx,(x+.25)*K,pop(600),.12)
add(sfx,31.0*K,thud(),.45); add(sfx,32.0*K,whoosh(.4),.1)
# S8 comment + S9 follow
typing(33.6*K,33.9*K,7); add(sfx,33.95*K,click(),.6); add(sfx,34.02*K,pop(800),.3)
add(sfx,34.3*K,glass(1568,1.0),.08)
add(sfx,35.15*K,glass(1568,1.4),.12)
add(sfx,37.3*K,click(),.7); add(sfx,37.35*K,pop(600),.4); add(sfx,37.4*K,glass(1568,1.4),.14); add(sfx,37.45*K,glass(2349,1.4),.09)
# music: dark minimal pad + soft pulse (110 bpm)
t=np.arange(L)/SR
chords=[(55.0,82.4,130.8,164.8),(43.65,65.4,130.8,174.6),(49.0,73.4,123.5,146.8),(41.2,61.7,123.5,155.6)]
bar=60/110*4
pad=np.zeros(L)
for ci in range(int(TOTAL/bar)+1):
    a=int(ci*bar*SR); b=min(L,int((ci+1)*bar*SR)+int(.3*SR)); 
    if a>=L: break
    tt=np.arange(b-a)/SR; e=np.minimum(tt/.4,1)*np.minimum(1,(b-a)/SR-tt+.001)
    for f in chords[ci%4]: pad[a:b]+=np.sin(2*np.pi*f*tt+np.sin(2*np.pi*.3*tt)*.6)*e*.25
pad=bp(pad,30,900)*(0.7+0.3*np.sin(2*np.pi*t/bar))
beat=60/110
kick=np.zeros(L)
for k in range(int(TOTAL/beat)):
    i=int(k*beat*SR); n=int(.25*SR); tt=np.arange(n)/SR; s=np.sin(2*np.pi*55*np.exp(-tt*8)*tt*2)*np.exp(-tt/.08)
    s=s[:max(0,L-i)]; kick[i:i+len(s)]+=s*(.9 if k%2==0 else .5)
    if k%2: h=bp(rng.standard_normal(int(.05*SR)),6000,14000)*env(int(.05*SR),.001,.01); h=h[:max(0,L-i)]; kick[i:i+len(h)]+=h*.25
m=pad/np.max(np.abs(pad))*.5+kick/np.max(np.abs(kick))*.45
fade=np.minimum(1,np.minimum(t/.5,(TOTAL-t)/1.5)); m*=fade
mus[:,0]=m; mus[:,1]=m
def wr(p,x):
    x=x/max(1e-9,np.max(np.abs(x)))*.9
    w=wave.open(p,'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x*32767).astype('<i2').tobytes()); w.close()
wr('sfx.wav',sfx); wr('music.wav',mus); print('ok')
