const $ = (s) => document.querySelector(s);

const problem = $("#problem");
const attempt = $("#attempt");
const subject = $("#subject");
const resultCard = $("#resultCard");
const result = $("#result");
const resultTitle = $("#resultTitle");
const apiUrl = $("#apiUrl");

const demoAnswers = {
  explain: "Break the question into: what is given, what is required, constraints, and one small example. Then choose the simplest concept or pattern that explains the result.",
  solve: "Try solving it in your own words first. For quantitative questions, write the known values and formula. For reasoning, identify the pattern. For coding, identify the data structure and invariant before writing code.",
  hint: "Start with the constraint or the smallest example. Ask: what information do I need to remember from the previous step?",
  check: "Compare your answer against the exact requirement. Check units, boundary cases, assumptions, and whether every step follows from the previous one.",
  practice: "Practice prompt: solve a similar question without looking at the answer, then explain why your method works."
};
const taskTitles={explain:"Explanation",solve:"Solution guidance",hint:"Hint",check:"Answer check",practice:"Practice"};

async function load(){
  const data=await chrome.storage.local.get(["problem","attempt","subject","language","apiUrl"]);
  if(data.problem) problem.value=data.problem;
  if(data.attempt) attempt.value=data.attempt;
  if(data.subject) subject.value=data.subject;
  if(data.language) $("#language").value=data.language;
  if(data.apiUrl) apiUrl.value=data.apiUrl;
}
async function saveDraft(){
  await chrome.storage.local.set({
    problem:problem.value,attempt:attempt.value,subject:subject.value,
    language:$("#language").value
  });
}
function toast(msg){
  const t=$("#toast"); t.textContent=msg; t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"),1800);
}
async function askTask(task){
  await saveDraft();
  if(!problem.value.trim()) return toast("Add a question or problem first.");
  resultCard.classList.remove("hidden");
  resultTitle.textContent=taskTitles[task]||"AI Tutor";
  result.textContent="Thinking…";
  try{
    const base=(await chrome.storage.local.get("apiUrl")).apiUrl?.trim();
    if(!base){
      await new Promise(r=>setTimeout(r,250));
      result.textContent=demoAnswers[task];
      return;
    }
    const res=await fetch(base.replace(/\/$/,"")+"/coach",{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        mode:task,problem:problem.value,code:attempt.value,
        language:$("#language").value,subject:subject.value
      })
    });
    if(!res.ok) throw new Error("API "+res.status);
    const data=await res.json();
    result.textContent=data.answer||"No answer returned.";
  }catch(e){
    result.textContent="Could not reach the AI service.\n\n"+e.message+
      "\n\nRemove the Backend URL in Settings to use local demo mode.";
  }
}

document.querySelectorAll(".task").forEach(b=>b.addEventListener("click",()=>{
  document.querySelectorAll(".task").forEach(x=>x.classList.remove("active"));
  b.classList.add("active");
}));
$("#askBtn").onclick=()=>{
  const active=document.querySelector(".task.active");
  askTask(active?.dataset.task||"explain");
};
problem.addEventListener("input",saveDraft);
attempt.addEventListener("input",saveDraft);
subject.addEventListener("change",saveDraft);
$("#language").addEventListener("change",saveDraft);
$("#clearBtn").onclick=async()=>{
  problem.value="";attempt.value="";resultCard.classList.add("hidden");
  await chrome.storage.local.remove(["problem","attempt"]);
};
$("#copyBtn").onclick=async()=>{
  await navigator.clipboard.writeText(result.textContent);toast("Copied.");
};
$("#settingsBtn").onclick=()=>$("#settings").classList.toggle("hidden");
$("#closeSettings").onclick=()=>$("#settings").classList.add("hidden");
$("#saveSettings").onclick=async()=>{
  await chrome.storage.local.set({apiUrl:apiUrl.value.trim()});
  $("#settings").classList.add("hidden");toast("Settings saved.");
};

