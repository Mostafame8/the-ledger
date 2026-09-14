-- Reference solutions for lesson question-inside. Blocks: "-- === <node-id>/<step-index>".

-- === question-inside/4
SELECT holder FROM accounts WHERE id = (SELECT from_acct FROM transfers ORDER BY amount DESC LIMIT 1)

-- === question-inside/5
SELECT id, amount FROM payments WHERE amount > (SELECT AVG(amount) FROM payments) ORDER BY amount DESC
