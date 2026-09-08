# Reference solutions for training node tries. Blocks: "# === <node-id>/<step-index>".

# === tries/4
def has_prefix(root, prefix):
    node = root
    for ch in prefix:
        if ch not in node:
            return False
        node = node[ch]
    return True

# === tries/5
def count_with_prefix(words, prefix):
    root = {'count': 0, 'next': {}}
    for word in words:
        node = root
        node['count'] += 1
        for ch in word:
            if ch not in node['next']:
                node['next'][ch] = {'count': 0, 'next': {}}
            node = node['next'][ch]
            node['count'] += 1
    node = root
    for ch in prefix:
        if ch not in node['next']:
            return 0
        node = node['next'][ch]
    return node['count']
