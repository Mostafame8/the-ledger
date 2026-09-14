-- Reference solutions for lesson keep-the-empty. Blocks: "-- === <node-id>/<step-index>".

-- === keep-the-empty/4
SELECT a.holder FROM accounts a LEFT JOIN transfers t ON t.to_acct = a.id WHERE t.id IS NULL

-- === keep-the-empty/5
SELECT a.holder, COALESCE(t.amount, 0) AS moved FROM accounts a LEFT JOIN transfers t ON t.from_acct = a.id
