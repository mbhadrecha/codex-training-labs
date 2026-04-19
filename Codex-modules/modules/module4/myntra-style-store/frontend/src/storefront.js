export const SORT_OPTIONS = {
  FEATURED: "featured",
  PRICE_ASC: "price-asc",
  PRICE_DESC: "price-desc",
};

export function createPriceBuckets(products, increment = 500) {
  const maxPrice = products.reduce(
    (currentMax, product) => Math.max(currentMax, Number(product.price) || 0),
    0,
  );

  if (maxPrice === 0) {
    return [];
  }

  const bucketCount = Math.ceil(maxPrice / increment);

  return Array.from({ length: bucketCount }, (_, index) => {
    const min = index * increment;
    const max = Math.min(((index + 1) * increment) - 1, maxPrice);

    return {
      id: `${min}-${max}`,
      min,
      max,
      label: `₹${min.toLocaleString("en-IN")} - ₹${max.toLocaleString("en-IN")}`,
    };
  });
}

export function filterProducts(products, filters) {
  return products.filter((product) => {
    const categoryMatch =
      filters.category === "all" || product.category === filters.category;
    const priceMatch =
      !filters.priceBucket ||
      (product.price >= filters.priceBucket.min &&
        product.price <= filters.priceBucket.max);

    return categoryMatch && priceMatch;
  });
}

export function sortProducts(products, sortOrder) {
  const sortedProducts = [...products];

  if (sortOrder === SORT_OPTIONS.PRICE_ASC) {
    sortedProducts.sort((left, right) => left.price - right.price);
  } else if (sortOrder === SORT_OPTIONS.PRICE_DESC) {
    sortedProducts.sort((left, right) => right.price - left.price);
  }

  return sortedProducts;
}

export function updateCartQuantity(cart, productId, nextQuantity) {
  const normalizedQuantity = Math.max(0, nextQuantity);
  const nextCart = { ...cart };

  if (normalizedQuantity === 0) {
    delete nextCart[productId];
  } else {
    nextCart[productId] = normalizedQuantity;
  }

  return nextCart;
}

export function getCartQuantity(cart) {
  return Object.values(cart).reduce((total, quantity) => total + quantity, 0);
}

export function getProductQuantity(cart, productId) {
  return cart[productId] ?? 0;
}

export function getNextSlideIndex(currentIndex, slideCount) {
  if (slideCount < 1) {
    return 0;
  }

  return (currentIndex + 1) % slideCount;
}

export function getPreviousSlideIndex(currentIndex, slideCount) {
  if (slideCount < 1) {
    return 0;
  }

  return (currentIndex - 1 + slideCount) % slideCount;
}
