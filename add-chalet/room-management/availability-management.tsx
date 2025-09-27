import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarX, Wrench, Users, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface BlockedDate {
  id: string;
  date: Date;
  reason: 'maintenance' | 'internal_use' | 'other';
  description: string;
  createdAt: Date;
}

interface AvailabilityManagementProps {
  chaletId: string;
  blockedDates?: BlockedDate[];
  onDatesBlocked: (dates: Date[], reason: string, description: string) => void;
  onDatesUnblocked: (dateIds: string[]) => void;
}

export const AvailabilityManagement: React.FC<AvailabilityManagementProps> = ({
  chaletId,
  blockedDates = [],
  onDatesBlocked,
  onDatesUnblocked,
}) => {
  const { toast } = useToast();
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [blockReason, setBlockReason] = useState<'maintenance' | 'internal_use' | 'other'>('maintenance');
  const [description, setDescription] = useState('');
  const [showBlockForm, setShowBlockForm] = useState(false);

  const handleDateSelect = (dates: Date[] | undefined) => {
    setSelectedDates(dates || []);
  };

  const handleBlockDates = () => {
    if (selectedDates.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No dates selected',
        description: 'Please select dates to block.',
      });
      return;
    }

    if (!description.trim()) {
      toast({
        variant: 'destructive',
        title: 'Description required',
        description: 'Please provide a description for blocking these dates.',
      });
      return;
    }

    onDatesBlocked(selectedDates, blockReason, description);
    
    // Reset form
    setSelectedDates([]);
    setDescription('');
    setShowBlockForm(false);
    
    toast({
      variant: 'success',
      title: 'Dates blocked successfully',
      description: `${selectedDates.length} date(s) have been blocked for ${blockReason.replace('_', ' ')}.`,
    });
  };

  const handleUnblockDates = (dateIds: string[]) => {
    onDatesUnblocked(dateIds);
    toast({
      variant: 'success',
      title: 'Dates unblocked',
      description: 'Selected dates have been made available again.',
    });
  };

  const getReasonIcon = (reason: string) => {
    switch (reason) {
      case 'maintenance':
        return <Wrench className="h-4 w-4" />;
      case 'internal_use':
        return <Users className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'maintenance':
        return 'bg-orange-100 text-orange-800';
      case 'internal_use':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const blockedDateObjects = blockedDates.map(bd => bd.date);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarX className="h-5 w-5" />
            Room Availability Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calendar Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Select Dates to Block</h3>
              <Calendar
                mode="multiple"
                selected={selectedDates}
                onSelect={handleDateSelect}
                disabled={blockedDateObjects}
                modifiers={{
                  blocked: blockedDateObjects,
                }}
                modifiersStyles={{
                  blocked: {
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    textDecoration: 'line-through',
                  },
                }}
                className="rounded-md border"
              />
              
              {selectedDates.length > 0 && (
                <div className="mt-4">
                  <Button
                    onClick={() => setShowBlockForm(true)}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    Block {selectedDates.length} Selected Date(s)
                  </Button>
                </div>
              )}
            </div>

            {/* Blocked Dates List */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Currently Blocked Dates</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {blockedDates.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No dates are currently blocked</p>
                ) : (
                  blockedDates.map((blockedDate) => (
                    <div
                      key={blockedDate.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">
                            {format(blockedDate.date, 'PPP')}
                          </span>
                          <Badge className={`${getReasonColor(blockedDate.reason)} flex items-center gap-1`}>
                            {getReasonIcon(blockedDate.reason)}
                            {blockedDate.reason.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{blockedDate.description}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUnblockDates([blockedDate.id])}
                        className="ml-2"
                      >
                        Unblock
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Block Dates Form Modal */}
      {showBlockForm && (
        <Card>
          <CardHeader>
            <CardTitle>Block Selected Dates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Selected Dates</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedDates.map((date, index) => (
                  <Badge key={index} variant="outline">
                    {format(date, 'MMM dd, yyyy')}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="reason">Reason for Blocking</Label>
              <Select value={blockReason} onValueChange={(value: any) => setBlockReason(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="internal_use">Internal Use</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide details about why these dates are being blocked..."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleBlockDates} className="bg-red-600 hover:bg-red-700">
                Confirm Block
              </Button>
              <Button variant="outline" onClick={() => setShowBlockForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};