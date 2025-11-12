import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminButton } from '@/components/admin/AdminButton';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { 
  FileText, 
  Download, 
  Calendar as CalendarIcon,
  FileSpreadsheet,
  FileBarChart,
  Clock
} from 'lucide-react';
import { DataTable, Column } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: string;
}

const reportTemplates: ReportTemplate[] = [
  {
    id: 'sales-summary',
    name: 'Sales Summary',
    description: 'Daily, weekly, or monthly sales overview',
    icon: FileBarChart,
    category: 'Financial',
  },
  {
    id: 'menu-performance',
    name: 'Menu Performance',
    description: 'Top-selling items and category analysis',
    icon: FileSpreadsheet,
    category: 'Operations',
  },
  {
    id: 'customer-analytics',
    name: 'Customer Analytics',
    description: 'Customer behavior and satisfaction metrics',
    icon: FileText,
    category: 'Customer',
  },
  {
    id: 'payment-reconciliation',
    name: 'Payment Reconciliation',
    description: 'Transaction details and payment methods',
    icon: FileSpreadsheet,
    category: 'Financial',
  },
  {
    id: 'inventory-report',
    name: 'Inventory Report',
    description: 'Stock levels and consumption patterns',
    icon: FileBarChart,
    category: 'Operations',
  },
  {
    id: 'staff-performance',
    name: 'Staff Performance',
    description: 'Order processing and efficiency metrics',
    icon: FileText,
    category: 'Operations',
  },
];

interface GeneratedReport {
  id: string;
  name: string;
  type: string;
  dateRange: string;
  generatedAt: string;
  status: 'completed' | 'processing' | 'failed';
  size: string;
}

const generatedReports: GeneratedReport[] = [
  {
    id: '1',
    name: 'Sales Summary - June 2024',
    type: 'PDF',
    dateRange: 'Jun 1 - Jun 30, 2024',
    generatedAt: '2024-07-01 09:30 AM',
    status: 'completed',
    size: '2.4 MB',
  },
  {
    id: '2',
    name: 'Menu Performance - Q2 2024',
    type: 'Excel',
    dateRange: 'Apr 1 - Jun 30, 2024',
    generatedAt: '2024-07-01 08:15 AM',
    status: 'completed',
    size: '1.8 MB',
  },
  {
    id: '3',
    name: 'Customer Analytics - May 2024',
    type: 'PDF',
    dateRange: 'May 1 - May 31, 2024',
    generatedAt: '2024-06-01 10:00 AM',
    status: 'completed',
    size: '3.1 MB',
  },
];

export default function Reports() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [reportFormat, setReportFormat] = useState<string>('pdf');
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();

  const reportHistoryColumns: Column<GeneratedReport>[] = [
    { key: 'name', label: 'Report Name', sortable: true },
    { key: 'type', label: 'Format', sortable: true },
    { key: 'dateRange', label: 'Date Range', sortable: true },
    { key: 'generatedAt', label: 'Generated At', sortable: true },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (report) => (
        <Badge
          variant={
            report.status === 'completed'
              ? 'default'
              : report.status === 'processing'
              ? 'secondary'
              : 'destructive'
          }
        >
          {report.status}
        </Badge>
      ),
    },
    { key: 'size', label: 'Size', sortable: true },
    {
      key: 'actions',
      label: 'Actions',
      render: (report) => (
        <AdminButton variant="ghost" size="sm" disabled={report.status !== 'completed'}>
          <Download className="h-4 w-4 mr-2" />
          Download
        </AdminButton>
      ),
    },
  ];

  return (
    <AdminLayout breadcrumbs={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Reports' }]}>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground mt-2">
            Generate and export detailed operational reports.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Report Generator */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Generate New Report</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Report Templates */}
                <div className="space-y-3">
                  <Label>Select Report Template</Label>
                  <div className="grid gap-3 md:grid-cols-2">
                    {reportTemplates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => setSelectedTemplate(template.id)}
                        className={cn(
                          'flex items-start gap-3 p-4 rounded-lg border-2 transition-colors text-left',
                          selectedTemplate === template.id
                            ? 'border-admin-primary bg-admin-primary/5'
                            : 'border-border hover:border-admin-primary/50'
                        )}
                      >
                        <div className="p-2 rounded-lg bg-admin-primary/10">
                          <template.icon className="h-5 w-5 text-admin-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{template.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {template.description}
                          </p>
                          <Badge variant="secondary" className="mt-2 text-xs">
                            {template.category}
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Range */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>From Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <AdminButton
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !dateFrom && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateFrom ? format(dateFrom, 'PPP') : 'Pick a date'}
                        </AdminButton>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dateFrom}
                          onSelect={setDateFrom}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>To Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <AdminButton
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !dateTo && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateTo ? format(dateTo, 'PPP') : 'Pick a date'}
                        </AdminButton>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dateTo}
                          onSelect={setDateTo}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Export Format */}
                <div className="space-y-2">
                  <Label>Export Format</Label>
                  <Select value={reportFormat} onValueChange={setReportFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Document</SelectItem>
                      <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                      <SelectItem value="csv">CSV File</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Generate Button */}
                <AdminButton
                  variant="primary"
                  className="w-full"
                  disabled={!selectedTemplate || !dateFrom || !dateTo}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </AdminButton>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Report Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Reports</span>
                  <span className="text-2xl font-bold">142</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">This Month</span>
                  <span className="text-2xl font-bold">28</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Scheduled</span>
                  <span className="text-2xl font-bold">5</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Scheduled Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg border bg-card">
                    <p className="text-sm font-medium">Weekly Sales Summary</p>
                    <p className="text-xs text-muted-foreground mt-1">Every Monday, 9:00 AM</p>
                  </div>
                  <div className="p-3 rounded-lg border bg-card">
                    <p className="text-sm font-medium">Monthly Performance</p>
                    <p className="text-xs text-muted-foreground mt-1">1st of each month</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Report History */}
        <Card>
          <CardHeader>
            <CardTitle>Report History</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={generatedReports}
              columns={reportHistoryColumns}
              searchPlaceholder="Search reports..."
              pageSize={10}
            />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
