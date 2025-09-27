declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export interface AnalyticsConfig {
  measurementId: string;
  enabled: boolean;
}

export interface EventParams {
  [key: string]: string | number | boolean;
}

class Analytics {
  private config: AnalyticsConfig;
  private initialized = false;

  constructor(config: AnalyticsConfig) {
    this.config = config;
  }

  private gtag(...args: any[]) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag(...args);
    }
  }

  init() {
    if (!this.config.enabled || this.initialized || typeof window === 'undefined') {
      return;
    }

    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.measurementId}`;
    document.head.appendChild(script);

    this.gtag('js', new Date());
    this.gtag('config', this.config.measurementId, {
      page_title: document.title,
      page_location: window.location.href,
    });

    this.initialized = true;
  }

  track(eventName: string, params?: EventParams) {
    if (!this.config.enabled || !this.initialized) {
      console.log(`[Analytics] ${eventName}`, params);
      return;
    }

    this.gtag('event', eventName, params);
  }

  trackPageView(pageTitle?: string, pagePath?: string) {
    if (!this.config.enabled || !this.initialized) {
      return;
    }

    this.gtag('config', this.config.measurementId, {
      page_title: pageTitle || document.title,
      page_location: window.location.href,
      page_path: pagePath || window.location.pathname,
    });
  }

  setUserProperty(propertyName: string, value: string | number | boolean) {
    if (!this.config.enabled || !this.initialized) {
      return;
    }

    this.gtag('config', this.config.measurementId, {
      user_properties: {
        [propertyName]: value,
      },
    });
  }
}

const analyticsConfig: AnalyticsConfig = {
  measurementId: import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX',
  enabled: import.meta.env.PROD && !!import.meta.env.VITE_GA_MEASUREMENT_ID,
};

export const analytics = new Analytics(analyticsConfig);

export const trackEvents = {
  calendarCreate: (name: string) =>
    analytics.track('calendar_create', { calendar_name: name }),

  birthdayAdd: (calendarType: string) =>
    analytics.track('birthday_add', { calendar_type: calendarType }),

  eventAdd: (allDay: boolean, hasRecurrence: boolean) =>
    analytics.track('event_add', {
      all_day: allDay,
      has_recurrence: hasRecurrence
    }),

  eventDelete: (eventType: string) =>
    analytics.track('event_delete', { event_type: eventType }),

  icsGenerate: (eventCount: number, calendarName: string) =>
    analytics.track('ics_generate', {
      event_count: eventCount,
      calendar_name: calendarName
    }),

  icsDownload: (filename: string, eventCount: number) =>
    analytics.track('ics_download', {
      filename,
      event_count: eventCount
    }),

  tabSwitch: (fromTab: string, toTab: string) =>
    analytics.track('tab_switch', {
      from_tab: fromTab,
      to_tab: toTab
    }),

  formSubmitError: (formType: string, errorMessage: string) =>
    analytics.track('form_submit_error', {
      form_type: formType,
      error_message: errorMessage
    }),

  timezoneChange: (newTimezone: string) =>
    analytics.track('timezone_change', { timezone: newTimezone }),

  yearRangeChange: (pastYears: number, futureYears: number) =>
    analytics.track('year_range_change', {
      past_years: pastYears,
      future_years: futureYears
    }),
};