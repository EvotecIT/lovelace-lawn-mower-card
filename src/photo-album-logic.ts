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

/** Read the returned media_source children without silently dropping archives. */
export function mediaChildren(value: unknown): MediaItem[] {
  const children = typeof value === "object" && value !== null
    ? (value as { children?: unknown }).children : undefined;
  if (!Array.isArray(children)) return [];
  const result: MediaItem[] = [];
  for (const child of children) {
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

/**
 * Find the local media source. With a single source, Home Assistant returns
 * that source itself for the root; otherwise it is the child ending in "/.".
 */
export function localMediaSource(root: unknown): string | undefined {
  const id = typeof root === "object" && root !== null
    ? (root as { media_content_id?: unknown }).media_content_id : undefined;
  if (typeof id === "string" && id.startsWith(`${MEDIA_SOURCE_ROOT}/`) && id.endsWith("/.")) {
    return id.slice(0, -2);
  }
  const sources = mediaChildren(root).filter((child) => child.id.endsWith("/.") && child.canExpand);
  const local = sources.find((child) => child.id === `${MEDIA_SOURCE_ROOT}/local/.`) ?? sources[0];
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

/** Newest first; a cloud object is identified by its full archive path. */
export function sortAlbum(photos: readonly AlbumPhoto[]): AlbumPhoto[] {
  const seen = new Set<string>();
  return [...photos]
    .sort((a, b) => (b.takenAt ?? 0) - (a.takenAt ?? 0) || a.title.localeCompare(b.title))
    .filter((photo) => {
      if (seen.has(photo.id)) return false;
      seen.add(photo.id);
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

/**
 * Walk the album folder breadth first, in batches, and return its photos.
 * The integration keeps each cloud object in its own sub-folder.
 */
export async function collectAlbum(
  browse: (id: string) => Promise<MediaItem[]>,
  folder: string,
  pageSize = 300,
  batchSize = 10,
  current: () => boolean = () => true,
  progress?: (photos: AlbumPhoto[]) => void,
): Promise<AlbumPhoto[]> {
  const folders = [folder];
  const seen = new Set(folders);
  const photos: AlbumPhoto[] = [];
  for (let next = 0; next < folders.length;) {
    if (!current()) return [];
    const batch = folders.slice(next, next + batchSize);
    next += batch.length;
    const listings = await Promise.all(batch.map((id) => browse(id)));
    if (!current()) return [];
    for (const children of listings) {
      for (const child of children) {
        if (child.canExpand) {
          if (child.id.startsWith(`${folder}/`) && !seen.has(child.id)) {
            seen.add(child.id);
            folders.push(child.id);
          }
        } else {
          const photo = albumPhoto(child);
          if (photo) photos.push(photo);
        }
      }
    }
    if (next % pageSize < batch.length) progress?.(sortAlbum(photos));
  }
  return sortAlbum(photos);
}
