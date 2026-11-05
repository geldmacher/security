export const releaseInstallerSkill = "install-new-release-from-repo";
export const openCodeReleaseInstallerSkill = "security-install-release";

export const portableSkills = Object.freeze([
  releaseInstallerSkill,
  "security",
  "security-audit",
]);
export const codexAdapterSkill = "security-guard-setup";
export const opencodeAdapterSkill = "security-guard-setup";

export const openCodePortableSkills = Object.freeze(portableSkills.map((name) => (
  name === releaseInstallerSkill ? openCodeReleaseInstallerSkill : name
)));
