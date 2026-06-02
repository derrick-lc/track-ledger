const STORAGE_KEY = "our-ledger-v1";

const categories = [
  { name: "吃饭", icon: "dining", color: "#f25f68" },
  { name: "超市", icon: "basket", color: "#ff9b45" },
  { name: "交通", icon: "car", color: "#ffd166" },
  { name: "房租水电", icon: "home", color: "#31c6d4" },
  { name: "购物", icon: "bag", color: "#42a5f5" },
  { name: "娱乐", icon: "ticket", color: "#6767e8" },
  { name: "旅游", icon: "plane", color: "#a66df2" },
  { name: "医疗", icon: "heart", color: "#e36ad8" },
  { name: "转账", icon: "wallet", color: "#f47f9a" },
  { name: "其他", icon: "tag", color: "#8bd450" },
];

const els = {
  form: document.querySelector("#entryForm"),
  monthPicker: document.querySelector("#monthPicker"),
  monthPickerButton: document.querySelector("#monthPickerButton"),
  monthPickerLabel: document.querySelector("#monthPickerLabel"),
  prevMonth: document.querySelector("#prevMonth"),
  nextMonth: document.querySelector("#nextMonth"),
  date: document.querySelector("#dateInput"),
  datePickerButton: document.querySelector("#datePickerButton"),
  datePickerLabel: document.querySelector("#datePickerLabel"),
  amount: document.querySelector("#amountInput"),
  category: document.querySelector("#categoryInput"),
  note: document.querySelector("#noteInput"),
  recordsList: document.querySelector("#recordsList"),
  emptyState: document.querySelector("#emptyState"),
  template: document.querySelector("#recordTemplate"),
  search: document.querySelector("#searchInput"),
  filterCategory: document.querySelector("#filterCategory"),
  totalExpense: document.querySelector("#totalExpense"),
  totalIncome: document.querySelector("#totalIncome"),
  netExpense: document.querySelector("#netExpense"),
  todayExpense: document.querySelector("#todayExpense"),
  recordCount: document.querySelector("#recordCount"),
  todayDate: document.querySelector("#todayDate"),
  activeFilter: document.querySelector("#activeFilter"),
  analysisSubtitle: document.querySelector("#analysisSubtitle"),
  categoryChart: document.querySelector("#categoryChart"),
  categoryDonut: document.querySelector("#categoryDonut"),
  donutTotal: document.querySelector("#donutTotal"),
  donutCaption: document.querySelector("#donutCaption"),
  dailyChart: document.querySelector("#dailyChart"),
  trendTitle: document.querySelector("#trendTitle"),
  trendSubtitle: document.querySelector("#trendSubtitle"),
  topCategoryLabel: document.querySelector("#topCategoryLabel"),
  topCategory: document.querySelector("#topCategory"),
  topCategoryAmount: document.querySelector("#topCategoryAmount"),
  topSingleLabel: document.querySelector("#topSingleLabel"),
  topSingleTitle: document.querySelector("#topSingleTitle"),
  topSingleAmount: document.querySelector("#topSingleAmount"),
  topDayLabel: document.querySelector("#topDayLabel"),
  topDay: document.querySelector("#topDay"),
  topDayAmount: document.querySelector("#topDayAmount"),
  avgDailyLabel: document.querySelector("#avgDailyLabel"),
  avgDaily: document.querySelector("#avgDaily"),
  spendDays: document.querySelector("#spendDays"),
  expenseAnalysis: document.querySelector("#expenseAnalysis"),
  incomeAnalysis: document.querySelector("#incomeAnalysis"),
  monthlyMode: document.querySelector("#monthlyMode"),
  yearlyMode: document.querySelector("#yearlyMode"),
  navButtons: document.querySelectorAll(".nav-button"),
  openEntryButton: document.querySelector("#openEntryButton"),
  entrySheet: document.querySelector("#entrySheet"),
  homeView: document.querySelector("#homeView"),
  analysisView: document.querySelector("#analysisView"),
  monthSheet: document.querySelector("#monthSheet"),
  monthGrid: document.querySelector("#monthGrid"),
  sheetYear: document.querySelector("#sheetYear"),
  prevYear: document.querySelector("#prevYear"),
  nextYear: document.querySelector("#nextYear"),
  clearMonth: document.querySelector("#clearMonth"),
  thisMonth: document.querySelector("#thisMonth"),
  dateSheet: document.querySelector("#dateSheet"),
  dateSheetTitle: document.querySelector("#dateSheetTitle"),
  dateGrid: document.querySelector("#dateGrid"),
  prevDateMonth: document.querySelector("#prevDateMonth"),
  nextDateMonth: document.querySelector("#nextDateMonth"),
  clearDate: document.querySelector("#clearDate"),
  todayDateButton: document.querySelector("#todayDateButton"),
  exportButton: document.querySelector("#exportButton"),
  importInput: document.querySelector("#importInput"),
};

