'use strict';
window.ReviewTools = (() => {
 const byId=id=>document.getElementById(id);
 function element(tag,text,className){const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(className)node.className=className;return node;}
 function randomInt(max){if(max<1)return 0;const values=new Uint32Array(1);const limit=Math.floor(4294967296/max)*max;do{crypto.getRandomValues(values);}while(values[0]>=limit);return values[0]%max;}
 function shuffle(list){const copy=[...list];for(let i=copy.length-1;i>0;i--){const j=randomInt(i+1);[copy[i],copy[j]]=[copy[j],copy[i]];}return copy;}
 function prepare(q){return {...q,choices:shuffle(q.options.map((text,index)=>({text,correct:index===q.answer})))};}
 function download(name,text){const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const link=element('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 function source(q){const a=element('a','Xem lại Bài '+q.lesson);a.href=q.source;a.target='_blank';a.rel='noopener';return a;}
 function focus(id){byId(id).focus();}
 function sourceLinks(){const box=byId('sourceLinks');if(!box)return;CLIMATE_REVIEW.titles.forEach((title,i)=>{const a=element('a','Bài '+(i+1)+': '+title);a.href=CLIMATE_REVIEW.sources[i];box.append(a);});}
 sourceLinks();return {byId,element,shuffle,prepare,download,source,focus};
})();
