#!/usr/bin/env python3
"""Build the GitHub Pages site in docs/ from site-src/.

    python3 scripts/build-site.py          # write docs/
    python3 scripts/build-site.py --check  # exit 1 if docs/ is out of date

Writes docs/index.html (English), docs/zh/index.html (Traditional Chinese),
docs/setup-prompt.md and docs/zh/setup-prompt.md. The version comes from
Formula/granada.rb, so a release only needs this script run again.
No dependencies beyond Python 3.
"""
import html
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "site-src")
DOCS = os.path.join(ROOT, "docs")
sys.dont_write_bytecode = True
sys.path.insert(0, SRC)
import strings  # noqa: E402


def read(path):
    with open(path, encoding="utf-8") as f:
        return f.read()


def version():
    m = re.search(r'^\s*version\s+"([^"]+)"', read(os.path.join(ROOT, "Formula", "granada.rb")), re.M)
    if not m:
        sys.exit("build-site: no version line in Formula/granada.rb")
    return m.group(1)


def render(template, table, extra):
    values = dict(table, **extra)

    def sub(m):
        key = m.group(1)
        if key not in values:
            sys.exit("build-site: no value for {{%s}}" % key)
        return values[key]

    out = re.sub(r"\{\{([a-z0-9_]+)\}\}", sub, template)
    left = re.findall(r"\{\{[^}]*\}\}", out)
    if left:
        sys.exit("build-site: unreplaced placeholders: %s" % ", ".join(sorted(set(left))))
    return out


def main():
    check = "--check" in sys.argv[1:]
    en, zh = strings.EN, strings.ZH
    gap = sorted(set(en) ^ set(zh))
    if gap:
        sys.exit("build-site: keys missing in one language: %s" % ", ".join(gap))

    site = strings.SITE
    ver = version()
    template = read(os.path.join(SRC, "template.html"))
    prompts = {
        "en": read(os.path.join(SRC, "setup-prompt.en.md")),
        "zh": read(os.path.join(SRC, "setup-prompt.zh.md")),
    }
    pages = {
        "en": dict(lang="en", root="./", url=site, href_en="./", href_zh="./zh/", cur_en="true", cur_zh="false",
                   href_other="./zh/", other_lang="zh-Hant"),
        "zh": dict(lang="zh-Hant", root="../", url=site + "zh/", href_en="../", href_zh="./", cur_en="false", cur_zh="true",
                   href_other="../", other_lang="en"),
    }
    outputs = {}
    for code, table in (("en", en), ("zh", zh)):
        extra = dict(pages[code], site=site, version=ver,
                     prompt=html.escape(prompts[code].rstrip("\n"), quote=False))
        sub = "" if code == "en" else "zh"
        outputs[os.path.join(DOCS, sub, "index.html")] = render(template, table, extra)
        outputs[os.path.join(DOCS, sub, "setup-prompt.md")] = prompts[code]

    stale = []
    for path, text in outputs.items():
        current = read(path) if os.path.exists(path) else None
        if current == text:
            continue
        stale.append(os.path.relpath(path, ROOT))
        if not check:
            os.makedirs(os.path.dirname(path), exist_ok=True)
            with open(path, "w", encoding="utf-8") as f:
                f.write(text)
    if check:
        if stale:
            print("build-site: out of date: " + ", ".join(stale))
            return 1
        print("build-site: docs/ is up to date (v%s)" % ver)
        return 0
    print("build-site: wrote %d file(s) for v%s" % (len(stale), ver) + (": " + ", ".join(stale) if stale else ""))
    return 0


if __name__ == "__main__":
    sys.exit(main())
