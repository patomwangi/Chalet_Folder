import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useChaletContext } from "@/context/use-chalet";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Utensils,
  Microwave,
  Refrigerator,
  Tv,
  Flame,
  Mountain,
  Wifi,
  ChevronRight,
  ChevronLeft,
  ShowerHead,
  CircleParking,
  X,
  Plus,
} from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { AmenitiesFormData, AmenitiesSchema } from "../types/chalet-schema";

const PREDEFINED_AMENITIES = [
  "Gas Cooker",
  "Microwave",
  "Fridge",
  "TV with DSTV",
  "BBQ Jiko",
  "En-suite Bathrooms",
  "Lake View",
  "Wi-Fi",
  "Parking",
] as const;

// Icon mapping for predefined amenities
const AMENITIES_ICONS = {
  "Gas Cooker": Flame,
  "Microwave": Microwave,
  "Fridge": Refrigerator,
  "TV with DSTV": Tv,
  "BBQ Jiko": Utensils,
  "En-suite Bathrooms": ShowerHead,
  "Lake View": Mountain,
  "Wi-Fi": Wifi,
  "Parking": CircleParking,
};

interface AmenitiesStepProps {
  setCurrentStep: Dispatch<SetStateAction<number>>;
}

export const AmenitiesStep: React.FC<AmenitiesStepProps> = ({
  setCurrentStep,
}) => {
  const { updateChaletData, chaletData } = useChaletContext();

  // Initialize form with context data or defaults
  const form = useForm<AmenitiesFormData>({
    resolver: zodResolver(AmenitiesSchema),
    defaultValues: {
      predefinedAmenities: chaletData.amenities?.predefinedAmenities || [],
      customAmenities: chaletData.amenities?.customAmenities || [],
    },
  });

  // Use field array for custom amenities
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "customAmenities",
  });

  // Toggle predefined amenity
  const togglePredefinedAmenity = (amenity: string) => {
    const currentAmenities = form.getValues("predefinedAmenities") || [];
    const newAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter((a) => a !== amenity)
      : [...currentAmenities, amenity];

     // Directly set the value and trigger validation
     form.setValue("predefinedAmenities", newAmenities, { 
      shouldValidate: true,
      shouldDirty: true
    });
  };

    // Submit handler
    const onSubmit = (data: AmenitiesFormData) => {
      // Update chalet data with amenities
      updateChaletData("amenities", {
        predefinedAmenities: data.predefinedAmenities || [],
        customAmenities: data.customAmenities || [],
      });
  
      // Move to next step
      setCurrentStep(7);
    };

  return (
    <Card className="w-full max-w-5xl">
      <CardHeader>
        <CardTitle>Amenities Details</CardTitle>
        <CardDescription>Select Amenities</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Predefined Amenities Grid */}
            <div>
              <FormLabel className="mb-4 block">Predefined Amenities</FormLabel>
              <div className="grid grid-cols-3 gap-4">
                {PREDEFINED_AMENITIES.map((amenity) => {
                  const Icon = AMENITIES_ICONS[amenity];
                  const predefinedAmenities =
                    form.getValues("predefinedAmenities") || [];

                  return (
                    <Button
                      key={amenity}
                      type="button"
                      variant={
                        predefinedAmenities.includes(amenity)
                          ? "chaletAmenity"
                          : "greatRiftColorOutline"
                      }
                      onClick={() => togglePredefinedAmenity(amenity)}
                      className="flex items-center justify-start gap-2 h-16 w-full"
                    >
                      <Icon className="mr-2 size-14" />
                      {amenity}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Custom Amenities Section */}
            <div className="space-y-4">
              <FormLabel>Custom Amenities</FormLabel>
              {fields.map((field, index) => (
                <FormField
                  key={field.id}
                  control={form.control}
                  name={`customAmenities.${index}.name`}
                  render={({ field: inputField }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Input
                          {...inputField}
                          placeholder="Enter custom amenity"
                          className="flex-grow"
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => remove(index)}
                      >
                        <X className="size-4" />
                      </Button>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => append({ name: "" })}
                className="w-full"
              >
                <Plus className="mr-2 size-4" /> Add Custom Amenity
              </Button>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(5)}
              >
                <ChevronLeft className="mr-2" /> Back
              </Button>
              <Button
                type="submit"
                disabled={
                  (form.getValues("predefinedAmenities")?.length || 0) === 0 &&
                  (form.getValues("customAmenities")?.length || 0) === 0
                }
                className="h-10 bg-[#27534c] hover:bg-[#1a3733]"
              >
                Next <ChevronRight className="ml-2" />
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
