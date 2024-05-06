export type Datum = {
  Year: number;
  Title: string;
  DOI: string;
  InternalReferences: string;
  CitationsByYear: number[];
  'AuthorNames-Deduped': string;
  emb_pos: [number, number];
};

export type Paper = {
  id: string;
  title: string;
  year: number;
  references: string[];
  numCitations: number[];
  authors: string[];
  x: number;
  y: number;
};

export class PaperDataset {
  data: { [key: string]: Paper };
  forwardCitations: { [key: string]: string[] };

  constructor(data: Datum[]) {
    this.data = Object.fromEntries(
      data.map((d) => [
        d.DOI,
        {
          id: d.DOI,
          title: d.Title,
          year: d.Year,
          authors: d['AuthorNames-Deduped'].split(';'),
          references: d.InternalReferences.split(';'),
          numCitations: d.CitationsByYear,
          x: d.emb_pos[0],
          y: d.emb_pos[1],
        },
      ])
    );
    this.forwardCitations = {};
    Object.values(this.data).forEach((d) => {
      d.references.forEach((r) => {
        if (!!this.forwardCitations[r]) this.forwardCitations[r].push(d.id);
        else this.forwardCitations[r] = [d.id];
      });
    });
  }

  getForwardCitationPaths(
    ids: string[],
    recursive: boolean = true,
    foundPapers: { [key: string]: string } | null = null
  ): { [key: string]: string } {
    if (foundPapers == null)
      foundPapers = Object.fromEntries(ids.map((id) => [id, id]));

    let newPapers: Set<string> = new Set();
    for (let id of ids) {
      (this.forwardCitations[id] ?? []).forEach((r) => {
        if (!foundPapers![r]) {
          foundPapers![r] = id;
          newPapers.add(r);
        }
      });
    }
    if (recursive && newPapers.size > 0) {
      return this.getForwardCitationPaths(
        Array.from(newPapers),
        true,
        foundPapers
      );
    }
    return foundPapers;
  }

  getForwardCitations(
    ids: string[],
    recursive: boolean = true,
    foundPapers: Set<string> | null = null
  ): string[] {
    if (foundPapers == null) foundPapers = new Set(ids);
    console.log('papers', ids);
    let forwardCites = Array.from(
      new Set(ids.map((id) => this.forwardCitations[id] ?? []).flat())
    );
    let newCites = forwardCites.filter((p) => !foundPapers!.has(p));
    if (recursive && newCites.length > 0) {
      return Array.from(
        new Set([
          ...forwardCites,
          ...this.getForwardCitations(
            newCites,
            true,
            new Set([...foundPapers, ...newCites])
          ),
        ])
      );
    }
    return forwardCites;
  }

  getPapers(): Paper[] {
    return Object.values(this.data);
  }
}
