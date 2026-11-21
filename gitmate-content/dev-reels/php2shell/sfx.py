import numpy as np, wave
R=48000; T=38.2; out=np.zeros(int(R*T))
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
S=[5.55,10.05,15.25,20.4,23.95,26.05,31.35,33.1,34.8]
for s in S: add(s-.42,whoosh(.75),.55)
for t in [5.74,6.58,13.0,13.3,13.7,17.75,25.24,28.14,28.3,28.46,28.62,32.15,32.5,34.3,35.04]: add(t,pop(),.25)
for t in [12.2+i*.3 for i in range(8)]+[18.9,19.08,19.26]: add(t,tick(),.5)
add(4.7,thud(),.6); add(9.0,thud(),.5); add(22.62,thud(),.6); add(34.8,thud(),.6); add(36.6,pop(),.35)
out=out/np.abs(out).max()*.8
w=wave.open('sfx.wav','w'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(R); w.writeframes((out*32767).astype(np.int16).tobytes()); w.close()
