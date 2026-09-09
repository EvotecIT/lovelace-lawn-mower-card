import { hass, entity, card } from "./dashboard.mjs";

const query = new URLSearchParams(location.search);
const editor = document.getElementById("editor");
const events = document.getElementById("events");
let commands = 0;
let currentHass = hass;

entity("sensor.garden_temperature", "21", { friendly_name:"Garden", unit_of_measurement:"°C", icon:"mdi:thermometer" });
entity("sensor.mower_blade_life", "78", { friendly_name:"Blade life", unit_of_measurement:"%", icon:"mdi:content-cut", remaining_hours:46 });
entity("sensor.mower_next_run", "Tomorrow · 09:00", { friendly_name:"Next run", icon:"mdi:calendar-clock" });
entity("sensor.mower_weekly_area", "1420", { friendly_name:"This week", unit_of_measurement:"m²", icon:"mdi:grass" });
entity("binary_sensor.garden_rain", "off", { friendly_name:"Rain detected", icon:"mdi:weather-rainy" });
entity("select.demo_mowing_height", "45 mm", { friendly_name:"Cutting height", options:["35 mm","45 mm","55 mm"] });
entity("switch.demo_evening_schedule", "on", { friendly_name:"Evening schedule" });
entity("script.mower_evening", "off", { friendly_name:"Evening routine" });
entity("sensor.mower_state_name", query.get("stateName") || "charging_completed", { friendly_name:"State" });
entity("select.mower_mowing_action", "All area", { friendly_name:"Akcja koszenia", options:["All area","Edge","Zone","Spot"] });
entity("select.mower_selected_map_display_rotation", "0 degrees", { friendly_name:"Obrót mapy", options:["0 degrees","90 degrees clockwise","180 degrees","270 degrees clockwise"] });
entity("select.mower_rain_delay", "2 hours", { friendly_name:"Opóźnienie po deszczu", options:["Until manually started","1 hour","2 hours","12 hours"] });
entity("select.mower_voice_language", "German", { friendly_name:"Język komunikatów", options:["English","German","Polish"] });
entity("select.mower_zone", "North-East", { friendly_name:"Strefa", options:["North-East","front_yard"] });
entity("sensor.mower_service_remaining", "52", { friendly_name:"Robot maintenance remaining", unit_of_measurement:"h", icon:"mdi:tools" });
entity("sensor.mower_brush_remaining", "257", { friendly_name:"Cleaning brush remaining", unit_of_measurement:"h", icon:"mdi:brush" });
// Custom garden entities need not belong to the mower device.
for (const id of ["sensor.garden_temperature","binary_sensor.garden_rain","script.mower_evening"]) delete hass.entities[id];

const example = () => {
  const requestedColumns=Number(query.get("columns"));
  const base = {
  type:"custom:lawn-mower-card", entity:"lawn_mower.demo", name:"Backyard mower", layout:"hero",
  hero_layout:query.get("composition") === "dashboard" ? "dashboard" : "cinematic",
  locale:query.get("locale") || "en", hero_theme:"auto", hero_density:"comfortable", tile_columns:Number.isInteger(requestedColumns)&&requestedColumns>=1&&requestedColumns<=4?requestedColumns:3,
  appearance:query.get("preset") === "legacy" ? undefined : query.get("preset") || "native",
  surface:query.get("surface") || "solid",
  map_entity:"image.demo_map", show_map:true, show_point_cloud:false, camera_entity:"camera.demo",
  progress_entity:"sensor.demo_progress", coverage_entity:"sensor.demo_area", coverage_total_entity:"sensor.demo_total",
  show_helper_actions:false, controls_mode:"custom", summary_mode:"custom", hero_sections:["tiles","actions","controls","details"],
  control_entities:["select.demo_mowing_height","switch.demo_evening_schedule"],
  summary_entities:[
    { entity:"sensor.garden_temperature", label:"Garden", icon:"mdi:thermometer" },
    { entity:"sensor.mower_next_run", label:"Next run", icon:"mdi:calendar-clock" },
    { entity:"binary_sensor.garden_rain", label:"Rain detected", icon:"mdi:weather-rainy", visibility:{entity:"binary_sensor.garden_rain",state:"on"} },
  ],
  tiles:[
    { entity:"sensor.mower_blade_life", label:"Blade life", icon:"mdi:content-cut", show_unavailable:true },
    { entity:"sensor.mower_weekly_area", label:"Mowed this week", icon:"mdi:grass" },
    { entity:"sensor.mower_blade_life", attribute:"remaining_hours", unit:"h", label:"Until blade change", icon:"mdi:clock-outline", show_unavailable:true },
  ],
  actions:[
    { type:"service", label:"Evening routine", icon:"mdi:weather-night", service:"script.turn_on", service_data:{entity_id:"script.mower_evening"}, confirmation:"Run the evening routine?" },
    { type:"more-info", label:"Blade details", icon:"mdi:information-outline", entity:"sensor.mower_blade_life" },
    { type:"pause", label:"Pause for rain", icon:"mdi:weather-rainy", visibility:{entity:"binary_sensor.garden_rain",state:"on"} },
  ],
  };
  if (query.get("fixture") !== "translations") return base;
  return {
    ...base,
    name:"Bodzio",
    summary_entities:[
      { entity:"sensor.mower_state_name", label:"Stan" },
      { entity:"select.mower_mowing_action", label:"Akcja" },
      { entity:"select.mower_selected_map_display_rotation", label:"Obrót" },
    ],
    control_entities:[
      "select.mower_mowing_action",
      "select.mower_selected_map_display_rotation",
      "select.mower_rain_delay",
      "select.mower_voice_language",
      "select.mower_zone",
    ],
    tiles:[
      { entity:"sensor.mower_service_remaining", label:"Service", icon:"mdi:tools" },
      { entity:"sensor.mower_blade_life", attribute:"remaining_hours", unit:"h", label:"Ostrze", icon:"mdi:content-cut" },
      { entity:"sensor.mower_brush_remaining", label:"Szczotka", icon:"mdi:brush" },
    ],
    actions:[
      { type:"service", label:"Resetuj service", icon:"mdi:restart", service:"button.press", service_data:{entity_id:"button.mower_reset_service"} },
      { type:"service", label:"Resetuj ostrze", icon:"mdi:restart", service:"button.press", service_data:{entity_id:"button.mower_reset_blade"} },
      { type:"service", label:"Resetuj szczotkę", icon:"mdi:restart", service:"button.press", service_data:{entity_id:"button.mower_reset_brush"} },
    ],
  };
};
let config = example();

