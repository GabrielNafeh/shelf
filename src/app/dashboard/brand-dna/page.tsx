"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dna,
  Plus,
  Trash2,
  CheckCircle2,
  Loader2,
  Sparkles,
  BookOpen,
  Globe,
  FileText,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  X,
} from "lucide-react";

interface BrandDNAProfile {
  id: string;
  name: string;
  tone: string;
  vocabulary: string[];
  messaging_themes: string[];
  value_propositions: string[];
  style_guidelines: string;
  voice_profile: Record<string, string>;
  training_status: string;
  is_active: boolean;
  error_message: string | null;
  created_at: string;
}

type SourceType = "catalog" | "url" | "text";

export default function BrandDNAPage() {
  const [profiles, setProfiles] = useState<BrandDNAProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [training, setTraining] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Wizard state
  const [wizardName, setWizardName] = useState("");
  const [wizardSourceType, setWizardSourceType] = useState<SourceType>("text");
  const [wizardContent, setWizardContent] = useState("");

  const fetchProfiles = useCallback(async () => {
    try {
      const res = await fetch("/api/brand-dna/train");
      const data = await res.json();
      setProfiles(data.profiles || []);
    } catch {
      console.error("Failed to fetch Brand DNA profiles");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleTrain = async () => {
    if (!wizardName.trim() || !wizardContent.trim()) return;
    setTraining(true);
    try {
      const res = await fetch("/api/brand-dna/train", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: wizardName,
          sources: [{ type: wizardSourceType, content: wizardContent }],
        }),
      });
      if (res.ok) {
        setShowWizard(false);
        setWizardName("");
        setWizardContent("");
        await fetchProfiles();
      }
    } catch {
      console.error("Failed to train Brand DNA");
    } finally {
      setTraining(false);
    }
  };

  const handleToggleActive = async (profileId: string, currentActive: boolean) => {
    try {
      await fetch(`/api/brand-dna/${profileId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      await fetchProfiles();
    } catch {
      console.error("Failed to toggle profile");
    }
  };

  const handleDelete = async (profileId: string) => {
    try {
      await fetch(`/api/brand-dna/${profileId}`, { method: "DELETE" });
      setProfiles((prev) => prev.filter((p) => p.id !== profileId));
    } catch {
      console.error("Failed to delete profile");
    }
  };

  const sourceTypes: { type: SourceType; label: string; icon: React.ElementType; description: string }[] = [
    { type: "text", label: "Brand Description", icon: FileText, description: "Paste your brand story, guidelines, or style notes" },
    { type: "catalog", label: "Existing Listings", icon: BookOpen, description: "Paste your best product listings to learn from" },
    { type: "url", label: "Website Content", icon: Globe, description: "Paste content from your brand website" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Dna className="w-6 h-6" />
            Brand DNA
          </h1>
          <p className="text-muted-foreground mt-1">
            Train AI to write in your brand&apos;s unique voice and style
          </p>
        </div>
        <Button size="sm" onClick={() => setShowWizard(!showWizard)}>
          {showWizard ? <X className="w-4 h-4 mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
          {showWizard ? "Cancel" : "Train New Profile"}
        </Button>
      </div>

      {/* Training Wizard */}
      {showWizard && (
        <div className="rounded-lg border bg-card p-6 space-y-5">
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Train Brand DNA
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Provide content that represents your brand. The AI will analyze it and extract your unique voice profile.
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">Profile Name</label>
            <Input
              className="mt-1"
              placeholder="e.g., My Brand Voice"
              value={wizardName}
              onChange={(e) => setWizardName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Data Source</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {sourceTypes.map((s) => {
                const Icon = s.icon;
                const isSelected = wizardSourceType === s.type;
                return (
                  <button
                    key={s.type}
                    onClick={() => setWizardSourceType(s.type)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-2 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                    <p className="text-sm font-medium">{s.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">
              {wizardSourceType === "text"
                ? "Brand Description & Guidelines"
                : wizardSourceType === "catalog"
                ? "Paste Your Best Listings"
                : "Website Content"
              }
            </label>
            <Textarea
              className="mt-1 min-h-[150px]"
              placeholder={
                wizardSourceType === "text"
                  ? "Describe your brand's personality, tone, values, and how you want to communicate with customers..."
                  : wizardSourceType === "catalog"
                  ? "Paste 3-5 of your best product titles, descriptions, and bullet points..."
                  : "Paste the About Us, homepage, or product page content from your website..."
              }
              value={wizardContent}
              onChange={(e) => setWizardContent(e.target.value)}
            />
          </div>

          <Button
            onClick={handleTrain}
            disabled={training || !wizardName.trim() || !wizardContent.trim()}
            className="w-full"
          >
            {training ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Training AI on your brand...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Train Brand DNA
              </>
            )}
          </Button>
        </div>
      )}

      {/* Profiles List */}
      {profiles.length === 0 && !showWizard ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <Dna className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg">No Brand DNA profiles yet</h3>
          <p className="text-muted-foreground mt-1">
            Train the AI to understand your brand&apos;s unique voice and style
          </p>
          <Button className="mt-4" onClick={() => setShowWizard(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Create Your First Profile
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {profiles.map((profile) => {
            const isExpanded = expandedId === profile.id;
            const isComplete = profile.training_status === "complete";
            const isError = profile.training_status === "error";
            const isTraining = profile.training_status === "training";

            return (
              <div key={profile.id} className="rounded-lg border bg-card">
                <div className="p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{profile.name}</h3>
                      {profile.is_active && (
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs">
                          Active
                        </Badge>
                      )}
                      {isTraining && (
                        <Badge variant="secondary" className="text-xs">
                          <Loader2 className="w-3 h-3 animate-spin mr-1" />
                          Training
                        </Badge>
                      )}
                      {isError && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Error
                        </Badge>
                      )}
                    </div>
                    {isComplete && profile.tone && (
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Tone: {profile.tone}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isComplete && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(profile.id, profile.is_active)}
                          title={profile.is_active ? "Deactivate" : "Activate"}
                        >
                          {profile.is_active ? (
                            <ToggleRight className="w-5 h-5 text-green-500" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedId(isExpanded ? null : profile.id)}
                        >
                          {isExpanded ? "Collapse" : "View"}
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-red-500"
                      onClick={() => handleDelete(profile.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {isExpanded && isComplete && (
                  <div className="px-4 pb-4 border-t pt-4 space-y-4">
                    {/* Voice Profile */}
                    {profile.voice_profile && Object.keys(profile.voice_profile).length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Voice Profile</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {Object.entries(profile.voice_profile).map(([key, value]) => (
                            <div key={key} className="rounded-md bg-muted/50 p-2">
                              <p className="text-xs text-muted-foreground capitalize">
                                {key.replace(/([A-Z])/g, " $1").trim()}
                              </p>
                              <p className="text-sm font-medium">{value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Vocabulary */}
                    {profile.vocabulary.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Brand Vocabulary</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {profile.vocabulary.map((word, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {word}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Messaging Themes */}
                    {profile.messaging_themes.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Messaging Themes</h4>
                        <ul className="space-y-1">
                          {profile.messaging_themes.map((theme, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                              {theme}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Value Props */}
                    {profile.value_propositions.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Value Propositions</h4>
                        <ul className="space-y-1">
                          {profile.value_propositions.map((vp, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <Sparkles className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                              {vp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Style Guidelines */}
                    {profile.style_guidelines && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Style Guidelines</h4>
                        <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                          {profile.style_guidelines}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
