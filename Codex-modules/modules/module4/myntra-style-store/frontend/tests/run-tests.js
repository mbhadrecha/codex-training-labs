import assert from "node:assert/strict";
import {
  createPriceBuckets,
  filterProducts,
  getCartQuantity,
  getNextSlideIndex,
  sortProducts,
  SORT_OPTIONS,
  updateCartQuantity,
} from "../src/storefront.js";

const products = [
  { id: 1, category: "Ethnic", price: 4599 },
  { id: 2, category: "Western", price: 3199 },
  { id: 3, category: "Ethnic", price: 2450 },
];

function runTest(name, fn) {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

runTest("createPriceBuckets builds ₹500 buckets up to the max product price", () => {
  const buckets = createPriceBuckets(products);

  assert.equal(buckets.length, 10);
  assert.deepEqual(buckets.at(0), {
    id: "0-499",
    min: 0,
    max: 499,
    label: "₹0 - ₹499",
  });
  assert.deepEqual(buckets.at(-1), {
    id: "4500-4599",
    min: 4500,
    max: 4599,
    label: "₹4,500 - ₹4,599",
  });
});

runTest("filterProducts combines category and price bucket filters", () => {
  const filtered = filterProducts(products, {
    category: "Ethnic",
    priceBucket: { min: 2000, max: 2999 },
  });

  assert.deepEqual(filtered, [{ id: 3, category: "Ethnic", price: 2450 }]);
});

runTest("sortProducts orders prices low to high and high to low", () => {
  const ascending = sortProducts(products, SORT_OPTIONS.PRICE_ASC).map(
    (product) => product.id,
  );
  const descending = sortProducts(products, SORT_OPTIONS.PRICE_DESC).map(
    (product) => product.id,
  );

  assert.deepEqual(ascending, [3, 2, 1]);
  assert.deepEqual(descending, [1, 2, 3]);
});

runTest("updateCartQuantity removes items at zero and keeps quantity totals correct", () => {
  const initialCart = updateCartQuantity({}, 1, 2);
  const expandedCart = updateCartQuantity(initialCart, 2, 1);
  const reducedCart = updateCartQuantity(expandedCart, 1, 0);

  assert.deepEqual(initialCart, { 1: 2 });
  assert.deepEqual(expandedCart, { 1: 2, 2: 1 });
  assert.deepEqual(reducedCart, { 2: 1 });
  assert.equal(getCartQuantity(expandedCart), 3);
});

runTest("getNextSlideIndex loops back to the first slide", () => {
  assert.equal(getNextSlideIndex(0, 3), 1);
  assert.equal(getNextSlideIndex(2, 3), 0);
  assert.equal(getNextSlideIndex(0, 0), 0);
});

console.log("All storefront tests passed.");
