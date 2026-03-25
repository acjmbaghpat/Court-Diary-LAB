const DB_NAME="CourtDB";
const STORE="data";
let db;

function openDB(){
  return new Promise((res)=>{
    const r=indexedDB.open(DB_NAME,1);

    r.onupgradeneeded=e=>{
      db=e.target.result;
      db.createObjectStore(STORE,{keyPath:"key"});
    };

    r.onsuccess=e=>{
      db=e.target.result;
      res();
    };
  });
}

function saveData(key,data){
  const tx=db.transaction(STORE,"readwrite");
  tx.objectStore(STORE).put({key,data});
}

function loadData(key){
  return new Promise(res=>{
    const tx=db.transaction(STORE,"readonly");
    const r=tx.objectStore(STORE).get(key);
    r.onsuccess=()=>res(r.result?.data||[]);
  });
}
