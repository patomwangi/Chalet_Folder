export interface ChaletData {
  name: string;
  type: string;
  description?: string;
  isEnsuite: boolean;
}

export const chaletTypes = ['Duplex Lower', 'Stand Alone Unit', 'Duplex Upper'];

// Updated types to match the API response
export interface ApiResponse {
  message: string;
  chalets: Chalet[];
}

export interface Chalet {
  id: string;
  name: string;
  propertyType: string;
  basePrice: string; // Note: Changed to string as that's how it comes from API
  locationName: string;
  isUnderMaintenance: boolean;
  roomCount: number;
  isEnsuite: boolean;
  images: {
    id: string;
    url: string;
    isMain: boolean;
    label: string;
  }[];
  amenities: {
    id: number;
    name: string;
  }[];
  rooms: {
    roomType: string;
    capacity: number;
  }[];
  _count: {
    rooms: number;
    amenities: number;
    ChaletAvailability: number;
    images: number;
  };
}
