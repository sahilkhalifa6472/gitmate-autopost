import numpy as np, wave
R=48000; T=34.4; out=np.zeros(int(R*T))
rng=np.random.default_rng(5)
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
def clank():
    n=int(R*.5); t=np.arange(n)/R; return (np.sin(2*np.pi*1800*t)*.4+np.sin(2*np.pi*2730*t)*.3+np.sin(2*np.pi*90*t))*np.exp(-t*12)
S=[4.0,10.45,12.05,16.7,19.85,22.45,26.5,28.55,30.85]
for s_ in S: add(s_-.42,whoosh(.75),.5)
for t in [0.45+i*.08 for i in range(14)]: add(t,tick(),.25)
add(3.0,thud(),.6); add(3.02,pop(),.3)
for t in [4.5,6.5,8.35]: add(t,pop(),.25)
add(11.04,thud(),.7); add(11.04,clank(),.35)
for t in [14.6,15.36,16.0]: add(t,thud(),.35); add(t,tick(),.4)
for t in [17.44,17.64,17.84,17.94,18.14,18.34]: add(t,tick(),.35)
add(20.15,pop(),.25); add(21.0,pop(),.25)
for t in [24.6,25.0,25.5]: add(t,pop(),.25)
for t in [26.75+i*.05 for i in range(30)]: add(t,tick(),.2)
for t in [29.2+i*.086 for i in range(7)]: add(t,tick(),.3)
add(30.2,pop(),.3); add(30.9,thud(),.5); add(33.1,pop(),.4)
out=out/np.abs(out).max()*.8
w=wave.open('sfx.wav','w'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(R); w.writeframes((out*32767).astype(np.int16).tobytes()); w.close()
