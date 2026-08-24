import axiosInstance from "@/api/axiosinstance";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle,
  Clock,
  Save,
  Settings,
  Watch,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

// --- MOCK API CALLS for SLA Configuration (Updated to handle TTA and TTR) ---

// Mock initial data: TTA = Time to Acknowledge/Assign, TTR = Time to Resolve
const DEFAULT_SLA_CONFIG = {
  HIGH: { TTA: 2, TTR: 24 },
  MEDIUM: { TTA: 4, TTR: 72 },
  LOW: { TTA: 8, TTR: 168 },
};

// Mock function to simulate fetching the current configuration
const fetchSLAConfig = async () => {
  try {
    const res = await axiosInstance.get("/slaconfig");
    const data = res.data;
    return { data };
  } catch (error) {
    console.log(error);

    toast.error("Unable to load sla values");
  }
};

// Mock function to simulate saving the new configuration
const saveSLAConfig = async (newConfig) => {
  try {
    const res = await axiosInstance.post("/slaconfig", { newConfig });
    // await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    return { success: true, message: "SLA configuration saved successfully!" };
  } catch (error) {
    toast.error("Unable to save new config ");
  }
};

// Mock CircularProgress Component for loading states
const CircularProgress = () => (
  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
);

const ConfigureSLA = ({ onBack }) => {
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: string }
  const [timeUnit, setTimeUnit] = useState("Hours"); // 'Hours' or 'Days'

  // Constants for unit conversion
  const HOURS_IN_UNIT = timeUnit === "Days" ? 24 : 1;

  // 1. Fetch Initial Configuration on Mount
  useEffect(() => {
    const loadConfig = async () => {
      setLoading(true);
      try {
        const res = await fetchSLAConfig();
        // console.log(res);
        setConfig(res?.data || DEFAULT_SLA_CONFIG);
      } catch (error) {
        setConfig(DEFAULT_SLA_CONFIG);
        setMessage({
          type: "error",
          text: "Failed to load current SLA settings.",
        });
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
  }, []);

  // 2. Handle Input Changes
  const handleChange = useCallback(
    (urgency, type, value) => {
      // Convert input value (in selected unit) to internal Hours representation
      const numericValue = parseInt(value, 10);
      if (isNaN(numericValue) || numericValue < 0) return;

      const hoursValue = numericValue * HOURS_IN_UNIT;

      setConfig((prev) => ({
        ...prev,
        [urgency]: {
          ...prev[urgency],
          [type]: hoursValue,
        },
      }));
      // Clear message on change
      setMessage(null);
    },
    [HOURS_IN_UNIT],
  );

  // 3. Handle Save Action
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await saveSLAConfig(config);
      // console.log(res);

      if (res.success) {
        setMessage({ type: "success", text: res.message });
      } else {
        setMessage({
          type: "error",
          text: "Save operation failed on the server.",
        });
      }
    } catch (error) {
      console.error("Save error:", error);
      setMessage({
        type: "error",
        text: "An unexpected error occurred during saving.",
      });
    } finally {
      setSaving(false);
      // Clear success message after 5 seconds
      if (message?.type === "success") {
        setTimeout(() => setMessage(null), 5000);
      }
    }
  };

  // Helper to render an individual SLA input field (TTA or TTR)
  const renderDeadlineInput = (urgency, type, title, icon) => {
    const currentHours = config[urgency]?.[type] || 0;
    const displayValue = (currentHours / HOURS_IN_UNIT).toFixed(0);

    return (
      <div className="flex flex-col mb-4">
        <label className="text-sm font-medium text-gray-700 flex items-center mb-1">
          {icon}
          <span className="ml-2">{title}</span>
        </label>
        <div className="relative">
          <input
            type="number"
            min="0"
            step="1"
            value={displayValue}
            onChange={(e) => handleChange(urgency, type, e.target.value)}
            disabled={saving || loading}
            className="w-full py-2 pl-4 pr-16 text-xl text-black font-mono border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition duration-150"
          />
          <span className="absolute right-0 top-0 h-full flex items-center pr-4 text-gray-500 font-semibold text-sm">
            {timeUnit}
          </span>
        </div>
      </div>
    );
  };

  // Helper to render urgency level components
  const renderSLASection = (urgency) => {
    // Determine color based on urgency
    let colorClass = "";
    switch (urgency) {
      case "HIGH":
        colorClass = "text-red-500 border-red-500";
        break;
      case "MEDIUM":
        colorClass = "text-yellow-500 border-yellow-500";
        break;
      case "LOW":
        colorClass = "text-green-500 border-green-500";
        break;
      default:
        colorClass = "text-gray-500 border-gray-500";
        break;
    }

    return (
      <div
        className={`p-6 rounded-xl shadow-2xl transition duration-300 bg-white hover:shadow-xl border-t-8 ${colorClass.replace("text-", "border-t-")}`}
      >
        <div className="flex items-center mb-5">
          <Clock className={`w-7 h-7 mr-3 ${colorClass}`} />
          <h3 className={`text-2xl font-extrabold uppercase ${colorClass}`}>
            {urgency} Priority
          </h3>
        </div>

        {renderDeadlineInput(
          urgency,
          "TTA",
          "Time to Acknowledge/Assign",
          <Watch className="w-4 h-4" />,
        )}

        <div className="my-4 border-b border-gray-200"></div>

        {renderDeadlineInput(
          urgency,
          "TTR",
          "Time to Resolve (Final Deadline)",
          <CalendarDays className="w-4 h-4" />,
        )}
      </div>
    );
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm font-sans">
      {/* Header and Back Button */}
      <div className="flex justify-between items-center mb-6 border-b border-indigo-700 pb-4">
        <h2 className="text-3xl font-extrabold text-yellow-400 flex items-center">
          <Settings className="w-7 h-7 mr-3" />
          SLA Configuration
        </h2>
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center text-sm font-semibold text-gray-300 hover:text-indigo-400 transition"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Admin Dashboard
          </button>
        )}
      </div>

      <p className="text-gray-300 mb-6">
        Define the service level agreement deadlines for how quickly staff must
        acknowledge and resolve complaints based on their urgency.
      </p>

      {/* Time Unit Selector */}
      <div className="flex justify-end mb-8">
        <div className="inline-flex rounded-full border border-slate-200 bg-slate-100 p-1 shadow-inner">
          <button
            type="button"
            onClick={() => setConfig(DEFAULT_SLA_CONFIG)}
            className="mr-2 rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-slate-900"
          >
            Restore Defaults
          </button>
          <button
            onClick={() => setTimeUnit("Hours")}
            className={`px-4 py-2 text-sm font-semibold rounded-full transition duration-200 flex items-center ${
              timeUnit === "Hours"
                ? "bg-indigo-500 text-black shadow-md"
                : "text-gray-300 hover:bg-gray-600"
            }`}
          >
            <Clock className="w-4 h-4 mr-1" /> Hours
          </button>
          <button
            onClick={() => setTimeUnit("Days")}
            className={` px-4 py-2 text-sm font-semibold rounded-full transition duration-200 flex items-center ${
              timeUnit === "Days"
                ? "bg-indigo-500 text-black shadow-md"
                : "text-gray-300 hover:bg-gray-600"
            }`}
          >
            <CalendarDays className="w-4 h-4 mr-1" /> Days
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center h-48">
          <div className="flex items-center text-lg font-semibold text-indigo-400">
            <CircularProgress />
            <span className="ml-3">Loading SLA settings...</span>
          </div>
        </div>
      )}

      {/* Configuration Form */}
      {!loading && (
        <form onSubmit={handleSave}>
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {renderSLASection("HIGH")}
            {renderSLASection("MEDIUM")}
            {renderSLASection("LOW")}
          </div>

          {/* Message Area */}
          {message && (
            <div
              className={`p-4 rounded-xl mb-6 flex items-center text-sm font-semibold ${
                message.type === "success"
                  ? "bg-green-600 text-white"
                  : "bg-red-600 text-white"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle className="w-5 h-5 mr-2" />
              ) : (
                <XCircle className="w-5 h-5 mr-2" />
              )}
              {message.text}
            </div>
          )}

          {/* Save Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition duration-300 disabled:bg-indigo-400 shadow-xl shadow-indigo-500/30"
          >
            {saving ? (
              <>
                <CircularProgress />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Save SLA Configuration</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default ConfigureSLA;
