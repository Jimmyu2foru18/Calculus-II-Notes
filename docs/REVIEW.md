# Calculus II notes: review and changes

This file records what was missing from the 18 day pages, what was changed, how it was checked, and what is still open.

## What was missing before this review

Across all 18 day pages (`days/day-01.html` to `days/day-18.html`):

- No learning goals, prerequisites, or "big idea" statement at the top of the page.
- No method framing before the first worked example.
- No common-mistakes list.
- No practice problems with answers hidden in disclosure blocks.
- No "check yourself" questions or key takeaways.
- No external resources for further study.

Structural and technical problems, mainly on Days 01 to 04:

- Display math was written as `\begin{aligned}` without `$$` delimiters, so MathJax showed raw LaTeX as text.
- Step numbering inside worked solutions was inconsistent.
- Final-answer blocks had invalid HTML nesting.
- Each of Days 01 to 04 was missing its closing `</main></div>`.
- Previous/next navigation in `js/app.js` used IDs that did not match the markup, and its relative links were wrong.
- Ctrl+P was blocked, which stopped printing. Chapter navigation now uses `]` and `[` (Ctrl+Shift+N for notes is unchanged).
- SVG figures and display equations overflowed the page on phone-width screens.

## Mathematical corrections

- **Day 01**: the concavity sentence now reads: concave up only for $x > \tfrac{1}{4}$, since $f''(x) = 14 - \tfrac{7}{4}x^{-3/2}$. Example 4d now uses $u = x^2$ with answer $\tan^{-1}(x^2) + C$.
- **Day 02**: Example 3b was replaced. $\int_0^1 e^{3x}\,dx = \tfrac{1}{3}(e^3 - 1)$, using $u = 3x$. The previous integrand did not match its own solution.
- **Day 03**: Example 8.0 uses the washer method: $V = \pi\int_0^2 (16 - y^4)\,dy = \tfrac{128\pi}{5}$. The earlier value was $\tfrac{32\pi}{5}$.
- **Day 09** and **Day 10**: partial-fraction decomposition corrected to $\frac{2x - 1}{x^2 - 5x + 6} = \frac{-3}{x - 2} + \frac{5}{x - 3}$. Day 09 problem 4 was also corrected.
- **Day 13**: $\lim_{n \to \infty} \frac{n^3}{(n+1)^2} = \infty$.
- **Day 18**: arc length $L = \tfrac{1}{4}\left[2\sqrt{5} + \ln(2 + \sqrt{5})\right] \approx 1.479$.

## What was added to every day

Each day page now has three study boxes:

1. **Start here**: learning goals, what to know before starting, and the big idea.
2. **Method box**: placed before the first worked example.
3. **Practice box**: common mistakes, practice problems with answers in disclosure blocks, check-yourself questions, key takeaways, and a "Go further" list of external resources.

External resources come only from sources found through search or fetched pages. Each day's "Go further" list links to them. The Desmos link is a tool link and was not checked by search.

## Verification

- **Try-it answers**: checked with SymPy. Some were checked by hand: Day 10 problem 3 (divergence), Day 12 series tests, Day 15 interval answers, Day 16 problem 2, and Day 17 problem 2.
- **Rendering**: all 18 pages render with local MathJax 3. Each page has no raw `\begin{aligned}` and no raw `$` delimiters.
- **Phone width**: all 18 pages have a document scroll width of 390px at a 390px viewport. The fix for Day 02 was raising the specificity of the `mjx-container mjx-assistive-mml` rule in `css/styles.css`, so it beats MathJax's own `width: 100%`.
- **Navigation**: previous/next links and the chapter indicator were tested in a headless browser, and `]` moves to the next chapter.

## Still open

- **Video playlist**: the 72 `PLACEHOLDER` iframe slots (4 per day) are not filled. The playlist could not be fetched because the sandbox blocks youtube.com. It needs either the video URLs pasted in or youtube.com enabled in the sandbox settings.
- **Quiz, final review, and final sample pages**: these were not attached, so they were not reviewed.
- **Image manifest**: the 243 PNG entries are not wired into any page. The image files were not attached. The manifest has no folder for Days 05, 09 and 14. Days 13, 15 and 16 use `.PNG` in uppercase. Test folders are not referenced by `js/app.js`.
- **Repeated examples**: Days 09 and 10 still repeat worked examples. They were not removed.
- **Unused gallery code**: `js/app.js` still contains image-gallery code that no page uses.
