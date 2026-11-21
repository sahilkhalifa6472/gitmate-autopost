import numpy as np, wave
R=48000; T=36.2; out=np.zeros(int(R*T))
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
S=[5.9,7.9,13.0,18.45,21.65,24.4,29.9,31.95]
for s in S: add(s-.42,whoosh(.75),.55)
for t in [6.7,6.9,7.1,10.9,11.3,11.7,12.0,18.5,19.24,20.16,20.75,23.6,23.8,24.0,28.32,29.12,29.35,31.4,32.24]: add(t,pop(),.25)
for t in [14.24,15.01,16.19,16.72,17.08,17.6]: add(t-.1,tick(),.5)
add(4.72,thud(),.6); add(31.95,thud(),.6); add(34.9,pop(),.35)
out=out/np.abs(out).max()*.8
w=wave.open('sfx.wav','w'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(R); w.writeframes((out*32767).astype(np.int16).tobytes()); w.close()
