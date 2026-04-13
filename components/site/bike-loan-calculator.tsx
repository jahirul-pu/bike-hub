"use client"

import React, { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

function formatMoney(value: number) {
  return value.toLocaleString("en-BD", { maximumFractionDigits: 0 })
}

export default function BikeLoanCalculator() {
  const [bikePrice, setBikePrice] = useState<number>(150000)
  const [downType, setDownType] = useState<"percent" | "amount">("percent")
  const [downValue, setDownValue] = useState<number>(10)
  const [interestRate, setInterestRate] = useState<number>(10)
  const [tenureYears, setTenureYears] = useState<number>(3)
  const [loanType, setLoanType] = useState<"bank" | "inHouse">("bank")

  useEffect(() => {
    if (loanType === "bank") setInterestRate(10)
    else setInterestRate(12)
  }, [loanType])

  const derived = useMemo(() => {
    const downAmount =
      downType === "percent"
        ? Math.round((bikePrice * Math.max(0, Math.min(100, downValue))) / 100)
        : Math.max(0, downValue)

    const principal = Math.max(0, bikePrice - downAmount)
    const months = Math.max(1, Math.round(tenureYears * 12))
    const monthlyRate = Math.max(0, interestRate) / 100 / 12

    let emi = 0
    if (principal <= 0) emi = 0
    else if (monthlyRate === 0) emi = principal / months
    else {
      const x = Math.pow(1 + monthlyRate, months)
      emi = (principal * monthlyRate * x) / (x - 1)
    }

    const totalPayment = emi * months
    const totalInterest = Math.max(0, totalPayment - principal)

    const interestPercent = totalPayment > 0 ? (totalInterest / totalPayment) * 100 : 0

    return {
      downAmount,
      principal,
      months,
      emi,
      totalPayment,
      totalInterest,
      interestPercent,
    }
  }, [bikePrice, downType, downValue, interestRate, tenureYears])

  const principalColor = "#0ea5a7"
  const interestColor = "#f97316"

  return (
    <Card className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <CardHeader className="flex items-center justify-between p-0">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Loan Calculator
          </p>
          <CardTitle className="mt-1 text-2xl">Bike Loan EMI</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-slate-50 px-2 py-1 text-sm text-slate-700">
            <label className="mr-2 text-xs text-slate-500">Loan type</label>
            <select
              value={loanType}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setLoanType(e.target.value as "bank" | "inHouse")}
              className="rounded-md border border-input bg-transparent px-2 py-1 text-sm"
            >
              <option value="bank">Standard Bank Loan</option>
              <option value="inHouse">In-House Financing</option>
            </select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:items-start">
        <div className="col-span-2 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase text-slate-500">
                Bike Price
              </label>
              <Input
                type="number"
                value={bikePrice}
                onChange={(e) => setBikePrice(Number(e.target.value || 0))}
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase text-slate-500">
                Down Payment
              </label>
              <div className="flex gap-2">
                <div className="flex items-center gap-2">
                  <div className="inline-flex rounded-lg bg-slate-50 p-1">
                    <button
                      onClick={() => setDownType("percent")}
                      className={`px-3 py-1 text-sm font-semibold rounded-md ${
                        downType === "percent"
                          ? "bg-white shadow-sm"
                          : "text-slate-600"
                      }`}
                    >
                      %
                    </button>
                    <button
                      onClick={() => setDownType("amount")}
                      className={`px-3 py-1 text-sm font-semibold rounded-md ${
                        downType === "amount" ? "bg-white shadow-sm" : "text-slate-600"
                      }`}
                    >
                      ৳
                    </button>
                  </div>
                </div>
                <Input
                  type="number"
                  value={downValue}
                  onChange={(e) => setDownValue(Number(e.target.value || 0))}
                />
              </div>
              <div className="mt-1 text-xs text-slate-400">
                {downType === "percent" ? (
                  <span>
                    = ৳{formatMoney(derived.downAmount)} ({downValue}% of price)
                  </span>
                ) : (
                  <span>= {downValue > 0 ? `৳${formatMoney(downValue)}` : "—"}</span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase text-slate-500">
                Interest Rate (% p.a.)
              </label>
              <Input
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value || 0))}
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase text-slate-500">
                Tenure (Years)
              </label>
              <Input
                type="number"
                value={tenureYears}
                onChange={(e) => setTenureYears(Number(e.target.value || 0))}
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-2 block text-xs font-semibold uppercase text-slate-500">
                Monthly EMI
              </label>
              <div className="flex items-end justify-between gap-3">
                <div className="text-slate-500">Monthly</div>
                <div className="text-right">
                  <div className="text-3xl font-extrabold text-slate-900">
                    ৳{derived.emi ? formatMoney(derived.emi) : "0"}
                  </div>
                  <div className="text-xs text-slate-500">/ month</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-2 grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-xs text-slate-500">Principal</div>
              <div className="mt-1 text-lg font-bold text-slate-900">৳{formatMoney(derived.principal)}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-xs text-slate-500">Total Interest</div>
              <div className="mt-1 text-lg font-bold text-slate-900">৳{formatMoney(derived.totalInterest)}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-xs text-slate-500">Total Payment</div>
              <div className="mt-1 text-lg font-bold text-slate-900">৳{formatMoney(derived.totalPayment)}</div>
            </div>
          </div>
        </div>

        <div className="col-span-1 flex flex-col items-center justify-center gap-4">
          <div
            className="relative flex items-center justify-center rounded-full"
            style={{ width: 220, height: 220 }}
          >
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(${interestColor} 0% ${derived.interestPercent}%, ${principalColor} ${derived.interestPercent}% 100%)`,
              }}
            />
            <div className="absolute inset-6 flex items-center justify-center rounded-full bg-white">
              <div className="text-center">
                <div className="text-sm text-slate-500">Monthly EMI</div>
                <div className="mt-1 text-2xl font-extrabold text-slate-900">৳{formatMoney(derived.emi)}</div>
                <div className="mt-1 text-xs text-slate-500">{derived.months} months</div>
              </div>
            </div>
          </div>

          <div className="w-full space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-sm" style={{ background: principalColor }} />
                <div className="text-sm text-slate-700">Principal</div>
              </div>
              <div className="text-sm font-medium text-slate-900">৳{formatMoney(derived.principal)}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-sm" style={{ background: interestColor }} />
                <div className="text-sm text-slate-700">Interest</div>
              </div>
              <div className="text-sm font-medium text-slate-900">৳{formatMoney(derived.totalInterest)}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
