let fbDB=null;

function setSyncDot(st){
  const d=document.getElementById("syncDot");
  d.className=st;
}

function fbInit(){
  const cfg=JSON.parse(localStorage.getItem("fbConfig")||"null");
  if(!cfg)return;

  firebase.initializeApp(cfg);
  fbDB=firebase.firestore();
}

async function fbPush(data){
  if(!fbDB)return;

  try{
    setSyncDot("busy");

    await fbDB.collection("courtData")
      .doc("main")
      .set({data,updated:Date.now()});

    setSyncDot("ok");
  }catch(e){
    setSyncDot("err");
  }
}
