"use client"

import React, { useState } from "react"
import { ImagePlus, Sparkles, Check, Copy } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface ImagePlaceholderProps {
  id?: string
  title: string
  suggestedPath: string
  dimensions?: string
  description?: string
  aspectRatio?: "video" | "square" | "wide" | "tall"
  className?: string
  imageSrc?: string
}

export function ImagePlaceholder({
  title,
  suggestedPath,
  dimensions = "800 × 500 px",
  description,
  aspectRatio = "video",
  className,
  imageSrc,
}: ImagePlaceholderProps) {
  const [copied, setCopied] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(suggestedPath)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const aspectClasses = {
    video: "aspect-[16/10]",
    wide: "aspect-[16/9]",
    square: "aspect-square",
    tall: "aspect-[4/5]",
  }

  // Si une image valide est fournie et ne génère pas d'erreur, on l'affiche
  const hasValidImage = Boolean(imageSrc && !imageError)

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-xl transition-all duration-300 hover:shadow-md",
        hasValidImage
          ? "border border-border/70 bg-card shadow-xs"
          : "border-2 border-dashed border-primary/30 bg-muted/40 p-4 hover:border-primary/70 hover:bg-muted/70",
        aspectClasses[aspectRatio],
        className
      )}
    >
      {hasValidImage ? (
        <>
          <img
            src={imageSrc}
            alt={title}
            onError={() => setImageError(true)}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Badge discret sur l'image */}
          <div className="absolute bottom-2.5 left-2.5 z-10">
            <span className="rounded-md bg-black/70 backdrop-blur-xs px-2 py-0.5 text-[11px] font-medium text-white shadow-xs">
              {title}
            </span>
          </div>
        </>
      ) : null}

      {/* Overlay indicator quand pas d'image */}
      {!hasValidImage && (
        <div className="relative z-10 flex h-full w-full flex-col justify-between">
        {/* En-tête de l'emplacement */}
        <div className="flex items-center justify-between gap-2">
          <Badge
            variant="outline"
            className="border-primary/40 bg-background/90 text-primary font-medium text-[11px] backdrop-blur-sm shadow-xs"
          >
            <Sparkles className="size-3 text-primary" />
            Emplacement Image
          </Badge>
          <span className="text-[11px] font-mono text-muted-foreground bg-background/80 px-2 py-0.5 rounded border border-border/50">
            {dimensions}
          </span>
        </div>

        {/* Centre : Icône et Titre */}
        <div className="flex flex-col items-center justify-center text-center my-auto py-2">
          <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 group-hover:scale-110 group-hover:bg-primary/20 transition-all">
            <ImagePlus className="size-6 text-primary" />
          </div>
          <h4 className="text-sm font-semibold tracking-tight text-foreground line-clamp-1">
            {title}
          </h4>
          {description && (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2 max-w-[260px]">
              {description}
            </p>
          )}
        </div>

        {/* Pied : Chemin suggéré avec bouton copie rapide */}
        <div className="flex items-center justify-between gap-2 rounded-lg bg-background/80 p-1.5 border border-border/60 backdrop-blur-xs text-[11px]">
          <span className="font-mono text-muted-foreground truncate max-w-[190px] sm:max-w-[230px]" title={suggestedPath}>
            {suggestedPath}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium text-primary hover:bg-primary/10 transition-colors shrink-0"
            title="Copier le chemin du fichier"
          >
            {copied ? (
              <>
                <Check className="size-3 text-green-600" />
                <span className="text-green-600 font-semibold">Copié</span>
              </>
            ) : (
              <>
                <Copy className="size-3" />
                <span>Copier</span>
              </>
            )}
          </button>
        </div>
      </div>
      )}
    </div>
  )
}
