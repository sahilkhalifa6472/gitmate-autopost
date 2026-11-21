import numpy as np, wave
SR=48000; TOTAL=38.2; L=int(TOTAL*SR); rng=np.random.default_rng(3)
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
K=1/1.1
S=[x*K for x in [0,5.25,7.6,13.85,16.95,23.85,27.3,32.75,36.6,38.7]]
for x in S[1:]: add(sfx,x-.6,whoosh(.9),.24)
for x in S[1:]: typing(x+.05,x+.45,7)
# S1 tokens hop, rush, folder shake, pages
for i in range(5): add(sfx,(1.84+i*.08)*K,pop(900+i*80),.15)
add(sfx,3.4*K,whoosh(.5),.14)
for k in range(6): add(sfx,(3.85+k*.08)*K,thud(),.16)
add(sfx,3.9*K,glass(1318,.6),.05)
# S2 medal spin + land
add(sfx,5.1*K,whoosh(1.1),.12); add(sfx,6.3*K,thud(),.3); add(sfx,6.35*K,glass(1760,1.0),.08)
# S3 trunk draw + nodes + zero
add(sfx,7.95*K,whoosh(.5),.1)
for i in range(5): add(sfx,(9.0+i*.1)*K,pop(700+i*90),.14)
for x in [12.05,12.3]: add(sfx,x*K,click(),.5)
add(sfx,12.32*K,glass(2093,.6),.06)
# S4 typing + tally clicks
typing(14.05*K,16.25*K,40)
for p in [0.42,0.82,1.0]: add(sfx,(14.05+p*2.2+.05)*K,click(),.9); add(sfx,(14.05+p*2.2+.06)*K,pop(500),.25)
# S5 command + enter + tiles
typing(18.2*K,19.45*K,22); add(sfx,19.7*K,thud(),.4); add(sfx,19.7*K,click(),.8)
for x in [20.46,21.22,22.16]: add(sfx,(x+.25)*K,thud(),.22); add(sfx,(x+.3)*K,pop(1000),.14)
# S6 split flaps rattle
for k in range(60): add(sfx,(24.55+k*.025+rng.uniform(0,.02))*K,click(),.22,rng.uniform(-.4,.4))
# S7 squash, merge, shred
add(sfx,29.6*K,whoosh(.4),.14); add(sfx,29.95*K,thud(),.35)
add(sfx,30.4*K,whoosh(.4),.12); add(sfx,30.85*K,pop(800),.3); add(sfx,30.86*K,glass(1568,.8),.07)
for k in range(8): add(sfx,(31.0+k*.04)*K,click(),.35,(k-3.5)*.08)
# S8 odometer
for k in range(28): add(sfx,(34.3+k*.05)*K,click(),.2,(k%5-2)*.1)
add(sfx,35.6*K,glass(1760,.9),.08); typing(34.9*K,35.7*K,12)
# S9 comment + S10 follow
typing(37.3*K,37.6*K,7); add(sfx,37.65*K,click(),.6); add(sfx,37.72*K,pop(800),.3)
add(sfx,37.95*K,glass(1568,1.0),.08)
add(sfx,38.75*K,glass(1568,1.4),.12)
add(sfx,40.9*K,click(),.7); add(sfx,40.95*K,pop(600),.4); add(sfx,41.0*K,glass(1568,1.4),.14); add(sfx,41.05*K,glass(2349,1.4),.09)
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