let entries = loadEntries();
let pickerYear = new Date().getFullYear();
let datePickerMonth = formatDate(new Date()).slice(0, 7);
let analysisMode = "month";
let analysisType = "expense";

function formatDate(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function monthKey(dateString) {
  return dateString.slice(0, 7);
}

function yearKey(dateString) {
  return dateString.slice(0, 4);
}

function currency(value) {
  return Number(value).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function loadEntries() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : seedEntries();
  } catch {
    return seedEntries();
  }
}

function saveEntries() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function seedEntries() {
  const today = formatDate();
  const sample = [
    {
      id: crypto.randomUUID(),
      type: "expense",
      date: today,
      amount: 45.8,
      category: "吃饭",
      note: "晚饭",
    },
    {
      id: crypto.randomUUID(),
      type: "expense",
      date: today,
      amount: 22.7,
      category: "交通",
      note: "加油",
    },
  ];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sample));
  return sample;
}

function init() {
  const today = new Date();
  els.date.value = formatDate(today);
  datePickerMonth = monthKey(els.date.value);
  els.monthPicker.value = formatDate(today).slice(0, 7);
  pickerYear = today.getFullYear();
  els.todayDate.textContent = today.toLocaleDateString("zh-CN", {
    month: "long",
    day: "numeric",
  });

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.name;
    option.textContent = category.name;
    els.category.append(option);

    const filterOption = document.createElement("option");
    filterOption.value = category.name;
    filterOption.textContent = category.name;
    els.filterCategory.append(filterOption);
  });
  document.querySelectorAll("[data-custom-select]").forEach(enhanceSelect);

  bindEvents();
  renderMonthPicker();
  renderDatePicker();
  setView("home");
  render();
}

function bindEvents() {
  els.form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(els.form);
    const amount = Number(els.amount.value);

    if (!Number.isFinite(amount) || amount <= 0) return;

    entries.unshift({
      id: crypto.randomUUID(),
      type: formData.get("type"),
      date: els.date.value,
      amount,
      category: els.category.value,
      note: els.note.value.trim(),
    });

    saveEntries();
    els.amount.value = "";
    els.note.value = "";
    els.date.value = formatDate(new Date());
    datePickerMonth = monthKey(els.date.value);
    renderDatePicker();
    els.monthPicker.value = monthKey(entries[0].date);
    renderMonthPicker();
    render();
    closeEntrySheet();
    els.amount.focus();
  });

  els.recordsList.addEventListener("click", (event) => {
    const button = event.target.closest(".delete-button");
    if (!button) return;
    entries = entries.filter((entry) => entry.id !== button.dataset.id);
    saveEntries();
    render();
  });

  els.search.addEventListener("input", render);
  els.filterCategory.addEventListener("change", render);

  els.prevMonth.addEventListener("click", () => moveMonth(-1));
  els.nextMonth.addEventListener("click", () => moveMonth(1));
  els.monthPickerButton.addEventListener("click", openMonthSheet);
  els.prevYear.addEventListener("click", () => movePickerYear(-1));
  els.nextYear.addEventListener("click", () => movePickerYear(1));
  els.clearMonth.addEventListener("click", closeMonthSheet);
  els.thisMonth.addEventListener("click", selectThisMonth);
  els.monthSheet.addEventListener("click", (event) => {
    if (event.target.matches("[data-close-sheet]")) closeMonthSheet();
  });
  els.navButtons.forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.view));
  });
  els.openEntryButton.addEventListener("click", openEntrySheet);
  els.entrySheet.addEventListener("click", (event) => {
    if (event.target.matches("[data-close-entry-sheet]")) closeEntrySheet();
  });
  [els.monthlyMode, els.yearlyMode].forEach((input) => {
    input.addEventListener("change", () => {
      analysisMode = input.value;
      render();
    });
  });
  [els.expenseAnalysis, els.incomeAnalysis].forEach((input) => {
    input.addEventListener("change", () => {
      analysisType = input.value;
      render();
    });
  });
  els.datePickerButton.addEventListener("click", openDateSheet);
  els.prevDateMonth.addEventListener("click", () => moveDateMonth(-1));
  els.nextDateMonth.addEventListener("click", () => moveDateMonth(1));
  els.clearDate.addEventListener("click", closeDateSheet);
  els.todayDateButton.addEventListener("click", selectTodayDate);
  els.dateSheet.addEventListener("click", (event) => {
    if (event.target.matches("[data-close-date-sheet]")) closeDateSheet();
  });
  els.exportButton.addEventListener("click", exportEntries);
  els.importInput.addEventListener("change", importEntries);
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".custom-select")) closeCustomSelects();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeCustomSelects();
  });
}

