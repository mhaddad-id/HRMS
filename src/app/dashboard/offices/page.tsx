import { getOffices } from '@/app/actions/offices';
import { CreateOfficeDialog } from '@/components/offices/create-office-dialog';
import { OfficesSearch } from '@/components/offices/offices-search';
import { Building2, MapPin, Globe } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default async function OfficesPage() {
  const offices = await getOffices();

  return (
    <div className="flex flex-col gap-6 h-full p-6 bg-muted/30 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl shadow-sm border border-emerald-200/50 dark:border-emerald-800/50">
            <Building2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Offices
            </h1>
            <p className="text-muted-foreground font-medium">Manage company locations and workplace settings</p>
          </div>
        </div>
        <CreateOfficeDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-2xl shadow-sm border-emerald-100/50 hover:border-emerald-200 transition-all group overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
            <Building2 className="h-16 w-16" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Total Offices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold text-foreground tracking-tighter tabular-nums">{offices.length}</div>
            <p className="text-[10px] text-emerald-600 font-bold mt-1 uppercase tracking-tight">Active Locations</p>
          </CardContent>
        </Card>

      </div>

      <div className="flex-1">
        <OfficesSearch offices={offices} />
      </div>
    </div>
  );
}

