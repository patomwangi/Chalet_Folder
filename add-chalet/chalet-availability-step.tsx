import React from "react";
import { format, isBefore, startOfToday } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useChaletContext } from "@/context/use-chalet";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { AvailabilityFormData, AvailabilitySchema } from "../types/chalet-schema";

interface ChaletAvailabilityStepProps {
  setCurrentStep: (step: number) => void;
}

export const ChaletAvailabilityStep: React.FC<ChaletAvailabilityStepProps> = ({
  setCurrentStep,
}) => {
  const { updateChaletData, chaletData } = useChaletContext();
  const today = startOfToday(); // Gets the current date at the start of the day

  const form = useForm<AvailabilityFormData>({
    resolver: zodResolver(AvailabilitySchema),
    defaultValues: {
      unavailableDates: chaletData.availability?.unavailableDates || [],
    },
  });

  const unavailableDates = form.watch('unavailableDates') || [];

  const handleDayClick = (day: Date) => {
    const currentDates = form.getValues('unavailableDates') || [];
    const isAlreadyUnavailable = currentDates.some(
      (date) => date.toDateString() === day.toDateString()
    );

    const newDates = isAlreadyUnavailable
      ? currentDates.filter((date) => date.toDateString() !== day.toDateString())
      : [...currentDates, day];

    form.setValue('unavailableDates', newDates);
  };

  const quickSelectOptions = [
    {
      label: "Select Weekends",
      handler: () => {
        const weekends = [];
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        for (let day = 1; day <= daysInMonth; day++) {
          const date = new Date(currentYear, currentMonth, day);
          if (
            (date.getDay() === 0 || date.getDay() === 6) &&
            !isBefore(date, today)
          ) {
            weekends.push(date);
          }
        }
        form.setValue('unavailableDates', weekends);
      },
    },
    {
      label: "Clear All",
      handler: () => form.setValue('unavailableDates', []),
    },
  ];

  const onSubmit = (data: AvailabilityFormData) => {
    updateChaletData('availability', {
      ...chaletData.availability,
      unavailableDates: data.unavailableDates || []
    });
    setCurrentStep(5);
  };

  // Disable dates before today
  const disabledDays = [{ from: new Date(1900, 0, 1), to: today }];
  
  return (
    <Card className="w-full max-w-5xl">
    <CardHeader>
      <CardTitle>Chalet Availability</CardTitle>
      <CardDescription>
        Select dates when the chalet will not be available for booking
      </CardDescription>
    </CardHeader>
    <CardContent className="flex flex-col md:flex-row">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex flex-col md:flex-row">
          <FormField
            control={form.control}
            name="unavailableDates"
            render={({ field }) => (
              <FormItem className="w-full md:w-3/4">
                <FormControl>
                  <DayPicker
                    mode="multiple"
                    selected={field.value}
                    onDayClick={handleDayClick}
                    numberOfMonths={2}
                    disabled={disabledDays}
                    modifiers={{
                      selected: field.value || [],
                    }}
                    modifiersStyles={{
                      selected: {
                        backgroundColor: "#27534c",
                        color: "white",
                      },
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="w-full md:w-1/4 ml-4 space-y-2">
            <div className="font-semibold mb-2">Quick Select</div>
            {quickSelectOptions.map((option) => (
              <Button
                key={option.label}
                type="button"
                variant="outline"
                className="w-full"
                onClick={option.handler}
              >
                {option.label}
              </Button>
            ))}
            <div className="mt-4">
              <div className="font-semibold mb-2">Selected Dates:</div>
              <div className="max-h-40 overflow-y-auto">
                {unavailableDates.length > 0 ? (
                  unavailableDates
                    .sort((a, b) => a.getTime() - b.getTime())
                    .map((date) => (
                      <div
                        key={date.toISOString()}
                        className="text-sm text-gray-600"
                      >
                        {format(date, "PP")}
                      </div>
                    ))
                ) : (
                  <div className="text-sm text-gray-400">No dates selected</div>
                )}
              </div>
            </div>
            <div className="flex justify-between mt-4">
              <Button 
                type="button"
                variant="outline" 
                onClick={() => setCurrentStep(3)}
              >
                <ChevronLeft className="mr-2" /> Back
              </Button>
              <Button
                type="submit"
                className="bg-[#27534c] hover:bg-[#1a3733]"
              >
                Next <ChevronRight className="ml-2" />
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </CardContent>
  </Card>
  );
};
