import numpy as np, wave
R=48000; T=40.0; n=int(R*T); t=np.arange(n)/R
out=np.zeros((n,2))
bpm=100; beat=60/bpm
def note(f): return 440*2**((f-69)/12)
# chords: Cmaj7, Am7, Fmaj7, G6 (2 bars each = 8 beats)
CH=[[60,64,67,71],[57,60,64,67],[53,57,60,64],[55,59,62,64]]
bar=beat*4
# warm pad
pad=np.zeros(n)
for k in range(int(T/(bar*2))+1):
    c=CH[k%4]; s=int(k*bar*2*R); e=min(n,int((k+1)*bar*2*R)+int(.6*R))
    if s>=n: break
    tt=np.arange(e-s)/R; env=np.minimum(1,tt/.8)*np.minimum(1,(e-s)/R-tt+.001)
    for m in c:
        f=note(m-12)
        pad[s:e]+=env*(np.sin(2*np.pi*f*tt)+.3*np.sin(2*np.pi*f*2.003*tt))*.08
# soft plucks (arp) on 8ths
pl=np.zeros(n)
step=beat/2; i=0
while i*step<T:
    c=CH[int(i*step/(bar*2))%4]; m=c[[0,2,1,3,2,1,3,2][i%8]]+12
    s=int(i*step*R); L=int(.9*R); e=min(n,s+L); tt=np.arange(e-s)/R
    f=note(m); env=np.exp(-tt*5.5)*(1-np.exp(-tt*300))
    pl[s:e]+=env*(np.sin(2*np.pi*f*tt)+.25*np.sin(2*np.pi*2*f*tt)+.08*np.sin(2*np.pi*3*f*tt))*.10
    i+=1
# light kick + shaker
dr=np.zeros(n); rng=np.random.default_rng(1)
for b in range(int(T/beat)):
    s=int(b*beat*R)
    if b%2==0:
        L=int(.25*R); tt=np.arange(min(L,n-s))/R; dr[s:s+len(tt)]+=np.sin(2*np.pi*(55+60*np.exp(-tt*30))*tt)*np.exp(-tt*14)*.22
    s2=int((b+.5)*beat*R); L=int(.05*R)
    if s2+L<n: tt=np.arange(L)/R; dr[s2:s2+L]+=rng.standard_normal(L)*np.exp(-tt*80)*.03
mono=pad+pl+dr
# simple stereo widening on plucks via delay
d=int(.012*R)
out[:,0]=pad+pl+dr; out[d:,1]=(pad+dr)[d:]+pl[:-d]
out/=np.abs(out).max()/0.8
fade=np.ones(n); fi=int(.8*R); fade[:fi]=np.linspace(0,1,fi)
out*=fade[:,None]
w=wave.open('lightmusic.wav','w'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(R); w.writeframes((out*32767).astype(np.int16).tobytes()); w.close()
