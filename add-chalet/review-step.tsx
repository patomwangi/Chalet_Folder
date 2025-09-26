import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, Bed, MapPin, Award, CalendarCheck, ChevronLeft, Save } from 'lucide-react';
import { useChaletContext } from '@/context/use-chalet';
import { Badge } from '@/components/ui/badge';

interface ChaletImage {
  file: object;
  url: string;
  alt: string;
  key: string;
  label: string;
  isMain: boolean;
}

// Define precise interfaces based on your data structure
interface ChaletDetails {
  name: string;
  propertyType: string;
  description?: string;
  basePrice: number;
  isEnsuite: boolean;
  roomCount: number;
}

interface RoomDetail {
  roomType: string | undefined;
  numberOfRooms: number;
  capacity: number;
  floor: number;
  notEnsuite: boolean;
  hasBunkBed: boolean;
  bunkBedCapacity?: number;
}

interface Location {
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface Amenities {
  predefinedAmenities: string[];
  customAmenities: { name: string }[]; // Match the context type
}

interface Availability {
  unavailableDates: Date[]; // Note: Date[], not string[]
}

interface ReviewSectionProps<T> {
  title: string;
  icon: React.ElementType;
  data: T;
  editStep: number;
  renderContent: (data: T) => React.ReactNode;
}

interface ReviewStepProps {
  setCurrentStep: (step: number) => void;
  handleSubmit: () => Promise<void>;
  isLoading: boolean;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  setCurrentStep,
  handleSubmit,
  isLoading,
}) => {
  const { chaletData } = useChaletContext();

  const ReviewSection = <T,>({
    title,
    icon: Icon,
    data,
    editStep,
    renderContent,
  }: ReviewSectionProps<T>) => (
    <div className="bg-white/80 backdrop-blur-sm border border-neutral-200 rounded-xl p-4 mb-4 shadow-sm transition-all hover:shadow-md">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-3">
          <Icon className="text-neutral-600" size={20} />
          <h3 className="text-lg font-semibold text-neutral-800">{title}</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="text-blue-600 hover:bg-blue-50 transition-colors"
          onClick={() => setCurrentStep(editStep)}
        >
          Edit
        </Button>
      </div>
      <div className="pl-8">{renderContent(data)}</div>
    </div>
  );

  return (
    <Card className="w-full max-w-4xl border-neutral-200 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-neutral-900">Review Chalet Listing</CardTitle>
        <CardDescription className="text-neutral-600">
          Carefully review all details before submitting your chalet listing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ReviewSection<ChaletDetails>
          title="Chalet Details"
          icon={Home}
          data={chaletData.chaletDetails as ChaletDetails}
          editStep={1}
          renderContent={(data) => (
            <div className="space-y-4">
              <div className="mt-4 space-y-2">
                <p>
                  <strong>Name:</strong> {data.name}
                </p>
                <p>
                  <strong>Type:</strong> {data.propertyType}
                </p>
                <p>
                  <strong>En-suite:</strong> {data.isEnsuite ? 'Yes' : 'No'}
                </p>
                <p>
                  <strong>Base Rate:</strong> Ksh {data.basePrice}/night
                </p>
                <p>
                  <strong>Max Occupancy:</strong> {data.roomCount} guests
                </p>
              </div>
            </div>
          )}
        />

        <ReviewSection<RoomDetail[]>
          title="Room Details"
          icon={Bed}
          data={chaletData.roomDetails as RoomDetail[]}
          editStep={2}
          renderContent={(rooms) => (
            <div className="space-y-6">
              {rooms.map((room: RoomDetail, index: number) => (
                <div key={index} className="bg-neutral-100 p-4 rounded-lg space-y-4">
                  <div className="mt-4 space-y-2">
                    <p>
                      <strong>Room {index + 1}:</strong> {room.roomType}
                    </p>
                    <p>
                      <strong>Capacity:</strong> {room.capacity} guests
                    </p>
                    <p>
                      <strong>Has Bunked Room {index + 1}:</strong> {room.hasBunkBed}
                    </p>
                    <p>
                      <strong>Ensuite:</strong> {room.notEnsuite}
                    </p>
                    <p>
                      <strong>Rooms {index + 1}:</strong> {room.numberOfRooms}
                    </p>
                    <p>
                      <strong>Bunker Capacity:</strong> {room.bunkBedCapacity} 
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        />

        <ReviewSection<ChaletImage[]>
          title="Chalet Images"
          icon={Home}
          data={chaletData.images as ChaletImage[]}
          editStep={3}
          renderContent={(images) => (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square overflow-hidden rounded-lg shadow-sm">
                      <img
                        src={image.url}
                        alt={image.alt}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {image.isMain && <Badge className="bg-blue-500">Main Image</Badge>}
                      <Badge variant="outline" className="bg-white/80">
                        {image.label || 'Unlabeled'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-sm text-neutral-600">
                <p>Total Images: {images.length}</p>
                <p>Main Image: {images.find((img) => img.isMain)?.label || 'Not set'}</p>
              </div>
            </div>
          )}
        />

        <ReviewSection<Location>
          title="Location"
          icon={MapPin}
          data={chaletData.location as Location}
          editStep={4}
          renderContent={(location) => (
            <div className="space-y-2">
              <p>
                <strong>Name:</strong> {location.name}
              </p>
              <p>
                <strong>Address:</strong> {location.address}
              </p>
              <p>
                <strong>Coordinates:</strong> {location.coordinates.lat}, {location.coordinates.lng}
              </p>
            </div>
          )}
        />

        <ReviewSection<Amenities>
          title="Amenities"
          icon={Award}
          data={chaletData.amenities as Amenities}
          editStep={5}
          renderContent={(amenities) => (
            <div className="space-y-2">
              <p>
                <strong>Predefined Amenities:</strong>
              </p>
              <ul className="list-disc pl-5">
                {amenities.predefinedAmenities.map((amenity: string, index: number) => (
                  <li key={index}>{amenity}</li>
                ))}
              </ul>
            </div>
          )}
        />

        <ReviewSection<Availability>
          title="Availability"
          icon={CalendarCheck}
          data={chaletData.availability as Availability}
          editStep={3}
          renderContent={(availability) => (
            <div className="space-y-2">
              <p>
                <strong>Unavailable Dates:</strong>
              </p>
              <div className="text-sm text-neutral-600">
                {availability.unavailableDates.length} dates blocked
              </div>
            </div>
          )}
        />

        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(6)}
            className="hover:bg-neutral-100 transition-colors"
          >
            <ChevronLeft className="mr-2" /> Back
          </Button>
          <Button
            className="bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? 'Submitting' : ' Submit Chalet'}
            {/* Submit Chalet */}
            <Save className="ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
