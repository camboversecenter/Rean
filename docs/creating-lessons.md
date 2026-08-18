# Creating Lessons on REAN

A practical guide for teachers and content creators. It explains how REAN structures a
course, how to turn a textbook or syllabus into one, and what to write in each field.

Read [Missions](./features/missions.md) first if you want the technical description of
the feature. This document is about the authoring workflow.

---

## 1. What you are building

REAN has exactly **two levels**. There is no chapter or sub-lesson nesting.

```
Mission                     the whole course, what a student enrols in
 └── Module 1               one lesson
 └── Module 2               one lesson
 └── Module 3               one lesson
```

A **Mission** is the course. A **Module** is one lesson inside it. Modules are an ordered
list, and students work through them in order: module 2 stays locked until module 1 is
passed with a score of **70 out of 100** or higher.

`MissionClass` sounds like it might be a chapter, but it is not. It is a cohort: a group
of students with start and end dates and a join code. One mission can run for several
classes at once.

### What a student sees in one module

| Tab                          | Comes from               | Purpose                                       |
| ---------------------------- | ------------------------ | --------------------------------------------- |
| **សង្ខេប** (Summary)         | `objective`, `keyPoints` | What this lesson teaches, before they start   |
| **រៀន** (Learn)              | `theoryPrompt`           | The AI teaches the topic, in Khmer or English |
| **ពិសោធន៍** (Simulation)     | `simulationConfig`       | Optional PhET or Wokwi lab                    |
| **កន្លែងអនុវត្ត** (Practice) | `task`                   | The assignment, and the box they write in     |

---

## 2. The one rule that decides your modules

> **One module = one task = one graded submission.**

This is the rule to plan around, not the chapter numbering in your textbook.

- If five sub-topics build toward **one** assignment, make **one module**. Put the
  sub-topics in `keyPoints` and `theoryPrompt`.
- If a sub-topic needs **its own** assignment, it must be **its own module**.

Splitting one chapter into five modules means the student submits five times and is
graded five times. That is correct when each part has its own exercise, and needless
friction when it does not.

A module can still hold several questions. Three limit problems handed in together are
one module, because they are marked as one submission.

---

## 3. Turning a book into a mission

### There is no book upload

REAN cannot read a PDF or a scanned textbook. The only file uploads in the mission form
are images: the mission thumbnail and the payment QR code. The **AI Mission Architect**
takes a written description, not a file.

So the workflow is to work from the book yourself, chapter by chapter.

### Step by step

**Step 1. Decide the scope of one mission.**

Pick whichever fits your teaching:

| Approach                        | Use when                                                 |
| ------------------------------- | -------------------------------------------------------- |
| One mission = one whole subject | The subject is one journey, taught by one teacher        |
| One mission = one chapter       | Chapters are taught separately, or by different teachers |

Students enrol per mission, and squads and classes are per mission, so a mission is the
unit people sign up for.

**Step 2. List the assignments, not the headings.**

Go through the chapter and write down every exercise you would actually collect and
mark. That list is your module list. Do this before writing anything else.

**Step 3. Draft each module.**

Either write the fields by hand (section 4), or use the AI helpers (section 7) and then
correct what they produce. The AI is a first draft, never the final text.

**Step 4. Check it as a student would.**

Open the mission, read the Summary tab, and ask whether someone who has not read the
book would know what the lesson is about and what they have to hand in.

### Using a book with the AI Architect

You cannot upload the chapter, but you can describe it. Paste your own summary of the
chapter into the AI Mission Architect box, and be specific about the exercises:

```
Grade 12 calculus, chapter 1: limits of functions.
Cover: the meaning of a limit, direct substitution, the 0/0 case solved by
factoring, one-sided limits, and limits that do not exist.
Create one module per exercise set. Every formula must be LaTeX.
```

That produces a far better structure than typing "calculus".

---

## 4. The fields, one by one

### Mission level

| Field            | Limit | What to write                                             |
| ---------------- | ----- | --------------------------------------------------------- |
| Title            |       | The course name a student sees in the catalogue           |
| Description      | 1000  | Why this course is worth their time                       |
| Level            |       | Beginner, Intermediate, or Advanced                       |
| Squad size       |       | Students per team. Use 1 if you do not want teams         |
| Enrollment type  |       | `open` for anyone, `invite_only` for a private class      |
| Plagiarism check |       | Optional. Compares submissions to other students' answers |

