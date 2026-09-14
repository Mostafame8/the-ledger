-- Reference solutions for lesson climb-the-chain. Blocks: "-- === <node-id>/<step-index>".

-- === climb-the-chain/4
WITH RECURSIVE up(id, name, manager_id) AS (
  SELECT id, name, manager_id FROM staff WHERE id = 12
  UNION ALL
  SELECT s.id, s.name, s.manager_id FROM staff s JOIN up ON s.id = up.manager_id
)
SELECT name FROM up

-- === climb-the-chain/5
WITH RECURSIVE down(id, name, depth) AS (
  SELECT id, name, 0 FROM staff WHERE id = 2
  UNION ALL
  SELECT s.id, s.name, down.depth + 1 FROM staff s JOIN down ON s.manager_id = down.id
)
SELECT name, depth FROM down WHERE depth > 0 ORDER BY depth, name
