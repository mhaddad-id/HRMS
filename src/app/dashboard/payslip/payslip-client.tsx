'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Printer,
  Search,
  Calendar,
  ChevronRight,
  User,
  FileText,
  DollarSign,
  Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MonthPicker } from '@/components/ui/month-picker';
import { formatMoney, cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface PayrollRow {
  id: string;
  employee_code?: string;
  name: string;
  position: string;
  worked_days: number;
  lwp: number;
  deduction: number;
  salary: number;
  currency: string;
  amount: number;
  office_name: string;
}

import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function PayslipClient({
  allPayrolls,
  employeesList,
  isAdminOrHR,
  currentMonth,
  initialEmployeeId,
  currentUserEmployeeId
}: {
  allPayrolls: PayrollRow[];
  employeesList: { id: string, first_name: string, last_name: string, position: string }[];
  isAdminOrHR: boolean;
  currentMonth: string;
  initialEmployeeId?: string;
  currentUserEmployeeId?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(initialEmployeeId || null);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedPayroll = allPayrolls.find(p => p.id === selectedEmployeeId);

  const filteredEmployees = employeesList.filter(emp =>
    `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMonthChange = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val) {
      params.set('month', val);
    } else {
      params.delete('month');
    }
    router.push(`?${params.toString()}`);
  };

  const handleEmployeeChange = (empId: string) => {
    setSelectedEmployeeId(empId);
    const params = new URLSearchParams(searchParams.toString());
    params.set('employeeId', empId);
    router.push(`?${params.toString()}`);
  };

  const handlePrint = () => {
    if (!selectedPayroll) return;

    const [y, m] = currentMonth.split('-');
    const monthName = new Date(Number(y), Number(m) - 1).toLocaleString('default', { month: 'long', year: 'numeric' });

    const printContent = `
          <html>
            <head>
              <title>Payslip - ${selectedPayroll.name} - ${monthName}</title>
              <link rel="preconnect" href="https://fonts.googleapis.com">
              <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
              <style>
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          
                :root {
                  --ink: #0f0f0f;
                  --ink-mid: #4a4a4a;
                  --ink-light: #8a8a8a;
                  --rule: #d8d5cf;
                  --accent: #1a3a2a;
                  --accent-dark: #0d1f16;
                  --accent-light: #e8f0eb;
                  --paper: #faf9f7;
                  --white: #ffffff;
                  --danger-light: #fff4f2;
                  --danger: #c0392b;
                }
          
                body {
                  font-family: 'DM Sans', sans-serif;
                  background: var(--paper);
                  color: var(--ink);
                  padding: 80px 100px;
                  font-size: 14px;
                  line-height: 1.6;
                  min-height: 100vh;
                }
          
                .payroll-card {
                  background: var(--white);
                  max-width: 800px;
                  margin: 0 auto;
                  box-shadow: 0 40px 100px -20px rgba(0,0,0,0.1);
                  border: 1px solid var(--rule);
                  border-radius: 8px;
                  overflow: hidden;
                }

                .header {
                  padding: 48px;
                  background: var(--accent);
                  color: #e8f0eb;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                }

                .header-logo {
                  display: flex;
                  align-items: center;
                  gap: 16px;
                }
          
                .logo-section h1 {
                  font-family: 'DM Serif Display', serif;
                  font-size: 32px;
                  letter-spacing: -0.02em;
                  margin-bottom: 2px;
                  line-height: 1;
                }

                .logo-section p {
                  font-family: 'DM Mono', monospace;
                  font-size: 10px;
                  letter-spacing: 0.25em;
                  text-transform: uppercase;
                  opacity: 0.6;
                }

                .period-badge {
                  background: rgba(255,255,255,0.1);
                  padding: 10px 20px;
                  border-radius: 6px;
                  font-weight: 600;
                  font-size: 13px;
                  border: 1px solid rgba(255,255,255,0.1);
                }

                .body {
                  padding: 48px;
                }

                .employee-info {
                  display: grid;
                  grid-template-columns: 1fr 1fr 1fr;
                  gap: 30px;
                  margin-bottom: 48px;
                  padding-bottom: 32px;
                  border-bottom: 1.5px solid var(--rule);
                }

                .info-group label {
                  display: block;
                  font-size: 10px;
                  font-weight: 700;
                  text-transform: uppercase;
                  letter-spacing: 0.15em;
                  color: var(--ink-light);
                  margin-bottom: 8px;
                }

                .info-group p {
                  font-size: 18px;
                  font-weight: 500;
                  color: var(--ink);
                }

                .section-title {
                  font-size: 11px;
                  font-weight: 700;
                  text-transform: uppercase;
                  letter-spacing: 0.2em;
                  color: var(--ink-mid);
                  margin-bottom: 24px;
                  display: flex;
                  align-items: center;
                  gap: 12px;
                }

                .section-title::after {
                  content: '';
                  flex: 1;
                  height: 1px;
                  background: var(--rule);
                }

                .earnings-table {
                  width: 100%;
                  margin-bottom: 48px;
                }

                .row {
                  display: flex;
                  justify-content: space-between;
                  padding: 14px 0;
                }

                .row.line {
                  border-bottom: 1px solid #efeee9;
                }

                .val {
                  font-family: 'DM Mono', monospace;
                  font-weight: 500;
                }

                .deduction {
                  color: var(--danger);
                }

                .total-box {
                  margin-top: 24px;
                  background: var(--accent-light);
                  padding: 32px;
                  border-radius: 6px;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  border: 1px solid var(--accent);
                }

                .total-label {
                  font-size: 12px;
                  font-weight: 700;
                  text-transform: uppercase;
                  letter-spacing: 0.1em;
                  color: var(--accent);
                }

                .total-amount {
                  font-size: 32px;
                  font-weight: 600;
                  color: var(--accent);
                  font-family: 'DM Serif Display', serif;
                }

                .signature-section {
                  margin-top: 64px;
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 80px;
                }

                .sig-box {
                  text-align: center;
                }

                .sig-line {
                  border-top: 1.5px solid var(--ink);
                  margin-bottom: 12px;
                  height: 60px;
                }

                .sig-label {
                  font-size: 10px;
                  font-weight: 700;
                  text-transform: uppercase;
                  letter-spacing: 0.15em;
                  color: var(--ink-mid);
                }

                .footer {
                  margin-top: 60px;
                  font-size: 11px;
                  color: var(--ink-light);
                  text-align: center;
                  border-top: 1px solid var(--rule);
                  padding-top: 24px;
                }

                @media print {
                  body { padding: 40px; background: white; }
                  .payroll-card { box-shadow: none; border: none; }
                }
              </style>
            </head>
            <body>
              <div class="payroll-card">
                <div class="header">
                  <div class="header-logo">
                    <svg width="48" height="48" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="40" height="40" rx="12" fill="white" fill-opacity="0.15" />
                      <circle cx="20" cy="13" r="4.5" fill="white" />
                      <path d="M13 26C13 23.2386 15.2386 21 18 21H22C24.7614 21 27 23.2386 27 26V29H13V26Z" fill="white" />
                      <circle cx="10" cy="19" r="3" fill="white" fill-opacity="0.75" />
                      <path d="M5 26.5C5 25.1193 6.11929 24 7.5 24H12.5C13.8807 24 15 25.1193 15 26.5V29H5V26.5Z" fill="white" fill-opacity="0.75" />
                      <circle cx="30" cy="19" r="3" fill="white" fill-opacity="0.75" />
                      <path d="M25 26.5C25 25.1193 26.1193 24 27.5 24H32.5C33.8807 24 35 25.1193 35 26.5V29H25V26.5Z" fill="white" fill-opacity="0.75" />
                    </svg>
                    <div class="logo-section">
                      <h1>HRMS</h1>
                      <p>Payslip Statement</p>
                    </div>
                  </div>
                  <div class="period-badge">
                    ${monthName}
                  </div>
                </div>

                <div class="body">
                  <div class="employee-info">
                    <div class="info-group">
                      <label>Employee Profile</label>
                      <p>${selectedPayroll.name}</p>
                    </div>
                    <div class="info-group">
                      <label>Employee Code</label>
                      <p style="font-family: 'DM Mono', monospace; font-weight: 600;">#${selectedPayroll.employee_code || selectedPayroll.id.slice(0, 6).toUpperCase()}</p>
                    </div>
                    <div class="info-group">
                      <label>Position</label>
                      <p>${selectedPayroll.position}</p>
                    </div>
                  </div>

                  <div class="section-title">Earnings Summary</div>
                  <div class="earnings-table">
                    <div class="row line">
                      <span>Base Salary (${selectedPayroll.currency})</span>
                      <span class="val">${formatMoney(selectedPayroll.salary, selectedPayroll.currency)}</span>
                    </div>
                    <div class="row line">
                      <span>Worked Days</span>
                      <span class="val" style="color: #166534;">${selectedPayroll.worked_days} Days</span>
                    </div>
                  </div>

                  <div class="section-title">Adjustments & Deductions</div>
                  <div class="earnings-table">
                    <div class="row line">
                      <span>Unpaid Leaves (LWP)</span>
                      <span class="val ${selectedPayroll.lwp > 0 ? 'deduction' : ''}">${selectedPayroll.lwp} Days</span>
                    </div>
                    <div class="row line">
                      <span>Salary Deductions</span>
                      <span class="val deduction">${selectedPayroll.deduction > 0 ? `-${formatMoney(selectedPayroll.deduction, selectedPayroll.currency)}` : '—'}</span>
                    </div>
                  </div>

                  <div class="total-box">
                    <div class="total-label">Net Payable Amount (${selectedPayroll.currency})</div>
                    <div class="total-amount">${formatMoney(selectedPayroll.amount, selectedPayroll.currency)}</div>
                  </div>

                  <div class="signature-section">
                    <div class="sig-box">
                      <div class="sig-line"></div>
                      <div class="sig-label">Employee Signature</div>
                    </div>
                    <div class="sig-box">
                      <div class="sig-line"></div>
                      <div class="sig-label">Finance Department</div>
                    </div>
                  </div>

                  <div class="footer">
                    This document is systematically generated and verified &bull; ${new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>
            </body>
          </html>
        `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar Controls */}
      <div className="w-full lg:w-[320px] space-y-6">
        <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm overflow-hidden border border-emerald-100/50">
          <CardHeader className="pb-3 border-b border-muted/30">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">Select Period</label>
              <MonthPicker
                value={currentMonth}
                onValueChangeAction={handleMonthChange}
              />
            </div>

            {isAdminOrHR && (
              <div className="space-y-4 pt-4 border-t border-muted/30">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">Find Employee</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Name or role..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-11 rounded-xl bg-background border-muted text-sm shadow-inner"
                    />
                  </div>
                </div>

                <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar space-y-1">
                  {filteredEmployees.map(emp => (
                    <button
                      key={emp.id}
                      onClick={() => handleEmployeeChange(emp.id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-xl transition-all border text-left",
                        selectedEmployeeId === emp.id
                          ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                          : "bg-background/40 border-transparent hover:border-emerald-200 hover:bg-emerald-50/50 text-foreground"
                      )}
                    >
                      <Avatar className={cn(
                        "h-10 w-10 border",
                        selectedEmployeeId === emp.id ? "border-emerald-400" : "border-emerald-100"
                      )}>
                        <AvatarFallback className={cn(
                          "text-xs font-bold",
                          selectedEmployeeId === emp.id ? "bg-emerald-700 text-white" : "bg-emerald-50 text-emerald-700"
                        )}>
                          {emp.first_name[0]}{emp.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 overflow-hidden">
                        <p className={cn(
                          "text-sm font-bold truncate",
                          selectedEmployeeId === emp.id ? "text-white" : "text-foreground"
                        )}>
                          {emp.first_name} {emp.last_name}
                        </p>
                        <p className={cn(
                          "text-[10px] truncate",
                          selectedEmployeeId === emp.id ? "text-emerald-100/80" : "text-muted-foreground"
                        )}>
                          {emp.position}
                        </p>
                      </div>
                      {selectedEmployeeId === emp.id && <ChevronRight className="h-4 w-4 shrink-0 opacity-50" />}
                    </button>
                  ))}
                  {filteredEmployees.length === 0 && (
                    <div className="py-8 text-center text-muted-foreground space-y-2">
                      <Search className="h-8 w-8 mx-auto opacity-10" />
                      <p className="text-xs">No employees found.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Payslip View */}
      <div className="flex-1 min-w-0">
        {selectedPayroll ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Action Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/20 p-4 rounded-2xl border border-muted/50">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Currently Viewing</p>
                  <h2 className="text-lg font-bold">{selectedPayroll.name}'s Payslip</h2>
                </div>
              </div>
              <Button
                onClick={handlePrint}
                className="w-full sm:w-auto rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 gap-2 h-11 px-8 font-bold"
              >
                <Printer className="h-4 w-4" />
                Print Payslip
              </Button>
            </div>

            {/* On-screen Payslip Visualization */}
            <div className="bg-card rounded-3xl border border-border shadow-2xl shadow-emerald-900/5 overflow-hidden ring-1 ring-emerald-500/5">
              {/* Premium Header Decoration */}
              <div className="h-40 bg-gradient-to-br from-emerald-500 via-emerald-700 to-emerald-900 p-8 flex justify-between items-start relative overflow-hidden text-white">
                <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl animate-pulse" />
                <div className="relative z-10">
                  <Badge className="bg-white/20 hover:bg-white/30 text-white border-transparent mb-4 backdrop-blur-md px-3 py-1 font-mono text-[15px] uppercase tracking-widest leading-none">
                    PAYSLIP ID: {selectedPayroll.id.slice(0, 8).toUpperCase()}
                  </Badge>
                  <h2 className="text-4xl font-black tracking-tighter sm:text-5xl">STATEMENT</h2>
                  <p className="text-emerald-100/70 text-sm font-medium tracking-wide uppercase mt-1">
                    Period: {new Date(Number(currentMonth.split('-')[0]), Number(currentMonth.split('-')[1]) - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="relative z-10 text-right">
                  <FileText size={64} className="opacity-20 ml-auto" />
                </div>
              </div>

              <CardContent className="p-8 md:p-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        <User className="h-3 w-3" />
                        Employee Details
                      </div>
                      <div className="space-y-1 pl-1 border-l-2 border-emerald-500/20 ml-1">
                        <div className="flex items-center gap-3">
                          <p className="text-2xl font-bold tracking-tight">{selectedPayroll.name}</p>
                          <Badge variant="outline" className="font-mono text-[12px] bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300">
                            #{selectedPayroll.employee_code || selectedPayroll.id.slice(0, 6).toUpperCase()}
                          </Badge>

                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1.5 font-medium">
                          <Briefcase className="h-4 w-4 opacity-50" />
                          {selectedPayroll.position} &bull; {selectedPayroll.office_name}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 bg-muted/20 p-6 rounded-2xl border border-muted/50">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Worked Days</p>
                        <p className="text-xl font-bold">{selectedPayroll.worked_days}d</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Unpaid Leave</p>
                        <p className={cn(
                          "text-xl font-bold",
                          selectedPayroll.lwp > 0 ? "text-destructive" : "text-emerald-600"
                        )}>
                          {selectedPayroll.lwp}d
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        <DollarSign className="h-3 w-3" />
                        Financial Summary
                      </div>

                      <div className="space-y-4">
                        <Table className="border-none">
                          <TableBody>
                            <TableRow className="border-b border-muted/50 hover:bg-transparent">
                              <TableCell className="px-0 py-3 text-sm font-medium text-muted-foreground">Base Salary</TableCell>
                              <TableCell className="px-0 py-3 text-right text-lg font-bold">{formatMoney(selectedPayroll.salary, selectedPayroll.currency)}</TableCell>
                            </TableRow>
                            <TableRow className="border-b border-muted/50 hover:bg-transparent">
                              <TableCell className="px-0 py-3 text-sm font-medium text-muted-foreground">Adjustments / LWP</TableCell>
                              <TableCell className={cn(
                                "px-0 py-3 text-right text-lg font-bold",
                                selectedPayroll.lwp > 0 ? "text-destructive" : "text-emerald-600"
                              )}>
                                {selectedPayroll.lwp > 0 ? `-${formatMoney(selectedPayroll.deduction, selectedPayroll.currency)}` : '0.00'}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>

                        <div className="pt-4">
                          <div className="p-6 bg-emerald-600/5 rounded-2xl ring-1 ring-emerald-600/10 flex justify-between items-center group">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-800/60 mb-1 group-hover:text-emerald-800 transition-colors">Total Net Payable</p>
                              <p className="text-3xl font-black text-emerald-700 tracking-tighter">
                                {formatMoney(selectedPayroll.amount, selectedPayroll.currency)}
                              </p>
                            </div>
                            <div className="h-12 w-12 bg-white rounded-xl shadow-sm border border-emerald-100 flex items-center justify-center">
                              <Badge variant="outline" className="text-emerald-700 border-emerald-200 font-bold px-2 py-0 bg-emerald-50">
                                {selectedPayroll.currency}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-12 grid grid-cols-2 gap-8 border-t border-dashed border-muted pt-12">
                  <div className="text-center space-y-3">
                    <div className="h-12 border-b border-foreground/20 italic text-muted-foreground/30 flex items-end justify-center pb-1 text-[10px] uppercase tracking-tighter">Sign Here</div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Employee Signature</p>
                  </div>
                  <div className="text-center space-y-3">
                    <div className="h-12 border-b border-foreground/20 italic text-muted-foreground/30 flex items-end justify-center pb-1 text-[10px] uppercase tracking-tighter">Authorized Seal</div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Finance Department</p>
                  </div>
                </div>

                <Separator className="my-8 bg-muted/50" />

                <div className="mt-8 pt-0 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">This statement is systematically generated and verified by the HR Management System.</p>
                </div>
              </CardContent>
            </div>
          </div>
        ) : (
          <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-muted/10 rounded-3xl border-2 border-dashed border-muted/50 text-center p-8">
            <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mb-6">
              <FileText className="h-10 w-10 text-muted-foreground opacity-30" />
            </div>
            <h3 className="text-xl font-bold text-foreground">No Employee Selected</h3>
            <p className="text-sm text-muted-foreground max-w-[280px] mt-2">
              {isAdminOrHR
                ? "Please search and select an employee from the sidebar to view their detailed payslip."
                : "No payslip data available for the selected period."}
            </p>
            {isAdminOrHR && (
              <div className="mt-8 flex flex-col items-center gap-4">
                <div className="flex -space-x-3 overflow-hidden">
                  {employeesList.slice(0, 5).map((emp, i) => (
                    <Avatar key={i} className="inline-block h-10 w-10 ring-4 ring-background border border-emerald-100">
                      <AvatarFallback className="text-[10px] font-bold bg-emerald-50 text-emerald-700 uppercase">{emp.first_name[0]}{emp.last_name[0]}</AvatarFallback>
                    </Avatar>
                  ))}
                  {employeesList.length > 5 && (
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700 ring-4 ring-background">
                      +{employeesList.length - 5}
                    </div>
                  )}
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700/60">Ready to visualize {employeesList.length} staff documents</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

