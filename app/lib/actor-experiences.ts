type ActorReference = {
  recordId?: string;
  slug?: string;
};

type ExperienceResponsibleReference = {
  responsibleRecordId?: string;
  responsibleSlug?: string;
};

export function experienceBelongsToActor(
  experience: ExperienceResponsibleReference,
  actor: ActorReference,
) {
  const byRecordId = Boolean(
    actor.recordId &&
      experience.responsibleRecordId &&
      experience.responsibleRecordId === actor.recordId,
  );

  return byRecordId || Boolean(actor.slug && experience.responsibleSlug === actor.slug);
}
