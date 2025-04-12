// ==UserScript==
// @name         Cambria AutoClicker UltraReal + Editable Coordinates
// @namespace    commander
// @version      2.2
// @description  Автоклик с UI, вводом координат вручную и выбором кликом по экрану 🎯⛏️
// @author       Командир
// @match        https://play.goldrush.cambria.gg/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const canvas = document.querySelector('canvas');
    let autoClick = false;
    let clickCount = 0;
    let clickTimeout;

    let baseX = 1120;
    let baseY = 621;

    // 👇 UI
    const container = document.createElement('div');
    container.innerHTML = `
    <button id="clickToggle">⛏️ Автоклик OFF</button>
      X: <input id="xInput" type="number" value="${baseX}" style="width: 60px;">
      Y: <input id="yInput" type="number" value="${baseY}" style="width: 60px;">
    </div>
    <button id="pickCoords">🖱️ Указать на экране</button>
    <div id="clickStats">Кликов: 0</div>
    <div id="signature" style="margin-top: 5px;">
  <div id="signature" style="margin-top: 5px;">
  <a href="https://t.me/childbull" target="_blank"
     style="color: #00bfff; font-weight: bold; text-decoration: none; font-size: 18px;">
    tg @childbull
  </a>
</div>



  `;
    Object.assign(container.style, {
        position: 'fixed',
        top: '50%',
        left: '20px',
        transform: 'translateY(-50%)',
        zIndex: 9999,
        background: '#111',
        opacity: 0.85,
        padding: '10px',
        borderRadius: '10px',
        color: '#0f0',
        fontFamily: 'monospace',
        fontSize: '14px',
        border: '1px solid lime',
        boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(3px)',
    });


    const toggleUIBtn = document.createElement('button');
    toggleUIBtn.innerText = '👁️ Свернуть';
    Object.assign(toggleUIBtn.style, {
        position: 'absolute',
        top: '-25px',
        left: '0',
        fontSize: '12px',
        background: '#222',
        color: '#0f0',
        border: '1px solid lime',
        borderRadius: '5px',
        cursor: 'pointer',
    });
    container.appendChild(toggleUIBtn);

    let uiHidden = false;

    toggleUIBtn.onclick = () => {
        uiHidden = !uiHidden;
        [...container.children].forEach((el) => {
            if (el !== toggleUIBtn) el.style.display = uiHidden ? 'none' : '';
        });
        toggleUIBtn.innerText = uiHidden ? '👁️ Развернуть' : '👁️ Свернуть';
    };


    document.body.appendChild(container);

    const btn = container.querySelector('#clickToggle');
    const stats = container.querySelector('#clickStats');
    const pickBtn = container.querySelector('#pickCoords');
    const xInput = container.querySelector('#xInput');
    const yInput = container.querySelector('#yInput');

    // ✍️ Обновление координат из input вручную
    xInput.addEventListener('change', () => {
        baseX = parseInt(xInput.value);
    });

    yInput.addEventListener('change', () => {
        baseY = parseInt(yInput.value);
    });

    // 🖱️ Указание кликом по экрану
    pickBtn.onclick = () => {
        alert('Нажми в любом месте экрана, чтобы указать координаты руды');

        const handleClick = (e) => {
            baseX = e.clientX;
            baseY = e.clientY;
            xInput.value = baseX;
            yInput.value = baseY;
            console.log('📍 Координаты выбраны:', baseX, baseY);
            document.removeEventListener('click', handleClick, true);
        };

        document.addEventListener('click', handleClick, true);
    };

    // ⏩ Плавное движение
    function moveMouseSmooth(startX, startY, endX, endY, duration = 300) {
        const startTime = performance.now();
        const deltaX = endX - startX;
        const deltaY = endY - startY;

        const step = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 0.5 - 0.5 * Math.cos(Math.PI * progress);

            const x = Math.round(startX + deltaX * ease);
            const y = Math.round(startY + deltaY * ease);

            const moveEvent = new MouseEvent('mousemove', {
                bubbles: true,
                cancelable: true,
                clientX: x,
                clientY: y,
                view: window,
            });

            canvas.dispatchEvent(moveEvent);

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };

        requestAnimationFrame(step);
    }

    // 🖱️ Клик по координате
    const clickAt = (x, y) => {
        const offsetX = Math.floor(Math.random() * 8) - 4;
        const offsetY = Math.floor(Math.random() * 8) - 4;

        const move = (type, dx, dy) => new MouseEvent(type, {
            bubbles: true,
            cancelable: true,
            clientX: dx,
            clientY: dy,
            view: window,
        });

        canvas.dispatchEvent(move('mousemove', x + offsetX, y + offsetY));
        canvas.dispatchEvent(move('mousedown', x + offsetX, y + offsetY));
        canvas.dispatchEvent(move('mouseup', x + offsetX, y + offsetY));

        clickCount++;
        stats.innerText = `Кликов: ${clickCount}`;
    };

    // 🔁 Цикл автоклика
    const loop = () => {
        if (!autoClick) return;

        const delay = Math.random() * (5000 - 2000) + 2000;
        clickTimeout = setTimeout(() => {
            const targetX = baseX + (Math.random() * 6 - 3);
            const targetY = baseY + (Math.random() * 6 - 3);

            const canvasRect = canvas.getBoundingClientRect();
            const currentX = canvasRect.left + canvasRect.width / 2 + (Math.random() * 10 - 5);
            const currentY = canvasRect.top + canvasRect.height / 2 + (Math.random() * 10 - 5);

            moveMouseSmooth(currentX, currentY, targetX, targetY, 300);
            setTimeout(() => clickAt(targetX, targetY), 320);

            loop();
        }, delay);
    };

    // 🔘 Старт/Стоп
    btn.onclick = () => {
        autoClick = !autoClick;
        btn.innerText = autoClick ? '⛏️ Автоклик ON' : '⛏️ Автоклик OFF';
        btn.style.background = autoClick ? '#0a0' : '#222';

        if (autoClick) {
            loop();
        } else {
            clearTimeout(clickTimeout);
        }
    };
})();
