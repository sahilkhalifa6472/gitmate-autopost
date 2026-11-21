import numpy as np, wave
SR=48000; TOTAL=37.4; L=int(TOTAL*SR); rng=np.random.default_rng(3)
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
S=[0,2.05,6.38,8.55,11.98,15.36,18.98,23.3,25.86,27.96,31.86]
for s in S[1:]: add(sfx,s-.42,whoosh(),.22)
for i,s in enumerate(S): typing(s+.02,s+.6,10)
cards=[.15,.75,.95,1.15,2.2,6.45,7.95,8.62,9.6,12.05,13.3,17.0,17.1,17.2,17.3,17.4,17.5,19.2,20.95,23.4,25.1,25.92,27.35,28.05,30.4,32.2,32.45,32.72,33.0]
for j,t in enumerate(cards): add(sfx,t,pop(700+60*(j%5)),.3,(j%3-1)*.25)
add(sfx,1.5,whoosh(.25),.25); add(sfx,1.68,thud(),.45)
for t in (6.95,7.9,8.15): add(sfx,t,click(),.6); add(sfx,t+.05,pop(500),.3)
for i in range(7):
    if i not in (2,5): add(sfx,8.75+i*.1,pop(1100+i*60,.06),.22)
for i in range(4): add(sfx,10.0+i*.42,glass(1568+i*100,.5),.12)
add(sfx,13.45,glass(2093),.12)
for i in range(14): add(sfx,15.84+i*.09,click(),.25)
add(sfx,20.75,glass(1760),.12)
for i,t in enumerate((21.2,21.6,22.0,22.4,22.75)): add(sfx,t,pop(900+i*90,.07),.25)
for i in range(5): add(sfx,24.25+i*.14,click(),.4)
add(sfx,25.25,thud(),.35)
typing(26.08,26.68,14); add(sfx,27.2,glass(2349),.14)
add(sfx,29.7,glass(1975),.13); add(sfx,30.3,glass(2349),.13)
for i in range(3): add(sfx,30.55+i*.2,pop(1000+i*150,.06),.25)
add(sfx,33.0,glass(1568,1.4),.16); add(sfx,33.05,glass(2349,1.4),.1)
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
