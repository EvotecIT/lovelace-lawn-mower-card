/** Pure helpers for the mower photo album read through Home Assistant media sources. */
import type { EntityRegistryEntries } from "./card-logic.ts";

export const MEDIA_SOURCE_ROOT = "media-source://media_source";
const DREAME_DOMAIN = "dreame_lawn_mower";
const PHOTO_NAME = /^(\d{9,11})(_person)?\.(?:jpe?g|png)$/i;

export type MediaItem = {
  id: string;
  title: string;
  mediaClass: string;
  canExpand: boolean;
};

export type AlbumPhoto = {
  id: string;
  title: string;
  takenAt: number | null;
  person: boolean;
};

/** The integration saves photos only when it also offers the download service. */
export function photoAlbumAvailable(
  mowerEntityId: string,
  entities: EntityRegistryEntries | undefined,
  services: Record<string, Record<string, unknown> | undefined> | undefined,
): boolean {
  return (
    entities?.[mowerEntityId]?.platform === DREAME_DOMAIN &&
    Boolean(services?.[DREAME_DOMAIN]?.download_session_photos)
  );
}

/** Read a media_source/browse_media response into bounded, typed children. */
export function mediaChildren(value: unknown, limit = 500): MediaItem[] {
  const children = typeof value === "object" && value !== null
    ? (value as { children?: unknown }).children : undefined;
  if (!Array.isArray(children)) return [];
  const result: MediaItem[] = [];
  for (const child of children.slice(0, limit)) {
    if (typeof child !== "object" || child === null) continue;
    const item = child as Record<string, unknown>;
    const id = item.media_content_id;
    if (typeof id !== "string" || !id.startsWith(`${MEDIA_SOURCE_ROOT}/`)) continue;
    result.push({
      id,
      title: typeof item.title === "string" ? item.title : "",
      mediaClass: typeof item.media_class === "string" ? item.media_class : "",
      canExpand: item.can_expand === true,
    });
  }
  return result;
}

/** The local media source is the root child whose id ends with "/.". */
export function localMediaSource(children: readonly MediaItem[]): string | undefined {
  const local = children.find((child) => child.id.endsWith("/.") && child.canExpand);
  return local ? local.id.slice(0, -2) : undefined;
}

/** The integration archives each mower under dreame_lawn_mower/<object id>. */
export function albumFolderId(source: string, mowerEntityId: string): string {
  const objectId = mowerEntityId.split(".", 2)[1] || mowerEntityId;
  return `${source}/${DREAME_DOMAIN}/${objectId}`;
}

export function albumPhoto(item: MediaItem): AlbumPhoto | undefined {
  const match = PHOTO_NAME.exec(item.title);
  if (item.canExpand || !match) return undefined;
  return {
    id: item.id,
    title: item.title,
    takenAt: Number(match[1]) * 1000,
    person: Boolean(match[2]),
  };
}

/** Newest first; identical cloud names saved twice are shown once. */
export function sortAlbum(photos: readonly AlbumPhoto[]): AlbumPhoto[] {
  const seen = new Set<string>();
  return [...photos]
    .sort((a, b) => (b.takenAt ?? 0) - (a.takenAt ?? 0) || a.title.localeCompare(b.title))
    .filter((photo) => {
      if (seen.has(photo.title)) return false;
      seen.add(photo.title);
      return true;
    });
}

/** Accept only a Home Assistant-relative signed media URL. */
export function resolvedMediaUrl(value: unknown): string | undefined {
  const url = typeof value === "object" && value !== null
    ? (value as { url?: unknown }).url : undefined;
  return typeof url === "string" && url.startsWith("/") && !url.startsWith("//")
    ? url : undefined;
}
