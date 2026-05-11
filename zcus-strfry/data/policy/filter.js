#!/usr/bin/env node
// strfry write-policy plugin: only allow events authored by ME
// or addressed to ME via a p-tag.

const ME = "DEIN_PUBKEY_HEX";  // 64 chars, lowercase, kein npub

const readline = require("readline");
const rl = readline.createInterface({ input: process.stdin });

rl.on("line", (line) => {
    let req;
    try {
        req = JSON.parse(line);
    } catch (e) {
        // Ungültiges JSON von strfry sollte nie passieren – sicherheitshalber ablehnen
        return;
    }

    // Nur "new"-Events filtern; lookback (Resync) durchwinken
    if (req.type !== "new") {
        respond(req.event.id, "accept", "");
        return;
    }

    const ev = req.event;
    const authoredByMe = ev.pubkey === ME;
    const addressedToMe = Array.isArray(ev.tags) &&
        ev.tags.some(t => Array.isArray(t) && t[0] === "p" && t[1] === ME);

    if (authoredByMe || addressedToMe) {
        respond(ev.id, "accept", "");
    } else {
        respond(ev.id, "reject", "blocked: this relay only accepts events from or to its owner");
    }
});

function respond(id, action, msg) {
    process.stdout.write(JSON.stringify({ id, action, msg }) + "\n");
}
