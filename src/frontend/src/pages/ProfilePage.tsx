import { Loader2, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSaveProfile } from "../hooks/useQueries";

export default function ProfilePage() {
  const saveProfileMutation = useSaveProfile();
  const [name, setName] = useState(
    () => localStorage.getItem("brinjal_name") ?? "",
  );
  const [phone, setPhone] = useState(
    () => localStorage.getItem("brinjal_phone") ?? "",
  );
  const [address, setAddress] = useState(
    () => localStorage.getItem("brinjal_address") ?? "",
  );
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !phone.trim()) {
      toast.error("Name and phone are required");
      return;
    }
    try {
      await saveProfileMutation.mutateAsync({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
      });
      localStorage.setItem("brinjal_name", name.trim());
      localStorage.setItem("brinjal_phone", phone.trim());
      localStorage.setItem("brinjal_address", address.trim());
      setSaved(true);
      toast.success("Profile saved!");
      setTimeout(() => setSaved(false), 3000);
    } catch {
      toast.error("Failed to save profile");
    }
  };

  return (
    <div className="pb-4">
      <div className="px-4 pt-4 pb-3">
        <h1 className="font-display font-bold text-gray-900 text-xl">
          My Account
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Your personal information
        </p>
      </div>

      <div className="flex justify-center mb-4">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center shadow-card">
          {name ? (
            <span className="text-3xl font-display font-black text-green-700">
              {name.charAt(0).toUpperCase()}
            </span>
          ) : (
            <User className="w-8 h-8 text-green-400" />
          )}
        </div>
      </div>

      <div className="mx-3 bg-white rounded-2xl shadow-card border border-gray-100 p-4">
        <div className="flex flex-col gap-3">
          <div>
            <label
              htmlFor="account-name"
              className="text-xs font-bold text-gray-600 mb-1 block"
            >
              Full Name
            </label>
            <input
              id="account-name"
              data-ocid="account.input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500 transition-colors"
            />
          </div>
          <div>
            <label
              htmlFor="account-phone"
              className="text-xs font-bold text-gray-600 mb-1 block"
            >
              Phone Number
            </label>
            <input
              id="account-phone"
              data-ocid="account.input"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit mobile number"
              maxLength={10}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500 transition-colors"
            />
          </div>
          <div>
            <label
              htmlFor="account-address"
              className="text-xs font-bold text-gray-600 mb-1 block"
            >
              Delivery Address
            </label>
            <textarea
              id="account-address"
              data-ocid="account.textarea"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Your full delivery address"
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500 transition-colors resize-none"
            />
          </div>

          <button
            type="button"
            data-ocid="account.save_button"
            onClick={handleSave}
            disabled={saveProfileMutation.isPending}
            className="w-full bg-green-700 text-white font-display font-bold py-3.5 rounded-xl text-base flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {saveProfileMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : saved ? (
              <>✅ Saved!</>
            ) : (
              "Save Profile"
            )}
          </button>
        </div>
      </div>

      <div className="mx-3 mt-3 bg-green-50 rounded-xl px-4 py-3">
        <p className="text-green-700 text-xs font-medium">
          🔒 Your profile is automatically filled after your first order. Update
          it anytime.
        </p>
      </div>

      <div className="px-4 py-6 text-center">
        <p className="text-xs text-gray-300">
          &copy; {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            className="underline text-gray-400"
            target="_blank"
            rel="noreferrer"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
