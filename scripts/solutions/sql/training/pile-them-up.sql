-- Reference solutions for lesson pile-them-up. Blocks: "-- === <node-id>/<step-index>".

-- === pile-them-up/4
SELECT kind, COUNT(*) AS n FROM accounts GROUP BY kind HAVING COUNT(*) > 2

-- === pile-them-up/5
SELECT payee, SUM(amount) AS total FROM payments GROUP BY payee HAVING SUM(amount) > 50000 ORDER BY total DESC, payee
