import { MainBackground } from '../../../../store/background';
import { translateBackgroundValue } from './utils';

describe('translateBackgroundValue', () => {
  it('should return "Lights Out (Static)" for MainBackground.StaticLightsOut', () => {
    expect(translateBackgroundValue(MainBackground.StaticLightsOut)).toBe('Lights Out (Static)');
  });

  it('should return "Green Particle (Static)" for MainBackground.StaticGreenParticles', () => {
    expect(translateBackgroundValue(MainBackground.StaticGreenParticles)).toBe('Green Particle (Static)');
  });

  it('should return "Green Particle (Animated)" for MainBackground.AnimatedGreenParticles', () => {
    expect(translateBackgroundValue(MainBackground.AnimatedGreenParticles)).toBe('Green Particle (Animated)');
  });

  it('should return "Black Particle (Animated)" for MainBackground.AnimatedBlackParticles', () => {
    expect(translateBackgroundValue(MainBackground.AnimatedBlackParticles)).toBe('Black Particle (Animated)');
  });

  it('should return an empty string for an unknown value', () => {
    expect(translateBackgroundValue('unknown-value')).toBe('');
  });
});
