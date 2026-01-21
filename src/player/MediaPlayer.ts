import { createPlayerTemplate } from "./template";
import { icons } from "./icons";

declare const GM_download: (details: { url: string; name: string; saveAs?: boolean }) => void;

declare const GM_xmlhttpRequest: (details: {
  method: string;
  url: string;
  responseType: string;
  onprogress?: (progress: { lengthComputable: boolean; loaded: number; total: number }) => void;
  onload?: (response: { response: Blob }) => void;
  onerror?: () => void;
  onabort?: () => void;
}) => { abort: () => void };

export type MediaType = "audio" | "video";

interface PlayerElements {
  modalOverlay: HTMLElement;
  playerContainer: HTMLElement;
  backdrop: HTMLElement;
  albumArt: HTMLElement;
  videoWrapper: HTMLElement;
  audioEl: HTMLAudioElement;
  videoEl: HTMLVideoElement;
  closeBtn: HTMLElement;
  minimizeBtn: HTMLElement;
  titleContainer: HTMLElement;
  titleEl: HTMLElement;
  loaderContainer: HTMLElement;
  progressFill: HTMLElement;
  progressText: HTMLElement;
  controlsContainer: HTMLElement;
  playPauseBtn: HTMLElement;
  volumeBtn: HTMLElement;
  volumeSlider: HTMLInputElement;
  currentTimeEl: HTMLElement;
  totalTimeEl: HTMLElement;
  timelineContainer: HTMLElement;
  progressBar: HTMLElement;
  bufferedBar: HTMLElement;
  hoverIndicator: HTMLElement;
  downloadBtn: HTMLElement;
  fullscreenBtn: HTMLElement;
}

/**
 * Media Player class - handles audio/video playback in a glassmorphism modal
 */
export class MediaPlayer {
  private isInitialized = false;
  private elements: PlayerElements | null = null;
  private currentMediaEl: HTMLAudioElement | HTMLVideoElement | null = null;
  private currentMediaUrl: string | null = null;
  private currentFileName = "";
  private currentType: MediaType = "audio";
  private activeRequest: { abort: () => void } | null = null;
  private lastVolume = 1;

  init(): void {
    if (this.isInitialized) return;

    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = createPlayerTemplate().trim();
    const modal = tempContainer.firstChild;
    if (modal) {
      document.body.appendChild(modal);
    }

    this.elements = this.getElements();
    this.bindEvents();
    this.isInitialized = true;
  }

  private getElements(): PlayerElements {
    const $ = <T extends HTMLElement>(sel: string): T => {
      const el = document.querySelector(sel);
      if (!el) throw new Error(`Element not found: ${sel}`);
      return el as T;
    };

    return {
      modalOverlay: $("#kt-media-modal"),
      playerContainer: $("#kt-player-container"),
      backdrop: $(".kt-player-backdrop"),
      albumArt: $(".kt-album-art"),
      videoWrapper: $(".kt-video-wrapper"),
      audioEl: $("#kt-audio-element"),
      videoEl: $("#kt-video-element"),
      closeBtn: $("#kt-close-btn"),
      minimizeBtn: $("#kt-minimize-btn"),
      titleContainer: $(".kt-title-container"),
      titleEl: $(".kt-media-title"),
      loaderContainer: $(".kt-media-loader"),
      progressFill: $(".kt-progress-fill"),
      progressText: $(".kt-progress-text"),
      controlsContainer: $(".kt-controls-container"),
      playPauseBtn: $(".kt-play-pause-btn"),
      volumeBtn: $(".kt-volume-btn"),
      volumeSlider: $(".kt-volume-slider"),
      currentTimeEl: $(".kt-current-time"),
      totalTimeEl: $(".kt-total-time"),
      timelineContainer: $(".kt-timeline-container"),
      progressBar: $(".kt-progress-bar"),
      bufferedBar: $(".kt-buffered-bar"),
      hoverIndicator: $(".kt-hover-indicator"),
      downloadBtn: $(".kt-download-btn"),
      fullscreenBtn: $(".kt-fullscreen-btn"),
    };
  }

