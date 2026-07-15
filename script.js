

//=====================toggle btn======================

const themeToggle = document.getElementById("theme-btn"); 
const themeIcon = document.getElementById('theme-icon');
const lightLogo = document.querySelector('.light-theme-logo');
const darkLogo = document.querySelector('.dark-theme-logo');

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    if (document.body.classList.contains('dark')) {
        themeIcon.classList.remove('ri-sun-fill');
        themeIcon.classList.add('ri-moon-clear-fill');
        lightLogo.style.display = 'none';
        darkLogo.style.display = 'block';
    } else {
        themeIcon.classList.remove('ri-moon-clear-fill');
        themeIcon.classList.add('ri-sun-fill');
        lightLogo.style.display = 'block';
        darkLogo.style.display = 'none';
    }
});
//====================Dynamic-background================

const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function createParticle() {
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: Math.random() * 3 + 2,
    baseX: 0, baseY: 0
  };
}
const particles = Array.from({ length: 200 }, createParticle);
particles.forEach(p => { p.baseX = p.x; p.baseY = p.y; });

const mouse = { x: -999, y: -999 };
window.addEventListener('mousemove', e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

function update() {
  particles.forEach(p => {
    const dx = p.x - mouse.x;
    const dy = p.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
    const repelRadius = 80;
    if (dist < repelRadius) {
      const force = (repelRadius - dist) / repelRadius;
      p.x += (dx / dist) * force * 5;
      p.y += (dy / dist) * force * 5;
    } else {
      p.x += (p.baseX - p.x) * 0.05;
      p.y += (p.baseY - p.y) * 0.05;
    }
  });
}

function draw() {
  update();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fill();
  });
  requestAnimationFrame(draw);
}
draw();  

//===================banner-msg=============================
const welcomeMsg = document.querySelector('.welcome-msg');

function renderGreeting(name) {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 8) {
        welcomeMsg.textContent = `Morning, ${name}. Fresh start, fresh page`;
    } else if (hour >= 8 && hour < 12) {
        welcomeMsg.textContent = `Hope your morning's off to a good start, ${name}`;
    } else if (hour >= 12 && hour < 17) {
        welcomeMsg.textContent = `Halfway through the day, ${name}`;
    } else if (hour >= 17 && hour < 21) {
        welcomeMsg.textContent = `Still up, ${name}?`;
    } else {
        welcomeMsg.textContent = `The world's asleep, ${name} — you're not`;
    }
}

const currentName = localStorage.getItem('daybook-username') || 'Alex';
renderGreeting(currentName);
//==========================weather=========================

//=================weather==============

const WEATHER_API_KEY = "20b79d03456a8954a37207111145cc04"// "YOUR_API_KEY_HERE"; // from OpenWeatherMap
const DEFAULT_CITY = "Bangalore";

const weatherCard   = document.getElementById('weather-card');
const citySearch    = document.getElementById('city-search');
const humidityEl    = document.getElementById('humidity');
const tempEl        = document.getElementById('temp');
const conditionEl   = document.getElementById('main-weather');
const cityNameEl    = document.getElementById('city-name');
const windEl        = document.getElementById('speed-value');
const weatherImgEl  = document.getElementById('weather-img');


function classifyWeather(main, windSpeedKmh) {
    if (main === "Clear") {
        return { bucket: "sunny", icon: "./images/weather/sun.png" };
    }
    if (main === "Clouds") {
        return windSpeedKmh > 20
            ? { bucket: "cloudy", icon: "./images/weather/windy-cloud.png" }
            : { bucket: "sunny", icon: "./images/weather/cloudy.png" };
    }
    if (main === "Mist" || main === "Haze" || main === "Fog") {
        return { bucket: "cloudy", icon: "./images/weather/mist-fog.png" };
    }
    if (main === "Drizzle") {
        return { bucket: "rainy", icon: "./images/weather/drizzle.png" };
    }
    if (main === "Rain") {
        return { bucket: "rainy", icon: "./images/weather/rain.png" };
    }
    if (main === "Thunderstorm") {
        return { bucket: "rainy", icon: "./images/weather/thunder-strom.png" };
    }
    if (main === "Snow") {
        return { bucket: "cloudy", icon: "./images/weather/snow.png" };
    }
    return { bucket: "cloudy", icon: "./images/weather/cloudy.png" }; 
}

