import numpy as np, wave
R=48000; K=1.07; T=37.75/K; out=np.zeros(int(R*T)+R)
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
S=[5.6,10.6,14.35,18.45,23.85,27.0,32.7,34.85]
for s_ in S: add(s_-.45,whoosh(.8),.5)
add(.25,whoosh(.5),.25)
for i in range(12): add(1.5+i*.067,key(),.12)
add(3.5,whoosh(.4),.2); add(3.95,thud(),.45); add(3.97,tick(),.3); add(4.2,pop(),.2); add(4.3,pop(),.25)
add(5.9,whoosh(1.0),.3); add(9.42,pop(),.25)
for k in range(3): add(10.7+k*.15,whoosh(.3),.18)
for k in range(4): add(11.45+k*.32,tick(),.3); add(11.47+k*.32,beep(1700),.06)
for k in range(3): add(12.3+k*.12,whoosh(.4),.2)
add(13.5,tick(),.3); add(13.75,whoosh(.5),.2)
add(15.35,whoosh(1.0),.22)
for t in [16.1,16.5,16.58,16.66,17.0,17.1]: add(t,pop(),.16)
for k in range(5):
    for i in range(6): add(19.5+k*.1+i*.05,tick(),.08)
for i in range(20): add(20.4+i*.04,key(),.12)
add(21.25,thud(),.5); add(21.27,tick(),.4)
add(22.15,tick(),.6); add(22.2,tick(),.4); add(22.15,whoosh(.25),.15)
add(22.75,pop(),.25); add(22.8,beep(1300),.1)
add(24.0,whoosh(1.0),.3); add(24.6,whoosh(.6),.15); add(26.0,pop(),.22)
for t in [27.1,27.6,28.36]: add(t,pop(),.22)
add(29.35,stamp(),.45)
for i in range(12): add(29.5+i*.06,key(),.12)
add(30.3,pop(),.2)
for i in range(25): add(30.6+i*.04,tick(),.1)
for i in range(7): add(33.4+i*.086,tick(),.3)
add(34.2,pop(),.3); add(34.85,thud(),.5); add(36.75,pop(),.4)
out=out/np.abs(out).max()*.8
w=wave.open('sfx.wav','w'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(R); w.writeframes((out*32767).astype(np.int16).tobytes()); w.close()
