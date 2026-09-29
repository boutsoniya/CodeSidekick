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
  if (!problem.value.trim()) return toast("Add a coding problem first.");
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