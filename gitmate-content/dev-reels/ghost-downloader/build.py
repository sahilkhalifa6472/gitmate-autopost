A=open('../affine/reel.html').read().split('\n')
assert A[59].startswith('.erip') and A[134].startswith('</style>') and 'id="F"' in A[135] and '<!-- S8 comment' in A[231] and A[264]=='<script>'
head='\n'.join(A[0:60]).replace('git.mate affine','git.mate ghost-downloader')
ending='\n'.join(A[231:264])
for a,b in [('data-t="29.85"','data-t="26.95"'),('data-t="30.24"','data-t="27.2"'),('data-t="30.64"','data-t="27.52"'),('data-t="31.25"','data-t="28.5"'),('data-t="33.0"','data-t="30.1"'),('data-t="33.15"','data-t="30.25"'),('data-t="33.3"','data-t="30.4"'),('data-t="33.45"','data-t="30.55"')]:
  assert a in ending,a; ending=ending.replace(a,b,1)
P=lambda f:open('parts/'+f).read()
html=head+'\n'+P('css.css')+'\n</style></head><body>\n'+'\n'.join(A[135:137])+'\n'+P('body.html')+'\n'+ending+'\n<script>\n'+P('js.js')+'</script>\n</body></html>\n'
open('reel.html','w').write(html)
