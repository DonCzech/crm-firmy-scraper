import {
  Rocket,
  Zap,
  Lightbulb,
  Brain,
  Bot,
  Sparkles,
  FlaskConical,
  UserCog,
  Code,
  Briefcase,
  GraduationCap,
  Palette,
  MessageSquare,
} from "lucide-react";
import { StarterModelOption, StarterPersona } from "@/ai/types";

export const CHAT_STARTER_MODEL_OPTIONS: StarterModelOption[] = [
  // --- Claude (Anthropic) ---
  { id: "auto",   name: "Auto",   icon: Rocket,       description: "claude-sonnet-4-6 – vyvážený výkon", group: "Claude" },
  { id: "fast",   name: "Haiku",  icon: Zap,          description: "claude-haiku – rychlé odpovědi",    group: "Claude" },
  { id: "smart",  name: "Sonnet", icon: Lightbulb,    description: "claude-sonnet-4-6 – chytrý asistent", group: "Claude" },
  { id: "expert", name: "Opus",   icon: Brain,        description: "claude-opus-4-6 – nejlepší výsledky", group: "Claude" },
  // --- OpenAI ---
  { id: "gpt-4o",       name: "GPT-4o",      icon: Bot,         description: "OpenAI – flagship multimodál",  group: "ChatGPT" },
  { id: "gpt-4o-mini",  name: "GPT-4o mini", icon: Sparkles,    description: "OpenAI – rychlý a úsporný",    group: "ChatGPT" },
  { id: "o3-mini",      name: "o3-mini",     icon: FlaskConical, description: "OpenAI – reasoning model",      group: "ChatGPT" },
  // --- Nastavení ---
  {
    id: "custom-instructions",
    name: "Custom Instructions",
    icon: UserCog,
    description: "Vlastní systémové instrukce",
    customize: true,
  },
];

export const CHAT_STARTER_PERSONAS: StarterPersona[] = [
  {
    id: "developer",
    name: "Developer",
    icon: Code,
    description: "Code assistance and technical help",
  },
  {
    id: "business",
    name: "Business",
    icon: Briefcase,
    description: "Business strategy and planning",
  },
  {
    id: "educator",
    name: "Educator",
    icon: GraduationCap,
    description: "Teaching and learning support",
  },
  {
    id: "creative",
    name: "Creative",
    icon: Palette,
    description: "Creative writing and ideas",
  },
  {
    id: "support",
    name: "Support",
    icon: MessageSquare,
    description: "Customer support assistance",
  }
];
