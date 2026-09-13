-- Reference solutions for Arc V of the sql course. One block per gate, introduced by "-- === <id>".
-- Each block is one SELECT statement. Run with npm test.

-- === runningtotal
SELECT paid_on, amount, SUM(amount) OVER (ORDER BY paid_on, id) AS running
FROM payments
ORDER BY paid_on, id

-- === toppercamera
SELECT floor, zone, installed
FROM (SELECT floor, zone, installed,
             ROW_NUMBER() OVER (PARTITION BY floor ORDER BY installed DESC) AS rn
      FROM cameras) AS ranked
WHERE rn = 1
ORDER BY floor

-- === reportsto
WITH RECURSIVE up(id, name, manager_id, level) AS (
  SELECT id, name, manager_id, 0 FROM staff WHERE id = 12
  UNION ALL
  SELECT s.id, s.name, s.manager_id, up.level + 1 FROM staff s JOIN up ON s.id = up.manager_id
)
SELECT name, level FROM up WHERE level > 0 ORDER BY level

-- === thebooks
WITH totals AS (
  SELECT payee, SUM(amount) AS total FROM payments GROUP BY payee
)
SELECT payee, total,
       ROW_NUMBER() OVER (ORDER BY total DESC, payee) AS place,
       CASE WHEN total >= 100000 THEN 'big'
            WHEN total >= 25000 THEN 'middling'
            ELSE 'small' END AS band
FROM totals
ORDER BY place
