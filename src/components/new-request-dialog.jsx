'use client'

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
} from "@/components/ui/drawer"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { 
  CalendarIcon, 
  ChevronUp, 
  ChevronDown, 
  Plus, 
  Minus 
} from 'lucide-react'

export default function NewRequestDrawer() {
  const [date, setDate] = React.useState()
  const [hours, setHours] = React.useState(12)
  const [minutes, setMinutes] = React.useState(0)
  const [period, setPeriod] = React.useState('PM')
  const [participants, setParticipants] = React.useState(2)
  const [carType, setCarType] = React.useState("sedan")
  const [open, setOpen] = React.useState(false)

  const handleIncrement = () => {
    if (participants < 6) {
      setParticipants(prev => prev + 1)
    }
  }

  const handleDecrement = () => {
    if (participants > 2) {
      setParticipants(prev => prev - 1)
    }
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button className="bg-[#1A0726] hover:bg-black text-white hover:scale-105 transition-all duration-200 rounded-md px-4 py-2 font-[400]">
          New Request
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle className="text-xl font-bold text-center">New Travel Request</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 pb-0">
            <div className="grid gap-4">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chennai-airport">Chennai Airport</SelectItem>
                  <SelectItem value="mgr-station">MGR Railway Station</SelectItem>
                  <SelectItem value="tambaram">Tambaram Station</SelectItem>
                </SelectContent>
              </Select>

              <div className="space-y-3">
                <label className="text-sm text-muted-foreground">Number of people</label>
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-full border-2"
                    onClick={handleDecrement}
                    disabled={participants <= 2}
                  >
                    <Minus className="h-6 w-6" />
                  </Button>
                  <div className="flex flex-col items-center">
                    <span className="text-4xl font-bold">{participants}</span>
                    <span className="text-xs text-muted-foreground">PARTICIPANTS</span>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-full border-2"
                    onClick={handleIncrement}
                    disabled={participants >= 6}
                  >
                    <Plus className="h-6 w-6" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Car Type</label>
                <Tabs value={carType} onValueChange={setCarType} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="sedan">Sedan</TabsTrigger>
                    <TabsTrigger value="suv">SUV</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Select Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <div className="flex items-center justify-between border rounded-md p-3">
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => setHours(h => h === 12 ? 1 : h + 1)}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <span className="text-2xl font-semibold w-8 text-center">{hours.toString().padStart(2, '0')}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => setHours(h => h === 1 ? 12 : h - 1)}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>

                <span className="text-2xl font-semibold">:</span>

                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => setMinutes(m => m === 55 ? 0 : m + 5)}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <span className="text-2xl font-semibold w-8 text-center">{minutes.toString().padStart(2, '0')}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => setMinutes(m => m === 0 ? 55 : m - 5)}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>

                <Button 
                  variant="ghost" 
                  className="px-2"
                  onClick={() => setPeriod(p => p === 'AM' ? 'PM' : 'AM')}
                >
                  {period}
                </Button>
              </div>
            </div>
          </div>
          <DrawerFooter>
            <Button className="bg-[#1A0726] hover:bg-[#2A1736] text-white">Submit</Button>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}