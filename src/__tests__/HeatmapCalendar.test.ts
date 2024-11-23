import HeatmapCalendar from '../main';

describe.skip('HeatmapCalendar', () => {
  let heatmapCalendar: HeatmapCalendar;

  beforeEach(() => {
    // Mock the app object required by the Plugin
    const app = {};
    heatmapCalendar = new HeatmapCalendar(app as any, {} as any);
  });

  describe('clamp', () => {
    it('should return input when within range', () => {
      expect(heatmapCalendar.clamp(5, 1, 10)).toBe(5);
    });

    it('should return min when input is below min', () => {
      expect(heatmapCalendar.clamp(0, 1, 10)).toBe(1);
    });

    it('should return max when input is above max', () => {
      expect(heatmapCalendar.clamp(15, 1, 10)).toBe(10);
    });

    it('should return min when input equals min', () => {
      expect(heatmapCalendar.clamp(1, 1, 10)).toBe(1);
    });

    it('should return max when input equals max', () => {
      expect(heatmapCalendar.clamp(10, 1, 10)).toBe(10);
    });

    it('should handle min equals max', () => {
      expect(heatmapCalendar.clamp(5, 5, 5)).toBe(5);
    });

    it('should handle min greater than max', () => {
      expect(heatmapCalendar.clamp(5, 10, 1)).toBe(10);
    });
  });

  describe('map', () => {
    it('should map within normal range', () => {
      expect(heatmapCalendar.map(5, 0, 10, 0, 100)).toBe(50);
    });
  
    it('should map at lower bound', () => {
      expect(heatmapCalendar.map(0, 0, 10, 0, 100)).toBe(0);
    });
  
    it('should map at upper bound', () => {
      expect(heatmapCalendar.map(10, 0, 10, 0, 100)).toBe(100);
    });
  
    it('should handle inverted input range', () => {
      expect(heatmapCalendar.map(5, 10, 0, 0, 100)).toBe(50);
    });
  
    it('should handle inverted output range', () => {
      expect(heatmapCalendar.map(5, 0, 10, 100, 0)).toBe(50);
    });
  
    it('should handle zero input range (division by zero)', () => {
      expect(heatmapCalendar.map(5, 5, 5, 0, 100)).toBe(0);
    });
  
    it('should handle zero output range', () => {
      expect(heatmapCalendar.map(5, 0, 10, 50, 50)).toBe(50);
    });
  
    it('should clamp current below inMin to outMin', () => {
      expect(heatmapCalendar.map(-5, 0, 10, 0, 100)).toBe(0);
    });
  
    it('should handle negative ranges', () => {
      expect(heatmapCalendar.map(-5, -10, 0, 0, 100)).toBe(50);
    });
  });

  describe('isValidDate', () => {
    it('should return true for valid date', () => {
      expect(heatmapCalendar.isValidDate('2023-10-24')).toBe(true);
    });
  
    it('should return false for invalid date', () => {
      expect(heatmapCalendar.isValidDate('2023-02-30')).toBe(false);
    });
  
    it('should return false for empty string', () => {
      expect(heatmapCalendar.isValidDate('')).toBe(false);
    });
  
    it('should return false for null input', () => {
      expect(heatmapCalendar.isValidDate(null as any)).toBe(false);
    });
  
    it('should return false for malformed date', () => {
      expect(heatmapCalendar.isValidDate('not a date')).toBe(false);
    });
  
    it('should return true for valid leap year date', () => {
      expect(heatmapCalendar.isValidDate('2020-02-29')).toBe(true);
    });
  
    it('should return false for invalid non-leap year date', () => {
      expect(heatmapCalendar.isValidDate('2021-02-29')).toBe(false);
    });
  
    it('should return false for out-of-range month', () => {
      expect(heatmapCalendar.isValidDate('2023-13-01')).toBe(false);
    });
  
    it('should return false for out-of-range day', () => {
      expect(heatmapCalendar.isValidDate('2023-04-31')).toBe(false);
    });
  });

  describe('getDayOfYear', () => {
    it('should return 1 for January 1st', () => {
      expect(heatmapCalendar.getDayOfYear(new Date('2023-01-01'))).toBe(1);
    });
  
    it('should return 365 for December 31st in non-leap year', () => {
      expect(heatmapCalendar.getDayOfYear(new Date('2023-12-31'))).toBe(365);
    });
  
    it('should return 366 for December 31st in leap year', () => {
      expect(heatmapCalendar.getDayOfYear(new Date('2020-12-31'))).toBe(366);
    });
  
    it('should return correct day number for March 1st in non-leap year', () => {
      expect(heatmapCalendar.getDayOfYear(new Date('2023-03-01'))).toBe(60);
    });
  
    it('should return correct day number for March 1st in leap year', () => {
      expect(heatmapCalendar.getDayOfYear(new Date('2020-03-01'))).toBe(61);
    });
  });

  describe('getWeekdayShort', () => {
    it('should return correct weekday for day numbers 0 to 6', () => {
      const expectedWeekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      for (let i = 0; i <= 6; i++) {
        expect(heatmapCalendar.getWeekdayShort(i)).toBe(expectedWeekdays[i]);
      }
    });
  
    it('should handle negative day number', () => {
      expect(heatmapCalendar.getWeekdayShort(-1)).toBe('Sun');
    });
  
    it('should handle day number greater than 6', () => {
      expect(heatmapCalendar.getWeekdayShort(7)).toBe('Mon');
    });
  });

  describe('removeHtmlElementsNotInYear', () => {
    it('should remove HTMLElement content for entries not in given year', () => {
      const element = document.createElement('div');
      const removeSpy = jest.spyOn(element, 'remove');
      const entries = [
        {
          date: '2022-01-01',
          content: element,
          color: ''
        },
      ];
      heatmapCalendar.removeHtmlElementsNotInYear(entries, 2023);
      expect(removeSpy).toHaveBeenCalled();
    });
  
    it('should not remove HTMLElement content for entries in given year', () => {
      const element = document.createElement('div');
      const removeSpy = jest.spyOn(element, 'remove');
      const entries = [
        {
          date: '2023-01-01',
          content: element,
          color: ''
        },
      ];
      heatmapCalendar.removeHtmlElementsNotInYear(entries, 2023);
      expect(removeSpy).not.toHaveBeenCalled();
    });
  
    it('should not remove content if not HTMLElement', () => {
      const entries = [
        {
          date: '2022-01-01',
          content: 'String content',
          color: ''
        },
      ];
      heatmapCalendar.removeHtmlElementsNotInYear(entries, 2023);
      // No error should occur
    });
  });

  describe('createCalendarHeader', () => {
    it('should create header with left and right arrows and year display', () => {
      const parent = document.createElement('div');
      const { leftArrow, rightArrow } = heatmapCalendar.renderCalendarHeader(parent, 2023);
  
      expect(parent.querySelector('.heatmap-calendar-header')).not.toBeNull();
      expect(leftArrow.textContent).toBe('◀');
      expect(rightArrow.textContent).toBe('▶');
      expect(parent.textContent).toContain('2023');
    });
  
    it('should set correct attributes on arrows', () => {
      const parent = document.createElement('div');
      const { leftArrow, rightArrow } = heatmapCalendar.renderCalendarHeader(parent, 2023);
  
      expect(leftArrow.getAttribute('aria-label')).toBe('Previous Year');
      expect(rightArrow.getAttribute('aria-label')).toBe('Next Year');
    });
  });
});
