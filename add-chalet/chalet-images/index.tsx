import React, { Dispatch, SetStateAction } from 'react';
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
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ImageUploader } from './ImageUploader';
import { useChaletContext } from '@/context/use-chalet';
import { ChaletImagessData } from '@/context/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChaletImagesSchema } from '../../types/chalet-schema';

interface ChaletImagesStepProps {
  setCurrentStep: Dispatch<SetStateAction<number>>;
}

export const ChaletImagesStep: React.FC<ChaletImagesStepProps> = ({ setCurrentStep }) => {
  const { updateChaletData, chaletData } = useChaletContext();

  const form = useForm<ChaletImagessData>({
    resolver: zodResolver(ChaletImagesSchema),
    defaultValues: {
      images: chaletData.images || [],
    },
    mode: 'onChange', // Add this to validate on change
  });

  // Add useEffect to trigger validation when images change
  React.useEffect(() => {
    form.trigger('images');
  }, [chaletData.images, form]);

  const onSubmit = (data: ChaletImagessData) => {

    // Update context with form data
    updateChaletData('images', data.images);

    // Move to next step
    setCurrentStep(4);
  };

  return (
    <Card className="w-full max-w-5xl">
      <CardHeader>
        <CardTitle>Chalet Images</CardTitle>
        <CardDescription>Upload images to chalet</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chalet Images (10-15 recommended)</FormLabel>
                  <FormControl>
                    <ImageUploader
                      images={field.value}
                      onImagesChange={(images) => {
                        field.onChange(images);
                        form.trigger('images'); // Trigger validation immediately
                      }}
                      maxImages={15}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => setCurrentStep(2)} type="button">
                <ChevronLeft className="mr-2" /> Back
              </Button>
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
