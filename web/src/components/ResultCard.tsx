import { RncRecord } from '@/lib/dataLoader';
import { Building2, Calendar, FileText, CheckCircle, XCircle } from 'lucide-react';

interface ResultCardProps {
    data: RncRecord;
}

export function ResultCard({ data }: ResultCardProps) {
    const isActive = data.estado === 'Activo' || data.estado === 'ACTIVO';

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                        {data.razonSocial}
                    </h3>
                    {data.nombreComercial && data.nombreComercial !== 'N/A' && (
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                            {data.nombreComercial}
                        </p>
                    )}
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${isActive
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                    {isActive ? <CheckCircle size={14} /> : <XCircle size={14} />}
                    {data.estado || 'Desconocido'}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                    <FileText size={16} className="text-zinc-400" />
                    <span className="font-mono">{data.rnc}</span>
                </div>

                {data.actividadEconomica && (
                    <div className="flex items-start gap-2 text-zinc-600 dark:text-zinc-300 col-span-1 md:col-span-2">
                        <Building2 size={16} className="text-zinc-400 mt-0.5 shrink-0" />
                        <span className="line-clamp-2">{data.actividadEconomica}</span>
                    </div>
                )}

                {data.fechaConstitucion && data.fechaConstitucion !== 'N/A' && (
                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                        <Calendar size={16} className="text-zinc-400" />
                        <span>{data.fechaConstitucion}</span>
                    </div>
                )}

                {data.regimenPagos && (
                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                        <span className="text-xs font-medium px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-500">
                            {data.regimenPagos}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
