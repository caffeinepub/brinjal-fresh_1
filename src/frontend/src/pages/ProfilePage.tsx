import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSaveProfile } from "../hooks/useQueries";

export default function ProfilePage() {
  const saveProfile = useSaveProfile();

  const [name, setName] = useState(
    () => localStorage.getItem("brinjal_name") ?? "",
  );
  const [phone, setPhone] = useState(
    () => localStorage.getItem("brinjal_phone") ?? "",
  );
  const [address, setAddress] = useState(
    () => localStorage.getItem("brinjal_address") ?? "",
  );

  const hasData = name || phone || address;

  const handleSave = async () => {
    if (!name.trim() || !phone.trim() || !address.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      await saveProfile.mutateAsync({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
      });
      localStorage.setItem("brinjal_name", name.trim());
      localStorage.setItem("brinjal_phone", phone.trim());
      localStorage.setItem("brinjal_address", address.trim());
      toast.success("Profile saved!");
    } catch {
      toast.error("Failed to save profile");
    }
  };

  return (
    <div className="px-3 py-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "#e8f5e9" }}
        >
          <User className="w-7 h-7" style={{ color: "#1a5c2a" }} />
        </div>
        <div>
          <h2 className="font-display font-bold text-gray-800 text-lg">
            {name || "My Profile"}
          </h2>
          {phone && <p className="text-sm text-gray-500">{phone}</p>}
        </div>
      </div>

      {!hasData && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
          <p className="text-sm text-orange-700">
            Your profile will be auto-filled after your first order. You can
            also fill it in manually below.
          </p>
        </div>
      )}

      {/* Profile Form */}
      <div className="bg-white rounded-xl p-4 shadow-sm space-y-4 border border-gray-100">
        <h3 className="font-display font-bold text-gray-800">
          Profile Details
        </h3>

        <div className="space-y-1.5">
          <Label htmlFor="profile-name" className="text-xs font-semibold">
            Your Name
          </Label>
          <Input
            id="profile-name"
            data-ocid="profile.input"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="profile-phone" className="text-xs font-semibold">
            Phone Number
          </Label>
          <Input
            id="profile-phone"
            data-ocid="profile.input"
            type="tel"
            placeholder="Enter your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="profile-address" className="text-xs font-semibold">
            Delivery Address
          </Label>
          <Textarea
            id="profile-address"
            data-ocid="profile.textarea"
            placeholder="Enter your full address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={3}
          />
        </div>

        <Button
          data-ocid="profile.save_button"
          className="w-full font-bold"
          onClick={handleSave}
          disabled={saveProfile.isPending}
        >
          {saveProfile.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
            </>
          ) : (
            "Save Profile"
          )}
        </Button>
      </div>
    </div>
  );
}
