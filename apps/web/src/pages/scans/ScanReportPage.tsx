import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, ListChecks, CheckCircle, ArrowRight, Palette, TextAa, Cube, Layout, Shield } from '@phosphor-icons/react';
import { getBrandIdentity } from '@/lib/brand-identity';

interface ScanData {
  id: string;
  scanType: string;
  status: string;
  overallScore: number | null;
  sourceUrl: string | null;
  sourceFileUrl: string | null;
  platform: string | null;
  createdAt: string;
  completedAt: string | null;
  brandProfile: { name: string };
  detectedColors?: Array<{ hex: string; location: string }>;
  detectedFonts?: Array<{ family: string; element: string }>;
  scores: Array<{ category: string; score: number; weight: number }>;
  issues: Array<{
    id: string;
    category: string;
    severity: string;
    title: string;
    detected: string;
    brandRequirement: string;
    recommendation: string;
    affectedElement: string;
  }>;
  pages: Array<{ url: string; pageTitle: string | null; status: string }>;
}

const CATEGORY_META: Record<string, { icon: any; label: string; color: string }> = {
  color: { icon: Palette, label: 'Colors', color: 'text-purple-600' },
  font: { icon: TextAa, label: 'Typography', color: 'text-blue-600' },
  button: { icon: Cube, label: 'Buttons', color: 'text-orange-600' },
  component: { icon: Cube, label: 'Components', color: 'text-teal-600' },
  layout: { icon: Layout, label: 'Layout', color: 'text-indigo-600' },
  accessibility: { icon: Shield, label: 'Accessibility', color: 'text-pink-600' },
  logo: { icon: CheckCircle, label: 'Logo', color: 'text-green-600' },
  responsive: { icon: Layout, label: 'Responsive', color: 'text-cyan-600' },
};

