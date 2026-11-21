function rows(id,msgs,t){let h="";msgs.forEach((m,i)=>{const a=`hsl(0 0% ${18+(i*37)%40}%)`,b=`hsl(0 0% ${45+(i*23)%40}%)`;
h+=`<div class="row"><div class="av" style="background:radial-gradient(circle at 35% 30%,${b},${a})"></div><div class="tx"><div class="nm" style="width:${170+(i*53)%190}px"></div><div class="pv">${m}</div></div><div class="tm">${t[i%t.length]}</div>${i<12?'<div class="dot"></div>':''}</div>`});document.getElementById(id).innerHTML=h}
const T=["now","1m","2m","3m","5m","8m","11m","14m","19m","25m","31m","40m","52m","1h","1h","2h"];
