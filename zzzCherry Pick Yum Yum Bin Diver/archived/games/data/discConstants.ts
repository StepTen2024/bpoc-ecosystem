import {
  Home,
  Briefcase,
  Users,
  Car,
  DollarSign,
  Shield,
  Church,
  Heart,
  Brain
} from 'lucide-react';

// Context icons mapping
export const CONTEXT_ICONS = {
  FAMILY: Home,
  WORK: Briefcase,
  SOCIAL: Users,
  TRAFFIC: Car,
  MONEY: DollarSign,
  CRISIS: Shield,
  RELIGION: Church,
  RELATIONSHIPS: Heart,
  PERSONAL: Brain
};

// Animal personality definitions
export const ANIMAL_PERSONALITIES = {
  D: {
    animal: "🦅 EAGLE",
    title: "The Sky Dominator",
    description: "You soar above challenges and lead from the front!",
    traits: ["Natural Leader", "Results-Focused", "Decisive", "Direct"],
    bpoRoles: ["Team Lead", "Operations Manager", "Escalation Specialist", "Performance Coach"],
    color: "from-red-500 to-red-600",
    borderColor: "border-red-500/30"
  },
  I: {
    animal: "🦚 PEACOCK", 
    title: "The Social Star",
    description: "You light up rooms and connect with people effortlessly!",
    traits: ["People-Oriented", "Enthusiastic", "Persuasive", "Optimistic"],
    bpoRoles: ["Customer Service Lead", "Sales Manager", "Training Specialist", "Client Relations"],
    color: "from-yellow-500 to-yellow-600",
    borderColor: "border-yellow-500/30"
  },
  S: {
    animal: "🐢 TURTLE",
    title: "The Steady Guardian", 
    description: "You keep everything running smoothly and provide the foundation teams depend on!",
    traits: ["Reliable", "Patient", "Team-Oriented", "Consistent"],
    bpoRoles: ["Quality Assurance", "Operations Coordinator", "Process Analyst", "Support Specialist"],
    color: "from-green-500 to-green-600",
    borderColor: "border-green-500/30"
  },
  C: {
    animal: "🦉 OWL",
    title: "The Wise Analyst",
    description: "You spot what others miss and ensure everything meets the highest standards!",
    traits: ["Detail-Oriented", "Analytical", "Quality-Focused", "Systematic"],
    bpoRoles: ["Quality Manager", "Data Analyst", "Compliance Specialist", "Documentation Lead"],
    color: "from-blue-500 to-blue-600", 
    borderColor: "border-blue-500/30"
  }
};

// Context color themes
export const CONTEXT_COLORS = {
  FAMILY: {
    primary: 'purple',
    border: 'border-purple-500/30',
    bg: 'bg-purple-900/30',
    containerBg: 'bg-purple-900/20',
    text: 'text-purple-300',
    accent: 'text-purple-400'
  },
  WORK: {
    primary: 'blue',
    border: 'border-blue-500/30',
    bg: 'bg-blue-900/30',
    containerBg: 'bg-blue-900/20',
    text: 'text-blue-300',
    accent: 'text-blue-400'
  },
  SOCIAL: {
    primary: 'green',
    border: 'border-green-500/30',
    bg: 'bg-green-900/30',
    containerBg: 'bg-green-900/20',
    text: 'text-green-300',
    accent: 'text-green-400'
  },
  TRAFFIC: {
    primary: 'orange',
    border: 'border-orange-500/30',
    bg: 'bg-orange-900/30',
    containerBg: 'bg-orange-900/20',
    text: 'text-orange-300',
    accent: 'text-orange-400'
  },
  MONEY: {
    primary: 'yellow',
    border: 'border-yellow-500/30',
    bg: 'bg-yellow-900/30',
    containerBg: 'bg-yellow-900/20',
    text: 'text-yellow-300',
    accent: 'text-yellow-400'
  },
  CRISIS: {
    primary: 'red',
    border: 'border-red-500/30',
    bg: 'bg-red-900/30',
    containerBg: 'bg-red-900/20',
    text: 'text-red-300',
    accent: 'text-red-400'
  },
  RELIGION: {
    primary: 'indigo',
    border: 'border-indigo-500/30',
    bg: 'bg-indigo-900/30',
    containerBg: 'bg-indigo-900/20',
    text: 'text-indigo-300',
    accent: 'text-indigo-400'
  },
  RELATIONSHIPS: {
    primary: 'pink',
    border: 'border-pink-500/30',
    bg: 'bg-pink-900/30',
    containerBg: 'bg-pink-900/20',
    text: 'text-pink-300',
    accent: 'text-pink-400'
  },
  PERSONAL: {
    primary: 'rose',
    border: 'border-rose-500/30',
    bg: 'bg-rose-900/30',
    containerBg: 'bg-rose-900/20',
    text: 'text-rose-300',
    accent: 'text-rose-400'
  }
};











