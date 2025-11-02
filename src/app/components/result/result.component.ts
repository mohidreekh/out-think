import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.css']
})
export class ResultComponent implements OnInit {
  score = 0;
  stage = 1;
  lost = false;
  showConfetti = false;

  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { score: number, stage: number, lost: boolean };

    if (state) {
      this.score = state.score ?? 0;
      this.stage = state.stage ?? 1;
      this.lost = state.lost ?? false;
    }
  }

  ngOnInit() {
    // Show confetti if won all stages
    if (!this.lost && this.score === 7) {
      this.showConfetti = true;
      this.createConfetti();
    }
  }

  restart() {
    this.router.navigate(['/']);
  }

  get resultMessage(): string {
    if (!this.lost && this.score === 7) {
      return '🎉 مبروك! فزت بكل المراحل!';
    } else if (this.score >= 5) {
      return '👏 أداء رائع!';
    } else if (this.score >= 3) {
      return '👍 أداء جيد!';
    } else if (this.score >= 1) {
      return '💪 حاول مرة أخرى!';
    } else {
      return '🎮 لا تستسلم!';
    }
  }

  get resultEmoji(): string {
    if (!this.lost && this.score === 7) {
      return '🏆';
    } else if (this.score >= 5) {
      return '🌟';
    } else if (this.score >= 3) {
      return '⭐';
    } else if (this.score >= 1) {
      return '💪';
    } else {
      return '🎮';
    }
  }

  createConfetti() {
    const colors = ['#f093fb', '#f5576c', '#ffd700', '#4caf50', '#2196f3', '#ff9800'];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 3 + 's';
        confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
        document.body.appendChild(confetti);

        setTimeout(() => {
          confetti.remove();
        }, 5000);
      }, i * 30);
    }
  }
}
