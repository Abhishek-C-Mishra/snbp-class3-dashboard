const STORAGE_KEY = "schoolDashboard.events.v1";
const TT_KEY = "schoolDashboard.timetable.v1";

const defaultEvents = [
  {id:crypto.randomUUID(),type:"homework",title:"Maths Chapter 5 Exercises",subject:"Mathematics",date:todayISO(),priority:"high",action:"yes",description:"Complete exercises 1–10."},
  {id:crypto.randomUUID(),type:"exam",title:"Science Unit Test",subject:"Science",date:addDaysISO(2),priority:"high",action:"yes",description:"Revise Chapters 3 and 4. Bring lab notebook."},
  {id:crypto.randomUUID(),type:"notice",title:"School Holiday",subject:"School",date:addDaysISO(4),priority:"low",action:"no",description:"School will remain closed."},
  {id:crypto.randomUUID(),type:"activity",title:"Football Practice",subject:"Sports",date:addDaysISO(3),priority:"medium",action:"yes",description:"Bring sports shoes and water bottle."}
];

const defaultTT = {
  Monday:[["08:00","Mathematics"],["09:00","English"],["10:00","Science"],["11:00","Physical Education"]],
  Tuesday:[["08:00","Science"],["09:00","Mathematics"],["10:00","Art"],["11:00","English"]],
  Wednesday:[["08:00","English"],["09:00","Mathematics"],["10:00","Computer"],["11:00","Science"]],
  Thursday:[["08:00","Mathematics"],["09:00","Hindi"],["10:00","Science"],["11:00","Sports"]],
  Friday:[["08:00","Science"],["09:00","English"],["10:00","Mathematics"],["11:00","Art"]]
};

let events = load(STORAGE_KEY, defaultEvents);
let timetable = load(TT_KEY, defaultTT);

