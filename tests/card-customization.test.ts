import assert from "node:assert/strict";
import test from "node:test";
import { configuredTile, conditionMatches, contentMode, controlGroups, heroSections, selectContent, summaryConfig, summaryItems, tileColumns } from "../src/card-customization.ts";
import type { HassEntity, LawnMowerCardConfig } from "../src/card-config.ts";

const config: LawnMowerCardConfig = { type:"custom:lawn-mower-card", entity:"lawn_mower.demo" };
const state = (id: string, value: string, attributes = {}): HassEntity => ({ entity_id:id, state:value, attributes });

test("content modes distinguish empty custom lists from discovery and preserve legacy defaults", () => {
  assert.equal(contentMode(undefined, "auto"), "auto");
  assert.equal(contentMode(undefined, "custom"), "custom");
  assert.deepEqual(selectContent("custom", [], ["automatic"]), []);
  assert.deepEqual(selectContent("auto", ["custom"], ["automatic"]), ["automatic"]);
  assert.deepEqual(selectContent("hidden", ["custom"], ["automatic"]), []);
  assert.deepEqual(selectContent("append", ["second", "first"], ["automatic"]), ["second", "first", "automatic"]);
});

test("explicit control order includes settings that automatic discovery normally groups", () => {
  const ids = ["switch.demo_rain_protection", "select.demo_map"];
  assert.deepEqual(controlGroups(ids, { ...config, controls_mode:"custom", control_entities:ids }).inline, ids);
  assert.deepEqual(controlGroups(ids, { ...config, controls_mode:"append", control_entities:ids }).settings, []);
  assert.deepEqual(controlGroups(ids, config).settings, [ids[0]]);
  assert.deepEqual(controlGroups(ids, config).inline, [ids[1]]);
});

test("registry-renamed device settings retain automatic settings grouping", () => {
  const id = "select.delay_after_weather";
  const metadata = {
    [id]: {
      platform: "dreame_lawn_mower",
      translation_key: "rain_delay",
    },
  };

  assert.deepEqual(controlGroups([id], config, metadata).settings, [id]);
  assert.deepEqual(controlGroups([id], config, metadata).inline, []);
});

test("other integrations are not grouped as Dreame settings by suffix", () => {
  const id = "select.personal_rain_delay";
  const metadata = {
    [id]: {
      platform: "other",
      translation_key: "rain_delay",
    },
  };

  assert.deepEqual(controlGroups([id], config, metadata).settings, []);
  assert.deepEqual(controlGroups([id], config, metadata).inline, [id]);
});

test("visibility tracks raw entity state and fails closed for missing or unavailable sources", () => {
  const condition = { entity:"binary_sensor.rain", state:"on" };
  assert.equal(conditionMatches(undefined, {}), true);
  for (const value of ["off", "unknown", "unavailable"]) {
    assert.equal(conditionMatches(condition, { [condition.entity]:state(condition.entity,value) }), false);
  }
  assert.equal(conditionMatches(condition, {}), false);
  assert.equal(conditionMatches(condition, { [condition.entity]:state(condition.entity,"on") }), true);
});

test("tiles format state or an attribute, preserve zero, and keep icons out of labels", () => {
  const id = "sensor.blades";
  const states = { [id]:state(id,"78",{friendly_name:"Blade life",unit_of_measurement:"%",remaining:0,icon:"mdi:content-cut"}) };
  const formatted = (entity: HassEntity) => `${entity.state} ${entity.attributes.unit_of_measurement}`;
  assert.deepEqual(configuredTile({entity:id},states,formatted,"Unavailable"), {label:"Blade life",value:"78 %",icon:"mdi:content-cut",unavailable:false});
  assert.equal(configuredTile({entity:id,attribute:"remaining",unit:"h"},states,formatted,"Unavailable")?.value,"0 h");
  assert.equal(
    configuredTile(
      {entity:id,attribute:"remaining"},
      states,
      formatted,
      "Unavailable",
      (_entity, attribute, value) => `${attribute}: ${value}`,
    )?.value,
    "remaining: 0",
  );
  assert.equal(configuredTile({entity:id,unit:""},states,formatted,"Unavailable")?.value,"78");
  assert.equal(summaryConfig(id).entity,id);
  const custom = {entity:id,label:"Custom"};
  assert.equal(summaryConfig(custom),custom);
});

test("unavailable policy covers missing entities and unsupported attributes without fabricating values", () => {
  const id="sensor.blades";
  const formatted=() => "should not format";
  for (const states of [{}, {[id]:state(id,"unavailable")}, {[id]:state(id,"unknown")}]) {
    assert.equal(configuredTile({entity:id},states,formatted,"Unavailable"),undefined);
    assert.equal(configuredTile({entity:id,show_unavailable:true},states,formatted,"Unavailable")?.value,"Unavailable");
  }
  assert.equal(configuredTile({entity:id,attribute:"metadata"},{[id]:state(id,"on",{metadata:{value:1}})},formatted,"Unavailable"),undefined);
});

test("section ordering preserves an intentionally empty list and filters unsupported sections", () => {
  assert.deepEqual(heroSections(undefined),["controls","tiles","actions","details"]);
  assert.deepEqual(heroSections([]),[]);
  assert.deepEqual(heroSections(["actions","tiles","actions"]),["actions","tiles"]);
  assert.equal(tileColumns(4),4);
  for (const invalid of [0,5,2.5,"4","1;display:none"]) assert.equal(tileColumns(invalid),undefined);
});

test("configured summary chips remain ordered beyond four and suppress duplicate automatic text", () => {
  const configured = Array.from({length:6},(_,index) => ({label:`Custom ${index}`,value:"on"}));
  const automatic = [{label:"",value:"Custom 0 on"},{label:"",value:"Battery 78 %"}];
  assert.deepEqual(summaryItems(configured,automatic,"append"),[...configured,automatic[1]]);
  assert.equal(summaryItems([],configured,"auto",true).length,4);
  assert.equal(summaryItems(configured,automatic,"custom").length,6);
});
