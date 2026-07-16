import { useMount } from "ahooks";
import { Popover } from "antd";
import type { TFunction } from "i18next";
import type { FC } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSnapshot } from "valtio";
import { listClipboardItemDates } from "@/commands";
import ClipboardGroupIcon from "@/components/ClipboardGroupIcon";
import Tooltip from "@/components/Tooltip";
import { TAURI_EVENT } from "@/constants/events";
import { useKeyboardEvent } from "@/hooks/useKeyboardEvent";
import { useTauriListen } from "@/hooks/useTauriListen";
import { clipboardViewState } from "@/stores/clipboardView";
import type {
  ClipboardCategory,
  ClipboardGroupIcon as ClipboardGroupIconValue,
} from "@/types/clipboard";
import { cn } from "@/utils/cn";
import { log } from "@/utils/log";

interface CategoryFilterOption {
  labelKey: string;
  value: ClipboardCategory;
  icon: ClipboardGroupIconValue;
}

interface DateFilterCalendarProps {
  availableDates: Set<string>;
  onClearDate: () => void;
  onSelectDate: (date: string) => void;
  panelMonth: Date;
  selectedDate: string | null;
  setPanelMonth: (month: Date) => void;
  t: TFunction<"clipboard">;
}

const CATEGORY_FILTER_OPTIONS: CategoryFilterOption[] = [
  { icon: "i-lets-icons:file-dock", labelKey: "groups.text", value: "text" },
  { icon: "i-lets-icons:img-box", labelKey: "groups.image", value: "image" },
  {
    icon: "i-lets-icons:folder-file-alt",
    labelKey: "groups.files",
    value: "files",
  },
];

const FILTER_BUTTON_CLASS =
  "flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-1.5 border-0 bg-transparent p-0 transition-colors";

/**
 * 剪贴板列表筛选条：左侧日期筛选，右侧内容类型筛选。
 */
const FilterBar: FC = () => {
  const { t } = useTranslation("clipboard");
  const { category, date } = useSnapshot(clipboardViewState);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [availableDates, setAvailableDates] = useState<Set<string>>(
    () => new Set(),
  );
  const [panelMonth, setPanelMonth] = useState(() => startOfMonth(new Date()));

  /**
   * 从 Rust 拉取有记录的日期，用于月历状态点。
   */
  const loadAvailableDates = async () => {
    try {
      const dates = await listClipboardItemDates();

      setAvailableDates(new Set(dates));
    } catch (error) {
      log.warn("load clipboard item dates failed", error);
    }
  };

  const selectDate = (nextDate: string) => {
    clipboardViewState.date = nextDate;
    setCalendarOpen(false);
  };

  const clearDate = () => {
    clipboardViewState.date = null;
    setCalendarOpen(false);
  };

  const handleCalendarOpenChange = (open: boolean) => {
    setCalendarOpen(open);

    if (!open) return;

    if (clipboardViewState.date) {
      setPanelMonth(startOfMonth(parseLocalDate(clipboardViewState.date)));
    }

    void loadAvailableDates();
  };

  /**
   * 切换分类；再次点击当前分类时取消。
   */
  const toggleCategory = (value: ClipboardCategory) => {
    clipboardViewState.category =
      clipboardViewState.category === value ? null : value;
  };

  const handleCategoryClick = (value: ClipboardCategory) => {
    toggleCategory(value);
  };

  /**
   * Shift+Tab 在取消筛选、文本、图片、文件之间循环。
   */
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Tab" || !event.shiftKey) return;

    event.preventDefault();
    selectNextCategory();
  };

  const selectNextCategory = () => {
    const options = CATEGORY_FILTER_OPTIONS.map((option) => {
      return option.value;
    });
    const currentCategory = clipboardViewState.category;
    if (!currentCategory) {
      clipboardViewState.category = options[0];
      return;
    }

    const currentIndex = options.indexOf(currentCategory);
    if (currentIndex === options.length - 1) {
      clipboardViewState.category = null;
      return;
    }

    clipboardViewState.category = options[currentIndex + 1];
  };

  const renderCategoryButton = (option: CategoryFilterOption) => {
    const selected = category === option.value;

    return (
      <Tooltip key={option.value} title={t(option.labelKey)}>
        <button
          className={cn(FILTER_BUTTON_CLASS, {
            "bg-ant-primary text-ant-light-solid": selected,
            "text-ant-secondary hover:bg-ant-fill-tertiary": !selected,
          })}
          onClick={() => {
            handleCategoryClick(option.value);
          }}
          type="button"
        >
          <ClipboardGroupIcon icon={option.icon} selected={selected} />
        </button>
      </Tooltip>
    );
  };

  useMount(() => {
    void loadAvailableDates();
  });

  useTauriListen(TAURI_EVENT.CLIPBOARD_UPDATED, () => {
    void loadAvailableDates();
  });

  useKeyboardEvent("keydown", handleKeyDown);

  return (
    <div
      className="flex items-center justify-between gap-2 overflow-hidden px-3 pb-2"
      data-tauri-drag-region
    >
      <Popover
        content={
          <DateFilterCalendar
            availableDates={availableDates}
            onClearDate={clearDate}
            onSelectDate={selectDate}
            panelMonth={panelMonth}
            selectedDate={date}
            setPanelMonth={setPanelMonth}
            t={t}
          />
        }
        onOpenChange={handleCalendarOpenChange}
        open={calendarOpen}
        placement="bottomLeft"
        trigger="click"
      >
        <button
          className={cn(
            "flex h-6 min-w-0 max-w-32 items-center gap-1 rounded-1.5 border-0 bg-transparent px-1.5 text-sm transition-colors",
            {
              "bg-ant-primary text-ant-light-solid": Boolean(date),
              "text-ant-secondary hover:bg-ant-fill-tertiary": !date,
            },
          )}
          type="button"
        >
          <i aria-hidden="true" className="i-lucide:calendar-days shrink-0" />
          <span className="truncate">{date ?? t("groups.allDates")}</span>
        </button>
      </Popover>

      <div className="flex shrink-0 items-center gap-1">
        {CATEGORY_FILTER_OPTIONS.map(renderCategoryButton)}
      </div>
    </div>
  );
};

