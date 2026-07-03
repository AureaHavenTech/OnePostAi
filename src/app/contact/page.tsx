"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Mail, Send, Check } from "lucide-react";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="min-h-screen bg-[#fcf9f5] dark:bg-[#141416] py-16 px-4">
      <div className="max-w-lg mx-auto">
        <Link href="/"><Button variant="ghost" size="sm" className="mb-8"><ArrowLeft className="w-4 h-4 mr-2" />Back to Home</Button></Link>

        <h1 className="text-3xl font-bold text-[#1c1c1e] dark:text-[#f5f0f1]">Contact Us</h1>
        <p className="text-sm text-[#6b5a5e] dark:text-[#8a797d] mt-2">Have a question or need help? Send us a message.</p>

        <form onSubmit={handleSubmit} className="mt-8 bg-white dark:bg-[#1c1c1e] border border-[#e0d5d8] dark:border-[#3d3537] rounded-2xl p-6 space-y-4 shadow-sm">
          <div>
            <label className="text-sm font-medium text-[#1c1c1e] dark:text-[#f5f0f1]">Name</label>
            <Input placeholder="Your name" className="mt-1 bg-[#f5f0f1] dark:bg-[#2a2426] border-0" />
          </div>
          <div>
            <label className="text-sm font-medium text-[#1c1c1e] dark:text-[#f5f0f1]">Email</label>
            <Input type="email" placeholder="your@email.com" className="mt-1 bg-[#f5f0f1] dark:bg-[#2a2426] border-0" />
          </div>
          <div>
            <label className="text-sm font-medium text-[#1c1c1e] dark:text-[#f5f0f1]">Message</label>
            <Textarea placeholder="How can we help?" rows={5} className="mt-1 bg-[#f5f0f1] dark:bg-[#2a2426] border-0" />
          </div>
          <Button type="submit" variant="glow" size="lg" className="w-full">
            {sent ? <><Check className="w-4 h-4 mr-2" />Sent! We'll get back to you.</> : <><Send className="w-4 h-4 mr-2" />Send Message</>}
          </Button>
        </form>
      </div>
    </div>
  );
}