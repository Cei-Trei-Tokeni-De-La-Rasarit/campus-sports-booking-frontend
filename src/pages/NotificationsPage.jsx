import {useEffect, useState} from 'react';

import {
  listNotifications,
  markNotificationRead,
} from '../api/notificationApi.js';
import {relativeTime} from '../utils/relativeTime.js';

// Titlul afișat pentru fiecare tip de notificare primit de la API.
const TITLES = {
  confirmare: 'Rezervare confirmată',
  anulare: 'Rezervare anulată',
  memento: 'Memento',
  loc_eliberat: 'Un loc s-a eliberat',
  mentenanta: 'Mentenanță programată',
};

/**
 * O notificare din listă. Cele necitite au un punct și titlul îngroșat;
 * un click pe ele le marchează ca citite.
 * @param {Object} props
 * @param {Object} props.notification
 * @param {function(number): void} props.onRead
 */
function NotificationItem({notification, onRead}) {
  const isUnread = !notification.citita;
  const content = (
    <>
      <span className="notification-dot" aria-hidden="true" />
      <span className="notification-body">
        <span className="notification-title">
          {TITLES[notification.tip] ?? 'Notificare'}
        </span>
        <span className="notification-message">{notification.mesaj}</span>
      </span>
      <span className="notification-time">
        {relativeTime(new Date(notification.data), new Date())}
      </span>
    </>
  );

  return (
    <li className={`notification ${isUnread ? 'notification-unread' : ''}`}>
      {isUnread ? (
        <button
          type="button"
          className="notification-content"
          title="Marchează ca citită"
          onClick={() => onRead(notification.id)}
        >
          {content}
        </button>
      ) : (
        <div className="notification-content">{content}</div>
      )}
    </li>
  );
}

/** Pagina „Notificări”: notificările utilizatorului, cele mai noi primele. */
export function NotificationsPage() {
  const [notifications, setNotifications] = useState(null);
  const [error, setError] = useState(null);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    listNotifications()
      .then((data) => isCurrent && setNotifications(data))
      .catch((loadError) => isCurrent && setError(loadError.message));
    return () => {
      isCurrent = false;
    };
  }, []);

  /**
   * Marchează notificările date ca citite și actualizează lista.
   * @param {Array<number>} ids
   */
  async function markRead(ids) {
    setError(null);
    try {
      const updated = await Promise.all(ids.map(markNotificationRead));
      const byId = new Map(updated.map((item) => [item.id, item]));
      setNotifications((current) =>
        current.map((item) => byId.get(item.id) ?? item),
      );
    } catch (markError) {
      setError(markError.message);
    }
  }

  /** „Marchează toate ca citite”: câte o cerere pentru fiecare necitită. */
  async function handleMarkAll() {
    setIsMarkingAll(true);
    await markRead(
      notifications.filter((item) => !item.citita).map((item) => item.id),
    );
    setIsMarkingAll(false);
  }

  const hasUnread = notifications?.some((item) => !item.citita);

  return (
    <main className="notifications-page">
      <div className="notifications-header">
        <h1>Notificări</h1>
        {hasUnread && (
          <button
            type="button"
            className="notifications-mark-all"
            disabled={isMarkingAll}
            onClick={handleMarkAll}
          >
            Marchează toate ca citite
          </button>
        )}
      </div>

      {error && (
        <p className="alert alert-error" role="alert">
          {error}
        </p>
      )}

      {!notifications && !error && (
        <p className="empty-state">Se încarcă notificările…</p>
      )}
      {notifications?.length === 0 && (
        <p className="empty-state">Nu ai încă notificări.</p>
      )}
      {notifications?.length > 0 && (
        <ul className="notification-list">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onRead={(id) => markRead([id])}
            />
          ))}
        </ul>
      )}
    </main>
  );
}
