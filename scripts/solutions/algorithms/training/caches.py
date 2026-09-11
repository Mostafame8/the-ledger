# Reference solutions for training node caches. Blocks: "# === <node-id>/<step-index>".

# === caches/4
def memoize(fn):
    seen = {}

    def wrapped(n):
        if n in seen:
            return seen[n]
        result = fn(n)
        seen[n] = result
        return result

    return wrapped

# === caches/5
def first_evicted(ops, cap):
    order = []
    for kind, key in ops:
        if kind == 'get':
            if key in order:
                order.remove(key)
                order.append(key)
        else:
            if key in order:
                order.remove(key)
            elif len(order) == cap:
                return order[0]
            order.append(key)
    return None
