"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send, Mail, Disc } from "lucide-react";
import { useState } from "react";

export function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    formData.append("access_key", process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY!);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("Message sent successfully!");
        e.currentTarget.reset();
      } else {
        alert("Failed to send message. Please try again.");
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 relative overflow-hidden">
      <div className="container px-4 md:px-6 relative z-10">
        <div className="max-w-xl mx-auto">
          <div className="bg-slate-100 dark:bg-slate-900 border-4 border-slate-900 dark:border-white p-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
            <div className="border-2 border-slate-900 dark:border-white p-8">
              <div className="flex items-center gap-3 mb-8 pb-4 border-b-2 border-slate-900 dark:border-white border-dashed">
                <div className="p-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                  <Mail className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-mono font-bold uppercase tracking-tighter">
                  Communication Uplink
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <p className="font-mono text-sm text-slate-600 dark:text-slate-400">
                  {"// Use the form below to transmit a message. Response latency may vary."}
                </p>

                <input type="hidden" name="redirect" value="false" />

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-mono font-bold uppercase">
                      User_ID (Name)
                    </label>
                    <Input
                      name="name"
                      required
                      className="rounded-none border-2 border-slate-900 dark:border-white focus-visible:ring-0 focus-visible:ring-offset-0 bg-white dark:bg-slate-800"
                      placeholder="ENTER NAME..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-mono font-bold uppercase">
                      Return_Address (Email)
                    </label>
                    <Input
                      name="email"
                      type="email"
                      required
                      className="rounded-none border-2 border-slate-900 dark:border-white focus-visible:ring-0 focus-visible:ring-offset-0 bg-white dark:bg-slate-800"
                      placeholder="ENTER EMAIL..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-mono font-bold uppercase">
                      Transmission_Data (Message)
                    </label>
                    <Textarea
                      name="message"
                      required
                      className="min-h-[120px] rounded-none border-2 border-slate-900 dark:border-white focus-visible:ring-0 focus-visible:ring-offset-0 bg-white dark:bg-slate-800"
                      placeholder="ENTER MESSAGE..."
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 rounded-none bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 uppercase font-mono tracking-widest text-lg font-bold group"
                >
                  <span className={isSubmitting ? "hidden" : "group-hover:hidden"}>
                    Transmit
                  </span>
                  <span className={isSubmitting ? "animate-pulse" : "hidden group-hover:inline-block animate-pulse"}>
                    Sending...
                  </span>
                  <Send className="ml-2 w-4 h-4" />
                </Button>
              </form>

              <div className="flex justify-between items-center pt-4 border-t-2 border-slate-900 dark:border-white border-dashed text-xs font-mono text-slate-500">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span>SERVER_STATUS: ONLINE</span>
                    </div>
                    <span>SECURE_CONNECTION_ESTABLISHED</span>
                </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
