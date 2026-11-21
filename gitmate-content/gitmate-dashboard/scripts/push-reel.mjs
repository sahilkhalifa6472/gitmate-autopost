#!/usr/bin/env node
// Adds a finished reel to the dashboard queue: uploads the mp4 to Vercel Blob, then POSTs the metadata.
// Usage: GITMATE_QUEUE_KEY=... node push-reel.mjs https://YOUR-APP.vercel.app path/to/reel.mp4 path/to/N.json
// N.json: { title, slug, instagram: { caption, hashtags?, cover_offset_ms }, video: { duration_sec } }
// Needs @vercel/blob installed next to it (npm i @vercel/blob@2).
import fs from "fs";
import path from "path";
import { upload } from "@vercel/blob/client";

const [base, mp4, jsonFile] = process.argv.slice(2);
const token = process.env.GITMATE_QUEUE_KEY;
if (!base || !mp4 || !jsonFile || !token) {
  console.error("Usage: GITMATE_QUEUE_KEY=... node push-reel.mjs <dashboard url> <mp4> <json>");
  process.exit(1);
}
const root = base.replace(/\/$/, "");
const meta = JSON.parse(fs.readFileSync(jsonFile, "utf8"));
const ig = meta.instagram || {};

// skip if this slug is already queued
const list = await fetch(`${root}/api/queue`, { headers: { "x-upload-token": token } });
if (!list.ok) throw new Error(`queue list failed: ${list.status} ${await list.text()}`);
const { items } = await list.json();
if (meta.slug && items.some((i) => i.slug === meta.slug && i.status !== "skipped")) {
  console.log(`already in queue: ${meta.slug}`);
  process.exit(0);
}

const buf = fs.readFileSync(mp4);
const blob = await upload(`reels/${meta.slug || path.basename(mp4, ".mp4")}.mp4`, new Blob([buf], { type: "video/mp4" }), {
  access: "public",
  handleUploadUrl: `${root}/api/blob-upload`,
  clientPayload: token,
  contentType: "video/mp4",
  multipart: buf.length > 20e6,
});
console.log(`uploaded ${(buf.length / 1e6).toFixed(1)} MB -> ${blob.url}`);

const res = await fetch(`${root}/api/queue`, {
  method: "POST",
  headers: { "content-type": "application/json", "x-upload-token": token },
  body: JSON.stringify({
    title: meta.title, slug: meta.slug, caption: ig.caption, hashtags: ig.hashtags || [],
    cover_offset_ms: ig.cover_offset_ms, duration_sec: meta.video?.duration_sec, video_url: blob.url,
  }),
});
const out = await res.json();
if (!res.ok) throw new Error(`queue add failed: ${JSON.stringify(out)}`);
console.log(`queued as #${out.id}`);
