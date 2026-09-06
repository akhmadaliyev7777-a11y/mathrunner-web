# -*- coding: utf-8 -*-
"""castles_data.dart -> mathrunner_web/data/curriculum.json  +  banklarni ko'chirish.

Sayt (mathrunner_web) faqat shu ikki narsani o'qiydi:
  data/curriculum.json           — sinf > chorak > blok > level daraxti
  data/banks/<id>_{questions|tasks}.json — 611 ta savol/o'yin banki (o'zgartirishsiz)
"""
import re, json, os, shutil, datetime

ROOT = "/Users/macbookair/Desktop/python/math_runner"
CD = f"{ROOT}/lib/data/repositories/castles_data.dart"
OUT_DATA = f"{ROOT}/mathrunner_web/data"
OUT_BANKS = f"{OUT_DATA}/banks"

KINGDOM = {1: "forest", 2: "city", 3: "space", 4: "castle"}
KINGDOM_UZ = {1: "O'rmon olami", 2: "Shahar olami", 3: "Koinot olami", 4: "Qasr olami"}
# Four Kingdoms ranglari (RunnerWorldSkin -> asosiy aksent) — world_palette.dart dan
KINGDOM_COLOR = {
    1: {"accent": "#4AD07A", "accentDark": "#2f9d57", "head": "linear-gradient(160deg,#7FD6FF,#4FC0F7 40%,#2F8A55)"},
    2: {"accent": "#FF5CD0", "accentDark": "#c43fa6", "head": "linear-gradient(160deg,#5C7FF5,#8055EE 45%,#4A2F9E)"},
    3: {"accent": "#4FC0F7", "accentDark": "#2f7fb0", "head": "linear-gradient(160deg,#2B2478,#161240 55%,#0D0A24)"},
    4: {"accent": "#FFDF6E", "accentDark": "#c47a12", "head": "linear-gradient(160deg,#8055EE,#F8912F 62%,#8A4A1E)"},
}
ROMAN = {1: "I", 2: "II", 3: "III", 4: "IV"}

# Saytda o'ynaladigan turlar (foydalanuvchi ro'yxati). Qolganlari
# (fractionStrip / coordinatePath / motionLine / protractor) blok
# ko'rinadi, lekin level tugmasi "tez orada" bilan o'chirilgan bo'ladi.
WEB_SUPPORTED = {
    "test", "set", "numberOrder", "placeValue",
    "balanceScale", "symmetry", "netFold", "equationGrid", "algorithmConveyor",
}

src = open(CD).read()
pat = re.compile(
    r"CastleDefinition\(\s*"
    r"id: '([^']+)',\s*"
    r"number: (\d+),\s*"
    r"grade: (\d+),\s*"
    r"topic: CastleTopic\.(\w+),\s*"
    r"chorak: (\d+),\s*"
    r"blok: (\d+),\s*"
    r"blokName: '((?:[^'\\]|\\.)*)',\s*"
    r"levelInBlok: (\d+),\s*"
    r"questionBankAssetPath: '([^']+)',\s*"
    r"questionCount: (\d+),\s*"
    r"gameKind: LevelGame\.(\w+),\s*"
    r"\)"
)

def clean_name(s):
    s = s.replace("\\'", "'").replace('\\"', '"').replace("\\\\", "\\")
    s = s.replace("**", "").replace("`", "")          # markdown qoldiqlari
    s = s.replace("×", "·").replace("÷", ":")
    s = re.sub(r"\s+", " ", s).strip()
    return s

rows = []
for m in pat.finditer(src):
    (cid, number, grade, topic, chorak, blok, blokName, lvl, path, cnt, gk) = m.groups()
    blokName = clean_name(blokName)
    rows.append({
        "id": cid, "number": int(number), "grade": int(grade), "topic": topic,
        "chorak": int(chorak), "blok": int(blok), "blokName": blokName,
        "level": int(lvl), "path": path, "count": int(cnt), "gameKind": gk,
    })

print(f"CastleDefinition o'qildi: {len(rows)}")
assert len(rows) == 574, len(rows)

