-- Halden's internal dump plus the Ledger. One database for every gate and drill in The Books.
-- Amounts are pence. Timestamps are ISO text. Frozen: tests add rows through `extra`, never here.
CREATE TABLE staff    (id INTEGER PRIMARY KEY, name TEXT, dept TEXT, hired TEXT, manager_id INTEGER);
CREATE TABLE accounts (id INTEGER PRIMARY KEY, holder TEXT, kind TEXT, branch TEXT, opened TEXT);
CREATE TABLE transfers(id INTEGER PRIMARY KEY, from_acct INTEGER, to_acct INTEGER, amount INTEGER, at TEXT);
CREATE TABLE badges   (id INTEGER PRIMARY KEY, staff_id INTEGER, door TEXT, at TEXT, direction TEXT);
CREATE TABLE cameras  (id INTEGER PRIMARY KEY, floor INTEGER, zone TEXT, installed TEXT);
CREATE TABLE payments (id INTEGER PRIMARY KEY, payer TEXT, payee TEXT, amount INTEGER, paid_on TEXT, note TEXT);

INSERT INTO staff VALUES
  (1, 'Halden Voss', 'board',    '2001-03-01', NULL),
  (2, 'Ines Marr',   'vault',    '2009-06-15', 1),
  (3, 'Tomas Reed',  'security', '2012-01-10', 1),
  (4, 'Priya Nand',  'vault',    '2015-09-01', 2),
  (5, 'Otto Kline',  'security', '2016-02-20', 3),
  (6, 'Lena Brack',  'tellers',  '2017-05-05', 2),
  (7, 'Sam Ode',     'tellers',  '2018-11-12', 6),
  (8, 'Ruth Ash',    'security', '2019-03-03', 5),
  (9, 'Kit Ferro',   'vault',    '2020-07-07', 4),
  (10, 'Mira Sol',   'tellers',  '2021-01-15', 6),
  (11, 'Bo Lund',    NULL,       '2022-04-04', 3),
  (12, 'Ana Petrov', 'security', '2023-08-08', 8);

INSERT INTO accounts VALUES
  (1, 'Corvin Holdings',   'business', 'north',   '2010-01-05'),
  (2, 'Delia Marsh',       'personal', 'north',   '2012-03-14'),
  (3, 'Grey Import Co',    'business', 'harbour', '2013-07-22'),
  (4, 'Felix Orme',        'personal', 'harbour', '2015-10-30'),
  (5, 'Nadia Quill',       'personal', 'north',   '2016-02-02'),
  (6, 'Sable Trust',       'trust',    'central', '2017-06-18'),
  (7, 'Piet Vaan',         'personal', 'central', '2018-09-09'),
  (8, 'Halden Staff Fund', 'trust',    'central', '2019-12-01'),
  (9, 'Roan Textiles',     'business', 'harbour', '2020-04-21'),
  (10, 'Ivo Larch',        'personal', 'north',   '2021-11-11');

INSERT INTO transfers VALUES
  (1, 1, 3, 250000,  '2026-03-02 09:15'),
  (2, 2, 4, 12000,   '2026-03-02 11:40'),
  (3, 3, 6, 480000,  '2026-03-03 10:05'),
  (4, 4, 2, 9000,    '2026-03-03 14:30'),
  (5, 6, 1, 1500000, '2026-03-04 09:00'),
  (6, 7, 9, 30000,   '2026-03-04 16:20'),
  (7, 1, 9, 75000,   '2026-03-05 08:45'),
  (8, 9, 3, 66000,   '2026-03-05 12:00'),
  (9, 2, 7, 4500,    '2026-03-05 17:55'),
  (10, 6, 9, 220000, '2026-03-06 10:10'),
  (11, 3, 1, 98000,  '2026-03-06 13:25'),
  (12, 4, 7, 15000,  '2026-03-07 09:30'),
  (13, 1, 6, 3200000,'2026-03-07 15:00'),
  (14, 9, 2, 8000,   '2026-03-07 18:40');

INSERT INTO badges VALUES
  (1, 2, 'vault',       '2026-03-02 08:55', 'in'),
  (2, 2, 'vault',       '2026-03-02 17:10', 'out'),
  (3, 3, 'lobby',       '2026-03-02 07:30', 'in'),
  (4, 5, 'server-room', '2026-03-02 23:15', 'in'),
  (5, 5, 'server-room', '2026-03-03 01:40', 'out'),
  (6, 4, 'vault',       '2026-03-03 09:05', 'in'),
  (7, 8, 'loading-bay', '2026-03-03 22:30', 'in'),
  (8, 8, 'loading-bay', '2026-03-03 23:50', 'out'),
  (9, 6, 'lobby',       '2026-03-04 08:00', 'in'),
  (10, 7, 'lobby',      '2026-03-04 08:02', 'in'),
  (11, 9, 'vault',      '2026-03-04 10:20', 'in'),
  (12, 3, 'server-room','2026-03-05 02:10', 'in'),
  (13, 5, 'lobby',      '2026-03-05 05:45', 'in'),
  (14, 12, 'loading-bay','2026-03-05 22:05', 'in'),
  (15, 4, 'vault',      '2026-03-06 09:00', 'in'),
  (16, 2, 'lobby',      '2026-03-06 18:30', 'out'),
  (17, 10, 'lobby',     '2026-03-06 08:10', 'in');

INSERT INTO cameras VALUES
  (1, 0, 'lobby',        '2018-01-10'),
  (2, 0, 'loading-bay',  '2021-06-01'),
  (3, 1, 'tellers',      '2019-04-12'),
  (4, 1, 'corridor',     '2022-09-30'),
  (5, 2, 'vault-door',   '2016-11-05'),
  (6, 2, 'vault-inside', '2023-02-14'),
  (7, 2, 'stairs',       '2020-08-08'),
  (8, 3, 'server-room',  '2024-05-20');

INSERT INTO payments VALUES
  (1, 'Halden Voss',    'Otto Kline',  50000,  '2026-01-05', 'quiet hours'),
  (2, 'Halden Voss',    'Ruth Ash',    30000,  '2026-01-12', NULL),
  (3, 'Ines Marr',      'Otto Kline',  20000,  '2026-01-20', 'door'),
  (4, 'Grey Import Co', 'Halden Voss', 400000, '2026-02-01', 'consultancy'),
  (5, 'Halden Voss',    'Bo Lund',     15000,  '2026-02-03', NULL),
  (6, 'Sable Trust',    'Ines Marr',   120000, '2026-02-10', 'audit'),
  (7, 'Ines Marr',      'Ruth Ash',    10000,  '2026-02-14', NULL),
  (8, 'Grey Import Co', 'Tomas Reed',  90000,  '2026-02-20', 'cameras'),
  (9, 'Halden Voss',    'Otto Kline',  50000,  '2026-03-01', 'quiet hours'),
  (10, 'Roan Textiles', 'Halden Voss', 250000, '2026-03-02', NULL),
  (11, 'Tomas Reed',    'Ana Petrov',  8000,   '2026-03-05', 'rota'),
  (12, 'Sable Trust',   'Tomas Reed',  60000,  '2026-03-06', 'audit');
