import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReportGenerator } from './reporting/report-generator';
import { VoucherGenerator } from '../add-chalet/voucher-system/voucher-generator';
import { PricingSetup } from '../add-chalet/room-management/pricing-setup';
import { AvailabilityManagement } from '../add-chalet/room-management/availability-management';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartBar as BarChart3, FileText, DollarSign, CalendarX } from 'lucide-react';

const AdminModule = () => {
  // Mock data - replace with actual data from your API
  const mockChalets = [
    { id: '1', name: 'Lakeside Villa' },
    { id: '2', name: 'Mountain Retreat' },
    { id: '3', name: 'Garden Cottage' },
  ];

  const mockBookingData = {
    id: 'BK001',
    chalet: { name: 'Lakeside Villa', amenities: [{ name: 'Wi-Fi' }, { name: 'BBQ' }] },
    customer: { name: 'John Doe', email: 'john@example.com' },
    checkIn: '2024-12-25',
    checkOut: '2024-12-28',
    totalCost: '15000',
  };

  const handleReportGeneration = async (config: any) => {
    // Implementation for report generation
    console.log('Generating report with config:', config);
    // API call would go here
  };

  const handleVoucherGeneration = (voucher: any) => {
    console.log('Voucher generated:', voucher);
  };

  const handlePricingSave = (data: any) => {
    console.log('Pricing saved:', data);
  };

  const handleDatesBlocked = (dates: Date[], reason: string, description: string) => {
    console.log('Dates blocked:', { dates, reason, description });
  };

  const handleDatesUnblocked = (dateIds: string[]) => {
    console.log('Dates unblocked:', dateIds);
  };

  return (
    <div>
      <Helmet>
        <title>Admin Module - Great Rift Lodge</title>
      </Helmet>

      <div className="max-w-screen-2xl w-full pb-10">
        <Card className="border-none drop-shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl text-[#1a3733]">
              Admin Management Module
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="reports" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="reports" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Reports
                </TabsTrigger>
                <TabsTrigger value="vouchers" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Vouchers
                </TabsTrigger>
                <TabsTrigger value="pricing" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Pricing
                </TabsTrigger>
                <TabsTrigger value="availability" className="flex items-center gap-2">
                  <CalendarX className="h-4 w-4" />
                  Availability
                </TabsTrigger>
              </TabsList>

              <TabsContent value="reports" className="mt-6">
                <ReportGenerator
                  chalets={mockChalets}
                  onGenerateReport={handleReportGeneration}
                />
              </TabsContent>

              <TabsContent value="vouchers" className="mt-6">
                <VoucherGenerator
                  bookingData={mockBookingData}
                  onVoucherGenerated={handleVoucherGeneration}
                />
              </TabsContent>

              <TabsContent value="pricing" className="mt-6">
                <PricingSetup
                  chaletId="1"
                  onSave={handlePricingSave}
                />
              </TabsContent>

              <TabsContent value="availability" className="mt-6">
                <AvailabilityManagement
                  chaletId="1"
                  onDatesBlocked={handleDatesBlocked}
                  onDatesUnblocked={handleDatesUnblocked}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminModule;