import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { validateReportFile } from "../skills/security/scripts/validate-report.mjs";

export { validateReport, validateReportFile } from "../skills/security/scripts/validate-report.mjs";

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (!process.argv[2]) {
    process.stderr.write("Usage: node scripts/validate-report.mjs <findings.json>\n");
    process.exit(1);
  }
  process.exit(validateReportFile(process.argv[2]));
}