function applyWeather(data) {
    const tempC       = Math.round(data.main.temp);
    const humidity    = data.main.humidity;
    const windKmh     = Math.round(data.wind.speed * 3.6); 
    const main        = data.weather[0].main;
    const description = data.weather[0].description;
    const city        = data.name;

    const { bucket, icon } = classifyWeather(main, windKmh);

    weatherCard.classList.remove('weather-sunny', 'weather-cloudy', 'weather-rainy');
    weatherCard.classList.add(`weather-${bucket}`);

    weatherImgEl.style.backgroundImage = `url('${icon}')`;
    tempEl.textContent      = `${tempC}°`;
    conditionEl.textContent = description;
    cityNameEl.textContent  = city;
    humidityEl.textContent  = `${humidity}%`;
    windEl.textContent      = `${windKmh} km/h`;
}

async function fetchWeatherByCity(city) {
    try {
        const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${WEATHER_API_KEY}`
        );
        if (!res.ok) throw new Error("City not found");
        const data = await res.json();
        applyWeather(data);
        localStorage.setItem('daybook-city', city);
    } catch (err) {
        conditionEl.textContent = "Couldn't find that city";
    }
}

async function fetchWeatherByCoords(lat, lon) {
    try {
        const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`
        );
        const data = await res.json();
        applyWeather(data);
        localStorage.setItem('daybook-city', data.name);
    } catch (err) {
        fetchWeatherByCity(DEFAULT_CITY);
    }
}

citySearch.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && citySearch.value.trim() !== '') {
        fetchWeatherByCity(citySearch.value.trim());
        citySearch.value = '';
        citySearch.blur();
    }
});

function initWeather() {
    const savedCity = localStorage.getItem('daybook-city');
    if (savedCity) {
        fetchWeatherByCity(savedCity);
        return;
    }
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => fetchWeatherByCoords(position.coords.latitude, position.coords.longitude),
            () => fetchWeatherByCity(DEFAULT_CITY) 
        );
    } else {
        fetchWeatherByCity(DEFAULT_CITY);
    }
}

initWeather();


//=================calendar==============

const calendarHeader = document.getElementById('calendar-header');
const calendarWeekdays = document.getElementById('calendar-weekdays');
const calendarGrid = document.getElementById('calendar-grid');

const monthNames = ["January","February","March","April","May","June",
                     "July","August","September","October","November","December"];
const weekdayNames = ["S","M","T","W","T","F","S"];

function renderCalendar() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const todayDate = today.getDate();

   
    calendarHeader.textContent = `${monthNames[month]} ${year}`;

    
    calendarWeekdays.innerHTML = weekdayNames
        .map(day => `<span>${day}</span>`)
        .join('');

   
    const firstDayIndex = new Date(year, month, 1).getDay(); 
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let cells = '';

  
    for (let i = 0; i < firstDayIndex; i++) {
        cells += `<span></span>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = day === todayDate ? 'today' : '';
        cells += `<span class="${isToday}">${day}</span>`;
    }

    calendarGrid.innerHTML = cells;
}

renderCalendar();


//============time=========================

const clock = document.querySelector('.time');

function pad(n) {
    return n.toString().padStart(2, '0');
}

function updateClock() {
    const now = new Date();
    clock.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}
updateClock();              
setInterval(updateClock, 1000);

//===================Pomorodo========================


//moving to the page and back to dashboard
const sec1 = document.querySelector('.section1');
const sec2 = document.querySelector('.section2');
const pomorodoMore = document.querySelector('.more');
const pomoBackToDash = document.querySelector('.pomo-back');











//Accesing each card
const pomoPage = document.getElementById('pomo-setting-page');
const todoPage = document.querySelector('.todo-page');
const plannerPage = document.querySelector('.planner-page');
const goalsPage = document.querySelector('.goals-page');
const settingsPage = document.querySelector('.settings-page');








// functions to not change on reload=================
function showDashboard() {
    sec1.classList.add('active');
    sec2.classList.add('active');
    pomoPage.classList.remove('active');
    todoPage.classList.remove('active');
    plannerPage.classList.remove('active');
    goalsPage.classList.remove('active');
    settingsPage.classList.remove('active');
    localStorage.setItem('daybook-view', 'dashboard');
}




function showPomodoroPage() {
    sec1.classList.remove('active');
    sec2.classList.remove('active');
    pomoPage.classList.add('active');
    localStorage.setItem('daybook-view', 'pomodoro');
}

pomorodoMore.addEventListener('click', showPomodoroPage);
pomoBackToDash.addEventListener('click', (e) => {
    e.preventDefault();
    showDashboard();
});


//Alarm 

//===================Pomodoro core state===================

function format(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${pad(minutes)}:${pad(seconds)}`;
}

