import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const PricingSchema = z.object({
  basePrice: z.number().min(0),
  weekendPrice: z.number().min(0),
  highSeasonEnabled: z.boolean(),
  easterPrice: z.number().min(0).optional(),
  christmasPrice: z.number().min(0).optional(),
  minimumNightsEaster: z.number().min(1).optional(),
  minimumNightsChristmas: z.number().min(1).optional(),
  easterStartDate: z.date().optional(),
  easterEndDate: z.date().optional(),
  christmasStartDate: z.date().optional(),
  christmasEndDate: z.date().optional(),
});

type PricingFormData = z.infer<typeof PricingSchema>;

interface PricingSetupProps {
  chaletId: string;
  initialData?: Partial<PricingFormData>;
  onSave: (data: PricingFormData) => void;
}

export const PricingSetup: React.FC<PricingSetupProps> = ({
  chaletId,
  initialData,
  onSave,
}) => {
  const [showEasterCalendar, setShowEasterCalendar] = useState(false);
  const [showChristmasCalendar, setShowChristmasCalendar] = useState(false);

  const form = useForm<PricingFormData>({
    resolver: zodResolver(PricingSchema),
    defaultValues: {
      basePrice: initialData?.basePrice || 0,
      weekendPrice: initialData?.weekendPrice || 0,
      highSeasonEnabled: initialData?.highSeasonEnabled || false,
      easterPrice: initialData?.easterPrice || 0,
      christmasPrice: initialData?.christmasPrice || 0,
      minimumNightsEaster: initialData?.minimumNightsEaster || 2,
      minimumNightsChristmas: initialData?.minimumNightsChristmas || 3,
      // Default Christmas season: Dec 22 - Jan 2
      christmasStartDate: initialData?.christmasStartDate || new Date(new Date().getFullYear(), 11, 22),
      christmasEndDate: initialData?.christmasEndDate || new Date(new Date().getFullYear() + 1, 0, 2),
    },
  });

  const highSeasonEnabled = form.watch('highSeasonEnabled');

  const handleSubmit = (data: PricingFormData) => {
    onSave(data);
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Room Pricing Setup
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Base Pricing */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="basePrice">Base Price (KES)</Label>
              <Input
                id="basePrice"
                type="number"
                {...form.register('basePrice', { valueAsNumber: true })}
                placeholder="Enter base price"
              />
            </div>
            <div>
              <Label htmlFor="weekendPrice">Weekend Price (KES)</Label>
              <Input
                id="weekendPrice"
                type="number"
                {...form.register('weekendPrice', { valueAsNumber: true })}
                placeholder="Enter weekend price"
              />
            </div>
          </div>

          {/* High Season Toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="highSeason"
              checked={highSeasonEnabled}
              onCheckedChange={(checked) => form.setValue('highSeasonEnabled', checked)}
            />
            <Label htmlFor="highSeason">Enable High Season Pricing</Label>
          </div>

          {/* High Season Settings */}
          {highSeasonEnabled && (
            <div className="space-y-6 p-4 border rounded-lg bg-gray-50">
              <h3 className="text-lg font-semibold">High Season Configuration</h3>
              
              {/* Easter Season */}
              <div className="space-y-4">
                <h4 className="font-medium text-orange-600">Easter Holiday Season</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="easterPrice">Easter Price (KES)</Label>
                    <Input
                      id="easterPrice"
                      type="number"
                      {...form.register('easterPrice', { valueAsNumber: true })}
                      placeholder="Enter Easter season price"
                    />
                  </div>
                  <div>
                    <Label htmlFor="minimumNightsEaster">Minimum Nights (Easter)</Label>
                    <Input
                      id="minimumNightsEaster"
                      type="number"
                      {...form.register('minimumNightsEaster', { valueAsNumber: true })}
                      placeholder="Minimum nights"
                      min="1"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Easter Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {form.watch('easterStartDate') 
                            ? format(form.watch('easterStartDate')!, 'PPP')
                            : 'Select start date'
                          }
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={form.watch('easterStartDate')}
                          onSelect={(date) => form.setValue('easterStartDate', date)}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label>Easter End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {form.watch('easterEndDate')
                            ? format(form.watch('easterEndDate')!, 'PPP')
                            : 'Select end date'
                          }
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={form.watch('easterEndDate')}
                          onSelect={(date) => form.setValue('easterEndDate', date)}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              {/* Christmas Season */}
              <div className="space-y-4">
                <h4 className="font-medium text-red-600">Christmas Holiday Season (Dec 22 - Jan 2)</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="christmasPrice">Christmas Price (KES)</Label>
                    <Input
                      id="christmasPrice"
                      type="number"
                      {...form.register('christmasPrice', { valueAsNumber: true })}
                      placeholder="Enter Christmas season price"
                    />
                  </div>
                  <div>
                    <Label htmlFor="minimumNightsChristmas">Minimum Nights (Christmas)</Label>
                    <Input
                      id="minimumNightsChristmas"
                      type="number"
                      {...form.register('minimumNightsChristmas', { valueAsNumber: true })}
                      placeholder="Minimum nights"
                      min="1"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Christmas Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {form.watch('christmasStartDate')
                            ? format(form.watch('christmasStartDate')!, 'PPP')
                            : 'Dec 22'
                          }
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={form.watch('christmasStartDate')}
                          onSelect={(date) => form.setValue('christmasStartDate', date)}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label>Christmas End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {form.watch('christmasEndDate')
                            ? format(form.watch('christmasEndDate')!, 'PPP')
                            : 'Jan 2'
                          }
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={form.watch('christmasEndDate')}
                          onSelect={(date) => form.setValue('christmasEndDate', date)}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button type="submit" className="bg-[#27534c] hover:bg-[#1a3733]">
              Save Pricing Configuration
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};