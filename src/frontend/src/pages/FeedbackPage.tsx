import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Loader2, MessageSquare } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSubmitFeedback } from "../hooks/useQueries";

export default function FeedbackPage() {
  const [name, setName] = useState("");
  const [feedbackType, setFeedbackType] = useState<
    "Service" | "Product Quality"
  >("Service");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const submitFeedback = useSubmitFeedback();

  const handleSubmit = async () => {
    if (!name.trim() || !message.trim()) {
      toast.error("Please fill in your name and feedback message.");
      return;
    }
    try {
      await submitFeedback.mutateAsync({
        customerName: name.trim(),
        message: `${feedbackType}: ${message.trim()}`,
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setName("");
        setMessage("");
        setFeedbackType("Service");
      }, 3000);
    } catch {
      toast.error("Failed to submit feedback. Please try again.");
    }
  };

  if (submitted) {
    return (
      <div
        data-ocid="feedback.success_state"
        className="flex flex-col items-center justify-center py-24 px-6 gap-4"
      >
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-primary" />
        </div>
        <div className="text-center">
          <h2 className="font-display text-xl font-bold text-foreground">
            Thank you for your feedback!
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            We appreciate you taking the time to share your thoughts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 pb-24 space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
          <MessageSquare className="w-7 h-7 text-primary" />
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground">
          Share Your Feedback
        </h2>
        <p className="text-sm text-muted-foreground">
          Tell us about your experience with our service and product quality
        </p>
      </div>

      {/* Form */}
      <div className="bg-card rounded-xl shadow-card p-5 space-y-5">
        {/* Name */}
        <div className="space-y-1.5">
          <Label htmlFor="feedback-name" className="font-semibold">
            Your Name
          </Label>
          <Input
            id="feedback-name"
            data-ocid="feedback.name.input"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Feedback Type */}
        <div className="space-y-1.5">
          <Label className="font-semibold">Feedback Type</Label>
          <div
            className="grid grid-cols-2 gap-2"
            data-ocid="feedback.type.toggle"
          >
            <button
              type="button"
              onClick={() => setFeedbackType("Service")}
              className={`py-3 px-4 rounded-lg border-2 font-semibold text-sm transition-colors ${
                feedbackType === "Service"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:border-primary/50"
              }`}
            >
              🛵 Service
            </button>
            <button
              type="button"
              onClick={() => setFeedbackType("Product Quality")}
              className={`py-3 px-4 rounded-lg border-2 font-semibold text-sm transition-colors ${
                feedbackType === "Product Quality"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:border-primary/50"
              }`}
            >
              🥦 Product Quality
            </button>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-1.5">
          <Label htmlFor="feedback-message" className="font-semibold">
            Your Feedback
          </Label>
          <Textarea
            id="feedback-message"
            data-ocid="feedback.message.textarea"
            placeholder="Write your feedback here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="resize-none"
          />
        </div>

        {/* Submit */}
        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={submitFeedback.isPending}
          data-ocid="feedback.submit_button"
        >
          {submitFeedback.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span data-ocid="feedback.loading_state">Submitting...</span>
            </>
          ) : (
            "Submit Feedback"
          )}
        </Button>
      </div>
    </div>
  );
}
