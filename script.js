let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();
let events = [];
let editingIndex = -1;

document.getElementById('save-event').addEventListener('click', saveEvent);
document.getElementById('close-modal').addEventListener('click', closeModal);

function generateCalendar() {
  const calendar = document.getElementById('calendar');
  calendar.innerHTML = '';

  const monthName = getMonthName(currentMonth);
  document.getElementById('current-month-year').textContent = `Viewing: ${monthName} ${currentYear}`;
  document.getElementById('month-select').value = currentMonth;
  document.getElementById('year-input').value = currentYear;

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  dayNames.forEach(day => {
    const cell = document.createElement('div');
    cell.className = 'day header';
    cell.textContent = day;
    calendar.appendChild(cell);
  });

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    const blank = document.createElement('div');
    blank.className = 'day';
    calendar.appendChild(blank);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement('div');
    cell.className = 'day';
    cell.textContent = day;
    cell.dataset.day = day;

    const matchingEvent = events.find(e => e.day === day && e.month === currentMonth && e.year === currentYear);
    if (matchingEvent) {
      const dot = document.createElement('div');
      dot.className = `event-dot ${matchingEvent.category || 'personal'}`;
      cell.appendChild(dot);
    }

    cell.addEventListener('click', () => openModal(day));
    calendar.appendChild(cell);
  }

  displayEvents();
}

function getMonthName(month) {
  return new Date(2000, month, 1).toLocaleString('default', { month: 'long' });
}

function prevMonth() {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  generateCalendar();
}

function nextMonth() {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  generateCalendar();
}

function setYearMonth() {
  currentYear = parseInt(document.getElementById('year-input').value);
  currentMonth = parseInt(document.getElementById('month-select').value);
  generateCalendar();
}

function openModal(day, editIndex = -1) {
  document.getElementById('event-modal').style.display = 'flex';
  document.getElementById('modal-title').textContent = `Event - ${day} ${getMonthName(currentMonth)}`;
  document.getElementById('event-name').value = '';
  document.getElementById('event-time').value = '';
  document.getElementById('modal-category').value = 'personal';
  document.getElementById('save-event').dataset.day = day;

  if (editIndex !== -1) {
    const ev = events[editIndex];
    document.getElementById('event-name').value = ev.name;
    document.getElementById('event-time').value = ev.time;
    document.getElementById('modal-category').value = ev.category || 'personal';
    editingIndex = editIndex;
  } else {
    editingIndex = -1;
  }
}

function closeModal() {
  document.getElementById('event-modal').style.display = 'none';
  editingIndex = -1;
}

function saveEvent() {
  const name = document.getElementById('event-name').value.trim();
  const time = document.getElementById('event-time').value.trim();
  const category = document.getElementById('modal-category').value;
  const day = parseInt(document.getElementById('save-event').dataset.day);

  if (!name || !time) {
    alert("Please enter both name and time.");
    return;
  }

  if (editingIndex !== -1) {
    events[editingIndex].name = name;
    events[editingIndex].time = time;
    events[editingIndex].category = category;
  } else {
    const monthly = events.filter(e => e.year === currentYear && e.month === currentMonth);
    if (monthly.length >= 3) {
      alert("Only 3 events allowed per month.");
      closeModal();
      return;
    }
    events.push({ name, time, day, month: currentMonth, year: currentYear, category });
  }

  saveToLocalStorage();
  closeModal();
  generateCalendar();
}

function displayEvents() {
  const ul = document.querySelector('#event-list ul');
  ul.innerHTML = '';

  events
    .filter(e => e.year === currentYear && e.month === currentMonth)
    .forEach((e, i) => {
      const li = document.createElement('li');
      li.innerHTML = `
        ${e.day}: ${e.name} at ${e.time} (${e.category})
        <button onclick="openModal(${e.day}, ${i})">✏️</button>
        <button onclick="deleteEvent(${i})">🗑️</button>
      `;
      ul.appendChild(li);
    });
}

function deleteEvent(index) {
  if (confirm("Delete this event?")) {
    events.splice(index, 1);
    saveToLocalStorage();
    generateCalendar();
  }
}

function saveToLocalStorage() {
  localStorage.setItem('events', JSON.stringify(events));
}

window.onload = () => {
  const saved = localStorage.getItem('events');
  if (saved) events = JSON.parse(saved);
  generateCalendar();

  // Dark mode toggle
  document.getElementById('dark-mode-toggle').addEventListener('change', () => {
    document.body.classList.toggle('dark');
    localStorage.setItem('darkMode', document.body.classList.contains('dark') ? 'enabled' : 'disabled');
  });

  if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark');
    document.getElementById('dark-mode-toggle').checked = true;
  }
};
