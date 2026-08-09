import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  Wifi, 
  ShieldCheck, 
  Utensils, 
  Zap, 
  Coffee, 
  Bed, 
  Users, 
  Phone, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  PlusCircle,
  ChevronRight,
  Sparkles,
  Info,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { toast } from 'sonner';

interface Hostel {
  id: string;
  name: string;
  category: 'Male' | 'Female' | 'Co-ed';
  distance: string;
  rating: number;
  reviewCount: number;
  pricePerSemester: number;
  availableBeds: number;
  totalBeds: number;
  address: string;
  image: string;
  verified: boolean;
  amenities: string[];
  roomTypes: { type: string; price: number; available: number }[];
  description: string;
  wardenName: string;
  wardenContact: string;
  rules: string[];
}

const INITIAL_HOSTELS: Hostel[] = [
  {
    id: 'h1',
    name: 'Apex Student Residence',
    category: 'Co-ed',
    distance: '200m from Main Gate',
    rating: 4.8,
    reviewCount: 142,
    pricePerSemester: 450,
    availableBeds: 4,
    totalBeds: 80,
    address: '14 University Drive, North Campus',
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=800',
    verified: true,
    amenities: ['High-speed Wi-Fi', '24/7 Power Backup', 'Air Conditioned', 'Mess & Canteen', 'Biometric Security', 'Study Lounge'],
    roomTypes: [
      { type: 'Single Private Room', price: 650, available: 1 },
      { type: '2-Bed Shared Suite', price: 450, available: 3 },
    ],
    description: 'Modern student accommodation equipped with state-of-the-art study rooms, high-speed fiber internet, and round-the-clock security.',
    wardenName: 'Dr. Michael Vance',
    wardenContact: '+1 (555) 019-2834',
    rules: ['Quiet hours from 10 PM - 6 AM', 'Visitors allowed until 8 PM', 'Self-service laundry schedules']
  },
  {
    id: 'h2',
    name: 'Trinity Hall for Women',
    category: 'Female',
    distance: '350m from Library',
    rating: 4.9,
    reviewCount: 98,
    pricePerSemester: 520,
    availableBeds: 2,
    totalBeds: 60,
    address: '8 Academic Way, West Wing',
    image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&q=80&w=800',
    verified: true,
    amenities: ['High-speed Wi-Fi', 'Solar Backup', 'Mess & Meal Plan', 'Laundry Service', '24/7 Female Guards', 'Garden Terrace'],
    roomTypes: [
      { type: 'Single Deluxe', price: 700, available: 0 },
      { type: '2-Bed Standard', price: 520, available: 2 },
    ],
    description: 'A quiet, secure, and supportive environment designed for female students seeking academic focus and community.',
    wardenName: 'Prof. Sarah Jenkins',
    wardenContact: '+1 (555) 018-9921',
    rules: ['Card-key access required', 'Quiet study hours mandatory after 9 PM', 'Eco-friendly waste sorting']
  },
  {
    id: 'h3',
    name: 'Greenwood Male Lodge',
    category: 'Male',
    distance: '500m from Engineering Faculty',
    rating: 4.6,
    reviewCount: 87,
    pricePerSemester: 380,
    availableBeds: 8,
    totalBeds: 120,
    address: '42 Campus Perimeter Road',
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800',
    verified: true,
    amenities: ['Wi-Fi 6', 'Generator Backup', 'Gym & Gaming Pod', 'Self-Cooking Kitchen', 'CCTV Security'],
    roomTypes: [
      { type: '2-Bed Shared', price: 380, available: 5 },
      { type: '4-Bed Budget Shared', price: 280, available: 3 },
    ],
    description: 'Spacious and affordable hostel located close to engineering labs and sports complex.',
    wardenName: 'Coach James Miller',
    wardenContact: '+1 (555) 014-3312',
    rules: ['No loud music after 11 PM', 'Keep common kitchen clean', 'Gym access for registered residents only']
  },
  {
    id: 'h4',
    name: 'St. Jude International Suites',
    category: 'Co-ed',
    distance: '150m from Student Center',
    rating: 4.7,
    reviewCount: 115,
    pricePerSemester: 600,
    availableBeds: 5,
    totalBeds: 90,
    address: '22 College Boulevard',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800',
    verified: true,
    amenities: ['High-speed Wi-Fi', 'AC in all rooms', 'All-inclusive Dining', 'Weekly Housekeeping', '24/7 Power', 'Elevator'],
    roomTypes: [
      { type: 'Single Executive', price: 850, available: 2 },
      { type: 'Double Suite', price: 600, available: 3 },
    ],
    description: 'Premium student suites with hotel-style amenities and integrated study hubs for international and postgraduate students.',
    wardenName: 'Dr. Elena Rostova',
    wardenContact: '+1 (555) 012-7788',
    rules: ['ID verification at gate', 'No smoking anywhere inside building', 'Quiet lounge designated for group studies']
  }
];

