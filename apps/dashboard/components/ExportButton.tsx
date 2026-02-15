'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useState } from 'react';

interface ExportButtonProps {
  timeRange: string;
}

export function ExportButton({ timeRange }: ExportButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/export?range=${timeRange}`);
      const blob = await res.blob();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `agentcost-export-${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={loading}>
      <Download className="h-4 w-4 mr-2" />
      {loading ? 'Exporting...' : 'Export CSV'}
    </Button>
  );
}
