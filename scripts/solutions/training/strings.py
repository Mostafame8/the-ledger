# Reference solutions for training node strings. Blocks: "# === <node-id>/<step-index>".

# === strings/4
def only_letters(s):
    out = []
    for ch in s:
        if ch.isalnum():
            out.append(ch.lower())
    return ''.join(out)

# === strings/5
def count_vowels(s):
    count = 0
    for ch in s.lower():
        if ch in 'aeiou':
            count += 1
    return count
