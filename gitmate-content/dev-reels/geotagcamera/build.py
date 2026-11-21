A=open('../playnck/reel.html').read().split('\n')
assert A[32].startswith('/* =====') and A[109].startswith('/* ending') and 'id="world"' in A[129] and '<!-- S8 comment' in A[212] and A[234].startswith(' </div></div></div>') and A[238].startswith('<script>')
head='\n'.join(A[0:32]).replace('git.mate playnck','git.mate geotagcamera')
endcss='\n'.join(A[109:130])
ending='\n'.join(A[212:238])
for a,b in [('data-t="33.0"','data-t="29.95"'),('data-t="33.36"','data-t="30.24"'),('data-t="33.62"','data-t="30.56"'),('data-t="34.5"','data-t="31.35"'),('data-t="35.5"','data-t="32.6"'),('data-t="36.0"','data-t="33.1"'),('data-t="36.3"','data-t="33.4"'),('data-t="36.55"','data-t="33.65"'),('data-t="35.65"','data-t="32.75"')]:
  assert a in ending,a; ending=ending.replace(a,b,1)
P=lambda f:open('parts/'+f).read()
html=head+'\n'+P('css.css')+'\n'+endcss+'\n'+P('body.html')+'\n'+ending+'\n<script>\n'+P('js.js')+'</script>\n</body></html>\n'
open('reel.html','w').write(html)
