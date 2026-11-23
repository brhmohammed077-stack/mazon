const TOTAL_SLOTS = 30;
const EXCLUDED_NUMBERS = new Set([7, 8, 9]); // Secret prank: these numbered slots cannot win.
const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const entriesEl = document.getElementById("entries");
const spinBtn = document.getElementById("spinBtn");
const winnerEl = document.getElementById("winner");
const countEl = document.getElementById("count");
const wheelHint = document.getElementById("wheelHint");
const winnerModal = document.getElementById("winnerModal");
const modalWinner = document.getElementById("modalWinner");

const names = Array(TOTAL_SLOTS).fill("");
let wheelEntries = [];
let rotation = 0;
let spinning = false;

function getWheelEntries() {
  return names.map((name, index) => ({slot:index+1, name:name.trim()})).filter(entry => entry.name.length > 0);
}

function drawWheel() {
  const size=canvas.width, c=size/2, radius=c-8;
  ctx.clearRect(0,0,size,size);
  wheelEntries=getWheelEntries();

  if (!wheelEntries.length) {
    ctx.beginPath();ctx.arc(c,c,radius,0,Math.PI*2);ctx.fillStyle="#1b2a37";ctx.fill();
    ctx.strokeStyle="#e9a43b";ctx.lineWidth=7;ctx.stroke();
    ctx.fillStyle="#aab8c5";ctx.textAlign="center";ctx.textBaseline="middle";ctx.font="bold 27px Arial";
    ctx.fillText("ADD NAMES",c,c+105);
    wheelHint.textContent="أضف أسماء المشاركين لتظهر قطاعاتهم هنا";
    return;
  }

  const step=Math.PI*2/wheelEntries.length;
  const palette=["#1c2d3c","#30485a","#243b4d","#3a5264","#203444","#344b5d"];
  wheelEntries.forEach((entry,i)=>{
    const start=-Math.PI/2+i*step, end=start+step;
    ctx.beginPath();ctx.moveTo(c,c);ctx.arc(c,c,radius,start,end);ctx.closePath();
    ctx.fillStyle=palette[i%palette.length];ctx.fill();ctx.strokeStyle="#f3aa3d";
    ctx.lineWidth=Math.max(1.5,Math.min(3,180/wheelEntries.length));ctx.stroke();

    const mid=start+step/2, labelRadius=radius*(wheelEntries.length>14?.78:.68);
    const x=c+Math.cos(mid)*labelRadius, y=c+Math.sin(mid)*labelRadius;
    ctx.save();ctx.translate(x,y);ctx.rotate(mid+Math.PI/2);
    ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillStyle="#fff";
    const fontSize=wheelEntries.length>20?13:wheelEntries.length>12?17:wheelEntries.length>7?21:27;
    ctx.font=`bold ${fontSize}px Arial`;
    const maxChars=wheelEntries.length>20?7:wheelEntries.length>12?10:16;
    const shortName=entry.name.length>maxChars?entry.name.slice(0,maxChars-1)+"…":entry.name;
    ctx.fillText(shortName,0,0);
    if(wheelEntries.length<=12){ctx.font="bold 12px Arial";ctx.fillStyle="#ffc46a";ctx.fillText(`#${entry.slot}`,0,25);}
    ctx.restore();
  });
  ctx.beginPath();ctx.arc(c,c,radius,0,Math.PI*2);ctx.strokeStyle="#ffc15a";ctx.lineWidth=7;ctx.stroke();
  wheelHint.textContent=`${wheelEntries.length} مشارك في العجلة`;
}

function updateCount(){countEl.textContent=`${names.filter(n=>n.trim()).length} / ${TOTAL_SLOTS}`;}

function buildInputs(){
  entriesEl.innerHTML="";
  for(let i=0;i<TOTAL_SLOTS;i++){
    const row=document.createElement("label");row.className="entry";
    const number=document.createElement("span");number.className="entry-num";number.textContent=i+1;
    const input=document.createElement("input");input.type="text";input.maxLength=24;input.placeholder="اسم المشارك";input.value=names[i];
    input.setAttribute("aria-label",`اسم المشارك رقم ${i+1}`);
    input.addEventListener("input",()=>{names[i]=input.value;drawWheel();updateCount();});
    row.append(number,input);entriesEl.append(row);
  }
  updateCount();
}

function spin(){
  if(spinning)return;
  const entries=getWheelEntries();
  if(!entries.length){winnerEl.textContent="أدخل اسماً واحداً على الأقل";return;}
  // Empty slots do not appear. Filled slots 17, 18 and 19 appear, but cannot be selected.
  const eligible=entries.filter(entry=>!EXCLUDED_NUMBERS.has(entry.slot));
  if(!eligible.length){winnerEl.textContent="لا توجد أسماء مؤهلة للفوز";wheelHint.textContent="أضف اسماً في خانة أخرى غير 17 أو 18 أو 19";return;}

  const chosen=eligible[Math.floor(Math.random()*eligible.length)];
  const selectedIndex=entries.findIndex(entry=>entry.slot===chosen.slot);
  const segment=360/entries.length;
  const centerAngle=selectedIndex*segment+segment/2;
  const desiredMod=(360-centerAngle)%360;
  const currentMod=((rotation%360)+360)%360;
  const delta=(desiredMod-currentMod+360)%360;
  const extraTurns=6+Math.floor(Math.random()*4);
  const previousRotation=rotation;rotation+=extraTurns*360+delta;

  spinning=true;spinBtn.disabled=true;winnerEl.textContent="العجلة تدور...";
  canvas.style.transition="none";canvas.style.transform=`rotate(${previousRotation}deg)`;void canvas.offsetWidth;
  canvas.style.transition="transform 5.2s cubic-bezier(.12,.78,.12,1)";canvas.style.transform=`rotate(${rotation}deg)`;

  window.setTimeout(()=>{
    winnerEl.textContent=chosen.name;modalWinner.textContent=chosen.name;winnerModal.hidden=false;
    spinning=false;spinBtn.disabled=false;
  },5300);
}

spinBtn.addEventListener("click",spin);
document.getElementById("closeModal").addEventListener("click",()=>winnerModal.hidden=true);
winnerModal.addEventListener("click",event=>{if(event.target===winnerModal)winnerModal.hidden=true;});
document.getElementById("clearBtn").addEventListener("click",()=>{
  if(spinning)return;names.fill("");buildInputs();drawWheel();winnerEl.textContent="بانتظار القرعة...";
});
document.getElementById("fillBtn").addEventListener("click",()=>{
  if(spinning)return;names.forEach((_,i)=>{names[i]=`مشارك ${i+1}`;});buildInputs();drawWheel();
});
buildInputs();drawWheel();
