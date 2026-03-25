const DB_NAME = 'CourtFileManagerDB';
const DB_VERSION = 1;
const STORE = 'data';

let db;

// OPEN DB
function openDB(){
  return new Promise((resolve,reject)=>{
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e)=>{
      db = e.target.result;
      if(!db.objectStoreNames.contains(STORE)){
        db.createObjectStore(STORE,{keyPath:'key'});
      }
    };

    req.onsuccess = (e)=>{
      db = e.target.result;
      resolve(db);
    };

    req.onerror = (e)=>reject(e);
  });
}

// SAVE
function saveData(key,data){
  return new Promise((resolve)=>{
    const tx = db.transaction(STORE,'readwrite');
    tx.objectStore(STORE).put({key,data});
    tx.oncomplete = resolve;
  });
}

// LOAD
function loadData(key){
  return new Promise((resolve)=>{
    const tx = db.transaction(STORE,'readonly');
    const req = tx.objectStore(STORE).get(key);

    req.onsuccess = ()=>{
      resolve(req.result ? req.result.data : []);
    };
  });
}

// DELETE
function deleteData(key){
  const tx = db.transaction(STORE,'readwrite');
  tx.objectStore(STORE).delete(key);
}
