export interface PopulationComposition {
  prefName: string
  populationCompositionData: PopulationCompositionDataDetail[]
}

export interface PopulationCompositionDataDetail {
  label: string
  data: object[]
}
