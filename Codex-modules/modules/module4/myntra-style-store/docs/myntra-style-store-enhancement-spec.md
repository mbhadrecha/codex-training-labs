Below is a **Codex-oriented agent workflow spec** version of your app-improvement request. I’ve structured it around explicit context, constraints, deliverables, and definition of done because Codex works best with a clear task boundary and completion criteria. OpenAI’s Codex workflow guidance emphasizes giving Codex concrete context and a strong definition of done, and its skills guidance recommends packaging instructions and workflow steps so execution is reliable. ([OpenAI Developers][1])

---

# Codex Spec: Improve Myntra-Style Store App

## Goal

Update the existing Myntra-style store app to improve merchandising, product browsing, and cart interaction.

Codex should inspect the current project, identify the relevant screens/components/assets/state flow, implement the requested UI and behavior changes, verify the result locally, and summarize what changed.

---

## Working Style

Act as a senior product engineer making safe, reviewable changes to an existing codebase.

Do not assume the stack. First inspect the project and determine:

* framework/platform
* app entry points
* screen/component structure
* asset structure
* product data source
* cart state source
* filter/sort implementation status

Before editing, create a concise plan based on the actual codebase. Then implement incrementally and validate each feature. This matches Codex’s documented workflow pattern of inspecting context first, then executing toward a concrete “done” state. ([OpenAI Developers][1])

---

## Primary Task

Implement the following product improvements:

### 1) Fix the image card

* Inspect current product card/image rendering.
* Replace missing, broken, irrelevant, or inconsistent product images.
* Add relevant images to local assets using copyright-safe sources.
* If an image is missing, use a default placeholder.
* Placeholder may be AI-generated if needed.
* Ensure all product cards render a consistent image area without broken-image UI.
* Add safe fallback behavior for load failures.

### 2) Add Akshaya Tritiya festival hero banner

* Add a hero banner for **Akshaya Tritiya**.
* Include festive discount messaging and shopping CTA.
* Banner must contain at least 3 slides/images.
* Add page control/dots.
* Auto-swap every 4 seconds.
* Carousel must loop infinitely and never stop.
* Manual swipe should still work.
* After manual interaction, auto-rotation should continue.

### 3) Add filter button

Add a filter control with:

* **Price range**

  * buckets in ₹500 increments
  * continue until the highest-priced product in the dataset
* **Category**

  * derive from the product catalog or current data source

Filtering must update the visible item list correctly.

### 4) Add sort button

Add a sort control with:

* High to low price
* Low to high price

Sort should work correctly together with filters.

### 5) Add cart icon on top-right

* Add a cart icon in the top-right header area.
* Show badge count for items in cart.
* Badge count should reflect total quantity, not just unique items.
* Badge should update immediately when cart state changes.

### 6) Add item-card cart controls

Each item card should support:

* Add to cart
* Remove/decrement
* Increment quantity
* Show quantity state inline on the card

If quantity becomes zero, revert to Add to Cart state.

---

## Execution Requirements

### Phase 1: Inspect

Codex must first inspect and document:

* project structure
* relevant pages/screens
* product card component(s)
* hero/banner component(s)
* cart state/store/provider
* filter/sort logic if already present
* asset folder conventions
* product data schema

### Phase 2: Plan

Produce a short implementation plan covering:

* files to modify
* any new files/assets to add
* state changes needed
* dependency changes if needed
* risks or assumptions

### Phase 3: Implement

Make focused changes in the smallest reasonable set of files.

Prefer extending existing patterns over introducing a new architecture unless required.

### Phase 4: Validate

Run applicable checks such as:

* lint
* typecheck
* tests
* build
* app preview/manual validation steps

If tests do not exist, add targeted tests for critical logic where appropriate, especially:

* filter generation
* sort behavior
* cart quantity behavior
* fallback image behavior
* carousel looping logic

### Phase 5: Report

At the end, provide:

* summary of what changed
* files changed
* assets added
* validation results
* known limitations
* follow-up recommendations

---

## Constraints

* Do not break existing navigation or checkout flow.
* Reuse current design system/styles where possible.
* Keep behavior responsive across supported screen sizes.
* Keep changes production-oriented, not demo-only.
* Do not hardcode price buckets unless the dataset is static and that is already the established pattern.
* Prefer dynamic derivation for categories and max price.
* Avoid adding large libraries unless necessary.
* If using a carousel package, justify why the existing stack cannot support the feature cleanly.
* Use local or controlled assets for banner/product imagery.
* Do not leave broken image URLs in the code.

---

## Asset Requirements

### Product images

* Use copyright-safe images.
* Store in an organized assets path such as:

  * `assets/products/`
  * `assets/placeholders/`

### Festival banner images

* Add at least 3 festive hero images to:

  * `assets/banners/akshaya-tritiya/`

### Placeholder

* Provide a generic fallback placeholder image.
* Use it whenever image data is missing or fails to load.

---

## Behavior Requirements

### Product cards

* Consistent aspect ratio
* No layout shift while images load
* Fallback placeholder on error
* Inline cart controls reflect current quantity

### Hero carousel

* Minimum 3 slides
* 4-second auto-advance
* Infinite looping
* Page indicators stay in sync
* No stopping after the last slide
* No timer duplication or memory leak behavior

### Filters

* Price buckets in ₹500 ranges
* Category options generated from product data
* Clear/apply behavior if the UI pattern supports it
* Empty-state UI when nothing matches

### Sorting

* Ascending price
* Descending price
* Works correctly with filtered results

### Cart badge

* Top-right placement
* Real-time badge updates
* Total quantity shown

---

## Acceptance Criteria

The task is complete only if all of the following are true:

1. Every product card shows either:

   * a valid relevant image, or
   * a placeholder image

2. The home/store page shows an **Akshaya Tritiya** hero carousel with:

   * at least 3 slides
   * page indicators
   * 4-second auto-rotation
   * infinite looping

3. A filter control exists with:

   * price buckets in ₹500 increments up to max product price
   * category filtering

4. A sort control exists with:

   * price high to low
   * price low to high

5. A cart icon is visible at the top-right with a badge showing total cart quantity.

6. Each product card supports:

   * add to cart
   * increment
   * decrement/remove
   * visible quantity state

7. Filters, sorting, and cart behavior all work together without state inconsistency.

8. The app builds and passes relevant validation checks.

---

## Expected Output Format from Codex

Codex should respond in this format:

### SECTION 1: CODEBASE INSPECTION

* framework/platform
* key entry points
* relevant files/components
* current cart/data/image flow
* assumptions or uncertainties

### SECTION 2: IMPLEMENTATION PLAN

* files to edit
* files/assets to add
* state/data updates
* validation plan

### SECTION 3: CHANGES MADE

* exact implementation summary
* important code paths changed
* any dependency changes

### SECTION 4: VALIDATION

* commands run
* results
* manual checks performed

### SECTION 5: FINAL STATUS

* completed items
* partial items
* known issues
* suggested next improvements

---