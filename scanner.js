let stream=null;

async function startCFMScan(mode){
  try{
    stream=await navigator.mediaDevices.getUserMedia({video:true});
    scanVid.srcObject=stream;
    document.getElementById("scan-ov").classList.add("on");
  }catch(e){
    alert("Camera error");
  }
}

function closeScan(){
  if(stream){
    stream.getTracks().forEach(t=>t.stop());
  }
  document.getElementById("scan-ov").classList.remove("on");
}
