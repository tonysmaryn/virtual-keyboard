const layouts = [
    {
        name: 'en',
        normal: [
            ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
            ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
            ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', '\''],
            ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/']
        ],
        shifted: [
            ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+'],
            [, , , , , , , , , , '{', '}', '|'],
            [, , , , , , , , , ':', '"'],
            [, , , , , , , '<', '>', '?']
        ],
    },
    {
        name: 'ru',
        normal: [
            ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
            ['й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з', 'х', 'ъ', '\\'],
            ['ф', 'ы', 'в', 'а', 'п', 'р', 'о', 'л', 'д', 'ж', 'э'],
            ['я', 'ч', 'с', 'м', 'и', 'т', 'ь', 'б', 'ю', '.']
        ],
        shifted: [
            ['!', '"', '№', ';', '%', ':', '?', '*', '(', ')', '_', '+'],
            [, , , , , , , , , , , , '/'],
            [, , , , , , , , , , ,],
            [, , , , , , , , , ',']
        ],
    }
]

const printCodes = [
    ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0', 'Minus', 'Equal'],
    ['KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP', 'BracketLeft', 'BracketRight', 'Backslash'],
    ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon', 'Quote'],
    ['KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'Comma', 'Period', 'Slash'],
]

const commandCodes = {
    shift: 'ShiftLeft ShiftRight',
    capslock: 'CapsLock',
    left: 'ArrowLeft',
    right: 'ArrowRight',
}

const commandIcons = {
    backspace: '&#9003;',
    enter: '&#9166;',
    shift: '&#8679;',
    space: '&#9251;',
    left: '&#9664;',
    right: '&#9654;',
    speech: '&#127897;',
    capslock: '&#8682;',
    sounds: '&#128266;'
}

class Events {
    constructor() {
        this.subs = {};
    }

    on(eventName, callback) {
        if (!this.subs[eventName]) this.subs[eventName] = [];
        const cb = callback;
        this.subs[eventName].push(cb);
        return cb;
    }

    emit(eventName, param) {
        const listeners = this.subs[eventName];
        if (!listeners) return false;

        listeners.forEach(callback => { callback(param) });
    }
}


class Layout {
    constructor() {
        this.layouts = {};
        this.events = new Events();
        this.load(layouts);
        this.setLayout('en');

        this.shifted = false;
        this.upper = false;
    }

    load(layouts) {
        const _ = this;
        layouts.forEach((layout) => {
            this.layouts[layout.name] = layout;
        });
    }

    setLayout(layoutName) {
        if (!this.layouts[layoutName]) return false;
        this.currentLayout = layoutName;
        this.chars = this.layouts[layoutName].normal;
        this.shifted = false;
        this.events.emit('changeLayout');
    }

    nextLayout() {
        const current = this.currentLayout;
        const layoutNames = Object.keys(this.layouts);
        const newLayout = layoutNames[(layoutNames.indexOf(current) + 1) % layoutNames.length];
        this.setLayout(newLayout);
    }

    upperCase() {
        this.chars = this.chars.map(line => {
            return line.map(char => char.toUpperCase());
        });
        this.upper = true;
        this.events.emit('changeLayout');
    }

    lowerCase() {
        this.chars = this.chars.map(line => {
            return line.map(char => char.toLowerCase());
        });
        this.upper = false;
        this.events.emit('changeLayout');
    }

    toggleCase() {
        if (this.upper) this.lowerCase();
        else this.upperCase();
    }

    shift() {
        const _ = this;
        const shiftedLayout = this.layouts[this.currentLayout].shifted;

        this.toggleCase();

        shiftedLayout.forEach((line, lineIndex) => {
            [...line].forEach((char, charIndex) => {
                if (char) this.chars[lineIndex][charIndex] = char;
            });
        });

        this.shifted = true;
        this.events.emit('changeLayout');
    }

    unshift() {
        const shiftedLayout = this.layouts[this.currentLayout].shifted;
        const normalLayout = this.layouts[this.currentLayout].normal;

        this.toggleCase();

        shiftedLayout.forEach((line, lineIndex) => {
            [...line].forEach((char, charIndex) => {
                if (char) this.chars[lineIndex][charIndex] = normalLayout[lineIndex][charIndex];
            });
        });

        this.events.emit('changeLayout');
    }

    getChar(lineIndex, charIndex) {
        const char = this.chars[lineIndex][charIndex];
        if (!char) return false;
        return (char);
    }

    on(eventName, cb) {
        this.events.on(eventName, cb);
    }
}

class Button {
    constructor(name) {
        this.domNode = document.createElement('button');
        this.domNode.classList.add('keyboard__key');
        const active = false;
        this.name = name;
    }

    set name(name) {
        this.domNode.dataset.name = name;
    }

    get name() {
        return this.domNode.dataset.name;
    }

    set code(code) {
        this.domNode.dataset.code = code;
    }

    get code() {
        return this.domNode.dataset.code;
    }

    set label(value) {
        this.domNode.innerHTML = String(value);
    }

    get label() {
        return String(this.domNode.innerHTML);
    }

    set onclick(callback) {
        this.callback = callback;
        this.domNode.addEventListener('click', this.click.bind(this));
    }

    click() {
        this.callback(this);
    }

    insert(node, n) {
        if (n === undefined) node.appendChild(this.domNode);
        else node.children[n].before(this.domNode);
    }

    toggle(value) {
        if (value !== undefined) {
            this.active = value;
        }
        else this.active = !this.active;
        if (this.active) this.domNode.classList.add('keyboard__key_active');
        else this.domNode.classList.remove('keyboard__key_active');
    }

    set addClass(classNames) {
        classNames.forEach(elem => {
            this.domNode.classList.add(elem);
        });
    }
}

class CharButton extends Button {
    constructor(layout, lineIndex, charIndex) {
        super('char');
        this.layout = layout;
        this.lineIndex = lineIndex;
        this.charIndex = charIndex;
        this.layout.on('changeLayout', this.update.bind(this));
        this.code = printCodes[lineIndex][charIndex];
        this.update();
    }

    set char(value) {
        this.domNode.dataset.char = value;
    }

    get char() {
        return this.domNode.dataset.char;
    }

    update() {
        this.label = this.layout.getChar(this.lineIndex, this.charIndex);
        this.char = this.layout.getChar(this.lineIndex, this.charIndex);
    }
}

class Keyboard {
    constructor(input) {
        this.input = input;
        this.active = true;

        this.lines = [];

        this.domNode = document.createElement('div');
        this.domNode.classList.add('keyboard');
        this.domNode.classList.add('keyboard_visible');

        this.toggleButton = document.createElement('button');
        this.toggleButton.classList.add('keyboard__key');
        this.toggleButton.classList.add('keyboard__key_dark');
        this.toggleButton.classList.add('keyboard__toggle');
        this.toggleButton.innerHTML = '&#10060;';
        this.toggleButton.addEventListener('click', this.toggle.bind(this));

        this.domNode.appendChild(this.toggleButton);

        this.layout = new Layout();

        this.setupButtons();
        this.setupSounds();

        document.body.appendChild(this.domNode);

        input.addEventListener('keydown', this.processKeyEvent.bind(this));
        input.addEventListener('keyup', this.processKeyEvent.bind(this));

    }

    processKeyEvent(e) {
        const type = e.type;
        const code = e.code;

        const button = document.querySelector(`.button[data-code~="${code}"]`);

        if (!button) return;

        const name = button.dataset.name;

        if (name !== 'shift' && name !== 'capslock') {
            if (type === 'keydown') button.classList.add('button_active');
            else button.classList.remove('button_active');
        }
        else if (name === 'shift') this.shift(e);
        else if (name === 'capslock' && type === 'keydown') this.capsLock();

        if (e.repeat) return;

        if (name === 'char' || name === 'space') this.makeSound(e.type);
        else if (type === 'keydown') this.makeSound('command');
    }

    setupSounds() {
        const _ = this;

        this.a = new Audio();
        const soundsDir = './assets/';
        const soundsList = ['keyup', 'keydown', 'command'];

        _.audio = {};

        soundsList.forEach(sound => {
            const preloader = new Audio();
            preloader.src = `${soundsDir}${sound}.mp3`;
            preloader.addEventListener('loadeddata', () => { _.audio[sound] = preloader.src });
        });
    }

    makeSound(soundName) {
        if (!this.soundsButton.active) return;

        const audio = new Audio(this.audio[soundName]);
        audio.play();
    }

    toggle() {
        this.active = !this.active;
        if (this.active) {
            this.domNode.classList.add('keyboard_visible');
            this.toggleButton.classList.remove('keyboard__toggle_active');
            this.toggleButton.innerHTML = '&#10060;';
        }
        else {
            this.domNode.classList.remove('keyboard_visible');
            this.toggleButton.classList.add('keyboard__toggle_active');
            this.toggleButton.innerHTML = '&#8963;';
        }
    }

    setupButtons() {
        const _ = this;
        const charTable = this.layout.chars;

        this.layout.chars.forEach((line, lineIndex) => {
            this.addLine();
            const buttonsLine = document.createElement('div');
            buttonsLine.classList.add('keyboard__line');

            _.lines.push(buttonsLine);
            _.domNode.appendChild(buttonsLine);

            line.forEach((char, charIndex) => {
                const button = new CharButton(_.layout, lineIndex, charIndex);
                button.onclick = _.type.bind(this);
                button.insert(_.lines[lineIndex]);
            });
        });

        this.addLine();

        const enter = this.createFuncButton('enter', ["keyboard__key_wide"]),
            shift = this.createFuncButton('shift', ["keyboard__key_wide", "keyboard__key_activatable"]),
            backspace = this.createFuncButton('backspace', ["keyboard__key_wide"]),
            space = this.createFuncButton('space', ["keyboard__key_extra-wide"]),
            left = this.createFuncButton('left', ["keyboard__key_wide"]),
            right = this.createFuncButton('right', ["keyboard__key_wide"]),
            speech = this.createFuncButton('speech', ["keyboard__key_wide", "keyboard__key_activatable"]),
            layout = this.createFuncButton('layout', ["keyboard__key_wide"]),
            capsLock = this.createFuncButton('capslock', ["keyboard__key_wide", "keyboard__key_activatable"]),
            sounds = this.createFuncButton('sounds', ["keyboard__key_wide", "keyboard__key_activatable"]);

        layout.label = this.layout.currentLayout;

        backspace.insert(this.lines[0]);
        enter.insert(this.lines[2]);
        capsLock.insert(this.lines[2], 0);
        shift.insert(this.lines[3], 0);
        space.insert(this.lines[4]);
        left.insert(this.lines[3]);
        right.insert(this.lines[3]);
        layout.insert(this.lines[4], 0);
        speech.insert(this.lines[4]);
        sounds.insert(this.lines[4]);

        this.shiftButton = shift;
        this.capsLockButton = capsLock;
        this.speechButton = speech;
        this.soundsButton = sounds

        this.soundsButton.toggle(true);

    }

    createFuncButton(name, classNames) {
        let button = new Button(name);
        button.addClass = classNames;
        button.label = commandIcons[name] || name;
        button.code = commandCodes[name] || name[0].toUpperCase() + name.slice(1);
        button.onclick = this.command.bind(this);
        return button;
    }

    addLine() {
        const buttonsLine = document.createElement('div');
        buttonsLine.classList.add('keyboard__line');

        this.lines.push(buttonsLine);
        this.domNode.appendChild(buttonsLine);
    }

    type(button) {
        this.makeSound('keydown');
        this.addChar(button.domNode.dataset.char);
    }

    addChar(char) {
        const start = this.input.selectionStart;
        const text = this.input.value;
        this.input.value = text.slice(0, start) + char + text.slice(start);
        this.input.focus();
        this.input.selectionStart = start + char.length;
        this.input.selectionEnd = this.input.selectionStart;
    }

    deleteToLeft() {
        const start = this.input.selectionStart;
        const text = this.input.value;

        if (start === 0) return;

        this.input.value = text.slice(0, (start - 1)) + text.slice((start + 1));
        this.input.focus();
        this.input.selectionStart = start - 1;
        this.input.selectionEnd = this.input.selectionStart;
    }

    move(n) {
        const input = this.input;
        const start = this.input.selectionStart;

        let newPosition = start + n;
        if (newPosition < 0) newPosition = 0;

        input.focus();

        input.selectionStart = newPosition;
        input.selectionEnd = this.input.selectionStart;
    }

    command(button) {
        const name = button.name;
        this.makeSound('command');
        if (name === 'space') this.addChar(' ');
        else if (name === 'enter') this.addChar('\r\n');
        else if (name === 'backspace') this.deleteToLeft();
        else if (name === 'layout') {
            this.layout.nextLayout();
            button.label = this.layout.currentLayout;
        }
        else if (name === 'speech') {
            this.speechToggle();
        }
        else if (name === 'left') {
            this.move(-1);
        }
        else if (name === 'right') {
            this.move(1);
        }
        else if (name === 'shift') {
            this.shift();
        }
        else if (name === 'capslock') {
            this.capsLock();
        }
        else if (name === 'sounds') {
            this.soundsButton.toggle();
        }
    }

    shift(e) {
        if (e) {
            if (e.type === 'keydown' && this.shiftButton.active) return;
            if (e.type === 'keyup' && !this.shiftButton.active) return;
        }
        if (this.shiftButton.active) {
            this.shiftButton.toggle(false);
            this.layout.unshift();
        }
        else {
            this.shiftButton.toggle(true);
            this.layout.shift();
        }
    }

    capsLock() {
        this.layout.toggleCase();
        if (this.capsLockButton.active)
            this.capsLockButton.toggle(false);
        else this.capsLockButton.toggle(true);
    }

    speechToggle() {
        const button = this.speechButton
        button.toggle();

        if (button.active) {
            const locale = (this.layout === 'en') ? 'en-US' : 'ru-RU';
            this.rec = new SpeechRecognizer(locale, this.printSpeechResult.bind(this));
            this.rec.start();
        }
        else {
            this.rec.stop();
            this.rec = undefined;
        }
    }

    printSpeechResult(res) {
        this.addChar(res[res.length - 1][0].transcript);
    }
}

class SpeechRecognizer {
    constructor(lang, callback) {
        window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        this.recognition.lang = lang;
        this.recognition.continuous = true;

        this.recognition.addEventListener('result', (r) => { callback(r.results) })
        this.recognition.addEventListener('end', this.stop.bind(this));
    }

    stop() {
        this.recognition.stop();
    }

    start() {
        this.recognition.start();
    }
}

const kBoard = new Keyboard(document.querySelector('.use-keyboard-input'));