const PomoSettings = {
    focus: 25,
    shortBreak: 5,
    longBreak: 15,
    volume: 20,
};

let timerInterval = null;
let activeMode = 'focus';
let remainingSeconds = PomoSettings.focus * 60;
let isAlarmRinging = false;

const modeLabels = { focus: 'Focus', short: 'Short Break', long: 'Long Break' };
const modesOrder = ['focus', 'short', 'long'];

//===================All the elements, dashboard card + full page===================

const activeTimer   = document.querySelector('.active-timer');   // full page timer
const dashTimerEl    = document.getElementById('timer');          // dashboard card timer

const pomoStartBtn      = document.querySelector('.pomo-start-btn');  // full page
const dashStartPauseBtn = document.querySelector('.start-pause');      // dashboard card
const dashStartIcon     = dashStartPauseBtn.querySelector('i');
const dashStartLabel    = dashStartPauseBtn.querySelector('.start');

const pomoRestartBtn = document.querySelector('.pomo-restart'); // full page
const dashResetBtn   = document.querySelector('.reset');          // dashboard card

const dashModeBtn = document.getElementById('mode-btn'); //dashboard

const pomoFocusBtn = document.querySelector('.pomo-focus-mode');
const pomoShortBtn = document.querySelector('.pomo-short-mode');
const pomoLongBtn  = document.querySelector('.pomo-long-mode');
const modeButtons  = [pomoFocusBtn, pomoShortBtn, pomoLongBtn];

//===================Shared update functions (both card and page read from these)===================

function updateAllTimerDisplays() {
    const text = format(remainingSeconds);
    activeTimer.textContent = text;
    dashTimerEl.textContent = text;
}

function updateStartButtons(state) {
    if (state === 'pause') {
        pomoStartBtn.textContent = 'Pause';
        dashStartLabel.textContent = 'Pause';
        dashStartIcon.className = 'ri-pause-fill';
    } else {
        pomoStartBtn.textContent = 'Start';
        dashStartLabel.textContent = 'Start';
        dashStartIcon.className = 'ri-play-fill';
    }
}

function updateRestartVisibility(show) {
    pomoRestartBtn.style.display = show ? 'inline-flex' : 'none';
    dashResetBtn.style.display   = show ? 'flex' : 'none';
}

function updateModeDisplay() {
    dashModeBtn.textContent = modeLabels[activeMode];
    modeButtons.forEach(btn => btn.classList.remove('active'));
    if (activeMode === 'focus') pomoFocusBtn.classList.add('active');
    if (activeMode === 'short') pomoShortBtn.classList.add('active');
    if (activeMode === 'long')  pomoLongBtn.classList.add('active');
}

//===================Alarm===================

const alarmAudio = new Audio('./images/alarm-digital.mp3');
alarmAudio.loop = true;

function triggerAlarm() {
    isAlarmRinging = true;
    alarmAudio.play();
}

function stopAlarm() {
    alarmAudio.pause();
    alarmAudio.currentTime = 0;
    isAlarmRinging = false;
    updateStartButtons('start');
}

const volumeSlider = document.querySelector('.audio-volume-btn');

function applyVolume() {
    alarmAudio.volume = parseInt(volumeSlider.value, 10) / 50;
}
volumeSlider.addEventListener('input', applyVolume);

//===================Mode switching===================

function switchMode(mode) {
    clearInterval(timerInterval);
    timerInterval = null;
    activeMode = mode;

    if (mode === 'focus') remainingSeconds = PomoSettings.focus * 60;
    if (mode === 'short') remainingSeconds = PomoSettings.shortBreak * 60;
    if (mode === 'long')  remainingSeconds = PomoSettings.longBreak * 60;

    updateAllTimerDisplays();
    updateModeDisplay();
    updateStartButtons('start');
    updateRestartVisibility(false);
    stopAlarm();
    localStorage.setItem('daybook-pomo-mode', mode);
}

