import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";

import Home from "@/pages/v2/HomeV2";
import Login from "@/pages/Login";
import Landing from "@/pages/Landing";
import { isInstallHost } from "@/lib/brand";
import { captureRefFromUrl } from "@/lib/referral";
import AppSplash from "@/components/AppSplash";
import UserLayout from "@/components/UserLayout";
import { Navigate } from "@/lib/router-compat";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Skypay — Earn Money Online With Easy Tasks" },
      {
        name: "description",
        content:
          "Download Skypay, complete simple tasks, get fast withdrawals and earn referral rebates every day.",
      },
      { property: "og:title", content: "Skypay — Earn Money Online With Easy Tasks" },
      {
        property: "og:description",
        content: "Download Skypay, complete simple tasks and earn referral rebates every day.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://install.skypaytop.cyou/social-preview.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://install.skypaytop.cyou/social-preview.jpg" },
    ],
  }),
  component: RootEntry,
});

function RootEntry() {
  // install.skypaytop.cyou always shows the APK download page.
  if (isInstallHost()) {
    captureRefFromUrl();
    return <Landing />;
  }
  return <AppEntry />;
}

// Splash shows only once per app open; returning to Home never replays it.
let startupSplashDone = false;

function AppEntry() {
  const { currentUser, loading } = useStore();
  const [startupSplash, setStartupSplash] = useState(!startupSplashDone);
  const [timeDone, setTimeDone] = useState(false);

  const finishSplash = useCallback(() => {
    setTimeDone(true);
  }, []);

  useEffect(() => {
    if (startupSplash && timeDone && !loading) {
      startupSplashDone = true;
      setStartupSplash(false);
    }
  }, [startupSplash, timeDone, loading]);

  if (startupSplash) return <AppSplash onFinish={finishSplash} />;

  if (loading && !startupSplashDone) return <AppSplash />;
  if (loading) return null;



  if (!currentUser) {
    const ref =
      typeof window === "undefined"
        ? null
        : new URLSearchParams(window.location.search).get("ref");
    if (ref) return <Navigate to={`/download?ref=${encodeURIComponent(ref)}`} replace />;
    return <Login />;
  }
  if (currentUser.role !== "user") return <Navigate to="/admin" />;

  return (
    <UserLayout>
      <Home />
    </UserLayout>
  );
}
