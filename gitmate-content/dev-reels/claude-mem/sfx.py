import numpy as np, wave
SR=48000; TOTAL=37.0; L=int(TOTAL*SR); rng=np.random.default_rng(3)
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
S=[x*K for x in [0,6.32,11.3,17.95,21.35,26.65,33.85,36.0]]
for x in S[1:]: add(sfx,x-.6,whoosh(.9),.24)
for x in S[1:]: typing(x+.05,x+.45,7)
# S1 memory wipe, prompt, note, shredder
add(sfx,2.6*K,whoosh(1.0),.1)
typing(3.7*K,4.3*K,12); add(sfx,4.05*K,pop(700),.2)
add(sfx,3.9*K+.1,thud(),.2)
grind=bp(rng.standard_normal(int(.6*SR)),200,2500)*(1+np.sin(np.arange(int(.6*SR))/SR*2*np.pi*38))*env(int(.6*SR),.02,.3)
add(sfx,5.45*K,grind/np.max(np.abs(grind)),.12)
cards=[8.2,9.1,10.3,10.5,16.55,16.75,16.95,17.15,17.9,18.3,22.4,22.95,23.5,24.3,30.8,33.8,34.95]
for j,x in enumerate(cards): add(sfx,x*K+.1,thud() if j%4==0 else pop(650+50*(j%5)),.2,(j%3-1)*.25)
for i in range(6): 
  for k in range(5): add(sfx,(9.4+i*.1+k*.2)*K,click(),.12,(i-2.5)*.1)
for x in [13.4,13.7,14.0,14.58,14.92]: add(sfx,(x+.3)*K,pop(500),.18)
add(sfx,15.84*K,whoosh(.3),.1); add(sfx,16.1*K,thud(),.4); add(sfx,16.3*K,glass(1760,.8),.08)
for x in [19.3,19.6,19.9]: add(sfx,(x+.35)*K,click(),.5); add(sfx,(x+.37)*K,pop(900),.15)
for x in [22.75,23.4,23.95]: add(sfx,x*K,pop(1000),.15)
add(sfx,25.1*K,glass(1568,1.0),.08)
for x in [28.62,29.42,29.72,30.22]: add(sfx,x*K,click(),.5); add(sfx,(x+.02)*K,glass(2093,.4),.04)
typing(31.85*K,32.6*K,14)
for x in [32.7,32.9,33.1]: add(sfx,x*K,pop(1100),.15)
typing(34.42*K,34.72*K,7); add(sfx,34.78*K,click(),.6); add(sfx,34.85*K,pop(800),.3)
add(sfx,36.0*K,glass(1568,1.4),.12)
add(sfx,38.15*K,click(),.7); add(sfx,38.2*K,pop(600),.4); add(sfx,38.25*K,glass(1568,1.4),.14); add(sfx,38.3*K,glass(2349,1.4),.09)
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
