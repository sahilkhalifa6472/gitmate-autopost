import numpy as np, wave
R=48000; T=31.75; out=np.zeros(int(R*T)+R)
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
SP=1.0
S=[5.1, 9.45, 14.45, 19.45, 23.75, 26.6, 29.0]
for x in S: add(x-.5,whoosh(),.5)
add(0.1,thud(),.3)
for x in [0.28,1.8]: add(x,whoosh(.4),.2); add(x+.3,thud(),.35)
add(2.9,whoosh(.5),.22); add(3.25,thud(),.45)
for i in range(5): add(3.7+i*.08,tick(),.5)
add(4.25,thud(),.5); add(4.3,pop(),.3)
add(5.2,whoosh(.6),.25); add(6.0,whoosh(.6),.25); add(6.85,coin(),.22)
for i in range(10): add(8.28+i*.07,key(),.13)
add(9.12,coin(),.15)
for x in [10.16,10.8,11.44,12.04,12.92]: add(x,tick(),.6); add(x+.2,pop(),.2)
add(13.25,whoosh(.5),.22); add(13.6,beep(1400),.15)
add(15.0,whoosh(.5),.2); add(15.4,pop(),.2)
for i in range(3): add(17.7+i*.12,beep(1100+i*150),.15)
add(18.32,thud(),.7); add(18.36,tick(),.7)
for i in range(10): add(18.6+i*.045,key(),.12)
for i in range(14): add(20.8+i*.075,tick(),.35)
add(21.9,coin(),.2)
add(22.3,whoosh(.4),.2)
for i in range(16): add(22.55+i*.028,key(),.15)
add(23.12,tick(),.7); add(23.15,pop(),.3)
for i in range(7): add(25.85+i*.05,key(),.25)
add(26.2,whoosh(.4),.3); add(26.5,pop(),.25)
for i in range(7): add(27.3+i*.065,key(),.3)
add(28.3,pop(),.3); add(29.05,thud(),.45); add(31.0,pop(),.4)
out=out/np.abs(out).max()*.8
w=wave.open('sfx.wav','w'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(R); w.writeframes((out*32767).astype(np.int16).tobytes()); w.close()
