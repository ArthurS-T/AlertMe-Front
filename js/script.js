// API no render
const URL_BACKEND = "https://alertme-sistema.onrender.com";

// Elementos de Navegação e Efeitos
const btnSobre = document.getElementById('btn-sobre');
const secaoAbout = document.getElementById('secao-about');
const btnHome = document.getElementById('btn-home');
const resultadoPainel = document.getElementById('resultado-painel');

// Elementos do Modal de Login
const btnLoginOpen = document.getElementById('btn-login-open');
const btnLoginClose = document.getElementById('btn-login-close');
const loginOverlay = document.getElementById('login-overlay');

// Elementos de Envio da API
const btnAnalisar = document.getElementById('btn-analisar');
const urlInput = document.getElementById('url-input');

// Menu Hamburger para Mobile
const hamburger = document.querySelector('.hamburger');
const navContainer = document.querySelector('.nav-container');

hamburger.addEventListener('click', () => {
    navContainer.classList.toggle('active');
});

/* Fecha o menu mobile automaticamente se o usuário clicar no botão Simular SMS dentro dele */
document.getElementById('btn-sms-mobile').addEventListener('click', () => {
    navContainer.classList.remove('active');
});

// Rolagem suave até a seção Sobre
btnSobre.addEventListener('click', () => {
    secaoAbout.scrollIntoView({ behavior: 'smooth' });
    navContainer.classList.remove('active');
});

// Botão Home, limpa a busca e rola para o topo
btnHome.addEventListener('click', () => {
    resultadoPainel.classList.add('display-none');
    urlInput.value = "";
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navContainer.classList.remove('active'); 
});

// Controle do Overlay de Login
btnLoginOpen.addEventListener('click', () => {
    loginOverlay.classList.remove('display-none');
});

btnLoginClose.addEventListener('click', () => {
    loginOverlay.classList.add('display-none');
});

window.addEventListener('click', (event) => {
    if (event.target === loginOverlay) {
        loginOverlay.classList.add('display-none');
    }
});

// Exibição de Feedback Visual
function exibirResultado(mensagem, tipo) {
    resultadoPainel.className = ""; 
    resultadoPainel.classList.remove('display-none');
    
    if (tipo === 'perigo') {
        resultadoPainel.classList.add('resultado-perigo');
        resultadoPainel.innerText = `🔴 ${mensagem}`;
    } else if (tipo === 'seguro') {
        resultadoPainel.classList.add('resultado-seguro');
        resultadoPainel.innerText = `🟢 ${mensagem}`;
    } else if (tipo === 'carregando') {
        resultadoPainel.classList.add('resultado-carregando');
        resultadoPainel.innerText = `⏳ ${mensagem}`;
    }
}

// Chama à API para verificar URL
btnAnalisar.addEventListener('click', async () => {
    const urlValue = urlInput.value.trim();
    if (!urlValue) {
        alert("Por favor, insira uma URL para pesquisar.");
        return;
    }

    exibirResultado("Análise em andamento. Buscando resultado (pode levar até 30s)...", "carregando");

    try {
        const response = await fetch(`${URL_BACKEND}/api/links/verificar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: urlValue }) 
        });

        // Proteção contra Erro 400 ou falhas de servidor
        if (!response.ok) {
            throw new Error(`O servidor respondeu com status ${response.status}`);
        }

        const data = await response.json();
        console.log("[Debug API] Resposta recebida:", data);

        // Verifica se o elemento existe e tem um valor válido
        const motivo = data.reason ? data.reason : "Sem detalhes informados.";

        if (data.isSuspicious) {
            exibirResultado(`Link Malicioso! Motivo: ${motivo}`, "perigo");
        } else {
            exibirResultado(`Link Seguro! (${motivo})`, "seguro");
        }
    } catch (error) {
        console.error("[Erro de Requisição]:", error);
        exibirResultado(`DEBUG: Erro de comunicação, verifique se o Live Server está rodando ou se o Render está ativo. Detalhes: ${error.message}`, "perigo");
    }
});