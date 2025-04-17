import { schema as nSchema, denormalize, normalize, Schema } from 'normalizr';

export class Normalizer {
  private _schema: nSchema.Entity;
  private _listSchema: Schema;

  constructor(schema: nSchema.Entity) {
    this._schema = schema;
    this._listSchema = [schema];
  }

  public normalize = (item) => {
    if (Array.isArray(item)) {
      return this.normalizeMany(item);
    }
    return this.normalizeSingle(item);
  };

  public denormalize = (idOrIds: string | string[], state: any) => {
    if (Array.isArray(idOrIds)) {
      return this.denormalizeMany(idOrIds, state);
    }
    return this.denormalizeSingle(idOrIds, state);
  };

  private normalizeMany(items) {
    this.throwIfInvalid(items);
    const normalized = normalize(items, this._listSchema);
    return normalized;
  }

  private normalizeSingle(item) {
    this.throwIfInvalid([item]);
    const normalized = normalize(item, this._schema);
    return normalized;
  }

  private denormalizeSingle(id: string, state: any) {
    const denormalized = denormalize(id, this._schema, state.normalized);
    if (denormalized) {
      denormalized.__denormalized = true;
    }
    return denormalized;
  }

  private denormalizeMany(ids: string[], state: any) {
    const denormalizedList = denormalize(ids, this._listSchema, state.normalized);
    return denormalizedList.map((denormalized) => ({ ...(denormalized as any), __denormalized: true }));
  }

  private throwIfInvalid(items) {
    items.forEach((item) => {
      if (item.__denormalized) {
        console.error('Invalid item:', item);
        throw new Error(
          'Tried to normalize an object that was previously denormalized from the store. This can cause infinite loops.'
        );
      }
    });
  }
}
