"use client"
import dynamic from "next/dynamic"

const DynamicTerminal = dynamic(() => import("@/lib/terminal"),
  {
    ssr: false
  })

export default function Running() {
  return (
    <DynamicTerminal />
  );
}
