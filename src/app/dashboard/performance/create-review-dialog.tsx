'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Target, Star, Calendar, MessageSquare, ClipboardCheck } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createReview } from '@/app/actions/performance';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  position: string;
}

export function CreateReviewDialog({ employees }: { employees: Employee[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(3.0);
  const { toast } = useToast();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set('score', score.toString());

    const result = await createReview(formData);

    setLoading(false);
    if (result.success) {
      toast({
        title: 'Review submitted',
        description: 'The performance evaluation has been recorded.',
      });
      setOpen(false);
      router.refresh();
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Something went wrong',
        variant: 'destructive',
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 gap-2 h-11 px-8 font-bold">
          <Plus className="h-4 w-4" />
          Create Review
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
        <form onSubmit={handleSubmit}>
          <div className="bg-emerald-600 p-8 text-white relative">
            <div className="absolute right-6 top-6 opacity-20">
              <Target size={100} />
            </div>
            <DialogTitle className="text-2xl font-black tracking-tight mb-2">New Performance Evaluation</DialogTitle>
            <DialogDescription className="text-emerald-50 opacity-80 font-medium">
              Record a comprehensive review for an organization member.
            </DialogDescription>
          </div>

          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Select Employee</Label>
                <Select name="employee_id" required>
                  <SelectTrigger className="h-11 rounded-xl bg-muted/30 border-muted-foreground/10 focus:ring-emerald-500/20">
                    <SelectValue placeholder="Choose staff member..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-2xl">
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.first_name} {emp.last_name} ({emp.position})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between ml-1">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Performance Score</Label>
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none font-black px-2 shadow-none">
                    {score.toFixed(1)} / 5.0
                  </Badge>
                </div>
                <div className="pt-2 px-1">
                  <Slider
                    defaultValue={[3.0]}
                    max={5.0}
                    step={0.1}
                    onValueChange={(val: number[]) => setScore(val[0])}
                    className="cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Cycle Start Date</Label>
                <div className="relative group">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                  <Input name="review_period_start" type="date" required className="h-11 pl-11 rounded-xl bg-muted/30 border-muted-foreground/10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Cycle End Date</Label>
                <div className="relative group">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                  <Input name="review_period_end" type="date" required className="h-11 pl-11 rounded-xl bg-muted/30 border-muted-foreground/10" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 ml-1">
                <MessageSquare className="h-3 w-3 text-emerald-600" />
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Evaluator Notes & Feedback</Label>
              </div>
              <Textarea
                name="notes"
                placeholder="Describe strengths, areas for improvement, and overall impact..."
                className="min-h-[120px] rounded-2xl bg-muted/30 border-muted-foreground/10 focus-visible:ring-emerald-500/20 p-4 leading-relaxed"
              />
            </div>
          </div>

          <DialogFooter className="px-8 pb-8 flex-col sm:flex-row gap-3">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-xl h-12 flex-1 font-bold">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-xl h-12 flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-lg shadow-emerald-500/20 gap-2"
            >
              {loading ? 'Recording...' : (
                <>
                  <ClipboardCheck className="h-4 w-4" />
                  Complete Evaluation
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
