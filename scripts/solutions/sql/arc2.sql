-- Reference solutions for Arc II of the sql course. One block per gate, introduced by "-- === <id>".
-- Each block is one SELECT statement. Run with npm test.

-- === badgeowners
SELECT s.name, b.door, b.at
FROM badges b
JOIN staff s ON s.id = b.staff_id

-- === emptyaccounts
SELECT a.id, a.holder
FROM accounts a
LEFT JOIN transfers t ON a.id = t.from_acct OR a.id = t.to_acct
WHERE t.id IS NULL

-- === chainofcommand
SELECT s.name, m.name AS manager
FROM staff s
JOIN staff m ON m.id = s.manager_id
ORDER BY s.name

-- === threeway
SELECT t.id, f.holder AS sender, p.holder AS receiver, t.amount
FROM transfers t
JOIN accounts f ON f.id = t.from_acct
JOIN accounts p ON p.id = t.to_acct
ORDER BY t.id
