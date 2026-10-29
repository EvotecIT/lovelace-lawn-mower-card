// Synthetic task data for exercising the public history contract without a mower.
export function taskHistoryFixture(query, photoUrl) {
  const path = "/api/dreame_lawn_mower/task-history/dashboard-demo";
  const state = query.get("history");
  const start = 1793181600;
  const ids = ["a", "b", "c"].map((letter) => letter.repeat(32));
  const tasks = ids.map((id, index) => ({
    id, mode: index, started_at: start - index * 86400,
    reported_at: start - index * 86400 + 3600,
    duration_minutes: [58, 12, 31][index], area_sqm: [329.4, 82, 176.7][index],
    result: [1, 3, 2][index], detail_path: `${path}/${id}`,
  }));
  const lawn = [[0,0],[900,20],[1050,420],[650,650],[10,500]];
  const lanes = Array.from({length:9},(_,index)=>{
    const y=80+index*45;
    return index%2 ? [[100,y],[850,y+5]] : [[850,y],[100,y+5]];
  });
  const details = Object.fromEntries(ids.map((id,index)=>{
    const at=start-index*86400;
    return [`${path}/${id}`, {
      schema_version:1,id,started_at:at,ended_at:at+3600,duration_minutes:tasks[index].duration_minutes,
      area_sqm:tasks[index].area_sqm,mode:tasks[index].mode,result:tasks[index].result,
      map_revision:"a".repeat(32),per_zone_settings:true,
      features:state==="nomap"?[]:[{kind:0,zone_id:4,points:lawn.map(([x,y])=>[x*10,y*10]),
        tracks:lanes.map((lane)=>lane.map(([x,y])=>[x*10,y*10]))}],
      zone_results:[[4,2],[7,index===0?2:-1]],faults:index===2?[[at+900,27]]:[],
      recorded_settings:state==="none"?{}:{mowing_height_cm:5.5,efficient_mode:1},
      battery:state==="none"?null:{source:state==="recorder"?"recorder":"observed",coverage:"partial",
        percentage_points:32,percentage_points_per_sqm:.0971,covered_seconds:2400,
        settings_observed_at:at+120,settings_timing:"first_observed",
        settings:{map_index:0,mode:state==="global"?0:1,zones:[{area_id:state==="global"?0:4,mowing_height_cm:5.5,efficient_mode:1,
          edge_mowing_walk_mode:0,mowing_direction_mode:state==="directionoff"?0:1,mowing_direction_degrees:45}]},
        samples:Array.from({length:21},(_,n)=>({at:at+n*180,level:90-n*1.6,charging:false,active:true,continuous:n>0}))},
      photo_paths:state==="none"?[]:[`${path}/${id}/photo/0`,`${path}/${id}/photo/1`],
      stale:state==="stale",
    }];
  }));
  const urls = new Map();
  return {
    path,
    response(route) {
      if (!route.startsWith(path)) return undefined;
      if (state==="error" || (state==="missing" && route!==path)) return "/missing-history-fixture";
      if (route.includes("/photo/")) {
        if (state==="photoerror") return "/missing-photo-fixture";
        if (state==="corruptphoto") {
          if (!urls.has(route)) urls.set(route,URL.createObjectURL(new Blob([new Uint8Array([137,80,78,71,13,10,26,10])],{type:"image/png"})));
          return urls.get(route);
        }
        return photoUrl;
      }
      const payload=route===path?{schema_version:1,tasks:state==="empty"?[]:tasks,limit:30,stale:state==="stale"}:details[route];
      if (!payload) return "/missing-history-fixture";
      if (!urls.has(route)) urls.set(route,URL.createObjectURL(new Blob([JSON.stringify(payload)],{type:"application/json"})));
      return urls.get(route);
    },
  };
}
