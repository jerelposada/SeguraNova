import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

type KnowledgeBaseVM = {
  id: string;
  nombre: string;
  estado: 'activo' | 'warning' | 'error';
  cobertura: string;
  indexacion: string;
};

@Component({
  selector: 'app-knowledge-bases',
  standalone: true,
  templateUrl: './knowledge-bases.component.html',
  styleUrl: './knowledge-bases.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KnowledgeBasesComponent {
  readonly knowledgeBases = signal<ReadonlyArray<KnowledgeBaseVM>>([
    {
      id: 'kb-polizas',
      nombre: 'Polizas',
      estado: 'activo',
      cobertura: '98%',
      indexacion: 'Sincronizada',
    },
    {
      id: 'kb-siniestros',
      nombre: 'Siniestros',
      estado: 'warning',
      cobertura: '84%',
      indexacion: 'Reindexacion parcial',
    },
    {
      id: 'kb-legal',
      nombre: 'Legal',
      estado: 'error',
      cobertura: '63%',
      indexacion: 'Fallo de parser',
    },
  ]);
  readonly estadoFiltro = signal<'todos' | 'activo' | 'warning' | 'error'>('todos');
  readonly estados = signal<ReadonlyArray<'todos' | 'activo' | 'warning' | 'error'>>([
    'todos',
    'activo',
    'warning',
    'error',
  ]);
  readonly filteredKnowledgeBases = computed(() => {
    const activeStatus = this.estadoFiltro();
    if (activeStatus === 'todos') {
      return this.knowledgeBases();
    }

    return this.knowledgeBases().filter((knowledgeBase) => knowledgeBase.estado === activeStatus);
  });

  selectEstado(estado: 'todos' | 'activo' | 'warning' | 'error'): void {
    this.estadoFiltro.set(estado);
  }
}