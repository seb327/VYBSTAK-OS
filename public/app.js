const presets=[{name:"No Algorithm",desc:"Chronological, pure feed"},{name:"Friends First",desc:"Close network prioritised"},{name:"Discovery",desc:"Find new creators"},{name:"Originality First",desc:"High signal content"}];
const grid=document.getElementById("presetGrid");
const reactionStrip=document.getElementById("reactionStrip");
const wheel=document.getElementById("gestureWheel");
const saved=document.getElementById("savedSpaces");
let config={preset:"Originality First",ads:false,aesthetic:"Brutalist Creator OS"};

presets.forEach(p=>{
  const el=document.createElement("div");
  el.className="preset";
  el.innerHTML=`<strong>${p.name}</strong><br><small>${p.desc}</small>`;
  el.onclick=()=>{config.preset=p.name;document.getElementById("feedLabel").innerText=p.name;};
  grid.appendChild(el);
});

function renderReactions(){
  reactionStrip.innerHTML="";
  ["VYBZ","MEH","NOPE"].forEach(r=>{
    const b=document.createElement("button");
    b.textContent=r;
    reactionStrip.appendChild(b);
  });
}
renderReactions();

document.getElementById("toggleAds").onclick=()=>{
  config.ads=!config.ads;
  document.getElementById("adsLabel").innerText=config.ads?"On":"Off";
};

const aesthetics=["Brutalist Creator OS","Cinematic","High Energy","Deep Focus"];
let aIndex=0;
document.getElementById("cycleAesthetic").onclick=()=>{
  aIndex=(aIndex+1)%aesthetics.length;
  config.aesthetic=aesthetics[aIndex];
  document.getElementById("aestheticLabel").innerText=config.aesthetic;
};

const postSurface=document.getElementById("postSurface");
postSurface.onclick=(e)=>{
  wheel.classList.remove("hidden");
  wheel.style.left=e.clientX-110+"px";
  wheel.style.top=e.clientY-110+"px";
  wheel.innerHTML="🔥 🧠 🎯 🚫 🎥";
};
window.onclick=(e)=>{
  if(!e.target.closest("#postSurface"))wheel.classList.add("hidden");
};

function saveSpace(){
  const data={...config,name:document.getElementById("spaceName").innerText};
  const list=JSON.parse(localStorage.getItem("spaces")||"[]");
  list.push(data);
  localStorage.setItem("spaces",JSON.stringify(list));
  renderSaved();
}

document.getElementById("saveBtn").onclick=saveSpace;

function renderSaved(){
  saved.innerHTML="";
  const list=JSON.parse(localStorage.getItem("spaces")||"[]");
  list.forEach(s=>{
    const el=document.createElement("div");
    el.className="preset";
    el.innerHTML=`<strong>${s.name}</strong><br>${s.preset}`;
    saved.appendChild(el);
  });
}
renderSaved();

document.getElementById("generateBtn").onclick=async()=>{
  const input=document.getElementById("promptInput").value;
  const res=await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({task:"space-builder",input})});
  const data=await res.json();
  document.getElementById("promptStatus").innerText=data.text||"Generated";
};
