import numpy as np, wave
SPD=1.08; SR=48000; TOTAL=39.5/SPD; L=int(TOTAL*SR); rng=np.random.default_rng(3)
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
S=[0, 5.35, 6.75, 12.7, 16.55, 21.6, 29.55, 31.75, 34.15, 36.6]
for x in S[1:]: add(sfx,x-.6,whoosh(.9),.24)
for x in S[1:]: typing(x+.05,x+.45,6)
# S1 ring fill ticks + alarm-ish blips, bell mute
for k in range(19): add(sfx,0.3+k*.12,pop(500+k*40),.05)
add(sfx,2.6,thud(),.2); add(sfx,2.65,glass(1568,.5),.06)
typing(2.6,3.2,8); add(sfx,4.2,click(),.6); typing(4.1,4.9,10)
# S2 logo slam
add(sfx,5.4,whoosh(.7),.14); add(sfx,6.15,thud(),.3); add(sfx,6.2,glass(1760,.9),.08)
# S3 counter flips + screenshot
for x in [7.28,8.24,9.44]: add(sfx,x,click(),.6); add(sfx,x+.05,pop(700),.15)
add(sfx,10.6,whoosh(.5),.14); add(sfx,11.4,thud(),.12); add(sfx,11.7,glass(2349,.5),.07); typing(11.8,12.3,6)
# S4 machines + packets
for x in [12.9,13.1,13.3,13.6]: add(sfx,x+.3,thud(),.1)
for k in range(14): add(sfx,14.25+k*.18,pop(1100+(k%3)*120,.06),.05)
add(sfx,14.95,click(),.5)
for x in [15.3,15.5,15.7]: add(sfx,x,pop(900),.1)
# S5 probes
add(sfx,17.6,whoosh(.4),.08)
for k in range(48): add(sfx,17.6+k*.025,click(),.08)
add(sfx,19.84,thud(),.25); add(sfx,19.86,pop(400),.2); add(sfx,20.75,glass(1568,.6),.08); add(sfx,20.78,pop(900),.15)
# S6 agent
add(sfx,21.75,whoosh(.6),.12); typing(24.3,25.1,12); add(sfx,26.1,pop(800),.15); typing(26.2,26.9,9)
typing(27.6,28.1,8); add(sfx,28.2,whoosh(.3),.14); add(sfx,28.65,thud(),.35); add(sfx,28.7,pop(500),.2)
# S7 creator
add(sfx,30.0,thud(),.2); add(sfx,30.1,glass(1760,.8),.08)
for i in range(3): add(sfx,30.95+i*.12,pop(1000+i*150),.1)
# S8 dm
typing(32.1,32.9,12); add(sfx,32.95,click(),.7); add(sfx,33.0,whoosh(.3),.12); add(sfx,33.6,pop(1200),.2)
for i in range(3): add(sfx,32.4+i*.25,pop(700),.07)
# S9 comment + S10 follow
typing(34.9,35.2,7); add(sfx,35.25,click(),.6); add(sfx,35.3,pop(800),.3)
add(sfx,35.6,glass(1568,1.0),.08)
E=36.65; add(sfx,E,glass(1568,1.4),.12); add(sfx,E+1.8,click(),.7); add(sfx,E+1.85,pop(600),.4); add(sfx,E+1.9,glass(1568,1.4),.14); add(sfx,E+1.95,glass(2349,1.4),.09)
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
