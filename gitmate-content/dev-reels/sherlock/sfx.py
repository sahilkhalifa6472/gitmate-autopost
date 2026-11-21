import numpy as np, wave
SR=48000; TOTAL=34.85; L=int(TOTAL*SR); rng=np.random.default_rng(3)
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
K=1/1.08
S=[x*K for x in [0,5.0,8.85,12.7,17.85,21.55,26.35,32.3,34.55]]
for x in S[1:]: add(sfx,x-.6,whoosh(.9),.24)
for x in S[1:]: typing(x+.05,x+.45,6)
# S1 keycaps + radar blips
for i in range(13): add(sfx,(0.62+i*0.095)*K,click(),.5,(i-6)*.05)
for a in [40,95,150,200,250,300,345,65,125,275,175]:
    tt=1.6+a/260+(360/260 if a<30 else 0); add(sfx,tt*K,pop(1300),.12,(a-180)/400)
add(sfx,1.6*K,whoosh(.6),.1)
# S2 card typing + coins
typing(5.55*K,7.6*K,24)
for i in range(8): add(sfx,(6.6+i*.11+.22)*K,glass(2093+i*60,.25),.05); add(sfx,(6.6+i*.11+.22)*K,click(),.3)
# S3 command + enter + chips
typing(9.05*K,9.85*K,12); add(sfx,10.05*K,click(),.8); add(sfx,10.08*K,thud(),.22)
for k in range(30): add(sfx,(10.1+k*.07)*K,click(),.1,rng.uniform(-.5,.5))
add(sfx,11.24*K,glass(1760,.8),.07)
# S4 pulls
for x in [12.84,13.5,14.1,14.76,16.3]: add(sfx,x*K,whoosh(.3),.12); add(sfx,(x+.15)*K,pop(900),.18)
add(sfx,15.6*K,whoosh(.7),.08)
# S5 printer
for r in [18.4,18.6,18.8,19.0,19.2,19.4,19.65,20.45,20.62,20.8,20.98]:
    for j in range(4): add(sfx,(r+j*.03)*K,click(),.18)
add(sfx,20.05*K,whoosh(.25),.15); add(sfx,20.35*K,click(),.7); add(sfx,20.38*K,pop(700),.2)
# S6 footsteps
for i in range(9): add(sfx,(23.0+i*.3)*K,thud(),.2,(-1)**i*.2); add(sfx,(23.1+i*.3)*K,pop(1000),.08)
add(sfx,25.3*K,glass(1568,.9),.07)
# S7 cube turns, typing, return presses
for x in [27.2,28.1,29.6]: add(sfx,x*K,whoosh(.35),.12); add(sfx,(x+.33)*K,thud(),.2)
typing(28.5*K,30.3*K,20); typing(30.6*K,31.25*K,9)
for x in [30.35,31.4]: add(sfx,x*K,click(),.8); add(sfx,x*K,thud(),.2)
# S8 comment + S9 follow
typing(33.0*K,33.3*K,7); add(sfx,33.32*K,click(),.6); add(sfx,33.38*K,pop(800),.3)
add(sfx,33.6*K,glass(1568,1.0),.08)
add(sfx,34.6*K,glass(1568,1.4),.12)
add(sfx,36.4*K,click(),.7); add(sfx,36.45*K,pop(600),.4); add(sfx,36.5*K,glass(1568,1.4),.14); add(sfx,36.55*K,glass(2349,1.4),.09)
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
