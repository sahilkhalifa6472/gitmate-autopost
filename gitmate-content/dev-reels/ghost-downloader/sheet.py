import sys,glob
from PIL import Image
import os
D=os.environ.get('SD','shots')
fs=[f'{D}/s{float(t):.2f}.jpg' for t in sys.argv[2:]]
W=270;H=480;cols=6;rows=(len(fs)+cols-1)//cols
sh=Image.new('RGB',(W*cols,H*rows),'white')
def full(f):
    im=Image.new('RGB',(1080,1920))
    for j,k in enumerate('abc'): im.paste(Image.open(f[:-4]+k+'.jpg'),(0,640*j))
    im.save(f,quality=85); return im
for i,f in enumerate(fs): sh.paste(full(f).resize((W,H)),((i%cols)*W,(i//cols)*H))
sh.save(sys.argv[1],quality=85)
