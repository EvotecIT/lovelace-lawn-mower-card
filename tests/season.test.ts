import assert from "node:assert/strict";
import test from "node:test";
import { readSeason, seasonSources, seasonStart, seasonUnitFactor } from "../src/season-logic.ts";

const sources = { area: "sensor.mower_total_mowed_area", minutes: "sensor.mower_total_mowing_time", sessions: "sensor.mower_total_mowing_sessions" };
const units = { area: "m²", minutes: "min", sessions: null };
const now = new Date(2026, 9, 30, 12);
const month = (year: number, index: number, change: number) => ({ start: new Date(year, index, 1).getTime(), change });

test("only the mower's lifetime counters are season sources", () => {
  const states = {
    "sensor.mower_total_mowed_area": { attributes: { state_class: "total_increasing" } },
    "sensor.mower_total_mowing_time": { attributes: { state_class: "measurement" } },
  };
  const found = seasonSources(states, (domain, suffix) => `${domain}.mower_${suffix}`);
  assert.deepEqual(found, { area: "sensor.mower_total_mowed_area" });
  assert.deepEqual(seasonSources(states, () => undefined), {});
});

test("Husqvarna's lifetime cutting time counts as mowing time", () => {
  const resolve = (domain: string, suffix: string) => `${domain}.automower_${suffix}`;
  // Husqvarna reports its counters with state class total, not total_increasing.
  const husqvarna = { "sensor.automower_total_cutting_time": { attributes: { state_class: "total" } } };
  assert.deepEqual(seasonSources(husqvarna, resolve), { minutes: "sensor.automower_total_cutting_time" });
  const both = { ...husqvarna, "sensor.automower_total_mowing_time": { attributes: { state_class: "total_increasing" } } };
  assert.deepEqual(seasonSources(both, resolve), { minutes: "sensor.automower_total_mowing_time" });
});

test("the query reaches back to the start of last year", () => {
  assert.deepEqual(seasonStart(now), new Date(2025, 0, 1));
});

test("monthly changes become this season and last season", () => {
  const season = readSeason({
    [sources.area]: [month(2025, 5, 900), month(2025, 6, 1100), month(2026, 3, 400), month(2026, 4, 600), month(2026, 9, 50)],
    [sources.minutes]: [month(2026, 3, 120), month(2026, 4, 180)],
    [sources.sessions]: [month(2026, 3, 4), month(2026, 4, 6)],
  }, units, sources, now);
  assert.ok(season);
  assert.equal(season.year, 2026);
  assert.equal(season.chart, "area");
  assert.equal(season.months[3].area, 400);
  assert.equal(season.months[9].area, 50);
  assert.equal(season.months[0].area, null);
  assert.deepEqual(season.total, { area: 1050, minutes: 300, sessions: 10 });
  assert.equal(season.previousTotal.area, 2000);
  assert.equal(season.previousTotal.minutes, null);
});

test("statistics in other units are converted, unknown units dropped", () => {
  assert.equal(seasonUnitFactor("area", "ha"), 1e4);
  assert.equal(seasonUnitFactor("minutes", "h"), 60);
  assert.equal(seasonUnitFactor("area", "furlong²"), undefined);
  assert.equal(seasonUnitFactor("sessions", "runs"), undefined);
  const season = readSeason({ [sources.area]: [month(2026, 4, 0.05)], [sources.minutes]: [month(2026, 4, 2)] },
    { area: "ha", minutes: "h" }, sources, now);
  assert.equal(season?.total.area, 500);
  assert.equal(season?.total.minutes, 120);
  assert.equal(readSeason({ [sources.area]: [month(2026, 4, 5)] }, { area: "furlong²" }, sources, now), undefined);
});

test("resets, future months, bad rows and an empty season don't invent mowing", () => {
  const season = readSeason({ [sources.area]: [
    month(2026, 3, -800), month(2026, 4, 300), { start: "nonsense", change: 5 }, { start: 0, change: "5" }, month(2026, 11, 999),
  ] }, units, sources, now);
  assert.equal(season?.months[3].area, 0);
  assert.equal(season?.total.area, 300);
  assert.equal(season?.months[11].area, null);
  assert.equal(readSeason({ [sources.area]: [month(2026, 4, 0)] }, units, sources, now), undefined);
  assert.equal(readSeason(null, units, sources, now), undefined);
});

test("ISO start times from older Home Assistant releases are read too", () => {
  const season = readSeason({ [sources.area]: [{ start: new Date(2026, 4, 1).toISOString(), change: 75 }] }, units, sources, now);
  assert.equal(season?.months[4].area, 75);
});
