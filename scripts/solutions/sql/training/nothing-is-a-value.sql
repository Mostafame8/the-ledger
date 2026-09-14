-- Reference solutions for lesson nothing-is-a-value. Blocks: "-- === <node-id>/<step-index>".

-- === nothing-is-a-value/4
SELECT name FROM staff WHERE dept IS NULL

-- === nothing-is-a-value/5
SELECT name, COALESCE(dept, 'unassigned') AS dept FROM staff ORDER BY id
