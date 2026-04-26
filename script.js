const STORAGE_KEY = 'mantraJaapData';
const DATA_VERSION = 1;

// Default State
let data = {
    radha: { count: 0, todayCount: 0, malas: 0, timeSpent: 0, lastDate: '' },
    harivansh: { count: 0, todayCount: 0, malas: 0, timeSpent: 0, lastDate: '' }
};

let currentMantra = null; // 'radha' or 'harivansh'
let timerInterval = null;

// Progress circle setup
const circle = document.getElementById('progress-circle');
const radius = circle.r.baseVal.value;
const circumference = radius * 2 * Math.PI;

circle.style.strokeDasharray = `${circumference} ${circumference}`;
circle.style.strokeDashoffset = circumference;

function setProgress(percent) {
    const offset = circumference - percent / 100 * circumference;
    circle.style.strokeDashoffset = offset;
}

function initData() {
    const today = new Date().toISOString().split('T')[0];
    const savedData = localStorage.getItem(STORAGE_KEY);
    
    if (savedData) {
        try {
            const parsed = JSON.parse(savedData);
            data = { ...data, ...parsed };
        } catch (e) {
            console.error("Error loading data", e);
        }
    }
    
    // Check for new day to reset today's count
    ['radha', 'harivansh'].forEach(mantra => {
        if (!data[mantra]) {
             data[mantra] = { count: 0, todayCount: 0, malas: 0, timeSpent: 0, lastDate: today };
        }
        if (data[mantra].lastDate !== today) {
            data[mantra].todayCount = 0;
            // Optionally we can reset daily timespent if needed, but let's just reset daily count
            data[mantra].lastDate = today;
        }
    });
    
    saveData();
}

function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function selectMantra(mantra) {
    currentMantra = mantra;
    
    // Update UI based on mantra
    document.getElementById('selection-screen').classList.add('hidden');
    document.getElementById('counter-screen').classList.remove('hidden');
    document.getElementById('counter-screen').classList.add('page-enter');
    
    const titleEl = document.getElementById('mantra-title');
    const countBg = document.getElementById('count-bg');
    
    if (mantra === 'radha') {
        titleEl.textContent = 'राधा नाम जप';
        titleEl.style.color = '#e91e63';
        document.getElementById('current-count').style.color = '#e91e63';
        circle.style.stroke = '#e91e63';
        countBg.style.background = '#fce4ec';
    } else {
        titleEl.textContent = 'हरिवंश नाम जप';
        titleEl.style.color = '#4CAF50';
        document.getElementById('current-count').style.color = '#4CAF50';
        circle.style.stroke = '#4CAF50';
        countBg.style.background = '#e8f5e9';
    }
    
    updateDisplay();
    startTimer();
}

function goBack() {
    stopTimer();
    document.getElementById('counter-screen').classList.add('hidden');
    document.getElementById('counter-screen').classList.remove('page-enter');
    document.getElementById('selection-screen').classList.remove('hidden');
    document.getElementById('selection-screen').classList.add('page-enter');
    currentMantra = null;
}

function updateDisplay() {
    if (!currentMantra) return;
    
    const mData = data[currentMantra];
    document.getElementById('current-count').textContent = mData.count % 108;
    document.getElementById('stat-malas').textContent = mData.malas;
    document.getElementById('stat-total').textContent = mData.count;
    document.getElementById('stat-today').textContent = mData.todayCount;
    
    // Update progress ring
    const percent = ((mData.count % 108) / 108) * 100;
    setProgress(percent);
    
    updateTimerDisplay();
}

function updateTimerDisplay() {
    if (!currentMantra) return;
    const totalSeconds = data[currentMantra].timeSpent || 0;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    document.getElementById('timer-display').textContent = 
        `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function pad(num) {
    return num.toString().padStart(2, '0');
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (currentMantra) {
            if (data[currentMantra].timeSpent === undefined) data[currentMantra].timeSpent = 0;
            data[currentMantra].timeSpent++;
            saveData();
            updateTimerDisplay();
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// Reset data
function resetData() {
    if (confirm(`Are you sure you want to reset all progress for ${currentMantra === 'radha' ? 'Radha' : 'Harivansh'}?`)) {
        const today = new Date().toISOString().split('T')[0];
        data[currentMantra] = { count: 0, todayCount: 0, malas: 0, timeSpent: 0, lastDate: today };
        saveData();
        updateDisplay();
    }
}

// Map for floating texts based on mantra
const textOptions = {
    radha: ['राधा', 'राधे', 'श्री राधा'],
    harivansh: ['हरिवंश', 'श्री हरिवंश', 'हित हरिवंश']
};

const colors = {
    radha: ['#e91e63', '#f06292', '#ad1457', '#ff80ab'],
    harivansh: ['#4CAF50', '#81C784', '#2E7D32', '#69F0AE']
};

function createFloatingText() {
    const container = document.getElementById('floating-container');
    const el = document.createElement('div');
    el.className = 'floating-text';
    
    const opts = textOptions[currentMantra];
    el.textContent = opts[Math.floor(Math.random() * opts.length)];
    
    const cOpts = colors[currentMantra];
    el.style.color = cOpts[Math.floor(Math.random() * cOpts.length)];
    
    // Random directions
    const angleStart = Math.random() * Math.PI * 2;
    const angleEnd = angleStart + (Math.random() - 0.5) * 1.5;
    
    // Make text float slightly outside the ring
    const distStart = 60 + Math.random() * 50;
    const distEnd = 140 + Math.random() * 80;
    
    const txStart = Math.cos(angleStart) * distStart;
    const tyStart = Math.sin(angleStart) * distStart;
    
    const txEnd = Math.cos(angleEnd) * distEnd;
    const tyEnd = Math.sin(angleEnd) * distEnd;
    
    el.style.setProperty('--tx-start', `${txStart}px`);
    el.style.setProperty('--ty-start', `${tyStart}px`);
    el.style.setProperty('--tx-end', `${txEnd}px`);
    el.style.setProperty('--ty-end', `${tyEnd}px`);
    
    // Size variation
    el.style.fontSize = `${1.2 + Math.random() * 1}rem`;
    
    container.appendChild(el);
    
    // Remove after animation completes
    setTimeout(() => {
        el.remove();
    }, 1000); // match max duration of floatUp + small buffer
}

function incrementCount() {
    if (!currentMantra) return;
    
    const mData = data[currentMantra];
    mData.count++;
    mData.todayCount++;
    
    if (mData.count % 108 === 0) {
        mData.malas++;
        // Optional: Trigger haptic feedback
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    } else {
        if (navigator.vibrate) navigator.vibrate(20);
    }
    
    saveData();
    updateDisplay();
    createFloatingText();
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    initData();
    
    // Add global click listener for the counter screen
    const counterScreen = document.getElementById('counter-screen');
    counterScreen.addEventListener('click', (e) => {
        // Prevent incrementing when clicking the top nav buttons
        if (e.target.closest('.top-nav')) return;
        incrementCount();
    });
});

// Pause timer when page is hidden
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        stopTimer();
    } else {
        if (currentMantra) startTimer();
    }
});
