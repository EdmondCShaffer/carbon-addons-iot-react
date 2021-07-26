import {
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { format, isThisMinute, subHours, subMinutes } from 'date-fns';
import { getRangeFromRelative } from './date-time-relative.component';

export interface DateTimeRange {
  key: any;
  description: string;
  getRange: () => [Date, Date];
}

export interface RelativeRange {
  last: [number, string];
  relativeTo: [string, string];
}

export type RelativeDateTimeSelection = ['RELATIVE', ...DateRange, RelativeRange];
export type AbsoluteDateTimeSelection = ['ABSOLUTE', ...DateRange];
export type CustomDateTimeSelection = AbsoluteDateTimeSelection | RelativeDateTimeSelection;
export type PresetDateTimeSelection = [string];

export type DateTimeSelection = PresetDateTimeSelection | CustomDateTimeSelection;

export type DateRange = [Date, Date];

@Component({
  selector: 'ai-date-time-picker',
  template: `
    <div
      class="iot--date-time-picker__box"
      [ngClass]="{
        'iot--date-time-picker__box--light': theme === 'light'
      }"
    >
      <div
        class="iot--date-time-picker__field"
        (click)="togglePicker()"
        (keydown.enter)="togglePicker()"
        (keydown.space)="togglePicker()"
        [ibmTooltip]="formatCurrentRange()"
        [offset]="tooltipOffset"
        trigger="hover"
        placement="bottom"
        role="button"
        tabindex="0"
      >
        <span [title]="formatCurrentRangeTitle()">{{ formatCurrentRangeTitle() }}</span>
        <svg ibmIcon="calendar" size="16" class="iot--date-time-picker__icon"></svg>
      </div>
      <div
        class="iot--date-time-picker__menu"
        [ngClass]="{
          'iot--date-time-picker__menu-expanded': expanded
        }"
        role="listbox"
      >
        <div class="iot--date-time-picker__menu-scroll">
          <!-- root view -->
          <ol
            *ngIf="!selectingCustomRange"
            (keyup)="navigateList($event)"
            class="bx--list--ordered"
          >
            <li
              class="bx--list__item iot--date-time-picker__listitem iot--date-time-picker__listitem--current"
            >
              {{ formatCurrentRange() }}
            </li>
            <li
              *ngIf="hasRelative || hasAbsolute"
              (click)="selectingCustomRange = true"
              class="bx--list__item iot--date-time-picker__listitem iot--date-time-picker__listitem--custom"
              tabindex="-1"
            >
              Custom Range
            </li>
            <li
              *ngFor="let range of dateTimeRanges"
              class="bx--list__item iot--date-time-picker__listitem iot--date-time-picker__listitem--preset"
              (click)="selectPresetRange(range)"
              (keyup.space)="selectPresetRange(range)"
              (keyup.enter)="selectPresetRange(range)"
              [attr.tabindex]="selected[0] === range.key ? 0 : -1"
              [ngClass]="{
                'iot--date-time-picker__listitem--preset-selected': selected[0] === range.key
              }"
            >
              {{ range.description }}
            </li>
          </ol>
          <!-- custom relative/absolute -->
          <ai-custom-date-time
            *ngIf="selectingCustomRange"
            (rangeChange)="rangeChange($event)"
            [range]="selected"
            [hasRelative]="hasRelative"
            [hasAbsolute]="hasAbsolute"
          ></ai-custom-date-time>
        </div>
        <div class="iot--date-time-picker__menu-btn-set">
          <button
            *ngIf="selectingCustomRange"
            (click)="onBack()"
            ibmButton="secondary"
            class="iot--date-time-picker__menu-btn iot--date-time-picker__menu-btn-cancel"
            type="button"
            size="field"
          >
            Back
          </button>
          <button
            *ngIf="!selectingCustomRange"
            ibmButton="secondary"
            (click)="onCancel()"
            class="iot--date-time-picker__menu-btn iot--date-time-picker__menu-btn-cancel"
            type="button"
            size="field"
          >
            Cancel
          </button>
          <button
            ibmButton="primary"
            (click)="onApply()"
            class="iot--date-time-picker__menu-btn iot--date-time-picker__menu-btn-apply"
            type="button"
            size="field"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      /* fix for tooltip trigger styles forcing a 1rem font size (???) */
      .iot--date-time-picker__box {
        font-size: inherit;
      }
    `,
  ],
})
export class DateTimePickerComponent implements OnChanges, OnInit {
  @HostBinding('class.iot--date-time-picker__wrapper') wrapper = true;