const SEVERITY_CONFIG: Record<string, { label: string; bg: string; text: string; border: string; priority: number }> = {
  critical: { label: 'Critical', bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200', priority: 0 },
  major: { label: 'Major', bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200', priority: 1 },
  minor: { label: 'Minor', bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-200', priority: 2 },
  recommendation: { label: 'Recommendation', bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200', priority: 3 },
  passed: { label: 'Passed', bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-200', priority: 4 },
};

function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent match';
  if (score >= 75) return 'Good match';
  if (score >= 50) return 'Needs improvement';
  return 'Poor match';
}

function getScoreBg(score: number): string {
  if (score >= 80) return 'bg-green-500/10';
  if (score >= 60) return 'bg-yellow-500/10';
  return 'bg-red-500/10';
}

function getScoreText(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
}

export function ScanReportPage() {
  const { scanId } = useParams<{ scanId: string }>();
  const [scan, setScan] = useState<ScanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'action-plan'>('overview');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const brand = getBrandIdentity();

  useEffect(() => {
    if (!scanId) { setLoading(false); return; }
    const stored = localStorage.getItem(`scan-${scanId}`);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setScan(data);
      } catch { /* ignore */ }
    }
    setLoading(false);
  }, [scanId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!scan) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-extrabold">Report not found</h1>
        <p className="text-muted-foreground">This scan report could not be found.</p>
        <Button asChild><Link to="/dashboard">Back to dashboard</Link></Button>
      </div>
    );
  }

  const issues = scan.issues || [];
  const sortedIssues = [...issues].sort((a, b) => {
    const sa = SEVERITY_CONFIG[a.severity]?.priority ?? 5;
    const sb = SEVERITY_CONFIG[b.severity]?.priority ?? 5;
    return sa - sb;
  });

  const filteredIssues = sortedIssues.filter(i => {
    if (filterSeverity !== 'all' && i.severity !== filterSeverity) return false;
    if (filterCategory !== 'all' && i.category !== filterCategory) return false;
    return true;
  });

  const passedCount = issues.filter(i => i.severity === 'passed').length;
  const criticalCount = issues.filter(i => i.severity === 'critical').length;
  const majorCount = issues.filter(i => i.severity === 'major').length;
  const minorCount = issues.filter(i => i.severity === 'minor').length;
  const recommendationCount = issues.filter(i => i.severity === 'recommendation').length;
  const totalIssues = criticalCount + majorCount + minorCount + recommendationCount;

  const categories = [...new Set(issues.map(i => i.category))];
  const actionItems = issues.filter(i => i.severity !== 'passed').sort((a, b) => (SEVERITY_CONFIG[a.severity]?.priority ?? 5) - (SEVERITY_CONFIG[b.severity]?.priority ?? 5));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold">Brand Check Report</h1>
            <Badge variant={scan.scanType === 'social' ? 'default' : 'secondary'}>{scan.scanType}</Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            {scan.sourceUrl || scan.platform} · {new Date(scan.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild className="gradient-accent text-white shadow-glass">
            <Link to="/scans/new-social"><Plus className="mr-1.5 h-4 w-4" weight="bold" />Run another check</Link>
          </Button>
          <Button variant="outline" asChild className="glass">
            <Link to="/dashboard"><ArrowLeft className="mr-1.5 h-4 w-4" weight="bold" />Back</Link>
          </Button>
        </div>
      </div>

      {/* Score hero */}
      <div className="glass-strong rounded-2xl p-8 shadow-glass">
        <div className="flex flex-col items-center">
          <div className={`mb-3 flex h-32 w-32 items-center justify-center rounded-full ${getScoreBg(scan.overallScore || 0)}`}>
            <span className={`text-6xl font-extrabold ${getScoreText(scan.overallScore || 0)}`}>
              {scan.overallScore || 0}
            </span>
          </div>
          <p className="text-xl font-bold text-foreground">Overall Brand Score</p>
          <p className="text-sm text-muted-foreground mt-1">{getScoreLabel(scan.overallScore || 0)}</p>
        </div>
      </div>

      {/* Uploaded design */}
      {scan.sourceFileUrl && (
        <div className="glass-strong rounded-2xl p-6 shadow-glass">
          <h3 className="text-lg font-semibold mb-4">Uploaded Design</h3>
          <img src={scan.sourceFileUrl} alt="Uploaded design" className="max-h-80 mx-auto rounded-xl border shadow-sm" />
        </div>
      )}

      {/* Issue summary */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="glass-strong rounded-2xl p-4 shadow-glass">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10 mb-2">
            <CheckCircle className="h-4 w-4 text-green-600" weight="fill" />
          </div>
          <p className="text-2xl font-extrabold text-green-600">{passedCount}</p>
          <p className="text-xs text-muted-foreground">Passed</p>
        </div>
        <div className="glass-strong rounded-2xl p-4 shadow-glass">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 mb-2">
            <span className="text-sm font-bold text-red-600">!</span>
          </div>
          <p className="text-2xl font-extrabold text-red-600">{criticalCount}</p>
          <p className="text-xs text-muted-foreground">Critical</p>
        </div>
        <div className="glass-strong rounded-2xl p-4 shadow-glass">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 mb-2">
            <span className="text-sm font-bold text-orange-600">!</span>
          </div>
          <p className="text-2xl font-extrabold text-orange-600">{majorCount}</p>
          <p className="text-xs text-muted-foreground">Major</p>
        </div>
        <div className="glass-strong rounded-2xl p-4 shadow-glass">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500/10 mb-2">
            <span className="text-sm font-bold text-yellow-600">!</span>
          </div>
          <p className="text-2xl font-extrabold text-yellow-600">{minorCount}</p>
          <p className="text-xs text-muted-foreground">Minor</p>
        </div>
        <div className="glass-strong rounded-2xl p-4 shadow-glass">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 mb-2">
            <span className="text-sm font-bold text-blue-600">i</span>
          </div>
          <p className="text-2xl font-extrabold text-blue-600">{recommendationCount}</p>
          <p className="text-xs text-muted-foreground">Tips</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-muted/50">
        {(['overview', 'details', 'action-plan'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${activeTab === tab ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            {tab === 'overview' ? 'Category Scores' : tab === 'details' ? 'All Findings' : 'Action Plan'}
          </button>
        ))}
      </div>

      {/* Category scores */}
      {activeTab === 'overview' && scan.scores.length > 0 && (
        <div className="glass-strong rounded-2xl p-6 shadow-glass">
          <h3 className="text-lg font-semibold mb-4">Category Scores</h3>
          <div className="space-y-4">
            {scan.scores.map(score => {
              const meta = CATEGORY_META[score.category];
              const Icon = meta?.icon || CheckCircle;
              return (
                <div key={score.category} className="flex items-center gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50`}>
                    <Icon className={`h-5 w-5 ${meta?.color || 'text-gray-600'}`} weight="bold" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium capitalize">{meta?.label || score.category}</span>
                      <span className={`text-sm font-bold ${getScoreText(score.score)}`}>{score.score}/100</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${score.score >= 80 ? 'bg-green-500' : score.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${score.score}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All findings */}
      {activeTab === 'details' && (
        <div className="glass-strong rounded-2xl p-6 shadow-glass">
          <div className="flex items-center gap-2 mb-4">
            <ListChecks className="h-5 w-5 text-primary" weight="bold" />
            <h3 className="text-lg font-semibold">All Findings</h3>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            <select value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)} className="rounded-lg border px-3 py-1.5 text-sm bg-white">
              <option value="all">All severities</option>
              <option value="critical">Critical</option>
              <option value="major">Major</option>
              <option value="minor">Minor</option>
              <option value="recommendation">Recommendations</option>
              <option value="passed">Passed</option>
            </select>
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="rounded-lg border px-3 py-1.5 text-sm bg-white">
              <option value="all">All categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Issues list */}
          <div className="space-y-3">
            {filteredIssues.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No findings match the current filters.</p>
            ) : (
              filteredIssues.map(issue => {
                const sev = SEVERITY_CONFIG[issue.severity] || SEVERITY_CONFIG.recommendation;
                const meta = CATEGORY_META[issue.category];
                return (
                  <div key={issue.id} className={`rounded-xl border p-4 ${sev.bg} ${sev.border}`}>
                    <div className="flex items-start gap-3">
                      <Badge className={`${sev.bg} ${sev.text} border-0`}>{sev.label}</Badge>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-medium ${meta?.color || 'text-gray-600'}`}>{meta?.label || issue.category}</span>
                          <span className="text-xs text-muted-foreground">·</span>
                          <span className="text-xs text-muted-foreground">{issue.affectedElement}</span>
                        </div>
                        <p className="font-medium text-sm">{issue.title}</p>

                        {/* Detected vs Brand - side by side */}
                        <div className="flex flex-wrap gap-2 mt-2">
                          <div className="rounded-lg bg-white border px-3 py-2 flex-1 min-w-[140px]">
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Detected</p>
                            <div className="flex items-center gap-2 mt-1">
                              {issue.detected.startsWith('#') && issue.detected.length === 7 ? (
                                <div className="h-5 w-5 rounded-full border" style={{ backgroundColor: issue.detected }} />
                              ) : null}
                              <span className="text-sm font-mono font-medium">{issue.detected}</span>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <ArrowRight className="h-4 w-4 text-muted-foreground" weight="bold" />
                          </div>
                          <div className="rounded-lg bg-white border px-3 py-2 flex-1 min-w-[140px]">
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Brand requirement</p>
                            <div className="flex items-center gap-2 mt-1">
                              {issue.brandRequirement.startsWith('#') && issue.brandRequirement.length === 7 ? (
                                <div className="h-5 w-5 rounded-full border" style={{ backgroundColor: issue.brandRequirement }} />
                              ) : null}
                              <span className="text-sm font-mono font-medium">{issue.brandRequirement}</span>
                            </div>
                          </div>
                        </div>

                        {issue.recommendation && (
                          <p className="text-sm mt-2 text-foreground/80">{issue.recommendation}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Action plan */}
      {activeTab === 'action-plan' && (
        <div className="glass-strong rounded-2xl p-6 shadow-glass">
          <h3 className="text-lg font-semibold mb-2">Action Plan</h3>
          <p className="text-sm text-muted-foreground mb-6">Fix these issues in priority order to improve your brand score.</p>

          {actionItems.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" weight="fill" />
              <p className="text-lg font-semibold text-green-700">All checks passed!</p>
              <p className="text-sm text-muted-foreground mt-1">Your design matches the brand identity.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {actionItems.map((issue, index) => {
                const sev = SEVERITY_CONFIG[issue.severity] || SEVERITY_CONFIG.recommendation;
                const meta = CATEGORY_META[issue.category];
                return (
                  <div key={issue.id} className="rounded-xl border p-4 bg-white">
                    <div className="flex items-start gap-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-primary">{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`${sev.bg} ${sev.text} border-0`}>{sev.label}</Badge>
                          <span className={`text-xs font-medium ${meta?.color || 'text-gray-600'}`}>{meta?.label || issue.category}</span>
                        </div>
                        <p className="font-medium text-sm">{issue.title}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2">
                            <p className="text-[10px] font-medium text-red-600 uppercase tracking-wide">Current</p>
                            <div className="flex items-center gap-2 mt-1">
                              {issue.detected.startsWith('#') && issue.detected.length === 7 ? (
                                <div className="h-4 w-4 rounded-full border" style={{ backgroundColor: issue.detected }} />
                              ) : null}
                              <span className="text-sm font-mono">{issue.detected}</span>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <ArrowRight className="h-4 w-4 text-muted-foreground" weight="bold" />
                          </div>
                          <div className="rounded-lg bg-green-50 border border-green-200 px-3 py-2">
                            <p className="text-[10px] font-medium text-green-600 uppercase tracking-wide">Change to</p>
                            <div className="flex items-center gap-2 mt-1">
                              {issue.brandRequirement.startsWith('#') && issue.brandRequirement.length === 7 ? (
                                <div className="h-4 w-4 rounded-full border" style={{ backgroundColor: issue.brandRequirement }} />
                              ) : null}
                              <span className="text-sm font-mono">{issue.brandRequirement}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm mt-2 font-medium text-foreground/80">{issue.recommendation}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Detected values summary */}
      {(scan.detectedColors?.length || scan.detectedFonts?.length) ? (
        <div className="glass-strong rounded-2xl p-6 shadow-glass">
          <h3 className="text-lg font-semibold mb-4">Detected Values</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {scan.detectedColors && scan.detectedColors.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Colors found</p>
                <div className="space-y-2">
                  {scan.detectedColors.map((c, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg border p-2 bg-white">
                      <div className="h-6 w-6 rounded-full border" style={{ backgroundColor: c.hex }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-mono">{c.hex}</p>
                        <p className="text-[10px] text-muted-foreground">{c.location}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {scan.detectedFonts && scan.detectedFonts.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Fonts found</p>
                <div className="space-y-2">
                  {scan.detectedFonts.map((f, i) => (
                    <div key={i} className="rounded-lg border p-2 bg-white">
                      <p className="text-sm font-medium">{f.family}</p>
                      <p className="text-[10px] text-muted-foreground">{f.element}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}

      <div className="flex gap-3">
        <Button asChild className="gradient-accent text-white shadow-glass">
          <Link to="/scans/new-social"><Plus className="mr-1.5 h-4 w-4" weight="bold" />Run another check</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/scans">View all reports</Link>
        </Button>
      </div>
    </div>
  );
}
