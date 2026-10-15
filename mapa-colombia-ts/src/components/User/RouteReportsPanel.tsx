import type { User } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { useRouteReports } from '../../hooks/useRouteReports';
import {
    ROUTE_REPORT_MAX_LENGTH,
    ROUTE_REPORT_TYPES,
    type RouteReport,
    type RouteReportType,
} from '../../interfaces/routeReport';
import { formatCopPrice, formatRelativeDate } from '../../utils/routeReports';
import Button from '../UI/Button';
import { useToast } from '../UI/Toast';

interface RouteReportsPanelProps {
    user: User;
    municipalityId: string;
    departmentId: string;
    municipalityName: string;
}

const typeBadgeClass: Record<RouteReportType, string> = {
    via: 'bg-gold-soft text-gold',
    precio: 'bg-forest-soft text-forest',
    agua: 'bg-clay/10 text-clay',
    otro: 'bg-paper-deep text-ink-soft',
};

const RouteReportsPanel: React.FC<RouteReportsPanelProps> = ({
    user,
    municipalityId,
    departmentId,
    municipalityName,
}) => {
    const { reports, loading, error, submitting, submitReport, resolveReport, canReportType } = useRouteReports(
        municipalityId
    );
    const { showToast } = useToast();

    const [formOpen, setFormOpen] = useState(false);
    const [type, setType] = useState<RouteReportType>('via');
    const [text, setText] = useState('');
    const [price, setPrice] = useState('');
    const [warning, setWarning] = useState<string | null>(null);

    const availableTypes = ROUTE_REPORT_TYPES.filter(info => canReportType(info.id, user.uid));
    const selectedType = ROUTE_REPORT_TYPES.find(info => info.id === type) ?? ROUTE_REPORT_TYPES[0];
    const trimmedText = text.trim();
    const isValid = trimmedText.length >= 10 && availableTypes.some(info => info.id === type);

    const submitWarning = (): string | null => {
        if (availableTypes.length === 0) {
            return 'Ya dejaste un reporte de cada tipo en este municipio esta semana. Vuelve más adelante con novedades.';
        }
        if (!availableTypes.some(info => info.id === type)) {
            return 'Elige un tipo de reporte disponible para este municipio.';
        }
        if (trimmedText.length < 10) {
            return `Describe el reporte con al menos 10 caracteres (llevas ${trimmedText.length}).`;
        }
        return null;
    };

    useEffect(() => {
        if (isValid) setWarning(null);
    }, [isValid]);

    const handleSubmit = async () => {
        const problem = submitWarning();
        if (problem) {
            setWarning(problem);
            return;
        }
        if (submitting) return;
        const ok = await submitReport({
            municipalityId,
            departmentId,
            type,
            text: trimmedText,
            price: type === 'precio' && price ? Number(price) : null,
            userId: user.uid,
            userName: user.displayName ?? 'Viajero',
        });
        if (ok) {
            showToast('Reporte publicado. Gracias por avisar a otros viajeros.', 'success');
            setText('');
            setPrice('');
            setFormOpen(false);
            const next = ROUTE_REPORT_TYPES.find(info => canReportType(info.id, user.uid));
            if (next) setType(next.id);
        } else {
            showToast('No pudimos publicar tu reporte', 'error');
        }
    };

    return (
        <section className="mb-5 rounded-md border border-rule bg-paper-deep/40 p-4">
            <div className="flex items-center gap-3">
                <h4 className="font-display text-[15px] font-semibold text-ink">Estado de la ruta</h4>
                <span className="rule-fill" />
            </div>
            <p className="mt-1.5 text-xs text-ink-faint">
                Avisos de viajeros sobre cómo llegar a {municipalityName}. Vigentes durante 30 días.
            </p>

            {error && <p className="mt-3 text-xs text-clay">{error}</p>}

            {loading ? (
                <p className="mt-3 text-xs text-ink-faint">Cargando reportes…</p>
            ) : reports.length === 0 ? (
                <p className="mt-3 text-xs text-ink-soft">
                    Sin reportes todavía. Si recentlyaste cómo está la vía, los precios o el agua, cuéntaselo a quien vaya después.
                </p>
            ) : (
                <ul className="mt-3 space-y-2">
                    {reports.map(report => (
                        <ReportRow
                            key={report.id}
                            report={report}
                            isOwner={report.createdBy === user.uid}
                            onResolve={() => resolveReport(report.id)}
                        />
                    ))}
                </ul>
            )}

            {formOpen ? (
                <div className="mt-4 border-t border-dashed border-rule pt-4">
                    {availableTypes.length === 0 ? (
                        <p className="text-xs text-ink-soft">
                            Ya dejaste un reporte de cada tipo en este municipio esta semana. Vuelve más adelante con novedades.
                        </p>
                    ) : (
                        <>
                            <div className="flex flex-wrap gap-2">
                                {ROUTE_REPORT_TYPES.map(info => {
                                    const disabled = !canReportType(info.id, user.uid);
                                    const isActive = info.id === type && !disabled;
                                    return (
                                        <button
                                            key={info.id}
                                            type="button"
                                            disabled={disabled}
                                            onClick={() => setType(info.id)}
                                            title={disabled ? 'Ya reportaste esto esta semana' : info.hint}
                                            className={`cursor-pointer rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors ${
                                                isActive
                                                    ? 'border-ink bg-ink text-paper'
                                                    : disabled
                                                      ? 'cursor-not-allowed border-rule bg-paper-deep text-ink-faint opacity-60'
                                                      : 'border-rule bg-panel text-ink-soft hover:bg-paper-deep hover:text-ink'
                                            }`}
                                        >
                                            {info.label}
                                        </button>
                                    );
                                })}
                            </div>

                            <p className="mt-2 text-[11px] text-ink-faint">{selectedType.hint}</p>

                            <textarea
                                value={text}
                                onChange={e => setText(e.target.value.slice(0, ROUTE_REPORT_MAX_LENGTH))}
                                rows={3}
                                placeholder="Ej: la vía paved está destapada desde la entrada del pueblo"
                                className="field mt-3 w-full resize-none"
                            />

                            {type === 'precio' && (
                                <div className="mt-3">
                                    <label htmlFor="route-report-price" className="field-label">
                                        Valor aproximado por entrada (COP)
                                    </label>
                                    <input
                                        id="route-report-price"
                                        type="number"
                                        min={0}
                                        step={500}
                                        value={price}
                                        onChange={e => setPrice(e.target.value)}
                                        placeholder="15000"
                                        className="field mt-1 w-full sm:w-48"
                                    />
                                </div>
                            )}

                            <div className="mt-4 flex items-center gap-3">
                                <Button
                                    variant="primary"
                                    size="sm"
                                    disabled={submitting}
                                    loading={submitting}
                                    onClick={handleSubmit}
                                >
                                    Publicar reporte
                                </Button>
                                <button
                                    type="button"
                                    onClick={() => setFormOpen(false)}
                                    className="cursor-pointer text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-faint hover:text-ink"
                                >
                                    Cancelar
                                </button>
                                <span className="ml-auto text-[11px] tabular-nums text-ink-faint">
                                    {trimmedText.length}/{ROUTE_REPORT_MAX_LENGTH}
                                </span>
                            </div>

                            {warning && (
                                <p
                                    role="alert"
                                    className="mt-3 rounded-md border border-clay/30 bg-clay/10 px-3 py-2 text-xs text-clay"
                                >
                                    {warning}
                                </p>
                            )}
                        </>
                    )}
                </div>
            ) : (
                <div className="mt-4">
                    <Button variant="outline" size="sm" onClick={() => setFormOpen(true)}>
                        Dejar un reporte
                    </Button>
                </div>
            )}
        </section>
    );
};

