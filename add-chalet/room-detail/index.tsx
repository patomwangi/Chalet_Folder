import { RoomData, RoomType } from '@/context/types';
import { useChaletContext } from '@/context/use-chalet';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { RoomDetailsSchema } from '../../types/chalet-schema';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface RoomDetailsStepProps {
  setCurrentStep: (step: number) => void;
  totalRooms: number;
}
export const RoomDetailsStep = ({ setCurrentStep, totalRooms }: RoomDetailsStepProps) => {
  const { updateChaletData, chaletData } = useChaletContext();

  // Determine initial room details - use from context or create default
  const initialRoomDetails: RoomData[] = chaletData.roomDetails?.length
    ? chaletData.roomDetails
    : [
        {
          roomType: RoomType.Double,
          floor: 1,
          notEnsuite: false,
          hasBunkBed: false,
          bunkBedCapacity: undefined,
          capacity: 2,
          numberOfRooms: 1,
        },
      ];

  const form = useForm<{ roomDetails: RoomData[] }>({
    resolver: zodResolver(
      z.object({
        roomDetails: z.array(RoomDetailsSchema),
      }),
    ),
    defaultValues: {
      roomDetails: initialRoomDetails,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'roomDetails',
  });

  const watch = form.watch();
  const totalRoomsAdded = watch.roomDetails.reduce((sum, room) => sum + room.numberOfRooms, 0);

  const onSubmit = (data: { roomDetails: RoomData[] }) => {
    // Update context with room details
    updateChaletData('roomDetails', data.roomDetails);
    // Move to next step
    setCurrentStep(3);
  };

  // const totalRoomsAdded = form.watch('roomDetails').reduce((sum, room) => sum + room.room, 0);

  const isRoomDetailsComplete = totalRoomsAdded === totalRooms;

  const addAnotherRoom = () => {
    append({
      roomType: RoomType.Double,
      floor: 1,
      notEnsuite: false,
      hasBunkBed: false,
      bunkBedCapacity: undefined,
      capacity: 2,
      numberOfRooms: 1,
    });
  };

  const removeRoom = (index: number) => {
    // Prevent removing the last room type
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <Card className="w-full max-w-5xl">
      <CardHeader>
        <CardTitle>Room Details</CardTitle>
        <CardDescription>Configure the rooms in your chalet</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {totalRoomsAdded > totalRooms && (
              <Alert variant="destructive">
                <AlertDescription>
                  Total rooms ({totalRoomsAdded}) exceeds the specified number of rooms (
                  {totalRooms})
                </AlertDescription>
              </Alert>
            )}

            {fields.map((field, index) => (
              <>
                <div key={field.id} className="mb-6 border-b pb-4">
                  <div className="grid gap-4">
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name={`roomDetails.${index}.roomType`}
                        render={({ field: selectField }) => (
                          <FormItem>
                            <FormLabel>Room Type</FormLabel>
                            <Select
                              onValueChange={selectField.onChange}
                              defaultValue={selectField.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select room type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.values(RoomType).map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`roomDetails.${index}.floor`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Floor Number</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                min={1}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`roomDetails.${index}.numberOfRooms`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Number of Rooms</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                min={1}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <FormField
                        control={form.control}
                        name={`roomDetails.${index}.notEnsuite`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Not En-suite</FormLabel>
                            <Select
                              onValueChange={(value) => field.onChange(value === 'true')}
                              value={field.value.toString()}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="true">Yes</SelectItem>
                                <SelectItem value="false">No</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`roomDetails.${index}.hasBunkBed`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Has Bunk Bed</FormLabel>
                            <Select
                              onValueChange={(value) => field.onChange(value === 'true')}
                              value={field.value.toString()}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="true">Yes</SelectItem>
                                <SelectItem value="false">No</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`roomDetails.${index}.capacity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Regular Bed Capacity</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                min={1}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {form.watch(`roomDetails.${index}.hasBunkBed`) && (
                      <div className="mt-4">
                        <FormField
                          control={form.control}
                          name={`roomDetails.${index}.bunkBedCapacity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bunk Bed Capacity</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                  min={1}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end m-2">
                    {/* Add remove button for each room type, except the last one */}
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => removeRoom(index)}
                        className="w-32 h-10"
                      >
                        <Trash2 className="h-4 w-4" /> Delete Room
                      </Button>
                    )}
                  </div>
                </div>
              </>
            ))}

            {!isRoomDetailsComplete && (
              <Button
                type="button"
                variant="outline"
                onClick={addAnotherRoom}
                className="w-full mb-4"
              >
                <Plus className="mr-2" /> Add Another Room Type
              </Button>
            )}

            <div className="flex justify-between mt-4">
              <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>
                <ChevronLeft className="mr-2" /> Back
              </Button>
              <Button
                type="submit"
                disabled={!isRoomDetailsComplete}
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
