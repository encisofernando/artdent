import type { PropsWithChildren } from "react"
import Sidebar from "./Sidebar"
import Topbar from "./Topbar"

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1">
          <Topbar />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  )
}
