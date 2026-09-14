-- Reference solutions for lesson the-calendar. Blocks: "-- === <node-id>/<step-index>".

-- === the-calendar/4
SELECT date(at) AS day, COUNT(*) AS n FROM badges WHERE door = 'lobby' GROUP BY date(at) ORDER BY day

-- === the-calendar/5
SELECT strftime('%Y-%m', paid_on) AS month, COUNT(*) AS n FROM payments GROUP BY strftime('%Y-%m', paid_on) ORDER BY month
