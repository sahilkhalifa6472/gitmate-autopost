import numpy as np, wave
SPD=1.1; SR=48000; TOTAL=40.3/SPD; L=int(TOTAL*SR); rng=np.random.default_rng(3)
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
S=[0, 5.95, 7.45, 12.75, 18.75, 22.95, 28.6, 32.6, 34.9, 37.4]
for x in S[1:]: add(sfx,x-.5,whoosh(.8),.24)
for x in S[1:]: typing(x+.05,x+.45,6)
add(sfx,.35,pop(1200),.2)
add(sfx,1.55,thud(),.45); add(sfx,1.6,whoosh(.4),.1)
typing(2.3,3.9,14); add(sfx,4.35,pop(1200),.2); add(sfx,5.0,pop(300),.3); add(sfx,5.05,click(),.5)
add(sfx,6.0,whoosh(.7),.14); add(sfx,6.7,thud(),.3); add(sfx,6.75,glass(1760,.9),.08); typing(6.72,7.4,10)
add(sfx,8.6,pop(1100),.15); add(sfx,9.6,pop(900),.18)
for x in [9.92,10.72,11.56]: add(sfx,x,click(),.6); add(sfx,x+.03,glass(1568 if x<11 else 1175,.4),.06)
for k in range(6): add(sfx,14.0+k*.62,pop(800+k*80,.08),.14); add(sfx,14.3+k*.62,click(),.25)
add(sfx,15.2,thud(),.15)
for k in range(10): add(sfx,19.0+k*.15,click(),.15,rng.uniform(-.3,.3))
add(sfx,20.4,click(),.8); add(sfx,20.45,thud(),.2); add(sfx,21.2,pop(1000),.2); typing(21.7,22.4,10)
add(sfx,24.5,thud(),.4); add(sfx,24.52,pop(400),.25)
for i in [0,2,4]: add(sfx,24.6+i*.1,pop(1000),.1)
add(sfx,25.4,whoosh(.5),.1); add(sfx,26.7,whoosh(.5),.1); typing(27.3,28.4,14)
add(sfx,29.25,whoosh(.25),.18); add(sfx,30.05,whoosh(.25),.18); add(sfx,30.9,pop(900),.12); add(sfx,31.4,pop(1100),.12); typing(31.6,32.2,8)
typing(33.0,33.8,12); add(sfx,33.85,click(),.7); add(sfx,33.9,whoosh(.3),.12); add(sfx,34.45,pop(1200),.2)
typing(35.7,36.0,7); add(sfx,36.05,click(),.6); add(sfx,36.1,pop(800),.3); add(sfx,36.4,glass(1568,1.0),.08)
E=37.45; add(sfx,E,glass(1568,1.4),.12); add(sfx,E+1.8,click(),.7); add(sfx,E+1.85,pop(600),.4); add(sfx,E+1.9,glass(1568,1.4),.14); add(sfx,E+1.95,glass(2349,1.4),.09)
for k in range(L): break
mus=None

def wr(p,x):
    x=x/max(1e-9,np.max(np.abs(x)))*.9
    w=wave.open(p,'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x*32767).astype('<i2').tobytes()); w.close()
wr('sfx.wav',sfx); print('ok')
