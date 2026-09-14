-- Reference solutions for lesson running-total. Blocks: "-- === <node-id>/<step-index>".

-- === running-total/4
SELECT id, amount, SUM(amount) OVER (ORDER BY id) AS running FROM transfers

-- === running-total/5
SELECT payer, paid_on, SUM(amount) OVER (PARTITION BY payer ORDER BY paid_on, id) AS running
FROM payments
ORDER BY payer, paid_on, id
