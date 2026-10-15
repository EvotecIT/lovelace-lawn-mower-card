import assert from "node:assert/strict";
import test from "node:test";
import {
  albumFolderId, albumPhoto, collectAlbum, localMediaSource, mediaChildren, photoAlbumAvailable,
  resolvedMediaUrl, sortAlbum,
} from "../src/photo-album-logic.ts";
import { availableHeroViews } from "../src/hero-views.ts";

const root = "media-source://media_source";

test("the album needs the Dreame integration and its photo service", () => {
  const entities = { "lawn_mower.garden": { platform: "dreame_lawn_mower" } };
  const services = { dreame_lawn_mower: { download_session_photos: {} } };
  assert.equal(photoAlbumAvailable("lawn_mower.garden", entities, services), true);
  assert.equal(photoAlbumAvailable("lawn_mower.garden", entities, {}), false);
  assert.equal(photoAlbumAvailable("lawn_mower.other", entities, services), false);
  assert.deepEqual(availableHeroViews({ map: false, pointCloud: false, camera: false, photos: true }),
    ["overview", "photos"]);
});

test("media browsing keeps only typed media-source children", () => {
  const children = mediaChildren({ children: [
    { media_content_id: `${root}/media/.`, title: "My media", media_class: "directory", can_expand: true },
    { media_content_id: "https://example.com/x", title: "outside" },
    "junk",
    { media_content_id: `${root}/media/dreame_lawn_mower/garden/a/1792026162.jpg`,
      title: "1792026162.jpg", media_class: "image", can_expand: false },
  ] });
  assert.equal(children.length, 2);
  // Several sources: the local one is a child ending in "/.".
  assert.equal(localMediaSource({ media_content_id: root, children: [
    { media_content_id: `${root}/media/.`, title: "My media", media_class: "directory", can_expand: true },
  ] }), `${root}/media`);
  // A single source: Home Assistant returns the source itself (seen live).
  assert.equal(localMediaSource({ media_content_id: `${root}/media/.`, children: [
    { media_content_id: `${root}/media/dreame_lawn_mower`, title: "dreame_lawn_mower", can_expand: true },
  ] }), `${root}/media`);
  assert.equal(localMediaSource({ media_content_id: root, children: [] }), undefined);
  assert.equal(albumFolderId(`${root}/media`, "lawn_mower.garden"),
    `${root}/media/dreame_lawn_mower/garden`);
  assert.deepEqual(mediaChildren(null), []);
});

test("photo names give the capture time and person detections", () => {
  const item = (title: string, canExpand = false) => ({
    id: `${root}/media/x/${title}`, title, mediaClass: "image", canExpand,
  });
  assert.deepEqual(albumPhoto(item("1792074542_person.jpg")), {
    id: `${root}/media/x/1792074542_person.jpg`, title: "1792074542_person.jpg",
    takenAt: 1792074542000, person: true,
  });
  assert.equal(albumPhoto(item("1792026162.jpg"))?.person, false);
  assert.equal(albumPhoto(item("notes.txt")), undefined);
  assert.equal(albumPhoto(item("1792026162.jpg", true)), undefined);
});

test("the album is newest first and shows a reused name once", () => {
  const photo = (title: string, id = title) => albumPhoto({
    id: `${root}/media/${id}`, title, mediaClass: "image", canExpand: false,
  })!;
  const sorted = sortAlbum([
    photo("1792026162.jpg"), photo("1792074542_person.jpg"),
    photo("1792026163.jpg", "a"), photo("1792026163.jpg", "b"),
  ]);
  assert.deepEqual(sorted.map((item) => item.title),
    ["1792074542_person.jpg", "1792026163.jpg", "1792026162.jpg"]);
});

test("only Home Assistant-relative signed URLs are used", () => {
  assert.equal(resolvedMediaUrl({ url: "/media/local/x.jpg?authSig=abc" }), "/media/local/x.jpg?authSig=abc");
  for (const url of ["https://example.com/x.jpg", "//example.com/x.jpg", 42]) {
    assert.equal(resolvedMediaUrl({ url }), undefined);
  }
  assert.equal(resolvedMediaUrl(undefined), undefined);
});

test("the album walks every per-photo sub-folder, beyond the first batch", async () => {
  const folder = `${root}/media/dreame_lawn_mower/garden`;
  const item = (id: string, title: string, canExpand: boolean) => ({ id, title, mediaClass: "", canExpand });
  // Mirrors a real archive: one folder per photo plus a person-photo folder.
  const tree: Record<string, ReturnType<typeof item>[]> = {
    [folder]: [
      ...Array.from({ length: 7 }, (_, i) => item(`${folder}/h${i}`, `h${i}`, true)),
      item(`${folder}/personnes`, "personnes", true),
      item(`${folder}/-1234_0001.2026-10-15_275_202_3cm_processed.png`, "-1234_0001.2026-10-15_275_202_3cm_processed.png", false),
    ],
    [`${folder}/personnes`]: [item(`${folder}/personnes/1792074542_person.jpg`, "1792074542_person.jpg", false)],
  };
  for (let i = 0; i < 7; i += 1) {
    tree[`${folder}/h${i}`] = [item(`${folder}/h${i}/17920261${60 + i}.jpg`, `17920261${60 + i}.jpg`, false)];
  }
  const photos = await collectAlbum(async (id) => tree[id] ?? [], folder, 300, 3);
  assert.equal(photos.length, 8);
  assert.equal(photos[0].title, "1792074542_person.jpg");
  assert.equal(photos.at(-1)?.title, "1792026160.jpg");
});
