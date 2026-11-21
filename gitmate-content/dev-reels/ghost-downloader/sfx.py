import numpy as np, wave
SR=48000; TOTAL=32.05; L=int(TOTAL*SR); rng=np.random.default_rng(3)
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
SP=1.0
S=[0, 3.25, 8.15, 12.5, 17.25, 21.6, 26.95, 29.3]
for x in S[1:]: add(sfx,x-.6,whoosh(.9),.24)
for x in S[1:]: typing(x+.05,x+.45,6)
add(sfx,0.05,thud(),.2)
for i,t0 in enumerate([0.12,0.34,0.56,0.72,0.88]): add(sfx,t0-.05,whoosh(.3),.08); add(sfx,t0+.2,thud(),.18)
for i in range(5): add(sfx,2.0+i*.07,click(),.5); add(sfx,2.02+i*.07,pop(400+i*40),.18)
add(sfx,3.5,whoosh(.6),.1); add(sfx,3.9,glass(1568,.9),.08)
typing(5.44,6.5,14)
for i in range(5): add(sfx,5.6+i*.12,pop(800+i*60),.12)
add(sfx,7.2,whoosh(.5),.12); add(sfx,7.8,glass(2093,1.0),.1); typing(7.62,7.95,6)
add(sfx,8.6,thud(),.2); add(sfx,9.5,click(),.4); add(sfx,10.4,click(),.4); add(sfx,11.45,whoosh(.4),.1); add(sfx,11.85,pop(700),.25); typing(11.6,12.0,8)
for t0 in [12.73,13.04,13.92,14.3,14.62,15.2]: add(sfx,t0-.15,whoosh(.3),.08); add(sfx,t0+.22,thud(),.22)
for i in range(6): add(sfx,16.1+i*.1,click(),.35)
add(sfx,16.0,whoosh(.4),.1); typing(16.2,16.8,10); add(sfx,16.8,glass(2349,.8),.07)
add(sfx,17.6,thud(),.2); add(sfx,18.05,pop(300),.25); add(sfx,19.36,whoosh(.5),.14); add(sfx,19.85,thud(),.25); add(sfx,19.87,pop(900),.2)
add(sfx,20.5,whoosh(.6),.08); typing(20.6,21.1,10); add(sfx,21.1,glass(2093,.9),.08)
for t0 in [21.2,21.45]: add(sfx,t0+.3,thud(),.2)
typing(22.0,22.8,12); add(sfx,24.3,whoosh(.5),.1)
for k in range(12): add(sfx,24.6+k*.11,pop(900+k*50),.05)
add(sfx,25.95,glass(2349,.9),.08)
C=28.0; typing(C,C+.3,7); add(sfx,C+.35,click(),.6); add(sfx,C+.4,pop(800),.3); add(sfx,28.5,glass(1568,1.0),.08)
E=29.4; add(sfx,E,glass(1568,1.4),.12); add(sfx,E+1.8,click(),.7); add(sfx,E+1.85,pop(600),.4); add(sfx,E+1.9,glass(1568,1.4),.14); add(sfx,E+1.95,glass(2349,1.4),.09)
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
