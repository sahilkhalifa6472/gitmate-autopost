import numpy as np, wave
R=48000; K=1.07; T=38.7/K; out=np.zeros(int(R*T)+R)
rng=np.random.default_rng(11)
def add(t,s,g=1):  # t in raw voice seconds
    i=int(t/K*R); n=min(len(s),len(out)-i); out[i:i+n]+=s[:n]*g
def whoosh(d=.7):
    n=int(R*d); x=rng.standard_normal(n); k=np.linspace(0,1,n); env=np.sin(np.pi*k)**2
    y=np.zeros(n); a=0
    for i in range(n):
        c=.02+.25*env[i]; a+=c*(x[i]-a); y[i]=a
    return y*env/(np.abs(y).max()+1e-9)
def pop():
    n=int(R*.09); t=np.arange(n)/R; return np.sin(2*np.pi*(900-3000*t)*t)*np.exp(-t*55)
def tick():
    n=int(R*.03); t=np.arange(n)/R; return rng.standard_normal(n)*np.exp(-t*260)*.5
def thud():
    n=int(R*.4); t=np.arange(n)/R; return np.sin(2*np.pi*(70-40*t)*t)*np.exp(-t*9)
def stamp():
    return thud()*.8+np.pad(tick()*2,(0,int(R*.37)))
def key():
    n=int(R*.06); t=np.arange(n)/R; return (rng.standard_normal(n)*.6+np.sin(2*np.pi*240*t))*np.exp(-t*90)
def beep(f=1400):
    n=int(R*.08); t=np.arange(n)/R; return np.sin(2*np.pi*f*t)*np.exp(-t*30)
S=[5.6,10.6,14.35,18.45,23.85,27.0,32.7,34.85]
S=[4.3,8.75,11.8,16.9,20.85,24.35,28.2,30.65,33.85,35.8]
for s_ in S: add(s_-.45,whoosh(.8),.5)
add(.15,whoosh(.5),.25)
for i in range(16): add(.6+i*.125,tick(),.18)          # receipt printing steps
add(3.5,stamp(),.5)                                     # NOT NEEDED
add(4.6,pop(),.2); add(5.55,thud(),.45); add(5.57,tick(),.3)   # logo, dome lands
add(7.6,pop(),.2)
for t in [8.95,9.98,10.8]: add(t,whoosh(.35),.22); add(t+.4,tick(),.35)   # gates swing
for t in [12.34,13.3,14.16]: add(t,pop(),.2)
for t in [12.95,13.9,14.8]: add(t,tick(),.45); add(t+.03,thud(),.2)        # plugs seat
for k in range(4): add(15.74+k*.12,tick(),.35)
for t in [17.3,17.95,19.0]: add(t,pop(),.18); add(t+.6,whoosh(.3),.15); add(t+.95,beep(1500),.07)
add(19.65,pop(),.25)
for t in [21.52,22.07,23.27]: add(t,thud(),.55); add(t+.02,tick(),.35)     # containers land
for i in range(12): add(25.6+i*.08,tick(),.08)
add(25.45,pop(),.2); add(27.2,pop(),.22)
add(29.0,whoosh(.5),.25); add(29.85,thud(),.35); add(29.87,tick(),.4)    # cartridge swap
for i in range(17): add(30.85+i*.053,key(),.12)
for i in range(15): add(31.75+i*.07,pop(),.07)
add(32.75,pop(),.25)
for i in range(7): add(34.25+i*.07,tick(),.3)
add(34.75,pop(),.3); add(35.8,thud(),.5); add(37.65,pop(),.4)
out=out/np.abs(out).max()*.8
w=wave.open('sfx.wav','w'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(R); w.writeframes((out*32767).astype(np.int16).tobytes()); w.close()
