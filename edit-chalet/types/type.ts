export interface ApiResponse {
    message: string;
    chalet: Chalet;
  }


  export interface Coordinates {
    lat: number;
    lng: number;
  }
  
  interface Chalet {
    id: string;
    name: string;
    propertyType: string;
    basePrice: string; // Note: Changed to string as that's how it comes from API
    locationName: string;
    address: string;
    coordinates:Coordinates;
    isUnderMaintenance: boolean;
    roomCount: number;
    isEnsuite: boolean;
    description:string;
    totalFloors:number;
    totalSleeps:number;
    totalWashrooms:number;
    weekendPrice: number | 0;
    maxAdults:number;
    maxChildren:number;
    images: {
      id: string;
      alt?:string;
      url: string;
      isMain: boolean;
      label: string;
    }[];
    amenities: {
      id: number;
      name: string;
    }[];
    ChaletUnavailableDates:UnavailableDate[];
    bookings: Booking[];
    rooms: {
      id?: string;
      room?: number;
      roomType: string;
      capacity: number;
      bunkBedCapacity:number | null;
      floor:number;
      numberOfRooms:number;
      hasBunkBed:boolean;
      notEnsuite: boolean;
    }[];
    _count: {
      rooms: number;
      amenities: number;
      ChaletAvailability: number;
      images: number;
    };
  }
  
  export interface ChaletImage {
    id: string;
    url: string;
    alt?: string;
    label: string;
    isMain: boolean;
  }

  export interface Amenity {
    id: number;
    name: string;
    description?: string;
    createdAt?: string;
  }

  export  interface UnavailableDate {
    id: string;
    chaletId: string;
    date: string;
  }

  interface BookingDate {
    id: string;
    date: string;
    bookingId: string;
  }
  
  export  interface Booking {
    id: string;
    chaletId: string;
    checkIn: string;
    checkOut: string;
    numberOfAdults: number;
    numberOfChildren: number;
    totalGuests: number;
    totalCost: string;
    customerId: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    bookingDates: BookingDate[];
  }