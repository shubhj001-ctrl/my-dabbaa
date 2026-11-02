import { Bell, Dot } from "lucide-react";
import type { RequestNotification } from "@/services/marketplace/request-queries";

export function InAppNotifications({
  notifications,
}: {
  notifications: RequestNotification[];
}) {
  if (!notifications.length) return null;

  return (
    <section className="request-notifications" aria-labelledby="notifications-heading">
      <div className="mb-4 flex items-center gap-2">
        <Bell size={17} aria-hidden="true" />
        <h2 id="notifications-heading">Your latest updates</h2>
      </div>
      <ul className="space-y-2">
        {notifications.map((notification) => (
          <li className="notification-row" key={notification.id}>
            <span className="notification-indicator" aria-hidden="true">
              {!notification.read_at ? <Dot size={22} /> : null}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-bold">{notification.title}</p>
              <p className="mt-1 text-sm leading-5">{notification.body}</p>
            </div>
            <time className="shrink-0 text-xs" dateTime={notification.created_at}>
              {new Intl.DateTimeFormat("en-IN", {
                day: "numeric",
                month: "short",
              }).format(new Date(notification.created_at))}
            </time>
          </li>
        ))}
      </ul>
    </section>
  );
}
