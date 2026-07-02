const CONFIG = {
    nomeImagemBase: 'recibo-base.png',
    fontePadrao: 'Arial',
    campos: {
        cliente_1:         { x: 157, y: 274, fontSize: 32, color: '#000000', maxX: 580 },
        cliente_1_linha2:  { x: 157, y: 315, fontSize: 32, color: '#000000' },
        
        cliente_2:     { x: 1060, y: 325, fontSize: 36, color: '#000000' },
        
        valor_1:       { x: 355, y: 460, fontSize: 40, color: '#000000', align: 'center' },
        
        valor_2:       { x: 1927, y: 196, fontSize: 40, color: '#000000' },
        
        valor_extenso:        { x: 1081, y: 408, fontSize: 32, color: '#000000', maxX: 2231 },
        valor_extenso_linha2: { x: 849, y: 480, fontSize: 32, color: '#000000' },
        
        referente_1:         { x: 147, y: 640, fontSize: 28, color: '#000000', maxX: 580 },
        referente_1_linha2:  { x: 147, y: 675, fontSize: 28, color: '#000000' }, 
        
        referente_2:   { x: 1086, y: 583, fontSize: 32, color: '#000000' },
        
        data_1:        { x: 348, y: 890, fontSize: 45, color: '#000000', align: 'center' },
        
        data_2_dia:    { x: 869, y: 810, fontSize: 45, color: '#000000' },
        data_2_mes:    { x: 993, y: 810, fontSize: 45, color: '#000000' },
        data_2_ano:    { x: 1117, y: 810, fontSize: 45, color: '#000000' },
        
        assinatura_1:  { x: 1826, y: 810, fontSize: 50, color: '#000000', align: 'center' }
    }
};

const inputs = {
    cliente: document.getElementById('cliente'),
    valor: document.getElementById('valor'),
    referente: document.getElementById('referente'),
    data: document.getElementById('data'),
    assinatura: document.getElementById('assinatura')
};

const canvas = document.getElementById('reciboCanvas');
const ctx = canvas.getContext('2d');
const btnBaixar = document.getElementById('btnBaixar');

const imagemBase = new Image();
imagemBase.src = CONFIG.nomeImagemBase;

imagemBase.onload = () => {
    canvas.width = imagemBase.width;
    canvas.height = imagemBase.height;
    btnBaixar.disabled = false;
    renderizarRecibo();
};

function renderizarRecibo() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imagemBase, 0, 0);
    
    const dados = {
        cliente: inputs.cliente.value,
        valor_num_com_rs: inputs.valor.value ? `R$ ${inputs.valor.value}` : '',
        valor_num_sem_rs: inputs.valor.value ? inputs.valor.value : '',
        valor_extenso: valorPorExtenso(inputs.valor.value),
        referente: inputs.referente.value,
        data: inputs.data.value,
        assinatura: inputs.assinatura.value
    };

    desenharTextoComQuebra(dados.cliente, CONFIG.campos.cliente_1, CONFIG.campos.cliente_1_linha2);
    desenharTexto(dados.cliente, CONFIG.campos.cliente_2);
    
    desenharTexto(dados.valor_num_com_rs, CONFIG.campos.valor_1);
    desenharTexto(dados.valor_num_sem_rs, CONFIG.campos.valor_2);
    
    desenharTextoComQuebra(dados.valor_extenso, CONFIG.campos.valor_extenso, CONFIG.campos.valor_extenso_linha2);
    
    desenharTextoComQuebra(dados.referente, CONFIG.campos.referente_1, CONFIG.campos.referente_1_linha2);
    desenharTexto(dados.referente, CONFIG.campos.referente_2);
    
    desenharTexto(dados.data, CONFIG.campos.data_1);
    
    if (dados.data) {
        const partes = dados.data.split('/');
        if (partes[0]) desenharTexto(partes[0], CONFIG.campos.data_2_dia);
        if (partes[1]) desenharTexto(partes[1], CONFIG.campos.data_2_mes);
        if (partes[2]) desenharTexto(partes[2], CONFIG.campos.data_2_ano);
    }
    
    if (dados.assinatura.length > 30) {
        CONFIG.campos.assinatura_1.fontSize = 42;
    } else {
        CONFIG.campos.assinatura_1.fontSize = 50;
    }
    
    desenharTexto(dados.assinatura, CONFIG.campos.assinatura_1);
}

function desenharTexto(texto, configCampo) {
    if (!texto) return;
    ctx.font = `${configCampo.fontSize}px ${CONFIG.fontePadrao}`;
    ctx.fillStyle = configCampo.color;
    ctx.textBaseline = 'top';
    
    ctx.textAlign = configCampo.align || 'left'; 
    
    ctx.fillText(texto, configCampo.x, configCampo.y);
    
    ctx.textAlign = 'left'; 
}