const QUESTION_BANK=[
{t:"maths",q:"If a number is increased by 20% and then decreased by 20%, the net change is:",o:["0%","4% decrease","4% increase","2% decrease"],a:1,e:"100 → 120 → 96, so the final value is 4% below the original."},
{t:"maths",q:"A train travels 240 km in 4 hours. Its average speed is:",o:["40 km/h","50 km/h","60 km/h","80 km/h"],a:2,e:"Average speed = 240 ÷ 4 = 60 km/h."},
{t:"reasoning",q:"Find the next number: 2, 6, 12, 20, 30, ?",o:["36","40","42","44"],a:2,e:"Differences are 4, 6, 8, 10, so the next difference is 12."},
{t:"reasoning",q:"If CAT is coded as DBU, DOG is coded as:",o:["EPH","EOG","DPH","FPI"],a:0,e:"Each letter moves one position forward."},
{t:"aptitude",q:"A shop gives a 10% discount on an item priced at ₹800. The selling price is:",o:["₹700","₹720","₹740","₹760"],a:1,e:"10% of ₹800 is ₹80; ₹800 − ₹80 = ₹720."},
{t:"english",q:"Choose the word closest in meaning to 'concise':",o:["Lengthy","Brief","Unclear","Emotional"],a:1,e:"Concise means brief and clearly expressed."},
{t:"coding",q:"Which data structure gives average O(1) lookup by key?",o:["Array","Hash table","Linked list","Heap"],a:1,e:"Hash tables provide average constant-time key lookup."},
{t:"coding",q:"Binary search on a sorted array has time complexity:",o:["O(1)","O(log n)","O(n)","O(n log n)"],a:1,e:"Each comparison halves the remaining search space."},
{t:"dbms",q:"Which normal form removes partial dependency on a composite key?",o:["1NF","2NF","3NF","BCNF"],a:1,e:"2NF removes partial functional dependencies."},
{t:"dbms",q:"Which SQL clause filters groups after aggregation?",o:["WHERE","ORDER BY","HAVING","LIMIT"],a:2,e:"HAVING filters groups after aggregation."},
{t:"os",q:"Which scheduling algorithm uses a fixed time quantum?",o:["FCFS","Round Robin","SJF","Priority"],a:1,e:"Round Robin assigns each process a time slice."},
{t:"os",q:"A process waiting indefinitely for a resource is associated with:",o:["Deadlock","Paging","Thrashing","Spooling"],a:0,e:"Deadlock involves processes waiting on resources held by one another."},
{t:"cn",q:"Which protocol is connection-oriented?",o:["UDP","IP","TCP","ARP"],a:2,e:"TCP establishes a connection and provides ordered reliable delivery."},
{t:"cn",q:"DNS primarily translates:",o:["IP to MAC","Domain names to IP addresses","HTTP to HTTPS","Ports to processes"],a:1,e:"DNS resolves domain names to network addresses."},
{t:"oop",q:"Bundling data with methods that operate on that data is:",o:["Inheritance","Encapsulation","Polymorphism","Abstraction"],a:1,e:"Encapsulation combines state and behavior behind a controlled interface."},
{t:"oop",q:"Method overriding is primarily associated with:",o:["Compile-time polymorphism","Runtime polymorphism","Encapsulation","Composition"],a:1,e:"Overriding enables runtime polymorphism."},
{t:"python",q:"What is len({1,1,2,3}) in Python?",o:["4","3","2","Error"],a:1,e:"Sets contain unique values, so the length is 3."},
{t:"python",q:"Which Python type is immutable?",o:["list","dict","set","tuple"],a:3,e:"Tuples are immutable sequences."},
{t:"mixed",q:"In supervised learning, training data contains:",o:["Only inputs","Inputs and target labels","Only labels","No examples"],a:1,e:"Supervised learning learns from labelled examples."},
{t:"mixed",q:"Which metric is commonly used for classification?",o:["Accuracy","R-squared only","Mean absolute error only","Variance only"],a:0,e:"Accuracy is a standard classification metric."}
];

