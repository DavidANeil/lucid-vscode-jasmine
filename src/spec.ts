import { Range , TextDocument} from "vscode";

export class Spec {
    constructor(
        public filePath: string,
        public specFilter: string|undefined,
        public range: Range,
        public document: TextDocument,
    ) {
        if (this.specFilter) {
            this.specFilter = this.specFilter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }
    }
}