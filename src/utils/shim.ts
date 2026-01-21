/**
 * Title shim that intercepts string operations to preserve full titles
 * This runs in the page context to fix Kemono's title truncation
 */

export function injectTitleShim(): void {
  const shimCode = `
    (function() {
      try {
        const S = String.prototype;
        const origSlice = S.slice;
        const origConcat = S.concat;
        let lastSliceValue = null;
        let lastSliceSource = null;
        
        Object.defineProperty(S, "slice", {
          configurable: true,
          writable: true,
          value: function(start, end) {
            const src = String(this);
            const out = origSlice.call(src, start, end);
            if (start === 0 && end === 50 && typeof out === "string" && src.length > 50) {
              lastSliceValue = out;
              lastSliceSource = src;
            } else {
              lastSliceValue = null;
              lastSliceSource = null;
            }
            return out;
          },
        });
        
        Object.defineProperty(S, "concat", {
          configurable: true,
          writable: true,
          value: function(...args) {
            try {
              if (
                (this === "" || String(this) === "") &&
                args.length === 2 &&
                args[1] === "..." &&
                typeof args[0] === "string" &&
                lastSliceValue !== null &&
                args[0] === lastSliceValue
              ) {
                return lastSliceSource;
              }
            } catch (e) {}
            return origConcat.apply(this, args);
          },
        });
      } catch (e) {}
    })();
  `;

  try {
    const script = document.createElement("script");
    script.textContent = shimCode;
    (document.head || document.documentElement).appendChild(script);
    script.remove();
  } catch {
    // Silently fail if injection not possible
  }
}
