import { useCallback, useEffect, useState } from 'react';

interface UserActivityFeedProps<I> {
    fetchActivities: (search: string) => Promise<I[]>;
    markAllAsRead: () => void;
}

interface Activity {
    title: string;
    read: boolean;
}

export function UserActivityFeed({ fetchActivities, markAllAsRead }: UserActivityFeedProps<Activity>) {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        let cancelled = false;
        setLoading(true);

        fetchActivities(search).then((data: Activity[]) => {
            if (cancelled || controller.signal.aborted) return;
            setActivities(data);
            setLoading(false);
        }).catch(() => {
            if (!cancelled && !controller.signal.aborted) setLoading(false);
        });

        return () => {
            cancelled = true;
            controller.abort();
        };
    }, [search, fetchActivities]);

    const handleMarkAll = useCallback(async () => {
        markAllAsRead();
        setActivities((prevActivities) => prevActivities.map(a => ({ ...a, read: true })));
    }, [markAllAsRead]);

    return (
        <div>
            <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar..."
            />
            <button onClick={handleMarkAll}>Marcar leídas</button>

            {loading ? (
                <p>Cargando...</p>
            ) : (
                <ul>
                    {activities.filter(a => a.title.includes(search)).map((activity, index) => (
                        <li key={index} style={{ opacity: activity.read ? 0.5 : 1 }}>
                            {activity.title}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}