import { type SchemaTypeDefinition } from 'sanity'
import {mediaAssetSchema} from '../../../sanity/schemas/mediaAsset'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [mediaAssetSchema],
}
