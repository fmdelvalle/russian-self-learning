# Russian → Spanish–Czech-lite Romanization (with Stress Marks)

## Overview
This system romanizes Russian Cyrillic into a Spanish-friendly Latin alphabet inspired by Czech orthography.
It avoids diacritics except for the **acute accent (´)**, which marks stress in **non-monosyllabic words**.
Soft consonants are indicated with an apostrophe (’).
The result is readable for Spanish speakers, largely reversible, and phonetically intuitive.

---

## General Principles

- All transliterations use lowercase unless capitalization is required.
- Stress (`´`) is marked **only in polysyllabic words** on the stressed vowel.
  - Example: *вода́ → vodá*, *дом → dom* (no accent).
- `'` (apostrophe) marks **soft consonants** (palatalization, Russian ь or before е, ё, и, ю, я).
- `"` (double quote) optionally marks **hard sign** (ъ); may be omitted.
- Word-initial vowels е, ё, ю, я are preceded by **y** (→ ye, yo, yu, ya).
- Elsewhere, these vowels **palatalize** the preceding consonant → C’ + vowel.
- Use only characters on a Spanish keyboard: no č, š, ž.

---

## Letter Mapping Table

| Cyrillic | IPA | Romanization | Notes |
|-----------|-----|---------------|-------|
| А а | a | **a** | as in *casa* |
| Б б | b | **b** |  |
| В в | v | **v** |  |
| Г г | g | **g** | always hard |
| Д д | d | **d** |  |
| Е е | je / e | **ye / e** | “ye” at word start; otherwise palatalizes preceding consonant (C’e) |
| Ё ё | jo | **yo / ’o** | “yo” at word start; otherwise C’o |
| Ж ж | ʐ | **zh** | like French *jour* |
| З з | z | **z** |  |
| И и | i | **i** |  |
| Й й | j | **y** | semivowel |
| К к | k | **k** |  |
| Л л | l / lʲ | **l / l’** | soft → l’ |
| М м | m / mʲ | **m / m’** |  |
| Н н | n / nʲ | **n / n’** |  |
| О о | o | **o** | stressed → *ó* if word polysyllabic |
| П п | p / pʲ | **p / p’** |  |
| Р р | r / rʲ | **r / r’** |  |
| С с | s / sʲ | **s / s’** |  |
| Т т | t / tʲ | **t / t’** |  |
| У у | u | **u** | stressed → *ú* |
| Ф ф | f | **f** |  |
| Х х | x | **j** | Spanish *j* |
| Ц ц | ts | **ch** | user’s choice for softer look |
| Ч ч | tʃ | **tch** | distinct from ц |
| Ш ш | ʃ | **sh** |  |
| Щ щ | ɕː | **shch** |  |
| Ы ы | ɨ | **y** | darker *i* |
| Э э | e | **e** | stressed → *é* |
| Ю ю | ju | **yu / ’u** | “yu” word-initial; otherwise C’u |
| Я я | ja | **ya / ’a** | “ya” word-initial; otherwise C’a |
| Ь | — | **’** | soft sign |
| Ъ | — | **"** (optional) | hard sign |

---

## Stress Marking

- Stress is marked with **an acute accent (´)** on the vowel of the stressed syllable.
- Only apply the accent if the word has **two or more syllables**.
- Example pairs:
  - вода́ → **vodá**
  - молоко́ → **molokó**
  - дом → **dom** (no accent)
  - друг → **drug** (no accent)

---

## Examples

| Russian | Romanization | English |
|----------|---------------|----------|
| Москва́ | **Moschvá** | Moscow |
| Я люблю́ тебя́ | **Ya lyublyú teb’yá** | I love you |
| Хоро́шо | **Joroshó** | Good |
| Пу́шкин | **Púshkin** | Pushkin |
| Царь | **Charr’** | Tsar |
| Жи́знь | **Zhíz’n’** | Life |
| Снег идёт | **S’neg id’yót** | Snow is falling |
| Щу́ка в реке́ | **Shchúka v rek’é** | Pike in the river |
| Друзья́ | **Druzyá** | Friends |
| Ме́льник | **Mél’nik** | Miller |
| Зима́ | **Zimá** | Winter |
| До́м | **Dom** | House |

---

## Notes for LLM Implementation

1. **Always include stress marks** on polysyllabic words, **never** on monosyllabic ones.
2. Place the acute accent **on the vowel of the stressed syllable** (а → á, е → é, и → í, о → ó, у → ú, я → yá, ё → yó, ю → yú).
3. Maintain `'` after soft consonants (before е, ё, и, ю, я or from ь).
4. Preserve original capitalization and punctuation.
5. Cyrillic → Latin conversion is **context-sensitive** for vowels (е, ё, ю, я) based on position.
6. When converting back, reinsert **ь** before vowels following an apostrophe (’).

