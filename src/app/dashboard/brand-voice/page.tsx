"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic2, Plus, Trash2, Loader2, X } from "lucide-react";
import type { BrandVoice } from "@/lib/types";

const TONE_OPTIONS = [
  "Professional",
  "Casual & Friendly",
  "Luxury & Premium",
  "Playful & Fun",
  "Technical & Detailed",
  "Minimalist & Clean",
  "Urgent & Action-Oriented",
  "Warm & Empathetic",
];

export default function BrandVoicePage() {
  const [voices, setVoices] = useState<BrandVoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    tone: "Professional",
    guidelines: "",
    exampleListings: [""],
    vocabulary: [] as string[],
  });
  const [vocabInput, setVocabInput] = useState("");

  useEffect(() => {
    loadVoices();
  }, []);

  async function loadVoices() {
    const supabase = createClient();
    const { data } = await supabase
      .from("brand_voices")
      .select("*")
      .order("created_at", { ascending: false });
    setVoices((data as unknown as BrandVoice[]) || []);
    setLoading(false);
  }

  async function handleCreate() {
    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("brand_voices").insert({
      user_id: user!.id,
      name: form.name,
      tone: form.tone,
      guidelines: form.guidelines,
      example_listings: form.exampleListings.filter((e) => e.trim()),
      vocabulary: form.vocabulary,
    });

    setShowCreate(false);
    setForm({ name: "", tone: "Professional", guidelines: "", exampleListings: [""], vocabulary: [] });
    setSaving(false);
    loadVoices();
  }

  async function deleteVoice(id: string) {
    const supabase = createClient();
    await supabase.from("brand_voices").delete().eq("id", id);
    loadVoices();
  }

  function addVocab() {
    if (vocabInput.trim()) {
      setForm((f) => ({ ...f, vocabulary: [...f.vocabulary, vocabInput.trim()] }));
      setVocabInput("");
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Brand Voice</h1>
          <p className="text-muted-foreground mt-1">
            Train the AI to match your brand&apos;s unique tone and style.
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gradient-bg border-0">
          <Plus className="w-4 h-4" />
          Create Brand Voice
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
        </div>
      ) : voices.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Mic2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No brand voices yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create a brand voice to ensure all your listings match your brand identity.
            </p>
            <Button onClick={() => setShowCreate(true)} className="gradient-bg border-0">
              <Plus className="w-4 h-4" />
              Create Your First Brand Voice
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {voices.map((voice) => (
            <Card key={voice.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{voice.name}</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => deleteVoice(voice.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <CardDescription>
                  <Badge variant="secondary">{voice.tone}</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {voice.guidelines && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Guidelines</Label>
                    <p className="text-sm mt-1">{voice.guidelines}</p>
                  </div>
                )}
                {voice.vocabulary.length > 0 && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Vocabulary</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {voice.vocabulary.map((v, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {v}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {voice.exampleListings.length > 0 && (
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      {voice.exampleListings.length} example listing(s)
                    </Label>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Brand Voice</DialogTitle>
            <DialogDescription>
              Define your brand&apos;s tone, style guidelines, and provide example listings
              so the AI can match your voice.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Voice Name</Label>
              <Input
                placeholder="e.g., My Brand Voice"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Tone</Label>
              <Select value={form.tone} onValueChange={(v) => setForm((f) => ({ ...f, tone: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TONE_OPTIONS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Style Guidelines</Label>
              <Textarea
                placeholder="Describe how your brand communicates. E.g., 'We use short, punchy sentences. Always emphasize sustainability. Never use slang or emojis.'"
                rows={4}
                value={form.guidelines}
                onChange={(e) => setForm((f) => ({ ...f, guidelines: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Preferred Vocabulary</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a word or phrase..."
                  value={vocabInput}
                  onChange={(e) => setVocabInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addVocab())}
                />
                <Button variant="outline" size="icon" onClick={addVocab}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {form.vocabulary.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.vocabulary.map((v, i) => (
                    <Badge key={i} variant="secondary" className="gap-1">
                      {v}
                      <button
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            vocabulary: f.vocabulary.filter((_, idx) => idx !== i),
                          }))
                        }
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Example Listings (paste existing listings you like)</Label>
              {form.exampleListings.map((ex, i) => (
                <div key={i} className="flex gap-2">
                  <Textarea
                    placeholder="Paste an example product listing that represents your brand voice..."
                    rows={3}
                    value={ex}
                    onChange={(e) => {
                      const updated = [...form.exampleListings];
                      updated[i] = e.target.value;
                      setForm((f) => ({ ...f, exampleListings: updated }));
                    }}
                  />
                  {form.exampleListings.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          exampleListings: f.exampleListings.filter((_, idx) => idx !== i),
                        }))
                      }
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    exampleListings: [...f.exampleListings, ""],
                  }))
                }
              >
                <Plus className="w-3 h-3" />
                Add Example
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button
              className="gradient-bg border-0"
              onClick={handleCreate}
              disabled={!form.name.trim() || saving}
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Brand Voice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
