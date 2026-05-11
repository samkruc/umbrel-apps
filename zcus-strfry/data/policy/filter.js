#!/usr/bin/env node
// strfry write-policy plugin.
// Accepts events only if authored by ME or with a p-tag = ME.

const ME = "DEIN_PUBKEY_HEX";  // 64 chars, lowercase, kein npub

const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    terminal: false,
});

rl.on("line", (line) => {
    let req;
    try {
        req = JSON.parse(line);
    } catch (e) {
        respond("", "reject", "internal: bad json");
        return;
    }

    // Non-"new" Requests (z.B. lookback bei resync) durchwinken
    if (req.type !== "new") {
        respond(req.event?.id ?? "", "accept", "");
        return;
    }

    const ev = req.event ?? {};
    const eid = ev.id ?? "";
    const author = ev.pubkey;
    const tags = Array.isArray(ev.tags) ? ev.tags : [];

    const authoredByMe = author === ME;
    const addressedToMe = tags.some(
        (t) => Array.isArray(t) && t[0] === "p" && t[1] === ME
    );

    if (authoredByMe || addressedToMe) {
        respond(eid, "accept", "");
    } else {
        respond(eid, "reject", "blocked: relay restricted to owner");
    }
});

function respond(id, action, msg) {
    process.stdout.write(JSON.stringify({ id, action, msg }) + "\n");
}
