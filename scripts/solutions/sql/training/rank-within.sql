-- Reference solutions for lesson rank-within. Blocks: "-- === <node-id>/<step-index>".

-- === rank-within/4
SELECT zone, ROW_NUMBER() OVER (PARTITION BY floor ORDER BY installed DESC) AS rn FROM cameras

-- === rank-within/5
SELECT floor, zone, rn
FROM (SELECT floor, zone,
             ROW_NUMBER() OVER (PARTITION BY floor ORDER BY installed DESC) AS rn
      FROM cameras) AS ranked
WHERE rn <= 2
ORDER BY floor, rn
