-- Reference solutions for lesson table-meets-itself. Blocks: "-- === <node-id>/<step-index>".

-- === table-meets-itself/4
SELECT s.name, m.name AS boss FROM staff s JOIN staff m ON m.id = s.manager_id WHERE m.dept = 'vault'

-- === table-meets-itself/5
SELECT s.name, COALESCE(m.name, 'nobody') AS boss FROM staff s LEFT JOIN staff m ON m.id = s.manager_id ORDER BY s.id
