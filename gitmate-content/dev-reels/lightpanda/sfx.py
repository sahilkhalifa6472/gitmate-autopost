import numpy as np, wave
R=48000; K=1.04; T=36.6/K; out=np.zeros(int(R*T)+R)
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
S=[5.0,9.5,15.1,19.75,23.45,28.15,31.15,33.35]
for s_ in S: add(s_-.45,whoosh(.8),.5)
add(.25,whoosh(.5),.25)
for i in range(21): add(.7+i*.03,tick(),.12)
add(2.28,thud(),.6); add(2.6,pop(),.2)
add(3.98,tick(),.4); add(3.75,pop(),.2); add(3.96,pop(),.25)
add(5.1,whoosh(1.0),.3); add(6.3,tick(),.3)
for i in range(10): add(5.42+i*.04,tick(),.12)
add(8.5,pop(),.25)
for i in range(6): add(9.7+i*.1,tick(),.2)
add(10.24,whoosh(.3),.25)
for k in range(3): add(10.95+k*.25,whoosh(.25),.2); add(11.95+k*.1,whoosh(.5),.25)
for t in [12.68,13.24,14.22]: add(t+.2,stamp(),.4)
for i in range(20): add(16.5+i*.047,tick(),.15)
add(17.5,stamp(),.4); add(18.8,beep(1100),.15)
add(20.25,thud(),.4)
for i in range(16): add(21.25+i*.1,thud(),.18); add(21.25+i*.1,tick(),.15)
add(22.25,pop(),.25)
add(25.14,key(),.4); add(27.05,thud(),.5); add(27.1,beep(1600),.15); add(26.95,pop(),.2)
for i in range(40): add(28.45+i*.045,tick(),.1)
for i in range(12): add(29.6+i*.06,tick(),.12)
for i in range(7): add(31.75+i*.086,tick(),.3)
add(32.42,pop(),.3); add(33.35,thud(),.5); add(35.35,pop(),.4)
out=out/np.abs(out).max()*.8
w=wave.open('sfx.wav','w'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(R); w.writeframes((out*32767).astype(np.int16).tobytes()); w.close()
