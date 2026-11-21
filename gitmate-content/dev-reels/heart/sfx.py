import numpy as np, wave
SPD=1.0; SR=48000; TOTAL=34.4/SPD; L=int(TOTAL*SR); rng=np.random.default_rng(3)
sfx=np.zeros((L,2),np.float32); mus=np.zeros((L,2),np.float32)
def add(buf,t,sig,g=1.0,pan=0.0):
    i=int(t/SPD*SR); s=sig[:max(0,min(len(sig),L-i))]
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
S=[0, 4.95, 8.95, 14.2, 18.3, 23.85, 26.1, 29.15, 31.45]
for x in S[1:]: add(sfx,x-.6,whoosh(.9),.24)
for x in S[1:]: typing(x+.05,x+.45,6)
# S1 receipt prints, VOID stamp, commit typing
for k in range(4): add(sfx,.2+k*.15,click(),.35)
add(sfx,1.58,thud(),.38); add(sfx,1.6,pop(300),.2)
typing(2.4,3.65,18); add(sfx,3.82,pop(1000),.15); add(sfx,3.85,glass(1760,.6),.05)
# S2 lid off, logo rises, keycaps
add(sfx,5.0,whoosh(.5),.16); add(sfx,5.9,glass(1568,1.0),.09); add(sfx,6.2,thud(),.2)
for x in [7.77,8.05,8.53]: add(sfx,x,click(),.8); add(sfx,x+.01,thud(),.08)
# S3 light sweep + split flap
add(sfx,9.6,whoosh(1.2),.1); add(sfx,11.1,glass(2349,.8),.06)
for k in range(13):
    for c in range(5): add(sfx,11.3+k*.17+c*.018,click(),.18,rng.uniform(-.3,.3))
# S4 heartbeats (lub-dub)
for b in [15.0,15.85,16.7,17.5]: add(sfx,b,thud(),.3); add(sfx,b+.18,thud(),.18)
for x in [15.72,15.92,16.24]: add(sfx,x,pop(800),.1)
add(sfx,17.44,glass(1568,.8),.08)
# S5 page tears, run press, hearts
for x in [19.2,20.15]: add(sfx,x,whoosh(.35),.16); add(sfx,x+.05,click(),.4)
add(sfx,21.82,click(),.9); add(sfx,21.84,thud(),.3)
for i in range(8): add(sfx,21.95+i*.17,pop(900+i*90,.07),.06)
typing(22.64,23.25,10)
# S6 wifi strike, creator card
add(sfx,24.4,pop(500),.15); add(sfx,25.1,thud(),.18); add(sfx,25.15,glass(1760,.7),.07)
# S7 DM
add(sfx,26.5,pop(1100),.15); typing(27.35,27.8,7); add(sfx,27.92,click(),.6); add(sfx,27.97,whoosh(.3),.12); add(sfx,28.3,pop(1300),.12)
# S8 comment + S9 follow
typing(29.85,30.15,7); add(sfx,30.2,click(),.6); add(sfx,30.25,pop(800),.3); add(sfx,30.55,glass(1568,1.0),.08)
E=31.5; add(sfx,E,glass(1568,1.4),.12); add(sfx,E+1.8,click(),.7); add(sfx,E+1.85,pop(600),.4); add(sfx,E+1.9,glass(1568,1.4),.14); add(sfx,E+1.95,glass(2349,1.4),.09)
# music: dark minimal pad + soft pulse (92 bpm)
t=np.arange(L)/SR
chords=[(55.0,82.4,130.8,164.8),(43.65,65.4,130.8,174.6),(49.0,73.4,123.5,146.8),(41.2,61.7,123.5,155.6)]
bar=60/92*4
pad=np.zeros(L)
for ci in range(int(TOTAL/bar)+1):
    a=int(ci*bar*SR); b=min(L,int((ci+1)*bar*SR)+int(.3*SR)); 
    if a>=L: break
    tt=np.arange(b-a)/SR; e=np.minimum(tt/.4,1)*np.minimum(1,(b-a)/SR-tt+.001)
    for f in chords[ci%4]: pad[a:b]+=np.sin(2*np.pi*f*tt+np.sin(2*np.pi*.3*tt)*.6)*e*.25
pad=bp(pad,30,900)*(0.7+0.3*np.sin(2*np.pi*t/bar))
beat=60/92
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
