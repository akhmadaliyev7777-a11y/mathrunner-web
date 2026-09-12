# -*- coding: utf-8 -*-
"""Arqon tortish savol bankini yasaydi -> data/tug_questions.json.
Har savolda: q (matn), options (4 variant), correct (0..3), d (qiyinlik 1..3).
O'rtacha qiyinlik: ko'pi d=2. Har kategoriya ~44 savol -> bir o'yinga (30 juft) yetadi.
Qayta ishga tushirilsa faylni yangilaydi. Qo'lda ham tahrirlash mumkin."""
import json, random, os

random.seed(2026)
OUT = os.path.join(os.path.dirname(__file__), "..", "data", "tug_questions.json")
PER_CAT = 44

def opts4(correct, gen):
    """correct (str) + 3 ta noyob, manfiy bo'lmagan chalg'ituvchi."""
    o = [str(correct)]
    for _ in range(80):
        if len(o) == 4:
            break
        v = gen()
        if v is not None and str(v) not in o:
            o.append(str(v))
    while len(o) < 4:
        o.append(str(random.randint(2, 99)))
        o = list(dict.fromkeys(o))
    o = o[:4]
    random.shuffle(o)
    return o, o.index(str(correct))

def qi(text, ans, d, spread=(-9, -6, -4, -3, -2, -1, 1, 2, 3, 4, 6, 9)):
    def g():
        v = ans + random.choice(spread)
        return v if v >= 1 else ans + random.choice([1, 2, 3, 5])
    o, c = opts4(ans, g)
    return {"q": text, "options": o, "correct": c, "d": d}

def frac(n, d):
    return f"{n}/{d}"

def mixed(w, n, d):
    if n == 0:
        return str(w)
    if w == 0:
        return frac(n, d)
    return f"{w} {n}/{d}"

def dedup_cap(rows):
    seen, out = set(), []
    random.shuffle(rows)
    for r in rows:
        if r["q"] in seen:
            continue
        seen.add(r["q"])
        out.append(r)
    # qiyinlik bo'yicha muvozanat: ~20% d1, ~55% d2, ~25% d3
    by = {1: [x for x in out if x["d"] == 1], 2: [x for x in out if x["d"] == 2], 3: [x for x in out if x["d"] == 3]}
    want = {1: round(PER_CAT * 0.22), 2: round(PER_CAT * 0.54), 3: round(PER_CAT * 0.24)}
    picked = []
    for t in (1, 2, 3):
        random.shuffle(by[t])
        picked += by[t][:want[t]]
    # yetmasa — qolganidan to'ldirish
    pool = [x for x in out if x not in picked]
    random.shuffle(pool)
    picked += pool[:max(0, PER_CAT - len(picked))]
    random.shuffle(picked)
    return picked[:PER_CAT]

# ---------- KARRA JADVALI (×) ----------
def cat_karra():
    rows = []
    for a in range(2, 13):
        for b in range(2, 13):
            p = a * b
            d = 1 if p <= 24 else (2 if p <= 64 else 3)
            r = random.random()
            if r < 0.6:
                rows.append(qi(f"{a} × {b} = ?", p, d))
            elif r < 0.8:
                rows.append(qi(f"{b} × {a} = ?", p, d))
            else:
                o, c = opts4(b, lambda: max(2, b + random.choice([-3, -2, -1, 1, 2, 3])))
                rows.append({"q": f"{a} × ? = {p}", "options": o, "correct": c, "d": min(3, d + 1)})
    return dedup_cap(rows)

# ---------- KARRA JADVALI ASOSIDA BO'LISH ----------
def cat_bolish():
    rows = []
    for a in range(2, 13):
        for b in range(2, 13):
            p = a * b
            d = 1 if p <= 24 else (2 if p <= 64 else 3)
            if random.random() < 0.5:
                rows.append(qi(f"{p} : {b} = ?", a, d))
            else:
                rows.append(qi(f"{p} : {a} = ?", b, d))
            if random.random() < 0.18:
                o, c = opts4(b, lambda: max(2, b + random.choice([-2, -1, 1, 2, 3])))
                rows.append({"q": f"{p} : ? = {a}", "options": o, "correct": c, "d": min(3, d + 1)})
    return dedup_cap(rows)

# ---------- 100 ICHIDA QO'SHISH / AYIRISH ----------
def cat_qoshish():
    rows = []
    for _ in range(160):
        if random.random() < 0.5:
            a, b = random.randint(12, 78), random.randint(6, 39)
            carry = (a % 10) + (b % 10) >= 10
            s = a + b
            d = 1 if (not carry and s < 60) else (2 if s < 100 else 3)
            rows.append(qi(f"{a} + {b} = ?", s, d))
        else:
            a = random.randint(25, 98)
            b = random.randint(6, a - 6)
            borrow = (a % 10) < (b % 10)
            d = 1 if (not borrow and a < 60) else 2
            rows.append(qi(f"{a} − {b} = ?", a - b, d))
    return dedup_cap(rows)

