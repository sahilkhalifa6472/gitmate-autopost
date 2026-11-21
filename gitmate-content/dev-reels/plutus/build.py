A=open('../geotagcamera/reel.html').read().split('\n')
ix=lambda pre:[i for i,l in enumerate(A) if l.startswith(pre)][0]
i_sc=ix('/* ===== GeoTag'); i_dm=ix('/* S7 DM thread'); i_end=ix('/* ending'); i_w=[i for i,l in enumerate(A) if 'id="world"' in l][0]
i_s7=[i for i,l in enumerate(A) if '<!-- S7 DM FEATURE' in l][0]; i_js=ix('<script>')
head='\n'.join(A[0:i_sc]).replace('git.mate geotagcamera','git.mate plutus')
dmcss='\n'.join(A[i_dm:i_end]); endcss='\n'.join(A[i_end:i_w+1])
ending='\n'.join(A[i_s7:i_js])
for a,b in [('data-t="27.41"','data-t="23.97"'),('data-t="28.96"','data-t="25.48"'),('data-t="27.5"','data-t="24.05"'),('data-t="29.95"','data-t="26.45"'),('data-t="30.24"','data-t="26.88"'),('data-t="30.56"','data-t="27.12"'),('data-t="31.35"','data-t="28.3"'),('data-t="32.6"','data-t="29.35"'),('data-t="32.75"','data-t="29.5"'),('data-t="33.1"','data-t="29.85"'),('data-t="33.4"','data-t="30.15"'),('data-t="33.65"','data-t="30.4"')]:
  assert ending.count(a)==1,a; ending=ending.replace(a,b)
ending=ending.replace('data-pose="2600,7800,-900,0,-24,0"','data-pose="2600,5200,-1300,30,0,0"',1).replace('data-pose="0,7800,-1300,-30,0,0"','data-pose="2600,7800,-900,0,-24,0"',1).replace('data-pose="0,10400,-900,0,24,0"','data-pose="0,7800,-1300,-30,0,0"',1)
P=lambda f:open('parts/'+f).read()
html=head+'\n'+P('css.css')+'\n'+dmcss+'\n'+endcss+'\n'+P('body.html')+'\n'+ending+'\n<script>\n'+P('js.js')+'</script>\n</body></html>\n'
open('reel.html','w').write(html)
