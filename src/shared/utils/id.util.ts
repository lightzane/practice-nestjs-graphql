const d = Date;
const m = Math;
const h = 16;
const x = (n: number) => m.floor(n).toString(h);
const u = (n: number) => ' '.repeat(n).replace(/./g, () => x(m.random() * h));

export class IDUtil {
    static get t() {
        return +new d(new d().toISOString()) / 1000;
    }

    static oid(): string {
        return `${x(this.t)}${u(h)}`;
    }

    static uuidv4(): string {
        return `${u(8)}-${u(4)}-${u(4)}-${u(4)}-${u(12)}`;
    }
}