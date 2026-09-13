-- Reference solutions for tool tool-group. Blocks: "-- === <tool-id>/<step-index>".

-- === tool-group/3
SELECT payer, SUM(amount) AS total, MAX(amount) AS biggest FROM payments GROUP BY payer
