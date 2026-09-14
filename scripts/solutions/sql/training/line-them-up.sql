-- Reference solutions for lesson line-them-up. Blocks: "-- === <node-id>/<step-index>".

-- === line-them-up/4
SELECT name, hired FROM staff ORDER BY hired LIMIT 2

-- === line-them-up/5
SELECT door, time(at) AS clock FROM badges ORDER BY at DESC LIMIT 3