# ---- banklarni ko'chirish ----
os.makedirs(OUT_BANKS, exist_ok=True)
copied = 0
for r in rows:
    src_bank = f"{ROOT}/{r['path']}"
    dst_bank = f"{OUT_BANKS}/{os.path.basename(r['path'])}"
    shutil.copyfile(src_bank, dst_bank)
    copied += 1
print(f"Bank fayllari ko'chirildi: {copied} -> {OUT_BANKS}")

# ---- daraxt qurish ----
grades = []
for g in (1, 2, 3, 4):
    grows = [r for r in rows if r["grade"] == g]
    choraks = []
    for c in sorted({r["chorak"] for r in grows}):
        crows = [r for r in grows if r["chorak"] == c]
        blocks = []
        for b in sorted({r["blok"] for r in crows}):
            brows = sorted((r for r in crows if r["blok"] == b), key=lambda r: r["level"])
            b0 = brows[0]
            has_game = any(r["gameKind"] != "test" for r in brows)
            blocks.append({
                "blok": b,
                "name": b0["blokName"],
                "topic": b0["topic"],
                "kind": "game" if has_game else "test",
                "levels": [
                    {
                        "id": r["id"],
                        "level": r["level"],
                        "gameKind": r["gameKind"],
                        "count": r["count"],
                        "bank": f"banks/{os.path.basename(r['path'])}",
                        "webSupported": r["gameKind"] in WEB_SUPPORTED,
                    }
                    for r in brows
                ],
            })
        choraks.append({"chorak": c, "roman": ROMAN[c], "blocks": blocks,
                        "levelCount": sum(len(bl["levels"]) for bl in blocks),
                        "blockCount": len(blocks)})
    grades.append({
        "grade": g,
        "kingdom": KINGDOM[g],
        "kingdomTitle": KINGDOM_UZ[g],
        "color": KINGDOM_COLOR[g],
        "levelCount": len(grows),
        "blockCount": len({r["blok"] for r in grows}),
        "castleRange": [min(r["number"] for r in grows), max(r["number"] for r in grows)],
        "choraks": choraks,
    })

curriculum = {
    "generatedAt": datetime.date.today().isoformat(),
    "source": "castles_data.dart",
    "totals": {
        "levels": len(rows),
        "testLevels": sum(1 for r in rows if r["gameKind"] == "test"),
        "gameLevels": sum(1 for r in rows if r["gameKind"] != "test"),
        "questions": sum(r["count"] for r in rows if r["gameKind"] == "test"),
        "gameTasks": sum(r["count"] for r in rows if r["gameKind"] != "test"),
    },
    "gameKindsSupported": [
        "test", "set", "numberOrder", "placeValue", "balanceScale",
        "symmetry", "netFold", "equationGrid", "algorithmConveyor",
    ],
    "grades": grades,
}

os.makedirs(OUT_DATA, exist_ok=True)
with open(f"{OUT_DATA}/curriculum.json", "w") as f:
    json.dump(curriculum, f, ensure_ascii=False, indent=1)

# ---- xulosa ----
print("\ncurriculum.json yozildi:")
print(f"  totals: {curriculum['totals']}")
for g in curriculum["grades"]:
    print(f"  {g['grade']}-sinf ({g['kingdom']}): {g['blockCount']} blok, {g['levelCount']} level, "
          f"qal'a {g['castleRange'][0]}-{g['castleRange'][1]}, {len(g['choraks'])} chorak")

# gameKind taqsimoti
from collections import Counter
gk = Counter(r["gameKind"] for r in rows)
print(f"  gameKind: {dict(gk)}")
sz = sum(os.path.getsize(os.path.join(OUT_BANKS, x)) for x in os.listdir(OUT_BANKS))
print(f"  banks/ hajmi: {sz/1024:.0f} KB, {len(os.listdir(OUT_BANKS))} fayl")
print(f"  curriculum.json hajmi: {os.path.getsize(OUT_DATA + '/curriculum.json')/1024:.0f} KB")
