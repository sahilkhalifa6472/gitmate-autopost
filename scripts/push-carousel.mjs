#!/usr/bin/env node
// Adds a finished weekly carousel to the dashboard queue: uploads the JPEG slides to Vercel Blob,
// then POSTs { kind: "carousel", ... }. It posts on post_on at post_min (New York time), outside the reel plan.
// Usage: GITMATE_QUEUE_KEY=... node push-carousel.mjs https://YOUR-APP.vercel.app carousel.json
// carousel.json: { title, slug, post_on: "YYYY-MM-DD", post_min?: 630, slides: ["01.jpg", ...] (paths relative to the json),
//                  instagram: { caption, hashtags? }, links: [{ title, url }] }
// Needs @vercel/blob installed next to it (npm i @vercel/blob@2).
import fs from "fs";
import path from "path";
import { upload } from "@vercel/blob/client";

const [base, jsonFile] = process.argv.slice(2);
const token = process.env.GITMATE_QUEUE_KEY;
if (!base || !jsonFile || !token) {
  console.error("Usage: GITMATE_QUEUE_KEY=... node push-carousel.mjs <dashboard url> <carousel.json>");
  process.exit(1);
}
const root = base.replace(/\/$/, "");
const meta = JSON.parse(fs.readFileSync(jsonFile, "utf8"));
const dir = path.dirname(jsonFile);

const list = await fetch(`${root}/api/queue`, { headers: { "x-upload-token": token } });
if (!list.ok) throw new Error(`queue list failed: ${list.status} ${await list.text()}`);
const { items } = await list.json();
if (meta.slug && items.some((i) => i.slug === meta.slug && i.status !== "skipped")) {
  console.log(`already in queue: ${meta.slug}`);
  process.exit(0);
}

const images = [];
for (const [k, f] of meta.slides.entries()) {
  const buf = fs.readFileSync(path.resolve(dir, f));
  const blob = await upload(`carousels/${meta.slug}-${String(k + 1).padStart(2, "0")}.jpg`, new Blob([buf], { type: "image/jpeg" }), {
    access: "public", handleUploadUrl: `${root}/api/blob-upload`, clientPayload: token, contentType: "image/jpeg",
  });
  images.push(blob.url);
  console.log(`slide ${k + 1}: ${(buf.length / 1e3).toFixed(0)} KB -> ${blob.url}`);
}

const ig = meta.instagram || {};
const res = await fetch(`${root}/api/queue`, {
  method: "POST",
  headers: { "content-type": "application/json", "x-upload-token": token },
  body: JSON.stringify({
    kind: "carousel", title: meta.title, slug: meta.slug, caption: ig.caption, hashtags: ig.hashtags || [],
    images, post_on: meta.post_on, post_min: meta.post_min, links: meta.links || [],
  }),
});
const out = await res.json();
if (!res.ok) throw new Error(`queue add failed: ${JSON.stringify(out)}`);
console.log(`queued carousel as #${out.id}`);
