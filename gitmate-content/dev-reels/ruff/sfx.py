import numpy as np, wave
R=48000; K=1.16; T=44.5/K; out=np.zeros(int(R*T)+R)
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
S=[5.05,7.95,11.9,20.3,26.5,31.35,35.1,38.9,40.85]
for s_ in S: add(s_-.45,whoosh(.8),.5)
add(.15,whoosh(.5),.25)
for i in range(60): add(.9+i*.065,tick(),.06)             # spinner/timer ticks
add(4.0,pop(),.22)
add(6.6,whoosh(.35),.3); add(6.62,tick(),.5); add(6.7,beep(1700),.08)   # iris snap
add(6.9,pop(),.22)
add(8.3,whoosh(.6),.25); add(8.5,thud(),.35)
for t in [9.7,10.24,11.2]: add(t,tick(),.35)
for t in [15.05,17.0]: add(t,pop(),.2)
add(17.92,whoosh(.25),.35); add(18.14,tick(),.5); add(18.94,beep(1500),.08); add(18.94,pop(),.25)
add(20.6,thud(),.3)
for t in [22.25,23.0,23.62,24.25]: add(t+.32,thud(),.45); add(t+.32,tick(),.3)
add(25.1,whoosh(.3),.25); add(25.4,stamp(),.6); add(25.45,pop(),.2)
add(26.5,whoosh(.5),.2)
for k in range(6): add(27.0+k*.09,tick(),.3)
add(28.9,pop(),.2); add(29.0,beep(900),.05); add(29.2,beep(900),.05)
add(29.5,whoosh(.3),.2); add(29.65,whoosh(.3),.2); add(29.95,pop(),.25)
for t in [31.4,32.3,32.95,33.45,33.6,33.75]: add(t+.3,thud(),.3); add(t+.3,tick(),.25)
add(34.05,pop(),.22)
add(35.1,whoosh(.5),.2); add(35.8,thud(),.3)
for i in range(14): add(35.6+i*.078,key(),.12)
add(36.85,beep(1300),.05)
for i in range(11): add(37.3+i*.06,key(),.12)
add(38.0,beep(1300),.05); add(38.05,pop(),.2)
for i in range(7): add(39.45+i*.065,key(),.3)
add(40.1,pop(),.3); add(40.9,thud(),.5); add(43.5,pop(),.4)
out=out/np.abs(out).max()*.8
w=wave.open('sfx.wav','w'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(R); w.writeframes((out*32767).astype(np.int16).tobytes()); w.close()
