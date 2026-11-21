A=open('../ilovenotch/reel.html').read().split('\n')
assert A[32].startswith('/* S1') and A[132].startswith('/* ending') and A[146].startswith('</style>') and '<!-- S8 comment' in A[246] and A[268].startswith(' </div></div></div>')
head='\n'.join(A[0:32]).replace('git.mate ilovenotch','git.mate playnck')
endcss='\n'.join(A[132:153])   # ending css .. </style></head><body> svg defs, <div class=f>, cam/stage/world opener
assert 'id="world"' in A[152] or 'id="world"' in A[153]
endcss='\n'.join(A[132:153])
ending='\n'.join(A[246:272])
i=ending.find('<!-- S9 end -->'); c,e=ending[:i],ending[i:]
for a,b in [('id="s9" data-pose="0,10400,-900,0,24,0"','id="s8" data-pose="0,7800,-1300,-30,0,0"'),('data-t="34.7"','data-t="33.36"'),('data-t="35.0"','data-t="33.62"'),('data-t="34.6"','data-t="33.0"'),('data-t="35.9"','data-t="34.5"')]:
  assert a in c,a; c=c.replace(a,b)
for a,b in [('id="s10" data-pose="2600,10400,-1300,28,0,0"','id="s9" data-pose="0,10400,-900,0,24,0"'),('data-t="37.3"','data-t="35.5"'),('data-t="37.8"','data-t="36.0"'),('data-t="38.1"','data-t="36.3"'),('data-t="38.35"','data-t="36.55"'),('data-t="37.45"','data-t="35.65"')]:
  assert a in e,a; e=e.replace(a,b)
P=lambda f:open('parts/'+f).read()
html=head+'\n'+P('css.css')+'\n'+endcss+'\n'+P('body.html')+'\n'+c+e+'\n<script>\n'+P('js.js')+'</script>\n</body></html>\n'
open('reel.html','w').write(html)
