const $ = (s) => document.querySelector(s);
const problem = $("#problem"), code = $("#code"), language = $("#language");
const resultCard = $("#resultCard"), result = $("#result"), resultTitle = $("#resultTitle");
const apiUrl = $("#apiUrl");

const demo = {
  hint: "Start by identifying what information must be remembered between iterations. Ask yourself whether the problem can be reduced to a lookup, a two-pointer scan, or a traversal.",
  approach: "1. Restate the problem in your own words.\n2. Identify the input constraints and the expensive operation.\n3. Choose a data structure that removes the repeated work.\n4. Walk through one small example before coding.\n5. Only then write the implementation.",
  debug: "I would check these first:\n\n• Boundary conditions and empty input\n• Off-by-one errors in loops\n• Whether state is reset between test cases\n• Duplicate values / repeated states\n• Return value on every control-flow path\n\nPaste your actual attempt above for a more specific review.",
  complexity: "A good complexity check should name the dominant loop/operation.\n\nTime: identify how many times each element can be processed.\nSpace: count auxiliary structures that grow with input size.\n\nPaste your code and I can estimate the exact Big-O."
};

const titles = {hint:"Hint", approach:"Approach", debug:"Code review", complexity:"Complexity"};

async function load() {
  const data = await chrome.storage.local.get(["problem","code","language","apiUrl"]);
  if (data.problem) problem.value = data.problem;
  if (data.code) code.value = data.code;
  if (data.language) language.value = data.language;
  if (data.apiUrl) apiUrl.value = data.apiUrl;
}
async function saveDraft() {
  await chrome.storage.local.set({problem:problem.value, code:code.value, language:language.value});
}
async function ask(mode) {
  await saveDraft();
  if (!problem.value.trim()) return toast("Add a question or prompt first.");
  resultCard.classList.remove("hidden");
  resultTitle.textContent = titles[mode];
  result.textContent = "Thinking…";
  try {
    const base = (await chrome.storage.local.get("apiUrl")).apiUrl?.trim();
    if (!base) {
      await new Promise(r => setTimeout(r, 350));
      result.textContent = demo[mode];
      return;
    }
    const res = await fetch(base.replace(/\/$/,"") + "/coach", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({mode, problem:problem.value, code:code.value, language:language.value})
    });
    if (!res.ok) throw new Error("API " + res.status);
    const data = await res.json();
    result.textContent = data.answer || "No answer returned.";
  } catch (e) {
    result.textContent = "Could not reach the AI service.\n\n" + e.message + "\n\nFor local testing, remove the Backend URL in Settings and CodeSidekick will use demo mode.";
  }
}
function toast(msg) { const t=$("#toast"); t.textContent=msg; t.classList.add("show"); setTimeout(()=>t.classList.remove("show"),1800); }

document.querySelectorAll(".action").forEach(b => b.addEventListener("click", () => ask(b.dataset.mode)));
problem.addEventListener("input", saveDraft); code.addEventListener("input", saveDraft); language.addEventListener("change", saveDraft);
$("#clearBtn").onclick = async () => { problem.value=""; code.value=""; resultCard.classList.add("hidden"); await chrome.storage.local.clear(); };
$("#copyBtn").onclick = async () => { await navigator.clipboard.writeText(result.textContent); toast("Copied."); };
$("#settingsBtn").onclick = () => $("#settings").classList.toggle("hidden");
$("#closeSettings").onclick = () => $("#settings").classList.add("hidden");
$("#saveSettings").onclick = async () => { await chrome.storage.local.set({apiUrl:apiUrl.value.trim()}); $("#settings").classList.add("hidden"); toast("Settings saved."); };
load();

