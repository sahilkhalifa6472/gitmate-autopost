A=open('../recall-ai/reel.html').read().split('\n')
head='\n'.join(A[0:31]).replace('git.mate recall-ai','git.mate ilovenotch')
endcss='\n'.join(A[118:132])
mid='\n'.join(A[132:139])
ending='\n'.join(A[209:231])
i=ending.find('<!-- S9 end -->'); c,e=ending[:i],ending[i:]
for a,b in [('id="s8" data-pose="2600,5200,-900,28,0,0"','id="s9" data-pose="0,10400,-900,0,24,0"'),('data-t="28.7"','data-t="34.7"'),('data-t="29.0"','data-t="35.0"'),('data-t="28.6"','data-t="34.6"'),('data-t="29.9"','data-t="35.9"')]:
  assert a in c,a; c=c.replace(a,b)
for a,b in [('id="s9" data-pose="2600,7800,-1300,0,-24,0"','id="s10" data-pose="2600,10400,-1300,28,0,0"'),('data-t="31.3"','data-t="37.3"'),('data-t="31.8"','data-t="37.8"'),('data-t="32.1"','data-t="38.1"'),('data-t="32.35"','data-t="38.35"'),('data-t="31.45"','data-t="37.45"')]:
  assert a in e,a; e=e.replace(a,b)
P=lambda f:open('parts/'+f).read()
html=head+'\n'+P('css.css')+'\n'+endcss+'\n'+mid+'\n'+P('body.html')+'\n'+c+e+'\n'+'\n'.join(A[231:235])+'\n<script>\n'+P('js.js')+'</script>\n</body></html>\n'
open('reel.html','w').write(html)
