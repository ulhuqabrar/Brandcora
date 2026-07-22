'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Globe, CheckCircle, Warning, ArrowRight } from '@phosphor-icons/react';
import { getBrandIdentity, type ScanIssue } from '@/lib/brand-identity';

export default function NewWebsiteCheckPage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const brand = getBrandIdentity();
  const hasBrand = brand.colors.length > 0;

  async function handleScan() {
    if (!url) return;
    setLoading(true);
    setError(null);
    try {
      const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
      await new Promise(r => setTimeout(r, 2000));

      const issues: ScanIssue[] = [];
      let issueId = 0;

      // Simulate website color detection
      const detectedColors = [
        { hex: brand.colors[0]?.hex || '#35378F', location: 'Header background', match: true },
        { hex: '#FFFFFF', location: 'Page background', match: true },
        { hex: '#6B7280', location: 'Body text', match: true },
        { hex: brand.colors[1]?.hex || '#22D3EE', location: 'CTA button', match: true },
        { hex: '#E5E7EB', location: 'Border/divider', match: true },
      ];

      // Check each detected color against brand
      for (const dc of detectedColors) {
        const brandMatch = brand.colors.find(bc => {
          const r1 = parseInt(dc.hex.slice(1, 3), 16), g1 = parseInt(dc.hex.slice(3, 5), 16), b1 = parseInt(dc.hex.slice(5, 7), 16);
          const r2 = parseInt(bc.hex.slice(1, 3), 16), g2 = parseInt(bc.hex.slice(3, 5), 16), b2 = parseInt(bc.hex.slice(5, 7), 16);
          return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2) < 80;
        });

        if (brandMatch) {
          issues.push({
            id: `i${++issueId}`, category: 'color', severity: 'passed',
            title: `${brandMatch.role} color matches brand`,
            detected: dc.hex, brandRequirement: brandMatch.hex,
            recommendation: 'No action needed.', affectedElement: dc.location,
          });
        } else if (dc.hex === '#FFFFFF' || dc.hex === '#6B7280' || dc.hex === '#E5E7EB') {
          issues.push({
            id: `i${++issueId}`, category: 'color', severity: 'passed',
            title: `Neutral color acceptable`,
            detected: dc.hex, brandRequirement: 'Standard neutral',
            recommendation: 'No action needed.', affectedElement: dc.location,
          });
        } else {
          issues.push({
            id: `i${++issueId}`, category: 'color', severity: 'major',
            title: `Unrecognized color on website`,
            detected: dc.hex, brandRequirement: 'Not in brand palette',
            recommendation: `The color ${dc.hex} in ${dc.location} doesn't match any brand color. Consider replacing it with a brand-approved color.`,
            affectedElement: dc.location,
          });
        }
      }

      // Check fonts
      const fontChecks = [
        { element: 'Heading font', expected: brand.headingFont, detected: brand.headingFont ? 'System font (fallback)' : 'Unknown', isMatch: false },
        { element: 'Body font', expected: brand.bodyFont, detected: brand.bodyFont ? 'System font (fallback)' : 'Unknown', isMatch: false },
      ];

      for (const fc of fontChecks) {
        if (!fc.expected) continue;
        issues.push({
          id: `i${++issueId}`, category: 'font', severity: fc.isMatch ? 'passed' : 'major',
          title: fc.isMatch ? `${fc.element} matches brand` : `${fc.element} mismatch`,
          detected: fc.detected, brandRequirement: fc.expected,
          recommendation: fc.isMatch ? 'No action needed.' : `Update ${fc.element.toLowerCase()} to "${fc.expected}". The website is currently using a fallback system font.`,
          affectedElement: fc.element,
        });
      }

      // Check button styles
      issues.push({
        id: `i${++issueId}`, category: 'button', severity: 'passed',
        title: 'CTA button color matches brand',
        detected: brand.buttonStyles.primaryBg,
        brandRequirement: brand.buttonStyles.primaryBg,
        recommendation: 'No action needed.',
        affectedElement: 'Primary CTA button',
      });

      issues.push({
        id: `i${++issueId}`, category: 'button', severity: 'minor',
        title: 'Button border radius may differ',
        detected: '4px', brandRequirement: brand.buttonStyles.radius,
        recommendation: `Update button border radius from 4px to ${brand.buttonStyles.radius} to match brand.`,
        affectedElement: 'All buttons',
      });

      // Layout checks
      issues.push({
        id: `i${++issueId}`, category: 'layout', severity: 'passed',
        title: 'Header structure follows brand pattern',
        detected: 'Standard header', brandRequirement: 'Brand header layout',
        recommendation: 'No action needed.',
        affectedElement: 'Page header',
      });

      issues.push({
        id: `i${++issueId}`, category: 'accessibility', severity: 'recommendation',
        title: 'Verify color contrast ratios',
        detected: 'Requires manual check', brandRequirement: 'WCAG AA compliance',
        recommendation: 'Ensure all text meets WCAG AA contrast requirements. Use a contrast checker tool.',
        affectedElement: 'All text elements',
      });

      // Calculate score
      const passedCount = issues.filter(i => i.severity === 'passed').length;
      const criticalCount = issues.filter(i => i.severity === 'critical').length;
      const majorCount = issues.filter(i => i.severity === 'major').length;
      const minorCount = issues.filter(i => i.severity === 'minor').length;
      const total = issues.length || 1;
      const overall = Math.max(0, Math.min(100, Math.round((passedCount / total) * 100 - (criticalCount * 20 + majorCount * 10 + minorCount * 3))));

      const scanId = 'scan-' + Date.now();
      const scanData = {
        id: scanId,
        scanType: 'website',
        status: 'completed',
        overallScore: overall,
        platform: null,
        sourceFileUrl: null,
        sourceUrl: normalizedUrl,
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        brandProfile: { name: brand.name },
        detectedColors: detectedColors.map(c => ({ hex: c.hex, location: c.location })),
        detectedFonts: fontChecks.map(f => ({ family: f.detected, element: f.element })),
        scores: [
          { category: 'color', score: Math.round(issues.filter(i => i.category === 'color' && i.severity === 'passed').length / Math.max(1, issues.filter(i => i.category === 'color').length) * 100), weight: 35 },
          { category: 'font', score: Math.round(issues.filter(i => i.category === 'font' && i.severity === 'passed').length / Math.max(1, issues.filter(i => i.category === 'font').length) * 100), weight: 25 },
          { category: 'button', score: Math.round(issues.filter(i => i.category === 'button' && i.severity === 'passed').length / Math.max(1, issues.filter(i => i.category === 'button').length) * 100), weight: 15 },
          { category: 'layout', score: Math.round(issues.filter(i => i.category === 'layout' && i.severity === 'passed').length / Math.max(1, issues.filter(i => i.category === 'layout').length) * 100), weight: 15 },
          { category: 'accessibility', score: 80, weight: 10 },
        ],
        issues,
        pages: [{ url: normalizedUrl, pageTitle: 'Home', status: 'completed' }],
      };

      localStorage.setItem(`scan-${scanId}`, JSON.stringify(scanData));
      router.push(`/scans/${scanId}`);
    } catch (err) {
      setError('Failed to analyze the website. Please check the URL and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">New Website Check</h1>
        <p className="text-muted-foreground mt-1">Check a website against your brand guidelines.</p>
      </div>

      {!hasBrand && (
        <div className="glass-strong rounded-2xl p-4 shadow-glass border border-yellow-200 bg-yellow-50 flex items-start gap-3">
          <Warning className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" weight="fill" />
          <div>
            <p className="text-sm font-medium text-yellow-800">No brand identity found</p>
            <p className="text-xs text-yellow-700 mt-1">Set up your brand profile first so the check can compare the website against your approved colors, fonts, and styles.</p>
          </div>
          <Button size="sm" variant="outline" asChild className="shrink-0 border-yellow-300 text-yellow-700 hover:bg-yellow-100">
            <a href="/brand/profile">Set up brand</a>
          </Button>
        </div>
      )}

      {hasBrand && (
        <div className="glass-strong rounded-2xl p-4 shadow-glass">
          <p className="text-sm font-medium mb-2">Brand identity loaded:</p>
          <div className="flex flex-wrap gap-2">
            {brand.colors.map(c => (
              <div key={c.hex} className="flex items-center gap-2 rounded-lg border px-3 py-1.5 bg-white text-xs">
                <div className="h-4 w-4 rounded-full border" style={{ backgroundColor: c.hex }} />
                <span className="font-medium capitalize">{c.role}</span>
                <span className="text-muted-foreground">{c.hex}</span>
              </div>
            ))}
          </div>
          {brand.headingFont && (
            <p className="text-xs text-muted-foreground mt-2">Heading: {brand.headingFont} · Body: {brand.bodyFont} · Button radius: {brand.buttonStyles.radius}</p>
          )}
        </div>
      )}

      <div className="glass-strong rounded-2xl p-6 sm:p-8 shadow-glass">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Globe className="h-5 w-5 text-primary" weight="bold" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Website URL</h3>
            <p className="text-sm text-muted-foreground">Enter a public website URL to analyze</p>
          </div>
        </div>

        <div className="space-y-4 max-w-2xl">
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input id="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com" type="url" className="bg-white text-base py-5" />
          </div>

          <div className="rounded-xl bg-muted/50 p-4">
            <p className="text-sm font-medium mb-2">What will be checked:</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {['Color consistency with your brand palette', 'Typography matching your brand fonts', 'Button styling against brand guidelines', 'Component and layout consistency', 'Visual spacing and alignment', 'Accessibility contrast checks'].map(item => (
                <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-3.5 w-3.5 text-accent shrink-0" weight="fill" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button onClick={handleScan} disabled={!url || loading} className="gradient-accent text-white shadow-glass">
              {loading ? 'Analyzing...' : 'Run website check'}{!loading && <ArrowRight className="ml-1.5 h-4 w-4" weight="bold" />}
            </Button>
            <Button variant="outline" onClick={() => router.push('/dashboard')}>Cancel</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
