export function hasRequiredRelationshipStage(selectedStages: string[]): boolean {
  return selectedStages.length > 0 && selectedStages[0].trim().length > 0;
}
