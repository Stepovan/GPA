// Глобальные параметры
let parameters = {
    P1: 1,  // Давление для крана 1
    P2: 0,
    p_ukpg: 5.2,  // Целевое давление
};

// Пути к изображениям
let imageClosed = 'img/Valve-closed.png',
    imageOpen = 'img/Valve-opened.png',
    motorNormal = 'img/Motor-normal.png',
    motorOpening = 'img/Motor-opening.png',
    motorClosing = 'img/Motor-closing.png',
    backgroundImage = 'img/Main-1.png'; 

// Массив с кранами
const valves = [
    { number: '1', x: 503, y: 54, state: 'closed', angle: 90, motor: true, time_open: 2, fromParam:"p_ukpg", toParam: "P1", duration: 2},
    { number: '4', x: 539, y: 54, state: 'closed', angle: 90, motor: true, time_open: 2, fromParam:"p_ukpg", toParam: "P1", duration: 5},
    { number: '2', x: 600, y: 54, state: 'closed', angle: 90, motor: true, time_open: 2, fromParam:"p_ukpg", toParam: "P2", duration: 5},

];

// Массив с текстбоксами
const textBoxes = [
    { number: '1', x: 500, y: 100, startValue: 0.00, lisParam: "P1"}, // Текстбокс для P1
    { number: '2', x: 600, y: 100, startValue: 0.00, lisParam: "P2"}, // Текстбокс для P1
];

// Функция создания SCADA-контейнера и фона
function createScadaBackground() {
    const container = document.createElement('div');
    container.classList.add('scada-container');
    container.style.position = 'relative';
    container.style.width = '1000px';  // Фиксированная ширина
    container.style.height = '600px';  // Фиксированная высота
    container.style.background = `url(${backgroundImage}) no-repeat center center`;
    container.style.backgroundSize = 'contain';

    // Добавляем контейнер в body
    document.body.appendChild(container);
    
    return container;
}

// Функция создания текстового поля для давления (универсальная)
function createPressureTextBox(boxData) {
    const scadaContainer = document.querySelector('.scada-container');

    // Создаем текстовое поле
    const pressureBox = document.createElement('textarea');
    pressureBox.id = `pressureTextBox_${boxData.number}`;
    pressureBox.classList.add('pressure-box');
    pressureBox.style.position = 'absolute';
    pressureBox.style.width = '40px';
    pressureBox.style.height = '20px';
    pressureBox.style.left = `${boxData.x}px`;
    pressureBox.style.top = `${boxData.y}px`;
    pressureBox.style.backgroundColor = 'black';
    pressureBox.style.color = 'green';
    pressureBox.style.fontSize = '14px';
    pressureBox.style.textAlign = 'center';
    pressureBox.style.resize = 'none';
    pressureBox.readOnly = true;  // Текстовое поле доступно только для чтения
    pressureBox.value = boxData.startValue; // Начальное значение давления

    scadaContainer.appendChild(pressureBox);
}

// Функция создания кранов и моторов
function createValve(valveData, index) {
    const scadaContainer = document.querySelector('.scada-container');

    // Создаем кран
    const valveElement = document.createElement('img');
    valveElement.src = valveData.state === 'open' ? imageOpen : imageClosed;
    valveElement.classList.add('valve');
    valveElement.style.position = 'absolute';
    valveElement.style.left = `${valveData.x}px`;
    valveElement.style.top = `${valveData.y}px`;
    valveElement.style.transform = `rotate(${valveData.angle}deg)`;
    valveElement.setAttribute('data-index', index);
    valveElement.addEventListener('click', () => toggleValve(index));

    scadaContainer.appendChild(valveElement);

    // Создаем мотор (если есть)
    if (valveData.motor) {
        const motorElement = document.createElement('img');
        motorElement.src = motorNormal;
        motorElement.classList.add('motor');
        motorElement.style.position = 'absolute';

        // Размещение мотора в зависимости от угла поворота
        if (valveData.angle === 90) {
            motorElement.style.left = `${valveData.x + 16}px`;
            motorElement.style.top = `${valveData.y}px`;
        } else {
            motorElement.style.left = `${valveData.x + 5}px`;
            motorElement.style.top = `${valveData.y - 13}px`;
        }

        motorElement.style.transform = `rotate(${valveData.angle}deg)`;
        motorElement.setAttribute('data-index', index);

        scadaContainer.appendChild(motorElement);
    }
}

// Функция переключения состояния крана
function toggleValve(index) {
    const valveData = valves[index];
    const valveElement = document.querySelector(`.valve[data-index="${index}"]`);
    const motorElement = document.querySelector(`.motor[data-index="${index}"]`);
    
    if (valveData.motor) {
        // Анимация мотора при изменении состояния
        motorElement.src = valveData.state === 'open' ? motorClosing : motorOpening;

        setTimeout(() => {
            // Меняем состояние крана
            valveData.state = valveData.state === 'open' ? 'closed' : 'open';
            valveElement.src = valveData.state === 'open' ? imageOpen : imageClosed;

            // Возвращаем мотор в нормальное состояние
            motorElement.src = motorNormal;

            // Обновляем глобальный параметр, если кран открыт
            if (valveData.state === 'open') {
                smoothChange(valveData.toParam, parameters[`${valveData.fromParam}`], valveData.duration)
            }
        }, valveData.time_open * 1000);
    } else {
        // Если мотора нет, сразу меняем состояние крана
        valveData.state = valveData.state === 'open' ? 'closed' : 'open';
        valveElement.src = valveData.state === 'open' ? imageOpen : imageClosed;

        // Обновляем глобальный параметр, если кран открыт
        if (valveData.state === 'open') {
            parameters[`${valveData.toParam}`] = parameters[`${valveData.fromParam}`];
        }
    }
}
// Функция для обновления значений в текстовых полях
function updatePressureTextBoxes() {
    textBoxes.forEach((boxData) => {
        const pressureBox = document.getElementById(`pressureTextBox_${boxData.number}`);
        if (pressureBox) {
            // Обновляем текстовое поле значением из глобального параметра
            pressureBox.value = parameters[`${boxData.lisParam}`];
        }
    });
}

function smoothChange(paramName, targetValue, duration) {
    const startValue = parameters[paramName]; // Текущее значение параметра
    const stepTime = 5; // Интервал обновления (мс)
    const steps = duration * 1000 / stepTime; // Количество шагов
    const stepSize = (targetValue - startValue) / steps; // Размер шага

    let currentStep = 0;

    const interval = setInterval(() => {
        currentStep++;
        parameters[paramName] += stepSize;

        if (currentStep >= steps) {
            parameters[paramName] = targetValue; // Устанавливаем точное значение
            clearInterval(interval); // Останавливаем анимацию
        }
    }, stepTime);
}


// Регулярное обновление значений
setInterval(updatePressureTextBoxes, 500);  // Каждые 500 мс обновляем значения

// Создаем SCADA-контейнер и фон
createScadaBackground();

// Создаем текстовые поля для давления и краны
valves.forEach((valveData, index) => {
    createValve(valveData, index);  // Создаем кран
});

textBoxes.forEach((boxData, index) => {
    createPressureTextBox(boxData, index);
});

// Функция для увеличения давления
function increasePressure() {
    parameters.P1 += 0.1;  // Увеличиваем P1
}

// Создание кнопки для увеличения давления
const increaseButton = document.createElement('button');
increaseButton.textContent = 'Increase Pressure';
increaseButton.addEventListener('click', increasePressure);
document.body.appendChild(increaseButton);