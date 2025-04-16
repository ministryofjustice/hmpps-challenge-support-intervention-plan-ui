/* eslint-disable no-param-reassign */
export const mergeObjects = <T extends Record<string, unknown>>(destination: T, source: Partial<T>) => {
  Object.entries(source).forEach(([key, value]) => {
    if (typeof value === 'object' && !Array.isArray(value)) {
      if (!destination[key]) {
        // @ts-expect-error set up object for future recursive writes
        destination[key] = {}
      }
      mergeObjects(destination[key] as Record<string, unknown>, value)
    } else {
      // @ts-expect-error unexpected types
      destination[key] = value
    }
  })
}
