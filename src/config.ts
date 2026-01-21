/**
 * Configuration and GM menu commands
 */

declare const GM_getValue: <T>(key: string, defaultValue: T) => T;
declare const GM_setValue: (key: string, value: unknown) => void;
declare const GM_registerMenuCommand: (caption: string, onClick: () => void) => void;

export interface Config {
  videoEnabled: boolean;
}

export function getConfig(): Config {
  return {
    videoEnabled: GM_getValue("enableVideoPlayer", true),
  };
}

export function registerMenuCommands(config: Config): void {
  GM_registerMenuCommand(
    `Video Player: ${config.videoEnabled ? "✅ ON" : "❌ OFF"} (Click to Toggle)`,
    () => {
      GM_setValue("enableVideoPlayer", !config.videoEnabled);
      location.reload();
    }
  );
}
