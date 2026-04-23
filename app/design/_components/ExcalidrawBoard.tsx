"use client";
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";

export default function ExcalidrawBoard() {
  return (
    <div className="h-full w-full">
      <Excalidraw />
    </div>
  );
}