function desenharTextoComQuebra(texto, configLinha1, configLinha2) {
    if (!texto) return;
    
    ctx.textAlign = 'left'; 
    ctx.font = `${configLinha1.fontSize}px ${CONFIG.fontePadrao}`;
    ctx.fillStyle = configLinha1.color;
    ctx.textBaseline = 'top';

    const limiteLargura = configLinha1.maxX - configLinha1.x;
    const palavras = texto.split(' ');
    
    let linha1 = '';
    let restoTexto = '';
    let irParaLinha2 = false;

    for (let i = 0; i < palavras.length; i++) {
        if (!irParaLinha2) {
            let testeLargura = ctx.measureText(linha1 + palavras[i] + ' ').width;
            
            if (testeLargura <= limiteLargura) {
                linha1 += palavras[i] + ' ';
            } else {
                if (linha1 === '') {
                    let palavraGigante = palavras[i];
                    for (let c = 0; c < palavraGigante.length; c++) {
                        if (ctx.measureText(linha1 + palavraGigante[c]).width <= limiteLargura) {
                            linha1 += palavraGigante[c];
                        } else {
                            restoTexto += palavraGigante.substring(c) + ' ';
                            irParaLinha2 = true;
                            break;
                        }
                    }
                } else {
                    restoTexto += palavras[i] + ' ';
                    irParaLinha2 = true;
                }
            }
        } else {
            restoTexto += palavras[i] + ' ';
        }
    }

    ctx.fillText(linha1.trim(), configLinha1.x, configLinha1.y);
    
    if (restoTexto.trim().length > 0) {
        ctx.font = `${configLinha2.fontSize}px ${CONFIG.fontePadrao}`;
        ctx.fillStyle = configLinha2.color;
        ctx.fillText(restoTexto.trim(), configLinha2.x, configLinha2.y);
    }
}

Object.keys(inputs).forEach(key => {
    const input = inputs[key];
    const contador = input.nextElementSibling;
    
    input.addEventListener('input', (e) => {
        if (key === 'data') input.value = mascaraData(input.value);
        if (key === 'valor') input.value = mascaraMoeda(input.value);
        
        const max = input.getAttribute('maxlength');
        if (contador) contador.textContent = `${input.value.length}/${max}`;
        renderizarRecibo();
    });
});

function mascaraData(v) {
    v = v.replace(/\D/g, "");
    if (v.length > 2) v = v.substring(0,2) + "/" + v.substring(2);
    if (v.length > 5) v = v.substring(0,5) + "/" + v.substring(5,9);
    return v;
}

function mascaraMoeda(v) {
    v = v.replace(/\D/g, "");
    v = (v / 100).toFixed(2) + "";
    v = v.replace(".", ",");
    v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
    return v === "0,00" ? "" : v;
}

function valorPorExtenso(valor) {
    if (!valor) return '';
    let num = valor.replace(/\./g, '').replace(',', '.');
    num = parseFloat(num);
    if (isNaN(num) || num === 0) return '';

    const unidades = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];
    const dezenas = ["", "dez", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
    const especiais = ["dez", "onze", "doze", "treze", "catorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
    const centenas = ["", "cem", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];

    function converteGrupo(n) {
        if (n === 100) return "cem";
        let c = Math.floor(n / 100);
        let d = Math.floor((n % 100) / 10);
        let u = n % 10;
        
        let res = [];
        if (c > 0) res.push(c === 1 && (d > 0 || u > 0) ? "cento" : centenas[c]);
        if (d === 1) {
            res.push(especiais[u]);
        } else {
            if (d > 1) res.push(dezenas[d]);
            if (u > 0 && d !== 1) res.push(unidades[u]);
        }
        return res.join(" e ");
    }

    let reais = Math.floor(num);
    let centavos = Math.round((num - reais) * 100);
    
    let partes = [];
    if (reais > 0) {
        let bilhoes = Math.floor(reais / 1000000000);
        let milhoes = Math.floor((reais % 1000000000) / 1000000);
        let milhares = Math.floor((reais % 1000000) / 1000);
        let unidadesReais = reais % 1000;

        if (bilhoes > 0) partes.push(converteGrupo(bilhoes) + (bilhoes > 1 ? " bilhões" : " bilhão"));
        if (milhoes > 0) partes.push(converteGrupo(milhoes) + (milhoes > 1 ? " milhões" : " milhão"));
        if (milhares > 0) partes.push(converteGrupo(milhares) + " mil");
        if (unidadesReais > 0) partes.push(converteGrupo(unidadesReais));
        
        let strReais = partes.join(" e ");
        strReais += reais === 1 ? " real" : " reais";
        partes = [strReais];
    }

    if (centavos > 0) {
        let strCentavos = converteGrupo(centavos) + (centavos === 1 ? " centavo" : " centavos");
        partes.push(strCentavos);
    }

    return partes.join(" e ");
}

btnBaixar.addEventListener('click', () => {
    const urlImagem = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `recibo-${inputs.cliente.value.trim() || 'gerado'}.png`;
    link.href = urlImagem;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

canvas.addEventListener('mousedown', function(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);

    alert(`Coordenadas -> X: ${x}, Y: ${y}`);
});

// --- LÓGICA DOS BOTÕES DE PREENCHIMENTO RÁPIDO ---

// Preencher Data de Hoje
const btnHoje = document.getElementById('btnHoje');
if (btnHoje) {
    btnHoje.addEventListener('click', () => {
        const hoje = new Date();
        const dia = String(hoje.getDate()).padStart(2, '0');
        const mes = String(hoje.getMonth() + 1).padStart(2, '0');
        const ano = hoje.getFullYear();
        
        inputs.data.value = `${dia}/${mes}/${ano}`;
        
        // Dispara o evento de 'input' para forçar a formatação, o contador e a renderização do Canvas
        inputs.data.dispatchEvent(new Event('input')); 
    });
}

// Preencher Nomes da Assinatura
document.querySelectorAll('.btn-assinatura').forEach(btn => {
    btn.addEventListener('click', (e) => {
        inputs.assinatura.value = e.target.getAttribute('data-nome');
        
        // Dispara o evento de 'input' para atualizar Canvas e o contador
        inputs.assinatura.dispatchEvent(new Event('input'));
    });
});