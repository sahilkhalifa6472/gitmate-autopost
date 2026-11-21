import numpy as np, wave
R=48000; T=38.0/1.08; out=np.zeros(int(R*T)+R)
rng=np.random.default_rng(21)
def add(t,s,g=1):
    i=int(t*R); n=min(len(s),len(out)-i); out[i:i+n]+=s[:n]*g
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
def key():
    n=int(R*.06); t=np.arange(n)/R; return (rng.standard_normal(n)*.6+np.sin(2*np.pi*240*t))*np.exp(-t*90)
def beep(f=1400):
    n=int(R*.08); t=np.arange(n)/R; return np.sin(2*np.pi*f*t)*np.exp(-t*30)
def coin():
    n=int(R*.5); t=np.arange(n)/R; return (np.sin(2*np.pi*2100*t)+.6*np.sin(2*np.pi*3150*t))*np.exp(-t*9)
SP=1.08
_a=add
def add(t,s,g=1): _a(t/SP,s,g)
S=[5.75, 11.85, 16.2, 21.85, 26.25, 30.55, 33.05, 35.1]
for x in S: add(x-.5,whoosh(),.5)
for i in range(4): add(.5+i*.25,pop(),.2)
for i in range(4): add(3.45+i*.08,thud(),.25)
add(3.72,tick(),.6); add(4.05,thud(),.5)
add(6.3,pop(),.25); add(9.0,whoosh(.6),.3); add(9.9,thud(),.3)
for i in range(3): add(10.3+i*.43,key(),.3)
for x in [12.48,13.28,13.8]: add(x,whoosh(.4),.25)
for i in range(10): add(15.0+i*.05,tick(),.25)
add(17.3,pop(),.25)
for i in range(16): add(17.9+i*.1,tick(),.15)
add(19.65,beep(1600),.25); add(19.8,tick(),.6); add(20.3,tick(),.6); add(21.0,thud(),.4)
add(22.6,thud(),.3)
for x in [23.44,24.2,24.8]: add(x,thud(),.4); add(x+.3,pop(),.2)
add(26.4,pop(),.25); add(28.5,whoosh(.5),.25)
for i in range(10): add(28.9+i*.1,tick(),.15)
add(30.0,coin(),.35)
for i in range(7): add(31.95+i*.1,thud(),.3)
add(32.3,pop(),.3)
add(33.0,pop(),.25)
for i in range(7): add(33.75+i*.065,key(),.3)
add(34.5,pop(),.3); add(35.2,thud(),.45); add(37.15,pop(),.4)
out=out/np.abs(out).max()*.8
w=wave.open('sfx.wav','w'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(R); w.writeframes((out*32767).astype(np.int16).tobytes()); w.close()
