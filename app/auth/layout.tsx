import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-screen flex items-center justify-center">
      <div className="w-screen">{children}</div>
    </div>
  );
}
