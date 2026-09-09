import "../lawn-mower-card.js";
import "./ha-icon.mjs";

// Deliberately local fixture: no authentication, device connection or live video.
const query = new URLSearchParams(location.search);
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
ctx.setLineDash([]); ctx.font="600 20px system-ui";ctx.fillStyle="#e5f2e9";
ctx.fillText("Main lawn",370,175);ctx.fillText("Side lawn",165,530);ctx.fillText("Orchard",595,570);
const png = canvas.toDataURL("image/png");
let sceneUrl;
const hass = {
  language:query.get("hassLocale") || query.get("locale") || "en",
  states:{}, entities:{}, services:{lawn_mower:{start_mowing:{},pause:{},dock:{}}},
  async callWS(message) { return { path: message.path }; },
  hassUrl(route) {
    if (route === backgroundPath) return png;
    if (route === path && query.get("map") !== "error") {
      if (sceneUrl) URL.revokeObjectURL(sceneUrl);
      sceneUrl = URL.createObjectURL(new Blob([JSON.stringify({schema_version:1,revision,map_index:0,map_id:1,name:"Garden · three zones",width:900,height:650,background_path:backgroundPath,
        overlay:{position:{x:640,y:330,heading:180},trail:[[[185,220],[665,240],[675,265],[190,245],[195,275],[685,295],[690,320],[200,300],[205,330],[640,350],[640,330]]],position_status:"current",updated_at:new Date(Date.now()-(query.get("map")==="stale"?120000:0)).toISOString(),max_age_seconds:90}})],{type:"application/json"}));
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
entity("sensor.demo_progress","62",{friendly_name:"Mission progress",unit_of_measurement:"%"});
entity("sensor.demo_area","329",{unit_of_measurement:"m²"});
entity("sensor.demo_total","531",{unit_of_measurement:"m²"});
if (query.get("status")) entity("sensor.demo_status",query.get("status"),{});
entity("image.demo_map","ready",{friendly_name:"Garden",mowing_map_api_path:path});
entity("camera.demo","idle",{friendly_name:"Mower camera",supported_features:2,...(query.get("camera")==="blocked"?{video_block_reason:"Demo privacy lock"}:{})});
// A local preview avoids camera_proxy requests from the disconnected fixture.
hass.states["camera.demo"].attributes.entity_picture=png;
delete hass.states["camera.demo"].last_updated;
const card=document.getElementById("mower");
card.setConfig({type:"custom:lawn-mower-card",entity:"lawn_mower.demo",layout:"hero",hero_layout:query.get("composition")==="cinematic"?"cinematic":"dashboard",name:"Garden mower",locale:query.get("locale") || "en",
  status_entity:query.get("status")?"sensor.demo_status":undefined,
  map_entity:query.get("map")==="none"?undefined:"image.demo_map",show_map:query.get("map")!=="none",show_point_cloud:false,
  camera_entity:query.get("camera")==="none"?undefined:"camera.demo",progress_entity:"sensor.demo_progress",coverage_entity:"sensor.demo_area",coverage_total_entity:"sensor.demo_total",control_entities:[],show_helper_actions:query.get("helpers")==="true"});
if (query.get("camera")==="none") {delete hass.states["camera.demo"];delete hass.entities["camera.demo"];}
card.hass=hass;

export { hass, entity, card };
