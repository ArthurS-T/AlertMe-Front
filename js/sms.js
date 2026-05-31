// API no render
const URL_BACKEND = "http://localhost:8080"; // const URL_BACKEND = "http://localhost:8080";

// Elementos da página
const btnCarregarReal = document.getElementById('btn-carregar-real');
const btnCarregarFake = document.getElementById('btn-carregar-fake');
const smsInput = document.getElementById('sms-input');
const btnAnalisarSms = document.getElementById('btn-analisar-sms');
const resultadoPainel = document.getElementById('resultado-painel');

// Texto exemplo
const SMS_VERIDICO = "Prezado cliente, sua fatura NET vence no dia 10/06. Acesse o site oficial da Bradesco para mais detalhes: https://banco.bradesco/";
const SMS_FALSO = "URGENTE: Seu CPF possui uma restricao judicial ativa. Evite o bloqueio de contas regularizando agora em: http://linkmaliciosoaqui.com";

// Injeta o texto legítimo no campo
btnCarregarReal.addEventListener('click', () => {
    resultadoPainel.classList.add('display-none');
    smsInput.value = SMS_VERIDICO;
});

// Injeta o texto de Phishing no campo
btnCarregarFake.addEventListener('click', () => {
    resultadoPainel.classList.add('display-none');
    smsInput.value = SMS_FALSO;
});

// Função para exibir o painel de resultados
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

// Envio para o Endpoint de SMS do Render
btnAnalisarSms.addEventListener('click', async () => {
    const smsValue = smsInput.value.trim();
    if (!smsValue) {
        alert("Por favor, selecione um exemplo ou digite um SMS.");
        return;
    }

    exibirResultado("Analisando o texto do SMS e extraindo links para checagem no Sistema...", "carregando");

    try {
        const response = await fetch(`${URL_BACKEND}/api/sms/verificar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ smsText: smsValue })
        });

        // Proteção contra Erro 400 ou falhas de servidor no SMS
        if (!response.ok) {
            throw new Error(`O servidor respondeu com status ${response.status}`);
        }

        const data = await response.json();
        console.log("[Debug API SMS] Resposta recebida:", data);

        let motivo = "Nenhum detalhe fornecido.";
        if (data.reason) {
            motivo = data.reason;
        }

        const suspeito = data.isSuspicious || data.suspicious;

        if (suspeito === true || suspeito === "true") {
            exibirResultado(`MENSAGEM BLOQUEADA: Contém links perigosos! ${motivo}`, "perigo");
        } else {
            exibirResultado(`MENSAGEM LIBERADA: ${motivo}`, "seguro");
        }
    } catch (error) {
        console.error("[Erro de Requisição SMS]:", error);
        exibirResultado(`Erro de comunicação. Detalhes: ${error.message}`, "perigo");
    }
});