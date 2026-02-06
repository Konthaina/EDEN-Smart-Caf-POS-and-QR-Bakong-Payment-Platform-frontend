// src/store/pos.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";

/** Compute the price to charge for a product (discount-aware) */
function effectivePrice(p) {
  if (p?.has_active_discount && p?.final_price != null) {
    return Number(p.final_price);
  }
  if (p?.discount_type && p?.discount_value != null) {
    const base = Number(p?.price || 0);
    if (p.discount_type === "percent") {
      return Math.max(
        0,
        +(base - base * (Number(p.discount_value) / 100)).toFixed(2)
      );
    }
    return Math.max(0, +(base - Number(p.discount_value)).toFixed(2));
  }
  return Number(p?.price || 0);
}

const serialize = (v) => JSON.stringify(v ?? []);

function lineKey({ id, variant_id, customizations, note }) {
  return [
    String(id ?? ""),
    String(variant_id ?? "none"),
    serialize(customizations),
    String(note ?? ""),
  ].join("|");
}

export const usePOSStore = defineStore("pos", () => {
  const cart = ref([]);

  /**
   * addToCart supports two signatures:
   * 1) addToCart(product, customizations=[], note="")
   * 2) addToCart(prebuiltLine)  // e.g. from CustomizeCartItemModal
   */
  const addToCart = (a, b = [], c = "") => {
    let line;

    // Signature 2: prebuilt line (has unit_price or qty etc.)
    if (
      a &&
      typeof a === "object" &&
      ("unit_price" in a || "qty" in a || "variant_id" in a)
    ) {
      const p = a;
      const unit =
        p.unit_price != null
          ? Number(p.unit_price)
          : p.variant_price != null
          ? Number(p.variant_price)
          : effectivePrice(p);

      line = {
        // snapshot essential product info for UI
        id: p.id,
        name: p.name,
        image: p.image,
        category_id: p.category_id,
        price: p.price,
        has_active_discount: p.has_active_discount,
        discount_type: p.discount_type,
        discount_value: p.discount_value,
        final_price: p.final_price,

        // variant snapshot
        variant_id: p.variant_id ?? null,
        variant_name: p.variant_name ?? null,

        // unit price snapshot (always set)
        unit_price: unit,

        // qty + extras
        qty: Number(p.qty || 1),
        customizations: Array.isArray(p.customizations) ? p.customizations : [],
        note: p.note || "",
      };
    } else {
      // Signature 1: (product, customizations, note)
      const product = a;
      const customizations = Array.isArray(b) ? b : [];
      const note = c || "";
      const unit = effectivePrice(product);

      line = {
        ...product,
        id: product.id,
        name: product.name,
        qty: 1,
        unit_price: unit,
        customizations,
        note,
        // no variant in this simple signature
        variant_id: null,
        variant_name: null,
      };
    }

    const key = lineKey(line);
    const existing = cart.value.find((i) => lineKey(i) === key);

    if (existing) {
      existing.qty += line.qty || 1;
    } else {
      cart.value.push(line);
    }
  };

  const increaseQty = (
    id,
    customizations = [],
    note = "",
    variant_id = null
  ) => {
    const target = cart.value.find(
      (i) =>
        i.id === id &&
        (i.variant_id ?? null) === (variant_id ?? null) &&
        serialize(i.customizations) === serialize(customizations) &&
        String(i.note || "") === String(note || "")
    );
    if (target) target.qty += 1;
  };

  const decreaseQty = (
    id,
    customizations = [],
    note = "",
    variant_id = null
  ) => {
    const idx = cart.value.findIndex(
      (i) =>
        i.id === id &&
        (i.variant_id ?? null) === (variant_id ?? null) &&
        serialize(i.customizations) === serialize(customizations) &&
        String(i.note || "") === String(note || "")
    );
    if (idx !== -1) {
      if (cart.value[idx].qty > 1) cart.value[idx].qty -= 1;
      else cart.value.splice(idx, 1);
    }
  };

  const removeFromCart = (
    id,
    customizations = [],
    note = "",
    variant_id = null
  ) => {
    cart.value = cart.value.filter(
      (i) =>
        !(
          i.id === id &&
          (i.variant_id ?? null) === (variant_id ?? null) &&
          serialize(i.customizations) === serialize(customizations) &&
          String(i.note || "") === String(note || "")
        )
    );
  };

  const clearCart = () => {
    // Mutate in place so all consumers keep the same array reference
    cart.value.splice(0, cart.value.length);
  };

  const totalQty = computed(() =>
    cart.value.reduce((sum, item) => sum + (item.qty || 0), 0)
  );

  const subtotal = computed(() =>
    cart.value.reduce(
      (sum, item) => sum + Number(item.unit_price || 0) * (item.qty || 0),
      0
    )
  );

  return {
    cart,
    addToCart,
    increaseQty,
    decreaseQty,
    removeFromCart,
    clearCart,
    totalQty,
    subtotal,
  };
});
