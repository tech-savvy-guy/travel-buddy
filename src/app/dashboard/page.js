'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
    Avatar,
    AvatarFallback,
    AvatarImage
} from "@/components/ui/avatar"
import { LogOut, CalendarIcon, ChevronUp, ChevronDown } from 'lucide-react'
import Image from 'next/image'
import NewRequestDrawer from '@/components/new-request-dialog'
import LoadingScreen from '@/components/loading-screen'
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc, getDoc, setDoc } from "firebase/firestore"
import { db } from '@/config/firebaseConfig'

const locations = [
    { value: "chennai-airport", label: "Chennai Airport", icon: "/images/airport-icon.png" },
    { value: "mgr-railway-station", label: "MGR Railway Station", icon: "/images/train-icon.png" },
    { value: "tambaram-station", label: "Tambaram Station", icon: "/images/train-icon-local.png" },
]

const locationsDict = locations.reduce((acc, location) => {
    acc[location.value] = [location.label, location.icon]
    return acc
}, {})

export default function Component() {
    const router = useRouter()
    const { user, logout } = useAuth()
    const [isAuthChecking, setIsAuthChecking] = useState(true)
    const [date, setDate] = useState(undefined)
    const [hours, setHours] = useState(12)
    const [minutes, setMinutes] = useState(0)
    const [period, setPeriod] = useState('PM')
    const [destination, setDestination] = useState('')
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [myRequests, setMyRequests] = useState([])
    const [allRequests, setAllRequests] = useState([])
    const [filteredRequests, setFilteredRequests] = useState([])
    const [isProfileComplete, setIsProfileComplete] = useState(false)
    const [isOtpDrawerOpen, setIsOtpDrawerOpen] = useState(false)
    const [currentRequestId, setCurrentRequestId] = useState(null)
    const [otp, setOtp] = useState(['', '', '', ''])
    const [userInfo, setUserInfo] = useState(null)
    const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)

    useEffect(() => {
        const checkAuthentication = async () => {
            await new Promise((resolve) => setTimeout(resolve, 100))
            setIsAuthChecking(false)
        }
        checkAuthentication()
    }, [])

    useEffect(() => {
        if (!user && !isAuthChecking) {
            router.replace('/')
        } else if (user) {
            fetchUserInfo()
            fetchRequests()
        }
    }, [user, isAuthChecking, router])

    const fetchUserInfo = async () => {
        if (!user) return

        try {
            const userDocRef = doc(db, "users", user.uid)
            const userDocSnap = await getDoc(userDocRef)
            if (userDocSnap.exists()) {
                const userData = userDocSnap.data()
                setUserInfo(userData)
                setIsProfileComplete(!!userData.displayName && !!userData.phone && !!userData.gender)
            } else {
                console.log("No such user!")
                setIsProfileComplete(false)
            }
        } catch (error) {
            console.error("Error fetching user info:", error)
        }
    }

    const fetchRequests = async () => {
        if (!user) return

        const requestsRef = collection(db, "requests")
        const myRequestsQuery = query(requestsRef, where("userId", "==", user.uid))
        const allRequestsQuery = query(requestsRef, where("userId", "!=", user.uid), where("openSlots", ">", 0))

        const [myRequestsSnapshot, allRequestsSnapshot] = await Promise.all([
            getDocs(myRequestsQuery),
            getDocs(allRequestsQuery)
        ])

        const allRequestsData = await Promise.all(allRequestsSnapshot.docs.map(async (docSnapshot) => {
            const requestData = docSnapshot.data()
            const userDocRef = doc(db, "users", requestData.userId)
            const userDocSnap = await getDoc(userDocRef)
            const userData = userDocSnap.data()
            return {
                id: docSnapshot.id,
                ...requestData,
                userPhone: userData?.phone
            }
        }))

        setMyRequests(myRequestsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
        setAllRequests(allRequestsData)
        setFilteredRequests(allRequestsData)
    }

    const handleSignOut = async () => {
        try {
            await logout()
            router.replace('/')
        } catch (error) {
            console.error('Error signing out:', error)
        }
    }

    const handleApplyFilters = () => {
        const filtered = allRequests.filter(request => {
            const requestDate = request.date.toDate()
            return (
                (!destination || request.location === destination) &&
                (!date || format(requestDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd"))
            )
        })

        const sortedFiltered = filtered.sort((a, b) => {
            const aDate = a.date.toDate()
            const bDate = b.date.toDate()
            const selectedTime = new Date(date || new Date())
            selectedTime.setHours(hours + (period === 'PM' && hours !== 12 ? 12 : 0), minutes, 0, 0)

            const aDiff = Math.abs(aDate - selectedTime)
            const bDiff = Math.abs(bDate - selectedTime)

            return aDiff - bDiff
        })

        setFilteredRequests(sortedFiltered)
        setIsDrawerOpen(false)
    }

    const handleResetFilters = () => {
        setDestination('')
        setDate(undefined)
        setHours(12)
        setMinutes(0)
        setPeriod('PM')
        setFilteredRequests(allRequests)
    }

    const handleDeleteRequest = async (id) => {
        try {
            await deleteDoc(doc(db, "requests", id))
            setMyRequests(myRequests.filter(request => request.id !== id))
        } catch (error) {
            console.error('Error deleting request:', error)
        }
    }

    const handleContact = (userPhone) => {
        window.open(`tel:${userPhone}`, '_blank')
    }

    const handleJoin = (requestId) => {
        if (!isProfileComplete) {
            setIsProfileDialogOpen(true)
            return
        }
        setCurrentRequestId(requestId)
        setIsOtpDrawerOpen(true)
    }

    const handleOtpChange = (index, value) => {
        const newOtp = [...otp]
        newOtp[index] = value
        setOtp(newOtp)

        // Move to next input
        if (value !== '' && index < 3) {
            document.getElementById(`otp-${index + 1}`).focus()
        }
    }

    const handleOtpSubmit = async () => {
        const enteredOtp = otp.join('')
        const request = allRequests.find(r => r.id === currentRequestId)

        if (request && request.pin === parseInt(enteredOtp, 10)) {
            try {
                await updateDoc(doc(db, "requests", currentRequestId), {
                    openSlots: request.openSlots - 1
                })
                setIsOtpDrawerOpen(false)
                setOtp(['', '', '', ''])
                fetchRequests() // Refresh the requests
            } catch (error) {
                console.error('Error updating request:', error)
            }
        } else {
            alert('Invalid OTP')
        }
    }

    const handleProfileUpdate = async (event) => {
        event.preventDefault()
        const formData = new FormData(event.target)
        const updatedUserInfo = {
            displayName: formData.get('displayName'),
            phoneNumber: formData.get('phoneNumber'),
            gender: formData.get('gender'),
        }

        try {
            await setDoc(doc(db, "users", user.uid), updatedUserInfo, { merge: true })
            setUserInfo({ ...userInfo, ...updatedUserInfo })
            setIsProfileComplete(true)
            setIsProfileDialogOpen(false)
            fetchUserInfo() // Refresh user info
        } catch (error) {
            console.error("Error updating profile:", error)
        }
    }

    const TravelRequestCard = ({ request, isUserRequest }) => (
        <Card className="p-6 bg-white rounded-xl shadow-sm">
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start">
                    <div className={`w-13 h-13 rounded-lg bg-[#B3F5FF] flex items-center justify-center overflow-hidden`}>
                        <Image
                            src={locationsDict[request.location][1]}
                            alt={request.location}
                            width={75}
                            height={75}
                            className="object-cover"
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-500 text-base font-[500]">{request.openSlots} open slots</span>
                        {isUserRequest && (
                            <span className="text-slate-500 text-base font-[500]">PIN: {request.pin}</span>
                        )}
                    </div>
                </div>

                <div>
                    <h3 className="text-[20px] font-bold mb-4">{locationsDict[request.location][0]}</h3>
                    <div className="space-y-1 text-[15px] text-muted-foreground">
                        <p>Date: {format(request.date.toDate(), "PPP")}</p>
                        <p>Time: {format(request.date.toDate(), "h:mm a")}</p>
                        <p>Car Type: {request.carType}</p>
                    </div>
                </div>

                {isUserRequest ? (
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
                ) : (
                    <div className="flex gap-2 mt-2">
                        <Button variant='outline' onClick={() => handleContact(request.userPhone)} className="flex-1">
                            Contact
                        </Button>
                        <Button onClick={() => handleJoin(request.id)} className="flex-1">
                            Join
                        </Button>
                    </div>
                )}
            </div>
        </Card>
    )

    if (isAuthChecking || !user) {
        return <LoadingScreen />
    }

    return (
        <div className="min-h-screen bg-white p-4 sm:p-8 max-w-[1200px] mx-auto">
            <header className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-black"></div>
                    <h1 className="text-2xl font-bold">Travel Buddy</h1>
                </div>
                <div className="flex items-center gap-4">
                    <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
                        <DialogTrigger asChild>
                            <Avatar className="h-10 w-10 cursor-pointer">
                                <AvatarImage src={userInfo?.photoURL} />
                                <AvatarFallback>
                                    {userInfo?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{isProfileComplete ? "Edit Profile" : "Complete Profile"}</DialogTitle>
                                <DialogDescription>
                                    {isProfileComplete ? "Update your profile information here." : "Please complete your profile to continue."}
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleProfileUpdate}>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="displayName" className="text-right">
                                            Name
                                        </Label>
                                        <Input
                                            id="displayName"
                                            name="displayName"
                                            defaultValue={userInfo?.displayName}
                                            className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="phoneNumber" className="text-right">
                                            Phone
                                        </Label>
                                        <Input
                                            id="phoneNumber"
                                            name="phoneNumber"
                                            defaultValue={userInfo?.phoneNumber}
                                            className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="email" className="text-right">
                                            Email
                                        </Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            defaultValue={user?.email}
                                            className="col-span-3"
                                            disabled
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="gender" className="text-right">
                                            Gender
                                        </Label>
                                        <Select name="gender" defaultValue={userInfo?.gender}>
                                            <SelectTrigger className="col-span-3">
                                                <SelectValue placeholder="Select gender" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="male">Male</SelectItem>
                                                <SelectItem value="female">Female</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit">Save changes</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
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
                <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-6 bg-black"></div>
                        <h2 className="text-2xl font-bold">My Requests</h2>
                    </div>
                    {isProfileComplete ? (
                        <NewRequestDrawer onRequestAdded={fetchRequests} />
                    ) : (
                        <Button onClick={() => setIsProfileDialogOpen(true)}>New Request</Button>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {myRequests.map((request) => (
                        <TravelRequestCard key={request.id} request={request} isUserRequest={true} />
                    ))}
                </div>
            </section>

            <section>
                <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-6 bg-black"></div>
                        <h2 className="text-2xl font-bold">All Requests</h2>
                    </div>
                    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                        <DrawerTrigger asChild>
                            <Button className="bg-[#1A0726] hover:bg-[#2A1736] text-white px-6 font-[400]">
                                Filters
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
                                        Apply
                                    </Button>
                                    <Button variant="outline" onClick={handleResetFilters}>
                                        Reset
                                    </Button>
                                </DrawerFooter>
                            </div>
                        </DrawerContent>
                    </Drawer>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {filteredRequests.map((request) => (
                        <TravelRequestCard key={request.id} request={request} isUserRequest={false} />
                    ))}
                </div>
            </section>

            <Drawer open={isOtpDrawerOpen} onOpenChange={setIsOtpDrawerOpen}>
                <DrawerContent>
                    <div className="mx-auto w-full max-w-sm">
                        <DrawerHeader>
                            <DrawerTitle className="text-xl font-bold text-center">Enter OTP</DrawerTitle>
                        </DrawerHeader>
                        <div className="p-4 pb-0">
                            <div className="flex justify-center space-x-2">
                                {[0, 1, 2, 3].map((index) => (
                                    <Input
                                        key={index}
                                        id={`otp-${index}`}
                                        type="text"
                                        maxLength={1}
                                        className="w-12 h-12 text-center text-2xl"
                                        value={otp[index]}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                    />
                                ))}
                            </div>
                        </div>
                        <DrawerFooter>
                            <Button onClick={handleOtpSubmit} className="bg-[#1A0726] hover:bg-[#2A1736] text-white">
                                Submit
                            </Button>
                            <Button variant="outline" onClick={() => setIsOtpDrawerOpen(false)}>
                                Cancel
                            </Button>
                        </DrawerFooter>
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
    )
}