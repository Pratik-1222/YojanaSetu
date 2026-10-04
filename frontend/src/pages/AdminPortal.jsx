import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSchemeContext } from "../context/SchemeContext";
import { getSchemes, verifyScheme, createScheme, triggerCrawler } from "../api";
import { PlusCircle, RefreshCw, CheckCircle2, ShieldAlert, XCircle, FileText, ArrowRight, Eye } from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Toast from "../components/ui/Toast";

export default function AdminPortal() {
  const navigate = useNavigate();
  const { user, token } = useSchemeContext();

  const [activeTab, setActiveTab] = useState("pending");
  const [pendingSchemes, setPendingSchemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [crawling, setCrawling] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "info" });

  // Manual Scheme Form State
  const [form, setForm] = useState({
    id: "",
    name: "",
    dept: "",
    category: "education",
    tagline: "",
    benefit: "",
    deadline: "",
    eligibility: "",
    documents: "",
    steps: "",
    state: "Central",
    official_link: "",
    baseMatch: "70"
  });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  // Redirect if not admin
  useEffect(() => {
    if (!user || user.role !== "admin") {
      showToast("Access denied. Admin role required.", "error");
      setTimeout(() => navigate("/"), 2000);
    }
  }, [user, navigate]);

  const loadPending = () => {
    if (!token) return;
    setLoading(true);
    // Fetch all schemes including pending status
    getSchemes("all")
      .then((data) => {
        // Since getSchemes by default returns active, we pass includePending query parameter manually on client fetch
        const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
        fetch(`${API_BASE}/api/schemes?includePending=true`)
          .then((res) => res.json())
          .then((allData) => {
            const filtered = allData.filter((s) => s.status === "pending_verification");
            setPendingSchemes(filtered);
          })
          .catch(() => showToast("Failed to fetch pending list.", "error"));
      })
      .catch(() => showToast("Failed to fetch schemes.", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user?.role === "admin") {
      loadPending();
    }
  }, [user, token]);

  const handleVerify = async (id, status = "active") => {
    if (!token) return;
    try {
      await verifyScheme(token, id, status);
      showToast(`Scheme successfully ${status === "active" ? "approved and published" : "rejected"}.`);
      loadPending();
    } catch (e) {
      showToast(e.message || "Failed to update scheme verification status.", "error");
    }
  };

  const handleCrawlerTrigger = async () => {
    if (!token) return;
    setCrawling(true);
    try {
      const res = await triggerCrawler(token);
      showToast(`Crawler execution complete. Discovered ${res.added.length} new schemes.`);
      loadPending();
    } catch (e) {
      showToast("Crawler failed or no new schemes discovered.", "warning");
    } finally {
      setCrawling(false);
    }
  };

  const handleCreateScheme = async (e) => {
    e.preventDefault();
    if (!token) return;

    // Validate fields
    if (!form.id || !form.name || !form.dept || !form.benefit || !form.deadline) {
      showToast("Please fill all required scheme parameters.", "error");
      return;
    }

    const payload = {
      ...form,
      baseMatch: parseInt(form.baseMatch, 10) || 70,
      eligibility: form.eligibility.split("\n").map(x => x.trim()).filter(Boolean),
      documents: form.documents.split("\n").map(x => x.trim()).filter(Boolean),
      steps: form.steps.split("\n").map(x => x.trim()).filter(Boolean),
      status: "active" // directly active when manually published by admin
    };

    try {
      await createScheme(token, payload);
      showToast("Manual scheme published successfully!");
      // Reset form
      setForm({
        id: "",
        name: "",
        dept: "",
        category: "education",
        tagline: "",
        benefit: "",
        deadline: "",
        eligibility: "",
        documents: "",
        steps: "",
        state: "Central",
        official_link: "",
        baseMatch: "70"
      });
      setActiveTab("pending");
      loadPending();
    } catch (e) {
      showToast(e.message || "Failed to create scheme.", "error");
    }
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <ShieldAlert size={40} className="text-danger animate-pulse mb-3" />
        <h2 className="text-lg font-black text-ink">Verifying Administrative Credentials...</h2>
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "info" })} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-8 select-none">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "info" })} />
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-line/60 pb-6 mb-8">
        <div>
          <h2 className="text-2xl font-black text-ink">Administrative CMS Portal</h2>
          <p className="mt-1.5 text-xs sm:text-sm font-semibold text-sub">
            Review crawler scans, publish manual programs, and manage trilateral tricolor benefits listings.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleCrawlerTrigger}
            loading={crawling}
            variant="outline"
            tone="primary"
            icon={RefreshCw}
          >
            Trigger Crawler Scrape
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-line pb-4 mb-6">
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-4 py-2 text-xs sm:text-sm font-extrabold rounded-xl transition-all ${
            activeTab === "pending"
              ? "bg-primary text-white"
              : "text-sub hover:bg-slate-100"
          }`}
        >
          Pending Approvals ({pendingSchemes.length})
        </button>
        <button
          onClick={() => setActiveTab("create")}
          className={`px-4 py-2 text-xs sm:text-sm font-extrabold rounded-xl transition-all ${
            activeTab === "create"
              ? "bg-primary text-white"
              : "text-sub hover:bg-slate-100"
          }`}
        >
          Create Manual Scheme
        </button>
      </div>

      {/* Tab contents */}
      {activeTab === "pending" ? (
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12 text-xs font-bold text-slate-400">
              Fetching pending approvals registry...
            </div>
          ) : pendingSchemes.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-line bg-white/60 p-12 text-center shadow-sm">
              <CheckCircle2 size={32} className="text-success mx-auto mb-3" />
              <p className="text-xs sm:text-sm font-semibold text-sub">
                All schemes verified! No pending items in database.
              </p>
            </div>
          ) : (
            <div className="grid gap-5">
              {pendingSchemes.map((s) => (
                <div key={s.id} className="rounded-3xl border border-line bg-white p-6 shadow-sm flex flex-col md:flex-row justify-between gap-6">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black bg-warning/5 border border-warning/15 text-amber-700 px-2 py-0.5 rounded-full uppercase">
                        Pending review
                      </span>
                      <span className="text-xs font-bold text-slate-400">ID: {s.id}</span>
                    </div>
                    <h3 className="text-base font-extrabold text-ink leading-tight">{s.name}</h3>
                    <p className="text-xs font-bold text-slate-400">{s.dept} • {s.state}</p>
                    <p className="text-xs font-semibold text-sub leading-relaxed">{s.tagline}</p>
                    
                    <div className="pt-2 flex flex-wrap gap-2 text-[10px] font-bold text-slate-500">
                      <span className="bg-slate-50 border border-line rounded px-2.5 py-1">Benefit: {s.benefit}</span>
                      <span className="bg-slate-50 border border-line rounded px-2.5 py-1">Deadline: {s.deadline}</span>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col justify-end gap-2 shrink-0 self-center">
                    <Button
                      onClick={() => handleVerify(s.id, "active")}
                      variant="solid"
                      tone="accent"
                      size="sm"
                      icon={CheckCircle2}
                    >
                      Verify & Publish
                    </Button>
                    <Button
                      onClick={() => handleVerify(s.id, "rejected")}
                      variant="outline"
                      tone="danger"
                      size="sm"
                      icon={XCircle}
                    >
                      Reject Scrape
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleCreateScheme} className="bg-white border border-line rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <h3 className="text-lg font-black text-ink flex items-center gap-2">
            <PlusCircle size={18} className="text-primary" /> Publish a Government Welfare Program
          </h3>

          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Unique Scheme ID"
              placeholder="e.g. pm-solar-subsidy (dash separated)"
              required
              value={form.id}
              onChange={(e) => setForm(f => ({ ...f, id: e.target.value }))}
            />
            <Input
              label="Scheme Title"
              placeholder="e.g. PM Solar Pump Subsidy Scheme"
              required
              value={form.name}
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Ministry / Department"
              placeholder="e.g. Ministry of New and Renewable Energy"
              required
              value={form.dept}
              onChange={(e) => setForm(f => ({ ...f, dept: e.target.value }))}
            />
            <div className="flex flex-col">
              <label className="mb-2 text-xs font-extrabold text-ink uppercase tracking-wider">Scheme Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full rounded-2xl border border-line/90 bg-white px-4 py-3.5 text-xs sm:text-sm font-bold text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
              >
                <option value="education">Education</option>
                <option value="agriculture">Agriculture</option>
                <option value="health">Health</option>
                <option value="disability">Disability</option>
                <option value="employment">Employment</option>
                <option value="women">Women & Child</option>
                <option value="business">Business & MSME</option>
                <option value="housing">Housing</option>
              </select>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <Input
              label="State Jurisdiction"
              placeholder="e.g. Central (or Uttar Pradesh, etc.)"
              value={form.state}
              onChange={(e) => setForm(f => ({ ...f, state: e.target.value }))}
            />
            <Input
              label="Official Link URL"
              placeholder="https://example.gov.in"
              value={form.official_link}
              onChange={(e) => setForm(f => ({ ...f, official_link: e.target.value }))}
            />
            <Input
              label="Base Match Eligibility Scorer"
              type="number"
              placeholder="e.g. 70"
              value={form.baseMatch}
              onChange={(e) => setForm(f => ({ ...f, baseMatch: e.target.value }))}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Short Tagline Description"
              placeholder="e.g. Capital grants for installation of rooftop panels"
              value={form.tagline}
              onChange={(e) => setForm(f => ({ ...f, tagline: e.target.value }))}
            />
            <Input
              label="Primary Financial/Support Benefit"
              placeholder="e.g. Cash subsidy up to ₹45,000"
              required
              value={form.benefit}
              onChange={(e) => setForm(f => ({ ...f, benefit: e.target.value }))}
            />
          </div>

          <Input
            label="Application Deadline Text"
            placeholder="e.g. Applications close 15 Dec 2026 (or Rolling basis)"
            required
            value={form.deadline}
            onChange={(e) => setForm(f => ({ ...f, deadline: e.target.value }))}
          />

          <div className="grid gap-5">
            <div className="flex flex-col">
              <label className="mb-2 text-xs font-extrabold text-ink uppercase tracking-wider">Eligibility Criteria Checklist (One item per line)</label>
              <textarea
                placeholder="Indian resident citizen&#10;Minimum age of 18 years on application&#10;Family income must be below 2.5 Lakhs"
                rows={3}
                value={form.eligibility}
                onChange={(e) => setForm(f => ({ ...f, eligibility: e.target.value }))}
                className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-xs sm:text-sm font-bold text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-sm placeholder:text-slate-400"
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-2 text-xs font-extrabold text-ink uppercase tracking-wider">Required Documents checklist (One item per line)</label>
              <textarea
                placeholder="Aadhaar Card&#10;Electricity bill receipts&#10;Income Certificate verification"
                rows={3}
                value={form.documents}
                onChange={(e) => setForm(f => ({ ...f, documents: e.target.value }))}
                className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-xs sm:text-sm font-bold text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-sm placeholder:text-slate-400"
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-2 text-xs font-extrabold text-ink uppercase tracking-wider">Application Steps (One instruction step per line)</label>
              <textarea
                placeholder="Register online on the solar portal link&#10;Fill the consumer ID and upload panel quotes&#10;Submit application to local board surveyor"
                rows={3}
                value={form.steps}
                onChange={(e) => setForm(f => ({ ...f, steps: e.target.value }))}
                className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-xs sm:text-sm font-bold text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-sm placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-5 flex justify-end">
            <Button
              type="submit"
              variant="solid"
              tone="primary"
            >
              Publish Active Scheme
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
