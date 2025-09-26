import { useState } from 'react';
import { CalendarFormData } from '../types';
import { getTimezones } from '../utils/helpers';

interface Props {
  onSubmit: (data: CalendarFormData) => void;
}

export default function CalendarForm({ onSubmit }: Props) {
  const [formData, setFormData] = useState<CalendarFormData>({
    name: '',
    description: '',
    timezone: 'Asia/Shanghai'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('请输入日历名称');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form className="calendar-form" onSubmit={handleSubmit}>
      <h2>创建新日历</h2>

      <div className="form-group">
        <label htmlFor="name">日历名称 *</label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="例如：家人生日提醒"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">描述</label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="添加日历描述（可选）"
          rows={3}
        />
      </div>

      <div className="form-group">
        <label htmlFor="timezone">时区</label>
        <select
          id="timezone"
          value={formData.timezone}
          onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
        >
          {getTimezones().map(tz => (
            <option key={tz.value} value={tz.value}>{tz.label}</option>
          ))}
        </select>
      </div>

      <button type="submit" className="btn-primary">创建日历</button>
    </form>
  );
}
