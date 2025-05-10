import { clientCache } from '../../utils/cacheUtils';

describe('Client Cache Performance Tests', () => {
  beforeEach(() => {
    clientCache.clear();
  });

  test('cache get/set operations should be fast', () => {
    const iterations = 1000;
    const testData = { id: '123', name: 'Test Item', value: 'Some test value' };
    
    // Measure set operations
    const startSet = performance.now();
    for (let i = 0; i < iterations; i++) {
      clientCache.set(`test_key_${i}`, testData, 5);
    }
    const endSet = performance.now();
    const setTime = endSet - startSet;
    
    console.log(`Time to set ${iterations} items: ${setTime}ms (${setTime / iterations}ms per item)`);
    
    // Measure get operations
    const startGet = performance.now();
    for (let i = 0; i < iterations; i++) {
      clientCache.get(`test_key_${i}`);
    }
    const endGet = performance.now();
    const getTime = endGet - startGet;
    
    console.log(`Time to get ${iterations} items: ${getTime}ms (${getTime / iterations}ms per item)`);
    
    // Assert that operations are fast enough
    expect(setTime / iterations).toBeLessThan(0.1); // Less than 0.1ms per set operation
    expect(getTime / iterations).toBeLessThan(0.05); // Less than 0.05ms per get operation
  });

  test('cache should handle large data sets efficiently', () => {
    // Create a large data set
    const largeData = Array.from({ length: 1000 }, (_, i) => ({
      id: `item_${i}`,
      name: `Test Item ${i}`,
      description: `This is a test description for item ${i}. It contains some text to make it larger.`,
      price: Math.random() * 100,
      createdAt: new Date().toISOString(),
      tags: Array.from({ length: 5 }, (_, j) => `tag_${j}`)
    }));
    
    // Measure time to cache large data
    const startSet = performance.now();
    clientCache.set('large_data_key', largeData, 5);
    const endSet = performance.now();
    const setTime = endSet - startSet;
    
    console.log(`Time to cache large data set: ${setTime}ms`);
    
    // Measure time to retrieve large data
    const startGet = performance.now();
    const retrievedData = clientCache.get('large_data_key');
    const endGet = performance.now();
    const getTime = endGet - startGet;
    
    console.log(`Time to retrieve large data set: ${getTime}ms`);
    
    // Assert that operations are fast enough
    expect(setTime).toBeLessThan(10); // Less than 10ms to cache large data
    expect(getTime).toBeLessThan(5); // Less than 5ms to retrieve large data
    expect(retrievedData).toEqual(largeData);
  });

  test('cache should efficiently handle prefix-based operations', () => {
    const prefixCount = 10;
    const itemsPerPrefix = 100;
    
    // Set up cache with prefixed items
    for (let p = 0; p < prefixCount; p++) {
      for (let i = 0; i < itemsPerPrefix; i++) {
        clientCache.set(`prefix_${p}_item_${i}`, { value: `Value ${p}-${i}` }, 5);
      }
    }
    
    // Measure time to clear by prefix
    const startClear = performance.now();
    clientCache.clearByPrefix('prefix_5_');
    const endClear = performance.now();
    const clearTime = endClear - startClear;
    
    console.log(`Time to clear items by prefix: ${clearTime}ms`);
    
    // Assert that operation is fast enough
    expect(clearTime).toBeLessThan(50); // Less than 50ms to clear by prefix
    
    // Verify that only the correct items were cleared
    for (let p = 0; p < prefixCount; p++) {
      for (let i = 0; i < itemsPerPrefix; i++) {
        const key = `prefix_${p}_item_${i}`;
        const value = clientCache.get(key);
        
        if (p === 5) {
          expect(value).toBeNull(); // Items with prefix_5_ should be cleared
        } else {
          expect(value).not.toBeNull(); // Other items should still exist
        }
      }
    }
  });
});
