/* Game rules. No DOM and no 3D in here, so the same code can be run and balanced outside the page. */
const Game = (() => {
  const N = 256, WILD = 0, PLOWED = 1, GROWING = 2, RIPE = 3;
  const ERAS = [
    {id:1,  year:300,  name:'Antiquity',      blurb:'Sixty-five thousand plots of grass and your two hands. Plow, sow wheat, reap.'},
    {id:2,  year:800,  name:'Early Medieval', blurb:'An ox and a wooden ard now break the ground for you. Barley feeds the village.'},
    {id:3,  year:1200, name:'High Medieval',  blurb:'The heavy plough turns deep soil, and windmills grind what you bring in.'},
    {id:4,  year:1600, name:'Discovery',      blurb:'Ships come home from the New World carrying strange roots and red fruit.'},
    {id:5,  year:1850, name:'Industrial',     blurb:'Steam reaches the fields. One engine now does the work of forty hands.'},
    {id:6,  year:1940, name:'Machine Age',    blurb:'A petrol tractor replaces the horses, and hybrid corn fills the silos.'},
    {id:7,  year:1990, name:'Agribusiness',   blurb:'A combine takes a whole swath in one pass. Fields run to the horizon.'},
    {id:8,  year:2000, name:'Digital',        blurb:'Satellites steer the tractor to the centimetre. You watch the yield map.'},
    {id:9,  year:2026, name:'Smart Farming',  blurb:'Drones scout, spray and pick. The farm runs from a phone.'},
    {id:10, year:2100, name:'Robot Age',      blurb:'Field robots work through the heat of the day and never stop for water.'},
    {id:11, year:2500, name:'Orbital',        blurb:'A hover harvester drifts over the rows. Moonberries glow at dusk.'},
    {id:12, year:3000, name:'Star Age',       blurb:'A cloud of nanobots tends every plant at once. Starbloom opens under strange skies.'}
  ];
  const CROPS = [
    {id:'wheat',      name:'Wheat',      era:1,  grow:22,  value:3,         color:'#dcc06a', stem:'#c9a84a', h:1},
    {id:'barley',     name:'Barley',     era:2,  grow:26,  value:7,         color:'#efe0a0', stem:'#b9b060', h:.9},
    {id:'cabbage',    name:'Cabbage',    era:3,  grow:30,  value:16,        color:'#8fd6a8', stem:'#4f8a2d', h:.45},
    {id:'potato',     name:'Potato',     era:4,  grow:34,  value:40,        color:'#c3b1e6', stem:'#4f8a2d', h:.6},
    {id:'tomato',     name:'Tomato',     era:4,  grow:48,  value:70,        color:'#d8362a', stem:'#3d7a26', h:.85},
    {id:'cotton',     name:'Cotton',     era:5,  grow:55,  value:300,       color:'#f6f1e4', stem:'#8a6a3e', h:.85},
    {id:'corn',       name:'Corn',       era:6,  grow:50,  value:1200,      color:'#f0b429', stem:'#4f8a2d', h:1.6},
    {id:'sunflower',  name:'Sunflower',  era:7,  grow:70,  value:6000,      color:'#ff9d0a', stem:'#3d7a26', h:1.75},
    {id:'soybean',    name:'Soybean',    era:8,  grow:60,  value:28000,     color:'#a39a3e', stem:'#5a7a2d', h:.7},
    {id:'strawberry', name:'Strawberry', era:9,  grow:75,  value:150000,    color:'#ff4f6d', stem:'#3d7a26', h:.4},
    {id:'glowrice',   name:'Glow rice',  era:10, grow:90,  value:900000,    color:'#5ff0e0', stem:'#2f9a8a', h:.9},
    {id:'moonberry',  name:'Moonberry',  era:11, grow:100, value:8000000,   color:'#c06bff', stem:'#38d6c0', h:1.2},
    {id:'starbloom',  name:'Starbloom',  era:12, grow:120, value:100000000, color:'#ffd1f0', stem:'#9a7cff', h:1.5}
  ];
  const cellsIn = r => { let n = 0; const m = Math.ceil(r); for (let a = -m; a <= m; a++) for (let b = -m; b <= m; b++) if (a*a + b*b <= r*r) n++; return n; };
  const x = v => '×' + String(v);
  const T = (name, era, v, w, rig) => ({name, era, v, w, rig, cost:0});
  const R = (name, era, v, w, fk) => ({name, era, v, w, fk, cost:0});
  const ROCK_NAMES = ['', 'stone', 'rock', 'big rock', 'boulder'];
  const ROCK_REACH = ['', 'stones', 'stones and rocks', 'stones, rocks and big rocks', 'every rock, boulders too'];
  // Six upgrade tracks. Tier 0 is what you start with. v is the value the track gives,
  // w is how dear the tier is within its age, rig is the 3D model the tool shows.
  const TRACKS = [
    {id:'tool', label:'Tool', say:v => cellsIn(v).toLocaleString('en-US') + (cellsIn(v) === 1 ? ' plot' : ' plots') + ' per swing', tiers:[
      T('Bare hands',        1, .6,  0,   'hands'),
      T('Digging stick',     1, 1,   .15, 'stick'),
      T('Iron sickle',       1, 1.5, 3.5, 'sickle'),
      T('Ox and ard',        2, 2.1, 3.5, 'ox'),
      T('Heavy plough',      3, 2.6, 3.5, 'oxteam'),
      T('Horse plough',      4, 3.3, 3.5, 'horses'),
      T('Steam engine',      5, 4.1, 3.5, 'steam'),
      T('Tractor',           6, 5.2, 3.5, 'tractor'),
      T('Combine harvester', 7, 6.5, 3.5, 'combine'),
      T('GPS tractor',       8, 8,   3.5, 'gps'),
      T('Drone swarm',       9, 9.5, 3.5, 'drones'),
      T('Field robots',      10, 11, 3.5, 'robots'),
      T('Hover harvester',   11, 13, 3.5, 'hover'),
      T('Nanobot cloud',     12, 15, 3.5, 'cloud')]},
    {id:'pace', label:'Swing speed', say:v => v + ' swings a second', tiers:[
      T('Your own pace', 1, 2, 0), T('Whetstone', 1, 2.4, 1.7), T('Iron fittings', 2, 2.8, 1.7), T('Guild blades', 3, 3.2, 1.7),
      T('Steel edge', 4, 3.7, 1.7), T('Flywheel', 5, 4.2, 1.7), T('Power take-off', 6, 4.8, 1.7), T('Hydraulics', 7, 5.5, 1.7),
      T('Auto-steer', 8, 6.2, 1.7), T('Machine vision', 9, 7, 1.7), T('Servo arms', 10, 8, 1.7), T('Field processors', 11, 9, 1.7),
      T('Thought control', 12, 10, 1.7)]},
    {id:'legs', label:'Getting around', say:v => v + ' metres a second', tiers:[
      T('On foot', 1, 3.5, 0), T('Sandals', 1, 4, 2.6), T('Leather boots', 2, 4.5, 2.6), T('Pony', 3, 5.2, 2.6),
      T('Saddle horse', 4, 6, 2.6), T('Steam wagon', 5, 7, 2.6), T('Jeep', 6, 8.2, 2.6), T('Pickup truck', 7, 9.5, 2.6),
      T('Quad bike', 8, 11, 2.6), T('Electric buggy', 9, 12.5, 2.6), T('Maglev skids', 10, 14, 2.6), T('Hover skiff', 11, 16, 2.6),
      T('Blink drive', 12, 18, 2.6)]},
    {id:'yield', label:'Harvest', say:v => 'harvests pay ' + x(v), tiers:[
      T('By hand', 1, 1, 0), T('Threshing floor', 1, 1.3, 1.3), T('Flail', 2, 1.6, 1.3), T('Windmill', 3, 2, 1.3),
      T('Scythe', 4, 2.5, 1.3), T('Threshing machine', 5, 3.2, 1.3), T('Grain elevator', 6, 4, 1.3), T('Grain header', 7, 5, 1.3),
      T('Yield mapping', 8, 6.2, 1.3), T('Sorting AI', 9, 7.5, 1.3), T('Gene lab', 10, 9, 1.3), T('Matter printer', 11, 11, 1.3),
      T('Replicator', 12, 14, 1.3)]},
    {id:'water', label:'Water', say:v => 'crops grow ' + x(v) + ' as fast', tiers:[
      T('Rain', 1, 1, 0), T('Clay jars', 1, 1.2, 2.1), T('Well', 2, 1.4, 2.1), T('Mill pond', 3, 1.6, 2.1),
      T('Irrigation ditch', 4, 1.9, 2.1), T('Steam pump', 5, 2.2, 2.1), T('Fertilizer', 6, 2.6, 2.1), T('Pivot sprinklers', 7, 3, 2.1),
      T('Drip lines', 8, 3.5, 2.1), T('Soil sensors', 9, 4, 2.1), T('Grow lamps', 10, 4.6, 2.1), T('Weather control', 11, 5.3, 2.1),
      T('Time fields', 12, 6, 2.1)]},
    {id:'bag', label:'Bag', say:v => 'holds ' + v.toLocaleString('en-US') + ' crops', tiers:[
      T('Your pockets', 1, 15, 0), T('Linen sack', 1, 40, 1), T('Wicker basket', 2, 90, 1), T('Ox cart', 3, 200, 1),
      T('Hay wagon', 4, 450, 1), T('Grain wagon', 5, 1000, 1), T('Farm trailer', 6, 2500, 1), T('Grain truck', 7, 6000, 1),
      T('Road train', 8, 15000, 1), T('Drone hauler', 9, 40000, 1), T('Robot convoy', 10, 100000, 1), T('Cargo shuttle', 11, 250000, 1),
      T('Matter stream', 12, 700000, 1)]},
    // Rock tools. v is the biggest rock the tool can lift (1 stone, 2 rock, 3 big rock, 4 boulder);
    // fk scales the coins each rock costs to remove: later tools work cheaper.
    {id:'rock', label:'Rock tool', say:v => v ? 'clears ' + ROCK_REACH[v] : 'cannot clear rocks', tiers:[
      R('No rock tool',       1, 0, 0,   1),
      R('Crowbar',            1, 1, 1.6, 1),
      R('Pickaxe',            2, 2, 1.6, 1),
      R('Stone sledge',       3, 2, 1.6, .85),
      R('Block and tackle',   4, 3, 1.6, .75),
      R('Blasting powder',    5, 3, 1.6, .65),
      R('Stone picker',       6, 3, 1.6, .55),
      R('Rock crusher',       7, 4, 1.6, .5),
      R('Hydraulic breaker',  8, 4, 1.6, .4),
      R('Sonic drill',        9, 4, 1.6, .3),
      R('Laser cutter',       10, 4, 1.6, .2),
      R('Gravity lifter',     11, 4, 1.6, .12),
      R('Matter dissolver',   12, 4, 1.6, .05)]}
  ];
  // Price level of each age, tuned by simulation so that a fast player needs about three hours.
  const M = [/*M*/146,1640,11200,135000,1380000,12500000,153000000,1440000000,12600000000,138000000000,2100000000000,30800000000000/*M*/];
  const ERA_W = 12;
  const nice = n => { if (n < 10) return Math.max(1, Math.round(n)); const p = Math.pow(10, Math.floor(Math.log10(n)) - 1); return Math.round(n / p) * p; };
  function reprice(m){
    ERAS.forEach((e, i) => { e.cost = i ? nice(m[i - 1] * ERA_W) : 0; });
    for (const t of TRACKS) for (const tier of t.tiers) tier.cost = tier.w ? nice(m[tier.era - 1] * tier.w) : 0;
  }
  reprice(M);

  // Barns stand just outside the fence, one in the middle of each side. Empty your bag near one.
  const BARNS = [[N / 2, -6], [N / 2, N + 6], [-6, N / 2], [N + 6, N / 2]], SELL_RANGE = 9;
  function nearestBarn(x, z){
    let best = null, bd = Infinity;
    for (const b of BARNS){ const d = Math.hypot(b[0] - x, b[1] - z); if (d < bd){ bd = d; best = b; } }
    return {barn:best, dist:bd};
  }
  const cropById = Object.fromEntries(CROPS.map(c => [c.id, c]));
  const trackById = Object.fromEntries(TRACKS.map(t => [t.id, t]));
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const offsetCache = {};
  function offsets(r){
    if (offsetCache[r]) return offsetCache[r];
    const out = [], m = Math.ceil(r);
    for (let a = -m; a <= m; a++) for (let b = -m; b <= m; b++) if (a*a + b*b <= r*r) out.push(a, b);
    return offsetCache[r] = out;
  }

  function fresh(){
    const lv = {}; for (const t of TRACKS) lv[t.id] = 0;
    return {v:5, coins:0, earned:0, era:1, seed:'wheat', mode:'all', eraPlow:0, eraHarv:{}, lv, bag:0, bagValue:0, sold:0, harvests:0, sown:0, worked:0, growing:0, clock:0, done:false,
      px:N / 2 + .5, pz:3.5, yaw:Math.PI, pitch:-.32, work:true};
  }
  // Rocks lie in clusters across the field, the same on every farm, clear of the start.
  function placeRocks(rock){
    let s = 90210;
    const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
    for (let c = 0; c < 320; c++){
      const cx = 4 + rnd() * (N - 8), cz = 4 + rnd() * (N - 8), many = 1 + (rnd() * rnd() * 14 | 0), spread = 1 + rnd() * 3.5;
      for (let n = 0; n < many; n++){
        const i = Math.floor(cx + (rnd() - .5) * 2 * spread), j = Math.floor(cz + (rnd() - .5) * 2 * spread);
        if (i < 0 || j < 0 || i >= N || j >= N) continue;
        if (j < 16 && Math.abs(i - N / 2) < 24) continue;
        const q = rnd();
        rock[j * N + i] = q < .5 ? 1 : q < .8 ? 2 : q < .95 ? 3 : 4;
      }
    }
    return rock;
  }
  function freshField(){
    return {st:new Uint8Array(N * N), crop:new Uint8Array(N * N), ever:new Uint8Array(N * N), ripe:new Float64Array(N * N), rock:placeRocks(new Uint8Array(N * N))};
  }
  function rates(S){
    const r = {};
    for (const t of TRACKS) r[t.id] = t.tiers[S.lv[t.id]].v;
    return r;
  }
  const harvestValue = (crop, r) => Math.round(crop.value * r.yield);
  const growSeconds = (crop, r) => crop.grow / r.water;

  // Work modes: 'all' does whichever step each plot needs; the others do only their own step.
  const MODES = ['all', 'plow', 'sow', 'harvest'];
  // One swing of the tool centred on plot (ci, cj). Every plot under it moves one step on:
  // grass is plowed, plowed soil is sown, a ripe crop goes into the bag. Plowing and sowing pay
  // nothing; the bag pays when you empty it at a barn. A full bag leaves ripe crops standing.
  function swing(S, F, ci, cj, r, changed){
    r = r || rates(S);
    const off = offsets(r.tool), seedIdx = CROPS.indexOf(cropById[S.seed]);
    const ripeAt = S.clock + growSeconds(CROPS[seedIdx], r);
    const m = S.mode || 'all', doPlow = m === 'all' || m === 'plow', doSow = m === 'all' || m === 'sow', doReap = m === 'all' || m === 'harvest';
    let got = 0, value = 0, n = 0, blocked = 0, weak = 0, poor = 0, skipped = 0, spent = 0, cleared = 0, plowed = 0, sowed = 0;
    const eh = S.eraHarv || (S.eraHarv = {});
    for (let o = 0; o < off.length; o += 2){
      const i = ci + off[o], j = cj + off[o + 1];
      if (i < 0 || j < 0 || i >= N || j >= N) continue;
      const k = j * N + i, st = F.st[k], rk = F.rock[k];
      if (rk){
        // A rock: only Plow mode can clear it, with a strong enough rock tool, and it costs coins.
        if (m !== 'plow'){ skipped++; continue; }
        if (r.rock < rk){ weak = Math.max(weak, rk); continue; }
        const fee = rockFee(S, rk);
        if (S.coins < fee){ poor = Math.max(poor, fee); continue; }
        S.coins -= fee; spent += fee; F.rock[k] = 0; cleared++; S.rocks = (S.rocks || 0) + 1;
        n++; if (changed) changed.push(k);
        continue;
      }
      if (st === WILD && doPlow){
        F.st[k] = PLOWED; plowed++;
        if (!F.ever[k]){ F.ever[k] = 1; S.worked++; }
      } else if (st === PLOWED && doSow){
        sowed++; F.st[k] = GROWING; F.crop[k] = seedIdx; F.ripe[k] = ripeAt; S.growing++; S.sown++;
      } else if (st === RIPE && doReap){
        if (S.bag >= r.bag){ blocked++; continue; }
        const cid = CROPS[F.crop[k]].id; eh[cid] = (eh[cid] || 0) + 1;
        F.st[k] = WILD; S.bag++; got++; value += harvestValue(CROPS[F.crop[k]], r); S.harvests++;
      } else if (m === 'plow' && (st === GROWING || st === RIPE)){
        // Plow mode turns crops under: growing or ripe, they go back to bare plowed soil and are lost.
        if (st === GROWING) S.growing--;
        F.st[k] = PLOWED; plowed++; S.plowedUnder = (S.plowedUnder || 0) + 1;
      } else continue;
      n++; if (changed) changed.push(k);
    }
    S.bagValue += value; S.eraPlow = (S.eraPlow || 0) + plowed;
    return {got, value, n, blocked, weak, poor, skipped, spent, cleared, plowed, sowed};
  }
  // What removing one rock costs now: bigger rocks and later ages cost more, better tools less.
  function rockFee(S, size){
    const tier = trackById.rock.tiers[S.lv.rock || 0];
    return nice(M[S.era - 1] * .02 * size * tier.fk);
  }
  function canSell(S){ return S.bag > 0 && nearestBarn(S.px, S.pz).dist <= SELL_RANGE; }
  function sell(S){
    if (!S.bag) return 0;
    const v = S.bagValue;
    S.coins += v; S.earned += v; S.sold += S.bag; S.bag = 0; S.bagValue = 0;
    return v;
  }
  function ripen(S, F, changed){
    if (!S.growing) return 0;
    let n = 0; const st = F.st, ripe = F.ripe, now = S.clock;
    for (let k = 0; k < st.length; k++) if (st[k] === GROWING && ripe[k] <= now){
      st[k] = RIPE; n++; if (changed) changed.push(k);
    }
    S.growing -= n;
    return n;
  }

  function nextTier(S, id){ const t = trackById[id]; return t.tiers[S.lv[id] + 1] || null; }
  function buy(S, id){
    const n = nextTier(S, id);
    if (!n || n.era > S.era || S.coins < n.cost) return false;
    S.coins -= n.cost; S.lv[id]++; return true;
  }
  function nextEra(S){ return ERAS[S.era] || null; }
  // Some ages also ask for work done during the current age before you may leave it:
  // plots plowed, and crops of given kinds harvested. Keyed by the age you are entering.
  const REQS = {
    3:  {plow:2000,   crops:{barley:2000}},
    4:  {crops:{cabbage:5000, barley:1000}},
    5:  {plow:12000,  crops:{potato:3000, tomato:8000}},
    6:  {crops:{cotton:20000}},
    8:  {plow:70000,  crops:{sunflower:60000, corn:10000}},
    9:  {crops:{soybean:100000}},
    10: {plow:150000, crops:{strawberry:150000}},
    12: {plow:300000, crops:{moonberry:300000, glowrice:20000}}
  };
  function reqStatus(S){
    const n = nextEra(S), q = n && REQS[n.id], out = [];
    if (!q) return out;
    if (q.plow) out.push({kind:'plow', label:'Plow plots', have:Math.min(S.eraPlow || 0, q.plow), need:q.plow});
    for (const id in (q.crops || {})) out.push({kind:'crop', id, label:'Harvest ' + cropById[id].name.toLowerCase(), have:Math.min((S.eraHarv || {})[id] || 0, q.crops[id]), need:q.crops[id]});
    return out;
  }
  const reqMet = S => reqStatus(S).every(r => r.have >= r.need);
  function advance(S){
    const n = nextEra(S);
    if (!n || S.coins < n.cost || !reqMet(S)) return false;
    S.coins -= n.cost; S.era = n.id; S.eraPlow = 0; S.eraHarv = {};
    const first = CROPS.find(c => c.era === n.id);
    if (first) S.seed = first.id;
    return true;
  }
  function setSeed(S, id){
    const c = cropById[id];
    if (!c || c.era > S.era) return false;
    S.seed = id; return true;
  }

  // Saving. The field is run-length encoded; crops still growing are saved as ripe.
  function pack(S, F){
    const runs = []; let prev = -1, len = 0;
    for (let k = 0; k < N * N; k++){
      const st = F.st[k] === GROWING ? RIPE : F.st[k];
      const v = st | (st === RIPE ? F.crop[k] << 2 : 0) | (F.ever[k] << 6) | (F.rock[k] << 7);
      if (v === prev) len++; else { if (len) runs.push(prev, len); prev = v; len = 1; }
    }
    runs.push(prev, len);
    const s = Object.assign({}, S, {lv:Object.assign({}, S.lv), growing:0});
    return {v:5, s, field:runs};
  }
  function unpack(d){
    const S = fresh(), F = freshField();
    if (!d || (d.v !== 3 && d.v !== 4 && d.v !== 5) || !d.s || !Array.isArray(d.field)) return {S, F};
    const s = d.s;
    S.coins = Math.max(0, +s.coins || 0);
    S.earned = Math.max(S.coins, +s.earned || 0);
    S.era = clamp(s.era | 0, 1, ERAS.length);
    S.harvests = Math.max(0, +s.harvests || 0);
    S.sown = Math.max(0, +s.sown || 0);
    S.done = !!s.done;
    S.bag = Math.max(0, +s.bag || 0); S.bagValue = Math.max(0, +s.bagValue || 0); S.sold = Math.max(0, +s.sold || 0);
    if (cropById[s.seed] && cropById[s.seed].era <= S.era) S.seed = s.seed;
    for (const t of TRACKS){
      const was = s.lv ? (t.id === 'bag' && s.lv.bag === undefined ? s.lv.pay : s.lv[t.id]) : 0;
      let l = clamp(was | 0, 0, t.tiers.length - 1);
      while (l > 0 && t.tiers[l].era > S.era) l--;
      S.lv[t.id] = l;
    }
    if (isFinite(s.px) && isFinite(s.pz)){ S.px = clamp(+s.px, .5, N - .5); S.pz = clamp(+s.pz, .5, N - .5); }
    if (isFinite(s.yaw)) S.yaw = +s.yaw;
    if (isFinite(s.pitch)) S.pitch = clamp(+s.pitch, -1.2, .5);
    S.work = s.work !== false;
    S.mode = MODES.includes(s.mode) ? s.mode : 'all';
    S.eraPlow = Math.max(0, +s.eraPlow || 0); S.eraHarv = {};
    if (s.eraHarv && typeof s.eraHarv === 'object') for (const id in s.eraHarv) if (cropById[id]) S.eraHarv[id] = Math.max(0, +s.eraHarv[id] || 0);
    let k = 0;
    for (let a = 0; a + 1 < d.field.length && k < N * N; a += 2){
      const v = d.field[a] | 0, len = d.field[a + 1] | 0, st = v & 3, crop = (v >> 2) & 15, ever = (v >> 6) & 1, rk = (v >> 7) & 7;
      for (let b = 0; b < len && k < N * N; b++, k++){
        F.st[k] = st === GROWING ? RIPE : st;
        F.crop[k] = crop < CROPS.length ? crop : 0;
        F.ever[k] = ever; if (ever) S.worked++;
        // Saves from before rocks keep the new rocks only where the ground was never touched.
        if (d.v >= 5) F.rock[k] = rk > 4 ? 0 : rk;
        else if (F.st[k] !== WILD || ever) F.rock[k] = 0;
      }
    }
    S.rocks = Math.max(0, +s.rocks || 0);
    return {S, F};
  }

  return {N, WILD, PLOWED, GROWING, RIPE, MODES, REQS, reqStatus, reqMet, ROCK_NAMES, rockFee, BARNS, SELL_RANGE, nearestBarn, canSell, sell, ERAS, CROPS, TRACKS, M, cropById, trackById, cellsIn, offsets, reprice,
    fresh, freshField, rates, harvestValue, growSeconds, swing, ripen, nextTier, buy, nextEra, advance, setSeed, pack, unpack};
})();
