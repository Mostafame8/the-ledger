-- Reference solutions for lesson count-what-is-there. Blocks: "-- === <node-id>/<step-index>".

-- === count-what-is-there/4
SELECT DISTINCT door FROM badges

-- === count-what-is-there/5
SELECT COUNT(DISTINCT door) AS doors FROM badges
