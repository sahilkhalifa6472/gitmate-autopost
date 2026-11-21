import numpy as np, wave
SPD=1.0; SR=48000; TOTAL=36.9/SPD; L=int(TOTAL*SR); rng=np.random.default_rng(3)
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
S=[1.6, 4.05, 8.2, 12.6, 17.1, 21.05, 24.35, 28.15, 32.1]
for x in S[1:]: add(sfx,x-.6,whoosh(.9),.24)
for x in S[1:]: typing(x+.05,x+.45,6)
# S1 zeros slam
add(sfx,1.62,thud(),.4); add(sfx,1.64,glass(1568,.5),.06)
for k in range(18): add(sfx,1.65+k*.09,click(),.12)
for x in [2.12,3.16,3.4]: add(sfx,x,thud(),.32); add(sfx,x+.02,pop(300,.12),.2)
add(sfx,2.75,whoosh(.5),.1); typing(3.3,3.8,10)
# S2 grid fills, chips, push
for k in range(24): add(sfx,4.15+k*.1,pop(420+k*24,.05),.045)
add(sfx,5.37,pop(700),.16); add(sfx,5.97,pop(850),.16); add(sfx,6.42,pop(600),.12); typing(6.45,6.85,10); add(sfx,6.9,glass(1568,.5),.06)
# S3 dm lands, app card
add(sfx,9.27,pop(1100),.22); add(sfx,9.3,glass(2093,.6),.06); add(sfx,10.45,whoosh(.6),.12); add(sfx,11.0,thud(),.14)
# S4 phone, counter roll, tiles
add(sfx,12.85,whoosh(.6),.1); add(sfx,13.4,thud(),.14)
for k in range(34): add(sfx,14.2+2.3*(1-(1-k/34)**2.2),click(),.12)
add(sfx,16.5,thud(),.3); add(sfx,16.52,glass(1568,1.0),.1)
for i,x in enumerate([15.0,15.5,16.0]): add(sfx,x,click(),.5); add(sfx,x+.05,pop(700+i*120),.16)
typing(16.3,16.9,10)
# S5 lamp on, sweep, reveal
add(sfx,18.84,thud(),.12); add(sfx,19.0,click(),.7); add(sfx,19.1,whoosh(1.0),.1); add(sfx,19.9,glass(1760,1.1),.1); typing(19.7,20.2,9)
# S6 type FEATURE, send, repo, reply
typing(21.9,22.42,7); add(sfx,22.5,click(),.7); add(sfx,22.52,pop(900),.3); add(sfx,22.5,thud(),.22)
typing(22.75,23.2,12); add(sfx,23.25,click(),.7); add(sfx,23.27,pop(1000),.25); add(sfx,23.57,pop(1300),.2); add(sfx,23.6,glass(2093,.6),.06)
# S7 arrow, reel, globe pings
add(sfx,24.95,whoosh(.35),.1); add(sfx,25.2,thud(),.16); add(sfx,25.75,whoosh(1.0),.08)
for k in range(14): add(sfx,26.2+k*.13,pop(900+(k%5)*140,.07),.07,(-.5+k/13))
typing(27.1,27.7,10)
# S8 pill + ticks
add(sfx,29.67,pop(800),.3); add(sfx,29.7,thud(),.25); add(sfx,30.2,glass(1760,.8),.08)
for i,x_ in enumerate([30.95,31.15,31.35,31.55]): add(sfx,x_,click(),.7); add(sfx,x_+.02,pop(900+i*130,.07),.18)
# S9 end
E=32.15; add(sfx,E,glass(1568,1.4),.12); add(sfx,E+.4,whoosh(.9),.06); add(sfx,E+2.1,pop(700),.2); add(sfx,E+3.15,click(),.7); add(sfx,E+3.2,pop(600),.4); add(sfx,E+3.25,glass(1568,1.4),.14); add(sfx,E+3.3,glass(2349,1.4),.09)
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
