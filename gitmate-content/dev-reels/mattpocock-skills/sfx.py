import numpy as np, wave
SR=48000; TOTAL=38.3; L=int(TOTAL*SR); rng=np.random.default_rng(3)
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
K=1/1.12
S=[x*K for x in [0,3.5,5.95,12.75,16.45,20.95,27.3,32.75,38.1,40.1]]
for x in S[1:]: add(sfx,x-.6,whoosh(.9),.24)
for x in S[1:]: typing(x+.05,x+.45,6)
# S1 drums roll (rattle) + star press
for k in range(30): add(sfx,(.55+k*.05)*K,click(),.11,rng.uniform(-.5,.5))
add(sfx,2.0*K,thud(),.22); add(sfx,2.5*K,click(),.7); add(sfx,2.52*K,glass(1760,.8),.07)
# S2 folder lands, flap, sheets
add(sfx,3.3*K,whoosh(.8),.12); add(sfx,4.05*K,thud(),.25); add(sfx,4.2*K,pop(500),.15)
for i in range(6): add(sfx,(4.45+i*.1)*K,pop(900+i*80),.1,(i-2.5)*.15)
# S3 banner + rocker flip + strike
add(sfx,10.32*K,click(),.8); add(sfx,10.35*K,thud(),.25); add(sfx,11.56*K,whoosh(.35),.1)
# S4 X + slash command typing
add(sfx,14.3*K,pop(600),.25); typing(15.2*K,15.85*K,9); add(sfx,15.45*K,pop(1000),.15)
# S5 question rows + tree nodes
for x in [16.95,17.66,18.48]: add(sfx,x*K,whoosh(.3),.1)
for x in [17.0,17.7,18.2,18.7,19.1,19.5,19.85]: add(sfx,x*K,pop(1100),.13)
add(sfx,20.0*K,glass(1568,.9),.07)
# S6 fail -> pass, prism turns
add(sfx,23.06*K,pop(400),.2); add(sfx,24.76*K,glass(1760,.8),.08); add(sfx,24.76*K,pop(900),.2)
typing(23.9*K,24.7*K,8); add(sfx,25.2*K,whoosh(.5),.12)
for x in [25.95,26.48]: add(sfx,x*K,thud(),.25); add(sfx,x*K,click(),.4)
# S7 scribble, crosshairs, blocks
for k in range(16): add(sfx,(28.3+k*.05)*K,click(),.08,rng.uniform(-.5,.5))
for x in [29.48,29.74,29.98]: add(sfx,x*K,pop(1300),.16)
for x in [30.35,30.5,30.65]: add(sfx,x*K,thud(),.2)
typing(31.0*K,31.8*K,10)
# S8 license + cartridges + install typing
add(sfx,33.6*K,whoosh(.5),.1)
for x in [35.1,35.85,36.45,37.12]: add(sfx,(x+.28)*K,thud(),.25); add(sfx,(x+.28)*K,click(),.5)
typing(35.2*K,36.5*K,16)
# S9 comment + S10 follow
typing(38.6*K,38.9*K,7); add(sfx,38.92*K,click(),.6); add(sfx,38.98*K,pop(800),.3)
add(sfx,39.15*K,glass(1568,1.0),.08)
add(sfx,40.15*K,glass(1568,1.4),.12)
add(sfx,42.0*K,click(),.7); add(sfx,42.05*K,pop(600),.4); add(sfx,42.1*K,glass(1568,1.4),.14); add(sfx,42.15*K,glass(2349,1.4),.09)
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
