import { icons } from "./icons";

/**
 * HTML template for the media player modal
 */
export function createPlayerTemplate(): string {
  return `
    <div class="kt-modal-overlay" id="kt-media-modal" style="display: none;">
      <div class="kt-player-container" id="kt-player-container">
        <div class="kt-player-backdrop"></div>

        <div class="kt-top-bar">
          <div class="kt-window-controls">
            <button id="kt-minimize-btn" class="kt-control-btn" aria-label="Minimize">
              ${icons.minimize}
            </button>
            <button id="kt-close-btn" class="kt-control-btn kt-close-btn" aria-label="Close">
              ${icons.close}
            </button>
          </div>
        </div>

        <!-- Video Element Wrapper -->
        <div class="kt-video-wrapper" style="display:none;">
          <video class="kt-video-element" id="kt-video-element" preload="metadata"></video>
        </div>

        <div class="kt-content-wrapper">
          <!-- Album Art (Audio Only) -->
          <div class="kt-album-art">
            ${icons.music}
          </div>

          <div class="kt-main-column">
            <div class="kt-title-container">
              <span class="kt-expand-arrow">▼</span>
              <h3 class="kt-media-title"></h3>
            </div>

            <!-- Audio Element (Hidden) -->
            <audio id="kt-audio-element" preload="metadata"></audio>

            <div class="kt-media-loader">
              <div class="kt-progress-bar-loader">
                <div class="kt-progress-fill"></div>
              </div>
              <div class="kt-progress-text">Buffering...</div>
            </div>

            <div class="kt-controls-container" style="display:none;">
              <div class="kt-timeline-container">
                <div class="kt-timeline">
                  <div class="kt-hover-indicator"></div>
                  <div class="kt-buffered-bar"></div>
                  <div class="kt-progress-bar"></div>
                </div>
              </div>
              <div class="kt-controls">
                <div class="kt-controls-left">
                  <button class="kt-play-pause-btn" aria-label="Play/Pause">
                    ${icons.play}
                    ${icons.pause}
                  </button>
                  <div class="kt-volume-container">
                    <button class="kt-volume-btn" aria-label="Mute/Unmute">
                      ${icons.volumeHigh}
                      ${icons.volumeLow}
                      ${icons.volumeMuted}
                    </button>
                    <input class="kt-volume-slider" type="range" min="0" max="1" step="any" value="1">
                  </div>
                  <div class="kt-time-container">
                    <span class="kt-current-time">0:00</span> / <span class="kt-total-time">0:00</span>
                  </div>
                </div>
                <div class="kt-controls-right">
                  <button class="kt-fullscreen-btn" aria-label="Fullscreen" style="display:none;">
                    ${icons.fullscreen}
                  </button>
                  <button class="kt-download-btn" aria-label="Download Media">
                    ${icons.download}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
