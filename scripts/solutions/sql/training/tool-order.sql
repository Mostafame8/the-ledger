-- Reference solutions for tool tool-order. Blocks: "-- === <tool-id>/<step-index>".

-- === tool-order/3
SELECT zone, installed FROM cameras ORDER BY installed LIMIT 3 OFFSET 2
