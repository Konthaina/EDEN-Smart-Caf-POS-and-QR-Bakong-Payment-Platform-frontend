// src/composables/useSettings.js
import { ref } from "vue";
import api from "@/plugins/axios";

const settings = ref({
  shop_name: "",
  shop_logo: null, // full URL returned by backend
  tax_rate: 0,
  exchange_rate_usd_khr: 0,
  bakong_machine_id: "", // NEW
});

export default function useSettings() {
  const fetchSettings = async () => {
    const { data } = await api.get("/settings");
    settings.value = data || {};
  };

  /**
   * Update settings via multipart/form-data (supports file upload for shop_logo)
   * - For most fields, empty values are skipped (same behavior as before)
   * - SPECIAL CASE: bakong_machine_id is ALWAYS sent if present in payload,
   *   even when it's an empty string, so the server can CLEAR it.
   */
  const updateSettings = async (payload = {}) => {
    const fd = new FormData();

    // Send bakong_machine_id even if empty string (to allow clearing)
    if (Object.prototype.hasOwnProperty.call(payload, "bakong_machine_id")) {
      fd.append("bakong_machine_id", payload.bakong_machine_id ?? "");
    }

    // Append the rest (skip empty values as before)
    for (const [k, v] of Object.entries(payload)) {
      if (k === "bakong_machine_id") continue; // already handled above
      if (v !== undefined && v !== null && v !== "") {
        fd.append(k, v);
      }
    }

    await api.post("/settings", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    await fetchSettings();
  };

  // Convenience helper to set/clear just the machine id
  const setBakongMachineId = async (id) => {
    await updateSettings({ bakong_machine_id: id ?? "" });
  };

  return { settings, fetchSettings, updateSettings, setBakongMachineId };
}
