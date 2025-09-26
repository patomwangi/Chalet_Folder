import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Check, ChevronRight } from 'lucide-react';
import { useChaletContext } from '@/context/use-chalet';
import { ChaletDetailsData, PropertyType } from '@/context/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChaletDetailsSchema } from '../../types/chalet-schema';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useGetOwners } from '@/routes/owners/hook/useGetOwners';

interface ChaletDetailsStepProps {
  setCurrentStep: (step: number) => void;
  setTotalRooms: (rooms: number) => void;
}

export const ChaletDetailsStep: React.FC<ChaletDetailsStepProps> = ({
  setCurrentStep,
  setTotalRooms,
}) => {
  const { updateChaletData, chaletData } = useChaletContext();
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');

  const { data, isLoading } = useGetOwners();

  const form = useForm<ChaletDetailsData>({
    resolver: zodResolver(ChaletDetailsSchema),
    defaultValues: {
      name: chaletData.chaletDetails?.name || '',
      propertyType: chaletData.chaletDetails?.propertyType || PropertyType.STANDALONE,
      description: chaletData.chaletDetails?.description || '',
      basePrice: chaletData.chaletDetails?.basePrice || 0,
      weekendPrice: chaletData.chaletDetails?.weekendPrice || 0,
      roomCount: chaletData.chaletDetails?.roomCount || 1,
      isEnsuite: chaletData.chaletDetails?.isEnsuite || false,
      totalWashrooms: chaletData.chaletDetails?.totalWashrooms || 0,
      totalFloors: chaletData.chaletDetails?.totalFloors || 0,
      hasUpstairsLounge: Boolean(chaletData.chaletDetails?.hasUpstairsLounge) || false,
      hasDownstairsLounge: Boolean(chaletData.chaletDetails?.hasDownstairsLounge) || false,
      maxAdults: chaletData.chaletDetails?.maxAdults || 1,
      maxChildren: chaletData.chaletDetails?.maxChildren || 0,
      totalSleeps: chaletData.chaletDetails?.totalSleeps || 0,
      ownerId: chaletData.chaletDetails?.ownerId || '',
    },
  });

  const onSubmit = (data: ChaletDetailsData) => {
    // Update context with form data
    updateChaletData('chaletDetails', data);

    // Set total rooms for subsequent steps
    setTotalRooms(data.roomCount);

    // Move to next step
     setCurrentStep(2);
  };

  const chaletTypes = ['DUPLEX_LOWER', 'STANDALONE', 'DUPLEX_UPPER'];

  return (
    <Card className="w-full max-w-5xl">
      <CardHeader>
        <CardTitle>Chalet Details</CardTitle>
        <CardDescription>Provide basic information about your chalet</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chalet Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter chalet name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Owner Selection with Command */}
              <FormField
                control={form.control}
                name="ownerId"
                render={({ field }) => {
                  const ownersList = data?.owners || [];
                  const selectedOwner = ownersList.find((owner) => owner.id === field.value);

                  const filteredOwners = ownersList.filter((owner) =>
                    owner.name.toLowerCase().includes(searchTerm.toLowerCase()),
                  );

                  return (
                    <FormItem>
                      <FormLabel>Owner</FormLabel>
                      <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                'w-full justify-between',
                                !field.value && 'text-muted-foreground',
                              )}
                            >
                              {selectedOwner ? selectedOwner.name : 'Select owner'}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-2">
                          <div className="space-y-2">
                            <Input
                              placeholder="Search owners..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="mb-2"
                            />
                            <div className="max-h-[200px] overflow-auto">
                              {isLoading ? (
                                <div className="p-2 text-center">Loading owners...</div>
                              ) : filteredOwners.length > 0 ? (
                                <div className="space-y-1">
                                  {filteredOwners.map((owner) => (
                                    <button
                                      key={owner.id}
                                      onClick={() => {
                                        form.setValue('ownerId', owner.id);
                                        setOpen(false);
                                        setSearchTerm('');
                                      }}
                                      className={cn(
                                        'flex items-center gap-2 w-full p-2 rounded-md hover:bg-slate-100',
                                        owner.id === field.value && 'bg-slate-100',
                                      )}
                                    >
                                      <img
                                        src={owner.photo.image}
                                        alt={owner.name}
                                        className="h-6 w-6 rounded-full object-cover"
                                      />
                                      <span>{owner.name}</span>
                                      {owner.id === field.value && (
                                        <Check className="h-4 w-4 ml-auto" />
                                      )}
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                <div className="p-2 text-center text-muted-foreground">
                                  No owners found
                                </div>
                              )}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="propertyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chalet Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select chalet type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {chaletTypes.map((type) => (
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
                name="roomCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Rooms</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Total Rooms"
                        {...field}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isEnsuite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chalet En-Suite</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        const isEnsuite = value === 'true';
                        field.onChange(isEnsuite);
                        // Reset totalWashrooms when switching to ensuite
                        if (isEnsuite) {
                          form.setValue('totalWashrooms', 0);
                        }
                      }}
                      value={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="En-Suite" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="true">True</SelectItem>
                        <SelectItem value="false">False</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!form.watch('isEnsuite') && (
                <FormField
                  control={form.control}
                  name="totalWashrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Washrooms</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          min={0}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Pricing Section */}
              <FormField
                control={form.control}
                name="basePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Rate per night"
                        {...field}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weekendPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weekend Price</FormLabel>
                    <FormControl>
                      <Input type="number" 
                      {...field} 
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        field.onChange(value);
                      }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Room Configuration */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="totalFloors"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Floors</FormLabel>
                    <FormControl>
                      <Input type="number" 
                      {...field} 
                      min={0} 
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        field.onChange(value);
                      }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hasUpstairsLounge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Upstairs Lounge</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === 'true')}
                      value={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Has upstairs lounge?" />
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
                name="hasDownstairsLounge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Downstairs Lounge</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === 'true')}
                      value={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Has downstairs lounge?" />
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
            </div>

            {/* Capacity Section */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="maxAdults"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Adults</FormLabel>
                    <FormControl>
                      <Input type="number" 
                      {...field} 
                      min={1}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        field.onChange(value);
                      }}
                       />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxChildren"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Children</FormLabel>
                    <FormControl>
                      <Input 
                      type="number" 
                      {...field} 
                      min={0} 
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        field.onChange(value);
                      }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="totalSleeps"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Sleeps</FormLabel>
                    <FormControl>
                      <Input 
                      type="number" 
                      {...field} 
                      min={1} 
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        field.onChange(value);
                      }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe your chalet" {...field} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end mt-4">
              <Button type="submit" className="h-10 bg-[#27534c] hover:bg-[#1a3733]">
                Next <ChevronRight className="ml-2" />
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
