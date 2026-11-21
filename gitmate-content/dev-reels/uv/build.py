A=open('../sure/reel.html').read().split('\n')
assert A[59].startswith('.erip') and A[328].strip().startswith('<!--') and 'id="s9"' in A[329]
head='\n'.join(A[0:60]).replace('git.mate sure','git.mate uv')
ending='\n'.join(A[328:361])
for a,b in [('data-t="32.0"','data-t="30.4"'),('data-t="32.45"','data-t="30.85"'),('data-t="32.7"','data-t="31.1"'),('data-t="33.55"','data-t="31.75"'),('data-t="35.1"','data-t="33.6"'),('data-t="35.25"','data-t="33.75"'),('data-t="35.4"','data-t="33.9"'),('data-t="35.55"','data-t="34.05"'),('id="s9"','id="s7"'),('id="s10"','id="s8"')]:
  assert a in ending,a; ending=ending.replace(a,b,1)
P=lambda f:open('parts/'+f).read()
html=head+'\n'+P('css.css')+'\n</style></head><body>\n'+'\n'.join(A[192:194])+'\n'+P('body.html')+'\n'+ending+'\n<script>\n'+P('js.js')+'</script>\n</body></html>\n'
open('reel.html','w').write(html)
