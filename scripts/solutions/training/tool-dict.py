# Reference solutions for armoury tool tool-dict. Blocks: "# === <tool-id>/<step-index>".

# === tool-dict/3
def number_for(book, name):
    return book.get(name)


def file_card(book, name, number):
    book[name] = number
    return book
