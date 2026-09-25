/* 史前 · 火光里的第一只手 — the opening room.
   Black, drips, breathing; the lamp catches where the gate's flame was; it moves along the rock and shows one small patch at a
   time in raking light (WebGL relight of main.webp with a normal map); where it passes, the superimposed legs flicker in
   alternation with the flame (hand-assigned stroke sets, t_legs.json); the lamp stops at bare rock, a hand presses, ochre is
   blown around it in three puffs, the hand lifts and leaves a negative stencil; the title is sprayed the same way; then the
   rock comes up to full light and only then the museum's chrome appears. Labels follow after the hand-over (core).
   Rest (fx canvas): the cursor is the lamp (painting stays ≥ 40 % lit), shaking it speeds the legs up
   (× window.EH_PREHISTORY.flicker), a long press on the rock blows a stencil round the visitor's hand; idle → the lamp tours
   and a ghost hand leaves a stencil. Everything rest adds fades in after the hand-over and out before the next room. */
(function(){
'use strict';
// rest guards (API.md "Rest hooks"): while a compare tool is on ('era' | 'special') nothing is painted over ctx.to.rect; while reading, nothing
// is left inside ctx.readRect (a right-hand column fades out over `fade` px just before the panel's edge). Idle, not reading: no-op (exact hand-over).
function rgBegin(ctx){var g=ctx.g,S=ctx.state,R=ctx.reading&&ctx.readRect,r=ctx.to&&ctx.to.rect,k=S.rgK||0,dt=Math.min(ctx.dt||0,.1);
  if(R)S.rgR={x:R.x,y:R.y,w:R.w,h:R.h};k+=((R?1:0)-k)*Math.min(1,dt*6);S.rgK=(!R&&k<.003)?0:(R&&k>.997)?1:k;
  g.save();if((ctx.tool==='era'||ctx.tool==='special')&&r){g.beginPath();g.rect(0,0,ctx.W,ctx.H);g.rect(r.x-1,r.y-1,r.w+2,r.h+2);g.clip('evenodd');}}
function rgEnd(ctx,fade,fill,fillA){var g=ctx.g,S=ctx.state,R=S.rgR;if(!(S.rgK>0)||!R){g.restore();return;}
  g.save();   // still inside rgBegin's compare clip: the fill never lands on the hung work either
  g.globalCompositeOperation='destination-out';g.globalAlpha=S.rgK;
  if(R.x>ctx.W*.3){var f=fade==null?60:fade,x0=R.x-f,gr=g.createLinearGradient(x0,0,R.x,0);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'#000');
    g.fillStyle=gr;g.fillRect(x0,0,ctx.W-x0+1,ctx.H);
    // optional flat fill, added ('lighter' on premultiplied pixels = an exact cross-fade): a room whose rest darkens the whole wall keeps that flat darkness under the panel
    if(fill&&fillA>0){g.globalCompositeOperation='lighter';g.globalAlpha=S.rgK*fillA;var fg=g.createLinearGradient(x0,0,R.x,0);fg.addColorStop(0,fill.replace('rgb(','rgba(').replace(')',',0)'));fg.addColorStop(1,fill);g.fillStyle=fg;g.fillRect(x0,0,ctx.W-x0+1,ctx.H);}}
  else{g.fillStyle='#000';g.fillRect(R.x,R.y,R.w,R.h);if(fill&&fillA>0){g.globalCompositeOperation='lighter';g.globalAlpha=S.rgK*fillA;g.fillStyle=fill;g.fillRect(R.x,R.y,R.w,R.h);}}
  g.restore();g.restore();}
// any pointer over the reading panel belongs to the text, not to the room
function rgInRead(ctx,x,y){var R=ctx.reading&&ctx.readRect;return !!R&&x>=R.x&&x<=R.x+R.w&&y>=R.y&&y<=R.y+R.h;}
var EH=window.EH;if(!EH||!EH.transition)return;
var P=window.EH_PREHISTORY=window.EH_PREHISTORY||{flicker:1};if(typeof P.flicker!=='number')P.flicker=1;
var SAVED=window.EH_SAVED=window.EH_SAVED||{};
var SH=window.EH_SHARED=window.EH_SHARED||{};
var D=22,HOLD=11;   // HOLD mirrors core.js (seconds a room rests before the next transition)

// ---------------------------------------------------------------- data
// leg flicker atlas (generated from rooms/prehistory/t_legs.json by _wip/t-prehistory/legs.py; boxes in main.webp px)
/*@LEGS*/var LEGS={"W":2400,"H":1600,"atlas":[1540,540],"groups":[{"box":[1560,380,1960,700],"atlas":[0,0,400,320]},{"box":[1740,800,2240,1270],"atlas":[400,0,500,470]},{"box":[780,480,1420,1020],"atlas":[900,0,640,540]}]};/*@END*/
// a hand, back view, fingers spread; unit = total length (fingertip 0 … forearm end 1), x centred on the wrist
/*@HAND*/var HAND=[[0.029,0.0],[0.015,0.001],[0.003,0.007],[-0.008,0.019],[-0.012,0.032],[-0.021,0.254],[-0.023,0.28],[-0.025,0.288],[-0.028,0.291],[-0.033,0.287],[-0.039,0.272],[-0.087,0.076],[-0.093,0.064],[-0.097,0.058],[-0.105,0.051],[-0.114,0.047],[-0.127,0.046],[-0.135,0.049],[-0.143,0.053],[-0.15,0.06],[-0.154,0.068],[-0.157,0.08],[-0.156,0.093],[-0.133,0.216],[-0.114,0.332],[-0.112,0.355],[-0.116,0.362],[-0.12,0.361],[-0.129,0.35],[-0.193,0.221],[-0.204,0.202],[-0.21,0.194],[-0.223,0.186],[-0.23,0.185],[-0.241,0.186],[-0.25,0.19],[-0.256,0.196],[-0.262,0.21],[-0.263,0.219],[-0.259,0.233],[-0.202,0.37],[-0.179,0.431],[-0.174,0.447],[-0.174,0.466],[-0.18,0.529],[-0.18,0.551],[-0.169,0.654],[-0.144,0.749],[-0.123,0.8],[-0.119,0.815],[-0.12,0.833],[-0.139,1.0],[0.135,1.0],[0.119,0.835],[0.119,0.816],[0.123,0.799],[0.147,0.735],[0.151,0.727],[0.157,0.721],[0.177,0.711],[0.19,0.701],[0.315,0.581],[0.334,0.553],[0.361,0.503],[0.383,0.458],[0.389,0.441],[0.39,0.43],[0.388,0.418],[0.382,0.408],[0.375,0.401],[0.365,0.395],[0.357,0.393],[0.344,0.394],[0.332,0.398],[0.32,0.409],[0.28,0.467],[0.244,0.513],[0.233,0.523],[0.2,0.547],[0.193,0.548],[0.186,0.545],[0.182,0.533],[0.172,0.449],[0.154,0.389],[0.153,0.371],[0.173,0.264],[0.203,0.117],[0.204,0.105],[0.203,0.095],[0.199,0.086],[0.193,0.078],[0.183,0.072],[0.174,0.07],[0.158,0.072],[0.148,0.078],[0.141,0.086],[0.131,0.112],[0.085,0.28],[0.078,0.297],[0.073,0.3],[0.07,0.294],[0.067,0.27],[0.06,0.034],[0.058,0.024],[0.051,0.012],[0.041,0.004]];/*@END*/
var HW=0.8075,PALM=0.40;                                // wrist along the length; palm centre above the wrist
// the stencil the opening leaves (main.webp px, palm centre), the lamp beside it, the flame's tour (s, u, v)
var MARK={cx:1290,cy:1345,len:360,rot:-12,mirror:true};
var LAMP={x:1100,y:1405};
var TOUR=[[5.2,.47,.47],[6.1,.39,.53],[6.9,.36,.44],[7.8,.47,.27],[8.7,.69,.30],[9.5,.75,.37],[10.3,.84,.61],[10.9,.86,.70],[11.6,.66,.84],[12.2,LAMP.x/2400,LAMP.y/1600]];
// rest: the idle lamp's loop and the ghost hands (main px)
var IDLE=[[0,.55,.52],[1.4,.42,.50],[2.6,.37,.47],[3.6,.70,.31],[4.6,.76,.38],[5.5,.85,.64],[6.6,.66,.84]];
var GHOSTS=[{cx:1478,cy:1300,len:300,rot:9,mirror:true},{cx:1080,cy:1290,len:250,rot:-26,mirror:true}];
// beats (seconds)
var B={gateOut:[.2,1.25],breath:[1.95,2.95],catchA:3.45,catchB:4.25,tour:4.25,handIn:[12.0,13.4],puffs:[13.8,14.8,15.8],lift:[16.8,18.0],
  title:[17.9,18.8],reveal:[18.5,21.0],chrome:20.3,fin:21.25};
var OCHRE='156,58,30';

// ---------------------------------------------------------------- small helpers
function cv(w,h){var c=document.createElement('canvas');c.width=Math.max(1,w|0);c.height=Math.max(1,h|0);return c;}
function cl(x,a,b){return x<a?a:x>b?b:x;}
function sm(a,b,x){x=cl((x-a)/(b-a),0,1);return x*x*(3-2*x);}
function gauss(x,c,w){var d=(x-c)/w;return Math.exp(-d*d);}
function nz(t,s){s=s||0;return .5*Math.sin(t*13.1+s)+.3*Math.sin(t*23.7+1.3+s*1.7)+.2*Math.sin(t*41.9+.4+s*2.3);}
function rgbOf(css){var c=cv(1,1),g=c.getContext('2d');g.fillStyle='#000';g.fillStyle=css;g.fillRect(0,0,1,1);var d=g.getImageData(0,0,1,1).data;return[d[0]/255,d[1]/255,d[2]/255];}
function rot(x,y,a){var c=Math.cos(a),s=Math.sin(a);return[x*c-y*s,x*s+y*c];}
// time-parametrised Catmull-Rom (Hermite) through timed keys [[t,x,y],...]: velocity is continuous across keys (tangents in units/s,
// every segment eases the same way into and out of its keys), and zero at the first and last key (the flame starts and stops softly)
function track(keys,t){if(t<=keys[0][0])return[keys[0][1],keys[0][2]];var n=keys.length;if(t>=keys[n-1][0])return[keys[n-1][1],keys[n-1][2]];
  var i=0;while(i<n-2&&t>keys[i+1][0])i++;var k1=keys[i],k2=keys[i+1],h=k2[0]-k1[0],s=(t-k1[0])/h;
  s=s*s*(3-2*s)*.35+s*.65;var s2=s*s,s3=s2*s,h00=2*s3-3*s2+1,h10=s3-2*s2+s,h01=-2*s3+3*s2,h11=s3-s2;
  function tan(j,c){if(j<=0||j>=n-1)return 0;return(keys[j+1][c]-keys[j-1][c])/(keys[j+1][0]-keys[j-1][0]);}
  function hm(c){return h00*k1[c]+h10*h*tan(i,c)+h01*k2[c]+h11*h*tan(i+1,c);}
  return[hm(1),hm(2)];}
// the flame's dip as the legs change (periodic in the phase, ~0.1 s wide: a soft flicker, never a one-frame step)
function dipAt(pf){var d=pf-.9;d-=Math.round(d);return 1-.1*gauss(d,0,.13);}
// critically damped spring toward a target (exact step, stable for any dt)
function spring(x,v,target,w,dt){var e=Math.exp(-w*dt),d=x-target,c=v+w*d;return[target+(d+c*dt)*e,(v-w*c*dt)*e];}
// the frame's soft edge (CSS: radial-gradient(ellipse 58% 60% at 50% 50%, #000 62%, transparent 100%))
function fadeM(u,v){if(u<0||u>1||v<0||v>1)return 0;var t=Math.hypot((u-.5)/.58,(v-.5)/.6);return cl((1-t)/.38,0,1);}
function maskEllipse(g,w,h){g.save();g.globalCompositeOperation='destination-in';g.setTransform(1,0,0,.6*h/(.58*w),0,0);
  var cy=(h/2)/(.6*h/(.58*w)),gr=g.createRadialGradient(w/2,cy,0,w/2,cy,.58*w);gr.addColorStop(0,'rgba(0,0,0,1)');gr.addColorStop(.62,'rgba(0,0,0,1)');gr.addColorStop(1,'rgba(0,0,0,0)');
  g.fillStyle=gr;g.fillRect(0,0,w,cy*2+10);g.restore();}
function handPath(g){g.beginPath();for(var i=0;i<HAND.length;i++){var q=HAND[i];if(i)g.lineTo(q[0],q[1]-HW);else g.moveTo(q[0],q[1]-HW);}g.closePath();}
// place hand-local coordinates (palm centre at origin, unit = hand length) in a 2D context
function handXform(g,x,y,L,rotDeg,mirror){g.translate(x,y);g.rotate(rotDeg*Math.PI/180);g.scale(mirror?-L:L,L);g.translate(0,PALM);}

// ---------------------------------------------------------------- stencil template: ochre blown round a hand, hand left bare
var ST_N=512,ST_BOX=1.6;   // canvas px; box side in hand lengths
function makeStencil(seed,place,AW,AH){
  var N=ST_N,Lc=N/ST_BOX,R=EH.util.rng(seed);
  function layer(blur,times){var c=cv(N,N),g=c.getContext('2d');var hm=cv(N,N),h=hm.getContext('2d');h.save();handXform(h,N/2,N/2,Lc,place?place.rot:0,place?!!place.mirror:false);handPath(h);h.fillStyle='#fff';h.fill();h.restore();
    if(!blur)return hm;g.filter='blur('+blur+'px)';for(var i=0;i<times;i++)g.drawImage(hm,0,0);return c;}
  function noise(n){var c=cv(n,n),g=c.getContext('2d'),d=g.createImageData(n,n);for(var i=0;i<n*n;i++){var v=R()*255;d.data[i*4]=d.data[i*4+1]=d.data[i*4+2]=v;d.data[i*4+3]=255;}g.putImageData(d,0,0);
    var o=cv(N,N),og=o.getContext('2d');og.imageSmoothingQuality='high';og.drawImage(c,0,0,N,N);return og.getImageData(0,0,N,N).data;}
  var h1=layer(Lc*.03,2).getContext('2d').getImageData(0,0,N,N).data,h2=layer(Lc*.11,3).getContext('2d').getImageData(0,0,N,N).data,
      h3=layer(Lc*.24,4).getContext('2d').getImageData(0,0,N,N).data,
      hf=layer(.9,1).getContext('2d').getImageData(0,0,N,N).data,n1=noise(10),n2=noise(34),n3=noise(90);
  var out=cv(N,N),og=out.getContext('2d'),img=og.createImageData(N,N),d=img.data;
  // palm centre is the canvas centre; the spray was aimed there
  for(var y=0;y<N;y++)for(var x=0;x<N;x++){var i=(y*N+x)*4;
    var halo=Math.min(1,h1[i+3]/255*.62+h2[i+3]/255*.62+h3[i+3]/255*.5),dx=(x-N/2)/Lc,dy=(y-N/2)/Lc,rw=Math.exp(-(dx*dx+dy*dy)*1.5);
    var a1=n1[i]/255,a2=n2[i]/255,a3=n3[i]/255,r=R();
    var dens=halo*(.45+.55*rw)*(.6+.55*a1+.3*(a2-.5))*(.78+.4*r*r);
    if(r<.014)dens+=.4*halo*halo;                              // droplets
    var a=cl(dens*1.32-.06,0,.85)*(1-hf[i+3]/255);
    if(place){var bx=place.cx-place.len*ST_BOX/2+(x+.5)/N*place.len*ST_BOX,by=place.cy-place.len*ST_BOX/2+(y+.5)/N*place.len*ST_BOX;a*=fadeM(bx/AW,by/AH);}
    var t=a2*.7+a3*.3;
    d[i]=cl(112+t*52+(r-.5)*12,0,255);d[i+1]=cl(38+t*30+(r-.5)*7,0,255);d[i+2]=cl(24+t*18,0,255);d[i+3]=a*255;}
  og.putImageData(img,0,0);return out;}
// where a placed stencil lands, as a box in main px
function stBox(pl){var s=pl.len*ST_BOX;return[pl.cx-s/2,pl.cy-s/2,s,s];}

// ---------------------------------------------------------------- WebGL: the rock in lamplight
var VS='#version 300 es\nvoid main(){vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2));gl_Position=vec4(p*2.-1.,0.,1.);}';
var FS=['#version 300 es','precision highp float;',
'uniform sampler2D uPaint,uNorm,uRock,uMask,uSt,uMk;',
'uniform vec2 uRes;uniform float uDpr;uniform vec4 uRect;uniform vec3 uWall;uniform vec4 uWash;uniform float uFade,uSoft;',
'uniform vec3 uL;uniform float uLI,uLR,uAmb,uRelief,uDither;uniform vec3 uWarm;',
'uniform vec4 uLegW;uniform float uLegOn,uLegFloor;uniform vec4 uG0,uG1,uG2,uA0,uA1,uA2;',
'uniform vec4 uStB;uniform float uStA,uStR,uStMask;uniform float uMkOn;',
'out vec4 o;',
'float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}',
'vec3 legs(vec3 c,vec2 uv,vec4 G,vec4 A,float amt){vec2 l=(uv-G.xy)/G.zw;if(l.x<0.||l.y<0.||l.x>1.||l.y>1.)return c;',
'  vec2 a=A.xy+l*A.zw;vec3 rock=texture(uRock,a).rgb;',
'  float h=uLegW.x*texture(uMask,a*.5).r+uLegW.y*texture(uMask,a*.5+vec2(.5,0.)).r+uLegW.z*texture(uMask,a*.5+vec2(0.,.5)).r+uLegW.w*texture(uMask,a*.5+vec2(.5,.5)).r;',
'  return mix(c,rock,clamp(h,0.,1.)*amt);}',
'void main(){',
' vec2 css=vec2(gl_FragCoord.x,uRes.y*uDpr-gl_FragCoord.y)/uDpr;',
' vec2 uv=(css-uRect.xy)/uRect.zw;float inside=step(0.,uv.x)*step(0.,uv.y)*step(uv.x,1.)*step(uv.y,1.);',
' float t=length(vec2((uv.x-.5)/.58,(uv.y-.5)/.6));vec2 e=min(uv,1.-uv);float fe=smoothstep(0.,.09,e.x)*smoothstep(0.,.09,e.y);float m=inside*mix(1.,clamp((1.-t)/.38,0.,1.),uFade)*mix(1.,fe,uSoft);',
' vec2 wd=(css-uWash.xy)/uWash.zw;float wa=.08*clamp(1.-length(wd)/.7,0.,1.);',
' vec3 wall=mix(uWall,vec3(1.,244./255.,225./255.),wa);',
' vec3 Lv=vec3(uL.xy-css,uL.z);float d=length(Lv),dxy=length(Lv.xy);',
' float att=exp(-dxy*dxy/(uLR*uLR)*.9)+.07*exp(-dxy/(uLR*2.6));',
' vec3 paint=texture(uPaint,uv).rgb;',
' float la=uLegOn*clamp(uLegFloor+att*1.7,0.,1.);',
' if(la>0.001&&inside>0.){paint=legs(paint,uv,uG0,uA0,la);paint=legs(paint,uv,uG1,uA1,la);paint=legs(paint,uv,uG2,uA2,la);}',
' vec3 base=mix(wall,paint,m);',
' vec2 su=(uv-uStB.xy)/uStB.zw;',
' if(uStA>0.&&su.x>0.&&su.y>0.&&su.x<1.&&su.y<1.){vec4 s=texture(uSt,su);float vis=uStA*smoothstep(uStR,uStR*.55,length(su-.5)*2.);base=mix(base,s.rgb,s.a*vis*mix(1.,m,uStMask));}',
' if(uMkOn>0.&&inside>0.){vec4 k=texture(uMk,uv);base=mix(base,k.rgb,k.a*uMkOn);}',
' vec3 n=vec3(0.,0.,1.);',
' if(inside>0.){vec3 tn=texture(uNorm,uv).xyz*2.-1.;n=normalize(mix(n,tn,m*uRelief));}',
' float ndl=max(dot(n,Lv/d),0.),fl=Lv.z/d;float rel=clamp(1.+1.9*(ndl-fl),0.,2.2);',
' float f=uLI*att*(.3+.7*rel);',
' vec3 light=1.-(1.-uAmb)*(1.-f*uWarm);',
' vec3 col=base*light+(hash(gl_FragCoord.xy)-.5)/255.*uDither;',
' o=vec4(clamp(col,0.,1.),1.);}'].join('\n');
function makeGL(){
  var c=cv(2,2),gl=null;try{gl=c.getContext('webgl2',{alpha:false,antialias:false,depth:false,premultipliedAlpha:false,preserveDrawingBuffer:true});}catch(e){}
  if(!gl)return null;
  function sh(type,src){var s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){console.warn('prehistory shader',gl.getShaderInfoLog(s));return null;}return s;}
  var v=sh(gl.VERTEX_SHADER,VS),f=sh(gl.FRAGMENT_SHADER,FS);if(!v||!f)return null;
  var pr=gl.createProgram();gl.attachShader(pr,v);gl.attachShader(pr,f);gl.linkProgram(pr);if(!gl.getProgramParameter(pr,gl.LINK_STATUS)){console.warn('prehistory link',gl.getProgramInfoLog(pr));return null;}
  gl.useProgram(pr);gl.bindVertexArray(gl.createVertexArray());
  var L={};function loc(n){if(!(n in L))L[n]=gl.getUniformLocation(pr,n);return L[n];}
  var units={uPaint:0,uNorm:1,uRock:2,uMask:3,uSt:4,uMk:5},T={};
  Object.keys(units).forEach(function(k){gl.uniform1i(loc(k),units[k]);});
  function tex(name,src,mip){var u=units[name];gl.activeTexture(gl.TEXTURE0+u);if(!T[name])T[name]=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,T[name]);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);
    try{gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,src);}catch(e){console.warn('prehistory texture',name,e);return false;}
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    if(mip){gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);}else gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
    return true;}
  function render(W,H,dpr,U){var w=Math.round(W*dpr),h=Math.round(H*dpr);if(c.width!==w||c.height!==h){c.width=w;c.height=h;}gl.viewport(0,0,w,h);
    gl.uniform2f(loc('uRes'),W,H);gl.uniform1f(loc('uDpr'),dpr);
    Object.keys(U).forEach(function(k){var v=U[k],l=loc(k);if(l==null)return;if(typeof v==='number')gl.uniform1f(l,v);else if(v.length===2)gl.uniform2fv(l,v);else if(v.length===3)gl.uniform3fv(l,v);else gl.uniform4fv(l,v);});
    gl.drawArrays(gl.TRIANGLES,0,3);return c;}
  return{c:c,gl:gl,tex:tex,render:render};}

// ---------------------------------------------------------------- per-room setup
function setup(ctx){var S=ctx.state,room=ctx.to.room;
  S.AW=room.art.w;S.AH=room.art.h;S.idx=ctx.to.idx;S.wall=rgbOf(ctx.to.wall);S.wallCss=ctx.to.wall;S.fade=ctx.to.frame==='fade'?1:0;
  S.stTpl=makeStencil(7,null,S.AW,S.AH);                        // unmasked template (rest: visitor + ghost hands)
  S.stMark=S.fade?makeStencil(7,MARK,S.AW,S.AH):S.stTpl;          // the opening's stencil, frame edge baked in
  var gate=document.querySelector('#gate .flame');S.gate=null;
  if(gate){var b=gate.getBoundingClientRect();if(b.width>0)S.gate={x:b.left+b.width/2,y:b.top+b.height/2,w:b.width,h:b.height};}
  S.gl=makeGL();
  if(S.gl){var ok=S.gl.tex('uNorm',ctx.asset('t_normal.webp'),true)&&S.gl.tex('uRock',ctx.asset('t_legrock.webp'),true)&&S.gl.tex('uMask',ctx.asset('t_legmask.webp'),true)&&S.gl.tex('uSt',S.stMark,true);
    if(!ok)S.gl=null;}
  if(S.gl){var A=LEGS.atlas,sx=S.AW/LEGS.W,sy=S.AH/LEGS.H;S.legU={};
    LEGS.groups.forEach(function(g,i){var b=g.box,a=g.atlas;S.legU['uG'+i]=[b[0]*sx/S.AW,b[1]*sy/S.AH,(b[2]-b[0])*sx/S.AW,(b[3]-b[1])*sy/S.AH];S.legU['uA'+i]=[a[0]/A[0],a[1]/A[1],a[2]/A[0],a[3]/A[1]];});
    for(var k=LEGS.groups.length;k<3;k++){S.legU['uG'+k]=[-1,-1,.001,.001];S.legU['uA'+k]=[0,0,0,0];}
    S.gl.tex('uMk',cv(2,2),false);}
  S.paintKey='';S.hc=null;
  // everything draw() and rest() use is built here, so no frame pays a first-use cost
  DPR=ctx.dpr||1;GLOW_COLS.forEach(glowSpr);flameSprite();shadowSprites();paintCanvases(ctx);
  var r=ctx.to.rect,L=MARK.len/S.AW*r.w;handCanvases(S,L*1.05);
  var need={};for(var T=B.handIn[0];T<=B.lift[1]+.001;T+=.05){var hp=handPose(ctx,T,L);var kf=handAngle(hp.hx,hp.hy,hp.rot,MARK.mirror,hp.f);need[Math.floor(kf)]=1;need[Math.floor(kf)+1]=1;}
  Object.keys(need).forEach(function(k){handSpriteK(S,+k);});hsWarmAll(S);   // the opening's light angles now, the others in the background
  restPrebuild(S);if(S.gl){S.gl.tex('uMk',S.Rpre.mk,true);S.mkUp=S.Rpre.mk;}}
// the painting at device resolution, exactly as the hung canvas holds it (core paintArt), plus its masked twin
function paintCanvases(ctx,force){var S=ctx.state,r=ctx.to.rect,dpr=ctx.dpr||1,w=Math.min(Math.round(r.w*dpr),2600),h=Math.round(w*S.AH/S.AW),key=w+'x'+h;
  if(S.paintKey===key&&!force)return;var now=performance.now();if(S.paintKey&&S.lastPaint&&now-S.lastPaint<120&&!force&&ctx.state.inRest)return;
  S.paintKey=key;S.lastPaint=now;var o=cv(w,h);o.getContext('2d').drawImage(ctx.to.image,0,0,w,h);S.paint=o;
  var o2=cv(w,h),g2=o2.getContext('2d');g2.drawImage(o,0,0);if(S.fade)maskEllipse(g2,w,h);S.paintMasked=o2;
  if(S.gl)S.gl.tex('uPaint',o,false);}
function uvToScreen(r,S,x,y){return[r.x+x/S.AW*r.w,r.y+y/S.AH*r.h];}
function washGrad(g,W,H,r){var cx=r.x+r.w/2,cy=r.y+r.h/2,rx=.7*W,ry=.6*H;g.save();g.translate(cx,cy);g.scale(1,ry/rx);
  var gr=g.createRadialGradient(0,0,0,0,0,rx);gr.addColorStop(0,'rgba(255,244,225,.08)');gr.addColorStop(.7,'rgba(255,244,225,0)');gr.addColorStop(1,'rgba(255,244,225,0)');
  g.fillStyle=gr;g.fillRect(-rx,-rx,2*rx,2*rx);g.restore();}
// the opening's stencil on any 2D context in screen space (also what rest keeps on fx, and what a neighbour may redraw)
function drawMark(g,S,r,alpha){if(alpha<=0)return;var b=stBox(MARK),p=uvToScreen(r,S,b[0],b[1]);g.save();g.globalAlpha=alpha;g.drawImage(S.stMark,p[0],p[1],b[2]/S.AW*r.w,b[3]/S.AH*r.h);g.restore();}
// the frame the core hangs: wall, wash, painting (+ the stencil)
function final2D(g,ctx,withMark){var S=ctx.state,r=ctx.to.rect;g.fillStyle=S.wallCss;g.fillRect(0,0,ctx.W,ctx.H);washGrad(g,ctx.W,ctx.H,r);
  g.drawImage(S.paintMasked,r.x,r.y,r.w,r.h);if(withMark)drawMark(g,S,r,1);}
function glUniforms(ctx,o){var S=ctx.state,r=ctx.to.rect,U={uRect:[r.x,r.y,r.w,r.h],uWall:S.wall,uWash:[r.x+r.w/2,r.y+r.h/2,.7*ctx.W,.6*ctx.H],uFade:S.fade,uWarm:[1.12,.84,.6]};
  for(var k in S.legU)U[k]=S.legU[k];for(k in o)U[k]=o[k];return U;}

// ---------------------------------------------------------------- 2D pieces drawn over the lit rock
// glows are pre-rendered sprites (one per colour, built in init), drawn with globalAlpha = a: no gradient objects per frame
var GLOWS={},GLOW_COLS=['255,150,60','255,120,40','255,150,70','255,200,120','182,84,44',OCHRE];
function glowSpr(col){var c=GLOWS[col];if(c)return c;var N=256;c=cv(N,N);var g=c.getContext('2d'),gr=g.createRadialGradient(N/2,N/2,0,N/2,N/2,N/2);
  gr.addColorStop(0,'rgba('+col+',1)');gr.addColorStop(.35,'rgba('+col+',.45)');gr.addColorStop(1,'rgba('+col+',0)');g.fillStyle=gr;g.fillRect(0,0,N,N);GLOWS[col]=c;return c;}
function glow(g,x,y,rad,a,col){if(a<=0||rad<=0)return;var s=glowSpr(col),ga=g.globalAlpha;g.globalAlpha=ga*Math.min(a,1);g.drawImage(s,x-rad,y-rad,2*rad,2*rad);g.globalAlpha=ga;}
// the gate's flame, as index.html draws it (10×16, radial core, box-shadow glow)
function gateFlame(g,x,y,w,h,a,k){if(a<=0)return;g.save();g.globalAlpha=a;glow(g,x,y,62,.22,'255,150,60');
  g.translate(x,y);g.scale(1+.04*k,1-.05*k);var gr=g.createRadialGradient(0,h*.2,0,0,h*.2,Math.hypot(w,h)*.6);gr.addColorStop(0,'#fff2c8');gr.addColorStop(.45,'#ffb347');gr.addColorStop(.8,'#c2410c');gr.addColorStop(.81,'rgba(194,65,12,0)');
  g.fillStyle=gr;g.beginPath();g.ellipse(0,0,w/2,h/2,0,0,Math.PI*2);g.fill();g.restore();}
// the lamp: a small teardrop flame with a warm bloom; origin at the wick. The flame body is a pre-rendered, pre-blurred sprite
// (built in init) scaled to the flickering width/height: no path, gradient or ctx.filter per frame
var FL_F=6,FL_W=9.5,FL_H=21;
function flameSprite(){if(flameSprite.c)return flameSprite.c;var F=FL_F,w=FL_W*F,h=FL_H*F,pad=Math.ceil(4*F),cw=Math.ceil(w+2*pad),ch=Math.ceil(h*1.2+2*pad),c=cv(cw,ch),g=c.getContext('2d');
  c.ox=cw/2;c.oy=pad+h;g.translate(c.ox,c.oy);g.beginPath();g.moveTo(0,-h);g.bezierCurveTo(w*.16,-h*.64,w*.56,-h*.4,w*.5,-h*.1);g.bezierCurveTo(w*.46,h*.12,w*.2,h*.2,0,h*.2);
  g.bezierCurveTo(-w*.2,h*.2,-w*.46,h*.12,-w*.5,-h*.1);g.bezierCurveTo(-w*.56,-h*.4,-w*.16,-h*.64,0,-h);g.closePath();
  var gr=g.createRadialGradient(0,-h*.18,0,0,-h*.25,h*.8);gr.addColorStop(0,'#fffbe8');gr.addColorStop(.28,'#ffe0a0');gr.addColorStop(.55,'#ffa347');gr.addColorStop(.85,'rgba(214,82,24,.75)');gr.addColorStop(1,'rgba(160,50,16,0)');
  g.fillStyle=gr;g.filter='blur('+(.5*F/DPR).toFixed(2)+'px)';g.fill();g.filter='none';flameSprite.c=c;return c;}
function lampFlame(g,x,y,s,a,lean,t){if(a<=0)return;var ky=1+.1*nz(t*1.3,2),kx=1-.05*nz(t*1.1,5),h=FL_H*s*ky,spr=flameSprite();g.save();g.globalAlpha=a;
  g.globalCompositeOperation='lighter';glow(g,x,y-h*.35,70*s,.2,'255,150,70');glow(g,x,y-h*.35,20*s,.28,'255,200,120');g.globalCompositeOperation='source-over';
  g.translate(x,y);g.rotate(lean);
  g.save();g.scale(s*kx/FL_F,s*ky/FL_F);g.imageSmoothingQuality='high';g.drawImage(spr,-spr.ox,-spr.oy);g.restore();
  g.fillStyle='rgba(40,20,10,.8)';g.fillRect(-.6*s,h*.12,1.2*s,2.4*s);   // wick
  g.restore();}
// a lit hand sprite: height = blurred silhouette (rounded fingers, palm dome), wrap-lit skin, lit from angle a (hand-local).
// The angle-independent part (mask, normals, occlusion, grain) is computed once; each of the HS_STEPS light angles is then one cheap pass.
// Buckets the opening needs are built in init, the rest in the background; neighbouring buckets are cross-faded (no shading steps).
var HS_N=384,HS_BOX=1.3,HS_STEPS=24;
function hsBase(S){if(S.hsB)return S.hsB;var N=HS_N,Lc=N/HS_BOX;
  function lay(blur,times){var c=cv(N,N),g=c.getContext('2d');g.save();if(blur)g.filter='blur('+blur+'px)';var m=cv(N,N),mg=m.getContext('2d');mg.save();handXform(mg,N/2,N/2,Lc,0,false);handPath(mg);mg.fillStyle='#fff';mg.fill();mg.restore();
    for(var i=0;i<(times||1);i++)g.drawImage(m,0,0);g.restore();return g.getImageData(0,0,N,N).data;}
  var m0=lay(0,1),b1=lay(Lc*.03,2),b2=lay(Lc*.011,1),b3=lay(Lc*.09,2),H=new Float32Array(N*N),R=EH.util.rng(11),kk=Lc*.06;
  for(var i=0;i<N*N;i++)H[i]=(.55*b1[i*4+3]+.3*b2[i*4+3]+.15*b3[i*4+3])/255;
  var idx=[],NX=[],NY=[],NZ=[],AO=[],SS=[],GR=[],AL=[];
  for(var y=1;y<N-1;y++)for(var x=1;x<N-1;x++){var j=y*N+x,al=m0[j*4+3];if(!al)continue;
    var nx=-(H[j+1]-H[j-1])*kk,ny=-(H[j+N]-H[j-N])*kk,nl=Math.sqrt(nx*nx+ny*ny+1);
    idx.push(j);NX.push(nx/nl);NY.push(ny/nl);NZ.push(1/nl);AO.push(.55+.45*cl(H[j]*1.4,0,1));var q=1-cl(H[j]*1.6,0,1);SS.push(q*q*.35);GR.push(1+(R()-.5)*.06);AL.push(al);}
  S.hsB={idx:idx,NX:new Float32Array(NX),NY:new Float32Array(NY),NZ:new Float32Array(NZ),AO:new Float32Array(AO),SS:new Float32Array(SS),GR:new Float32Array(GR),AL:new Uint8Array(AL)};return S.hsB;}
function handSpriteK(S,k){k=((k%HS_STEPS)+HS_STEPS)%HS_STEPS;S.hs=S.hs||{};if(S.hs[k])return S.hs[k];
  var N=HS_N,B0=hsBase(S),a=k/HS_STEPS*2*Math.PI,out=cv(N,N),og=out.getContext('2d'),im=og.createImageData(N,N),d=im.data;
  var lx=Math.cos(a),ly=Math.sin(a),lz=.5,ln=Math.sqrt(lx*lx+ly*ly+lz*lz);lx/=ln;ly/=ln;lz/=ln;
  for(var q=0,n=B0.idx.length;q<n;q++){var j=B0.idx[q]*4,dl=B0.NX[q]*lx+B0.NY[q]*ly+B0.NZ[q]*lz,wrap=cl((dl+.3)/1.3,0,1),v=(.1+1.05*wrap*wrap)*B0.AO[q],sss=B0.SS[q]*cl(dl+.2,0,1),gr=B0.GR[q];
    d[j]=cl((196*v+120*sss)*gr,0,255);d[j+1]=cl((124*v+34*sss)*gr,0,255);d[j+2]=cl((86*v+14*sss)*gr,0,255);d[j+3]=B0.AL[q];}
  og.putImageData(im,0,0);S.hs[k]=out;return out;}
function hsWarmAll(S){if(S.hsTimer)return;var k=0;(function next(){S.hsTimer=0;while(k<HS_STEPS&&S.hs&&S.hs[k])k++;if(k>=HS_STEPS)return;handSpriteK(S,k);k++;S.hsTimer=setTimeout(next,40);})();}
// the hand-local light angle (continuous, in buckets)
function handAngle(hx,hy,rotDeg,mirror,fl){var dx=fl.x-hx,dy=fl.y-hy,dl=Math.hypot(dx,dy)||1,lv=rot(dx/dl,dy/dl,-rotDeg*Math.PI/180);if(mirror)lv[0]=-lv[0];
  return Math.atan2(lv[1],lv[0])/(2*Math.PI)*HS_STEPS;}
// scratch canvases for the hand (built in init; grown only if the window grows)
function handCanvases(S,L){var size=2*Math.ceil(L*1.6*.9+20);if(!S.hc||S.hc.width<size){S.hc=cv(size,size);S.hcs=cv(size,size);}}
// a hand in lamplight: volume-lit toward the flame, soft rim, the forearm fading out of the light
function drawHand(g,S,hx,hy,L,rotDeg,mirror,fl,o){var pad=Math.ceil(L*.9+20),size=pad*2;
  handCanvases(S,L/1.6);var hc=S.hc,h=hc.getContext('2d');h.setTransform(1,0,0,1,0,0);h.clearRect(0,0,size+2,size+2);
  var cx=pad,cy=pad,dx=fl.x-hx,dy=fl.y-hy,dl=Math.hypot(dx,dy)||1;dx/=dl;dy/=dl;var li=cl(o.light,0,1.4);
  var ra=rotDeg*Math.PI/180,kf=handAngle(hx,hy,rotDeg,mirror,fl),k0=Math.floor(kf),kw=kf-k0,sc=L/(HS_N/HS_BOX);
  h.save();h.translate(cx,cy);h.rotate(ra);h.scale((mirror?-1:1)*sc,sc);h.drawImage(handSpriteK(S,k0),-HS_N/2,-HS_N/2);
  if(kw>.004){h.globalCompositeOperation='source-atop';h.globalAlpha=kw;h.drawImage(handSpriteK(S,k0+1),-HS_N/2,-HS_N/2);}h.restore();
  h.save();h.globalCompositeOperation='source-atop';var fall=h.createLinearGradient(cx+dx*L*.5,cy+dy*L*.5,cx-dx*L*.6,cy-dy*L*.6);
  fall.addColorStop(0,'rgba(8,5,4,'+cl(1-li,0,1)+')');fall.addColorStop(1,'rgba(8,5,4,'+cl(1-li*.45,0,1)+')');h.fillStyle=fall;h.fillRect(0,0,size,size);h.restore();
  h.save();handXform(h,cx,cy,L,rotDeg,mirror);handPath(h);h.restore();
  h.save();h.clip();h.lineWidth=Math.max(1.2,L*.022);var rg=h.createLinearGradient(cx+dx*L*.5,cy+dy*L*.5,cx,cy);rg.addColorStop(0,'rgba(255,196,130,'+(.32*li)+')');rg.addColorStop(1,'rgba(255,196,130,0)');h.strokeStyle=rg;h.stroke();
  if(o.pigment>0){h.globalAlpha=o.pigment*.5;h.globalCompositeOperation='source-atop';var sp=S.stTpl,s=L*ST_BOX;h.save();h.translate(cx,cy);h.rotate(rotDeg*Math.PI/180);if(mirror)h.scale(-1,1);h.drawImage(sp,-s/2+L*.03,-s/2-L*.02,s,s);h.restore();}
  h.restore();
  // forearm leaves the light
  var ax=rot(0,HW-PALM+.2,rotDeg*Math.PI/180),wx=rot(0,HW-PALM-.25,rotDeg*Math.PI/180);h.globalCompositeOperation='destination-out';
  var fg=h.createLinearGradient(cx+wx[0]*L,cy+wx[1]*L,cx+ax[0]*L,cy+ax[1]*L);fg.addColorStop(0,'rgba(0,0,0,0)');fg.addColorStop(1,'rgba(0,0,0,1)');h.fillStyle=fg;h.fillRect(0,0,size,size);h.globalCompositeOperation='source-over';
  g.save();g.globalAlpha*=o.alpha;
  if(o.blur>.35){// defocus without ctx.filter: through a reduced-resolution copy (bilinear down + up), resolution falling smoothly with the blur
    var f=1/(1+1.6*o.blur/DPR),sw=Math.max(2,Math.round(size*f)),hs2=S.hcs,h2=hs2.getContext('2d');h2.setTransform(1,0,0,1,0,0);h2.clearRect(0,0,sw+2,sw+2);h2.imageSmoothingQuality='high';h2.drawImage(hc,0,0,size,size,0,0,sw,sw);
    g.imageSmoothingQuality='high';g.drawImage(hs2,0,0,sw,sw,hx-pad,hy-pad,size,size);}
  else g.drawImage(hc,0,0,size,size,hx-pad,hy-pad,size,size);
  g.restore();}
// the hand's cast shadow: black silhouettes pre-blurred at a few relative blurs (init), cross-faded by the blur wanted (no ctx.filter per frame)
var SHL=[.008,.03,.06,.1,.15],SH_LC=160;
var SHS=null,DPR=1;   // DPR: ctx.filter blurs were in device px; the sprites reproduce that look at every dpr
function shadowSprites(){if(SHS)return SHS;var N=2*SH_LC*1.25|0;SHS=SHL.map(function(rb){var c=cv(N,N),g=c.getContext('2d'),bl=rb*SH_LC;
  if(bl>.3)g.filter='blur('+bl.toFixed(2)+'px)';handXform(g,N/2,N/2,SH_LC,0,false);handPath(g);g.fillStyle='#000';g.fill();return c;});return SHS;}
function drawShadow(g,hx,hy,L,rotDeg,mirror,a,blur){if(a<=.003)return;var sp=shadowSprites(),rb=cl(blur/DPR/L,SHL[0],SHL[SHL.length-1]),i=0;while(i<SHL.length-2&&rb>SHL[i+1])i++;
  var w=(rb-SHL[i])/(SHL[i+1]-SHL[i]),N=sp[0].width;g.save();g.translate(hx,hy);g.rotate(rotDeg*Math.PI/180);g.scale((mirror?-1:1)*L/SH_LC,L/SH_LC);
  var ga=g.globalAlpha;g.globalAlpha=ga*a*(1-w);g.drawImage(sp[i],-N/2,-N/2);g.globalAlpha=ga*a*w;g.drawImage(sp[i+1],-N/2,-N/2);g.restore();}
// a cloud of blown ochre around the palm (q = 0…1 through one puff); the envelope starts and ends with zero slope
function mist(g,x,y,L,q,k,li){if(q<=0||q>=1)return;var R=EH.util.rng(31+k*7),a=.3*sm(0,.32,q)*(1-sm(.52,1,q))*cl(li,0,1.2);
  for(var i=0;i<7;i++){var an=R()*6.283,d=L*(.1+.35*R())*(.4+.9*q),rr=L*(.25+.25*R())*(.55+.8*q);glow(g,x+Math.cos(an)*d,y+Math.sin(an)*d,rr,a*(.5+.5*R()),'182,84,44');}}

// ---------------------------------------------------------------- the opening, as a function of p
// the hand's distance from the rock: 1 = away (invisible), 0 = pressed. It leaves and lands with zero velocity (press: fast middle, soft
// touch-down; lift: slow peel, then away)
function handZ(T){if(T<B.handIn[1]){var s=cl((T-B.handIn[0])/(B.handIn[1]-B.handIn[0]),0,1),q=Math.pow(s,1.5);return Math.pow(1-q,3);}
  var s2=cl((T-B.lift[0])/(B.lift[1]-B.lift[0]),0,1);return s2*s2*s2;}
function handPose(ctx,T,L){var S=ctx.state,r=ctx.to.rect,pc=uvToScreen(r,S,MARK.cx,MARK.cy),z=handZ(T),f=flameAt(ctx,T);
  return{z:z,pc:pc,f:f,hx:pc[0]+z*L*.75,hy:pc[1]+z*L*.9,hs:L*(1+.55*z),rot:MARK.rot+z*8};}
function flameAt(ctx,T){var S=ctx.state,r=ctx.to.rect,G=S.gate||{x:ctx.W/2,y:ctx.H/2-40,w:10,h:16};
  var keys=[[B.tour,(G.x-r.x)/r.w,(G.y+8-r.y)/r.h]].concat(TOUR),q=track(keys,T),x=r.x+q[0]*r.w,y=r.y+q[1]*r.h;
  var carry=sm(B.tour,B.tour+.6,T)*(1-sm(11.9,12.4,T));y+=carry*(Math.sin(T*2.3)*2.2+Math.sin(T*3.9+1)*1.2);x+=carry*Math.sin(T*1.7)*1.5;
  var q2=track(keys,T+.08),lean=cl((q[0]-q2[0])*r.w*-.06,-.35,.35)+.06*nz(T*.7,3);
  if(T<B.tour){x=G.x;y=G.y+8;}
  return{x:x,y:y,lean:lean};}
function legPhase(t){return t*4.2;}
function legWeights(ph){var s=Math.floor(ph),f=ph-s,x=sm(.6,1,f),w=[0,0,0,0];w[((s%4)+4)%4]=1-x;w[(((s+1)%4)+4)%4]+=x;return w;}
function stencilState(T){var a=0,R=.05;B.puffs.forEach(function(t,i){var q=sm(t,t+.5,T);a+=q*[.42,.33,.25][i];R+=q*[.62,.38,1.5][i];});return{a:a,R:R};}

function drawOpening(p,ctx){var S=ctx.state,g=ctx.g,W=ctx.W,H=ctx.H,T=p*D,r=ctx.to.rect,idx=ctx.to.idx,u=ctx.u;
  DPR=ctx.dpr||1;paintCanvases(ctx);
  // sound: drips, breath, lamp, hand, ochre puffs and title spray come from audio/cues/prehistory.json; the chrome bell has no recording
  ctx.cue(B.chrome/D,function(){ctx.sfx.bell(130.8,.045);});
  // UI: title sprayed, chrome last
  var spray=cl(.5*sm(B.title[0],B.title[0]+.55,T)+.5*sm(B.title[1],B.title[1]+.7,T)+.0,0,1);
  if(T>=B.title[0])ctx.ui.title(idx,true,spray);else ctx.ui.title(idx,false);
  ctx.ui.chrome(T>=B.chrome);
  // the title block's small lines (one-liner, Latin, years) wait for the chrome: only 史前 is sprayed first
  var era=document.getElementById('era'+idx),hideSub=T<B.chrome;if(era&&S.subHidden!==hideSub){S.subHidden=hideSub;[].forEach.call(era.querySelectorAll('p'),function(q){q.style.transition='opacity .9s ease';q.style.opacity=hideSub?'0':'';});}
  if(T>=B.fin||!S.gl){final2D(g,ctx,true);if(!S.gl&&T<B.fin)fallbackDark(ctx,T);return;}
  // light
  var R=Math.max(.15*r.w,56),f=flameAt(ctx,T),n=nz(T,0),ph=legPhase(T),pf=ph-Math.floor(ph),dip=dipAt(pf);
  var ember=.22*gauss(T,2.2,.28)+.38*gauss(T,3.1,.3),caught=sm(B.catchA,B.catchB,T);
  var LI=Math.max(ember,caught*(1.05+.07*n)*dip),LR=R*(.3+.7*caught)*(1+.04*n);
  var rv=u.eio(u.seg(T,B.reveal[0],B.reveal[1])),amb=.018*sm(B.catchA,B.tour+1,T)+rv*(1-.018);
  var st=stencilState(T),legOn=(1-sm(B.reveal[0],B.reveal[0]+1.2,T))*sm(B.catchB,B.catchB+.5,T);
  var U=glUniforms(ctx,{uL:[f.x,f.y-6,R*.42],uLI:LI,uLR:LR,uAmb:amb,uRelief:1-rv,uDither:1-rv,uSoft:1-rv,uLegW:legWeights(ph),uLegOn:legOn,uLegFloor:0,
    uStB:[stBox(MARK)[0]/S.AW,stBox(MARK)[1]/S.AH,stBox(MARK)[2]/S.AW,stBox(MARK)[3]/S.AH],uStA:T>=B.puffs[0]?st.a:0,uStR:st.R,uStMask:0,uMkOn:0});
  g.drawImage(S.gl.render(W,H,ctx.dpr||1,U),0,0,W,H);
  // hand, shadow, mist
  var L=MARK.len/S.AW*r.w,pc=uvToScreen(r,S,MARK.cx,MARK.cy),z=1;
  if(T>=B.handIn[0]&&T<B.lift[1]){var hp=handPose(ctx,T,L);z=hp.z;
    var lx=pc[0]-f.x,ly=pc[1]-f.y,ld=Math.hypot(lx,ly)||1,light=LI*Math.exp(-ld*ld/(LR*LR)*.9)*1.25+.12;
    var sx=pc[0]+lx/ld*z*L*.55,sy=pc[1]+ly/ld*z*L*.55,shEnv=sm(B.handIn[0],B.handIn[0]+.5,T)*(1-sm(B.lift[1]-.55,B.lift[1],T));
    drawShadow(g,sx,sy,L*(1+.25*z),MARK.rot,MARK.mirror,.55*(1-z*.55)*cl(light,0,1)*shEnv,1.5+z*L*.12);
    drawHand(g,S,hp.hx,hp.hy,hp.hs,hp.rot,MARK.mirror,f,{light:light*(1-.35*z),alpha:cl((1-z)*2.2,0,1),blur:z*L*.06,pigment:st.a*(1-sm(B.lift[0],B.lift[1],T))});
    B.puffs.forEach(function(t,i){mist(g,pc[0],pc[1],L,(T-t)/1.1,i,light);});}
  // the flame
  var G=S.gate||{x:W/2,y:H/2-40,w:10,h:16};
  gateFlame(g,G.x,G.y,G.w,G.h,1-sm(B.gateOut[0],B.gateOut[1],T),nz(T*.6,1));
  if(T>1.4&&T<B.catchB){g.save();g.globalCompositeOperation='lighter';glow(g,f.x,f.y-4,10+26*ember,ember*.9,'255,120,40');g.restore();}
  var fa=sm(B.catchA,B.catchA+.5,T)*(1-sm(B.reveal[0]+1.2,B.reveal[1]-.2,T));
  lampFlame(g,f.x,f.y,(.25+.75*caught)*(Math.min(1.25,Math.max(.8,r.w/800))),fa*(.92+.08*dip),f.lean,T);
  // pigment haze round the sprayed title (settles before the hand-over)
  if(T>B.title[0]&&T<B.fin){var tk=W+'x'+H;if(S.titleKey!==tk){var e0=document.querySelector('#era'+idx+' h1');S.titleB=e0?e0.getBoundingClientRect():null;if(S.titleB&&S.titleB.width>0)S.titleKey=tk;}   // measured once, not every frame
    var b=S.titleB;if(b){var ha=.16*sm(B.title[0],B.title[0]+.4,T)*(1-sm(B.title[1]+.6,B.chrome,T));
    if(ha>0&&b.width>0)glow(g,b.left+b.width/2,b.top+b.height*.4,Math.max(b.width,b.height)*.75,ha,OCHRE);}}}
function fallbackDark(ctx,T){var g=ctx.g,f=flameAt(ctx,T),rv=ctx.u.eio(ctx.u.seg(T,B.reveal[0],B.reveal[1])),R=Math.max(.15*ctx.to.rect.w,56)*sm(B.catchA,B.catchB,T);
  g.save();var gr=g.createRadialGradient(f.x,f.y,0,f.x,f.y,Math.max(1,R*1.6));gr.addColorStop(0,'rgba(0,0,0,'+(1-rv)*.1+')');gr.addColorStop(1,'rgba(0,0,0,'+(1-rv)+')');g.fillStyle=gr;g.fillRect(0,0,ctx.W,ctx.H);g.restore();
  lampFlame(g,f.x,f.y,1,sm(B.catchA,B.catchA+.5,T)*(1-rv),f.lean,T);}

// ---------------------------------------------------------------- rest: the visitor holds the lamp
// the rest's stencil layer (main px at 1600 wide) and the frame's edge mask, built in init so the hand-over frame doesn't pay for them
function restPrebuild(S){var mw=1600,mh=Math.round(1600*S.AH/S.AW),mk=cv(mw,mh);
  var b=stBox(MARK);mk.getContext('2d').drawImage(S.stMark,b[0]/S.AW*mw,b[1]/S.AH*mh,b[2]/S.AW*mw,b[3]/S.AH*mh);
  var em=null;if(S.fade){em=cv(mw,mh);var eg=em.getContext('2d');eg.fillStyle='#000';eg.fillRect(0,0,mw,mh);maskEllipse(eg,mw,mh);}
  S.Rpre={mk:mk,em:em};}
function restInit(ctx){var S=ctx.state;if(S.R)return S.R;if(!S.Rpre)restPrebuild(S);var mk=S.Rpre.mk,em=S.Rpre.em;S.Rpre=null;
  S.R={t:0,mk:mk,em:em,dirty:S.mkUp!==mk,ro:1,lamp:null,px:null,shake:0,ph:0,idle:0,press:0,pressAt:null,ghost:0,ghostDone:0,lastLong:0};
  if(!restInit.hooked){restInit.hooked=true;addEventListener('click',function(e){var R=restInit.cur;if(R&&performance.now()-R.lastLong<400){e.stopPropagation();e.preventDefault();}},true);}
  return S.R;}
function commitStencil(S,R,pl,amount){var mw=R.mk.width,mh=R.mk.height,g=R.mk.getContext('2d'),b=stBox(pl);g.save();g.globalAlpha=amount;
  g.translate((pl.cx/S.AW)*mw,(pl.cy/S.AH)*mh);g.rotate(pl.rot*Math.PI/180);if(pl.mirror)g.scale(-1,1);g.drawImage(S.stTpl,-b[2]/2/S.AW*mw,-b[3]/2/S.AH*mh,b[2]/S.AW*mw,b[3]/S.AH*mh);g.restore();
  if(R.em){g.save();g.globalCompositeOperation='destination-in';g.drawImage(R.em,0,0);g.restore();}R.dirty=true;
  if(pl.visitor){try{var c=cv(ST_N,ST_N),cg=c.getContext('2d');cg.globalAlpha=amount;cg.drawImage(S.stTpl,0,0);SAVED.handprint=c.toDataURL('image/png');}catch(e){}}}
function restFrame(ctx){var S=ctx.state,g=ctx.g,W=ctx.W,H=ctx.H,r=ctx.to.rect,dt=Math.min(ctx.dt||0,.1),st=EH.debug&&EH.debug.state||{},R=restInit(ctx);restInit.cur=R;S.inRest=true;
  ctx.ui.title(ctx.to.idx,true);                                  // keep the sprayed title (core would blink it off for 0.2 s)
  DPR=ctx.dpr||1;R.t+=dt;var last=ctx.to.idx+1>=(EH.debug&&EH.debug.rooms?EH.debug.rooms().length:1);
  var viewOpen=!!document.querySelector('#view.on');
  var rOutT=(st.playing&&st.auto!==false&&!st.reading&&!last&&!viewOpen)?sm(0,1,(HOLD-.2-st.t)/1.6):1;R.ro=rOutT<R.ro?rOutT:R.ro+(rOutT-R.ro)*Math.min(1,dt*4);
  var rIn=ctx.u.ease(ctx.u.seg(R.t,1.2,3.8)),rOut=R.ro,rr=rIn*rOut;
  // the opening's stencil stays on the wall (same pixels as p = 1), fading with everything else before the next room
  drawMark(g,S,r,rOut);R.darkA=0;
  if(!S.gl||rr<=.002){R.px=null;return;}
  // far from the lamp the relit wall is wall × uAmb (0.4): what the reading panel keeps under it (flat, see rgEnd)
  if(!R.dark){var wc=String(ctx.to.wall||'#3B2A1F').replace('#','');if(wc.length===3)wc=wc.replace(/./g,'$&$&');var wn=parseInt(wc,16);R.dark='rgb('+[wn>>16&255,wn>>8&255,wn&255].map(function(v){return Math.round(v*.4);}).join(',')+')';}
  R.darkA=rr;
  paintCanvases(ctx);
  var pt=ctx.pointer,now=performance.now(),live=pt.active&&now-pt.moved<5000&&!viewOpen&&!rgInRead(ctx,pt.x,pt.y),Rl=Math.max(.2*r.w,70);
  // shake → faster legs
  if(live&&R.px){var v=Math.hypot(pt.x-R.px[0],pt.y-R.px[1])/Math.max(dt,.001);R.shake+=cl(v/1400,0,2)*dt*3;}
  R.shake=Math.min(2.2,R.shake*Math.exp(-dt*2.2));R.px=live?[pt.x,pt.y]:null;
  var rate=3.2*cl(+P.flicker||1,.05,4)*(1+1.4*R.shake);R.ph+=rate*dt;
  // lamp: the cursor, or an idle tour that ends with a ghost hand
  var target,ghostPl=null,gz=1,gq=-1;
  if(live){R.idle=0;target=[pt.x,pt.y-10];}
  else{R.idle+=dt;var cyc=10.5,tc=R.idle%cyc,loop=Math.floor(R.idle/cyc),gi=loop%GHOSTS.length,gp=GHOSTS[gi];
    var keys=IDLE.concat([[7.6,(gp.cx-gp.len*.62)/S.AW,(gp.cy+gp.len*.22)/S.AH]]),q=track(keys,Math.min(tc,7.6));target=[r.x+q[0]*r.w,r.y+q[1]*r.h+Math.sin(R.idle*2.3)*2];
    if(loop<GHOSTS.length){ghostPl=gp;gz=tc<7.5?1:tc<8.3?1-ctx.u.eo((tc-7.5)/.8):tc<9.9?0:ctx.u.ei((tc-9.9)/.6);gq=tc-8.4;
      if(tc>=10.4&&R.ghostDone<=loop){R.ghostDone=loop+1;commitStencil(S,R,gp,.85);}}}
  if(!R.lamp){R.lamp=target.slice();R.lv=[0,0];}var sw=live?22:8,sx0=spring(R.lamp[0],R.lv[0],target[0],sw,dt),sy0=spring(R.lamp[1],R.lv[1],target[1],sw,dt);   // critically damped: no jerk when the lamp sets off or stops
  R.lamp[0]=sx0[0];R.lv[0]=sx0[1];R.lamp[1]=sy0[0];R.lv[1]=sy0[1];
  var tt=R.t,n=nz(tt*(1+R.shake*.4),0),pf=R.ph-Math.floor(R.ph),dip=dipAt(pf),LI=(1.05+.07*n)*dip;
  // press and hold on the rock → your own stencil
  var onArt=!ctx.tool&&pt.down&&pt.x>=r.x&&pt.x<=r.x+r.w&&pt.y>=r.y&&pt.y<=r.y+r.h&&!viewOpen;
  if(onArt){if(R.pressAt==null)R.pressAt={x:pt.x,y:pt.y,t:0};R.pressAt.t+=dt;}
  else if(R.pressAt){if(R.pressAt.t>.35){R.lastLong=now;var pa=R.pressAt;commitStencil(S,R,{cx:(pa.x-r.x)/r.w*S.AW,cy:(pa.y-r.y)/r.h*S.AH,len:MARK.len,rot:MARK.rot,mirror:true,visitor:true},cl(.25+pa.t/2.2,.25,1));}R.pressAt=null;}
  if(R.pressAt&&R.pressAt.t>.2)R.lastLong=now;
  var stU={uStA:0,uStR:3,uStMask:1,uStB:[0,0,1,1]},hand=null;
  if(R.pressAt&&R.pressAt.t>.18){var pa2=R.pressAt,pl={cx:(pa2.x-r.x)/r.w*S.AW,cy:(pa2.y-r.y)/r.h*S.AH,len:MARK.len},b=stBox(pl),q2=pa2.t-.18;
    if(!S.stIsTpl){S.gl.tex('uSt',S.stTpl,true);S.stIsTpl=true;}
    stU={uStA:cl(.25+q2/2.2,0,1)*sm(0,.5,q2),uStR:.4+q2*.9,uStMask:1,uStB:[b[0]/S.AW,b[1]/S.AH,b[2]/S.AW,b[3]/S.AH]};
    hand={pl:pl,z:1-ctx.u.eo(q2/.35),pig:stU.uStA,q:q2};}
  if(R.dirty){S.gl.tex('uMk',R.mk,true);S.mkUp=R.mk;R.dirty=false;}
  var U=glUniforms(ctx,{uL:[R.lamp[0],R.lamp[1]-6,Rl*.42],uLI:LI,uLR:Rl*(1+.04*n),uAmb:.4,uRelief:1,uDither:1,uSoft:0,uLegW:legWeights(R.ph),uLegOn:1,uLegFloor:.12,uMkOn:1});
  for(var kk in stU)U[kk]=stU[kk];
  // mirrored template for the live print: draw it the way commitStencil will
  if(hand){U.uStA=0;}
  var out=S.gl.render(W,H,ctx.dpr||1,U);
  g.save();g.globalAlpha=rr;g.drawImage(out,0,0,W,H);
  var fl={x:R.lamp[0],y:R.lamp[1]};
  function lightAt(x,y){var d=Math.hypot(x-fl.x,y-fl.y);return LI*Math.exp(-d*d/(Rl*Rl)*.9)*1.25+.4;}
  if(hand){var Lh=MARK.len/S.AW*r.w,hp=[r.x+hand.pl.cx/S.AW*r.w,r.y+hand.pl.cy/S.AH*r.h],lt=lightAt(hp[0],hp[1]);
    // the pigment building up round the hand (mirrored template, same as the committed print)
    g.save();g.globalAlpha=rr*hand.pig;g.translate(hp[0],hp[1]);g.rotate(MARK.rot*Math.PI/180);g.scale(-1,1);var s2=Lh*ST_BOX;g.drawImage(S.stTpl,-s2/2,-s2/2,s2,s2);g.restore();
    mist(g,hp[0],hp[1],Lh,(hand.q%1.1)/1.1,Math.floor(hand.q/1.1),lt);
    drawShadow(g,hp[0]+(hp[0]-fl.x)*.06*hand.z,hp[1]+(hp[1]-fl.y)*.06*hand.z,Lh,MARK.rot,true,.5*cl(lt-.3,0,1),1.5);
    drawHand(g,S,hp[0]+hand.z*Lh*.5,hp[1]+hand.z*Lh*.6,Lh*(1+.4*hand.z),MARK.rot,true,fl,{light:lt,alpha:cl((1-hand.z)*2,0,1),blur:hand.z*3,pigment:hand.pig});}
  if(ghostPl&&gz<1){var Lg=ghostPl.len/S.AW*r.w,gpc=[r.x+ghostPl.cx/S.AW*r.w,r.y+ghostPl.cy/S.AH*r.h],lg=lightAt(gpc[0],gpc[1]);
    if(gq>0&&gq<1.6){g.save();g.globalAlpha=rr*cl(gq/1.4,0,1)*.85;g.translate(gpc[0],gpc[1]);g.rotate(ghostPl.rot*Math.PI/180);g.scale(-1,1);var s3=Lg*ST_BOX;g.drawImage(S.stTpl,-s3/2,-s3/2,s3,s3);g.restore();}
    if(gq>=1.6&&R.ghostDone<=Math.floor(R.idle/10.5)){g.save();g.globalAlpha=rr*.85;g.translate(gpc[0],gpc[1]);g.rotate(ghostPl.rot*Math.PI/180);g.scale(-1,1);var s4=Lg*ST_BOX;g.drawImage(S.stTpl,-s4/2,-s4/2,s4,s4);g.restore();}
    if(gq>0)mist(g,gpc[0],gpc[1],Lg,(gq%.8)/.8,Math.floor(gq/.8),lg*(gq<1.6?1:0));
    drawShadow(g,gpc[0]+gz*Lg*.3,gpc[1]+gz*Lg*.2,Lg*(1+.2*gz),ghostPl.rot,true,.45*(1-gz)*cl(lg-.3,0,1),1.5+gz*6);
    g.globalAlpha=rr*.8;drawHand(g,S,gpc[0]+gz*Lg*.6,gpc[1]+gz*Lg*.8,Lg*(1+.45*gz),ghostPl.rot,true,fl,{light:lg,alpha:cl((1-gz)*2,0,1)*.8,blur:.6+gz*4,pigment:gq>0?cl(gq/1.4,0,1)*.8:0});}
  g.globalAlpha=rr;lampFlame(g,R.lamp[0],R.lamp[1],Math.min(1.25,Math.max(.85,r.w/800)),.92+.08*dip,cl((R.lamp[0]-target[0])*-.004,-.4,.4)+.06*nz(tt*.7,3),tt*(1+R.shake*.3));
  g.restore();}

// share the mark so a neighbour can keep it on the wall at its own p = 0
SH.prehistoryMark=function(g,rect,alpha){var S=SH._prehistoryState;if(S&&S.stMark)drawMark(g,S,rect,alpha==null?1:alpha);};

EH.transition('prehistory',{
  duration:D,
  assets:['t_normal.webp','t_legrock.webp','t_legmask.webp'],
  init:function(ctx){setup(ctx);SH._prehistoryState=ctx.state;},
  draw:function(p,ctx){ctx.state.inRest=false;drawOpening(p,ctx);},
  done:function(ctx){var S=ctx.state;S.R=null;S.inRest=true;if(S.gl&&S.stIsTpl){S.gl.tex('uSt',S.stMark,true);S.stIsTpl=false;}},
  rest:function(ctx){var S=ctx.state;if(S.subHidden){S.subHidden=false;var era=document.getElementById('era'+ctx.to.idx);if(era)[].forEach.call(era.querySelectorAll('p'),function(q){q.style.opacity='';});}rgBegin(ctx);try{restFrame(ctx);}finally{var R=S.R;rgEnd(ctx,60,R&&R.dark,R?R.darkA:0);}}
});
})();

;
/* Transition INTO 古希腊罗马 — "走出洞穴，重心落地".
   Cave wall → whip-pan 180° past the fire to the cave mouth → over-exposed Mediterranean sun → the eye adapts, the rock turns to
   white marble, the picture gets a floor → the symmetrical kouros with two gold lines (shoulders, hips) → he recedes into axis lines,
   the lines shift weight onto one leg and twist, gold lines tilt opposite and cross → the Doryphoros materialises on the twisted
   lines and casts the first shadow → plumb line from the crown to the weight-bearing heel, seven head units struck one by one.
   Rest: wall + cut statue + floor + soft shadow (EH_SHARED.antiquityFloor, also used by t-medieval at its p = 0). */
(function(){
'use strict';
// rest guards (API.md "Rest hooks"): while a compare tool is on ('era' | 'special') nothing is painted over ctx.to.rect; while reading, nothing
// is left inside ctx.readRect (a right-hand column fades out over `fade` px just before the panel's edge). Idle, not reading: no-op (exact hand-over).
function rgBegin(ctx){var g=ctx.g,S=ctx.state,R=ctx.reading&&ctx.readRect,r=ctx.to&&ctx.to.rect,k=S.rgK||0,dt=Math.min(ctx.dt||0,.1);
  if(R)S.rgR={x:R.x,y:R.y,w:R.w,h:R.h};k+=((R?1:0)-k)*Math.min(1,dt*6);S.rgK=(!R&&k<.003)?0:(R&&k>.997)?1:k;
  g.save();if((ctx.tool==='era'||ctx.tool==='special')&&r){g.beginPath();g.rect(0,0,ctx.W,ctx.H);g.rect(r.x-1,r.y-1,r.w+2,r.h+2);g.clip('evenodd');}}
function rgEnd(ctx,fade,fill,fillA){var g=ctx.g,S=ctx.state,R=S.rgR;if(!(S.rgK>0)||!R){g.restore();return;}
  g.save();   // still inside rgBegin's compare clip: the fill never lands on the hung work either
  g.globalCompositeOperation='destination-out';g.globalAlpha=S.rgK;
  if(R.x>ctx.W*.3){var f=fade==null?60:fade,x0=R.x-f,gr=g.createLinearGradient(x0,0,R.x,0);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'#000');
    g.fillStyle=gr;g.fillRect(x0,0,ctx.W-x0+1,ctx.H);
    // optional flat fill, added ('lighter' on premultiplied pixels = an exact cross-fade): a room whose rest darkens the whole wall keeps that flat darkness under the panel
    if(fill&&fillA>0){g.globalCompositeOperation='lighter';g.globalAlpha=S.rgK*fillA;var fg=g.createLinearGradient(x0,0,R.x,0);fg.addColorStop(0,fill.replace('rgb(','rgba(').replace(')',',0)'));fg.addColorStop(1,fill);g.fillStyle=fg;g.fillRect(x0,0,ctx.W-x0+1,ctx.H);}}
  else{g.fillStyle='#000';g.fillRect(R.x,R.y,R.w,R.h);if(fill&&fillA>0){g.globalCompositeOperation='lighter';g.globalAlpha=S.rgK*fillA;g.fillStyle=fill;g.fillRect(R.x,R.y,R.w,R.h);}}
  g.restore();g.restore();}
// any pointer over the reading panel belongs to the text, not to the room
function rgInRead(ctx,x,y){var R=ctx.reading&&ctx.readRect;return !!R&&x>=R.x&&x<=R.x+R.w&&y>=R.y&&y<=R.y+R.h;}
var EH=window.EH, SH=window.EH_SHARED=window.EH_SHARED||{};
var DIR='rooms/antiquity/';

// ---------------------------------------------------------------- cut-outs (cut.json): cut pixel = source pixel − (dx, dy)
var CUT={
  main:{file:'main_cut.webp',dx:500,dy:112,w:810,h:2190},
  kouros:{file:'kouros_cut.webp',dx:513,dy:111,w:556,h:2152}
};
// ---------------------------------------------------------------- skeletons (source pixels of main.webp / kouros.webp; L = viewer-left)
var KP={
  kouros:{crown:[775,178],chin:[782,458],neck:[778,560],chest:[778,800],pelvis:[770,1060],
    shL:[572,622],shR:[978,622],gsL:[555,600],gsR:[995,600],ghL:[625,1050],ghR:[915,1050],
    elL:[566,960],haL:[566,1268],elR:[984,960],haR:[984,1268],
    hjL:[700,1150],hjR:[848,1150],knL:[700,1490],knR:[824,1490],anL:[716,1962],anR:[814,1992],toL:[706,2066],toR:[840,2160]},
  main:{crown:[855,178],chin:[835,462],neck:[880,528],chest:[902,790],pelvis:[895,1035],
    shL:[668,590],shR:[1152,566],gsL:[660,575],gsR:[1160,550],ghL:[705,990],ghR:[1095,1040],
    elL:[590,960],haL:[566,1338],elR:[1224,872],haR:[1256,936],
    hjL:[792,1150],hjR:[1000,1170],knL:[792,1690],knR:[1036,1745],anL:[850,2090],anR:[1030,2070],toL:[892,2214],toR:[1150,2200]}
};
var HEEL=[835,2226];            // weight-bearing (viewer-left) heel of the Doryphoros
var SOLE_K=2150;                // kouros sole (source y), plinth bottom = bottom of its cut
var ORDER={crown:.62,chin:.62,neck:.55,chest:.45,pelvis:0,shL:.35,shR:.35,gsL:.35,gsR:.35,ghL:0,ghR:0,elL:.4,haL:.45,elR:.4,haR:.45,
  hjL:.05,hjR:.05,knL:.15,knR:.2,anL:.18,anR:.25,toL:.2,toR:.28};   // when each joint starts moving (weight first, head last)

// ---------------------------------------------------------------- timeline (p)
var T={pan:[.06,.165],push:[.165,.248],fall:[.25,.44],rimMarble:[.236,.27],rimOut:[.32,.45],gold:[.43,.475],skel:[.47,.52],recede:[.505,.575],twist:[.56,.70],
  xdiag:[.665,.715],mat:[.665,.785],skelFade:[.775,.83],shadow:[.75,.815],plumb:[.815,.855],ticks:[.862,.94],cap:[.935,.955],out:[.958,.993]};
var NT=7;

// ---------------------------------------------------------------- small helpers
function cl(x,a,b){a=a==null?0:a;b=b==null?1:b;return x<a?a:x>b?b:x;}
function sg(p,r){return cl((p-r[0])/(r[1]-r[0]));}
function sm(x){x=cl(x);return x*x*(3-2*x);}
function eo(x){x=cl(x);return 1-Math.pow(1-x,3);}
function eoS(x){x=cl(x);return eo(x)*sm(x*4);}   // ease-out with a zero-velocity start
function eio(x){x=cl(x);return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;}
function lerp(a,b,t){return a+(b-a)*t;}
function canvas(w,h){var c=document.createElement('canvas');c.width=Math.max(1,Math.round(w));c.height=Math.max(1,Math.round(h));return c;}
function ready(i){return i&&i.complete&&i.naturalWidth>0;}
function hash(n){var x=Math.sin(n*127.1)*43758.5453;return x-Math.floor(x);}
function vnoise(t){var i=Math.floor(t),f=t-i;f=f*f*(3-2*f);return lerp(hash(i),hash(i+1),f);}

// CSS .wash replica (radial-gradient(ellipse 70% 60% at --sx --sy, colour, transparent 70%))
function wash(g,W,H,rect,ink,k){var dark=ink==='dark',c=dark?'255,255,255':'255,244,225',a=(dark?.35:.08)*(k==null?1:k);
  var sx=+((rect.x+rect.w/2)/W*100).toFixed(1)/100*W,sy=+((rect.y+rect.h/2)/H*100).toFixed(1)/100*H,rx=.7*W,ry=.6*H;
  g.save();g.translate(sx,sy);g.scale(rx,ry);var gr=g.createRadialGradient(0,0,0,0,0,1);gr.addColorStop(0,'rgba('+c+','+a+')');gr.addColorStop(.7,'rgba('+c+',0)');gr.addColorStop(1,'rgba('+c+',0)');
  g.fillStyle=gr;g.fillRect(-sx/rx,-sy/ry,W/rx,H/ry);g.restore();}
function wallWash(g,W,H,wall,rect,ink){g.fillStyle=wall;g.fillRect(0,0,W,H);wash(g,W,H,rect,ink);}

// ================================================================ the floor (shared with t-medieval)
var FL={img:null,cache:{}};
function floorImg(){if(!FL.img){FL.img=new Image();FL.img.decoding='async';FL.img.src=DIR+CUT.main.file;}return FL.img;}
floorImg();
// shadow of the cut statue projected onto the floor: point at height h above the floor line goes to (x + h·SX, fy + h·SY)
var SX=.5,SY=.13;
function shadowCanvas(rect,s,dpr){var im=floorImg();if(!ready(im))return null;s=1;
  var key=Math.round(rect.w*10)+'x'+Math.round(rect.h*10)+'@'+dpr;if(FL.cache[key])return FL.cache[key];
  var keys=Object.keys(FL.cache);if(keys.length>40)keys.slice(0,20).forEach(function(k){delete FL.cache[k];});
  var sx=SX*s,sy=SY*s,pad=24,bw=rect.w+sx*rect.h+2*pad,bh=sy*rect.h+2*pad+8,c=canvas(bw*dpr,bh*dpr),g=c.getContext('2d');
  // silhouette
  var sil=canvas(rect.w*dpr/2,rect.h*dpr/2),q=sil.getContext('2d');q.drawImage(im,0,0,sil.width,sil.height);q.globalCompositeOperation='source-in';q.fillStyle='#2a2118';q.fillRect(0,0,sil.width,sil.height);
  // projected: y' = pad + (rect.h - y)*sy  (the floor line is at y' = pad), x' = pad + x + (rect.h - y)*sx
  function proj(blur,alpha){g.save();g.scale(dpr,dpr);g.filter=blur>0?'blur('+(blur*dpr).toFixed(1)+'px)':'none';g.globalAlpha=alpha;
    g.setTransform(dpr,0,-sx*dpr,-sy*dpr,dpr*(pad+sx*rect.h),dpr*(pad+sy*rect.h));g.drawImage(sil,0,0,rect.w,rect.h);g.restore();}
  proj(1.2,.55);proj(5,.55);proj(14,.5);
  // fade along the length: dense at the feet, gone at the far end
  g.save();g.globalCompositeOperation='destination-in';g.setTransform(dpr,0,0,dpr,0,0);
  var gr=g.createLinearGradient(pad,pad,pad+sx*rect.h,pad+sy*rect.h);gr.addColorStop(0,'rgba(0,0,0,1)');gr.addColorStop(.35,'rgba(0,0,0,.55)');gr.addColorStop(1,'rgba(0,0,0,0)');
  g.fillStyle=gr;g.fillRect(0,0,bw,bh);g.restore();
  // contact shadow along the base of the plinth
  g.save();g.setTransform(dpr,0,0,dpr,0,0);var bx0=pad+rect.w*.20,bx1=pad+rect.w*.90,cy=pad;
  g.filter='blur('+(3*dpr).toFixed(1)+'px)';g.fillStyle='rgba(42,33,24,'+(.42*Math.min(1,s*3))+')';g.beginPath();g.ellipse((bx0+bx1)/2+4,cy+2,(bx1-bx0)/2,3.5+2*s,0,0,Math.PI*2);g.fill();g.restore();
  // nothing above the floor line
  g.clearRect(0,0,c.width,Math.round(pad*dpr));
  var out={c:c,ox:-pad,oy:-pad,w:bw,h:bh};FL.cache[key]=out;return out;}

var FLOOR_TOP=[221,212,197],FLOOR_BOT=[229,221,207];
function antiquityFloor(g,o){o=o||{};var W=o.W,H=o.H,r=o.rect;if(!r)return;var a=o.alpha==null?1:o.alpha,s=o.shadow===true?1:o.shadow===false||o.shadow==null?0:+o.shadow;
  var fy=r.y+r.h,dpr=o.dpr||(g.getTransform?g.getTransform().a:1)||1;if(a<=0)return;
  g.save();g.globalAlpha=a;
  var gr=g.createLinearGradient(0,fy,0,Math.max(fy+1,H));gr.addColorStop(0,'rgb('+FLOOR_TOP+')');gr.addColorStop(1,'rgb('+FLOOR_BOT+')');g.fillStyle=gr;g.fillRect(0,fy,W,Math.max(0,H-fy));
  // where floor meets wall: a soft darker seam just below the line
  var sgr=g.createLinearGradient(0,fy,0,fy+10);sgr.addColorStop(0,'rgba(120,104,84,.20)');sgr.addColorStop(1,'rgba(120,104,84,0)');g.fillStyle=sgr;g.fillRect(0,fy,W,10);
  g.fillStyle='rgba(150,136,116,.35)';g.fillRect(0,fy,W,1);
  // a shorter shadow (s < 1) is the full one squashed along its projection: (u, v) → (u − v·(SX/SY)(1 − s), v·s) about the floor line
  if(s>0){var sc=shadowCanvas(r,1,dpr);if(sc){g.globalAlpha=a*Math.min(1,.35+s*.65);
    if(s<1){g.translate(r.x,fy);g.transform(1,0,-(SX/SY)*(1-s),s,0,0);g.drawImage(sc.c,sc.ox,sc.oy,sc.w,sc.h);}else g.drawImage(sc.c,r.x+sc.ox,fy+sc.oy,sc.w,sc.h);}}
  g.restore();}
SH.antiquityFloor=antiquityFloor;

// ================================================================ sound: a small synth routed through the core master (respects the sound toggle)
var AU={bus:null,bufs:{}};
function bus(sfx){try{if(!sfx||!sfx.on||!sfx.on())return null;if(AU.bus&&AU.bus.context.state==='running')return AU.bus;var cap=null;
  sfx.env({connect:function(n){cap=n;}},sfx.now(),.01,.001,.01);if(!cap)return null;cap.gain.cancelScheduledValues(0);cap.gain.setValueAtTime(1,cap.context.currentTime);AU.bus=cap;return cap;}catch(e){return null;}}
function buf(ac,name,sec,fill){var k=name+'@'+ac.sampleRate;if(AU.bufs[k])return AU.bufs[k];var n=Math.ceil(ac.sampleRate*sec),b=ac.createBuffer(1,n,ac.sampleRate);fill(b.getChannelData(0),ac.sampleRate);AU.bufs[k]=b;return b;}
function play(b,ac,buffer,env,filt){var s=ac.createBufferSource();s.buffer=buffer;var g=ac.createGain(),t=ac.currentTime;g.gain.setValueAtTime(0.0001,t);
  env.forEach(function(e){g.gain.linearRampToValueAtTime(e[1],t+e[0]);});var node=s;if(filt){filt.forEach(function(f){var q=ac.createBiquadFilter();q.type=f[0];q.frequency.value=f[1];q.Q.value=f[2]||.7;node.connect(q);node=q;});}
  node.connect(g);g.connect(b);s.start(t);s.stop(t+buffer.duration);}
function sndFire(sfx){var b=bus(sfx);if(!b)return;var ac=b.context;
  var B=buf(ac,'fire',5,function(d,sr){var r=EH.util.rng(11),l=0,i;for(i=0;i<d.length;i++){var w=r()*2-1;l+=.025*(w-l);d[i]=l*1.4;}
    var t=0;while(t<5){t+=-Math.log(1-r())/(18+14*Math.sin(t*2.1));var i0=Math.floor(t*sr),len=Math.floor(sr*(.0008+r()*.005)),amp=(.15+r()*.6)*(r()<.12?2.2:1);
      for(var k=0;k<len&&i0+k<d.length;k++)d[i0+k]+=(r()*2-1)*amp*Math.exp(-k/(len*.28));}});
  play(b,ac,B,[[.25,.5],[2.4,.45],[3.6,.12],[4.6,0.0001]],[['highpass',120]]);}
// ================================================================ scenery pre-rendered in init (and again if the viewport changes)
function build(ctx){var S=ctx.state,W=ctx.W,H=ctx.H,d=Math.min(ctx.dpr||1,2);S.W=W;S.H=H;S.d=d;
  // 1. the previous room's rest frame
  var F=canvas(W*d,H*d),g=F.getContext('2d');g.scale(d,d);
  if(ctx.from){wallWash(g,W,H,ctx.from.wall,ctx.from.rect,ctx.from.ink);var r=ctx.from.rect,im=ctx.from.image;
    if(ready(im)){if(ctx.from.frame==='fade'){var f=canvas(r.w*d,r.h*d),q=f.getContext('2d');q.drawImage(im,0,0,f.width,f.height);q.globalCompositeOperation='destination-in';
        q.save();q.translate(f.width/2,f.height/2);q.scale(f.width*.58,f.height*.60);var gr=q.createRadialGradient(0,0,0,0,0,1);gr.addColorStop(0,'#000');gr.addColorStop(.62,'#000');gr.addColorStop(1,'rgba(0,0,0,0)');q.fillStyle=gr;q.fillRect(-2,-2,4,4);q.restore();
        g.drawImage(f,r.x,r.y,r.w,r.h);}else g.drawImage(im,r.x,r.y,r.w,r.h);}}
  else{g.fillStyle='#050403';g.fillRect(0,0,W,H);}
  S.from=F;
  var rock=ctx.asset('t_rock.webp'),marble=ctx.asset('t_marble.webp');
  // 2. the rock strip between the painted wall and the cave mouth (half resolution: it only passes by in motion)
  var R=Math.round(W*.9);S.R=R;var st=canvas(R*d*.5,H*d*.5),h=st.getContext('2d');h.scale(d*.5,d*.5);
  h.fillStyle=ctx.from?ctx.from.wall:'#050403';h.fillRect(0,0,R,H);
  if(ready(rock)){h.save();var lg=h.createLinearGradient(0,0,R*.4,0);lg.addColorStop(0,'rgba(0,0,0,0)');lg.addColorStop(1,'#000');
    var tmp=canvas(R,H),tq=tmp.getContext('2d');tq.drawImage(rock,0,0,rock.naturalWidth*.8,rock.naturalHeight*.25,0,0,R,H);tq.fillStyle='rgba(10,6,3,.35)';tq.fillRect(0,0,R,H);
    tq.globalCompositeOperation='destination-in';tq.fillStyle=lg;tq.fillRect(0,0,R,H);h.drawImage(tmp,0,0);h.restore();}
  // the fire the viewer had at their back
  var fx=R*.52,fyy=H*.72;h.save();h.globalCompositeOperation='lighter';
  var fg=h.createRadialGradient(fx,fyy,0,fx,fyy,H*.6);fg.addColorStop(0,'rgba(255,170,70,.85)');fg.addColorStop(.25,'rgba(210,95,30,.35)');fg.addColorStop(1,'rgba(120,40,10,0)');h.fillStyle=fg;h.fillRect(0,0,R,H);
  var cg=h.createRadialGradient(fx,fyy,0,fx,fyy,H*.09);cg.addColorStop(0,'rgba(255,240,200,1)');cg.addColorStop(.5,'rgba(255,180,80,.7)');cg.addColorStop(1,'rgba(255,120,40,0)');h.fillStyle=cg;h.beginPath();h.ellipse(fx,fyy-H*.03,H*.05,H*.1,0,0,Math.PI*2);h.fill();h.restore();
  S.strip=st;
  // 3. the cave mouth: rock with an opening; the opening itself is transparent
  var ow=Math.min(W*.36,H*.46),oh=ow*1.38,ocx=W*.5,ocy=H*.5;S.oc=[ocx,ocy,ow,oh];
  function mouthPath(q,grow){q.beginPath();for(var k=0;k<=120;k++){var a=k/120*Math.PI*2,ca=Math.cos(a),sa=Math.sin(a);
      var n=1+.07*Math.sin(a*3+1.3)+.05*Math.sin(a*5+.4)+.03*Math.sin(a*11+2.2)+.015*Math.sin(a*23);var fl=sa>0?1-.28*Math.pow(sa,3):1;   // flatter floor
      var x=ocx+ca*ow/2*n*(grow||1),y=ocy+sa*oh/2*n*fl*(grow||1)-(sa<0?Math.pow(-sa,2)*oh*.05:0);k?q.lineTo(x,y):q.moveTo(x,y);}q.closePath();}
  function rim(tex,dark){var c=canvas(W*d,H*d),q=c.getContext('2d');q.scale(d,d);
    if(ready(tex)){var sc=Math.max(W/tex.naturalWidth,H/tex.naturalHeight)*1.05;q.drawImage(tex,(W-tex.naturalWidth*sc)/2,(H-tex.naturalHeight*sc)/2,tex.naturalWidth*sc,tex.naturalHeight*sc);}else{q.fillStyle=dark?'#2a211a':'#efe9df';q.fillRect(0,0,W,H);}
    // light falling in through the opening onto the rock around it
    q.save();q.globalCompositeOperation=dark?'lighter':'source-over';var lg=q.createRadialGradient(ocx,ocy,ow*.4,ocx,ocy,Math.max(W,H)*.75);
    if(dark){lg.addColorStop(0,'rgba(255,214,160,.55)');lg.addColorStop(.3,'rgba(160,110,70,.18)');lg.addColorStop(1,'rgba(0,0,0,0)');}
    else{lg.addColorStop(0,'rgba(255,252,244,.5)');lg.addColorStop(1,'rgba(214,204,188,.35)');}
    q.fillStyle=lg;q.fillRect(0,0,W,H);q.restore();
    if(dark){q.save();q.globalCompositeOperation='multiply';var vg=q.createRadialGradient(ocx,ocy,ow*.6,ocx,ocy,Math.max(W,H)*.8);vg.addColorStop(0,'rgb(255,255,255)');vg.addColorStop(1,'rgb(40,32,26)');q.fillStyle=vg;q.fillRect(0,0,W,H);q.restore();}
    // bright lip of the opening
    q.save();mouthPath(q,1.0);q.clip();q.restore();
    q.save();q.filter='blur('+(6*d)+'px)';q.strokeStyle=dark?'rgba(255,220,170,.8)':'rgba(255,255,255,.7)';q.lineWidth=ow*.06;mouthPath(q,1.02);q.stroke();q.restore();
    q.save();q.globalCompositeOperation='destination-out';q.filter='blur('+(1.2*d)+'px)';q.fillStyle='#000';mouthPath(q,1);q.fill();q.restore();
    return c;}
  S.rockRim=rim(rock,true);S.marbleRim=rim(marble,false);
  // 4. the Mediterranean seen through the opening (bleached; it is too bright to look at)
  var sk=canvas(W*d,H*d),k=sk.getContext('2d');k.scale(d,d);var hz=ocy+oh*.12;
  var sg1=k.createLinearGradient(0,ocy-oh*.6,0,hz);sg1.addColorStop(0,'#bcd3df');sg1.addColorStop(1,'#f3f1e8');k.fillStyle=sg1;k.fillRect(0,0,W,hz);
  var sg2=k.createLinearGradient(0,hz,0,ocy+oh*.6);sg2.addColorStop(0,'#c9dade');sg2.addColorStop(1,'#8fb2c0');k.fillStyle=sg2;k.fillRect(0,hz,W,H-hz);
  k.fillStyle='rgba(255,255,255,.55)';k.fillRect(0,hz-1,W,1.5);
  var sun=k.createRadialGradient(ocx+ow*.18,ocy-oh*.22,0,ocx+ow*.18,ocy-oh*.22,ow*.9);sun.addColorStop(0,'rgba(255,253,245,1)');sun.addColorStop(.2,'rgba(255,248,230,.8)');sun.addColorStop(1,'rgba(255,248,230,0)');k.fillStyle=sun;k.fillRect(0,0,W,H);
  // sun path on the water: a soft column of glints under the sun, broken into short horizontal sparkles
  var sxp=ocx+ow*.18;k.save();k.filter='blur('+(ow*.035*d).toFixed(1)+'px)';var gl=k.createLinearGradient(0,hz,0,ocy+oh*.6);gl.addColorStop(0,'rgba(255,252,240,.75)');gl.addColorStop(1,'rgba(255,252,240,0)');
  k.fillStyle=gl;k.beginPath();k.moveTo(sxp-ow*.05,hz);k.lineTo(sxp+ow*.05,hz);k.lineTo(sxp+ow*.2,ocy+oh*.6);k.lineTo(sxp-ow*.2,ocy+oh*.6);k.closePath();k.fill();k.restore();
  var rr=EH.util.rng(21);k.save();k.fillStyle='rgba(255,253,246,.8)';for(var j=0;j<140;j++){var t=rr(),yy=hz+2+Math.pow(t,1.6)*oh*.5,spread=ow*(.03+.16*Math.pow(t,1.3)),xx=sxp+(rr()*2-1)*spread*(.4+rr()*.6),len=(2+rr()*7)*(1+t*2),th=.6+t*1.2;
    k.globalAlpha=(1-t)*.9*rr();k.fillRect(xx-len/2,yy,len,th);}k.restore();
  k.save();k.strokeStyle='rgba(255,255,255,.10)';k.lineWidth=1;for(var j2=0;j2<26;j2++){var y2=hz+4+Math.pow(j2/26,1.5)*oh*.55;k.beginPath();k.moveTo(0,y2);k.lineTo(W,y2+(rr()-.5)*2);k.stroke();}k.restore();
  S.sky=sk;
  // the cave mouth as one opaque picture (sky seen through the rock) for the motion-blurred pan
  var m1=canvas(W*d,H*d),mq=m1.getContext('2d');mq.drawImage(sk,0,0);mq.drawImage(S.rockRim,0,0);S.mouth1=m1;
  // CSS-resolution buffer for the motion-blurred part of the whip-pan (many full-screen taps; at dpr 2 a quarter of the pixels)
  S.pbs=Math.min(1,d);S.pb=canvas(W*S.pbs,H*S.pbs);S.pbg=S.pb.getContext('2d');
  // masks for the statue reveal, allocated once per statue (no resize on first use)
  S.mk={};S.lo=null;var G=geo(ctx);maskBuf(S,'k',G.krect);maskBuf(S,'m',G.r);
  shadowCanvas(G.r,1,d);
  // warm the caption font
  var fw=canvas(4,4).getContext('2d');fw.font='14px "Noto Serif SC","Songti SC",serif';fw.fillText('全身约 7 个头长',0,2);fw.font='12px "Noto Serif SC","Songti SC",serif';fw.fillText('全身约 7 个头长',0,2);
}
var MPAD=40;
function maskBuf(S,key,dest){var d=S.d,ww=Math.ceil(dest.w+2*MPAD)+1,hh=Math.ceil(dest.h+2*MPAD)+1,m=S.mk[key];
  if(!m||m.width!==Math.round(ww*d)||m.height!==Math.round(hh*d)){m=S.mk[key]=canvas(ww*d,hh*d);m._g=m.getContext('2d');}
  if(!S.lo||S.lo.width<ww||S.lo.height<hh){S.lo=canvas(Math.max(ww,S.lo?S.lo.width:0),Math.max(hh,S.lo?S.lo.height:0));S.lo._g=S.lo.getContext('2d');}
  return m;}

// ---------------------------------------------------------------- geometry of the statues on screen
function geo(ctx){var r=ctx.to.rect,S=ctx.state,key=[r.x,r.y,r.w,r.h].join(',');if(S.geoKey===key)return S.geo;
  var m=CUT.main,k=CUT.kouros,sd=r.w/m.w;               // screen px per source px (main)
  function mp(p){return[r.x+(p[0]-m.dx)*sd,r.y+(p[1]-m.dy)*sd];}
  var Dh=(HEEL[1]-KP.main.crown[1])*sd,sk=Dh*.975/(SOLE_K-KP.kouros.crown[1]);   // kouros slightly shorter (194.6 vs 198 cm)
  var fy=r.y+r.h,kx=mp(KP.main.pelvis)[0]-(KP.kouros.pelvis[0]-k.dx)*sk,ky=fy-k.h*sk;
  function kp(p){return[kx+(p[0]-k.dx)*sk,ky+(p[1]-k.dy)*sk];}
  var D={},K={};Object.keys(KP.main).forEach(function(n){D[n]=mp(KP.main[n]);K[n]=kp(KP.kouros[n]);});
  S.geo={r:r,sd:sd,sk:sk,fy:fy,D:D,K:K,krect:{x:kx,y:ky,w:k.w*sk,h:k.h*sk},heel:mp(HEEL),crown:D.crown};S.geoKey=key;return S.geo;}

function pose(G,t){var P={};Object.keys(G.D).forEach(function(n){var o=ORDER[n]||0,u=eio(cl((t-o*.55)/.45));
    // the weight shift overshoots a little and settles, as if he really leans onto the leg
    if(o<.1)u=cl(u+.06*Math.sin(Math.PI*cl(t/.7))*(1-t));
    P[n]=[lerp(G.K[n][0],G.D[n][0],u),lerp(G.K[n][1],G.D[n][1],u)];});return P;}

// axis lines of the figure
var LIMBS=[['shL','elL','haL'],['shR','elR','haR'],['hjL','knL','anL','toL'],['hjR','knR','anR','toR'],['neck','shL'],['neck','shR'],['pelvis','hjL'],['pelvis','hjR']];
function strokeBody(q,P,head){LIMBS.forEach(function(l){q.beginPath();q.moveTo(P[l[0]][0],P[l[0]][1]);for(var i=1;i<l.length;i++)q.lineTo(P[l[i]][0],P[l[i]][1]);q.stroke();});
  q.beginPath();q.moveTo(P.neck[0],P.neck[1]);q.quadraticCurveTo(2*P.chest[0]-(P.neck[0]+P.pelvis[0])/2,2*P.chest[1]-(P.neck[1]+P.pelvis[1])/2,P.pelvis[0],P.pelvis[1]);q.stroke();
  if(head){var cx=(P.crown[0]+P.chin[0])/2,cy=(P.crown[1]+P.chin[1])/2,len=Math.hypot(P.chin[0]-P.crown[0],P.chin[1]-P.crown[1]),a=Math.atan2(P.chin[1]-P.crown[1],P.chin[0]-P.crown[0])-Math.PI/2;
    q.beginPath();q.ellipse(cx,cy,len*.36,len*.5,a,0,Math.PI*2);q.stroke();q.beginPath();q.moveTo(P.chin[0],P.chin[1]);q.lineTo(P.neck[0],P.neck[1]);q.stroke();}}
function fillBody(q,P){q.beginPath();q.moveTo(P.gsL[0],P.gsL[1]);q.lineTo(P.gsR[0],P.gsR[1]);q.lineTo(P.ghR[0],P.ghR[1]);q.lineTo(P.hjR[0],P.hjR[1]+30);q.lineTo(P.hjL[0],P.hjL[1]+30);q.lineTo(P.ghL[0],P.ghL[1]);q.closePath();q.fill();
  var cx=(P.crown[0]+P.chin[0])/2,cy=(P.crown[1]+P.chin[1])/2,len=Math.hypot(P.chin[0]-P.crown[0],P.chin[1]-P.crown[1]);q.beginPath();q.ellipse(cx,cy,len*.42,len*.56,0,0,Math.PI*2);q.fill();}

// statue revealed only around the axis lines (w = stroke width in screen px)
function masked(ctx,g,img,dest,P,w,alpha,base,key){var S=ctx.state,d=S.d,x0=Math.floor(dest.x-MPAD),y0=Math.floor(dest.y-MPAD),ww=Math.ceil(dest.w+2*MPAD),hh=Math.ceil(dest.h+2*MPAD);
  var m=maskBuf(S,key,dest),lo=S.lo,q=lo._g;
  // soft edge = strokes rasterised at scale f and upscaled with smoothing (≈ the old blur(1 + w·0.1 px), without a per-frame filter)
  var blur=Math.min(9,1+w*.1),f=cl(.6/blur,1/16,1),lw_=Math.ceil(ww*f)+2,lh_=Math.ceil(hh*f)+2;
  q.setTransform(1,0,0,1,0,0);q.globalCompositeOperation='source-over';q.globalAlpha=1;q.clearRect(0,0,lw_+2,lh_+2);
  q.setTransform(f,0,0,f,-x0*f+1,-y0*f+1);q.strokeStyle='#000';q.fillStyle='#000';q.lineCap='round';q.lineJoin='round';q.lineWidth=Math.max(.5,w);
  strokeBody(q,P,false);q.beginPath();q.moveTo(P.crown[0],P.crown[1]);q.lineTo(P.chin[0],P.chin[1]);q.lineTo(P.neck[0],P.neck[1]);q.stroke();
  var hk=cl(w/(dest.w*.22)),hcx=(P.crown[0]+P.chin[0])/2,hcy=(P.crown[1]+P.chin[1])/2,hl=Math.hypot(P.chin[0]-P.crown[0],P.chin[1]-P.crown[1]);
  if(hk>0){q.beginPath();q.ellipse(hcx,hcy,Math.max(w/2,hl*.42*hk),Math.max(w/2,hl*.56*hk),0,0,Math.PI*2);q.fill();}
  var gl=[[P.gsL,P.gsR],[P.ghL,P.ghR]];gl.forEach(function(l){q.beginPath();q.moveTo(l[0][0],l[0][1]);q.lineTo(l[1][0],l[1][1]);q.stroke();});
  if(w>dest.w*.12){q.globalAlpha=cl((w-dest.w*.12)/(dest.w*.2));fillBody(q,P);if(base){q.fillRect(base.x,base.y,base.w,base.h);}q.globalAlpha=1;}
  var mg=m._g;mg.setTransform(1,0,0,1,0,0);mg.globalCompositeOperation='source-over';mg.globalAlpha=1;mg.clearRect(0,0,m.width,m.height);
  mg.imageSmoothingEnabled=true;mg.imageSmoothingQuality='high';mg.drawImage(lo,1,1,ww*f,hh*f,0,0,ww*d,hh*d);
  mg.setTransform(d,0,0,d,-x0*d,-y0*d);mg.globalCompositeOperation='source-in';mg.drawImage(img,dest.x,dest.y,dest.w,dest.h);
  g.save();g.globalAlpha=alpha;g.drawImage(m,0,0,ww*d,hh*d,x0,y0,ww,hh);g.restore();}

// ---------------------------------------------------------------- drawing pieces
var GOLD='176,141,87',INK='70,58,46';
function lineThrough(a,b,ext){var dx=b[0]-a[0],dy=b[1]-a[1];return[[a[0]-dx*ext,a[1]-dy*ext],[b[0]+dx*ext,b[1]+dy*ext]];}
function drawGold(g,P,u,alpha,lw){if(alpha<=0||u<=0)return;g.save();g.strokeStyle='rgba('+GOLD+','+alpha+')';g.fillStyle=g.strokeStyle;g.lineWidth=lw;g.lineCap='round';
  [[P.gsL,P.gsR],[P.ghL,P.ghR]].forEach(function(l,i){var uu=cl(u*1.25-i*.25),L=lineThrough(l[0],l[1],.32),e=[lerp(L[0][0],L[1][0],eoS(uu)),lerp(L[0][1],L[1][1],eoS(uu))];
    if(uu<=0)return;g.beginPath();g.moveTo(L[0][0],L[0][1]);g.lineTo(e[0],e[1]);g.stroke();g.beginPath();g.arc(L[0][0],L[0][1],lw*1.3*sm(uu/.12),0,Math.PI*2);g.fill();var ed=sm((uu-.82)/.18);if(ed>0){g.beginPath();g.arc(L[1][0],L[1][1],lw*1.3*ed,0,Math.PI*2);g.fill();}});
  g.restore();}
function drawX(g,P,u,alpha,lw){if(alpha<=0||u<=0)return;g.save();g.strokeStyle='rgba('+GOLD+','+alpha*.85+')';g.lineWidth=lw*.8;g.lineCap='round';
  [[P.gsL,P.ghR],[P.gsR,P.ghL]].forEach(function(l,i){var uu=eio(cl(u*1.3-i*.3));if(uu<=0)return;g.beginPath();g.moveTo(l[0][0],l[0][1]);g.lineTo(lerp(l[0][0],l[1][0],uu),lerp(l[0][1],l[1][1],uu));g.stroke();});g.restore();}
function drawSkel(g,P,u,alpha,lw){if(alpha<=0||u<=0)return;g.save();g.strokeStyle='rgba('+INK+','+alpha*.7+')';g.lineWidth=lw;g.lineCap='round';g.lineJoin='round';
  // draw-on: dash offset over each stroke
  g.setLineDash(u<1?[2000*eoS(u),2000]:[]);strokeBody(g,P,false);g.beginPath();g.moveTo(P.crown[0],P.crown[1]);g.lineTo(P.chin[0],P.chin[1]);g.lineTo(P.neck[0],P.neck[1]);g.stroke();g.setLineDash([]);
  g.fillStyle='rgba(236,229,216,'+alpha+')';g.strokeStyle='rgba('+INK+','+alpha*.8+')';g.lineWidth=lw*.9;
  ['shL','shR','elL','elR','hjL','hjR','knL','knR','anL','anR','neck','pelvis'].forEach(function(n){g.beginPath();g.arc(P[n][0],P[n][1],lw*1.35,0,Math.PI*2);g.globalAlpha=cl(u*1.5);g.fill();g.stroke();});
  g.restore();}

// ================================================================ the module
EH.transition('antiquity',{
  duration:19,
  assets:[CUT.main.file,CUT.kouros.file,'t_rock.webp','t_marble.webp'],
  init:function(ctx){build(ctx);ctx.state.ink=null;},
  draw:function(p,ctx){
    var S=ctx.state,g=ctx.g,W=ctx.W,H=ctx.H;if(S.W!==W||S.H!==H||S.d!==Math.min(ctx.dpr||1,2))build(ctx);
    var G=geo(ctx),r=G.r,img=ready(ctx.asset(CUT.main.file))?ctx.asset(CUT.main.file):ctx.to.image,kimg=ctx.asset(CUT.kouros.file),mob=W<600,lw=mob?1.1:1.4;
    var ink=p<.2?(ctx.from?ctx.from.ink:'light'):'dark';if(S.ink!==ink){S.ink=ink;ctx.ui.ink(ink);}
    if(p>.3)ctx.ui.deco(0);                                        // frame 'none' has a rectangular drop shadow; a cut-out statue doesn't want it
    // ---------------- sounds
    // whip, sun, sea/cicadas, gold lines, stone, X, plumb and the seven head ticks are recorded: audio/cues/antiquity.json.
    // Only what the cue sheet doesn't cover stays synthesized here: the cave fire, the first shadow, the plumb bob landing.
    ctx.cue(.0005,function(){sndFire(ctx.sfx);});
    ctx.cue(T.shadow[0],function(){ctx.sfx.puff(.05,1.4);});
    ctx.cue(T.plumb[1]-.004,function(){ctx.sfx.tick(.06);});

    // ---------------- 1. in the cave: fire flicker, then the whip-pan (motion-blurred) onto the cave mouth
    if(p<T.pan[1]){
      var pu=sg(p,T.pan),th=eio(pu),span=W+S.R,x0=-th*span,vel=pu>0&&pu<1?Math.abs(eio(pu+.004)-eio(pu-.004))/.008:0;
      var roll=Math.sin(pu*Math.PI)*.01,bob=Math.sin(pu*Math.PI)*H*.01;
      var blurLen=vel*W*.07,K=Math.max(1,Math.min(28,Math.ceil(blurLen/5)));
      var ub=blurLen>8&&S.pb,tg=ub?S.pbg:g;   // once the smear is > 8 px, render it at CSS resolution (identical look, a quarter of the fill at dpr 2)
      if(ub){tg.setTransform(S.pbs,0,0,S.pbs,0,0);tg.globalCompositeOperation='source-over';tg.globalAlpha=1;tg.clearRect(0,0,W,H);}
      tg.save();tg.translate(W/2,H/2);tg.rotate(roll);tg.translate(-W/2,-H/2+bob);
      for(var k=0;k<K;k++){var off=x0+(K>1?(k/(K-1)-.5)*blurLen:0);tg.globalAlpha=1/(k+1);
        if(off>-W)tg.drawImage(S.from,off,0,W,H);
        if(off+W<W&&off+W+S.R>0)tg.drawImage(S.strip,off+W,0,S.R,H);
        var mx=off+W+S.R;if(mx<W)tg.drawImage(S.mouth1,mx,0,W,H);}
      // a shadowed fold of rock hides the seam between the passing wall and the mouth
      var mx0=x0+W+S.R,ov=W*.12,fa=sm((1-pu)*5);if(fa>0&&mx0>-ov&&mx0<W+ov){tg.globalAlpha=1;var fg=tg.createLinearGradient(mx0-ov,0,mx0+ov,0);fg.addColorStop(0,'rgba(18,12,8,0)');fg.addColorStop(.5,'rgba(18,12,8,'+(.75*fa)+')');fg.addColorStop(1,'rgba(18,12,8,0)');tg.fillStyle=fg;tg.fillRect(mx0-ov,-H*.1,2*ov,H*1.2);}
      tg.restore();tg.globalAlpha=1;if(ub)g.drawImage(S.pb,0,0,W,H);
      // firelight playing on the wall before the turn (the only light in the cave is behind us)
      var fl=(1-sm(sg(p,[.05,.1])))*sm(p/.02),n1=vnoise(p*140),n2=vnoise(p*310+7);
      if(fl>0&&ctx.from){g.save();g.globalCompositeOperation='multiply';g.fillStyle='rgba(40,22,10,'+(fl*(.12+.22*n1))+')';g.fillRect(0,0,W,H);g.globalCompositeOperation='lighter';
        var fr=g.createRadialGradient(W*(.3+.1*n2),H*.9,0,W*.3,H*.9,Math.max(W,H)*.9);fr.addColorStop(0,'rgba(255,150,60,'+(fl*.16*n2)+')');fr.addColorStop(1,'rgba(255,150,60,0)');g.fillStyle=fr;g.fillRect(0,0,W,H);g.restore();}
    }else{
      // ---------------- 2. walk into the light, then the room (wall, floor, kouros → Doryphoros) as the eye adapts
      var zoom=mouthZoom(p),sw=sm(sg(p,[T.push[1]-.012,T.push[1]]));   // the view beyond the mouth is swapped while the glare is total
      if(sw<1)drawMouth(g,S,W,H,0,zoom,1,1);
      if(sw>0){g.save();g.globalAlpha=sw;scene(p,ctx,g,G,img,kimg,lw,mob);var rimA=1-sm(sg(p,T.rimOut));if(rimA>0)drawRim(g,S,W,H,zoom,sm(sg(p,T.rimMarble)),rimA);g.restore();}
    }
    var E=exposure(p);
    // exposure: bloom from the opening, then the eye adapts (monotonic fall after the peak)
    if(E>0){g.save();var oc=S.oc;g.globalCompositeOperation='screen';var bl=g.createRadialGradient(oc[0],oc[1],0,oc[0],oc[1],Math.max(W,H)*(.35+E*.9));
      bl.addColorStop(0,'rgba(255,250,238,'+cl(E*1.6)+')');bl.addColorStop(1,'rgba(255,246,228,0)');g.fillStyle=bl;g.fillRect(0,0,W,H);
      g.globalCompositeOperation='source-over';g.fillStyle='rgba(252,248,240,'+(Math.pow(E,1.6)*.96)+')';g.fillRect(0,0,W,H);
      // a trace of Mediterranean sky left in the eye
      var sky=E*sm(sg(p,[T.push[1]-.012,T.push[1]+.004]));if(sky>0){var sgk=g.createLinearGradient(0,0,0,H*.55);sgk.addColorStop(0,'rgba(196,219,232,'+(.28*sky)+')');sgk.addColorStop(1,'rgba(196,219,232,0)');g.fillStyle=sgk;g.fillRect(0,0,W,H*.55);}
      g.restore();}
    // hand-over insurance: the floor also lives on the fx canvas from the very frame the core swaps in the DOM painting
    if(p>=1)fxFloor(ctx);
  },
  done:function(ctx){ctx.ui.deco(0);fxFloor(ctx);},
  rest:function(ctx){ctx.ui.deco(0);rgBegin(ctx);antiquityFloor(ctx.g,{W:ctx.W,H:ctx.H,rect:ctx.to.rect,shadow:1,alpha:1,dpr:Math.min(ctx.dpr||1,2)});rgEnd(ctx,60);}
});

function fxFloor(ctx){var c=document.getElementById('fx');if(!c)return;var q=c.getContext('2d'),d=Math.min(ctx.dpr||1,2);q.setTransform(d,0,0,d,0,0);q.globalAlpha=1;q.globalCompositeOperation='source-over';q.clearRect(0,0,ctx.W,ctx.H);
  antiquityFloor(q,{W:ctx.W,H:ctx.H,rect:EH.rectFor(ctx.to.idx),shadow:1,alpha:1,dpr:d});}

function mouthZoom(p){return 1+.9*Math.pow(sg(p,T.push),2)+1.5*eo(sg(p,[T.push[1],T.fall[1]]));}
function exposure(p){var a=T.push[0]+.02,pk=T.push[1]-.004,f=T.fall;
  if(p<a)return 0;if(p<pk)return .95*Math.pow((p-a)/(pk-a),2.4);if(p<f[0])return .95;
  var u=(p-f[0])/(f[1]-f[0]);if(u>=1)return 0;return .95*Math.pow(1-u,2.2);}   // fast at first, then slow: an eye adapting

function drawMouth(g,S,W,H,ox,zoom,rockA,skyA){var oc=S.oc;g.save();g.translate(ox,0);
  if(skyA>0){var zs=1+(zoom-1)*.35;g.save();g.globalAlpha*=skyA;g.translate(oc[0],oc[1]);g.scale(zs,zs);g.translate(-oc[0],-oc[1]);g.drawImage(S.sky,0,0,W,H);g.restore();}
  g.translate(oc[0],oc[1]);g.scale(zoom,zoom);g.translate(-oc[0],-oc[1]);g.globalAlpha*=rockA;g.drawImage(S.rockRim,0,0,W,H);g.restore();}
function drawRim(g,S,W,H,zoom,marble,alpha){var oc=S.oc;g.save();g.translate(oc[0],oc[1]);g.scale(zoom,zoom);g.translate(-oc[0],-oc[1]);
  if(marble<1){g.globalAlpha=alpha*(1-marble);g.drawImage(S.rockRim,0,0,W,H);}
  if(marble>0){g.globalAlpha=alpha*marble;g.drawImage(S.marbleRim,0,0,W,H);}g.restore();}

// the room after the cave: wall, floor, statues, lines, plumb line
function scene(p,ctx,g,G,img,kimg,lw,mob){var W=ctx.W,H=ctx.H,r=G.r,S=ctx.state;
  wallWash(g,W,H,ctx.to.wall,r,'dark');
  // the floor, for the first time: the seam draws out from the statue's base, the plane fades in under it
  var fa=sm(sg(p,[.29,.40])),fl=eo(sg(p,[.28,.37])),shadow=sm(sg(p,T.shadow));
  if(fa>0)antiquityFloor(g,{W:W,H:H,rect:r,shadow:shadow,alpha:fa,dpr:S.d});
  if(fl>0&&fl<1||fa<1&&fl>0){var cx=G.D.pelvis[0],L=Math.max(cx,W-cx)*fl;g.save();var lg=g.createLinearGradient(cx-L,0,cx+L,0);lg.addColorStop(0,'rgba(120,104,84,0)');lg.addColorStop(.12,'rgba(120,104,84,.55)');lg.addColorStop(.88,'rgba(120,104,84,.55)');lg.addColorStop(1,'rgba(120,104,84,0)');
    g.globalAlpha=1-fa*.999;g.fillStyle=lg;g.fillRect(cx-L,G.fy-.5,2*L,1.5);g.restore();}
  var tw=sg(p,T.twist),P=pose(G,tw),kr=G.krect;
  // kouros: whole until he recedes into his axis lines
  var rc=sg(p,T.recede);
  if(ready(kimg)){if(rc<=0)g.drawImage(kimg,kr.x,kr.y,kr.w,kr.h);
    else if(rc<1){var wmax=kr.w*.62,w=wmax*Math.pow(1-eoS(rc),1.6);masked(ctx,g,kimg,kr,pose(G,0),w,1-sm(cl(rc*1.2)),{x:kr.x,y:G.fy-kr.h*.12,w:kr.w,h:kr.h*.12},'k');}}
  var gh=.16*sm(sg(p,[T.skel[0],T.recede[0]+.03]))*(1-sm(sg(p,[T.twist[0],T.twist[0]+.05])));
  if(gh>0&&ready(kimg)){g.save();g.globalAlpha=gh*(rc>0?1:0);g.drawImage(kimg,kr.x,kr.y,kr.w,kr.h);g.restore();}
  // Doryphoros: grows out of the twisted lines, then stands whole
  var mt=sg(p,T.mat);
  if(mt>0){if(mt<1){var wm=r.w*.75,w2=lw*3+wm*Math.pow(mt,1.3),full=sm((mt-.7)/.3);
      if(full<1)masked(ctx,g,img,r,P,w2,sm(cl(mt*3)),{x:r.x,y:G.fy-r.h*.08,w:r.w,h:r.h*.08},'m');
      if(full>0){g.save();g.globalAlpha=full;g.drawImage(img,r.x,r.y,r.w,r.h);g.restore();}}
    else g.drawImage(img,r.x,r.y,r.w,r.h);}
  // lines
  var out=1-sm(sg(p,T.out));
  var ga=sm(sg(p,[T.gold[0],T.gold[0]+.016]))*out*(1-.45*sm(sg(p,[.8,.84])));
  drawGold(g,P,sg(p,T.gold),ga,lw*1.5);
  drawX(g,P,sg(p,T.xdiag),ga,lw*1.5);
  var sa=sm(sg(p,[T.skel[0],T.skel[0]+.016]))*(1-sm(sg(p,T.skelFade)));
  drawSkel(g,P,sg(p,T.skel),sa,lw);
  // plumb line and head units
  var pl=sg(p,T.plumb);if(pl>0&&out>0)plumb(p,g,G,pl,out,lw,mob);
}

function plumb(p,g,G,pl,out,lw,mob){var x=G.crown[0],y0=G.crown[1],y1=G.heel[1],fall=Math.pow(pl,2),yb=lerp(y0,y1,fall);
  // a gentle settle after the bob lands
  if(pl>=1){var s=sg(p,[T.plumb[1],T.plumb[1]+.012]);yb=y1-Math.sin(s*Math.PI)*3*(1-s);}
  var pin=sm(pl/.4);g.save();g.globalAlpha=out*pin;g.strokeStyle='rgba('+GOLD+',.95)';g.lineWidth=lw*.9;g.beginPath();g.moveTo(x,y0-6);g.lineTo(x,yb);g.stroke();
  // crown mark
  g.globalAlpha=out*pin;g.beginPath();g.moveTo(x-7*pin,y0);g.lineTo(x+7*pin,y0);g.stroke();
  // the bob
  g.fillStyle='rgba('+GOLD+',1)';g.beginPath();var b=(mob?4:5.5)*(.4+.6*pin);g.moveTo(x,yb+b*1.6);g.lineTo(x-b*.8,yb);g.quadraticCurveTo(x,yb-b*1.4,x+b*.8,yb);g.closePath();g.fill();g.globalAlpha=out;
  // head units, struck one by one
  var unit=(y1-y0)/NT,tk=sg(p,T.ticks);
  for(var i=1;i<=NT;i++){var at=(i-1)/(NT-1),on=cl((tk-at)*(NT-1)*3+ (i===1&&tk>0?1:0));if(tk<at-1e-6&&!(i===1&&tk>0))continue;var yy=y0+unit*i,tkr=(p-T.ticks[0])/(T.ticks[1]-T.ticks[0]),flash=(i===NT?1:Math.max(0,1-(tk-at)*(NT-1)*1.2))*sm((tkr-at)*(NT-1)*5);
    if(i===NT)yy=y1;
    g.strokeStyle='rgba('+GOLD+',1)';g.lineWidth=lw*1.2;var hw=(mob?9:13)*(.6+.4*eo(on));g.beginPath();g.moveTo(x-hw,yy);g.lineTo(x+hw,yy);g.stroke();
    if(flash>0){g.fillStyle='rgba(255,236,190,'+(.55*flash)+')';g.beginPath();g.arc(x,yy,hw*1.3,0,Math.PI*2);g.fill();}
    }
  // caption
  var ca=sm(sg(p,T.cap));if(ca>0){g.globalAlpha=out*ca;g.fillStyle='rgba(44,38,32,.9)';g.font=(mob?12:14)+'px "Noto Serif SC","Songti SC",serif';g.textAlign='left';g.textBaseline='alphabetic';
    var tx=G.r.x+G.r.w+ (mob?6:18),ty=G.heel[1]-unit*.5;g.fillText('全身约 7 个头长',tx,ty);}
  g.restore();}
})();

;
/* 中世纪 · 天国没有影子 — the passage from the Doryphoros (antiquity) into Cimabue's Santa Trinita Maestà.
   Beats (seconds of D): the statue's shadow shrinks away, his modelling flattens to flat colour + outline, his feet leave the ground;
   the floor folds up against the wall and the title/label lose their shadows; square gold leaves are laid one by one ("嗒、嗒") until
   everything, the wall too, is gilded; the camera pushes into the gold, bumps a flat wall ("咚"), bounces, a bell rings; the church
   dims to candlelight around the gilded gable; then the figures enter by rank: throne, Madonna and Child, the angels stacked up both
   sides, last the four small prophets under the arches. Rest: the cursor is a candle; gold ground and haloes glint with its angle. */
(function(){
'use strict';
// rest guards (API.md "Rest hooks"): while a compare tool is on ('era' | 'special') nothing is painted over ctx.to.rect; while reading, nothing
// is left inside ctx.readRect (a right-hand column fades out over `fade` px just before the panel's edge). Idle, not reading: no-op (exact hand-over).
function rgBegin(ctx){var g=ctx.g,S=ctx.state,R=ctx.reading&&ctx.readRect,r=ctx.to&&ctx.to.rect,k=S.rgK||0,dt=Math.min(ctx.dt||0,.1);
  if(R)S.rgR={x:R.x,y:R.y,w:R.w,h:R.h};k+=((R?1:0)-k)*Math.min(1,dt*6);S.rgK=(!R&&k<.003)?0:(R&&k>.997)?1:k;
  g.save();if((ctx.tool==='era'||ctx.tool==='special')&&r){g.beginPath();g.rect(0,0,ctx.W,ctx.H);g.rect(r.x-1,r.y-1,r.w+2,r.h+2);g.clip('evenodd');}}
function rgEnd(ctx,fade,fill,fillA){var g=ctx.g,S=ctx.state,R=S.rgR;if(!(S.rgK>0)||!R){g.restore();return;}
  g.save();   // still inside rgBegin's compare clip: the fill never lands on the hung work either
  g.globalCompositeOperation='destination-out';g.globalAlpha=S.rgK;
  if(R.x>ctx.W*.3){var f=fade==null?60:fade,x0=R.x-f,gr=g.createLinearGradient(x0,0,R.x,0);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'#000');
    g.fillStyle=gr;g.fillRect(x0,0,ctx.W-x0+1,ctx.H);
    // optional flat fill, added ('lighter' on premultiplied pixels = an exact cross-fade): a room whose rest darkens the whole wall keeps that flat darkness under the panel
    if(fill&&fillA>0){g.globalCompositeOperation='lighter';g.globalAlpha=S.rgK*fillA;var fg=g.createLinearGradient(x0,0,R.x,0);fg.addColorStop(0,fill.replace('rgb(','rgba(').replace(')',',0)'));fg.addColorStop(1,fill);g.fillStyle=fg;g.fillRect(x0,0,ctx.W-x0+1,ctx.H);}}
  else{g.fillStyle='#000';g.fillRect(R.x,R.y,R.w,R.h);if(fill&&fillA>0){g.globalCompositeOperation='lighter';g.globalAlpha=S.rgK*fillA;g.fillStyle=fill;g.fillRect(R.x,R.y,R.w,R.h);}}
  g.restore();g.restore();}
// any pointer over the reading panel belongs to the text, not to the room
function rgInRead(ctx,x,y){var R=ctx.reading&&ctx.readRect;return !!R&&x>=R.x&&x<=R.x+R.w&&y>=R.y&&y<=R.y+R.h;}
var D=20, PW=1340, PH=2400;                       // main.webp (Cimabue) pixel size
var SH=window.EH_SHARED=window.EH_SHARED||{};
// timeline (seconds)
var T={shadow:[0.3,2.5], uiShadow:[0.3,2.5], flatA:[0.8,2.4], flatB:[2.0,3.6], lift:[2.3,3.8], uiFade:[2.8,3.9],
  flip:[3.4,5.0], leaf0:5.3, leafEnd:8.8, cover:[8.6,9.7], gfx:[9.55,9.9], push:[9.9,10.75], bump:10.75, bell:10.95, back:[11.35,12.9],
  dim:[11.3,13.2], panel:[11.6,13.0], throne:[12.9,15.6], madonna:[12.9,14.9], angels:[15.6,18.2], prophets:[18.0,19.4], final:[19.3,19.85]};
var FIG=null;                                      // statue bbox in the antiquity work's pixels (filled from META)
var METAS=[{w:810,h:2190,bbox:[26,66,783,2189]},{w:810,h:2192,bbox:[26,66,783,2189]},{w:1802,h:2400,bbox:[520,170,1310,2330]}];   // statue bbox per antiquity image (main_cut / main)
function statueMeta(ctx){var im=ctx.from.image,w=im.naturalWidth,h=im.naturalHeight;for(var i=0;i<METAS.length;i++)if(METAS[i].w===w&&METAS[i].h===h)return METAS[i];return{w:w||1,h:h||1,bbox:[0,0,w||1,h||1]};}
var LAYERS=[{"file":"cut/ground.webp","role":"ground","box":[0,0,1340,2400],"anchor":[670,1200],"t0":0,"dur":1},{"file":"cut/throne.webp","role":"throne","box":[0,0,1340,2400],"anchor":[670,2400],"t0":14.2,"dur":1.4},{"file":"cut/madonna.webp","id":"madonna","box":[342,86,994,1672],"side":0,"role":"madonna","anchor":[672,1672],"t0":12.9,"dur":2.0},{"file":"cut/l4.webp","id":"l4","box":[0,944,286,1883],"side":-1,"role":"angel","anchor":[102,1345],"t0":15.55,"dur":0.95},{"file":"cut/r4.webp","id":"r4","box":[1050,893,1340,1872],"side":1,"role":"angel","anchor":[1227,1318],"t0":15.65,"dur":0.95},{"file":"cut/l3.webp","id":"l3","box":[0,687,326,1078],"side":-1,"role":"angel","anchor":[148,854],"t0":16.17,"dur":0.95},{"file":"cut/r3.webp","id":"r3","box":[1000,633,1340,1085],"side":1,"role":"angel","anchor":[1184,821],"t0":16.27,"dur":0.95},{"file":"cut/l2.webp","id":"l2","box":[0,388,324,792],"side":-1,"role":"angel","anchor":[154,569],"t0":16.79,"dur":0.95},{"file":"cut/r2.webp","id":"r2","box":[1009,373,1340,709],"side":1,"role":"angel","anchor":[1204,536],"t0":16.89,"dur":0.95},{"file":"cut/l1.webp","id":"l1","box":[40,299,455,575],"side":-1,"role":"angel","anchor":[300,412],"t0":17.41,"dur":0.95},{"file":"cut/r1.webp","id":"r1","box":[901,268,1288,661],"side":1,"role":"angel","anchor":[1040,412],"t0":17.51,"dur":0.95},{"file":"cut/jeremiah.webp","id":"jeremiah","box":[91,2038,294,2400],"side":0,"role":"prophet","anchor":[193,2400],"t0":18.0,"dur":0.75},{"file":"cut/abraham.webp","id":"abraham","box":[400,1988,694,2400],"side":0,"role":"prophet","anchor":[544,2400],"t0":18.3,"dur":0.75},{"file":"cut/david.webp","id":"david","box":[685,1983,946,2400],"side":0,"role":"prophet","anchor":[818,2400],"t0":18.6,"dur":0.75},{"file":"cut/isaiah.webp","id":"isaiah","box":[1042,2021,1259,2400],"side":0,"role":"prophet","anchor":[1152,2400],"t0":18.9,"dur":0.75}];   // from rooms/medieval/cut/layers.json (painting px) + entrance times (s)

function cv(w,h){var c=document.createElement('canvas');c.width=Math.max(1,Math.round(w));c.height=Math.max(1,Math.round(h));return c;}
function rgb(hex){var h=hex.replace('#','');if(h.length===3)h=h.split('').map(function(c){return c+c;}).join('');var n=parseInt(h,16);return[(n>>16)&255,(n>>8)&255,n&255];}
function rgba(hex,a){var c=rgb(hex);return 'rgba('+c[0]+','+c[1]+','+c[2]+','+a+')';}
function mixHex(a,b,t){var x=rgb(a),y=rgb(b);return 'rgb('+x.map(function(v,i){return Math.round(v+(y[i]-v)*t);}).join(',')+')';}

// ------------------------------------------------------------------ DOM touches (title/label shadows, candle cursor) with a watchdog
var dirty=[],watching=false,myIdx=-1;
function setCss(el,prop,val){if(!el)return;if(el.style[prop]!==val)el.style[prop]=val;if(val&&dirty.indexOf(el)<0){dirty.push(el);watch();}}
function clean(){dirty.forEach(function(el){['textShadow','opacity','transition','cursor'].forEach(function(p){el.style[p]='';});});dirty=[];}
function watch(){if(watching)return;watching=true;(function loop(){var st=window.EH&&EH.debug&&EH.debug.state;
  if(!dirty.length){watching=false;return;}
  if(!st||st.idx!==myIdx||(st.phase!=='enter'&&st.phase!=='rest')){clean();watching=false;return;}
  requestAnimationFrame(loop);})();}

// ------------------------------------------------------------------ fallback for the antiquity floor (until js/t-antiquity.js provides it)
function fallbackFloor(g,o){var r=o.rect,W=o.W,H=o.H,yj=r.y+r.h*0.80,a=o.alpha==null?1:o.alpha;
  g.save();g.globalAlpha*=a;
  var gr=g.createLinearGradient(0,yj,0,H);gr.addColorStop(0,'#dcd3c2');gr.addColorStop(1,'#cbbfaa');g.fillStyle=gr;g.fillRect(0,yj,W,H-yj);
  var gl=g.createLinearGradient(0,yj-2,0,yj+10);gl.addColorStop(0,'rgba(120,100,70,0)');gl.addColorStop(.3,'rgba(120,100,70,.18)');gl.addColorStop(1,'rgba(120,100,70,0)');g.fillStyle=gl;g.fillRect(0,yj-2,W,12);
  if(o.shadow>0&&o.sil){var fy=r.y+r.h*0.955,fx=r.x+r.w*0.52,s=o.shadow;
    g.save();g.globalAlpha*=0.30*Math.min(1,s*1.5);g.translate(fx,fy);g.transform(1,0,0.9*s,-0.30*s,0,0);g.drawImage(o.sil,-(fx-r.x),-(fy-r.y),r.w,r.h);g.restore();}
  g.restore();return yj;}
function floorFn(){return SH.antiquityFloor||null;}
// replica of the DOM's .wash (index.html): radial-gradient(ellipse 70% 60% at the work's centre, light, transparent 70%) under the frame
function wash(g,W,H,rect,ink,k){if(k!=null&&k<=0)return;var dark=ink==='dark',c=dark?'255,255,255':'255,244,225',a=(dark?.35:.08)*(k==null?1:k);
  var sx=+((rect.x+rect.w/2)/W*100).toFixed(1)/100*W,sy=+((rect.y+rect.h/2)/H*100).toFixed(1)/100*H,rx=.7*W,ry=.6*H;
  g.save();g.translate(sx,sy);g.scale(rx,ry);var gr=g.createRadialGradient(0,0,0,0,0,1);gr.addColorStop(0,'rgba('+c+','+a+')');gr.addColorStop(.7,'rgba('+c+',0)');gr.addColorStop(1,'rgba('+c+',0)');
  g.fillStyle=gr;g.fillRect(-sx/rx,-sy/ry,W/rx,H/ry);g.restore();}

// ------------------------------------------------------------------ gold leaves
var ATL={cell:320,leaf:288,pad:16,cols:4,rows:2};
function leafPlan(ctx){var S=ctx.state,W=ctx.W,H=ctx.H,key=W+'x'+H;if(S.leafKey===key)return S.leaves;
  var R1=ctx.to.rect,R0=ctx.from?ctx.from.rect:R1,L=Math.max(58,Math.min(124,Math.min(W,H)/7.2));
  var sx=R1.x+R1.w/2,sy=R1.y+R1.h*0.17,rnd=ctx.u.rng(1290);
  var i0=Math.floor(-(sx+L)/L),i1=Math.ceil((W-sx+L)/L),j0=Math.floor(-(sy+L)/L),j1=Math.ceil((H-sy+L)/L);
  // the statue's silhouette box on screen: leaves over it are laid last, feet first, head last
  var M=statueMeta(ctx),fb=M.bbox,fw=M.w,fh=M.h,box={x0:R0.x+fb[0]/fw*R0.w+L*0.25,x1:R0.x+fb[2]/fw*R0.w-L*0.25,y0:R0.y+fb[1]/fh*R0.h-R0.h*0.02,y1:R0.y+fb[3]/fh*R0.h};
  var early=[],late=[];
  for(var j=j0;j<=j1;j++)for(var i=i0;i<=i1;i++){var cx=sx+i*L+(rnd()-.5)*L*0.08,cy=sy+j*L+(rnd()-.5)*L*0.08;
    var lf={x:cx,y:cy,s:L*(1.07+rnd()*0.05),r:(rnd()-.5)*0.035,v:Math.floor(rnd()*8),pr:Math.hypot(i*1.05,j)+rnd()*0.5,flash:0.6+rnd()*0.4};
    var over=cx+lf.s/2>box.x0&&cx-lf.s/2<box.x1&&cy+lf.s/2>box.y0&&cy-lf.s/2<box.y1&&Math.abs(cx-(box.x0+box.x1)/2)<(box.x1-box.x0)/2&&cy>box.y0-L*0.3;
    early.push(lf);if(over)late.push({x:cx,y:cy,s:lf.s,r:lf.r*0.6,v:(lf.v+3)%8,pr:0,flash:lf.flash});}   // every cell is gilded behind him first; the cells over him get a second sheet on top
  early.sort(function(a,b){return a.pr-b.pr;});late.sort(function(a,b){return b.y-a.y||Math.abs(a.x-sx)-Math.abs(b.x-sx);});
  // landing times: the first sheets slowly, one by one, then faster and faster
  var hand=[0,0.5,0.95,1.33,1.66,1.93,2.16],n=early.length;
  early.forEach(function(lf,k){lf.t=k<hand.length?T.leaf0+hand[k]:T.leaf0+hand[hand.length-1]+(T.leafEnd-T.leaf0-hand[hand.length-1])*Math.pow((k-hand.length+1)/(n-hand.length),0.78);lf.late=false;});
  late.forEach(function(lf,k){lf.t=T.cover[0]+(T.cover[1]-T.cover[0]-0.25)*(late.length>1?k/(late.length-1):0);lf.late=true;});
  S.leafKey=key;S.leaves=early.concat(late);S.nEarly=n;S.leafL=L;S.goldField=null;return S.leaves;}
function drawLeaf(g,atlas,lf,k,dropT){ // k: 0..1 landing progress (1 = laid)
  var c=ATL.cell,sx=(lf.v%ATL.cols)*c,sy=Math.floor(lf.v/ATL.cols)*c,e=1-Math.pow(1-k,3),sc=lf.s*(1+(1-e)*0.22)*c/ATL.leaf;
  g.save();g.translate(lf.x+(1-e)*lf.s*0.05,lf.y-(1-e)*lf.s*0.10);g.rotate(lf.r+(1-e)*0.10);
  var ka=Math.min(1,k/0.4);g.globalAlpha=ka*ka*(3-2*ka);g.drawImage(atlas,sx,sy,c,c,-sc/2,-sc/2,sc,sc);
  if(dropT!=null&&dropT>0){g.globalCompositeOperation='screen';g.globalAlpha=0.32*lf.flash*dropT;g.drawImage(atlas,sx,sy,c,c,-sc/2,-sc/2,sc,sc);}
  g.restore();}
function leafState(lf,t){var d=0.30,fa=0.05;if(t<lf.t-d)return null;return{k:Math.min(1,(t-(lf.t-d))/d),flash:t>=lf.t?Math.max(0,1-(t-lf.t)/0.45):t>lf.t-fa?(t-(lf.t-fa))/fa:0};}
function lightGold(g,W,H,cx,cy){ // broad light on the gilding (only where leaves are): warm sheen at the top, darker toward the edges
  g.save();g.globalCompositeOperation='source-atop';var R=Math.hypot(W,H),hl=g.createRadialGradient(cx,cy-H*0.1,0,cx,cy-H*0.1,R*0.55);
  hl.addColorStop(0,'rgba(255,236,170,.22)');hl.addColorStop(.5,'rgba(255,225,150,.06)');hl.addColorStop(1,'rgba(255,225,150,0)');g.fillStyle=hl;g.fillRect(0,0,W,H);
  var dk=g.createRadialGradient(cx,cy,R*0.18,cx,cy,R*0.75);dk.addColorStop(0,'rgba(70,40,10,0)');dk.addColorStop(1,'rgba(70,40,10,.30)');g.fillStyle=dk;g.fillRect(0,0,W,H);g.restore();}
function leafLayer(ctx){var S=ctx.state,W=ctx.W,H=ctx.H,q=Math.min(ctx.dpr,2);if(!S.lc||S.lc.width!==Math.round(W*q)||S.lc.height!==Math.round(H*q))S.lc=cv(W*q,H*q);
  var g=S.lc.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,S.lc.width,S.lc.height);g.setTransform(q,0,0,q,0,0);return g;}
function drawLeaves(g,ctx,from,to,t){var S=ctx.state,L=S.leaves,lg=null,any=false;
  for(var i=from;i<to;i++){var ls=leafState(L[i],t);if(!ls)continue;if(!lg)lg=leafLayer(ctx);drawLeaf(lg,S.atlas,L[i],ls.k,ls.flash);any=true;}
  if(!any)return;var R1=ctx.to.rect;lightGold(lg,ctx.W,ctx.H,R1.x+R1.w/2,R1.y+R1.h*0.3);g.drawImage(S.lc,0,0,ctx.W,ctx.H);}
function goldField(ctx){var S=ctx.state;leafPlan(ctx);if(S.goldField)return S.goldField;
  var W=ctx.W,H=ctx.H,q=Math.min(ctx.dpr*1.25,2.5),c=cv(W*q,H*q),g=c.getContext('2d');g.setTransform(q,0,0,q,0,0);
  g.fillStyle='#a47a36';g.fillRect(0,0,W,H);S.leaves.forEach(function(lf){drawLeaf(g,S.atlas,lf,1,null);});var R1=ctx.to.rect;lightGold(g,W,H,R1.x+R1.w/2,R1.y+R1.h*0.3);
  S.goldField=c;return c;}

// ------------------------------------------------------------------ the statue (photo → poster → flat), cached per image
function statueImg(ctx){var S=ctx.state;if(S.fromImg)return S.fromImg;var f=ctx.from,im=f.image;
  if(f.frame==='fade'){var w=im.naturalWidth,h=im.naturalHeight,c=cv(w,h),g=c.getContext('2d');g.drawImage(im,0,0);
    var m=g.createRadialGradient(0,0,0,0,0,1);m.addColorStop(0,'#000');m.addColorStop(.62,'#000');m.addColorStop(1,'rgba(0,0,0,0)');
    g.globalCompositeOperation='destination-in';g.save();g.translate(w/2,h/2);g.scale(w*0.58,h*0.60);g.fillStyle=m;g.fillRect(-1/0.58,-1/0.60,2/0.58,2/0.60);g.restore();S.fromImg=c;}
  else S.fromImg=im;return S.fromImg;}

// ------------------------------------------------------------------ floor capture + fold
function floorCap(ctx){var S=ctx.state,W=ctx.W,H=ctx.H,R0=ctx.from.rect,key=W+'x'+H+'@'+R0.x+','+R0.y+','+R0.w;if(S.floorKey===key)return S.floor;
  var ow=Math.ceil(W*1.8),off=(ow-W)/2,q=Math.min(ctx.dpr,2),c=cv(ow*q,H*q),g=c.getContext('2d');g.setTransform(q,0,0,q,0,0);
  var wall=ctx.from.wall;g.fillStyle=wall;g.fillRect(0,0,ow,H);var rr={x:R0.x+off,y:R0.y,w:R0.w,h:R0.h},yj=null,fn=floorFn();
  if(fn){try{fn(g,{W:ow,H:H,rect:rr,shadow:0,alpha:1});}catch(e){console.error(e);}
    // find where the floor starts: first row (below the statue's waist) that differs from the wall colour
    try{var col=g.getImageData(Math.round(ow*q*0.12),0,1,Math.round(H*q)).data,wc=rgb(wall);
      for(var y=Math.round((R0.y+R0.h*0.5)*q);y<H*q;y++){var o=y*4;if(Math.abs(col[o]-wc[0])+Math.abs(col[o+1]-wc[1])+Math.abs(col[o+2]-wc[2])>9){yj=y/q;break;}}}catch(e){}
    if(yj==null)yj=R0.y+R0.h*0.8;}
  else yj=fallbackFloor(g,{W:ow,H:H,rect:rr,shadow:0,alpha:1});
  S.floorKey=key;S.floor={c:c,q:q,off:off,yj:yj,ow:ow};return S.floor;}
function drawFloorFold(g,ctx,th){var F=floorCap(ctx),W=ctx.W,H=ctx.H,R0=ctx.from.rect,yj=F.yj;if(yj>=H-1)return;
  var yh=Math.min(yj-40,R0.y+R0.h*0.12),hc=yj-yh,f=Math.max(900,W*1.05),xv=R0.x+R0.w/2,ct=Math.cos(th),st=Math.sin(th);
  var step=1.5,y0,d,d2,ya,yb,s,s0;
  // wall behind the band first: the floor area becomes wall as the floor lifts away
  for(y0=yj;y0<H;y0+=step){d=f-f*hc/(y0-yh);d2=f-f*hc/(Math.min(H,y0+step)-yh);
    ya=yh+f*(hc-d*st)/(f-d*ct);yb=yh+f*(hc-d2*st)/(f-d2*ct);s0=f/(f-d);s=f/(f-d*ct);var k=s/s0;
    var top=Math.min(ya,yb),hgt=Math.abs(yb-ya)+0.75;
    g.drawImage(F.c,0,y0*F.q,F.ow*F.q,step*F.q,xv+(-F.off-xv)*k,top,F.ow*k,hgt);}}

// ------------------------------------------------------------------ the painting's layers
function P(ctx,x,y){var r=ctx.to.rect;return[r.x+x/PW*r.w,r.y+y/PH*r.h];}
function drawLayer(g,ctx,L,a,dx,dy,sc){if(a<=0)return;var im=ctx.asset(L.file);if(!im||!im.naturalWidth)return;var r=ctx.to.rect,k=r.w/PW,b=L.box;
  var x=r.x+b[0]*k,y=r.y+b[1]*k,w=(b[2]-b[0])*k,h=(b[3]-b[1])*k;
  g.save();g.globalAlpha=Math.min(1,a);if(sc&&sc!==1){var ax=r.x+L.anchor[0]*k,ay=r.y+L.anchor[1]*k;g.translate(ax,ay);g.scale(sc,sc);g.translate(-ax,-ay);}
  g.drawImage(im,x+(dx||0),y+(dy||0),w,h);g.restore();}

// ------------------------------------------------------------------ candle + glint (rest; shared for the next room)
function drawCandle(g,x,y,t,a){if(a<=0)return;var fl=1+0.05*Math.sin(t*9.1)+0.035*Math.sin(t*15.7+1.3),sw=1.3*Math.sin(t*3.3)+0.7*Math.sin(t*7.9);
  g.save();g.globalAlpha=a;
  var glow=g.createRadialGradient(x,y-10,0,x,y-10,150);glow.addColorStop(0,'rgba(255,190,110,.22)');glow.addColorStop(.35,'rgba(255,160,80,.08)');glow.addColorStop(1,'rgba(255,150,70,0)');
  g.globalCompositeOperation='lighter';g.fillStyle=glow;g.fillRect(x-150,y-160,300,300);g.globalCompositeOperation='source-over';
  var bw=9,bt=y+5,bh=34,body=g.createLinearGradient(x-bw/2,0,x+bw/2,0);body.addColorStop(0,'#cdbb98');body.addColorStop(.45,'#f3e8d2');body.addColorStop(1,'#bba886');
  g.fillStyle=body;g.beginPath();g.moveTo(x-bw/2,bt+2);g.quadraticCurveTo(x,bt-1.5,x+bw/2,bt+2);g.lineTo(x+bw/2,bt+bh);g.lineTo(x-bw/2,bt+bh);g.closePath();g.fill();
  var fade=g.createLinearGradient(0,bt+bh*0.4,0,bt+bh);fade.addColorStop(0,'rgba(0,0,0,0)');fade.addColorStop(1,'rgba(0,0,0,.35)');g.fillStyle=fade;g.fillRect(x-bw/2,bt,bw,bh);
  g.strokeStyle='rgba(40,25,15,.9)';g.lineWidth=1.1;g.beginPath();g.moveTo(x,bt+0.5);g.lineTo(x+0.3,y-1.5);g.stroke();
  var h=21*fl,tx=x+sw;g.save();g.translate(x,y);
  var fg=g.createRadialGradient(0,-h*0.32,0,0,-h*0.32,h*0.62);fg.addColorStop(0,'rgba(255,252,236,1)');fg.addColorStop(.35,'rgba(255,214,120,.98)');fg.addColorStop(.75,'rgba(245,130,40,.85)');fg.addColorStop(1,'rgba(220,90,20,0)');
  g.fillStyle=fg;g.beginPath();g.moveTo(0,1);g.bezierCurveTo(-6.2,-1,-5.2,-h*0.5,tx-x,-h);g.bezierCurveTo(5.2,-h*0.5,6.2,-1,0,1);g.fill();
  g.fillStyle='rgba(90,120,255,.35)';g.beginPath();g.ellipse(0,-1.5,2.2,2.8,0,0,Math.PI*2);g.fill();g.restore();
  g.restore();}
SH.medievalCandle=drawCandle;
function glintLayer(ctx,rect,gx,gy,a){var S=ctx.state,m=S.glintMask;if(!m||!m.naturalWidth||a<=0)return;
  var q=Math.min(ctx.dpr,1.5),w=Math.min(Math.round(rect.w*q),1100),h=Math.round(w*rect.h/rect.w);
  if(!S.gl||S.gl.width!==w||S.gl.height!==h)S.gl=cv(w,h);var c=S.gl,gg=c.getContext('2d'),kx=w/rect.w,ky=h/rect.h;
  gg.setTransform(1,0,0,1,0,0);gg.globalCompositeOperation='source-over';gg.clearRect(0,0,w,h);
  var px=(gx-rect.x)*kx,py=(gy-rect.y)*ky,R=rect.w*0.55*kx,gr=gg.createRadialGradient(px,py,0,px,py,R);
  gr.addColorStop(0,'rgba(255,238,196,1)');gr.addColorStop(.18,'rgba(255,220,150,.75)');gr.addColorStop(.5,'rgba(255,196,110,.25)');gr.addColorStop(1,'rgba(255,190,100,0)');
  gg.fillStyle=gr;gg.fillRect(0,0,w,h);gg.globalCompositeOperation='destination-in';gg.drawImage(m,0,0,w,h);
  var g=ctx.g;g.save();g.globalCompositeOperation='screen';g.globalAlpha=a;g.drawImage(c,rect.x,rect.y,rect.w,rect.h);g.restore();}

// ------------------------------------------------------------------ warm-up: build the caches and decode every image at the scale it is drawn
// (GPU decode caches are per scale; a first drawImage of a 1340×2400 webp mid-transition cost 100–340 ms)
function prewarm(ctx){var S=ctx.state,W=ctx.W,H=ctx.H,q=Math.min(ctx.dpr||1,2),R1=ctx.to.rect,F=ctx.from;
  try{leafPlan(ctx);goldField(ctx);var lg=leafLayer(ctx);if(S.leaves.length)drawLeaf(lg,S.atlas,S.leaves[0],1,1);
    if(F){statueImg(ctx);floorCap(ctx);}
    var c=cv(W*q,H*q),g=c.getContext('2d');g.setTransform(q,0,0,q,0,0);
    if(ctx.to.image&&ctx.to.image.naturalWidth)g.drawImage(ctx.to.image,R1.x,R1.y,R1.w,R1.h);
    S.layers.forEach(function(L){drawLayer(g,ctx,L,1);drawLayer(g,ctx,L,1,0,0,1.07);});
    if(F){var R0=F.rect;[statueImg(ctx),S.poster,S.flat,S.sil].forEach(function(im){if(im&&(im.naturalWidth||im.width))g.drawImage(im,R0.x,R0.y,R0.w,R0.h);});}
    if(S.glintMask&&S.glintMask.naturalWidth)g.drawImage(S.glintMask,R1.x,R1.y,R1.w,R1.h);
    g.drawImage(S.goldField,0,0,W,H);g.drawImage(S.lc,0,0,W,H);if(F)g.drawImage(S.floor.c,0,0,W,H);
    g.getImageData(0,0,1,1);lg.getImageData(0,0,1,1);   // flush: the decodes/uploads happen now, not on first use
  }catch(e){console.error(e);}}

// ================================================================== the module
EH.transition('medieval',{
  duration:D,
  assets:['t_leaves.webp','t_poster.webp','t_flat.webp','t_sil.webp','t_glint.webp'].concat(LAYERS_FILES()),
  init:function(ctx){var S=ctx.state,u=ctx.u;myIdx=ctx.to.idx;S.atlas=ctx.asset('t_leaves.webp');S.poster=ctx.asset('t_poster.webp');S.flat=ctx.asset('t_flat.webp');
    S.sil=ctx.asset('t_sil.webp');S.glintMask=ctx.asset('t_glint.webp');S.layers=LAYERS;
    // gable path of the panel (painting px), for the gilded panel field
    S.gable=[[0,408],[669,0],[1340,405],[1340,2400],[0,2400]];prewarm(ctx);},
  draw:function(p,ctx){var g=ctx.g,u=ctx.u,S=ctx.state,W=ctx.W,H=ctx.H,t=p*D,R1=ctx.to.rect,F=ctx.from,seg=function(a){return u.seg(t,a[0],a[1]);};
    if(p>=1){g.fillStyle=ctx.to.wall;g.fillRect(0,0,W,H);wash(g,W,H,R1,ctx.to.ink);g.drawImage(ctx.to.image,R1.x,R1.y,R1.w,R1.h);domFrom(ctx,D);return;}
    domFrom(ctx,t);cues(ctx,leafPlan(ctx));
    // ---------------- A/B: the antique room loses its depth
    if(t<T.gfx[1]&&F){var R0=F.rect,sh=1-u.ease(seg(T.shadow)),lift=u.eio(seg(T.lift)),th=Math.PI/2*foldCurve(seg(T.flip)),bounce=0;
      var fu=t-T.flip[1];if(fu>0&&fu<0.5)bounce=0.05*Math.exp(-fu*9)*Math.sin(fu*22);
      g.fillStyle=F.wall;g.fillRect(0,0,W,H);wash(g,W,H,R0,F.ink,1-u.ease(seg(T.flip)));
      if(t<T.flip[0]){var fn=floorFn();if(fn){try{fn(g,{W:W,H:H,rect:R0,shadow:sh,alpha:1});}catch(e){console.error(e);}}else fallbackFloor(g,{W:W,H:H,rect:R0,shadow:sh,alpha:1,sil:S.sil});}
      else{var fm=1-u.ease(u.seg(t,T.flip[1]+0.15,T.flip[1]+1.3));if(fm>0){g.save();g.globalAlpha=fm;drawFloorFold(g,ctx,Math.max(0,th-bounce));g.restore();}}
      // leaves laid behind the statue (the wall is gilded first)
      var early=leafPlan(ctx),i,ls;
      if(t>=T.leaf0-0.35)drawLeaves(g,ctx,0,S.nEarly,t);
      // the statue: photo → poster → flat, feet leave the ground
      var fim=statueImg(ctx),okF=S.flat.naturalWidth>0&&Math.abs(S.flat.naturalWidth/S.flat.naturalHeight-ctx.from.image.naturalWidth/ctx.from.image.naturalHeight)<0.01,dy=-lift*R0.h*0.022,a1=okF?u.ease(seg(T.flatA)):0,a2=okF?u.ease(seg(T.flatB)):0,coverA=1-u.ease(u.seg(t,T.cover[1]-0.35,T.cover[1]+0.1));
      g.save();g.globalAlpha=coverA;
      if(a2<1){g.drawImage(fim,R0.x,R0.y+dy,R0.w,R0.h);}
      if(a1>0&&a2<1){g.globalAlpha=coverA*a1;g.drawImage(S.poster,R0.x,R0.y+dy,R0.w,R0.h);}
      if(a2>0){g.globalAlpha=coverA*a2;g.drawImage(S.flat,R0.x,R0.y+dy,R0.w,R0.h);}
      g.restore();
      // the last sheets cover him, feet first
      if(t>=T.cover[0]-0.35)drawLeaves(g,ctx,S.nEarly,early.length,t);
      if(t<T.gfx[0])return;}
    // ---------------- D: push into the gold, bump the flat wall, bounce; E: the church dims around the gilded gable
    var GF=goldField(ctx),z=camZoom(t),ox=0,oy=0,bu=t-T.bump;if(bu>0&&bu<0.9){ox=2.2*Math.exp(-bu*6)*Math.sin(bu*26);oy=1.4*Math.exp(-bu*6)*Math.sin(bu*21+1);}
    var cx=R1.x+R1.w/2,cy=R1.y+R1.h*0.30;
    g.save();g.translate(cx+ox,cy+oy);g.scale(z,z);g.translate(-cx,-cy);
    var xf=F?u.ease(seg(T.gfx)):1;if(xf<1){g.globalAlpha=xf;g.drawImage(GF,0,0,W,H);g.globalAlpha=1;}else g.drawImage(GF,0,0,W,H);
    // the bump makes the gold ring: a soft bright ring spreads from the point of impact
    // the bump: the gold answers with one soft, even glow (no ring), fading with the bell
    if(bu>0&&bu<1.4){var gA=0.16*Math.exp(-bu*3.2)*Math.min(1,bu*14);g.globalCompositeOperation='screen';g.fillStyle='rgba(255,232,170,'+gA.toFixed(3)+')';g.fillRect(-W,-H,W*3,H*3);g.globalCompositeOperation='source-over';}
    var dm=u.ease(seg(T.dim));
    if(dm>0){var far=Math.hypot(W,H),wc=ctx.to.wall;
      // the lights go down: the edges first, then everything but the panel (no iris edge)
      var eg=g.createRadialGradient(cx,cy,far*0.15,cx,cy,far*0.8);eg.addColorStop(0,rgba(wc,0));eg.addColorStop(1,rgba(wc,Math.min(1,dm*2.2)));g.fillStyle=eg;g.fillRect(-W,-H,W*3,H*3);
      g.fillStyle=rgba(wc,u.ease(dm));g.fillRect(-W,-H,W*3,H*3);
      if(dm>=0.999){g.fillStyle=wc;g.fillRect(-W,-H,W*3,H*3);}
      wash(g,W,H,R1,ctx.to.ink,dm);
      // the gilded gable panel stays lit; its leaves turn into Cimabue's own tooled gold
      panel(g,ctx,GF,u.ease(seg(T.panel)),dm);}
    g.restore();
    if(t<T.throne[0])return;
    // ---------------- F: the figures by rank
    ranks(g,ctx,t);
  },
  done:function(ctx){clean();ctx.state.restT0=performance.now();},
  rest:function(ctx){rgBegin(ctx);try{restBody(ctx);}finally{rgEnd(ctx);}}
});
function restBody(ctx){var S=ctx.state,g=ctx.g,now=performance.now()/1000,st=EH.debug&&EH.debug.state,r=ctx.to.rect;myIdx=ctx.to.idx;
    if(S.restT0==null)S.restT0=performance.now();var fin=ctx.u.clamp((performance.now()-S.restT0)/1600);fin=fin*fin*(3-2*fin);
    var pt=ctx.pointer,live=pt.active&&performance.now()-pt.moved<6000&&!(st&&st.reading)&&!ctx.tool&&!rgInRead(ctx,pt.x,pt.y);
    // virtual candle when nobody moves one: slowly carried along the foot of the panel
    var vx=r.x+r.w*(0.5+0.42*Math.sin(now*0.23)),vy=r.y+r.h*(0.78+0.1*Math.sin(now*0.31+1));
    S.cx=S.cx==null?vx:S.cx;S.cy=S.cy==null?vy:S.cy;var tx=live?pt.x:vx,ty=live?pt.y:vy,k=Math.min(1,(ctx.dt||0.016)*6);S.cx+=(tx-S.cx)*k;S.cy+=(ty-S.cy)*k;
    S.live=(S.live||0)+((live?1:0)-(S.live||0))*Math.min(1,(ctx.dt||0.016)*4);
    var ex=r.x+r.w/2,ey=r.y+r.h*0.45,gx=(S.cx+ex)/2,gy=(S.cy+ey)/2,fl=0.86+0.08*Math.sin(now*8.3)+0.05*Math.sin(now*13.1+2)+0.03*Math.sin(now*21.7);
    glintLayer(ctx,r,gx,gy,fin*fl*(0.40+0.25*S.live));
    drawCandle(g,S.cx,S.cy,now,fin*S.live);
    var room=document.getElementById('room'),cw=document.getElementById('cw'),hide=S.live>0.5?'none':'';setCss(room,'cursor',hide);setCss(cw,'cursor',hide);}

// ------------------------------------------------------------------ helpers that need the timeline
function foldCurve(x){return x<=0?0:x>=1?1:x*x*(1.6-0.6*x);}                // accelerates, lands flat against the wall
function camZoom(t){var u=EH.util,a=u.seg(t,T.push[0],T.push[1]),z=1+0.17*u.ei(a),b=t-T.bump;
  if(b>0){var rec=0.075*(1-Math.exp(-b*7))-0.02*Math.exp(-b*5)*Math.sin(b*14)*(b<1.5?1:0);z=1.17-rec;
    var back=u.eio(u.seg(t,T.back[0],T.back[1]));z=u.lerp(z,1,back);}
  return z;}
function domFrom(ctx,t){if(!ctx.from)return;var u=ctx.u,fi=ctx.from.idx,era=document.getElementById('era'+fi),lab=document.getElementById('lab'+fi);
  var vis=1-u.ease(u.seg(t,T.uiFade[0],T.uiFade[1])),sh=1-u.ease(u.seg(t,T.uiShadow[0],T.uiShadow[1])),inS=u.ease(u.seg(t,0,0.25));
  var s=sh*inS,ts=s>0.002?(4*s).toFixed(2)+'px '+(6*s).toFixed(2)+'px '+(9*s).toFixed(2)+'px rgba(70,52,30,'+(0.30*s).toFixed(3)+')':'';
  [era,lab].forEach(function(el){if(!el)return;if(el===lab&&!el.style.left){return;}
    if(vis>0.001){el.classList.add('on');setCss(el,'transition','none');setCss(el,'opacity',vis.toFixed(3));setCss(el,'textShadow',ts||'0 0 0 transparent');}
    else{el.classList.remove('on');el.style.opacity='';el.style.textShadow='';el.style.transition='';}});}
function cues(ctx,leaves){var s=ctx.sfx,S=ctx.state;   // floor, leaves, bump, bell, church, figure entrances: audio/cues/medieval.json
  ctx.cue(T.shadow[0]/D,function(){s.whoosh(.05,2.2);});
  S.layers.forEach(function(Ly){if(Ly.role!=='throne')return;ctx.cue((Ly.t0+Ly.dur*0.5)/D,function(){s.thud(.10);});});}
function panel(g,ctx,GF,k,dm){var S=ctx.state,r=ctx.to.rect,W=ctx.W,H=ctx.H;
  // clip to the gable, draw the gilded field, then the painting's own gold ground on top as k rises
  g.save();g.beginPath();S.gable.forEach(function(pt,i){var q=P(ctx,pt[0],pt[1]);if(i)g.lineTo(q[0],q[1]);else g.moveTo(q[0],q[1]);});g.closePath();g.clip();
  g.globalAlpha=Math.min(1,dm*1.5);g.drawImage(GF,0,0,W,H);g.globalAlpha=1;
  var ground=groundLayer(ctx);if(ground&&k>0){g.globalAlpha=k;drawLayer(g,ctx,ground,k);}
  g.restore();}
function groundLayer(ctx){var L=ctx.state.layers;for(var i=0;i<L.length;i++)if(L[i].role==='ground')return L[i];return null;}
function ranks(g,ctx,t){var u=ctx.u,L=ctx.state.layers,R1=ctx.to.rect;
  g.save();g.beginPath();ctx.state.gable.forEach(function(pt,i){var q=P(ctx,pt[0],pt[1]);if(i)g.lineTo(q[0],q[1]);else g.moveTo(q[0],q[1]);});g.closePath();g.clip();   // everything happens inside the panel
  L.forEach(function(Ly){if(Ly.role==='ground')return;var a=u.seg(t,Ly.t0,Ly.t0+Ly.dur);if(a<=0)return;
    var e=u.eo(a),s=u.eio(a),dx=0,dy=0,sc=1,al=u.ease(Math.min(1,a*1.8));
    if(Ly.role==='throne'){dy=(1-e)*R1.h*0.02;}
    else if(Ly.role==='madonna'){dy=-(1-s)*R1.h*0.07;sc=1+(1-s)*0.07;al=u.ease(Math.min(1,a*3.2));}     // the largest figure comes down and sits
    else if(Ly.role==='angel'){dx=(Ly.side<0?-1:1)*(1-e)*R1.w*0.045;dy=-(1-s)*R1.h*0.028;al=u.ease(Math.min(1,a*3.5));}  // stacked pair by pair, bottom up
    else if(Ly.role==='prophet'){dy=(1-e)*R1.h*0.016;sc=0.92+0.08*e;}                                    // the smallest, last, in the arches
    drawLayer(g,ctx,Ly,al,dx,dy,sc);});
  g.restore();
  // hand-over: cross-fade to (wall + the whole painting) so the gable edge is exactly the DOM's
  var fa=u.ease(u.seg(t,T.final[0],T.final[1]));if(fa>0){
    g.save();g.globalAlpha=fa;g.drawImage(ctx.to.image,R1.x,R1.y,R1.w,R1.h);g.restore();}}
function LAYERS_FILES(){return LAYERS.map(function(l){return l.file;});}
})();

;
/* 文艺复兴 · 差一指的距离 — the passage from the Maestà (medieval) into the Creation of Adam.
   Beats (seconds of D): the votive candles go out one by one · a seam of light cracks the gold panel down the middle and the two
   gilt halves slide off-screen · the seam of light shrinks to a point, perspective lines shoot from the four edges to it ·
   Adam on his hillside slides in from the left along a line, God with the angels flies in from the right, both in medieval
   proportion (God big, Adam small) and equalising as they come · close-up, the fingers stop one finger-width apart with the last
   sliver of the gold light between them · ~1 s of stillness · the lines go out, the camera pulls back and the fresco is laid
   giornata by giornata (each seam flashes and fades), the hands last · the painted architecture joins at the corners and the
   painted cornice closes around the panel · hand-over.
   Layers: t_adam / t_god = the prototype cut-outs (3000 px, same photograph as main.webp); t_hA / t_hG = the hands re-cut from
   a sharper photograph (adam/detail.jpg), registered onto main.webp by SIFT+RANSAC (affine HAND.A) and colour-matched to it.
   Giornate: approximate patches in main.webp pixels (rooms/renaissance/giornate.json; the copy below is generated from it). */
(function(){
'use strict';
// rest guards (API.md "Rest hooks"): while a compare tool is on ('era' | 'special') nothing is painted over ctx.to.rect; while reading, nothing
// is left inside ctx.readRect (a right-hand column fades out over `fade` px just before the panel's edge). Idle, not reading: no-op (exact hand-over).
function rgBegin(ctx){var g=ctx.g,S=ctx.state,R=ctx.reading&&ctx.readRect,r=ctx.to&&ctx.to.rect,k=S.rgK||0,dt=Math.min(ctx.dt||0,.1);
  if(R)S.rgR={x:R.x,y:R.y,w:R.w,h:R.h};k+=((R?1:0)-k)*Math.min(1,dt*6);S.rgK=(!R&&k<.003)?0:(R&&k>.997)?1:k;
  g.save();if((ctx.tool==='era'||ctx.tool==='special')&&r){g.beginPath();g.rect(0,0,ctx.W,ctx.H);g.rect(r.x-1,r.y-1,r.w+2,r.h+2);g.clip('evenodd');}}
function rgEnd(ctx,fade,fill,fillA){var g=ctx.g,S=ctx.state,R=S.rgR;if(!(S.rgK>0)||!R){g.restore();return;}
  g.save();   // still inside rgBegin's compare clip: the fill never lands on the hung work either
  g.globalCompositeOperation='destination-out';g.globalAlpha=S.rgK;
  if(R.x>ctx.W*.3){var f=fade==null?60:fade,x0=R.x-f,gr=g.createLinearGradient(x0,0,R.x,0);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'#000');
    g.fillStyle=gr;g.fillRect(x0,0,ctx.W-x0+1,ctx.H);
    // optional flat fill, added ('lighter' on premultiplied pixels = an exact cross-fade): a room whose rest darkens the whole wall keeps that flat darkness under the panel
    if(fill&&fillA>0){g.globalCompositeOperation='lighter';g.globalAlpha=S.rgK*fillA;var fg=g.createLinearGradient(x0,0,R.x,0);fg.addColorStop(0,fill.replace('rgb(','rgba(').replace(')',',0)'));fg.addColorStop(1,fill);g.fillStyle=fg;g.fillRect(x0,0,ctx.W-x0+1,ctx.H);}}
  else{g.fillStyle='#000';g.fillRect(R.x,R.y,R.w,R.h);if(fill&&fillA>0){g.globalCompositeOperation='lighter';g.globalAlpha=S.rgK*fillA;g.fillStyle=fill;g.fillRect(R.x,R.y,R.w,R.h);}}
  g.restore();g.restore();}
// any pointer over the reading panel belongs to the text, not to the room
function rgInRead(ctx,x,y){var R=ctx.reading&&ctx.readRect;return !!R&&x>=R.x&&x<=R.x+R.w&&y>=R.y&&y<=R.y+R.h;}
var FW=2400,FH=1089;                                   // fresco space = main.webp pixels
var LS=FW/3000;                                        // body layers are 3000 px wide
var TA=[905.2,499.3],TG=[911.5,491.8],MID=[908.4,495.6];   // Adam's and God's index fingertips, the gap
var HAND={A:[0.34966360319486034,0.014752610254084185,-0.014752610254084185,0.34966360319486034,681.0142862081509,342.35128916319405],
  hA:{bx:0,by:230,w:683,h:374},hG:{bx:652,by:197,w:748,h:425}};
var GOD_C=[1740,540];                                  // God's centre of mass (rotation pivot while he banks in)
var D=22;
var T={
  candIn:[0,1.3],out:[1.6,1.95,2.25,2.5,2.72,2.92,3.1],
  crack:[3.3,3.7],split:[3.72,5.3],black:[3.0,5.3],shrink:[5.2,6.4],
  lines:[5.5,7.5],adam:[6.6,11.3],god:[7.0,11.5],zoomIn:[9.5,12.0],last:[11.0,12.9],
  still:[12.9,14.0],linesOut:[14.0,14.8],zoomOut:[14.2,17.0],sliverOut:[14.4,15.6],
  lay0:15.0,layStep:.27,layFill:.45,flash:.95,wall:[16.0,19.6],
  arch:[19.35,20.0],cornice:[19.55,21.0]
};
/*@GIORNATE*/var GIORNATE={"giornate":[{"id":1,"label":"天空与灰泥（左上）","kind":"plaster","polys":[[[831,504],[819,496],[792,491],[779,477],[759,485],[726,515],[687,536],[685,548],[742,545],[779,537],[830,519]],[[0,0],[0,129],[40,129],[48,133],[76,133],[84,137],[109,139],[126,135],[169,135],[207,141],[248,142],[256,161],[272,168],[285,187],[296,192],[312,209],[309,234],[295,246],[280,249],[271,266],[271,276],[282,285],[284,302],[311,326],[362,349],[395,373],[433,417],[455,461],[496,500],[537,499],[564,503],[583,496],[605,480],[656,469],[685,469],[691,462],[698,462],[719,451],[736,449],[764,435],[789,437],[815,445],[841,446],[846,406],[848,302],[821,202],[828,114],[826,0]]]},{"id":2,"label":"灰泥（上中）","kind":"plaster","polys":[[[868,507],[862,496],[853,493],[853,502],[859,511],[853,518],[844,517],[839,521],[837,509],[832,508],[830,520],[804,530],[749,545],[707,548],[707,552],[765,550],[820,539],[867,518]],[[843,447],[856,458],[887,472],[897,485],[904,503],[917,501],[912,493],[915,488],[941,479],[986,477],[992,468],[1037,465],[1155,441],[1160,409],[1167,402],[1186,334],[1199,310],[1207,306],[1233,264],[1254,245],[1284,208],[1374,134],[1390,133],[1411,122],[1418,55],[1419,0],[827,0],[829,114],[822,202],[849,302]]]},{"id":3,"label":"灰泥（右上）","kind":"plaster","polys":[[[1412,119],[1449,106],[1525,68],[1559,60],[1570,53],[1649,41],[1686,31],[1750,23],[1987,23],[2049,29],[2123,25],[2157,39],[2174,67],[2205,65],[2215,59],[2259,63],[2284,49],[2296,49],[2300,53],[2300,74],[2304,79],[2399,79],[2399,60],[2328,58],[2299,40],[2299,0],[1420,0],[1419,55]]]},{"id":4,"label":"上帝的头与斗篷上缘","kind":"figure","polys":[[[1173,384],[1195,386],[1245,374],[1294,376],[1342,362],[1364,350],[1405,342],[1459,344],[1527,328],[1593,319],[1732,313],[1822,294],[1875,288],[1932,297],[1992,296],[2106,305],[2233,327],[2320,353],[2352,353],[2398,344],[2399,80],[2304,80],[2299,74],[2299,53],[2296,50],[2284,50],[2259,64],[2215,60],[2205,66],[2174,68],[2165,58],[2163,47],[2157,40],[2123,26],[2049,30],[1987,24],[1750,24],[1686,32],[1649,42],[1570,54],[1559,61],[1533,66],[1504,78],[1449,107],[1431,111],[1399,131],[1374,135],[1281,212],[1255,245],[1234,264],[1208,306],[1200,310],[1187,334]]]},{"id":5,"label":"上帝的身体与天使","kind":"figure","polys":[[[1342,363],[1348,494],[1346,529],[1338,555],[1312,605],[1308,627],[1361,636],[1428,664],[1500,682],[1524,683],[1570,674],[1588,674],[1630,686],[1695,683],[1746,702],[1784,711],[1869,720],[1992,722],[2093,697],[2140,680],[2180,683],[2259,719],[2275,723],[2376,715],[2399,708],[2399,345],[2352,354],[2320,354],[2233,328],[2106,306],[1992,297],[1932,298],[1889,290],[1859,290],[1732,314],[1593,320],[1527,329],[1464,345],[1404,344],[1356,354]]]},{"id":6,"label":"亚当身后的天空与山坡上缘","kind":"figure","polys":[[[0,130],[0,356],[28,357],[86,370],[187,366],[218,360],[274,336],[305,327],[298,313],[283,302],[281,285],[269,271],[280,248],[295,245],[308,234],[311,209],[296,193],[284,187],[272,169],[255,161],[248,143],[207,142],[169,136],[126,136],[109,140],[84,138],[76,134],[48,134],[40,130]]]},{"id":7,"label":"亚当的头","kind":"figure","polys":[[[345,343],[306,327],[211,363],[146,368],[139,410],[144,523],[210,558],[266,562],[351,550],[379,433],[355,394],[347,368]]]},{"id":8,"label":"亚当的躯干","kind":"figure","polys":[[[0,431],[0,803],[18,802],[76,828],[139,878],[166,888],[206,896],[265,879],[324,885],[363,874],[437,872],[483,863],[548,804],[582,758],[556,643],[552,550],[444,541],[419,546],[386,563],[375,473],[370,473],[351,551],[273,563],[208,559],[142,523],[138,440],[72,441]]]},{"id":9,"label":"下方天使与腿","kind":"figure","polys":[[[1307,629],[1308,657],[1321,730],[1339,731],[1349,749],[1369,771],[1419,797],[1423,818],[1435,831],[1449,838],[1534,842],[1545,859],[1575,865],[1623,916],[1663,919],[1699,945],[1719,949],[1731,958],[1755,950],[1767,951],[1796,982],[1802,1000],[1968,1000],[1993,1021],[2007,1045],[2012,1045],[2015,1037],[2026,1030],[2068,1048],[2087,1048],[2114,1036],[2172,1036],[2180,1032],[2203,1032],[2222,1025],[2221,1017],[2199,1016],[2180,1006],[2175,990],[2176,980],[2189,971],[2206,923],[2221,923],[2238,941],[2244,941],[2257,917],[2257,898],[2253,893],[2238,892],[2221,881],[2206,880],[2203,875],[2206,849],[2212,843],[2207,821],[2217,796],[2252,796],[2260,790],[2265,779],[2275,778],[2307,793],[2329,817],[2357,830],[2372,827],[2381,810],[2399,808],[2399,796],[2392,794],[2375,758],[2382,734],[2390,728],[2399,728],[2399,710],[2376,716],[2334,717],[2283,725],[2259,720],[2180,684],[2140,681],[2076,703],[2052,706],[1992,723],[1882,722],[1769,709],[1695,684],[1630,687],[1588,675],[1524,684],[1500,683],[1428,665],[1361,637]]]},{"id":10,"label":"斗篷下缘","kind":"figure","polys":[[[1155,558],[1161,597],[1164,600],[1199,602],[1201,683],[1230,712],[1265,736],[1291,742],[1308,742],[1319,736],[1307,657],[1306,624],[1327,570],[1281,574],[1186,566]],[[1036,516],[993,514],[964,518],[961,533],[963,553],[979,553],[986,531],[995,523],[998,526],[994,546],[1001,551],[1008,528],[1033,522]]]},{"id":11,"label":"亚当的腿","kind":"figure","polys":[[[332,883],[332,887],[362,890],[432,936],[471,1000],[481,1088],[1053,1088],[1000,1007],[949,879],[916,820],[889,781],[862,713],[825,648],[811,648],[789,640],[775,625],[741,622],[730,615],[709,611],[696,585],[680,575],[655,576],[602,557],[553,550],[557,643],[583,758],[549,804],[483,864],[431,874],[368,875]]]},{"id":12,"label":"山坡","kind":"figure","polys":[[[0,999],[59,985],[109,960],[171,907],[192,900],[193,895],[139,879],[82,833],[18,803],[0,804]],[[832,653],[832,659],[870,728],[890,781],[917,820],[950,879],[1001,1007],[1056,1088],[1279,1088],[1279,1074],[1269,1061],[1272,1034],[1193,975],[1181,970],[1071,883],[1052,880],[1046,866],[1015,837],[999,809],[922,730],[902,701],[878,677]],[[0,357],[0,430],[72,440],[138,439],[144,368],[86,371],[28,358]]]},{"id":13,"label":"灰泥（下中）","kind":"plaster","polys":[[[667,560],[667,568],[697,585],[709,610],[730,614],[741,621],[775,624],[789,639],[811,647],[828,648],[853,665],[878,676],[903,701],[923,730],[988,795],[1016,837],[1047,866],[1052,879],[1071,882],[1181,969],[1193,974],[1273,1034],[1271,1065],[1280,1074],[1280,1088],[1515,1087],[1541,1022],[1547,976],[1540,951],[1481,840],[1449,839],[1435,832],[1422,818],[1419,798],[1369,772],[1348,749],[1339,732],[1326,731],[1308,743],[1277,741],[1249,728],[1230,713],[1199,681],[1198,602],[1164,601],[1159,595],[1150,514],[1099,512],[1060,504],[1033,523],[1010,527],[1001,552],[993,546],[995,528],[991,528],[986,533],[980,553],[964,555],[960,542],[961,517],[972,499],[967,494],[952,493],[890,509],[887,520],[866,519],[830,537],[756,552],[676,553]]]},{"id":14,"label":"灰泥（右下）","kind":"plaster","polys":[[[2399,809],[2381,811],[2372,828],[2357,831],[2329,818],[2307,794],[2275,779],[2265,780],[2261,790],[2252,797],[2217,797],[2208,821],[2214,842],[2207,849],[2205,878],[2221,880],[2238,891],[2253,892],[2258,898],[2258,917],[2248,939],[2242,943],[2221,924],[2206,924],[2190,971],[2177,980],[2176,990],[2180,1005],[2199,1015],[2221,1016],[2223,1025],[2203,1033],[2180,1033],[2172,1037],[2114,1037],[2087,1049],[2068,1049],[2031,1031],[2021,1033],[2009,1047],[2002,1041],[1992,1021],[1968,1001],[1802,1001],[1795,982],[1767,952],[1755,951],[1731,959],[1719,950],[1699,946],[1663,920],[1623,917],[1575,866],[1545,860],[1536,844],[1484,841],[1541,951],[1548,976],[1542,1022],[1516,1088],[2344,1088],[2350,1051],[2399,1046]]]},{"id":15,"label":"上帝的手臂与手","kind":"figure","polys":[[[1340,364],[1320,367],[1282,379],[1239,376],[1199,387],[1171,387],[1168,402],[1161,409],[1155,442],[1037,466],[992,469],[986,478],[941,480],[915,489],[914,494],[967,493],[974,502],[965,510],[964,517],[993,513],[1042,515],[1060,503],[1099,511],[1152,514],[1154,555],[1176,563],[1281,573],[1330,568],[1343,538],[1347,507]]]},{"id":16,"label":"亚当的手臂与手","kind":"figure","polys":[[[350,347],[349,369],[353,386],[381,435],[374,466],[386,560],[425,543],[452,540],[583,552],[646,573],[673,575],[673,571],[666,568],[666,560],[684,546],[687,535],[726,514],[759,484],[778,475],[792,490],[812,492],[829,501],[839,510],[838,518],[856,515],[852,502],[853,488],[864,497],[872,518],[885,518],[881,488],[901,501],[901,495],[887,473],[856,459],[845,448],[764,436],[754,439],[754,445],[749,448],[742,446],[716,453],[698,463],[691,463],[685,470],[656,470],[605,481],[583,497],[564,504],[537,500],[498,502],[454,461],[434,420],[418,397],[378,360]]]}],"architecture":[{"id":"a1","label":"建筑：左下檐口与伊纽多之手","kind":"architecture","polys":[[[468,996],[430,935],[360,890],[261,881],[175,905],[109,961],[59,986],[0,1000],[0,1088],[480,1088]]]},{"id":"a2","label":"建筑：右上檐口","kind":"architecture","polys":[[[2300,0],[2300,40],[2328,57],[2399,59],[2399,0]]]},{"id":"a3","label":"建筑：右下檐口","kind":"architecture","polys":[[[2399,1047],[2350,1052],[2345,1088],[2399,1088]]]}],"approximate":true,"w":2400,"h":1089};/*@END*/
window.EH_SHARED=window.EH_SHARED||{};
window.EH_SHARED.renaissanceGiornate=GIORNATE;
// the rest extras of this room (the painted cornice round the panel), for the next room's p = 0 — pure: same grain (rng 7) as init builds
window.EH_SHARED.renaissanceRest=function(g,o){var P=window.EH_SHARED.__renGrain;
  if(!P){var n=document.createElement('canvas');n.width=n.height=96;var ng=n.getContext('2d'),r=window.EH.util.rng(7),d=ng.createImageData(96,96);
    for(var i=0;i<d.data.length;i+=4){var v=r();d.data[i]=d.data[i+1]=d.data[i+2]=v<.5?60:235;d.data[i+3]=Math.round(Math.abs(v-.5)*2*34);}
    ng.putImageData(d,0,0);P=window.EH_SHARED.__renGrain={c:n};}
  if(!P.pat||P.g!==g){P.pat=g.createPattern(P.c,'repeat');P.g=g;}
  cornice(g,{grain:P.pat},o.rect,o.W,1);};

// ------------------------------------------------------------------ helpers
function clamp(x){return x<0?0:x>1?1:x;}
function seg(t,a,b){return clamp((t-a)/(b-a));}
function lerp(a,b,u){return a+(b-a)*u;}
function eo(x){x=clamp(x);return 1-Math.pow(1-x,3);}
function ei(x){x=clamp(x);return x*x*x;}
function eio(x){x=clamp(x);return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;}
function sm(x){x=clamp(x);return x*x*(3-2*x);}
function hex(c){c=c.replace('#','');if(c.length===3)c=c.split('').map(function(x){return x+x;}).join('');var n=parseInt(c,16);return[(n>>16)&255,(n>>8)&255,n&255];}
function mixc(a,b,u){return 'rgb('+[0,1,2].map(function(i){return Math.round(lerp(a[i],b[i],u));}).join(',')+')';}
var BLACK=[7,6,5];

// the CSS drop shadows of the hung frame, drawn with the offset trick so only the shadow lands (shadow params are device px)
// the same shadow pre-rendered once (full device resolution, device-pixel aligned) so no frame pays for a 120–140 px blur; drawn with globalAlpha = colour alpha
function shadowCache(dpr,r,ox,oy,blur,spread){var M=Math.ceil(1.6*blur+Math.abs(ox)+Math.abs(oy)+4),X0=r.x-spread-M,Y0=r.y-spread-M,X1=r.x+r.w+spread+M,Y1=r.y+r.h+spread+M;
  var dx=Math.floor(X0*dpr),dy=Math.floor(Y0*dpr),c=document.createElement('canvas');c.width=Math.ceil(X1*dpr)-dx;c.height=Math.ceil(Y1*dpr)-dy;
  var q=c.getContext('2d');q.setTransform(dpr,0,0,dpr,-dx,-dy);cssShadow(q,dpr,r,ox,oy,blur,spread,'#000');
  return{c:c,x:dx/dpr,y:dy/dpr,w:c.width/dpr,h:c.height/dpr,key:[dpr,r.x,r.y,r.w,r.h].join('/')};}
function drawShadow(g,sh,a){if(!sh||a<=0)return;g.save();g.globalAlpha=a;g.drawImage(sh.c,sh.x,sh.y,sh.w,sh.h);g.restore();}
function cssShadow(g,dpr,r,ox,oy,blur,spread,col){g.save();g.shadowColor=col;g.shadowBlur=blur*dpr;g.shadowOffsetX=(ox+1e5)*dpr;g.shadowOffsetY=oy*dpr;
  g.fillStyle='#000';g.fillRect(r.x-spread-1e5,r.y-spread,r.w+2*spread,r.h+2*spread);g.restore();}
// .wash: radial-gradient(ellipse 70% 60% at centre-of-art, c0, transparent 70%)
function wash(g,W,H,r,light,a){if(a<=0)return;var cx=r.x+r.w/2,cy=r.y+r.h/2;g.save();g.translate(cx,cy);g.scale(.7*W,.6*H);
  var gr=g.createRadialGradient(0,0,0,0,0,1);gr.addColorStop(0,light?'rgba(255,255,255,.35)':'rgba(255,244,225,.08)');gr.addColorStop(.7,light?'rgba(255,255,255,0)':'rgba(255,244,225,0)');
  g.globalAlpha=a;g.fillStyle=gr;g.fillRect(-2,-2,4,4);g.restore();}
// .frame.f-gilt::before (medieval): 160deg gradient, inset rings 1px #1c1409 / 5px #7a5e35 / 6px #241a0c, shadow 0 28px 70px -24px
function gilt(g,r){var fp=r.fp||0,x=r.x-fp,y=r.y-fp,w=r.w+2*fp,h=r.h+2*fp;if(!fp)return;
  var a=160*Math.PI/180,dx=Math.sin(a),dy=-Math.cos(a),L=Math.abs(w*dx)+Math.abs(h*dy),cx=x+w/2,cy=y+h/2;
  var gr=g.createLinearGradient(cx-dx*L/2,cy-dy*L/2,cx+dx*L/2,cy+dy*L/2);gr.addColorStop(0,'#6d5230');gr.addColorStop(.55,'#3a2a14');gr.addColorStop(1,'#5c4424');
  g.fillStyle=gr;g.fillRect(x,y,w,h);
  g.fillStyle='#241a0c';g.fillRect(x,y,w,6);g.fillRect(x,y+h-6,w,6);g.fillRect(x,y,6,h);g.fillRect(x+w-6,y,6,h);
  g.fillStyle=gr;g.fillRect(x+6,y+6,w-12,h-12);
  g.fillStyle='#7a5e35';g.fillRect(x,y,w,5);g.fillRect(x,y+h-5,w,5);g.fillRect(x,y,5,h);g.fillRect(x+w-5,y,5,h);
  g.fillStyle='#1c1409';g.fillRect(x,y,w,1);g.fillRect(x,y+h-1,w,1);g.fillRect(x,y,1,h);g.fillRect(x+w-1,y,1,h);}

// the painted cornice of the ceiling, closed around the panel (also drawn by rest(), so it persists); k = build 0..1
function corniceWidth(W){return W<=560?7:W<=980?10:13;}
function cornice(g,st,r,W,k){if(k<=0)return;var b=corniceWidth(W),x=r.x,y=r.y,w=r.w,h=r.h,X=x-b,Y=y-b,WW=w+2*b,HH=h+2*b;
  var trace=eo(seg(k,0,.6)),fill=sm(seg(k,.35,1));
  if(fill>0){g.save();g.globalAlpha=fill;
    // four mitred sides, each lit or shaded as painted stone lit from the upper left
    var sides=[[[X,Y],[X+WW,Y],[x+w,y],[x,y],'#c5bd9c','#aaa27f'],[[X+WW,Y],[X+WW,Y+HH],[x+w,y+h],[x+w,y],'#9c9372','#8a8163'],
               [[X+WW,Y+HH],[X,Y+HH],[x,y+h],[x+w,y+h],'#8f8666','#7d7456'],[[X,Y+HH],[X,Y],[x,y],[x,y+h],'#bab291','#a19977']];
    sides.forEach(function(s,i){var gr=i%2===0?g.createLinearGradient(0,i===0?Y:Y+HH,0,i===0?y:y+h):g.createLinearGradient(i===3?X:X+WW,0,i===3?x:x+w,0);
      gr.addColorStop(0,s[4]);gr.addColorStop(1,s[5]);g.fillStyle=gr;g.beginPath();g.moveTo(s[0][0],s[0][1]);g.lineTo(s[1][0],s[1][1]);g.lineTo(s[2][0],s[2][1]);g.lineTo(s[3][0],s[3][1]);g.closePath();g.fill();});
    if(st&&st.grain){g.globalAlpha=fill*.5;g.fillStyle=st.grain;g.beginPath();g.rect(X,Y,WW,HH);g.rect(x+w,y,-w,h);g.fill('evenodd');g.globalAlpha=fill;}
    // mouldings: a lit fillet at ~40 % of the band, a dark reveal against the fresco, a dark arris outside
    var m=Math.max(2,Math.round(b*.42));g.lineWidth=1;
    g.strokeStyle='rgba(236,230,206,.75)';g.strokeRect(x-m+.5,y-m+.5,w+2*m-1,h+2*m-1);
    g.strokeStyle='rgba(84,74,44,.9)';g.strokeRect(x-.5,y-.5,w+1,h+1);
    g.strokeStyle='rgba(70,60,38,.55)';g.strokeRect(X+.5,Y+.5,WW-1,HH-1);
    g.restore();}
  // the first pass: a line runs round the panel from the top-left corner, like a cornice being set out
  if(trace>0&&trace<1||fill<1&&trace>0){var per=2*(WW+HH),len=trace*per,a=(1-fill)*.9;g.save();g.strokeStyle='rgba(240,232,205,'+a.toFixed(3)+')';g.lineWidth=1;g.beginPath();
    var pts=[[X,Y],[X+WW,Y],[X+WW,Y+HH],[X,Y+HH],[X,Y]],left=len;g.moveTo(X+.5,Y+.5);
    for(var i=1;i<pts.length&&left>0;i++){var p0=pts[i-1],p1=pts[i],d=Math.hypot(p1[0]-p0[0],p1[1]-p0[1]),u=Math.min(1,left/d);g.lineTo(lerp(p0[0],p1[0],u)+.5,lerp(p0[1],p1[1],u)+.5);left-=d;}
    g.stroke();g.restore();}}

// ------------------------------------------------------------------ geometry of the passage
function geo(ctx){var W=ctx.W,H=ctx.H,to=ctx.to.rect,fr=ctx.from?ctx.from.rect:{x:W/2-100,y:H/2-150,w:200,h:300,fp:0};
  var VP=[fr.x+fr.w/2,fr.y+fr.h/2],sF=to.w/FW,mob=W<700;
  var wide={s:mob?Math.max(sF,W*1.25/FW):sF,c:VP};
  var close={s:Math.min(W,H*1.6)*(mob?.62:.5)/300,c:[W/2,H*.48]};
  var fin={s:sF,c:[to.x+MID[0]*sF,to.y+MID[1]*sF]};
  return{W:W,H:H,to:to,fr:fr,VP:VP,wide:wide,close:close,fin:fin,mob:mob};}
function mixCam(a,b,u){return{s:Math.exp(lerp(Math.log(a.s),Math.log(b.s),u)),c:[lerp(a.c[0],b.c[0],u),lerp(a.c[1],b.c[1],u)]};}
function camera(t,G){if(t<T.zoomOut[0])return mixCam(G.wide,G.close,eio(seg(t,T.zoomIn[0],T.zoomIn[1])));
  return mixCam(G.close,G.fin,eio(seg(t,T.zoomOut[0],T.zoomOut[1])));}
function applyCam(g,cam){g.translate(cam.c[0],cam.c[1]);g.scale(cam.s,cam.s);g.translate(-MID[0],-MID[1]);}
function toScreen(cam,f){return[(f[0]-MID[0])*cam.s+cam.c[0],(f[1]-MID[1])*cam.s+cam.c[1]];}
// perspective rays: 16 directions round the vanishing point; Adam travels the lower-left one (i = 0), God the upper-right one (i = 8)
var RAY0=157.5*Math.PI/180;
function rayEnd(G,i,vp){var a=RAY0+i*Math.PI/8,dx=Math.cos(a),dy=Math.sin(a),k=1e9;
  if(dx<0)k=Math.min(k,(0-vp[0])/dx);if(dx>0)k=Math.min(k,(G.W-vp[0])/dx);if(dy<0)k=Math.min(k,(0-vp[1])/dy);if(dy>0)k=Math.min(k,(G.H-vp[1])/dy);
  return[vp[0]+dx*k,vp[1]+dy*k];}
// where each figure is (F-space offset of its fingertip, scale about the fingertip)
function figures(t,G){
  var a1=eo(seg(t,T.adam[0],T.adam[1])),g1=eo(seg(t,T.god[0],T.god[1])),l2=eio(seg(t,T.last[0],T.last[1]));
  var s0=G.wide.s,eA=rayEnd(G,0,G.VP),eG=rayEnd(G,8,G.VP);
  // start points on the two rays, just outside the screen; end = their place in the fresco, minus the last few pixels
  var dA=[eA[0]-G.VP[0],eA[1]-G.VP[1]],nA=Math.hypot(dA[0],dA[1]),kA0=.5;
  var pA=[G.VP[0]+dA[0]/nA*(nA+40),G.VP[1]+dA[1]/nA*(nA+40)];
  var dG=[eG[0]-G.VP[0],eG[1]-G.VP[1]],nG=Math.hypot(dG[0],dG[1]),kG0=1.75;
  var pG=[G.VP[0]+dG[0]/nG*(nG+40),G.VP[1]+dG[1]/nG*(nG+40)];
  var offA0=[(pA[0]-G.VP[0])/s0-(TA[0]-MID[0])+31,(pA[1]-G.VP[1])/s0-(TA[1]-MID[1])];
  var offG0=[(pG[0]-G.VP[0])/s0-(TG[0]-MID[0])-29,(pG[1]-G.VP[1])/s0-(TG[1]-MID[1])];
  var arc=-Math.sin(g1*Math.PI)*70*(1-g1);
  return{
    A:{k:lerp(kA0,1,sm(seg(t,T.adam[0]+.4,T.adam[1]))),dx:offA0[0]*(1-a1)-31*(1-l2),dy:offA0[1]*(1-a1),al:sm(seg(t,T.adam[0],T.adam[0]+1))},
    G:{k:lerp(kG0,1,sm(seg(t,T.god[0]+.4,T.god[1]))),dx:offG0[0]*(1-g1)+29*(1-l2),dy:offG0[1]*(1-g1)+arc,rot:lerp(-.08,0,g1),al:sm(seg(t,T.god[0],T.god[0]+1))}};}

// ------------------------------------------------------------------ module
EH.transition('renaissance',{
  duration:D,
  assets:['t_adam.webp','t_god.webp','t_hA.webp','t_hG.webp'],
  fromAssets:['t_glint.webp'],
  init:function(ctx){var S=ctx.state;S.adam=ctx.asset('t_adam.webp');S.god=ctx.asset('t_god.webp');S.hA=ctx.asset('t_hA.webp');S.hG=ctx.asset('t_hG.webp');
    var im=ctx.to.image,DIL=1.6;
    function region(e){var bx=1e9,by=1e9,bx2=-1e9,by2=-1e9,path=new Path2D();
      e.polys.forEach(function(p){p.forEach(function(q,i){if(i)path.lineTo(q[0],q[1]);else path.moveTo(q[0],q[1]);bx=Math.min(bx,q[0]);by=Math.min(by,q[1]);bx2=Math.max(bx2,q[0]);by2=Math.max(by2,q[1]);});path.closePath();});
      bx=Math.max(0,Math.floor(bx-3));by=Math.max(0,Math.floor(by-3));bx2=Math.min(FW,Math.ceil(bx2+3));by2=Math.min(FH,Math.ceil(by2+3));
      var c=document.createElement('canvas');c.width=bx2-bx;c.height=by2-by;var q=c.getContext('2d');q.translate(-bx,-by);
      // the patch overlaps its neighbours by ~1.5 px (same pixels), so laid patches leave no anti-aliased hairline between them
      q.fillStyle='#000';q.fill(path);q.lineWidth=DIL*2;q.lineJoin='round';q.strokeStyle='#000';q.stroke(path);
      q.globalCompositeOperation='source-in';q.drawImage(im,0,0,FW,FH);
      return{c:c,x:bx,y:by,path:path,label:e.label,kind:e.kind};}
    S.reg=(GIORNATE?GIORNATE.giornate:[]).map(region);S.arch=(GIORNATE?GIORNATE.architecture:[]).map(region);
    // a little grain for the painted stone
    var n=document.createElement('canvas');n.width=n.height=96;var ng=n.getContext('2d'),r=ctx.u.rng(7),d=ng.createImageData(96,96);
    for(var i=0;i<d.data.length;i+=4){var v=r();d.data[i]=d.data[i+1]=d.data[i+2]=v<.5?60:235;d.data[i+3]=Math.round(Math.abs(v-.5)*2*34);}
    ng.putImageData(d,0,0);S.grain=ctx.g.createPattern(n,'repeat');
    // candles: seven votive candles in a row before the panel (positions relative to the panel, heights varied)
    S.cand=[.1,.24,.37,.5,.63,.77,.9].map(function(u,i){return{u:u,h:[.62,.86,.7,1,.74,.9,.66][i],ph:r()*6.28};});
    S.outOrder=[2,5,0,6,3,1,4];
    // the medieval room's resting glint (candlelight on the gold, carried along the foot of the panel): picked up where it was
    S.glMask=ctx.fromAsset('t_glint.webp');S.glT0=performance.now()/1000;
    prewarm(ctx,S);},

  draw:function(p,ctx){var g=ctx.g,S=ctx.state,t=p*D,G=geo(ctx),W=G.W,H=G.H,dpr=ctx.dpr||1,fr=G.fr,to=G.to,u=ctx.u;
    var toWall=hex(ctx.to.wall||'#A89E8E'),fromWall=ctx.from?hex(ctx.from.wall):BLACK;
    ctx.ui.ink(t>17.8?(ctx.to.ink||'dark'):(ctx.from?ctx.from.ink:'light'));

    // ===== 1. the medieval room, the candles, the split of the gold panel
    if(t<T.split[1]){
      var lit=candleLit(t,S),L=1-.75*(1-lit),toBlack=seg(t,T.black[0],T.black[1]);
      var wallC=mixc(fromWall,BLACK,Math.max(toBlack,(1-L)*.85));
      g.fillStyle=wallC;g.fillRect(0,0,W,H);
      var sp=eio(seg(t,T.split[0],T.split[1])),cx=fr.x+fr.w/2,fp=fr.fp||0;
      var off=sp*(W/2+fr.w/2+fp+120);
      if(ctx.from){ensureCaches(ctx,S,G);
        // the medieval wall's light pool dims with the room (it used to vanish in one frame when the halves began to move)
        var wa=1-sm(seg(t,T.black[0],T.split[0]+.25));if(wa>0)wash(g,W,H,fr,ctx.from.ink==='dark',wa);
        [-1,1].forEach(function(side){g.save();
          g.translate(side*off,0);
          g.beginPath();if(side<0)g.rect(-1e4,-1e4,cx+1e4,3e4);else g.rect(cx,-1e4,3e4,3e4);g.clip();
          drawShadow(g,S.shFr,.8*(1-sp));
          gilt(g,fr);drawMedieval(g,ctx,fr);glint(g,ctx,S,fr,t,lit);
          // candle-light fall-off on the panel, then darkness as the candles go out
          if(L<1){g.fillStyle='rgba(4,3,2,'+((1-L)*.92).toFixed(3)+')';g.fillRect(fr.x-fp-2,fr.y-fp-2,fr.w+2*fp+4,fr.h+2*fp+4);}
          // the inner edge of each half catches the light of the seam
          var ce=seg(t,T.crack[0],T.crack[1]);if(ce>0){var e0=cx,gw=Math.min(90,fr.w*.3),gr=g.createLinearGradient(e0,0,e0+side*gw,0);
            var ia=.32*ce*(1-.6*sp);gr.addColorStop(0,'rgba(255,214,140,'+ia.toFixed(3)+')');gr.addColorStop(1,'rgba(255,214,140,0)');
            g.globalCompositeOperation='lighter';g.fillStyle=gr;g.fillRect(side<0?e0-gw:e0,fr.y-fp,gw,fr.h+2*fp);g.globalCompositeOperation='source-over';}
          g.restore();});
      }
      if(t<T.split[0]+.6)candles(g,ctx,S,t,fr,W,H,L,1-sm(seg(t,T.split[0]-.3,T.split[0]+.5)));
    }else{g.fillStyle=mixc(BLACK,BLACK,0);g.fillRect(0,0,W,H);}

    // ===== 2. the fresco world (black, then the wall comes up behind the laid fresco)
    var cam=camera(t,G);
    var wallU=sm(seg(t,T.wall[0],T.wall[1]));
    // (the panel's shadow comes only once the plaster is complete)
    if(t>=T.split[1]){g.fillStyle=mixc(BLACK,toWall,wallU);g.fillRect(0,0,W,H);
      if(wallU>0){ensureCaches(ctx,S,G);wash(g,W,H,to,ctx.to.ink==='dark',wallU);drawShadow(g,S.shTo,.6*wallU*sm(seg(t,18.4,19.8)));}}
    var vp=toScreen(cam,MID);
    // perspective lines
    if(t>=T.lines[0]&&t<T.linesOut[1])lines(g,G,t,vp,dpr);
    var done=t>=T.arch[1]+.05;
    if(t>=T.adam[0]){
      var F=figures(t,G);g.save();applyCam(g,cam);
      if(!done){
        // the cut-outs (under the laid patches)
        if(F.A.al>0){g.save();g.globalAlpha=F.A.al;g.translate(TA[0]+F.A.dx,TA[1]+F.A.dy);g.scale(F.A.k,F.A.k);g.translate(-TA[0],-TA[1]);
          g.drawImage(S.bm.adam||S.adam,0,0,FW,FH);hand(g,S.bm.hA||S.hA,HAND.hA);g.restore();}
        if(F.G.al>0){g.save();g.globalAlpha=F.G.al;g.translate(TG[0]+F.G.dx,TG[1]+F.G.dy);g.scale(F.G.k,F.G.k);g.translate(-TG[0],-TG[1]);
          g.translate(GOD_C[0],GOD_C[1]);g.rotate(F.G.rot);g.translate(-GOD_C[0],-GOD_C[1]);g.drawImage(S.bm.god||S.god,0,0,FW,FH);hand(g,S.bm.hG||S.hG,HAND.hG);g.restore();}
        // the giornate
        S.reg.forEach(function(R,i){var t0=T.lay0+i*T.layStep,a=eo(seg(t,t0,t0+T.layFill));if(a<=0)return;g.globalAlpha=a;g.drawImage(R.c,R.x,R.y);g.globalAlpha=1;});
        S.arch.forEach(function(R,i){var t0=T.arch[0]+i*.18,a=eo(seg(t,t0,t0+T.layFill));if(a<=0)return;g.globalAlpha=a;g.drawImage(R.c,R.x,R.y);g.globalAlpha=1;});
      }
      g.restore();
      if(done){g.drawImage(S.bm.to||ctx.to.image,to.x,to.y,to.w,to.h);}
      // seams flash as each patch is laid
      g.save();applyCam(g,cam);g.globalCompositeOperation='lighter';g.lineJoin='round';
      S.reg.concat(S.arch).forEach(function(R,i){var arch=i>=S.reg.length,t0=arch?T.arch[0]+(i-S.reg.length)*.18:T.lay0+i*T.layStep,f=seg(t,t0,t0+T.flash);if(f<=0||f>=1)return;
        var a=f<.12?f/.12:Math.pow(1-(f-.12)/.88,1.6);g.strokeStyle=arch?'rgba(255,222,160,'+(.8*a).toFixed(3)+')':'rgba(255,246,226,'+(.75*a).toFixed(3)+')';
        g.lineWidth=1.3/cam.s;g.stroke(R.path);g.lineWidth=5/cam.s;g.strokeStyle=arch?'rgba(255,200,120,'+(.14*a).toFixed(3)+')':'rgba(255,236,200,'+(.12*a).toFixed(3)+')';g.stroke(R.path);});
      g.restore();
    }
    // close-up: a soft iris keeps the eye on the hands (the bodies behind them are a lower-resolution photograph)
    var ir=eio(seg(t,T.zoomIn[0]+.6,T.zoomIn[1]))*(1-eio(seg(t,T.zoomOut[0],T.zoomOut[0]+1.4)));
    if(ir>0){var irx=W>H?Math.max(W,H*1.2)*.62:W*.95,iry=W>H?irx*Math.min(1,H/W*1.25):W*.62;g.save();g.translate(W/2,H*.48);g.scale(irx,iry);
      var vg=g.createRadialGradient(0,0,0,0,0,1);vg.addColorStop(0,'rgba(7,6,5,0)');vg.addColorStop(.5,'rgba(7,6,5,0)');vg.addColorStop(.82,'rgba(7,6,5,'+(.6*ir).toFixed(3)+')');vg.addColorStop(1,'rgba(7,6,5,'+(.92*ir).toFixed(3)+')');
      g.fillStyle=vg;g.fillRect(-3,-3,6,6);g.restore();}
    // the seam of gold light: splits the panel, stays, shrinks to the vanishing point, ends as a sliver between the fingers
    sliver(g,G,t,cam,vp);
    // the painted architecture closes round the panel
    var ck=seg(t,T.cornice[0],T.cornice[1]);if(ck>0)cornice(g,S,to,W,ck);
  },
  done:function(ctx){ctx.state.restT0=performance.now()/1000;},
  rest:function(ctx){var S=ctx.state;rgBegin(ctx);cornice(ctx.g,S,ctx.to.rect,ctx.W,1);rgEnd(ctx);
    // the label drops into place as the core fades it in (core: label on at 0.8 s of rest)
    var el=document.getElementById('lab'+ctx.to.idx);if(!el)return;if(S.restT0==null)S.restT0=performance.now()/1000;
    var k=clamp((performance.now()/1000-S.restT0-.75)/1.2),y=-16*(1-eo(k));
    if(k<1){el.style.transform='translateY('+y.toFixed(2)+'px)';S.labMoved=1;}else if(S.labMoved){el.style.transform='';S.labMoved=0;}}
});

// ------------------------------------------------------------------ caches (built in init, rebuilt only if the size changes)
function ensureCaches(ctx,S,G){var dpr=ctx.dpr||1;
  if(ctx.from){var k=[dpr,G.fr.x,G.fr.y,G.fr.w,G.fr.h].join('/');if(!S.shFr||S.shFr.key!==k)S.shFr=shadowCache(dpr,G.fr,0,28,70,-24);}
  var k2=[dpr,G.to.x,G.to.y,G.to.w,G.to.h].join('/');if(!S.shTo||S.shTo.key!==k2)S.shTo=shadowCache(dpr,G.to,0,26,60,-26);}
// everything a frame will touch is created and handed to the GPU here, so no frame of the passage pays a first-use cost:
// decoded bitmaps (no re-decode when the close-up crosses a mip level), the medieval panel copy, the glint canvas, the two shadows, a scratch draw of each
function prewarm(ctx,S){S.bm={};var dpr=ctx.dpr||1,G=geo(ctx),sc=document.createElement('canvas');sc.width=sc.height=512;var sq=sc.getContext('2d');
  // the scratch is big enough to be GPU-backed (an 8 px one isn't, so it uploaded nothing); each layer is drawn at two sizes and once rotated
  // (texture + downscaled levels, as God banks in) and the uploads are queued one per task, so no single task (the previous room's rest, where init runs) stalls
  var Q=[];function warm(src){if(src)Q.push(src);if(Q.length===1)setTimeout(pump,0);}
  function pump(){var src=Q[0];try{sq.clearRect(0,0,512,512);sq.drawImage(src,0,0,512,512);sq.drawImage(src,0,0,64,64);sq.save();sq.translate(256,256);sq.rotate(-.05);sq.drawImage(src,-150,-100,300,200);sq.restore();sq.getImageData(0,0,1,1);}catch(e){}Q.shift();if(Q.length)setTimeout(pump,16);}
  function bm(key,im){if(!im||!window.createImageBitmap)return;var go=function(){createImageBitmap(im).then(function(b){S.bm[key]=b;warm(b);}).catch(function(){});};
    if(im.complete&&im.naturalWidth)go();else im.addEventListener('load',go,{once:true});}
  bm('adam',S.adam);bm('god',S.god);bm('hA',S.hA);bm('hG',S.hG);bm('to',ctx.to.image);
  ensureCaches(ctx,S,G);warm(S.shTo.c);if(S.shFr)warm(S.shFr.c);
  S.reg.concat(S.arch).forEach(function(R){warm(R.c);});
  if(ctx.from&&ctx.from.image){var gctx={dpr:dpr,from:ctx.from,state:S};drawMedieval(sq,gctx,G.fr);if(S.fromArt)warm(S.fromArt);
    var r=G.fr,q=Math.min(dpr,1.5),w=Math.min(Math.round(r.w*q),1100),h=Math.round(w*r.h/r.w);S.gl=document.createElement('canvas');S.gl.width=w;S.gl.height=h;S.glCtx=S.gl.getContext('2d');
    if(S.glMask&&S.glMask.naturalWidth)warm(S.glMask);}}

// ------------------------------------------------------------------ pieces
function hand(g,im,b){g.save();var A=HAND.A;g.transform(A[0],A[1],A[2],A[3],A[4],A[5]);g.drawImage(im,b.bx,b.by,b.w,b.h);g.restore();}
function drawMedieval(g,ctx,r){var sh=window.EH_SHARED&&window.EH_SHARED.medievalPanel;
  if(sh){try{sh(g,{rect:r,image:ctx.from.image});return;}catch(e){}}
  // like core's paintArt(): the hung work is first drawn into a canvas of round(w*dpr) px, then scaled by CSS
  var S=ctx.state,im=ctx.from.image,cw=Math.min(Math.round(r.w*(ctx.dpr||1)),2600),key=cw+'/'+(im.naturalWidth||0);
  if(S.fromKey!==key&&im.naturalWidth){var c=document.createElement('canvas');c.width=cw;c.height=Math.round(cw*im.naturalHeight/im.naturalWidth);
    c.getContext('2d').drawImage(im,0,0,c.width,c.height);S.fromArt=c;S.fromKey=key;}
  g.drawImage(S.fromArt||im,r.x,r.y,r.w,r.h);}
// same geometry as t-medieval's rest(): virtual candle path, glint centre half-way to the panel's heart, 'screen' through t_glint.webp
function glint(g,ctx,S,r,t,lit){var m=S.glMask;if(!m||!m.naturalWidth)return;var now=S.glT0+t,a=.4*(.86+.08*Math.sin(now*8.3)+.05*Math.sin(now*13.1+2)+.03*Math.sin(now*21.7))*Math.pow(lit,1.3);
  if(a<=.002)return;var vx=r.x+r.w*(.5+.42*Math.sin(now*.23)),vy=r.y+r.h*(.78+.1*Math.sin(now*.31+1)),ex=r.x+r.w/2,ey=r.y+r.h*.45,gx=(vx+ex)/2,gy=(vy+ey)/2;
  var q=Math.min(ctx.dpr,1.5),w=Math.min(Math.round(r.w*q),1100),h=Math.round(w*r.h/r.w);
  if(!S.gl||S.gl.width!==w||S.gl.height!==h){S.gl=document.createElement('canvas');S.gl.width=w;S.gl.height=h;S.glCtx=S.gl.getContext('2d');}
  var c=S.gl,gg=S.glCtx,kx=w/r.w,ky=h/r.h;gg.setTransform(1,0,0,1,0,0);gg.globalCompositeOperation='source-over';gg.clearRect(0,0,w,h);
  var px=(gx-r.x)*kx,py=(gy-r.y)*ky,R=r.w*.55*kx,gr=gg.createRadialGradient(px,py,0,px,py,R);
  gr.addColorStop(0,'rgba(255,238,196,1)');gr.addColorStop(.18,'rgba(255,220,150,.75)');gr.addColorStop(.5,'rgba(255,196,110,.25)');gr.addColorStop(1,'rgba(255,190,100,0)');
  gg.fillStyle=gr;gg.fillRect(0,0,w,h);gg.globalCompositeOperation='destination-in';gg.drawImage(m,0,0,w,h);
  g.save();g.globalCompositeOperation='screen';g.globalAlpha=a;g.drawImage(c,r.x,r.y,r.w,r.h);g.restore();}
function candleLit(t,S){var n=S.cand.length,lit=0;for(var i=0;i<n;i++){var k=S.outOrder.indexOf(i);lit+=1-sm(seg(t,T.out[k],T.out[k]+.3));}return lit/n;}
function candles(g,ctx,S,t,fr,W,H,L,gone){var fin=sm(seg(t,T.candIn[0],T.candIn[1]))*(gone==null?1:gone);if(fin<=0)return;var fp=fr.fp||0,sc=W<=560?.62:1;
  var base=Math.min(H-(W<=560?96:74),fr.y+fr.h+fp+(W<=560?40:56)),span=Math.min(fr.w+2*fp,W-40);
  S.cand.forEach(function(c,i){var k=S.outOrder.indexOf(i),to=T.out[k],x=fr.x+fr.w/2+(c.u-.5)*span,h=(26+26*c.h)*sc,top=base-h;
    var fl=1-sm(seg(t,to,to+.28)),sway=(Math.sin(t*6.3+c.ph)*.7+Math.sin(t*13.7+c.ph*2)*.35)*sc,flick=1+.07*Math.sin(t*9.1+c.ph*3)+.04*Math.sin(t*23+c.ph);
    // the wax, lit by its own flame from above
    var wl=fin*(.25+.75*fl);var gr=g.createLinearGradient(0,top,0,base);gr.addColorStop(0,'rgba(236,222,190,'+(.9*wl).toFixed(3)+')');gr.addColorStop(1,'rgba(120,98,70,'+(.55*wl).toFixed(3)+')');
    g.fillStyle=gr;g.fillRect(x-2.6*sc,top,5.2*sc,h);
    g.fillStyle='rgba(30,20,12,'+(.8*fin).toFixed(3)+')';g.fillRect(x-.5,top-3*sc,1,3*sc);
    if(fl>0){var a=fin*fl,fh=12*sc*flick*(.4+.6*fl);g.save();g.globalCompositeOperation='lighter';
      var gl=g.createRadialGradient(x,top-6*sc,0,x,top-6*sc,70*sc);gl.addColorStop(0,'rgba(255,176,90,'+(.2*a).toFixed(3)+')');gl.addColorStop(1,'rgba(255,150,60,0)');
      g.fillStyle=gl;g.fillRect(x-70*sc,top-76*sc,140*sc,140*sc);
      g.translate(x+sway*(1-fl*.3),top-2*sc);var fg=g.createRadialGradient(0,-fh*.35,0,0,-fh*.35,fh*.7);
      fg.addColorStop(0,'rgba(255,250,228,'+a.toFixed(3)+')');fg.addColorStop(.45,'rgba(255,196,96,'+(.85*a).toFixed(3)+')');fg.addColorStop(1,'rgba(220,90,30,0)');
      g.fillStyle=fg;g.beginPath();g.moveTo(0,-fh);g.bezierCurveTo(3.4*sc,-fh*.45,3.2*sc,0,0,0);g.bezierCurveTo(-3.2*sc,0,-3.4*sc,-fh*.45,0,-fh);g.fill();g.restore();}
    // a thread of smoke after it goes out
    var sm_=seg(t,to+.12,to+1.5);if(sm_>0&&sm_<1){g.save();g.strokeStyle='rgba(190,180,168,'+(.28*Math.sin(sm_*Math.PI)*fin).toFixed(3)+')';g.lineWidth=1;g.beginPath();
      for(var j=0;j<=14;j++){var v=j/14,yy=top-3*sc-v*50*sc*(.3+sm_),xx=x+Math.sin(v*5+sm_*4+c.ph)*4*sc*v;if(j)g.lineTo(xx,yy);else g.moveTo(xx,yy);}g.stroke();g.restore();}
  });}
function lines(g,G,t,vp,dpr){var out=seg(t,T.linesOut[0],T.linesOut[1]);g.save();g.lineCap='round';
  for(var i=0;i<16;i++){var order=[0,8,4,12,2,10,6,14,1,9,5,13,3,11,7,15].indexOf(i),t0=T.lines[0]+order*.09,f=eo(seg(t,t0,t0+.75));if(f<=0)continue;
    var E=rayEnd(G,i,G.VP),dx=vp[0]-E[0],dy=vp[1]-E[1],n=Math.hypot(dx,dy);
    // from the edge towards the point; when they go out they retract from the point back to the edge
    var reach=f*(1-eio(out)),hx=E[0]+dx*reach,hy=E[1]+dy*reach,st0=E;
    // the far 12 % near the point fades so the point itself stays dark for the light
    var gr=g.createLinearGradient(E[0],E[1],vp[0],vp[1]);var base=.5*(1-.5*out);
    gr.addColorStop(0,'rgba(214,184,128,'+(base*.45).toFixed(3)+')');gr.addColorStop(.7,'rgba(226,196,140,'+base.toFixed(3)+')');gr.addColorStop(.93,'rgba(236,210,160,'+(base*.5).toFixed(3)+')');gr.addColorStop(1,'rgba(236,210,160,0)');
    g.strokeStyle=gr;g.lineWidth=dpr>1?.8:1;g.beginPath();g.moveTo(st0[0],st0[1]);g.lineTo(hx,hy);g.stroke();
    // the running head
    if(f<1&&out===0){var ha=(1-f)*.9*sm(seg(t,t0,t0+.2));var hg=g.createRadialGradient(hx,hy,0,hx,hy,6);hg.addColorStop(0,'rgba(255,236,196,'+ha.toFixed(3)+')');hg.addColorStop(1,'rgba(255,220,160,0)');
      g.globalCompositeOperation='lighter';g.fillStyle=hg;g.fillRect(hx-6,hy-6,12,12);g.globalCompositeOperation='source-over';}}
  g.restore();}
function sliver(g,G,t,cam,vp){var ce=seg(t,T.crack[0],T.crack[1]);if(ce<=0)return;var fade=1-sm(seg(t,T.sliverOut[0],T.sliverOut[1]));if(fade<=0)return;
  var fr=G.fr,fp=fr.fp||0,full=fr.h+2*fp;
  // height: the crack runs out from the middle, then the column of light shrinks to the point, then to a finger's thickness
  var h=full*eo(ce);var s1=seg(t,T.shrink[0],T.shrink[1]);h=lerp(h,Math.min(full,G.H*.2),eio(s1));
  var s2=eio(seg(t,T.adam[0]+.4,T.last[1]));h=lerp(h,26*cam.s,s2);
  var x=vp[0],y=vp[1];
  var bright=(t<T.split[1]?1:lerp(1,.85,sm(seg(t,T.split[1],T.lines[0]))))*fade;
  var gw=Math.max(6,Math.min(16,h*.35));
  g.save();g.globalCompositeOperation='lighter';
  // soft elliptical glow
  g.save();g.translate(x,y);g.scale(gw,h*.62);var gr=g.createRadialGradient(0,0,0,0,0,1);gr.addColorStop(0,'rgba(255,214,140,'+(.3*bright).toFixed(3)+')');gr.addColorStop(1,'rgba(255,200,120,0)');
  g.fillStyle=gr;g.beginPath();g.arc(0,0,1,0,Math.PI*2);g.fill();g.restore();
  // the thread itself, tapered at both ends
  var lg=g.createLinearGradient(0,y-h/2,0,y+h/2);lg.addColorStop(0,'rgba(255,240,205,0)');lg.addColorStop(.2,'rgba(255,240,205,'+(.85*bright).toFixed(3)+')');
  lg.addColorStop(.8,'rgba(255,240,205,'+(.85*bright).toFixed(3)+')');lg.addColorStop(1,'rgba(255,240,205,0)');
  g.fillStyle=lg;var cw=G.mob?1.2:1.5;g.fillRect(x-cw/2,y-h/2,cw,h);
  g.restore();}
})();

;
/* 巴洛克 · 光落在谁身上 — the passage from the Creation of Adam (renaissance) into Caravaggio's Calling of Saint Matthew.
   Beats (seconds of D, see T): the chapel wall and the fresco go dark until only Adam's languid hand is lit · the hand turns over
   (horizontal flip), its skin darkens, it slides right and changes shape (control-point morph) into Christ's calling hand, landing
   where it is in Caravaggio's picture · a hard-edged, dusty beam opens from a "window" at the top right of the screen, first across
   the vertical room title, then swings down along the wall into the picture — it continues the painting's own light (cut/layers.json
   light.beam) · figures come up only where the light reaches: the boy's face, the feathered hat, the counting hands (coins glint while
   they are counted; the glints stop the instant the light reaches the table), last the bearded man's hand and face (Matthew,
   traditional reading) · the painting's lit surfaces, then the rest of the picture and the wall come up; the label appears from the
   light's lower edge · hand-over. Outside the light: pure black. Rest: dust motes drifting in the beam (overlay layer, 'screen').
   Layers: renaissance/t_hA.webp (Adam's hand), cut/hand.webp (Christ's hand), cut/<figure>.webp reveal cut-outs (from main.webp,
   pixel-identical), cut/dark.webp (the picture clipped to near-black), cut/lit.webp (where the picture itself is lit; optional). */
(function(){
'use strict';
var D=20,PW=2400,PH=2267;
var T={dark:[0.5,2.9],pool:[1.0,2.7],handIn:[0.5,1.3],ink:2.2,
  flip:[3.1,4.5],lift:[3.0,4.6],tan:[3.6,5.0],slide:[4.4,7.4],morph:[4.6,7.0],swap:[5.5,6.9],
  win:[7.5,8.4],shutter:[7.9,9.0],title:7.6,sweep:[9.2,11.2],
  band:[10.2,11.0],
  boy:[10.9,11.7],hat:[11.5,12.4],coins:[11.3,12.9],table:[12.9,13.3],mHand:[13.8,14.7],mFace:[14.3,15.3],
  lit:[15.3,16.8],label:[15.5,18.0],rem:[16.4,19.2],wall:[16.4,19.2],shadeOut:[16.6,18.6],hazeOut:[16.6,19.0],settle:[16.0,19.0]};
// cut/layers.json (the cut-out agent's measurements, main.webp px) — copied here, the module can't read JSON at runtime
var CH={file:'cut/hand.webp',x:1543,y:900,w:279,h:136};
var PTS={
  christ:{indexTip:[1551.2,920.7],indexDIP:[1570,916.9],indexPIP:[1592.5,913.8],indexMCP:[1622.5,910.1],middleMCP:[1631.2,923.8],wrist:[1701.2,920.1],
    wristTop:[1696.2,906.9],wristBottom:[1706.2,933.8],thumbBase:[1662.5,930.1],thumbTip:[1620,958.2],middleTip:[1600,967.6],ringTip:[1568.1,987.6],littleTip:[1555,986.3],forearm:[1787.5,965.7]},
  adam:{indexTip:[657,194],indexDIP:[600,156],indexPIP:[529,116],indexMCP:[443,86],middleMCP:[452,125],wrist:[253,88],wristTop:[214,29],wristBottom:[293,146],
    thumbBase:[340,168],thumbTip:[503,243],middleTip:[611,250],ringTip:[571,252],littleTip:[540,236],forearm:[70,190]}};
var SIM=[0.38025,-0.03385,1543.97625,0.03385,0.38025,868.35805];     // mirrored t_hA px (u' = 683 - u) → baroque main px
var HA={w:683,h:374,A:[0.34966360319486034,0.014752610254084185,-0.014752610254084185,0.34966360319486034,681.0142862081509,342.35128916319405],by:230};   // t_hA → Sistine px (t-renaissance HAND)
var FW=2400;                                                         // Sistine main.webp width
var REVEAL=[{id:'boyFace',x:1074,y:1014,w:76,h:139,t:'boy'},{id:'hat',x:951,y:901,w:233,h:153,t:'hat'},{id:'countHands',x:537,y:1359,w:180,h:144,t:'table'},
  {id:'beardHand',x:741,y:1180,w:173,h:84,t:'mHand'},{id:'beardFace',x:689,y:966,w:136,h:228,t:'mFace'}];
var BEAM={u0:[2400,40],u1:[0,820],l0:[2400,780],l1:[0,1860]};       // light.beam: the painting's own light, upper and lower edge
var COINS=[[661,1468,1.0,0.0],[690,1471,.8,1.7],[700,1486,.9,3.1],[645,1478,.7,4.4],[666,1484,.6,2.3]];   // rims that catch the light (x, y, size, phase)
var WARM='255,238,206';

function clamp(x){return x<0?0:x>1?1:x;}
function seg(t,a){return clamp((t-a[0])/(a[1]-a[0]));}
function lerp(a,b,u){return a+(b-a)*u;}
function eo(x){x=clamp(x);return 1-Math.pow(1-x,3);}
function eio(x){x=clamp(x);return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;}
function sm(x){x=clamp(x);return x*x*(3-2*x);}
function hex(c){var m=String(c||'').trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);if(!m)return[0,0,0];var h=m[1];if(h.length===3)h=h.replace(/./g,'$&$&');var n=parseInt(h,16);return[(n>>16)&255,(n>>8)&255,n&255];}
function mixc(a,b,u){return 'rgb('+[0,1,2].map(function(i){return Math.round(lerp(a[i],b[i],u));}).join(',')+')';}
function cv(w,h){var c=document.createElement('canvas');c.width=Math.max(1,Math.round(w));c.height=Math.max(1,Math.round(h));return c;}
function ok(im){return im&&(im.naturalWidth||im.width)>0;}

// ---------------------------------------------------------------- affine helpers: m = [a,b,c,d,e,f] (canvas order: x' = a x + c y + e, y' = b x + d y + f)
function mul(m,n){return[m[0]*n[0]+m[2]*n[1],m[1]*n[0]+m[3]*n[1],m[0]*n[2]+m[2]*n[3],m[1]*n[2]+m[3]*n[3],m[0]*n[4]+m[2]*n[5]+m[4],m[1]*n[4]+m[3]*n[5]+m[5]];}
function inv(m){var det=m[0]*m[3]-m[1]*m[2];return[m[3]/det,-m[1]/det,-m[2]/det,m[0]/det,(m[2]*m[5]-m[3]*m[4])/det,(m[1]*m[4]-m[0]*m[5])/det];}
function ap(m,p){return[m[0]*p[0]+m[2]*p[1]+m[4],m[1]*p[0]+m[3]*p[1]+m[5]];}
function tr(x,y){return[1,0,0,1,x,y];}
function sc(x,y){return[x,0,0,y,0,0];}
// the affine map taking triangle s (3 points) onto triangle d
function triMap(s,d){var x0=s[0][0],y0=s[0][1],x1=s[1][0]-x0,y1=s[1][1]-y0,x2=s[2][0]-x0,y2=s[2][1]-y0,det=x1*y2-x2*y1;if(Math.abs(det)<1e-9)return null;
  var u1=d[1][0]-d[0][0],v1=d[1][1]-d[0][1],u2=d[2][0]-d[0][0],v2=d[2][1]-d[0][1];
  var a=(u1*y2-u2*y1)/det,c=(u2*x1-u1*x2)/det,b=(v1*y2-v2*y1)/det,dd=(v2*x1-v1*x2)/det;return[a,b,c,dd,d[0][0]-a*x0-c*y0,d[0][1]-b*x0-dd*y0];}
// Bowyer–Watson on a handful of points (run once in init)
function delaunay(P){var big=1e5,pts=P.concat([[-big,-big],[big,-big],[0,big]]),n=P.length,tris=[[n,n+1,n+2]];
  function cc(t){var a=pts[t[0]],b=pts[t[1]],c=pts[t[2]],d=2*(a[0]*(b[1]-c[1])+b[0]*(c[1]-a[1])+c[0]*(a[1]-b[1]));
    var ux=((a[0]*a[0]+a[1]*a[1])*(b[1]-c[1])+(b[0]*b[0]+b[1]*b[1])*(c[1]-a[1])+(c[0]*c[0]+c[1]*c[1])*(a[1]-b[1]))/d,
        uy=((a[0]*a[0]+a[1]*a[1])*(c[0]-b[0])+(b[0]*b[0]+b[1]*b[1])*(a[0]-c[0])+(c[0]*c[0]+c[1]*c[1])*(b[0]-a[0]))/d;return[ux,uy,(a[0]-ux)*(a[0]-ux)+(a[1]-uy)*(a[1]-uy)];}
  for(var i=0;i<n;i++){var p=pts[i],bad=[],keep=[];tris.forEach(function(t){var c=t.c||(t.c=cc(t));((p[0]-c[0])*(p[0]-c[0])+(p[1]-c[1])*(p[1]-c[1])<c[2]?bad:keep).push(t);});
    var edges=[];bad.forEach(function(t){[[t[0],t[1]],[t[1],t[2]],[t[2],t[0]]].forEach(function(e){var k=edges.findIndex(function(f){return f[0]===e[1]&&f[1]===e[0]||f[0]===e[0]&&f[1]===e[1];});if(k>=0)edges.splice(k,1);else edges.push(e);});});
    tris=keep.concat(edges.map(function(e){return[e[0],e[1],i];}));}
  return tris.filter(function(t){return t[0]<n&&t[1]<n&&t[2]<n;}).map(function(t){return[t[0],t[1],t[2]];});}

// ---------------------------------------------------------------- the renaissance rest (p = 0): wall, light pool, shadow, fresco, painted cornice
// .wash: radial-gradient(ellipse 70% 60% at centre-of-art, c0, transparent 70%)
function wash(g,W,H,r,light,a){if(a<=0)return;g.save();g.translate(r.x+r.w/2,r.y+r.h/2);g.scale(.7*W,.6*H);
  var gr=g.createRadialGradient(0,0,0,0,0,1);gr.addColorStop(0,light?'rgba(255,255,255,.35)':'rgba(255,244,225,.08)');gr.addColorStop(.7,light?'rgba(255,255,255,0)':'rgba(255,244,225,0)');
  g.globalAlpha=a;g.fillStyle=gr;g.fillRect(-2,-2,4,4);g.restore();}
// .frame.f-none::before box-shadow 0 26px 60px -26px rgba(0,0,0,.6), pre-rendered once (offset trick, device-pixel aligned)
function shadowCache(dpr,r){var ox=0,oy=26,blur=60,spread=-26,M=Math.ceil(1.6*blur+oy+4),X0=r.x-spread-M,Y0=r.y-spread-M,X1=r.x+r.w+spread+M,Y1=r.y+r.h+spread+M;
  var dx=Math.floor(X0*dpr),dy=Math.floor(Y0*dpr),c=cv(Math.ceil(X1*dpr)-dx,Math.ceil(Y1*dpr)-dy),q=c.getContext('2d');q.setTransform(dpr,0,0,dpr,-dx,-dy);
  q.shadowColor='#000';q.shadowBlur=blur*dpr;q.shadowOffsetX=(ox+1e5)*dpr;q.shadowOffsetY=oy*dpr;q.fillStyle='#000';q.fillRect(r.x-spread-1e5,r.y-spread,r.w+2*spread,r.h+2*spread);
  return{c:c,x:dx/dpr,y:dy/dpr,w:c.width/dpr,h:c.height/dpr};}
function drawShadow(g,sh,a){if(!sh||a<=0)return;g.save();g.globalAlpha=a;g.drawImage(sh.c,sh.x,sh.y,sh.w,sh.h);g.restore();}
// like core's paintArt(): the hung work is drawn into a canvas of round(w*dpr) px, then scaled by CSS
function artCanvas(im,r,dpr){var w=Math.min(Math.round(r.w*dpr),2600),h=Math.round(w*(im.naturalHeight||1)/(im.naturalWidth||1)),c=cv(w,h);if(ok(im))c.getContext('2d').drawImage(im,0,0,w,h);return c;}

// ---------------------------------------------------------------- geometry (screen), rebuilt when the size changes
function geo(ctx){var W=ctx.W,H=ctx.H,to=ctx.to.rect,s=to.w/PW,k=[W,H,ctx.dpr,to.x,to.y,to.w,to.h].join('/');var S=ctx.state;if(S.G&&S.G.key===k)return S.G;
  var G={key:k,W:W,H:H,to:to,s:s};
  function P(p){return[to.x+p[0]*s,to.y+p[1]*s];}
  // the beam on screen continues the painting's own light: its two edges are light.beam's edges, extended to a window just off the right edge
  var su=(BEAM.u1[1]-BEAM.u0[1])/(BEAM.u0[0]-BEAM.u1[0]),sl=(BEAM.l1[1]-BEAM.l0[1])/(BEAM.l0[0]-BEAM.l1[0]);
  var eu=P(BEAM.u0),el=P(BEAM.l0),X=W+14;
  G.su=su;G.sl=sl;G.wu=[X,eu[1]-(X-eu[0])*su];G.wl=[X,el[1]-(X-el[0])*sl];
  G.pv=[X,(G.wu[1]+G.wl[1])/2];G.L=(W+H)*2;
  // the sweep starts aimed at the vertical title (its centre), and swings down to the painting's own angle
  var tc=[W*.14,H*.35],e=document.getElementById('era'+ctx.to.idx),h1=e&&e.querySelector('h1');if(h1){var b=h1.getBoundingClientRect();if(b.width)tc=[b.left+b.width*.5,b.top+b.height*.5];}
  var mid=(su+sl)/2,a1=Math.atan2(mid,1),aT=Math.atan2(tc[1]-G.pv[1],G.pv[0]-tc[0]);G.d0=Math.max(0,Math.min(.6,a1-aT));   // > 0 turns the beam up (towards the title)
  // hand: Adam's (renaissance, p = 0) → Christ's (baroque, p = 1). World = baroque main px.
  var fr=ctx.from?ctx.from.rect:{x:W*.3,y:H*.3,w:W*.4,h:W*.4*1089/2400},fs=fr.w/FW;
  var S0=mul([fs,0,0,fs,fr.x,fr.y],mul(HA.A,tr(0,HA.by)));          // t_hA px → screen at p = 0
  var MIR=[-1,0,0,1,HA.w,0],SM=[SIM[0],SIM[3],SIM[1],SIM[4],SIM[2],SIM[5]];
  G.A2W=mul(SM,MIR);G.W2A=inv(G.A2W);G.X0=mul(S0,G.W2A);           // world → screen at p = 0 (a reflection)
  G.Xf=[s,0,0,s,to.x,to.y];
  G.hc=ap(G.X0,[1640,935]);G.S0=S0;
  G.P=P;G.rect=to;return(S.G=G);}

// the beam polygon on screen for sweep angle d and shutter opening o (0 = a hairline at the upper edge, 1 = the full wedge)
function beamPoly(G,d,o){var L=G.L,u=G.wu,l=[G.wl[0],lerp(G.wu[1]+1,G.wl[1],o)],sl=lerp(G.su+.004,G.sl,o);
  var pts=[u,[u[0]-L,u[1]+L*G.su],[l[0]-L,l[1]+L*sl],l];if(!d)return pts;var c=Math.cos(d),s=Math.sin(d),pv=G.pv;
  return pts.map(function(p){var x=p[0]-pv[0],y=p[1]-pv[1];return[pv[0]+x*c-y*s,pv[1]+x*s+y*c];});}
function polyPath(g,pts){g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(var i=1;i<pts.length;i++)g.lineTo(pts[i][0],pts[i][1]);g.closePath();}
// lower edge of the (settled) beam as point + unit normal pointing away from the light
function lowerEdge(G){var p=G.wl,dx=-1,dy=G.sl,n=Math.hypot(dx,dy);dx/=n;dy/=n;return{p:p,n:[-dy,dx][1]>0?[-dy,dx]:[dy,-dx]};}

// ---------------------------------------------------------------- the beam texture: haze + faint rays + the window's transom shadow (at half resolution; edges come from the clip)
function beamTex(G,dpr){var q=.5,M=[G.W*.35,G.H*.7],c=cv((G.W+M[0])*q,(G.H+M[1]*2)*q),g=c.getContext('2d'),ox=M[0],oy=M[1];
  g.scale(q,q);g.translate(ox,oy);var pv=G.pv,pts=beamPoly(G,0,1);
  var R=Math.hypot(G.W,G.H)*1.3,gr=g.createRadialGradient(pv[0],pv[1],0,pv[0],pv[1],R);
  gr.addColorStop(0,'rgba('+WARM+',.46)');gr.addColorStop(.18,'rgba('+WARM+',.30)');gr.addColorStop(.55,'rgba('+WARM+',.18)');gr.addColorStop(1,'rgba('+WARM+',.09)');
  g.save();polyPath(g,pts.map(function(p){return[p[0],p[1]];}));g.fillStyle=gr;g.fill();g.clip();
  // rays: thin wedges from the window, a little brighter or darker than the haze
  var r=EH.util.rng(11),a0=Math.atan2(G.su,1),a1=Math.atan2(G.sl,1);g.globalCompositeOperation='lighter';
  for(var i=0;i<34;i++){var a=lerp(a0,a1,r()),w=.002+r()*.012,al=.01+r()*.035;g.fillStyle='rgba('+WARM+','+al.toFixed(3)+')';g.beginPath();g.moveTo(pv[0],pv[1]);
    g.lineTo(pv[0]-R*Math.cos(a-w),pv[1]+R*Math.sin(a-w));g.lineTo(pv[0]-R*Math.cos(a+w),pv[1]+R*Math.sin(a+w));g.closePath();g.fill();}
  // the window's transom: one darker band inside the beam, hard like the edges
  g.globalCompositeOperation='destination-out';var at=lerp(a0,a1,.36),wt=(a1-a0)*.035;g.fillStyle='rgba(0,0,0,.42)';g.beginPath();
  g.moveTo(pv[0],pv[1]);g.lineTo(pv[0]-R*Math.cos(at-wt),pv[1]+R*Math.sin(at-wt));g.lineTo(pv[0]-R*Math.cos(at+wt),pv[1]+R*Math.sin(at+wt));g.closePath();g.fill();
  g.restore();return{c:c,x:-ox,y:-oy,w:c.width/q,h:c.height/q};}
function dotSprite(){var c=cv(24,24),g=c.getContext('2d'),gr=g.createRadialGradient(12,12,0,12,12,12);gr.addColorStop(0,'rgba(255,248,232,1)');gr.addColorStop(.35,'rgba(255,240,215,.5)');gr.addColorStop(1,'rgba(255,240,215,0)');g.fillStyle=gr;g.fillRect(0,0,24,24);return c;}
function motes(n){var r=EH.util.rng(29),M=[];for(var i=0;i<n;i++)M.push({x:r(),y:r(),z:.4+r()*.9,vx:(r()-.5)*.006,vy:.002+r()*.006,ax:6+r()*14,ay:4+r()*10,w:.08+r()*.22,ph:r()*6.28,tw:.3+r()*.9});return M;}

// draw the beam (texture + motes + window bloom) on a 'screen' layer context g. o: {d, open, I, tau, cutRect, cutK, readRect}
function drawBeam(g,G,B,o){var I=o.I;if(I<=0.001)return;var pts=beamPoly(G,o.d,o.open);
  g.save();polyPath(g,pts);g.clip();
  if(o.d){var pv=G.pv;g.translate(pv[0],pv[1]);g.rotate(o.d);g.translate(-pv[0],-pv[1]);}
  g.globalAlpha=I;g.drawImage(B.tex.c,B.tex.x,B.tex.y,B.tex.w,B.tex.h);
  // dust: slow drift and a gentle glitter as a mote turns in the light; positions are a pure function of tau
  var t=o.tau,W=G.W,H=G.H,M=B.motes,sp=B.dot;
  for(var i=0;i<M.length;i++){var m=M[i],x=((m.x+m.vx*t)%1+1)%1,y=((m.y+m.vy*t)%1+1)%1;x=x*(W*1.1)-W*.05+Math.sin(t*m.w+m.ph)*m.ax;y=y*(H*1.1)-H*.05+Math.cos(t*m.w*.8+m.ph)*m.ay;
    var near=.45+.55*clamp(x/W),gl=.35+.65*Math.pow(.5+.5*Math.sin(t*m.tw+m.ph*2),3),sz=m.z*2.6;g.globalAlpha=I*near*gl*.9;g.drawImage(sp,x-sz,y-sz,sz*2,sz*2);}
  g.restore();
  // the window's bloom, at the source (mostly off-screen)
  var wy=(G.wu[1]+G.wl[1])/2,wr=Math.max(60,(G.wl[1]-G.wu[1])*.9)*(.4+.6*o.open);g.save();g.translate(G.W+4,wy);g.scale(.55,1);
  var gr=g.createRadialGradient(0,0,0,0,0,wr);gr.addColorStop(0,'rgba('+WARM+','+(.55*I).toFixed(3)+')');gr.addColorStop(1,'rgba('+WARM+',0)');g.fillStyle=gr;g.fillRect(-wr,-wr,2*wr,2*wr);g.restore();
  // the hung work keeps its own painted light: the haze leaves the frame (always in rest); nothing inside the reading panel
  if(o.cutK>0){g.save();g.globalCompositeOperation='destination-out';g.globalAlpha=o.cutK;var r=o.cutRect;g.fillRect(r.x,r.y,r.w,r.h);g.restore();}
  if(o.readRect){var R=o.readRect;g.clearRect(R.x,R.y,R.w,R.h);}}

// ---------------------------------------------------------------- shared rest extras for the NEXT room's p = 0 (draws the beam as 'screen' on g)
var SHR={};
function restBeamParams(t){return{d:0,open:1,I:.5,tau:t};}
window.EH_SHARED=window.EH_SHARED||{};
window.EH_SHARED.baroqueRest=function(g,o){var fake={W:o.W,H:o.H,dpr:o.dpr||1,to:{rect:o.rect,idx:4},from:null,state:SHR};var G=geo(fake);
  if(!SHR.B||SHR.B.key!==G.key)SHR.B={key:G.key,tex:beamTex(G,o.dpr||1),dot:dotSprite(),motes:motes(motesFor(G))};
  var q=restBeamParams(o.t==null?D:o.t);q.cutK=1;q.cutRect=o.rect;g.save();g.globalCompositeOperation='screen';drawBeam(g,G,SHR.B,q);g.restore();};
function motesFor(G){return Math.round(Math.max(60,Math.min(170,G.W*G.H/7000)));}

// ---------------------------------------------------------------- the hand: morph mesh (world = baroque main px)
function buildMesh(S,G){var names=Object.keys(PTS.christ),A=[],C=[],sa=[],scs=[];
  names.forEach(function(k){var a=PTS.adam[k],c=PTS.christ[k];if(!a||!c)return;A.push(ap(G.A2W,a));C.push(c.slice());sa.push(a.slice());scs.push([c[0]-CH.x,c[1]-CH.y]);});
  // a ring of fixed points around both hands, so the whole of both layers is covered by triangles
  var xs=[],ys=[];[[0,0],[HA.w,0],[HA.w,HA.h],[0,HA.h]].forEach(function(p){var w=ap(G.A2W,p);xs.push(w[0]);ys.push(w[1]);});
  [[CH.x,CH.y],[CH.x+CH.w,CH.y+CH.h]].forEach(function(p){xs.push(p[0]);ys.push(p[1]);});
  var x0=Math.min.apply(0,xs)-30,x1=Math.max.apply(0,xs)+30,y0=Math.min.apply(0,ys)-30,y1=Math.max.apply(0,ys)+30;
  for(var i=0;i<=2;i++){[[lerp(x0,x1,i/2),y0],[lerp(x0,x1,i/2),y1]].forEach(function(w){A.push(w);C.push(w);sa.push(ap(G.W2A,w));scs.push([w[0]-CH.x,w[1]-CH.y]);});}
  for(var j=1;j<2;j++){[[x0,lerp(y0,y1,j/2)],[x1,lerp(y0,y1,j/2)]].forEach(function(w){A.push(w);C.push(w);sa.push(ap(G.W2A,w));scs.push([w[0]-CH.x,w[1]-CH.y]);});}
  var mid=A.map(function(a,i){return[(a[0]+C[i][0])/2,(a[1]+C[i][1])/2];});
  S.mesh={A:A,C:C,sa:sa,sc:scs,tri:delaunay(mid)};}
// warp one layer through the mesh into an offscreen canvas (device px of the screen bbox); returns false if it didn't fit
function warp(q,img,src,dst,tris,off){q.setTransform(1,0,0,1,0,0);q.clearRect(0,0,q.canvas.width,q.canvas.height);
  for(var i=0;i<tris.length;i++){var t=tris[i],s=[src[t[0]],src[t[1]],src[t[2]]],d=[dst[t[0]],dst[t[1]],dst[t[2]]].map(function(p){return[(p[0]-off.x)*off.k,(p[1]-off.y)*off.k];});
    var m=triMap(s,d);if(!m)continue;
    // grow the clip triangle by ~0.8 px so neighbours overlap (no hairlines)
    var cx=(d[0][0]+d[1][0]+d[2][0])/3,cy=(d[0][1]+d[1][1]+d[2][1])/3;q.save();q.beginPath();
    d.forEach(function(p,k){var dx=p[0]-cx,dy=p[1]-cy,n=Math.hypot(dx,dy)||1,x=p[0]+dx/n*.8,y=p[1]+dy/n*.8;if(k)q.lineTo(x,y);else q.moveTo(x,y);});q.closePath();q.clip();
    q.setTransform(m[0],m[1],m[2],m[3],m[4],m[5]);var iw=img.width,ih=img.height,sx=Math.max(0,Math.floor(Math.min(s[0][0],s[1][0],s[2][0]))-2),sy=Math.max(0,Math.floor(Math.min(s[0][1],s[1][1],s[2][1]))-2),
      sx2=Math.min(iw,Math.ceil(Math.max(s[0][0],s[1][0],s[2][0]))+2),sy2=Math.min(ih,Math.ceil(Math.max(s[0][1],s[1][1],s[2][1]))+2);
    if(sx2>sx&&sy2>sy)q.drawImage(img,sx,sy,sx2-sx,sy2-sy,sx,sy,sx2-sx,sy2-sy);q.restore();}}
// the hand's screen pose: world → screen affine at time t
function handPose(t,G){var X=G.X0,hc=G.hc;
  var u=eio(seg(t,T.flip)),k=1+.45*eio(seg(t,T.lift)),lift=[G.W*.012*eio(seg(t,T.lift)),-G.H*.02*eio(seg(t,T.lift))];
  var sx=Math.cos(Math.PI*u),sy=1+.07*Math.sin(Math.PI*u);
  var M=mul(tr(hc[0]+lift[0],hc[1]+lift[1]),mul(sc(sx*k,sy*k),tr(-hc[0],-hc[1])));var X1=mul(M,X);
  var v=eio(seg(t,T.slide));if(v<=0)return{X:X1,u:u};
  // X1 (after the flip) and Xf are both proper similarities: interpolate scale (log), angle, and the screen position of the hand's centre
  var F=mul(tr(hc[0]+lift[0],hc[1]+lift[1]),mul(sc(-k,k),tr(-hc[0],-hc[1])));var Y=mul(F,X),Z=G.Xf,c=[1640,935];
  var s1=Math.hypot(Y[0],Y[1]),s2=Math.hypot(Z[0],Z[1]),a1=Math.atan2(Y[1],Y[0]),a2=Math.atan2(Z[1],Z[0]);var da=a2-a1;while(da>Math.PI)da-=2*Math.PI;while(da<-Math.PI)da+=2*Math.PI;
  var s=Math.exp(lerp(Math.log(s1),Math.log(s2),v)),a=a1+da*v,p1=ap(Y,c),p2=ap(Z,c);
  // an arc: the hand rises a little as it travels right
  var arc=-Math.sin(Math.PI*v)*G.H*.03,p=[lerp(p1[0],p2[0],v),lerp(p1[1],p2[1],v)+arc],cs=Math.cos(a)*s,sn=Math.sin(a)*s;
  var R=[cs,sn,-sn,cs,0,0],q=ap(R,c);R[4]=p[0]-q[0];R[5]=p[1]-q[1];return{X:R,u:1};}

var MOD={
  duration:D,
  assets:['cut/hand.webp','cut/dark.webp','cut/lit.webp'].concat(REVEAL.map(function(r){return 'cut/'+r.id+'.webp';})),
  fromAssets:['t_hA.webp'],
  init:function(ctx){var S=ctx.state,dpr=ctx.dpr||1;S.hA=ctx.fromAsset('t_hA.webp');S.hC=ctx.asset('cut/hand.webp');S.dark=ctx.asset('cut/dark.webp');S.lit=ctx.asset('cut/lit.webp');
    S.rev=REVEAL.map(function(r){return{r:r,im:ctx.asset('cut/'+r.id+'.webp')};});
    // Adam's hand with the forearm faded out beyond the wrist (so the lone hand has no cut edge); the same for Christ's sleeve
    function fade(im,w,h,p0,p1){var c=cv(w,h),g=c.getContext('2d');if(ok(im))g.drawImage(im,0,0,w,h);g.globalCompositeOperation='destination-out';
      var gr=g.createLinearGradient(p0[0],p0[1],p1[0],p1[1]);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(0,0,0,1)');g.fillStyle=gr;g.fillRect(0,0,w,h);return c;}
    var A=PTS.adam,C=PTS.christ;
    S.adamF=fade(S.hA,HA.w,HA.h,[A.wrist[0]-10,A.wrist[1]],[A.wrist[0]-150,A.wrist[1]+70]);
    S.chF=fade(S.hC,CH.w,CH.h,[C.wrist[0]-CH.x+22,C.wrist[1]-CH.y],[C.forearm[0]-CH.x+30,C.forearm[1]-CH.y+10]);
    // offscreen canvases for the morph (two layers, composited)
    S.oA=cv(900,900);S.qA=S.oA.getContext('2d');S.oC=cv(900,900);S.qC=S.oC.getContext('2d');
    S.dot=dotSprite();S.MK=null;S.caches=null;
    S.litOK=ok(S.lit);S.darkOK=ok(S.dark);
    ensure(ctx,S);warmUp(ctx,S);},
  draw:function(p,ctx){var g=ctx.g,S=ctx.state,W=ctx.W,H=ctx.H,t=p*D,to=ctx.to.rect,fr=ctx.from?ctx.from.rect:null;var G=geo(ctx);ensure(ctx,S);var C=S.caches;
    var toWall=hex(ctx.to.wall);
    // ===== DOM: ink/wall of the new room once the old title has faded (light text on the dark passage); title under the shade layer; label placed where the core will hang it
    var warm=S.warm;if(!warm){
    var ink=t<T.ink?(ctx.from?ctx.from.ink:'light'):(t<D-.05?'light':ctx.to.ink);if(S.inkNow!==ink){ctx.ui.ink(ink);S.inkNow=ink;}
    var wallCss=t<T.ink&&ctx.from?ctx.from.wall:ctx.to.wall;if(S.wallNow!==wallCss){ctx.ui.wall(wallCss);S.wallNow=wallCss;}
    ctx.ui.title(ctx.to.idx,t>=T.title);var labOn=t>=T.label[0];ctx.ui.label(ctx.to.idx,labOn);if(labOn)placeLabel(ctx);}

    // ===== 1. the renaissance chapel going dark
    var dk=eio(seg(t,T.dark));
    if(fr&&dk<1){g.fillStyle=ctx.from.wall;g.fillRect(0,0,W,H);wash(g,W,H,fr,ctx.from.ink==='dark',1);drawShadow(g,C.shFr,.6);
      g.drawImage(C.fromArt,fr.x,fr.y,fr.w,fr.h);var rr=window.EH_SHARED&&window.EH_SHARED.renaissanceRest;if(rr){try{rr(g,{W:W,H:H,rect:fr,dpr:ctx.dpr,t:0});}catch(e){}}
      // darkness everywhere, lagging around the hand
      var ps=1-eio(seg(t,T.pool)),hr=Math.max(36,fr.w*.06),hc=G.hc,gr=g.createRadialGradient(hc[0],hc[1],0,hc[0],hc[1],hr*2.2);
      [0,.2,.4,.6,.8,1].forEach(function(k){var f=k<.2?0:sm((k-.2)/.8);gr.addColorStop(k,'rgba(0,0,0,'+(dk*(1-ps*(1-f))).toFixed(4)+')');});
      g.fillStyle=gr;g.fillRect(0,0,W,H);
    }else{g.fillStyle='#000';g.fillRect(0,0,W,H);}

    // ===== 3. the beam (overlay layers) and the painting where the light reaches
    var sweep=eio(seg(t,T.sweep)),d=G.d0*(1-sweep),open=eio(seg(t,T.shutter)),Iup=sm(seg(t,T.win)),I=Iup*lerp(1,.5,eio(seg(t,T.settle)));
    function drawHand(){
    // ===== 2. the hand: Adam's, lit alone → turned over, darkened → slid right and reshaped into Christ's
    var hin=sm(seg(t,T.handIn)),landed=t>=T.slide[1];
    if(hin>0&&t<T.rem[1]){
      if(!landed){var pose=handPose(t,G),m=eio(seg(t,T.morph)),M=S.mesh;
        var dst=M.A.map(function(a,i){return ap(pose.X,[lerp(a[0],M.C[i][0],m),lerp(a[1],M.C[i][1],m)]);});
        var bx=1e9,by=1e9,bx2=-1e9,by2=-1e9;dst.forEach(function(q){bx=Math.min(bx,q[0]);by=Math.min(by,q[1]);bx2=Math.max(bx2,q[0]);by2=Math.max(by2,q[1]);});
        bx=Math.floor(bx)-2;by=Math.floor(by)-2;var bw=Math.ceil(bx2)-bx+4,bh=Math.ceil(by2)-by+4,kq=Math.min(ctx.dpr||1,(S.oA.width-2)/Math.max(bw,bh)),off={x:bx,y:by,k:kq};
        var xf=sm(seg(t,T.swap)),aA=1-sm(seg(xf,[.45,1])),aC=sm(seg(xf,[0,.6]));
        // the turning hand: its skin darkens (and dims further while it is edge-on)
        var tan=.5*eio(seg(t,T.tan))+.35*Math.sin(Math.PI*pose.u);
        if(aA>0){if(m<=0){var qa=S.qA;qa.setTransform(1,0,0,1,0,0);qa.clearRect(0,0,S.oA.width,S.oA.height);var XA=mul([kq,0,0,kq,-bx*kq,-by*kq],mul(pose.X,G.A2W));qa.setTransform(XA[0],XA[1],XA[2],XA[3],XA[4],XA[5]);qa.drawImage(S.adamF,0,0);}
          else warp(S.qA,S.adamF,M.sa,dst,M.tri,off);if(tan>0){S.qA.setTransform(1,0,0,1,0,0);S.qA.globalCompositeOperation='source-atop';S.qA.fillStyle='rgba(34,20,10,'+Math.min(.8,tan).toFixed(3)+')';S.qA.fillRect(0,0,bw*kq+2,bh*kq+2);S.qA.globalCompositeOperation='source-over';}
          g.globalAlpha=aA*hin;g.drawImage(S.oA,0,0,bw*kq,bh*kq,bx,by,bw,bh);}
        if(aC>0){warp(S.qC,S.chF,M.sc,dst,M.tri,off);g.globalAlpha=aC;g.drawImage(S.oC,0,0,bw*kq,bh*kq,bx,by,bw,bh);}
        g.globalAlpha=1;
      }else{var fin=1-sm(seg(t,[T.rem[0]+.6,T.rem[1]-.2]));g.globalAlpha=fin;g.drawImage(S.chF,to.x+CH.x*G.s,to.y+CH.y*G.s,CH.w*G.s,CH.h*G.s);g.globalAlpha=1;}
    }

    }
    var mk=C.MK,mq=C.MKq,ks=mk.width/PW;
    if(t>=T.band[0]){
      // inside the picture, the beam first shows only the near-black plate (the air in the light); figures come up one by one
      var ba=sm(seg(t,T.band));mq.setTransform(1,0,0,1,0,0);mq.globalCompositeOperation='source-over';mq.clearRect(0,0,mk.width,mk.height);
      var bp=beamPoly(G,d,open).map(function(q){return[(q[0]-to.x)/G.s,(q[1]-to.y)/G.s];});
      if(S.darkOK&&ba>0){mq.save();mq.setTransform(ks,0,0,ks,0,0);polyPath(mq,bp);mq.clip();mq.globalAlpha=ba;mq.drawImage(S.dark,0,0,PW,PH);mq.restore();}
      // the painting's lit surfaces inside the beam (lit.webp alpha), then everything
      var la=lerp(.2*ba,1,eio(seg(t,T.lit)));if(la>0&&S.litOK){mq.save();mq.setTransform(ks,0,0,ks,0,0);polyPath(mq,bp);mq.clip();mq.globalAlpha=la;mq.globalCompositeOperation='source-over';
        var tmp=C.LT,tq=C.LTq;tq.globalCompositeOperation='source-over';tq.clearRect(0,0,tmp.width,tmp.height);tq.drawImage(S.lit,0,0,tmp.width,tmp.height);tq.globalCompositeOperation='source-in';tq.drawImage(C.art,0,0,tmp.width,tmp.height);
        mq.drawImage(tmp,0,0,PW,PH);mq.restore();}
      g.drawImage(mk,to.x,to.y,to.w,to.h);
    }
    drawHand();
    if(t>=T.band[0]){
      // the figures (cut from main.webp: the same pixels)
      S.rev.forEach(function(R){var r=R.r,tt=T[r.t],a;
        if(r.t==='table'){var h=seg(t,tt);a=h<=0?0:h>=1?1:eo(h);}else a=eo(seg(t,tt));
        if(a<=0||!ok(R.im))return;g.globalAlpha=a;g.drawImage(R.im,to.x+r.x*G.s,to.y+r.y*G.s,r.w*G.s,r.h*G.s);
        // the table beat: the light lands with a short brightening
        if(r.t==='table'){var f=seg(t,[T.table[0],T.table[0]+.9]);if(f>0&&f<1){g.globalCompositeOperation='lighter';g.globalAlpha=.35*Math.sin(Math.PI*Math.pow(f,.5))*(1-f);g.drawImage(R.im,to.x+r.x*G.s,to.y+r.y*G.s,r.w*G.s,r.h*G.s);g.globalCompositeOperation='source-over';}}
        g.globalAlpha=1;});
      // the rest of the picture comes up
      var rem=sm(seg(t,T.rem));if(rem>0){g.globalAlpha=rem;g.drawImage(C.art,to.x,to.y,to.w,to.h);g.globalAlpha=1;}
    }
    // coins glinting in the dark while they are counted; they stop the instant the light reaches the table
    if(t>T.coins[0]&&t<T.coins[1]+.12){var cfade=sm(seg(t,[T.coins[0],T.coins[0]+.6]))*(1-seg(t,[T.coins[1],T.coins[1]+.12]));g.save();g.globalCompositeOperation='lighter';
      COINS.forEach(function(c){var ph=Math.pow(Math.max(0,Math.sin(2*Math.PI*2.4*t+c[3])),5)*cfade;if(ph<=.01)return;var x=to.x+c[0]*G.s,y=to.y+c[1]*G.s,rr=(2.2+3*c[2])*Math.max(.7,G.s*4);
        g.globalAlpha=ph*.9;g.drawImage(S.dot,x-rr,y-rr,2*rr,2*rr);});g.restore();}

    // ===== 4. the wall comes up round the finished picture
    var wu=sm(seg(t,T.wall));if(wu>0){g.save();g.beginPath();g.rect(0,0,W,H);g.rect(to.x,to.y,to.w,to.h);g.clip('evenodd');g.fillStyle=mixc([0,0,0],toWall,wu);g.fillRect(0,0,W,H);
      wash(g,W,H,to,ctx.to.ink==='dark',wu);if(ctx.to.frame==='none')drawShadow(g,C.shTo,.6*wu);g.restore();}
    if(t>=D-1e-6){g.fillStyle=ctx.to.wall;g.fillRect(0,0,W,H);wash(g,W,H,to,ctx.to.ink==='dark',1);if(ctx.to.frame==='none')drawShadow(g,C.shTo,.6);g.drawImage(C.art,to.x,to.y,to.w,to.h);}

    // ===== overlay layers: the beam ('screen', above the wall text) and a shade that keeps the title and label dark outside the light
    var dpr=ctx.dpr||1,bg=warm?warm.g:ctx.layer('beam',{z:9,blend:'screen'}).__g,sg=warm?null:ctx.layer('shade',{z:8}).__g;
    bg.setTransform(dpr,0,0,dpr,0,0);if(!warm)bg.clearRect(0,0,W,H);if(sg){sg.setTransform(dpr,0,0,dpr,0,0);sg.clearRect(0,0,W,H);}
    if(Iup>0)drawBeam(bg,G,C,{d:d,open:open,I:I,tau:t,cutRect:to,cutK:lerp(.8*sm(seg(t,T.band)),1,sm(seg(t,T.hazeOut)))});
    if(sg&&t>=T.title-.05&&t<T.shadeOut[1]){var sa=1-sm(seg(t,T.shadeOut));shade(sg,ctx,G,sa,beamPoly(G,d,open),Iup,t,mixc([0,0,0],toWall,wu));}
  },
  done:function(ctx){ctx.state.restT0=performance.now()/1000;var sl=ctx.layer('shade',{z:8});sl.__g.setTransform(1,0,0,1,0,0);sl.__g.clearRect(0,0,sl.width,sl.height);},
  rest:function(ctx){var S=ctx.state,now=performance.now()/1000;if(S.restT0==null)S.restT0=now;var el=now-S.restT0;
    // the core fades title/label in again from 0 s/0.8 s of rest: they are already on, so keep them on through that window (no dip)
    if(el<1.5&&!ctx.reading){ctx.ui.title(ctx.to.idx,true);ctx.ui.label(ctx.to.idx,true);}
    var G=restGeo(ctx,S,now);var bl=ctx.layer('beam',{z:9,blend:'screen'}),bg=bl.__g,dpr=ctx.dpr||1;bg.setTransform(dpr,0,0,dpr,0,0);bg.clearRect(0,0,ctx.W,ctx.H);
    // reading: the beam steps back (it would cross the panel), nothing inside the panel
    var k=S.rdK||0,dt=Math.min(ctx.dt||0,.1);k+=((ctx.reading?1:0)-k)*Math.min(1,dt*5);S.rdK=k<.002?0:k;
    var q=restBeamParams(D+el);q.I*=1-.85*k;q.cutK=1;q.cutRect=ctx.to.rect;q.readRect=ctx.reading?ctx.readRect:null;drawBeam(bg,G,S.RB,q);}
};
EH.transition('baroque',MOD);
// every draw path is run once on a scratch canvas, one phase per task, so no frame of the passage pays a first-use cost (texture uploads, gradients, clips)
function warmUp(ctx,S){var dpr=ctx.dpr||1,c=cv(ctx.W*dpr,ctx.H*dpr),q=c.getContext('2d'),w=Object.assign({},ctx,{g:q}),P=[.03,.08,.2,.26,.3,.42,.5,.53,.58,.64,.7,.8,.86,.93,.99];
  (function step(){if(!P.length){S.warm=null;return;}var p=P.shift();S.warm={g:q};try{q.setTransform(dpr,0,0,dpr,0,0);MOD.draw(p,w);}catch(e){}S.warm=null;setTimeout(step,20);})();}
// rest: the beam follows the hung work, but its texture is rebuilt at most twice a second (the frame glides when the reading panel opens)
function restGeo(ctx,S,now){var r=ctx.to.rect,k=[ctx.W,ctx.H,ctx.dpr,Math.round(r.x),Math.round(r.y),Math.round(r.w),Math.round(r.h)].join('/');
  if(S.RB&&(S.RB.k===k||now-S.RB.at<.5))return S.RB.G;
  var fake={W:ctx.W,H:ctx.H,dpr:ctx.dpr,to:{rect:{x:r.x,y:r.y,w:r.w,h:r.h},idx:ctx.to.idx},from:ctx.from,state:{}},G=geo(fake);
  S.RB={k:k,at:now,G:G,tex:(S.RB&&S.RB.texKey===ctx.W+'/'+ctx.H&&S.RB.k!==k&&ctx.reading)?S.RB.tex:beamTex(G,ctx.dpr||1),texKey:ctx.W+'/'+ctx.H,dot:S.dot||dotSprite(),motes:motes(motesFor(G))};return G;}

// ---------------------------------------------------------------- caches (built in init, rebuilt only if the size changes)
function ensure(ctx,S){var G=geo(ctx),dpr=ctx.dpr||1,k=G.key;if(S.caches&&S.caches.key===k)return;var C={key:k};
  C.tex=beamTex(G,dpr);C.dot=S.dot||dotSprite();C.motes=motes(motesFor(G));
  C.art=artCanvas(ctx.to.image,G.to,dpr);C.shTo=shadowCache(dpr,G.to);
  if(ctx.from){C.fromArt=artCanvas(ctx.from.image,ctx.from.rect,dpr);C.shFr=shadowCache(dpr,ctx.from.rect);}
  C.MK=cv(C.art.width,C.art.height);C.MKq=C.MK.getContext('2d');C.LT=cv(C.art.width,C.art.height);C.LTq=C.LT.getContext('2d');
  S.caches=C;buildMesh(S,G);
  // first-use costs paid here, not in a frame
  var q=C.MKq;q.drawImage(C.art,0,0);if(ok(S.dark))q.drawImage(S.dark,0,0,8,8);if(ok(S.lit))q.drawImage(S.lit,0,0,8,8);q.clearRect(0,0,C.MK.width,C.MK.height);}

// the label hangs where the core will put it (core hangLabels): right of the frame on wide screens, else under it
function placeLabel(ctx){var l=document.getElementById('lab'+ctx.to.idx);if(!l)return;var r=ctx.to.rect,fp=r.fp||0,f={left:r.x-fp,right:r.x+r.w+fp,bottom:r.y+r.h+fp};
  var W=innerWidth,Hh=innerHeight,wide=W>1180,h=l.offsetHeight,w=l.offsetWidth,g=W<=560?16:36,ft=document.querySelector('.foot'),footTop=ft?ft.getBoundingClientRect().top:Hh-80;
  var land=W<=980&&Hh<520&&W>Hh,x,y;
  if(wide){x=Math.round(f.right+34);y=Math.round(Math.max(64,Math.min(f.bottom-h,footTop-24-h)));}
  else if(land){var eb=document.getElementById('era'+ctx.to.idx);eb=eb?eb.getBoundingClientRect():null;x=Math.round(W*.58+24);y=Math.round((eb?eb.bottom:40)+14);}
  else{x=Math.round(Math.min(Math.max(f.left,g),W-g-w));y=Math.round(f.bottom+16);}
  var xs=x+'px',ys=y+'px';if(l.style.left!==xs)l.style.left=xs;if(l.style.top!==ys)l.style.top=ys;}
// shade layer: black over the title and label boxes except where the light is; the label shows from the beam's lower edge outwards
function shade(g,ctx,G,a,poly,Iup,t,col){if(a<=0)return;var boxes=[];(t>=T.label[0]?['era','lab']:['era']).forEach(function(id){var e=document.getElementById(id+ctx.to.idx);if(!e)return;var b=e.getBoundingClientRect();if(b.width)boxes.push([id,b]);});
  boxes.forEach(function(x){var id=x[0],b=x[1],p=14;g.save();g.beginPath();g.rect(b.left-p,b.top-p,b.width+2*p,b.height+2*p);g.clip();g.globalAlpha=a;g.fillStyle=col||'#000';g.fillRect(b.left-p,b.top-p,b.width+2*p,b.height+2*p);
    g.globalCompositeOperation='destination-out';
    if(id==='era'){g.globalAlpha=Iup;polyPath(g,poly);g.fill();}
    else{var E=lowerEdge(G),far=0;[[b.left,b.top],[b.right,b.top],[b.left,b.bottom],[b.right,b.bottom]].forEach(function(c){far=Math.max(far,(c[0]-E.p[0])*E.n[0]+(c[1]-E.p[1])*E.n[1]);});
      var reach=eio(seg(t,T.label))*(far+60)+1,x0=E.p[0],y0=E.p[1],gr=g.createLinearGradient(x0,y0,x0+E.n[0]*reach,y0+E.n[1]*reach);
      gr.addColorStop(0,'rgba(0,0,0,1)');gr.addColorStop(Math.max(.01,1-50/reach),'rgba(0,0,0,1)');gr.addColorStop(1,'rgba(0,0,0,0)');g.globalAlpha=1;g.fillStyle=gr;g.fillRect(b.left-p,b.top-p,b.width+2*p,b.height+2*p);}
    g.restore();});}
})();

;
/* 洛可可 · 硬光弯成秋千绳 — the passage from Caravaggio's Calling of Saint Matthew (baroque) into Fragonard's The Swing.
   Beats (seconds of D, see _wip/sync/rococo.timeline.md): the baroque room sinks into the dark, only its hard beam stays · the beam
   softens and turns pink · it bends into an S (Hogarth's line of beauty) · the S relaxes into a rope hanging from the top of the screen,
   a second rope is let down beside it · the Caravaggio's right-angled frame, left as a thin gold line, moves to the new place and its
   corners curl into asymmetric rocaille; the gilt fills in · the wall fades to pale pink-green · the dim painting hangs on the two ropes
   and the whole page swings from the top of the screen (≤ ±6°; with prefers-reduced-motion only the swing inside the painting moves) ·
   each swing lights more of it: the woman, the dappled light in the trees, the peeping young man and the old man · at the top of a
   swing her pink slipper leaves the frame, somersaults and lands on the label · the cupid lifts his finger to his lips, the swinging dies
   down and stops in the painting's own position · the ropes are drawn up · hand-over.
   Rest: the rocaille frame (drawn over the plain gilt band of the DOM frame) and a very gentle residual sway of the swing in the painting. */
(function(){
'use strict';
// ------------------------------------------------------------------ rest guards (API.md "Rest hooks"), same helpers as the opening rooms
function rgBegin(ctx){var g=ctx.g,S=ctx.state,R=ctx.reading&&ctx.readRect,r=ctx.to&&ctx.to.rect,k=S.rgK||0,dt=Math.min(ctx.dt||0,.1);
  if(R)S.rgR={x:R.x,y:R.y,w:R.w,h:R.h};k+=((R?1:0)-k)*Math.min(1,dt*6);S.rgK=(!R&&k<.003)?0:(R&&k>.997)?1:k;
  g.save();if((ctx.tool==='era'||ctx.tool==='special')&&r){g.beginPath();g.rect(0,0,ctx.W,ctx.H);g.rect(r.x-1,r.y-1,r.w+2,r.h+2);g.clip('evenodd');}}
function rgEnd(ctx){var g=ctx.g,S=ctx.state,R=S.rgR;if(!(S.rgK>0)||!R){g.restore();return;}
  g.save();g.globalCompositeOperation='destination-out';g.globalAlpha=S.rgK;
  if(R.x>ctx.W*.3){var f=60,x0=R.x-f,gr=g.createLinearGradient(x0,0,R.x,0);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'#000');g.fillStyle=gr;g.fillRect(x0,0,ctx.W-x0+1,ctx.H);}
  else{g.fillStyle='#000';g.fillRect(R.x,R.y,R.w,R.h);}
  g.restore();g.restore();}

// ------------------------------------------------------------------ helpers
function clamp(x){return x<0?0:x>1?1:x;}
function seg(t,a,b){return clamp((t-a)/(b-a));}
function lerp(a,b,u){return a+(b-a)*u;}
function eo(x){x=clamp(x);return 1-Math.pow(1-x,3);}
function ei(x){x=clamp(x);return x*x*x;}
function eio(x){x=clamp(x);return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;}
function sm(x){x=clamp(x);return x*x*(3-2*x);}
function hex(c){c=String(c||'#000').replace('#','');if(c.length===3)c=c.split('').map(function(x){return x+x;}).join('');var n=parseInt(c,16);return[(n>>16)&255,(n>>8)&255,n&255];}
function mix(a,b,u){return[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];}
function css(c,a){return a==null?'rgb('+Math.round(c[0])+','+Math.round(c[1])+','+Math.round(c[2])+')':'rgba('+Math.round(c[0])+','+Math.round(c[1])+','+Math.round(c[2])+','+a.toFixed(3)+')';}
function cv(w,h){var c=document.createElement('canvas');c.width=Math.max(1,Math.round(w));c.height=Math.max(1,Math.round(h));return c;}
var DEG=Math.PI/180;
var SH=window.EH_SHARED=window.EH_SHARED||{};

// ------------------------------------------------------------------ timeline (seconds)
var D=22;
var T={veil:[.35,2.9],line:[.5,2.3],soft:[.4,2.2],pink:[1.9,3.9],bend:[2.0,4.9],rope:[4.3,7.0],rope2:[5.9,7.5],
  wall:[3.0,7.8],move:[3.3,6.4],curl:[5.2,7.6],band:[5.9,7.9],orn:[6.5,8.4],pic:[7.6,8.5],
  swing:8.7,P:3.0,grow:[8.7,12.4],decay:[15.6,20.6],
  revW:[8.9,10.2],revD:[10.4,11.9],revM:[11.9,13.4],revAll:[13.3,16.6],
  fly:1.35,shush:[16.0,16.8],shoeBack:[19.3,20.4],ropesOut:[19.9,21.3],title:20.4};
function extreme(k){return T.swing+T.P/4+k*T.P/2;}          // k-th turning point of the swing (even k: page bottom to the left)

// pale pink-green: the pink light floods the wall first, the celadon settles under it
var PINK=[238,214,212],BLACK=[8,7,6];

// ------------------------------------------------------------------ swing
function reduced(){try{return matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){return false;}}
function envelope(t){if(t<=T.swing)return 0;var g=sm(seg(t,T.grow[0],T.grow[1])),d=1-sm(seg(t,T.decay[0],T.decay[1]));return(.35+.65*g)*sm(seg(t,T.swing,T.swing+.9))*d;}
function phase(t){return 2*Math.PI*(t-T.swing)/T.P;}
function pageAngle(t,G){if(G.rm)return 0;return G.amp*envelope(t)*Math.sin(phase(t));}
function innerAngle(t){return 7.5*DEG*envelope(t)*Math.sin(phase(t)-.32);}

// ------------------------------------------------------------------ geometry
function geo(ctx){var W=ctx.W,H=ctx.H,to=ctx.to.rect,fr=ctx.from?ctx.from.rect:{x:W/2-150,y:H/2-150,w:300,h:300,fp:0},fp=to.fp||0,mob=W<=560;
  return{W:W,H:H,to:to,fr:fr,fp:fp,mob:mob,piv:[W/2,0],amp:(W<=560?2.5:W<=980?4:5)*DEG,rm:reduced(),prot:W<=980?.12:.4,wide:W>1180};}
function rot(p,piv,a){var c=Math.cos(a),s=Math.sin(a),x=p[0]-piv[0],y=p[1]-piv[1];return[piv[0]+x*c-y*s,piv[1]+x*s+y*c];}

// the beam at p = 0: taken from the baroque module when it exports one, otherwise a hard shaft from the upper right into the painting
function beam0(ctx,G){var S=ctx.state,k=[G.W,G.H,G.fr.x,G.fr.y,G.fr.w].join('/');if(S.beamKey!==k){S.beamKey=k;S.beam=measureBeam(ctx,G);}if(S.beam)return S.beam;
  var fr=G.fr;return{a:[G.W*.96,-G.H*.04],b:[fr.x+fr.w*.34,fr.y+fr.h*.52],wa:G.W*.05,wb:Math.max(fr.w*.42,120),col:[255,236,200],alpha:.22};}

// centre line of the light / rope: 64 points, same count in every state (straight beam → S line → hanging rope)
var NP=64;
function lineStraight(B){var o=[];for(var i=0;i<NP;i++){var s=i/(NP-1);o.push([lerp(B.a[0],B.b[0],s),lerp(B.a[1],B.b[1],s)]);}return o;}
function lineS(G){// Hogarth's line of beauty: one full, unequal wave along a slanting axis, the upper bow fuller than the lower
  var a=[G.W*.64,G.H*.02],b=[G.W*.4,G.H*.96],dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy),nx=-dy/L,ny=dx/L,o=[];
  for(var i=0;i<NP;i++){var s=i/(NP-1),w=Math.sin(2*Math.PI*s)*(s<.5?.15:.1)*L*Math.sin(Math.PI*s)*1.1;o.push([a[0]+dx*s+nx*w,a[1]+dy*s+ny*w]);}return o;}
function lineRope(top,bot,sag){var o=[];for(var i=0;i<NP;i++){var s=i/(NP-1);o.push([lerp(top[0],bot[0],s)+Math.sin(Math.PI*s)*sag,lerp(top[1],bot[1],s)]);}return o;}
function mixLine(A,B,u){if(u<=0)return A;if(u>=1)return B;var o=[];for(var i=0;i<NP;i++)o.push([lerp(A[i][0],B[i][0],u),lerp(A[i][1],B[i][1],u)]);return o;}
function strokeLine(g,P,w){g.lineWidth=w;g.beginPath();g.moveTo(P[0][0],P[0][1]);for(var i=1;i<P.length;i++)g.lineTo(P[i][0],P[i][1]);g.stroke();}
// a band of varying width along a centre line (the beam), as one polygon
function bandPath(P,wa,wb){var L=[],R=[];for(var i=0;i<NP;i++){var j0=Math.max(0,i-1),j1=Math.min(NP-1,i+1),dx=P[j1][0]-P[j0][0],dy=P[j1][1]-P[j0][1],n=Math.hypot(dx,dy)||1,w=lerp(wa,wb,i/(NP-1))/2;
    L.push([P[i][0]-dy/n*w,P[i][1]+dx/n*w]);R.push([P[i][0]+dy/n*w,P[i][1]-dx/n*w]);}
  var p=new Path2D();p.moveTo(L[0][0],L[0][1]);for(var k=1;k<NP;k++)p.lineTo(L[k][0],L[k][1]);for(k=NP-1;k>=0;k--)p.lineTo(R[k][0],R[k][1]);p.closePath();return p;}

// ------------------------------------------------------------------ the frame: a gilt band (covers the DOM gilt band exactly) + rocaille corners
// band profile across its width, outer edge → sight edge (lit from the upper left; bottom and right sides are darker)
var PROF=[[0,'#4a3312'],[.07,'#8a6526'],[.2,'#f1d88f'],[.34,'#c89c4c'],[.52,'#7d5a22'],[.66,'#b88c40'],[.78,'#ecd08a'],[.9,'#8d6a2c'],[1,'#3a2708']];
var SIDE_TONE=[1,.8,.68,.92];   // top, right, bottom, left
function shade(hx,k){var c=hex(hx);return css([c[0]*k,c[1]*k,c[2]*k]);}
function band(g,r,fp,a){if(fp<=0||a<=0)return;var x=r.x,y=r.y,w=r.w,h=r.h,X=x-fp,Y=y-fp,WW=w+2*fp,HH=h+2*fp;g.save();g.globalAlpha*=a;
  var sides=[[[X,Y],[X+WW,Y],[x+w,y],[x,y],[0,Y,0,y]],[[X+WW,Y],[X+WW,Y+HH],[x+w,y+h],[x+w,y],[X+WW,0,x+w,0]],
             [[X+WW,Y+HH],[X,Y+HH],[x,y+h],[x+w,y+h],[0,Y+HH,0,y+h]],[[X,Y+HH],[X,Y],[x,y],[x,y+h],[X,0,x,0]]];
  sides.forEach(function(s,i){var q=s[4],gr=g.createLinearGradient(q[0],q[1],q[2],q[3]);PROF.forEach(function(st){gr.addColorStop(st[0],shade(st[1],SIDE_TONE[i]));});
    g.fillStyle=gr;g.beginPath();g.moveTo(s[0][0],s[0][1]);g.lineTo(s[1][0],s[1][1]);g.lineTo(s[2][0]+(i===0||i===3?0:0),s[2][1]);g.lineTo(s[3][0],s[3][1]);g.closePath();g.fill();});
  // mitre lines
  g.strokeStyle='rgba(60,40,12,.45)';g.lineWidth=.8;g.beginPath();g.moveTo(X,Y);g.lineTo(x,y);g.moveTo(X+WW,Y);g.lineTo(x+w,y);g.moveTo(X+WW,Y+HH);g.lineTo(x+w,y+h);g.moveTo(X,Y+HH);g.lineTo(x,y+h);g.stroke();
  g.strokeStyle='rgba(40,26,6,.9)';g.lineWidth=1;g.strokeRect(x-.5,y-.5,w+1,h+1);
  g.restore();}

// rocaille corner ornament, drawn in corner space: origin = outer corner of the band, +x along one edge, +y along the other, unit = fp.
// Each corner has its own recipe (they are deliberately not mirror images). 'sk' = the skeleton the straight corner curls into.
var CORNERS=[   // tl, tr, br, bl: long scroll along x (a) and along y (b), shell tilt, shell size, which way the leaf curls
  {a:3.1,b:2.0,tilt:-12,sh:1.25,leaf:1},
  {a:2.2,b:3.3,tilt:16,sh:1.1,leaf:-1},
  {a:2.6,b:1.7,tilt:-6,sh:.95,leaf:1},
  {a:1.9,b:2.7,tilt:9,sh:1.05,leaf:-1}];
function scrollPts(x0,y0,x1,y1,side,turns,rv,n){// a C-scroll from (x0,y0) to a volute at (x1,y1): a gentle bow, then a spiral rolling toward `side`
  var o=[],dx=x1-x0,dy=y1-y0,L=Math.hypot(dx,dy),ux=dx/L,uy=dy/L,nx=-uy*side,ny=ux*side,m=Math.round(n*.55);
  for(var i=0;i<m;i++){var s=i/(m-1),b=Math.sin(Math.PI*s)*.12*L;o.push([x0+dx*s+nx*b,y0+dy*s+ny*b]);}
  // spiral: starts at the end point heading along u, turns toward the normal, radius shrinking
  var cx=x1+nx*rv,cy=y1+ny*rv,a0=Math.atan2(y1-cy,x1-cx),k=n-m;
  for(var j=1;j<=k;j++){var u=j/k,ang=a0+side*u*turns*2*Math.PI,rr=rv*(1-.78*u);o.push([cx+Math.cos(ang)*rr,cy+Math.sin(ang)*rr]);}
  return o;}
// corner space: -x / -y point outward. tl: -x left, -y up · tr: -x up, -y right · br: -x right, -y down · bl: -x down, -y left
function protPair(i,prot,wide){var p=[prot,prot];if(wide){if(i===1)p[1]=0;if(i===2)p[0]=0;}else{if(i===2)p[1]=0;if(i===3)p[0]=0;}return p;}
function cornerSkeleton(c,pp){// three strands: scroll along x, the shell's rim, scroll along y. 3 × 20 points
  var A=scrollPts(1.0,.52,c.a,.46,1,1.1,.22,20),B=[],C=scrollPts(.52,1.0,.46,c.b,-1,1.1,.2,20);
  var cx=.36,cy=.36,R=c.sh,t0=(225+c.tilt-58)*DEG,t1=(225+c.tilt+58)*DEG;
  cx=.4;cy=.4;for(var i=0;i<21;i++){var u=i/20,ang=lerp(t0,t1,u),rr=R*(.66+.05*Math.cos(u*Math.PI*10));var lim=Math.min((.4+pp[0]*.9)/Math.max(.05,-Math.cos(ang)),(.4+pp[1]*.9)/Math.max(.05,-Math.sin(ang)));rr=Math.min(rr,lim);
    B.push([cx+Math.cos(ang)*rr,cy+Math.sin(ang)*rr]);}
  return[A,B,C];}
// the straight corner the skeleton grows from: the band's outer edges meeting at a right angle (same point counts)
function cornerStraight(c){var A=[],B=[],C=[];for(var i=0;i<20;i++){var u=i/19;A.push([lerp(.0,c.a+.3,u),0]);C.push([0,lerp(0,c.b+.3,u)]);}for(i=0;i<21;i++){u=i/20;B.push(u<.5?[0,lerp(.8,0,u*2)]:[lerp(0,.8,u*2-1),0]);}return[A,B,C];}
// corner transforms: map corner space to screen (unit fp) for tl, tr, br, bl of the outer band rectangle
function cornerXf(i,r,fp){var X=r.x-fp,Y=r.y-fp,X2=r.x+r.w+fp,Y2=r.y+r.h+fp;
  return[[fp,0,0,fp,X,Y],[0,fp,-fp,0,X2,Y],[-fp,0,0,-fp,X2,Y2],[0,-fp,fp,0,X,Y2]][i];}
function ap(m,p){return[m[0]*p[0]+m[2]*p[1]+m[4],m[1]*p[0]+m[3]*p[1]+m[5]];}

// the ornament itself, pre-rendered once per corner (sprite in corner space, 4.2 × 4.2 fp with a margin for the protrusion)
var SPR_U=4.4,SPR_M=.6;   // sprite covers corner-space [-SPR_M, SPR_U-SPR_M]
function goldFill(q,x0,y0,x1,y1){var gr=q.createLinearGradient(x0,y0,x1,y1);gr.addColorStop(0,'#fff0bd');gr.addColorStop(.3,'#e2bd6a');gr.addColorStop(.62,'#a67a30');gr.addColorStop(1,'#5f4213');return gr;}
function ribbon(q,P,w0,w1){// a tapered gilt ribbon along P: dark underside, gold body, light crest (filled outline, no stroke-width steps)
  var L=[],R=[],n=P.length;for(var i=0;i<n;i++){var j0=Math.max(0,i-1),j1=Math.min(n-1,i+1),dx=P[j1][0]-P[j0][0],dy=P[j1][1]-P[j0][1],d=Math.hypot(dx,dy)||1,w=lerp(w0,w1,Math.pow(i/(n-1),1.3))/2;
    L.push([P[i][0]-dy/d*w,P[i][1]+dx/d*w]);R.push([P[i][0]+dy/d*w,P[i][1]-dx/d*w]);}
  function path(o){q.beginPath();L.forEach(function(p,i){if(i)q.lineTo(p[0]+o,p[1]+o);else q.moveTo(p[0]+o,p[1]+o);});for(var k=n-1;k>=0;k--)q.lineTo(R[k][0]+o,R[k][1]+o);q.closePath();}
  path(.05);q.fillStyle='rgba(74,48,14,.55)';q.fill();
  path(0);q.fillStyle=goldFill(q,P[0][0]-.5,P[0][1]-.5,P[n-1][0]+.5,P[n-1][1]+.5);q.fill();q.strokeStyle='rgba(96,64,20,.55)';q.lineWidth=.03;q.stroke();
  q.beginPath();R.forEach(function(p,i){var m=[lerp(p[0],P[i][0],.45),lerp(p[1],P[i][1],.45)];if(i)q.lineTo(m[0],m[1]);else q.moveTo(m[0],m[1]);});q.strokeStyle='rgba(255,246,212,.8)';q.lineWidth=.045;q.stroke();}
function drawOrnament(q,c,pp){// q: corner-space context (unit = 1 fp); outside the painting: the band (x<1 or y<1) plus the allowed protrusion
  var sk=cornerSkeleton(c,pp);q.lineJoin='round';q.lineCap='round';
  // 1. the shell (coquille) fanning out over the corner: rounded lobes between fine ribs
  var cx=.4,cy=.4,rim=sk[1],n=rim.length;q.save();
  q.beginPath();q.moveTo(cx+.3,cy+.3);for(var i=0;i<n;i++){var p=rim[i];if(i%2){var p0=rim[i-1],p2=rim[Math.min(n-1,i+1)];q.quadraticCurveTo(p[0]+(p[0]-cx)*.08,p[1]+(p[1]-cy)*.08,p2[0],p2[1]);}else if(!i)q.lineTo(p[0],p[1]);}
  q.closePath();q.fillStyle=goldFill(q,-.3,-.3,1.1,1.1);q.fill();q.strokeStyle='rgba(96,62,18,.6)';q.lineWidth=.035;q.stroke();
  for(i=2;i<n-1;i+=2){var e=rim[i];q.beginPath();q.moveTo(lerp(cx+.3,e[0],.18),lerp(cy+.3,e[1],.18));q.lineTo(lerp(cx+.3,e[0],.92),lerp(cy+.3,e[1],.92));q.strokeStyle='rgba(110,74,24,.5)';q.lineWidth=.03;q.stroke();
    var f=rim[i-1];q.beginPath();q.moveTo(lerp(cx+.3,f[0],.25),lerp(cy+.3,f[1],.25));q.lineTo(lerp(cx+.3,f[0],.85),lerp(cy+.3,f[1],.85));q.strokeStyle='rgba(255,244,206,.55)';q.lineWidth=.03;q.stroke();}
  q.restore();
  // 2. the two C-scrolls, tapering into their volutes
  ribbon(q,sk[0],.3,.12);ribbon(q,sk[2],.28,.11);
  [sk[0],sk[2]].forEach(function(P){var e=P[P.length-1];q.beginPath();q.arc(e[0],e[1],.07,0,Math.PI*2);q.fillStyle='#fff0c4';q.fill();});
  // 3. an acanthus leaf breaking the corner, curling one way
  q.save();q.translate(.92,.92);q.rotate((c.leaf>0?-24:114)*DEG);q.scale(.85,.85);q.beginPath();q.moveTo(0,0);q.bezierCurveTo(.45,-.32,.95,-.22,1.2,.1);q.bezierCurveTo(1.0,.0,.82,.05,.72,.14);q.bezierCurveTo(.66,.06,.5,.12,.46,.3);q.bezierCurveTo(.32,.18,.14,.16,0,0);
  q.fillStyle=goldFill(q,0,-.3,1.2,.4);q.fill();q.strokeStyle='rgba(96,62,18,.55)';q.lineWidth=.03;q.stroke();
  q.beginPath();q.moveTo(.08,.02);q.quadraticCurveTo(.6,-.13,1.08,.06);q.strokeStyle='rgba(255,244,206,.75)';q.lineWidth=.03;q.stroke();q.restore();}
function buildSprites(S,fp,dpr,prot,wide){var px=Math.max(24,Math.round(SPR_U*fp*dpr)),k=px/SPR_U;
  S.spr=CORNERS.map(function(c,i){var pp=protPair(i,prot,wide);var s=cv(px,px),q=s.getContext('2d');q.setTransform(k,0,0,k,SPR_M*k,SPR_M*k);
    // keep the ornament off the painting: clip to the band + the allowed protrusion
    q.beginPath();q.rect(-pp[0],-pp[1],SPR_U,1+pp[1]);q.rect(-pp[0],-pp[1],1+pp[0],SPR_U);q.clip();
    drawOrnament(q,c,pp);return s;});
  // the top-centre cartouche: a small asymmetric shell riding on the top band
  var cw=Math.round(3.2*fp*dpr),ch=Math.round((1+prot+.2)*fp*dpr),c2=cv(cw,ch),q2=c2.getContext('2d'),k2=cw/3.2;q2.setTransform(k2,0,0,k2,1.6*k2,(prot+.1)*k2);
  q2.beginPath();q2.rect(-1.6,-prot,3.2,1+prot);q2.clip();
  var rim=[];for(var i=0;i<17;i++){var u=i/16,a=lerp(200,340,u)*DEG,rr=(.72+.07*Math.cos(u*Math.PI*8))*(u<.5?1:.92);rr=Math.min(rr,(.62+prot)/Math.max(.25,-Math.sin(a)));rim.push([Math.cos(a)*rr*1.3+.1,.62+Math.sin(a)*rr]);}
  q2.beginPath();q2.moveTo(.1,.66);rim.forEach(function(p){q2.lineTo(p[0],p[1]);});q2.closePath();q2.fillStyle=goldFill(q2,-1,-.3,1,1);q2.fill();q2.strokeStyle='rgba(96,62,18,.6)';q2.lineWidth=.035;q2.stroke();
  for(i=1;i<16;i+=2){q2.beginPath();q2.moveTo(.1,.62);q2.lineTo(rim[i][0],rim[i][1]);q2.strokeStyle='rgba(110,74,24,.5)';q2.lineWidth=.03;q2.stroke();}
  [[-1,1],[1,-1]].forEach(function(d,j){var P=scrollPts(.1+d[0]*.5,.7,.1+d[0]*(j?1.12:1.3),.52+(j?.06:0),d[1],1.05,.15,18);ribbon(q2,P,.24,.1);});
  S.top={c:c2,w:3.2,h:1+prot+.2,oy:prot+.1};
  S.sprKey=[fp,dpr,prot,!!wide].join('/');}
// the whole rocaille frame: band + ornaments (a = opacity of the ornaments)
function frameDraw(g,S,r,fp,prot,bandA,ornA){if(fp<=0)return;band(g,r,fp,bandA);if(ornA<=0||!S.spr)return;g.save();g.globalAlpha*=ornA;
  for(var i=0;i<4;i++){var m=cornerXf(i,r,fp);g.save();g.transform(m[0],m[1],m[2],m[3],m[4],m[5]);g.drawImage(S.spr[i],-SPR_M,-SPR_M,SPR_U,SPR_U);g.restore();}
  var tp=S.top;g.drawImage(tp.c,r.x+r.w/2-tp.w/2*fp+.18*fp,r.y-fp-tp.oy*fp,tp.w*fp,tp.h*fp);g.restore();}

// the frame shadow of the DOM .frame.f-gilt::before (0 28px 70px -24px rgba(0,0,0,.8)), pre-rendered once
function shadowCache(dpr,r,ox,oy,blur,spread){var M=Math.ceil(1.6*blur+Math.abs(ox)+Math.abs(oy)+4),X0=r.x-spread-M,Y0=r.y-spread-M,X1=r.x+r.w+spread+M,Y1=r.y+r.h+spread+M;
  var dx=Math.floor(X0*dpr),dy=Math.floor(Y0*dpr),c=cv(Math.ceil(X1*dpr)-dx,Math.ceil(Y1*dpr)-dy),q=c.getContext('2d');q.setTransform(dpr,0,0,dpr,-dx,-dy);
  q.shadowColor='#000';q.shadowBlur=blur*dpr;q.shadowOffsetX=(ox+1e5)*dpr;q.shadowOffsetY=oy*dpr;q.fillStyle='#000';q.fillRect(r.x-spread-1e5,r.y-spread,r.w+2*spread,r.h+2*spread);
  return{c:c,x:dx/dpr,y:dy/dpr,w:c.width/dpr,h:c.height/dpr,key:[dpr,r.x,r.y,r.w,r.h].join('/')};}
function frameBox(r,fp){return{x:r.x-fp,y:r.y-fp,w:r.w+2*fp,h:r.h+2*fp};}

// ------------------------------------------------------------------ the painting (layers from rooms/rococo/cut, see LAYERS)
/*@LAYERS*/var LAYERS={"layers":[{"id":"ropes","file":"ropes.webp","x":932,"y":607,"w":553,"h":734},{"id":"woman","file":"woman.webp","x":502,"y":1206,"w":849,"h":649},{"id":"flowers","file":"flowers.webp","x":927,"y":1689,"w":191,"h":60},{"id":"shoe","file":"shoe.webp","x":424,"y":1263,"w":51,"h":73,"patch":{"file":"shoe_patch.webp","x":412,"y":1251,"w":74,"h":96}},{"id":"cupid","file":"cupid.webp","x":17,"y":1090,"w":203,"h":452},{"id":"pullropes","file":"pullropes.webp","x":1233,"y":1607,"w":266,"h":247}],"regions":[{"id":"youngman","hit":[[174,1902],[199,1857],[249,1852],[284,1887],[279,1922],[339,1902],[428,1872],[518,1822],[538,1787],[503,1742],[558,1732],[627,1752],[632,1822],[578,1822],[558,1842],[468,1892],[398,1922],[468,1991],[558,2001],[598,2031],[608,2081],[518,2101],[398,2121],[299,2141],[249,2170],[199,2160],[149,2101],[139,2021],[169,1942]],"box":[139,1732,632,2170]},{"id":"oldman","hit":[[1609,1684],[1657,1678],[1685,1709],[1688,1757],[1700,1794],[1706,1897],[1700,2019],[1682,2140],[1536,2140],[1518,2031],[1511,1970],[1536,1885],[1511,1879],[1487,1855],[1451,1824],[1402,1818],[1374,1800],[1384,1782],[1414,1779],[1457,1776],[1536,1763],[1590,1751],[1600,1715]],"box":[1374,1678,1706,2140]}],"points":{"pivot":[1410.6,784.6],"shoe":[447.3,1297.4],"seat":[886.3,1576.9],"anchorL":[1267.2,606.3],"anchorR":[1554.0,962.9]}};/*@END*/
var AW=1912,AH=2400;
var LY={};LAYERS.layers.forEach(function(l){LY[l.id]=l;});
var PIV=LAYERS.points.pivot,SHOE=LAYERS.points.shoe;
var SWB=(function(){var a=LY.ropes,b=LY.woman,x=Math.min(a.x,b.x)-4,y=Math.min(a.y,b.y)-4;return{x:x,y:y,w:Math.max(a.x+a.w,b.x+b.w)+4-x,h:Math.max(a.y+a.h,b.y+b.h)+4-y};})();
var ARM={x:70,y:1150,w:165,h:210,elbow:[118,1322],a0:30};   // the cupid's forearm (t_arm.webp, cut here) and the ground behind it (t_armbg.webp)
var VEIL=[64,78,70];                                            // multiply colour of the unlit painting (a dim green shade)
var SHS=null;                                                   // the state of the last init (for EH_SHARED.rococoRest)

// ------------------------------------------------------------------ module
EH.transition('rococo',{
  duration:D,
  assets:['cut/plate.webp','cut/ropes.webp','cut/woman.webp','cut/flowers.webp','cut/shoe.webp','cut/cupid.webp','t_arm.webp','t_armbg.webp'],
  init:function(ctx){var S=ctx.state;SHS=S;S.im={plate:ctx.asset('cut/plate.webp'),ropes:ctx.asset('cut/ropes.webp'),woman:ctx.asset('cut/woman.webp'),flowers:ctx.asset('cut/flowers.webp'),
      shoe:ctx.asset('cut/shoe.webp'),cupid:ctx.asset('cut/cupid.webp'),arm:ctx.asset('t_arm.webp'),armbg:ctx.asset('t_armbg.webp')};
    var G=geo(ctx);if(ctx.from&&ctx.from.image&&ctx.from.image.naturalWidth){var fr=G.fr,fw=Math.min(Math.round(fr.w*(ctx.dpr||1)),2600);S.fromArt=cv(fw,Math.round(fw*ctx.from.image.naturalHeight/ctx.from.image.naturalWidth));S.fromArt.getContext('2d').drawImage(ctx.from.image,0,0,S.fromArt.width,S.fromArt.height);}
    prepare(ctx,S,G);beam0(ctx,G);warm(ctx,S,G);},
  draw:function(p,ctx){var g=ctx.g,S=ctx.state,t=p*D,G=geo(ctx),W=G.W,H=G.H,to=G.to,fp=G.fp,dpr=ctx.dpr||1;prepare(ctx,S,G);
    var toWall=hex(ctx.to.wall);
    ctx.ui.ink(t>6.4?(ctx.to.ink||'dark'):(ctx.from?ctx.from.ink:'light'));
    // ===== 1. the baroque room sinks into the dark around its beam
    var veil=sm(seg(t,T.veil[0],T.veil[1]));
    fromBeam(ctx,G,t,1-sm(seg(t,.15,1.25)));
    if(veil<1){drawFrom(g,ctx,S,G,t);if(veil>0){g.fillStyle=css(BLACK,veil);g.fillRect(0,0,W,H);}}
    else{g.fillStyle=css(BLACK);g.fillRect(0,0,W,H);}
    // ===== 2. the new wall floods out from the pink line: pink first, the pale celadon settling under it
    var fl=seg(t,T.wall[0],T.wall[1]);
    if(fl>0){var wc=mix(PINK,toWall,sm(seg(t,T.wall[0]+1.8,T.wall[1]+.2))),c0=[W*.52,H*.48],R=Math.hypot(W,H)*.9,a0=eo(seg(fl,0,.55)),a1=sm(seg(fl,.2,1));
      if(a1>=1){g.fillStyle=css(wc);g.fillRect(0,0,W,H);}
      else{var gr=g.createRadialGradient(c0[0],c0[1],0,c0[0],c0[1],R);gr.addColorStop(0,css(wc,a0));gr.addColorStop(.45,css(wc,lerp(a1,a0,.55)));gr.addColorStop(1,css(wc,a1));g.fillStyle=gr;g.fillRect(0,0,W,H);}
      wash(g,W,H,to,ctx.to.ink==='dark',sm(seg(fl,.4,1)));}
    // ===== 3. the page on its ropes
    var th=pageAngle(t,G);g.save();if(th){g.translate(G.piv[0],G.piv[1]);g.rotate(th);g.translate(-G.piv[0],-G.piv[1]);}
    var mv=eio(seg(t,T.move[0],T.move[1])),fb0=frameBox(G.fr,G.fr.fp||0),fb1=frameBox(to,fp);
    var fb={x:lerp(fb0.x,fb1.x,mv),y:lerp(fb0.y,fb1.y,mv),w:lerp(fb0.w,fb1.w,mv),h:lerp(fb0.h,fb1.h,mv)};
    var bandA=sm(seg(t,T.band[0],T.band[1])),ornA=sm(seg(t,T.orn[0],T.orn[1])),picA=sm(seg(t,T.pic[0],T.pic[1]));
    if(bandA>0){var bx=frameBox(to,fp);g.save();g.beginPath();g.rect(-W,-H,3*W,3*H);g.rect(bx.x,bx.y,bx.w,bx.h);g.clip('evenodd');g.globalAlpha=.8*bandA;g.drawImage(S.sh.c,S.sh.x,S.sh.y,S.sh.w,S.sh.h);g.restore();}
    if(picA>0)painting(g,ctx,S,G,t,picA);
    if(bandA>0)frameDraw(g,S,to,fp,G.prot,bandA,ornA);
    lineFrame(g,S,G,t,fb,fp);
    ropes(g,ctx,S,G,t);
    g.restore();
    // ===== 4. the light (screen space until it has become rope 1)
    light(g,ctx,S,G,t);
    // ===== 5. the slipper and the label
    shoe(g,ctx,S,G,t);
  },
  done:function(ctx){ctx.state.restT0=performance.now()/1000;fromBeam(ctx,geo(ctx),0,0);var le=document.getElementById('lab'+ctx.to.idx);if(le)le.style.opacity='1';},
  rest:function(ctx){var S=ctx.state,g=ctx.g,r=ctx.to.rect,R0=EH.rectFor(ctx.to.idx,ctx.reading?'read':'hang'),fp=R0?R0.fp:(r.fp||0),prot=ctx.W<=980?.12:.4;
    if(S.restT0==null)S.restT0=performance.now()/1000;var tau=performance.now()/1000-S.restT0;
    var le=document.getElementById('lab'+ctx.to.idx);if(le&&le.style.opacity&&(le.classList.contains('on')||tau>4))le.style.opacity='';
    rgBegin(ctx);
    if(S.sprKey!==[fp,ctx.dpr,prot,ctx.W>1180].join('/'))buildSprites(S,fp,ctx.dpr,prot,ctx.W>1180);
    if(ctx.tool!=='era'&&ctx.tool!=='special')restSway(g,S,r,ctx.dpr,tau);
    frameDraw(g,S,r,fp,prot,1,1);
    rgEnd(ctx);}
});

// for the next room's p = 0: the rocaille frame and the swing at rest time t (rect = the hung work's rect, with fp)
SH.rococoRest=function(g,o){var S=SHS||{},r=o.rect,fp=r.fp||0,prot=o.W<=980?.12:.4;if(!SHS)S=SHS={};
  if(S.sprKey!==[fp,o.dpr,prot,o.W>1180].join('/'))buildSprites(S,fp,o.dpr,prot,o.W>1180);if(S.im)restSway(g,S,r,o.dpr,o.t||0);frameDraw(g,S,r,fp,prot,1,1);};

// ------------------------------------------------------------------ pieces
function ensureShadow(S,dpr,r){var k=[dpr,r.x,r.y,r.w,r.h].join('/');if(!S.sh||S.sh.key!==k){var fp=r.fp||0,b=frameBox(r,fp);S.sh=shadowCache(dpr,b,0,28,70,-24);S.sh.key=k;}}
function prepare(ctx,S,G){var dpr=ctx.dpr||1,key=[G.fp,dpr,G.prot,G.wide].join('/');if(S.sprKey!==key)buildSprites(S,G.fp,dpr,G.prot,G.wide);ensureShadow(S,dpr,G.to);
  if(S.paintKey!==[G.to.w,G.to.h,dpr].join('/'))paintCaches(ctx,S,G);
  var lw=Math.ceil(G.W/8),lh=Math.ceil(G.H/8);if(!S.lo||S.lo.width!==lw||S.lo.height!==lh){S.lo=cv(lw,lh);S.lq=S.lo.getContext('2d');S.mi=cv(Math.ceil(G.W/2),Math.ceil(G.H/2));S.mq=S.mi.getContext('2d');}}
// everything is decoded and uploaded before the passage starts (init runs during the previous room's rest)
function warm(ctx,S,G){var sc=cv(256,256),q=sc.getContext('2d');[S.full,S.plate,S.swing,S.vc,S.mW,S.mD,S.mM,S.mC,S.sh&&S.sh.c,S.lo].concat(S.spr||[]).concat([S.top&&S.top.c]).forEach(function(c){if(c)try{q.drawImage(c,0,0,256,256);}catch(e){}});
  Object.keys(S.im||{}).forEach(function(k){var im=S.im[k];if(im&&im.naturalWidth)try{q.drawImage(im,0,0,64,64);}catch(e){}});try{q.getImageData(0,0,1,1);}catch(e){}}
function drawFrom(g,ctx,S,G,t){var fr=G.fr,W=G.W,H=G.H,f=ctx.from;
  g.fillStyle=css(f?hex(f.wall):BLACK);g.fillRect(0,0,W,H);if(!f)return;
  wash(g,W,H,fr,f.ink==='dark',1);
  if(f.frame==='gilt'){ensureFromShadow(S,ctx.dpr||1,fr);g.save();g.globalAlpha=.8;g.drawImage(S.shF.c,S.shF.x,S.shF.y,S.shF.w,S.shF.h);g.restore();gilt(g,fr);}
  if(S.fromArt)g.drawImage(S.fromArt,fr.x,fr.y,fr.w,fr.h);}
// the baroque beam lives on the baroque's overlay layer ('beam', screen, above the wall text): keep drawing it there with its own rest
// function (its dust keeps drifting) and let it go as the stage's light takes over. That canvas is redrawn by the baroque module itself
// whenever its room is shown again, so clearing it here leaves nothing behind.
var BAROQUE_D=20;
function fromBeam(ctx,G,t,a){var c=ctx.fromLayer&&ctx.fromLayer('beam');if(!c)return;var q=c.__g||c.getContext('2d'),dpr=ctx.dpr||1;
  q.setTransform(1,0,0,1,0,0);q.clearRect(0,0,c.width,c.height);if(a<=0||typeof SH.baroqueRest!=='function')return;
  q.setTransform(dpr,0,0,dpr,0,0);q.save();q.globalAlpha=a;try{SH.baroqueRest(q,{W:G.W,H:G.H,rect:G.fr,dpr:dpr,t:BAROQUE_D+t});}catch(e){}q.restore();}
// .wash: radial-gradient(ellipse 70% 60% at centre-of-art, c0, transparent 70%)
function wash(g,W,H,r,light,a){if(a<=0)return;g.save();g.translate(r.x+r.w/2,r.y+r.h/2);g.scale(.7*W,.6*H);
  var gr=g.createRadialGradient(0,0,0,0,0,1);gr.addColorStop(0,light?'rgba(255,255,255,.35)':'rgba(255,244,225,.08)');gr.addColorStop(.7,light?'rgba(255,255,255,0)':'rgba(255,244,225,0)');
  g.globalAlpha=a;g.fillStyle=gr;g.fillRect(-2,-2,4,4);g.restore();}
// .frame.f-gilt::before (the baroque's frame): 160deg gradient, inset rings 1px #1c1409 / 5px #7a5e35 / 6px #241a0c
function gilt(g,r){var fp=r.fp||0,x=r.x-fp,y=r.y-fp,w=r.w+2*fp,h=r.h+2*fp;if(!fp)return;
  var a=160*Math.PI/180,dx=Math.sin(a),dy=-Math.cos(a),L=Math.abs(w*dx)+Math.abs(h*dy),cx=x+w/2,cy=y+h/2;
  var gr=g.createLinearGradient(cx-dx*L/2,cy-dy*L/2,cx+dx*L/2,cy+dy*L/2);gr.addColorStop(0,'#6d5230');gr.addColorStop(.55,'#3a2a14');gr.addColorStop(1,'#5c4424');
  g.fillStyle=gr;g.fillRect(x,y,w,h);
  g.fillStyle='#241a0c';g.fillRect(x,y,w,6);g.fillRect(x,y+h-6,w,6);g.fillRect(x,y,6,h);g.fillRect(x+w-6,y,6,h);
  g.fillStyle=gr;g.fillRect(x+6,y+6,w-12,h-12);
  g.fillStyle='#7a5e35';g.fillRect(x,y,w,5);g.fillRect(x,y+h-5,w,5);g.fillRect(x,y,5,h);g.fillRect(x+w-5,y,5,h);
  g.fillStyle='#1c1409';g.fillRect(x,y,w,1);g.fillRect(x,y+h-1,w,1);g.fillRect(x,y,1,h);g.fillRect(x+w-1,y,1,h);}
function ensureFromShadow(S,dpr,r){var k=[dpr,r.x,r.y,r.w,r.h].join('/');if(!S.shF||S.shF.key!==k){S.shF=shadowCache(dpr,frameBox(r,r.fp||0),0,28,70,-24);S.shF.key=k;}}
// the baroque beam's geometry, measured once (init) from its own rest drawing: principal axis of the light on the wall, widths at both ends
function measureBeam(ctx,G){if(typeof SH.baroqueRest!=='function')return null;var q4=4,w=Math.ceil(G.W/q4),h=Math.ceil(G.H/q4),c=cv(w,h),q=c.getContext('2d');
  q.fillStyle='#000';q.fillRect(0,0,w,h);q.setTransform(1/q4,0,0,1/q4,0,0);try{SH.baroqueRest(q,{W:G.W,H:G.H,rect:G.fr,dpr:1,t:BAROQUE_D});}catch(e){return null;}
  var d;try{d=q.getImageData(0,0,w,h).data;}catch(e){return null;}
  var sw=0,mx=0,my=0,cr=0,cg=0,cb=0,P=[];for(var y=0;y<h;y++)for(var x=0;x<w;x++){var i=(y*w+x)*4,l=(d[i]+d[i+1]+d[i+2])/765;if(l<.04)continue;P.push([x*q4,y*q4,l]);sw+=l;mx+=x*q4*l;my+=y*q4*l;cr+=d[i]*l;cg+=d[i+1]*l;cb+=d[i+2]*l;}
  if(sw<5||P.length<40)return null;mx/=sw;my/=sw;var sxx=0,syy=0,sxy=0;P.forEach(function(p){var dx=p[0]-mx,dy=p[1]-my;sxx+=dx*dx*p[2];syy+=dy*dy*p[2];sxy+=dx*dy*p[2];});
  var an=.5*Math.atan2(2*sxy,sxx-syy),ux=Math.cos(an),uy=Math.sin(an);if(uy<0){ux=-ux;uy=-uy;}var vx=-uy,vy=ux;
  var S2=P.map(function(p){return[(p[0]-mx)*ux+(p[1]-my)*uy,(p[0]-mx)*vx+(p[1]-my)*vy,p[2]];}).sort(function(a,b){return a[0]-b[0];});
  var s0=S2[Math.floor(S2.length*.02)][0],s1=S2[Math.floor(S2.length*.98)][0],span=s1-s0;
  function width(lo,hi){var n=0,m=0,v=0;S2.forEach(function(p){if(p[0]>=lo&&p[0]<=hi){n+=p[2];m+=p[1]*p[2];}});if(!n)return 40;m/=n;S2.forEach(function(p){if(p[0]>=lo&&p[0]<=hi)v+=(p[1]-m)*(p[1]-m)*p[2];});return Math.max(12,Math.sqrt(v/n)*3.46);}
  var lum=sw/P.length;return{a:[mx+ux*s0,my+uy*s0],b:[mx+ux*s1,my+uy*s1],wa:width(s0,s0+span*.15),wb:width(s1-span*.15,s1),
    col:[cr/sw,cg/sw,cb/sw].map(function(v){return Math.min(255,v/Math.max(.35,lum)*.9);}),alpha:Math.min(.6,lum*1.2)};}
// the thin gold line: the baroque frame's edge, carried to the new frame, whose corners curl into the rocaille skeleton
function lineFrame(g,S,G,t,fb,fp){var a=sm(seg(t,T.line[0],T.line[1]))*(1-sm(seg(t,T.orn[0]+.4,T.orn[1]+.3)));if(a<=0)return;
  var cu=eio(seg(t,T.curl[0],T.curl[1])),fpu=Math.max(fp,8);g.save();g.lineJoin='round';g.lineCap='round';
  var r={x:fb.x+fpu,y:fb.y+fpu,w:fb.w-2*fpu,h:fb.h-2*fpu};
  g.strokeStyle='rgba(236,204,128,'+(.9*a).toFixed(3)+')';g.lineWidth=1.4;g.strokeRect(fb.x,fb.y,fb.w,fb.h);
  if(cu>0){for(var i=0;i<4;i++){var m=cornerXf(i,r,fpu),c=CORNERS[i],A=cornerStraight(c),B=cornerSkeleton(c,protPair(i,G.prot,G.wide));
      for(var j=0;j<3;j++){var P=[];for(var k=0;k<A[j].length;k++){var q=[lerp(A[j][k][0],B[j][k][0],cu),lerp(A[j][k][1],B[j][k][1],cu)];P.push(ap(m,q));}
        g.strokeStyle='rgba(250,226,160,'+(a*Math.min(1,cu*3)).toFixed(3)+')';strokeLine(g,P,1.6);}}}
  g.restore();}
// rope feet on the frame: the outer top corners of the band, a little in
function ropeFeet(G){var fb=frameBox(G.to,G.fp),ins=Math.max(G.fp*1.1,10);return[[fb.x+ins,fb.y+G.fp*.3],[fb.x+fb.w-ins,fb.y+G.fp*.3]];}
function ropeTexture(g,P,w,a){if(a<=0)return;g.save();g.globalAlpha*=a;g.lineCap='round';g.strokeStyle='rgba(92,66,28,.85)';strokeLine(g,P,w+1.2);g.strokeStyle=css(ROPE);strokeLine(g,P,w);
  g.setLineDash([1.4,2.4]);g.strokeStyle='rgba(120,86,40,.75)';strokeLine(g,P,w*.9);g.setLineDash([]);g.strokeStyle='rgba(255,246,220,.5)';g.translate(-w*.2,0);strokeLine(g,P,w*.28);g.restore();}
var ROPE=[214,190,138];
function ropeW(G){return G.mob?2.4:3.4;}
function ropes(g,ctx,S,G,t){var ft=ropeFeet(G),out=eio(seg(t,T.ropesOut[0],T.ropesOut[1]));if(t<T.rope[1]-.5||out>=1)return;
  var w=ropeW(G),top=-G.H*.12,r1=sm(seg(t,T.rope[1]-.5,T.rope[1]));
  [0,1].forEach(function(i){var f=ft[i],u=i?sm(seg(t,T.rope2[0],T.rope2[1])):r1;if(u<=0)return;
    // drawn up at the end: the lower end rises past the top of the screen
    var y1=i?lerp(top,f[1],eio(u)):f[1];y1=lerp(y1,top-10,out);
    ropeTexture(g,lineRope([f[0],top],[f[0],y1],0),w,i?1:r1);
    var ka=(i?sm(seg(u,.85,1)):r1)*(1-sm(seg(out,0,.25)));if(ka>0){g.save();g.globalAlpha*=ka;g.fillStyle='#7d5c28';g.beginPath();g.ellipse(f[0],f[1],w*1.2,w*1.5,0,0,Math.PI*2);g.fill();
      g.fillStyle='rgba(255,236,190,.6)';g.beginPath();g.ellipse(f[0]-w*.35,f[1]-w*.4,w*.4,w*.5,0,0,Math.PI*2);g.fill();g.restore();}});}
// the light: hard beam → soft pink beam → S line → rope 1
function softGlow(g,P,wa,wb,spread,col,a,mode){if(a<=0||spread<=0)return;var n=10;g.save();g.globalCompositeOperation=mode;
  for(var k=1;k<=n;k++){var m=1+spread*k/n;g.fillStyle=css(col,a/n*1.6*(1-.35*k/n));g.fill(bandPath(P,wa*m,wb*m));}g.restore();}
function light(g,ctx,S,G,t){var rope=eio(seg(t,T.rope[0],T.rope[1]));if(t>T.rope[1]+.05)return;
  var B=beam0(ctx,G),ft=ropeFeet(G),P=mixLine(mixLine(lineStraight(B),lineS(G),eio(seg(t,T.bend[0],T.bend[1]))),lineRope([ft[0][0],-G.H*.12],ft[0],G.W*.02*(1-rope)),rope);
  // the rope is in page space: follow the page's swing (it starts to swing only after the rope has settled; kept for safety)
  var bend=eio(seg(t,T.bend[0],T.bend[1])),soft=sm(seg(t,T.soft[0],T.soft[1])),pink=sm(seg(t,T.pink[0],T.pink[1])),pale=sm(seg(t,T.wall[0]+.6,T.wall[0]+2.6));
  var col=mix(B.col||[255,236,200],[255,176,190],pink),rw=ropeW(G);
  var wa=lerp(lerp(B.wa,G.mob?7:10,bend),rw,rope),wb=lerp(lerp(B.wb,G.mob?7:10,bend),rw,rope);
  var inA=sm(seg(t,.12,1.0)),A=Math.min(.9,(B.alpha||.22)*lerp(1,3.4,sm(seg(t,.8,3.4))))*inA*(1-sm(seg(rope,.55,1)));
  var path=bandPath(P,wa,wb);
  // on the dark room the light is added; on the pale wall it is paint (a pink ribbon)
  var mode=pale<1?'lighter':'source-over',k=pale<1?1-pale:1;
  if(k>0&&pale<1){g.save();g.globalCompositeOperation='lighter';g.fillStyle=css(col,A*(1-.7*soft)*k);g.fill(path);g.restore();softGlow(g,P,wa,wb,soft*(.5+2.4*bend),col,A*soft*.9*k,'lighter');}
  if(pale>0){var pc=mix([226,128,150],ROPE,sm(seg(rope,.2,.9)));g.save();g.fillStyle=css(pc,Math.min(1,.95*pale)*(1-sm(seg(rope,.55,1))));g.fill(path);g.restore();
    softGlow(g,P,wa,wb,1.8+1.5*(1-bend),[244,170,186],.28*pale*(1-rope),'source-over');}
  if(rope>.45)ropeTexture(g,P,rw,sm(seg(rope,.45,1)));}

// ---- the painting: dim → lit region by region; the swing moves about its branch
function paintCaches(ctx,S,G){var r=G.to,dpr=ctx.dpr||1,w=Math.min(Math.round(r.w*dpr),2600),h=Math.round(w*AH/AW),im=ctx.to.image,I=S.im||{};S.paintKey=[r.w,r.h,dpr].join('/');
  if(!im||!im.naturalWidth){S.paintKey=null;return;}
  // exactly like the core's paintArt(): the hung work is drawn into a round(w·dpr) canvas
  S.full=cv(w,h);S.full.getContext('2d').drawImage(im,0,0,w,h);var k=w/AW;
  S.plate=cv(w,h);S.plate.getContext('2d').drawImage(I.plate&&I.plate.naturalWidth?I.plate:im,0,0,w,h);
  S.swing=cv(SWB.w*k,SWB.h*k);var q=S.swing.getContext('2d');q.setTransform(k,0,0,k,-SWB.x*k,-SWB.y*k);
  if(I.ropes&&I.ropes.naturalWidth)q.drawImage(I.ropes,LY.ropes.x,LY.ropes.y,LY.ropes.w,LY.ropes.h);if(I.woman&&I.woman.naturalWidth)q.drawImage(I.woman,LY.woman.x,LY.woman.y,LY.woman.w,LY.woman.h);
  // the veil (multiply) and the masks that lift it, at 1/4 of the displayed size (soft edges come free with the upscale)
  var vw=Math.max(8,Math.round(r.w/4)),vh=Math.round(vw*AH/AW),sv=vw/AW;S.vc=cv(vw,vh);S.vq=S.vc.getContext('2d');S.sv=sv;
  function mask(fn,blur){var c=cv(vw,vh),m=c.getContext('2d');m.filter='blur('+blur+'px)';var t=cv(vw,vh),tq=t.getContext('2d');tq.setTransform(sv,0,0,sv,0,0);fn(tq);m.drawImage(t,0,0);m.filter='none';return c;}
  S.mW=mask(function(m){m.drawImage(S.swing,SWB.x,SWB.y,SWB.w,SWB.h);m.drawImage(S.swing,SWB.x,SWB.y,SWB.w,SWB.h);},1.4);   // drawn un-rotated; rotated copies are drawn per frame
  S.mM=mask(function(m){m.fillStyle='#000';LAYERS.regions.forEach(function(R){m.beginPath();R.hit.forEach(function(p,i){if(i)m.lineTo(p[0],p[1]);else m.moveTo(p[0],p[1]);});m.closePath();m.fill();
    var b=R.box;m.save();m.globalAlpha=.55;m.beginPath();m.ellipse((b[0]+b[2])/2,(b[1]+b[3])/2,(b[2]-b[0])*.7,(b[3]-b[1])*.62,0,0,Math.PI*2);m.fill();m.restore();});},2.2);
  S.mC=mask(function(m){if(I.cupid&&I.cupid.naturalWidth){var c=LY.cupid;m.drawImage(I.cupid,c.x,c.y,c.w,c.h);m.drawImage(I.cupid,c.x,c.y,c.w,c.h);}
    m.save();m.globalAlpha=.5;m.fillStyle='#000';m.beginPath();m.ellipse(130,1300,190,300,0,0,Math.PI*2);m.fill();m.restore();},2);
  // dappled light: the painting's own bright passages (sky through the trees, the lit foliage, the flying shoe)
  S.mD=(function(){var c=cv(vw,vh),m=c.getContext('2d');m.drawImage(S.plate,0,0,vw,vh);var d;try{d=m.getImageData(0,0,vw,vh);}catch(e){return c;}
    var a=d.data;for(var i=0;i<a.length;i+=4){var l=(a[i]*.3+a[i+1]*.59+a[i+2]*.11)/255,v=sm((l-.28)/.3);a[i]=a[i+1]=a[i+2]=0;a[i+3]=Math.round(255*v);}m.putImageData(d,0,0);
    var o=cv(vw,vh),oq=o.getContext('2d');oq.filter='blur(1.6px)';oq.drawImage(c,0,0);oq.filter='none';
    oq.setTransform(sv,0,0,sv,0,0);var gr=oq.createRadialGradient(SHOE[0],SHOE[1],0,SHOE[0],SHOE[1],90);gr.addColorStop(0,'#000');gr.addColorStop(1,'rgba(0,0,0,0)');oq.fillStyle=gr;oq.fillRect(SHOE[0]-90,SHOE[1]-90,180,180);return o;})();}
function revealAt(t,a){return eo(seg(t,a[0],a[1]));}
function shoeTimes(ctx,G){var LB=labelBox(ctx,G),k=3;var sx=G.to.x+SHOE[0]*G.to.w/AW;if(LB&&LB.x+LB.w*.4<sx)k=4;var tl=extreme(k);return{k:k,tl:tl,land:tl+T.fly,LB:LB};}
function painting(g,ctx,S,G,t,a){var r=G.to,I=S.im||{};if(!S.full)return;var sc=r.w/AW;g.save();g.globalAlpha*=a;
  var fin=sm(seg(t,T.decay[1]-.05,T.decay[1]+.35));
  if(fin<1){g.save();g.translate(r.x,r.y);g.scale(sc,sc);
    g.drawImage(S.plate,0,0,AW,AH);
    // the slipper: in the painting until it flies, back in the painting when the label lets it go
    var st=shoeTimes(ctx,G),sa=t<st.tl?1:sm(seg(t,T.shoeBack[0],T.shoeBack[1]));if(sa>0&&I.shoe&&I.shoe.naturalWidth){g.save();g.globalAlpha*=sa;g.drawImage(I.shoe,LY.shoe.x,LY.shoe.y,LY.shoe.w,LY.shoe.h);g.restore();}
    // the cupid's forearm rises to his lips
    var aa=ARM.a0*(1-eio(seg(t,T.shush[0],T.shush[1])))*DEG;
    if(aa>.002&&I.arm&&I.arm.naturalWidth){g.save();g.globalAlpha*=Math.min(1,aa/(6*DEG));g.drawImage(I.armbg,ARM.x,ARM.y,ARM.w,ARM.h);g.restore();}
    if(I.arm&&I.arm.naturalWidth){g.save();g.translate(ARM.elbow[0],ARM.elbow[1]);g.rotate(aa);g.translate(-ARM.elbow[0],-ARM.elbow[1]);g.drawImage(I.arm,ARM.x,ARM.y,ARM.w,ARM.h);g.restore();}
    // the swing about its branch
    var ph=innerAngle(t);g.save();g.translate(PIV[0],PIV[1]);g.rotate(ph);g.translate(-PIV[0],-PIV[1]);g.drawImage(S.swing,SWB.x,SWB.y,SWB.w,SWB.h);g.restore();
    if(I.flowers&&I.flowers.naturalWidth)g.drawImage(I.flowers,LY.flowers.x,LY.flowers.y,LY.flowers.w,LY.flowers.h);
    // the veil: lifted where the light has reached
    var all=revealAt(t,T.revAll);
    if(all<1){var q=S.vq,vw=S.vc.width,vh=S.vc.height,sv=S.sv;q.setTransform(1,0,0,1,0,0);q.globalCompositeOperation='source-over';q.globalAlpha=1;q.clearRect(0,0,vw,vh);
      q.fillStyle=css(VEIL);q.fillRect(0,0,vw,vh);q.globalCompositeOperation='destination-out';
      var rw=revealAt(t,T.revW),rd=revealAt(t,T.revD),rm=revealAt(t,T.revM),rc=revealAt(t,T.shush)*.9;
      if(rw>0){q.globalAlpha=rw;q.save();q.translate(PIV[0]*sv,PIV[1]*sv);q.rotate(ph);q.translate(-PIV[0]*sv,-PIV[1]*sv);q.drawImage(S.mW,0,0);q.restore();}
      if(rd>0){q.globalAlpha=rd;q.drawImage(S.mD,0,0);}
      if(rm>0){q.globalAlpha=rm;q.drawImage(S.mM,0,0);}
      if(rc>0){q.globalAlpha=rc;q.drawImage(S.mC,0,0);}
      if(all>0){q.globalAlpha=all;q.fillStyle='#000';q.fillRect(0,0,vw,vh);}
      q.globalAlpha=1;q.globalCompositeOperation='source-over';
      g.globalCompositeOperation='multiply';g.imageSmoothingQuality='high';g.drawImage(S.vc,0,0,AW,AH);g.globalCompositeOperation='source-over';}
    g.restore();}
  if(fin>0){g.globalAlpha=a*fin;g.drawImage(S.full,r.x,r.y,r.w,r.h);}
  g.restore();}
// rest: a very gentle residual sway of the swing only (same pixels as the hung work at angle 0)
function restSway(g,S,r,dpr,tau){if(!S.swing||!S.plate)return;var ph=.5*DEG*sm(tau/3)*Math.sin(2*Math.PI*tau/3.8);if(Math.abs(ph)<1e-5)return;
  var sc=r.w/AW,m=14;g.save();g.translate(r.x,r.y);g.scale(sc,sc);g.beginPath();g.rect(SWB.x-m,SWB.y-m,SWB.w+2*m,SWB.h+2*m);g.clip();
  var k=S.plate.width/AW;g.drawImage(S.plate,(SWB.x-m)*k,(SWB.y-m)*k,(SWB.w+2*m)*k,(SWB.h+2*m)*k,SWB.x-m,SWB.y-m,SWB.w+2*m,SWB.h+2*m);
  g.translate(PIV[0],PIV[1]);g.rotate(ph);g.translate(-PIV[0],-PIV[1]);g.drawImage(S.swing,SWB.x,SWB.y,SWB.w,SWB.h);
  g.restore();g.save();g.translate(r.x,r.y);g.scale(sc,sc);var I=S.im||{};if(I.flowers&&I.flowers.naturalWidth)g.drawImage(I.flowers,LY.flowers.x,LY.flowers.y,LY.flowers.w,LY.flowers.h);g.restore();}

// ---- the label: placed exactly where the core will hang it (core hangLabels), shown when the slipper is on its way
function labelBox(ctx,G){var el=document.getElementById('lab'+ctx.to.idx);if(!el)return null;var fp=G.fp,f={left:G.to.x-fp,top:G.to.y-fp,right:G.to.x+G.to.w+fp,bottom:G.to.y+G.to.h+fp};
  var w=el.offsetWidth,h=el.offsetHeight,W=G.W,H=G.H,x,y,ft=document.querySelector('.foot'),footTop=ft?ft.getBoundingClientRect().top:H-80;
  if(W>1180){x=Math.round(f.right+34);y=Math.round(Math.max(64,Math.min(f.bottom-h,footTop-24-h)));}
  else if(W<=980&&H<520&&W>H){var eb=document.getElementById('era'+ctx.to.idx),b=eb?eb.getBoundingClientRect():null;x=Math.round(W*.58+24);y=Math.round((b?b.bottom:40)+14);}
  else{var gg=W<=560?16:36;x=Math.round(Math.min(Math.max(f.left,gg),W-gg-w));y=Math.round(f.bottom+16);}
  return{x:x,y:y,w:w,h:h,el:el};}
function shoe(g,ctx,S,G,t){var I=S.im||{};if(!I.shoe||!I.shoe.naturalWidth)return;var st=shoeTimes(ctx,G),LB=st.LB;
  if(LB&&LB.el.style.opacity)LB.el.style.opacity='';
  if(LB&&t>=st.tl+.1){if(LB.el.style.left!==LB.x+'px'){LB.el.style.left=LB.x+'px';LB.el.style.top=LB.y+'px';}ctx.ui.label(ctx.to.idx,true);}
  else if(t<st.tl+.1)ctx.ui.label(ctx.to.idx,false);
  if(t<st.tl||!LB)return;var gone=sm(seg(t,T.shoeBack[0],T.shoeBack[1]));if(gone>=1)return;
  var r=G.to,sc=r.w/AW,L=rot([r.x+SHOE[0]*sc,r.y+SHOE[1]*sc],G.piv,pageAngle(st.tl,G)),dir=LB.x+LB.w*.4>L[0]?1:-1;
  var big=2.7,sw=LY.shoe.w*sc*big,shh=LY.shoe.h*sc*big;
  var P=[LB.x+Math.min(LB.w*.62,LB.w-sw),LB.y-shh*.18];
  var u=seg(t,st.tl,st.land),x=lerp(L[0],P[0],u),apex=Math.max(18+shh,Math.min(L[1],P[1])-G.H*.16),hgt=Math.max(30,Math.min(L[1],P[1])-apex),y=lerp(L[1],P[1],u)-4*hgt*u*(1-u);
  var s=lerp(1,big,eo(u)),rest=dir*-.32,v=seg(t,st.land,st.land+.45),hop=u>=1?-9*Math.sin(Math.PI*v)*(1-v):0;
  // two somersaults on the way, then a little rock as it settles on the label
  var ang=u<1?(dir*4*Math.PI+rest)*eo(u):rest+dir*.35*(1-v)*Math.sin(v*Math.PI*2);
  g.save();g.globalAlpha=1-gone;
  // its shadow on the label paper once it is close
  var sd=sm(seg(u,.75,1));if(sd>0){g.fillStyle='rgba(40,30,20,'+(.16*sd).toFixed(3)+')';g.beginPath();g.ellipse(P[0]+sw*.1,P[1]+shh*.62,sw*.55,shh*.12,0,0,Math.PI*2);g.fill();}
  g.translate(x,y+hop);g.rotate(ang);var dw=LY.shoe.w*sc*s,dh=LY.shoe.h*sc*s;g.drawImage(I.shoe,-dw/2,-dh/2,dw,dh);g.restore();}
})();

;
/* 新古典 · 曲线被拉直成剑 — the passage from Fragonard's Swing (rococo) into David's Oath of the Horatii.
   Beats (seconds of D, full list in _wip/sync/neoclassical.timeline.md): the swing is still swaying · a snare hit freezes it · the two
   ropes snap taut, twang, turn to steel · the rocaille curls are combed out one by one into ruled lines · the pastel drains to lime-plaster
   grey with a touch of Roman red · the page snaps to a three-part grid in three clicks (咔、咔、咔): centred, set on the line, sized to the
   middle bay; the Latin words switch to Roman capitals · the grid's lines rise into Doric columns and carry three arches (three equal bays)
   · the steel rods lift off the page and fly into the father's fists as swords · the curves that couldn't be straightened (the whole soft
   page) are pushed into the right-hand bay and soften into the grieving women · the painting fills in behind the drawing: architecture,
   father, sons, women · the sons' arms rise together on three drum beats · all arms and blades are ruled to one point, the swords ·
   the camera pulls back, the drawing fades to a faint grid · hand-over. Rest: that faint grid and the convergence lines, fading after
   a few seconds.
   Painting space = main.webp pixels (2400 × 1871). Rococo space = rococo main.webp pixels (1912 × 2400), layers from rooms/rococo/cut. */
(function(){
'use strict';
// rest guards (API.md "Rest hooks"): while a compare tool is on ('era' | 'special') nothing is painted over ctx.to.rect; while reading, nothing
// is left inside ctx.readRect (a right-hand column fades out over `fade` px just before the panel's edge). Idle, not reading: no-op.
function rgBegin(ctx){var g=ctx.g,S=ctx.state,R=ctx.reading&&ctx.readRect,r=ctx.to&&ctx.to.rect,k=S.rgK||0,dt=Math.min(ctx.dt||0,.1);
  if(R)S.rgR={x:R.x,y:R.y,w:R.w,h:R.h};k+=((R?1:0)-k)*Math.min(1,dt*6);S.rgK=(!R&&k<.003)?0:(R&&k>.997)?1:k;
  g.save();if((ctx.tool==='era'||ctx.tool==='special')&&r){g.beginPath();g.rect(0,0,ctx.W,ctx.H);g.rect(r.x-1,r.y-1,r.w+2,r.h+2);g.clip('evenodd');}}
function rgEnd(ctx,fade){var g=ctx.g,S=ctx.state,R=S.rgR;if(!(S.rgK>0)||!R){g.restore();return;}
  g.save();g.globalCompositeOperation='destination-out';g.globalAlpha=S.rgK;
  if(R.x>ctx.W*.3){var f=fade==null?60:fade,x0=R.x-f,gr=g.createLinearGradient(x0,0,R.x,0);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'#000');
    g.fillStyle=gr;g.fillRect(x0,0,ctx.W-x0+1,ctx.H);}
  else{g.fillStyle='#000';g.fillRect(R.x,R.y,R.w,R.h);}
  g.restore();g.restore();}

var D=18.8, PW=2400, PH=1871, RW=1912, RH=2400;
var SH=window.EH_SHARED=window.EH_SHARED||{};
var LIME='#d8d1c3', RED='#8f2e22', INK='#3a332b';
// ------------------------------------------------------------------ timeline (seconds)
var T={sway:[0,1.1], snare:1.1, swap:[.75,1.1], taut:[1.1,1.34], twang:[1.1,2.0], steel:[1.3,2.1], glint:[1.6,2.5],
  curl0:2.0, curlStep:.34, curlDur:.52, drain:[2.3,4.3],
  grid:[4.3,4.72], k:[4.55,4.95,5.35], kDur:.26, font:4.95, txtOut:[6.2,7.4],
  cols:[5.7,7.2], caps:[6.9,7.5], arches:[7.2,8.4],
  camB:[8.3,11.4], lift:[7.8,9.6], pageOut:[8.2,9.7], push:[8.6,11.0], soft:[9.2,10.8], pushFade:[10.0,11.6],
  paint:[[8.3,9.9],[9.2,10.6],[9.8,11.2],[10.1,11.7]], rodOut:[9.8,10.6],
  beats:[12.0,12.7,13.4], beatDur:.26, conv:[13.45,14.3], ring:[13.9,15.2], armsReal:[13.9,14.3],
  pull:[14.3,17.8], linesOut:[15.2,17.4], wallTo:[14.4,17.6], title:17.2};
var HINT_A=.55;                                   // strength of the resting grid hint at hand-over (then it fades, see restHint)
// ------------------------------------------------------------------ the Oath's geometry (painting px), measured on main.webp
var GEO={cols:[830,1510], piers:[150,2190], spring:418, top:112, ground:1330, archC:[470,1170,1850], rIn:[270,252], rOut:[334,306],
  shaft:[70,60], cap:[418,396,372],               // shaft half-width bottom/top; capital: abacus top (spring), echinus top, … (y)
  P:[1118,702],                                   // the swords' grip: every arm and blade is ruled to it
  tips:[[948,1078],[985,1123],[1087,1143]],       // blade tips
  swords:[[[948,1078],[1146,546]],[[985,1123],[1170,544]]],   // the two ropes land on these (tip → pommel)
  women:[1925,1395]};
SH.neoclassicalGeom=GEO;
// arm layers (rooms/neoclassical/cut): box in painting px, the shoulder pivot (where the arm leaves the body) and the hand
// (from rooms/neoclassical/cut/layers.json: pivot = the visible shoulder end, hand = the tip)
var ARMS=[{id:'arm_top',file:'cut/arm_top.webp',x:800,y:731,w:264,h:130,piv:[807.5,848.2],hand:[1064.9,742.6]},
          {id:'arm_mid',file:'cut/arm_mid.webp',x:796,y:786,w:267,h:82,piv:[805.3,856.7],hand:[1062.4,797.1]},
          {id:'arm_low',file:'cut/arm_low.webp',x:655,y:851,w:355,h:91,piv:[651.1,912.1],hand:[1008.1,863.4]}];
var PLATE='cut/plate.webp', ARM_OK=false, USE_ARMS=false;   // USE_ARMS: the lowered arms read as paper cut-outs (roots float in front of the column,
// flat inpaint under them) → the plan's fallback: the arms stay, only the convergence lines move on the three beats    // set true once the cut-out agent's layers are in (see init)
var ARM_LOW=21*Math.PI/180;                       // how far the arms hang before the three beats
// rococo layers (rooms/rococo/cut/layers.json): plate + ropes + woman(swing) + flowers + shoe == main.webp
var ROC={plate:{f:'cut/plate.webp',x:0,y:0,w:1912,h:2400},ropes:{f:'cut/ropes.webp',x:932,y:609,w:553,h:732},woman:{f:'cut/woman.webp',x:502,y:1208,w:849,h:647},
  flowers:{f:'cut/flowers.webp',x:927,y:1689,w:253,h:60},shoe:{f:'cut/shoe.webp',x:424,y:1263,w:51,h:73},pivot:[1410.6,784.6],
  ropeL:[[1267.2,606.3],[1261.0,639.2],[1246.9,669.3],[1236.2,702.4],[1225.9,730.1],[1216.2,764.0],[1204.0,795.8],[1188.0,820.8],[1174.9,847.4],[1159.9,876.6],[1143.6,907.0],[1128.3,938.8],[1111.7,970.1],[1095.1,1001.5],[1084.7,1032.1],[1075.2,1062.4],[1058.9,1086.4],[1048.2,1118.1],[1034.2,1149.0],[1022.7,1182.0],[1008.1,1213.8],[993.1,1245.0],[982.9,1278.1],[966.8,1308.5],[949.7,1338.2],[932.6,1365.5],[922.8,1399.6],[912.6,1433.6],[902.1,1467.5],[896.9,1502.4],[894.1,1537.7],[891.3,1573.1]],
  ropeR:[[1476.6,1067.4],[1459.2,1084.9],[1443.3,1105.5],[1427.5,1126.1],[1416.4,1148.7],[1398.0,1164.9],[1383.1,1183.0],[1364.7,1196.4],[1349.5,1217.1],[1334.3,1236.9],[1320.9,1258.0],[1299.5,1272.0],[1278.4,1287.3],[1257.4,1302.5],[1236.3,1317.7],[1215.3,1333.0],[1194.2,1348.2],[1173.2,1363.5],[1152.1,1378.7],[1131.1,1393.9],[1110.0,1409.2],[1089.0,1424.4],[1067.9,1439.7],[1046.9,1454.9],[1025.8,1470.1],[1004.8,1485.4],[983.7,1500.6],[962.9,1516.2],[942.5,1532.3],[922.1,1548.4],[901.7,1564.5],[881.3,1580.6]]};
function rocAssets(){return[ROC.plate.f,ROC.ropes.f,ROC.woman.f,ROC.flowers.f,ROC.shoe.f];}

// ------------------------------------------------------------------ small helpers
function clamp(x){return x<0?0:x>1?1:x;}
function seg(t,a,b){return clamp((t-a)/(b-a));}
function lerp(a,b,u){return a+(b-a)*u;}
function sm(x){x=clamp(x);return x*x*(3-2*x);}
function eo(x){x=clamp(x);return 1-Math.pow(1-x,3);}
function eio(x){x=clamp(x);return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;}
function backOut(x){x=clamp(x);return x<.68?1.07*eio(x/.68):1.07-.07*sm((x-.68)/.32);}   // a magnetic click: quick, overshoots 7 %, settles
function cv(w,h){var c=document.createElement('canvas');c.width=Math.max(1,Math.round(w));c.height=Math.max(1,Math.round(h));return c;}
function hex(c){if(Array.isArray(c))return c;var mm=/^rgba?\(([^)]+)\)/.exec(String(c));if(mm)return mm[1].split(',').slice(0,3).map(function(v){return +v;});c=String(c||'#000').replace('#','');if(c.length===3)c=c.split('').map(function(x){return x+x;}).join('');var n=parseInt(c,16);return[(n>>16)&255,(n>>8)&255,n&255];}
function mixc(a,b,u){var x=hex(a),y=hex(b);return 'rgb('+[0,1,2].map(function(i){return Math.round(lerp(x[i],y[i],u));}).join(',')+')';}
function rgba(c,a){var x=hex(c);return 'rgba('+x[0]+','+x[1]+','+x[2]+','+(+a).toFixed(3)+')';}
function ok(im){return !!im&&((im.naturalWidth||im.width)>0);}

// ------------------------------------------------------------------ DOM touches (the rococo title/label snapping, Roman capitals) + watchdog
var dirty=[],watching=false,myIdx=-1;
var PROPS=['transform','opacity','transition','fontFamily','fontStyle','letterSpacing','fontWeight'];
function setCss(el,prop,val){if(!el)return;if(el.style[prop]!==val)el.style[prop]=val;if(val&&dirty.indexOf(el)<0){dirty.push(el);watch();}}
function clean(){dirty.forEach(function(el){PROPS.forEach(function(p){el.style[p]='';});});dirty=[];}
function watch(){if(watching)return;watching=true;(function loop(){var st=window.EH&&EH.debug&&EH.debug.state;
  if(!dirty.length){watching=false;return;}
  if(!st||st.idx!==myIdx||st.phase!=='enter'){clean();watching=false;return;}
  requestAnimationFrame(loop);})();}
var ROMAN="'Cinzel', 'Trajan Pro', 'Bodoni Moda', serif";
// the Roman capital face for this room's Latin (title, label, reading panel); Chinese keeps its face
function injectFont(idx){if(document.getElementById('neo-roman'))return;
  try{var l=document.createElement('link');l.rel='stylesheet';l.href='fonts/cinzel.css?v=d997a4615e';document.head.appendChild(l);}catch(e){}
  var s=document.createElement('style');s.id='neo-roman';
  s.textContent='#era'+idx+' .lat{font-family:'+ROMAN+';font-style:normal;font-size:17px;letter-spacing:.12em}'+
    '#era'+idx+' .yrs{font-family:'+ROMAN+';letter-spacing:.1em}'+
    '#lab'+idx+' .who>span{font-family:'+ROMAN+';font-style:normal;letter-spacing:.06em;font-size:.9em}'+
    '#room.neo-roman .read .lat{font-family:'+ROMAN+';font-style:normal;letter-spacing:.1em;font-size:18px}';
  document.head.appendChild(s);}
// rest marker class for the reading panel's Latin line (removed when another room is entered)
var restWatch=false;function markRoom(on){var r=document.getElementById('room');if(!r)return;r.classList.toggle('neo-roman',!!on);
  if(on&&!restWatch){restWatch=true;(function loop(){var st=window.EH&&EH.debug&&EH.debug.state;if(!st||st.idx!==myIdx){r.classList.remove('neo-roman');restWatch=false;return;}requestAnimationFrame(loop);})();}}

// ------------------------------------------------------------------ cameras: painting px → screen
function camA(W,H){var s=Math.min(W/2040,H/760);return{s:s,c:[1170,GEO.top+(.5*H-Math.max(.07*H,(H-1300*s)/2))/s]};}   // the arcade fills the screen: 3 bays = 3 thirds
function camB(W,H){var s=Math.min(W*.94/PW,H*.9/PH);return{s:s,c:[PW/2,PH/2]};}                                              // the whole oath, sons to women
function camF(W,H,r){var s=r.w/PW;return{s:s,c:[(W/2-r.x)/s,(H/2-r.y)/s]};}
function mixCam(a,b,u){return{s:Math.exp(lerp(Math.log(a.s),Math.log(b.s),u)),c:[lerp(a.c[0],b.c[0],u),lerp(a.c[1],b.c[1],u)]};}
function camAt(t,ctx){var W=ctx.W,H=ctx.H,A=camA(W,H),B=camB(W,H),F=camF(W,H,ctx.to.rect);
  if(t<T.camB[0])return A;if(t<T.pull[0])return mixCam(A,B,eio(seg(t,T.camB[0],T.camB[1])));return mixCam(B,F,eio(seg(t,T.pull[0],T.pull[1])));}
function xf(cam,W,H){return{s:cam.s,ox:W/2-cam.c[0]*cam.s,oy:H/2-cam.c[1]*cam.s};}
function X(m,x){return m.ox+x*m.s;}function Y(m,y){return m.oy+y*m.s;}

// ------------------------------------------------------------------ the rococo room at rest (its rest is replicated layer by layer so the ropes can be taken out)
function wash(g,W,H,r,dark,a){if(a<=0)return;var cx=+((r.x+r.w/2)/W*100).toFixed(1)/100*W,cy=+((r.y+r.h/2)/H*100).toFixed(1)/100*H;g.save();g.translate(cx,cy);g.scale(.7*W,.6*H);
  var gr=g.createRadialGradient(0,0,0,0,0,1);gr.addColorStop(0,dark?'rgba(255,255,255,.35)':'rgba(255,244,225,.08)');gr.addColorStop(.7,dark?'rgba(255,255,255,0)':'rgba(255,244,225,0)');gr.addColorStop(1,'rgba(255,255,255,0)');
  g.globalAlpha=a;g.fillStyle=gr;g.fillRect(-(cx/(.7*W))-.01,-(cy/(.6*H))-.01,1/.7+.02,1/.6+.02);g.restore();}
function frameDeco(g,r,style,a){if(a<=0)return;var fp=r.fp||0,x=r.x-fp,y=r.y-fp,w=r.w+2*fp,h=r.h+2*fp;g.save();g.globalAlpha*=a;
  if(style==='gilt'&&fp){var gr=g.createLinearGradient(x+w*.33,y,x+w*.67,y+h);gr.addColorStop(0,'#6d5230');gr.addColorStop(.55,'#3a2a14');gr.addColorStop(1,'#5c4424');g.fillStyle=gr;g.fillRect(x,y,w,h);
    g.strokeStyle='#241a0c';g.lineWidth=2;g.strokeRect(x+5,y+5,w-10,h-10);g.strokeStyle='#7a5e35';g.lineWidth=4;g.strokeRect(x+2.5,y+2.5,w-5,h-5);g.strokeStyle='#1c1409';g.lineWidth=1;g.strokeRect(x+.5,y+.5,w-1,h-1);}
  else if(style==='white'&&fp){g.fillStyle='#f2f0eb';g.fillRect(x,y,w,h);g.strokeStyle='rgba(0,0,0,.08)';g.lineWidth=1;g.strokeRect(x+9.5,y+9.5,w-19,h-19);g.strokeStyle='rgba(0,0,0,.07)';g.strokeRect(x+.5,y+.5,w-1,h-1);}
  else if(style==='stone'&&fp){var gs=g.createLinearGradient(0,y,0,y+h);gs.addColorStop(0,'#5b554c');gs.addColorStop(1,'#3f3a33');g.fillStyle=gs;g.fillRect(x,y,w,h);g.strokeStyle='rgba(0,0,0,.4)';g.lineWidth=1;g.strokeRect(x+.5,y+.5,w-1,h-1);}
  g.restore();}
function shadowCache(dpr,r,ox,oy,blur,spread){var M=Math.ceil(1.6*blur+Math.abs(ox)+Math.abs(oy)+4),X0=r.x-spread-M,Y0=r.y-spread-M,X1=r.x+r.w+spread+M,Y1=r.y+r.h+spread+M;
  var dx=Math.floor(X0*dpr),dy=Math.floor(Y0*dpr),c=cv(Math.ceil(X1*dpr)-dx,Math.ceil(Y1*dpr)-dy),q=c.getContext('2d');q.setTransform(dpr,0,0,dpr,-dx,-dy);
  q.shadowColor='#000';q.shadowBlur=blur*dpr;q.shadowOffsetX=(ox+1e5)*dpr;q.shadowOffsetY=oy*dpr;q.fillStyle='#000';q.fillRect(r.x-spread-1e5,r.y-spread,r.w+2*spread,r.h+2*spread);
  return{c:c,x:dx/dpr,y:dy/dpr,w:c.width/dpr,h:c.height/dpr,key:[dpr,r.x,r.y,r.w,r.h].join('/')};}
// frame shadow of the previous room's DOM frame (index.html .frame.f-* ::before box-shadow)
var SHADOWS={gilt:[0,28,70,-24,.8],white:[0,22,50,-22,.45],stone:[0,24,60,-24,.7],none:[0,26,60,-26,.6],fade:[0,26,60,-26,.6]};
// ---- the rococo rest, layer by layer. Copied from js/t-rococo.js (frame band profile, corner skeletons, rest sway) so each piece can be
// taken out and straightened; at t < T.swap[0] the page is drawn with EH_SHARED.rococoRest itself (exact p = 0).
var DEG=Math.PI/180,TAU0=11,GREY='grayscale(1) sepia(.2) contrast(.62) brightness(1.22)',SPR_U=4.4,SPR_M=.6;
function rocAngle(tau){return .5*DEG*sm(tau/3)*Math.sin(2*Math.PI*tau/3.8);}
var CORNERS=[{a:3.1,b:2.0,tilt:-12,sh:1.25},{a:2.2,b:3.3,tilt:16,sh:1.1},{a:2.6,b:1.7,tilt:-6,sh:.95},{a:1.9,b:2.7,tilt:9,sh:1.05}];
function scrollPts(x0,y0,x1,y1,side,turns,rv,n){var o=[],dx=x1-x0,dy=y1-y0,L=Math.hypot(dx,dy),ux=dx/L,uy=dy/L,nx=-uy*side,ny=ux*side,m=Math.round(n*.55);
  for(var i=0;i<m;i++){var s=i/(m-1),b=Math.sin(Math.PI*s)*.12*L;o.push([x0+dx*s+nx*b,y0+dy*s+ny*b]);}
  var cx=x1+nx*rv,cy=y1+ny*rv,a0=Math.atan2(y1-cy,x1-cx),k=n-m;
  for(var j=1;j<=k;j++){var u=j/k,ang=a0+side*u*turns*2*Math.PI,rr=rv*(1-.78*u);o.push([cx+Math.cos(ang)*rr,cy+Math.sin(ang)*rr]);}return o;}
function cornerSkeleton(c,prot){var A=scrollPts(.95,.5,c.a,.42,1,1.15,.26,20),B=[],C=scrollPts(.5,.95,.42,c.b,-1,1.15,.24,20),cx=.36,cy=.36,R=c.sh,t0=(225+c.tilt-58)*DEG,t1=(225+c.tilt+58)*DEG;
  for(var i=0;i<20;i++){var u=i/19,ang=lerp(t0,t1,u),rr=R*(.62+.08*Math.cos(u*Math.PI*6));rr=Math.min(rr,.62+prot/Math.max(.2,Math.abs(Math.cos(ang))+Math.abs(Math.sin(ang))-.3));B.push([cx+Math.cos(ang)*rr,cy+Math.sin(ang)*rr]);}
  return[A,B,C];}
function cornerStraight(c){var A=[],B=[],C=[];for(var i=0;i<20;i++){var u=i/19;A.push([lerp(0,c.a+.3,u),0]);C.push([0,lerp(0,c.b+.3,u)]);B.push(u<.5?[0,lerp(.7,0,u*2)]:[lerp(0,.7,u*2-1),0]);}return[A,B,C];}
function cornerXf(i,r,fp){var X0=r.x-fp,Y0=r.y-fp,X2=r.x+r.w+fp,Y2=r.y+r.h+fp;return[[fp,0,0,fp,X0,Y0],[0,fp,-fp,0,X2,Y0],[-fp,0,0,-fp,X2,Y2],[0,-fp,fp,0,X0,Y2]][i];}
function ap(m,p){return[m[0]*p[0]+m[2]*p[1]+m[4],m[1]*p[0]+m[3]*p[1]+m[5]];}
var PROF=[[0,'#4a3312'],[.07,'#8a6526'],[.2,'#f1d88f'],[.34,'#c89c4c'],[.52,'#7d5a22'],[.66,'#b88c40'],[.78,'#ecd08a'],[.9,'#8d6a2c'],[1,'#3a2708']],SIDE_TONE=[1,.8,.68,.92];
function band(g,r,fp){if(fp<=0)return;var x=r.x,y=r.y,w=r.w,h=r.h,X0=x-fp,Y0=y-fp,WW=w+2*fp,HH=h+2*fp;g.save();
  var sides=[[[X0,Y0],[X0+WW,Y0],[x+w,y],[x,y],[0,Y0,0,y]],[[X0+WW,Y0],[X0+WW,Y0+HH],[x+w,y+h],[x+w,y],[X0+WW,0,x+w,0]],[[X0+WW,Y0+HH],[X0,Y0+HH],[x,y+h],[x+w,y+h],[0,Y0+HH,0,y+h]],[[X0,Y0+HH],[X0,Y0],[x,y],[x,y+h],[X0,0,x,0]]];
  sides.forEach(function(s,i){var q=s[4],gr=g.createLinearGradient(q[0],q[1],q[2],q[3]);PROF.forEach(function(st){var c=hex(st[1]),k=SIDE_TONE[i];gr.addColorStop(st[0],'rgb('+Math.round(c[0]*k)+','+Math.round(c[1]*k)+','+Math.round(c[2]*k)+')');});
    g.fillStyle=gr;g.beginPath();g.moveTo(s[0][0],s[0][1]);g.lineTo(s[1][0],s[1][1]);g.lineTo(s[2][0],s[2][1]);g.lineTo(s[3][0],s[3][1]);g.closePath();g.fill();});
  g.strokeStyle='rgba(60,40,12,.45)';g.lineWidth=.8;g.beginPath();g.moveTo(X0,Y0);g.lineTo(x,y);g.moveTo(X0+WW,Y0);g.lineTo(x+w,y);g.moveTo(X0+WW,Y0+HH);g.lineTo(x+w,y+h);g.moveTo(X0,Y0+HH);g.lineTo(x,y+h);g.stroke();
  g.strokeStyle='rgba(40,26,6,.9)';g.lineWidth=1;g.strokeRect(x-.5,y-.5,w+1,h+1);g.restore();}
function greyOf(src,w,h){var c=cv(w||src.width,h||src.height),q=c.getContext('2d');q.filter=GREY;q.drawImage(src,0,0,c.width,c.height);q.filter='none';return c;}
// per size: the rococo frame (band + ornaments, as its rest draws it) and the band alone, in colour and in lime plaster; grey painting layers
function ensureRoc(ctx,S){var F=ctx.from,r=F.rect,fp=r.fp||0,dpr=ctx.dpr||1,prot=ctx.W<=980?.12:.4,key=[r.x,r.y,r.w,r.h,fp,dpr,ctx.W].join('/');if(S.rocKey===key)return;S.rocKey=key;
  var mg=(prot+.35)*fp+3,bx=r.x-fp-mg,by=r.y-fp-mg,bw=r.w+2*fp+2*mg,bh=r.h+2*fp+2*mg;S.fb={x:bx,y:by,w:bw,h:bh,fp:fp,prot:prot};
  var mk=function(fn){var c=cv(bw*dpr,bh*dpr),q=c.getContext('2d');q.setTransform(dpr,0,0,dpr,-bx*dpr,-by*dpr);try{fn(q);}catch(e){console.error(e);}return c;};
  S.fc=mk(function(q){if(SH.rococoRest)SH.rococoRest(q,{W:ctx.W,H:ctx.H,rect:r,dpr:dpr,t:0});else band(q,r,fp);});
  S.bc=mk(function(q){band(q,r,fp);});S.gfc=greyOf(S.fc);S.gbc=greyOf(S.bc);
  var k=Math.min(1,r.w*dpr/RW*1.25);S.gl={};S.cl={};['plate','ropes','woman','flowers','shoe'].forEach(function(n){var im=S.roc[n];if(!ok(im))return;var L=ROC[n];
    S.cl[n]=im;if(n!=='ropes')S.gl[n]=greyOf(im,L.w*k,L.h*k);});
  S.sk=CORNERS.map(function(c){return cornerSkeleton(c,prot);});S.st=CORNERS.map(cornerStraight);
  var sh=SHADOWS[F.frame]||SHADOWS.none,fbx={x:r.x-fp,y:r.y-fp,w:r.w+2*fp,h:r.h+2*fp};S.shFr=shadowCache(dpr,fbx,sh[0],sh[1],sh[2],sh[3]);S.shA=sh[4];}
// the painting from its layers: plate, ropes, the woman on the swing (at angle th about the pivot), flowers, shoe
function paintLayers(g,S,r,set,a,th,ropesA,plateA,womanA){var k=r.w/RW,L=ROC;if(a<=0)return;g.save();g.translate(r.x,r.y);g.scale(k,k);
  if(plateA>0&&set.plate){g.globalAlpha=a*plateA;g.drawImage(set.plate,0,0,RW,RH);}
  g.save();if(th){g.translate(L.pivot[0],L.pivot[1]);g.rotate(th);g.translate(-L.pivot[0],-L.pivot[1]);}
  if(ropesA>0&&set.ropes){g.globalAlpha=a*ropesA;g.drawImage(set.ropes,L.ropes.x,L.ropes.y,L.ropes.w,L.ropes.h);}
  if(womanA>0&&set.woman){g.globalAlpha=a*womanA;g.drawImage(set.woman,L.woman.x,L.woman.y,L.woman.w,L.woman.h);}
  g.restore();
  if(plateA>0){g.globalAlpha=a*plateA;if(set.flowers)g.drawImage(set.flowers,L.flowers.x,L.flowers.y,L.flowers.w,L.flowers.h);if(set.shoe)g.drawImage(set.shoe,L.shoe.x,L.shoe.y,L.shoe.w,L.shoe.h);}
  g.restore();}
// the frame: the band stays, each corner ornament fades as its scroll is taken over by a ribbon that gets combed straight
function cornerPoly(r,fp,i){var M=cornerXf(i,r,fp);return[[-SPR_M,-SPR_M],[SPR_U-SPR_M,-SPR_M],[SPR_U-SPR_M,SPR_U-SPR_M],[-SPR_M,SPR_U-SPR_M]].map(function(p){return ap(M,p);});}
function cornerA(t,i){var t0=T.curl0+i*T.curlStep;return 1-sm(seg(t,t0+.05,t0+.36));}
function framePass(g,S,r,t,fc,bc,a){if(a<=0||!fc)return;var fp=r.fp||0,fb=S.fb;g.save();g.globalAlpha=a;g.drawImage(bc,fb.x,fb.y,fb.w,fb.h);
  g.save();g.beginPath();g.rect(fb.x,fb.y,fb.w,fb.h);for(var i=0;i<4;i++){var P=cornerPoly(r,fp,i);g.moveTo(P[0][0],P[0][1]);for(var j=1;j<4;j++)g.lineTo(P[j][0],P[j][1]);g.closePath();}g.clip('evenodd');g.drawImage(fc,fb.x,fb.y,fb.w,fb.h);g.restore();
  for(i=0;i<4;i++){var ca=cornerA(t,i);if(ca<=0)continue;var Q=cornerPoly(r,fp,i);g.save();g.beginPath();g.moveTo(Q[0][0],Q[0][1]);for(j=1;j<4;j++)g.lineTo(Q[j][0],Q[j][1]);g.closePath();g.clip();g.globalAlpha=a*ca;g.drawImage(fc,fb.x,fb.y,fb.w,fb.h);g.restore();}
  g.restore();}
function drawPage(g,ctx,S,t,pg,drain){var F=ctx.from,r=F.rect,fp=r.fp||0,tau=TAU0+Math.min(t,T.snare),th=rocAngle(tau);ensureRoc(ctx,S);
  var fade=1-sm(seg(t,T.pageOut[0],T.pageOut[1])),soft=sm(seg(t,T.soft[0],T.soft[1])),ropesA=1-sm(seg(t,T.swap[0],T.swap[1])),frameA=fade*(1-sm(seg(t,T.k[2],T.k[2]+1.2)));
  g.save();g.globalAlpha=pg.a;pageXform(g,pg);
  var sa=S.shA*(1-drain)*fade;if(sa>0){g.globalAlpha=pg.a*sa;g.drawImage(S.shFr.c,S.shFr.x,S.shFr.y,S.shFr.w,S.shFr.h);g.globalAlpha=pg.a;}
  if(t<T.swap[0]){g.drawImage(F.image,r.x,r.y,r.w,r.h);if(SH.rococoRest){try{SH.rococoRest(g,{W:ctx.W,H:ctx.H,rect:r,dpr:ctx.dpr||1,t:tau});}catch(e){console.error(e);}}else band(g,r,fp);}
  else{var wa=1-soft;
    if(drain<1){paintLayers(g,S,r,S.cl,pg.a,th,ropesA,fade,wa);framePass(g,S,r,t,S.fc,S.bc,pg.a*frameA);}
    if(drain>0){paintLayers(g,S,r,S.gl,pg.a*drain,th,0,fade,wa);framePass(g,S,r,t,S.gfc,S.gbc,pg.a*drain*frameA);}
    // the soft remainder of the woman: what couldn't be straightened
    if(soft>0&&S.soft){var k=r.w/RW;g.save();g.translate(r.x,r.y);g.scale(k,k);g.translate(ROC.pivot[0],ROC.pivot[1]);g.rotate(th);g.translate(-ROC.pivot[0],-ROC.pivot[1]);
      g.globalAlpha=pg.a*soft;g.drawImage(S.soft,ROC.woman.x-60,ROC.woman.y-60,ROC.woman.w+120,ROC.woman.h+120);g.restore();}}
  g.restore();}
// pastel → lime plaster: saturation out, the darks lifted, a warm lime tint (blend fills on what is already there; no filters)
function plaster(g,x,y,w,h,a){if(a<=0)return;g.save();g.beginPath();g.rect(x,y,w,h);g.clip();
  g.globalCompositeOperation='saturation';g.globalAlpha=a;g.fillStyle='#808080';g.fillRect(x,y,w,h);
  g.globalCompositeOperation='screen';g.globalAlpha=a*.62;g.fillStyle='#6f6a61';g.fillRect(x,y,w,h);
  g.globalCompositeOperation='multiply';g.globalAlpha=a;g.fillStyle='#efe8da';g.fillRect(x,y,w,h);
  g.restore();}

// ------------------------------------------------------------------ the page (the rococo painting as an object on the wall) and its snaps
// returns {cx,cy,s,a}: the page's centre on screen, its scale against ctx.from.rect, its alpha
function pageAt(t,ctx){var W=ctx.W,H=ctx.H,r=ctx.from.rect,cx0=r.x+r.w/2,cy0=r.y+r.h/2,m=xf(camA(W,H),W,H);
  // the middle bay: between the column shafts, under the springing line
  var bw=(GEO.cols[1]-GEO.cols[0]-2*GEO.shaft[0])*m.s*.84,ytop=Y(m,GEO.spring)+.06*H,hmax=Math.max(60,H*.94-ytop),s1=Math.min(bw/r.w,hmax/r.h),cy1=ytop+r.h*s1/2;
  var k1=backOut(seg(t,T.k[0],T.k[0]+T.kDur)),k2=backOut(seg(t,T.k[1],T.k[1]+T.kDur)),k3=backOut(seg(t,T.k[2],T.k[2]+T.kDur));
  var cx=lerp(cx0,W/2,k1),s=lerp(1,s1,k2),cy=lerp(cy0,cy1,k3),a=1;   // click 1: centred · click 2: sized to the bay · click 3: set on the line
  // pushed into the right-hand bay, where the women will be
  var pu=eio(seg(t,T.push[0],T.push[1]));if(pu>0){var mm=xf(camAt(t,ctx),W,H),tx=X(mm,GEO.women[0]),ty=Y(mm,GEO.women[1]);cx=lerp(cx,tx,pu);cy=lerp(cy,ty,pu);s=s*lerp(1,.92,pu);}
  a=1-sm(seg(t,T.pushFade[0],T.pushFade[1]));
  return{cx:cx,cy:cy,s:s,a:a,cx0:cx0,cy0:cy0};}
function pageXform(g,pg){g.translate(pg.cx,pg.cy);g.scale(pg.s,pg.s);g.translate(-pg.cx0,-pg.cy0);}
function pagePt(pg,x,y){return[pg.cx+(x-pg.cx0)*pg.s,pg.cy+(y-pg.cy0)*pg.s];}

// ------------------------------------------------------------------ the rocaille corners combed out into ruled lines, one by one, then set on the grid
function strokePts(g,P){g.beginPath();g.moveTo(P[0][0],P[0][1]);for(var i=1;i<P.length;i++)g.lineTo(P[i][0],P[i][1]);g.stroke();}
// grid target of corner i (painting px): tl → left column axis, tr → right column axis, br → the top line, bl → springing line (Roman red)
function curlTarget(i){return i===0?[[GEO.cols[0],-600],[GEO.cols[0],2600]]:i===1?[[GEO.cols[1],-600],[GEO.cols[1],2600]]:i===2?[[-1600,GEO.top],[4000,GEO.top]]:[[-1600,GEO.spring],[4000,GEO.spring]];}
var SUB=[[0,.55],[.3,.7],[.45,1]];   // where along the grid line each strand (scroll A, shell rim B, scroll C) lands
function drawCurls(g,ctx,S,t,pg){var F=ctx.from,r=F.rect,fp=r.fp||0;if(!fp||!S.sk)return;var W=ctx.W,H=ctx.H,m=xf(camAt(t,ctx),W,H),gridK=eio(seg(t,T.grid[0],T.grid[1])),dim=1-sm(seg(t,T.linesOut[0],T.linesOut[1]));
  g.save();g.lineCap='round';g.lineJoin='round';
  for(var i=0;i<4;i++){var t0=T.curl0+i*T.curlStep,inA=sm(seg(t,t0,t0+.25));if(inA<=0)continue;
    var st=eio(seg(t,t0+.12,t0+T.curlDur)),thin=sm(seg(t,t0+.3,t0+T.curlDur+.25)),ta=t-(t0+T.curlDur),tw=ta>0?Math.exp(-ta*11)*Math.sin(ta*52):0;
    var M=cornerXf(i,r,fp),tg=curlTarget(i),A0=[X(m,tg[0][0]),Y(m,tg[0][1])],B0=[X(m,tg[1][0]),Y(m,tg[1][1])],vert=i<2;
    var colFade=vert?1-sm(seg(t,T.cols[0]+.5,T.cols[1]+.2)):1,al=inA*dim*colFade;if(al<=0)continue;
    var col=mixc('#d9b566',i===3?RED:INK,thin),wmul=fp*pg.s;
    for(var j=0;j<3;j++){var Pk=S.sk[i][j],Ps=S.st[i][j],n=Pk.length,P=[];
      for(var k=0;k<n;k++){var u=k/(n-1),c=[lerp(Pk[k][0],Ps[k][0],st),lerp(Pk[k][1],Ps[k][1],st)],q=ap(M,c),s2=pagePt(pg,q[0],q[1]);
        var ov=tw*.35*fp*Math.sin(u*Math.PI);if(vert)s2[0]+=ov;else s2[1]+=ov;
        if(gridK>0){var v=lerp(SUB[j][0],SUB[j][1],u);s2=[lerp(s2[0],lerp(A0[0],B0[0],v),gridK),lerp(s2[1],lerp(A0[1],B0[1],v),gridK)];}P.push(s2);}
      var w0=(j===0?.38:j===2?.34:.16)*wmul,w=lerp(w0,Math.max(.9,Math.min(1.5,1.1*m.s/.6)),thin);
      if(thin<1){g.globalAlpha=al*(1-thin)*.95;g.strokeStyle='#3c2608';g.lineWidth=w+.1*wmul;strokePts(g,P);}
      g.globalAlpha=al*(j===1?1-thin*.6:1);g.strokeStyle=col;g.lineWidth=w;strokePts(g,P);
      if(thin<1){g.globalAlpha=al*(1-thin)*.85;g.strokeStyle='rgba(255,243,200,1)';g.lineWidth=Math.max(.5,.06*wmul);strokePts(g,P);}}}
  g.restore();}

// ------------------------------------------------------------------ ropes → steel rods → swords
function ropeScreen(pg,r,path,sway){var k=r.w/RW,c=Math.cos(sway),s=Math.sin(sway),pv=ROC.pivot;return path.map(function(q){var x=q[0],y=q[1];
  if(sway){var dx=x-pv[0],dy=y-pv[1];x=pv[0]+dx*c-dy*s;y=pv[1]+dx*s+dy*c;}return pagePt(pg,r.x+x*k,r.y+y*k);});}
// width profile of a sword along its axis (from the tip): half-width in units of w
function swordHalf(u){return u<.1?u/.1*.5:u<.76?.5-.06*(u-.1)/.66:u<.8?1.55:u<.94?.28:.5;}
function blade(g,a,b,w,m,steel,gl,alpha){if(alpha<=0)return;var dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L,nx=-uy,ny=ux,N=16,l=[],rr=[];
  var rodH=Math.max(.9,w*.12);
  for(var i=0;i<=N;i++){var u=i/N,h=lerp(rodH,Math.max(rodH,w*swordHalf(u)),m),x=a[0]+dx*u,y=a[1]+dy*u;l.push([x+nx*h,y+ny*h]);rr.push([x-nx*h,y-ny*h]);}
  // extra stations at the guard so the crossbar is square
  g.save();g.globalAlpha=alpha;
  var gr=g.createLinearGradient(a[0]+nx*w,a[1]+ny*w,a[0]-nx*w,a[1]-ny*w);
  gr.addColorStop(0,mixc('#9b7a48','#7d858c',steel));gr.addColorStop(.45,mixc('#d7bb86','#eef2f4',steel));gr.addColorStop(.55,mixc('#b8955e','#b9c1c7',steel));gr.addColorStop(1,mixc('#7e6238','#5d646b',steel));
  g.fillStyle=gr;g.beginPath();g.moveTo(l[0][0],l[0][1]);for(i=1;i<=N;i++)g.lineTo(l[i][0],l[i][1]);for(i=N;i>=0;i--)g.lineTo(rr[i][0],rr[i][1]);g.closePath();g.fill();
  if(m>.2){g.globalAlpha=alpha*(m-.2)/.8*.7;g.strokeStyle='rgba(60,64,70,.8)';g.lineWidth=.8;g.beginPath();g.moveTo(a[0]+dx*.03,a[1]+dy*.03);g.lineTo(a[0]+dx*.75,a[1]+dy*.75);g.stroke();}  // the fuller
  if(gl!=null&&gl>0&&gl<1){var gx=a[0]+dx*(1-gl),gy=a[1]+dy*(1-gl),R=Math.max(10,w*3);g.globalCompositeOperation='lighter';g.globalAlpha=alpha*Math.sin(gl*Math.PI)*.9;
    var rg=g.createRadialGradient(gx,gy,0,gx,gy,R);rg.addColorStop(0,'rgba(255,255,255,.95)');rg.addColorStop(.3,'rgba(220,235,255,.35)');rg.addColorStop(1,'rgba(200,220,255,0)');g.fillStyle=rg;g.fillRect(gx-R,gy-R,2*R,2*R);}
  g.restore();}
// the rope as a twisted cord along a polyline (before and while it snaps taut)
function cord(g,P,w,alpha){if(alpha<=0)return;g.save();g.globalAlpha=alpha;g.lineCap='round';g.lineJoin='round';
  g.strokeStyle='#6d5433';g.lineWidth=w+1;strokePts(g,P);g.strokeStyle='#c9a56b';g.lineWidth=w;strokePts(g,P);
  g.strokeStyle='rgba(245,225,180,.8)';g.lineWidth=Math.max(.6,w*.35);g.setLineDash([w*1.1,w*1.3]);strokePts(g,P);g.restore();}
function resample(P,n){var L=[0];for(var i=1;i<P.length;i++)L.push(L[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));var tot=L[L.length-1],out=[],j=1;
  for(var k=0;k<n;k++){var d=tot*k/(n-1);while(j<P.length-1&&L[j]<d)j++;var u=(d-L[j-1])/((L[j]-L[j-1])||1);out.push([lerp(P[j-1][0],P[j][0],u),lerp(P[j-1][1],P[j][1],u)]);}return out;}
function drawRopes(g,ctx,S,t,pg,sway){var r=ctx.from.rect,W=ctx.W,H=ctx.H;
  var inA=sm(seg(t,T.swap[0],T.swap[1]));if(inA<=0)return;
  var ta=eo(seg(t,T.taut[0],T.taut[1])),tw=t>T.snare?Math.exp(-(t-T.snare)*7)*Math.sin((t-T.snare)*55):0,steel=sm(seg(t,T.steel[0],T.steel[1]));
  var lift=eio(seg(t,T.lift[0],T.lift[1])),m=xf(camAt(t,ctx),W,H),out=1-sm(seg(t,T.rodOut[0],T.rodOut[1]));
  [ROC.ropeL,ROC.ropeR].forEach(function(path,i){var P=resample(ropeScreen(pg,r,path,sway),24),a=P[0],b=P[P.length-1],dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L;
    var Q=P.map(function(q,k){var u=k/(P.length-1),lx=lerp(a[0],b[0],u),ly=lerp(a[1],b[1],u),v=tw*L*.035*Math.sin(u*Math.PI);return[lerp(q[0],lx,ta)+nx*v,lerp(q[1],ly,ta)+ny*v];});
    var wr=Math.max(1.4,r.w*pg.s/RW*9);
    if(steel<1&&lift<=0)cord(g,Q,wr,inA*(1-steel));
    if(steel>0){var sw=GEO.swords[i],A=[X(m,sw[0][0]),Y(m,sw[0][1])],B=[X(m,sw[1][0]),Y(m,sw[1][1])];
      // tip = the rope's lower end (the seat), pommel = its upper end (the tree): lifted off the page, turned and carried into the father's fists
      var a1=Q[Q.length-1],b1=Q[0],arc=Math.sin(lift*Math.PI)*H*.06;
      var ta2=[lerp(a1[0],A[0],lift),lerp(a1[1],A[1],lift)-arc],tb2=[lerp(b1[0],B[0],lift),lerp(b1[1],B[1],lift)-arc];
      var wd=lerp(Math.max(2.4,wr*1.2),Math.max(4,26*m.s),eio(seg(t,T.lift[0]+.3,T.lift[1])));
      var gl=seg(t,T.glint[0]+i*.18,T.glint[1]+i*.18);
      blade(g,ta2,tb2,wd,eio(seg(t,T.lift[0]+.2,T.lift[1])),steel,gl,Math.min(1,inA*steel*1.4)*out);}});}

// ------------------------------------------------------------------ the arcade drawing (ruled lines, painting space)
function lineK(t,a,b){return eio(seg(t,a,b));}
function drawArcade(g,ctx,t,m,alpha){if(alpha<=0)return;var W=ctx.W,H=ctx.H,gk=eio(seg(t,T.grid[0],T.grid[1]));var s=m.s,lw=Math.max(.8,Math.min(1.6,1.1*s/.6));
  g.save();g.lineCap='butt';g.globalAlpha=alpha;
  // the grid: piers and column axes (full height), springing line in Roman red, the top line
  if(gk>0){g.strokeStyle=rgba(INK,.55*gk);g.lineWidth=lw;
    [GEO.piers[0],GEO.piers[1]].forEach(function(x){var sx=X(m,x);g.beginPath();g.moveTo(sx,0);g.lineTo(sx,H*gk);g.stroke();});
    // third-lines of the height, very faint (the page is set on them)
    g.strokeStyle=rgba(INK,.18*gk);[1/3,2/3].forEach(function(f){g.beginPath();g.moveTo(0,H*f);g.lineTo(W*gk,H*f);g.stroke();});}
  // columns: the axis lines rise into shafts (drawn from the ground up), capitals, then the arches spring
  var ck=lineK(t,T.cols[0],T.cols[1]);
  if(ck>0){g.strokeStyle=rgba(INK,.8);g.lineWidth=lw;
    GEO.cols.forEach(function(cx,j){var k=lineK(t,T.cols[0]+j*.18,T.cols[1]+j*.18),yb=GEO.ground,yt=GEO.cap[0]+22,yk=lerp(yb,yt,k),hb=GEO.shaft[0],ht=GEO.shaft[1];
      var hk=lerp(hb,ht,(yb-yk)/(yb-yt));
      g.beginPath();g.moveTo(X(m,cx-hb),Y(m,yb));g.lineTo(X(m,cx-hk),Y(m,yk));g.moveTo(X(m,cx+hb),Y(m,yb));g.lineTo(X(m,cx+hk),Y(m,yk));g.stroke();
      // flutes (lighter)
      g.save();g.strokeStyle=rgba(INK,.3);g.lineWidth=lw*.7;[-.5,0,.5].forEach(function(f){g.beginPath();g.moveTo(X(m,cx+hb*f),Y(m,yb));g.lineTo(X(m,cx+hk*f),Y(m,yk));g.stroke();});g.restore();
      // pier lines at the edges (pilasters)
      });
    GEO.piers.forEach(function(px,j){var sd=j?-1:1,yk=lerp(GEO.ground,GEO.spring,ck);g.beginPath();g.moveTo(X(m,px+sd*50),Y(m,GEO.ground));g.lineTo(X(m,px+sd*50),Y(m,yk));g.stroke();});}
  var cp=lineK(t,T.caps[0],T.caps[1]);
  if(cp>0){g.strokeStyle=rgba(INK,.85*cp);g.lineWidth=lw;
    GEO.cols.forEach(function(cx){var y0=GEO.cap[0]+22,ab=GEO.cap[0],ec=GEO.cap[1],w1=GEO.shaft[1],w2=108*lerp(.6,1,cp);
      g.beginPath();g.moveTo(X(m,cx-w1),Y(m,y0));g.quadraticCurveTo(X(m,cx-w2),Y(m,y0-4),X(m,cx-w2),Y(m,ab+4));g.lineTo(X(m,cx+w2),Y(m,ab+4));g.quadraticCurveTo(X(m,cx+w2),Y(m,y0-4),X(m,cx+w1),Y(m,y0));g.stroke();   // echinus
      g.strokeRect(X(m,cx-w2-6),Y(m,ab-20),(2*w2+12)*m.s,24*m.s);   // abacus
      g.beginPath();g.moveTo(X(m,cx-w1),Y(m,y0+10));g.lineTo(X(m,cx+w1),Y(m,y0+10));g.stroke();});   // necking
    GEO.piers.forEach(function(px,j){var sd=j?-1:1;g.strokeRect(X(m,px+sd*50-(j?0:0)-60),Y(m,GEO.spring-20),120*m.s,24*m.s);});}
  // the arches: each half springs from its impost and meets its twin at the crown
  var ar=lineK(t,T.arches[0],T.arches[1]);
  if(ar>0){g.strokeStyle=rgba(INK,.85);g.lineWidth=lw;
    GEO.archC.forEach(function(ax,j){var k=eio(seg(t,T.arches[0]+j*.14,T.arches[1]+j*.14-.28));if(k<=0)return;var yc=GEO.spring-4,cx=X(m,ax),cy=Y(m,yc);
      [[GEO.rIn[0],GEO.rIn[1]],[GEO.rOut[0],GEO.rOut[1]]].forEach(function(R){g.beginPath();g.ellipse(cx,cy,R[0]*m.s,R[1]*m.s,0,Math.PI,Math.PI+Math.PI/2*k);g.stroke();
        g.beginPath();g.ellipse(cx,cy,R[0]*m.s,R[1]*m.s,0,2*Math.PI,2*Math.PI-Math.PI/2*k,true);g.stroke();});
      // voussoirs
      g.save();g.strokeStyle=rgba(INK,.35);g.lineWidth=lw*.7;for(var v=1;v<12;v++){var a=Math.PI+Math.PI*v/12,vis=v<6?(v/6<=k):((12-v)/6<=k);if(!vis)continue;
        g.beginPath();g.moveTo(cx+Math.cos(a)*GEO.rIn[0]*m.s,cy+Math.sin(a)*GEO.rIn[1]*m.s);g.lineTo(cx+Math.cos(a)*GEO.rOut[0]*m.s,cy+Math.sin(a)*GEO.rOut[1]*m.s);g.stroke();}g.restore();});}
  g.restore();}

// ------------------------------------------------------------------ the Oath: region layers (cumulative, feathered), arms, convergence lines
var REG=[   // polygons in painting px; the painting is laid in this order (architecture, father, sons, women)
  null,
  [[930,520],[1260,520],[1500,690],[1530,1100],[1500,1760],[1100,1790],[930,1760],[905,1150],[905,700]],
  [[0,600],[560,590],[720,640],[905,690],[905,1150],[930,1760],[0,1871],[0,600]],
  [[1470,990],[2400,960],[2400,1871],[1440,1871],[1480,1400]]];
var SPEAR=[[40,265],[118,265],[200,1760],[150,1760]];
function buildRegions(ctx,S){var src=S.plateOK?S.plate:ctx.to.image;if(!ok(src))return;
  var q=Math.min(2,ctx.dpr||1),w=Math.min(1700,Math.round(PW*Math.max(camA(ctx.W,ctx.H).s,camB(ctx.W,ctx.H).s)*q)),h=Math.round(w*PH/PW),k=w/PW,mw=240,mh=Math.round(mw*PH/PW),km=mw/PW;
  S.reg=[];var lab=cv(mw,mh),lg=lab.getContext('2d');
  for(var i=0;i<4;i++){lg.clearRect(0,0,mw,mh);lg.fillStyle='#000';
    if(i===3){lg.fillRect(0,0,mw,mh);}
    else{// cumulative: architecture = everything that is not a later region; then add the regions one by one
      lg.fillRect(0,0,mw,mh);lg.globalCompositeOperation='destination-out';
      for(var j=i+1;j<4;j++){lg.beginPath();REG[j].forEach(function(p,n){if(n)lg.lineTo(p[0]*km,p[1]*km);else lg.moveTo(p[0]*km,p[1]*km);});lg.closePath();lg.fill();
        if(j===2){lg.beginPath();SPEAR.forEach(function(p,n){if(n)lg.lineTo(p[0]*km,p[1]*km);else lg.moveTo(p[0]*km,p[1]*km);});lg.closePath();lg.fill();}}
      lg.globalCompositeOperation='source-over';}
    var c=cv(w,h),g=c.getContext('2d');
    if(i<3){g.filter='blur('+(w/PW*26).toFixed(1)+'px)';g.drawImage(lab,0,0,w,h);g.filter='none';g.globalCompositeOperation='source-in';}
    g.drawImage(src,0,0,w,h);S.reg.push(c);}
  S.regKey=w;}
function drawArm(g,S,A,ang,m,al){var im=S.arm[A.id];if(!ok(im)||al<=0)return;g.save();g.globalAlpha=al;g.translate(X(m,A.piv[0]),Y(m,A.piv[1]));g.rotate(ang);g.translate(-X(m,A.piv[0]),-Y(m,A.piv[1]));
  g.drawImage(im,X(m,A.x),Y(m,A.y),A.w*m.s,A.h*m.s);g.restore();}
function armAngle(t){var a=ARM_LOW;for(var i=0;i<3;i++){var e=backOut(seg(t,T.beats[i],T.beats[i]+T.beatDur));a-=ARM_LOW/3*e;}return a;}
function drawOath(g,ctx,S,t,m){var al=T.paint.map(function(p){return sm(seg(t,p[0],p[1]));});if(!(al[0]>0))return;
  var key=Math.min(1700,Math.round(PW*Math.max(camA(ctx.W,ctx.H).s,camB(ctx.W,ctx.H).s)*Math.min(2,ctx.dpr||1)));if(!S.reg||S.regKey!==key)buildRegions(ctx,S);if(!S.reg)return;
  var x=X(m,0),y=Y(m,0),w=PW*m.s,h=PH*m.s,real=ARM_OK?sm(seg(t,T.armsReal[0],T.armsReal[1])):0;
  var fu=ARM_OK?0:sm(seg(t,T.paint[3][1],T.paint[3][1]+.5));if(fu>=1){g.drawImage(S.full||ctx.to.image,x,y,w,h);return;}
  if(real<1){for(var i=0;i<4;i++){if(al[i]<=0)continue;g.globalAlpha=al[i];g.drawImage(S.reg[i],x,y,w,h);}g.globalAlpha=1;
    if(ARM_OK){var ang=armAngle(t);ARMS.forEach(function(A){drawArm(g,S,A,ang,m,al[2]);});}}
  if(real>0||fu>0){g.globalAlpha=Math.max(real,fu);g.drawImage(S.full||ctx.to.image,x,y,w,h);g.globalAlpha=1;}}
// convergence: each arm (shoulder → hand → on to the grip) and each blade (tip → grip), ruled in Roman red
function drawConv(g,ctx,t,m,alpha,restMode){if(alpha<=0)return;var P=[X(m,GEO.P[0]),Y(m,GEO.P[1])],lw=Math.max(1.2,Math.min(2.2,m.s*4));
  // every ruled line gets a pale plaster halo so the Roman red reads on the dark painting
  var line=function(x0,y0,x1,y1,a){g.globalAlpha=a*.7;g.strokeStyle='rgba(240,228,206,.9)';g.lineWidth=lw+2.2;g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.stroke();g.globalAlpha=a;g.strokeStyle=RED;g.lineWidth=lw;g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.stroke();};
  g.save();g.lineCap='round';g.strokeStyle=RED;g.lineWidth=lw;
  ARMS.forEach(function(A,i){var k=restMode?1:0;if(!restMode){for(var b=0;b<3;b++)k=Math.max(k,(b+1)/3*eo(seg(t,T.beats[b]+.08,T.beats[b]+.5)));k=Math.max(k,eio(seg(t,T.conv[0],T.conv[1])));}
    if(k<=0)return;var ang=restMode||!ARM_OK?0:armAngle(t),dx=A.hand[0]-A.piv[0],dy=A.hand[1]-A.piv[1],c=Math.cos(ang),s=Math.sin(ang),hx=A.piv[0]+dx*c-dy*s,hy=A.piv[1]+dx*s+dy*c;
    var a=[X(m,A.piv[0]),Y(m,A.piv[1])],hnd=[X(m,hx),Y(m,hy)],e=[lerp(a[0],P[0],k),lerp(a[1],P[1],k)];
    // before the last beat the line follows the arm (ends a hand's length past it); on the last beat it swings to the common point
    var cv2=restMode?1:eio(seg(t,T.conv[0],T.conv[1])),dirx=hnd[0]-a[0],diry=hnd[1]-a[1],len=Math.hypot(dirx,diry)||1,reach=Math.hypot(P[0]-a[0],P[1]-a[1])*k;
    var fx=a[0]+dirx/len*reach,fy=a[1]+diry/len*reach;e=[lerp(fx,e[0],cv2),lerp(fy,e[1],cv2)];
    line(a[0],a[1],e[0],e[1],alpha*.95);});
  // each beat: a short ruled light runs along the three arms together (the arms themselves stay as painted)
  if(!restMode)for(var b2=0;b2<3;b2++){var bp=seg(t,T.beats[b2],T.beats[b2]+.55);if(bp<=0||bp>=1)continue;var ba=Math.sin(bp*Math.PI)*(b2===2?1:.8);
    ARMS.forEach(function(A){var a=[X(m,A.piv[0]),Y(m,A.piv[1])],h=[X(m,A.hand[0]),Y(m,A.hand[1])],u0=eo(bp),x0=lerp(a[0],h[0],Math.max(0,u0-.35)),y0=lerp(a[1],h[1],Math.max(0,u0-.35)),x1=lerp(a[0],h[0],u0),y1=lerp(a[1],h[1],u0);
      var gr=g.createLinearGradient(x0,y0,x1,y1);gr.addColorStop(0,'rgba(255,238,205,0)');gr.addColorStop(1,'rgba(255,238,205,'+(.55*ba*alpha).toFixed(3)+')');
      g.save();g.globalCompositeOperation='screen';g.strokeStyle=gr;g.lineWidth=Math.max(3,26*m.s);g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.stroke();g.restore();
      // a tick at the fingertips
      g.save();g.globalAlpha=alpha*ba;g.strokeStyle=RED;g.lineWidth=lw;var R=Math.max(4,10*m.s/.5);g.beginPath();g.moveTo(h[0]-R*.7,h[1]-R*.7);g.lineTo(h[0]+R*.7,h[1]+R*.7);g.moveTo(h[0]-R*.7,h[1]+R*.7);g.lineTo(h[0]+R*.7,h[1]-R*.7);g.stroke();g.restore();});}
  var kb=restMode?1:eio(seg(t,T.conv[0]-.2,T.conv[1]));
  if(kb>0)GEO.tips.forEach(function(tp,i){var a=[X(m,tp[0]),Y(m,tp[1])];line(a[0],a[1],lerp(a[0],P[0],kb),lerp(a[1],P[1],kb),alpha*.95);});g.strokeStyle=RED;g.lineWidth=lw;
  // the point itself: a small ruled cross and a ring that answers the last beat
  var rk=restMode?1:sm(seg(t,T.conv[1]-.2,T.conv[1]+.2));
  if(rk>0){var R=Math.max(5,14*m.s/.5);g.globalAlpha=alpha*rk;g.beginPath();g.arc(P[0],P[1],R,0,Math.PI*2);g.stroke();
    g.beginPath();g.moveTo(P[0]-R*1.8,P[1]);g.lineTo(P[0]+R*1.8,P[1]);g.moveTo(P[0],P[1]-R*1.8);g.lineTo(P[0],P[1]+R*1.8);g.stroke();}
  if(!restMode){var ri=seg(t,T.ring[0],T.ring[1]);if(ri>0&&ri<1){var R2=lerp(8,90,eo(ri))*Math.max(.5,m.s/.5);g.globalAlpha=alpha*.7*(1-ri);g.lineWidth=lw*1.3;g.beginPath();g.arc(P[0],P[1],R2,0,Math.PI*2);g.stroke();}}
  g.restore();}

// ------------------------------------------------------------------ the resting hint: faint grid + convergence, fading after a few seconds (shared with the next room)
function hintAlpha(t){return HINT_A*(1-sm(seg(t,3.2,6.2)));}
function restHint(g,o){var r=o.rect,a=o.alpha==null?hintAlpha(o.t||0):o.alpha;if(a<=0.002)return;var m={s:r.w/PW,ox:r.x,oy:r.y},ov=Math.min(28,r.w*.05);
  g.save();g.beginPath();g.rect(r.x-ov,r.y-ov,r.w+2*ov,r.h+2*ov);g.clip();
  g.lineWidth=1;g.strokeStyle=RED;
  // the three bays: column axes and pier lines; the springing line
  g.globalAlpha=a*.55;GEO.cols.concat(GEO.piers).forEach(function(x){var sx=Math.round(X(m,x))+.5;g.beginPath();g.moveTo(sx,r.y-ov);g.lineTo(sx,r.y+r.h+ov);g.stroke();});
  var sy=Math.round(Y(m,GEO.spring))+.5;g.beginPath();g.moveTo(r.x-ov,sy);g.lineTo(r.x+r.w+ov,sy);g.stroke();
  g.restore();
  drawConv(g,null,0,m,a,true);}
SH.neoclassicalRest=function(g,o){try{restHint(g,o||{});}catch(e){console.error(e);}};

// ------------------------------------------------------------------ DOM: the rococo title/label click onto the grid, their Latin turns Roman, then they go
var domGeo=null;
function domFrom(ctx,t){if(!ctx.from)return;var fi=ctx.from.idx,era=document.getElementById('era'+fi),lab=document.getElementById('lab'+fi),W=ctx.W,H=ctx.H;
  var vis=1-sm(seg(t,T.txtOut[0],T.txtOut[1]));
  var key=W+'x'+H;if(!domGeo||domGeo.key!==key){domGeo={key:key};
    [['era',era],['lab',lab]].forEach(function(x){var el=x[1];if(!el)return;domGeo[x[0]]={l:el.offsetLeft,t:el.offsetTop,w:el.offsetWidth,h:el.offsetHeight};});}
  var m=xf(camA(W,H),W,H),gx1=X(m,GEO.cols[0]),gx2=X(m,GEO.cols[1]),wide=W>980;
  var k1=backOut(seg(t,T.k[0],T.k[0]+T.kDur)),k2=backOut(seg(t,T.k[1],T.k[1]+T.kDur)),k3=backOut(seg(t,T.k[2],T.k[2]+T.kDur));
  [['era',era],['lab',lab]].forEach(function(x){var el=x[1],gm=domGeo[x[0]];if(!el||!gm)return;if(x[0]==='lab'&&!el.style.left)return;
    if(vis<=.001){el.classList.remove('on');['opacity','transform','transition'].forEach(function(p){el.style[p]='';});return;}
    var dx=0,dy=0;
    if(wide){// symmetric about the centre line: the title ends where the left bay begins, the label starts where the right bay ends… set on the grid
      var ty=Math.max(24,Y(m,GEO.top));
      if(x[0]==='era'){dx=(Math.max(16,gx1*.5-gm.w/2)-gm.l)*k2;dy=(ty-gm.t)*k3*.0;}
      else{dx=(Math.min(W-16-gm.w,W-(gx1*.5+gm.w/2))-gm.l)*k2;dy=(Math.max(ty,Math.min(H-gm.h-90,Y(m,GEO.spring)+18))-gm.t)*k3;}}
    else dx=((W-gm.w)/2-gm.l)*k2;
    el.classList.add('on');setCss(el,'transition','none');setCss(el,'opacity',vis.toFixed(3));setCss(el,'transform',(dx||dy)?'translate('+dx.toFixed(1)+'px,'+dy.toFixed(1)+'px)':'none');});
  // Latin → Roman capitals on the second click (Chinese keeps its face)
  var roman=t>=T.font;[era&&era.querySelector('.lat'),era&&era.querySelector('.yrs'),lab&&lab.querySelector('.who>span')].forEach(function(el){if(!el)return;
    if(roman){setCss(el,'fontFamily',ROMAN);setCss(el,'fontStyle','normal');setCss(el,'letterSpacing','.1em');}
    else{if(el.style.fontFamily){el.style.fontFamily='';el.style.fontStyle='';el.style.letterSpacing='';}}});}
// the previous room's overlay layers (if it kept any at rest) fade with its text
function fromLayers(ctx,t){var room=document.getElementById('room');if(!room)return;var a=1-sm(seg(t,T.txtOut[0],T.txtOut[1]));
  Array.prototype.forEach.call(room.querySelectorAll('canvas.ovl'),function(c){if(c.style.display==='none')return;setCss(c,'opacity',a<.999?a.toFixed(3):'');});}

// ------------------------------------------------------------------ warm-up
function prewarm(ctx,S){try{var W=ctx.W,H=ctx.H,q=Math.min(ctx.dpr||1,2),c=cv(W*q,H*q),g=c.getContext('2d');g.setTransform(q,0,0,q,0,0);
  buildRegions(ctx,S);var m=xf(camA(W,H),W,H);if(S.reg)S.reg.forEach(function(r){g.drawImage(r,X(m,0),Y(m,0),PW*m.s,PH*m.s);});
  if(ok(ctx.to.image))g.drawImage(ctx.to.image,ctx.to.rect.x,ctx.to.rect.y,ctx.to.rect.w,ctx.to.rect.h);
  if(ctx.from){ensureRoc(ctx,S);var r=ctx.from.rect;paintLayers(g,S,r,S.cl,1,0,1,1,1);paintLayers(g,S,r,S.gl,1,0,0,1,1);framePass(g,S,r,0,S.fc,S.bc,1);framePass(g,S,r,0,S.gfc,S.gbc,1);}
  ARMS.forEach(function(A){if(ok(S.arm[A.id]))g.drawImage(S.arm[A.id],0,0,A.w*m.s,A.h*m.s);});
  g.getImageData(0,0,1,1);}catch(e){console.error(e);}}

// ================================================================== the module
EH.transition('neoclassical',{
  duration:D,
  assets:USE_ARMS?ARMS.map(function(A){return A.file;}).concat([PLATE]):[],
  fromAssets:rocAssets(),
  init:function(ctx){var S=ctx.state;myIdx=ctx.to.idx;injectFont(ctx.to.idx);
    try{if(document.fonts&&document.fonts.load)document.fonts.load('400 20px Cinzel');}catch(e){}
    S.arm={};if(USE_ARMS){ARMS.forEach(function(A){S.arm[A.id]=ctx.asset(A.file);});S.plate=ctx.asset(PLATE);}
    S.plateOK=USE_ARMS&&ok(S.plate)&&ARMS.every(function(A){return ok(S.arm[A.id]);});ARM_OK=S.plateOK;
    S.full=ctx.to.image;
    if(ctx.from){S.fromImg=ctx.from.image;S.roc={};['plate','ropes','woman','flowers','shoe'].forEach(function(k){S.roc[k]=ctx.fromAsset(ROC[k].f);});
      S.rocOK=['plate','ropes','woman','flowers'].every(function(k){return ok(S.roc[k]);});}
    if(S.rocOK){var sc=.5,wc=cv(ROC.woman.w*sc+120*sc,ROC.woman.h*sc+120*sc),wg=wc.getContext('2d');wg.filter='grayscale(1) blur('+(14*sc)+'px)';wg.drawImage(S.roc.woman,60*sc,60*sc,ROC.woman.w*sc,ROC.woman.h*sc);wg.filter='none';S.soft=wc;}
    prewarm(ctx,S);},
  draw:function(p,ctx){var g=ctx.g,S=ctx.state,W=ctx.W,H=ctx.H,t=p*D,R1=ctx.to.rect,F=ctx.from;
    if(p>=1){g.fillStyle=ctx.to.wall;g.fillRect(0,0,W,H);wash(g,W,H,R1,ctx.to.ink==='dark',1);g.drawImage(ctx.to.image,R1.x,R1.y,R1.w,R1.h);restHint(g,{rect:R1,t:0});domFrom(ctx,D);return;}
    myIdx=ctx.to.idx;domFrom(ctx,t);fromLayers(ctx,t);
    ctx.ui.ink(t<3.2?(F?F.ink:'dark'):t<T.wallTo[1]-1.2?'dark':ctx.to.ink);
    if(t>=T.title)ctx.ui.title(ctx.to.idx,true);
    var drain=sm(seg(t,T.drain[0],T.drain[1])),toK=sm(seg(t,T.wallTo[0],T.wallTo[1]));
    var wall=F?mixc(F.wall,LIME,drain):LIME;if(toK>0)wall=mixc(wall,ctx.to.wall,toK);
    g.fillStyle=wall;g.fillRect(0,0,W,H);
    if(F)wash(g,W,H,F.rect,F.ink==='dark',1-drain);
    wash(g,W,H,R1,ctx.to.ink==='dark',toK);
    var cam=camAt(t,ctx),m=xf(cam,W,H);
    // ---- the Oath fills in behind the drawing
    drawOath(g,ctx,S,t,m);
    // ---- the page (the Swing), its snaps, its push into the women's bay
    if(F){var pg=pageAt(t,ctx);
      if(pg.a>0)drawPage(g,ctx,S,t,pg,drain);
      // ---- the curls (rococo frame scrolls) → ruled lines → the grid
      drawCurls(g,ctx,S,t,pg);}
    // ---- the drawing: grid, columns, arches (fades to the resting hint)
    var lo=sm(seg(t,T.linesOut[0],T.linesOut[1]));
    drawArcade(g,ctx,t,m,1-lo);
    // ---- ropes → steel → swords
    if(F&&t<T.rodOut[1])drawRopes(g,ctx,S,t,pageAt(t,ctx),rocAngle(TAU0+Math.min(t,T.snare)));
    // ---- convergence (then it settles into the resting hint)
    if(t>=T.beats[0])drawConv(g,ctx,t,m,1-lo,false);
    if(lo>0)restHint(g,{rect:{x:X(m,0),y:Y(m,0),w:PW*m.s,h:PH*m.s},alpha:HINT_A*lo});
  },
  done:function(ctx){clean();ctx.state.restT0=performance.now()/1000;},
  rest:function(ctx){var S=ctx.state;myIdx=ctx.to.idx;markRoom(true);if(S.restT0==null)S.restT0=performance.now()/1000;
    var t=performance.now()/1000-S.restT0;if(hintAlpha(t)<=.002)return;
    rgBegin(ctx);try{restHint(ctx.g,{rect:ctx.to.rect,t:t});}finally{rgEnd(ctx);}}
});
})();

;
/* 浪漫主义 · 雾吞掉了网格 — the passage from David's Oath of the Horatii (neoclassical) into Friedrich's Wanderer above the Sea of Fog.
   Beats (seconds of D): a first wisp of mist curls out of the middle arch, then the side arches · the mist surges out of all three,
   runs along the invisible three-part grid (the lines light up where the front passes) and floods the painting, the columns, the
   label and the navigation · the Horatii fade into the fog; their arcade stays as a grey silhouette and crumbles — the voussoirs
   fall, the columns and piers grow into jagged sandstone pinnacles — then sinks · wind rises from below (the fog streams upward) ·
   where the three swords converged the fog parts: the back of a head rises from the bottom edge of the screen, a figure in a dark
   green coat walks away from the visitor up the rock (the rock continues below the frame), smaller with each step, onto the summit ·
   the mountain layers rise with parallax · the fog clears from the top down to a sea of fog that drowns half of the vertical title ·
   the sea sinks and settles into the valleys of the painting · hand-over.
   Fog: one WebGL overlay layer (ctx.layer 'fog', above the wall text and controls) at ≤ 1/4 of the device pixels, a procedural
   domain-warped field that is a pure function of t (no simulation state), occluded by the rock and the walking figure.
   Rest: the same fog, only over the painting's fog sea (cut/fog_mask), drifting; the cursor is the wind that blows it open, it closes slowly.
   Layers: rooms/romanticism/cut/ (sky, far, mid, rock, wanderer, rock_ext, fog_mask; composite = main.webp). */
(function(){
'use strict';
var D=20.6, PW=1871, PH=2400, NW=2400, NH=1871;
var SH=window.EH_SHARED=window.EH_SHARED||{};
var T={wisp:[0.35,1.4,1.9], surge:[2.6,7.4], grid:[3.0,7.8], hintIn:[2.2,3.6], hintOut:[4.8,6.8], mark:[3.8,5.4], markOut:[9.3,10.3],
  fromDom:[4.8,6.4], fogTint:[4.0,6.8], neoOut:[7.4,9.4],
  arcIn:[4.6,6.0], crumble:[6.0,8.8], sink:[8.8,11.0], arcOcc:[5.6,6.8], wall:[6.0,9.0], wind:[8.0,12.5], romIn:[8.4,10.4], feather:[10.6,14.0],
  riseRock:[9.0,13.2], riseMid:[9.0,13.8], riseFar:[9.0,14.6], manIn:[8.5,9.2], hole:[9.0,10.2], walk:[10.1,17.0], late:[11.0,16.2], title:12.4,
  seaDown:[17.2,19.6], seaFade:[18.4,19.8], rockOcc:[9.0,10.5], occOut:[17.2,18.6], extOut:[17.6,19.4], valley:[17.0,19.8], fin:[19.4,20.4]};
// ------------------------------------------------------------------ geometry
// the Horatii (neoclassical main.webp px): the three arches (centre, intrados, extrados), the four supports, the swords' convergence
var ARCH=[[492,444],[1169,444],[1841,456]], RI=250, RO=330, CONV=[1104,684];
var PIL=[{x0:132,x1:240,c0:112,c1:262,top:150},{x0:773,x1:893,c0:720,c1:941,top:84},{x0:1447,x1:1572,c0:1404,c1:1632,top:124},{x0:2088,x1:2184,c0:2066,c1:2206,top:196}];
// the Wanderer (cut/layers.json): layer boxes, his head and stand point, the walk path [x, y, scale] of the stand point
var LY={sky:[0,0,1871,2400],far:[0,686,1871,1714],mid:[0,1110,1663,514],rock:[0,1486,1871,914],man:[731,810,440,944],ext:[0,2340,1871,900]};
var HEAD=[927,812], STAND=[875,1692], OCC_ROCK=[0,1486,1871,1754];
var PATH=[[995,3240,2.4],[965,2960,2.0],[935,2660,1.6],[905,2400,1.35],[885,2150,1.15],[875,1950,1.04],[875,1692,1.0]];
// scale of the figure in its first pose: head where the swords met, feet well below the bottom edge of the screen (per layout)
function s0(ctx){var R=ctx.to.rect,k=R.w/PW,c=convAt(ctx);return Math.max(3.0,(ctx.H-c[1]+70)/((STAND[1]-HEAD[1])*k));}
var FOG=[222,225,232], REST_VAL=0.62;

function cv(w,h){var c=document.createElement('canvas');c.width=Math.max(1,Math.round(w));c.height=Math.max(1,Math.round(h));return c;}
function rgb(hex){var h=String(hex).replace('#','');if(h.length===3)h=h.split('').map(function(c){return c+c;}).join('');var n=parseInt(h,16);return[(n>>16)&255,(n>>8)&255,n&255];}
function mixc(a,b,t){return 'rgb('+a.map(function(v,i){return Math.round(v+(b[i]-v)*t);}).join(',')+')';}
function rgba(c,a){return 'rgba('+c[0]+','+c[1]+','+c[2]+','+a+')';}
function cl(x){return x<0?0:x>1?1:x;}
function sm(x){x=cl(x);return x*x*(3-2*x);}
function seg(t,a){return cl((t-a[0])/(a[1]-a[0]));}
function eo(x){x=cl(x);return 1-Math.pow(1-x,3);}
function eio(x){x=cl(x);return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;}

// ------------------------------------------------------------------ DOM touches (previous room's title/label under the fog, our title early)
var dirty=[],watching=false,myIdx=-1,fogEl=null;
function setCss(el,prop,val){if(!el)return;if(el.style[prop]!==val)el.style[prop]=val;if(val&&dirty.indexOf(el)<0){dirty.push(el);watch();}}
function clean(){dirty.forEach(function(el){['opacity','transition'].forEach(function(p){el.style[p]='';});});dirty=[];}
function watch(){if(watching)return;watching=true;(function loop(){var st=window.EH&&EH.debug&&EH.debug.state;
  // narrow screens: while reading, rest() is not called and the work is hidden — take the fog down with it
  if(fogEl&&st)fogEl.style.opacity=(st.idx===myIdx&&st.reading&&innerWidth<=980)?'0':'';
  if(!st||st.idx!==myIdx||(st.phase!=='enter'&&st.phase!=='rest')){clean();if(fogEl)fogEl.style.opacity='';watching=false;return;}
  requestAnimationFrame(loop);})();}
function domFrom(ctx,t){if(!ctx.from)return;var fi=ctx.from.idx,vis=1-sm(seg(t,T.fromDom));
  ['era'+fi,'lab'+fi].forEach(function(id){var el=document.getElementById(id);if(!el)return;if(id.charAt(0)==='l'&&!el.style.left)return;
    if(vis>0.001){el.classList.add('on');setCss(el,'transition','none');setCss(el,'opacity',vis.toFixed(3));}
    else{el.classList.remove('on');if(dirty.indexOf(el)>=0){el.style.opacity='';el.style.transition='';}}});}
function domTitle(ctx,t){var el=document.getElementById('era'+ctx.to.idx);if(!el)return;var on=t>=T.title;
  el.classList.toggle('on',on);
  // keep it at full opacity through the hand-over (the core re-applies the class 0.2 s into the rest)
  if(on&&t>=T.title+1.2){setCss(el,'opacity','1');}else if(dirty.indexOf(el)>=0){el.style.opacity='';}}
function titleMid(ctx){var S=ctx.state,key=ctx.W+'x'+ctx.H;if(S.tmKey===key)return S.tm;var el=document.getElementById('era'+ctx.to.idx),h=el&&el.querySelector('h1'),y=ctx.H*0.45;
  if(h){var b=h.getBoundingClientRect();if(b.height>0)y=b.top+b.height*0.5;}S.tmKey=key;S.tm=y;return y;}

// replica of the DOM's .wash (index.html) under the frame
function wash(g,W,H,rect,ink,k){if(k<=0)return;var dark=ink==='dark',c=dark?'255,255,255':'255,244,225',a=(dark?.35:.08)*k;
  var sx=+((rect.x+rect.w/2)/W*100).toFixed(1)/100*W,sy=+((rect.y+rect.h/2)/H*100).toFixed(1)/100*H,rx=.7*W,ry=.6*H;
  g.save();g.translate(sx,sy);g.scale(rx,ry);var gr=g.createRadialGradient(0,0,0,0,0,1);gr.addColorStop(0,'rgba('+c+','+a+')');gr.addColorStop(.7,'rgba('+c+',0)');gr.addColorStop(1,'rgba('+c+',0)');
  g.fillStyle=gr;g.fillRect(-sx/rx,-sy/ry,W/rx,H/ry);g.restore();}
// replicas of the DOM frame decorations (.frame.f-gilt / f-white / f-stone ::before), drawn around a rect with its padding fp
function frameDeco(g,r,style,a){var fp=r.fp||0;if(!fp||a<=0||style==='none'||style==='fade')return;var x=r.x-fp,y=r.y-fp,w=r.w+2*fp,h=r.h+2*fp;
  g.save();g.globalAlpha=a;
  if(style==='gilt'){var an=160*Math.PI/180,dx=Math.sin(an),dy=-Math.cos(an),L=Math.abs(w*dx)+Math.abs(h*dy),cx=x+w/2,cy=y+h/2;
    var gr=g.createLinearGradient(cx-dx*L/2,cy-dy*L/2,cx+dx*L/2,cy+dy*L/2);gr.addColorStop(0,'#6d5230');gr.addColorStop(.55,'#3a2a14');gr.addColorStop(1,'#5c4424');
    g.fillStyle='#1c1409';g.fillRect(x,y,w,h);g.fillStyle='#7a5e35';g.fillRect(x+1,y+1,w-2,h-2);g.fillStyle='#241a0c';g.fillRect(x+5,y+5,w-10,h-10);g.fillStyle=gr;g.fillRect(x+6,y+6,w-12,h-12);}
  else if(style==='white'){g.fillStyle='rgba(0,0,0,.07)';g.fillRect(x,y,w,h);g.fillStyle='#f2f0eb';g.fillRect(x+1,y+1,w-2,h-2);g.fillStyle='rgba(0,0,0,.08)';g.fillRect(x+9,y+9,w-18,h-18);g.fillStyle='#f2f0eb';g.fillRect(x+10,y+10,w-20,h-20);}
  else if(style==='stone'){var gs=g.createLinearGradient(0,y,0,y+h);gs.addColorStop(0,'#5b554c');gs.addColorStop(1,'#3f3a33');g.fillStyle='rgba(0,0,0,.4)';g.fillRect(x,y,w,h);g.fillStyle=gs;g.fillRect(x+1,y+1,w-2,h-2);}
  g.restore();}
// the DOM frame's drop shadow (index.html .frame.f-*::before box-shadow: 0 dy blur -spread rgba(0,0,0,a)), rendered once per size
var SHADOW={stone:[24,60,24,.7],gilt:[28,70,24,.8],white:[22,50,22,.45],none:[26,60,26,.6]};
function frameShadow(S,r,style){var q=SHADOW[style];if(!q)return null;var fp=r.fp||0,w=r.w+2*fp,h=r.h+2*fp,key=[w,h,style].join();if(S.shK===key)return S.shC;
  var pad=q[1]*2.6+q[0],c=cv(w+2*pad,h+2*pad),g=c.getContext('2d');g.shadowColor='rgba(0,0,0,'+q[3]+')';g.shadowBlur=q[1];g.shadowOffsetX=c.width;g.shadowOffsetY=q[0];
  g.fillStyle='#000';g.fillRect(pad+q[2]-c.width,pad+q[2],w-2*q[2],h-2*q[2]);c.pad=pad;S.shK=key;S.shC=c;return c;}
// the Horatii exactly as the hung painting shows them: core paints the work into a canvas of min(w·dpr, 2600) px (paintArt) — same resampling here
function fromArt(ctx){var S=ctx.state,F=ctx.from,im=S.fromImg;if(F.frame==='fade')return im;var w=Math.min(Math.round(F.rect.w*(ctx.dpr||1)),2600);if(S.faW===w)return S.faC;
  var ok=im&&(im.naturalWidth||im.width);if(!ok)return im;var c=cv(w,Math.round(w*(im.naturalHeight||im.height)/(im.naturalWidth||im.width)));c.getContext('2d').drawImage(im,0,0,c.width,c.height);S.faW=w;S.faC=c;return c;}
// the soft elliptical mask of frame 'fade' (index.html), baked into a copy of the image
function fadeMasked(im){var w=im.naturalWidth||im.width,h=im.naturalHeight||im.height,c=cv(w,h),g=c.getContext('2d');g.drawImage(im,0,0);
  var m=g.createRadialGradient(0,0,0,0,0,1);m.addColorStop(0,'#000');m.addColorStop(.62,'#000');m.addColorStop(1,'rgba(0,0,0,0)');
  g.globalCompositeOperation='destination-in';g.save();g.translate(w/2,h/2);g.scale(w*0.58,h*0.60);g.fillStyle=m;g.fillRect(-1/0.58,-1/0.60,2/0.58,2/0.60);g.restore();return c;}

// ================================================================== the fog (WebGL)
var VS='attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
var FS=[
'precision highp float;',
'uniform vec2 uRes,uCss,uDrift;uniform float uT,uStreak,uArchR;',
'uniform vec4 uW0,uW1,uW2;uniform vec3 uFlood;uniform float uDen;',
'uniform vec4 uGridR,uGridL;uniform float uGridA,uGridY;uniform sampler2D uArc;uniform float uArcA;',
'uniform vec4 uHole;',
'uniform sampler2D uRock,uMan,uValley;uniform vec4 uRockXf,uManXf,uTo;uniform float uRockA,uManA,uValA;',
'uniform float uLateY,uLateOn;uniform vec3 uSea;',
'uniform vec4 uP[12];uniform vec4 uRead;uniform float uReadOn,uAlpha;',
'float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}',
'float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);}',
'const mat2 M=mat2(1.6,1.2,-1.2,1.6);',
'float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p=M*p;a*=.5;}return v;}',
'float fbm3(vec2 p){float v=0.,a=.5;for(int i=0;i<3;i++){v+=a*noise(p);p=M*p;a*=.5;}return v/.875;}',
'float box(vec2 uv){return step(0.,uv.x)*step(uv.x,1.)*step(0.,uv.y)*step(uv.y,1.);}',
'float wisp(vec2 pix,vec4 W,float n){if(W.w<=0.)return 0.;vec2 d=pix-W.xy;float s=-d.y,age=W.z,sp=max(s,0.);',
'  float len=age*140.;float off=sin(sp*.014-age*1.1+W.x*.013)*min(sp,220.)*.30+(n-.5)*90.*clamp(sp/120.,0.,1.);',
'  float wd=12.+sp*.30;float c=exp(-pow((d.x-off)/wd,2.))*smoothstep(len,len-120.,s)*smoothstep(-40.,6.,s)*(.25+1.1*n*n);',
'  vec2 e=d/vec2(uArchR*.85,uArchR*1.1);float glow=exp(-dot(e,e)*1.8)*clamp(age*.45,0.,1.)*(.5+.7*n);',
'  vec2 sd=(d-vec2(0.,uArchR*.8))/vec2(uArchR*(.5+age*.55),uArchR*(.22+age*.07));float spill=exp(-dot(sd,sd))*clamp(age*.4-.15,0.,1.)*(.3+.9*n);',
'  return clamp(c*1.25+glow*.6+spill*.65,0.,1.)*W.w;}',
'void main(){',
'  vec2 pix=vec2(gl_FragCoord.x,uRes.y-gl_FragCoord.y)/uRes*uCss;',
'  float ns=1./300.;vec2 q=pix*ns;q.y*=mix(1.,.5,uStreak);q+=uDrift;',
'  vec2 w=vec2(fbm3(q*.6+vec2(1.7,9.2)+uT*.03),fbm3(q*.6+vec2(8.3,2.8)-uT*.024))-.5;',
'  vec2 qw=q+.9*w;float n=fbm(qw+vec2(0.,uT*.015));',
'  float nl=fbm3(qw+vec2(-.05,-.07));',
'  float b=smoothstep(.3,.72,n);',
// early: wisps + surge
'  float early=0.;float gridGlow=0.;',
'  if(uLateOn<1.||uLateY<uCss.y+400.){',
'    early=max(max(wisp(pix,uW0,n),wisp(pix,uW1,n)),wisp(pix,uW2,n));',
'    if(uFlood.z>0.){float dist=1e5;',
'      vec2 d0=pix-uW0.xy;d0.y*=d0.y>0.?.85:1.3;d0.x*=.72;dist=min(dist,length(d0));',
'      vec2 d1=pix-uW1.xy;d1.y*=d1.y>0.?.85:1.3;d1.x*=.72;dist=min(dist,length(d1));',
'      vec2 d2=pix-uW2.xy;d2.y*=d2.y>0.?.85:1.3;d2.x*=.72;dist=min(dist,length(d2));',
'      float f=uFlood.x-dist;early=max(early,smoothstep(0.,1.,f/uFlood.y+(n-.5)*1.9)*uFlood.z);',
'      if(uGridA>0.){vec4 gx=abs(vec4(pix.x)-uGridL);float gy=abs(pix.y-uGridY);',
'        float ln=max(max(max(exp(-gx.x*gx.x*.1),exp(-gx.y*gx.y*.1)),max(exp(-gx.z*gx.z*.1),exp(-gx.w*gx.w*.1))),exp(-gy*gy*.1))*(.55+.6*n);',
'        vec2 gu=(pix-uGridR.xy)/uGridR.zw;float gin=smoothstep(-.03,.01,gu.x)*smoothstep(1.03,.99,gu.x)*smoothstep(-.04,.01,gu.y)*smoothstep(1.04,.99,gu.y);',
'        gridGlow=ln*gin*smoothstep(-70.,0.,f)*(1.-smoothstep(10.,240.,f))*uGridA;}}',
'    early*=uDen;}',
// late: the sea of fog outside the painting, the painting's own fog sea inside
'  vec2 tu=(pix-uTo.xy)/uTo.zw;float inR=smoothstep(0.,.035,tu.x)*smoothstep(1.,.965,tu.x)*smoothstep(0.,.03,tu.y)*smoothstep(1.,.97,tu.y);',
'  float val=texture2D(uValley,clamp(tu,0.,1.)).r*box(tu);',
'  float und=(fbm3(vec2(pix.x/520.,uT*.05)+3.1)-.5)*uSea.y*3.2+(fbm3(vec2(pix.x/170.,uT*.07)+9.3)-.5)*uSea.y*2.4;float sea=smoothstep(uSea.x-uSea.y,uSea.x+uSea.y,pix.y+und+(n-.5)*uSea.y*3.4)*uSea.z;',
'  float lateC=mix(sea,val*uValA,inR);',
'  float lm=uLateOn*smoothstep(uLateY+90.,uLateY-90.,pix.y+(n-.5)*150.);',
'  float cov=mix(early,lateC,lm);gridGlow*=1.-lm;',
// the wind parts it: the head, the walking figure, the rock in front of the fog
'  vec2 hd=pix-uHole.xy;float hr=length(hd)+(n-.5)*uHole.z*.7;cov*=1.-uHole.w*smoothstep(uHole.z,uHole.z*.35,hr);',
'  vec2 ru=(pix-uRockXf.xy)/uRockXf.zw;float ro=texture2D(uRock,clamp(ru,0.,1.)).r*box(ru)*uRockA;',
'  vec2 mu=(pix-uManXf.xy)/uManXf.zw;float mo=texture2D(uMan,clamp(mu,0.,1.)).r*box(mu)*uManA;',
'  cov*=1.-max(ro,mo);',
'  if(uArcA>0.)cov*=1.-texture2D(uArc,pix/uCss).a*uArcA;',
'  for(int i=0;i<12;i++){vec4 P=uP[i];if(P.w>0.){float d=length(pix-P.xy)+(n-.5)*P.z*.8;cov*=1.-P.w*smoothstep(P.z,P.z*.18,d);}}',
'  vec2 rd=pix-uRead.xy;cov*=1.-uReadOn*step(-8.,rd.x)*step(rd.x,uRead.z+8.)*step(-8.,rd.y)*step(rd.y,uRead.w+8.);',
'  float a=clamp(cov*mix(mix(.42,.72,lm*(1.-inR)),1.,b),0.,1.)*uAlpha;',
'  float sh=clamp(.62+(n-nl)*3.2,0.,1.);',
'  vec3 col=mix(vec3(.66,.68,.745),vec3(.94,.945,.96),sh);col=mix(col,vec3(.98,.975,.965),clamp(gridGlow*.7,0.,1.));',
'  a=max(a,clamp(gridGlow*.3,0.,1.)*uAlpha);',
'  gl_FragColor=vec4(col*a,a);}'].join('\n');

function Fog(canvas){var gl=canvas.getContext('webgl',{premultipliedAlpha:true,alpha:true,antialias:false,depth:false,stencil:false,preserveDrawingBuffer:false});
  if(!gl)return null;
  function sh(type,src){var s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){console.warn(gl.getShaderInfoLog(s));return null;}return s;}
  var p=gl.createProgram(),vs=sh(gl.VERTEX_SHADER,VS),fs=sh(gl.FRAGMENT_SHADER,FS);if(!vs||!fs)return null;gl.attachShader(p,vs);gl.attachShader(p,fs);gl.linkProgram(p);
  if(!gl.getProgramParameter(p,gl.LINK_STATUS)){console.warn(gl.getProgramInfoLog(p));return null;}
  gl.useProgram(p);var buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  var al=gl.getAttribLocation(p,'a');gl.enableVertexAttribArray(al);gl.vertexAttribPointer(al,2,gl.FLOAT,false,0,0);
  var U={};['uRes','uCss','uDrift','uT','uStreak','uArchR','uW0','uW1','uW2','uFlood','uDen','uGridR','uGridA','uGridL','uGridY','uArc','uArcA','uHole','uRock','uMan','uValley','uRockXf','uManXf','uTo','uRockA','uManA','uValA','uLateY','uLateOn','uSea','uP','uRead','uReadOn','uAlpha'].forEach(function(n){U[n]=gl.getUniformLocation(p,n);});
  var tex={};
  function texFrom(unit,name,im){var t=gl.createTexture();gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,t);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    try{if(im&&(im.naturalWidth||im.width))gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,im);else gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([0,0,0,255]));}catch(e){console.warn(e);}
    gl.uniform1i(U[name],unit);tex[name]=t;}
  var P=new Float32Array(48);
  return {gl:gl,canvas:canvas,
    textures:function(rock,man,valley){texFrom(0,'uRock',rock);texFrom(1,'uMan',man);texFrom(2,'uValley',valley);texFrom(3,'uArc',null);},
    draw:function(o,cw,ch){var c=canvas;if(c.width!==cw||c.height!==ch){c.width=cw;c.height=ch;}gl.viewport(0,0,cw,ch);
      gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);if(!(o.alpha>0))return;
      gl.useProgram(p);for(var k=0;k<4;k++){gl.activeTexture(gl.TEXTURE0+k);gl.bindTexture(gl.TEXTURE_2D,tex[['uRock','uMan','uValley','uArc'][k]]);}
      var arcA=o.arcA||0;if(arcA>0&&o.arcCanvas){gl.activeTexture(gl.TEXTURE3);try{gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,o.arcCanvas);}catch(e){arcA=0;}}
      gl.uniform1f(U.uArcA,arcA);gl.uniform4fv(U.uGridL,o.gridL||[-1e4,-1e4,-1e4,-1e4]);gl.uniform1f(U.uGridY,o.gridY==null?-1e4:o.gridY);
      gl.uniform2f(U.uRes,cw,ch);gl.uniform2f(U.uCss,o.W,o.H);gl.uniform2f(U.uDrift,o.drift[0],o.drift[1]);gl.uniform1f(U.uT,o.t);gl.uniform1f(U.uStreak,o.streak);gl.uniform1f(U.uArchR,o.archR);
      gl.uniform4fv(U.uW0,o.w[0]);gl.uniform4fv(U.uW1,o.w[1]);gl.uniform4fv(U.uW2,o.w[2]);gl.uniform3fv(U.uFlood,o.flood);gl.uniform1f(U.uDen,o.den);
      gl.uniform4fv(U.uGridR,o.gridR);gl.uniform1f(U.uGridA,o.gridA);gl.uniform4fv(U.uHole,o.hole);
      gl.uniform4fv(U.uRockXf,o.rockXf);gl.uniform4fv(U.uManXf,o.manXf);gl.uniform4fv(U.uTo,o.to);gl.uniform1f(U.uRockA,o.rockA);gl.uniform1f(U.uManA,o.manA);gl.uniform1f(U.uValA,o.valA);
      gl.uniform1f(U.uLateY,o.lateY);gl.uniform1f(U.uLateOn,o.lateOn);gl.uniform3fv(U.uSea,o.sea);
      P.fill(0);(o.ptr||[]).slice(0,12).forEach(function(h,i){P[i*4]=h[0];P[i*4+1]=h[1];P[i*4+2]=h[2];P[i*4+3]=h[3];});gl.uniform4fv(U.uP,P);
      gl.uniform4fv(U.uRead,o.read||[0,0,0,0]);gl.uniform1f(U.uReadOn,o.read?1:0);gl.uniform1f(U.uAlpha,o.alpha);
      gl.drawArrays(gl.TRIANGLES,0,3);}};}
// fog resolution: half the CSS pixels per axis (a quarter of the device pixels at dpr 2), capped
function fogSize(W,H){var s=Math.min(0.5,900/W);return[Math.max(2,Math.round(W*s)),Math.max(2,Math.round(H*s))];}
// the fog state of the rest (and of p = 1): only the painting's fog sea, drifting, holes blown by the cursor
function restFog(W,H,rect,t,ptr,read,alpha){var z=[0,0,0,0];
  return {W:W,H:H,t:t,drift:drift(t),streak:0,archR:1,w:[z,z,z],flood:[0,1,0],den:0,gridR:z,gridA:0,hole:z,rockXf:[0,0,1,1],manXf:[0,0,1,1],rockA:0,manA:0,
    to:[rect.x,rect.y,rect.w,rect.h],valA:REST_VAL,lateY:1e5,lateOn:1,sea:[1e5,50,0],ptr:ptr||[],read:read||null,alpha:alpha==null?1:alpha};}
// the noise field's offset: a slow drift across the valleys, plus the gust from below (its integral: constant once the wind has passed)
function drift(t){return[0.022*t,0.004*t+3.1*sm((t-T.wind[0])/(T.wind[1]-T.wind[0]))];}

// ================================================================== the crumbling arcade (vector silhouettes, painting px of the Horatii)
function arcadePlan(){var rnd=EH.util.rng(7070),pil=PIL.map(function(P,k){var w=P.x1-P.x0,cx=(P.x0+P.x1)/2,N=9,M=6,A=[],B=[],top=P.top+60;
    // A = the column (shaft + capital), B = a sandstone tower: wide foot, bedding ledges, a lumpy crown; left side bottom→top, crown left→right, right side top→bottom
    var hw=[],led=[];for(var i=0;i<N;i++){var f=i/(N-1);hw.push(w*(1.35-0.55*f)*(0.9+0.25*rnd()));led.push((i%3===1?1:0)*w*0.16*(rnd()<.5?-1:1));}
    for(i=0;i<N;i++){f=i/(N-1);var cap=i===N-1;A.push([cap?P.c0:P.x0,cap?420:1560-(1560-480)*f]);B.push([cx-hw[i]+led[i],1560-(1560-top)*f]);}
    var crown=[70,6,64,0,48,96];for(var j=0;j<M;j++){var g=j/(M-1);A.push([P.c0+(P.c1-P.c0)*g,420]);B.push([cx-hw[N-1]+2*hw[N-1]*g,top-60+crown[j]+rnd()*16]);}
    for(i=N-1;i>=0;i--){f=i/(N-1);cap=i===N-1;A.push([cap?P.c1:P.x1,cap?420:1560-(1560-480)*f]);B.push([cx+hw[i]*(0.92+0.1*rnd())-led[i]*0.6,1560-(1560-top)*f+(rnd()-.5)*24]);}
    return{A:A,B:B,d:[0.12,0,0.06,0.18][k]};});
  var vs=[];ARCH.forEach(function(c,ai){for(var j=0;j<9;j++){var a0=Math.PI-j*Math.PI/9,a1=Math.PI-(j+1)*Math.PI/9,pts=[[RI,a0],[RO,a0],[RO,a1],[RI,a1]].map(function(q){return[c[0]+q[0]*Math.cos(q[1]),c[1]-q[0]*Math.sin(q[1])];});
    var cx=0,cy=0;pts.forEach(function(q){cx+=q[0]/4;cy+=q[1]/4;});vs.push({p:pts,c:[cx,cy],t:ai*0.22+Math.abs(j-4)*0.11+rnd()*0.06,dx:(j-4)*38+(rnd()-.5)*50,rot:(j<4?-1:j>4?1:(rnd()-.5))*(0.9+rnd()*0.9)});}});
  // a lumpy rock mass rising between the towers
  var ridge=[],n=30;for(var i=0;i<=n;i++){var x=-60+(NW+120)*i/n;ridge.push([x,1230+Math.sin(i*1.3)*60+Math.sin(i*0.47+1)*90+(rnd()-.5)*60]);}
  return{pil:pil,vs:vs,ridge:ridge};}
function arcLayer(ctx){var S=ctx.state,q=0.5*Math.min(ctx.dpr||1,2),w=Math.round(ctx.W*q),h=Math.round(ctx.H*q);if(!S.arcC||S.arcC.width!==w||S.arcC.height!==h)S.arcC=cv(w,h);
  var g=S.arcC.getContext('2d');g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';g.clearRect(0,0,w,h);g.setTransform(q,0,0,q,0,0);return g;}
function drawArcade(G,ctx,t){var S=ctx.state,R=ctx.from.rect,k=R.w/NW,A=S.arc;
  var a=sm(seg(t,T.arcIn)),sink=eio(seg(t,T.sink));a*=1-sm(seg(t,[T.sink[0]+0.6,T.sink[1]]));if(a<=0.002)return;
  var cr=seg(t,T.crumble),rockiness=sm(seg(t,[T.crumble[0]+0.2,T.crumble[1]-0.4])),dy=sink*R.h*0.34;
  function X(x){return R.x+x*k;}function Y(y){return R.y+y*k+dy;}
  // towers, ridge and the voussoirs still in place: one path (also traced into the fog's occluder, so the peaks stand out of the fog)
  var rr=eio(seg(t,[T.crumble[0]+0.6,T.crumble[1]+0.5])),fall=[];
  A.vs.forEach(function(v){var tau=t-(T.crumble[0]+0.35+v.t);if(tau>0)fall.push([v,tau]);});
  function trace(g){g.beginPath();
    A.pil.forEach(function(P){var m=eio(cl((cr-P.d)/0.72));P.A.forEach(function(q,i){var b=P.B[i],x=X(q[0]+(b[0]-q[0])*m),y=Y(q[1]+(b[1]-q[1])*m);if(i)g.lineTo(x,y);else g.moveTo(x,y);});g.closePath();});
    if(rr>0){g.moveTo(X(-60),Y(NH+300));A.ridge.forEach(function(q){g.lineTo(X(q[0]),Y(NH+300+(q[1]-NH-300)*rr));});g.lineTo(X(NW+60),Y(NH+300));g.closePath();}
    A.vs.forEach(function(v){if(t-(T.crumble[0]+0.35+v.t)<=0){v.p.forEach(function(q,i){if(i)g.lineTo(X(q[0]),Y(q[1]));else g.moveTo(X(q[0]),Y(q[1]));});g.closePath();}});}
  var g=arcLayer(ctx);trace(g);
  // stone lit from the upper left: a vertical gradient (light crown, dark foot), the rock grain coming in as it crumbles
  var sg=g.createLinearGradient(0,Y(100),0,Y(1500));sg.addColorStop(0,S.stoneHi);sg.addColorStop(1,S.stoneCol);g.fillStyle=sg;g.fill();
  if(S.rockPat&&rockiness>0){g.globalAlpha=rockiness*0.9;g.fillStyle=S.rockPat;g.fill();g.globalAlpha=1;}
  // voussoirs falling into the fog
  fall.forEach(function(f){var v=f[0],tau=f[1],fa=1-sm((tau-0.15)/0.8);if(fa<=0)return;var gy=0.5*2600*tau*tau,ox=v.dx*tau,rot=v.rot*tau;
    g.save();g.globalAlpha=fa;g.translate(X(v.c[0]+ox),Y(v.c[1]+gy));g.rotate(rot);g.beginPath();v.p.forEach(function(q,i){var x=(q[0]-v.c[0])*k,y=(q[1]-v.c[1])*k;if(i)g.lineTo(x,y);else g.moveTo(x,y);});g.closePath();
    g.fillStyle=S.stoneCol;g.fill();if(S.rockPat&&rockiness>0){g.globalAlpha=fa*rockiness;g.fillStyle=S.rockPat;g.fill();}g.restore();});
  // air: lighter and bluer with distance, the feet lost in the fog (alpha fades downward)
  g.globalCompositeOperation='source-atop';var ag=g.createLinearGradient(0,Y(150),0,Y(1500));ag.addColorStop(0,rgba(FOG,0.10));ag.addColorStop(1,rgba(FOG,0.30));g.fillStyle=ag;g.fillRect(0,0,ctx.W,ctx.H);
  g.globalCompositeOperation='destination-in';var mg=g.createLinearGradient(0,Y(700),0,Y(1650));mg.addColorStop(0,'rgba(0,0,0,1)');mg.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=mg;g.fillRect(0,0,ctx.W,ctx.H);
  G.save();G.globalAlpha=a;G.drawImage(S.arcC,0,0,ctx.W,ctx.H);G.restore();
  // the occluder for the fog (at the fog's resolution): the same silhouette, its foot dissolving into the fog
  var fs=fogSize(ctx.W,ctx.H);if(!S.arcM||S.arcM.width!==fs[0]||S.arcM.height!==fs[1])S.arcM=cv(fs[0],fs[1]);
  var m=S.arcM.getContext('2d');m.setTransform(1,0,0,1,0,0);m.globalCompositeOperation='source-over';m.globalAlpha=1;m.clearRect(0,0,fs[0],fs[1]);
  m.setTransform(fs[0]/ctx.W,0,0,fs[1]/ctx.H,0,0);trace(m);m.fillStyle='rgba(255,255,255,'+a.toFixed(3)+')';m.fill();
  m.globalCompositeOperation='destination-in';var mm=m.createLinearGradient(0,Y(250),0,Y(1450));mm.addColorStop(0,'rgba(0,0,0,1)');mm.addColorStop(1,'rgba(0,0,0,0)');m.fillStyle=mm;m.fillRect(0,0,ctx.W,ctx.H);}

// ================================================================== the walk: scale s of the figure (5.2 → 1) and its stand point, in painting px of the Wanderer
function walkState(ctx,t){if(t<T.manIn[0])return null;var u=seg(t,T.walk);
  var ue=1-Math.pow(1-u,1.45),n=10,x=ue*n,kk=Math.floor(Math.min(x,n-1e-6)),f=x-kk;
  var step=(kk+f-0.5*Math.sin(2*Math.PI*f)/(2*Math.PI))/n;                 // each step surges a little, never goes backwards
  var S0=s0(ctx),s=Math.pow(S0,1-step);                                             // the same ratio smaller with each step
  var st=standAt(ctx,s),amp=(1-sm((u-0.86)/0.14));
  var bob=-Math.pow(Math.sin(Math.PI*f),2)*12*amp,sway=Math.sin(Math.PI*(kk+f))*9*amp,rot=Math.sin(Math.PI*(kk+f))*0.011*amp;
  return{s:s,x:st[0]+sway,y:st[1]+bob,rot:rot,u:u};}
function standAt(ctx,s){if(s<=PATH[0][2]){for(var i=0;i<PATH.length-1;i++){var a=PATH[i],b=PATH[i+1];if(s<=a[2]&&s>=b[2]){var f=(a[2]-s)/(a[2]-b[2]);return[a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f];}}return[STAND[0],STAND[1]];}
  // beyond the drawn path (below the frame): the head comes up from under the bottom edge of the screen, in front of the visitor's position
  // the first pose: the back of his head exactly where the swords met (his body continues below the bottom edge of the screen)
  var R=ctx.to.rect,k=R.w/PW,S0=s0(ctx),e=Math.pow(cl((s-PATH[0][2])/(S0-PATH[0][2])),1.5),cv0=convAt(ctx);
  var hx=(cv0[0]-R.x)/k,hy=(cv0[1]-R.y)/k,sx=hx+(STAND[0]-HEAD[0])*S0,sy=hy+(STAND[1]-HEAD[1])*S0;
  return[PATH[0][0]+(sx-PATH[0][0])*e,PATH[0][1]+(sy-PATH[0][1])*e];}
// the swords' convergence of the Horatii on screen (the neoclassical module's measured grip if it is loaded)
function convAt(ctx){var F=ctx.from,R0=F?F.rect:ctx.to.rect,k0=R0.w/NW,G=SH.neoclassicalGeom,P=G&&G.P?G.P:CONV;return[R0.x+P[0]*k0,R0.y+P[1]*k0];}
function manBox(ctx,w){var R=ctx.to.rect,k=R.w/PW,s=w.s,X=R.x+w.x*k,Y=R.y+w.y*k;
  return{x:X-(STAND[0]-LY.man[0])*k*s,y:Y-(STAND[1]-LY.man[1])*k*s,w:LY.man[2]*k*s,h:LY.man[3]*k*s,X:X,Y:Y,hx:X+(HEAD[0]-STAND[0])*k*s,hy:Y+(HEAD[1]-STAND[1])*k*s,k:k};}

// ================================================================== fog parameters of the transition at time t
function fogParams(ctx,t){var S=ctx.state,W=ctx.W,H=ctx.H,R1=ctx.to.rect,k1=R1.w/PW,F=ctx.from,R0=F?F.rect:R1,k0=R0.w/NW;
  if(t>=T.valley[1]+0.2)return restFog(W,H,R1,t,[],null,1);
  var src=ARCH.map(function(c){return[R0.x+c[0]*k0,R0.y+(c[1]+150)*k0];}),archR=RI*k0;
  var w=[0,1,2].map(function(i){var t0=T.wisp[i],st=sm((t-t0)/0.6)*(1-sm(seg(t,[6.0,8.0])));return[src[i][0],src[i][1],Math.max(0,t-t0),st];});
  var Rmax=Math.hypot(W,H)*1.25,fr=eio(seg(t,T.surge)),R=Rmax*Math.pow(fr,1.25),flood=[R,50+0.14*R,sm(seg(t,[T.surge[0],T.surge[0]+1.0]))];
  var gridA=sm(seg(t,[T.grid[0],T.grid[0]+0.6]))*(1-sm(seg(t,[T.grid[1]-1.2,T.grid[1]]))),G=SH.neoclassicalGeom||{cols:[830,1510],piers:[150,2190],spring:418};
  var gridL=G.cols.concat(G.piers).map(function(x){return R0.x+x*k0;}),gridY=R0.y+G.spring*k0;
  var arcA=0.72*sm(seg(t,T.arcOcc))*(1-sm(seg(t,[T.sink[0]+0.4,T.sink[1]-0.2])));
  var den=0.97-0.07*sm(seg(t,[9,12]));
  var streak=sm(seg(t,[T.wind[0],T.wind[0]+1.6]))*(1-0.7*sm(seg(t,[T.wind[1]-2,T.wind[1]+1])))*(1-sm(seg(t,[15,18])));
  // the parting: opens where the swords met, then stays on the head of the walker
  var conv=convAt(ctx),ws=walkState(ctx,t),mb=ws?manBox(ctx,ws):null;
  var hr0=Math.max(40,Math.min(W,H)*0.07),hx=conv[0],hy=conv[1],hr=hr0;
  // the parting sits on the back of his head (at first exactly where the swords met), wide enough for head and shoulders
  if(mb){hx=mb.hx;hy=mb.hy+32*k1*ws.s;hr=Math.max(hr0,96*k1*ws.s)*(0.75+0.25*sm(seg(t,T.hole)));}
  var holeA=sm(seg(t,T.hole))*(1-sm(seg(t,[16.8,18.4])));
  var rise=R1.h*0.15*(1-eo(seg(t,T.riseRock))),rockA=sm(seg(t,T.rockOcc))*(1-sm(seg(t,T.occOut)));
  var manA=ws?sm(seg(t,[T.walk[0]-0.3,T.walk[0]+1.6]))*(1-sm(seg(t,T.occOut))):0,manXf=mb?[mb.x-mb.w*0.06,mb.y-mb.h*0.03,mb.w*1.12,mb.h*1.05]:[0,0,1,1];
  var lateY=-160+(H+420)*eio(seg(t,T.late)),lateOn=t>=T.late[0]?1:0;
  var ySea=titleMid(ctx),seaY=ySea+(H+320-ySea)*eio(seg(t,T.seaDown)),sea=[seaY,64,1-sm(seg(t,T.seaFade))];
  var valA=0.85+(REST_VAL-0.85)*sm(seg(t,T.valley));
  var z=[0,0,0,0];
  return{W:W,H:H,t:t,drift:drift(t),streak:streak,archR:archR,w:w,flood:flood,den:den,gridR:[R0.x,R0.y,R0.w,R0.h],gridA:gridA,gridL:gridL,gridY:gridY,arcA:arcA,arcCanvas:S.arcM,hole:[hx,hy,hr,holeA],
    rockXf:[R1.x+OCC_ROCK[0]*k1,R1.y+OCC_ROCK[1]*k1+rise,OCC_ROCK[2]*k1,OCC_ROCK[3]*k1],manXf:manXf,rockA:rockA,manA:manA,
    to:[R1.x,R1.y,R1.w,R1.h],valA:valA,lateY:lateY,lateOn:lateOn,sea:sea,ptr:[],read:null,alpha:1};}
function renderFog(ctx,o){var S=ctx.state;if(!S.fog)return;var fs=fogSize(ctx.W,ctx.H);try{S.fog.draw(o,fs[0],fs[1]);}catch(e){console.error(e);}
  if(window.__romTap)try{window.__romTap(S.fogCanvas);}catch(e){}}   // test hook: the fog layer is read back in the same task (tools only)

// ================================================================== stage: the Wanderer's layers
function drawRom(g,ctx,t,ws,wall){var S=ctx.state,R=ctx.to.rect,k=R.w/PW,a=sm(seg(t,T.romIn));if(a<=0&&!ws)return;
  function L(im,b,dy){if(im&&(im.naturalWidth||im.width))g.drawImage(im,R.x+b[0]*k,R.y+b[1]*k+(dy||0),b[2]*k,b[3]*k);}
  var dR=R.h*0.15*(1-eo(seg(t,T.riseRock))),dM=R.h*0.08*(1-eo(seg(t,T.riseMid))),dF=R.h*0.04*(1-eo(seg(t,T.riseFar)));
  g.save();g.globalAlpha=a;
  g.save();g.beginPath();g.rect(R.x,R.y,R.w,R.h);g.clip();
  L(S.im.sky,LY.sky);L(S.im.far,LY.far,dF);L(S.im.mid,LY.mid,dM);g.restore();
  g.save();g.beginPath();g.rect(R.x,R.y,R.w,ctx.H);g.clip();L(S.im.rock,LY.rock,dR);g.restore();
  var ea=1-sm(seg(t,T.extOut));if(ea>0){g.globalAlpha=a*ea;L(S.im.ext,LY.ext,dR);g.globalAlpha=a;}
  // while it comes out of the fog the picture has no edge yet: the wall's colour feathers its sides and top in
  var fe=1-sm(seg(t,T.feather));if(fe>0.002&&wall){var fw=Math.min(R.w,R.h)*0.2*fe,c0=wall.replace('rgb','rgba').replace(')',',1)'),c1=wall.replace('rgb','rgba').replace(')',',0)');
    g.globalAlpha=1;var gl=g.createLinearGradient(R.x-1,0,R.x+fw,0);gl.addColorStop(0,c0);gl.addColorStop(1,c1);g.fillStyle=gl;g.fillRect(R.x-1,R.y-1,fw+1,ctx.H-R.y+1);
    var gr=g.createLinearGradient(R.x+R.w+1,0,R.x+R.w-fw,0);gr.addColorStop(0,c0);gr.addColorStop(1,c1);g.fillStyle=gr;g.fillRect(R.x+R.w-fw,R.y-1,fw+1,ctx.H-R.y+1);
    var gt=g.createLinearGradient(0,R.y-1,0,R.y+fw);gt.addColorStop(0,c0);gt.addColorStop(1,c1);g.fillStyle=gt;g.fillRect(R.x-1,R.y-1,R.w+2,fw+1);}
  g.restore();
  // the walker: from where the swords met, away from the visitor, up onto the summit where the painter put him
  if(ws){var mb=manBox(ctx,ws),ma=sm(seg(t,T.manIn));g.save();g.globalAlpha=ma;g.translate(mb.X,mb.Y);g.rotate(ws.rot);g.drawImage(S.im.man,mb.x-mb.X,mb.y-mb.Y,mb.w,mb.h);g.restore();}}

// ================================================================== the Oath's resting hint (grid + convergence, js/t-neoclassical.js)
// p = 0 continues it at the strength the visitor last saw (it fades a few seconds into that room's rest), then it resurfaces as the fog runs along it
var lastRest={idx:-1,t0:0};
(function watchRest(){try{var st=window.EH&&EH.debug&&EH.debug.state;if(st){if(st.phase==='rest'){if(lastRest.idx!==st.idx||!lastRest.on)lastRest={idx:st.idx,t0:performance.now(),on:true};}else if(lastRest.on){lastRest.on=false;lastRest.t1=performance.now();}}}catch(e){}
  requestAnimationFrame(watchRest);})();
function entryHint(ctx){if(!ctx.from||lastRest.idx!==ctx.from.idx)return 0;var age=((lastRest.on?performance.now():lastRest.t1)-lastRest.t0)/1000;return 0.55*(1-sm((age-3.2)/3.0));}
function hintAt(ctx,t){var S=ctx.state,h0=(S.hint0||0)*(1-sm(seg(t,[0.2,1.8])));return Math.max(h0,0.5*sm(seg(t,T.hintIn)))*(1-sm(seg(t,T.hintOut)));}
// the swords' convergence stays where it was when everything else has drowned: a small Roman-red ring and cross above the fog (layer 'mark'),
// until the fog parts there and it becomes the back of a head
function drawMark(ctx,t){var S=ctx.state;if(!S.markC)return;var g=S.markC.__g,dpr=ctx.dpr||1,a=0.9*sm(seg(t,T.mark))*(1-sm(seg(t,T.markOut)));
  if(S.markDirty){g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,S.markC.width,S.markC.height);S.markDirty=false;}
  if(a<=0.002||!ctx.from)return;
  var P=convAt(ctx),ms=ctx.from.rect.w/NW,R=Math.max(5,14*ms/.5)*(1+0.9*eo(seg(t,T.markOut))),lw=Math.max(.9,Math.min(1.6,ms*2.4));
  g.setTransform(dpr,0,0,dpr,0,0);g.globalAlpha=a;g.strokeStyle='#8f2e22';g.lineWidth=lw;g.lineCap='round';
  g.beginPath();g.arc(P[0],P[1],R,0,Math.PI*2);g.stroke();g.beginPath();g.moveTo(P[0]-R*1.8,P[1]);g.lineTo(P[0]+R*1.8,P[1]);g.moveTo(P[0],P[1]-R*1.8);g.lineTo(P[0],P[1]+R*1.8);g.stroke();
  g.globalAlpha=1;S.markDirty=true;}

// ================================================================== warm-up
function prewarm(ctx){var S=ctx.state,W=ctx.W,H=ctx.H,q=Math.min(ctx.dpr||1,2),R1=ctx.to.rect;
  try{var c=cv(W*q,H*q),g=c.getContext('2d');g.setTransform(q,0,0,q,0,0);
    Object.keys(S.im).forEach(function(n){var im=S.im[n];if(im&&(im.naturalWidth||im.width))g.drawImage(im,R1.x,R1.y,R1.w,R1.h*0.5);});
    // the walker at the scales he is drawn at (mip levels)
    [1,1.6,2.4,3.2,4.2].forEach(function(s){if(S.im.man&&S.im.man.naturalWidth)g.drawImage(S.im.man,0,0,LY.man[2]*R1.w/PW*s,LY.man[3]*R1.w/PW*s);});
    if(ctx.to.image&&ctx.to.image.naturalWidth)g.drawImage(ctx.to.image,R1.x,R1.y,R1.w,R1.h);
    if(ctx.from){var R0=ctx.from.rect;g.drawImage(fromArt(ctx),R0.x,R0.y,R0.w,R0.h);}
    if(S.rockPat){g.fillStyle=S.rockPat;g.fillRect(0,0,50,50);}
    g.getImageData(0,0,1,1);
  }catch(e){console.error(e);}}

// ================================================================== the module
EH.transition('romanticism',{
  duration:D,
  assets:['cut/sky.webp','cut/far.webp','cut/mid.webp','cut/rock.webp','cut/wanderer.webp','cut/rock_ext.webp','t_occ_rock.webp','t_occ_man.webp','t_valley.webp','t_rockpat.webp'],
  init:function(ctx){var S=ctx.state;myIdx=ctx.to.idx;
    S.im={sky:ctx.asset('cut/sky.webp'),far:ctx.asset('cut/far.webp'),mid:ctx.asset('cut/mid.webp'),rock:ctx.asset('cut/rock.webp'),man:ctx.asset('cut/wanderer.webp'),ext:ctx.asset('cut/rock_ext.webp')};
    // the rock's continuation below the frame dissolves downward (on tall screens it ends above the bottom edge: no hard cut)
    var ex=S.im.ext;if(ex&&ex.naturalWidth){var ec=cv(ex.naturalWidth,ex.naturalHeight),eg=ec.getContext('2d');eg.drawImage(ex,0,0);eg.globalCompositeOperation='destination-in';
      var gy=eg.createLinearGradient(0,0,0,ec.height);gy.addColorStop(0,'#000');gy.addColorStop(0.45,'#000');gy.addColorStop(1,'rgba(0,0,0,0)');eg.fillStyle=gy;eg.fillRect(0,0,ec.width,ec.height);S.im.ext=ec;}
    S.arc=arcadePlan();
    var rp=ctx.asset('t_rockpat.webp');if(rp&&rp.naturalWidth){var pc=cv(360,360),pg=pc.getContext('2d');pg.drawImage(rp,0,0);
      // cooler and paler: rock seen through air
      pg.globalCompositeOperation='source-atop';pg.fillStyle='rgba(110,114,126,.18)';pg.fillRect(0,0,360,360);S.rockPat=pg.createPattern(pc,'repeat');}
    S.stoneCol='rgb(58,54,52)';S.stoneHi='rgb(120,116,112)';
    if(ctx.from){S.fromImg=ctx.from.frame==='fade'?fadeMasked(ctx.from.image):ctx.from.image;}
    S.toImg=ctx.to.frame==='fade'?fadeMasked(ctx.to.image):ctx.to.image;
    S.fogCanvas=ctx.layer('fog',{z:8,type:'webgl'});fogEl=S.fogCanvas;S.markC=ctx.layer('mark',{z:9});S.markDirty=true;
    if(!S.fogCanvas.__fog){S.fogCanvas.__fog=Fog(S.fogCanvas);if(S.fogCanvas.__fog)S.fogCanvas.__fog.textures(ctx.asset('t_occ_rock.webp'),ctx.asset('t_occ_man.webp'),ctx.asset('t_valley.webp'));}
    S.fog=S.fogCanvas.__fog;
    // clear the layer until the transition draws (it may be created during the previous room's rest)
    if(S.fog){var fs=fogSize(ctx.W,ctx.H);S.fog.draw({alpha:0},fs[0],fs[1]);}
    SH.romanticismTex={rock:ctx.asset('t_occ_rock.webp'),man:ctx.asset('t_occ_man.webp'),valley:ctx.asset('t_valley.webp')};
    prewarm(ctx);},
  draw:function(p,ctx){var g=ctx.g,S=ctx.state,W=ctx.W,H=ctx.H,t=p*D,R1=ctx.to.rect,F=ctx.from;myIdx=ctx.to.idx;S.restT0=null;S.ptr=[];
    domFrom(ctx,t);domTitle(ctx,t);
    if(ctx.lastP==null)S.hint0=entryHint(ctx);
    if(p>=1){drawMark(ctx,D);g.fillStyle=ctx.to.wall;g.fillRect(0,0,W,H);wash(g,W,H,R1,ctx.to.ink,1);g.drawImage(S.toImg,R1.x,R1.y,R1.w,R1.h);renderFog(ctx,restFog(W,H,R1,D,[],null,1));return;}
    // ---------------- the wall: the Horatii's, darkening into the Wanderer's under the fog
    var wl=sm(seg(t,T.wall)),fw=F?rgb(F.wall):rgb(ctx.to.wall),tw=rgb(ctx.to.wall);
    g.fillStyle=mixc(fw,tw,wl);g.fillRect(0,0,W,H);
    if(F)wash(g,W,H,F.rect,F.ink,1-wl);wash(g,W,H,R1,ctx.to.ink,wl);
    // ---------------- the Horatii, drowned in fog, and their arcade crumbling into rock
    if(F&&t<T.neoOut[1]){var R0=F.rect,na=(1-0.55*sm(seg(t,T.fogTint)))*(1-sm(seg(t,T.neoOut)));
      var fdA=1-sm(seg(t,[3.0,5.4])),shc=frameShadow(S,R0,F.frame);g.save();
      if(shc&&fdA>0){g.globalAlpha=na*fdA;g.drawImage(shc,R0.x-(R0.fp||0)-shc.pad,R0.y-(R0.fp||0)-shc.pad);}
      g.globalAlpha=na;frameDeco(g,R0,F.frame,fdA);g.drawImage(fromArt(ctx),R0.x,R0.y,R0.w,R0.h);
      if(typeof SH.neoclassicalRest==='function'){var ha=hintAt(ctx,t)*na;if(ha>0.002){try{SH.neoclassicalRest(g,{W:W,H:H,rect:R0,dpr:ctx.dpr,alpha:ha});}catch(e){console.error(e);}}}
      g.restore();}
    if(F)drawArcade(g,ctx,t);
    // ---------------- the Wanderer: layers rising with parallax, the walker
    var ws=walkState(ctx,t);drawRom(g,ctx,t,ws,mixc(fw,tw,wl));
    var fa=sm(seg(t,T.fin));if(fa>0){g.save();g.globalAlpha=fa;g.drawImage(S.toImg,R1.x,R1.y,R1.w,R1.h);g.restore();}
    // ---------------- the fog above everything
    renderFog(ctx,fogParams(ctx,t));drawMark(ctx,t);
  },
  done:function(ctx){ctx.state.restT0=performance.now();},
  rest:function(ctx){if(ctx.state.markDirty)drawMark(ctx,D);restBody(ctx);}
});

// ================================================================== rest: the cursor is the wind
function restBody(ctx){var S=ctx.state,now=performance.now(),r=ctx.to.rect,dt=Math.min(ctx.dt||0.016,0.1);myIdx=ctx.to.idx;if(!S.fog)return;
  if(S.restT0==null)S.restT0=now;var tau=(now-S.restT0)/1000;
  var te=document.getElementById('era'+ctx.to.idx);if(tau>0.6&&(!te||te.classList.contains('on')))clean();   // the title's inline opacity is not needed once the core shows it
  watch();
  var pt=ctx.pointer,R=ctx.reading&&ctx.readRect,inRead=R&&pt.x>=R.x&&pt.x<=R.x+R.w&&pt.y>=R.y&&pt.y<=R.y+R.h;
  var live=pt.active&&now-pt.moved<5000&&!ctx.tool&&!inRead;
  S.ptr=S.ptr||[];
  if(live){var L=S.ptr[S.ptr.length-1],d=L?Math.hypot(pt.x-L.x,pt.y-L.y):1e9;
    if(!L||d>10){var sp=L?Math.min(1,d/Math.max(8,(now-L.t0)*0.6)):0.3;S.ptr.push({x:pt.x,y:pt.y,t0:now,r:44+46*sp});if(S.ptr.length>12)S.ptr.shift();}
    else{L.t0=now;}}
  // each gust opens the fog and lets it close again slowly (≈ 5 s)
  var holes=[];S.ptr=S.ptr.filter(function(h){var age=(now-h.t0)/1000;return age<7;});
  S.ptr.forEach(function(h){var age=(now-h.t0)/1000,o=sm(age/0.25)*(1-sm((age-0.6)/5.5));holes.push([h.x,h.y,h.r*(1+age*0.35),o]);});
  // compare tools own the painting: the fog lifts off it
  S.restOff=(ctx.tool==='era'||ctx.tool==='special')?1:0;
  var read=R?[R.x,R.y,R.w,R.h]:null;
  renderFog(ctx,restFog(ctx.W,ctx.H,r,D+tau,holes,read,1-S.restOff));}

// ================================================================== for the next room: redraw this room's rest extras (the drifting fog) on a 2D context
var sharedFog=null;
SH.romanticismRest=function(g,o){try{var tx=SH.romanticismTex;if(!tx)return;
  if(!sharedFog){var c=cv(2,2);sharedFog=Fog(c);if(!sharedFog)return;sharedFog.textures(tx.rock,tx.man,tx.valley);}
  var fs=fogSize(o.W,o.H);sharedFog.draw(restFog(o.W,o.H,o.rect,D+(o.t||0),[],null,1),fs[0],fs[1]);
  g.drawImage(sharedFog.canvas,0,0,o.W,o.H);}catch(e){console.error(e);}};
})();

;
/* 现实主义 · 从山顶跌回地面 — the passage from Friedrich's Wanderer above the Sea of Fog (romanticism) into Millet's Gleaners.
   Beats (seconds of D = 21, see T; full list in _wip/sync/realism.timeline.md): the Wanderer rests, his fog drifting in the valleys ·
   the camera pushes into the picture past his left shoulder, the fog sea spills over the room · it steps off the summit: the rock sweeps
   up past the lens, the fog rushes up, streaking · full white (6.35–6.55) · inside the cloud the grey fog warms into gold dust · the
   cloud base lifts off the top, the plain rises from below, the horizon climbs to mid-screen, low sun shafts through the dust · the
   camera skims the far field left to right: the haystacks piled like mountains (the Romantic peaks come back as haystacks), the loaded
   cart, the overseer on horseback · it descends: the horizon keeps climbing, the ground plane flattens (camera height), the three women
   rise into view from below (nearer = faster) and the camera stops at waist height beside them (16.4–17.2) · pull-back onto the wall:
   the horizon settles on its hung height, the dust clears to the room, whose wall/floor line IS the painted horizon · title, label flat
   on the floor · hand-over.
   Layers: the romanticism cut (../romanticism/cut: sky, far, mid, rock, wanderer, rock_ext; t_valley = its resting fog) and
   rooms/realism/cut/ (layers.json). Dust: one WebGL overlay layer ('dust', above the wall text), the romanticism fog shader's field
   (identical at p = 0: it takes over the Wanderer's resting fog) warmed into dust; ≤ 1/4 of the device pixels.
   Rest: the floor (layer 'floor', z 4, under the wall text): a darker floor below the painting's horizon, outside the painting and the
   reading panel; the label lies on it (CSS perspective). EH_SHARED.realismRest(g, {W, H, rect, alpha}) redraws the floor. */
(function(){
'use strict';
var D=21, RW=1871, RH=2400, GW=2400, GH=1796, ROM_D=20.6, REST_VAL=0.62;
var SH=window.EH_SHARED=window.EH_SHARED||{};
var T={
  step:[0.25,4.2], par:[0.4,6.0], outR:[0.5,3.2], fromFx:[0.5,1.8], xfade:[0.25,0.9], fogBase:[1.4,3.0], fall:[3.0,6.0], streak:[3.4,5.6],
  cov:[3.8,6.1], white:[5.5,6.35], whiteOut:[6.55,8.0], warm:[5.9,7.3], swap:6.45,
  base:[7.5,10.9], hyUp:[6.5,11.4], sun:[7.8,10.6], sunOut:[12.6,16.4], haze:[7.4,9.0], hazeOut:[14.0,18.6],
  // the camera below the cloud: skim the far field (haystacks → loaded cart → overseer), descend to waist height beside the women, stop, pull back
  skim:[9.0,13.6], desc:[12.4,16.4], hgt:[11.6,16.4], pull:[17.2,20.5],
  out:[16.8,19.6], floor:[17.2,19.8], extOut:[17.2,19.2], shadow:[18.4,20.4],
  title:19.0, label:[19.9,20.6], fin:[19.7,20.6], dustOff:[18.8,20.8]};
// ------------------------------------------------------------------ the Wanderer (romanticism cut/layers.json)
var LYR={sky:[0,0,1871,2400],far:[0,686,1871,1714],mid:[0,1110,1663,514],rock:[0,1486,1871,914],man:[731,810,440,944],ext:[0,2340,1871,900]};
// parallax weight of each layer (0 = at infinity) and the point we move towards: the fog valley just left of his left shoulder
var WR={sky:0,far:0.22,mid:0.42,rock:0.95,man:0.95,ext:0.95}, FOC=[640,1130];
// ------------------------------------------------------------------ the Gleaners (rooms/realism/cut/layers.json, main.webp px) — filled from layers.json
var GL={HY:540, ext:720,
  // kind: 'sky' (above the horizon, never stretched) · 'ground' (stretched about the horizon while the camera is high: the ground plane
  // seen from above) · 'upright' (stands on the ground at footY: moved down with the ground under its feet, not stretched)
  // filled from rooms/realism/cut/layers.json at build time of this list (see LAYERS below)
  layers:[
    {id:'sky',kind:'sky',file:'cut/sky.webp',b:[0,0,2400,1796]},
    {id:'sky_ext',kind:'ext',file:'cut/sky_ext.webp',b:[0,-720,2400,752],ov:32},
    {id:'far',kind:'ground',file:'cut/far.webp',b:[0,358,2400,762]},
    {id:'mid',kind:'ground',file:'cut/mid.webp',b:[0,686,2400,1110]},
    {id:'women',kind:'upright',file:'cut/women.webp',b:[421,528,1679,1048],foot:1490},
    {id:'fg',kind:'ground',file:'cut/fg.webp',b:[0,1403,2400,393]}],
  // the far field the camera skims (main.webp px): the haystacks, the loaded cart, the overseer on horseback; the women's centre
  hay:560, cart:862, overseer:2118, women:1260, waist:1380};
function cv(w,h){var c=document.createElement('canvas');c.width=Math.max(1,Math.round(w));c.height=Math.max(1,Math.round(h));return c;}
function rgb(hex){var m=String(hex||'').trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);if(!m)return[40,40,40];var h=m[1];if(h.length===3)h=h.replace(/./g,'$&$&');var n=parseInt(h,16);return[(n>>16)&255,(n>>8)&255,n&255];}
function mixa(a,b,t){return[0,1,2].map(function(i){return a[i]+(b[i]-a[i])*t;});}
function css(c){return 'rgb('+c.map(Math.round).join(',')+')';}
function cl(x){return x<0?0:x>1?1:x;}
function sm(x){x=cl(x);return x*x*(3-2*x);}
function seg(t,a){return cl((t-a[0])/(a[1]-a[0]));}
function eo(x){x=cl(x);return 1-Math.pow(1-x,3);}
function ei(x){x=cl(x);return x*x*x;}
function eio(x){x=cl(x);return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;}
function lerp(a,b,u){return a+(b-a)*u;}
function ok(im){return !!im&&(im.naturalWidth||im.width)>0;}

// ------------------------------------------------------------------ replicas of the DOM around a hung work
// .wash (index.html): radial-gradient(ellipse 70% 60% at --sx --sy, c, transparent 70%) — --sx/--sy rounded to 0.1 %
function wash(g,W,H,rect,ink,k){if(k<=0)return;var dark=ink==='dark',c=dark?'255,255,255':'255,244,225',a=(dark?.35:.08)*k;
  var sx=+((rect.x+rect.w/2)/W*100).toFixed(1)/100*W,sy=+((rect.y+rect.h/2)/H*100).toFixed(1)/100*H,rx=.7*W,ry=.6*H;
  g.save();g.translate(sx,sy);g.scale(rx,ry);var gr=g.createRadialGradient(0,0,0,0,0,1);gr.addColorStop(0,'rgba('+c+','+a+')');gr.addColorStop(.7,'rgba('+c+',0)');gr.addColorStop(1,'rgba('+c+',0)');
  g.fillStyle=gr;g.fillRect(-sx/rx,-sy/ry,W/rx,H/ry);g.restore();}
// .frame.f-none::before box-shadow 0 26px 60px -26px rgba(0,0,0,.6), pre-rendered once per size (device-pixel aligned)
function shadowCache(dpr,r){var oy=26,blur=60,spread=-26,M=Math.ceil(1.6*blur+oy+4),X0=r.x-spread-M,Y0=r.y-spread-M,X1=r.x+r.w+spread+M,Y1=r.y+r.h+spread+M;
  var dx=Math.floor(X0*dpr),dy=Math.floor(Y0*dpr),c=cv(Math.ceil(X1*dpr)-dx,Math.ceil(Y1*dpr)-dy),q=c.getContext('2d');q.setTransform(dpr,0,0,dpr,-dx,-dy);
  q.shadowColor='rgba(0,0,0,.6)';q.shadowBlur=blur*dpr;q.shadowOffsetX=1e5*dpr;q.shadowOffsetY=oy*dpr;q.fillStyle='#000';q.fillRect(r.x-spread-1e5,r.y-spread,r.w+2*spread,r.h+2*spread);
  return{c:c,x:dx/dpr,y:dy/dpr,w:c.width/dpr,h:c.height/dpr,r:{x:r.x,y:r.y,w:r.w,h:r.h}};}
// the shadow of rect r, stretched onto box b (the painting's bounds while the camera moves)
function drawShadow(g,sh,a,b){if(!sh||a<=0)return;var r=sh.r,sx=b?b.w/r.w:1,sy=b?b.h/r.h:1,ox=b?b.x-r.x*sx:0,oy=b?b.y-r.y*sy:0;
  g.save();g.globalAlpha=a;g.drawImage(sh.c,ox+sh.x*sx,oy+sh.y*sy,sh.w*sx,sh.h*sy);g.restore();}
// like core's paintArt(): the hung work is drawn into a canvas of min(round(w·dpr), 2600) px, then scaled by CSS
function artCanvas(im,r,dpr){var w=Math.min(Math.round(r.w*dpr),2600),h=Math.round(w*((im&&im.naturalHeight)||1)/((im&&im.naturalWidth)||1)),c=cv(w,h);if(ok(im))c.getContext('2d').drawImage(im,0,0,w,h);return c;}

// ------------------------------------------------------------------ the floor: a darker ground below the painting's horizon, outside the work
// (under the wall text; translucent so the DOM's frame shadow shows through). The same drawing serves p = 1, rest and EH_SHARED.realismRest.
function floorY(rect){return rect.y+GL.HY*rect.h/GH;}
function floorPaint(g,o){var W=o.W,H=o.H,y=o.y,a=o.alpha==null?1:o.alpha;if(a<=0.001||y>=H)return;var dark=o.ink==='dark';
  g.save();g.beginPath();g.rect(0,0,W,H);var b=o.cut;if(b)g.rect(b.x,b.y,b.w,b.h);if(o.read){var R=o.read;g.rect(R.x-8,R.y-8,R.w+16,R.h+16);}g.clip('evenodd');
  g.globalAlpha=a;var y0=Math.max(y,-40);
  // the floor itself: a warm earth tone laid over the wall, a little darker towards the visitor
  var f=g.createLinearGradient(0,y0,0,H);f.addColorStop(0,dark?'rgba(92,70,44,.10)':'rgba(24,17,10,.30)');f.addColorStop(1,dark?'rgba(92,70,44,.16)':'rgba(16,11,6,.46)');
  g.fillStyle=f;g.fillRect(0,y0,W,H-y0);
  // where wall meets floor: a soft contact shadow on the floor and a faint lit edge
  var s=g.createLinearGradient(0,y0,0,y0+26);s.addColorStop(0,dark?'rgba(40,28,14,.14)':'rgba(0,0,0,.22)');s.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=s;g.fillRect(0,y0,W,26);
  g.fillStyle=dark?'rgba(255,255,255,.35)':'rgba(255,238,210,.09)';g.fillRect(0,y0-1,W,1);
  g.restore();}
SH.realismRest=function(g,o){try{floorPaint(g,{W:o.W,H:o.H,y:floorY(o.rect),alpha:o.alpha,ink:o.ink||'light',cut:o.rect,read:o.readRect||null});}catch(e){console.error(e);}};

// ------------------------------------------------------------------ the label lies flat on the floor (CSS perspective, removed when it has faded out in another room)
var myIdx=-1,watching=false,flatEl=null,floorEl=null,dustEl=null;
var FLAT='perspective(560px) rotateX(38deg)';
function flat(on){var l=document.getElementById('lab'+myIdx);if(!l)return;if(on){if(l.style.transform!==FLAT){l.style.transformOrigin='50% 100%';l.style.transform=FLAT;}flatEl=l;watch();}}
function watch(){if(watching)return;watching=true;(function loop(){var st=window.EH&&EH.debug&&EH.debug.state;
  var here=st&&st.idx===myIdx,next=st&&st.idx===myIdx+1&&st.phase==='enter';
  // narrow screens: while reading the work is hidden and rest() is not called — take the floor down with it
  if(floorEl)floorEl.style.opacity=(here&&st.reading&&EH.rectFor&&!EH.rectFor(myIdx,'read'))?'0':'';
  if(flatEl&&!here){var op=+getComputedStyle(flatEl).opacity;if(!flatEl.classList.contains('on')&&op<0.02){flatEl.style.transform='';flatEl.style.transformOrigin='';flatEl=null;}}
  if(!here&&!next&&!flatEl){if(floorEl)floorEl.style.opacity='';watching=false;return;}
  requestAnimationFrame(loop);})();}
// where the core will hang the label (core hangLabels): right of the frame on wide screens, else under it
function placeLabel(ctx){var l=document.getElementById('lab'+ctx.to.idx);if(!l)return;var r=ctx.to.rect,fp=r.fp||0,f={left:r.x-fp,right:r.x+r.w+fp,bottom:r.y+r.h+fp};
  var W=innerWidth,Hh=innerHeight,wide=W>1180,h=l.offsetHeight,w=l.offsetWidth,g=W<=560?16:36,ft=document.querySelector('.foot'),footTop=ft?ft.getBoundingClientRect().top:Hh-80;
  var land=W<=980&&Hh<520&&W>Hh,x,y;
  if(wide){x=Math.round(f.right+34);y=Math.round(Math.max(64,Math.min(f.bottom-h,footTop-24-h)));}
  else if(land){var eb=document.getElementById('era'+ctx.to.idx);eb=eb?eb.getBoundingClientRect():null;x=Math.round(W*.58+24);y=Math.round((eb?eb.bottom:40)+14);}
  else{x=Math.round(Math.min(Math.max(f.left,g),W-g-w));y=Math.round(f.bottom+16);}
  var xs=x+'px',ys=y+'px';if(l.style.left!==xs)l.style.left=xs;if(l.style.top!==ys)l.style.top=ys;}

// ------------------------------------------------------------------ when did the Wanderer's room come to rest? (its fog's clock: t = 20.6 + seconds of rest)
var romRest={on:false,t0:0,t1:0};
(function watchRom(){try{var st=window.EH&&EH.debug&&EH.debug.state;if(st&&myIdx>0){var isRom=st.idx===myIdx-1&&st.phase==='rest';
  if(isRom&&!romRest.on){romRest={on:true,t0:performance.now(),t1:0};}else if(!isRom&&romRest.on){romRest.on=false;romRest.t1=performance.now();}}}catch(e){}
  requestAnimationFrame(watchRom);})();
function romTau(){if(!romRest.t0)return 0;return Math.max(0,((romRest.on?performance.now():romRest.t1)-romRest.t0)/1000);}

// ================================================================== the dust (WebGL): the romanticism fog field, warmed
var VS='attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
var FS=[
'precision highp float;',
'uniform vec2 uRes,uCss,uDrift;uniform float uT,uStreak;uniform vec3 uNm;',
'uniform sampler2D uValley;uniform vec4 uTo;uniform float uValA;',
'uniform float uCov,uWhite,uWarm;uniform vec2 uBase;uniform vec4 uPaint;uniform vec2 uOut;uniform vec3 uHz,uSun;',
'uniform vec4 uRead;uniform float uReadOn,uAlpha;',
'float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}',
'float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);}',
'const mat2 M=mat2(1.6,1.2,-1.2,1.6);',
'float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p=M*p;a*=.5;}return v;}',
'float fbm3(vec2 p){float v=0.,a=.5;for(int i=0;i<3;i++){v+=a*noise(p);p=M*p;a*=.5;}return v/.875;}',
'float box(vec2 uv){return step(0.,uv.x)*step(uv.x,1.)*step(0.,uv.y)*step(uv.y,1.);}',
'void main(){',
'  vec2 pix=vec2(gl_FragCoord.x,uRes.y-gl_FragCoord.y)/uRes*uCss;',
'  vec2 np=uNm.xy+pix/uNm.z;',
'  float ns=1./300.;vec2 q=np*ns;q.y*=mix(1.,.5,uStreak);q+=uDrift;',
'  vec2 w=vec2(fbm3(q*.6+vec2(1.7,9.2)+uT*.03),fbm3(q*.6+vec2(8.3,2.8)-uT*.024))-.5;',
'  vec2 qw=q+.9*w;float n=fbm(qw+vec2(0.,uT*.015));',
'  float nl=fbm3(qw+vec2(-.05,-.07));',
'  float b=smoothstep(.3,.72,n);',
// the Wanderer's resting fog in the valleys of his painting (exactly the romanticism rest at p = 0)
'  vec2 tu=(pix-uTo.xy)/uTo.zw;float inR=smoothstep(0.,.035,tu.x)*smoothstep(1.,.965,tu.x)*smoothstep(0.,.03,tu.y)*smoothstep(1.,.97,tu.y);',
'  float val=texture2D(uValley,clamp(tu,0.,1.)).r*box(tu);',
'  float aV=clamp(val*uValA*inR*mix(mix(.42,.72,1.-inR),1.,b),0.,1.);',
// the cloud: coverage grows through the noise; below the cloud base it is gone
'  float thr=1.05-1.4*uCov;float cg=smoothstep(thr,thr+.22,n);',
'  cg*=smoothstep(uBase.x+uBase.y,uBase.x-uBase.y,pix.y+(n-.5)*uBase.y*2.6+(nl-.5)*uBase.y*1.2);',
'  float aG=clamp(cg*mix(.72,1.,b),0.,1.)*step(.001,uCov);',
// outside the picture: fog / dust over the room (feathered, ragged edge)
'  float dd=min(min(pix.x-uPaint.x,uPaint.x+uPaint.z-pix.x),min(pix.y-uPaint.y,uPaint.y+uPaint.w-pix.y))+(n-.5)*uOut.y*1.8;',
'  float aO=uOut.x*(1.-smoothstep(-uOut.y*.3,uOut.y,dd))*mix(.62,1.,b);',
// the haze over the far field (aerial perspective), a band around the horizon
'  float hz=(pix.y-uHz.x)/uHz.z;float aH=uHz.y*exp(-hz*hz*(hz<0.?1.4:.7))*(.45+.8*n);',
'  float a=1.-(1.-aV)*(1.-aG)*(1.-aO)*(1.-clamp(aH,0.,1.));',
'  a=mix(a,1.,uWhite);',
'  float sh=clamp(.62+(n-nl)*3.2,0.,1.);',
'  vec3 cool=mix(vec3(.66,.68,.745),vec3(.94,.945,.96),sh);',
'  vec3 warm=mix(vec3(.55,.44,.30),vec3(.97,.89,.72),sh);',
'  vec3 col=mix(cool,warm,uWarm);',
// light through the dust: soft shafts from the low sun
'  if(uSun.z>0.){vec2 sd=pix-uSun.xy;float an=atan(sd.y,sd.x);float r=noise(vec2(an*22.,uT*.12))*.65+noise(vec2(an*57.,uT*.2))*.35;',
'    float L=uSun.z*smoothstep(.42,.85,r)*exp(-length(sd)/(uCss.x*.8));col=mix(col,vec3(1.,.93,.78),clamp(L,0.,1.)*.6);a=max(a,a+L*.25*(1.-a)*a);}',
'  col=mix(col,mix(vec3(.95,.95,.955),vec3(.97,.925,.83),uWarm),uWhite);',
'  vec2 rd=pix-uRead.xy;a*=1.-uReadOn*step(-8.,rd.x)*step(rd.x,uRead.z+8.)*step(-8.,rd.y)*step(rd.y,uRead.w+8.);',
'  a=clamp(a,0.,1.)*uAlpha;',
'  gl_FragColor=vec4(col*a,a);}'].join('\n');

function Dust(canvas){var gl=canvas.getContext('webgl',{premultipliedAlpha:true,alpha:true,antialias:false,depth:false,stencil:false,preserveDrawingBuffer:false});
  if(!gl)return null;
  function sh(type,src){var s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){console.warn(gl.getShaderInfoLog(s));return null;}return s;}
  var p=gl.createProgram(),vs=sh(gl.VERTEX_SHADER,VS),fs=sh(gl.FRAGMENT_SHADER,FS);if(!vs||!fs)return null;gl.attachShader(p,vs);gl.attachShader(p,fs);gl.linkProgram(p);
  if(!gl.getProgramParameter(p,gl.LINK_STATUS)){console.warn(gl.getProgramInfoLog(p));return null;}
  gl.useProgram(p);var buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  var al=gl.getAttribLocation(p,'a');gl.enableVertexAttribArray(al);gl.vertexAttribPointer(al,2,gl.FLOAT,false,0,0);
  var U={};['uRes','uCss','uDrift','uT','uStreak','uNm','uValley','uTo','uValA','uCov','uWhite','uWarm','uBase','uPaint','uOut','uHz','uSun','uRead','uReadOn','uAlpha'].forEach(function(n){U[n]=gl.getUniformLocation(p,n);});
  var tex=gl.createTexture();
  return {gl:gl,canvas:canvas,
    valley:function(im){gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,tex);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      try{if(ok(im))gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,im);else gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([0,0,0,255]));}catch(e){console.warn(e);}
      gl.uniform1i(U.uValley,0);},
    draw:function(o,cw,ch){var c=canvas;if(c.width!==cw||c.height!==ch){c.width=cw;c.height=ch;}gl.viewport(0,0,cw,ch);
      gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);if(!(o.alpha>0))return;
      gl.useProgram(p);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,tex);
      gl.uniform2f(U.uRes,cw,ch);gl.uniform2f(U.uCss,o.W,o.H);gl.uniform2f(U.uDrift,o.drift[0],o.drift[1]);gl.uniform1f(U.uT,o.t);gl.uniform1f(U.uStreak,o.streak);
      gl.uniform3fv(U.uNm,o.nm);gl.uniform4fv(U.uTo,o.to);gl.uniform1f(U.uValA,o.valA);gl.uniform1f(U.uCov,o.cov);gl.uniform1f(U.uWhite,o.white);gl.uniform1f(U.uWarm,o.warm);
      gl.uniform2fv(U.uBase,o.base);gl.uniform4fv(U.uPaint,o.paint);gl.uniform2fv(U.uOut,o.out);gl.uniform3fv(U.uHz,o.hz);gl.uniform3fv(U.uSun,o.sun);
      gl.uniform4fv(U.uRead,o.read||[0,0,0,0]);gl.uniform1f(U.uReadOn,o.read?1:0);gl.uniform1f(U.uAlpha,o.alpha);
      gl.drawArrays(gl.TRIANGLES,0,3);}};}
// the same resolution as the romanticism fog (half the CSS pixels per axis, capped), so p = 0 matches it pixel for pixel
function fogSize(W,H){var s=Math.min(0.5,900/W);return[Math.max(2,Math.round(W*s)),Math.max(2,Math.round(H*s))];}
// the romanticism fog's drift (t = its own clock)
function romDrift(t){return[0.022*t,0.004*t+3.1*sm((t-8.0)/4.5)];}

// ================================================================== camera 1: into the Wanderer, off the summit
// every layer is scaled about the focus point FOC (Z = zoom of the whole view × parallax), then shifted up by the fall (nearer = faster)
function romCam(ctx,t){var R=ctx.from?ctx.from.rect:ctx.to.rect,k=R.w/RW,W=ctx.W,H=ctx.H;
  var zg=lerp(1,2.3,eio(seg(t,T.step)))*Math.exp(0.9*ei(seg(t,[3.6,6.4]))),c=1.55*Math.pow(seg(t,T.par),1.5);
  var f0=[R.x+FOC[0]*k,R.y+FOC[1]*k],u=sm(seg(t,[0.6,3.6])),fs=[lerp(f0[0],W*.5,u),lerp(f0[1],H*.46,u)];
  var fall=H*2.3*Math.pow(seg(t,T.fall),2.1),roll=0.035*Math.sin(Math.PI*seg(t,[3.2,6.2]))*sm(seg(t,[3.2,4.4]));
  return{R:R,k:k,zg:zg,c:c,f0:f0,fs:fs,fall:fall,roll:roll};}
function romBox(cam,id){var w=WR[id],b=LYR[id],Z=cam.zg*Math.exp(cam.c*w),kz=cam.k*Z,dy=-cam.fall*w*w*1.1;
  return{x:cam.fs[0]+(b[0]-FOC[0])*kz,y:cam.fs[1]+(b[1]-FOC[1])*kz+dy,w:b[2]*kz,h:b[3]*kz,Z:Z,dy:dy};}

// ================================================================== camera 2: down through the cloud to waist height beside the gleaners
// The camera is (sx, hy, px, kz, st): painting column px sits at screen x sx, the painted horizon (HY) at screen y hy, kz screen px per painting
// px, st = how much higher than the painter's eye the camera is (the ground plane below the horizon is stretched by st about the horizon,
// figures standing on it are carried down with the ground under their feet). Before the pull-back the painting always covers the screen.
function glKeys(ctx){var R=ctx.to.rect,k=R.w/GW,W=ctx.W,H=ctx.H,hyF=R.y+GL.HY*k;
  var kzCov=W/GW*1.02,kzSk=Math.max(kzCov*1.6,W/Math.min(1100,Math.max(600,W*.8)));
  var hS=Math.min(H*.5,hyF+H*.08),kzSt=Math.max(kzCov,(H-hS)/(GL.waist-GL.HY));kzSk=Math.max(kzSk,kzSt*1.35);
  return{R:R,k:k,W:W,H:H,hyF:hyF,kzSk:kzSk,kzSt:kzSt,hS:hS};}
function glCam(ctx,t){var K=ctx.state.K&&ctx.state.K.W===ctx.W&&ctx.state.K.H===ctx.H&&ctx.state.K.R===ctx.to.rect?ctx.state.K:(ctx.state.K=glKeys(ctx));
  var W=K.W,H=K.H,R=K.R;
  // horizon: from below the screen (we look out level as we drop out of the cloud base) up to the middle, then (descending) higher
  var hy=lerp(H*1.35,H*.5,eo(seg(t,T.hyUp)));var dd=eio(seg(t,T.desc));hy=lerp(hy,K.hS,dd);
  // across the far field, then back to the women
  var lkz0=Math.log(K.kzSk),hf=W/2/K.kzSk,pa=Math.max(GL.hay,hf),pb=Math.min(GL.overseer,GW-hf);
  var px=lerp(pa,pb,eio(seg(t,T.skim)));px=lerp(px,Math.max(W/2/K.kzSt,Math.min(GW-W/2/K.kzSt,GL.women)),dd);
  var lkz=lerp(Math.log(K.kzSk*1.12),Math.log(K.kzSk),eo(seg(t,[6.5,11.0])));lkz=lerp(lkz,Math.log(K.kzSt),dd);
  // the stop: a last small settle towards them (the camera comes to rest), then the pull-back onto the wall
  lkz+=0.018*sm(seg(t,[15.6,17.4]));
  var kz=Math.exp(lkz),half=W/2/kz;px=Math.max(half,Math.min(GW-half,px));
  var st=lerp(2.4,1,eio(seg(t,T.hgt))),sx=W/2;
  var u=eio(seg(t,T.pull));
  if(u>0){var kzF=K.k;kz=Math.exp(lerp(Math.log(kz),Math.log(kzF),u));hy=lerp(hy,K.hyF,u);sx=lerp(sx,R.x+R.w/2,u);px=lerp(px,GW/2,u);}
  // the ground plane below the horizon: band edges (painting y) → screen y; local stretch 1 + (st-1)·smooth(depth/360)
  var E=[GL.HY,GL.HY+50,GL.HY+120,GL.HY+210,GL.HY+330,GL.HY+480,GL.HY+680,GL.HY+940,GH],bands=[],yy=hy;
  for(var i=0;i<E.length;i++){var sc=i<E.length-1?kz*(1+(st-1)*sm(((E[i]+E[i+1])/2-GL.HY)/360)):kz;bands.push([E[i],yy,sc]);if(i<E.length-1)yy+=(E[i+1]-E[i])*sc;}
  function gy(y){if(y<=GL.HY)return hy+(y-GL.HY)*kz;for(var j=0;j<bands.length-1;j++)if(y<=bands[j+1][0])return bands[j][1]+(y-bands[j][0])*bands[j][2];return yy;}
  var x0=sx-px*kz,top=hy-GL.HY*kz,bot=yy;
  return{bands:bands,gy:gy,k:K.k,kz:kz,Z:kz/K.k,sx:sx,px:px,hy:hy,st:st,hgt:(st-1)/1.6,box:{x:x0,y:top,w:GW*kz,h:bot-top}};}

// ================================================================== the dust parameters at time t
function dustParams(ctx,t){var S=ctx.state,W=ctx.W,H=ctx.H,tf=ROM_D+(S.tau0||0)+t;
  var o={W:W,H:H,t:tf,drift:romDrift(tf),streak:0,nm:[0,0,1],to:[0,0,1,1],valA:0,cov:0,white:0,warm:0,base:[1e5,60],paint:[-1e4,-1e4,3e4,3e4],out:[0,60],hz:[0,0,100],sun:[0,0,0],read:null,alpha:1};
  var R0=ctx.from?ctx.from.rect:null;
  if(t<T.swap){
    // the Wanderer's fog, carried by the far layer (its valleys), then the cloud we fall into
    if(R0){var cam=romCam(ctx,t),fb=romBox(cam,'far'),sb=romBox(cam,'sky'),kz=fb.Z*cam.k;
      // valley texture spans the whole painting; place it with the far layer's transform
      var tx=cam.fs[0]-FOC[0]*kz,ty=cam.fs[1]-FOC[1]*kz+fb.dy;o.to=[tx,ty,RW*kz,RH*kz];
      // noise space follows the same layer: a point of the fog field stays on the same place of the picture
      o.nm=[cam.f0[0]-cam.fs[0]/fb.Z,cam.f0[1]-(cam.fs[1]+fb.dy)/fb.Z,fb.Z];
      o.valA=REST_VAL+(0.9-REST_VAL)*sm(seg(t,T.fogBase));
      var pb=romBox(cam,'sky');o.paint=[pb.x,pb.y,pb.w,Math.max(pb.h,romBox(cam,'rock').y+romBox(cam,'rock').h-pb.y)];
      o.out=[0.95*sm(seg(t,T.outR)),Math.max(50,Math.min(W,H)*.12)];}
    o.streak=sm(seg(t,T.streak));o.cov=sm(seg(t,T.cov));o.white=sm(seg(t,T.white));o.warm=sm(seg(t,T.warm));
    return o;}
  // below the cloud: the gleaners' field
  var g=glCam(ctx,t),up=(t-T.swap)*26+H*1.4*(1-eo(seg(t,T.base)));
  o.nm=[-(t-T.swap)*9,up*0.6,1.35];o.streak=0.25*(1-sm(seg(t,T.base)));
  o.white=1-sm(seg(t,T.whiteOut));o.warm=sm(seg(t,T.warm));o.cov=1;
  o.base=[lerp(H+260,-420,eo(seg(t,T.base))),Math.max(70,H*.12)];
  var b=g.box,ex=GL.ext*g.kz*(1-sm(seg(t,T.extOut)));o.paint=[b.x,b.y-ex,b.w,b.h+ex];
  o.out=[1-sm(seg(t,T.out)),Math.max(50,Math.min(W,H)*.10)];
  o.hz=[g.hy+H*.02,0.62*sm(seg(t,T.haze))*(1-0.75*sm(seg(t,T.hazeOut)))*(1-sm(seg(t,[17.5,19.8]))),Math.max(40,H*.16*(0.4+0.6*g.Z/3))];
  o.sun=[W*.12,g.hy-H*.55,0.9*sm(seg(t,T.sun))*(1-sm(seg(t,T.sunOut)))];
  o.alpha=1-sm(seg(t,T.dustOff));
  return o;}
function renderDust(ctx,o){var S=ctx.state;if(!S.dust)return;var fs=fogSize(ctx.W,ctx.H);try{S.dust.draw(o,fs[0],fs[1]);}catch(e){console.error(e);}}

// ================================================================== stage: the Wanderer's picture, zoomed and falling
function drawRom(g,ctx,t){var S=ctx.state,cam=romCam(ctx,t),W=ctx.W,H=ctx.H;
  var lay=['sky','far','mid','rock','ext','man'];
  g.save();if(cam.roll){g.translate(W/2,H/2);g.rotate(cam.roll);g.translate(-W/2,-H/2);}
  var pb=romBox(cam,'sky');g.beginPath();g.rect(pb.x,pb.y,pb.w,Math.max(pb.h,H*4));g.clip();
  // the rock's continuation below the frame grows in (the hung Wanderer has none)
  var ea=sm(seg(t,[0.3,1.8]));
  lay.forEach(function(id){var im=S.rom[id];if(!ok(im))return;if(id==='ext'&&ea<=0)return;var b=romBox(cam,id);if(b.y>H+2||b.y+b.h<-2||b.x>W+2||b.x+b.w<-2)return;
    if(id==='ext'&&ea<1){g.globalAlpha=ea;g.drawImage(im,b.x,b.y,b.w,b.h);g.globalAlpha=1;}else g.drawImage(im,b.x,b.y,b.w,b.h);});
  g.restore();return cam;}

// ================================================================== stage: the gleaners, camera descending
function drawGl(g,ctx,t){var S=ctx.state,c=glCam(ctx,t),W=ctx.W,H=ctx.H,kz=c.kz,b=c.box,extA=1-sm(seg(t,T.extOut)),x0=b.x,hy=c.hy,st=c.st;
  function X(x){return x0+x*kz;}
  g.save();g.beginPath();g.rect(b.x,b.y,b.w,b.h);g.clip();
  S.gl.forEach(function(L){if(!ok(L.im))return;var q=L.b,x=X(q[0]),w=q[2]*kz;if(x>W+2||x+w<-2)return;
    if(L.kind==='sky'){var y=hy+(q[1]-GL.HY)*kz;g.drawImage(L.im,x,y,w,q[3]*kz);}
    else if(L.kind==='upright'){var y2=c.gy(L.foot)+(q[1]-L.foot)*kz;if(y2>H+2)return;g.drawImage(L.im,x,y2,w,q[3]*kz);}
    else{ // ground: above the horizon as painted, below it stretched by st about the horizon
      var ya=hy+(q[1]-GL.HY)*kz,hA=(GL.HY-q[1])*kz;
      if(hA>0&&ya<H&&hy>-2){g.save();g.beginPath();g.rect(b.x,b.y,b.w,Math.max(0,hy-b.y)+.5);g.clip();g.drawImage(L.im,x,ya,w,q[3]*kz);g.restore();}
      // below the horizon: piecewise bands, stretched more the nearer they are (the far field with its small figures hardly at all)
      var sy=q[3]/L.ih,B=c.bands;g.save();g.beginPath();g.rect(b.x,hy,b.w,b.y+b.h-hy);g.clip();
      for(var i=0;i<B.length-1;i++){var p0=Math.max(B[i][0],q[1]),p1=Math.min(B[i+1][0],q[1]+q[3]);if(p1<=p0)continue;
        var d0=B[i][1]+(p0-B[i][0])*B[i][2],d1=B[i][1]+(p1-B[i][0])*B[i][2];if(d0>H)break;if(d1<-2)continue;
        g.drawImage(L.im,0,(p0-q[1])/sy,L.iw,(p1-p0)/sy,x,d0,w,d1-d0+(i<B.length-2?.6:0));}
      g.restore();}});
  g.restore();
  // the sky above the painting's top edge while the camera is high (cut/sky_ext.webp), fading as the picture comes back to its frame
  var E=S.glExt;if(extA>0.002&&E&&ok(E.im)&&b.y>-2){var top=b.y-GL.ext*kz;g.save();g.globalAlpha=extA;g.beginPath();g.rect(b.x,top,b.w,b.y-top+E.ov*kz);g.clip();
    g.drawImage(E.im,X(0),top,GW*kz,(GL.ext+E.ov)*kz);g.restore();}
  return c;}

// ================================================================== floor layer (transition)
function floorLayer(ctx){var S=ctx.state;if(!S.floorC){S.floorC=ctx.layer('floor',{z:4});floorEl=S.floorC;}return S.floorC;}
function drawFloorLayer(ctx,y,a,cut,read){var c=floorLayer(ctx),g=c.__g,dpr=ctx.dpr||1;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,c.width,c.height);
  if(a<=0.001)return;g.setTransform(dpr,0,0,dpr,0,0);floorPaint(g,{W:ctx.W,H:ctx.H,y:y,alpha:a,ink:ctx.to.ink,cut:cut,read:read});}

// ================================================================== caches
function ensure(ctx){var S=ctx.state,dpr=ctx.dpr||1,to=ctx.to.rect,fr=ctx.from?ctx.from.rect:null,key=[ctx.W,ctx.H,dpr,to.x,to.y,to.w,to.h,fr?[fr.x,fr.y,fr.w,fr.h].join():''].join('/');
  if(S.C&&S.C.key===key)return S.C;var C={key:key};
  C.art=artCanvas(ctx.to.image,to,dpr);C.shTo=shadowCache(dpr,to);
  if(ctx.from){C.fromArt=artCanvas(ctx.from.image,fr,dpr);C.shFr=ctx.from.frame==='none'?shadowCache(dpr,fr):null;}
  S.C=C;return C;}

// ================================================================== the module
var MOD={
  duration:D,
  assets:GL.layers.map(function(L){return L.file;}),
  fromAssets:['cut/sky.webp','cut/far.webp','cut/mid.webp','cut/rock.webp','cut/wanderer.webp','cut/rock_ext.webp','t_valley.webp'],
  init:function(ctx){var S=ctx.state;myIdx=ctx.to.idx;
    S.rom={sky:ctx.fromAsset('cut/sky.webp'),far:ctx.fromAsset('cut/far.webp'),mid:ctx.fromAsset('cut/mid.webp'),rock:ctx.fromAsset('cut/rock.webp'),man:ctx.fromAsset('cut/wanderer.webp'),ext:ctx.fromAsset('cut/rock_ext.webp')};
    // the rock's continuation below the frame dissolves downward (as in the romanticism module)
    var ex=S.rom.ext;if(ok(ex)){var ec=cv(ex.naturalWidth,ex.naturalHeight),eg=ec.getContext('2d');eg.drawImage(ex,0,0);eg.globalCompositeOperation='destination-in';
      var gy=eg.createLinearGradient(0,0,0,ec.height);gy.addColorStop(0,'#000');gy.addColorStop(0.45,'#000');gy.addColorStop(1,'rgba(0,0,0,0)');eg.fillStyle=gy;eg.fillRect(0,0,ec.width,ec.height);S.rom.ext=ec;}
    S.gl=GL.layers.filter(function(L){return L.kind!=='ext';}).map(function(L){var im=ctx.asset(L.file),bb=L.b.slice();if(ok(im))bb[3]=bb[2]*im.naturalHeight/im.naturalWidth;return{id:L.id,kind:L.kind,b:bb,foot:L.foot||GL.HY,im:im,iw:ok(im)?im.naturalWidth:1,ih:ok(im)?im.naturalHeight:1};});
    // without the cut (not delivered yet): the whole picture as one plate
    if(!S.gl.some(function(L){return ok(L.im)&&L.kind!=='sky';})){var im=ctx.to.image;S.gl=[{id:'main',kind:'ground',b:[0,0,GW,GH],foot:GL.HY,im:im,iw:ok(im)?im.naturalWidth:1,ih:ok(im)?im.naturalHeight:1}];}
    var ex=GL.layers.filter(function(L){return L.kind==='ext';})[0];S.glExt=ex?{im:ctx.asset(ex.file),ov:ex.ov||0}:null;if(S.glExt&&!ok(S.glExt.im))S.glExt=null;
    S.dustC=ctx.layer('dust',{z:8,type:'webgl'});dustEl=S.dustC;
    if(!S.dustC.__dust){S.dustC.__dust=Dust(S.dustC);if(S.dustC.__dust)S.dustC.__dust.valley(ctx.fromAsset('t_valley.webp'));}
    S.dust=S.dustC.__dust;if(S.dust){var fs=fogSize(ctx.W,ctx.H);S.dust.draw({alpha:0},fs[0],fs[1]);}
    floorLayer(ctx);ensure(ctx);prewarm(ctx);},
  draw:function(p,ctx){var g=ctx.g,S=ctx.state,W=ctx.W,H=ctx.H,t=p*D,to=ctx.to.rect,F=ctx.from,C=ensure(ctx);myIdx=ctx.to.idx;
    if(ctx.lastP==null){S.tau0=romTau();
      // take the Wanderer's resting fog over: from now on this room's layer draws it (the same field)
      var rf=ctx.fromLayer&&ctx.fromLayer('fog');if(rf&&rf.__fog&&S.dust){try{var fz=fogSize(W,H);rf.__fog.draw({alpha:0},fz[0],fz[1]);}catch(e){}}}
    dom(ctx,t);
    var toWall=rgb(ctx.to.wall),fromWall=F?rgb(F.wall):toWall;
    if(p>=1){g.fillStyle=ctx.to.wall;g.fillRect(0,0,W,H);wash(g,W,H,to,ctx.to.ink,1);if(ctx.to.frame==='none')drawShadow(g,C.shTo,1);g.drawImage(C.art,to.x,to.y,to.w,to.h);
      drawFloorLayer(ctx,floorY(to),1,to,null);renderDust(ctx,{alpha:0});return;}
    if(t<T.swap){
      // ---------------- the Wanderer's room: wall, then the picture fills the view; fog colour behind everything once we are inside it
      var fg=sm(seg(t,T.fogBase));g.fillStyle=css(mixa(fromWall,[214,217,224],fg));g.fillRect(0,0,W,H);
      if(F){var fx=1-sm(seg(t,T.fromFx));if(fx>0){wash(g,W,H,F.rect,F.ink,fx);}
        var cam=romCam(ctx,t);
        if(t<=T.step[0]){if(C.shFr)drawShadow(g,C.shFr,1);g.drawImage(C.fromArt,F.rect.x,F.rect.y,F.rect.w,F.rect.h);}
        else{var sb=romBox(cam,'sky');if(C.shFr&&fx>0)drawShadow(g,C.shFr,fx,sb);drawRom(g,ctx,t);
          var xf=1-sm(seg(t,T.xfade));if(xf>0){g.save();g.globalAlpha=xf;g.drawImage(C.fromArt,sb.x,sb.y,sb.w,sb.h);g.restore();}}}
      drawFloorLayer(ctx,0,0);
    }else{
      // ---------------- the gleaners' room: wall, the picture (camera descending), the frame's shadow; the floor on its layer
      g.fillStyle=ctx.to.wall;g.fillRect(0,0,W,H);var ws=sm(seg(t,T.shadow));wash(g,W,H,to,ctx.to.ink,ws);
      var c=glCam(ctx,t);if(ctx.to.frame==='none')drawShadow(g,C.shTo,ws,c.box);
      drawGl(g,ctx,t);
      var fa=sm(seg(t,T.fin));if(fa>0){g.save();g.globalAlpha=fa;g.drawImage(C.art,c.box.x,c.box.y,c.box.w,c.box.h);g.restore();}
      var ex=GL.ext*c.kz*(1-sm(seg(t,T.extOut)));
      drawFloorLayer(ctx,c.hy,sm(seg(t,T.floor)),{x:c.box.x,y:c.box.y-ex,w:c.box.w,h:c.box.h+ex},null);}
    renderDust(ctx,dustParams(ctx,t));
  },
  done:function(ctx){ctx.state.restKey=null;},
  rest:function(ctx){var S=ctx.state;myIdx=ctx.to.idx;
    if(S.dust&&!S.dustClear){var fs=fogSize(ctx.W,ctx.H);S.dust.draw({alpha:0},fs[0],fs[1]);S.dustClear=true;}
    var r=ctx.to.rect,R=ctx.reading?ctx.readRect:null,c=floorLayer(ctx);
    var key=[ctx.W,ctx.H,c.width,Math.round(r.x*4),Math.round(r.y*4),Math.round(r.w*4),Math.round(r.h*4),R?[R.x,R.y,R.w,R.h].map(Math.round).join():'',ctx.to.ink].join('/');
    if(S.restKey!==key){S.restKey=key;drawFloorLayer(ctx,floorY(r),1,r,R);}
    flat(true);watch();}
};
// DOM: the new room's wall/ink behind the stage once we are in the cloud, the title early, the label lying flat on the floor
function dom(ctx,t){var S=ctx.state;S.dustClear=false;
  var here=t>=T.swap;if(S.domHere!==here){S.domHere=here;if(here){ctx.ui.wall(ctx.to.wall);ctx.ui.ink(ctx.to.ink);}else if(ctx.from){ctx.ui.wall(ctx.from.wall);ctx.ui.ink(ctx.from.ink);}}
  ctx.ui.title(ctx.to.idx,t>=T.title);var lab=t>=T.label[0];ctx.ui.label(ctx.to.idx,lab);if(lab){placeLabel(ctx);flat(true);}}
// every heavy draw path once on a scratch canvas (texture uploads, mip levels), one per task
function prewarm(ctx){var S=ctx.state,dpr=ctx.dpr||1,c=cv(ctx.W*dpr,ctx.H*dpr),q=c.getContext('2d'),P=[.02,.1,.18,.24,.3,.4,.5,.6,.7,.8,.9,.97];
  var w=Object.assign({},ctx,{g:q,lastP:0,ui:{wall:function(){},ink:function(){},title:function(){},label:function(){},chrome:function(){},deco:function(){}},layer:function(){return S.floorC||cv(2,2);}});
  (function step(){if(!P.length)return;var p=P.shift();try{q.setTransform(dpr,0,0,dpr,0,0);var t=p*D;if(t<T.swap)drawRom(q,w,Math.max(t,T.step[0]+.1));else drawGl(q,w,t);}catch(e){}setTimeout(step,16);})();}
EH.transition('realism',MOD);
})();

;
/* 印象派 · 最后一笔是太阳 — the passage from Millet's Gleaners (realism) into Monet's Impression, Sunrise.
   Beats (seconds of D, see T): the realism room goes dark, one spotlight stays on the Gleaners (the frame glides to the new size) ·
   the picture is repainted stroke by stroke in Monet's strokes (Hertzmann-style layered strokes, coarse → fine, painted with the
   target's real pixels; ported from ../gallery2.template.html + ../worker.part.js, run in a Web Worker in init): grey-blue water rises
   from the bottom and mist comes down from the top and drown the brown earth; the three gleaners are left standing in it · they darken
   into contre-jour silhouettes, lift off and glide/shrink into the harbour's small dark boats (left woman → far boat, middle → middle
   boat, the standing woman → the rower's boat), the water closes over the places they stood · a held breath: the harbour complete, no
   sun · the LAST stroke: the orange sun, one loaded round stroke, then its short reflections dab by dab down the water · the picture
   settles and slowly drains to black-and-white — the sun (same lightness as the sky, L* 47.1 vs 47.3 measured on main.webp) vanishes ·
   the sun jumps back in colour a beat before the rest of the colour returns · morning light spills out of the sun over the dark room,
   tinting walls, label and title grey-blue and orange; the wall comes up to the room's colour · "印象" lifts off the label and floats
   up into the vertical title 印象派 · hand-over. Rest: a faint morning glow on the wall round the picture (never on the work/panel).
   Pure function of p: the stroke list carries one timestamp per stroke; draw() paints strokes 0..N(p) incrementally on a paint canvas
   and redraws from the base when seeking backwards.
   Assets (rooms/impressionism/): t_clean.webp (main.webp with sun, reflections and boats inpainted — what the "sunless" strokes paint),
   t_grey.webp (L*-matched greyscale of main.webp), t_masks.png (R sun disc, G reflections, B boats 255/170/85, main.webp px),
   t_women.png (R/G/B = the three gleaners, rooms/realism/main.webp px), t_sunalpha.png (alpha = max(R,G) of t_masks, blurred 2 px).
   Init decodes the images into ImageBitmaps one per task (no long freeze during the realism rest); the stroke list is cached per page. */
(function(){
'use strict';
var D=24, PW=2400, PH=1862, GW=2400, GH=1796, CW=1000;
var T={fromDom:[0.2,1.9], dim:[0.3,2.6], geo:[0.6,2.6],
  L:[[2.6,5.6],[4.3,7.6],[6.4,9.8],[8.4,11.4]],
  sil:[10.4,11.5], fly:[[11.5,13.0],[11.95,13.45],[12.4,13.9]],
  sunIn:[14.5,15.45], refl:[15.15,16.4], halo:[14.6,16.6], settle:[15.9,16.9],
  grey:[16.9,19.0], jump:[19.5,19.66], colour:[19.66,20.5],
  bloom:[19.5,21.8], spill:[19.8,22.4], wall:[20.3,23.3], spot:[20.6,23.3], tintIn:[20.2,21.4], tintOut:[22.3,23.6],
  label:20.7, ink:21.8, lift:[21.3,21.8], word:[21.6,23.1], pai:[22.7,23.2], title:[23.0,23.5], wordOut:[23.1,23.55]};
// main.webp px (impressionism): the sun, the boats (body + rower), the reflection column
var SUN=[1460,576,40], REFL=[1340,960,1605,1800], BOATS=[[330,1010,530,1095],[585,1105,825,1225],[1030,1215,1265,1410]];
// rooms/realism/main.webp px: the three gleaners (t_women.png channel boxes); woman i → BOATS[i]
var WOM=[[418,694,1030,1300],[864,740,1500,1429],[1470,564,2090,1570]];
var NIGHT=[14,12,11], SIL='36,50,52';
var SH=window.EH_SHARED=window.EH_SHARED||{};

function cl(x){return x<0?0:x>1?1:x;}
function seg(t,a){return cl((t-a[0])/(a[1]-a[0]));}
function lerp(a,b,u){return a+(b-a)*u;}
function sm(x){x=cl(x);return x*x*(3-2*x);}
function eo(x){x=cl(x);return 1-Math.pow(1-x,3);}
function eio(x){x=cl(x);return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;}
function hex(c){var m=String(c||'').trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);if(!m)return[40,38,36];var h=m[1];if(h.length===3)h=h.replace(/./g,'$&$&');var n=parseInt(h,16);return[(n>>16)&255,(n>>8)&255,n&255];}
function mixc(a,b,u){return 'rgb('+[0,1,2].map(function(i){return Math.round(lerp(a[i],b[i],u));}).join(',')+')';}
function cv(w,h){var c=document.createElement('canvas');c.width=Math.max(1,Math.round(w));c.height=Math.max(1,Math.round(h));return c;}
function ok(im){return im&&(im.naturalWidth||im.width)>0;}
// inverse smoothstep: stroke rank q ∈ [0,1] → time fraction, so the stroke count per layer eases in and out
function invSm(q){q=cl(q);return .5-Math.sin(Math.asin(1-2*q)/3);}

// ---------------------------------------------------------------- room furniture helpers (same as the core's DOM: wash, frame shadow, art canvas)
function wash(g,W,H,r,light,a){if(a<=0)return;g.save();g.translate(r.x+r.w/2,r.y+r.h/2);g.scale(.7*W,.6*H);
  var gr=g.createRadialGradient(0,0,0,0,0,1);gr.addColorStop(0,light?'rgba(255,255,255,.35)':'rgba(255,244,225,.08)');gr.addColorStop(.7,light?'rgba(255,255,255,0)':'rgba(255,244,225,0)');
  g.globalAlpha=a;g.fillStyle=gr;g.fillRect(-2,-2,4,4);g.restore();}
function shadowCache(dpr,r){var oy=26,blur=60,spread=-26,M=Math.ceil(1.6*blur+oy+4),X0=r.x-spread-M,Y0=r.y-spread-M,X1=r.x+r.w+spread+M,Y1=r.y+r.h+spread+M;
  var dx=Math.floor(X0*dpr),dy=Math.floor(Y0*dpr),c=cv(Math.ceil(X1*dpr)-dx,Math.ceil(Y1*dpr)-dy),q=c.getContext('2d');q.setTransform(dpr,0,0,dpr,-dx,-dy);
  q.shadowColor='#000';q.shadowBlur=blur*dpr;q.shadowOffsetX=1e5*dpr;q.shadowOffsetY=oy*dpr;q.fillStyle='#000';q.fillRect(r.x-spread-1e5,r.y-spread,r.w+2*spread,r.h+2*spread);
  return{c:c,x:dx/dpr,y:dy/dpr,w:c.width/dpr,h:c.height/dpr};}
function drawShadow(g,sh,a){if(!sh||a<=0)return;g.save();g.globalAlpha=a;g.drawImage(sh.c,sh.x,sh.y,sh.w,sh.h);g.restore();}
function artCanvas(im,r,dpr,src){var w=Math.min(Math.round(r.w*dpr),2600),h=Math.round(w*(im.naturalHeight||1)/(im.naturalWidth||1)),c=cv(w,h);if(ok(im))c.getContext('2d').drawImage(src||im,0,0,w,h);return c;}
// the decoded bitmap of an image when init made one (drawImage from an <img> decodes it synchronously on the main thread: ~180 ms per 2400 px webp)
function B(S,im){var b=S.bm&&im&&S.bm.get(im);return b||im;}
// the Gleaners cropped to Impression's proportions (cover), as a source rect in Gleaners px
function coverCrop(at){var ag=GW/GH;if(ag>at){var w=GH*at;return[(GW-w)/2,0,w,GH];}var h=GW/at;return[0,(GH-h)/2,GW,h];}

// ---------------------------------------------------------------- the morning glow (rest extra; also the end state of the light spill)
function sunAt(r){return[r.x+SUN[0]/PW*r.w,r.y+SUN[1]/PH*r.h];}
function glow(g,W,H,r,a,R){if(a<=0.001)return;var s=sunAt(r);R=R||Math.max(W,H)*.95;g.save();g.beginPath();g.rect(0,0,W,H);g.rect(r.x,r.y,r.w,r.h);g.clip('evenodd');
  var gr=g.createRadialGradient(s[0],s[1],0,s[0],s[1],R);gr.addColorStop(0,'rgba(255,164,96,'+(.30*a).toFixed(4)+')');gr.addColorStop(.22,'rgba(236,150,104,'+(.17*a).toFixed(4)+')');
  gr.addColorStop(.5,'rgba(130,156,176,'+(.10*a).toFixed(4)+')');gr.addColorStop(1,'rgba(110,140,160,0)');g.fillStyle=gr;g.fillRect(0,0,W,H);g.restore();}
var REST_A=.42;
function restA(el){return REST_A*(1-.12*(1-Math.cos(2*Math.PI*(el||0)/9))/2);}
SH.impressionismRest=function(g,o){glow(g,o.W,o.H,o.rect,restA(o.t||0));};

// ---------------------------------------------------------------- the stroke engine (Web Worker; ported from ../worker.part.js)
// Two runs: A on t_clean (the whole harbour without sun and boats), B on main.webp but only where the boats are (mask). Every stroke
// gets a class k: 0 normal · 1..3 inside gleaner k-1 (deferred to her beat) · 4..6 boat k-4 (run B).
var WORKER=function(){
  onmessage=function(ev){
    var d=ev.data,W=d.W,H=d.H,N=W*H,seed=d.seed>>>0,WM=d.women,BM=d.boats;
    function rnd(){seed=(seed+0x6D2B79F5)|0;var t=Math.imul(seed^(seed>>>15),1|seed);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;}
    function rgb2hsl(r,g,b){var mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2,h=0,s=0;if(mx!==mn){var dd=mx-mn;s=l>.5?dd/(2-mx-mn):dd/(mx+mn);
      h=mx===r?(g-b)/dd+(g<b?6:0):mx===g?(b-r)/dd+2:(r-g)/dd+4;h/=6;}return[h,s,l];}
    function h2r(p,q,t){if(t<0)t+=1;if(t>1)t-=1;return t<1/6?p+(q-p)*6*t:t<1/2?q:t<2/3?p+(q-p)*(2/3-t)*6:p;}
    function hsl2rgb(h,s,l){if(s<=0)return[l,l,l];var q=l<.5?l*(1+s):l+s-l*s,p=2*l-q;return[h2r(p,q,h+1/3),h2r(p,q,h),h2r(p,q,h-1/3)];}
    function blur(A,r){r=Math.max(1,Math.round(r));var B=new Float32Array(A.length),C=new Float32Array(A.length);
      function pass(S,D,horiz){var n=horiz?W:H,m=horiz?H:W;for(var j=0;j<m;j++){for(var ch=0;ch<3;ch++){var acc=0,cnt=0;
        for(var k=-r;k<=r;k++){var kk=Math.min(Math.max(k,0),n-1);acc+=S[(horiz?(j*W+kk):(kk*W+j))*3+ch];cnt++;}
        for(var x=0;x<n;x++){D[(horiz?(j*W+x):(x*W+j))*3+ch]=acc/cnt;var a=Math.min(x+r+1,n-1),b=Math.max(x-r,0);acc+=S[(horiz?(j*W+a):(a*W+j))*3+ch]-S[(horiz?(j*W+b):(b*W+j))*3+ch];}}}}
      pass(A,B,true);pass(B,C,false);pass(C,B,true);pass(B,C,false);return C;}
    var RAD=[.022,.012,.0085,.0062].map(function(f){return Math.max(2,f*W);}),MAXL=[3,3,3,3],SKIP=[0,0,.45,0],DENS=[.85,.85,.85,.95];
    function run(src,only){var T=new Float32Array(N*3);for(var i=0;i<N;i++){var o=i*4;T[i*3]=src[o]/255;T[i*3+1]=src[o+1]/255;T[i*3+2]=src[o+2]/255;}
      function at(A,x,y,ch){x=Math.min(Math.max(x|0,0),W-1);y=Math.min(Math.max(y|0,0),H-1);return A[(y*W+x)*3+ch];}
      function lum(A,x,y){return .299*at(A,x,y,0)+.587*at(A,x,y,1)+.114*at(A,x,y,2);}
      var out=[];
      for(var L=only?1:0;L<RAD.length;L++){
        var R=RAD[L],Bm=blur(T,R*.5),g=Math.max(2,R*DENS[L]);
        for(var gy=g/2;gy<H;gy+=g)for(var gx=g/2;gx<W;gx+=g){
          if(SKIP[L]&&rnd()<SKIP[L])continue;
          var px=gx+(rnd()-.5)*g,py=gy+(rnd()-.5)*g,ix=Math.min(W-1,Math.max(0,px|0)),iy=Math.min(H-1,Math.max(0,py|0)),pi=iy*W+ix,k=0;
          if(only){var b=BM[pi];if(!b)continue;k=b>200?6:b>120?5:4;}
          else{var w0=WM[pi*4],w1=WM[pi*4+1],w2=WM[pi*4+2],wm=Math.max(w0,w1,w2);if(wm>90)k=wm===w2?3:wm===w1?2:1;}
          var cr=at(Bm,px,py,0),cg=at(Bm,px,py,1),cb=at(Bm,px,py,2),hs=rgb2hsl(cr,cg,cb);
          var comp=L>=2&&rnd()<.02,brk=L>=1&&rnd()<.2,hh=hs[0]+(rnd()-.5)*(brk?.1:.035)+(comp?.5:0),ss=Math.min(1,hs[1]*(.95+rnd()*.3)*(comp?.75:1)+(brk?.08:0)),ll=Math.min(.97,Math.max(.03,hs[2]+(rnd()-.5)*(brk?.1:.045)+(comp?.04:0)));
          var col=hsl2rgb((hh%1+1)%1,ss,ll),pts=[px,py],x=px,y=py,lx=0,ly=0;
          for(var s=1;s<MAXL[L];s++){
            var h2=Math.max(1,R*.5),gxv=lum(Bm,x+h2,y)-lum(Bm,x-h2,y),gyv=lum(Bm,x,y+h2)-lum(Bm,x,y-h2),mg=Math.hypot(gxv,gyv),dx,dy;
            if(mg<1e-4){if(!lx&&!ly){var an=rnd()*6.2832;dx=Math.cos(an);dy=Math.sin(an);}else{dx=lx;dy=ly;}}else{dx=-gyv/mg;dy=gxv/mg;}
            if(lx*dx+ly*dy<0){dx=-dx;dy=-dy;}
            if(s>1){dx=.3*dx+.7*lx;dy=.3*dy+.7*ly;var nn=Math.hypot(dx,dy)||1;dx/=nn;dy/=nn;}
            x+=R*.95*dx;y+=R*.95*dy;if(x<0||y<0||x>=W||y>=H)break;
            var dc=Math.abs(at(Bm,x,y,0)-cr)+Math.abs(at(Bm,x,y,1)-cg)+Math.abs(at(Bm,x,y,2)-cb);if(s>=2&&dc>.32)break;
            pts.push(x,y);lx=dx;ly=dy;}
          out.push({L:L,k:k,r:rnd(),w:R*(comp?.6:1)*(.85+rnd()*.3),c:[Math.round(col[0]*255),Math.round(col[1]*255),Math.round(col[2]*255)],a:comp?.7:.9,p:pts});
        }}
      return out;}
    var A=run(d.clean,false),B=run(d.real,true);
    postMessage({done:true,strokes:A.concat(B)});
  };
};

// timestamps: the order IS the choreography (layers overlap; inside a layer the tide comes from the top and bottom edges towards the
// horizon; gleaner k's strokes land while she lifts off; boat k's strokes land as her silhouette arrives)
function schedule(list,ch){var byL=[[],[],[],[]],wom=[[],[],[]],boat=[[],[],[]],SPAT=[.72,.5,.28,.15];
  list.forEach(function(s){if(s.k>=4)boat[s.k-4].push(s);else if(s.k>=1)wom[s.k-1].push(s);else byL[s.L].push(s);});
  byL.forEach(function(A,L){A.forEach(function(s){var v=s.p[1]/ch,d=Math.abs(v-.47)/.53;s.key=SPAT[L]*d*-1+(1-SPAT[L])*s.r;});
    A.sort(function(a,b){return a.key-b.key;});var n=A.length,w=T.L[L];A.forEach(function(s,i){s.t=lerp(w[0],w[1],invSm((i+.5)/n));});});
  wom.forEach(function(A,k){var f=T.fly[k];A.sort(function(a,b){return a.L-b.L||a.r-b.r;});var n=A.length;A.forEach(function(s,i){s.t=lerp(f[0]-.15,f[0]+.95,invSm((i+.5)/n));});});
  boat.forEach(function(A,k){var f=T.fly[k];A.sort(function(a,b){return a.L-b.L||a.r-b.r;});var n=A.length;A.forEach(function(s,i){s.t=lerp(f[1]-.4,f[1]+.45,invSm((i+.5)/n));});});
  var all=list.slice().sort(function(a,b){return a.t-b.t;}),ts=new Float32Array(all.length);all.forEach(function(s,i){ts[i]=s.t;});return{s:all,ts:ts};}
function countAt(ts,t){var lo=0,hi=ts.length;while(lo<hi){var m=(lo+hi)>>1;if(ts[m]<=t)lo=m+1;else hi=m;}return lo;}

// the stroke list depends only on the images: computed once per page, reused by every later init (re-entering the room, replays)
var STROKES=null;
function startWorker(ctx,S){if(S.job)return;if(STROKES){S.strokes=STROKES.s;S.ts=STROKES.ts;S.ready=true;S.drawn=-1;S.job='done';return;}var ch=Math.round(CW*PH/PW);
  var c=cv(CW,ch),q=c.getContext('2d',{willReadFrequently:true});
  function px(im){q.clearRect(0,0,CW,ch);if(ok(im))q.drawImage(B(S,im),0,0,CW,ch);return q.getImageData(0,0,CW,ch).data;}
  var clean=px(S.clean),real=px(ctx.to.image),mk=px(S.masks),boats=new Uint8Array(CW*ch);for(var i=0;i<boats.length;i++)boats[i]=mk[i*4+2];
  // the gleaners, mapped into Impression's frame the way the base is cropped
  var cr=coverCrop(PW/PH);q.clearRect(0,0,CW,ch);if(ok(S.women))q.drawImage(B(S,S.women),cr[0],cr[1],cr[2],cr[3],0,0,CW,ch);var women=q.getImageData(0,0,CW,ch).data;
  S.job='run';
  try{var blob=new Blob(['('+WORKER.toString()+')()'],{type:'text/javascript'}),w=new Worker(URL.createObjectURL(blob));
    w.onmessage=function(e){if(!e.data.done)return;var list=e.data.strokes;
      list.forEach(function(s){s.w/=CW;for(var i=0;i<s.p.length;i++)s.p[i]/=CW;var c=s.c;
        s.c0='rgb('+c[0]+','+c[1]+','+c[2]+')';s.c1='rgb('+Math.min(255,c[0]+10)+','+Math.min(255,c[1]+10)+','+Math.min(255,c[2]+10)+')';s.c2='rgb('+Math.max(0,c[0]-11)+','+Math.max(0,c[1]-11)+','+Math.max(0,c[2]-11)+')';});
      var sc=schedule(list,ch/CW);STROKES=sc;S.strokes=sc.s;S.ts=sc.ts;S.ready=true;S.drawn=-1;w.terminate();window.__impReady=true;};
    w.postMessage({W:CW,H:ch,clean:clean,real:real,women:women,boats:boats,seed:20251},[clean.buffer,real.buffer,women.buffer,boats.buffer]);
  }catch(e){console.warn('impressionism: worker failed',e);S.job='fail';}}

function pathOf(c,p,S,ox,oy){c.beginPath();c.moveTo(p[0]*S+ox,p[1]*S+oy);if(p.length===2){c.lineTo(p[0]*S+ox+.01,p[1]*S+oy);return;}
  for(var i=2;i<p.length-2;i+=2){var mx=(p[i]+p[i+2])/2*S,my=(p[i+1]+p[i+3])/2*S;c.quadraticCurveTo(p[i]*S+ox,p[i+1]*S+oy,mx+ox,my+oy);}
  c.lineTo(p[p.length-2]*S+ox,p[p.length-1]*S+oy);}
function drawStroke(c,s,S,pA,pB){var p=s.p,w=s.w*S;
  if(s.L>=2){c.globalAlpha=1;c.strokeStyle=s.k>=4?pB:pA;c.lineWidth=w*1.25;pathOf(c,p,S,0,0);c.stroke();return;}
  var nx=.7,ny=.7;if(p.length>=4){var dx=p[2]-p[0],dy=p[3]-p[1],n=Math.hypot(dx,dy)||1;nx=-dy/n;ny=dx/n;}
  c.globalAlpha=s.a;c.strokeStyle=s.c0;c.lineWidth=w;pathOf(c,p,S,0,0);c.stroke();
  c.globalAlpha=s.a*.42;c.lineWidth=w*.26;c.strokeStyle=s.c1;pathOf(c,p,S,nx*w*.28,ny*w*.28);c.stroke();
  c.strokeStyle=s.c2;pathOf(c,p,S,-nx*w*.3,-ny*w*.3);c.stroke();c.globalAlpha=1;}
// bring the paint canvas to exactly strokes 0..n (forward: incremental; backward: from the base)
// Seeking backwards restores the nearest checkpoint (a copy of the paint canvas taken when forward painting crossed it) and paints on
// from there, so a scrub back never repaints all ~40k strokes in one frame.
var NCP=12;
function paintTo(C,S,n){var q=C.pq,Wc=C.paint.width,N=S.strokes.length,step=Math.ceil(N/NCP);
  if(C.pkey!==S.pkeyDrawn){C.cp=[];S.drawn=-1;S.pkeyDrawn=C.pkey;}
  if(S.drawn==null||S.drawn<0||n<S.drawn){var k=Math.min(NCP-1,Math.floor(n/step));while(k>0&&!C.cp[k])k--;q.setTransform(1,0,0,1,0,0);q.globalAlpha=1;q.globalCompositeOperation='copy';
    if(k>0){q.drawImage(C.cp[k],0,0);S.drawn=k*step;}else{q.drawImage(C.base,0,0);S.drawn=0;}q.globalCompositeOperation='source-over';}
  if(n>S.drawn){q.lineCap='round';q.lineJoin='round';
    for(var i=S.drawn;i<n;i++){drawStroke(q,S.strokes[i],Wc,C.patA,C.patB);var j=i+1;if(j%step===0&&j/step<NCP&&!C.cp[j/step]){q.globalAlpha=1;var c=cv(C.paint.width,C.paint.height);c.getContext('2d').drawImage(C.paint,0,0);C.cp[j/step]=c;}}
    S.drawn=n;q.globalAlpha=1;}}

// ---------------------------------------------------------------- caches (init; rebuilt only if the size changes)
function ensure(ctx,S){var W=ctx.W,H=ctx.H,dpr=ctx.dpr||1,to=ctx.to.rect,fr=ctx.from?ctx.from.rect:null,k=[W,H,dpr,to.x,to.y,to.w,to.h,fr?[fr.x,fr.y,fr.w,fr.h].join(','):''].join('/');
  if(S.C&&S.C.key===k)return S.C;var C={key:k};
  C.art=artCanvas(ctx.to.image,to,dpr,B(S,ctx.to.image));var aw=C.art.width,ah=C.art.height;C.shTo=shadowCache(dpr,to);
  if(ctx.from){C.fromArt=artCanvas(ctx.from.image,fr,dpr,B(S,ctx.from.image));C.shFr=shadowCache(dpr,fr);}
  // paint canvas (≤ 2000 px), its base (the Gleaners cropped to Impression) and the two stroke patterns (clean plate / real picture)
  var pw=Math.min(aw,2000),ph=Math.round(pw*PH/PW);C.paint=cv(pw,ph);C.pq=C.paint.getContext('2d');C.base=cv(pw,ph);var cr=coverCrop(PW/PH);
  // the whole Gleaners pre-scaled so that its Impression-shaped crop is exactly the paint canvas: the gliding frame (geo beat) and the base
  // the strokes paint over are the same pixels, so the hand-over from gliding to painting is seamless
  var fw=Math.round(pw*GW/cr[2]),fh=Math.round(fw*GH/GW);C.fromFull=cv(fw,fh);C.kf=fw/GW;
  if(ctx.from&&ok(ctx.from.image)){var ff=C.fromFull.getContext('2d');ff.imageSmoothingQuality='high';ff.drawImage(B(S,ctx.from.image),0,0,fw,fh);}
  C.base.getContext('2d').drawImage(C.fromFull,cr[0]*C.kf,cr[1]*C.kf,cr[2]*C.kf,cr[3]*C.kf,0,0,pw,ph);
  var pc=cv(pw,ph);if(ok(S.clean))pc.getContext('2d').drawImage(B(S,S.clean),0,0,pw,ph);C.patA=C.pq.createPattern(pc,'no-repeat');
  var pr=cv(pw,ph);pr.getContext('2d').drawImage(B(S,ctx.to.image),0,0,pw,ph);C.patB=C.pq.createPattern(pr,'no-repeat');C.real=pr;C.pkey=k;
  // grey: whole, with the sun+reflections cut out, and the sun+reflections alone (so the sun can come back first)
  C.grey=cv(aw,ah);if(ok(S.grey))C.grey.getContext('2d').drawImage(B(S,S.grey),0,0,aw,ah);
  // sun + reflections as alpha: t_sunalpha.png = max(R, G) of t_masks, Gaussian-blurred 2 px (baked offline: no pixel loop here)
  var ma=cv(aw,ah),mq=ma.getContext('2d');if(ok(S.sunA))mq.drawImage(B(S,S.sunA),0,0,aw,ah);
  C.greyHole=cv(aw,ah);var gh=C.greyHole.getContext('2d');gh.drawImage(C.grey,0,0);gh.globalCompositeOperation='destination-out';gh.drawImage(ma,0,0);
  C.greySun=cv(aw,ah);var gs=C.greySun.getContext('2d');gs.drawImage(ma,0,0);gs.globalCompositeOperation='source-in';gs.drawImage(C.grey,0,0);
  // the sun disc and the reflection column as sprites of the real picture (exact pixels)
  var sk=aw/PW,sr=(SUN[2]+10)*sk;C.sun=cv(Math.ceil(2*sr),Math.ceil(2*sr));var s2=C.sun.getContext('2d');s2.drawImage(ma,SUN[0]*sk-sr,SUN[1]*sk-sr,2*sr,2*sr,0,0,2*sr,2*sr);
  s2.globalCompositeOperation='source-in';s2.drawImage(C.art,SUN[0]*sk-sr,SUN[1]*sk-sr,2*sr,2*sr,0,0,2*sr,2*sr);C.sunR=sr/sk;
  C.sunBrush=cv(C.sun.width,C.sun.height);
  var rx=REFL[0]*sk,ry=REFL[1]*sk,rw=(REFL[2]-REFL[0])*sk,rh=(REFL[3]-REFL[1])*sk;C.refl=cv(rw,rh);var r2=C.refl.getContext('2d');r2.drawImage(ma,rx,ry,rw,rh,0,0,rw,rh);
  r2.globalCompositeOperation='source-in';r2.drawImage(C.art,rx,ry,rw,rh,0,0,rw,rh);
  // the gleaners as sprites (their own pixels) and as dark contre-jour silhouettes, at screen resolution
  C.wom=WOM.map(function(b,i){var s=(to.w/(coverCrop(PW/PH)[2]))*dpr,w=Math.ceil((b[2]-b[0])*s),h=Math.ceil((b[3]-b[1])*s),c=cv(w,h),q=c.getContext('2d');
    if(ok(S.women)){q.drawImage(B(S,S.women),b[0],b[1],b[2]-b[0],b[3]-b[1],0,0,w,h);var id=q.getImageData(0,0,w,h),d=id.data;for(var j=0;j<d.length;j+=4){d[j+3]=d[j+i];d[j]=d[j+1]=d[j+2]=255;}q.putImageData(id,0,0);}
    // contre-jour: her own folds (the Gleaners' pixels) kept faintly under a cool dark glaze, not a flat cut-out
    q.globalCompositeOperation='source-in';q.fillStyle='rgb('+SIL+')';q.fillRect(0,0,w,h);
    var fi=ctx.from&&ctx.from.image;if(ok(fi)){q.globalCompositeOperation='source-atop';q.globalAlpha=.3;q.filter='grayscale(1) contrast(1.4) brightness(.55)';q.drawImage(B(S,fi),b[0],b[1],b[2]-b[0],b[3]-b[1],0,0,w,h);q.filter='none';q.globalAlpha=1;}
    return c;});
  // the dark room: night plus a spotlight pool round the picture (half resolution)
  var hq=.5;C.room=cv(W*hq,H*hq);var rq=C.room.getContext('2d');rq.scale(hq,hq);rq.fillStyle=mixc(NIGHT,NIGHT,0);rq.fillRect(0,0,W,H);
  rq.save();rq.translate(to.x+to.w/2,to.y+to.h/2);rq.scale(to.w*.95,to.h*1.05);var pg=rq.createRadialGradient(0,0,0,0,0,1);pg.addColorStop(0,'rgba(255,236,210,.13)');pg.addColorStop(.55,'rgba(255,236,210,.06)');pg.addColorStop(1,'rgba(255,236,210,0)');
  rq.fillStyle=pg;rq.fillRect(-2,-2,4,4);rq.restore();
  S.drawn=-1;S.C=C;return C;}

// ---------------------------------------------------------------- DOM: the previous room's title/label fade with the lights; our title is set by hand
var dirty=[],watching=false,myIdx=-1;
function setCss(el,prop,val){if(!el)return;if(el.style[prop]!==val)el.style[prop]=val;if(dirty.indexOf(el)<0){dirty.push(el);watch();}}
function clean(){dirty.forEach(function(el){el.style.opacity='';el.style.transition='';});dirty=[];}
function watch(){if(watching)return;watching=true;(function loop(){var st=window.EH&&EH.debug&&EH.debug.state;
  if(!st||st.idx!==myIdx||(st.phase!=='enter'&&st.phase!=='rest')){clean();fromLayers(null);watching=false;return;}requestAnimationFrame(loop);})();}
// the previous room's overlay layers (if any: the realism floor) go dark with its room. Through CSS filter, not opacity: the realism
// module's own watcher rewrites its floor's style.opacity every frame while the next room enters.
var fromL=[];
function fromLayers(a,ctx){if(a==null){fromL.forEach(function(el){el.style.filter='';});fromL=[];return;}
  if(ctx&&ctx.S){var mine=[ctx.S.tint,ctx.S.word];Array.prototype.forEach.call(document.querySelectorAll('canvas.ovl'),function(el){if(mine.indexOf(el)<0&&el.style.display!=='none'&&fromL.indexOf(el)<0)fromL.push(el);});}
  var v=a>=.999?'':'opacity('+a.toFixed(3)+')';fromL.forEach(function(el){if(el.style.filter!==v)el.style.filter=v;});if(fromL.length)watch();}

var labKey=null;
function placeLabel(ctx){var l=document.getElementById('lab'+ctx.to.idx);if(!l)return;var r=ctx.to.rect,lk=[innerWidth,innerHeight,r.x,r.y,r.w,r.h,l.textContent.length].join('/');if(lk===labKey&&l.style.left)return;labKey=lk;var fp=r.fp||0,f={left:r.x-fp,right:r.x+r.w+fp,bottom:r.y+r.h+fp};
  var W=innerWidth,Hh=innerHeight,wide=W>1180,h=l.offsetHeight,w=l.offsetWidth,g=W<=560?16:36,ft=document.querySelector('.foot'),footTop=ft?ft.getBoundingClientRect().top:Hh-80;
  var land=W<=980&&Hh<520&&W>Hh,x,y;
  if(wide){x=Math.round(f.right+34);y=Math.round(Math.max(64,Math.min(f.bottom-h,footTop-24-h)));}
  else if(land){var eb=document.getElementById('era'+ctx.to.idx);eb=eb?eb.getBoundingClientRect():null;x=Math.round(W*.58+24);y=Math.round((eb?eb.bottom:40)+14);}
  else{x=Math.round(Math.min(Math.max(f.left,g),W-g-w));y=Math.round(f.bottom+16);}
  var xs=x+'px',ys=y+'px';if(l.style.left!==xs)l.style.left=xs;if(l.style.top!==ys)l.style.top=ys;}

// the word that becomes the title: "印象" (or "Impression") in the label → the three characters of the vertical title
// glyph centres: a character's range box includes the letter-spacing after it (in the flow direction: down in the vertical title)
function charRects(el,re){if(!el)return null;var tw=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),n;while((n=tw.nextNode())){var m=re.exec(n.data);if(m){var out=[];
  var cs=getComputedStyle(n.parentNode),ls=parseFloat(cs.letterSpacing)||0,vert=/vertical/.test(cs.writingMode||'');
  for(var i=0;i<m[0].length;i++){var r=document.createRange();r.setStart(n,m.index+i);r.setEnd(n,m.index+i+1);var b=r.getBoundingClientRect();
    out.push({ch:m[0][i],x:b.left+(vert?b.width:b.width-ls)/2,y:b.top+(vert?b.height-ls:b.height)/2,w:b.width,h:b.height});}
  return{chars:out,font:cs.fontStyle+' '+cs.fontWeight+' ',size:parseFloat(cs.fontSize),fam:cs.fontFamily,col:cs.color,latin:/[A-Za-z]/.test(m[0])};}}return null;}
function wordGeo(ctx,S){var l=document.getElementById('lab'+ctx.to.idx),e=document.getElementById('era'+ctx.to.idx),h1=e&&e.querySelector('h1');if(!l||!h1)return null;
  // keyed on things that need no layout read (reading rects every frame would force a style/layout flush after the opacity writes)
  var r=ctx.to.rect,k=[innerWidth,innerHeight,r.x,r.y,r.w,r.h,l.style.left,l.style.top,h1.textContent,l.textContent.length].join('/');
  if(S.WG&&S.WG.k===k)return S.WG;
  var src=charRects(l,/印象/)||charRects(l,/Impression/i),dst=charRects(h1,/[\s\S]{1,3}/);if(!dst)return null;
  if(!src){var wt=l.querySelector('.what')||l,b=wt.getBoundingClientRect(),cs=getComputedStyle(wt),fs=parseFloat(cs.fontSize);src={chars:[{ch:'印',x:b.left+fs*.6,y:b.top+b.height/2,w:fs,h:fs},{ch:'象',x:b.left+fs*1.6,y:b.top+b.height/2,w:fs,h:fs}],font:'normal 400 ',size:fs,fam:cs.fontFamily,col:cs.color,latin:false};}
  // the last character's box has no trailing spacing: place it one pitch after the second instead
  var c=dst.chars;if(c.length>=3){c[2].x=2*c[1].x-c[0].x;c[2].y=2*c[1].y-c[0].y;}
  return(S.WG={k:k,src:src,dst:dst});}
// glyph sprites (rendered once per layout at the title's size, then only scaled: fillText at a new size every frame misses the glyph cache)
function glyph(ch,font,px,col,glowA,dpr){var m=Math.ceil(px*.5+18),w=Math.ceil(px*(ch.length>1?ch.length*.62:1.1))+2*m,h=Math.ceil(px*1.3)+2*m,c=cv(w*dpr,h*dpr),q=c.getContext('2d');
  q.scale(dpr,dpr);q.textAlign='center';q.textBaseline='middle';q.font=font;q.fillStyle=col;if(glowA){q.shadowColor='rgba(255,170,100,'+glowA+')';q.shadowBlur=7*dpr;}q.fillText(ch,w/2,h/2);return{c:c,w:w,h:h};}
function sprites(G,dpr,ink){if(G.sp)return G.sp;var src=G.src,d=G.dst,ts=d.size,base=src.col||'#efe6d6',cool=(getComputedStyle(document.documentElement).getPropertyValue(ink==='dark'?'--ink-dark':'--ink-light')||'').trim()||d.col,warm='rgb(255,178,112)';
  var F=d.font+ts+'px '+d.fam,sp={chars:[]};
  d.chars.slice(0,3).forEach(function(c){sp.chars.push({base:glyph(c.ch,F,ts,base,0,dpr),warm:glyph(c.ch,F,ts,warm,.55,dpr),cool:glyph(c.ch,F,ts,cool,0,dpr)});});
  if(src.latin){var FL=src.font+src.size+'px '+src.fam;sp.lat=glyph('Impression',FL,src.size,base,0,dpr);sp.latW=glyph('Impression',FL,src.size,warm,.55,dpr);}
  return(G.sp=sp);}
function blit(g,s,x,y,k,a){if(a<=0.002)return;g.globalAlpha=Math.min(1,a);g.drawImage(s.c,x-s.w*k/2,y-s.h*k/2,s.w*k,s.h*k);}
function drawWord(g,ctx,S,t){var G=wordGeo(ctx,S);if(!G)return;var src=G.src,dst=G.dst.chars,lift=eo(seg(t,T.lift)),out=1-sm(seg(t,T.wordOut));if(out<=0||lift<=0)return;
  var ts=G.dst.size,sp=sprites(G,ctx.dpr||1,ctx.to.ink);
  g.save();
  // one glyph per target character: 印 ← source 0, 象 ← source 1 (a Latin "Impression" flies as one word and turns into 印象 half way)
  for(var i=0;i<2&&i<dst.length;i++){var f=seg(t,[T.word[0]+i*.14,T.word[1]-(1-i)*.14]),u=eio(f),P=sp.chars[i];
    var s0=src.latin?{x:src.chars.reduce(function(a,c){return a+c.x;},0)/src.chars.length,y:src.chars[0].y}:src.chars[Math.min(i,src.chars.length-1)],d=dst[i];
    var x0=s0.x,y0=s0.y-10*lift,x1=d.x,y1=d.y,cx=(x0+x1)/2,cy=Math.min(y0,y1)-Math.max(60,ctx.H*.12);
    var x=(1-u)*(1-u)*x0+2*(1-u)*u*cx+u*u*x1,y=(1-u)*(1-u)*y0+2*(1-u)*u*cy+u*u*y1,sz=Math.exp(lerp(Math.log(src.size),Math.log(ts),u)),k=sz/ts;
    var a=out*(.35+.65*lift),m=Math.min(1,lift*1.2)*(1-u*2)+u*2,cj=1;
    if(src.latin&&u<.55){var la=a*(1-sm(seg(u,[.3,.55])));if(i===0){var lx=x+(dst[1]?(dst[1].x-dst[0].x)/2*u:0),ly=y+(dst[1]?(dst[1].y-dst[0].y)/2*u:0),lk=Math.sqrt(sz/src.size);blit(g,sp.lat,lx,ly,lk,la);blit(g,sp.latW,lx,ly,lk,la*Math.min(1,m));}cj=sm(seg(u,[.3,.55]));}
    // colour: label ink → warm (with the sun's glow) → the title's ink; the second layer is drawn over the first at its weight
    if(u<.5){blit(g,P.base,x,y,k,a*cj);blit(g,P.warm,x,y,k,a*cj*Math.min(1,m));}
    else{var wc=(u-.5)*2;blit(g,P.cool,x,y,k,a*cj*sm(wc*3));blit(g,P.warm,x,y,k,a*cj*(1-wc));}}
  // 派 condenses in the third place
  if(dst[2]&&sp.chars[2]){var pa=sm(seg(t,T.pai))*out;if(pa>0){blit(g,sp.chars[2].cool,dst[2].x,dst[2].y+(1-pa)*8,1,pa);blit(g,sp.chars[2].warm,dst[2].x,dst[2].y+(1-pa)*8,1,pa*(1-pa));}}
  g.restore();}

// ---------------------------------------------------------------- the frame
var MOD={
  duration:D,
  assets:['t_clean.webp','t_grey.webp','t_masks.png','t_women.png','t_sunalpha.png'],
  fromAssets:[],
  init:function(ctx){var S=ctx.state;myIdx=ctx.to.idx;
    S.clean=ctx.asset('t_clean.webp');S.grey=ctx.asset('t_grey.webp');S.masks=ctx.asset('t_masks.png');
    // the gleaners' masks are in the realism picture's pixels; kept in this room's folder (the realism folder belongs to others)
    S.women=ctx.asset('t_women.png');S.sunA=ctx.asset('t_sunalpha.png');
    S.tint=ctx.layer('tint',{z:8,blend:'color'});S.word=ctx.layer('word',{z:9});
    // decode every big image off the main thread first (init runs during the realism room's rest: a synchronous decode there is a visible freeze),
    // then build the caches and start the stroke worker in separate tasks
    var ims=[S.clean,S.grey,S.masks,S.women,S.sunA,ctx.to.image,ctx.from&&ctx.from.image].filter(Boolean);S.bm=new Map();
    function loaded(im){return ok(im)?Promise.resolve():new Promise(function(r){im.addEventListener('load',r,{once:true});im.addEventListener('error',r,{once:true});});}
    // one image per task (createImageBitmap of an <img> may decode on the main thread): no single long freeze
    var chain=Promise.all(ims.map(loaded));ims.forEach(function(im){chain=chain.then(function(){return new Promise(function(r){setTimeout(r,0);});}).then(function(){
      return window.createImageBitmap&&ok(im)?createImageBitmap(im).then(function(b){S.bm.set(im,b);}):null;}).catch(function(){});});
    chain.then(function(){
      S.decoded=true;setTimeout(function(){ensure(ctx,S);setTimeout(function(){startWorker(ctx,S);
        // the bitmaps (~18 MB each) are only needed to build the caches; a later resize rebuilds from the <img>s
        if(S.bm){S.bm.forEach(function(b){try{b.close();}catch(e){}});S.bm=null;}},0);},0);});},
  draw:function(p,ctx){var g=ctx.g,S=ctx.state,W=ctx.W,H=ctx.H,t=p*D,to=ctx.to.rect,F=ctx.from,fr=F?F.rect:null;myIdx=ctx.to.idx;S.restT0=null;
    if(!S.tint){S.tint=ctx.layer('tint',{z:8,blend:'color'});S.word=ctx.layer('word',{z:9});}
    // cold start only (images still decoding): hold the previous room's frame, then the plain hand-over frame
    if(!S.decoded||!ok(S.women)){if(F&&t<D/2){g.fillStyle=F.wall;g.fillRect(0,0,W,H);g.drawImage(F.image,fr.x,fr.y,fr.w,fr.h);}else{g.fillStyle=ctx.to.wall;g.fillRect(0,0,W,H);g.drawImage(ctx.to.image,to.x,to.y,to.w,to.h);}return;}
    var C=ensure(ctx,S);if(!S.job)startWorker(ctx,S);var toWall=hex(ctx.to.wall),dpr=ctx.dpr||1;
    // ===== DOM
    if(!S.warm){
      var fd=1-sm(seg(t,T.fromDom));if(F){['era'+F.idx,'lab'+F.idx].forEach(function(id){var el=document.getElementById(id);if(!el)return;
        if(fd>.001){el.classList.add('on');setCss(el,'transition','none');setCss(el,'opacity',fd.toFixed(3));}else{el.classList.remove('on');setCss(el,'transition','none');setCss(el,'opacity','0');}});}
      fromLayers(1-eio(seg(t,T.dim)),{S:S});
      var ink=t<T.fromDom[1]&&F?F.ink:(t<T.ink?'light':ctx.to.ink);if(S.inkNow!==ink){ctx.ui.ink(ink);S.inkNow=ink;}
      var wc=t<T.fromDom[1]&&F?F.wall:(t<T.ink?'#0e0c0b':ctx.to.wall);if(S.wallNow!==wc){ctx.ui.wall(wc);S.wallNow=wc;}
      var labOn=t>=T.label;ctx.ui.label(ctx.to.idx,labOn);if(labOn)placeLabel(ctx);
      var e=document.getElementById('era'+ctx.to.idx),ta=sm(seg(t,T.title));if(e){if(ta>0){e.classList.add('on');setCss(e,'transition','none');setCss(e,'opacity',ta.toFixed(3));}else{e.classList.remove('on');setCss(e,'transition','none');setCss(e,'opacity','0');}}
    }
    // ===== 1. the room: realism rest → dark room with a spotlight → (light spill) → this room's wall
    var dk=eio(seg(t,T.dim)),wu=sm(seg(t,T.wall)),spotA=1-sm(seg(t,T.spot));
    if(F&&dk<1){g.fillStyle=F.wall;g.fillRect(0,0,W,H);wash(g,W,H,fr,F.ink==='dark',1);if(F.frame==='none')drawShadow(g,C.shFr,.6*(1-dk));
      /* the realism floor stays on its own layer (z 4, above the stage) and goes dark with the room via fromLayers() */}
    // the night is laid over the old room by dk and stays opaque under the new wall (the stage must never let the DOM wall show through:
    // the core's wall colour changes with a CSS transition that is not a function of p)
    if(dk>0&&wu<1){g.globalAlpha=(F&&dk<1)?dk:1;g.fillStyle=mixc(NIGHT,NIGHT,0);g.fillRect(0,0,W,H);g.globalAlpha=dk*spotA*(1-wu);g.drawImage(C.room,0,0,W,H);g.globalAlpha=1;}
    if(wu>0){g.globalAlpha=wu;g.fillStyle=ctx.to.wall;g.fillRect(0,0,W,H);g.globalAlpha=1;wash(g,W,H,to,ctx.to.ink==='dark',wu);if(ctx.to.frame==='none')drawShadow(g,C.shTo,.6*wu);}
    // the light spilling out of the sun onto the walls, settling to the rest glow
    var sp=seg(t,T.spill);if(sp>0){var s=sunAt(to),R=lerp(to.w*.18,Math.max(W,H)*.95,eo(sp)),A=lerp(0,2.4,sm(seg(t,[T.spill[0],T.spill[0]+1.1])))*(1-sm(seg(t,[21.2,23.4])))+REST_A*sm(seg(t,[21.0,23.4]));
      glow(g,W,H,to,A,R);}
    // ===== 2. the picture
    var geo=eio(seg(t,T.geo)),rx,ry,rw,rh;
    if(t<T.geo[1]){rx=lerp(fr.x,to.x,geo);ry=lerp(fr.y,to.y,geo);rw=lerp(fr.w,to.w,geo);rh=lerp(fr.h,to.h,geo);var cr=coverCrop(PW/PH),kf=C.kf;
      g.drawImage(C.fromFull,lerp(0,cr[0],geo)*kf,lerp(0,cr[1],geo)*kf,lerp(GW,cr[2],geo)*kf,lerp(GH,cr[3],geo)*kf,rx,ry,rw,rh);
      // p = 0 is the realism room's own hung pixels; they hand over to the pre-scaled copy while the frame is still in place
      var fa=1-sm(seg(t,[.02,T.geo[0]]));if(fa>0&&ok(C.fromArt)){g.globalAlpha=fa;g.drawImage(C.fromArt,fr.x,fr.y,fr.w,fr.h);g.globalAlpha=1;}}
    else{
      var set=sm(seg(t,T.settle));
      if(set<1){
        if(S.ready){paintTo(C,S,countAt(S.ts,t));g.drawImage(C.paint,to.x,to.y,to.w,to.h);}
        else{g.drawImage(C.base,to.x,to.y,to.w,to.h);var fb=sm(seg(t,[T.L[0][0],T.fly[2][1]]));if(fb>0){g.globalAlpha=fb;g.drawImage(C.real,to.x,to.y,to.w,to.h);g.globalAlpha=1;}}
        var ks=to.w/(coverCrop(PW/PH)[2]),cr2=coverCrop(PW/PH);
        // the gleaners: silhouettes in the mist, then lifted into the boats
        C.wom.forEach(function(c,i){var b=WOM[i],f=T.fly[i],da=sm(seg(t,T.sil)),u=eio(seg(t,f)),fade=1-sm(seg(t,[f[1]-.3,f[1]+.3]));if(da<=0||fade<=0)return;
          var x0=to.x+(b[0]-cr2[0])*ks,y0=to.y+(b[1]-cr2[1])*ks,w0=(b[2]-b[0])*ks,h0=(b[3]-b[1])*ks,B=BOATS[i],x1=to.x+B[0]/PW*to.w,y1=to.y+B[1]/PH*to.h,w1=(B[2]-B[0])/PW*to.w,h1=(B[3]-B[1])/PH*to.h;
          var w=Math.exp(lerp(Math.log(w0),Math.log(w1),u)),h=Math.exp(lerp(Math.log(h0),Math.log(h1),u)),cx=lerp(x0+w0/2,x1+w1/2,u),cy=lerp(y0+h0/2,y1+h1/2,u)-Math.sin(Math.PI*u)*to.h*.05;
          if(u>0&&u<1){g.globalAlpha=.25*da*fade*Math.sin(Math.PI*u);g.drawImage(c,cx-w/2-(x1-x0)*.02,cy-h/2-(y1-y0)*.02,w,h);}
          g.globalAlpha=da*fade*(u>0?.95:.9);g.drawImage(c,cx-w/2,cy-h/2,w,h);g.globalAlpha=1;});
        // the last stroke: the sun (one loaded round stroke of the real pixels), with a wet highlight that dries
        var su=seg(t,T.sunIn);if(su>0){var sk=to.w/PW,sr=C.sunR*sk,sx=to.x+SUN[0]*sk,sy=to.y+SUN[1]*sk;
          var hal=Math.sin(Math.PI*seg(t,T.halo))*(1-set);if(hal>0){g.save();g.globalCompositeOperation='lighter';var hg=g.createRadialGradient(sx,sy,0,sx,sy,sr*3.2);hg.addColorStop(0,'rgba(255,120,50,'+(.22*hal).toFixed(3)+')');hg.addColorStop(1,'rgba(255,120,50,0)');g.fillStyle=hg;g.fillRect(sx-sr*3.2,sy-sr*3.2,sr*6.4,sr*6.4);g.restore();}
          if(su>=1)g.drawImage(C.sun,sx-sr,sy-sr,2*sr,2*sr);
          else{var bq=C.sunBrush.getContext('2d'),bw=C.sunBrush.width,bs=bw/2,Rr=SUN[2]/C.sunR;bq.setTransform(1,0,0,1,0,0);bq.globalCompositeOperation='source-over';bq.clearRect(0,0,bw,bw);
            // a spiral from the left rim inward, 1.25 turns; the brush is wide enough to close the disc
            var f=eio(su),n=Math.max(2,Math.round(64*f));bq.lineCap='round';bq.lineJoin='round';bq.lineWidth=bs*Rr*.95;bq.strokeStyle='#fff';bq.beginPath();
            for(var j=0;j<=n;j++){var q=j/64,a=Math.PI*1.1+q*Math.PI*2.5,rad=bs*Rr*lerp(.62,.08,q);var px=bs+Math.cos(a)*rad,py=bs+Math.sin(a)*rad;if(j)bq.lineTo(px,py);else bq.moveTo(px,py);}bq.stroke();
            bq.globalCompositeOperation='source-in';bq.drawImage(C.sun,0,0);g.drawImage(C.sunBrush,sx-sr,sy-sr,2*sr,2*sr);}
          var wet=(1-sm(seg(t,[15.4,16.6])))*sm(seg(su,[.05,.4]));if(wet>0){g.save();g.globalCompositeOperation='lighter';g.globalAlpha=.22*wet;g.drawImage(su>=1?C.sun:C.sunBrush,sx-sr-sr*.05,sy-sr-sr*.08,2*sr,2*sr);g.restore();}}
        // … and its short reflections, dab by dab down the water, each laid left to right
        var rf=seg(t,T.refl);if(rf>0){var rk=to.w/PW,X=to.x+REFL[0]*rk,Y=to.y+REFL[1]*rk,RW=(REFL[2]-REFL[0])*rk,RH=(REFL[3]-REFL[1])*rk,NB=11,cw=C.refl.width,chh=C.refl.height;
          for(var b2=0;b2<NB;b2++){var bf=eo(seg(t,[T.refl[0]+b2*.085,T.refl[0]+b2*.085+.3]));if(bf<=0)break;var yy0=b2/NB,yy1=(b2+1)/NB,ww=bf;
            g.drawImage(C.refl,0,yy0*chh,cw*ww,(yy1-yy0)*chh,X,Y+yy0*RH,RW*ww,(yy1-yy0)*RH);}}
      }
      // settle: the painted picture becomes the picture (tiny differences at the boat and sun edges)
      if(set>0){g.globalAlpha=set;g.drawImage(C.art,to.x,to.y,to.w,to.h);g.globalAlpha=1;}
      // the colour drains away — the sun vanishes into the sky of the same lightness — then comes back, the sun first
      var gA=eio(seg(t,T.grey))*(1-eo(seg(t,T.colour))),gS=eio(seg(t,T.grey))*(1-eo(seg(t,T.jump)));
      if(gA>0||gS>0){g.globalAlpha=gA;g.drawImage(C.greyHole,to.x,to.y,to.w,to.h);g.globalAlpha=gS;g.drawImage(C.greySun,to.x,to.y,to.w,to.h);g.globalAlpha=1;}
      var bl=seg(t,T.bloom);if(bl>0&&bl<1){var s2=sunAt(to),bk=Math.pow(1-bl,1.6)*sm(seg(bl,[0,.06])),br=to.w*(.06+.5*eo(bl));g.save();g.globalCompositeOperation='lighter';
        var bg=g.createRadialGradient(s2[0],s2[1],0,s2[0],s2[1],br);bg.addColorStop(0,'rgba(255,150,70,'+(.5*bk).toFixed(3)+')');bg.addColorStop(.4,'rgba(240,140,90,'+(.18*bk).toFixed(3)+')');bg.addColorStop(1,'rgba(150,170,190,0)');
        g.fillStyle=bg;g.fillRect(s2[0]-br,s2[1]-br,2*br,2*br);g.restore();}
    }
    if(t>=D-1e-6){g.fillStyle=ctx.to.wall;g.fillRect(0,0,W,H);wash(g,W,H,to,ctx.to.ink==='dark',1);if(ctx.to.frame==='none')drawShadow(g,C.shTo,.6);g.drawImage(C.art,to.x,to.y,to.w,to.h);glow(g,W,H,to,restA(0));}
    // ===== overlay layers: colour tint of walls/label/title ('color' blend), the floating word
    if(!S.warm){var tg=S.tint.__g,wg=S.word.__g;tg.setTransform(dpr,0,0,dpr,0,0);tg.clearRect(0,0,W,H);wg.setTransform(dpr,0,0,dpr,0,0);wg.clearRect(0,0,W,H);
      var ti=sm(seg(t,T.tintIn))*(1-sm(seg(t,T.tintOut)));if(ti>0){var s3=sunAt(to),R3=Math.max(W,H)*lerp(.4,1.1,eo(sp));tg.save();tg.beginPath();tg.rect(0,0,W,H);tg.rect(to.x,to.y,to.w,to.h);tg.clip('evenodd');
        var tgr=tg.createRadialGradient(s3[0],s3[1],0,s3[0],s3[1],R3);tgr.addColorStop(0,'rgba(240,140,70,'+(.85*ti).toFixed(3)+')');tgr.addColorStop(.35,'rgba(214,150,110,'+(.6*ti).toFixed(3)+')');tgr.addColorStop(.7,'rgba(110,146,172,'+(.55*ti).toFixed(3)+')');tgr.addColorStop(1,'rgba(110,146,172,'+(.35*ti).toFixed(3)+')');
        tg.fillStyle=tgr;tg.fillRect(0,0,W,H);tg.restore();}
      if(t>T.lift[0]&&t<T.wordOut[1])drawWord(wg,ctx,S,t);else if(t>=T.label&&t<=T.lift[0]){var G0=wordGeo(ctx,S);if(G0)sprites(G0,dpr,ctx.to.ink);}}
  },
  done:function(ctx){var S=ctx.state;S.restT0=performance.now()/1000;[S.tint,S.word].forEach(function(c){if(c&&c.__g){c.__g.setTransform(1,0,0,1,0,0);c.__g.clearRect(0,0,c.width,c.height);}});},
  rest:function(ctx){var S=ctx.state,now=performance.now()/1000;myIdx=ctx.to.idx;if(S.restT0==null)S.restT0=now;var el=now-S.restT0;
    // the title/label were already fully on at the hand-over: hold them through the core's own fade-in window, then hand the styles back
    if(el<1.5&&!ctx.reading){ctx.ui.title(ctx.to.idx,true);ctx.ui.label(ctx.to.idx,true);}else if(dirty.length)clean();
    var g=ctx.g,r=ctx.to.rect;glow(g,ctx.W,ctx.H,r,restA(el));
    if(ctx.reading&&ctx.readRect){var R=ctx.readRect;g.clearRect(R.x,R.y,R.w,R.h);}}
};
EH.transition('impressionism',MOD);
})();

;
/* 后印象派 · 笔触碎成科学的点 — the passage from Monet's Impression, Sunrise (impressionism) into Seurat's A Sunday on La Grande Jatte.
   Beats (seconds of D, see T): to a metronome, Monet's strokes break into equal pure-colour dots — first the sun (the last stroke he laid), then its
   reflections, then 1, 2, 4, 8 … strokes per tick spreading out from the sun; each stroke's dots first carry the stroke's mixed colour, then snap to
   Seurat's pure pigments (error-diffused in linear light, so the dotted Monet still reads) · the dots lift off and are sorted by hue into a colour
   wheel (a sweep round the circle, each hue flowing in through its own point outside the rim; greys in the middle) · the wheel spins and bursts
   towards the visitor: the dots fly to their places in the Grande Jatte, seen from a few centimetres — the screen holds a few hundred big, unmixed
   dots round the monkey · one uninterrupted pull-back: the dots shrink and fuse in the eye into the monkey on its leash, the lady's skirt and
   parasol, the lawn, the river · the picture has no edge yet: its dots spill over the whole page; in the flood the vertical title and the label are
   made of dots · the flood recedes into the canvas edge and lands as Seurat's own painted border (each dot turning to the colour the border has
   there), leaving the title and label standing in dots · one step further back: a light pool on the floor, a bench and a small visitor seen from
   behind — the picture is two metres high and three wide · the visitor steps forward past the bench up to the picture · hand-over.
   Rendering: one offscreen WebGL2 canvas (instanced dots: ~200 k painting dots, 16 k travellers, the spill and the letters; textured quads for
   the Monet with its stroke map and for the Seurat — mipmapped image when the dots are smaller than ~2 device px), copied onto the stage.
   Data (make_data.py in _wip/t-postimpressionism/): t_dots.png (dots, travellers first, then a random order = LOD prefix), t_trav.png
   (Monet position, break time, wheel slot), t_strokes.png (Monet stroke map → break time). No rest extras. */
(function(){
'use strict';
var DATA=/*DATA*/{"N":201153,"NT":15984,"NV":2137,"dotsW":1024,"dotsH":393,"travH":63,"pal":[[115,86,92],[115,56,57],[130,111,105],[127,91,65],[94,81,67],[131,124,99],[131,122,64],[141,133,90],[109,104,58],[80,92,57],[54,70,50],[86,98,85],[40,51,41],[123,136,151],[88,102,129],[67,74,93],[53,69,111],[161,155,144],[127,130,129],[92,94,101],[60,72,70],[77,61,63],[52,55,66],[39,40,42]],"pure":[[209,96,126],[211,25,63],[233,135,102],[208,116,43],[159,111,37],[189,173,83],[183,171,0],[198,186,56],[154,148,0],[98,138,33],[49,112,42],[77,150,81],[21,114,54],[121,192,255],[79,145,227],[50,108,187],[0,102,202],[206,200,189],[165,169,168],[122,124,131],[83,96,93],[100,83,85],[72,75,86],[54,56,58]],"ticks":[0.9,1.32,1.74,2.16,2.58,3.0,3.42,3.84,4.26,4.68,5.1,5.52],"S0":0.5,"S1":6.5,"monkey":[1752,1318],"V":[120,95],"spacing":4.366472721269704,"monetSpacing":16.71227094083865,"src":"cut/dots.bin"}/*END*/;
var D=22,PW=2400,PH=1598,MW=2400,MH=1862,BW=27;
var T={fromOut:[1.2,5.8],sort:[5.5,1.3,1.0],spin:[6.0,9.8],wall:[5.4,8.2],ink:8.2,chromeOff:8.2,
  burst:[8.3,0.35,1.35],ground:[9.2,10.1],tf:10.1,zoom:[9.7,17.6],glyph:[15.3,16.8],retreat:[16.3,18.2],border:[17.1,18.3],
  wash:[16.6,19.0],shadow:[17.3,18.6],bench:[17.3,18.5],title:18.5,label:18.7,glyphOut:[18.7,19.7],chromeOn:19.6,
  fwd:[19.0,21.3],benchOut:[19.3,20.7],fin:[20.9,21.7]};
var CH_AIR=.8,ZFAR=0.56,BEIGE=[232/255,222/255,200/255];

function clamp(x){return x<0?0:x>1?1:x;}
function seg(t,a){return clamp((t-a[0])/(a[1]-a[0]));}
function lerp(a,b,u){return a+(b-a)*u;}
function sm(x){x=clamp(x);return x*x*(3-2*x);}
function eo(x){x=clamp(x);return 1-Math.pow(1-x,3);}
function eio(x){x=clamp(x);return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;}
function hex(c){var m=String(c||'').trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);if(!m)return[0,0,0];var h=m[1];if(h.length===3)h=h.replace(/./g,'$&$&');var n=parseInt(h,16);return[(n>>16)&255,(n>>8)&255,n&255];}
function mixc(a,b,u){return 'rgb('+[0,1,2].map(function(i){return Math.round(lerp(a[i],b[i],u));}).join(',')+')';}
function cv(w,h){var c=document.createElement('canvas');c.width=Math.max(1,Math.round(w));c.height=Math.max(1,Math.round(h));return c;}
function ok(im){return im&&(im.naturalWidth||im.width)>0;}
function lum(c){var f=function(v){v/=255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4);};return .2126*f(c[0])+.7152*f(c[1])+.0722*f(c[2]);}

// ---------------------------------------------------------------- the DOM rest look (index.html): .wash, the f-none shadow, frame decorations, paintArt's resampling
function wash(g,W,H,r,light,a){if(a<=0)return;g.save();g.translate(r.x+r.w/2,r.y+r.h/2);g.scale(.7*W,.6*H);
  var gr=g.createRadialGradient(0,0,0,0,0,1);gr.addColorStop(0,light?'rgba(255,255,255,.35)':'rgba(255,244,225,.08)');gr.addColorStop(.7,light?'rgba(255,255,255,0)':'rgba(255,244,225,0)');
  g.globalAlpha=a;g.fillStyle=gr;g.fillRect(-2,-2,4,4);g.restore();}
// the outer box-shadow of each frame style (index.html .frame.f-*::before), cast by the frame box (the rect grown by fp)
var SHADOW={none:[26,60,-26,.6],white:[22,50,-22,.45],gilt:[28,70,-24,.8],stone:[24,60,-24,.7]};
function shadowCache(dpr,r,style){var sp=SHADOW[style]||SHADOW.none,fp=style&&style!=='none'&&style!=='fade'?(r.fp||0):0;r={x:r.x-fp,y:r.y-fp,w:r.w+2*fp,h:r.h+2*fp};var ox=0,oy=sp[0],blur=sp[1],spread=sp[2],M=Math.ceil(1.6*blur+oy+4),X0=r.x-spread-M,Y0=r.y-spread-M,X1=r.x+r.w+spread+M,Y1=r.y+r.h+spread+M;
  var dx=Math.floor(X0*dpr),dy=Math.floor(Y0*dpr),c=cv(Math.ceil(X1*dpr)-dx,Math.ceil(Y1*dpr)-dy),q=c.getContext('2d');q.setTransform(dpr,0,0,dpr,-dx,-dy);
  q.shadowColor='#000';q.shadowBlur=blur*dpr;q.shadowOffsetX=(ox+1e5)*dpr;q.shadowOffsetY=oy*dpr;q.fillStyle='#000';q.fillRect(r.x-spread-1e5,r.y-spread,r.w+2*spread,r.h+2*spread);
  return{c:c,x:dx/dpr,y:dy/dpr,w:c.width/dpr,h:c.height/dpr,r:{x:r.x,y:r.y,w:r.w,h:r.h},a:sp[3]};}
// the shadow of the rest rect, carried along to where the camera has the picture (rc)
function drawShadow(g,sh,a,rc){if(!sh||a<=0)return;g.save();g.globalAlpha=a;if(rc){var s=rc.w/sh.r.w;g.translate(rc.x,rc.y);g.scale(s,s);g.translate(-sh.r.x,-sh.r.y);}g.drawImage(sh.c,sh.x,sh.y,sh.w,sh.h);g.restore();}
function frameDeco(g,r,style,a){var fp=r.fp||0;if(!fp||a<=0||style==='none'||style==='fade')return;var x=r.x-fp,y=r.y-fp,w=r.w+2*fp,h=r.h+2*fp;g.save();g.globalAlpha=a;
  if(style==='gilt'){g.fillStyle='#1c1409';g.fillRect(x,y,w,h);g.fillStyle='#7a5e35';g.fillRect(x+1,y+1,w-2,h-2);g.fillStyle='#241a0c';g.fillRect(x+5,y+5,w-10,h-10);g.fillStyle='#4a371c';g.fillRect(x+6,y+6,w-12,h-12);}
  else if(style==='white'){g.fillStyle='rgba(0,0,0,.07)';g.fillRect(x,y,w,h);g.fillStyle='#f2f0eb';g.fillRect(x+1,y+1,w-2,h-2);g.fillStyle='rgba(0,0,0,.08)';g.fillRect(x+9,y+9,w-18,h-18);g.fillStyle='#f2f0eb';g.fillRect(x+10,y+10,w-20,h-20);}
  else if(style==='stone'){g.fillStyle='rgba(0,0,0,.4)';g.fillRect(x,y,w,h);g.fillStyle='#4d4840';g.fillRect(x+1,y+1,w-2,h-2);}
  g.restore();}
function artCanvas(im,r,dpr){var w=Math.min(Math.round(r.w*dpr),2600),h=Math.round(w*(im.naturalHeight||1)/(im.naturalWidth||1)),c=cv(w,h);if(ok(im))c.getContext('2d').drawImage(im,0,0,w,h);return c;}

// ---------------------------------------------------------------- the pull-back's pace: a LUT of the log-zoom (quick through the abstract dots, a breath while they fuse, gentle landing)
var PROF=(function(){var n=512,v=[],s=0,out=[0];for(var i=0;i<n;i++){var u=(i+.5)/n;var sp=sm(u/.16)*(1-.45*Math.exp(-Math.pow((u-.52)/.16,2)))*(1-sm((u-.72)/.28))+.02;v.push(sp);}
  for(i=0;i<n;i++){s+=v[i];out.push(s);}return out.map(function(x){return x/s;});})();
function prof(u){u=clamp(u)*(PROF.length-1);var i=Math.floor(u),f=u-i;return i>=PROF.length-1?1:lerp(PROF[i],PROF[i+1],f);}

// ---------------------------------------------------------------- geometry (screen), per layout
function geo(ctx){var W=ctx.W,H=ctx.H,R=ctx.to.rect,R0=ctx.from?ctx.from.rect:null,k=[W,H,ctx.dpr,R.x,R.y,R.w,R.h,R0?[R0.x,R0.y,R0.w].join():''].join('/');var S=ctx.state;if(S.G&&S.G.key===k)return S.G;
  var G={key:k,W:W,H:H,R:R,dpr:ctx.dpr||1};G.k1=R.w/PW;
  var sp=DATA.spacing||4.4;G.kClose=Math.max(36,Math.min(64,Math.min(W,H)*.075))/sp;G.lnz0=Math.log(G.kClose/G.k1);G.lnzf=Math.log(ZFAR);
  var A=DATA.monkey||[1752,1318];G.A=A;G.F1=[R.x+A[0]*G.k1,R.y+A[1]*G.k1];G.C=[R.x+R.w/2,R.y+R.h/2];G.Pc=[PW/2,PH/2];G.Sc=[W/2,H/2];
  // Monet (p = 0) and the wheel in the air over it
  G.R0=R0||{x:W*.25,y:H*.2,w:W*.5,h:W*.5*MH/MW};G.km=G.R0.w/MW;G.rM=(DATA.monetSpacing||16.7)*G.km*.62;
  G.wc=[G.R0.x+G.R0.w/2,G.R0.y+G.R0.h/2];G.wr=Math.min(.47*Math.min(G.R0.w,G.R0.h),.42*Math.min(W,H));G.rW=Math.sqrt(Math.PI*G.wr*G.wr/Math.max(1,DATA.NT||16000))*.6;
  return(S.G=G);}
// camera at time t: screen = O + world·k
function cam(G,t){var L;
  if(t<T.zoom[0])L=G.lnz0;else if(t<T.zoom[1])L=lerp(G.lnz0,G.lnzf,prof(seg(t,T.zoom)));else if(t<T.fwd[0])L=G.lnzf;else L=G.lnzf*(1-eio(seg(t,T.fwd)));
  var z=Math.exp(L),k=z*G.k1,mF=sm((G.lnz0-L)/(G.lnz0-Math.log(3))),F=[lerp(G.Sc[0],G.F1[0],mF),lerp(G.Sc[1],G.F1[1],mF)],mc=z<1?sm((1-z)/(1-ZFAR)):0;
  var o=[lerp(F[0]-G.A[0]*k,G.C[0]-G.Pc[0]*k,mc),lerp(F[1]-G.A[1]*k,G.C[1]-G.Pc[1]*k,mc)];return{k:k,z:z,L:L,o:o,rect:{x:o[0],y:o[1],w:PW*k,h:PH*k}};}
function farCam(G){var k=ZFAR*G.k1;return{k:k,o:[G.C[0]-G.Pc[0]*k,G.C[1]-G.Pc[1]*k]};}

// ================================================================== WebGL2
var VS_DOT=['#version 300 es','precision highp float;',
'layout(location=0) in vec2 aQ;layout(location=1) in vec4 aD;layout(location=2) in vec4 aT0;layout(location=3) in vec2 aT1;',
'uniform int uMode;uniform vec2 uView;uniform float uDpr,uT,uIdOff;uniform vec3 uCam;uniform vec4 uMon;uniform vec3 uWheel;uniform vec3 uR;',
'uniform vec4 uTs;uniform vec4 uTb;uniform vec4 uA;uniform vec4 uG;uniform vec2 uCh;uniform vec3 uPal[24];uniform vec3 uPure[24];uniform sampler2D uMonTex;',
'out vec2 vQ;out vec3 vCol;out float vA;out float vPx;out vec3 vSh;',
'float sm(float x){x=clamp(x,0.,1.);return x*x*(3.-2.*x);}',
'float eio(float x){x=clamp(x,0.,1.);return x<.5?4.*x*x*x:1.-pow(-2.*x+2.,3.)/2.;}',
'float h1(float n){return fract(sin(n*12.9898+78.233)*43758.5453);}',
'vec2 rot(vec2 v,float a){float c=cos(a),s=sin(a);return vec2(c*v.x-s*v.y,s*v.x+c*v.y);}',
'vec2 W2S(vec2 w){return uCam.xy+w*uCam.z;}',
'void main(){float id=float(gl_InstanceID)+uIdOff;vec2 pos;float r;vec3 col;float a=1.;',
'  int pi=int(mod(aD.w+.5,32.));vec3 pc=mix(uPal[pi],uPure[pi],uCh.y);',
'  float bw=uTb.w;bool band=aD.w>31.5;float bA=band?clamp((uA.y-h1(id*.37)*.6)/.4,0.,1.):1.;',
'  if(uMode==0){pos=W2S(aD.xy);r=aD.z*uCam.z*uR.z;col=pc;a=uA.x*bA*step(uTb.z,uT);}',
'  else if(uMode==1){',
'    float tau=uT-aT0.z;vec2 mp=uMon.xy+aT0.xy*(uMon.z/2400.);vec3 mc=textureLod(uMonTex,aT0.xy/vec2(2400.,1862.),0.).rgb;vec3 cm=mix(uPal[int(aT0.w+.5)],uPure[int(aT0.w+.5)],uCh.x);',
'    float pop=tau<0.?0.:(tau<.08?1.35*sm(tau/.08):mix(1.35,1.,sm((tau-.08)/.14)));',
'    float ang=atan(aT1.y,aT1.x);float hr=fract(-ang/6.2831853+.25);',
'    float ts=max(uTs.x+uTs.y*hr+.15*h1(id+3.1),aT0.z+.3);float s=clamp((uT-ts)/uTs.z,0.,1.);float se=eio(s);',
'    vec2 slot=rot(aT1,uWheel.z>0.?uG.x:0.)*uWheel.z;vec2 wp=uWheel.xy+slot;vec2 dir=length(aT1)>.02?normalize(aT1):vec2(0.,-1.);',
'    vec2 ctl=uWheel.xy+rot(dir,uG.x)*uWheel.z*mix(1.3,.35,step(length(aT1),.15));',
'    vec2 p1=mix(mix(mp,ctl,se),mix(ctl,wp,se),se);float r1=mix(uR.x,uR.y,se)*pop;',
'    vec3 c1=mix(mc,cm,sm(tau/.22));',
'    float rr=length(aT1);float tb0=uTs.w+.35*rr+.1*h1(id+7.7);float b=clamp((uT-tb0)/uTb.y,0.,1.);float be=pow(b,2.2);',
'    vec2 sp=W2S(aD.xy);float rs=aD.z*uCam.z*uR.z;',
'    vec2 d0=wp-uWheel.xy;vec2 pb=mix(uWheel.xy+rot(d0,1.1*be),sp,be);',
'    pos=b>0.?pb:p1;r=b>0.?exp(mix(log(max(r1,.05)),log(max(rs,.05)),be)):r1;',
'    col=b>0.?mix(cm,pc,sm((b-.25)/.5)):c1;a=(tau<0.?0.:1.)*(b>=1.?uA.x*bA:1.);}',
'  else if(uMode==2){',   // the spill: world-anchored, recedes into the border band and lands as it
'    float e=eio(clamp((uT-uTb.x-aT0.z)/1.4,0.,1.));vec2 w=mix(aD.xy,aT0.xy,e);pos=W2S(w);r=max(aD.z*uCam.z,uG.y)*mix(1.,.7,e);',
'    col=mix(pc,uPal[int(aT0.w+.5)],sm((e-.45)/.35));a=step(uTb.z,uT)*(1.-sm((e-.7)/.3));}',
'  else{',                  // the letters: from their place in the flood to the glyph, then gone into the DOM text
'    float e=eio(clamp((uT-uG.z-aT0.z)/1.1,0.,1.));pos=mix(W2S(aD.xy),aT0.xy,e);float o=1.-sm((uT-uG.w-aT0.z*1.6)/.55);',
'    r=mix(max(2.2,uG.y),aD.z,e)*o;col=pc;a=step(uTb.z,uT)*step(.001,o);}',
'  float asp=1.+.28*h1(id*1.3+.5);float ro=6.2831*h1(id*2.1+.9);vSh=vec3(cos(ro),sin(ro),asp);',
'  float pad=1.2/uDpr;float hs=r*1.3+pad;vQ=aQ*(hs/max(r,1e-3));vPx=r*uDpr;vCol=col;vA=a;',
'  vec2 P=pos+aQ*hs;if(a<=.002||r<=.02){gl_Position=vec4(2.,2.,2.,1.);return;}',
'  gl_Position=vec4(P.x/uView.x*2.-1.,1.-P.y/uView.y*2.,0.,1.);}'].join('\n');
var FS_DOT=['#version 300 es','precision highp float;','in vec2 vQ;in vec3 vCol;in float vA;in float vPx;in vec3 vSh;out vec4 o;',
'void main(){vec2 q=vec2(vSh.x*vQ.x+vSh.y*vQ.y,-vSh.y*vQ.x+vSh.x*vQ.y);q.x/=vSh.z;float d=length(q);',
'  float ang=atan(q.y,q.x);d*=1.+.05*sin(ang*3.+vSh.x*7.)+.03*sin(ang*5.+vSh.y*5.);',
'  float aa=1.3/max(vPx,.6);float al=clamp((1.-d)/aa+.5,0.,1.)*vA;if(al<=.003)discard;',
'  float sh=1.+.05*(1.-d)-.04*q.y*step(6.,vPx);o=vec4(vCol*sh*al,al);}'].join('\n');
var VS_Q=['#version 300 es','precision highp float;','layout(location=0) in vec2 aQ;uniform vec4 uRect;uniform vec2 uView;out vec2 vUV;',
'void main(){vUV=aQ*.5+.5;vec2 P=uRect.xy+vUV*uRect.zw;gl_Position=vec4(P.x/uView.x*2.-1.,1.-P.y/uView.y*2.,0.,1.);}'].join('\n');
var FS_Q=['#version 300 es','precision highp float;','in vec2 vUV;out vec4 o;uniform int uMode;uniform sampler2D uTex,uMap;uniform float uT;uniform vec4 uP;uniform vec3 uBeige;uniform vec2 uBW;',
'void main(){',
'  if(uMode==0){vec3 c=texture(uTex,vUV).rgb;float tb=uP.x+texture(uMap,vUV).r*(uP.y-uP.x);float a=clamp((tb-uT)/.05,0.,1.)*uP.z;o=vec4(c*a,a);return;}',
'  vec2 bw=uBW;bool band=any(lessThan(vUV,bw))||any(greaterThan(vUV,1.-bw));vec2 ui=clamp(vUV,bw+.003,1.-bw-.003);',
'  vec3 im=texture(uTex,vUV).rgb;if(band){vec3 inner=texture(uTex,ui,2.).rgb;im=mix(inner,im,uP.w);}',
'  vec3 gr=mix(uBeige,textureLod(uTex,ui,5.5).rgb*.94,uP.y);vec3 c=mix(gr,im,uP.x);o=vec4(c*uP.z,uP.z);}'].join('\n');

function GL(){var c=cv(4,4),gl=c.getContext('webgl2',{premultipliedAlpha:true,alpha:true,antialias:false,depth:false,stencil:false,preserveDrawingBuffer:false});if(!gl)return null;
  function sh(t,s){var o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS)){console.warn(gl.getShaderInfoLog(o));return null;}return o;}
  function prog(v,f){var p=gl.createProgram(),a=sh(gl.VERTEX_SHADER,v),b=sh(gl.FRAGMENT_SHADER,f);if(!a||!b)return null;gl.attachShader(p,a);gl.attachShader(p,b);gl.linkProgram(p);
    if(!gl.getProgramParameter(p,gl.LINK_STATUS)){console.warn(gl.getProgramInfoLog(p));return null;}var U={},n=gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS);
    for(var i=0;i<n;i++){var inf=gl.getActiveUniform(p,i),nm=inf.name.replace(/\[0\]$/,'');U[nm]=gl.getUniformLocation(p,inf.name);}return{p:p,U:U};}
  var PD=prog(VS_DOT,FS_DOT),PQ=prog(VS_Q,FS_Q);if(!PD||!PQ)return null;
  var quad=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,quad);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  var G={gl:gl,c:c,PD:PD,PQ:PQ,quad:quad,vao:{},tex:{}};
  G.vaoQ=gl.createVertexArray();gl.bindVertexArray(G.vaoQ);gl.bindBuffer(gl.ARRAY_BUFFER,quad);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);gl.bindVertexArray(null);
  // an instanced set: D (x,y,r,pal) [+ T0 (4) + T1 (2)], each a Float32Array
  G.set=function(name,Dv,T0,T1,off){var o=G.vao[name];if(!o){o=G.vao[name]={vao:gl.createVertexArray(),b:[gl.createBuffer(),gl.createBuffer(),gl.createBuffer()]};}
    gl.bindVertexArray(o.vao);gl.bindBuffer(gl.ARRAY_BUFFER,quad);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);gl.vertexAttribDivisor(0,0);
    gl.bindBuffer(gl.ARRAY_BUFFER,o.b[0]);gl.bufferData(gl.ARRAY_BUFFER,Dv,gl.STATIC_DRAW);gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,4,gl.FLOAT,false,0,(off||0)*16);gl.vertexAttribDivisor(1,1);
    if(T0){gl.bindBuffer(gl.ARRAY_BUFFER,o.b[1]);gl.bufferData(gl.ARRAY_BUFFER,T0,gl.STATIC_DRAW);gl.enableVertexAttribArray(2);gl.vertexAttribPointer(2,4,gl.FLOAT,false,0,0);gl.vertexAttribDivisor(2,1);}
    else{gl.disableVertexAttribArray(2);gl.vertexAttrib4f(2,0,0,0,0);}
    if(T1){gl.bindBuffer(gl.ARRAY_BUFFER,o.b[2]);gl.bufferData(gl.ARRAY_BUFFER,T1,gl.STATIC_DRAW);gl.enableVertexAttribArray(3);gl.vertexAttribPointer(3,2,gl.FLOAT,false,0,0);gl.vertexAttribDivisor(3,1);}
    else{gl.disableVertexAttribArray(3);gl.vertexAttrib2f(3,0,0);}
    gl.bindVertexArray(null);o.n=Dv.length/4-(off||0);return o;};
  // a second view of the painting dots' buffer, starting after the travellers (WebGL has no base instance)
  G.view=function(name,src,off,n){var s=G.vao[src],o=G.vao[name]||(G.vao[name]={vao:gl.createVertexArray(),b:[]});gl.bindVertexArray(o.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER,quad);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);gl.vertexAttribDivisor(0,0);
    gl.bindBuffer(gl.ARRAY_BUFFER,s.b[0]);gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,4,gl.FLOAT,false,0,off*16);gl.vertexAttribDivisor(1,1);
    gl.disableVertexAttribArray(2);gl.vertexAttrib4f(2,0,0,0,0);gl.disableVertexAttribArray(3);gl.vertexAttrib2f(3,0,0);gl.bindVertexArray(null);o.n=n;o.off=off;return o;};
  G.texture=function(name,src,o){o=o||{};var t=G.tex[name]||(G.tex[name]=gl.createTexture());gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);
    gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL,gl.NONE);
    try{gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,src);}catch(e){gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([128,128,128,255]));}
    var mip=!!o.mip;if(mip)gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,o.nearest?gl.NEAREST:mip?gl.LINEAR_MIPMAP_LINEAR:gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,o.nearest?gl.NEAREST:gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    if(mip){var ext=gl.getExtension('EXT_texture_filter_anisotropic');if(ext)gl.texParameterf(gl.TEXTURE_2D,ext.TEXTURE_MAX_ANISOTROPY_EXT,4);}return t;};
  return G;}

// ---------------------------------------------------------------- data: decode the dot textures once (pixels → Float32 instance arrays)
function pixels(im){if(!ok(im))return null;var c=cv(im.naturalWidth,im.naturalHeight),q=c.getContext('2d',{willReadFrequently:true});q.drawImage(im,0,0);try{return q.getImageData(0,0,c.width,c.height).data;}catch(e){return null;}}
function decode(S,imD,imT){var N=DATA.N,NT=DATA.NT,d=pixels(imD),t=pixels(imT);if(!d||!t||!N)return false;
  var Dv=new Float32Array(N*4);for(var i=0;i<N;i++){var a=i*8;Dv[i*4]=(d[a]*256+d[a+1])/16;Dv[i*4+1]=(d[a+2]*256+d[a+4])/16;Dv[i*4+2]=d[a+5]/20;Dv[i*4+3]=d[a+6];}
  var T0=new Float32Array(NT*4),T1=new Float32Array(NT*2);
  for(i=0;i<NT;i++){var b=i*16;T0[i*4]=(t[b]*256+t[b+1])/16;T0[i*4+1]=(t[b+2]*256+t[b+4])/16;T0[i*4+2]=(t[b+5]*256+t[b+6])/1000;T0[i*4+3]=t[b+13];
    T1[i*2]=(t[b+8]*256+t[b+9])/32767.5-1;T1[i*2+1]=(t[b+10]*256+t[b+12])/32767.5-1;}
  S.Dv=Dv;S.T0=T0;S.T1=T1;
  // bins (80 px) of the dots, for the spill's colours: interior dots, and border dots separately
  var B=80,nx=Math.ceil(PW/B),ny=Math.ceil(PH/B),bi=[],bb=[];for(i=0;i<nx*ny;i++){bi.push([]);bb.push([]);}
  for(i=0;i<N;i+=3){var x=Dv[i*4],y=Dv[i*4+1],k=Math.min(ny-1,y/B|0)*nx+Math.min(nx-1,x/B|0),band=Dv[i*4+3]>=32;(band?bb:bi)[k].push(Dv[i*4+3]%32);}
  S.bins={B:B,nx:nx,ny:ny,i:bi,b:bb};return true;}
// NOTE: 16-bit values are packed as (hi, lo) in consecutive channels across the 2 px (RGB RGB): x = px0.R,G · y = px0.B, px1.R · r = px1.G · pal = px1.B.
// (index a+3 / b+3 etc. are alpha bytes of the RGBA readback and are skipped.)

function binPal(S,x,y,border,r){var Bn=S.bins,cx=Math.max(0,Math.min(Bn.nx-1,x/Bn.B|0)),cy=Math.max(0,Math.min(Bn.ny-1,y/Bn.B|0));
  for(var rad=0;rad<4;rad++){var L=(border?Bn.b:Bn.i)[Math.max(0,Math.min(Bn.ny-1,cy+(rad?Math.round((r()-.5)*2*rad):0)))*Bn.nx+Math.max(0,Math.min(Bn.nx-1,cx+(rad?Math.round((r()-.5)*2*rad):0)))];
    if(L&&L.length)return L[(r()*L.length)|0];}return 0;}

// ---------------------------------------------------------------- the spill (world-anchored, per layout) and its landing places in the border band
function buildSpill(S,G){var r=EH.util.rng(311),far=farCam(G),k=far.k,out=[],tg=[];
  function add(x,y,rad){var cx=Math.max(BW+12,Math.min(PW-BW-12,x)),cy=Math.max(BW+12,Math.min(PH-BW-12,y));
    var along=(r()-.5)*160;if(cx===x)cx=Math.max(BW+12,Math.min(PW-BW-12,cx+along));else cy=Math.max(BW+12,Math.min(PH-BW-12,cy+along));
    var pal=binPal(S,cx,cy,false,r);
    // landing: the nearest point of the canvas edge, inside the painted border band
    var bx=Math.max(0,Math.min(PW,x)),by=Math.max(0,Math.min(PH,y)),inset=r()*BW*.9+1;
    var dl=bx,dr=PW-bx,dt=by,db=PH-by,m=Math.min(dl,dr,dt,db);if(m===dl)bx=inset;else if(m===dr)bx=PW-inset;else if(m===dt)by=inset;else by=PH-inset;
    var dist=Math.max(0,Math.max(-x,x-PW,-y,y-PH));
    out.push(x,y,rad,pal);tg.push(bx,by,.25*r()+.15*Math.min(1,dist/1200),binPal(S,bx,by,true,r));}
  // near the edge: as fine as the painting's own dots (so it fuses with it), coarser outwards (world spacing 4.4 → 17 main px)
  for(var d=1.5;d<420;){var sp=4.4+d*.03,per=2*(PW+PH)+8*d;for(var s=0;s<per;s+=sp){var u=s+r()*sp*.8,x,y,j=(r()-.5)*sp*.8,dd=d+j;
      if(u<PW+2*dd){x=u-dd;y=-dd;}else if(u<PW+PH+4*dd){x=PW+dd;y=u-(PW+2*dd)-dd;}else if(u<2*PW+PH+6*dd){x=PW+dd-(u-(PW+PH+4*dd));y=PH+dd;}else{x=-dd;y=PH+dd-(u-(2*PW+PH+6*dd));}
      add(x,y,sp*.62*(.85+.3*r()));}d+=sp;}
  // the rest of the page at the far camera: screen spacing ~5 px (the letters' areas stay free for the glyph dots)
  var ps=Math.max(4.4,Math.min(6,Math.sqrt(G.W*G.H/42000))),x0=-far.o[0]/k,y0=-far.o[1]/k,ws=ps/k,edge=420;
  for(var sy=0;sy<G.H+ps;sy+=ps)for(var sx=0;sx<G.W+ps;sx+=ps){var X=(sx+r()*ps*.9-far.o[0])/k,Y=(sy+r()*ps*.9-far.o[1])/k;
    if(X>-edge&&X<PW+edge&&Y>-edge&&Y<PH+edge)continue;add(X,Y,ws*.6*(.85+.3*r()));}
  S.spillN=out.length/4;return{D:new Float32Array(out),T0:new Float32Array(tg)};}

// ---------------------------------------------------------------- the letters: the room's title and label as dots (glyph masks from the laid-out DOM text)
function glyphs(ctx,G){var S=ctx.state,out=[],tg=[],r=EH.util.rng(97),far=farCam(G),i=ctx.to.idx;placeLabel(ctx);
  var wall=hex(ctx.to.wall),wl=lum(wall),pal=DATA.pal||[],good=[];pal.forEach(function(c,j){var L=lum(c),cr=(Math.max(L,wl)+.05)/(Math.min(L,wl)+.05);good.push([cr,j]);});
  good.sort(function(a,b){return b[0]-a[0];});var pick=good.filter(function(g){return g[0]>=3.2;}).map(function(g){return g[1];});if(pick.length<4)pick=good.slice(0,6).map(function(g){return g[1];});
  ['era'+i,'lab'+i].forEach(function(id){var el=document.getElementById(id);if(!el)return;var items=[],tw=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),n,rg=document.createRange();
    while((n=tw.nextNode())){var s=n.nodeValue;if(!s||!s.trim())continue;var pe=n.parentElement,cs=getComputedStyle(pe);if(cs.display==='none'||cs.visibility==='hidden')continue;
      var font=cs.fontStyle+' '+cs.fontWeight+' '+cs.fontSize+' '+cs.fontFamily,fs=parseFloat(cs.fontSize),vert=/vertical/.test(cs.writingMode);
      for(var c=0;c<s.length;c++){var ch=s[c];if(/\s/.test(ch))continue;rg.setStart(n,c);rg.setEnd(n,c+1);var b=rg.getBoundingClientRect();if(b.width<1||b.height<1)continue;items.push({ch:ch,b:b,font:font,fs:fs,v:vert});}}
    if(!items.length)return;var x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;items.forEach(function(it){x0=Math.min(x0,it.b.left);y0=Math.min(y0,it.b.top);x1=Math.max(x1,it.b.right);y1=Math.max(y1,it.b.bottom);});
    x0-=4;y0-=4;x1+=4;y1+=4;var sc=3,c=cv((x1-x0)*sc,(y1-y0)*sc),q=c.getContext('2d',{willReadFrequently:true});q.scale(sc,sc);q.translate(-x0,-y0);q.fillStyle='#fff';q.textAlign='center';q.textBaseline='middle';
    items.forEach(function(it){q.font=it.font;var w=q.measureText(it.ch).width,cx=it.v?it.b.left+it.b.width/2:it.b.left+Math.min(it.b.width,w)/2,cy=it.v?it.b.top+Math.min(it.b.height,it.fs)/2:it.b.top+it.b.height/2;q.fillText(it.ch,cx,cy);});
    var px=q.getImageData(0,0,c.width,c.height).data,cw=c.width;
    // pitch by text size: the big title in coarser dots, the small label text in fine ones
    var big=id.charAt(0)==='e';
    var groups=big?[{p:Math.max(1.6,Math.min(3.2,(items[0].fs||40)/22)),min:22},{p:1.25,max:22}]:[{p:1.2}];
    groups.forEach(function(gp){var pch=gp.p,rad=pch*.62;
      for(var y=y0;y<y1;y+=pch)for(var x=x0;x<x1;x+=pch){var X=x+(r()-.5)*pch*.7,Y=y+(r()-.5)*pch*.7,ix=((X-x0)*sc)|0,iy=((Y-y0)*sc)|0;if(ix<0||iy<0||ix>=cw||iy>=c.height)continue;
        if(px[(iy*cw+ix)*4+3]<110)continue;
        // which size group is this pixel in (the h1 vs. the caption lines)?
        var it=null;for(var m=0;m<items.length;m++){var bb=items[m].b;if(X>=bb.left-1&&X<=bb.right+1&&Y>=bb.top-1&&Y<=bb.bottom+1){it=items[m];break;}}
        if(!it)continue;if(gp.min&&it.fs<gp.min)continue;if(gp.max&&it.fs>=gp.max)continue;
        var a=r()*6.283,dd=24+r()*70,ox=X+Math.cos(a)*dd,oy=Y+Math.sin(a)*dd;
        out.push((ox-far.o[0])/far.k,(oy-far.o[1])/far.k,rad,pick[(r()*pick.length)|0]);tg.push(X,Y,r()*.4,0);}});});
  S.glyphN=out.length/4;return{D:new Float32Array(out),T0:new Float32Array(tg)};}

// the label hangs where the core will put it (core hangLabels)
function placeLabel(ctx){var l=document.getElementById('lab'+ctx.to.idx);if(!l)return;var r=ctx.to.rect,fp=r.fp||0,f={left:r.x-fp,right:r.x+r.w+fp,bottom:r.y+r.h+fp};
  var W=innerWidth,Hh=innerHeight,wide=W>1180,h=l.offsetHeight,w=l.offsetWidth,g=W<=560?16:36,ft=document.querySelector('.foot'),footTop=ft?ft.getBoundingClientRect().top:Hh-80;
  var land=W<=980&&Hh<520&&W>Hh,x,y;
  if(wide){x=Math.round(f.right+34);y=Math.round(Math.max(64,Math.min(f.bottom-h,footTop-24-h)));}
  else if(land){var eb=document.getElementById('era'+ctx.to.idx);eb=eb?eb.getBoundingClientRect():null;x=Math.round(W*.58+24);y=Math.round((eb?eb.bottom:40)+14);}
  else{x=Math.round(Math.min(Math.max(f.left,g),W-g-w));y=Math.round(f.bottom+16);}
  var xs=x+'px',ys=y+'px';if(l.style.left!==xs)l.style.left=xs;if(l.style.top!==ys)l.style.top=ys;}

// ---------------------------------------------------------------- the visitor, the bench and the light on the floor (vector silhouettes, metres; feet at 0, up is −y)
function visitor(g){g.beginPath();
  g.ellipse(0,-1.585,.098,.118,0,0,Math.PI*2);                                   // head
  g.moveTo(-.05,-1.47);g.lineTo(.05,-1.47);g.lineTo(.06,-1.43);                     // neck
  g.quadraticCurveTo(.2,-1.42,.225,-1.33);g.lineTo(.24,-1.02);g.quadraticCurveTo(.25,-.88,.215,-.8);   // right shoulder, arm
  g.lineTo(.2,-.66);g.lineTo(.13,-.66);g.lineTo(.12,-.02);g.quadraticCurveTo(.16,0,.17,.012);g.lineTo(.03,.012);g.lineTo(.03,-.6);  // coat hem, right leg
  g.lineTo(-.03,-.6);g.lineTo(-.03,.012);g.lineTo(-.17,.012);g.quadraticCurveTo(-.16,0,-.12,-.02);g.lineTo(-.13,-.66);g.lineTo(-.2,-.66);  // left leg
  g.lineTo(-.215,-.8);g.quadraticCurveTo(-.25,-.88,-.24,-1.02);g.lineTo(-.225,-1.33);g.quadraticCurveTo(-.2,-1.42,-.06,-1.43);g.closePath();g.fill();}
function bench(g){g.fillRect(-.8,-.46,1.6,.07);g.fillRect(-.74,-.4,.07,.4);g.fillRect(.67,-.4,.07,.4);g.fillRect(-.74,-.22,1.48,.035);}
function drawRoom(g,ctx,G,c,t){var a=sm(seg(t,T.bench))*(1-sm(seg(t,T.benchOut)));if(a<=.002)return;var rc=c.rect,ppm=rc.h/2.076,fw=sm(seg(t,T.fwd));
  var yb=rc.y+rc.h,yf=yb+.62*ppm,cx=rc.x+rc.w/2,rise=(1-eo(seg(t,T.bench)))*.2*ppm,drop=fw*fw*G.H*.35,par=1+fw*.5;
  var dark=ctx.to.ink==='light';g.save();
  // the light pool on the floor
  g.globalAlpha=a;g.translate(cx,yf+.28*ppm+drop*.6);g.scale(rc.w*.78,.55*ppm);var gr=g.createRadialGradient(0,0,0,0,0,1);
  gr.addColorStop(0,dark?'rgba(255,242,220,.13)':'rgba(0,0,0,.08)');gr.addColorStop(1,dark?'rgba(255,242,220,0)':'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(-1,-1,2,2);g.restore();
  g.save();g.globalAlpha=a*.94;g.fillStyle=dark?'#121115':'#2a2729';
  g.save();g.translate(rc.x+rc.w*.2,yf+.06*ppm+rise+drop);var s=ppm*1.03*par;g.scale(s,s);visitor(g);g.restore();
  g.save();g.translate(cx+rc.w*.13,yf+.42*ppm+rise*1.3+drop*1.35);s=ppm*1.12*par*1.08;g.scale(s,s);bench(g);g.restore();
  g.restore();}

// ---------------------------------------------------------------- DOM: the previous room's overlay layers fade with its picture; restored when we leave
var touched=[],watching=false,myIdx=-1;
function fadeOld(a){document.querySelectorAll('canvas.ovl').forEach(function(c){if(c.style.display==='none'||c.__pi)return;var v=a>=.999?'':a.toFixed(3);if(c.style.opacity!==v){c.style.opacity=v;if(touched.indexOf(c)<0){touched.push(c);watch();}}});}
function restore(){touched.forEach(function(c){c.style.opacity='';});touched=[];}
function watch(){if(watching)return;watching=true;(function loop(){var st=window.EH&&EH.debug&&EH.debug.state;if(!st||st.idx!==myIdx||st.phase!=='enter'){restore();watching=false;return;}requestAnimationFrame(loop);})();}

// ================================================================== the module
var MOD={
  duration:D,musicAt:.5,
  assets:['t_dots.png','t_trav.png','t_strokes.png'],
  init:function(ctx){var S=ctx.state;myIdx=ctx.to.idx;S.ok=false;S.lod=1;
    S.gl=GL();if(!S.gl){console.warn('postimpressionism: no WebGL2, simple fallback');return;}
    if(!decode(S,ctx.asset('t_dots.png'),ctx.asset('t_trav.png'))){console.warn('postimpressionism: dot data missing');return;}
    var X=S.gl,NT=DATA.NT,N=DATA.N;X.set('trav',S.Dv.subarray(0,NT*4),S.T0,S.T1);X.set('dots',S.Dv,null,null,0);X.view('rest','dots',NT,N-NT);
    X.texture('seurat',ctx.to.image,{mip:true});X.texture('map',ctx.asset('t_strokes.png'),{nearest:true});
    S.ok=true;ensure(ctx,S);
    // glyphs again once the fonts are in (metrics change)
    if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){S.glyKey=null;});
    warmUp(ctx,S);},
  draw:function(p,ctx){var g=ctx.g,S=ctx.state,W=ctx.W,H=ctx.H,t=p*D,R=ctx.to.rect,F=ctx.from;myIdx=ctx.to.idx;var fw=hex(F?F.wall:'#000'),tw=hex(ctx.to.wall);
    var warm=S.warm;
    if(!warm){var ink=t<T.ink?(F?F.ink:'light'):ctx.to.ink;if(S.inkNow!==ink){ctx.ui.ink(ink);S.inkNow=ink;}var wc=t<T.ink&&F?F.wall:ctx.to.wall;if(S.wallNow!==wc){ctx.ui.wall(wc);S.wallNow=wc;}
      var ch=!(t>=T.chromeOff&&t<T.chromeOn);if(S.chNow!==ch){ctx.ui.chrome(ch);S.chNow=ch;}
      ctx.ui.title(ctx.to.idx,t>=T.title);var lo=t>=T.label;ctx.ui.label(ctx.to.idx,lo);if(lo)placeLabel(ctx);
      fadeOld(1-sm(seg(t,T.fromOut)));}
    if(p>=1||!S.ok){finalFrame(g,ctx,S,p);return;}
    var G=geo(ctx);ensure(ctx,S);var C=S.C,c=cam(G,t),X=S.gl,gl=X.gl,dpr=ctx.dpr||1;
    // ===== the wall: Monet's room, then (under the wheel) this room's
    var wl=sm(seg(t,T.wall));g.fillStyle=mixc(fw,tw,wl);g.fillRect(0,0,W,H);
    var fo=1-sm(seg(t,T.fromOut));
    if(F){wash(g,W,H,F.rect,F.ink==='dark',1-wl);if(F.frame!=='fade')drawShadow(g,C.shFr,C.shFr.a*fo);frameDeco(g,F.rect,F.frame,fo);}
    wash(g,W,H,R,ctx.to.ink==='dark',sm(seg(t,T.wash)));if(ctx.to.frame==='none')drawShadow(g,C.shTo,.6*sm(seg(t,T.shadow)),c.rect);
    // ===== GL
    var cw=Math.round(W*dpr),chh=Math.round(H*dpr);if(X.c.width!==cw||X.c.height!==chh){X.c.width=cw;X.c.height=chh;}
    gl.viewport(0,0,cw,chh);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
    var sd=(DATA.spacing||4.4)*c.k*dpr,imgA=t>=T.zoom[1]?1:sm((3.4-sd)/1.4),bA=sm(seg(t,T.border));
    // Monet, stroke by stroke
    var Q=X.PQ;gl.useProgram(Q.p);gl.bindVertexArray(X.vaoQ);gl.uniform2f(Q.U.uView,W,H);gl.uniform3f(Q.U.uBeige,BEIGE[0],BEIGE[1],BEIGE[2]);gl.uniform1f(Q.U.uT,t);
    gl.uniform1i(Q.U.uTex,0);gl.uniform1i(Q.U.uMap,1);
    if(F&&t<T.fromOut[1]+.5){var R0=F.rect;gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,X.tex.monet);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,X.tex.map);
      gl.uniform1i(Q.U.uMode,0);gl.uniform4f(Q.U.uRect,R0.x,R0.y,R0.w,R0.h);gl.uniform4f(Q.U.uP,DATA.S0,DATA.S1,1,0);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);}
    // Seurat's ground (canvas → the blurred picture) and, once the dots are too fine, the picture itself
    var gA=sm(seg(t,T.ground));if(gA>0){gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,X.tex.seurat);gl.uniform1i(Q.U.uMode,1);
      gl.uniform4f(Q.U.uRect,c.rect.x,c.rect.y,c.rect.w,c.rect.h);gl.uniform4f(Q.U.uP,imgA,sm((G.lnz0-c.L)/(G.lnz0-Math.log(6))),gA,bA);gl.uniform2f(Q.U.uBW,BW/PW,BW/PH);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);}
    // dots
    var P=X.PD,U=P.U;gl.useProgram(P.p);gl.uniform2f(U.uView,W,H);gl.uniform1f(U.uDpr,dpr);gl.uniform1f(U.uT,t);gl.uniform3f(U.uCam,c.o[0],c.o[1],c.k);
    var R0m=G.R0;gl.uniform4f(U.uMon,R0m.x,R0m.y,R0m.w,R0m.h);gl.uniform3f(U.uWheel,G.wc[0],G.wc[1],G.wr);gl.uniform3f(U.uR,G.rM,G.rW,S.lodR||1);
    gl.uniform4f(U.uTs,T.sort[0],T.sort[1],T.sort[2],T.burst[0]);gl.uniform4f(U.uTb,T.retreat[0],T.burst[2],T.tf,BW);gl.uniform4f(U.uA,1-imgA,bA,0,0);
    var spin=.55*sm(seg(t,T.spin));gl.uniform4f(U.uG,spin,Math.max(.6,1.1/dpr),T.glyph[0],T.glyphOut[0]);gl.uniform3fv(U.uPal,C.pal);gl.uniform3fv(U.uPure,C.pure);gl.uniform2f(U.uCh,CH_AIR,sm((sd-4)/16));
    gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,X.tex.monet);gl.uniform1i(U.uMonTex,0);
    var dotsOn=imgA<.999;
    if(t>=T.tf&&dotsOn){var V=X.vao.rest,n=Math.max(0,Math.min(V.n,Math.round((DATA.N*S.lod)-DATA.NT)));gl.uniform1i(U.uMode,0);gl.uniform1f(U.uIdOff,DATA.NT);gl.bindVertexArray(V.vao);gl.drawArraysInstanced(gl.TRIANGLE_STRIP,0,4,n);}
    if(t>=DATA.ticks[0]-.01&&(t<T.tf+.01||dotsOn)){gl.uniform1i(U.uMode,1);gl.uniform1f(U.uIdOff,0);gl.bindVertexArray(X.vao.trav.vao);gl.drawArraysInstanced(gl.TRIANGLE_STRIP,0,4,DATA.NT);}
    if(t>=T.tf&&t<T.retreat[1]+.6){gl.uniform1i(U.uMode,2);gl.uniform1f(U.uIdOff,500000);gl.bindVertexArray(X.vao.spill.vao);gl.drawArraysInstanced(gl.TRIANGLE_STRIP,0,4,S.spillN);}
    if(t>=T.tf&&t<T.glyphOut[1]+.8&&S.glyphN){gl.uniform1i(U.uMode,3);gl.uniform1f(U.uIdOff,900000);gl.bindVertexArray(X.vao.gly.vao);gl.drawArraysInstanced(gl.TRIANGLE_STRIP,0,4,S.glyphN);}
    gl.bindVertexArray(null);
    g.drawImage(X.c,0,0,W,H);
    // ===== the visitor and the bench in front
    drawRoom(g,ctx,G,c,t);
    // ===== the exact hung picture takes over (same resampling as the DOM)
    var fa=sm(seg(t,T.fin));if(fa>0){g.globalAlpha=fa;g.drawImage(C.art,R.x,R.y,R.w,R.h);g.globalAlpha=1;}
    if(!warm&&F&&t<T.fromOut[1]){var rr=window.EH_SHARED&&window.EH_SHARED.impressionismRest;if(rr&&fo>0){g.save();g.globalAlpha=fo;try{rr(g,{W:W,H:H,rect:F.rect,dpr:dpr,t:0});}catch(e){}g.restore();}}
    if(!warm)adapt(ctx,S,t);},
  done:function(ctx){restore();},
  rest:function(ctx){}
};
function finalFrame(g,ctx,S,p){var W=ctx.W,H=ctx.H,R=ctx.to.rect;if(!S.ok&&p<1){   // no WebGL2 / no data: a plain cross-fade
    var F=ctx.from;g.fillStyle=ctx.to.wall;g.fillRect(0,0,W,H);if(F&&p<.5){g.globalAlpha=1-p*2;g.fillStyle=F.wall;g.fillRect(0,0,W,H);g.drawImage(F.image,F.rect.x,F.rect.y,F.rect.w,F.rect.h);g.globalAlpha=1;}
    g.globalAlpha=sm((p-.4)/.6);g.drawImage(ctx.to.image,R.x,R.y,R.w,R.h);g.globalAlpha=1;return;}
  var G=geo(ctx);ensure(ctx,S);g.fillStyle=ctx.to.wall;g.fillRect(0,0,W,H);wash(g,W,H,R,ctx.to.ink==='dark',1);if(ctx.to.frame==='none')drawShadow(g,S.C.shTo,.6);g.drawImage(S.C.art,R.x,R.y,R.w,R.h);}
// frame time → level of detail: fewer painting dots (larger, same coverage) if the machine can't keep up while they are on screen
function adapt(ctx,S,t){if(!ctx.playing||t<T.tf||t>T.zoom[1])return;var dt=ctx.dt||0;if(!dt)return;S.ft=S.ft==null?dt:S.ft*.9+dt*.1;S.fn=(S.fn||0)+1;
  if(S.fn>24&&S.ft>1/40&&S.lod>.3){S.lod=Math.max(.3,S.lod*.75);S.lodR=Math.sqrt(1/S.lod);S.fn=0;S.ft=null;console.info('postimpressionism: LOD',S.lod.toFixed(2));}}
EH.transition('postimpressionism',MOD);
window.EH_SHARED=window.EH_SHARED||{};
// this room keeps no extras on the wall at rest (the picture alone): the next room starts from wall + picture
window.EH_SHARED.postimpressionismRest=function(g,o){};

// ---------------------------------------------------------------- caches per layout
function ensure(ctx,S){var G=geo(ctx),dpr=ctx.dpr||1;if(S.C&&S.C.key===G.key&&S.glyKey)return;var C=S.C&&S.C.key===G.key?S.C:{key:G.key};
  if(!C.art){C.art=artCanvas(ctx.to.image,G.R,dpr);C.shTo=shadowCache(dpr,G.R);if(ctx.from){C.fromArt=artCanvas(ctx.from.image,ctx.from.rect,dpr);C.shFr=shadowCache(dpr,ctx.from.rect,ctx.from.frame);}
    var pal=new Float32Array(72);(DATA.pal||[]).forEach(function(c,i){pal[i*3]=c[0]/255;pal[i*3+1]=c[1]/255;pal[i*3+2]=c[2]/255;});C.pal=pal;var pu=new Float32Array(72);(DATA.pure||DATA.pal||[]).forEach(function(c,i){pu[i*3]=c[0]/255;pu[i*3+1]=c[1]/255;pu[i*3+2]=c[2]/255;});C.pure=pu;
    if(S.ok){var X=S.gl;if(C.fromArt)X.texture('monet',C.fromArt);else X.texture('monet',cv(2,2));var sp=buildSpill(S,G);X.set('spill',sp.D,sp.T0,null);}}
  S.C=C;
  if(S.ok&&S.glyKey!==G.key){var gy=glyphs(ctx,G);if(gy.D.length)S.gl.set('gly',gy.D,gy.T0,null);S.glyKey=G.key;}}
// every draw path once on a scratch canvas before the passage plays (shader compile, texture uploads, first-use costs)
function warmUp(ctx,S){var dpr=ctx.dpr||1,c=cv(ctx.W*dpr,ctx.H*dpr),q=c.getContext('2d'),w=Object.assign({},ctx,{g:q}),P=[.02,.2,.3,.42,.5,.62,.75,.8,.85,.9,.97];
  (function step(){if(!P.length){S.warm=null;return;}var p=P.shift();S.warm={g:q};try{q.setTransform(dpr,0,0,dpr,0,0);MOD.draw(p,w);}catch(e){console.error(e);}S.warm=null;setTimeout(step,20);})();}
})();

;
/* Special exhibit "calling" (巴洛克 · 光落在谁身上).
   A beam of light enters from a "window" handle at the top right of the hung painting. Drag the window: the beam follows
   the pointer, and whoever it hits is "called" (the figure lifts out of the dark and gets a name tag). Release: the beam
   eases back to Caravaggio's direction. The choice "谁是马太？" (the bearded man pointing at himself / the young man at the
   end of the table) settles a narrow beam on the chosen man and shows both readings side by side in the panel.
   Two views share one renderer: an overlay canvas inside #cw, aligned to api.artRect() (wide screens), and the whole
   painting in the panel (narrow screens, where the reading panel hides the work).
   Geometry is in main.webp pixels (room.art.w × room.art.h). Figure boxes/faces: measured by eye on main.webp, replaced
   by rooms/baroque/cut/layers.json entries when their ids name a figure. */
(function(){
'use strict';
if(!window.EH||!EH.special)return;

var IW=2400,IH=2267;
// face = [x, y, radius] (the spot the light has to reach), box = the figure (for the lift), tag = where the name goes
var FIGS=[
  {k:'christ', n:'基督',             face:[2080,852,70], box:[1960,760,2290,2200]},
  {k:'peter',  n:'彼得',             face:[1900,936,70], box:[1740,820,2080,1950]},
  {k:'youth',  n:'背对我们的佩剑青年', face:[1455,1200,72],box:[1290,1030,1560,1800]},
  {k:'boy',    n:'戴羽毛帽的少年',     face:[1100,1052,76],box:[950,880,1330,1500]},
  {k:'bearded',n:'指着自己的大胡子',   face:[760,1066,80], box:[640,920,920,1430], m:1},
  {k:'bowed',  n:'桌尾数钱的年轻人',   face:[592,1300,78], box:[360,1180,720,1520], m:1},
  {k:'old',    n:'戴眼镜的老人',       face:[536,1034,70], box:[390,900,660,1300]}
];
var AIM0=[800,1170];                 // Caravaggio's direction: the beam from the window toward the table group
var DEG=Math.PI/180,TH_MIN=92*DEG,TH_MAX=200*DEG;
var LIGHT='255,226,172',IVORY='#f3ebdd';

var CSS=
  '.cl{margin-top:14px}'+
  '.cl-hint{margin:0 0 6px!important;font-size:13.5px!important;color:var(--ink-2)}'+
  '.cl-now{margin:0 0 12px!important;font-size:14.5px!important;min-height:1.95em}'+
  '.cl-now b{font-weight:500}'+
  '.cl-view{position:relative;display:none;margin:4px auto 14px;max-width:100%}'+
  '.cl.narrow .cl-view{display:block}'+
  '.cl-cv{display:block;width:100%;height:100%;touch-action:pan-y;background:#0f0d0b}'+
  '.cl-q{margin:18px 0 2px!important;font:500 15px/1.9 var(--song)!important;color:var(--ink)}'+
  '.cl .acts{margin:0 0 6px}.cl .act{min-width:44px}'+
  '.cl-args{display:grid;grid-template-columns:1fr 1fr;gap:12px 26px;margin:10px 0 4px}'+
  '.cl-args[hidden]{display:none}'+
  '.cl-arg h4{margin:0 0 4px;font:400 14.5px/1.7 var(--song);color:var(--ink-2)}'+
  '.cl-arg p{margin:0!important;font-size:14px!important;line-height:1.85!important;color:var(--ink-2)}'+
  '.cl-arg.on h4{font-weight:500;color:var(--ink)}.cl-arg.on p{color:var(--ink)}'+
  '.cl-arg.on h4::before{content:"";display:inline-block;width:6px;height:6px;margin-right:8px;border-radius:50%;background:currentColor;vertical-align:.2em}'+
  '.cl-note{margin-top:10px!important}'+
  '@media (max-width:560px){.cl-args{grid-template-columns:1fr}}'+
  '.cl-ov{position:absolute;left:0;top:0;pointer-events:none;z-index:1}'+
  '.cl-win{position:absolute;z-index:2;width:44px;height:44px;margin:0;padding:0;border:0;border-radius:50%;background:transparent;cursor:grab;touch-action:none;-webkit-tap-highlight-color:transparent}'+
  '.cl-win::before{content:"";position:absolute;left:5px;top:5px;width:34px;height:34px;border-radius:50%;background:rgba(18,14,10,.78);box-shadow:0 0 0 1px rgba('+LIGHT+',.35)}'+
  '.cl-win i{position:absolute;left:14px;top:13px;width:16px;height:18px;border:1.5px solid rgb('+LIGHT+');border-radius:1px;box-sizing:border-box;'+
    'background:linear-gradient(rgb('+LIGHT+'),rgb('+LIGHT+')) 50% 0/1.5px 100% no-repeat,linear-gradient(rgb('+LIGHT+'),rgb('+LIGHT+')) 0 50%/100% 1.5px no-repeat,rgba('+LIGHT+',.28)}'+
  '.cl-win:hover::before,.cl-win.drag::before{background:rgba(18,14,10,.9);box-shadow:0 0 0 1.5px rgba('+LIGHT+',.8),0 0 18px 2px rgba('+LIGHT+',.35)}'+
  '.cl-win.drag{cursor:grabbing}'+
  '.cl-win:focus-visible{outline:2px solid rgb('+LIGHT+');outline-offset:2px}'+
  '.cl-win[hidden]{display:none}';

function clamp(x,a,b){return x<a?a:x>b?b:x;}
function sm(a,b,x){var t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);}
function wrapPi(a){while(a>Math.PI)a-=2*Math.PI;while(a<-Math.PI)a+=2*Math.PI;return a;}
function nb(t){return String(t==null?'':t).replace(/([㐀-鿿）》”]) (?=[0-9A-Za-z])/g,'$1 ').replace(/([0-9A-Za-z.%°]) (?=[㐀-鿿（《“])/g,'$1 ');}
function xhrJSON(url,cb){try{var x=new XMLHttpRequest();x.open('GET',url+'?t='+Date.now(),true);x.overrideMimeType('application/json');
  x.onload=function(){if(x.status===200||(x.status===0&&x.responseText)){try{cb(JSON.parse(x.responseText));}catch(e){cb(null);}}else cb(null);};
  x.onerror=function(){cb(null);};x.send();}catch(e){cb(null);}}

// ---------------------------------------------------------------- room.special: tolerant reader for the two readings
var READ_FB={
  bearded:{label:'指着自己的大胡子',text:'他左手指向自己，像在问“是我吗？”。几百年来多数观众把他看作马太；同一礼拜堂里卡拉瓦乔画的另两幅马太，也是留胡子的年长男子。'},
  bowed:{label:'桌尾数钱的年轻人',text:'有研究者认为，大胡子的手指其实指向身旁的年轻人，像在说“是他？”。年轻人低着头，手还压在钱上，没有抬眼，画的正是被召唤之前的那一刻。'}
};
function textOf(v){if(v==null)return '';if(typeof v==='string')return v;if(Array.isArray(v))return v.map(textOf).filter(Boolean).join(' ');
  if(typeof v==='object')return textOf(v.text||v.argument||v.arguments||v.args||v.why||v.reason||v.d||v.body||v.case||'');return String(v);}
function whichOf(key,label,text){var s=(key||'')+' '+(label||'');
  if(/beard|old|胡子|指着自己|traditional|传统/i.test(s))return 'bearded';
  if(/young|youth|bow|count|end|coin|年轻|少年|数钱|桌尾|低头/i.test(s))return 'bowed';
  s=text||'';if(/胡子/.test(s)&&!/年轻/.test(s))return 'bearded';if(/年轻|数钱/.test(s)&&!/胡子/.test(s))return 'bowed';return null;}
function readings(sp){var out={},src=null;
  if(sp.choice&&typeof sp.choice==='object')src=sp.choice.options||sp.choice.readings||null;   // room.json: special.choice = {q, options:[{key,label,text}]}
  if(!src)['readings','choices','options','candidates','arguments','matthew','who','sides','answers','pair'].some(function(k){if(sp[k]&&typeof sp[k]==='object'){src=sp[k];return true;}return false;});
  if(src){var items=Array.isArray(src)?src.map(function(v,i){return{k:(v&&(v.key||v.id))||'',v:v,i:i};}):Object.keys(src).map(function(k,i){return{k:k,v:src[k],i:i};});
    items.forEach(function(it){var v=it.v,label=v&&typeof v==='object'?(v.label||v.title||v.name||v.who||v.t||''):'',text=textOf(v),w=whichOf(it.k,label,text);
      if(!w)w=it.i===0&&!out.bearded?'bearded':(!out.bowed?'bowed':null);if(w&&text&&!out[w])out[w]={label:label||READ_FB[w].label,text:text,btn:v&&v.button||v&&v.short||''};});}
  ['bearded','bowed'].forEach(function(w){if(!out[w])out[w]={label:READ_FB[w].label,text:READ_FB[w].text,fb:true};});
  return out;}

EH.special('calling',function(host,room,api){
  var sp=room.special||{},art=room.art||{};
  if(art.w&&art.h){IW=art.w;IH=art.h;}
  var F={},ORDER=FIGS.map(function(f){F[f.k]=JSON.parse(JSON.stringify(f));return f.k;});
  var names=sp.names||sp.figures||{};Object.keys(names).forEach(function(k){if(F[k]&&typeof names[k]==='string')F[k].n=names[k];});
  var R=readings(sp);
  var T={
    hint:sp.hint||'拖动画面右上角的“窗”：光照到谁，谁就被召唤；松手，光回到卡拉瓦乔原来的方向。',
    hintTouch:sp.hintTouch||'用手指按住画面右上角的“窗”拖动：光照到谁，谁就被召唤；松手，光回到原来的方向。',
    q:sp.question||(sp.choice&&sp.choice.q)||'谁是马太？',
    idle:sp.idleLabel||'卡拉瓦乔的光：斜斜落在桌边这一排人身上。',
    wall:'光落在：后墙上，谁也没照到。',
    note:sp.note||'光束和窗是本展的设计，用来演示画里的光从右上方射入；人物的称呼只为指认方便。'
  };
  // ---------------------------------------------------------------- DOM
  if(!document.getElementById('cl-css')){var st=document.createElement('style');st.id='cl-css';st.textContent=CSS;document.head.appendChild(st);}
  var root=document.createElement('div');root.className='cl';
  root.innerHTML='<p class="cl-hint"></p><p class="cl-now" aria-live="polite"></p>'+
    '<div class="cl-view"><canvas class="cl-cv" role="img" aria-label="《圣马太蒙召》和一束可以移动的光"></canvas></div>'+
    '<p class="cl-q"></p>'+
    '<div class="acts" role="group"><button type="button" class="act" data-m="bearded" aria-pressed="false"></button><button type="button" class="act" data-m="bowed" aria-pressed="false"></button></div>'+
    '<div class="cl-args" hidden><div class="cl-arg" data-m="bearded"><h4></h4><p></p></div><div class="cl-arg" data-m="bowed"><h4></h4><p></p></div></div>'+
    '<p class="cl-note small"></p>';
  host.appendChild(root);
  var q=function(s){return root.querySelector(s);};
  var hintEl=q('.cl-hint'),nowEl=q('.cl-now'),view=q('.cl-view'),pc=q('.cl-cv'),pg=pc.getContext('2d'),argsEl=q('.cl-args'),noteEl=q('.cl-note');
  var mBtns=root.querySelectorAll('.acts .act');
  q('.cl-q').textContent=nb(T.q);q('.acts').setAttribute('aria-label',T.q);noteEl.textContent=nb(T.note);
  function fillReadings(){['bearded','bowed'].forEach(function(w){var b=q('.acts .act[data-m="'+w+'"]'),a=q('.cl-arg[data-m="'+w+'"]');
    b.textContent=nb(R[w].btn||R[w].label);a.querySelector('h4').textContent=nb(R[w].label);a.querySelector('p').textContent=nb(R[w].text);});}
  fillReadings();
  var mqT=window.matchMedia?matchMedia('(hover: none)'):null;function touchUI(){return !!(mqT&&mqT.matches);}
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;

  // window handles: one on the wall (inside #cw), one on the panel canvas
  function mkWin(parent){var b=document.createElement('button');b.type='button';b.className='cl-win';b.innerHTML='<i></i>';
    b.setAttribute('aria-label','窗：按住拖动，改变光的方向；也可以用上下方向键');parent.appendChild(b);return b;}
  var cw=document.getElementById('cw'),frameEl=document.getElementById('frame'),ov=null,og=null,winW=null;
  if(cw){ov=document.createElement('canvas');ov.className='cl-ov';ov.setAttribute('aria-hidden','true');cw.appendChild(ov);og=ov.getContext('2d');winW=mkWin(cw);winW.hidden=true;}
  var winP=mkWin(view);
  var buf=document.createElement('canvas'),bg=buf.getContext('2d');
  var main=api.img(art.img||'main.webp');
  function ok(i){return i&&i.complete&&i.naturalWidth>0;}

  // ---------------------------------------------------------------- state
  var S={th:null,al:7*DEG,D:.34,drag:null,key:0,keyT:0,choice:null,called:null,calledAt:0,shown:false,narrow:null,dirty:true,t0:0,lastWho:'',lastNow:''};
  var lift={};ORDER.forEach(function(k){lift[k]=0;});
  var raf=0,last=0,dead=false;

  // ---------------------------------------------------------------- geometry helpers (per view: rect in client px ↔ image px)
  var AXIS=null;   // [[x,y],[x,y]] from layers.json light.axis
  function originIn(r){var k=IW/r.width,m=Math.min(30,r.width*.09),x=(r.width-m)*k,y=m*k;   // the window: 30 CSS px in from the top-right corner…
    if(AXIS){var a=AXIS[0],b=AXIS[1],t=(x-a[0])/((b[0]-a[0])||1);y=Math.max(y,Math.min(IH*.3,a[1]+(b[1]-a[1])*t));}   // …lowered onto the painted light's axis
    return[x,y];}
  function winTop(r){return originIn(r)[1]*r.width/IW;}
  function angTo(O,p){return Math.atan2(p[1]-O[1],p[0]-O[0]);}
  function homeAngle(O){if(S.choice)return angTo(O,F[S.choice].face);if(AXIS)return Math.atan2(AXIS[1][1]-AXIS[0][1],AXIS[1][0]-AXIS[0][0]);return angTo(O,AIM0);}
  function hits(O,th,al){var best=null,bs=1e9,res={};
    ORDER.forEach(function(k){var f=F[k],d=Math.hypot(f.face[0]-O[0],f.face[1]-O[1]),rho=Math.atan2(f.face[2],d),dl=Math.abs(wrapPi(angTo(O,f.face)-th));
      var lit=1-sm(al*.55,al+rho,dl);res[k]=lit;var sc=dl/(al+rho);if(dl<al*.9+rho&&sc<bs){bs=sc;best=k;}});
    return{lit:res,best:best};}

  // ---------------------------------------------------------------- drawing (g in image px after the caller's transform)
  var MOTES=[];(function(){var s=7;function r(){s=(s*16807)%2147483647;return s/2147483647;}for(var i=0;i<46;i++)MOTES.push([r(),r()*2-1,.4+r()*1.2,r()*6.28,.3+r()*.7]);})();
  function beamPath(g,O,th,a,L){g.beginPath();g.moveTo(O[0],O[1]);g.lineTo(O[0]+Math.cos(th-a)*L,O[1]+Math.sin(th-a)*L);g.lineTo(O[0]+Math.cos(th+a)*L,O[1]+Math.sin(th+a)*L);g.closePath();}
  function drawScene(g,O,unit,now,labels,H){
    var th=S.th,al=S.al,L=Math.hypot(IW,IH)*1.2;
    // 1. the dark
    g.save();g.fillStyle='rgba(6,5,4,'+S.D.toFixed(3)+')';g.fillRect(0,0,IW,IH);
    // 2. cut the beam out of the dark (soft edges from stacked wedges)
    g.globalCompositeOperation='destination-out';
    [1.22,1.12,1.04,.97,.9,.82].forEach(function(f){g.fillStyle='rgba(0,0,0,.52)';beamPath(g,O,th,al*f,L);g.fill();});
    // 3. lift the called figures out of the dark
    ORDER.forEach(function(k){var v=lift[k];if(v<.01)return;var f=F[k],b=f.box,cx=(b[0]+b[2])/2,cy=(b[1]+b[3])/2,rx=(b[2]-b[0])*.62,ry=(b[3]-b[1])*.56;
      g.save();g.translate(cx,cy);g.scale(1,ry/rx);var gr=g.createRadialGradient(0,0,0,0,0,rx);gr.addColorStop(0,'rgba(0,0,0,'+(.9*v).toFixed(3)+')');gr.addColorStop(.65,'rgba(0,0,0,'+(.55*v).toFixed(3)+')');gr.addColorStop(1,'rgba(0,0,0,0)');
      g.fillStyle=gr;g.beginPath();g.arc(0,0,rx,0,Math.PI*2);g.fill();g.restore();});
    g.restore();
    // 4. warm light along the beam, a glow on the called faces, dust in the air
    g.save();g.globalCompositeOperation='lighter';
    var ex=O[0]+Math.cos(th)*L*.8,ey=O[1]+Math.sin(th)*L*.8,lg=g.createLinearGradient(O[0],O[1],ex,ey);
    lg.addColorStop(0,'rgba('+LIGHT+',.16)');lg.addColorStop(.45,'rgba('+LIGHT+',.07)');lg.addColorStop(1,'rgba('+LIGHT+',0)');
    g.fillStyle=lg;beamPath(g,O,th,al*.95,L);g.fill();
    ORDER.forEach(function(k){var v=lift[k];if(v<.01)return;var f=F[k],r=f.face[2]*1.9,gr=g.createRadialGradient(f.face[0],f.face[1],0,f.face[0],f.face[1],r);
      gr.addColorStop(0,'rgba('+LIGHT+','+(.2*v).toFixed(3)+')');gr.addColorStop(1,'rgba('+LIGHT+',0)');g.fillStyle=gr;g.beginPath();g.arc(f.face[0],f.face[1],r,0,Math.PI*2);g.fill();});
    var tm=reduce?0:now/1000,Lm=Math.hypot(IW,IH)*.85;
    MOTES.forEach(function(m){var t=(m[0]+tm*.012*m[4])%1,s=Math.pow(t,.8),d=Lm*s,u=Math.sin(m[3]+tm*.3*m[4])*.25+m[1]*.75,a=th+u*al*.85,x=O[0]+Math.cos(a)*d,y=O[1]+Math.sin(a)*d;
      var fade=sm(0,.08,t)*(1-sm(.75,1,t)),rr=unit*m[2];g.fillStyle='rgba(255,236,200,'+(.28*fade).toFixed(3)+')';g.beginPath();g.arc(x,y,rr,0,Math.PI*2);g.fill();});
    g.restore();
    // 5. the name of the called one
    var who=S.called;if(labels&&who&&lift[who]>.05)tag(g,F[who],unit,lift[who],H);}
  function tag(g,f,unit,a,H){var fs=13*unit,txt=f.n+(f.m?' · 马太？':''),padX=8*unit,h=fs*1.9;
    g.save();g.font='500 '+fs+'px "Noto Serif SC","Songti SC","STSong",serif';var w=g.measureText(txt).width+padX*2;
    var x=clamp(f.face[0]-w/2,6*unit,IW-w-6*unit),y=f.face[1]-f.face[2]-h-10*unit;if(y<6*unit)y=f.face[1]+f.face[2]+10*unit;y=Math.min(y,(H||IH)-h-6*unit);
    g.globalAlpha=clamp(a*1.4,0,1);g.fillStyle='rgba(14,11,8,.84)';
    if(g.roundRect){g.beginPath();g.roundRect(x,y,w,h,3*unit);g.fill();}else g.fillRect(x,y,w,h);
    g.fillStyle=IVORY;g.textBaseline='middle';g.fillText(txt,x+padX,y+h/2+unit*.5);g.restore();}

  // ---------------------------------------------------------------- views
  function coreToolOn(){return !!document.querySelector('#read .act[data-tool][aria-pressed="true"]')||!!(document.getElementById('cmpA')&&document.getElementById('cmpA').classList.contains('on'));}
  function viewerOn(){var v=document.getElementById('view');return !!(v&&v.classList.contains('on'));}
  function wallRect(){if(!cw||!frameEl||frameEl.classList.contains('hidden'))return null;var r=api.artRect();if(!r||r.width<60||r.height<40)return null;
    if(r.right<0||r.left>innerWidth)return null;var rd=document.getElementById('read'),rm=document.getElementById('room');
    if(rd&&rm&&rm.classList.contains('reading')){var rr=rd.getBoundingClientRect();if(rr.left<r.right-4&&rr.right>r.left+4&&rr.width>0)return null;}   // the panel covers the work (narrow)
    return r;}
  function wallLive(r){return !!r&&!coreToolOn()&&!viewerOn();}
  function placeWall(r){if(!ov)return;var c=cw.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2),w=Math.round(r.width*dpr),h=Math.round(r.height*dpr);
    ov.style.left=(r.left-c.left)+'px';ov.style.top=(r.top-c.top)+'px';ov.style.width=r.width+'px';ov.style.height=r.height+'px';
    if(ov.width!==w||ov.height!==h){ov.width=w;ov.height=h;}
    var m=Math.min(30,r.width*.09);winW.style.left=(r.left-c.left+r.width-m-22)+'px';winW.style.top=(r.top-c.top+winTop(r)-22)+'px';}
  function panelSize(){var w=root.clientWidth||320,h=w*IH/IW,mh=Math.max(260,innerHeight*.74);if(h>mh){h=mh;w=h*IW/IH;}
    view.style.width=Math.round(w)+'px';view.style.height=Math.round(h)+'px';var dpr=Math.min(devicePixelRatio||1,2),cwid=Math.round(w*dpr),chh=Math.round(h*dpr);
    if(pc.width!==cwid||pc.height!==chh){pc.width=cwid;pc.height=chh;}var m=Math.min(30,w*.09);winP.style.left=(w-m-22)+'px';winP.style.top=(winTop({width:w})-22)+'px';}
  function activeRect(){return S.narrow?pc.getBoundingClientRect():wallRect();}

  // ---------------------------------------------------------------- input: drag the window
  function aimAt(e){var r=activeRect();if(!r)return;var k=IW/r.width,O=originIn(r),p=[(e.clientX-r.left)*k,(e.clientY-r.top)*k];
    if(Math.hypot(p[0]-O[0],p[1]-O[1])<26*k)return;var a=angTo(O,p);if(a<0&&a<-Math.PI/2)a+=2*Math.PI;S.drag.th=clamp(a,TH_MIN,TH_MAX);}
  function down(e,btn){if(e.pointerType==='mouse'&&e.button!==0)return;e.preventDefault();e.stopPropagation();
    S.drag={id:e.pointerId,btn:btn,th:null,x:e.clientX,y:e.clientY};btn.classList.add('drag');try{btn.setPointerCapture(e.pointerId);}catch(_){}
    if(S.choice)choose(null,true);api.sfx.tick(.025);S.dirty=true;}
  function move(e){if(!S.drag||e.pointerId!==S.drag.id)return;e.stopPropagation();if(Math.hypot(e.clientX-S.drag.x,e.clientY-S.drag.y)>4)aimAt(e);S.dirty=true;}
  function up(e){if(!S.drag||(e&&e.pointerId!==S.drag.id))return;var moved=S.drag.th!=null;S.drag.btn.classList.remove('drag');S.drag=null;if(moved)api.sfx.whoosh(.03,.9);S.dirty=true;}
  function stopClick(e){e.stopPropagation();e.preventDefault();}
  var KEY={ArrowUp:1,ArrowLeft:1,ArrowDown:-1,ArrowRight:-1};   // up/left: the beam climbs toward the far end of the table
  function kdown(e){if(!(e.key in KEY))return;e.preventDefault();e.stopPropagation();if(!S.key){if(S.choice)choose(null,true);api.sfx.tick(.02);}S.key=KEY[e.key];S.dirty=true;}
  function kup(e){if(!(e.key in KEY))return;S.key=0;S.keyT=performance.now();S.dirty=true;}
  [winW,winP].forEach(function(b){if(!b)return;b.addEventListener('pointerdown',function(e){down(e,b);});b.addEventListener('pointermove',move);
    b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);b.addEventListener('lostpointercapture',up);b.addEventListener('click',stopClick);
    b.addEventListener('keydown',kdown);b.addEventListener('keyup',kup);b.addEventListener('blur',function(){S.key=0;});});

  // ---------------------------------------------------------------- the choice
  function choose(w,silent){S.choice=w;mBtns.forEach(function(b){b.setAttribute('aria-pressed',b.dataset.m===w?'true':'false');});
    root.querySelectorAll('.cl-arg').forEach(function(a){a.classList.toggle('on',a.dataset.m===w);});
    if(w){argsEl.hidden=false;S.shown=true;if(!silent)api.sfx.bell(w==='bearded'?392:440,.035);}
    S.dirty=true;}
  mBtns.forEach(function(b){b.addEventListener('click',function(){choose(S.choice===b.dataset.m?null:b.dataset.m);});});

  // ---------------------------------------------------------------- cut/layers.json: real figure boxes when they arrive
  var MAPRE=[['christ',/christ|jesus|基督/i],['peter',/peter|彼得/i],['bearded',/beard|pointing_?self|matthew_?(old|beard)|胡子/i],['bowed',/young_?man|youth_?(end|count)|count|bowed|coins?_?hands?|end_?of|年轻|数钱/i],
    ['boy',/boy|feather|少年|羽毛/i],['youth',/sword|back|seated|佩剑|背对/i],['old',/spectacle|glasses|old_?man|眼镜|老人/i]];
  var FACEID={boyFace:'boy',beardFace:'bearded',youthHead:'bowed'};
  function useLayers(j){if(!j)return false;var sx=j.W&&IW?IW/j.W:1,sy=j.H&&IH?IH/j.H:sx,n=0,list=[];
    // the painted light's axis (cut author's measurement): the window sits on it and Caravaggio's direction follows it
    var ax=j.light&&j.light.axis;if(Array.isArray(ax)&&ax.length===2&&ax[0].length===2){AXIS=[[ax[0][0]*sx,ax[0][1]*sy],[ax[1][0]*sx,ax[1][1]*sy]];n++;}
    (j.layers||[]).forEach(function(l){var k=FACEID[l.id];if(!k||l.w==null)return;var cx=l.cx!=null?l.cx:l.x+l.w/2,cy=l.cy!=null?l.cy:l.y+l.h/2;
      F[k].face=[cx*sx,cy*sy,Math.max(45,Math.min(l.w,l.h)*.6*sx)];F[k]._face=1;n++;});
    (function walk(v,key,d){if(!v||d>4)return;if(Array.isArray(v)){v.forEach(function(x){walk(x,key,d+1);});return;}if(typeof v!=='object')return;
      var b=v.box||v.bbox||v.rect,id=String(v.id||v.name||v.key||v.label||key||'');
      if(!b&&v.x!=null&&v.w!=null)b=[v.x,v.y,v.x+v.w,v.y+v.h];
      if(b&&!Array.isArray(b)&&b.x!=null)b=[b.x,b.y,b.x+(b.w||b.width),b.y+(b.h||b.height)];
      if(Array.isArray(b)&&b.length===4&&id)list.push({id:id,b:b,v:v});
      Object.keys(v).forEach(function(k){if(typeof v[k]==='object')walk(v[k],k,d+1);});})(j,'',0);
    list.forEach(function(it){var hit=null;MAPRE.some(function(m){if(m[1].test(it.id)){hit=m[0];return true;}return false;});if(!hit)return;
      var b=[it.b[0]*sx,it.b[1]*sy,it.b[2]*sx,it.b[3]*sy],f=F[hit];if(!(b[2]>b[0]&&b[3]>b[1]))return;
      if(/face|head|脸/i.test(it.id)){if(f._face)return;f.face=[(b[0]+b[2])/2,(b[1]+b[3])/2,Math.max(40,Math.min(b[2]-b[0],b[3]-b[1])*.55)];n++;}
      else if(!/hand|hat|coin|手|帽/i.test(it.id)||!f._box){if(!/hand|hat|coin|手|帽/i.test(it.id)){f.box=b;f._box=1;n++;}}});
    S.layers=n;S.dirty=true;return n>0;}
  var pollT=0,tries=0;function poll(){if(dead||++tries>40)return;xhrJSON(api.path('cut/layers.json'),function(j){if(dead)return;if(!(j&&useLayers(j)))pollT=setTimeout(poll,8000);});}
  poll();

  // ---------------------------------------------------------------- loop
  function words(){var h=touchUI()?T.hintTouch:T.hint;if(hintEl.textContent!==h)hintEl.textContent=nb(h);}
  function tick(now){if(dead)return;raf=requestAnimationFrame(tick);if(!host.isConnected){dispose();return;}
    var dt=last?Math.min((now-last)/1000,.05):0;last=now;
    var wr=wallRect(),narrow=!wr&&!!document.getElementById('room')&&document.getElementById('room').classList.contains('reading');
    if(narrow!==S.narrow){S.narrow=narrow;root.classList.toggle('narrow',narrow);S.dirty=true;}
    var live=!narrow&&wallLive(wr);
    if(winW){winW.hidden=!live;}
    var r=narrow?null:wr;
    if(narrow)panelSize();
    var rr=narrow?{width:parseFloat(view.style.width)||pc.clientWidth,height:parseFloat(view.style.height)||pc.clientHeight}:r;
    if(!rr||!rr.width){if(ov&&ov.width)og.clearRect(0,0,ov.width,ov.height);return;}
    var O=originIn(rr),home=homeAngle(O);if(S.th==null)S.th=home;
    // target angle / width / darkness
    var target=home,alT=S.choice?3.2*DEG:7*DEG,DT=S.choice?.6:.34,kd=S.key||(now-S.keyT<1400&&S.keyTh!=null);
    if(S.drag&&S.drag.th!=null){target=S.drag.th;alT=4.4*DEG;DT=.62;}
    else if(S.key){S.keyTh=clamp((S.keyTh==null?S.th:S.keyTh)+S.key*28*DEG*dt,TH_MIN,TH_MAX);target=S.keyTh;alT=4.4*DEG;DT=.62;}
    else if(kd){target=S.keyTh;alT=4.4*DEG;DT=.62;}
    else S.keyTh=null;
    var fast=S.drag&&S.drag.th!=null,tau=reduce?.06:(fast?.07:(S.choice?.55:.7)),e=1-Math.exp(-dt/tau),eb=1-Math.exp(-dt/(reduce?.06:.35));
    var dth=wrapPi(target-S.th);S.th+=dth*e;S.al+=(alT-S.al)*eb;S.D+=(DT-S.D)*eb;
    // who is lit
    var hs=hits(O,S.th,S.al),exploring=!!(S.drag&&S.drag.th!=null)||!!S.key||kd,settledChoice=S.choice&&Math.abs(dth)<4*DEG;
    var called=exploring?hs.best:(S.choice?(settledChoice?S.choice:null):null);
    if(called!==S.called){if(called&&exploring)api.sfx.tick(.03);S.called=called;}
    ORDER.forEach(function(k){var tgt=k===called?Math.max(.85,hs.lit[k]):(S.choice||exploring?0:hs.lit[k]*.35),v=lift[k];if(Math.abs(tgt-v)>.002){lift[k]=v+(tgt-v)*(1-Math.exp(-dt/(reduce?.05:.18)));}});
    // panel line
    var line;if(called)line='光落在：<b>'+F[called].n+'</b>'+(F[called].m?'（有人认为他是马太）':'');else if(exploring)line=T.wall;else if(S.choice)line='光正移向：<b>'+F[S.choice].n+'</b>';else line=T.idle;
    if(line!==S.lastNow){S.lastNow=line;nowEl.innerHTML=nb(line);}
    words();
    // draw
    if(live){placeWall(r);var dpr=ov.width/r.width,z=ov.width/IW;og.setTransform(1,0,0,1,0,0);og.clearRect(0,0,ov.width,ov.height);og.setTransform(z,0,0,z,0,0);
      drawScene(og,O,IW/r.width,now,true,IH);}
    else if(ov&&ov.width)og.clearRect(0,0,ov.width,ov.height);
    if(narrow){var z2=pc.width/IW;pg.setTransform(1,0,0,1,0,0);pg.fillStyle='#0f0d0b';pg.fillRect(0,0,pc.width,pc.height);
      if(ok(main)){pg.imageSmoothingQuality='high';pg.drawImage(main,0,0,pc.width,pc.height);}
      // the scene erases its beam out of the dark (destination-out), so it is drawn on its own buffer and laid over the painting
      if(buf.width!==pc.width||buf.height!==pc.height){buf.width=pc.width;buf.height=pc.height;}
      bg.setTransform(1,0,0,1,0,0);bg.clearRect(0,0,buf.width,buf.height);bg.setTransform(z2,0,0,pc.height/IH,0,0);drawScene(bg,O,IW/rr.width,now,true,IH);
      pg.setTransform(1,0,0,1,0,0);pg.drawImage(buf,0,0);}}
  raf=requestAnimationFrame(tick);
  function dispose(){if(dead)return;dead=true;cancelAnimationFrame(raf);clearTimeout(pollT);
    if(ov&&ov.parentNode)ov.parentNode.removeChild(ov);if(winW&&winW.parentNode)winW.parentNode.removeChild(winW);}
  host._dispose=dispose;
  // test hooks
  if(EH.debug)EH.debug.calling={state:function(){return{th:S.th/DEG,al:S.al/DEG,D:S.D,called:S.called,choice:S.choice,narrow:S.narrow,layers:S.layers||0};},
    aim:function(deg){S.drag={id:-1,btn:winP,th:deg*DEG,x:0,y:0};S.dirty=true;},aimAt:function(x,y){var r=activeRect();if(!r)return null;var O=originIn(r);var a=angTo(O,[x,y]);S.drag={id:-1,btn:winP,th:a,x:0,y:0};return a/DEG;},
    release:function(){if(S.drag){S.drag.btn.classList.remove('drag');S.drag=null;}},choose:function(w){choose(w);},layers:useLayers};
});
})();

;
/* s-contrapposto — 古希腊罗马厅的特别展项「从库罗斯到持矛者」.
   1. A contrapposto puppet in the panel: drag the hips (or a leg) sideways; the weight moves to one leg and the rig tilts hips and
      shoulders in opposite directions (pre-rigged counter-balance). Gold shoulder / hip lines, plumb line from the neck pit.
   2. 库罗斯 / 持矛者: animates the puppet between the two stances and highlights the matching column of room.special.rows.
   3. 照片对比: split view ON the hung statue (kouros left, as the wall text says), both photos registered by crown and soles, gold guides
      from room.special.guides on each half. Narrow screens (hung statue hidden while reading) get a side-by-side plate in the panel.
   4. 比例: head-length ticks (about 7) on the hung statue and on the puppet.
   5. 它原本是彩色的: restrained colour blocks (hair, brows, eyes, lips) on the hung statue + a head close-up (现状 / 复原假说示意) in the panel,
      labelled as a scholarly reconstruction hypothesis.
   Guide coordinates are in ORIGINAL main.webp / kouros.webp pixels; if the hung image is a crop, room.art.crop|cut or rooms/antiquity/cut.json
   ({dx,dy,w,h}: the crop box in original main.webp pixels) maps them. */
(function(){
'use strict';
var R2=Math.PI/180;
function clamp(x,a,b){return x<a?a:x>b?b:x;}
function lerp(a,b,t){return a+(b-a)*t;}
function nb(t){return String(t==null?'':t).replace(/([\u3400-\u9fff）》”]) (?=[0-9A-Za-z])/g,'$1\u00a0').replace(/([0-9A-Za-z.%°]) (?=[\u3400-\u9fff（《“])/g,'$1\u00a0');}   // numbers stay with their units (same rule as core)
function sm(t){t=clamp(t,0,1);return t*t*(3-2*t);}
function $(id){return document.getElementById(id);}

// ---------------------------------------------------------------- measured data (original main.webp pixels, 1802 × 2400)
var ORIG={w:1802,h:2400};
var HEADS={crown:180,sole:2215,n:7};          // crown → sole of the weight-bearing foot ≈ 7 × (crown → chin 180–470)
var TICK={x:1335,x0:560};
var KR={s:1.03,ox:900-775*1.03,oy:180-175*1.03}; // kouros.webp → main space (crown on crown, body axis on body axis)
var POLY={
  hair:[[764,300],[762,265],[775,230],[805,200],[850,181],[905,179],[950,190],[985,215],[1005,250],[1011,285],[1006,320],[999,357],[989,340],[977,322],[960,322],[949,332],[945,357],[935,352],[927,325],[915,302],[897,290],[875,281],[847,275],[815,272],[790,277],[775,290],[767,302]],
  browL:[[779,322],[790,316],[806,314],[821,318],[806,318],[791,320]],
  browR:[[836,313],[850,308],[868,307],[889,313],[868,311],[851,312]],
  eyes:[[793,341,14,6,-2,797,341,4.5],[860,326,20,8,-4,865,327,6]],   // cx,cy,rx,ry,rot°, iris x,y,r
  lips:[[816,412],[830,406],[846,408],[866,406],[861,418],[850,428],[832,430],[820,423]]
};
var PAINT={hair:'#74432a',brow:'#4a2c1c',iris:'#4a3223',pupil:'#17110d',lid:'#2b1e16',lips:'#b25a4b'};
var HEADBOX=[712,160,1072,520];   // close-up crop (original px)

var CSS='.cp{margin:18px 0 4px}'+
'.cp-stage{position:relative;margin:4px 0 0}'+
'.cp-stage canvas{display:block;width:100%;touch-action:pan-y;cursor:grab;-webkit-tap-highlight-color:transparent}'+
'.cp-stage canvas.drag{cursor:grabbing}'+
'.cp-read{margin:6px 0 0!important;font:400 14px/1.75 var(--song)!important;min-height:3.5em}'+
'.cp-read b{font-weight:500}'+
'.cp-read span{display:block;font-size:13.5px;color:var(--ink-2)}'+
'.cp-hint{margin:2px 0 0!important;font:400 13.5px/1.7 var(--song)!important;color:var(--ink-2)}'+
'.cp .acts{margin:16px 0 4px;align-items:baseline}.cp .act{min-width:44px}'+
'.cp-seg{display:inline-flex;gap:10px;align-items:baseline}'+
'.cp-seg i{font-style:normal;color:var(--ink-3)}'+
'.cp-rows{width:100%;border-collapse:collapse;margin:16px 0 4px;font:400 13.5px/1.6 var(--song)}'+
'.cp-rows th,.cp-rows td{text-align:left;vertical-align:top;padding:7px 12px 7px 8px;border-top:1px solid rgba(128,118,104,.28);transition:background-color .35s ease}'+
'.cp-rows th:first-child{padding-left:0;width:4.2em;font-weight:500}'+
'.cp-rows thead th{border-top:0;font-weight:500;padding-bottom:6px}'+
'.cp-rows .on{background:rgba(128,118,104,.13)}'+
'.cp-rows thead .on{box-shadow:inset 0 -2px 0 currentColor}'+
'.cp-note{margin:12px 0 0!important;padding-left:14px;border-left:1px solid var(--gold);font:400 13.5px/1.85 var(--song)!important}'+
'.cp-note b{font-weight:500}'+
'.cp-plate{margin:14px 0 0}'+
'.cp-plate canvas{display:block;width:100%}'+
'.cp-legend{display:flex;flex-wrap:wrap;gap:4px 16px;margin:8px 0 0;font:400 13px/1.6 var(--song);color:var(--ink-2)}'+
'.cp-legend i{display:inline-block;width:10px;height:10px;margin-right:6px;vertical-align:-1px}'+
'.cp-ov{position:absolute;left:0;top:0;z-index:2;pointer-events:none;display:none}'+
'.cp-ov.mul{mix-blend-mode:multiply}'+
'.cp-split{position:absolute;z-index:6;width:44px;margin-left:-22px;cursor:ew-resize;touch-action:none;display:none}'+
'.cp-split::before{content:"";position:absolute;left:21px;top:0;bottom:0;width:2px;background:#f7f4ee;box-shadow:0 0 0 1px rgba(0,0,0,.2)}'+
'.cp-split:focus-visible{outline:none}.cp-split:focus-visible::before{box-shadow:0 0 0 1px rgba(0,0,0,.35),0 0 0 4px rgba(176,141,87,.8)}'+
'.cp-side{position:absolute;z-index:6;font:400 13px/1.45 var(--song);color:var(--ink);pointer-events:none;display:none;white-space:nowrap;transition:opacity .2s}'+
'.cp-side small{display:block;font-size:12.5px;color:var(--ink-2)}';
function injectCSS(){if($('cp-style'))return;var s=document.createElement('style');s.id='cp-style';s.textContent=CSS;document.head.appendChild(s);}

EH.special('contrapposto',function(host,room,api){
  injectCSS();
  var sp=room.special||{},guides=sp.guides||{},art=room.art||{};
  var reduce=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
  var DPR=Math.min(window.devicePixelRatio||1,2);
  var rootCS=getComputedStyle(document.documentElement);
  var GOLD=(rootCS.getPropertyValue('--gold')||'').trim()||'#b08d57';
  var SONG='"Noto Serif SC","Songti SC","STSong",serif',DID='"Bodoni Moda","Didot","Bodoni 72",serif';
  function ink(){return getComputedStyle(host).color||'#24211d';}
  function inkA(a){var m=ink().match(/[\d.]+/g)||[36,33,29];return 'rgba('+m[0]+','+m[1]+','+m[2]+','+a+')';}

  // crop of the hung image inside the original main.webp
  var cutout=/cut/i.test(art.img||'');   // transparent statue on the wall → dark ink on the overlay, cut kouros
  var crop={dx:0,dy:0,w:art.w||ORIG.w,h:art.h||ORIG.h},kcrop={dx:0,dy:0};
  function box(c){return c&&c.w?{dx:+c.dx||0,dy:+c.dy||0,w:+c.w,h:+c.h}:null;}
  // provisional until cut.json arrives: the crop box the cut-out agent used (rooms/antiquity/cut.json, 2026-09-24)
  if(cutout&&(art.w||0)<ORIG.w){crop={dx:500,dy:112,w:art.w,h:art.h};kcrop={dx:513,dy:111};}
  var cc=box(art.crop||art.cut);if(cc)crop=cc;
  try{var xr=new XMLHttpRequest();xr.open('GET',api.path('cut.json'));xr.onload=function(){if(xr.status&&xr.status!==200)return;try{var c=JSON.parse(xr.responseText),m=box(c.main||c),k=box(c.kouros);
    if(m&&!cc&&(!c.main||!c.main.file||c.main.file===art.img))crop={dx:m.dx,dy:m.dy,w:art.w||m.w,h:art.h||m.h};if(k&&cutout)kcrop={dx:k.dx,dy:k.dy};dirtyAll();}catch(e){}};xr.onerror=function(){};xr.send();}catch(e){}

  // images
  var mainIm=api.img(art.img||'main.webp'),kIm=null,kBg='#bdbbb7';
  function kouros(){if(kIm)return kIm;kIm=api.img(cutout?'kouros_cut.webp':'kouros.webp');var f=function(){try{var c=document.createElement('canvas');c.width=c.height=4;var g=c.getContext('2d');g.drawImage(kIm,0,700,16,900,0,0,4,4);var d=g.getImageData(0,0,1,1).data;kBg='rgb('+d[0]+','+d[1]+','+d[2]+')';}catch(e){}dirtyAll();};
    if(kIm.complete&&kIm.naturalWidth)f();else kIm.addEventListener('load',f,{once:true});return kIm;}
  function ok(im){return im&&im.complete&&im.naturalWidth>0;}
  if(!ok(mainIm))mainIm.addEventListener('load',function(){dirtyAll();},{once:true});

  // ---------------------------------------------------------------- DOM
  var wrap=document.createElement('div');wrap.className='cp';
  wrap.innerHTML=
    '<div class="cp-stage"><canvas tabindex="0" role="slider" aria-label="人偶的重心：左右拖动髋部或腿，或用方向键" aria-valuemin="-100" aria-valuemax="100" aria-valuenow="0"></canvas></div>'+
    '<p class="cp-read" aria-live="polite"></p>'+
    '<p class="cp-hint"></p>'+
    '<div class="acts"><span class="cp-seg"><button type="button" class="act" data-s="0" aria-pressed="true">库罗斯</button><i aria-hidden="true">/</i><button type="button" class="act" data-s="1" aria-pressed="false">持矛者</button></span>'+
    '<button type="button" class="act" data-t="cmp" aria-pressed="false">照片对比</button>'+
    '<button type="button" class="act" data-t="ticks" aria-pressed="false">比例</button>'+
    '<button type="button" class="act" data-t="poly" aria-pressed="false">它原本是彩色的</button></div>'+
    '<div class="cp-plate cp-pv" hidden><canvas aria-label="库罗斯与持矛者的照片"></canvas></div>'+
    '<p class="cp-note cp-n-cmp" hidden></p>'+
    '<p class="cp-note cp-n-ticks" hidden>以头长（头顶到下巴）为单位，这尊像从头顶到承重脚的脚底约\u00a07\u00a0个头长。波留克列特斯的<span class="nw">《法则》</span>原文已失传，比例只能从罗马复制品上量出来，所以只能说<span class="nw">“约”。</span></p>'+
    '<div class="cp-plate cp-hd" hidden><canvas aria-label="头部特写：现状与上彩示意"></canvas>'+
      '<div class="cp-legend"><span><i style="background:'+PAINT.hair+'"></i>头发</span><span><i style="background:'+PAINT.brow+'"></i>眉毛</span><span><i style="background:'+PAINT.iris+'"></i>眼珠与眼线</span><span><i style="background:'+PAINT.lips+'"></i>嘴唇</span></div></div>'+
    '<p class="cp-note cp-n-poly" hidden><b>这是复原假说，不是原貌。</b>许多古代大理石雕像的头发、眼睛和嘴唇上发现过颜料残迹，研究者据此推测雕像原本上过彩。这尊像具体用过哪些颜色已无法确知，色块只示意可能上色的位置。青铜原作则可能用铜镶嘴唇，用彩石或玻璃镶眼睛。</p>';
  host.appendChild(wrap);
  // device-appropriate wording: no keys on touch screens
  var hintEl=wrap.querySelector('.cp-hint'),mqT=window.matchMedia?matchMedia('(hover: none)'):null;
  function hintText(){hintEl.textContent=(mqT&&mqT.matches?'用手指左右拖动髋部，或拖动放松的那条腿。':'左右拖动髋部，或拖动放松的那条腿，也可以用方向键。')+'重心换到另一条腿时，肩和髋会自动反向倾斜。文中的左右都指人像自身。';}
  hintText();if(mqT){if(mqT.addEventListener)mqT.addEventListener('change',hintText);else if(mqT.addListener)mqT.addListener(hintText);}
  var rows=sp.rows||[];
  if(rows.length){var tb=document.createElement('table');tb.className='cp-rows';
    tb.innerHTML='<thead><tr><th scope="col"><span style="position:absolute;left:-9999px">项目</span></th><th scope="col" data-c="0">库罗斯</th><th scope="col" data-c="1">持矛者</th></tr></thead><tbody>'+
      rows.map(function(r){return '<tr><th scope="row">'+r[0]+'</th><td data-c="0">'+r[1]+'</td><td data-c="1">'+r[2]+'</td></tr>';}).join('')+'</tbody>';
    wrap.insertBefore(tb,wrap.querySelector('.cp-pv'));}
  var cv=wrap.querySelector('.cp-stage canvas'),g=cv.getContext('2d'),readEl=wrap.querySelector('.cp-read');
  var pv=wrap.querySelector('.cp-pv'),pvc=pv.querySelector('canvas'),hd=wrap.querySelector('.cp-hd'),hdc=hd.querySelector('canvas');
  var nCmp=wrap.querySelector('.cp-n-cmp'),nTicks=wrap.querySelector('.cp-n-ticks'),nPoly=wrap.querySelector('.cp-n-poly');

  // overlays on the hung statue (live in #room, aligned to api.artRect() every frame)
  var roomEl=$('room')||document.body;
  function mk(tag,cls){var e=document.createElement(tag);e.className=cls;roomEl.appendChild(e);return e;}
  var ovK=mk('canvas','cp-ov'),ovM=mk('canvas','cp-ov mul'),ovL=mk('canvas','cp-ov');
  var split=mk('div','cp-split'),sideA=mk('span','cp-side'),sideB=mk('span','cp-side');
  [ovK,ovM,ovL].forEach(function(c){c.setAttribute('aria-hidden','true');});
  split.tabIndex=0;split.setAttribute('role','slider');split.setAttribute('aria-label','库罗斯与持矛者的分界线');split.setAttribute('aria-valuemin','0');split.setAttribute('aria-valuemax','100');
  sideA.innerHTML='库罗斯<small>约公元前\u00a0590–580\u00a0年</small>';sideB.innerHTML='持矛者<small>原作约公元前\u00a0450–440\u00a0年</small>';sideA.style.textAlign='right';

  // ---------------------------------------------------------------- state
  var S={w:0,v:0,target:0,drag:null,hover:null,touched:false,cmp:false,ticks:false,poly:false,split:.5,side:0,landed:false};
  var dirtyP=true,dirtyO=true,dirtyPV=true,dirtyHD=true,lastRect='',dead=false,raf=0,W=0,H=0,U=40,CX=0,GY=0,lastT=0,lastRead='';
  function dirtyAll(){dirtyP=dirtyO=dirtyPV=dirtyHD=true;}

  // ---------------------------------------------------------------- the rig (units = head lengths; screen axes, y down, ground y = 0)
  function rot(p,a){var c=Math.cos(a),s=Math.sin(a);return[p[0]*c-p[1]*s,p[0]*s+p[1]*c];}
  function add(a,b){return[a[0]+b[0],a[1]+b[1]];}
  function fr(o,a){return function(x,y){return add(o,rot([x,y],a));};}
  var THIGH=1.65,SHIN=1.7,HIPW=.36;
  function pose(w){
    var a=Math.abs(w),sg=w<0?-1:1,e=sm(a),P={a:a,sg:sg};
    // canonical: weight on the viewer-left leg (statue's right, as the Doryphoros); mirrored for w<0
    var SA=[lerp(-.30,-.12,e),-.2],RA=[lerp(.30,.56,e),lerp(-.2,-.4,e)],RAz=lerp(0,-.6,e);
    var th=7*R2*e,ts=-4.5*R2*e,Cx=lerp(0,.03,e),Lc=(THIGH+SHIN)*.995;
    var hs=add([Cx,0],rot([-HIPW,0],th)),dx=hs[0]-SA[0],dy=Math.sqrt(Math.max(Lc*Lc-dx*dx,0));
    var Cy=SA[1]-dy-Math.sin(th)*(-HIPW);   // hs.y = Cy + sin(th)*(-HIPW)
    var C=[Cx,Cy],pv=fr(C,th);
    var N=add(C,rot([lerp(0,-.15,e),-2.1],(th+ts)*.5)),tx=fr(N,ts);
    var HS=pv(-HIPW,0),HR=pv(HIPW,0);
    function knee(H,A,Az,inward){ // 3-D two-bone IK; the knee bends forward (towards the viewer) and a little inward
      var d3=[A[0]-H[0],A[1]-H[1],Az],d=Math.hypot(d3[0],d3[1],d3[2]),L=THIGH+SHIN;
      var u=[d3[0]/d,d3[1]/d,d3[2]/d];
      if(d>=L*.9999)return[H[0]+u[0]*THIGH,H[1]+u[1]*THIGH];
      var ca=(THIGH*THIGH+d*d-SHIN*SHIN)/(2*THIGH*d),al=Math.acos(clamp(ca,-1,1));
      var v=[inward*.32,0,1],k=v[0]*u[0]+v[1]*u[1]+v[2]*u[2],b=[v[0]-k*u[0],v[1]-k*u[1],v[2]-k*u[2]],bl=Math.hypot(b[0],b[1],b[2]);
      b=[b[0]/bl,b[1]/bl,b[2]/bl];
      return[H[0]+THIGH*(u[0]*Math.cos(al)+b[0]*Math.sin(al)),H[1]+THIGH*(u[1]*Math.cos(al)+b[1]*Math.sin(al))];}
    P.C=C;P.N=N;P.th=th;P.ts=ts;P.pv=pv;P.tx=tx;P.HS=HS;P.HR=HR;P.SA=SA;P.RA=RA;
    P.KS=knee(HS,SA,0,1);P.KR=knee(HR,RA,RAz,-1);
    P.toeS=[SA[0]+.02,0];P.toeR=[RA[0]+.1*e,lerp(0,-.1,e)];
    // arms: the arm on the weight-leg side hangs; the other bends to hold the (lost) spear
    var SJL=tx(-.95,.22),SJR=tx(.95,.22);P.SJL=SJL;P.SJR=SJR;
    P.EL=add(SJL,[-.12,1.35]);P.WL=add(P.EL,[.03,1.08]);
    P.ER=add(SJR,[lerp(.12,.2,e),lerp(1.35,1.3,e)]);P.WR=add(P.ER,[lerp(-.03,.3,e),lerp(1.08,.34,e)]);
    P.tn=-6*R2*e+ts*.4;P.HC=add(N,rot([0,-.9],P.tn));
    if(sg<0){var M=function(p){return[-p[0],p[1]];};
      ['C','N','HS','HR','SA','RA','KS','KR','toeS','toeR','SJL','SJR','EL','WL','ER','WR','HC'].forEach(function(k){P[k]=M(P[k]);});
      P.th=-th;P.ts=-ts;P.tn=-P.tn;P.pv=function(x,y){return M(pv(-x,y));};P.tx=function(x,y){return M(tx(-x,y));};}
    return P;}

  // ---------------------------------------------------------------- puppet drawing
  function X(p){return[CX+p[0]*U,GY+p[1]*U];}
  function tube(A,B,prof){ // tapered limb along A→B, radii (units) sampled along its length
    var a=X(A),b=X(B),dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L,n=14,Lf=[],Rt=[];
    for(var i=0;i<=n;i++){var t=i/n,f=t*(prof.length-1),j=Math.min(Math.floor(f),prof.length-2),r=lerp(prof[j],prof[j+1],sm(f-j))*U,x=a[0]+dx*t,y=a[1]+dy*t;Lf.push([x+nx*r,y+ny*r]);Rt.push([x-nx*r,y-ny*r]);}
    var ang=Math.atan2(dy,dx);g.beginPath();g.moveTo(Lf[0][0],Lf[0][1]);for(i=1;i<=n;i++)g.lineTo(Lf[i][0],Lf[i][1]);
    g.arc(b[0],b[1],prof[prof.length-1]*U,ang+Math.PI/2,ang-Math.PI/2,true);for(i=n;i>=0;i--)g.lineTo(Rt[i][0],Rt[i][1]);
    g.arc(a[0],a[1],prof[0]*U,ang-Math.PI/2,ang+Math.PI/2,true);g.closePath();}
  function spline(pts){ // closed Catmull-Rom through pts (screen px)
    var n=pts.length;g.beginPath();g.moveTo(pts[0][0],pts[0][1]);
    for(var i=0;i<n;i++){var p0=pts[(i-1+n)%n],p1=pts[i],p2=pts[(i+1)%n],p3=pts[(i+2)%n];
      g.bezierCurveTo(p1[0]+(p2[0]-p0[0])/6,p1[1]+(p2[1]-p0[1])/6,p2[0]-(p3[0]-p1[0])/6,p2[1]-(p3[1]-p1[1])/6,p2[0],p2[1]);}
    g.closePath();}
  function foot(A,T,out){var a=X(A),t=X(T),dx=t[0]-a[0],dy=t[1]-a[1],L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L,r0=.11*U,r1=.16*U,o=out*.05*U;
    g.beginPath();g.moveTo(a[0]+nx*r0,a[1]+ny*r0);g.lineTo(t[0]+nx*r1+o,t[1]+ny*r1);g.quadraticCurveTo(t[0]+dx/L*.14*U+o*.5,t[1]+dy/L*.14*U,t[0]-nx*r1+o,t[1]-ny*r1);g.lineTo(a[0]-nx*r0,a[1]-ny*r0);g.closePath();}
  function fillStroke(){g.fill();g.stroke();}
  function line(A,B){var a=X(A),b=X(B);g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke();}
  function curve(A,Cp,B){var a=X(A),c=X(Cp),b=X(B);g.beginPath();g.moveTo(a[0],a[1]);g.quadraticCurveTo(c[0],c[1],b[0],b[1]);g.stroke();}

  function layout(){
    var w=Math.max(200,Math.round(wrap.clientWidth||host.clientWidth||320));
    var h=Math.round(clamp(w*1.04,360,560));
    if(w!==W||h!==H){W=w;H=h;cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);cv.style.height=H+'px';dirtyAll();}
    U=Math.min((H-58)/7.45,(W-24)/6.6);GY=H-38;CX=W/2-(W>460?0:.12*U);}

  function drawPuppet(){
    layout();var P=pose(S.w),a=P.a;
    g.setTransform(DPR,0,0,DPR,0,0);g.clearRect(0,0,W,H);
    var INK=ink(),ex=CX-2.8*U;
    // ground and shadows
    g.strokeStyle=inkA(.2);g.lineWidth=1;g.beginPath();g.moveTo(CX-2.9*U,GY+.5);g.lineTo(CX+2.9*U,GY+.5);g.stroke();
    function shadow(p,rx,al){var q=X([p[0],0]);g.save();g.translate(q[0],q[1]);g.scale(1,.16);var gr=g.createRadialGradient(0,0,0,0,0,rx*U);gr.addColorStop(0,inkA(al));gr.addColorStop(1,inkA(0));g.fillStyle=gr;g.beginPath();g.arc(0,0,rx*U,0,Math.PI*2);g.fill();g.restore();}
    shadow([P.SA[0]+.05*P.sg,0],.62,.24);shadow([P.toeR[0],0],lerp(.62,.4,a),lerp(.24,.1,a));
    // lost spear, faint, only in the Doryphoros stance
    if(a>.55){var al=sm((a-.55)/.35)*.5,hR=add(P.WR,[.08*P.sg,.12]);g.save();g.setLineDash([5,5]);g.strokeStyle=inkA(.45*al/.5);g.lineWidth=1.2;
      var top=add(P.SJR,[.35*P.sg,-2.2]),dir=[hR[0]-top[0],hR[1]-top[1]],bot=add(hR,[dir[0]*.62,dir[1]*.62]);line(top,bot);g.restore();
      g.fillStyle=inkA(.8*al/.5);g.font='13px '+SONG;g.textAlign=P.sg>0?'left':'right';var tp=X(add(top,[.1*P.sg,.15]));g.fillText('矛（已失）',tp[0],tp[1]);}
    // stone
    var gr=g.createLinearGradient(CX-1.4*U,GY-7*U,CX+1.6*U,GY);gr.addColorStop(0,'#f3eee4');gr.addColorStop(.55,'#ddd3c2');gr.addColorStop(1,'#c7baa3');
    g.fillStyle=gr;g.strokeStyle=inkA(.58);g.lineWidth=1;g.lineJoin='round';
    var hover=S.drag||S.hover;
    // legs (relaxed leg first: it is set back)
    function leg(H,K,A,T,out){tube(H,K,[.31,.3,.27,.23,.2,.185]);fillStroke();tube(K,A,[.18,.205,.19,.15,.12,.105]);fillStroke();foot(A,T,out);fillStroke();}
    leg(P.HR,P.KR,P.RA,P.toeR,P.sg);leg(P.HS,P.KS,P.SA,P.toeS,-P.sg);
    // torso: thorax frame (tx, tilted with the shoulders) and pelvis frame (pv, tilted with the hips); the waist is pinched on the weight side
    var tx=P.tx,pv=P.pv,sgn=P.sg,pin=.07*a;
    function waist(s){var u=tx(s*.76,1.6),l=pv(s*.64,-.74),m=[(u[0]+l[0])/2,(u[1]+l[1])/2];var inward=(s*sgn<0)?pin:-pin*.35;return[m[0]-s*inward,m[1]];}
    var T=[tx(-.26,-.03),tx(-.72,.04),tx(-1.0,.3),tx(-.9,.78),tx(-.8,1.2),waist(-1),pv(-.66,-.42),pv(-.68,-.04),pv(-.62,.2),pv(-.2,.5),pv(0,.53),
           pv(.2,.5),pv(.62,.2),pv(.68,-.04),pv(.66,-.42),waist(1),tx(.8,1.2),tx(.9,.78),tx(1.0,.3),tx(.72,.04),tx(.26,-.03)];
    spline(T.map(X));fillStroke();
    // sculpted landmarks, hairline
    g.save();g.strokeStyle=inkA(.24);g.lineWidth=1;
    curve(tx(-.72,.58),tx(-.36,.86),tx(-.05,.62));curve(tx(.72,.58),tx(.36,.86),tx(.05,.62));
    curve(tx(0,.64),[(tx(0,1.2)[0]+pv(0,-.9)[0])/2+.03*sgn,(tx(0,1.2)[1]+pv(0,-.9)[1])/2],pv(0,-.72));
    curve(pv(-.58,-.44),pv(-.46,.02),pv(-.14,.38));curve(pv(.58,-.44),pv(.46,.02),pv(.14,.38));
    curve(tx(-.12,.03),tx(-.4,.1),tx(-.72,.06));curve(tx(.12,.03),tx(.4,.1),tx(.72,.06));
    var nv=X(pv(0,-.66));g.beginPath();g.arc(nv[0],nv[1],Math.max(1.2,.035*U),0,Math.PI*2);g.stroke();g.restore();
    // neck and head
    g.fillStyle=gr;var nb=add(P.N,rot([0,.08],P.ts)),nt=add(P.N,rot([0,-.5],P.tn));tube(nb,nt,[.21,.19,.2]);fillStroke();
    var hc=X(P.HC);g.save();g.translate(hc[0],hc[1]);g.rotate(P.tn);g.scale(U,U);g.lineWidth=1/U;
    g.beginPath();g.moveTo(0,-.5);g.bezierCurveTo(.26,-.5,.38,-.3,.37,-.04);g.bezierCurveTo(.36,.24,.2,.46,0,.5);g.bezierCurveTo(-.2,.46,-.36,.24,-.37,-.04);g.bezierCurveTo(-.38,-.3,-.26,-.5,0,-.5);g.closePath();g.fill();g.stroke();
    g.strokeStyle=inkA(.2);g.beginPath();g.moveTo(-.36,-.14);g.bezierCurveTo(-.2,-.34,.2,-.34,.36,-.14);g.stroke();g.restore();
    // arms
    function arm(S0,E,Wr,fist){tube(S0,E,[.2,.19,.16,.14,.135]);fillStroke();tube(E,Wr,[.135,.15,.13,.11,.095]);fillStroke();
      var w0=X(Wr),e0=X(E),an=Math.atan2(w0[1]-e0[1],w0[0]-e0[0]);g.save();g.translate(w0[0],w0[1]);g.rotate(an);g.beginPath();g.ellipse(.12*U,0,(fist?.14:.17)*U,.11*U,0,0,Math.PI*2);g.fill();g.stroke();g.restore();}
    arm(P.SJL,P.EL,P.WL,a<.5);arm(P.SJR,P.ER,P.WR,true);
    // plumb line from the neck pit
    var np=X(P.N);g.save();g.setLineDash([3,4]);g.strokeStyle=inkA(.42);g.lineWidth=1;g.beginPath();g.moveTo(np[0],np[1]);g.lineTo(np[0],GY);g.stroke();g.restore();
    g.fillStyle=GOLD;g.fillRect(np[0]-4,GY-.5,8,2);
    g.fillStyle=inkA(.8);g.font='13px '+SONG;g.textAlign='center';g.fillText('铅垂线',np[0],GY+19);
    // gold shoulder and hip lines
    function gold(A,B,C0,D0,label,deg){var a1=X(A),b1=X(B);g.strokeStyle=GOLD;g.lineWidth=1.6;g.beginPath();g.moveTo(a1[0],a1[1]);g.lineTo(b1[0],b1[1]);g.stroke();
      g.fillStyle=GOLD;[C0,D0].forEach(function(p){var q=X(p);g.beginPath();g.arc(q[0],q[1],2.6,0,Math.PI*2);g.fill();});
      var lx=CX+1.78*U,ly=a1[1]+(b1[1]-a1[1])*(lx-a1[0])/((b1[0]-a1[0])||1);
      g.save();g.globalAlpha=.55;g.setLineDash([2,3]);g.lineWidth=1;g.beginPath();g.moveTo(b1[0]+3,b1[1]+(ly-b1[1])*.1);g.lineTo(lx-4,ly);g.stroke();g.restore();
      g.fillStyle=inkA(.85);g.font='13px '+SONG;g.textAlign='left';g.fillText(label,lx,ly+4);
      g.font='13px '+DID;var tw=g.measureText(label).width;g.fillText(deg,lx+tw+5,ly+4);}
    var sd=Math.abs(P.ts)/R2,hdg=Math.abs(P.th)/R2;
    gold(tx(-1.42,.22),tx(1.42,.22),P.SJL,P.SJR,'肩',sd<.3?'0°':sd.toFixed(1)+'°');
    gold(pv(-1.12,-.42),pv(1.12,-.42),pv(-.62,-.42),pv(.62,-.42),'髋',hdg<.3?'0°':hdg.toFixed(1)+'°');
    // handles
    function ring(p,on){var q=X(p);g.beginPath();g.arc(q[0],q[1],on?9:7,0,Math.PI*2);g.fillStyle=on?'rgba(176,141,87,.28)':'rgba(255,252,246,.55)';g.fill();g.strokeStyle=GOLD;g.lineWidth=1.3;g.stroke();}
    ring(P.C,hover==='hips');
    if(a>.25)ring(P.KR,hover==='leg');else{ring(P.KS,hover==='leg');ring(P.KR,hover==='leg');}
    if(!S.touched){var c=X(P.C);g.fillStyle=GOLD;g.font='15px '+DID;g.textAlign='center';g.fillText('‹',c[0]-18,c[1]+5);g.fillText('›',c[0]+18,c[1]+5);}
    // head-length ticks
    if(S.ticks){var crown=X(add(P.HC,rot([0,-.5],P.tn)))[1],rx=CX+2.8*U,n=7,step=(GY-crown)/n;
      g.save();g.strokeStyle=inkA(.14);g.setLineDash([2,4]);for(var k=0;k<=n;k++){var y=crown+k*step;g.beginPath();g.moveTo(CX-1.7*U,y);g.lineTo(rx,y);g.stroke();}g.restore();
      g.strokeStyle=GOLD;g.lineWidth=1.2;g.beginPath();g.moveTo(rx,crown);g.lineTo(rx,GY);g.stroke();
      for(k=0;k<=n;k++){y=crown+k*step;g.beginPath();g.moveTo(rx-5,y);g.lineTo(rx+5,y);g.stroke();}
      g.fillStyle=inkA(.8);g.font='13px '+DID;g.textAlign='left';for(k=1;k<=n;k++)g.fillText(String(k),rx+9,crown+(k-.5)*step+4);
      g.font='13px '+SONG;g.fillStyle=inkA(.8);g.textAlign='center';g.fillText('约\u00a07\u00a0个头长',rx,GY+23);}
    // caption of the current stance
    readout(P);}

  function readout(P){var a=P.a,side=P.sg>0?'右':'左',other=P.sg>0?'左':'右',html,val;
    if(a<.15){html='<b>两腿平均承重。</b>肩线和髋线都接近水平，身体左右对称。<span>这是库罗斯的站法：一脚在前，但重量没有移过去。</span>';val='两腿平均承重';}
    else{var sd=(Math.abs(P.ts)/R2).toFixed(1),hd=(Math.abs(P.th)/R2).toFixed(1);
      html='<b>重心在'+side+'腿。</b>'+side+'髋抬高 '+hd+'°，'+side+'肩下沉 '+sd+'°，两条金线在'+side+'侧收拢、'+other+'侧张开。'+
        (a>.6?'<span>承重的'+side+'腿与垂下的'+side+'臂同侧，放松的'+other+'腿与持矛的'+other+'臂同侧，四肢交叉呼应。'+(P.sg<0?'（与原像左右相反）':'')+'</span>':'<span>继续拖，放松的那条腿会屈膝、后撤。</span>');
      val='重心在'+side+'腿';}
    if(html!==lastRead){lastRead=html;readEl.innerHTML=nb(html);}
    cv.setAttribute('aria-valuenow',String(Math.round(-S.w*100)));cv.setAttribute('aria-valuetext',val);
    var st=a<.15?0:a>.85?1:-1;
    wrap.querySelectorAll('.cp-seg .act').forEach(function(b){b.setAttribute('aria-pressed',String(+b.getAttribute('data-s')===st));});
    wrap.querySelectorAll('.cp-rows [data-c]').forEach(function(c){c.classList.toggle('on',+c.getAttribute('data-c')===st);});}

  // ---------------------------------------------------------------- mapping original main.webp px → a target rect
  function mapper(rect){var kx=rect.width/crop.w,ky=rect.height/crop.h;return{k:kx,f:function(x,y){return[rect.left+(x-crop.dx)*kx,rect.top+(y-crop.dy)*ky];}};}
  function kg(p){return[KR.ox+p[0]*KR.s,KR.oy+p[1]*KR.s];}   // kouros px → main px

  function drawPoly(c,m,blend){ // colour blocks, restrained; blend=true when drawing on top of the photo in the same canvas
    c.save();if(blend)c.globalCompositeOperation='multiply';var k=m.k,bl=Math.max(.4,2.2*k);
    function poly(pts,col,al){c.globalAlpha=al;c.fillStyle=col;c.beginPath();pts.forEach(function(p,i){var q=m.f(p[0],p[1]);if(i)c.lineTo(q[0],q[1]);else c.moveTo(q[0],q[1]);});c.closePath();c.fill();}
    try{c.filter='blur('+bl.toFixed(2)+'px)';}catch(e){}
    poly(POLY.hair,PAINT.hair,.6);
    try{c.filter='blur('+(bl*.5).toFixed(2)+'px)';}catch(e){}
    poly(POLY.browL,PAINT.brow,.62);poly(POLY.browR,PAINT.brow,.62);poly(POLY.lips,PAINT.lips,.62);
    POLY.eyes.forEach(function(e){var q=m.f(e[0],e[1]),ir=m.f(e[5],e[6]);c.globalAlpha=.85;c.strokeStyle=PAINT.lid;c.lineWidth=Math.max(.6,2.4*k);
      c.beginPath();c.ellipse(q[0],q[1],e[2]*k,e[3]*k,e[4]*R2,Math.PI*1.08,Math.PI*1.92);c.stroke();
      c.globalAlpha=.9;c.fillStyle=PAINT.iris;c.beginPath();c.arc(ir[0],ir[1],e[7]*k,0,Math.PI*2);c.fill();
      c.fillStyle=PAINT.pupil;c.beginPath();c.arc(ir[0],ir[1],e[7]*k*.45,0,Math.PI*2);c.fill();});
    try{c.filter='none';}catch(e){}c.restore();}

  function drawTicks(c,m,col,txt,cap){ // head-length ticks on the photo; cap = 'top' | 'bottom' | 'none' (where '约 7 个头长' goes)
    var k=m.k,top=m.f(0,HEADS.crown)[1],bot=m.f(0,HEADS.sole)[1],step=(bot-top)/HEADS.n,X0=m.f(TICK.x0,0)[0],RX=m.f(TICK.x,0)[0];
    c.save();c.lineWidth=1;c.strokeStyle=col;c.globalAlpha=.34;c.setLineDash([2,4]);
    for(var i=0;i<=HEADS.n;i++){var y=Math.round(top+i*step)+.5;c.beginPath();c.moveTo(X0,y);c.lineTo(RX,y);c.stroke();}
    c.setLineDash([]);c.globalAlpha=1;c.strokeStyle=GOLD;c.lineWidth=1.4;c.beginPath();c.moveTo(RX,top);c.lineTo(RX,bot);c.stroke();
    for(i=0;i<=HEADS.n;i++){y=top+i*step;c.beginPath();c.moveTo(RX-5,y);c.lineTo(RX+5,y);c.stroke();}
    var fs=clamp(step*.2,13,15);c.fillStyle=txt;c.font=fs+'px '+DID;c.textAlign='left';c.textBaseline='middle';
    for(i=1;i<=HEADS.n;i++)c.fillText(String(i),RX+8,top+(i-.5)*step);
    var cb=ticksCap(c,m,cap);if(cb){c.font=cb.font;c.textAlign='left';c.textBaseline='alphabetic';c.fillText(TCAP,cb.x,cb.base);}
    // the unit itself: crown to chin
    c.strokeStyle=GOLD;c.lineWidth=1;var hx=m.f(738,0)[0];c.beginPath();c.moveTo(hx+4,top);c.lineTo(hx,top);c.lineTo(hx,top+step);c.lineTo(hx+4,top+step);c.stroke();
    c.restore();}

  function drawGuides(c,m,which){var gd=guides[which];if(!gd)return;var conv=which==='kouros'?kg:function(p){return p;};
    c.save();c.strokeStyle=GOLD;c.fillStyle=GOLD;c.lineWidth=1.6;
    ['shoulder','hip'].forEach(function(key){var L=gd[key];if(!L)return;var A=conv(L[0]),B=conv(L[1]),dx=B[0]-A[0],dy=B[1]-A[1],e=.22;
      var a=m.f(A[0]-dx*e,A[1]-dy*e),b=m.f(B[0]+dx*e,B[1]+dy*e);c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.stroke();
      [A,B].forEach(function(p){var q=m.f(p[0],p[1]);c.beginPath();c.arc(q[0],q[1],2.4,0,Math.PI*2);c.fill();});});
    c.restore();}

  function wallFill(c,x,y,w,h){ // repaint the bare wall (colour + the room's .wash light) so the cut-out Doryphoros disappears without a visible box
    c.fillStyle=room.wall||'#ECE5D8';c.fillRect(x,y,w,h);var wa=document.querySelector('.wash'),rm=$('room');if(!wa||!rm)return;
    var cs=getComputedStyle(wa),bg=cs.backgroundImage||'',mm=bg.match(/rgba?\(([^)]+)\)/);if(!mm)return;var col=mm[1].split(',').map(parseFloat);
    var R=wa.getBoundingClientRect(),sx=parseFloat(cs.getPropertyValue('--sx'))||55,sy=parseFloat(cs.getPropertyValue('--sy'))||45,cx=R.left+R.width*sx/100,cy=R.top+R.height*sy/100,rx=R.width*.7,ry=R.height*.6;
    c.save();c.beginPath();c.rect(x,y,w,h);c.clip();c.translate(cx,cy);c.scale(1,ry/rx);var gr=c.createRadialGradient(0,0,0,0,0,rx);
    var a0=col.length>3?col[3]:1;gr.addColorStop(0,'rgba('+col[0]+','+col[1]+','+col[2]+','+a0+')');gr.addColorStop(.7,'rgba('+col[0]+','+col[1]+','+col[2]+',0)');gr.addColorStop(1,'rgba('+col[0]+','+col[1]+','+col[2]+',0)');
    c.fillStyle=gr;c.fillRect(-rx*1.5,-rx*1.5,rx*3,rx*3);c.restore();}
  function drawKouros(c,m,plate){var im=kouros(),o=m.f(crop.dx,crop.dy);if(cutout){if(!plate)wallFill(c,o[0],o[1],crop.w*m.k,crop.h*m.k);}else{c.fillStyle=kBg;c.fillRect(o[0],o[1],crop.w*m.k,crop.h*m.k);}
    if(ok(im)){var p=m.f(KR.ox+kcrop.dx*KR.s,KR.oy+kcrop.dy*KR.s);c.drawImage(im,p[0],p[1],im.naturalWidth*KR.s*m.k,im.naturalHeight*KR.s*m.k);}}

  // ---------------------------------------------------------------- overlays on the hung statue
  function hungRect(){var f=$('frame');if(!f||f.classList.contains('hidden'))return null;var r=api.artRect();if(!r||r.width<40||r.height<40)return null;return r;}
  function place(c,r,mask){var w=Math.round(r.width*DPR),h=Math.round(r.height*DPR);if(c.width!==w||c.height!==h){c.width=w;c.height=h;}
    c.style.left=r.left+'px';c.style.top=r.top+'px';c.style.width=r.width+'px';c.style.height=r.height+'px';
    var mk=mask&&$('frame').classList.contains('f-fade')?'radial-gradient(ellipse 58% 60% at 50% 50%,#000 62%,transparent 100%)':'none';
    if(c.style.maskImage!==mk){c.style.webkitMaskImage=mk;c.style.maskImage=mk;}
    var ctx=c.getContext('2d');ctx.setTransform(DPR,0,0,DPR,-r.left*DPR,-r.top*DPR);ctx.clearRect(r.left,r.top,r.width,r.height);return ctx;}
  function show(e,on){e.style.display=on?'block':'none';}
  function syncOverlays(){
    var r=hungRect(),any=S.cmp||S.ticks||S.poly;
    var key=r?[r.left,r.top,r.width,r.height].map(function(v){return v.toFixed(1);}).join(','):'none';
    if(key!==lastRect){lastRect=key;dirtyO=true;dirtyPV=true;}
    var usePanel=!r;   // narrow screens: the statue is not on the wall while reading → plates in the panel
    pv.hidden=!(usePanel&&(S.cmp||S.ticks));
    if(!dirtyO)return;dirtyO=false;
    if(!r||!any){[ovK,ovM,ovL,split,sideA,sideB].forEach(function(e){show(e,false);});return;}
    var m=mapper(r),sx=r.left+r.width*S.split,light=!cutout;
    // kouros half (left of the divider)
    show(ovK,S.cmp);if(S.cmp){var c=place(ovK,r,true);c.save();c.beginPath();c.rect(r.left,r.top,r.width*S.split,r.height);c.clip();drawKouros(c,m);c.restore();}
    // polychromy: multiply layer, only on the Doryphoros side when splitting
    show(ovM,S.poly);if(S.poly){c=place(ovM,r,true);c.save();if(S.cmp){c.beginPath();c.rect(sx,r.top,r.right-sx,r.height);c.clip();}drawPoly(c,m,false);c.restore();}
    // captions first (DOM, measured), then the line layer: every caption keeps >= 24 px from the site mark, the foot bar,
    // the reading panel and the wall label, and never sits on the statue's rectangle unless nothing else fits
    show(split,S.cmp);show(sideA,S.cmp);show(sideB,S.cmp);
    var obs=obstacles(),caps=[];
    if(S.cmp){split.style.left=sx+'px';split.style.top=r.top+'px';split.style.height=r.height+'px';split.setAttribute('aria-valuenow',String(Math.round(S.split*100)));
      var wA=sideA.offsetWidth,hA=sideA.offsetHeight,wB=sideB.offsetWidth,hB=sideB.offsetHeight,hh=Math.max(hA,hB);
      var xA=Math.max(4,Math.min(sx-14,r.right-wB-28)-wA),xB=Math.min(innerWidth-wB-4,Math.max(sx+14,r.left+wA+28));
      var ys=[r.bottom+14,r.top-hh-12,r.top+10],pick=0,bd=-1e9;
      for(var q=0;q<ys.length;q++){var bA=bx(xA,ys[q],wA,hA),bB=bx(xB,ys[q],wB,hB),d=Math.min(clear(bA,obs),clear(bB,obs));if(q===2)d=Math.min(d,23);
        if(d>=24){pick=q;bd=d;break;}if(d>bd){bd=d;pick=q;}}
      sideA.style.left=xA+'px';sideB.style.left=xB+'px';sideA.style.top=sideB.style.top=ys[pick]+'px';
      caps.push(bx(xA,ys[pick],wA,hA),bx(xB,ys[pick],wB,hB));}
    show(ovL,true);var PAD=110;c=place(ovL,{left:r.left-PAD,top:r.top-PAD,width:r.width+2*PAD,height:r.height+2*PAD,right:r.right+PAD},false);
    var txt=light?'rgba(247,244,238,.92)':inkA(.85),tcap='top';
    if(S.ticks){var o2=obs.concat(caps),tb=-1e9;['top','bottom'].some(function(k){var d=clear(ticksCap(c,m,k),o2);if(d>=24){tcap=k;return true;}if(d>tb){tb=d;tcap=k;}return false;});}
    if(S.cmp){c.save();c.beginPath();c.rect(r.left,r.top,r.width*S.split,r.height);c.clip();drawGuides(c,m,'kouros');c.restore();
      c.save();c.beginPath();c.rect(sx,r.top,r.right-sx,r.height);c.clip();drawGuides(c,m,'main');c.restore();}
    if(S.ticks)drawTicks(c,m,light?'#f7f4ee':inkA(1),light?'rgba(247,244,238,.9)':inkA(.85),tcap);
    if(S.poly&&(!S.cmp||m.f(760,0)[0]>sx)){
      // label beside the hair: right of the head, left of it when the head-length ticks occupy the right, past the tick numbers when both are on
      var left=S.ticks&&!S.cmp,a=left?m.f(772,268):m.f(1004,262),b=left?m.f(700,300):m.f(1075,300),d=left?-1:1,tx=b[0]+9*d;
      if(S.ticks&&!left){tx=m.f(TICK.x,0)[0]+34;b=[tx-9,b[1]];}
      c.save();c.strokeStyle=txt;c.globalAlpha=.7;c.lineWidth=1;c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.lineTo(b[0]+6*d,b[1]);c.stroke();
      c.globalAlpha=1;c.fillStyle=txt;c.font='13px '+SONG;c.textAlign=left?'right':'left';c.fillText('上彩示意',tx,b[1]+4);c.fillText('复原假说',tx,b[1]+22);c.restore();}}
  // text boxes the overlay captions must keep clear of
  function bx(x,y,w,h){return{left:x,top:y,right:x+w,bottom:y+h};}
  function visEl(e){for(;e&&e.nodeType===1;e=e.parentElement){var cs=getComputedStyle(e);if(cs.display==='none'||cs.visibility==='hidden'||+cs.opacity<.05)return false;}return true;}
  function obstacles(){var out=[];document.querySelectorAll('.mark,.foot,.era,.label,#hint,#read,#vlab').forEach(function(e){if(!visEl(e))return;var b=e.getBoundingClientRect();if(b.width>1&&b.height>1)out.push(b);});return out;}
  function clear(b,obs){if(!b)return 1e9;if(b.left<4||b.top<4||b.right>innerWidth-4||b.bottom>innerHeight-4)return -1;var d=1e9;
    obs.forEach(function(o){var dx=Math.max(o.left-b.right,b.left-o.right,0),dy=Math.max(o.top-b.bottom,b.top-o.bottom,0);d=Math.min(d,Math.max(dx,dy));});return d;}
  var TCAP='约 7 个头长',TFONT='13px '+SONG;
  function ticksCap(c,m,cap){if(!cap||cap==='none')return null;c.save();c.font=TFONT;var w=c.measureText(TCAP).width;c.restore();
    var top=m.f(0,HEADS.crown)[1],bot=m.f(0,HEADS.sole)[1],RX=m.f(TICK.x,0)[0],x=RX+10-w,base=cap==='top'?top-10:bot+24;
    return{x:x,base:base,font:TFONT,left:x,right:x+w,top:base-13,bottom:base+4};}

  // ---------------------------------------------------------------- panel plates
  function drawPV(){if(pv.hidden)return;dirtyPV=false;
    var w=Math.max(200,Math.round(wrap.clientWidth)),top=S.ticks?60:120,bot=2300,gap=14;
    var plates=[];if(S.cmp)plates.push({kind:'kouros',x0:600,x1:1240});plates.push({kind:'main',x0:480,x1:S.ticks?1470:1340});
    var tot=plates.reduce(function(s,p){return s+p.x1-p.x0;},0),k=Math.min((w-gap*(plates.length-1))/tot,560/(bot-top)),h=Math.round((bot-top)*k)+30;
    pvc.width=Math.round(w*DPR);pvc.height=Math.round(h*DPR);pvc.style.height=h+'px';var c=pvc.getContext('2d');c.setTransform(DPR,0,0,DPR,0,0);c.clearRect(0,0,w,h);
    var used=tot*k+gap*(plates.length-1),x=(w-used)/2;
    plates.forEach(function(p){var pw=(p.x1-p.x0)*k,rect={left:x-(p.x0-crop.dx)*k,top:-(top-crop.dy)*k,width:crop.w*k,height:crop.h*k},m=mapper(rect);
      c.save();c.beginPath();c.rect(x,0,pw,(bot-top)*k);c.clip();
      if(p.kind==='kouros')drawKouros(c,m,true);else{if(!cutout){c.fillStyle='#0d0b0a';c.fillRect(x,0,pw,(bot-top)*k);}if(ok(mainIm))c.drawImage(mainIm,rect.left,rect.top,rect.width,rect.height);if(S.poly)drawPoly(c,m,true);}
      if(S.cmp)drawGuides(c,m,p.kind);
      if(p.kind==='main'&&S.ticks)drawTicks(c,m,cutout?inkA(1):'#f7f4ee',cutout?inkA(.85):'rgba(247,244,238,.92)','top');
      c.restore();
      c.fillStyle=ink();c.font='12.5px '+SONG;c.textAlign='left';c.fillText(p.kind==='kouros'?'库罗斯':'持矛者',x,(bot-top)*k+20);
      x+=pw+gap;});}

  function drawHD(){if(hd.hidden)return;dirtyHD=false;
    var w=Math.max(200,Math.round(wrap.clientWidth)),gap=12,s=Math.floor((w-gap)/2),h=s+26;
    hdc.width=Math.round(w*DPR);hdc.height=Math.round(h*DPR);hdc.style.height=h+'px';var c=hdc.getContext('2d');c.setTransform(DPR,0,0,DPR,0,0);c.clearRect(0,0,w,h);
    var bw=HEADBOX[2]-HEADBOX[0],k=s/bw;
    [0,1].forEach(function(i){var x=i*(s+gap),rect={left:x-(HEADBOX[0]-crop.dx)*k,top:-(HEADBOX[1]-crop.dy)*k,width:crop.w*k,height:crop.h*k},m=mapper(rect);
      c.save();c.beginPath();c.rect(x,0,s,s);c.clip();c.fillStyle=cutout?'rgba(128,118,104,.1)':'#0d0b0a';c.fillRect(x,0,s,s);if(ok(mainIm))c.drawImage(mainIm,rect.left,rect.top,rect.width,rect.height);
      if(i)drawPoly(c,m,true);c.restore();
      c.fillStyle=ink();c.font='12.5px '+SONG;c.textAlign='left';c.fillText(i?'复原假说示意':'现状',x,s+19);});}

  // ---------------------------------------------------------------- input: puppet
  function local(e){var r=cv.getBoundingClientRect();return[(e.clientX-r.left)*(W/r.width),(e.clientY-r.top)*(H/r.height)];}
  function hit(p){var P=pose(S.w),fx=(p[0]-CX)/U,fy=(p[1]-GY)/U;
    if(fy<-7.4||fy>.35||Math.abs(fx)>2)return null;
    return fy<P.C[1]+.55?'hips':'leg';}
  var dragStart=null;
  cv.addEventListener('pointerdown',function(e){var p=local(e),h=hit(p);if(!h)return;
    S.drag=h;S.touched=true;dragStart={x:p[0],t:S.target};try{cv.setPointerCapture(e.pointerId);}catch(er){}cv.classList.add('drag');dirtyP=true;e.preventDefault();});
  cv.addEventListener('pointermove',function(e){var p=local(e);
    if(S.drag&&dragStart){var dx=p[0]-dragStart.x,sgn=S.drag==='hips'?-1:1;S.target=clamp(dragStart.t+sgn*dx/(1.25*U),-1,1);if(reduce){S.w=S.target;}dirtyP=true;return;}
    var h=e.pointerType==='mouse'?hit(p):null;if(h!==S.hover){S.hover=h;cv.style.cursor=h?'grab':'default';dirtyP=true;}});
  function up(){if(!S.drag)return;S.drag=null;dragStart=null;cv.classList.remove('drag');dirtyP=true;}
  cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);cv.addEventListener('lostpointercapture',up);
  cv.addEventListener('pointerleave',function(){if(S.hover&&!S.drag){S.hover=null;dirtyP=true;}});
  cv.addEventListener('keydown',function(e){var d=0;if(e.key==='ArrowLeft')d=.1;else if(e.key==='ArrowRight')d=-.1;else if(e.key==='PageUp')d=.5;else if(e.key==='PageDown')d=-.5;
    else if(e.key==='Home'){S.target=0;}else if(e.key==='End'){S.target=1;}else return;
    S.target=clamp(S.target+d,-1,1);S.touched=true;if(reduce)S.w=S.target;dirtyP=true;e.preventDefault();e.stopPropagation();});

  // ---------------------------------------------------------------- input: toggles
  function setToggle(t,on){S[t]=on;var b=wrap.querySelector('[data-t="'+t+'"]');if(b)b.setAttribute('aria-pressed',String(on));
    nCmp.hidden=!S.cmp;nTicks.hidden=!S.ticks;nPoly.hidden=!S.poly;hd.hidden=!S.poly;
    if(t==='cmp'){nCmp.textContent=nb(hungRect()?'分界线左侧是库罗斯，右侧是墙上的持矛者，两张照片按头顶和脚底对齐缩放。左右拖动分界线对照。注意两条金线：库罗斯的平行，持矛者的在他自己的右侧（画面左侧）收拢。':'左图是库罗斯，右图是持矛者，两张照片按头顶和脚底对齐缩放。注意两条金线：库罗斯的平行，持矛者的在他自己的右侧（画面左侧）收拢。');}
    if(on&&t==='cmp'){var core=document.querySelector('.act[data-tool][aria-pressed="true"]');if(core)core.click();kouros();}
    dirtyAll();}
  wrap.querySelectorAll('[data-t]').forEach(function(b){b.addEventListener('click',function(){var t=b.getAttribute('data-t');setToggle(t,!S[t]);if(api.sfx)api.sfx.tick(.05);});});
  wrap.querySelectorAll('.cp-seg .act').forEach(function(b){b.addEventListener('click',function(){S.target=+b.getAttribute('data-s');S.touched=true;if(reduce)S.w=S.target;dirtyP=true;if(api.sfx)api.sfx.tick(.05);});});
  // the divider on the hung statue
  (function(){var drag=false;function mv(e){var r=hungRect();if(!r)return;S.split=clamp((e.clientX-r.left)/r.width,.02,.98);dirtyO=true;}
    split.addEventListener('pointerdown',function(e){drag=true;try{split.setPointerCapture(e.pointerId);}catch(er){}mv(e);e.preventDefault();e.stopPropagation();});
    split.addEventListener('pointermove',function(e){if(drag)mv(e);});
    split.addEventListener('pointerup',function(e){drag=false;e.stopPropagation();});split.addEventListener('pointercancel',function(){drag=false;});
    split.addEventListener('click',function(e){e.stopPropagation();});
    split.addEventListener('keydown',function(e){if(e.key==='ArrowLeft'||e.key==='ArrowRight'){S.split=clamp(S.split+(e.key==='ArrowLeft'?-.03:.03),.02,.98);dirtyO=true;e.preventDefault();e.stopPropagation();}});})();

  // ---------------------------------------------------------------- loop
  function watchCore(){ // the core's own tools (lens, era compare) and our split must not stack
    if(S.cmp&&document.querySelector('.act[data-tool][aria-pressed="true"]'))setToggle('cmp',false);}
  function step(t){if(dead)return;raf=requestAnimationFrame(step);
    if(!host.isConnected){dispose();return;}
    var dt=lastT?Math.min((t-lastT)/1000,.05):0;lastT=t;
    if(!reduce&&(Math.abs(S.target-S.w)>1e-4||Math.abs(S.v)>1e-4)){var k=S.drag?160:70,c=2*Math.sqrt(k)*.92;S.v+=(k*(S.target-S.w)-c*S.v)*dt;S.w+=S.v*dt;
      if(Math.abs(S.target-S.w)<1e-4&&Math.abs(S.v)<1e-3){S.w=S.target;S.v=0;}dirtyP=true;}
    S.w=clamp(S.w,-1.02,1.02);
    // sounds: a tick when the weight changes leg, a soft thud when it lands fully
    var side=S.w>.12?1:S.w<-.12?-1:0;if(side&&side!==S.side&&S.touched&&api.sfx)api.sfx.tick(.05);if(side)S.side=side;
    var landed=Math.abs(S.w)>.96;if(landed&&!S.landed&&S.touched&&api.sfx)api.sfx.thud(.07);S.landed=landed;
    watchCore();
    if(dirtyP){dirtyP=false;drawPuppet();}
    syncOverlays();
    if(dirtyPV)drawPV();if(dirtyHD)drawHD();}
  var ro=window.ResizeObserver?new ResizeObserver(function(){dirtyAll();}):null;if(ro)ro.observe(wrap);
  function onResize(){dirtyAll();}addEventListener('resize',onResize);
  function dispose(){if(dead)return;dead=true;cancelAnimationFrame(raf);if(ro)ro.disconnect();removeEventListener('resize',onResize);
    [ovK,ovM,ovL,split,sideA,sideB].forEach(function(e){if(e.parentNode)e.parentNode.removeChild(e);});}
  host._dispose=dispose;
  layout();drawPuppet();raf=requestAnimationFrame(step);
  // a short demonstration: the kouros shifts his weight and becomes the Doryphoros
  if(reduce){S.w=S.target=1;dirtyP=true;}else setTimeout(function(){if(!dead&&!S.touched){S.target=1;dirtyP=true;}},900);
  EH.debug&&(EH.debug.contrapposto={S:S,set:function(t,on){setToggle(t,on);},weight:function(w){S.target=w;S.touched=true;dirtyP=true;}});
});
})();

;
/* Special exhibit "dots" (后印象派 · 走近，再退后).
   The visitor walks toward and away from Seurat's《大碗岛的星期天下午》. Wheel / pinch on the painting, the 脚步 floor strip (drag, or arrows
   when focused) or a click on the painting (walk toward that spot) change the distance d. The view is drawn true to angle: at d metres the
   painting's millimetres are K / d CSS px (K = 2.3 ≈ a laptop seen from 60 cm or a phone from 35 cm), so the visitor's own eye does the fusing.
   A live readout says how far you stand; the dot pitch in arc minutes decides whether the dots are still apart, flickering, or fused, and the first
   time they fuse the room rings a soft chord and marks the spot on the floor.
   Dots: cut/dots.bin from the cutter when present (see loadCut), else generated here: the painting is sampled on a jittered ≈ 3 mm grid and
   error-diffused (linear light) onto a palette of pure pigments, so every patch is made of separate pure dots whose average is the patch colour.
   Close up: WebGL2 instanced soft dabs over a blurred ground; far away: the painting itself as an sRGB mip-mapped texture (linear-correct fusion).
   "调色盘混 vs. 眼睛混": two chosen pigments stirred on a palette (subtractive, weighted geometric mean) vs. set side by side as dots that fuse
   at the same walking distance. "1886 年的颜色": the zinc-yellow family of dots returns to its bright colour (simulated, labelled as such).
   Two views share one renderer: an overlay in #cw aligned to api.artRect() (wide screens) and a canvas in the panel (narrow screens). */
(function(){
'use strict';
if(!window.EH||!EH.special)return;

var K=2.3;                                       // CSS px per painting-mm at 1 m
var FUSE=3.5,SPLIT=7;                            // arc minutes per dot pitch: ≤ FUSE fused, ≥ SPLIT clearly separate
var AM=3437.75;                                  // arc minutes per radian
// pigments: sRGB today / as painted (the zinc-yellow family browned)
var PIG=[
  {k:'white', n:'白',   c:'#f2ecdc'},
  {k:'zinc',  n:'锌黄', c:'#b99a45', o:'#e3c64a'},
  {k:'ygreen',n:'黄绿', c:'#8a8c3e', o:'#9cb047'},
  {k:'orange',n:'橙',   c:'#de8a3c'},
  {k:'verm',  n:'朱红', c:'#cf4a2f'},
  {k:'madder',n:'茜红', c:'#b23b5a'},
  {k:'violet',n:'紫',   c:'#72528f'},
  {k:'ultra', n:'群青', c:'#32479a'},
  {k:'cobalt',n:'钴蓝', c:'#5487c3'},
  {k:'emer',  n:'翠绿', c:'#2f9562'},
  {k:'dgreen',n:'深绿', c:'#2d5a3c'},
  {k:'prus',  n:'普蓝', c:'#1f3350'}
];
var MIXCHIPS=['zinc','orange','verm','madder','violet','ultra','cobalt','emer','white'];

function clamp(x,a,b){return x<a?a:x>b?b:x;}
function sm(a,b,x){var t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);}
function nb(t){return String(t==null?'':t).replace(/([㐀-鿿）》”]) (?=[0-9A-Za-z])/g,'$1 ').replace(/([0-9A-Za-z.%°]) (?=[㐀-鿿（《“])/g,'$1 ');}
function ok(i){return !!(i&&i.complete&&i.naturalWidth>0);}
function hex(h){h=h.replace('#','');return[parseInt(h.substr(0,2),16),parseInt(h.substr(2,2),16),parseInt(h.substr(4,2),16)];}
function s2l(v){v/=255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4);}
function l2s(v){v=clamp(v,0,1);return Math.round(255*(v<=.0031308?v*12.92:1.055*Math.pow(v,1/2.4)-.055));}
function lin(h){return hex(h).map(s2l);}
function rgbS(l){return 'rgb('+l2s(l[0])+','+l2s(l[1])+','+l2s(l[2])+')';}
function Y(l){return .2126*l[0]+.7152*l[1]+.0722*l[2];}
function xhr(url,type,cb){try{var x=new XMLHttpRequest();x.open('GET',url+'?t='+Date.now(),true);x.responseType=type;
  x.onload=function(){cb((x.status===200||x.status===0)&&x.response?x.response:null);};x.onerror=function(){cb(null);};x.send();}catch(e){cb(null);}}
function rng(seed){var s=seed>>>0||1;return function(){s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return s/4294967296;};}

function css(){if(document.getElementById('s-dots-css'))return;var s=document.createElement('style');s.id='s-dots-css';s.textContent=
  '.dt{margin-top:16px}'+
  '.dt p{margin:0}'+
  '.dt-hint{font-size:13.5px!important;line-height:1.8!important;color:var(--ink-2);margin:0 0 10px!important}'+
  '.dt-view{display:none;position:relative;width:100%;margin:0 0 12px;background:#12100e;box-shadow:0 18px 40px -22px rgba(0,0,0,.7);touch-action:pan-y;cursor:zoom-in}'+
  '.dt.narrow .dt-view{display:block;aspect-ratio:3/2;max-height:62vh}'+
  '.dt-view canvas{position:absolute;inset:0;width:100%;height:100%;display:block}'+
  '.dt-view.drag{cursor:grabbing}'+
  '.dt-read{display:flex;flex-wrap:wrap;align-items:baseline;gap:2px 16px;margin:0 0 4px}'+
  '.dt-m i{font-style:normal}'+
  '.dt-m{font:400 17px/1.5 var(--song);white-space:nowrap}.dt-m b{font:500 22px/1 var(--didone);font-variant-numeric:tabular-nums;margin:0 .15em}'+
  '.dt-state{font:400 14px/1.7 var(--song);color:var(--ink-2)}'+
  '.dt-state.on{color:var(--ink);font-weight:500}.dt-state.on::before{content:"";display:inline-block;width:6px;height:6px;margin-right:8px;border-radius:50%;background:var(--gold);vertical-align:.2em}'+
  '.dt-floor{display:block;width:100%;height:112px;margin:2px 0 0;touch-action:pan-y;cursor:ew-resize;-webkit-tap-highlight-color:transparent}'+
  '.dt-floor:focus-visible{outline:1px solid currentColor;outline-offset:3px}'+
  '.dt-cap{font:400 12.5px/1.6 var(--song);color:var(--ink-3);margin:2px 0 0!important}'+
  '.dt-bar{display:flex;height:14px;margin:12px 0 4px;background:rgba(127,127,127,.12)}.dt-bar i{display:block;height:100%;transition:flex-grow .35s ease}'+
  '.dt-bartx{font:400 13px/1.7 var(--song);color:var(--ink-2);min-height:3.4em}'+
  '.dt-found{margin:8px 0 0!important;font:400 14px/1.85 var(--song);min-height:0}'+
  '.dt h4{margin:26px 0 6px;font:500 15px/1.7 var(--song);letter-spacing:.04em}'+
  '.dt-slots{display:flex;flex-wrap:wrap;gap:4px 18px;margin:0 0 2px}'+
  '.dt-slot{display:flex;align-items:center;gap:8px;min-height:44px;font:400 14.5px/1.4 var(--song);color:var(--ink-2)}'+
  '.dt-slot i{width:22px;height:22px;border-radius:50%;box-shadow:0 0 0 1px rgba(127,127,127,.5)}'+
  '.dt-slot[aria-pressed="true"]{color:var(--ink);font-weight:500}'+
  '.dt-slot[aria-pressed="true"]::after{content:"";width:6px;height:6px;border-radius:50%;background:currentColor}'+
  '.dt-chips{display:flex;flex-wrap:wrap;gap:0;margin:0 0 10px -9px}'+
  '.dt-chip{width:44px;height:44px;display:grid;place-items:center;border-radius:50%}'+
  '.dt-chip i{width:26px;height:26px;border-radius:50%;box-shadow:0 0 0 1px rgba(127,127,127,.45);transition:transform .15s ease}'+
  '.dt-chip:hover i{transform:scale(1.12)}'+
  '.dt-chip.a i,.dt-chip.b i{box-shadow:0 0 0 2px var(--wall),0 0 0 3.5px currentColor}'+
  '.dt-sw{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:4px 0 6px}'+
  '.dt-sw figure{margin:0}'+
  '.dt-sw canvas{display:block;width:100%;aspect-ratio:4/3;height:auto;touch-action:none}'+
  '.dt-stir{cursor:grab}.dt-stir.drag{cursor:grabbing}'+
  '.dt-sw figcaption{margin-top:6px;font:400 13px/1.7 var(--song);color:var(--ink-2)}'+
  '.dt-sw figcaption b{display:block;font-weight:500;color:var(--ink)}'+
  '.dt-lum{font:400 14px/1.85 var(--song);margin:4px 0 0!important}'+
  '.dt .acts{margin:0 0 4px}.dt .act{min-width:44px}'+
  '.dt-hold{min-height:44px;margin:0 0 4px;font:400 14px/1 var(--song);color:var(--ink-2);text-decoration:underline;text-underline-offset:5px;user-select:none;-webkit-user-select:none;touch-action:none}'+
  '.dt-hold[aria-pressed="true"]{color:var(--ink);font-weight:500}'+
  '.dt-note{margin-top:8px!important}'+
  '.dt-ov{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:1;display:none}'+
  '.dt-ov.on{display:block}'+
  '.dt-chipw{position:absolute;left:10px;bottom:10px;z-index:1;padding:6px 12px;background:rgba(18,15,13,.78);color:#efe6d6;font:400 13px/1.5 var(--song);line-height:1.5;white-space:nowrap;pointer-events:none;opacity:0;transition:opacity .4s ease}'+
  '.dt-chipw.on{opacity:1}.dt-chipw b{font:500 16px/1 var(--didone);font-variant-numeric:tabular-nums;margin:0 .15em}'+
  '.dt-chipw span{display:block;color:#cfc4b2;font-size:12.5px}'+
  '@media (max-width:560px){.dt-sw{gap:10px}.dt-floor{height:104px}}';
  document.head.appendChild(s);}

// ================================================================== WebGL2 renderer
var VS_IMG='#version 300 es\nin vec2 aP;uniform vec4 uR;out vec2 vUV;void main(){vUV=aP;gl_Position=vec4(mix(uR.xy,uR.zw,aP),0.,1.);}';
var AGE='vec3 rgb2hsv(vec3 c){vec4 K=vec4(0.,-1./3.,2./3.,-1.);vec4 p=mix(vec4(c.bg,K.wz),vec4(c.gb,K.xy),step(c.b,c.g));vec4 q=mix(vec4(p.xyw,c.r),vec4(c.r,p.yzx),step(p.x,c.r));float d=q.x-min(q.w,q.y);return vec3(abs(q.z+(q.w-q.y)/(6.*d+1e-6)),d/(q.x+1e-6),q.x);}\n'+
  'vec3 hsv2rgb(vec3 c){vec4 K=vec4(1.,2./3.,1./3.,3.);vec3 p=abs(fract(c.xxx+K.xyz)*6.-K.www);return c.z*mix(K.xxx,clamp(p-K.xxx,0.,1.),c.y);}\n'+
  'vec3 age(vec3 s,float a){if(a<=0.)return s;vec3 h=rgb2hsv(s);float d=h.x*360.;float w=smoothstep(26.,40.,d)*(1.-smoothstep(80.,98.,d))*smoothstep(.14,.32,h.y)*smoothstep(.12,.3,h.z);'+
  'vec3 t=hsv2rgb(vec3(h.x+5./360.,min(1.,h.y*1.3),min(1.,h.z*1.13)));return mix(s,t,w*a);}\n'+
  'vec3 toS(vec3 c){c=clamp(c,0.,1.);return mix(c*12.92,1.055*pow(c,vec3(1./2.4))-.055,step(.0031308,c));}\n';
var FS_IMG='#version 300 es\nprecision highp float;in vec2 vUV;uniform sampler2D uT;uniform float uLod,uAge,uA,uGround;out vec4 o;\n'+AGE+
  'void main(){vec3 c=uLod>=0.?textureLod(uT,vUV,uLod).rgb:texture(uT,vUV).rgb;c=toS(c);'+
  'if(uGround>0.){float l=dot(c,vec3(.2126,.7152,.0722));c=mix(c,vec3(l),.22)*.96+.02;}o=vec4(age(c,uAge),uA);}';
var VS_DOT='#version 300 es\nin vec2 aQ;in vec2 aPos;in vec4 aAt;uniform vec2 uC;uniform float uS,uRS,uAge;uniform vec2 uVP;uniform vec3 uPal[12];uniform vec3 uOld[12];'+
  'out vec2 vQ;out vec3 vCol;out float vAA;\n'+
  'void main(){float r=uRS*aAt.y;float el=1.+.62*aAt.w;float an=aAt.z*6.2832;vec2 e=vec2(r*el,r/el);'+
  'vec2 q=aQ*1.2;vec2 l=q*e;float c=cos(an),s=sin(an);vec2 p=aPos+vec2(c*l.x-s*l.y,s*l.x+c*l.y);vec2 px=(p-uC)*uS;'+
  'gl_Position=vec4(px.x/(uVP.x*.5),-px.y/(uVP.y*.5),0.,1.);vQ=q;int i=int(aAt.x*255.+.5);vCol=mix(uPal[i],uOld[i],uAge);vAA=1.2/max(e.y*uS,.5);}';
var FS_DOT='#version 300 es\nprecision highp float;in vec2 vQ;in vec3 vCol;in float vAA;uniform float uA;out vec4 o;'+
  'void main(){float d=length(vQ);float a=1.-smoothstep(1.-vAA,1.+vAA,d);if(a<=.003)discard;o=vec4(vCol,a*uA);}';

function makeGL(canvas){
  var gl=null;try{gl=canvas.getContext('webgl2',{alpha:false,antialias:false,premultipliedAlpha:true,preserveDrawingBuffer:false});}catch(e){}
  if(!gl)return null;
  function sh(t,src){var s=gl.createShader(t);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){console.warn('dots shader',gl.getShaderInfoLog(s));return null;}return s;}
  function prog(v,f){var p=gl.createProgram(),a=sh(gl.VERTEX_SHADER,v),b=sh(gl.FRAGMENT_SHADER,f);if(!a||!b)return null;gl.attachShader(p,a);gl.attachShader(p,b);gl.linkProgram(p);
    if(!gl.getProgramParameter(p,gl.LINK_STATUS)){console.warn('dots link',gl.getProgramInfoLog(p));return null;}var u={},n=gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS);
    for(var i=0;i<n;i++){var inf=gl.getActiveUniform(p,i),nm=inf.name.replace(/\[0\]$/,'');u[nm]=gl.getUniformLocation(p,inf.name);}return{p:p,u:u};}
  var R={gl:gl,img:prog(VS_IMG,FS_IMG),dot:prog(VS_DOT,FS_DOT),tex:null,n:0,nx:0};
  if(!R.img||!R.dot)return null;
  var quad=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,quad);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([0,0,1,0,0,1,1,1]),gl.STATIC_DRAW);
  R.vaoImg=gl.createVertexArray();gl.bindVertexArray(R.vaoImg);var la=gl.getAttribLocation(R.img.p,'aP');gl.enableVertexAttribArray(la);gl.vertexAttribPointer(la,2,gl.FLOAT,false,0,0);
  var corners=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,corners);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  R.vaoDot=gl.createVertexArray();gl.bindVertexArray(R.vaoDot);var lq=gl.getAttribLocation(R.dot.p,'aQ');gl.enableVertexAttribArray(lq);gl.vertexAttribPointer(lq,2,gl.FLOAT,false,0,0);
  R.lPos=gl.getAttribLocation(R.dot.p,'aPos');R.lAt=gl.getAttribLocation(R.dot.p,'aAt');R.bPos=gl.createBuffer();R.bAt=gl.createBuffer();
  gl.enableVertexAttribArray(R.lPos);gl.vertexAttribDivisor(R.lPos,1);gl.enableVertexAttribArray(R.lAt);gl.vertexAttribDivisor(R.lAt,1);
  gl.bindVertexArray(null);
  R.setImage=function(im){var t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.SRGB8_ALPHA8,gl.RGBA,gl.UNSIGNED_BYTE,im);gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    var an=gl.getExtension('EXT_texture_filter_anisotropic');if(an)gl.texParameterf(gl.TEXTURE_2D,an.TEXTURE_MAX_ANISOTROPY_EXT,4);R.tex=t;};
  R.setDots=function(D){gl.bindBuffer(gl.ARRAY_BUFFER,R.bPos);gl.bufferData(gl.ARRAY_BUFFER,D.pos,gl.STATIC_DRAW);gl.bindBuffer(gl.ARRAY_BUFFER,R.bAt);gl.bufferData(gl.ARRAY_BUFFER,D.at,gl.STATIC_DRAW);
    R.n=D.n;R.D=D;};
  // V: {w,h (device px), cx,cy (mm at the centre), s (device px per mm), Wmm,Hmm, wall [r,g,b 0..1], pitch, far (0..1), age, pal, old}
  R.draw=function(V){gl.viewport(0,0,V.w,V.h);gl.clearColor(V.wall[0],V.wall[1],V.wall[2],1);gl.clear(gl.COLOR_BUFFER_BIT);if(!R.tex)return;
    gl.enable(gl.BLEND);gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA,gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
    var x0=(0-V.cx)*V.s/(V.w/2),x1=(V.Wmm-V.cx)*V.s/(V.w/2),y0=-(0-V.cy)*V.s/(V.h/2),y1=-(V.Hmm-V.cy)*V.s/(V.h/2);
    var P=R.img,u=P.u;gl.useProgram(P.p);gl.bindVertexArray(R.vaoImg);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,R.tex);gl.uniform1i(u.uT,0);
    gl.uniform4f(u.uR,x0,y0,x1,y1);gl.uniform1f(u.uAge,V.age);
    var texPerPx=V.texW/V.Wmm/V.s;
    if(V.far<1&&R.n){   // the blurred ground under the dots, then the dots
      gl.uniform1f(u.uLod,Math.max(Math.log2(Math.max(texPerPx,1e-4)),Math.log2(V.texW/V.Wmm*V.pitch*1.6)));gl.uniform1f(u.uGround,1);gl.uniform1f(u.uA,1);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
      var D=R.dot,du=D.u;gl.useProgram(D.p);gl.bindVertexArray(R.vaoDot);
      var rg=range(R.D,V.cy-V.h/2/V.s-V.pitch*2,V.cy+V.h/2/V.s+V.pitch*2),first=rg[0],cnt=rg[1]-rg[0];
      if(cnt>0){gl.bindBuffer(gl.ARRAY_BUFFER,R.bPos);gl.vertexAttribPointer(R.lPos,2,gl.FLOAT,false,0,first*8);gl.bindBuffer(gl.ARRAY_BUFFER,R.bAt);gl.vertexAttribPointer(R.lAt,4,gl.UNSIGNED_BYTE,true,0,first*4);
        gl.uniform2f(du.uC,V.cx,V.cy);gl.uniform1f(du.uS,V.s);gl.uniform1f(du.uRS,V.rs);gl.uniform2f(du.uVP,V.w,V.h);gl.uniform1f(du.uAge,V.age);gl.uniform1f(du.uA,1);
        gl.uniform3fv(du.uPal,V.pal);gl.uniform3fv(du.uOld,V.old);gl.drawArraysInstanced(gl.TRIANGLE_STRIP,0,4,cnt);}
      gl.useProgram(P.p);gl.bindVertexArray(R.vaoImg);}
    if(V.far>0||!R.n){gl.uniform1f(u.uLod,-1);gl.uniform1f(u.uGround,0);gl.uniform1f(u.uA,R.n?V.far:1);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);}
    gl.bindVertexArray(null);};
  R.kill=function(){var e=gl.getExtension('WEBGL_lose_context');if(e)e.loseContext();};
  return R;}

// ================================================================== dots: from the cutter, or generated from the painting
// every dot set is sorted by y; bs[k] = first dot whose y ≥ k·band (mm), so a view draws one contiguous run
function bands(D,band){var nb=Math.ceil(D.Hmm/band)+1,bs=new Uint32Array(nb+1),k=0,i;for(i=0;i<D.n;i++){var b=Math.floor(D.pos[i*2+1]/band);while(k<=b&&k<=nb)bs[k++]=i;}
  while(k<=nb)bs[k++]=D.n;D.band=band;D.bs=bs;D.nb=nb;return D;}
function range(D,y0,y1){var a=clamp(Math.floor(y0/D.band),0,D.nb),b=clamp(Math.floor(y1/D.band)+1,0,D.nb);return[D.bs[a],D.bs[b]];}
// s_dots.webp (see _wip/s-dots/mk_dots.py): the cutter's dot places and sizes, error-diffused onto PIG; 2 px per dot: x16 y16 pigment radius
function decodeDots(im,Wmm,Hmm,artW){try{var w=im.naturalWidth,h=im.naturalHeight,c=document.createElement('canvas');c.width=w;c.height=h;
    var g=c.getContext('2d',{willReadFrequently:true});g.drawImage(im,0,0);var px=g.getImageData(0,0,w,h).data,max=w*h/2,pos=new Float32Array(max*2),at=new Uint8Array(max*4),R=rng(1891),n=0,sp=0;
    for(var i=0;i<max;i++){var a=i*8,x=px[a]*256+px[a+1],y=px[a+2]*256+px[a+4],pg=px[a+5],r=px[a+6];if(!r)continue;if(pg>=PIG.length)return null;
      pos[n*2]=x/65535*Wmm;pos[n*2+1]=y/65535*Hmm;at[n*4]=pg;at[n*4+1]=r;at[n*4+2]=Math.floor(R()*256);at[n*4+3]=Math.floor(Math.pow(R(),1.6)*256);sp+=r;n++;}
    if(n<1000)return null;
    var rs=3/(artW||2400)*Wmm*1.1,D={n:n,pos:pos.subarray(0,n*2),at:at.subarray(0,n*4),rs:rs,pitch:sp/n/255*rs/1.1/.62,Hmm:Hmm,src:'cut'};
    return bands(D,10);}catch(e){return null;}}
// generated: jittered rows (every other row shifted half a pitch), error diffusion in linear light onto the pigments
function genDots(im,Wmm,Hmm,pitch){
  var nx=Math.round(Wmm/pitch),ny=Math.round(Hmm/pitch),cw=Wmm/nx,ch=Hmm/ny;
  var c=document.createElement('canvas');c.width=nx;c.height=ny;var g=c.getContext('2d',{willReadFrequently:true});g.imageSmoothingQuality='high';g.drawImage(im,0,0,nx,ny);
  var px=g.getImageData(0,0,nx,ny).data,n=nx*ny,E=new Float32Array(n*3),LUT=new Float32Array(256);for(var i=0;i<256;i++)LUT[i]=s2l(i);
  for(i=0;i<n;i++){E[i*3]=LUT[px[i*4]];E[i*3+1]=LUT[px[i*4+1]];E[i*3+2]=LUT[px[i*4+2]];}
  var PL=PIG.map(function(p){return lin(p.c);}),NP=PL.length,pos=new Float32Array(n*2),at=new Uint8Array(n*4),R=rng(1886);
  for(var y=0;y<ny;y++){var ltr=(y&1)===0;for(var k=0;k<nx;k++){var x=ltr?k:nx-1-k,q=y*nx+x,r=E[q*3],gg=E[q*3+1],b=E[q*3+2];
      // a little noise so neighbouring pigments intermix, as in the painting
      var rn=r+(R()-.5)*.06,gn=gg+(R()-.5)*.06,bn=b+(R()-.5)*.06,best=0,bd=1e9;
      for(var p=0;p<NP;p++){var P=PL[p],dr=rn-P[0],dg=gn-P[1],db=bn-P[2],d=dr*dr*.3+dg*dg*.59+db*db*.11+(dr-dg)*(dr-dg)*.08+(db-dg)*(db-dg)*.05;if(d<bd){bd=d;best=p;}}
      var Pb=PL[best],er=clamp(r-Pb[0],-.35,.35),eg=clamp(gg-Pb[1],-.35,.35),eb=clamp(b-Pb[2],-.35,.35);
      var dx=ltr?1:-1,o;
      if(x+dx>=0&&x+dx<nx){o=(q+dx)*3;E[o]+=er*.4375;E[o+1]+=eg*.4375;E[o+2]+=eb*.4375;}
      if(y+1<ny){var q2=q+nx;if(x-dx>=0&&x-dx<nx){o=(q2-dx)*3;E[o]+=er*.1875;E[o+1]+=eg*.1875;E[o+2]+=eb*.1875;}
        o=q2*3;E[o]+=er*.3125;E[o+1]+=eg*.3125;E[o+2]+=eb*.3125;
        if(x+dx>=0&&x+dx<nx){o=(q2+dx)*3;E[o]+=er*.0625;E[o+1]+=eg*.0625;E[o+2]+=eb*.0625;}}
      var jx=(R()-.5)*.5,jy=(R()-.5)*.5;pos[q*2]=(x+.5+((y&1)?.25:-.25)+jx)*cw;pos[q*2+1]=(y+.5+jy)*ch;
      at[q*4]=best;at[q*4+1]=Math.round((.4+.3*R())/.72*255);at[q*4+2]=Math.floor(R()*256);at[q*4+3]=Math.floor(Math.pow(R(),1.6)*256);}}
  var pitch=(cw+ch)/2;return bands({n:n,pos:pos,at:at,rs:pitch*.72,pitch:pitch,Hmm:Hmm,src:'gen'},10);}

EH.special('dots',function(host,room,api){
  css();
  var sp=room.special||{},art=room.art||{w:2400,h:1598},F=sp.facts||{};
  var Wmm=(+F.widthM||+F.width||3.081)*1000,Hmm=(+F.heightM||+F.height||2.076)*1000;if(Wmm<100)Wmm*=1000;if(Hmm<100)Hmm*=1000;   // metres or mm
  if(!F.heightM&&!F.height)Hmm=Wmm*(art.h||1598)/(art.w||2400);
  var PITCH=+F.pitchMM||3.9,DFUSE=0;   // centre spacing; facts.dotMM is a dot's diameter, the data's own pitch replaces this
  function setPitch(p){PITCH=p;DFUSE=PITCH/1000/(FUSE/AM);}setPitch(PITCH);          // ≈ 3.8 m for 3.9 mm dots
  var HO=sp.hint&&typeof sp.hint==='object'?sp.hint:null,LB=sp.labels&&typeof sp.labels==='object'?sp.labels:{};
  function L(k){return LB[k]||sp[k];}
  function pick(){for(var i=0;i<arguments.length;i++){var v=arguments[i];if(v&&typeof v==='string')return v;}return '';}
  var T={
    hintWall:pick(L('hintWall'),HO&&HO.mouse,typeof sp.hint==='string'&&sp.hint,'在墙上的画上滚动滚轮，就是往前走、往后退；拖动看旁边，点一下就朝那里走近。找一找：站多远，点会融成画？'),
    hint:pick(HO&&HO.mouse,'在上面的画上滚动滚轮，或拖动下面的“脚步”，就是往前走、往后退；点一下画，朝那里走近。找一找：站多远，点会融成画？'),
    hintTouch:pick(L('hintTouch'),HO&&HO.touch,'双指在画上张开、捏合，或在下面的“脚步”上左右拖，就是往前走、往后退；点一下画，朝那里走近。找一找：站多远，点会融成画？'),
    split:pick(L('stateSplit'),'一颗颗纯色的点，谁也不和谁混'),
    mixing:pick(L('stateMixing'),'点开始在眼睛里混，颜色在闪'),
    fused:pick(L('stateFused'),'点融成了画：草地、湖面、撑伞的人都出来了'),
    found:pick(L('found'),'你在大约 {d} 米处看见点融成了画。修拉要的就是这一步：颜色不在画布上混，在你的眼睛里混。'),
    floor:pick(L('floorLabel'),'脚步：离画的距离'),
    bar:pick(L('barLabel'),'眼前这一块，由这些颜色的点组成：'),
    mixH:pick(L('mixTitle'),'调色盘混 vs. 眼睛混'),
    mixHint:pick(L('mixHint'),'选两种颜料：先点“颜色一”或“颜色二”，再点下面的色块。'),
    stirCap:pick(L('stirCap'),'在调色盘上混'),
    stirText:pick(L('stirText'),'在这块调色盘上转圈拖动，把两种颜料搅在一起。颜料互相吸收光，越搅越暗、越浊。'),
    stirTextTouch:pick(L('stirTextTouch'),'用手指在这块调色盘上转圈，把两种颜料搅在一起。颜料互相吸收光，越搅越暗、越浊。'),
    eyeCap:pick(L('eyeCap'),'在眼睛里混'),
    eyeNear:pick(L('eyeNear'),'同样两种颜色，一点一点并排。往后退几步，它们会融成一种颜色，亮度还在。'),
    eyeFar:pick(L('eyeFar'),'你现在站得够远，两种点已经融成一种颜色，亮度还在。'),
    readout:pick(L('readout'),'你离画 {d} 米'),
    ageToday:pick(L('ageToday'),'今天的样子'),
    ageThen:pick(L('ageThen'),'1886 年（模拟）'),
    ageH:pick(L('ageTitle'),'1886 年的颜色'),
    ageNote:pick(L('ageNote'),'模拟示意，不是复原。据芝加哥艺术博物馆的研究，修拉在草地上用的锌黄后来变成了褐色，原本明亮的黄绿点暗了下去。这里只把这一类点的颜色调回去。'),
    note:pick(L('note'),'近看的点按画面颜色生成，是示意：大小、颜色与原作相近，位置不是原作的点；草地阴影里零星的橙、红点，是照修拉的对比色做法补上的。修拉的点并不等大，这里也有大有小。融合的距离按常见的色彩分辨力（约 3–4 角分）估算，因人而异。')
  };
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mqT=window.matchMedia?matchMedia('(hover: none)'):null;function touchUI(){return !!(mqT&&mqT.matches);}
  var wallRGB=hex(/^#[0-9a-f]{6}$/i.test(room.wall||'')?room.wall:'#2b2825').map(function(v){return v/255;});

  // ---------- DOM
  var root=document.createElement('div');root.className='dt';
  root.innerHTML='<p class="dt-hint"></p>'+
    '<div class="dt-view"></div>'+
    '<div class="dt-read"><span class="dt-m"><i></i><b>0</b><i></i></span><span class="dt-state" aria-live="polite"></span></div>'+
    '<canvas class="dt-floor" role="slider" tabindex="0" aria-valuemin="0" aria-valuemax="20" aria-valuenow="0"></canvas>'+
    '<p class="dt-cap"></p>'+
    '<div class="dt-bar" aria-hidden="true"></div><p class="dt-bartx"></p>'+
    '<p class="dt-found" aria-live="polite"></p>'+
    '<h4 class="dt-mixh"></h4><p class="dt-cap dt-mixhint"></p>'+
    '<div class="dt-slots" role="group"><button type="button" class="dt-slot" data-s="0" aria-pressed="true"><i></i><span></span></button><button type="button" class="dt-slot" data-s="1" aria-pressed="false"><i></i><span></span></button></div>'+
    '<div class="dt-chips" role="group" aria-label="颜料"></div>'+
    '<div class="dt-sw"><figure><canvas class="dt-stir" role="img"></canvas><figcaption><b></b><span></span></figcaption></figure>'+
      '<figure><canvas class="dt-eye" role="img"></canvas><figcaption><b></b><span></span></figcaption></figure></div>'+
    '<button type="button" class="dt-hold" aria-pressed="false">按住搅拌</button>'+
    '<p class="dt-lum"></p>'+
    '<h4 class="dt-ageh"></h4>'+
    '<div class="acts" role="group"><button type="button" class="act" data-age="0" aria-pressed="true"></button><button type="button" class="act" data-age="1" aria-pressed="false"></button></div>'+
    '<p class="small dt-agenote"></p>'+
    '<p class="small dt-note"></p>';
  host.appendChild(root);
  var q=function(s){return root.querySelector(s);};
  var hintEl=q('.dt-hint'),view=q('.dt-view'),mEl=q('.dt-m b'),stEl=q('.dt-state'),floor=q('.dt-floor'),fg=floor.getContext('2d'),capEl=q('.dt-cap'),
    barEl=q('.dt-bar'),barTx=q('.dt-bartx'),foundEl=q('.dt-found'),stirC=q('.dt-stir'),eyeC=q('.dt-eye'),holdBtn=q('.dt-hold'),lumEl=q('.dt-lum');
  q('.dt-mixh').textContent=nb(T.mixH);q('.dt-mixhint').textContent=nb(T.mixHint);q('.dt-ageh').textContent=nb(T.ageH);q('.dt-agenote').textContent=nb(T.ageNote);q('.dt-note').textContent=nb(T.note);
  q('.acts').setAttribute('aria-label',T.ageH);floor.setAttribute('aria-label',T.floor);
  capEl.textContent=nb('脚步：拖动小人，或聚焦后按左右方向键。长椅约在 4 米处。');
  var cap2=q('.dt-sw figure:first-child figcaption'),cap3=q('.dt-sw figure:last-child figcaption');
  (function(){var pr=T.readout.split('{d}'),ii=root.querySelectorAll('.dt-m i');ii[0].textContent=(pr[0]||'').trim();ii[1].textContent=(pr[1]||'').trim();
    var ab=root.querySelectorAll('[data-age]');ab[0].textContent=T.ageToday;ab[1].textContent=T.ageThen;})();
  cap2.querySelector('b').textContent=T.stirCap;cap3.querySelector('b').textContent=T.eyeCap;

  // ---------- the GL canvas, moved between the wall and the panel
  var cw=document.getElementById('cw'),frameEl=document.getElementById('frame');
  var cv=document.createElement('canvas');cv.className='dt-ov';cv.setAttribute('aria-hidden','true');
  var R=makeGL(cv),g2=R?null:cv.getContext('2d');
  var chipW=document.createElement('div');chipW.className='dt-chipw';chipW.setAttribute('aria-hidden','true');chipW.innerHTML='你离画<b>0</b>米<span></span>';
  var mode='';   // 'wall' | 'panel'
  function artRect(){return api.artRect();}
  function wallVisible(r){r=r||artRect();var cmp=document.getElementById('cmpA');return !!cw&&r.width>40&&r.height>40&&!(frameEl&&frameEl.classList.contains('hidden'))&&!(cmp&&cmp.classList.contains('on'));}
  var cwTouch=cw?cw.style.touchAction:'';
  function mount(m){if(m===mode)return;mode=m;
    if(m==='wall'){cw.appendChild(cv);cw.appendChild(chipW);cw.style.touchAction='none';root.classList.remove('narrow');}
    else{view.appendChild(cv);if(chipW.parentNode)chipW.parentNode.removeChild(chipW);if(cw)cw.style.touchAction=cwTouch;root.classList.add('narrow');cv.classList.add('on');}
    S.anchor=null;dirty=true;}

  // ---------- state
  var S={d:10,dv:0,dT:10,cx:Wmm/2,cy:Hmm/2,cxT:Wmm/2,cyT:Hmm/2,vx:0,vy:0,anchor:null,age:0,ageT:0,level:-1,found:0,foundAt:0,walked:0,stepPh:0,lastStep:0,
    mix:[PIG[7],PIG[4]],slot:0,twist:0,stirV:0,hold:false,init:false,touched:false};
  var dirty=true,dead=false,raf=0,last=0;
  var hung=api.img(art.img||'main.webp'),dots=null;
  var PAL=new Float32Array(36),OLD=new Float32Array(36);PIG.forEach(function(p,i){var a=hex(p.c),b=hex(p.o||p.c);for(var k=0;k<3;k++){PAL[i*3+k]=a[k]/255;OLD[i*3+k]=b[k]/255;}});

  function vpCss(){if(mode==='wall'){var r=artRect();return{w:r.width,h:r.height};}return{w:view.clientWidth,h:view.clientHeight};}
  function dFit(){var v=vpCss();return v.w>0?K*Wmm/Math.min(v.w,v.h*Wmm/Hmm):12;}
  function dMin(){return .3;}
  function dMax(){return clamp(dFit()*1.25,8,24);}
  function scale(){return K/S.d;}                                      // css px per mm
  function clampPan(){var v=vpCss(),s=scale(),hw=v.w/2/s,hh=v.h/2/s;
    function c1(x,half,full){return half*2>=full?full/2:clamp(x,half,full-half);}
    S.cx=c1(S.cx,hw,Wmm);S.cy=c1(S.cy,hh,Hmm);S.cxT=c1(S.cxT,hw,Wmm);S.cyT=c1(S.cyT,hh,Hmm);}
  function toMM(x,y){var rc=mode==='wall'?artRect():view.getBoundingClientRect(),s=scale();return[S.cx+(x-rc.left-rc.width/2)/s,S.cy+(y-rc.top-rc.height/2)/s];}
  function level(d){var am=PITCH/(d*1000)*AM;return am<=FUSE?2:am>=SPLIT?0:1;}

  // ---------- walking
  function walkTo(d,anchor){S.dT=clamp(d,dMin(),dMax());S.anchor=anchor||null;S.touched=true;dirty=true;}
  function anchorAt(x,y){var rc=mode==='wall'?artRect():view.getBoundingClientRect(),m=toMM(x,y);return{mx:m[0],my:m[1],ox:x-rc.left-rc.width/2,oy:y-rc.top-rc.height/2};}
  function approach(x,y){var m=toMM(x,y);S.anchor=null;S.cxT=m[0];S.cyT=m[1];walkTo(S.d*.55);sfxStep(true);}

  // ---------- sound
  function recName(re){var s=(window.EH_AUDIO&&EH_AUDIO.sfx)||{};return Object.keys(s).filter(function(k){return s[k].room==='postimpressionism'&&re.test(k);})[0]||null;}
  var REC={step:recName(/step|foot/),fuse:recName(/fuse|chime|bell|reveal/),stir:recName(/stir|knife|mix/),dab:recName(/dab|dot|tap/)};
  function snd(kind,v,fb){var n=REC[kind];if(n&&api.sfx.play){var h=api.sfx.play(n,{v:v});if(h)return;}fb&&fb();}
  function sfxStep(force){var now=performance.now();if(!force&&now-S.lastStep<170)return;S.lastStep=now;snd('step',.5,function(){api.sfx.thud(.035);api.sfx.tick(.008);});}
  function sfxFuse(){snd('fuse',.6,function(){api.sfx.bell(523.25,.05);setTimeout(function(){if(!dead)api.sfx.bell(659.25,.04);},110);setTimeout(function(){if(!dead)api.sfx.bell(783.99,.035);},220);});}

  // ---------- physics
  function step(dt){
    var moved=false;
    // distance: spring toward the target, walking speed capped (≈ 7 m/s, a brisk hurry)
    var w=reduce?14:8.5,a=w*w*(S.dT-S.d)-2*w*S.dv;S.dv=clamp(S.dv+a*dt,-7,7);var nd=S.d+S.dv*dt;
    if(Math.abs(S.dT-nd)<.0015&&Math.abs(S.dv)<.01){nd=S.dT;S.dv=0;}
    if(nd!==S.d){var dd=Math.abs(nd-S.d);S.d=nd;S.walked+=dd;S.stepPh+=dd/.72*Math.PI;moved=true;if(S.walked>=.72){S.walked=0;sfxStep();}}
    // pan: an anchor keeps the point under the cursor fixed while walking; otherwise a spring toward the pan target, with a fling
    if(S.anchor){var s=scale();S.cx=S.cxT=S.anchor.mx-S.anchor.ox/s;S.cy=S.cyT=S.anchor.my-S.anchor.oy/s;if(!S.dv&&S.d===S.dT)S.anchor=null;}
    else if(!drag){if(S.vx||S.vy){S.cxT+=S.vx*dt;S.cyT+=S.vy*dt;var f=Math.exp(-dt*5);S.vx*=f;S.vy*=f;if(Math.abs(S.vx)+Math.abs(S.vy)<2){S.vx=S.vy=0;}}
      var k=1-Math.exp(-dt*(reduce?14:7)),ox=S.cx,oy=S.cy;S.cx+=(S.cxT-S.cx)*k;S.cy+=(S.cyT-S.cy)*k;if(Math.abs(S.cxT-S.cx)<.05)S.cx=S.cxT;if(Math.abs(S.cyT-S.cy)<.05)S.cy=S.cyT;
      if(S.cx!==ox||S.cy!==oy){moved=true;var pm=Math.hypot(S.cx-ox,S.cy-oy)/1000;S.walked+=pm*.6;}}
    clampPan();
    // 1886 colours: a slow change of light
    if(S.age!==S.ageT){var sp=dt/(reduce?.3:1.6);S.age=S.ageT>S.age?Math.min(S.ageT,S.age+sp):Math.max(S.ageT,S.age-sp);moved=true;}
    // fusion
    var lv=level(S.d);if(lv!==S.level){var was=S.level;S.level=lv;stEl.textContent=nb(lv===2?T.fused:lv===1?T.mixing:T.split);stEl.classList.toggle('on',lv===2);
      if(lv===2&&was>=0&&was<2&&S.touched){var now=performance.now();if(!S.found||now-S.foundAt>20000){sfxFuse();}S.foundAt=now;
        if(!S.found){S.found=DFUSE;foundEl.textContent=nb(T.found.replace('{d}',(Math.round(DFUSE*10)/10).toFixed(1)));}}
      eyeDirty=true;}
    // stirring by the hold button
    if(S.hold){S.twist+=dt*5;stirDirty=true;}
    if(moved){dirty=true;eyeDirty=true;}
    return moved;}

  // ---------- drawing
  function render(){var v=vpCss();if(!v.w||!v.h)return;var dpr=Math.min(devicePixelRatio||1,2),w=Math.round(v.w*dpr),h=Math.round(v.h*dpr);
    if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h;}
    var s=scale()*dpr,pitchPx=PITCH*s,far=dots?sm(3.4,1.9,pitchPx):1;
    if(R){R.draw({w:w,h:h,cx:S.cx,cy:S.cy,s:s,Wmm:Wmm,Hmm:Hmm,wall:wallRGB,pitch:dots?dots.pitch:PITCH,rs:dots?dots.rs:PITCH*.72,far:far,age:S.age,pal:PAL,old:OLD,texW:ok(hung)?hung.naturalWidth:2400});return;}
    // 2D fallback: the painting, and the visible dots when they are large enough
    var g=g2;g.setTransform(1,0,0,1,0,0);g.fillStyle='rgb('+wallRGB.map(function(c){return Math.round(c*255);}).join(',')+')';g.fillRect(0,0,w,h);
    g.setTransform(s,0,0,s,w/2-S.cx*s,h/2-S.cy*s);if(ok(hung))g.drawImage(hung,0,0,Wmm,Hmm);
    if(dots&&far<1){var x0=S.cx-w/2/s,x1=S.cx+w/2/s,rg=range(dots,S.cy-h/2/s-5,S.cy+h/2/s+5),n=0;
      g.globalAlpha=1-far;for(var i=rg[0];i<rg[1]&&n<60000;i++){var px=dots.pos[i*2],py=dots.pos[i*2+1];if(px<x0-5||px>x1+5)continue;
        var ci=dots.at[i*4];g.fillStyle=PIG[ci].c;g.beginPath();g.arc(px,py,dots.rs*dots.at[i*4+1]/255,0,6.2832);g.fill();n++;}g.globalAlpha=1;}}
  function idle(){return mode==='wall'&&S.d>=dFit()*.995&&S.dT>=dFit()*.995&&S.age===0&&S.ageT===0&&!drag&&!pinch;}

  // the floor strip (side view): the wall with the painting, metre ticks, the bench, you, your sight lines
  function tok(n,f){var v=getComputedStyle(host).getPropertyValue(n).trim();return v||f;}
  var FL={x0:12,sx:30};
  function drawFloor(){var dpr=Math.min(devicePixelRatio||1,2),W=floor.clientWidth,H=floor.clientHeight;if(!W||!H)return;
    var w=Math.round(W*dpr),h=Math.round(H*dpr);if(floor.width!==w||floor.height!==h){floor.width=w;floor.height=h;}
    var g=fg;g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,W,H);
    var ink=tok('--ink','#efe6d6'),ink2=tok('--ink-2','#d3c8b6'),ink3=tok('--ink-3','#b3a893'),gold=tok('--gold','#b08d57');
    var fy=H-24,dm=dMax(),x0=FL.x0,sx=(W-x0-14)/dm,sy=Math.min(sx,(fy-8)/2.95);FL.sx=sx;
    function X(m){return x0+m*sx;}function Yf(m){return fy-m*sy;}
    // floor and wall
    g.strokeStyle=ink3;g.lineWidth=1;g.beginPath();g.moveTo(x0,Yf(2.95));g.lineTo(x0,fy);g.lineTo(W,fy);g.stroke();
    // the painting on the wall (its colours, from the hung image)
    var pb=.62,pt=pb+Hmm/1000;g.fillStyle=gold;g.fillRect(x0-5,Yf(Math.min(pt,2.9)),5,(Math.min(pt,2.9)-pb)*sy);
    // ticks
    var stepM=sx>=34?1:sx>=16?2:5,lab=sx*stepM>=30?stepM:stepM*2;g.fillStyle=ink3;g.font='400 12px '+tok('--song','serif');g.textBaseline='top';g.textAlign='center';
    for(var m=0;m<=dm+.001;m+=stepM){var x=X(m);g.fillRect(Math.round(x)-.5,fy,1,m%lab===0?6:3);if(m%lab===0&&m>0&&x<W-10)g.fillText(m+'',x,fy+8);}
    var ll=Math.floor(dm/lab)*lab,lx=X(ll)+g.measureText(ll+'').width/2+3;g.textAlign='left';if(lx+13<=W)g.fillText('米',lx,fy+8);
    // the bench
    var bx=X(4),bw=1.6*sx,bh=.45*sy;g.strokeStyle=ink3;g.lineWidth=2;g.beginPath();g.moveTo(bx,fy-bh);g.lineTo(bx+bw,fy-bh);g.moveTo(bx+bw*.12,fy-bh);g.lineTo(bx+bw*.12,fy);g.moveTo(bx+bw*.88,fy-bh);g.lineTo(bx+bw*.88,fy);g.stroke();
    // the fusion mark, once found
    if(S.found){var fx=X(S.found);g.strokeStyle=gold;g.lineWidth=1;g.setLineDash([2,3]);g.beginPath();g.moveTo(fx,fy);g.lineTo(fx,Yf(2.2));g.stroke();g.setLineDash([]);
      g.fillStyle=gold;g.beginPath();g.moveTo(fx,fy-1);g.lineTo(fx-4,fy+6);g.lineTo(fx+4,fy+6);g.closePath();g.fill();}
    // you: sight lines to the top and bottom of the painting, then the figure
    var px=X(S.d),eye=Yf(1.58);g.fillStyle=gold;g.globalAlpha=.16;g.beginPath();g.moveTo(px,eye);g.lineTo(x0,Yf(Math.min(pt,2.9)));g.lineTo(x0,Yf(pb));g.closePath();g.fill();g.globalAlpha=1;
    g.strokeStyle=gold;g.lineWidth=1;g.beginPath();g.moveTo(px,eye);g.lineTo(x0,Yf(Math.min(pt,2.9)));g.moveTo(px,eye);g.lineTo(x0,Yf(pb));g.stroke();
    var sw=Math.abs(S.dv)>.05&&!reduce?Math.sin(S.stepPh)*.22:0,hip=Yf(.9),hr=Math.max(3,.11*sy);
    g.strokeStyle=ink;g.fillStyle=ink;g.lineWidth=Math.max(2,sy*.07);g.lineCap='round';
    g.beginPath();g.moveTo(px,hip);g.lineTo(px+sw*sx,fy-1);g.moveTo(px,hip);g.lineTo(px-sw*sx,fy-1);g.moveTo(px,hip);g.lineTo(px,Yf(1.42));g.stroke();
    g.beginPath();g.arc(px,Yf(1.55),hr,0,6.2832);g.fill();
    // the handle hint: a small grip under the figure
    g.fillStyle=ink2;g.beginPath();g.arc(px,fy,3,0,6.2832);g.fill();}

  // the pigments in view
  function barUpdate(){if(!dots){barTx.textContent='';return;}var v=vpCss(),s=scale(),x0=S.cx-v.w/2/s,x1=S.cx+v.w/2/s,y0=S.cy-v.h/2/s,y1=S.cy+v.h/2/s;
    var rg=range(dots,y0,y1),st=Math.max(1,Math.floor((rg[1]-rg[0])/40000)),cnt=new Array(PIG.length).fill(0),n=0;
    for(var i=rg[0];i<rg[1];i+=st){var px=dots.pos[i*2],py=dots.pos[i*2+1];if(px<x0||px>x1||py<y0||py>y1)continue;cnt[dots.at[i*4]]++;n++;}
    if(!n){barTx.textContent='';return;}
    var order=cnt.map(function(c,i){return[c,i];}).filter(function(a){return a[0]>0;}).sort(function(a,b){return b[0]-a[0];});
    var key=order.map(function(a){return a[1]+':'+Math.round(a[0]/n*50);}).join(',')+'|'+S.age.toFixed(2);if(key===barUpdate.k)return;barUpdate.k=key;
    barEl.innerHTML=order.map(function(a){var p=PIG[a[1]],c=S.age>0&&p.o?mixHex(p.c,p.o,S.age):p.c;return '<i style="flex:'+a[0]+' 1 0;background:'+c+'" title="'+p.n+'"></i>';}).join('');
    var top=order.slice(0,4).map(function(a){return PIG[a[1]].n+' '+Math.round(a[0]/n*100)+'%';});
    barTx.textContent=nb(T.bar+top.join('，')+(order.length>4?'……':''));}
  function mixHex(a,b,t){var A=hex(a),B=hex(b);return 'rgb('+A.map(function(v,i){return Math.round(v+(B[i]-v)*t);}).join(',')+')';}

  // ---------- 调色盘混 vs. 眼睛混
  var chipsEl=q('.dt-chips'),slotEls=root.querySelectorAll('.dt-slot');
  MIXCHIPS.forEach(function(k){var p=PIG.filter(function(x){return x.k===k;})[0],b=document.createElement('button');b.type='button';b.className='dt-chip';b.dataset.k=k;
    b.setAttribute('aria-label',p.n);b.title=p.n;b.innerHTML='<i style="background:'+(p.o||p.c)+'"></i>';chipsEl.appendChild(b);
    b.addEventListener('click',function(){S.mix[S.slot]=p;S.slot=1-S.slot;S.twist=0;stirDirty=eyeDirty=true;mixUI();api.sfx.tick(.03);});});
  Array.prototype.forEach.call(slotEls,function(b){b.addEventListener('click',function(){S.slot=+b.dataset.s;mixUI();});});
  function fresh(p){return p.o||p.c;}
  function mixUI(){Array.prototype.forEach.call(slotEls,function(b,i){b.setAttribute('aria-pressed',S.slot===i?'true':'false');b.querySelector('i').style.background=fresh(S.mix[i]);
      b.querySelector('span').textContent=(i?'颜色二：':'颜色一：')+S.mix[i].n;});
    Array.prototype.forEach.call(chipsEl.children,function(b){b.classList.toggle('a',b.dataset.k===S.mix[0].k);b.classList.toggle('b',b.dataset.k===S.mix[1].k);});
    var a=lin(fresh(S.mix[0])),b=lin(fresh(S.mix[1])),pal=subMix(a,b,.5),eye=[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2],r=Y(eye)/Math.max(Y(pal),1e-4);
    lumEl.textContent=nb(S.mix[0].k===S.mix[1].k?'两种颜色一样，两种混法也一样。换一种再试。':r<1.15?'这一对颜色，两种混法差不多亮。':'同样的'+S.mix[0].n+'和'+S.mix[1].n+'：眼睛混出的颜色，比调色盘上搅出的亮 '+(r>=2?(Math.round(r*10)/10)+' 倍':Math.round((r-1)*100)+'%')+'。');
    stirC.setAttribute('aria-label','调色盘：'+S.mix[0].n+'和'+S.mix[1].n+'搅在一起');eyeC.setAttribute('aria-label','眼睛混：'+S.mix[0].n+'和'+S.mix[1].n+'的点并排');}
  // subtractive: weighted geometric mean of the two reflectances, a little darker
  function subMix(a,b,f){return[0,1,2].map(function(i){return .94*Math.exp(f*Math.log(Math.max(a[i],1e-3))+(1-f)*Math.log(Math.max(b[i],1e-3)));});}
  var stirDirty=true,eyeDirty=true,stirImg=null,SW=96,SH=72;
  function drawStir(){var dpr=Math.min(devicePixelRatio||1,2),W=stirC.clientWidth,H=stirC.clientHeight;if(!W||!H)return;
    if(stirC.width!==SW||stirC.height!==SH){stirC.width=SW;stirC.height=SH;}
    var g=stirC.getContext('2d');if(!stirImg)stirImg=g.createImageData(SW,SH);var D=stirImg.data,a=lin(fresh(S.mix[0])),b=lin(fresh(S.mix[1])),m=1-Math.exp(-Math.abs(S.twist)/16);
    var la=a.map(function(v){return Math.log(Math.max(v,1e-3));}),lb=b.map(function(v){return Math.log(Math.max(v,1e-3));}),e=.06+.42*m,tw=S.twist;
    for(var y=0;y<SH;y++)for(var x=0;x<SW;x++){var u=(x-SW/2)/(SH/2),v=(y-SH/2)/(SH/2),r=Math.sqrt(u*u+v*v),ph=tw*Math.pow(Math.max(0,1.25-r),1.4),c=Math.cos(ph),s=Math.sin(ph),
        xr=u*c-v*s,yr=u*s+v*c,st=.5+.5*Math.sin(xr*2.6+.8*Math.sin(yr*2.2+1.3)),f=sm(.5-e,.5+e,st);f=f+(.5-f)*m*m;
        var o=(y*SW+x)*4,dk=.94+.06*(1-4*f*(1-f));for(var k=0;k<3;k++)D[o+k]=l2s(dk*Math.exp(f*la[k]+(1-f)*lb[k]));D[o+3]=255;}
    g.putImageData(stirImg,0,0);stirDirty=false;}
  var eyeDots=null;
  function drawEye(){var dpr=Math.min(devicePixelRatio||1,2),W=eyeC.clientWidth,H=eyeC.clientHeight;if(!W||!H)return;var w=Math.round(W*dpr),h=Math.round(H*dpr);if(eyeC.width!==w||eyeC.height!==h){eyeC.width=w;eyeC.height=h;}
    var g=eyeC.getContext('2d'),a=lin(fresh(S.mix[0])),b=lin(fresh(S.mix[1])),avg=[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2],p=K*PITCH/S.d*dpr;   // device px per dot, same walk
    g.setTransform(1,0,0,1,0,0);g.fillStyle=rgbS(avg);g.fillRect(0,0,w,h);
    var vis=sm(1.6,3,p);
    if(vis>0){var R2=rng(7),ca=rgbS(a),cb=rgbS(b),nx=Math.ceil(w/p)+1,ny=Math.ceil(h/p)+1;g.globalAlpha=vis;
      [ca,cb].forEach(function(col,ci){var R3=rng(7);g.fillStyle=col;g.beginPath();
        for(var y=0;y<ny;y++)for(var x=0;x<nx;x++){var t=R3(),jx=R3()-.5,jy=R3()-.5,rr=R3();if((t<.5?0:1)!==ci)continue;
          var cx=(x+(y&1?.5:0)+jx*.4)*p,cy=(y+jy*.4)*p,r=p*(.52+.14*rr);if(p<4){g.rect(cx-r,cy-r,r*2,r*2);}else{g.moveTo(cx+r,cy);g.arc(cx,cy,r,0,6.2832);}}
        g.fill();});g.globalAlpha=1;}
    cap3.querySelector('span').textContent=nb(level(S.d)===2?T.eyeFar:T.eyeNear);eyeDirty=false;}

  // stirring: circular drags on the palette add twist (angle swept around the centre)
  var stir=null;
  stirC.addEventListener('pointerdown',function(e){if(e.button!=null&&e.button!==0&&e.pointerType==='mouse')return;e.preventDefault();try{stirC.setPointerCapture(e.pointerId);}catch(_){}
    var rc=stirC.getBoundingClientRect();stir={id:e.pointerId,cx:rc.left+rc.width/2,cy:rc.top+rc.height/2,a:Math.atan2(e.clientY-rc.top-rc.height/2,e.clientX-rc.left-rc.width/2),acc:0};stirC.classList.add('drag');});
  stirC.addEventListener('pointermove',function(e){if(!stir||stir.id!==e.pointerId)return;var a=Math.atan2(e.clientY-stir.cy,e.clientX-stir.cx),d=a-stir.a;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;
    stir.a=a;var r=Math.hypot(e.clientX-stir.cx,e.clientY-stir.cy);if(r<6)return;S.twist+=d*1.2;stir.acc+=Math.abs(d);stirDirty=true;if(stir.acc>1.4){stir.acc=0;snd('stir',.4,function(){api.sfx.puff(.02,.35);});}});
  function stirUp(e){if(stir&&(!e||e.pointerId===stir.id)){stir=null;stirC.classList.remove('drag');}}
  stirC.addEventListener('pointerup',stirUp);stirC.addEventListener('pointercancel',stirUp);
  function holdOn(){if(!S.hold){S.hold=true;holdBtn.setAttribute('aria-pressed','true');snd('stir',.4,function(){api.sfx.puff(.02,.5);});}}
  function holdOff(){S.hold=false;holdBtn.setAttribute('aria-pressed','false');}
  holdBtn.addEventListener('pointerdown',function(e){e.preventDefault();try{holdBtn.setPointerCapture(e.pointerId);}catch(_){}holdOn();});
  holdBtn.addEventListener('pointerup',holdOff);holdBtn.addEventListener('pointercancel',holdOff);holdBtn.addEventListener('lostpointercapture',holdOff);
  holdBtn.addEventListener('contextmenu',function(e){e.preventDefault();});
  holdBtn.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();if(!e.repeat)holdOn();}});
  holdBtn.addEventListener('keyup',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();holdOff();}});
  holdBtn.addEventListener('blur',holdOff);holdBtn.addEventListener('click',function(e){e.preventDefault();});

  // ---------- 1886
  var ageBtns=root.querySelectorAll('[data-age]');
  Array.prototype.forEach.call(ageBtns,function(b){b.addEventListener('click',function(){S.ageT=+b.dataset.age;S.touched=true;
    Array.prototype.forEach.call(ageBtns,function(x){x.setAttribute('aria-pressed',x===b?'true':'false');});api.sfx.whoosh(.02,1.2);dirty=true;});});

  // ---------- input: the painting (wall or panel view)
  var drag=null,pinch=null,ptrs={},suppress=false;
  function surfaceDown(e,where){if(e.button!=null&&e.button!==0&&e.pointerType==='mouse')return false;ptrs[e.pointerId]={x:e.clientX,y:e.clientY};
    var ids=Object.keys(ptrs);
    if(ids.length===2){var p=ptrs[ids[0]],r=ptrs[ids[1]];pinch={d0:S.d,dist:Math.hypot(p.x-r.x,p.y-r.y)||1};drag=null;return true;}
    drag={id:e.pointerId,x0:e.clientX,y0:e.clientY,x:e.clientX,y:e.clientY,moved:false,t:performance.now(),vx:0,vy:0,where:where,touch:e.pointerType==='touch'};S.vx=S.vy=0;S.anchor=null;return true;}
  function surfaceMove(e){if(!ptrs[e.pointerId])return;ptrs[e.pointerId]={x:e.clientX,y:e.clientY};
    if(pinch){var ids=Object.keys(ptrs);if(ids.length<2)return;var p=ptrs[ids[0]],r=ptrs[ids[1]],dist=Math.hypot(p.x-r.x,p.y-r.y)||1;
      S.dT=clamp(pinch.d0*pinch.dist/dist,dMin(),dMax());S.anchor=anchorAt((p.x+r.x)/2,(p.y+r.y)/2);S.touched=true;dirty=true;return;}
    if(!drag||drag.id!==e.pointerId)return;var dx=e.clientX-drag.x,dy=e.clientY-drag.y,now=performance.now(),dtm=Math.max(1,now-drag.t);
    if(!drag.moved&&Math.hypot(e.clientX-drag.x0,e.clientY-drag.y0)>6)drag.moved=true;
    if(drag.moved){var s=scale();S.cxT-=dx/s;S.cyT-=dy/s;clampPan();S.cx=S.cxT;S.cy=S.cyT;drag.vx=-dx/s/(dtm/1000);drag.vy=-dy/s/(dtm/1000);S.touched=true;dirty=true;view.classList.toggle('drag',drag.where==='panel');}
    drag.x=e.clientX;drag.y=e.clientY;drag.t=now;}
  function surfaceUp(e){var had=!!ptrs[e.pointerId];delete ptrs[e.pointerId];if(!had)return null;
    if(pinch){if(Object.keys(ptrs).length<2)pinch=null;drag=null;return 'pinch';}
    if(!drag||drag.id!==e.pointerId)return null;var d=drag;drag=null;view.classList.remove('drag');
    if(d.moved){if(performance.now()-d.t<80){S.vx=clamp(d.vx,-4000,4000);S.vy=clamp(d.vy,-4000,4000);}return 'drag';}
    if(e.type==='pointerup'){approach(e.clientX,e.clientY);return 'tap';}return null;}
  function wheel(e){e.preventDefault();var dy=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?400:1);
    S.dT=clamp(S.dT*Math.exp(dy*(e.ctrlKey?.01:.0016)),dMin(),dMax());S.anchor=anchorAt(e.clientX,e.clientY);S.touched=true;dirty=true;}
  // wall: capture phase on the frame, so the painting's own click (open the viewer) does not fire
  function wallDown(e){suppress=false;if(mode!=='wall')return;if(surfaceDown(e,'wall')){e.stopPropagation();try{frameEl.setPointerCapture(e.pointerId);}catch(_){}}}
  function wallMove(e){if(mode!=='wall')return;if(ptrs[e.pointerId]){surfaceMove(e);e.stopPropagation();}else if(cw)cw.style.cursor='zoom-in';}
  function wallUp(e){if(mode!=='wall')return;var r=surfaceUp(e);if(r){e.stopPropagation();suppress=true;}}
  function wallClick(e){if(suppress||mode==='wall'){suppress=false;e.stopPropagation();e.preventDefault();}}
  function wallWheel(e){if(mode==='wall')wheel(e);}
  if(frameEl){frameEl.addEventListener('pointerdown',wallDown,true);frameEl.addEventListener('pointermove',wallMove,true);frameEl.addEventListener('pointerup',wallUp,true);
    frameEl.addEventListener('pointercancel',wallUp,true);frameEl.addEventListener('click',wallClick,true);frameEl.addEventListener('wheel',wallWheel,{passive:false});}
  // panel view: mouse drags pan; touch keeps vertical page scrolling (pan-y) but pans sideways, pinches and taps
  view.addEventListener('pointerdown',function(e){if(surfaceDown(e,'panel')&&e.pointerType!=='touch'){try{view.setPointerCapture(e.pointerId);}catch(_){}e.preventDefault();}});
  view.addEventListener('pointermove',surfaceMove);
  view.addEventListener('pointerup',surfaceUp);view.addEventListener('pointercancel',surfaceUp);
  view.addEventListener('wheel',wheel,{passive:false});

  // ---------- input: the floor strip (脚步)
  var fdrag=null;
  function floorD(x){var rc=floor.getBoundingClientRect();return(x-rc.left-FL.x0)/FL.sx;}
  floor.addEventListener('pointerdown',function(e){if(e.button!=null&&e.button!==0&&e.pointerType==='mouse')return;fdrag={id:e.pointerId,x0:e.clientX,y0:e.clientY,on:e.pointerType!=='touch'};
    if(fdrag.on){try{floor.setPointerCapture(e.pointerId);}catch(_){}walkTo(floorD(e.clientX));}});
  floor.addEventListener('pointermove',function(e){if(!fdrag||fdrag.id!==e.pointerId)return;
    if(!fdrag.on){if(Math.abs(e.clientX-fdrag.x0)>8&&Math.abs(e.clientX-fdrag.x0)>Math.abs(e.clientY-fdrag.y0)){fdrag.on=true;try{floor.setPointerCapture(e.pointerId);}catch(_){}}else return;}
    walkTo(floorD(e.clientX));});
  function floorUp(e){if(!fdrag||fdrag.id!==e.pointerId)return;if(!fdrag.on&&e.type==='pointerup'&&Math.hypot(e.clientX-fdrag.x0,e.clientY-fdrag.y0)<10)walkTo(floorD(e.clientX));fdrag=null;}
  floor.addEventListener('pointerup',floorUp);floor.addEventListener('pointercancel',function(e){if(fdrag&&fdrag.id===e.pointerId)fdrag=null;});
  floor.addEventListener('keydown',function(e){var k=e.key,st=e.shiftKey?1:.25,d=S.dT;
    if(k==='ArrowRight'||k==='ArrowUp')d+=st;else if(k==='ArrowLeft'||k==='ArrowDown')d-=st;else if(k==='PageUp')d+=1;else if(k==='PageDown')d-=1;else if(k==='Home')d=dMin();else if(k==='End')d=dMax();else return;
    e.preventDefault();e.stopPropagation();walkTo(d);});

  // ---------- data: the painting texture, then the dots (s_dots.webp from the cutter's dots, else generated from the painting)
  var dimg=api.img('s_dots.webp'),dotsTried=false;
  function onImage(){if(dead)return;if(R&&!R.tex)R.setImage(hung);dirty=true;tryDots();}
  function tryDots(){if(dots||dead||dotsTried||!ok(hung))return;var D=ok(dimg)?decodeDots(dimg,Wmm,Hmm,art.w):null;
    if(!D&&!(dimg.complete||dimg.naturalWidth===0&&dimg.dataset&&dimg.dataset.failed))return;   // wait for the dot image (or its failure)
    dotsTried=true;setTimeout(function(){if(!dots&&!dead)useDots(D||genDots(hung,Wmm,Hmm,3));},20);}
  function useDots(D){if(!D||dead)return;dots=D;setPitch(D.pitch);if(R)R.setDots(D);barUpdate.k='';S.level=-1;dirty=true;}
  if(ok(dimg))tryDots();else{dimg.addEventListener('load',tryDots,{once:true});dimg.addEventListener('error',function(){dotsTried=false;dimg.dataset.failed=1;tryDots();},{once:true});}
  var dotsTO=setTimeout(function(){if(!dots&&!dead&&ok(hung)){dotsTried=true;useDots(genDots(hung,Wmm,Hmm,3));}},9000);
  if(ok(hung))onImage();else hung.addEventListener('load',onImage,{once:true});

  // ---------- loop
  var lastHint='',lastM='',barT=0,lastD=-1;
  function tick(now){if(dead)return;raf=requestAnimationFrame(tick);if(!host.isConnected){dispose();return;}
    var dt=last?Math.min((now-last)/1000,.05):0;last=now;
    var r=artRect(),wv=wallVisible(r);mount(wv?'wall':'panel');
    if(!S.init&&vpCss().w>0){S.init=true;S.d=S.dT=dFit();S.cx=S.cxT=Wmm/2;S.cy=S.cyT=Hmm/2;}
    var key=r.left.toFixed(1)+r.top.toFixed(1)+r.width.toFixed(1)+view.clientWidth+(wv?1:0);if(key!==tick.k){tick.k=key;dirty=true;eyeDirty=true;
      var mx=dMax();if(S.d>mx||S.dT>mx){S.d=Math.min(S.d,mx);S.dT=Math.min(S.dT,mx);}clampPan();}
    step(dt);
    if(mode==='wall'){var id=idle();cv.classList.toggle('on',!id);chipW.classList.toggle('on',!id);}
    if(dirty&&!(mode==='wall'&&idle())){render();}dirty=false;
    drawFloor();
    if(stirDirty)drawStir();if(eyeDirty)drawEye();
    if(now-barT>220&&S.d!==lastD){barT=now;lastD=S.d;barUpdate();}else if(now-barT>600){barT=now;barUpdate();}
    var m=S.d<10?(Math.round(S.d*10)/10).toFixed(1):String(Math.round(S.d));if(m!==lastM){lastM=m;mEl.textContent=m;chipW.querySelector('b').textContent=m;
      floor.setAttribute('aria-valuenow',S.d.toFixed(1));floor.setAttribute('aria-valuetext','离画 '+m+' 米');floor.setAttribute('aria-valuemax',dMax().toFixed(0));}
    chipW.querySelector('span').textContent=S.level===2?'点融成了画':S.level===1?'点在眼睛里混':'一颗颗的点';
    var tch=touchUI(),hv=wv?T.hintWall:(tch?T.hintTouch:T.hint);if(hv!==lastHint){hintEl.textContent=nb(hv);lastHint=hv;
      capEl.textContent=nb(tch?'脚步：在小人所在的地面上左右拖。长椅约在 4 米处。':'脚步：拖动小人，或聚焦后按左右方向键。长椅约在 4 米处。');
      cap2.querySelector('span').textContent=nb(tch?T.stirTextTouch:T.stirText);}}
  mixUI();
  raf=requestAnimationFrame(tick);

  function dispose(){if(dead)return;dead=true;cancelAnimationFrame(raf);clearTimeout(dotsTO);
    if(cv.parentNode)cv.parentNode.removeChild(cv);if(chipW.parentNode)chipW.parentNode.removeChild(chipW);if(R)R.kill();
    if(cw){cw.style.touchAction=cwTouch;cw.style.cursor='';}
    if(frameEl){frameEl.removeEventListener('pointerdown',wallDown,true);frameEl.removeEventListener('pointermove',wallMove,true);frameEl.removeEventListener('pointerup',wallUp,true);
      frameEl.removeEventListener('pointercancel',wallUp,true);frameEl.removeEventListener('click',wallClick,true);frameEl.removeEventListener('wheel',wallWheel);}}
  host._dispose=dispose;
  // test hooks
  if(EH.debug)EH.debug.dots={S:S,walk:function(d,cx,cy){S.touched=true;S.d=S.dT=clamp(d,dMin(),dMax());if(cx!=null){S.cx=S.cxT=cx;S.cy=S.cyT=cy;}S.anchor=null;dirty=true;eyeDirty=true;},
    walkTo:walkTo,age:function(v){S.ageT=v;},dFit:dFit,dMax:dMax,DFUSE:DFUSE,gl:!!R,dots:function(){return dots?{n:dots.n,src:dots.src}:null;},mode:function(){return mode;},
    stir:function(t){S.twist=t;stirDirty=true;},pick:function(a,b){S.mix=[PIG.filter(function(p){return p.k===a;})[0],PIG.filter(function(p){return p.k===b;})[0]];stirDirty=eyeDirty=true;mixUI();}};
});
})();

;
/* Special exhibit "glean" (现实主义 · 你来拾穗).
   The visitor gleans. Press and hold on the stubble of the hung painting (or on the painting in the panel on narrow screens, or hold the
   “弯腰拾穗” control): you bend down — the view dips toward the ground until the horizon leaves the top, and the pointer becomes a hand. Rest
   the hand on one of the loose ears of wheat and keep holding: it takes a moment of effort (a hold that grows longer as the back tires),
   then the ear snaps free and flies into the small handful in the corner. The handful grows ear by ear; the panel shows it at true scale
   beside the distant haystacks (scaled by the tiny figure standing at their foot). Bending tires the back: standing up gets slower and
   stalls halfway, the bent view breathes. A “地平线” slider pulls the horizon down to the middle: sky and far field move down, the middle
   field is squeezed, the three women stay — their backs and heads now rise into the sky. A lens (drag it) finds the overseer on horseback.
   Geometry is in main.webp pixels (2400 × 1796); cut/layers.json (polled) replaces the defaults (horizon, ears, overseer, haystacks, layers). */
(function(){
'use strict';
if(!window.EH||!EH.special)return;
function clamp(x,a,b){return x<a?a:x>b?b:x;}
function lerp(a,b,t){return a+(b-a)*t;}
function sm(t){t=clamp(t,0,1);return t*t*(3-2*t);}
function nb(t){return String(t==null?'':t).replace(/([㐀-鿿）》”]) (?=[0-9A-Za-z])/g,'$1 ').replace(/([0-9A-Za-z.%°]) (?=[㐀-鿿（《“])/g,'$1 ');}
function ok(i){return !!(i&&i.complete&&i.naturalWidth>0);}
function xhrJSON(url,cb){try{var x=new XMLHttpRequest();x.open('GET',url+'?t='+Date.now(),true);x.overrideMimeType('application/json');
  x.onload=function(){if(x.status===200||(x.status===0&&x.responseText)){try{cb(JSON.parse(x.responseText));}catch(e){cb(null);}}else cb(null);};
  x.onerror=function(){cb(null);};x.send();}catch(e){cb(null);}}
function rng(s){return function(){s=(s*16807)%2147483647;return s/2147483647;};}
function txt(v){if(v==null)return '';if(typeof v==='string')return v;if(typeof v==='object')return v.text||v.t||v.label||'';return String(v);}

// ---------------------------------------------------------------- defaults (main.webp px), measured by eye; replaced by cut/layers.json
var DEF={W:2400,H:1796,horizon:562,farTop:340,
  overseer:[2088,512,2152,594],
  hay:[[330,360,550,594],[515,388,742,602]],
  figure:[563,552,591,620],                                  // the small figure at the haystacks' foot: our yardstick (≈ 1.65 m)
  women:[[410,660,1020,1290],[860,740,1500,1420],[1490,510,2080,1560]],
  corner:[2262,1742]};                                     // where the handful stands (the tie of the bundle)
var CROP_HAY=[296,322,784,640];                            // the scale strip in the panel: haystacks + the figure
var FIG_M=1.65,HANDFUL_M=.42;                              // a person, a handful of ears with their straw

function css(){if(document.getElementById('s-glean-css'))return;var s=document.createElement('style');s.id='s-glean-css';s.textContent=
  '.gl{margin-top:16px}'+
  '.gl-view{position:relative;display:none;margin:0 0 12px;line-height:0}'+
  '.gl.narrow .gl-view{display:block}'+
  '.gl-stage{display:block;width:100%;height:auto;touch-action:pan-y;background:#26231e;cursor:grab;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;box-shadow:0 18px 40px -22px rgba(0,0,0,.7)}'+
  '.gl-stage.bent{cursor:none}'+
  '.gl-row{display:flex;align-items:stretch;gap:16px}'+
  '.gl-scale{flex:1 1 auto;min-width:0;height:128px;display:block}'+
  '.gl-bend{flex:0 0 auto;width:84px;min-height:128px;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:6px;padding:0 4px 10px;touch-action:none;'+
    'font:400 14.5px/1.3 var(--song);color:inherit;border:1px solid var(--ink-3);border-radius:2px;background:transparent;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;text-align:center}'+
  '.gl-bend svg{display:block;overflow:visible}'+
  '.gl-bend:focus-visible{outline:1px solid currentColor;outline-offset:3px}'+
  '.gl-bend[aria-pressed="true"]{font-weight:500;border-color:currentColor}'+
  '.gl-meta{display:flex;flex-wrap:wrap;justify-content:space-between;gap:4px 24px;margin:10px 0 2px;font:400 13.5px/1.7 var(--song);color:var(--ink-2)}'+
  '.gl-count{font-variant-numeric:tabular-nums;white-space:nowrap}'+
  '@media (max-width:560px){.gl-meta{flex-direction:column;gap:2px}}'+
  '.gl-back{margin:4px 0 0!important;font:400 13.5px/1.7 var(--song)!important;color:var(--ink)}.gl-back[hidden]{display:none}'+
  '.gl-hz{display:grid;grid-template-columns:auto 1fr;align-items:center;gap:4px 14px;margin:18px 0 0}'+
  '.gl-hz>b{font:500 15px/1.7 var(--song)}'+
  '.gl-sl{display:flex;align-items:center;gap:10px;min-height:44px;font:400 13px/1.4 var(--song);color:var(--ink-2)}'+
  '.gl-sl span{white-space:nowrap}'+
  '.gl-sl input{flex:1 1 auto;min-width:80px;height:44px;margin:0;background:transparent;-webkit-appearance:none;appearance:none;color:inherit;cursor:pointer;touch-action:pan-y}'+
  '.gl-sl input::-webkit-slider-runnable-track{height:1px;background:currentColor}'+
  '.gl-sl input::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;margin-top:-8.5px;border-radius:50%;background:var(--wall,#2b2825);border:1.5px solid var(--ink)}'+
  '.gl-sl input::-moz-range-track{height:1px;background:currentColor}'+
  '.gl-sl input::-moz-range-thumb{width:16px;height:16px;border-radius:50%;background:var(--wall,#2b2825);border:1.5px solid var(--ink)}'+
  '.gl-sl input:focus-visible{outline:1px solid currentColor;outline-offset:2px}'+
  '.gl-cap{margin:4px 0 0!important;font-size:14px!important;line-height:1.85!important;color:var(--ink-2);min-height:3.7em}'+
  '.gl-again[hidden]{display:none}.gl .acts{margin:14px 0 0}.gl .act{min-width:44px}'+
  '.gl-found{margin:2px 0 0!important;font-size:14px!important;line-height:1.85!important}.gl-found[hidden]{display:none}'+
  '.gl-found b{font-weight:500}'+
  '.gl-ov{position:absolute;left:0;top:0;pointer-events:none;z-index:1}'+
  '.gl-lens{position:absolute;z-index:3;left:0;top:0;border-radius:50%;touch-action:none;cursor:grab;display:none;-webkit-tap-highlight-color:transparent;'+
    'box-shadow:0 0 0 1.5px rgba(243,235,221,.9),0 0 0 3px rgba(20,16,12,.55),0 14px 28px -10px rgba(0,0,0,.7);outline:none}'+
  '.gl-lens.on{display:block}.gl-lens.drag{cursor:grabbing}'+
  '.gl-lens.hit{box-shadow:0 0 0 2px #d9b872,0 0 0 4px rgba(20,16,12,.55),0 0 22px 2px rgba(217,184,114,.45)}'+
  '.gl-lens:focus-visible{box-shadow:0 0 0 2px #f3ebdd,0 0 0 5px rgba(20,16,12,.8)}'+
  '.gl-lens canvas{position:absolute;inset:0;width:100%;height:100%;border-radius:50%;pointer-events:none}'+
  '.gl-lens i{position:absolute;left:50%;top:100%;transform:translate(-50%,8px);white-space:nowrap;font:500 13px/1.8 var(--song);font-style:normal;color:#f3ebdd;background:rgba(20,16,12,.84);padding:0 9px;border-radius:2px;pointer-events:none;opacity:0;transition:opacity .4s}'+
  '.gl-lens.hit i{opacity:1}';
  document.head.appendChild(s);}

// ---------------------------------------------------------------- the ear of wheat (sprite, drawn once): stalk down, head up; anchor = cut end
var EAR=null,EARS=null;   // EAR = {c, shade, w, h, ax, ay, len}; len = stalk end → head tip in sprite px
function makeEar(){if(EAR)return EAR;var k=2,w=64*k,h=240*k,c=document.createElement('canvas');c.width=w;c.height=h;var g=c.getContext('2d');
  var ax=w/2,ay=h-6*k,headLen=92*k,stalk=128*k,tipY=ay-stalk-headLen;g.lineCap='round';
  // stalk: a slight bend
  g.strokeStyle='#b39152';g.lineWidth=3.6*k;g.beginPath();g.moveTo(ax,ay);g.quadraticCurveTo(ax+5*k,ay-stalk*.5,ax+2*k,ay-stalk-4*k);g.stroke();
  g.strokeStyle='rgba(236,214,150,.8)';g.lineWidth=1.2*k;g.beginPath();g.moveTo(ax-1*k,ay);g.quadraticCurveTo(ax+4*k,ay-stalk*.5,ax+1*k,ay-stalk-4*k);g.stroke();
  // awns (fine bristles fanning up from the spikelets)
  var r=rng(11);g.strokeStyle='rgba(222,196,128,.75)';g.lineWidth=.9*k;
  for(var i=0;i<16;i++){var t=i/15,y=ay-stalk-t*headLen*.95,s=i%2?1:-1,len=(26+r()*20)*k*(0.6+t*.6);g.beginPath();g.moveTo(ax+2*k+s*4*k,y);g.lineTo(ax+2*k+s*(9+t*6)*k,y-len);g.stroke();}
  // spikelets: alternating grains up the head
  for(var j=0;j<14;j++){var tt=j/13,yy=ay-stalk-4*k-tt*(headLen-14*k),sd=j%2?1:-1,rw=(10.5-tt*3.6)*k,rh=(13-tt*3)*k;
    var gr=g.createLinearGradient(ax-8*k,yy,ax+8*k,yy);gr.addColorStop(0,'#8e6a2e');gr.addColorStop(.5,'#d8b565');gr.addColorStop(1,'#f0d98f');
    g.fillStyle=gr;g.save();g.translate(ax+2*k+sd*4.6*k,yy);g.rotate(sd*.46);g.beginPath();g.ellipse(0,0,rw,rh,0,0,Math.PI*2);g.fill();
    g.strokeStyle='rgba(98,70,30,.55)';g.lineWidth=.8*k;g.stroke();g.restore();}
  // shade version (for the shadow on the ground)
  var sh=document.createElement('canvas');sh.width=w;sh.height=h;var sg=sh.getContext('2d');sg.drawImage(c,0,0);sg.globalCompositeOperation='source-in';sg.fillStyle='rgba(28,22,12,1)';sg.fillRect(0,0,w,h);
  // bright version (glint / highlight)
  var br=document.createElement('canvas');br.width=w;br.height=h;var bg=br.getContext('2d');bg.drawImage(c,0,0);bg.globalCompositeOperation='source-in';bg.fillStyle='rgba(255,240,200,1)';bg.fillRect(0,0,w,h);
  EAR={c:c,shade:sh,bright:br,w:w,h:h,ax:ax,ay:ay,len:ay-tipY,k:k};return EAR;}

EH.special('glean',function(host,room,api){
  css();var E=makeEar();
  var sp=room.special||{},art=room.art||{},LB=sp.labels||{};
  var HO=sp.hint&&typeof sp.hint==='object'?sp.hint:null;
  function fixHint(t){return t?String(t).replace(/[，,]?\s*或按空格键[^，。]*/,''):t;}
  var T={
    bend:txt(LB.bend||LB.glean)||'弯腰拾穗',
    horizon:txt(LB.horizon)||'地平线',hzA:txt(LB.horizonHigh||LB.high)||'米勒的',hzB:txt(LB.horizonMid||LB.mid)||'中线',
    lens:txt(LB.lens)||'远处有什么',overseer:txt(LB.overseer)||'马背上的监工',
    count:txt(LB.count)||'拾了',unit:txt(LB.unit)||'根',
    hint:fixHint(txt(HO&&HO.mouse)||(typeof sp.hint==='string'&&sp.hint))||'在墙上画里的麦茬上按住鼠标，弯下腰；把手停在一根麦穗上别松开，拾起它。',
    hintNarrow:fixHint(txt(HO&&HO.mouse)||(typeof sp.hint==='string'&&sp.hint))||'在上面的画里按住麦茬，弯下腰；把手停在一根麦穗上别松开，拾起它。',
    hintTouch:fixHint(txt(HO&&HO.touch))||'手指按住画里的麦茬不放，弯下腰；停在一根麦穗上，拾起它。也可以按住“弯腰拾穗”。',
    back:txt(sp.back||LB.back)||'腰酸了：直起身来，一次比一次慢。',
    backRest:txt(sp.backRest||LB.backRest)||'直起身歇一会儿，腰会缓过来。',
    done:txt(sp.done||LB.done)||'地上的麦穗拾完了。一整天弯着腰，换来手里这一把。',
    again:txt(LB.again)||'再拾一遍',
    scale:txt(sp.scaleNote||LB.scale)||'同一比例：远处的麦垛，它脚下的人，和你手里的这一把',
    hz0:txt(sp.horizonHigh||(sp.horizonText&&sp.horizonText[0]))||'米勒把地平线画得很高，天空只剩窄窄一条。三个人弯着腰，头都低在地平线以下，四周只有土地。',
    hz1:txt(sp.horizonMid||(sp.horizonText&&sp.horizonText[1]))||'地平线拉回中线，她们的背和头伸进了天空，一下子像立在高处的英雄。米勒没有这样画。',
    found:txt(sp.overseer||sp.overseerText)||'远处马背上的人，一般认为是看管收割的监工。堆成山的麦垛、满载的马车，是这片田主人的收成；拾穗的人只能在收割之后，捡地里剩下的。',
    lensHint:txt(sp.lensHint)||'拖动放大镜，看看远处。'
  };
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mqT=window.matchMedia?matchMedia('(hover: none)'):null;function touchUI(){return !!(mqT&&mqT.matches);}

  // ---------- DOM
  var wrap=document.createElement('div');wrap.className='gl';
  wrap.innerHTML='<div class="gl-view"><canvas class="gl-stage" role="img" aria-label="《拾穗者》：按住麦茬弯腰，停在麦穗上拾起它"></canvas></div>'+
    '<div class="gl-row"><canvas class="gl-scale" role="img"></canvas>'+
    '<button type="button" class="gl-bend" aria-pressed="false"><svg width="30" height="52" viewBox="0 0 30 52" aria-hidden="true"><path class="gl-fig" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg><span></span></button></div>'+
    '<div class="gl-meta"><span class="gl-hint"></span><span class="gl-count" aria-live="polite"></span></div>'+
    '<p class="gl-back" hidden aria-live="polite"></p>'+
    '<div class="gl-again acts" hidden><button type="button" class="act"></button></div>'+
    '<div class="gl-hz"><b></b><label class="gl-sl"><span class="a"></span><input type="range" min="0" max="100" step="1" value="0"><span class="b"></span></label></div>'+
    '<p class="gl-cap" aria-live="polite"></p>'+
    '<div class="acts"><button type="button" class="act gl-lensbtn" aria-pressed="false"></button></div>'+
    '<p class="gl-found small" hidden aria-live="polite"></p>';
  host.appendChild(wrap);
  var q=function(s){return wrap.querySelector(s);};
  var view=q('.gl-view'),stage=q('.gl-stage'),sgc=stage.getContext('2d'),scaleCv=q('.gl-scale'),scg=scaleCv.getContext('2d');
  var bendBtn=q('.gl-bend'),figPath=q('.gl-fig'),hintEl=q('.gl-hint'),countEl=q('.gl-count'),backEl=q('.gl-back'),againBox=q('.gl-again'),againBtn=againBox.querySelector('button');
  var slider=q('.gl-sl input'),capEl=q('.gl-cap'),lensBtn=q('.gl-lensbtn'),foundEl=q('.gl-found');
  bendBtn.querySelector('span').textContent=T.bend;bendBtn.setAttribute('aria-label',T.bend+'：按住');
  q('.gl-hz>b').textContent=T.horizon;q('.gl-sl .a').textContent=T.hzA;q('.gl-sl .b').textContent=T.hzB;slider.setAttribute('aria-label',T.horizon+'：从'+T.hzA+'到'+T.hzB);
  lensBtn.textContent=T.lens;againBtn.textContent=T.again;scaleCv.setAttribute('aria-label',T.scale);
  capEl.textContent=nb(T.hz0);

  // ---------- geometry + layers
  var G=JSON.parse(JSON.stringify(DEF));if(art.w)G.W=art.w;if(art.h)G.H=art.h;
  var hung=api.img(art.img||'main.webp');
  var LAY=null;            // [{img,x,y,w,h,fixed}] in z order (women: fixed) — null: the whole painting is one warped layer
  var EARPTS=null;
  function pt(v){if(Array.isArray(v)&&v.length>=2&&typeof v[0]==='number')return[v[0],v[1]];if(v&&typeof v.x==='number'&&typeof v.y==='number')return[v.x,v.y];return null;}
  function box(v){if(!v)return null;if(Array.isArray(v)&&v.length===4&&typeof v[0]==='number')return v.slice();var b=v.box||v.bbox||v.rect||v;
    if(Array.isArray(b)&&b.length===4&&typeof b[0]==='number')return b.slice();if(b&&typeof b.x==='number'&&typeof b.w==='number')return[b.x,b.y,b.x+b.w,b.y+b.h];
    if(b&&typeof b.x0==='number')return[b.x0,b.y0,b.x1,b.y1];return null;}
  function findKey(j,re,d){if(!j||typeof j!=='object'||d>3)return undefined;var ks=Object.keys(j);for(var i=0;i<ks.length;i++)if(re.test(ks[i]))return j[ks[i]];
    for(i=0;i<ks.length;i++){if(ks[i]==='layers')continue;var v=findKey(j[ks[i]],re,d+1);if(v!==undefined)return v;}return undefined;}
  function useLayers(j){if(!j||typeof j!=='object')return false;var sx=j.W&&G.W?G.W/j.W:1,sy=j.H&&G.H?G.H/j.H:sx;function S(p){return[p[0]*sx,p[1]*sy];}function SB(b){return[b[0]*sx,b[1]*sy,b[2]*sx,b[3]*sy];}
    var hz=findKey(j,/^horizon/i,0);if(typeof hz==='number')G.horizon=hz*sy;else if(hz&&typeof hz==='object'){if(typeof hz.y==='number')G.horizon=hz.y*sy;
      else{var poly=hz.polyline||hz.points||hz.line||(Array.isArray(hz)?hz:null);if(poly&&poly.length){var ys=poly.map(function(p){return(pt(p)||[0,G.horizon/sy])[1];});G.horizon=ys.reduce(function(a,b){return a+b;},0)/ys.length*sy;}}}
    var ov=box(findKey(j,/overseer|rider|horseman|监工/i,0));if(ov)G.overseer=SB(ov);
    var hs=findKey(j,/hay|stack|麦垛/i,0);if(Array.isArray(hs)&&hs.length){var hb=hs.map(box).filter(Boolean);if(hb.length)G.hay=hb.map(SB);}else{var h1=box(hs);if(h1)G.hay=[SB(h1)];}
    var fg=box(findKey(j,/scale_?fig|figure|person|yardstick/i,0));if(fg)G.figure=SB(fg);
    var ea=findKey(j,/^ears?$|ears|wheat|麦穗/i,0);if(ea&&!Array.isArray(ea)&&typeof ea==='object')ea=ea.points||ea.list||null;
    if(Array.isArray(ea)&&ea.length>=6){var P=[];ea.forEach(function(e){var p=pt(e);if(p){p=S(p);var a=e&&typeof e==='object'&&!Array.isArray(e)?(e.angle!=null?e.angle:e.a):null;P.push({x:p[0],y:p[1],a:a,len:e&&e.len?e.len*sx:null});}});if(P.length>=6)EARPTS=P;}
    // depth layers: everything but the women warps with the horizon; the women stay
    if(Array.isArray(j.layers)&&j.layers.length){var L=[];j.layers.slice().sort(function(a,b){return(a.z||0)-(b.z||0);}).forEach(function(l){var f=l.file||l.img;if(!f||l.w==null)return;
        var id=String(l.id||'')+' '+String(l.label||''),fixed=/wom|glean|figure|people|拾穗|农妇|人物/i.test(id);if(/overseer|lens|shadow_only|mask/i.test(id)&&!/far/i.test(id))return;
        var im=api.img('cut/'+f);if(!ok(im))im.addEventListener('load',function(){dirty=true;},{once:true});
        L.push({img:im,x:l.x*sx,y:l.y*sy,w:l.w*sx,h:l.h*sy,fixed:fixed,id:id});
        if(fixed){var b=[l.x*sx,l.y*sy,(l.x+l.w)*sx,(l.y+l.h)*sy];if(!useLayers.wom){G.women=[];useLayers.wom=1;}G.women.push(b);}});
      if(L.length>=2&&L.some(function(l){return l.fixed;}))LAY=L;}
    buildEars();dirty=true;return true;}
  var pollT=0,tries=0;function poll(){if(dead||++tries>60)return;xhrJSON(api.path('cut/layers.json'),function(j){if(dead)return;if(!useLayers(j))pollT=setTimeout(poll,tries<4?2000:8000);});}

  // ---------- ears on the ground
  var ears=[];                                             // {x,y,a,s,state:'ground'|'fly'|'gone', t, g(grasp 0..1), seed}
  function inWomen(x,y){return G.women.some(function(b){return x>b[0]+30&&x<b[2]-30&&y>b[1]&&y<b[3]-20;});}
  function persp(y){return clamp((y-G.horizon)/(G.H-G.horizon),.25,1);}
  function buildEars(){var P=EARPTS;if(!P){P=[];var r=rng(1857),n=0;while(P.length<24&&n++<4000){var x=60+r()*(G.W-120),y=lerp(G.horizon+560,G.H-50,Math.pow(r(),.7));
        if(inWomen(x,y))continue;if(x>G.corner[0]-190&&y>G.corner[1]-300)continue;if(P.some(function(p){return Math.hypot(p.x-x,(p.y-y)*1.6)<150;}))continue;P.push({x:x,y:y});}}
    var r2=rng(48);var picked=ears.filter(function(e){return e.state!=='ground';}).length;
    ears=P.map(function(p,i){var a=p.a!=null?p.a*Math.PI/180:(r2()<.5?-1:1)*(Math.PI/2+(r2()-.5)*1.0);
      return{x:p.x,y:p.y,a:a,s:(p.len?p.len/E.len*E.k:persp(p.y)*1.2),state:i<picked?'gone':'ground',t:0,g:0,seed:r2()*6.28};});
    if(picked)ears.forEach(function(e,i){if(i<picked)e.state='gone';});}
  buildEars();poll();

  // ---------- state
  var S={b:0,bv:0,bT:0,holding:null,fx:G.W/2,hand:null,handT:null,fatigue:0,bentFor:0,count:0,hz:0,hzT:0,
    stall:0,stallDone:false,backShown:false,flying:[],bounce:0,lens:false,lensP:null,lensHit:false,found:false,t:0,done:false};
  var handful=[];                                          // {a, s} per picked ear
  var dirty=true,dead=false,raf=0,last=0;

  // ---------- views
  var cw=document.getElementById('cw'),frameEl=document.getElementById('frame'),ov=null,og=null;
  if(cw){ov=document.createElement('canvas');ov.className='gl-ov';ov.setAttribute('aria-hidden','true');cw.appendChild(ov);og=ov.getContext('2d');}
  var cwCursor=cw?cw.style.cursor:'';
  function coreToolOn(){return !!document.querySelector('#read .act[data-tool][aria-pressed="true"]')||!!(document.getElementById('cmpA')&&document.getElementById('cmpA').classList.contains('on'));}
  function viewerOn(){var v=document.getElementById('view');return !!(v&&v.classList.contains('on'));}
  function wallRect(){if(!cw||!frameEl||frameEl.classList.contains('hidden'))return null;var r=api.artRect();if(!r||r.width<60||r.height<40)return null;
    if(r.right<0||r.left>innerWidth)return null;var rd=document.getElementById('read'),rm=document.getElementById('room');
    if(rd&&rm&&rm.classList.contains('reading')){var rr=rd.getBoundingClientRect();if(rr.left<r.right-4&&rr.right>r.left+4&&rr.width>0)return null;}
    return r;}
  var mode=null;   // 'wall' | 'narrow'
  function curRect(){return mode==='wall'?wallRect():stage.getBoundingClientRect();}

  // ---------- lens (one element, moved between the wall and the panel view)
  var lens=document.createElement('div');lens.className='gl-lens';lens.tabIndex=0;lens.setAttribute('role','button');lens.setAttribute('aria-label','放大镜：按住拖动；聚焦后可用上下方向键移动');
  var lensCv=document.createElement('canvas'),lg=lensCv.getContext('2d'),lensTag=document.createElement('i');lensTag.textContent=T.overseer;lens.appendChild(lensCv);lens.appendChild(lensTag);
  function lensHost(){return mode==='wall'?cw:view;}
  function lensSize(r){return Math.round(clamp(r.width*.2,92,150));}

  // ---------- camera (bend): zoom about the bottom edge under the hand; breathing sway grows with fatigue
  function cam(){var b=S.b,s=1+(reduce?.22:.46)*b,fy=G.H,sway=reduce?0:Math.sin(S.t*1.7)*b*(4+18*S.fatigue),tilt=reduce?0:(S.fx/G.W-.5)*.018*b;
    return{s:s,fx:S.fx,fy:fy,dy:sway,rot:tilt};}
  function applyCam(g,c){g.translate(c.fx,c.fy+c.dy);g.rotate(c.rot);g.scale(c.s,c.s);g.translate(-c.fx,-c.fy);}
  function toMain(x,y){var r=curRect();if(!r||!r.width)return null;var z=G.W/r.width,X=(x-r.left)*z,Y=(y-r.top)*z,c=cam();
    X-=c.fx;Y-=c.fy+c.dy;var co=Math.cos(-c.rot),si=Math.sin(-c.rot),X2=co*X-si*Y,Y2=si*X+co*Y;return[c.fx+X2/c.s,c.fy+Y2/c.s];}
  function unitPx(){var r=curRect();return r&&r.width?G.W/r.width:3;}   // main px per CSS px

  // ---------- horizon warp: sky + far field move down by d, the middle field between the horizon and yA is squeezed, below yA untouched
  function warpD(){return S.hz*Math.max(0,G.H*.5-G.horizon);}
  function bands(){var d=warpD(),h=G.horizon,yA=Math.max(h+240,G.H*.7);if(d<.5)return null;
    return[[0,G.farTop,0,G.farTop+d],[G.farTop,h,G.farTop+d,h+d],[h,yA,h+d,yA],[yA,G.H,yA,G.H]];}
  function warpY(y){var B=bands();if(!B)return y;for(var i=0;i<B.length;i++){var b=B[i];if(y>=b[0]&&y<=b[1])return b[2]+(y-b[0])*(b[3]-b[2])/((b[1]-b[0])||1);}return y;}
  function drawWarped(g,L,B){if(!ok(L.img))return;var iw=L.img.naturalWidth,ih=L.img.naturalHeight,ky=ih/L.h,kx=iw/L.w;
    if(!B){g.drawImage(L.img,L.x,L.y,L.w,L.h);return;}
    for(var i=0;i<B.length;i++){var b=B[i],s0=Math.max(b[0],L.y),s1=Math.min(b[1],L.y+L.h);if(s1-s0<.5)continue;
      var k=(b[3]-b[2])/((b[1]-b[0])||1),d0=b[2]+(s0-b[0])*k,d1=b[2]+(s1-b[0])*k;
      g.drawImage(L.img,0,(s0-L.y)*ky,iw,Math.max(1,(s1-s0)*ky),L.x,d0,L.w,d1-d0+(i<B.length-1?.6:0));}
    // a sky layer that starts below 0 after the move leaves the top empty: stretch its first row band up
    if(L.y>0&&L.y<G.farTop&&B[0][2]===0){}}
  function drawPainting(g){var B=bands();
    if(LAY){var any=false;for(var i=0;i<LAY.length;i++){var L=LAY[i];if(!ok(L.img))continue;any=true;drawWarped(g,L,L.fixed?null:B);}if(any)return;}
    if(ok(hung))drawWarped(g,{img:hung,x:0,y:0,w:G.W,h:G.H},B);}

  // ---------- drawing (g in main px)
  function drawEarOnGround(g,e,now,hl){var sc=e.s,wig=e.g>0?Math.sin(now/1000*38+e.seed)*.06*e.g+(-.12*e.g):0,lift=e.g*10;
    g.save();g.translate(e.x,e.y);
    // shadow
    g.save();g.translate(7,6);g.scale(1,.7);g.rotate(e.a);g.globalAlpha=.32*(1-e.g*.5);g.drawImage(E.shade,-E.ax*sc/E.k,-E.ay*sc/E.k,E.w*sc/E.k,E.h*sc/E.k);g.restore();
    g.translate(0,-lift);g.scale(1,.8+e.g*.2);g.rotate(e.a+wig);var x0=-E.ax*sc/E.k,y0=-E.ay*sc/E.k,w=E.w*sc/E.k,h=E.h*sc/E.k;
    g.globalAlpha=.94;g.drawImage(E.c,x0,y0,w,h);
    var gl=hl?.55:(reduce?0:Math.max(0,Math.sin(now/1000*.9+e.seed*3))*.22);if(gl>.01){g.globalAlpha=gl;g.globalCompositeOperation='lighter';g.drawImage(E.bright,x0,y0,w,h);}
    g.restore();}
  function headPos(e){var sc=e.s,L=E.len/E.k*sc*.78,a=e.a;return[e.x+Math.sin(a)*L,e.y-Math.cos(a)*L*.5];}   // the head (for aiming)
  function drawGrasp(g,e,u){if(e.g<=.01)return;var p=headPos(e),R=26*u;g.save();g.lineWidth=2.4*u;g.strokeStyle='rgba(20,16,12,.55)';g.beginPath();g.arc(p[0],p[1],R,0,Math.PI*2);g.stroke();
    g.strokeStyle='rgba(243,235,221,.95)';g.lineWidth=2*u;g.beginPath();g.arc(p[0],p[1],R,-Math.PI/2,-Math.PI/2+e.g*Math.PI*2);g.stroke();g.restore();}
  function drawHandful(g,now,u){if(!handful.length&&!S.flying.length)return;var c=G.corner,n=handful.length,bo=S.bounce;
    g.save();g.translate(c[0],c[1]);g.rotate(-.08+Math.sin(now/1000*1.1)*.01);g.scale(1+bo*.05,1-bo*.04);
    // soft ground shadow
    var sh=g.createRadialGradient(0,8,2,0,8,120);sh.addColorStop(0,'rgba(12,10,6,.35)');sh.addColorStop(1,'rgba(12,10,6,0)');g.fillStyle=sh;g.beginPath();g.ellipse(0,8,150,30,0,0,Math.PI*2);g.fill();
    var sc=1.3,tie=E.len*.22;   // the tie sits a fifth of the way up the stalk
    for(var i=0;i<n;i++){var h=handful[i];g.save();g.rotate(h.a);g.drawImage(E.c,-E.ax*sc/E.k,-(E.ay-tie)*sc/E.k-tie*sc/E.k,E.w*sc/E.k,E.h*sc/E.k);g.restore();}
    if(n){g.fillStyle='#8a6a34';g.strokeStyle='rgba(40,28,12,.6)';g.lineWidth=1.5;var tw=10+Math.sqrt(n)*4;g.beginPath();g.ellipse(0,-tie*sc/E.k*.95,tw,7,0,0,Math.PI*2);g.fill();g.stroke();}
    g.restore();}
  function handfulSlot(i){var r=rng(900+i*7)(),spread=clamp(.12+Math.sqrt(i)*.08,.12,.55);return{a:(r-.5)*2*spread-.05};}
  function drawFlying(g,now){S.flying.forEach(function(f){var t=sm(f.t),c=G.corner,x=lerp(f.x,c[0],t),y=lerp(f.y,c[1],t)-Math.sin(t*Math.PI)*260,sq=lerp(.5,1,sm(f.t*2.5)),
      a=lerp(f.a,f.to,t),sc=lerp(f.s,1.3,t);g.save();g.translate(x,y);g.scale(1,sq);g.rotate(a);g.drawImage(E.c,-E.ax*sc/E.k,-E.ay*sc/E.k,E.w*sc/E.k,E.h*sc/E.k);g.restore();});}
  function drawHand(g,u,now){if(!S.hand||S.b<.25)return;var p=S.hand,a=clamp((S.b-.25)/.35,0,1),grip=S.gripping?1:0,s=u*.82;
    g.save();g.translate(p[0],p[1]);g.scale(s,s);g.globalAlpha=a;g.lineJoin='round';g.lineCap='round';
    // a work-worn hand reaching down: palm above, fingers toward the ground; they curl round the ear while gripping
    var OUT='rgba(34,26,18,.8)',SKIN='rgba(226,196,160,.96)',fl=grip?11:21;
    g.fillStyle=SKIN;g.strokeStyle=OUT;g.lineWidth=1.8;
    g.beginPath();g.moveTo(-14,-46);g.bezierCurveTo(-17,-30,-15,-14,-11.5,-6);g.lineTo(11.5,-6);g.bezierCurveTo(15.5,-14,16.5,-30,13.5,-46);g.closePath();g.fill();g.stroke();
    function finger(x0,y0,x1,y1){g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.lineWidth=7.6;g.strokeStyle=OUT;g.stroke();g.lineWidth=5.4;g.strokeStyle=SKIN;g.stroke();}
    [[-9.5,fl-3],[-3.2,fl+1],[3.2,fl],[9.2,fl-4]].forEach(function(f){finger(f[0],-9,f[0]+(grip?1.5:0),-9+f[1]);});
    finger(-12,-24,grip?-8:-19,grip?-6:-2);
    g.fillStyle='rgba(98,112,118,.96)';g.beginPath();g.moveTo(-16,-66);g.lineTo(16,-66);g.lineTo(14.5,-44);g.lineTo(-15,-44);g.closePath();g.fill();g.strokeStyle=OUT;g.lineWidth=1.5;g.stroke();
    g.restore();}
  function scene(g,now,u){var c=cam(),full=S.b>.002||warpD()>.5;
    g.save();if(S.b>.002)applyCam(g,c);
    if(full)drawPainting(g);
    // top of the bent view: a little darker (the eyes are on the ground)
    var B=bands(),dy=B?0:0;
    ears.forEach(function(e){if(e.state==='ground'){var yy=B?e.y:e.y;drawEarOnGround(g,e,now,e===S.target&&S.b>.4);}});
    ears.forEach(function(e){if(e.state==='ground')drawGrasp(g,e,u);});
    drawHand(g,u,now);
    g.restore();
    if(S.b>.01){var vg=g.createLinearGradient(0,0,0,G.H*.5);vg.addColorStop(0,'rgba(18,14,10,'+(.28*S.b).toFixed(3)+')');vg.addColorStop(1,'rgba(18,14,10,0)');g.fillStyle=vg;g.fillRect(0,0,G.W,G.H*.5);}
    drawFlying(g,now);drawHandful(g,now,u);}

  function drawWall(now){if(!ov)return;var r=wallRect(),live=mode==='wall'&&r&&!coreToolOn()&&!viewerOn();
    if(!live){if(ov.width&&!drawWall.clear){og.setTransform(1,0,0,1,0,0);og.clearRect(0,0,ov.width,ov.height);drawWall.clear=true;}return;}
    var c=cw.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2),w=Math.round(r.width*dpr),h=Math.round(r.height*dpr);
    ov.style.left=(r.left-c.left)+'px';ov.style.top=(r.top-c.top)+'px';ov.style.width=r.width+'px';ov.style.height=r.height+'px';
    if(ov.width!==w||ov.height!==h){ov.width=w;ov.height=h;}
    og.setTransform(1,0,0,1,0,0);og.clearRect(0,0,w,h);var z=w/G.W;og.setTransform(z,0,0,z,0,0);og.imageSmoothingQuality='high';
    og.save();og.beginPath();og.rect(0,0,G.W,G.H);og.clip();scene(og,now,G.W/r.width);og.restore();drawWall.clear=false;}
  function drawStage(now){if(mode!=='narrow')return;var dpr=Math.min(devicePixelRatio||1,2),cwid=stage.clientWidth;if(!cwid)return;
    var w=Math.round(cwid*dpr),h=Math.round(w*G.H/G.W);if(stage.width!==w||stage.height!==h){stage.width=w;stage.height=h;}
    var z=w/G.W;sgc.setTransform(1,0,0,1,0,0);sgc.fillStyle='#26231e';sgc.fillRect(0,0,w,h);sgc.setTransform(z,0,0,z,0,0);sgc.imageSmoothingQuality='high';
    if(ok(hung))sgc.drawImage(hung,0,0,G.W,G.H);sgc.save();sgc.beginPath();sgc.rect(0,0,G.W,G.H);sgc.clip();scene(sgc,now,G.W/cwid);sgc.restore();}

  // ---------- the scale strip: the haystacks (cropped from the painting) with the figure at their foot, and your handful at the same scale
  function tok(n,f){var v=getComputedStyle(host).getPropertyValue(n).trim();return v||f;}
  function drawScale(){var dpr=Math.min(devicePixelRatio||1,2),cwid=scaleCv.clientWidth,chei=scaleCv.clientHeight;if(!cwid||!chei)return;
    var w=Math.round(cwid*dpr),h=Math.round(chei*dpr);if(scaleCv.width!==w||scaleCv.height!==h){scaleCv.width=w;scaleCv.height=h;}
    var g=scg;g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,cwid,chei);var ink2=tok('--ink-2','#d3c8b6'),ink3=tok('--ink-3','#b3a893');
    var C=CROP_HAY,top=4,bot=chei-24,ch=bot-top,k=ch/(C[3]-C[1]),cwd=Math.min((C[2]-C[0])*k,cwid-64);
    if(ok(hung)){g.save();g.beginPath();g.rect(0,top,cwd,ch);g.clip();g.drawImage(hung,C[0],C[1],cwd/k,C[3]-C[1],0,top,cwd,ch);g.restore();}
    // the figure's height sets the metre; the ground line runs on to the right
    var F=G.figure,figH=(F[3]-F[1])*k,m=figH/FIG_M,gy=top+(F[3]-C[1])*k;
    g.strokeStyle=ink3;g.lineWidth=1;g.beginPath();g.moveTo(cwd,gy+.5);g.lineTo(cwid,gy+.5);g.stroke();
    var n=handful.length,hx=cwd+Math.min(38,(cwid-cwd)*.4),hh=Math.max(2,HANDFUL_M*m);
    if(n){var sc=hh/(E.len/E.k)*1.05;g.save();g.translate(hx,gy);for(var i=0;i<n;i++){g.save();g.rotate(handful[i].a*.8);g.drawImage(E.c,-E.ax*sc/E.k,-E.ay*sc/E.k,E.w*sc/E.k,E.h*sc/E.k);g.restore();}g.restore();}
    else{g.fillStyle=ink3;g.beginPath();g.arc(hx,gy-1.5,1.5,0,Math.PI*2);g.fill();}
    // leader + label
    g.strokeStyle=ink2;g.lineWidth=1;g.beginPath();g.moveTo(hx,gy-hh-6);g.lineTo(hx,gy-40);g.stroke();
    g.fillStyle=ink2;g.font='400 12.5px '+tok('--song','serif');g.textBaseline='bottom';g.textAlign=hx+60>cwid?'right':'left';g.fillText('你的一把',hx+(hx+60>cwid?4:-4),gy-43);
    g.textAlign='left';g.textBaseline='top';g.fillStyle=ink3;g.fillText('麦垛',Math.max(2,(G.hay[0][0]-C[0])*k+6),top+2);
    g.textAlign='left';g.fillText('按远处那个人的身高换算',0,bot+6);}

  // ---------- sound (recorded if listed for the room, else synthesised)
  function recName(re){var s=(window.EH_AUDIO&&EH_AUDIO.sfx)||{};return Object.keys(s).filter(function(k){return s[k].room===room.id&&re.test(k);})[0]||null;}
  var REC=null;function rec(){if(!REC)REC={pick:recName(/pick|snap|ear/),rustle:recName(/stubble|rustle|straw|bend/),breath:recName(/breath|sigh|tired/),drop:recName(/drop|hand|bundle/)};return REC;}
  function snd(kind,v,fb){var n=rec()[kind];if(n&&api.sfx.play){var h=api.sfx.play(n,{v:v});if(h)return;}fb&&fb();}

  // ---------- input: hold to bend, hand follows the pointer
  var hold=null;   // {id, where, x, y}  where: 'wall' | 'stage' | 'btn' | 'key'
  function onStubble(m){return m&&m[1]>G.horizon+(G.H-G.horizon)*.18&&m[0]>0&&m[0]<G.W&&m[1]<G.H;}
  function startBend(where,e){hold={id:e?e.pointerId:-1,where:where,x:e?e.clientX:0,y:e?e.clientY:0,t:performance.now()};S.bT=1;bendBtn.setAttribute('aria-pressed','true');
    if(e){var m=toMain(e.clientX,e.clientY);if(m){if(S.b<.1)S.fx=clamp(m[0],0,G.W);S.handT=m;if(!S.hand)S.hand=m.slice();}}
    else{if(!S.hand){var tg=nearestEar(S.hand||[S.fx,G.H*.85]);S.hand=[S.fx,G.H*.82];}}
    if(S.b<.3)snd('rustle',.6,function(){api.sfx.puff(.03,.5);});dirty=true;}
  function endBend(){if(!hold)return;hold=null;S.bT=0;S.gripping=false;bendBtn.setAttribute('aria-pressed','false');ears.forEach(function(e){if(e.state==='ground')e.g=0;});S.target=null;
    if(S.fatigue>.55&&!S.stallDone){S.stall=reduce?0:.45+S.fatigue*.5;}S.stallDone=false;
    if(S.fatigue>.6)snd('breath',.5,function(){api.sfx.puff(.02,1.1);});dirty=true;}
  function nearestEar(p){var best=null,bd=1e18;ears.forEach(function(e){if(e.state!=='ground')return;var h=headPos(e),d=Math.hypot(h[0]-p[0],h[1]-p[1]);if(d<bd){bd=d;best=e;}});return best;}
  // wall: capture phase so the painting's click (open the viewer) doesn't fire when the visitor bends
  var suppress=false;
  function wallDown(e){suppress=false;if(mode!=='wall'||coreToolOn()||viewerOn())return;if(e.pointerType==='mouse'&&e.button!==0)return;if(e.target===lens||lens.contains(e.target))return;
    var m=toMain(e.clientX,e.clientY);if(!onStubble(m)&&S.b<.1)return;e.stopPropagation();e.preventDefault();try{frameEl.setPointerCapture(e.pointerId);}catch(_){}startBend('wall',e);}
  function wallMove(e){if(hold&&hold.where==='wall'&&e.pointerId===hold.id){S.handT=toMain(e.clientX,e.clientY);e.stopPropagation();return;}
    if(!cw||mode!=='wall'||e.pointerType!=='mouse'||coreToolOn()||viewerOn()){return;}if(e.target===lens||lens.contains(e.target)){cw.style.cursor='';return;}
    var m=toMain(e.clientX,e.clientY);cw.style.cursor=S.b>.3?'none':(onStubble(m)?'grab':cwCursor);}
  function wallUp(e){if(hold&&hold.where==='wall'&&e.pointerId===hold.id){e.stopPropagation();endBend();suppress=true;}}
  function wallClick(e){if(suppress){suppress=false;e.stopPropagation();e.preventDefault();}}
  function wallLeave(){if(cw)cw.style.cursor=cwCursor;}
  if(frameEl){frameEl.addEventListener('pointerdown',wallDown,true);frameEl.addEventListener('pointermove',wallMove,true);frameEl.addEventListener('pointerup',wallUp,true);
    frameEl.addEventListener('pointercancel',wallUp,true);frameEl.addEventListener('click',wallClick,true);frameEl.addEventListener('pointerleave',wallLeave);}
  // panel view (narrow): pan-y keeps page scrolling; a vertical swipe cancels the hold (pointercancel) and the gleaner stands up
  stage.addEventListener('pointerdown',function(e){if(e.pointerType==='mouse'&&e.button!==0)return;var m=toMain(e.clientX,e.clientY);if(!onStubble(m))return;
    if(e.pointerType!=='touch'){e.preventDefault();try{stage.setPointerCapture(e.pointerId);}catch(_){}}startBend('stage',e);stage.classList.add('bent');});
  stage.addEventListener('pointermove',function(e){if(hold&&hold.where==='stage'&&e.pointerId===hold.id)S.handT=toMain(e.clientX,e.clientY);});
  function stageUp(e){if(hold&&hold.where==='stage'&&e.pointerId===hold.id){endBend();stage.classList.remove('bent');}}
  stage.addEventListener('pointerup',stageUp);stage.addEventListener('pointercancel',stageUp);stage.addEventListener('contextmenu',function(e){e.preventDefault();});
  // the 弯腰拾穗 control: hold → bend, the hand walks to the nearest ear by itself
  bendBtn.addEventListener('pointerdown',function(e){if(e.pointerType==='mouse'&&e.button!==0)return;e.preventDefault();try{bendBtn.setPointerCapture(e.pointerId);}catch(_){}startBend('btn',null);hold.id=e.pointerId;});
  function btnUp(e){if(hold&&hold.where==='btn'&&(!e||e.pointerId===hold.id))endBend();}
  bendBtn.addEventListener('pointerup',btnUp);bendBtn.addEventListener('pointercancel',btnUp);bendBtn.addEventListener('lostpointercapture',btnUp);
  bendBtn.addEventListener('contextmenu',function(e){e.preventDefault();});bendBtn.addEventListener('click',function(e){e.preventDefault();});
  bendBtn.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '||e.key==='ArrowDown'){e.preventDefault();e.stopPropagation();if(!e.repeat&&!hold){startBend('key',null);}}});
  bendBtn.addEventListener('keyup',function(e){if(e.key==='Enter'||e.key===' '||e.key==='ArrowDown'){e.preventDefault();e.stopPropagation();if(hold&&hold.where==='key')endBend();}});
  bendBtn.addEventListener('blur',function(){if(hold&&hold.where==='key')endBend();});

  // ---------- horizon slider
  slider.addEventListener('input',function(){S.hzT=slider.value/100;dirty=true;});
  slider.addEventListener('keydown',function(e){if(e.key==='ArrowLeft'||e.key==='ArrowRight')e.stopPropagation();});   // the focused slider keeps its own arrows

  // ---------- lens
  function setLens(on){S.lens=on;lensBtn.setAttribute('aria-pressed',on?'true':'false');lens.classList.toggle('on',on);
    if(on){if(!S.lensP)S.lensP=[(G.hay[0][0]+G.hay[0][2])/2+60,(G.hay[0][1]+G.hay[0][3])/2];api.sfx.tick(.03);}else{lens.classList.remove('hit');S.lensHit=false;}dirty=true;}
  lensBtn.addEventListener('click',function(){setLens(!S.lens);if(S.lens&&!touchUI())try{lens.focus({preventScroll:true});}catch(_){}});
  var ldrag=null;
  lens.addEventListener('pointerdown',function(e){if(e.pointerType==='mouse'&&e.button!==0)return;e.preventDefault();e.stopPropagation();try{lens.setPointerCapture(e.pointerId);}catch(_){}
    var r=curRect(),u=G.W/r.width,c=lensCenterScreen();ldrag={id:e.pointerId,dx:c[0]-e.clientX,dy:c[1]-e.clientY};lens.classList.add('drag');});
  lens.addEventListener('pointermove',function(e){if(!ldrag||ldrag.id!==e.pointerId)return;e.stopPropagation();var r=curRect();if(!r)return;var u=G.W/r.width;
    S.lensP=[clamp((e.clientX+ldrag.dx-r.left)*u,0,G.W),clamp((e.clientY+ldrag.dy-r.top)*u,0,G.H)];dirty=true;});
  function lensUp(e){if(!ldrag||(e&&ldrag.id!==e.pointerId))return;ldrag=null;lens.classList.remove('drag');}
  lens.addEventListener('pointerup',lensUp);lens.addEventListener('pointercancel',lensUp);lens.addEventListener('lostpointercapture',lensUp);
  lens.addEventListener('click',function(e){e.stopPropagation();e.preventDefault();});
  lens.addEventListener('keydown',function(e){var k={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]}[e.key];if(!k)return;e.preventDefault();e.stopPropagation();
    var st=e.shiftKey?120:40;S.lensP=[clamp(S.lensP[0]+k[0]*st,0,G.W),clamp(S.lensP[1]+k[1]*st,0,G.H)];dirty=true;});
  function lensCenterScreen(){var r=curRect();var u=r.width/G.W;return[r.left+S.lensP[0]*u,r.top+S.lensP[1]*u];}
  function overseerW(){var o=G.overseer;return[(o[0]+o[2])/2,warpY((o[1]+o[3])/2)];}
  function drawLens(now){if(!S.lens)return;var host2=lensHost();if(!host2)return;if(lens.parentNode!==host2)host2.appendChild(lens);
    var r=curRect();if(!r||!r.width){lens.style.display='none';return;}lens.style.display='';
    var hc=host2.getBoundingClientRect(),D=lensSize(r),u=r.width/G.W,cx=r.left-hc.left+S.lensP[0]*u,cy=r.top-hc.top+S.lensP[1]*u;
    lens.style.width=D+'px';lens.style.height=D+'px';lens.style.transform='translate('+(cx-D/2).toFixed(1)+'px,'+(cy-D/2).toFixed(1)+'px)';
    var dpr=Math.min(devicePixelRatio||1,2),px=Math.round(D*dpr);if(lensCv.width!==px){lensCv.width=px;lensCv.height=px;}
    var mag=3.2,z=px/(D/u)*mag;lg.setTransform(1,0,0,1,0,0);lg.fillStyle='#8e8a7c';lg.fillRect(0,0,px,px);
    lg.setTransform(z,0,0,z,px/2-S.lensP[0]*z,px/2-S.lensP[1]*z);lg.imageSmoothingQuality='high';drawPainting(lg);
    var o=overseerW(),d=Math.hypot(o[0]-S.lensP[0],o[1]-S.lensP[1]),hit=d<Math.max(70,(D/u)/mag*.42);
    if(hit!==S.lensHit){S.lensHit=hit;lens.classList.toggle('hit',hit);if(hit){api.sfx.bell(330,.03);if(!S.found){S.found=true;foundEl.hidden=false;foundEl.innerHTML='<b>'+nb(T.overseer)+'</b>　'+nb(T.found);}}}}

  // ---------- again
  againBtn.addEventListener('click',function(){handful=[];S.count=0;S.done=false;S.fatigue=0;S.backShown=false;backEl.hidden=true;againBox.hidden=true;ears.forEach(function(e){e.state='ground';e.g=0;});dirty=true;api.sfx.tick(.03);});

  // ---------- step
  function pick(e){e.state='fly';e.g=0;S.target=null;S.flying.push({x:e.x,y:e.y,a:e.a,s:e.s,t:0,to:handfulSlot(handful.length).a,e:e});
    S.fatigue=Math.min(1,S.fatigue+.035);snd('pick',.8,function(){api.sfx.tick(.05);api.sfx.puff(.025,.25);});}
  function step(dt,now){S.t+=dt;
    // bending spring: down quick with a small overshoot; up slower and slower as the back tires, with a stall halfway
    var up=S.bT<S.b;var kk,cc;
    if(!up){kk=reduce?90:70;cc=2*Math.sqrt(kk)*(reduce?1:.72);}
    else{var f=S.fatigue;kk=(reduce?60:42)/Math.pow(1+3.2*f,2);cc=2*Math.sqrt(kk)*1.05;}
    if(up&&S.stall>0&&S.b<.62&&S.b>.3){S.stall-=dt;S.bv*=Math.exp(-dt*14);S.stallDone=true;}
    else{S.bv+=(kk*(S.bT-S.b)-cc*S.bv)*dt;S.b+=S.bv*dt;}
    if(S.b<0){S.b=0;S.bv=0;}if(S.b>1.08)S.b=1.08;
    if(S.bT===0&&S.b<.002&&Math.abs(S.bv)<.01){S.b=0;S.bv=0;}
    // fatigue: builds while bent, eases while standing
    if(hold&&S.b>.5){S.fatigue=Math.min(1,S.fatigue+dt/55);S.bentFor+=dt;}else S.fatigue=Math.max(0,S.fatigue-dt/(S.b<.05?22:60));
    // the hand: follows the pointer, or walks to the nearest ear (control / keyboard)
    var auto=hold&&(hold.where==='btn'||hold.where==='key');
    if(auto&&S.b>.4){var tg=S.target&&S.target.state==='ground'?S.target:nearestEar(S.hand||[S.fx,G.H*.8]);if(tg){var hp=headPos(tg);S.handT=[hp[0],hp[1]];
      if(Math.abs(S.fx-tg.x)>G.W*.3)S.fx=lerp(S.fx,tg.x,1-Math.exp(-dt*1.5));}}
    if(S.handT){if(!S.hand)S.hand=S.handT.slice();var kh=auto?1-Math.exp(-dt*(3.2/(1+S.fatigue))):1-Math.exp(-dt*28);S.hand[0]+=(S.handT[0]-S.hand[0])*kh;S.hand[1]+=(S.handT[1]-S.hand[1])*kh;}
    // grasp: the hand rests on an ear while bent → effort accumulates; letting go of it (or moving away) loses it
    var reach=30*unitPx()*(touchUI()?1.5:1);var cand=null;
    if(hold&&S.b>.55&&S.hand){var ne=nearestEar(S.hand);if(ne){var h=headPos(ne),d=Math.hypot(h[0]-S.hand[0],h[1]-S.hand[1]);if(d<Math.max(reach,ne.s*70))cand=ne;}}
    if(cand!==S.target){if(S.target&&S.target.state==='ground')S.target.g=0;S.target=cand;if(cand)snd('rustle',.35,function(){api.sfx.puff(.015,.35);});}
    S.gripping=!!cand;
    if(cand){var need=(reduce?.5:.6)+.9*S.fatigue;cand.g+=dt/need;if(cand.g>=1)pick(cand);}
    // flights into the handful
    for(var i=S.flying.length-1;i>=0;i--){var f=S.flying[i];f.t+=dt/(reduce?.45:.8);if(f.t>=1){S.flying.splice(i,1);handful.push({a:f.to});f.e.state='gone';S.count=handful.length;S.bounce=1;
      snd('drop',.5,function(){api.sfx.puff(.02,.3);});if(!ears.some(function(e){return e.state==='ground';})&&!S.flying.length){S.done=true;}}}
    S.bounce=Math.max(0,S.bounce-dt*4);
    S.hz+=(S.hzT-S.hz)*(1-Math.exp(-dt/(reduce?.05:.22)));if(Math.abs(S.hzT-S.hz)<.001)S.hz=S.hzT;}

  // ---------- loop
  var lastHint='',lastCount='',lastCap='',lastFig='';
  function figD(b){   // the gleaner in the control: from upright to bent
    var hx=15,hy=lerp(8,20,b),bx=lerp(15,24,b),by=lerp(28,26,b);var sh=[lerp(15,8,b),lerp(15,22,b)];
    return 'M'+(hx).toFixed(1)+' '+(hy-4).toFixed(1)+'a4 4 0 1 0 0.01 0M'+sh[0].toFixed(1)+' '+sh[1].toFixed(1)+'L'+bx.toFixed(1)+' '+by.toFixed(1)+'L12 50M'+bx.toFixed(1)+' '+by.toFixed(1)+'L22 50M'+sh[0].toFixed(1)+' '+sh[1].toFixed(1)+'L'+lerp(20,6,b).toFixed(1)+' '+lerp(36,46,b).toFixed(1);}
  function tick(now){if(dead)return;raf=requestAnimationFrame(tick);if(!host.isConnected){dispose();return;}
    var dt=last?Math.min((now-last)/1000,.05):0;last=now;
    var wr=wallRect(),nm=wr?'wall':'narrow';if(nm!==mode){if(hold)endBend();mode=nm;wrap.classList.toggle('narrow',mode==='narrow');dirty=true;if(S.lens)lensHost().appendChild(lens);}
    step(dt,now);
    drawWall(now);drawStage(now);drawLens(now);drawScale();
    var fd=figD(clamp(S.b,0,1));if(fd!==lastFig){figPath.setAttribute('d',fd);lastFig=fd;}
    var ct=nb(T.count+' '+S.count+' '+T.unit);if(ct!==lastCount){countEl.textContent=ct;lastCount=ct;}
    var hv=touchUI()?T.hintTouch:(mode==='wall'?T.hint:T.hintNarrow);if(S.lens&&!S.found)hv=T.lensHint;if(hv!==lastHint){hintEl.textContent=nb(hv);lastHint=hv;}
    var bk=S.done?T.done:(S.fatigue>.5?(hold?T.back:T.backRest):'');if(bk&&!S.backShown&&!S.done){S.backShown=true;}
    var showBk=S.done||(S.backShown&&S.fatigue>.25);backEl.hidden=!showBk;if(showBk&&bk&&backEl.textContent!==nb(bk))backEl.textContent=nb(bk);
    againBox.hidden=!S.done;
    var cap=S.hz>.62?T.hz1:T.hz0;if(cap!==lastCap){capEl.textContent=nb(cap);lastCap=cap;}}
  raf=requestAnimationFrame(tick);
  if(!ok(hung))hung.addEventListener('load',function(){dirty=true;},{once:true});

  function dispose(){if(dead)return;dead=true;cancelAnimationFrame(raf);clearTimeout(pollT);
    if(ov&&ov.parentNode)ov.parentNode.removeChild(ov);if(lens.parentNode)lens.parentNode.removeChild(lens);if(cw)cw.style.cursor=cwCursor;
    if(frameEl){frameEl.removeEventListener('pointerdown',wallDown,true);frameEl.removeEventListener('pointermove',wallMove,true);frameEl.removeEventListener('pointerup',wallUp,true);
      frameEl.removeEventListener('pointercancel',wallUp,true);frameEl.removeEventListener('click',wallClick,true);frameEl.removeEventListener('pointerleave',wallLeave);}}
  host._dispose=dispose;
  // test hooks
  if(EH.debug)EH.debug.glean={S:S,G:G,ears:function(){return ears;},handful:function(){return handful;},layers:function(){return !!LAY;},
    bend:function(on,x,y){if(on){startBend('btn',null);if(x!=null){S.fx=x;S.hand=[x,y];S.handT=[x,y];hold.where='test';}}else endBend();},
    hand:function(x,y){S.handT=[x,y];},pickN:function(n){var k=0;ears.forEach(function(e){if(k<n&&e.state==='ground'){k++;e.state='gone';handful.push({a:handfulSlot(handful.length).a});}});S.count=handful.length;},
    fatigue:function(f){S.fatigue=f;},horizon:function(v){slider.value=Math.round(v*100);S.hzT=v;S.hz=v;},lens:function(x,y){setLens(true);S.lensP=[x,y];},useLayers:useLayers};
});
})();

;
/* Special exhibit "handprint" (prehistory): press and hold on a rock surface to blow ochre around your own hand;
   release lifts the hand and leaves a negative stencil. The latest stencil is kept (localStorage 'eh.handprint' and
   window.EH_SAVED.handprint, a transparent PNG dataURL of the pigment only) so a later room can hand it back.
   A "闪烁速度" slider writes window.EH_PREHISTORY.flicker (0.15–2), read by the prehistory rest animation. */
(function(){
'use strict';
var EH=window.EH;if(!EH||!EH.special)return;
var P=window.EH_PREHISTORY=window.EH_PREHISTORY||{flicker:1};if(typeof P.flicker!=='number')P.flicker=1;
var SAVED=window.EH_SAVED=window.EH_SAVED||{};
try{var s0=localStorage.getItem('eh.handprint');if(s0&&!SAVED.handprint)SAVED.handprint=s0;}catch(e){}

// ---------------------------------------------------------------- world: fixed-resolution layers, display scales them
var WW=1024,WH=768,HL=Math.round(WW*.285);          // HL = hand length (wrist crease → middle fingertip) in world px
var PIG={ochre:[[158,52,28],[176,68,34],[140,44,26],[188,86,44]],black:[[40,33,30],[52,42,36],[30,26,24],[62,52,44]]};
var MEM={rock:null,rockKind:null,paint:null,pigment:'ochre',own:false};   // survives closing/reopening the panel

function cv(w,h){var c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function rng(seed){var s=seed>>>0||1;return function(){s=(s+0x6D2B79F5)|0;var t=Math.imul(s^(s>>>15),1|s);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}

// ---------------------------------------------------------------- the hand: a left hand pressed palm-down, fingers spread
// units: hand length = 1, origin = palm centre, y down. Fingers = chains of round-capped phalanges (knuckles bulge naturally).
var HAND={
  palm:[[-0.15,0.30],[-0.2,0.2],[-0.235,0.05],[-0.235,-0.06],[-0.19,-0.14],[-0.07,-0.19],[0.05,-0.2],[0.16,-0.17],[0.215,-0.1],[0.22,0.0],[0.24,0.1],[0.22,0.2],[0.17,0.28],[0.13,0.31]],
  fingers:[ // base x, y (inside the palm), angle° (0 = up, + = toward the thumb), length, base width, tip width, bend° over the length
    [0.145,-0.10,15,0.44,0.108,0.082,-5],
    [0.04,-0.12,2,0.50,0.112,0.086,-2],
    [-0.065,-0.11,-12,0.47,0.106,0.08,4],
    [-0.16,-0.08,-29,0.37,0.092,0.07,7],
    [0.15,0.15,56,0.46,0.15,0.095,-22]],
  arm:[[-0.15,0.26],[0.13,0.26],[0.17,0.45],[0.22,1.75],[-0.23,1.75],[-0.18,0.45]],
  box:[-0.46,-0.76,0.66,1.75]};                    // x0,y0,x1,y1
var HM=null;   // {mask, art, ghost, ox, oy, w, h} built once at world scale
function handShape(g,S,ox,oy){
  function X(p){return ox+p[0]*S;}function Y(p){return oy+p[1]*S;}
  var pl=HAND.palm,n=pl.length,i;g.beginPath();
  var m0=[(pl[n-1][0]+pl[0][0])/2,(pl[n-1][1]+pl[0][1])/2];g.moveTo(X(m0),Y(m0));
  for(i=0;i<n;i++){var a=pl[i],b=pl[(i+1)%n],m=[(a[0]+b[0])/2,(a[1]+b[1])/2];g.quadraticCurveTo(X(a),Y(a),X(m),Y(m));}
  g.closePath();g.fill();
  g.beginPath();HAND.arm.forEach(function(p,k){k?g.lineTo(X(p),Y(p)):g.moveTo(X(p),Y(p));});g.closePath();g.fill();
  // fingers: tapered outlines with slight knuckle swellings and a rounded, slightly long tip
  HAND.fingers.forEach(function(f,fi){var thumb=fi===4,N=16,x=f[0],y=f[1],ds=f[3]/N,L=[],R=[],a=0,w=0;
    for(var k=0;k<=N;k++){var t=k/N,k1=thumb?.4:.46,k2=thumb?.7:.76;a=(f[2]+f[6]*t)*Math.PI/180;
      w=(f[4]+(f[5]-f[4])*Math.pow(t,.9))*(1+.05*Math.exp(-Math.pow((t-k1)/.07,2))+.035*Math.exp(-Math.pow((t-k2)/.06,2)));
      var nx=Math.cos(a),ny=Math.sin(a);L.push([x-nx*w/2,y-ny*w/2]);R.push([x+nx*w/2,y+ny*w/2]);if(k<N){x+=Math.sin(a)*ds;y-=Math.cos(a)*ds;}}
    g.beginPath();g.moveTo(X(L[0]),Y(L[0]));for(k=1;k<=N;k++)g.lineTo(X(L[k]),Y(L[k]));
    g.ellipse(X([x,y]),Y([x,y]),w/2*S,w/2*1.2*S,a,Math.PI,2*Math.PI,false);
    for(k=N;k>=0;k--)g.lineTo(X(R[k]),Y(R[k]));g.closePath();g.fill();});
}
function buildHand(){if(HM)return HM;var S=HL,b=HAND.box,w=Math.ceil((b[2]-b[0])*S),h=Math.ceil((b[3]-b[1])*S),ox=-b[0]*S,oy=-b[1]*S;
  var mask=cv(w,h),g=mask.getContext('2d');g.fillStyle=g.strokeStyle='#000';
  var soft=cv(w,h),sg=soft.getContext('2d');sg.fillStyle=sg.strokeStyle='#000';handShape(sg,S,ox,oy);
  g.filter='blur(1.2px)';g.drawImage(soft,0,0);g.filter='none';
  // the visitor's hand as seen in lamplight: warm skin, darker rim, soft light from above
  var art=cv(w,h),a=art.getContext('2d');a.drawImage(mask,0,0);a.globalCompositeOperation='source-in';
  var lg=a.createLinearGradient(0,0,w*.7,h*.55);lg.addColorStop(0,'#a57a5c');lg.addColorStop(.45,'#8d6448');lg.addColorStop(1,'#4a3226');a.fillStyle=lg;a.fillRect(0,0,w,h);
  var inv=cv(w,h),ig=inv.getContext('2d');ig.fillStyle='rgba(28,16,10,.95)';ig.fillRect(0,0,w,h);ig.globalCompositeOperation='destination-out';ig.drawImage(soft,0,0);
  a.globalCompositeOperation='source-atop';a.filter='blur('+(S*.028).toFixed(1)+'px)';a.drawImage(inv,0,0);a.filter='none';
  var kn=a.createRadialGradient(ox+.02*S,oy-.1*S,0,ox+.02*S,oy-.1*S,.34*S);kn.addColorStop(0,'rgba(255,214,170,.20)');kn.addColorStop(1,'rgba(255,214,170,0)');a.fillStyle=kn;a.fillRect(0,0,w,h);
  var fade=a.createLinearGradient(0,oy+.55*S,0,oy+1.7*S);fade.addColorStop(0,'rgba(0,0,0,0)');fade.addColorStop(1,'rgba(10,6,4,.85)');a.fillStyle=fade;a.fillRect(0,0,w,h);
  var gh=cv(w,h),q=gh.getContext('2d');q.drawImage(mask,0,0);q.globalCompositeOperation='source-in';
  var gg=q.createLinearGradient(0,oy+.35*S,0,oy+1.3*S);gg.addColorStop(0,'rgba(255,238,214,1)');gg.addColorStop(1,'rgba(255,238,214,0)');q.fillStyle=gg;q.fillRect(0,0,w,h);
  HM={mask:mask,art:art,ghost:gh,ox:ox,oy:oy,w:w,h:h};return HM;}
function drawMask(g,im,hand,k){k=k||1;g.save();g.translate(hand.x,hand.y);g.rotate(hand.rot);g.scale(k,k);g.drawImage(im,-HM.ox,-HM.oy);g.restore();}

// ---------------------------------------------------------------- spray: grainy airbrush with falloff, masked by the hand
// strength s (per frame) scales grain count and mist; the hand blocks everything it covers.
var SPR={};
function sprite(pig){if(SPR[pig])return SPR[pig];var c=cv(64,64),g=c.getContext('2d'),col=PIG[pig][0],gr=g.createRadialGradient(32,32,0,32,32,32);
  for(var i=0;i<=8;i++){var t=i/8;gr.addColorStop(t,'rgba('+col+','+Math.exp(-t*t*4.5).toFixed(3)+')');}gr.addColorStop(1,'rgba('+col+',0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return SPR[pig]=c;}
function spray(g,hand,aim,s,pig,R){
  var cols=PIG[pig],sig=HL*.34,ca=Math.cos(hand.rot),sa=Math.sin(hand.rot),cx=aim.x,cy=aim.y,i,sp=sprite(pig);
  function pt(k){var r=sig*k*Math.sqrt(-2*Math.log(1-R()*.9995)),t=R()*6.2832,lx=Math.cos(t)*r,ly=Math.sin(t)*r*1.2;return[cx+lx*ca-ly*sa,cy+lx*sa+ly*ca];}
  // the cloud: soft blobs, each well above 8-bit precision so the halo fades without banding
  var nb=Math.floor(12*s+R());g.globalAlpha=.085;for(i=0;i<nb;i++){var q=pt(1.05),rr=HL*(.05+.11*R());g.drawImage(sp,q[0]-rr,q[1]-rr,rr*2,rr*2);}
  // the grain: droplets in a few alpha/colour buckets
  var paths=[],A=[.16,.3,.55];for(i=0;i<12;i++)paths.push(new Path2D());
  var n=Math.round(560*s);
  for(i=0;i<n;i++){var big=R()<.02,p=pt(big?1.5:1),z=big?1.3+1.2*R():.55+1.1*Math.pow(R(),2.2),ci=(R()*4)|0,ai=big?2:(R()<.5?0:(R()<.7?1:2)),P=paths[ci*3+ai];
    P.moveTo(p[0]+z,p[1]);P.arc(p[0],p[1],z,0,6.2832);}
  for(i=0;i<12;i++){g.globalAlpha=A[i%3];g.fillStyle='rgb('+cols[(i/3)|0]+')';g.fill(paths[i]);}
  g.globalAlpha=1;g.globalCompositeOperation='destination-out';drawMask(g,HM.mask,hand);g.globalCompositeOperation='source-over';}
function aimFor(hand){var c=Math.cos(hand.rot),s=Math.sin(hand.rot),dx=.03*HL,dy=-.16*HL;return{x:hand.x+dx*c-dy*s,y:hand.y+dx*s+dy*c};}

// ---------------------------------------------------------------- the rock: a calm crop of the room's cave photograph, or procedural limestone
function fbm(W,H,base,oct,pers,seed){var out=new Float32Array(W*H),R=rng(seed),amp=1,tot=0;
  for(var o=0;o<oct;o++){var f=base*Math.pow(2,o),gw=Math.ceil(f)+2,gh=Math.ceil(f*H/W)+2,G=new Float32Array(gw*gh),k;for(k=0;k<G.length;k++)G[k]=R();
    var sx=f/W,ox=R()*.5,oy=R()*.5;
    for(var y=0;y<H;y++){var fy=y*sx+oy,iy=fy|0,ty=fy-iy;ty=ty*ty*(3-2*ty);var r0=iy*gw,r1=r0+gw,row=y*W;
      for(var x=0;x<W;x++){var fx=x*sx+ox,ix=fx|0,tx=fx-ix;tx=tx*tx*(3-2*tx);var a=G[r0+ix],b=G[r0+ix+1],c=G[r1+ix],d=G[r1+ix+1];
        out[row+x]+=((a+(b-a)*tx)*(1-ty)+(c+(d-c)*tx)*ty)*amp;}}
    tot+=amp;amp*=pers;}
  for(k=0;k<out.length;k++)out[k]/=tot;return out;}
function proceduralRock(){var W=WW,H=WH,c=cv(W,H),g=c.getContext('2d'),im=g.createImageData(W,H),d=im.data;
  var h=fbm(W,H,2.2,8,.56,11),alb=fbm(W,H,1.6,5,.6,23),grime=fbm(W,H,3,4,.55,37),x,y,i;
  for(y=0;y<H;y++)for(x=0;x<W;x++){i=y*W+x;
    var xl=x>0?h[i-1]:h[i],xr=x<W-1?h[i+1]:h[i],yu=y>0?h[i-W]:h[i],yd=y<H-1?h[i+W]:h[i];
    var nx=(xl-xr)*26,ny=(yu-yd)*26,inv=1/Math.sqrt(nx*nx+ny*ny+1),dif=Math.max(0,(nx*-.52+ny*-.58+.63)*inv);
    var a=alb[i],gm=Math.max(0,grime[i]-.56)*3.2,l=.3+.82*dif,
      r=(196+(a-.5)*70)*l,gg=(176+(a-.5)*58)*l,b=(148+(a-.5)*44)*l;
    r*=1-gm*.55;gg*=1-gm*.6;b*=1-gm*.62;
    var gr=(h[i]*997.3%1-.5)*9;d[i*4]=r+gr;d[i*4+1]=gg+gr;d[i*4+2]=b+gr;d[i*4+3]=255;}
  g.putImageData(im,0,0);
  // a few hairline cracks and calcite veins
  var R=rng(71);g.lineCap='round';
  for(var k=0;k<5;k++){var px=R()*W,py=R()*H,ang=R()*6.28,len=120+R()*380,pts=[[px,py]];
    for(var s=0;s<len;s+=8){ang+=(R()-.5)*.5;px+=Math.cos(ang)*8;py+=Math.sin(ang)*8;pts.push([px,py]);}
    [[1.4,'rgba(30,22,16,.45)',0],[1,'rgba(235,222,200,.18)',1.2]].forEach(function(st){g.lineWidth=st[0]*(k<2?1.3:.8);g.strokeStyle=st[1];g.beginPath();pts.forEach(function(p,j){j?g.lineTo(p[0],p[1]+st[2]):g.moveTo(p[0],p[1]+st[2]);});g.stroke();});}
  return c;}
// choose the calmest window of the photograph (low edge energy, few pigments, not in deep shadow)
function photoRock(im){var iw=im.naturalWidth,ih=im.naturalHeight,sw=128,sh=Math.round(128*ih/iw),t=cv(sw,sh),tg=t.getContext('2d');tg.drawImage(im,0,0,sw,sh);
  var d=tg.getImageData(0,0,sw,sh).data,E=new Float64Array((sw+1)*(sh+1)),L=new Float64Array((sw+1)*(sh+1)),lum=new Float32Array(sw*sh),x,y,i;
  for(i=0;i<sw*sh;i++)lum[i]=d[i*4]*.3+d[i*4+1]*.59+d[i*4+2]*.11;
  for(y=0;y<sh;y++)for(x=0;x<sw;x++){i=y*sw+x;var gx=x<sw-1?Math.abs(lum[i+1]-lum[i]):0,gy=y<sh-1?Math.abs(lum[i+sw]-lum[i]):0,
    r=d[i*4],g=d[i*4+1],b=d[i*4+2],chroma=Math.max(r,g,b)-Math.min(r,g,b),e=gx+gy+Math.max(0,chroma-40)*.6+Math.max(0,50-lum[i])*.8;
    var k=(y+1)*(sw+1)+x+1;E[k]=e+E[k-1]+E[k-sw-1]-E[k-sw-2];L[k]=lum[i]+L[k-1]+L[k-sw-1]-L[k-sw-2];}
  function sum(A,x0,y0,x1,y1){var W1=sw+1;return A[y1*W1+x1]-A[y0*W1+x1]-A[y1*W1+x0]+A[y0*W1+x0];}
  var best=null;[.34,.42,.52].forEach(function(fr){var ww=Math.round(sw*fr),hh=Math.round(ww*3/4);if(hh>sh){hh=sh;ww=Math.round(hh*4/3);}
    for(y=0;y+hh<=sh;y+=2)for(x=0;x+ww<=sw;x+=2){var n=ww*hh,e=sum(E,x,y,x+ww,y+hh)/n,l=sum(L,x,y,x+ww,y+hh)/n,sc=e+Math.max(0,80-l)*.5-fr*4;
      if(!best||sc<best.s)best={s:sc,x:x,y:y,w:ww,h:hh,l:l};}});
  var c=cv(WW,WH),g2=c.getContext('2d'),k2=iw/sw;g2.imageSmoothingQuality='high';g2.drawImage(im,best.x*k2,best.y*k2,best.w*k2,best.h*k2,0,0,WW,WH);
  // normalise brightness so the ochre reads the same on any photograph
  var gain=Math.min(1.8,Math.max(.7,150/Math.max(1,best.l)));if(Math.abs(gain-1)>.04){g2.globalCompositeOperation=gain>1?'screen':'multiply';g2.globalAlpha=Math.min(1,Math.abs(gain-1)*1.2);
    g2.fillStyle=gain>1?'#8a7a66':'#9a8a76';g2.fillRect(0,0,WW,WH);g2.globalAlpha=1;g2.globalCompositeOperation='source-over';}
  return c;}

// an old, weathered stencil already on the wall, so the surface shows what is possible
function ancientPaint(){var c=cv(WW,WH),g=c.getContext('2d'),w=cv(WW,WH),wg=w.getContext('2d'),R=rng(5),hand={x:WW*.15,y:WH*.34,rot:-.42};
  for(var f=0;f<80;f++)spray(wg,hand,aimFor(hand),.55+.45*Math.sin(f/9)*Math.sin(f/9),'ochre',R);
  var er=fbm(256,192,3,4,.6,91),ec=cv(256,192),eg=ec.getContext('2d'),id=eg.createImageData(256,192);
  for(var i=0;i<er.length;i++){id.data[i*4+3]=Math.max(0,Math.min(255,(er[i]-.42)*900));}eg.putImageData(id,0,0);
  wg.globalCompositeOperation='destination-out';wg.drawImage(ec,0,0,WW,WH);
  g.globalAlpha=.5;g.drawImage(w,0,0);return c;}

// ---------------------------------------------------------------- styles (once)
function css(){if(document.getElementById('hp-style'))return;var s=document.createElement('style');s.id='hp-style';s.textContent=
  '.hp{margin-top:18px;max-width:34em}'+
  '.hp-rock{position:relative;width:100%;aspect-ratio:4/3;background:#1d1713;border-radius:2px;overflow:hidden;box-shadow:0 18px 40px -22px rgba(0,0,0,.8)}'+
  '.hp-rock canvas{position:absolute;inset:0;width:100%;height:100%;display:block;max-width:100%;touch-action:none;cursor:pointer;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}'+
  '.hp-rock canvas.nocur{cursor:none}'+
  '.hp-rock canvas:focus-visible{outline:none}.hp-rock:has(canvas:focus-visible){outline:1px solid currentColor;outline-offset:4px}'+
  '.hp-cap{margin:10px 0 0!important;min-height:1.9em;font:400 13.5px/1.8 var(--song)!important;color:var(--ink-2)}'+
  '.hp-row{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:6px 22px;margin-top:6px}'+
  '.hp-row .acts{margin:0}.hp-row .lab{font:400 13.5px/1.9 var(--song);color:var(--ink-3);margin-right:-8px}'+
  '.hp-sl{display:grid;grid-template-columns:auto 1fr 3.4em;gap:16px;align-items:center;margin-top:20px;font:400 15px/1.6 var(--song)}'+
  '.hp-sl output{font:400 13.5px/1 var(--song);letter-spacing:.02em;text-align:right;color:var(--ink-2)}'+
  '.hp-sl input{-webkit-appearance:none;appearance:none;width:100%;height:44px;margin:0;background:transparent;cursor:pointer;color:inherit}'+
  '.hp-sl input::-webkit-slider-runnable-track{height:1px;background:linear-gradient(90deg,var(--gold) var(--v,50%),rgba(239,230,214,.3) var(--v,50%))}'+
  '.hp-sl input::-moz-range-track{height:1px;background:rgba(239,230,214,.3)}.hp-sl input::-moz-range-progress{height:1px;background:var(--gold)}'+
  '.hp-sl input::-webkit-slider-thumb{-webkit-appearance:none;width:13px;height:13px;margin-top:-6px;border-radius:50%;background:var(--ink-light);border:0;box-shadow:0 0 0 4px rgba(0,0,0,.18)}'+
  '.hp-sl input::-moz-range-thumb{width:13px;height:13px;border-radius:50%;background:var(--ink-light);border:0}'+
  '.hp-sl input:focus-visible{outline:1px solid currentColor;outline-offset:4px}'+
  '.hp .small{margin-top:4px}'+
  '.hp .act{min-width:44px}'+
  '@media (max-width:560px){.hp-sl{gap:12px;grid-template-columns:auto 1fr 3em}}';
  document.head.appendChild(s);}

// ---------------------------------------------------------------- the exhibit
EH.special('handprint',function(host,room,api){
  css();buildHand();
  var sp=room.special||{};
  var TEXT='三万多年前，人把手按在岩壁上，用嘴或空心的骨管把赭石粉吹过去。手拿开，岩面上就留下一只“负形”的手。';
  var para=host.querySelector('p');if(para&&!(sp.text||'').trim())para.textContent=TEXT;
  var h3=host.previousElementSibling;if(h3&&h3.tagName==='H3'&&!(sp.title||'').trim())h3.textContent='本厅特别展项：你的手印';
  var CAP_IDLE='按住岩面，赭石粉会吹到手的四周。按得越久，颜色越浓。',CAP_ON='继续按住……拖动可以换个方向吹。',
      CAP_DONE='手印留下了。它会一直跟着你，到当代厅再交还给你。',CAP_SHORT='吹得太短，再按久一点。';

  var box=document.createElement('div');box.className='hp';
  box.innerHTML='<div class="hp-rock"><canvas tabindex="0" role="application" aria-roledescription="岩面" aria-label="岩面。按住回车或空格喷颜料，方向键移动手的位置。"></canvas></div>'+
    '<p class="hp-cap" aria-live="polite"></p>'+
    '<div class="hp-row"><div class="acts" role="group" aria-label="颜料"><span class="lab">颜料</span><button type="button" class="act" data-p="ochre">赭红</button><button type="button" class="act" data-p="black">炭黑</button></div>'+
    '<div class="acts"><button type="button" class="act hp-clear">清空岩面</button></div></div>'+
    '<label class="hp-sl"><span>闪烁速度</span><input type="range" min="0.15" max="2" step="0.05" aria-describedby="hp-sl-note"><output></output></label>'+
    '<p class="small" id="hp-sl-note"></p>';
  host.appendChild(box);
  (function(){var fl=(room&&room.special&&room.special.flicker)||{};   // slider wording lives in room.json (fact-checked)
    box.querySelector('.hp-sl span').textContent=fl.label||'闪烁速度';
    box.querySelector('#hp-sl-note').textContent=fl.text||'这个滑杆也控制展厅墙上的火光。调慢一些，叠画的腿会一组一组地交替亮起：有研究者认为，旧石器时代的“动画”就是这样动起来的。';})();
  var C=box.querySelector('canvas'),G=C.getContext('2d'),cap=box.querySelector('.hp-cap'),rng0=rng((Date.now()&0xffff)+7);
  var slider=box.querySelector('input'),out=box.querySelector('output');
  cap.textContent=MEM.own?CAP_DONE:CAP_IDLE;

  // layers
  if(!MEM.paint){MEM.paint=ancientPaint();
    if(SAVED.handprint){var si=new Image();si.onload=function(){var side=HL*1.8;MEM.paint.getContext('2d').drawImage(si,WW*.6-side/2,WH*.52-side/2,side,side);MEM.own=true;cap.textContent=CAP_DONE;};si.src=SAVED.handprint;}}
  var wet=cv(WW,WH),wg=wet.getContext('2d');
  var rockReady=!!MEM.rock,rockFade=rockReady?1:0;
  function useRock(c,kind){MEM.rock=c;MEM.rockKind=kind;rockReady=true;}
  // 1) s_rock.webp: a hand-picked blank patch of the room's own cave photograph (upper centre of main.webp);
  // 2) else the calmest window found automatically in room.art.img; 3) else procedural limestone.
  if(!MEM.rock||MEM.rockKind!=='curated'){
    var proc=function(){if(!MEM.rock)setTimeout(function(){if(!MEM.rock)useRock(proceduralRock(),'proc');},30);};
    var photoPath=function(){
      var photo=!room._stub&&room.art&&room.art.img?api.img(room.art.img):null;
      if(!photo){proc();return;}
      var tryPhoto=function(){if(MEM.rockKind==='curated')return;try{useRock(photoRock(photo),'photo');}catch(e){proc();}};
      if(photo.complete&&photo.naturalWidth)tryPhoto();else{photo.addEventListener('load',tryPhoto,{once:true});photo.addEventListener('error',proc,{once:true});setTimeout(function(){if(!MEM.rock)proc();},2500);}};
    var cur=api.img('s_rock.webp'),useCur=function(){var c=cv(WW,WH),g=c.getContext('2d');g.imageSmoothingQuality='high';g.drawImage(cur,0,0,WW,WH);useRock(c,'curated');};
    if(cur.complete&&cur.naturalWidth)useCur();
    else if(cur.complete&&!cur.naturalWidth)photoPath();
    else{cur.addEventListener('load',useCur,{once:true});cur.addEventListener('error',photoPath,{once:true});
      setTimeout(function(){if(!MEM.rock)photoPath();},1800);}}

  // pigment buttons
  var pbs=box.querySelectorAll('[data-p]');function setPig(p){MEM.pigment=p;Array.prototype.forEach.call(pbs,function(b){b.setAttribute('aria-pressed',b.getAttribute('data-p')===p?'true':'false');});}
  Array.prototype.forEach.call(pbs,function(b){b.addEventListener('click',function(){setPig(b.getAttribute('data-p'));});});setPig(MEM.pigment);
  box.querySelector('.hp-clear').addEventListener('click',function(){if(st.press)return;MEM.paint=ancientPaint();MEM.own=false;cap.textContent=CAP_IDLE;api.sfx.tick&&api.sfx.tick(.05);});

  // flicker slider
  function showSl(){var v=P.flicker;slider.value=v;out.textContent=v.toFixed(2)+'×';slider.style.setProperty('--v',((v-.15)/1.85*100).toFixed(1)+'%');}
  slider.addEventListener('input',function(){P.flicker=Math.min(2,Math.max(.15,+slider.value));showSl();});showSl();

  // interaction state
  var st={press:null,lift:null,hover:null,kb:{x:WW*.55,y:WH*.55},kbOn:false,lamp:{x:WW*.55,y:WH*.4},ft:0,last:0,breath:-1,pid:null};
  var reduce=false;try{reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){}
  function toWorld(e){var r=C.getBoundingClientRect();return{x:(e.clientX-r.left)/r.width*WW,y:(e.clientY-r.top)/r.height*WH};}
  function clampHand(p){return{x:Math.min(WW-HL*.12,Math.max(HL*.12,p.x)),y:Math.min(WH-HL*.05,Math.max(HL*.5,p.y))};}
  function start(p){if(st.press)return;p=clampHand(p);var hand={x:p.x,y:p.y,rot:(p.x/WW-.5)*.5+(rng0()-.5)*.14};
    st.press={hand:hand,off:{x:0,y:0},p0:p,t:0,amount:0};st.lift=null;st.breath=-1;wg.clearRect(0,0,WW,WH);cap.textContent=CAP_ON;}
  function aimMove(p){if(!st.press)return;var dx=p.x-st.press.p0.x,dy=p.y-st.press.p0.y,d=Math.hypot(dx,dy),mx=HL*.55;if(d>mx){dx*=mx/d;dy*=mx/d;}st.press.off={x:dx,y:dy};}
  function end(){var pr=st.press;if(!pr)return;st.press=null;st.lift={hand:pr.hand,t:0};
    if(pr.amount<8){wg.clearRect(0,0,WW,WH);cap.textContent=CAP_SHORT;return;}
    MEM.paint.getContext('2d').drawImage(wet,0,0);save(pr.hand);wg.clearRect(0,0,WW,WH);MEM.own=true;cap.textContent=CAP_DONE;}
  function save(hand){try{var side=HL*1.8,a=aimFor(hand),cx=(a.x+hand.x)/2,cy=(a.y+hand.y)/2,o=cv(256,256),og=o.getContext('2d');og.imageSmoothingQuality='high';
      og.drawImage(wet,cx-side/2,cy-side/2,side,side,0,0,256,256);
      // keep it small: one pigment colour, grain carried by quantised alpha (PNG compresses this ~3× better)
      try{var id=og.getImageData(0,0,256,256),d=id.data,pc=PIG[MEM.pigment][0];
        for(var i=0;i<d.length;i+=4){d[i]=pc[0];d[i+1]=pc[1];d[i+2]=pc[2];d[i+3]=Math.min(255,Math.round(d[i+3]/12)*12);}og.putImageData(id,0,0);}catch(e){}
      var url=o.toDataURL('image/png');SAVED.handprint=url;SAVED.handprintInfo={pigment:MEM.pigment,at:Date.now()};
      try{localStorage.setItem('eh.handprint',url);}catch(e){}}catch(e){}}

  C.addEventListener('pointerdown',function(e){if(e.pointerType==='mouse'&&e.button!==0)return;e.preventDefault();try{C.setPointerCapture(e.pointerId);}catch(_){}
    st.pid=e.pointerId;var p=toWorld(e);st.hover=p;start(p);st.kbOn=false;});
  C.addEventListener('pointermove',function(e){var p=toWorld(e);st.hover=e.pointerType==='touch'&&!st.press?null:p;C.classList.toggle('nocur',e.pointerType==='mouse');if(st.press&&e.pointerId===st.pid)aimMove(p);});
  function up(e){if(e.pointerId!==st.pid)return;st.pid=null;end();if(e.pointerType==='touch')st.hover=null;}
  C.addEventListener('pointerup',up);C.addEventListener('pointercancel',up);C.addEventListener('lostpointercapture',up);
  C.addEventListener('pointerleave',function(){if(!st.press){st.hover=null;C.classList.remove('nocur');}});
  C.addEventListener('contextmenu',function(e){e.preventDefault();});
  C.addEventListener('keydown',function(e){var k=e.key,step=(e.shiftKey?.1:.035)*WW;
    if(k==='Enter'||k===' '){e.preventDefault();e.stopPropagation();st.kbOn=true;if(!e.repeat&&!st.press)start(st.kb);return;}
    var dx=k==='ArrowLeft'?-step:k==='ArrowRight'?step:0,dy=k==='ArrowUp'?-step:k==='ArrowDown'?step:0;
    if(dx||dy){e.preventDefault();e.stopPropagation();st.kbOn=true;if(st.press){aimMove({x:st.press.p0.x+st.press.off.x+dx,y:st.press.p0.y+st.press.off.y+dy});}
      else{st.kb=clampHand({x:st.kb.x+dx,y:st.kb.y+dy});}}});
  C.addEventListener('keyup',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();if(st.press&&st.pid==null)end();}});
  C.addEventListener('blur',function(){st.kbOn=false;if(st.press&&st.pid==null)end();});

  // display size
  function fit(){var r=C.getBoundingClientRect(),d=Math.min(window.devicePixelRatio||1,2),w=Math.max(200,Math.min(1600,Math.round(r.width*d)));if(C.width!==w){C.width=w;C.height=Math.round(w*3/4);}}
  var ro=null;if(window.ResizeObserver){ro=new ResizeObserver(fit);ro.observe(C);}fit();

  // frame loop
  var raf=0;
  function frame(now){raf=requestAnimationFrame(frame);if(!host.isConnected){dispose();return;}
    var dt=st.last?Math.min(.05,(now-st.last)/1000):1/60;st.last=now;
    var pr=st.press;
    if(pr){pr.t+=dt;var bp=.44,bi=Math.floor(pr.t/bp);
      if(bi!==st.breath){st.breath=bi;st.jit={x:(rng0()-.5)*.16*HL,y:(rng0()-.5)*.16*HL};api.sfx.puff&&api.sfx.puff(.13+.05*Math.min(1,pr.t/1.5)+rng0()*.03,.5);}
      var ph=(pr.t%bp)/bp,env=Math.min(1,pr.t/.12)*(.55+.45*Math.sin(Math.PI*ph)),s=env*dt*60;
      var hand=pr.hand,a=aimFor(hand);var j=st.jit||{x:0,y:0};spray(wg,hand,{x:a.x+pr.off.x+j.x,y:a.y+pr.off.y+j.y},s,MEM.pigment,rng0);pr.amount+=s;}
    if(st.lift){st.lift.t+=dt;if(st.lift.t>.6)st.lift=null;}
    // lamp follows the hand / pointer, flickers at the room's speed
    var tgt=pr?pr.hand:(st.hover||(st.kbOn?st.kb:{x:WW*(.55+.08*Math.sin(now/5200)),y:WH*(.42+.06*Math.cos(now/6100))}));
    var kL=1-Math.exp(-dt*(pr?3:4));st.lamp.x+=(tgt.x-st.lamp.x)*kL;st.lamp.y+=(tgt.y-st.lamp.y-HL*.25)*kL;
    st.ft+=dt*P.flicker;var ft=st.ft,amp=reduce?.02:.075;
    var fl=1+amp*(.5*Math.sin(ft*6.3)+.3*Math.sin(ft*11.9+1.3)+.2*Math.sin(ft*19.7+.4));
    if(rockReady&&rockFade<1)rockFade=Math.min(1,rockFade+dt*2.5);
    render(fl);}
  function render(fl){var w=C.width,h=C.height,k=w/WW;G.setTransform(1,0,0,1,0,0);G.globalCompositeOperation='source-over';G.globalAlpha=1;
    G.fillStyle='#1d1713';G.fillRect(0,0,w,h);
    if(MEM.rock){G.globalAlpha=rockFade;G.drawImage(MEM.rock,0,0,w,h);G.globalAlpha=1;}
    G.globalCompositeOperation='multiply';G.drawImage(MEM.paint,0,0,w,h);G.drawImage(wet,0,0,w,h);
    G.globalCompositeOperation='source-over';G.globalAlpha=.42;G.drawImage(MEM.paint,0,0,w,h);G.drawImage(wet,0,0,w,h);G.globalAlpha=1;
    // lamplight
    var lx=st.lamp.x*k,ly=st.lamp.y*k,R=Math.max(w,h)*1.05,c=function(r,g,b,m){return 'rgb('+Math.min(255,Math.round(r*m))+','+Math.min(255,Math.round(g*m))+','+Math.min(255,Math.round(b*m))+')';};
    var lg=G.createRadialGradient(lx,ly,0,lx,ly,R);lg.addColorStop(0,c(255,240,214,fl));lg.addColorStop(.3,c(238,214,184,fl));lg.addColorStop(.7,c(128,106,90,fl*.98));lg.addColorStop(1,c(52,43,37,1));
    G.globalCompositeOperation='multiply';G.fillStyle=lg;G.fillRect(0,0,w,h);
    G.globalCompositeOperation='screen';var gl=G.createRadialGradient(lx,ly,0,lx,ly,w*.42);gl.addColorStop(0,'rgba(255,164,82,'+(.1*fl).toFixed(3)+')');gl.addColorStop(1,'rgba(255,164,82,0)');G.fillStyle=gl;G.fillRect(0,0,w,h);
    G.globalCompositeOperation='source-over';
    // the hand (pressed, or lifting away)
    var H=null,al=1,lift=0;if(st.press){H=st.press.hand;var t=st.press.t;lift=Math.max(0,1-t/.14);}else if(st.lift){H=st.lift.hand;var u=st.lift.t/.6;lift=u;al=1-u*u*(3-2*u);}
    if(H&&al>0.01){var sx=(H.x-st.lamp.x)*k,sy=(H.y-st.lamp.y)*k,sd=Math.hypot(sx,sy)||1,off=(3+lift*16)*k*2.4;
      G.save();G.translate(H.x*k,H.y*k);G.rotate(H.rot);var sc=k*(1+lift*.045);G.scale(sc,sc);
      G.shadowColor='rgba(10,6,3,'+(.6*al).toFixed(3)+')';G.shadowBlur=(6+lift*22)*k*2;G.shadowOffsetX=sx/sd*off;G.shadowOffsetY=sy/sd*off;
      G.globalAlpha=al*.97;G.drawImage(HM.art,-HM.ox,-HM.oy);G.restore();}
    // where the hand will go
    var gp=!st.press&&!st.lift?(st.hover||(st.kbOn?st.kb:null)):null;
    if(gp){gp=clampHand(gp);G.save();G.translate(gp.x*k,gp.y*k);G.rotate((gp.x/WW-.5)*.5);G.scale(k,k);G.globalAlpha=.14;G.drawImage(HM.ghost,-HM.ox,-HM.oy);G.restore();}
    G.globalAlpha=1;}
  raf=requestAnimationFrame(frame);

  var disposed=false;
  function dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(raf);if(st.press)end();if(ro)ro.disconnect();}
  host._dispose=dispose;
  // test hooks
  EH.debug=EH.debug||{};EH.debug.handprint={HM:HM,state:st,start:function(x,y){start({x:x*WW,y:y*WH});},end:end,mem:MEM};
});
})();

;
/* Special exhibit "hierarchy" (medieval room): 谁更大，谁更神圣.
   Click or tap any figure on the hung Maestà: a measuring overlay shows its face (brow to mouth) against the Madonna's.
   Toggle 按地位排 / 按远近排: the same figures as silhouettes, re-sized as if size followed distance (prophets in front
   largest, the Madonna behind smaller), animated from the painted arrangement.
   Figure masks come from rooms/medieval/cut/layers.json when present (per-figure RGBA crops + boxes in main.webp px);
   otherwise soft shapes from the boxes below / room.special.boxes. */
(function(){
'use strict';
if(!window.EH||!EH.special)return;

var IW=1340,IH=2400,WALL='#2A2320',IVORY='#f3ebdd',GOLD='#c9a15e';
var NUM='"Bodoni Moda","Didot","Bodoni 72",serif',SONG='"Noto Serif SC","Songti SC","STSong",serif';
// brow = glabella, mouth = centre of the lips, measured on main.webp (±2 px); z = relative distance from the viewer (prophets = 1)
var FIGS=[
  {k:'L1',n:'天使（左上）',s:'左上',g:'angel',box:[245,320,440,700],b:[353,421],m:[330,466],z:1.75},
  {k:'R1',n:'天使（右上）',s:'右上',g:'angel',box:[905,295,1100,700],b:[986,401],m:[1007,446],z:1.75},
  {k:'L2',n:'天使（左二）',s:'左二',g:'angel',box:[85,390,300,800],b:[207,490],m:[186,535],z:1.62},
  {k:'R2',n:'天使（右二）',s:'右二',g:'angel',box:[1060,375,1290,800],b:[1142,485],m:[1167,524],z:1.62},
  {k:'L3',n:'天使（左三）',s:'左三',g:'angel',box:[70,665,300,1000],b:[197,773],m:[169,818],z:1.5},
  {k:'R3',n:'天使（右三）',s:'右三',g:'angel',box:[1045,635,1290,1000],b:[1127,746],m:[1158,786],z:1.5},
  {k:'madonna',n:'圣母',s:'圣母',g:'holy',box:[360,115,1010,1670],b:[716,319],m:[687,401],z:1.4,anchor:[685,1670]},
  {k:'child',n:'圣子',s:'圣子',g:'holy',box:[770,470,990,1110],b:[848,564],m:[850,598],z:1.4,follow:'madonna'},
  {k:'L4',n:'天使（左下）',s:'左下',g:'angel',box:[20,925,300,1800],b:[128,1029],m:[134,1074],z:1.35},
  {k:'R4',n:'天使（右下）',s:'右下',g:'angel',box:[1040,890,1340,1800],b:[1191,1007],m:[1172,1054],z:1.35},
  {k:'jer',n:'先知耶利米',s:'耶利米',g:'prophet',box:[100,1990,300,2400],b:[217,2127],m:[232,2168],z:1},
  {k:'abr',n:'先知亚伯拉罕',s:'亚伯拉罕',g:'prophet',box:[410,1980,660,2400],b:[549,2089],m:[553,2131],z:1},
  {k:'dav',n:'先知大卫',s:'大卫',g:'prophet',box:[680,1990,930,2400],b:[795,2079],m:[791,2124],z:1},
  {k:'isa',n:'先知以赛亚',s:'以赛亚',g:'prophet',box:[1050,1990,1260,2400],b:[1162,2120],m:[1178,2165],z:1}
];
var FRONT=58;               // face size (px of main.webp) a front-row figure gets when size follows distance
var TONE={holy:'#d4b06a',angel:'#e9dfcd',prophet:'#d9b99a'};

var css='.hy{margin-top:14px}.hy .act{min-width:44px}.hy-seg{display:flex;gap:22px;margin:0 0 6px}'+
  '.hy-hint{margin:6px 0 10px!important;font-size:13.5px!important;color:var(--ink-2)}'+
  '.special .hy-stage{display:none;width:100%;margin:6px 0 12px;touch-action:pan-y;cursor:pointer}.special .hy.narrow .hy-stage{display:block}'+
  '.hy-figs{margin:4px 0 14px;font:400 14px/1.6 var(--song)}.hy-figs div{display:flex;flex-wrap:wrap;align-items:center;gap:0 6px;margin:0}'+
  '.hy-figs span{flex:0 0 4.2em;font-size:13px;color:var(--ink-3)}'+
  '.hy-figs button{min-width:44px;min-height:44px;padding:0 5px;color:var(--ink-2);text-decoration:underline transparent;text-decoration-thickness:1px;text-underline-offset:5px;transition:color .2s,text-decoration-color .2s}'+
  '.hy-figs button:hover{color:var(--ink);text-decoration-color:currentColor}'+
  '.hy-figs button[aria-pressed="true"]{color:var(--ink);font-weight:500;text-decoration-color:currentColor;text-decoration-thickness:2px}'+
  '.hy-card{display:block;width:100%;margin:4px 0 8px}'+
  '.hy-read{min-height:3.9em;margin:0 0 4px!important;font-size:14.5px!important}'+
  '.hy-note{font-size:13px!important;color:var(--ink-3);transition:opacity .4s}.hy-note[hidden]{display:block!important;opacity:0}'+
  '#cw.hy-point{cursor:pointer!important}'+
  '@media (max-width:560px){.hy-figs span{flex-basis:100%;margin-top:6px}}';

function clamp(x,a,b){return x<a?a:x>b?b:x;}
function lerp(a,b,t){return a+(b-a)*t;}
function seg(t,a,b){return clamp((t-a)/(b-a),0,1);}
function eio(x){x=clamp(x,0,1);return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;}
function dist(p,q){return Math.hypot(p[0]-q[0],p[1]-q[1]);}
function nb(t){return String(t==null?'':t).replace(/([\u3400-\u9fff）》”]) (?=[0-9A-Za-z])/g,'$1\u00a0').replace(/([0-9A-Za-z.%°]) (?=[\u3400-\u9fff（《“])/g,'$1\u00a0');}   // numbers stay with their units (same rule as core)
function r1(x){return (Math.round(x*10)/10).toFixed(1);}

EH.special('hierarchy',function(host,room,api){
  var sp=room.special||{},main=api.img(room.art.img);
  if(room.art&&room.art.w){IW=room.art.w;IH=room.art.h;}
  // ---------------------------------------------------------------- data
  var F={};FIGS.forEach(function(f){f=Object.assign({},f);f.box=f.box.slice();F[f.k]=f;});
  var ORDER=FIGS.map(function(f){return f.k;});
  var MAP={madonna:'madonna',angel:'L4',prophet:'abr'};
  (sp.boxes||[]).forEach(function(b){var f=F[MAP[b.key]];if(!f)return;if(b.figure&&b.key!=='madonna')f.box=b.figure.slice();if(b.faceBrowToMouth)f.dFix=b.faceBrowToMouth;});
  ORDER.forEach(function(k){var f=F[k];f.d=f.dFix||Math.round(dist(f.b,f.m));f.dT=FRONT/f.z;
    f.anchor=f.anchor||[(f.box[0]+f.box[2])/2,f.box[3]];});
  ORDER.forEach(function(k){var f=F[k];f.sT=f.follow?F[f.follow].sT:f.dT/f.d;});
  F.child.dT=F.child.d*F.child.sT;
  var M=F.madonna;

  // ---------------------------------------------------------------- DOM
  if(!document.getElementById('hy-css')){var st=document.createElement('style');st.id='hy-css';st.textContent=css;document.head.appendChild(st);}
  var root=document.createElement('div');root.className='hy';
  root.innerHTML='<div class="hy-seg" role="group" aria-label="人物大小按什么排">'+
      '<button type="button" class="act" data-mode="0" aria-pressed="true">按地位排</button>'+
      '<button type="button" class="act" data-mode="1" aria-pressed="false">按远近排</button></div>'+
    '<p class="hy-hint"></p>'+
    '<canvas class="hy-stage" role="img" aria-label="《圣三一圣母》上的人物，可点选"></canvas>'+
    '<div class="hy-figs" aria-label="选一个人物">'+
      '<div><span>圣母子</span>'+btns(['madonna','child'])+'</div>'+
      '<div><span>天使</span>'+btns(['L1','L2','L3','L4','R1','R2','R3','R4'])+'</div>'+
      '<div><span>先知</span>'+btns(['jer','abr','dav','isa'])+'</div></div>'+
    '<canvas class="hy-card" role="img" aria-label="脸的尺寸对比"></canvas>'+
    '<p class="hy-read" aria-live="polite"></p>'+
    '<p class="hy-note small" hidden><span class="nw">“按远近排”</span>是推算：假设每个人的脸一样大，只按离观者远近缩放；位置只是示意。</p>';
  function btns(ks){return ks.map(function(k){return '<button type="button" data-k="'+k+'" aria-pressed="false">'+F[k].s+'</button>';}).join('');}
  host.appendChild(root);
  var q=function(s){return root.querySelector(s);};
  var segBtns=root.querySelectorAll('.hy-seg button'),figBtns=root.querySelectorAll('.hy-figs button');
  var hint=q('.hy-hint'),stageC=q('.hy-stage'),cardC=q('.hy-card'),readP=q('.hy-read'),note=q('.hy-note');

  // ---------------------------------------------------------------- state
  var S={sel:null,hover:null,mode:0,t:0,from:0,t0:0,dur:1.5,active:false,vis:0,pulse:-1,dirty:true,narrow:false,layers:false};
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var over=null,og=null,buf=document.createElement('canvas'),bg=buf.getContext('2d'),tmp=document.createElement('canvas'),tg=tmp.getContext('2d');

  // ---------------------------------------------------------------- masks (fallback now, cut-outs when they arrive)
  var Q=.5;   // mask resolution relative to main.webp
  function softMask(f){var w=f.box[2]-f.box[0],h=f.box[3]-f.box[1],c=document.createElement('canvas');c.width=Math.max(2,Math.round(w*Q));c.height=Math.max(2,Math.round(h*Q));
    var g=c.getContext('2d'),r=Math.min(c.width,c.height)*.22;g.fillStyle='#000';g.beginPath();
    if(g.roundRect)g.roundRect(c.width*.06,c.height*.02,c.width*.88,c.height*.96,r);else g.rect(c.width*.06,c.height*.02,c.width*.88,c.height*.96);g.fill();return c;}
  // cut-outs can carry loose specks (gold punch-work picked up around a halo): keep only islands of a real size
  function despeckle(a,w,h){var n=w*h,lab=new Int32Array(n),sz=[0],st=new Int32Array(n),id=0,i,j,top,p,x,y,big=0,hit=false;
    for(i=0;i<n;i++){if(a[i]<=40||lab[i])continue;id++;var c=0;top=0;st[top++]=i;lab[i]=id;
      while(top){p=st[--top];c++;x=p%w;y=(p-x)/w;
        for(var dy=-1;dy<=1;dy++)for(var dx=-1;dx<=1;dx++){var xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=w||yy>=h)continue;j=yy*w+xx;if(a[j]>40&&!lab[j]){lab[j]=id;st[top++]=j;}}}
      sz.push(c);if(c>big)big=c;}
    var min=Math.max(24,big*.006);for(i=0;i<n;i++){if(lab[i]&&sz[lab[i]]<min){a[i]=0;hit=true;}}
    return hit;}
  function setMask(f,src,box){var w=box[2]-box[0],h=box[3]-box[1],c=document.createElement('canvas');c.width=Math.max(2,Math.round(w*Q));c.height=Math.max(2,Math.round(h*Q));
    var g=c.getContext('2d');src(g,c.width/w);f.mask=c;f.mbox=box.slice();f.alpha=null;
    try{var id=g.getImageData(0,0,c.width,c.height),d=id.data,a=new Uint8Array(c.width*c.height);for(var i=0;i<a.length;i++)a[i]=d[i*4+3];
      if(despeckle(a,c.width,c.height)){for(i=0;i<a.length;i++)if(!a[i])d[i*4+3]=0;g.putImageData(id,0,0);}f.alpha=a;}catch(e){f.alpha=null;}
    f.tint=null;}
  ORDER.forEach(function(k){var f=F[k],m=softMask(f);setMask(f,function(g){g.drawImage(m,0,0);},f.box);f.soft=true;});
  // silhouette: the figure's own shape in a flat tone, with a faint trace of the painted figure inside so each one stays recognisable
  function tintOf(f){if(f.tint)return f.tint;var c=document.createElement('canvas');c.width=f.mask.width;c.height=f.mask.height;var g=c.getContext('2d'),ok=main.complete&&main.naturalWidth,b=f.mbox;
    if(ok){g.drawImage(main,b[0],b[1],b[2]-b[0],b[3]-b[1],0,0,c.width,c.height);g.globalCompositeOperation='destination-in';}g.drawImage(f.mask,0,0);
    g.globalCompositeOperation='source-atop';g.globalAlpha=ok?.76:1;g.fillStyle=TONE[f.g];g.fillRect(0,0,c.width,c.height);if(ok)f.tint=c;return c;}
  spread();loadLayers();
  function loadLayers(){var x=new XMLHttpRequest();x.open('GET',api.path('cut/layers.json'));x.onload=function(){if(x.status&&x.status!==200)return;var j;try{j=JSON.parse(x.responseText);}catch(e){return;}useLayers(j);};x.onerror=function(){};try{x.send();}catch(e){}}
  function boxOf(o,iw,ih){var b=o.box||o.bbox||o.rect||o.xyxy||o.xywh;if(!b&&o.x!=null)b={x:o.x,y:o.y,w:o.w||o.width,h:o.h||o.height};if(!b)return null;
    if(!Array.isArray(b))return b.x0!=null?[b.x0,b.y0,b.x1,b.y1]:[b.x,b.y,b.x+(b.w||b.width),b.y+(b.h||b.height)];
    if(o.xywh||(iw&&Math.abs(b[2]-iw)<=2&&Math.abs(b[3]-ih)<=2&&!(Math.abs(b[2]-b[0]-iw)<=2)))return[b[0],b[1],b[0]+b[2],b[1]+b[3]];return b.slice(0,4);}
  function useLayers(j){var list=Array.isArray(j)?j:(j.layers||j.figures||j.items||Object.keys(j).filter(function(k){return j[k]&&typeof j[k]==='object'&&!Array.isArray(j[k]);}).map(function(k){var o=Object.assign({},j[k]);o.key=o.key||k;return o;}));
    list=(list||[]).filter(function(o){return o&&(o.file||o.img||o.src||o.path);});if(!list.length)return;var n=list.length;
    list.forEach(function(o){var p=o.file||o.img||o.src||o.path;p=/^(cut\/|rooms\/|https?:|data:)/.test(p)?p:'cut/'+p;var im=new Image();im.onload=function(){o.im=im;if(!--n)apply();};im.onerror=function(){if(!--n)apply();};im.src=/^(rooms\/|https?:|data:)/.test(p)?p:api.path(p);});
    function apply(){var L=list.filter(function(o){return o.im;}).map(function(o){o.bx=boxOf(o,o.im.naturalWidth,o.im.naturalHeight);return o;}).filter(function(o){return o.bx;});if(!L.length)return;
      var done={};function inside(f,b){var c=[(f.box[0]+f.box[2])/2,(f.box[1]+f.box[3])/2];return c[0]>=b[0]&&c[0]<=b[2]&&c[1]>=b[1]&&c[1]<=b[3];}
      function byName(o){var s=String(o.key||o.id||o.name||'').toLowerCase();if(F[s])return s;
        var al={madonna:'madonna',mary:'madonna',virgin:'madonna',child:'child',christ:'child',jeremiah:'jer',abraham:'abr',david:'dav',isaiah:'isa'};for(var a in al)if(s.indexOf(a)>=0&&!(a==='christ'&&s.indexOf('madonna')>=0))return al[a];
        var m=s.match(/(?:^|[^a-z])([lr])\s*_?([1-4])(?![0-9])/);return m?m[1].toUpperCase()+m[2]:null;}
      var put=function(f,o,clip){var b=clip?f.box:o.bx,sx=o.im.naturalWidth/(o.bx[2]-o.bx[0]),sy=o.im.naturalHeight/(o.bx[3]-o.bx[1]);
        setMask(f,function(g,s){g.save();g.scale(s,s);g.drawImage(o.im,(o.bx[0]-b[0]),(o.bx[1]-b[1]),o.im.naturalWidth/sx,o.im.naturalHeight/sy);
          // the Madonna: nothing of her rises above the halo, so trim loose punch-work specks outside its circle
          var hl=o.halo;if(byName(o)==='madonna'&&hl&&hl.length>2){var hy=hl[1]-b[1];if(hy>0){g.beginPath();g.rect(0,0,b[2]-b[0],hy);g.clip();g.globalCompositeOperation='destination-out';g.beginPath();g.rect(-2,-2,b[2]-b[0]+4,hy+6);
            g.moveTo(hl[0]-b[0]+hl[2]+3,hy);g.arc(hl[0]-b[0],hy,hl[2]+3,0,Math.PI*2,true);g.fill('evenodd');}}
          g.restore();},b);f.box=b.slice();f.soft=false;done[f.k]=1;};
      L=L.filter(function(o){return !/throne|gold|ground|background|base|wall/i.test(String(o.key||o.id||o.name||o.file||''));});
      L.forEach(function(o){var k=byName(o);if(k&&!done[k])put(F[k],o,false);});
      // no separate layer for the Child: take him out of the Madonna layer (same transform, so they move as one)
      L.forEach(function(o){if(byName(o)==='madonna'&&!done.child)put(F.child,o,true);});
      L.forEach(function(o){if(byName(o))return;var ins=ORDER.filter(function(k){return !done[k]&&inside(F[k],o.bx);});if(ins.length===1)put(F[ins[0]],o,false);});
      L.forEach(function(o){if(byName(o))return;ORDER.filter(function(k){return !done[k]&&inside(F[k],o.bx);}).forEach(function(k){put(F[k],o,true);});});
      ORDER.forEach(function(k){var f=F[k];if(!f.follow&&!F[k].anchorFixed&&k!=='madonna')f.anchor=[(f.box[0]+f.box[2])/2,f.box[3]];});
      spread();S.layers=Object.keys(done).length;S.dirty=true;}}

  // ---------------------------------------------------------------- geometry
  function mixS(f,t){return lerp(1,f.sT,t);}
  function anchorOf(f){return f.follow?F[f.follow].anchor:f.anchor;}
  // where the scale anchor sits at mix t: the front row also spreads sideways so the enlarged prophets stand side by side
  function anc(f,t){var a=anchorOf(f),b=(f.follow?F[f.follow]:f).aT;return b&&t>0?[lerp(a[0],b[0],t),lerp(a[1],b[1],t)]:a;}
  function spread(){var row=['jer','abr','dav','isa'].map(function(k){return F[k];}),ws=row.map(function(f){return (f.mbox[2]-f.mbox[0])*f.sT;}),tot=ws.reduce(function(a,b){return a+b;},0),n=row.length,
      g=tot<=IW?(IW-tot)/(n+1):(IW-tot)/(n-1),x=tot<=IW?g:0;
    row.forEach(function(f,i){var a=f.anchor,left=a[0]-(a[0]-f.mbox[0])*f.sT;f.aT=[a[0]+(x-left),a[1]];x+=ws[i]+g;});}
  function P(f,p,t){var a=anc(f,t),s=mixS(f,t);return[a[0]+(p[0]-a[0])*s,a[1]+(p[1]-a[1])*s];}   // image px -> image px at mix t
  function hit(ix,iy,t){for(var i=ORDER.length-1;i>=0;i--){var f=F[ORDER[i]],a=anc(f,t),s=mixS(f,t),x=a[0]+(ix-a[0])/s,y=a[1]+(iy-a[1])/s,b=f.mbox;
      if(x<b[0]||y<b[1]||x>=b[2]||y>=b[3])continue;if(!f.alpha)return f.k;
      var mx=Math.floor((x-b[0])*f.mask.width/(b[2]-b[0])),my=Math.floor((y-b[1])*f.mask.height/(b[3]-b[1]));if(f.alpha[my*f.mask.width+mx]>90)return f.k;}
    return null;}
  function dNow(f,t){return lerp(f.d,f.dT,t);}

  // ---------------------------------------------------------------- drawing (shared by the painting overlay and the in-panel stage)
  function drawMask(g,f,R,t,img){var sc=R.w/IW,a=anc(f,t),s=mixS(f,t),b=f.mbox;g.drawImage(img||f.mask,R.x+(a[0]+(b[0]-a[0])*s)*sc,R.y+(a[1]+(b[1]-a[1])*s)*sc,(b[2]-b[0])*s*sc,(b[3]-b[1])*s*sc);}
  // 1-px contour of one figure or several (drawn together in one pass), constant width on screen
  function outline(g,fs,R,t,col,alpha,w,dpr){if(alpha<=.01)return;if(!Array.isArray(fs))fs=[fs];var W=g.canvas.width,H=g.canvas.height;if(tmp.width!==W||tmp.height!==H){tmp.width=W;tmp.height=H;}
    var hh=R.h||R.w*IH/IW,x0=Math.max(0,Math.floor((R.x-4)*dpr)),y0=Math.max(0,Math.floor((R.y-4)*dpr)),x1=Math.min(W,Math.ceil((R.x+R.w+4)*dpr)),y1=Math.min(H,Math.ceil((R.y+hh+4)*dpr));if(x1<=x0||y1<=y0)return;
    tg.setTransform(1,0,0,1,0,0);tg.globalCompositeOperation='source-over';tg.globalAlpha=1;tg.clearRect(x0,y0,x1-x0,y1-y0);tg.setTransform(dpr,0,0,dpr,0,0);
    var o=w,D=[[-o,0],[o,0],[0,-o],[0,o],[-o*.7,-o*.7],[o*.7,-o*.7],[-o*.7,o*.7],[o*.7,o*.7]];
    fs.forEach(function(f){D.forEach(function(d){drawMask(tg,f,{x:R.x+d[0],y:R.y+d[1],w:R.w},t);});});
    tg.globalCompositeOperation='destination-out';fs.forEach(function(f){drawMask(tg,f,R,t);});
    tg.globalCompositeOperation='source-in';tg.fillStyle=col;tg.fillRect(R.x-4,R.y-4,R.w+8,hh+8);
    g.save();g.setTransform(1,0,0,1,0,0);g.globalAlpha=alpha;g.drawImage(tmp,x0,y0,x1-x0,y1-y0,x0,y0,x1-x0,y1-y0);g.restore();}
  // caliper along the face axis (brow to mouth), then a tag with the value: outside the painting when there is room, else beside the face
  function caliper(g,f,R,t,alpha,side,label,sub,col){if(alpha<=.01)return;var sc=R.w/IW,B=P(f,f.b,t),Mo=P(f,f.m,t);
    var bx=R.x+B[0]*sc,by=R.y+B[1]*sc,mx=R.x+Mo[0]*sc,my=R.y+Mo[1]*sc,L=Math.hypot(mx-bx,my-by)||1,ux=(mx-bx)/L,uy=(my-by)/L,nx=-uy,ny=ux;
    if(nx*side<0){nx=-nx;ny=-ny;}
    var off=Math.max(9,L*1.05+3),tk=Math.max(3,Math.min(5.5,L*.22));
    g.save();g.globalAlpha=alpha;g.lineCap='butt';
    function bars(){g.beginPath();
      g.moveTo(bx+nx*off,by+ny*off);g.lineTo(mx+nx*off,my+ny*off);
      g.moveTo(bx+nx*(off-tk),by+ny*(off-tk));g.lineTo(bx+nx*(off+tk),by+ny*(off+tk));
      g.moveTo(mx+nx*(off-tk),my+ny*(off-tk));g.lineTo(mx+nx*(off+tk),my+ny*(off+tk));g.stroke();}
    function leads(){g.beginPath();g.moveTo(bx-nx*L*.1,by-ny*L*.1);g.lineTo(bx+nx*(off-tk),by+ny*(off-tk));g.moveTo(mx-nx*L*.1,my-ny*L*.1);g.lineTo(mx+nx*(off-tk),my+ny*(off-tk));g.stroke();}
    g.strokeStyle='rgba(18,12,9,.6)';g.lineWidth=2.6;bars();g.strokeStyle=col;g.lineWidth=1;bars();
    g.setLineDash([1.5,2]);g.strokeStyle='rgba(18,12,9,.45)';g.lineWidth=2.2;leads();g.strokeStyle=col;g.lineWidth=.9;leads();g.setLineDash([]);
    // tag
    g.font='500 15px '+NUM;var w1=g.measureText(label).width;g.font='400 13px '+SONG;var w2=sub?g.measureText(sub).width:0;
    var bw=Math.ceil(Math.max(w1,w2)+16),bh=sub?44:26,px=(bx+mx)/2+nx*off,py=(by+my)/2+ny*off,ax=side>0?(R.ax||0):0,room=side<0?R.outL:R.outR-ax,tx,ty,lead=true;
    if(room>=bw+6){tx=side<0?R.x-R.gut-8-bw:R.x+R.w+R.gut+8+ax;ty=clamp(py-bh/2,R.y,R.y+R.h-bh);}
    else{lead=false;tx=clamp((bx+mx)/2-bw/2,R.x+3,R.x+R.w-bw-3);var low=my>R.y+R.h*.72;ty=low?Math.min(by,my)-L*.95-bh:Math.max(by,my)+L*.8;ty=clamp(ty,R.y+3,R.y+R.h-bh-3);}
    if(lead){var ex=side<0?tx+bw:tx,ey=ty+bh/2;g.strokeStyle='rgba(18,12,9,.5)';g.lineWidth=2.4;seg2();g.strokeStyle=col;g.lineWidth=.9;g.globalAlpha=alpha*.85;seg2();g.globalAlpha=alpha;
      function seg2(){g.beginPath();g.moveTo(px+nx*tk,py+ny*tk);g.lineTo(ex,ey);g.stroke();}}
    g.fillStyle='rgba(26,20,17,.88)';rr(g,tx,ty,bw,bh,2);g.fill();g.strokeStyle=col;g.globalAlpha=alpha*.55;g.lineWidth=1;rr(g,tx+.5,ty+.5,bw-1,bh-1,2);g.stroke();g.globalAlpha=alpha;
    g.textAlign='center';g.textBaseline='middle';g.fillStyle=col;g.font='500 15px '+NUM;g.fillText(label,tx+bw/2,ty+(sub?14:bh/2+.5));
    if(sub){g.fillStyle=IVORY;g.globalAlpha=alpha;g.font='400 13px '+SONG;g.fillText(sub,tx+bw/2,ty+31);}
    g.restore();}
  function rr(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}

  // one frame of the whole scene; R = the painting's rectangle in g's CSS px; paint = also draw the painting itself
  function scene(g,R,dpr,paint,alpha){var W=g.canvas.width,H=g.canvas.height;g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';g.clearRect(0,0,W,H);
    g.setTransform(dpr,0,0,dpr,0,0);R.h=R.w*IH/IW;
    if(paint){g.fillStyle=WALL;g.fillRect(0,0,W/dpr,H/dpr);if(main.complete&&main.naturalWidth)g.drawImage(main,R.x,R.y,R.w,R.h);}
    if(alpha<=.01)return;
    var t=eio(S.t),sel=S.sel?F[S.sel]:null,move=eio(seg(S.t,.18,1)),sil=seg(S.t,0,.3);
    // veil: dims the painting (only inside its gable-shaped outline); in rank mode the Madonna and the chosen figure stay lit
    var veil=Math.max(sel&&!S.mode?.62:0,sel?lerp(.62,.8,sil):.8*sil)*alpha;if(!sel&&S.t<=0)veil=0;
    if(veil>0){if(buf.width!==W||buf.height!==H){buf.width=W;buf.height=H;}bg.setTransform(1,0,0,1,0,0);bg.globalCompositeOperation='source-over';bg.globalAlpha=1;bg.clearRect(0,0,W,H);bg.setTransform(dpr,0,0,dpr,0,0);
      bg.fillStyle='rgb(24,18,15)';bg.fillRect(R.x,R.y,R.w,R.h);bg.globalCompositeOperation='destination-in';if(main.complete)bg.drawImage(main,R.x,R.y,R.w,R.h);
      if(sel&&sil<1){bg.globalCompositeOperation='destination-out';bg.globalAlpha=1-sil;drawMask(bg,M,R,0);if(sel!==M)drawMask(bg,sel,R,0);if(sel===M||sel.k==='child')drawMask(bg,F.child,R,0);}
      g.save();g.setTransform(1,0,0,1,0,0);g.globalAlpha=veil;g.drawImage(buf,0,0);g.restore();}
    // depth scale (distance mode): near at the bottom, far at the top
    R.ax=0;if(sil>0){var axOut=R.outR>=30;R.ax=axOut?40:0;var dx=axOut?R.x+R.w+R.gut+16:R.x+R.w-12,y0=R.y+R.h*.93,y1=R.y+R.h*.16,da=move*alpha;g.save();g.globalAlpha=da*.8;g.strokeStyle=IVORY;g.lineWidth=1;
      g.beginPath();g.moveTo(dx,y0);g.lineTo(dx,y1);g.moveTo(dx-3.5,y1+6);g.lineTo(dx,y1);g.lineTo(dx+3.5,y1+6);g.stroke();
      g.globalAlpha=da;g.fillStyle=IVORY;g.font='400 13px '+SONG;g.textAlign='center';g.textBaseline='top';g.fillText('近',dx,y0+6);g.textBaseline='bottom';g.fillText('远',dx,y1-5);g.restore();}
    // silhouettes
    if(sil>0){g.save();g.beginPath();g.rect(R.x-1,R.y-1,R.w+2,R.h+2);g.clip();
      ORDER.forEach(function(k){var f=F[k],on=sel&&(f===sel||f===M||(sel===M&&k==='child'));g.globalAlpha=sil*alpha*(sel?(on?.95:.5):.82);drawMask(g,f,R,move,tintOf(f));});g.restore();
      ORDER.forEach(function(k){var f=F[k];if(sel&&(f===sel||f===M))outline(g,f,R,move,f===sel?GOLD:IVORY,sil*alpha,1.2,dpr);});}
    // hint pulse: every figure outlined once when the exhibit first comes into view
    if(S.pulse>=0){var pa=Math.sin(Math.PI*clamp(S.pulse,0,1))*.8*alpha;outline(g,ORDER.map(function(k){return F[k];}),R,move,IVORY,pa,1,dpr);}
    // chosen figure (painted arrangement): outlines on the lit figures
    if(sel&&sil<1){outline(g,M,R,0,IVORY,(1-sil)*alpha*.9,1.1,dpr);if(sel!==M)outline(g,sel,R,0,GOLD,(1-sil)*alpha,1.3,dpr);}
    // hover
    if(S.hover&&S.hover!==S.sel)outline(g,F[S.hover],R,move,IVORY,.9*alpha,1.1,dpr);
    // calipers: the Madonna's tag goes on the side away from the chosen figure
    if(sel){var dm=dNow(M,move),ss=sel===M?-1:((P(sel,sel.b,move)[0]+P(sel,sel.m,move)[0])/2<IW*.5?-1:1);
      caliper(g,M,R,move,alpha,sel===M?-1:-ss,Math.round(dm)+'','圣母',IVORY);
      if(sel!==M){var ds=dNow(sel,move);caliper(g,sel,R,move,alpha,ss,Math.round(ds)+'','圣母 × '+(ds/dm).toFixed(2),GOLD);}}
  }

  // ---------------------------------------------------------------- the card: faces side by side at one scale, turned upright
  function plates(){var s=S.sel;if(!s||s==='madonna')return[M,F.L4,F.abr];return[M,F[s]];}
  function card(){var dpr=Math.min(devicePixelRatio||1,2),cw=cardC.clientWidth||300,narrow=cw<420,k=narrow?.74:1,H=Math.round(12+2.05*M.d*k+46);
    if(cardC.width!==Math.round(cw*dpr)||cardC.height!==Math.round(H*dpr)){cardC.width=Math.round(cw*dpr);cardC.height=Math.round(H*dpr);cardC.style.height=H+'px';}
    var g=cardC.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,cw,H);var t=eio(seg(S.t,.18,1)),list=plates(),gap=narrow?16:26;
    var yB=12+.6*M.d*k,ws=list.map(function(f){return 1.4*dNow(f,t)*k;}),tot=ws.reduce(function(a,b){return a+b;},0)+gap*(list.length-1),x=Math.max(34,(cw-tot)/2);
    // brow line across the card
    g.strokeStyle='rgba(243,235,221,.35)';g.lineWidth=1;g.beginPath();g.moveTo(8,Math.round(yB)+.5);g.lineTo(cw-8,Math.round(yB)+.5);g.stroke();
    g.fillStyle='rgba(243,235,221,.9)';g.font='400 13px '+SONG;g.textAlign='left';g.textBaseline='middle';g.fillText('眉',8,yB-11);
    var ym=yB+dNow(M,t)*k;g.save();g.setLineDash([3,3]);g.strokeStyle='rgba(243,235,221,.4)';g.beginPath();g.moveTo(8,Math.round(ym)+.5);g.lineTo(cw-8,Math.round(ym)+.5);g.stroke();g.restore();
    g.fillText('嘴',8,ym+11);
    list.forEach(function(f,i){var dd=dNow(f,t),w=ws[i],top=yB-.6*dd*k,h=2.05*dd*k,s=dd/f.d*k,a=Math.atan2(f.m[0]-f.b[0],f.m[1]-f.b[1]),cx=x+w/2;
      g.save();g.beginPath();g.rect(x,top,w,h);g.clip();g.fillStyle='#1b1512';g.fillRect(x,top,w,h);
      g.translate(cx,yB);g.rotate(a);g.scale(s,s);g.translate(-f.b[0],-f.b[1]);if(main.complete)g.drawImage(main,0,0);g.restore();
      var hl=f.k===S.sel||(!S.sel&&f===M)?GOLD:'rgba(243,235,221,.5)';g.strokeStyle=hl;g.lineWidth=1;g.strokeRect(x+.5,top+.5,w-1,h-1);
      // mouth tick for this face
      var my=yB+dd*k;g.strokeStyle=f===M?IVORY:GOLD;g.beginPath();g.moveTo(x-5,Math.round(my)+.5);g.lineTo(x+w+5,Math.round(my)+.5);g.moveTo(x-5,Math.round(yB)+.5);g.lineTo(x+w+5,Math.round(yB)+.5);g.stroke();
      g.textAlign='center';g.textBaseline='alphabetic';var base=yB+1.45*Math.max.apply(null,list.map(function(o){return dNow(o,t);}))*k;
      g.fillStyle=IVORY;g.font='400 13px '+SONG;g.fillText(f.n.replace('先知',''),cx,base+19);
      g.fillStyle=f===M?IVORY:GOLD;g.font='500 14px '+NUM;g.fillText(Math.round(dd)+(narrow?'':' px'),cx,base+37);
      x+=w+gap;});}

  // ---------------------------------------------------------------- words
  function words(){var s=S.sel?F[S.sel]:null,d=S.mode,txt;
    var ang=['L1','L2','L3','L4','R1','R2','R3','R4'].map(function(k){return F[k].d;}),pro=['jer','abr','dav','isa'].map(function(k){return F[k].d;});
    function rng(a){return Math.min.apply(null,a)+'–'+Math.max.apply(null,a);}
    if(!s)txt=d?'按远近排：先知在最前排，离我们最近，脸约 '+Math.round(FRONT)+' 像素，画得最大；圣母坐在他们后面，只剩约 '+Math.round(M.dT)+' 像素。这才是“近大远小”，契马布埃没有这样排。'
             :'量的是眉心到嘴的距离，单位是这张图的像素。圣母约 '+M.d+'，天使约 '+rng(ang)+'，先知约 '+rng(pro)+'。点画上任何一个人物，比比和圣母差多少。';
    else if(s===M)txt=d?'按远近推算，圣母只有约 '+Math.round(M.dT)+' 像素，比最前排的先知（约 '+FRONT+'）还小。'
             :'圣母：眉心到嘴约 '+M.d+' 像素，全画最大的一张脸。天使约 '+rng(ang)+'，先知约 '+rng(pro)+'。';
    else{var r=M.d/s.d;
      if(!d)txt=s.n+'：眉心到嘴约 '+s.d+' 像素。圣母约 '+M.d+' 像素，是这张脸的 '+r1(r)+' 倍，脸的面积约 '+r1(r*r)+' 倍。'+(s.k==='child'?'圣子是孩子，脸本来就小。':s.g==='prophet'?'先知在最前排，离我们并不比圣母远。':'');
      else{var a=s.dT,b=M.dT,c=a/b,gn=s.g==='prophet'?'先知':'天使';txt='按远近推算：'+s.n+'约 '+Math.round(a)+' 像素，圣母约 '+Math.round(b)+' 像素，'+
        (s.k==='child'?'圣子坐在圣母怀里，两人一起缩小。':c>1.08?gn+'反而是圣母的 '+r1(c)+' 倍。':c<.92?'圣母是'+gn+'的 '+r1(1/c)+' 倍，因为'+gn+'站得更靠后。':'两人差不多大。');}}
    readP.textContent=nb(txt);note.hidden=!d;note.setAttribute('aria-hidden',d?'false':'true');
    hint.textContent=S.narrow?'点下面画上的人物，或从列表里选。':'点左边画上的人物，或从列表里选。';}

  // ---------------------------------------------------------------- interaction
  function select(k,silent){S.sel=(k&&k===S.sel)?null:k;figBtns.forEach(function(b){b.setAttribute('aria-pressed',b.getAttribute('data-k')===S.sel?'true':'false');});
    if(!silent&&S.sel&&api.sfx)api.sfx.tick(.05);words();S.dirty=true;}
  function setMode(m){if(m===S.mode)return;S.mode=m;S.from=S.t;S.t0=performance.now();segBtns.forEach(function(b){b.setAttribute('aria-pressed',+b.getAttribute('data-mode')===m?'true':'false');});
    if(api.sfx){if(m)api.sfx.whoosh(.05,1.1);else api.sfx.puff(.05,.5);}words();S.dirty=true;}
  segBtns.forEach(function(b){b.addEventListener('click',function(){setMode(+b.getAttribute('data-mode'));});});
  figBtns.forEach(function(b){b.addEventListener('click',function(){select(b.getAttribute('data-k'));});});
  function toImage(cx,cy,R){var sc=R.w/IW;return[(cx-R.x)/sc,(cy-R.y)/sc];}
  function inArt(p){return p[0]>=0&&p[1]>=0&&p[0]<IW&&p[1]<IH;}
  // painting overlay: listen on window (capture) so clicks on empty gold still open the viewer as before
  function coreToolOn(){return !!document.querySelector('#read .act[data-tool][aria-pressed="true"]')||(document.getElementById('cmpA')||{classList:{contains:function(){return false;}}}).classList.contains('on');}
  var PAD=210;function artBox(){var fr=document.getElementById('frame');if(!fr||fr.classList.contains('hidden'))return null;var r=api.artRect();if(!r||r.width<60)return null;
    var fl=fr.getBoundingClientRect(),gut=Math.max(0,r.left-fl.left),rd=document.getElementById('read'),rl=rd&&document.getElementById('room').classList.contains('reading')?rd.getBoundingClientRect().left:innerWidth;
    return{x:r.left,y:r.top,w:r.width,h:r.height,gut:gut,outL:Math.min(PAD,r.left)-gut-10,outR:Math.min(PAD,rl-r.right)-gut-10};}
  function overlayLive(){return !S.narrow&&S.active&&!coreToolOn()&&!(document.getElementById('view')||{classList:{contains:function(){}}}).classList.contains('on');}
  function onMove(e){if(!overlayLive()){if(S.hover){S.hover=null;cursor('');S.dirty=true;}return;}var A=artBox();if(!A)return;var p=toImage(e.clientX,e.clientY,A),k=inArt(p)&&e.pointerType!=='touch'?hit(p[0],p[1],eio(seg(S.t,.18,1))):null;
    if(k!==S.hover){S.hover=k;cursor(k?'pointer':'');S.dirty=true;}}
  function onClick(e){if(!overlayLive())return;var A=artBox();if(!A)return;var p=toImage(e.clientX,e.clientY,A);if(!inArt(p))return;var k=hit(p[0],p[1],eio(seg(S.t,.18,1)));
    if(k){select(k===S.sel?null:k);e.stopPropagation();e.preventDefault();}else if(S.sel||S.mode){select(null);e.stopPropagation();e.preventDefault();}}
  var cw=document.getElementById('cw');function cursor(c){if(cw)cw.classList.toggle('hy-point',!!c);}   // a class, not an inline style: the room's rest() owns #cw's inline cursor
  addEventListener('pointermove',onMove,true);addEventListener('click',onClick,true);
  // in-panel stage (narrow screens, where the reading panel covers the painting)
  var down=null;
  stageC.addEventListener('pointerdown',function(e){down=[e.clientX,e.clientY];});
  stageC.addEventListener('pointerup',function(e){if(!down)return;var mv=Math.hypot(e.clientX-down[0],e.clientY-down[1]);down=null;if(mv>10)return;var r=stageC.getBoundingClientRect(),R=stageRect(r.width,r.height),p=toImage(e.clientX-r.left,e.clientY-r.top,R);
    if(!inArt(p)){select(null);return;}var k=hit(p[0],p[1],eio(seg(S.t,.18,1)));select(k?(k===S.sel?null:k):null);});
  stageC.addEventListener('pointermove',function(e){if(e.pointerType==='touch')return;var r=stageC.getBoundingClientRect(),R=stageRect(r.width,r.height),p=toImage(e.clientX-r.left,e.clientY-r.top,R),k=inArt(p)?hit(p[0],p[1],eio(seg(S.t,.18,1))):null;if(k!==S.hover){S.hover=k;S.dirty=true;}});
  stageC.addEventListener('pointerleave',function(){if(S.hover){S.hover=null;S.dirty=true;}});
  function stageRect(w,h){var pw=Math.min(w,h*IW/IH);return{x:(w-pw)/2,y:0,w:pw};}
  // visible only while the exhibit is on screen in the reading panel
  var io=null,readEl=document.getElementById('read');
  if('IntersectionObserver' in window){io=new IntersectionObserver(function(es){es.forEach(function(en){var was=S.active;S.active=en.isIntersecting;if(S.active&&!was&&S.pulse<0&&!S.sel)S.pulse=0;S.dirty=true;});},{root:readEl||null,threshold:0});io.observe(root);}else S.active=true;

  // ---------------------------------------------------------------- loop
  var raf=0,last=0,lastBox='',lastCard='';
  function ensureOverlay(){if(over)return;over=document.createElement('canvas');over.setAttribute('aria-hidden','true');over.style.cssText='position:fixed;left:0;top:0;width:0;height:0;pointer-events:none;z-index:5';
    (document.getElementById('room')||document.body).appendChild(over);og=over.getContext('2d');}
  function tick(now){raf=requestAnimationFrame(tick);var dt=last?Math.min((now-last)/1000,.1):0;last=now;
    if(!root.isConnected){dispose();return;}
    var narrow=!artBox()&&!!(readEl&&document.getElementById('room').classList.contains('reading'));
    if(narrow!==S.narrow){S.narrow=narrow;root.classList.toggle('narrow',narrow);words();S.dirty=true;}
    var target=S.mode?1:0;if(S.t!==target){var dur=reduce?.01:S.dur,p=clamp((now-S.t0)/1000/dur,0,1);S.t=lerp(S.from,target,p);if(p>=1)S.t=target;S.dirty=true;}
    if(S.pulse>=0){S.pulse+=dt/(reduce?.01:2.4);if(S.pulse>=1)S.pulse=-2;S.dirty=true;}
    var live=overlayLive(),va=live?1:0;S.vis=reduce?va:S.vis+(va-S.vis)*Math.min(1,dt*7);if(Math.abs(S.vis-va)<.01)S.vis=va;
    // painting overlay
    var A=artBox();
    if(A&&(S.vis>0||over)){ensureOverlay();var dpr=Math.min(devicePixelRatio||1,2),key=[A.x,A.y,A.w,A.h,dpr].map(function(v){return Math.round(v*10);}).join(',');
      if(key!==lastBox){lastBox=key;var pad=PAD;over.style.left=(A.x-pad)+'px';over.style.top=(A.y-pad)+'px';over.style.width=(A.w+2*pad)+'px';over.style.height=(A.h+2*pad)+'px';
        over.width=Math.round((A.w+2*pad)*dpr);over.height=Math.round((A.h+2*pad)*dpr);S.dirty=true;over._pad=pad;}
      if(S.dirty||Math.abs(S.vis-va)>0){scene(og,{x:over._pad,y:over._pad,w:A.w,gut:A.gut,outL:A.outL,outR:A.outR},dpr,false,S.vis);}}
    else if(over&&!A){og.setTransform(1,0,0,1,0,0);og.clearRect(0,0,over.width,over.height);lastBox='';}
    // in-panel stage
    if(S.narrow&&S.dirty){var w=stageC.clientWidth||root.clientWidth||320,h=Math.min(w*IH/IW,Math.max(320,innerHeight*.72)),d2=Math.min(devicePixelRatio||1,2);
      if(stageC.width!==Math.round(w*d2)||stageC.height!==Math.round(h*d2)){stageC.width=Math.round(w*d2);stageC.height=Math.round(h*d2);stageC.style.height=h+'px';}
      var SR=stageRect(w,h);SR.gut=0;SR.outL=SR.x-2;SR.outR=w-SR.x-SR.w-2;scene(stageC.getContext('2d'),SR,d2,true,1);}
    var ck=S.sel+'|'+S.t.toFixed(4)+'|'+cardC.clientWidth+'|'+(main.complete?1:0)+'|'+S.layers;if(ck!==lastCard){lastCard=ck;card();}
    S.dirty=false;}
  function dispose(){cancelAnimationFrame(raf);removeEventListener('pointermove',onMove,true);removeEventListener('click',onClick,true);if(io)io.disconnect();
    if(over&&over.parentNode)over.parentNode.removeChild(over);over=null;cursor('');}
  host._dispose=dispose;
  if(!main.complete)main.addEventListener('load',function(){S.dirty=true;lastCard='';},{once:true});
  words();raf=requestAnimationFrame(tick);
  // test hook
  EH.hierarchy={state:S,select:function(k){select(k,true);},mode:setMode,figs:F,useLayers:useLayers};
});
})();

;
/* Special exhibit "impression" (印象派 · 你来画这座港口).
   The visitor repaints Monet's harbour. The first press on the hung painting (or on the canvas in the panel on narrow screens) washes it
   over with a blank grey-blue ground, spreading from the brush; then the brush follows the pointer (a little behind, like a loaded brush)
   and lays strokes sampled from the painting: colour from the painting under the brush (coarse while the spot is new, finer on every
   further pass), direction along the local structure of the image (edges; horizontal where there is none, as on the water), length
   from the speed of the hand. The brush carries its colour (wet-in-wet: drag from the sun into the sky and the orange smears) and
   runs dry during a long stroke; lifting reloads it. Pressing still dabs.
   The sun and its reflection are laid in thick, pure orange; when the sun is in, it glows once and the note points to 黑白.
   黑白 turns the painting (the visitor's and the original) into lightness only, matched in CIE L*: the sun vanishes into the sky
   (equiluminance, measured live on the original and on the visitor's own painting). 笔序回放 is a history slider over every stroke
   (painting after scrubbing back continues from there), with a ▶ replay. 替我画 lets a ghost brush paint in a demonstration order
   (sky and water broad, a finer pass, the boats, the sun and its reflection last) — also the keyboard path. 按住看原画 peeks.
   名字从哪来 tells Louis Leroy's 1874 review (room.special.nameStory).
   Geometry: sun/boats in main.webp pixels (2400 × 1862), scaled by room.art.w; replaced by rooms/impressionism/cut/layers.json when it
   names them (ids "sun", "boat*"); the sun is also located from the pixels (largest orange blob in the upper half). */
(function(){
'use strict';
if(!window.EH||!EH.special)return;

function clamp(x,a,b){return x<a?a:x>b?b:x;}
function lerp(a,b,t){return a+(b-a)*t;}
function sm(t){t=clamp(t,0,1);return t*t*(3-2*t);}
function nb(t){return String(t==null?'':t).replace(/([㐀-鿿）》”]) (?=[0-9A-Za-z])/g,'$1 ').replace(/([0-9A-Za-z.%°*]) (?=[㐀-鿿（《“≈])/g,'$1 ');}
function ok(i){return !!(i&&i.complete&&i.naturalWidth>0);}
function rng(s){s=(s>>>0)||1;return function(){s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return s/4294967296;};}
function xhrJSON(url,cb){try{var x=new XMLHttpRequest();x.open('GET',url+'?t='+Date.now(),true);x.overrideMimeType('application/json');
  x.onload=function(){if(x.status===200||(x.status===0&&x.responseText)){try{cb(JSON.parse(x.responseText));}catch(e){cb(null);}}else cb(null);};
  x.onerror=function(){cb(null);};x.send();}catch(e){cb(null);}}
// sRGB ↔ CIE L* (D65), for the equiluminant black-and-white
function toLin(c){c/=255;return c<=.04045?c/12.92:Math.pow((c+.055)/1.055,2.4);}
var LIN=new Float32Array(256);for(var i0=0;i0<256;i0++)LIN[i0]=toLin(i0);
function Lstar(r,g,b){var Y=.2126*LIN[r|0]+.7152*LIN[g|0]+.0722*LIN[b|0];return Y>216/24389?116*Math.cbrt(Y)-16:Y*24389/27;}
function grayOfL(L){var Y=L>8?Math.pow((L+16)/116,3):L*27/24389,c=Y<=.0031308?12.92*Y:1.055*Math.pow(Y,1/2.4)-.055;return clamp(Math.round(c*255),0,255);}
function grayOf(r,g,b){return grayOfL(Lstar(r,g,b));}

// ---------------------------------------------------------------- defaults (main.webp px, 2400 × 1862)
var DEF={W:2400,H:1862,sun:[1461,576,38],reflect:[1370,960,1545,1640],
  boats:[[1140,1352,70],[705,1150,62],[440,1050,44]]};
var GROUND=[120,132,138];                                            // the blank grey-blue ground
var LOG_MAX=16000;                                                   // strokes kept for 笔序回放 (the oldest stay painted, see trim())

function css(){if(document.getElementById('s-impression-css'))return;var s=document.createElement('style');s.id='s-impression-css';s.textContent=
  '.im{margin-top:16px}'+
  '.im .im-stage{display:none;width:100%;height:auto;touch-action:pan-y;cursor:crosshair;background:#6d777b;box-shadow:0 18px 40px -22px rgba(0,0,0,.7);margin-bottom:14px}'+
  '.im.narrow .im-stage{display:block}.im .im-sw{display:block}.im.live .im-stage{touch-action:none}'+
  '.im-top{display:flex;align-items:center;gap:14px;margin:0 0 6px}'+
  '.im-sw{flex:0 0 auto;width:44px;height:44px;display:block}'+
  '.im-stat{flex:1 1 auto;min-width:0;margin:0!important;font:400 13.5px/1.7 var(--song)!important;color:var(--ink-2);font-variant-numeric:tabular-nums}'+
  '.im-hint{margin:0 0 10px!important;font-size:13.5px!important;color:var(--ink-2)}'+
  '.im .acts{margin:0 0 4px}.im .act{min-width:44px;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}'+
  '.im-rep{display:flex;align-items:center;gap:12px;margin:8px 0 2px;font:400 14px/1.6 var(--song)}'+
  '.im-rep label{flex:0 0 auto;white-space:nowrap}'+
  '.im-rep input{flex:1 1 auto;min-width:80px;height:44px;margin:0;accent-color:var(--gold,#b08d57);cursor:pointer}'+
  '.im-rep input:disabled{cursor:default;opacity:.55}'+
  '.im-play{flex:0 0 auto;min-width:44px;min-height:44px;padding:0 4px;font:400 14px/1 var(--song);color:inherit;text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:5px}'+
  '.im-play[aria-pressed="true"]{font-weight:500;text-decoration-thickness:2px}'+
  '.im-play:disabled{opacity:.55;text-decoration:none;cursor:default}'+
  '.im-k{flex:0 0 auto;min-width:5.6em;text-align:right;font-size:13px;color:var(--ink-2);font-variant-numeric:tabular-nums;white-space:nowrap}'+
  '@media (max-width:420px){.im-rep{flex-wrap:wrap;gap:0 12px}.im-rep input{order:3;flex-basis:100%}}'+
  '.im-note{margin:10px 0 0!important;min-height:0}.im-note p{margin:0 0 8px!important;font-size:14.5px!important}'+
  '.im-note .im-meas{font-size:13.5px!important;color:var(--ink-2);font-variant-numeric:tabular-nums}'+
  '.im-name{margin:6px 0 0;padding:2px 0 0 16px;border-left:1px solid var(--ink-3)}.im-name[hidden]{display:none}'+
  '.im-name p{margin:0 0 10px!important}'+
  '.im-ov{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:1}';
  document.head.appendChild(s);}

EH.special('impression',function(host,room,api){
  css();
  var sp=room.special||{},art=room.art||{w:2400,h:1862};
  var AW=art.w||DEF.W,AH=art.h||DEF.H,KA=AW/DEF.W;                    // art px, scaled from the defaults
  var LB=sp.labels||{};
  var HO=sp.hint&&typeof sp.hint==='object'?sp.hint:null;
  function str(v){if(!v)return '';if(typeof v==='string')return v;if(Array.isArray(v))return v.map(str).filter(Boolean).join('\n');return v.text||v.t||v.body||'';}
  var T={
    auto:LB.auto||'替我画',stop:LB.stop||'停下',bw:LB.bw||'黑白',peek:LB.peek||'按住看原画',name:LB.name||'名字从哪来',reset:LB.reset||'重新铺底',
    replay:LB.replay||'笔序回放',play:LB.play||'回放',pause:LB.pause||'暂停',
    hintWall:sp.hintWall||(HO&&HO.mouse)||'在墙上的画上按住拖动：画面先刷成一片灰蓝，你拖到哪里，笔触就按那里的颜色和走向落下。同一处多刷几遍，笔会越来越细。',
    hintWallTouch:sp.hintWallTouch||(HO&&HO.touch)||'用手指在墙上的画上涂：画面先刷成一片灰蓝，涂到哪里，笔触就按那里的颜色和走向落下。同一处多涂几遍，笔会越来越细。',
    hint:(typeof sp.hint==='string'&&sp.hint)||'在上面的画布上按住拖动：先刷成一片灰蓝，拖到哪里，笔触就按那里的颜色和走向落下。同一处多刷几遍，笔会越来越细。',
    hintTouch:sp.hintTouch||(HO&&HO.touch)||'先点一下上面的画布，再用手指在上面涂：涂到哪里，笔触就按那里的颜色和走向落下。同一处多涂几遍，笔会越来越细。',
    stat:'已铺 {c}% · {n} 笔 · {s} 秒',statIdle:'笔上还没有颜色',
    sun:sp.sunNote||'太阳是几笔纯橙色，直接压在灰蓝上。现在按“黑白”，看它去哪了。',
    bwNote:sp.bwNote||'去掉颜色、只留明暗，太阳几乎和周围的天空一样亮，就融进了雾里。它能“跳”出来，靠的是橙色与灰蓝的色相对比，不是明暗。视觉科学家利文斯通在《视觉与艺术》里用这幅画说明过这一点。',
    meas:'原画实测（CIE L*）：太阳 {a}，周围天空 {b}。',measMine:'你画的：太阳 {a}，周围天空 {b}。',
    done:sp.doneNote||'{n} 笔、{s} 秒，港口、雾和太阳都有了，细节却一处也没画。当年这正是它挨骂的地方，也是它的新意：画的是一眼望去的光和色。',
    ghost:sp.ghostNote||'示范顺序：先用大笔铺天空和水，再细刷一遍港口，然后点出小船，太阳和它的倒影放在最后。随时可以接过笔来。',
    nameStory:str(sp.nameStory)||'1874 年 4 月，莫奈和朋友们在巴黎卡皮西纳大道自办展览，这幅画也在其中。编目录时要一个画名，莫奈说，就写“印象”吧。\n评论家路易·勒鲁瓦在讽刺报纸《喧闹报》上写了一篇假想的看展对话，借这个画名把参展者统称为“印象派”，还挖苦说，刚开了个头的壁纸都比这幅海景完成得更好。\n嘲讽的外号后来被画家们自己接了过来，一直用到今天。'
  };
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mqT=window.matchMedia?matchMedia('(hover: none)'):null;function touchUI(){return !!(mqT&&mqT.matches);}

  // ---------- DOM
  var wrap=document.createElement('div');wrap.className='im';
  wrap.innerHTML='<canvas class="im-stage" role="img" aria-label="你正在重画的《日出·印象》。按住拖动作画。"></canvas>'+
    '<div class="im-top"><canvas class="im-sw" role="img" aria-label="笔上的颜色"></canvas><p class="im-stat" aria-live="off"></p></div>'+
    '<p class="im-hint"></p>'+
    '<div class="acts" role="group" aria-label="作画"><button type="button" class="act" data-a="auto" aria-pressed="false"></button><button type="button" class="act" data-a="bw" aria-pressed="false"></button>'+
      '<button type="button" class="act" data-a="peek" aria-pressed="false"></button><button type="button" class="act" data-a="name" aria-pressed="false" aria-expanded="false"></button><button type="button" class="act" data-a="reset"></button></div>'+
    '<div class="im-rep"><label></label><button type="button" class="im-play" aria-pressed="false" disabled></button><input type="range" min="0" max="0" value="0" step="1" disabled><span class="im-k"></span></div>'+
    '<div class="im-note" aria-live="polite"></div>'+
    '<div class="im-name" hidden></div>';
  host.appendChild(wrap);
  var stage=wrap.querySelector('.im-stage'),sg=stage.getContext('2d'),swC=wrap.querySelector('.im-sw'),swG=swC.getContext('2d');
  var statEl=wrap.querySelector('.im-stat'),hintEl=wrap.querySelector('.im-hint'),noteEl=wrap.querySelector('.im-note'),nameEl=wrap.querySelector('.im-name');
  var B={};Array.prototype.forEach.call(wrap.querySelectorAll('[data-a]'),function(b){B[b.getAttribute('data-a')]=b;b.textContent=T[b.getAttribute('data-a')];});
  var rep=wrap.querySelector('.im-rep'),range=rep.querySelector('input'),playBtn=rep.querySelector('.im-play'),kEl=rep.querySelector('.im-k');
  var rid='im-r-'+Math.random().toString(36).slice(2,7);range.id=rid;rep.querySelector('label').setAttribute('for',rid);rep.querySelector('label').textContent=T.replay;
  playBtn.textContent=T.play;stage.style.aspectRatio=(art.w||DEF.W)+'/'+(art.h||DEF.H);range.setAttribute('aria-valuetext','0 笔');
  T.nameStory.split(/\n+/).forEach(function(t){var p=document.createElement('p');p.textContent=nb(t);nameEl.appendChild(p);});
  B.name.setAttribute('aria-controls',nameEl.id='im-n-'+rid.slice(5));

  // ---------- source analysis (once the hung image is decoded)
  var src=api.img(art.img||'main.webp');
  var PW=Math.min(1600,AW),PH=Math.round(PW*AH/AW),KP=PW/AW;         // paint space (px of the paint canvases)
  var M=null;                                                         // {m:[mip150,mip300,mip600], F:{w,h,ang,coh,mag}, hot, org, gray, sun, meas}
  var PC=null,PG=null,pcg=null,pgg=null,GC=null,GG=null;              // paint canvases colour/gray, ground colour/gray
  var geo={sun:[DEF.sun[0]*KA,DEF.sun[1]*KA,DEF.sun[2]*KA],reflect:DEF.reflect.map(function(v){return v*KA;}),boats:DEF.boats.map(function(b){return[b[0]*KA,b[1]*KA,b[2]*KA];})};
  function mk(w,h){var c=document.createElement('canvas');c.width=w;c.height=h;return c;}
  function mip(w){var h=Math.round(w*AH/AW),c=mk(w,h),g=c.getContext('2d');g.imageSmoothingQuality='high';
    if(w<400&&'filter' in g){var t=mk(w*2,h*2),tg=t.getContext('2d');tg.imageSmoothingQuality='high';tg.drawImage(src,0,0,w*2,h*2);g.filter='blur('+(w<200?1.4:.8)+'px)';g.drawImage(t,0,0,w,h);g.filter='none';}
    else g.drawImage(src,0,0,w,h);
    return{w:w,h:h,d:g.getImageData(0,0,w,h).data};}
  function analyse(){if(M||!ok(src))return;try{
    var m=[mip(150),mip(300),mip(600)];
    // structure tensor on the 300 mip (lightness)
    var a=m[1],w=a.w,h=a.h,Lm=new Float32Array(w*h),i,x,y;
    for(i=0;i<w*h;i++)Lm[i]=Lstar(a.d[i*4],a.d[i*4+1],a.d[i*4+2]);
    var jxx=new Float32Array(w*h),jxy=new Float32Array(w*h),jyy=new Float32Array(w*h);
    for(y=1;y<h-1;y++)for(x=1;x<w-1;x++){i=y*w+x;
      var gx=(Lm[i-w+1]+2*Lm[i+1]+Lm[i+w+1])-(Lm[i-w-1]+2*Lm[i-1]+Lm[i+w-1]),gy=(Lm[i+w-1]+2*Lm[i+w]+Lm[i+w+1])-(Lm[i-w-1]+2*Lm[i-w]+Lm[i-w+1]);
      jxx[i]=gx*gx;jxy[i]=gx*gy;jyy[i]=gy*gy;}
    function blur(A,r){var B2=new Float32Array(w*h),C=new Float32Array(w*h),x2,y2,s,k;
      for(y2=0;y2<h;y2++){s=0;for(k=-r;k<=r;k++)s+=A[y2*w+clamp(k,0,w-1)];for(x2=0;x2<w;x2++){B2[y2*w+x2]=s;s+=A[y2*w+Math.min(w-1,x2+r+1)]-A[y2*w+Math.max(0,x2-r)];}}
      for(x2=0;x2<w;x2++){s=0;for(k=-r;k<=r;k++)s+=B2[clamp(k,0,h-1)*w+x2];for(y2=0;y2<h;y2++){C[y2*w+x2]=s;s+=B2[Math.min(h-1,y2+r+1)*w+x2]-B2[Math.max(0,y2-r)*w+x2];}}return C;}
    jxx=blur(jxx,3);jxy=blur(jxy,3);jyy=blur(jyy,3);
    var ang=new Float32Array(w*h),coh=new Float32Array(w*h),mag=new Float32Array(w*h),mm=[];
    for(i=0;i<w*h;i++){var tr=jxx[i]+jyy[i],df=Math.sqrt((jxx[i]-jyy[i])*(jxx[i]-jyy[i])+4*jxy[i]*jxy[i]);
      ang[i]=.5*Math.atan2(2*jxy[i],jxx[i]-jyy[i])+Math.PI/2;            // along the edges (across the gradient)
      coh[i]=tr>1e-6?df/tr:0;mag[i]=Math.sqrt(tr);if(i%7===0)mm.push(mag[i]);}
    mm.sort(function(p,q){return p-q;});var magRef=mm[Math.floor(mm.length*.9)]||1;
    // orange: the sun and its reflection (thick pure paint)
    var f=m[2],fw=f.w,fh=f.h,org=new Uint8Array(fw*fh);
    for(i=0;i<fw*fh;i++){var r=f.d[i*4],g=f.d[i*4+1],b=f.d[i*4+2];if(r-b>62&&r>150&&r-g>45)org[i]=1;}
    // the sun from the pixels: the orange blob nearest the default sun in the upper half
    var sx=geo.sun[0]*fw/AW,sy=geo.sun[1]*fw/AW,best=null;
    (function(){var seen=new Uint8Array(fw*fh),q=[];for(var j=0;j<fw*fh;j++){if(!org[j]||seen[j]||j/fw>fh*.5)continue;var n=0,mx=0,my=0,x0=1e9,x1=-1,y0=1e9,y1=-1;q.length=0;q.push(j);seen[j]=1;
      while(q.length){var k=q.pop(),kx=k%fw,ky=(k/fw)|0;n++;mx+=kx;my+=ky;x0=Math.min(x0,kx);x1=Math.max(x1,kx);y0=Math.min(y0,ky);y1=Math.max(y1,ky);
        [k-1,k+1,k-fw,k+fw].forEach(function(nn){if(nn>=0&&nn<fw*fh&&org[nn]&&!seen[nn]&&Math.abs((nn%fw)-kx)<=1){seen[nn]=1;q.push(nn);}});}
      if(n<20)continue;var cx=mx/n,cy=my/n,round=Math.min(x1-x0,y1-y0)/Math.max(1,Math.max(x1-x0,y1-y0)),dd=Math.hypot(cx-sx,cy-sy);
      if(round>.6&&dd<fw*.12&&(!best||dd<best.d))best={x:cx,y:cy,r:Math.max(x1-x0,y1-y0)/2+.5,d:dd};}})();
    if(best&&!geo.fromLayers)geo.sun=[best.x*AW/fw,best.y*AW/fw,Math.max(best.r*AW/fw,12*KA)];
    // lightness of the original: sun disc vs the sky around it (the black-and-white measurement)
    var meas=measure(function(px,py){var k=(clamp(Math.round(py*fw/AW),0,fh-1)*fw+clamp(Math.round(px*fw/AW),0,fw-1))*4;return[f.d[k],f.d[k+1],f.d[k+2]];});
    // gray original (L* matched)
    var gc=mk(PW,PH),gg=gc.getContext('2d');gg.imageSmoothingQuality='high';gg.drawImage(src,0,0,PW,PH);var id=gg.getImageData(0,0,PW,PH),d=id.data;
    for(i=0;i<d.length;i+=4){var v=grayOf(d[i],d[i+1],d[i+2]);d[i]=d[i+1]=d[i+2]=v;}gg.putImageData(id,0,0);
    M={m:m,F:{w:w,h:h,ang:ang,coh:coh,mag:mag,magRef:magRef},org:org,ow:fw,oh:fh,gray:gc,meas:meas};
    makeGround();dirty=true;}catch(e){console.warn('s-impression: analysis failed',e);M=null;anaFailed=true;}}
  var anaFailed=false;
  // mean L* of the sun disc and of a ring of sky around it, reading colours through px(x,y) in art px
  function measure(px){var s=geo.sun,a=0,na=0,b=0,nb2=0,st=Math.max(2,s[2]/10);
    for(var y=s[1]-s[2]*3;y<=s[1]+s[2]*3;y+=st)for(var x=s[0]-s[2]*3;x<=s[0]+s[2]*3;x+=st){var d=Math.hypot(x-s[0],y-s[1]);if(d>s[2]*3)continue;
      var c=px(x,y);if(!c)continue;var L=Lstar(c[0],c[1],c[2]);if(d<s[2]*.8){a+=L;na++;}else if(d>s[2]*1.5){b+=L;nb2++;}}
    return na&&nb2?[a/na,b/nb2]:null;}
  function makeGround(){GC=mk(PW,PH);GG=mk(PW,PH);var g=GC.getContext('2d'),r=rng(7);
    g.fillStyle='rgb('+GROUND.join(',')+')';g.fillRect(0,0,PW,PH);
    // a thin, primed-canvas texture: soft broad streaks + weave
    for(var i=0;i<260;i++){var y=r()*PH,x=r()*PW,l=PW*(.08+r()*.25),dv=(r()-.5)*14;g.strokeStyle='rgba('+(GROUND[0]+dv|0)+','+(GROUND[1]+dv|0)+','+(GROUND[2]+dv*.8|0)+',.35)';
      g.lineWidth=PW*(.006+r()*.02);g.beginPath();g.moveTo(x-l/2,y+(r()-.5)*6);g.lineTo(x+l/2,y+(r()-.5)*6);g.stroke();}
    var id=g.getImageData(0,0,PW,PH),d=id.data;for(var y=0;y<PH;y++)for(var x=0;x<PW;x++){var k=(y*PW+x)*4,n=((x&1)^(y&1))?3:-3;n+=(r()-.5)*6;d[k]+=n;d[k+1]+=n;d[k+2]+=n;}
    g.putImageData(id,0,0);
    var g2=GG.getContext('2d'),id2=g.getImageData(0,0,PW,PH),d2=id2.data;for(var j=0;j<d2.length;j+=4){var v=grayOf(d2[j],d2[j+1],d2[j+2]);d2[j]=d2[j+1]=d2[j+2]=v;}g2.putImageData(id2,0,0);
    PC=mk(PW,PH);PG=mk(PW,PH);pcg=PC.getContext('2d');pgg=PG.getContext('2d');clearPaint();}
  function clearPaint(){if(!PC)return;pcg.setTransform(1,0,0,1,0,0);pgg.setTransform(1,0,0,1,0,0);pcg.drawImage(GC,0,0);pgg.drawImage(GG,0,0);drawnK=0;}

  // ---------- sampling helpers (paint px)
  function sampleMip(k,x,y){var m=M.m[k],sx=clamp(Math.round(x*m.w/PW),0,m.w-1),sy=clamp(Math.round(y*m.w/PW),0,m.h-1),i=(sy*m.w+sx)*4;return[m.d[i],m.d[i+1],m.d[i+2]];}
  function field(x,y){var F=M.F,fx=clamp(Math.round(x*F.w/PW),0,F.w-1),fy=clamp(Math.round(y*F.w/PW),0,F.h-1),i=fy*F.w+fx;return{a:F.ang[i],c:F.coh[i],m:F.mag[i]/F.magRef};}
  function isHot(x,y){var sx=clamp(Math.round(x*M.ow/PW),0,M.ow-1),sy=clamp(Math.round(y*M.ow/PW),0,M.oh-1);return !!M.org[sy*M.ow+sx];}
  function oblend(a,b,t){var x=(1-t)*Math.cos(2*a)+t*Math.cos(2*b),y=(1-t)*Math.sin(2*a)+t*Math.sin(2*b);return .5*Math.atan2(y,x);}
  function sunP(){return[geo.sun[0]*KP,geo.sun[1]*KP,geo.sun[2]*KP];}

  // ---------- coarse-to-fine: a level per cell rises with every stroke laid there
  var CG=Math.max(8,Math.round(PW/26)),GX=Math.ceil(PW/CG),GY=Math.ceil(PH/CG);
  var lvl=new Float32Array(GX*GY),cov=new Uint8Array(GX*GY),covN=0;
  function lvAt(x,y){var cx=clamp((x/CG)|0,0,GX-1),cy=clamp((y/CG)|0,0,GY-1);return lvl[cy*GX+cx];}
  function splat(d){var r=Math.max(d.w,d.l*.5)*.62,x0=Math.max(0,((d.x-r)/CG)|0),x1=Math.min(GX-1,((d.x+r)/CG)|0),y0=Math.max(0,((d.y-r)/CG)|0),y1=Math.min(GY-1,((d.y+r)/CG)|0);
    var inc=clamp(d.w*d.l/(CG*CG*3.2),.05,.5);
    for(var cy=y0;cy<=y1;cy++)for(var cx=x0;cx<=x1;cx++){var i=cy*GX+cx,ddx=(cx+.5)*CG-d.x,ddy=(cy+.5)*CG-d.y;if(ddx*ddx+ddy*ddy>(r+CG*.5)*(r+CG*.5))continue;
      lvl[i]=Math.min(4,lvl[i]+inc);if(!cov[i]){cov[i]=1;covN++;}}}
  function scaleAt(x,y){return Math.max(.2,Math.pow(.6,lvAt(x,y)));}

  // ---------- strokes
  var LOG=[],drawnK=0,view=-1;                                        // view: -1 = live (all), else the replay position
  var BASE_L=PW*.052,BASE_W=PW*.021;
  function col(c,gray){if(gray){var v=grayOf(c[0],c[1],c[2]);return 'rgb('+v+','+v+','+v+')';}return 'rgb('+(c[0]|0)+','+(c[1]|0)+','+(c[2]|0)+')';}
  function drawDab(g,d,gray){var r=rng(d.s),l=d.l,w=d.w,k=d.k,c=d.c,bend=(r()-.5)*w*.9;
    g.save();g.translate(d.x,d.y);g.rotate(d.a);g.lineCap='round';
    // body: a slightly curved, loaded stroke; thinner and more transparent when the brush runs dry
    g.globalAlpha=.5+.45*k;g.strokeStyle=col(c,gray);g.lineWidth=w*(.75+.25*k);
    g.beginPath();g.moveTo(-l/2,0);g.quadraticCurveTo(0,bend,l/2,bend*.3);g.stroke();
    // bristle marks: lighter and darker hairs along the stroke; broken tails when dry
    var n=3+((r()*3)|0);for(var i=0;i<n;i++){var off=((i+.5)/n-.5)*w*.9+(r()-.5)*w*.12,dv=(r()-.45)*38,s0=-l/2+r()*l*.18,s1=l/2-r()*l*(.1+.4*(1-k));
      var cc=[clamp(c[0]+dv,0,255),clamp(c[1]+dv,0,255),clamp(c[2]+dv*.9,0,255)];g.strokeStyle=col(cc,gray);g.globalAlpha=(.14+.26*r())*(.6+.4*k);g.lineWidth=Math.max(.8,w*(.12+.1*r()));
      g.beginPath();g.moveTo(s0,off+bend*(s0/l+.5)*.6);g.quadraticCurveTo(0,off+bend,s1,off+bend*.3);g.stroke();}
    if(d.h){g.globalAlpha=.55;g.strokeStyle=col([clamp(c[0]+30,0,255),clamp(c[1]+22,0,255),c[2]],gray);g.lineWidth=Math.max(1,w*.28);g.beginPath();g.moveTo(-l*.3,-w*.12);g.lineTo(l*.25,-w*.12+bend*.4);g.stroke();}   // impasto highlight
    g.restore();}
  function paintDab(d){drawDab(pcg,d,false);drawDab(pgg,d,true);}

  // ---------- the brush
  var br={down:false,src:null,tx:0,ty:0,x:0,y:0,px:0,py:0,sp:0,dir:0,travel:0,load:1,c:null,dwell:0,hover:false,seed:1,stroke:0};
  var S={mode:'idle',wash:0,washAt:[0,0],bw:0,bwT:0,peek:0,peekT:0,glow:0,sunDone:false,sunN:0,done:false,paintT:0,strokes:0,ghost:null,play:false,noteKind:'',lastSnd:0};
  var dirty=true,dead=false,raf=0,last=0;
  function start(x,y){if(S.mode!=='idle'||!M)return;S.mode='live';S.wash=reduce?1:0;S.washAt=[x,y];wrap.classList.add('live');clearPaint();
    snd('wash',.5,function(){api.sfx.whoosh(.05,.7);});dirty=true;}
  function emit(x,y,n,dwell){var sc=scaleAt(x,y),sn=clamp(br.sp/(PW*.9),0,1),R=PW*.021*sc+PW*.003,sun=sunP();
    for(var i=0;i<n;i++){var r=rng(br.seed=(br.seed*1664525+1013904223)>>>0),dx,dy;
      if(dwell){var t=r()*Math.PI*2,q=Math.sqrt(r())*R*1.1;dx=Math.cos(t)*q;dy=Math.sin(t)*q;}
      else{var ac=(r()-.5)*2*R,al=(r()-.5)*R*.8;dx=Math.cos(br.dir)*al-Math.sin(br.dir)*ac;dy=Math.sin(br.dir)*al+Math.cos(br.dir)*ac;}
      var x1=clamp(x+dx,0,PW-1),y1=clamp(y+dy,0,PH-1),s1=scaleAt(x1,y1),hot=isHot(x1,y1),ds=Math.hypot(x1-sun[0],y1-sun[1]),inSun=ds<sun[2]*1.05;
      var mipK=hot||inSun?2:s1>.62?0:s1>.36?1:2,c=sampleMip(mipK,x1,y1);
      var jl=(r()-.5)*16;c=[clamp(c[0]+jl+(r()-.5)*9,0,255),clamp(c[1]+jl+(r()-.5)*9,0,255),clamp(c[2]+jl+(r()-.5)*9,0,255)];
      var mixK=hot||inSun?.85:.55;br.c=br.c?[lerp(br.c[0],c[0],mixK),lerp(br.c[1],c[1],mixK),lerp(br.c[2],c[2],mixK)]:c;
      var F=field(x1,y1),wat=sm((y1/PH-.5)/.12),hand=dwell?0:(1-.55*wat)*(.55+.4*sn),a0=oblend(br.dir,0,dwell?1:.25+.55*wat),a=oblend(oblend(0,a0,hand),F.a,clamp(F.c*1.4,0,1)*clamp((F.m-.45)*1.6,0,.85))+(r()-.5)*.3;
      var l=BASE_L*s1*(1+.8*sn)*(.75+.5*r()),w=BASE_W*s1*(1-.25*sn)*(.8+.4*r());
      if(inSun){a=Math.atan2(y1-sun[1],x1-sun[0])+Math.PI/2+(r()-.5)*.3;l=Math.min(l,sun[2]*1.3);w=Math.min(w,sun[2]*.5);}
      else if(hot){a=(r()-.5)*.18;l=Math.min(l,PW*.028)*(.8+.4*r());w=Math.min(w,PW*.008);}
      var d={x:x1,y:y1,a:a,l:Math.max(3,l),w:Math.max(1.6,w),c:[br.c[0]|0,br.c[1]|0,br.c[2]|0],k:br.load,s:(r()*4294967295)>>>0,h:hot||inSun?1:0};
      addDab(d);
      br.load=Math.max(.22,br.load-(.006+.01*sn));
      if(inSun&&d.c[0]-d.c[2]>60){S.sunN++;if(!S.sunDone&&S.sunN>=7){S.sunDone=true;S.glow=1;note('sun');snd('sun',.6,function(){api.sfx.bell(587,.045);setTimeout(function(){if(!dead)api.sfx.bell(880,.03);},160);});}}}}
  function addDab(d){if(view>=0&&view<LOG.length){LOG.length=view;recompute();}view=-1;
    if(drawnK>LOG.length)clearPaint();while(drawnK<LOG.length){paintDab(LOG[drawnK]);drawnK++;}   // painting after scrubbing back: continue from there
    if(LOG.length>=LOG_MAX){LOG.shift();drawnK--;}                   // the oldest stroke stays on the canvas but leaves the replay
    LOG.push(d);paintDab(d);drawnK++;splat(d);dirty=true;repDirty=true;}
  function recompute(){lvl.fill(0);cov.fill(0);covN=0;S.sunN=0;for(var i=0;i<LOG.length;i++){var d=LOG[i];splat(d);if(d.h&&Math.hypot(d.x-sunP()[0],d.y-sunP()[1])<sunP()[2]*1.05&&d.c[0]-d.c[2]>60)S.sunN++;}}
  function brushDown(x,y,srcKind){if(!M)return;if(S.ghost&&srcKind!=='ghost')ghostStop();if(S.play)playStop();
    if(S.mode==='idle')start(x,y);br.down=true;br.src=srcKind;br.tx=br.x=br.px=x;br.ty=br.y=br.py=y;br.travel=0;br.load=1;br.c=null;br.dwell=0;br.sp=0;S.strokes++;
    emit(x,y,2,true);}
  function brushUp(){br.down=false;br.src=null;}
  var sndT=0;
  function brushStep(dt,now){if(!br.down){br.load=Math.min(1,br.load+dt*.8);return;}
    var k=1-Math.exp(-dt*(br.src==='ghost'?40:26)),nx=lerp(br.x,br.tx,k),ny=lerp(br.y,br.ty,k),dx=nx-br.x,dy=ny-br.y,dist=Math.hypot(dx,dy);
    var sp=dt>0?dist/dt:0;br.sp=lerp(br.sp,sp,.35);if(dist>.3)br.dir=Math.atan2(dy,dx);
    br.px=br.x;br.py=br.y;br.x=nx;br.y=ny;S.paintT+=dt;
    var spacing=Math.max(2.5,BASE_L*scaleAt(nx,ny)*.42);br.travel+=dist;var guard=0;
    while(br.travel>=spacing&&guard++<12){br.travel-=spacing;var t=1-br.travel/Math.max(dist,1e-6);emit(lerp(br.px,nx,clamp(t,0,1)),lerp(br.py,ny,clamp(t,0,1)),2,false);}
    if(dist<.5){br.dwell+=dt;if(br.dwell>.07){br.dwell=0;emit(nx,ny,1,true);}}else br.dwell=0;
    // bristles on canvas: a dry scratch whose loudness follows the hand
    if(br.sp>PW*.05&&now-sndT>(reduce?260:120)){sndT=now;var v=clamp(br.sp/(PW*1.4),.15,1);snd('brush',.25+.5*v,function(){api.sfx.puff(.006+.02*v,.14);});}}

  // ---------- ghost painter (替我画): the same brush on a planned path
  function ghostPlan(){var P=[],r=rng(11),nr=0;function row(y0,x0,x1,step,amp,spd,pen){var dir=(nr++)%2?-1:1,xs=[];for(var x=x0;x<=x1+1e-9;x+=step)xs.push(x);if(dir<0)xs.reverse();
      var tilt=y0<.5?(r()-.3)*.05:0;xs.forEach(function(x,i){P.push({x:x*PW,y:(y0+Math.sin(x*9+y0*20)*amp+(r()-.5)*amp*1.4+tilt*(x-.5))*PH,v:spd,up:i===0&&pen});});}
    var i;for(i=0;i<11;i++)row(.03+i*.05,.01,.99,.05,.014,1.6,i===0);          // sky and harbour, broad
    for(i=0;i<9;i++)row(.57+i*.05,.01,.99,.05,.006,1.6,i===0);                  // water, broad
    for(i=0;i<12;i++)row(.14+i*.03,.01,.99,.03,.008,1.1,i===0);                 // the harbour again, finer
    for(i=0;i<9;i++)row(.58+i*.047,.01,.99,.035,.004,1.2,i===0);                // water again, finer
    geo.boats.forEach(function(b){var cx=b[0]*KP,cy=b[1]*KP,rr=b[2]*KP;for(var t=0;t<=Math.PI*4;t+=.5)P.push({x:cx+Math.cos(t)*rr*(.3+.12*t),y:cy+Math.sin(t)*rr*.35,v:.35,up:t===0});});
    var s=sunP();for(var t=0;t<=Math.PI*4;t+=.35)P.push({x:s[0]+Math.cos(t)*s[2]*(.15+.07*t),y:s[1]+Math.sin(t)*s[2]*(.15+.07*t),v:.18,up:t===0});   // the sun, last…
    var R=geo.reflect,cx2=(R[0]+R[2])/2*KP,hw=(R[2]-R[0])/2*KP;for(var y=R[1]*KP;y<=R[3]*KP;y+=PH*.018){var j=Math.round(y)%2?1:-1;P.push({x:cx2-hw*j*.9,y:y,v:.3,up:true});P.push({x:cx2+hw*j*.9,y:y+2,v:.3});}   // …and its reflection
    return P;}
  function ghostStart(){if(!M)return;if(S.play)playStop();if(S.mode==='idle')start(PW*.5,PH*.5);S.ghost={P:ghostPlan(),i:0,x:0,y:0,wait:.25};var p0=S.ghost.P[0];S.ghost.x=p0.x;S.ghost.y=p0.y;
    B.auto.setAttribute('aria-pressed','true');B.auto.textContent=T.stop;note('ghost');}
  function ghostStop(){if(!S.ghost)return;S.ghost=null;if(br.src==='ghost')brushUp();B.auto.setAttribute('aria-pressed','false');B.auto.textContent=T.auto;dirty=true;}
  function ghostStep(dt){var G=S.ghost;if(!G)return;if(G.wait>0){G.wait-=dt;return;}
    var budget=PW*(reduce?2.6:1.8)*dt;
    while(budget>0&&G.i<G.P.length){var q=G.P[G.i];if(q.up&&br.down&&br.src==='ghost'&&Math.hypot(q.x-G.x,q.y-G.y)>2){brushUp();}
      var dx=q.x-G.x,dy=q.y-G.y,d=Math.hypot(dx,dy),mv=budget*(q.v||1);
      if(!br.down){G.x=q.x;G.y=q.y;brushDown(G.x,G.y,'ghost');G.i++;budget-=d*.15/(q.v||1);continue;}
      if(d<=mv){G.x=q.x;G.y=q.y;G.i++;budget-=d/(q.v||1);}else{G.x+=dx/d*mv;G.y+=dy/d*mv;budget=0;}}
    if(br.down&&br.src==='ghost'){br.tx=G.x;br.ty=G.y;}
    if(G.i>=G.P.length){ghostStop();}}

  // ---------- replay (笔序回放)
  var repDirty=true;
  function setView(k){k=clamp(Math.round(k),0,LOG.length);view=k>=LOG.length?-1:k;if(k<drawnK){clearPaint();}dirty=true;repDirty=true;}
  function catchUp(){var target=view<0?LOG.length:view;if(drawnK>target){clearPaint();}var t0=performance.now(),n=0;
    while(drawnK<target&&(n++<60||performance.now()-t0<9)){paintDab(LOG[drawnK]);drawnK++;}if(drawnK<target)dirty=true;return drawnK<target;}
  function playStart(){if(!LOG.length)return;if(S.ghost)ghostStop();if(view<0||view>=LOG.length)setView(0);S.play=true;S.playDur=clamp(LOG.length/260,3,12);playBtn.setAttribute('aria-pressed','true');playBtn.textContent=T.pause;}
  function playStop(){S.play=false;playBtn.setAttribute('aria-pressed','false');playBtn.textContent=T.play;}
  function playStep(dt){if(!S.play)return;var k=(view<0?LOG.length:view)+LOG.length*dt/S.playDur;if(k>=LOG.length){setView(LOG.length);playStop();}else setView(k);}
  range.addEventListener('input',function(){if(S.ghost)ghostStop();if(S.play)playStop();setView(+range.value);});
  playBtn.addEventListener('click',function(){if(S.play)playStop();else playStart();});

  // ---------- buttons
  B.auto.addEventListener('click',function(){if(S.ghost)ghostStop();else ghostStart();});
  B.bw.addEventListener('click',function(){S.bwT=S.bwT?0:1;B.bw.setAttribute('aria-pressed',S.bwT?'true':'false');snd('tick',.4,function(){api.sfx.tick(.03);});if(S.bwT)note('bw');else if(S.noteKind==='bw')note('');dirty=true;});
  function peek(on){S.peekT=on?1:0;B.peek.setAttribute('aria-pressed',on?'true':'false');dirty=true;}
  B.peek.addEventListener('pointerdown',function(e){if(e.button!=null&&e.button!==0&&e.pointerType==='mouse')return;e.preventDefault();try{B.peek.setPointerCapture(e.pointerId);}catch(_){}peek(true);});
  ['pointerup','pointercancel','lostpointercapture'].forEach(function(n){B.peek.addEventListener(n,function(){peek(false);});});
  B.peek.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();if(!e.repeat)peek(true);}});
  B.peek.addEventListener('keyup',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();peek(false);}});
  B.peek.addEventListener('blur',function(){peek(false);});B.peek.addEventListener('contextmenu',function(e){e.preventDefault();});
  B.peek.addEventListener('click',function(e){e.preventDefault();});
  B.name.addEventListener('click',function(){var on=nameEl.hidden;nameEl.hidden=!on;B.name.setAttribute('aria-pressed',on?'true':'false');B.name.setAttribute('aria-expanded',on?'true':'false');});
  B.reset.addEventListener('click',function(){ghostStop();playStop();LOG.length=0;view=-1;recompute();S.sunDone=false;S.done=false;S.paintT=0;S.strokes=0;br.c=null;
    if(S.mode==='idle'&&M){start(PW*.5,PH*.5);}else{S.wash=reduce?1:0;S.washAt=[PW*.5,PH*.5];clearPaint();snd('wash',.5,function(){api.sfx.whoosh(.05,.7);});}
    if(S.noteKind!=='bw')note('');dirty=true;repDirty=true;});

  // ---------- notes
  function note(kind,keep){S.noteKind=kind;if(!keep)noteEl.innerHTML='';if(!kind)return;
    function P(t,cl){var p=document.createElement('p');if(cl)p.className=cl;p.textContent=nb(t);noteEl.appendChild(p);}
    if(kind==='sun')P(T.sun);
    else if(kind==='ghost')P(T.ghost);
    else if(kind==='done')P(T.done.replace('{n}',LOG.length).replace('{s}',Math.max(1,Math.round(S.paintT))));
    else if(kind==='bw'){P(T.bwNote);var m=M&&M.meas;if(m)P(T.meas.replace('{a}',m[0].toFixed(0)).replace('{b}',m[1].toFixed(0)),'im-meas');
      var mine=myMeasure();if(mine)P(T.measMine.replace('{a}',mine[0].toFixed(0)).replace('{b}',mine[1].toFixed(0)),'im-meas');}}
  function myMeasure(){if(!PC||!S.sunDone)return null;try{var s=sunP(),r=Math.ceil(s[2]*3),x0=Math.max(0,Math.floor(s[0]-r)),y0=Math.max(0,Math.floor(s[1]-r)),w=Math.min(PW-x0,2*r),h=Math.min(PH-y0,2*r),d=pcg.getImageData(x0,y0,w,h).data;
    return measure(function(ax,ay){var x=Math.round(ax*KP-x0),y=Math.round(ay*KP-y0);if(x<0||y<0||x>=w||y>=h)return null;var k=(y*w+x)*4;return[d[k],d[k+1],d[k+2]];});}catch(e){return null;}}

  // ---------- sound: the room's recorded sounds if the designer lists them, else synthesised
  function recName(re){var s=(window.EH_AUDIO&&EH_AUDIO.sfx)||{};return Object.keys(s).filter(function(k){return s[k].room==='impressionism'&&re.test(k);})[0]||null;}
  var REC={brush:recName(/brush|stroke|scrub|bristle/),wash:recName(/wash|sweep/),sun:recName(/sun|chime|bell|horn/),tick:null};
  function snd(kind,v,fb){var n=REC[kind];if(n&&api.sfx.play){var h=api.sfx.play(n,{v:v});if(h)return;}fb&&fb();}

  // ---------- views: overlay on the hung work (wide) and the canvas in the panel (narrow)
  var cw=document.getElementById('cw'),frameEl=document.getElementById('frame'),ov=null,og=null;
  if(cw){ov=document.createElement('canvas');ov.className='im-ov';ov.setAttribute('aria-hidden','true');cw.appendChild(ov);og=ov.getContext('2d');}
  var cwTouch=cw?cw.style.touchAction:'',cwCursor=cw?cw.style.cursor:'';
  function artRect(){return api.artRect();}
  function wallVisible(r){r=r||artRect();var cmp=document.getElementById('cmpA');return r.width>40&&r.height>40&&!(frameEl&&frameEl.classList.contains('hidden'))&&!(cmp&&cmp.classList.contains('on'));}
  // draw the exhibit into g scaled to w×h CSS px (g already carries the dpr); base: draw the original first (panel canvas)
  function compose(g,w,h,base){var z=w/PW;
    if(base&&ok(src))g.drawImage(src,0,0,w,h);
    if(S.mode!=='idle'&&PC){
      if(S.wash<1){var a=S.washAt,rr=Math.hypot(Math.max(a[0],PW-a[0]),Math.max(a[1],PH-a[1]))*sm(S.wash)*z;g.save();g.beginPath();g.arc(a[0]*z,a[1]*z,Math.max(1,rr),0,Math.PI*2);g.clip();}
      g.drawImage(PC,0,0,w,h);if(S.bw>.001){g.globalAlpha=S.bw;g.drawImage(PG,0,0,w,h);g.globalAlpha=1;}
      if(S.wash<1)g.restore();}
    else if(S.bw>.001&&M){g.globalAlpha=S.bw;g.drawImage(M.gray,0,0,w,h);g.globalAlpha=1;}
    if(S.peek>.001&&ok(src)&&S.mode!=='idle'){g.globalAlpha=S.peek;g.drawImage(src,0,0,w,h);if(S.bw>.001&&M){g.globalAlpha=S.peek*S.bw;g.drawImage(M.gray,0,0,w,h);}g.globalAlpha=1;}
    // the sun's first glow
    if(S.glow>.01&&S.bw<.5){var s=sunP(),gr=g.createRadialGradient(s[0]*z,s[1]*z,s[2]*z*.6,s[0]*z,s[1]*z,s[2]*z*5);gr.addColorStop(0,'rgba(255,150,80,'+(.4*S.glow).toFixed(3)+')');gr.addColorStop(1,'rgba(255,150,80,0)');
      g.save();g.globalCompositeOperation='lighter';g.fillStyle=gr;g.fillRect(0,0,w,h);g.restore();}
    // the brush: a ring the size of the next stroke, filled with the paint it carries
    var showB=(br.down||brHover.on)&&S.mode!=='idle'||(brHover.on&&S.mode==='idle');
    if(showB&&M){var bx=br.down?br.x:brHover.x,by=br.down?br.y:brHover.y,rad=Math.max(4,(BASE_L*.5)*scaleAt(bx,by)*z*.6+3);
      g.save();g.lineWidth=1.25;g.strokeStyle='rgba(20,22,24,.55)';g.beginPath();g.arc(bx*z,by*z,rad+1.2,0,Math.PI*2);g.stroke();g.strokeStyle='rgba(245,238,226,.9)';g.beginPath();g.arc(bx*z,by*z,rad,0,Math.PI*2);g.stroke();
      if(br.down&&br.c){g.fillStyle=col(br.c,S.bw>.5);g.globalAlpha=.9;g.beginPath();g.arc(bx*z,by*z,Math.max(2,rad*.35),0,Math.PI*2);g.fill();}g.restore();}}
  var brHover={on:false,x:0,y:0,where:null};
  function idleWall(){return S.mode==='idle'&&S.bw<.001&&!brHover.on;}
  function drawWall(){if(!ov)return;var r=artRect(),dpr=Math.min(devicePixelRatio||1,2),w=Math.round(r.width*dpr),h=Math.round(r.height*dpr);
    if(!wallVisible(r)||idleWall()){if(ov.width&&!drawWall.clear){og.setTransform(1,0,0,1,0,0);og.clearRect(0,0,ov.width,ov.height);drawWall.clear=true;}return;}
    if(ov.width!==w||ov.height!==h){ov.width=w;ov.height=h;}
    og.setTransform(1,0,0,1,0,0);og.clearRect(0,0,w,h);og.setTransform(dpr,0,0,dpr,0,0);og.imageSmoothingQuality='high';
    compose(og,r.width,r.height,false);drawWall.clear=false;}
  function drawStage(){if(!wrap.classList.contains('narrow'))return;var dpr=Math.min(devicePixelRatio||1,2),cwid=stage.clientWidth;if(!cwid)return;var chei=cwid*PH/PW;
    var w=Math.round(cwid*dpr),h=Math.round(chei*dpr);if(stage.width!==w||stage.height!==h){stage.width=w;stage.height=h;stage.style.aspectRatio=PW+'/'+PH;}
    sg.setTransform(1,0,0,1,0,0);sg.fillStyle='#6d777b';sg.fillRect(0,0,w,h);sg.setTransform(dpr,0,0,dpr,0,0);sg.imageSmoothingQuality='high';compose(sg,cwid,chei,true);}
  function drawSwatch(){var dpr=Math.min(devicePixelRatio||1,2),s=44;if(swC.width!==s*dpr){swC.width=swC.height=s*dpr;}var g=swG;g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,s,s);
    var ink3=getComputedStyle(host).getPropertyValue('--ink-3').trim()||'#b3a893',ink2=getComputedStyle(host).getPropertyValue('--ink-2').trim()||'#d3c8b6';
    g.lineWidth=1;g.strokeStyle=ink3;g.beginPath();g.arc(22,22,19,0,Math.PI*2);g.stroke();
    if(br.c){g.fillStyle=col(br.c,S.bw>.5);g.beginPath();g.arc(22,22,14,0,Math.PI*2);g.fill();}
    // paint load: an arc that empties during a long stroke
    g.lineWidth=2.5;g.lineCap='round';g.strokeStyle=ink2;g.beginPath();g.arc(22,22,19,-Math.PI/2,-Math.PI/2+Math.PI*2*(br.c?br.load:0));g.stroke();}

  // ---------- pointer input: the wall
  function toPaint(x,y,where){var rc=where==='stage'?stage.getBoundingClientRect():artRect();return[clamp((x-rc.left)/rc.width*PW,0,PW-1),clamp((y-rc.top)/rc.height*PH,0,PH-1)];}
  var wd=null,suppress=false;
  function wallDown(e){suppress=false;if(!ov||!M)return;if(e.button!=null&&e.button!==0&&e.pointerType==='mouse')return;var r=artRect();if(!wallVisible(r))return;
    e.stopPropagation();e.preventDefault();try{frameEl.setPointerCapture(e.pointerId);}catch(_){}wd={id:e.pointerId};suppress=true;var p=toPaint(e.clientX,e.clientY,'wall');brushDown(p[0],p[1],'wall');}
  function wallMove(e){var p;if(wd&&wd.id===e.pointerId){p=toPaint(e.clientX,e.clientY,'wall');br.tx=p[0];br.ty=p[1];e.stopPropagation();return;}
    if(e.pointerType!=='mouse'||!cw)return;var r=artRect();if(!wallVisible(r)){brHover.on=false;return;}p=toPaint(e.clientX,e.clientY,'wall');brHover.on=true;brHover.where='wall';brHover.x=p[0];brHover.y=p[1];cw.style.cursor='crosshair';dirty=true;}
  function wallUp(e){if(wd&&wd.id===e.pointerId){wd=null;brushUp();e.stopPropagation();}}
  function wallClick(e){if(suppress||S.mode!=='idle'){suppress=false;e.stopPropagation();e.preventDefault();}}
  function wallLeave(){if(brHover.where==='wall'){brHover.on=false;dirty=true;}if(cw)cw.style.cursor=cwCursor;}
  if(frameEl){frameEl.addEventListener('pointerdown',wallDown,true);frameEl.addEventListener('pointermove',wallMove,true);frameEl.addEventListener('pointerup',wallUp,true);
    frameEl.addEventListener('pointercancel',wallUp,true);frameEl.addEventListener('click',wallClick,true);frameEl.addEventListener('pointerleave',wallLeave);}
  if(cw)cw.style.touchAction='none';
  // the panel canvas: touch scrolls the page until painting has begun (a tap starts it), then the finger paints
  var sd=null;
  stage.addEventListener('pointerdown',function(e){if(!M)return;if(e.button!=null&&e.button!==0&&e.pointerType==='mouse')return;
    if(e.pointerType==='touch'&&S.mode==='idle'){stage._tap={x:e.clientX,y:e.clientY,id:e.pointerId};return;}
    e.preventDefault();try{stage.setPointerCapture(e.pointerId);}catch(_){}sd={id:e.pointerId};var p=toPaint(e.clientX,e.clientY,'stage');brushDown(p[0],p[1],'stage');});
  stage.addEventListener('pointermove',function(e){var p;if(sd&&sd.id===e.pointerId){p=toPaint(e.clientX,e.clientY,'stage');br.tx=p[0];br.ty=p[1];return;}
    if(e.pointerType==='mouse'){p=toPaint(e.clientX,e.clientY,'stage');brHover.on=true;brHover.where='stage';brHover.x=p[0];brHover.y=p[1];dirty=true;}});
  function stageUp(e){var t=stage._tap;if(t&&t.id===e.pointerId){stage._tap=null;if(e.type==='pointerup'&&Math.hypot(e.clientX-t.x,e.clientY-t.y)<10){var p=toPaint(e.clientX,e.clientY,'stage');brushDown(p[0],p[1],'stage');brushUp();}return;}
    if(sd&&sd.id===e.pointerId){sd=null;brushUp();}}
  stage.addEventListener('pointerup',stageUp);stage.addEventListener('pointercancel',stageUp);
  stage.addEventListener('pointerleave',function(){if(brHover.where==='stage'){brHover.on=false;dirty=true;}});
  stage.addEventListener('contextmenu',function(e){e.preventDefault();});

  // ---------- layers.json (optional): the sun and the boats from the cut
  var pollT=0,tries=0;
  function useLayers(j){if(!j)return false;var P=j.points||{},by={};(j.layers||[]).concat(j.regions||[]).forEach(function(l){by[String(l.id||'').toLowerCase()]=l;});
    function box(l){if(!l)return null;if(l.box)return l.box;if(typeof l.x==='number'&&typeof l.w==='number')return[l.x,l.y,l.x+l.w,l.y+l.h];return null;}
    var sb=box(by.sun),sc=P.sun;if(sb){geo.sun=[(sb[0]+sb[2])/2,(sb[1]+sb[3])/2,Math.max(sb[2]-sb[0],sb[3]-sb[1])/2];geo.fromLayers=true;}
    else if(Array.isArray(sc)&&sc.length>=2){geo.sun=[sc[0],sc[1],sc[2]||geo.sun[2]];geo.fromLayers=true;}
    var rb=box(by.reflection||by.reflect||by.sunreflection);if(rb)geo.reflect=rb;
    var bs=Object.keys(by).filter(function(k){return /boat/.test(k);}).map(function(k){var b2=box(by[k]);return b2?[(b2[0]+b2[2])/2,(b2[1]+b2[3])/2,Math.max(20,(b2[2]-b2[0])/2)]:null;}).filter(Boolean);if(bs.length)geo.boats=bs;
    if(M&&geo.fromLayers){var f=M.m[2];M.meas=measure(function(px,py){var k=(clamp(Math.round(py*f.w/AW),0,f.h-1)*f.w+clamp(Math.round(px*f.w/AW),0,f.w-1))*4;return[f.d[k],f.d[k+1],f.d[k+2]];});}
    return true;}
  function poll(){if(dead||++tries>18)return;xhrJSON(api.path('cut/layers.json'),function(j){if(dead)return;if(!useLayers(j))pollT=setTimeout(poll,tries<4?2000:15000);});}
  poll();

  // ---------- loop
  var lastHint='',lastStat='',lastRep='';
  function tick(now){if(dead)return;raf=requestAnimationFrame(tick);if(!host.isConnected){dispose();return;}
    var dt=last?Math.min((now-last)/1000,.05):0;last=now;
    if(!M&&!anaFailed&&ok(src))analyse();
    var r=artRect(),wv=wallVisible(r);wrap.classList.toggle('narrow',!wv);
    if(!wv&&wd){wd=null;brushUp();}
    ghostStep(dt);playStep(dt);brushStep(dt,now);
    var anim=false;
    if(S.mode!=='idle'&&S.wash<1){S.wash=Math.min(1,S.wash+dt/.6);anim=true;}
    var bwS=reduce?dt/.25:dt/.9;if(S.bw!==S.bwT){S.bw=S.bwT>S.bw?Math.min(S.bwT,S.bw+bwS):Math.max(S.bwT,S.bw-bwS);anim=true;}
    if(S.peek!==S.peekT){S.peek=S.peekT>S.peek?Math.min(1,S.peek+dt/.18):Math.max(0,S.peek-dt/.3);anim=true;}
    if(S.glow>0){S.glow=Math.max(0,S.glow-dt/(reduce?.6:1.8));anim=true;}
    if(M&&PC&&catchUp())anim=true;
    var key=r.left.toFixed(1)+r.top.toFixed(1)+r.width.toFixed(1)+stage.clientWidth+(wv?1:0);if(key!==tick.k){tick.k=key;dirty=true;}
    if(dirty||anim||br.down){drawWall();drawStage();dirty=false;}
    drawSwatch();
    // coverage → the "done" note once
    var pct=Math.round(100*covN/(GX*GY));
    if(!S.done&&view<0&&pct>=93&&LOG.length>200){S.done=true;S.doneLate=true;}
    if(S.doneLate&&!S.ghost&&!br.down&&S.noteKind!=='bw'){S.doneLate=false;note('done',S.noteKind==='sun');}   // after the sun's note, not instead of it
    var st=S.mode==='idle'||!LOG.length?T.statIdle:T.stat.replace('{c}',pct).replace('{n}',LOG.length).replace('{s}',Math.round(S.paintT));if(st!==lastStat){statEl.textContent=nb(st);lastStat=st;}
    var tch=touchUI(),hv=wv?(tch?T.hintWallTouch:T.hintWall):(tch?T.hintTouch:T.hint);if(hv!==lastHint){hintEl.textContent=nb(hv);lastHint=hv;}
    if(repDirty){repDirty=false;var n=LOG.length,k=view<0?n:view;range.max=String(n);range.value=String(k);range.disabled=!n;playBtn.disabled=!n;
      var rt=n?k+' / '+n:'0';if(rt!==lastRep){kEl.textContent=rt;range.setAttribute('aria-valuetext','第 '+k+' 笔，共 '+n+' 笔');lastRep=rt;}}
    if(cw&&wv&&!brHover.on&&!wd)cw.style.cursor=cwCursor;}
  raf=requestAnimationFrame(tick);
  if(!ok(src))src.addEventListener('load',function(){dirty=true;},{once:true});

  function dispose(){if(dead)return;dead=true;cancelAnimationFrame(raf);clearTimeout(pollT);
    if(ov&&ov.parentNode)ov.parentNode.removeChild(ov);
    if(cw){cw.style.touchAction=cwTouch;cw.style.cursor=cwCursor;}
    if(frameEl){frameEl.removeEventListener('pointerdown',wallDown,true);frameEl.removeEventListener('pointermove',wallMove,true);frameEl.removeEventListener('pointerup',wallUp,true);
      frameEl.removeEventListener('pointercancel',wallUp,true);frameEl.removeEventListener('click',wallClick,true);frameEl.removeEventListener('pointerleave',wallLeave);}}
  host._dispose=dispose;
  // test hooks
  if(EH.debug)EH.debug.impression={S:S,br:br,geo:geo,LOG:LOG,get M(){return M;},PW:PW,PH:PH,
    down:function(x,y){brushDown(x*PW,y*PH,'test');},move:function(x,y){br.tx=x*PW;br.ty=y*PH;},up:brushUp,
    ghost:ghostStart,stopGhost:ghostStop,
    // run the ghost to completion synchronously (tests)
    finish:function(){if(!S.ghost)ghostStart();var n=0;while(S.ghost&&n++<20000){ghostStep(1/60);brushStep(1/60,n*16);}brushUp();S.wash=1;dirty=true;},
    view:setView,bw:function(on){S.bwT=on?1:0;S.bw=S.bwT;B.bw.setAttribute('aria-pressed',on?'true':'false');if(on)note('bw');dirty=true;},meas:function(){return{orig:M&&M.meas,mine:myMeasure()};}};
});
})();

;
/* Special exhibit "oath" (新古典 · 曲线被拉直成剑).
   1. Soft (rococo) curves lie over the painting's straight structure: both column axes, the arches' springing line, the floor edge
      and the spear. Drag one outward (along its line): it tightens like a slack rope; past ~97 % it snaps straight onto its grid line
      ("啪"). Let go earlier and it springs back.
   2. The three brothers' arms start out of line. Drag each hand around its shoulder until it lies along the painted arm; close enough
      and it is corrected automatically (a drum beat). All three: three beats, rays from the hands to the swords.
      With arm cut-outs in cut/layers.json the painted arms themselves rotate (over the inpainted patch); without them gold axis lines do.
   3. 骨架: the three arches, the three groups (one per bay) and the convergence point at the father's grip.
   4. 直线 / 曲线 slider: left end lights the oath (straight accents, right half dimmed), right end the grief (curve accents, left dimmed).
   Wide screens: everything is drawn on an overlay inside the hung painting (#cw) and operated there. Narrow screens (the painting is
   hidden while reading): a full plate of the painting inside the panel. Keyboard / switch users: press-and-hold buttons.
   Geometry: main.webp px (2400 × 1871), measured by eye on gridded zooms (_wip/s-oath/geo_check.jpg); cut/layers.json may override. */
(function(){
'use strict';
if(!window.EH||!EH.special)return;

var IW=2400,IH=1871;
// straight structure the soft curves snap to: a = anchor, b = free end (the visitor pulls from a toward b)
var CURVES=[
  {k:'colL',  n:'左柱',  a:[830,470],  b:[830,1330]},
  {k:'colR',  n:'右柱',  a:[1505,470], b:[1505,1330]},
  {k:'impost',n:'拱脚线',a:[0,438],    b:[2400,438]},
  {k:'floor', n:'地面',  a:[2400,1725],b:[0,1725]},
  {k:'spear', n:'长矛',  a:[84,560],   b:[366,1736]}];
// arms: s = pivot (shoulder side), t = fingertips; off = starting misalignment (degrees, + = clockwise = tip down)
var ARMS=[
  {k:'top',  n:'后面的兄弟',s:[810,836],t:[1065,735],off:-15,off0:-15},
  {k:'mid',  n:'中间的兄弟',s:[800,855],t:[1060,812],off:11,off0:11},
  {k:'front',n:'前面的兄弟',s:[650,900],t:[1010,868],off:19,off0:19}];
var ARCHES=[[495,445,245],[1165,445,255],[1845,445,245]];            // cx, cy (springing line), r
var GROUPS=[[150,610,870,1765],[950,520,1480,1745],[1455,1020,2390,1765]];  // brothers, father, women
var CONV=[1115,722];                                                 // the father's grip on the swords
var SWORD=[[1175,560],[990,1110]];
var STRAIGHT=[[[84,560],[366,1736]],[[1175,560],[990,1110]],[[1105,740],[1265,930]],[[650,1370],[870,1710]],[[400,1350],[250,1700]],[[1130,1340],[1000,1680]],[[1260,1350],[1370,1690]]];
var GRIEF=[[[1478,1400],[1500,1200],[1560,1110],[1656,1058],[1740,1066],[1815,1112],[1870,1180]],
  [[2060,1060],[1990,1100],[1935,1170],[1900,1260],[1880,1350],[1860,1450],[1835,1560]],
  [[2080,1110],[2150,1100],[2240,1160],[2310,1260],[2350,1380],[2360,1480]]];
var SPLIT=[1440,1580];                                               // soft border between the oath (left) and the grief (right)
var C0=0.62,SNAP=0.972,LOCK=3.5,AUTO=12,DMAX=40;                    // slack chord, snap point, arm snap / auto-correct (deg), clamp
var PINK='#f3bcb1',STONE='#efe7d8',RED='#cf5a41',GOLD='#e4c67e',HALO='rgba(18,13,10,';
var R2=Math.PI/180;

function clamp(x,a,b){return x<a?a:x>b?b:x;}
function nb(t){return String(t==null?'':t).replace(/([㐀-鿿）》”]) (?=[0-9A-Za-z])/g,'$1 ').replace(/([0-9A-Za-z.%°]) (?=[㐀-鿿（《“])/g,'$1 ');}
function rot(p,o,a){var c=Math.cos(a),s=Math.sin(a),x=p[0]-o[0],y=p[1]-o[1];return[o[0]+c*x-s*y,o[1]+s*x+c*y];}
function segDist(p,a,b){var dx=b[0]-a[0],dy=b[1]-a[1],l=dx*dx+dy*dy,t=l?clamp(((p[0]-a[0])*dx+(p[1]-a[1])*dy)/l,0,1):0;return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy);}
function eio(t){return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;}
function xhrJSON(url,cb){try{var x=new XMLHttpRequest();x.open('GET',url+'?t='+Date.now(),true);x.overrideMimeType('application/json');
  x.onload=function(){if(x.status===200||(x.status===0&&x.responseText)){try{cb(JSON.parse(x.responseText));}catch(e){cb(null);}}else cb(null);};
  x.onerror=function(){cb(null);};x.send();}catch(e){cb(null);}}

// ---------------------------------------------------------------- styles (once)
function css(){if(document.getElementById('s-oath-css'))return;var s=document.createElement('style');s.id='s-oath-css';s.textContent=
  '.oa{margin-top:16px}'+
  '.special .oa-stage{display:none;width:100%;height:auto;margin:4px 0 10px;touch-action:pan-y;cursor:grab;-webkit-tap-highlight-color:transparent;background:#1a1613}'+
  '.special .oa.narrow .oa-stage{display:block}.oa-stage.drag{cursor:grabbing}'+
  '.oa-hint{margin:0 0 4px!important;font:400 13.5px/1.75 var(--song)!important;color:var(--ink-2)}'+
  '.oa-stat{display:flex;flex-wrap:wrap;gap:2px 22px;margin:2px 0 6px;font:400 13.5px/1.7 var(--song);color:var(--ink-2);font-variant-numeric:tabular-nums}'+
  '.oa-stat b{font-weight:500;color:var(--ink)}'+
  '.oa .acts{margin:8px 0 2px;align-items:baseline}.oa .act{min-width:44px;-webkit-user-select:none;user-select:none;touch-action:manipulation}'+
  '.oa .act.hold[data-on="1"]{font-weight:500;text-decoration-thickness:2px}'+
  '.oa .act:disabled{color:var(--ink-3);cursor:default;text-decoration-style:dotted}'+
  '.oa-sl{display:flex;align-items:center;gap:14px;max-width:26em;margin:10px 0 2px;font:400 15px/1.6 var(--song)}'+
  '.oa-sl span{flex:none;min-width:2.4em;transition:font-weight .2s}.oa-sl span.on{font-weight:500}'+
  '.oa-sl span.on::before{content:"";display:inline-block;width:6px;height:6px;margin-right:7px;border-radius:50%;background:currentColor;vertical-align:.2em}'+
  '.oa-sl input{flex:1;min-width:0;height:44px;margin:0;background:transparent;accent-color:currentColor;color:inherit;cursor:pointer;-webkit-appearance:none;appearance:none}'+
  '.oa-sl input::-webkit-slider-runnable-track{height:1px;background:currentColor}'+
  '.oa-sl input::-moz-range-track{height:1px;background:currentColor}'+
  '.oa-sl input::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;margin-top:-8.5px;border-radius:50%;background:var(--wall,#2b2825);border:2px solid currentColor}'+
  '.oa-sl input::-moz-range-thumb{width:16px;height:16px;border-radius:50%;background:transparent;border:1.5px solid currentColor}'+
  '.oa-sl input:focus-visible{outline:1px solid currentColor;outline-offset:2px}'+
  '.oa-note{margin-top:6px;min-height:1.7em}.oa-note p{margin:0 0 8px!important}'+
  '.oa-legend{display:flex;flex-wrap:wrap;gap:2px 18px;margin:0 0 8px;font:400 13px/1.7 var(--song);color:var(--ink-2)}'+
  '.oa-legend i{display:inline-block;width:14px;height:0;margin-right:7px;vertical-align:.3em;border-top:2px solid}'+
  '.oa-legend i.d{border-top-style:dashed}.oa-legend i.o{width:8px;height:8px;border:2px solid;border-radius:50%;vertical-align:.05em}'+
  '.oa-ov{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:3}'+
  '.cw.oa-grab{cursor:grab}.cw.oa-grabbing{cursor:grabbing}';
  document.head.appendChild(s);}

EH.special('oath',function(host,room,api){
  css();
  var sp=room.special||{},art=room.art||{};
  var SC=(art.w||IW)/IW;                                             // geometry is in 2400-px space; scale if the hung image differs
  var H_=(art.h||IH)/SC;
  function tg(re){var t=null;(sp.toggles||[]).forEach(function(x){if(x&&(re.test(x.key||'')||re.test(x.label||'')))t=x;});return t;}
  var LB=sp.labels||{},tSk=LB.skeleton||tg(/skel|bone|骨/i),slD=LB.slider||sp.slider||sp.balance||{};
  var dH=LB.dragHint||'拉直一根曲线',aH=LB.armsHint||'把三条手臂摆齐';
  // content guides (room.json special.guides, main.webp px) refine the geometry measured here
  var G=sp.guides||{};
  (function(){function P(v){return Array.isArray(v)&&v.length>=2&&isFinite(v[0])&&isFinite(v[1])?[v[0]/SC,v[1]/SC]:null;}
    if(Array.isArray(G.arches)&&G.arches.length===3){var A=G.arches.map(function(a){var b=a&&(a.inner||a.box);return Array.isArray(b)&&b.length===4?[(b[0]+b[2])/2/SC,b[3]/SC,(b[2]-b[0])/2/SC]:null;});if(A.every(Boolean))ARCHES=A;}
    if(Array.isArray(G.columnAxesX)&&G.columnAxesX.length===2){CURVES[0].a[0]=CURVES[0].b[0]=G.columnAxesX[0]/SC;CURVES[1].a[0]=CURVES[1].b[0]=G.columnAxesX[1]/SC;}
    if(Array.isArray(G.spear)&&P(G.spear[0])&&P(G.spear[1])){CURVES[4].a=P(G.spear[0]);CURVES[4].b=P(G.spear[1]);STRAIGHT[0]=[CURVES[4].a,CURVES[4].b];}
    var vp=P(G.vanishingPoint);if(vp)CONV=vp;})();
  var T={
    hintWall:sp.hint||dH+'：在左边的原画上，顺着粉色软曲线的方向往外拉。'+aH+'：抓住兄弟的手，绕着肩膀转。',
    hintWallTouch:sp.hintTouch||dH+'：用手指在原画上顺着粉色曲线往外拉。'+aH+'：拖动兄弟的手，绕着肩膀转。',
    hintPlate:sp.hintPlate||dH+'：在下面的画上，顺着粉色软曲线的方向往外拉。'+aH+'：抓住兄弟的手，绕着肩膀转。',
    hintPlateTouch:sp.hintPlateTouch||dH+'：用手指在下面的画上顺着粉色曲线往外拉。'+aH+'：拖动兄弟的手，绕着肩膀转。',
    skel:(tSk&&tSk.label)||'骨架',
    skelText:(tSk&&tSk.text)||'三道拱各罩着一组人：左边三兄弟，中间父亲，右边女眷。两侧墙上的透视线汇向父亲握剑的拳头下方。',
    holdCurve:sp.holdCurve||'按住拉直曲线',
    holdArm:sp.holdArm||'按住摆齐手臂',
    reset:sp.reset||'重来',
    left:slD.left||slD.a||'直线',right:slD.right||slD.b||'曲线',
    leftText:slD.textLine||slD.leftText||slD.textA||'誓言一边全是直线：伸直的手臂、剑、长矛、绷紧的双腿，三兄弟像一个楔子向前顶。',
    rightText:slD.textCurve||slD.rightText||slD.textB||'哀伤一边全是曲线：女眷们低头、倚靠、蜷在一起，身体弯成柔软的弧。',
    curvesDone:sp.curvesDone||'曲线都拉直了：两根柱子、拱脚线、地面和长矛，把画面划成规整的格子。',
    armsDone:LB.armsDone||sp.armsDone||'三只手，一个誓言',
    curvesLab:'曲线',armsLab:'手臂',straightened:'已拉直',aligned:'已对齐'
  };
  // ---------- DOM
  var root=document.createElement('div');root.className='oa';
  root.innerHTML='<canvas class="oa-stage" role="img" aria-label="《贺拉斯兄弟之誓》全图，可拖动画上的曲线和手臂"></canvas>'+
    '<p class="oa-hint"></p>'+
    '<div class="oa-stat" aria-live="polite"><span class="oa-sc"></span><span class="oa-sa"></span></div>'+
    '<div class="acts">'+
      '<button type="button" class="act hold" data-oa="curve"></button>'+
      '<button type="button" class="act hold" data-oa="arm"></button>'+
      '<button type="button" class="act" data-oa="skel" aria-pressed="false"></button>'+
      '<button type="button" class="act" data-oa="reset"></button></div>'+
    '<label class="oa-sl"><span class="oa-l"></span><input type="range" min="0" max="100" step="1" value="50"><span class="oa-r"></span></label>'+
    '<div class="oa-note" aria-live="polite"></div>';
  host.appendChild(root);
  var stage=root.querySelector('.oa-stage'),hintEl=root.querySelector('.oa-hint'),scEl=root.querySelector('.oa-sc'),saEl=root.querySelector('.oa-sa'),noteEl=root.querySelector('.oa-note');
  var bCurve=root.querySelector('[data-oa="curve"]'),bArm=root.querySelector('[data-oa="arm"]'),bSkel=root.querySelector('[data-oa="skel"]'),bReset=root.querySelector('[data-oa="reset"]');
  var slider=root.querySelector('input'),lL=root.querySelector('.oa-l'),lR=root.querySelector('.oa-r');
  bCurve.textContent=T.holdCurve;bArm.textContent=T.holdArm;bSkel.textContent=T.skel;bReset.textContent=T.reset;lL.textContent=T.left;lR.textContent=T.right;
  slider.setAttribute('aria-label',T.left+' / '+T.right);slider.setAttribute('aria-valuetext','两边都亮');
  var mqT=window.matchMedia?matchMedia('(hover: none)'):null;function touchUI(){return !!(mqT&&mqT.matches);}
  var reduce=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);

  // ---------- state
  var S={curves:CURVES.map(function(c){var L=Math.hypot(c.b[0]-c.a[0],c.b[1]-c.a[1]);return{d:c,L:L,dir:[(c.b[0]-c.a[0])/L,(c.b[1]-c.a[1])/L],c:C0,v:0,snap:false,flash:0,hw:Math.max(2,Math.round(L/270))};}),
    arms:ARMS.map(function(a){var dx=a.t[0]-a.s[0],dy=a.t[1]-a.s[1];return{d:a,len:Math.hypot(dx,dy),del:a.off,lock:false,auto:false,flash:0};}),
    skel:false,skelA:0,bal:.5,fresh:true,balA:.5,drag:null,hold:null,armsDone:0,raysA:0,vis:0,active:true,narrow:false,layers:null,dirty:true,doneC:false,doneA:false};
  var main=api.img(art.img||'main.webp');
  function ok(i){return i&&i.complete&&i.naturalWidth>0;}

  // ---------- optional cut layers (arm cut-outs + patch; may also carry geometry)
  function num(v){return typeof v==='number'&&isFinite(v);}
  function pt(v){if(Array.isArray(v)&&v.length>=2&&num(v[0])&&num(v[1]))return[v[0],v[1]];if(v&&num(v.x)&&num(v.y))return[v.x,v.y];return null;}
  function useLayers(j){if(!j||typeof j!=='object')return false;
    var jw=j.W||j.w||j.width||IW*SC,f=IW/jw,items=[],L={arms:{},patch:null};
    function box(o){var b=o.box||o.rect||o.bbox;if(Array.isArray(b)&&b.length===4)return b[2]>b[0]&&b[3]>b[1]&&(o.w==null)?[b[0],b[1],b[2]-b[0],b[3]-b[1]]:b;
      if(num(o.x)&&num(o.y)&&num(o.w)&&num(o.h))return[o.x,o.y,o.w,o.h];return null;}
    function walk(v,key,d){if(!v||d>5)return;if(Array.isArray(v)){v.forEach(function(x){walk(x,key,d+1);});return;}if(typeof v!=='object')return;
      var file=v.file||v.img||v.src;if(typeof file==='string'&&/\.(webp|png)$/i.test(file)){items.push({o:v,file:file,key:key});}
      Object.keys(v).forEach(function(k){if(typeof v[k]==='object')walk(v[k],k,d+1);});}
    walk(j,'',0);
    ['plate','ground','patch','clean','under'].forEach(function(k){if(typeof j[k]==='string')items.push({o:{x:0,y:0,w:jw,h:(j.H||j.h||IH*SC)},file:j[k],key:k,full:true});});
    items.forEach(function(it){var o=it.o,nm=[o.id,o.name,o.label,o.k,it.key,it.file].join(' ').toLowerCase(),b=box(o);if(!b)return;
      var rec={img:api.img('cut/'+it.file),b:[b[0]*f,b[1]*f,b[2]*f,b[3]*f],full:!!it.full,f:f};
      if(/patch|ground|clean|under|fill|plate|inpaint|bg/.test(nm)&&!/arm.*(top|mid|low|front)/.test(nm)){if(!L.patch||/arm/.test(nm))L.patch=rec;return;}
      if(!/arm|臂|hand|top|mid|low|front|back/.test(nm))return;
      var k=/top|back|far|上|后/.test(nm)?'top':/mid|中/.test(nm)?'mid':/low|front|near|下|前/.test(nm)?'front':null;if(!k)return;
      var pv=pt(o.pivot||o.root||o.shoulder||o.origin||o.anchor),tp=pt(o.tip);if(pv)rec.pivot=[pv[0]*f,pv[1]*f];if(tp)rec.tip=[tp[0]*f,tp[1]*f];
      L.arms[k]=rec;});
    // a small opaque patch over the arms' hole beats the full plate (no w / h given: take them from the image)
    var pp=j.platePatch||j.patch;if(pp&&typeof pp==='object'&&typeof pp.file==='string'&&num(pp.x)&&num(pp.y)){
      L.patch={img:api.img('cut/'+pp.file),at:[pp.x*f,pp.y*f],f:f};}
    // geometry overrides when present
    var c=pt(j.conv||j.convergence||j.focus||(j.geometry&&(j.geometry.conv||j.geometry.convergence)));if(c)CONV=[c[0]*f,c[1]*f];
    if(Object.keys(L.arms).length<3)return false;
    // measured root / tip from the cutter; the painted arms themselves turn now, so start less far out of line (a cut-out arm turned
    // 19 degrees looks like a paper puppet)
    S.arms.forEach(function(a){var r=L.arms[a.d.k];if(r&&r.pivot)a.d.s=r.pivot;if(r&&r.tip)a.d.t=r.tip;a.len=Math.hypot(a.d.t[0]-a.d.s[0],a.d.t[1]-a.d.s[1]);
      a.d.off=a.d.off0*.6;if(!a.lock&&!a.auto&&S.fresh)a.del=a.d.off;});
    // only the part of the plate around the arms is needed: the smallest box that holds every arm at any angle it can reach
    if(L.patch&&L.patch.full&&!L.patch.at){var x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;Object.keys(L.arms).forEach(function(k){var b=L.arms[k].b;x0=Math.min(x0,b[0]);y0=Math.min(y0,b[1]);x1=Math.max(x1,b[0]+b[2]);y1=Math.max(y1,b[1]+b[3]);});
      L.patch.src=[x0-12,y0-12,x1-x0+24,y1-y0+24];}
    S.layers=L;var all=[L.patch&&L.patch.img].concat(Object.keys(L.arms).map(function(k){return L.arms[k].img;})).filter(Boolean);
    all.forEach(function(i){if(!ok(i))i.addEventListener('load',function(){S.dirty=true;},{once:true});});S.dirty=true;return true;}
  var pollT=0,tries=0,dead=false;
  function poll(){if(dead||S.layers||++tries>30)return;xhrJSON(api.path('cut/layers.json'),function(j){if(dead)return;if(!useLayers(j))pollT=setTimeout(poll,6000);});}
  poll();

  // ---------- geometry helpers
  function armTip(a){return rot(a.d.t,a.d.s,a.del*R2);}
  function curvePts(cv,n){var d=cv.d,c=cv.c,L=cv.L,dir=cv.dir,nr=[-dir[1],dir[0]],cl=c*L,hw=cv.hw,out=[];
    var q=c<1?2*Math.sqrt(Math.max(0,1/c-1)):0,amp=Math.min(cl*q/(Math.PI*hw),120)*.62;   // slack → amplitude, roughly length-preserving
    for(var i=0;i<=n;i++){var x=i/n,env=Math.pow(Math.sin(Math.PI*x),.55),w=amp*env*Math.sin(Math.PI*hw*x)*(1+.18*Math.sin(Math.PI*x*1.7+1));
      out.push([d.a[0]+dir[0]*cl*x+nr[0]*w,d.a[1]+dir[1]*cl*x+nr[1]*w]);}
    return out;}
  function polyDist(p,pts){var m=1e9;for(var i=1;i<pts.length;i++)m=Math.min(m,segDist(p,pts[i-1],pts[i]));return m;}
  function nCurves(){return S.curves.filter(function(c){return c.snap;}).length;}
  function nArms(){return S.arms.filter(function(a){return a.lock;}).length;}

  // ---------- drawing (g in 2400-px image space; u = image px per CSS px)
  function stroke(g,pts,u,w,col,halo){g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(var i=1;i<pts.length;i++)g.lineTo(pts[i][0],pts[i][1]);
    if(halo){g.strokeStyle=HALO+halo+')';g.lineWidth=(w+2.2)*u;g.stroke();}g.strokeStyle=col;g.lineWidth=w*u;g.stroke();}
  function smooth(g,pts){g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(var i=1;i<pts.length-1;i++){var mx=(pts[i][0]+pts[i+1][0])/2,my=(pts[i][1]+pts[i+1][1])/2;g.quadraticCurveTo(pts[i][0],pts[i][1],mx,my);}
    var e=pts[pts.length-1];g.lineTo(e[0],e[1]);}
  function dot(g,p,r,fill,ring,u){g.beginPath();g.arc(p[0],p[1],r*u,0,Math.PI*2);if(fill){g.fillStyle=fill;g.fill();}if(ring){g.strokeStyle=ring;g.lineWidth=1.5*u;g.stroke();}}
  function scene(g,u,vis){
    if(vis<=0)return;g.save();g.globalAlpha=vis;g.lineCap='round';g.lineJoin='round';
    var sw=clamp((.5-S.balA)/.5,0,1),gw=clamp((S.balA-.5)/.5,0,1);
    // 2. arm cut-outs (layers) when any arm is out of place
    var L=S.layers,moved=S.arms.some(function(a){return Math.abs(a.del)>.02;});
    if(L&&moved&&ok(main)){var P=L.patch;if(P&&ok(P.img)){if(P.at)g.drawImage(P.img,P.at[0],P.at[1],P.img.naturalWidth*P.f,P.img.naturalHeight*P.f);else if(P.src){var q=P.src,fx=P.img.naturalWidth/P.b[2];g.drawImage(P.img,q[0]*fx,q[1]*fx,q[2]*fx,q[3]*fx,q[0],q[1],q[2],q[3]);}
        else g.drawImage(P.img,P.b[0],P.b[1],P.b[2],P.b[3]);}
      S.arms.forEach(function(a){var r=L.arms[a.d.k];if(!r||!ok(r.img))return;g.save();var s=a.d.s;g.translate(s[0],s[1]);g.rotate(a.del*R2);g.translate(-s[0],-s[1]);g.drawImage(r.img,r.b[0],r.b[1],r.b[2],r.b[3]);g.restore();});}
    // 3. skeleton
    var k=S.skelA;if(k>0){g.save();g.globalAlpha=vis*k;
      ARCHES.forEach(function(A){g.beginPath();g.arc(A[0],A[1],A[2],Math.PI,Math.PI*2);g.strokeStyle=HALO+'.4)';g.lineWidth=4.4*u;g.stroke();g.strokeStyle=STONE;g.lineWidth=2.2*u;g.stroke();
        g.setLineDash([6*u,6*u]);[[A[0]-A[2],A[1]],[A[0]+A[2],A[1]]].forEach(function(p){g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(p[0],p[1]+70);g.stroke();});g.setLineDash([]);});
      g.setLineDash([9*u,7*u]);GROUPS.forEach(function(b){var r=26;g.beginPath();if(g.roundRect)g.roundRect(b[0],b[1],b[2]-b[0],b[3]-b[1],r);else g.rect(b[0],b[1],b[2]-b[0],b[3]-b[1]);
        g.fillStyle='rgba(239,231,216,.07)';g.fill();g.strokeStyle=HALO+'.35)';g.lineWidth=3.6*u;g.stroke();g.strokeStyle=STONE;g.lineWidth=1.6*u;g.stroke();});g.setLineDash([]);
      g.save();g.setLineDash([2*u,8*u]);[[0,120],[0,300],[0,1250],[0,1500],[IW,120],[IW,300],[IW,1250],[IW,1500]].forEach(function(p){
        var e=[p[0]+(CONV[0]-p[0])*.86,p[1]+(CONV[1]-p[1])*.86];stroke(g,[p,e],u,1.1,'rgba(239,231,216,.75)',null);});g.restore();
      rays(g,u,1);g.restore();}
    // 5. soft curves / snapped lines
    var dragC=S.drag&&S.drag.type==='curve'?S.drag.i:(S.hold&&S.hold.type==='curve'?S.hold.i:-1);
    S.curves.forEach(function(cv,i){var d=cv.d;
      if(i===dragC){g.save();g.setLineDash([2*u,7*u]);stroke(g,[d.a,d.b],u,1.4,'rgba(239,231,216,.75)',null);g.restore();}
      if(cv.snap){var fl=cv.flash;stroke(g,[d.a,d.b],u,1.6+fl*1.6,STONE,'.35');if(fl>0){g.save();g.globalAlpha=vis*fl;stroke(g,[d.a,d.b],u,4,RED,null);g.restore();}return;}
      var pts=curvePts(cv,Math.max(48,cv.hw*14));smooth(g,pts);g.strokeStyle=HALO+'.38)';g.lineWidth=(i===dragC?5.2:4.4)*u;g.stroke();g.strokeStyle=PINK;g.lineWidth=(i===dragC?2.8:2.2)*u;g.stroke();
      var e=pts[pts.length-1];dot(g,e,4.5,PINK,HALO+'.5)',u);
      // a small chevron: pull this way
      var dir=cv.dir,nr=[-dir[1],dir[0]],p=[e[0]+dir[0]*14*u,e[1]+dir[1]*14*u];
      g.beginPath();g.moveTo(p[0]-dir[0]*5*u+nr[0]*5*u,p[1]-dir[1]*5*u+nr[1]*5*u);g.lineTo(p[0],p[1]);g.lineTo(p[0]-dir[0]*5*u-nr[0]*5*u,p[1]-dir[1]*5*u-nr[1]*5*u);g.strokeStyle=PINK;g.lineWidth=1.6*u;g.stroke();});
    // 6. arm guides
    var dragA=S.drag&&S.drag.type==='arm'?S.drag.i:(S.hold&&S.hold.type==='arm'?S.hold.i:-1);
    S.arms.forEach(function(a,i){var tip=armTip(a),d=a.d;
      if(!a.lock&&(i===dragA||a.auto)){g.save();g.setLineDash([2*u,7*u]);stroke(g,[d.s,d.t],u,1.4,'rgba(239,231,216,.8)',null);g.restore();}
      if(a.lock){var al=.35+.65*a.flash;g.save();g.globalAlpha=vis*al;stroke(g,[d.s,tip],u,1.4+a.flash*1.2,GOLD,'.3');g.restore();return;}
      // with cut-outs the painted arm itself turns: keep the guide to a hairline so it does not hide the arm
      if(S.layers){g.save();g.globalAlpha*=i===dragA?.9:.6;stroke(g,[d.s,tip],u,1,GOLD,'.25');g.restore();}else stroke(g,[d.s,tip],u,i===dragA?2.6:2,GOLD,'.4');
      dot(g,d.s,2.5,GOLD,null,u);dot(g,tip,8,'rgba(228,198,126,.18)',GOLD,u);});
    // 7. all three aligned: rays to the grip
    if(S.raysA>0&&k<1)rays(g,u,S.raysA*(1-k));
    // 1. balance: dim the other half
    if(sw>0||gw>0){var gr=g.createLinearGradient(SPLIT[0],0,SPLIT[1],0),d=.6*(sw||gw),dc='rgba(10,8,7,';
      if(sw>0){gr.addColorStop(0,dc+'0)');gr.addColorStop(1,dc+d.toFixed(3)+')');g.fillStyle=gr;g.fillRect(SPLIT[0],0,SPLIT[1]-SPLIT[0],H_);g.fillStyle=dc+d.toFixed(3)+')';g.fillRect(SPLIT[1],0,IW-SPLIT[1],H_);}
      else{gr.addColorStop(0,dc+d.toFixed(3)+')');gr.addColorStop(1,dc+'0)');g.fillStyle=gr;g.fillRect(SPLIT[0],0,SPLIT[1]-SPLIT[0],H_);g.fillStyle=dc+d.toFixed(3)+')';g.fillRect(0,0,SPLIT[0],H_);}}
    // 4. balance accents
    if(sw>0){g.save();g.globalAlpha=vis*sw;STRAIGHT.forEach(function(l){stroke(g,l,u,2,RED,'.35');});S.arms.forEach(function(a){stroke(g,[a.d.s,armTip(a)],u,2,RED,'.35');});g.restore();}
    if(gw>0){g.save();g.globalAlpha=vis*gw;GRIEF.forEach(function(l){smooth(g,l);g.strokeStyle=HALO+'.35)';g.lineWidth=4.4*u;g.stroke();g.strokeStyle=PINK;g.lineWidth=2.2*u;g.stroke();});g.restore();}
    g.restore();}
  function rays(g,u,a){g.save();g.globalAlpha*=a;g.setLineDash([3*u,6*u]);
    S.arms.forEach(function(x){stroke(g,[armTip(x),CONV],u,1.5,RED,'.3');});stroke(g,[SWORD[1],CONV],u,1.5,RED,'.3');g.setLineDash([]);
    dot(g,CONV,11,'rgba(207,90,65,.2)',RED,u);dot(g,CONV,3,RED,null,u);g.restore();}

  // ---------- where: wall overlay or plate in the panel
  var cw=document.getElementById('cw'),frameEl=document.getElementById('frame'),ov=null,og=null,readEl=document.getElementById('read'),roomEl=document.getElementById('room');
  if(cw){ov=document.createElement('canvas');ov.className='oa-ov';ov.setAttribute('aria-hidden','true');cw.appendChild(ov);og=ov.getContext('2d');}
  function coreToolOn(){return !!document.querySelector('#read .act[data-tool][aria-pressed="true"]')||!!(document.getElementById('cmpA')&&document.getElementById('cmpA').classList.contains('on'));}
  function viewOpen(){var v=document.getElementById('view');return !!(v&&v.classList.contains('on'));}
  function wallRect(){if(!frameEl||frameEl.classList.contains('hidden'))return null;var r=api.artRect();if(!r||r.width<60||r.height<40)return null;return r;}
  function wallLive(){return !S.narrow&&S.active&&!!wallRect()&&!coreToolOn()&&!viewOpen();}
  function stageRect(){var r=stage.getBoundingClientRect();return r;}
  function toImg(x,y,where){var r=where==='wall'?api.artRect():stageRect(),k=r.width/(IW*SC)*SC;return[(x-r.left)/k,(y-r.top)/k,k];}   // k: CSS px per 2400-space px

  // ---------- picking and dragging
  function pick(q,k,touch){var tol=(touch?30:22)/k,best=null,bd=1e9;
    S.arms.forEach(function(a,i){if(a.lock||a.auto)return;var tip=armTip(a),s=a.d.s,m=[s[0]+(tip[0]-s[0])*.45,s[1]+(tip[1]-s[1])*.45];
      var dd=Math.min(segDist(q,m,tip),Math.hypot(q[0]-tip[0],q[1]-tip[1])-6/k)*.8;if(dd<tol&&dd<bd){bd=dd;best={type:'arm',i:i};}});
    S.curves.forEach(function(cv,i){if(cv.snap)return;var dd=polyDist(q,curvePts(cv,40));if(dd<tol&&dd<bd){bd=dd;best={type:'curve',i:i};}});
    return best;}
  function begin(e,where){var q=toImg(e.clientX,e.clientY,where),hit=pick(q,q[2],e.pointerType==='touch');if(!hit)return false;
    S.hold=null;var D={type:hit.type,i:hit.i,id:e.pointerId,where:where,q0:q,moved:false};
    if(hit.type==='curve'){var cv=S.curves[hit.i];D.c0=cv.c;cv.v=0;api.sfx.tick(.03);}
    else{var a=S.arms[hit.i];D.del0=a.del;D.ang0=Math.atan2(q[1]-a.d.s[1],q[0]-a.d.s[0]);api.sfx.tick(.03);}
    S.drag=D;S.fresh=false;S.dirty=true;return true;}
  function move(e){var D=S.drag;if(!D||e.pointerId!==D.id)return;var q=toImg(e.clientX,e.clientY,D.where);if(Math.hypot(q[0]-D.q0[0],q[1]-D.q0[1])*q[2]>3)D.moved=true;
    if(D.type==='curve'){var cv=S.curves[D.i];if(cv.snap)return;var pr=(q[0]-D.q0[0])*cv.dir[0]+(q[1]-D.q0[1])*cv.dir[1];cv.c=clamp(D.c0+pr/cv.L,C0-.12,1);if(cv.c>=SNAP)snapCurve(cv);}
    else{var a=S.arms[D.i];if(a.lock||a.auto)return;var ang=Math.atan2(q[1]-a.d.s[1],q[0]-a.d.s[0]),da=ang-D.ang0;while(da>Math.PI)da-=2*Math.PI;while(da<-Math.PI)da+=2*Math.PI;
      a.del=clamp(D.del0+da/R2,-DMAX,DMAX);if(Math.abs(a.del)<LOCK)autoArm(a);}
    S.dirty=true;}
  function end(e){var D=S.drag;if(!D||(e&&e.pointerId!==D.id))return;S.drag=null;
    if(D.type==='curve'){var cv=S.curves[D.i];if(!cv.snap&&cv.c>C0+.04)api.sfx.puff(.03+.05*(cv.c-C0)/(1-C0),.35);}
    else{var a=S.arms[D.i];if(!a.lock&&!a.auto&&Math.abs(a.del)<AUTO)autoArm(a);}
    suppress=D.where==='wall'&&D.moved;stage.classList.remove('drag');if(cw)cw.classList.remove('oa-grabbing');S.dirty=true;}

  // ---------- sounds: recorded ones from the room's sound designer when listed, else synth
  function has(n){var m=window.EH_AUDIO&&EH_AUDIO.sfx;return !!(m&&m[n]);}
  function snd(names,fb,o){for(var i=0;i<names.length;i++)if(has(names[i])){api.sfx.play(names[i],o||{});return;}fb();}
  function snapSound(){snd(['neo-snap','neo-rule','neo-pa'],function(){api.sfx.puff(.2,.06);api.sfx.tick(.09);api.sfx.thud(.12);});}
  function drum(v,dl){setTimeout(function(){if(dead)return;snd(['neo-drum','neo-snare'],function(){api.sfx.thud(v||.3);api.sfx.puff(.07,.12);},{v:v?v/.3:1});},dl||0);}

  function snapCurve(cv){if(cv.snap)return;cv.snap=true;cv.c=1;cv.v=0;cv.flash=1;snapSound();S.dirty=true;
    if(S.drag&&S.drag.type==='curve'&&S.curves[S.drag.i]===cv)S.drag=null;
    if(S.hold&&S.hold.type==='curve')S.hold.i=-1;
    status();if(nCurves()===S.curves.length&&!S.doneC){S.doneC=true;notes();}}
  function autoArm(a){if(a.lock||a.auto)return;a.auto=true;if(S.drag&&S.drag.type==='arm'&&S.arms[S.drag.i]===a)S.drag=null;S.dirty=true;}
  function lockArm(a){a.auto=false;a.lock=true;a.del=0;a.flash=1;var n=nArms();
    if(n<3)drum(.26);else{drum(.3,0);drum(.3,420);drum(.34,840);S.raysT=performance.now();}
    status();if(n===3&&!S.doneA){S.doneA=true;notes();}}

  // ---------- pointer wiring: plate (panel) and wall (capture on the frame so the painting's own click does not open the viewer)
  var suppress=false;
  stage.addEventListener('pointerdown',function(e){if(e.button!=null&&e.button!==0&&e.pointerType==='mouse')return;if(begin(e,'stage')){try{stage.setPointerCapture(e.pointerId);}catch(_){}stage.classList.add('drag');e.preventDefault();}});
  stage.addEventListener('pointermove',function(e){if(S.drag){move(e);return;}if(e.pointerType!=='mouse')return;var q=toImg(e.clientX,e.clientY,'stage');stage.style.cursor=pick(q,q[2],false)?'grab':'default';});
  stage.addEventListener('pointerup',end);stage.addEventListener('pointercancel',end);
  // pan-y on the plate: a touch that starts on a curve or an arm must not scroll the panel
  function stageTouch(e){if(!e.touches||e.touches.length!==1)return;var t=e.touches[0],q=toImg(t.clientX,t.clientY,'stage');if(pick(q,q[2],true))e.preventDefault();}
  stage.addEventListener('touchstart',stageTouch,{passive:false});
  function wallDown(e){suppress=false;if(!wallLive())return;if(e.button!=null&&e.button!==0&&e.pointerType==='mouse')return;if(begin(e,'wall')){e.stopPropagation();e.preventDefault();try{frameEl.setPointerCapture(e.pointerId);}catch(_){}if(cw)cw.classList.add('oa-grabbing');}}
  function wallMove(e){if(S.drag&&S.drag.where==='wall'){move(e);e.stopPropagation();return;}
    if(!cw||e.pointerType!=='mouse')return;var on=false;if(wallLive()){var q=toImg(e.clientX,e.clientY,'wall');on=!!pick(q,q[2],false);}cw.classList.toggle('oa-grab',on);}
  function wallUp(e){if(S.drag&&S.drag.where==='wall'){end(e);e.stopPropagation();}}
  function wallClick(e){if(suppress){suppress=false;e.stopPropagation();e.preventDefault();}}
  function wallTouch(e){if(!wallLive()||!e.touches||e.touches.length!==1)return;var t=e.touches[0],q=toImg(t.clientX,t.clientY,'wall');if(pick(q,q[2],true))e.preventDefault();}
  if(frameEl){frameEl.addEventListener('pointerdown',wallDown,true);frameEl.addEventListener('pointermove',wallMove,true);frameEl.addEventListener('pointerup',wallUp,true);
    frameEl.addEventListener('pointercancel',wallUp,true);frameEl.addEventListener('click',wallClick,true);frameEl.addEventListener('touchstart',wallTouch,{passive:false,capture:true});}

  // ---------- press-and-hold buttons (mouse, touch, Enter / Space: the core leaves keys on panel buttons alone)
  function nextCurve(){for(var i=0;i<S.curves.length;i++)if(!S.curves[i].snap)return i;return -1;}
  function nextArm(){for(var i=0;i<S.arms.length;i++)if(!S.arms[i].lock&&!S.arms[i].auto)return i;return -1;}
  function holdOn(type,btn){if(S.hold)return;var i=type==='curve'?nextCurve():nextArm();if(i<0)return;S.hold={type:type,i:i,btn:btn};S.fresh=false;btn.setAttribute('data-on','1');api.sfx.tick(.03);S.dirty=true;}
  function holdOff(){var H=S.hold;if(!H)return;S.hold=null;H.btn.removeAttribute('data-on');
    if(H.type==='curve'&&H.i>=0){var cv=S.curves[H.i];if(!cv.snap&&cv.c>C0+.04)api.sfx.puff(.03+.05*(cv.c-C0)/(1-C0),.35);}
    if(H.type==='arm'&&H.i>=0){var a=S.arms[H.i];if(!a.lock&&!a.auto&&Math.abs(a.del)<AUTO)autoArm(a);}S.dirty=true;}
  [[bCurve,'curve'],[bArm,'arm']].forEach(function(x){var b=x[0],t=x[1];
    b.addEventListener('pointerdown',function(e){if(e.button!=null&&e.button!==0&&e.pointerType==='mouse')return;e.preventDefault();try{b.setPointerCapture(e.pointerId);}catch(_){}holdOn(t,b);});
    b.addEventListener('pointerup',holdOff);b.addEventListener('pointercancel',holdOff);b.addEventListener('lostpointercapture',holdOff);
    b.addEventListener('keydown',function(e){if(e.key!==' '&&e.key!=='Enter')return;e.preventDefault();e.stopPropagation();if(!e.repeat)holdOn(t,b);});
    b.addEventListener('keyup',function(e){if(e.key!==' '&&e.key!=='Enter')return;e.preventDefault();e.stopPropagation();holdOff();});
    b.addEventListener('blur',holdOff);b.addEventListener('contextmenu',function(e){e.preventDefault();});});

  // ---------- toggles, slider, reset
  bSkel.addEventListener('click',function(){S.skel=!S.skel;bSkel.setAttribute('aria-pressed',S.skel?'true':'false');if(S.skel)api.sfx.tick(.03);notes();S.dirty=true;});
  slider.addEventListener('input',function(){var v=+slider.value/100;S.bal=v;lL.classList.toggle('on',v<.35);lR.classList.toggle('on',v>.65);
    slider.setAttribute('aria-valuetext',v<.35?'誓言一边亮':v>.65?'哀伤一边亮':'两边都亮');notes();S.dirty=true;});
  var lastSide=0;slider.addEventListener('change',function(){var s=S.bal<.35?-1:S.bal>.65?1:0;if(s&&s!==lastSide)api.sfx.whoosh(.04,.8);lastSide=s;});
  bReset.addEventListener('click',function(){holdOff();S.drag=null;S.curves.forEach(function(c){c.snap=false;c.c=C0;c.v=0;c.flash=0;});
    S.arms.forEach(function(a){a.lock=false;a.auto=false;a.del=a.d.off;a.flash=0;});S.fresh=true;S.raysT=0;S.raysA=0;S.doneC=S.doneA=false;api.sfx.puff(.05,.5);status();notes();S.dirty=true;});

  // ---------- text
  function status(){scEl.innerHTML=T.curvesLab+' <b>'+nCurves()+' / '+S.curves.length+'</b> '+T.straightened;saEl.innerHTML=T.armsLab+' <b>'+nArms()+' / 3</b> '+T.aligned;
    bCurve.disabled=nextCurve()<0;bArm.disabled=nextArm()<0&&!S.arms.some(function(a){return a.auto;});}
  function notes(){var t=[];if(S.doneC)t.push(T.curvesDone);if(S.doneA)t.push(T.armsDone);
    if(S.bal<.35)t.push(T.leftText);else if(S.bal>.65)t.push(T.rightText);
    noteEl.innerHTML='';
    if(S.skel){var lg=document.createElement('div');lg.className='oa-legend';lg.innerHTML='<span><i></i>三道拱</span><span><i class="d"></i>三组人物</span><span><i class="o" style="color:'+RED+'"></i>汇聚点</span>';noteEl.appendChild(lg);t.unshift(T.skelText);}
    t.forEach(function(x){var p=document.createElement('p');p.className='small';p.textContent=nb(x);noteEl.appendChild(p);});}
  function hint(){var w=!S.narrow,h=touchUI()?(w?T.hintWallTouch:T.hintPlateTouch):(w?T.hintWall:T.hintPlate);if(hintEl.textContent!==h)hintEl.textContent=nb(h);}
  status();notes();

  // ---------- visible only while the exhibit is on screen in the panel
  var io=null;if('IntersectionObserver' in window){io=new IntersectionObserver(function(es){es.forEach(function(en){S.active=en.isIntersecting;S.dirty=true;});},{root:readEl||null,threshold:0});io.observe(root);}

  // ---------- loop
  var raf=0,last=0,lastKey='';
  function tick(now){if(dead)return;raf=requestAnimationFrame(tick);if(!host.isConnected){dispose();return;}
    var dt=last?Math.min((now-last)/1000,.05):0;last=now;
    var narrow=!wallRect()&&!!(roomEl&&roomEl.classList.contains('reading'));
    if(narrow!==S.narrow){S.narrow=narrow;root.classList.toggle('narrow',narrow);S.dirty=true;}
    hint();
    // hold buttons
    var H=S.hold;if(H&&H.i>=0){if(H.type==='curve'){var hc=S.curves[H.i];if(!hc.snap){hc.c=Math.min(1,hc.c+dt*(reduce?1.2:.42));hc.v=0;if(hc.c>=SNAP)snapCurve(hc);S.dirty=true;}}
      else{var ha=S.arms[H.i];if(!ha.lock&&!ha.auto){var st=dt*16*(ha.del>0?-1:1);ha.del=Math.abs(ha.del)<=Math.abs(st)?0:ha.del+st;if(Math.abs(ha.del)<LOCK)autoArm(ha);S.dirty=true;}}}
    // curves: spring back when free
    S.curves.forEach(function(cv,i){var held=(S.drag&&S.drag.type==='curve'&&S.drag.i===i)||(H&&H.type==='curve'&&H.i===i);
      if(!cv.snap&&!held&&(Math.abs(cv.c-C0)>1e-4||Math.abs(cv.v)>1e-4)){var w=2*Math.PI*2.1,z=reduce?1:.28,n=Math.max(1,Math.ceil(dt/.008)),h=dt/n;
        for(var j=0;j<n;j++){var acc=-w*w*(cv.c-C0)-2*z*w*cv.v;cv.v+=acc*h;cv.c+=cv.v*h;}cv.c=clamp(cv.c,C0-.2,.99);if(Math.abs(cv.c-C0)<1e-4&&Math.abs(cv.v)<1e-3){cv.c=C0;cv.v=0;}S.dirty=true;}
      if(cv.flash>0){cv.flash=Math.max(0,cv.flash-dt/(reduce?.3:.9));S.dirty=true;}});
    // arms: auto-correction
    S.arms.forEach(function(a){if(a.auto){var r=reduce?1:1-Math.exp(-dt*9);a.del+=(0-a.del)*r;if(Math.abs(a.del)<.08)lockArm(a);S.dirty=true;}
      if(a.flash>0){a.flash=Math.max(0,a.flash-dt/1.4);S.dirty=true;}});
    if(S.raysT){var ra=clamp((now-S.raysT)/(reduce?10:1100),0,1);if(ra!==S.raysA){S.raysA=eio(ra);S.dirty=true;}}
    // fades
    var sk=S.skel?1:0;if(S.skelA!==sk){S.skelA=reduce?sk:clamp(S.skelA+(sk>S.skelA?1:-1)*dt/.45,0,1);S.dirty=true;}
    if(Math.abs(S.balA-S.bal)>1e-3){S.balA=reduce?S.bal:S.balA+(S.bal-S.balA)*Math.min(1,dt*10);S.dirty=true;}else if(S.balA!==S.bal){S.balA=S.bal;S.dirty=true;}
    var live=wallLive(),va=live?1:0;if(S.vis!==va){S.vis=reduce?va:clamp(S.vis+(va>S.vis?1:-1)*dt/.35,0,1);S.dirty=true;}
    if(!live&&S.drag&&S.drag.where==='wall')S.drag=null;
    // wall overlay (follows the painting while the panel slides in)
    var r=wallRect(),dpr=Math.min(devicePixelRatio||1,2),key=r?[r.left,r.top,r.width,r.height].map(function(v){return v.toFixed(1);}).join(',')+stage.clientWidth+S.narrow:'none'+stage.clientWidth+S.narrow;
    if(key!==lastKey){lastKey=key;S.dirty=true;}
    if(!S.dirty&&ok(main))return;
    if(ov){if(r&&S.vis>0){var w=Math.round(r.width*dpr),h=Math.round(r.height*dpr);if(ov.width!==w||ov.height!==h){ov.width=w;ov.height=h;}
        og.setTransform(1,0,0,1,0,0);og.clearRect(0,0,w,h);var z=w/IW;og.setTransform(z,0,0,z,0,0);scene(og,1/(r.width/IW),S.vis);}
      else if(ov.width){og.setTransform(1,0,0,1,0,0);og.clearRect(0,0,ov.width,ov.height);}}
    if(S.narrow){var cwid=stage.clientWidth||root.clientWidth||320,sw=Math.round(cwid*dpr),shh=Math.round(sw*H_/IW);
      if(stage.width!==sw||stage.height!==shh){stage.width=sw;stage.height=shh;}
      var sg=stage.getContext('2d');sg.setTransform(1,0,0,1,0,0);sg.fillStyle='#1a1613';sg.fillRect(0,0,sw,shh);sg.imageSmoothingQuality='high';
      if(ok(main))sg.drawImage(main,0,0,sw,shh);var z2=sw/IW;sg.setTransform(z2,0,0,z2,0,0);scene(sg,1/(cwid/IW),1);}
    S.dirty=false;}
  raf=requestAnimationFrame(tick);
  if(!ok(main))main.addEventListener('load',function(){S.dirty=true;},{once:true});
  function dispose(){if(dead)return;dead=true;cancelAnimationFrame(raf);clearTimeout(pollT);if(io)io.disconnect();
    if(ov&&ov.parentNode)ov.parentNode.removeChild(ov);if(cw)cw.classList.remove('oa-grab','oa-grabbing');
    if(frameEl){frameEl.removeEventListener('pointerdown',wallDown,true);frameEl.removeEventListener('pointermove',wallMove,true);frameEl.removeEventListener('pointerup',wallUp,true);
      frameEl.removeEventListener('pointercancel',wallUp,true);frameEl.removeEventListener('click',wallClick,true);frameEl.removeEventListener('touchstart',wallTouch,{capture:true});}}
  host._dispose=dispose;
  // test hook
  if(EH.debug)EH.debug.oath={S:S,snapAll:function(){S.curves.forEach(snapCurve);},alignAll:function(){S.arms.forEach(function(a){if(!a.lock)lockArm(a);});},
    pull:function(i,c){S.curves[i].c=c;S.curves[i].v=0;S.dirty=true;},arm:function(i,d){S.arms[i].del=d;S.dirty=true;},skel:function(on){if(!!S.skel!==!!on)bSkel.click();},
    bal:function(v){slider.value=Math.round(v*100);slider.dispatchEvent(new Event('input'));},layers:useLayers,
    tip:function(i){return armTip(S.arms[i]);},curve:function(i){return curvePts(S.curves[i],8);}};
});
})();

;
/* Special exhibit "reach" (文艺复兴 · 差一指的距离).
   Drag Adam's hand toward God's: the hand follows with elastic resistance that grows near the gap, springs back when
   released, and can never close the last sliver. Works on the hung fresco (an overlay canvas inside the painting's
   frame, aligned to api.artRect()) and on a close-up in the panel (the only place on narrow screens, where the
   reading panel hides the painting). Toggles: plaster seams (giornate.json, polled) and perspective lines that
   converge between the fingertips (our design device, labelled as such).
   Geometry lives in "fresco space": the 2000-px-wide frame of ../adam (main.webp = fresco space × 1.2, verified by
   SIFT: scale 1.20012, offset < 0.35 px). Hand layers s_hA / s_hG are the hi-res cut-outs from ../adam, registered with
   the matrix A below; s_hAm is Adam's hand cut from main.webp itself (exact pixels for the wall), s_patch the plaster
   under it (inpainted). */
(function(){
'use strict';
var FW=2000;                                                     // fresco-space width
var A=[0.29138633599571695,0.012293841878403489,-0.012293841878403489,0.29138633599571695,567.5119051734591,285.2927409693284];
var BOX={hA:[4,254,655,326],hG:[676,221,720,377]};              // layer rectangles in hand space (then A → fresco space)
var TA=[754.3598,416.0680],TG=[759.5838,409.8665];               // fingertips: Adam, God
var CROP=[556.6667,351.6667,214.1667,113.3333];                  // s_hAm / s_patch rectangle in fresco space
var E=[520,392],AD=[0.99476802,0.10215962],PD=[-AD[1],AD[0]],L=235.5924;   // elbow pivot, arm direction, its normal, elbow→tip
// hardest reach per swing: extension (fresco px) at which the nearest points of the two hands are 3.6 px apart
// (0.4 × the painted gap of 9.0 px). Measured offline on the alpha masks for tip offsets s = −24…24.
var S0=-24,SD=2,E1=[14.57,14.77,15.69,17.22,13.83,9.42,5.54,3.68,3.06,3.21,3.89,5.58,7.04,8.45,9.85,10.74,12.39,14.28,16.31,18.21,19.19,21.11,23.91,26.53,32.05];
// nearest distance between the two hands (fresco px) for s = −8…20, e = −24…34, both in steps of 2 (same measurement)
var DT=[[30.99,29.14,27.14,25.14,23.14,21.09,19.09,17.05,15.0,13.0,10.95,8.95,6.9,4.9,2.85,0.9,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],[30.9,28.85,26.8,24.8,22.75,20.75,18.75,16.75,14.75,12.75,10.75,8.75,6.75,4.75,2.75,0.8,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],[31.0,29.0,27.0,25.05,23.05,21.1,19.15,17.15,15.2,13.25,11.25,9.3,7.34,5.34,3.55,1.95,0.35,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],[31.3,29.3,27.34,25.39,23.44,21.44,19.54,17.79,15.84,13.84,11.89,9.94,8.04,6.29,4.74,3.35,1.9,0.25,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],[31.89,29.94,27.94,25.99,24.04,22.09,20.14,18.14,16.19,14.23,12.28,10.59,9.04,7.59,6.15,4.64,3.0,1.35,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],[32.48,30.53,28.58,26.58,24.63,22.68,20.73,18.78,16.83,14.98,13.33,11.84,10.24,8.79,7.14,5.59,3.84,2.3,0.75,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],[33.08,31.13,29.18,27.23,25.28,23.33,21.37,19.42,17.73,16.03,14.53,13.09,11.53,9.89,8.24,6.59,5.09,3.45,1.9,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],[33.42,31.62,29.77,27.82,25.87,23.92,21.97,20.32,18.82,17.38,15.93,14.28,12.73,10.98,9.44,7.84,6.19,4.3,2.55,1.1,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],[34.02,32.07,30.27,28.42,26.47,24.67,23.17,21.67,20.17,18.47,16.83,15.18,13.53,12.03,10.39,8.79,6.94,5.4,3.9,2.45,1.05,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],[34.61,32.66,30.86,29.06,27.41,25.81,24.32,22.77,21.12,19.52,17.83,16.23,14.73,12.98,11.39,9.59,8.19,6.74,5.3,3.84,2.45,1.05,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],[35.21,33.41,31.66,30.01,28.51,26.91,25.42,23.77,22.17,20.47,19.02,17.38,15.68,13.73,12.19,10.74,9.24,7.84,6.54,5.2,3.84,2.45,1.05,0.0,0.0,0.0,0.0,0.0,0.0,0.0],[35.95,34.3,32.71,31.11,29.61,28.01,26.36,24.72,23.22,21.57,19.77,18.23,16.43,14.98,13.53,12.09,10.65,9.25,7.84,6.39,4.94,3.7,2.2,0.5,0.0,0.0,0.0,0.0,0.0,0.0],[36.8,35.35,33.85,32.31,30.71,29.06,27.41,25.81,24.12,22.47,20.77,19.17,17.68,16.23,14.83,13.33,11.99,10.64,9.19,7.74,6.39,4.59,3.05,1.6,0.35,0.0,0.0,0.0,0.0,0.0],[37.9,36.4,34.95,33.3,31.66,29.91,28.36,26.71,25.17,23.32,21.77,20.32,18.82,17.48,16.13,14.68,13.29,11.88,10.54,9.04,7.29,5.74,4.4,3.15,2.0,0.9,0.0,0.0,0.0,0.0],[38.99,37.5,35.95,34.2,32.56,31.01,29.36,27.56,25.81,24.42,22.87,21.52,20.18,18.73,17.38,15.88,14.53,13.19,11.44,9.69,8.39,7.1,5.85,4.65,3.5,2.45,1.35,0.55,0.0,0.0]];
var K=3,SW=20,SU=6,RB=22,DMAX=90;                                // softness near the gap, swing down / up, pull-back limit, input clamp
function gapAt(s,e){var fs=clamp((s+8)/2,0,DT.length-1),fe=clamp((e+24)/2,0,DT[0].length-1),i=Math.min(Math.floor(fs),DT.length-2),j=Math.min(Math.floor(fe),DT[0].length-2),u=fs-i,v=fe-j;
  return (DT[i][j]*(1-v)+DT[i][j+1]*v)*(1-u)+(DT[i+1][j]*(1-v)+DT[i+1][j+1]*v)*u;}
var CLOSE=[634,346,262,136];                                     // close-up window in fresco space
var CM_PER_PX=570/FW;                                            // the fresco is about 570 cm wide
var SINOPIA='rgba(138,59,36,',PERSP='rgba(122,92,44,';

function clamp(x,a,b){return x<a?a:x>b?b:x;}
function e1At(s){var f=clamp((s-S0)/SD,0,E1.length-1),i=Math.min(Math.floor(f),E1.length-2),t=f-i;return E1[i]+(E1[i+1]-E1[i])*t;}
function soft(x,lim){var z=(lim-x)/K;return lim-K*(z>30?z:Math.log(1+Math.exp(z)));}
var B0=(function(){var l=e1At(0);return l-K*Math.log(Math.exp(l/K)-1);})();   // input offset so that rest maps to rest
// displacement (fresco px, pointer space) → pose {s: tip swing, e: extension, m: fresco-space matrix}
function pose(D){var da=D[0]*AD[0]+D[1]*AD[1],dp=D[0]*PD[0]+D[1]*PD[1];
  var s=dp>=0?SW*Math.tanh(dp/SW):SU*Math.tanh(dp/SU),er=da>=0?da:RB*Math.tanh(da/RB),lim=e1At(s),e=soft(er+B0,lim);
  var th=Math.asin(clamp(s/L,-1,1)),c=Math.cos(th),n=Math.sin(th),ax=c*AD[0]-n*AD[1],ay=n*AD[0]+c*AD[1];
  var tx=E[0]+e*ax-(c*E[0]-n*E[1]),ty=E[1]+e*ay-(n*E[0]+c*E[1]);
  var m=[c,n,-n,c,tx,ty];
  var gap=Math.max(gapAt(s,e),3.6);
  return{s:s,e:e,lim:lim,m:m,gap:gap,tip:[c*TA[0]-n*TA[1]+tx,n*TA[0]+c*TA[1]+ty],near:clamp((5.6-gap)/1.9,0,1)};}

// ---------------------------------------------------------------- giornate.json: tolerant reader
function parseSeams(j,art){
  var out=[],sx=null,sy=null;
  function num(v){return typeof v==='number'&&isFinite(v);}
  function pt(v){if(Array.isArray(v)&&v.length>=2&&num(v[0])&&num(v[1]))return[v[0],v[1]];if(v&&num(v.x)&&num(v.y))return[v.x,v.y];return null;}
  function svg(d,closed){var t=String(d).match(/[a-zA-Z]|-?\d*\.?\d+(?:e[-+]?\d+)?/g)||[],i=0,cmd='',x=0,y=0,x0=0,y0=0,cur=null,res=[];
    function n(){return parseFloat(t[i++]);}
    while(i<t.length){if(/[a-zA-Z]/.test(t[i]))cmd=t[i++];var rel=cmd===cmd.toLowerCase(),C=cmd.toUpperCase();
      if(C==='Z'){if(cur){cur.push([x0,y0]);res.push(cur);cur=null;}x=x0;y=y0;continue;}
      if(C==='M'){if(cur&&cur.length>1)res.push(cur);var a=n(),b=n();x=rel?x+a:a;y=rel?y+b:b;x0=x;y0=y;cur=[[x,y]];cmd=rel?'l':'L';continue;}
      if(!cur)cur=[[x,y]];
      if(C==='L'){var a2=n(),b2=n();x=rel?x+a2:a2;y=rel?y+b2:b2;cur.push([x,y]);}
      else if(C==='H'){var h=n();x=rel?x+h:h;cur.push([x,y]);}
      else if(C==='V'){var v=n();y=rel?y+v:v;cur.push([x,y]);}
      else if(C==='C'||C==='Q'||C==='S'||C==='T'){var k=C==='C'?3:(C==='T'?1:2),ps=[];for(var q=0;q<k;q++){var px=n(),py=n();ps.push(rel?[x+px,y+py]:[px,py]);}
        var P0=[x,y],end=ps[ps.length-1];for(var st=1;st<=8;st++){var u=st/8,w=1-u,bx,by;
          if(k===3){bx=w*w*w*P0[0]+3*w*w*u*ps[0][0]+3*w*u*u*ps[1][0]+u*u*u*end[0];by=w*w*w*P0[1]+3*w*w*u*ps[0][1]+3*w*u*u*ps[1][1]+u*u*u*end[1];}
          else if(k===2){bx=w*w*P0[0]+2*w*u*ps[0][0]+u*u*end[0];by=w*w*P0[1]+2*w*u*ps[0][1]+u*u*end[1];}else{bx=P0[0]+(end[0]-P0[0])*u;by=P0[1]+(end[1]-P0[1])*u;}
          cur.push([bx,by]);}x=end[0];y=end[1];}
      else i++;}
    if(cur&&cur.length>1){if(closed)cur.push(cur[0]);res.push(cur);}return res;}
  function walk(v,closed,depth){if(depth>6||v==null)return;
    if(typeof v==='string'){if(/^\s*[Mm]\s*-?[\d.]/.test(v))svg(v,closed).forEach(function(l){out.push(l);});return;}
    if(Array.isArray(v)){if(v.length>=2&&pt(v[0])&&pt(v[1])){var l=v.map(pt).filter(Boolean);if(closed&&l.length>2)l.push(l[0]);out.push(l);return;}
      if(v.length>=4&&v.every(num)){var f=[];for(var i=0;i+1<v.length;i+=2)f.push([v[i],v[i+1]]);out.push(f);return;}
      v.forEach(function(x){walk(x,closed,depth+1);});return;}
    if(typeof v==='object'){
      var W=v.w||v.width||v.W||(v.space&&(v.space.w||v.space.width))||(v.size&&(v.size[0]||v.size.w)),H=v.h||v.height||v.H||(v.space&&(v.space.h||v.space.height))||(v.size&&(v.size[1]||v.size.h));
      if(depth===0&&num(W)){sx=W;sy=num(H)?H:null;}
      Object.keys(v).forEach(function(k){if(/^(w|h|width|height|space|size|note|text|credit|source|sources|title|id|day|order|n|i|image|img|coords|label|kind|area|approximate)$/i.test(k))return;
        walk(v[k],closed||/poly|patch|block|region|giornat|shape|area/i.test(k),depth+1);});}}
  walk(j,false,0);
  if(!out.length)return null;
  var mx=0,my=0;out.forEach(function(l){l.forEach(function(p){mx=Math.max(mx,p[0]);my=Math.max(my,p[1]);});});
  var fx,fy;
  if(sx){fx=FW/sx;fy=sy?FW*(art.h/art.w)/sy:fx;}
  else if(mx<=1.001&&my<=1.001){fx=FW;fy=FW*art.h/art.w;}
  else if(j&&(j.space==='fresco'||j.space===FW)){fx=fy=1;}
  else{fx=fy=FW/(art.w||2400);}                                  // default: pixels of the hung image (main.webp)
  var note=j&&!Array.isArray(j)&&(j.note||j.text)||'';
  return{lines:out.map(function(l){return l.map(function(p){return[p[0]*fx,p[1]*fy];});}),note:typeof note==='string'?note:''};}
function xhrJSON(url,cb){try{var x=new XMLHttpRequest();x.open('GET',url+'?t='+Date.now(),true);x.overrideMimeType('application/json');
  x.onload=function(){if(x.status===200||(x.status===0&&x.responseText)){try{cb(JSON.parse(x.responseText));}catch(e){cb(null);}}else cb(null);};
  x.onerror=function(){cb(null);};x.send();}catch(e){cb(null);}}

// ---------------------------------------------------------------- styles (once)
function css(){if(document.getElementById('s-reach-css'))return;var s=document.createElement('style');s.id='s-reach-css';s.textContent=
  '.rx{margin-top:18px}'+
  '.rx-view{position:relative;max-width:100%}'+
  '.rx-close{display:block;width:100%;height:auto;aspect-ratio:262/136;touch-action:none;cursor:grab;background:#1a1613;box-shadow:0 18px 40px -22px rgba(0,0,0,.7)}'+
  '.rx-close.drag{cursor:grabbing}'+
  '.rx-close:focus-visible{outline:1px solid currentColor;outline-offset:4px}'+
  '.rx-meta{display:flex;flex-wrap:wrap;justify-content:space-between;gap:4px 24px;margin:10px 0 2px;font:400 13.5px/1.7 var(--song);color:var(--ink-2)}'+
  '@media (max-width:560px){.rx-meta{flex-direction:column;gap:2px}}'+
  '.rx-gap{font-variant-numeric:tabular-nums}'+
  '.rx .acts{margin-top:14px}.rx .act{min-width:44px}'+
  '.rx .act:disabled{color:var(--ink-3);cursor:default;text-decoration-style:dotted}'+
  '.rx-note{margin-top:8px}.rx-note p{margin:0 0 8px!important}'+
  '.rx-ov{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:1}';
  document.head.appendChild(s);}

EH.special('reach',function(host,room,api){
  css();
  var sp=room.special||{},art=room.art||{w:2400,h:1089};
  var FH=FW*(art.h||1089)/(art.w||2400);
  var TG_={};(sp.toggles||[]).forEach(function(t){if(t&&t.key)TG_[t.key==='perspective'?'persp':t.key]=t;});
  var T={
    hint:sp.hint||'在局部图上拖动亚当的手，或聚焦后用方向键。',
    hintTouch:sp.hintTouch||'用手指拖动亚当的手。',
    hintWall:sp.hintWall||'在局部图或墙上的原画上拖动亚当的手。',
    gap:sp.gapLabel||'两指相距约',
    labG:(TG_.giornate&&TG_.giornate.label)||'日工块',
    labP:(TG_.persp&&TG_.persp.label)||'透视线',
    giornate:(TG_.giornate&&TG_.giornate.text)||'湿壁画要趁灰泥未干时上色，画家每天只抹一块当天画得完的灰泥。线条标出块与块之间的接缝，只是示意位置。',
    giornateWait:'日工块的接缝数据还在整理，暂时不能显示。',
    persp:(TG_.persp&&TG_.persp.text)||'这组汇向两指之间的线是本展的设计，不是米开朗琪罗的构图。天顶画没有统一的灭点。'
  };
  // ---------- DOM
  var wrap=document.createElement('div');wrap.className='rx';
  wrap.innerHTML='<div class="rx-view"><canvas class="rx-close" tabindex="0" role="img"></canvas></div>'+
    '<div class="rx-meta"><span class="rx-hint"></span><span class="rx-gap" aria-live="off"></span></div>'+
    '<div class="acts"><button type="button" class="act" data-rx="giornate" aria-pressed="false"></button><button type="button" class="act" data-rx="persp" aria-pressed="false"></button></div>'+
    '<div class="rx-note" aria-live="polite"></div>';
  host.appendChild(wrap);
  var cv=wrap.querySelector('.rx-close'),cg=cv.getContext('2d'),hintEl=wrap.querySelector('.rx-hint'),gapEl=wrap.querySelector('.rx-gap'),noteEl=wrap.querySelector('.rx-note');
  var bG=wrap.querySelector('[data-rx="giornate"]'),bP=wrap.querySelector('[data-rx="persp"]');
  bG.textContent=T.labG;bP.textContent=T.labP;
  cv.setAttribute('aria-label','局部：亚当和上帝的手。拖动亚当的手，或用方向键推它。');
  // ---------- images
  var hung=api.img(art.img||'main.webp'),IM={hA:api.img('s_hA.webp'),hG:api.img('s_hG.webp'),hAm:api.img('s_hAm.webp'),patch:api.img('s_patch.webp')};
  function ok(i){return i&&i.complete&&i.naturalWidth>0;}
  var mqT=window.matchMedia?matchMedia('(hover: none)'):null;function touchUI(){return !!(mqT&&mqT.matches);}   // no key hints on touch screens
  // ---------- overlay on the hung painting
  var cw=document.getElementById('cw'),ov=null,og=null;
  if(cw){ov=document.createElement('canvas');ov.className='rx-ov';ov.setAttribute('aria-hidden','true');cw.appendChild(ov);og=ov.getContext('2d');}
  var cwTouch=cw?cw.style.touchAction:'',cwCursor=cw?cw.style.cursor:'';
  if(cw)cw.style.touchAction='none';
  // ---------- state
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var D=[0,0],V=[0,0],drag=null,keys={},show={giornate:false,persp:false},pIn={giornate:0,persp:0},seams=null,dirty=true,lastNear=0,bellT=0,raf=0,last=0,dead=false,lastGap='';
  function artScale(){var r=api.artRect();return{r:r,k:r.width/FW};}
  function visibleArt(r){var f=document.getElementById('frame');return r.width>40&&r.height>20&&!(f&&f.classList.contains('hidden'))&&!(document.getElementById('cmpA')||{classList:{contains:function(){return false;}}}).classList.contains('on');}
  // ---------- drawing (shared by the wall overlay and the close-up; g is in fresco space)
  function drawHands(g,P,hiRes){
    if(ok(IM.patch))g.drawImage(IM.patch,CROP[0],CROP[1],CROP[2],CROP[3]);
    g.save();var m=P.m;g.transform(m[0],m[1],m[2],m[3],m[4],m[5]);
    if(hiRes&&ok(IM.hA)){g.transform(A[0],A[1],A[2],A[3],A[4],A[5]);g.drawImage(IM.hA,BOX.hA[0],BOX.hA[1],BOX.hA[2],BOX.hA[3]);}
    else if(ok(IM.hAm))g.drawImage(IM.hAm,CROP[0],CROP[1],CROP[2],CROP[3]);
    g.restore();}
  function drawSpark(g,P,unit){var n=P.near;if(n<=0.01)return;var mx=(P.tip[0]+TG[0])/2,my=(P.tip[1]+TG[1])/2,r=Math.max(7,unit*5);
    var gr=g.createRadialGradient(mx,my,0,mx,my,r);gr.addColorStop(0,'rgba(255,248,226,'+(.55*n).toFixed(3)+')');gr.addColorStop(.4,'rgba(255,238,200,'+(.22*n).toFixed(3)+')');gr.addColorStop(1,'rgba(255,232,190,0)');
    g.save();g.globalCompositeOperation='lighter';g.fillStyle=gr;g.beginPath();g.arc(mx,my,r,0,Math.PI*2);g.fill();g.restore();}
  function drawPersp(g,P,unit,a){if(a<=0)return;var vx=(P.tip[0]+TG[0])/2,vy=(P.tip[1]+TG[1])/2,N=20,R=Math.hypot(FW,FH);
    g.save();g.lineWidth=unit*1;g.lineCap='round';
    for(var i=0;i<N;i++){var ang=(i+.5)/N*Math.PI*2,dx=Math.cos(ang),dy=Math.sin(ang);
      // from the frame edge inward; stop short of the vanishing point so the gap stays clear
      var tE=R;[[0,dx],[FW,dx],[0,dy],[FH,dy]].forEach(function(b,j){var d=b[1];if(Math.abs(d)<1e-6)return;var t=((j<2?b[0]-vx:b[0]-vy))/d;if(t>0&&t<tE)tE=t;});
      var t1=unit*9,te=t1+(tE-t1)*a;   // grow from the vanishing point outward
      var gr=g.createLinearGradient(vx+dx*t1,vy+dy*t1,vx+dx*tE,vy+dy*tE);gr.addColorStop(0,PERSP+'0)');gr.addColorStop(Math.min(.3,70/tE),PERSP+'.6)');gr.addColorStop(1,PERSP+'.32)');
      g.strokeStyle=gr;g.beginPath();g.moveTo(vx+dx*t1,vy+dy*t1);g.lineTo(vx+dx*te,vy+dy*te);g.stroke();}
    g.restore();}
  function drawSeams(g,unit,a){if(a<=0||!seams)return;g.save();g.lineJoin='round';g.lineCap='round';
    g.strokeStyle='rgba(255,250,238,'+(.3*a).toFixed(3)+')';g.lineWidth=unit*2.4;seams.lines.forEach(function(l){path(g,l);g.stroke();});
    g.strokeStyle=SINOPIA+(.78*a).toFixed(3)+')';g.lineWidth=unit*.9;seams.lines.forEach(function(l){path(g,l);g.stroke();});
    g.restore();}
  function path(g,l){g.beginPath();g.moveTo(l[0][0],l[0][1]);for(var i=1;i<l.length;i++)g.lineTo(l[i][0],l[i][1]);}
  function moved(P){return Math.abs(P.e)>0.02||Math.abs(P.s)>0.02;}
  function drawWall(P){if(!ov)return;var a=artScale(),r=a.r,dpr=Math.min(devicePixelRatio||1,2),w=Math.round(r.width*dpr),h=Math.round(r.height*dpr);
    if(!visibleArt(r)){if(ov.width)og.clearRect(0,0,ov.width,ov.height);return;}
    if(ov.width!==w||ov.height!==h){ov.width=w;ov.height=h;}
    og.setTransform(1,0,0,1,0,0);og.clearRect(0,0,w,h);var z=w/FW;og.setTransform(z,0,0,z,0,0);og.imageSmoothingQuality='high';
    var unit=1/(a.k||1);                      // one CSS pixel in fresco px
    if(moved(P))drawHands(og,P,false);
    drawSpark(og,P,unit);drawSeams(og,unit,pIn.giornate);drawPersp(og,P,unit,pIn.persp);}
  function drawClose(P){var dpr=Math.min(devicePixelRatio||1,2),cwid=cv.clientWidth;if(!cwid)return;var w=Math.round(cwid*dpr),h=Math.round(w*CLOSE[3]/CLOSE[2]);
    if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h;}
    cg.setTransform(1,0,0,1,0,0);cg.fillStyle='#1a1613';cg.fillRect(0,0,w,h);cg.imageSmoothingQuality='high';
    if(ok(hung)){var f=hung.naturalWidth/FW;cg.drawImage(hung,CLOSE[0]*f,CLOSE[1]*f,CLOSE[2]*f,CLOSE[3]*f,0,0,w,h);}
    var z=w/CLOSE[2];cg.setTransform(z,0,0,z,-CLOSE[0]*z,-CLOSE[1]*z);
    if(ok(IM.hG)){cg.save();cg.transform(A[0],A[1],A[2],A[3],A[4],A[5]);cg.drawImage(IM.hG,BOX.hG[0],BOX.hG[1],BOX.hG[2],BOX.hG[3]);cg.restore();}
    drawHands(cg,P,true);
    var unit=dpr/z;drawSpark(cg,P,unit*2.2);drawSeams(cg,unit,pIn.giornate);drawPersp(cg,P,unit,pIn.persp);}
  // ---------- input
  function toFresco(clientX,clientY,where){if(where==='wall'){var a=artScale();return[(clientX-a.r.left)/a.k,(clientY-a.r.top)/a.k];}
    var rc=cv.getBoundingClientRect(),z=rc.width/CLOSE[2];return[CLOSE[0]+(clientX-rc.left)/z,CLOSE[1]+(clientY-rc.top)/z];}
  function overHand(q,k){var pad=Math.max(10/k,4);return q[0]>600-pad&&q[0]<762+pad&&q[1]>356-pad&&q[1]<462+pad;}
  function start(e,where){if(e.button!=null&&e.button!==0&&e.pointerType==='mouse')return false;var q=toFresco(e.clientX,e.clientY,where);
    drag={id:e.pointerId,where:where,q0:q,D0:D.slice(),moved:false};V=[0,0];dirty=true;api.sfx.tick(.025);return true;}
  function move(e){if(!drag||e.pointerId!==drag.id)return;var q=toFresco(e.clientX,e.clientY,drag.where),dx=q[0]-drag.q0[0],dy=q[1]-drag.q0[1];
    var nx=drag.D0[0]+dx,ny=drag.D0[1]+dy,m=Math.hypot(nx,ny);if(m>DMAX){nx*=DMAX/m;ny*=DMAX/m;}D=[nx,ny];if(Math.hypot(dx,dy)>1)drag.moved=true;dirty=true;}
  function end(e){if(!drag||(e&&e.pointerId!==drag.id))return;var amt=clamp(Math.hypot(D[0],D[1])/40,0,1);
    if(amt>.05)api.sfx.puff(.025+.06*amt,.45);suppress=drag.where==='wall'&&drag.moved;drag=null;cv.classList.remove('drag');dirty=true;}
  cv.addEventListener('pointerdown',function(e){if(start(e,'close')){cv.setPointerCapture(e.pointerId);cv.classList.add('drag');e.preventDefault();}});
  cv.addEventListener('pointermove',move);cv.addEventListener('pointerup',end);cv.addEventListener('pointercancel',end);
  // the wall: listen on the frame in the capture phase so the painting's own click (open viewer) does not fire after a drag
  var frameEl=document.getElementById('frame'),suppress=false;
  function wallDown(e){suppress=false;if(!ov)return;var a=artScale();if(!visibleArt(a.r))return;var q=toFresco(e.clientX,e.clientY,'wall');if(!overHand(q,a.k))return;
    if(start(e,'wall')){e.stopPropagation();e.preventDefault();try{frameEl.setPointerCapture(e.pointerId);}catch(_){}}}
  function wallMove(e){if(drag&&drag.where==='wall'){move(e);e.stopPropagation();return;}
    if(!cw||e.pointerType!=='mouse')return;var a=artScale();if(!visibleArt(a.r)){cw.style.cursor=cwCursor;return;}cw.style.cursor=overHand(toFresco(e.clientX,e.clientY,'wall'),a.k)?'grab':cwCursor;}
  function wallUp(e){if(drag&&drag.where==='wall'){end(e);e.stopPropagation();}}
  function wallClick(e){if(suppress){suppress=false;e.stopPropagation();e.preventDefault();}}
  if(frameEl){frameEl.addEventListener('pointerdown',wallDown,true);frameEl.addEventListener('pointermove',wallMove,true);frameEl.addEventListener('pointerup',wallUp,true);
    frameEl.addEventListener('pointercancel',wallUp,true);frameEl.addEventListener('click',wallClick,true);}
  // keyboard on the close-up: arrows push while held, release springs back
  var KV={ArrowRight:[1,0],ArrowLeft:[-1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
  cv.addEventListener('keydown',function(e){if(!KV[e.key])return;e.preventDefault();e.stopPropagation();if(!keys[e.key]){if(!Object.keys(keys).length)api.sfx.tick(.02);keys[e.key]=1;}dirty=true;});
  cv.addEventListener('keyup',function(e){if(!KV[e.key])return;delete keys[e.key];if(!Object.keys(keys).length){var amt=clamp(Math.hypot(D[0],D[1])/40,0,1);if(amt>.05)api.sfx.puff(.025+.06*amt,.45);}dirty=true;});
  cv.addEventListener('blur',function(){keys={};});
  // ---------- toggles
  function notes(){var t=[];if(show.giornate&&seams)t.push(T.giornate);if(show.persp)t.push(T.persp);if(!seams)t.push(T.giornateWait);
    noteEl.innerHTML='';t.forEach(function(x){var p=document.createElement('p');p.className='small';p.textContent=x;noteEl.appendChild(p);});}
  function toggle(k,b){show[k]=!show[k];b.setAttribute('aria-pressed',show[k]?'true':'false');if(show[k])api.sfx.tick(.03);notes();dirty=true;}
  bG.addEventListener('click',function(){if(!seams)return;toggle('giornate',bG);});
  bP.addEventListener('click',function(){toggle('persp',bP);});
  function setSeams(s){seams=s;bG.disabled=!s;bG.title=s?'':T.giornateWait;bG.setAttribute('aria-disabled',s?'false':'true');notes();dirty=true;}
  setSeams(null);
  var pollT=0,tries=0;function poll(){if(dead||seams||++tries>24)return;xhrJSON(api.path('giornate.json'),function(j){if(dead)return;var s=j&&parseSeams(j,art);if(s&&s.lines.length)setSeams(s);else pollT=setTimeout(poll,5000);});}
  poll();
  // ---------- loop
  function tick(now){if(dead)return;raf=requestAnimationFrame(tick);if(!host.isConnected){dispose();return;}
    var dt=last?Math.min((now-last)/1000,.05):0;last=now;
    var held=Object.keys(keys);
    if(held.length){var vx=0,vy=0;held.forEach(function(k){vx+=KV[k][0];vy+=KV[k][1];});D=[clamp(D[0]+vx*38*dt,-DMAX,DMAX),clamp(D[1]+vy*38*dt,-DMAX,DMAX)];V=[0,0];dirty=true;}
    else if(!drag&&(Math.abs(D[0])>.005||Math.abs(D[1])>.005||Math.abs(V[0])>.005||Math.abs(V[1])>.005)){
      // damped spring back to rest (critically damped when the visitor asked for reduced motion)
      var w=2*Math.PI*1.9,z=reduce?1:.32,n=Math.max(1,Math.ceil(dt/.008)),h=dt/n;
      for(var i=0;i<n;i++){for(var c=0;c<2;c++){var acc=-w*w*D[c]-2*z*w*V[c];V[c]+=acc*h;D[c]+=V[c]*h;}}
      if(Math.hypot(D[0],D[1])<.01&&Math.hypot(V[0],V[1])<.05){D=[0,0];V=[0,0];}dirty=true;}
    ['giornate','persp'].forEach(function(k){var tgt=show[k]&&(k!=='giornate'||seams)?1:0,cur=pIn[k];if(cur!==tgt){pIn[k]=reduce?tgt:clamp(cur+(tgt>cur?1:-1)*dt/.7,0,1);dirty=true;}});
    var P=pose(D);
    if(P.near>.85&&lastNear<=.85&&now-bellT>1400){api.sfx.bell(1568,.02);bellT=now;}lastNear=P.near;
    // the wall painting moves while the panel slides in; redraw every frame then, else only when something changed
    var a=api.artRect(),key=a.left.toFixed(1)+a.top.toFixed(1)+a.width.toFixed(1)+cv.clientWidth;
    if(key!==tick.k){tick.k=key;dirty=true;}
    if(dirty||!ok(hung)){drawWall(P);drawClose(P);dirty=false;}
    var d=P.gap*CM_PER_PX,txt=T.gap+' '+d.toFixed(1)+' 厘米';if(txt!==lastGap){gapEl.textContent=txt;lastGap=txt;}
    var hv=visibleArt(a)?T.hintWall:(touchUI()?T.hintTouch:T.hint);if(hintEl.textContent!==hv)hintEl.textContent=hv;}
  raf=requestAnimationFrame(tick);
  [hung,IM.hA,IM.hG,IM.hAm,IM.patch].forEach(function(i){if(!ok(i))i.addEventListener('load',function(){dirty=true;},{once:true});});
  function dispose(){if(dead)return;dead=true;cancelAnimationFrame(raf);clearTimeout(pollT);
    if(ov&&ov.parentNode)ov.parentNode.removeChild(ov);
    if(cw){cw.style.touchAction=cwTouch;cw.style.cursor=cwCursor;}
    if(frameEl){frameEl.removeEventListener('pointerdown',wallDown,true);frameEl.removeEventListener('pointermove',wallMove,true);frameEl.removeEventListener('pointerup',wallUp,true);
      frameEl.removeEventListener('pointercancel',wallUp,true);frameEl.removeEventListener('click',wallClick,true);}}
  host._dispose=dispose;
  // test hook
  EH.debug&&(EH.debug.reach={pose:function(){return pose(D);},set:function(x,y){D=[x,y];V=[0,0];dirty=true;},hold:function(on){drag=on?{id:-1,where:'close',q0:[0,0],D0:D.slice(),moved:false}:null;},
    show:function(k,on){if(!!show[k]!==!!on)(k==='giornate'?bG:bP).click();},seams:function(){return seams;},parse:function(j){return parseSeams(j,art);},e1:e1At,B0:B0});
});
})();

;
/* Special exhibit "swing" (洛可可 · 你是拉绳的人).
   The visitor is the old man in the shade who pulls the swing's rope. Drag down (on the hung painting, on the close-up in the panel, or on the
   拉绳 control) or press-and-hold 拉绳: a pull gives the swing a push toward the old man. Pull while the swing comes back toward him and the swing
   goes higher (positive work); pull while it moves away and it slows down (negative work). A damped pendulum around the painted pose:
   φ'' = −ω²φ − 2ζωφ' + pull impulses. Energy is capped at the maximum swing (±14°, ±6° with reduced motion).
   High enough on the left turn → the pink shoe is kicked off again: a page-level element that can be caught and thrown anywhere; it flies home
   after a few quiet seconds. Pointer over the cupid → the page's music is ducked to silence and this exhibit's own sounds stop (the core exposes
   no master duck: recorded room loops keep playing — see note in the final report). Clicking the young man, the old man or the cupid (or their
   buttons in the panel) tells that figure's part of the commission story (room.special.stories {youngman, oldman, cupid}).
   Layers come from rooms/rococo/cut/layers.json (main.webp pixel space); without them the exhibit falls back to a schematic rope on the wall. */
(function(){
'use strict';
if(!window.EH||!EH.special)return;
var D2R=Math.PI/180;
function clamp(x,a,b){return x<a?a:x>b?b:x;}
function lerp(a,b,t){return a+(b-a)*t;}
function sm(t){t=clamp(t,0,1);return t*t*(3-2*t);}
function nb(t){return String(t==null?'':t).replace(/([\u3400-\u9fff）》”]) (?=[0-9A-Za-z])/g,'$1\u00a0').replace(/([0-9A-Za-z.%°]) (?=[\u3400-\u9fff（《“])/g,'$1\u00a0');}
function ok(i){return !!(i&&i.complete&&i.naturalWidth>0);}
function xhrJSON(url,cb){try{var x=new XMLHttpRequest();x.open('GET',url+'?t='+Date.now(),true);x.overrideMimeType('application/json');
  x.onload=function(){if(x.status===200||(x.status===0&&x.responseText)){try{cb(JSON.parse(x.responseText));}catch(e){cb(null);}}else cb(null);};
  x.onerror=function(){cb(null);};x.send();}catch(e){cb(null);}}

// ---------------------------------------------------------------- physics
var PERIOD=2.5,W0=2*Math.PI/PERIOD,ZETA=.045;                    // ≈ 2.5 s swing; amplitude halves in ≈ 6 s without pulling
var DV=.38;                                                        // rad/s of velocity (toward the old man) per full rope stroke
var SHOE_AT=.8;                                                    // fraction of the maximum swing at which the shoe flies

// ---------------------------------------------------------------- default geometry (main.webp px, 1912 × 2400), replaced by cut/layers.json
var DEF={W:1912,H:2400,pivot:[1410.6,784.6],anchorL:[1267.2,606.3],anchorR:[1554,962.9],handL:[937.6,1348.1],handR:[1303,1269.4],
  woman:[502,1208,1351,1855],shoe:[424,1263,475,1336],foot:[502.9,1418.8],
  young:[139,1732,632,2171],old:[1374,1678,1706,2141],cupid:[18,1093,216,1539],
  hand:[1390,1787],pulls:[[1270,1607],[1235,1704]]};                // the old man's hand and where his two pull ropes meet the dress
// the swing ropes above the hands, split out of cut/ropes.webp by _wip/s-swing/split_ropes.py; each bends about its anchor in the tree
var ROPES={upL:{file:'s_rope_upL.webp',x:942,y:607,w:334,h:734,anchor:'anchorL',hand:'handL'},upR:{file:'s_rope_upR.webp',x:1331,y:1059,w:154,h:187,anchor:'anchorR',hand:'handR'},
  low:{file:'s_rope_low.webp',x:932,y:1333,w:21,h:8}};
var CROP=[0,520,1912,1740];                                        // the close-up in the panel (narrow screens): x, y, w, h

function css(){if(document.getElementById('s-swing-css'))return;var s=document.createElement('style');s.id='s-swing-css';s.textContent=
  '.sw{margin-top:18px}'+
  '.sw .sw-stage{display:none;width:100%;height:auto;aspect-ratio:'+CROP[2]+'/'+CROP[3]+';touch-action:pan-y;cursor:grab;background:#1d1f1a;box-shadow:0 18px 40px -22px rgba(0,0,0,.7)}'+
  '.sw.narrow .sw-stage{display:block;margin-bottom:12px}'+
  '.sw-stage.drag{cursor:grabbing}'+
  '.sw-row{display:flex;align-items:stretch;gap:16px}'+
  '.sw-gauge{flex:1 1 auto;min-width:0;height:112px;display:block}'+
  '.sw-pull{flex:0 0 auto;width:76px;min-height:112px;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:6px;padding:0 0 8px;touch-action:none;cursor:ns-resize;'+
    'font:400 15px/1.2 var(--song);color:inherit;border:1px solid var(--ink-3);border-radius:2px;background:transparent;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none}'+
  '.sw-pull:focus-visible{outline:1px solid currentColor;outline-offset:3px}'+
  '.sw-pull svg{display:block;overflow:visible}'+
  '.sw-pull[aria-pressed="true"]{font-weight:500;border-color:currentColor}'+
  '.sw-meta{display:flex;flex-wrap:wrap;justify-content:space-between;gap:4px 24px;margin:10px 0 2px;font:400 13.5px/1.7 var(--song);color:var(--ink-2)}'+
  '.sw-amp{font-variant-numeric:tabular-nums;white-space:nowrap}'+
  '@media (max-width:560px){.sw-meta{flex-direction:column;gap:2px}}'+
  '.sw .acts{margin-top:12px}.sw .act{min-width:44px}'+
  '.sw-story{margin-top:6px;min-height:0}.sw-story .sw-who{margin:0 0 2px!important;font:500 15px/1.7 var(--song)}.sw-story p{margin:0 0 8px}'+
  '.sw-mute{font:400 13.5px/1.7 var(--song);color:var(--ink-2);margin:2px 0 0}'+
  '.sw-mute[hidden]{display:none}'+
  '.sw-ov{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:1}'+
  '.sw-shoe{position:fixed;left:0;top:0;width:56px;height:56px;z-index:30;display:none;touch-action:none;cursor:grab;-webkit-user-select:none;user-select:none;will-change:transform}'+
  '.sw-shoe.on{display:block}.sw-shoe.held{cursor:grabbing}'+
  '.sw-shoe canvas{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);pointer-events:none;filter:drop-shadow(0 6px 6px rgba(0,0,0,.35))}';
  document.head.appendChild(s);}

EH.special('swing',function(host,room,api){
  css();
  var sp=room.special||{},art=room.art||{w:1912,h:2400};
  var ST=sp.stories||{},LB=sp.labels||{};
  // room.special.hint may be a string or {mouse, touch}; the core owns Space, so a hint that offers it is rewritten to the 拉绳 control
  var HO=sp.hint&&typeof sp.hint==='object'?sp.hint:null;
  function fixHint(t){return t?String(t).replace(/[，,]?\s*或按空格键/,'，或按住“拉绳”'):t;}
  function pick(o,keys){for(var i=0;i<keys.length;i++){var v=o&&o[keys[i]];if(v)return typeof v==='string'?v:(v.text||v.t||'');}return '';}
  var T={
    pull:LB.pull||sp.pullLabel||'拉绳',
    young:LB.youngman||LB.young||'年轻人',old:LB.oldman||LB.old||'老先生',cupid:LB.cupid||'丘比特',
    hintWall:fixHint(sp.hintWall||(HO&&HO.mouse))||'在墙上的画里往下拖，或按住“拉绳”。秋千荡回老先生这边时拉，越荡越高；拉错了时机，它会慢下来。',
    hint:fixHint((typeof sp.hint==='string'&&sp.hint)||(HO&&HO.mouse))||'在局部图上往下拖，或按住“拉绳”（也可聚焦后按住回车）。秋千荡回老先生这边时拉，越荡越高。',
    hintTouch:fixHint(sp.hintTouch||(HO&&HO.touch))||'按住“拉绳”，或在它上面往下拖。秋千荡回老先生这边时拉，越荡越高。',
    shoe:sp.shoeHint||'鞋又飞出去了：抓住它，扔到页面任何地方。过一会儿，它会自己飞回画里。',
    shoeTouch:sp.shoeHintTouch||'鞋又飞出去了：按住它，甩到页面任何地方。过一会儿，它会自己飞回画里。',
    amp:sp.ampLabel||'摆幅',
    mute:sp.mute||'丘比特竖起手指：嘘——音乐已静下来。',
    figs:sp.figHint||'点画里的年轻人、老先生或丘比特，听他们各自的那一段委托故事。',
    figsTouch:sp.figHintTouch||'点下面的名字，听画里三个人物各自的那一段委托故事。'
  };
  var STORY={
    young:pick(ST,['youngman','young','youngMan','lover'])||'据同时代剧作家科莱记载，一位贵族想请人画他的情人荡秋千，而他自己要待在能看见她双腿的地方。这个位置就是左下角树丛里的年轻人。',
    old:pick(ST,['oldman','old','oldMan','husband'])||'据科莱记载，委托人原本想让一位主教在后面推秋千。画成后，推秋千的换成了阴影里的这位老先生；他是谁，至今说法不一。',
    cupid:pick(ST,['cupid','amor','statue'])||'左边的丘比特雕像把手指竖在唇边，像是在叫人别出声。有研究者认为它参照了法尔孔奈的雕塑《威吓的爱神》。'
  };
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MAX=(reduce?6:14)*D2R;
  var mqT=window.matchMedia?matchMedia('(hover: none)'):null;function touchUI(){return !!(mqT&&mqT.matches);}

  // ---------- DOM
  var wrap=document.createElement('div');wrap.className='sw';
  wrap.innerHTML='<canvas class="sw-stage" role="img" aria-label="局部：荡秋千的女子、左边的年轻人和丘比特、右边拉绳的老先生。往下拖动来拉绳。"></canvas>'+
    '<div class="sw-row"><canvas class="sw-gauge" role="img" aria-label="秋千摆幅示意"></canvas>'+
    '<button type="button" class="sw-pull" aria-pressed="false"><svg width="18" height="58" viewBox="0 0 18 58" aria-hidden="true"><path class="sw-rope" d="M9 0 V40" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="3 2"/><circle class="sw-knot" cx="9" cy="46" r="6" fill="none" stroke="currentColor" stroke-width="1.5"/></svg><span></span></button></div>'+
    '<div class="sw-meta"><span class="sw-hint"></span><span class="sw-amp"></span></div>'+
    '<p class="sw-mute" hidden></p>'+
    '<div class="acts" role="group" aria-label="委托故事"><button type="button" class="act" data-f="young" aria-pressed="false"></button><button type="button" class="act" data-f="old" aria-pressed="false"></button><button type="button" class="act" data-f="cupid" aria-pressed="false"></button></div>'+
    '<div class="sw-story" aria-live="polite"></div>';
  host.appendChild(wrap);
  var stage=wrap.querySelector('.sw-stage'),sg=stage.getContext('2d'),gauge=wrap.querySelector('.sw-gauge'),gg=gauge.getContext('2d');
  var pullBtn=wrap.querySelector('.sw-pull'),ropeEl=pullBtn.querySelector('.sw-rope'),knotEl=pullBtn.querySelector('.sw-knot');
  pullBtn.querySelector('span').textContent=T.pull;pullBtn.setAttribute('aria-label',T.pull+'：按住或往下拖');
  var hintEl=wrap.querySelector('.sw-hint'),ampEl=wrap.querySelector('.sw-amp'),muteEl=wrap.querySelector('.sw-mute'),storyEl=wrap.querySelector('.sw-story');
  var figBtns={};Array.prototype.forEach.call(wrap.querySelectorAll('[data-f]'),function(b){var k=b.getAttribute('data-f');figBtns[k]=b;b.textContent=T[k];});
  muteEl.textContent=T.mute;

  // ---------- geometry + images (layers.json, polled while the cut is being made)
  var G=JSON.parse(JSON.stringify(DEF));G.W=art.w||DEF.W;G.H=art.h||DEF.H;
  var hung=api.img(art.img||'main.webp');
  var L={woman:null,shoe:null,plate:null,shoePlate:null,flowers:null,upL:null,upR:null,low:null},POLY={};   // layers: {img,x,y,w,h}
  var haveLayers=false;
  function lay(o,file,own){if(!o)return null;var f=file||o.file||o.img;if(!f)return null;var im=api.img(own?f:'cut/'+f);if(!ok(im))im.addEventListener('load',function(){dirty=true;},{once:true});
    return{img:im,x:o.x||0,y:o.y||0,w:o.w||G.W,h:o.h||G.H};}
  function pt(v){if(Array.isArray(v)&&v.length>=2&&typeof v[0]==='number')return[v[0],v[1]];if(v&&typeof v.x==='number'&&typeof v.y==='number')return[v.x,v.y];return null;}
  function bb(l){return l&&typeof l.x==='number'&&typeof l.w==='number'?[l.x,l.y,l.x+l.w,l.y+l.h]:null;}
  function polyBox(h){var xs=h.map(function(p){return p[0];}),ys=h.map(function(p){return p[1];});return[Math.min.apply(0,xs),Math.min.apply(0,ys),Math.max.apply(0,xs),Math.max.apply(0,ys)];}
  function useLayers(j){if(!j||!j.layers)return false;
    if(j.W)G.W=j.W;if(j.H)G.H=j.H;var P=j.points||{};
    ['pivot','anchorL','anchorR','handL','handR'].forEach(function(k){var v=pt(P[k]);if(v)G[k]=v;});var ft=pt(P.footBare)||pt(P.foot);if(ft)G.foot=ft;
    var by={};j.layers.forEach(function(l){by[String(l.id||'').toLowerCase()]=l;});
    if(by.woman){L.woman=lay(by.woman);G.woman=bb(by.woman)||G.woman;var pv=pt(by.woman.pivot);if(pv&&!P.pivot)G.pivot=pv;}
    if(by.flowers)L.flowers=lay(by.flowers);
    if(by.shoe){L.shoe=lay(by.shoe);G.shoe=bb(by.shoe)||G.shoe;if(by.shoe.patch)L.shoePlate=lay(by.shoe.patch);}
    (j.regions||[]).concat(j.layers).forEach(function(r){var id=String(r.id||'').toLowerCase(),k=/young/.test(id)?'young':/old/.test(id)?'old':/cupid/.test(id)?'cupid':null;
      if(!k||!r.hit||!r.hit.length||POLY[k])return;POLY[k]=r.hit;G[k]=r.box||polyBox(r.hit);});
    var pf=j.plate||j.bg||j.background;if(pf)L.plate=lay(typeof pf==='string'?{file:pf}:pf);
    L.upL=lay(ROPES.upL,ROPES.upL.file,true);L.upR=lay(ROPES.upR,ROPES.upR.file,true);L.low=lay(ROPES.low,ROPES.low.file,true);
    haveLayers=!!(L.woman&&L.plate);swept=null;dirty=true;return true;}
  var pollT=0,tries=0;
  var layersFailed=false;
  function poll(){if(dead||++tries>40)return;xhrJSON(api.path('cut/layers.json'),function(j){if(dead)return;if(!useLayers(j)){if(tries>2)layersFailed=true;pollT=setTimeout(poll,tries<4?1500:8000);}});}
  poll();

  // ---------- wall overlay
  var cw=document.getElementById('cw'),frameEl=document.getElementById('frame'),ov=null,og=null;
  if(cw){ov=document.createElement('canvas');ov.className='sw-ov';ov.setAttribute('aria-hidden','true');cw.appendChild(ov);og=ov.getContext('2d');}
  var cwTouch=cw?cw.style.touchAction:'',cwCursor=cw?cw.style.cursor:'';
  if(cw)cw.style.touchAction='none';
  function artRect(){return api.artRect();}
  function wallVisible(r){r=r||artRect();var cmp=document.getElementById('cmpA');return r.width>40&&r.height>40&&!(frameEl&&frameEl.classList.contains('hidden'))&&!(cmp&&cmp.classList.contains('on'));}

  // ---------- state
  var S={phi:0,v:0,rope:0,ropeT:0,hold:false,pullKey:false,prevV:0,amp:0,
    glow:{young:0,old:0,cupid:0},focus:null,muted:false,muteUntil:0,muteSrc:null,
    shoe:{mode:'home',x:0,y:0,vx:0,vy:0,a:0,va:0,t:0,from:null,samples:[]},shoeAlpha:1};
  var dirty=true,dead=false,raf=0,last=0,drag=null,suppress=false,lastWhoosh=0,lastSide=0;

  // ---------- geometry helpers
  // canvas rotation is clockwise-positive with y down, so rotating a point below the pivot by +φ moves it to the LEFT: φ > 0 = toward the young man
  function rot(p,a){var c=Math.cos(a),s=Math.sin(a),dx=p[0]-G.pivot[0],dy=p[1]-G.pivot[1];return[G.pivot[0]+c*dx-s*dy,G.pivot[1]+s*dx+c*dy];}
  function inBox(q,b,pad){pad=pad||0;return q[0]>=b[0]-pad&&q[0]<=b[2]+pad&&q[1]>=b[1]-pad&&q[1]<=b[3]+pad;}
  function inPoly(q,h){var c=false;for(var i=0,j=h.length-1;i<h.length;j=i++){var a=h[i],b=h[j];if(((a[1]>q[1])!==(b[1]>q[1]))&&(q[0]<(b[0]-a[0])*(q[1]-a[1])/(b[1]-a[1])+a[0]))c=!c;}return c;}
  function hit(k,q,pad){if(!inBox(q,G[k],pad))return false;if(!POLY[k]||pad>30)return true;if(inPoly(q,POLY[k]))return true;
    // near the outline counts too (fingers are coarse)
    var h=POLY[k];for(var i=0,j=h.length-1;i<h.length;j=i++){var a=h[j],b=h[i],dx=b[0]-a[0],dy=b[1]-a[1],t=clamp(((q[0]-a[0])*dx+(q[1]-a[1])*dy)/(dx*dx+dy*dy||1),0,1);if(Math.hypot(q[0]-a[0]-t*dx,q[1]-a[1]-t*dy)<pad)return true;}return false;}
  function figAt(q,pad){if(hit('cupid',q,pad))return 'cupid';if(hit('young',q,pad))return 'young';if(hit('old',q,pad))return 'old';return null;}
  function center(b){return[(b[0]+b[2])/2,(b[1]+b[3])/2];}
  // the area the swing can uncover: woman + ropes swept over ±MAX (bounding box), where the plate is drawn
  var swept=null;
  function sweptBox(){if(swept)return swept;var xs=[],ys=[],b=G.woman;
    [-MAX,-MAX/2,0,MAX/2,MAX].forEach(function(a){[[b[0],b[1]],[b[2],b[1]],[b[0],b[3]],[b[2],b[3]],G.handL,G.handR].forEach(function(p){var r=rot(p,a);xs.push(r[0]);ys.push(r[1]);});});
    [ROPES.upL,ROPES.upR].forEach(function(r){xs.push(r.x,r.x+r.w);ys.push(r.y,r.y+r.h);});
    swept=[Math.max(0,Math.min.apply(0,xs)-24),Math.max(0,Math.min.apply(0,ys)-16),Math.min(G.W,Math.max.apply(0,xs)+24),Math.min(G.H,Math.max.apply(0,ys)+24)];return swept;}

  // ---------- drawing (g is in main.webp pixel space)
  function drawPart(g,P,x0,y0,x1,y1){if(!P||!ok(P.img))return;var sx0=Math.max(x0,P.x),sy0=Math.max(y0,P.y),sx1=Math.min(x1,P.x+P.w),sy1=Math.min(y1,P.y+P.h);if(sx1<=sx0||sy1<=sy0)return;
    var kx=P.img.naturalWidth/P.w,ky=P.img.naturalHeight/P.h;g.drawImage(P.img,(sx0-P.x)*kx,(sy0-P.y)*ky,(sx1-sx0)*kx,(sy1-sy0)*ky,sx0,sy0,sx1-sx0,sy1-sy0);}
  function drawLayer(g,P){if(P&&ok(P.img))g.drawImage(P.img,P.x,P.y,P.w,P.h);}
  // a rope above the hand bends about its anchor in the tree so that its lower end stays in the (rotated) hand
  function drawRope(g,P,A,H,a){if(!P||!ok(P.img))return;var H2=rot(H,a),d=Math.atan2(H2[1]-A[1],H2[0]-A[0])-Math.atan2(H[1]-A[1],H[0]-A[0]),k=Math.hypot(H2[0]-A[0],H2[1]-A[1])/Math.hypot(H[0]-A[0],H[1]-A[1]);
    // rotate by d about the anchor and stretch only along the rope (in the rope's own frame)
    g.save();var th=Math.atan2(H[1]-A[1],H[0]-A[0]);g.translate(A[0],A[1]);g.rotate(d+th);g.scale(k,1);g.rotate(-th);g.translate(-A[0],-A[1]);
    g.drawImage(P.img,P.x,P.y,P.w,P.h);g.restore();}
  function drawPulls(g,a,unit){   // the old man's two pull ropes, from his hand to the dress: taut while pulling, sagging otherwise
    var h=[G.hand[0]+S.rope*5,G.hand[1]+S.rope*9];g.save();g.lineCap='round';
    G.pulls.forEach(function(p0,i){var s=rot(p0,a),mx=(s[0]+h[0])/2,my=(s[1]+h[1])/2,len=Math.hypot(s[0]-h[0],s[1]-h[1]),sag=(1-S.rope)*Math.max(0,len*.09-8)+4;
      g.strokeStyle='rgba(52,34,26,.92)';g.lineWidth=Math.max(unit*1.1,3.4);g.beginPath();g.moveTo(h[0],h[1]);g.quadraticCurveTo(mx,my+sag,s[0],s[1]);g.stroke();
      g.strokeStyle='rgba(150,84,60,.55)';g.lineWidth=Math.max(unit*.5,1.4);g.stroke();});
    g.restore();}
  function drawWoman(g,a){g.save();g.translate(G.pivot[0],G.pivot[1]);g.rotate(a);g.translate(-G.pivot[0],-G.pivot[1]);drawLayer(g,L.low);drawLayer(g,L.woman);g.restore();}
  function shoeOut(){return S.shoe.mode!=='home';}
  function drawSchematic(g,a,unit){   // no layers yet: a rope line + seat dot swinging over the painting
    var seat=rot(center(G.woman),a);g.save();g.strokeStyle='rgba(244,214,190,.85)';g.lineWidth=unit*2;g.setLineDash([unit*6,unit*4]);g.beginPath();g.moveTo(G.pivot[0],G.pivot[1]);g.lineTo(seat[0],seat[1]);g.stroke();
    g.setLineDash([]);g.fillStyle='rgba(240,170,170,.9)';g.beginPath();g.arc(seat[0],seat[1],unit*6,0,Math.PI*2);g.fill();g.restore();}
  function drawGlows(g,unit){['young','old','cupid'].forEach(function(k){var v=S.glow[k];if(k==='cupid'&&S.muted)v=Math.max(v,.8);if(v<=.01)return;var b=G[k],c=center(b),r=Math.max(b[2]-b[0],b[3]-b[1])*.62;
    var gr=g.createRadialGradient(c[0],c[1],r*.15,c[0],c[1],r);gr.addColorStop(0,'rgba(255,236,200,'+(.2*v).toFixed(3)+')');gr.addColorStop(1,'rgba(255,236,200,0)');
    g.save();g.globalCompositeOperation='lighter';g.fillStyle=gr;g.beginPath();g.arc(c[0],c[1],r,0,Math.PI*2);g.fill();g.restore();});}
  function moving(){return Math.abs(S.phi)>1e-4||Math.abs(S.v)>1e-4||S.rope>.001;}
  function scene(g,unit){var a=S.phi,mv=moving();
    if(haveLayers&&ok(L.plate.img)&&ok(L.woman.img)){
      if(mv){var b=sweptBox();drawPart(g,L.plate,b[0],b[1],b[2],b[3]);}
      if(shoeOut()&&L.shoePlate)drawLayer(g,L.shoePlate);
      if(mv){drawPulls(g,a,unit);drawRope(g,L.upL,G.anchorL,G.handL,a);drawRope(g,L.upR,G.anchorR,G.handR,a);drawWoman(g,a);drawLayer(g,L.flowers);if(!shoeOut())drawLayer(g,L.shoe);}}
    else if(mv&&!haveLayers&&layersFailed)drawSchematic(g,a,unit);   // layers.json missing: a schematic rope; layers still decoding: nothing
    drawGlows(g,unit);}
  function idleWall(){return !moving()&&!shoeOut()&&!S.muted&&S.glow.young<.01&&S.glow.old<.01&&S.glow.cupid<.01;}
  function drawWall(){if(!ov)return;var r=artRect(),dpr=Math.min(devicePixelRatio||1,2),w=Math.round(r.width*dpr),h=Math.round(r.height*dpr);
    if(!wallVisible(r)||idleWall()){if(ov.width&&!drawWall.clear){og.setTransform(1,0,0,1,0,0);og.clearRect(0,0,ov.width,ov.height);drawWall.clear=true;}return;}
    if(ov.width!==w||ov.height!==h){ov.width=w;ov.height=h;}
    og.setTransform(1,0,0,1,0,0);og.clearRect(0,0,w,h);var z=w/G.W;og.setTransform(z,0,0,z,0,0);og.imageSmoothingQuality='high';
    scene(og,1/(r.width/G.W));drawWall.clear=false;}
  function drawStage(){if(!wrap.classList.contains('narrow'))return;var dpr=Math.min(devicePixelRatio||1,2),cwid=stage.clientWidth;if(!cwid)return;
    var w=Math.round(cwid*dpr),h=Math.round(w*CROP[3]/CROP[2]);if(stage.width!==w||stage.height!==h){stage.width=w;stage.height=h;}
    sg.setTransform(1,0,0,1,0,0);sg.fillStyle='#1d1f1a';sg.fillRect(0,0,w,h);sg.imageSmoothingQuality='high';
    var z=w/CROP[2];sg.setTransform(z,0,0,z,-CROP[0]*z,-CROP[1]*z);
    if(ok(hung))sg.drawImage(hung,0,0,G.W,G.H);
    scene(sg,1/(cwid/CROP[2]));}
  // the gauge: rope angle on an arc (exaggerated ×2), the reach so far, the shoe mark, and where pulling helps right now
  function tok(n,f){var v=getComputedStyle(host).getPropertyValue(n).trim();return v||f;}
  function drawGauge(){var dpr=Math.min(devicePixelRatio||1,2),cwid=gauge.clientWidth,chei=gauge.clientHeight;if(!cwid||!chei)return;
    var w=Math.round(cwid*dpr),h=Math.round(chei*dpr);if(gauge.width!==w||gauge.height!==h){gauge.width=w;gauge.height=h;}
    var g=gg;g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,cwid,chei);
    var ink2=tok('--ink-2','#d3c8b6'),ink3=tok('--ink-3','#b3a893'),gold=tok('--gold','#b08d57');
    var R=Math.min(chei-24,cwid*.42),cx=cwid/2,cy=10,K=reduce?4:3,amax=MAX*K;
    function P(a,r){return[cx-Math.sin(a)*r,cy+Math.cos(a)*r];}   // a > 0 to the left
    g.lineCap='round';
    // reach arc (±max)
    g.strokeStyle=ink3;g.lineWidth=1;g.beginPath();g.arc(cx,cy,R,Math.PI/2-amax,Math.PI/2+amax);g.stroke();
    // where pulling helps: the swing coming back toward the old man (moving right) — the whole arc glows faintly in gold
    var help=S.v<-.02?clamp(-S.v/(MAX*W0),0,1):0;
    if(help>0){g.strokeStyle=gold;g.globalAlpha=1;g.lineWidth=1+3*help;g.beginPath();g.arc(cx,cy,R,Math.PI/2-amax,Math.PI/2+amax);g.stroke();}
    // reached amplitude so far (both sides)
    var ar=clamp(S.amp,0,MAX)*K;g.strokeStyle=ink2;g.lineWidth=3;g.beginPath();g.arc(cx,cy,R,Math.PI/2-ar,Math.PI/2+ar);g.stroke();
    // shoe mark on the left side
    var sa=SHOE_AT*MAX*K,sp1=P(sa,R-7),sp2=P(sa,R+7);g.strokeStyle='#e7a2a0';g.lineWidth=2;g.beginPath();g.moveTo(sp1[0],sp1[1]);g.lineTo(sp2[0],sp2[1]);g.stroke();
    // labels: 年轻人 (left) · 老先生 (right)
    g.fillStyle=ink2;g.font='400 12.5px '+tok('--song','serif');g.textBaseline='top';
    g.textAlign='left';g.fillText('← '+T.young,0,2);g.textAlign='right';g.fillText(T.old+' →',cwid,2);
    // rope + seat
    var b=P(S.phi*K,R);g.strokeStyle=ink2;g.lineWidth=1.5;g.beginPath();g.moveTo(cx,cy);g.lineTo(b[0],b[1]);g.stroke();
    g.fillStyle=ink2;g.beginPath();g.arc(cx,cy,2.5,0,Math.PI*2);g.fill();
    g.fillStyle='#e9b4ae';g.beginPath();g.arc(b[0],b[1],7,0,Math.PI*2);g.fill();
    // the old man's rope: from the seat to the right edge, taut while pulling
    var hx=cwid-2,hy=cy+R*.62+S.rope*10,mx=(b[0]+hx)/2,my=(b[1]+hy)/2+(1-S.rope)*14;
    g.strokeStyle=S.rope>.02?gold:ink3;g.lineWidth=S.rope>.02?2:1;g.setLineDash(S.rope>.02?[]:[3,3]);g.beginPath();g.moveTo(b[0],b[1]);g.quadraticCurveTo(mx,my,hx,hy);g.stroke();g.setLineDash([]);}

  // ---------- sound (recorded if the room's sound designer provides it, else synthesised); silent while the cupid hushes
  function recName(re){var s=(window.EH_AUDIO&&EH_AUDIO.sfx)||{};return Object.keys(s).filter(function(k){return s[k].room==='rococo'&&re.test(k);})[0]||null;}
  var REC={rope:recName(/rope|creak|pull/),swish:recName(/swish|whoosh|swing/),shoe:recName(/shoe|kick|toss/),land:recName(/land|drop|thud/),catch_:recName(/catch|grab/)};
  function snd(kind,v,fb){if(S.muted)return;var n=REC[kind];if(n&&api.sfx.play){var h=api.sfx.play(n,{v:v});if(h)return;}fb&&fb();}

  // ---------- pull input
  var PULLPX=90;
  function ropeTo(t){t=clamp(t,0,1);S.ropeT=t;}
  function startPull(){if(!S.hold){S.hold=true;snd('rope',.7,function(){api.sfx.puff(.035,.3);});}pullBtn.setAttribute('aria-pressed','true');}
  function endPull(){S.hold=false;pullBtn.setAttribute('aria-pressed','false');}
  // drag on a surface: the rope follows the pointer's downward travel (up to PULLPX); only downward travel pushes the swing
  function dStart(e,where){if(e.button!=null&&e.button!==0&&e.pointerType==='mouse')return false;drag={id:e.pointerId,where:where,y0:e.clientY,x0:e.clientX,base:S.rope,moved:false,lastY:e.clientY};return true;}
  function dMove(e){if(!drag||e.pointerId!==drag.id)return;var dy=e.clientY-drag.y0;if(Math.abs(dy)>5||Math.abs(e.clientX-drag.x0)>5){if(!drag.moved){drag.moved=true;S.drag=true;if(dy>0)snd('rope',.7,function(){api.sfx.puff(.03,.3);});}}
    if(drag.moved){var tgt=clamp(drag.base+dy/PULLPX,0,1);if(tgt<S.ropeT-.001||e.clientY<drag.lastY){/* going up re-arms the stroke */drag.base=tgt-dy/PULLPX;}ropeTo(tgt);}
    drag.lastY=e.clientY;dirty=true;}
  function dEnd(e){if(!drag||(e&&e.pointerId!==drag.id))return null;var d=drag;drag=null;S.drag=false;ropeTo(0);return d;}

  // wall: capture phase on the frame so the painting's own click (open the viewer) does not fire after a drag or on a figure
  function toMain(x,y,where){if(where==='stage'){var rc=stage.getBoundingClientRect(),z=rc.width/CROP[2];return[CROP[0]+(x-rc.left)/z,CROP[1]+(y-rc.top)/z];}
    var r=artRect();return[(x-r.left)*G.W/r.width,(y-r.top)*G.W/r.width];}
  function wallDown(e){suppress=false;if(!ov)return;var r=artRect();if(!wallVisible(r))return;if(dStart(e,'wall')){e.stopPropagation();try{frameEl.setPointerCapture(e.pointerId);}catch(_){}}}
  function wallMove(e){if(drag&&drag.where==='wall'){dMove(e);e.stopPropagation();return;}
    if(!cw||e.pointerType!=='mouse')return;var r=artRect();if(!wallVisible(r)){cw.style.cursor=cwCursor;hover(null,'wall');return;}
    var f=figAt(toMain(e.clientX,e.clientY,'wall'),12);cw.style.cursor=f?'pointer':'grab';hover(f,'wall');}
  function wallUp(e){if(drag&&drag.where==='wall'){var d=dEnd(e);e.stopPropagation();if(d&&d.moved){suppress=true;return;}
      var f=figAt(toMain(e.clientX,e.clientY,'wall'),12);if(f){tell(f);suppress=true;}}}
  function wallClick(e){if(suppress){suppress=false;e.stopPropagation();e.preventDefault();}}
  function wallLeave(){hover(null,'wall');if(cw)cw.style.cursor=cwCursor;}
  if(frameEl){frameEl.addEventListener('pointerdown',wallDown,true);frameEl.addEventListener('pointermove',wallMove,true);frameEl.addEventListener('pointerup',wallUp,true);
    frameEl.addEventListener('pointercancel',wallUp,true);frameEl.addEventListener('click',wallClick,true);frameEl.addEventListener('pointerleave',wallLeave);}
  // stage (narrow close-up): mouse/pen drags pull, touch keeps vertical scrolling (pan-y) and taps figures
  stage.addEventListener('pointerdown',function(e){if(e.pointerType==='touch'){drag=null;stage._tap={x:e.clientX,y:e.clientY,id:e.pointerId};return;}
    if(dStart(e,'stage')){stage.setPointerCapture(e.pointerId);stage.classList.add('drag');e.preventDefault();}});
  stage.addEventListener('pointermove',function(e){if(drag&&drag.where==='stage'){dMove(e);return;}if(e.pointerType==='mouse')hover(figAt(toMain(e.clientX,e.clientY,'stage'),12),'stage');});
  function stageUp(e){if(e.pointerType==='touch'){var t=stage._tap;stage._tap=null;if(t&&e.type==='pointerup'&&Math.hypot(e.clientX-t.x,e.clientY-t.y)<10){var f=figAt(toMain(e.clientX,e.clientY,'stage'),24);if(f)tell(f);}return;}
    var d=dEnd(e);stage.classList.remove('drag');if(d&&!d.moved){var f2=figAt(toMain(e.clientX,e.clientY,'stage'),12);if(f2)tell(f2);}}
  stage.addEventListener('pointerup',stageUp);stage.addEventListener('pointercancel',stageUp);
  stage.addEventListener('pointerleave',function(){hover(null,'stage');});
  // the 拉绳 control: press-and-hold pulls; dragging down on it pulls by the distance travelled
  pullBtn.addEventListener('pointerdown',function(e){if(e.button!=null&&e.button!==0&&e.pointerType==='mouse')return;e.preventDefault();try{pullBtn.setPointerCapture(e.pointerId);}catch(_){}
    pullBtn._p={id:e.pointerId,y0:e.clientY};startPull();});
  pullBtn.addEventListener('pointermove',function(e){var p=pullBtn._p;if(!p||p.id!==e.pointerId)return;var dy=e.clientY-p.y0;if(dy>6){p.dragged=true;}});
  function pullUp(e){var p=pullBtn._p;if(!p||(e&&p.id!==e.pointerId))return;pullBtn._p=null;endPull();}
  pullBtn.addEventListener('pointerup',pullUp);pullBtn.addEventListener('pointercancel',pullUp);pullBtn.addEventListener('lostpointercapture',pullUp);
  pullBtn.addEventListener('contextmenu',function(e){e.preventDefault();});
  pullBtn.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '||e.key==='ArrowDown'){e.preventDefault();e.stopPropagation();if(!e.repeat&&!S.pullKey){S.pullKey=true;startPull();}}});
  pullBtn.addEventListener('keyup',function(e){if(e.key==='Enter'||e.key===' '||e.key==='ArrowDown'){e.preventDefault();if(S.pullKey){S.pullKey=false;endPull();}}});
  pullBtn.addEventListener('blur',function(){if(S.pullKey){S.pullKey=false;endPull();}});
  pullBtn.addEventListener('click',function(e){e.preventDefault();});

  // ---------- stories
  function tell(k){if(!STORY[k])return;S.focus=k;S.glow[k]=1;Object.keys(figBtns).forEach(function(n){figBtns[n].setAttribute('aria-pressed',n===k?'true':'false');});
    storyEl.innerHTML='';var h=document.createElement('p');h.className='sw-who';h.textContent=T[k];var p=document.createElement('p');p.textContent=nb(STORY[k]);storyEl.appendChild(h);storyEl.appendChild(p);
    if(!S.muted)api.sfx.tick(.03);if(k==='cupid'&&touchUI()){S.muteUntil=performance.now()+4000;}dirty=true;}
  Object.keys(figBtns).forEach(function(k){figBtns[k].addEventListener('click',function(){tell(k);});});

  // ---------- the cupid hushes the page while the pointer is over him
  var hoverWhere={wall:null,stage:null};
  function hover(f,where){hoverWhere[where]=f;}
  function updateMute(now){var want=hoverWhere.wall==='cupid'||hoverWhere.stage==='cupid'||now<S.muteUntil;
    if(want!==S.muted){S.muted=want;muteEl.hidden=!want;dirty=true;if(api.sfx.hush)api.sfx.hush(want);}   // whole page, loops included
    if(S.muted&&!api.sfx.hush&&api.sfx.duck&&(!updateMute.t||now-updateMute.t>200)){api.sfx.duck(1,.35);updateMute.t=now;}}

  // ---------- the shoe (a page-level element)
  var shoeEl=document.createElement('div');shoeEl.className='sw-shoe';shoeEl.setAttribute('aria-hidden','true');var shoeCv=document.createElement('canvas');shoeEl.appendChild(shoeCv);document.body.appendChild(shoeEl);
  var shoeDrawnFor='';
  function shoeScale(){var r=artRect();if(wallVisible(r))return r.width/G.W;var rc=stage.getBoundingClientRect();return rc.width?rc.width/CROP[2]:.2;}
  function paintShoe(){var sc=Math.max(shoeScale(),.6),b=G.shoe,w=(b[2]-b[0])*sc,h=(b[3]-b[1])*sc,dpr=Math.min(devicePixelRatio||1,2),key=w.toFixed(1)+'x'+h.toFixed(1)+(L.shoe&&ok(L.shoe.img));
    if(key===shoeDrawnFor)return;shoeDrawnFor=key;shoeCv.width=Math.max(1,Math.round(w*dpr));shoeCv.height=Math.max(1,Math.round(h*dpr));shoeCv.style.width=w+'px';shoeCv.style.height=h+'px';
    var g=shoeCv.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,shoeCv.width,shoeCv.height);
    if(L.shoe&&ok(L.shoe.img)){var Sx=L.shoe;g.drawImage(Sx.img,(b[0]-Sx.x)*Sx.img.naturalWidth/Sx.w,(b[1]-Sx.y)*Sx.img.naturalHeight/Sx.h,(b[2]-b[0])*Sx.img.naturalWidth/Sx.w,(b[3]-b[1])*Sx.img.naturalHeight/Sx.h,0,0,shoeCv.width,shoeCv.height);}
    else if(ok(hung)){g.drawImage(hung,b[0],b[1],b[2]-b[0],b[3]-b[1],0,0,shoeCv.width,shoeCv.height);}}
  function homeScreen(){var c=center(G.shoe),r=artRect();if(wallVisible(r))return[r.left+c[0]*r.width/G.W,r.top+c[1]*r.width/G.W];
    var rc=stage.getBoundingClientRect(),z=rc.width/CROP[2];return[rc.left+(c[0]-CROP[0])*z,rc.top+(c[1]-CROP[1])*z];}
  function footScreen(){var f=rot(G.foot,S.phi),r=artRect();if(wallVisible(r))return[r.left+f[0]*r.width/G.W,r.top+f[1]*r.width/G.W];
    var rc=stage.getBoundingClientRect(),z=rc.width/CROP[2];return[rc.left+(f[0]-CROP[0])*z,rc.top+(f[1]-CROP[1])*z];}
  function launch(){var sh=S.shoe,p=footScreen(),k=reduce?.55:1,sc=clamp(innerHeight/800,.6,1.4);
    sh.mode='fly';sh.x=p[0];sh.y=p[1];sh.vx=-(420+Math.random()*260)*k*sc;sh.vy=-(760+Math.random()*220)*k*sc;sh.a=0;sh.va=reduce?-1.5:-(7+Math.random()*5);sh.t=0;
    paintShoe();shoeEl.classList.add('on');snd('shoe',.8,function(){api.sfx.whoosh(.06,.6);});dirty=true;}
  function shoeRest(){var sh=S.shoe;sh.mode='rest';sh.t=0;}
  function stepShoe(dt,now){var sh=S.shoe;if(sh.mode==='home')return;var Wv=innerWidth,Hv=innerHeight,m=24,floor=Hv-m,bar=document.querySelector('.foot');if(bar){var br=bar.getBoundingClientRect();if(br.height&&br.top>Hv*.5)floor=Math.min(floor,br.top-30);}
    if(sh.mode==='fly'){var gA=reduce?1100:1800;sh.vy+=gA*dt;sh.x+=sh.vx*dt;sh.y+=sh.vy*dt;sh.a+=sh.va*dt;
      if(sh.x<m){sh.x=m;sh.vx=Math.abs(sh.vx)*.5;sh.va*=-.6;}if(sh.x>Wv-m){sh.x=Wv-m;sh.vx=-Math.abs(sh.vx)*.5;sh.va*=-.6;}
      if(sh.y<m){sh.y=m;sh.vy=Math.abs(sh.vy)*.4;}
      if(sh.y>floor){sh.y=floor;var imp=Math.abs(sh.vy);if(imp>260)snd('land',clamp(imp/2400,.2,.9),function(){api.sfx.thud(clamp(imp/9000,.03,.14));});
        sh.vy=-imp*.36;sh.vx*=.72;sh.va*=.55;if(imp<220){sh.vy=0;sh.vx*=Math.exp(-8*dt);sh.va=0;if(Math.abs(sh.vx)<12)shoeRest();}}}
    else if(sh.mode==='rest'){sh.t+=dt;var la=((sh.a%(2*Math.PI))+3*Math.PI)%(2*Math.PI)-Math.PI;sh.a=la*(1-Math.min(1,dt*4));if(sh.t>6){sh.mode='back';sh.t=0;sh.from=[sh.x,sh.y,sh.a];}}
    else if(sh.mode==='back'){sh.t+=dt/(reduce?1.6:1.2);var u=sm(sh.t),h=homeScreen(),f=sh.from,cx=(f[0]+h[0])/2,cy=Math.min(f[1],h[1])-Math.min(260,Math.abs(f[0]-h[0])*.35+80);
      sh.x=(1-u)*(1-u)*f[0]+2*(1-u)*u*cx+u*u*h[0];sh.y=(1-u)*(1-u)*f[1]+2*(1-u)*u*cy+u*u*h[1];sh.a=f[2]*(1-u);
      if(sh.t>=1){sh.mode='home';shoeEl.classList.remove('on');dirty=true;}}
    if(sh.mode!=='home')shoeEl.style.transform='translate('+(sh.x-28).toFixed(1)+'px,'+(sh.y-28).toFixed(1)+'px) rotate('+sh.a.toFixed(3)+'rad)';}
  // catch and throw
  shoeEl.addEventListener('pointerdown',function(e){var sh=S.shoe;if(sh.mode==='home')return;e.preventDefault();e.stopPropagation();try{shoeEl.setPointerCapture(e.pointerId);}catch(_){}
    sh.mode='held';sh.grab={id:e.pointerId,dx:sh.x-e.clientX,dy:sh.y-e.clientY};sh.samples=[[performance.now(),e.clientX,e.clientY]];shoeEl.classList.add('held');snd('catch_',.6,function(){api.sfx.tick(.04);});});
  shoeEl.addEventListener('pointermove',function(e){var sh=S.shoe;if(sh.mode!=='held'||!sh.grab||sh.grab.id!==e.pointerId)return;sh.x=clamp(e.clientX+sh.grab.dx,0,innerWidth);sh.y=clamp(e.clientY+sh.grab.dy,0,innerHeight);
    var now=performance.now();sh.samples.push([now,e.clientX,e.clientY]);while(sh.samples.length>2&&now-sh.samples[0][0]>90)sh.samples.shift();
    shoeEl.style.transform='translate('+(sh.x-28).toFixed(1)+'px,'+(sh.y-28).toFixed(1)+'px) rotate('+sh.a.toFixed(3)+'rad)';});
  function shoeUp(e){var sh=S.shoe;if(sh.mode!=='held'||!sh.grab||(e&&sh.grab.id!==e.pointerId))return;sh.grab=null;shoeEl.classList.remove('held');
    var s=sh.samples,a=s[0],b=s[s.length-1],dt=Math.max((b[0]-a[0])/1000,.016);sh.vx=clamp((b[1]-a[1])/dt,-3200,3200);sh.vy=clamp((b[2]-a[2])/dt,-3200,3200);
    sh.va=reduce?sh.vx/1600:sh.vx/260;sh.mode='fly';if(Math.hypot(sh.vx,sh.vy)>600)snd('shoe',.5,function(){api.sfx.whoosh(.04,.45);});}
  shoeEl.addEventListener('pointerup',shoeUp);shoeEl.addEventListener('pointercancel',shoeUp);
  addEventListener('resize',onResize);function onResize(){shoeDrawnFor='';dirty=true;var sh=S.shoe;if(sh.mode!=='home'){sh.x=clamp(sh.x,24,innerWidth-24);sh.y=clamp(sh.y,24,innerHeight-24);}}

  // ---------- physics step
  function step(dt,now){
    // rope: follows its target; holding the control draws it in over ≈ .45 s, letting go pays it out over ≈ .35 s
    if(S.hold)S.ropeT=Math.min(1,S.ropeT+dt/.45);else if(!S.drag)S.ropeT=0;
    var prev=S.rope,nr=S.ropeT>prev?Math.min(S.ropeT,prev+dt/.12):Math.max(S.ropeT,prev-dt/.35);S.rope=nr;
    var pull=Math.max(0,nr-prev);                                   // only drawing the rope in pushes the swing (toward the old man: −)
    var n=Math.max(1,Math.ceil(dt/.004)),h=dt/n;
    var E0=Math.sqrt(S.phi*S.phi+(S.v/W0)*(S.v/W0)),z=(E0<.012&&!S.hold&&S.rope<.001)?ZETA*5:ZETA;   // settle quickly once the swing is almost still
    for(var i=0;i<n;i++){var acc=-W0*W0*Math.sin(S.phi)-2*z*W0*S.v;S.v+=acc*h-DV*pull/n;S.phi+=S.v*h;}
    // cap the energy at the maximum swing
    var E=Math.sqrt(S.phi*S.phi+(S.v/W0)*(S.v/W0));if(E>MAX){var k=MAX/E;S.phi*=k;S.v*=k;E=MAX;}
    S.amp=Math.max(E,S.amp*Math.exp(-dt*.25),0);if(E<S.amp)S.amp=Math.max(E,S.amp-dt*MAX*.12);
    if(E<.001&&S.rope<.001&&!S.hold){S.phi=0;S.v=0;}
    // left turn (moving left → turning back) high enough: the shoe flies
    if(S.prevV>0&&S.v<=0&&S.phi>0&&E>=SHOE_AT*MAX&&S.shoe.mode==='home'&&(wallVisible()||wrap.classList.contains('narrow')))launch();
    // a swish at the bottom of each swing, louder with height
    var side=S.phi>0?1:-1;if(side!==lastSide&&E>.3*MAX&&now-lastWhoosh>600){lastWhoosh=now;snd('swish',clamp(E/MAX,.3,1)*.7,function(){api.sfx.whoosh(.012+.03*E/MAX,.7);});}lastSide=side;
    S.prevV=S.v;
    ['young','old','cupid'].forEach(function(k){if(S.glow[k]>0){S.glow[k]=Math.max(0,S.glow[k]-dt/(reduce?.8:2.2));}});}

  // ---------- loop
  var lastHint='',lastAmp='';
  function tick(now){if(dead)return;raf=requestAnimationFrame(tick);if(!host.isConnected){dispose();return;}
    var dt=last?Math.min((now-last)/1000,.05):0;last=now;
    var r=artRect(),wv=wallVisible(r);wrap.classList.toggle('narrow',!wv);
    var was=moving()||S.glow.young+S.glow.old+S.glow.cupid>0;step(dt,now);stepShoe(dt,now);updateMute(now);
    var key=r.left.toFixed(1)+r.top.toFixed(1)+r.width.toFixed(1)+stage.clientWidth+gauge.clientWidth+(wv?1:0);if(key!==tick.k){tick.k=key;dirty=true;shoeDrawnFor='';}
    if(was||moving()||S.shoe.mode==='back'||dirty){drawWall();drawStage();dirty=false;}
    drawGauge();
    // the rope in the 拉绳 control
    var ry=S.rope*10;ropeEl.setAttribute('d','M9 0 V'+(38+ry).toFixed(1));knotEl.setAttribute('cy',(44+ry).toFixed(1));
    var ad=Math.round(S.amp/D2R),at=T.amp+' '+ad+'°';if(at!==lastAmp){ampEl.textContent=nb(at);lastAmp=at;}
    var tch=touchUI(),hv=S.shoe.mode!=='home'?(tch?T.shoeTouch:T.shoe):(wv?T.hintWall:(tch?T.hintTouch:T.hint));if(hv!==lastHint){hintEl.textContent=nb(hv);lastHint=hv;}}
  raf=requestAnimationFrame(tick);
  hung.addEventListener&&!ok(hung)&&hung.addEventListener('load',function(){dirty=true;},{once:true});
  // first story hint below the buttons
  if(!HO)(function(){var p=document.createElement('p');p.className='small';p.textContent=nb(touchUI()?T.figsTouch:T.figs);storyEl.appendChild(p);})();

  function dispose(){if(S.muted&&api.sfx.hush)api.sfx.hush(false);if(dead)return;dead=true;cancelAnimationFrame(raf);clearTimeout(pollT);
    if(ov&&ov.parentNode)ov.parentNode.removeChild(ov);if(shoeEl.parentNode)shoeEl.parentNode.removeChild(shoeEl);
    if(cw){cw.style.touchAction=cwTouch;cw.style.cursor=cwCursor;}removeEventListener('resize',onResize);
    if(frameEl){frameEl.removeEventListener('pointerdown',wallDown,true);frameEl.removeEventListener('pointermove',wallMove,true);frameEl.removeEventListener('pointerup',wallUp,true);
      frameEl.removeEventListener('pointercancel',wallUp,true);frameEl.removeEventListener('click',wallClick,true);frameEl.removeEventListener('pointerleave',wallLeave);}}
  host._dispose=dispose;
  // test hooks
  if(EH.debug)EH.debug.swing={S:S,G:G,L:L,layers:function(){return haveLayers;},set:function(phi,v){S.phi=phi*D2R;S.v=(v||0)*D2R;S.prevV=S.v;S.amp=Math.abs(S.phi);dirty=true;},launch:launch,tell:tell,
    pump:function(on){if(on)startPull();else endPull();},hover:function(f){hover(f,'wall');},MAX:MAX};
});
})();

;
/* Special exhibit "wanderer" (浪漫主义 · 《雾海上的漫游者》).
   1. 闭上眼: press and hold the button (or hold on the hung painting, or hold Enter / Space on the focused button). The screen fades
      to black and only a breath is heard (a recorded breath if the sound designer lists one for the room, else a soft synthesised one;
      the music is ducked). On release the painting appears at its clearest (sharp, above the room's fog), Friedrich's words from
      room.special.quote fade in on the wall beside it and out again, then the room comes back. A plain click (screen readers) blinks
      for three seconds. On narrow screens, where the reading panel hides the painting, the reveal lays the painting out itself.
   2. 层层后退: a small depth viewer in the panel built from the four cut layers in rooms/romanticism/cut/layers.json (polled; tolerant
      reader). Drag (or arrow keys on the focused viewer, which is a role="slider" so the core leaves the keys alone) to look around
      the summit; nearer layers move more. 环顾 plays one slow look-around. Without layers the viewer shows the flat painting.
   The fog "wind" cursor is the room transition's rest effect; nothing here duplicates it. window.EH_ROMANTICISM.eyes tells the rest
   effect whether the visitor's eyes are 'closed' / 'open' (reveal on screen) / '' — optional to read. */
(function(){
'use strict';
if(!window.EH||!EH.special)return;

function clamp(x,a,b){return x<a?a:x>b?b:x;}
function lerp(a,b,t){return a+(b-a)*t;}
function seg(t,a,b){return clamp((t-a)/(b-a),0,1);}
function eio(x){x=clamp(x,0,1);return x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2;}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function nb(t){return String(t==null?'':t).replace(/([㐀-鿿）》”]) (?=[0-9A-Za-z])/g,'$1 ').replace(/([0-9A-Za-z.%°]) (?=[㐀-鿿（《“])/g,'$1 ');}
function tx(t){return nb(esc(t)).replace(/(《[^》]{1,16}》|（[^）]{1,14}）|“[^”]{1,8}”)[，。、；：]?/g,function(m){return '<span class="nw">'+m+'</span>';});}
function $(id){return document.getElementById(id);}
function ok(i){return i&&i.complete&&i.naturalWidth>0;}
function xhrJSON(url,cb){try{var x=new XMLHttpRequest();x.open('GET',url+'?t='+Date.now(),true);x.overrideMimeType('application/json');
  x.onload=function(){if(x.status===200||(x.status===0&&x.responseText)){try{cb(JSON.parse(x.responseText));}catch(e){cb(null);}}else cb(null);};
  x.onerror=function(){cb(null);};x.send();}catch(e){cb(null);}}

// Friedrich, c. 1830 ("Äußerungen bei Betrachtung einer Sammlung von Gemählden …"); used only if room.special.quote is missing
var FALLBACK_Q={zh:'闭上你肉体的眼睛，好先用心灵的眼睛看见你的画。然后把你在黑暗中看见的，带到光亮里来。',
  de:'Schließe dein leibliches Auge, damit du mit dem geistigen Auge zuerst sehest dein Bild.',src:'卡斯帕·大卫·弗里德里希，约 1830 年'};

function readQuote(q,room){
  var o={zh:'',de:'',src:''};
  if(typeof q==='string')o.zh=q;
  else if(Array.isArray(q)){o.zh=q[0]||'';o.src=q[1]||'';o.de=q[2]||'';}
  else if(q&&typeof q==='object'){o.zh=q.zh||q.text||q.t||q.quote||'';o.de=q.de||q.orig||q.original||q.german||'';o.src=q.src||q.source||q.by||q.cite||'';}
  if(!o.zh){var rq=room.quote;if(Array.isArray(rq)&&/弗里德里希|Friedrich/.test(String(rq[1]||''))&&/眼/.test(String(rq[0]||''))){o.zh=rq[0];o.src=rq[1];}}
  if(!o.zh)return Object.assign({},FALLBACK_Q);
  return o;}

// ---------------------------------------------------------------- layers.json: tolerant reader → [{img file, x,y,w,h (main px), label, f}] back → front
function parseLayers(j,art){
  if(!j)return null;var list=Array.isArray(j)?j:(j.layers||j.planes||j.items||null);
  if(!list&&typeof j==='object'){list=[];Object.keys(j).forEach(function(k){var v=j[k];if(v&&typeof v==='object'&&!Array.isArray(v)&&(v.file||v.img||v.src))list.push(Object.assign({id:k},v));});}
  if(!list||!list.length)return null;
  var SW=+(j.W||j.w||j.width||(j.space&&(j.space.w||j.space.W))||art.w)||art.w,k=art.w/SW;
  var out=list.map(function(L,i){if(typeof L==='string')L={file:L};var f=L.file||L.img||L.src||L.path;if(!f)return null;
    var b=Array.isArray(L.box)&&L.box.length===4?L.box:null;
    var x=L.x!=null?+L.x:(b?b[0]:0),y=L.y!=null?+L.y:(b?b[1]:0),w=L.w!=null?+L.w:(b?b[2]-b[0]:null),h=L.h!=null?+L.h:(b?b[3]-b[1]:null);
    var ord=L.z!=null?+L.z:(L.order!=null?+L.order:(L.index!=null?+L.index:i));
    return{file:f,x:x*k,y:y*k,w:w==null?null:w*k,h:h==null?null:h*k,label:L.label||L.zh||L.name||'',id:String(L.id||L.name||f),ord:ord,i:i,
      depth:L.depth!=null?+L.depth:null,f:L.parallax!=null?+L.parallax:null};}).filter(Boolean);
  if(!out.length)return null;
  // draw order: explicit z/order ascending (back → front) or list order. When every layer has a 'depth', its direction is read from the
  // list (a list sorted by rising depth means 0 = back, as in rooms/romanticism/cut/layers.json); layers sharing a depth move together.
  out.sort(function(a,b){return a.ord-b.ord||a.i-b.i;});
  var hasD=out.every(function(L){return L.depth!=null&&isFinite(L.depth);});
  if(hasD){var up=true,down=true;for(var q=1;q<out.length;q++){if(out[q].depth<out[q-1].depth)up=false;if(out[q].depth>out[q-1].depth)down=false;}
    var front=up||!down?1:-1;out.forEach(function(L){L.lv=L.depth*front;});out.sort(function(a,b){return a.lv-b.lv||a.ord-b.ord||a.i-b.i;});}
  else out.forEach(function(L,i){L.lv=i;});
  var lvls=[];out.forEach(function(L){if(lvls.indexOf(L.lv)<0)lvls.push(L.lv);});
  // parallax factor per depth level: back 0.16 … front 1 unless given
  var n=lvls.length;out.forEach(function(L){if(L.f==null||!isFinite(L.f))L.f=n===1?1:lerp(.3,1,Math.pow(lvls.indexOf(L.lv)/(n-1),.85));L.rank=lvls.indexOf(L.lv);});
  // legend groups (front → back), without synthetic helper layers
  out.groups=lvls.slice().reverse().map(function(v){return out.filter(function(L){return L.lv===v&&L.label&&!/合成|延伸|_ext|ext$/i.test(L.label+' '+L.id);})
    .map(function(L){return String(L.label).replace(/（[^）]*）|\([^)]*\)/g,'').trim();}).filter(Boolean).join('与');}).filter(Boolean);
  return out;}

// ---------------------------------------------------------------- styles
function css(){if($('s-wanderer-css'))return;var s=document.createElement('style');s.id='s-wanderer-css';s.textContent=
  '.wd{margin-top:16px}'+
  '.wd h4{margin:22px 0 4px;font:500 15px/1.6 var(--song);letter-spacing:.04em}.wd h4:first-child{margin-top:4px}'+
  '.wd .acts{margin:2px 0 0}.wd .act{min-width:44px;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;touch-action:manipulation;text-align:left}.wd .act:disabled{color:var(--ink-3);cursor:default;text-decoration-style:dotted}'+
  '.wd-eyes[aria-pressed="true"]{font-weight:500;text-decoration-thickness:2px}'+
  '.wd-hint{margin:4px 0 0!important;font-size:13.5px!important;color:var(--ink-2)}'+
  '.wd-view{position:relative;width:min(100%,56vh,520px);margin:10px 0 0}'+
  '.wd-depth{display:block;width:100%;height:auto;aspect-ratio:1/1;max-width:100%;touch-action:pan-y;cursor:grab;background:#8d9097;box-shadow:0 18px 40px -22px rgba(0,0,0,.7)}'+
  '.wd-depth.drag{cursor:grabbing}.wd-depth:focus-visible{outline:1px solid currentColor;outline-offset:4px}'+
  '.wd-meta{display:flex;flex-wrap:wrap;justify-content:space-between;gap:2px 20px;margin:10px 0 0;font:400 13.5px/1.7 var(--song);color:var(--ink-2)}'+
  '.wd-legend{color:var(--ink-3)}'+
  '.wd-note{margin:6px 0 0!important;font-size:13px!important;color:var(--ink-3)}'+
  '@media (max-width:560px){.wd-meta{flex-direction:column}.wd-view{width:100%}}'+
  // the eyes-closed overlay: above the room (and its fog layers), below the viewer
  '.wd-eye{position:fixed;inset:0;z-index:35;display:none;overflow:hidden;cursor:default;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none}'+
  '.wd-eye.on{display:block}'+
  '.wd-eye>*{position:absolute}'+
  '.wd-wall{inset:0}'+
  '.wd-art{display:block;left:0;top:0;will-change:filter,opacity}'+
  '.wd-q{margin:0;max-width:30em;font:300 clamp(17px,.9vw + 9px,24px)/1.95 var(--song);letter-spacing:.04em;text-wrap:pretty;line-break:strict}'+
  '.wd-q p{margin:0}'+
  '.wd-q .de{display:block;margin-top:14px;font:italic 400 clamp(14px,.4vw + 10px,17px)/1.6 var(--didone);letter-spacing:.01em}'+
  '.wd-q.short .de{display:none}.wd-q small{display:block;margin-top:12px;font:400 13px/1.6 var(--song);letter-spacing:.06em}'+
  '.wd-black{inset:0;background:#000}'+
  '.wd-shut{left:0;right:0;bottom:calc(40px + env(safe-area-inset-bottom,0px));margin:0;text-align:center;font:400 13px/1.6 var(--song);letter-spacing:.3em;color:#9d9381}';
  document.head.appendChild(s);}

EH.special('wanderer',function(host,room,api){
  css();
  var sp=room.special||{},art=room.art||{w:1871,h:2400},AW=art.w||1871,AH=art.h||2400;
  var touch=matchMedia('(hover:none)').matches,reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var Q=readQuote(sp.quote,room);
  var T={
    eyesHead:sp.eyesTitle||'闭上眼',depthHead:sp.depthTitle||'一层层退向远方',
    eyes:sp.eyesLabel||'闭上眼（按住）',look:sp.lookLabel||'环顾',
    hintWall:sp.hintWall||'按住按钮或墙上的画，屏幕会暗下去；松开时，睁开眼。',
    hint:sp.hint||'按住按钮，屏幕会暗下去；松开时，睁开眼。',
    hintKeys:'也可以按住回车键。',
    shut:sp.shutHint||'松开，睁开眼',
    dHint:sp.depthHint||'拖动画面，在峰顶四处看看。',dHintKeys:'聚焦后也可以用方向键。',dHintTouch:sp.depthHintTouch||'左右拖动画面，在峰顶四处看看。',
    dNote:sp.depthNote||'四层是本展从原画中拆出来的，被遮住的地方由我们补画。拖动时近处的层移得多、远处的移得少，只为让前后层次看得清楚，不是画家的做法。',
    dWait:'分层还在制作，暂时只能看平面的原画。'
  };
  // ---------------------------------------------------------------- DOM (panel)
  var wrap=document.createElement('div');wrap.className='wd';
  wrap.innerHTML='<div class="acts"><button type="button" class="act wd-eyes" aria-pressed="false"></button></div>'+
    '<p class="wd-hint" aria-live="off"></p>'+
    '<h4>'+tx(T.depthHead)+'</h4>'+
    '<div class="wd-view"><canvas class="wd-depth" tabindex="0" role="slider" aria-valuemin="-100" aria-valuemax="100" aria-valuenow="0"></canvas></div>'+
    '<div class="wd-meta"><span class="wd-dhint"></span><span class="wd-legend"></span></div>'+
    '<div class="acts"><button type="button" class="act wd-look" aria-pressed="false"></button></div>'+
    '<p class="wd-note"></p>';
  host.appendChild(wrap);
  var bEyes=wrap.querySelector('.wd-eyes'),hintEl=wrap.querySelector('.wd-hint'),cv=wrap.querySelector('.wd-depth'),cg=cv.getContext('2d'),
      dHintEl=wrap.querySelector('.wd-dhint'),legEl=wrap.querySelector('.wd-legend'),bLook=wrap.querySelector('.wd-look'),noteEl=wrap.querySelector('.wd-note');
  bEyes.textContent=T.eyes;bLook.textContent=T.look;
  bEyes.setAttribute('aria-label','闭上眼：按住时屏幕变黑，松开时重新看这幅画，墙上会出现弗里德里希的一句话');
  cv.setAttribute('aria-label','景深查看器：左右拖动或用方向键，在峰顶四处看看');
  dHintEl.textContent=touch?T.dHintTouch:T.dHint+T.dHintKeys;

  // ---------------------------------------------------------------- the overlay (outside #room, so it sits above the room's fog layers)
  var eye=document.createElement('div');eye.className='wd-eye';eye.setAttribute('aria-hidden','true');
  eye.innerHTML='<div class="wd-wall"></div><canvas class="wd-art"></canvas><div class="wd-q" role="status"></div><div class="wd-black"></div><p class="wd-shut"></p>';
  document.body.appendChild(eye);
  var eWall=eye.querySelector('.wd-wall'),eArt=eye.querySelector('.wd-art'),eQ=eye.querySelector('.wd-q'),eBlack=eye.querySelector('.wd-black'),eShut=eye.querySelector('.wd-shut');
  eShut.textContent=T.shut;
  eQ.innerHTML='<p>“'+tx(Q.zh)+'”'+(Q.de?'<span class="de" lang="de">'+esc(Q.de)+'</span>':'')+(Q.src?'<small>'+tx(Q.src)+'</small>':'')+'</p>';
  var main=api.img(art.img||'main.webp');
  var R_=window.EH_ROMANTICISM=window.EH_ROMANTICISM||{};R_.eyes='';

  // ---------------------------------------------------------------- breath
  var AC2=null;function breathCtx(){if(AC2)return AC2;try{AC2=new (window.AudioContext||window.webkitAudioContext)();}catch(e){AC2=null;}return AC2;}
  var recBreath=(function(){var S=(window.EH_AUDIO&&EH_AUDIO.sfx)||{},pick=sp.breath&&S[sp.breath]?sp.breath:null;
    if(!pick)Object.keys(S).some(function(k){if((S[k].room==='romanticism'||/^rom/.test(k))&&/breath|呼吸/i.test(k)){pick=k;return true;}return false;});return pick;})();
  var breathLoop=null,breathT=0,breathN=0;
  function soundOn(){var b=$('sound');return !(b&&b.getAttribute('aria-pressed')==='true');}
  function synthBreath(inhale,v){var A=breathCtx();if(!A||!soundOn())return;if(A.state==='suspended')A.resume();var t=A.currentTime+.02,d=inhale?1.7:2.3;
    var n=Math.ceil(A.sampleRate*(d+.2)),b=A.createBuffer(1,n,A.sampleRate),x=b.getChannelData(0),l=0;for(var i=0;i<n;i++){var w=Math.random()*2-1;l=(l+.05*w)/1.05;x[i]=w*.35+l*2.2;}
    var s=A.createBufferSource();s.buffer=b;var bp=A.createBiquadFilter();bp.type='bandpass';bp.Q.value=.7;
    if(inhale){bp.frequency.setValueAtTime(700,t);bp.frequency.exponentialRampToValueAtTime(1500,t+d*.8);}else{bp.frequency.setValueAtTime(1100,t);bp.frequency.exponentialRampToValueAtTime(520,t+d);}
    var lp=A.createBiquadFilter();lp.type='lowpass';lp.frequency.value=2600;var g=A.createGain();g.gain.setValueAtTime(.0001,t);
    if(inhale){g.gain.exponentialRampToValueAtTime(v,t+d*.7);g.gain.exponentialRampToValueAtTime(.0001,t+d);}else{g.gain.exponentialRampToValueAtTime(v,t+.28);g.gain.exponentialRampToValueAtTime(.0001,t+d);}
    s.connect(bp);bp.connect(lp);lp.connect(g);g.connect(A.destination);s.start(t);s.stop(t+d+.1);}
  function breathStart(){breathT=.25;breathN=0;
    if(recBreath){try{breathLoop=api.sfx.loop?api.sfx.loop(recBreath,{v:1,fade:.6}):null;}catch(e){breathLoop=null;}if(!breathLoop&&EH.sfx&&EH.sfx.loop)try{breathLoop=EH.sfx.loop(recBreath,{v:1,fade:.6});}catch(e){}}}
  function breathTick(dt){if(breathLoop)return;breathT-=dt;if(breathT<=0){var inh=breathN%2===0;synthBreath(inh,inh?.05:.042);breathT=inh?2.0:2.9;breathN++;}}
  function breathStop(){if(breathLoop&&breathLoop.stop)try{breathLoop.stop(.8);}catch(e){}breathLoop=null;}
  function duck(){try{if(api.sfx.duck)api.sfx.duck(.85,1.6);else if(EH.sfx&&EH.sfx.duck)EH.sfx.duck(.85,1.6);}catch(e){}}

  // ---------------------------------------------------------------- eyes: state machine
  // idle → closing (black fades in) → shut → (release) → opening (reveal: painting sharpens, quote in / hold / out, overlay out) → idle
  var E={s:'idle',black:0,t:0,held:false,blink:0,R:null,own:false,qh:6,layoutKey:''};
  function wallColour(){return room.wall||getComputedStyle($('room')).getPropertyValue('--wall')||'#2b2825';}
  function inks(){var cs=getComputedStyle($('room'));return{ink:cs.color||'#efe6d6',i2:cs.getPropertyValue('--ink-2').trim()||'#d3c8b6',i3:cs.getPropertyValue('--ink-3').trim()||'#b3a893'};}
  function hungVisible(){var f=$('frame'),r=api.artRect();return !!(f&&!f.classList.contains('hidden')&&r.width>40&&r.height>40&&r.right>0&&r.left<innerWidth);}
  function closeEyes(src){if(E.s==='closing'||E.s==='shut')return;
    if(E.s==='idle'){E.black=0;eArt.style.opacity='0';eWall.style.opacity='0';eQ.style.opacity='0';}
    E.held=true;E.s='closing';E.t=0;E.blink=0;eye.classList.add('on');eye.style.pointerEvents='auto';eye.style.opacity='1';eShut.style.opacity='0';R_.eyes='closed';
    bEyes.setAttribute('aria-pressed','true');breathStart();duck();try{api.sfx.whoosh&&api.sfx.whoosh(.03,.9);}catch(e){}}
  function openEyes(){if(E.s!=='closing'&&E.s!=='shut')return;E.held=false;breathStop();bEyes.setAttribute('aria-pressed','false');
    layout();E.s='opening';E.t=0;E.startBlack=E.black;R_.eyes='open';}
  function finish(){E.s='idle';E.black=0;eye.classList.remove('on');eye.style.pointerEvents='none';R_.eyes='';}
  // layout of the reveal: the painting where it hangs (seamless when the overlay fades) or, when the panel hides it, laid out here;
  // the quote goes into the largest free piece of wall, never over the painting (≥ 32 px away)
  function layout(){var W=innerWidth,H=innerHeight,g=W<=560?16:36,gap=W<=560?24:48,ink=inks();
    eWall.style.background=wallColour();eQ.style.color=ink.ink;var de=eQ.querySelector('.de'),sm=eQ.querySelector('small');if(de)de.style.color=ink.i2;if(sm)sm.style.color=ink.i3;
    var R=null,own=false;eQ.classList.toggle('short',H<560);   // short screens: the German original would not fit next to the painting
    if(hungVisible()){var a=api.artRect();R={x:a.left,y:a.top,w:a.width,h:a.height};}
    function fitQ(maxW){eQ.style.width=Math.max(160,Math.min(maxW,W<=560?W-2*g:460))+'px';eQ.style.left='0px';eQ.style.top='0px';return{w:eQ.offsetWidth,h:eQ.offsetHeight};}
    function place(R){var c=[];
      var rw=W-g-(R.x+R.w+gap),lw=R.x-gap-g,bh=H-g-(R.y+R.h+32),ah=R.y-32-g;
      if(rw>=220){var s=fitQ(rw);if(s.h<=H-2*g)c.push({x:R.x+R.w+gap,y:clamp(R.y+R.h/2-s.h/2,g,H-g-s.h),a:rw*9});}
      if(lw>=220){var s2=fitQ(lw);if(s2.h<=H-2*g)c.push({x:R.x-gap-s2.w,y:clamp(R.y+R.h/2-s2.h/2,g,H-g-s2.h),a:lw*8,w:s2.w,maxW:lw});}
      if(bh>=90){var s3=fitQ(Math.min(W-2*g,560));if(s3.h<=bh)c.push({x:clamp(R.x+R.w/2-s3.w/2,g,W-g-s3.w),y:R.y+R.h+32+(bh-s3.h)/2*.4,a:bh*(W-2*g)*.5,maxW:Math.min(W-2*g,560)});}
      if(ah>=90){var s4=fitQ(Math.min(W-2*g,560));if(s4.h<=ah)c.push({x:clamp(R.x+R.w/2-s4.w/2,g,W-g-s4.w),y:R.y-32-s4.h,a:ah*(W-2*g)*.4,maxW:Math.min(W-2*g,560)});}
      c.sort(function(p,q){return q.a-p.a;});return c[0]||null;}
    var P=R?place(R):null;
    if(!P){own=true;   // lay the painting out ourselves: beside the quote when the screen is wide, above it when it is tall
      var asp=AW/AH,land=W>H*1.05;
      if(land){var qw=Math.min(460,Math.max(220,W*.4-g)),s=fitQ(qw);var aw=W-2*g-gap-s.w,ah2=H-2*g,w=Math.min(aw,ah2*asp);R={x:g+(aw-w)/2,y:(H-w/asp)/2,w:w,h:w/asp};
        P={x:R.x+R.w+gap,y:clamp(H/2-s.h/2,g,H-g-s.h),maxW:qw};}
      else{var s5=fitQ(W-2*g);var top=g+Math.max(20,H*.06),availH=H-top-g-s5.h-40,w2=Math.min(W-2*g,availH*asp);R={x:(W-w2)/2,y:top,w:w2,h:w2/asp};
        P={x:g,y:R.y+R.h+40,maxW:W-2*g};}}
    if(P.maxW)fitQ(P.maxW);
    eQ.style.left=Math.round(P.x)+'px';eQ.style.top=Math.round(P.y)+'px';
    E.R=R;E.own=own;
    var dpr=Math.min(devicePixelRatio||1,2),cw=Math.round(R.w*dpr),ch=Math.round(R.h*dpr);
    eArt.style.left=R.x+'px';eArt.style.top=R.y+'px';eArt.style.width=R.w+'px';eArt.style.height=R.h+'px';
    if(eArt.width!==cw||eArt.height!==ch){eArt.width=cw;eArt.height=ch;}
    var ag=eArt.getContext('2d');ag.imageSmoothingQuality='high';if(ok(main))ag.drawImage(main,0,0,cw,ch);
    var chars=(Q.zh||'').length;E.qh=clamp(chars*.2,5.5,11);E.layoutKey=W+'x'+H;}
  // timeline of the reveal (seconds after release)
  function revealTimes(){var k=reduce?.35:1;return{black:1.8*k,sharp:2.0*k,qin:1.9*k,qfade:1.4*k,hold:E.qh,qout:1.6*k,out:1.4*k};}
  function stepEyes(dt){
    if(E.s==='idle')return;E.t+=dt;
    if(E.s==='closing'||E.s==='shut'){E.black=Math.min(1,E.black+dt/(reduce?.12:.7));eBlack.style.opacity=E.black.toFixed(3);
      if(E.black>=1){E.s='shut';eArt.style.opacity='0';eQ.style.opacity='0';eWall.style.opacity='0';}eShut.style.opacity=(E.blink?0:seg(E.t,2.2,3.4)*1).toFixed(3);
      breathTick(dt);if((E.duckT=(E.duckT||0)+dt)>1.2){E.duckT=0;duck();}
      if(E.blink&&E.t>=E.blink)openEyes();return;}
    if(E.s==='opening'){var T=revealTimes(),t=E.t;
      if(E.layoutKey!==innerWidth+'x'+innerHeight)layout();
      var b=E.startBlack*(1-eio(seg(t,0,T.black)));eBlack.style.opacity=b.toFixed(3);eShut.style.opacity='0';
      eWall.style.opacity='1';eArt.style.opacity='1';
      var sh=1-eio(seg(t,0,T.sharp));eArt.style.filter=reduce||sh<.004?'none':'blur('+(sh*9).toFixed(2)+'px)';
      var q0=T.qin,q1=q0+T.qfade,q2=q1+T.hold,q3=q2+T.qout;
      var qa=seg(t,q0,q1)*(1-seg(t,q2,q3));eQ.style.opacity=eio(qa).toFixed(3);
      var oa=1-eio(seg(t,q3,q3+T.out));eye.style.opacity=oa.toFixed(3);
      if(t>=q3)eye.style.pointerEvents='none';
      if(t>=q3+T.out)finish();}}
  function skipReveal(){if(E.s!=='opening')return;var T=revealTimes(),q2=T.qin+T.qfade+T.hold;
    // jump to the fade-out of the quote (keeping its current level), then out
    var q=parseFloat(eQ.style.opacity)||0;E.t=Math.max(E.t,q2+T.qout*(1-q));if(E.t<T.black)E.t=T.black;}

  // ---- inputs: the button (pointer hold, Enter/Space hold, plain click = a 3 s blink), the hung painting (hold ≥ 280 ms), the overlay
  var holdPid=null;
  bEyes.addEventListener('pointerdown',function(e){if(e.pointerType==='mouse'&&e.button!==0)return;e.preventDefault();holdPid=e.pointerId;closeEyes('button');});
  bEyes.addEventListener('contextmenu',function(e){e.preventDefault();});
  bEyes.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();if(!e.repeat&&E.s!=='closing'&&E.s!=='shut')closeEyes('key');}});
  bEyes.addEventListener('keyup',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();openEyes();}});
  bEyes.addEventListener('blur',function(){if(E.held&&holdPid==null)openEyes();});
  bEyes.addEventListener('click',function(e){if(e.detail===0&&E.s==='idle'){closeEyes('blink');E.blink=3;}});   // screen readers / virtual clicks
  function upAnywhere(e){if(holdPid!=null&&e.pointerId===holdPid){holdPid=null;openEyes();}}
  addEventListener('pointerup',upAnywhere,true);addEventListener('pointercancel',upAnywhere,true);
  function lost(){if(E.held){holdPid=null;openEyes();}}
  addEventListener('blur',lost);document.addEventListener('visibilitychange',lost);
  // on the hung painting: hold (≥ 280 ms without moving) closes the eyes; a short click still opens the viewer
  var frameEl=$('frame'),cwEl=$('cw'),wallHold=null,suppress=false,cwCallout=cwEl?cwEl.style.webkitTouchCallout:'',cwSel=cwEl?cwEl.style.userSelect:'';
  if(cwEl){cwEl.style.webkitTouchCallout='none';cwEl.style.userSelect='none';cwEl.style.webkitUserSelect='none';}
  function wallDown(e){suppress=false;if(e.pointerType==='mouse'&&e.button!==0)return;if(!hungVisible()||E.s!=='idle')return;
    var cmp=$('cmpA');if(cmp&&cmp.classList.contains('on'))return;
    var pid=e.pointerId,x0=e.clientX,y0=e.clientY;
    wallHold={pid:pid,x0:x0,y0:y0,tm:setTimeout(function(){if(!wallHold||wallHold.pid!==pid)return;wallHold.on=true;suppress=true;holdPid=pid;closeEyes('wall');},280)};}
  function wallMove(e){if(!wallHold||wallHold.on||e.pointerId!==wallHold.pid)return;if(Math.hypot(e.clientX-wallHold.x0,e.clientY-wallHold.y0)>10){clearTimeout(wallHold.tm);wallHold=null;}}
  function wallUp(e){if(!wallHold||e.pointerId!==wallHold.pid)return;clearTimeout(wallHold.tm);wallHold=null;}
  function wallClick(e){if(suppress){suppress=false;e.stopPropagation();e.preventDefault();}}
  function wallMenu(e){if(wallHold||E.s!=='idle')e.preventDefault();}
  if(frameEl){frameEl.addEventListener('pointerdown',wallDown,true);frameEl.addEventListener('pointermove',wallMove,true);frameEl.addEventListener('pointerup',wallUp,true);
    frameEl.addEventListener('pointercancel',wallUp,true);frameEl.addEventListener('click',wallClick,true);frameEl.addEventListener('contextmenu',wallMenu,true);}
  // on the overlay during the reveal: a tap moves on, a hold closes the eyes again
  var ovHold=null;
  eye.addEventListener('pointerdown',function(e){if(E.s!=='opening')return;e.preventDefault();var pid=e.pointerId;
    ovHold={pid:pid,tm:setTimeout(function(){if(!ovHold||ovHold.pid!==pid)return;ovHold.on=true;holdPid=pid;closeEyes('overlay');},280)};});
  eye.addEventListener('pointerup',function(e){if(!ovHold||ovHold.pid!==e.pointerId)return;clearTimeout(ovHold.tm);var was=ovHold.on;ovHold=null;if(!was)skipReveal();});
  eye.addEventListener('contextmenu',function(e){e.preventDefault();});

  // ---------------------------------------------------------------- depth viewer
  var LAY=null,IMS=[],VIEW={cx:AW*.5,cy:AH*.52,s:AW*.78};   // window (main px) centred on the summit; square
  // camera offset c (main px): the window moves over the front layer by c, over a layer with factor f by c·f
  var cam={x:0,y:0},tgt={x:0,y:0},drag=null,keys={},look=null,dirty=true;
  function lim(){var hx=VIEW.s/2;return{x:Math.max(0,Math.min(VIEW.cx-hx,AW-VIEW.cx-hx))-2,y0:-Math.max(0,VIEW.cy-hx)+2,y1:Math.max(0,AH-VIEW.cy-hx)-2};}
  function clampCam(p){var L=lim();p.x=clamp(p.x,-L.x,L.x);p.y=clamp(p.y,L.y0,L.y1);return p;}
  function setLayers(list){LAY=list;IMS=list?list.map(function(L){var im=api.img('cut/'+L.file);if(!ok(im))im.addEventListener('load',function(){if(L.w==null){L.w=AW;L.h=AH;}dirty=true;},{once:true});return im;}):[];
    if(list){var labs=list.groups||[];legEl.textContent=labs.length>=2?'从近到远：'+labs.join(' · '):'';noteEl.textContent=T.dNote;}
    else{legEl.textContent='';noteEl.textContent=T.dWait;}
    bLook.disabled=!list;bLook.setAttribute('aria-disabled',list?'false':'true');dirty=true;}
  setLayers(null);
  var dead=false,pollT=0,tries=0;
  function poll(){if(dead||LAY||++tries>60)return;xhrJSON(api.path('cut/layers.json'),function(j){if(dead)return;var L=parseLayers(j,{w:AW,h:AH});if(L&&L.length)setLayers(L);else pollT=setTimeout(poll,5000);});}
  poll();
  function drawDepth(){var dpr=Math.min(devicePixelRatio||1,2),cwid=cv.clientWidth;if(!cwid)return;var w=Math.round(cwid*dpr),h=w;
    if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h;}
    var z=w/VIEW.s,x0=VIEW.cx-VIEW.s/2,y0=VIEW.cy-VIEW.s/2;cg.setTransform(1,0,0,1,0,0);cg.fillStyle='#8d9097';cg.fillRect(0,0,w,h);cg.imageSmoothingQuality='high';
    var ready=LAY&&IMS.length&&IMS.every(ok);
    if(!ready){if(ok(main)){var f=main.naturalWidth/AW;cg.drawImage(main,(x0+cam.x)*f,(y0+cam.y)*f,VIEW.s*f,VIEW.s*f,0,0,w,h);}return;}
    // a gentle scale difference adds to the parallax: the front grows a touch when looking down, the back stays
    LAY.forEach(function(L,i){var im=IMS[i],lw=L.w==null?AW:L.w,lh=L.h==null?AH:L.h;
      cg.setTransform(z,0,0,z,-(x0+cam.x*L.f)*z,-(y0+cam.y*L.f)*z);cg.drawImage(im,L.x,L.y,lw,lh);});
    cg.setTransform(1,0,0,1,0,0);}
  function toMain(dxCss){return dxCss*VIEW.s/Math.max(1,cv.clientWidth);}
  cv.addEventListener('pointerdown',function(e){if(e.pointerType==='mouse'&&e.button!==0)return;look=null;bLook.setAttribute('aria-pressed','false');
    drag={id:e.pointerId,x:e.clientX,y:e.clientY,c:{x:tgt.x,y:tgt.y}};try{cv.setPointerCapture(e.pointerId);}catch(_){}cv.classList.add('drag');});
  cv.addEventListener('pointermove',function(e){if(!drag||e.pointerId!==drag.id)return;
    // dragging the scene to the right looks to the left (like pulling the picture)
    tgt=clampCam({x:drag.c.x-toMain(e.clientX-drag.x)*1.1,y:drag.c.y-toMain(e.clientY-drag.y)*1.1});});
  function dEnd(e){if(!drag||(e&&e.pointerId!==drag.id))return;drag=null;cv.classList.remove('drag');}
  cv.addEventListener('pointerup',dEnd);cv.addEventListener('pointercancel',dEnd);cv.addEventListener('lostpointercapture',dEnd);
  var KV={ArrowRight:[1,0],ArrowLeft:[-1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
  cv.addEventListener('keydown',function(e){if(KV[e.key]){e.preventDefault();e.stopPropagation();keys[e.key]=1;look=null;bLook.setAttribute('aria-pressed','false');}
    else if(e.key==='Home'){e.preventDefault();tgt={x:0,y:0};}});
  cv.addEventListener('keyup',function(e){if(KV[e.key]){e.preventDefault();e.stopPropagation();delete keys[e.key];}});
  cv.addEventListener('blur',function(){keys={};});
  bLook.addEventListener('click',function(){if(!LAY)return;if(look){look=null;bLook.setAttribute('aria-pressed','false');tgt={x:0,y:0};return;}
    look={t:0,d:reduce?4:11};bLook.setAttribute('aria-pressed','true');try{api.sfx.tick(.02);}catch(e){}});
  function lookAt(t){   // one slow loop: left, down across, right, up, home
    var L=lim(),a=t*Math.PI*2,e=Math.sin(Math.PI*Math.min(1,t*1.15));return{x:-Math.sin(a)*L.x*.92*e,y:(Math.cos(a*2)*-.5+.1)*Math.min(-L.y0,L.y1)*.55*e};}

  // ---------------------------------------------------------------- loop
  var raf=0,last=0;
  function tick(now){if(dead)return;raf=requestAnimationFrame(tick);if(!host.isConnected){dispose();return;}
    var dt=last?Math.min((now-last)/1000,.05):0;last=now;
    stepEyes(dt);
    var held=Object.keys(keys);if(held.length){var L=lim(),vx=0,vy=0;held.forEach(function(k){vx+=KV[k][0];vy+=KV[k][1];});tgt=clampCam({x:tgt.x+vx*L.x*.9*dt,y:tgt.y+vy*L.x*.9*dt});}
    if(look){look.t+=dt/look.d;if(look.t>=1){look=null;bLook.setAttribute('aria-pressed','false');tgt={x:0,y:0};}else tgt=clampCam(lookAt(look.t));}
    var k=reduce?1:1-Math.exp(-dt*(drag?14:5)),nx=lerp(cam.x,tgt.x,k),ny=lerp(cam.y,tgt.y,k);
    if(Math.abs(nx-cam.x)>.01||Math.abs(ny-cam.y)>.01){cam.x=nx;cam.y=ny;dirty=true;}
    var key=cv.clientWidth+':'+(devicePixelRatio||1);if(key!==tick.k){tick.k=key;dirty=true;}
    if(dirty){drawDepth();dirty=false;var Lx=lim().x||1,v=Math.round(clamp(cam.x/Lx,-1,1)*100);if(String(v)!==cv.getAttribute('aria-valuenow')){cv.setAttribute('aria-valuenow',v);cv.setAttribute('aria-valuetext',v<-20?'向左看':v>20?'向右看':'正前方');}}
    var hv=hungVisible()?T.hintWall:T.hint;if(!touch)hv+=T.hintKeys;if(hintEl.textContent!==hv)hintEl.textContent=hv;}
  raf=requestAnimationFrame(tick);
  if(!ok(main))main.addEventListener('load',function(){dirty=true;},{once:true});
  function dispose(){if(dead)return;dead=true;cancelAnimationFrame(raf);clearTimeout(pollT);breathStop();R_.eyes='';
    if(eye.parentNode)eye.parentNode.removeChild(eye);
    removeEventListener('pointerup',upAnywhere,true);removeEventListener('pointercancel',upAnywhere,true);removeEventListener('blur',lost);document.removeEventListener('visibilitychange',lost);
    if(cwEl){cwEl.style.webkitTouchCallout=cwCallout;cwEl.style.userSelect=cwSel;cwEl.style.webkitUserSelect=cwSel;}
    if(frameEl){frameEl.removeEventListener('pointerdown',wallDown,true);frameEl.removeEventListener('pointermove',wallMove,true);frameEl.removeEventListener('pointerup',wallUp,true);
      frameEl.removeEventListener('pointercancel',wallUp,true);frameEl.removeEventListener('click',wallClick,true);frameEl.removeEventListener('contextmenu',wallMenu,true);}
    if(AC2&&AC2.close)try{AC2.close();}catch(e){}}
  host._dispose=dispose;
  // test hooks
  if(EH.debug)EH.debug.wanderer={close:function(){closeEyes('test');},open:openEyes,state:function(){return{s:E.s,t:E.t,black:E.black,R:E.R,own:E.own,q:{l:eQ.style.left,t:eQ.style.top,w:eQ.offsetWidth,h:eQ.offsetHeight}};},
    seek:function(t){E.t=t;},look:function(x,y){var L=lim();tgt=clampCam({x:x*L.x,y:y>=0?y*L.y1:-y*L.y0});cam={x:tgt.x,y:tgt.y};dirty=true;},layers:function(){return LAY;},parse:function(j){return parseLayers(j,{w:AW,h:AH});}};
});
})();

