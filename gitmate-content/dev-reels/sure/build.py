A=open('../arcane/reel.html').read().split('\n')
head='\n'.join(A[0:41]).replace('git.mate arcane','git.mate sure')
endcss='\n'.join(A[133:152])
ending='\n'.join(A[271:298])
for a,b in [('id="s8"','id="s9"'),('data-t="33.2"','data-t="32.45"'),('data-t="33.45"','data-t="32.7"'),('data-t="32.9"','data-t="32.0"'),('data-t="34.4"','data-t="33.55"'),('data-t="35.9"','data-t="35.1"'),('data-t="36.05"','data-t="35.25"'),('data-t="36.2"','data-t="35.4"'),('data-t="36.35"','data-t="35.55"')]:
  assert a in ending,a; ending=ending.replace(a,b,1)
i=ending.find('<!-- S9 end -->'); ending=ending[:i]+ending[i:].replace('id="s9"','id="s10"',1)
logo=open('media/logo_inline.svg').read()
P=lambda f:open('parts/'+f).read()
html=head+'\n'+endcss+'\n'+P('css.css')+'\n</style></head><body>\n<div id="LOGO" style="display:none">'+logo+'</div>\n'+'\n'.join(A[153:155])+'\n'+P('body.html')+'\n'+ending+'\n'+'\n'.join(A[298:304])+'\n<script>\n'+P('js.js')+'</script>\n</body></html>\n'
open('reel.html','w').write(html)