function enhanceSelect(select) {
  select.classList.add("native-select-hidden");

  const wrapper = document.createElement("div");
  wrapper.className = "custom-select";

  const button = document.createElement("button");
  button.className = "custom-select-button";
  button.type = "button";
  button.setAttribute("aria-haspopup", "listbox");

  const menu = document.createElement("div");
  menu.className = "custom-select-menu";
  menu.setAttribute("role", "listbox");
  menu.hidden = true;

  select.insertAdjacentElement("afterend", wrapper);
  wrapper.append(button, menu);

  const syncButton = () => {
    const selected = select.options[select.selectedIndex];
    button.textContent = selected ? selected.textContent : "";
  };

  const renderOptions = () => {
    menu.innerHTML = "";
    Array.from(select.options).forEach((option) => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "custom-select-option";
      item.textContent = option.textContent;
      item.setAttribute("role", "option");
      item.classList.toggle("selected", option.value === select.value);
      item.setAttribute("aria-selected", option.value === select.value ? "true" : "false");
      item.addEventListener("click", () => {
        select.value = option.value;
        syncButton();
        renderOptions();
        closeCustomSelects();
        select.dispatchEvent(new Event("change", { bubbles: true }));
      });
      menu.append(item);
    });
  };

  button.addEventListener("click", () => {
    const willOpen = menu.hidden;
    closeCustomSelects();
    menu.hidden = !willOpen;
    wrapper.classList.toggle("open", willOpen);
    if (willOpen) renderOptions();
  });

  select.addEventListener("change", () => {
    syncButton();
    renderOptions();
  });

  syncButton();
  renderOptions();
}

function closeCustomSelects() {
  document.querySelectorAll(".custom-select").forEach((select) => {
    select.classList.remove("open");
    const menu = select.querySelector(".custom-select-menu");
    if (menu) menu.hidden = true;
  });
}

function moveMonth(delta) {
  const [year, month] = els.monthPicker.value.split("-").map(Number);
  const date = new Date(year, month - 1 + delta, 1);
  els.monthPicker.value = formatDate(date).slice(0, 7);
  pickerYear = Number(els.monthPicker.value.slice(0, 4));
  renderMonthPicker();
  render();
}

function setSelectedMonth(month) {
  els.monthPicker.value = month;
  pickerYear = Number(month.slice(0, 4));
  renderMonthPicker();
  closeMonthSheet();
  render();
}

function renderMonthPicker() {
  const [year, month] = els.monthPicker.value.split("-");
  els.monthPickerLabel.innerHTML = `<small>${year}</small><strong>${month}月</strong>`;
  els.sheetYear.textContent = pickerYear;
  renderMonthGrid();
}

function renderMonthGrid() {
  const selectedMonth = els.monthPicker.value;
  const currentMonth = formatDate(new Date()).slice(0, 7);
  els.monthGrid.innerHTML = "";

  Array.from({ length: 12 }, (_, index) => index + 1).forEach((month) => {
    const value = `${pickerYear}-${String(month).padStart(2, "0")}`;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "month-cell";
    button.textContent = `${month}月`;
    if (value === selectedMonth) button.classList.add("selected");
    if (value === currentMonth) button.classList.add("current");
    button.addEventListener("click", () => setSelectedMonth(value));
    els.monthGrid.append(button);
  });
}

