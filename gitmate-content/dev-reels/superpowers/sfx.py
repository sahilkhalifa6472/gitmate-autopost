import numpy as np, wave
SR=48000; TOTAL=35.81; L=int(TOTAL*SR); rng=np.random.default_rng(3)
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
K=1/1.05
S=[x*K for x in [0,5.7,9.85,13.45,16.95,21.05,24.45,26.85,32.15,34.4]]
for x in S[1:]: add(sfx,x-.6,whoosh(.9),.24)
for x in S[1:]: typing(x+.05,x+.45,7)
# S1 dive + splash, gate drop + bump
add(sfx,2.06*K,whoosh(.8),.14); add(sfx,2.9*K,thud(),.3); add(sfx,2.95*K,bp(rng.standard_normal(int(.5*SR)),300,4000)*env(int(.5*SR),.005,.15),.08)
add(sfx,4.3*K,whoosh(.35),.12); add(sfx,4.6*K,thud(),.3); add(sfx,4.88*K,pop(420),.25)
cards=[4.02,5.9,6.9,7.5,8.2,12.5,15.8,16.05,16.3,17.4,21.15,21.4,21.5,24.7,24.85,28.5,30.4,32.0,33.6]
for j,x in enumerate(cards): add(sfx,x*K+.1,thud() if j%4==0 else pop(650+50*(j%5)),.2,(j%3-1)*.25)
for i in range(11): add(sfx,(6.36+i*.045)*K,click(),.22,(i%3-1)*.3)
for i in range(4): add(sfx,(10.5+i*.28)*K,pop(700+60*i),.18,(i%2-.5)*.4)
typing(12.75*K,13.55*K,16); add(sfx,13.35*K,whoosh(.4),.06)
add(sfx,14.55*K,whoosh(.5),.12)
for i in range(8): add(sfx,(15.1+i*.03)*K,click(),.3,((i%4)-1.5)*.15)
add(sfx,16.3*K,pop(900),.2)
for i in range(4): add(sfx,(17.2+i*.15)*K,thud(),.12); add(sfx,(17.5+i*.62+1.1)*K,glass(1568+i*100,.6),.06)
typing(21.4*K,21.9*K,10); add(sfx,22.58*K,click(),.6); add(sfx,22.6*K,pop(300),.25)
typing(23.0*K,23.45*K,9); add(sfx,23.84*K,click(),.6); add(sfx,23.86*K,glass(1760),.1)
add(sfx,25.5*K,glass(1568,.8),.08); add(sfx,26.2*K,glass(2093,.8),.08); add(sfx,24.9*K,whoosh(1.6),.08)
for x in [27.46,28.28,28.9,29.7]: add(sfx,(x-.02)*K,click(),.7); add(sfx,x*K,thud(),.22)
typing(28.8*K,29.8*K,18)
for i in range(14): add(sfx,(30.6+i*.08)*K,click(),.18)
typing(32.7*K,33.1*K,7); add(sfx,33.2*K,click(),.6); add(sfx,33.3*K,pop(800),.3)
add(sfx,34.4*K,glass(1568,1.4),.12)
add(sfx,36.55*K,click(),.7); add(sfx,36.6*K,pop(600),.4); add(sfx,36.65*K,glass(1568,1.4),.14); add(sfx,36.7*K,glass(2349,1.4),.09)
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
