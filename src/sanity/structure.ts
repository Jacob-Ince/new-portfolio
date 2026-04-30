import type {StructureResolver} from 'sanity/structure'
import {orderableDocumentListDeskItem} from '@sanity/orderable-document-list'

export const structure: StructureResolver = (S, context) =>
  S.list()
    .title('Content')
    .items([
      orderableDocumentListDeskItem({
        type: 'mediaAsset',
        title: 'Media Assets',
        S,
        context,
      }),
      ...S.documentTypeListItems().filter(
        (listItem) => !['mediaAsset'].includes(listItem.getId())
      ),
    ])