pomoFocusBtn.addEventListener('click', () => switchMode('focus'));
pomoShortBtn.addEventListener('click', () => switchMode('short'));
pomoLongBtn.addEventListener('click',  () => switchMode('long'));

dashModeBtn.addEventListener('click', () => {
    const nextIndex = (modesOrder.indexOf(activeMode) + 1) % modesOrder.length;
    switchMode(modesOrder[nextIndex]);
});

//===================Tick===================

function tick() {
    remainingSeconds--;

    if (remainingSeconds <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        remainingSeconds = 0;
        triggerAlarm();
    }

    updateAllTimerDisplays();
}

//===================Start/Pause, shared by both buttons===================

function toggleStartPause() {
    if (isAlarmRinging) {
        stopAlarm(); 
        return;
    }
    if (timerInterval === null) {
        timerInterval = setInterval(tick, 1000);
        updateStartButtons('pause');
        updateRestartVisibility(true);
    } else {
        clearInterval(timerInterval);
        timerInterval = null;
        updateStartButtons('start');
    }
}

pomoStartBtn.addEventListener('click', toggleStartPause);
dashStartPauseBtn.addEventListener('click', toggleStartPause);

//===================Restart, shared by both buttons===================

function restartTimer() {
    stopAlarm();
    switchMode(activeMode); 
}

pomoRestartBtn.addEventListener('click', restartTimer);
dashResetBtn.addEventListener('click', restartTimer);

//===================Settings panel===================

const pomoSettingBtn = document.querySelector('.pomo-set-btn');
const pomoSettingPage = document.querySelector('.pomorodo-settings-page');

pomoSettingBtn.addEventListener('click', (e) => {
    e.preventDefault();
    pomoSettingPage.style.display = 'flex';
});

document.getElementById('pomo-setting-close').addEventListener('click', () => {
    pomoSettingPage.style.display = 'none';
});

const pomoSettingSavebtn = document.querySelector('.pomo-setting-savebtn');

pomoSettingSavebtn.addEventListener('click', () => {
    PomoSettings.focus      = parseInt(document.querySelector('.focus-value').value, 10);
    PomoSettings.shortBreak = parseInt(document.querySelector('.short-break-value').value, 10);
    PomoSettings.longBreak  = parseInt(document.querySelector('.long-break-value').value, 10);
    PomoSettings.volume     = parseInt(volumeSlider.value, 10);
    applyVolume();
    pomoSettingPage.style.display = 'none';

    if (timerInterval === null) {
        switchMode(activeMode);
    }
});

//===================Initial load===================

const savedMode = localStorage.getItem('daybook-pomo-mode') || 'focus';
activeMode = savedMode;
if (savedMode === 'focus') remainingSeconds = PomoSettings.focus * 60;
if (savedMode === 'short') remainingSeconds = PomoSettings.shortBreak * 60;
if (savedMode === 'long')  remainingSeconds = PomoSettings.longBreak * 60;

updateAllTimerDisplays();
updateModeDisplay();
updateStartButtons('start');
updateRestartVisibility(false);

const savedPomoView = localStorage.getItem('daybook-view');
if (savedPomoView === 'pomodoro') {
    showPomodoroPage();
} else {
    showDashboard();
}

//====================To-do List============================



const todoBackDash = document.querySelector('.todo-back');//to go back to dashboard
const todoMore = document.querySelector('.todo-more')// to go to todo page
const addTaskBtn = document.querySelector('.todo-add-btn');// opens the add task form
const taskLayout = document.querySelector('.todo-main');
const dashTaskList = document.querySelector('.task-list');
let editingTaskId = null;


//===================Seed + storage helpers===================

function seedTasksIfEmpty() {
    if (localStorage.getItem('tasks')) return;
    const starterTasks = [
        { id: 1, title: "Review project brief", priority: "high", status: "in-progress", due: "" },
        { id: 2, title: "Reply to emails", priority: "medium", status: "not-started", due: "" },
        { id: 3, title: "Water the plants", priority: "low", status: "not-started", due: "" },
    ];
    localStorage.setItem('tasks', JSON.stringify(starterTasks));
}
seedTasksIfEmpty();

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

function saveToLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

//storing in local storage to prevent it from reloading


function showTodoPage() {
    sec1.classList.remove('active');
    sec2.classList.remove('active');
    todoPage.classList.add('active');
    localStorage.setItem('daybook-view', 'todo');
}
// moving to todo main page
todoMore.addEventListener('click', (e)=>{
    e.preventDefault();
    showTodoPage();
});
todoBackDash.addEventListener('click',(e)=>{
    e.preventDefault();
    showDashboard();
});

//===================Form open/close===================

const todoForm = document.querySelector('.todo-form');
const closeForm = document.querySelector('.todo-form-cancel')

addTaskBtn.addEventListener('click', function () {
    editingTaskId = null;
    todoForm.querySelector('form').reset();
    todoForm.querySelector('.form-header h2').textContent = 'Add new task';
    todoForm.style.display = 'flex';
});

closeForm.addEventListener('click', function () {
    todoForm.style.display = 'none';
});


//================submit form both add and edit

const taskSubmit = document.querySelector('.submit-task')
 taskSubmit.addEventListener('click',function(e){
    e.preventDefault();

    const title = todoForm.querySelector('.task-title').value.trim();
    const priority = todoForm.querySelector('.priority').value;
    const status = todoForm.querySelector('.status').value;
    const due = todoForm.querySelector('.due-date').value.trim()
    

    if(!title || !priority || !status || !due){
        alert("Please fill all required fields.");
        return;
    }

    if (editingTaskId !== null) {
        tasks = tasks.map(function(task) {
            if (task.id === editingTaskId) {
                return { ...task, title, desc, priority, taskType, due, status };
            }
            return task;
        });
        editingTaskId = null; 

    } else {
        tasks.push({ id: Date.now(), title, priority, status, due });
    }

    saveToLocalStorage();
    renderTasks();
    renderDashboardCard();
    todoForm.style.display = 'none';
    todoForm.querySelector('form').reset();
});

function saveToLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

//==================card creation

function createCard(task) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.id = task.id;
    card.dataset.status = task.status;
    card.dataset.priority = task.priority;

    card.innerHTML = `
        <div class='card-left'>
            <button class="task-priority priority-${task.priority}" style="border:none; background-color:transparent">
                <i class="ri-checkbox-blank-circle-fill"></i>
            </button>
            <h3 class="task-title">${task.title}</h3>
        </div>
        <div class='card-right'>
            <div class="task-status"><span>${task.status}</span></div>
            <div class='card-btns'>
                <button class="edit-btn" data-id="${task.id}" style="border:none; background-color:transparent;"><i class="ri-pencil-fill"></i></button>
                <button class="delete-btn" data-id="${task.id}" style="border:none; background-color:transparent;"><i class="ri-delete-bin-fill"></i></button>
            </div>
        </div>
    `;

    return card;
}

function renderTasks() {
    taskLayout.innerHTML = '';

    if (tasks.length === 0) {
        const msg = document.createElement('p');
        msg.classList.add('no-task-msg');
        msg.textContent = 'No tasks added yet';
        taskLayout.appendChild(msg);
        return;
    }

    tasks.forEach(function (task) {
        const card = createCard(task);
        taskLayout.appendChild(card);
    });
}


//===========================edit and delete button, event delegation

taskLayout.addEventListener('click', function (e) {
    const editBtn = e.target.closest('.edit-btn');
    const deleteBtn = e.target.closest('.delete-btn');

    if (editBtn) {
        const id = Number(editBtn.dataset.id);
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        editingTaskId = id;
        todoForm.querySelector('.task-title').value = task.title;
        todoForm.querySelector('.priority').value = task.priority;
        todoForm.querySelector('.status').value = task.status;
        todoForm.querySelector('.due-date').value = task.due;
        todoForm.querySelector('.form-header h2').textContent = 'Edit task';
        todoForm.style.display = 'flex';
    }

    if (deleteBtn) {
        const id = Number(deleteBtn.dataset.id);
        tasks = tasks.filter(t => t.id !== id);
        saveToLocalStorage();
        renderTasks();
        renderDashboardCard();
    }
});

