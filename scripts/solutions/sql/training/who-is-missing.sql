-- Reference solutions for lesson who-is-missing. Blocks: "-- === <node-id>/<step-index>".

-- === who-is-missing/4
SELECT holder FROM accounts a WHERE NOT EXISTS (SELECT 1 FROM transfers t WHERE t.from_acct = a.id)

-- === who-is-missing/5
SELECT name FROM staff s WHERE NOT EXISTS (SELECT 1 FROM badges b WHERE b.staff_id = s.id AND (time(b.at) >= '22:00' OR time(b.at) < '06:00')) ORDER BY name
