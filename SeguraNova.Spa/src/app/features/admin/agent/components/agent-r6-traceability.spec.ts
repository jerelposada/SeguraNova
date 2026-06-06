import { GapAnalysisComponent } from './gap-analysis.component';
import { HistorialConversacionesComponent } from './historial-conversaciones.component';
import { RetrievalEffortComponent } from './retrieval-effort.component';
import { SemanticCacheConfigComponent } from './semantic-cache-config.component';
import { AdminAgentShellComponent } from '../../pages/admin-agent-shell.component';

type CompiledComponentMetadata = {
  styles: string[];
  template: () => unknown;
};

function getCompiledMetadata(component: unknown): CompiledComponentMetadata {
  return (component as { ɵcmp: CompiledComponentMetadata }).ɵcmp;
}

function getTemplateInstructions(component: unknown): string {
  const metadata = getCompiledMetadata(component);
  return metadata.template.toString();
}

function getStyles(component: unknown): string {
  const metadata = getCompiledMetadata(component);
  return metadata.styles.join('\n');
}

function hasRepeaterInstruction(templateInstructions: string): boolean {
  return /repeater/i.test(templateInstructions);
}

function hasConditionalInstruction(templateInstructions: string): boolean {
  return /conditional/i.test(templateInstructions);
}

describe('Admin agent slice R6 traceability', () => {
  it('should use Angular modern control flow instructions in dynamic agent templates', () => {
    const historialTemplate = getTemplateInstructions(HistorialConversacionesComponent);
    const gapTemplate = getTemplateInstructions(GapAnalysisComponent);
    const retrievalTemplate = getTemplateInstructions(RetrievalEffortComponent);

    const hasModernControlFlow =
      hasRepeaterInstruction(historialTemplate) &&
      hasConditionalInstruction(historialTemplate) &&
      hasRepeaterInstruction(gapTemplate) &&
      hasRepeaterInstruction(retrievalTemplate);

    expect(hasModernControlFlow).toBeTrue();
  });

  it('should keep admin agent styles tied to global design tokens for palette and typography', () => {
    const aggregatedStyles = [
      getStyles(AdminAgentShellComponent),
      getStyles(HistorialConversacionesComponent),
      getStyles(GapAnalysisComponent),
      getStyles(SemanticCacheConfigComponent),
      getStyles(RetrievalEffortComponent),
    ].join('\n');

    const usesGlobalTokens =
      aggregatedStyles.includes('var(--clr-') &&
      aggregatedStyles.includes('var(--fs-') &&
      !/#[0-9a-f]{3,8}|rgb\(|hsl\(/i.test(aggregatedStyles) &&
      !/font-family\s*:/i.test(aggregatedStyles);

    expect(usesGlobalTokens).toBeTrue();
  });
});