'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from "@/components/ui/avatar"
import { LogOut, CalendarIcon, ChevronUp, ChevronDown } from 'lucide-react'
import { auth } from '@/config/firebaseConfig'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import NewRequestDrawer from '@/components/new-request-dialog'
import { 
  Drawer,
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerTrigger, 
  DrawerFooter 
} from "@/components/ui/drawer"
import { Calendar } from "@/components/ui/calendar"
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { format } from "date-fns"

const travelRequests = [
    {
        id: 1,
        location: "Chennai Airport",
        imageSrc: "/images/airport-icon.png",
        openSlots: 5,
        date: "10th June, 2024",
        time: "10 AM",
        carType: "Sedan",
        bgColor: "bg-[#B3F5FF]"
    },
    {
        id: 2,
        location: "MGR Railway Station",
        imageSrc: "/images/train-icon.png",
        openSlots: 12,
        date: "11th June, 2024",
        time: "2 PM",
        carType: "SUV",
        bgColor: "bg-[#FFE5CC]"
    },
    {
        id: 3,
        location: "Tambaram Station",
        imageSrc: "/images/train-icon-local.png",
        openSlots: 3,
        date: "12th June, 2024",
        time: "5 PM",
        carType: "SUV",
        bgColor: "bg-[#E6FFCC]"
    }
]

const locations = [
    { value: "chennai-airport", label: "Chennai Airport" },
    { value: "mgr-railway-station", label: "MGR Railway Station" },
    { value: "tambaram-station", label: "Tambaram Station" },
]

export default function DashboardPage() {
    const router = useRouter()
    const user = auth.currentUser
    const [date, setDate] = useState()
    const [hours, setHours] = useState(12)
    const [minutes, setMinutes] = useState(0)
    const [period, setPeriod] = useState('PM')
    const [destination, setDestination] = useState('')
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)

    const handleSignOut = async () => {
        try {
            await auth.signOut()
            router.push('/')
        } catch (error) {
            console.error('Error signing out:', error)
        }
    }

    const handleApplyFilters = () => {
        // Implement filter logic here
        console.log('Applying filters:', { destination, date, time: `${hours}:${minutes} ${period}` })
        setIsDrawerOpen(false)
    }

    const handleDeleteRequest = (id) => {
        // Implement delete logic here
        console.log('Deleting request:', id)
    }

    const TravelRequestCard = ({ request }) => (
        <Card className="p-4 sm:p-6 bg-white rounded-xl shadow-sm">
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start">
                    <div className={`w-10 h-10 sm:w-13 sm:h-13 rounded-lg ${request.bgColor} flex items-center justify-center overflow-hidden`}>
                        <Image
                            src={request.imageSrc}
                            alt={request.location}
                            width={75}
                            height={75}
                            className="object-cover w-6 h-6 sm:w-auto sm:h-auto"
                        />
                    </div>
                    <span className="text-red-500 text-base font-[500]">{request.openSlots} open slots</span>
                </div>

                <div>
                    <h3 className="text-lg sm:text-[20px] font-bold mb-2 sm:mb-4">{request.location}</h3>
                    <div className="space-y-1 text-sm sm:text-[15px] text-muted-foreground">
                        <p>Date: {request.date}</p>
                        <p>Time: {request.time}</p>
                        <p>Car Type: {request.carType}</p>
                    </div>
                </div>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="outline"
                            className="w-full mt-2 border-gray-200 hover:bg-red-500 hover:text-white text-[15px] font-[400]"
                        >
                            Delete Request
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your
                                travel request.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteRequest(request.id)}>
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </Card>
    )

    return (
        <div className="min-h-screen bg-white p-4 sm:p-8 max-w-[1200px] mx-auto">
            <header className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-12 gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-black"></div>
                    <h1 className="text-2xl font-bold">Travel Buddy</h1>
                </div>
                <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={user?.photoURL} />
                        <AvatarFallback>
                            {user?.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleSignOut}
                    >
                        <LogOut className="h-5 w-5" />
                    </Button>
                </div>
            </header>

            <section className="mb-12">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-1 h-6 bg-black"></div>
                        <h2 className="text-2xl font-bold">My Requests</h2>
                    </div>
                    <NewRequestDrawer/>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {travelRequests.map((request) => (
                        <TravelRequestCard key={request.id} request={request} />
                    ))}
                </div>
            </section>

            <section>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-1 h-6 bg-black"></div>
                        <h2 className="text-2xl font-bold">All Open Requests</h2>
                    </div>
                    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                        <DrawerTrigger asChild>
                            <Button className="w-full sm:w-auto bg-[#1A0726] hover:bg-[#2A1736] text-white px-6">
                                Apply Filters
                            </Button>
                        </DrawerTrigger>
                        <DrawerContent>
                            <div className="mx-auto w-full max-w-sm">
                                <DrawerHeader>
                                    <DrawerTitle className="text-xl font-bold text-center">Apply Filters</DrawerTitle>
                                </DrawerHeader>
                                <div className="p-4 pb-0">
                                    <div className="grid gap-4">
                                        <Select onValueChange={setDestination} value={destination}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Where to?" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {locations.map((location) => (
                                                    <SelectItem key={location.value} value={location.value}>
                                                        {location.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={`w-full justify-start text-left font-normal ${!date && "text-muted-foreground"}`}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {date ? format(date, "PPP") : "Select date"}
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
                                                    onClick={() => setMinutes(m => m === 59 ? 0 : m + 1)}
                                                >
                                                    <ChevronUp className="h-4 w-4" />
                                                </Button>
                                                <span className="text-2xl font-semibold w-8 text-center">{minutes.toString().padStart(2, '0')}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                    onClick={() => setMinutes(m => m === 0 ? 59 : m - 1)}
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
                                    <Button onClick={handleApplyFilters} className="bg-[#1A0726] hover:bg-[#2A1736] text-white">
                                        Filters
                                    </Button>
                                    <Button variant="outline" onClick={() => setIsDrawerOpen(false)}>
                                        Cancel
                                    </Button>
                                </DrawerFooter>
                            </div>
                        </DrawerContent>
                    </Drawer>
                </div>
            </section>
        </div>
    )
}