function openMonthSheet() {
  pickerYear = Number(els.monthPicker.value.slice(0, 4));
  renderMonthPicker();
  els.monthSheet.hidden = false;
  document.body.classList.add("sheet-open");
}

function closeMonthSheet() {
  els.monthSheet.hidden = true;
  document.body.classList.remove("sheet-open");
}

function movePickerYear(delta) {
  pickerYear += delta;
  renderMonthPicker();
}

function selectThisMonth() {
  setSelectedMonth(formatDate(new Date()).slice(0, 7));
}

function setView(view) {
  els.homeView.classList.toggle("active-view", view === "home");
  els.analysisView.classList.toggle("active-view", view === "analysis");
  document.body.classList.toggle("home-active", view === "home");
  document.body.classList.toggle("analysis-active", view === "analysis");
  els.navButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.view === view);
  });
}

function openEntrySheet() {
  setView("home");
  els.entrySheet.hidden = false;
  document.body.classList.add("entry-open");
}

function closeEntrySheet() {
  els.entrySheet.hidden = true;
  document.body.classList.remove("entry-open");
}

function renderDatePicker() {
  els.datePickerLabel.textContent = formatDateInputLabel(els.date.value);
  const [year, month] = datePickerMonth.split("-");
  els.dateSheetTitle.textContent = `${year}年${month}月`;
  renderDateGrid();
}

function renderDateGrid() {
  const [year, month] = datePickerMonth.split("-").map(Number);
  const firstDay = new Date(year, month - 1, 1);
  const start = new Date(year, month - 1, 1 - firstDay.getDay());
  const today = formatDate(new Date());
  const selected = els.date.value;
  els.dateGrid.innerHTML = "";

  Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const value = formatDate(date);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "date-cell";
    button.textContent = String(date.getDate());
    button.classList.toggle("muted-date", date.getMonth() !== month - 1);
    button.classList.toggle("today", value === today);
    button.classList.toggle("selected", value === selected);
    button.addEventListener("click", () => selectDate(value));
    els.dateGrid.append(button);
  });
}

function openDateSheet() {
  datePickerMonth = monthKey(els.date.value || formatDate(new Date()));
  renderDatePicker();
  els.dateSheet.hidden = false;
  document.body.classList.add("sheet-open");
}

function closeDateSheet() {
  els.dateSheet.hidden = true;
  document.body.classList.remove("sheet-open");
}

function selectDate(dateString) {
  els.date.value = dateString;
  datePickerMonth = monthKey(dateString);
  renderDatePicker();
  closeDateSheet();
}

function selectTodayDate() {
  selectDate(formatDate(new Date()));
}

function moveDateMonth(delta) {
  const [year, month] = datePickerMonth.split("-").map(Number);
  const date = new Date(year, month - 1 + delta, 1);
  datePickerMonth = monthKey(formatDate(date));
  renderDatePicker();
}

