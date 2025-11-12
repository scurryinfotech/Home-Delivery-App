import React, { useEffect, useRef } from "react";
import MenuItem from "./MenuItems";

const CategorySection = ({
  categoryId,
  categoryName,
  subcategories,
  expanded,
  toggleCategory,
  addToCart,
  getItemQuantityInCart,
  updateCartQuantity,
  searchterm,
}) => {
  const sectionRef = useRef(null);

 const q = (searchterm ?? "").trim().toLowerCase();

const hasSearchMatch =
  q.length > 0 &&
  Object.values(subcategories ?? {}).some((items) =>
    (items ?? []).some((item) =>
      (item?.name ?? "").toLowerCase().includes(q)
    )
  );

const isExpanded = expanded;



  // Optional: when a search causes expansion, scroll into view and/or focus
  useEffect(() => {
    if (hasSearchMatch && sectionRef.current) {
      // Smooth scroll to make the opened category visible
      sectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      // Optional: If the button should get focus for accessibility
      const btn = sectionRef.current.querySelector("button[data-cat-btn='true']");
      if (btn) btn.focus({ preventScroll: true });
    }
  }, [hasSearchMatch]);

  return (
    <div
      id={`menu-category-${categoryId}`}
      className="mb-1 scroll-mt-58"
      ref={sectionRef}
    >
      <button
        onClick={() => toggleCategory(categoryId)}
        className="text-lg font-semibold mt-3 mb-2 text-black bg-gray-100 px-4 py-2 rounded shadow w-full text-left cursor-pointer "
        aria-expanded={isExpanded}
        aria-controls={`panel-${categoryId}`}
        data-cat-btn="true">
        {categoryName} {isExpanded ? "▲" : "▼"}
      </button>

      {isExpanded &&
        Object.entries(subcategories ?? {}).map(([subName, items]) => {
          const visibleItems =
            items?.filter(
              (item) => q.length === 0 || item?.name?.toLowerCase()?.includes(q)
            ) ?? [];

          // If you want to hide empty subcategory blocks during search, skip when no visible items
          if (q.length > 0 && visibleItems.length === 0) return null;

          return (
            <div key={subName} className="mb-4" id={`panel-${categoryId}`}>
              <h3 className="text-md font-medium mb-2">{subName}</h3>
              <div className="space-y-4">
                {visibleItems.map((item, idx) => (
                  <MenuItem
                    key={`${item?.id ?? idx}-${subName}`}
                    item={item}
                    subcategoryName={subName}
                    getItemQuantityInCart={getItemQuantityInCart}
                    addToCart={addToCart}
                    updateCartQuantity={updateCartQuantity}
                  />
                ))}
              </div>
            </div>
          );
        })}
        
    </div>
  );
};

export default CategorySection;
