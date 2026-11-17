(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height, floor = 442;
  const ui = {
    p1: document.getElementById('p1-health'), p2: document.getElementById('p2-health'),
    d1: document.getElementById('p1-dragon'), d2: document.getElementById('p2-dragon'),
    dt1: document.getElementById('p1-dragon-text'), dt2: document.getElementById('p2-dragon-text'),
    message: document.getElementById('message')
  };
  const keys = Object.create(null), held = new Set();
  let projectiles = [], particles = [], gameOver = false, started = false, last = 0;
  const makeFighter = (x, color, facing, isAI=false) => ({
    x, y: floor, vx:0, vy:0, color, facing, hp:100, dragonHp:100,
    attack:0, cooldown:0, fireCooldown:0, specialCooldown:0, invuln:0,
    blocking:false, isAI, onGround:true, dragonX:x-45, dragonY:floor-38,
    dragonAttack:0
  });
  let blue, red;
  function reset(){
    blue=makeFighter(250,'#46b6ff',1); red=makeFighter(710,'#ff626e',-1,true);
    projectiles=[];particles=[];gameOver=false;started=false;
    ui.message.classList.remove('hidden');
    ui.message.innerHTML='BLUE VS RED<br><small>Tap any control to begin!</small>';
    updateHud();
  }
  function updateHud(){
    ui.p1.style.width=blue.hp+'%'; ui.p2.style.width=red.hp+'%';
    ui.d1.style.width=blue.dragonHp+'%'; ui.d2.style.width=red.dragonHp+'%';
    ui.dt1.textContent=Math.ceil(blue.dragonHp); ui.dt2.textContent=Math.ceil(red.dragonHp);
  }
  function say(text){ui.message.innerHTML=text;ui.message.classList.remove('hidden');}
  function begin(){if(!started&&!gameOver){started=true;ui.message.classList.add('hidden');}}
  function spawnFire(owner, special=false){
    const dir=owner.facing, x=owner.x+dir*35, y=owner.y-65;
    projectiles.push({x,y,vx:dir*(special?8:6),owner,damage:special?19:11,r:special?17:11,life:100,special});
    for(let i=0;i<8;i++) particles.push({x,y,vx:dir*(Math.random()*3),vy:(Math.random()-.5)*3,life:20,color:special?'#b78cff':'#ff9b42'});
  }
  function hit(attacker, defender, damage){
    if(defender.invuln>0)return;
    if(defender.blocking) damage*=.25;
    defender.hp=Math.max(0,defender.hp-damage); defender.invuln=16;
    defender.vx=attacker.facing*5;
    for(let i=0;i<9;i++)particles.push({x:defender.x,y:defender.y-55,vx:(Math.random()-.5)*6,vy:-Math.random()*4,life:22,color:'#ffe08a'});
  }
  function doAction(f, action){
    begin(); if(gameOver)return;
    if(action==='attack'&&f.cooldown<=0){f.attack=13;f.cooldown=32;}
    if(action==='fire'&&f.fireCooldown<=0&&f.dragonHp>0){spawnFire(f);f.fireCooldown=65;f.dragonHp=Math.max(0,f.dragonHp-5);}
    if(action==='special'&&f.specialCooldown<=0&&f.dragonHp>=25){spawnFire(f,true);f.specialCooldown=150;f.dragonHp-=25;f.dragonAttack=30;}
    if(action==='jump'&&f.onGround){f.vy=-12;f.onGround=false;}
  }
  function updateFighter(f, opponent, dt){
    f.cooldown=Math.max(0,f.cooldown-dt);f.fireCooldown=Math.max(0,f.fireCooldown-dt);
    f.specialCooldown=Math.max(0,f.specialCooldown-dt);f.invuln=Math.max(0,f.invuln-dt);
    f.attack=Math.max(0,f.attack-dt);f.dragonAttack=Math.max(0,f.dragonAttack-dt);
    f.facing=opponent.x>=f.x?1:-1;
    f.blocking=!!keys[f===blue?'block':'aiBlock'];
    let move=0;
    if(f===blue){if(keys.left)move--;if(keys.right)move++;}
    else {
      const dist=opponent.x-f.x;
      if(Math.abs(dist)>105)move=Math.sign(dist);
      if(Math.abs(dist)<115&&Math.random()<.018)doAction(f,'attack');
      if(Math.random()<.006)doAction(f,'fire');
      if(Math.random()<.002)doAction(f,'special');
      f.blocking=Math.abs(dist)<90&&Math.random()<.35;
    }
    if(move){f.vx=move*3.1;f.x+=f.vx*dt/1.5;}else f.vx*=.78;
    f.x=Math.max(55,Math.min(W-55,f.x));
    f.vy+=.58*dt; f.y+=f.vy*dt/1.5;
    if(f.y>=floor){f.y=floor;f.vy=0;f.onGround=true;}
    // Dragon companion follows its owner with a little floating motion.
    const targetX=f.x-f.facing*48;
    f.dragonX+=(targetX-f.dragonX)*.12;
    f.dragonY+=(f.y-42+Math.sin(performance.now()/190+(f===blue?0:2))*7-f.dragonY)*.12;
    if(f.attack>5&&Math.abs(f.x-opponent.x)<95&&Math.abs(f.y-opponent.y)<55){
      if(f.attack>10){hit(f,opponent,9);f.attack=5;}
    }
  }
  function update(dt){
    if(!started||gameOver)return;
    updateFighter(blue,red,dt);updateFighter(red,blue,dt);
    projectiles.forEach(p=>{
      p.x+=p.vx*dt/1.5;p.life-=dt;
      const target=p.owner===blue?red:blue;
      if(Math.abs(p.x-target.x)<p.r+22&&Math.abs(p.y-(target.y-58))<38&&p.life>0){
        hit(p.owner,target,p.damage);p.life=0;
      }
    });
    projectiles=projectiles.filter(p=>p.life>0&&p.x>-20&&p.x<W+20);
    particles.forEach(p=>{p.x+=p.vx*dt/1.5;p.y+=p.vy*dt/1.5;p.vy+=.12*dt;p.life-=dt;});
    particles=particles.filter(p=>p.life>0);
    if(blue.hp<=0||red.hp<=0){gameOver=true;say(blue.hp>0?'🏆 BLUE TEAM WINS!<br><small>Tap ↻ to play again</small>':'🏆 RED TEAM WINS!<br><small>Tap ↻ to play again</small>');}
    updateHud();
  }
  function line(x1,y1,x2,y2,color,width=6){
    ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
  }
  function drawFighter(f){
    const c=f.color, x=f.x,y=f.y;
    ctx.save();ctx.globalAlpha=f.invuln>0&&Math.floor(f.invuln/3)%2?.45:1;
    // shadow
    ctx.fillStyle='#06101c66';ctx.beginPath();ctx.ellipse(x,floor+5,27,7,0,0,Math.PI*2);ctx.fill();
    // head and body
    ctx.fillStyle=c;ctx.beginPath();ctx.arc(x,y-91,13,0,Math.PI*2);ctx.fill();
    line(x,y-77,x,y-39,c,7);
    const armY=y-68, reach=f.attack>0?f.facing*37: f.facing*18;
    line(x,armY,x-reach*.45,armY+17,c,6);line(x,armY,x+reach,armY-5,c,6);
    line(x,y-39,x-15,y-4,c,7);line(x,y-39,x+17,y-4,c,7);
    if(f.attack>0){line(x+f.facing*25,y-74,x+f.facing*67,y-74,'#e5edf7',4);ctx.fillStyle='#d7e6f5';ctx.fillRect(x+f.facing*63,y-78,8,8);}
    if(f.blocking){ctx.strokeStyle='#9be2ff';ctx.lineWidth=5;ctx.beginPath();ctx.arc(x+f.facing*22,y-65,25,-1.1,1.1);ctx.stroke();}
    ctx.restore();
  }
  function drawDragon(f){
    const x=f.dragonX,y=f.dragonY,c=f===blue?'#5dd5ff':'#ff8a75';
    ctx.save();ctx.translate(x,y);ctx.scale(f.facing,1);
    // wings
    ctx.fillStyle=c;ctx.globalAlpha=.8;ctx.beginPath();ctx.moveTo(-5,-7);ctx.lineTo(-27,-35);ctx.lineTo(-19,-4);ctx.lineTo(-38,7);ctx.lineTo(-5,8);ctx.fill();
    ctx.globalAlpha=1;ctx.beginPath();ctx.ellipse(0,0,22,12,0,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(17,-5,9,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(20,-8,2.5,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(23,-12);ctx.lineTo(27,-22);ctx.lineTo(30,-10);ctx.fill();
    line(-16,5,-28,13,c,3);ctx.restore();
  }
  function draw(){
    const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#152d4a');g.addColorStop(.68,'#294b68');g.addColorStop(.69,'#263b36');g.addColorStop(1,'#172b2a');
    ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    // distant mountains
    ctx.fillStyle='#1c3852';ctx.beginPath();ctx.moveTo(0,360);ctx.lineTo(130,210);ctx.lineTo(250,360);ctx.lineTo(390,235);ctx.lineTo(540,360);ctx.lineTo(690,205);ctx.lineTo(850,360);ctx.lineTo(960,250);ctx.lineTo(960,450);ctx.lineTo(0,450);ctx.fill();
    ctx.fillStyle='#345344';ctx.fillRect(0,floor+5,W,H-floor);
    for(let x=0;x<W;x+=50){ctx.fillStyle='#52745a';ctx.fillRect(x,floor+22,24,3);}
    // arena center mark
    ctx.strokeStyle='#9bbd9b55';ctx.lineWidth=3;ctx.beginPath();ctx.arc(W/2,floor,80,Math.PI,0);ctx.stroke();
    drawDragon(blue);drawDragon(red);drawFighter(blue);drawFighter(red);
    projectiles.forEach(p=>{ctx.fillStyle=p.special?'#bd8aff':'#ff9c3e';ctx.shadowBlur=18;ctx.shadowColor=ctx.fillStyle;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;});
    particles.forEach(p=>{ctx.globalAlpha=Math.max(0,p.life/22);ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,3,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;});
    // labels
    ctx.font='bold 15px system-ui';ctx.textAlign='center';ctx.fillStyle='#dff5ff';ctx.fillText('BLUE + DRAGON',blue.x,floor+42);ctx.fillStyle='#ffe5e5';ctx.fillText('RED + DRAGON',red.x,floor+42);
  }
  function loop(t){const dt=Math.min(2,(t-last)/16.67||1);last=t;update(dt);draw();requestAnimationFrame(loop);}
  document.querySelectorAll('[data-action]').forEach(btn=>{
    const action=btn.dataset.action;
    const down=e=>{e.preventDefault();begin();btn.classList.add('active');if(['left','right','block'].includes(action))keys[action]=true;else doAction(blue,action);};
    const up=e=>{e.preventDefault();btn.classList.remove('active');if(['left','right','block'].includes(action))keys[action]=false;};
    btn.addEventListener('pointerdown',down);btn.addEventListener('pointerup',up);btn.addEventListener('pointerleave',up);btn.addEventListener('pointercancel',up);
  });
  window.addEventListener('keydown',e=>{const map={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'jump',KeyA:'attack',KeyS:'fire',KeyD:'special',KeyW:'block'};if(map[e.code]){keys[map[e.code]]=true;if(['jump','attack','fire','special'].includes(map[e.code]))doAction(blue,map[e.code]);}});
  window.addEventListener('keyup',e=>{const map={ArrowLeft:'left',ArrowRight:'right',KeyW:'block'};if(map[e.code])keys[map[e.code]]=false;});
  document.getElementById('restart').addEventListener('click',reset);
  reset();requestAnimationFrame(loop);
})();