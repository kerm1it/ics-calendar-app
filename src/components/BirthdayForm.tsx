import { useState } from 'react';
import { BirthdayFormData } from '../types';

interface Props {
  onSubmit: (data: BirthdayFormData) => void;
}

export default function BirthdayForm({ onSubmit }: Props) {
  const [formData, setFormData] = useState<BirthdayFormData>({
    personName: '',
    calendarType: 'solar',
    birthDate: '',
    showAge: true,
    reminders: [
      { offset: '1w', time: '12:00' },
      { offset: '1d', time: '12:00' }
    ],
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.personName.trim()) {
      alert('请输入姓名');
      return;
    }
    if (!formData.birthDate) {
      alert('请选择生日日期');
      return;
    }
    onSubmit(formData);
  };

  const handleReminderChange = (index: number, field: 'offset' | 'time', value: string) => {
    const newReminders = [...formData.reminders];
    newReminders[index] = { ...newReminders[index], [field]: value };
    setFormData({ ...formData, reminders: newReminders });
  };

  const addReminder = () => {
    setFormData({
      ...formData,
      reminders: [...formData.reminders, { offset: '1d', time: '12:00' }]
    });
  };

  const removeReminder = (index: number) => {
    const newReminders = formData.reminders.filter((_, i) => i !== index);
    setFormData({ ...formData, reminders: newReminders });
  };

  return (
    <form className="birthday-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="personName">姓名 *</label>
        <input
          type="text"
          id="personName"
          value={formData.personName}
          onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
          placeholder="输入姓名"
          required
        />
      </div>

      <div className="form-group">
        <label>日历类型</label>
        <div className="calendar-type-selector">
          <button
            type="button"
            className={`calendar-type-btn ${formData.calendarType === 'solar' ? 'active' : ''}`}
            onClick={() => setFormData({ ...formData, calendarType: 'solar' })}
          >
            ☀️ 阳历
          </button>
          <button
            type="button"
            className={`calendar-type-btn ${formData.calendarType === 'lunar' ? 'active' : ''}`}
            onClick={() => setFormData({ ...formData, calendarType: 'lunar' })}
          >
            🌙 农历
          </button>
        </div>
        <p className="calendar-type-hint">
          当前选择：<strong>{formData.calendarType === 'solar' ? '阳历（公历）' : '农历（阴历）'}</strong>
        </p>
      </div>

      <div className="form-group">
        <label htmlFor="birthDate">
          生日日期 * {formData.calendarType === 'lunar' && <span className="calendar-type-hint">(农历日期)</span>}
        </label>
        <input
          type="date"
          id="birthDate"
          value={formData.birthDate}
          onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
          required
        />
        {formData.calendarType === 'lunar' && (
          <p className="form-hint">
            选择的日期将被视为农历日期，生成时会自动转换为对应的阳历日期
          </p>
        )}
      </div>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={formData.showAge}
            onChange={(e) => setFormData({ ...formData, showAge: e.target.checked })}
          />
          显示年龄
        </label>
      </div>

      <div className="form-group">
        <label>提醒设置</label>
        {formData.reminders.map((reminder, index) => (
          <div key={index} className="reminder-row-with-time">
            <select
              value={reminder.offset}
              onChange={(e) => handleReminderChange(index, 'offset', e.target.value)}
              className="reminder-offset"
            >
              <option value="0">生日当天</option>
              <option value="1d">提前1天</option>
              <option value="2d">提前2天</option>
              <option value="3d">提前3天</option>
              <option value="1w">提前1周</option>
              <option value="2w">提前2周</option>
            </select>
            <input
              type="time"
              value={reminder.time}
              onChange={(e) => handleReminderChange(index, 'time', e.target.value)}
              className="reminder-time"
            />
            {formData.reminders.length > 1 && (
              <button type="button" onClick={() => removeReminder(index)} className="btn-delete">删除</button>
            )}
          </div>
        ))}
        <button type="button" onClick={addReminder} className="btn-secondary">添加提醒</button>
      </div>

      <button type="submit" className="btn-primary">添加生日</button>
    </form>
  );
}
