---
id: "D41LmlIjrgnWUHTJtAACw"
title: "Iron Sheet"
slug: "iron-sheet"
description: "A lossless TypeScript engine that edits real Excel files."
publishDate: "2026-07-13T00:00-07:00"
status: "published"
heroImage: "6xEjZ0nXAsFXdMzpDjjPib"
---

You can check out this experiment [here](https://github.com/btahir/ironsheet).

> "We found a problem with some content in 'report.xlsx'. Do you want us to try to recover as much as we can?"

If you've ever edited an Excel file from JavaScript, you've met this dialog. And even when Excel doesn't complain, you open the output and the charts are gone, the pivot tables are gone, the macros are gone. Your one-cell edit quietly bulldozed half the workbook.

Ironsheet is my answer: an open-source (Apache-2.0) TypeScript engine for editing real Excel files without breaking them — and proving it.

**Repo:** <https://github.com/btahir/ironsheet>

## Why build this in 2026?

The JavaScript Excel ecosystem is quietly abandoned. SheetJS (~8M weekly downloads) has been frozen on npm since 2022, with security fixes shipped only from its own CDN and the good features locked behind quote-only Pro pricing. ExcelJS hasn't released since 2023 and has open "intent to fork" discussions — its most-upvoted issues are charts deleted on save and files Excel flags as corrupt. xlsx-populate went dormant years ago.

And they all fail the same way, because it's not hundreds of bugs — it's one architectural decision with hundreds of symptoms. They parse the workbook into their own object model and serialize that model back out as a brand-new file. Anything the model doesn't understand — charts, pivot caches, macros, weird namespace extensions — doesn't survive the round-trip. The model is the ceiling, and real Excel files live above the ceiling.

## The inversion

Ironsheet's core bet: the original file is the source of truth, not my object model. It opens the OOXML package and patches only what you explicitly target — a cell, a named range, a table, an image — and preserves every byte it doesn't touch. The parts it has never heard of are exactly as safe as the parts it knows intimately, because it doesn't rewrite them.

```
import { mutateWorkbookFile } from "@ironsheet/node";

const report = await mutateWorkbookFile("template.xlsx", "report.xlsx", async (workbook) => {
  await workbook.patchCell("Summary", "B2", "Q1");
  await workbook.patchNamedRange("RevenueRange", [["North", 42000]]);
  await workbook.replaceTableRows("RevenueTable", [["North", 42000]]);
});

if (!report.wrote) {
  throw new Error("Ironsheet refused to write an invalid workbook");
}
```

## Prove the write

Corruption fails silently — nobody notices until the CFO opens the file three weeks later. So every Ironsheet write has to prove itself: it preflights every target before touching the file, validates the resulting package (relationships, content types, shared strings, formulas, tables, calc chains), and returns both a package-level and a semantic cell-level diff. If validation fails, it refuses to write. Your CI job gets a JSON report and a nonzero exit code instead of a time bomb.

"Lossless" is a claim. A validation report and a diff are evidence.

## What's in the box

- Patch cells, ranges, named ranges, table rows/columns, images, hyperlinks, merged cells, styles, filters, validations, and conditional formats
- Row insert/delete with Excel-equivalent reference rewriting (dead references become `REF!`, just like Excel does it)
- Sheet add/copy/delete with cascade cleanup, semantic workbook diffing, and a JSON-first CLI
- Dependency-free core that runs in Node and the browser

Honest boundaries: it doesn't evaluate formulas (it preserves them and marks recalculation), chart/pivot support is preservation rather than authoring, and ZIP64 writing isn't in yet.
