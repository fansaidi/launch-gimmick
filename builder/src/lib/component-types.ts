export type FieldType = 'text' | 'number' | 'select' | 'boolean'

export interface ComponentField {
  key: string
  label: string
  type: FieldType
  default?: string | number | boolean
  options?: string[]
  min?: number
  max?: number
  step?: number
  required?: boolean
}

export type ComponentCategory = 'trigger' | 'media'

export interface ComponentMeta {
  type: string
  category: ComponentCategory
  label: string
  description: string
  fields: ComponentField[]
}

export interface FlowStep {
  id: string
  type: string
  config: Record<string, string | number | boolean | undefined>
}

export interface Flow {
  id: string
  name: string
  steps: FlowStep[]
  published: boolean
}
