// LOGIN
function doLogin(){
  const id = document.getElementById("lid").value;
  const pass = document.getElementById("lpwd").value;

  if(id==="baghpatcourtstaff" && pass==="27031994"){
    sessionStorage.setItem("login","1");
    document.getElementById("loginScreen").style.display="none";
    initApp();
  }else{
    document.getElementById("lerr").innerText="Wrong Login";
  }
}

// INIT
async function initApp(){
  await openDB();
  fbInit();

  // load current date
  const d = new Date().toISOString().split("T")[0];
  document.getElementById("workDate").value = d;

  await loadLocal();
  updateDashboard();
}

// TAB SWITCH
function switchTab(t){
  document.querySelectorAll(".tab-c").forEach(x=>x.classList.remove("on"));
  document.querySelectorAll(".tab-btn").forEach(x=>x.classList.remove("on"));

  if(t==="cfm"){
    document.getElementById("cfm-tab").classList.add("on");
    document.querySelectorAll(".tab-btn")[0].classList.add("on");
  }else{
    document.getElementById("bundle-tab").classList.add("on");
    document.querySelectorAll(".tab-btn")[1].classList.add("on");
  }
}

// AUTO START
window.onload = ()=>{
  if(sessionStorage.getItem("login")==="1"){
    document.getElementById("loginScreen").style.display="none";
    initApp();
  }
};
