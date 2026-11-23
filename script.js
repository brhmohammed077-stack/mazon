const TOTAL = 30;
const EXCLUDED_NUMBERS = new Set([17, 18, 19]); // Hidden prank rule: these slots cannot win.
const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const entriesEl = document.getElementById("entries");
const spinBtn = document.getElementById("spinBtn");
const winnerEl = document.getElementById("winner");
const resultEl = document.getElementById("result");
const countEl = document.getElementById("count");

const names = Array(TOTAL).fill("");
let rotation = 0;
let spinning = false;

function drawWheel() {
  const size = canvas.width, c = size / 2, radius = c - 8;
  const step = Math.PI * 2 / TOTAL;
  ctx.clearRect(0, 0, size, size);

  for (let i = 0; i < TOTAL; i++) {
    const start = -Math.PI / 2 + i * step;
    const end = start + step;
    const gradient = ctx.createLinearGradient(c + Math.cos(start)*radius, c + Math.sin(start)*radius, c + Math.cos(end)*radius, c + Math.sin(end)*radius);
    gradient.addColorStop(0, i % 2 ? "#263b4d" : "#1c2d3c");
    gradient.addColorStop(1, i % 2 ? "#344d60" : "#293f51");
    ctx.beginPath(); ctx.moveTo(c,c); ctx.arc(c,c,radius,start,end); ctx.closePath();
    ctx.fillStyle = gradient; ctx.fill();
    ctx.strokeStyle = "#f3aa3d"; ctx.lineWidth = 2; ctx.stroke();

    const mid = start + step / 2;
    const labelRadius = radius * 0.78;
    const x = c + Math.cos(mid) * labelRadius;
    const y = c + Math.sin(mid) * labelRadius;
    ctx.save(); ctx.translate(x,y); ctx.rotate(mid + Math.PI/2);
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff"; ctx.font = "bold 27px Arial";
    ctx.fillText(String(i+1), 0, 0);
    const name = names[i].trim();
    if (name) {
      ctx.font = "bold 13px Arial";
      ctx.fillStyle = "#ffc46a";
      const shortName = name.length > 11 ? name.slice(0,10) + "…" : name;
      ctx.fillText(shortName, 0, 28);
    }
    ctx.restore();
  }
  ctx.beginPath(); ctx.arc(c,c,radius,0,Math.PI*2); ctx.strokeStyle="#ffc15a"; ctx.lineWidth=7; ctx.stroke();
  for(let i=0;i<TOTAL;i++){
    const a=-Math.PI/2+i*step;
    ctx.beginPath();ctx.arc(c+Math.cos(a)*(radius-5),c+Math.sin(a)*(radius-5),4,0,Math.PI*2);
    ctx.fillStyle="#ffe0a8";ctx.fill();
  }
}

function buildInputs() {
  entriesEl.innerHTML = "";
  for (let i=0;i<TOTAL;i++) {
    const row=document.createElement("label"); row.className="entry";
    const number=document.createElement("span"); number.className="entry-num"; number.textContent=i+1;
    const input=document.createElement("input"); input.type="text"; input.maxLength=24;
    input.placeholder="اسم المشارك"; input.value=names[i]; input.setAttribute("aria-label",`اسم المشارك رقم ${i+1}`);
    input.addEventListener("input",()=>{names[i]=input.value;drawWheel();updateCount();});
    row.append(number,input); entriesEl.append(row);
  }
  updateCount();
}
function updateCount(){countEl.textContent=`${names.filter(n=>n.trim()).length} / ${TOTAL}`;}

function spin() {
  if (spinning) return;
  const eligible = Array.from({length:TOTAL},(_,i)=>i).filter(i=>!EXCLUDED_NUMBERS.has(i+1));
  const selectedIndex = eligible[Math.floor(Math.random()*eligible.length)];
  const segment = 360 / TOTAL;
  // Segment 1 starts at the top. Align the selected segment's center with the fixed top pointer.
  const centerAngle = selectedIndex * segment + segment/2;
  const desiredMod = (360 - centerAngle) % 360;
  const currentMod = ((rotation % 360) + 360) % 360;
  const delta = (desiredMod - currentMod + 360) % 360;
  const extraTurns = 6 + Math.floor(Math.random()*4);
  rotation += extraTurns*360 + delta;

  spinning=true;spinBtn.disabled=true;winnerEl.textContent="العجلة تدور...";
  resultEl.classList.remove("winner-pop");
  canvas.style.transition="none";
  canvas.style.transform=`rotate(${((rotation-delta-extraTurns*360)%360)}deg)`;
  void canvas.offsetWidth;
  canvas.style.transition="transform 5.2s cubic-bezier(.12,.78,.12,1)";
  canvas.style.transform=`rotate(${rotation}deg)`;

  window.setTimeout(()=>{
    const number=selectedIndex+1;
    const name=names[selectedIndex].trim();
    winnerEl.textContent=name ? `${name} — رقم ${number}` : `الرقم ${number}`;
    resultEl.classList.add("winner-pop");
    spinning=false;spinBtn.disabled=false;
  },5300);
}

spinBtn.addEventListener("click",spin);
document.getElementById("clearBtn").addEventListener("click",()=>{
  if(spinning)return; names.fill("");buildInputs();drawWheel();winnerEl.textContent="بانتظار القرعة...";
});
document.getElementById("fillBtn").addEventListener("click",()=>{
  if(spinning)return;
  names.forEach((_,i)=>{names[i]=`مشارك ${i+1}`;});
  buildInputs();drawWheel();
});
buildInputs();drawWheel();
