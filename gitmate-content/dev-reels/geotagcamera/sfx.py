import numpy as np, wave
R=48000; T=35.1/1.06; out=np.zeros(int(R*T)+R)
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
SP=1.06
_a=add
def add(t,s,g=1): _a(t/SP,s,g)
S=[6.95, 10.55, 15.45, 20.75, 24.85, 27.2, 30.1, 32.25]
for x in S: add(x-.5,whoosh(),.5)
add(0.1,thud(),.3)
for i in range(5): add(2.16+i*.4,beep(900),.18)
add(4.6,whoosh(.5),.25); add(5.0,thud(),.3); add(5.45,tick(),.7); add(5.62,thud(),.5)
add(7.2,whoosh(.6),.3); add(7.8,pop(),.25)
for i in range(12): add(9.3+i*.065,key(),.15)
add(10.7,pop(),.25)
for x in [11.56,12.16,12.72,13.48]: add(x,tick(),.6); add(x+.25,pop(),.2)
add(15.4,whoosh(.5),.25); add(16.3,thud(),.6); add(16.32,coin(),.2)
for i in range(18): add(16.6+i*.08,key(),.12)
add(18.3,whoosh(.5),.25); add(18.9,beep(1600),.2)
for i in range(4): add(21.2+i*.12,tick(),.5)
for i in range(10): add(21.75+i*.06,key(),.12)
for x in [22.56,23.2,24.08]: add(x-.25,thud(),.35); add(x+.12,pop(),.3)
add(24.9,whoosh(.6),.3); add(25.6,thud(),.5)
for i in range(10): add(25.5+i*.06,key(),.12)
add(26.5,pop(),.25)
add(27.5,whoosh(.5),.25)
for i in range(7): add(28.9+i*.05,key(),.25)
add(29.3,whoosh(.4),.3); add(29.6,pop(),.25)
add(29.95,pop(),.25)
for i in range(7): add(30.7+i*.065,key(),.3)
add(31.35,pop(),.3); add(32.3,thud(),.45); add(34.25,pop(),.4)
out=out/np.abs(out).max()*.8
w=wave.open('sfx.wav','w'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(R); w.writeframes((out*32767).astype(np.int16).tobytes()); w.close()
