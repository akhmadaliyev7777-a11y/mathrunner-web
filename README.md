# MathRunner Web

O'zbekiston **1–4 sinf matematika** darsligining ochiq, bepul interaktiv ko'rinishi.
Sinf va chorakni tanlang, mavzu (blok) testini yeching, fikrlash jumboqlarini o'ynang.
Ro'yxatdan o'tish shart emas — barcha sinf / chorak / blok / bosqich ochiq.

**Jonli sayt:** https://akhmadaliyev7777-a11y.github.io/mathrunner-web/

## Nima bor / nima yo'q

- ✅ Statik **test rejimi** — 574 dars-bosqich, ~5 000 savol (1 to'g'ri + 2 xato), vaqtsiz
- ✅ **Fikrlash o'yinlari** (brauzerda): To'plamlar (Venn), Tartiblash, Xona tarkibi,
  Tarozi (tenglama), Simmetriya, Yoyilma, Jadval, Saralash
- ❌ Yugurish (Runner), Worm Crusher, Algoritm Konveyer — bular faqat **Android ilovasida**
- ❌ Do'kon / XP / qulflar

## Texnik

- **Build step yo'q.** Sof HTML + CSS + ES-module JS. Har qanday statik hosting'da ishlaydi.
- `data/curriculum.json` — sinf → chorak → blok → bosqich daraxti
- `data/banks/*.json` — 574 savol/o'yin banki (asosiy MathRunner ilovasidan o'zgartirishsiz)
- Eng yaxshi natija (yulduz + ochko) `localStorage` da shu brauzerda saqlanadi

### Lokal ishga tushirish

```bash
python3 -m http.server 8000
# -> http://localhost:8000
```

### Kurikulumni yangilash

`tools/export_curriculum.py` asosiy `math_runner` (Flutter) loyihasidagi
`castles_data.dart` dan `data/curriculum.json` va `data/banks/` ni qayta chiqaradi.

## Litsenziya

Ta'lim maqsadida ochiq. Savol kontenti O'zbekiston 1–4 sinf matematika kurikulumi asosida.
