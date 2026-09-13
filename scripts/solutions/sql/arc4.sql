-- Reference solutions for Arc IV of the sql course. One block per gate, introduced by "-- === <id>".
-- Each block is one SELECT statement. Run with npm test.

-- === abovemean
SELECT id, amount
FROM transfers
WHERE amount > (SELECT AVG(amount) FROM transfers)
ORDER BY amount DESC

-- === neverswiped
SELECT id, name
FROM staff s
WHERE NOT EXISTS (SELECT 1 FROM badges b WHERE b.staff_id = s.id)
ORDER BY id

-- === bucket
SELECT id, amount,
       CASE WHEN amount < 50000 THEN 'small'
            WHEN amount < 500000 THEN 'medium'
            ELSE 'large' END AS band
FROM transfers
ORDER BY id

-- === twolists
SELECT payer AS name FROM payments
UNION
SELECT payee FROM payments
