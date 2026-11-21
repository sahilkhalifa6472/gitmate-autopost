import numpy as np, wave
SR=48000; TOTAL=34.9; L=int(TOTAL*SR); rng=np.random.default_rng(3)
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
K=1
S=[0, 4.85, 7.62, 11.55, 17.86, 20.88, 23.3, 29.35, 31.75]
for x in S[1:]: add(sfx,x-.6,whoosh(.9),.24)
for x in S[1:]: typing(x+.05,x+.45,6)
# S1 brackets + rec blips
add(sfx,0.5,glass(1760,.6),.06); add(sfx,1.0,whoosh(.6),.08)
# S2 slats flip + tiles drop + name types
for i in range(12): add(sfx,4.75+i*.06+.3,click(),.25,(i-6)*.06)
for x in [5.36,5.62,5.88]: add(sfx,x+.3,thud(),.18); add(sfx,x+.3,pop(900),.12)
typing(6.0,6.9,16)
# S3 tag swings in, snip, fall, plate, rail knots
add(sfx,7.3,whoosh(.5),.1); add(sfx,9.72,click(),.9); add(sfx,9.72,glass(2600,.3),.08); add(sfx,9.75,whoosh(.5),.15)
add(sfx,10.2,thud(),.22)
for x in [10.35,10.6]: add(sfx,x,pop(1100),.18)
# S4 tiles lift + fast streaks
for x in [12.2,13.1,13.8,15.2]: add(sfx,x+.35,thud(),.18); add(sfx,x+.4,pop(800),.12)
add(sfx,16.35,whoosh(.45),.2); add(sfx,16.6,whoosh(.35),.12)
# S5 url typing, load, meter steps
typing(17.95,18.5,10); add(sfx,18.5,click(),.6)
for x in [19.9,20.1,20.3]: add(sfx,x,pop(1000),.15)
# S6 pip typing, enter, crate lands
typing(21.6,22.25,18); add(sfx,22.33,click(),.8); add(sfx,22.36,whoosh(.35),.15); add(sfx,22.7,thud(),.3)
# S7 grid steps
for x in [24.9,25.6,26.1,26.6,27.1,27.5,27.9]: add(sfx,x,pop(700+int((x-24)*120)),.13)
# S8 comment + S9 follow
typing(30.0,30.3,7); add(sfx,30.32,click(),.6); add(sfx,30.38,pop(800),.3)
add(sfx,30.65,glass(1568,1.0),.08)
add(sfx,31.8,glass(1568,1.4),.12)
add(sfx,33.6,click(),.7); add(sfx,33.65,pop(600),.4); add(sfx,33.7,glass(1568,1.4),.14); add(sfx,33.75,glass(2349,1.4),.09)
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
