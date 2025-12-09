// --- КОНСТАНТЫ ПРОЕКТА ---
const TOTAL_DUCKS = 99;
// Если в хранилище нет данных, стартуем с этого числа
const FALLBACK_INITIAL_FOUND = 41; 

const ducksGridContainer = document.getElementById('ducks-grid-container');
const ducksFoundElement = document.getElementById('ducks-found');
const ducksRemainingElement = document.getElementById('ducks-remaining');
const nextGiftElement = document.getElementById('next-gift-count');
const finalMessage = document.getElementById('final-message');

const giftMilestones = [20, 40, 60, 80];
const giftMarkers = {
    20: document.getElementById('gift-20'),
    40: document.getElementById('gift-40'),
    60: document.getElementById('gift-60'),
    80: document.getElementById('gift-80')
};


// 1. ФУНКЦИЯ: ЗАГРУЗКА ПРОГРЕССА ИЗ BROWSER LOCAL STORAGE
function loadProgress() {
    try {
        const saved = localStorage.getItem('duckTrackerFoundIds');
        // Если что-то сохранено, парсим JSON и возвращаем массив
        return saved ? JSON.parse(saved) : null;
    } catch (e) {
        console.error("Ошибка при загрузке прогресса:", e);
        return null; // При ошибке возвращаем null
    }
}

// 2. ФУНКЦИЯ: СОХРАНЕНИЕ ПРОГРЕССА В BROWSER LOCAL STORAGE
function saveProgress(foundIds) {
    try {
        // Сохраняем массив ID в виде JSON-строки
        localStorage.setItem('duckTrackerFoundIds', JSON.stringify(foundIds));
    } catch (e) {
        console.error("Ошибка при сохранении прогресса:", e);
    }
}


// 3. ФУНКЦИЯ: ГЕНЕРАЦИЯ ВСЕХ ЭЛЕМЕНТОВ УТОЧЕК
function generateDucks() {
    // 1. Загружаем сохраненный прогресс
    const savedIds = loadProgress();
    
    // Если нет сохраненного прогресса, создаем массив ID на основе FALLBACK_INITIAL_FOUND
    const initialFoundIds = savedIds || Array.from({length: FALLBACK_INITIAL_FOUND}, (_, i) => i + 1);
    const initialSet = new Set(initialFoundIds); // для быстрого поиска

    let html = '';
    for (let i = 1; i <= TOTAL_DUCKS; i++) {
        // Проверяем, есть ли ID текущей уточки в наборе найденных
        const statusClass = initialSet.has(i) ? 'found' : 'missing';
        html += `<div class="duck ${statusClass}" data-id="${i}"></div>`;
    }
    ducksGridContainer.innerHTML = html;
}


// 4. ФУНКЦИЯ: ОБНОВЛЕНИЕ СЧЕТЧИКА и ПОДАРКОВ (и сохранение)
function updateCounters() {
    // Находим все уточки, у которых сейчас есть класс 'found'
    const foundDucksElements = document.querySelectorAll('.duck.found');
    const foundDucksCount = foundDucksElements.length;
    const remainingDucks = TOTAL_DUCKS - foundDucksCount;
    
    // NEW: Собираем ID найденных уточек и сохраняем
    const foundIds = Array.from(foundDucksElements).map(duck => parseInt(duck.dataset.id));
    saveProgress(foundIds);
    
    // Обновляем текст
    ducksFoundElement.textContent = foundDucksCount;
    ducksRemainingElement.textContent = remainingDucks;
    
    // --- Логика подарков ---
    let nextGift = 100;
    
    giftMilestones.forEach(milestone => {
        const marker = giftMarkers[milestone];
        if (foundDucksCount >= milestone) {
            marker.classList.add('found');
        } else {
            marker.classList.remove('found');
            if (milestone < nextGift && foundDucksCount < milestone) {
                nextGift = milestone;
            }
        }
    });
    
    // Финальное сообщение
    if (foundDucksCount === TOTAL_DUCKS) {
        finalMessage.classList.remove('hidden');
        nextGiftElement.textContent = '🎉 ВСЕ НАЙДЕНЫ! 🎉';
    } else {
        finalMessage.classList.add('hidden');
        nextGiftElement.textContent = nextGift;
    }
}


// НОВАЯ ФУНКЦИЯ: СОЗДАНИЕ КОНФЕТТИ
function createConfetti(x, y) {
    const colors = ['#ff6b6b', '#ffd166', '#06d6a0', '#118ab2', '#ef476f', '#ffc6ff'];
    const confettiCount = 15; // Количество частичек
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        
        // Случайный цвет
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        // Начальная позиция (где кликнули)
        confetti.style.left = x + 'px';
        confetti.style.top = y + 'px';
        
        // Случайное направление разлета
        const angle = (Math.random() * 360);
        const distance = Math.random() * 100 + 50;
        const duration = Math.random() * 0.5 + 0.5;
        
        confetti.style.setProperty('--angle', angle + 'deg');
        confetti.style.animationDuration = duration + 's';
        
        document.body.appendChild(confetti);
        
        // Удаляем частичку после анимации
        setTimeout(() => {
            confetti.remove();
        }, duration * 1000);
    }
}


// 5. ФУНКЦИЯ: ОБРАБОТКИ КЛИКА
function handleDuckClick(event) {
    const clickedDuck = event.target;
    
    if (clickedDuck.classList.contains('duck')) {
        // Получаем координаты клика
        const rect = clickedDuck.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        
        // Переключаем классы: found <-> missing
        const wasFound = clickedDuck.classList.contains('found');
        clickedDuck.classList.toggle('found');
        clickedDuck.classList.toggle('missing');
        
        // Если уточка стала найденной, запускаем анимации
        if (!wasFound) {
            // Анимация всплытия
            clickedDuck.classList.add('pop-animation');
            
            // Конфетти
            createConfetti(x, y);
            
            // Удаляем класс анимации после завершения
            setTimeout(() => {
                clickedDuck.classList.remove('pop-animation');
            }, 600);
        }
        
        // Обновляем все счетчики (этот вызов также сохранит прогресс)
        updateCounters();
    }
}


// 6. ИНИЦИАЛИЗАЦИЯ ПРОЕКТА (запускается, когда DOM загружен)
document.addEventListener('DOMContentLoaded', () => {
    // 1. Создаем уточки, используя сохраненный прогресс
    generateDucks();
    
    // 2. Находим все созданные элементы уточек
    const duckElements = document.querySelectorAll('.duck');
    
    // 3. Добавляем обработчик клика к каждой уточке
    duckElements.forEach(duck => {
        duck.addEventListener('click', handleDuckClick);
    });

    // 4. Инициализируем счетчик при загрузке страницы
    updateCounters();
});