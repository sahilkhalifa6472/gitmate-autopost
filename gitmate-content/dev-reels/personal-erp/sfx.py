import numpy as np, wave
R=48000; T=35.3; out=np.zeros(int(R*T)+R)
rng=np.random.default_rng(15)
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
S=[4.2,7.15,10.45,16.75,20.45,22.8,24.95,27.0,29.85,32.2]
for s_ in S: add(s_-.45,whoosh(.8),.5)
add(.1,thud(),.2)
for i in range(22): add(.4+i*.13,tick(),.25)               # receipt printing
add(1.4,beep(1300),.04); add(3.3,pop(),.15)
add(4.3,whoosh(.5),.2); add(5.0,thud(),.2)
for i in range(3): add(6.4+i*.15,pop(),.15)
add(7.3,thud(),.25); add(8.0,pop(),.15)
for t in [11.2,12.5,14.62,15.26]: add(t,whoosh(.35),.22); add(t+.3,tick(),.5)
for t in [10.76,11.5,12.8,14.92,15.56]: add(t,beep(1200),.04)
add(17.0,thud(),.25); add(17.4,thud(),.2)
for i in range(5): add(18.3+i*.3,tick(),.35)
add(19.9,beep(1000),.05)
add(21.0,whoosh(.3),.2); add(21.4,thud(),.45); add(21.42,tick(),.6)
add(22.15,whoosh(.5),.3)
for i in range(17): add(23.1+i*.038,key(),.08)
for t in [24.0,24.12,24.24,24.36]: add(t,beep(1400),.05)
for i in range(6): add(25.45+i*.09,key(),.07)
add(26.0,whoosh(.3),.12)
for i in range(7): add(28.8+i*.07,key(),.1)
add(29.4,pop(),.25); add(29.45,whoosh(.6),.3)
for i in range(7): add(30.6+i*.065,key(),.3)
add(31.1,pop(),.3); add(32.25,thud(),.45); add(34.2,pop(),.4)
out=out/np.abs(out).max()*.8
w=wave.open('sfx.wav','w'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(R); w.writeframes((out*32767).astype(np.int16).tobytes()); w.close()
