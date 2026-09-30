(() => {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "back-to-top";
  b.setAttribute("aria-label","Back to top");
  b.textContent = "↑";
  document.body.append(b);
  const update = () => b.classList.toggle("is-visible", window.scrollY > 400);
  b.addEventListener("click", () => window.scrollTo({top:0,behavior:"smooth"}));
  addEventListener("scroll", update, {passive:true});
  update();
})();

(() => {
  const stage=document.getElementById('hero-orb-stage');
  const canvas=document.getElementById('hero-orb-canvas');
  const orb=document.getElementById('web-orb');
  if(!stage||!canvas||!orb)return;
  const ctx=canvas.getContext('2d');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let cssW=0,cssH=0,dpr=1,activation=0,activationStart=performance.now(),activationFrom=0,activationTo=0,activationDuration=420,activePointer=null,lastPulseSeconds=0;
  const startedAt=performance.now()/1000;
  const pulses=[{originY:0,bornSeconds:0,durationSeconds:7.2,intensity:.72}];
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const lerp=(a,b,t)=>a+(b-a)*t;
  const easeOutCubic=t=>1-Math.pow(1-t,3);
  function resize(){const r=stage.getBoundingClientRect();cssW=Math.max(1,r.width);cssH=Math.max(1,r.height);dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(cssW*dpr);canvas.height=Math.round(cssH*dpr);canvas.style.width=cssW+'px';canvas.style.height=cssH+'px';ctx.setTransform(dpr,0,0,dpr,0,0)}
  new ResizeObserver(resize).observe(stage);resize();
  function setActivation(target){activationFrom=activation;activationTo=target;activationStart=performance.now();activationDuration=target>activation?190:420}
  function spawnWave(intensity,durationSeconds){const now=performance.now()/1000-startedAt;lastPulseSeconds=now;while(pulses.length>=5)pulses.shift();pulses.push({originY:0,bornSeconds:now,durationSeconds,intensity})}
  function awaken(e){if(e&&e.pointerId!=null){activePointer=e.pointerId;try{orb.setPointerCapture(e.pointerId)}catch(_){}}setActivation(1);spawnWave(1.35,4.5)}
  function sleep(e){if(e&&activePointer!==null&&e.pointerId!=null&&e.pointerId!==activePointer)return;activePointer=null;setActivation(0)}
  orb.addEventListener('pointerdown',awaken);orb.addEventListener('pointerup',sleep);orb.addEventListener('pointercancel',sleep);orb.addEventListener('lostpointercapture',sleep);orb.addEventListener('contextmenu',e=>e.preventDefault());
  orb.addEventListener('keydown',e=>{if((e.key===' '||e.key==='Enter')&&!e.repeat){e.preventDefault();awaken()}});orb.addEventListener('keyup',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();sleep()}});orb.addEventListener('blur',()=>sleep());
  function rgba(hex,a){const n=parseInt(hex.slice(1),16);return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${a})`}
  function drawRing(cx,cy,radius,alpha,act){if(radius<1)return;let grad;if(ctx.createConicGradient){grad=ctx.createConicGradient(-Math.PI/2,cx,cy);grad.addColorStop(0,rgba('#003C9D',alpha*.82));grad.addColorStop(.5,rgba('#078CF4',alpha));grad.addColorStop(1,rgba('#003C9D',alpha*.82))}else grad=rgba('#078CF4',alpha);ctx.save();ctx.strokeStyle=grad;ctx.lineWidth=2.2+act*2;ctx.shadowColor=rgba('#078CF4',alpha*.82);ctx.shadowBlur=3+act*6;ctx.beginPath();ctx.arc(cx,cy,radius,0,Math.PI*2);ctx.stroke();ctx.restore();ctx.save();ctx.strokeStyle=grad;ctx.lineWidth=.9+act*.8;ctx.beginPath();ctx.arc(cx,cy,radius,0,Math.PI*2);ctx.stroke();ctx.restore()}
  function drawSparkField(cx,cy,ambient,act){if(act<=.01)return;for(const half of[-1,1]){const fieldX=cssW/2,fieldY=cssH/2+half*cssH*.36;for(let i=0;i<8;i++){const angle=i*2.17+half*.43,spreadX=42+(i%5)*25,spreadY=30+(i%4)*24,sx=fieldX+Math.cos(angle)*spreadX,sy=fieldY+Math.sin(angle*1.31)*spreadY,dist=Math.hypot(sx-cx,sy-cy),proximity=clamp(1-dist/205,0,1);if(proximity<=0)continue;const twinkle=(Math.sin(ambient*Math.PI*2+i*1.73+half)+1)/2,strength=act*easeOutCubic(proximity)*(.40+twinkle*.34),glowRadius=2.4+twinkle*3.2;ctx.save();ctx.fillStyle=rgba('#006FE8',strength*.34);ctx.shadowColor=rgba('#006FE8',strength*.55);ctx.shadowBlur=4+twinkle*3;ctx.beginPath();ctx.arc(sx,sy,glowRadius,0,Math.PI*2);ctx.fill();ctx.restore();ctx.save();ctx.fillStyle=rgba('#62C7FF',strength);ctx.beginPath();ctx.arc(sx,sy,.85+twinkle*.85,0,Math.PI*2);ctx.fill();ctx.restore()}}}
  function frame(nowMs){const nowSeconds=nowMs/1000-startedAt,ambient=((nowSeconds%9)+9)%9/9,elapsed=nowMs-activationStart,t=activationDuration<=0?1:clamp(elapsed/activationDuration,0,1),eased=easeOutCubic(t);activation=lerp(activationFrom,activationTo,eased);const active=activation>.05,interval=active?1.15:2.10;if(!reduced&&nowSeconds-lastPulseSeconds>=interval)spawnWave(active?1.05:.68,active?4.2:7.0);const energy=.72+activation*.28,driftX=reduced?0:Math.sin(ambient*Math.PI*4)*3.6*energy,driftY=reduced?0:Math.sin(ambient*Math.PI*6+.85)*3*energy,breath=reduced?0:Math.sin(ambient*Math.PI*4+1.15),baseScale=1+activation*.18,orbScale=baseScale*(1+breath*(.007+activation*.005));orb.style.setProperty('--orb-x',`${driftX}px`);orb.style.setProperty('--orb-y',`${driftY}px`);orb.style.setProperty('--orb-scale',orbScale.toFixed(5));orb.style.setProperty('--orb-activation',activation.toFixed(4));ctx.clearRect(0,0,cssW,cssH);const cx=cssW/2+driftX,cy=cssH/2+driftY;if(activation>.01){const r=Math.min(cssW,cssH)*(.39+activation*.05),glow=ctx.createRadialGradient(cx,cy,0,cx,cy,r);glow.addColorStop(0,rgba('#38B5FF',.48*activation));glow.addColorStop(.45,rgba('#006FE8',.27*activation));glow.addColorStop(.72,rgba('#003C9D',.09*activation));glow.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=glow;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill()}for(let i=pulses.length-1;i>=0;i--){const p=pulses[i],age=nowSeconds-p.bornSeconds;if(age>p.durationSeconds){pulses.splice(i,1);continue}if(age<0)continue;const phase=clamp(age/p.durationSeconds,0,1),maxRadius=Math.max(cssW,cssH)*.68,radius=52+phase*maxRadius,alpha=clamp(p.intensity*Math.pow(1-phase,1.12)*(.34+activation*.50),0,1);drawRing(cssW/2,cssH/2+p.originY,radius,alpha,activation)}drawSparkField(cx,cy,ambient,activation);requestAnimationFrame(frame)}
  requestAnimationFrame(frame);
})();


(() => {
  const stage = document.getElementById('hero-orb-stage');
  const canvas = document.getElementById('hero-orb-canvas');
  const orb = document.getElementById('web-orb');
  if (!stage || !canvas || !orb) return;

  const ctx = canvas.getContext('2d');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let cssW = 0;
  let cssH = 0;
  let dpr = 1;
  let activation = 0;
  let activationStart = 0;
  let activationFrom = 0;
  let activationTo = 0;
  let activationDuration = 900;
  let activePointer = null;
  let lastPulseSeconds = 0;
  const startedAt = performance.now() / 1000;
  const pulses = [{originY:0,bornSeconds:0,durationSeconds:8.2,intensity:.62}];

  const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
  const lerp = (a,b,t) => a+(b-a)*t;
  const easeOut = t => 1-Math.pow(1-t,3);
  const easeInOut = t => t < .5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2;

  function resize(){
    const r = stage.getBoundingClientRect();
    cssW = Math.max(1,r.width);
    cssH = Math.max(1,r.height);
    dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(cssW*dpr);
    canvas.height = Math.round(cssH*dpr);
    canvas.style.width = cssW+'px';
    canvas.style.height = cssH+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  new ResizeObserver(resize).observe(stage);
  resize();

  function setActivation(target){
    const now = performance.now();
    activationFrom = activation;
    activationTo = target;
    activationStart = now;
    activationDuration = target > activation ? 340 : 720;
  }

  function spawnWave(intensity,durationSeconds){
    const now = performance.now()/1000-startedAt;
    lastPulseSeconds = now;
    while(pulses.length >= 9) pulses.shift();
    pulses.push({originY:0,bornSeconds:now,durationSeconds,intensity});
  }

  function awaken(e){
    if (e && e.pointerId != null){
      activePointer = e.pointerId;
      try{ orb.setPointerCapture(e.pointerId); }catch(_){}
    }
    setActivation(1);
    spawnWave(.88,6.2);
  }
  function sleep(e){
    if (e && activePointer !== null && e.pointerId != null && e.pointerId !== activePointer) return;
    activePointer = null;
    setActivation(0);
  }

  orb.addEventListener('pointerdown', awaken);
  orb.addEventListener('pointerup', sleep);
  orb.addEventListener('pointercancel', sleep);
  orb.addEventListener('lostpointercapture', sleep);
  orb.addEventListener('contextmenu', e => e.preventDefault());
  orb.addEventListener('keydown', e => {
    if ((e.key === ' ' || e.key === 'Enter') && !e.repeat){
      e.preventDefault();
      awaken();
    }
  });
  orb.addEventListener('keyup', e => {
    if (e.key === ' ' || e.key === 'Enter'){
      e.preventDefault();
      sleep();
    }
  });
  orb.addEventListener('blur', () => sleep());

  function rgba(hex,alpha){
    const n = parseInt(hex.slice(1),16);
    return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${alpha})`;
  }

  function drawRing(cx,cy,radius,alpha,act){
    if (radius < 1) return;
    let grad;
    if (ctx.createConicGradient){
      grad = ctx.createConicGradient(-Math.PI/2,cx,cy);
      grad.addColorStop(0,rgba('#003C9D',alpha*.70));
      grad.addColorStop(.5,rgba('#078CF4',alpha));
      grad.addColorStop(1,rgba('#003C9D',alpha*.70));
    } else {
      grad = rgba('#078CF4',alpha);
    }

    ctx.save();
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.45 + act*1.45;
    ctx.shadowColor = rgba('#078CF4',alpha*.52);
    ctx.shadowBlur = 2 + act*5;
    ctx.beginPath();
    ctx.arc(cx,cy,radius,0,Math.PI*2);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = grad;
    ctx.lineWidth = .55 + act*.55;
    ctx.beginPath();
    ctx.arc(cx,cy,radius,0,Math.PI*2);
    ctx.stroke();
    ctx.restore();
  }

  function drawSparkField(cx,cy,ambient,act){
    if (act <= .08) return;
    for (const half of [-1,1]){
      const fieldX = cssW * (cssW <= 760 ? 0.50 : 0.72);
      const fieldY = cssH/2 + half*cssH*.28;
      for (let i=0;i<8;i++){
        const angle = i*2.17 + half*.43;
        const spreadX = 42 + (i%5)*25;
        const spreadY = 30 + (i%4)*24;
        const sx = fieldX + Math.cos(angle)*spreadX;
        const sy = fieldY + Math.sin(angle*1.31)*spreadY;
        const dist = Math.hypot(sx-cx,sy-cy);
        const proximity = clamp(1-dist/235,0,1);
        if (proximity <= 0) continue;
        const twinkle = (Math.sin(ambient*Math.PI*2 + i*1.73 + half)+1)/2;
        const strength = act * easeOut(proximity) * (.18 + twinkle*.18);
        const glowRadius = 2.1 + twinkle*2.6;

        ctx.save();
        ctx.fillStyle = rgba('#006FE8',strength*.24);
        ctx.shadowColor = rgba('#006FE8',strength*.38);
        ctx.shadowBlur = 3 + twinkle*2.5;
        ctx.beginPath();
        ctx.arc(sx,sy,glowRadius,0,Math.PI*2);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.fillStyle = rgba('#62C7FF',strength*.95);
        ctx.beginPath();
        ctx.arc(sx,sy,.8+twinkle*.65,0,Math.PI*2);
        ctx.fill();
        ctx.restore();
      }
    }
  }

  function frame(nowMs){
    const nowSeconds = nowMs/1000-startedAt;
    const ambient = ((nowSeconds % 9)+9)%9 / 9;

    const elapsed = nowMs-activationStart;
    const t = activationDuration <= 0 ? 1 : clamp(elapsed/activationDuration,0,1);
    const eased = activationTo > activationFrom ? easeInOut(t) : easeInOut(t);
    activation = lerp(activationFrom,activationTo,eased);

    const active = activation > .16;
    const interval = active ? 1.52 : 2.35;
    if (!reduced && nowSeconds-lastPulseSeconds >= interval){
      spawnWave(active ? .86 : .58, active ? 5.4 : 8.0);
    }

    const energy = .72 + activation*.20;
    const driftX = reduced ? 0 : Math.sin(ambient*Math.PI*4)*3.3*energy;
    const driftY = reduced ? 0 : Math.sin(ambient*Math.PI*6+.85)*2.7*energy;
    const breath = reduced ? 0 : Math.sin(ambient*Math.PI*4+1.15);
    const baseScale = 1 + activation*.105;
    const orbScale = baseScale*(1 + breath*(.006 + activation*.0045));

    orb.style.setProperty('--orb-x',`${driftX}px`);
    orb.style.setProperty('--orb-y',`${driftY}px`);
    orb.style.setProperty('--orb-scale',orbScale.toFixed(5));
    orb.style.setProperty('--orb-activation',activation.toFixed(4));

    ctx.clearRect(0,0,cssW,cssH);

    const cx = cssW * (cssW <= 760 ? 0.50 : 0.72) + driftX;
    const cy = cssH/2 + driftY;

    if (activation > .01){
      const r = Math.max(cssW,cssH)*(.28 + activation*.06);
      const glow = ctx.createRadialGradient(cx,cy,0,cx,cy,r);
      glow.addColorStop(0,rgba('#38B5FF',.22*activation));
      glow.addColorStop(.40,rgba('#006FE8',.12*activation));
      glow.addColorStop(.74,rgba('#003C9D',.05*activation));
      glow.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx,cy,r,0,Math.PI*2);
      ctx.fill();
    }

    for (let i=pulses.length-1;i>=0;i--){
      const p = pulses[i];
      const age = nowSeconds-p.bornSeconds;
      if (age > p.durationSeconds){
        pulses.splice(i,1);
        continue;
      }
      if (age < 0) continue;
      const phase = clamp(age/p.durationSeconds,0,1);
      const maxRadius = Math.hypot(cssW, cssH) * 0.82;
      const radius = 50 + phase*maxRadius;
      const alpha = clamp(
        p.intensity*Math.pow(1-phase,1.10)*(.26+activation*.34),
        0,1
      );
      drawRing(cx,cy,radius,alpha,activation);
    }

    drawSparkField(cx,cy,ambient,activation);
    requestAnimationFrame(frame);
  }

  if (reduced){
    spawnWave(.50,8.0);
  }
  requestAnimationFrame(frame);
})();
