/**
 * Kemono Tweaks & Player
 *
 * Enhances Kemono/Coomer with a glassmorphism media player
 * and improved post title display.
 */

// Import CSS as raw strings
import baseCss from "./styles/base.css?inline";
import playerCss from "./styles/player.css?inline";

import { getConfig, registerMenuCommands } from "./config";
import { injectTitleShim } from "./utils/shim";
import { MediaPlayer, MediaType } from "./player/MediaPlayer";

// Debug logger
function log(msg: string) {
  // console.log(`[KemonoTweaks] ${msg}`);
}

// log("Script starting...");

// Inject CSS using robust DOM method (same as original script)
try {
  // log("Injecting styles...");
  const style = document.createElement("style");
  style.textContent = baseCss + playerCss;
  (document.head || document.documentElement).appendChild(style);
  // log("Styles injected.");
} catch (e) {
  // console.error("[KemonoTweaks] Error injecting styles:", e);
}

// Initialize configuration and menu commands
let config: any;
try {
  // log("Loading config...");
  config = getConfig();
  // log(`Config loaded: VideoEnabled=${config.videoEnabled}`);
  registerMenuCommands(config);
  // log("Menu commands registered.");
} catch (e) {
  console.error("[KemonoTweaks] Error loading config:", e);
  // Default config if failed
  config = { videoEnabled: true };
}

// Inject title shim early (before page content loads)
try {
  // log("Injecting title shim...");
  injectTitleShim();
  // log("Title shim injected.");
} catch (e) {
  console.error("[KemonoTweaks] Error injecting title shim:", e);
}

// Media player instance
const mediaPlayer = new MediaPlayer();

/**
 * Initialize the script when DOM is ready
 */
function initializeScript(): void {
  // log("Initializing script logic...");
  try {
    mediaPlayer.init();
    // log("MediaPlayer initialized.");

    // Media file extensions
    const audioExtensions = /\.(mp3|wav|m4a|ogg|flac)$/i;
    const videoExtensions = /\.(mp4|m4v|webm|mov)$/i;

    // Intercept clicks on media links
    window.addEventListener(
      "click",
      (e: MouseEvent) => {
        const link = (e.target as HTMLElement).closest(
          'a[href*="?f="]'
        ) as HTMLAnchorElement | null;

        if (link) {
          // Log click to verify interception works
          // log("Click intercepted on: " + link.href); // Commented out to reduce noise, enable if needed

          let type: MediaType | null = null;

          // Get filename from URL parameter or pathname
          let checkStr = "";
          try {
            const urlParams = new URLSearchParams(link.search);
            checkStr = urlParams.get("f") || "";
          } catch {
            // URL parsing failed
          }

          if (!checkStr) {
            checkStr = link.pathname;
          }

          // Determine media type
          if (audioExtensions.test(checkStr)) {
            type = "audio";
          } else if (config.videoEnabled && videoExtensions.test(checkStr)) {
            type = "video";
          }

          // Intercept if valid media type
          if (type) {
            // log(`Opening player for ${type}: ${checkStr}`);
            e.preventDefault();
            e.stopPropagation();

            let title = "Media Player";
            const titleElement = document.querySelector("h1.post__title");
            if (titleElement) {
              title = titleElement.textContent?.trim() || title;
            } else if (checkStr) {
              title = decodeURIComponent(checkStr);
            }

            mediaPlayer.open(link.href, title, type);
          }
        }
      },
      true // Capture phase
    );
    // log("Click listener attached.");
  } catch (e) {
    console.error("[KemonoTweaks] Error in initializeScript:", e);
  }
}

// Initialize when body is available
if (document.body) {
  // log("Body already available, initializing.");
  initializeScript();
} else {
  // log("Waiting for body via MutationObserver...");
  new MutationObserver((_, observer) => {
    if (document.body) {
      // log("Body found.");
      initializeScript();
      observer.disconnect();
    }
  }).observe(document.documentElement, { childList: true });
}
