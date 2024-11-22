import { Plugin } from 'obsidian';
import HeatmapCalendarSettingsTab from './settings';

declare global {
  interface Window {
    renderHeatmapCalendar: (el: HTMLElement, calendarData: CalendarData) => void;
  }
}

interface CalendarData {
  year: number;
  colors: { [index: string | number]: string[] } | string;
  entries: Entry[];
  showCurrentDayBorder: boolean;
  defaultEntryIntensity: number;
  intensityScaleStart: number;
  intensityScaleEnd: number;
}

interface CalendarSettings extends CalendarData {
  colors: { [index: string | number]: string[] };
  weekStartDay: number;
}

interface Entry {
  date: string;
  intensity?: number;
  color: string;
  content: string | HTMLElement;
}

const DEFAULT_SETTINGS: CalendarSettings = {
  year: new Date().getFullYear(),
  colors: {
    default: ['#c6e48b', '#7bc96f', '#49af5d', '#2e8840', '#196127'],
  },
  entries: [{ date: '1900-01-01', color: '#7bc96f', intensity: 5, content: '' }],
  showCurrentDayBorder: true,
  defaultEntryIntensity: 4,
  intensityScaleStart: 1,
  intensityScaleEnd: 5,
  weekStartDay: 1,
};

export default class HeatmapCalendar extends Plugin {
  settings: CalendarSettings = DEFAULT_SETTINGS;

  /**
   * Removes HTMLElements from entries that are outside of the displayed year.
   * @param entries The calendar entries.
   * @param year The displayed year.
   */
  removeHtmlElementsNotInYear(entries: Entry[], year: number) {
    const calEntriesNotInDisplayedYear =
      entries.filter((e) => new Date(e.date).getFullYear() !== year) ?? this.settings.entries;

    calEntriesNotInDisplayedYear.forEach((e) => {
      if (e.content instanceof HTMLElement) {
        e.content.remove();
      }
    });
  }

  clamp(input: number, min: number, max: number): number {
    return input < min ? min : input > max ? max : input;
  }