  private bindEvents(): void {
    const el = this.elements!;

    el.closeBtn.addEventListener("click", () => this.close());
    el.minimizeBtn.addEventListener("click", (e) => this.toggleMinimize(e));

    el.modalOverlay.addEventListener("click", (e) => {
      if (e.target === el.modalOverlay) this.toggleMinimize(e);
    });

    el.titleContainer.addEventListener("click", () => {
      el.titleContainer.classList.toggle("kt-expanded");
    });

    // Media Events
    [el.audioEl, el.videoEl].forEach((media) => {
      media.addEventListener("play", () => el.playerContainer.classList.remove("kt-paused"));
      media.addEventListener("pause", () => el.playerContainer.classList.add("kt-paused"));
      media.addEventListener("loadedmetadata", () => this.handleMetadataLoaded());
      media.addEventListener("timeupdate", () => this.handleTimeUpdate());
      media.addEventListener("progress", () => this.handleBufferUpdate());
      media.addEventListener("volumechange", () => this.updateVolumeUI());
      media.addEventListener("ended", () => el.playerContainer.classList.add("kt-paused"));
    });

    el.videoEl.addEventListener("click", () => this.togglePlay());
    el.videoEl.addEventListener("dblclick", () => this.toggleFullscreen());

    el.playPauseBtn.addEventListener("click", () => this.togglePlay());
    el.volumeBtn.addEventListener("click", () => this.toggleMute());
    el.volumeSlider.addEventListener("input", (e) => {
      if (this.currentMediaEl) {
        this.currentMediaEl.volume = parseFloat((e.target as HTMLInputElement).value);
      }
    });
    el.downloadBtn.addEventListener("click", () => this.downloadMedia());
    el.fullscreenBtn.addEventListener("click", () => this.toggleFullscreen());
    el.timelineContainer.addEventListener("mousemove", (e) => this.handleTimelineHover(e));
    el.timelineContainer.addEventListener("click", (e) => this.handleTimelineSeek(e));
  }

  private toggleMinimize(e: Event): void {
    e.stopPropagation();
    const el = this.elements!;
    el.modalOverlay.classList.toggle("kt-minimized");
    const isMinimized = el.modalOverlay.classList.contains("kt-minimized");

    if (isMinimized) {
      document.body.style.overflow = "";
      el.minimizeBtn.innerHTML = icons.maximize;
    } else {
      document.body.style.overflow = "hidden";
      el.minimizeBtn.innerHTML = icons.minimize;
    }
  }

