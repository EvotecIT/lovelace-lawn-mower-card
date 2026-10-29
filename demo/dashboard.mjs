import "../lawn-mower-card.js";
import "./ha-icon.mjs";
import { taskHistoryFixture } from "./task-history.mjs";

// Deliberately local fixture: no authentication, device connection or live video.
const query = new URLSearchParams(location.search);
if (query.get("theme")==="light") document.documentElement.classList.add("light");
document.documentElement.style.setProperty("--preview-width", `${Math.max(280, Math.min(1200, Number(query.get("width")) || 1080))}px`);
customElements.define("ha-card", class extends HTMLElement {
  connectedCallback() { this.style.display="block"; }
});
customElements.define("ha-camera-stream", class extends HTMLElement {
  connectedCallback() {
    this.style.cssText="display:grid;place-items:center;background:linear-gradient(155deg,#426350,#16312e)";
    this.attachShadow({ mode:"open" }).innerHTML = `<style>:host{display:grid;place-items:center;background:linear-gradient(155deg,#426350,#16312e);color:#e5f2e9;font:12px system-ui}div{text-align:center}strong{display:block;font-size:22px;margin-bottom:8px}</style><div><strong>▣</strong>Simulated camera preview<br>No live video connection</div>`;
  }
});

const path = "/api/dreame_lawn_mower/mowing-map/dashboard-demo";
const revision = "a".repeat(64);
const backgroundPath = `${path}/background/${revision}`;
const canvas = document.createElement("canvas");
canvas.width = 900; canvas.height = 650;
const ctx = canvas.getContext("2d");
const polygon = (points, fill, stroke) => {
  ctx.beginPath(); points.forEach(([x,y],i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y)); ctx.closePath();
  ctx.fillStyle=fill; ctx.fill(); ctx.strokeStyle=stroke; ctx.lineWidth=3; ctx.stroke();
};
polygon([[120,85],[735,110],[795,330],[655,460],[360,440],[130,335]], "#8bbe7040", "#91b87a");
polygon([[150,455],[345,490],[315,580],[110,545]], "#97ccab40", "#9bc7aa");
polygon([[540,530],[745,480],[805,565],[590,610]], "#77aac640", "#87b8ce");
for (const points of [[[245,420],[240,470]], [[590,450],[645,505]]]) {
  for (const [width,color,dash] of [[15,"#445b61",[]],[11,"#647b81",[]],[2,"#b7c7cc",[7,6]]]) {
    ctx.beginPath(); points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));
    ctx.lineWidth=width;ctx.lineCap="round";ctx.strokeStyle=color;ctx.setLineDash(dash);ctx.stroke();
  }
}
ctx.setLineDash([]);
// Like the integration: the same background without zone names for labels=0.
const unlabelled = canvas.toDataURL("image/png");
ctx.font="600 20px system-ui";ctx.fillStyle="#e5f2e9";
ctx.fillText("Main lawn",370,175);ctx.fillText("Side lawn",165,530);ctx.fillText("Orchard",595,570);
const png = canvas.toDataURL("image/png");
let sceneUrl;
// Optional geographic fixture (?geo=1 aligned, ?geo=new unaligned) at a neutral, non-garden location.
const geo = query.get("geo") ? {
  map_revision:"b".repeat(32),
  projection:{max_x:22500,min_y:-16250,scale:0.02,padding:0,native_width:900,native_height:650,rotation:0},
  georeference:query.get("geo")==="new" ? null : {anchor_x:0,anchor_y:0,latitude:52.37285,longitude:4.89366,heading:20,scale:0.001},
  // Label points in native units (pixel (450,190), (230,520), (670,555) through the projection).
  zones:[{zone_id:1,name:"Main lawn",label_x:0,label_y:-6750},{zone_id:2,name:"Side lawn",label_x:11000,label_y:9750},
    {zone_id:3,name:"Orchard",label_x:-11000,label_y:11500}],
} : {};
const taskHistory = taskHistoryFixture(query, png);
const hass = {
  language:query.get("hassLocale") || query.get("locale") || "en",
  states:{}, entities:{}, services:{lawn_mower:{start_mowing:{},pause:{},dock:{}},
    ...(query.get("geo")?{dreame_lawn_mower:{set_georeference:{}}}:{})},
  config:{latitude:52.37285,longitude:4.89366},
  async callWS(message) {
    if (query.get("history")==="loading" && message.path?.startsWith(taskHistory.path)) await new Promise(()=>{});
    return { path: message.path };
  },
  hassUrl(route) {
    const history = taskHistory.response(route);
    if (history) return history;
    if (route.split("&authSig")[0] === `${backgroundPath}?labels=0`) return unlabelled;
    if (route === backgroundPath) return png;
    if (route === path && query.get("map") !== "error") {
      if (sceneUrl) URL.revokeObjectURL(sceneUrl);
      sceneUrl = URL.createObjectURL(new Blob([JSON.stringify({schema_version:1,revision,map_index:0,map_id:1,name:"Garden · three zones",width:900,height:650,background_path:backgroundPath,
        ...geo,overlay:{position:{x:640,y:330,heading:180},trail:[[[185,220],[665,240],[675,265],[190,245],[195,275],[685,295],[690,320],[200,300],[205,330],[640,350],[640,330]]],position_status:query.get("dock")?"known_dock":"current",docked:Boolean(query.get("dock")),position_observed_at:new Date().toISOString(),updated_at:new Date(Date.now()-(query.get("map")==="stale"?120000:0)).toISOString(),max_age_seconds:90}})],{type:"application/json"}));
      return sceneUrl;
    }
    return route;
  },
  async callService(domain, service) {
    if (query.get("action") === "error") throw new Error("Simulated connection failure");
    document.getElementById("events").textContent = `Simulated ${domain}.${service}; no device connection.`;
  },
};
if (query.has("formattedState")) hass.formatEntityState=()=>query.get("formattedState");
const entity = (id,state,attributes) => {
  hass.states[id]={entity_id:id,state,attributes,last_updated:new Date().toISOString()};
  hass.entities[id]={platform:"dreame_lawn_mower",device_id:"dashboard-demo"};
};
entity("lawn_mower.demo",query.get("state") || "mowing",{friendly_name:"Garden mower",supported_features:7,...(query.get("battery")==="none"?{}:{battery_level:query.get("battery") || 87})});
if (query.has("history")) hass.states["lawn_mower.demo"].attributes.task_history_api_path=taskHistory.path;
if (query.has("allViews")) hass.services.dreame_lawn_mower={download_session_photos:{}};
entity("sensor.demo_progress","62",{friendly_name:"Mission progress",unit_of_measurement:"%"});
entity("sensor.demo_area","329",{unit_of_measurement:"m²"});
entity("sensor.demo_total","531",{unit_of_measurement:"m²"});
if (query.get("status")) entity("sensor.demo_status",query.get("status"),{});
entity("image.demo_map","ready",{friendly_name:"Garden",mowing_map_api_path:path,entity_picture:png});
if (query.has("allViews")) hass.states["image.demo_map"].attributes.point_cloud_api_path="/api/dreame_lawn_mower/point-cloud/dashboard-demo/0";
entity("camera.demo","idle",{friendly_name:"Mower camera",supported_features:2,...(query.get("camera")==="blocked"?{video_block_reason:"Demo privacy lock"}:{})});
// A local preview avoids camera_proxy requests from the disconnected fixture.
hass.states["camera.demo"].attributes.entity_picture=png;
delete hass.states["camera.demo"].last_updated;
delete hass.states["image.demo_map"].last_updated;
const card=document.getElementById("mower");
card.setConfig({type:"custom:lawn-mower-card",entity:"lawn_mower.demo",layout:"hero",hero_layout:query.get("composition")==="cinematic"?"cinematic":"dashboard",hero_default_tab:query.get("defaultTab") || undefined,name:"Garden mower",locale:query.get("locale") || "en",map_background:query.get("background") || undefined,appearance:query.get("preset")==="legacy"?undefined:"native",
  dashboard_panels:query.get("panels")==="none"?[]:query.get("panels")==="camera"?["camera"]:query.get("panels")==="mission"?["mission"]:undefined,
  status_entity:query.get("status")?"sensor.demo_status":undefined,
  map_entity:query.get("map")==="none"?undefined:"image.demo_map",show_map:query.get("map")!=="none",show_point_cloud:query.has("allViews"),
  camera_entity:query.get("camera")==="none"?undefined:"camera.demo",progress_entity:"sensor.demo_progress",coverage_entity:"sensor.demo_area",coverage_total_entity:"sensor.demo_total",control_entities:[],show_helper_actions:query.get("helpers")==="true"});
if (query.get("camera")==="none") {delete hass.states["camera.demo"];delete hass.entities["camera.demo"];}
card.hass=hass;

export { hass, entity, card };
