"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import useAuthStore from "@/lib/store/authStore";
import Navbar from "@/app/components/shared/Navbar";
import { toast } from "sonner";
import usePageTitle from "@/lib/hooks/usePageTitle";
import { Plus, Trash2, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function AvailabilityPage() {
  usePageTitle("Set Availability");
  const { user } = useAuthStore();
  const router = useRouter();
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "mentor") {
      router.push("/dashboard");
      return;
    }
    api
      .get(`/api/availability/${user.id}`)
      .then((res) => {
        const data = res.data.data;
        if (data && data.slots) {
          setSlots(data.slots);
          if (data.timezone) setTimezone(data.timezone);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const addSlot = () => {
    setSlots([...slots, { dayOfWeek: 1, startTime: "09:00", endTime: "10:00" }]);
  };

  const updateSlot = (index, field, value) => {
    const updated = [...slots];
    updated[index] = { ...updated[index], [field]: value };
    setSlots(updated);
  };

  const removeSlot = (index) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/api/availability", { slots, timezone });
      toast.success("Availability saved");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-white/40 animate-pulse">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="px-4 py-12 mx-auto max-w-3xl sm:px-6 lg:px-8">
        <Link
          href="/mentor/dashboard"
          className="inline-flex items-center gap-2 mb-8 text-sm font-medium transition text-white/40 hover:text-primary"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <Clock className="w-7 h-7 text-primary" />
          <h1 className="text-3xl font-semibold text-primary font-fugaz">Set Availability</h1>
        </div>
        <p className="mb-8 text-white/60">Define your weekly mentoring schedule.</p>

        <div className="p-6 mb-6 glass-card rounded-3xl">
          <label className="block mb-2 text-sm font-medium text-white/70">Timezone</label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full px-4 py-3 border rounded-xl outline-none glass-input text-primary"
          >
            {Intl.supportedValuesOf?.("timeZone")?.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            )) || <option value={timezone}>{timezone}</option>}
          </select>
        </div>

        <div className="p-6 glass-card rounded-3xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-primary">Weekly Hours</h2>
            <button
              onClick={addSlot}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full bg-primary text-white hover:opacity-90"
            >
              <Plus className="w-4 h-4" />
              Add Slot
            </button>
          </div>

          {slots.length === 0 && (
            <p className="py-8 text-center text-white/40">
              No availability set. Click "Add Slot" to define your available hours.
            </p>
          )}

          <div className="space-y-4">
            {slots.map((slot, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-background">
                <select
                  value={slot.dayOfWeek}
                  onChange={(e) => updateSlot(i, "dayOfWeek", Number(e.target.value))}
                  className="px-3 py-2 border rounded-xl outline-none glass-input text-primary text-sm"
                >
                  {DAYS.map((day, idx) => (
                    <option key={idx} value={idx}>
                      {day}
                    </option>
                  ))}
                </select>
                <input
                  type="time"
                  value={slot.startTime}
                  onChange={(e) => updateSlot(i, "startTime", e.target.value)}
                  className="px-3 py-2 border rounded-xl outline-none glass-input text-primary text-sm"
                />
                <span className="text-white/40">to</span>
                <input
                  type="time"
                  value={slot.endTime}
                  onChange={(e) => updateSlot(i, "endTime", e.target.value)}
                  className="px-3 py-2 border rounded-xl outline-none glass-input text-primary text-sm"
                />
                <button
                  onClick={() => removeSlot(i)}
                  className="p-2 ml-auto text-red-400 transition rounded-full hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 mt-6 font-medium transition-all btn-primary rounded-xl disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Availability"}
          </button>
        </div>
      </div>
    </main>
  );
}