//==== rendering hogh priority tasks to the dashboard
function renderDashboardCard() {
    const highPriorityTasks = tasks.filter(t => t.priority === 'high').slice(0, 5);

    if (highPriorityTasks.length === 0) {
        dashTaskList.innerHTML = `<p class="no-task-msg">No priority tasks yet</p>`;
        return;
    }

    dashTaskList.innerHTML = highPriorityTasks.map(task => `
        <div class="dash-todo-item">
            <input type="checkbox" data-id="${task.id}" ${task.status === 'done' ? 'checked' : ''}>
            <span class="dash-todo-text ${task.status === 'done' ? 'done' : ''}">${task.title}</span>
        </div>
    `).join('');
}

dashTaskList.addEventListener('change', function (e) {
    if (e.target.type !== 'checkbox') return;

    const id = Number(e.target.dataset.id);
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    task.status = e.target.checked ? 'done' : 'not-started';

    saveToLocalStorage();
    renderTasks();
    renderDashboardCard();
});

//===================Initial render===================

renderTasks();
renderDashboardCard();
const savedTodoView = localStorage.getItem('daybook-view');
if (savedTodoView === 'todo') {
    showTodoPage();
} else {
    showDashboard();
}

//===================daily planner====================

const plannerGrid = document.getElementById('planner-grid');
const plannerCardContent = document.getElementById('planner-card-content');
const plannerMore = document.querySelector('.planner-more');
const plannerBack = document.querySelector('.planner-back');


//===================Storage: object, only filled hours exist===================

function seedPlannerIfEmpty() {
    if (localStorage.getItem('daybook-planner')) return;
    localStorage.setItem('daybook-planner', JSON.stringify({})); // starts completely empty
}
seedPlannerIfEmpty();

let plannerData = JSON.parse(localStorage.getItem('daybook-planner'));

function savePlanner() {
    localStorage.setItem('daybook-planner', JSON.stringify(plannerData));
}

//===================Page navigation===================

function showPlannerPage() {
    sec1.classList.remove('active');
    sec2.classList.remove('active');
    plannerPage.classList.add('active');
    localStorage.setItem('daybook-view', 'planner');
}

plannerMore.addEventListener('click', (e) => {
    e.preventDefault();
    showPlannerPage();
});

plannerBack.addEventListener('click', (e) => {
    e.preventDefault();
    showDashboard();
});

function renderPlannerGrid() {
    plannerGrid.innerHTML = '';

    for (let hour = 0; hour < 24; hour++) {
        const entry = plannerData[hour]; // undefined if this hour has no task

        const row = document.createElement('div');
        row.classList.add('planner-row');

        row.innerHTML = `
            <span class="planner-time">${pad(hour)}:00</span>
            <div class="planner-task ${entry && entry.done ? 'done' : ''}"
                 contenteditable="true"
                 data-hour="${hour}"
                 data-placeholder="Add a task...">${entry ? entry.task : ''}</div>
            <input type="checkbox"
                   class="planner-checkbox ${entry ? 'visible' : ''}"
                   data-hour="${hour}"
                   ${entry && entry.done ? 'checked' : ''}>
        `;

        plannerGrid.appendChild(row);
    }
}
//===================Editing a task===================

plannerGrid.addEventListener('blur', function (e) {
    if (!e.target.classList.contains('planner-task')) return;

    const hour = e.target.dataset.hour;
    const newText = e.target.textContent.trim();

    if (newText === '') {
        delete plannerData[hour]; // no task = key removed entirely, not stored as empty
    } else {
        const wasAlreadyDone = plannerData[hour] ? plannerData[hour].done : false;
        plannerData[hour] = { task: newText, done: wasAlreadyDone };
    }

    savePlanner();
    renderPlannerGrid();
    renderDashboardPlannerCard();
}, true);

//===================Checkbox toggling===================

plannerGrid.addEventListener('change', function (e) {
    if (e.target.type !== 'checkbox') return;

    const hour = e.target.dataset.hour;
    if (!plannerData[hour]) return; // safety: shouldn't happen, checkbox only shows if entry exists

    plannerData[hour].done = e.target.checked;

    savePlanner();
    renderPlannerGrid();
    renderDashboardPlannerCard();
});

