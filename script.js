// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";

import { getAnalytics } from "firebase/analytics";

// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries



// Your web app's Firebase configuration

// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {

  apiKey: "AIzaSyAtsoGcnOg9d5sf7NJMbha5HLKlgamF0Ds",

  authDomain: "wolsfy.firebaseapp.com",

  projectId: "wolsfy",

  storageBucket: "wolsfy.firebasestorage.app",

  messagingSenderId: "405020920570",

  appId: "1:405020920570:web:a660b83f84c2408959d743",

  measurementId: "G-BGFSVG9DPQ"

};



// Initialize Firebase

const app = initializeApp(firebaseConfig);

const analytics = getAnalytics(app);


// --- ИНИЦИАЛИЗАЦИЯ FIREBASE и КОНСТАНТЫ ---
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const TOTAL_DUCKS = 99;
const FALLBACK_INITIAL_FOUND = 41;
const USER_ID = 'duckHunter_main'; // Уникальный ID вашего МЧ. Прогресс сохраняется по этому ключу!

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


// 1. ФУНКЦИЯ: СОХРАНЕНИЕ ПРОГРЕССА (ОТПРАВКА В ОБЛАКО)
function saveProgress(foundIds) {
    // Отправляем массив найденных ID по пути "users/duckHunter_main/foundDucks"
    db.ref('users/' + USER_ID).set({
        foundDucks: foundIds
    });
}


// 2. ФУНКЦИЯ: ГЕНЕРАЦИЯ ВСЕХ ЭЛЕМЕНТОВ УТОЧЕК
function generateDucks(initialFoundIds) {
    const initialSet = new Set(initialFoundIds); // для быстрого поиска

    let html = '';
    for (let i = 1; i <= TOTAL_DUCKS; i++) {
        const statusClass = initialSet.has(i) ? 'found' : 'missing';
        html += `<div class="duck ${statusClass}" data-id="${i}"></div>`;
    }
    ducksGridContainer.innerHTML = html;
}


// 3. ФУНКЦИЯ: ОБНОВЛЕНИЕ СЧЕТЧИКА и ПОДАРКОВ (и сохранение)
function updateCounters() {
    // Находим все уточки, у которых сейчас есть класс 'found'
    const foundDucksElements = document.querySelectorAll('.duck.found');
    const foundDucksCount = foundDucksElements.length;
    const remainingDucks = TOTAL_DUCKS - foundDucksCount;
    
    // NEW: Собираем ID найденных уточек и СОХРАНЯЕМ В ОБЛАК
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


// 4. ФУНКЦИЯ: ОБРАБОТКИ КЛИКА
function handleDuckClick(event) {
    const clickedDuck = event.target;
    
    if (clickedDuck.classList.contains('duck')) {
        clickedDuck.classList.toggle('found');
        clickedDuck.classList.toggle('missing');
        
        updateCounters(); // Сохранение в облако происходит внутри updateCounters
    }
}


// 5. ИНИЦИАЛИЗАЦИЯ ПРОЕКТА (запускается после загрузки DOM)
document.addEventListener('DOMContentLoaded', () => {
    
    // Загрузка данных из облака
    db.ref('users/' + USER_ID).once('value').then(snapshot => {
        const data = snapshot.val();
        let initialFoundIds = [];
        
        if (data && data.foundDucks) {
            // Используем данные из облака
            initialFoundIds = data.foundDucks;
        } else {
            // Если в облаке пусто, используем стартовое значение
            initialFoundIds = Array.from({length: FALLBACK_INITIAL_FOUND}, (_, i) => i + 1);
        }

        // 1. Создаем уточки на основе полученных данных
        generateDucks(initialFoundIds);
        
        // 2. Находим все созданные элементы уточек
        const duckElements = document.querySelectorAll('.duck');
        
        // 3. Добавляем обработчик клика к каждой уточке
        duckElements.forEach(duck => {
            duck.addEventListener('click', handleDuckClick);
        });

        // 4. Обновляем счетчик
        updateCounters();
    });
});