### Module level

| Field              | Limit | What to write                                                            |
| ------------------ | ----- | ------------------------------------------------------------------------ |
| **Title**          | 100   | The lesson name. Put the chapter number here if you use chapters         |
| **Objective**      | 300   | What the student will be **able to do** afterwards. Written to them      |
| **Key points**     | 800   | 3 to 5 lines: main ideas, a useful trick, a common mistake. One per line |
| **Task**           | 500   | The assignment they hand in. Must make sense on its own                  |
| **AI persona**     | 500   | Who the AI should be for this lesson                                     |
| **Initial prompt** | 300   | The first thing the AI says when the student opens the lesson            |
| **Theory prompt**  | 1000  | What the AI should teach on the Learn tab                                |

### Objective: describe the ability, not the topic

The objective is student-facing prose. It is not an instruction to the AI.

|     |                                                                                                                                                |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| ❌  | "This lesson is about limits." (describes the topic)                                                                                           |
| ❌  | "Explain limits to the student." (an instruction to the AI, belongs in `theoryPrompt`)                                                         |
| ✅  | "You will be able to calculate limits of polynomial and rational functions, including the 0/0 case, and explain why some limits do not exist." |

### Key points: one per line

Write them the way you would remind a student the night before an exam. Three to five
lines. The form splits on newlines, so do not add bullet characters.

```
A limit is the value a function approaches, not the value at the point
If direct substitution gives a finite number, that is already the answer
If you get 0/0, factor, cancel, then substitute again
Left and right limits must be equal, otherwise the limit does not exist
Common mistake: thinking 0/0 means there is no limit, when it just needs simplifying
```

### Task: it is read on its own screen

The task appears on the Practice tab, separate from the lesson brief. A student reading
only the task must still understand what to do. Do not write "do the exercises above".

---

## 5. Maths and formulas

REAN renders **LaTeX**. Write formulas as LaTeX and they appear as proper notation.
Write them as plain text and they stay plain text.

- `$ ... $` puts a formula inline, inside a sentence.
- `$$ ... $$` puts it on its own centred line.

| Instead of      | Write                  | Shows as        |
| --------------- | ---------------------- | --------------- |
| `(x^2-9)/(x-3)` | `$\dfrac{x^2-9}{x-3}$` | a real fraction |
| `lim(x->3)`     | `$\lim_{x \to 3}`      | proper limit    |
| `sqrt(x+4)`     | `$\sqrt{x+4}$`         | a real root     |
| `x2`            | `$x^2$`                | superscript     |

Useful pieces: `\dfrac{a}{b}`, `\sqrt{x}`, `x^2`, `x_1`, `\lim_{x \to 3}`, `\int`,
`\sum`, `\to`, `\infty`, `\pi`, `\theta`, `\le`, `\ge`, `\ne`. One-sided limits are
`x \to 2^-` and `x \to 2^+`.

This works in **every** field that students read: objective, key points, task, and the
AI's replies.

---

## 6. Chapters

The data model has no chapter level, so put the chapter in the **title**. The sidebar
numbers modules in order, so the grouping reads clearly.

```
Module 1   ជំពូក ១.១ លីមីតនៃអនុគមន៍ (Ch 1.1 Limits of Functions)
Module 2   ជំពូក ១.២ ភាពជាប់ (Ch 1.2 Continuity)
Module 3   ជំពូក ២.១ ដេរីវេ (Ch 2.1 Derivatives)
```

If a subject has many chapters and they are taught separately, make each chapter its own
mission instead.

---

## 7. The AI helpers

Both cost points, and both produce a **draft you must check**.

| Helper                   | Where                            | Input               | Cost |
| ------------------------ | -------------------------------- | ------------------- | ---- |
| **AI Mission Architect** | Top of the mission form          | A topic description | 10   |
| **Magic Fill**           | Inside one module, needs a title | The module title    | 1    |

The Architect creates a whole mission with five modules. Magic Fill fills in one module
from its title, which is useful when you already know your module list from step 2.

### Always check these after generating

1. **Is the task actually markable?** The AI likes vague verbs such as "explore" and
   "discuss". Replace them with something you can put a score on.
2. **Are the formulas LaTeX?** Both generators are told to use it, but check.
3. **Is the objective written to the student?** It sometimes produces an instruction to
   the AI instead.