function renderDashboardPlannerCard() {
    const currentHour = new Date().getHours();
    const entry = plannerData[currentHour];

    if (!entry) {
        plannerCardContent.innerHTML = `<p class="no-task-msg">No plans for this hour</p>`;
        return;
    }

    plannerCardContent.innerHTML = `
        <p class="${entry.done ? 'planner-task done' : 'planner-task'}">${entry.task}</p>
    `;
}
const savedPlannerView = localStorage.getItem('daybook-view');
if (savedPlannerView === 'planner') {
    showPlannerPage();
} else {
    showDashboard();
}
renderPlannerGrid();
renderDashboardPlannerCard();
setInterval(renderDashboardPlannerCard, 60000);

//==================motivation=====================

const quotes = [
    "The secret of getting ahead is getting started.",
    "Small steps still count.",
    "Done is better than perfect.",
    "You don't have to see the whole staircase, just take the first step.",
    "Discipline is choosing between what you want now and what you want most.",
    "One task at a time.",
    "Motivation gets you started, habit keeps you going.",
    "Progress, not perfection.",
    "The best time to start was yesterday. The next best time is now.",
    "Focus on being productive instead of busy.",
    "Every accomplishment starts with the decision to try.",
    "It always seems impossible until it's done.",
    "Success is the sum of small efforts repeated daily.",
    "You are capable of more than you know.",
    "Don't watch the clock, do what it does — keep going.",
    "A little progress each day adds up to big results.",
    "Believe you can and you're halfway there.",
    "Slow progress is still progress.",
    "Your only limit is you.",
    "Make today count."
];

const quoteText = document.getElementById('quote-text');
const quoteRefresh = document.getElementById('quote-refresh');

let quoteIndex = parseInt(localStorage.getItem('daybook-quote-index'), 10) || 0;

function renderQuote() {
    quoteText.textContent = quotes[quoteIndex];
}

quoteRefresh.addEventListener('click', () => {
    quoteIndex = (quoteIndex + 1) % quotes.length;
    localStorage.setItem('daybook-quote-index', quoteIndex);
    renderQuote();
});

renderQuote();

//=======================daily goals==============

const goalsMore = document.querySelector('.goals-more');
const goalsBack = document.querySelector('.goals-back');
const goalsMain = document.getElementById('goals-main');
const goalsAddBtn = document.querySelector('.goals-add-btn');
const goalsProgressFill = document.getElementById('goals-progress-fill');
const goalsProgressText = document.getElementById('goals-progress-text');

function seedGoalsIfEmpty() {
    if (localStorage.getItem('daybook-goals')) return;
    const starterGoals = [
        { id: 1, title: "Workout", done: false },
        { id: 2, title: "Drink 2.5L water", done: false },
        { id: 3, title: "10k steps", done: false },
        { id: 4, title: "7-8 hrs sleep", done: false },
        { id: 5, title: "Meditation", done: false },
    ];
    localStorage.setItem('daybook-goals', JSON.stringify(starterGoals));
}
seedGoalsIfEmpty();

let goals = JSON.parse(localStorage.getItem('daybook-goals'));

function saveGoals() {
    localStorage.setItem('daybook-goals', JSON.stringify(goals));
}

function showGoalsPage() {
    sec1.classList.remove('active');
    sec2.classList.remove('active');
    goalsPage.classList.add('active');
    localStorage.setItem('daybook-view', 'goals');
}

goalsMore.addEventListener('click', (e) => { e.preventDefault(); showGoalsPage(); });
goalsBack.addEventListener('click', (e) => { e.preventDefault(); showDashboard(); });

//===================Render===================

function renderGoals() {
    goalsMain.innerHTML = '';

    if (goals.length === 0) {
        goalsMain.innerHTML = `<p class="no-task-msg">No goals added yet</p>`;
        renderGoalsCard();
        return;
    }

    goals.forEach(goal => {
        const row = document.createElement('div');
        row.classList.add('goal-row');
        row.innerHTML = `
            <input type="checkbox" data-id="${goal.id}" ${goal.done ? 'checked' : ''}>
            <div class="goal-text ${goal.done ? 'done' : ''}"
                 contenteditable="true"
                 data-id="${goal.id}">${goal.title}</div>
            <button class="goal-delete-btn" data-id="${goal.id}"><i class="ri-delete-bin-fill"></i></button>
        `;
        goalsMain.appendChild(row);
    });

    renderGoalsCard();
}

