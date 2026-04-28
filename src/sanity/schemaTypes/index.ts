import { type SchemaTypeDefinition } from 'sanity'
import {mediaAssetSchema} from '../../../sanity/schemas/mediaAsset'
import {workCardSchema} from '../../../sanity/schemas/workCard'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [mediaAssetSchema, workCardSchema],
}
