// src/store/menu.js
import { defineStore } from "pinia";
import api from "@/plugins/axios";

export const useMenuStore = defineStore("menu", {
  state: () => ({
    items: [],
    stocks: [],
    categories: [],

    page: 1,
    perPage: 10,
    lastPage: 1,
    total: 0,

    isLoading: false,
    loaded: false,
    loadingMore: false,

    // cancellation + run guards
    _controllers: [],
    _cancelled: false,
    _runId: 0,
  }),

  actions: {
    // ---- helpers ----------------------------------------------------------
    _startNewRun() {
      this._cancelled = false;
      this._runId += 1;
      return this._runId;
    },
    _isStale(runId) {
      return this._cancelled || runId !== this._runId;
    },
    _trackController(ctrl) {
      this._controllers.push(ctrl);
    },
    _untrackController(ctrl) {
      this._controllers = this._controllers.filter((c) => c !== ctrl);
    },
    cancelAll() {
      this._cancelled = true;
      for (const c of this._controllers) {
        try {
          c.abort();
        } catch {}
      }
      this._controllers = [];
      this.loadingMore = false;
      this.isLoading = false;
    },
    resetAndCancel() {
      this.cancelAll();
      this.$reset();
    },

    // HTTP helpers (AbortController-aware)
    async _get(url, config = {}) {
      const controller = new AbortController();
      this._trackController(controller);
      try {
        const res = await api.get(url, {
          ...config,
          signal: controller.signal,
        });
        return res;
      } finally {
        this._untrackController(controller);
      }
    },
    async _post(url, data = {}, config = {}) {
      const controller = new AbortController();
      this._trackController(controller);
      try {
        const res = await api.post(url, data, {
          ...config,
          signal: controller.signal,
        });
        return res;
      } finally {
        this._untrackController(controller);
      }
    },
    async _put(url, data = {}, config = {}) {
      const controller = new AbortController();
      this._trackController(controller);
      try {
        const res = await api.put(url, data, {
          ...config,
          signal: controller.signal,
        });
        return res;
      } finally {
        this._untrackController(controller);
      }
    },
    async _delete(url, config = {}) {
      const controller = new AbortController();
      this._trackController(controller);
      try {
        const res = await api.delete(url, {
          ...config,
          signal: controller.signal,
        });
        return res;
      } finally {
        this._untrackController(controller);
      }
    },

    // ---- data loaders -----------------------------------------------------
    async loadFirstPage(runId) {
      if (this._isStale(runId)) return;

      this.items = [];
      this.page = 1;
      this.isLoading = true;
      this.loaded = false;

      const res = await this._get("/menu-items", {
        params: {
          per_page: this.perPage,
          page: 1,
          with_trashed: 1,
          include_recipes: 1,
          include_variants: 1,
        },
      }).catch((e) => {
        if (this._isStale(runId)) return null;
        throw e;
      });
      if (!res || this._isStale(runId)) return;

      const { data, current_page, last_page, total } = Array.isArray(res.data)
        ? {
            data: res.data,
            current_page: 1,
            last_page: 1,
            total: res.data.length,
          }
        : res.data;

      this.items = data || [];
      this.total = total ?? this.items.length;
      this.lastPage = last_page ?? 1;
      this.page = (current_page ?? 1) + 1;

      await this.loadStocks(runId);
      if (this._isStale(runId)) return;

      this.isLoading = false;
      this.loaded = true;
    },

    async loadMorePages(runId) {
      if (this.loadingMore || this._isStale(runId)) return;
      this.loadingMore = true;
      try {
        while (!this._isStale(runId) && this.page <= this.lastPage) {
          const res = await this._get("/menu-items", {
            params: {
              per_page: this.perPage,
              page: this.page,
              with_trashed: 1,
              include_recipes: 1,
              include_variants: 1,
            },
          }).catch((e) => {
            if (this._isStale(runId)) return null;
            throw e;
          });
          if (!res || this._isStale(runId)) break;

          const batch = Array.isArray(res.data)
            ? res.data
            : res.data?.data || [];
          const newItems = batch.filter(
            (i) => !this.items.some((x) => x.id === i.id)
          );
          this.items.push(...newItems);
          this.page += 1;
        }
      } finally {
        this.loadingMore = false;
      }
    },

    async loadStocks(runId) {
      if (this._isStale(runId)) return;
      const res = await this._get("/stocks").catch((e) => {
        if (this._isStale(runId)) return null;
        throw e;
      });
      if (!res || this._isStale(runId)) return;
      this.stocks = res.data || [];
    },

    async loadCategories(runId) {
      if (this._isStale(runId)) return;
      try {
        const res = await this._get("/categories", {
          params: { visible_only: 1 },
        });
        if (!res || this._isStale(runId)) return;
        this.categories = res.data?.data || res.data || [];
      } catch {
        if (!this._isStale(runId)) this.categories = [];
      }
    },

    // Bootstrap: first page + categories, then background pages
    async init(force = false) {
      if (this.loaded && !force) return;
      const runId = this._startNewRun();
      await Promise.all([
        this.loadFirstPage(runId),
        this.loadCategories(runId),
      ]);
      this.loadMorePages(runId);
    },
    async ensureLoaded() {
      return this.init(false);
    },

    // ---- mutations for row actions (no full refetch) ---------------------
    async archiveMenuItem(id) {
      await this._delete(`/menu-items/${id}`);
      const idx = this.items.findIndex((x) => x.id === id);
      if (idx !== -1)
        this.items[idx] = {
          ...this.items[idx],
          deleted_at: new Date().toISOString(),
          is_active: false,
        };
    },
    async restoreMenuItem(id) {
      await this._post(`/menu-items/${id}/restore`);
      const idx = this.items.findIndex((x) => x.id === id);
      if (idx !== -1)
        this.items[idx] = {
          ...this.items[idx],
          deleted_at: null,
          is_active: true,
        };
    },
    async forceDeleteMenuItem(id) {
      await this._delete(`/menu-items/${id}`, { params: { force: 1 } });
      this.items = this.items.filter((x) => x.id !== id);
      this.total = Math.max(0, (this.total || 0) - 1);
    },
    upsertMenuItem(item) {
      const idx = this.items.findIndex((x) => x.id === item.id);
      if (idx === -1) this.items.unshift(item);
      else this.items[idx] = { ...this.items[idx], ...item };
    },

    // ---- variants (per item) ---------------------------------------------
    async refreshVariants(menuItemId) {
      const res = await this._get(`/menu-items/${menuItemId}`, {
        params: { include_variants: 1, include_recipes: 1, with_trashed: 1 },
      });
      const updated = res?.data;
      const idx = this.items.findIndex((x) => x.id === menuItemId);
      if (idx !== -1 && updated) {
        this.items[idx] = {
          ...this.items[idx],
          ...updated,
          variants: updated.variants || [],
        };
      }
      return updated?.variants || [];
    },

    async createVariant(menuItemId, payload) {
      const res = await this._post(
        `/menu-items/${menuItemId}/variants`,
        payload
      ); // nested
      await this.refreshVariants(menuItemId);
      return res?.data;
    },
    async updateVariant(menuItemId, variantId, payload) {
      const res = await this._put(`/variants/${variantId}`, payload); // SHALLOW
      await this.refreshVariants(menuItemId);
      return res?.data;
    },
    async archiveVariant(menuItemId, variantId) {
      await this._delete(`/variants/${variantId}`); // SHALLOW
      await this.refreshVariants(menuItemId);
    },
    async restoreVariant(menuItemId, variantId) {
      await this._post(
        `/menu-items/${menuItemId}/variants/${variantId}/restore`
      ); // nested custom
      await this.refreshVariants(menuItemId);
    },
    async forceDeleteVariant(menuItemId, variantId) {
      await this._delete(`/variants/${variantId}`, { params: { force: 1 } }); // SHALLOW
      await this.refreshVariants(menuItemId);
    },
  },

  getters: {
    getAvailable: (state) => (menuItem) => {
      const recipes = menuItem?.recipes;
      if (!recipes || recipes.length === 0) return 0;

      const stockMap = {};
      (state.stocks || []).forEach(
        (s) => (stockMap[Number(s.ingredient_id)] = Number(s.quantity))
      );

      let min = Infinity;
      for (const r of recipes) {
        const need = Number(r.quantity || 0);
        const have = Number(stockMap[Number(r.ingredient_id)] || 0);
        if (!need || have < need) return 0;
        const possible = Math.floor(have / need);
        if (possible < min) min = possible;
      }
      return min === Infinity ? 0 : min;
    },

    getAvailableForVariant() {
      return (menuItem, variant) => {
        const list =
          (variant?.recipes && variant.recipes.length > 0
            ? variant.recipes
            : menuItem?.recipes) || [];
        if (!list.length) return 0;

        const stockMap = {};
        (this.stocks || []).forEach(
          (s) => (stockMap[Number(s.ingredient_id)] = Number(s.quantity))
        );

        let min = Infinity;
        for (const r of list) {
          const need = Number(r.quantity || 0);
          const have = Number(stockMap[Number(r.ingredient_id)] || 0);
          if (!need || have < need) return 0;
          const possible = Math.floor(have / need);
          if (possible < min) min = possible;
        }
        return min === Infinity ? 0 : min;
      };
    },

    nonArchivedItems: (state) =>
      (state.items || []).filter((i) => !i?.deleted_at),
    activeItems: (state) =>
      (state.items || []).filter(
        (i) => !i?.deleted_at && (i?.is_active === true || i?.is_active === 1)
      ),
    itemsForPOS() {
      return this.activeItems;
    },
    archivedItems: (state) =>
      (state.items || []).filter((i) => !!i?.deleted_at),
  },
});
