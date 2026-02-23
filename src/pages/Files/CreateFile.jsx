import { useForm } from "react-hook-form";
import { endpoints } from "../../api/axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Loader2, FilePlus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const CreateFile = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const navigate = useNavigate();

  // 🟢 NEW: Fetch constants from backend just like in CreateUser.jsx
  const { data: constants, isLoading: isConstantsLoading } = useQuery({
    queryKey: ['appConstants'],
    queryFn: async () => {
      const response = await endpoints.common.constants();
      return response.data.data;
    },
    staleTime: 1000 * 60 * 60 * 24, // Cache for 24 hours since constants rarely change
  });

  const onSubmit = async (data) => {
    // 🟢 FIX: Submit Standard JSON Payload
    const payload = {
      subject: data.subject,
      priority: data.priority,
    };

    try {
      await endpoints.files.create(payload);
      toast.success("e-File initiated successfully!");
      navigate("/files/created");
    } catch (e) {
      console.error(e);
      toast.error(e.response?.data?.message || "Failed to create file");
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in-up">
      <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-4">
        <div className="p-3 bg-teal-50 rounded-xl text-teal-600 border border-teal-100">
          <FilePlus size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Initiate New e-File</h2>
          <p className="text-sm text-slate-500">Fill in the details to start a new file movement.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Subject <span className="text-red-500">*</span>
          </label>
          <input
            {...register("subject", {
              required: "Subject is required",
              minLength: { value: 5, message: "Min 5 chars" },
            })}
            className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 outline-none transition-all"
            placeholder="e.g. Budget Approval"
          />
          {errors.subject && <span className="text-xs text-red-500 mt-1 block">{errors.subject.message}</span>}
        </div>

      <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Priority {isConstantsLoading && <Loader2 className="inline animate-spin ml-2 text-slate-400" size={14} />}
            </label>
            <select
              {...register("priority")}
              className="w-full border border-slate-300 rounded-lg p-3 bg-white outline-none disabled:bg-slate-50"
              disabled={isConstantsLoading}
            >
              {/* 🟢 OPTIMIZED: Dynamically map priorities from backend */}
              {constants?.PRIORITY ? (
                Object.values(constants.PRIORITY).map((priorityValue) => (
                  <option key={priorityValue} value={priorityValue}>
                    {/* Formats "HIGH" to "High", "URGENT" to "Urgent" */}
                    {priorityValue.charAt(0).toUpperCase() + priorityValue.slice(1).toLowerCase()}
                  </option>
                ))
              ) : (
                // Fallback options just in case the API is temporarily slow
                <>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </>
              )}
            </select>
        </div>

        {/* 🟢 FIX: Removed description, file type dropdown, PUC dropzone, and attachment dropzones */}

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-teal-600 text-white px-8 py-3 rounded-xl hover:bg-teal-700 font-semibold shadow-lg shadow-teal-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Create File"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateFile;