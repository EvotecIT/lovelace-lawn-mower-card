import assert from "node:assert/strict";
import test from "node:test";
import { historyDirection, historyPreferenceRows, historyMapBounds, historyPath, readHistoryDetail, readHistoryList } from "../src/task-history-logic.ts";
import { availableHeroViews, resolveHeroView } from "../src/hero-views.ts";
import { fetchPrivateApi } from "../src/private-api.ts";

const path = "/api/dreame_lawn_mower/task-history/entry";
const id = "a".repeat(32);
const task = { id, mode: 2, started_at: 1793181600, reported_at: 1793185200,
  duration_minutes: 60, area_sqm: 120, result: 1, detail_path: `${path}/${id}` };
const detail = () => ({ schema_version: 1, id, started_at: task.started_at,
  ended_at: task.reported_at, duration_minutes: 60, area_sqm: 120, mode: 2, result: 1,
  features: [{ kind: 0, zone_id: 4, points: [[100, 200], [300, 200], [100, 600]],
    tracks: [[[120, 240], [200, 240]], [[200, 280], [120, 280]]] }],
  faults: [[1793181700, 27]], zone_results: [[4, 2]],
  recorded_settings: { mowing_height_cm: 5.5, efficient_mode: 1 },
  per_zone_settings: true, photo_paths: [`${path}/${id}/photo/0`], battery: null });

test("History is offered only when its own authenticated entry endpoint exists", () => {
  assert.equal(historyPath(path), path);
  for (const value of ["https://external/history", `${path}/../other`, `${path}?token=secret`, "//external/history"]) assert.equal(historyPath(value), undefined);
  assert.deepEqual(availableHeroViews({ map:false, camera:false, pointCloud:false, history:true }), ["overview", "history"]);
  assert.equal(resolveHeroView("history", ["overview"]), "overview");
});

test("the list rejects references to another entry or external detail URL", () => {
  const parsed = readHistoryList({ schema_version:1, tasks:[task], stale:true }, path);
  assert.equal(parsed.stale, true); assert.equal(parsed.tasks[0].area_sqm, 120);
  assert.throws(() => readHistoryList({schema_version:1,tasks:[{...task,detail_path:`${path}-other/${id}`}]},path));
  assert.throws(() => readHistoryList({schema_version:2,tasks:[]},path));
  assert.throws(() => readHistoryList({schema_version:1,tasks:[task,task]},path));
  assert.throws(() => readHistoryList({schema_version:1,tasks:Array(31).fill(task)},path));
});

test("detail keeps historical track breaks and rejects mismatched private media", () => {
  const parsed = readHistoryDetail(detail(),path,id);
  assert.equal(parsed.features[0].tracks.length,2);
  assert.deepEqual(parsed.faults,[[1793181700,27]]);
  assert.deepEqual(parsed.recorded_settings,{mowing_height_cm:5.5,efficient_mode:1});
  assert.equal(parsed.battery,null);
  assert.throws(() => readHistoryDetail({...detail(),id:"b".repeat(32)},path,id));
  assert.throws(() => readHistoryDetail({...detail(),photo_paths:["https://vendor/private.jpg"]},path,id));
  assert.throws(() => readHistoryDetail({...detail(),photo_paths:[`${path}/another-task/photo/0`]},path,id));
  const bounds = historyMapBounds(parsed.features)!;
  assert.ok(bounds[0] < -300 && bounds[1] < 200);
});

test("invalid metrics, overlarge geometry, and unordered battery data cannot become measurements", () => {
  const raw = {...detail(),area_sqm:NaN,duration_minutes:true,
    features:[{...detail().features[0],points:Array(12001).fill([0,0])}],
    battery:{source:"observed",samples:[{at:200,level:75,charging:false,active:true},{at:100,level:60,charging:false,active:true}]}};
  const parsed = readHistoryDetail(raw,path,id);
  assert.equal(parsed.area_sqm,null); assert.equal(parsed.duration_minutes,null);
  assert.deepEqual(parsed.features[0].points,[]); assert.equal(parsed.battery,null);
});

test("signed reads accept only the requested local route and cancellation prevents a later fetch", async () => {
  const original = globalThis.fetch;
  const calls: unknown[][] = [];
  globalThis.fetch = async (...args) => { calls.push(args); return new Response("{}",{status:200}); };
  try {
    const hass = {callWS:async()=>({path:`${path}?authSig=private`}),hassUrl:(route:string)=>`http://ha.local${route}`} as any;
    await fetchPrivateApi(hass,path,new AbortController().signal);
    assert.equal(calls.length,1);
    assert.equal((calls[0][1] as RequestInit).cache,"no-store");
    hass.callWS=async()=>({path:`${path}-other?authSig=private`});
    await assert.rejects(fetchPrivateApi(hass,path,new AbortController().signal));
    assert.equal(calls.length,1);
    let finish!: (value:unknown)=>void;
    hass.callWS=()=>new Promise((resolve)=>{finish=resolve;});
    const controller=new AbortController();
    const pending=fetchPrivateApi(hass,path,controller.signal);
    controller.abort(); finish({path:`${path}?authSig=private`});
    await assert.rejects(pending,{name:"AbortError"});
    assert.equal(calls.length,1);
  } finally { globalThis.fetch=original; }
});

test("recorded direction mode gives a retained angle its meaning", () => {
  const battery = {source:"observed",coverage:"partial",samples:[],settings:{map_index:0,mode:1,zones:[
    {area_id:4,mowing_direction_mode:0,mowing_direction_degrees:45},
  ]}};
  const parsed=readHistoryDetail({...detail(),battery},path,id).battery!;
  assert.equal(parsed.settings.mode,1);
  assert.deepEqual(historyDirection(parsed.settings.zones[0]),{mode:0,degrees:null});
  assert.deepEqual(historyDirection({mowing_direction_mode:1,mowing_direction_degrees:45}),{mode:1,degrees:45});
  assert.deepEqual(historyDirection({mowing_direction_mode:2,mowing_direction_degrees:45}),{mode:2,degrees:45});
  assert.deepEqual(historyDirection({mowing_direction_degrees:45}),{mode:null,degrees:null});
});

test("global history preferences do not present inactive stored zone overrides", () => {
  const zones=[{area_id:0,mowing_height_cm:5.5},{area_id:4,mowing_height_cm:8}];
  assert.deepEqual(historyPreferenceRows({map_index:0,mode:0,zones}),[zones[0]]);
  assert.deepEqual(historyPreferenceRows({map_index:0,mode:1,zones}),zones);
  const parsed=readHistoryDetail({...detail(),battery:{source:"observed",samples:[],settings:{map_index:0,mode:0,zones}}},path,id).battery!;
  assert.equal(parsed.settings.mode,0);
  assert.deepEqual(historyPreferenceRows(parsed.settings),[zones[0]]);
});
