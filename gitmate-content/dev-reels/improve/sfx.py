import numpy as np, wave
R=48000; K=1.1; T=41.7/K; out=np.zeros(int(R*T)+R)
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
S=[3.45,5.05,9.05,11.25,14.35,16.3,18.9,22.15,26.4,30.4,33.55,35.35]
S=[6.35,7.75,11.9,15.0,18.25,21.45,24.35,28.05,32.1,36.85,38.85]
for s_ in S: add(s_-.45,whoosh(.8),.5)
add(.1,whoosh(.5),.25); add(.2,thud(),.2)
add(3.75,whoosh(.3),.2); add(4.05,stamp(),.4)                                  # BOSS plate
for k in range(3): add(4.5+k*.04,tick(),.3)
for k in range(3): add(4.75+k*.12,pop(),.15)
for k in range(7): add(6.25+k*.07,thud(),.18); add(6.3+k*.07,tick(),.3)         # type blocks
for i in range(8): add(8.15+i*.068,key(),.12)                                   # /improve typed
for k in range(10): add(8.6+k*.38,tick(),.18)                                   # belt
add(9.0,beep(1500),.05); add(9.9,beep(1300),.05)
for t in [12.12,12.64,13.6,14.2]: add(t,whoosh(.3),.2); add(t+.3,thud(),.3)    # drawers
add(14.6,pop(),.2)
add(16.55,whoosh(.3),.2); add(16.85,stamp(),.4)                                 # pin
add(16.85,pop(),.15); add(17.15,pop(),.15)
add(18.6,whoosh(1.6),.15)                                                       # vet bar
add(18.95,beep(1500),.05); add(19.4,beep(1500),.05); add(19.9,beep(600),.06)
add(20.35,tick(),.5); add(20.45,whoosh(.6),.3); add(21.0,thud(),.25)          # trapdoor
add(21.85,pop(),.2); add(22.05,tick(),.5)
add(23.1,whoosh(.4),.25); add(23.55,thud(),.25)                                 # file drops
for t in [25.0,27.2,27.6]: add(t+.3,thud(),.25); add(t,whoosh(.3),.12)          # puck hops
for t in [27.15,27.55,27.95]: add(t,pop(),.15)
add(28.6,whoosh(.5),.2); add(29.1,thud(),.35); add(29.55,pop(),.18)            # jar
add(30.3,whoosh(.6),.2); add(30.8,pop(),.22); add(30.95,pop(),.18)
for i in range(29): add(33.4+i*2.5/29,key(),.09)                                # label printer
add(35.95,tick(),.4)
add(37.0,pop(),.2)
for i in range(7): add(37.45+i*.065,key(),.3)
add(38.3,pop(),.3); add(38.9,thud(),.45); add(40.85,pop(),.4)
out=out/np.abs(out).max()*.8
w=wave.open('sfx.wav','w'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(R); w.writeframes((out*32767).astype(np.int16).tobytes()); w.close()