function visibleEntries() {
  const selectedMonth = els.monthPicker.value;
  const query = els.search.value.trim().toLowerCase();
  const selectedCategory = els.filterCategory.value;

  return entries
    .filter((entry) => monthKey(entry.date) === selectedMonth)
    .filter((entry) => selectedCategory === "all" || entry.category === selectedCategory)
    .filter((entry) => {
      if (!query) return true;
      return [entry.note, entry.category, entry.date]
        .join(" ")
        .toLowerCase()
        .includes(query);
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

function render() {
  const monthEntries = entries.filter((entry) => monthKey(entry.date) === els.monthPicker.value);
  const filtered = visibleEntries();
  renderSummary(monthEntries);
  renderRecords(filtered);
  renderAnalytics();

  const filterText = els.filterCategory.value === "all" ? "全部分类" : els.filterCategory.value;
  els.activeFilter.textContent = `显示 ${els.monthPicker.value} · ${filterText}`;
}

function renderSummary(monthEntries) {
  const totalExpense = sum(monthEntries, "expense");
  const totalIncome = sum(monthEntries, "income");
  const todayExpense = sum(
    entries.filter((entry) => entry.date === formatDate(new Date())),
    "expense",
  );

  els.totalExpense.textContent = currency(totalExpense);
  els.totalIncome.textContent = currency(totalIncome);
  els.netExpense.textContent = currency(totalExpense - totalIncome);
  els.todayExpense.textContent = currency(todayExpense);
  els.recordCount.textContent = `${monthEntries.length} 笔记录`;
}

function sum(list, type) {
  return list
    .filter((entry) => entry.type === type)
    .reduce((total, entry) => total + Number(entry.amount), 0);
}

function renderRecords(records) {
  els.recordsList.innerHTML = "";
  els.emptyState.style.display = records.length ? "none" : "block";

  records.forEach((entry) => {
    const node = els.template.content.cloneNode(true);
    const category = categories.find((item) => item.name === entry.category) || categories.at(-1);
    const amountPrefix = entry.type === "expense" ? "-" : "+";

    node.querySelector(".record-icon").innerHTML = categoryIcon(category.icon);
    node.querySelector(".record-icon").style.setProperty("--category-color", category.color);
    node.querySelector(".record-title").textContent = entry.note || entry.category;
    node.querySelector(".record-amount").textContent = `${amountPrefix}${currency(entry.amount)}`;
    node.querySelector(".record-amount").classList.add(entry.type);
    node.querySelector(".record-meta").textContent = `${entry.date} · ${entry.category}`;
    node.querySelector(".delete-button").dataset.id = entry.id;
    els.recordsList.append(node);
  });
}

function renderAnalytics() {
  renderPeriodAnalytics(analysisMode);
}

function renderPeriodAnalytics(mode) {
  const typeLabel = analysisType === "income" ? "收入" : "支出";
  const isYear = mode === "year";
  const selectedYear = els.monthPicker.value.slice(0, 4);
  const periodEntries = entries
    .filter((entry) => (isYear ? yearKey(entry.date) === selectedYear : monthKey(entry.date) === els.monthPicker.value))
    .filter((entry) => entry.type === analysisType);
  const totals = categoryTotals(periodEntries);
  const periodTotals = isYear ? monthlyTotals(periodEntries, selectedYear) : dayTotals(periodEntries);
  const activePeriodTotals = periodTotals.filter((item) => item.total > 0);
  const topSingle = periodEntries
    .slice()
    .sort((a, b) => Number(b.amount) - Number(a.amount))[0];

  els.analysisSubtitle.textContent = isYear ? `${selectedYear} 年度${typeLabel}结构和趋势` : `本月${typeLabel}结构和最高${typeLabel}`;
  els.topCategoryLabel.textContent = isYear ? `年度${typeLabel}最多` : `${typeLabel}最多`;
  els.topSingleLabel.textContent = isYear ? `年度最高单笔${typeLabel}` : `最高单笔${typeLabel}`;
  els.topDayLabel.textContent = isYear ? "最高月份" : "最高一天";
  els.avgDailyLabel.textContent = isYear ? `月均${typeLabel}` : `日均${typeLabel}`;
  els.donutCaption.textContent = isYear ? `本年${typeLabel}` : `本月${typeLabel}`;
  els.trendTitle.textContent = isYear ? `年度${typeLabel}` : `每日${typeLabel}`;
  els.trendSubtitle.textContent = isYear ? "按月份汇总" : `只显示有${typeLabel}的日期`;

  renderInsightCards(totals, activePeriodTotals, topSingle, mode, typeLabel);
  renderCategoryChart(totals, mode, typeLabel);
  if (isYear) {
    renderMonthlyTrend(periodTotals);
  } else {
    renderDailyChart(periodTotals);
  }
}

function categoryTotals(list) {
  return categories
    .map((category) => ({
      ...category,
      total: list
        .filter((entry) => entry.category === category.name)
        .reduce((value, entry) => value + Number(entry.amount), 0),
    }))
    .filter((item) => item.total > 0)
    .sort((a, b) => b.total - a.total);
}

function dayTotals(list) {
  const totalsByDay = list.reduce((days, entry) => {
    days[entry.date] = (days[entry.date] || 0) + Number(entry.amount);
    return days;
  }, {});

  return Object.entries(totalsByDay)
    .map(([date, total]) => ({ date, total }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function monthlyTotals(list, selectedYear) {
  return Array.from({ length: 12 }, (_, index) => {
    const month = String(index + 1).padStart(2, "0");
    const key = `${selectedYear}-${month}`;
    const total = list
      .filter((entry) => monthKey(entry.date) === key)
      .reduce((value, entry) => value + Number(entry.amount), 0);
    return { date: key, total };
  });
}

function renderInsightCards(totals, periodTotals, topSingle, mode, typeLabel) {
  const topCategory = totals[0];
  const topPeriod = periodTotals.slice().sort((a, b) => b.total - a.total)[0];
  const activePeriodCount = periodTotals.length;
  const average = activePeriodCount
    ? periodTotals.reduce((total, item) => total + item.total, 0) / activePeriodCount
    : 0;

  els.topCategory.textContent = topCategory ? topCategory.name : "暂无";
  els.topCategoryAmount.textContent = topCategory ? currency(topCategory.total) : "$0.00";
  els.topSingleTitle.textContent = topSingle ? topSingle.note || topSingle.category : "暂无";
  els.topSingleAmount.textContent = topSingle ? currency(topSingle.amount) : "$0.00";
  els.topDay.textContent = topPeriod ? formatPeriodLabel(topPeriod.date, mode) : "暂无";
  els.topDayAmount.textContent = topPeriod ? currency(topPeriod.total) : "$0.00";
  els.avgDaily.textContent = currency(average);
  els.spendDays.textContent = mode === "year" ? `${activePeriodCount} 个月有${typeLabel}` : `${activePeriodCount} 天有${typeLabel}`;
}

function renderCategoryChart(totals, mode, typeLabel) {
  els.categoryChart.innerHTML = "";
  const totalAmount = totals.reduce((total, item) => total + item.total, 0);
  els.donutTotal.textContent = currency(totalAmount);

  if (!totals.length) {
    els.categoryDonut.style.background = "#eef1eb";
    els.categoryChart.innerHTML = `<p class="empty-state inline-empty">${mode === "year" ? "本年" : "本月"}还没有${typeLabel}统计。</p>`;
    return;
  }

  renderDonut(totals, totalAmount);

  const max = totals[0].total;
  totals.forEach((item) => {
    const percent = totalAmount ? (item.total / totalAmount) * 100 : 0;
    const row = document.createElement("div");
    row.className = "chart-row";
    row.style.setProperty("--category-color", item.color);
    row.innerHTML = `
      <div class="category-badge">${categoryIcon(item.icon)}</div>
      <div class="chart-copy">
        <strong>${item.name}</strong>
        <span>${typeLabel}占比 ${percent.toFixed(1)}%</span>
      </div>
      <div class="chart-value">${currency(item.total)}</div>
      <div class="chart-track"><div class="chart-fill" style="width:${(item.total / max) * 100}%"></div></div>
    `;
    els.categoryChart.append(row);
  });
}

function renderDonut(totals, totalExpense) {
  let cursor = 0;
  const segments = totals.map((item) => {
    const start = cursor;
    const end = cursor + (item.total / totalExpense) * 360;
    cursor = end;
    return `${item.color} ${start}deg ${end}deg`;
  });

  els.categoryDonut.style.background = `conic-gradient(${segments.join(", ")})`;
}

function renderDailyChart(dailyTotals) {
  els.dailyChart.innerHTML = "";
  els.dailyChart.classList.toggle("income-bars", analysisType === "income");

  if (!dailyTotals.length) {
    els.dailyChart.innerHTML = `<p class="empty-state inline-empty">本月还没有每日${analysisType === "income" ? "收入" : "支出"}。</p>`;
    return;
  }

  const max = Math.max(...dailyTotals.map((day) => day.total));
  dailyTotals.forEach((day) => {
    const bar = document.createElement("div");
    bar.className = "daily-bar";
    bar.style.setProperty("--bar-height", `${Math.max((day.total / max) * 100, 8)}%`);
    bar.innerHTML = `
      <div class="daily-value">${currency(day.total)}</div>
      <div class="daily-track"><span></span></div>
      <div class="daily-label">${formatDayNumber(day.date)}</div>
    `;
    els.dailyChart.append(bar);
  });
}

function renderMonthlyTrend(monthTotals) {
  els.dailyChart.innerHTML = "";
  els.dailyChart.classList.toggle("income-bars", analysisType === "income");

  const max = Math.max(...monthTotals.map((month) => month.total));
  monthTotals.forEach((month) => {
    const bar = document.createElement("div");
    bar.className = "daily-bar month-bar";
    bar.style.setProperty("--bar-height", max ? `${Math.max((month.total / max) * 100, 8)}%` : "8%");
    bar.classList.toggle("empty", month.total === 0);
    bar.innerHTML = `
      <div class="daily-value">${month.total ? currency(month.total) : ""}</div>
      <div class="daily-track"><span></span></div>
      <div class="daily-label">${formatMonthNumber(month.date)}</div>
    `;
    els.dailyChart.append(bar);
  });
}

function formatDayNumber(dateString) {
  return String(Number(dateString.slice(8, 10)));
}

function formatDateInputLabel(dateString) {
  return dateString.replaceAll("-", "/");
}

function formatMonthNumber(monthString) {
  return `${Number(monthString.slice(5, 7))}月`;
}

function formatPeriodLabel(dateString, mode) {
  return mode === "year" ? formatMonthNumber(dateString) : formatDisplayDate(dateString);
}

function formatDisplayDate(dateString) {
  const [, month, day] = dateString.split("-");
  return `${Number(month)}月${Number(day)}日`;
}

function categoryIcon(type) {
  const icons = {
    home: `<path d="M5 11.5 12 5l7 6.5"/><path d="M7.5 10.5V19h9v-8.5"/><path d="M10.5 19v-5h3v5"/>`,
    bag: `<path d="M7 9h10l-.7 10H7.7L7 9Z"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0"/>`,
    tag: `<path d="M5 8h9l5 5-6 6-8-8V8Z"/><path d="M9 11h.01"/>`,
    dining: `<path d="M8 5v7"/><path d="M6 5v3.5a2 2 0 0 0 4 0V5"/><path d="M8 12v7"/><path d="M16 5v14"/><path d="M16 5c2 1.4 2.6 4.6 0 7"/>`,
    basket: `<path d="m7 10 2-4"/><path d="m17 10-2-4"/><path d="M5 10h14l-1.4 9H6.4L5 10Z"/><path d="M9 13v3"/><path d="M15 13v3"/>`,
    heart: `<path d="M12 19s-7-4.2-7-9a3.8 3.8 0 0 1 6.8-2.3A3.8 3.8 0 0 1 19 10c0 4.8-7 9-7 9Z"/><path d="M8.5 12h2l1-2 2 4 1-2h1.8"/>`,
    plane: `<path d="M4 12h16"/><path d="m13 5 7 7-7 7"/><path d="m6 8 3.5 4L6 16"/>`,
    car: `<path d="M6 16h12"/><path d="M7 16l1.5-5h7L17 16"/><path d="M8 16v2"/><path d="M16 16v2"/><path d="M8.5 13h7"/>`,
    ticket: `<path d="M5 8h14v3a2 2 0 0 0 0 4v3H5v-3a2 2 0 0 0 0-4V8Z"/><path d="M12 9.5v1"/><path d="M12 13.5v1"/><path d="M12 17.5v1"/>`,
    wallet: `<path d="M5 8h14v10H5z"/><path d="M5 10.5h10.5a2.5 2.5 0 0 1 0 5H5"/><path d="M16 13h.01"/>`,
  };

  return `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[type] || icons.tag}</svg>`;
}

function exportEntries() {
  const blob = new Blob([JSON.stringify(entries, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `我们的小账本-${formatDate(new Date())}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function importEntries(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      if (!Array.isArray(imported)) throw new Error("not-array");
      entries = imported
        .filter((entry) => entry.date && entry.amount && entry.category)
        .map((entry) => ({ ...entry, id: entry.id || crypto.randomUUID() }));
      saveEntries();
      render();
    } catch {
      alert("导入失败，请选择之前从本应用导出的 JSON 文件。");
    } finally {
      els.importInput.value = "";
    }
  };
  reader.readAsText(file);
}

init();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}