4. **Does each task match one submission?** The AI does not know your marking scheme.
5. **Is the Khmer natural?** Translated Khmer often reads stiffly. Rewrite it.

---

## 8. Simulations (optional)

A module can embed a lab, shown on its own tab before the Practice tab.

| Type    | Use for            | URL to paste                 |
| ------- | ------------------ | ---------------------------- |
| `phet`  | Physics, chemistry | The PhET simulation page URL |
| `wokwi` | Electronics, IoT   | The Wokwi project URL        |

Add lab instructions telling students what to do and to screenshot their result. The
screenshot is uploaded on the Practice tab and graded with their written answer.

---

## 9. Checklist before publishing

- [ ] Every module has an objective written **to** the student, saying what they can do
- [ ] Every module has 3 to 5 key points, one per line
- [ ] Every module has exactly **one** task, readable on its own
- [ ] Every formula is LaTeX, not plain text
- [ ] Module order matches teaching order, since students are locked into it
- [ ] The first module makes sense to someone who has never used REAN
- [ ] Titles carry the chapter number, if you use chapters
- [ ] You have read the Summary tab as a student would

---

## 10. A complete worked example

Chapter 1.1 of a Grade 12 calculus book, as one module.

**Title**

```
ជំពូក ១.១ លីមីតនៃអនុគមន៍ (Ch 1.1 Limits of Functions)
```

**Objective**

```
អ្នកនឹងអាចគណនាលីមីតនៃអនុគមន៍ពហុធា និងអនុគមន៍សនិទាន រួមទាំងករណី $0/0$
ដោយប្រើការញែកកត្តា ហើយពន្យល់បានថាហេតុអ្វីលីមីតខ្លះមិនមាន។
```

**Key points**

```
លីមីតគឺតម្លៃដែលអនុគមន៍ខិតជិត មិនមែនតម្លៃនៅចំណុចនោះទេ
បើជំនួសដោយផ្ទាល់ទទួលបានចំនួនកំណត់ នោះជាចម្លើយរួចរាល់
បើទទួលបាន $0/0$ ត្រូវញែកកត្តា រួចលុបកត្តារួម ហើយជំនួសម្តងទៀត
លីមីតឆ្វេង និងលីមីតស្តាំត្រូវតែស្មើគ្នា បើមិនដូច្នេះលីមីតមិនមាន
កំហុសទូទៅ៖ គិតថា $0/0$ មានន័យថាគ្មានលីមីត ការពិតត្រូវសម្រួលជាមុនសិន
```

**Task**

```
គណនាលីមីតទាំងបីខាងក្រោម ហើយសរសេរជំហានលម្អិត៖

1. $\lim_{x \to 3} \dfrac{x^2 - 9}{x - 3}$
2. $\lim_{x \to 0} \dfrac{\sqrt{x+4} - 2}{x}$
3. $\lim_{x \to 2} \dfrac{1}{x - 2}$

សម្រាប់លំហាត់ទី ៣ ពន្យល់ថាហេតុអ្វីលីមីតមិនមាន ដោយប្រៀបធៀប
$\lim_{x \to 2^-} \dfrac{1}{x-2}$ និង $\lim_{x \to 2^+} \dfrac{1}{x-2}$។
```

**Theory prompt**

```
Teach the concept of a limit of a function to a Grade 12 student. Cover the
intuitive meaning, direct substitution, the 0/0 indeterminate case solved by
factoring, one-sided limits, and when a limit does not exist. Use LaTeX for
every formula. Give one worked example per case.
```

**AI persona**

```
You are a patient Grade 12 mathematics teacher in Cambodia. Explain in simple
Khmer, use LaTeX for formulas, and always show the steps rather than just the
answer. When a student is wrong, point at the step where it went wrong instead
of solving it for them.
```

**Initial prompt**

```
សួស្តី! ថ្ងៃនេះយើងនឹងរៀនអំពីលីមីតនៃអនុគមន៍។ តើអ្នកធ្លាប់ឆ្ងល់ទេថា
តើមានអ្វីកើតឡើងនៅពេលយើងចែកនឹងលេខដែលខិតជិតសូន្យ?
```

Notice all three exercises sit in **one** module, because they are marked together as
one submission. That is the rule from section 2 working as intended.
