const URL_BACKEND = "https://alertme-sistema.onrender.com"; 
const API_URL = `${URL_BACKEND}/api/sms/verificar`;

// Elementos da página
const smsInput = document.getElementById('sms-input');
const resultadoPainel = document.getElementById('resultado-painel');

function abrirChat(nomeContato, textoSms) {
    // Transição de telas
    document.getElementById('tela-lista-sms').classList.add('display-none');
    document.getElementById('container-sms').classList.remove('display-none');
    document.getElementById('chat-nome-contato').textContent = nomeContato;
    
    const historico = document.getElementById('historico-sms');
    historico.innerHTML = ''; // Limpa o histórico de conversas anteriores
    
    if (smsInput) {
        smsInput.value = '';
    }

    if (!textoSms || textoSms.trim() === '') {
        exibirBalaoSistema("Nenhuma mensagem de texto para analisar nesta conversa.");
        return;
    }

    exibirBalaoOriginalSms(textoSms);

    // Balão de loading
    const idBalaoCarregando = "balao-loading-temp";
    exibirBalaoProcessando(idBalaoCarregando);

    // Requisição pro backend
    fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ smsText: textoSms })
    })
    .then(response => {
        if (!response.ok) throw new Error(`O servidor respondeu com status ${response.status}`);
        return response.json();
    })
    .then(data => {
        // Remove o indicador visual de processamento
        removerBalaoTemporario(idBalaoCarregando);

        // Injeta o Alerta na tela do celular
        exibirAlertaSeguranca(data.isSuspicious, data.reason);
    })
    .catch(error => {
        console.error("[Erro Background]:", error);
        removerBalaoTemporario(idBalaoCarregando);
        exibirAlertaSeguranca(true, "Não foi possível validar a segurança deste link em tempo real. Prossiga com cuidado.");
    });
}

function exibirBalaoOriginalSms(texto) {
    const historico = document.getElementById('historico-sms');
    const div = document.createElement('div');
    div.className = 'msg-bubble msg-received';
    div.textContent = texto;
    historico.appendChild(div);
}

function exibirBalaoSistema(texto) {
    const historico = document.getElementById('historico-sms');
    const div = document.createElement('div');
    div.className = 'msg-bubble msg-received';
    div.style.fontStyle = 'italic';
    div.textContent = texto;
    historico.appendChild(div);
}

function exibirBalaoProcessando(idElemento) {
    const historico = document.getElementById('historico-sms');
    const div = document.createElement('div');
    div.className = 'msg-bubble msg-system-loading';
    div.id = idElemento;
    div.innerHTML = `<span class="spinner-loading">🔄</span> Analisando conteúdo e links...`;
    historico.appendChild(div);
}

function removerBalaoTemporario(idElemento) {
    const elemento = document.getElementById(idElemento);
    if (elemento) elemento.remove();
}

function exibirAlertaSeguranca(isSuspicious, motivo) {
    const historico = document.getElementById('historico-sms');
    const div = document.createElement('div');
    
    if (isSuspicious === true || isSuspicious === "true") {
        div.className = 'alerta-seguranca-container alerta-perigo';
        div.innerHTML = `
            <div class="alerta-icone">⚠️</div>
            <div class="alerta-texto">
                <strong>Link ou Contexto Suspeito Detectado!</strong>
                <p>${motivo}</p>
            </div>
        `;
    } else {
        div.className = 'alerta-seguranca-container alerta-seguro';
        div.innerHTML = `
            <div class="alerta-icone">✅</div>
            <div class="alerta-texto">
                <strong>Link verificado com sucesso</strong>
                <p>${motivo}</p>
            </div>
        `;
    }
    
    // Insere no topo da conversa (acima da mensagem de texto)
    historico.insertBefore(div, historico.firstChild);
}

function voltarParaLista() {
    document.getElementById('container-sms').classList.add('display-none');
    document.getElementById('tela-lista-sms').classList.remove('display-none');
}