const DateFilterCalendar: FC<DateFilterCalendarProps> = (props) => {
  const {
    availableDates,
    onClearDate,
    onSelectDate,
    panelMonth,
    selectedDate,
    setPanelMonth,
    t,
  } = props;
  const monthCells = buildMonthCells(panelMonth);
  const monthLabel = new Intl.DateTimeFormat(void 0, {
    month: "long",
    year: "numeric",
  }).format(panelMonth);
  const weekdayLabels = buildWeekdayLabels();

  const showPreviousMonth = () => {
    setPanelMonth(addMonths(panelMonth, -1));
  };

  const showNextMonth = () => {
    setPanelMonth(addMonths(panelMonth, 1));
  };

  return (
    <div className="w-64 p-1 text-ant-text">
      <div className="mb-2 flex items-center justify-between gap-2">
        <button
          aria-label={t("groups.previousMonth")}
          className="flex size-6 items-center justify-center rounded-1.5 border-0 bg-transparent text-ant-secondary hover:bg-ant-fill-tertiary"
          onClick={showPreviousMonth}
          type="button"
        >
          <i aria-hidden="true" className="i-lucide:chevron-left" />
        </button>

        <span className="min-w-0 flex-1 truncate text-center font-medium text-sm">
          {monthLabel}
        </span>

        <button
          aria-label={t("groups.nextMonth")}
          className="flex size-6 items-center justify-center rounded-1.5 border-0 bg-transparent text-ant-secondary hover:bg-ant-fill-tertiary"
          onClick={showNextMonth}
          type="button"
        >
          <i aria-hidden="true" className="i-lucide:chevron-right" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekdayLabels.map((label) => {
          return (
            <span
              className="flex h-5 items-center justify-center text-ant-secondary text-xs"
              key={label}
            >
              {label}
            </span>
          );
        })}

        {monthCells.map((cell) => {
          const dateValue = formatLocalDate(cell);
          const currentMonth = isSameMonth(cell, panelMonth);
          const selected = selectedDate === dateValue;
          const hasItems = availableDates.has(dateValue);

          return (
            <button
              className={cn(
                "relative flex h-7 items-center justify-center rounded-1.5 border-0 bg-transparent text-sm transition-colors",
                {
                  "bg-ant-primary text-ant-light-solid hover:bg-ant-primary":
                    selected,
                  "text-ant-disabled": !currentMonth,
                  "text-ant-text hover:bg-ant-fill-tertiary": currentMonth,
                },
              )}
              key={dateValue}
              onClick={() => {
                onSelectDate(dateValue);
              }}
              type="button"
            >
              {cell.getDate()}
              {hasItems ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute bottom-0.5 size-1 rounded-full bg-ant-primary",
                    {
                      "bg-ant-light-solid": selected,
                    },
                  )}
                />
              ) : null}
            </button>
          );
        })}
      </div>

      <button
        className="mt-2 h-7 w-full rounded-1.5 border-0 bg-transparent text-ant-secondary text-sm hover:bg-ant-fill-tertiary"
        onClick={onClearDate}
        type="button"
      >
        {t("groups.allDates")}
      </button>
    </div>
  );
};

function buildWeekdayLabels() {
  const formatter = new Intl.DateTimeFormat(void 0, { weekday: "narrow" });
  const baseSunday = new Date(2026, 0, 4);

  return Array.from({ length: 7 }, (_item, index) => {
    return formatter.format(addDays(baseSunday, index));
  });
}

function buildMonthCells(month: Date) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = addDays(firstDay, -firstDay.getDay());

  return Array.from({ length: 42 }, (_item, index) => {
    return addDays(start, index);
  });
}

function addDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function addMonths(date: Date, months: number) {
  return startOfMonth(
    new Date(date.getFullYear(), date.getMonth() + months, 1),
  );
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function isSameMonth(date: Date, month: Date) {
  return (
    date.getFullYear() === month.getFullYear() &&
    date.getMonth() === month.getMonth()
  );
}

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseLocalDate(value: string) {
  const [year = "", month = "", day = ""] = value.split("-");

  return new Date(Number(year), Number(month) - 1, Number(day));
}

export default FilterBar;
