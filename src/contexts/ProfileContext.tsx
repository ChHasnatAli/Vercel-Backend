import { createContext, useContext, useEffect, useMemo, useState } from "react";

export interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
  role: string;
}

interface ProfileContextType {
  profile: ProfileData;
  fullName: string;
  initials: string;
  updateProfile: (updates: Partial<ProfileData>) => void;
}

const STORAGE_KEY = "dashboard_profile";

const defaultProfile: ProfileData = {
  firstName: "Humaira",
  lastName: "Ashfaq",
  email: "humaira@dashboard.com",
  bio: "Admin dashboard manager.",
  role: "Admin",
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<ProfileData>;
      setProfile((prev) => ({ ...prev, ...parsed }));
    } catch {
      setProfile(defaultProfile);
    }
  }, []);

  const updateProfile = (updates: Partial<ProfileData>) => {
    setProfile((prev) => {
      const next = { ...prev, ...updates };
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      }
      return next;
    });
  };

  const fullName = useMemo(() => `${profile.firstName} ${profile.lastName}`.trim(), [profile.firstName, profile.lastName]);
  const initials = useMemo(() => {
    const first = profile.firstName?.[0] ?? "";
    const last = profile.lastName?.[0] ?? "";
    return `${first}${last}`.toUpperCase() || "U";
  }, [profile.firstName, profile.lastName]);

  return (
    <ProfileContext.Provider value={{ profile, fullName, initials, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) throw new Error("useProfile must be used within ProfileProvider");
  return context;
}
