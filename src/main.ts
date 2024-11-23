import { Plugin } from 'obsidian';
import HeatmapCalendarSettingsTab from './settings';
import { getDayOfYear, getLastDayOfYear, getNumberOfEmptyDaysBeforeYearStarts, isValidDate, mapRange } from './utils/core';
import { initializeCalendarContainer, renderCalendarHeader, renderDayLabels, renderMonthLabels } from './utils/rendering';

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
  separateMonths: boolean;
}

interface CalendarSettings extends CalendarData {
  colors: { [index: string | number]: string[] };
  weekStartDay: number;
  separateMonths: boolean;
}

interface Entry {
  date: string;
  intensity?: number;
  color: string;
  content: string | HTMLElement;
  separateMonths?: boolean;
}

interface Box {
  backgroundColor?: string;
  date?: string;
  content?: string | HTMLElement;
  classNames?: string[];
}

type Colors = { [index: string | number]: string[] };

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
  separateMonths: true,
};

export default class HeatmapCalendar extends Plugin {
  settings: CalendarSettings = DEFAULT_SETTINGS;

  getEntriesForYear(entries: Entry[], year: number): Entry[] {
    return entries.filter((e) => {
      if (!isValidDate(e.date)) {
        return false;
      }

      return new Date(e.date).getFullYear() === year;
    }) ?? this.settings.entries;
  }

  getCurrentYear(calendarData: CalendarData): number {
    return calendarData.year ?? this.settings.year;
  }

  getColors(calendarData: CalendarData): Colors {
    const colors =
      typeof calendarData.colors === 'string'
        ? this.settings.colors[calendarData.colors]
          ? { [calendarData.colors]: this.settings.colors[calendarData.colors] }
          : this.settings.colors
        : calendarData.colors ?? this.settings.colors;

    return colors;
  }

  getShowCurrentDayBorderSetting(calendarData: CalendarData): boolean {
    return calendarData.showCurrentDayBorder ?? this.settings.showCurrentDayBorder;
  }

  getDefaultEntryIntensitySetting(calendarData: CalendarData): number {
    return calendarData.defaultEntryIntensity ?? this.settings.defaultEntryIntensity;
  }

  getEntriesIntensities(entries: Entry[]): number[] {
    return entries
      .filter((e) => e.intensity)
      .map((e) => e.intensity as number);
  }

  getMinMaxIntensities(intensities: number[]): [number, number] {
    return [
      intensities.length ? Math.min(...intensities) : this.settings.intensityScaleStart,
      intensities.length ? Math.max(...intensities) : this.settings.intensityScaleEnd,
    ];
  }

  getSeparateMonthsSetting(calendarData: CalendarData): boolean {
    return calendarData.separateMonths ?? this.settings.separateMonths;
  }

  addYearNavigationListeners(el: HTMLElement, calendarData: CalendarData, currentYear: number, leftArrow: HTMLElement, rightArrow: HTMLElement) {
    // Event listener for the left arrow
    leftArrow.addEventListener('click', () => {
      const newCalendarData = { ...calendarData, year: currentYear - 1 };
      window.renderHeatmapCalendar(el, newCalendarData);
    });

    // Event listener for the right arrow
    rightArrow.addEventListener('click', () => {
      const newCalendarData = { ...calendarData, year: currentYear + 1 };
      window.renderHeatmapCalendar(el, newCalendarData);
    });
  }

  renderCalendarBoxes(parent: HTMLElement, boxes: Box[]) {
    const boxesUl = createEl('ul', {
      cls: 'heatmap-calendar-boxes',
      parent,
    });

    boxes.forEach((box) => {
      const entry = createEl('li', {
        attr: {
          ...(box.date && { 'data-date': box.date }),
          style: `${box.backgroundColor ? `background-color: ${box.backgroundColor};` : ''}`,
        },
        cls: box.classNames,
        parent: boxesUl,
      });

      createSpan({
        cls: 'heatmap-calendar-content',
        parent: entry,
        text: box.content as string,
      });
    });

    return boxesUl;
  }

