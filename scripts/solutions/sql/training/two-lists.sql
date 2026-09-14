-- Reference solutions for lesson two-lists. Blocks: "-- === <node-id>/<step-index>".

-- === two-lists/4
SELECT payee AS name FROM payments INTERSECT SELECT name FROM staff

-- === two-lists/5
SELECT lower(payee) AS name FROM payments INTERSECT SELECT lower(name) FROM staff