# ---------- BIR XIL MAXRAJLI KASRLAR: + / − ----------
def cat_kasr_teng():
    rows = []
    for _ in range(140):
        dn = random.choice([3, 4, 5, 6, 7, 8, 9, 10, 12])
        d = 1 if dn <= 6 else 2
        if random.random() < 0.55:
            a = random.randint(1, dn - 2)
            b = random.randint(1, dn - 1 - a)
            ans = frac(a + b, dn)
            wr = [frac(a + b, dn + dn), frac(a + b + 1, dn), frac(max(1, abs(a - b)), dn)]
            text = f"{frac(a, dn)} + {frac(b, dn)} = ?"
        else:
            a = random.randint(2, dn - 1)
            b = random.randint(1, a - 1)
            ans = frac(a - b, dn)
            wr = [frac(a + b, dn), frac(a - b, max(1, dn - b)), frac(a, dn)]
            text = f"{frac(a, dn)} − {frac(b, dn)} = ?"
            d = min(3, d + 1) if dn >= 9 else d
        o = [ans] + [w for w in wr if w != ans]
        while len(o) < 4:
            o.append(frac(random.randint(1, dn), dn))
            o = list(dict.fromkeys(o))
        o = o[:4]
        random.shuffle(o)
        rows.append({"q": text, "options": o, "correct": o.index(ans), "d": d})
    return dedup_cap(rows)

# ---------- ARALASH SONLAR (bir xil maxrajli, karashsiz) ----------
def cat_kasr_aralash():
    rows = []
    for _ in range(150):
        dn = random.choice([3, 4, 5, 6, 7, 8, 10])
        w1, w2 = random.randint(1, 4), random.randint(1, 3)
        n1 = random.randint(1, dn - 2)
        if random.random() < 0.55:
            n2 = random.randint(1, dn - 1 - n1)
            aw, an = w1 + w2, n1 + n2
            text = f"{mixed(w1, n1, dn)} + {mixed(w2, n2, dn)} = ?"
        else:
            if w1 <= w2:
                w1, w2 = w2 + 1, w1
            n2 = random.randint(1, n1)
            if n2 == n1:
                n2 = max(1, n2 - 1)
            aw, an = w1 - w2, n1 - n2
            text = f"{mixed(w1, n1, dn)} − {mixed(w2, n2, dn)} = ?"
        ans = mixed(aw, an, dn)
        d = 2 if (w1 + w2) <= 6 else 3
        wr = [mixed(aw + 1, an, dn), mixed(aw, max(0, an - 1), dn), mixed(max(0, aw - 1), (an + 2) % max(1, dn), dn)]
        o = [ans] + [w for w in wr if w != ans]
        while len(o) < 4:
            o.append(mixed(random.randint(0, 6), random.randint(0, dn - 1), dn))
            o = list(dict.fromkeys(o))
        o = o[:4]
        random.shuffle(o)
        rows.append({"q": text, "options": o, "correct": o.index(ans), "d": d})
    return dedup_cap(rows)

# ---------- TO'G'RI KASRNI SONGA KO'PAYTIRISH ----------
def cat_kasr_kop():
    rows = []
    for _ in range(150):
        dn = random.choice([3, 4, 5, 6, 7, 8, 9, 10, 12])
        n = random.randint(1, dn - 1)
        k = random.randint(2, 6)
        ans = frac(n * k, dn)
        d = 1 if (k <= 3 and dn <= 8) else (3 if n * k > 2 * dn else 2)
        wr = [frac(n * k, dn * k), frac(n + k, dn), frac(n * k, max(1, dn - 1))]
        o = [ans] + [w for w in wr if w != ans]
        while len(o) < 4:
            o.append(frac(random.randint(1, 2 * dn), dn))
            o = list(dict.fromkeys(o))
        o = o[:4]
        random.shuffle(o)
        rows.append({"q": f"{frac(n, dn)} × {k} = ?", "options": o, "correct": o.index(ans), "d": d})
    return dedup_cap(rows)

CATS = [
    ("karra", "Karra jadvali (×)", 3, cat_karra),
    ("bolish", "Karra jadvali asosida bo'lish", 3, cat_bolish),
    ("qoshish", "100 ichida qo'shish / ayirish", 2, cat_qoshish),
    ("kasr_teng", "Bir xil maxrajli kasrlar: + va −", 4, cat_kasr_teng),
    ("kasr_aralash", "Aralash sonlar: + va −", 4, cat_kasr_aralash),
    ("kasr_kopaytirish", "Kasrni songa ko'paytirish", 4, cat_kasr_kop),
]

def valid(rows):
    ok = []
    for r in rows:
        o = r["options"]
        if len(o) == 4 and len(set(o)) == 4 and 0 <= r["correct"] < 4:
            ok.append(r)
    return ok

data = {
    "title": "Arqon tortish — savol banki",
    "note": ("Kategoriyalar. Har savol: q (matn), options (4 variant), "
             "correct (to'g'ri variant indeksi 0..3), d (qiyinlik 1..3). "
             "Har o'yinda ~30 juft savol tanlanadi, ikki jamoaga bir xil qiyinlikda. "
             "Qo'lda tahrirlash mumkin."),
    "categories": [
        {"id": cid, "name": name, "grade": grade, "questions": valid(fn())}
        for cid, name, grade, fn in CATS
    ],
}

with open(OUT, "w") as f:
    json.dump(data, f, ensure_ascii=False, indent=1)

total = 0
for c in data["categories"]:
    ds = {}
    for q in c["questions"]:
        ds[q["d"]] = ds.get(q["d"], 0) + 1
    print(f"  {c['id']:<18} {len(c['questions']):>3} savol   d1/d2/d3 = {ds.get(1,0)}/{ds.get(2,0)}/{ds.get(3,0)}   ({c['name']})")
    total += len(c["questions"])
print(f"Jami: {total} savol -> {os.path.relpath(OUT)}")
for c in data["categories"]:
    print(f"  [{c['id']}] {json.dumps(c['questions'][0], ensure_ascii=False)}")
