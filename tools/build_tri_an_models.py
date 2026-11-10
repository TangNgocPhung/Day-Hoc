"""Build small original glTF 2.0 models for teaching; no external mesh assets."""
from pathlib import Path
import struct,json,math

OUT=Path(__file__).resolve().parents[1]/'goc-hoc-tap/bai-hoc-gddp10/xr-assets'
OUT.mkdir(exist_ok=True)
COLORS=[(.36,.43,.29,1),(.62,.42,.22,1),(.84,.62,.28,1),(.83,.76,.57,1),(.3,.38,.32,1)]

def mesh():return [[] for _ in COLORS]
def triangle(m,c,a,b,d):
 u=[b[i]-a[i] for i in range(3)];v=[d[i]-a[i] for i in range(3)]
 n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]]
 mag=math.sqrt(sum(x*x for x in n));assert mag>0
 n=[x/mag for x in n]
 for p in [a,b,d]:m[c].append((p,n))
def box(m,c,x,y,z,w,h,d):
 v=[(x+a*w/2,y+b*h/2,z+k*d/2) for a,b,k in [(-1,-1,-1),(1,-1,-1),(1,1,-1),(-1,1,-1),(-1,-1,1),(1,-1,1),(1,1,1),(-1,1,1)]]
 for face in [(0,3,2,1),(4,5,6,7),(0,4,7,3),(1,2,6,5),(0,1,5,4),(3,7,6,2)]:
  a,b,c1,d1=[v[i] for i in face];triangle(m,c,a,b,c1);triangle(m,c,a,c1,d1)
def roof(m):
 a=(-.43,.38,-.31);b=(.43,.38,-.31);c=(.43,.38,.31);d=(-.43,.38,.31);e=(-.20,.54,0);f=(.20,.54,0)
 for tri in [(a,e,f),(a,f,b),(b,f,c),(c,f,e),(c,e,d),(d,e,a)]:triangle(m,2,*tri)
def write(name,m):
 buf=bytearray();views=[];accessors=[];primitives=[]
 for c,verts in enumerate(m):
  if not verts:continue
  attrs={}
  for j,label in [(0,'POSITION'),(1,'NORMAL')]:
   start=len(buf);vals=[x[j] for x in verts]
   for p in vals:buf.extend(struct.pack('<3f',*p))
   vi=len(views);views.append(dict(buffer=0,byteOffset=start,byteLength=len(buf)-start,target=34962))
   a=dict(bufferView=vi,componentType=5126,count=len(vals),type='VEC3')
   if label=='POSITION':a.update(min=[min(p[k] for p in vals) for k in range(3)],max=[max(p[k] for p in vals) for k in range(3)])
   attrs[label]=len(accessors);accessors.append(a)
  primitives.append(dict(attributes=attrs,material=c,mode=4))
 d=dict(asset=dict(version='2.0',generator='Original classroom illustration / NoiDungDayHoc',copyright='Original illustrative geometry for educational use'),scene=0,scenes=[dict(nodes=[0])],nodes=[dict(mesh=0,name=name)],meshes=[dict(primitives=primitives)],materials=[dict(pbrMetallicRoughness=dict(baseColorFactor=list(color),metallicFactor=0,roughnessFactor=.85),doubleSided=True) for color in COLORS],buffers=[dict(byteLength=len(buf))],bufferViews=views,accessors=accessors)
 js=json.dumps(d,separators=(',',':')).encode();js+=b' '*((-len(js))%4);buf+=b'\0'*((-len(buf))%4)
 data=struct.pack('<III',0x46546c67,2,12+8+len(js)+8+len(buf))+struct.pack('<II',len(js),0x4e4f534a)+js+struct.pack('<II',len(buf),0x004e4942)+buf
 (OUT/name).write_bytes(data);print(name,len(data),'bytes')

m=mesh();box(m,0,0,.025,0,.78,.05,.58);box(m,3,0,.058,0,.7,.016,.5)
for x in [-.28,-.095,.095,.28]:
 for z in [-.19,.19]:box(m,1,x,.22,z,.028,.30,.028)
box(m,1,0,.35,0,.66,.04,.44);box(m,2,0,.376,0,.86,.015,.64);roof(m);box(m,2,0,.542,0,.42,.015,.025)
for w,y,z in [(.48,.04,.34),(.42,.025,.39),(.36,.01,.43)]:box(m,3,0,y,z,w,.02,.08)
write('mai-dinh-minh-hoa.glb',m)
m=mesh();box(m,0,0,.02,0,.34,.04,.25);box(m,3,0,.055,0,.28,.03,.20);box(m,4,0,.28,0,.22,.42,.075);box(m,2,0,.495,0,.26,.022,.10);box(m,2,0,.29,.042,.14,.25,.009)
write('bia-tri-an-minh-hoa.glb',m)
