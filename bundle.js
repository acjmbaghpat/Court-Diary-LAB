let bundles=[];

function addBundle(file,loc){
  bundles.push({file,loc,time:Date.now()});
}

function findBundle(file){
  return bundles.find(x=>x.file===file);
}
