import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Question {
  text: string;
  options: string[];
  emojis: string[];
}

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent {
  currentStage = 1;
  totalStages = 7;
  score = 0;
  message = '';
  showMessage = false;
  disableChoices = false;
  messageType: 'success' | 'danger' | 'warning' = 'success';
  showReveal = false;
  playerChoice = -1;
  computerChoice = -1;

  // الأسئلة مع جميع الخيارات (سيتم تقليلها تلقائياً)
  allQuestions: Question[] = [
    {
      text: 'اختر فاكهة',
      options: ['تفاح', 'موز', 'عنب', 'بطيخ', 'فراولة', 'برتقال', 'أناناس', 'كيوي'],
      emojis: ['🍎', '🍌', '🍇', '🍉', '🍓', '🍊', '🍍', '🥝']
    },
    {
      text: 'اختر لون',
      options: ['أحمر', 'أخضر', 'أزرق', 'أصفر', 'بنفسجي', 'برتقالي', 'وردي'],
      emojis: ['🔴', '🟢', '🔵', '🟡', '🟣', '🟠', '🩷']
    },
    {
      text: 'اختر حيوان',
      options: ['أسد', 'فيل', 'بطريق', 'دولفين', 'نسر', 'نمر'],
      emojis: ['🦁', '🐘', '🐧', '🐬', '🦅', '🐯']
    },
    {
      text: 'اختر رياضة',
      options: ['كرة قدم', 'سلة', 'تنس', 'سباحة', 'ملاكمة'],
      emojis: ['⚽', '🏀', '🎾', '🏊', '🥊']
    },
    {
      text: 'اختر طعام',
      options: ['بيتزا', 'برجر', 'سوشي', 'تاكو'],
      emojis: ['🍕', '🍔', '🍣', '🌮']
    },
    {
      text: 'اختر مركبة',
      options: ['سيارة', 'طائرة', 'قارب'],
      emojis: ['🚗', '✈️', '⛵']
    },
    {
      text: 'اختر آلة موسيقية',
      options: ['جيتار', 'بيانو'],
      emojis: ['🎸', '🎹']
    }
  ];

  constructor(private router: Router) {}

  get currentQuestion() {
    return this.allQuestions[this.currentStage - 1];
  }

  // عدد الخيارات يقل مع كل مرحلة (8 → 7 → 6 → 5 → 4 → 3 → 2)
  get currentOptionsCount(): number {
    return 9 - this.currentStage; // 8, 7, 6, 5, 4, 3, 2
  }

  chooseOption(index: number) {
    if (this.disableChoices) return;

    this.playSound('click');
    this.disableChoices = true;
    this.playerChoice = index;

    // Generate computer choice
    const computerIndex = this.getRandomChoice(this.currentQuestion.options.length);
    this.computerChoice = computerIndex;

    // Show reveal animation
    setTimeout(() => {
      this.showReveal = true;

      setTimeout(() => {
        this.processResult(index, computerIndex);
      }, 1200);
    }, 600);
  }

  processResult(playerIdx: number, computerIdx: number) {
    const isMatch = playerIdx === computerIdx;
    const isCloseCall = Math.abs(playerIdx - computerIdx) === 1;

    if (isMatch) {
      // Loss - stop game
      this.playSound('fail');
      this.message = '❌ خسرت! اخترت نفس اختيار الكمبيوتر!';
      this.messageType = 'danger';
      this.showMessage = true;

      setTimeout(() => {
        this.router.navigate(['/result'], {
          state: {
            score: this.score,
            stage: this.currentStage,
            lost: true
          }
        });
      }, 2000);
    } else {
      // Success
      this.playSound('success');
      this.score++;

      if (isCloseCall && this.currentQuestion.options.length > 2) {
        this.message = '😅 كان قريباً! لكنك نجوت!';
        this.messageType = 'warning';
      } else {
        this.message = '✅ ممتاز! اختيار مختلف!';
        this.messageType = 'success';
      }

      this.showMessage = true;

      setTimeout(() => {
        if (this.currentStage < this.totalStages) {
          this.currentStage++;
          this.resetRound();
        } else {
          // Won all stages
          this.router.navigate(['/result'], {
            state: {
              score: this.score,
              stage: this.currentStage,
              lost: false
            }
          });
        }
      }, 1500);
    }
  }

  resetRound() {
    this.showMessage = false;
    this.showReveal = false;
    this.disableChoices = false;
    this.playerChoice = -1;
    this.computerChoice = -1;
    this.message = '';
  }

  getRandomChoice(numOptions: number): number {
    return Math.floor(Math.random() * numOptions);
  }

  get progressWidth() {
    return (this.score / this.totalStages) * 100;
  }

  // Simple sound effects using Web Audio API
  playSound(type: 'click' | 'success' | 'fail') {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      switch (type) {
        case 'click':
          oscillator.frequency.value = 400;
          gainNode.gain.value = 0.1;
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.05);
          break;
        case 'success':
          oscillator.frequency.value = 600;
          gainNode.gain.value = 0.15;
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.15);
          break;
        case 'fail':
          oscillator.type = 'sawtooth';
          oscillator.frequency.value = 100;
          gainNode.gain.value = 0.2;
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.3);
          break;
      }
    } catch (e) {
      // Silent fail if audio not supported
    }
  }
}
