import { MainBackground } from '../../../../store/background';

export function translateBackgroundValue(value) {
  switch (value) {
    case MainBackground.StaticLightsOut:
      return 'Lights Out (Static)';
    case MainBackground.StaticGreenParticles:
      return 'Green Particle (Static)';
    case MainBackground.AnimatedGreenParticles:
      return 'Green Particle (Animated)';
    case MainBackground.AnimatedBlackParticles:
      return 'Black Particle (Animated)';
    default:
      return '';
  }
}
