import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

// Wraps an SVG map (defined in its own viewBox units) with pan + zoom:
// - one-finger / mouse drag to pan
// - pinch (touch) or wheel / trackpad scroll to zoom
// - on-screen zoom buttons
// The container uses touch-action: none so mobile gestures zoom the map
// instead of the whole page.
//
// NOTE: we must NOT use setPointerCapture here: with capture active, the
// browser retargets compatibility click events to the capturing element, so
// department/municipality onClick handlers would never fire. Instead all
// pointermove/up are tracked on window and clicks after a real drag are
// suppressed via a capture-phase click listener.

const MIN_SCALE = 1;
const MAX_SCALE = 15;
const DRAG_THRESHOLD = 5;

interface Transform {
    x: number;
    y: number;
    k: number;
}

interface MapPanZoomProps {
    viewBox?: string;
    className?: string;
    children: ReactNode;
}

const MapPanZoom: React.FC<MapPanZoomProps> = ({ viewBox = '0 0 1000 1000', className = '', children }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, k: 1 });
    const [isPanning, setIsPanning] = useState(false);

    const parts = viewBox.split(/\s+/).map(Number);
    const vw = parts[2] || 1000;
    const vh = parts[3] || 1000;

    const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
    const lastMidRef = useRef<{ x: number; y: number } | null>(null);
    const lastDistRef = useRef(0);
    const movedRef = useRef(0);
    const suppressClickRef = useRef(false);

    const clampPan = useCallback((x: number, y: number, k: number): Transform => {
        const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, k));
        const px = Math.min(0, Math.max(vw * (1 - scale), x));
        const py = Math.min(0, Math.max(vh * (1 - scale), y));
        return { x: px, y: py, k: scale };
    }, [vw, vh]);

    const toViewBox = useCallback((clientX: number, clientY: number) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect || rect.width === 0 || rect.height === 0) return { x: 0, y: 0 };
        return {
            x: (clientX - rect.left) * (vw / rect.width),
            y: (clientY - rect.top) * (vh / rect.height)
        };
    }, [vw, vh]);

    const zoomAt = useCallback((vx: number, vy: number, factor: number) => {
        setTransform(prev => {
            const k = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev.k * factor));
            const ratio = k / prev.k;
            const x = vx - (vx - prev.x) * ratio;
            const y = vy - (vy - prev.y) * ratio;
            return clampPan(x, y, k);
        });
    }, [clampPan]);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const onPointerDown = (e: PointerEvent) => {
            pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
            movedRef.current = 0;
            if (pointersRef.current.size === 1) {
                lastMidRef.current = toViewBox(e.clientX, e.clientY);
                lastDistRef.current = 0;
                setIsPanning(false);
            }
        };

        const onPointerMove = (e: PointerEvent) => {
            const prev = pointersRef.current.get(e.pointerId);
            if (!prev) return;
            pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
            const count = pointersRef.current.size;

            if (count === 1) {
                const start = toViewBox(prev.x, prev.y);
                const now = toViewBox(e.clientX, e.clientY);
                movedRef.current += Math.hypot(now.x - start.x, now.y - start.y);
                if (movedRef.current > DRAG_THRESHOLD) setIsPanning(true);
                setTransform(prevT => clampPan(
                    prevT.x + (now.x - start.x),
                    prevT.y + (now.y - start.y),
                    prevT.k
                ));
            } else if (count === 2) {
                const pts = [...pointersRef.current.values()].map(p => toViewBox(p.x, p.y));
                const mid = {
                    x: (pts[0].x + pts[1].x) / 2,
                    y: (pts[0].y + pts[1].y) / 2
                };
                const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
                const prevMid = lastMidRef.current ?? mid;
                if (lastDistRef.current > 0 && dist > 0) {
                    const factor = dist / lastDistRef.current;
                    setTransform(prevT => {
                        const k = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prevT.k * factor));
                        const ratio = k / prevT.k;
                        const x = mid.x - (prevMid.x - prevT.x) * ratio;
                        const y = mid.y - (prevMid.y - prevT.y) * ratio;
                        return clampPan(x, y, k);
                    });
                }
                lastDistRef.current = dist;
                lastMidRef.current = mid;
                movedRef.current = DRAG_THRESHOLD + 1;
                setIsPanning(true);
            }
        };

        const onPointerEnd = (e: PointerEvent) => {
            if (!pointersRef.current.delete(e.pointerId)) return;
            if (pointersRef.current.size === 0) {
                if (movedRef.current > DRAG_THRESHOLD) suppressClickRef.current = true;
                lastDistRef.current = 0;
                lastMidRef.current = null;
                setIsPanning(false);
            } else {
                const remaining = [...pointersRef.current.values()][0];
                lastMidRef.current = toViewBox(remaining.x, remaining.y);
                lastDistRef.current = 0;
            }
        };

        // Suppress the click that follows a real drag so it can't open a
        // department/municipality. Runs in capture phase, before path onClick.
        const onClickCapture = (e: MouseEvent) => {
            if (suppressClickRef.current) {
                suppressClickRef.current = false;
                e.stopPropagation();
                e.preventDefault();
            }
        };

        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
            const rect = el.getBoundingClientRect();
            if (rect.width === 0) return;
            const vx = (e.clientX - rect.left) * (vw / rect.width);
            const vy = (e.clientY - rect.top) * (vh / rect.height);
            const delta = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
            const factor = Math.exp(-delta * 0.003);
            zoomAt(vx, vy, factor);
        };

        el.addEventListener('pointerdown', onPointerDown);
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerEnd);
        window.addEventListener('pointercancel', onPointerEnd);
        el.addEventListener('click', onClickCapture, true);
        el.addEventListener('wheel', onWheel, { passive: false });

        return () => {
            el.removeEventListener('pointerdown', onPointerDown);
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerEnd);
            window.removeEventListener('pointercancel', onPointerEnd);
            el.removeEventListener('click', onClickCapture, true);
            el.removeEventListener('wheel', onWheel);
        };
    }, [vw, vh, toViewBox, zoomAt, clampPan]);

    const zoomCenter = useCallback((factor: number) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        zoomAt(rect.width / 2, rect.height / 2, factor);
    }, [zoomAt]);

    const resetZoom = useCallback(() => {
        setTransform({ x: 0, y: 0, k: 1 });
    }, []);

    const controlButtonClass = 'w-8 h-8 flex items-center justify-center rounded-md bg-panel border border-rule text-ink-soft shadow-sm hover:bg-paper-deep hover:text-ink active:brightness-95 focus:outline-none focus:ring-2 focus:ring-forest select-none';

    return (
        <div
            ref={containerRef}
            className={`relative overflow-hidden select-none ${className}`}
            onContextMenu={(e) => e.preventDefault()}
            style={{
                touchAction: 'none',
                overscrollBehavior: 'contain',
                WebkitTouchCallout: 'none',
                WebkitTapHighlightColor: 'transparent',
            }}
        >
            <svg
                baseProfile="tiny"
                viewBox={viewBox}
                className={`w-full h-auto block ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
                xmlns="http://www.w3.org/2000/svg"
            >
                <g className={isPanning ? 'pointer-events-none' : undefined} transform={`translate(${transform.x} ${transform.y}) scale(${transform.k})`}>
                    {children}
                </g>
            </svg>

            <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
                <button
                    type="button"
                    aria-label="Acercar"
                    title="Acercar"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => zoomCenter(1.6)}
                    className={controlButtonClass}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                </button>
                <button
                    type="button"
                    aria-label="Alejar"
                    title="Alejar"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => zoomCenter(1 / 1.6)}
                    className={controlButtonClass}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                </button>
                <button
                    type="button"
                    aria-label="Restablecer zoom"
                    title="Restablecer zoom"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={resetZoom}
                    className={controlButtonClass}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 11-3.9 6H2.01a5 5 0 1010.24-1.7 1 1 0 10-1.916.566 3 3 0 11-4.72 3.207 1 1 0 10-1.684.783A5 5 0 105.246 4.2H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default MapPanZoom;