  map(
    current: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number
  ): number {
    const mapped: number =
      ((current - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    return this.clamp(mapped, outMin, outMax);
  }

  getWeekdayShort(dayNumber: number): string {
    return new Date(1970, 0, dayNumber + this.settings.weekStartDay + 4).toLocaleDateString(
      'en-US',
      { weekday: 'short' }
    );
  }

  public isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }

  public getDayOfYear(date: Date): number {
    const startOfYear = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - startOfYear.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  public createCalendarHeader(parent: HTMLElement, year: number) {
    const headerDiv = createDiv({
      cls: 'heatmap-calendar-header',
      parent,
    });

    // Left arrow
    const leftArrow = createSpan({
      cls: 'heatmap-calendar-arrow left',
      text: '◀',
      parent: headerDiv,
      attr: {
        'aria-label': 'Previous Year',
        role: 'button',
        tabindex: '0',
      },
    });

    // Year display
    createSpan({
      cls: 'heatmap-calendar-year-display',
      text: String(year),
      parent: headerDiv,
    });

    // Right arrow
    const rightArrow = createSpan({
      cls: 'heatmap-calendar-arrow right',
      text: '▶',
      parent: headerDiv,
      attr: {
        'aria-label': 'Next Year',
        role: 'button',
        tabindex: '0',
      },
    });

    return { leftArrow, rightArrow };
  }

  renderHeatmapCalendar = (
    el: HTMLElement,
    calendarData: CalendarData
  ): void => {
    // Clear the parent element to prevent duplication
    el.empty();

    // Get the current year from calendarData or default settings
    const year = calendarData.year ?? this.settings.year;

    // Determine colors
    const colors =
      typeof calendarData.colors === 'string'
        ? this.settings.colors[calendarData.colors]
          ? { [calendarData.colors]: this.settings.colors[calendarData.colors] }
          : this.settings.colors
        : calendarData.colors ?? this.settings.colors;

    this.removeHtmlElementsNotInYear(calendarData.entries, year);

    const calEntries = calendarData.entries.filter((e) => {
      if (!this.isValidDate(e.date)) return false;
      return new Date(e.date).getFullYear() === year;
    }) ?? this.settings.entries;

    const showCurrentDayBorder =
      calendarData.showCurrentDayBorder ?? this.settings.showCurrentDayBorder;

    const defaultEntryIntensity =
      calendarData.defaultEntryIntensity ?? this.settings.defaultEntryIntensity;

    const intensities = calEntries
      .filter((e) => e.intensity)
      .map((e) => e.intensity as number);

    const minimumIntensity = intensities.length
      ? Math.min(...intensities)
      : this.settings.intensityScaleStart;

    const maximumIntensity = intensities.length
      ? Math.max(...intensities)
      : this.settings.intensityScaleEnd;

    const intensityScaleStart =
      calendarData.intensityScaleStart ?? minimumIntensity;

    const intensityScaleEnd =
      calendarData.intensityScaleEnd ?? maximumIntensity;

    const mappedEntries: Entry[] = [];
    calEntries.forEach((e) => {
      const newEntry = {
        intensity: defaultEntryIntensity,
        ...e,
      };
      const colorIntensities =
        typeof colors === 'string'
          ? this.settings.colors[colors]
          : colors[e.color] ?? colors[Object.keys(colors)[0]];

      const numOfColorIntensities = Object.keys(colorIntensities).length;

      if (
        minimumIntensity === maximumIntensity &&
        intensityScaleStart === intensityScaleEnd
      ) {
        newEntry.intensity = numOfColorIntensities;
      } else {
        newEntry.intensity = Math.round(
          this.map(
            newEntry.intensity,
            intensityScaleStart,
            intensityScaleEnd,
            1,
            numOfColorIntensities
          )
        );
      }

      mappedEntries[this.getDayOfYear(new Date(e.date))] = newEntry;
    });

    const firstDayOfYear = new Date(Date.UTC(year, 0, 1));
    let numberOfEmptyDaysBeforeYearBegins =
      (firstDayOfYear.getUTCDay() + 7 - this.settings.weekStartDay) % 7;

    interface Box {
      backgroundColor?: string;
      date?: string;
      content?: string;
      classNames?: string[];
    }

    const boxes: Box[] = [];

    while (numberOfEmptyDaysBeforeYearBegins) {
      boxes.push({ backgroundColor: 'transparent' });
      numberOfEmptyDaysBeforeYearBegins--;
    }

    const lastDayOfYear = new Date(Date.UTC(year, 11, 31));
    const numberOfDaysInYear = this.getDayOfYear(lastDayOfYear);
    const todaysDayNumberLocal = this.getDayOfYear(new Date());

    for (let day = 1; day <= numberOfDaysInYear; day++) {
      const box: Box = {
        classNames: [],
      };

      const currentDate = new Date(year, 0, day);
      const month = currentDate.toLocaleString('en-US', { month: 'short' });
      box.classNames?.push(`month-${month.toLowerCase()}`);

      if (day === todaysDayNumberLocal && showCurrentDayBorder) {
        box.classNames?.push('today');
      }

      if (mappedEntries[day]) {
        box.classNames?.push('hasData');
        const entry = mappedEntries[day];

        box.date = entry.date;

        if (entry.content) {
          box.content = typeof entry.content === 'string' ? entry.content : '';
        }

        const currentDayColors = entry.color
          ? colors[entry.color]
          : colors[Object.keys(colors)[0]];
        box.backgroundColor = currentDayColors[(entry.intensity as number) - 1];
      } else {
        box.classNames?.push('isEmpty');
      }
      boxes.push(box);
    }

    // Create the main container for the calendar
    const heatmapCalendarGraphDiv = createDiv({
      cls: 'heatmap-calendar-graph',
      parent: el,
    });

    const { leftArrow, rightArrow } = this.createCalendarHeader(heatmapCalendarGraphDiv, year);

    // Event listener for the left arrow
    leftArrow.addEventListener('click', () => {
      const newCalendarData = { ...calendarData, year: year - 1 };
      this.renderHeatmapCalendar(el, newCalendarData);
    });

    // Event listener for the right arrow
    rightArrow.addEventListener('click', () => {
      const newCalendarData = { ...calendarData, year: year + 1 };
      this.renderHeatmapCalendar(el, newCalendarData);
    });

    // Create the months and days labels
    const heatmapCalendarMonthsUl = createEl('ul', {
      cls: 'heatmap-calendar-months',
      parent: heatmapCalendarGraphDiv,
    });

    // Add month labels
    [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ].forEach((month) => {
      createEl('li', { text: month, parent: heatmapCalendarMonthsUl });
    });

    const heatmapCalendarDaysUl = createEl('ul', {
      cls: 'heatmap-calendar-days',
      parent: heatmapCalendarGraphDiv,
    });

    // Add day labels
    for (let i = 0; i < 7; i++) {
      createEl('li', {
        text: this.getWeekdayShort(i),
        parent: heatmapCalendarDaysUl,
      });
    }

    const heatmapCalendarBoxesUl = createEl('ul', {
      cls: 'heatmap-calendar-boxes',
      parent: heatmapCalendarGraphDiv,
    });

    // Create the calendar boxes
    boxes.forEach((e) => {
      const entry = createEl('li', {
        attr: {
          ...(e.date && { 'data-date': e.date }),
          style: `${e.backgroundColor ? `background-color: ${e.backgroundColor};` : ''}`,
        },
        cls: e.classNames,
        parent: heatmapCalendarBoxesUl,
      });

      createSpan({
        cls: 'heatmap-calendar-content',
        parent: entry,
        text: e.content,
      });
    });
  };

  async onload() {
    await this.loadSettings();

    this.addSettingTab(new HeatmapCalendarSettingsTab(this.app, this));

    window.renderHeatmapCalendar = this.renderHeatmapCalendar;
  }

  onunload() {
    console.log('Unloading HeatmapCalendar plugin');
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}