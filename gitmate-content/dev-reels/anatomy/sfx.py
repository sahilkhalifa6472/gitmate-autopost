import numpy as np, wave
R=48000; T=35.4; out=np.zeros(int(R*T))
rng=np.random.default_rng(3)
def add(t,s,g=1):
    i=int(t*R); n=min(len(s),len(out)-i); out[i:i+n]+=s[:n]*g
def whoosh(d=.7):
    n=int(R*d); x=rng.standard_normal(n); 
    # moving lowpass via cumulative smoothing
    k=np.linspace(0,1,n); env=np.sin(np.pi*k)**2
    y=np.zeros(n); a=0
    for i in range(n):
        c=.02+.25*env[i]; a+= c*(x[i]-a); y[i]=a
    return y*env/ (np.abs(y).max()+1e-9)
def pop():
    n=int(R*.09); t=np.arange(n)/R; return np.sin(2*np.pi*(900-3000*t)*t)*np.exp(-t*55)
def tick():
    n=int(R*.03); t=np.arange(n)/R; return rng.standard_normal(n)*np.exp(-t*260)*.5
def thud():
    n=int(R*.4); t=np.arange(n)/R; return np.sin(2*np.pi*(70-40*t)*t)*np.exp(-t*9)
S=[5.1,10.7,13.6,16.9,18.85,21.1,24.1,28.85,31.0]
for s_ in S: add(s_-.42,whoosh(.75),.55)
for t in [5.6+i*.06 for i in range(7)]+[7.6,12.25,12.42,12.6,13.6,14.5,15.4,25.75,26.95,28.0,30.4]: add(t,pop(),.22)
for t in [10.95+i*.06 for i in range(16)]+[24.55+i*.05 for i in range(20)]+[29.3+i*.27 for i in range(7)]: add(t,tick(),.35)
add(4.5,thud(),.5); add(18.0,thud(),.6); add(31.5,thud(),.55); add(31.78,pop(),.4)
out=out/np.abs(out).max()*.8
w=wave.open('sfx.wav','w'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(R); w.writeframes((out*32767).astype(np.int16).tobytes()); w.close()
