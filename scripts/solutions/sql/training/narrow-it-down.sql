-- Reference solutions for lesson narrow-it-down. Blocks: "-- === <node-id>/<step-index>".

-- === narrow-it-down/4
SELECT holder FROM accounts WHERE kind = 'personal' AND branch <> 'harbour'

-- === narrow-it-down/5
SELECT name FROM staff WHERE lower(dept) = 'vault' ORDER BY name
