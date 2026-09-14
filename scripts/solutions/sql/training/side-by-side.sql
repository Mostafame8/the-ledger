-- Reference solutions for lesson side-by-side. Blocks: "-- === <node-id>/<step-index>".

-- === side-by-side/4
SELECT a.holder, t.amount FROM transfers t JOIN accounts a ON a.id = t.from_acct WHERE t.amount > 1000000

-- === side-by-side/5
SELECT s.name, b.door, time(b.at) AS clock FROM badges b JOIN staff s ON s.id = b.staff_id
