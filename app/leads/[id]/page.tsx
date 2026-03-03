"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ProtectedRoute } from "@/lib/auth/protected-route";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  FileText,
  Eye,
  Download,
  ShieldCheck,
  History,
  Users,
  Sparkles,
  Heart,
  Briefcase,
  Church,
  Clock,
  ExternalLink,
  ChevronRight,
  Verified,
  UserPlus,
  Target,
  Search,
  PlusCircle,
  X,
  Check,
  Link2,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogActivitySheetProps {
  leadId: string;
  onCreated: (activity: any) => void;
}

function LogActivitySheet({ leadId, onCreated }: LogActivitySheetProps) {
  const [open, setOpen] = useState(false);
  const [activityType, setActivityType] = useState<string>("note");
  const [summary, setSummary] = useState("");
  const [notes, setNotes] = useState("");
  const [outcome, setOutcome] = useState("");
  const [priority, setPriority] = useState("Normal");
  const [followUpDate, setFollowUpDate] = useState("");
  const [duration, setDuration] = useState("");
  const [attendees, setAttendees] = useState<string[]>([]);
  const [attendeeInput, setAttendeeInput] = useState("");
  const [dealValue, setDealValue] = useState("");
  const [stage, setStage] = useState("");
  const [reminder, setReminder] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const ACTIVITY_TYPES = [
    { value: "note", label: "General Note", color: "#6366f1" },
    { value: "called", label: "Phone Call", color: "#10b981" },
    { value: "emailed", label: "Email", color: "#f59e0b" },
    { value: "meeting", label: "Meeting", color: "#3b82f6" },
    { value: "task", label: "Task / Follow-Up", color: "#ec4899" },
  ];

  const PRIORITIES = ["Low", "Normal", "High", "Urgent"];

  const handleAddAttendee = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && attendeeInput.trim()) {
      e.preventDefault();
      setAttendees([...attendees, attendeeInput.trim()]);
      setAttendeeInput("");
    }
  };

  const handleSubmit = async () => {
    if (!leadId || !activityType || !summary) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          lead_id: leadId,
          activity_type: activityType,
          description: summary,
          notes: notes || null,
          outcome: outcome || null,
          priority: priority,
          follow_up_date: followUpDate || null,
          duration: duration ? parseInt(duration) : null,
          attendees: attendees.length ? attendees : null,
          deal_value: dealValue ? parseFloat(dealValue) : null,
          stage: stage || null,
          reminder: reminder,
        }),
      });
      if (!res.ok) {
        console.error("Failed to create activity");
        return;
      }
      const activity = await res.json();
      onCreated(activity);
      
      // Reset form
      setSummary("");
      setNotes("");
      setActivityType("note");
      setOutcome("");
      setPriority("Normal");
      setFollowUpDate("");
      setDuration("");
      setAttendees([]);
      setDealValue("");
      setStage("");
      setReminder(false);
      setOpen(false);
    } catch (err) {
      console.error("Error creating activity:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Log Activity
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Log Activity</SheetTitle>
          <SheetDescription>
            Capture interactions, notes, and next steps against this lead.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-4">
          {/* Activity Type Selection */}
          <div className="space-y-2">
            <Label>Activity Type</Label>
            <div className="flex flex-wrap gap-2">
              {ACTIVITY_TYPES.map(({ value, label, color }) => (
                <Button
                  key={value}
                  type="button"
                  variant={activityType === value ? "default" : "outline"}
                  className="rounded-full"
                  style={activityType === value ? { backgroundColor: color } : {}}
                  onClick={() => setActivityType(value)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Summary */}
          <div className="space-y-2">
            <Label htmlFor="summary">Short Summary</Label>
            <Textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="e.g. Discussed pricing and timeline — positive response"
              className="min-h-[80px]"
            />
          </div>

          {/* Detailed Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Detailed Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add objections raised, key talking points, action items, or anything to remember..."
              className="min-h-[120px]"
            />
          </div>

          <Separator />

          {/* Outcome and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="outcome">Call Outcome</Label>
              <Select value={outcome} onValueChange={setOutcome}>
                <SelectTrigger id="outcome">
                  <SelectValue placeholder="Select outcome" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="positive">Positive — Moving forward</SelectItem>
                  <SelectItem value="neutral">Neutral — No change</SelectItem>
                  <SelectItem value="negative">Negative — Stalled / lost</SelectItem>
                  <SelectItem value="followup">Needs follow-up</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Duration and Follow-up Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 30"
                min={1}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="followup">Follow-up Date</Label>
              <input
                id="followup"
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          {/* Attendees */}
          <div className="space-y-2">
            <Label>Attendees / Participants</Label>
            <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-background min-h-[42px] items-center">
              {attendees.map((attendee, i) => (
                <Badge key={i} variant="secondary" className="gap-1">
                  {attendee}
                  <button
                    onClick={() => setAttendees(attendees.filter((_, j) => j !== i))}
                    className="hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              <input
                value={attendeeInput}
                onChange={(e) => setAttendeeInput(e.target.value)}
                onKeyDown={handleAddAttendee}
                placeholder={attendees.length ? "" : "Type name and press Enter..."}
                className="flex-1 min-w-[140px] bg-transparent border-none outline-none text-sm"
              />
            </div>
          </div>

          <Separator />

          {/* Deal Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-semibold uppercase text-muted-foreground">
                Deal Snapshot
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dealValue">Deal Value ($)</Label>
                <input
                  id="dealValue"
                  type="number"
                  value={dealValue}
                  onChange={(e) => setDealValue(e.target.value)}
                  placeholder="e.g. 12000"
                  min={0}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stage">Pipeline Stage</Label>
                <Select value={stage} onValueChange={setStage}>
                  <SelectTrigger id="stage">
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prospecting">Prospecting</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="proposal">Proposal Sent</SelectItem>
                    <SelectItem value="negotiation">Negotiation</SelectItem>
                    <SelectItem value="closed_won">Closed Won</SelectItem>
                    <SelectItem value="closed_lost">Closed Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Reminder Toggle */}
          <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-semibold">Set Reminder</p>
                <p className="text-xs text-muted-foreground">
                  Get notified before the follow-up date
                </p>
              </div>
            </div>
            <button
              onClick={() => setReminder(!reminder)}
              className={cn(
                "relative w-11 h-6 rounded-full transition-colors",
                reminder ? "bg-primary" : "bg-muted"
              )}
            >
              <span
                className={cn(
                  "absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform",
                  reminder && "translate-x-5"
                )}
              />
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false);
              // Reset form
              setSummary("");
              setNotes("");
              setActivityType("note");
              setOutcome("");
              setPriority("Normal");
              setFollowUpDate("");
              setDuration("");
              setAttendees([]);
              setDealValue("");
              setStage("");
              setReminder(false);
            }}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !activityType || !summary}
            className="min-w-[100px]"
          >
            {submitting ? "Saving..." : "Save Entry"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [lead, setLead] = useState<any>(null);
  const [detail, setDetail] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLead = async () => {
      try {
        if (!params || !params.id) return;

        const res = await fetch(`/api/leads/${params.id}`, {
          credentials: "include",
        });
        if (!res.ok) {
          setLoading(false);
          return;
        }
        const data = await res.json();
        setLead(data.lead);
        setDetail(data.detail);
        setActivities(data.activities || []);
        setOpportunities(data.opportunities || []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLead();
  }, [params, router]);

  const getStatusConfig = (status: string) => {
    const s = String(status || "initialized").toLowerCase();
    switch (s) {
      case "new":
        return {
          label: "Active Ingress",
          color: "bg-sky-500/10 text-sky-600 border-sky-200",
        };
      case "contacted":
        return {
          label: "Engagement Phase",
          color: "bg-amber-500/10 text-amber-600 border-amber-200",
        };
      case "qualified":
        return {
          label: "Verified Potential",
          color: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
        };
      case "converted":
        return {
          label: "Legacy Established",
          color: "bg-violet-500/10 text-violet-600 border-violet-200",
        };
      case "lost":
        return {
          label: "Terminated",
          color: "bg-rose-500/10 text-rose-600 border-rose-200",
        };
      default:
        return {
          label: "Initialized",
          color: "bg-slate-500/10 text-slate-600 border-slate-200",
        };
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex flex-col justify-center items-center h-[70vh] gap-4">
            <Spinner className="size-16 text-primary" />
            <p className="text-sm font-black uppercase tracking-widest text-primary">
              Decrypting Legacy Record...
            </p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!lead) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex flex-col items-center justify-center h-[60vh] gap-6 text-center">
            <div className="size-20 bg-muted/20 rounded-full flex items-center justify-center border border-dashed border-muted-foreground/30">
              <Search className="size-10 text-muted-foreground/50" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-black tracking-tight">
                Record Not Found
              </h1>
              <p className="text-muted-foreground text-sm font-medium">
                The legacy identifier could not be located in the primary
                database.
              </p>
            </div>
            <Link href="/agent">
              <Button className="rounded-full px-8">Back to Directory</Button>
            </Link>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  const status = getStatusConfig(lead.status);
  const safeId = String(lead.id || "");

  // Mock document data
  const dummyDocs = [
    {
      title: "Identity Documentation",
      type: "Govt. ID",
      date: "2026-02-15",
      thumb:
        "https://images.unsplash.com/photo-1590247813693-5541d1c609ec?auto=format&fit=crop&q=80&w=200",
    },
    {
      title: "Residence Verification",
      type: "Utility Bill",
      date: "2026-02-18",
      thumb:
        "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=200",
    },
    {
      title: "Legacy Draft v1.2",
      type: "Legal PDF",
      date: "2026-03-01",
      thumb:
        "https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&q=80&w=200",
    },
  ];

  return (
    <ProtectedRoute>
      <DashboardLayout>
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/agent">
            <Button
              variant="ghost"
              className="group text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="font-bold uppercase tracking-widest text-[10px]">
                Back to Directory
              </span>
            </Button>
          </Link>
          <Badge
            variant="outline"
            className="px-3 py-1 font-black text-[9px] uppercase tracking-widest"
          >
            Ref ID: {safeId.slice(0, 8).toUpperCase() || "---"}
          </Badge>
        </div>

        {/* Profile Identity Card */}
        <div className="relative mb-12">
          <div className="flex flex-col lg:flex-row items-start lg:items-end gap-8 bg-card border border-border/40 p-8 rounded-3xl shadow-xl">
            <div className="relative flex-shrink-0">
              <Avatar className="size-40 border-4 border-background shadow-2xl">
                <AvatarImage src={`https://i.pravatar.cc/300?u=${safeId}`} />
                <AvatarFallback className="text-4xl font-black">
                  {String(detail?.full_name || "U").charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 size-10 bg-emerald-500 rounded-full border-4 border-background flex items-center justify-center text-white">
                <Verified className="size-5" />
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <h1 className="text-5xl font-black tracking-tighter">
                  {detail?.full_name || lead?.email || "Anonymous Strategist"}
                </h1>
                <Badge
                  className={cn(
                    "px-4 py-1.5 rounded-full uppercase font-black text-[10px] tracking-widest",
                    status.color,
                  )}
                >
                  {status.label}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <Mail className="size-4 text-primary" />
                  <div>
                    <p className="text-[9px] uppercase font-black text-muted-foreground">
                      Correspondence
                    </p>
                    <p className="text-sm font-bold">
                      {detail?.email || lead?.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="size-4 text-primary" />
                  <div>
                    <p className="text-[9px] uppercase font-black text-muted-foreground">
                      Telephony
                    </p>
                    <p className="text-sm font-bold">
                      {detail?.phone || "Not Provided"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="size-4 text-primary" />
                  <div>
                    <p className="text-[9px] uppercase font-black text-muted-foreground">
                      Region
                    </p>
                    <p className="text-sm font-bold">
                      {detail?.city
                        ? `${detail.city}, ${detail.state || ""}`
                        : "Global Origin"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button className="h-14 px-8 font-black uppercase tracking-widest shadow-lg">
                Establish Legacy
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Intelligence */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <h3 className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">
                  Trust Magnitude
                </h3>
              </CardHeader>
              <CardContent className="text-center pb-6">
                <div className="relative size-32 mx-auto mb-2">
                  <svg className="size-32 -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="58"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-muted/10"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="58"
                      stroke="currentColor"
                      strokeWidth="10"
                      fill="transparent"
                      strokeDasharray={364}
                      strokeDashoffset={364 - 364 * 0.85}
                      strokeLinecap="round"
                      className="text-primary"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                    <span className="text-3xl font-black">85%</span>
                  </div>
                </div>
                <p className="text-xs font-medium text-muted-foreground">
                  Grade-A Legacy Compliant
                </p>
              </CardContent>
            </Card>

            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-6">
                <p className="font-black text-xs uppercase tracking-widest mb-4">
                  Action Required
                </p>
                <p className="text-sm opacity-90 mb-6">
                  Finalize Residence Verification to complete profile ingestion.
                </p>
                <Button variant="secondary" className="w-full font-bold">
                  Begin Protocol
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Tabs Area */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="identity">
              <TabsList className="mb-8">
                <TabsTrigger value="identity">Identity</TabsTrigger>
                <TabsTrigger value="vault">Vault</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="estate">Estate</TabsTrigger>
              </TabsList>

              <TabsContent value="identity" className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm uppercase font-black text-muted-foreground">
                        Demographic blueprint
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        { label: "Legal Name", value: detail?.full_name },
                        {
                          label: "DOB",
                          value: detail?.date_of_birth
                            ? new Date(
                                detail.date_of_birth,
                              ).toLocaleDateString()
                            : "N/A",
                        },
                        { label: "Status", value: detail?.marital_status },
                        {
                          label: "Religion",
                          value: detail?.religion || "None",
                        },
                      ].map((item, i) => (
                        <div
                          key={i}
                          className="flex justify-between border-b border-border/40 pb-2"
                        >
                          <span className="text-[11px] font-bold text-muted-foreground uppercase">
                            {item.label}
                          </span>
                          <span className="text-sm font-black">
                            {item.value || "---"}
                          </span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm uppercase font-black text-muted-foreground">
                        Kinship & Lineage
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between border-b border-border/40 pb-2">
                        <span className="text-[11px] font-bold text-muted-foreground uppercase">
                          Next of Kin
                        </span>
                        <span className="text-sm font-black">
                          {detail?.next_of_kin_name || "Required"}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="bg-muted p-4 rounded-xl text-center">
                          <p className="text-[8px] font-black uppercase mb-1">
                            Children
                          </p>
                          <p className="text-xl font-black">
                            {detail?.children_count || 0}
                          </p>
                        </div>
                        <div className="bg-muted p-4 rounded-xl text-center">
                          <p className="text-[8px] font-black uppercase mb-1">
                            Siblings
                          </p>
                          <p className="text-xl font-black">
                            {detail?.siblings_count || 0}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent
                value="vault"
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {dummyDocs.map((doc, i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="h-40 bg-muted relative">
                      <img
                        src={doc.thumb}
                        className="w-full h-full object-cover opacity-50"
                        alt=""
                      />
                      <Badge className="absolute bottom-4 left-4">
                        {doc.type}
                      </Badge>
                    </div>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <h5 className="font-black text-sm">{doc.title}</h5>
                        <p className="text-[10px] text-muted-foreground">
                          {doc.date}
                        </p>
                      </div>
                      <Verified className="size-4 text-emerald-500" />
                    </CardContent>
                  </Card>
                ))}
                <Card className="border-dashed flex flex-col items-center justify-center p-8 gap-2 cursor-pointer border-2">
                  <UserPlus className="size-6 text-muted-foreground" />
                  <span className="font-black text-xs uppercase">
                    Add Document
                  </span>
                </Card>
              </TabsContent>

              <TabsContent value="timeline" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                    Activity Timeline
                  </h3>
                  <LogActivitySheet
                    leadId={safeId}
                    onCreated={(activity) =>
                      setActivities((prev) => [activity, ...prev])
                    }
                  />
                </div>
                {activities.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No activities yet. Use &quot;Log Activity&quot; to add your
                    first follow up, meeting, or note.
                  </p>
                )}
                {activities.map((a, i) => (
                  <div
                    key={a.id || i}
                    className="flex gap-4 border-l-2 border-primary/20 pl-6 pb-6 relative"
                  >
                    <div className="absolute -left-[9px] top-0 size-4 rounded-full bg-primary border-4 border-background" />
                    <div>
                      <p className="text-[10px] font-black text-primary uppercase">
                        {a.activity_type}
                      </p>
                      <p className="text-sm font-bold mb-1">
                        {a.description || a.notes}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(a.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="estate" className="space-y-6">
                <Card className="bg-primary text-primary-foreground p-8">
                  <p className="text-xs uppercase font-black opacity-80">
                    Aggregate Portfolio Value
                  </p>
                  <h4 className="text-6xl font-black tracking-tighter my-2">
                    $1.24M
                  </h4>
                  <Separator className="bg-white/20 my-6" />
                  <div className="flex gap-10">
                    <div>
                      <p className="text-[9px] uppercase font-black opacity-70">
                        Estate Tax Risk
                      </p>
                      <p className="text-lg font-black">Low (4%)</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-black opacity-70">
                        Legacy Liquidity
                      </p>
                      <p className="text-lg font-black">High</p>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}