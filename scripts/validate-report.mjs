import { runReportCli } from "../skills/security/scripts/validate-report.mjs";

export { validateReport, validateReportFile } from "../skills/security/scripts/validate-report.mjs";

runReportCli(import.meta.url, "scripts/validate-report.mjs");
