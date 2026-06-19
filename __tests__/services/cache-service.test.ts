import { CacheService } from "../../services/cache/cache-service"
import { describe, beforeEach, test, expect, jest } from "@jest/globals"

describe("CacheService", () => {
  let cacheService: CacheService

  beforeEach(() => {
    cacheService = new CacheService(10, 5) // Short TTL for testing
  })

  test("should set and get values", () => {
    cacheService.set("test-key", "test-value")
    expect(cacheService.get("test-key")).toBe("test-value")
  })

  test("should return undefined for non-existent keys", () => {
    expect(cacheService.get("non-existent")).toBeUndefined()
  })

  test("should delete values", () => {
    cacheService.set("test-key", "test-value")
    expect(cacheService.get("test-key")).toBe("test-value")

    cacheService.delete("test-key")
    expect(cacheService.get("test-key")).toBeUndefined()
  })

  test("should clear all values", () => {
    cacheService.set("key1", "value1")
    cacheService.set("key2", "value2")

    cacheService.clear()

    expect(cacheService.get("key1")).toBeUndefined()
    expect(cacheService.get("key2")).toBeUndefined()
  })

  test("should delete by pattern", () => {
    cacheService.set("test:1", "value1")
    cacheService.set("test:2", "value2")
    cacheService.set("other:1", "value3")

    cacheService.deleteByPattern("test:*")

    expect(cacheService.get("test:1")).toBeUndefined()
    expect(cacheService.get("test:2")).toBeUndefined()
    expect(cacheService.get("other:1")).toBe("value3")
  })

  test("should get or set values", async () => {
    const getValue = jest.fn().mockResolvedValue("computed-value")

    // First call should compute the value
    const value1 = await cacheService.getOrSet("test-key", getValue)
    expect(value1).toBe("computed-value")
    expect(getValue).toHaveBeenCalledTimes(1)

    // Second call should use the cached value
    const value2 = await cacheService.getOrSet("test-key", getValue)
    expect(value2).toBe("computed-value")
    expect(getValue).toHaveBeenCalledTimes(1) // Still called only once
  })
})