let mock={items:[],index:0,score:0,selected:null,deadline:0,timer:null};
function shuffle(arr){return [...arr].sort(()=>Math.random()-0.5);}
function startMock(){
  const topic=$("#mockTopic").value,count=Number($("#mockCount").value),mins=Number($("#mockMinutes").value);
  let pool=topic==="mixed"?QUESTION_BANK:QUESTION_BANK.filter(x=>x.t===topic);
  mock.items=shuffle(pool).slice(0,Math.min(count,pool.length));
  mock.index=0;mock.score=0;mock.selected=null;mock.deadline=Date.now()+mins*60000;
  $("#mockResult").classList.add("hidden");$("#questionCard").classList.remove("hidden");
  $("#mockStatus").textContent="In progress";renderQuestion();
  clearInterval(mock.timer);mock.timer=setInterval(updateTimer,1000);updateTimer();
}
function updateTimer(){
  const left=Math.max(0,mock.deadline-Date.now()),sec=Math.ceil(left/1000);
  $("#timer").textContent=String(Math.floor(sec/60)).padStart(2,"0")+":"+String(sec%60).padStart(2,"0");
  if(sec<=0){clearInterval(mock.timer);finishMock(true);}
}
function renderQuestion(){
  const item=mock.items[mock.index];
  if(!item)return finishMock();
  $("#questionNumber").textContent=`Question ${mock.index+1}/${mock.items.length}`;
  $("#questionText").textContent=item.q;$("#nextQuestion").disabled=true;
  $("#nextQuestion").textContent=mock.index===mock.items.length-1?"Finish set":"Next question";
  $("#explanation").classList.add("hidden");$("#explanation").textContent="";
  const wrap=$("#options");wrap.innerHTML="";
  item.o.forEach((opt,i)=>{
    const b=document.createElement("button");b.className="option";b.textContent=opt;
    b.onclick=()=>selectOption(i);wrap.appendChild(b);
  });
}
function selectOption(i){
  if(mock.selected!==null)return;
  mock.selected=i;const item=mock.items[mock.index];
  document.querySelectorAll(".option").forEach((b,j)=>{
    b.disabled=true;if(j===item.a)b.classList.add("correct");
    if(j===i&&j!==item.a)b.classList.add("wrong");
  });
  if(i===item.a)mock.score++;
  $("#explanation").textContent="Why: "+item.e;$("#explanation").classList.remove("hidden");
  $("#nextQuestion").disabled=false;
}
function nextQuestion(){
  if(mock.selected===null)return;mock.selected=null;mock.index++;renderQuestion();
}
function finishMock(timedOut=false){
  clearInterval(mock.timer);$("#questionCard").classList.add("hidden");
  $("#mockStatus").textContent=timedOut?"Time up":"Complete";$("#mockResult").classList.remove("hidden");
  const total=mock.items.length,pct=total?Math.round(mock.score/total*100):0;
  $("#scorePill").textContent=`${mock.score}/${total}`;
  $("#mockSummary").textContent=(timedOut?"Time expired. ":"")+
    `Score: ${pct}%\\n\\nReview missed concepts and try another set. This is local practice and is not connected to any live assessment.`;
}
$("#startMock").onclick=startMock;$("#nextQuestion").onclick=nextQuestion;$("#retryMock").onclick=startMock;

const researchView=$("#researchView"),eventLog=$("#eventLog"),researchEvents=[];
function addResearchEvent(type){
  researchEvents.unshift({type,time:new Date().toLocaleTimeString()});
  if(researchEvents.length>20)researchEvents.pop();
  eventLog.innerHTML=researchEvents.length
    ?researchEvents.map(e=>`<div class="log-row"><span class="log-dot"></span><b>${e.type}</b><time>${e.time}</time></div>`).join("")
    :'<div class="log-empty">No simulated events yet.</div>';
}
document.querySelectorAll(".research-btn").forEach(b=>b.onclick=()=>addResearchEvent(b.dataset.event));
$("#clearResearch").onclick=()=>{researchEvents.length=0;eventLog.innerHTML='<div class="log-empty">No simulated events yet.</div>';};
$("#extUrlStatus").textContent=chrome.runtime.getURL("sidepanel.html").split("/").slice(0,3).join("/")+"/…";
$("#manifestStatus").textContent=chrome.runtime.getManifest().manifest_version+" / MV3";
$("#permissionStatus").textContent=(chrome.runtime.getManifest().permissions||[]).join(", ")||"none";
document.addEventListener("visibilitychange",()=>addResearchEvent("actual visibility: "+document.visibilityState));

document.querySelectorAll(".mode-tab").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll(".mode-tab").forEach(b=>b.classList.remove("active"));b.classList.add("active");
  const view=btn.dataset.view;
  $("#tutorView").classList.toggle("hidden",view!=="tutorView");
  $("#mockView").classList.toggle("hidden",view!=="mockView");
  researchView.classList.toggle("hidden",view!=="researchView");
}));
load();
