"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/authStore";
import { useLangStore } from "@/stores/langStore";
import { translations } from "@/lib/i18n";
import { 
  User, 
  Shield, 
  Bell, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Phone,
  Mail,
  Lock,
  UserCheck
} from "lucide-react";

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const { lang } = useLangStore();
  const t = translations[lang] || translations.fr;

  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Profile fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [profileMsg, setProfileMsg] = useState("");
  const [profileErr, setProfileErr] = useState("");

  // Notification Preferences
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyTaskAssigned, setNotifyTaskAssigned] = useState(true);
  const [notifyDueSoon, setNotifyDueSoon] = useState(true);
  const [notifyComments, setNotifyComments] = useState(true);
  const [notifyMentions, setNotifyMentions] = useState(true);
  const [prefsMsg, setPrefsMsg] = useState("");

  // Password fields
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordErr, setPasswordErr] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/users/me/profile");
      const data = res.data;
      setFirstName(data.firstName || "");
      setLastName(data.lastName || "");
      setPhone(data.phone || "");
      setBio(data.bio || "");
      setNotifyEmail(data.notifyEmail ?? true);
      setNotifyTaskAssigned(data.notifyTaskAssigned ?? true);
      setNotifyDueSoon(data.notifyDueSoon ?? true);
      setNotifyComments(data.notifyComments ?? true);
      setNotifyMentions(data.notifyMentions ?? true);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg("");
    setProfileErr("");
    setIsSavingProfile(true);

    try {
      await api.patch("/users/me/profile", {
        firstName,
        lastName,
        phone,
        bio,
      });
      if (user) {
        setUser({ ...user, firstName, lastName });
      }
      setProfileMsg(lang === "fr" ? "Vos informations personnelles ont été mises à jour." : "Personal profile updated successfully.");
      setTimeout(() => setProfileMsg(""), 3500);
    } catch (error: any) {
      setProfileErr(error.response?.data?.message || (lang === "fr" ? "Erreur lors de la mise à jour" : "Failed to update profile"));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUpdatePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setPrefsMsg("");
    setIsSavingPrefs(true);

    try {
      await api.patch("/users/me/preferences", {
        notifyEmail,
        notifyTaskAssigned,
        notifyDueSoon,
        notifyComments,
        notifyMentions,
      });
      setPrefsMsg(lang === "fr" ? "Préférences de notification enregistrées." : "Notification preferences saved.");
      setTimeout(() => setPrefsMsg(""), 3500);
    } catch (error) {
      console.error("Failed to update preferences:", error);
    } finally {
      setIsSavingPrefs(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg("");
    setPasswordErr("");

    if (newPassword !== confirmPassword) {
      setPasswordErr(lang === "fr" ? "La confirmation du mot de passe ne correspond pas." : "New password confirmation does not match.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordErr(lang === "fr" ? "Le mot de passe doit comporter au moins 8 caractères." : "Password must be at least 8 characters.");
      return;
    }

    setIsChangingPassword(true);
    try {
      await api.post("/auth/change-password", {
        userId: user?.id,
        oldPassword,
        newPassword,
      });
      setPasswordMsg(lang === "fr" ? "Votre mot de passe a été modifié avec succès." : "Password updated successfully.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordMsg(""), 3500);
    } catch (error: any) {
      setPasswordErr(error.response?.data?.message || (lang === "fr" ? "Erreur lors du changement de mot de passe" : "Failed to change password"));
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
          <User className="w-6 h-6 text-emerald-400" />
          <span>{t.profile_title}</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          {t.profile_subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card Summary */}
        <div className="rounded-2xl border border-[#232f44] bg-[#111827] p-6 flex flex-col items-center text-center h-fit shadow-sm">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border-2 border-emerald-500/40 flex items-center justify-center font-bold text-2xl text-emerald-300 mb-4 shadow-lg shadow-emerald-500/10">
            {firstName?.[0]}{lastName?.[0]}
          </div>

          <h2 className="font-bold text-lg text-slate-100">
            {firstName} {lastName}
          </h2>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5" /> {user?.email}
          </p>

          <div className="mt-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
            {user?.role}
          </div>

          <div className="w-full border-t border-[#1e2a3e] mt-6 pt-4 space-y-2.5 text-xs text-left">
            <div className="flex justify-between text-slate-400">
              <span>{lang === "fr" ? "Statut :" : "Status :"}</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                {lang === "fr" ? "Actif" : "Online"}
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>{lang === "fr" ? "Espace :" : "Workspace :"}</span>
              <span className="text-slate-200 font-semibold">DEDSEC Secure</span>
            </div>
          </div>
        </div>

        {/* Profile Settings Form */}
        <div className="md:col-span-2 space-y-6">
          {/* Identity Form */}
          <div className="rounded-2xl border border-[#232f44] bg-[#111827] p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2 border-b border-[#1e2a3e] pb-3">
              <User className="w-4 h-4 text-emerald-400" />
              <span>{lang === "fr" ? "Informations Personnelles" : "Personal Information"}</span>
            </h3>

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="text-slate-300 font-semibold">{lang === "fr" ? "Prénom" : "First Name"}</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="bg-[#162032] border-[#2b3a55] text-slate-100 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="text-slate-300 font-semibold">{lang === "fr" ? "Nom" : "Last Name"}</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="bg-[#162032] border-[#2b3a55] text-slate-100 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-slate-300 font-semibold">{lang === "fr" ? "Numéro de téléphone" : "Phone Number"}</Label>
                <Input
                  id="phone"
                  placeholder="+33 6 12 34 56 78"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-[#162032] border-[#2b3a55] text-slate-100 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bio" className="text-slate-300 font-semibold">{lang === "fr" ? "Bio & Présentation" : "Biography"}</Label>
                <textarea
                  id="bio"
                  rows={3}
                  placeholder={lang === "fr" ? "Décrivez brièvement votre rôle ou vos spécialités au sein de l'équipe..." : "Describe your role in the team..."}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full rounded-xl border border-[#2b3a55] bg-[#162032] p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {profileMsg && (
                <div className="rounded-xl border border-emerald-500/60 bg-emerald-950/40 p-3 text-emerald-400 flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0" /> {profileMsg}
                </div>
              )}

              {profileErr && (
                <div className="rounded-xl border border-rose-800/60 bg-rose-950/40 p-3 text-rose-400 flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {profileErr}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button type="submit" size="sm" disabled={isSavingProfile} className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold shadow-md shadow-emerald-500/20">
                  {isSavingProfile ? (lang === "fr" ? "Enregistrement..." : "Saving...") : t.save}
                </Button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="rounded-2xl border border-[#232f44] bg-[#111827] p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2 border-b border-[#1e2a3e] pb-3">
              <Key className="w-4 h-4 text-amber-400" />
              <span>{t.cipher_rotation}</span>
            </h3>

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <Label htmlFor="oldPassword" className="text-slate-300 font-semibold">{lang === "fr" ? "Mot de passe actuel" : "Current Password"}</Label>
                <Input
                  id="oldPassword"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  className="bg-[#162032] border-[#2b3a55] text-slate-100 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword" className="text-slate-300 font-semibold">{lang === "fr" ? "Nouveau mot de passe" : "New Password"}</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Min. 8 caractères"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="bg-[#162032] border-[#2b3a55] text-slate-100 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-slate-300 font-semibold">{lang === "fr" ? "Confirmer le mot de passe" : "Confirm Password"}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="bg-[#162032] border-[#2b3a55] text-slate-100 rounded-xl"
                  />
                </div>
              </div>

              {passwordMsg && (
                <div className="rounded-xl border border-emerald-500/60 bg-emerald-950/40 p-3 text-emerald-400 flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0" /> {passwordMsg}
                </div>
              )}

              {passwordErr && (
                <div className="rounded-xl border border-rose-800/60 bg-rose-950/40 p-3 text-rose-400 flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {passwordErr}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button type="submit" size="sm" disabled={isChangingPassword} className="rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/20">
                  {isChangingPassword ? (lang === "fr" ? "Mise à jour..." : "Updating...") : (lang === "fr" ? "Mettre à jour le mot de passe" : "Update Password")}
                </Button>
              </div>
            </form>
          </div>

          {/* Notification Preferences */}
          <div className="rounded-2xl border border-[#232f44] bg-[#111827] p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2 border-b border-[#1e2a3e] pb-3">
              <Bell className="w-4 h-4 text-cyan-400" />
              <span>{t.dispatch_channels}</span>
            </h3>

            <form onSubmit={handleUpdatePreferences} className="space-y-3.5 text-xs">
              <label className="flex items-center justify-between p-3 rounded-xl bg-[#162032] hover:bg-[#1a253a] transition-colors cursor-pointer border border-[#26334a]">
                <span className="text-slate-200 font-medium">{lang === "fr" ? "Recevoir les alertes par email" : "Email notifications"}</span>
                <input
                  type="checkbox"
                  checked={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.checked)}
                  className="h-4 w-4 rounded accent-emerald-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-[#162032] hover:bg-[#1a253a] transition-colors cursor-pointer border border-[#26334a]">
                <span className="text-slate-200 font-medium">{lang === "fr" ? "Notification lors de l'assignation d'une tâche" : "Notify when assigned to a task"}</span>
                <input
                  type="checkbox"
                  checked={notifyTaskAssigned}
                  onChange={(e) => setNotifyTaskAssigned(e.target.checked)}
                  className="h-4 w-4 rounded accent-emerald-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-[#162032] hover:bg-[#1a253a] transition-colors cursor-pointer border border-[#26334a]">
                <span className="text-slate-200 font-medium">{lang === "fr" ? "Rappel d'échéance proche (24h avant)" : "Due date reminder (24h prior)"}</span>
                <input
                  type="checkbox"
                  checked={notifyDueSoon}
                  onChange={(e) => setNotifyDueSoon(e.target.checked)}
                  className="h-4 w-4 rounded accent-emerald-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-[#162032] hover:bg-[#1a253a] transition-colors cursor-pointer border border-[#26334a]">
                <span className="text-slate-200 font-medium">{lang === "fr" ? "Nouveaux commentaires sur mes tâches" : "New comments on my tasks"}</span>
                <input
                  type="checkbox"
                  checked={notifyComments}
                  onChange={(e) => setNotifyComments(e.target.checked)}
                  className="h-4 w-4 rounded accent-emerald-500 cursor-pointer"
                />
              </label>

              {prefsMsg && (
                <div className="rounded-xl border border-emerald-500/60 bg-emerald-950/40 p-3 text-emerald-400 flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0" /> {prefsMsg}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button type="submit" size="sm" disabled={isSavingPrefs} className="rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold shadow-md shadow-cyan-500/20">
                  {isSavingPrefs ? (lang === "fr" ? "Enregistrement..." : "Saving...") : (lang === "fr" ? "Sauvegarder les préférences" : "Save Preferences")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
