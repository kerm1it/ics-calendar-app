import { useState } from 'react';
import { EventFormData } from '../types';

interface Props {
  onSubmit: (data: EventFormData) => void;
}

export default function EventForm({ onSubmit }: Props) {
  const [formData, setFormData] = useState<EventFormData>({
    summary: '',
    description: '',
    location: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    allDay: false,
    recurring: false,
    recurrence: {
      frequency: 'DAILY',
      interval: 1,
      endType: 'never'
    },
    reminders: ['1d']
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.summary.trim()) {
      alert('请输入事件名称');
      return;
    }
    if (!formData.startDate) {
      alert('请选择开始日期');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form className="event-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="summary">事件名称 *</label>
        <input
          type="text"
          id="summary"
          value={formData.summary}
          onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
          placeholder="输入事件名称"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="location">地点</label>
        <input
          type="text"
          id="location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          placeholder="输入地点（可选）"
        />
      </div>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={formData.allDay}
            onChange={(e) => setFormData({ ...formData, allDay: e.target.checked })}
          />
          全天事件
        </label>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="startDate">开始日期 *</label>
          <input
            type="date"
            id="startDate"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
          />
        </div>
        {!formData.allDay && (
          <div className="form-group">
            <label htmlFor="startTime">开始时间</label>
            <input
              type="time"
              id="startTime"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            />
          </div>
        )}
      </div>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={formData.recurring}
            onChange={(e) => setFormData({ ...formData, recurring: e.target.checked })}
          />
          重复事件
        </label>
      </div>

      {formData.recurring && (
        <div className="recurrence-settings">
          <div className="form-row">
            <div className="form-group">
              <label>重复频率</label>
              <select
                value={formData.recurrence?.frequency}
                onChange={(e) => setFormData({
                  ...formData,
                  recurrence: { ...formData.recurrence!, frequency: e.target.value as any }
                })}
              >
                <option value="DAILY">每天</option>
                <option value="WEEKLY">每周</option>
                <option value="MONTHLY">每月</option>
                <option value="YEARLY">每年</option>
              </select>
            </div>
            <div className="form-group">
              <label>间隔</label>
              <input
                type="number"
                min="1"
                value={formData.recurrence?.interval}
                onChange={(e) => setFormData({
                  ...formData,
                  recurrence: { ...formData.recurrence!, interval: parseInt(e.target.value) || 1 }
                })}
              />
            </div>
          </div>
        </div>
      )}

      <button type="submit" className="btn-primary">添加事件</button>
    </form>
  );
}