  @Input() dateTimeRanges: DateTimeRange[] = [
    {
      key: 'LAST_30_MINUTES',
      description: 'Last 30 minutes',
      getRange: () => {
        const now = new Date();
        const previous = subMinutes(now, 30);
        return [previous, now];
      },
    },
    {
      key: 'LAST_1_HOUR',
      description: 'Last 1 hour',
      getRange: () => {
        const now = new Date();
        const previous = subHours(now, 1);
        return [previous, now];
      },
    },
    {
      key: 'LAST_6_HOURS',
      description: 'Last 6 hours',
      getRange: () => {
        const now = new Date();
        const previous = subHours(now, 6);
        return [previous, now];
      },
    },
    {
      key: 'LAST_12_HOURS',
      description: 'Last 12 hours',
      getRange: () => {
        const now = new Date();
        const previous = subHours(now, 12);
        return [previous, now];
      },
    },
    {
      key: 'LAST_24_HOURS',
      description: 'Last 24 hours',
      getRange: () => {
        const now = new Date();
        const previous = subHours(now, 24);
        return [previous, now];
      },
    },
  ];
  @Input() selected: DateTimeSelection = null;
  @Input() hasRelative = true;
  @Input() hasAbsolute = true;
  @Input() theme: 'light' | null = null;
  @Output() selectedChange: EventEmitter<DateTimeSelection> = new EventEmitter();
  @Output() apply: EventEmitter<DateRange> = new EventEmitter();
  @Output() cancel: EventEmitter<void> = new EventEmitter();

  // contains the selection from before a custom selection was made (to handle the "back" case)
  previousSelection: DateTimeSelection = null;
  selectingCustomRange = false;
  expanded = false;

  get tooltipOffset() {
    return { x: 0, y: 4 };
  }

  constructor(protected elementRef: ElementRef) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.selected?.currentValue) {
      const [type] = changes.selected.currentValue;
      if (type === 'RELATIVE' || type === 'ABSOLUTE') {
        this.selectingCustomRange = true;
      }
    }
  }

  ngOnInit() {
    if (!this.selected) {
      this.selected = [this.dateTimeRanges[0].key];
    }
  }

  formatCurrentRangeTitle() {
    const [rangeOrType] = this.selected;
    if (rangeOrType === 'RELATIVE' || rangeOrType === 'ABSOLUTE') {
      return this.formatCustomRange();
    }
    const range = this.dateTimeRanges.find((range) => range.key === rangeOrType);
    return range.description;
  }

  formatCurrentRange() {
    const [rangeOrType] = this.selected;
    if (rangeOrType === 'RELATIVE' || rangeOrType === 'ABSOLUTE') {
      return this.formatCustomRange();
    }
    const range = this.dateTimeRanges.find((range) => range.key === rangeOrType);
    const [start, end] = range.getRange();
    // TODO: provide a way to customize this for g11n
    const formatString = 'yyyy-M-d HH:mm';
    let endFormatted = format(end, formatString);
    if (isThisMinute(end)) {
      endFormatted = 'Now';
    }
    return `${format(start, formatString)} to ${endFormatted}`;
  }

  formatCustomRange() {
    // TODO: provide a way to customize this for g11n
    const formatString = 'yyyy-M-d HH:mm';
    const [type, start, end, relativeConfig] = this.selected;
    if (type === 'ABSOLUTE') {
      return `${format(start, formatString)} to ${format(end, formatString)}`;
    } else if (type === 'RELATIVE') {
      const [start, end] = getRangeFromRelative(relativeConfig);
      return `${format(start, formatString)} to ${format(end, formatString)}`;
    }
  }

  selectPresetRange(range: DateTimeRange) {
    // set the selected value so the view updates
    this.selected = [range.key];
  }

  rangeChange(change: DateTimeSelection) {
    // store the previous selection if we don't have one yet
    if (!this.previousSelection) {
      this.previousSelection = this.selected;
    }
    this.selected = change;
  }

  onBack() {
    this.selectingCustomRange = false;
    if (this.previousSelection) {
      this.selected = this.previousSelection;
      // we've gone back, clear out any previous slection
      this.previousSelection = null;
    }
  }

  onApply() {
    const [rangeOrType, start, end] = this.selected;
    if (this.selectingCustomRange) {
      this.apply.emit([start, end]);
      this.selectedChange.emit(this.selected);
    } else {
      // emit the date range
      const range = this.dateTimeRanges.find((range) => range.key === rangeOrType);
      this.selected = [range.key, ...range.getRange()];
      this.selectedChange.emit(this.selected);
      this.apply.emit(range.getRange());
    }
    this.expanded = false;
  }

  onCancel() {
    this.cancel.emit();
    this.expanded = false;
  }

  navigateList(event: KeyboardEvent) {
    const target = event.target as HTMLElement;
    switch (event.key) {
      case 'ArrowUp': {
        const prev = target.previousElementSibling as HTMLElement;
        console.log(prev);
        if (prev?.hasAttribute('tabindex')) {
          target.tabIndex = -1;
          prev.tabIndex = 0;
          prev.focus();
        }
        break;
      }
      case 'ArrowDown': {
        const next = target.nextElementSibling as HTMLElement;
        if (next?.hasAttribute('tabindex')) {
          target.tabIndex = -1;
          next.tabIndex = 0;
          next.focus();
        }
        break;
      }
    }
  }

  togglePicker() {
    this.expanded = !this.expanded;
    if (this.expanded) {
      const nativeElement: HTMLElement = this.elementRef.nativeElement;
      const selected: HTMLElement = nativeElement.querySelector(
        '.iot--date-time-picker__listitem--preset-selected'
      );
      setTimeout(() => selected.focus());
    }
  }
}
