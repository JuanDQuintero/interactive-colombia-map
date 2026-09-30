import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const DEFAULT_CENTER: L.LatLngTuple = [4.5, -74.0];

const markerIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

function ClickHandler({ onPositionChange }: { onPositionChange: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onPositionChange(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

function RecenterMap({ center, zoom }: { center: L.LatLngTuple; zoom: number }) {
    const map = useMap();
    const [lat, lng] = center;
    useEffect(() => {
        map.setView([lat, lng], zoom);
    }, [map, lat, lng, zoom]);
    return null;
}

function AutoResize() {
    const map = useMap();
    useEffect(() => {
        const container = map.getContainer();
        const timer = setTimeout(() => map.invalidateSize(), 200);
        const observer = new ResizeObserver(() => map.invalidateSize());
        observer.observe(container);
        return () => {
            clearTimeout(timer);
            observer.disconnect();
        };
    }, [map]);
    return null;
}

// El zoom con la rueda queda desactivado hasta que el usuario haga clic en el
// mapa, para no secuestrar el scroll de la pagina (scroll trap).
function WheelActivate() {
    const map = useMap();
    useEffect(() => {
        map.scrollWheelZoom.disable();
        const enable = () => map.scrollWheelZoom.enable();
        map.once('click', enable);
        return () => {
            map.off('click', enable);
            map.scrollWheelZoom.disable();
        };
    }, [map]);
    return null;
}

interface MapPickerProps {
    latitude?: number;
    longitude?: number;
    onChange: (lat: number, lng: number) => void;
    height?: string;
    readOnly?: boolean;
    fallbackCenter?: L.LatLngTuple;
    showFallbackMarker?: boolean;
    wheelZoomAfterClick?: boolean;
}

const MapPicker: React.FC<MapPickerProps> = ({
    latitude,
    longitude,
    onChange,
    height = '300px',
    readOnly = false,
    fallbackCenter = DEFAULT_CENTER,
    showFallbackMarker = false,
    wheelZoomAfterClick = true,
}) => {
    const hasCoords = latitude != null && longitude != null;
    const position: L.LatLngTuple = hasCoords ? [latitude!, longitude!] : fallbackCenter;
    const showMarker = hasCoords || showFallbackMarker;

    const handlePositionChange = (lat: number, lng: number) => {
        onChange(Number(lat.toFixed(6)), Number(lng.toFixed(6)));
    };

    return (
        <div className="relative rounded-md overflow-hidden border border-rule" style={{ height }}>
            <MapContainer
                center={position}
                zoom={hasCoords ? 12 : 8}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={readOnly ? false : !wheelZoomAfterClick}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {showMarker && (
                    <Marker
                        position={position}
                        icon={markerIcon}
                        draggable={!readOnly}
                        eventHandlers={{
                            dragend: (e) => {
                                const pos = (e.target as L.Marker).getLatLng();
                                handlePositionChange(pos.lat, pos.lng);
                            },
                        }}
                    />
                )}
                {!readOnly && <ClickHandler onPositionChange={handlePositionChange} />}
                {!readOnly && wheelZoomAfterClick && <WheelActivate />}
                <RecenterMap center={position} zoom={hasCoords ? 12 : 8} />
                <AutoResize />
            </MapContainer>
        </div>
    );
};

export default MapPicker;