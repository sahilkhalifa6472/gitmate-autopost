import numpy as np, wave
R=48000; T=37.4; out=np.zeros(int(R*T))
rng=np.random.default_rng(7)
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
def beep(f=1400):
    n=int(R*.08); t=np.arange(n)/R; return np.sin(2*np.pi*f*t)*np.exp(-t*30)
def buzz(d=.5):
    n=int(R*d); t=np.arange(n)/R; return (np.sign(np.sin(2*np.pi*95*t))*.5+rng.standard_normal(n)*.3)*np.sin(np.pi*t/d)
def clack():  # rail joint
    return tick()*1.5
S=[5.45,10.25,16.45,18.75,24.95,29.2,32.8,34.62]
for s_ in S: add(s_-.42,whoosh(.75),.5)
for t in [0.75+i*.04 for i in range(9)]: add(t,tick(),.2)
for t in [1.25+i*.035 for i in range(12)]: add(t,tick(),.18)
for t in np.arange(0.3,5.2,.21): add(t,clack(),.12)
add(4.4,clank(),.3); add(4.45,thud(),.4)
for t in [7.3,7.42,7.54,7.72,7.84,7.96,8.14,8.26,8.38]: add(t,tick(),.3)
add(8.62,thud(),.7); add(8.63,clank(),.2)
for t in [10.45,11.1,11.35,11.6]: add(t,clack(),.4)
for t in [12.3,12.5,12.7]: add(t,pop(),.2)
for t in np.arange(14.1,15.6,.12): add(t,clack(),.15)
add(15.2,pop(),.3)
add(17.45,thud(),.6); add(17.47,pop(),.3)
add(18.3,buzz(.6),.25)
add(21.6,pop(),.2); add(21.75,pop(),.2); add(21.9,pop(),.2); add(23.4,pop(),.3)
for t in [25.13,25.73,26.27,26.88]: add(t,pop(),.2)
add(27.8,whoosh(.5),.35); add(28.4,thud(),.4)
for t in [30.95+i*.016*1 for i in range(0,44,2)]: add(t,tick(),.18)
for k,t in enumerate([31.45,31.6,31.75]): add(t,beep(1200+200*k),.18)
add(31.9,beep(1900),.25); add(31.9,pop(),.2)
for t in [33.1+i*.086 for i in range(7)]: add(t,tick(),.3)
add(33.85,pop(),.3); add(34.65,thud(),.5); add(36.5,pop(),.4)
out=out/np.abs(out).max()*.8
w=wave.open('sfx.wav','w'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(R); w.writeframes((out*32767).astype(np.int16).tobytes()); w.close()
