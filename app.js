const elementos = {
    inputAmigo: document.getElementById('amigo'),
    listaAmigos: document.getElementById('listaAmigos'),
    resultado: document.getElementById('resultado'),
    btnAdicionar: document.getElementById('btnAdicionar'),
    btnSortear: document.getElementById('btnSortear'),
    ttsButton: document.getElementById('ttsButton'),
    templates: {
        erro: document.getElementById('templateMensagemErro'),
        sucesso: document.getElementById('templateMensagemSucesso'),
        resultado: document.getElementById('templateResultado')
    }
};

let listaAmigos = [];
let nomesSorteados = [];

/* ========== CONFIGURAÇÕES DE ACESSIBILIDADE ========== */
const speech = {
    synth: window.speechSynthesis,
    isSpeaking: false,
    utterance: null,
    voices: [],
    voice: null,
    
    init() {
        this.voices = this.synth.getVoices();
        this.voice = this.voices.find(v => v.lang === 'pt-BR') || this.voices[0];
    },
    
    speak(text) {
        if(this.isSpeaking) this.stop();
        this.utterance = new SpeechSynthesisUtterance(text);
        this.utterance.voice = this.voice;
        this.utterance.rate = 1.1;
        this.synth.speak(this.utterance);
        this.isSpeaking = true;
        
        this.utterance.onend = () => {
            this.isSpeaking = false;
            elementos.ttsButton.textContent = '🔊 Ativar Leitura';
        };
    },
    
    toggle() {
        if(this.isSpeaking) {
            this.stop();
        } else {
            this.speak(document.body.textContent);
        }
    },
    
    stop() {
        this.synth.cancel();
        this.isSpeaking = false;
    }
};

/* ========== FUNÇÕES PRINCIPAIS ========== */
const adicionarAmigo = () => {
    const nome = elementos.inputAmigo.value.trim();
    
    if (!validarNome(nome)) return;

    listaAmigos.push(nome);
    elementos.inputAmigo.value = '';
    elementos.resultado.innerHTML = '';
    atualizarLista();
};

const validarNome = (nome) => {
    if (!nome) {
        mostrarMensagem('Por favor, digite um nome válido.', 'erro');
        return false;
    }

    if (/\d/.test(nome)) {
        mostrarMensagem('Números não são permitidos em nomes!', 'erro');
        return false;
    }

    if (listaAmigos.some(amigo => amigo.toLowerCase() === nome.toLowerCase())) {
        mostrarMensagem('Este nome já foi adicionado!', 'erro');
        return false;
    }

    return true;
};

const atualizarLista = () => {
    elementos.listaAmigos.innerHTML = listaAmigos
        .map((nome, index) => `
            <li>${nome} 
                <button class="button-remove" data-index="${index}">X</button>
            </li>
        `).join('');
};

const sortearAmigo = () => {
    elementos.resultado.innerHTML = '';

    if (listaAmigos.length < 2) {
        mostrarMensagem('Adicione pelo menos 2 participantes!', 'erro');
        return;
    }

    const disponiveis = listaAmigos.filter(amigo => !nomesSorteados.includes(amigo));

    if (disponiveis.length === 0) {
        finalizarSorteio();
        return;
    }

    const indice = Math.floor(Math.random() * disponiveis.length);
    const sorteado = disponiveis[indice];
    nomesSorteados.push(sorteado);

    mostrarResultado(sorteado);
};

/* ========== FUNÇÕES DE INTERFACE ========== */
const mostrarMensagem = (mensagem, tipo) => {
    const template = elementos.templates[tipo];
    const clone = template.content.cloneNode(true);
    const container = clone.querySelector('div');
    container.textContent = mensagem;
    
    elementos.resultado.innerHTML = '';
    elementos.resultado.appendChild(clone);
    speech.speak(mensagem);
};

const mostrarResultado = (nome) => {
    const clone = elementos.templates.resultado.content.cloneNode(true);
    clone.querySelector('.nome-sorteado').textContent = nome;
    elementos.resultado.appendChild(clone);
    speech.speak(`O amigo sorteado foi ${nome}`);
};

const finalizarSorteio = () => {
    listaAmigos = [];
    nomesSorteados = [];
    elementos.inputAmigo.value = '';
    atualizarLista();
    mostrarMensagem('Sorteio concluído! Adicione novos participantes.', 'sucesso');
};

const reiniciarSorteio = () => {
    listaAmigos = [];
    nomesSorteados = [];
    elementos.listaAmigos.innerHTML = '';
    elementos.resultado.innerHTML = '';
    elementos.inputAmigo.value = '';
};

/* ========== EVENT LISTENERS ========== */
elementos.btnAdicionar.addEventListener('click', adicionarAmigo);
elementos.btnSortear.addEventListener('click', sortearAmigo);
elementos.ttsButton.addEventListener('click', () => {
    speech.toggle();
    elementos.ttsButton.textContent = speech.isSpeaking 
        ? '⏸️ Pausar Leitura' 
        : '🔊 Retomar Leitura';
});

elementos.inputAmigo.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') adicionarAmigo();
});

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('button-remove')) {
        const index = e.target.dataset.index;
        const nomeRemovido = listaAmigos[index];
        listaAmigos.splice(index, 1);
        nomesSorteados = nomesSorteados.filter(nome => nome !== nomeRemovido);
        atualizarLista();
        elementos.resultado.innerHTML = '';
    }

    if (e.target.classList.contains('button-reset')) {
        reiniciarSorteio();
    }
});

elementos.inputAmigo.addEventListener('input', (e) => {
    if (/\d/.test(e.target.value)) {
        e.target.value = e.target.value.replace(/\d/g, '');
        alert('Apenas letras são permitidas!');
    }
});

/* ========== INICIALIZAÇÃO ========== */
window.speechSynthesis.onvoiceschanged = () => speech.init();