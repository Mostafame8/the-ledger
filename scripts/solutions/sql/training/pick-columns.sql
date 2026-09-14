-- Reference solutions for lesson pick-columns. Blocks: "-- === <node-id>/<step-index>".

-- === pick-columns/4
SELECT holder, branch AS zone FROM accounts

-- === pick-columns/5
SELECT payee, upper(payee) AS loud, amount / 100 AS pounds FROM payments