export function Hostels() {
  const [hostels, setHostels] = useState<Hostel[]>(INITIAL_HOSTELS);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Male' | 'Female' | 'Co-ed'>('All');
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(1000);
  const [selectedHostel, setSelectedHostel] = useState<Hostel | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedRoomType, setSelectedRoomType] = useState<string>('');
  
  // Application booking state
  const [moveInSemester, setMoveInSemester] = useState('Fall 2026');
  const [specialRequests, setSpecialRequests] = useState('');
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  // My Applications mock state
  const [myApplications, setMyApplications] = useState<Array<{
    id: string;
    hostelName: string;
    roomType: string;
    semester: string;
    status: 'Pending Jury Review' | 'Approved' | 'Bed Reserved';
    dateApplied: string;
  }>>([
    {
      id: 'app-101',
      hostelName: 'Apex Student Residence',
      roomType: '2-Bed Shared Suite',
      semester: 'Fall 2026',
      status: 'Bed Reserved',
      dateApplied: '2026-08-01'
    }
  ]);

  const filteredHostels = hostels.filter(h => {
    const matchesSearch = h.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          h.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          h.amenities.some(a => a.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'All' || h.category === categoryFilter;
    const matchesPrice = h.pricePerSemester <= maxPriceFilter;
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const handleOpenBooking = (hostel: Hostel) => {
    setSelectedHostel(hostel);
    if (hostel.roomTypes.length > 0) {
      setSelectedRoomType(hostel.roomTypes[0].type);
    }
    setBookingModalOpen(true);
  };

  const handleConfirmBooking = () => {
    if (!selectedHostel) return;
    setIsSubmittingBooking(true);

    setTimeout(() => {
      const newApp = {
        id: `app-${Date.now()}`,
        hostelName: selectedHostel.name,
        roomType: selectedRoomType || 'Standard Room',
        semester: moveInSemester,
        status: 'Pending Jury Review' as const,
        dateApplied: new Date().toISOString().split('T')[0]
      };

      setMyApplications(prev => [newApp, ...prev]);
      
      // Update available beds
      setHostels(prev => prev.map(h => {
        if (h.id === selectedHostel.id) {
          return {
            ...h,
            availableBeds: Math.max(0, h.availableBeds - 1)
          };
        }
        return h;
      }));

      setIsSubmittingBooking(false);
      setBookingModalOpen(false);
      toast.success(`Application submitted for ${selectedHostel.name}! Your bed request is submitted to hostel governance.`);
    }, 800);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Page Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white p-6 md:p-10 shadow-lg">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_30%_30%,_var(--tw-gradient-stops))] from-white via-blue-200 to-purple-900 pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold tracking-wide uppercase">
            <Building2 className="w-3.5 h-3.5" /> Decentralized Campus Housing
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-heading">
            Student Hostels & Residences
          </h1>
          <p className="text-blue-100 text-sm md:text-base leading-relaxed">
            Verified, student-governed accommodations near campus. Fair pricing, community reviews, transparent rules, and zero hidden admin fees.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="explore" className="w-full">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <TabsList className="bg-muted p-1 rounded-xl">
            <TabsTrigger value="explore" className="flex items-center gap-2 text-xs md:text-sm font-medium">
              <Building2 className="w-4 h-4" /> Explore Hostels
            </TabsTrigger>
            <TabsTrigger value="applications" className="flex items-center gap-2 text-xs md:text-sm font-medium relative">
              <Clock className="w-4 h-4" /> My Applications
              {myApplications.length > 0 && (
                <Badge className="ml-1 bg-blue-600 text-white text-[10px] px-1.5 py-0 h-4 min-w-[16px] justify-center">
                  {myApplications.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="noticeboard" className="flex items-center gap-2 text-xs md:text-sm font-medium">
              <Info className="w-4 h-4" /> Housing Notices
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Explore Hostels */}
        <TabsContent value="explore" className="space-y-6 pt-4">
          {/* Filters Bar */}
          <Card className="p-4 bg-card border-border shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              {/* Search */}
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search hostel name, amenities, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as any)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs md:text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="All">All Categories</option>
                  <option value="Co-ed">Co-ed Residence</option>
                  <option value="Female">Female Only</option>
                  <option value="Male">Male Only</option>
                </select>
              </div>

              {/* Max Budget Slider */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                  <span>Max Budget:</span>
                  <span className="text-foreground">${maxPriceFilter}/sem</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="1000"
                  step="50"
                  value={maxPriceFilter}
                  onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
                  className="w-full accent-blue-600 h-1.5 bg-muted rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </Card>

          {/* Hostels Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredHostels.map((hostel) => (
              <Card key={hostel.id} className="overflow-hidden border-border hover:shadow-md transition-all flex flex-col group">
                <div className="relative h-48 w-full overflow-hidden bg-muted">
                  <img
                    src={hostel.image}
                    alt={hostel.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge className="bg-background/90 backdrop-blur-md text-foreground border-border text-xs font-semibold">
                      {hostel.category}
                    </Badge>
                    {hostel.verified && (
                      <Badge className="bg-blue-600 text-white gap-1 text-xs">
                        <ShieldCheck className="w-3 h-3" /> Community Verified
                      </Badge>
                    )}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-background/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-foreground flex items-center gap-1 shadow">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {hostel.rating} ({hostel.reviewCount})
                  </div>
                </div>

                <CardHeader className="p-5 pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl font-bold font-heading">{hostel.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1 text-xs mt-1 text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        {hostel.distance} • {hostel.address}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-5 pt-0 flex-1 space-y-4">
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {hostel.description}
                  </p>

                  {/* Amenities Pills */}
                  <div className="flex flex-wrap gap-1.5">
                    {hostel.amenities.slice(0, 4).map((a, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-muted text-foreground">
                        {a.includes('Wi-Fi') && <Wifi className="w-3 h-3 text-blue-500" />}
                        {a.includes('Power') && <Zap className="w-3 h-3 text-amber-500" />}
                        {a.includes('Mess') && <Utensils className="w-3 h-3 text-emerald-500" />}
                        {!a.includes('Wi-Fi') && !a.includes('Power') && !a.includes('Mess') && <CheckCircle2 className="w-3 h-3 text-primary" />}
                        {a}
                      </span>
                    ))}
                    {hostel.amenities.length > 4 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                        +{hostel.amenities.length - 4} more
                      </span>
                    )}
                  </div>

                  <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                    <div>
                      <span className="text-muted-foreground">Starting from</span>
                      <div className="text-lg font-extrabold text-foreground font-heading">
                        ${hostel.pricePerSemester} <span className="text-xs font-normal text-muted-foreground">/ sem</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-muted-foreground">Vacancy</span>
                      <div className="font-semibold text-xs flex items-center justify-end gap-1">
                        <span className={`w-2 h-2 rounded-full ${hostel.availableBeds > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span className={hostel.availableBeds > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}>
                          {hostel.availableBeds > 0 ? `${hostel.availableBeds} Beds Available` : 'Fully Booked'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="p-5 pt-0 flex gap-2">
                  <Button
                    onClick={() => handleOpenBooking(hostel)}
                    disabled={hostel.availableBeds === 0}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold"
                  >
                    <Bed className="w-3.5 h-3.5 mr-1.5" /> Book Room / Apply
                  </Button>
                </CardFooter>
              </Card>
            ))}

            {filteredHostels.length === 0 && (
              <div className="col-span-full py-12 text-center space-y-3 bg-card border border-dashed border-border rounded-xl">
                <Building2 className="w-10 h-10 text-muted-foreground mx-auto" />
                <h3 className="text-base font-bold text-foreground">No Hostels Match Your Criteria</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Try adjusting your budget slider, clear search keywords, or change the category filter.
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setCategoryFilter('All');
                    setMaxPriceFilter(1000);
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab 2: My Applications */}
        <TabsContent value="applications" className="space-y-4 pt-4">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold font-heading">Active Housing Requests</CardTitle>
              <CardDescription className="text-xs">
                Track your hostel room bookings and community governance verification status.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {myApplications.map((app) => (
                <div key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border bg-muted/40 gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">{app.hostelName}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {app.roomType}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-3">
                      <span>Semester: {app.semester}</span>
                      <span>Applied: {app.dateApplied}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 justify-between sm:justify-end">
                    <Badge className={
                      app.status === 'Bed Reserved' 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                    }>
                      {app.status === 'Bed Reserved' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                      {app.status}
                    </Badge>
                    <Button variant="ghost" size="sm" className="text-xs h-8">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}

              {myApplications.length === 0 && (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  You have no pending room applications. Explore hostels and apply for a bed!
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Housing Notices */}
        <TabsContent value="noticeboard" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-600 text-white text-[10px]">Hostel Council</Badge>
                  <span className="text-xs text-muted-foreground">Posted 2 days ago</span>
                </div>
                <CardTitle className="text-base font-bold">Annual Wi-Fi & Fiber Upgrade Scheduled</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2">
                <p>
                  High-speed 1Gbps fiber connections are being installed across Apex Student Residence and Greenwood Male Lodge this Saturday between 9 AM and 1 PM.
                </p>
                <div className="font-semibold text-foreground">Affected Block: North Wing Student Pods</div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-purple-600 text-white text-[10px]">Governance</Badge>
                  <span className="text-xs text-muted-foreground">Posted 4 days ago</span>
                </div>
                <CardTitle className="text-base font-bold">Mess Menu Voting Open for Fall Semester</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2">
                <p>
                  Students at Trinity Hall and St. Jude Suites are invited to cast their votes on the new weekly meal menu proposals in the Governance module.
                </p>
                <div className="font-semibold text-foreground font-heading">Status: Voting Active (Ends Aug 12)</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Booking Modal */}
      {selectedHostel && (
        <Dialog open={bookingModalOpen} onOpenChange={setBookingModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-heading text-lg font-bold">
                Apply for {selectedHostel.name}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {selectedHostel.address} • {selectedHostel.distance}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs">
              {/* Room Selection */}
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground block">Select Room Type:</label>
                <div className="space-y-2">
                  {selectedHostel.roomTypes.map((rt) => (
                    <label
                      key={rt.type}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedRoomType === rt.type 
                          ? 'border-blue-600 bg-blue-500/10 font-semibold' 
                          : 'border-border bg-card hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="roomType"
                          checked={selectedRoomType === rt.type}
                          onChange={() => setSelectedRoomType(rt.type)}
                          className="accent-blue-600"
                        />
                        <span>{rt.type}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-foreground">${rt.price}/sem</span>
                        <span className="text-[10px] text-muted-foreground block">
                          {rt.available > 0 ? `${rt.available} left` : 'Waitlist'}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Semester */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground block">Target Move-in Semester:</label>
                <select
                  value={moveInSemester}
                  onChange={(e) => setMoveInSemester(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                >
                  <option value="Fall 2026">Fall Semester 2026</option>
                  <option value="Spring 2027">Spring Semester 2027</option>
                  <option value="Summer 2027">Summer Term 2027</option>
                </select>
              </div>

              {/* Special Requests */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground block">Special Roommate or Accessibility Requests (Optional):</label>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="e.g. Prefer ground floor room, requesting roommate placement with @john_doe"
                  className="w-full h-20 rounded-md border border-input bg-background p-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              {/* Rules summary */}
              <div className="p-3 bg-muted rounded-lg space-y-1">
                <span className="font-bold text-foreground block text-[11px] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> Community Rules Highlights
                </span>
                <ul className="list-disc pl-4 text-[11px] text-muted-foreground space-y-0.5">
                  {selectedHostel.rules.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" size="sm" onClick={() => setBookingModalOpen(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmBooking}
                disabled={isSubmittingBooking}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                {isSubmittingBooking ? 'Submitting...' : 'Submit Application'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
