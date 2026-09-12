# SQL harness. Runs after harness.py in the same namespace, where the runner has defined
# __sql (the learner's statement) and __fixture (fixture.sql). Every test string in the sql
# course uses these helpers; check() and __results come from harness.py.
import sqlite3


def _t_db(extra=None):
    con = sqlite3.connect(':memory:')
    con.executescript(__fixture)
    if extra:
        con.executescript(extra)
    return con


def rows(sql, extra=None):
    """Reference rows: run sql against a fresh copy of the fixture (plus extra)."""
    return _t_db(extra).execute(sql).fetchall()


def learner(extra=None):
    """The learner's rows. One statement only; sqlite3 raises on a second one."""
    return _t_db(extra).execute(__sql).fetchall()


def learner_cols():
    """Column names of the learner's result, as sqlite3 reports them."""
    return [d[0] for d in _t_db().execute(__sql).description]


def check_query(label, ref_sql, ordered=False, extra=None):
    """Compare learner rows with reference rows; unordered unless the mission fixes an order."""
    want = rows(ref_sql, extra)
    if not ordered:
        want = sorted(want, key=repr)
    def got():
        g = learner(extra)
        return g if ordered else sorted(g, key=repr)
    check(label, got, want)


def check_cols(label, names):
    check(label, learner_cols, list(names))
