import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Loader2 } from "lucide-react";

export default function RfiResponse() {
  const { token } = useParams<{ token: string }>();
  const [rfi, setRfi] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      // Use service role via edge function for public access
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/rfp-partner-response?type=rfi&token=${token}`,
        { headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` } }
      );
      if (!res.ok) {
        setError("RFI not found or already responded.");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setRfi(data);
      setLoading(false);
    }
    load();
  }, [token]);

  const handleSubmit = async () => {
    setSubmitting(true);
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/rfp-partner-response`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ type: "rfi", token, answers }),
      }
    );
    if (res.ok) {
      setSubmitted(true);
    } else {
      setError("Failed to submit response.");
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full">
          <CardContent className="py-8 text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-success mx-auto" />
            <h2 className="text-xl font-bold">Thank you!</h2>
            <p className="text-muted-foreground">Your response has been submitted successfully.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{rfi.project_name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {(rfi.questions as any[])?.map((q: any) => (
              <div key={q.id} className="space-y-2">
                <p className="text-sm font-medium">Q{q.id}: {q.question}</p>
                <Textarea
                  value={answers[q.id] || ""}
                  onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                  placeholder="Your answer..."
                  rows={3}
                />
              </div>
            ))}
            <Button onClick={handleSubmit} disabled={submitting} className="w-full">
              {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...</> : "Submit Response"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
