
export const hospitalPrefixes = [
  { prefix: 'CHU', description: 'Centre Hospitalo-Universitaire' },
  { prefix: 'EHU', description: 'Etablissement Hospitalo-Universitaire' },
  { prefix: 'EHS', description: 'Etablissement Hospitalier Spécialisé' },
  { prefix: 'EPH', description: 'Etablissement Public Hospitalier' },
  { prefix: 'EPSP', description: 'Etablissement Public de Santé de Proximité' },
  { prefix: 'CLP', description: 'Clinique Privée' },
  { prefix: 'HMA', description: 'Hôpital Militaire d\'Alger' },
  { prefix: 'HMP', description: 'Hôpital Militaire Provincial' },
  { prefix: 'HP', description: 'Hôpital Psychiatrique' },
  { prefix: 'HM', description: 'Hôpital Maternité' },
  { prefix: 'CAC', description: 'Centre Anti-Cancer' },
  { prefix: 'CMP', description: 'Cabinet Médical Privé' }
] as const;

export type HospitalPrefix = typeof hospitalPrefixes[number]['prefix'];
