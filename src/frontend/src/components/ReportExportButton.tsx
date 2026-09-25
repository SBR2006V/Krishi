import React, { useState } from 'react';
import type { VillageData } from '../types/disaster';
import { FileText, Loader2, Download } from 'lucide-react';

interface ReportExportButtonProps {
  selectedVillage: VillageData;
  officerName?: string;
}

export const ReportExportButton: React.FC<ReportExportButtonProps> = ({
  selectedVillage,
  officerName = 'Saptarshi Ghosh',
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/reports/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          village: selectedVillage,
          officer_name: officerName,
        }),
      });

      if (!response.ok) {
        throw new Error('PDF Generation request failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const blockName = (selectedVillage.block || selectedVillage.name || 'Hooghly').replace(/\s+/g, '_');
      link.download = `CropSentinel_Report_${blockName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading official disaster report PDF:', error);
      alert('Failed to generate official PDF report. Please ensure the backend server is active.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExportPdf}
      disabled={isExporting}
      className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-extrabold py-3 px-3.5 rounded-xl border border-slate-700/80 shadow-lg transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer active:scale-[0.98]"
    >
      {isExporting ? (
        <>
          <Loader2 className="w-4 h-4 text-rose-500 animate-spin" />
          <span>GENERATING OFFICIAL REPORT PDF...</span>
        </>
      ) : (
        <>
          <FileText className="w-4 h-4 text-rose-500 shrink-0" />
          <span>EXPORT OFFICIAL DISASTER REPORT (PDF)</span>
          <Download className="w-3.5 h-3.5 text-slate-400 ml-auto" />
        </>
      )}
    </button>
  );
};

export default ReportExportButton;
