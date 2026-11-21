import numpy as np, wave
R=48000; K=1.1; T=39.6/K; out=np.zeros(int(R*T)+R)
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
S=[6.35,10.3,14.05,17.35,21.3,24.05,28.45,32.4,34.05,35.95]
for s_ in S: add(s_-.45,whoosh(.8),.5)
add(.15,whoosh(.5),.25)
for i in range(30): add(.95+i*.06,tick(),.1)            # split-flap clatter
add(2.75,whoosh(.3),.25); add(3.05,stamp(),.45)          # strike + WRONG
add(4.35,pop(),.22); add(5.05,pop(),.22)
add(6.6,thud(),.4); add(8.0,whoosh(.4),.22); add(8.55,tick(),.35); add(8.45,pop(),.2)   # crate lid, card
add(10.55,pop(),.2)
for i in range(4): add(10.7+i*.6,whoosh(.4),.08)          # scan sweeps
for t in [11.6,11.95,12.35]: add(t,whoosh(.3),.18); add(t+.5,tick(),.35)   # map panels fold out
add(12.0,pop(),.22)
for t in [14.3,15.02,15.45,15.7,15.95]: add(t,pop(),.16)
for t in [15.9,16.1,16.3,16.45]: add(t+.3,tick(),.25)
add(16.2,pop(),.22)
for i in range(40): add(17.75+i*.04,key(),.1)              # question typing
add(19.35,whoosh(.4),.18)
for t in [21.6,21.95,22.3]: add(t,tick(),.4); add(t,beep(1300),.05)
add(22.65,thud(),.35); add(23.1,pop(),.22)
for t in [24.7,25.0]: add(t+.38,thud(),.45); add(t+.4,tick(),.35)
add(25.73,tick(),.4); add(25.75,whoosh(.3),.2)            # third chip bounces off
add(26.55,pop(),.25); add(27.4,pop(),.22)
for t in [30.3,31.02,31.8]: add(t+.08,key(),.45); add(t+.08,thud(),.2)    # keycaps
add(32.4,whoosh(.5),.25); add(32.95,tick(),.3); add(33.1,whoosh(.3),.2); add(33.5,tick(),.3)
for i in range(7): add(34.5+i*.07,tick(),.3)
add(35.1,pop(),.3); add(35.95,thud(),.5); add(38.8,pop(),.4)
out=out/np.abs(out).max()*.8
w=wave.open('sfx.wav','w'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(R); w.writeframes((out*32767).astype(np.int16).tobytes()); w.close()
