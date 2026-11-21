import numpy as np, wave
SR=48000; TOTAL=round(37.4/1.06,2); L=int(TOTAL*SR); rng=np.random.default_rng(3)
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
SP=1.06
_add=add
def add(buf,t,sig,g=1.0,pan=0.0): _add(buf,t/SP,sig,g,pan)
def typing(a,b,nc):
    for k in range(nc): add(sfx,a+(b-a)*k/nc+rng.uniform(-.01,.01),click(),.3,rng.uniform(-.2,.2))
S=[0, 4.75, 9.95, 14.25, 17.6, 22.3, 26.6, 30.05, 32.2, 34.4]
for x in S[1:]: add(sfx,x-.6,whoosh(.9),.24)
for x in S[1:]: typing(x+.05,x+.45,6)
add(sfx,0.7,thud(),.3); add(sfx,1.0,glass(880,.6),.05); add(sfx,0.95,whoosh(.4),.08)
for x in [2.2,2.55,2.9,3.25]: add(sfx,x,click(),.5); add(sfx,x+.02,pop(1100),.12)
for k in range(8): add(sfx,3.3+k*.07,click(),.15)
add(sfx,5.9,thud(),.25); add(sfx,5.92,glass(2093,.9),.08)
add(sfx,7.05,whoosh(.4),.1); add(sfx,7.75,pop(700),.3); typing(8.0,8.9,14); add(sfx,8.6,whoosh(.5),.08)
add(sfx,10.3,whoosh(.6),.12)
for x in [10.3,11.0,11.68,12.4]: add(sfx,x+.4,pop(1000),.15)
for k in range(12): add(sfx,10.3+k*.09,click(),.1)
typing(11.7,12.5,12)
for i in range(3): add(sfx,14.9+i*.17,thud(),.14)
typing(15.0,15.55,6)
for i in range(4): add(sfx,16.25+i*.12,pop(800+i*120),.12)
add(sfx,16.6,whoosh(.7),.1); add(sfx,17.35,glass(1760,.6),.06)
add(sfx,18.55,whoosh(.4),.12)
for i in range(4): add(sfx,18.95+i*.2,click(),.4)
add(sfx,20.0,whoosh(.7),.12); add(sfx,20.7,thud(),.15); add(sfx,20.7,whoosh(1.2),.06)
for k in range(14): add(sfx,23.3+k*.09,click(),.14)
add(sfx,24.65,glass(1568,.7),.07); typing(24.0,24.7,10)
add(sfx,24.7,whoosh(.7),.1)
for i in range(12): add(sfx,25.0+i*.02,click(),.15)
add(sfx,25.35,thud(),.35); add(sfx,25.6,whoosh(.6),.14); add(sfx,25.9,glass(2093,1.0),.08)
for i in range(8): add(sfx,26.85+i*.11,click(),.3)
typing(28.0,28.6,12); add(sfx,28.9,thud(),.3); add(sfx,29.55,click(),.8); add(sfx,29.56,pop(600),.3)
add(sfx,30.6,glass(1760,.7),.07)
for i in range(8): add(sfx,30.5+i*.1,pop(900+i*70),.05)
add(sfx,31.25,glass(2349,.8),.08)
typing(32.95,33.25,7); add(sfx,33.3,click(),.6); add(sfx,33.35,pop(800),.3)
add(sfx,33.6,glass(1568,1.0),.08)
E=34.45; add(sfx,E,glass(1568,1.4),.12); add(sfx,E+1.8,click(),.7); add(sfx,E+1.85,pop(600),.4); add(sfx,E+1.9,glass(1568,1.4),.14); add(sfx,E+1.95,glass(2349,1.4),.09)
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
