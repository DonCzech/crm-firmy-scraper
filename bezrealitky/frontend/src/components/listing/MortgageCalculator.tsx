'use client';

import { useState } from 'react';
import { formatPrice } from '@/lib/utils';
import { Calculator } from 'lucide-react';

interface Props {
  price: number;
  offerType: string;
}

export function MortgageCalculator({ price, offerType }: Props) {
  const isRent = offerType === 'RENT';

  // Rent mode
  const [income, setIncome] = useState('');

  // Sale mode
  const [downPct, setDownPct] = useState(20);
  const [rate, setRate] = useState(5.5);
  const [years, setYears] = useState(30);

  // Mortgage calculation
  const downPayment = price * (downPct / 100);
  const principal = price - downPayment;
  const monthlyRate = rate / 100 / 12;
  const n = years * 12;
  const monthlyPayment =
    monthlyRate > 0
      ? (principal * (monthlyRate * Math.pow(1 + monthlyRate, n))) / (Math.pow(1 + monthlyRate, n) - 1)
      : principal / n;

  // Rent ratio
  const incomeNum = parseFloat(income) || 0;
  const rentRatio = incomeNum > 0 ? (price / incomeNum) * 100 : null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex items-center gap-2 mb-5">
        <Calculator size={20} className="text-primary-600" />
        <h2 className="text-xl font-bold text-gray-900">
          {isRent ? 'Kalkulačka nájmu' : 'Hypoteční kalkulačka'}
        </h2>
      </div>

      {isRent ? (
        <div className="space-y-4">
          <div className="rounded-xl bg-primary-50 border border-primary-100 p-4 text-center">
            <p className="text-sm text-gray-500 mb-1">Měsíční nájem</p>
            <p className="text-3xl font-black text-primary-700">{formatPrice(price)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Váš čistý měsíční příjem (Kč)
            </label>
            <input
              type="number"
              className="input"
              placeholder="50 000"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
            />
          </div>

          {rentRatio !== null && (
            <div className="rounded-xl border border-gray-200 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Podíl nájmu na příjmu</span>
                <span
                  className={`font-bold ${
                    rentRatio <= 30 ? 'text-green-600' : rentRatio <= 40 ? 'text-yellow-600' : 'text-red-600'
                  }`}
                >
                  {rentRatio.toFixed(1)} %
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all ${
                    rentRatio <= 30 ? 'bg-green-500' : rentRatio <= 40 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(rentRatio, 100)}%` }}
                />
              </div>
              <p
                className={`text-xs font-medium ${
                  rentRatio <= 30 ? 'text-green-600' : rentRatio <= 40 ? 'text-yellow-600' : 'text-red-600'
                }`}
              >
                {rentRatio <= 30
                  ? '✓ Doporučený poměr (do 30 %)'
                  : rentRatio <= 40
                  ? '⚠ Hraniční poměr (30–40 %)'
                  : '✗ Příliš vysoké zatížení (nad 40 %)'}
              </p>
            </div>
          )}

          <div className="text-xs text-gray-400 pt-1">
            Finanční experti doporučují, aby nájem nepřesáhl 30 % čistého měsíčního příjmu.
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="rounded-xl bg-primary-50 border border-primary-100 p-4 text-center">
            <p className="text-sm text-gray-500 mb-1">Odhadovaná měsíční splátka</p>
            <p className="text-3xl font-black text-primary-700">{formatPrice(Math.round(monthlyPayment))}</p>
            <p className="text-xs text-gray-400 mt-1">+ pojištění nemovitosti a ostatní poplatky</p>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <label className="font-medium text-gray-700">Akontace</label>
              <span className="font-bold text-primary-700">
                {downPct} % &nbsp;·&nbsp; {formatPrice(downPayment)}
              </span>
            </div>
            <input
              type="range" min={5} max={80} step={5}
              value={downPct}
              onChange={(e) => setDownPct(Number(e.target.value))}
              className="w-full accent-primary-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <label className="font-medium text-gray-700">Úroková sazba</label>
              <span className="font-bold text-primary-700">{rate.toFixed(1)} %</span>
            </div>
            <input
              type="range" min={1} max={12} step={0.1}
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="w-full accent-primary-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <label className="font-medium text-gray-700">Doba splácení</label>
              <span className="font-bold text-primary-700">{years} let</span>
            </div>
            <input
              type="range" min={5} max={30} step={5}
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full accent-primary-600"
            />
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Cena nemovitosti</span>
              <span className="font-medium text-gray-900">{formatPrice(price)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Akontace ({downPct} %)</span>
              <span className="font-medium text-gray-900">{formatPrice(downPayment)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Výše hypotéky</span>
              <span className="font-medium text-gray-900">{formatPrice(principal)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 font-bold text-gray-900">
              <span>Celkem zaplaceno</span>
              <span>{formatPrice(Math.round(monthlyPayment * n))}</span>
            </div>
          </div>

          <p className="text-xs text-gray-400">
            Výpočet je orientační. Skutečná splátka závisí na podmínkách banky.
          </p>
        </div>
      )}
    </div>
  );
}
