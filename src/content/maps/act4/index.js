import { BoxGeometry, ConeGeometry, Group, Mesh, MeshStandardMaterial, PlaneGeometry, Vector3 } from '../../../../vendor/three.js';
import { createLevelBuilder } from '../../../world/level-builder.js';
import { loadCampaignProgress } from '../../../story/campaign-progress.js';

// All five arenas use the current inland, single-floor physics contract.
const world = {
  min: new Vector3(-40, 0, -25), max: new Vector3(40, 24, 25),
  groundY: 0, seaY: -20, quayX: 1000,
  navigation: { minX: -39, maxX: 39, minZ: -24, maxZ: 24, cellSize: .5 }
};
const v = (x,z,y=0) => new Vector3(x,y,z);
const specs = [
  { id:'m22_mountain', title:'산악 군사통신기지', kind:'mountain', start:[-34,-4], exit:[32,2], route:[[-27,9],[-12,-9],[8,8],[25,5],[0,-12]], labels:['산길 경계 진지','중계시설 진입로','통신 중계장치','연합 통신 접속','고립 통신 기술병'], people:[4] },
  { id:'m23_front', title:'도시 외곽 군사시설', kind:'front', start:[-34,-10], exit:[32,2], route:[[-27,-9],[-10,9],[7,1],[25,1],[-1,-12]], labels:['보병 진격로','무인전투거점','군사시설 진입로','보급차량 인계 지점','산업 기술자'], people:[4] },
  { id:'m24_power', title:'중앙 전력시설', kind:'power', start:[-34,-15], exit:[32,6], route:[[-27,-8],[-9,-9],[9,8],[26,6],[-4,-12]], labels:['발전시설 외곽','제어실 입구','전력 제어장치','보급로 출구','억류 노동자'], people:[4] },
  { id:'m25_factory', title:'북부 공장 도시', kind:'factory', start:[-34,4], exit:[33,5], route:[[-27,-7],[-10,-4],[5,0],[29,6],[-3,-12]], labels:['공장 외곽','생산구역','타이탄 접근로','핵심 생산시설','억류 노동자'], people:[4] },
  { id:'m26_rebuild', title:'재건 중인 도시', kind:'rebuild', start:[-34,-3], exit:[33,4], route:[[-27,8],[-10,-8],[9,7],[27,3],[0,-11]], labels:['복구시설 진입로','작업자 대피구역','잔존 기계 대응 지점','재건 현장','고립 복구 작업자'], people:[4] }
];
function box(b,x,z,w,d,h,material='concrete') {
  b.box(material,w,h,d,x,h/2,z);
  b.col(x-w/2,0,z-d/2,x+w/2,h,z+d/2,material.startsWith('steel') ? 'metal' : 'concrete');
}
// A transverse wall can have one or more independently traversable openings.
function partition(b,x,gaps,h=3.4,mat='concrete') {
  const limits=[-20.5,...gaps.flatMap(([center,half])=>[center-half,center+half]),20.5];
  for (let i=0;i<limits.length;i+=2) if (limits[i+1]-limits[i]>.1)
    box(b,x,(limits[i]+limits[i+1])/2,.8,limits[i+1]-limits[i],h,mat);
}
function propRow(b,kind,coords) { coords.forEach(([x,z],i)=>b.place(kind,x,z,0,{seed:200+i})); }
function facade(b,x,z,w,h,mat='concrete') {
  box(b,x,z,w,3,h,mat);
  for(let dx=-w/2+1.5;dx<w/2;dx+=3) for(let y=2;y<h-1;y+=2.4)
    b.box('glass_dirty',1.2,1,.05,x+dx,y,z+(z<0?1.53:-1.53));
}
function vehicle(b,x,z,color='steel_dark',length=5) {
  box(b,x,z,length,2.1,.8,color); b.box(color,length*.45,.7,1.9,x-.25,1.15,z);
  for(const dx of [-length*.3,length*.3]) for(const dz of [-1.05,1.05]) b.cyl('rubber',.38,.23,x+dx,.35,z+dz,{axis:'z'});
}
function objective(root,pos,person,optional) {
  const group=new Group(); group.position.copy(pos);
  const body=new MeshStandardMaterial({color:person?0x829691:0x758387,roughness:.7});
  const lamp=new MeshStandardMaterial({color:optional?0x5ac6ad:0xe6ad49,emissive:optional?0x17594a:0x563108});
  const part=(w,h,d,x,y,z,mat)=>{const mesh=new Mesh(new BoxGeometry(w,h,d),mat);mesh.position.set(x,y,z);mesh.castShadow=true;group.add(mesh);};
  if(person) { part(.5,.7,.32,0,.88,0,lamp);part(.3,.3,.3,0,1.38,0,body);part(.16,.5,.2,-.14,.25,0,body);part(.16,.5,.2,.14,.25,0,body); }
  else { part(.85,.7,.65,0,.35,0,body);part(.55,.25,.08,0,.55,.34,lamp);part(.12,.35,.12,0,.88,0,body); }
  group.userData.setState=state=>{ lamp.emissiveIntensity=state==='cut'?.15:state==='cutting'?1.8:1; };
  root.add(group); return group;
}
function antenna(b,x,z,height=12) {
  for(const dx of [-.8,.8]) for(const dz of [-.8,.8]) b.rod('steel_galv',[x+dx,0,z+dz],[x+dx*.2,height,z+dz*.2],.09);
  for(let y=2;y<height;y+=2) { b.rod('steel_dark',[x-.8*(1-y/height),y,z],[x+.8*(1-y/height),y,z],.06); }
  b.box('paint_red',.35,.55,.35,x,height+.2,z);
}
function rockyCut(b,x,openingZ) {
  const material=new MeshStandardMaterial({color:0x5a6259,roughness:1});
  for(let z=-18;z<=18;z+=4) {
    if(Math.abs(z-openingZ)<4.6) continue;
    const h=3.7+((z+18)%3)*.65;
    const mesh=new Mesh(new ConeGeometry(2.7,h,5),material);
    mesh.position.set(x,h/2,z);mesh.rotation.y=(z+18)*.19;mesh.castShadow=true;mesh.receiveShadow=true;
    b.staticRoot.add(mesh);b.col(x-1.25,0,z-1.45,x+1.25,h*.75,z+1.45,'concrete');
  }
}
function reconstructionScene(root,pos) {
  // A person stands at a physical console next to a crane-like assist robot.
  // Their positions communicate human approval without pretending to simulate AI.
  const group=new Group();group.name='reconstruction-scene';group.position.copy(pos).add(new Vector3(0,0,7));
  const yellow=new MeshStandardMaterial({color:0xb29d52,roughness:.7});
  const steel=new MeshStandardMaterial({color:0x6c7c7b,roughness:.65});
  const blue=new MeshStandardMaterial({color:0x5d8f89,roughness:.8});
  const indicator=new MeshStandardMaterial({color:0x8a3b30,emissive:0x45100a});
  const part=(w,h,d,x,y,z,mat)=>{const m=new Mesh(new BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=true;group.add(m);return m;};
  part(1.6,.55,1.2,0,.3,0,steel);part(.55,2.1,.55,0,1.55,0,yellow);part(1.7,.35,.4,.6,2.5,0,yellow);
  const claw=part(.35,1.0,.35,1.35,2,0,yellow);claw.name='robot-claw';
  const debris=part(1.3,.45,1.3,1.5,.25,0,steel);debris.name='reconstruction-debris';
  part(.48,.75,.3,-2.4,1.05,0,blue);part(.3,.3,.3,-2.4,1.58,0,steel);part(.16,.65,.16,-2.55,.34,0,steel);part(.16,.65,.16,-2.25,.34,0,steel);
  part(.65,.8,.5,-1.6,.4,0,steel);part(.5,.15,.4,-1.6,.86,0,indicator);
  root.add(group);
  let running=false,time=0;
  return {
    setState(state) {
      running=state==='cut';
      if(!running) { time=0;claw.position.y=2;debris.position.y=.25; }
      indicator.color.setHex(running?0x49bc7a:0x8a3b30);
      indicator.emissive.setHex(running?0x126037:0x45100a);
    },
    update(dt) {
      if(!running) return;
      time+=dt;
      // After approval the arm lowers, grips, and slowly lifts the rubble.
      const lower=Math.min(1,time/2), lift=Math.min(1,Math.max(0,(time-2)/3));
      claw.position.y=2-.7*lower+.7*lift;
      debris.position.y=.25+.65*lift;
    }
  };
}
function scenery(b,spec,extra) {
  const kind=spec.kind;
  if(kind==='mountain') {
    // Alternating rocky cuts make a climbing mountain route rather than a yard.
    rockyCut(b,-19,8);rockyCut(b,-2,-8);
    propRow(b,'sandbags',[[-29,-14],[-10,15],[15,-12],[27,-13]]);
    for(const x of [-30,-15,0,15,30]) { b.box('steel_dark',.3,4,.3,x,2,-17);b.box('steel_dark',.3,.3,5,x,4,-14.5); }
    antenna(b,18,-14,13);antenna(b,30,-15,10);
    b.box('steel_galv',13,4,.5,24,2,-10); b.box('steel_galv',.5,4,8,30,2,-6);
    // Distant mountains are scenery only, outside the play perimeter.
    const rock=new MeshStandardMaterial({color:0x53615d,roughness:1});
    for(const [x,z,r,h] of [[-35,-34,15,16],[-7,-38,17,21],[22,-36,17,19],[42,-34,13,15]]) {
      const mountain=new Mesh(new ConeGeometry(r,h,5),rock);mountain.position.set(x,h/2-1,z);b.staticRoot.add(mountain);
    }
  } else if(kind==='front') {
    for(const x of [-29,-13,4,20]) { facade(b,x,-17,10,7);facade(b,x+3,17,9,6); }
    partition(b,-17,[[-9,3.8],[9,3.8]],4,'concrete');
    propRow(b,'sandbags',[[-28,4],[-15,-3],[-3,-5],[12,-6],[21,8]]);
    vehicle(b,-31,14,'steel_dark',6);vehicle(b,31,-14,'steel_dark',6);
    for(const x of [-29,-17,-5,7,19,31]) b.box('paint_white',6,.015,.12,x,.02,0);
    // Facility entrance arch; the convoy lane remains completely open.
    box(b,24,-8,1.2,5,5,'concrete');box(b,24,10,1.2,5,5,'concrete');b.box('steel_dark',1.2,.6,20,24,5.2,1);
  } else if(kind==='power') {
    partition(b,-19,[[-8,3.6]],4,'steel_dark');
    const gates=extra ? [[-8,3.2],[8,3.2]] : [[8,3.2]];
    partition(b,0,gates,4.5,'steel_dark');
    for(const z of [-15,15]) for(const x of [-27,-10,8,25]) {
      b.cyl('steel_galv',1.15,5,x,2.5,z,{seg:14});
      b.box('paint_orange',.4,4,.4,x+2,2,z);
      b.box('steel_dark',.25,.25,4,x+2,4,z+(z<0?2:-2));
    }
    propRow(b,'generator',[[-30,15],[-8,15],[13,-15],[30,-15]]);
    for(const x of [-30,-8,13,30]) b.box('steel_dark',.5,.5,6,x,5.3,15);
    // Overhead power gantry frames the entrance without blocking the walkway.
    for(const z of [-17,3]) { b.box('steel_dark',.45,10,.45,-27,5,z); }
    b.box('steel_galv',.45,.45,20,-27,9.5,-7);
    for(const z of [-13,-8,-3]) {b.box('steel_dark',.35,1.4,.35,-27,8.6,z);b.box('paint_orange',.5,.3,.5,-27,7.9,z);}
    if(extra) { b.box('paint_green',.12,.6,3, -.48,1.5,-8); }
  } else if(kind==='factory') {
    // Wide central production arena gives the Titan clear lines and room to maneuver.
    partition(b,-17,[[-7,4]],4.5,'steel_dark');
    for(const z of [-15,15]) for(const x of [-27,-11,5,21,33]) {
      b.place('generator',x,z,0,{seed:x+70});b.box('steel_dark',.45,8,.45,x,4,z);
      b.box('steel_galv',.45,.45,5,x,7.8,z+(z<0?2.5:-2.5));
    }
    for(const [x,z] of [[-9,7],[0,-7],[12,7],[13,-7],[26,-8],[31,11]]) b.place('jersey_barrier',x,z,0,{seed:x+90});
    for(const x of [-12,3,18,32]) b.box('paint_orange',.45,5,.45,x,2.5,-19);
  } else {
    // Rebuilding streets have intact windows, planted strips and working machinery.
    for(const x of [-28,-13,3,19]) { facade(b,x,-17,10,6,'concrete_painted');facade(b,x+3,17,9,6,'concrete_painted'); }
    partition(b,-18,[[8,3.6]],3,'concrete'); partition(b,0,[[-8,3.6]],3,'concrete');
    for(const x of [-30,-20,-10,0,10,20,30]) b.box('paint_white',5,.015,.12,x,.02,0);
    for(const x of [-28,-8,12,30]) { b.box('paint_green',5,.2,1,x,.1,-12); b.place('light_mast',x,14,0,{seed:x+100}); }
    vehicle(b,-25,13,'paint_white',4.5);b.place('forklift',15,14,0,{seed:71});
  }
}
async function buildLevel(game,spec) {
  const root=new Group();root.name=`level-${spec.id}`;game.scene.add(root);
  const b=createLevelBuilder(game);
  for(const z of [-21,21]) box(b,0,z,77,.5,3);
  for(const x of [-39,39]) box(b,x,0,.5,42,3);
  const extra=spec.kind==='power' && loadCampaignProgress().flags.includes('flag_power_grid_data');
  scenery(b,spec,extra);
  const covers={
    mountain:[[-30,4],[-24,-4],[-10,-4],[3,5],[13,2],[20,12],[29,-3]],
    front:[[-30,-3],[-24,3],[-10,-5],[-3,5],[8,-6],[16,8],[30,-4]],
    power:[[-30,3],[-24,8],[-10,3],[5,-4],[15,-4],[24,-4],[30,-2]],
    factory:[[-31,3],[-23,4],[-9,7],[0,-7],[12,7],[13,-7],[26,-8]],
    rebuild:[[-30,-4],[-24,2],[-10,2],[7,-3],[16,-4],[23,-5],[31,-4]]
  }[spec.kind];
  for(const [i,[x,z]] of covers.entries()) if(spec.kind!=='factory' || i<2) b.place(i%2?'sandbags':'jersey_barrier',x,z,0,{seed:i+440});
  root.add(b.staticRoot,b.dynRoot);
  const positions=spec.route.map(([x,z])=>v(x,z));
  const objectives=spec.labels.map((label,i)=>({id:i<4?`stage_${i+1}`:`optional_${i-3}`,label,pos:positions[i].clone(),object:objective(b.dynRoot,positions[i],spec.people.includes(i),i>=4)}));
  const reconstruction=spec.kind==='rebuild'?reconstructionScene(b.dynRoot,positions[3]):null;
  if(reconstruction) {
    const data=objectives[3].object.userData, original=data.setState;
    data.setState=state=>{original(state);reconstruction.setState(state);};
  }
  const playerStart=v(...spec.start), extraction=v(...spec.exit),nav=game.physics.nav;
  function nearbyWalkable(x,z) {
    for(const radius of [0,.5,1,2,3,4,5,6]) for(let angle=0;angle<16;angle++) {
      const px=x+Math.cos(angle*Math.PI/8)*radius,pz=z+Math.sin(angle*Math.PI/8)*radius;
      if(nav.isWalkable(px,pz)) return v(px,pz);
    }
    return v(x,z);
  }
  const enemySpawns=[];
  for(const x of [-28,-16,-4,8,20,32]) for(const z of [-9,9]) {
    enemySpawns.push({type:'ground',zone:'field',pos:nearbyWalkable(x,z)});
    enemySpawns.push({type:'air',zone:'field',pos:v(x,z,7+((x+z+60)%3))});
  }
  const route=[playerStart];
  for(const target of [...positions.slice(0,4),extraction]) route.push(...(nav.findPath(route.at(-1),target)||[target]));
  const lengths=[];let total=0;for(let i=1;i<route.length;i++){total+=route[i-1].distanceTo(route[i]);lengths.push(total);}
  function supply(fraction,lateral) {
    const distance=total*fraction;let i=lengths.findIndex(length=>length>=distance);if(i<0)i=lengths.length-1;
    const prior=i?lengths[i-1]:0, amount=(distance-prior)/Math.max(.001,lengths[i]-prior);
    const point=route[i].clone().lerp(route[i+1],amount);
    const dx=route[i+1].x-route[i].x,dz=route[i+1].z-route[i].z,len=Math.max(.001,Math.hypot(dx,dz));
    return nearbyWalkable(point.x-dz/len*lateral,point.z+dx/len*lateral).toArray();
  }
  const phase=specs.indexOf(spec)%2;
  const medkitSites=Array.from({length:11},(_,i)=>supply((i+.6)/11,(i+phase)%2?3:-3));
  const ammoSites=Array.from({length:8},(_,i)=>supply((i+.4)/8,(i+phase)%2?-4:4));
  const yaw=-Math.atan2(positions[0].x-playerStart.x,-(positions[0].z-playerStart.z));
  return {root,playerStart:{pos:playerStart,yaw},objectives,medkitSites,ammoSites,
    alternateRouteOpen:!!extra,alternateRoute:spec.kind==='power'?{pos:v(0,-8)}:null,
    extraction:{pos:extraction,radius:2.5},enemySpawns,zones:[{name:'field',min:[-39,-21],max:[39,21]}],
    coverPoints:covers.map(([x,z])=>v(x,z+(z<0?1.5:-1.5))),interiorBoxes:[],skylights:[],shedLights:[],
    cinematicPath:[{pos:[playerStart.x,2,playerStart.z],look:[positions[0].x,1,positions[0].z]},{pos:[positions[0].x,2,positions[0].z],look:[positions[1].x,1,positions[1].z]}],
    placed:b.placed,stats:{labelsAtlased:0,containers:b.placed.filter(p=>p.name.startsWith('container')).length,props:b.placed.length,tris:0,meshes:0},
    groundSurfaceAt:()=> 'concrete',update(dt){for(const update of b.updaters)update(dt);reconstruction?.update(dt);} };
}
async function createGround(game,spec) {
  const mat={mountain:'concrete_dirty',front:'asphalt',power:'concrete',factory:'steel_dark',rebuild:'concrete_painted'}[spec.kind];
  const mesh=new Mesh(new PlaneGeometry(200,200).rotateX(-Math.PI/2),game.mats.get(mat));mesh.receiveShadow=true;game.scene.add(mesh);
  return {update(){},wetnessAt:()=>.3,isPuddle:()=>false};
}
async function createBackdrop(){return{update(){}};}
export const act4Maps=specs.map(spec=>({id:spec.id,title:spec.title,world,createLevel:game=>buildLevel(game,spec),createGround:game=>createGround(game,spec),createBackdrop}));
