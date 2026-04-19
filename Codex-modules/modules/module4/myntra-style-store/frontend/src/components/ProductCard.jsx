import { useEffect, useState } from "react";
import { placeholderAsset, productImageMap } from "../assets/storeAssets";

function ProductCard({
  product,
  quantity,
  onAdd,
  onIncrement,
  onDecrement,
  onRemove,
}) {
  const resolvedSource = productImageMap[product.imageKey] ?? placeholderAsset;
  const [imageSource, setImageSource] = useState(resolvedSource);

  useEffect(() => {
    setImageSource(resolvedSource);
  }, [resolvedSource]);

  return (
    <article className="product-card">
      <div className="product-badge">{product.badge}</div>
      <div className="product-image-frame">
        <img
          className="product-image"
          src={imageSource}
          alt={product.name}
          loading="lazy"
          onError={() => setImageSource(placeholderAsset)}
        />
      </div>
      <div className="product-body">
        <div className="product-heading">
          <h3>{product.name}</h3>
          <span className="product-price">{product.priceFormatted}</span>
        </div>
        <p>{product.description}</p>
        <div className="product-meta">
          <span className="chip">{product.category}</span>
          <span className="chip subtle">{product.delivery}</span>
        </div>
      </div>
      <div className="product-cart-controls">
        {quantity > 0 ? (
          <>
            <div className="quantity-stepper" aria-label={`${product.name} quantity controls`}>
              <button type="button" onClick={onDecrement} aria-label={`Decrease ${product.name}`}>
                -
              </button>
              <span>{quantity}</span>
              <button type="button" onClick={onIncrement} aria-label={`Increase ${product.name}`}>
                +
              </button>
            </div>
            <button type="button" className="remove-btn" onClick={onRemove}>
              Remove
            </button>
          </>
        ) : (
          <button type="button" className="add-btn" onClick={onAdd}>
            Add to Cart
          </button>
        )}
      </div>
    </article>
  );
}

export default ProductCard;