  private toggleFullscreen(): void {
    if (this.currentType !== "video") return;
    const el = this.elements!;

    if (!document.fullscreenElement) {
      if (el.videoEl.requestFullscreen) {
        el.videoEl.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  private handleMetadataLoaded(): void {
    if (!this.currentMediaEl) return;
    const el = this.elements!;

    el.playerContainer.classList.add("kt-paused");
    el.totalTimeEl.textContent = this.formatTime(this.currentMediaEl.duration);
    this.currentMediaEl.volume = parseFloat(el.volumeSlider.value);
    this.updateVolumeUI();
    this.currentMediaEl.play().catch(() => {
      // Autoplay prevented - user will need to click play
    });
  }

  private togglePlay(): void {
    if (!this.currentMediaEl) return;
    if (this.currentMediaEl.paused) {
      this.currentMediaEl.play();
    } else {
      this.currentMediaEl.pause();
    }
  }

  private toggleMute(): void {
    if (!this.currentMediaEl) return;
    if (this.currentMediaEl.volume > 0) {
      this.lastVolume = this.currentMediaEl.volume;
      this.currentMediaEl.volume = 0;
    } else {
      this.currentMediaEl.volume = this.lastVolume;
    }
  }

  private handleTimeUpdate(): void {
    if (!this.currentMediaEl) return;
    const el = this.elements!;

    el.currentTimeEl.textContent = this.formatTime(this.currentMediaEl.currentTime);
    if (this.currentMediaEl.duration) {
      const percent = (this.currentMediaEl.currentTime / this.currentMediaEl.duration) * 100;
      el.progressBar.style.width = `${percent}%`;
    }
  }

  private handleBufferUpdate(): void {
    if (!this.currentMediaEl || !this.currentMediaEl.duration) return;
    const el = this.elements!;

    for (let i = 0; i < this.currentMediaEl.buffered.length; i++) {
      const start = this.currentMediaEl.buffered.start(i);
      const end = this.currentMediaEl.buffered.end(i);
      if (start <= this.currentMediaEl.currentTime && this.currentMediaEl.currentTime <= end) {
        const percent = (end / this.currentMediaEl.duration) * 100;
        el.bufferedBar.style.width = `${percent}%`;
        break;
      }
    }
  }

  private handleTimelineHover(e: MouseEvent): void {
    const el = this.elements!;
    const rect = el.timelineContainer.getBoundingClientRect();
    const pos = Math.min(Math.max(0, e.clientX - rect.left), rect.width);
    el.hoverIndicator.style.width = `${(pos / rect.width) * 100}%`;
  }

  private handleTimelineSeek(e: MouseEvent): void {
    if (!this.currentMediaEl) return;
    const el = this.elements!;
    const rect = el.timelineContainer.getBoundingClientRect();
    const pos = Math.min(Math.max(0, e.clientX - rect.left), rect.width) / rect.width;
    this.currentMediaEl.currentTime = pos * this.currentMediaEl.duration;
  }

  private updateVolumeUI(): void {
    if (!this.currentMediaEl) return;
    const el = this.elements!;

    el.volumeSlider.value = String(this.currentMediaEl.volume);

    const highIcon = el.volumeBtn.querySelector(".kt-high-volume-icon") as HTMLElement;
    const lowIcon = el.volumeBtn.querySelector(".kt-low-volume-icon") as HTMLElement;
    const mutedIcon = el.volumeBtn.querySelector(".kt-muted-icon") as HTMLElement;

    [highIcon, lowIcon, mutedIcon].forEach((i) => (i.style.display = "none"));

    if (this.currentMediaEl.volume === 0 || this.currentMediaEl.muted) {
      mutedIcon.style.display = "block";
    } else if (this.currentMediaEl.volume < 0.5) {
      lowIcon.style.display = "block";
    } else {
      highIcon.style.display = "block";
    }
  }

  private formatTime(t: number): string {
    if (isNaN(t)) return "0:00";
    const result = new Date(t * 1000).toISOString().substr(11, 8);
    return result.startsWith("00:") ? result.substr(3) : result;
  }

  private formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals < 0 ? 0 : decimals))} ${sizes[i]}`;
  }

  private downloadMedia(): void {
    if (!this.currentMediaEl) return;

    const url = this.currentMediaEl.src;
    const name = this.currentFileName || "kemono-media";

    // Use GM_download for robust cross-origin downloads
    if (typeof GM_download === "function") {
      GM_download({
        url: url,
        name: name,
        saveAs: true,
      });
      return;
    }

    // Fallback for Blob URLs (Audio) or if GM_download is missing
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private handleKeyboardShortcuts = (e: KeyboardEvent): void => {
    const activeTag = document.activeElement?.tagName.toLowerCase();
    if (activeTag === "input") return;

    const el = this.elements!;
    if (!el.modalOverlay.classList.contains("kt-show")) return;

    switch (e.key.toLowerCase()) {
      case "escape":
        this.close();
        break;
      case " ":
        if (activeTag !== "button") {
          e.preventDefault();
          this.togglePlay();
        }
        break;
      case "f":
        this.toggleFullscreen();
        break;
      case "m":
        this.toggleMute();
        break;
      case "arrowright":
        if (this.currentMediaEl) {
          this.currentMediaEl.currentTime = Math.min(
            this.currentMediaEl.duration,
            this.currentMediaEl.currentTime + 5
          );
        }
        break;
      case "arrowleft":
        if (this.currentMediaEl) {
          this.currentMediaEl.currentTime = Math.max(0, this.currentMediaEl.currentTime - 5);
        }
        break;
    }
  };

  open(url: string, fileName: string, type: MediaType): void {
    if (this.currentMediaUrl) {
      URL.revokeObjectURL(this.currentMediaUrl);
    }

    const el = this.elements!;

    this.currentFileName = fileName;
    this.currentType = type;
    el.titleContainer.classList.remove("kt-expanded");
    el.modalOverlay.classList.remove("kt-minimized");
    el.minimizeBtn.innerHTML = icons.minimize;
    el.titleEl.textContent = fileName;

    // Reset UI
    el.loaderContainer.style.display = "block";
    el.controlsContainer.style.display = "none";
    el.progressFill.style.width = "0%";
    el.progressText.textContent = "Initializing...";
    el.modalOverlay.style.display = "flex";

    // Stop both players
    el.audioEl.pause();
    el.videoEl.pause();
    el.audioEl.removeAttribute("src");
    el.videoEl.removeAttribute("src");

    // Find cover image
    const img =
      document.querySelector(".post__thumbnail img") ||
      document.querySelector(".post__content img") ||
      document.querySelector(".user-header__avatar img") ||
      document.querySelector("img.fancy-image__image");

    // Set backdrop
    if (img && (img as HTMLImageElement).src) {
      el.backdrop.style.backgroundImage = `url('${(img as HTMLImageElement).src}')`;
      el.albumArt.style.backgroundImage = `url('${(img as HTMLImageElement).src}')`;
      el.albumArt.innerHTML = "";
    } else {
      el.backdrop.style.backgroundImage = "none";
      el.albumArt.style.backgroundImage = "none";
      el.albumArt.innerHTML = icons.music;
    }

    // Configure view based on type
    if (type === "video") {
      this.currentMediaEl = el.videoEl;
      el.playerContainer.classList.add("kt-video-mode");
      el.albumArt.style.display = "none";
      el.videoWrapper.style.display = "flex";
      el.fullscreenBtn.style.display = "block";

      el.videoEl.src = url;
      el.videoEl.load();
      el.loaderContainer.style.display = "none";
      el.controlsContainer.style.display = "block";
    } else {
      this.currentMediaEl = el.audioEl;
      el.playerContainer.classList.remove("kt-video-mode");
      el.albumArt.style.display = "flex";
      el.videoWrapper.style.display = "none";
      el.fullscreenBtn.style.display = "none";

      // Fetch Audio as Blob
      this.activeRequest = GM_xmlhttpRequest({
        method: "GET",
        url,
        responseType: "blob",
        onprogress: (p) => {
          if (p.lengthComputable) {
            const percent = Math.round((p.loaded / p.total) * 100);
            el.progressFill.style.width = `${percent}%`;
            el.progressText.textContent = `Downloading... ${percent}% (${this.formatBytes(p.loaded)} / ${this.formatBytes(p.total)})`;
          }
        },
        onload: (res) => {
          this.activeRequest = null;
          this.currentMediaUrl = URL.createObjectURL(res.response);
          el.audioEl.src = this.currentMediaUrl;
          el.audioEl.load();
          el.loaderContainer.style.display = "none";
          el.controlsContainer.style.display = "block";
        },
        onerror: () => {
          this.activeRequest = null;
          el.progressText.textContent = "Error: Could not load audio file.";
        },
        onabort: () => {
          this.activeRequest = null;
        },
      });
    }

    setTimeout(() => el.modalOverlay.classList.add("kt-show"), 10);
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", this.handleKeyboardShortcuts);
  }

  close(): void {
    const el = this.elements!;

    if (this.activeRequest) this.activeRequest.abort();
    if (this.currentMediaEl) this.currentMediaEl.pause();

    el.modalOverlay.classList.remove("kt-show");

    setTimeout(() => {
      el.modalOverlay.style.display = "none";
      el.modalOverlay.classList.remove("kt-minimized");

      if (this.currentMediaUrl) {
        URL.revokeObjectURL(this.currentMediaUrl);
        this.currentMediaUrl = null;
      }

      el.audioEl.removeAttribute("src");
      el.videoEl.removeAttribute("src");
      el.videoEl.load();
      el.audioEl.load();
      this.currentFileName = "";
    }, 300);

    document.body.style.overflow = "";
    document.removeEventListener("keydown", this.handleKeyboardShortcuts);
  }
}
