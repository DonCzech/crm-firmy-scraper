import { AlertCircle, AlertTriangle } from "lucide-react";

export default function ValidationWarnings({ errors, warnings }: {
  errors: string[];
  warnings: string[];
}) {
  if (errors.length === 0 && warnings.length === 0) return null;

  return (
    <div className="space-y-2">
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span className="text-sm font-semibold text-red-700">Chyby ({errors.length})</span>
          </div>
          <ul className="space-y-1">
            {errors.map((e, i) => (
              <li key={i} className="text-sm text-red-600 flex items-start gap-1.5">
                <span className="mt-1 shrink-0">•</span>
                {e}
              </li>
            ))}
          </ul>
        </div>
      )}
      {warnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="text-sm font-semibold text-amber-700">Upozornění ({warnings.length})</span>
          </div>
          <ul className="space-y-1">
            {warnings.map((w, i) => (
              <li key={i} className="text-sm text-amber-600 flex items-start gap-1.5">
                <span className="mt-1 shrink-0">•</span>
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
