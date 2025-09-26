import { RoomType } from '@/context/types';
import { z } from 'zod';

export const ChaletDetailsSchema = z.object({
  name: z.string().min(2, { message: 'Chalet name must be at least 2 characters' }),
  propertyType: z.enum(['STANDALONE', 'DUPLEX_UPPER', 'DUPLEX_LOWER']),
  description: z.string().optional(),
  basePrice: z.number().min(0, { message: 'Base rate must be non-negative' }),
  weekendPrice: z.number().min(0, { message: 'Weekend rate must be non-negative' }).optional(),
  roomCount: z.number().min(1, { message: 'Maximum occupancy must be at least 1' }),
  isEnsuite: z.boolean(),
  totalWashrooms: z.number().min(0, { message: 'Please enter number of washroom' }),
  totalFloors: z.number().min(0, { message: 'Please enter number of floors' }),
  hasUpstairsLounge: z.boolean(),
  hasDownstairsLounge: z.boolean(),
  maxAdults: z.number().min(0, { message: 'Please enter maximum number of adults for chalet' }),
  maxChildren: z.number().min(0, { message: 'Please enter maximum number of children for chalet' }),
  totalSleeps: z
    .number()
    .min(0, { message: 'Please enter number of people can sleep in this chalet' }),
  ownerId: z.string(),
});

export const RoomDetailsSchema = z.object({
  roomType: z.nativeEnum(RoomType),
  floor: z.number().min(1),
  notEnsuite: z.boolean(),
  hasBunkBed: z.boolean(),
  bunkBedCapacity: z.number().optional(),
  capacity: z.number().min(1),
  numberOfRooms: z.number().min(1),
});

export const AvailabilitySchema = z.object({
  unavailableDates: z.array(z.date()).optional(),
});

export type AvailabilityFormData = z.infer<typeof AvailabilitySchema>;

export const LocationSchema = z.object({
  location: z.object({
    name: z.string().min(1, 'Location name is required'),
    address: z.string().min(1, 'Address is required'),
    coordinates: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    }),
  }),
});

export type LocationFormData = z.infer<typeof LocationSchema>;

export const AmenitiesSchema = z.object({
  predefinedAmenities: z.array(z.string()).optional(),
  customAmenities: z
    .array(
      z.object({
        name: z.string().min(1, 'Custom amenity name is required'),
      }),
    )
    .optional(),
});

// Type for the form schema
export type AmenitiesFormData = z.infer<typeof AmenitiesSchema>;

export const ChaletImageSchema = z.object({
file: z.instanceof(File).nullable().optional(), // Make it optional
  url: z.string(),
  alt: z.string(),
  key: z.string().optional(),
  label: z.string(),
  isMain: z.boolean(),
});

export const ChaletImagesSchema = z.object({
  images: z.array(ChaletImageSchema).min(1, { message: 'At least one image is required' }),
});

export type ChaletImagesData = z.infer<typeof ChaletImagesSchema>;