function todayISO(){return new Date().toISOString().slice(0,10)}
function addDaysISO(n){const d=new Date();d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)}
function load(key,fallback){try{const v=JSON.parse(localStorage.getItem(key));return v ?? fallback}catch{return fallback}}
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(events));localStorage.setItem(TT_KEY,JSON.stringify(timetable))}
function dateObj(s){const [y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d)}
function formatDate(s){return dateObj(s).toLocaleDateString(undefined,{day:"numeric",month:"short",year:"numeric"})}
function dayName(s){return dateObj(s).toLocaleDateString(undefined,{weekday:"long"})}
function escapeHTML(s=""){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function typeLabel(t){return t[0].toUpperCase()+t.slice(1)}
function inNext10(e){const start=dateObj(todayISO()), d=dateObj(e.date);const diff=Math.round((d-start)/86400000);return diff>=0&&diff<=10}
function sortedUpcoming(list){return [...list].sort((a,b)=>a.date.localeCompare(b.date)||a.priority.localeCompare(b.priority))}
function getFiltered(){
  const tf=document.getElementById("typeFilter").value, pf=document.getElementById("priorityFilter").value;
  return sortedUpcoming(events.filter(e=>inNext10(e)&&(tf==="all"||e.type===tf)&&(pf==="all"||e.priority===pf)));
}

function render(){
  const now=todayISO(), next=events.filter(inNext10);
  document.getElementById("todayLabel").textContent=new Date().toLocaleDateString(undefined,{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  document.getElementById("todayCount").textContent=events.filter(e=>e.date===now).length;
  document.getElementById("homeworkCount").textContent=next.filter(e=>e.type==="homework").length;
  document.getElementById("examCount").textContent=next.filter(e=>e.type==="exam").length;
  document.getElementById("actionCount").textContent=next.filter(e=>e.action==="yes").length;
  renderTimeline(); renderActions(); renderLists(); renderTodayTT(); renderWeekly();
}
function renderTimeline(){
  const box=document.getElementById("timeline"), list=getFiltered();
  if(!list.length){box.innerHTML='<div class="empty">No matching items in the next 10 days.</div>';return}
  const groups={}; list.forEach(e=>(groups[e.date]??=[]).push(e));
  box.innerHTML=Object.entries(groups).map(([date,items])=>`
    <div class="day-row">
      <div class="day-label ${date===todayISO()?"today":""}">${date===todayISO()?"TODAY":formatDate(date)}<br><small>${dayName(date)}</small></div>
      <div class="event-stack">${items.map(eventHTML).join("")}</div>
    </div>`).join("");
}
function eventHTML(e){
 return `<div class="event-card ${e.priority}">
  <div class="event-main"><div class="event-title">${escapeHTML(e.title)} <span class="badge">${typeLabel(e.type)}</span><span class="badge ${e.priority}">${e.priority}</span></div>
  <div class="event-meta">${escapeHTML(e.subject||"")} ${e.action==="yes"?"• Action required":""}</div>
  ${e.description?`<div class="event-desc">${escapeHTML(e.description)}</div>`:""}</div>
  <div class="event-actions"><button class="small-btn" onclick="editEvent('${e.id}')">Edit</button><button class="small-btn" onclick="deleteEvent('${e.id}')">Delete</button></div>
 </div>`;
}
function compactHTML(e){return `<div class="compact-item"><div><strong>${escapeHTML(e.title)}</strong><small>${formatDate(e.date)}${e.subject?" • "+escapeHTML(e.subject):""}</small></div><span class="badge ${e.priority}">${e.priority}</span></div>`}
function renderActions(){const a=sortedUpcoming(events.filter(e=>inNext10(e)&&e.action==="yes"));document.getElementById("actionList").innerHTML=a.length?a.map(compactHTML).join(""):'<div class="empty">Nothing requires attention.</div>'}
function renderLists(){
 const n=events.filter(inNext10);
 const hw=sortedUpcoming(n.filter(e=>e.type==="homework")).slice(0,6), ex=sortedUpcoming(n.filter(e=>e.type==="exam")).slice(0,6);
 document.getElementById("homeworkList").innerHTML=hw.length?hw.map(compactHTML).join(""):'<div class="empty">No upcoming homework.</div>';
 document.getElementById("examList").innerHTML=ex.length?ex.map(compactHTML).join(""):'<div class="empty">No upcoming exams.</div>';
}
function renderTodayTT(){
 const day=new Date().toLocaleDateString(undefined,{weekday:"long"}), rows=timetable[day]||[];
 document.getElementById("weekdayLabel").textContent=day;
 document.getElementById("todayTimetable").innerHTML=rows.length?rows.map(r=>`<div class="period"><strong>${escapeHTML(r[0])}</strong><span>${escapeHTML(r[1]||"Free")}</span></div>`).join(""):'<div class="empty">No timetable entries.</div>';
}
function renderWeekly(){
 const days=["Monday","Tuesday","Wednesday","Thursday","Friday"], max=Math.max(...days.map(d=>(timetable[d]||[]).length),1);
 let h='<table class="weekly-table"><thead><tr><th>Time</th>'+days.map(d=>`<th>${d}</th>`).join("")+'</tr></thead><tbody>';
 for(let i=0;i<max;i++){h+=`<tr><td>${escapeHTML((timetable.Monday?.[i]?.[0])||"")}</td>`+days.map(d=>`<td>${escapeHTML(timetable[d]?.[i]?.[1]||"—")}</td>`).join("")+'</tr>'} h+='</tbody></table>';
 document.getElementById("weeklyTimetable").innerHTML=h;
}

function openEvent(e=null){
 document.getElementById("modalTitle").textContent=e?"Edit Item":"Add Item";
 document.getElementById("eventId").value=e?.id||"";
 document.getElementById("eventType").value=e?.type||"homework";
 document.getElementById("eventDate").value=e?.date||todayISO();
 document.getElementById("eventTitle").value=e?.title||"";
 document.getElementById("eventSubject").value=e?.subject||"";
 document.getElementById("eventPriority").value=e?.priority||"medium";
 document.getElementById("eventAction").value=e?.action||"yes";
 document.getElementById("eventDescription").value=e?.description||"";
 document.getElementById("eventModal").classList.remove("hidden");
}
window.editEvent=id=>openEvent(events.find(e=>e.id===id));
window.deleteEvent=id=>{if(confirm("Delete this item?")){events=events.filter(e=>e.id!==id);save();render()}};
document.getElementById("eventForm").addEventListener("submit",ev=>{
 ev.preventDefault();
 const id=document.getElementById("eventId").value;
 const item={id:id||crypto.randomUUID(),type:eventType.value,date:eventDate.value,title:eventTitle.value.trim(),subject:eventSubject.value.trim(),priority:eventPriority.value,action:eventAction.value,description:eventDescription.value.trim()};
 if(id) events=events.map(e=>e.id===id?item:e); else events.push(item);
 save(); document.getElementById("eventModal").classList.add("hidden"); render();
});
document.getElementById("addBtn").onclick=()=>openEvent();
document.getElementById("typeFilter").onchange=renderTimeline;
document.getElementById("priorityFilter").onchange=renderTimeline;
document.getElementById("editTimetableBtn").onclick=()=>openTT();
document.getElementById("timetableBtn").onclick=()=>openTT();

function openTT(){
 const days=["Monday","Tuesday","Wednesday","Thursday","Friday"], max=6;
 let h='<div class="tt-grid"><div class="tt-cell tt-head">Time</div>'+days.map(d=>`<div class="tt-cell tt-head">${d}</div>`).join("");
 for(let i=0;i<max;i++){
  const time=timetable.Monday?.[i]?.[0]||`${8+i}:00`;
  h+=`<div class="tt-cell tt-time"><input data-tt="time" data-i="${i}" value="${escapeHTML(time)}"></div>`;
  days.forEach(d=>h+=`<div class="tt-cell"><input data-tt="${d}" data-i="${i}" value="${escapeHTML(timetable[d]?.[i]?.[1]||"")}"></div>`);
 }
 document.getElementById("timetableEditor").innerHTML=h+'</div>';
 document.getElementById("timetableModal").classList.remove("hidden");
}
document.getElementById("saveTimetableBtn").onclick=()=>{
 const days=["Monday","Tuesday","Wednesday","Thursday","Friday"], max=6, out={};
 days.forEach(d=>out[d]=[]);
 for(let i=0;i<max;i++){
  const time=document.querySelector(`[data-tt="time"][data-i="${i}"]`).value.trim();
  days.forEach(d=>{const subject=document.querySelector(`[data-tt="${d}"][data-i="${i}"]`).value.trim();if(time||subject)out[d].push([time,subject])});
 }
 timetable=out;save();document.getElementById("timetableModal").classList.add("hidden");render();
};

document.querySelectorAll("[data-close]").forEach(b=>b.onclick=()=>document.getElementById(b.dataset.close).classList.add("hidden"));
document.querySelectorAll(".modal").forEach(m=>m.addEventListener("click",e=>{if(e.target===m)m.classList.add("hidden")}));

document.getElementById("exportBtn").onclick=()=>{
 const blob=new Blob([JSON.stringify({events,timetable},null,2)],{type:"application/json"});
 const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="school-dashboard-backup.json";a.click();URL.revokeObjectURL(a.href);
};
document.getElementById("importInput").onchange=e=>{
 const file=e.target.files[0]; if(!file)return;
 const reader=new FileReader(); reader.onload=()=>{
  try{const d=JSON.parse(reader.result);if(!Array.isArray(d.events)||!d.timetable)throw Error();events=d.events;timetable=d.timetable;save();render();alert("Backup imported successfully.")}catch{alert("Invalid dashboard backup file.")}};
 reader.readAsText(file);e.target.value="";
};

render();
