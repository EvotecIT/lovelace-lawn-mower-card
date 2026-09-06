import type { HeroImagePosition } from "./hero-image";
import type { LocalePreference } from "./localization";
import type { MapFit, MapPosition } from "./map-presentation";

export type HassEntity = {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
  last_changed?: string;
  last_updated?: string;
};

export type HomeAssistant = {
  language?: string;
  locale?: { language?: string };
  states: Record<string, HassEntity>;
  entities?: Record<
    string,
    {
      platform?: string;
      device_id?: string;
      name?: string;
      translation_key?: string;
    }
  >;
  services?: Record<string, Record<string, unknown>>;
  callService(
    domain: string,
    service: string,
    data?: Record<string, unknown>,
  ): Promise<void>;
  callWS<T>(message: Record<string, unknown>): Promise<T>;
  hassUrl(path: string): string;
};

export type LawnMowerTileConfig = {
  entity: string;
  label?: string;
  icon?: string;
};

export type LawnMowerActionConfig = {
  type?: "start" | "pause" | "dock" | "more-info" | "service";
  label?: string;
  icon?: string;
  entity?: string;
  service?: string;
  service_data?: Record<string, unknown>;
};

export type LawnMowerCardConfig = {
  type: string;
  entity: string;
  locale?: LocalePreference;
  name?: string;
  layout?: "default" | "compact" | "wide" | "hero";
  hero_image?: string;
  hero_layout?: "cinematic" | "dashboard";
  hero_image_position?: HeroImagePosition;
  map_entity?: string;
  map_fit?: MapFit;
  map_position?: MapPosition;
  camera_entity?: string;
  show_map?: boolean;
  show_point_cloud?: boolean;
  status_entity?: string;
  battery_entity?: string;
  progress_entity?: string;
  coverage_entity?: string;
  coverage_total_entity?: string;
  show_default_actions?: boolean;
  show_helper_actions?: boolean;
  show_advanced_details?: boolean;
  control_entities?: string[];
  summary_entities?: string[];
  actions?: LawnMowerActionConfig[];
  tiles?: LawnMowerTileConfig[];
};

export type ConfigChangedDetail = {
  config: LawnMowerCardConfig;
};

export function getStubConfig(): LawnMowerCardConfig {
  return {
    type: "custom:lawn-mower-card",
    entity: "lawn_mower.my_mower",
  };
}
