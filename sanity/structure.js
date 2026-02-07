import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list'

export const structure = (S, context) => {
  return S.list()
    .title('Content')
    .items([
      // Add the orderable document list for mediaAsset
      orderableDocumentListDeskItem({
        type: 'mediaAsset',
        title: 'Media Assets',
        S,
        context,
      }),
      // Add other document types here if needed
      ...S.documentTypeListItems().filter(
        (listItem) => !['mediaAsset'].includes(listItem.getId())
      ),
    ])
}

