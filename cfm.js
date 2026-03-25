let cData = [];
let lastReceivedCase = null;
let ndJO = null;

// SEARCH TEXT
function makeSearchable(r){
  return Object.values(r).join(" ").toLowerCase();
}

// ==============================
// LOAD DATA
// ==============================
async function loadAppData(){
  cData = await loadData("main");
  if(!Array.isArray(cData)) cData = [];

  cData.forEach(r=>{
    r.searchable = makeSearchable(r);
  });

  drawTable();
}

// ==============================
// EXCEL UPLOAD
// ==============================
function uploadExcel(){
  const file = excelFile.files[0];
  if(!file) return alert("Excel select karo");

  const reader = new FileReader();

  reader.onload = async (e)=>{
    const wb = XLSX.read(e.target.result,{type:"binary"});
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet,{defval:""});

    cData = rows.map(r=>({
      caseno: String(r["Case No"]||"").trim(),
      partyname: r["Party Name"]||"",
      section: r["Section"]||"",
      ps: r["PS"]||"",
      sent:"",
      received:"",
      sentdate:"",
      receiveddate:"",
      nextdate:"",
      remark:"",
    })).filter(r=>r.caseno!=="");

    cData.forEach(r=>r.searchable = makeSearchable(r));

    await saveData("main",cData);
    fbPush(cData);

    drawTable();
    alert("Upload ho gaya ✅");
  };

  reader.readAsBinaryString(file);
}

// ==============================
// TABLE DRAW
// ==============================
function drawTable(data = cData){
  let html = `
  <tr>
    <th>Case</th>
    <th>Party</th>
    <th>Action</th>
    <th>Next Date</th>
    <th>Remark</th>
  </tr>`;

  data.forEach(r=>{
    html += `
    <tr>
      <td>${r.caseno}</td>
      <td>${r.partyname}</td>
      <td>
        <button onclick="markSent('${r.caseno}')">📤</button>
        <button onclick="markReceived('${r.caseno}')">📥</button>
      </td>
      <td>${r.nextdate||""}</td>
      <td>
        <input value="${r.remark||""}" 
        oninput="updateRemark('${r.caseno}',this.value)">
      </td>
    </tr>`;
  });

  cfmTable.innerHTML = html;
  updateDashboard();
}

// ==============================
// SEARCH
// ==============================
searchBox.addEventListener("input",()=>{
  const q = searchBox.value.toLowerCase();
  const f = cData.filter(r=>r.searchable.includes(q));
  drawTable(f);
});

// ==============================
// DASHBOARD
// ==============================
function updateDashboard(){
  totalCount.innerText = cData.length;
  sentCount.innerText = cData.filter(x=>x.sent==="Sent").length;
  receivedCount.innerText = cData.filter(x=>x.received==="Received").length;

  const today = new Date();

  const overdue = cData.filter(r=>{
    if(r.sent!=="Sent" || r.received==="Received" || !r.sentdate) return false;
    const d = new Date(r.sentdate);
    return (today - d)/86400000 >= 15;
  });

  overdueCount.innerText = overdue.length;
}

// ==============================
// MARK SENT
// ==============================
function markSent(cn){
  const r = cData.find(x=>x.caseno===cn);
  if(!r) return;

  if(r.sent==="Sent") return alert("Already Sent");

  r.sent = "Sent";
  r.sentdate = new Date().toISOString().split("T")[0];

  saveData("main",cData);
  fbPush(cData);

  drawTable();
}

// ==============================
// MARK RECEIVED
// ==============================
function markReceived(cn){
  const r = cData.find(x=>x.caseno===cn);
  if(!r) return;

  if(r.received==="Received") return alert("Already Received");

  r.received = "Received";
  r.receiveddate = new Date().toISOString().split("T")[0];

  lastReceivedCase = cn;

  openNextDateModal();
}

// ==============================
// NEXT DATE MODAL
// ==============================
function openNextDateModal(){
  ndModal.classList.add("on");
  ndJO = null;
}

function toggleJO(type){
  ndJO = ndJO === type ? null : type;
}

// SAVE NEXT DATE
function saveNextDate(){
  const date = ndInput.value;
  if(!date) return alert("Date select karo");

  const r = cData.find(x=>x.caseno===lastReceivedCase);

  r.nextdate = date;

  if(ndJO){
    const tag = ndJO==="J" ? "Jail" : "Old";
    if(!r.remark.includes(tag)){
      r.remark += (r.remark?" | ":"") + tag;
    }
  }

  saveData("main",cData);
  fbPush(cData);

  ndModal.classList.remove("on");
  drawTable();
}

// ==============================
// REMARK
// ==============================
function updateRemark(cn,val){
  const r = cData.find(x=>x.caseno===cn);
  if(!r) return;

  r.remark = val;

  saveData("main",cData);
  fbPush(cData);
}

// ==============================
// OVERDUE MODAL
// ==============================
function openOverdueModal(){
  ovModal.classList.add("on");

  const today = new Date();

  const overdue = cData.filter(r=>{
    if(r.sent!=="Sent" || r.received==="Received" || !r.sentdate) return false;
    const d = new Date(r.sentdate);
    return (today - d)/86400000 >= 15;
  });

  ovList.innerHTML = overdue.map(r=>`
    <div class="ov-item">
      <b>${r.caseno}</b><br>

      <input placeholder="Remark" 
      value="${r.remark||""}"
      oninput="updateRemark('${r.caseno}',this.value)">

      <div>
        <button onclick="setReminder('${r.caseno}',3)">3 Days</button>
        <button onclick="setReminder('${r.caseno}',7)">7 Days</button>
        <button onclick="setReminder('${r.caseno}',10)">10 Days</button>
        <button onclick="setReminder('${r.caseno}',0)">Cancel</button>
      </div>
    </div>
  `).join("");
}

// ==============================
// REMINDER
// ==============================
function setReminder(cn,days){
  const r = cData.find(x=>x.caseno===cn);
  if(!r) return;

  if(days===0){
    r.reminder = null;
  }else{
    const d = new Date();
    d.setDate(d.getDate()+days);
    r.reminder = d.toISOString().split("T")[0];
  }

  saveData("main",cData);
  fbPush(cData);

  alert("Reminder set ✅");
}
