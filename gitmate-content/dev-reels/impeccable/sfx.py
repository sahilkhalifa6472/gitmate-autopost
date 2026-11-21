import numpy as np, wave
R=48000; K=1.07; T=39.2/K; out=np.zeros(int(R*T)+R)
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
S=[4.55,10.15,15.15,19.3,22.35,25.65,29.75,34.3,36.3]
for s_ in S: add(s_-.45,whoosh(.8),.5)
for i in range(5): add(.15+(4-i)*.3,whoosh(.35),.25); add(.45+(4-i)*.3,thud(),.25)
for i in range(18): add(.85+i*.035,tick(),.15)
for t in [6.1,6.2,6.3]: add(t,tick(),.3)
for i in range(10): add(6.8+i*.045,tick(),.15)
for t in [9.2,9.35,9.5]: add(t,pop(),.2)
for t in [11.34,12.6,13.74]: add(t,pop(),.25); add(t+.62,stamp(),.4)
add(16.35,whoosh(.5),.2); add(17.3,whoosh(.9),.4); add(18.1,thud(),.5)
for t in [20.2,20.84,21.62]: add(t,key(),.5)
for i in range(5): add(22.9+i*.16,tick(),.25)
for i in range(4): add(24.45+i*.18,thud(),.3)
for i in range(26): add(26.1+i*.027,tick(),.15)
for i in range(31): add(26.9+i*.032,tick(),.12)
for t in [27.05,27.3,27.55,27.75]: add(t,beep(1500),.12)
add(28.54,pop(),.25); add(28.7,pop(),.2)
for t in [30.0,30.85,31.45]:
    for j in range(4): add(t+j*.06,tick(),.25)
for i in range(24): add(33.1+i*.034,tick(),.15)
for i in range(7): add(34.9+i*.086,tick(),.3)
add(35.5,pop(),.3); add(36.3,thud(),.5); add(38.3,pop(),.4)
out=out/np.abs(out).max()*.8
w=wave.open('sfx.wav','w'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(R); w.writeframes((out*32767).astype(np.int16).tobytes()); w.close()
