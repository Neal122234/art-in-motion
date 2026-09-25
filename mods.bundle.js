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
/* 现实主义 · 弯下腰的人 — the passage from Friedrich's Wanderer above the Sea of Fog (romanticism) into Millet's Gleaners.
   The idea, in one sentence: 漫游者弯下了腰，成了拾穗的人；他眺望的雾中群峰沉下去，成了地平线上的麦垛。
   Romanticism gazes up at the sublime, Realism looks down at labour: the same lone back-view figure, bending. The camera never moves.
   Beats (seconds of D = 13, see T):
   1  0–2.2    the Wanderer stays; the rest recedes: the picture's edges soften into the dark wall (its light and shadow go), dusk and a
               little blur fall on the rock and the near fog; the far peaks and the sky stay as they are. (0–0.5: the hung picture hands
               over to its layers, invisibly.)
   2  1.4–4.9  the world reshapes around him while he stands still: the landscape widens to Millet's format, the mountains flatten
               (2.0–3.6) and turn the colour of straw, and where they sank Millet's haystacks, cart and farm rise out of the haze (3.1–4.9,
               the two overlap on the same line 3.1–4.2); the sea of fog thins (1.6–3.8) and the ground rises under him as a tide of
               stubble field from the bottom to the horizon (1.8–4.2), a band of warm haze riding its edge; the grey sky warms into
               Millet's (1.8–4.0).
   3  4.8–9.0  THE MOMENT: alone in the quiet field he slowly bends forward at the hips (the torso 4.8–7.7), his hanging arm reaching
               down, his head still looking ahead; then the head lowers — the gaze goes from the horizon to the ground (≈6.9–9.0) —
               while his dark coat takes on her garments' colours (≈6.5–8.6), and he is the middle gleaner, at her place and scale.
               One mesh warp of the same figure (skeleton + control points), not a cross-fade of two. His stick stays behind and sinks
               into the stubble (5.2–6.8).
   4  9.3–11.4 the other two gleaners emerge beside her (left 9.3–10.5, right 9.6–10.8); the edges sharpen into the frame (9.5–11.0),
               the room lights up to the realism wall (9.6–11.4, DOM wall/ink at 10.4), its floor rises up to the painted horizon
               (10.0–11.4), title 10.2, label 10.7 (lying flat on the floor). Music of this room from p = .715 (9.3 s).
   5  11.2–13  the composite hands over to the hung picture (11.2–12.4, invisible), rest.
   Assets: rooms/romanticism/cut (sky, far, mid, rock) + t_valley (its resting fog field) for his world; rooms/realism/cut (sky, far,
   mid, fg) for hers; rooms/realism/t_wand.webp (the Wanderer cut without his stick), t_stick.webp (the stick), t_glean.webp (the
   middle gleaner, cut from cut/women.webp), t_others.webp (the other two). The morph mesh (MW/MG: outline + inner correspondences in
   romanticism resp. realism main.webp px, a slit along his hanging arm; TA/TB: triangles for his and her texture) comes from contour
   matching of the two cut-outs; the bend is a small skeleton (legs / torso / head / hanging arm, linear-blend skinned) plus the residual.
   GPU: one WebGL canvas for the fog (the romanticism rest field, identical at p = 0), one for the figure mesh; both drawn into the stage.
   Rest: the floor (layer 'floor', z 4, under the wall text): a darker floor below the painting's horizon, outside the painting and the
   reading panel; the label lies on it (CSS perspective). EH_SHARED.realismRest(g, {W, H, rect, alpha}) redraws the floor. */
(function(){
'use strict';
var D=13, RW=1871, RH=2400, GW=2400, GH=1796, ROM_D=20.6, REST_VAL=0.62;
var SH=window.EH_SHARED=window.EH_SHARED||{};
var T={
  // 1 — recede
  fromX:[0.0,0.5], chromeOut:[0.2,1.6], soft:[0.3,1.9], dusk:[0.3,2.2],
  // 2 — the world reshapes
  world:[1.4,4.2], sky:[1.8,4.0], warm:[1.8,4.2], fogThin:[1.6,3.8], hazeIn:[1.8,3.0], hazeDown:[4.6,6.4], hazeOut:[8.6,10.8],
  sink:[2.0,3.6], pkOut:[3.5,4.2], rise:[3.1,4.9], riseA:[3.1,3.7], tide:[1.8,4.2], pkWarm:[2.4,3.6],
  // 3 — the bend
  bend:[4.8,9.0], stick:[5.2,6.8],
  // 4 — the three, the room
  left:[9.3,10.5], right:[9.6,10.8], sharp:[9.5,11.0], room:[9.6,11.4], ink:10.4, title:10.2, label:10.7, floor:[10.0,11.4], shadow:[9.8,11.4],
  // 5 — settle
  fin:[11.2,12.4]};
// ------------------------------------------------------------------ geometry (main.webp px of each picture)
var W_FOG=1040, W_KNEE=1480;          // his world: the fog-sea surface (the peaks' foot) and the line below which nothing is re-mapped (his rock, his feet)
var G_BASE=610;                        // her world: the haystacks' foot — the line on which the peaks flatten and the stacks rise
var WAND=[731,810,440,944], STICK=[1049,1351,122,403], GLEAN=[865,744,658,699], OTHERS=[420,527,1682,1050];
var PAD=8, TXA=[512,1024], TXB=[1024,1024];
// skeleton pivots [his (romanticism px), hers (realism px)]
var PIV={feet:[[875,1700],[1250,1400]],hip:[[925,1330],[1300,860]],neck:[[935,935],[1000,885]],head:[[930,812],[865,945]],sh:[[815,975],[990,1030]],hand:[[768,1318],[905,1400]]};
// the morph mesh: MW = his points (romanticism px), MG = hers (realism px), same order; MA = 1 on his hanging arm (a slit runs up its inner
// side, so the arm can swing free of the coat while he bends); TA / TB = triangles for his / her texture
var MW=[930,810,890.5,810,867,832,864,862,882.5,893.5,891,933,858.5,958.5,822,976,803.5,1006.5,799,1044,797,1080.5,791,1117.5,777,1150,778.5,1184.5,775,1220,778,1254.5,778,1289,760,1318,762,1325,766.5,1330,765,1336,761,1375,763,1416,761,1461.5,764,1507,768,1550,771,1584,745,1589,731,1610,766,1638,811,1644,819,1651,827,1658,835,1665,842.5,1672.5,850.5,1679.5,858.5,1686.5,866.5,1693.5,874.5,1700.5,882.5,1707.5,890.5,1714.5,898.5,1721.5,906,1729,914,1736,922,1743,930,1750,940.5,1750,950.5,1752,961.5,1753,971,1749,995,1721,994.5,1683.5,1006,1644.5,1013,1605,1019,1569,1021,1532.5,1019,1495,1025,1459.5,1047,1436,1072,1419,1067,1389,1065,1363,1066,1335,1060,1305.5,1052,1276,1070,1256,1076,1244.5,1080.5,1232.5,1090,1222.5,1096,1211,1103.5,1200.5,1110,1189,1115,1177,1119.5,1164.5,1125,1153,1124,1140,1115,1110,1103,1082,1089,1054,1080,1025,1071,996,1050,974,1027.5,968,1008,955,987.5,943.5,975,925,977,912,984,898.5,988,883.5,991.5,868.5,997,855,993,836.5,982.5,823,966.5,814,950,810,765,1336,790,1318,804,1270,812,1205,819,1140,826,1075,790,1318,804,1270,812,1205,819,1140,826,1075,836,1010,930,870,935,945,930,1060,935,1200,925,1320,820,1500,960,1470,1040,1150,960,1650,800,1580,906,1470,890,1640,870,1250,880,1100,797,1180,790,1060];
var MG=[865,945,865,971,868,996,875,1019,880,1026,885,1033,890,1040,895,1047,897,1077.5,898,1108,899,1138.5,900,1169.5,901,1200,898,1232,895,1263.5,882.5,1288.5,880.5,1316.5,870,1341,865,1369.5,865,1399.5,880,1421,895,1438,916,1442,932.5,1442,948.5,1442,963,1437,976,1407.5,1005,1398,1040,1396,1076,1387,1110,1376,1125,1369,1143,1370,1158.5,1375.5,1176,1375,1193.5,1374,1211,1372,1228,1370,1244.5,1365.5,1261,1362,1277,1367,1295,1367,1310.5,1361.5,1326.5,1365,1344.5,1366,1362,1365,1384.5,1348,1414,1349,1442.5,1353,1469,1345,1487.5,1332,1507.5,1331,1522,1324.5,1522,1300,1522,1265.5,1522,1231,1506,1247,1494.5,1227.5,1482,1198,1450.5,1194.5,1436,1167.5,1432,1136.5,1425,1106,1446,1084.5,1472,1067,1495,1045,1500,1018,1483,996,1465,975,1439.5,961.5,1411.5,954.5,1385,948,1372,924,1369.5,893.5,1362,865,1351,838,1336,810,1320,782,1296.5,759,1267.5,746.5,1234.5,744,1200,744,1164,744,1130,748,1098,758,1069,774,1046,779,1030,804,1010.5,827.5,986.5,847.5,962,865,931.5,860,901,864,879,886,867,913.5,880,1421,930,1405,960,1345,988,1280,997,1200,1001,1125,930,1405,960,1345,988,1280,997,1200,1001,1125,1004,1052,940,945,1030,880,1150,860,1300,860,1300,900,1150,1250,1400,1200,1330,850,1420,1330,1050,1330,1250,1330,1250,1385,1080,1150,1080,1000,955,1200,950,1080];
var MA=[0,0,0,0,0,0,0,0.5,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1];
var TA=[9,106,100,106,9,8,8,7,106,10,100,11,100,10,122,98,13,121,13,98,14,122,9,100,14,98,15,12,121,13,121,12,99,12,11,99,15,98,97,15,97,16,16,97,96,18,96,19,96,18,17,17,16,96,96,20,19,99,11,100,99,98,121,6,109,106,109,6,108,1,0,107,107,2,1,2,107,3,6,5,108,4,3,107,118,38,37,38,118,39,5,4,107,118,37,36,22,117,112,117,22,21,7,6,106,58,60,59,60,58,61,111,110,64,110,111,119,118,33,32,33,118,34,118,31,30,31,118,32,23,22,112,24,23,112,34,118,35,25,24,112,116,25,112,25,116,26,112,118,116,118,112,117,116,29,26,29,116,30,27,26,29,27,29,28,39,118,40,51,115,52,115,51,43,40,118,115,40,115,41,41,115,42,115,43,42,36,35,118,46,51,50,51,46,43,46,50,47,47,49,48,49,47,50,43,46,44,44,46,45,115,54,53,54,115,118,118,117,54,118,30,116,54,117,113,54,113,55,56,113,57,113,56,55,53,52,115,101,117,21,117,101,111,61,58,111,111,58,113,101,21,95,58,57,113,62,111,63,111,62,61,119,103,110,103,119,102,110,65,64,65,110,114,64,63,111,65,114,66,110,104,120,104,110,103,66,114,67,69,67,114,67,69,68,114,109,78,109,114,110,69,114,70,114,72,71,72,114,73,75,114,76,114,75,73,71,70,114,73,75,74,77,114,78,114,77,76,105,120,104,120,105,106,79,109,82,109,79,78,80,82,81,82,80,79,109,108,84,88,87,107,106,109,120,83,82,109,108,85,84,85,108,86,84,83,109,108,107,86,107,108,5,86,107,87,89,107,91,107,89,88,94,107,0,107,94,93,90,89,91,91,107,92,92,107,93,119,101,102,101,119,111,109,110,120,111,113,117];
var TB=[10,100,121,100,10,122,8,7,122,10,121,11,9,8,122,121,100,99,10,9,122,12,121,13,121,12,11,98,13,121,13,98,14,14,98,97,14,97,15,15,97,16,17,96,18,96,17,97,18,96,19,17,16,97,19,96,20,98,121,99,122,7,106,106,100,122,67,65,64,65,67,66,4,2,107,2,4,3,1,0,107,4,107,5,2,1,107,107,6,5,6,107,7,7,107,106,116,112,31,112,116,104,23,101,24,101,23,22,101,22,21,24,101,25,25,101,26,101,21,95,26,102,27,102,26,101,116,102,103,102,116,27,27,116,28,29,28,116,30,29,116,104,116,103,34,32,112,32,34,33,31,30,116,31,112,32,34,112,35,35,112,117,36,117,37,117,36,35,113,62,61,62,113,112,38,37,117,117,42,41,42,117,113,39,38,117,117,40,39,40,117,41,115,59,57,59,115,113,57,59,58,46,43,42,43,46,44,44,46,45,46,42,113,54,56,55,56,54,53,49,115,50,115,49,48,47,46,115,115,48,47,56,53,50,56,50,115,53,51,50,51,53,52,115,46,113,112,104,119,56,115,57,59,113,60,113,61,60,70,63,71,63,70,69,63,62,71,63,68,64,68,63,69,67,64,68,71,62,111,62,119,120,119,62,112,111,73,72,73,111,74,72,71,111,110,77,76,77,110,78,110,80,79,80,110,109,80,109,81,75,74,114,110,79,78,76,75,114,74,111,114,82,109,83,109,82,81,85,109,87,109,85,84,109,84,83,87,108,88,108,87,109,85,87,86,91,90,107,108,120,107,120,108,109,108,90,89,90,108,107,89,88,108,107,0,94,107,94,93,91,107,92,92,107,93,105,119,104,119,105,106,111,62,120,111,120,109,106,107,120,110,76,114,109,110,111,114,111,110,112,113,117,119,106,120];
var NP=MW.length/2;

function cv(w,h){var c=document.createElement('canvas');c.width=Math.max(1,Math.round(w));c.height=Math.max(1,Math.round(h));return c;}
function rgb(hex){var m=String(hex||'').trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);if(!m)return[40,40,40];var h=m[1];if(h.length===3)h=h.replace(/./g,'$&$&');var n=parseInt(h,16);return[(n>>16)&255,(n>>8)&255,n&255];}
function mixa(a,b,t){return[0,1,2].map(function(i){return a[i]+(b[i]-a[i])*t;});}
function css(c){return 'rgb('+c.map(Math.round).join(',')+')';}
function cl(x){return x<0?0:x>1?1:x;}
function sm(x){x=cl(x);return x*x*(3-2*x);}
function seg(t,a){return cl((t-a[0])/(a[1]-a[0]));}
function eo(x){x=cl(x);return 1-Math.pow(1-x,3);}
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
  return{c:c,x:dx/dpr,y:dy/dpr,w:c.width/dpr,h:c.height/dpr};}
function drawShadow(g,sh,a){if(!sh||a<=0)return;g.save();g.globalAlpha=a;g.drawImage(sh.c,sh.x,sh.y,sh.w,sh.h);g.restore();}
// like core's paintArt(): the hung work is drawn into a canvas of min(round(w·dpr), 2600) px, then scaled by CSS
// the DOM paints a canvas into a device-pixel-snapped box: the same box here, so p = 0 / p = 1 match it on fractional layouts too
function snap(r,dpr){var x=Math.round(r.x*dpr)/dpr,y=Math.round(r.y*dpr)/dpr;return{x:x,y:y,w:Math.round((r.x+r.w)*dpr)/dpr-x,h:Math.round((r.y+r.h)*dpr)/dpr-y};}
function artCanvas(im,r,dpr){var w=Math.min(Math.round(r.w*dpr),2600),h=Math.round(w*((im&&im.naturalHeight)||1)/((im&&im.naturalWidth)||1)),c=cv(w,h);if(ok(im))c.getContext('2d').drawImage(im,0,0,w,h);return c;}

// ------------------------------------------------------------------ the floor: a darker ground below the painting's horizon, outside the work
// (under the wall text; translucent so the DOM's frame shadow shows through). The same drawing serves p = 1, rest and EH_SHARED.realismRest.
var FLOOR_Y=540;
function floorY(rect){return rect.y+FLOOR_Y*rect.h/GH;}
function floorPaint(g,o){var W=o.W,H=o.H,y=o.y,a=o.alpha==null?1:o.alpha;if(a<=0.001||y>=H)return;var dark=o.ink==='dark';
  g.save();g.beginPath();g.rect(0,0,W,H);var b=o.cut;if(b)g.rect(b.x,b.y,b.w,b.h);if(o.read){var R=o.read;g.rect(R.x-8,R.y-8,R.w+16,R.h+16);}g.clip('evenodd');
  g.globalAlpha=a;var y0=Math.max(y,-40);
  var f=g.createLinearGradient(0,y0,0,H);f.addColorStop(0,dark?'rgba(92,70,44,.10)':'rgba(24,17,10,.30)');f.addColorStop(1,dark?'rgba(92,70,44,.16)':'rgba(16,11,6,.46)');
  g.fillStyle=f;g.fillRect(0,y0,W,H-y0);
  var s=g.createLinearGradient(0,y0,0,y0+26);s.addColorStop(0,dark?'rgba(40,28,14,.14)':'rgba(0,0,0,.22)');s.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=s;g.fillRect(0,y0,W,26);
  g.fillStyle=dark?'rgba(255,255,255,.35)':'rgba(255,238,210,.09)';g.fillRect(0,y0-1,W,1);
  g.restore();}
SH.realismRest=function(g,o){try{floorPaint(g,{W:o.W,H:o.H,y:floorY(o.rect),alpha:o.alpha,ink:o.ink||'light',cut:o.rect,read:o.readRect||null});}catch(e){console.error(e);}};

// ------------------------------------------------------------------ the label lies flat on the floor (CSS perspective, removed when it has faded out in another room)
var myIdx=-1,watching=false,flatEl=null,floorEl=null;
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

// ================================================================== GPU 1: the fog — the romanticism rest field (valley fog), thinning into a warm haze band
var VS='attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
var FS=[
'precision highp float;',
'uniform vec2 uRes,uCss,uDrift;uniform float uT;',
'uniform sampler2D uValley;uniform vec4 uTo;uniform float uValA;uniform vec3 uHz;uniform float uWarm,uAlpha;',
'float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}',
'float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);}',
'const mat2 M=mat2(1.6,1.2,-1.2,1.6);',
'float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p=M*p;a*=.5;}return v;}',
'float fbm3(vec2 p){float v=0.,a=.5;for(int i=0;i<3;i++){v+=a*noise(p);p=M*p;a*=.5;}return v/.875;}',
'float box(vec2 uv){return step(0.,uv.x)*step(uv.x,1.)*step(0.,uv.y)*step(uv.y,1.);}',
'void main(){',
'  vec2 pix=vec2(gl_FragCoord.x,uRes.y-gl_FragCoord.y)/uRes*uCss;',
'  vec2 q=pix*(1./300.)+uDrift;',
'  vec2 w=vec2(fbm3(q*.6+vec2(1.7,9.2)+uT*.03),fbm3(q*.6+vec2(8.3,2.8)-uT*.024))-.5;',
'  vec2 qw=q+.9*w;float n=fbm(qw+vec2(0.,uT*.015));',
'  float nl=fbm3(qw+vec2(-.05,-.07));',
'  float b=smoothstep(.3,.72,n);',
// the Wanderer's resting fog in the valleys of his painting (exactly the romanticism rest at p = 0)
'  vec2 tu=(pix-uTo.xy)/uTo.zw;float inR=smoothstep(0.,.035,tu.x)*smoothstep(1.,.965,tu.x)*smoothstep(0.,.03,tu.y)*smoothstep(1.,.97,tu.y);',
'  float val=texture2D(uValley,clamp(tu,0.,1.)).r*box(tu);',
'  float aV=clamp(val*uValA*inR*mix(mix(.42,.72,1.-inR),1.,b),0.,1.);',
// the haze band riding the rising ground, then lying on the horizon
'  float hz=(pix.y-uHz.x)/uHz.z;float aH=uHz.y*exp(-hz*hz*(hz<0.?1.4:.7))*(.45+.8*n);',
'  float a=1.-(1.-aV)*(1.-clamp(aH,0.,1.));',
'  float sh=clamp(.62+(n-nl)*3.2,0.,1.);',
'  vec3 cool=mix(vec3(.66,.68,.745),vec3(.94,.945,.96),sh);',
'  vec3 warm=mix(vec3(.62,.54,.40),vec3(.93,.87,.74),sh);',
'  vec3 col=mix(cool,warm,uWarm);',
'  a=clamp(a,0.,1.)*uAlpha;',
'  gl_FragColor=vec4(col*a,a);}'].join('\n');
function glProgram(gl,vs,fs){function sh(type,src){var s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){console.warn(gl.getShaderInfoLog(s));return null;}return s;}
  var p=gl.createProgram(),a=sh(gl.VERTEX_SHADER,vs),b=sh(gl.FRAGMENT_SHADER,fs);if(!a||!b)return null;gl.attachShader(p,a);gl.attachShader(p,b);gl.linkProgram(p);
  if(!gl.getProgramParameter(p,gl.LINK_STATUS)){console.warn(gl.getProgramInfoLog(p));return null;}return p;}
function Fog(){var canvas=cv(2,2),gl=canvas.getContext('webgl',{premultipliedAlpha:true,alpha:true,antialias:false,depth:false,stencil:false,preserveDrawingBuffer:false});
  if(!gl)return null;var p=glProgram(gl,VS,FS);if(!p)return null;
  gl.useProgram(p);var buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  var al=gl.getAttribLocation(p,'a');gl.enableVertexAttribArray(al);gl.vertexAttribPointer(al,2,gl.FLOAT,false,0,0);
  var U={};['uRes','uCss','uDrift','uT','uValley','uTo','uValA','uHz','uWarm','uAlpha'].forEach(function(n){U[n]=gl.getUniformLocation(p,n);});
  var tex=gl.createTexture();
  return {canvas:canvas,
    valley:function(im){gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,tex);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      try{if(ok(im))gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,im);else gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([0,0,0,255]));}catch(e){console.warn(e);}
      gl.uniform1i(U.uValley,0);},
    draw:function(o,cw,ch){if(canvas.width!==cw||canvas.height!==ch){canvas.width=cw;canvas.height=ch;}gl.viewport(0,0,cw,ch);
      gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);if(!(o.alpha>0))return;
      gl.useProgram(p);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,tex);
      gl.uniform2f(U.uRes,cw,ch);gl.uniform2f(U.uCss,o.W,o.H);gl.uniform2f(U.uDrift,o.drift[0],o.drift[1]);gl.uniform1f(U.uT,o.t);
      gl.uniform4fv(U.uTo,o.to);gl.uniform1f(U.uValA,o.valA);gl.uniform3fv(U.uHz,o.hz);gl.uniform1f(U.uWarm,o.warm);gl.uniform1f(U.uAlpha,o.alpha);
      gl.drawArrays(gl.TRIANGLES,0,3);}};}
// the same resolution as the romanticism fog (half the CSS pixels per axis, capped), so p = 0 matches it pixel for pixel
function fogSize(W,H){var s=Math.min(0.5,900/W);return[Math.max(2,Math.round(W*s)),Math.max(2,Math.round(H*s))];}
function romDrift(t){return[0.022*t,0.004*t+3.1*sm((t-8.0)/4.5)];}

// ================================================================== GPU 2: the figure — one mesh, his texture (TA) and hers (TB) over the same moving points
var MVS='attribute vec2 aP;attribute vec2 aT;uniform vec4 uBox;varying vec2 vT;void main(){vec2 c=(aP-uBox.xy)/uBox.zw;gl_Position=vec4(c.x*2.-1.,1.-c.y*2.,0.,1.);vT=aT;}';
var MFS='precision mediump float;uniform sampler2D uTex;uniform float uA;varying vec2 vT;void main(){gl_FragColor=texture2D(uTex,vT)*uA;}';
function Fig(){var canvas=cv(2,2),gl=canvas.getContext('webgl',{premultipliedAlpha:true,alpha:true,antialias:false,depth:false,stencil:false,preserveDrawingBuffer:false});
  if(!gl)return null;var p=glProgram(gl,MVS,MFS);if(!p)return null;gl.useProgram(p);
  var aP=gl.getAttribLocation(p,'aP'),aT=gl.getAttribLocation(p,'aT'),uBox=gl.getUniformLocation(p,'uBox'),uTex=gl.getUniformLocation(p,'uTex'),uA=gl.getUniformLocation(p,'uA');
  function uvs(P,box,tx){var a=new Float32Array(NP*2);for(var i=0;i<NP;i++){a[2*i]=(P[2*i]-box[0]+PAD)/tx[0];a[2*i+1]=(P[2*i+1]-box[1]+PAD)/tx[1];}return a;}
  var pos=gl.createBuffer(),uvA=gl.createBuffer(),uvB=gl.createBuffer(),ixA=gl.createBuffer(),ixB=gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,pos);gl.bufferData(gl.ARRAY_BUFFER,NP*8,gl.DYNAMIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER,uvA);gl.bufferData(gl.ARRAY_BUFFER,uvs(MW,WAND,TXA),gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER,uvB);gl.bufferData(gl.ARRAY_BUFFER,uvs(MG,GLEAN,TXB),gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ixA);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(TA),gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ixB);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(TB),gl.STATIC_DRAW);
  gl.enableVertexAttribArray(aP);gl.enableVertexAttribArray(aT);
  gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
  var texA=null,texB=null;
  // a cut-out, padded, 1:1 into a power-of-two canvas (mipmaps: clean at every scale)
  function tex(im,tx){var c=cv(tx[0],tx[1]),q=c.getContext('2d');if(ok(im))q.drawImage(im,PAD,PAD);var t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,c);gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);return t;}
  function pass(t,uv,ix,n,a){if(a<=0.002||!t)return;gl.bindTexture(gl.TEXTURE_2D,t);gl.uniform1f(uA,a);
    gl.bindBuffer(gl.ARRAY_BUFFER,uv);gl.vertexAttribPointer(aT,2,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ix);gl.drawElements(gl.TRIANGLES,n,gl.UNSIGNED_SHORT,0);}
  return {canvas:canvas,
    his:function(im){if(!texA)texA=tex(im,TXA);},hers:function(im){if(!texB)texB=tex(im,TXB);},ready:function(){return !!(texA&&texB);},
    draw:function(o){var cw=o.cw,ch=o.ch;if(canvas.width!==cw||canvas.height!==ch){canvas.width=cw;canvas.height=ch;}gl.viewport(0,0,cw,ch);
      gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(p);gl.activeTexture(gl.TEXTURE0);gl.uniform1i(uTex,0);
      gl.uniform4f(uBox,o.box.x,o.box.y,o.box.w,o.box.h);
      gl.bindBuffer(gl.ARRAY_BUFFER,pos);gl.bufferSubData(gl.ARRAY_BUFFER,0,o.pos);gl.vertexAttribPointer(aP,2,gl.FLOAT,false,0,0);
      pass(texA,uvA,ixA,TA.length,o.aA);pass(texB,uvB,ixB,TB.length,o.aB);}};}

// ================================================================== geometry per layout
function geo(ctx){var S=ctx.state,F=ctx.from,R1=ctx.to.rect,R0=F?F.rect:R1,dpr=ctx.dpr||1,W=ctx.W,H=ctx.H;
  var key=[W,H,dpr,R0.x,R0.y,R0.w,R0.h,R1.x,R1.y,R1.w,R1.h].join('/');if(S.G&&S.G.key===key)return S.G;
  var k0=R0.w/RW,k1=R1.w/GW,G={key:key,W:W,H:H,dpr:dpr,R0:R0,R1:R1,k0:k0,k1:k1};
  G.xs=R0.x+875*k0;G.sxF=R1.w/R0.w;G.yb1=R1.y+G_BASE*k1;
  var x0=Math.floor(Math.min(R0.x,R1.x)),y0=Math.floor(Math.min(R0.y,R1.y)),x1=Math.ceil(Math.max(R0.x+R0.w,R1.x+R1.w)),y1=Math.ceil(Math.max(R0.y+R0.h,R1.y+R1.h));
  G.U={x:x0,y:y0,w:x1-x0,h:y1-y0};G.cw=Math.round(G.U.w*dpr);G.ch=Math.round(G.U.h*dpr);
  // the morph in her picture's px: his points where he stands (A'), her points, the skeleton and its end pose, the residual
  function toG(p){return[(R0.x+p[0]*k0-R1.x)/k1,(R0.y+p[1]*k0-R1.y)/k1];}
  var A=new Float64Array(NP*2);for(var i=0;i<NP;i++){var q=toG([MW[2*i],MW[2*i+1]]);A[2*i]=q[0];A[2*i+1]=q[1];}
  var P={};Object.keys(PIV).forEach(function(k){P[k]=[toG(PIV[k][0]),PIV[k][1]];});
  function sim(a0,a1,b0,b1){var va=[a1[0]-a0[0],a1[1]-a0[1]],vb=[b1[0]-b0[0],b1[1]-b0[1]],s=Math.hypot(vb[0],vb[1])/Math.hypot(va[0],va[1]),th=Math.atan2(vb[1],vb[0])-Math.atan2(va[1],va[0]);
    while(th>Math.PI)th-=2*Math.PI;while(th<-Math.PI)th+=2*Math.PI;return[s,th];}
  var B={L:sim(P.feet[0],P.hip[0],P.feet[1],P.hip[1]),T:sim(P.hip[0],P.neck[0],P.hip[1],P.neck[1]),H:sim(P.neck[0],P.head[0],P.neck[1],P.head[1]),A:sim(P.sh[0],P.hand[0],P.sh[1],P.hand[1])};
  G.mA=A;G.mP=P;G.mB=B;var Q=new Float64Array(NP*2);pose(G,{L:1,T:1,H:1,A:1,S:1,SL:1,AS:1},Q);
  var R=new Float64Array(NP*2);for(i=0;i<NP*2;i++)R[i]=MG[i]-Q[i];G.mR=R;G.mQ=new Float64Array(NP*2);G.mS=new Float32Array(NP*2);
  return(S.G=G);}
// skinning weights (his px): legs below the hip, head above the neck, the hanging left arm (MA: its outline and its side of the slit), the torso in between
var WTS=(function(){var w=[];for(var i=0;i<NP;i++){var y=MW[2*i+1],L=sm((y-1260)/140),Hd=sm((960-y)/50),Ar=MA[i];
  L*=1-Ar;Hd*=1-Ar;w.push([L,cl(1-L-Hd-Ar),Hd,Ar]);}return w;})();
function rot(th,x,y){var c=Math.cos(th),s=Math.sin(th);return[c*x-s*y,s*x+c*y];}
function pose(G,e,out){var A=G.mA,P=G.mP,B=G.mB;
  var f0=P.feet[0],f1=P.feet[1],h0=P.hip[0],n0=P.neck[0],s0=P.sh[0];
  // legs: rotation/position e.L, size e.SL · torso: rotation e.T, size e.S · head: its own world rotation e.H (it keeps looking ahead while
  // the back bends, and drops last) · the hanging arm keeps hanging (e.A), reaching the ground as it grows (e.AS)
  var sL=Math.pow(B.L[0],e.SL),tL=B.L[1]*e.L,sT=Math.pow(B.T[0],e.S),tT=B.T[1]*e.T,sH=Math.pow(B.H[0],e.S),tH=B.H[1]*e.H,sA=Math.pow(B.A[0],e.AS),tA=B.A[1]*e.A;
  var fx=f0[0]+(f1[0]-f0[0])*e.L,fy=f0[1]+(f1[1]-f0[1])*e.L;
  function QL(x,y){var r=rot(tL,x-f0[0],y-f0[1]);return[fx+sL*r[0],fy+sL*r[1]];}
  var hp=QL(h0[0],h0[1]);
  function QT(x,y){var r=rot(tT,x-h0[0],y-h0[1]);return[hp[0]+sT*r[0],hp[1]+sT*r[1]];}
  var nk=QT(n0[0],n0[1]),sh=QT(s0[0],s0[1]);
  for(var i=0;i<NP;i++){var x=A[2*i],y=A[2*i+1],w=WTS[i],ox=0,oy=0,q;
    if(w[0]>0){q=QL(x,y);ox+=w[0]*q[0];oy+=w[0]*q[1];}
    if(w[1]>0){q=QT(x,y);ox+=w[1]*q[0];oy+=w[1]*q[1];}
    if(w[2]>0){q=rot(tH,x-n0[0],y-n0[1]);ox+=w[2]*(nk[0]+sH*q[0]);oy+=w[2]*(nk[1]+sH*q[1]);}
    if(w[3]>0){q=rot(tA,x-s0[0],y-s0[1]);ox+=w[3]*(sh[0]+sA*q[0]);oy+=w[3]*(sh[1]+sA*q[1]);}
    out[2*i]=ox;out[2*i+1]=oy;}}
// the figure's points on screen at time t (his exact place before the bend, her exact place after it)
function figure(G,t){var u=seg(t,T.bend),S=G.mS,k1=G.k1,R1=G.R1;
  if(u<=0){for(var i=0;i<NP;i++){S[2*i]=G.R0.x+MW[2*i]*G.k0;S[2*i+1]=G.R0.y+MW[2*i+1]*G.k0;}return{u:0,m:0};}
  if(u>=1){for(i=0;i<NP*2;i+=2){S[i]=R1.x+MG[i]*k1;S[i+1]=R1.y+MG[i+1]*k1;}return{u:1,m:1};}
  var e={T:sm(u/.7),S:sm((u-.15)/.75),H:sm((u-.3)/.7),A:sm(u/.7),AS:sm((u-.2)/.7),L:sm((u-.25)/.7),SL:sm((u-.3)/.65)},Q=G.mQ,R=G.mR;pose(G,e,Q);
  for(i=0;i<NP;i++){var d=.15+.25*WTS[i][0],rho=sm((u-d)/(1-d)),j=2*i;S[j]=R1.x+(Q[j]+rho*R[j])*k1;S[j+1]=R1.y+(Q[j+1]+rho*R[j+1])*k1;}
  return{u:u,m:sm((u-.4)/.5)};}
// his world while it widens and flattens: x stretched about his feet, y re-mapped in three bands (the sky above the fog line moves to hers,
// the band between the fog line and the knee line is stretched to meet it, below the knee line — his rock, his feet — nothing moves)
function wmap(G,w){var R0=G.R0,k0=G.k0,sx=lerp(1,G.sxF,w),top=lerp(R0.y,G.R1.y,w),kyU=lerp(k0,(G.yb1-G.R1.y)/W_FOG,w),yF=top+W_FOG*kyU,yK=R0.y+W_KNEE*k0,kyL=(yK-yF)/(W_KNEE-W_FOG);
  return{X0:G.xs+(R0.x-G.xs)*sx,kx:k0*sx,top:top,kyU:kyU,yF:yF,kyL:kyL,
    y:function(v){return v<=W_FOG?top+v*kyU:v<=W_KNEE?yF+(v-W_FOG)*kyL:R0.y+v*k0;}};}
// a cached strip of his world (rows y0..y1 of his picture) drawn through the band map
function drawBands(q,c,y0,y1,M){var sc=c.height/(y1-y0),cuts=[y0,W_FOG,W_KNEE,y1],x=M.X0,w=RW*M.kx;
  for(var i=0;i<3;i++){var a=Math.max(y0,cuts[i]),b=Math.min(y1,cuts[i+1]);if(b<=a)continue;var da=M.y(a),db=M.y(b);
    q.drawImage(c,0,(a-y0)*sc,c.width,(b-a)*sc,x,da,w,db-da+(b<y1?.6:0));}}

// ================================================================== caches (built one per task after init; on demand if a frame needs one first)
var BUILD={
  fromArt:function(ctx,G){return ctx.from?artCanvas(ctx.from.image,G.R0,G.dpr):null;},
  art:function(ctx,G){return artCanvas(ctx.to.image,G.R1,G.dpr);},
  shFr:function(ctx,G){return ctx.from&&ctx.from.frame==='none'?shadowCache(G.dpr,G.R0):null;},
  shTo:function(ctx,G){return ctx.to.frame==='none'?shadowCache(G.dpr,G.R1):null;},
  // his sky, rows 0..1100; below 700 (synthesised, streaky) replaced by the pale band above it, stretched
  skyW:function(ctx,G){var im=IM(ctx,'skyW'),s=G.k0*G.dpr,c=cv(RW*s,1100*s),q=c.getContext('2d');if(!ok(im))return c;
    q.drawImage(im,0,0,RW,700,0,0,c.width,700*s);q.drawImage(im,0,560,RW,140,0,700*s-1,c.width,400*s+1);return c;},
  // his peaks, rows 686..1100 of far.webp
  pk:function(ctx,G){var im=IM(ctx,'farW'),s=G.k0*G.dpr,c=cv(RW*s,414*s);if(ok(im))c.getContext('2d').drawImage(im,0,0,RW,414,0,0,c.width,c.height);return c;},
  // the peaks in the warm haze of her field (they turn the colour of straw as they sink)
  pkWarm:function(ctx,G){var n=cache(ctx,'pk'),c=cv(n.width,n.height),q=c.getContext('2d');q.drawImage(n,0,0);q.globalCompositeOperation='source-atop';q.fillStyle='rgba(150,126,82,.42)';q.fillRect(0,0,c.width,c.height);return c;},
  // his near world, rows 1010..2400: the fog sea (its top edge feathered over the peaks), the crags, the rock
  near:function(ctx,G){var s=G.k0*G.dpr,c=cv(RW*s,1390*s),q=c.getContext('2d');
    if(ok(IM(ctx,'farW'))){q.drawImage(IM(ctx,'farW'),0,324,RW,1390,0,0,c.width,1390*s);q.globalCompositeOperation='destination-in';var gr=q.createLinearGradient(0,0,0,60*s);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'#000');q.fillStyle=gr;q.fillRect(0,0,c.width,c.height);q.globalCompositeOperation='source-over';}
    if(ok(IM(ctx,'midW')))q.drawImage(IM(ctx,'midW'),0,100*s,1663*s,514*s);if(ok(IM(ctx,'rockW')))q.drawImage(IM(ctx,'rockW'),0,476*s,RW*s,914*s);return c;},
  // the same out of focus, from the crags down (the fog line stays sharp)
  nearSoft:function(ctx,G){var n=cache(ctx,'near'),c=cv(n.width,n.height),q=c.getContext('2d'),s=G.k0*G.dpr,b=Math.max(1,1.8*G.dpr);
    q.filter='blur('+b.toFixed(1)+'px)';q.drawImage(n,0,0);q.filter='none';q.globalCompositeOperation='destination-in';
    var gr=q.createLinearGradient(0,150*s,0,480*s);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'#000');q.fillStyle=gr;q.fillRect(0,0,c.width,c.height);return c;},
  skyM:function(ctx,G){var im=IM(ctx,'skyM'),s=G.k1*G.dpr,c=cv(GW*s,640*s);if(ok(im))c.getContext('2d').drawImage(im,0,0,GW,640,0,0,c.width,c.height);return c;},
  // her far field above the stacks' foot (rows 356..632 of far.webp, bottom feathered over the field)
  ftop:function(ctx,G){var im=IM(ctx,'farM'),s=G.k1*G.dpr,c=cv(GW*s,276*s),q=c.getContext('2d');if(!ok(im))return c;q.drawImage(im,0,0,GW,276,0,0,c.width,c.height);
    q.globalCompositeOperation='destination-in';var gr=q.createLinearGradient(0,250*s,0,276*s);gr.addColorStop(0,'#000');gr.addColorStop(1,'rgba(0,0,0,0)');q.fillStyle=gr;q.fillRect(0,0,c.width,c.height);return c;},
  // her field from row 600 down: far (to 1120), mid, fg — the women are not in it (mid is inpainted behind them)
  field:function(ctx,G){var s=G.k1*G.dpr,c=cv(GW*s,1196*s),q=c.getContext('2d');
    if(ok(IM(ctx,'farM')))q.drawImage(IM(ctx,'farM'),0,244,GW,520,0,0,c.width,520*s);if(ok(IM(ctx,'midM')))q.drawImage(IM(ctx,'midM'),0,86*s,GW*s,1110*s);if(ok(IM(ctx,'fgM')))q.drawImage(IM(ctx,'fgM'),0,803*s,GW*s,393*s);return c;},
  others:function(ctx,G){var im=IM(ctx,'others'),s=G.k1*G.dpr,c=cv(OTHERS[2]*s,OTHERS[3]*s);if(ok(im))c.getContext('2d').drawImage(im,0,0,c.width,c.height);return c;},
  stick:function(ctx,G){var im=IM(ctx,'stick'),s=G.k0*G.dpr,c=cv(STICK[2]*s,STICK[3]*s);if(ok(im))c.getContext('2d').drawImage(im,0,0,c.width,c.height);return c;},
  scene:function(ctx,G){return cv(G.cw,G.ch);},tmp:function(ctx,G){return cv(G.cw,G.ch);}};
var ORDER=['shFr','skyW','pk','pkWarm','near','nearSoft','skyM','ftop','field','others','stick','scene','tmp','shTo'];
// every layer image is decoded off the main thread (fetch → blob → createImageBitmap); until then (or without fetch) the <img> itself
function loadBitmaps(ctx){var S=ctx.state;S.bm=S.bm||{};if(!window.fetch||!window.createImageBitmap)return Promise.resolve();
  return Promise.all(Object.keys(S.im).map(function(n){var im=S.im[n];if(!im||!im.src||S.bm[n])return null;
    return fetch(im.src).then(function(r){if(!r.ok)throw new Error(r.status);return r.blob();}).then(function(b){return createImageBitmap(b);}).then(function(bm){S.bm[n]=bm;}).catch(function(){});}));}
function IM(ctx,n){var S=ctx.state;return(S.bm&&S.bm[n])||S.im[n];}
function cache(ctx,name){var S=ctx.state,G=geo(ctx);if(!S.C||S.C.key!==G.key)S.C={key:G.key};var C=S.C;if(!(name in C)){C[name]=BUILD[name](ctx,G);}return C[name];}

// ================================================================== the scene inside the (soft) window: his world turning into hers
function drawScene(ctx,G,t){var S=ctx.state,U=G.U,dpr=G.dpr,sc=cache(ctx,'scene'),q=sc.getContext('2d');
  q.setTransform(1,0,0,1,0,0);q.globalAlpha=1;q.globalCompositeOperation='source-over';q.clearRect(0,0,sc.width,sc.height);q.setTransform(dpr,0,0,dpr,-U.x*dpr,-U.y*dpr);
  var R0=G.R0,R1=G.R1,k1=G.k1,w=eio(seg(t,T.world)),M=wmap(G,w),skyM=sm(seg(t,T.sky)),hasW=!!ctx.from;
  // skies: his (re-mapped with the world), hers over it
  if(hasW&&skyM<1){q.drawImage(cache(ctx,'skyW'),M.X0,M.top,RW*M.kx,1100*M.kyU);}
  if(skyM>0||!hasW){q.globalAlpha=hasW?skyM:1;q.drawImage(cache(ctx,'skyM'),R1.x,R1.y,R1.w,640*k1);q.globalAlpha=1;}
  var tideE=sm(seg(t,T.tide)),covered=tideE>=1;
  if(hasW&&!covered){
    // the peaks: flattening onto the fog line, then gone into the haze
    var sq=lerp(1,0.3,eio(seg(t,T.sink))),pa=1-sm(seg(t,T.pkOut)),pw=sm(seg(t,T.pkWarm));
    if(pa>0){var yA=M.yF+(M.top+686*M.kyU-M.yF)*sq,yB=M.yF+(M.top+1100*M.kyU-M.yF)*sq;q.globalAlpha=pa*(1-pw);q.drawImage(cache(ctx,'pk'),M.X0,yA,RW*M.kx,yB-yA);
      if(pw>0){q.globalAlpha=pa*pw;q.drawImage(cache(ctx,'pkWarm'),M.X0,yA,RW*M.kx,yB-yA);}q.globalAlpha=1;}
    // the near world, crisp, then in dusk
    var dk=sm(seg(t,T.dusk));drawBands(q,cache(ctx,'near'),1010,2400,M);
    if(dk>0){q.globalAlpha=dk;drawBands(q,cache(ctx,'nearSoft'),1010,2400,M);q.globalAlpha=1;
      // dusk falls on the near ground: nothing at the fog line, deepest on the rock
      var ya=M.y(1230),yb=M.y(2400),dg=q.createLinearGradient(0,ya,0,yb);dg.addColorStop(0,'rgba(10,8,6,0)');dg.addColorStop(.45,'rgba(10,8,6,'+(.34*dk).toFixed(3)+')');dg.addColorStop(1,'rgba(10,8,6,'+(.5*dk).toFixed(3)+')');
      q.fillStyle=dg;q.fillRect(M.X0,ya,RW*M.kx,yb-ya);}}
  // the ground rises under him: her stubble field as a tide from the bottom up to the stacks' foot
  if(tideE>0||!hasW){var fd=(1-tideE)*R1.h*.03,f=Math.max(24,R1.h*.12),yt=lerp(Math.max(R0.y+R0.h,R1.y+R1.h)+f,R1.y+585*k1-f,tideE);
    if(covered||!hasW)q.drawImage(cache(ctx,'field'),R1.x,R1.y+600*k1,R1.w,1196*k1);
    else{var tm=cache(ctx,'tmp'),tq=tm.getContext('2d');tq.setTransform(1,0,0,1,0,0);tq.globalCompositeOperation='source-over';tq.clearRect(0,0,tm.width,tm.height);tq.setTransform(dpr,0,0,dpr,-U.x*dpr,-U.y*dpr);
      tq.drawImage(cache(ctx,'field'),R1.x,R1.y+600*k1+fd,R1.w,1196*k1);tq.globalCompositeOperation='destination-in';
      var gr=tq.createLinearGradient(0,yt-f,0,yt);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'#000');tq.fillStyle=gr;tq.fillRect(U.x,U.y,U.w,U.h);tq.globalCompositeOperation='source-over';
      q.setTransform(1,0,0,1,0,0);q.drawImage(tm,0,0);q.setTransform(dpr,0,0,dpr,-U.x*dpr,-U.y*dpr);}}
  // the haystacks, the cart, the farm: rising out of the haze on the line where the peaks went down
  var rs=hasW?lerp(0.3,1,eio(seg(t,T.rise))):1,ra=hasW?sm(seg(t,T.riseA)):1;
  if(ra>0){var y0=G.yb1+(R1.y+356*k1-G.yb1)*rs;q.globalAlpha=ra;q.drawImage(cache(ctx,'ftop'),R1.x,y0,R1.w,276*k1*rs);q.globalAlpha=1;}
  // p ≈ 0: the hung Wanderer itself (its layers differ from main.webp by ~1 level), under the fog as in his rest
  var fx=S.warming?0:1-sm(seg(t,T.fromX));if(hasW&&fx>0){var r0=snap(R0,dpr);q.globalAlpha=fx;q.drawImage(cache(ctx,'fromArt'),r0.x,r0.y,r0.w,r0.h);q.globalAlpha=1;}
  // the fog: his valleys' fog thinning, a warm haze band on the rising ground and then on the horizon
  if(S.fog){var fs=fogSize(G.W,G.H),tf=ROM_D+(S.tau0||0)+t,kyL=M.kyL,hzA=0.45*sm(seg(t,T.hazeIn))*(1-0.5*sm(seg(t,T.hazeDown)))*(1-sm(seg(t,T.hazeOut)));
    var yh=lerp(Math.max(R0.y+R0.h,R1.y+R1.h),G.yb1-2,tideE),valA=hasW?REST_VAL*(1-sm(seg(t,T.fogThin))):0;
    if(valA>0.001||hzA>0.001){try{S.fog.draw({W:G.W,H:G.H,t:tf,drift:romDrift(tf),to:[M.X0,M.yF-W_FOG*kyL,RW*M.kx,RH*kyL],valA:valA,hz:[yh,hzA,Math.max(18,R1.h*.085)],warm:sm(seg(t,T.warm)),alpha:1},fs[0],fs[1]);
      q.drawImage(S.fog.canvas,0,0,G.W,G.H);}catch(e){console.error(e);}}}
  // the window: his rectangle widening into hers, its edges soft while the room is dark
  var wn={x:lerp(R0.x,R1.x,w),y:lerp(R0.y,R1.y,w),w:lerp(R0.w,R1.w,w),h:lerp(R0.h,R1.h,w)},Fm=Math.max(10,Math.min(40,Math.min(R0.w,R0.h)*.07)),F=Fm*(sm(seg(t,T.soft))-sm(seg(t,T.sharp)));
  q.globalCompositeOperation='destination-in';
  if(F<0.35){q.fillStyle='#000';q.beginPath();q.rect(U.x-2,U.y-2,U.w+4,U.h+4);q.rect(wn.x,wn.y,wn.w,wn.h);q.globalCompositeOperation='destination-out';q.fill('evenodd');}
  else{var fxr=Math.min(.5,F/wn.w),fyr=Math.min(.5,F/wn.h),gx=q.createLinearGradient(wn.x,0,wn.x+wn.w,0),gy=q.createLinearGradient(0,wn.y,0,wn.y+wn.h);
    [gx,gy].forEach(function(g2,k){var f=k?fyr:fxr;g2.addColorStop(0,'rgba(0,0,0,0)');g2.addColorStop(f,'#000');g2.addColorStop(1-f,'#000');g2.addColorStop(1,'rgba(0,0,0,0)');q.fillStyle=g2;q.fillRect(U.x-2,U.y-2,U.w+4,U.h+4);});}
  q.globalCompositeOperation='source-over';q.setTransform(1,0,0,1,0,0);return sc;}

// ================================================================== the module
var MOD={
  duration:D,
  musicAt:0.715,
  assets:['cut/sky.webp','cut/far.webp','cut/mid.webp','cut/fg.webp','t_wand.webp','t_stick.webp','t_glean.webp','t_others.webp'],
  fromAssets:['cut/sky.webp','cut/far.webp','cut/mid.webp','cut/rock.webp','t_valley.webp'],
  init:function(ctx){var S=ctx.state;myIdx=ctx.to.idx;
    S.im={skyW:ctx.fromAsset('cut/sky.webp'),farW:ctx.fromAsset('cut/far.webp'),midW:ctx.fromAsset('cut/mid.webp'),rockW:ctx.fromAsset('cut/rock.webp'),
      skyM:ctx.asset('cut/sky.webp'),farM:ctx.asset('cut/far.webp'),midM:ctx.asset('cut/mid.webp'),fgM:ctx.asset('cut/fg.webp'),
      wand:ctx.asset('t_wand.webp'),stick:ctx.asset('t_stick.webp'),glean:ctx.asset('t_glean.webp'),others:ctx.asset('t_others.webp')};
    if(!S.fog){S.fog=Fog();if(S.fog)S.fog.valley(ctx.fromAsset('t_valley.webp'));}
    if(!S.fig)S.fig=Fig();
    S.floorC=ctx.layer('floor',{z:4});floorEl=S.floorC;
    var go=function(){prewarm(ctx);};loadBitmaps(ctx).then(go,go);},
  draw:function(p,ctx){var g=ctx.g,S=ctx.state,W=ctx.W,H=ctx.H,t=p*D,F=ctx.from,G=geo(ctx),R0=G.R0,R1=G.R1;myIdx=ctx.to.idx;
    if(!S.warming&&(!S.C||!('art' in S.C))){if(!S.C||!('fromArt' in S.C))cache(ctx,'fromArt');else if(ctx.lastP!=null)cache(ctx,'art');}
    if(ctx.lastP==null&&!S.warming){S.tau0=romTau();
      // the Wanderer's resting fog is taken over: from now on this room draws the same field
      var rf=ctx.fromLayer&&ctx.fromLayer('fog');if(rf&&rf.__fog){try{var fz=fogSize(W,H);rf.__fog.draw({alpha:0},fz[0],fz[1]);}catch(e){}}}
    if(!S.warming)dom(ctx,t);
    var toWall=rgb(ctx.to.wall),fromWall=F?rgb(F.wall):toWall;
    if(p>=1){g.fillStyle=ctx.to.wall;g.fillRect(0,0,W,H);wash(g,W,H,R1,ctx.to.ink,1);drawShadow(g,cache(ctx,'shTo'),1);g.drawImage(cache(ctx,'art'),R1.x,R1.y,R1.w,R1.h);
      if(!S.warming)drawFloorLayer(ctx,floorY(R1),1,R1,null);return;}
    // ---------------- the room: his dark wall, its light and the frame's shadow going; hers coming up at the end
    var room=sm(seg(t,T.room)),ch=1-sm(seg(t,T.chromeOut));
    g.fillStyle=css(mixa(fromWall,toWall,room));g.fillRect(0,0,W,H);
    if(F)wash(g,W,H,R0,F.ink,ch*(1-room));wash(g,W,H,R1,ctx.to.ink,room);
    drawShadow(g,cache(ctx,'shFr'),1-sm(seg(t,T.soft)));drawShadow(g,cache(ctx,'shTo'),sm(seg(t,T.shadow)));
    // ---------------- the picture
    var sc=drawScene(ctx,G,t);g.drawImage(sc,G.U.x,G.U.y,G.U.w,G.U.h);
    // the other two gleaners (behind her)
    var la=eo(seg(t,T.left)),ra=eo(seg(t,T.right));if(la>0||ra>0){var oc=cache(ctx,'others'),os=oc.width/OTHERS[2],k1=G.k1,cut=[680,980];
      if(la>0){g.globalAlpha=la;g.drawImage(oc,0,0,cut[0]*os,oc.height,R1.x+OTHERS[0]*k1,R1.y+OTHERS[1]*k1,cut[0]*k1,OTHERS[3]*k1);}
      if(ra>0){g.globalAlpha=ra;g.drawImage(oc,cut[1]*os,0,(OTHERS[2]-cut[1])*os,oc.height,R1.x+(OTHERS[0]+cut[1])*k1,R1.y+OTHERS[1]*k1,(OTHERS[2]-cut[1])*k1,OTHERS[3]*k1);}
      g.globalAlpha=1;}
    // the figure: him, bending, her
    // (p ≈ 0: the hung picture already shows him; the mesh comes in under it as that fades)
    var fi=sm(seg(t,T.fromX));
    if(F&&fi>0){if(S.fig)ensureTex(ctx);var fg=figure(G,t),aA=(1-sm((fg.m-.45)/.55))*fi,aB=sm(fg.m/.6);
      if(S.fig&&S.fig.ready()){try{S.fig.draw({cw:G.cw,ch:G.ch,box:G.U,pos:G.mS,aA:aA,aB:aB});g.drawImage(S.fig.canvas,G.U.x,G.U.y,G.U.w,G.U.h);}catch(e){console.error(e);}}
      else{ // no WebGL: the two cut-outs, cross-faded in place (no bend)
        var k0=G.k0,k1=G.k1;if(aA>0&&ok(IM(ctx,'wand'))){g.globalAlpha=aA;g.drawImage(IM(ctx,'wand'),R0.x+WAND[0]*k0,R0.y+WAND[1]*k0,WAND[2]*k0,WAND[3]*k0);}
        if(aB>0&&ok(IM(ctx,'glean'))){g.globalAlpha=aB;g.drawImage(IM(ctx,'glean'),R1.x+GLEAN[0]*k1,R1.y+GLEAN[1]*k1,GLEAN[2]*k1,GLEAN[3]*k1);}g.globalAlpha=1;}}
    // his stick stays where it stood and sinks into the stubble
    var se=seg(t,T.stick);if(F&&se<1){var st=cache(ctx,'stick'),k0=G.k0,x=R0.x+STICK[0]*k0,y=R0.y+STICK[1]*k0,w=STICK[2]*k0,h=STICK[3]*k0,cut2=h*sm(se);
      g.save();g.beginPath();g.rect(x-2,y+cut2,w+4,h-cut2+2);g.clip();g.globalAlpha=(1-sm((se-.35)/.65))*fi;if(fi>0)g.drawImage(st,x,y,w,h);g.restore();}
    // hand-over: the hung picture itself
    var fa=S.warming?0:sm(seg(t,T.fin));if(fa>0){g.globalAlpha=fa;g.drawImage(cache(ctx,'art'),R1.x,R1.y,R1.w,R1.h);g.globalAlpha=1;}
    // the room's floor rises to the painted horizon (the wall/floor line IS the horizon of the picture)
    var fe=seg(t,T.floor);if(!S.warming)drawFloorLayer(ctx,lerp(H+30,floorY(R1),eo(fe)),sm(fe/.4),R1,null);
  },
  done:function(ctx){ctx.state.restKey=null;},
  rest:function(ctx){var S=ctx.state;myIdx=ctx.to.idx;
    var r=ctx.to.rect,R=ctx.reading?ctx.readRect:null,c=floorLayer(ctx);
    var key=[ctx.W,ctx.H,c.width,Math.round(r.x*4),Math.round(r.y*4),Math.round(r.w*4),Math.round(r.h*4),R?[R.x,R.y,R.w,R.h].map(Math.round).join():'',ctx.to.ink].join('/');
    if(S.restKey!==key){S.restKey=key;drawFloorLayer(ctx,floorY(r),1,r,R);}
    flat(true);watch();}
};
function ensureTex(ctx){var S=ctx.state;if(!S.fig||S.fig.ready())return;S.fig.his(IM(ctx,'wand'));S.fig.hers(IM(ctx,'glean'));}
// ================================================================== floor layer
function floorLayer(ctx){var S=ctx.state;if(!S.floorC){S.floorC=ctx.layer('floor',{z:4});floorEl=S.floorC;}return S.floorC;}
function drawFloorLayer(ctx,y,a,cut,read){var S=ctx.state,c=floorLayer(ctx),g=c.__g,dpr=ctx.dpr||1,k=[c.width,c.height,ctx.W,ctx.H,y,cut.x,cut.y,cut.w,cut.h,a.toFixed(3),ctx.to.ink].join('/');
  if(S.floorKey===k&&!read)return;S.floorKey=read?null:k;
  g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,c.width,c.height);if(a<=0.001)return;g.setTransform(dpr,0,0,dpr,0,0);floorPaint(g,{W:ctx.W,H:ctx.H,y:y,alpha:a,ink:ctx.to.ink,cut:cut,read:read});}
// ================================================================== DOM: the new room's wall/ink when its light comes up, the title, the label lying flat on the floor
function dom(ctx,t){var S=ctx.state,here=t>=T.ink;
  if(S.domHere!==here){S.domHere=here;if(here){ctx.ui.wall(ctx.to.wall);ctx.ui.ink(ctx.to.ink);}else if(ctx.from){ctx.ui.wall(ctx.from.wall);ctx.ui.ink(ctx.from.ink);}}
  ctx.ui.title(ctx.to.idx,t>=T.title);var lab=t>=T.label;ctx.ui.label(ctx.to.idx,lab);if(lab){placeLabel(ctx);flat(true);}}
// ================================================================== warm-up: every cache in its own task, the textures, then each draw path once on a scratch canvas
function prewarm(ctx){var S=ctx.state,names=ORDER.slice(),P=[.05,.2,.3,.4,.5,.6,.72,.85,.95];
  function step(){try{if(names.length){cache(ctx,names.shift());setTimeout(step,0);return;}
      if(!S.texDone){S.texDone=true;ensureTex(ctx);setTimeout(step,0);return;}
      if(P.length){var p=P.shift(),dpr=ctx.dpr||1,c=S.scratch||(S.scratch=cv(ctx.W*dpr,ctx.H*dpr)),q=c.getContext('2d');q.setTransform(dpr,0,0,dpr,0,0);
        var g0=ctx.g;S.warming=true;ctx.g=q;try{MOD.draw(p,ctx);}finally{ctx.g=g0;S.warming=false;}setTimeout(step,16);return;}
      S.scratch=null;}catch(e){console.error(e);}}
  setTimeout(step,0);}
EH.transition('realism',MOD);
})();

;
/* 印象派 · 太阳只靠颜色存在 — the passage from Millet's Gleaners (realism) into Monet's Impression, Sunrise.
   The idea, in one sentence: 去掉颜色，太阳就不见了——它和天空一样亮，只靠颜色存在。 Monet's orange sun has the lightness of the grey sky
   round it (CIE L* 47.7 vs 47.4, measured on main.webp), so in black-and-white it is simply gone: Impressionism paints colour and light,
   not form. Beats (seconds of D = 13, see T):
   0.3–2.2    the Gleaners drain to L*-matched grey, and the room with them (wall, floor, title, label, controls: one 'saturation' layer
              above everything). Millet reads perfectly in grey — Realism is built on values. Short hold.
   2.6–6.8    still in grey: the frame glides to the new size (2.6–4.7) while the field dissolves dab by dab into Monet's harbour in grey
              (3.1–5.8: ~580 brush dabs on a procedural mask, the mist coming down and the water rising to the horizon; nothing to compute).
              The three gleaners darken into silhouettes (2.8–3.8), lift off and glide/shrink into the three dark boats (5.0–6.2 · 5.2–6.4 ·
              5.4–6.6), each boat surfacing under its woman (left woman → far pale boat, middle → dark left boat, the standing woman → the
              rower's boat). The label comes in (5.9–6.7).
   6.8–8.6    hold: the whole grey harbour, no sun anywhere — it is there, invisible (ΔL* disc/sky 0.4 on screen). The label says 《日出·印象》.
   8.6–9.2    THE MOMENT: colour comes back to one thing only, the orange disc (8.6–9.0) and its short reflections (8.7–9.2), on the
              still-grey picture. Nothing got brighter. The sun stays alone in colour until 10.1.
   10.1–12.5  the rest of the colour flows outward from the sun like morning light, over the picture and on across the wall and the room;
              the morning glow on the wall comes up (10.8–12.7), the title 印象派 (11.0–12.0). 12.5–13 still · hand-over. Music at p .78.
   Rest: a faint morning glow on the wall round the picture (never on the work or the reading panel); EH_SHARED.impressionismRest.
   Assets (rooms/impressionism/, baked by src/t_bake.py; grey = sRGB(Y), i.e. the same CIE L* as the colour pixel):
   t_grey.webp (grey of main.webp) · t_ggrey.webp (grey of realism/main.webp) · t_patch.webp (the three boats covered with grey water
   from cut/plate_clean, per-boat alpha; origin 315,997 in main.webp px) · t_sil.webp (the three gleaners as dark silhouettes, alpha from
   realism/cut/women.webp split by t_women.png) · t_sunalpha.png (alpha of the sun disc + its reflections).
   Performance: init decodes off the main thread (fetch → blob → createImageBitmap, resized/cropped there), builds its canvases one per
   task and pre-paints the real frames once on a scratch canvas so the GPU compiles its pipelines during the realism rest (prewarm). */
(function(){
'use strict';
var D=13, PW=2400, PH=1862, GW=2400, GH=1796;
var T={grey:[0.3,2.2], fromDom:[2.6,3.5], floor:[2.6,4.0], geo:[2.6,4.7], sil:[2.8,3.8], dab:[3.1,4.6], dabDur:.55, fill:[5.3,5.8],
  fly:[[5.0,6.2],[5.2,6.4],[5.4,6.6]], label:[5.9,6.7],
  sun:[8.6,9.0], refl:[8.7,9.2], flow:[10.1,12.5], glow:[10.8,12.7], title:[11.0,12.0]};
// main.webp px: the sun (centre, radius) · the sun+reflections sprite box (split into disc / reflections at y 800)
var SUN=[1460,576,40], SC=[1340,515,1610,1815], SPLIT=800;
// the boats (main.webp px): where each woman lands (hull + figures) · the patch box that hides it (+ the rower's reflection)
var BT=[[328,1009,528,1094],[586,1091,824,1223],[1020,1215,1266,1403]], PB=[[315,997,541,1108],[572,1074,840,1238],[1005,1204,1280,1535]], PO=[315,997];
var TONE=[40.0,29.6,19.2];   // L* of the three boats (median, measured): the silhouettes take this tone as they arrive
// the gleaners (rooms/realism/main.webp px) and their tiles in t_sil.webp
var SRC=[[420,664,1044,1315],[861,737,1601,1443],[1478,527,2102,1577]], ATL=[[0,0,624,651],[628,0,740,706],[1372,0,624,1050]], AW=1996, AH=1050;
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
function ok(im){return !!im&&(im.naturalWidth||im.width)>0;}
function rng(s){s=s>>>0||1;return function(){s=(s+0x6D2B79F5)|0;var t=Math.imul(s^(s>>>15),1|s);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
// grey sRGB value with CIE lightness L
function greyL(L){var fy=(L+16)/116,Y=fy>6/29?fy*fy*fy:(116*fy-16)*27/24389,v=Y<=.0031308?12.92*Y:1.055*Math.pow(Y,1/2.4)-.055;return Math.round(cl(v)*255);}
// the crop of an iw×ih image that covers a box of aspect a
function cover(iw,ih,a){if(iw/ih>a){var w=ih*a;return[(iw-w)/2,0,w,ih];}var h=iw/a;return[0,(ih-h)/2,iw,h];}

// ---------------------------------------------------------------- room furniture (same as the core's DOM: wash, frame shadow, art canvas)
function wash(g,W,H,r,light,a){if(a<=0)return;g.save();g.translate(r.x+r.w/2,r.y+r.h/2);g.scale(.7*W,.6*H);
  var gr=g.createRadialGradient(0,0,0,0,0,1);gr.addColorStop(0,light?'rgba(255,255,255,.35)':'rgba(255,244,225,.08)');gr.addColorStop(.7,light?'rgba(255,255,255,0)':'rgba(255,244,225,0)');
  g.globalAlpha=a;g.fillStyle=gr;g.fillRect(-2,-2,4,4);g.restore();}
function shadowCache(dpr,r){var oy=26,blur=60,spread=-26,M=Math.ceil(1.6*blur+oy+4),X0=r.x-spread-M,Y0=r.y-spread-M,X1=r.x+r.w+spread+M,Y1=r.y+r.h+spread+M;
  var dx=Math.floor(X0*dpr),dy=Math.floor(Y0*dpr),c=cv(Math.ceil(X1*dpr)-dx,Math.ceil(Y1*dpr)-dy),q=c.getContext('2d');q.setTransform(dpr,0,0,dpr,-dx,-dy);
  q.shadowColor='#000';q.shadowBlur=blur*dpr;q.shadowOffsetX=1e5*dpr;q.shadowOffsetY=oy*dpr;q.fillStyle='#000';q.fillRect(r.x-spread-1e5,r.y-spread,r.w+2*spread,r.h+2*spread);
  return{c:c,x:dx/dpr,y:dy/dpr,w:c.width/dpr,h:c.height/dpr,r:{x:r.x,y:r.y,w:r.w,h:r.h}};}
// the shadow of rect sh.r, carried along with the gliding box b
function drawShadow(g,sh,a,b){if(!sh||a<=0)return;var r=sh.r,kx=b?b.w/r.w:1,ky=b?b.h/r.h:1,ox=b?b.x-r.x*kx:0,oy=b?b.y-r.y*ky:0;
  g.save();g.globalAlpha=a;g.drawImage(sh.c,ox+sh.x*kx,oy+sh.y*ky,sh.w*kx,sh.h*ky);g.restore();}
function artW(r,dpr){return Math.min(Math.round(r.w*dpr),2600);}
// the device-pixel rect the browser paints a hung work's canvas into (its layout box, pixel-snapped): the stage draws the works there too
function snap(r,d){var x=Math.round(r.x*d)/d,y=Math.round(r.y*d)/d;return{x:x,y:y,w:Math.round((r.x+r.w)*d)/d-x,h:Math.round((r.y+r.h)*d)/d-y,fp:r.fp};}
// hq: high-quality resampling for the transition's own layers; the two hung works are resampled exactly as the core's paintArt() does
function scaled(src,w,h,hq){var c=cv(w,h),q=c.getContext('2d');if(hq)q.imageSmoothingQuality='high';if(src)q.drawImage(src,0,0,c.width,c.height);return c;}

// ---------------------------------------------------------------- the morning glow (rest extra; also the end state of the colour flow)
function sunAt(r){return[r.x+SUN[0]/PW*r.w,r.y+SUN[1]/PH*r.h];}
function glow(g,W,H,r,a,R){if(a<=0.001)return;var s=sunAt(r);R=R||Math.max(W,H)*.95;g.save();g.beginPath();g.rect(0,0,W,H);g.rect(r.x-2,r.y-2,r.w+4,r.h+4);g.clip('evenodd');
  var gr=g.createRadialGradient(s[0],s[1],0,s[0],s[1],R);gr.addColorStop(0,'rgba(255,164,96,'+(.30*a).toFixed(4)+')');gr.addColorStop(.22,'rgba(236,150,104,'+(.17*a).toFixed(4)+')');
  gr.addColorStop(.5,'rgba(130,156,176,'+(.10*a).toFixed(4)+')');gr.addColorStop(1,'rgba(110,140,160,0)');g.fillStyle=gr;g.fillRect(0,0,W,H);g.restore();}
var REST_A=.42;
function restA(el){return REST_A*(1-.12*(1-Math.cos(2*Math.PI*(el||0)/9))/2);}
SH.impressionismRest=function(g,o){glow(g,o.W,o.H,o.rect,restA(o.t||0));};

// ---------------------------------------------------------------- the dissolve: brush dabs (procedural, once per page)
// Three bristle-brush sprites (white on transparent) and ~580 dabs on a jittered grid over the picture, in box-normalised units.
// A dab is laid left to right (the stroke is pulled out to its full length) in T.dabDur; the order: mostly by band (the mist comes down
// from the top, the water rises from the bottom, they meet at the harbour's horizon), partly random; the dabs under the three women
// land before they lift off.
var BW=256,BH=72,BRUSH=null,DABS=null;
function brushes(){if(BRUSH)return BRUSH;var c=cv(BW*3,BH),q=c.getContext('2d'),R=rng(4242);
  for(var k=0;k<3;k++){q.save();q.translate(k*BW,0);q.fillStyle='#fff';q.strokeStyle='#fff';q.lineCap='round';
    // the loaded body: blunt where the brush lands, thinning to a dry, frayed tail
    q.globalAlpha=.9;q.beginPath();q.moveTo(20,BH*.5);q.bezierCurveTo(20,BH*.24,60,BH*.2,BW*.5,BH*.26);q.bezierCurveTo(BW*.78,BH*.3,BW-26,BH*.4,BW-18,BH*.5);
    q.bezierCurveTo(BW-26,BH*.6,BW*.78,BH*.72,BW*.5,BH*.74);q.bezierCurveTo(60,BH*.8,20,BH*.76,20,BH*.5);q.fill();
    for(var i=0;i<60;i++){var y=BH*(.18+R()*.64),x0=14+R()*44,x1=BW*(.45+R()*.5);q.globalAlpha=.25+R()*.75;q.lineWidth=1+R()*2.6;q.beginPath();q.moveTo(x0,y);q.quadraticCurveTo((x0+x1)/2,y+(R()-.5)*5,x1,y+(R()-.5)*7);q.stroke();}
    q.restore();}
  var s=cv(c.width,c.height),sq=s.getContext('2d');sq.filter='blur(2px)';sq.drawImage(c,0,0);return(BRUSH=s);}
function dabs(){if(DABS)return DABS;var R=rng(90210),out=[],gc=cover(GW,GH,PW/PH),HZ=.41;
  for(var v=-.015;v<1.035;v+=.026){var u=-.08+R()*.08;while(u<1.08){var w=.1+R()*.12,sky=v<HZ;
    // mist comes down from the top, water rises from the bottom; they meet at the harbour's horizon
    var e=sky?v/HZ:(1-v)/(1-HZ);
    out.push({u:u+(R()-.5)*.03,v:v+(R()-.5)*.014,w:w,h:w*(.2+R()*.1)*PW/PH,a:(R()-.5)*(sky?.36:.14),k:(R()*3)|0,key:.62*e+.38*R()});u+=.065+R()*.035;}}
  out.sort(function(a,b){return a.key-b.key;});var n=out.length;
  out.forEach(function(d,i){d.t0=lerp(T.dab[0],T.dab[1],i/(n-1));
    var gx=gc[0]+d.u*gc[2],gy=gc[1]+d.v*gc[3];
    SRC.forEach(function(b,k){var mx=(b[2]-b[0])*.08,my=(b[3]-b[1])*.08;if(gx>b[0]+mx&&gx<b[2]-mx&&gy>b[1]+my&&gy<b[3]-my)d.t0=Math.min(d.t0,T.fly[k][0]-T.dabDur-.35);});});
  out.sort(function(a,b){return a.t0-b.t0;});return(DABS=out);}
function paintDabs(C,t,crop,gc){var q=C.mq,mw=C.mask.width,mh=C.mask.height,L=DABS,B=BRUSH,i,span=T.dab[1]-T.dab[0];
  q.setTransform(1,0,0,1,0,0);q.globalAlpha=1;q.globalCompositeOperation='source-over';q.clearRect(0,0,mw,mh);
  for(i=0;i<L.length;i++){var d=L[i];if(d.t0>=t)break;var e=eo((t-d.t0)/T.dabDur);if(e<=0.002)continue;var c=Math.cos(d.a),s=Math.sin(d.a),w=d.w*mw,h=d.h*mh;
    q.setTransform(c,s,-s,c,d.u*mw,d.v*mh);q.globalAlpha=Math.min(1,e*1.6);q.drawImage(B,d.k*BW,0,BW,BH,-w/2,-h/2,w*(.35+.65*e),h);}
  q.setTransform(1,0,0,1,0,0);q.globalAlpha=1;
  // the gaps between the dabs close band by band, in the order the dabs came (top and bottom first, the horizon last)
  // (9 stops: a gradient with more than 16 falls back to a colour-ramp texture on the GPU, rebuilt every frame — a ~1 s stall on first use)
  var gr=q.createLinearGradient(0,0,0,mh),any=false;for(i=0;i<=8;i++){var v=i/8,be=v<.41?v/.41:(1-v)/.59,te=T.dab[0]+(.62*be+.38)*span+T.dabDur,ga=sm((t-te+.2)/.7);any=any||ga>0;gr.addColorStop(v,'rgba(255,255,255,'+ga.toFixed(3)+')');}
  if(any){q.fillStyle=gr;q.fillRect(0,0,mw,mh);}
  // under the women: their own shapes, stamped once they are fully dark, so the harbour is already there when they lift off
  var st=sm(seg(t,[T.sil[1],T.sil[1]+.3]));if(st>0){q.globalAlpha=st;SRC.forEach(function(b,k){var A2=ATL[k],kt=C.kt,x=(b[0]-gc[0])/gc[2]*mw,y=(b[1]-gc[1])/gc[3]*mh,w=(b[2]-b[0])/gc[2]*mw,h=(b[3]-b[1])/gc[3]*mh;
    q.drawImage(C.sil,A2[0]*kt,A2[1]*kt,A2[2]*kt,A2[3]*kt,x-w*.02,y-h*.02,w*1.04,h*1.04);});q.globalAlpha=1;}
  q.globalCompositeOperation='source-in';q.drawImage(C.harb,crop[0],crop[1],crop[2],crop[3],0,0,mw,mh);q.globalCompositeOperation='source-over';}

// ---------------------------------------------------------------- the colour front: colour amount c(d) = 1 − smoothstep(R − E, R, d) round the sun
function frontGrad(q,x,y,R,E){var g=q.createRadialGradient(x,y,0,x,y,Math.max(R,1e-3)),d0=Math.max(0,R-E);
  function c(d){var s=cl((d-(R-E))/E);return 1-s*s*(3-2*s);}
  g.addColorStop(0,'rgba(0,0,0,'+c(0).toFixed(4)+')');for(var i=0;i<=10;i++){var d=lerp(d0,R,i/10);if(d<=0)continue;g.addColorStop(Math.min(1,d/R),'rgba(0,0,0,'+c(d).toFixed(4)+')');}
  return g;}
function frontAt(ctx,t){var f=seg(t,T.flow);if(f<=0)return null;var to=ctx.to.rect,s=sunAt(to),W=ctx.W,H=ctx.H,E=Math.max(140,to.w*.3);
  var far=Math.max(Math.hypot(s[0],s[1]),Math.hypot(W-s[0],s[1]),Math.hypot(s[0],H-s[1]),Math.hypot(W-s[0],H-s[1]));
  return{x:s[0],y:s[1],E:E,R:lerp(0,far+E+4,sm(f)),done:f>=1};}

// ---------------------------------------------------------------- caches (built in init, one step per task; rebuilt only if the size changes)
function keyOf(ctx){var to=ctx.to.rect,fr=ctx.from?ctx.from.rect:null;return[ctx.W,ctx.H,ctx.dpr||1,to.x,to.y,to.w,to.h,fr?[fr.x,fr.y,fr.w,fr.h].join(','):''].join('/');}
// every cache size, from the current layout
function sizes(ctx){var dpr=ctx.dpr||1,to=ctx.to.rect,F=ctx.from,fr=F?F.rect:to,aw=artW(to,dpr),z={dpr:dpr,to:to,fr:fr,aw:aw,ah:Math.round(aw*PH/PW),sk:aw/PW};
  z.fw=artW(fr,dpr);z.fh=Math.round(z.fw*GH/GW);z.gw=Math.min(GW,Math.round(Math.max(fr.w,to.w*GW/cover(GW,GH,PW/PH)[2])*dpr));z.gh=Math.round(z.gw*GH/GW);
  z.pw=Math.round(965*z.sk);z.ph=Math.round(538*z.sk);z.k=Math.min(1,Math.max(fr.w/GW,to.w/cover(GW,GH,PW/PH)[2])*dpr*1.15);z.sw=Math.round(AW*z.k);z.sh=Math.round(AH*z.k);return z;}
// a decoded bitmap when init made one (decoded, resized or cropped off the main thread), else the <img> itself (and the crop offset)
function src(S,im){var b=S.bm&&im&&S.bm.get(im);return b||(ok(im)?im:null);}
function steps(ctx,S,C){var z=sizes(ctx),to=z.to,fr=z.fr,F=ctx.from,aw=z.aw,ah=z.ah,sk=z.sk,dpr=z.dpr,A=S.im;
  return[
    // the two hung works, resampled exactly as the core's paintArt() does (a full-size upload each: one per task)
    function(){C.art=scaled(src(S,ctx.to.image),aw,ah);},
    function(){if(F){C.fromArt=scaled(src(S,F.image),z.fw,z.fh);C.shFr=F.frame==='none'?shadowCache(dpr,fr):null;}C.shTo=ctx.to.frame==='none'?shadowCache(dpr,to):null;},
    function(){C.grey=scaled(src(S,A.grey),aw,ah,1);C.ggrey=scaled(src(S,A.ggrey),z.gw,z.gh,1);C.kg=z.gw/GW;},
    function(){// the grey harbour with the three boats hidden (what the dabs reveal), the patch alone (per boat), the dissolve buffer
      C.patch=scaled(src(S,A.patch),z.pw,z.ph,1);C.kp=z.pw/965;
      C.harb=cv(aw,ah);var hq=C.harb.getContext('2d');hq.drawImage(C.grey,0,0);hq.drawImage(C.patch,PO[0]*sk,PO[1]*sk,z.pw,z.ph);
      var mw=Math.min(aw,1600);C.mask=cv(mw,Math.round(mw*PH/PW));C.mq=C.mask.getContext('2d');C.front=cv(aw,ah);C.fq=C.front.getContext('2d');},
    function(){// the sun and its reflections in colour: the picture's own pixels through t_sunalpha
      // (on C.art's own pixel grid, so that drawn over the picture it is pixel-identical to it)
      var x=Math.round(SC[0]*sk),y=Math.round(SC[1]*sk),w=Math.round((SC[2]-SC[0])*sk),h=Math.round((SC[3]-SC[1])*sk),c=cv(w,h),q=c.getContext('2d'),
        bm=S.bm&&S.bm.get(A.sunA),sa=bm||(ok(A.sunA)?A.sunA:null),o=bm?SC:[0,0];
      if(sa)q.drawImage(sa,x/sk-o[0],y/sk-o[1],w/sk,h/sk,0,0,w,h);q.globalCompositeOperation='source-in';q.drawImage(C.art,x,y,w,h,0,0,w,h);C.sun=c;C.sx=x;C.sy=y;C.split=Math.round(SPLIT*sk)-y;},
    function(){// the silhouettes at about their largest on-screen size, dark and (for the arrival) flat in each boat's tone
      C.sil=scaled(src(S,A.sil),z.sw,z.sh,1);C.kt=z.sw/AW;C.flat=cv(z.sw,z.sh);var fq=C.flat.getContext('2d');fq.drawImage(C.sil,0,0);fq.globalCompositeOperation='source-in';
      ATL.forEach(function(a,i){var v=greyL(TONE[i]);fq.fillStyle='rgb('+v+','+v+','+v+')';fq.fillRect(a[0]*z.k-1,0,a[2]*z.k+2,z.sh);});
      brushes();dabs();}];}
function ensure(ctx,S){var k=keyOf(ctx);if(S.C&&S.C.key===k)return S.C;if(!S.decoded)return null;var C={};steps(ctx,S,C).forEach(function(f){f();});C.key=k;return(S.C=C);}
// The GPU compiles a pipeline the first time a new kind of draw reaches it (Skia Graphite: a stall of 0.1–1.5 s mid-transition on a
// busy machine). So init paints the real frames once on a scratch canvas — every draw the transition will use, the layer's too — and
// flushes them with createImageBitmap (asynchronous: the compiles happen in the GPU process while the previous room rests).
var WARM=[.5,3.5,4.3,5.0,5.6,6.1,8.9,10.6,11.8];
function prewarm(ctx,S,C,done){var dpr=ctx.dpr||1,W=ctx.W,H=ctx.H,c=cv(W*dpr,H*dpr),q=c.getContext('2d'),L=cv(W*dpr,H*dpr),lq=L.getContext('2d'),k=0,
    to=snap(ctx.to.rect,dpr),fr=ctx.from?snap(ctx.from.rect,dpr):to;
  (function step(){if(k>=WARM.length){Promise.all([c,L].map(function(x){return createImageBitmap(x).then(function(b){b.close();});})).catch(function(){}).then(done);return;}
    var t=WARM[k++];try{q.setTransform(dpr,0,0,dpr,0,0);q.globalAlpha=1;q.globalCompositeOperation='source-over';var r=paint(q,ctx,S,C,t,to,fr);
      lq.setTransform(1,0,0,1,0,0);lq.clearRect(0,0,L.width,L.height);layerPaint(lq,W,H,dpr,.8,r.fill<1?r.box:to,r.fx);}catch(e){}
    if(k===4)createImageBitmap(c).then(function(b){b.close();}).catch(function(){});setTimeout(step,0);})();}

// ---------------------------------------------------------------- one frame of the stage (pure: t, the layout and the caches; any 2D context)
function paint(g,ctx,S,C,t,to,fr){var W=ctx.W,H=ctx.H,F=ctx.from;
    // ===== the room: the realism wall → this room's wall (both greyed by the layer); the wash and the frame shadow travel with the box
    var geo=eio(seg(t,T.geo)),box={x:lerp(fr.x,to.x,geo),y:lerp(fr.y,to.y,geo),w:lerp(fr.w,to.w,geo),h:lerp(fr.h,to.h,geo)},a=box.w/box.h;
    g.fillStyle=F?mixc(hex(F.wall),hex(ctx.to.wall),geo):ctx.to.wall;g.fillRect(0,0,W,H);
    if(F){wash(g,W,H,box,F.ink==='dark',1-geo);drawShadow(g,C.shFr,.6*(1-geo),box);}wash(g,W,H,box,ctx.to.ink==='dark',F?geo:1);drawShadow(g,C.shTo,.6*geo,box);
    // ===== the picture
    var fill=sm(seg(t,T.fill)),fx=frontAt(ctx,t);
    if(fill<1){
      // the Gleaners: colour (exactly the hung pixels at p = 0) draining to grey, cropped to the box as it glides
      var gc=cover(GW,GH,a),kg=C.kg,gA=eio(seg(t,T.grey));
      if(gA<1&&C.fromArt)g.drawImage(C.fromArt,fr.x,fr.y,fr.w,fr.h);
      if(gA>0){g.globalAlpha=gA;g.drawImage(C.ggrey,gc[0]*kg,gc[1]*kg,gc[2]*kg,gc[3]*kg,box.x,box.y,box.w,box.h);g.globalAlpha=1;}
      // … dissolving dab by dab into the grey harbour (boats hidden), then the last gaps close
      var hc=cover(C.harb.width,C.harb.height,a);
      if(t>T.dab[0]){paintDabs(C,t,hc,gc);g.drawImage(C.mask,box.x,box.y,box.w,box.h);}
      if(fill>0){g.globalAlpha=fill;g.drawImage(C.harb,hc[0],hc[1],hc[2],hc[3],box.x,box.y,box.w,box.h);g.globalAlpha=1;}
    }else if(!fx){
      // the grey harbour; each boat surfaces (its patch fades) as its woman arrives
      g.drawImage(C.grey,to.x,to.y,to.w,to.h);var kx=to.w/PW;
      PB.forEach(function(b,i){var f1=T.fly[i][1],pa=1-sm(seg(t,[f1-.3,f1+.3]));if(pa<=0)return;var k=C.kp;g.globalAlpha=pa;
        g.drawImage(C.patch,(b[0]-PO[0])*k,(b[1]-PO[1])*k,(b[2]-b[0])*k,(b[3]-b[1])*k,to.x+b[0]*kx,to.y+b[1]*kx,(b[2]-b[0])*kx,(b[3]-b[1])*kx);g.globalAlpha=1;});
    }else{
      // morning light: the colour flows outward from the sun (the grey keeps a widening hole round it)
      g.drawImage(C.art,to.x,to.y,to.w,to.h);
      if(!fx.done){var q=C.fq,aw=C.front.width,s=aw/to.w;q.setTransform(1,0,0,1,0,0);q.globalCompositeOperation='copy';q.drawImage(C.grey,0,0);
        q.globalCompositeOperation='destination-out';q.fillStyle=frontGrad(q,(fx.x-to.x)*s,(fx.y-to.y)*s,fx.R*s,fx.E*s);q.fillRect(0,0,aw,C.front.height);q.globalCompositeOperation='source-over';
        g.drawImage(C.front,to.x,to.y,to.w,to.h);}
    }
    // ===== the three gleaners: silhouettes in place, then lifted into the boats
    var da=sm(seg(t,T.sil));
    if(da>0)for(var i=0;i<3;i++){var f=T.fly[i],u=eio(seg(t,f)),lf=1-sm(seg(t,[f[1]-.25,f[1]+.25]));if(lf<=0)continue;
      var b=SRC[i],gc2=cover(GW,GH,a),kx2=box.w/gc2[2],ky2=box.h/gc2[3],w0=(b[2]-b[0])*kx2,h0=(b[3]-b[1])*ky2,x0=box.x+(b[0]-gc2[0])*kx2+w0/2,y0=box.y+(b[1]-gc2[1])*ky2+h0/2;
      var B=BT[i],kb=to.w/PW,w1=(B[2]-B[0])*kb,h1=(B[3]-B[1])*kb,x1=to.x+(B[0]+B[2])/2*kb,y1=to.y+(B[1]+B[3])/2*kb;
      // size shrinks all the way; the shape turns from the bent figure into the long low boat only in the second half
      var s0=Math.sqrt(w0*h0),s1=Math.sqrt(w1*h1),sz=Math.exp(lerp(Math.log(s0),Math.log(s1),u)),as=Math.exp(lerp(Math.log(w0/h0),Math.log(w1/h1),sm(seg(u,[.45,1])))),
        w=sz*Math.sqrt(as),h=sz/Math.sqrt(as),cx=lerp(x0,x1,u),cy=lerp(y0,y1,u)-Math.sin(Math.PI*u)*to.h*.035,A2=ATL[i],kt=C.kt;
      g.globalAlpha=da*lf;g.drawImage(C.sil,A2[0]*kt,A2[1]*kt,A2[2]*kt,A2[3]*kt,cx-w/2,cy-h/2,w,h);
      var m=sm(seg(u,[.25,1]));if(m>0){g.globalAlpha=da*lf*m;g.drawImage(C.flat,A2[0]*kt,A2[1]*kt,A2[2]*kt,A2[3]*kt,cx-w/2,cy-h/2,w,h);}g.globalAlpha=1;}
    // ===== THE MOMENT: the sun and its reflections alone in colour (kept on top through the flow; identical pixels at the end)
    var sa=eo(seg(t,T.sun)),reach=Math.hypot(SC[2]-SUN[0],SC[3]-SUN[1])*to.w/PW;
    if(sa>0&&!(fx&&fx.R-fx.E>reach)){var kxA=to.w/C.art.width,kyA=to.h/C.art.height,sw=C.sun.width,sh=C.sun.height,sp=C.split,X=to.x+C.sx*kxA,Y=to.y+C.sy*kyA;
      g.globalAlpha=sa;g.drawImage(C.sun,0,0,sw,sp,X,Y,sw*kxA,sp*kyA);
      // the reflections come a moment later, top to bottom, in five bands
      for(var j=0;j<5;j++){var r0=Math.round(sp+(sh-sp)*j/5),r1=Math.round(sp+(sh-sp)*(j+1)/5),ra=eo(seg(t,[T.refl[0]+j*.06,T.refl[1]-(4-j)*.03]));if(ra<=0)break;
        g.globalAlpha=ra;g.drawImage(C.sun,0,r0,sw,r1-r0,X,Y+r0*kyA,sw*kxA,(r1-r0)*kyA);}
      g.globalAlpha=1;}
    glow(g,W,H,ctx.to.rect,REST_A*sm(seg(t,T.glow)));
  return{box:box,fill:fill,fx:fx};}

// ---------------------------------------------------------------- the grey layer: a neutral fill with mix-blend 'saturation' above the whole room
// (wall, floor, title, label, controls) except the picture, which the stage greys itself with the exact L* grey
function layerPaint(g,W,H,dpr,A,box,fx){g.setTransform(dpr,0,0,dpr,0,0);g.save();g.beginPath();g.rect(0,0,W,H);g.rect(box.x,box.y,box.w,box.h);g.clip('evenodd');g.globalAlpha=A;g.fillStyle='#808080';g.fillRect(0,0,W,H);g.restore();
  if(fx){g.globalCompositeOperation='destination-out';g.fillStyle=frontGrad(g,fx.x,fx.y,fx.R,fx.E);g.fillRect(0,0,W,H);g.globalCompositeOperation='source-over';}}
function greyLayer(ctx,S,A,box,fx){var c=S.lay;if(!c)return;var g=c.__g,dpr=ctx.dpr||1,W=ctx.W,H=ctx.H;
  var on=A>0.001&&!(fx&&fx.done),k=on?[W,H,c.width,A.toFixed(3),box.x.toFixed(1),box.y.toFixed(1),box.w.toFixed(1),box.h.toFixed(1),fx?fx.R.toFixed(1):''].join('/'):'off';
  if(S.layKey===k)return;S.layKey=k;g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='source-over';g.globalAlpha=1;g.clearRect(0,0,c.width,c.height);
  var vis=on?'':'hidden';if(c.style.visibility!==vis)c.style.visibility=vis;if(on)layerPaint(g,W,H,dpr,A,box,fx);}

// ---------------------------------------------------------------- DOM: the previous room's title/label/floor fade out; ours come in, set by p
var dirty=[],watching=false,myIdx=-1;
function setCss(el,prop,val){if(!el)return;if(el.style[prop]!==val)el.style[prop]=val;if(dirty.indexOf(el)<0){dirty.push(el);watch();}}
function clean(){dirty.forEach(function(el){el.style.opacity='';el.style.transition='';});dirty=[];}
function watch(){if(watching)return;watching=true;(function loop(){var st=window.EH&&EH.debug&&EH.debug.state;
  if(!st||st.idx!==myIdx||(st.phase!=='enter'&&st.phase!=='rest')){clean();fromLayers(null);watching=false;return;}requestAnimationFrame(loop);})();}
// the previous room's overlay layers (the realism floor) fade with its room. Through CSS filter, not opacity: the realism module's own
// watcher rewrites its floor's style.opacity while the next room enters.
var fromL=[];
function fromLayers(a,mine){if(a==null){fromL.forEach(function(el){el.style.filter='';});fromL=[];return;}
  Array.prototype.forEach.call(document.querySelectorAll('canvas.ovl'),function(el){if(el!==mine&&el.style.display!=='none'&&fromL.indexOf(el)<0)fromL.push(el);});
  var v=a>=.999?'':'opacity('+a.toFixed(3)+')';fromL.forEach(function(el){if(el.style.filter!==v)el.style.filter=v;});if(fromL.length)watch();}
var labKey=null;
function placeLabel(ctx){var l=document.getElementById('lab'+ctx.to.idx);if(!l)return;var r=ctx.to.rect,lk=[innerWidth,innerHeight,r.x,r.y,r.w,r.h,l.textContent.length].join('/');if(lk===labKey&&l.style.left)return;labKey=lk;var fp=r.fp||0,f={left:r.x-fp,right:r.x+r.w+fp,bottom:r.y+r.h+fp};
  var W=innerWidth,Hh=innerHeight,wide=W>1180,h=l.offsetHeight,w=l.offsetWidth,g=W<=560?16:36,ft=document.querySelector('.foot'),footTop=ft?ft.getBoundingClientRect().top:Hh-80;
  var land=W<=980&&Hh<520&&W>Hh,x,y;
  if(wide){x=Math.round(f.right+34);y=Math.round(Math.max(64,Math.min(f.bottom-h,footTop-24-h)));}
  else if(land){var eb=document.getElementById('era'+ctx.to.idx);eb=eb?eb.getBoundingClientRect():null;x=Math.round(W*.58+24);y=Math.round((eb?eb.bottom:40)+14);}
  else{x=Math.round(Math.min(Math.max(f.left,g),W-g-w));y=Math.round(f.bottom+16);}
  var xs=x+'px',ys=y+'px';if(l.style.left!==xs)l.style.left=xs;if(l.style.top!==ys)l.style.top=ys;}
function fade(el,a){if(!el)return;if(a>.001)el.classList.add('on');else el.classList.remove('on');setCss(el,'transition','none');setCss(el,'opacity',a>.001?a.toFixed(3):'0');}
function dom(ctx,S,t){var F=ctx.from,fd=1-sm(seg(t,T.fromDom));
  if(F){fade(document.getElementById('era'+F.idx),fd);fade(document.getElementById('lab'+F.idx),fd);}
  fromLayers(1-sm(seg(t,T.floor)),S.lay);
  var here=!F||t>=T.fromDom[1],wall=here?ctx.to.wall:F.wall,ink=here?ctx.to.ink:F.ink;if(S.wallNow!==wall){ctx.ui.wall(wall);S.wallNow=wall;}if(S.inkNow!==ink){ctx.ui.ink(ink);S.inkNow=ink;}
  var la=sm(seg(t,T.label));fade(document.getElementById('lab'+ctx.to.idx),la);if(la>0)placeLabel(ctx);
  fade(document.getElementById('era'+ctx.to.idx),sm(seg(t,T.title)));}

// ---------------------------------------------------------------- the frame
function endFrame(g,ctx,C){var W=ctx.W,H=ctx.H,to=ctx.to.rect,ts=snap(to,ctx.dpr||1);g.fillStyle=ctx.to.wall;g.fillRect(0,0,W,H);wash(g,W,H,to,ctx.to.ink==='dark',1);
  if(C&&C.shTo)drawShadow(g,C.shTo,.6);if(C)g.drawImage(C.art,ts.x,ts.y,ts.w,ts.h);else if(ok(ctx.to.image))g.drawImage(ctx.to.image,ts.x,ts.y,ts.w,ts.h);glow(g,W,H,to,restA(0));}
var MOD={
  duration:D,
  musicAt:.78,   // t = 10.1: the room's music comes in with the colour, after the sun has been found
  assets:['t_grey.webp','t_ggrey.webp','t_patch.webp','t_sil.webp','t_sunalpha.png'],
  fromAssets:[],
  init:function(ctx){var S=ctx.state;myIdx=ctx.to.idx;
    S.im={grey:ctx.asset('t_grey.webp'),ggrey:ctx.asset('t_ggrey.webp'),patch:ctx.asset('t_patch.webp'),sil:ctx.asset('t_sil.webp'),sunA:ctx.asset('t_sunalpha.png')};
    S.lay=ctx.layer('grey',{z:8,blend:'saturation'});S.lay.style.visibility='hidden';S.layKey=null;
    // decode off the main thread (a blob → createImageBitmap, resized or cropped there; drawing an <img> would decode it synchronously),
    // all at once; then the caches, one step per task, and the GPU pipelines (prewarm). Until then draw() holds the p = 0 / p = 1 frames.
    var z=sizes(ctx),hi={resizeQuality:'high'},jobs=[[ctx.to.image],[ctx.from&&ctx.from.image],[S.im.grey,{resizeWidth:z.aw,resizeHeight:z.ah}],[S.im.ggrey,{resizeWidth:z.gw,resizeHeight:z.gh}],
      [S.im.patch,{resizeWidth:z.pw,resizeHeight:z.ph}],[S.im.sil,{resizeWidth:z.sw,resizeHeight:z.sh}],[S.im.sunA,null,[SC[0],SC[1],SC[2]-SC[0],SC[3]-SC[1]]]].filter(function(j){return ok(j[0]);});S.bm=new Map();
    function cib(x,o,c){return c?createImageBitmap(x,c[0],c[1],c[2],c[3]):o?createImageBitmap(x,Object.assign({},hi,o)):createImageBitmap(x);}
    function dec(j){var im=j[0];if(!window.createImageBitmap)return Promise.resolve();
      return fetch(im.currentSrc||im.src).then(function(r){if(!r.ok)throw 0;return r.blob();}).then(function(b){return cib(b,j[1],j[2]);})
        .catch(function(){return cib(im,j[1],j[2]);}).then(function(b){if(b)S.bm.set(im,b);}).catch(function(){});}
    function next(){return new Promise(function(r){setTimeout(r,0);});}
    Promise.all(jobs.map(dec)).then(function(){S.decoded=true;var C={},L=steps(ctx,S,C),k=keyOf(ctx),ch=Promise.resolve();
      L.forEach(function(f){ch=ch.then(next).then(f);});
      return ch.then(function(){return new Promise(function(r){prewarm(ctx,S,C,r);});}).then(function(){C.key=k;if(keyOf(ctx)===k||!S.C)S.C=C;
        // the bitmaps are only needed to build the caches; a later resize rebuilds from the <img>s
        S.bm.forEach(function(b){try{b.close();}catch(e){}});S.bm=null;S.ready=true;window.__impReady=true;});}).catch(function(e){console.error(e);});},
  draw:function(p,ctx){var g=ctx.g,S=ctx.state,W=ctx.W,H=ctx.H,t=p*D,dpr=ctx.dpr||1,to=snap(ctx.to.rect,dpr),F=ctx.from,fr=F?snap(F.rect,dpr):to;myIdx=ctx.to.idx;S.restT0=null;
    if(!S.lay){S.lay=ctx.layer('grey',{z:8,blend:'saturation'});S.layKey=null;}
    var C=S.ready?ensure(ctx,S):null;
    if(p>=1||!C){if(p<1&&F&&t<D/2){g.fillStyle=F.wall;g.fillRect(0,0,W,H);wash(g,W,H,fr,F.ink==='dark',1);g.drawImage(F.image,fr.x,fr.y,fr.w,fr.h);}else endFrame(g,ctx,C);
      if(p>=1){greyLayer(ctx,S,0,to,null);dom(ctx,S,D);}return;}
    dom(ctx,S,t);var r=paint(g,ctx,S,C,t,to,fr);
    // At the hand-over the core paints the hung work from its <img>, and the canvas raster decodes it there, synchronously (~70–180 ms,
    // a visible hitch). Have that decode done now instead (a task of its own, at the same size), while the frame still equals the
    // realism rest and nothing moves yet.
    if(t<.5&&!S.warmImg&&ok(ctx.to.image)){S.warmImg=true;var im=ctx.to.image,z=sizes(ctx);setTimeout(function(){try{var wc=cv(z.aw,z.ah),wq=wc.getContext('2d');wq.drawImage(im,0,0,z.aw,z.ah);wq.getImageData(0,0,1,1);}catch(e){}},0);}
    // ===== the room's colour: drains with the Gleaners, comes back with the front
    greyLayer(ctx,S,F?sm(seg(t,T.grey)):1,r.fill<1?r.box:to,r.fx);
  },
  done:function(ctx){var S=ctx.state;S.restT0=performance.now()/1000;greyLayer(ctx,S,0,ctx.to.rect,null);},
  rest:function(ctx){var S=ctx.state,now=performance.now()/1000;myIdx=ctx.to.idx;if(S.restT0==null)S.restT0=now;var el=now-S.restT0;
    if(S.lay&&S.layKey!=='off')greyLayer(ctx,S,0,ctx.to.rect,null);
    // the title/label were already fully on at the hand-over: hold them through the core's own fade-in window, then hand the styles back
    if(el<1.5&&!ctx.reading){ctx.ui.title(ctx.to.idx,true);ctx.ui.label(ctx.to.idx,true);}else if(dirty.length)clean();
    var g=ctx.g,r=ctx.to.rect;glow(g,ctx.W,ctx.H,r,restA(el));
    if(ctx.reading&&ctx.readRect){var R=ctx.readRect;g.clearRect(R.x,R.y,R.w,R.h);}}
};
EH.transition('impressionism',MOD);
})();

;
/* 后印象派 · 颜色在眼睛里调 — the passage from Monet's Impression, Sunrise (impressionism) into Seurat's A Sunday on La Grande Jatte.
   The one discovery: 凑近看，莫奈的太阳是一团糊掉的橙色笔触；修拉把它拆成纯橙和纯蓝的点——退后几步，画在你的眼睛里合成。
   (Seurat replaced mixing on the palette with mixing in the eye.)
   Beats (seconds of D = 14, see T):
   0–0.4     the impressionism room at rest (white frame, the morning glow on the wall).
   0.4–3.5   one slow push-in (a single zoom about a fixed point) into Monet's sun until the screen lies inside the disc: a soft, mixed,
             orange-red smear, brush swirl and all (full screen because we go closer than the frame).
   3.6       tick 1: the smear breaks into discrete, equal round dots — each still the smear's mixed colour — with the canvas between them.
   4.05 · 4.5 · 4.95   ticks 2–4: the mixture splits, a third at each tick, into pure orange and its complementary pure blues. Hold to 5.8
             (the camera keeps creeping in by 5 %, no cut; the dots slowly swell to the size of Seurat's touches until 6.8).
   5.8–6.8   the same dots are the Grande Jatte's own dots inside the fishing woman's orange skirt (the one place where orange and blue
             dominate): each dot eases to its own pigment (only the skirt's greens and near-blacks appear) and to its dab shape.
   6.8–12.6  THE MOMENT: one uninterrupted pull-back (0.6 s ease-in, quick through the big abstract dots, then an even, slower rate while the
             figures appear and fuse — dot pitch 12 → 2 px from ~8.1 to ~11 s — and a soft landing), nothing else happens: the dots shrink and fuse in the
             eye into the skirt, the fishing woman, the Seine, the lawn and the parasols; the picture arrives in its rest rect with Seurat's
             painted dot border. The dots never change colour here: they are pure pigments whose local mean is the painting (error
             diffusion of main.webp over the dots), so what mixes them is the eye; below ~2.9 device px the mipmapped image takes over.
   12.4 · 12.8   the vertical title, then the label, fade in; 12.9–13.7 the exact hung picture (the DOM's resampling) takes over · 14 hand-over.
   Music of this room: p = .88 (12.3 s), after the pull-back.
   Rendering: 2D for the walls, frames, shadows and the Monet exactly as hung (rest-resampled canvas, pixel-snapped like the compositor,
   on top until the zoom passes 1.25x); one offscreen WebGL2 canvas (copied onto the stage) for the mipmapped Monet and t_sun.webp (the
   3840-px scan's sun at 2x, feathered), the canvas ground, the 201 k dots (instanced quads; x, y, radius and pigment fetched from
   textures by gl_InstanceID — no per-dot JS) and the mipmapped Grande Jatte. Init decodes off the main thread (createImageBitmap of
   fetched blobs), finishes the shaders a task later (parallel compile) and does one upload / cache per task; nothing waits for a
   computation and no task is long.
   Assets (rooms/postimpressionism/): t_dots.png (dot x, y, radius, from cut/dots.bin), t_col.png (pigment per dot, and for the landing
   dots the orange/blue split they show first; built by _wip/t-postimpressionism/make_col.py), t_sun.webp. No rest extras. */
(function(){
'use strict';
var D=14,MW=2400,MH=1862,PW=2400,PH=1598,SP=4.37,NDOT=201153;
// make_col.py (_wip/t-postimpressionism/col.json): the pigments, Monet's sun (main px), the landing point in the Grande Jatte, Monet px per GJ px there
var PAL=[[228,106,44],[48,108,205],[40,58,150],[26,30,84],[236,230,212],[230,205,80],[140,165,50],[40,145,90],[28,28,40]];
var SUN=[1461,576],SUNR=37,SUNBOX=[1310,425,300,300],LAND=[270,805],RM=0.6;
var BEIGE=[232/255,222/255,200/255],CREEP=.05,R0=.62,RF=.9;
var T={push:[0.4,3.5],glowOut:[0.5,2.4],fromOut:[0.4,2.0],chromeOff:1.6,swap:3.5,
  ticks:[3.6,4.05,4.5,4.95],tk:.18,appear:.34,monetOff:3.9,creep:[3.0,6.8],grow:[3.6,6.8],land:[5.8,6.8],landAt:5.75,landSpan:.55,
  pull:[6.8,12.6],chromeOn:11.8,imgBy:[11.4,12.6],title:12.4,label:12.8,fin:[12.9,13.7]};

function clamp(x){return x<0?0:x>1?1:x;}
function seg(t,a){return clamp((t-a[0])/(a[1]-a[0]));}
function lerp(a,b,u){return a+(b-a)*u;}
function sm(x){x=clamp(x);return x*x*(3-2*x);}
function eo(x){x=clamp(x);return 1-Math.pow(1-x,3);}
function eio(x){x=clamp(x);return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;}
function cv(w,h){var c=document.createElement('canvas');c.width=Math.max(1,Math.round(w));c.height=Math.max(1,Math.round(h));return c;}

// ---------------------------------------------------------------- the DOM rest look (index.html): .wash, the frame shadows, frame decorations, paintArt's resampling
function wash(g,W,H,r,light,a){if(a<=0)return;g.save();g.translate(r.x+r.w/2,r.y+r.h/2);g.scale(.7*W,.6*H);
  var gr=g.createRadialGradient(0,0,0,0,0,1);gr.addColorStop(0,light?'rgba(255,255,255,.35)':'rgba(255,244,225,.08)');gr.addColorStop(.7,light?'rgba(255,255,255,0)':'rgba(255,244,225,0)');
  g.globalAlpha=a;g.fillStyle=gr;g.fillRect(-2,-2,4,4);g.restore();}
var SHADOW={none:[26,60,-26,.6],white:[22,50,-22,.45],gilt:[28,70,-24,.8],stone:[24,60,-24,.7]};
function shadowCache(dpr,r,style){var sp=SHADOW[style]||SHADOW.none,fp=style&&style!=='none'&&style!=='fade'?(r.fp||0):0;r={x:r.x-fp,y:r.y-fp,w:r.w+2*fp,h:r.h+2*fp};var oy=sp[0],blur=sp[1],spread=sp[2],M=Math.ceil(1.6*blur+oy+4),X0=r.x-spread-M,Y0=r.y-spread-M,X1=r.x+r.w+spread+M,Y1=r.y+r.h+spread+M;
  var dx=Math.floor(X0*dpr),dy=Math.floor(Y0*dpr),c=cv(Math.ceil(X1*dpr)-dx,Math.ceil(Y1*dpr)-dy),q=c.getContext('2d');q.setTransform(dpr,0,0,dpr,-dx,-dy);
  q.shadowColor='#000';q.shadowBlur=blur*dpr;q.shadowOffsetX=1e5*dpr;q.shadowOffsetY=oy*dpr;q.fillStyle='#000';q.fillRect(r.x-spread-1e5,r.y-spread,r.w+2*spread,r.h+2*spread);
  return{c:c,x:dx/dpr,y:dy/dpr,w:c.width/dpr,h:c.height/dpr,r:{x:r.x,y:r.y,w:r.w,h:r.h},a:sp[3]};}
// the shadow of a rest rect, carried to where the camera has the picture (rc)
function drawShadow(g,sh,a,rc){if(!sh||a<=0)return;g.save();g.globalAlpha=a;if(rc){var s=rc.w/sh.r.w;g.translate(rc.x,rc.y);g.scale(s,s);g.translate(-sh.r.x,-sh.r.y);}g.drawImage(sh.c,sh.x,sh.y,sh.w,sh.h);g.restore();}
function frameDeco(g,r,style,a){var fp=r.fp||0;if(!fp||a<=0||style==='none'||style==='fade')return;var x=r.x-fp,y=r.y-fp,w=r.w+2*fp,h=r.h+2*fp;g.save();g.globalAlpha=a;
  if(style==='gilt'){g.fillStyle='#1c1409';g.fillRect(x,y,w,h);g.fillStyle='#7a5e35';g.fillRect(x+1,y+1,w-2,h-2);g.fillStyle='#241a0c';g.fillRect(x+5,y+5,w-10,h-10);g.fillStyle='#4a371c';g.fillRect(x+6,y+6,w-12,h-12);}
  else if(style==='white'){g.fillStyle='rgba(0,0,0,.07)';g.fillRect(x,y,w,h);g.fillStyle='#f2f0eb';g.fillRect(x+1,y+1,w-2,h-2);g.fillStyle='rgba(0,0,0,.08)';g.fillRect(x+9,y+9,w-18,h-18);g.fillStyle='#f2f0eb';g.fillRect(x+10,y+10,w-20,h-20);}
  else if(style==='stone'){g.fillStyle='rgba(0,0,0,.4)';g.fillRect(x,y,w,h);g.fillStyle='#4d4840';g.fillRect(x+1,y+1,w-2,h-2);}
  g.restore();}
// the hung picture exactly as core paintArt resamples it, and where the compositor puts it (both edges snapped to device pixels)
function snapR(r,dpr){var x=Math.round(r.x*dpr)/dpr,y=Math.round(r.y*dpr)/dpr;return{x:x,y:y,w:Math.round((r.x+r.w)*dpr)/dpr-x,h:Math.round((r.y+r.h)*dpr)/dpr-y};}
function artCanvas(src,natW,natH,r,dpr){var w=Math.min(Math.round(r.w*dpr),2600),h=Math.round(w*natH/natW),c=cv(w,h);if(src)c.getContext('2d').drawImage(src,0,0,w,h);return c;}

// ---------------------------------------------------------------- the pull-back's pace (log-zoom progress): 0.6 s ease-in, quick through the big abstract dots,
// then an even, slower rate while the figures appear and fuse (pitch 12 → 2 px from ~8.1 to ~11 s), and one soft landing
var PROF=(function(){var n=600,v=[],s=0,out=[0];for(var i=0;i<n;i++){var u=(i+.5)/n;v.push(sm(u/.1)*(.45+.9*Math.exp(-Math.pow((u-.12)/.14,2)))*(1-sm((u-.7)/.3)));}
  for(i=0;i<n;i++){s+=v[i];out.push(s);}return out.map(function(x){return x/s;});})();
function prof(u){u=clamp(u)*(PROF.length-1);var i=Math.floor(u),f=u-i;return i>=PROF.length-1?1:lerp(PROF[i],PROF[i+1],f);}
// the creep during the ticks: extra log-zoom, velocity (1 − cos) — zero where the push-in ends and where the pull-back starts
function creep(t){var u=seg(t,T.creep);return CREEP*(u-Math.sin(2*Math.PI*u)/(2*Math.PI));}

// ---------------------------------------------------------------- geometry per layout
function geo(ctx){var W=ctx.W,H=ctx.H,R=ctx.to.rect,F=ctx.from?ctx.from.rect:null,dpr=ctx.dpr||1,S=ctx.state;
  var key=[W,H,dpr,R.x,R.y,R.w,R.h,F?[F.x,F.y,F.w,F.h,F.fp||0].join():''].join('/');if(S.G&&S.G.key===key)return S.G;
  var G={key:key,W:W,H:H,R:R,dpr:dpr,C:[W/2,H/2]};
  G.F=F||{x:W*.2,y:H*.15,w:W*.6,h:W*.6*MH/MW};G.kM0=G.F.w/MW;G.sun0=[G.F.x+SUN[0]*G.kM0,G.F.y+SUN[1]*G.kM0];
  // the push-in ends with the whole screen inside the sun disc
  G.kS=Math.max(Math.hypot(W,H)*1.02/(2*SUNR),G.kM0*4);G.zS=G.kS/G.kM0;
  G.Zm=[(G.C[0]-G.sun0[0]*G.zS)/(1-G.zS),(G.C[1]-G.sun0[1]*G.zS)/(1-G.zS)];
  // the pull-back: one scaling about the fixed point Z (GJ point gZ), from the landing (GL at the screen centre) to the rest rect
  G.k1=R.w/PW;G.kLe=RM*G.kS*Math.exp(CREEP);
  G.gZ=[(G.C[0]-R.x-LAND[0]*G.kLe)/(G.k1-G.kLe),(G.C[1]-R.y-LAND[1]*G.kLe)/(G.k1-G.kLe)];G.Z=[R.x+G.gZ[0]*G.k1,R.y+G.gZ[1]*G.k1];
  return(S.G=G);}
// Monet camera: screen = a·(rest screen point) + b
function monCam(G,t){var u=seg(t,T.push),E=(1-Math.cos(Math.PI*u))/2,z=Math.exp(Math.log(G.zS)*E),e=Math.exp(creep(t));
  return{a:z*e,bx:G.C[0]*(1-e)+G.Zm[0]*(1-z)*e,by:G.C[1]*(1-e)+G.Zm[1]*(1-z)*e,k:G.kM0*z*e};}
// Grande Jatte camera: screen = o + g·k (continuous with the Monet camera: the sun's centre and GL share the screen centre)
function gjCam(G,t){if(t<T.pull[0]){var k=RM*G.kS*Math.exp(creep(t));return{k:k,ox:G.C[0]-LAND[0]*k,oy:G.C[1]-LAND[1]*k,E:0};}
  var E=prof(seg(t,T.pull)),k1=Math.exp(lerp(Math.log(G.kLe),Math.log(G.k1),E));return{k:k1,ox:G.Z[0]-G.gZ[0]*k1,oy:G.Z[1]-G.gZ[1]*k1,E:E};}

// ================================================================== WebGL2
var VS_DOT=['#version 300 es','precision highp float;precision highp int;',
'layout(location=0) in vec2 aQ;',
'uniform highp sampler2D uDots;uniform highp sampler2D uCol;uniform sampler2D uSun;',
'uniform vec2 uView;uniform float uDpr,uT;uniform vec3 uCam;uniform vec4 uSunMap;uniform vec3 uPal[9];uniform vec4 uPh;uniform vec2 uLand;uniform float uRf;',
'out vec2 vQ;out vec3 vCol;out float vA;out float vPx;out vec3 vSh;out float vIrr;',
'float h1(float n){return fract(sin(n*12.9898+78.233)*43758.5453);}',
'void off(){gl_Position=vec4(2.,2.,2.,1.);vQ=vec2(0.);vCol=vec3(0.);vA=0.;vPx=1.;vSh=vec3(1.,0.,1.);vIrr=0.;}',
'void main(){int id=gl_InstanceID;int i0=id*2,i1=id*2+1;',
'  vec3 p0=floor(texelFetch(uDots,ivec2(i0&1023,i0>>10),0).rgb*255.+.5);vec3 p1=floor(texelFetch(uDots,ivec2(i1&1023,i1>>10),0).rgb*255.+.5);',
'  vec2 g=vec2(p0.r*256.+p0.g,p0.b*256.+p1.r)/16.;float rr=p1.g/20.;vec2 pos=uCam.xy+g*uCam.z;float pad=1.2/uDpr;',
'  float hm=rr*uCam.z*1.42+pad;if(uPh.x<=.002||pos.x<-hm||pos.y<-hm||pos.x>uView.x+hm||pos.y>uView.y+hm){off();return;}',   // off screen: no further fetches
'  float cb=floor(texelFetch(uCol,ivec2(id&1023,id>>10),0).r*255.+.5);int cG=int(mod(cb,16.));int cM=int(floor(cb/16.));',
'  float fid=float(id);vec3 col=uPal[cG];float r=rr*uCam.z;float irr=1.;float rf=uRf;',
'  if(cM<15){',   // a landing dot: first Monet's smear (sampled), split into its orange/blue pigment, then the Grande Jatte's own pigment
'    vec3 mixc=textureLod(uSun,g*uSunMap.x+uSunMap.yz,uSunMap.w).rgb;vec3 mc=mix(mixc,uPal[cM],uPh.y);',
'    float ls=uLand.x+uLand.y*h1(fid*.731+.13);col=mix(mc,col,smoothstep(0.,1.,clamp((uT-ls)/.5,0.,1.)));rf=uPh.z;irr=uPh.w;}',
'  r*=rf;float px=r*uDpr;irr*=step(4.,px);',   // the dab shape only where a dot is big enough to show it
'  float asp=1.+.26*h1(fid*1.3+.5);float ro=6.2831*h1(fid*2.1+.9);vSh=vec3(cos(ro),sin(ro),asp);vIrr=irr;',
'  float hs=r*mix(1.12,1.42,irr)+pad;',
'  vQ=aQ*(hs/max(r,1e-3));vPx=px;vCol=col;vA=uPh.x;',
'  vec2 P=pos+aQ*hs;gl_Position=vec4(P.x/uView.x*2.-1.,1.-P.y/uView.y*2.,0.,1.);}'].join('\n');
var FS_DOT=['#version 300 es','precision highp float;','in vec2 vQ;in vec3 vCol;in float vA;in float vPx;in vec3 vSh;in float vIrr;out vec4 o;',
'void main(){float d;float sh=1.;',
'  if(vIrr>0.){vec2 q=vec2(vSh.x*vQ.x+vSh.y*vQ.y,-vSh.y*vQ.x+vSh.x*vQ.y);q.x/=mix(1.,vSh.z,vIrr);d=length(q);',
'    float ang=atan(q.y,q.x);d*=1.+vIrr*(.05*sin(ang*3.+vSh.x*7.)+.03*sin(ang*5.+vSh.y*5.));sh=1.+vIrr*step(6.,vPx)*(.05*(.667-d)-.035*q.y);}',   // zero-mean relief on big dots only
'  else d=length(vQ);',
'  float aa=1.3/max(vPx,.6);float al=clamp((1.-d)/aa+.5,0.,1.)*vA;if(al<=.003)discard;o=vec4(vCol*sh*al,al);}'].join('\n');
var VS_Q=['#version 300 es','precision highp float;','layout(location=0) in vec2 aQ;uniform vec4 uRect;uniform vec2 uView;out vec2 vUV;',
'void main(){vUV=aQ*.5+.5;vec2 P=uRect.xy+vUV*uRect.zw;gl_Position=vec4(P.x/uView.x*2.-1.,1.-P.y/uView.y*2.,0.,1.);}'].join('\n');
var FS_Q=['#version 300 es','precision highp float;','in vec2 vUV;out vec4 o;uniform int uMode;uniform sampler2D uTex;uniform vec3 uBeige;uniform float uA,uGm;',
'void main(){if(uMode==2){vec4 s=texture(uTex,vUV);float a=s.a*uA;o=vec4(s.rgb*a,a);return;}',
'  vec3 c;if(uMode==0)c=mix(uBeige,textureLod(uTex,vUV,3.5).rgb,uGm);else c=texture(uTex,vUV).rgb;o=vec4(c*uA,uA);}'].join('\n');

function GL(){var c=cv(4,4),gl=c.getContext('webgl2',{premultipliedAlpha:true,alpha:true,antialias:false,depth:false,stencil:false,preserveDrawingBuffer:false});if(!gl)return null;
  var par=gl.getExtension('KHR_parallel_shader_compile');
  function sh(t,src){var o=gl.createShader(t);gl.shaderSource(o,src);gl.compileShader(o);return o;}
  function start(v,f){var p=gl.createProgram(),a=sh(gl.VERTEX_SHADER,v),b=sh(gl.FRAGMENT_SHADER,f);gl.attachShader(p,a);gl.attachShader(p,b);gl.linkProgram(p);return{p:p,a:a,b:b};}
  // no status query here: that would wait for the compiler. The programs are finished in a later task (compiled in parallel where the driver can)
  var pend=[start(VS_DOT,FS_DOT),start(VS_Q,FS_Q)];
  var quad=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,quad);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  var vao=gl.createVertexArray();gl.bindVertexArray(vao);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);gl.bindVertexArray(null);
  var X={gl:gl,c:c,vao:vao,tex:{}};
  X.compiled=function(){return !par||pend.every(function(o){return gl.getProgramParameter(o.p,par.COMPLETION_STATUS_KHR);});};
  X.finish=function(){var out=pend.map(function(o){if(!gl.getProgramParameter(o.p,gl.LINK_STATUS)){console.warn('postimpressionism:',gl.getShaderInfoLog(o.a),gl.getShaderInfoLog(o.b),gl.getProgramInfoLog(o.p));return null;}
      var U={},n=gl.getProgramParameter(o.p,gl.ACTIVE_UNIFORMS);for(var i=0;i<n;i++){var inf=gl.getActiveUniform(o.p,i);U[inf.name.replace(/\[0\]$/,'')]=gl.getUniformLocation(o.p,inf.name);}return{p:o.p,U:U};});
    if(!out[0]||!out[1])return false;X.PD=out[0];X.PQ=out[1];return true;};
  // fixed texture units: 0 dots, 1 col, 2 sun, 3 the Grande Jatte, 4 the Monet
  X.UNIT={dots:0,col:1,sun:2,gj:3,mon:4};
  X.texture=function(name,src,o){o=o||{};var t=X.tex[name]||(X.tex[name]=gl.createTexture());gl.activeTexture(gl.TEXTURE0+X.UNIT[name]);gl.bindTexture(gl.TEXTURE_2D,t);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL,gl.NONE);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);
    try{gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,src);}catch(e){console.warn('postimpressionism: texture',name,e);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([128,128,128,255]));}
    var mip=!!o.mip;if(mip)gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,o.nearest?gl.NEAREST:mip?gl.LINEAR_MIPMAP_LINEAR:gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,o.nearest?gl.NEAREST:gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    if(mip){var ext=gl.getExtension('EXT_texture_filter_anisotropic');if(ext)gl.texParameterf(gl.TEXTURE_2D,ext.TEXTURE_MAX_ANISOTROPY_EXT,4);}return t;};
  return X;}

// one frame of the offscreen GL canvas: the canvas ground, the dots, the mipmapped picture
function renderGL(S,G,t,W,H,dpr,mon){var X=S.gl,gl=X.gl,c=gjCam(G,t),k=c.k,pitch=SP*k;
  var cw=Math.round(W*dpr),chh=Math.round(H*dpr);if(X.c.width!==cw||X.c.height!==chh){X.c.width=cw;X.c.height=chh;}
  gl.viewport(0,0,cw,chh);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
  var a1=sm(seg(t,[T.ticks[0],T.ticks[0]+T.appear])),gm=sm((10-pitch)/6),imgA=Math.max(sm((2.9-pitch*dpr)/1.2),sm(seg(t,T.imgBy)));
  var Q=X.PQ;gl.useProgram(Q.p);gl.bindVertexArray(X.vao);gl.uniform2f(Q.U.uView,W,H);gl.uniform3f(Q.U.uBeige,BEIGE[0],BEIGE[1],BEIGE[2]);
  // the Monet (mipmapped) and, as the camera nears the sun, the 3840-px scan's sun (feathered), through the push-in camera
  if(mon){var m=monCam(G,t),F=G.F,aSun=sm((m.k-2.2)/2.5);gl.uniform1i(Q.U.uMode,2);gl.uniform1f(Q.U.uA,1);
    gl.uniform1i(Q.U.uTex,X.UNIT.mon);gl.uniform4f(Q.U.uRect,m.a*F.x+m.bx,m.a*F.y+m.by,m.a*F.w,m.a*F.h);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    if(aSun>0){gl.uniform1i(Q.U.uTex,X.UNIT.sun);gl.uniform1f(Q.U.uA,aSun);gl.uniform4f(Q.U.uRect,m.a*(F.x+SUNBOX[0]*G.kM0)+m.bx,m.a*(F.y+SUNBOX[1]*G.kM0)+m.by,m.a*SUNBOX[2]*G.kM0,m.a*SUNBOX[3]*G.kM0);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);}}
  if(t>=T.ticks[0]){gl.uniform1i(Q.U.uTex,X.UNIT.gj);gl.uniform4f(Q.U.uRect,c.ox,c.oy,PW*k,PH*k);
    if(imgA<.999){gl.uniform1i(Q.U.uMode,0);gl.uniform1f(Q.U.uA,a1);gl.uniform1f(Q.U.uGm,gm);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
      var P=X.PD,U=P.U,split=(sm((t-T.ticks[1])/T.tk)+sm((t-T.ticks[2])/T.tk)+sm((t-T.ticks[3])/T.tk))/3;gl.useProgram(P.p);
      gl.uniform1i(U.uDots,X.UNIT.dots);gl.uniform1i(U.uCol,X.UNIT.col);gl.uniform1i(U.uSun,X.UNIT.sun);gl.uniform2f(U.uView,W,H);gl.uniform1f(U.uDpr,dpr);gl.uniform1f(U.uT,t);
      gl.uniform3f(U.uCam,c.ox,c.oy,k);gl.uniform4f(U.uSunMap,RM/SUNBOX[2],(SUN[0]-LAND[0]*RM-SUNBOX[0])/SUNBOX[2],(SUN[1]-LAND[1]*RM-SUNBOX[1])/SUNBOX[3],2.5);
      gl.uniform3fv(U.uPal,S.pal);gl.uniform4f(U.uPh,a1,split,lerp(R0,RF,eio(seg(t,T.grow))),sm(seg(t,T.land)));gl.uniform1f(U.uRf,RF);gl.uniform2f(U.uLand,T.landAt,T.landSpan);
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP,0,4,NDOT);gl.useProgram(Q.p);}
    if(imgA>0){gl.uniform1i(Q.U.uMode,1);gl.uniform1f(Q.U.uA,imgA);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);}}
  gl.bindVertexArray(null);return c;}

// ---------------------------------------------------------------- the Monet side: the impressionism rest seen through the push-in camera
function drawMonet(g,ctx,S,G,t,dpr){var F=G.F,fr=ctx.from,c=monCam(G,t),C=S.C;g.save();g.setTransform(dpr*c.a,0,0,dpr*c.a,dpr*c.bx,dpr*c.by);
  wash(g,G.W,G.H,F,fr.ink==='dark',1);if(fr.frame!=='fade'&&C.shFr)drawShadow(g,C.shFr,C.shFr.a);frameDeco(g,F,fr.frame,1);
  var rr=window.EH_SHARED&&window.EH_SHARED.impressionismRest,ga=1-sm(seg(t,T.glowOut));if(rr&&ga>0){g.save();g.globalAlpha=ga;try{rr(g,{W:G.W,H:G.H,rect:F,dpr:dpr,t:0});}catch(e){}g.restore();}
  g.restore();}
// the Monet as the DOM showed it (same resampling, same pixel-snapped edges), on top of the GL Monet while the push-in has barely begun
function drawFromArt(g,S,G,t,dpr){var c=monCam(G,t),aArt=1-sm((c.a-1)/.25),C=S.C;if(aArt<=0||!C.fromArt)return;var fs=snapR(G.F,dpr);
  g.save();g.setTransform(dpr*c.a,0,0,dpr*c.a,dpr*c.bx,dpr*c.by);g.imageSmoothingEnabled=true;g.imageSmoothingQuality='low';g.globalAlpha=aArt;g.drawImage(C.fromArt,fs.x,fs.y,fs.w,fs.h);g.restore();}

// the label hangs where the core will put it (core hangLabels)
function placeLabel(ctx){var l=document.getElementById('lab'+ctx.to.idx);if(!l)return;var r=ctx.to.rect,fp=r.fp||0,f={left:r.x-fp,right:r.x+r.w+fp,bottom:r.y+r.h+fp};
  var W=innerWidth,Hh=innerHeight,wide=W>1180,h=l.offsetHeight,w=l.offsetWidth,g=W<=560?16:36,ft=document.querySelector('.foot'),footTop=ft?ft.getBoundingClientRect().top:Hh-80;
  var land=W<=980&&Hh<520&&W>Hh,x,y;
  if(wide){x=Math.round(f.right+34);y=Math.round(Math.max(64,Math.min(f.bottom-h,footTop-24-h)));}
  else if(land){var eb=document.getElementById('era'+ctx.to.idx);eb=eb?eb.getBoundingClientRect():null;x=Math.round(W*.58+24);y=Math.round((eb?eb.bottom:40)+14);}
  else{x=Math.round(Math.min(Math.max(f.left,g),W-g-w));y=Math.round(f.bottom+16);}
  var xs=x+'px',ys=y+'px';if(l.style.left!==xs)l.style.left=xs;if(l.style.top!==ys)l.style.top=ys;}

// ---------------------------------------------------------------- DOM: the previous room's overlay layers fade with its picture; restored when we leave
var touched=[],watching=false,myIdx=-1;
function fadeOld(a){document.querySelectorAll('canvas.ovl').forEach(function(c){if(c.style.display==='none'||c.__pi)return;var v=a>=.999?'':a.toFixed(3);if(c.style.opacity!==v){c.style.opacity=v;if(touched.indexOf(c)<0){touched.push(c);watch();}}});}
function restore(){touched.forEach(function(c){c.style.opacity='';});touched=[];}
function watch(){if(watching)return;watching=true;(function loop(){var st=window.EH&&EH.debug&&EH.debug.state;if(!st||st.idx!==myIdx||st.phase!=='enter'){restore();watching=false;return;}requestAnimationFrame(loop);})();}
function dom(ctx,S,t){var F=ctx.from,sw=t<T.swap&&F;
  var wc=sw?F.wall:ctx.to.wall;if(S.wallNow!==wc){ctx.ui.wall(wc);S.wallNow=wc;}var ink=sw?F.ink:ctx.to.ink;if(S.inkNow!==ink){ctx.ui.ink(ink);S.inkNow=ink;}
  var ch=!(t>=T.chromeOff&&t<T.chromeOn);if(S.chNow!==ch){ctx.ui.chrome(ch);S.chNow=ch;}
  ctx.ui.title(ctx.to.idx,t>=T.title);var lo=t>=T.label;ctx.ui.label(ctx.to.idx,lo);if(lo)placeLabel(ctx);
  fadeOld(1-sm(seg(t,T.fromOut)));}

// ---------------------------------------------------------------- init: decode off the main thread, one upload per task
function bitmap(im,raw){if(!im||!im.src)return Promise.resolve(null);var o=raw?{premultiplyAlpha:'none',colorSpaceConversion:'none'}:{};
  var viaImg=function(){return(im.decode?im.decode():Promise.resolve()).catch(function(){}).then(function(){return createImageBitmap(im,o);});};
  return fetch(im.src).then(function(r){if(!r.ok)throw new Error(r.status);return r.blob();}).then(function(b){return createImageBitmap(b,o);}).catch(viaImg).catch(function(e){console.warn('postimpressionism: bitmap',im.src,e);return null;});}
function prep(ctx,S){var X=S.gl,F=ctx.from;
  Promise.all([bitmap(F&&F.image),bitmap(ctx.to.image),bitmap(ctx.asset('t_sun.webp'),true),bitmap(ctx.asset('t_dots.png'),true),bitmap(ctx.asset('t_col.png'),true)]).then(function(b){
    if(!b[1]||!b[3]||!b[4]||(F&&!b[0])){console.warn('postimpressionism: assets missing, simple cross-fade');return;}
    S.bm={mon:b[0],gj:b[1],sun:b[2]};
    // each step is one short task; a step returning 'wait' is retried (the shader compile), false stops (plain cross-fade)
    var steps=[function(){return X.compiled()?X.finish():'wait';},
      function(){X.texture('dots',b[3],{nearest:true});},function(){X.texture('col',b[4],{nearest:true});},
      function(){X.texture('sun',b[2]||cv(2,2),{mip:true});},function(){X.texture('gj',b[1],{mip:true});},function(){X.texture('mon',b[0]||cv(2,2),{mip:true});},
      function(){ensure(ctx,S,'art');},function(){ensure(ctx,S,'fromArt');},function(){ensure(ctx,S,'shTo');},function(){ensure(ctx,S,'shFr');S.ok=true;}];
    [.1,.2,.3,.45,.55,.7,.85,.95].forEach(function(p){steps.push(function(){warm(ctx,S,p);});});
    steps.push(function(){S.ready=true;window.__postimpReady=true;});
    (function next(){if(!steps.length)return;var f=steps[0],r;try{r=f();}catch(e){console.error(e);S.ok=false;return;}
      if(r==='wait'){setTimeout(next,30);return;}if(r===false){S.ok=false;return;}steps.shift();setTimeout(next,16);})();});}
// every GL path once (first use of each program and texture) before the passage plays — into the offscreen canvas only, one frame per task
function warm(ctx,S,p){renderGL(S,geo(ctx),p*D,ctx.W,ctx.H,ctx.dpr||1,!!ctx.from&&p*D<T.monetOff);}

// ================================================================== the module
var MOD={
  duration:D,musicAt:.88,
  assets:['t_dots.png','t_col.png','t_sun.webp'],
  init:function(ctx){var S=ctx.state;myIdx=ctx.to.idx;S.ok=false;S.ready=false;S.bm={};
    var pal=new Float32Array(PAL.length*3);PAL.forEach(function(c,i){pal[i*3]=c[0]/255;pal[i*3+1]=c[1]/255;pal[i*3+2]=c[2]/255;});S.pal=pal;
    S.gl=typeof createImageBitmap==='function'?GL():null;if(!S.gl){console.warn('postimpressionism: no WebGL2, simple cross-fade');return;}
    prep(ctx,S);},
  draw:function(p,ctx){var g=ctx.g,S=ctx.state,W=ctx.W,H=ctx.H,t=p*D,R=ctx.to.rect,F=ctx.from,dpr=ctx.dpr||1;myIdx=ctx.to.idx;
    dom(ctx,S,t);
    if(p>=1||!S.ok){finalFrame(g,ctx,S,p);return;}
    var G=geo(ctx);ensure(ctx,S);var C=S.C;
    g.fillStyle=t<T.swap&&F?F.wall:ctx.to.wall;g.fillRect(0,0,W,H);
    if(F&&t<T.monetOff)drawMonet(g,ctx,S,G,t,dpr);
    // the room light and the picture's shadow come with the picture once it is within 3x of its hanging size (never a huge off-screen shadow)
    if(t>=T.pull[0]){var c=gjCam(G,t),rc={x:c.ox,y:c.oy,w:PW*c.k,h:PH*c.k},near=sm((3-rc.w/R.w)/2);wash(g,W,H,rc,ctx.to.ink==='dark',near);
      if(ctx.to.frame==='none'&&near>0)drawShadow(g,C.shTo,.6*near,rc);}
    var mon=!!F&&t<T.monetOff&&monCam(G,t).a>1.0001;
    if(mon||t>=T.ticks[0]){renderGL(S,G,t,W,H,dpr,mon);g.drawImage(S.gl.c,0,0,W,H);}
    if(F&&t<T.monetOff)drawFromArt(g,S,G,t,dpr);
    // the exact hung picture takes over (same resampling as the DOM)
    var fa=sm(seg(t,T.fin));if(fa>0){var rs=snapR(R,dpr);g.globalAlpha=fa;g.drawImage(C.art,rs.x,rs.y,rs.w,rs.h);g.globalAlpha=1;}},
  done:function(ctx){restore();},
  rest:function(ctx){}
};
// p = 1, and the frames before the data is on the GPU (a plain cross-fade; only seen if the passage is entered in its first ~0.3 s)
function finalFrame(g,ctx,S,p){var W=ctx.W,H=ctx.H,R=ctx.to.rect,F=ctx.from;
  if(!S.ok){g.fillStyle=ctx.to.wall;g.fillRect(0,0,W,H);var im=S.bm&&S.bm.gj;if(F&&p<.5){g.globalAlpha=1-p*2;g.fillStyle=F.wall;g.fillRect(0,0,W,H);var fm=S.bm&&S.bm.mon;if(fm)g.drawImage(fm,F.rect.x,F.rect.y,F.rect.w,F.rect.h);g.globalAlpha=1;}
    if(im&&p>.4){g.globalAlpha=sm((p-.4)/.6);g.drawImage(im,R.x,R.y,R.w,R.h);g.globalAlpha=1;}return;}
  ensure(ctx,S);var rs=snapR(R,ctx.dpr||1);g.fillStyle=ctx.to.wall;g.fillRect(0,0,W,H);wash(g,W,H,R,ctx.to.ink==='dark',1);if(ctx.to.frame==='none')drawShadow(g,S.C.shTo,.6);g.drawImage(S.C.art,rs.x,rs.y,rs.w,rs.h);}
// 2D caches per layout, built part by part from the decoded bitmaps (no synchronous image decode); draw() completes whatever a resize dropped
function ensure(ctx,S,part){var G=geo(ctx),dpr=ctx.dpr||1,F=ctx.from,bm=S.bm||{},to=ctx.to.room.art||{};if(!S.C||S.C.key!==G.key)S.C={key:G.key};var C=S.C;
  var mk={art:function(){C.art=artCanvas(bm.gj,to.w||PW,to.h||PH,G.R,dpr);},shTo:function(){C.shTo=shadowCache(dpr,G.R);},
    fromArt:function(){var fa=F&&F.room.art||{};C.fromArt=F?artCanvas(bm.mon,fa.w||MW,fa.h||MH,F.rect,dpr):null;},shFr:function(){C.shFr=F?shadowCache(dpr,F.rect,F.frame):null;}};
  (part?[part]:['art','shTo','fromArt','shFr']).forEach(function(k){if(!(k in C))mk[k]();});}
EH.transition('postimpressionism',MOD);
window.EH_SHARED=window.EH_SHARED||{};
// this room keeps no extras on the wall at rest (the picture alone): the next room starts from wall + picture
window.EH_SHARED.postimpressionismRest=function(g,o){};
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
/* Special exhibit "drip" (抽象表现主义 · 甩漆).
   A paint-flinging toy next to the hung Autumn Rhythm, plus "绕着画走" on the hung work itself.
   1. The toy (in the panel): a patch of raw canvas seen from slightly above. The pointer holds a stick loaded with enamel; press to pour.
      The paint thread falls from the stick tip (drawn H·k px above the ground point) and lands at a contact point C that follows its own
      physics — a geometric model of a falling viscous thread (liquid rope coiling):
        · the thread is laid on the canvas at the fall speed V(H) ≈ V0 + k√H;
        · the contact point steers toward an orbit of radius Rc(H) around the point N under the stick (coil radius shrinks with height);
          a turn-rate limit V/Rc makes it circle → coils when the stick is slower than V, trochoid loops / meanders near V;
        · the thread can trail only Lmax behind N: when the stick is faster than V it is dragged — a straight line, stretched thin (w ∝ √(V/s));
        · below ≈ 7 cm the thread cannot buckle: the paint piles into pools;
        · sharp turns at speed fling drops (centripetal acceleration over a threshold); a fast release throws the hanging thread as a line of drops;
        · the load runs out (≈ 9 s of pouring): the thread thins, breaks into dribbles, stops. Dip the stick in a can to reload.
      Every mark type (coil, line, splat, pool) is counted where it lands; the magnifier shows your latest one next to the matching
      detail of Autumn Rhythm (rooms/abex/cut/detail_<n>.webp + boxes in cut/layers.json) and rings that spot on the hung work.
   2. "绕着画走": drag sideways on the hung work (or on the small copy in the panel on narrow screens): the painting lies down on the floor
      (CSS 3D, like the transition's falling wall) and turns as you walk round it; let go and it stands up again, hung from the side you stopped at.
   Text comes from room.special (all optional, with fallbacks). Sounds: the room's recorded ones if audio/parts/sfx-abex.json lists them,
   else api.sfx synth + a small WebAudio pour noise of our own (silent whenever api.sfx.on() is false). */
(function(){
'use strict';
if(!window.EH||!EH.special)return;
var TAU=Math.PI*2;
function clamp(x,a,b){return x<a?a:x>b?b:x;}
function lerp(a,b,t){return a+(b-a)*t;}
function sm(t){t=clamp(t,0,1);return t*t*(3-2*t);}
function wrapPi(a){while(a>Math.PI)a-=TAU;while(a<-Math.PI)a+=TAU;return a;}
function rnd(a,b){return a+Math.random()*(b-a);}
function nb(t){return String(t==null?'':t).replace(/([㐀-鿿）》”]) (?=[0-9A-Za-z])/g,'$1 ').replace(/([0-9A-Za-z.%°]) (?=[㐀-鿿（《“])/g,'$1 ');}
function ok(i){return !!(i&&i.complete&&i.naturalWidth>0);}
function xhrJSON(url,cb){try{var x=new XMLHttpRequest();x.open('GET',url+'?t='+Date.now(),true);x.overrideMimeType('application/json');
  x.onload=function(){if(x.status===200||(x.status===0&&x.responseText)){try{cb(JSON.parse(x.responseText));}catch(e){cb(null);}}else cb(null);};
  x.onerror=function(){cb(null);};x.send();}catch(e){cb(null);}}
function str(v){return typeof v==='string'?v:(v&&(v.text||v.t||v.zh))||'';}

// ---------------------------------------------------------------- physics constants (toy px at the reference width 520; scaled by S)
var HMIN=3,HMAX=70,HDEF=24,HPILE=7;          // stick height, internal units (shown as cm × .5: 1.5–35 cm; the physics is a sketch)
function cmOf(h){return Math.max(1,h*.5);}
var KY=1.12;                                  // screen px per cm of height (oblique view)
var CAP=9;                                    // seconds of full flow per load
function Vfall(H){return 140+62*Math.sqrt(H);}                        // px/s at landing
function Rcoil(H){return clamp(9.5*Math.pow(25/Math.max(H,HPILE),.3),4,14);}   // px
var W0=2.7,VREF=450;                          // thread width at the reference fall speed, full flow

// ---------------------------------------------------------------- mark kinds
var KINDS=['coil','line','splat','pool'];
var KDEF={
  coil:{name:'绳卷',you:'你的绳卷',his:'《秋韵》里的圈',
    text:'木棍走得比漆落得慢，落下的漆线来不及铺开，就弯成一圈一圈，像蜂蜜落进碗里。物理学管这叫“液体绳卷”。'},
  line:{name:'拉直的线',you:'你的细线',his:'《秋韵》里的长线',
    text:'木棍走得比漆落得快，漆线被拖着走，拉直、拉细，一笔可以很长。'},
  splat:{name:'飞溅',you:'你的飞溅',his:'《秋韵》里的点',
    text:'急转弯时，漆被甩离木棍，飞出去落成一串点，越快拖得越长。'},
  pool:{name:'一滩',you:'你的一滩',his:'《秋韵》里的漆滩',
    text:'木棍压得很低、走得很慢，漆来不及拉成线，就堆成一滩。'}
};
var PAINTS=[{k:'black',n:'黑',c:'#17140f',hi:'rgba(255,255,255,.2)'},{k:'white',n:'白',c:'#ebe4d3',hi:'rgba(255,255,255,.35)'},
  {k:'brown',n:'褐',c:'#7a624a',hi:'rgba(255,236,210,.22)'},{k:'teal',n:'青',c:'#2c5a60',hi:'rgba(220,255,250,.22)'}];
// fallback spots in main.webp px (2400 × 1223), used until/unless cut/layers.json names detail boxes of that kind (picked by eye)
var FALLBACK={coil:[[1400,320,200,200]],line:[[600,40,200,170]],splat:[[980,20,200,160]],pool:[[400,10,125,120]]};
var RAW='#d2b48a',sampleRawDone=false;                            // raw cotton duck (replaced by a sample of main.webp when it loads)

function css(){if(document.getElementById('s-drip-css'))return;var s=document.createElement('style');s.id='s-drip-css';s.textContent=
  '.dr{margin-top:16px}'+
  '.dr-hint{margin:0 0 10px!important;font-size:13.5px!important;line-height:1.8!important;color:var(--ink-2)}'+
  '.dr-row{display:flex;gap:12px;align-items:stretch}'+
  '.dr-toy{flex:1 1 auto;min-width:0;display:block;height:280px;touch-action:none;cursor:none;background:'+RAW+';box-shadow:0 16px 36px -22px rgba(0,0,0,.75);outline:none}'+
  '.dr-toy:focus-visible{outline:1px solid currentColor;outline-offset:3px}'+
  '.dr-rail{flex:0 0 52px;position:relative;touch-action:none;cursor:ns-resize;user-select:none;-webkit-user-select:none;outline:none}'+
  '.dr-rail:focus-visible{outline:1px solid currentColor;outline-offset:3px}'+
  '.dr-rail .ln{position:absolute;left:25px;top:22px;bottom:22px;width:1px;background:var(--ink-3)}'+
  '.dr-rail .tk{position:absolute;left:19px;width:13px;height:1px;background:var(--ink-3)}'+
  '.dr-rail .lb{position:absolute;left:0;width:52px;text-align:center;font:400 12.5px/1 var(--song);color:var(--ink-2)}'+
  '.dr-rail .th{position:absolute;left:4px;width:44px;height:44px;margin-top:-22px;pointer-events:none}'+
  '.dr-rail .th i{position:absolute;left:6px;right:6px;top:19px;height:6px;border-radius:3px;background:#8a6a44;box-shadow:0 0 0 1px rgba(0,0,0,.35)}'+
  '.dr-rail .th b{position:absolute;left:6px;top:17px;width:10px;height:10px;border-radius:50%;background:currentColor}'+
  '.dr-rail.on .th i{box-shadow:0 0 0 2px currentColor}'+
  '.dr-meta{display:flex;flex-wrap:wrap;justify-content:space-between;gap:2px 20px;margin:10px 0 0;font:400 13.5px/1.7 var(--song);color:var(--ink-2);font-variant-numeric:tabular-nums}'+
  '.dr-meta b{font-weight:500;color:var(--ink)}'+
  '.dr-cans{display:flex;flex-wrap:wrap;align-items:center;gap:4px 14px;margin:8px 0 0}'+
  '.dr-can{display:inline-flex;align-items:center;gap:8px;min-height:44px;min-width:44px;padding:0 4px;font:400 15px/1 var(--song);color:inherit}'+
  '.dr-can svg{display:block;overflow:visible}'+
  '.dr-can[aria-pressed="true"]{font-weight:500}'+
  '.dr-can[aria-pressed="true"] span::before{content:"";display:inline-block;width:6px;height:6px;margin-right:6px;border-radius:50%;background:currentColor;vertical-align:.2em}'+
  '.dr-cans .dr-clear{margin-left:auto;min-height:44px;font:400 14px/1 var(--song);color:var(--ink-2);text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:5px}'+
  '.dr-mag{display:grid;grid-template-columns:repeat(2,minmax(0,220px));justify-content:space-around;gap:12px;margin:18px 0 0}'+
  '.dr-mag figure{margin:0;min-width:0}'+
  '.dr-mag canvas{display:block;width:100%;height:auto;aspect-ratio:1/1;background:#1b1916;border-radius:50%;box-shadow:0 0 0 1px var(--ink-3),0 14px 30px -18px rgba(0,0,0,.8)}'+
  '.dr-mag figcaption{margin-top:6px;text-align:center;font:400 13.5px/1.6 var(--song);color:var(--ink-2)}'+
  '.dr-why{margin:10px 0 0!important;font-size:14.5px!important;line-height:1.9!important;min-height:3.8em}'+
  '.dr-why b{font-weight:500}.dr-his2{display:block;margin-top:6px;color:var(--ink-2)}'+
  '.dr-now{margin:2px 0 0!important;font-size:14px!important;line-height:1.7!important;min-height:1.7em}'+'.dr-note{margin-top:10px!important}'+
  '.dr-walkh{margin:22px 0 6px!important;font:500 15px/1.7 var(--song)!important}'+
  '.dr-walk{position:relative;display:none;width:100%;overflow:hidden;margin:6px 0 10px;touch-action:pan-y;cursor:grab;line-height:0}'+
  '.dr.narrow .dr-walk{display:block}'+
  '.dr-walk.drag{cursor:grabbing}'+
  '.dr .acts{margin:4px 0 0}.dr .act{min-width:44px}'+
  '.dr-side{margin:4px 0 0!important;font-size:13.5px!important;color:var(--ink-2)}'+
  // the walk view (shared by the wall overlay and the panel copy)
  '.dr-ov{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:1;perspective:none}'+
  '.dr-back{position:absolute;inset:0;display:none}'+
  '.dr-rot{position:absolute;left:0;top:0;width:100%;height:100%;transform-origin:50% 50%;will-change:transform}'+
  '.dr-rot img{position:absolute;left:0;top:0;width:100%;height:100%;display:block;visibility:hidden;box-shadow:0 20px 40px -18px rgba(0,0,0,.8)}'+
  '.dr-ring{position:absolute;display:none;border-radius:50%;box-shadow:0 0 0 1.5px rgba(246,238,222,.95),0 0 0 3.5px rgba(0,0,0,.45),0 0 18px 2px rgba(0,0,0,.35);transition:opacity .4s ease}'+
  '.dr-feet{color:var(--ink-2);position:absolute;left:50%;bottom:4px;width:30px;height:22px;margin-left:-15px;opacity:0}'+
  '@media (max-width:560px){.dr-mag{gap:10px}.dr-meta{gap:0 16px;justify-content:flex-start}}';
  document.head.appendChild(s);}

EH.special('drip',function(host,room,api){
  css();
  var sp=room.special||{},art=room.art||{w:2400,h:1218},LB=sp.labels||{};
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mqT=window.matchMedia?matchMedia('(hover: none)'):null;function touchUI(){return !!(mqT&&mqT.matches);}
  var K={};KINDS.forEach(function(k){var o=(sp.kinds&&sp.kinds[k])||{};K[k]={name:str(o.name)||KDEF[k].name,you:str(o.you)||KDEF[k].you,his:str(o.his)||KDEF[k].his,text:str(o.text||o)||KDEF[k].text};});
  var T={
    hint:str(sp.hint&&typeof sp.hint==='object'?sp.hint.mouse:sp.hint)||'按住鼠标倒漆，移动木棍：慢，漆线打圈；快，被拉成细线；急转弯，漆甩出去。右边的标尺调木棍的高度。',
    hintTouch:str(sp.hint&&typeof sp.hint==='object'?sp.hint.touch:sp.hintTouch)||'手指按住画布倒漆，漆落在手指下方。慢，漆线打圈；快，被拉成细线；急转弯，漆甩出去。右边的标尺调高度。',
    empty:str(sp.empty)||'棍上的漆用完了：点下面的漆罐，把木棍再蘸满。',
    walkTitle:str(LB.walkTitle||sp.walkTitle)||'绕着画走',
    walkWall:str(sp.walkHint&&typeof sp.walkHint==='object'?sp.walkHint.mouse:sp.walkHint)||'在墙上的《秋韵》上按住左右拖：画像铺在地上，你绕着它走。松手，它从你停下的那一边立起来，挂回墙上。',
    walkPanel:str(sp.walkHint&&typeof sp.walkHint==='object'?sp.walkHint.touch:sp.walkHintNarrow)||'在下面的小图上左右拖：画铺到地上，你绕着它走。松手，它从你停下的那一边立起来。',
    walkNote:str(LB.walkNote||sp.walkNote)||'波洛克把画布铺在地上作画。他说，这样他能绕着画走，从四边下手，“真正置身画中”。这幅画因此没有天生的上下。',
    sides:(LB.walkSides&&LB.walkSides.length===4)?LB.walkSides:['挂出来的方向','从右边看','倒过来看','从左边看'],
    height:str(LB.heightLabel)||'木棍离布多高',hval:str(LB.heightValue)||'{h} 厘米',speed:str(LB.speedLabel)||'手的速度',load:str(LB.load)||'棍上的漆',clear:str(LB.clear)||'换一块布',
    st:{line:str(LB.stateStraight)||'手快：漆线被拉直，落成一道长线',coil:str(LB.stateCoil)||'手慢、举得高：漆线在落点盘成绳卷',splat:str(LB.stateSplash)||'猛地一甩：漆断成点，溅出去',pool:str(LB.statePool)||'停在一处：漆积成一摊',
      meander:'手速和落速差不多：漆线打弯、打结',drib:'漆快用完了：漆线断成一滴一滴',idle:'按住，漆就从棍头流下来。'},
    note:str(LB.note)||'',lens:str(LB.lensTitle)||'对照《秋韵》',
    start:str(sp.magStart)||'先在画布上倒几笔：放大镜会把你留下的痕迹，和《秋韵》里同样的痕迹放在一起。'
  };
  if(sp.colors&&sp.colors.length){var HI={black:'rgba(255,255,255,.2)',white:'rgba(255,255,255,.35)',brown:'rgba(255,236,210,.22)',teal:'rgba(220,255,250,.22)'};
    PAINTS=sp.colors.filter(function(c){return c&&/^#/.test(c.hex||'');}).map(function(c){return{k:c.id||'',n:c.name||'',c:c.hex,hi:HI[c.id]||'rgba(255,255,255,.22)'};});}
  if(sp.canvasHex&&/^#/.test(sp.canvasHex)){RAW=sp.canvasHex;sampleRawDone=true;}
  // the lens spots named by the content author: {straight|coil|splash|pool: {box:[x0,y0,x1,y1], caption}}
  var LENS={};if(sp.lens){[['line','straight'],['coil','coil'],['splat','splash'],['pool','pool']].forEach(function(m){var o=sp.lens[m[1]]||sp.lens[m[0]];if(o&&o.box&&o.box.length>=4){var b=o.box;LENS[m[0]]={box:[b[0],b[1],b[2]-b[0],b[3]-b[1]],cap:str(o.caption)};}});}

  // ---------- DOM
  var wrap=document.createElement('div');wrap.className='dr';
  wrap.innerHTML='<p class="dr-hint"></p>'+
    '<div class="dr-row"><canvas class="dr-toy" tabindex="0" role="img" aria-label="一块生帆布和一根蘸了漆的木棍：按住倒漆，移动木棍画出漆线。聚焦后按住回车，木棍会自己画一圈；上下方向键调高度。"></canvas>'+
    '<div class="dr-rail" role="slider" tabindex="0" aria-orientation="vertical" aria-valuemin="'+cmOf(HMIN)+'" aria-valuemax="'+cmOf(HMAX)+'"><div class="ln"></div><span class="lb" style="top:2px">高</span><span class="lb" style="bottom:2px">低</span><div class="th"><i></i><b></b></div></div></div>'+
    '<div class="dr-meta"><span class="dr-h"></span><span class="dr-v"></span><span class="dr-l"></span></div><p class="dr-now" aria-live="polite"></p>'+
    '<div class="dr-cans" role="group" aria-label="漆罐：蘸漆"></div>'+
    '<div class="dr-mag" aria-live="polite"><figure><canvas class="dr-you" role="img"></canvas><figcaption class="dr-youc"></figcaption></figure>'+
    '<figure><canvas class="dr-his" role="img"></canvas><figcaption class="dr-hisc"></figcaption></figure></div>'+
    '<p class="dr-why"></p>'+
    '<p class="dr-walkh"></p><p class="dr-hint dr-wh"></p><div class="dr-walk"></div>'+
    '<div class="acts" role="group"></div><p class="dr-side"></p><p class="small dr-note"></p>';
  host.appendChild(wrap);
  var hintEl=wrap.querySelector('.dr-hint'),toy=wrap.querySelector('.dr-toy'),rail=wrap.querySelector('.dr-rail'),thumb=rail.querySelector('.th');
  var hEl=wrap.querySelector('.dr-h'),vEl=wrap.querySelector('.dr-v'),lEl=wrap.querySelector('.dr-l'),nowEl=wrap.querySelector('.dr-now'),cansEl=wrap.querySelector('.dr-cans');
  var youCv=wrap.querySelector('.dr-you'),hisCv=wrap.querySelector('.dr-his'),youC=wrap.querySelector('.dr-youc'),hisC=wrap.querySelector('.dr-hisc'),whyEl=wrap.querySelector('.dr-why');
  var walkH=wrap.querySelector('.dr-walkh'),walkHint=wrap.querySelector('.dr-wh'),walkBox=wrap.querySelector('.dr-walk'),sideActs=wrap.querySelector('.acts'),sideEl=wrap.querySelector('.dr-side');
  walkH.textContent=nb(T.walkTitle);wrap.querySelector('.dr-note').textContent=nb(T.note);if(!T.note)wrap.querySelector('.dr-note').hidden=true;sideActs.setAttribute('aria-label',T.walkTitle);
  [10,20,30,40,50,60].forEach(function(v){var t=document.createElement('div');t.className='tk';t.dataset.v=v;rail.insertBefore(t,thumb);});
  var canBtns=PAINTS.map(function(p,i){var b=document.createElement('button');b.type='button';b.className='dr-can';b.setAttribute('aria-pressed',i===0?'true':'false');
    b.innerHTML='<svg width="22" height="26" viewBox="0 0 22 26" aria-hidden="true"><path d="M2 5 V23 Q11 26.5 20 23 V5" fill="none" stroke="currentColor" stroke-width="1.3"/><ellipse cx="11" cy="5" rx="9" ry="3" fill="'+p.c+'" stroke="currentColor" stroke-width="1.3"/><path d="M2.6 9 Q11 12 19.4 9 V13 Q11 16 2.6 13Z" fill="'+p.c+'" opacity=".9"/></svg><span></span>';
    b.querySelector('span').textContent=p.n;b.setAttribute('aria-label','蘸'+p.n+'漆');b.addEventListener('click',function(){dip(i);});cansEl.appendChild(b);return b;});
  var clearBtn=document.createElement('button');clearBtn.type='button';clearBtn.className='dr-clear';clearBtn.textContent=T.clear;cansEl.appendChild(clearBtn);
  var sideBtns=T.sides.map(function(n,i){var b=document.createElement('button');b.type='button';b.className='act';b.textContent=n;b.setAttribute('aria-pressed',i===0?'true':'false');
    b.addEventListener('click',function(){walkTo(i);});sideActs.appendChild(b);return b;});

  // ---------- details of Autumn Rhythm (cut/layers.json, polled while the cut is being made)
  var AW=art.w||2400,AH=art.h||1218;
  var DET={};             // kind → [{img, box:[x,y,w,h] (main px), label}]
  var detIdx={coil:0,line:0,splat:0,pool:0};
  var hung=api.img(art.img||'main.webp');
  function kindOf(s){s=String(s||'').toLowerCase();
    if(/coil|loop|curl|rope|绳|卷|圈|环/.test(s))return 'coil';
    if(/splat|spatter|drop|spray|dot|溅|点|滴/.test(s))return 'splat';
    if(/pool|puddle|blob|pud|滩|堆|团/.test(s))return 'pool';
    if(/line|whip|straight|thin|stretch|线|甩|拉/.test(s))return 'line';return null;}
  function boxOf(o){if(!o)return null;var b=o.box||o.rect||o.bbox||o.src||o;if(Array.isArray(b)&&b.length>=4){return[b[0],b[1],b[2],b[3]];}
    if(b&&typeof b.x==='number'&&typeof b.w==='number')return[b.x,b.y,b.w,b.h];return null;}
  function useLayers(j){if(!j)return false;if(j.W)AW=j.W;if(j.H)AH=j.H;var found=0;
    var list=[];(function walk(o,depth){if(!o||depth>4)return;if(Array.isArray(o)){o.forEach(function(x){walk(x,depth+1);});return;}
      if(typeof o!=='object')return;var f=o.file||o.img||o.detail;if(typeof f==='string'&&/detail/i.test(f))list.push(o);
      Object.keys(o).forEach(function(k){if(o[k]&&typeof o[k]==='object')walk(o[k],depth+1);});})(j,0);
    list.forEach(function(o){var f=o.file||o.img||o.detail,k=kindOf(o.kind||o.type||o.mark)||kindOf(o.id)||kindOf(o.label||o.name)||kindOf(f),b=boxOf(o);if(!k||!b)return;
      var im=api.img('cut/'+f);if(!ok(im))im.addEventListener('load',function(){magDirty=true;},{once:true});
      (DET[k]=DET[k]||[]).push({img:im,box:b,label:str(o.label||o.caption||o.note_zh||'')});found++;});
    if(j.palette&&j.palette.length){j.palette.slice(0,PAINTS.length).forEach(function(c,i){var v=typeof c==='string'?c:(c&&(c.hex||c.c));if(v&&/^#/.test(v))PAINTS[i].c=v;});}
    magDirty=true;return found>0;}
  var pollT=0,tries=0,dead=false;
  function poll(){if(dead||++tries>60)return;xhrJSON(api.path('cut/layers.json'),function(j){if(dead)return;if(!useLayers(j))pollT=setTimeout(poll,tries<4?2000:10000);});}
  poll();

  // ---------- sound: recorded if the room's sound designer lists them, else synth
  function recName(re){var s=(window.EH_AUDIO&&EH_AUDIO.sfx)||{};return Object.keys(s).filter(function(k){return s[k].room==='abex'&&!s[k].loop&&re.test(k);})[0]||null;}
  var REC={drip:recName(/drip|drop/),splat:recName(/splat|spatter|splash|fling|flick/),can:recName(/can|dip|stir|load/),step:recName(/step|walk|foot/),
    lay:recName(/lay|fall|floor|thud|flop/),whip:recName(/whip|swish|throw/)};
  var lastSnd={};
  function snd(kind,v,fb,gap){var now=performance.now();if(lastSnd[kind]&&now-lastSnd[kind]<(gap||60))return;lastSnd[kind]=now;
    var n=REC[kind];if(n&&api.sfx.play){var h=api.sfx.play(n,{v:v,pan:0});if(h)return;}fb&&fb();}
  // the pour: a soft filtered-noise stream of our own, following the flow and the stick's speed
  var PA=null;
  function pourAudio(){if(PA||!api.sfx.on||!api.sfx.on())return PA;try{var ac=new (window.AudioContext||window.webkitAudioContext)();
      var b=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate),d=b.getChannelData(0),l=0;for(var i=0;i<d.length;i++){var w=Math.random()*2-1;l=(l+.05*w)/1.05;d[i]=l*4;}
      var s=ac.createBufferSource();s.buffer=b;s.loop=true;var f=ac.createBiquadFilter();f.type='lowpass';f.frequency.value=500;f.Q.value=.7;var g=ac.createGain();g.gain.value=0;
      s.connect(f);f.connect(g);g.connect(ac.destination);s.start();PA={ac:ac,f:f,g:g};}catch(e){PA=null;}return PA;}
  function pourSound(level,speed){if(!PA)return;var on=api.sfx.on&&api.sfx.on(),t=PA.ac.currentTime;
    PA.g.gain.setTargetAtTime(on?clamp(level,0,1)*.05:0,t,.05);PA.f.frequency.setTargetAtTime(380+clamp(speed,0,2000)*.9,t,.06);}

  // ---------- toy state
  var P={H:HDEF,load:1,paint:0,T:{x:-999,y:-999},Tt:null,Nprev:null,U:{x:0,y:0},Up:{x:0,y:0},C:{x:0,y:0},psi:0,chir:1,flow:0,
    pour:false,over:false,thread:false,dragged:false,drops:[],sprayAcc:0,dribble:0,dripT:1.5,pool:null,kd:null,auto:null,
    reg:'',regT:0,loadShow:1,lastWet:0};
  var acc={coil:{m:0,x:0,y:0},line:{m:0,x:0,y:0},splat:{m:0,x:0,y:0},pool:{m:0,x:0,y:0}};   // mass + centroid of each kind since the last magnifier update
  var shown=null,shownAt=0,magDirty=true,youSnap=null;
  var tg=toy.getContext('2d'),TW=0,TH=0,S=1,DPR=1,base=null,paint=null,pg=null;

  function sizeToy(){var w=toy.clientWidth;if(!w)return false;var h=Math.round(clamp(w*.64,210,340)),dpr=Math.min(devicePixelRatio||1,2);
    if(w===TW&&h===TH&&dpr===DPR&&paint)return true;
    toy.style.height=h+'px';var old=paint;TW=w;TH=h;DPR=dpr;S=clamp(w/520,.62,1.3);
    toy.width=Math.round(w*dpr);toy.height=Math.round(h*dpr);
    base=makeBase(toy.width,toy.height);
    paint=document.createElement('canvas');paint.width=toy.width;paint.height=toy.height;pg=paint.getContext('2d');
    if(old)pg.drawImage(old,0,0,old.width,old.height,0,0,paint.width,old.height*paint.width/old.width);
    pg.setTransform(dpr,0,0,dpr,0,0);pg.lineCap='round';pg.lineJoin='round';
    rail.style.height=h+'px';placeRail();return true;}
  function makeBase(w,h){var c=document.createElement('canvas');c.width=w;c.height=h;var g=c.getContext('2d');g.fillStyle=RAW;g.fillRect(0,0,w,h);
    // cotton duck: a fine weave + slow blotches
    var t=document.createElement('canvas');t.width=t.height=64;var tx=t.getContext('2d'),id=tx.createImageData(64,64),d=id.data;
    for(var y=0;y<64;y++)for(var x=0;x<64;x++){var i=(y*64+x)*4,v=(Math.random()-.5)*26+((x%3===0)?-9:0)+((y%3===1)?-7:0);d[i]=d[i+1]=d[i+2]=v>0?255:0;d[i+3]=Math.abs(v)*1.1;}
    tx.putImageData(id,0,0);g.fillStyle=g.createPattern(t,'repeat');g.globalAlpha=.55;g.fillRect(0,0,w,h);g.globalAlpha=1;
    for(var k=0;k<14;k++){var r=rnd(.1,.3)*w,gx=rnd(0,w),gy=rnd(0,h),gr=g.createRadialGradient(gx,gy,0,gx,gy,r);gr.addColorStop(0,'rgba(120,96,60,.07)');gr.addColorStop(1,'rgba(120,96,60,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);}
    return c;}
  // sample the raw canvas colour of the hung work once (its lightest warm, unsaturated pixels)
  function sampleRaw(){if(sampleRawDone||!ok(hung))return;sampleRawDone=true;try{var c=document.createElement('canvas');c.width=96;c.height=48;var g=c.getContext('2d');g.drawImage(hung,0,0,96,48);
    var d=g.getImageData(0,0,96,48).data,rs=[],i;for(i=0;i<d.length;i+=4){var r=d[i],gg=d[i+1],b=d[i+2],mx=Math.max(r,gg,b),mn=Math.min(r,gg,b);if(r>gg&&gg>b&&r-b>34&&r-b<115&&r>150&&r<240)rs.push([r,gg,b,r+gg+b]);}
    if(rs.length>60){rs.sort(function(a,b){return a[3]-b[3];});var m=rs[Math.floor(rs.length*.6)];RAW='rgb('+m[0]+','+m[1]+','+m[2]+')';toy.style.background=RAW;TW=0;if(paint)sizeToy();}}catch(e){}}

  // ---------- height rail
  function placeRail(){var h=rail.clientHeight||TH||280,top=22,bot=h-22,y=function(v){return bot-(v-HMIN)/(HMAX-HMIN)*(bot-top);};
    thumb.style.top=y(P.H).toFixed(1)+'px';Array.prototype.forEach.call(rail.querySelectorAll('.tk'),function(t){t.style.top=y(+t.dataset.v).toFixed(1)+'px';});
    rail.setAttribute('aria-valuenow',Math.round(cmOf(P.H)));rail.setAttribute('aria-valuetext',T.hval.replace('{h}',String(Math.round(cmOf(P.H)))));rail.setAttribute('aria-label',T.height+'的高度');}
  function setH(v){v=clamp(v,HMIN,HMAX);if(Math.abs(v-P.H)<.01)return;var crossed=(P.H<HPILE)!==(v<HPILE);P.H=v;placeRail();if(crossed)P.C={x:P.T.x,y:P.T.y+P.H*KY*S};}
  var railDrag=null;
  function railY(e){var r=rail.getBoundingClientRect(),top=r.top+22,bot=r.bottom-22;return HMIN+(bot-e.clientY)/(bot-top)*(HMAX-HMIN);}
  rail.addEventListener('pointerdown',function(e){if(e.button!=null&&e.button!==0&&e.pointerType==='mouse')return;e.preventDefault();try{rail.setPointerCapture(e.pointerId);}catch(_){}railDrag=e.pointerId;rail.classList.add('on');setH(railY(e));});
  rail.addEventListener('pointermove',function(e){if(railDrag===e.pointerId)setH(railY(e));});
  function railUp(e){if(railDrag===e.pointerId){railDrag=null;rail.classList.remove('on');}}
  rail.addEventListener('pointerup',railUp);rail.addEventListener('pointercancel',railUp);
  rail.addEventListener('wheel',function(e){e.preventDefault();setH(P.H-e.deltaY*.04);},{passive:false});
  rail.addEventListener('keydown',function(e){var k=e.key,d=k==='ArrowUp'?2:k==='ArrowDown'?-2:k==='PageUp'?10:k==='PageDown'?-10:0;
    if(k==='Home'){setH(HMAX);e.preventDefault();return;}if(k==='End'){setH(HMIN);e.preventDefault();return;}if(d){setH(P.H+d);e.preventDefault();}});

  // ---------- pouring input
  function toyXY(e){var r=toy.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};}
  var tp=null;
  toy.addEventListener('pointerdown',function(e){if(e.button!=null&&e.button!==0&&e.pointerType==='mouse')return;e.preventDefault();try{toy.setPointerCapture(e.pointerId);}catch(_){}
    try{toy.focus({preventScroll:true});}catch(_){}
    tp=e.pointerId;var q=toyXY(e);P.Tt=q;if(!P.over){P.T={x:q.x,y:q.y};P.Nprev=null;}P.over=true;P.auto=null;startPour();});
  toy.addEventListener('pointermove',function(e){if(tp!=null&&e.pointerId!==tp)return;var q=toyXY(e);if(!P.over&&tp==null){P.T={x:q.x,y:q.y};P.Nprev=null;}P.Tt=q;P.over=true;});
  function toyUp(e){if(tp==null||e.pointerId!==tp)return;tp=null;stopPour(true);if(e.pointerType!=='mouse'||e.type==='pointercancel')P.over=false;}
  toy.addEventListener('pointerup',toyUp);toy.addEventListener('pointercancel',toyUp);
  toy.addEventListener('pointerleave',function(e){if(tp==null)P.over=false;});
  toy.addEventListener('contextmenu',function(e){e.preventDefault();});
  toy.addEventListener('wheel',function(e){e.preventDefault();setH(P.H-e.deltaY*.04);},{passive:false});
  // keyboard: hold Enter → the stick draws a loop by itself; ↑/↓ height
  toy.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();if(e.repeat||P.auto)return;var c={x:TW*rnd(.3,.7),y:TH*rnd(.2,.45)};
      P.auto={t:0,c:c,r:rnd(.12,.22)*TW,sp:rnd(1.2,2.6),dir:Math.random()<.5?-1:1};P.T={x:c.x+P.auto.r,y:c.y};P.Nprev=null;P.over=true;startPour();}
    else if(e.key==='ArrowUp'||e.key==='ArrowDown'){e.preventDefault();setH(P.H+(e.key==='ArrowUp'?2:-2));}});
  toy.addEventListener('keyup',function(e){if(e.key==='Enter'&&P.auto){P.auto=null;stopPour(true);P.over=false;}});
  toy.addEventListener('blur',function(){if(P.auto){P.auto=null;stopPour(false);P.over=false;}});

  function startPour(){pourAudio();if(P.load<=0.001){snd('empty',.3,function(){api.sfx.tick(.03);},400);flashEmpty=2.4;return;}
    P.pour=true;P.thread=false;P.pool=null;}
  function stopPour(fling){if(!P.pour)return;P.pour=false;
    // a fast release throws the hanging thread as a line of drops
    var u=Math.hypot(P.Up.x,P.Up.y);if(fling&&P.thread&&u>650*S&&P.load>0){var n=Math.round(clamp(u/(160*S),5,16));for(var i=0;i<n;i++){var f=i/n,kv=lerp(1,.25,f);
        emit(lerp(P.C.x,P.Nprev?P.Nprev.x:P.C.x,f),lerp(P.C.y,P.Nprev?P.Nprev.y:P.C.y,f),P.Up.x*kv*rnd(.85,1.1),P.Up.y*kv*rnd(.85,1.1),rnd(.7,1.6)*S*Math.sqrt(P.flow||.5));}
      snd('whip',.5,function(){api.sfx.whoosh(.03,.35);},250);}
    P.thread=false;P.pool=null;}
  var flashEmpty=0;
  function dip(i){var was=P.paint;P.paint=i;canBtns.forEach(function(b,j){b.setAttribute('aria-pressed',j===i?'true':'false');});
    P.loadFrom=P.load;P.loadT=0;if(was!==i)P.load=Math.min(P.load,.001);P.loadFrom=P.load;
    snd('can',.7,function(){api.sfx.puff(.05,.35);setTimeout(function(){api.sfx.drip(.07);},180);},200);flashEmpty=0;}
  clearBtn.addEventListener('click',function(){if(!pg)return;pg.save();pg.setTransform(1,0,0,1,0,0);pg.clearRect(0,0,paint.width,paint.height);pg.restore();P.drops.length=0;
    KINDS.forEach(function(k){acc[k].m=0;});api.sfx.whoosh(.02,.5);});

  // ---------- paint on the toy canvas (pg is in CSS px)
  function col(){return PAINTS[P.paint];}
  function stroke(x0,y0,x1,y1,w,pc){pc=pc||col();var a=w<.9?w/.9:1;w=Math.max(w,.9);
    pg.globalCompositeOperation='destination-over';pg.globalAlpha=.07*a;pg.strokeStyle=pc.c;pg.lineWidth=w*2.4;pg.beginPath();pg.moveTo(x0,y0);pg.lineTo(x1,y1);pg.stroke();   // oil halo soaked into the raw canvas
    pg.globalCompositeOperation='source-over';pg.globalAlpha=a;pg.lineWidth=w;pg.stroke();
    if(w>1.8){pg.globalAlpha=a*.8;pg.strokeStyle=pc.hi;pg.lineWidth=w*.3;var ox=-w*.18,oy=-w*.2;pg.beginPath();pg.moveTo(x0+ox,y0+oy);pg.lineTo(x1+ox,y1+oy);pg.stroke();}
    pg.globalAlpha=1;}
  function blob(x,y,r,pc,ax,ay,el){pc=pc||col();ax=ax||0;ay=ay||0;el=el||1;var ang=Math.atan2(ay,ax);
    pg.save();pg.translate(x,y);pg.rotate(ang);
    pg.globalCompositeOperation='destination-over';pg.globalAlpha=.08;pg.fillStyle=pc.c;pg.beginPath();pg.ellipse(0,0,r*el*1.35+1,r*1.35+1,0,0,TAU);pg.fill();
    pg.globalCompositeOperation='source-over';pg.globalAlpha=1;pg.beginPath();pg.ellipse(0,0,r*el,r,0,0,TAU);pg.fill();
    if(r>1.6){pg.fillStyle=pc.hi;pg.globalAlpha=.7;pg.beginPath();pg.ellipse(-r*el*.25,-r*.3,r*el*.35,r*.22,0,0,TAU);pg.fill();}
    pg.restore();pg.globalAlpha=1;}
  function mark(k,x,y,m){var a=acc[k];a.x=(a.x*a.m+x*m)/(a.m+m);a.y=(a.y*a.m+y*m)/(a.m+m);a.m+=m;P.lastWet=performance.now();}

  // ---------- drops in flight
  function emit(x,y,vx,vy,r){var tf=.045*Math.sqrt(P.H)+.04;P.drops.push({x:x,y:y,vx:vx*.32,vy:vy*.32,t:0,tf:tf,r:r,pc:col(),h:P.H});P.load=Math.max(0,P.load-r*r*.0009/(S*S));}
  function stepDrops(dt){for(var i=P.drops.length-1;i>=0;i--){var d=P.drops[i];d.t+=dt;if(d.t<d.tf)continue;P.drops.splice(i,1);
    var lx=d.x+d.vx*d.tf,ly=d.y+d.vy*d.tf,v=Math.hypot(d.vx,d.vy),el=1+clamp(v/(900*S),0,2.2),ux=v?d.vx/v:0,uy=v?d.vy/v:0;
    blob(lx,ly,d.r,d.pc,d.vx,d.vy,el);
    var ns=v>250*S?Math.floor(rnd(0,4)):Math.floor(rnd(0,1.6));for(var s=0;s<ns;s++){var dd=d.r*el*rnd(1.4,4.2),rr=d.r*rnd(.18,.45),q=rnd(-.35,.35);
      blob(lx+(ux*Math.cos(q)-uy*Math.sin(q))*dd,ly+(uy*Math.cos(q)+ux*Math.sin(q))*dd,rr,d.pc,d.vx,d.vy,1+(el-1)*.5);}
    mark('splat',lx,ly,d.r*d.r*.6);
    snd('splat',clamp(d.r/(2.4*S),.15,.8),function(){api.sfx.drip(clamp(.01+d.r*.012,.01,.05));},45);}}

  // ---------- the falling thread (one physics substep of length h)
  function substep(T,h){var oy=P.H*KY*S,N={x:T.x,y:T.y+oy};
    if(!P.Nprev)P.Nprev={x:N.x,y:N.y};
    var ux=(N.x-P.Nprev.x)/h,uy=(N.y-P.Nprev.y)/h,kk=Math.min(1,h/.03),kp=Math.min(1,h/.08);P.U.x+=(ux-P.U.x)*kk;P.U.y+=(uy-P.U.y)*kk;P.Nprev=N;
    P.Up.x+=(P.U.x-P.Up.x)*kp;P.Up.y+=(P.U.y-P.Up.y)*kp;
    var U=Math.hypot(P.U.x,P.U.y);
    if(!P.pour){P.flow=0;return;}
    if(P.load<=0){P.pour=false;P.thread=false;flashEmpty=2.4;snd('empty',.3,function(){api.sfx.tick(.025);},600);return;}
    var flow=P.load>.25?1:P.load/.25;P.flow=flow;P.load=Math.max(0,P.load-flow*h/CAP);
    var V=Vfall(P.H)*S,Vn=V/S;
    if(flow<.14){   // nearly dry: the thread breaks into dribbles
      P.thread=false;P.dribble+=h*(3+9*flow);if(P.dribble>=1){P.dribble=0;emit(N.x,N.y,P.U.x*.4,P.U.y*.4,rnd(.8,1.5)*S);}return;}
    var wl=W0*S*Math.sqrt(flow)*Math.sqrt(VREF/Vn);
    if(P.H<HPILE){  // too low to buckle: a pool under the stick
      P.thread=true;P.C={x:N.x,y:N.y};var qa=W0*VREF*S*S*flow*h*1.1;
      if(!P.pool||Math.hypot(N.x-P.pool.x,N.y-P.pool.y)>Math.max(2,P.pool.r*.45)){var carry=P.pool?P.pool.a*.3:0;P.pool={x:N.x,y:N.y,a:carry};}
      P.pool.a+=qa;P.pool.r=Math.min(Math.sqrt(P.pool.a/Math.PI),22*S);blob(P.pool.x,P.pool.y,P.pool.r);if(P.pool.r>3*S&&Math.random()<h*14){var qa2=rnd(0,TAU);blob(P.pool.x+Math.cos(qa2)*P.pool.r*.8,P.pool.y+Math.sin(qa2)*P.pool.r*.8,P.pool.r*rnd(.25,.5));}mark(U<V*.5?'pool':'line',N.x,N.y,qa*.02);return;}
    if(!P.thread){P.thread=true;P.C={x:N.x,y:N.y};P.psi=U>20?Math.atan2(P.U.y,P.U.x):rnd(0,TAU);P.chir=Math.random()<.5?-1:1;}
    var Rc=Rcoil(P.H)*S*(1+.12*Math.sin(performance.now()*.0023+P.psi*.1)),Lmax=.55*oy+6*S;
    var dx=N.x-P.C.x,dy=N.y-P.C.y,dist=Math.hypot(dx,dy);
    if(Math.random()<h*.35)P.chir*=-1;   // coils now and then change hands
    var psiD=Math.atan2(dy,dx)-P.chir*(Math.PI/2-Math.atan(1.2*(dist-Rc)/Rc)),turn=wrapPi(psiD-P.psi),mt=V*h*1.7/Rc;P.psi+=clamp(turn,-mt,mt);
    var cx=P.C.x+V*h*Math.cos(P.psi),cy=P.C.y+V*h*Math.sin(P.psi),ex=N.x-cx,ey=N.y-cy,el=Math.hypot(ex,ey),drag=false;
    if(el>Lmax){cx=N.x-ex/el*Lmax;cy=N.y-ey/el*Lmax;drag=true;}
    var s=Math.hypot(cx-P.C.x,cy-P.C.y)/h;if(drag&&s>1)P.psi=Math.atan2(cy-P.C.y,cx-P.C.x);
    var w=wl*Math.sqrt(V/Math.max(s,.35*V));
    stroke(P.C.x,P.C.y,cx,cy,w);P.dragged=drag;
    var m=w*s*h*.02;if(drag||U>V*1.05)mark('line',cx,cy,m);else if(U<V*.8)mark('coil',cx,cy,m);else{mark('coil',cx,cy,m*.5);mark('line',cx,cy,m*.5);}
    P.C={x:cx,y:cy};
    // sharp turns fling drops: the paint on the stick keeps its own velocity Up (it clings with a time constant of ≈ 80 ms);
    // when the stick turns or stops faster than that, paint and stick part — drops fly off with the paint's velocity
    var rel=Math.hypot(P.Up.x-P.U.x,P.Up.y-P.U.y),thr=380*S;
    if(rel>thr){P.sprayAcc+=h*clamp((rel-thr)/thr,0,3)*80;while(P.sprayAcc>=1){P.sprayAcc-=1;var q=rnd(-.2,.2),c=Math.cos(q),sn=Math.sin(q),k=rnd(.8,1.15);
        emit(N.x,N.y,(P.Up.x*c-P.Up.y*sn)*k,(P.Up.y*c+P.Up.x*sn)*k,rnd(.6,2.4)*S*Math.sqrt(flow));}}
    // a thread stretched very fast breaks into beads along the line
    if(drag&&s>2.1*V&&Math.random()<h*(s/V)*3)emit(cx,cy,P.U.x*.25,P.U.y*.25,rnd(.7,1.4)*S*Math.sqrt(flow));}

  function regime(){if(!P.pour||P.load<=0)return '';if(P.flow<.14)return 'drib';if(P.H<HPILE)return Math.hypot(P.U.x,P.U.y)<Vfall(P.H)*S*.5?'pool':'line';
    var U=Math.hypot(P.U.x,P.U.y),V=Vfall(P.H)*S;return (P.dragged||U>V*1.05)?'line':U<V*.8?'coil':'meander';}
  var REGN={coil:'绳卷',line:'拉直的线',meander:'打弯',pool:'一滩',drib:'断成滴'};

  function stepToy(dt){if(!paint||!(dt>0))return;
    if(!isFinite(P.U.x+P.U.y+P.Up.x+P.Up.y)){P.U={x:0,y:0};P.Up={x:0,y:0};}
    // the stick target: the pointer, or the keyboard loop
    if(P.auto){var a=P.auto;a.t+=dt;var th=a.t*a.sp*a.dir;P.Tt={x:a.c.x+Math.cos(th)*a.r*(1+.35*Math.sin(a.t*.9)),y:a.c.y+Math.sin(th)*a.r*.55};}
    var T0={x:P.T.x,y:P.T.y},T1=P.Tt||T0;if(T0.x<-900){T0={x:T1.x,y:T1.y};}
    var n=Math.max(1,Math.ceil(dt/.003)),h=dt/n;
    for(var i=1;i<=n;i++){var T={x:lerp(T0.x,T1.x,i/n),y:lerp(T0.y,T1.y,i/n)};substep(T,h);}
    P.T={x:T1.x,y:T1.y};
    stepDrops(dt);
    // a loaded stick held still drips now and then (the "drip" of drip painting)
    if(!P.pour&&P.over&&P.load>.35){P.dripT-=dt;if(P.dripT<=0){P.dripT=rnd(1.2,3.2);emit(P.T.x,P.T.y+P.H*KY*S,P.U.x*.3,P.U.y*.3,rnd(1,1.8)*S);}}
    // reload animation
    if(P.loadT!=null){P.loadT+=dt/.7;P.load=lerp(P.loadFrom,1,sm(P.loadT));if(P.loadT>=1)P.loadT=null;}
    var U=Math.hypot(P.U.x,P.U.y);pourSound(P.pour&&P.thread?P.flow:0,U/S);
    if(flashEmpty>0)flashEmpty-=dt;}

  // ---------- toy rendering
  function drawToy(){if(!paint)return;var g=tg;g.setTransform(1,0,0,1,0,0);g.drawImage(base,0,0);g.drawImage(paint,0,0);g.setTransform(DPR,0,0,DPR,0,0);
    var pc=col(),oy=P.H*KY*S;
    // drops in flight (with their shadows)
    P.drops.forEach(function(d){var f=d.t/d.tf,gx=d.x+d.vx*d.t,gy=d.y+d.vy*d.t,z=d.h*(1-f*f)*KY*S;
      g.fillStyle='rgba(0,0,0,.18)';g.beginPath();g.arc(gx,gy,d.r*.9,0,TAU);g.fill();g.fillStyle=d.pc.c;g.beginPath();g.arc(gx,gy-z,d.r,0,TAU);g.fill();});
    if(!P.over&&!P.auto)return;
    var T=P.T,N={x:T.x,y:T.y+oy};
    // shadow of the stick tip on the canvas
    g.fillStyle='rgba(40,28,14,'+(.22*clamp(1-P.H/90,.25,1)).toFixed(3)+')';g.beginPath();g.ellipse(N.x+oy*.18,N.y,4*S+oy*.08,2.2*S+oy*.04,0,0,TAU);g.fill();
    // the thread: from the tip down to the contact point, bending into the heel near the canvas
    if(P.pour&&P.thread){var w=W0*S*Math.sqrt(P.flow)*Math.sqrt(VREF/Vfall(P.H)),C=P.C;
      g.lineCap='round';g.strokeStyle=pc.c;g.lineWidth=Math.max(1,w*1.25);g.beginPath();g.moveTo(T.x,T.y);g.quadraticCurveTo(N.x,N.y-oy*.08,C.x,C.y);g.stroke();
      g.strokeStyle=pc.hi;g.lineWidth=Math.max(.6,w*.35);g.beginPath();g.moveTo(T.x-w*.3,T.y);g.quadraticCurveTo(N.x-w*.3,N.y-oy*.08,C.x-w*.2,C.y);g.stroke();}
    // the stick: from the tip toward the (unseen) right hand
    var L=150*S,dx=.5*L,dy=.86*L;g.lineCap='round';
    g.strokeStyle='rgba(0,0,0,.18)';g.lineWidth=7*S;g.beginPath();g.moveTo(N.x+oy*.18,N.y);g.lineTo(N.x+oy*.18+dx*.9,N.y+dy*.25);g.stroke();   // its shadow
    g.strokeStyle='#5a4128';g.lineWidth=7.5*S;g.beginPath();g.moveTo(T.x,T.y);g.lineTo(T.x+dx,T.y+dy);g.stroke();
    g.strokeStyle='#9a7a50';g.lineWidth=4.5*S;g.beginPath();g.moveTo(T.x+1*S,T.y);g.lineTo(T.x+dx+1*S,T.y+dy);g.stroke();
    // paint on the end of the stick (more when loaded) + the hanging drop
    var ld=P.load;if(ld>0){g.strokeStyle=pc.c;g.lineWidth=(5+2.5*ld)*S;g.beginPath();g.moveTo(T.x,T.y);g.lineTo(T.x+dx*.05*(.4+ld),T.y+dy*.05*(.4+ld));g.stroke();
      if(!P.pour){var r=(1.2+2.4*ld)*S;g.fillStyle=pc.c;g.beginPath();g.moveTo(T.x-r*.7,T.y);g.quadraticCurveTo(T.x,T.y+r*2.6,T.x+r*.7,T.y);g.fill();}}
    // the load, as a thin bar along the top edge of the canvas
    g.fillStyle='rgba(0,0,0,.12)';g.fillRect(10*S,8,TW*.18,3);g.fillStyle=pc.k==='white'?'rgba(40,30,20,.55)':pc.c;g.fillRect(10*S,8,TW*.18*ld,3);}

  // ---------- magnifier: your latest mark ↔ the same mark in Autumn Rhythm
  function pickKind(){var best=null,bm=0;KINDS.forEach(function(k){var m=acc[k].m*(k==='splat'?2.2:k==='pool'?1.6:1);if(m>bm){bm=m;best=k;}});return bm>(1.6*S)?best:null;}
  function snapYou(k){var a=acc[k],r=Math.round(66*S),c=youSnap||document.createElement('canvas');c.width=c.height=Math.round(2*r*DPR);var g=c.getContext('2d');
    var sx=(a.x-r)*DPR,sy=(a.y-r)*DPR;g.fillStyle=RAW;g.fillRect(0,0,c.width,c.height);g.drawImage(base,sx,sy,c.width,c.height,0,0,c.width,c.height);g.drawImage(paint,sx,sy,c.width,c.height,0,0,c.width,c.height);youSnap=c;}
  function updateMag(now){if(!pg)return;var quiet=!P.pour||now-shownAt>2600;if(!quiet)return;var k=pickKind();
    if(!k||(k===shown&&now-shownAt<1500))return;
    if(k!==shown||!P.pour){if(DET[k]&&DET[k].length&&k===shown)detIdx[k]=(detIdx[k]+1)%DET[k].length;}
    snapYou(k);shown=k;shownAt=now;KINDS.forEach(function(q){acc[q].m=0;});magDirty=true;snd('mag',.2,function(){api.sfx.tick(.02);},300);}
  function det(k){var L=DET[k],cap=LENS[k]?LENS[k].cap:'';if(L&&L.length){var d0=L[detIdx[k]%L.length];if(!d0.cap)d0.cap=cap;return d0;}if(LENS[k])return{img:null,box:LENS[k].box,label:'',cap:cap};var F=FALLBACK[k];if(!F)return null;var b=F[0],f=AW/2400;return{img:null,box:[b[0]*f,b[1]*f,b[2]*f,b[3]*f],label:'',cap:''};}
  function drawMag(){var dpr=Math.min(devicePixelRatio||1,2),w=youCv.clientWidth;if(!w)return;var px=Math.round(w*dpr);
    [youCv,hisCv].forEach(function(c){if(c.width!==px){c.width=c.height=px;}});
    var yg=youCv.getContext('2d'),hg=hisCv.getContext('2d');
    [yg,hg].forEach(function(g){g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,px,px);g.save();g.beginPath();g.arc(px/2,px/2,px/2,0,TAU);g.clip();g.fillStyle='#1b1916';g.fillRect(0,0,px,px);});
    if(shown&&youSnap){yg.drawImage(youSnap,0,0,px,px);}
    else{yg.fillStyle=RAW;yg.fillRect(0,0,px,px);}
    var D=shown?det(shown):null;
    if(D&&ok(D.img)){var iw=D.img.naturalWidth,ih=D.img.naturalHeight,s=Math.max(px/iw,px/ih);hg.drawImage(D.img,(px-iw*s)/2,(px-ih*s)/2,iw*s,ih*s);}
    else if(D&&ok(hung)){var b=D.box,sc=hung.naturalWidth/AW,m=Math.max(b[2],b[3]);hg.drawImage(hung,(b[0]+b[2]/2-m/2)*sc,(b[1]+b[3]/2-m/2)*sc,m*sc,m*sc,0,0,px,px);}
    else if(ok(hung)){var ih2=hung.naturalHeight;hg.globalAlpha=.35;hg.drawImage(hung,(hung.naturalWidth-ih2)/2,0,ih2,ih2,0,0,px,px);hg.globalAlpha=1;}
    [yg,hg].forEach(function(g){g.restore();});
    var k=shown;youC.textContent=nb(k?K[k].you:'你的画布');hisC.textContent=nb(k?(D&&D.label&&D.label.length<=14?D.label:K[k].his):'《秋韵》局部');
    youCv.setAttribute('aria-label',youC.textContent);hisCv.setAttribute('aria-label',hisC.textContent);
    whyEl.innerHTML='';if(k){var b1=document.createElement('b');b1.textContent=nb(K[k].name)+'　';whyEl.appendChild(b1);whyEl.appendChild(document.createTextNode(nb(K[k].text)));if(D&&D.cap){var p2=document.createElement('span');p2.className='dr-his2';p2.textContent=nb('《秋韵》：'+D.cap+(wallVisible()?'（墙上的画里圈出了这一处）':''));whyEl.appendChild(p2);}}
    else whyEl.textContent=nb(T.start);
    placeRings();}

  // ---------- 绕着画走 (walk round the painting): a CSS 3D copy over the hung work, and the same view in the panel on narrow screens
  var cw=document.getElementById('cw'),frameEl=document.getElementById('frame');
  function makeView(parent){var ov=document.createElement('div');ov.className='dr-ov';ov.setAttribute('aria-hidden','true');
    ov.innerHTML='<div class="dr-back"></div><div class="dr-rot"><img alt="" draggable="false"><div class="dr-ring"></div></div>'+
      '<svg class="dr-feet" viewBox="0 0 30 22"><path d="M8 2c2.6 0 3.6 3 3.4 6.4-.2 3.2-1.6 5-3.4 5S4.6 11.6 4.6 8.4C4.6 5 5.6 2 8 2zM7.2 15.2c1.8 0 2.6 1 2.6 2.6S8.8 20.6 7.4 20.6 4.8 19.4 4.8 17.8s.6-2.6 2.4-2.6zM22 2c-2.6 0-3.6 3-3.4 6.4.2 3.2 1.6 5 3.4 5s3.4-1.8 3.4-5C25.4 5 24.4 2 22 2zm.8 13.2c-1.8 0-2.6 1-2.6 2.6s1 2.8 2.4 2.8 2.6-1.2 2.6-2.8-.6-2.6-2.4-2.6z" fill="currentColor" stroke="rgba(128,128,128,.5)" stroke-width=".6"/></svg>';
    parent.appendChild(ov);var v={ov:ov,back:ov.querySelector('.dr-back'),rot:ov.querySelector('.dr-rot'),img:ov.querySelector('img'),ring:ov.querySelector('.dr-ring'),feet:ov.querySelector('.dr-feet')};
    v.back.style.background=room.wall||'#2b2825';v.img.src=api.path(art.img||'main.webp');return v;}
  var wallV=cw?makeView(cw):null;
  walkBox.style.aspectRatio=AW+'/'+AH;walkBox.style.background='transparent';var panelV=makeView(walkBox);panelV.back.style.background='transparent';panelV.img.style.visibility='visible';
  var cwTouch=cw?cw.style.touchAction:'';if(cw)cw.style.touchAction='pan-y';
  function wallVisible(){if(!cw)return false;var r=api.artRect(),cmp=document.getElementById('cmpA');return r.width>40&&r.height>40&&!(frameEl&&frameEl.classList.contains('hidden'))&&!(cmp&&cmp.classList.contains('on'));}
  var Wk={th:0,vel:0,tilt:0,tiltT:0,drag:null,stepAcc:0,side:0,laid:false,thudDone:true,goal:null};
  // the 3D transform for (rotation θ, tilt 0..1) in a w×h box, scaled so the whole painting stays inside the box
  function viewTransform(w,h,th,tilt){var tx=tilt*56*Math.PI/180,Pp=2.4*Math.max(w,h),c=Math.cos(th),s=Math.sin(th),ct=Math.cos(tx),st=Math.sin(tx),bx=0,by=0;
    [[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]].forEach(function(p){var x=p[0]*c-p[1]*s,y=p[0]*s+p[1]*c,Y=y*ct,Z=y*st,k=Pp/(Pp-Z);bx=Math.max(bx,Math.abs(x*k));by=Math.max(by,Math.abs(Y*k));});
    // the perspective makes the near edge bigger; shift down a little when laid so the near edge sits near the visitor
    var sc=Math.min(w/2/bx,h/2/by)*(tilt>0?.94:1);if(Math.abs(th)<1e-4&&tilt<1e-4)sc=1;
    return 'perspective('+Pp.toFixed(0)+'px) rotateX('+(tx*180/Math.PI).toFixed(3)+'deg) rotateZ('+(th*180/Math.PI).toFixed(3)+'deg) scale('+sc.toFixed(4)+')';}
  function applyView(v,w,h,isWall){var still=Math.abs(wrapPi(Wk.th))<.002&&Wk.tilt<.002&&Math.abs(Wk.vel)<.01&&!Wk.drag;
    if(isWall){v.back.style.display=still?'none':'block';v.img.style.visibility=still?'hidden':'visible';}
    v.rot.style.transform=viewTransform(w,h,Wk.th,Wk.tilt);v.feet.style.opacity=(Wk.tilt*.95).toFixed(2);}
  function sideOf(th){return ((Math.round(th/(Math.PI/2))%4)+4)%4;}
  function walkStart(e,where){if(e.button!=null&&e.button!==0&&e.pointerType==='mouse')return false;Wk.drag={id:e.pointerId,x0:e.clientX,y0:e.clientY,th0:Wk.th,moved:false,where:where,last:[[performance.now(),e.clientX]]};return true;}
  function walkMove(e){var d=Wk.drag;if(!d||d.id!==e.pointerId)return false;var dx=e.clientX-d.x0,dy=e.clientY-d.y0;
    if(!d.moved){if(Math.abs(dx)<7)return Math.abs(dy)<7;if(Math.abs(dy)>Math.abs(dx)*1.2&&d.where==='panel'){Wk.drag=null;return false;}d.moved=true;d.x0=e.clientX;dx=0;Wk.goal=null;layDown();}
    var wbox=d.where==='wall'?api.artRect().width:walkBox.clientWidth;Wk.th=d.th0+dx*TAU/(1.5*Math.max(200,wbox));
    var now=performance.now();d.last.push([now,e.clientX]);while(d.last.length>2&&now-d.last[0][0]>90)d.last.shift();return true;}
  function walkEnd(e){var d=Wk.drag;if(!d||(e&&d.id!==e.pointerId))return null;Wk.drag=null;
    if(d.moved){var a=d.last[0],b=d.last[d.last.length-1],dt=Math.max((b[0]-a[0])/1000,.016),wbox=d.where==='wall'?api.artRect().width:walkBox.clientWidth;
      Wk.vel=clamp((b[1]-a[1])/dt*TAU/(1.5*Math.max(200,wbox)),-7,7);}
    return d;}
  function layDown(){if(Wk.tiltT!==1){Wk.tiltT=1;Wk.thudDone=false;}}
  function walkTo(i){var cur=Wk.th,target=i*Math.PI/2,diff=wrapPi(target-cur);Wk.goal=cur+diff;layDown();Wk.vel=0;}
  function stepWalk(dt){var laidNow=Wk.tilt>.5;
    if(!Wk.drag){
      if(Wk.goal!=null){ // a button asked for a side: walk there, then stand it up
        var e=Wk.goal-Wk.th;if(Wk.tilt>.85)Wk.th+=clamp(e,-dt*2.6,dt*2.6);if(Math.abs(e)<.002&&Wk.tilt>.85){Wk.th=Wk.goal;Wk.goal=null;Wk.tiltT=0;}}
      else if(Wk.tiltT===1){Wk.th+=Wk.vel*dt;Wk.vel*=Math.exp(-dt*2.2);
        if(Math.abs(Wk.vel)<.9){var q=Math.round(Wk.th/(Math.PI/2))*Math.PI/2,e2=q-Wk.th;Wk.vel+=(e2*38-Wk.vel*9)*dt;   // spring to the nearest side
          if(Math.abs(e2)<.003&&Math.abs(Wk.vel)<.05){Wk.th=q;Wk.vel=0;Wk.tiltT=0;}}}
      else{Wk.vel=0;}}
    var tspd=reduce?3:1.9;Wk.tilt=Wk.tiltT>Wk.tilt?Math.min(Wk.tiltT,Wk.tilt+dt*tspd):Math.max(Wk.tiltT,Wk.tilt-dt*tspd);
    if(!Wk.thudDone&&Wk.tilt>.92){Wk.thudDone=true;snd('lay',.6,function(){api.sfx.thud(.12);},400);}
    // footsteps while walking round the laid painting
    if(Wk.tilt>.5){Wk.stepAcc+=Math.abs(Wk.th-(stepWalk.last==null?Wk.th:stepWalk.last));if(Wk.stepAcc>.42){Wk.stepAcc=0;stepWalk.foot=-(stepWalk.foot||1);
      snd('step',.5,function(){api.sfx.thud(.03);api.sfx.puff(.012,.12);},120);}}
    stepWalk.last=Wk.th;
    // normalise θ to (−π, π] when standing
    if(Wk.tilt===0&&!Wk.drag&&Wk.goal==null&&Math.abs(Wk.th)>Math.PI+.01){Wk.th=wrapPi(Wk.th);}
    var sd=sideOf(Wk.th);if(sd!==Wk.side){Wk.side=sd;}
    sideBtns.forEach(function(b,i){b.setAttribute('aria-pressed',i===sd?'true':'false');});}
  // wall pointer handlers (capture on the frame so the viewer does not open after a walk)
  var suppress=false;
  function wDown(e){suppress=false;if(!wallVisible())return;if(walkStart(e,'wall')){try{frameEl.setPointerCapture(e.pointerId);}catch(_){}}}
  function wMove(e){if(Wk.drag&&Wk.drag.where==='wall'){if(walkMove(e))e.stopPropagation();}}
  function wUp(e){if(Wk.drag&&Wk.drag.where==='wall'){var d=walkEnd(e);if(d&&d.moved){suppress=true;e.stopPropagation();}}}
  function wClick(e){if(suppress){suppress=false;e.stopPropagation();e.preventDefault();}}
  if(frameEl){frameEl.addEventListener('pointerdown',wDown,true);frameEl.addEventListener('pointermove',wMove,true);frameEl.addEventListener('pointerup',wUp,true);
    frameEl.addEventListener('pointercancel',wUp,true);frameEl.addEventListener('click',wClick,true);}
  walkBox.addEventListener('pointerdown',function(e){if(walkStart(e,'panel')&&e.pointerType!=='touch'){try{walkBox.setPointerCapture(e.pointerId);}catch(_){}}});
  walkBox.addEventListener('pointermove',function(e){if(Wk.drag&&Wk.drag.where==='panel'&&walkMove(e)&&Wk.drag&&Wk.drag.moved){walkBox.classList.add('drag');if(e.pointerType==='touch'){try{walkBox.setPointerCapture(e.pointerId);}catch(_){}}}});
  function pUp(e){if(Wk.drag&&Wk.drag.where==='panel')walkEnd(e);walkBox.classList.remove('drag');}
  walkBox.addEventListener('pointerup',pUp);walkBox.addEventListener('pointercancel',pUp);
  // touch on the panel copy: horizontal drags walk, vertical ones scroll (touch-action: pan-y) — the browser cancels the pointer when it scrolls
  // the ring: the current detail's box, inside the rotating copy so it turns with the painting
  function placeRings(){var D=shown?det(shown):null;[wallV,panelV].forEach(function(v){if(!v)return;if(!D){v.ring.style.display='none';return;}
    var b=D.box,cx=(b[0]+b[2]/2)/AW*100,cy=(b[1]+b[3]/2)/AH*100,m=Math.max(b[2],b[3])*1.15;v.ring.style.display='block';
    v.ring.style.width=(m/AW*100)+'%';v.ring.style.height=(m/AH*100)+'%';v.ring.style.left=(cx-m/AW*50)+'%';v.ring.style.top=(cy-m/AH*50)+'%';});}

  // ---------- loop
  var raf=0,last=0,lastTxt={};
  function setTxt(el,k,t){if(lastTxt[k]!==t){lastTxt[k]=t;el.textContent=nb(t);}}
  function tick(now){if(dead)return;raf=requestAnimationFrame(tick);if(!host.isConnected){dispose();return;}
    var dt=last?Math.min((now-last)/1000,.05):0;last=now;
    var wv=wallVisible();wrap.classList.toggle('narrow',!wv);
    if(!sizeToy())return;sampleRaw();
    stepToy(dt);drawToy();updateMag(now);if(magDirty){magDirty=false;drawMag();}
    stepWalk(dt);
    if(wallV){wallV.ov.style.display=wv?'block':'none';if(wv){var r=api.artRect();applyView(wallV,r.width,r.height,true);}}
    if(!wv)applyView(panelV,walkBox.clientWidth,walkBox.clientHeight,false);
    // text
    var tch=touchUI();setTxt(hintEl,'h',flashEmpty>0?T.empty:(tch?T.hintTouch:T.hint));
    setTxt(hEl,'hh',T.height+' '+T.hval.replace('{h}',String(Math.round(cmOf(P.H)))));setTxt(lEl,'l',T.load+' '+Math.round(P.load*100)+'%');
    var ms=Math.hypot(P.U.x,P.U.y)/Math.max(TW,1);setTxt(vEl,'v',T.speed+' '+(ms<.05?'0':ms.toFixed(1))+' 米/秒');
    var rg=regime();if(rg)P.reg=rg,P.regT=now;var rs=flashEmpty>0?T.empty:(P.reg&&now-P.regT<1200?T.st[P.reg]:T.st.idle);setTxt(nowEl,'n',rs);
    setTxt(walkHint,'w',wv?T.walkWall:T.walkPanel);setTxt(sideEl,'s',T.walkNote);}
  raf=requestAnimationFrame(tick);
  if(!ok(hung)&&hung.addEventListener)hung.addEventListener('load',function(){magDirty=true;},{once:true});

  function dispose(){if(dead)return;dead=true;cancelAnimationFrame(raf);clearTimeout(pollT);
    if(wallV&&wallV.ov.parentNode)wallV.ov.parentNode.removeChild(wallV.ov);if(cw)cw.style.touchAction=cwTouch;
    if(PA){try{PA.g.gain.setTargetAtTime(0,PA.ac.currentTime,.05);var ac=PA.ac;setTimeout(function(){try{ac.close();}catch(_){}} ,300);}catch(_){}PA=null;}
    if(frameEl){frameEl.removeEventListener('pointerdown',wDown,true);frameEl.removeEventListener('pointermove',wMove,true);frameEl.removeEventListener('pointerup',wUp,true);
      frameEl.removeEventListener('pointercancel',wUp,true);frameEl.removeEventListener('click',wClick,true);}}
  host._dispose=dispose;
  // test hooks
  if(EH.debug)EH.debug.drip={P:P,Wk:Wk,DET:DET,acc:acc,get shown(){return shown;},
    // draw a path programmatically: pts = [[x,y],…] in toy px, dur seconds; returns when done
    stroke:function(pts,dur,H){if(H!=null)setH(H);return new Promise(function(res){var t0=performance.now();P.over=true;P.T={x:pts[0][0],y:pts[0][1]};P.Tt={x:pts[0][0],y:pts[0][1]};P.Nprev=null;startPour();
      (function f(){var u=(performance.now()-t0)/1000/dur;if(u>=1){stopPour(true);res();return;}var fi=u*(pts.length-1),i=Math.floor(fi),k=fi-i,a=pts[i],b=pts[Math.min(i+1,pts.length-1)];P.Tt={x:lerp(a[0],b[0],k),y:lerp(a[1],b[1],k)};requestAnimationFrame(f);})();});},
    walk:function(th,tilt){Wk.th=th;Wk.tilt=Wk.tiltT=tilt;Wk.vel=0;},walkTo:walkTo,dip:dip,setH:setH,size:function(){return{w:TW,h:TH,S:S};}};
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
/* Special exhibit "readymade" (达达与超现实 · 三件达达玩具). Dalí's Persistence of Memory stays on the wall; the Dada half lives here.
   Three toys in one panel (tabs):
   1 现成品 (main) — arm “选一件现成品”, then click/tap ANY thing on the page (a control, the timeline, one word of the wall text, the room
     title, the blank wall, the painting itself …). It is lent out: a dashed gap stays behind, a copy flies to a plinth in the panel, drops
     with weight (gravity, bounce, squash, dust), the spotlight switches on and a museum label is written: 《title》 · 现成品，2026 · material ·
     the visitor as artist (name asked once, stored in localStorage behind try/catch). The object is a rigid box: pick it up, throw it, drop it;
     it lands on whichever face comes down, rocks on a corner and tips over (a box pivoting on its edge under gravity) — push it on its back
     like the urinal of 《泉》. 还回去 returns the thing to the page.
   2 帽子里的诗 — the words of this room's wall texts (Intl.Segmenter) are torn into a top hat. Drag the hat to shake it: the slips feel the
     hat's acceleration (verlet circles, walls, collisions) and rustle. 倒出来 tilts the hat; the order in which the slips fall out of the
     opening is the poem — every time different.
   3 精致的尸体 — a sheet folded into three strips (head / body / legs) cut from earlier rooms' public-domain works (rooms/dada/s_corpse.webp,
     built by _wip/s-readymade/corpse.py). Each strip slides on its own (drag, inertia, snap); while folded only the joint lines peek out.
     展开 unfolds the flaps and shows the dream creature and where each part comes from.
   Texts: room.special.* with fallbacks (read tolerant). Sounds: recorded dad-* sounds if listed, else the core's synth voices. */
(function(){
'use strict';
if(!window.EH||!EH.special)return;
function clamp(x,a,b){return x<a?a:x>b?b:x;}
function lerp(a,b,t){return a+(b-a)*t;}
function sm(t){t=clamp(t,0,1);return t*t*(3-2*t);}
function nb(t){return String(t==null?'':t).replace(/([㐀-鿿）》”]) (?=[0-9A-Za-z])/g,'$1 ').replace(/([0-9A-Za-z.%°]) (?=[㐀-鿿（《“])/g,'$1 ');}
function ok(i){return !!(i&&i.complete&&i.naturalWidth>0);}
function rnd(a,b){return a+Math.random()*(b-a);}
var YEAR=new Date().getFullYear()||2026;
var LS='eh-readymade-artist';
function loadName(){try{return localStorage.getItem(LS)||'';}catch(e){return '';}}
function saveName(n){try{localStorage.setItem(LS,n);}catch(e){}}

var CSS=
'.rm{margin-top:14px}'+
'.rm-tabs{margin:0 0 10px!important}'+
'.rm-pane[hidden]{display:none}'+
'.rm-hint{margin:0 0 10px!important;font-size:13.5px!important;line-height:1.8!important;color:var(--ink-2)}'+
'.rm .acts{margin:8px 0 4px}.rm .act{min-width:44px}'+
'.rm-gal{position:relative;overflow:hidden;height:clamp(250px,40vh,340px);background:radial-gradient(ellipse 80% 70% at 50% 42%,#26221e,#131110 78%);box-shadow:inset 0 0 0 1px rgba(255,255,255,.04);touch-action:pan-y;user-select:none;-webkit-user-select:none}'+
'.rm-floor{position:absolute;left:0;right:0;bottom:0;height:18%;background:linear-gradient(#1b1816,#0f0d0c)}'+
'.rm-spot{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;opacity:.08;transition:opacity .18s linear}'+
'.rm-spot.on{opacity:1}'+
'.rm-ped{position:absolute;bottom:0;background:linear-gradient(90deg,#d9d4ca,#f1ede5 40%,#e4dfd5 75%,#c9c3b8);box-shadow:0 -1px 0 #fbf8f2 inset,0 20px 40px -10px rgba(0,0,0,.6)}'+
'.rm-ped::before{content:"";position:absolute;left:0;right:0;top:-7px;height:7px;background:linear-gradient(#f7f4ee,#e6e1d8);clip-path:polygon(4% 0,96% 0,100% 100%,0 100%)}'+
'.rm-plq{position:absolute;left:50%;transform:translateX(-50%);bottom:18%;font:400 12px/1.4 var(--song);color:#6c655b;white-space:nowrap}'+
'.rm-shadow{position:absolute;height:10px;border-radius:50%;background:radial-gradient(closest-side,rgba(0,0,0,.45),transparent);pointer-events:none}'+
'.rm-obj{position:absolute;left:0;top:0;transform-origin:50% 50%;cursor:grab;touch-action:none;will-change:transform}'+
'.rm-obj.held{cursor:grabbing}'+
'.rm-obj *{pointer-events:none!important}'+
'.rm-sig{position:absolute;right:4%;bottom:6%;font:italic 500 13px/1 "Bodoni Moda",serif;color:#1c1712;white-space:nowrap;text-shadow:0 0 1px rgba(255,255,255,.35);pointer-events:none;transform-origin:100% 100%}'+
'.rm-dust{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}'+
'.rm-card{margin:12px 0 4px;padding:2px 0 2px 16px;border-left:1px solid var(--ink-3);max-width:26em}'+
'.rm-card p{margin:0!important;font-size:14px!important;line-height:1.75!important}'+
'.rm-card .t{font:400 17px/1.6 var(--song)!important;color:var(--ink)}'+
'.rm-card .m{color:var(--ink-2)}'+
'.rm-card[hidden]{display:none}'+
'.rm-sign{display:flex;flex-wrap:wrap;align-items:center;gap:6px 12px;margin:8px 0 2px}'+
'.rm-sign[hidden]{display:none}'+
'.rm-sign label{font:400 14px/1.6 var(--song);color:var(--ink-2)}'+
'.rm-sign input{min-height:44px;width:11em;max-width:100%;padding:0 10px;font:400 15px/1 var(--song);color:var(--ink);background:transparent;border:1px solid var(--ink-3);border-radius:2px}'+
'.rm-sign input:focus-visible{outline:1px solid currentColor;outline-offset:2px}'+
'.rm-note{margin-top:10px!important}'+
'.rm-hl{position:fixed;z-index:60;pointer-events:none;border:1.5px dashed #f0d9a8;box-shadow:0 0 0 9999px rgba(10,8,6,.18);border-radius:2px;display:none}'+
'.rm-hl i{position:absolute;left:-1px;top:-24px;padding:2px 7px;font:400 12px/1.4 var(--song);font-style:normal;color:#1b1714;background:#f0d9a8;white-space:nowrap}'+
'.rm-hl.below i{top:auto;bottom:-24px}'+
'.rm-gap{position:fixed;z-index:59;pointer-events:none;border:1px dashed currentColor;color:var(--ink-3);display:none}'+
'.rm-gap i{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font:400 11.5px/1 var(--song);font-style:normal;white-space:nowrap}'+
'.rm-ghost{position:fixed;left:0;top:0;z-index:61;pointer-events:none;transform-origin:0 0;will-change:transform}'+
'.rm-lent{visibility:hidden!important}'+
'body.rm-arming,body.rm-arming *{cursor:crosshair!important}'+
'.rm-hat{display:block;width:100%;touch-action:none;cursor:grab;background:#15120f}'+
'.rm-hat.held{cursor:grabbing}'+
'.rm-poem{margin:12px 0 4px!important;min-height:3.4em;font:400 18px/1.9 var(--song)!important;color:var(--ink)}'+
'.rm-poem.empty{font-size:14px!important;color:var(--ink-2)}'+
'.rm-cx{display:block;margin:0 auto;max-width:100%;touch-action:pan-y;cursor:grab}'+
'.rm-cx.held{cursor:grabbing}'+
'.rm-cap{margin:10px 0 2px!important;font-size:14px!important;color:var(--ink-2)}'+
'.rm-cap b{font-weight:500;color:var(--ink)}';

// ---------------------------------------------------------------- the exquisite-corpse atlas (rooms/dada/s_corpse.webp, see corpse.py)
var ATLAS={w:600,rows:{h:{y:0,h:150,items:['dory','kouros','wanderer','madonna','david','beard','boy','swing']},
  t:{y:150,h:245,items:['dory','kouros','wanderer','madonna','david','swing']},
  l:{y:395,h:285,items:['dory','kouros','wanderer','madonna','swing','throne','boat']}}};
// where each piece comes from: room id (for the room name) + the work, and which part
var SRC={dory:['antiquity','《持矛者》'],kouros:['antiquity','《纽约库罗斯》'],wanderer:['romanticism','《雾海上的漫游者》'],madonna:['medieval','《圣三一圣母》'],
  david:['medieval','《圣三一圣母》里的大卫王'],beard:['baroque','《圣马太蒙召》里的大胡子'],boy:['baroque','《圣马太蒙召》里戴羽毛帽的少年'],swing:['rococo','《秋千》'],
  throne:['medieval','《圣三一圣母》的宝座'],boat:['impressionism','《日出·印象》里的小船']};
var ROOMZH={antiquity:'古希腊罗马',medieval:'中世纪',baroque:'巴洛克',rococo:'洛可可',romanticism:'浪漫主义',impressionism:'印象派'};

EH.special('readymade',function(host,room,api){
  if(!document.getElementById('rm-css')){var st=document.createElement('style');st.id='rm-css';st.textContent=CSS;document.head.appendChild(st);}
  var sp=room.special||{};
  function obj(keys){for(var i=0;i<keys.length;i++){var v=sp[keys[i]];if(v&&typeof v==='object'&&!Array.isArray(v))return v;}return {};}
  function str(o,keys,fb){for(var i=0;i<keys.length;i++){var v=o&&o[keys[i]];if(typeof v==='string'&&v.trim())return v;}return fb;}
  // toys may be special.toys[] ({key|id|type,title,hint,text}) or special.readymade / .hat / .corpse objects
  var toysArr=Array.isArray(sp.toys)?sp.toys:(Array.isArray(sp.items)?sp.items:[]);
  function toy(re,keys){var o=obj(keys);if(Object.keys(o).length)return o;for(var i=0;i<toysArr.length;i++){var t=toysArr[i]||{};if(re.test(String(t.key||t.id||t.type||'')+' '+String(t.title||t.name||'')))return t;}return {};}
  var TR=toy(/ready|现成|fountain|泉/i,['readymade','ready','fountain']),TH=toy(/hat|poem|帽|诗/i,['hat','poem','chance','hatPoem']),TC=toy(/corpse|exquis|尸体|cadavre/i,['corpse','exquisite','cadavre']);
  var mqT=window.matchMedia?matchMedia('(hover: none)'):null;function touchUI(){return !!(mqT&&mqT.matches);}
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var T={
    tR:str(TR,['title','name','label'],'现成品'),tH:str(TH,['title','name','label'],'帽子里的诗'),tC:str(TC,['title','name','label'],'精致的尸体'),
    rHint:str(TR,['hint','hintMouse'],'按“选一件现成品”，再点页面上的任何东西：一个按钮、进度条、这段文字里的一个词、展厅名、空白的墙。它会被搬上底座，打上灯，写上展签。'),
    rHintT:str(TR,['hintTouch'],'按“选一件现成品”，再轻触页面上的任何东西：一个按钮、进度条、文字里的一个词、展厅名、空白处。它会被搬上底座，打上灯，写上展签。'),
    rPlay:str(TR,['play','hint2','after'],'拖起它再松手：它带着分量落下，哪一面着地就立在哪一面。推一下，它会像《泉》那样仰面躺倒。'),
    rPlayT:str(TR,['playTouch'],'按住它提起来再松手：它带着分量落下，哪一面着地就立在哪一面。推一下，它会像《泉》那样仰面躺倒。'),
    rArmed:'现在点页面上任何一样东西。再按一次这个按钮取消。',rArmedT:'现在轻触页面上任何一样东西。再按一次这个按钮取消。',
    rNote:str(TR,['text','note','story'],'1917 年，杜尚买来一个小便池，把它平放，签上“R. Mutt 1917”，题名《泉》，送去纽约独立艺术家协会的展览，被拒于展厅之外。挑选、换个方向摆放、签名，也可以是创作。'),
    hHint:str(TH,['hint','hintMouse'],'墙上说明里的词已经撕成纸条，放进了帽子。拖住帽子左右上下摇，再按“倒出来”：纸条掉出来的先后，就是诗的词序。'),
    hHintT:str(TH,['hintTouch'],'墙上说明里的词已经撕成纸条，放进了帽子。按住帽子摇一摇，再按“倒出来”：纸条掉出来的先后，就是诗的词序。'),
    hNote:str(TH,['text','note','recipe'],'查拉在 1920 年前后写过一份“做一首达达诗”的配方，大意是：把报纸上的文章剪成词，放进帽子摇匀，一张张取出，按取出的先后抄下来。诗会像你。'),
    cHint:str(TC,['hint','hintMouse'],'一张纸折成三截：头、身、腿，各自左右拖动来换，折着的时候只露出接缝处的几道线。换好了，按“展开”。'),
    cHintT:str(TC,['hintTouch'],'一张纸折成三截：头、身、腿，各自左右滑动来换，折着的时候只露出接缝处的几道线。换好了，按“展开”。'),
    cNote:str(TC,['text','note'],'“精致的尸体”是超现实主义者 1920 年代在巴黎玩的游戏：几个人轮流在折起的纸上画一段，谁也看不见前面画了什么，展开才见到整个怪物。这里的头、身、腿都取自前面各厅的作品。'),
    empty:'空着的底座',material:'材料',artist:'艺术家',unsigned:'（尚未签名）'
  };

  // ---------------------------------------------------------------- DOM
  var root=document.createElement('div');root.className='rm';
  root.innerHTML='<div class="acts rm-tabs" role="group" aria-label="三件达达玩具"><button type="button" class="act" data-tab="r" aria-pressed="true"></button><button type="button" class="act" data-tab="h" aria-pressed="false"></button><button type="button" class="act" data-tab="c" aria-pressed="false"></button></div>'+
    // 1 readymade
    '<div class="rm-pane" data-pane="r"><p class="rm-hint" aria-live="polite"></p>'+
      '<div class="rm-gal" aria-label="底座"><canvas class="rm-spot" aria-hidden="true"></canvas><div class="rm-floor"></div><div class="rm-ped"><span class="rm-plq"></span></div><div class="rm-shadow"></div><canvas class="rm-dust" aria-hidden="true"></canvas></div>'+
      '<div class="acts" role="group" aria-label="现成品"><button type="button" class="act rm-arm" aria-pressed="false">选一件现成品</button><button type="button" class="act rm-pl">← 推</button><button type="button" class="act rm-pr">推 →</button><button type="button" class="act rm-back">还回去</button></div>'+
      '<div class="rm-card" hidden aria-live="polite"><p class="t"></p><p class="m y"></p><p class="m mat"></p><p class="m who"></p></div>'+
      '<form class="rm-sign" hidden><label for="rm-name">签上你的名字：</label><input id="rm-name" type="text" maxlength="16" autocomplete="nickname" placeholder="你的名字"><button type="submit" class="act">签名</button></form>'+
      '<p class="small rm-note rm-rnote"></p></div>'+
    // 2 hat
    '<div class="rm-pane" data-pane="h" hidden><p class="rm-hint"></p><canvas class="rm-hat" role="img" aria-label="一顶装着纸条的高顶礼帽，可以拖动摇晃"></canvas>'+
      '<div class="acts" role="group" aria-label="帽子里的诗"><button type="button" class="act rm-shake">摇一摇</button><button type="button" class="act rm-pour">倒出来</button><button type="button" class="act rm-tear">再撕一次</button></div>'+
      '<p class="rm-poem empty" aria-live="polite"></p><p class="small rm-note rm-hnote"></p></div>'+
    // 3 corpse
    '<div class="rm-pane" data-pane="c" hidden><p class="rm-hint"></p><canvas class="rm-cx" role="img" aria-label="折成三截的纸：头、身、腿"></canvas>'+
      '<div class="acts" role="group" aria-label="精致的尸体"><button type="button" class="act" data-s="h">换头</button><button type="button" class="act" data-s="t">换身</button><button type="button" class="act" data-s="l">换腿</button><button type="button" class="act rm-spin">一起换</button><button type="button" class="act rm-unfold" aria-pressed="false">展开</button></div>'+
      '<p class="rm-cap" aria-live="polite"></p><p class="small rm-note rm-cnote"></p></div>';
  host.appendChild(root);
  var $=function(s){return root.querySelector(s);};
  var tabs=root.querySelectorAll('.rm-tabs .act');
  tabs[0].textContent=T.tR;tabs[1].textContent=T.tH;tabs[2].textContent=T.tC;
  $('.rm-rnote').textContent=nb(T.rNote);$('.rm-hnote').textContent=nb(T.hNote);$('.rm-cnote').textContent=nb(T.cNote);
  var active='r',dead=false,raf=0,last=0;
  function setTab(k){if(k===active)return;if(active==='r')disarm();active=k;
    Array.prototype.forEach.call(tabs,function(b){b.setAttribute('aria-pressed',b.getAttribute('data-tab')===k?'true':'false');});
    Array.prototype.forEach.call(root.querySelectorAll('.rm-pane'),function(p){p.hidden=p.getAttribute('data-pane')!==k;});
    tick.k='';hints();snd('slide',.35,function(){api.sfx.tick(.025);});}
  Array.prototype.forEach.call(tabs,function(b){b.addEventListener('click',function(){setTab(b.getAttribute('data-tab'));});});

  // ---------------------------------------------------------------- sound: recorded dad-* if the sound designer lists them, else synth
  function recName(re){var s=(window.EH_AUDIO&&EH_AUDIO.sfx)||{};return Object.keys(s).filter(function(k){return (s[k].room==='dada'||/^dad-/.test(k))&&!s[k].loop&&re.test(k);})[0]||null;}
  var REC={land:recName(/clunk|pedestal|land|thud|drop/),spot:recName(/spot|switch|lamp|light/),murmur:recName(/murmur|crowd|museum/),lift:recName(/lift|whoosh|fly/),
    tip:recName(/tip|topple|knock|clack|porcel/),tear:recName(/tear|rip/),rustle:recName(/rustle|shake|hat/),pour:recName(/pour|flutter|fall/),
    slide:recName(/slide|strip/),fold:recName(/fold|unfold|paper/)};
  function snd(kind,v,fb){var n=REC[kind];if(n&&api.sfx.play){var h=api.sfx.play(n,{v:v});if(h)return h;}fb&&fb();return null;}

  // ================================================================= 1 · READYMADE
  var gal=$('.rm-gal'),ped=$('.rm-ped'),plq=$('.rm-plq'),shadowEl=$('.rm-shadow'),spot=$('.rm-spot'),dust=$('.rm-dust'),armBtn=$('.rm-arm'),card=$('.rm-card'),signF=$('.rm-sign'),nameIn=$('#rm-name');
  plq.textContent=T.empty;
  var hl=document.createElement('div');hl.className='rm-hl';hl.innerHTML='<i></i>';document.body.appendChild(hl);
  var gap=document.createElement('div');gap.className='rm-gap';gap.innerHTML='<i>借展中</i>';document.body.appendChild(gap);
  var artist=loadName();
  var armed=false,cur=null;   // cur = {el (the lent element or word span), restore(), title, mat, node (clone), w0, h0, S, …}
  var B={slide:0,mode:'none',x:0,y:0,vx:0,vy:0,th:0,om:0,face:0,phi:0,cx:0,squash:0,sv:0,held:null,samples:[],lit:0,litT:0};   // body state (stage px)
  var parts=[];
  function G(){var w=gal.clientWidth,h=gal.clientHeight,pw=Math.round(clamp(w*.46,120,210)),ph=Math.round(h*.34);return{w:w,h:h,pw:pw,ph:ph,top:h-ph-3,x0:(w-pw)/2,x1:(w+pw)/2};}
  function layoutPed(){var g=G();ped.style.left=g.x0+'px';ped.style.width=g.pw+'px';ped.style.height=g.ph+'px';}

  // ---------- which thing is under the pointer, and what it is called
  function readEl(){return document.getElementById('read');}
  function isOurs(el){return !!(el&&(root.contains(el)||el===hl||el===gap||(el.closest&&el.closest('.rm-ghost'))));}
  function textOf(el){var t=(el.getAttribute&&(el.getAttribute('aria-label')||el.getAttribute('alt')))||'';var c=(el.innerText||el.textContent||'').replace(/\s+/g,' ').trim();return c||t;}
  function short(t,n){t=String(t||'').replace(/[《》“”]/g,'').trim();n=n||10;return t.length>n?t.slice(0,n-1)+'…':t;}
  var SEG=null;try{SEG=new Intl.Segmenter('zh',{granularity:'word'});}catch(e){SEG=null;}
  function wordAt(x,y,el){   // one word of running text under the point: {node, a, b, text}
    if(!el||!readEl()||!readEl().contains(el)||!/^(P|DD|DT|LI|SPAN|SMALL|B|FIGCAPTION)$/.test(el.tagName))return null;
    var n=null,off=0;
    if(document.caretRangeFromPoint){var r=document.caretRangeFromPoint(x,y);if(r){n=r.startContainer;off=r.startOffset;}}
    else if(document.caretPositionFromPoint){var p=document.caretPositionFromPoint(x,y);if(p){n=p.offsetNode;off=p.offset;}}
    if(!n||n.nodeType!==3||!el.contains(n))return null;var s=n.data,best=null;
    if(SEG){var it=SEG.segment(s)[Symbol.iterator](),v;while(!(v=it.next()).done){var g=v.value;if(off>=g.index&&off<=g.index+g.segment.length&&g.isWordLike){best={a:g.index,b:g.index+g.segment.length};if(off<g.index+g.segment.length)break;}}}
    if(!best){var m=/[㐀-鿿A-Za-z0-9]/;if(off<s.length&&m.test(s[off]))best={a:off,b:off+1};else if(off>0&&m.test(s[off-1]))best={a:off-1,b:off};}
    if(!best)return null;var rg=document.createRange();rg.setStart(n,best.a);rg.setEnd(n,best.b);var rc=rg.getBoundingClientRect();
    if(!rc.width||x<rc.left-4||x>rc.right+4||y<rc.top-4||y>rc.bottom+4)return null;
    return{node:n,a:best.a,b:best.b,text:s.slice(best.a,best.b),rect:rc,parent:el};}
  function candidate(x,y,target,kbd){   // → {kind, el, rect, title, mat, word?}
    var el=target;if(el&&el.nodeType===3)el=el.parentElement;if(!el||el.nodeType!==1||isOurs(el))return null;
    var art=document.getElementById('art'),frame=document.getElementById('frame');
    if(frame&&frame.contains(el)&&art){return{kind:'art',el:art,rect:art.getBoundingClientRect(),title:(room.art&&room.art.short?String(room.art.short).replace(/[《》]/g,''):'记忆的永恒')+'（复制品）',mat:'屏幕上的复制品'};}
    if(!kbd){var w=wordAt(x,y,el);if(w)return{kind:'word',el:w.parent,rect:w.rect,word:w,title:w.text,mat:'一个词，从墙上的说明里撕下'};}
    var line=el.closest&&el.closest('#line,.line');if(line)return{kind:'line',el:line,rect:line.getBoundingClientRect(),title:'进度条',mat:'刻度，时间'};
    var b=el.closest&&el.closest('button,summary,a,h1,h2,h3,.work,.mark,.lat,img');if(b&&!isOurs(b)&&!(b.contains&&b.contains(root))){el=b;}
    if(el.id==='room'||el.id==='read'||el.classList.contains('wash')||el===document.body||el.contains(root)||el.querySelectorAll('*').length>300){
      var r0={left:x-40,top:y-30,width:80,height:60,right:x+40,bottom:y+30};return{kind:'blank',el:null,rect:r0,title:el.id==='room'?'一块墙':'空白',mat:'墙面，空气'};}
    var t=textOf(el),tag=el.tagName,mat='界面元素',rc=el.getBoundingClientRect();
    if(/^(H1|H2|H3|P|DT|DD|LI|SUMMARY)$/.test(tag)&&el.children.length<8){try{var rg=document.createRange();rg.selectNodeContents(el);var tr=rg.getBoundingClientRect();if(tr.width>4&&tr.width<rc.width-8)rc=tr;}catch(e){}}
    if(tag==='BUTTON'||el.getAttribute('role')==='button')mat=el.classList.contains('work')?'按钮，缩略图':'按钮，界面文字';
    else if(/^H[1-3]$/.test(tag))mat='标题，墨色';else if(tag==='IMG')mat='图片';else if(tag==='CANVAS')mat='像素';else if(tag==='SUMMARY')mat='可折叠的目录';
    if(el.classList&&el.classList.contains('work')){var bb=el.querySelector('b');if(bb)t=textOf(bb);}
    if(el.classList&&el.classList.contains('mark'))t='艺术的演进';
    return{kind:'el',el:el,rect:rc,title:short(t,12)||'无题',mat:mat};}

  // ---------- a copy of any element, computed styles inlined (incl. ::before/::after), canvases copied
  var PROPS=['display','position','left','top','right','bottom','width','height','margin-top','margin-right','margin-bottom','margin-left','padding-top','padding-right','padding-bottom','padding-left',
    'box-sizing','font-family','font-size','font-weight','font-style','line-height','letter-spacing','color','background-color','background-image','background-size','background-position','background-repeat',
    'border-top','border-right','border-bottom','border-left','border-radius','opacity','text-decoration-line','text-decoration-color','text-decoration-thickness','text-underline-offset','text-align',
    'white-space','writing-mode','flex-direction','flex-wrap','flex-grow','flex-shrink','flex-basis','align-items','justify-content','gap','box-shadow','vertical-align','overflow','content','transform',
    'object-fit','aspect-ratio','filter','text-transform','list-style-type','grid-template-columns','column-gap','row-gap'];
  var cloneN=0;
  function styleText(cs){var s='';for(var i=0;i<PROPS.length;i++){var v=cs.getPropertyValue(PROPS[i]);if(v!==''&&v!=null)s+=PROPS[i]+':'+v+';';}return s;}
  function copyStyled(src,rules){
    if(src.nodeType===3)return document.createTextNode(src.data);
    if(src.nodeType!==1)return null;
    var cs=getComputedStyle(src);if(cs.display==='none')return null;
    var d;
    if(src.tagName==='CANVAS'){d=document.createElement('canvas');var k=Math.min(1,700/Math.max(1,src.width,src.height));d.width=Math.max(1,Math.round(src.width*k));d.height=Math.max(1,Math.round(src.height*k));try{d.getContext('2d').drawImage(src,0,0,d.width,d.height);}catch(e){}}
    else if(src.tagName==='IMG'){d=document.createElement('img');d.src=src.currentSrc||src.src;d.alt='';}
    else if(src.tagName==='INPUT'||src.tagName==='SELECT'||src.tagName==='TEXTAREA'){d=document.createElement('span');d.textContent=src.value||src.placeholder||'';}
    else d=document.createElement(/^(SVG|svg)$/.test(src.tagName)?'span':'div');
    if(/^svg$/i.test(src.tagName)){d=src.cloneNode(true);}
    d.setAttribute('style',styleText(cs)+'transition:none;animation:none;visibility:visible;');
    var id='rmk'+(++cloneN);d.setAttribute('data-rmk',id);
    ['::before','::after'].forEach(function(ps){var c=getComputedStyle(src,ps),ct=c.getPropertyValue('content');if(ct&&ct!=='none'&&ct!=='normal')rules.push('[data-rmk="'+id+'"]'+ps+'{'+styleText(c)+'}');});
    if(src.tagName!=='CANVAS'&&src.tagName!=='IMG'&&!/^svg$/i.test(src.tagName))for(var n=src.firstChild;n;n=n.nextSibling){var c2=copyStyled(n,rules);if(c2)d.appendChild(c2);}
    return d;}
  function makeCopy(c){   // → {node, w, h}
    var w=Math.max(8,c.rect.width),h=Math.max(8,c.rect.height),node,rules=[];
    if(c.kind==='word'){var pcs=getComputedStyle(c.word.parent);node=document.createElement('div');node.textContent=c.word.text;
      node.setAttribute('style','font-family:'+pcs.fontFamily+';font-size:'+pcs.fontSize+';font-weight:'+pcs.fontWeight+';color:'+pcs.color+';line-height:'+h+'px;white-space:nowrap;text-align:center;');}
    else if(c.kind==='blank'){node=document.createElement('div');var wall=getComputedStyle(document.getElementById('room')).backgroundColor;
      node.setAttribute('style','background:'+wall+';box-shadow:inset 0 0 0 1px rgba(255,255,255,.08)');}
    else{node=copyStyled(c.el,rules)||document.createElement('div');
      var dsp=node.style.display;node.style.display=/^inline-(flex|grid)$/.test(dsp)?dsp.slice(7):(/^inline/.test(dsp)||!dsp?'block':dsp);
      node.style.position='relative';node.style.left='auto';node.style.top='auto';node.style.right='auto';node.style.bottom='auto';node.style.margin='0';node.style.opacity='1';node.style.transform='none';
      if(c.kind==='art'){node.style.boxShadow='0 0 0 5px #f4f0e8,0 0 0 6px rgba(0,0,0,.2)';}}   // a postcard: white border
    node.style.width=w+'px';node.style.height=h+'px';node.style.boxSizing='border-box';
    var box=document.createElement('div');box.style.cssText='position:relative;width:'+w+'px;height:'+h+'px;';
    if(rules.length){var st=document.createElement('style');st.textContent=rules.join('');box.appendChild(st);}
    box.appendChild(node);return{node:box,w:w,h:h};}

  // ---------- lending: the original disappears, a dashed gap stays
  function lend(c){
    if(c.kind==='word'){var w=c.word,rg=document.createRange();try{rg.setStart(w.node,w.a);rg.setEnd(w.node,w.b);var s=document.createElement('span');s.className='rm-lent';rg.surroundContents(s);
        return{el:s,restore:function(){var p=s.parentNode;if(!p)return;while(s.firstChild)p.insertBefore(s.firstChild,s);p.removeChild(s);p.normalize();}};}catch(e){return{el:null,restore:function(){}};}}
    if(c.kind==='el'||c.kind==='line'){var el=c.el;el.classList.add('rm-lent');return{el:el,restore:function(){el.classList.remove('rm-lent');}};}
    return{el:null,restore:function(){}};}   // the painting (a reproduction) and the blank wall are not taken away

  // ---------- arming and picking
  function hints(){var tch=touchUI();$('[data-pane="r"] .rm-hint').textContent=nb(armed?(tch?T.rArmedT:T.rArmed):cur?(tch?T.rPlayT:T.rPlay):(tch?T.rHintT:T.rHint));
    $('[data-pane="h"] .rm-hint').textContent=nb(tch?T.hHintT:T.hHint);$('[data-pane="c"] .rm-hint').textContent=nb(tch?T.cHintT:T.cHint);}
  function arm(){if(armed)return;armed=true;armBtn.setAttribute('aria-pressed','true');document.body.classList.add('rm-arming');
    document.addEventListener('pointerdown',capDown,true);document.addEventListener('pointerup',capStop,true);document.addEventListener('click',capClick,true);document.addEventListener('pointermove',capMove,true);
    hints();snd('spot',.25,function(){api.sfx.tick(.03);});}
  function disarm(){if(!armed)return;armed=false;armBtn.setAttribute('aria-pressed','false');document.body.classList.remove('rm-arming');hl.style.display='none';
    document.removeEventListener('pointerdown',capDown,true);document.removeEventListener('pointerup',capStop,true);document.removeEventListener('click',capClick,true);document.removeEventListener('pointermove',capMove,true);hints();}
  function ownControl(t){return t&&t.closest&&(t.closest('.rm-arm')||t.closest('.rm-gal'));}
  function capDown(e){if(ownControl(e.target))return;e.stopPropagation();if(e.pointerType!=='touch')e.preventDefault();}
  function capStop(e){if(ownControl(e.target))return;e.stopPropagation();}
  function capMove(e){if(e.pointerType==='touch')return;var c=candidate(e.clientX,e.clientY,e.target,false);if(!c||ownControl(e.target)){hl.style.display='none';return;}
    var r=c.rect;hl.style.display='block';hl.style.left=(r.left-4)+'px';hl.style.top=(r.top-4)+'px';hl.style.width=(r.width+8)+'px';hl.style.height=(r.height+8)+'px';
    hl.classList.toggle('below',r.top<40);hl.firstChild.textContent='《'+short(c.title,10)+'》';}
  function capClick(e){if(ownControl(e.target))return;e.stopPropagation();e.preventDefault();
    var kbd=e.detail===0&&!e.clientX&&!e.clientY,c=candidate(e.clientX,e.clientY,e.target,kbd);if(!c)return;disarm();pick(c);}
  armBtn.addEventListener('click',function(){if(armed)disarm();else arm();});

  var ghost=null,fly=null;
  function pick(c){
    returnCur(true);
    var cp=makeCopy(c),g=G();
    // fit: the longer side ≤ the room above the plinth (so it can lie on any face), small things grow up to ×4
    var room2=Math.min(g.pw*1.25,g.top*.62,g.w*.6),S=Math.min(room2/Math.max(cp.w,cp.h),4);    var L=lend(c);
    cur={c:c,title:c.title,mat:c.mat,box:cp.node,w0:cp.w,h0:cp.h,S:S,restore:L.restore,lent:L.el};
    var sig=document.createElement('div');sig.className='rm-sig';cp.node.appendChild(sig);cur.sig=sig;paintSig();
    // flight: a fixed ghost from the original's place to above the plinth
    ghost=document.createElement('div');ghost.className='rm-ghost';ghost.appendChild(cp.node);document.body.appendChild(ghost);
    fly={t:0,x0:c.rect.left,y0:c.rect.top,s0:1,dur:reduce?.35:.8};
    try{var rd=readEl(),gr=gal.getBoundingClientRect();if(rd&&rd.contains(gal)&&(gr.top<rd.getBoundingClientRect().top+10||gr.bottom>innerHeight-100))gal.scrollIntoView({block:'center',behavior:reduce?'auto':'smooth'});}catch(e){}
    B.mode='fly';B.lit=0;spot.classList.remove('on');card.hidden=true;signF.hidden=true;plq.textContent='';
    snd('lift',.45,function(){api.sfx.whoosh(.05,.5);});hints();}
  function paintSig(){if(!cur||!cur.sig)return;var n=artist||'';cur.sig.textContent=n?n+' '+YEAR:'';cur.sig.style.transform='scale('+(1/cur.S*1.05).toFixed(3)+')';
    cur.sig.style.fontSize=Math.max(9,Math.min(15,Math.min(cur.w0,cur.h0)*cur.S*.14))+'px';}
  function writeCard(){if(!cur)return;card.hidden=false;var q=function(s){return card.querySelector(s);};
    q('.t').textContent='《'+cur.title+'》';q('.y').textContent='现成品，'+YEAR;q('.mat').textContent=T.material+'：'+cur.mat;
    q('.who').textContent=T.artist+'：'+(artist||T.unsigned);signF.hidden=!!artist;}
  signF.addEventListener('submit',function(e){e.preventDefault();var n=String(nameIn.value||'').replace(/\s+/g,' ').trim().slice(0,16);if(!n){nameIn.focus();return;}
    artist=n;saveName(n);paintSig();writeCard();snd('spot',.3,function(){api.sfx.tick(.04);});});
  function returnCur(quiet){if(!cur)return;try{cur.restore();}catch(e){}if(cur.box&&cur.box.parentNode)cur.box.parentNode.removeChild(cur.box);if(ghost&&ghost.parentNode)ghost.parentNode.removeChild(ghost);
    ghost=null;fly=null;cur=null;B.mode='none';spot.classList.remove('on');card.hidden=true;signF.hidden=true;plq.textContent=T.empty;gap.style.display='none';shadowEl.style.opacity=0;
    if(!quiet){snd('lift',.3,function(){api.sfx.puff(.03,.3);});}hints();}
  $('.rm-back').addEventListener('click',function(){returnCur(false);});

  // ---------- rigid-box physics on the plinth (stage px, y down). A box of footprint fw × height fh stands on face k (θ = k·90° + φ);
  // tipping about the right (φ > 0) or left corner: φ'' = 3g·c/(fw² + fh²), c = the centre's horizontal offset beyond the pivot.
  var GRAV=reduce?1400:2600;
  function dims(face){var w=cur.w0*cur.S,h=cur.h0*cur.S;return face%2?{fw:h,fh:w}:{fw:w,fh:h};}
  function ext(th){var w=cur.w0*cur.S,h=cur.h0*cur.S,c=Math.abs(Math.cos(th)),s=Math.abs(Math.sin(th));return{x:(w*c+h*s)/2,y:(w*s+h*c)/2};}
  function groundPose(){var g=G(),d=dims(B.face),sgn=B.phi>=0?1:-1,a=Math.abs(B.phi),px=B.cx+sgn*d.fw/2;
    // centre relative to the pivot corner, rotated by φ about it
    var rx=-sgn*d.fw/2,ry=-d.fh/2,c=Math.cos(sgn*a),s=Math.sin(sgn*a);return{x:px+rx*c-ry*s,y:g.top+rx*s+ry*c,th:B.face*Math.PI/2+B.phi};}
  function land(v){var k=Math.round(B.th/(Math.PI/2));B.face=((k%4)+4)%4;B.phi=B.th-k*Math.PI/2;var d=dims(B.face),g=G();
    // put the resting centre where the box came down, kept on the plinth
    B.cx=0;var p0=groundPose();B.cx=clamp(B.x-p0.x,g.x0+d.fw/2-2,g.x1-d.fw/2+2);B.mode='ground';B.om=B.om*.5+B.vx/(d.fh+d.fw)*1.2;
    B.squash=Math.min(.16,v/9000);B.sv=0;puffDust(B.x,g.top,v);
    snd('land',clamp(v/2200,.25,1),function(){api.sfx.thud(clamp(v/9000,.05,.3));});
    if(!B.lit){B.litT=performance.now()+(reduce?120:320);}}
  function stepBody(dt){if(!cur)return;var g=G();
    if(B.mode==='fly'&&fly){fly.t+=dt/fly.dur;var u=sm(fly.t),gr=gal.getBoundingClientRect(),w=cur.w0*cur.S,h=cur.h0*cur.S;
      var tx=gr.left+g.w/2-w/2,ty=gr.top+Math.max(6,g.top-h-g.top*.55),cx=(fly.x0+tx)/2,cy=Math.min(fly.y0,ty)-Math.min(160,Math.abs(tx-fly.x0)*.25+60);
      var x=(1-u)*(1-u)*fly.x0+2*(1-u)*u*cx+u*u*tx,y=(1-u)*(1-u)*fly.y0+2*(1-u)*u*cy+u*u*ty,s=lerp(1,cur.S,u),rot=Math.sin(u*Math.PI)*(reduce?.05:.35);
      ghost.style.transform='translate('+x.toFixed(1)+'px,'+y.toFixed(1)+'px) rotate('+rot.toFixed(3)+'rad) scale('+s.toFixed(4)+')';
      if(fly.t>=1){   // dock into the stage and let it fall
        ghost.removeChild(cur.box);ghost.parentNode.removeChild(ghost);ghost=null;fly=null;
        cur.box.classList.add('rm-obj');gal.appendChild(cur.box);cur.box.style.position='absolute';bindObj(cur.box);
        B.mode='air';B.x=g.w/2;B.y=ty-gr.top+h/2;B.vx=0;B.vy=120;B.th=0;B.om=rnd(-.6,.6);B.face=0;B.phi=0;}
      return;}
    if(B.mode==='air'){B.vy+=GRAV*dt;B.x+=B.vx*dt;B.y+=B.vy*dt;B.th+=B.om*dt;B.om*=Math.exp(-.4*dt);
      var e=ext(B.th);if(B.x-e.x<4){B.x=4+e.x;B.vx=Math.abs(B.vx)*.4;}if(B.x+e.x>g.w-4){B.x=g.w-4-e.x;B.vx=-Math.abs(B.vx)*.4;}
      if(B.y+e.y>=g.top&&B.vy>0){B.y=g.top-e.y;var v=B.vy;
        if(v>700&&!reduce){B.vy=-v*.26;B.vx*=.6;B.om=B.om*.6+rnd(-1,1)*v/1600;B.squash=Math.min(.18,v/8000);puffDust(B.x,g.top,v*.6);snd('land',clamp(v/2600,.2,.9),function(){api.sfx.thud(clamp(v/10000,.04,.25));});}
        else land(v);}
      return;}
    if(B.mode==='ground'){var d=dims(B.face),n=4,h2=dt/n;
      for(var i=0;i<n;i++){
        if(B.phi===0&&Math.abs(B.om)<.02){B.om=0;break;}
        if(B.phi===0)B.phi=B.om>0?1e-4:-1e-4;
        var sgn=B.phi>0?1:-1,a=Math.abs(B.phi),c=-d.fw/2*Math.cos(a)+d.fh/2*Math.sin(a),alpha=3*GRAV*c/(d.fw*d.fw+d.fh*d.fh);
        B.om+=sgn*alpha*h2;B.om*=Math.exp(-.5*h2);B.phi+=B.om*h2;
        if(B.phi*sgn<=0){   // back down on the face: a clack and a small rebound onto the other corner
          var imp=Math.abs(B.om);B.phi=0;B.om=-B.om*.3;if(imp>.9)snd('tip',clamp(imp/8,.15,.6),function(){api.sfx.thud(clamp(imp/60,.02,.08));});if(Math.abs(B.om)<.25)B.om=0;}
        else if(a>=Math.PI/2){   // fell onto the next face
          var imp2=Math.abs(B.om),pv=B.cx+sgn*d.fw/2;B.face=((B.face+sgn)%4+4)%4;var d2=dims(B.face),ncx=pv+sgn*d2.fw/2;
          {var fx=clamp(ncx,g.x0+d2.fw/2,g.x1-d2.fw/2);B.slide+=ncx-fx;B.cx=fx;d=d2;B.phi=0;B.om=-sgn*imp2*.18;B.squash=Math.min(.12,imp2/60);puffDust(ncx,g.top,imp2*260);
            snd('land',clamp(imp2/7,.25,.9),function(){api.sfx.thud(clamp(imp2/40,.05,.2));});}}}
      B.slide*=Math.exp(-dt*9);if(Math.abs(B.slide)<.2)B.slide=0;   // landed half over the edge: it slides back onto the plinth
      var p=groundPose();B.x=p.x+B.slide;B.y=p.y;B.th=p.th;}
    if(B.mode==='held'){var hd=B.held;B.x=clamp(hd.px+hd.dx,20,g.w-20);B.y=clamp(hd.py+hd.dy,20,g.top-ext(B.th).y);
      var tgt=clamp(-B.vx*.0009,-.9,.9)+hd.th0;B.om+=((tgt-B.th)*60-B.om*10)*dt;B.th+=B.om*dt;}
    // squash spring
    B.sv+=(-B.squash*900-B.sv*22)*dt;B.squash+=B.sv*dt;if(Math.abs(B.squash)<1e-4&&Math.abs(B.sv)<1e-3){B.squash=0;B.sv=0;}}
  function renderBody(){if(!cur||!cur.box||B.mode==='fly'||!cur.box.parentNode||cur.box.parentNode!==gal)return;var g=G(),w=cur.w0,h=cur.h0,sq=B.squash;
    var sy=cur.S*(1-sq),sx=cur.S*(1+sq*.7),e=ext(B.th),by=B.y+e.y;   // squash about the bottom
    var yy=B.y+(B.mode==='ground'?e.y*sq:0);
    cur.box.style.transform='translate('+(B.x-w/2).toFixed(2)+'px,'+(yy-h/2).toFixed(2)+'px) rotate('+B.th.toFixed(4)+'rad) scale('+sx.toFixed(4)+','+sy.toFixed(4)+')';
    var hgt=Math.max(0,g.top-by),sw=e.x*2*(1-Math.min(.5,hgt/400));shadowEl.style.left=(B.x-sw/2-6)+'px';shadowEl.style.width=(sw+12)+'px';shadowEl.style.top=(g.top-5)+'px';
    shadowEl.style.opacity=clamp(1-hgt/260,0,1)*.9;}
  // drag: pick it up, carry it, let go
  function bindObj(el){el.addEventListener('pointerdown',function(e){if(!cur||e.button>0)return;e.preventDefault();e.stopPropagation();try{el.setPointerCapture(e.pointerId);}catch(_){}
      var gr=gal.getBoundingClientRect(),px=e.clientX-gr.left,py=e.clientY-gr.top;B.held={id:e.pointerId,px:px,py:py,dx:B.x-px,dy:B.y-py,th0:B.th};B.mode='held';B.vx=0;B.vy=0;B.om=0;
      B.samples=[[performance.now(),px,py]];el.classList.add('held');snd('lift',.25,function(){api.sfx.puff(.02,.2);});});
    el.addEventListener('pointermove',function(e){if(B.mode!=='held'||!B.held||B.held.id!==e.pointerId)return;var gr=gal.getBoundingClientRect(),now=performance.now();
      B.held.px=e.clientX-gr.left;B.held.py=e.clientY-gr.top;B.samples.push([now,B.held.px,B.held.py]);while(B.samples.length>2&&now-B.samples[0][0]>90)B.samples.shift();
      var a=B.samples[0],b=B.samples[B.samples.length-1],t=Math.max((b[0]-a[0])/1000,.016);B.vx=(b[1]-a[1])/t;});
    function up(e){if(B.mode!=='held'||!B.held||(e&&B.held.id!==e.pointerId))return;B.held=null;el.classList.remove('held');
      var s=B.samples,a=s[0],b=s[s.length-1],t=Math.max((b[0]-a[0])/1000,.016);B.vx=clamp((b[1]-a[1])/t,-1800,1800);B.vy=clamp((b[2]-a[2])/t,-1800,1800);B.om+=B.vx/260;B.mode='air';}
    el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);el.addEventListener('lostpointercapture',up);}
  function push(dir){if(!cur||B.mode==='fly')return;if(B.mode!=='ground'){return;}var d=dims(B.face),need=Math.sqrt(6*GRAV*(Math.hypot(d.fw,d.fh)/2-d.fh/2)/(d.fw*d.fw+d.fh*d.fh)*1)+.6;
    if(B.phi===0)B.phi=dir*1e-4;B.om+=dir*Math.max(need*1.05,1.2);snd('tip',.3,function(){api.sfx.tick(.03);});}
  $('.rm-pl').addEventListener('click',function(){push(-1);});$('.rm-pr').addEventListener('click',function(){push(1);});
  // dust puffs + the spotlight cone (drawn once per size)
  var dg=dust.getContext('2d'),sg=spot.getContext('2d');
  function puffDust(x,y,v){if(reduce)return;var n=Math.round(clamp(v/120,3,16));for(var i=0;i<n;i++)parts.push({x:x+rnd(-30,30),y:y-2,vx:rnd(-1,1)*(40+v*.05),vy:-rnd(10,50+v*.03),life:0,max:rnd(.5,1.1),r:rnd(1.5,4)});}
  function drawDust(dt){var w=gal.clientWidth,h=gal.clientHeight,dpr=Math.min(devicePixelRatio||1,2);if(dust.width!==Math.round(w*dpr)||dust.height!==Math.round(h*dpr)){dust.width=Math.round(w*dpr);dust.height=Math.round(h*dpr);}
    dg.setTransform(dpr,0,0,dpr,0,0);dg.clearRect(0,0,w,h);parts=parts.filter(function(p){p.life+=dt;p.vy+=30*dt;p.vx*=Math.exp(-3*dt);p.x+=p.vx*dt;p.y+=p.vy*dt;var a=1-p.life/p.max;if(a<=0)return false;
      dg.fillStyle='rgba(230,220,200,'+(a*.35).toFixed(3)+')';dg.beginPath();dg.arc(p.x,p.y,p.r*(1+p.life),0,Math.PI*2);dg.fill();return true;});}
  function drawSpot(){var w=gal.clientWidth,h=gal.clientHeight,dpr=Math.min(devicePixelRatio||1,2),g=G(),key=w+'x'+h;if(drawSpot.k===key)return;drawSpot.k=key;
    spot.width=Math.round(w*dpr);spot.height=Math.round(h*dpr);sg.setTransform(dpr,0,0,dpr,0,0);sg.clearRect(0,0,w,h);
    var cx=w/2,top=-10,bw=g.pw*.95;var gr=sg.createLinearGradient(0,0,0,g.top);gr.addColorStop(0,'rgba(255,240,210,.02)');gr.addColorStop(1,'rgba(255,236,200,.16)');
    sg.fillStyle=gr;sg.beginPath();sg.moveTo(cx-10,top);sg.lineTo(cx+10,top);sg.lineTo(cx+bw/2+14,g.top);sg.lineTo(cx-bw/2-14,g.top);sg.closePath();sg.fill();
    var pool=sg.createRadialGradient(cx,g.top,4,cx,g.top,bw*.75);pool.addColorStop(0,'rgba(255,238,205,.34)');pool.addColorStop(1,'rgba(255,238,205,0)');sg.fillStyle=pool;sg.fillRect(0,g.top-bw*.5,w,bw);
    sg.fillStyle='rgba(255,246,228,.9)';sg.beginPath();sg.ellipse(cx,2,14,4,0,0,Math.PI*2);sg.fill();}
  function lendGap(){var el=cur&&cur.lent;if(!el||!el.isConnected){gap.style.display='none';return;}var r=el.getBoundingClientRect(),rd=readEl();
    var vis=r.width>0&&r.bottom>0&&r.top<innerHeight;if(vis&&rd&&rd.contains(el)){var q=rd.getBoundingClientRect();vis=r.top>q.top+10&&r.bottom<q.bottom-20;}
    var room=document.getElementById('room');if(vis&&room&&!room.classList.contains('reading')&&!(rd&&rd.contains(el)))vis=true;
    gap.style.display=vis?'block':'none';if(!vis)return;gap.style.left=(r.left-2)+'px';gap.style.top=(r.top-2)+'px';gap.style.width=(r.width+4)+'px';gap.style.height=(r.height+4)+'px';
    gap.firstChild.style.display=r.width>44&&r.height>12?'':'none';}
  function stepReady(dt,now){layoutPed();drawSpot();stepBody(dt);renderBody();drawDust(dt);lendGap();
    if(B.litT&&now>=B.litT){B.litT=0;B.lit=1;spot.classList.add('on');snd('spot',.5,function(){api.sfx.tick(.05);});writeCard();
      setTimeout(function(){if(!dead&&cur)snd('murmur',.35,function(){});},500);if(!artist)setTimeout(function(){if(!dead&&!signF.hidden&&!touchUI())try{nameIn.focus({preventScroll:true});}catch(e){}},700);}}

  // ================================================================= 2 · THE HAT
  var hc=$('.rm-hat'),hg=hc.getContext('2d'),poemEl=$('.rm-poem');
  function wallWords(){var t=[room.one,room.lede,room.work,room.origin,room.chain,sp.text,TR.text,(room.quote||[])[0]];(room.traits||[]).forEach(function(x){t.push(Array.isArray(x)?x.join(' '):(x&&(x.d||x.t)));});
    var s=t.filter(function(x){return typeof x==='string';}).join('。').replace(/[（(][^）)]*[）)]/g,' '),out=[],seen={};
    if(SEG){var it=SEG.segment(s)[Symbol.iterator](),v;while(!(v=it.next()).done){var g=v.value;if(!g.isWordLike)continue;var w=g.segment.trim();if(!w||/^[0-9A-Za-z.]+$/.test(w)&&w.length<3)continue;if(seen[w])continue;seen[w]=1;out.push(w);}}
    else{s.split(/[，。、；：“”《》\s]+/).forEach(function(w){for(var i=0;i<w.length;i+=2){var q=w.slice(i,i+2);if(q&&!seen[q]){seen[q]=1;out.push(q);}}});}
    if(out.length<30)'梦 钟表 软 融化 海岸 蚂蚁 帽子 偶然 小便池 签名 展厅 杜尚 达利 影子 枯枝 下午 记忆 永恒 石头 地平线 胡闹 诗 剪刀 报纸'.split(' ').forEach(function(w){if(!seen[w]){seen[w]=1;out.push(w);}});
    return out;}
  var WORDS=wallWords();
  var H={x:0,y:0,tx:0,ty:0,vx:0,vy:0,ax:0,ay:0,tilt:0,held:null,pour:0,pouring:false,poured:[],slips:[],out:[],iw:140,ih:120,W:0,Hh:0,rust:0,lastR:0,shake:0};
  function hatGeom(){var w=hc.clientWidth||320,h=Math.round(clamp(w*.95,330,420));if(H.W!==w||H.Hh!==h){var first=!H.W;H.W=w;H.Hh=h;var dpr=Math.min(devicePixelRatio||1,2);hc.width=Math.round(w*dpr);hc.height=Math.round(h*dpr);hc.style.height=h+'px';
      H.iw=Math.round(clamp(w*.34,110,160));H.ih=Math.round(H.iw*.86);if(first||!H.held){H.x=H.tx=w/2;H.y=H.ty=Math.round(h*.17);}layoutPoem();}}
  function tearWords(n,fromAbove){var pool=WORDS.slice();for(var i=pool.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=pool[i];pool[i]=pool[j];pool[j]=t;}
    pool=pool.slice(0,n);hg.font='400 15px '+getComputedStyle(host).getPropertyValue('--song');
    H.slips=pool.map(function(w,i){var tw=Math.min(hg.measureText(w).width,64)+14,x=rnd(-H.iw/2+20,H.iw/2-20),y=fromAbove?-40-i*14:rnd(H.ih*.35,H.ih-14);
      var jag=[];for(var k=0;k<10;k++)jag.push(rnd(-1.4,1.4));return{w:w,tw:tw,r:clamp(tw/2.6,11,19),x:x,y:y,px:x,py:y,a:rnd(-.5,.5),va:0,jag:jag};});}
  tearWords(28,false);
  function layoutPoem(){var n=H.out.length;if(!n)return;var x0=16,x=x0,maxX=H.W-16,line=0,y0=H.Hh*.6;
    H.out.forEach(function(s,i){if(i>0&&(x+s.tw>maxX||s.br)){x=x0;line++;}s.line=line;s.sx=x+s.tw/2;x+=s.tw+8;});
    var lh=Math.min(36,line?(H.Hh-18-y0)/line:36);H.out.forEach(function(s){s.sy=y0+s.line*lh;});}
  function lineBreakChance(i){return i>1&&Math.random()<.26;}
  function stepHat(dt){hatGeom();var W=H.W,Hh=H.Hh;
    // the hat follows its target (pointer or pour choreography) with a stiff spring
    if(H.pouring){H.pour+=dt;var p=H.pour,up=sm(p/.7),back=sm((p-3.3)/.8);H.tx=lerp(W/2,W*.32,up*(1-back));H.ty=lerp(Hh*.17,Hh*.2,up*(1-back));
      var til=lerp(0,2.35,sm(p/1.1))*(1-back);H.tilt=til;
      if(H.out.length>=14&&p<3.3)H.pour=3.3;if(p>4.2){H.pouring=false;H.tilt=0;pourBtn.disabled=false;finishPoem();}}
    var ovx=H.vx,ovy=H.vy,k=H.held?520:180,z=H.held?38:20;
    H.vx+=((H.tx-H.x)*k-H.vx*z)*dt;H.vy+=((H.ty-H.y)*k-H.vy*z)*dt;H.x+=H.vx*dt;H.y+=H.vy*dt;
    H.ax=(H.vx-ovx)/Math.max(dt,1e-3);H.ay=(H.vy-ovy)/Math.max(dt,1e-3);
    // slips in the hat's frame: gravity minus the hat's acceleration, rotated into the hat
    H.ax=clamp(H.ax,-16000,16000);H.ay=clamp(H.ay,-16000,16000);
    var c=Math.cos(-H.tilt),s=Math.sin(-H.tilt),gx=-H.ax*.9,gy=900-H.ay*.9,lx=gx*c-gy*s,ly=gx*s+gy*c;
    var hw=H.iw/2,sub=3,hs=dt/sub,energy=0;
    for(var it=0;it<sub;it++){
      H.slips.forEach(function(q){var vx=(q.x-q.px)*.992,vy=(q.y-q.py)*.992;q.px=q.x;q.py=q.y;q.x+=vx+lx*hs*hs;q.y+=vy+ly*hs*hs;});
      for(var rep=0;rep<2;rep++){
        for(var i=0;i<H.slips.length;i++)for(var j=i+1;j<H.slips.length;j++){var a=H.slips[i],b=H.slips[j],dx=b.x-a.x,dy=b.y-a.y,d2=dx*dx+dy*dy,rr=a.r+b.r;if(d2<rr*rr&&d2>1e-6){var d=Math.sqrt(d2),o=(rr-d)/2/d;a.x-=dx*o;a.y-=dy*o;b.x+=dx*o;b.y+=dy*o;}}
        H.slips.forEach(function(q){var r=q.r,wx=hw*(q.y<0?1:1-.08*(q.y/H.ih));
          if(q.x<-wx+r){q.x=-wx+r;q.px=q.x+(q.x-q.px)*.4;}if(q.x>wx-r){q.x=wx-r;q.px=q.x+(q.x-q.px)*.4;}
          if(q.y>H.ih-r){q.y=H.ih-r;q.py=q.y+(q.y-q.py)*.35;}
          if(!H.pouring&&q.y<-70){q.y=-70;q.py=q.y;}});}}
    // slips that crossed the opening while pouring leave the hat, in that order
    if(H.pouring&&H.tilt>1.2&&H.out.length<14){for(var m=H.slips.length-1;m>=0;m--){var q=H.slips[m];if(q.y<-q.r*.5){H.slips.splice(m,1);var cw=Math.cos(H.tilt),sw=Math.sin(H.tilt);
        q.wx=H.x+q.x*cw-q.y*sw;q.wy=H.y+q.x*sw+q.y*cw;q.wvx=H.vx+rnd(-40,40);q.wvy=H.vy;q.t=0;q.br=H.out.length>0&&H.lineN>=2&&Math.random()<.3;if(q.br)H.lineN=0;H.lineN++;H.out.push(q);
        if(H.out.length===1){H.poemWords=[];}H.poemWords.push(q.w);layoutPoem();renderPoem(false);snd('pour',.35,function(){api.sfx.puff(.03,.25);});if(H.out.length>=14)break;}}}
    H.slips.forEach(function(q){var v=Math.hypot(q.x-q.px,q.y-q.py)/hs;energy+=v;q.va+=((q.x-q.px)*.02-q.va*.2);q.a=clamp(q.a+q.va,-1.2,1.2);});
    // poured slips: fall a moment, then settle into their place in the poem
    H.out.forEach(function(q){q.t+=dt;if(q.t<.35){q.wvy+=900*dt;q.wx+=q.wvx*dt;q.wy+=q.wvy*dt;q.a+=dt*3;}else{var e=1-Math.exp(-dt*9);q.wx+=(q.sx-q.wx)*e;q.wy+=(q.sy-q.wy)*e;q.a+=(0-q.a)*e;}});
    // rustle while shaking
    var shake=Math.hypot(H.ax,H.ay);H.shake=lerp(H.shake,shake,.2);var now=performance.now();
    if(H.shake>2500&&energy>H.slips.length*120&&now-H.lastR>(REC.rustle?420:160)){H.lastR=now;snd('rustle',clamp(H.shake/12000,.15,.6),function(){api.sfx.puff(clamp(H.shake/200000,.01,.05),.18);});}}
  function roundRect(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.lineTo(x+w-r,y);g.quadraticCurveTo(x+w,y,x+w,y+r);g.lineTo(x+w,y+h-r);g.quadraticCurveTo(x+w,y+h,x+w-r,y+h);g.lineTo(x+r,y+h);g.quadraticCurveTo(x,y+h,x,y+h-r);g.lineTo(x,y+r);g.quadraticCurveTo(x,y,x+r,y);}
  function drawSlip(g,q,x,y,a,font){g.save();g.translate(x,y);g.rotate(a*.5);var w=q.tw,h=24,j=q.jag;
    g.fillStyle='rgba(0,0,0,.25)';g.fillRect(-w/2+2,-h/2+3,w,h);
    g.fillStyle='#efe6d2';g.beginPath();g.moveTo(-w/2+j[0],-h/2);for(var i=1;i<5;i++)g.lineTo(-w/2+w*i/5,-h/2+j[i]);g.lineTo(w/2+j[5],-h/2);g.lineTo(w/2-j[6],h/2);for(var k=4;k>0;k--)g.lineTo(-w/2+w*k/5,h/2+j[5+k]);g.lineTo(-w/2-j[0],h/2);g.closePath();g.fill();
    g.fillStyle='#2a231c';g.font=font;g.textAlign='center';g.textBaseline='middle';g.fillText(q.w,0,1);g.restore();}
  function drawHat(){var dpr=Math.min(devicePixelRatio||1,2),g=hg,W=H.W,Hh=H.Hh,font='400 15px '+(getComputedStyle(host).getPropertyValue('--song')||'serif');
    g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,W,Hh);
    // table line for the poem
    g.fillStyle='#1b1714';g.fillRect(0,Hh*.52,W,Hh*.48);g.strokeStyle='rgba(240,225,200,.08)';g.beginPath();g.moveTo(0,Hh*.52+.5);g.lineTo(W,Hh*.52+.5);g.stroke();
    var hw=H.iw/2,ih=H.ih,rimH=Math.max(10,H.iw*.13);
    g.save();g.translate(H.x,H.y);g.rotate(H.tilt);
    // shadowed interior (back half) + lining
    g.fillStyle='#0c0a09';g.beginPath();g.moveTo(-hw,0);g.lineTo(-hw*.92,ih);g.lineTo(hw*.92,ih);g.lineTo(hw,0);g.closePath();g.fill();
    g.fillStyle='#3a1f22';g.beginPath();g.ellipse(0,0,hw,rimH*.55,0,Math.PI,0);g.fill();
    g.save();g.beginPath();g.moveTo(-hw*1.6,-240);g.lineTo(hw*1.6,-240);g.lineTo(hw,0);g.lineTo(hw*.92,ih);g.lineTo(-hw*.92,ih);g.lineTo(-hw,0);g.closePath();g.clip();   // inside the hat (or above its opening)
    H.slips.forEach(function(q){drawSlip(g,q,q.x,q.y,q.a,font);});g.restore();
    // front wall: felt, a little translucent so the slips show through
    var fg=g.createLinearGradient(-hw,0,hw,0);fg.addColorStop(0,'rgba(18,15,14,.93)');fg.addColorStop(.35,'rgba(52,46,42,.82)');fg.addColorStop(.6,'rgba(34,30,28,.84)');fg.addColorStop(1,'rgba(12,10,9,.94)');
    g.fillStyle=fg;g.beginPath();g.moveTo(-hw,rimH*.2);g.lineTo(-hw*.92,ih);g.ellipse(0,ih,hw*.92,rimH*.45,0,Math.PI,0,true);g.lineTo(hw,rimH*.2);g.closePath();g.fill();
    g.fillStyle='rgba(120,30,34,.85)';g.fillRect(-hw*.99,rimH*.9,hw*1.98,rimH*.8);   // band
    // brim (front half) — the opening
    g.strokeStyle='#4a423c';g.lineWidth=1;g.fillStyle='#1d1917';g.beginPath();g.ellipse(0,0,hw+rimH*1.3,rimH,0,0,Math.PI);g.ellipse(0,0,hw,rimH*.55,0,Math.PI,0,true);g.closePath();g.fill();g.stroke();
    g.restore();
    H.out.forEach(function(q){drawSlip(g,q,q.wx,q.wy,q.a,font);});}
  function renderPoem(done){var n=H.out.length;if(!n){poemEl.classList.add('empty');poemEl.textContent=nb('帽子里有 '+H.slips.length+' 张纸条，都是从这个展厅的说明里撕下的词。');return;}
    poemEl.classList.remove('empty');var lines=[],cur2=[];H.out.forEach(function(q,i){if(i>0&&q.br){lines.push(cur2.join(' '));cur2=[];}cur2.push(q.w);});lines.push(cur2.join(' '));
    poemEl.innerHTML='';lines.forEach(function(l,i){if(i)poemEl.appendChild(document.createElement('br'));poemEl.appendChild(document.createTextNode(l));});}
  function finishPoem(){renderPoem(true);}
  var pourBtn=$('.rm-pour');
  function pour(){if(H.pouring)return;H.lineN=0;if(H.slips.length<6)tearWords(28,true);H.out=[];H.pour=0;H.pouring=true;pourBtn.disabled=true;renderPoem(false);snd('pour',.4,function(){api.sfx.whoosh(.03,.6);});}
  pourBtn.addEventListener('click',pour);
  $('.rm-tear').addEventListener('click',function(){if(H.pouring)return;H.out=[];tearWords(28,true);renderPoem(false);var i=0;(function rip(){if(dead||i++>3)return;snd('tear',.45,function(){api.sfx.puff(.05,.12);});setTimeout(rip,140);})();});
  var shakeT=0;$('.rm-shake').addEventListener('click',function(){if(H.pouring)return;var t0=performance.now();(function sh(){var t=(performance.now()-t0)/1000;if(dead||t>1.1||H.held){H.tx=H.W/2;H.ty=H.Hh*.17;return;}
    H.tx=H.W/2+Math.sin(t*26)*H.iw*.35*(1-t/1.2);H.ty=H.Hh*.17+Math.cos(t*19)*16;shakeT=requestAnimationFrame(sh);})();});
  hc.addEventListener('pointerdown',function(e){if(H.pouring||e.button>0)return;var r=hc.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
    if(Math.abs(x-H.x)>H.iw*.9||y<H.y-80||y>H.y+H.ih+30)return;e.preventDefault();try{hc.setPointerCapture(e.pointerId);}catch(_){}H.held={id:e.pointerId,dx:H.x-x,dy:H.y-y};hc.classList.add('held');});
  hc.addEventListener('pointermove',function(e){if(!H.held||H.held.id!==e.pointerId)return;var r=hc.getBoundingClientRect();H.tx=clamp(e.clientX-r.left+H.held.dx,H.iw/2+24,H.W-H.iw/2-24);H.ty=clamp(e.clientY-r.top+H.held.dy,70,H.Hh*.5-H.ih*.5);});
  function hatUp(e){if(!H.held||(e&&H.held.id!==e.pointerId))return;H.held=null;hc.classList.remove('held');H.tx=H.W/2;H.ty=H.Hh*.17;}
  hc.addEventListener('pointerup',hatUp);hc.addEventListener('pointercancel',hatUp);hc.addEventListener('lostpointercapture',hatUp);
  renderPoem(false);

  // ================================================================= 3 · EXQUISITE CORPSE
  var cx=$('.rm-cx'),cg=cx.getContext('2d'),capEl=$('.rm-cap'),unfoldBtn=$('.rm-unfold');
  var atlas=api.img('s_corpse.webp');
  var ROWS=['h','t','l'],C={W:0,Hc:0,unf:0,unfT:0,drag:null};
  var R={};ROWS.forEach(function(k,i){var n=ATLAS.rows[k].items.length;R[k]={off:(i*2+Math.floor(Math.random()*n))%n,v:0,target:null};});
  // start with a mismatched body so the first unfold is already a creature
  R.h.off=Math.floor(Math.random()*ATLAS.rows.h.items.length);R.t.off=(R.h.off+2)%ATLAS.rows.t.items.length;R.l.off=(R.h.off+4)%ATLAS.rows.l.items.length;
  function cGeom(){var w=Math.min(root.clientWidth||360,420),h=Math.round(w*680/600);if(C.W!==w){C.W=w;C.Hc=h;var dpr=Math.min(devicePixelRatio||1,2);cx.width=Math.round(w*dpr);cx.height=Math.round(h*dpr);cx.style.width=w+'px';cx.style.height=h+'px';}}
  function band(k){var r=ATLAS.rows[k],z=C.W/ATLAS.w,y=0;for(var i=0;i<ROWS.length&&ROWS[i]!==k;i++)y+=ATLAS.rows[ROWS[i]].h*z;return{y:y,h:r.h*z,z:z};}
  function wrapI(k,i){var n=ATLAS.rows[k].items.length;return((i%n)+n)%n;}
  function stepCorpse(dt){cGeom();ROWS.forEach(function(k){var s=R[k];if(C.drag&&C.drag.k===k)return;
      if(s.target!=null){var d=s.target-s.off;s.v+=(d*140-s.v*20)*dt;s.off+=s.v*dt;if(Math.abs(d)<.002&&Math.abs(s.v)<.01){s.off=s.target;s.v=0;s.target=null;var n=ATLAS.rows[k].items.length;s.off=wrapI(k,Math.round(s.off));caption();}}
      else if(Math.abs(s.v)>.01){s.off+=s.v*dt;s.v*=Math.exp(-3.2*dt);if(Math.abs(s.v)<.9){s.target=Math.round(s.off+s.v*.12);snd('slide',.3,function(){api.sfx.tick(.02);});}}
      else if(Math.abs(s.off-Math.round(s.off))>.001){s.target=Math.round(s.off);}});
    var goal=unfoldBtn.getAttribute('aria-pressed')==='true'?1:0;C.unf+=(goal-C.unf)*(1-Math.exp(-dt*(reduce?12:3.2)));if(Math.abs(goal-C.unf)<.002)C.unf=goal;}
  function drawCorpse(){var dpr=Math.min(devicePixelRatio||1,2),g=cg,W=C.W,Hc=C.Hc;g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,W,Hc);
    g.fillStyle='#ece3d0';g.fillRect(0,0,W,Hc);
    ROWS.forEach(function(k,ri){var b=band(k),s=R[k],o=s.off,i0=Math.floor(o),fr=o-i0,rw=ATLAS.rows[k];
      g.save();g.beginPath();g.rect(0,b.y,W,b.h);g.clip();
      if(ok(atlas))for(var d=-1;d<=1;d++){var ii=wrapI(k,i0+d),x=(d-fr)*W;if(x>-W&&x<W)g.drawImage(atlas,ii*ATLAS.w,rw.y,ATLAS.w,rw.h,x,b.y,W,b.h);}
      g.restore();
      // the flap: folded paper over the strip, lifting from its bottom edge as the sheet unfolds (staggered top → bottom)
      var u=clamp(C.unf*1.6-ri*.3,0,1),peek=Math.max(8,b.h*.1),fh=(b.h-peek)*(1-sm(u));
      if(fh>.5){var yb=b.y+fh;var fg=g.createLinearGradient(0,b.y,0,yb);fg.addColorStop(0,'#e6dcc6');fg.addColorStop(.85,'#ddd2ba');fg.addColorStop(1,'#c9bda3');
        g.fillStyle=fg;g.fillRect(0,b.y,W,fh);
        // the flap's underside showing as it lifts toward the crease above
        if(u>0&&u<1){var bh=Math.min(fh,Math.sin(sm(u)*Math.PI)*b.h*.16);g.fillStyle='rgba(176,163,138,.95)';g.fillRect(0,yb-bh,W,bh);}
        g.fillStyle='rgba(60,50,38,.22)';g.fillRect(0,yb,W,2);
        g.fillStyle='rgba(60,50,38,'+(.55*(1-u)).toFixed(3)+')';g.font='400 '+Math.round(clamp(W*.045,13,18))+'px '+(getComputedStyle(host).getPropertyValue('--song')||'serif');g.textAlign='center';g.textBaseline='middle';
        g.fillText(['头','身','腿'][ri],W/2,b.y+fh/2);
        g.fillStyle='rgba(60,50,38,.4)';for(var a=0;a<2;a++){g.beginPath();g.moveTo(W/2+(a?1:-1)*(W*.14),b.y+fh/2);g.lineTo(W/2+(a?1:-1)*(W*.08),b.y+fh/2-5);g.lineTo(W/2+(a?1:-1)*(W*.08),b.y+fh/2+5);g.fill();}}
      // fold creases
      if(ri>0){g.fillStyle='rgba(90,75,55,'+(.35-.2*C.unf).toFixed(3)+')';g.fillRect(0,b.y-.5,W,1);g.fillStyle='rgba(255,255,255,'+(.4-.25*C.unf).toFixed(3)+')';g.fillRect(0,b.y+.5,W,1);}});}
  function caption(){if(C.unf<.5&&unfoldBtn.getAttribute('aria-pressed')!=='true'){capEl.textContent=nb('折着：每一截只露出接缝处的几道线。');return;}
    var parts2=ROWS.map(function(k,i){var id=ATLAS.rows[k].items[wrapI(k,Math.round(R[k].off))],s=SRC[id]||['',''],rz=(window.EH_ROOMS&&EH_ROOMS[s[0]]&&EH_ROOMS[s[0]].zh)||ROOMZH[s[0]]||'';
      return ['头','身','腿'][i]+'取自'+s[1]+(rz?'（'+rz+'厅）':'');});
    capEl.textContent=nb(parts2.join('；')+'。');}
  function slideRow(k,d){var s=R[k];s.target=Math.round(s.target!=null?s.target:s.off)+d;snd('slide',.4,function(){api.sfx.puff(.025,.25);});}
  Array.prototype.forEach.call(root.querySelectorAll('[data-s]'),function(b){b.addEventListener('click',function(){slideRow(b.getAttribute('data-s'),1);});});
  $('.rm-spin').addEventListener('click',function(){ROWS.forEach(function(k,i){var s=R[k];s.target=null;s.v=rnd(6,11)*(Math.random()<.5?-1:1);});snd('slide',.5,function(){api.sfx.whoosh(.03,.5);});});
  unfoldBtn.addEventListener('click',function(){var on=unfoldBtn.getAttribute('aria-pressed')!=='true';unfoldBtn.setAttribute('aria-pressed',on?'true':'false');unfoldBtn.textContent=on?'折起来':'展开';
    snd('fold',.5,function(){api.sfx.puff(.05,.4);});setTimeout(caption,on?700:0);});
  function rowAt(y){for(var i=0;i<ROWS.length;i++){var b=band(ROWS[i]);if(y>=b.y&&y<b.y+b.h)return ROWS[i];}return null;}
  cx.addEventListener('pointerdown',function(e){if(e.button>0)return;var r=cx.getBoundingClientRect(),k=rowAt(e.clientY-r.top);if(!k)return;
    C.drag={k:k,id:e.pointerId,x0:e.clientX,y0:e.clientY,off0:R[k].off,samples:[[performance.now(),e.clientX]],on:false};R[k].target=null;R[k].v=0;});
  cx.addEventListener('pointermove',function(e){var d=C.drag;if(!d||d.id!==e.pointerId)return;var dx=e.clientX-d.x0,dy=e.clientY-d.y0;
    if(!d.on){if(Math.abs(dx)>8&&Math.abs(dx)>Math.abs(dy)){d.on=true;try{cx.setPointerCapture(e.pointerId);}catch(_){}cx.classList.add('held');snd('slide',.3,function(){api.sfx.puff(.02,.3);});}else if(Math.abs(dy)>10){C.drag=null;return;}else return;}
    e.preventDefault();R[d.k].off=d.off0-dx/C.W;var now=performance.now();d.samples.push([now,e.clientX]);while(d.samples.length>2&&now-d.samples[0][0]>90)d.samples.shift();});
  function cUp(e){var d=C.drag;if(!d||(e&&d.id!==e.pointerId))return;C.drag=null;cx.classList.remove('held');if(!d.on){return;}var a=d.samples[0],b=d.samples[d.samples.length-1],t=Math.max((b[0]-a[0])/1000,.016);
    R[d.k].v=clamp(-(b[1]-a[1])/t/C.W,-14,14);if(Math.abs(R[d.k].v)<.9)R[d.k].target=Math.round(R[d.k].off);}
  cx.addEventListener('pointerup',cUp);cx.addEventListener('pointercancel',cUp);
  caption();

  // ================================================================= loop
  function tick(now){if(dead)return;raf=requestAnimationFrame(tick);if(!host.isConnected){dispose();return;}
    var dt=last?Math.min((now-last)/1000,.05):0;last=now;var key=touchUI()+'';if(key!==tick.k){tick.k=key;hints();}
    if(active==='r'||B.mode==='fly')stepReady(dt,now);
    if(active==='h'){stepHat(dt);drawHat();}
    if(active==='c'){stepCorpse(dt);drawCorpse();}}
  raf=requestAnimationFrame(tick);hints();
  function onResize(){drawSpot.k='';}addEventListener('resize',onResize);
  function dispose(){if(dead)return;dead=true;cancelAnimationFrame(raf);cancelAnimationFrame(shakeT);disarm();try{if(cur)cur.restore();}catch(e){}
    [hl,gap,ghost].forEach(function(n){if(n&&n.parentNode)n.parentNode.removeChild(n);});removeEventListener('resize',onResize);}
  host._dispose=dispose;
  if(EH.debug)EH.debug.readymade={B:B,H:H,R:R,C:C,tab:setTab,arm:arm,pick:function(sel){var el=document.querySelector(sel);if(!el)return false;var r=el.getBoundingClientRect();
      var c=candidate(r.left+r.width/2,r.top+r.height/2,el,false);if(c)pick(c);return !!c;},pickAt:function(x,y){var el=document.elementFromPoint(x,y),c=candidate(x,y,el,false);if(c)pick(c);return c&&c.title;},
    push:push,pour:pour,unfold:function(){unfoldBtn.click();},cur:function(){return cur&&{title:cur.title,mat:cur.mat,S:cur.S};},name:function(n){artist=n;saveName(n);paintSig();writeCard();}};
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
/* Special exhibit "synesthesia" (现代先锋 · 联觉琴键).
   Kandinsky's Composition VII played as an instrument. Every colour form of the hung painting sounds the timbre Kandinsky gave its colour in
   "Über das Geistige in der Kunst" (1911): yellow = a shrill trumpet, light warm red = trumpet with tuba, cool light red = the singing violin,
   deep red = the middle tones of a cello, orange = the Angelus bell, violet = English horn, light blue = flute, blue = cello, deepest blue = organ,
   green = the calm middle violin, white = a great silence, black = the final silence, grey = soundless.
   Physical play: press a form and it rings (and swells up); pull it and it stretches like a string — the pitch rises with the tension; let go and it
   snaps back and wobbles, and the wobble IS the vibrato (pitch and loudness follow the form's own spring). Drag across the painting from an empty
   spot and you strum every form you cross. Keys A–L play nine colours (Space/arrows/Esc stay with the core).
   The "侧过来" knob (in the panel, and a grip on the corner of the hung work): grab and turn — the painting turns on its side, its drawing (the
   last traces of objects) dissolves, the colours start to glow and the whole painting begins to sound as a chord that grows with the angle.
   Data: rooms/avantgarde/s_forms.json + s_atlas.webp (form cut-outs and inpainted plates) + s_soft.webp, made by _wip/s-synesthesia/prep.py
   from the cut (rooms/avantgarde/cut/). Text from room.special.* with fallbacks. Audio: WebAudio through the core's master (the 声音 toggle). */
(function(){
'use strict';
if(!window.EH||!EH.special)return;
var D2R=Math.PI/180;
function clamp(x,a,b){return x<a?a:x>b?b:x;}
function sm(t){t=clamp(t,0,1);return t*t*(3-2*t);}
function nb(t){return String(t==null?'':t).replace(/([㐀-鿿）》”]) (?=[0-9A-Za-z])/g,'$1 ').replace(/([0-9A-Za-z.%°]) (?=[㐀-鿿（《“])/g,'$1 ');}
function ok(i){return !!(i&&i.complete&&i.naturalWidth>0);}
function xhrJSON(url,cb){try{var x=new XMLHttpRequest();x.open('GET',url+'?t='+Date.now(),true);x.overrideMimeType('application/json');
  x.onload=function(){if(x.status===200||(x.status===0&&x.responseText)){try{cb(JSON.parse(x.responseText));}catch(e){cb(null);}}else cb(null);};
  x.onerror=function(){cb(null);};x.send();}catch(e){cb(null);}}

// ---------------------------------------------------------------- Kandinsky's colour → instrument pairs (defaults; room.special.pairs overrides)
// lo/hi: MIDI range of the instrument voice; every note is taken from Scriabin's "mystic chord" (C F♯ B♭ E A D), so any mix of forms sounds together
var FAM={
  yellow:   {zh:'黄',   ins:'小号',         v:'trumpet', lo:67,hi:81,hex:'#e2c23a',say:'黄色像吹得很响的小号，尖锐、向外冲。'},
  red:      {zh:'暖红', ins:'小号加大号',   v:'fanfare', lo:58,hi:70,hex:'#c8321f',say:'明亮的暖红像号角齐鸣，里面混着大号，强劲、有力。'},
  pink:     {zh:'冷红', ins:'小提琴',       v:'violinHi',lo:74,hi:88,hex:'#d7728a',say:'明亮的冷红像小提琴在高处歌唱。'},
  crimson:  {zh:'深红', ins:'大提琴中音',   v:'celloMid',lo:52,hi:62,hex:'#8d1a2c',say:'加深的红色像大提琴忧伤的中音。'},
  orange:   {zh:'橙',   ins:'晚祷的钟',     v:'bell',    lo:57,hi:69,hex:'#e08a2a',say:'橙色像晚祷的钟声，也像一把老提琴。'},
  violet:   {zh:'紫',   ins:'英国管',       v:'cor',     lo:55,hi:67,hex:'#6b4f8f',say:'紫色是冷却了的红，像英国管或巴松管。'},
  lightblue:{zh:'浅蓝', ins:'长笛',         v:'flute',   lo:74,hi:88,hex:'#8fb6da',say:'浅蓝像长笛。'},
  blue:     {zh:'蓝',   ins:'大提琴',       v:'cello',   lo:45,hi:57,hex:'#2f4fb0',say:'蓝色越深越像大提琴。'},
  deepblue: {zh:'深蓝', ins:'管风琴',       v:'organ',   lo:40,hi:50,hex:'#1d2470',say:'更深的蓝像低音提琴，最深处像管风琴。'},
  green:    {zh:'绿',   ins:'小提琴中音',   v:'violin',  lo:62,hi:74,hex:'#5f9a3a',say:'绿色像小提琴平静、舒展的中音。'},
  white:    {zh:'白',   ins:'静默',         v:'silence', lo:0,hi:0,  hex:'#ece8da',say:'白色像一段巨大的静默，却充满可能，像乐曲中的休止。'},
  black:    {zh:'黑',   ins:'最后的静默',   v:'stop',    lo:0,hi:0,  hex:'#1a1818',say:'黑色像永恒的静默，像乐曲最后的终止。'},
  grey:     {zh:'灰',   ins:'无声',         v:'mute',    lo:0,hi:0,  hex:'#8a8580',say:'灰色没有声音，也不动。'}
};
var KEYORDER=['yellow','red','orange','violet','green','lightblue','blue','deepblue','white'];
var KEYCODES=['KeyA','KeyS','KeyD','KeyF','KeyG','KeyH','KeyJ','KeyK','KeyL'];
var MYSTIC=[0,6,10,4,9,2];
function mtof(m){return 440*Math.pow(2,(m-69)/12);}
function chordNote(lo,hi,t){var best=lo,bd=1e9,want=lo+(hi-lo)*clamp(t,0,1);for(var m=lo;m<=hi;m++){if(MYSTIC.indexOf(((m%12)+12)%12)<0)continue;var d=Math.abs(m-want);if(d<bd){bd=d;best=m;}}return best;}

function css(){if(document.getElementById('s-syn-css'))return;var s=document.createElement('style');s.id='s-syn-css';s.textContent=
  '.syn{margin-top:16px}'+
  '.syn .syn-stage{display:none;width:100%;height:auto;aspect-ratio:3/2;touch-action:pan-y;cursor:pointer;background:#191715;margin:0 0 12px;box-shadow:0 18px 40px -22px rgba(0,0,0,.7)}'+
  '.syn.narrow .syn-stage{display:block}'+
  '.syn-hint{margin:0 0 10px!important;font-size:13.5px!important;line-height:1.75!important;color:var(--ink-2)}'+
  '.syn-now{margin:0 0 12px!important;min-height:3.6em;font-size:14.5px!important;line-height:1.8!important}'+
  '.syn-now b{font-weight:500}.syn-now i{font-style:normal;display:inline-block;width:.8em;height:.8em;margin-right:8px;vertical-align:-.05em;border-radius:50%;box-shadow:0 0 0 1px rgba(255,255,255,.25)}'+
  '.syn-now span{color:var(--ink-2)}'+
  '.syn-keys{display:grid;grid-template-columns:repeat(9,minmax(0,1fr));gap:6px;margin:0 0 16px}'+
  '.syn-key{position:relative;min-height:88px;min-width:0;padding:0 0 8px;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:3px;'+
    'border:1px solid var(--ink-3);border-radius:2px;background:transparent;color:inherit;font:400 12.5px/1.25 var(--song);cursor:pointer;touch-action:none;'+
    'user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;transition:transform .08s ease,border-color .15s}'+
  '.syn-key .sw{position:absolute;left:5px;right:5px;top:5px;height:34px;border-radius:1px;transition:filter .15s,box-shadow .15s}'+
  '.syn-key .k{font:400 12.5px/1 var(--didone,serif);color:var(--ink-3)}'+
  '.syn-key .n{white-space:nowrap}'+
  '.syn-key[aria-pressed="true"]{transform:translateY(2px);border-color:currentColor;font-weight:500}'+
  '.syn-key[aria-pressed="true"] .sw{filter:brightness(1.25) saturate(1.2);box-shadow:0 0 14px 2px var(--glow,rgba(255,255,255,.3))}'+
  '.syn-key:focus-visible{outline:1px solid currentColor;outline-offset:3px}'+
  '@media (hover:none){.syn-key .k{display:none}}'+
  '@media (max-width:560px){.syn-keys{grid-template-columns:repeat(5,minmax(0,1fr))}.syn-key{min-height:76px}}'+
  '.syn-turn{display:flex;align-items:center;gap:20px;margin:4px 0 6px}'+
  '.syn-knob{flex:0 0 auto;width:104px;height:104px;padding:0;border:0;background:transparent;color:inherit;cursor:grab;touch-action:none;border-radius:50%;-webkit-tap-highlight-color:transparent}'+
  '.syn-knob.drag{cursor:grabbing}.syn-knob:focus-visible{outline:1px solid currentColor;outline-offset:3px}'+
  '.syn-knob svg{display:block;overflow:visible}'+
  '.syn-turn p{margin:0!important;font-size:14px!important;line-height:1.8!important}'+
  '.syn-turn .deg{font-variant-numeric:tabular-nums;color:var(--ink-2)}'+
  '.syn-ov{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:1}'+
  '.syn-grip{position:fixed;left:0;top:0;z-index:8;width:44px;height:44px;margin:-22px 0 0 -22px;padding:0;border:0;border-radius:50%;background:transparent;cursor:grab;touch-action:none;display:none;-webkit-tap-highlight-color:transparent}'+
  '.syn-grip.on{display:block}.syn-grip.drag{cursor:grabbing}'+
  '.syn-grip::before{content:"";position:absolute;left:6px;top:6px;width:32px;height:32px;border-radius:50%;background:rgba(20,18,16,.78);box-shadow:0 0 0 1px rgba(239,230,214,.4)}'+
  '.syn-grip svg{position:absolute;left:12px;top:12px}'+
  '.syn-grip:hover::before,.syn-grip.drag::before{background:rgba(20,18,16,.92);box-shadow:0 0 0 1.5px rgba(239,230,214,.85)}'+
  '.syn-grip:focus-visible{outline:2px solid #efe6d6;outline-offset:2px}';
  document.head.appendChild(s);}

// ================================================================ the synthesiser
function Synth(api){
  var A=null,out=null,dry=null,wet=null,verb=null,loud=null,link=null,waves={},noise=null;
  function ready(){
    if(A)return api.sfx.on();
    if(!api.sfx.on()||!api.sfx.env)return false;
    // borrow the core's context and master: env() connects the node we hand it to the master through a new gain
    var cap=null;try{api.sfx.env({connect:function(g){cap=g;}},api.sfx.now(),.02,1,36000);}catch(e){cap=null;}
    if(!cap||!cap.context)return false;
    link=cap;A=cap.context;
    out=A.createGain();out.gain.value=.9;
    var comp=A.createDynamicsCompressor();comp.threshold.value=-16;comp.knee.value=12;comp.ratio.value=4;comp.attack.value=.004;comp.release.value=.25;
    loud=A.createGain();loud.gain.value=1;
    dry=A.createGain();wet=A.createGain();wet.gain.value=.28;
    verb=A.createConvolver();verb.buffer=impulse(3.2);
    dry.connect(loud);wet.connect(verb);verb.connect(loud);loud.connect(comp);comp.connect(out);out.connect(link);
    // spectra
    waves.flute=pw([0,1,.32,.1,.045,.02]);
    waves.reed=pw([0,1,.9,.75,.62,.5,.36,.3,.22,.17,.12,.09,.06]);
    waves.brass=pw([0,1,.95,.85,.72,.6,.5,.42,.34,.27,.21,.17,.13,.1,.08]);
    noise=A.createBuffer(1,A.sampleRate*2,A.sampleRate);var d=noise.getChannelData(0);for(var i=0;i<d.length;i++)d[i]=Math.random()*2-1;
    return api.sfx.on();}
  function pw(h){var re=new Float32Array(h.length),im=new Float32Array(h.length);for(var i=1;i<h.length;i++)im[i]=h[i];return A.createPeriodicWave(re,im);}
  function impulse(sec){var n=Math.floor(A.sampleRate*sec),b=A.createBuffer(2,n,A.sampleRate);for(var c=0;c<2;c++){var d=b.getChannelData(c),lp=0;
    for(var i=0;i<n;i++){var t=i/n,w=Math.random()*2-1;lp+=(.35-.3*t)*(w-lp);d[i]=lp*Math.pow(1-t,2.6)*(i<A.sampleRate*.012?i/(A.sampleRate*.012):1);}}return b;}
  function osc(type,f,det){var o=A.createOscillator();if(typeof type==='string')o.type=type;else o.setPeriodicWave(type);o.frequency.value=f;if(det)o.detune.value=det;return o;}
  function noiseSrc(){var s=A.createBufferSource();s.buffer=noise;s.loop=true;s.loopStart=Math.random();return s;}
  function filt(type,f,q,g){var b=A.createBiquadFilter();b.type=type;b.frequency.value=f;if(q!=null)b.Q.value=q;if(g!=null)b.gain.value=g;return b;}
  function chain(){var a=arguments;for(var i=0;i<a.length-1;i++)a[i].connect(a[i+1]);return a[a.length-1];}

  // a voice: sources → colour filter → amp → pan → dry/wet. bend(semitones) and trem(0..1) are driven every frame by the form's spring
  function voice(kind,midi,o){
    if(!ready())return null;o=o||{};
    var t=A.currentTime,f=mtof(midi),vel=o.vel==null?.8:o.vel,oscs=[],srcs=[],amp=A.createGain(),pan=A.createStereoPanner?A.createStereoPanner():A.createGain(),V;
    amp.gain.value=0;if(pan.pan)pan.pan.value=clamp(o.pan||0,-.8,.8);
    var send=A.createGain();send.gain.value=o.wet==null?1:o.wet;
    amp.connect(pan);pan.connect(dry);pan.connect(send);send.connect(wet);
    var lvl=1,att=.05,rel=.4,sus=true,vib={r:5.2,d:0,delay:.3},bright=null;
    var lfo=A.createOscillator(),lfoG=A.createGain();lfo.frequency.value=vib.r;lfoG.gain.value=0;lfo.connect(lfoG);
    function addOsc(type,mul,det,gain,dest){var ob=osc(type,f*mul,det),g=A.createGain();g.gain.value=gain;ob.connect(g);g.connect(dest);lfoG.connect(ob.detune);oscs.push({o:ob,mul:mul});srcs.push(ob);return ob;}
    if(kind==='trumpet'||kind==='fanfare'){
      var lp=filt('lowpass',f*2,1.2),sh=A.createWaveShaper(),cur=new Float32Array(1024);for(var i=0;i<1024;i++){var x=i/511.5-1;cur[i]=Math.tanh(x*1.8);}sh.curve=cur;
      addOsc(waves.brass,1,-3,.5,lp);addOsc(waves.brass,1,4,.5,lp);chain(lp,sh,filt('peaking',1300,1.1,4),filt('lowpass',Math.min(9000,f*9),.5),amp);
      var peak=Math.min(8000,f*(4+6*vel)),hold=Math.min(6000,f*(3+3*vel));lp.frequency.setValueAtTime(f*1.2,t);lp.frequency.exponentialRampToValueAtTime(peak,t+.05);lp.frequency.exponentialRampToValueAtTime(hold,t+.35);
      bright=lp;oscs.forEach(function(q){q.o.detune.setValueAtTime(-45,t);q.o.detune.linearRampToValueAtTime(0,t+.06);});
      att=.035;rel=.18;lvl=.55;vib={r:5.4,d:9,delay:.35};
      if(kind==='fanfare'){var tl=filt('lowpass',f*2.2,.7);addOsc(waves.brass,.5,0,.8,tl);tl.connect(amp);lvl=.6;}}
    else if(kind==='violin'||kind==='violinHi'||kind==='cello'||kind==='celloMid'){
      var low=kind==='cello'||kind==='celloMid',body=filt('lowpass',low?3200:6500,.5),bp=noiseSrc(),bg=A.createGain();
      addOsc('sawtooth',1,-4,.4,body);addOsc('sawtooth',1,5,.4,body);addOsc('sawtooth',1,0,.25,body);
      var r1=filt('peaking',low?220:290,2,low?6:5),r2=filt('peaking',low?560:520,2.5,4),r3=filt('peaking',low?1500:3000,1.5,low?2:5),hp=filt('highpass',low?60:180,.7);
      chain(body,hp,r1,r2,r3,amp);bg.gain.value=low?.012:.016;chain(bp,filt('bandpass',low?1400:3200,1.4),filt('lowpass',low?2500:5000,.5),bg,amp);srcs.push(bp);
      att=low?.16:.12;rel=low?.55:.42;lvl=low?.5:.42;vib={r:low?5.2:6,d:low?13:16,delay:.28};bright=body;}
    else if(kind==='flute'){
      addOsc(waves.flute,1,0,.7,amp);var br=noiseSrc(),bf=filt('bandpass',f,6),bgn=A.createGain();bgn.gain.value=.08;chain(br,bf,bgn,amp);srcs.push(br);
      var ch=noiseSrc(),cg=A.createGain();cg.gain.setValueAtTime(.0001,t);cg.gain.exponentialRampToValueAtTime(.16,t+.012);cg.gain.exponentialRampToValueAtTime(.0001,t+.09);chain(ch,filt('bandpass',f*3,2),cg,amp);srcs.push(ch);
      att=.09;rel=.3;lvl=.5;vib={r:5,d:12,delay:.3};}
    else if(kind==='cor'){
      var fm=filt('peaking',1050,2.2,9),lp2=filt('lowpass',3400,.8);addOsc(waves.reed,1,-2,.5,fm);addOsc(waves.reed,1,3,.4,fm);chain(fm,lp2,filt('highpass',160,.7),amp);
      att=.07;rel=.3;lvl=.5;vib={r:4.8,d:7,delay:.4};bright=lp2;}
    else if(kind==='organ'){
      var ol=filt('lowpass',2600,.6);[[1,.45],[2,.3],[3,.14],[4,.16],[6,.06],[8,.05]].forEach(function(p){addOsc('sine',p[0],(Math.random()-.5)*4,p[1],ol);});ol.connect(amp);
      att=.22;rel=.9;lvl=.46;vib={r:6.2,d:0,delay:0};}
    else if(kind==='bell'){
      sus=false;var bl=A.createGain();bl.connect(amp);
      [[.5,.5,7],[1,.55,5],[1.2,.35,3.2],[1.5,.22,2.6],[2,.28,2.2],[2.52,.14,1.5],[3.01,.1,1.1],[4.1,.06,.8]].forEach(function(p){
        var ob=osc('sine',f*p[0],0),g=A.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(p[1],t+.006);g.gain.exponentialRampToValueAtTime(.0001,t+p[2]*(.6+.6*vel));
        ob.connect(g);g.connect(bl);lfoG.connect(ob.detune);oscs.push({o:ob,mul:p[0]});srcs.push(ob);});
      var st=noiseSrc(),sg=A.createGain();sg.gain.setValueAtTime(.0001,t);sg.gain.exponentialRampToValueAtTime(.12,t+.003);sg.gain.exponentialRampToValueAtTime(.0001,t+.05);chain(st,filt('bandpass',f*4,3),sg,amp);srcs.push(st);
      att=.004;rel=1.2;lvl=.6;vib={r:3,d:0,delay:0};}
    else return null;
    var base=lvl*vel*(o.gain==null?1:o.gain);
    amp.gain.setValueAtTime(0,t);amp.gain.linearRampToValueAtTime(base,t+att);
    if(!sus)amp.gain.setTargetAtTime(base*.9,t+att,2);
    lfoG.gain.setValueAtTime(0,t);if(vib.d)lfoG.gain.setTargetAtTime(vib.d,t+vib.delay,.25);
    srcs.forEach(function(s){s.start(t);});lfo.start(t);
    var dead=false,endT=0,life=sus?0:t+9;
    V={kind:kind,midi:midi,base:base,sus:sus,bend:0,trem:0,
      set:function(bend,trem,gainMul){if(dead)return;var tt=A.currentTime;
        if(Math.abs(bend-V.bend)>.003){V.bend=bend;oscs.forEach(function(q){q.o.frequency.setTargetAtTime(f*q.mul*Math.pow(2,bend/12),tt,.012);});}
        var g=base*(gainMul==null?1:gainMul)*(1+clamp(trem,-.6,.6));if(!V.releasing)amp.gain.setTargetAtTime(Math.max(0,g),tt,.02);},
      release:function(r){if(dead||V.releasing)return;V.releasing=true;var tt=A.currentTime,rr=r==null?rel:r;amp.gain.cancelScheduledValues(tt);amp.gain.setValueAtTime(amp.gain.value,tt);
        amp.gain.setTargetAtTime(0,tt,rr/3.5);endT=tt+rr*2+.1;srcs.forEach(function(s){try{s.stop(endT);}catch(e){}});try{lfo.stop(endT);}catch(e){}
        setTimeout(function(){dead=true;try{pan.disconnect();send.disconnect();}catch(e){}},(rr*2+.3)*1000);},
      alive:function(){return !dead&&(!life||A.currentTime<life);},
      level:function(){return dead?0:amp.gain.value/(base||1);}};
    if(!sus)setTimeout(function(){V.release(.3);},8500);
    return V;}
  // the silences: white = a great pause (everything we play falls quiet, the music steps back), black = the final stop
  function hush(hard){if(!A)return;var t=A.currentTime;loud.gain.cancelScheduledValues(t);loud.gain.setValueAtTime(loud.gain.value,t);loud.gain.linearRampToValueAtTime(0,t+(hard?.06:.5));
    loud.gain.setValueAtTime(0,t+(hard?1.6:1.1));loud.gain.linearRampToValueAtTime(1,t+(hard?1.9:1.5));if(api.sfx.duck)api.sfx.duck(hard?1:.85,hard?2.2:1.8);}
  function thud(v){if(!ready())return;var t=A.currentTime,s=noiseSrc(),g=A.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v||.25,t+.004);g.gain.exponentialRampToValueAtTime(.0001,t+.12);
    chain(s,filt('lowpass',380,.8),g,dry);s.start(t);s.stop(t+.2);}
  function click(v,f){if(!ready())return;var t=A.currentTime,s=noiseSrc(),g=A.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v||.12,t+.002);g.gain.exponentialRampToValueAtTime(.0001,t+.035);
    chain(s,filt('bandpass',f||2200,4),g,dry);s.start(t);s.stop(t+.06);}
  function setLoud(k){if(A&&!hush.t)out.gain.setTargetAtTime(.9*(1+.9*k),A.currentTime,.1);}
  function kill(){if(!A)return;try{var t=A.currentTime;out.gain.cancelScheduledValues(t);out.gain.setValueAtTime(out.gain.value,t);out.gain.linearRampToValueAtTime(0,t+.3);
    setTimeout(function(){try{out.disconnect();link.disconnect();}catch(e){}},500);}catch(e){}}
  return{ready:ready,voice:voice,hush:hush,thud:thud,click:click,setLoud:setLoud,kill:kill};}

// ================================================================ the exhibit
EH.special('synesthesia',function(host,room,api){
  css();
  var sp=room.special||{},art=room.art||{};
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mqT=window.matchMedia?matchMedia('(hover: none)'):null;function touchUI(){return !!(mqT&&mqT.matches);}
  // text: room.special.pairs may be an array [{fam|key|color, zh, ins|instrument, say|text|quote}] or an object keyed by family
  var P=JSON.parse(JSON.stringify(FAM));
  (function(){var pr=sp.pairs||sp.colors||sp.colours||sp.instruments;if(!pr)return;var arr=Array.isArray(pr)?pr:Object.keys(pr).map(function(k){var v=pr[k];return typeof v==='string'?{fam:k,say:v}:Object.assign({fam:k},v);});
    arr.forEach(function(e){var k=e.fam||e.key||e.id||e.family;if(!k||!P[k]){var nm=e.zh||e.color||e.colour||'';Object.keys(P).forEach(function(q){if(!k&&nm&&P[q].zh===nm)k=q;});}if(!k||!P[k])return;
      var d=P[k];if(e.zh||e.color||e.colour)d.zh=e.zh||e.color||e.colour;if(e.ins||e.instrument)d.ins=e.ins||e.instrument;var s=e.say||e.text||e.quote||e.d;if(s)d.say=s;});})();
  var HO=sp.hint&&typeof sp.hint==='object'?sp.hint:null;
  var T={
    hintWall:sp.hintWall||(HO&&HO.mouse)||'点一下墙上画里的色块，它就发出康定斯基给这种颜色的声音。按住往外拉，音会随拉紧升高；松手，色块弹回去，声音跟着颤动。从空白处起笔划过画面，会依次拨响经过的色块。也可以按键盘 A–L。',
    hint:(typeof sp.hint==='string'&&sp.hint)||(HO&&HO.mouse)||'点一下画里的色块，它就发出康定斯基给这种颜色的声音。按住往外拉，音会随拉紧升高；松手，色块弹回去，声音跟着颤动。也可以按键盘 A–L。',
    hintTouch:sp.hintTouch||(HO&&HO.touch)||'点画里的色块，或按住下面的琴键。按住色块横向拉，音会随拉紧升高；松手，它弹回去，声音跟着颤动。',
    knob:sp.knobLabel||sp.knob||'侧过来',
    turn:sp.turnText||sp.sideways||'抓住旋钮转动（墙上作品的右下角也有一个把手）：画侧过去，物体的痕迹消散，颜色亮起来，整幅画开始一起发声。',
    turnTouch:sp.turnTextTouch||'按住旋钮转动：画侧过去，物体的痕迹消散，颜色亮起来，整幅画开始一起发声。',
    side:sp.sideNote||'侧过来之后：他在黄昏的画室里，正是这样认出了一幅“浸透着内在光芒”的画——那是他自己的一幅画，只是侧放着。',
    silence:sp.silence||''
  };
  if(sp.quoteSide)T.side=sp.quoteSide;

  // ---------- DOM
  var wrap=document.createElement('div');wrap.className='syn';
  wrap.innerHTML='<canvas class="syn-stage" role="img" aria-label="《构图第七号》：点或拖动色块来演奏"></canvas>'+
    '<p class="syn-hint"></p>'+
    '<p class="syn-now" aria-live="polite"></p>'+
    '<div class="syn-keys" role="group" aria-label="颜色琴键"></div>'+
    '<div class="syn-turn"><button type="button" class="syn-knob" role="slider" aria-valuemin="0" aria-valuemax="90" aria-valuenow="0">'+
      '<svg width="104" height="104" viewBox="-52 -52 104 104" aria-hidden="true"><circle r="47" fill="none" stroke="currentColor" stroke-opacity=".35" stroke-width="1"/>'+
      '<path class="arc" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>'+
      '<g class="ticks" stroke="currentColor" stroke-width="1.2"></g>'+
      '<g class="rot"><circle r="33" fill="rgba(0,0,0,.18)" stroke="currentColor" stroke-width="1.2"/><g class="ridges" stroke="currentColor" stroke-opacity=".45" stroke-width="1"></g><line x1="0" y1="-12" x2="0" y2="-29" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></g></svg></button>'+
      '<p><b class="kl"></b>　<span class="deg">0°</span><br><span class="tt"></span></p></div>'+
    '<p class="small syn-side" hidden></p>';
  host.appendChild(wrap);
  var stage=wrap.querySelector('.syn-stage'),sg=stage.getContext('2d');
  var hintEl=wrap.querySelector('.syn-hint'),nowEl=wrap.querySelector('.syn-now'),keysEl=wrap.querySelector('.syn-keys'),knob=wrap.querySelector('.syn-knob');
  var knobRot=knob.querySelector('.rot'),knobArc=knob.querySelector('.arc'),degEl=wrap.querySelector('.deg'),sideEl=wrap.querySelector('.syn-side');
  wrap.querySelector('.kl').textContent=T.knob;knob.setAttribute('aria-label',T.knob+'：转动画面');
  (function(){var g=knob.querySelector('.ticks'),r=knob.querySelector('.ridges'),h='';[0,15,30,45,60,75,90].forEach(function(a){var s=Math.sin(a*D2R),c=-Math.cos(a*D2R),l=a%45===0?6:3;h+='<line x1="'+(s*40).toFixed(1)+'" y1="'+(c*40).toFixed(1)+'" x2="'+(s*(40+l)).toFixed(1)+'" y2="'+(c*(40+l)).toFixed(1)+'"/>';});g.innerHTML=h;
    h='';for(var i=0;i<24;i++){var a=i*15*D2R;h+='<line x1="'+(Math.sin(a)*30).toFixed(1)+'" y1="'+(-Math.cos(a)*30).toFixed(1)+'" x2="'+(Math.sin(a)*33).toFixed(1)+'" y2="'+(-Math.cos(a)*33).toFixed(1)+'"/>';}r.innerHTML=h;})();

  var syn=Synth(api);

  // ---------- data
  var G={W:art.w||2400,H:art.h||1594,forms:[]},atlas=null,soft=null,hung=api.img(art.img||'main.webp');
  var dirty=true,dead=false;
  function imgLoaded(im){if(im&&!ok(im))im.addEventListener('load',function(){dirty=true;},{once:true});return im;}
  imgLoaded(hung);
  function useForms(j){if(!j||!j.forms||!j.forms.length)return false;G.W=j.W||G.W;G.H=j.H||G.H;
    atlas=imgLoaded(api.img(j.atlas||'s_atlas.webp'));soft=imgLoaded(api.img(j.soft||'s_soft.webp'));
    var areas=j.forms.map(function(f){return f.area;}).sort(function(a,b){return a-b;}),med=areas[Math.floor(areas.length/2)]||1;
    G.forms=j.forms.filter(function(f){return FAM[f.fam];}).map(function(f,i){var d=FAM[f.fam],b=f.box,
        t=clamp(1-f.c[1]/G.H-.18*Math.log(f.area/med)/Math.LN2*.5+.12*((i*7)%5-2)/2,0,1),
        midi=d.lo?chordNote(d.lo,d.hi,t):0,size=Math.sqrt(f.area);
      return{id:f.id,name:f.name,fam:f.fam,C:f.C||30,hex:f.hex||d.hex,box:b,c:f.c,area:f.area,poly:f.poly||[],cut:f.cut,plate:f.plate,midi:midi,size:size,
        ox:0,oy:0,vx:0,vy:0,s:0,vs:0,glow:0,hover:0,held:null,voice:null,lastPluck:0};});
    G.forms.sort(function(a,b){return a.area-b.area;});        // small forms first: they win the hit test
    buildKeys();dirty=true;return true;}
  var pollT=0,tries=0;
  function poll(){if(dead||++tries>30)return;xhrJSON(api.path('s_forms.json'),function(j){if(dead)return;if(!useForms(j))pollT=setTimeout(poll,tries<4?1500:8000);});}
  poll();

  // ---------- keys: one per colour (the biggest form of that colour)
  var KEYS=[];
  function buildKeys(){keysEl.innerHTML='';KEYS=[];
    KEYORDER.forEach(function(fam,i){var fs=G.forms.filter(function(f){return f.fam===fam;});var form=fs.sort(function(a,b){return b.area*Math.pow(b.C,1.5)-a.area*Math.pow(a.C,1.5);})[0]||null,d=P[fam];
      var b=document.createElement('button');b.type='button';b.className='syn-key';b.setAttribute('aria-pressed','false');
      var hx=form?form.hex:FAM[fam].hex;b.style.setProperty('--glow',hx);
      b.innerHTML='<span class="sw" style="background:'+hx+'"></span><span class="n"></span><span class="k"></span>';
      b.querySelector('.n').textContent=d.zh;b.querySelector('.k').textContent=KEYCODES[i].slice(3);
      b.setAttribute('aria-label',d.zh+'：'+d.ins+(touchUI()?'':'（键 '+KEYCODES[i].slice(3)+'）'));
      var k={fam:fam,form:form,el:b,code:KEYCODES[i]};KEYS.push(k);keysEl.appendChild(b);
      b.addEventListener('pointerdown',function(e){if(e.button!=null&&e.button!==0&&e.pointerType==='mouse')return;e.preventDefault();try{b.setPointerCapture(e.pointerId);}catch(_){}
        b._p={id:e.pointerId,x:e.clientX};keyDown(k,e.pointerId);});
      b.addEventListener('pointermove',function(e){if(!b._p||b._p.id!==e.pointerId)return;var f=k.form;if(f&&f.held&&f.held.id==='k'+e.pointerId){f.held.dx=(e.clientX-b._p.x)*2.2;f.held.dy=0;}});
      function up(e){if(!b._p||(e&&b._p.id!==e.pointerId))return;var id=b._p.id;b._p=null;keyUp(k,'k'+id);}
      b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);b.addEventListener('lostpointercapture',up);
      b.addEventListener('contextmenu',function(e){e.preventDefault();});
      b.addEventListener('keydown',function(e){if((e.key==='Enter'||e.key===' ')&&!e.repeat){e.preventDefault();e.stopPropagation();keyDown(k,'kb');}});
      b.addEventListener('keyup',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();keyUp(k,'kkb');}});
      b.addEventListener('click',function(e){e.preventDefault();});});}
  function keyDown(k,id){k.el.setAttribute('aria-pressed','true');var f=k.form||{fam:k.fam,midi:FAM[k.fam].lo?chordNote(FAM[k.fam].lo,FAM[k.fam].hi,.5):0,c:[G.W/2,G.H/2],size:200,ox:0,oy:0,vx:0,vy:0,s:0,vs:0,glow:0,hover:0,ghost:true};
    if(!k.form)k.ghost=f;press(f,'k'+id,.8);}
  function keyUp(k,id){k.el.setAttribute('aria-pressed','false');var f=k.form||k.ghost;if(f)letGo(f,id);}
  function onKey(e){if(e.ctrlKey||e.metaKey||e.altKey)return;var tg=e.target;if(tg&&(tg.tagName==='INPUT'||tg.tagName==='TEXTAREA'||tg.isContentEditable))return;
    var i=KEYCODES.indexOf(e.code);if(i<0||!KEYS[i])return;e.preventDefault();if(e.type==='keydown'){if(!e.repeat)keyDown(KEYS[i],'key'+i);}else keyUp(KEYS[i],'kkey'+i);}
  addEventListener('keydown',onKey);addEventListener('keyup',onKey);

  // ---------- sound per form, coupled to its spring
  function tell(f){var d=P[f.fam];if(!d)return;var hx=f.hex||FAM[f.fam].hex;
    nowEl.innerHTML='<i style="background:'+hx+'"></i><b></b><br><span></span>';nowEl.querySelector('b').textContent=nb(d.zh+' · '+d.ins);nowEl.querySelector('span').textContent=nb(d.say);}
  var flash={white:0,black:0};
  var soundNote=sp.soundOff||'（声音现在是关着的：打开页面底部的“声音”，才能听见。）';
  function press(f,id,vel){var now=performance.now();f.glow=1;
    // a strike: the form swells, then rings on its spring
    f.vs+=reduce?.25:.9*vel;
    if(id!=null)f.held={id:id,dx:0,dy:0};
    tell(f);var d=FAM[f.fam];
    if(!syn.ready()&&d.lo){var sn=document.createElement('span');sn.textContent=nb(soundNote);nowEl.appendChild(document.createElement('br'));nowEl.appendChild(sn);}
    if(d.v==='silence'){syn.hush(false);flash.white=1;stopAll(f,.5);return;}
    if(d.v==='stop'){syn.hush(true);flash.black=1;stopAll(f,.06);return;}
    if(d.v==='mute'){syn.thud(.18);return;}
    if(f.voice&&f.voice.alive()&&!f.voice.releasing&&now-f.lastPluck<60)return;
    if(f.voice)f.voice.release(f.voice.sus?.25:.8);
    f.lastPluck=now;
    f.voice=syn.voice(d.v,f.midi,{vel:vel*(.75+.35*side.k),pan:(f.c[0]/G.W-.5)*1.3,wet:.8+.8*side.k});}
  function letGo(f,id){if(!f.held||(id!=null&&f.held.id!==id))return;
    f.held=null;
    // plucked strings/brass sustain only while held; a free-swinging form keeps its voice for the wobble, then lets go
    if(f.voice&&f.voice.sus){var v=f.voice,amp=Math.hypot(f.ox,f.oy)/Math.max(40,f.size*.35);setTimeout(function(){v.release();},amp>.25?420:140);}}
  function stopAll(except,r){G.forms.forEach(function(f){if(f!==except&&f.voice){f.voice.release(r);f.voice=null;}});KEYS.forEach(function(k){if(k.ghost&&k.ghost.voice){k.ghost.voice.release(r);k.ghost.voice=null;}});}

  // ---------- the side knob: angle θ ∈ [0, 90°] with inertia, end stops and magnets at 0 and 90
  var side={th:0,w:0,k:0,held:null,lastTick:0,target:null};
  function thSet(a){side.target=clamp(a,-4*D2R,94*D2R);}
  function stepSide(dt){var th=side.th,w=side.w;
    if(side.target!=null){var err=side.target-th;w+=(err*260-w*28)*dt;}
    else{var M=90*D2R,pull=0;if(th<12*D2R)pull=-th*30;else if(th>M-12*D2R)pull=(M-th)*30;w+=pull*dt;w*=Math.exp(-dt*(reduce?9:3.2));}
    th+=w*dt;
    if(th<0){th=0;if(w<-.6){snd('stop',Math.min(1,-w/4));}w=-w*.28;}
    if(th>90*D2R){th=90*D2R;if(w>.6){snd('stop',Math.min(1,w/4));}w=-w*.28;}
    if(Math.abs(w)<.002&&side.target==null&&(th<.002||th>90*D2R-.002)){w=0;th=th<.5?0:90*D2R;}
    var tick=Math.floor(th/(7.5*D2R)+.5);if(tick!==side.lastTick){side.lastTick=tick;snd('tick',.5+.5*tick/12,tick);}
    side.th=th;side.w=w;side.k=sm(th/(90*D2R));}
  var REC=(function(){var s=(window.EH_AUDIO&&EH_AUDIO.sfx)||{};function f(re){return Object.keys(s).filter(function(k){return s[k].room==='avantgarde'&&re.test(k);})[0]||null;}
    return{tick:f(/tick|click|ratchet|knob/),stop:f(/thunk|stop|knock|bump/)};})();
  function snd(kind,v,n){if(REC[kind]&&api.sfx.play){if(api.sfx.play(REC[kind],{v:v*.8}))return;}
    if(kind==='tick')syn.click(.05+.05*v,1800+(n||0)*90);else syn.thud(.1+.2*v);}
  function knobCenter(el){var r=el.getBoundingClientRect();return[r.left+r.width/2,r.top+r.height/2];}
  function angleAt(c,x,y){return Math.atan2(x-c[0],-(y-c[1]));}   // 0 = up, clockwise positive
  function grabTurn(el,e,center){e.preventDefault();e.stopPropagation();try{el.setPointerCapture(e.pointerId);}catch(_){}el.classList.add('drag');
    var c=center(),a0=angleAt(c,e.clientX,e.clientY);side.held={id:e.pointerId,el:el,center:center,a:a0,th0:side.th,acc:0};thSet(side.th);}
  function moveTurn(e){var h=side.held;if(!h||h.id!==e.pointerId)return;var c=h.center(),a=angleAt(c,e.clientX,e.clientY),d=a-h.a;if(d>Math.PI)d-=2*Math.PI;if(d<-Math.PI)d+=2*Math.PI;h.a=a;h.acc+=d;thSet(h.th0+h.acc);}
  function endTurn(e){var h=side.held;if(!h||(e&&h.id!==e.pointerId))return;h.el.classList.remove('drag');side.held=null;side.target=null;}
  knob.addEventListener('pointerdown',function(e){if(e.button!=null&&e.button!==0&&e.pointerType==='mouse')return;grabTurn(knob,e,function(){return knobCenter(knob);});});
  knob.addEventListener('pointermove',moveTurn);knob.addEventListener('pointerup',endTurn);knob.addEventListener('pointercancel',endTurn);knob.addEventListener('lostpointercapture',endTurn);
  knob.addEventListener('keydown',function(e){var st=0;if(e.key==='ArrowUp'||e.key==='ArrowRight')st=7.5;else if(e.key==='ArrowDown'||e.key==='ArrowLeft')st=-7.5;else if(e.key==='PageUp')st=30;else if(e.key==='PageDown')st=-30;
    else if(e.key==='Home'){side.w=-6;e.preventDefault();return;}else if(e.key==='End'){side.w=6;e.preventDefault();return;}else return;
    e.preventDefault();e.stopPropagation();side.w+=st*D2R*9;});
  knob.addEventListener('click',function(e){e.preventDefault();});

  // ---------- geometry: painting space ↔ a target rect (wall or stage), rotated by θ about the centre and scaled to fit
  function fitScale(w,h,th){var c=Math.abs(Math.cos(th)),s=Math.abs(Math.sin(th));return Math.min(w/(w*c+h*s),h/(w*s+h*c));}
  function xf(w,h){var z=w/G.W,s=fitScale(w,h,side.th)*z;return{w:w,h:h,s:s,th:side.th};}
  function toPaint(X,x,y){var dx=x-X.w/2,dy=y-X.h/2,c=Math.cos(-X.th),s=Math.sin(-X.th);return[(dx*c-dy*s)/X.s+G.W/2,(dx*s+dy*c)/X.s+G.H/2];}
  function toScreen(X,px,py){var dx=(px-G.W/2)*X.s,dy=(py-G.H/2)*X.s,c=Math.cos(X.th),s=Math.sin(X.th);return[X.w/2+dx*c-dy*s,X.h/2+dx*s+dy*c];}
  function inPoly(q,h){var c=false;for(var i=0,j=h.length-1;i<h.length;j=i++){var a=h[i],b=h[j];if(((a[1]>q[1])!==(b[1]>q[1]))&&(q[0]<(b[0]-a[0])*(q[1]-a[1])/(b[1]-a[1])+a[0]))c=!c;}return c;}
  function nearPoly(q,h,pad){for(var i=0,j=h.length-1;i<h.length;j=i++){var a=h[j],b=h[i],dx=b[0]-a[0],dy=b[1]-a[1],t=clamp(((q[0]-a[0])*dx+(q[1]-a[1])*dy)/(dx*dx+dy*dy||1),0,1);if(Math.hypot(q[0]-a[0]-t*dx,q[1]-a[1]-t*dy)<pad)return true;}return false;}
  function formAt(q,pad){var i,f,b;for(i=0;i<G.forms.length;i++){f=G.forms[i];b=f.box;if(q[0]<b[0]-pad||q[0]>b[0]+b[2]+pad||q[1]<b[1]-pad||q[1]>b[1]+b[3]+pad)continue;
      for(var k=0;k<f.poly.length;k++)if(inPoly(q,f.poly[k]))return f;}
    if(pad>0)for(i=0;i<G.forms.length;i++){f=G.forms[i];b=f.box;if(q[0]<b[0]-pad||q[0]>b[0]+b[2]+pad||q[1]<b[1]-pad||q[1]>b[1]+b[3]+pad)continue;for(var k2=0;k2<f.poly.length;k2++)if(nearPoly(q,f.poly[k2],pad))return f;}
    return null;}

  // ---------- drawing (one renderer for the wall overlay and the in-panel stage)
  var wallCol=(getComputedStyle(document.getElementById('room')||document.body).getPropertyValue('--wall')||'').trim()||room.wall||'#2b2825';
  function drawAtlas(g,f,rect,alpha){if(!rect||!ok(atlas))return;var b=f.box;g.globalAlpha=alpha;g.drawImage(atlas,rect[0],rect[1],rect[2],rect[3],b[0],b[1],b[2],b[3]);g.globalAlpha=1;}
  function formActive(f){return f.glow>.004||Math.abs(f.ox)+Math.abs(f.oy)>.4||Math.abs(f.s)>.002||f.hover>.01;}
  function scene(g,X,full,unitPx){   // g already scaled to device px; X from xf()
    var rotated=side.th>.0015||side.w!==0;
    g.save();
    if(full||rotated){g.fillStyle=full?'#191715':wallCol;g.fillRect(0,0,X.w,X.h);}
    g.translate(X.w/2,X.h/2);g.rotate(X.th);g.scale(X.s,X.s);g.translate(-G.W/2,-G.H/2);
    if((full||rotated)&&ok(hung)){g.drawImage(hung,0,0,G.W,G.H);}
    var k=side.k;
    if(k>.003&&ok(soft)){g.globalAlpha=Math.min(1,k*1.15);g.drawImage(soft,0,0,G.W,G.H);g.globalAlpha=1;
      // inner light: the colours glow
      g.globalCompositeOperation='screen';g.globalAlpha=.22*k;g.drawImage(soft,0,0,G.W,G.H);g.globalAlpha=1;g.globalCompositeOperation='source-over';}
    // forms that move: plate under, the cut-out stretched along the pull and scaled by its spring
    for(var i=G.forms.length-1;i>=0;i--){var f=G.forms[i];if(!formActive(f))continue;
      var disp=Math.hypot(f.ox,f.oy),moving=disp>.4||Math.abs(f.s)>.002;
      if(moving&&k<.98)drawAtlas(g,f,f.plate,1-k);
      g.save();var cx=f.c[0],cy=f.c[1];g.translate(cx+f.ox,cy+f.oy);
      if(disp>.4){var ang=Math.atan2(f.oy,f.ox),st=1+Math.min(.35,disp/Math.max(60,f.size*1.4));g.rotate(ang);g.scale(st,1/Math.sqrt(st));g.rotate(-ang);}
      var sc=1+f.s;g.scale(sc,sc);g.translate(-cx,-cy);
      if(moving)drawAtlas(g,f,f.cut,k>0?1-.5*k:1);
      var gl=Math.max(f.glow*.55,f.hover*.22);
      if(gl>.01){g.globalCompositeOperation='lighter';drawAtlas(g,f,f.cut,gl*.6);g.globalCompositeOperation='source-over';}
      g.restore();}
    g.restore();
    // the silences: white = a soft pale veil, black = the lights drop for a moment
    if(flash.white>.01){g.fillStyle='rgba(245,240,228,'+(.28*flash.white).toFixed(3)+')';g.fillRect(0,0,X.w,X.h);}
    if(flash.black>.01){g.fillStyle='rgba(8,7,6,'+(.55*flash.black).toFixed(3)+')';g.fillRect(0,0,X.w,X.h);}}
  var cw=document.getElementById('cw'),frameEl=document.getElementById('frame'),ov=null,og=null;
  if(cw){ov=document.createElement('canvas');ov.className='syn-ov';ov.setAttribute('aria-hidden','true');cw.appendChild(ov);og=ov.getContext('2d');}
  var cwTouch=cw?cw.style.touchAction:'',cwCursor=cw?cw.style.cursor:'';
  function wallVisible(r){r=r||api.artRect();var cmp=document.getElementById('cmpA');return r.width>40&&r.height>40&&!(frameEl&&frameEl.classList.contains('hidden'))&&!(cmp&&cmp.classList.contains('on'));}
  function anyActive(){if(side.th>.0015||side.w!==0||flash.white>.01||flash.black>.01)return true;for(var i=0;i<G.forms.length;i++)if(formActive(G.forms[i]))return true;return false;}
  var wallClear=true;
  function drawWall(r,wv){if(!ov)return;var dpr=Math.min(devicePixelRatio||1,2),w=Math.round(r.width*dpr),h=Math.round(r.height*dpr);
    if(!wv||!anyActive()){if(!wallClear){og.setTransform(1,0,0,1,0,0);og.clearRect(0,0,ov.width,ov.height);wallClear=true;}return;}
    if(ov.width!==w||ov.height!==h){ov.width=w;ov.height=h;}
    og.setTransform(1,0,0,1,0,0);og.clearRect(0,0,w,h);og.setTransform(dpr,0,0,dpr,0,0);og.imageSmoothingQuality='high';
    scene(og,xf(r.width,r.height),false);wallClear=false;}
  function drawStage(){var dpr=Math.min(devicePixelRatio||1,2),cwid=stage.clientWidth;if(!cwid)return;var chei=cwid*2/3,w=Math.round(cwid*dpr),h=Math.round(chei*dpr);
    if(stage.width!==w||stage.height!==h){stage.width=w;stage.height=h;}sg.setTransform(dpr,0,0,dpr,0,0);sg.imageSmoothingQuality='high';scene(sg,xf(cwid,chei),true);}

  // ---------- the corner grip on the hung work (turns the painting directly)
  var grip=document.createElement('button');grip.type='button';grip.className='syn-grip';grip.setAttribute('aria-label',T.knob+'：拖动这个角，把画转过去');grip.tabIndex=-1;
  grip.innerHTML='<svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M4 12a6 6 0 1 0 2-7.5" fill="none" stroke="#efe6d6" stroke-width="1.6" stroke-linecap="round"/><path d="M3 2.5 6.3 4.6 3.6 7.6" fill="none" stroke="#efe6d6" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  document.body.appendChild(grip);
  function artCenter(){var r=api.artRect();return[r.left+r.width/2,r.top+r.height/2];}
  grip.addEventListener('pointerdown',function(e){if(e.button!=null&&e.button!==0&&e.pointerType==='mouse')return;grabTurn(grip,e,artCenter);});
  grip.addEventListener('pointermove',moveTurn);grip.addEventListener('pointerup',endTurn);grip.addEventListener('pointercancel',endTurn);grip.addEventListener('lostpointercapture',endTurn);
  function placeGrip(r,wv){if(!wv){grip.classList.remove('on');return;}var X=xf(r.width,r.height),p=toScreen(X,G.W-G.W*.035,G.H-G.W*.035);grip.style.transform='translate('+(r.left+p[0]).toFixed(1)+'px,'+(r.top+p[1]).toFixed(1)+'px)';grip.classList.add('on');}

  // ---------- pointer play on a surface (wall or stage)
  var drags={};           // pointerId → {where, form|null (strum), x0,y0, moved, last}
  var suppress=false;
  function toP(where,x,y){if(where==='stage'){var rc=stage.getBoundingClientRect();return toPaint(xf(rc.width,rc.height),x-rc.left,y-rc.top);}
    var r=api.artRect();return toPaint(xf(r.width,r.height),x-r.left,y-r.top);}
  function pxScale(where){if(where==='stage'){var rc=stage.getBoundingClientRect();return xf(rc.width,rc.height).s;}var r=api.artRect();return xf(r.width,r.height).s;}
  function pDown(e,where){if(e.button!=null&&e.button!==0&&e.pointerType==='mouse')return false;var q=toP(where,e.clientX,e.clientY),pad=(e.pointerType==='touch'?14:5)/pxScale(where);
    var f=formAt(q,pad);drags[e.pointerId]={where:where,form:f,x0:e.clientX,y0:e.clientY,moved:false,q:q,strum:!f,last:f,touch:e.pointerType==='touch'};
    if(f)press(f,e.pointerId,.8);return true;}
  function pMove(e){var d=drags[e.pointerId];if(!d)return false;var dx=e.clientX-d.x0,dy=e.clientY-d.y0;if(!d.moved&&Math.hypot(dx,dy)>6)d.moved=true;
    var s=pxScale(d.where);
    if(d.form){if(d.form.held&&d.form.held.id===e.pointerId){d.form.held.dx=dx/s;d.form.held.dy=(d.touch&&d.where==='stage')?0:dy/s;}}
    else if(d.strum&&d.moved){var q=toP(d.where,e.clientX,e.clientY),f=formAt(q,3/s);
      if(f&&f!==d.last){var sp=Math.hypot(q[0]-d.q[0],q[1]-d.q[1]);pluck(f,q,d.q,Math.min(1,.45+sp/(200)));}d.last=f;d.q=q;}
    return true;}
  function pluck(f,q,q0,vel){press(f,null,vel);var dx=q[0]-q0[0],dy=q[1]-q0[1],l=Math.hypot(dx,dy)||1,imp=reduce?40:Math.min(900,260+l*6);f.vx+=dx/l*imp;f.vy+=dy/l*imp;
    if(f.voice&&f.voice.sus){var v=f.voice;setTimeout(function(){v.release();},320);}}
  function pUp(e){var d=drags[e.pointerId];if(!d)return null;delete drags[e.pointerId];if(d.form)letGo(d.form,e.pointerId);return d;}

  // wall: capture phase so the painting's own click (open the viewer) does not fire after playing
  function wallDown(e){suppress=false;if(!ov)return;var r=api.artRect();if(!wallVisible(r))return;if(e.target===grip)return;
    if(pDown(e,'wall')){var d=drags[e.pointerId];if(d.form){e.stopPropagation();suppress=true;}try{frameEl.setPointerCapture(e.pointerId);}catch(_){}}}
  function wallMove(e){if(drags[e.pointerId]&&drags[e.pointerId].where==='wall'){pMove(e);if(drags[e.pointerId].moved)suppress=true;e.stopPropagation();return;}
    if(e.pointerType!=='mouse'||!cw)return;var r=api.artRect();if(!wallVisible(r))return;var f=formAt(toP('wall',e.clientX,e.clientY),4/pxScale('wall'));setHover(f);cw.style.cursor=f?'pointer':cwCursor;}
  function wallUp(e){if(drags[e.pointerId]&&drags[e.pointerId].where==='wall'){var d=pUp(e);if(d&&(d.form||d.moved)){suppress=true;e.stopPropagation();}}}
  function wallClick(e){if(suppress){suppress=false;e.stopPropagation();e.preventDefault();}}
  function wallLeave(){setHover(null);if(cw)cw.style.cursor=cwCursor;}
  if(frameEl){frameEl.addEventListener('pointerdown',wallDown,true);frameEl.addEventListener('pointermove',wallMove,true);frameEl.addEventListener('pointerup',wallUp,true);
    frameEl.addEventListener('pointercancel',wallUp,true);frameEl.addEventListener('click',wallClick,true);frameEl.addEventListener('pointerleave',wallLeave);}
  if(cw)cw.style.touchAction='none';
  var hovered=null;function setHover(f){hovered=f;}
  // stage (narrow screens): pan-y keeps vertical scrolling; taps and sideways pulls play
  stage.addEventListener('pointerdown',function(e){if(pDown(e,'stage')){if(e.pointerType!=='touch'){try{stage.setPointerCapture(e.pointerId);}catch(_){}e.preventDefault();}}});
  stage.addEventListener('pointermove',function(e){if(pMove(e))return;if(e.pointerType==='mouse'){var s=pxScale('stage'),f=formAt(toP('stage',e.clientX,e.clientY),4/s);setHover(f);stage.style.cursor=f?'pointer':'default';}});
  function stUp(e){pUp(e);}stage.addEventListener('pointerup',stUp);stage.addEventListener('pointercancel',stUp);stage.addEventListener('pointerleave',function(e){if(e.pointerType==='mouse')setHover(null);});

  // ---------- physics
  function stepForms(dt){var wN=2*Math.PI*(reduce?2.2:3.4),z=reduce?.6:.11,wS=2*Math.PI*(reduce?2.5:4.2),zS=reduce?.7:.12;
    G.forms.concat(KEYS.map(function(k){return k.ghost;}).filter(Boolean)).forEach(function(f){
      var n=Math.max(1,Math.ceil(dt/.004)),h=dt/n,R=Math.max(130,(f.size||200)*.95)*(reduce?.4:1);
      for(var i=0;i<n;i++){
        if(f.held){var dx=f.held.dx||0,dy=f.held.dy||0,l=Math.hypot(dx,dy),rl=l?R*l/(R+l):0,tx=l?dx/l*rl:0,ty=l?dy/l*rl:0;   // rubber band: saturates at R
          f.vx+=((tx-f.ox)*wN*wN*1.6-2*.9*wN*f.vx)*h;f.vy+=((ty-f.oy)*wN*wN*1.6-2*.9*wN*f.vy)*h;}
        else{f.vx+=(-f.ox*wN*wN-2*z*wN*f.vx)*h;f.vy+=(-f.oy*wN*wN-2*z*wN*f.vy)*h;}
        f.ox+=f.vx*h;f.oy+=f.vy*h;
        f.vs+=(-f.s*wS*wS-2*zS*wS*f.vs)*h;f.s+=f.vs*h;}
      if(f.s>.18){f.s=.18;f.vs=Math.min(0,f.vs);}if(f.s<-.12){f.s=-.12;f.vs=Math.max(0,f.vs);}
      if(!f.held&&Math.abs(f.ox)+Math.abs(f.oy)<.05&&Math.abs(f.vx)+Math.abs(f.vy)<.5){f.ox=f.oy=f.vx=f.vy=0;}
      if(Math.abs(f.s)<.0006&&Math.abs(f.vs)<.01){f.s=f.vs=0;}
      var lv=f.voice&&f.voice.alive()?f.voice.level():0;
      f.glow=Math.max(f.held?1:0,f.glow-dt/(reduce?.5:1.1),Math.min(1,lv));
      f.hover+=((hovered===f?1:0)-f.hover)*Math.min(1,dt*10);
      // the coupling: tension raises the pitch (up to a fourth), the spring's motion is the vibrato and tremolo
      if(f.voice){if(!f.voice.alive()){f.voice=null;}else{var disp=Math.hypot(f.ox,f.oy)/R,vel=(f.vx*f.ox+f.vy*f.oy)/(R*R*wN||1);
        f.voice.set(Math.min(5,disp*5)+(f.held?0:clamp(f.ox/R,-1,1)*.9),clamp(f.s*2.4+vel*.25,-.5,.5),1+side.k*.6);}}});}

  // ---------- the painting's chord while it lies on its side
  var drone=[];
  function stepDrone(){var k=side.k;syn.setLoud(k);
    if(k>.04&&!drone.length&&syn.ready()){
      var fams={};G.forms.forEach(function(f){if(FAM[f.fam].lo&&FAM[f.fam].v!=='bell')fams[f.fam]=(fams[f.fam]||0)+f.area;});
      Object.keys(fams).sort(function(a,b){return fams[b]-fams[a];}).slice(0,5).forEach(function(fam,i){var d=FAM[fam],m=chordNote(d.lo,d.hi,.3+.1*i);
        var v=syn.voice(d.v,m,{vel:.5,gain:.0001,pan:(i%2?-.4:.4),wet:1.6});if(v)drone.push({v:v,ph:i*1.7});});}
    if(drone.length){var t=performance.now()/1000;drone.forEach(function(o,i){o.v.set(0,.25*Math.sin(t*(.4+.13*i)+o.ph),Math.pow(k,1.6)*.33+1e-4);});
      if(k<.02){drone.forEach(function(o){o.v.release(1.2);});drone=[];}}}

  // ---------- loop
  var raf=0,last=0,lastHint='',lastDeg='',lastSide=false;
  function tick(now){if(dead)return;raf=requestAnimationFrame(tick);if(!host.isConnected){dispose();return;}
    var dt=last?Math.min((now-last)/1000,.05):0;last=now;
    var r=api.artRect(),wv=wallVisible(r);wrap.classList.toggle('narrow',!wv);
    stepSide(dt);stepForms(dt);stepDrone();flash.white=Math.max(0,flash.white-dt/1.4);flash.black=Math.max(0,flash.black-dt/1.1);
    drawWall(r,wv);if(!wv)drawStage();placeGrip(r,wv);
    // knob
    var deg=side.th/D2R;knobRot.setAttribute('transform','rotate('+deg.toFixed(2)+')');
    var a1=clamp(deg,0,90)*D2R;knobArc.setAttribute('d',a1>.01?'M0 -40 A40 40 0 0 1 '+(Math.sin(a1)*40).toFixed(2)+' '+(-Math.cos(a1)*40).toFixed(2):'');
    var ds=Math.round(clamp(deg,0,90))+'°';if(ds!==lastDeg){lastDeg=ds;degEl.textContent=ds;knob.setAttribute('aria-valuenow',String(Math.round(clamp(deg,0,90))));knob.setAttribute('aria-valuetext',ds);}
    var onSide=side.k>.85;if(onSide!==lastSide){lastSide=onSide;sideEl.hidden=!onSide;}
    var tch=touchUI(),hv=wv?T.hintWall:(tch?T.hintTouch:T.hint);if(hv!==lastHint){lastHint=hv;hintEl.textContent=nb(hv);wrap.querySelector('.tt').textContent=nb(tch?T.turnTouch:T.turn);}}
  sideEl.textContent=nb(T.side);
  nowEl.innerHTML='<span></span>';nowEl.firstChild.textContent=nb(sp.idle||'画还没有出声。');
  raf=requestAnimationFrame(tick);

  function dispose(){if(dead)return;dead=true;cancelAnimationFrame(raf);clearTimeout(pollT);
    G.forms.forEach(function(f){if(f.voice)f.voice.release(.2);});drone.forEach(function(o){o.v.release(.3);});syn.kill();
    removeEventListener('keydown',onKey);removeEventListener('keyup',onKey);
    if(ov&&ov.parentNode)ov.parentNode.removeChild(ov);if(grip.parentNode)grip.parentNode.removeChild(grip);
    if(cw){cw.style.touchAction=cwTouch;cw.style.cursor=cwCursor;}
    if(frameEl){frameEl.removeEventListener('pointerdown',wallDown,true);frameEl.removeEventListener('pointermove',wallMove,true);frameEl.removeEventListener('pointerup',wallUp,true);
      frameEl.removeEventListener('pointercancel',wallUp,true);frameEl.removeEventListener('click',wallClick,true);frameEl.removeEventListener('pointerleave',wallLeave);}}
  host._dispose=dispose;
  if(EH.debug)EH.debug.syn={G:G,side:side,keys:function(){return KEYS;},Synth:Synth,press:function(id,vel){var f=G.forms.filter(function(x){return x.id===id;})[0];if(f)press(f,'dbg',vel||.8);return !!f;},
    release:function(id){var f=G.forms.filter(function(x){return x.id===id;})[0];if(f)letGo(f,'dbg');},
    pull:function(id,dx,dy){var f=G.forms.filter(function(x){return x.id===id;})[0];if(f&&f.held){f.held.dx=dx;f.held.dy=dy;}},
    turn:function(deg){side.th=deg*D2R;side.w=0;side.target=null;side.k=sm(side.th/(90*D2R));},syn:syn};
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

