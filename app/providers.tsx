'use client';

import { UserProvider } from "@/contexts/UserContext";
import { StyleProvider } from "@/components/StyleProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StyleProvider>
      <UserProvider>
        {children}
      </UserProvider>
    </StyleProvider>
  );
}
