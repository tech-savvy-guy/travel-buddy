"use client"

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { LogOut } from 'lucide-react'

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-white p-4 sm:p-8">
      <div className="max-w-[1200px] mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-black"></div>
            <h1 className="text-2xl font-bold">Travel Buddy</h1>
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 items-center">
            </Skeleton>
          </div>
        </header>

        <section className="mb-12">
          <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-black"></div>
              <h2 className="text-2xl font-bold">My Requests</h2>
            </div>
            <Skeleton className="h-10 w-32" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3].map((index) => (
              <Card key={index} className="p-6 bg-white rounded-xl shadow-sm">
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <Skeleton className="h-13 w-13 rounded-lg" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <div>
                    <Skeleton className="h-6 w-3/4 mb-4" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-4 w-4/6" />
                    </div>
                  </div>
                  <Skeleton className="h-10 w-full" />
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-black"></div>
              <h2 className="text-2xl font-bold">All Requests</h2>
            </div>
            <Skeleton className="h-10 w-24" />
          </div>
        </section>
      </div>
    </div>
  )
}