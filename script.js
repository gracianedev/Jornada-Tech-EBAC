import utils from './utils.js'
import RNA from './RNA.js'
import controls from './controls.js'

const Samples = 20
const game = Runner.instance_;
let dinoList = []
let dinoIndex = 0

let bestScore = 0
let bestRNA = null;

function fillDinoList (){
    for (let i=0; i<Samples; i++){
        dinoList[i] = new RNA (3,[10,10,2])
        dinoList[i].load(bestRNA)
        if(i>0) dinoList[i].mutate(0.5)
    }
    console.log('Lista de dinossauros criada!')
}
setTimeout(() => {
    fillDinoList();
    controls.dispatch('jump'); // Faz o dinossauro executar um salto no jogo
  }, 1000);
  
  setInterval(() => {
    if (!game.activated) return; // Verifica se o jogo está ativado
  
    const dino = dinoList[dinoIndex]; // Seleciona o dinossauro atual
  
    if (game.crashed) { // Verifica se o dinossauro colidiu no jogo
      if (dino.score > bestScore) {
        bestScore = dino.score;
        bestRNA = dino.save(); // Salva a RNA do dinossauro com a melhor pontuação
        console.log('bestScore:', bestScore);
      }
      dinoIndex++;
  
      if (dinoIndex === SAMPLES) { // Se todos os dinossauros foram avaliados, preenche a lista novamente
        fillDinoList();
        dinoIndex = 0;
        bestScore = 0;
      }
      game.restart(); // Reinicia o jogo
    }
  
    const { tRex, horizon, currentSpeed, distanceRan, dimensions } = game;
    dino.score = distanceRan - 2000; // Calcula a pontuação do dinossauro
  
    const player = {
      x: tRex.xPos,
      y: tRex.yPos,
      speed: currentSpeed,
    };
  
    const [obstacle] = horizon.obstacles
      .map((obstacle) => {
        return {
          x: obstacle.xPos,
          y: obstacle.yPos,
        }
      })
      .filter((obstacle) => obstacle.x > player.x)
  
    if (obstacle) { // Verifica se há um obstáculo presente
      const distance = 1 - (utils.getDistance(player, obstacle) / dimensions.WIDTH); // Calcula a distância relativa entre o jogador e o obstáculo
      const speed = player.speed / 6; // Calcula a velocidade relativa do jogador
      const height = Math.tanh(105 - obstacle.y); // Calcula a altura relativa do obstáculo
  
      // Processa as informações no dinossauro atual
      const [jump, crounch] = dino.compute([
        distance,
        speed,
        height,
      ]);
  
      // Executa as ações com base nas probabilidades calculadas
      if (jump === crounch) return; // Se a probabilidade de salto e agachamento forem iguais, nenhuma ação é tomada
      if (jump) controls.dispatch('jump'); // Se a probabilidade de salto for verdadeira, o dinossauro executa um salto
      if (crounch) controls.dispatch('crounch'); // Se a probabilidade de agachamento for verdadeira, o dinossauro se agacha
    }
  }, 100);
  
  /* const s = document.createElement('script');
  s.type = 'module';
  s.src = 'http://localhost:5500/script.js';
  document.body.appendChild(s); */