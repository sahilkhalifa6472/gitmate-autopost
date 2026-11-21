import numpy as np, wave
R=48000; T=34.15; out=np.zeros(int(R*T)+R)
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
S=[4.75,10.7,13.6,16.6,22.1,25.55,28.55,31.0]
for s_ in S: add(s_-.45,whoosh(.8),.5)
for i in range(5): add(.1+i*.08,whoosh(.3),.12)
for i in range(18): add(2.45+i*.05,key(),.08)
add(3.6,thud(),.3); add(3.62,beep(500),.06); add(3.95,whoosh(.6),.2)
for t in [8.0,8.7,9.4,10.1]: add(t,tick(),.9); add(t+.02,pop(),.12); add(t+.1,thud(),.12)
for i in range(30): add(11.0+i*.043,key(),.06)
add(12.65,pop(),.2)
for i in range(16): add(12.7+i*.047,tick(),.15)
for i in range(6): add(14.75+i*.28,tick(),.3)
add(15.85,thud(),.3); add(15.9,beep(700),.05)
for i in range(6): add(15.9+i*.07,key(),.08)
add(17.9,thud(),.35); add(17.92,beep(900),.05)
for i in range(12): add(19.0+i*.05,tick(),.25)
add(20.1,pop(),.25); add(20.12,beep(1400),.04)
for i in range(10): add(21.0+i*.05,key(),.06)
for i in range(14): add(23.6+i*.1,tick(),.15)
add(26.9,whoosh(.5),.25); add(27.25,whoosh(.4),.2)
for i in range(7): add(27.55+i*.07,tick(),.4)
add(27.4,pop(),.25)
for i in range(7): add(29.15+i*.065,key(),.3)
add(29.9,pop(),.3); add(31.0,thud(),.45); add(32.95,pop(),.4)
out=out/np.abs(out).max()*.8
w=wave.open('sfx.wav','w'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(R); w.writeframes((out*32767).astype(np.int16).tobytes()); w.close()
