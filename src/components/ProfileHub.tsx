import React, { useState } from "react";
import { User, Phone, Mail, Globe, MapPin, Landmark, Heart, ShieldAlert, Edit, Save } from "lucide-react";
import { PersonalProfile } from "../types";

interface ProfileHubProps {
  profile: PersonalProfile;
  onSaveProfile: (updated: PersonalProfile) => void;
}

export default function ProfileHub({ profile, onSaveProfile }: ProfileHubProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<PersonalProfile>({ ...profile });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("social_")) {
      const socialKey = name.replace("social_", "");
      setForm(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialKey]: value
        }
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(form);
    setIsEditing(false);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl p-6 space-y-6" id="profile-hub-pane">
      <div className="flex items-center justify-between border-b border-neutral-100 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-lg font-bold text-neutral-800 dark:text-neutral-100">Personal Identity & Social Profiles</h1>
          <p className="text-xs text-neutral-400 dark:text-neutral-500">Manage contact information, emergency details, and public accounts from a unified vault.</p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="text-xs font-semibold px-3.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-neutral-700 dark:text-neutral-200 rounded-lg transition-all inline-flex items-center space-x-1"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Modify Profile</span>
          </button>
        ) : (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsEditing(false)}
              className="text-xs font-semibold px-3 py-1.5 border border-neutral-200 dark:border-zinc-800 hover:bg-neutral-50 dark:hover:bg-zinc-800 text-neutral-500 rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="text-xs font-semibold px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all inline-flex items-center space-x-1"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        )}
      </div>

      {!isEditing ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="profile-view-grid">
          {/* Main profile Identity Card */}
          <div className="bg-neutral-50/50 dark:bg-zinc-900/40 border border-neutral-100 dark:border-zinc-850 p-5 rounded-xl space-y-4 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-extrabold shadow-md">
              {profile.fullName.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h2 className="text-md font-bold text-neutral-800 dark:text-neutral-100">{profile.fullName}</h2>
              <p className="text-xs text-neutral-400 dark:text-neutral-500">"{profile.nickname}"</p>
            </div>
            <div className="w-full border-t border-neutral-100 dark:border-zinc-800 pt-3 text-left space-y-2">
              <div className="flex items-center text-xs text-neutral-600 dark:text-neutral-400 space-x-2">
                <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span className="truncate">{profile.email}</span>
              </div>
              <div className="flex items-center text-xs text-neutral-600 dark:text-neutral-400 space-x-2">
                <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span>{profile.phone}</span>
              </div>
              <div className="flex items-center text-xs text-neutral-600 dark:text-neutral-400 space-x-2">
                <Globe className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span className="truncate">{profile.website}</span>
              </div>
              <div className="flex items-center text-xs text-neutral-600 dark:text-neutral-400 space-x-2">
                <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span className="truncate">{profile.address}</span>
              </div>
            </div>
          </div>

          {/* Identity details and Vital metrics */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-neutral-50/40 dark:bg-zinc-900/20 border border-neutral-100 dark:border-zinc-850 rounded-xl space-y-1">
                <p className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase font-semibold">Date of Birth</p>
                <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">{profile.dob || "Not set"}</p>
              </div>

              <div className="p-4 bg-neutral-50/40 dark:bg-zinc-900/20 border border-neutral-100 dark:border-zinc-850 rounded-xl space-y-1">
                <p className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase font-semibold">Nationality</p>
                <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">{profile.nationality || "Not set"}</p>
              </div>

              <div className="p-4 bg-neutral-50/40 dark:bg-zinc-900/20 border border-neutral-100 dark:border-zinc-850 rounded-xl space-y-1">
                <p className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase font-semibold">Gender</p>
                <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">{profile.gender || "Not set"}</p>
              </div>

              <div className="p-4 bg-neutral-50/40 dark:bg-zinc-900/20 border border-neutral-100 dark:border-zinc-850 rounded-xl space-y-1 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase font-semibold">Blood Group</p>
                  <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">{profile.bloodGroup || "Not set"}</p>
                </div>
                <Heart className="w-5 h-5 text-red-500/80 fill-red-500/10 shrink-0" />
              </div>
            </div>

            {/* Social Network accounts */}
            <div className="bg-neutral-50/20 dark:bg-zinc-900/10 border border-neutral-100 dark:border-zinc-850 rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Social Networks</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {profile.socialLinks.linkedin && (
                  <a href={profile.socialLinks.linkedin} target="_blank" rel="noreferrer" className="flex items-center space-x-2.5 p-2.5 bg-white dark:bg-zinc-850 rounded-lg hover:border-indigo-400 border border-neutral-100 dark:border-zinc-800 transition-all text-neutral-600 dark:text-neutral-400 font-medium">
                    <span className="text-sm font-bold text-blue-600">in</span>
                    <span className="truncate">LinkedIn Profile</span>
                  </a>
                )}
                {profile.socialLinks.github && (
                  <a href={profile.socialLinks.github} target="_blank" rel="noreferrer" className="flex items-center space-x-2.5 p-2.5 bg-white dark:bg-zinc-850 rounded-lg hover:border-indigo-400 border border-neutral-100 dark:border-zinc-800 transition-all text-neutral-600 dark:text-neutral-400 font-medium">
                    <span className="text-xs font-bold font-mono">GH</span>
                    <span className="truncate">GitHub Repository</span>
                  </a>
                )}
                {profile.socialLinks.twitter && (
                  <a href={profile.socialLinks.twitter} target="_blank" rel="noreferrer" className="flex items-center space-x-2.5 p-2.5 bg-white dark:bg-zinc-850 rounded-lg hover:border-indigo-400 border border-neutral-100 dark:border-zinc-800 transition-all text-neutral-600 dark:text-neutral-400 font-medium">
                    <span className="text-xs font-bold text-sky-500">𝕏</span>
                    <span className="truncate">Twitter Profile</span>
                  </a>
                )}
                {profile.socialLinks.youtube && (
                  <a href={profile.socialLinks.youtube} target="_blank" rel="noreferrer" className="flex items-center space-x-2.5 p-2.5 bg-white dark:bg-zinc-850 rounded-lg hover:border-indigo-400 border border-neutral-100 dark:border-zinc-800 transition-all text-neutral-600 dark:text-neutral-400 font-medium">
                    <span className="text-xs font-bold text-red-600">YT</span>
                    <span className="truncate">YouTube Channel</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Edit profile input form */
        <form onSubmit={handleSubmit} className="space-y-4 max-w-4xl" id="profile-edit-form">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                required
                className="w-full text-xs p-2 rounded-lg border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-850 text-neutral-800 dark:text-neutral-100 outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Nickname / Alias</label>
              <input
                type="text"
                name="nickname"
                value={form.nickname}
                onChange={handleChange}
                className="w-full text-xs p-2 rounded-lg border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-850 text-neutral-800 dark:text-neutral-100 outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={form.dob}
                onChange={handleChange}
                className="w-full text-xs p-2 rounded-lg border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-850 text-neutral-800 dark:text-neutral-100 outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Gender</label>
              <input
                type="text"
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full text-xs p-2 rounded-lg border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-850 text-neutral-800 dark:text-neutral-100 outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Blood Group</label>
              <select
                name="bloodGroup"
                value={form.bloodGroup}
                onChange={handleChange}
                className="w-full text-xs p-2 rounded-lg border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-850 text-neutral-800 dark:text-neutral-100 outline-none focus:border-indigo-500"
              >
                <option value="">Select blood group</option>
                <option value="A-positive">A-positive (A+)</option>
                <option value="A-negative">A-negative (A-)</option>
                <option value="B-positive">B-positive (B+)</option>
                <option value="B-negative">B-negative (B-)</option>
                <option value="O-positive">O-positive (O+)</option>
                <option value="O-negative">O-negative (O-)</option>
                <option value="AB-positive">AB-positive (AB+)</option>
                <option value="AB-negative">AB-negative (AB-)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Nationality</label>
              <input
                type="text"
                name="nationality"
                value={form.nationality}
                onChange={handleChange}
                className="w-full text-xs p-2 rounded-lg border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-850 text-neutral-800 dark:text-neutral-100 outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full text-xs p-2 rounded-lg border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-850 text-neutral-800 dark:text-neutral-100 outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full text-xs p-2 rounded-lg border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-850 text-neutral-800 dark:text-neutral-100 outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Website URL</label>
              <input
                type="url"
                name="website"
                value={form.website}
                onChange={handleChange}
                className="w-full text-xs p-2 rounded-lg border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-850 text-neutral-800 dark:text-neutral-100 outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Physical Address</label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                className="w-full text-xs p-2 rounded-lg border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-850 text-neutral-800 dark:text-neutral-100 outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Social accounts inputs */}
          <div className="pt-4 border-t border-neutral-100 dark:border-zinc-800 space-y-3">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Social Links Setup</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-500">LinkedIn Link</label>
                <input
                  type="url"
                  name="social_linkedin"
                  value={form.socialLinks.linkedin || ""}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full text-xs p-2 rounded-lg border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-850 text-neutral-800 dark:text-neutral-100 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-500">GitHub Link</label>
                <input
                  type="url"
                  name="social_github"
                  value={form.socialLinks.github || ""}
                  onChange={handleChange}
                  placeholder="https://github.com/username"
                  className="w-full text-xs p-2 rounded-lg border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-850 text-neutral-800 dark:text-neutral-100 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-500">Twitter/X Link</label>
                <input
                  type="url"
                  name="social_twitter"
                  value={form.socialLinks.twitter || ""}
                  onChange={handleChange}
                  placeholder="https://twitter.com/username"
                  className="w-full text-xs p-2 rounded-lg border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-850 text-neutral-800 dark:text-neutral-100 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-500">YouTube Link</label>
                <input
                  type="url"
                  name="social_youtube"
                  value={form.socialLinks.youtube || ""}
                  onChange={handleChange}
                  placeholder="https://youtube.com/c/channelname"
                  className="w-full text-xs p-2 rounded-lg border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-850 text-neutral-800 dark:text-neutral-100 outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
