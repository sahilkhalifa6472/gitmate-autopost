import numpy as np, wave
R=48000; T=40.0/1.12; out=np.zeros(int(R*T)+R)
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
SP=1.12
_a=add
def add(t,s,g=1): _a(t/SP,s,g)
S=[4.85, 11.3, 15.4, 17.25, 22.4, 26.3, 29.8, 34.55, 36.95]
for s_ in S: add(s_-.45,whoosh(.8),.5)
for i in range(6): add(.1+i*.07,whoosh(.3),.1)
add(0.5,thud(),.3)
for t in [2.95,3.45]: add(t,tick(),.9); add(t+.01,beep(400),.05)
add(3.75,pop(),.2)
add(5.0,whoosh(.6),.25); add(5.75,thud(),.3); add(5.78,coin(),.06)
for i in range(10): add(6.0+i*.045,key(),.06)
add(8.2,whoosh(.8),.3); add(9.0,thud(),.25)
for i in range(12): add(7.3+i*.075,key(),.05)
add(11.6,whoosh(.5),.2)
for i in range(4): add(13.6+i*.3,tick(),.4)
for i in range(3): add(15.75+i*.15,whoosh(.3),.15)
for i in range(3): add(16.5+i*.06,thud(),.15)
add(16.35,pop(),.25)
add(17.3,whoosh(.6),.2); add(18.5,whoosh(.5),.25); add(18.95,thud(),.2); add(20.4,whoosh(.5),.25); add(20.85,thud(),.2)
for i in range(14): add(24.4+i*.08,tick(),.15)
add(25.55,pop(),.2); add(25.0,beep(1400),.04); add(25.25,pop(),.2)
add(27.75,whoosh(.7),.25); add(28.6,thud(),.35); add(28.62,beep(900),.05)
for i in range(20): add(28.3+i*.035,key(),.05)
add(28.8,pop(),.25)
add(30.5,pop(),.25); add(31.1,thud(),.4); add(32.0,pop(),.25); add(33.2,pop(),.3)
for i in range(7): add(35.15+i*.065,key(),.3)
add(35.9,pop(),.3); add(37.0,thud(),.45); add(38.95,pop(),.4)
out=out/np.abs(out).max()*.8
w=wave.open('sfx.wav','w'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(R); w.writeframes((out*32767).astype(np.int16).tobytes()); w.close()
