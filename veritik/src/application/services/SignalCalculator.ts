import { Signal } from '../../domain';
import type { Profile } from '../../domain';
import { rampDown, rampUp, trapezoid } from './scoring';
import { SIGNAL_SCORING as S } from './signalScoring';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Convierte las métricas de un perfil en las seis señales del puntaje de autenticidad.
 * Si faltan datos para una señal, la devuelve como `unavailable` en lugar de inventar un valor.
 */
export class SignalCalculator {
  /** @param previous Perfil del último análisis guardado del mismo usuario (para detectar saltos de seguidores). */
  calculate(profile: Profile, previous: Profile | null = null): Signal[] {
    return [
      this.engagement(profile),
      this.viewsToFollowers(profile),
      this.commentQuality(profile),
      this.followRatio(profile),
      this.postingRegularity(profile),
      this.followerJumps(profile, previous),
    ];
  }

  private engagement(profile: Profile): Signal {
    const rate = profile.averageEngagementRate;
    if (rate === null) return Signal.unavailable('engagement');
    const c = S.engagement;
    return Signal.create({
      id: 'engagement',
      score: trapezoid(rate, c.zeroBelow, c.fullFrom, c.fullUntil, c.zeroAbove),
      rawValue: rate,
    });
  }

  private viewsToFollowers(profile: Profile): Signal {
    const ratio = profile.viewsToFollowersRatio;
    if (ratio === null) return Signal.unavailable('viewsToFollowers');
    return Signal.create({
      id: 'viewsToFollowers',
      score: rampUp(ratio, S.viewsToFollowers.zeroAt, S.viewsToFollowers.fullAt),
      rawValue: ratio,
    });
  }

  private commentQuality(profile: Profile): Signal {
    const sample = profile.commentSample;
    if (sample === null || sample.total < S.commentQuality.minComments) {
      return Signal.unavailable('commentQuality');
    }
    const c = S.commentQuality;
    return Signal.create({
      id: 'commentQuality',
      score: rampDown(sample.genericRatio, c.fullAtGenericRatio, c.zeroAtGenericRatio),
      rawValue: sample.genericRatio,
    });
  }

  private followRatio(profile: Profile): Signal {
    const ratio = profile.followersToFollowingRatio;
    // Sin seguidos la razón no está definida: no se penaliza ni se premia.
    if (ratio === null) return Signal.unavailable('followRatio');
    return Signal.create({
      id: 'followRatio',
      score: rampUp(ratio, S.followRatio.zeroAt, S.followRatio.fullAt),
      rawValue: ratio,
    });
  }

  private postingRegularity(profile: Profile): Signal {
    const perWeek = profile.postsPerWeek;
    if (perWeek === null) return Signal.unavailable('postingRegularity');
    const c = S.postingRegularity;
    return Signal.create({
      id: 'postingRegularity',
      score: trapezoid(perWeek, c.zeroBelow, c.fullFrom, c.fullUntil, c.zeroAbove),
      rawValue: perWeek,
    });
  }

  private followerJumps(profile: Profile, previous: Profile | null): Signal {
    if (previous === null) return Signal.unavailable('followerJumps');
    const days = (profile.fetchedAt.getTime() - previous.fetchedAt.getTime()) / MS_PER_DAY;
    if (days < S.followerJumps.minDays) return Signal.unavailable('followerJumps');

    const relativeChange = (profile.followers - previous.followers) / Math.max(previous.followers, 1);
    const dailyChange = Math.abs(relativeChange) / days;
    const c = S.followerJumps;
    return Signal.create({
      id: 'followerJumps',
      score: rampDown(dailyChange, c.fullAtDailyChange, c.zeroAtDailyChange),
      rawValue: dailyChange,
    });
  }
}