const ReportRow: React.FC<{ report: RouteReport; isOwner: boolean; onResolve: () => void }> = ({
    report,
    isOwner,
    onResolve,
}) => {
    const typeInfo = ROUTE_REPORT_TYPES.find(info => info.id === report.type);
    return (
        <li className="rounded-md border border-rule bg-panel px-3 py-2.5">
            <div className="flex flex-wrap items-center gap-2">
                <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] ${
                        typeBadgeClass[report.type]
                    }`}
                >
                    {typeInfo?.label ?? report.type}
                </span>
                <span className="text-[11px] text-ink-faint">{formatRelativeDate(report.createdAt)}</span>
                {report.price != null && (
                    <span className="text-[11px] font-semibold tabular-nums text-forest">
                        {formatCopPrice(report.price)}
                    </span>
                )}
            </div>
            <p className="mt-1.5 text-sm text-ink">{report.text}</p>
            <div className="mt-1.5 flex items-center gap-3">
                <span className="text-[11px] text-ink-faint">{report.createdByName}</span>
                {isOwner && (
                    <button
                        type="button"
                        onClick={onResolve}
                        className="cursor-pointer text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-faint hover:text-clay"
                    >
                        Marcar obsoleto
                    </button>
                )}
            </div>
        </li>
    );
};

export default RouteReportsPanel;
