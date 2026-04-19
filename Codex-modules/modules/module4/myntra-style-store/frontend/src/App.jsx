import { useEffect, useMemo, useState } from "react";
import "./App.css";
import HeroCarousel from "./components/HeroCarousel";
import ProductCard from "./components/ProductCard";
import { festivalSlides } from "./assets/storeAssets";
import {
  createPriceBuckets,
  filterProducts,
  getCartQuantity,
  getProductQuantity,
  sortProducts,
  SORT_OPTIONS,
  updateCartQuantity,
} from "./storefront";

const navLinks = [
  { label: "Collections", href: "#collections" },
  { label: "Categories", href: "#categories" },
  { label: "Products", href: "#products" },
  { label: "Docs", href: "#docs" },
];

const architecturePillars = [
  {
    title: "React + Vite",
    detail: "Single-page storefront experience with derived UI state for sorting, filtering, and cart updates.",
  },
  {
    title: "Express API",
    detail: "Catalog data remains server-driven, including formatted pricing and the product image key used by the client.",
  },
  {
    title: "Local Assets",
    detail: "Festival banners, product art, and placeholder images are served from controlled frontend assets instead of brittle remote URLs.",
  },
];

function App() {
  const [products, setProducts] = useState([]);
  const [banner, setBanner] = useState("");
  const [status, setStatus] = useState("loading");
  const [cart, setCart] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriceBucketId, setSelectedPriceBucketId] = useState("all");
  const [sortOrder, setSortOrder] = useState(SORT_OPTIONS.FEATURED);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [sortPanelOpen, setSortPanelOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchCatalog() {
      try {
        const res = await fetch("http://localhost:5033/api/products", {
          signal: controller.signal,
        });
        if (!res.ok) {
          throw new Error("Catalog service unavailable");
        }

        const data = await res.json();
        setBanner(data.banner);
        setProducts(data.curated);
        setStatus("ready");
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error(error);
          setStatus("error");
        }
      }
    }

    fetchCatalog();

    return () => controller.abort();
  }, []);

  const categories = useMemo(
    () => ["all", ...new Set(products.map((product) => product.category))],
    [products],
  );

  const priceBuckets = useMemo(() => createPriceBuckets(products), [products]);

  const selectedPriceBucket = useMemo(
    () =>
      selectedPriceBucketId === "all"
        ? null
        : priceBuckets.find((bucket) => bucket.id === selectedPriceBucketId) ?? null,
    [priceBuckets, selectedPriceBucketId],
  );

  const visibleProducts = useMemo(() => {
    const filteredProducts = filterProducts(products, {
      category: selectedCategory,
      priceBucket: selectedPriceBucket,
    });

    return sortProducts(filteredProducts, sortOrder);
  }, [products, selectedCategory, selectedPriceBucket, sortOrder]);

  const cartQuantity = useMemo(() => getCartQuantity(cart), [cart]);

  const statusLabel =
    status === "loading"
      ? "Loading curated catalogue..."
      : status === "error"
        ? "Backend unavailable. Start the catalog API to browse live products."
        : banner || `${products.length} festive picks ready`;

  const handleCartUpdate = (productId, nextQuantity) => {
    setCart((currentCart) => updateCartQuantity(currentCart, productId, nextQuantity));
  };

  return (
    <div className="app-shell">
      <header className="main-header">
        <div className="header-brand">
          <div className="logo">Bazaar India</div>
          <p>Festival-first fashion storefront</p>
        </div>

        <nav>
          {navLinks.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <button type="button" className="cart-btn" aria-label="Cart">
            <span className="cart-icon" aria-hidden="true">
              🛍
            </span>
            <span>Cart</span>
            <span className="cart-badge">{cartQuantity}</span>
          </button>
          <button type="button" className="primary-btn">Login · Explore</button>
        </div>
      </header>

      <main>
        <HeroCarousel slides={festivalSlides} statusLabel={statusLabel} />

        <section className="category-panel" id="categories">
          <h2>Live categories</h2>
          <div className="category-grid">
            {categories
              .filter((category) => category !== "all")
              .map((category) => (
                <article key={category}>
                  <h3>{category}</h3>
                  <p>
                    {
                      products.filter((product) => product.category === category)
                        .length
                    }{" "}
                    curated picks in the live catalog.
                  </p>
                </article>
              ))}
          </div>
        </section>

        <section className="products-section" id="products">
          <div className="products-header">
            <div>
              <h2>Product spotlight</h2>
              <p>Dynamic filters, local artwork, and inline cart actions on every item card.</p>
            </div>
            <div className="status-pill">
              {status === "ready"
                ? `Showing ${visibleProducts.length} of ${products.length} SKUs`
                : "Waiting for catalog"}
            </div>
          </div>

          <div className="toolbar">
            <div className="toolbar-group">
              <button
                type="button"
                className="toolbar-btn"
                onClick={() => {
                  setFilterPanelOpen((open) => !open);
                  setSortPanelOpen(false);
                }}
              >
                Filter
              </button>
              {filterPanelOpen && (
                <div className="toolbar-panel">
                  <div className="toolbar-section">
                    <h3>Category</h3>
                    <div className="option-group">
                      {categories.map((category) => (
                        <button
                          key={category}
                          type="button"
                          className={
                            selectedCategory === category ? "option-chip active" : "option-chip"
                          }
                          onClick={() => setSelectedCategory(category)}
                        >
                          {category === "all" ? "All categories" : category}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="toolbar-section">
                    <h3>Price range</h3>
                    <div className="option-group">
                      <button
                        type="button"
                        className={
                          selectedPriceBucketId === "all" ? "option-chip active" : "option-chip"
                        }
                        onClick={() => setSelectedPriceBucketId("all")}
                      >
                        All prices
                      </button>
                      {priceBuckets.map((bucket) => (
                        <button
                          key={bucket.id}
                          type="button"
                          className={
                            selectedPriceBucketId === bucket.id
                              ? "option-chip active"
                              : "option-chip"
                          }
                          onClick={() => setSelectedPriceBucketId(bucket.id)}
                        >
                          {bucket.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="text-btn"
                    onClick={() => {
                      setSelectedCategory("all");
                      setSelectedPriceBucketId("all");
                    }}
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>

            <div className="toolbar-group">
              <button
                type="button"
                className="toolbar-btn"
                onClick={() => {
                  setSortPanelOpen((open) => !open);
                  setFilterPanelOpen(false);
                }}
              >
                Sort
              </button>
              {sortPanelOpen && (
                <div className="toolbar-panel compact">
                  <div className="option-group vertical">
                    <button
                      type="button"
                      className={
                        sortOrder === SORT_OPTIONS.FEATURED ? "option-chip active" : "option-chip"
                      }
                      onClick={() => setSortOrder(SORT_OPTIONS.FEATURED)}
                    >
                      Featured
                    </button>
                    <button
                      type="button"
                      className={
                        sortOrder === SORT_OPTIONS.PRICE_DESC
                          ? "option-chip active"
                          : "option-chip"
                      }
                      onClick={() => setSortOrder(SORT_OPTIONS.PRICE_DESC)}
                    >
                      Price: High to low
                    </button>
                    <button
                      type="button"
                      className={
                        sortOrder === SORT_OPTIONS.PRICE_ASC
                          ? "option-chip active"
                          : "option-chip"
                      }
                      onClick={() => setSortOrder(SORT_OPTIONS.PRICE_ASC)}
                    >
                      Price: Low to high
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {status === "error" && (
            <p className="status-text">Please start the backend with `npm start` in `/backend`.</p>
          )}

          <div className="product-grid" id="stories">
            {status === "loading" && <div className="status-text">Loading products...</div>}
            {status === "ready" && visibleProducts.length === 0 && (
              <div className="empty-state">
                <h3>No items match these filters</h3>
                <p>Try clearing one of the filters or switching the price bucket.</p>
              </div>
            )}
            {status === "ready" &&
              visibleProducts.map((product) => {
                const quantity = getProductQuantity(cart, product.id);

                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    quantity={quantity}
                    onAdd={() => handleCartUpdate(product.id, quantity + 1)}
                    onIncrement={() => handleCartUpdate(product.id, quantity + 1)}
                    onDecrement={() => handleCartUpdate(product.id, quantity - 1)}
                    onRemove={() => handleCartUpdate(product.id, 0)}
                  />
                );
              })}
          </div>
        </section>

        <section className="tech-section">
          <h2>System map & telemetry</h2>
          <p className="hero-description">
            The store now keeps catalog data server-driven while filter, sort, carousel, image fallback,
            and cart quantity logic stay in lightweight client helpers.
          </p>
          <div className="tech-grid">
            {architecturePillars.map((pillar) => (
              <article key={pillar.title}>
                <h3>{pillar.title}</h3>
                <p>{pillar.detail}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="main-footer" id="docs">
        <div>
          <h4>Docs</h4>
          <p>Review `frontend/src/App.jsx`, the new `components/` files, and `frontend/src/storefront.js`.</p>
        </div>
        <div>
          <h4>Next steps</h4>
          <p>Run the backend on `http://localhost:5033`, then open the Vite app to verify filters, banner rotation, and cart state.</p>
        </div>
        <div>
          <h4>Catalog source</h4>
          <p>The Express API now includes `imageKey` values so local storefront art stays consistent.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