const QUESTION_BANK = [
  {t:"quant",q:"If a number is increased by 20% and then decreased by 20%, the net change is:",o:["0%","4% decrease","4% increase","2% decrease"],a:1,e:"100 → 120 → 96, so the final value is 4% below the original."},
  {t:"quant",q:"A train travels 240 km in 4 hours. Its average speed is:",o:["40 km/h","50 km/h","60 km/h","80 km/h"],a:2,e:"Average speed = distance ÷ time = 240 ÷ 4 = 60 km/h."},
  {t:"reasoning",q:"Find the next number: 2, 6, 12, 20, 30, ?",o:["36","40","42","44"],a:2,e:"The differences are 4, 6, 8, 10, so the next difference is 12: 30 + 12 = 42."},
  {t:"reasoning",q:"If CAT is coded as DBU, DOG is coded as:",o:["EPH","EOG","DPH","FPI"],a:0,e:"Each letter moves one position forward: D→E, O→P, G→H."},
  {t:"verbal",q:"Choose the word closest in meaning to 'concise':",o:["Lengthy","Brief","Unclear","Emotional"],a:1,e:"Concise means expressing something clearly in few words, i.e. brief."},
  {t:"verbal",q:"Choose the grammatically correct sentence:",o:["She don't like coffee.","She doesn't likes coffee.","She doesn't like coffee.","She not like coffee."],a:2,e:"With 'doesn't', the main verb stays in its base form: 'like'."},
  {t:"dsa",q:"Which data structure gives average O(1) lookup by key?",o:["Array","Hash table","Linked list","Heap"],a:1,e:"Hash tables use hashing to provide average constant-time key lookup."},
  {t:"dsa",q:"A binary search on a sorted array has time complexity of:",o:["O(1)","O(log n)","O(n)","O(n log n)"],a:1,e:"Each step halves the remaining search space."},
  {t:"dbms",q:"Which normal form removes partial dependency on a composite key?",o:["1NF","2NF","3NF","BCNF"],a:1,e:"2NF removes partial functional dependencies on part of a candidate key."},
  {t:"dbms",q:"Which SQL clause filters groups after aggregation?",o:["WHERE","ORDER BY","HAVING","LIMIT"],a:2,e:"HAVING filters grouped rows after aggregate calculations."},
  {t:"os",q:"Which scheduling algorithm uses a fixed time quantum?",o:["FCFS","Round Robin","SJF","Priority"],a:1,e:"Round Robin gives each ready process a time slice."},
  {t:"os",q:"A process waiting indefinitely for a resource is most directly associated with:",o:["Deadlock","Paging","Thrashing","Spooling"],a:0,e:"Deadlock occurs when processes wait for resources held by one another."},
  {t:"cn",q:"Which protocol is connection-oriented?",o:["UDP","IP","TCP","ARP"],a:2,e:"TCP establishes a connection and provides ordered, reliable delivery."},
  {t:"cn",q:"DNS primarily translates:",o:["IP to MAC","Domain names to IP addresses","HTTP to HTTPS","Ports to processes"],a:1,e:"DNS resolves human-readable domain names to network addresses."},
  {t:"oop",q:"Bundling data with methods that operate on that data is:",o:["Inheritance","Encapsulation","Polymorphism","Abstraction"],a:1,e:"Encapsulation combines state and behavior behind a controlled interface."},
  {t:"oop",q:"Method overriding is primarily associated with:",o:["Compile-time polymorphism","Runtime polymorphism","Encapsulation","Composition"],a:1,e:"A subclass can provide a specialized implementation selected at runtime."},
  {t:"python",q:"What is the result of len({1,1,2,3}) in Python?",o:["4","3","2","Error"],a:1,e:"A set stores unique values, so duplicates are removed."},
  {t:"python",q:"Which Python type is immutable?",o:["list","dict","set","tuple"],a:3,e:"Tuples are immutable sequences."},
  {t:"aiml",q:"In supervised learning, the training data contains:",o:["Only inputs","Inputs and target labels","Only labels","No examples"],a:1,e:"Supervised learning learns a mapping from input features to known target labels."},
  {t:"aiml",q:"Which metric is commonly used for classification?",o:["Accuracy","Mean absolute error only","R-squared only","Euclidean distance only"],a:0,e:"Accuracy is a standard classification metric, alongside precision, recall and F1."}
];

const studyView=$("#studyView"), coachView=$("#coachView");
let study={items:[],index:0,score:0,selected:null,deadline:0,timer:null};

function shuffle(arr){return [...arr].sort(()=>Math.random()-0.5);}
function startStudy(){
  const topic=$("#studyTopic").value, count=Number($("#studyCount").value), mins=Number($("#studyMinutes").value);
  let pool=topic==="mixed"?QUESTION_BANK:QUESTION_BANK.filter(x=>x.t===topic);
  study.items=shuffle(pool).slice(0,Math.min(count,pool.length));
  study.index=0; study.score=0; study.selected=null; study.deadline=Date.now()+mins*60000;
  $("#studyResult").classList.add("hidden"); $("#questionCard").classList.remove("hidden");
  $("#studyStatus").textContent="In progress"; renderQuestion(); clearInterval(study.timer);
  study.timer=setInterval(updateTimer,1000); updateTimer();
}
function updateTimer(){
  const left=Math.max(0,study.deadline-Date.now()), sec=Math.ceil(left/1000);
  $("#timer").textContent=String(Math.floor(sec/60)).padStart(2,"0")+":"+String(sec%60).padStart(2,"0");
  if(sec<=0){clearInterval(study.timer); finishMock(true);}
}
function renderQuestion(){
  const item=study.items[study.index]; if(!item) return finishMock();
  $("#questionNumber").textContent=`Question ${study.index+1}/${study.items.length}`;
  $("#questionText").textContent=item.q; $("#nextQuestion").disabled=true;
  $("#nextQuestion").textContent=study.index===study.items.length-1?"Finish set":"Next question";
  const wrap=$("#options"); wrap.innerHTML="";
  item.o.forEach((opt,i)=>{
    const b=document.createElement("button"); b.className="option"; b.textContent=opt;
    b.onclick=()=>selectOption(i,b); wrap.appendChild(b);
  });
}
function selectOption(i,button){
  if(study.selected!==null) return; study.selected=i;
  const item=study.items[study.index];
  document.querySelectorAll(".option").forEach((b,j)=>{b.disabled=true;if(j===item.a)b.classList.add("correct");if(j===i&&j!==item.a)b.classList.add("wrong");});
  if(i===item.a) study.score++;
  $("#nextQuestion").disabled=false;
}
function nextQuestion(){
  if(study.selected===null) return;
  study.selected=null; study.index++; renderQuestion();
}
function finishMock(timedOut=false){
  clearInterval(study.timer); $("#questionCard").classList.add("hidden");
  $("#studyStatus").textContent=timedOut?"Time up":"Complete";
  $("#studyResult").classList.remove("hidden");
  const total=study.items.length, pct=total?Math.round(study.score/total*100):0;
  $("#scorePill").textContent=`${study.score}/${total}`;
  $("#studySummary").textContent=(timedOut?"Time expired. ":"")+`Score: ${pct}%\\n\\nReview the concepts you missed, then run another set. This study mode is local and is not connected to any live assessment.`;
}
document.querySelectorAll(".mode-tab").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll(".mode-tab").forEach(b=>b.classList.remove("active")); btn.classList.add("active");
  const view=btn.dataset.view; coachView.classList.toggle("hidden",view!=="coachView"); studyView.classList.toggle("hidden",view!=="studyView");
}));
$("#startStudy").onclick=startStudy; $("#nextQuestion").onclick=nextQuestion; $("#retryStudy").onclick=startStudy;
