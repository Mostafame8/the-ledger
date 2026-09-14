-- Reference solutions for lesson sort-into-bands. Blocks: "-- === <node-id>/<step-index>".

-- === sort-into-bands/4
SELECT holder, CASE WHEN kind = 'trust' THEN 'watch' ELSE 'ignore' END AS flag FROM accounts

-- === sort-into-bands/5
SELECT CASE WHEN amount < 50000 THEN 'small'
            WHEN amount < 500000 THEN 'medium'
            ELSE 'large' END AS band,
       COUNT(*) AS n
FROM transfers
GROUP BY band
ORDER BY band
