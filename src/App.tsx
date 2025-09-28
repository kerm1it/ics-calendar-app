import { useState, useEffect } from 'react';
import './App.css';
import { Calendar, CalendarEvent, BirthdayFormData, EventFormData } from './types';
import { generateId, downloadFile, parseReminderString } from './utils/helpers';
import { ICSGenerator } from './utils/icsGenerator';
import EventList from './components/EventList';
import BirthdayForm from './components/BirthdayForm';
import EventForm from './components/EventForm';
import logoSvg from './assets/logo.svg';
import { analytics, trackEvents } from './utils/analytics';

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

  useEffect(() => {
    analytics.init();
    analytics.trackPageView();
  }, []);

  const handleUpdateCalendar = (updates: Partial<Calendar>) => {
    const newCalendar = {
      ...calendar,
      ...updates,
      updatedAt: new Date()
    };

    setCalendar(newCalendar);

    if (updates.name && updates.name !== calendar.name) {
      trackEvents.calendarCreate(updates.name);
    }

    if (updates.timezone && updates.timezone !== calendar.timezone) {
      trackEvents.timezoneChange(updates.timezone);
    }
  };

  const handleAddBirthday = (data: BirthdayFormData) => {
    const reminders = data.reminders
      .map(r => {
        const parsed = parseReminderString(r.offset);
        if (parsed) {
          return { ...parsed, time: r.time };
        }
        return null;
      })
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
      reminders: reminders,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setCalendar({
      ...calendar,
      events: [...calendar.events, birthdayEvent],
      updatedAt: new Date()
    });

    trackEvents.birthdayAdd(data.calendarType);
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
      reminders: reminders,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setCalendar({
      ...calendar,
      events: [...calendar.events, regularEvent],
      updatedAt: new Date()
    });

    trackEvents.eventAdd(data.allDay, data.recurring && !!data.recurrence);
  };

  const handleDeleteEvent = (eventId: string) => {
    const eventToDelete = calendar.events.find(e => e.id === eventId);

    setCalendar({
      ...calendar,
      events: calendar.events.filter(e => e.id !== eventId),
      updatedAt: new Date()
    });

    if (eventToDelete) {
      trackEvents.eventDelete(eventToDelete.type);
    }
  };

  const handleGenerateICS = () => {
    if (calendar.events.length === 0) {
      alert('请先添加至少一个事件');
      return;
    }

    const generator = new ICSGenerator({ calendar, yearRange });
    const content = generator.generate();
    const filename = `${calendar.name.replace(/\s+/g, '_')}.ics`;

    trackEvents.icsGenerate(calendar.events.length, calendar.name);
    trackEvents.icsDownload(filename, calendar.events.length);

    downloadFile(content, filename);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>
          <img src={logoSvg} alt="ICS Calendar Generator - 日历生成器" width="48" height="48" style={{ marginRight: '12px', verticalAlign: 'middle', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
          ICS 日历生成器 Calendar Generator
        </h1>
        <p>免费在线创建个性化的 ICS 日历文件，支持农历阳历生日提醒、重复事件管理，轻松导入到 Apple 日历、Google 日历、Outlook 等应用</p>
        <p style={{ fontSize: '0.9rem', opacity: '0.8', marginTop: '8px' }}>
          Free online ICS calendar file generator with lunar calendar support, birthday reminders, and recurring events
        </p>
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
                  onClick={() => {
                    const previousTab = activeTab;
                    setActiveTab('birthday');
                    if (previousTab !== 'birthday') {
                      trackEvents.tabSwitch(previousTab, 'birthday');
                    }
                  }}
                >
                  🎂 添加生日
                </button>
                <button
                  className={activeTab === 'event' ? 'active' : ''}
                  onClick={() => {
                    const previousTab = activeTab;
                    setActiveTab('event');
                    if (previousTab !== 'event') {
                      trackEvents.tabSwitch(previousTab, 'event');
                    }
                  }}
                >
                  📌 添加事件
                </button>
              </div>

              <div className="tab-content">
                {activeTab === 'birthday' ? (
                  <>
                    <div className="year-range-section">
                      <h3>生日重复年份设置 Birthday Recurrence Settings</h3>
                      <p className="year-range-desc">
                        生日事件会在指定的年份范围内每年重复，支持农历和阳历生日自动转换。例如：过去0年、未来5年表示生成从今年到未来5年的生日提醒和日历事件
                      </p>
                      <p className="year-range-desc" style={{ fontSize: '0.85rem', opacity: '0.7' }}>
                        Birthday events will repeat annually within the specified year range, with automatic lunar to solar calendar conversion
                      </p>
                      <div className="year-range">
                        <label>
                          <span className="range-label">往前生成</span>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            value={yearRange.past}
                            onChange={(e) => {
                              const newPast = parseInt(e.target.value) || 0;
                              const newYearRange = { ...yearRange, past: newPast };
                              setYearRange(newYearRange);
                              trackEvents.yearRangeChange(newPast, yearRange.future);
                            }}
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
                            onChange={(e) => {
                              const newFuture = parseInt(e.target.value) || 5;
                              const newYearRange = { ...yearRange, future: newFuture };
                              setYearRange(newYearRange);
                              trackEvents.yearRangeChange(yearRange.past, newFuture);
                            }}
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
                ⬇️ 生成并下载 ICS 日历文件 Generate & Download ICS Calendar
              </button>
              <p style={{ fontSize: '0.8rem', opacity: '0.6', marginTop: '8px', textAlign: 'center' }}>
                可导入到 Apple 日历、Google 日历、Outlook 等应用 | Compatible with Apple Calendar, Google Calendar, Outlook
              </p>
            </div>
          </>
        )}
      </main>

      <footer style={{
        marginTop: '40px',
        padding: '20px',
        borderTop: '1px solid #e5e7eb',
        textAlign: 'center',
        fontSize: '0.85rem',
        color: '#6b7280'
      }}>
        <p>
          <strong>ICS 日历生成器</strong> - 免费在线工具，支持农历生日、阳历生日、重复事件、提醒设置
        </p>
        <p style={{ marginTop: '8px' }}>
          Free ICS Calendar Generator | Birthday Reminders | Lunar Calendar | Event Management |
          Compatible with Apple Calendar, Google Calendar, Outlook, Thunderbird
        </p>
        <p style={{ marginTop: '8px', fontSize: '0.8rem' }}>
          关键词：日历生成器, 生日提醒, 农历转换, ICS文件, 日历导入, 事件管理, 重复提醒, 时区设置
        </p>
      </footer>
    </div>
  );
}

export default App;