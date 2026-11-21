A=open('../uv/reel.html').read().split('\n')
assert A[59].startswith('.erip') and A[238].strip().startswith('<!--') and 'id="s7"' in A[239] and A[270].startswith('</div>')
head='\n'.join(A[0:60]).replace('git.mate uv','git.mate affine')
ending='\n'.join(A[238:271])
for a,b in [('data-t="30.4"','data-t="29.85"'),('data-t="30.85"','data-t="30.24"'),('data-t="31.1"','data-t="30.64"'),('data-t="31.75"','data-t="31.25"'),('data-t="33.6"','data-t="33.0"'),('data-t="33.75"','data-t="33.15"'),('data-t="33.9"','data-t="33.3"'),('data-t="34.05"','data-t="33.45"')]:
  assert a in ending,a; ending=ending.replace(a,b,1)
P=lambda f:open('parts/'+f).read()
html=head+'\n'+P('css.css')+'\n</style></head><body>\n'+'\n'.join(A[138:140])+'\n'+P('body.html')+'\n'+ending+'\n<script>\n'+P('js.js')+'</script>\n</body></html>\n'
open('reel.html','w').write(html)
