#!/usr/bin/env python3
"""
strfry write-policy plugin.
Accepts events only if authored by ME or with a p-tag = ME.
"""

import json
import sys

ME = "DEIN_PUBKEY_HEX"  # 64 chars, lowercase, kein npub


def decide(req):
    if req.get("type") != "new":
        return {"id": req.get("event", {}).get("id", ""), "action": "accept", "msg": ""}

    ev = req.get("event", {})
    eid = ev.get("id", "")
    author = ev.get("pubkey")
    tags = ev.get("tags", []) or []

    authored_by_me = author == ME
    addressed_to_me = any(
        isinstance(t, list) and len(t) >= 2 and t[0] == "p" and t[1] == ME
        for t in tags
    )

    if authored_by_me or addressed_to_me:
        return {"id": eid, "action": "accept", "msg": ""}

    return {
        "id": eid,
        "action": "reject",
        "msg": "blocked: relay restricted to owner",
    }


def main():
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            req = json.loads(line)
        except json.JSONDecodeError:
            sys.stdout.write(
                json.dumps({"id": "", "action": "reject", "msg": "internal: bad json"}) + "\n"
            )
            sys.stdout.flush()
            continue

        resp = decide(req)
        sys.stdout.write(json.dumps(resp) + "\n")
        sys.stdout.flush()


if __name__ == "__main__":
    main()
