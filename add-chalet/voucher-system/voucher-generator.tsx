import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { VoucherData, VoucherGenerationRequest } from './voucher-types';
import { FileText, Mail, Save, Download } from 'lucide-react';

interface VoucherGeneratorProps {
  bookingData: any;
  onVoucherGenerated?: (voucher: VoucherData) => void;
}

export const VoucherGenerator: React.FC<VoucherGeneratorProps> = ({
  bookingData,
  onVoucherGenerated,
}) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [voucherOptions, setVoucherOptions] = useState<VoucherGenerationRequest>({
    bookingId: bookingData?.id || '',
    emailToGuest: true,
    emailToHotel: true,
    saveToSystem: true,
  });

  const generateVoucherNumber = (): string => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `VCH-${timestamp}-${random.toString().padStart(3, '0')}`;
  };

  const generateVoucher = async () => {
    setIsGenerating(true);
    
    try {
      const voucherData: VoucherData = {
        voucherNumber: generateVoucherNumber(),
        bookingId: bookingData.id,
        chaletName: bookingData.chalet?.name || '',
        guestName: bookingData.customer?.name || '',
        guestEmail: bookingData.customer?.email || '',
        hotelEmail: 'reservations@greatriftlodge.com',
        checkInTime: '2:00 PM',
        checkOutTime: '11:00 AM',
        checkInDate: bookingData.checkIn,
        checkOutDate: bookingData.checkOut,
        amenities: bookingData.chalet?.amenities?.map((a: any) => a.name) || [],
        selfCateringNotice: 'This booking is made on a SELF-CATERING basis. No meals are included.',
        cancellationPolicy: `Cancellation Policy:
        • 48 hours before check-in: Full refund
        • 24-48 hours before: 50% refund
        • Less than 24 hours: No refund
        • No-show: No refund`,
        refundableFeesPolicy: `Refundable Fees Policy:
        • Security deposit: KES 5,000 (refundable upon checkout)
        • Cleaning fee: KES 2,000 (non-refundable)
        • Damage assessment will be deducted from security deposit`,
        totalCost: parseFloat(bookingData.totalCost || '0'),
        createdAt: new Date(),
      };

      // API call to generate and handle voucher
      const response = await fetch('/api/vouchers/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voucherData,
          options: voucherOptions,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate voucher');

      const result = await response.json();

      toast({
        variant: 'success',
        title: 'Voucher Generated Successfully',
        description: `Voucher ${voucherData.voucherNumber} has been created and processed.`,
      });

      onVoucherGenerated?.(voucherData);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Voucher Generation Failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Generate Confirmation Voucher
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Booking ID</label>
            <Input value={voucherOptions.bookingId} disabled />
          </div>
          <div>
            <label className="text-sm font-medium">Guest Name</label>
            <Input value={bookingData?.customer?.name || ''} disabled />
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium">Voucher Options</h4>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="emailGuest"
              checked={voucherOptions.emailToGuest}
              onCheckedChange={(checked) =>
                setVoucherOptions(prev => ({ ...prev, emailToGuest: !!checked }))
              }
            />
            <label htmlFor="emailGuest" className="text-sm">
              Email voucher to guest
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="emailHotel"
              checked={voucherOptions.emailToHotel}
              onCheckedChange={(checked) =>
                setVoucherOptions(prev => ({ ...prev, emailToHotel: !!checked }))
              }
            />
            <label htmlFor="emailHotel" className="text-sm">
              Email voucher to hotel
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="saveSystem"
              checked={voucherOptions.saveToSystem}
              onCheckedChange={(checked) =>
                setVoucherOptions(prev => ({ ...prev, saveToSystem: !!checked }))
              }
            />
            <label htmlFor="saveSystem" className="text-sm">
              Save voucher to system
            </label>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            onClick={generateVoucher}
            disabled={isGenerating}
            className="flex-1"
          >
            {isGenerating ? (
              'Generating...'
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Generate Voucher
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};