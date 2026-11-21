import numpy as np, wave
R=48000; K=1.1; T=39.4/K; out=np.zeros(int(R*T)+R)
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
S=[3.45,5.05,9.05,11.25,14.35,16.3,18.9,22.15,26.4,30.4,33.55,35.35]
for s_ in S: add(s_-.45,whoosh(.8),.5)
add(.15,whoosh(.5),.25)
add(1.05,stamp(),.4); add(1.4,whoosh(.6),.3); add(1.45,thud(),.25)            # seal + doors
for k in range(5): add(1.75+k*.1,pop(),.15)
for k in range(6): add(4.1+k*.07,tick(),.4)                                    # cubes flip
add(4.5,thud(),.25)
for k in range(8): add(5.3+k*.14,tick(),.25)                                   # rings
for k in range(26): add(7.0+k*.05,tick(),.08)                                  # mosaic fill
add(7.4,pop(),.22)
add(9.7,whoosh(.3),.3); add(9.95,tick(),.5); add(9.98,beep(1500),.07)         # switch
for t in [10.5,10.65,10.8]: add(t,pop(),.18)
for t in [12.0,12.25,12.5,12.75,13.0]: add(t+.3,tick(),.45); add(t,whoosh(.25),.15)   # deal
add(14.6,tick(),.5); add(14.75,whoosh(.7),.25)                                 # dark wipe
for k in range(5): add(15.2+k*.08,pop(),.14)
for k in range(7): add(16.55+k*.05,tick(),.3)                                  # fan
for t in [17.4,17.75,18.05]: add(t,pop(),.16)
add(18.0,pop(),.22)
for i in range(16): add(19.3+i*.056,key(),.1)                                  # user msg
for i in range(18): add(20.3+i*.05,key(),.1)
add(21.5,beep(1300),.05); add(21.1,whoosh(.4),.2); add(21.5,thud(),.25)
for t in [22.4,23.2,24.6]: add(t+.3,thud(),.3); add(t+.38,thud(),.25)          # mirror layers
add(24.9,pop(),.22); add(25.15,pop(),.2)
add(28.0,whoosh(.4),.3); add(28.1,thud(),.25)                                  # eject
add(29.3,pop(),.2); add(29.5,pop(),.2)
add(31.1,tick(),.5); add(32.1,tick(),.5); add(32.76,tick(),.5); add(32.82,stamp(),.5)
for i in range(7): add(34.0+i*.065,key(),.3)
add(34.9,pop(),.3); add(35.4,thud(),.45); add(38.0,pop(),.4)
out=out/np.abs(out).max()*.8
w=wave.open('sfx.wav','w'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(R); w.writeframes((out*32767).astype(np.int16).tobytes()); w.close()
