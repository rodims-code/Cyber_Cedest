"use client"

import { LoginForm } from "@/components/login-form"
import GhostFibers from "@/components/GhostFibers"
import { GalleryVerticalEndIcon } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="relative isolate grid min-h-svh overflow-hidden bg-background lg:grid-cols-2">
      <div
        className="pointer-events-none absolute inset-0 z-0"
        aria-hidden="true"
      >
        <GhostFibers
          className="h-full w-full"
        />
      </div>
      <div className="relative z-10 flex flex-col gap-4 bg-background/55 p-6 backdrop-blur-[2px] md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium uppercase">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEndIcon className="size-4" />
            </div>
            cedest_lab
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative z-10 m-6 hidden overflow-hidden rounded-lg bg-center md:m-10 lg:block">
        <img
          src="/images/logo.png"
          alt=""
          className="absolute inset-0 h-full w-full rounded-lg object-cover"
        />
      </div>
    </div>
  )
}
