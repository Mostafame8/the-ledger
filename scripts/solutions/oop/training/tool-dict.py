# Reference solutions for tool tool-dict. Blocks: "# === <tool-id>/<step-index>".

# === tool-dict/3
def describe(obj):
    fields = vars(obj)
    return sorted(f"{k}={v}" for k, v in fields.items())
