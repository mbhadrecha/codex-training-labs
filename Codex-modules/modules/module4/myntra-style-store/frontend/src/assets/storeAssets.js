import slideOne from "./banners/akshaya-tritiya/slide-1.svg";
import slideTwo from "./banners/akshaya-tritiya/slide-2.svg";
import slideThree from "./banners/akshaya-tritiya/slide-3.svg";
import anayaSaree from "./products/anaya-saree.svg";
import blockPrintCoord from "./products/block-print-coord.svg";
import placeholderImage from "./products/placeholder.svg";
import silkKurta from "./products/silk-kurta.svg";
import smartWatch from "./products/smart-watch.svg";
import sunglasses from "./products/sunglasses.svg";
import urbanSneakers from "./products/urban-sneakers.svg";

export const placeholderAsset = placeholderImage;

export const productImageMap = {
  "anaya-saree": anayaSaree,
  "urban-sneakers": urbanSneakers,
  "silk-kurta": silkKurta,
  "smart-watch": smartWatch,
  "block-print-coord": blockPrintCoord,
  sunglasses,
};

export const festivalSlides = [
  {
    id: "golden-grace",
    image: slideOne,
    eyebrow: "Akshaya Tritiya Edit",
    title: "Shine brighter with festive gold-toned picks and handcrafted drapes.",
    description:
      "Celebrate auspicious shopping with curated ethnic silhouettes, easy gifting, and celebratory savings all week long.",
    cta: "Shop festive bestsellers",
    accent: "Up to 40% off on select occasion wear",
  },
  {
    id: "prosperity-drop",
    image: slideTwo,
    eyebrow: "Prosperity Specials",
    title: "Daily drop deals on accessories, gifting, and statement fashion.",
    description:
      "Blend gifting-ready accessories with quick-ship wardrobe upgrades for the season's most-loved festival moments.",
    cta: "Explore gift-ready styles",
    accent: "Extra 10% off on carts above ₹4,999",
  },
  {
    id: "city-to-celebration",
    image: slideThree,
    eyebrow: "Metro Fast Delivery",
    title: "From city commute to celebration night, build the whole look in one cart.",
    description:
      "Mix festive apparel, modern accessories, and smart essentials with delivery promises tailored for major Indian cities.",
    cta: "Build my festive cart",
    accent: "Express delivery available in select metros",
  },
];
