// Controle de Hábitos - script.js
// Gerenciador completo com streaks, histórico 30 dias, localStorage

let habitos = [];
const DIAS_HISTORICO = 30;

function init() {
  carregarDados();
  atualizarDataHoje();
  renderizarHabitos();
}

function atualizarDataHoje() {
  const hoje = new Date();
  const opcoes = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  document.getElementById('dataHoje').textContent = `Hoje: ${hoje.toLocaleDateString('pt-BR', opcoes)}`;
}

function adicionarHabito() {
  const input = document.getElementById('inputHabito');
  const nome = input.value.trim();
  
  if (nome === '') return;
  
  const novoHabito = {
    nome: nome,
    completado: new Array(DIAS_HISTORICO).fill(false),
    streakAtual: 0,
    melhorStreak: 0
  };
  
  habitos.push(novoHabito);
  calcularStreaks();
  salvarDados();
  renderizarHabitos();
  input.value = '';
}

function toggleCompletion(indexHabito, indexDia) {
  habitos[indexHabito].completado[indexDia] = !habitos[indexHabito].completado[indexDia];
  calcularStreaks();
  salvarDados();
  renderizarHabitos();
}

function deleteHabit(index) {
  if (confirm(`Excluir "${habitos[index].nome}"?`)) {
    habitos.splice(index, 1);
    salvarDados();
    renderizarHabitos();
  }
}

function calcularStreaks() {
  const hoje = new Date();
  const diaHoje = hoje.getDay();
  
  habitos.forEach((habito, index) => {
    let streak = 0;
    let bestStreak = habito.melhorStreak || 0;
    
    // Conta streak atual (dias consecutivos do final)
    for (let i = DIAS_HISTORICO - 1; i >= 0; i--) {
      if (habito.completado[i]) {
        streak++;
        if (streak > bestStreak) bestStreak = streak;
      } else {
        break;
      }
    }
    
    habitos[index].streakAtual = streak;
    habitos[index].melhorStreak = bestStreak;
  });
}

function renderizarHabitos() {
  const lista = document.getElementById('listaHabitos');
  lista.innerHTML = '';
  
  if (habitos.length === 0) {
    lista.innerHTML = '<p class="sem-habitos">Adicione um hábito para começar! 💪</p>';
    return;
  }
  
  habitos.forEach((habito, indexHabito) => {
    const card = document.createElement('div');
    card.className = 'habito-card';
    
    const streakEmoji = habitos[indexHabito].streakAtual >= 7 ? '🔥' : habitos[indexHabito].streakAtual >= 3 ? '⚡' : '📈';
    
    card.innerHTML = `
      <div class="habito-header">
        <h3>${habito.nome}</h3>
        <div class="streaks">
          <span class="streak-atual">${streakEmoji} ${habito.streakAtual} dias</span>
          <span class="melhor-streak">🏆 ${habito.melhorStreak}</span>
        </div>
        <button class="delete-btn" onclick="deleteHabit(${indexHabito})">🗑️</button>
      </div>
      <div class="dias-grid">
        ${gerarCheckboxes(indexHabito)}
      </div>
    `;
    
    lista.appendChild(card);
  });
}

function gerarCheckboxes(indexHabito) {
  let html = '';
  const hojeIndex = DIAS_HISTORICO - 1; // Hoje é o último
  
  for (let i = 0; i < DIAS_HISTORICO; i++) {
    const dia = DIAS_HISTORICO - 1 - i; // Inverte: mais recente à esquerda
    const className = dia === hojeIndex ? 'hoje' : '';
    const checked = habitos[indexHabito].completado[dia] ? '✅' : '○';
    html += `<span class="dia ${className}" onclick="toggleCompletion(${indexHabito}, ${dia})">${checked}</span>`;
  }
  return html;
}

function carregarDados() {
  const dados = localStorage.getItem('habitos');
  if (dados) {
    habitos = JSON.parse(dados);
    // Recalcular streaks ao carregar (caso dados antigos)
    calcularStreaks();
  }
}

function salvarDados() {
  localStorage.setItem('habitos', JSON.stringify(habitos));
}

// Event listeners
document.addEventListener('DOMContentLoaded', init);
document.getElementById('inputHabito').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') adicionarHabito();
});
