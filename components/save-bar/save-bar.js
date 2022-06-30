import { ContextualSaveBar, Frame } from "@shopify/polaris"

const SaveBar = () => {
  return (
    <Frame>
      <ContextualSaveBar
        message="Unsaved changes"
        saveAction={{
          onAction: () => console.log('add form submit logic'),
          loading: false,
          disabled: false,
        }}
        discardAction={{
          onAction: () => console.log('add clear form logic'),
        }} />
    </Frame>
  )
}

export default SaveBar