//===================Add a new blank row===================

goalsAddBtn.addEventListener('click', () => {
    const newGoal = { id: Date.now(), title: '', done: false };
    goals.push(newGoal);
    saveGoals();
    renderGoals();

    const newRow = goalsMain.querySelector(`[data-id="${newGoal.id}"].goal-text`);
    newRow.focus(); // cursor to type
});

//===================Editing text directly (contenteditable, same pattern as planner)===================

goalsMain.addEventListener('blur', function (e) {
    if (!e.target.classList.contains('goal-text')) return;
    const id = Number(e.target.dataset.id);
    const goal = goals.find(g => g.id === id);
    goal.title = e.target.textContent.trim();
    saveGoals();
}, true);

//===================Checkbox toggling===================

goalsMain.addEventListener('change', (e) => {
    if (e.target.type !== 'checkbox') return;
    const id = Number(e.target.dataset.id);
    const goal = goals.find(g => g.id === id);
    goal.done = e.target.checked;
    saveGoals();
    renderGoals();
});

//===================Delete row===================

goalsMain.addEventListener('click', (e) => {
    const deleteBtn = e.target.closest('.goal-delete-btn');
    if (!deleteBtn) return;
    const id = Number(deleteBtn.dataset.id);
    goals = goals.filter(g => g.id !== id);
    saveGoals();
    renderGoals();
});

//===================Dashboard card progress===================

function renderGoalsCard() {
    if (goals.length === 0) {
        goalsProgressFill.style.width = '0%';
        goalsProgressText.textContent = '0%';
        return;
    }
    const doneCount = goals.filter(g => g.done).length;
    const percent = Math.round((doneCount / goals.length) * 100);
    goalsProgressFill.style.width = `${percent}%`;
    goalsProgressText.textContent = `${percent}%`;
}

renderGoals();
const savedGoalsView = localStorage.getItem('daybook-view');
if (savedGoalsView === 'goals') {
     showGoalsPage() 
} else {
    showDashboard();
}
//=================Setting page=====================


const settingsMore = document.querySelector('.settings-more');
const settingsBack = document.querySelector('.settings-back');
const usernameInput = document.getElementById('username-input');
const avatarGrid = document.getElementById('avatar-grid');
const navAvatar = document.getElementById('nav-avatar');
const settingsSaveBtn = document.getElementById('settings-save-btn');


function showSettingsPage() {
    sec1.classList.remove('active');
    sec2.classList.remove('active');
    settingsPage.classList.add('active');
    localStorage.setItem('daybook-view', 'settings');
}

settingsMore.addEventListener('click', (e) => { e.preventDefault(); showSettingsPage(); });
settingsBack.addEventListener('click', (e) => { e.preventDefault(); showDashboard(); });


function markSelectedAvatar(path) {
    document.querySelectorAll('.avatar-tile').forEach(tile => {
        tile.classList.toggle('selected', tile.dataset.avatar === path);
    });
}

const DEFAULT_AVATAR = "./images/avatar/avatar-woman-1.png";
let pendingAvatar = localStorage.getItem('daybook-avatar') || DEFAULT_AVATAR;
navAvatar.src = pendingAvatar;
markSelectedAvatar(pendingAvatar);

const savedName = localStorage.getItem('daybook-username') || '';
usernameInput.value = savedName;

const savedAvatar = localStorage.getItem('daybook-avatar');
if (savedAvatar) {
    navAvatar.src = savedAvatar;
    markSelectedAvatar(savedAvatar);
}

// clicking a tile only updates the visual selection and pendingAvatar nothing saved yet

avatarGrid.addEventListener('click', (e) => {
    const tile = e.target.closest('.avatar-tile');
    if (!tile) return;
    pendingAvatar = tile.dataset.avatar;
    markSelectedAvatar(pendingAvatar);
});

// only on Save does everything actually commit
settingsSaveBtn.addEventListener('click', () => {
    const name = usernameInput.value.trim() || 'Alex';
    localStorage.setItem('daybook-username', name);
    renderGreeting(name); // regenerates the message fresh, doesn't edit old text

    localStorage.setItem('daybook-avatar', pendingAvatar);
    navAvatar.src = pendingAvatar;
    showDashboard();
});
 
