'use client';

import { useState } from 'react';
import {
  TrendingUp,
  Award,
  Users,
  Calendar,
  Search,
  Plus,
  ArrowUpRight,
  Target,
  FileText,
  Star,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate } from '@/lib/utils';
import { CreateReviewDialog } from './create-review-dialog';

interface ReviewRow {
  id: string;
  review_period_start: string;
  review_period_end: string;
  score: number;
  notes: string | null;
  created_at: string;
  employee?: {
    id: string;
    first_name: string;
    last_name: string;
    position: string;
    profile_photo_url: string | null;
    office: { name: string } | null
  } | null;
}

export function PerformanceClient({ reviews, employees }: { reviews: ReviewRow[], employees: any[] }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReviews = reviews.filter(r =>
    `${r.employee?.first_name} ${r.employee?.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.employee?.office?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const averageScore = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.score, 0) / reviews.length).toFixed(1)
    : '0';

  const topPerformersCount = reviews.filter(r => r.score >= 4.5).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* ── Summary Stats ─────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm bg-emerald-600 text-white overflow-hidden relative group">
          <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform">
            <TrendingUp size={120} />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest opacity-80">Avg. Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tighter">{averageScore} / 5.0</div>
            <div className="mt-2 h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: `${(Number(averageScore) / 5) * 100}%` }} />
            </div>
            <p className="text-[10px] opacity-70 mt-2 font-medium tracking-wide">Overall organization score</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-card hover:border-emerald-200 transition-all overflow-hidden relative group">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center justify-between">
              Top Performers
              <Award className="h-4 w-4 text-emerald-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tighter text-emerald-600">{topPerformersCount}</div>
            <p className="text-[10px] text-muted-foreground mt-1.5 font-bold uppercase tracking-tighter">Scored 4.5 or above</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-card hover:border-emerald-200 transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tighter">{reviews.length}</div>
            <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-emerald-600">
              <Activity className="h-3.4 w-3.5" />
              <span>Completed cycles</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-card transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Competence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tighter text-violet-600">88%</div>
            <p className="text-[10px] text-muted-foreground mt-1.5 font-bold uppercase tracking-tighter">Skill utilization rate</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Main Operations ─────────────────────── */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card/50 p-4 rounded-2xl border border-muted/50 backdrop-blur-sm shadow-sm">
          <div className="flex-1 w-full max-w-md relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
            <Input
              placeholder="Filter by employee name or office..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 rounded-xl bg-background border-muted text-sm shadow-inner"
            />
          </div>
          <CreateReviewDialog employees={employees} />
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-2xl shadow-emerald-900/5 overflow-hidden ring-1 ring-emerald-500/5 transition-all">
          <Table>
            <TableHeader>
              <TableRow className="bg-emerald-600/5 hover:bg-emerald-600/10 border-b border-emerald-100/50">
                <TableHead className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-emerald-800/70">Employee</TableHead>
                <TableHead className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-emerald-800/70">Review Period</TableHead>
                <TableHead className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-emerald-800/70 text-right">Score</TableHead>
                <TableHead className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-emerald-800/70">Evolution</TableHead>
                <TableHead className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-emerald-800/70">Notes & Feedback</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReviews.map((r) => {
                const scoreColor = r.score >= 4 ? 'text-emerald-600' : r.score >= 3 ? 'text-amber-600' : 'text-rose-600';
                const scoreBg = r.score >= 4 ? 'bg-emerald-50 border-emerald-100' : r.score >= 3 ? 'bg-amber-50 border-amber-100' : 'bg-rose-50 border-rose-100';

                return (
                  <TableRow key={r.id} className="group hover:bg-emerald-50/30 transition-all border-b border-muted/30">
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-emerald-100 ring-2 ring-emerald-50 shadow-sm transition-transform group-hover:scale-105">
                          <AvatarImage src={r.employee?.profile_photo_url || ''} />
                          <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs font-bold uppercase">
                            {r.employee?.first_name[0]}{r.employee?.last_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-sm text-foreground tracking-tight group-hover:text-emerald-700 transition-colors">
                            {r.employee?.first_name} {r.employee?.last_name}
                          </p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                            {r.employee?.office?.name ?? '—'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                          <Calendar className="h-3 w-3 text-emerald-600 opacity-70" />
                          {formatDate(r.review_period_start)} – {formatDate(r.review_period_end)}
                        </div>
                        <p className="text-[10px] text-muted-foreground uppercase opacity-70 tracking-tighter">Review Cycle</p>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="outline" className={`h-8 w-14 flex items-center justify-center font-black text-sm rounded-xl border border-transparent transition-all shadow-sm ${scoreBg} ${scoreColor}`}>
                          {r.score.toFixed(1)}
                        </Badge>
                        <p className="text-[10px] uppercase font-bold tracking-widest opacity-40">of 5.0</p>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="w-24 flex flex-col gap-1.5">
                        <Progress value={(r.score / 5) * 100} className={`h-1.5 w-full ${r.score >= 4 ? '[&>div]:bg-emerald-500' : r.score >= 3 ? '[&>div]:bg-amber-500' : '[&>div]:bg-rose-500'}`} />
                        <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-tight text-muted-foreground/60">
                          <span>Poor</span>
                          <span className={scoreColor}>Master</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 max-w-sm">
                      <div className="flex flex-col gap-1">
                        <p className="text-xs text-muted-foreground italic leading-relaxed line-clamp-2">
                          "{r.notes ?? 'No specific evaluator notes provided.'}"
                        </p>
                        <button className="text-[10px] text-emerald-600 font-bold uppercase hover:underline w-fit opacity-0 group-hover:opacity-100 transition-opacity">
                          Read full feedback <ArrowUpRight className="inline-block h-2.5 w-2.5 ml-0.5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredReviews.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
              <div className="h-20 w-20 bg-muted/20 rounded-full flex items-center justify-center border-2 border-dashed border-muted">
                <FileText className="h-10 w-10 text-muted-foreground opacity-20" />
              </div>
              <div>
                <h3 className="text-lg font-bold">No performance history</h3>
                <p className="text-sm text-muted-foreground">Adjust filters or create a new review cycle to see data.</p>
              </div>
              <Button onClick={() => setSearchQuery('')} variant="outline" className="rounded-xl h-10 border-emerald-100 hover:bg-emerald-50">
                Clear Search
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
