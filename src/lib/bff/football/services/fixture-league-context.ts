import type { LeagueDTO } from '@/lib/contracts/dto';
import type { CountryRecord } from '@/lib/firebase/repositories/countries.repository';
import type { FixtureLeagueContext } from '../mappers/fixture.mapper';

export function buildFixtureLeagueContext(
  league: LeagueDTO,
  country: CountryRecord | null,
): FixtureLeagueContext {
  return {
    name: league.name,
    logo: league.logo,
    countryName: country?.name ?? league.country,
    countryFlag: country?.flag ?? null,
  };
}