function renderConfig() {
  card.setConfig(config); card.hass=currentHass;
  editor.setConfig(config); editor.hass=currentHass;
  document.getElementById("config").textContent=JSON.stringify(config,null,2);
  document.getElementById("layout").value=config.layout === "hero" ? config.hero_layout : config.layout;
  document.getElementById("locale").value=config.locale;
  document.getElementById("preset").value=config.appearance || "legacy";
  document.getElementById("surface").value=config.surface || "solid";
  document.getElementById("surface").disabled=!config.appearance;
}

function updateState(id, state) {
  currentHass={...currentHass,states:{...currentHass.states,[id]:{...currentHass.states[id],state,last_updated:new Date().toISOString()}}};
  card.hass=currentHass; editor.hass=currentHass;
}

hass.callService = async (domain, service, data) => {
  if (query.get("action") === "error") throw new Error("Simulated connection failure");
  commands++;
  events.textContent=`Simulated actions: ${commands} · ${domain}.${service} · ${JSON.stringify(data || {})} · No device connection.`;
  if (domain === "select") updateState(data.entity_id, data.option);
  if (domain === "switch") updateState(data.entity_id, service === "turn_on" ? "on" : "off");
  if (domain === "lawn_mower") updateState("lawn_mower.demo", service === "pause" ? "paused" : service === "dock" ? "returning" : "mowing");
};
card.addEventListener("hass-more-info", event => { events.textContent=`More info: ${event.detail.entityId} · No device connection.`; });
editor.addEventListener("config-changed", event => { config=event.detail.config; renderConfig(); });
document.getElementById("layout").addEventListener("change", event => {
  const value=event.target.value; config={...config,layout:value === "default" ? "default" : "hero",hero_layout:value === "dashboard" ? "dashboard" : "cinematic"};renderConfig();
});
document.getElementById("width").addEventListener("change", event => document.documentElement.style.setProperty("--preview-width",`${Number(event.target.value)}px`));
document.getElementById("theme").addEventListener("change", event => document.documentElement.classList.toggle("light",event.target.value === "light"));
document.getElementById("preset").addEventListener("change", event => { config={...config}; if(event.target.value === "legacy") delete config.appearance; else config.appearance=event.target.value;renderConfig(); });
document.getElementById("surface").addEventListener("change", event => { config={...config,surface:event.target.value};renderConfig(); });
document.getElementById("backdrop").addEventListener("change", event => document.documentElement.dataset.backdrop=event.target.value);
document.getElementById("locale").addEventListener("change", event => { config={...config,locale:event.target.value};renderConfig(); });
document.getElementById("rain").addEventListener("click", event => {
  const rainy=currentHass.states["binary_sensor.garden_rain"].state !== "on";
  updateState("binary_sensor.garden_rain",rainy ? "on" : "off");event.currentTarget.setAttribute("aria-pressed",String(rainy));
});
document.getElementById("availability").addEventListener("click", event => {
  const unavailable=currentHass.states["sensor.mower_blade_life"].state !== "unavailable";
  updateState("sensor.mower_blade_life",unavailable ? "unavailable" : "78");event.currentTarget.setAttribute("aria-pressed",String(unavailable));
});
document.getElementById("toggle-editor").addEventListener("click", event => {
  const panel=document.getElementById("editor-panel");panel.hidden=!panel.hidden;
  event.currentTarget.textContent=panel.hidden ? "Open visual editor" : "Close visual editor";
  event.currentTarget.setAttribute("aria-expanded",String(!panel.hidden));
});
document.getElementById("reset").addEventListener("click", () => { config=example();renderConfig(); });
document.getElementById("width").value=query.get("width") || "1080";
document.documentElement.style.setProperty("--preview-width", `${Number(document.getElementById("width").value)}px`);
if (query.get("theme") === "light") { document.documentElement.classList.add("light");document.getElementById("theme").value="light"; }
renderConfig();
