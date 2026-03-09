import { getOffices } from '@/app/actions/offices';
import { CreateOfficeDialog } from '@/components/offices/create-office-dialog';
import { EditOfficeDialog } from '@/components/offices/edit-office-dialog';
import { DeleteOfficeButton } from '@/components/offices/delete-office-button';
import { OfficePermissions } from '@/components/offices/office-permissions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, MapPin, Clock } from 'lucide-react';

export default async function OfficesPage() {
  const offices = await getOffices();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Offices</h2>
          <p className="text-muted-foreground">
            Manage your company locations, working hours, and office-level permissions.
          </p>
        </div>
        <CreateOfficeDialog />
      </div>

      <Card className="border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/30 pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Building className="w-5 h-5 text-primary" />
            Office Locations
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent text-muted-foreground/70 uppercase text-[11px] tracking-wider font-bold">
                <TableHead className="pl-6 h-12">Office Name</TableHead>
                <TableHead className="h-12">Working Hours</TableHead>
                <TableHead className="h-12">Address</TableHead>
                <TableHead className="text-right pr-6 h-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offices.map((office) => (
                <TableRow key={office.id} className="group hover:bg-muted/30 transition-colors">
                  <TableCell className="font-semibold pl-6 py-4">{office.name}</TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      {office.working_hours_start?.slice(0, 5) || '09:00'} - {office.working_hours_end?.slice(0, 5) || '17:00'}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-start gap-2 text-sm text-muted-foreground max-w-[300px] truncate">
                      <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      {office.address || 'No address provided'}
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <OfficePermissions office={office} />
                      <EditOfficeDialog office={office} />
                      <DeleteOfficeButton id={office.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {offices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <Building className="w-8 h-8 opacity-20" />
                      <p>No offices found. Create one to get started.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
