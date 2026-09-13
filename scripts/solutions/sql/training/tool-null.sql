-- Reference solutions for tool tool-null. Blocks: "-- === <tool-id>/<step-index>".

-- === tool-null/3
SELECT name, COALESCE(dept, 'none') AS dept FROM staff WHERE manager_id IS NOT NULL ORDER BY id
