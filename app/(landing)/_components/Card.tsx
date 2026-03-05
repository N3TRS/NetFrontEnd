'use client'
import thinking from "@/public/icons/thinking.png"
import lightning from "@/public/icons/lightning.png"
import group from "@/public/icons/group.png"
import Image from "next/image"
import { useEffect, useState } from "react"

interface CardProps {
  title: string,
  text: string,
  icon: string
}


export default function CardLanding({ title, text, icon }: CardProps) {
  const [image, setImage] = useState(group);
  useEffect(() => {
    switch (icon) {
      case "thinking":
        setImage(thinking);
        break;
      case "lightning":
        setImage(lightning);
        break;
      default:
        setImage(group);
        break;
    }
  }, [icon])
  return (
    <div className="h-full min-h-70 relative mx-auto p-8 bg-cards cursor-pointer hover:scale-105 transition-transform rounded-xl flex flex-col">
      <Image src={image} alt="{image} icon" placeholder="blur" width={45} height={45} className="absolute top-0.5 right-70" />
      <h3 className="text-4xl font-bold text-white leading-tight mt-4 py-5">{title}</h3>
      <p className="text-gray-400 text-lg max-w-2xl mx-auto mt-auto">
        {text}
      </p>
    </div>
  );
}
