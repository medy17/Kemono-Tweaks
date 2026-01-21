import { defineConfig, Plugin } from "vite";

const USERSCRIPT_HEADER = `// ==UserScript==
// @name         Kemono Tweaks & Player
// @namespace    http://tampermonkey.net/
// @version      4.4
// @description  Fetches post title for accuracy, features an expandable title header, and plays Media (Audio/Video) in a glassmorphism player. Supports Tampermonkey menu toggle for Video.
// @match        https://kemono.su/*
// @match        https://kemono.cr/*
// @match        https://coomer.su/*
// @match        https://coomer.party/*
// @author       medy17
// @run-at       document-start
// @grant        GM_xmlhttpRequest
// @grant        GM_download
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @license      MIT
// ==/UserScript==
`;

function userscriptPlugin(): Plugin {
    return {
        name: "userscript-plugin",
        generateBundle(_, bundle) {
            for (const fileName in bundle) {
                const chunk = bundle[fileName];
                if (chunk.type === "chunk" && fileName.endsWith(".js")) {
                    // Just add the header. No code injection.
                    chunk.code = USERSCRIPT_HEADER + "\n" + chunk.code;
                }
            }
        },
    };
}

export default defineConfig({
    build: {
        minify: false,
        target: "esnext",
        lib: {
            entry: "src/index.ts",
            name: "KemonoTweaks",
            fileName: () => "kemono-tweaks.user.js",
            formats: ["iife"],
        },
        rollupOptions: {
            output: {
                format: "iife",
                entryFileNames: "kemono-tweaks.user.js",
            },
        },
    },
    plugins: [userscriptPlugin()],
});
