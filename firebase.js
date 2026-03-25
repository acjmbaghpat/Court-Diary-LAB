let fbApp = null;
let fbDB = null;

// DOT STATUS
function setSyncDot(status){
  const d = document.getElementById("syncDot");
  d.className = '';

  if(status === 'ok') d.classList.add('ok');        // 🟢
  else if(status === 'busy') d.classList.add('busy'); // 🟡
  else if(status === 'err') d.classList.add('err');   // 🔴
  else d.classList.add('off');
}

// INIT
function fbInit(){
  const cfg = JSON.parse(localStorage.getItem("fbConfig") || "null");
  if(!cfg) return;

  try{
    fbApp = firebase.initializeApp(cfg);
    fbDB = firebase.firestore();
    setSyncDot('ok');
  }catch(e){
    console.error(e);
    setSyncDot('err');
  }
}

// SAVE CONFIG
function fbSaveConfig(){
  const cfg = {
    apiKey: fbKey.value.trim(),
    authDomain: fbKey.value.trim() + ".firebaseapp.com",
    projectId: fbKey.value.trim(),
    storageBucket: fbKey.value.trim() + ".appspot.com",
    messagingSenderId: fbMid.value.trim(),
    appId: fbAid.value.trim()
  };

  localStorage.setItem("fbConfig", JSON.stringify(cfg));
  fbInit();
}

// RESET
function fbReset(){
  localStorage.removeItem("fbConfig");
  location.reload();
}

// PUSH DATA
async function fbPush(data){
  if(!fbDB) return;

  try{
    setSyncDot('busy');

    await fbDB.collection("courtData")
      .doc("main")
      .set({
        data: data,
        updated: Date.now()
      });

    setSyncDot('ok');
  }catch(e){
    console.error(e);
    setSyncDot('err');
  }
}

// PULL (optional future)
async function fbPull(){
  if(!fbDB) return;

  try{
    const doc = await fbDB.collection("courtData").doc("main").get();
    if(doc.exists){
      return doc.data().data;
    }
  }catch(e){
    console.error(e);
  }
}
