(()=>{'use strict';
const $=id=>document.getElementById(id),S=window.TRI_AN_XR.stations;let scene,infoPanel,active=0,timeout;
const send=d=>{if(window.parent!==window)window.parent.postMessage(d,location.origin)};
function fail(){clearTimeout(timeout);$('fallback').hidden=false;$('roomStatus').textContent='Phòng 3D chưa sẵn sàng trên thiết bị / kết nối này.';send({type:'tri-an-error'})}
function textTexture(title,body,foot='',bg='#f4f0df',accent='#204c40'){
 const c=document.createElement('canvas');c.width=1536;c.height=1024;const x=c.getContext('2d');x.fillStyle=bg;x.fillRect(0,0,c.width,c.height);x.fillStyle=accent;x.fillRect(0,0,30,1024);x.font='700 58px "Segoe UI", Arial, sans-serif';x.fillText(title,78,106);x.fillStyle='#263f36';x.font='37px "Segoe UI", Arial, sans-serif';let y=185;function write(t,max=57){for(const para of t.split('\n')){let line='';for(const word of para.split(' ')){if((line+' '+word).length>max){x.fillText(line.trim(),78,y);line=word;y+=55}else line+=' '+word}x.fillText(line.trim(),78,y);y+=65}}
 write(body);if(foot){y=Math.max(y+30,780);x.fillStyle=accent;x.font='italic 34px "Segoe UI", Arial, sans-serif';write(foot,62)}return c.toDataURL('image/png')
}
function e(tag,attrs={},parent=scene){const node=document.createElement(tag);for(const[k,v]of Object.entries(attrs))node.setAttribute(k,v);if(parent)parent.append(node);return node}
function select(i,notify=true){if(!Number.isInteger(i)||i<0||i>=S.length||!scene)return;active=i;const s=S[i];infoPanel.setAttribute('material',{src:textTexture('TRẠM '+(i+1)+' · '+s.name,s.content,'NHIỆM VỤ: '+s.evidence),shader:'flat',side:'double'});$('infoRoot').setAttribute('visible',true);$('dismissPlane').classList.add('interactive');$('roomStatus').textContent='Trạm '+(i+1)+': '+s.name+'. Đọc bảng trong không gian. Đóng bảng để tiếp tục nhìn quanh; quay lại trang chính để trả lời và lưu phiếu.';document.querySelectorAll('[data-station]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.station===i)));S.forEach((st,j)=>$('frame'+j).setAttribute('color',i===j?'#fff0b4':st.color));if(notify)send({type:'tri-an-station',index:i})}
function close(){if(!scene)return;$('infoRoot').setAttribute('visible',false);$('dismissPlane').classList.remove('interactive');$('roomStatus').textContent='Kéo để nhìn quanh. Chọn biển trạm, nhìn 1,5 giây hoặc dùng tay điều khiển. Mô hình chỉ là minh hoạ học tập.'}
function init(){
 clearTimeout(timeout);if(!window.AFRAME){fail();return}
 AFRAME.registerComponent('tri-an-webgl-check',{init:function(){this.el.addEventListener('renderstart',()=>{clearTimeout(timeout);$('roomStatus').textContent='Phòng đã sẵn sàng. Kéo để nhìn quanh; chọn biển trạm để mở bảng đọc. Nút VR xuất hiện khi thiết bị hỗ trợ.';send({type:'tri-an-ready'})});this.el.addEventListener('enter-vr',()=>{document.querySelector('.room-top').hidden=true;$('roomStatus').hidden=true;$('mouseRay').setAttribute('raycaster','enabled',false);$('gaze').setAttribute('raycaster','enabled',true)});this.el.addEventListener('exit-vr',()=>{document.querySelector('.room-top').hidden=false;$('roomStatus').hidden=false;$('mouseRay').setAttribute('raycaster','enabled',true);$('gaze').setAttribute('raycaster','enabled',false)})}});
 scene=e('a-scene',{'background':'color: #dce5cf','renderer':'colorManagement: true; antialias: true','xr-mode-ui':'enabled: true; XRMode: vr','webxr':'referenceSpaceType: local-floor','loading-screen':'enabled: false','device-orientation-permission-ui':'enabled: false','tri-an-webgl-check':''},$('sceneHost'));
 e('a-light',{type:'ambient',intensity:1.4,color:'#fff2cf'});e('a-light',{type:'directional',intensity:2,position:'-3 7 4',color:'#fff8e4'});
 e('a-plane',{rotation:'-90 0 0',width:22,height:22,color:'#a7b995'});e('a-cylinder',{position:'0 0.025 0',radius:5.4,height:.05,color:'#dbd6bc','segments-radial':64});
 e('a-box',{position:'0 .08 -1.9',width:8,height:.16,depth:4.4,color:'#a1ad89'});
 e('a-gltf-model',{src:'xr-assets/mai-dinh-minh-hoa.glb',position:'0 .16 -1.9',scale:'6 6 6'}).addEventListener('model-error',()=>{$('roomStatus').textContent='Chưa tải được mô hình mái đình. Các biển trạm vẫn dùng được.'});
 e('a-gltf-model',{src:'xr-assets/bia-tri-an-minh-hoa.glb',position:'3.8 .1 1.4',scale:'3 3 3'});
 for(const x of [-6,6])for(const z of [-5,1]){e('a-cylinder',{position:`${x} 1 ${z}`,radius:.12,height:2,color:'#745638'});e('a-sphere',{position:`${x} 2.3 ${z}`,radius:.9,color:'#6f936d','segments-width':12,'segments-height':8})}
 const rig=e('a-entity',{id:'rig',position:'0 0 4.8'}),camera=e('a-entity',{id:'camera',camera:'',position:'0 1.6 0','look-controls':'pointerLockEnabled: false; magicWindowTrackingEnabled: false','wasd-controls':'enabled: false'},rig);
 e('a-entity',{id:'mouseRay',cursor:'rayOrigin: mouse; fuse: false',raycaster:'objects: .interactive; far: 20'},camera);
 e('a-entity',{id:'gaze',position:'0 0 -1',geometry:'primitive: ring; radiusInner: 0.007; radiusOuter: 0.011',material:'color: #204c40; shader: flat; depthTest: false',cursor:'fuse: true; fuseTimeout: 1500',raycaster:'objects: .interactive; far: 20; enabled: false'},camera);
 for(const hand of ['left','right'])e('a-entity',{'laser-controls':'hand: '+hand,raycaster:'objects: .interactive; far: 20; lineColor: #d9b46b'},rig);
 S.forEach((s,i)=>{const board=e('a-entity',{position:s.vrPosition,rotation:s.vrRotation});e('a-box',{id:'frame'+i,position:'0 1.75 -.04',width:2.15,height:1.6,depth:.1,color:s.color},board);const plane=e('a-plane',{class:'interactive',position:'0 1.75 .02',width:2,height:1.44,material:{src:textTexture('TRẠM '+(i+1),s.name+'\n'+s.label,'Chọn biển để mở nội dung.','#fff9e8',s.color),shader:'flat'}},board);plane.addEventListener('click',()=>select(i));e('a-cylinder',{position:'0 .6 0',radius:.05,height:1.2,color:'#6d765b'},board)});
 const info=e('a-entity',{id:'infoRoot',position:'0 0 -2',visible:false},camera);
 infoPanel=e('a-plane',{width:2.75,height:1.833,material:'shader: flat; color: #fff9e8; depthTest: false'},info);
 const dismiss=e('a-plane',{id:'dismissPlane',position:'1.12 .79 .025',width:.35,height:.2,material:{src:textTexture('ĐÓNG','','','#d9b46b','#204c40'),shader:'flat',depthTest:false}},info);dismiss.addEventListener('click',close);
 document.querySelectorAll('[data-station]').forEach(b=>b.onclick=()=>select(+b.dataset.station));$('closeInfo').onclick=close;
 window.addEventListener('message',ev=>{if(ev.source!==window.parent||ev.origin!==location.origin)return;const d=ev.data;if(d?.type==='tri-an-select')select(d.index,false)});
 timeout=setTimeout(()=>{if(!scene.renderStarted)fail()},30000);
}
timeout=setTimeout(fail,30000);const script=document.createElement('script');script.src='https://aframe.io/releases/1.7.0/aframe.min.js';script.onload=init;script.onerror=fail;document.head.append(script);
})();
