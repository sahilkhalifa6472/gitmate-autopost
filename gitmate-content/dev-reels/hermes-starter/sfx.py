import numpy as np, wave
R=48000; T=35.2; out=np.zeros(int(R*T)+R)
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
S=[5.0,8.9,13.45,14.95,19.9,22.2,24.55,27.25,30.25,32.2]
for s_ in S: add(s_-.45,whoosh(.8),.5)
add(.1,whoosh(.5),.25); add(.2,thud(),.2)
for i in range(6): add(2.9+i*.058,key(),.12)              # hermes typed
add(3.3,whoosh(.5),.2); add(3.9,coin(),.08)                 # coin minted
add(5.1,thud(),.2); add(6.95,whoosh(.5),.25)                # book, cover flies
add(7.7,pop(),.2)
add(9.4,thud(),.25)
for k in range(7): add(10.6+k*.08,tick(),.25)               # dominoes stand
for k in range(7): add(12.4+k*.11,thud(),.2); add(12.42+k*.11,tick(),.4)  # fall
for i in range(12): add(13.2+i*.045,key(),.08)
add(13.95,thud(),.4); add(13.97,tick(),.6)                  # ENTER
for k in range(4): add(13.95+k*.08,pop(),.12)
for t in [16.5,17.3,18.7]: add(t,tick(),.5); add(t+.02,beep(1100),.05)  # cartridges
add(20.25,pop(),.2); add(20.5,whoosh(.4),.2)
for i in range(14): add(20.85+i*.05,key(),.06)
for k in range(2): add(21.55+k*.25,beep(1000),.06)           # heartbeat
add(22.9,thud(),.25); add(23.5,thud(),.25)                  # cards drop
for i in range(4): add(25.0+i*.14,tick(),.35)
add(25.8,pop(),.2); add(26.45,thud(),.35); add(26.47,tick(),.5)   # key press
add(28.5,pop(),.15)
for i in range(7): add(28.85+i*.08,key(),.1)
add(29.75,whoosh(.4),.25); add(30.1,thud(),.3); add(30.05,tick(),.4)  # into slot
add(30.2,pop(),.15)
for i in range(7): add(30.65+i*.065,key(),.3)
add(31.1,pop(),.3); add(32.25,thud(),.45); add(34.2,pop(),.4)
out=out/np.abs(out).max()*.8
w=wave.open('sfx.wav','w'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(R); w.writeframes((out*32767).astype(np.int16).tobytes()); w.close()
