let cData=[];
let lastReceivedCase=null;
let ndJO=null;

// LOAD
async function loadLocal(){
  const d=await loadData("main");
  cData=Array.isArray(d)?d:[];
  drawTable();
}

// DRAW TABLE
function drawTable(data=cData){
  let html=`<tr>
    <th>Case</th>
    <th>Party</th>
    <th>Action</th>
    <th>Next</th>
    <th>Remark</th>
  </tr>`;

  data.forEach(r=>{
    html+=`
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

  document.getElementById("cfmTable").innerHTML=html;
  updateDashboard();
}

// DASHBOARD
function updateDashboard(){
  document.getElementById("totalCount").innerText=cData.length;
  document.getElementById("sentCount").innerText=cData.filter(x=>x.sent).length;
  document.getElementById("receivedCount").innerText=cData.filter(x=>x.received).length;

  const today=new Date();

  const od=cData.filter(r=>{
    if(!r.sentdate||r.received)return false;
    return (today-new Date(r.sentdate))/86400000>=15;
  });

  document.getElementById("overdueCount").innerText=od.length;
}

// EXCEL
function uploadExcel(){
  const file=excelFile.files[0];
  const reader=new FileReader();

  reader.onload=e=>{
    const wb=XLSX.read(e.target.result,{type:"binary"});
    const sheet=wb.Sheets[wb.SheetNames[0]];
    const rows=XLSX.utils.sheet_to_json(sheet,{defval:""});

    cData=rows.map(r=>({
      caseno:r["Case No"]||"",
      partyname:r["Party Name"]||"",
      sent:false,
      received:false,
      sentdate:"",
      receiveddate:"",
      nextdate:"",
      remark:""
    }));

    saveData("main",cData);
    fbPush(cData);
    drawTable();
  };

  reader.readAsBinaryString(file);
}

// SENT
function markSent(cn){
  const r=cData.find(x=>x.caseno===cn);
  if(!r)return;

  r.sent=true;
  r.sentdate=new Date().toISOString().split("T")[0];

  saveData("main",cData);
  fbPush(cData);
  drawTable();
}

// RECEIVED
function markReceived(cn){
  const r=cData.find(x=>x.caseno===cn);
  if(!r)return;

  r.received=true;
  r.receiveddate=new Date().toISOString().split("T")[0];

  lastReceivedCase=cn;
  document.getElementById("ndModal").classList.add("on");
}

// NEXT DATE
function toggleJO(t){
  ndJO=ndJO===t?null:t;
}

function saveNextDate(){
  const d=ndInput.value;
  const r=cData.find(x=>x.caseno===lastReceivedCase);

  r.nextdate=d;

  if(ndJO){
    const tag=ndJO==="J"?"Jail":"Old";
    if(!r.remark.includes(tag)){
      r.remark+=(r.remark?" | ":"")+tag;
    }
  }

  saveData("main",cData);
  fbPush(cData);

  document.getElementById("ndModal").classList.remove("on");
  drawTable();
}

// REMARK
function updateRemark(cn,val){
  const r=cData.find(x=>x.caseno===cn);
  if(!r)return;

  r.remark=val;
  saveData("main",cData);
  fbPush(cData);
}

// OVERDUE
function openOverdueModal(){
  const today=new Date();

  const od=cData.filter(r=>{
    if(!r.sentdate||r.received)return false;
    return (today-new Date(r.sentdate))/86400000>=15;
  });

  ovList.innerHTML=od.map(r=>`
    <div class="ov-item">
      ${r.caseno}
      <button onclick="setReminder('${r.caseno}',3)">3d</button>
      <button onclick="setReminder('${r.caseno}',7)">7d</button>
      <button onclick="setReminder('${r.caseno}',0)">Cancel</button>
    </div>
  `).join("");

  ovModal.classList.add("on");
}

// REMINDER
function setReminder(cn,days){
  const r=cData.find(x=>x.caseno===cn);

  if(days===0) r.reminder=null;
  else{
    const d=new Date();
    d.setDate(d.getDate()+days);
    r.reminder=d.toISOString();
  }

  saveData("main",cData);
}
