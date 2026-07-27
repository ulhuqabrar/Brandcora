'use client';

import { useState } from 'react';
import {
  User,
  ShieldCheck,
  CreditCard,
  House,
  Users,
  Bell,
  FileText,
  ArrowRight,
  PencilSimple,
  Trash,
  Lock,
} from '@phosphor-icons/react';

export default function SettingsPage() {
  const [name, setName] = useState('Sajibur');
  const [email, setEmail] = useState('sajibur@seocontent.ai');
  const [timezone, setTimezone] = useState('UTC');
  const [language, setLanguage] = useState('en');

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-[20px] font-bold text-[#1A1918] tracking-tight">Settings</h2>
        <p className="text-[13px] text-[#8A8A85] mt-0.5">Manage your account and workspace</p>
      </div>

      {/* Profile Settings */}
      <div className="dash-card">
        <div className="dash-card-title mb-4">Profile</div>
        <div className="space-y-4 max-w-[480px]">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-[#1A1918] text-white flex items-center justify-center text-[18px] font-bold">
              {name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div>
              <button className="btn-secondary text-[12px]">
                <PencilSimple className="h-3.5 w-3.5" weight="bold" /> Change photo
              </button>
              <p className="text-[11px] text-[#8A8A85] mt-1">JPG, PNG or GIF. Max 2MB.</p>
            </div>
          </div>
          <div>
            <label className="text-[12px] font-medium text-[#3D3D3A] mb-1.5 block">Full name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-compact"
            />
          </div>
          <div>
            <label className="text-[12px] font-medium text-[#3D3D3A] mb-1.5 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-compact"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-medium text-[#3D3D3A] mb-1.5 block">Timezone</label>
              <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="input-compact">
                <option>UTC</option>
                <option>EST</option>
                <option>PST</option>
                <option>CET</option>
              </select>
            </div>
            <div>
              <label className="text-[12px] font-medium text-[#3D3D3A] mb-1.5 block">Language</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className="input-compact">
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </div>
          </div>
          <button className="btn-primary">
            Save changes
          </button>
        </div>
      </div>

      {/* Password */}
      <div className="dash-card">
        <div className="dash-card-title mb-4">Security</div>
        <div className="space-y-3 max-w-[480px]">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <Lock className="h-4 w-4 text-[#8A8A85]" weight="bold" />
              <div>
                <div className="text-[13px] font-medium text-[#1A1918]">Password</div>
                <div className="text-[12px] text-[#8A8A85]">Last changed 3 months ago</div>
              </div>
            </div>
            <button className="btn-ghost text-[12px]">
              Change <ArrowRight className="h-3 w-3" weight="bold" />
            </button>
          </div>
        </div>
      </div>

      {/* Subscription */}
      <div className="dash-card">
        <div className="dash-card-title mb-4">Subscription</div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[13px] font-medium text-[#1A1918]">Pro plan — $5/mo</div>
            <div className="text-[12px] text-[#8A8A85]">50 scans · 10 exports · Unlimited brands</div>
          </div>
          <button className="btn-secondary text-[12px]">
            Manage <ArrowRight className="h-3 w-3" weight="bold" />
          </button>
        </div>
      </div>

      {/* Workspace */}
      <div className="dash-card">
        <div className="dash-card-title mb-4">Workspace</div>
        <div className="space-y-3 max-w-[480px]">
          <div>
            <label className="text-[12px] font-medium text-[#3D3D3A] mb-1.5 block">Workspace name</label>
            <input type="text" defaultValue="seocontent.ai" className="input-compact" />
          </div>
          <button className="btn-primary">Save</button>
        </div>
      </div>

      {/* Members */}
      <div className="dash-card">
        <div className="dash-card-title mb-4">Members</div>
        <div className="space-y-2">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#FF5F45] text-white flex items-center justify-center text-[11px] font-bold">SJ</div>
              <div>
                <div className="text-[13px] font-medium text-[#1A1918]">Sajibur</div>
                <div className="text-[12px] text-[#8A8A85]">sajibur@seocontent.ai</div>
              </div>
            </div>
            <span className="text-[11px] font-medium text-[#8A8A85] bg-[#F5F5F3] px-2 py-0.5 rounded">Owner</span>
          </div>
        </div>
        <button className="btn-secondary text-[12px] mt-3">
          <Users className="h-3.5 w-3.5" weight="bold" /> Invite member
        </button>
      </div>

      {/* Notifications */}
      <div className="dash-card">
        <div className="dash-card-title mb-4">Notifications</div>
        <div className="space-y-3">
          {['Email notifications', 'Scan complete', 'Report ready', 'Weekly summary'].map((item) => (
            <div key={item} className="flex items-center justify-between py-1">
              <span className="text-[13px] text-[#3D3D3A]">{item}</span>
              <div className="w-9 h-5 bg-[#16A34A] rounded-full relative cursor-pointer">
                <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Terms & Privacy */}
      <div className="dash-card">
        <div className="dash-card-title mb-4">Terms &amp; Privacy</div>
        <div className="space-y-2">
          <div className="flex items-center justify-between py-2">
            <span className="text-[13px] text-[#3D3D3A]">Terms of Service</span>
            <button className="btn-ghost text-[12px]">View <ArrowRight className="h-3 w-3" weight="bold" /></button>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-[13px] text-[#3D3D3A]">Privacy Policy</span>
            <button className="btn-ghost text-[12px]">View <ArrowRight className="h-3 w-3" weight="bold" /></button>
          </div>
        </div>
      </div>

      {/* Delete Account */}
      <div className="dash-card">
        <div className="dash-card-title mb-4 text-[#DC2626]">Danger zone</div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[13px] font-medium text-[#1A1918]">Delete account</div>
            <div className="text-[12px] text-[#8A8A85]">Permanently delete your account and all data</div>
          </div>
          <button className="btn-ghost text-[12px] text-[#DC2626]">
            <Trash className="h-3.5 w-3.5" weight="bold" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}
