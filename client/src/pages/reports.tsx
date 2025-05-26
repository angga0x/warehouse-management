import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileSpreadsheet, Download, Calendar as CalendarIcon, Filter } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function Reports() {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [reportType, setReportType] = useState<string>("all");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please select both start and end dates",
        variant: "destructive",
      });
      return;
    }

    if (startDate > endDate) {
      toast({
        title: "Error", 
        description: "Start date must be before end date",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        type: reportType,
      });

      const response = await fetch(`/api/reports/excel?${params}`);
      
      if (!response.ok) {
        throw new Error("Failed to generate report");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `stock-report-${format(startDate, "yyyy-MM-dd")}-${format(endDate, "yyyy-MM-dd")}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Report generated and downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const quickDateRanges = [
    {
      label: "7 Hari Terakhir",
      getValue: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 7);
        return { start, end };
      },
    },
    {
      label: "30 Hari Terakhir",
      getValue: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 30);
        return { start, end };
      },
    },
    {
      label: "Bulan Ini",
      getValue: () => {
        const end = new Date();
        const start = new Date(end.getFullYear(), end.getMonth(), 1);
        return { start, end };
      },
    },
    {
      label: "Bulan Lalu",
      getValue: () => {
        const end = new Date();
        end.setDate(0); // Last day of previous month
        const start = new Date(end.getFullYear(), end.getMonth(), 1);
        return { start, end };
      },
    },
  ];

  const setQuickRange = (getValue: () => { start: Date; end: Date }) => {
    const { start, end } = getValue();
    setStartDate(start);
    setEndDate(end);
  };

  return (
    <div className="min-h-full">
      <Sidebar />
      
      <div className="lg:pl-64">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
          <div className="flex flex-col sm:flex-row h-auto sm:h-16 items-start sm:items-center justify-between px-12 sm:px-6 py-4 sm:py-0 gap-3 sm:gap-0">
            <div className="text-center sm:text-left w-full sm:w-auto">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Laporan Excel</h2>
              <p className="text-sm text-gray-500">Generate dan download laporan transaksi dalam format Excel</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <main className="p-3 sm:p-6">
          <div className="max-w-4xl mx-auto">
            {/* Report Generator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileSpreadsheet className="mr-2 h-5 w-5" />
                  Generator Laporan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Quick Date Ranges */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Rentang Cepat</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {quickDateRanges.map((range, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => setQuickRange(range.getValue)}
                        className="text-xs"
                      >
                        {range.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Date Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal Mulai
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "dd/MM/yyyy") : "Pilih tanggal mulai"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal Akhir
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "dd/MM/yyyy") : "Pilih tanggal akhir"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Report Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jenis Laporan
                  </label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis laporan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Transaksi</SelectItem>
                      <SelectItem value="in">Stok Masuk Saja</SelectItem>
                      <SelectItem value="out">Stok Keluar Saja</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Generate Button */}
                <div className="flex justify-center pt-4">
                  <Button
                    onClick={handleGenerateReport}
                    disabled={!startDate || !endDate || isGenerating}
                    className="bg-primary-500 hover:bg-primary-600 px-8"
                  >
                    {isGenerating ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Generate & Download Excel
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Report Info */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="mr-2 h-5 w-5" />
                  Informasi Laporan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Data Yang Termasuk</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Tanggal dan waktu transaksi</li>
                      <li>• Jenis transaksi (masuk/keluar)</li>
                      <li>• Nama produk dan variasi</li>
                      <li>• Jumlah/quantity</li>
                      <li>• Nama user yang melakukan transaksi</li>
                      <li>• Catatan transaksi (jika ada)</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Format Excel</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Format .xlsx (Excel 2007+)</li>
                      <li>• Header dengan formatting</li>
                      <li>• Data terurut berdasarkan tanggal</li>
                      <li>• Auto-width kolom</li>
                      <li>• Siap untuk analisis lebih lanjut</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
