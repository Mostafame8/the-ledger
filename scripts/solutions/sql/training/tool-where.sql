-- Reference solutions for tool tool-where. Blocks: "-- === <tool-id>/<step-index>".

-- === tool-where/3
SELECT holder, branch FROM accounts WHERE branch IN ('north', 'central') AND kind = 'personal'
