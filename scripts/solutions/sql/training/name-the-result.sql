-- Reference solutions for lesson name-the-result. Blocks: "-- === <node-id>/<step-index>".

-- === name-the-result/4
WITH big AS (SELECT id, amount FROM transfers WHERE amount > 100000) SELECT COUNT(*) AS n FROM big

-- === name-the-result/5
WITH totals AS (SELECT payee, SUM(amount) AS total FROM payments GROUP BY payee)
SELECT payee, total FROM totals ORDER BY total DESC, payee LIMIT 2