  fillEntriesWithIntensity(entries: Entry[], calendarData: CalendarData, colors: Colors): Entry[] {
    const defaultEntryIntensity = this.getDefaultEntryIntensitySetting(calendarData);
    const intensities = this.getEntriesIntensities(entries);

    const [minimumIntensity, maximumIntensity] = this.getMinMaxIntensities(intensities);

    const intensityScaleStart =
      calendarData.intensityScaleStart ?? minimumIntensity;

    const intensityScaleEnd =
      calendarData.intensityScaleEnd ?? maximumIntensity;
    const entriesWithIntensity: Entry[] = [];

    entries.forEach((e) => {
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
          mapRange(
            newEntry.intensity,
            intensityScaleStart,
            intensityScaleEnd,
            1,
            numOfColorIntensities
          )
        );
      }

      entriesWithIntensity[getDayOfYear(new Date(e.date))] = newEntry;
    });

    return entriesWithIntensity;
  }

  getPrefilledBoxes(numberOfEmptyDaysBeforeYearBegins: number): Box[] {
    const boxes: Box[] = [];

    while (numberOfEmptyDaysBeforeYearBegins) {
      boxes.push({ backgroundColor: 'transparent' });
      numberOfEmptyDaysBeforeYearBegins--;
    }

    return boxes;
  }

  getBoxes(currentYear: number, entriesWithIntensity: Entry[], colors: Colors, separateMonths: boolean, calendarData: CalendarData): Box[] {
    const showCurrentDayBorder = this.getShowCurrentDayBorderSetting(calendarData);
    const numberOfEmptyDaysBeforeYearStarts = getNumberOfEmptyDaysBeforeYearStarts(currentYear, this.settings.weekStartDay);

    const boxes = this.getPrefilledBoxes(numberOfEmptyDaysBeforeYearStarts);

    const lastDayOfYear = getLastDayOfYear(currentYear);
    const numberOfDaysInYear = getDayOfYear(lastDayOfYear);
    const todaysDayNumberLocal = getDayOfYear(new Date());

    for (let day = 1; day <= numberOfDaysInYear; day++) {
      const box: Box = {
        classNames: [],
      };

      const currentDate = new Date(currentYear, 0, day);
      const month = currentDate.toLocaleString('en-US', { month: 'short' });

      // We don't need to add padding before January.
      if (separateMonths && day > 31) {
        const dayInMonth = Number(currentDate.toLocaleString("en-us", { day: "numeric" }));
        if (dayInMonth === 1) {
          for (let i = 0; i < 7; i++) {
            boxes.push({ backgroundColor: "transparent" });
          }
        }
      }

      box.classNames?.push(`month-${month.toLowerCase()}`);

      if (day === todaysDayNumberLocal && showCurrentDayBorder) {
        box.classNames?.push('today');
      }

      if (entriesWithIntensity[day]) {
        box.classNames?.push('hasData');
        const entry = entriesWithIntensity[day];

        box.date = entry.date;

        if (entry.content) {
          box.content = entry.content;
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

    return boxes;
  }

  async onload() {
    await this.loadSettings();

    this.addSettingTab(new HeatmapCalendarSettingsTab(this.app, this));

    window.renderHeatmapCalendar = (
      el: HTMLElement,
      calendarData: CalendarData
    ): void => {
      // Create the main container for the calendar
      const heatmapCalendarGraphDiv = initializeCalendarContainer(el);

      // Get the current year from calendarData or default settings
      const currentYear = this.getCurrentYear(calendarData);

      // Determine colors
      const colors = this.getColors(calendarData);

      const currentYearEntries = this.getEntriesForYear(calendarData.entries, currentYear);

      const separateMonths = this.getSeparateMonthsSetting(calendarData);

      const entriesWithIntensity = this.fillEntriesWithIntensity(currentYearEntries, calendarData, colors);

      const boxes = this.getBoxes(currentYear, entriesWithIntensity, colors, separateMonths, calendarData);

      const { leftArrow, rightArrow } = renderCalendarHeader(heatmapCalendarGraphDiv, currentYear);
      this.addYearNavigationListeners(el, calendarData, currentYear, leftArrow, rightArrow);

      // Create the months and days labels
      renderMonthLabels(heatmapCalendarGraphDiv);

      renderDayLabels(heatmapCalendarGraphDiv, this.settings.weekStartDay);

      const heatmapCalendarBoxesUl = this.renderCalendarBoxes(heatmapCalendarGraphDiv, boxes);

      if (separateMonths) {
        heatmapCalendarBoxesUl.className += " separate-months";
      }
    };
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