"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HostelInchargeRoot() {
  const router = useRouter();

  useEffect(() => {
    router.push("/hostel-incharge/dashboard");
  }, [router]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Redirecting to dashboard...</p>
    </div>
  );
}