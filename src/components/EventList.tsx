import { CalendarEvent } from '../types';
import { formatReminder } from '../utils/helpers';

interface Props {
  events: CalendarEvent[];
  onDelete: (id: string) => void;
}

export default function EventList({ events, onDelete }: Props) {
  return (
    <div className="event-list">
      <h3>已添加的活动 ({events.length})</h3>
      <div className="events">
        {events.map(event => (
          <div key={event.id} className="event-item">
            <div className="event-header">
              <span className="event-type">{event.type === 'birthday' ? '🎂' : '📅'}</span>
              <h4>{event.summary}</h4>
              <button className="delete-btn" onClick={() => onDelete(event.id)}>删除</button>
            </div>
            {event.description && <p className="event-description">{event.description}</p>}
            {event.reminders.length > 0 && (
              <div className="event-reminders">
                提醒: {event.reminders.map(formatReminder).join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
