import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarIcon, FileText, Mail, Download, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface ReportConfig {
  reportType: 'booking' | 'revenue' | 'occupancy' | 'chalet_performance' | 'customer_analysis';
  dateRange: {
    from: Date;
    to: Date;
  };
  chaletIds: string[];
  includeGraphs: boolean;
  includeDetails: boolean;
  emailRecipients: string[];
  autoSchedule: boolean;
  scheduleFrequency?: 'daily' | 'weekly' | 'monthly';
}

interface ReportGeneratorProps {
  chalets: Array<{ id: string; name: string }>;
  onGenerateReport: (config: ReportConfig) => void;
}

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  chalets,
  onGenerateReport,
}) => {
  const { toast } = useToast();
  const [config, setConfig] = useState<ReportConfig>({
    reportType: 'booking',
    dateRange: {
      from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      to: new Date(),
    },
    chaletIds: [],
    includeGraphs: true,
    includeDetails: true,
    emailRecipients: [],
    autoSchedule: false,
  });
  
  const [emailInput, setEmailInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const reportTypes = [
    { value: 'booking', label: 'Booking Report', description: 'Detailed booking information and statistics' },
    { value: 'revenue', label: 'Revenue Report', description: 'Financial performance and revenue analysis' },
    { value: 'occupancy', label: 'Occupancy Report', description: 'Room occupancy rates and trends' },
    { value: 'chalet_performance', label: 'Chalet Performance', description: 'Individual chalet performance metrics' },
    { value: 'customer_analysis', label: 'Customer Analysis', description: 'Customer behavior and demographics' },
  ];

  const handleChaletSelection = (chaletId: string, checked: boolean) => {
    setConfig(prev => ({
      ...prev,
      chaletIds: checked 
        ? [...prev.chaletIds, chaletId]
        : prev.chaletIds.filter(id => id !== chaletId)
    }));
  };

  const addEmailRecipient = () => {
    if (emailInput.trim() && !config.emailRecipients.includes(emailInput.trim())) {
      setConfig(prev => ({
        ...prev,
        emailRecipients: [...prev.emailRecipients, emailInput.trim()]
      }));
      setEmailInput('');
    }
  };

  const removeEmailRecipient = (email: string) => {
    setConfig(prev => ({
      ...prev,
      emailRecipients: prev.emailRecipients.filter(e => e !== email)
    }));
  };

  const handleGenerateReport = async () => {
    if (config.chaletIds.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No chalets selected',
        description: 'Please select at least one chalet for the report.',
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      await onGenerateReport(config);
      
      toast({
        variant: 'success',
        title: 'Report Generated Successfully',
        description: `${reportTypes.find(t => t.value === config.reportType)?.label} has been generated and will be sent to specified recipients.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Report Generation Failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Generate Detailed Reports
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Report Type Selection */}
        <div>
          <Label>Report Type</Label>
          <Select 
            value={config.reportType} 
            onValueChange={(value: any) => setConfig(prev => ({ ...prev, reportType: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {reportTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  <div>
                    <div className="font-medium">{type.label}</div>
                    <div className="text-sm text-gray-500">{type.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>From Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(config.dateRange.from, 'PPP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={config.dateRange.from}
                  onSelect={(date) => date && setConfig(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, from: date }
                  }))}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label>To Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(config.dateRange.to, 'PPP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={config.dateRange.to}
                  onSelect={(date) => date && setConfig(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, to: date }
                  }))}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Chalet Selection */}
        <div>
          <Label>Select Chalets</Label>
          <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto border rounded p-3">
            <div className="col-span-2 mb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfig(prev => ({
                  ...prev,
                  chaletIds: prev.chaletIds.length === chalets.length ? [] : chalets.map(c => c.id)
                }))}
              >
                {config.chaletIds.length === chalets.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            {chalets.map(chalet => (
              <div key={chalet.id} className="flex items-center space-x-2">
                <Checkbox
                  id={chalet.id}
                  checked={config.chaletIds.includes(chalet.id)}
                  onCheckedChange={(checked) => handleChaletSelection(chalet.id, !!checked)}
                />
                <Label htmlFor={chalet.id} className="text-sm">{chalet.name}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Report Options */}
        <div className="space-y-3">
          <Label>Report Options</Label>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeGraphs"
              checked={config.includeGraphs}
              onCheckedChange={(checked) => setConfig(prev => ({ ...prev, includeGraphs: !!checked }))}
            />
            <Label htmlFor="includeGraphs">Include charts and graphs</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeDetails"
              checked={config.includeDetails}
              onCheckedChange={(checked) => setConfig(prev => ({ ...prev, includeDetails: !!checked }))}
            />
            <Label htmlFor="includeDetails">Include detailed breakdowns</Label>
          </div>
        </div>

        {/* Email Recipients */}
        <div>
          <Label>Email Recipients</Label>
          <div className="flex gap-2 mt-2">
            <Input
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="Enter email address"
              onKeyPress={(e) => e.key === 'Enter' && addEmailRecipient()}
            />
            <Button onClick={addEmailRecipient} variant="outline">
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {config.emailRecipients.map(email => (
              <div key={email} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                <span className="text-sm">{email}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeEmailRecipient(email)}
                  className="h-4 w-4 p-0"
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Auto Schedule */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="autoSchedule"
              checked={config.autoSchedule}
              onCheckedChange={(checked) => setConfig(prev => ({ ...prev, autoSchedule: !!checked }))}
            />
            <Label htmlFor="autoSchedule">Schedule automatic reports</Label>
          </div>
          
          {config.autoSchedule && (
            <Select 
              value={config.scheduleFrequency} 
              onValueChange={(value: any) => setConfig(prev => ({ ...prev, scheduleFrequency: value }))}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Generate Button */}
        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleGenerateReport}
            disabled={isGenerating || config.chaletIds.length === 0}
            className="flex-1 bg-[#27534c] hover:bg-[#1a3733]"
          >
            {isGenerating ? (
              'Generating...'
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Generate & Send Report
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};