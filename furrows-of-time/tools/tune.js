// Tunes the price level of each age so a fast, tireless player spends TARGET[e] minutes in it.
const fs=require('fs'); const file=process.argv[2];
let src=fs.readFileSync(file,'utf8');
const G=new Function(src+';return Game;')(); const N=G.N;
const TARGET=[10,18,25,30,35,38,42,44,46,50,54,58];
function newSim(){ return {S:G.fresh(),F:G.freshField(),t:0,lastRipen:0,path:null,W:1,k:0} }
function clone(o){ return {S:JSON.parse(JSON.stringify(o.S)),F:{st:o.F.st.slice(),crop:o.F.crop.slice(),ever:o.F.ever.slice(),ripe:o.F.ripe.slice()},t:o.t,lastRipen:o.lastRipen,path:o.path,W:o.W,k:o.k} }
function has(o,ci,cj){ const off=G.offsets(G.rates(o.S).tool),st=o.F.st; for(let a=0;a<off.length;a+=2){const i=ci+off[a],j=cj+off[a+1]; if(i<0||j<0||i>=N||j>=N)continue; const s=st[j*N+i]; if(s!==2)return true} return false }
function step(o,dt){ o.t+=dt;o.S.clock=o.t; if(o.t-o.lastRipen>.3){o.lastRipen=o.t;G.ripen(o.S,o.F)} }
function bestSeed(S){const r=G.rates(S);let b,bv=-1;for(const c of G.CROPS){if(c.era>S.era)continue;const v=G.harvestValue(c,r)/(G.growSeconds(c,r)+8);if(v>bv){bv=v;b=c.id}}return b}
function lap(o){ const S=o.S,r=G.rates(S); const W=2*Math.floor(r.tool)+1; const g=G.growSeconds(G.cropById[S.seed],r);
  const per=3/r.pace+W/r.legs, need=Math.ceil(g/per)+2, maxL=Math.max(1,Math.floor((N-20)/W)); let maxRows=maxL-(maxL%2); if(maxRows<2)maxRows=2;
  let rows=Math.max(2,Math.ceil(need/maxL)); if(rows%2)rows++; rows=Math.min(rows,maxRows); const L=Math.min(maxL,Math.ceil(need/rows));
  const h=Math.floor(W/2), x0=Math.max(10,Math.floor(N/2-L*W/2)), path=[]; for(let q=0;q<rows;q++)for(let a=0;a<L;a++){const aa=q%2?L-1-a:a; path.push([x0+h+aa*W,10+h+q*W])}
  o.path=path;o.W=W;o.k=0 }
// run until the era changes (or, in the last era, until everything is bought). returns minutes spent, or Infinity
function runEra(o,limitMin){ const S=o.S,era=S.era,t0=o.t; if(!o.path)lap(o);
  while(o.t-t0<limitMin*60){
    const r=G.rates(S),[ci,cj]=o.path[o.k]; let g=0; while(has(o,ci,cj)&&g++<4){const res=G.swing(S,o.F,ci,cj,r);step(o,1/r.pace);
      if(res.blocked||S.bag>=r.bag){ const nb=G.nearestBarn(ci,cj); step(o,2*Math.max(0,nb.dist-G.SELL_RANGE)/r.legs+1); G.sell(S); }}
    o.k++; step(o,o.W/r.legs); if(o.k>=o.path.length){G.setSeed(S,bestSeed(S));lap(o)}
    const n=G.nextEra(S);
    const allBought=G.TRACKS.filter(t=>t.id!=='rock'&&t.id!=='snow').every(tr=>{const nt=G.nextTier(S,tr.id);return !nt||nt.era>S.era});
    if(n&&allBought&&S.coins>=n.cost){G.advance(S);G.setSeed(S,bestSeed(S));lap(o);return (o.t-t0)/60}
    let best=null; for(const tr of G.TRACKS.filter(t=>t.id!=='rock'&&t.id!=='snow')){const nt=G.nextTier(S,tr.id); if(nt&&nt.era<=S.era&&(!best||nt.cost<best.c))best={c:nt.cost,id:tr.id}}
    if(best&&best.c<=S.coins){G.buy(S,best.id);lap(o)}
    if(!n&&!best)return (o.t-t0)/60;
  }
  return Infinity }
// The tuner prices ages by coins alone; age requirements are left out of the simulation.
for (const k in G.REQS) delete G.REQS[k];
G.OPTS.seasons = false; G.OPTS.fert = false; G.OPTS.rest = false;
const M=G.M.slice(); let base=newSim(); const out=[];
for(let e=0;e<12;e++){
  let lo=1e-2,hi=1e18;
  for(let it=0;it<44;it++){ const mid=Math.sqrt(lo*hi); M[e]=mid; G.reprice(M); const o=clone(base); const m=runEra(o,TARGET[e]*1.02+.2); if(m>TARGET[e])hi=mid; else lo=mid; if(hi/lo<1.02)break }
  M[e]=+Number(lo).toPrecision(3); G.reprice(M); const o=clone(base); const m=runEra(o,600); out.push(`era ${e+1} (${G.ERAS[e].year}) m=${M[e]} -> ${m.toFixed(1)} min, enter-next cost ${G.ERAS[e+1]?G.ERAS[e+1].cost:'-'}`); base=o;
}
console.log(out.join('\n')); console.log('total min',(base.t/60).toFixed(0),'worked',base.S.worked,'harvests',base.S.harvests);
src=src.replace(/\/\*M\*\/[\s\S]*?\/\*M\*\//,'/*M*/'+M.join(',')+'/*M*/'); fs.writeFileSync(file,src);
