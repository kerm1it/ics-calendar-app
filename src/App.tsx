import { useState } from 'react';
import './App.css';
import { Calendar, CalendarEvent, BirthdayFormData, EventFormData } from './types';
import { generateId, downloadFile, parseReminderString } from './utils/helpers';
import { ICSGenerator } from './utils/icsGenerator';
import EventList from './components/EventList';
import BirthdayForm from './components/BirthdayForm';
import EventForm from './components/EventForm';

function App() {
  const [calendar, setCalendar] = useState<Calendar>({
    id: generateId(),
    name: '家人生日',
    description: '',
    timezone: 'Asia/Shanghai',
    events: [],
    createdAt: new Date(),
    updatedAt: new Date()
  });
  const [activeTab, setActiveTab] = useState<'birthday' | 'event'>('birthday');
  const [yearRange, setYearRange] = useState({ past: 0, future: 5 });

  const handleUpdateCalendar = (updates: Partial<Calendar>) => {
    setCalendar(prev => ({
      ...prev,
      ...updates,
      updatedAt: new Date()
    }));
  };

  const handleAddBirthday = (data: BirthdayFormData) => {
    const reminders = data.reminders
      .map(r => parseReminderString(r))
      .filter(r => r !== null);

    const birthdayEvent: CalendarEvent = {
      id: generateId(),
      type: 'birthday',
      personName: data.personName,
      birthDate: new Date(data.birthDate),
      calendarType: data.calendarType,
      showAge: data.showAge,
      summary: `${data.personName}生日`,
      description: data.description,
      reminders: reminders as any[],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setCalendar({
      ...calendar,
      events: [...calendar.events, birthdayEvent],
      updatedAt: new Date()
    });
  };

  const handleAddEvent = (data: EventFormData) => {

    const reminders = data.reminders
      .map(r => parseReminderString(r))
      .filter(r => r !== null);

    const regularEvent: CalendarEvent = {
      id: generateId(),
      type: 'event',
      summary: data.summary,
      description: data.description,
      location: data.location,
      startDate: new Date(data.startDate + (data.startTime ? 'T' + data.startTime : '')),
      endDate: data.endDate ? new Date(data.endDate + (data.endTime ? 'T' + data.endTime : '')) : undefined,
      allDay: data.allDay,
      recurrence: data.recurring && data.recurrence ? {
        frequency: data.recurrence.frequency,
        interval: data.recurrence.interval,
        count: data.recurrence.endType === 'count' ? data.recurrence.count : undefined,
        until: data.recurrence.endType === 'until' ? new Date(data.recurrence.until!) : undefined
      } : undefined,
      reminders: reminders as any[],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setCalendar({
      ...calendar,
      events: [...calendar.events, regularEvent],
      updatedAt: new Date()
    });
  };

  const handleDeleteEvent = (eventId: string) => {

    setCalendar({
      ...calendar,
      events: calendar.events.filter(e => e.id !== eventId),
      updatedAt: new Date()
    });
  };

  const handleGenerateICS = () => {
    if (calendar.events.length === 0) {
      alert('请先添加至少一个事件');
      return;
    }

    const generator = new ICSGenerator({ calendar, yearRange });
    const content = generator.generate();
    const filename = `${calendar.name.replace(/\s+/g, '_')}.ics`;
    downloadFile(content, filename);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>📅 ICS 日历生成器</h1>
        <p>创建个性化的日历文件，导入到您喜欢的日历应用</p>
      </header>

      <main className="app-main">
        <div className="calendar-settings">
          <div className="settings-row">
            <div className="form-group inline">
              <label htmlFor="calendarName">日历名称</label>
              <input
                type="text"
                id="calendarName"
                value={calendar.name}
                onChange={(e) => handleUpdateCalendar({ name: e.target.value })}
                placeholder="例如：家人生日提醒"
              />
            </div>
            <div className="form-group inline">
              <label htmlFor="timezone">时区</label>
              <select
                id="timezone"
                value={calendar.timezone}
                onChange={(e) => handleUpdateCalendar({ timezone: e.target.value })}
              >
                <option value="Asia/Shanghai">中国标准时间</option>
                <option value="Asia/Hong_Kong">香港时间</option>
                <option value="Asia/Tokyo">日本时间</option>
                <option value="America/New_York">美国东部时间</option>
                <option value="America/Los_Angeles">美国西部时间</option>
                <option value="Europe/London">伦敦时间</option>
                <option value="Europe/Paris">巴黎时间</option>
              </select>
            </div>
          </div>
        </div>

            <div className="event-section">
              <div className="tabs">
                <button
                  className={activeTab === 'birthday' ? 'active' : ''}
                  onClick={() => setActiveTab('birthday')}
                >
                  🎂 添加生日
                </button>
                <button
                  className={activeTab === 'event' ? 'active' : ''}
                  onClick={() => setActiveTab('event')}
                >
                  📌 添加事件
                </button>
              </div>

              <div className="tab-content">
                {activeTab === 'birthday' ? (
                  <>
                    <div className="year-range-section">
                      <h3>生日重复年份设置</h3>
                      <p className="year-range-desc">生日事件会在指定的年份范围内每年重复，例如：过去0年、未来5年表示生成从今年到未来5年的生日提醒</p>
                      <div className="year-range">
                        <label>
                          <span className="range-label">往前生成</span>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            value={yearRange.past}
                            onChange={(e) => setYearRange({ ...yearRange, past: parseInt(e.target.value) || 0 })}
                          />
                          <span className="range-unit">年</span>
                        </label>
                        <label>
                          <span className="range-label">往后生成</span>
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={yearRange.future}
                            onChange={(e) => setYearRange({ ...yearRange, future: parseInt(e.target.value) || 5 })}
                          />
                          <span className="range-unit">年</span>
                        </label>
                      </div>
                      <p className="year-range-example">当前设置：{new Date().getFullYear() - yearRange.past} 年 - {new Date().getFullYear() + yearRange.future} 年</p>
                    </div>
                    <BirthdayForm onSubmit={handleAddBirthday} />
                  </>
                ) : (
                  <EventForm onSubmit={handleAddEvent} />
                )}
              </div>
            </div>

        {calendar.events.length > 0 && (
          <>
            <EventList events={calendar.events} onDelete={handleDeleteEvent} />

            <div className="generate-section">
              <button className="generate-btn" onClick={handleGenerateICS}>
                ⬇️ 生成并下载 ICS 文件
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;