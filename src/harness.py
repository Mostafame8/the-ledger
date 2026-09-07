# Test harness. Runs after the learner's code, in the same namespace, before a gate's tests.
# Shared by the browser runner (src/runner.js) and scripts/test-solutions.mjs.
__results = []


def inplace(fn, seq, *args):
    """Call fn on a copy of seq (fn mutates it) and return the mutated copy."""
    seq = list(seq)
    fn(seq, *args)
    return seq


def check(label, *rest):
    """
    check("expr", expected)            evaluate expr in the learner's namespace and compare.
    check(label, value, expected)      compare a value you already computed.
    check(label, thunk, expected)      call a zero-argument function and compare its result.
    Any exception counts as a failed check, never as a crash of the whole run.
    """
    try:
        if len(rest) == 1:
            expected = rest[0]
            actual = eval(label, globals())
        else:
            actual, expected = rest
            if callable(actual):
                actual = actual()
        __results.append({"label": label, "ok": bool(actual == expected), "got": repr(actual), "want": repr(expected)})
    except Exception as e:  # noqa: BLE001
        __results.append({"label": label, "ok": False, "got": f"{type(e).__name__}: {e}", "want": repr(rest[-1])})
